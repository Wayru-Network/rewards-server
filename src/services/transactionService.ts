import { clusterApiUrl, Connection, Transaction } from "@solana/web3.js";
import { initializeKeypair } from "./initializeKeypair";
const connection = new Connection(clusterApiUrl("devnet"));

export const signTransaction = async (transactionBase64: string) => {
    const adminKeypair = await initializeKeypair(connection)
    const transaction = Transaction.from(Buffer.from(transactionBase64, "base64"));
    transaction.partialSign(adminKeypair);
    return transaction.serialize({ requireAllSignatures: false }).toString("base64");
};
