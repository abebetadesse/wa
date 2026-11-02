import { afterEach, test } from "node:test";
import assert from "node:assert/strict";

async function load(basePath) {
  if (basePath === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
  else process.env.NEXT_PUBLIC_BASE_PATH = basePath;
  // A fresh module instance per call: the prefix is read when the module is evaluated.
  return import(`../lib/base-path.ts?${Math.random()}`);
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_BASE_PATH;
});

test("base path: paths are unchanged at the domain root", async () => {
  const { basePath, withBasePath, assetUrl } = await load(undefined);
  assert.equal(basePath, "");
  assert.equal(withBasePath("/api/health"), "/api/health");
  assert.equal(assetUrl("/books/a.pdf"), "/books/a.pdf");
});

test("base path: root-relative paths get the prefix, external and protocol-relative URLs do not", async () => {
  const { basePath, withBasePath, assetUrl } = await load("/wa/");
  assert.equal(basePath, "/wa");
  assert.equal(withBasePath("/api/health"), "/wa/api/health");
  assert.equal(withBasePath("case"), "/wa/case");
  assert.equal(assetUrl("/books/a.pdf"), "/wa/books/a.pdf");
  assert.equal(assetUrl("https://example.org/a.pdf"), "https://example.org/a.pdf");
  assert.equal(assetUrl("//cdn.example.org/a.png"), "//cdn.example.org/a.png");
  assert.equal(assetUrl("blob:abc"), "blob:abc");
  assert.equal(assetUrl(null), null);
});

test("base path: a value that is not a path is rejected", async () => {
  await assert.rejects(load("wa"), /NEXT_PUBLIC_BASE_PATH/);
});
