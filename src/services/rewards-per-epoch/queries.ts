import pool from "@config/db"
import { RewardPerEpochEntry, RewardPerEpoch } from "@interfaces/rewards-per-epoch"
import { insertRewardsPerEpochNFNodeLinksQuery, insertRewardsPerEpochPoolPerEpochLinksQuery, returnRewardsPerEpochQuery, rewardsPerEpochTable } from "./helpers";
import { roundDownTo6Decimals } from "@utils/numbers.utils";
import { UpdatePoolNetworkScoreResponse } from "@interfaces/pool-per-epoch";

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
            INSERT INTO ${rewardsPerEpochTable} 
            (type, hotspot_score, amount, owner_payment_status, host_payment_status, status, currency, published_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `, [
            type,
            hotspot_score,
            amount ?? 0,
            owner_payment_status,
            host_payment_status,
            status,
            currency,
            new Date(),
            new Date()]);

        if (!insertResult.rows[0]?.id) {
            throw new Error(`Failed to insert into ${rewardsPerEpochTable}`);
        }
        const rewardId = insertResult.rows[0].id as number

        // 2. Insert in rewards_per_epoches_nfnode_links
        await client.query(insertRewardsPerEpochNFNodeLinksQuery(rewardId, nfnode));

        // 3. Insert in rewards_per_epoches_pool_per_epoch_links
        await client.query(insertRewardsPerEpochPoolPerEpochLinksQuery(rewardId, pool_per_epoch));

        await client.query('COMMIT');

        // return the complete document
        const { rows: [result] } = await client.query(returnRewardsPerEpochQuery(rewardId));

        return result as RewardPerEpoch

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


export const processRewardsBatch = async (
    params: {
        rewards: UpdatePoolNetworkScoreResponse['rewards'],
        networkScore: number,
        totalRewardsAmount: number
    },
) => {
    const { rewards, networkScore, totalRewardsAmount } = params;
    const updateQueries = rewards
        .map(reward => {
            const proportionalShare = (reward.hotspot_score / networkScore) * totalRewardsAmount;
            const amount = Number(roundDownTo6Decimals(proportionalShare / 1000000));
            return {
                text: `
                    UPDATE ${rewardsPerEpochTable}  
                    SET amount = $1,
                        status = 'ready-for-claim',
                        owner_payment_status = 'pending',
                        host_payment_status = 'pending',
                        updated_at = $3
                    WHERE id = $2
                `,
                values: [amount, reward.id, new Date()]
            };
        });

    await Promise.all(updateQueries.map(query => pool.query(query.text, query.values)));
}