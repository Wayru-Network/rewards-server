import {
    getRewardsPerEpochToCalculateDepinStakeRewards,
    updateRewardsPerEpochAmount,
} from "@services/rewards-per-epoch/queries";
import { createDepinStakeRewards, getHotspotsStakesForNFNode } from "./queries";
import { getPoolPerEpochById } from "@services/pool-per-epoch/queries";
import { calculateRewardsWithDepinStakeMultiplier } from "./helper/calculations";
import { roundDownTo6Decimals } from "@utils/numbers.utils";
import { RewardsPerEpochToCalculateDepinStakeRewards } from "@interfaces/rewards-per-epoch";

export const calculateDepinStakeRewards = async (poolPerEpochId: number) => {
    // 1. Get the pool per epoch
    const poolPerEpoch = await getPoolPerEpochById(poolPerEpochId);
    if (!poolPerEpoch) {
        console.error(
            "pool per epoch not found at the calculate depin stake rewards service"
        );
        return;
    }
    const totalsNetworkScore = {
        wUPI: poolPerEpoch.network_score_upi,
        wUBI: poolPerEpoch.network_score,
    };
    const totalsPoolAmount = {
        wUPI: poolPerEpoch.upi_pool,
        wUBI: poolPerEpoch.ubi_pool,
    };

    // 2. Get the rewards per epoch to calculate depin stake rewards
    const rewardsPerEpoches =
        await getRewardsPerEpochToCalculateDepinStakeRewards(poolPerEpochId);

    // 3. For each reward per epoch, calculate the depin stake reward
    console.log("rewardsPerEpoches", rewardsPerEpoches?.length);
    for (const item of rewardsPerEpoches) {
        const {
            type,
            nfnode_id,
            hotspot_score: nfnodeScore,
            amount: totalAmountPerRewardPerEpoch,
            depin_stake_multiplier,
        } = item;
        const rewardType = type as keyof typeof totalsNetworkScore;

        const totalPoolAmount = totalsPoolAmount[rewardType];
        // Total network score includes depin stake multiplier
        const totalPoolNetworkScore = totalsNetworkScore[rewardType];

        // Calculate depin stake rewards using the helper function
        // stakerRewards: the rewards for the stakers: 80% of the total amount for stakers rewards
        // hotspotRewards: the rewards of the hotspot + 20% of the stakers rewards
        const { stakerRewards, hotspotRewards } =
            calculateRewardsWithDepinStakeMultiplier({
                totalPoolNetworkScore,
                totalPoolAmount,
                nfnodeScore,
                depin_stake_multiplier,
                totalAmountPerRewardPerEpoch,
            });

        //Update the rewards per epoch amount with the hotspotRewards
        await updateRewardsPerEpochAmount({
            rewardsPerEpochId: item.id,
            amount: hotspotRewards,
            totalAmountWithDepinStake: totalAmountPerRewardPerEpoch
        });

        // assign the rewards to the nfnode
        await assignDepinStakeRewardsToNFNode({
            nfnodeId: nfnode_id,
            stakerRewards,
            type: type as Exclude<
                RewardsPerEpochToCalculateDepinStakeRewards["type"],
                "wUBI+wUPI"
            >,
            poolPerEpochId,
        });
    }
};

const assignDepinStakeRewardsToNFNode = async ({
    nfnodeId,
    stakerRewards,
    type,
    poolPerEpochId,
}: {
    nfnodeId: number;
    stakerRewards: number;
    type: Exclude<
        RewardsPerEpochToCalculateDepinStakeRewards["type"],
        "wUBI+wUPI"
    >;
    poolPerEpochId: number;
}) => {
    // Get all stakers of the hotspot
    const stakers = await getHotspotsStakesForNFNode(nfnodeId);

    // Calculate total stake amount (sum of all staked amounts)
    const totalStakeAmount = stakers.reduce(
        (sum, staker) => sum + staker.amount,
        0
    );

    // If total stake is 0, return early to avoid division by zero
    if (totalStakeAmount === 0) {
        console.log(`Total stake amount is 0 for nfnode ${nfnodeId}`);
        return;
    }

    // Distribute rewards proportionally based on each staker's stake amount
    const stakerRewardsDistribution = stakers.map((staker) => {
        // Calculate the fraction of total stake this staker has (value between 0 and 1)
        // Example: if staker has 25 and total is 100, stakeFraction = 0.25 (which is 25%)
        const stakeFraction = staker.amount / totalStakeAmount;

        // Calculate the reward amount for this staker
        // Example: if stakerRewards = 50 and stakeFraction = 0.25, then reward = 50 * 0.25 = 12.5
        const stakerRewardAmountRaw = stakerRewards * stakeFraction;
        // Round down to 6 decimals to match the system's precision
        const stakerRewardAmount = Number(
            roundDownTo6Decimals(stakerRewardAmountRaw)
        );

        return {
            hotspotStakeId: staker.id,
            stakedAmount: staker.amount,
            stakeFraction, // Fraction between 0 and 1 (e.g., 0.25 = 25%)
            rewardAmount: stakerRewardAmount,
        };
    });

    //create the rewards
    for (const item of stakerRewardsDistribution) {
        await createDepinStakeRewards({
            nfnodeId,
            type,
            poolPerEpochId,
            rewardAmount: item.rewardAmount,
            hotspotStakeId: item.hotspotStakeId,
        });
    }
};
