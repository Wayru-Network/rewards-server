import { POOL_PER_EPOCH_RETRY_MAX_ATTEMPTS } from "@constants";
import { AnalyzePoolStatus, PoolPerEpoch } from "@interfaces/pool-per-epoch";
import { getActiveWubiNfNodes, getActiveWupiNfNodes } from "@services/nfnodes/queries";
import { getPoolToRetry, updatePoolPerEpochById } from "@services/pool-per-epoch/queries"
import { processWUBIWithConcurrency, processWUPIWithConcurrency } from "./rabbit-rewards-messages/initiate-rewards-processing.service";

/**
 * Process rewards after error
 * function executed by cron job every 2 minutes
 * @returns void
 */
export const processRewardsAfterError = async () => {
    const pool = await getPoolToRetry()
    if (!pool) return
    console.log('pool to retry', pool)

    const { needsRetry, type } = analyzePoolStatus(pool)
    if (!needsRetry) return
    console.log('needsRetry', needsRetry)
    console.log('type', type)

    switch (type) {
        case 'send_wupi_messages':
            await updatePoolPerEpochById(pool.id, {
                wupi_retry_count: Number(pool.wupi_retry_count || 0) + 1,
                is_retrying: true
            })
            await retryToSendWupiMessages(pool)
            break
        case 'send_wubi_messages':
            await updatePoolPerEpochById(pool.id, {
                wubi_retry_count: Number(pool.wubi_retry_count || 0) + 1,
                is_retrying: true
            })
            await retryToSendWubiMessages(pool)
            break
        default:
            console.log('no type found')
            break
    }
}

/**
 * Analyze pool status
 * @param pool - PoolPerEpoch
 * @returns AnalyzePoolStatus
 */
export const analyzePoolStatus = (pool: PoolPerEpoch): AnalyzePoolStatus => {
    try {
        // counts of retries
        const wubiRetryCount = pool.wubi_retry_count || 0
        const wupiRetryCount = pool.wupi_retry_count || 0

        // check if needs retry
        const wubiNeedsRetry = pool.wubi_processing_status === 'messages_not_sent' && 
                              wubiRetryCount < POOL_PER_EPOCH_RETRY_MAX_ATTEMPTS;
        const wupiNeedsRetry = pool.wupi_processing_status === 'messages_not_sent' && 
                              wupiRetryCount < POOL_PER_EPOCH_RETRY_MAX_ATTEMPTS;

        switch (true) {
            case wubiNeedsRetry:
                return {
                    needsRetry: true,
                    type: 'send_wubi_messages'
                }
            case wupiNeedsRetry:
                return {
                    needsRetry: true,
                    type: 'send_wupi_messages'
                }
            default:
                return {
                    needsRetry: false,
                    type: undefined
                }
        }
    } catch (error) {
        console.error(`Error analyzing pool ${pool.id} status:`, error);
        throw error;
    }
};

/**
 * Retry to send wubi messages
 * @param pool - PoolPerEpoch
 * @returns void
 */
export const retryToSendWupiMessages = async (pool: PoolPerEpoch) => {
    const wupiNFNodes = await getActiveWupiNfNodes()
    // process wupi nfnodes with concurrency
    await processWUPIWithConcurrency(wupiNFNodes, pool)
}


/**
 * Retry to send wubi messages
 * @param pool - PoolPerEpoch
 * @returns void
 */
export const retryToSendWubiMessages = async (pool: PoolPerEpoch) => {
    const wubiNFNodes = await getActiveWubiNfNodes()
    // process wubi nfnodes with concurrency
    await processWUBIWithConcurrency(wubiNFNodes, pool)
}