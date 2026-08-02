import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import configuration from "../verification.config.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(await readFile(resolve(repositoryRoot, "package.json"), "utf8"));
const errors = [];

async function requirePath(path) {
  try {
    await access(resolve(repositoryRoot, path));
  } catch {
    errors.push(`missing ${path}`);
  }
}

if (configuration.schemaVersion !== 1) errors.push("unsupported verification schema");
for (const [role, script] of Object.entries(configuration.commands)) {
  if (!packageJson.scripts?.[script]) errors.push(`${role} requires npm script ${script}`);
}
for (const workflow of Object.values(configuration.workflows)) {
  await requirePath(workflow);
  try {
    const source = await readFile(resolve(repositoryRoot, workflow), "utf8");
    if (/uses:\s+[^\n#]+@(v\d+|main|master)\b/u.test(source)) errors.push(`${workflow} contains a mutable action reference`);
    if (!source.includes("timeout-minutes:")) errors.push(`${workflow} has no job timeout`);
  } catch { /* missing path is already reported */ }
}
for (const server of configuration.servers) {
  if (server.testPort - server.developmentPort !== 1000) errors.push(`${server.name} ports do not share a suffix`);
  const sources = [];
  for (const path of server.configurationFiles) {
    await requirePath(path);
    try { sources.push(await readFile(resolve(repositoryRoot, path), "utf8")); } catch { /* missing path is already reported */ }
  }
  const source = sources.join("\n");
  if (!source.includes(String(server.developmentPort))) errors.push(`${server.name} development port is not configured`);
  if (!source.includes(String(server.testPort))) errors.push(`${server.name} test port is not configured`);
  if (server.strictPort && !source.includes("strictPort: true")) errors.push(`${server.name} does not enforce a strict port`);
}
for (const path of configuration.browserConfigs) {
  await requirePath(path);
  try {
    if (!(await readFile(resolve(repositoryRoot, path), "utf8")).includes("reuseExistingServer: false")) errors.push(`${path} may reuse a stale server`);
  } catch { /* missing path is already reported */ }
}
await requirePath(configuration.impact.manifest);

if (errors.length > 0) {
  console.error(`Repository contract failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`Verified ${configuration.id} repository contract.`);
