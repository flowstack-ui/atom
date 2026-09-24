import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(new URL("../../src/primitives/scroll-area/geometry.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { thumbGeometry, inlineOffset } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("thumb geometry respects proportions, minimum length and both limits", () => {
  assert.deepEqual(thumbGeometry(100, 400, 200, 24, 150), { extent: 300, length: 50, travel: 150, position: 75 });
  assert.equal(thumbGeometry(100, 10000, 200, 24, 999999).position, 176);
  assert.equal(thumbGeometry(100, 400, 12, 24, -50).length, 12);
  assert.deepEqual(thumbGeometry(0, 0, 0, 24, 0), { extent: 0, length: 0, travel: 0, position: 0 });
  assert.equal(thumbGeometry(200, 100, 200, 24, 50).position, 0);
});

test("logical offsets normalize RTL and rubber-band overscroll", () => {
  assert.equal(inlineOffset({ scrollLeft: -50, scrollWidth: 300, clientWidth: 100 }, true), 50);
  assert.equal(inlineOffset({ scrollLeft: 50, scrollWidth: 300, clientWidth: 100 }, true), 0);
  assert.equal(inlineOffset({ scrollLeft: -250, scrollWidth: 300, clientWidth: 100 }, true), 200);
  assert.equal(inlineOffset({ scrollLeft: 250, scrollWidth: 300, clientWidth: 100 }, false), 200);
});
