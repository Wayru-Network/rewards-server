import { BATCH_SIZE, CONCURRENCY_LIMIT, TIME_DELAY } from "@constants";
import { checkWubiSync, checkWupiSync } from "@helpers/rewards-per-epoch/rewards-per-epoch.helpers";
import { logProgress, processInChunks, withRetry } from "@helpers/rewards-per-epoch/rewards-per-epoch.helpers";
import { WubiNFNodes, WupiNFNodes } from "@interfaces/nfnodes";
import { getActiveWubiNfNodes, getActiveWupiNfNodes } from "@services/nfnodes/queries";
import { createCurrentPoolPerEpoch, getPoolPerEpochById, getPoolPerEpochNumber, updatePoolPerEpochById } from "@services/pool-per-epoch/queries";
import { getPoolPerEpochAmount } from "@services/pool-per-epoch/pool-per-epoch.service";
import { rabbitWrapper } from '@services/rabbitmq-wrapper/rabbitmq.service';
import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";
import { poolMessageTracker } from "@services/pool-per-epoch/pool-messages-tracker.service";
import { PoolPerEpoch, PoolPerEpochEntry } from "@interfaces/pool-per-epoch";
import { ENV } from "@config/env/env";
import moment from 'moment'
import { poolPerEpochInstance } from "@services/pool-per-epoch/pool-per-epoch-instance.service";


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
        const startTime = Date.now();
        
        // Get active nodes
        const [wubiNFNodes, wupiNFNodes] = await Promise.all([
            getActiveWubiNfNodes(),
            getActiveWupiNfNodes()
        ]);
        
        console.log(`Found ${wubiNFNodes.length} wUBI and ${wupiNFNodes.length} wUPI active nodes`);
        
        // Validate if there are active nodes
        const totalNodes = wubiNFNodes.length + wupiNFNodes.length;
        if (totalNodes === 0) {
            console.log('⚠️ No active nodes found, ending process');
            return { error: true, message: 'No active nodes found' };
        }
        
        // Get or create epoch, using poolPerEpochInstance to load the pool
        let epoch: PoolPerEpoch | null;
        
        if (poolId) {
            // Get the epoch from the global instance
            epoch = await poolPerEpochInstance.getById(poolId);
  
            if (!epoch) {
                console.log('❌ No epoch found, ending process');
                return { error: true, message: 'No epoch found' };
            }
                
            // Update the necessary fields for the epoch
            const updateData = {
                wubi_processing_status: 'sending_messages',
                wupi_processing_status: 'sending_messages',
                wubi_nfnodes_total: wubiNFNodes.length,
                wupi_nfnodes_total: wupiNFNodes.length,
                wubi_messages_sent: 0,
                wupi_messages_sent: 0,
                wubi_messages_received: 0,
                wupi_messages_received: 0,
                network_score: 0,
                network_score_upi: 0,
                processing_metrics: {
                    ...epoch.processing_metrics,
                    startTime: startTime,
                    totalWubiNFNodes: wubiNFNodes.length,
                    totalWupiNFNodes: wupiNFNodes.length
                }
            } as Partial<PoolPerEpochEntry>
             
            // make a single update to the database
            const updatedEpoch = await updatePoolPerEpochById(poolId, updateData);
            if (!updatedEpoch) {
                console.log('❌ Error updating pool per epoch');
                return { error: true, message: 'Error updating pool per epoch' };
            }
            
            // Update the global instance
            poolPerEpochInstance.saveInstance(updatedEpoch);
            epoch = updatedEpoch;
            
        } else {
            // Create new pool
            epoch = await createCurrentPoolPerEpoch({
                wubi_processing_status: 'sending_messages',
                wupi_processing_status: 'sending_messages',
                wubi_nfnodes_total: wubiNFNodes.length,
                wupi_nfnodes_total: wupiNFNodes.length,
                wubi_messages_sent: 0,
                wupi_messages_sent: 0,
                wubi_messages_received: 0,
                wupi_messages_received: 0,
                processing_metrics: {
                    startTime: startTime,
                    totalWubiNFNodes: wubiNFNodes.length,
                    totalWupiNFNodes: wupiNFNodes.length
                }
            });
            
            if (!epoch) {
                console.log('❌ No epoch created, ending process');
                return { error: true, message: 'No epoch created' };
            }
            
            // Save in the global instance
            poolPerEpochInstance.saveInstance(epoch);
        }

        // Register pool for message tracking
        await poolMessageTracker.registerPool(epoch.id);
        
        // Get epoch number and wayru earned
        const epochNumber = await getPoolPerEpochNumber(epoch.epoch);
        const wayruEarned = Number(getPoolPerEpochAmount(epochNumber)) / 1000000;
        console.log(`Epoch ${epochNumber}, Wayru earned: ${wayruEarned}`);
        
        // Emit event of start
        eventHub.emit(EventName.REWARDS_PROCESS_STARTED, {
            startTime,
            totalWubiNFNodes: wubiNFNodes.length,
            totalWupiNFNodes: wupiNFNodes.length,
            epochId: epoch.id
        });
        
        // Process nodes concurrently
        processWUBIWithConcurrency(wubiNFNodes, epoch);
        processWUPIWithConcurrency(wupiNFNodes, epoch);
        
        return { error: false, epoch: epoch };
    } catch (error) {
        console.error('❌ Error processing rewards:', error);
        
        // More detailed error handling
        const errorMessage = error instanceof Error 
            ? `${error.name}: ${error.message}` 
            : String(error);
            
        return { 
            error: true, 
            message: `Error processing rewards: ${errorMessage}`
        };
    }
};

// process wubi nfnodes with concurrency
export const processWUBIWithConcurrency = async (nfNodes: WubiNFNodes[], poolPerEpoch: PoolPerEpoch) => {
    let messagesSentCounter = poolPerEpoch?.wubi_messages_sent || 0;
    try {
        console.log(`Processing ${nfNodes.length} WUBI nfnodes with concurrency`);
        const epochDate = moment(poolPerEpoch.epoch).format('YYYY-MM-DD');
        const synced = await checkWubiSync(epochDate);
        if (!synced) {
            console.error('🚨 Connections backend is not ready; WUBI rewards will not be processed');
            await updatePoolPerEpochById(poolPerEpoch.id, {
                wubi_processing_status: 'messages_not_sent',
                wubi_error_message: 'check wubi sync is not ready',
                is_retrying: false
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
                            await new Promise(resolve => setTimeout(resolve, TIME_DELAY));
                            return withRetry(async () => {
                                const isLastItem = (chunkIndex === chunks.length - 1) && (index === chunk.length - 1);
                                const message = {
                                    wayru_device_id: nfNode.wayru_device_id,
                                    timestamp: moment(poolPerEpoch.epoch).unix(),
                                    epoch_id: poolPerEpoch.id,
                                    last_item: isLastItem
                                }
                                // validate the message params
                                if (!message.wayru_device_id || !message.timestamp ||
                                    !message.epoch_id || typeof message.last_item !== 'boolean') {
                                    console.error('sending invalid WUBI message');
                                    throw new Error('invalid WUBI message');
                                }

                                const sentResult = await rabbitWrapper.sendMessage(message,
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
            wubi_error_message: error?.toString() as string,
            is_retrying: false
        });
        throw error;
    }
};

// process wupi nfnodes with concurrency
export const processWUPIWithConcurrency = async (nfNodes: WupiNFNodes[], epoch: PoolPerEpoch) => {
    let messagesSentCounter = epoch?.wupi_messages_sent || 0;
    try {
        console.log(`Processing ${nfNodes.length} WUPI nfnodes with concurrency`);
        const epochDate = moment(epoch.epoch).format('YYYY-MM-DD');

        const synced = await checkWupiSync(epochDate);
        if (!synced) {
            console.error('🚨 Connections backend is not ready; WUPI rewards will not be processed');
            await updatePoolPerEpochById(epoch.id, {
                wupi_processing_status: 'messages_not_sent',
                wupi_error_message: 'check wupi sync is not ready',
                is_retrying: false
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
                                const message = {
                                    nas_id: nfNode?.nas_id || nfNode.mac,
                                    nfnode_id: nfNode.id,
                                    total_valid_nas: nfNodes?.length,
                                    epoch: epochDate as unknown as Date
                                }
                                // validate the message params
                                if (!message.nas_id || !message.nfnode_id || !message.epoch
                                    || typeof message.total_valid_nas !== 'number') {
                                    console.error('sending invalid WUPI message');
                                    throw new Error('invalid WUPI message');
                                }

                                const sentResult = await rabbitWrapper.sendMessage(message,
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
            wupi_error_message: error?.toString() as string,
            is_retrying: false
        });
        throw error;
    }
};