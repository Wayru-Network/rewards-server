import { WUPIMessageResponse } from "@interfaces/rewards-per-epoch";
import { RewardSystemManager } from "@services/solana/reward-system/reward-system.manager";
import { getNFNodeEntry } from "@services/solana/reward-system/reward-system.service";
import { ConsumeMessage } from "amqplib";

export const processWupiRabbitResponse = async (msg: ConsumeMessage) => {
    try {
        const { nas_id, nfnode_id, epoch, total_valid_nas } = JSON.parse(msg.content.toString()) as WUPIMessageResponse

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
        // create a function to get nfnode by id
        // const nfnode = await getNFNodeById(nfnode_id)
        // then get the nfnode entry
        // const nfnodeEntry = await getNFNodeEntry(nfnode_id, rewardSystemProgram)

    } catch (error) {
        console.error('🚨 Error processing WUPI rabbit response:', error);
        return
    }
}