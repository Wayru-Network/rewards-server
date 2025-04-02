import { POOL_PER_EPOCH_UPDATE_INTERVAL } from "@constants";
import { BatchProgress, PoolPerEpoch } from "@interfaces/pool-per-epoch";
import { getPoolPerEpochById, updatePoolPerEpochById } from "@services/pool-per-epoch/queries";

export class PoolMessageTracker {
    private cache: Map<string, PoolPerEpoch> = new Map();
    private messageCounters: Map<string, { wubi: number; wupi: number }> = new Map();
    private LOG_FREQUENCY = 25;
    private lastUpdateTime: Map<string, number> = new Map();

    constructor() {
        this.initializeCache();
    }
    
    private async initializeCache() {
        try {
            const activePools = await this.getActivePools();
            activePools.forEach(pool => {
                this.cache.set(pool.id.toString(), pool);
                this.messageCounters.set(pool.id.toString(), {
                    wubi: pool.wubi_messages_received,
                    wupi: pool.wupi_messages_received
                });
                this.lastUpdateTime.set(pool.id.toString(), Date.now());
            });
        } catch (error) {
            console.error('Error initializing batch tracker cache:', error);
        }
    }

    private async getBatchProgress(poolId: number, type: 'wubi' | 'wupi'): Promise<BatchProgress> {
        try {
            const poolIdStr = poolId.toString();
            let pool = this.cache.get(poolIdStr);
            
            if (!pool) {
                console.log(`🔄 Fetching pool ${poolId} from database for ${type} message tracking`);
                pool = await getPoolPerEpochById(poolId) || undefined;
                if (pool) {
                    this.cache.set(poolIdStr, pool);
                    this.messageCounters.set(poolIdStr, {
                        wubi: pool.wubi_messages_received,
                        wupi: pool.wupi_messages_received
                    });
                    this.lastUpdateTime.set(poolIdStr, Date.now());
                }
            }

            if (!pool) {
                throw new Error(`Pool with id ${poolId} not found`);
            }

            const counters = this.messageCounters.get(poolIdStr);
            if (!counters) {
                throw new Error(`Counters not found for pool ${poolId}`);
            }

            const current = type === 'wubi' ? counters.wubi : counters.wupi;
            const total = type === 'wubi' ? pool.wubi_nfnodes_total : pool.wupi_nfnodes_total;
            const isLastMessage = current === total;

            // update database periodically
            const now = Date.now();
            const lastUpdate = this.lastUpdateTime.get(poolIdStr) || 0;
            
            if (now - lastUpdate >= POOL_PER_EPOCH_UPDATE_INTERVAL || isLastMessage) {
                await this.updateDatabase(poolId, type, current);
                this.lastUpdateTime.set(poolIdStr, now);
            }

            if (current % this.LOG_FREQUENCY === 0 || 
                current === 1 || 
                isLastMessage || 
                (current === Math.floor(total / 2))) {
                console.log(`📊 Progress for ${type} poolId: ${poolId} - ${current}/${total} (${(total > 0 ? (current / total) * 100 : 0).toFixed(2)}%)`);
            }

            if (isLastMessage) {
                console.log(`✅ Completed all messages for ${type} poolId: ${poolId}`);
            }

            return {
                current,
                total,
                percentage: total > 0 ? (current / total) * 100 : 0,
                isLastMessage
            };
        } catch (error) {
            console.error('Error getting batch progress:', error);
            throw error;
        }
    }

    private async updateDatabase(poolId: number, type: 'wubi' | 'wupi', current: number) {
        try {
            const updateData = type === 'wubi' 
                ? { wubi_messages_received: current }
                : { wupi_messages_received: current };
            
            await updatePoolPerEpochById(poolId, updateData);
        } catch (error) {
            console.error(`Error updating database for pool ${poolId}:`, error);
        }
    }

    /**
     * Track message progress, increase the counter and update the database
     * periodically each time the method is called
     * @param poolId - The ID of the pool
     * @param type - The type of message to track ('wubi' or 'wupi')
     * @returns A promise that resolves to the batch progress
     */
    async trackMessage(poolId: number, type: 'wubi' | 'wupi'): Promise<BatchProgress> {
        const poolIdStr = poolId.toString();
        let counters = this.messageCounters.get(poolIdStr);
        
        if (!counters) {
            console.log(`🔄 Fetching pool ${poolId} from database for ${type} message tracking`);
            const pool = await getPoolPerEpochById(poolId);
            if (!pool) {
                throw new Error(`Pool with id ${poolId} not found`);
            }
            counters = {
                wubi: pool.wubi_messages_received,
                wupi: pool.wupi_messages_received
            };
            this.messageCounters.set(poolIdStr, counters);
        }

        // increase counter
        if (type === 'wubi') {
            counters.wubi++;
        } else {
            counters.wupi++;
        }

        // Update status to messages_received if this is the first message
        if ((type === 'wubi' && counters.wubi === 1) || (type === 'wupi' && counters.wupi === 1)) {
            console.log(`📨 First ${type} message received for pool ${poolId}`);
            await updatePoolPerEpochById(poolId, {
                [`${type}_processing_status`]: 'messages_received'
            });
        }

        return this.getBatchProgress(poolId, type);
    }

    // method to update the cache when a pool is updated
    async registerPool(poolId: number) {
        try {
            if (this.cache.has(poolId.toString())) {
                console.log(`Pool ${poolId} already registered in cache`);
                return;
            }
            const pool = await getPoolPerEpochById(poolId);
            if (pool) {
                this.cache.set(poolId.toString(), pool);
                console.log(`✅ Pool ${poolId} registered in cache`);
            }
        } catch (error) {
            console.error('Error registering pool:', error);
        }
    }

    // method to clear the cache of a specific pool
    clearCache(poolId: string) {
        this.cache.delete(poolId);
    }

    // method to get active pools (implement according to your logic)
    private async getActivePools(): Promise<PoolPerEpoch[]> {
        // implement the logic to get active pools
        return [];
    }
}

export const poolMessageTracker = new PoolMessageTracker();