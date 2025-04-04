import pool from "@config/db"
import { Key } from "@interfaces/keys"

export const getKey = async (key: string) : Promise<Key | null> => {
   const client = await pool.connect()
   const result = await client.query('SELECT * FROM keys WHERE name = $1', [key])
   client.release()
   const document = result?.rows?.length ? result.rows[0] : null
   return document
}

