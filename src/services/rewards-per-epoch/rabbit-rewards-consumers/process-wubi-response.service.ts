import { getNfNodeByWayruDeviceId, getNfNodeMultiplier } from "@services/nfnodes/queries";
import { ConsumeMessage } from "amqplib";
import { createRewardsPerEpoch } from "../queries";
import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";
import { WubiMessage } from "@interfaces/rabbitmq-wrapper";


export const processWubiRabbitResponse = async (msg: ConsumeMessage) => {
    try {
        const { hotspot_score, wayru_device_id, epoch_id, last_item } = JSON.parse(msg.content.toString()) as WubiMessage

        if (
            typeof hotspot_score !== 'number' ||
            !wayru_device_id ||
            !epoch_id ||
            typeof last_item !== 'boolean'
        ) {
            console.error('invalid Wubi message')
            return
        }
        const nfNode = await getNfNodeByWayruDeviceId(wayru_device_id)
        const multiplier = getNfNodeMultiplier(nfNode)
        // create rewards per epoch
        const rewards = await createRewardsPerEpoch({
            hotspot_score: hotspot_score * multiplier,
            nfnode: nfNode?.id,
            pool_per_epoch: epoch_id,
            status: 'calculating',
            type: 'wUBI',
            amount: 0,
            currency: 'WAYRU',
            owner_payment_status: 'pending',
            host_payment_status: 'pending',
        });
        if (!rewards) {
            console.error('error creating rewards per epoch')
            return
        }
        // check if last item is true
        if (last_item) {
            // emit a event hub, when it is received, 
            // it will initiate to calculate amount of rewards
            eventHub.emit(EventName.LAST_REWARD_CREATED, {
                epochId: epoch_id,
                type: 'wUBI'
            })
        }
    } catch (error) {
        console.error('🚨 error processing rabbit response', error)
        return
    }
}