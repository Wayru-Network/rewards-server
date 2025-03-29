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
    try {
        const { nas_id, nfnode_id, epoch, total_valid_nas, score } = JSON.parse(msg.content.toString()) as WUPIMessageResponse

        if (        
            !nas_id ||
            !nfnode_id ||
            !epoch ||
            typeof total_valid_nas !== 'number'
        ) {
            console.error('invalid WUPI message')
            return
        }
        // get instance of reward system program
        const rewardSystemProgram = await RewardSystemManager.getInstance()

        const validateEntry = false // TODO: remove this, it's for testing purposes
        // get eligible nfnode
        const {isEligible, nfnode} = await getEligibleWupiNFNodes(nfnode_id, rewardSystemProgram, validateEntry)
        // the reward multiplier is 0 if the nfnode is not eligible
        const multiplier = isEligible ? getNfNodeMultiplier(nfnode) : 0
        // get epoch by date
        const epochDocument = await getPoolPerEpochByEpoch(epoch)
        if (!epochDocument) {
            console.error('epoch not found')
            return
        }
        // score in gb
        const scoreInGb = Number(BigInt(score)) / 1000000000;
        // create rewards per epoch
        const rewards = await createRewardsPerEpoch({
            hotspot_score: Number((scoreInGb > 0 ? scoreInGb * multiplier : 0 ).toFixed(6)),
            nfnode: nfnode_id,
            pool_per_epoch: epochDocument.id,
            status: 'calculating',
            type: 'wUPI',
            amount: 0,
            currency: 'WAYRU',
            owner_payment_status: 'pending',
            host_payment_status: 'pending',
        })
        if (!rewards) {
            console.error('error creating rewards per epoch')
            return
        }

        // track message
        const { isLastMessage } = messageBatchTracker.trackMessage(moment(epoch).format('YYYY-MM-DD'));
        if (isLastMessage) {
            // emit a event hub, when it is received, 
            // it will initiate to calculate amount of rewards
            eventHub.emit(EventName.LAST_REWARD_CREATED, {
                epochId: epochDocument.id,
                type: 'wUPI'
            })
            // this event will trigger the network score calculator to calculate the rewards:
            //go to: () => src/services/events/timer-service/timer.service.ts
        }
    } catch (error) {
        console.error('🚨 Error processing WUPI rabbit response:', error);
        return
    }
}