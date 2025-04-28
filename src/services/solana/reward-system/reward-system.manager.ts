import { Program } from "@coral-xyz/anchor";
import { RewardSystem } from "@interfaces/reward-system/reward-system";
import { getKeyPair, SOLANA_API_URL } from "@services/solana";
import * as anchor from "@coral-xyz/anchor";
import { ENV } from "@config/env/env";
import { getRewardSystemProgramId } from "./reward-system.service";

/**
 * - This class is used to manage the reward system program
 * - It is a singleton class that can be used to get the instance of the reward system program
 * - It is also used to clean up the reward system program
 * - You can no use it to make transactions because it is only for reading states of the program
 */
export class RewardSystemManager {
    private static instance: Program<RewardSystem> | null = null;
    private static isInitializing: boolean = false;

    static async getInstance(): Promise<Program<RewardSystem> | null> {
        if (ENV.REWARDS_MODE === 'test') {
            return null;
        }
        if (RewardSystemManager.instance) {
            return RewardSystemManager.instance;
        }

        if (RewardSystemManager.isInitializing) {
            // await until the instance is initialized
            while (RewardSystemManager.isInitializing) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return RewardSystemManager.instance!;
        }

        RewardSystemManager.isInitializing = true;
        try {
            const connection = new anchor.web3.Connection(SOLANA_API_URL);
            const solana_wallet = await getKeyPair(ENV.SOLANA_PRIVATE_KEY) as unknown as anchor.web3.Keypair;

            const provider = new anchor.AnchorProvider(
                connection,
                new anchor.Wallet(solana_wallet),
                { commitment: "confirmed" }
            );

            const rewardSystemProgramId = await getRewardSystemProgramId();
            const programId = new anchor.web3.PublicKey(rewardSystemProgramId);
            const idl = await anchor.Program.fetchIdl(programId, provider);
            
            if (!idl) {
                console.error('❌ Failed to initialize Reward System Program: IDL not found');
                return null;
            }
            
            RewardSystemManager.instance = await anchor.Program.at(
                programId,
                provider
            ) as Program<RewardSystem>;

            console.log('✅ Reward System Program initialized');
            return RewardSystemManager.instance;
        } catch (error) {
            console.error('Error loading IDL:', error);
            return null;
        } finally {
            RewardSystemManager.isInitializing = false;
        }
    }

    static cleanup() {
        if (RewardSystemManager.instance) {
            // clean up connections if necessary
            RewardSystemManager.instance = null;
            console.log('🧹 Reward System Program cleaned up');
        }
    }
}