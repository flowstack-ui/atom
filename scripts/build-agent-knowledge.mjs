import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAgentCoverage, coverageFailureMessage } from "./agent-catalog.mjs";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const packageJson = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
const layer = packageJson.name.endsWith("/atom") ? "atom" : "brick";
const sourceRoot = join(packageRoot, "src", layer === "atom" ? "primitives" : "components");
const guideRoot = join(packageRoot, "agents", "guides");
const outputRoot = join(packageRoot, "dist", "agents");
const checkOnly = process.argv.includes("--check");
const requiredArrays = ["useWhen", "avoidWhen", "composition", "rules", "commonMistakes", "validation", "related"];
const requiredGuideArrays = ["decisionOrder", "selection", "rules", "validation", "related"];

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

function relatedLabel(item) {
  if (typeof item === "string") return item;
  if (item.kind === "package") return `${item.package}/${item.id} (${item.versionPolicy})`;
  if (["component", "guide", "native-application", "utility"].includes(item.kind)) {
    return `${item.id} (${item.kind})`;
  }
  throw new Error(`Unsupported related guidance reference: ${JSON.stringify(item)}`);
}

function assertDefinedRelatedLabels(markdown, file) {
  const relatedSection = markdown.split("## Related guidance\n\n")[1] ?? "";
  if (/\bundefined\b/.test(relatedSection)) {
    throw new Error(`${relative(packageRoot, file)} generated an undefined related guidance label.`);
  }
}

function render(data) {
  const avoid = data.avoidWhen.map(({ condition, useInstead }) => `${condition} Use ${useInstead}.`);
  const rules = data.rules.map(({ level, statement }) => `**${level.toUpperCase()}:** ${statement}`);
  const mistakes = data.commonMistakes.map(({ mistake, correction }) => `**Avoid:** ${mistake} **Instead:** ${correction}`);
  return `# ${data.name} agent guide\n\n## Purpose\n\n${data.purpose}\n\n## Use when\n\n${list(data.useWhen)}\n\n## Choose something else when\n\n${list(avoid)}\n\n## Required composition\n\n${list(data.composition)}\n\n## Rules\n\n${list(rules)}\n\n## Common mistakes\n\n${list(mistakes)}\n\n## Validation checklist\n\n${list(data.validation)}\n\n## Related guidance\n\n${list(data.related.map((item) => `\`${relatedLabel(item)}\``))}\n`;
}

function renderGuide(data) {
  const decisionOrder = data.decisionOrder.map((item, index) => `${index + 1}. ${item}`).join("\n");
  const selection = data.selection.map(({ intent, use, note }) => `- **${intent}:** use ${use}.${note ? ` ${note}` : ""}`).join("\n");
  const rules = data.rules.map(({ level, statement }) => `- **${level.toUpperCase()}:** ${statement}`).join("\n");
  const fallback = `1. ${data.nativeFallback.check}\n2. ${data.nativeFallback.use}\n3. ${data.nativeFallback.report}`;
  return `# ${data.name}\n\n## Purpose\n\n${data.purpose}\n\n## Decision order\n\n${decisionOrder}\n\n## Selection map\n\n${selection}\n\n## Rules\n\n${rules}\n\n## Native fallback\n\n${fallback}\n\n## Validation checklist\n\n${list(data.validation)}\n\n## Related guidance\n\n${list(data.related.map((item) => `\`${relatedLabel(item)}\``))}\n`;
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


function validateGuide(data, file) {
  const failures = [];
  if (data.schema !== "flowstack.agent-guide.v1") failures.push("schema must be flowstack.agent-guide.v1");
  if (data.package !== packageJson.name) failures.push(`package must be ${packageJson.name}`);
  if (data.layer !== layer) failures.push(`layer must be ${layer}`);
  if (data.kind !== "guide") failures.push("kind must be guide");
  if (data.id !== basename(dirname(file))) failures.push("id must match its guide folder");
  for (const key of ["id", "name", "purpose"]) if (typeof data[key] !== "string" || !data[key].trim()) failures.push(`${key} must be a non-empty string`);
  for (const key of requiredGuideArrays) if (!Array.isArray(data[key]) || data[key].length === 0) failures.push(`${key} must be a non-empty array`);
  for (const item of data.selection ?? []) {
    if (!item.intent || !item.use) failures.push("every selection item needs intent and use");
    if (!Array.isArray(item.destinations) || item.destinations.length === 0) failures.push("every selection item needs structured destinations");
  }
  for (const rule of data.rules ?? []) if (!rule.id || !["must", "should"].includes(rule.level) || !rule.statement) failures.push("every rule needs id, must/should level, and statement");
  for (const key of ["check", "use", "report"]) if (!data.nativeFallback?.[key]) failures.push(`nativeFallback.${key} must be a non-empty string`);
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
  assertDefinedRelatedLabels(markdown, file);
  const markdownFile = join(dirname(file), "agent.md");
  if (checkOnly) {
    const existing = await readFile(markdownFile, "utf8").catch(() => "");
    if (existing !== markdown) throw new Error(`${relative(packageRoot, markdownFile)} is stale; run npm run agents:build.`);
  } else {
    await writeFile(markdownFile, markdown);
  }
  artifacts.push({ data, raw: `${JSON.stringify(data, null, 2)}\n`, markdown });
}


const guideFiles = await walk(guideRoot).catch(() => []);
const guides = [];
for (const file of guideFiles) {
  const raw = await readFile(file, "utf8");
  const data = JSON.parse(raw);
  validateGuide(data, file);
  const markdown = renderGuide(data);
  assertDefinedRelatedLabels(markdown, file);
  const markdownFile = join(dirname(file), "agent.md");
  if (checkOnly) {
    const existing = await readFile(markdownFile, "utf8").catch(() => "");
    if (existing !== markdown) throw new Error(`${relative(packageRoot, markdownFile)} is stale; run npm run agents:build.`);
  } else {
    await writeFile(markdownFile, markdown);
  }
  guides.push({ data, raw: `${JSON.stringify(data, null, 2)}\n`, markdown });
}

const duplicateIds = [...artifacts, ...guides]
  .map(({ data }) => data.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);
if (duplicateIds.length) throw new Error(`Agent guide IDs must be unique: ${[...new Set(duplicateIds)].join(", ")}`);

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
  guides: guides.map(({ data }) => ({
    id: data.id,
    name: data.name,
    json: `./${data.id}.json`,
    markdown: `./${data.id}.md`,
  })),
  coverage: "./coverage.json",
};
const coverage = await buildAgentCoverage({
  packageRoot,
  manifest,
  componentRecords: artifacts,
  guideRecords: guides,
});
const coverageFailure = coverageFailureMessage(coverage);
const expectedOutput = new Map([
  ...artifacts.flatMap(({ data, raw, markdown }) => [[`${data.id}.json`, raw], [`${data.id}.md`, markdown]]),
  ...guides.flatMap(({ data, raw, markdown }) => [[`${data.id}.json`, raw], [`${data.id}.md`, markdown]]),
  ["manifest.json", `${JSON.stringify(manifest, null, 2)}\n`],
  ["coverage.json", `${JSON.stringify(coverage, null, 2)}\n`],
]);

if (!checkOnly) {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  for (const [name, content] of expectedOutput) await writeFile(join(outputRoot, name), content);
} else {
  const existingNames = await readdir(outputRoot).catch(() => []);
  const expectedNames = [...expectedOutput.keys()].sort();
  const unexpected = existingNames.filter((name) => !expectedOutput.has(name)).sort();
  const missing = expectedNames.filter((name) => !existingNames.includes(name));
  if (unexpected.length || missing.length) {
    throw new Error(`dist/agents does not match generated output.${missing.length ? `\nMissing: ${missing.join(", ")}` : ""}${unexpected.length ? `\nUnexpected: ${unexpected.join(", ")}` : ""}`);
  }
  for (const [name, content] of expectedOutput) {
    const existing = await readFile(join(outputRoot, name), "utf8");
    if (existing !== content) throw new Error(`dist/agents/${name} is stale; run npm run agents:build.`);
  }
}

if (coverageFailure) throw new Error(coverageFailure);
console.log(`${checkOnly ? "Verified" : "Built"} ${artifacts.length} component and ${guides.length} package ${packageJson.name} agent guides; catalog coverage is ${coverage.summary.guidedComponentOwners}/${coverage.summary.componentOwners} component owners and ${coverage.summary.classifiedPublicSurfaces}/${coverage.summary.publicSurfaces} public surfaces.`);
