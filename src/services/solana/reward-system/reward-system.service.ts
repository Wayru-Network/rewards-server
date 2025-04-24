import { Program } from "@coral-xyz/anchor";
import { NFNodeEntry, NFNodeEntryDetails } from "@interfaces/nfnodes";
import { RewardSystem } from "@interfaces/reward-system/reward-system";
import { getKey } from "@services/keys/queries";
import { PublicKey } from "@solana/web3.js";

export const getRewardSystemProgramId = async () => {
    const key = await getKey('REWARD_SYSTEM_PROGRAM_ID')
    // default reward system program id if there is no key
    const DEFAULT_REWARD_SYSTEM_PROGRAM_ID = process.env.DEFAULT_REWARD_SYSTEM_PROGRAM_ID || 'DGkrN8CiTvRSZbqa7rZjKJ5SHEmMm9Q7JMDjKubidhtV'
    const rewardSystemProgramId = key?.value ?? DEFAULT_REWARD_SYSTEM_PROGRAM_ID
    // remove all spaces
    return rewardSystemProgramId.replace(/\s/g, '')
}

export const getNFNodeEntry = async (solanaAssetId: string, program: Program<RewardSystem>): Promise<NFNodeEntryDetails | undefined> => {
    try {
        const nftMintAddress = new PublicKey(solanaAssetId)
        const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("nfnode_entry"), nftMintAddress.toBuffer()],
            program.programId
        );

        // Get NFNode entry
        const nfNodeEntry = await program.account.nfNodeEntry.fetch(nfnodeEntryPDA);
        if (!nfNodeEntry) {
            return undefined
        }
    
        // Modify formatNFNodeEntry to include the owner
        const formattedEntry = {
            ...formatNFNodeEntry(nfNodeEntry)
        };
        return formattedEntry;
    } catch (error) {
        console.error('❌ Error getting NFNode entry:', error);
        return undefined
    }
}


function formatNFNodeEntry(entry: NFNodeEntry): NFNodeEntryDetails {
    // Utility function to format WAYRU tokens from lamports
    const formatWayruTokens = (amount: number) => amount / 1_000_000; // 6 decimals

    return {
        hostDetails: {
            address: entry.host.toString(),
            profitPercentage: entry.hostShare.toNumber(),
            lastClaimedTimestamp: entry.hostLastClaimedTimestamp.toNumber()
        },
        manufacturerDetails: {
            address: entry.manufacturer.toString(),
            lastClaimedTimestamp: entry.manufacturerLastClaimedTimestamp.toNumber()
        },
        nfnodeDetails: {
            type: entry.nfnodeType,
            depositAmount: formatWayruTokens(entry.depositAmount.toNumber()),
            depositUnixTimestamp: entry.depositTimestamp.toNumber(),
            totalRewardsClaimed: formatWayruTokens(entry.totalRewardsClaimed.toNumber())
        }
    };
}
