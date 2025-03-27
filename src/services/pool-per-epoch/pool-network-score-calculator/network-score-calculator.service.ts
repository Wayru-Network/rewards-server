import pool from "@config/db";
import { EventMap } from "@interfaces/events";
import { EventName } from "@interfaces/events";
import { eventHub } from "@services/events/event-hub";
import { getPoolPerEpochAmounts, updatePoolNetworkScore } from "../queries";
import { processRewardsBatch } from "@services/rewards-per-epoch/rewards-per-epoch.service";
import { BATCH_SIZE_REWARDS } from "@constants";

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
            console.log('****** handleLastRewardCreated ******');
            // Calculate network score total
            const { rows } = await pool.query(`
                SELECT 
                    SUM(rpe.hotspot_score) as network_score
                FROM rewards_per_epoches rpe
                INNER JOIN rewards_per_epoches_pool_per_epoch_links rel 
                    ON rel.rewards_per_epoch_id = rpe.id
                WHERE rel.pool_per_epoch_id = $1
                    AND rpe.type = $2
            `, [epochId, type]) as { 
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

    private async handleNetworkScoreCalculated({ epochId, networkScore, type }: EventMap[EventName.NETWORK_SCORE_CALCULATED]) {
        const client = await pool.connect();
        try {
            console.log('****** handleNetworkScoreCalculated ******');
            await client.query('BEGIN');

            // Update epoch with network scores
            const {epoch, rewards} = await updatePoolNetworkScore(epochId, networkScore, type);

            const totalRewards = await getPoolPerEpochAmounts(epoch.epoch)
            if (!totalRewards) {
                throw new Error('Total rewards not found');
            }
            const totalRewardsAmount = type === 'wUBI' ? Number(totalRewards.ubiAmount) : Number(totalRewards.upiAmount)

            // iterate over rewards in batch
            for (let i = 0; i < rewards.length; i += BATCH_SIZE_REWARDS) {
                const batch = rewards.slice(i, i + BATCH_SIZE_REWARDS);
                console.log(`Processing batch ${i/BATCH_SIZE_REWARDS + 1} of ${Math.ceil(rewards.length/BATCH_SIZE_REWARDS)}`);
                // process rewards batch
                await processRewardsBatch({
                    rewards: batch,
                    networkScore,
                    totalRewardsAmount
                });
            }

            console.log('****** Rewards processed and committed ******');
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error updating rewards amounts:', error);
        } finally {
            client.release();
        }
    }
}