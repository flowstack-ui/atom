import assert from "node:assert/strict";
import test from "node:test";
import { inventoryCount, shardCount, validateRun, runBrowsers } from "../scripts/release-browsers.mjs";

test("release browser inventory includes nested suites and rejects empty/discovery errors", () => {
  assert.equal(inventoryCount({ suites: [{ specs: [{ tests: [{}, {}] }], suites: [{ specs: [{ tests: [{}] }] }] }] }), 3);
  assert.throws(() => inventoryCount({ suites: [] }), /empty/);
  assert.throws(() => inventoryCount({ errors: [{}], suites: [] }), /discovery/);
});
test("WebKit context budgets bound test-level process shards without removing tests", () => {
  assert.equal(shardCount(145, "desktop-webkit"), 4);
  assert.equal(shardCount(40, "desktop-webkit"), 1);
  assert.equal(shardCount(41, "desktop-webkit"), 2);
  assert.equal(shardCount(25, "mobile-ios-webkit"), 2);
  assert.equal(shardCount(145, "desktop-chromium"), 1);
  assert.throws(() => shardCount(0, "desktop-webkit"), /Invalid/);
});
test("release browser result accounting rejects failures, flakes and missing tests", () => {
  const stats = { expected: 39, skipped: 1, unexpected: 0, flaky: 0 };
  validateRun({ stats }, 40);
  assert.throws(() => validateRun({ stats }, 41), /inventory/);
  assert.throws(() => validateRun({ stats: { ...stats, flaky: 1 } }, 40), /flakes/);
  assert.throws(() => validateRun({ stats: { ...stats, unexpected: 1 } }, 40), /failures/);
  assert.throws(() => validateRun({}, 40), /missing/);
});
test("release runner rejects unsupported arguments before running commands", () => {
  for (const args of [["--workers=0"], ["--grep=menu"], ["--workers=2", "--retries=1"]])
    assert.throws(() => runBrowsers(args), /accepts only/);
});
