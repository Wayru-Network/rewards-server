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