import { getEligibleWubiNFNodes, getNfNodeMultiplier } from "@services/nfnodes/nfnode.service";
import { ConsumeMessage } from "amqplib";
import { createRewardsPerEpoch } from "../queries";
import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";
import { WubiMessage } from "@interfaces/rabbitmq-wrapper";
import { RewardSystemManager } from "@services/solana/reward-system/reward-system.manager";
import { messageBatchTracker } from "@services/rabbitmq-wrapper/messages-batch-tracker.service";


export const processWubiRabbitResponse = async (msg: ConsumeMessage) => {    
    try {
        const message = JSON.parse(msg.content.toString());

        const { hotspot_score, wayru_device_id, epoch_id, last_item } = message as WubiMessage;
        
        // Validation of the message
        if (typeof hotspot_score !== 'number' || !wayru_device_id || !epoch_id || typeof last_item !== 'boolean') {
            console.error('invalid Wubi message');
            return;
        }

        // Get instance of RewardSystem
        const rewardSystemProgram = await RewardSystemManager.getInstance();

        // Check eligibility
        const {isEligible, nfnode} = await getEligibleWubiNFNodes(wayru_device_id, rewardSystemProgram, false);

        // Calculate multiplier
        const multiplier = isEligible ? getNfNodeMultiplier(nfnode) : 0;

        // Create rewards
        const rewards = await createRewardsPerEpoch({
            hotspot_score: hotspot_score * multiplier,
            nfnode: nfnode.id,
            pool_per_epoch: epoch_id,
            status: 'calculating',
            type: 'wUBI',
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
        const { isLastMessage } = messageBatchTracker.trackMessage(epoch_id.toString());

        if (isLastMessage) {
            eventHub.emit(EventName.LAST_REWARD_CREATED, {
                epochId: epoch_id,
                type: 'wUBI'
            });
        }
    } catch (error) {
        console.error('🚨 error processing rabbit response', error);
        return;
    }
};