import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRESDB_URL,
});

const sanitizeIdentifier = (identifier: string) => {
  return identifier.replace(/[^a-zA-Z0-9_]/g, "");
};

export async function POST(request: Request) {
  try {
    const { tableName } = await request.json();
    const sanitizedTableName = sanitizeIdentifier(tableName);
    const client = await pool.connect();

    try {
      const query = `DROP TABLE IF EXISTS "${sanitizedTableName}" CASCADE;`;
      await client.query(query);

      return NextResponse.json({
        message: `Table ${tableName} deleted successfully`,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete table",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
