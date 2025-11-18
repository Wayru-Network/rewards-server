interface CalculateDepinStakeRewardParams {
    totalPoolNetworkScore: number;
    totalPoolAmount: number;
    nfnodeScore: number;
    depin_stake_multiplier: number;
    totalAmountPerRewardPerEpoch: number;
}
export const calculateRewardsWithDepinStakeMultiplier = (
    params: CalculateDepinStakeRewardParams
) => {
    const {
        totalPoolNetworkScore,
        totalPoolAmount,
        nfnodeScore,
        depin_stake_multiplier,
        totalAmountPerRewardPerEpoch,
    } = params;

    // Calculate the base nfnode score without depin stake multiplier
    const baseNfnodeScore = nfnodeScore / depin_stake_multiplier;

    // Calculate what the hotspot would have earned without depin stake multiplier (base reward)
    const baseRewardAmount =
        (baseNfnodeScore / totalPoolNetworkScore) * totalPoolAmount;

    // Calculate the additional reward earned thanks to depin stake multiplier
    const depinStakeBonusAmount =
        totalAmountPerRewardPerEpoch - baseRewardAmount;

    // Calculate staker rewards: 80% of the depin stake bonus goes to stakers
    const stakerRewards = depinStakeBonusAmount * 0.8;

    // Calculate owner depin stake bonus: 20% of the depin stake bonus goes to the owner
    const ownerDepinStakeBonus = depinStakeBonusAmount * 0.2;

    // Calculate total reward for the hotspot owner: base reward + owner's share of depin stake bonus
    const totalHotspotOwnerReward =
        ownerDepinStakeBonus + baseRewardAmount;

    return {
        stakerRewards,
        hotspotRewards: totalHotspotOwnerReward
    }
};
