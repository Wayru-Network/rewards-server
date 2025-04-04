import { ENV } from "@config/env/env"
import { Keypair } from "@solana/web3.js"
import { base58 } from '@metaplex-foundation/umi/serializers';


const key = ENV.SOLANA_API_KEY
const api_url = ENV.SOLANA_API_URL
export const SOLANA_API_URL = ((key && api_url) ? `${process.env.SOLANA_API_URL}?api-key=${key}` : process.env.SOLANA_API_URL) ?? 'http://localhost:8899'

export const getKeyPair = async (private_key: string): Promise<Keypair> => {
    const keypair = Keypair.fromSeed(base58.serialize(private_key).slice(0, 32))
  return keypair
}

