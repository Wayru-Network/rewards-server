import { ENV } from "@config/env/env";
import pool from "../../config/db";
import { PoolPerEpoch, PoolPerEpochEntry } from "../../interfaces/pool-per-epoch";
import moment from "moment";

export const getPoolPerEpochById = async (epochId: number): Promise<PoolPerEpoch | null> => {
    try {
        const result = await pool.query('SELECT * FROM pool_per_epoch WHERE epoch_id = $1', [epochId]);
        const document = result?.rows?.length > 0 ? result.rows[0] : null;
        return document;
    } catch (error) {
        console.error('getPoolPerEpoch error', error);
        return null;
    }
}

export const createCurrentPoolPerEpoch = async () : Promise<PoolPerEpoch | null> => {
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
          const result = await pool.query('INSERT INTO pool_per_epoch (epoch, ubi_pool, upi_pool, network_score, network_score_upi) VALUES ($1, $2, $3, $4, $5)', [epochData.epoch, epochData.ubi_pool, epochData.upi_pool, epochData.network_score, epochData.network_score_upi]);

          // return the document created
          return result?.rows.length > 0 ? result.rows[0] : null
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

export const getPoolPerEpochAmounts = async (epoch: Date) => {
    try {
        const period = ENV.REWARDS_PERIOD
        const epochNumber = await getPoolPerEpochNumber(epoch)
        const epochYear = period === 'mainnet' ? Math.ceil(epochNumber / 365) : Math.ceil(epochNumber / 7)
        let ubiPoolPercentage: number
        let upiPoolPercentage: number
        let manufacturersPoolPercentage: number

        switch (epochYear) {
            case 1:
                ubiPoolPercentage = 81
                upiPoolPercentage = 18
                manufacturersPoolPercentage = 1
                break
            case 2:
                ubiPoolPercentage = 63
                upiPoolPercentage = 36
                manufacturersPoolPercentage = 1
                break
            case 3:
                ubiPoolPercentage = 45
                upiPoolPercentage = 54
                manufacturersPoolPercentage = 1
                break
            case 4:
                ubiPoolPercentage = 27
                upiPoolPercentage = 72
                manufacturersPoolPercentage = 1
                break
            case 5:
                ubiPoolPercentage = 9
                upiPoolPercentage = 90
                manufacturersPoolPercentage = 1
                break
            case 6:
                if (period === 'testnet-2') {
                    ubiPoolPercentage = 27
                    upiPoolPercentage = 72
                    manufacturersPoolPercentage = 1
                    break
                } else {
                    ubiPoolPercentage = 9
                    upiPoolPercentage = 90
                    manufacturersPoolPercentage = 1
                    break
                }

            case 7:
                if (period === 'testnet-2') {
                    ubiPoolPercentage = 45
                    upiPoolPercentage = 54
                    manufacturersPoolPercentage = 1
                    break

                } else {
                    ubiPoolPercentage = 9
                    upiPoolPercentage = 90
                    manufacturersPoolPercentage = 1
                    break
                }
            case 8:
                if (period === 'testnet-2') {
                    ubiPoolPercentage = 63
                    upiPoolPercentage = 36
                    manufacturersPoolPercentage = 1
                    break

                } else {
                    ubiPoolPercentage = 9
                    upiPoolPercentage = 90
                    manufacturersPoolPercentage = 1
                    break
                }
            case 9:
                if (period === 'testnet-2') {

                    ubiPoolPercentage = 81
                    upiPoolPercentage = 18
                    manufacturersPoolPercentage = 1
                    break
                } else {
                    ubiPoolPercentage = 9
                    upiPoolPercentage = 90
                    manufacturersPoolPercentage = 1
                    break
                }
            default:
                ubiPoolPercentage = 9
                upiPoolPercentage = 90
                manufacturersPoolPercentage = 1
                break
        }
        const epochAmount = period === 'mainnet' ? BigInt(getPoolPerEpochAmount(epochNumber)) : getTestnetAmount(epochNumber)
        const upiAmount = BigInt((BigInt(epochAmount) * BigInt(upiPoolPercentage)) / BigInt(100))
        const ubiAmount = BigInt((BigInt(epochAmount) * BigInt(ubiPoolPercentage)) / BigInt(100))

        const manufacturersAmount = epochAmount - upiAmount - ubiAmount
        return { ubiAmount, upiAmount, manufacturersAmount, epochAmount }
    } catch (error) {
        console.error('getPoolPerEpochAmounts error', error);
        return null;
    }
}

export const getPoolPerEpochAmount = (epochNumber: number) => {
    if (epochNumber === 0) {
        return BigInt(0)
    }
    if (epochNumber === 1) {
        return BigInt(1200000000000)
    } else if (epochNumber === 36525) {
        return BigInt(70630823)
    } else if (epochNumber > 36525) {
        return BigInt(0)
    }

    const reductionPercentage = 0.999733349023419
    return BigInt((1200000000000 * Math.pow(Number(reductionPercentage), epochNumber - 1)).toFixed(0))
}

export const getTestnetAmount = (epochNumber: number) => (epochNumber > 0 ? BigInt(960000000000) : BigInt(0))

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
            UPDATE pool_per_epoch 
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