import pool from "@config/db"
import { NfNode, WubiNFNodes, WupiNFNodes } from "@interfaces/nfnodes"

/**
 * Get all active wubi nf nodes
 * The wubi nodes are the ones that are active and have not a nfnode_type of 'don'
 * @returns NfNode[]
 */
export const getActiveWubiNfNodes = async () => {
  const { rows } = await pool.query(`
        SELECT n.id, n.wayru_device_id
        FROM nfnodes AS n
        WHERE n.status = 'active'
        AND n.wayru_device_id IS NOT NULL
        AND n.asset_id IS NOT NULL
        ORDER BY n.id ASC
      `)
  //TODO: change asset_id to solana_asset_id
  return rows as WubiNFNodes[]
}

/**
 * Get all active wupi nf nodes
 * The wupi nodes are the ones that are active and have a nfnode_type of 'don'
 * @returns NfNode[]
 */
export const getActiveWupiNfNodes = async () => {
  const { rows } = await pool.query(`
        SELECT n.id, n.mac
        FROM nfnodes AS n
        WHERE n.status = 'active'
        AND n.mac IS NOT NULL
        AND n.asset_id IS NOT NULL
        ORDER BY n.id ASC
      `)
  //TODO: change asset_id to solana_asset_id
  return rows as WupiNFNodes[]
}

export const getNfNodeByWayruDeviceId = async (wayruDeviceId: string) => {
  const { rows } = await pool.query(`
        SELECT * FROM nfnodes WHERE wayru_device_id = $1
      `, [wayruDeviceId])
  const document = rows?.length ? rows[0] : null
  return document as NfNode
}

export const getNFNodeById = async (id: number) => {
  const { rows } = await pool.query(`
        SELECT * FROM nfnodes WHERE id = $1
      `, [id])
  return rows[0] as NfNode
}
