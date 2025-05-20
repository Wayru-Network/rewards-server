import {  Commitment } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { SOLANA_API_URL } from '.';

/**
 * Singleton class to manage Solana RPC connection
 * Provides a single reusable connection instance with automatic renewal
 */
class SolanaConnection {
    private static instance: anchor.web3.Connection | null = null;
    private static lastInitTime: number = 0;
    private static readonly RECONNECT_INTERVAL = 1000 * 60 * 30; // 30 minutes

    private constructor() {} // Private constructor for Singleton pattern

    /**
     * Gets the Solana connection instance
     * Creates a new connection if none exists or if the current one is older than RECONNECT_INTERVAL
     * @returns {Connection} The Solana connection instance
     */
    public static getInstance(): anchor.web3.Connection {
        const currentTime = Date.now();

        // Create new connection if none exists or if it's time to renew
        if (!SolanaConnection.instance || (currentTime - SolanaConnection.lastInitTime) > SolanaConnection.RECONNECT_INTERVAL) {
        
            
            SolanaConnection.instance = new anchor.web3.Connection(SOLANA_API_URL, {
                commitment: 'confirmed',
                disableRetryOnRateLimit: false,
                confirmTransactionInitialTimeout: 60000
            });
            SolanaConnection.lastInitTime = currentTime;
        }

        return SolanaConnection.instance;
    }

    /**
     * Forces creation of a new connection instance
     * Useful when current connection is having issues
     */
    public static resetConnection(): void {
        SolanaConnection.instance = null;
        SolanaConnection.getInstance();
    }
}

/**
 * Helper function to get a Solana connection with optional commitment level
 * @param {Commitment} commitment - Optional commitment level for the connection
 * @returns {Connection} Solana connection instance
 */
export const getSolanaConnection = (commitment: Commitment = 'confirmed'): anchor.web3.Connection => {
    const connection = SolanaConnection.getInstance();
    if (commitment) {
        return new anchor.web3.Connection(connection.rpcEndpoint, { commitment });
    }
    return connection;
};