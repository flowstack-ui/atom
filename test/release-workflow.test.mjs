import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("publication qualifies every configured browser profile", () => {
  const config = read("playwright.config.ts");
  const publish = read(".github/workflows/publish.yml");
  const projects = [...config.matchAll(/name: "([a-z-]+)"/g)].map(match => match[1]);
  assert.equal(projects.length, 5);
  for (const project of projects) assert.ok(publish.includes(`project: ${project}`), `Missing publication profile: ${project}`);
  assert.match(publish, /needs: \[validate, repository, archive, playground, browser, consumer\]/);
  assert.match(publish, /FLOWSTACK_TEST_ARTIFACT_DIR: test-results\/release-browser/);
  assert.match(publish, /if: always\(\)[\s\S]*name: atom-release-browser-\$\{\{ matrix.project \}\}/);
});

test("nightly retains successful as well as failed release evidence", () => {
  const nightly = read(".github/workflows/nightly.yml");
  assert.match(nightly, /if: always\(\)/);
  assert.match(nightly, /name: atom-nightly-release-evidence/);
  assert.match(nightly, /test-results\//);
  assert.match(nightly, /if-no-files-found: error/);
});
