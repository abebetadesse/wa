"use client";

import { useMemo, useRef, useState } from "react";
import { Download, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, buttonClasses, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, ErrorState, Field, Input, LoadingState, PageHeader, PageShell, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useToast } from "@/features/feedback/Toaster";

interface TableInfo {
  name: string;
  label: string;
  description: string;
  key: string[];
  columns: string[];
  json: string[];
}

type Row = Record<string, unknown>;

interface Response {
  table: TableInfo;
  tables: TableInfo[];
  rows: Row[];
}

interface ImportResult {
  saved: number;
  errors: { line: number; message: string }[];
}

const BOOLEAN_COLUMNS = new Set(["validated", "active"]);
const NUMBER_COLUMNS = new Set(["value", "month", "day", "offsetDays", "lengthDays", "untilMonth", "untilDay", "displayOrder", "year"]);
const VISIBLE_ROWS = 200;

/** "entryKey" → "Entry key" */
const heading = (column: string) => column.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).replace(/ ([A-Z])/g, (_m, c: string) => ` ${c.toLowerCase()}`);

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.en === "string") return record.en;
    return JSON.stringify(value);
  }
  return String(value);
}

/** The editable form of a row: JSON columns as pretty text, everything else as typed. */
function toDraft(table: TableInfo, row: Row | null): Record<string, string | boolean> {
  return Object.fromEntries(
    table.columns.map((column) => {
      const value = row?.[column];
      if (BOOLEAN_COLUMNS.has(column)) return [column, row ? Boolean(value) : column === "active"];
      if (table.json.includes(column)) return [column, value === undefined || value === null ? (column.endsWith("s") && !["names", "descriptions", "meanings", "weights", "options", "effects"].includes(column) ? "[]" : "{}") : JSON.stringify(value, null, 2)];
      return [column, value === undefined || value === null ? "" : String(value)];
    }),
  );
}

function fromDraft(table: TableInfo, draft: Record<string, string | boolean>): Row {
  return Object.fromEntries(
    table.columns.map((column) => {
      const value = draft[column];
      if (table.json.includes(column)) {
        try {
          return [column, JSON.parse(String(value || "null"))];
        } catch {
          throw new Error(`${heading(column)} is not valid JSON.`);
        }
      }
      return [column, value];
    }),
  );
}

export default function GuidanceTablesPage() {
  const toast = useToast();
  const [tableName, setTableName] = useState("services");
  const { data, error, reload } = useApi<Response>(`/api/admin/guidance/${tableName}`);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ original: Row | null; draft: Record<string, string | boolean> } | null>(null);
  const [saving, setSaving] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult & { dryRun: boolean } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const table = data?.table.name === tableName ? data.table : null;
  const rows = useMemo(() => {
    if (!data || !table) return [];
    const needle = search.trim().toLowerCase();
    return needle ? data.rows.filter((row) => table.columns.some((c) => cellText(row[c]).toLowerCase().includes(needle))) : data.rows;
  }, [data, table, search]);
  const unvalidated = table?.columns.includes("validated") ? (data?.rows ?? []).filter((row) => !row.validated).length : 0;
  const listColumns = table ? table.columns.filter((c) => !["notes", "descriptions", "options", "data", "effects", "feastDays", "tags", "source"].includes(c)).slice(0, 7) : [];

  function chooseTable(name: string) {
    setTableName(name);
    setSearch("");
    setImportResult(null);
  }

  async function save() {
    if (!table || !editing) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/guidance/${table.name}`, { method: "PUT", json: { row: fromDraft(table, editing.draft) } });
      toast({ tone: "success", title: "Saved" });
      setEditing(null);
      await reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not save", body: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!table || !editing?.original) return;
    if (!window.confirm("Delete this row? This cannot be undone. Default rows are written again the next time the tables load.")) return;
    setSaving(true);
    try {
      const key = Object.fromEntries(table.key.map((k) => [k, editing.original![k]]));
      await apiFetch(`/api/admin/guidance/${table.name}`, { method: "DELETE", json: { key } });
      toast({ tone: "success", title: "Deleted" });
      setEditing(null);
      await reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not delete", body: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function importFile(dryRun: boolean) {
    const file = fileInput.current?.files?.[0];
    if (!table || !file) {
      toast({ tone: "error", title: "Choose a CSV file first" });
      return;
    }
    const form = new FormData();
    form.append("file", file);
    form.append("dryRun", String(dryRun));
    try {
      const result = await apiFetch<ImportResult>(`/api/admin/guidance/${table.name}/csv`, { method: "POST", body: form });
      setImportResult({ ...result, dryRun });
      if (!dryRun) await reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not import", body: errorMessage(err) });
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Administration"
        title="Spiritual guidance tables"
        description="Letter values, stars, weights, feast and fast days, Hijri months and names used by the Spiritual guidance services. Changes apply within seconds, without a code change."
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tables">
            {data.tables.map((t) => (
              <Button key={t.name} role="tab" aria-selected={t.name === tableName} variant={t.name === tableName ? "primary" : "outline"} size="sm" onClick={() => chooseTable(t.name)}>
                {t.label}
              </Button>
            ))}
          </div>

          {!table ? (
            <LoadingState />
          ) : (
            <>
              {unvalidated > 0 && (
                <Alert tone="warning" title={`${unvalidated} of ${data.rows.length} rows are not yet validated`}>
                  Results that use these rows are marked as awaiting expert review. Tick “Validated” once a tradition expert has confirmed a row.
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-brand" aria-hidden="true" /> {table.label}</CardTitle>
                  <CardDescription>{table.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-48 flex-1">
                      <Field label="Search">
                        {(control) => <Input {...control} type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Any text in the row" />}
                      </Field>
                    </div>
                    <Button variant="outline" onClick={() => setEditing({ original: null, draft: toDraft(table, null) })}>
                      <Plus className="size-4" aria-hidden="true" /> Add a row
                    </Button>
                    <a href={`/api/admin/guidance/${table.name}/csv`} className={buttonClasses({ variant: "outline" })}>
                      <Download className="size-4" aria-hidden="true" /> Export CSV
                    </a>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          {listColumns.map((c) => <th key={c} scope="col" className="px-3 py-2 font-semibold">{heading(c)}</th>)}
                          {table.columns.includes("validated") && <th scope="col" className="px-3 py-2 font-semibold">Status</th>}
                        </tr>
                      </thead>
                      <tbody translate="no">
                        {rows.slice(0, VISIBLE_ROWS).map((row, index) => (
                          <tr key={table.key.map((k) => cellText(row[k])).join("|") || index} className="cursor-pointer border-t border-border hover:bg-surface-muted" onClick={() => setEditing({ original: row, draft: toDraft(table, row) })}>
                            {listColumns.map((c) => <td key={c} className="max-w-64 truncate px-3 py-2">{cellText(row[c])}</td>)}
                            {table.columns.includes("validated") && (
                              <td className="px-3 py-2">{row.validated ? <Badge tone="success">Validated</Badge> : <Badge tone="warning">Needs review</Badge>}</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {rows.length > VISIBLE_ROWS ? `Showing ${VISIBLE_ROWS} of ${rows.length} rows; search to narrow the list.` : `${rows.length} rows.`} Click a row to edit it.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Upload className="size-5 text-brand" aria-hidden="true" /> Import from a spreadsheet</CardTitle>
                  <CardDescription>
                    Export the CSV, edit it in Excel or Google Sheets, then save it as “CSV UTF-8” and import it here. Rows with the same key are updated, new rows are added and nothing is deleted. Check the file first to see any problems.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <input ref={fileInput} type="file" accept=".csv,text/csv" className="text-sm" aria-label="CSV file" onChange={() => setImportResult(null)} />
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => importFile(true)}>Check file</Button>
                    <Button onClick={() => importFile(false)}>Import</Button>
                  </div>
                  {importResult && (
                    <Alert tone={importResult.errors.length ? "warning" : "success"} title={importResult.dryRun ? `File checked: ${importResult.errors.length} problem${importResult.errors.length === 1 ? "" : "s"}` : `${importResult.saved} rows imported`}>
                      {importResult.errors.length > 0 && (
                        <ul className="mt-2 list-disc pl-5">
                          {importResult.errors.slice(0, 20).map((e) => <li key={e.line}>Line {e.line}: {e.message}</li>)}
                          {importResult.errors.length > 20 && <li>…and {importResult.errors.length - 20} more.</li>}
                        </ul>
                      )}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {table && editing && (
        <Dialog
          open
          onClose={() => setEditing(null)}
          title={editing.original ? "Edit row" : "Add a row"}
          description={`Key: ${table.key.map(heading).join(", ")}. Saving a row with an existing key replaces that row.`}
          size="lg"
          footer={
            <div className="flex w-full flex-wrap justify-between gap-3">
              {editing.original ? (
                <Button variant="ghost" onClick={remove} disabled={saving}><Trash2 className="size-4" aria-hidden="true" /> Delete</Button>
              ) : <span />}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
              </div>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {table.columns.map((column) => {
              const value = editing.draft[column];
              const set = (next: string | boolean) => setEditing({ ...editing, draft: { ...editing.draft, [column]: next } });
              if (BOOLEAN_COLUMNS.has(column)) {
                return (
                  <label key={column} className="flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(e.target.checked)} /> {heading(column)}
                  </label>
                );
              }
              if (table.json.includes(column)) {
                return (
                  <div key={column} className="sm:col-span-2">
                    <Field label={heading(column)} hint="JSON">
                      {(control) => <Textarea {...control} rows={Math.min(12, String(value).split("\n").length + 1)} className="font-mono text-xs" value={String(value)} onChange={(e) => set(e.target.value)} />}
                    </Field>
                  </div>
                );
              }
              return (
                <Field key={column} label={heading(column)}>
                  {(control) => (
                    <Input
                      {...control}
                      type={NUMBER_COLUMNS.has(column) ? "number" : column === "startDate" ? "date" : "text"}
                      value={String(value)}
                      readOnly={Boolean(editing.original) && table.key.includes(column)}
                      onChange={(e) => set(e.target.value)}
                    />
                  )}
                </Field>
              );
            })}
          </div>
        </Dialog>
      )}
    </PageShell>
  );
}
