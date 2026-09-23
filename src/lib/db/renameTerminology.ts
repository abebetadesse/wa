/**
 * One-off, idempotent rename of legacy table/column names to the platform terminology:
 *   health -> wellbeing, clinical -> scientific, clinician -> practitioner,
 *   clinical_effect -> physiological_effect.
 * Also repairs names produced by an earlier faulty find-replace (Welbeing/Debral/Debrian).
 * Only renames objects that exist and whose target name is free. Run with:
 *   npm run db:rename-terms            (dry run)
 *   npm run db:rename-terms -- --apply
 */
import mysql from "mysql2/promise";

const APPLY = process.argv.includes("--apply");

export function toPlatformName(name: string): string {
  return name
    .replace(/welbeing/gi, "wellbeing")
    .replace(/debrian/gi, "practitioner")
    .replace(/(clinical|debral)_effect/gi, "physiological_effect")
    .replace(/debral/gi, "scientific")
    .replace(/clinician/gi, "practitioner")
    .replace(/clinical/gi, "scientific")
    .replace(/health(?!care)/gi, "wellbeing");
}

async function main() {
  const url = process.env.DATABASE_URL || "mysql://root:root@localhost:3306/ethio_wellness";
  const conn = await mysql.createConnection(url);
  const pattern = "health|clinical|clinician|welbeing|debral|debrian";
  try {
    const [tables] = await conn.query<mysql.RowDataPacket[]>(
      "SELECT TABLE_NAME AS t FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()",
    );
    const existing = new Set(tables.map((r) => String(r.t)));

    for (const t of [...existing]) {
      if (!new RegExp(pattern, "i").test(t)) continue;
      const next = toPlatformName(t);
      if (next === t) continue;
      if (existing.has(next)) { console.warn(`skip table ${t}: ${next} already exists`); continue; }
      console.log(`table  ${t} -> ${next}`);
      if (APPLY) await conn.query(`RENAME TABLE \`${t}\` TO \`${next}\``);
      existing.delete(t); existing.add(next);
    }

    const [cols] = await conn.query<mysql.RowDataPacket[]>(
      "SELECT TABLE_NAME AS t, COLUMN_NAME AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME REGEXP ?",
      [pattern],
    );
    for (const { t, c } of cols) {
      const table = APPLY ? toPlatformName(String(t)) : String(t);
      const next = toPlatformName(String(c));
      if (next === c) continue;
      console.log(`column ${table}.${c} -> ${next}`);
      if (APPLY) await conn.query(`ALTER TABLE \`${table}\` RENAME COLUMN \`${c}\` TO \`${next}\``);
    }
    if (!APPLY) console.log("Dry run only. Re-run with --apply to rename.");
  } finally {
    await conn.end();
  }
}

if (process.argv[1]?.includes("renameTerminology")) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
