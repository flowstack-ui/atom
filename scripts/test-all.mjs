import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { browserArguments, sourceIdentity, runEvidenceStep, saveEvidence } from "./release-evidence.mjs";

const packageRoot = resolve(import.meta.dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
await mkdir(resolve(packageRoot, "test-results"), { recursive: true });
const evidenceDirectory = await mkdtemp(resolve(packageRoot, "test-results", "release-"));
const archiveDirectory = resolve(evidenceDirectory, "archive");
await mkdir(archiveDirectory);
const summary = { schema: "atom.release-evidence.v1", startedAt: new Date().toISOString(), node: process.version, source: sourceIdentity(packageRoot), status: "running", steps: [] };
saveEvidence(evidenceDirectory, summary);
console.log(`Release evidence: ${evidenceDirectory}`);

function run(name, args) {
  runEvidenceStep({ directory: evidenceDirectory, summary, name, command: npmCommand, args,
    cwd: packageRoot,
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_cache: resolve(archiveDirectory, "npm-cache"),
      npm_config_fund: "false",
      FLOWSTACK_TEST_ARTIFACT_DIR: resolve(evidenceDirectory, "browser"),
    },
  });
}

try {
  const browserArgs = browserArguments(process.env.FLOWSTACK_TEST_WORKERS);
  run("repository", ["run", "check:repository"]);
  run("playground-build", ["run", "playground:build"]);
  run("browser", browserArgs);
  const browserReport = JSON.parse(await readFile(resolve(evidenceDirectory, "browser", "report.json"), "utf8"));
  if (!browserReport.stats || browserReport.stats.unexpected !== 0 || browserReport.stats.expected < 1) throw new Error("Browser report is missing successful qualification evidence");
  summary.browser = { stats: browserReport.stats, projects: browserReport.config.projects.map(project => ({ name: project.name, testDir: project.testDir })), workers: browserReport.config.workers, playwrightVersion: JSON.parse(await readFile(resolve(packageRoot, "node_modules/@playwright/test/package.json"), "utf8")).version };
  run("pack-dry-run", ["run", "pack:check"]);
  // The browser phase already qualified this playground. Do not rebuild
  // unchanged output between browser qualification and archive verification.
  run("pack", ["pack", "--pack-destination", archiveDirectory]);
  const archives = (await readdir(archiveDirectory)).filter(name => name.endsWith(".tgz"));
  if (archives.length !== 1) throw new Error("Expected exactly one release archive");
  summary.archive = { path: resolve(archiveDirectory, archives[0]), sha256: createHash("sha256").update(await readFile(resolve(archiveDirectory, archives[0]))).digest("hex") };
  run("verify-pack", ["run", "verify:pack", "--", archiveDirectory]);
  run("consumer-react18", ["run", "verify:consumer", "--", archiveDirectory, "18"]);
  run("consumer-react19", ["run", "verify:consumer", "--", archiveDirectory, "19"]);
  summary.finalSource = sourceIdentity(packageRoot);
  if (summary.finalSource.contentSha256 !== summary.source.contentSha256 || summary.finalSource.revision !== summary.source.revision) throw new Error("Source changed during release qualification; rerun against stable input");
  summary.status = "passed";
  console.log("\nAll Atom package, playground, archive, and consumer checks passed.");
} catch (error) {
  summary.status = "failed";
  summary.error = error.message;
  process.exitCode = 1;
  console.error(error.message);
} finally {
  summary.completedAt = new Date().toISOString();
  saveEvidence(evidenceDirectory, summary);
  console.log(`Retained release evidence and candidate: ${evidenceDirectory}`);
}
