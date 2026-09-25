import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function inventoryCount(report) {
  if (report.errors?.length) throw new Error("Browser inventory contains discovery errors");
  const visit = suites => suites.reduce((count, suite) => count +
    (suite.specs ?? []).reduce((sum, spec) => sum + (spec.tests?.length ?? 0), 0) +
    visit(suite.suites ?? []), 0);
  const count = visit(report.suites ?? []);
  if (!count) throw new Error("Browser inventory is empty");
  return count;
}

export function shardCount(count, project) {
  if (!Number.isSafeInteger(count) || count < 1) throw new Error("Invalid test count");
  const budget = project === "desktop-webkit" ? 40 : project === "mobile-ios-webkit" ? 24 : count;
  return Math.ceil(count / budget);
}

export function validateRun(report, planned) {
  const stats = report.stats;
  if (!stats || report.errors?.length || stats.unexpected !== 0 || stats.flaky !== 0)
    throw new Error("Browser run contains failures, flakes, or missing results");
  if (stats.expected + stats.skipped !== planned || stats.expected < 1)
    throw new Error("Browser run did not account for its planned inventory");
}

export function runBrowsers(args = process.argv.slice(2)) {
  if (args.length > 1 || (args.length && !/^--workers=[1-9]\d*$/.test(args[0])))
    throw new Error("Release browser runner accepts only --workers=<positive integer>");
  const workers = args.length ? Number(args[0].split("=")[1]) : 2;
  if (!Number.isSafeInteger(workers)) throw new Error("Invalid worker count");
  const directory = process.env.FLOWSTACK_TEST_ARTIFACT_DIR;
  if (!directory) throw new Error("FLOWSTACK_TEST_ARTIFACT_DIR is required for release evidence");
  mkdirSync(directory, { recursive: true });
  const projects = ["desktop-chromium", "desktop-firefox", "desktop-webkit", "mobile-android-chromium", "mobile-ios-webkit"];
  const aggregate = { config: { projects: [], workers }, suites: [], errors: [], stats: {
    startTime: new Date().toISOString(), duration: 0, expected: 0, skipped: 0, unexpected: 0, flaky: 0,
  }, runs: [] };
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const save = () => writeFileSync(resolve(directory, "report.json"), JSON.stringify(aggregate, null, 2) + "\n");
  const inventory = args => {
    const result = spawnSync(npx, [...args, "--list", "--reporter=json"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    if (result.status !== 0) throw new Error(`Browser inventory failed: ${result.stderr}`);
    return inventoryCount(JSON.parse(result.stdout));
  };
  try {
    for (const project of projects) {
      const webkit = project.includes("webkit");
      const base = ["playwright", "test", `--project=${project}`, `--workers=${webkit ? 1 : workers}`, "--retries=0", "--fully-parallel"];
      const count = inventory(base);
      const shards = shardCount(count, project);
      let accounted = 0;
      for (let shard = 1; shard <= shards; shard++) {
        const args = [...base, `--shard=${shard}/${shards}`];
        const planned = inventory(args);
        if (shardCount(planned, project) !== 1) throw new Error("Browser shard exceeds its context budget");
        const output = resolve(directory, `${project}-${shard}-of-${shards}`);
        mkdirSync(output, { recursive: true });
        console.log(`Release browser ${project} ${shard}/${shards}: ${planned} tests`);
        const result = spawnSync(npx, args, { stdio: "inherit", env: { ...process.env, FLOWSTACK_TEST_ARTIFACT_DIR: output } });
        const report = JSON.parse(readFileSync(resolve(output, "report.json"), "utf8"));
        aggregate.runs.push({ project, shard, shards, planned, workers: report.config.workers, directory: output, exitCode: result.status });
        if (!aggregate.config.projects.some(item => item.name === project))
          aggregate.config.projects.push(report.config.projects.find(item => item.name === project));
        aggregate.suites.push(...report.suites);
        aggregate.errors.push(...(report.errors ?? []));
        for (const key of ["duration", "expected", "skipped", "unexpected", "flaky"])
          aggregate.stats[key] += report.stats[key];
        save();
        if (result.status !== 0) throw new Error(`Browser shard failed: ${project} ${shard}/${shards}`);
        validateRun(report, planned);
        accounted += planned;
      }
      if (accounted !== count) throw new Error(`Incomplete project inventory: ${project}`);
    }
  } catch (error) {
    aggregate.errors.push({ message: error.message });
    save();
    throw error;
  }
  save();
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) runBrowsers();
