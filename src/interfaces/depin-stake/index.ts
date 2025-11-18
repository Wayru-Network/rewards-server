import { RewardsPerEpochToCalculateDepinStakeRewards } from "@interfaces/rewards-per-epoch";


export interface CreateDepinStakeRewards {
    nfnodeId: number;
    type: Exclude<RewardsPerEpochToCalculateDepinStakeRewards['type'], 'wUBI+wUPI'>;
    poolPerEpochId: number;
    rewardAmount: number;
    hotspotStakeId: number;
}