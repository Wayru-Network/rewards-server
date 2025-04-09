import { ENV } from "@config/env/env";
import pool from "../../config/db";
import { PoolPerEpoch, PoolPerEpochEntry, UpdatePoolNetworkScoreResponse } from "../../interfaces/pool-per-epoch";
import { RewardPerEpochEntry } from "@interfaces/rewards-per-epoch";
import { getPoolPerEpochAmounts } from "./pool-per-epoch.service";
import moment from "moment";
import { poolPerEpochTable, queryCountRewardsPerEpochByPoolId, selectRewardsByPoolPerEpochIdQuery } from "./helpers";

export const getPoolPerEpochById = async (epochId: number): Promise<PoolPerEpoch | null> => {
    try {
        const result = await pool.query(`SELECT * FROM ${poolPerEpochTable} WHERE id = $1`, [epochId]);
        let document = result?.rows?.length > 0 ? result.rows[0] : null;
        if (document) {
            const rewardsCount = await countRewardsPerEpochByPoolId(document.id)
            document.wubi_messages_received = Number(rewardsCount?.wubi ?? 0)
            document.wupi_messages_received = Number(rewardsCount?.wupi ?? 0)
        }
        return document;
    } catch (error) {
        console.error('getPoolPerEpoch error', error);
        return null;
    }
}

export const createCurrentPoolPerEpoch = async (epochParams?: Partial<PoolPerEpochEntry>): Promise<PoolPerEpoch | null> => {
    try {
        const lastEpochDateNumber = new Date().setDate(new Date().getDate() - 1)
        const lastEpochDate = new Date(lastEpochDateNumber)
        const formattedEpoch = moment(lastEpochDate).utc().format('YYYY-MM-DD')
        const epochAmounts = await getPoolPerEpochAmounts(lastEpochDate)
        const wayruPoolUbi = Number(epochAmounts?.ubiAmount) / 1000000
        const wayruPoolUpi = Number(epochAmounts?.upiAmount) / 1000000
        const epochData: PoolPerEpochEntry = {
            epoch: lastEpochDate,
            ubi_pool: wayruPoolUbi,
            upi_pool: wayruPoolUpi,
            network_score: epochParams?.network_score ?? 0,
            network_score_upi: epochParams?.network_score_upi ?? 0,
            wubi_nfnodes_with_score: epochParams?.wubi_nfnodes_with_score ?? 0,
            wupi_nfnodes_with_score: epochParams?.wupi_nfnodes_with_score ?? 0,
            wubi_nfnodes_total: epochParams?.wubi_nfnodes_total ?? 0,
            wupi_nfnodes_total: epochParams?.wupi_nfnodes_total ?? 0,
            wubi_processing_status: epochParams?.wubi_processing_status ?? 'sending_messages',
            wupi_processing_status: epochParams?.wupi_processing_status ?? 'sending_messages',
            wubi_error_message: epochParams?.wubi_error_message,
            wupi_error_message: epochParams?.wupi_error_message,
            wubi_messages_received: epochParams?.wubi_messages_received ?? 0,
            wupi_messages_received: epochParams?.wupi_messages_received ?? 0,
            wubi_messages_sent: epochParams?.wubi_messages_sent ?? 0,
            wupi_messages_sent: epochParams?.wupi_messages_sent ?? 0,
        }


        // check if there is a epoch into pool per epoch with this last epoch date
        const poolPerEpoch = await pool.query(`SELECT * FROM ${poolPerEpochTable} WHERE epoch = $1`, [formattedEpoch]);
        if (poolPerEpoch?.rows?.length > 0) {
            // update the pool per epoch
            const updatedPoolPerEpoch = await updatePoolPerEpochById(poolPerEpoch.rows[0].id, epochData)
            return updatedPoolPerEpoch as PoolPerEpoch
        }
       

        // insert into pool_per_epoch
        const result = await pool.query(`
            INSERT INTO ${poolPerEpochTable} (
                -- Basic dates and pools
                epoch,
                ubi_pool,
                upi_pool,
                created_at,
                
                -- Network scores
                network_score,
                network_score_upi,
                
                -- WUBI counters
                wubi_nfnodes_total,
                wubi_nfnodes_with_score,
                wubi_messages_received,
                wubi_messages_sent,
                wubi_processing_status,
                wubi_error_message,
                
                -- WUPI counters
                wupi_nfnodes_total,
                wupi_nfnodes_with_score,
                wupi_messages_received,
                wupi_messages_sent,
                wupi_processing_status,
                wupi_error_message
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
            RETURNING *`,
            [
                // Basic dates and pools
                epochData.epoch,
                epochData.ubi_pool,
                epochData.upi_pool,
                new Date(),

                // Network scores
                epochData.network_score,
                epochData.network_score_upi,

                // WUBI counters
                epochData.wubi_nfnodes_total,
                epochData.wubi_nfnodes_with_score,
                epochData.wubi_messages_received,
                epochData.wubi_messages_sent,
                epochData.wubi_processing_status,
                epochData.wubi_error_message,

                // WUPI counters
                epochData.wupi_nfnodes_total,
                epochData.wupi_nfnodes_with_score,
                epochData.wupi_messages_received,
                epochData.wupi_messages_sent,
                epochData.wupi_processing_status,
                epochData.wupi_error_message
            ]
        );

        // return the document created
        return result?.rows?.length > 0 ? result.rows[0] : null
    } catch (error) {
        console.error('createCurrentPoolPerEpoch error', error);
        return null;
    }
}

export const getPoolPerEpochNumber = async (targetDate: Date) => {
    try {
        const period = ENV.REWARDS_PERIOD
        const startDate = 'mainnet' === period ? '2025-04-30T00:00:00Z' : (ENV.SOLANA_ENV === 'devnet' ? '2025-02-25T00:00:00Z' : '2025-02-25T00:00:00Z')
        const start = new Date(startDate).valueOf()
        const target = new Date(targetDate).valueOf()
        const startCoolDownDate = new Date('2025-04-20T00:00:00Z').valueOf()
        const startMainnetDate = new Date('2025-04-30T00:00:00Z').valueOf()
        const diffInMs = target - start
        if (diffInMs < 0) {
            return 0
        }
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24)
        const epochNumber = Math.floor(diffInDays) + 1
        //give us a few days to change REWARDS_PERIOD var to mainnet
        if (target > startCoolDownDate && target < startMainnetDate) {
            return 0
        }
        return epochNumber
    } catch (error) {
        console.error('getPoolPerEpochNumber error', error);
        return 0;
    }
}

export const updatePoolPerEpochById = async (id: number, data: Partial<PoolPerEpochEntry>) => {
    try {
        // Filter only the fields that have values
        const validFields = Object.entries(data)
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {} as Record<string, any>);

        if (Object.keys(validFields).length === 0) {
            return null;
        }

        // Build the dynamic query
        const setClause = Object.keys(validFields)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');

        const query = `
            UPDATE ${poolPerEpochTable} 
            SET ${setClause} 
            WHERE id = ${id}
            RETURNING *
        `;

        const result = await pool.query(query, Object.values(validFields));
        const document = result?.rows?.length > 0 ? result?.rows[0] : null;
        return document as PoolPerEpoch | null;
    } catch (error) {
        console.error('updatePoolPerEpoch error:', error);
        return null;
    }
}

export const updatePoolNetworkScore = async (epochId: number, networkScore: number, type: RewardPerEpochEntry['type']): Promise<UpdatePoolNetworkScoreResponse> => {
    // First update the network scores
    const { rows: [epoch] } = await pool.query(`
         UPDATE ${poolPerEpochTable}
        SET ${type === 'wUBI' ? 'network_score' : 'network_score_upi'} = $1,
            updated_at = $2
        WHERE id = $3
        RETURNING *
    `, [networkScore ?? 0, new Date(), epochId]) as {
        rows: PoolPerEpoch[]
    };

    // Get only the necessary fields from the rewards
    const { rows: rewards } = await pool.query(selectRewardsByPoolPerEpochIdQuery(epochId, type)) as {
        rows: UpdatePoolNetworkScoreResponse['rewards']
    };

    return {
        epoch,
        rewards
    };
}

export const getPoolPerEpochByEpoch = async (epoch: Date) => {
    const { rows } = await pool.query(`SELECT * FROM ${poolPerEpochTable} WHERE epoch = $1`, [epoch])
    const document = rows?.length > 0 ? rows[0] : null
    return document as PoolPerEpoch | null
}

export const getActivePools = async () => {
    try {
        const { rows } = await pool.query(`SELECT * FROM ${poolPerEpochTable} WHERE
             wubi_processing_status = 'sending_messages' OR 
             wupi_processing_status = 'sending_messages' OR 
             wubi_processing_status = 'messages_sent' OR 
             wupi_processing_status = 'messages_sent' OR 
             wubi_processing_status = 'messages_not_sent' OR 
             wupi_processing_status = 'messages_not_sent'
             `) as {
            rows: PoolPerEpoch[]
        }
        const pools = rows?.length > 0 ? rows : []

        // verify if the messages received are correct
        for (const pool of pools) {         
               const rewardsCount = await countRewardsPerEpochByPoolId(pool.id)

            const wubi_messages_received = Number(pool.wubi_messages_received ?? 0)
            const wupi_messages_received = Number(pool.wupi_messages_received ?? 0)
            const wubi_rewards_created = Number(rewardsCount?.wubi ?? 0)
            const wupi_rewards_created = Number(rewardsCount?.wupi ?? 0)

            // if the are different, we need to update the pool
            if (wubi_rewards_created !== wubi_messages_received || wupi_rewards_created !== wupi_messages_received) {
                pool.wubi_messages_received = wubi_rewards_created
                pool.wupi_messages_received = wupi_rewards_created
                await updatePoolPerEpochById(pool.id, {
                    wubi_messages_received: wubi_rewards_created,
                    wupi_messages_received: wupi_rewards_created
                })
            }

            // update the pool, so we do not need to fetch it again
            pool.wubi_messages_received = wubi_rewards_created
            pool.wupi_messages_received = wupi_rewards_created
        }
        return pools
    } catch (error) {
        console.error('getActivePools error', error);
        return [];
    }
}

export const getPoolToRetry = async () => {
    try {
        const { rows } = await pool.query(`
            SELECT * FROM ${poolPerEpochTable} 
            WHERE (
                wubi_processing_status = 'messages_not_sent' OR 
                wupi_processing_status = 'messages_not_sent'
            ) 
            AND is_retrying = false 
            ORDER BY id ASC 
            LIMIT 1
        `);
        const poolPerEpoch = rows?.length > 0 ? rows[0] : null;
        return poolPerEpoch as PoolPerEpoch | null;
    } catch (error) {
        console.error('getPoolToRetry error', error);
        return null;
    }
}

export const countRewardsPerEpochByPoolId = async (poolId: number): Promise<{ wubi: number, wupi: number }> => {
    try {
        const { rows } = await pool.query(queryCountRewardsPerEpochByPoolId(poolId) as string)
        const docs = rows?.length > 0 ? rows : null
        if (!docs) {
            return {
                wubi: 0,
                wupi: 0
            }
        }
        return {
            wubi: docs?.find(doc => doc.type === 'wUBI')?.total_rewards ?? 0,
            wupi: docs?.find(doc => doc.type === 'wUPI')?.total_rewards ?? 0
        }

    } catch (error) {
        console.error('countRewardsPerEpochByPoolId error', error);
        return {
            wubi: 0,
            wupi: 0
        }
    }
}