import pool from "@config/db"
import { RewardPerEpochEntry } from "@interfaces/rewards-per-epoch"


export const createRewardsPerEpoch = async (payload: RewardPerEpochEntry) => {
    const client = await pool.connect();
    try {
        const {
            host_payment_status, hotspot_score, amount, currency,
            status, nfnode, owner_payment_status, type, pool_per_epoch
        } = payload;

        // start transaction
        await client.query('BEGIN');

        const insertResult = await client.query(`
            INSERT INTO rewards_per_epoches 
            (type, hotspot_score, amount, owner_payment_status, host_payment_status, status, currency)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [type, hotspot_score, amount ?? 0, owner_payment_status, host_payment_status, status, currency]);

        if (!insertResult.rows[0]?.id) {
            throw new Error('Failed to insert into rewards_per_epoches');
        }
        const rewardId = insertResult.rows[0].id;

        // 2. Insert in rewards_per_epoches_nfnode_links
        await client.query(`
            INSERT INTO rewards_per_epoches_nfnode_links 
            (rewards_per_epoch_id, nfnode_id)
            VALUES ($1, $2)
        `, [rewardId, nfnode]);

        // 3. Insert in rewards_per_epoches_pool_per_epoch_links
        await client.query(`
            INSERT INTO rewards_per_epoches_pool_per_epoch_links
            (rewards_per_epoch_id, pool_per_epoch_id)
            VALUES ($1, $2)
        `, [rewardId, pool_per_epoch]);

        await client.query('COMMIT');

        // return the complete document
        const { rows: [result] } = await client.query(`
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
        `, [rewardId]);

        return result;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating reward per epoch:', {
            error,
            payload,
            errorMessage: (error as Error).message,
            detail: (error as any).detail,
            constraint: (error as any).constraint
        });
        throw error; // Propagate the error instead of returning undefined
    } finally {
        client.release();
    }
};
