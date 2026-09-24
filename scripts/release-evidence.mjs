import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { closeSync, lstatSync, openSync, readFileSync, readlinkSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export function sourceIdentity(root) {
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  const paths = [...new Set(git("ls-files", "-z", "--cached", "--others", "--exclude-standard").split("\0").filter(Boolean))].sort();
  const hash = createHash("sha256");
  for (const path of paths) {
    hash.update(path + "\0");
    const absolute = resolve(root, path);
    let metadata;
    try { metadata = lstatSync(absolute); } catch (error) {
      if (error.code !== "ENOENT") throw error;
      hash.update("deleted\0");
      continue;
    }
    hash.update(String(metadata.mode) + "\0");
    hash.update(metadata.isSymbolicLink() ? readlinkSync(absolute) : readFileSync(absolute));
    hash.update("\0");
  }
  return { revision: git("rev-parse", "HEAD").trim(), dirty: Boolean(git("status", "--porcelain").trim()), contentSha256: hash.digest("hex"), files: paths.length };
}

export function saveEvidence(directory, summary) {
  const target = resolve(directory, "summary.json");
  writeFileSync(target + ".tmp", JSON.stringify(summary, null, 2) + "\n");
  renameSync(target + ".tmp", target);
}

export function runEvidenceStep({ directory, summary, name, command, args, cwd, env }) {
  const log = resolve(directory, `${summary.steps.length + 1}-${name}.log`);
  const step = { name, command, args, log, status: "running", startedAt: new Date().toISOString() };
  summary.steps.push(step);
  saveEvidence(directory, summary);
  console.log(`Running ${name}; log: ${log}`);
  const descriptor = openSync(log, "w");
  const start = performance.now();
  let result;
  try { result = spawnSync(command, args, { cwd, env, stdio: ["ignore", descriptor, descriptor] }); }
  finally { closeSync(descriptor); }
  Object.assign(step, { durationMs: Math.round(performance.now() - start), exitCode: result.status, signal: result.signal, status: result.status === 0 ? "passed" : "failed" });
  if (result.error) step.error = result.error.message;
  saveEvidence(directory, summary);
  if (step.status !== "passed") throw new Error(`${name} failed; see ${log}`);
  console.log(`Passed ${name} (${(step.durationMs / 1000).toFixed(1)}s)`);
}
