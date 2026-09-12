import { KnowledgeDocument, isKnowledgeStrand } from "./catalog";
import { KnowledgeStrandType } from "./types";

export const KNOWLEDGE_CSV_HEADERS = [
  "strand",
  "version",
  "description",
  "category_id",
  "category_name",
  "category_description",
  "use_cases",
  "item_json",
] as const;

function parseCsvRows(csv: string): string[][] {
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

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function createKnowledgeCsvTemplate(strand: KnowledgeStrandType): string {
  const example = [
    strand,
    "2.0.0",
    `Enhanced ${strand} knowledge`,
    "example_category",
    "Example Category",
    "Replace with the category description",
    "Use case one|Use case two",
    JSON.stringify({ name: "Example item", description: "Replace with strand-specific data" }),
  ];

  return `${KNOWLEDGE_CSV_HEADERS.join(",")}\n${example.map(escapeCsv).join(",")}\n`;
}

export function knowledgeDocumentFromCsv(csv: string): KnowledgeDocument {
  const rows = parseCsvRows(csv);
  if (rows.length < 2) throw new Error("CSV must include a header row and at least one data row");

  const headers = rows[0].map((header) => header.trim());
  const missingHeaders = KNOWLEDGE_CSV_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`CSV is missing required columns: ${missingHeaders.join(", ")}`);
  }

  const indexOf = (header: string) => headers.indexOf(header);
  const strand = rows[1][indexOf("strand")]?.trim();
  if (!isKnowledgeStrand(strand)) throw new Error("CSV contains an invalid strand");

  const categories = new Map<string, {
    id: string;
    name: string;
    description: string;
    use_cases: string[];
    data: Record<string, unknown>[];
  }>();
  let version = "";
  let description = "";

  rows.slice(1).forEach((row, rowOffset) => {
    const rowNumber = rowOffset + 2;
    const rowStrand = row[indexOf("strand")]?.trim();
    if (rowStrand !== strand) throw new Error(`Row ${rowNumber} has a different strand`);

    version = row[indexOf("version")]?.trim() || version;
    description = row[indexOf("description")]?.trim() || description;
    const categoryId = row[indexOf("category_id")]?.trim();
    const categoryName = row[indexOf("category_name")]?.trim();
    const categoryDescription = row[indexOf("category_description")]?.trim();
    if (!categoryId || !categoryName || !categoryDescription) {
      throw new Error(`Row ${rowNumber} is missing category metadata`);
    }

    let item: Record<string, unknown>;
    try {
      item = JSON.parse(row[indexOf("item_json")] || "{}");
    } catch {
      throw new Error(`Row ${rowNumber} has invalid item_json`);
    }
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Row ${rowNumber} item_json must contain an object`);
    }

    const existing = categories.get(categoryId) || {
      id: categoryId,
      name: categoryName,
      description: categoryDescription,
      use_cases: (row[indexOf("use_cases")] || "").split("|").map((value) => value.trim()).filter(Boolean),
      data: [],
    };
    existing.data.push(item);
    categories.set(categoryId, existing);
  });

  return { strand, version, description, categories: [...categories.values()] };
}
