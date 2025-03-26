import { ENV } from "@config/env/env";
import { BATCH_SIZE, CONCURRENCY_LIMIT, TIME_DELAY } from "@constants";
import { checkWupiSync } from "@helpers/rewards-per-epoch/rewards-per-epoch.helpers";
import { logProgress, processInChunks, withRetry } from "@helpers/rewards-per-epoch/rewards-per-epoch.helpers";
import { NFNodeIdAndWayruDeviceId } from "@interfaces/nfnodes";
import { PoolPerEpoch } from "@interfaces/pool-per-epoch";
import { getActiveWubiNfNodes, getActiveWupiNfNodes } from "@services/nfnodes/queries";
import { createCurrentPoolPerEpoch, getPoolPerEpochAmount, getPoolPerEpochById, getPoolPerEpochNumber, updatePoolPerEpochById } from "@services/pool-per-epoch/queries";
import { rabbitWrapper } from '@services/rabbitmq-wrapper/rabbitmq.service';
import moment from 'moment'

// function to initiate the rewards processing
export const initiateRewardsProcessing = async (poolId?: number):
    Promise<{ error: boolean, message?: string, epoch?: PoolPerEpoch }> => {
    try {
        // get the epoch
        let [epoch, wubiNFNodes, wupiNFNodes] = await Promise.all([
            poolId ? getPoolPerEpochById(poolId) : createCurrentPoolPerEpoch(),
            getActiveWubiNfNodes(),
            getActiveWupiNfNodes()
        ]);
        if (!epoch) {
            console.log('No epoch found, ending process');
            return { error: true, message: 'No epoch found' };
        }

        // get the epoch number & wayru earned
        const epochNumber = await getPoolPerEpochNumber(epoch.epoch)
        const wayruEarned = Number(getPoolPerEpochAmount(epochNumber)) / 1000000
        // TODO: we can sum here the wayruEarned into stats table () =>
        console.log('wayruEarned', wayruEarned)

        // if there aren't actives wubi or wupi nodes, we can return
        const totalNodes = wubiNFNodes.length + wupiNFNodes.length;
        if (totalNodes === 0) {
            console.log('No active nodes found, ending process');
            return { error: true, message: 'No active nodes found' };
        }
        console.log('wubi nfnodes:', wubiNFNodes.length)
        console.log('wupi nfnodes:', wupiNFNodes.length)

        // now update the pool if it has a score greater than 0
        const totalScore = epoch.network_score + epoch.network_score_upi
        if (totalScore > 0) {
            // assign again the epoch updated
            epoch = await updatePoolPerEpochById(epoch.id, {
                network_score: 0,
                network_score_upi: 0,
            })
            if (!epoch) {
                console.log('Error updating pool per epoch')
                return { error: true, message: 'Error updating pool per epoch' }
            }
        }

        // now process the nfnodes and calculate their scores
        processWUBIWithConcurrency(wubiNFNodes, epoch)
        //processWUPIWithConcurrency(wupiNFNodes, epoch)
        return { error: false, epoch: epoch }
    } catch (error) {
        console.error('error processing rewards per epoch', error)
        return { error: true, message: error as string }
    }
}

// process wubi nfnodes with concurrency
const processWUBIWithConcurrency = async (nfNodes: NFNodeIdAndWayruDeviceId[], poolPerEpoch: PoolPerEpoch) => {
    try {
        console.log(`Processing ${nfNodes.length} WUBI nfnodes with concurrency`);
        const chunks = processInChunks(nfNodes, BATCH_SIZE);

        for (const [chunkIndex, chunk] of chunks.entries()) {
            const semaphore = Array(CONCURRENCY_LIMIT).fill(Promise.resolve());
            const errors: Error[] = [];

            await Promise.all(
                chunk.map((nfNode, index) => {
                    const slot = index % CONCURRENCY_LIMIT;
                    return semaphore[slot] = semaphore[slot]
                        .then(async () => {
                            await new Promise(resolve => setTimeout(resolve, TIME_DELAY));
                            return withRetry(async () => {
                                const isLastItem = chunkIndex === chunks.length - 1 &&
                                    index === chunk.length - 1;

                                console.log('sending wubi message', ENV.RABBIT_QUEUES.WUBI_API_QUEUE)
                                const sentResult = await rabbitWrapper.sendMessage(
                                    {
                                        wayru_device_id: nfNode.wayru_device_id,
                                        timestamp: moment(poolPerEpoch.epoch).unix(),
                                        epoch_id: poolPerEpoch.id,
                                        last_item: isLastItem
                                    },
                                    ENV.RABBIT_QUEUES.WUBI_API_QUEUE
                                );

                                if (!sentResult) {
                                    throw new Error(`Failed to send message for NFNode ${nfNode.id}`);
                                }

                                console.log(`🚀 WUBI message sent for node ${nfNode.id}`);

                                // Only show the last item processed message after sending it successfully
                                if (isLastItem) {
                                    console.log('🌠 Last WUBI item processed successfully');
                                }
                            });
                        })
                        .catch((error: Error) => {
                            errors.push(error);
                            console.error(`🚨 Error processing WUBI NFNode ${nfNode.id}:`, error);
                        });
                })
            );

            // Progress log after each chunk
            const processedCount = (chunkIndex + 1) * BATCH_SIZE;
            logProgress(Math.min(processedCount, nfNodes.length), nfNodes.length, 'WUBI');

            if (errors.length > 0) {
                console.error(`Chunk ${chunkIndex + 1}/${chunks.length} completed with ${errors.length} errors`);
            }
        }

        console.log('✅ Finished processing all WUBI nfnodes');
    } catch (error) {
        console.error('🚨 Error in WUBI batch processing:', error);
        throw error;
    }
};

// process wupi nfnodes with concurrency
const processWUPIWithConcurrency = async (nfNodes: NFNodeIdAndWayruDeviceId[], epoch: PoolPerEpoch) => {
    try {
        console.log('Processing WUPI nfnodes with concurrency');
        const epochDate = moment(epoch.epoch).format('YYYY-MM-DD');
        console.log('Epoch date:', epochDate);

        const synced = await checkWupiSync(epochDate);
        if (!synced) {
            console.error('🚨 Connections backend is not ready; WUPI rewards will not be processed');
            return;
        }

        const chunks = processInChunks(nfNodes, BATCH_SIZE);

        for (const [chunkIndex, chunk] of chunks.entries()) {
            const semaphore = Array(CONCURRENCY_LIMIT).fill(Promise.resolve());

            await Promise.all(
                chunk.map((nfNode, index) => {
                    const slot = index % CONCURRENCY_LIMIT;
                    return semaphore[slot] = semaphore[slot]
                        .then(async () => {
                            try {
                                await new Promise((resolve) => setTimeout(resolve, TIME_DELAY));
                                
                                const isLastItem = chunkIndex === chunks.length - 1 &&
                                    index === chunk.length - 1;

                                const sentResult = await rabbitWrapper.sendMessage(
                                    {
                                        wayru_device_id: nfNode.wayru_device_id,
                                        timestamp: moment(epoch.epoch).unix(),
                                        epoch_id: epoch.id,
                                        last_item: isLastItem
                                    }, 
                                   'Add queue here' //ENV.RABBIT_QUEUES.WIFI_API_QUEUE
                                );

                                if (!sentResult) {
                                    throw new Error(`Failed to send message for NFNode ${nfNode.id}`);
                                }

                                console.log(`🚀 WUPI message sent for node ${nfNode.id}`);

                                if (isLastItem) {
                                    console.log('🌠 Last WUPI item processed successfully');
                                }
                            } catch (error) {
                                console.error(`🚨 Error processing NFNode ${nfNode.id}:`, error);
                                throw error;
                            }
                        })
                        .catch((error: Error) => {
                            console.error(`🚨 Error processing NFNode ${nfNode.id}:`, error);
                        });
                })
            );

            const processedCount = (chunkIndex + 1) * BATCH_SIZE;
            logProgress(Math.min(processedCount, nfNodes.length), nfNodes.length, 'WUPI');
        }

        console.log('✅ Finished processing all WUPI nfnodes');
    } catch (error) {
        console.error('🚨 Error processing WUPI nfnodes:', error);
        throw error;
    }
};