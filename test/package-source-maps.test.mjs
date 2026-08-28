import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const packageRoot = path.resolve(import.meta.dirname, "..");
const distRoot = path.join(packageRoot, "dist");

async function collectSourceMaps(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const sourceMaps = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      sourceMaps.push(...await collectSourceMaps(entryPath));
    } else if (entry.name.endsWith(".js.map")) {
      sourceMaps.push(entryPath);
    }
  }

  return sourceMaps;
}

test("published JavaScript source maps embed every referenced TypeScript source", async () => {
  const sourceMaps = await collectSourceMaps(distRoot);
  assert.ok(sourceMaps.length > 0, "the package build should emit source maps");

  for (const sourceMapPath of sourceMaps) {
    const sourceMap = JSON.parse(await readFile(sourceMapPath, "utf8"));
    assert.equal(
      sourceMap.sourcesContent?.length,
      sourceMap.sources?.length,
      `${path.relative(packageRoot, sourceMapPath)} must embed all referenced sources`,
    );
    assert.ok(
      sourceMap.sourcesContent.every((source) => typeof source === "string"),
      `${path.relative(packageRoot, sourceMapPath)} contains an unavailable source`,
    );
  }
});
