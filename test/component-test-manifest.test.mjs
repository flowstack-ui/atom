import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { basename } from "node:path";
import test from "node:test";
import { componentIds, componentTestPaths } from "../scripts/component-test-manifest.mjs";

test("focused suites include owner regressions without sibling-prefix leakage", async () => {
  const files = async (id, kind) => (await componentTestPaths(id))[kind].map((path) => basename(path));
  assert.ok((await files("form", "unit")).includes("form-family-lifecycle.test.mjs"));
  assert.ok((await files("pin-input", "unit")).includes("pin-migration-regressions.test.mjs"));
  assert.ok((await files("date-picker", "unit")).includes("date-picker-interaction.test.mjs"));
  assert.ok((await files("date-picker", "browser")).includes("date-picker.spec.ts"));
  assert.ok((await files("collapsible", "unit")).includes("disclosure-measurement.test.mjs"));
  assert.ok(!(await files("checkbox", "unit")).includes("checkbox-card.test.mjs"));
  assert.ok(!(await files("tree", "unit")).includes("tree-grid.test.mjs"));
  assert.ok(componentIds.every((id) => !id.includes("/") && !id.includes("*")));
  await assert.rejects(componentTestPaths("../unknown"), /Unknown component/);
});

test("focused suite mappings exist and never execute a file twice", async () => {
  for (const id of componentIds) {
    const paths = await componentTestPaths(id);
    for (const files of [paths.unit, paths.browser]) {
      assert.equal(new Set(files).size, files.length, id);
      await Promise.all(files.map((path) => access(path)));
    }
  }
});

test("focused owners retain cross-owner form and disclosure regressions", async () => {
  for (const [owner, expected] of [
    ["action-delegate", "selection-ref-cleanup"],
    ["accordion", "disclosure-measurement"],
    ["date-input", "date-form"],
    ["date-picker", "date-form"],
    ["field", "form-family-lifecycle"],
    ["fieldset", "form-family-lifecycle"],
    ["switch", "form-integration"],
    ["combobox", "form-proxy-validity"],
    ["textarea", "form-validation-behavior"],
  ]) {
    const paths = await componentTestPaths(owner);
    assert.ok(paths.unit.some(path => basename(path) === `${expected}.test.mjs`), `${owner}: ${expected}`);
  }
});
