import fs from "node:fs";
import mysql from "mysql2/promise";
const [, , url, file] = process.argv;
const conn = await mysql.createConnection({ uri: url, multipleStatements: false, charset: "utf8mb4" });
const statements = fs.readFileSync(file, "utf8").split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);
let ok = 0; const errors = [];
for (const statement of statements) {
  try { await conn.query(statement); ok++; } catch (e) { errors.push(`${e.code}: ${e.sqlMessage?.slice(0, 160)} :: ${statement.slice(0, 90).replace(/\s+/g, " ")}`); }
}
console.log(`${ok}/${statements.length} statements ok`);
for (const e of errors.slice(0, 25)) console.log(" -", e);
const [v] = await conn.query("select version() v");
console.log("server", v[0].v);
await conn.end();
