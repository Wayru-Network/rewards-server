import { getEligibleWubiNFNodes, getNfNodeMultiplier } from "@services/nfnodes/nfnode.service";
import { ConsumeMessage } from "amqplib";
import { createRewardsPerEpoch } from "../queries";
import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";
import { WubiMessage } from "@interfaces/rabbitmq-wrapper";
import { RewardSystemManager } from "@services/solana/reward-system/reward-system.manager";
import { messageBatchTracker } from "@services/rabbitmq-wrapper/messages-batch-tracker.service";

let lastMessageTime = Date.now(); // Global variable to track the last message

const SLOW_THRESHOLD = 15000; // 15 seconds

export const processWubiRabbitResponse = async (msg: ConsumeMessage) => {
    const currentTime = Date.now();
    const timeSinceLastMessage = currentTime - lastMessageTime;
    lastMessageTime = currentTime;
    
    const startTime = Date.now();
    const timeMarks: { [key: string]: number } = {};

    try {
        const beforeParsing = Date.now();
        const message = JSON.parse(msg.content.toString());
        timeMarks.parsing = Date.now() - beforeParsing;

        const { hotspot_score, wayru_device_id, epoch_id, last_item } = message as WubiMessage;
        
        // Validation of the message
        if (typeof hotspot_score !== 'number' || !wayru_device_id || !epoch_id || typeof last_item !== 'boolean') {
            console.error('invalid Wubi message');
            return;
        }

        // Get instance of RewardSystem
        const beforeRewardSystem = Date.now();
        const rewardSystemProgram = await RewardSystemManager.getInstance();
        timeMarks.rewardSystemInit = Date.now() - beforeRewardSystem;

        // Check eligibility
        const beforeEligibility = Date.now();
        const {isEligible, nfnode} = await getEligibleWubiNFNodes(wayru_device_id, rewardSystemProgram, false);
        timeMarks.eligibilityCheck = Date.now() - beforeEligibility;

        // Calculate multiplier
        const beforeMultiplier = Date.now();
        const multiplier = isEligible ? getNfNodeMultiplier(nfnode) : 0;
        timeMarks.multiplierCalc = Date.now() - beforeMultiplier;

        // Create rewards
        const beforeRewards = Date.now();
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
        timeMarks.rewardsCreation = Date.now() - beforeRewards;

        if (!rewards) {
            console.error('error creating rewards per epoch');
            return;
        }

        // Track message
        const beforeTracking = Date.now();
        const { isLastMessage } = messageBatchTracker.trackMessage(epoch_id.toString());
        timeMarks.messageTracking = Date.now() - beforeTracking;

        if (isLastMessage) {
            eventHub.emit(EventName.LAST_REWARD_CREATED, {
                epochId: epoch_id,
                type: 'wUBI'
            });
        }

        timeMarks.total = Date.now() - startTime;
        
        if (timeMarks.total > SLOW_THRESHOLD) {
            console.warn('⚠️ Slow wUBI message processing:', {
                messageId: msg.properties.correlationId,
                wayru_device_id,
                times: timeMarks,
                isEligible,
                messageTimings: {
                    receivedAt: new Date(currentTime).toISOString(),
                    timeSinceLastMessage: `${timeSinceLastMessage}ms`,
                    processingTime: `${timeMarks.total}ms`
                }
            });
        }
    } catch (error) {
        console.error('🚨 error processing rabbit response', error);
        return;
    }
};