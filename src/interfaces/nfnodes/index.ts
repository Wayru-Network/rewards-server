import { BN } from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js"

export type NfNodeStatus = "active" | "frozen" | "inactive" | "migrated"
export type NFNodeType = 'don' | 'byod' | 'wayruHotspot'

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
    nas_id?: string
}

export type NfNodeEntry = Omit<NfNode, 'id'>

export type WubiNFNodes = Pick<NfNode, 'id' | 'wayru_device_id'>
export type WupiNFNodes = Pick<NfNode, 'id' | 'mac' | 'nas_id'>


export type NFNodeEntryDetails = {
    ownerDetails: {
        lastClaimedTimestamp: number;
        address: string;
    };
    hostDetails: {
        address: string;
        profitPercentage: number;
        lastClaimedTimestamp: number;
    };
    manufacturerDetails: {
        address: string;
        lastClaimedTimestamp: number;
    };
    nfnodeDetails: {
        type: { don: {} } | { byod: {} } | { wayruHotspot: {} };
        depositAmount: number
        depositUnixTimestamp: number;
        totalRewardsClaimed: number
    };
};


export type NFNodeEntry = {
    ownerLastClaimedTimestamp: BN;
    host: PublicKey;
    hostShare: BN;
    hostLastClaimedTimestamp: BN;
    manufacturer: PublicKey;
    manufacturerLastClaimedTimestamp: BN;
    totalRewardsClaimed: BN;
    depositAmount: BN;
    depositTimestamp: BN;
    nfnodeType: Record<NFNodeType, {}>;
};

export type NFNodeRewardType = 'wubi' | 'wupi';
export interface NFNodeEligibilityConfig {
    requiredDepositAmount: number;
    type: NFNodeRewardType;
}