import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { browserArguments, runEvidenceStep, sourceIdentity } from "../scripts/release-evidence.mjs";

test("worker override preserves the browser lane and rejects invalid concurrency", () => {
  assert.deepEqual(browserArguments(undefined), ["run", "test:browser:built"]);
  assert.deepEqual(browserArguments("1"), ["run", "test:browser:built", "--", "--workers=1"]);
  for (const value of ["", "0", "-1", "1.5", "50%", "Infinity", "9007199254740992"]) {
    assert.throws(() => browserArguments(value), /positive integer/);
  }
});

test("release identity covers dirty edits, untracked files and deletions but ignores output", () => {
  const root = mkdtempSync(join(tmpdir(), "atom-evidence-identity-"));
  try {
    const git = (...args) => execFileSync("git", args, { cwd: root, stdio: "pipe" });
    git("init");
    writeFileSync(join(root, ".gitignore"), "output/\n");
    writeFileSync(join(root, "source.txt"), "initial");
    git("add", ".");
    git("-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-m", "fixture");
    const initial = sourceIdentity(root);
    assert.equal(initial.dirty, false);
    mkdirSync(join(root, "output"));
    writeFileSync(join(root, "output", "report.json"), "{}");
    assert.equal(initial.contentSha256, sourceIdentity(root).contentSha256);
    writeFileSync(join(root, "source.txt"), "changed");
    const changed = sourceIdentity(root);
    assert.equal(changed.dirty, true);
    assert.notEqual(initial.contentSha256, changed.contentSha256);
    writeFileSync(join(root, "new.txt"), "new");
    assert.notEqual(changed.contentSha256, sourceIdentity(root).contentSha256);
    rmSync(join(root, "new.txt"));
    assert.equal(changed.contentSha256, sourceIdentity(root).contentSha256);
    rmSync(join(root, "source.txt"));
    assert.notEqual(changed.contentSha256, sourceIdentity(root).contentSha256);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("release phase reports retain success, failure, logs and timing", () => {
  const directory = mkdtempSync(join(tmpdir(), "atom-evidence-steps-"));
  try {
    const summary = { status: "running", steps: [] };
    const run = (name, script) => runEvidenceStep({ directory, summary, name, command: process.execPath, args: ["-e", script], cwd: directory, env: process.env });
    run("success", 'console.log("retained evidence")');
    assert.throws(() => run("failure", "process.exit(3)"), /failure failed/);
    const saved = JSON.parse(readFileSync(join(directory, "summary.json")));
    assert.deepEqual(saved.steps.map(step => step.status), ["passed", "failed"]);
    assert.equal(saved.steps[1].exitCode, 3);
    assert.ok(saved.steps.every(step => step.durationMs >= 0));
    assert.match(readFileSync(saved.steps[0].log, "utf8"), /retained evidence/);
    assert.equal(saved.status, "running"); // The orchestration owns the final result.
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
