import { NextResponse } from "next/server";
import { Pool } from "pg";
// import { sql } from "@vercel/postgres";

const pool = new Pool({
  connectionString: process.env.POSTGRESDB_URL,
});

// Helper function to sanitize table name to prevent SQL injection
const sanitizeIdentifier = (identifier: string) => {
  return identifier.replace(/[^a-zA-Z0-9_]/g, "");
};

// Add this interface
interface ColumnValue {
  string: string;
  number: number;
  boolean: boolean;
  timestamp: Date;
}

export async function GET(
  request: Request,
  context: { params: { tableName: string } }
) {
  const { tableName } = await context.params;
  const sanitizedTableName = sanitizeIdentifier(tableName);

  try {
    const client = await pool.connect();
    try {
      const columnQuery = `
        SELECT column_name, data_type, column_default, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
      `;
      const columnResult = await client.query(columnQuery, [
        sanitizedTableName,
      ]);

      const dataQuery = `SELECT * FROM "${sanitizedTableName}"`;
      const dataResult = await client.query(dataQuery);

      return NextResponse.json({
        data: dataResult.rows,
        columns: columnResult.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch table data" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { tableName: string } }
) {
  const { tableName } = await context.params;
  const sanitizedTableName = sanitizeIdentifier(tableName);

  try {
    const client = await pool.connect();
    const data = await request.json();

    try {
      // Filter out empty values and get column information
      const filteredData: Partial<Record<keyof ColumnValue, unknown>> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== "") {
          // Preserve the original column casing
          filteredData[key as keyof ColumnValue] = value;
        }
      }

      const columns = Object.keys(filteredData);
      const values = Object.values(filteredData);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

      const query = `
        INSERT INTO "${sanitizedTableName}" ("${columns.join('", "')}")
        VALUES (${placeholders})
        RETURNING *;
      `;

      const result = await client.query(query, values);
      return NextResponse.json({ data: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to insert data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { tableName: string } }
) {
  const { tableName } = await context.params;
  const sanitizedTableName = sanitizeIdentifier(tableName);

  try {
    const client = await pool.connect();
    const { id, data } = await request.json();

    try {
      const filteredData: Partial<Record<keyof ColumnValue, unknown>> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== "" && key !== "id") {
          filteredData[key as keyof ColumnValue] = value;
        }
      }

      const updates = Object.keys(filteredData)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(", ");

      const values = [id, ...Object.values(filteredData)];
      const query = `
        UPDATE "${sanitizedTableName}"
        SET ${updates}
        WHERE id = $1
        RETURNING *;
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to update data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { tableName: string } }
) {
  const { tableName } = await context.params;
  const sanitizedTableName = sanitizeIdentifier(tableName);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      const query = `
        DELETE FROM "${sanitizedTableName}"
        WHERE id = $1
        RETURNING *;
      `;

      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
