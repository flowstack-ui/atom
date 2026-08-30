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

const [archiveInput, reactLine] = process.argv.slice(2);
const archive = await resolveArchive(archiveInput);
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
      'import { CheckboxGroup, Clipboard, Dialog, DragDrop, Highlight, Link, List, MultiSelect, Reorder, Select, Portal, type ClipboardStatusValue, type ValidationBehavior } from "@flowstack-ui/atom";',
      'import { DragDrop as DragDropSubpath, DragDropRoot } from "@flowstack-ui/atom/drag-drop";',
      'import { Reorder as ReorderSubpath, ReorderRoot, reorderItems } from "@flowstack-ui/atom/reorder";',
      'import { Clipboard as ClipboardSubpath, ClipboardTrigger } from "@flowstack-ui/atom/clipboard";',
      'import { Link as LinkSubpath, LinkRoot } from "@flowstack-ui/atom/link";',
      'import { Highlight as HighlightSubpath, HighlightRoot, findHighlightSegments } from "@flowstack-ui/atom/highlight";',
      'import type { ValidationBehavior as FormValidationBehavior } from "@flowstack-ui/atom/form";',
      'import { CheckboxGroupItemDescription, CheckboxGroupItemLabel, CheckboxGroupParent } from "@flowstack-ui/atom/checkbox-group";',
      'import { DialogContent, ModalRoot } from "@flowstack-ui/atom/dialog";',
      'import { SelectRoot, SelectTrigger } from "@flowstack-ui/atom/select";',
      'import { MultiSelect as MultiSelectSubpath, MultiSelectRoot, MultiSelectTrigger } from "@flowstack-ui/atom/multi-select";',
      "const dialogRoot: typeof Dialog.Root = ModalRoot;",
      "const dragDropRoot: typeof DragDrop.Root = DragDropRoot;",
      "const dragDropSubpathRoot: typeof DragDrop.Root = DragDropSubpath.Root;",
      "const reorderRoot: typeof Reorder.Root = ReorderRoot;",
      "const reorderSubpathRoot: typeof Reorder.Root = ReorderSubpath.Root;",
      "const dialogContent: typeof Dialog.Content = DialogContent;",
      "const selectRoot: typeof Select.Root = SelectRoot;",
      "const selectTrigger: typeof Select.Trigger = SelectTrigger;",
      "const multiSelectRoot: typeof MultiSelect.Root = MultiSelectRoot;",
      "const multiSelectTrigger: typeof MultiSelect.Trigger = MultiSelectTrigger;",
      "const multiSelectSubpathRoot: typeof MultiSelect.Root = MultiSelectSubpath.Root;",
      "const checkboxGroupParent: typeof CheckboxGroup.Parent = CheckboxGroupParent;",
      "const checkboxGroupItemLabel: typeof CheckboxGroup.ItemLabel = CheckboxGroupItemLabel;",
      "const checkboxGroupItemDescription: typeof CheckboxGroup.ItemDescription = CheckboxGroupItemDescription;",
      "const linkRoot: typeof Link.Root = LinkRoot;",
      "const linkSubpathRoot: typeof Link.Root = LinkSubpath.Root;",
      "const highlightRoot: typeof Highlight.Root = HighlightRoot;",
      "const highlightSubpathRoot: typeof Highlight.Root = HighlightSubpath.Root;",
      "const clipboardTrigger: typeof Clipboard.Trigger = ClipboardTrigger;",
      "const clipboardSubpathRoot: typeof Clipboard.Root = ClipboardSubpath.Root;",
      "void List.Root({ ordered: true, reversed: true, start: 4, children: null });",
      'const clipboardStatus: ClipboardStatusValue = "copied";',
      "void Link.Root({ href: '/guides', children: 'Guides' });",
      "void Highlight.Root({ text: 'Build with Brick', query: 'Brick' });",
      "const highlightSegments = findHighlightSegments('Atom and Brick', { query: ['Atom', 'Brick'] });",
      "// @ts-expect-error Native Link rendering requires href.",
      "void Link.Root({ children: 'Missing destination' });",
      'const validationBehavior: ValidationBehavior = "inline";',
      "const formValidationBehavior: FormValidationBehavior = validationBehavior;",
      "const reordered = reorderItems(['a', 'b'], 'a', 'b', 'after');",
      "void [dialogRoot, dialogContent, dragDropRoot, dragDropSubpathRoot, reorderRoot, reorderSubpathRoot, reordered, selectRoot, selectTrigger, multiSelectRoot, multiSelectTrigger, multiSelectSubpathRoot, checkboxGroupParent, checkboxGroupItemLabel, checkboxGroupItemDescription, highlightRoot, highlightSubpathRoot, highlightSegments, linkRoot, linkSubpathRoot, clipboardTrigger, clipboardSubpathRoot, clipboardStatus, validationBehavior, formValidationBehavior, List, Portal];",
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
      'import { Button, CheckboxGroup, Clipboard, Dialog, DragDrop, Highlight, Link, MultiSelect, Portal, Reorder, Select } from "@flowstack-ui/atom";',
      'import { DragDrop as DragDropSubpath, DragDropRoot } from "@flowstack-ui/atom/drag-drop";',
      'import { Reorder as ReorderSubpath, ReorderRoot, reorderItems } from "@flowstack-ui/atom/reorder";',
      'import { Clipboard as ClipboardSubpath, ClipboardRoot } from "@flowstack-ui/atom/clipboard";',
      'import { Link as LinkSubpath, LinkRoot } from "@flowstack-ui/atom/link";',
      'import { Highlight as HighlightSubpath, HighlightRoot } from "@flowstack-ui/atom/highlight";',
      'import { CheckboxGroup as CheckboxGroupSubpath, CheckboxGroupItemDescription, CheckboxGroupItemLabel, CheckboxGroupParent } from "@flowstack-ui/atom/checkbox-group";',
      'import { Dialog as DialogSubpath, DialogContent, ModalRoot } from "@flowstack-ui/atom/dialog";',
      'import { Portal as PortalSubpath } from "@flowstack-ui/atom/portal";',
      'import { Select as SelectSubpath, SelectRoot, SelectTrigger } from "@flowstack-ui/atom/select";',
      'import { MultiSelect as MultiSelectSubpath, MultiSelectRoot, MultiSelectTrigger } from "@flowstack-ui/atom/multi-select";',
      "if (Dialog.Root !== DialogSubpath.Root || Dialog.Content !== DialogSubpath.Content) throw new Error('Dialog namespace mismatch');",
      "if (DragDrop.Root !== DragDropSubpath.Root || DragDrop.Root !== DragDropRoot) throw new Error('DragDrop namespace mismatch');",
      "if (Reorder.Root !== ReorderSubpath.Root || Reorder.Root !== ReorderRoot) throw new Error('Reorder namespace mismatch');",
      "if (Select.Root !== SelectSubpath.Root || Select.Trigger !== SelectSubpath.Trigger) throw new Error('Select namespace mismatch');",
      "if (Select.Root !== SelectRoot || Select.Trigger !== SelectTrigger) throw new Error('Select direct export mismatch');",
      "if (MultiSelect.Root !== MultiSelectSubpath.Root || MultiSelect.Trigger !== MultiSelectSubpath.Trigger) throw new Error('MultiSelect namespace mismatch');",
      "if (MultiSelect.Root !== MultiSelectRoot || MultiSelect.Trigger !== MultiSelectTrigger) throw new Error('MultiSelect direct export mismatch');",
      "if (Dialog.Root !== ModalRoot || Dialog.Content !== DialogContent) throw new Error('Dialog shared export mismatch');",
      "if (Portal !== PortalSubpath) throw new Error('Portal mismatch');",
      "if (CheckboxGroup.Parent !== CheckboxGroupSubpath.Parent || CheckboxGroup.Parent !== CheckboxGroupParent) throw new Error('CheckboxGroup Parent mismatch');",
      "if (CheckboxGroup.ItemLabel !== CheckboxGroupItemLabel || CheckboxGroup.ItemDescription !== CheckboxGroupItemDescription) throw new Error('CheckboxGroup item metadata mismatch');",
      "if (Link.Root !== LinkSubpath.Root || Link.Root !== LinkRoot) throw new Error('Link namespace mismatch');",
      "if (Highlight.Root !== HighlightSubpath.Root || Highlight.Root !== HighlightRoot) throw new Error('Highlight namespace mismatch');",
      "if (Clipboard.Root !== ClipboardSubpath.Root || Clipboard.Root !== ClipboardRoot) throw new Error('Clipboard namespace mismatch');",
      "const linkHtml = renderToStaticMarkup(React.createElement(Link.Root, { href: '/guides' }, 'Guides'));",
      "if (!linkHtml.includes('href=\"/guides\"') || !linkHtml.includes('data-slot=\"link\"')) throw new Error('Link server render mismatch');",
      "const highlightHtml = renderToStaticMarkup(React.createElement(Highlight.Root, { text: 'Build with Brick', query: 'Brick' }));",
      "if (!highlightHtml.includes('data-slot=\"highlight\"') || !highlightHtml.includes('<mark data-slot=\"highlight-match\">Brick</mark>')) throw new Error('Highlight server render mismatch');",
      "const html = renderToStaticMarkup(React.createElement(Button.Root, { type: 'button' }, 'CI smoke'));",
      "if (!html.includes('data-slot=') || !html.includes('CI smoke')) throw new Error('Server render mismatch');",
      "const dragDropHtml = renderToStaticMarkup(React.createElement(DragDrop.Root, { instructions: 'Move the item.' }));",
      "if (!dragDropHtml.includes('drag-drop-announcer') || !dragDropHtml.includes('Move the item.')) throw new Error('DragDrop server render mismatch');",
      "const reorderHtml = renderToStaticMarkup(React.createElement(Reorder.Root, { items: [], getItemLabel: (value) => value, onItemsChange: () => {} }));",
      "if (!reorderHtml.includes('data-slot=\"reorder\"') || reorderItems(['a', 'b'], 'a', 'b', 'after').items[1] !== 'a') throw new Error('Reorder consumer mismatch');",
      "const multiSelectHtml = renderToStaticMarkup(React.createElement(MultiSelect.Root, { defaultValue: ['design'], name: 'skills' }, React.createElement(MultiSelect.Trigger, null, React.createElement(MultiSelect.Value, { placeholder: 'Choose skills' }))));",
      "if (!multiSelectHtml.includes('multiple=\"\"') || !multiSelectHtml.includes('name=\"skills\"') || !multiSelectHtml.includes('aria-haspopup=\"listbox\"')) throw new Error('MultiSelect server render mismatch');",
      "",
    ].join("\n"),
  );

  await writeFile(
    path.join(consumerRoot, "rsc.mjs"),
    [
      'import { Badge, BadgeRoot } from "@flowstack-ui/atom/badge";',
      'import { Divider, DividerRoot } from "@flowstack-ui/atom/divider";',
      'import { Link, LinkRoot } from "@flowstack-ui/atom/link";',
      'import { Highlight, HighlightRoot } from "@flowstack-ui/atom/highlight";',
      "if (Badge.Root !== BadgeRoot) throw new Error('Badge server export mismatch');",
      "if (Divider.Root !== DividerRoot) throw new Error('Divider server export mismatch');",
      "if (Link.Root !== LinkRoot) throw new Error('Link server export mismatch');",
      "if (Highlight.Root !== HighlightRoot) throw new Error('Highlight server export mismatch');",
      "if (typeof BadgeRoot !== 'object' && typeof BadgeRoot !== 'function') throw new Error('Badge server export missing');",
      "if (typeof DividerRoot !== 'object' && typeof DividerRoot !== 'function') throw new Error('Divider server export missing');",
      "",
    ].join("\n"),
  );

  await writeFile(
    path.join(consumerRoot, "agent-knowledge.mjs"),
    [
      'import { createRequire } from "node:module";',
      'const require = createRequire(import.meta.url);',
      'const manifest = require("@flowstack-ui/atom/agents/manifest.json");',
      'const coverage = require("@flowstack-ui/atom/agents/coverage.json");',
      'if (manifest.schema !== "flowstack.agent-manifest.v1" || coverage.schema !== "flowstack.agent-coverage.v1") throw new Error("Agent discovery schema mismatch");',
      'if (manifest.package !== coverage.package || manifest.packageVersion !== coverage.packageVersion) throw new Error("Agent package identity mismatch");',
      'if (coverage.summary.unclassified || coverage.summary.invalidExclusions || coverage.summary.unresolvedSelections) throw new Error("Agent catalog has unresolved coverage");',
      'const incompleteOwners = coverage.summary.guidedComponentOwners !== coverage.summary.componentOwners;',
      'if (incompleteOwners || coverage.failures.length) throw new Error("Installed Agent Knowledge catalog is incomplete");',
      'const manifestComponentIds = manifest.components.map(({ id }) => id).sort();',
      'const coveredComponentIds = coverage.components.filter(({ status }) => status === "covered").map(({ id }) => id).sort();',
      'if (JSON.stringify(manifestComponentIds) !== JSON.stringify(coveredComponentIds)) throw new Error("Installed component discovery differs from source coverage");',
      'for (const record of [...manifest.components, ...manifest.guides]) {',
      '  const artifact = require(`@flowstack-ui/atom/agents/${record.id}.json`);',
      '  if (artifact.id !== record.id || artifact.package !== manifest.package || artifact.layer !== "atom") throw new Error(`Invalid installed agent artifact: ${record.id}`);',
      '}',
      'for (const component of coverage.components) {',
      '  if (!Array.isArray(component.publicValueSymbols) || component.publicSubpaths.length !== 1) throw new Error(`Invalid installed component surface: ${component.id}`);',
      '  if (component.manifestPaths.json !== `./${component.id}.json` || component.manifestPaths.markdown !== `./${component.id}.md`) throw new Error(`Invalid installed manifest paths: ${component.id}`);',
      '  const module = await import(`@flowstack-ui/atom/${component.publicSubpaths[0].slice(2)}`);',
      '  for (const symbol of component.publicValueSymbols) if (!(symbol in module)) throw new Error(`Missing installed public symbol: ${component.id}#${symbol}`);',
      '}',
      '',
    ].join("\n"),
  );

  run(tscCommand, ["-p", "tsconfig.json"], consumerRoot);
  run(process.execPath, ["runtime.mjs"], consumerRoot);
  run(process.execPath, ["agent-knowledge.mjs"], consumerRoot);
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
