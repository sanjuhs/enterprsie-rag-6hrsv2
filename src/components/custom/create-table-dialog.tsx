import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  COLUMN_TYPES,
  ON_DELETE_ACTIONS,
  ColumnDefinition,
} from "@/app/types/database";
import { Plus, Trash2 } from "lucide-react";

export function CreateTableDialog({
  onTableCreated,
}: {
  onTableCreated: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addColumn = () => {
    setColumns([
      ...columns,
      {
        name: "",
        type: "TEXT",
        isNullable: true,
        isPrimaryKey: false,
        isUnique: false,
        hasDefault: false,
        isForeignKey: false,
      },
    ]);
  };

  const updateColumn = (index: number, updates: Partial<ColumnDefinition>) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    setColumns(newColumns);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/db/tables/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableName,
          columns,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ""));
      }

      onTableCreated();
      setIsOpen(false);
      setTableName("");
      setColumns([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create New Table</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Table</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tableName">Table Name</Label>
            <Input
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Enter table name"
            />
          </div>

          {columns.map((column, index) => (
            <div key={index} className="grid gap-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Column {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeColumn(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={column.name}
                  onChange={(e) =>
                    updateColumn(index, { name: e.target.value })
                  }
                  placeholder="Column name"
                />
              </div>

              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={column.type}
                  onValueChange={(value) =>
                    updateColumn(index, { type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMN_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`nullable-${index}`}
                    checked={!column.isNullable}
                    onCheckedChange={(checked) =>
                      updateColumn(index, { isNullable: !checked })
                    }
                  />
                  <Label htmlFor={`nullable-${index}`}>Not Null</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`pk-${index}`}
                    checked={column.isPrimaryKey}
                    onCheckedChange={(checked) =>
                      updateColumn(index, { isPrimaryKey: checked })
                    }
                  />
                  <Label htmlFor={`pk-${index}`}>Primary Key</Label>
                </div>
              </div>

              {/* Foreign Key Section */}
              <div className="flex items-center space-x-2">
                <Switch
                  id={`fk-${index}`}
                  checked={column.isForeignKey}
                  onCheckedChange={(checked) =>
                    updateColumn(index, { isForeignKey: checked })
                  }
                />
                <Label htmlFor={`fk-${index}`}>Foreign Key</Label>
              </div>

              {column.isForeignKey && (
                <div className="grid gap-2">
                  <Input
                    placeholder="Reference Table"
                    value={column.referenceTable || ""}
                    onChange={(e) =>
                      updateColumn(index, { referenceTable: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Reference Column"
                    value={column.referenceColumn || ""}
                    onChange={(e) =>
                      updateColumn(index, { referenceColumn: e.target.value })
                    }
                  />
                  <Select
                    value={column.onDelete || "NO ACTION"}
                    onValueChange={(
                      value: (typeof ON_DELETE_ACTIONS)[number]
                    ) => updateColumn(index, { onDelete: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="On Delete Action" />
                    </SelectTrigger>
                    <SelectContent>
                      {ON_DELETE_ACTIONS.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Default Value Section */}
              <div className="flex items-center space-x-2">
                <Switch
                  id={`default-${index}`}
                  checked={column.hasDefault}
                  onCheckedChange={(checked) =>
                    updateColumn(index, { hasDefault: checked })
                  }
                />
                <Label htmlFor={`default-${index}`}>Default Value</Label>
              </div>

              {column.hasDefault && column.type !== "TIMESTAMP" && (
                <Input
                  placeholder="Default value"
                  value={column.defaultValue || ""}
                  onChange={(e) =>
                    updateColumn(index, { defaultValue: e.target.value })
                  }
                />
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addColumn}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>

          {error && (
            <div className="text-red-500 text-sm mt-2">Error: {error}</div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || !tableName || columns.length === 0}
          >
            Create Table
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
