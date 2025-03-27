import { RewardPerEpochEntry } from "@interfaces/rewards-per-epoch";


export interface PoolPerEpoch {
    id: number;
    epoch: Date;
    ubi_pool: number
    upi_pool: number
    network_score: number
    network_score_upi: number
}


export type PoolPerEpochEntry = Omit<PoolPerEpoch, 'id'>

export type UpdatePoolNetworkScoreResponse = {
    epoch: PoolPerEpoch
    rewards: {
        id: number;
        hotspot_score: number;
        status: RewardPerEpochEntry['status'];
        type: RewardPerEpochEntry['type'];
    }[]
}