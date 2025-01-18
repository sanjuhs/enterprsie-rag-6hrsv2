import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function QueryDashboard() {
  const [query, setQuery] = useState<string>("");
  const [naturalQuery, setNaturalQuery] = useState<string>("");
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSQL, setGeneratedSQL] = useState<string>("");

  const handleNaturalQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/db/natural-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: naturalQuery }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ""));
      }

      setGeneratedSQL(data.sql);
      setQuery(data.sql);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate SQL");
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/db/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ""));
      }

      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="natural" className="w-full">
        <TabsList>
          <TabsTrigger value="natural">Natural Language</TabsTrigger>
          <TabsTrigger value="sql">SQL</TabsTrigger>
        </TabsList>

        <TabsContent value="natural">
          <div className="space-y-4">
            <Textarea
              placeholder="Ask your question in plain English..."
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              className="h-32"
            />
            <div className="flex justify-between items-center">
              <Button
                onClick={handleNaturalQuery}
                disabled={loading || !naturalQuery.trim()}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate SQL
              </Button>
            </div>

            {generatedSQL && (
              <div className="space-y-2">
                <h3 className="font-medium">Generated SQL:</h3>
                <div className="h-[200px] border rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="sql"
                    value={query}
                    onChange={(value) => setQuery(value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: "on",
                    }}
                  />
                </div>
                <Button
                  onClick={handleRunQuery}
                  disabled={loading || !query.trim()}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Run Query
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sql">
          <div className="h-[400px] border rounded-lg overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="sql"
              value={query}
              onChange={(value) => setQuery(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center">
        {error && <div className="text-red-500 text-sm">Error: {error}</div>}
      </div>

      {results.length > 0 && (
        <div className="mt-4 overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(results[0]).map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value, i) => (
                    <TableCell key={i}>{String(value)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
