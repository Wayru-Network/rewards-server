import pool from "@config/db";
import { EventMap } from "@interfaces/events";
import { EventName } from "@interfaces/events";
import { eventHub } from "@services/events/event-hub";
import { updatePoolNetworkScore, updatePoolPerEpochById } from "../queries";
import { processRewardsBatch } from "@services/rewards-per-epoch/queries";
import { BATCH_SIZE_REWARDS } from "@constants";
import { getPoolPerEpochAmountsMainnet } from "../pool-per-epoch.service";
import { sumAllNetworkScoresQuery } from "@services/rewards-per-epoch/helpers";

export class NetworkScoreCalculator {
    private static instance: NetworkScoreCalculator;
    private eventListeners: Array<{ event: string; listener: Function }> = [];

    constructor() {
        if (NetworkScoreCalculator.instance) {
            return NetworkScoreCalculator.instance;
        }
        NetworkScoreCalculator.instance = this;
        this.setupEventListeners();
    }

    public static getInstance(): NetworkScoreCalculator {
        if (!NetworkScoreCalculator.instance) {
            NetworkScoreCalculator.instance = new NetworkScoreCalculator();
        }
        return NetworkScoreCalculator.instance;
    }

    public static cleanup() {
        if (NetworkScoreCalculator.instance) {
            NetworkScoreCalculator.instance.cleanupInstance();
        }
    }

    private cleanupInstance() {
        this.eventListeners.forEach(({ event, listener }) => {
            eventHub.removeListener(event, listener as (...args: any[]) => void);
        });
        this.eventListeners = [];
        console.log('🧮 Network Score Calculator service stopped');
    }

    private setupEventListeners() {
        const lastRewardListener = this.handleLastRewardCreated.bind(this);
        const networkScoreListener = this.handleNetworkScoreCalculated.bind(this);

        this.eventListeners.push(
            {
                event: EventName.LAST_REWARD_CREATED,
                listener: lastRewardListener
            },
            {
                event: EventName.NETWORK_SCORE_CALCULATED,
                listener: networkScoreListener
            }
        );

        eventHub.on(EventName.LAST_REWARD_CREATED, lastRewardListener);
        eventHub.on(EventName.NETWORK_SCORE_CALCULATED, networkScoreListener);
    }

    private async handleLastRewardCreated({ epochId, type }: EventMap[EventName.LAST_REWARD_CREATED]) {
        try {
            // Calculate network score total
            const { rows } = await pool.query(sumAllNetworkScoresQuery(type, epochId)) as { 
                rows: {
                    network_score: number;
                }[] 
            };

            const { network_score } = rows[0];

            // Emit event with the calculated network score
            eventHub.emit(EventName.NETWORK_SCORE_CALCULATED, {
                epochId,
                networkScore: network_score,
                type
            });
        } catch (error) {
            console.error('Error calculating network score:', error);
        }
    }

    private async handleNetworkScoreCalculated({ epochId, networkScore, type }: 
        EventMap[EventName.NETWORK_SCORE_CALCULATED]) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update epoch with network scores
            const {epoch, rewards} = await updatePoolNetworkScore(epochId, networkScore, type);

            const totalRewards = await getPoolPerEpochAmountsMainnet(epoch.epoch)
            if (!totalRewards) {
                throw new Error('Total rewards not found');
            }
            const totalRewardsAmount = type === 'wUBI' ? Number(totalRewards.ubiAmount) : Number(totalRewards.upiAmount)

            // Before the loop, add log of total
            console.log(`Total rewards to process: ${rewards.length}`);

            // Improve the batch processing
            const totalBatches = Math.ceil(rewards.length / BATCH_SIZE_REWARDS);
            let processedCount = 0;

            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const start = batchIndex * BATCH_SIZE_REWARDS;
                const end = Math.min(start + BATCH_SIZE_REWARDS, rewards.length);
                const batch = rewards.slice(start, end);

                // process rewards batch
                await processRewardsBatch({
                    rewards: batch,
                    networkScore,
                    totalRewardsAmount
                });

                processedCount += batch.length;
            }

            if (processedCount !== rewards.length) {
                console.error('⚠️ Mismatch in processed rewards:', {
                    expected: rewards.length,
                    actual: processedCount,
                    difference: rewards.length - processedCount
                });
            }

            // update the pool per epoch
            await updatePoolPerEpochById(epochId, {
                [`${type}_nfnodes_with_score`]: rewards.length,
            });

            await client.query('COMMIT');

            // emit event that the rewards process has completed
            // you can continue checking the logic into pool-process-timer.service.ts
            if (type === 'wUBI') {
                eventHub.emit(EventName.WUBI_PROCESS_COMPLETED, {
                    epochId,
                });
            } else {
                eventHub.emit(EventName.WUPI_PROCESS_COMPLETED, {
                    epochId,
                });
            }
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error updating rewards amounts:', error);
        } finally {
            client.release();
        }
    }
}