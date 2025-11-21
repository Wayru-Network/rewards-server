import { NfNode, NFNodeEntryDetails } from "@interfaces/nfnodes"
import { getNFNodeById, getNfNodeByWayruDeviceId, getWayruOsLicenseByNFNodeId, verifyInitializedNFNodeTx } from "./queries"
import { fetchNFNodeEntryWithRetry } from "@services/solana/reward-system/reward-system.service"
import { RewardSystem } from "@interfaces/reward-system/reward-system"
import { Program } from "@coral-xyz/anchor"
import { ENV } from "@config/env/env"
import moment from "moment"

export const getNfNodeMultiplier = (nfnode: Pick<NfNode, 'model'>) => multipliers[nfnode?.model || ''] || 1

const multipliers: { [key: string]: number } = {
    BYOD: 1,
    Apocalypse: 1.25,
    Eclypse: 1.5,
    Prometheus: 2,
    Genesis: 3,
    Odyssey: 5,
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

const validateWayruOsLicense = async (nfnodeEntry: NFNodeEntryDetails, nfnodeId: number) => {
    const nfnodeType = nfnodeEntry?.nfnodeDetails?.type;
    // if the node is a byod, we need to check if has a active license
    if (nfnodeType && 'byod' in nfnodeType) {
        const license = await getWayruOsLicenseByNFNodeId(nfnodeId);
        if (!license) {
            return {
                isValidLicense: false,
                reason: 'No license found'
            }
        }
        // unix pay stamp test:
        const unixpaystamp = license.unixpaystamp;

        // Calculate the expiration date by adding the license days
        const expirationDate = moment.unix(unixpaystamp).add(license.days, 'days');
        // Check if the license has expired
        const isExpired = !moment().isBefore(expirationDate);
        if (isExpired) {
            return {
                isValidLicense: false,
                reason: 'License expired for nfnode id: ' + nfnodeId
            }
        }

        return {
            isValidLicense: true,
            reason: 'License is valid for nfnode id: ' + nfnodeId
        }
    }
    return {
        isValidLicense: true,
        reason: 'License is valid'
    }
}

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

        // if the reward system program is disabled, we need to check if the nfnode
        // has been initialized into the tx tracker
        if (ENV.DISABLED_REWARD_PROGRAM === 'true') {
            const tx = await verifyInitializedNFNodeTx(nfnode.id);
            if (!tx) {
                return { isEligible: false, reason: 'NFNode not initialized' };
            }
            return { isEligible: true, reason: 'NFNode initialized into tx tracker' };
        }

        // if the solana env is devnet or the reward system program
        //  is not initialized, we consider the node eligible
        if (ENV.SOLANA_ENV === 'devnet' || !rewardSystemProgram) {
            return { isEligible: true };
        }

        const nfnodeEntry = await fetchNFNodeEntryWithRetry(nfnode.solana_asset_id, rewardSystemProgram);
        if (!nfnodeEntry) {
            return {
                isEligible: false,
                reason: 'No reward system entry found'
            };
        }

        // validate deposit amount
        const { isValidDeposit, reason: depositReason } = validateDepositAmount(nfnodeEntry);
        if (!isValidDeposit) {
            return {
                isEligible: false,
                reason: depositReason
            };
        }

        // validate wayru os license
        const { isValidLicense, reason: licenseReason } = await validateWayruOsLicense(nfnodeEntry, nfnode.id);
        if (!isValidLicense) {
            return {
                isEligible: false,
                reason: licenseReason
            };
        }

        // nfnode is eligible
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
): Promise<{ isEligible: boolean; nfnode: Pick<NfNode, 'id' | 'wayru_device_id' | 'model' | 'solana_asset_id'|'latitude'|'longitude'> }> => {
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
): Promise<{ isEligible: boolean; nfnode: Pick<NfNode, 'id' | 'wayru_device_id' | 'model' | 'solana_asset_id'|'latitude'|'longitude'> }> => {
    const nfnode = await getNFNodeById(nfnodeId);
    const { isEligible, reason } = await checkNFNodeEligibility(
        nfnode,
        rewardSystemProgram
    );
    return { isEligible, nfnode };
};