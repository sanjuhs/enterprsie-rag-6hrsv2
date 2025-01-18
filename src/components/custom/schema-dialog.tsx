import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableInfo } from "@/app/types/database";

interface SchemaDialogProps {
  table: TableInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SchemaDialog({ table, open, onOpenChange }: SchemaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schema: {table.table_name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Column</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Constraints</th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((column) => (
                <tr key={column.name} className="border-b">
                  <td className="py-2">{column.name}</td>
                  <td className="py-2">{column.type}</td>
                  <td className="py-2">
                    {!column.isNullable && "NOT NULL"}
                    {column.hasDefault &&
                      column.defaultValue &&
                      ` DEFAULT ${column.defaultValue}`}
                    {column.isPrimaryKey && " PRIMARY KEY"}
                    {column.isUnique && " UNIQUE"}
                    {column.isForeignKey &&
                      column.referenceTable &&
                      column.referenceColumn &&
                      ` REFERENCES ${column.referenceTable}(${column.referenceColumn})`}
                    {column.isForeignKey &&
                      column.onDelete &&
                      ` ON DELETE ${column.onDelete}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
