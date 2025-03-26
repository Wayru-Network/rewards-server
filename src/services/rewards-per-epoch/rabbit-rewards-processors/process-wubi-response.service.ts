import { getNfNodeByWayruDeviceId, getNfNodeMultiplier } from "@services/nfnodes/queries";
import { ConsumeMessage } from "amqplib";
import { createRewardsPerEpoch } from "../queries";
import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";


export const processWubiRabbitResponse = async (msg: ConsumeMessage) => {
    try { 
    console.log('****** new consume response ******');
    const { hotspot_score, wayru_device_id, epoch_id, last_item } = JSON.parse(msg.content.toString()) as {
        hotspot_score: number;
        wayru_device_id: string;
        epoch_id: number;
        last_item: boolean;
    }
    console.log('hotspot_score', hotspot_score)
    console.log('wayru_device_id', wayru_device_id)
    console.log('epoch_id', epoch_id)
    console.log('last_item', last_item)
    if (typeof hotspot_score !== 'number' || !wayru_device_id || !epoch_id || !last_item) {
        console.error('invalid message')
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
        eventHub.emit(EventName.BEFORE_ASSIGN_REWARDS, {
            epochId: epoch_id,
            type: 'last_item_wubi'
        })
    }
    } catch (error) {
        console.error('🚨 error processing rabbit response', error)
        return
    }
}