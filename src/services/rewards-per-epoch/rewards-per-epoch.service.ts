import pool from "@config/db";
import { UpdatePoolNetworkScoreResponse } from "@interfaces/pool-per-epoch";
import { roundDownTo6Decimals } from "@utils/numbers.utils";


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
                    UPDATE rewards_per_epoches  
                    SET amount = $1,
                        status = 'ready-for-claim',
                        owner_payment_status = 'pending',
                        host_payment_status = 'pending'
                    WHERE id = $2
                `,
                values: [amount, reward.id]
            };
        });

    await Promise.all(updateQueries.map(query => pool.query(query.text, query.values)));
}