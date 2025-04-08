import { BatchProgress, PoolPerEpoch } from "@interfaces/pool-per-epoch";
import { getActivePools as getActivePoolsQuery, getPoolPerEpochById, updatePoolPerEpochById } from "@services/pool-per-epoch/queries";

export class PoolMessageTracker {
    // Global state of pools
    private pools: Map<string, PoolPerEpoch> = new Map();

    // State of message counters
    private messageCounters: Map<string, {
        wubi: { received: number; },
        wupi: { received: number; }
    }> = new Map();

    // Set to keep track of processed rewards
    private processedRewardIds = new Set<number>();

    private LOG_FREQUENCY = 50;
    private isInitialized = false;

    constructor() {
        // Do not initialize in the constructor
    }

    async initialize() {
        if (this.isInitialized) {
            console.log('PoolMessageTracker already initialized');
            return;
        }

        try {
            console.log('🔄 Initializing PoolMessageTracker...');
            await this.initializeCache();
            this.isInitialized = true;
            console.log('✅ PoolMessageTracker initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing PoolMessageTracker:', error);
            throw error;
        }
    }

    private async initializeCache() {
        try {
            const activePools = await this.getActivePools();
            console.log(`Found ${activePools.length} active pools`);

            // Save all active pools in the global state
            for (const pool of activePools) {
                this.pools.set(pool.id.toString(), pool);
                // Initialize counters in 0
                this.initializeCounters(pool.id.toString());
            }

            console.log('Pools initialized:',
                Array.from(this.pools.entries()).map(([id, pool]) => ({
                    id,
                    wubi_messages_sent: pool.wubi_messages_sent,
                    wupi_messages_sent: pool.wupi_messages_sent
                }))
            );
        } catch (error) {
            console.error('Error initializing cache:', error);
            throw error;
        }
    }

    private initializeCounters(poolId: string) {
        const pool = this.pools.get(poolId);
        if (!pool) {
            throw new Error(`Cannot initialize counters for pool ${poolId}: Pool not found`);
        }

        // Initialize counters based on DB values only if they exist
        const wubiReceived = pool.wubi_messages_received !== null ? Number(pool.wubi_messages_received) : 0;
        const wupiReceived = pool.wupi_messages_received !== null ? Number(pool.wupi_messages_received) : 0;

        this.messageCounters.set(poolId, {
            wubi: { received: wubiReceived },
            wupi: { received: wupiReceived }
        });

        console.log(`Counters initialized for pool ${poolId}:`, {
            wubi_received: wubiReceived,
            wupi_received: wupiReceived,
            from_database: {
                wubi: pool.wubi_messages_received !== null,
                wupi: pool.wupi_messages_received !== null
            }
        });
    }

    private async updateDatabase(poolId: number, type: 'wubi' | 'wupi', current: number) {
        console.log(`📊 Updating database for ${type} poolId: ${poolId} with count: ${current}`);
        const updateData = type === 'wubi'
            ? { wubi_messages_received: current }
            : { wupi_messages_received: current };

        await updatePoolPerEpochById(poolId, updateData);
    }

    /**
     * Track message progress with idempotency using rewardId
     * @param poolId - The ID of the pool
     * @param type - The type of message to track ('wubi' or 'wupi')
     * @param rewardId - The ID of the created reward for idempotency check
     * @returns A promise that resolves to the batch progress
     */
    async trackMessage(poolId: number, type: 'wubi' | 'wupi', rewardId: number): Promise<BatchProgress> {
        const poolIdStr = poolId.toString();
        
        const pool = this.pools.get(poolIdStr);
        if (!pool) {
            throw new Error(`Pool ${poolId} not found in global state. Please register or refresh the pool first.`);
        }

        const counters = this.messageCounters.get(poolIdStr);
        if (!counters) {
            throw new Error(`Counters not found for pool ${poolId}`);
        }

        // Check if we have already processed this reward
        if (this.processedRewardIds.has(rewardId)) {
            console.log(`⚠️ Duplicate message detected: reward ${rewardId} already processed`);
            
            // Return the current progress without incrementing
            const received = counters[type].received;
            const expected = type === 'wubi' 
                ? (Number(pool.wubi_messages_sent) || Number(pool.wubi_nfnodes_total))
                : (Number(pool.wupi_messages_sent) || Number(pool.wupi_nfnodes_total));
                
            return {
                current: received,
                total: expected,
                percentage: expected > 0 ? (received / expected) * 100 : 0,
                isLastMessage: received === expected
            };
        }
        
        // Mark as processed
        this.processedRewardIds.add(rewardId);

        // Increment counter (only for new rewards)
        counters[type].received++;

        // The rest of the code continues as usual...
        const received = counters[type].received;
        const expected = type === 'wubi' 
            ? (Number(pool.wubi_messages_sent) || Number(pool.wubi_nfnodes_total))
            : (Number(pool.wupi_messages_sent) || Number(pool.wupi_nfnodes_total));

        // Strict number comparison
        const isLastMessage = received === expected;

        if (received === 1) {
            console.log(`📨 First ${type} message received for pool ${poolId}`);
        }

        if (received % this.LOG_FREQUENCY === 0 || 
            isLastMessage || 
            (received === Math.floor(expected / 2))) {
            console.log(`📊 Progress for ${type} poolId: ${poolId} - ${received}/${expected} (${(expected > 0 ? (received / expected) * 100 : 0).toFixed(2)}%)`);
        }

        if (isLastMessage) {
            console.log(`✅ All expected messages received for ${type} poolId: ${poolId} (${received}/${expected})`);
            // Update database with final count
            await this.updateDatabase(poolId, type, received);
        }

        // Add timeout check
        if (received > expected) {
            console.warn(`⚠️ Warning: Received more messages than expected for ${type}`, {
                received,
                expected,
                poolId
            });
        }

        return {
            current: received,
            total: expected,
            percentage: expected > 0 ? (received / expected) * 100 : 0,
            isLastMessage
        };
    }

    async registerPool(poolId: number) {
        const poolIdStr = poolId.toString();

        if (this.pools.has(poolIdStr)) {
            console.log(`Pool ${poolId} already registered`, {
                pool: this.pools.get(poolIdStr)
            });
            return;
        }

        const pool = await getPoolPerEpochById(poolId);
        if (pool) {

            // Save in the global state of pools
            this.pools.set(poolIdStr, pool);
            // Initialize counters
            this.initializeCounters(poolIdStr);

            // Verify that the values were saved correctly
            const savedPool = this.pools.get(poolIdStr);
            console.log(`Pool ${poolId} saved in global state:`, savedPool);
        } else {
            console.error(`Failed to retrieve pool ${poolId} from database`);
        }
    }

    // method to clear the cache of a specific pool
    clearCache(poolId: string) {
        this.pools.delete(poolId);
        this.messageCounters.delete(poolId);
        console.log(`✅ Cache cleared for pool ${poolId}`);
    }

    // method to get active pools (implement according to your logic)
    private async getActivePools(): Promise<PoolPerEpoch[]> {
        const activePools = await getActivePoolsQuery();
        return activePools;
    }

    async refreshPool(poolId: number, type: 'wubi' | 'wupi', totalMessagesSent: number): Promise<void> {
        const poolIdStr = poolId.toString();
        console.log(`🔄 Refreshing pool ${poolId} state for ${type}...`);

        // Get the current pool from the global state
        const currentPool = this.pools.get(poolIdStr);
        if (!currentPool) {
            throw new Error(`Pool ${poolId} not found in global state`);
        }

        // Create a copy of the current pool
        const updatedPool = { ...currentPool };

        // Update only the field corresponding to the type
        if (type === 'wubi') {
            updatedPool.wubi_messages_sent = totalMessagesSent;
        } else {
            updatedPool.wupi_messages_sent = totalMessagesSent;
        }

        console.log(`Pool ${poolId} refreshed with messages sent:`, {
            previous: {
                wubi: currentPool.wubi_messages_sent,
                wupi: currentPool.wupi_messages_sent
            },
            current: {
                wubi: updatedPool.wubi_messages_sent,
                wupi: updatedPool.wupi_messages_sent
            }
        });

        // Update the pool in the global state
        this.pools.set(poolIdStr, updatedPool);
    }
}

// Create a single instance
export const poolMessageTracker = new PoolMessageTracker();