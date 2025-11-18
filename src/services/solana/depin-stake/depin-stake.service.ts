import { getKey } from "@services/keys/queries";
import { PublicKey } from "@solana/web3.js";
import { DepinProgramManager } from "./depin-stake.manager";

const DEFAULT_DEPIN_STAKE_MULTIPLIER = 1; // 1x
const DEPIN_STAKE_MULTIPLIER_PER_TOKEN = 0.000002;

export const getDepinProgramId = async () => {
    const key = await getKey("DEPIN_PROGRAM_ID");
    // default reward system program id if there is no key
    const DEFAULT_DEPIN_PROGRAM_ID =
        process.env.DEFAULT_DEPIN_PROGRAM_ID ||
        "D1sMCRu3tRwCviHUDj69WrRQzDoVKd2m2YKydRyauYmJ";
    const depinProgramId = key?.value ?? DEFAULT_DEPIN_PROGRAM_ID;
    // remove all spaces
    return depinProgramId.replace(/\s/g, "");
};


export const getDepinStakeMultiplier = async (solanaAssetId: string) => {
    try {
        const entry = await getDepinNfnodeEntry(new PublicKey(solanaAssetId));
        if (!entry) {
            return DEFAULT_DEPIN_STAKE_MULTIPLIER;
        }
        const localValueLockedMultiplier = (entry.localValueLocked * DEPIN_STAKE_MULTIPLIER_PER_TOKEN).toFixed(6)
        // always the multiplier will be greater or equal to 3
        const multiplier = (DEFAULT_DEPIN_STAKE_MULTIPLIER + Number(localValueLockedMultiplier)).toFixed(6)
        return Number(multiplier)
    } catch (error) {
        return DEFAULT_DEPIN_STAKE_MULTIPLIER;
    }
};

export const getDepinNfnodeEntry = async (solanaAssetId: PublicKey) => {
    try {
        const program = await DepinProgramManager.getInstance();
        const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("nfnode_entry"), solanaAssetId.toBuffer()],
            program.programId
        );
        const nfnodeEntry = await program.account.nfNodeEntry.fetch(nfnodeEntryPDA);
        return {
            localValueLocked: nfnodeEntry.localValueLocked.toNumber() / 10 ** 6,
            stakeNftCounter: nfnodeEntry.stakeNftCounter.toNumber()
        } as { localValueLocked: number, stakeNftCounter: number };
    } catch (error) {
        console.info("Error getting Depin Nfnode Entry:", error);
        return undefined;
    }
}

export const calculateDepinStakeEarnings = async (hotspot_score: number, solanaAssetId: string) => {
    const multiplier = await getDepinStakeMultiplier(solanaAssetId);

}
