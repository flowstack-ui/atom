import { execFileSync } from "node:child_process";
import { mkdtemp, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const reactLines = {
  "18": {
    react: "18.3.1",
    reactDom: "18.3.1",
    reactTypes: "18.3.31",
    reactDomTypes: "18.3.7",
  },
  "19": {
    react: "19.2.7",
    reactDom: "19.2.7",
    reactTypes: "19.2.17",
    reactDomTypes: "19.2.3",
  },
};

function fail(message) {
  throw new Error(`Packed consumer smoke failed: ${message}`);
}

async function resolveArchive(input) {
  if (!input) fail("provide a .tgz file or directory");

  const resolved = path.resolve(input);
  const inputStat = await stat(resolved);

  if (inputStat.isFile()) return resolved;
  if (!inputStat.isDirectory()) fail(`${resolved} is not a file or directory`);

  const archives = (await readdir(resolved))
    .filter((name) => name.endsWith(".tgz"))
    .map((name) => path.join(resolved, name));

  if (archives.length !== 1) {
    fail(`expected one .tgz file in ${resolved}; found ${archives.length}`);
  }

  return archives[0];
}

function run(command, args, cwd) {
  execFileSync(command, args, {
    cwd,
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_fund: "false",
    },
    stdio: "inherit",
  });
}

const archive = await resolveArchive(process.argv[2]);
const reactLine = process.argv[3];
const versions = reactLines[reactLine];

if (!versions) fail(`React line must be 18 or 19; received ${reactLine ?? "nothing"}`);

const consumerRoot = await mkdtemp(path.join(tmpdir(), `atom-react-${reactLine}-`));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const tscCommand = process.platform === "win32"
  ? path.join(consumerRoot, "node_modules", ".bin", "tsc.cmd")
  : path.join(consumerRoot, "node_modules", ".bin", "tsc");

try {
  await writeFile(
    path.join(consumerRoot, "package.json"),
    `${JSON.stringify({ name: `atom-react-${reactLine}-smoke`, private: true, type: "module" }, null, 2)}\n`,
  );

  run(npmCommand, [
    "install",
    "--no-package-lock",
    archive,
    `react@${versions.react}`,
    `react-dom@${versions.reactDom}`,
    `@types/react@${versions.reactTypes}`,
    `@types/react-dom@${versions.reactDomTypes}`,
    "typescript@5.9.3",
  ], consumerRoot);

  await writeFile(
    path.join(consumerRoot, "smoke.mts"),
    [
      'import { CheckboxGroup, Dialog, Select, Portal } from "@flowstack-ui/atom";',
      'import { CheckboxGroupItemDescription, CheckboxGroupItemLabel, CheckboxGroupParent } from "@flowstack-ui/atom/checkbox-group";',
      'import { DialogContent, ModalRoot } from "@flowstack-ui/atom/dialog";',
      'import { SelectRoot, SelectTrigger } from "@flowstack-ui/atom/select";',
      "const dialogRoot: typeof Dialog.Root = ModalRoot;",
      "const dialogContent: typeof Dialog.Content = DialogContent;",
      "const selectRoot: typeof Select.Root = SelectRoot;",
      "const selectTrigger: typeof Select.Trigger = SelectTrigger;",
      "const checkboxGroupParent: typeof CheckboxGroup.Parent = CheckboxGroupParent;",
      "const checkboxGroupItemLabel: typeof CheckboxGroup.ItemLabel = CheckboxGroupItemLabel;",
      "const checkboxGroupItemDescription: typeof CheckboxGroup.ItemDescription = CheckboxGroupItemDescription;",
      "void [dialogRoot, dialogContent, selectRoot, selectTrigger, checkboxGroupParent, checkboxGroupItemLabel, checkboxGroupItemDescription, Portal];",
      "",
    ].join("\n"),
  );

  await writeFile(
    path.join(consumerRoot, "tsconfig.json"),
    `${JSON.stringify({
      compilerOptions: {
        module: "NodeNext",
        moduleResolution: "NodeNext",
        target: "ES2022",
        jsx: "react-jsx",
        strict: true,
        noEmit: true,
        skipLibCheck: false,
      },
      include: ["smoke.mts"],
    }, null, 2)}\n`,
  );

  await writeFile(
    path.join(consumerRoot, "runtime.mjs"),
    [
      'import React from "react";',
      'import { renderToStaticMarkup } from "react-dom/server";',
      'import { Button, CheckboxGroup, Dialog, Portal, Select } from "@flowstack-ui/atom";',
      'import { CheckboxGroup as CheckboxGroupSubpath, CheckboxGroupItemDescription, CheckboxGroupItemLabel, CheckboxGroupParent } from "@flowstack-ui/atom/checkbox-group";',
      'import { Dialog as DialogSubpath, DialogContent, ModalRoot } from "@flowstack-ui/atom/dialog";',
      'import { Portal as PortalSubpath } from "@flowstack-ui/atom/portal";',
      'import { Select as SelectSubpath, SelectRoot, SelectTrigger } from "@flowstack-ui/atom/select";',
      "if (Dialog.Root !== DialogSubpath.Root || Dialog.Content !== DialogSubpath.Content) throw new Error('Dialog namespace mismatch');",
      "if (Select.Root !== SelectSubpath.Root || Select.Trigger !== SelectSubpath.Trigger) throw new Error('Select namespace mismatch');",
      "if (Select.Root !== SelectRoot || Select.Trigger !== SelectTrigger) throw new Error('Select direct export mismatch');",
      "if (Dialog.Root !== ModalRoot || Dialog.Content !== DialogContent) throw new Error('Dialog shared export mismatch');",
      "if (Portal !== PortalSubpath) throw new Error('Portal mismatch');",
      "if (CheckboxGroup.Parent !== CheckboxGroupSubpath.Parent || CheckboxGroup.Parent !== CheckboxGroupParent) throw new Error('CheckboxGroup Parent mismatch');",
      "if (CheckboxGroup.ItemLabel !== CheckboxGroupItemLabel || CheckboxGroup.ItemDescription !== CheckboxGroupItemDescription) throw new Error('CheckboxGroup item metadata mismatch');",
      "const html = renderToStaticMarkup(React.createElement(Button.Root, { type: 'button' }, 'CI smoke'));",
      "if (!html.includes('data-slot=') || !html.includes('CI smoke')) throw new Error('Server render mismatch');",
      "",
    ].join("\n"),
  );

  await writeFile(
    path.join(consumerRoot, "rsc.mjs"),
    [
      'import { Badge, BadgeRoot } from "@flowstack-ui/atom/badge";',
      "if (Badge.Root !== BadgeRoot) throw new Error('Badge server export mismatch');",
      "if (typeof BadgeRoot !== 'object' && typeof BadgeRoot !== 'function') throw new Error('Badge server export missing');",
      "",
    ].join("\n"),
  );

  run(tscCommand, ["-p", "tsconfig.json"], consumerRoot);
  run(process.execPath, ["runtime.mjs"], consumerRoot);
  if (reactLine === "19") {
    run(process.execPath, ["--conditions", "react-server", "rsc.mjs"], consumerRoot);
  }

  console.log(
    `Verified packed Atom consumer with React ${versions.react} and React DOM ${versions.reactDom}.`,
  );
} finally {
  if (process.env.ATOM_KEEP_SMOKE_TEMP) {
    console.log(`Kept smoke directory: ${consumerRoot}`);
  } else {
    await rm(consumerRoot, { recursive: true, force: true });
  }
}
