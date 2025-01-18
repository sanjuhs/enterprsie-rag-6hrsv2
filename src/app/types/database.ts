export interface ColumnDefinition {
  name: string;
  type: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
  hasDefault: boolean;
  defaultValue?: string;
  isForeignKey: boolean;
  referenceTable?: string;
  referenceColumn?: string;
  onDelete?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
}

export const COLUMN_TYPES = [
  "SERIAL",
  "INTEGER",
  "BIGINT",
  "TEXT",
  "VARCHAR",
  "BOOLEAN",
  "TIMESTAMP",
  "DATE",
  "JSONB",
  "vector",
  "NUMERIC",
  "UUID",
  "BYTEA", // for crypto fields
] as const;

export const ON_DELETE_ACTIONS = [
  "CASCADE",
  "SET NULL",
  "RESTRICT",
  "NO ACTION",
] as const;

export interface TableInfo {
  table_name: string;
  columns: ColumnDefinition[];
}
