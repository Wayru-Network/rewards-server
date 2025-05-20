import { WUPIMessageResponse } from "@interfaces/rewards-per-epoch";
import { getEligibleWupiNFNodes, getNfNodeMultiplier } from "@services/nfnodes/nfnode.service";
import { RewardSystemManager } from "@services/solana/reward-system/reward-system.manager";
import { ConsumeMessage } from "amqplib";
import { createRewardsPerEpoch } from "../queries";
import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";
import { poolMessageTracker } from "@services/pool-per-epoch/pool-messages-tracker.service";
import { poolPerEpochInstance } from "@services/pool-per-epoch/pool-per-epoch-instance.service";
import { getBoostStakeMultiplier } from "@services/solana/boost-stake/boost-stake.service";

export const processWupiRabbitResponse = async (msg: ConsumeMessage) => {
    try {
        const { nas_id, nfnode_id, epoch, total_valid_nas, score } = JSON.parse(msg.content.toString()) as WUPIMessageResponse;

        if (!nas_id || !nfnode_id || !epoch || typeof total_valid_nas !== 'number') {
            console.error('invalid WUPI message');
            console.log(' nas_id', nas_id);
            console.log(' nfnode_id', nfnode_id);
            console.log(' epoch', epoch);
            console.log(' total_valid_nas', total_valid_nas);
            console.log(' score', score);
        }

        // Get instance of reward system program
        const rewardSystemProgram = await RewardSystemManager.getInstance();

        // Get eligible nfnode
        const { isEligible, nfnode } = await getEligibleWupiNFNodes(nfnode_id, rewardSystemProgram);

        // Get epoch document
        const epochDocument = await poolPerEpochInstance.getByEpoch(epoch);
        if (!epochDocument) {
            console.error('epoch not found');
            return
        }

        // Calculate multiplier
        const multiplier = getNfNodeMultiplier(nfnode)
        // get boost stake multiplier
        const boostStakeMultiplier = await getBoostStakeMultiplier(nfnode.solana_asset_id)

        // calculate final multiplier
        const finalMultiplier = multiplier * boostStakeMultiplier

        // Calculate score
        const scoreInGb = Number(BigInt(score)) / 1000000000;
        const hotspot_score = Number((scoreInGb > 0 ? scoreInGb * finalMultiplier : 0).toFixed(6))
        // Create rewards if eligible and hotspot score is greater than 0
        // because we don't need to create rewards with a 0 hotspot score
        if (isEligible && hotspot_score > 0) {
            // Create rewards
            const reward = await createRewardsPerEpoch({
                hotspot_score,
                nfnode: nfnode_id,
                pool_per_epoch: epochDocument.id,
                status: 'calculating',
                type: 'wUPI',
                amount: 0,
                currency: 'WAYRU',
                owner_payment_status: 'pending',
                host_payment_status: 'pending',
            });

            if (!reward) {
                console.error('error creating rewards per epoch');
                throw new Error('error creating rewards per epoch'); // throw error to be handled by the wrapper
            }
        }

        // Track message
        const { isLastMessage } = await poolMessageTracker.trackMessage(epochDocument.id, 'wupi', nfnode_id);

        // update the pool per epoch
        if (isLastMessage) {
            eventHub.emit(EventName.LAST_REWARD_CREATED, {
                epochId: epochDocument.id,
                type: 'wUPI'
            });
        }
    } catch (error) {
        console.error('🚨 Error processing WUPI rabbit response:', error);
        throw error; // throw error to be handled by the wrapper
    }
};