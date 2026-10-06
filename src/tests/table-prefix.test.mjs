import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { migrationStatements, prefixedName, prefixLike, prefixStatement, readTablePrefix, trackerTable } from "../../scripts/table-prefix.mjs";

const migrationDir = path.resolve("drizzle-mysql");
const files = fs.readdirSync(migrationDir).filter((name) => /^\d{4}_.+\.sql$/.test(name)).sort();
const read = (name) => fs.readFileSync(path.join(migrationDir, name), "utf8");

test("prefix: only a short lowercase word ending in an underscore is accepted", () => {
  assert.equal(readTablePrefix(""), "");
  assert.equal(readTablePrefix(undefined), readTablePrefix(process.env.DB_TABLE_PREFIX));
  assert.equal(readTablePrefix(" wa_ "), "wa_");
  for (const bad of ["wa", "WA_", "wa__", "1wa_", "wa-", "wa_;drop", "averyveryverylongprefix_"]) assert.throws(() => readTablePrefix(bad), /not valid/, bad);
  assert.equal(trackerTable(""), "_applied_sql");
  assert.equal(trackerTable("wa_"), "wa__applied_sql");
  assert.equal(prefixLike("wa_"), "wa\\_%", "the underscore must not act as a LIKE wildcard");
});

test("prefix: without one, migrations run exactly as written", () => {
  for (const name of files) {
    const plain = read(name).split(/-->\s*statement-breakpoint/).map((part) => part.trim()).filter(Boolean);
    assert.deepEqual(migrationStatements(read(name), ""), plain);
  }
});

test("prefix: every table and foreign key in the checked-in migrations is renamed, nothing else", () => {
  const tables = new Set(files.flatMap((name) => [...read(name).matchAll(/CREATE TABLE `([^`]+)`/g)].map((match) => match[1])));
  assert.ok(tables.size >= 99);
  let foreignKeys = 0;
  for (const name of files) {
    for (const statement of migrationStatements(read(name), "wa_")) {
      // Every identifier in a table position carries the prefix …
      for (const match of statement.matchAll(/(?:CREATE TABLE|ALTER TABLE|REFERENCES|INDEX `[^`]+` ON)\s+`([^`]+)`/g)) {
        assert.ok(match[1].startsWith("wa_") && tables.has(match[1].slice(3)), `${match[1]} in ${name}`);
      }
      // … foreign keys too, because their names are unique per database …
      for (const match of statement.matchAll(/CONSTRAINT `([^`]+)` FOREIGN KEY/g)) {
        foreignKeys++;
        assert.ok(match[1].startsWith("wa_"), match[1]);
      }
      // … and nothing is renamed twice or grows past MySQL's limit.
      assert.ok(!statement.includes("wa_wa_"), statement.slice(0, 80));
      for (const match of statement.matchAll(/`([^`]+)`/g)) assert.ok(match[1].length <= 64, match[1]);
    }
  }
  assert.ok(foreignKeys > 100);

  const [create] = migrationStatements(read(files[0]), "wa_").filter((statement) => statement.startsWith("CREATE TABLE `wa_users`"));
  assert.match(create, /`email` varchar\(255\) NOT NULL/, "column definitions are untouched");
  assert.match(create, /CONSTRAINT `users_email_unique` UNIQUE/, "index names are per table and stay as they are");
});

test("prefix: later kinds of migration are covered, and unknown ones are refused", () => {
  const rename = (statement) => prefixStatement(statement, "wa_");
  assert.equal(rename("ALTER TABLE `users` ADD `nickname` varchar(40);"), "ALTER TABLE `wa_users` ADD `nickname` varchar(40);");
  assert.equal(rename("ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_user_id_users_id_fk`;"), "ALTER TABLE `wa_bookings` DROP FOREIGN KEY `wa_bookings_user_id_users_id_fk`;");
  assert.equal(rename("DROP INDEX `users_region_idx` ON `users`;"), "DROP INDEX `users_region_idx` ON `wa_users`;");
  assert.equal(rename("DROP TABLE `old_things`;"), "DROP TABLE `wa_old_things`;");
  assert.equal(rename("RENAME TABLE `a` TO `b`;"), "RENAME TABLE `wa_a` TO `wa_b`;");
  assert.equal(rename("UPDATE `users` SET `role` = 'user' WHERE `role` IS NULL;"), "UPDATE `wa_users` SET `role` = 'user' WHERE `role` IS NULL;");
  assert.equal(rename("INSERT INTO `roles` (`id`) SELECT `id` FROM `old_roles` JOIN `users` ON 1=1;"), "INSERT INTO `wa_roles` (`id`) SELECT `id` FROM `wa_old_roles` JOIN `wa_users` ON 1=1;");
  assert.equal(rename("DELETE FROM `rate_limits`;"), "DELETE FROM `wa_rate_limits`;");
  assert.match(rename("ALTER TABLE `a` ADD CONSTRAINT `a_b_fk` FOREIGN KEY (`b`) REFERENCES `b`(`id`) ON DELETE cascade ON UPDATE no action;"), /^ALTER TABLE `wa_a` ADD CONSTRAINT `wa_a_b_fk` FOREIGN KEY \(`b`\) REFERENCES `wa_b`\(`id`\) ON DELETE cascade ON UPDATE no action;$/);

  // Anything else could reach another application's tables, so it stops the migration instead.
  assert.throws(() => rename("CREATE VIEW `v` AS SELECT 1;"), /cannot be prefixed safely/);
  assert.throws(() => rename("SET FOREIGN_KEY_CHECKS = 0;"), /cannot be prefixed safely/);
  assert.equal(prefixStatement("CREATE VIEW `v` AS SELECT 1;", ""), "CREATE VIEW `v` AS SELECT 1;");
});

test("prefix: long names are shortened the same way every time", () => {
  const long = "a".repeat(62);
  const first = prefixedName("wa_", long);
  assert.equal(first.length, 64);
  assert.equal(first, prefixedName("wa_", long));
  assert.notEqual(first, prefixedName("wa_", `${"a".repeat(61)}b`));
  assert.equal(prefixedName("wa_", "users"), "wa_users");
});
