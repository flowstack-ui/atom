import { spawnSync } from "node:child_process";
import configuration from "../verification.config.mjs";

function assertAvailable({ name, testPort }) {
  const result = spawnSync("lsof", ["-nP", `-iTCP:${testPort}`, "-sTCP:LISTEN"], { encoding: "utf8" });
  if (result.error?.code === "ENOENT") {
    console.warn(`lsof is unavailable; ${name} relies on strict-port startup for its final collision check.`);
    return;
  }
  if (result.status === 0 && result.stdout.trim()) {
    throw new Error(`${name} test port ${testPort} is occupied. Stop the stale or unrelated process before testing.\n${result.stdout.trim()}`);
  }
}

configuration.servers.forEach(assertAvailable);
console.log(`All ${configuration.id} automated-test ports are available.`);
