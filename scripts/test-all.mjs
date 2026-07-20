import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const packageRoot = resolve(import.meta.dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const archiveDirectory = await mkdtemp(resolve(tmpdir(), "atom-test-all-"));

function run(command, args) {
  execFileSync(command, args, {
    cwd: packageRoot,
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_cache: resolve(archiveDirectory, "npm-cache"),
      npm_config_fund: "false",
    },
    stdio: "inherit",
  });
}

try {
  run(npmCommand, ["run", "release:check"]);
  run(npmCommand, ["run", "playground:build"]);
  run(npmCommand, ["pack", "--pack-destination", archiveDirectory]);
  run(npmCommand, ["run", "verify:pack", "--", archiveDirectory]);
  run(npmCommand, ["run", "verify:consumer", "--", archiveDirectory, "18"]);
  run(npmCommand, ["run", "verify:consumer", "--", archiveDirectory, "19"]);
  console.log("\nAll Atom package, playground, archive, and consumer checks passed.");
} finally {
  await rm(archiveDirectory, { recursive: true, force: true });
}
