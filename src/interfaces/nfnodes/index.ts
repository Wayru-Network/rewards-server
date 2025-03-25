export type NfNodeStatus = "active" | "frozen" | "inactive" | "migrated"

export interface NfNode {
    id: number
    asset_id: number
    status: NfNodeStatus
    wayru_device_id: string,
    mac: string,
    serial: string,
    model: string,
    open_wisp_uuid: string
    last_seen: Date
    open_wisp_key: string
    name: string
    latitude: number
    longitude: number
    os_version: string
    os_service_version: string[]
    wallet: string
    solana_asset_id: string
    created_at: Date
    updated_at: Date
}

export type NfNodeEntry = Omit<NfNode, 'id'>

export type NFNodeIdAndWayruDeviceId = Pick<NfNode, 'id' | 'wayru_device_id'>
