import { getNfNodeByWayruDeviceId, getNfNodeMultiplier } from "@services/nfnodes/queries";
import { ConsumeMessage } from "amqplib";
import { createRewardsPerEpoch } from "../queries";
import { eventHub } from "@services/events/event-hub";


export const processRabbitResponse = async (msg: ConsumeMessage) => {
    try { 
    console.log('****** new consume response ******');
    const { hotspot_score, wayru_device_id, epoch_id, last_item } = JSON.parse(msg.content.toString())
    console.log('hotspot_score', hotspot_score)
    console.log('wayru_device_id', wayru_device_id)
    console.log('epoch_id', epoch_id)
    console.log('last_item', last_item)
    if (!hotspot_score || !wayru_device_id || !epoch_id || !last_item) {
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
        // emit a event hub 
        //eventHub.emit('')
    }
    } catch (error) {
        console.error('error processing rabbit response', error)
        return
    }
}