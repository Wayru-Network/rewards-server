import { NfNode, NFNodeEntryDetails } from "@interfaces/nfnodes"
import { getNFNodeById, getNfNodeByWayruDeviceId } from "./queries"
import { getNFNodeEntry } from "@services/solana/reward-system/reward-system.service"
import { RewardSystem } from "@interfaces/reward-system/reward-system"
import { Program } from "@coral-xyz/anchor"
import { ENV } from "@config/env/env"

export const getNfNodeMultiplier = (nfnode: Pick<NfNode, 'model'>) => multipliers[nfnode?.model || ''] || 1

const multipliers: { [key: string]: number } = {
    BYOD: 1,
    Apocalypse: 1.25,
    Eclypse: 1.5,
    Prometheus: 2,
    Genesis: 3,
}


const validateDepositAmount = (nfnodeEntry: NFNodeEntryDetails) => {
    const nfnodeType = nfnodeEntry?.nfnodeDetails?.type;

    if (nfnodeType && 'don' in nfnodeType) {
        return {
            isValidDeposit: nfnodeEntry.nfnodeDetails.depositAmount === 0,
            reason: 'Invalid deposit amount. Expected: 0, Got: ${nfnodeEntry.nfnodeDetails.depositAmount}'
        }
    } else {
        return {
            isValidDeposit: nfnodeEntry.nfnodeDetails.depositAmount === 5000,
            reason: 'Invalid deposit amount. Expected: 5000, Got: ${nfnodeEntry.nfnodeDetails.depositAmount}'
        }
    }
}

// Function to check if a node is eligible for rewards
const checkNFNodeEligibility = async (
    nfnode: Pick<NfNode, 'id' | 'wayru_device_id' | 'model' | 'solana_asset_id'>,
    rewardSystemProgram: Program<RewardSystem> | null,
): Promise<{ isEligible: boolean; reason?: string }> => {
    try {
        if (!nfnode) {
            return {
                isEligible: false,
                reason: 'NFNode not found'
            };
        }

        if (ENV.SOLANA_ENV === 'devnet' || !rewardSystemProgram) {
            return { isEligible: true };
        }

        const nfnodeEntry = await getNFNodeEntry(nfnode.solana_asset_id, rewardSystemProgram);
        if (!nfnodeEntry) {
            return {
                isEligible: false,
                reason: 'No reward system entry found'
            };
        }

        const { isValidDeposit, reason } = validateDepositAmount(nfnodeEntry);

        if (!isValidDeposit) {
            return {
                isEligible: false,
                reason: reason
            };
        }

        return { isEligible: true };
    } catch (error) {
        console.log(`Error checking ${nfnode.wayru_device_id} eligibility:`, error);
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
): Promise<{ isEligible: boolean; nfnode: Pick<NfNode, 'id' | 'wayru_device_id' | 'model' | 'solana_asset_id'> }> => {
    const nfnode = await getNfNodeByWayruDeviceId(wayruDeviceId);
    const { isEligible, reason } = await checkNFNodeEligibility(
        nfnode,
        rewardSystemProgram
    );
    return { isEligible, nfnode };
};

// Function to get eligible WUPI nodes (uses nfnodeId)
export const getEligibleWupiNFNodes = async (
    nfnodeId: number,
    rewardSystemProgram: Program<RewardSystem> | null
): Promise<{ isEligible: boolean; nfnode: Pick<NfNode, 'id' | 'wayru_device_id' | 'model' | 'solana_asset_id'> }> => {
    const nfnode = await getNFNodeById(nfnodeId);
    const { isEligible, reason } = await checkNFNodeEligibility(
        nfnode,
        rewardSystemProgram
    );
    return { isEligible, nfnode };
};