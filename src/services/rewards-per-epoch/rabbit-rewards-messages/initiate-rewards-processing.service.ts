import { BATCH_SIZE, CONCURRENCY_LIMIT, POOL_PER_EPOCH_UPDATE_INTERVAL, TIME_DELAY } from "@constants";
import { checkWupiSync } from "@helpers/rewards-per-epoch/rewards-per-epoch.helpers";
import { logProgress, processInChunks, withRetry } from "@helpers/rewards-per-epoch/rewards-per-epoch.helpers";
import { WubiNFNodes, WupiNFNodes } from "@interfaces/nfnodes";
import { getActiveWubiNfNodes, getActiveWupiNfNodes } from "@services/nfnodes/queries";
import { createCurrentPoolPerEpoch, getPoolPerEpochById, getPoolPerEpochNumber, updatePoolPerEpochById } from "@services/pool-per-epoch/queries";
import { getPoolPerEpochAmount } from "@services/pool-per-epoch/pool-per-epoch.service";
import { rabbitWrapper } from '@services/rabbitmq-wrapper/rabbitmq.service';
import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";
import { poolMessageTracker } from "@services/pool-per-epoch/pool-messages-tracker.service";
import { PoolPerEpoch } from "@interfaces/pool-per-epoch";
import { ENV } from "@config/env/env";
import moment from 'moment'


/**
 * function to initiate the rewards processing
 * 1:  send messages to wubi and wupi to calculate the hotspot_score
 * 2:  get the messages wubi and wupi with the rabbitmq wrapper, and create rewards per epoch for each message
 * 3:  use the network score calculator to calculate the network score and set the amount of rewards per epoch
 * @param poolId - the pool id
 * @returns {Promise<{ error: boolean, message?: string, epoch?: PoolPerEpoch }>} - the promise of the function
 */
export const initiateRewardsProcessing = async (poolId?: number):
    Promise<{ error: boolean, message?: string, epoch?: PoolPerEpoch }> => {
    try {
        // await 5 seconds to start:
        // TODO: remove this after testing
        await new Promise(resolve => setTimeout(resolve, 5000));
        // get the start time of the process
        const startTime = Date.now()

        let [wubiNFNodes, wupiNFNodes] = await Promise.all([
            getActiveWubiNfNodes(),
            getActiveWupiNfNodes()
        ]);

        let epoch = poolId ? await getPoolPerEpochById(poolId) : await createCurrentPoolPerEpoch({
            wubi_processing_status: 'sending_messages',
            wupi_processing_status: 'sending_messages',
            wubi_nfnodes_total: wubiNFNodes.length,
            wupi_nfnodes_total: wupiNFNodes.length,
        });
        if (!epoch) {
            console.log('No epoch found, ending process');
            return { error: true, message: 'No epoch found' };
        }
        // get the total of nfnodes from the epoch
        const epochWubiNFNodesTotal = Number(epoch.wubi_nfnodes_total)
        const epochWupiNFNodesTotal = Number(epoch.wupi_nfnodes_total)
        // declare total wubi and wupi nfnodes to send messages
        // TODO: remove this after testing, for the moment test with 10 nfnodes
        const totalWubiNFNodes = wubiNFNodes //.slice(0, 50)
        const totalWupiNFNodes = wupiNFNodes //.slice(0, 50)

        // if the wubi_nfnodes_total or wupi_nfnodes_total is different from the total of nfnodes, we need to update the pool per epoch
        if (totalWubiNFNodes.length !== epochWubiNFNodesTotal || totalWupiNFNodes.length !== epochWupiNFNodesTotal) {
            console.log('Updating pool per epoch with new nfnodes total');
            await updatePoolPerEpochById(epoch.id, {
                wubi_nfnodes_total: totalWubiNFNodes.length,
                wupi_nfnodes_total: totalWupiNFNodes.length
            })
        }

        // emit the event that the rewards process has started
        eventHub.emit(EventName.REWARDS_PROCESS_STARTED, {
            startTime,
            totalWubiNFNodes: totalWubiNFNodes.length,
            totalWupiNFNodes: totalWupiNFNodes.length,
            epochId: epoch.id
        })

        // get the epoch number & wayru earned
        const epochNumber = await getPoolPerEpochNumber(epoch.epoch)
        const wayruEarned = Number(getPoolPerEpochAmount(epochNumber)) / 1000000
        // TODO: we can sum here the wayruEarned into stats table () =>
        console.log('wayruEarned', wayruEarned)

        // if there aren't actives wubi or wupi nodes, we can return
        const totalNodes = totalWubiNFNodes.length + totalWupiNFNodes.length;
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

        // register batch
        poolMessageTracker.registerPool(epoch.id)

        // now process the nfnodes and calculate their scores
        // test with only 10 nfnodes for wubi and 10 for wupi. TODO: remove this
        processWUBIWithConcurrency(totalWubiNFNodes, epoch)
        processWUPIWithConcurrency(totalWupiNFNodes, epoch)
        return { error: false, epoch: epoch }
    } catch (error) {
        console.error('error processing rewards per epoch', error)
        return { error: true, message: error as string }
    }
}

// process wubi nfnodes with concurrency
const processWUBIWithConcurrency = async (nfNodes: WubiNFNodes[], poolPerEpoch: PoolPerEpoch) => {
    let messagesSentCounter = poolPerEpoch?.wubi_messages_sent || 0;
    try {
        console.log(`Processing ${nfNodes.length} WUBI nfnodes with concurrency`);
        const chunks = processInChunks(nfNodes, BATCH_SIZE);

        for (const [chunkIndex, chunk] of chunks.entries()) {
            const semaphore = Array(CONCURRENCY_LIMIT).fill(Promise.resolve());
            const errors: Error[] = [];
            let chunkCompletedCount = 0;

            await Promise.all(
                chunk.map((nfNode, index) => {
                    const slot = index % CONCURRENCY_LIMIT;
                    return semaphore[slot] = semaphore[slot]
                        .then(async () => {
                            await new Promise(resolve => setTimeout(resolve, TIME_DELAY));
                            return withRetry(async () => {
                                const isLastItem = (chunkIndex === chunks.length - 1) && (index === chunk.length - 1);

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

                                messagesSentCounter++;
                                chunkCompletedCount++;

                                // Track message progress
                                if (isLastItem) {
                                    console.log('🌠 Last WUBI item sent successfully');
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

        // refresh the pool message tracker to know the total messages sent for wubi
        await poolMessageTracker.refreshPool(poolPerEpoch.id, 'wubi', messagesSentCounter)
        // Update status to messages_sent after all messages are sent
        await updatePoolPerEpochById(poolPerEpoch.id, {
            wubi_messages_sent: messagesSentCounter,
            wubi_processing_status: 'messages_sent'
        });


        console.log('✅ Finished to send all WUBI nfnodes');
    } catch (error) {
        console.error('🚨 Error in WUBI batch processing:', error);
        await updatePoolPerEpochById(poolPerEpoch.id, {
            wubi_processing_status: messagesSentCounter === 0 ? 'messages_not_sent' : 'messages_sent',
            wubi_messages_sent: messagesSentCounter,
            wubi_error_message: error?.toString() as string
        });
        throw error;
    }
};

// process wupi nfnodes with concurrency
const processWUPIWithConcurrency = async (nfNodes: WupiNFNodes[], epoch: PoolPerEpoch) => {
    let messagesSentCounter = epoch?.wupi_messages_sent || 0;
    try {
        console.log(`Processing ${nfNodes.length} WUPI nfnodes with concurrency`);
        const epochDate = moment(epoch.epoch).format('YYYY-MM-DD');

        const synced = await checkWupiSync(epochDate);
        if (!synced) {
            console.error('🚨 Connections backend is not ready; WUPI rewards will not be processed');
            await updatePoolPerEpochById(epoch.id, {
                wupi_processing_status: 'messages_not_sent',
                wupi_error_message: 'check wupi sync is not ready'
            });
            return;
        }

        const chunks = processInChunks(nfNodes, BATCH_SIZE);

        for (const [chunkIndex, chunk] of chunks.entries()) {
            const semaphore = Array(CONCURRENCY_LIMIT).fill(Promise.resolve());
            const errors: Error[] = [];
            let chunkCompletedCount = 0;

            await Promise.all(
                chunk.map((nfNode, index) => {
                    const slot = index % CONCURRENCY_LIMIT;
                    return semaphore[slot] = semaphore[slot]
                        .then(async () => {
                            try {
                                await new Promise((resolve) => setTimeout(resolve, TIME_DELAY));
                                const epochDate = moment(epoch.epoch).format('YYYY-MM-DD');

                                const sentResult = await rabbitWrapper.sendMessage(
                                    {
                                        nas_id: nfNode.mac,
                                        nfnode_id: nfNode.id,
                                        total_valid_nas: nfNodes?.length,
                                        epoch: epochDate as unknown as Date
                                    },
                                    ENV.RABBIT_QUEUES.WUPI_API_QUEUE
                                );

                                if (!sentResult) {
                                    throw new Error(`Failed to send message for NFNode ${nfNode.id}`);
                                }

                                messagesSentCounter++;
                                chunkCompletedCount++;

                                // Track message progress
                                const isLastMessage = (chunkIndex === chunks.length - 1) && (index === chunk.length - 1);

                                if (isLastMessage) {
                                    console.log('🌠 Last WUPI item sent successfully');
                                }
                            } catch (error) {
                                console.error(`🚨 Error processing NFNode ${nfNode.id}:`, error);
                                throw error;
                            }
                        })
                        .catch((error: Error) => {
                            errors.push(error);
                            console.error(`🚨 Error processing WUPI NFNode ${nfNode.id}:`, error);
                        });
                })
            );

            // Progress log after each chunk
            const processedCount = (chunkIndex + 1) * BATCH_SIZE;
            logProgress(Math.min(processedCount, nfNodes.length), nfNodes.length, 'WUPI');

            if (errors.length > 0) {
                console.error(`Chunk ${chunkIndex + 1}/${chunks.length} completed with ${errors.length} errors`);
            }
        }

        // refresh the pool message tracker to know the total messages sent for wupi
        await poolMessageTracker.refreshPool(epoch.id, 'wupi', messagesSentCounter)
        // Update status to messages_sent after all messages are sent
        await updatePoolPerEpochById(epoch.id, {
            wupi_messages_sent: messagesSentCounter,
            wupi_processing_status: 'messages_sent'
        });


        console.log('✅ Finished to send all WUPI nfnodes');
    } catch (error) {
        console.error('🚨 Error processing WUPI nfnodes:', error);
        await updatePoolPerEpochById(epoch.id, {
            wupi_processing_status: messagesSentCounter === 0 ? 'messages_not_sent' : 'messages_sent',
            wupi_messages_sent: messagesSentCounter,
            wupi_error_message: error?.toString() as string
        });
        throw error;
    }
};