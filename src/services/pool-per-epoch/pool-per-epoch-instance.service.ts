import { PoolPerEpoch } from '@interfaces/pool-per-epoch';
import { getPoolPerEpochById, getPoolPerEpochByEpoch } from './queries';
import moment from 'moment';

class PoolPerEpochInstance {
    // Global instance of pools
    private instances: Map<number, PoolPerEpoch> = new Map();
    
    // Index for fast search by other fields
    private epochIndex: Map<string, number> = new Map(); // ISO date string -> poolId

    // Singleton
    private static instance: PoolPerEpochInstance;
    
    // Expiration time (5 minutes)
    private expiryMs = 5 * 60 * 1000;
    
    // Timestamps for expiration control
    private lastAccess: Map<number, number> = new Map();
    
    private constructor() {
        // Initialize instance cleaner every 10 minutes
        setInterval(() => this.cleanExpiredInstances(), 10 * 60 * 1000);
    }
    
    public static getInstance(): PoolPerEpochInstance {
        if (!PoolPerEpochInstance.instance) {
            PoolPerEpochInstance.instance = new PoolPerEpochInstance();
        }
        return PoolPerEpochInstance.instance;
    }
    
  /**
     * Be careful with this method, it can not return the updated pool because is only an pool's instance
     * @param id - The id of the pool to query
     * @returns The pool per epoch or null if it doesn't exist
     */
    public async getById(id: number): Promise<PoolPerEpoch | null> {
        // Check if it already exists in the global state
        if (this.instances.has(id)) {
            // Update access timestamp
            this.lastAccess.set(id, Date.now());
            return this.instances.get(id) || null;
        }
        
        // If it doesn't exist, query the database
        try {
            console.log(`🔄 Querying pool by ID: ${id}`);
            const pool = await getPoolPerEpochById(id);
            
            if (pool) {
                // Save in the global state
                this.saveInstance(pool);
            }
            
            return pool;
        } catch (error) {
            console.error(`Error querying pool by ID ${id}:`, error);
            return null;
        }
    }
    
    /**
     * Query by epoch date
     * @param epoch - The epoch date to query (can be Date or string)
     */
    public async getByEpoch(epoch: Date | string): Promise<PoolPerEpoch | null> {
        // Convert to string to search in the index
        const epochKey = epoch as unknown as string;
        
        // Check if it already exists in the index
        const poolId = this.epochIndex.get(epochKey);
        if (poolId !== undefined && this.instances.has(poolId)) {
            // Update access timestamp
            this.lastAccess.set(poolId, Date.now());
            return this.instances.get(poolId) || null;
        }
        
        // If it doesn't exist, query the database
        try {
            console.log(`🔍 Querying pool by epoch: ${epochKey}`);
            const pool = await getPoolPerEpochByEpoch(epoch as Date);
            
            if (pool) {
                // Save in the global state
                this.saveInstance(pool);
                console.log(`✓ Pool ${pool.id} found in DB and saved to cache with epoch: ${epochKey}`);
                this.epochIndex.set(epochKey, pool.id);
            } else {
                console.log(`✗ No pool found in DB for epoch: ${epochKey}`);
            }
            
            return pool;
        } catch (error) {
            console.error(`Error querying pool by epoch ${epochKey}:`, error);
            return null;
        }
    }

    /**
     * Save or update an instance in the global state
     * Deletes previous versions if they exist
     */
    public saveInstance(pool: PoolPerEpoch): void {
        const epochKey = moment(pool.epoch).format('YYYY-MM-DD');
  
        // 3. Save new pool and save index
        this.epochIndex.set(epochKey, pool.id);
        this.instances.set(pool.id, pool);
        this.lastAccess.set(pool.id, Date.now());

        const countInstances = this.instances.size;
        const countEpochIndex = this.epochIndex.size;
        
        console.log(`✅ Pool ${pool.id} saved correctly in global state with epoch: ${epochKey}`);
        console.log(`🔍 Total instances: ${countInstances}`);
        console.log(`🔍 Total epoch index: ${countEpochIndex}`);
    }
    
    /**
     * Clean instances that have not been used recently
     */
    private cleanExpiredInstances(): void {
        const now = Date.now();
        
        for (const [id, lastAccessTime] of this.lastAccess.entries()) {
            if (now - lastAccessTime > this.expiryMs) {
                // Delete from secondary indices first
                const pool = this.instances.get(id);
                if (pool && pool.epoch) {
                    const epochKey = pool.epoch as unknown as string;
                    this.epochIndex.delete(epochKey);
                }
                
                // Then delete the instance
                this.instances.delete(id);
                this.lastAccess.delete(id);
                
                console.log(`🧹 Pool ${id} deleted from global state due to inactivity`);
            }
        }
    }
    
    /**
     * Clean the entire global state
     */
    public clearAllInstances(): void {
        this.instances.clear();
        this.epochIndex.clear();
        this.lastAccess.clear();
        console.log('🧹 Global pool state cleaned completely');
    }
}

// Export the instance for application use
export const poolPerEpochInstance = PoolPerEpochInstance.getInstance();
