import * as anchor from "@coral-xyz/anchor";
import { ENV } from "@config/env/env";
import { BoostStake } from "@interfaces/boost-stake/boost-stake";
import { getSolanaConnection } from "../solana.connection";
import { getKeyPair } from "..";
import { getBoostSystemProgramId } from "./boost-stake.service";

/**
 * - This class is used to manage the boost stake program
 * - It is a singleton class that can be used to get the instance of the boost stake program
 * - It is also used to clean up the boost stake program
 * - You can no use it to make transactions because it is only for reading states of the program
 */
export class BoostStakeManager {
    private static instance: anchor.Program<BoostStake> | null = null;
    private static isInitializing: boolean = false;

    static async getInstance(): Promise<anchor.Program<BoostStake>> {
        if (BoostStakeManager.instance) {
            return BoostStakeManager.instance;
        }

        if (BoostStakeManager.isInitializing) {
            // await until the instance is initialized
            while (BoostStakeManager.isInitializing) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return BoostStakeManager.instance!;
        }

        BoostStakeManager.isInitializing = true;
        try {
            if (!ENV.SOLANA_PRIVATE_KEY) {
                throw new Error("SOLANA_PRIVATE_KEY is not set");
            }
            const connection = getSolanaConnection();
            const adminKeypair = await getKeyPair(ENV.SOLANA_PRIVATE_KEY) as unknown as anchor.web3.Keypair;
            const provider = new anchor.AnchorProvider(
                connection,
                new anchor.Wallet(adminKeypair),
                { commitment: "confirmed" }
            );

            const boostStakeProgramId = await getBoostSystemProgramId();
            const programId = new anchor.web3.PublicKey(boostStakeProgramId);
            const idl = await anchor.Program.fetchIdl(programId, provider);

            if (!idl) {
                console.error('❌ Failed to initialize Boost Stake Program: IDL not found');
                throw new Error('❌ Failed to initialize Boost Stake Program: IDL not found');
            }

            BoostStakeManager.instance = await anchor.Program.at(
                programId,
                provider
            ) as anchor.Program<BoostStake>;

            console.log('✅ Boost Stake Program initialized');
            return BoostStakeManager.instance;
        } catch (error) {
            console.error('Error loading IDL:', error);
            throw new Error('❌ Failed to initialize Boost Stake Program: IDL not found');
        } finally {
            BoostStakeManager.isInitializing = false;
        }
    }

    static cleanup() {
        if (BoostStakeManager.instance) {
            // clean up connections if necessary
            BoostStakeManager.instance = null;
            console.log('🧹 Boost Stake Program cleaned up');
        }
    }
}