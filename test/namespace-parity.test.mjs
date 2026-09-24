import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import * as root from "../dist/index.js";

test("root and focused imports expose the same complete compound namespaces", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const failures = [];
  for (const path of Object.keys(pkg.exports).filter(path => /^\.\/[a-z-]+$/.test(path))) {
    const subpath = await import(`@flowstack-ui/atom/${path.slice(2)}`);
    for (const [name, value] of Object.entries(subpath)) {
      if (!value || typeof value !== "object" || value.$$typeof || !("Root" in value || "Provider" in value)) continue;
      if (!(name in root)) { failures.push(`${name}: missing root namespace`); continue; }
      for (const part of new Set([...Object.keys(value), ...Object.keys(root[name])])) {
        if (root[name][part] !== value[part]) failures.push(`${name}.${part}: inconsistent import paths`);
      }
    }
  }
  assert.deepEqual(failures, []);
});
