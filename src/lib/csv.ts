/** RFC 4180 CSV parsing and writing shared by every import/export. */

export function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const next = csv[index + 1];

    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }

  return rows;
}

/** Rows keyed by the header line. Cells holding JSON (objects, arrays, numbers, booleans) are decoded. */
export function parseCsvRecords(csv: string): Record<string, unknown>[] {
  const [header, ...rows] = parseCsvRows(csv.replace(/^﻿/, ""));
  if (!header) return [];
  const keys = header.map((key) => key.trim());
  return rows.map((row) =>
    Object.fromEntries(keys.map((key, index) => [key, decodeCell(row[index] ?? "")])),
  );
}

function decodeCell(value: string): unknown {
  const trimmed = value.trim();
  if (/^[[{]/.test(trimmed) || /^(true|false|null|-?\d+(\.\d+)?)$/.test(trimmed)) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}

/** One CSV cell. Objects are JSON-encoded; leading formula characters are neutralised for spreadsheets. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text =
    value instanceof Date ? value.toISOString() : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/^[=+\-@\t\r]/.test(text) && !/^-?\d+(\.\d+)?$/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return [header.map(csvCell).join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\n");
}
