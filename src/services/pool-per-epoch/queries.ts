import { ENV } from "@config/env/env";
import pool from "../../config/db";
import { PoolPerEpoch, PoolPerEpochEntry, UpdatePoolNetworkScoreResponse } from "../../interfaces/pool-per-epoch";
import { RewardPerEpochEntry } from "@interfaces/rewards-per-epoch";
import { getPoolPerEpochAmounts } from "./pool-per-epoch.service";
import moment from "moment";
import { poolPerEpochTable, selectRewardsByPoolPerEpochIdQuery } from "./helpers";

export const getPoolPerEpochById = async (epochId: number): Promise<PoolPerEpoch | null> => {
    try {
        const result = await pool.query(`SELECT * FROM ${poolPerEpochTable} WHERE id = $1`, [epochId]);
        const document = result?.rows?.length > 0 ? result.rows[0] : null;
        return document;
    } catch (error) {
        console.error('getPoolPerEpoch error', error);
        return null;
    }
}

export const createCurrentPoolPerEpoch = async (): Promise<PoolPerEpoch | null> => {
    try {
        const lastEpochDateNumber = new Date().setDate(new Date().getDate() - 1)
        const lastEpochDate = new Date(lastEpochDateNumber)
        const formattedEpoch = moment(lastEpochDate).utc().format('YYYY-MM-DD')
        // check if there is a epoch into pool per epoch with this last epoch date
        const poolPerEpoch = await pool.query('SELECT * FROM pool_per_epoch WHERE epoch = $1', [formattedEpoch]);
        if (poolPerEpoch?.rows?.length > 0) {
            return poolPerEpoch.rows[0] as PoolPerEpoch
        }
        const epochAmounts = await getPoolPerEpochAmounts(lastEpochDate)
        const wayruPoolUbi = Number(epochAmounts?.ubiAmount) / 1000000
        const wayruPoolUpi = Number(epochAmounts?.upiAmount) / 1000000
        const epochData: PoolPerEpochEntry = {
            epoch: lastEpochDate,
            ubi_pool: wayruPoolUbi,
            upi_pool: wayruPoolUpi,
            network_score: 0,
            network_score_upi: 0,
        }

        // insert into pool_per_epoch
        const result = await pool.query(`INSERT INTO ${poolPerEpochTable} (epoch, ubi_pool, upi_pool, network_score, network_score_upi, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                epochData.epoch,
                epochData.ubi_pool,
                epochData.upi_pool,
                epochData.network_score,
                epochData.network_score_upi,
                'calculating',
                new Date()]);

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