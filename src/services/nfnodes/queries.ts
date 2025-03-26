import pool from "@config/db"
import { NfNode, NFNodeIdAndWayruDeviceId } from "@interfaces/nfnodes"

/**
 * Get all active wubi nf nodes
 * The wubi nodes are the ones that are active and have a nfnode_type of 'don'
 * @returns NfNode[]
 */
export const getActiveWubiNfNodes = async () => {
  const { rows } = await pool.query(`
        SELECT n.id, n.wayru_device_id
        FROM nfnodes AS n
        WHERE n.status = 'active'
        AND n.wayru_device_id IS NOT NULL
        AND n.asset_id IS NOT NULL
        AND (n.nfnode_type = 'don' OR n.nfnode_type IS NULL)
        ORDER BY n.id ASC
      `)
  return rows as NFNodeIdAndWayruDeviceId[]
}

/**
 * Get all active wupi nf nodes
 * The wupi nodes are the ones that are active and have not a nfnode_type of 'don'
 * @returns NfNode[]
 */
export const getActiveWupiNfNodes = async () => {
  const { rows } = await pool.query(`
        SELECT n.id, n.wayru_device_id
        FROM nfnodes AS n
        WHERE n.status = 'active'
        AND n.wayru_device_id IS NOT NULL
        AND n.asset_id IS NOT NULL
        AND (n.nfnode_type != 'don' OR n.nfnode_type IS NULL)
        ORDER BY n.id ASC
      `)
  return rows as NFNodeIdAndWayruDeviceId[]
}

export const getNfNodeByWayruDeviceId = async (wayruDeviceId: string) => {
  const { rows } = await pool.query(`
        SELECT * FROM nfnodes WHERE wayru_device_id = $1
      `, [wayruDeviceId])
  const document = rows?.length ? rows[0] : null
  return document as NfNode
}

export const getNfNodeMultiplier = (nfnode: NfNode) => multipliers[nfnode?.model || ''] || 1


const multipliers: { [key: string]: number } = {
  BYOD: 1,
  Apocalypse: 1.25,
  Eclypse: 1.5,
  Prometheus: 2,
  Genesis: 3,
}