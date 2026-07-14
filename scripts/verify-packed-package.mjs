import { execFileSync } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function fail(message) {
  throw new Error(`Packed package verification failed: ${message}`);
}

async function resolveArchive(input) {
  if (!input) {
    fail("provide a .tgz file or a directory containing exactly one .tgz file");
  }

  const resolved = path.resolve(input);
  const inputStat = await stat(resolved);

  if (inputStat.isFile()) {
    if (!resolved.endsWith(".tgz")) fail(`${resolved} is not a .tgz file`);
    return resolved;
  }

  if (!inputStat.isDirectory()) fail(`${resolved} is not a file or directory`);

  const archives = (await readdir(resolved))
    .filter((name) => name.endsWith(".tgz"))
    .map((name) => path.join(resolved, name));

  if (archives.length !== 1) {
    fail(`expected one .tgz file in ${resolved}; found ${archives.length}`);
  }

  return archives[0];
}

function runTar(args) {
  return execFileSync("tar", args, {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

const archive = await resolveArchive(process.argv[2]);
const entries = runTar(["-tzf", archive]).trim().split("\n").filter(Boolean);
const entrySet = new Set(entries);

if (entries.length === 0) fail("archive is empty");
if (entrySet.size !== entries.length) fail("archive contains duplicate paths");

const allowedRootEntries = new Set([
  "package/",
  "package/LICENSE",
  "package/README.md",
  "package/package.json",
]);

for (const entry of entries) {
  if (!entry.startsWith("package/")) fail(`path is outside package/: ${entry}`);
  if (entry.includes("\\")) fail(`path uses a backslash: ${entry}`);
  if (entry.split("/").includes("..")) fail(`path traverses upward: ${entry}`);

  const forbiddenSegment = entry.match(/\/(?:src|playground|node_modules)(?:\/|$)/);
  if (forbiddenSegment) fail(`forbidden path: ${entry}`);

  if (/\/(?:_internal|dist) [2-9](?:\/|$)/.test(entry)) {
    fail(`conflict-copy path: ${entry}`);
  }

  if (!allowedRootEntries.has(entry) && !entry.startsWith("package/dist/")) {
    fail(`unexpected published path: ${entry}`);
  }
}

const packedPackage = JSON.parse(
  runTar(["-xOf", archive, "package/package.json"]),
);
const localPackage = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

if (packedPackage.name !== localPackage.name) {
  fail(`package name is ${packedPackage.name}; expected ${localPackage.name}`);
}

if (packedPackage.version !== localPackage.version) {
  fail(`package version is ${packedPackage.version}; expected ${localPackage.version}`);
}

if (JSON.stringify(packedPackage.files) !== JSON.stringify(["dist"])) {
  fail(`published files must be exactly ["dist"]`);
}

for (const [subpath, target] of Object.entries(packedPackage.exports)) {
  for (const field of ["default", "types"]) {
    const relativeTarget = target[field];
    if (typeof relativeTarget !== "string" || !relativeTarget.startsWith("./dist/")) {
      fail(`${subpath} has an invalid ${field} export`);
    }

    const packedTarget = `package/${relativeTarget.slice(2)}`;
    if (!entrySet.has(packedTarget)) {
      fail(`${subpath} is missing ${field} target ${packedTarget}`);
    }
  }
}

const archiveStat = await stat(archive);
console.log(
  `Verified ${packedPackage.name}@${packedPackage.version}: `
  + `${entries.length} files, ${Object.keys(packedPackage.exports).length} exports, `
  + `${archiveStat.size} compressed bytes.`,
);
