import pool from "@config/db"
import { RewardPerEpochEntry } from "@interfaces/rewards-per-epoch"


export const createRewardsPerEpoch = async (payload: RewardPerEpochEntry) => {
    try {
        const { 
            host_payment_status, hotspot_score, amount, currency,
            status, nfnode, owner_payment_status, type, pool_per_epoch
        } = payload
        if (!type || !pool_per_epoch || !hotspot_score || !nfnode || !owner_payment_status || !host_payment_status) {
            console.error('missing requires parameters')
            return undefined
        }
        // start transaction
        await pool.query('BEGIN');

        // 1. Insert in rewards_per_epoches table
        const { rows: [rewardPerEpoch] } = await pool.query(`
            INSERT INTO rewards_per_epoches (type, hotspot_score, amount, owner_payment_status, host_payment_status, status, currency)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [type, hotspot_score, amount, owner_payment_status, host_payment_status, status, currency]);

        // 2. Insert in rewards_per_epoches_nfnode_links table
        await pool.query(`
            INSERT INTO rewards_per_epoches_nfnode_links 
            (rewards_per_epoch_id, nfnode_id)
            VALUES ($1, $2)
        `, [rewardPerEpoch.id, nfnode]);

        // 3. Insert in rewards_per_epoches_pool_per_epoch_links table
        await pool.query(`
            INSERT INTO rewards_per_epoches_pool_per_epoch_links
            (rewards_per_epoch_id, pool_per_epoch_id)
            VALUES ($1, $2)
        `, [rewardPerEpoch.id, pool_per_epoch]);

        // Commit transaction
        await pool.query('COMMIT');

        // Return the document with theirs relations
        const { rows: [result] } = await pool.query(`
            SELECT 
                rpe.*,
                n.id as nfnode_id,
                ppe.id as pool_per_epoch_id
            FROM rewards_per_epoches rpe
            LEFT JOIN rewards_per_epoches_nfnode_links rnl ON rnl.rewards_per_epoch_id = rpe.id
            LEFT JOIN nfnodes n ON n.id = rnl.nfnode_id
            LEFT JOIN rewards_per_epoches_pool_per_epoch_links rpel ON rpel.rewards_per_epoch_id = rpe.id
            LEFT JOIN pool_per_epoch ppe ON ppe.id = rpel.pool_per_epoch_id
            WHERE rpe.id = $1
        `, [rewardPerEpoch.id]);

        return result;
    } catch (error) {
        // Revert the transaction in error case
        await pool.query('ROLLBACK');
        console.error('Error creating reward per epoch:', error);
        return undefined
    }
};
