import { WUPIMessageResponse } from "@interfaces/rewards-per-epoch";
import { getEligibleWupiNFNodes, getNfNodeMultiplier } from "@services/nfnodes/nfnode.service";
import { RewardSystemManager } from "@services/solana/reward-system/reward-system.manager";
import { ConsumeMessage } from "amqplib";
import { createRewardsPerEpoch } from "../queries";
import { getPoolPerEpochByEpoch } from "@services/pool-per-epoch/pool-per-epoch.service";
import { messageBatchTracker } from "@services/rabbitmq-wrapper/messages-batch-tracker.service";
import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";
import moment from "moment";

export const processWupiRabbitResponse = async (msg: ConsumeMessage) => {
    const currentTime = Date.now();

    const startTime = Date.now();
    const timeMarks: { [key: string]: number } = {};

    try {
        const beforeParsing = Date.now();
        const { nas_id, nfnode_id, epoch, total_valid_nas, score } = JSON.parse(msg.content.toString()) as WUPIMessageResponse;
        timeMarks.parsing = Date.now() - beforeParsing;

        if (!nas_id || !nfnode_id || !epoch || typeof total_valid_nas !== 'number') {
            console.error('invalid WUPI message');
            return;
        }

        // Get instance of reward system program
        const beforeRewardSystem = Date.now();
        const rewardSystemProgram = await RewardSystemManager.getInstance();
        timeMarks.rewardSystemInit = Date.now() - beforeRewardSystem;

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
        const beforeScoreCalc = Date.now();
        const scoreInGb = Number(BigInt(score)) / 1000000000;
        timeMarks.scoreCalculation = Date.now() - beforeScoreCalc;

        // Create rewards
        const beforeRewards = Date.now();
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
        timeMarks.rewardsCreation = Date.now() - beforeRewards;

        if (!rewards) {
            console.error('error creating rewards per epoch');
            return;
        }

        // Track message
        const beforeTracking = Date.now();
        const { isLastMessage } = messageBatchTracker.trackMessage(moment(epoch).format('YYYY-MM-DD'));
        timeMarks.messageTracking = Date.now() - beforeTracking;

        if (isLastMessage) {
            eventHub.emit(EventName.LAST_REWARD_CREATED, {
                epochId: epochDocument.id,
                type: 'wUPI'
            });
        }

        timeMarks.total = Date.now() - startTime;
    } catch (error) {
        console.error('🚨 Error processing WUPI rabbit response:', error);
        return;
    }
};