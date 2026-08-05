import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const packageJson = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
const layer = packageJson.name.endsWith("/atom") ? "atom" : "brick";
const sourceRoot = join(packageRoot, "src", layer === "atom" ? "primitives" : "components");
const outputRoot = join(packageRoot, "dist", "agents");
const checkOnly = process.argv.includes("--check");
const requiredArrays = ["useWhen", "avoidWhen", "composition", "rules", "commonMistakes", "validation", "related"];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.name === "agent.json") files.push(path);
  }
  return files.sort();
}

function list(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None.";
}

function render(data) {
  const avoid = data.avoidWhen.map(({ condition, useInstead }) => `${condition} Use ${useInstead}.`);
  const rules = data.rules.map(({ level, statement }) => `**${level.toUpperCase()}:** ${statement}`);
  const mistakes = data.commonMistakes.map(({ mistake, correction }) => `**Avoid:** ${mistake} **Instead:** ${correction}`);
  return `# ${data.name} agent guide\n\n## Purpose\n\n${data.purpose}\n\n## Use when\n\n${list(data.useWhen)}\n\n## Choose something else when\n\n${list(avoid)}\n\n## Required composition\n\n${list(data.composition)}\n\n## Rules\n\n${list(rules)}\n\n## Common mistakes\n\n${list(mistakes)}\n\n## Validation checklist\n\n${list(data.validation)}\n\n## Related guidance\n\n${list(data.related.map((item) => `\`${item}\``))}\n`;
}

function validate(data, file) {
  const failures = [];
  if (data.schema !== "flowstack.agent-component.v1") failures.push("schema must be flowstack.agent-component.v1");
  if (data.package !== packageJson.name) failures.push(`package must be ${packageJson.name}`);
  if (data.layer !== layer) failures.push(`layer must be ${layer}`);
  if (data.kind !== "component") failures.push("kind must be component");
  if (data.id !== basename(dirname(file))) failures.push("id must match its component folder");
  for (const key of ["id", "name", "purpose"]) if (typeof data[key] !== "string" || !data[key].trim()) failures.push(`${key} must be a non-empty string`);
  for (const key of requiredArrays) if (!Array.isArray(data[key]) || data[key].length === 0) failures.push(`${key} must be a non-empty array`);
  for (const rule of data.rules ?? []) if (!rule.id || !["must", "should"].includes(rule.level) || !rule.statement) failures.push("every rule needs id, must/should level, and statement");
  for (const item of data.avoidWhen ?? []) if (!item.condition || !item.useInstead) failures.push("every avoidWhen item needs condition and useInstead");
  for (const item of data.commonMistakes ?? []) if (!item.mistake || !item.correction) failures.push("every commonMistakes item needs mistake and correction");
  if (failures.length) throw new Error(`${relative(packageRoot, file)}:\n- ${failures.join("\n- ")}`);
}

const files = await walk(sourceRoot);
if (!files.length) throw new Error("No agent.json files found.");
const artifacts = [];

for (const file of files) {
  const raw = await readFile(file, "utf8");
  const data = JSON.parse(raw);
  validate(data, file);
  const markdown = render(data);
  const markdownFile = join(dirname(file), "agent.md");
  if (checkOnly) {
    const existing = await readFile(markdownFile, "utf8").catch(() => "");
    if (existing !== markdown) throw new Error(`${relative(packageRoot, markdownFile)} is stale; run npm run agents:build.`);
  } else {
    await writeFile(markdownFile, markdown);
  }
  artifacts.push({ data, raw: `${JSON.stringify(data, null, 2)}\n`, markdown });
}

if (!checkOnly) {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  for (const { data, raw, markdown } of artifacts) {
    await writeFile(join(outputRoot, `${data.id}.json`), raw);
    await writeFile(join(outputRoot, `${data.id}.md`), markdown);
  }
  const manifest = {
    schema: "flowstack.agent-manifest.v1",
    package: packageJson.name,
    packageVersion: packageJson.version,
    components: artifacts.map(({ data }) => ({
      id: data.id,
      name: data.name,
      json: `./${data.id}.json`,
      markdown: `./${data.id}.md`,
    })),
  };
  await writeFile(join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(`${checkOnly ? "Verified" : "Built"} ${artifacts.length} ${packageJson.name} agent guides.`);
