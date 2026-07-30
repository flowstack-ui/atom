import { spawnSync } from "node:child_process";
import { componentIds, componentTestPaths } from "./component-test-manifest.mjs";

const modes = new Set(["all", "browser", "unit"]);
const [mode = "all", componentId] = process.argv.slice(2);

if (!modes.has(mode) || !componentId || !componentIds.includes(componentId)) {
  console.error(
    `Usage: node scripts/test-component.mjs <all|unit|browser> <component>\n\n` +
      `Public subpaths: ${componentIds.join(", ")}`,
  );
  process.exit(1);
}

const paths = await componentTestPaths(componentId);

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function runUnit() {
  if (paths.unit.length === 0) {
    console.error(
      `${componentId} has no component-owned primitive test. Run npm test for shared package evidence.`,
    );
    process.exit(1);
  }

  run("npm", ["run", "build"]);
  run("node", ["--test", ...paths.unit]);
}

function runBrowser({ required }) {
  if (paths.browser.length === 0) {
    if (required) {
      console.error(
        `${componentId} has no focused browser mapping. Run npm run test:browser for shared browser evidence.`,
      );
      process.exit(1);
    }
    console.log(`No focused browser mapping for ${componentId}; unit evidence is complete.`);
    return;
  }

  run("npm", ["run", "playground:build"]);
  run("npm", ["exec", "--", "playwright", "test", ...paths.browser]);
}

if (mode === "all" || mode === "unit") runUnit();
if (mode === "all" || mode === "browser") {
  runBrowser({ required: mode === "browser" });
}
