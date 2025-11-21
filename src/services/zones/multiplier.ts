import pool from "@config/db"
export async function getZoneMultiplier(lat: number, lng: number): Promise<number> {
    try {
        const result = await pool.query(`
        SELECT multiplier
      FROM regions
      WHERE ST_Within(ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), geom)
      LIMIT 1;
      `);

        if (result.rows.length > 0) {
            return result.rows[0].multiplier;
        } else {
            return 1;
        }
    } catch (err) {
        console.error("❌ Error fetching region multiplier:", (err as Error)?.message);
        return 1; // Return default multiplier in case of an error
    }
}