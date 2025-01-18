"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateTableDialog } from "@/components/custom/create-table-dialog";
import { SchemaDialog } from "@/components/custom/schema-dialog";
import { ColumnDefinition } from "@/app/types/database";

interface TableInfo {
  table_name: string;
  columns: ColumnDefinition[];
}

interface TableData {
  [key: string]: string | number | boolean | null;
}

export default function DBPlayground() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [insertData, setInsertData] = useState<Record<string, string>>({});
  const [insertDialogOpen, setInsertDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState<Record<string, string>>({});
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");
  const [schemaDialogOpen, setSchemaDialogOpen] = useState(false);
  const [selectedTableForSchema, setSelectedTableForSchema] =
    useState<TableInfo | null>(null);
  const [selectedTableForInsert, setSelectedTableForInsert] =
    useState<TableInfo | null>(null);
  const [deleteTableDialogOpen, setDeleteTableDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/db/tables");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTables(data.tables);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const viewTableData = async (tableName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/db/tables/${tableName}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTableData(data.data);
      setSelectedTable(tableName);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch table data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = async (tableName: string) => {
    setLoading(true);
    setError(null);
    try {
      // Filter out empty values for optional fields
      const filteredData: Record<string, string> = {};
      for (const [key, value] of Object.entries(insertData)) {
        if (value !== "") {
          filteredData[key] = value;
        }
      }

      const response = await fetch(`/api/db/tables/${tableName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ""));
      }

      // Refresh table data and close dialog
      await viewTableData(tableName);
      setInsertDialogOpen(false);
      setInsertData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to insert data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (tableName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/db/tables/${tableName}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: updateData.id,
          data: updateData,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ""));
      }

      await viewTableData(tableName);
      setUpdateDialogOpen(false);
      setUpdateData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tableName: string, id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/db/tables/${tableName}?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ""));
      }

      await viewTableData(tableName);
      setDeleteDialogOpen(false);
      setDeleteId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/db/tables/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ""));
      }

      await fetchTables();
      setDeleteTableDialogOpen(false);
      setTableToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Database Playground</h1>

      <Tabs defaultValue="quick-functions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="quick-functions">Quick Functions</TabsTrigger>
          <TabsTrigger value="query-dashboard">Query Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-functions">
          <Card>
            <CardHeader>
              <CardTitle>Quick Database Operations</CardTitle>
              <CardDescription>
                Perform common database operations with a single click
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <CreateTableDialog onTableCreated={fetchTables} />
                  <Button onClick={fetchTables} disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    List All Tables
                  </Button>
                </div>

                {error && (
                  <div className="text-red-500 text-sm mt-2">
                    Error: {error}
                  </div>
                )}

                {tables.length > 0 && (
                  <div className="mt-6 space-y-6">
                    {tables.map((table) => (
                      <div
                        key={table.table_name}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {table.table_name}
                            </h3>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedTableForSchema(table);
                                setSchemaDialogOpen(true);
                              }}
                            >
                              View Schema
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setTableToDelete(table.table_name);
                              setDeleteTableDialogOpen(true);
                            }}
                          >
                            Delete Table
                          </Button>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewTableData(table.table_name)}
                          >
                            View Data
                          </Button>

                          <Dialog
                            open={insertDialogOpen}
                            onOpenChange={setInsertDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedTableForInsert(table);
                                  setInsertData({});
                                }}
                              >
                                Insert
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Insert Data into{" "}
                                  {selectedTableForInsert?.table_name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                {selectedTableForInsert?.columns.map(
                                  (column) => (
                                    <div
                                      key={column.name}
                                      className="grid gap-2"
                                    >
                                      <Label htmlFor={column.name}>
                                        {column.name} ({column.type})
                                      </Label>
                                      <Input
                                        id={column.name}
                                        value={insertData[column.name] || ""}
                                        onChange={(e) =>
                                          setInsertData((prev) => ({
                                            ...prev,
                                            [column.name]: e.target.value,
                                          }))
                                        }
                                        placeholder={`Enter ${column.type}`}
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                              <Button
                                onClick={() =>
                                  selectedTableForInsert &&
                                  handleInsert(
                                    selectedTableForInsert.table_name
                                  )
                                }
                                disabled={loading || !selectedTableForInsert}
                              >
                                {loading && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Insert Data
                              </Button>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={updateDialogOpen}
                            onOpenChange={setUpdateDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setUpdateData(
                                    Object.fromEntries(
                                      Object.entries(row).map(([k, v]) => [
                                        k,
                                        String(v ?? ""),
                                      ])
                                    )
                                  );
                                  setUpdateDialogOpen(true);
                                }}
                              >
                                Update
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Update Data in {table.table_name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="id">ID</Label>
                                  <Input
                                    id="id"
                                    value={updateData.id || ""}
                                    onChange={(e) =>
                                      setUpdateData((prev) => ({
                                        ...prev,
                                        id: e.target.value,
                                      }))
                                    }
                                    placeholder="Enter ID to update"
                                  />
                                </div>
                                {table.columns.map(
                                  (column) =>
                                    column.name !== "id" && (
                                      <div
                                        key={column.name}
                                        className="grid gap-2"
                                      >
                                        <Label htmlFor={column.name}>
                                          {column.name} ({column.type})
                                        </Label>
                                        <Input
                                          id={column.name}
                                          value={updateData[column.name] || ""}
                                          onChange={(e) =>
                                            setUpdateData((prev) => ({
                                              ...prev,
                                              [column.name]: e.target.value,
                                            }))
                                          }
                                          placeholder={`Enter new ${column.type}`}
                                        />
                                      </div>
                                    )
                                )}
                              </div>
                              <Button
                                onClick={() => handleUpdate(table.table_name)}
                                disabled={loading || !updateData.id}
                              >
                                {loading && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Update Data
                              </Button>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={deleteDialogOpen}
                            onOpenChange={setDeleteDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => {
                                  setSelectedTable(table.table_name);
                                }}
                              >
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Delete Data from {table.table_name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="deleteId">ID to Delete</Label>
                                  <Input
                                    id="deleteId"
                                    value={deleteId}
                                    onChange={(e) =>
                                      setDeleteId(e.target.value)
                                    }
                                    placeholder="Enter ID to delete"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-3 justify-end">
                                <Button
                                  variant="ghost"
                                  onClick={() => setDeleteDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    handleDelete(table.table_name, deleteId)
                                  }
                                  disabled={loading || !deleteId}
                                >
                                  {loading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  )}
                                  Delete Record
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {selectedTable === table.table_name &&
                          tableData.length > 0 && (
                            <div className="mt-4 overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    {Object.keys(tableData[0]).map((column) => (
                                      <TableHead key={column}>
                                        {column}
                                      </TableHead>
                                    ))}
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tableData.map((row, index) => (
                                    <TableRow key={index}>
                                      {Object.values(row).map((value, i) => (
                                        <TableCell key={i}>
                                          {String(value)}
                                        </TableCell>
                                      ))}
                                      <TableCell>
                                        <div className="flex gap-2">
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                              setUpdateData(
                                                Object.fromEntries(
                                                  Object.entries(row).map(
                                                    ([k, v]) => [
                                                      k,
                                                      String(v ?? ""),
                                                    ]
                                                  )
                                                )
                                              );
                                              setUpdateDialogOpen(true);
                                            }}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() => {
                                              setDeleteId(String(row.id ?? ""));
                                              setDeleteDialogOpen(true);
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query-dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Query Dashboard</CardTitle>
              <CardDescription>Coming soon...</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedTableForSchema && (
        <SchemaDialog
          table={selectedTableForSchema}
          open={schemaDialogOpen}
          onOpenChange={setSchemaDialogOpen}
        />
      )}

      <Dialog
        open={deleteTableDialogOpen}
        onOpenChange={setDeleteTableDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Table</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete table &quot;{tableToDelete}&quot;?
            </p>
            <p className="text-red-500 text-sm mt-2">
              This action cannot be undone and will delete all data in the
              table.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteTableDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => tableToDelete && handleDeleteTable(tableToDelete)}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Table
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
