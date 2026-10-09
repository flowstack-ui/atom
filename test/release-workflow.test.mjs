import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("PR browser jobs produce retained machine-readable reports even on success", () => {
  const ci = read(".github/workflows/ci.yml");
  assert.match(ci, /FLOWSTACK_TEST_ARTIFACT_DIR: test-results\/ci-browser/);
  assert.match(ci, /name: Upload browser qualification report\s+if: always\(\)/);
  const upload = ci.slice(ci.indexOf("name: Upload browser qualification report"), ci.indexOf("  pack:"));
  assert.match(upload, /if-no-files-found: error/);
});

test("publication qualifies every configured browser profile", () => {
  const config = read("playwright.config.ts");
  const publish = read(".github/workflows/publish.yml");
  const projects = [...config.matchAll(/name: "([a-z-]+)"/g)].map(match => match[1]);
  assert.equal(projects.length, 5);
  for (const project of projects) assert.ok(publish.includes(`project: ${project}`), `Missing publication profile: ${project}`);
  assert.match(publish, /needs: \[validate, repository, archive, playground, browser, consumer, resize-lifecycle\]/);
  assert.match(publish, /FLOWSTACK_TEST_ARTIFACT_DIR: test-results\/release-browser/);
  assert.match(publish, /if: always\(\)[\s\S]*name: atom-release-browser-\$\{\{ matrix.project \}\}/);
});

test("resize lifecycle regressions gate CI and publication on macOS WebKit without retries", () => {
  for (const workflow of ["ci", "publish"]) {
    assert.match(read(`.github/workflows/${workflow}.yml`), /resize-lifecycle:\s+uses: \.\/\.github\/workflows\/resize-lifecycle\.yml/);
  }
  const regression = read(".github/workflows/resize-lifecycle.yml");
  assert.match(regression, /runs-on: macos-latest/);
  assert.match(regression, /resize-lifecycle\.spec\.ts --project=desktop-webkit --retries=0/);
  assert.match(regression, /if: always\(\)/);
  assert.match(regression, /if-no-files-found: error/);
});

test("nightly retains successful as well as failed release evidence", () => {
  const nightly = read(".github/workflows/nightly.yml");
  assert.match(nightly, /if: always\(\)/);
  assert.match(nightly, /name: atom-nightly-release-evidence/);
  assert.match(nightly, /test-results\//);
  assert.match(nightly, /if-no-files-found: error/);
});
