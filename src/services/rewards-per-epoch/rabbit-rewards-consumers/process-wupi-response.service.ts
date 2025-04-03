import { WUPIMessageResponse } from "@interfaces/rewards-per-epoch";
import { getEligibleWupiNFNodes, getNfNodeMultiplier } from "@services/nfnodes/nfnode.service";
import { RewardSystemManager } from "@services/solana/reward-system/reward-system.manager";
import { ConsumeMessage } from "amqplib";
import { createRewardsPerEpoch } from "../queries";
import { getPoolPerEpochByEpoch } from "@services/pool-per-epoch/pool-per-epoch.service";
import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";
import { poolMessageTracker } from "@services/pool-per-epoch/pool-messages-tracker.service";

export const processWupiRabbitResponse = async (msg: ConsumeMessage) => {
    try {
        const { nas_id, nfnode_id, epoch, total_valid_nas, score } = JSON.parse(msg.content.toString()) as WUPIMessageResponse;

        if (!nas_id || !nfnode_id || !epoch || typeof total_valid_nas !== 'number') {
            console.error('invalid WUPI message');
            return;
        }

        // Get instance of reward system program
        const rewardSystemProgram = await RewardSystemManager.getInstance();

        // Get eligible nfnode
        const {isEligible, nfnode} = await getEligibleWupiNFNodes(nfnode_id, rewardSystemProgram, false);

        // Calculate multiplier
        const multiplier = isEligible ? getNfNodeMultiplier(nfnode) : 0;

        // Get epoch document
        const epochDocument = await getPoolPerEpochByEpoch(epoch);

        if (!epochDocument) {
            console.error('epoch not found');
            return;
        }

        // Calculate score
        const scoreInGb = Number(BigInt(score)) / 1000000000;

        // Create rewards
        const rewards = await createRewardsPerEpoch({
            hotspot_score: Number((scoreInGb > 0 ? scoreInGb * multiplier : 0).toFixed(6)),
            nfnode: nfnode_id,
            pool_per_epoch: epochDocument.id,
            status: 'calculating',
            type: 'wUPI',
            amount: 0,
            currency: 'WAYRU',
            owner_payment_status: 'pending',
            host_payment_status: 'pending',
        });

        if (!rewards) {
            console.error('error creating rewards per epoch');
            return;
        }

        // Track message
        const { isLastMessage } = await poolMessageTracker.trackMessage(epochDocument.id, 'wupi');

        // update the pool per epoch
       if (isLastMessage) {
            eventHub.emit(EventName.LAST_REWARD_CREATED, {
                epochId: epochDocument.id,
                type: 'wUPI'
            });
        }
    } catch (error) {
        console.error('🚨 Error processing WUPI rabbit response:', error);
        return;
    }
};