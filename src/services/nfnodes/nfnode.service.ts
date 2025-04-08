import { NfNode, NFNodeEligibilityConfig, NFNodeRewardType } from "@interfaces/nfnodes"
import { getNFNodeById, getNfNodeByWayruDeviceId } from "./queries"
import { getNFNodeEntry } from "@services/solana/reward-system/reward-system.service"
import { RewardSystem } from "@interfaces/reward-system/reward-system"
import { Program } from "@coral-xyz/anchor"
import { ENV } from "@config/env/env"

export const getNfNodeMultiplier = (nfnode: NfNode) => multipliers[nfnode?.model || ''] || 1

const multipliers: { [key: string]: number } = {
  BYOD: 1,
  Apocalypse: 1.25,
  Eclypse: 1.5,
  Prometheus: 2,
  Genesis: 3,
}

const ELIGIBILITY_CONFIG: Record<NFNodeRewardType, NFNodeEligibilityConfig> = {
    wubi: {
        requiredDepositAmount: 5000000,
        type: 'wubi'
    },
    wupi: {
        requiredDepositAmount: 0,
        type: 'wupi'
    }
};

// Function to check if a node is eligible for rewards
const checkNFNodeEligibility = async (
    nfnode: NfNode | null,
    type: NFNodeRewardType,
    rewardSystemProgram: Program<RewardSystem> | null,
    validateEntry: boolean = true
): Promise<{ isEligible: boolean; reason?: string }> => {
    try {
        if (!nfnode) {
            return { 
                isEligible: false, 
                reason: 'NFNode not found' 
            };
        }

        if (ENV.SOLANA_ENV !== 'devnet' || !validateEntry || !rewardSystemProgram) {
            return { isEligible: true };
        }

        const nfnodeEntry = await getNFNodeEntry(nfnode.wayru_device_id, rewardSystemProgram);
        if (!nfnodeEntry) {
            return { 
                isEligible: false, 
                reason: 'No reward system entry found' 
            };
        }

        const config = ELIGIBILITY_CONFIG[type];
        const depositAmount = nfnodeEntry?.nfnodeDetails?.depositAmount;

        if (depositAmount !== config.requiredDepositAmount) {
            return { 
                isEligible: false, 
                reason: `Invalid deposit amount. Expected: ${config.requiredDepositAmount}, Got: ${depositAmount}` 
            };
        }

        return { isEligible: true };
    } catch (error) {
        console.error(`Error checking ${type} eligibility:`, error);
        return { 
            isEligible: false, 
            reason: `Error checking eligibility: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
    }
}

// Function to get eligible WUBI nodes (uses wayruDeviceId)
export const getEligibleWubiNFNodes = async (
    wayruDeviceId: string, 
    rewardSystemProgram: Program<RewardSystem> | null,
    validateEntry: boolean = true
): Promise<{ isEligible: boolean; nfnode: NfNode }> => {
    const nfnode = await getNfNodeByWayruDeviceId(wayruDeviceId);
    const { isEligible, reason } = await checkNFNodeEligibility(
        nfnode,
        'wubi',
        rewardSystemProgram,
        validateEntry
    );

    if (!isEligible) {
        console.log(`WUBI node ${wayruDeviceId} not eligible: ${reason}`);
    }

    return {isEligible, nfnode};
};

// Function to get eligible WUPI nodes (uses nfnodeId)
export const getEligibleWupiNFNodes = async (
    nfnodeId: number,
    rewardSystemProgram: Program<RewardSystem>,
    validateEntry: boolean = true
): Promise<{ isEligible: boolean; nfnode: NfNode }> => {
    const nfnode = await getNFNodeById(nfnodeId);
    const { isEligible, reason } = await checkNFNodeEligibility(
        nfnode,
        'wupi',
        rewardSystemProgram,
        validateEntry
    );

    if (!isEligible) {
        console.log(`WUPI node ${nfnodeId} not eligible: ${reason}`);
    }

    return {isEligible, nfnode};
};