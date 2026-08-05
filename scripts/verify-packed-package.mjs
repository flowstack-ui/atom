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
const expectedConsumerDocs = new Set([
  "package/docs/guides/getting-started.md",
  "package/docs/guides/imports.md",
  "package/docs/guides/public-api.md",
  "package/docs/guides/agent-knowledge.md",
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

  if (
    !allowedRootEntries.has(entry)
    && !expectedConsumerDocs.has(entry)
    && !entry.startsWith("package/dist/")
  ) {
    fail(`unexpected published path: ${entry}`);
  }
}

for (const consumerDoc of expectedConsumerDocs) {
  if (!entrySet.has(consumerDoc)) fail(`missing consumer documentation: ${consumerDoc}`);
}
if (!entrySet.has("package/dist/agents/manifest.json")) {
  fail("missing Agent Knowledge manifest");
}

const packedPackage = JSON.parse(
  runTar(["-xOf", archive, "package/package.json"]),
);
const localPackage = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const agentManifest = JSON.parse(
  runTar(["-xOf", archive, "package/dist/agents/manifest.json"]),
);
if (agentManifest.package !== packedPackage.name || agentManifest.components.length === 0) {
  fail("Agent Knowledge manifest has the wrong package or no components");
}
for (const component of agentManifest.components) {
  for (const extension of ["json", "md"]) {
    const artifact = `package/dist/agents/${component.id}.${extension}`;
    if (!entrySet.has(artifact)) fail(`missing Agent Knowledge artifact: ${artifact}`);
  }
}

if (packedPackage.name !== localPackage.name) {
  fail(`package name is ${packedPackage.name}; expected ${localPackage.name}`);
}

if (packedPackage.version !== localPackage.version) {
  fail(`package version is ${packedPackage.version}; expected ${localPackage.version}`);
}

const expectedPublishedFiles = [
  "dist",
  "docs/guides/getting-started.md",
  "docs/guides/imports.md",
  "docs/guides/public-api.md",
  "docs/guides/agent-knowledge.md",
];

if (JSON.stringify(packedPackage.files) !== JSON.stringify(expectedPublishedFiles)) {
  fail(`published files do not match the consumer package boundary`);
}

const packedReadme = runTar(["-xOf", archive, "package/README.md"]);
if (!packedReadme.includes("npm install @flowstack-ui/atom")) {
  fail("README is missing the consumer installation command");
}

for (const repositoryOnlyReference of [
  "AGENTS.md",
  "playground/",
  "npm run test",
  "npm run build",
]) {
  if (packedReadme.includes(repositoryOnlyReference)) {
    fail(`README contains repository-only guidance: ${repositoryOnlyReference}`);
  }
}

for (const [subpath, target] of Object.entries(packedPackage.exports)) {
  if (typeof target === "string") {
    if (!target.startsWith("./dist/")) fail(`${subpath} has an invalid export`);
    if (target.includes("*")) continue;
    const packedTarget = `package/${target.slice(2)}`;
    if (!entrySet.has(packedTarget)) fail(`${subpath} is missing target ${packedTarget}`);
    continue;
  }
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
