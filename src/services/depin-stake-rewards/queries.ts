import pool from "@config/db";
import { CreateDepinStakeRewards } from "@interfaces/depin-stake";

export const getHotspotsStakesForNFNode = async (nfnodeId: number) => {
    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            `SELECT hs.amount, hs.id
            FROM hotspot_stake_nfnode_links hsnl
            INNER JOIN hotspot_stake hs ON hsnl.hotspots_stakes_id = hs.id
            WHERE hsnl.nfnode_id = $1
            AND hs.status = 'staked'`,
            [nfnodeId]
        );
        return rows as { amount: number, id: number }[];
    } catch (error) {
        console.error('Error getting hotspots stakes for nfnode:', error);
        return [];
    } finally {
        client.release();
    }
}

export const createDepinStakeRewards = async (payload: CreateDepinStakeRewards) => {
    const client = await pool.connect();
    try {
        // Start transaction
        await client.query('BEGIN');

        const { nfnodeId, type, poolPerEpochId, rewardAmount, hotspotStakeId } = payload;

        // Insert into depin_stakes_rewards and get the ID
        const { rows } = await client.query(
            `INSERT INTO depin_stakes_rewards (type, reward_amount, status, created_at, published_at) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id`,
            [type, rewardAmount, 'calculated', new Date(), new Date()]
        );

        if (!rows[0]?.id) {
            throw new Error('Failed to insert into depin_stakes_rewards');
        }

        const depinStakeRewardId = rows[0].id;

        // Insert into depin_stakes_rewards_hotspot_stake_links
        await client.query(
            `INSERT INTO depin_stakes_rewards_hotspot_stake_links (depin_stake_reward_id, hotspots_stakes_id) 
             VALUES ($1, $2)`,
            [depinStakeRewardId, hotspotStakeId]
        );

        // Insert into depin_stakes_rewards_pool_per_epoch_links
        await client.query(
            `INSERT INTO depin_stakes_rewards_pool_per_epoch_links (depin_stake_reward_id, pool_per_epoch_id) 
             VALUES ($1, $2)`,
            [depinStakeRewardId, poolPerEpochId]
        );

        // Insert into depin_stakes_rewards_nfnode_links
        await client.query(
            `INSERT INTO depin_stakes_rewards_nfnode_links (depin_stake_reward_id, nfnode_id) 
             VALUES ($1, $2)`,
            [depinStakeRewardId, nfnodeId]
        );

        // Commit transaction if all operations succeed
        await client.query('COMMIT');

        return depinStakeRewardId;
    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error creating depin stake rewards:', {
            error,
            payload,
            errorMessage: (error as Error).message,
            detail: (error as any).detail,
            constraint: (error as any).constraint,
        });
        throw error; // Re-throw to let caller handle the error
    } finally {
        client.release();
    }
}

export const changeDepinStakeRewardsStatusToReadyForClaim = async () => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { rows } = await client.query(
            `UPDATE depin_stakes_rewards
             SET status = 'pending'
             WHERE status = 'calculated'
             RETURNING id;`
        );

        console.log("depin stake rewards changed to pending", rows.length);

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error changing depin stake rewards status to pending:", {
            error,
            errorMessage: (error as Error).message,
        });
    } finally {
        client.release();
    }
};