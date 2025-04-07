import { ENV } from "@config/env/env"
import { RewardPerEpochEntry } from "@interfaces/rewards-per-epoch"

export const poolPerEpochTable = ENV.REWARDS_MODE === 'production' ? 'pool_per_epoch' : 'pool_per_epoch_tests'

export const selectRewardsByPoolPerEpochIdQuery = (poolPerEpochId: number, type: RewardPerEpochEntry['type']) => {
    switch (ENV?.REWARDS_MODE) {
        case 'production':
            return `
       SELECT 
        rpe.id,
        rpe.hotspot_score,
        rpe.status,
        rpe.type
    FROM rewards_per_epoches rpe
    INNER JOIN rewards_per_epoches_pool_per_epoch_links rel 
        ON rel.rewards_per_epoch_id = rpe.id
    WHERE rel.pool_per_epoch_id = ${poolPerEpochId}
        AND rpe.type = '${type}'
        AND rpe.status = 'calculating'
        AND rpe.hotspot_score > 0
    `
        case 'test':
            return `
            SELECT 
                rpe.*,
                n.id as nfnode_id,
                ppet.id as pool_per_epoch_test_id
            FROM rewards_per_epoch_tests rpe
            LEFT JOIN rewards_per_epoch_tests_nfnode_links rnl ON rnl.rewards_per_epoch_test_id = rpe.id
            LEFT JOIN nfnodes n ON n.id = rnl.nfnode_id
            LEFT JOIN rewards_per_epoch_tests_pool_per_epoch_test_links rpel ON rpel.rewards_per_epoch_test_id = rpe.id
            LEFT JOIN pool_per_epoch_tests ppet ON ppet.id = rpel.pool_per_epoch_test_id
            WHERE rpel.pool_per_epoch_test_id = ${poolPerEpochId}
                AND rpe.type = '${type}'
                AND rpe.status = 'calculating'
                AND rpe.hotspot_score > 0
            `
        default:
            throw new Error('Invalid rewards mode')
    }
}

export const queryCountRewardsPerEpochByPoolId = (poolId: number) => {
    try {
        switch (ENV.REWARDS_MODE) {
            case 'production':
                return `
                     SELECT 
                        rpe.type,
                        COUNT(*) as total_rewards
                    FROM rewards_per_epoches rpe
                    INNER JOIN rewards_per_epoches_pool_per_epoch_links link 
                        ON rpe.id = link.rewards_per_epoch_id
                    INNER JOIN pool_per_epochs ppe 
                        ON link.pool_per_epoch_id = ppe.id
                WHERE ppe.id = ${poolId}
                GROUP BY 
                    rpe.type`
            case 'test':
                return `
                    SELECT 
                        rpe.type,
                        COUNT(*) as total_rewards
                    FROM rewards_per_epoch_tests rpe
                INNER JOIN rewards_per_epoch_tests_pool_per_epoch_test_links link 
                    ON rpe.id = link.rewards_per_epoch_test_id
                INNER JOIN pool_per_epoch_tests ppe 
                    ON link.pool_per_epoch_test_id = ppe.id
                WHERE ppe.id = ${poolId}
                GROUP BY 
                    rpe.type`
            default:
                throw new Error('Invalid rewards mode')
        }
    } catch (error) {
        console.error('countRewardsPerEpochByPoolId error', error);
        return null;
    }
}