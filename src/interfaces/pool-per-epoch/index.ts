import { RewardPerEpochEntry } from "@interfaces/rewards-per-epoch";

type PoolPerEpochStatus = 'ready-for-claim' | 'processing'
export interface PoolPerEpoch {
    id: number;
    epoch: Date;
    ubi_pool: number
    upi_pool: number
    network_score: number
    network_score_upi: number
    status?: PoolPerEpochStatus
    processing_metrics?: {
        [key: string]: unknown
      }
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