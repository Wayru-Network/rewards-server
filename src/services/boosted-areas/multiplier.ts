import * as h3 from 'h3-js';
import pool from "@config/db";

export const getBoostedAreasMultiplier = async (nfnId: number) => {
    // Use existing network_clusters table to check if network is in a region
    const { rows } = await pool.query(`
        SELECT nc.region_count
        FROM network_clusters nc
        INNER JOIN networks_nfnode_links nnl ON nnl.nfnode_id = $1
        INNER JOIN networks n ON n.id = nnl.network_id
        WHERE n.enabled = TRUE 
        AND n.type != 'shared'
        AND nc.network_ids @> to_jsonb(ARRAY[n.id])
        AND nc.region_count > 0
        LIMIT 1
    `, [nfnId]);

    console.log('rows', rows)

    if (rows.length === 0 || rows[0].region_count === 0) {
        return 1;
    }

    // If the network is in a cluster with regions, return the appropriate multiplier
    return 1.5; // Adjust the multiplier according to your business logic
};


/*import sql from "./db";
import * as h3 from "h3-js";
export async function generateClustersLikeHex() {
    const resolution = 15;
  
    const result = await sql`
      INSERT INTO network_clusters(
        h_3_index,
        polygon,
        centroid,
        network_ids,
        region_ids,
        count,
        region_count
      )
      WITH
      network_hexes AS (
        SELECT h3_latlng_to_cell(point, ${resolution}) AS h_3_index
        FROM networks
        WHERE enabled = TRUE AND type != 'shared'
      ),
      region_hexes AS (
        SELECT h3_latlng_to_cell(center_point, ${resolution}) AS h_3_index
        FROM regions
        WHERE center_point IS NOT NULL
      ),
      combined_hexes AS (
        SELECT h_3_index FROM network_hexes
        UNION
        SELECT h_3_index FROM region_hexes
      ),
      filtered_hexes AS (
        SELECT DISTINCT h_3_index FROM combined_hexes WHERE h_3_index IS NOT NULL
      ),
      clusters AS (
        SELECT
          h_3_index::bigint,
          ST_SetSRID(h3_cell_to_boundary(h_3_index)::geometry, 4326) AS polygon,
          ST_SetSRID(h3_cell_to_latlng(h_3_index)::geometry, 4326) AS centroid
        FROM filtered_hexes
      ),
      enriched AS (
        SELECT
          c.h_3_index,
          c.polygon,
          c.centroid,
          to_jsonb(ARRAY(
            SELECT id FROM networks
            WHERE enabled = TRUE AND type != 'shared' AND ST_Within(point, c.polygon)
          )) AS network_ids,
          to_jsonb(ARRAY(
            SELECT id FROM regions
            WHERE ST_Within(center_point, c.polygon)
          )) AS region_ids,
          (
            SELECT COUNT(*) FROM networks
            WHERE enabled = TRUE AND type != 'shared' AND ST_Within(point, c.polygon)
          ) AS count,
          (
            SELECT COUNT(*) FROM regions
            WHERE ST_Within(center_point, c.polygon)
          ) AS region_count
        FROM clusters c
      )
      SELECT * FROM enriched
      ON CONFLICT (h_3_index) DO NOTHING;
    `;
  }
(async () => {
    const initialTime = new Date().getTime();
    
        await generateClustersLikeHex();
    
    const resolution = h3.getResolution('8c44a976e8c17ff');
    console.log('resolution:', resolution)
    console.log("✅ All continental clusters generated in ", new Date().getTime() - initialTime, "ms");
    sql.end();
})(); */