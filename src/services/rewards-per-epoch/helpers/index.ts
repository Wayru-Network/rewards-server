import { ENV } from "@config/env/env"
import { RewardPerEpochEntry } from "@interfaces/rewards-per-epoch"

export const rewardsPerEpochTable = ENV.REWARDS_MODE === 'production' ? 'rewards_per_epoches' : 'rewards_per_epoch_tests'

export const insertRewardsPerEpochNFNodeLinksQuery = (rewardsPerEpochId: number, nfnodeId: number) => {
    switch (ENV.REWARDS_MODE) {
        case 'production':
            return `INSERT INTO rewards_per_epoches_nfnode_links (rewards_per_epoch_id, nfnode_id)
            VALUES (${rewardsPerEpochId}, ${nfnodeId})`
        case 'test':
            return `INSERT INTO rewards_per_epoch_tests_nfnode_links (rewards_per_epoch_test_id, nfnode_id)
            VALUES (${rewardsPerEpochId}, ${nfnodeId})`
        default:
            throw new Error('Invalid rewards mode')
    }
}

export const insertRewardsPerEpochPoolPerEpochLinksQuery = (rewardsPerEpochId: number, poolPerEpochId: number) => {
    switch (ENV.REWARDS_MODE) {
        case 'production':
            return `INSERT INTO rewards_per_epoches_pool_per_epoch_links
            (rewards_per_epoch_id, pool_per_epoch_id)
            VALUES (${rewardsPerEpochId}, ${poolPerEpochId})`
        case 'test':
            return `INSERT INTO rewards_per_epoch_tests_pool_per_epoch_test_links
            (rewards_per_epoch_test_id, pool_per_epoch_test_id)
            VALUES (${rewardsPerEpochId}, ${poolPerEpochId})`
        default:
            throw new Error('Invalid rewards mode')
    }
}

export const returnRewardsPerEpochQuery = (rewardsPerEpochId: number) => {
    switch (ENV.REWARDS_MODE) {
        case 'production':
            return `
            SELECT 
                rpe.*,
                n.id as nfnode_id,
                ppe.id as pool_per_epoch_id
            FROM rewards_per_epoches rpe
            LEFT JOIN rewards_per_epoches_nfnode_links rnl ON rnl.rewards_per_epoch_id = rpe.id
            LEFT JOIN nfnodes n ON n.id = rnl.nfnode_id
            LEFT JOIN rewards_per_epoches_pool_per_epoch_links rpel ON rpel.rewards_per_epoch_id = rpe.id
            LEFT JOIN pool_per_epoch ppe ON ppe.id = rpel.pool_per_epoch_id
            WHERE rpe.id = ${rewardsPerEpochId}
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
            WHERE rpe.id = ${rewardsPerEpochId}
        `
        default:
            throw new Error('Invalid rewards mode')
    }
}

export const sumAllNetworkScoresQuery = (type: RewardPerEpochEntry['type'], poolPerEpochId: number) => {
    switch (ENV.REWARDS_MODE) {
        case 'production':
            return `
            SELECT 
                SUM(rpe.hotspot_score) as network_score
            FROM rewards_per_epoches rpe
            INNER JOIN rewards_per_epoches_pool_per_epoch_links rel 
            ON rel.rewards_per_epoch_id = rpe.id
            WHERE rel.pool_per_epoch_id = ${poolPerEpochId}
                AND rpe.type = '${type}'  
            `
        case 'test':
            return `
            SELECT 
                SUM(rpe.hotspot_score) as network_score
            FROM rewards_per_epoch_tests rpe
            INNER JOIN rewards_per_epoch_tests_pool_per_epoch_test_links rel 
                ON rel.rewards_per_epoch_test_id = rpe.id
            WHERE rel.pool_per_epoch_test_id = ${poolPerEpochId}
                AND rpe.type = '${type}'  
            `
        default:
            throw new Error('Invalid rewards mode')
    }
}

export const checkExistingRewardQuery = (nfnode: number, type: RewardPerEpochEntry['type'], poolPerEpochId: number) => {
    switch (ENV.REWARDS_MODE) {
        case 'production':
            return `
             SELECT rpe.id 
            FROM rewards_per_epoches rpe
            JOIN rewards_per_epoches_nfnode_links nfnode_link 
            ON rpe.id = nfnode_link.rewards_per_epoch_id
            JOIN rewards_per_epoches_pool_per_epoch_links pool_link 
                ON rpe.id = pool_link.rewards_per_epoch_id
            WHERE nfnode_link.nfnode_id = ${nfnode} 
                AND rpe.type = '${type}' 
                AND pool_link.pool_per_epoch_id = ${poolPerEpochId}`
        case 'test':
            return `
            SELECT rpe.id 
            FROM rewards_per_epoch_tests rpe
            JOIN rewards_per_epoch_tests_nfnode_links nfnode_link 
            ON rpe.id = nfnode_link.rewards_per_epoch_test_id
            JOIN rewards_per_epoch_tests_pool_per_epoch_test_links pool_link 
                ON rpe.id = pool_link.rewards_per_epoch_test_id
            WHERE nfnode_link.nfnode_id = ${nfnode} 
                AND rpe.type = '${type}' 
                AND pool_link.pool_per_epoch_test_id = ${poolPerEpochId}
            `
        default:
            throw new Error('Invalid rewards mode')
    }
}