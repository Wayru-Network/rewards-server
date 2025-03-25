

export interface PoolPerEpoch {
    id: number;
    epoch: Date;
    ubi_pool: number
    upi_pool: number
    network_score: number
    network_score_upi: number
}


export type PoolPerEpochEntry = Omit<PoolPerEpoch, 'id'>