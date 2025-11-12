import { getKey } from "@services/keys/queries";
import { BoostStakeManager } from "./boost-stake.manager";
import { PublicKey } from "@solana/web3.js";

export const getBoostSystemProgramId = async () => {
  const key = await getKey("BOOST_STAKE_PROGRAM_ID");
  // default reward system program id if there is no key
  const DEFAULT_BOOST_STAKE_PROGRAM_ID =
    process.env.DEFAULT_BOOST_STAKE_PROGRAM_ID ||
    "44op5JkWQ4KjXNphN5jWxFssvz6iAXYKJZnVZgPLXUXq";
  const boostStakeProgramId = key?.value ?? DEFAULT_BOOST_STAKE_PROGRAM_ID;
  // remove all spaces
  return boostStakeProgramId.replace(/\s/g, "");
};


export const getBoostStakeMultiplier = async (solanaAssetId: string) => {
  const entry = await getBoostStakeEntry(solanaAssetId);
  if (!entry) {
    return 1;
  }

  console.log('boost stake entry found', entry)

  const multiplier = (entry?.depositAmount / 100000) + 1;
  // if multiplier is greater than 2, It will be 2
  console.log('multiplier', multiplier)
  return multiplier > 2 ? 2 : multiplier;
};


export const getBoostStakeEntry = async (solanaAssetId: string) => {
  try {
    const program = await BoostStakeManager.getInstance();
    const [nfnodeEntryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("nfnode_entry"), new PublicKey(solanaAssetId).toBuffer()],
      program.programId
    );
    const stakeEntry = await program?.account.nfNodeEntry.fetch(nfnodeEntryPDA);

    if (!stakeEntry) {
      return undefined;
    }

    return {
      depositAmount: stakeEntry?.depositAmount?.toNumber() / 1_000_000,
      depositUnixTimestamp: stakeEntry?.depositTimestamp?.toNumber(),
    };
  } catch (error) {
    console.info(
      "🚨 Error getting stake program state entry",
      error instanceof Error ? error.message : "Unknown error"
    );
    return undefined;
  }
};
