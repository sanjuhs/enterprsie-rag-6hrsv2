import { NextResponse } from "next/server";
import { Pool } from "pg";
import { ColumnDefinition } from "@/app/types/database";

const pool = new Pool({
  connectionString: process.env.POSTGRESDB_URL,
});

interface CreateTableRequest {
  tableName: string;
  columns: ColumnDefinition[];
}

export async function POST(request: Request) {
  try {
    const { tableName, columns } = (await request.json()) as CreateTableRequest;
    const client = await pool.connect();

    try {
      // Build the CREATE TABLE query
      let createTableQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;

      // Add columns
      const columnDefinitions = columns.map((col) => {
        let definition = `  "${col.name}" ${col.type}`;

        // Handle vector dimensions
        if (col.type === "vector") {
          definition += `(${col.defaultValue || "1536"})`;
        }

        // Add constraints
        if (col.isPrimaryKey) definition += " PRIMARY KEY";
        if (col.isUnique) definition += " UNIQUE";
        if (!col.isNullable) definition += " NOT NULL";

        // Handle default values
        if (col.hasDefault) {
          if (col.type === "JSONB") {
            definition += ` DEFAULT '${col.defaultValue || "{}"}'::jsonb`;
          } else if (col.type === "TIMESTAMP") {
            definition += " DEFAULT CURRENT_TIMESTAMP";
          } else if (col.defaultValue) {
            definition += ` DEFAULT ${col.defaultValue}`;
          }
        }

        return definition;
      });

      // Add foreign key constraints
      const foreignKeys = columns
        .filter(
          (col) => col.isForeignKey && col.referenceTable && col.referenceColumn
        )
        .map((col) => {
          return (
            `  FOREIGN KEY ("${col.name}") ` +
            `REFERENCES "${col.referenceTable}"("${col.referenceColumn}")` +
            (col.onDelete ? ` ON DELETE ${col.onDelete}` : "")
          );
        });

      createTableQuery += [...columnDefinitions, ...foreignKeys].join(",\n");
      createTableQuery += "\n);";

      // Execute the query
      await client.query(createTableQuery);

      return NextResponse.json({
        message: "Table created successfully",
        query: createTableQuery,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to create table",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
