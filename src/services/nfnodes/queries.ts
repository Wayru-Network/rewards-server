import pool from "@config/db"
import { NfNode, NfNodeWayruOsLicense, WubiNFNodes, WupiNFNodes } from "@interfaces/nfnodes"

/**
 * Get all active wubi nf nodes for mainnet
 * @returns NfNode[]
 */
export const getActiveWubiNfNodes = async () => {
  const { rows } = await pool.query(`
        SELECT n.id, n.wayru_device_id
        FROM nfnodes AS n
        WHERE n.status = 'active'
        AND n.wayru_device_id IS NOT NULL
        AND n.solana_asset_id IS NOT NULL
        ORDER BY n.id ASC
      `)
  return rows as WubiNFNodes[]
}

/**
 * Get all active wupi nf nodes for mainnet
 * @returns NfNode[]
 */
export const getActiveWupiNfNodes = async () => {
  const { rows } = await pool.query(`
        SELECT n.id, n.mac, n.nas_id
        FROM nfnodes AS n
        WHERE n.status = 'active'
        AND n.mac IS NOT NULL
        AND n.solana_asset_id IS NOT NULL
        ORDER BY n.id ASC
      `)
  return rows as WupiNFNodes[]
}

export const getNfNodeByWayruDeviceId = async (wayruDeviceId: string) => {
  const { rows } = await pool.query(`
        SELECT id, wayru_device_id, model, solana_asset_id FROM nfnodes WHERE wayru_device_id = $1
      `, [wayruDeviceId])
  const document = rows?.length > 0 ? rows[0] : null
  return document as Pick<NfNode, 'id' | 'wayru_device_id' | 'model' | 'solana_asset_id'>
}

export const getNFNodeById = async (id: number) => {
  const { rows } = await pool.query(`
        SELECT id, wayru_device_id, model, solana_asset_id FROM nfnodes WHERE id = $1
      `, [id])
  return rows[0] as Pick<NfNode, 'id' | 'wayru_device_id' | 'model' | 'solana_asset_id'>
}


export const getWayruOsLicenseByNFNodeId = async (nfnodeId: number) => {
  const { rows } = await pool.query(`
    SELECT l.*
    FROM wayru_os_licenses l
    JOIN wayru_os_licenses_nfnode_links ln ON l.id = ln.wayru_os_license_id
    WHERE ln.nfnode_id = $1
    ORDER BY l.id DESC
    LIMIT 1
  `, [nfnodeId]);

  const document = rows?.length > 0 ? rows[0] : null
  return document as NfNodeWayruOsLicense | null
}
