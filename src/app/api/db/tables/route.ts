import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRESDB_URL,
});

export async function GET() {
  try {
    const client = await pool.connect();

    try {
      // Query to get all table names and their columns
      const query = `
        SELECT 
          table_name,
          ARRAY_AGG(
            json_build_object(
              'name', column_name,
              'type', data_type
            )
          ) as columns
        FROM information_schema.columns
        WHERE table_schema = 'public'
        GROUP BY table_name;
      `;

      const result = await client.query(query);

      return NextResponse.json({
        tables: result.rows.map((row) => ({
          table_name: row.table_name,
          columns: row.columns,
        })),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch database tables" },
      { status: 500 }
    );
  }
}
