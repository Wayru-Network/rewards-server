import { getEligibleWubiNFNodes, getNfNodeMultiplier } from "@services/nfnodes/nfnode.service";
import { ConsumeMessage } from "amqplib";
import { createRewardsPerEpoch } from "../queries";
import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";
import { WubiMessage } from "@interfaces/rabbitmq-wrapper";
import { RewardSystemManager } from "@services/solana/reward-system/reward-system.manager";
import { poolMessageTracker } from "@services/pool-per-epoch/pool-messages-tracker.service";
import { poolPerEpochInstance } from "@services/pool-per-epoch/pool-per-epoch-instance.service";

export const processWubiRabbitResponse = async (msg: ConsumeMessage) => {
    try {
        const message = JSON.parse(msg.content.toString());

        const { hotspot_score, wayru_device_id, epoch_id, last_item } = message as WubiMessage;
        // Validation of the message
        if (!wayru_device_id || !epoch_id || typeof last_item !== 'boolean') {
            console.error('invalid Wubi message');
            console.log(' hotspot_score', hotspot_score);
            console.log(' wayru_device_id', wayru_device_id);
            console.log(' epoch_id', epoch_id);
            console.log(' last_item', last_item);
            throw new Error('invalid Wubi message'); // throw error to be handled by the wrapper
        }

        // Get instance of RewardSystem
        const rewardSystemProgram = await RewardSystemManager.getInstance();

        // Check eligibility
        const { isEligible, nfnode } = await getEligibleWubiNFNodes(wayru_device_id, rewardSystemProgram);

        // validate epoch id 
        const epochDocument = await poolPerEpochInstance.getById(epoch_id);

        if (!epochDocument) {
            console.error('epoch not found');
            return
        }

        const multiplier = isEligible ? getNfNodeMultiplier(nfnode) : 0;

        // Create rewards
        const reward = await createRewardsPerEpoch({
            hotspot_score: (hotspot_score ?? 0) * multiplier,
            nfnode: nfnode.id,
            pool_per_epoch: epochDocument.id,
            status: 'calculating',
            type: 'wUBI',
            amount: 0,
            currency: 'WAYRU',
            owner_payment_status: 'pending',
            host_payment_status: 'pending',
        });

        if (!reward) {
            console.error('error creating rewards per epoch');
            throw new Error('error creating rewards per epoch');
        }

        // Track message with the reward id
        const { isLastMessage } = await poolMessageTracker.trackMessage(
            epochDocument?.id, 
            'wubi',
            reward.id
        );

        // update the pool per epoch
        if (isLastMessage) {
            eventHub.emit(EventName.LAST_REWARD_CREATED, {
                epochId: epochDocument?.id,
                type: 'wUBI'
            });
        }

    } catch (error) {
        console.error('🚨 error processing WUBI rabbit response', error);
        throw error; // Re-throw the error to be handled by the wrapper
    }
};