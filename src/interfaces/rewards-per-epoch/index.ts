type Status = 'calculating' | 'ready-for-claim'
type PaymentStatus = 'pending' | 'failed' | 'paid'
type Type = 'wUBI' | 'wUPI' | 'wUBI+wUPI'

export interface RewardPerEpochEntry {
    type: Type
    pool_per_epoch: number
    amount?: number
    currency?: 'WAYRU'
    hotspot_score: number
    status?: Status
    nfnode: number
    owner_payment_status: PaymentStatus
    host_payment_status: PaymentStatus
}


export interface WUPIMessage {
    nas_id: string
    nfnode_id: number
    total_valid_nas: number
    epoch: Date // date is expected in format 'YYYY-MM-DD'
}

export interface WUPIMessageResponse extends WUPIMessage {
    score: string
}

export interface WUBIMessage {
    wayru_device_id: string
    timestamp: number
    epoch_id: number
    last_item: boolean
}