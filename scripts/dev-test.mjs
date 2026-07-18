import { readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const packageRoot = resolve(import.meta.dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const watchedPaths = [
  "src",
  "test",
  "package.json",
  "tsconfig.json",
  "tsconfig.build.json",
].map((path) => resolve(packageRoot, path));

function snapshot(path) {
  const entry = statSync(path);

  if (!entry.isDirectory()) {
    return `${path}:${entry.mtimeMs}:${entry.size}`;
  }

  return readdirSync(path, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((child) => snapshot(resolve(path, child.name)))
    .join("|");
}

function workspaceSnapshot() {
  return watchedPaths.map(snapshot).join("|");
}

let activeTestRun;
let rerunRequested = true;
let stopping = false;
let lastSnapshot = workspaceSnapshot();

function runTests() {
  if (activeTestRun || stopping || !rerunRequested) return;

  rerunRequested = false;
  activeTestRun = spawn(npmCommand, ["test"], {
    cwd: packageRoot,
    stdio: "inherit",
  });

  activeTestRun.on("exit", (code, signal) => {
    activeTestRun = undefined;
    if (stopping) return;

    if (signal) {
      console.error(`\nTest run stopped by ${signal}.`);
    } else if (code === 0) {
      console.log("\nTests passed. Watching src/ and test/ for changes…");
    } else {
      console.error(`\nTests failed with exit code ${code}. Watching for changes…`);
    }

    runTests();
  });
}

const poller = setInterval(() => {
  const nextSnapshot = workspaceSnapshot();
  if (nextSnapshot === lastSnapshot) return;

  lastSnapshot = nextSnapshot;
  rerunRequested = true;
  runTests();
}, 750);

function stop(signal) {
  if (stopping) return;
  stopping = true;
  clearInterval(poller);

  if (activeTestRun && !activeTestRun.killed) {
    activeTestRun.kill(signal);
  }
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

runTests();
