import { RewardPerEpochEntry } from "@interfaces/rewards-per-epoch";

type ProcessingStatus = "sending_messages" | "messages_sent" | "receiving_messages" | "messages_received" | "processing_messages" | "messages_processed" | "messages_not_sent"
export interface PoolPerEpoch {
    id: number;
    epoch: Date;
    ubi_pool: number
    upi_pool: number
    network_score: number
    network_score_upi: number
    processing_metrics?: {
        [key: string]: unknown
    },
    wubi_nfnodes_with_score: number,
    wupi_nfnodes_with_score: number,
    wubi_nfnodes_total: number,
    wupi_nfnodes_total: number,
    wubi_processing_status: ProcessingStatus,
    wupi_processing_status: ProcessingStatus,
    wubi_messages_received: number,
    wupi_messages_received: number,
    wubi_messages_sent: number,
    wupi_messages_sent: number,
    wubi_error_message?: string,
    wupi_error_message?: string,
    wubi_retry_count?: number,
    wupi_retry_count?: number,
    is_retrying?: boolean,
    total_hotspot_pool?: number
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

export type BatchProgress = {
    current: number;
    total: number;
    percentage: number;
    isLastMessage: boolean;
}


export interface AnalyzePoolStatus {
    needsRetry: boolean,
    type?: 'send_wupi_messages' | 'send_wubi_messages' | 'send_wupi_rewards' | 'send_wubi_rewards'
}