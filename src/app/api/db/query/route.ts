import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRESDB_URL,
});

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const client = await pool.connect();

    try {
      const result = await client.query(query);
      return NextResponse.json({ results: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to execute query",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
