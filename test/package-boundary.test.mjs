import {
  assert,
  readFile,
  path,
  test,
  packageRoot,
  publicSubpaths,
  namespaceNameForSubpath,
  listSourceFiles,
} from "./test-utils.mjs";
import { access, readdir } from "node:fs/promises";

import {
  ContextMenuTrigger,
  HoverCardArrow,
  MenuContent,
  MenuSubContent,
  MenubarContent,
  MenubarRoot,
  MenubarTrigger,
  ModalDescription,
  ModalTitle,
  PopoverArrow,
  TooltipArrow,
} from "../dist/index.js";

test("package boundary keeps only approved headless runtime dependencies", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("package.json", packageRoot), "utf8"),
  );

  assert.equal(packageJson.version, "0.23.1");
  assert.equal(packageJson.repository.url, "git+https://github.com/flowstack-ui/atom.git");
  assert.deepEqual(packageJson.publishConfig, { access: "public" });
  assert.deepEqual(packageJson.dependencies ?? {}, {
    "@floating-ui/react": "^0.27.19",
  });
  assert.deepEqual(packageJson.peerDependencies, {
    react: ">=18",
    "react-dom": ">=18",
  });
  assert.deepEqual(
    Object.keys(packageJson.exports).sort(),
    [
      ".",
      "./agents/coverage.json",
      "./agents/manifest.json",
      "./agents/*.json",
      "./agents/*.md",
      ...publicSubpaths.map((subpath) => `./${subpath}`),
    ].sort(),
  );
});

test("release identity, changelog, and trusted-publishing provenance stay aligned", async () => {
  const [packageJsonSource, lockSource, changelog, workflow] = await Promise.all([
    readFile(new URL("package.json", packageRoot), "utf8"),
    readFile(new URL("package-lock.json", packageRoot), "utf8"),
    readFile(new URL("CHANGELOG.md", packageRoot), "utf8"),
    readFile(new URL(".github/workflows/publish.yml", packageRoot), "utf8"),
  ]);
  const packageJson = JSON.parse(packageJsonSource);
  const packageLock = JSON.parse(lockSource);

  assert.equal(packageLock.version, packageJson.version);
  assert.equal(packageLock.packages[""].version, packageJson.version);
  assert.match(changelog, new RegExp(`^## ${packageJson.version} - 2026-08-28$`, "m"));
  assert.match(workflow, /npm publish[^\n]+--provenance/u);
});

test("release verification tiers do not recurse", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("package.json", packageRoot), "utf8"),
  );
  const releaseScript = await readFile(
    new URL("scripts/test-all.mjs", packageRoot),
    "utf8",
  );

  assert.equal(packageJson.scripts["check:release"], "npm run test:all");
  assert.match(releaseScript, /\["run", "check:repository"\]/);
  assert.match(releaseScript, /\["run", "test:browser"\]/);
  assert.match(releaseScript, /\["run", "pack:check"\]/);
  assert.doesNotMatch(releaseScript, /\["run", "(?:check:release|release:check|test:all)"\]/);
});

test("Agent Knowledge verification has no partial-coverage escape hatch", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("package.json", packageRoot), "utf8"),
  );
  const verificationSources = await Promise.all(
    [
      "scripts/agent-catalog.mjs",
      "scripts/build-agent-knowledge.mjs",
      "scripts/verify-packed-package.mjs",
      "scripts/smoke-packed-consumer.mjs",
    ].map((file) => readFile(new URL(file, packageRoot), "utf8")),
  );

  assert.deepEqual(
    Object.keys(packageJson.scripts).filter((name) => name.endsWith(":partial")),
    [],
  );
  for (const source of verificationSources) {
    assert.doesNotMatch(source, /--partial|uncovered-component.*temporary|temporary component-guide backlog/);
  }
});

test("generated Agent Knowledge has defined related guidance labels", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("dist/agents/manifest.json", packageRoot), "utf8"),
  );

  for (const record of [...manifest.guides, ...manifest.components]) {
    const markdown = await readFile(
      new URL(`dist/agents/${record.id}.md`, packageRoot),
      "utf8",
    );
    const relatedSection = markdown.split("## Related guidance\n\n")[1] ?? "";
    assert.doesNotMatch(
      relatedSection,
      /\bundefined\b/,
      `${record.id} must not contain an undefined related guidance label`,
    );
  }
});

test("compiled package keeps implementation files under private internal chunks", async () => {
  const distRoot = new URL("dist/", packageRoot);
  const publicDistEntries = await readdir(distRoot);
  const buttonEntry = await readFile(new URL("dist/button.js", packageRoot), "utf8");
  const hooksEntry = await readFile(new URL("dist/hooks.js", packageRoot), "utf8");
  const hooksDeclaration = await readFile(
    new URL("dist/hooks.d.ts", packageRoot),
    "utf8",
  );

  assert.ok(publicDistEntries.includes("_internal"));
  assert.equal(publicDistEntries.includes("primitives"), false);
  assert.equal(publicDistEntries.includes("utils"), false);
  assert.equal(publicDistEntries.includes("hooks"), false);

  await assert.rejects(access(new URL("dist/primitives/", packageRoot)));
  await assert.rejects(access(new URL("dist/utils/", packageRoot)));
  await assert.rejects(access(new URL("dist/hooks/", packageRoot)));
  await assert.rejects(access(new URL("dist/interactions.d.ts", packageRoot)));
  await access(new URL("dist/_internal/primitives/", packageRoot));
  await access(new URL("dist/_internal/utils/", packageRoot));
  await access(new URL("dist/_internal/hooks/", packageRoot));
  await access(new URL("dist/_internal/utils/interactions.d.ts", packageRoot));

  assert.match(buttonEntry, /"\.\/_internal\/primitives\/button/);
  assert.doesNotMatch(buttonEntry, /"_internal\/primitives\/dialog/);
  assert.doesNotMatch(buttonEntry, /"_internal\/primitives\/select/);
  assert.match(hooksEntry, /"\.\/_internal\/hooks\/useControllableState/);
  assert.match(hooksDeclaration, /"\.\/_internal\/utils\/interactions\.js"/);
});

test("README documents namespace API, subpaths, and package boundaries", async () => {
  const readme = await readFile(new URL("README.md", packageRoot), "utf8");

  assert.match(readme, /namespace exports are the stable API/);
  assert.match(readme, /Subpath imports are also supported/);
  assert.match(readme, /Direct part exports are available from component subpaths/);
  assert.match(readme, /@flowstack-ui\/atom\/switch/);
  assert.match(readme, /@flowstack-ui\/atom\/hooks/);
  assert.match(readme, /@flowstack-ui\/atom\/portal/);
  assert.match(readme, /does not ship CSS/);
  assert.match(readme, /Higher-level sorting, filtering, editing, column models, and data fetching are/);
});

test("public component docs and changelogs cover component-style subpaths", async () => {
  const excludedDocsSubpaths = new Set(["hooks"]);
  const importsGuide = await readFile(
    new URL("docs/guides/imports.md", packageRoot),
    "utf8",
  );

  assert.match(importsGuide, /@flowstack-ui\/atom\/input/);
  assert.match(importsGuide, /@flowstack-ui\/atom\/dialog/);

  for (const subpath of publicSubpaths.filter((value) => !excludedDocsSubpaths.has(value))) {
    const docsRoot = new URL(`docs/components/${subpath}/`, packageRoot);
    const readme = await readFile(new URL("README.md", docsRoot), "utf8");
    const changelog = await readFile(new URL("CHANGELOG.md", docsRoot), "utf8");
    const namespace = namespaceNameForSubpath(subpath);

    assert.match(readme, new RegExp(`# ${namespace}`));
    assert.ok(
      /@flowstack-ui\/atom"/.test(readme) || new RegExp(`@flowstack-ui/atom/${subpath}`).test(readme),
      `${namespace} README should document an Atom import`,
    );
    assert.match(readme, /## Accessibility/);
    assert.ok(
      /## API Reference/.test(readme) || /## Behavior/.test(readme),
      `${namespace} README should document either API Reference or Behavior`,
    );
    assert.ok(
      /## Anatomy/.test(readme) || /## Behavior/.test(readme),
      `${namespace} README should document either Anatomy or legacy Behavior`,
    );
    assert.ok(
      /Data attribute/.test(readme) || /## Data Attributes/.test(readme),
      `${namespace} README should document data attributes`,
    );
    assert.match(changelog, new RegExp(`# ${namespace} Changelog`));
    assert.match(changelog, /## (?:Unreleased|\d+\.\d+\.\d+)/);
  }
});

test("public client entrypoints preserve Next.js client boundaries", async () => {
  const indexSource = await readFile(new URL("src/index.ts", packageRoot), "utf8");
  const namespaceSource = await readFile(new URL("src/namespaces.ts", packageRoot), "utf8");
  const serverSafeSubpaths = new Set(["app-bar", "badge", "divider", "label", "link", "list", "table"]);

  assert.match(indexSource, /^"use client";/);
  assert.match(namespaceSource, /^"use client";/);

  for (const subpath of publicSubpaths) {
    const source = await readFile(new URL(`src/${subpath}.ts`, packageRoot), "utf8");
    if (serverSafeSubpaths.has(subpath)) {
      assert.doesNotMatch(source, /^"use client";/, `${subpath} entrypoint should stay server-safe`);
      continue;
    }
    assert.match(source, /^"use client";/, `${subpath} entrypoint is missing "use client"`);
  }
});

test("source does not import styling, color, theme, icon, or framework concerns", async () => {
  const files = await listSourceFiles(new URL("src/", packageRoot));
  const forbiddenPatterns = [
    /tailwind/,
    /\bcn\(/,
    /theme/i,
    /lucide/,
    /next\//,
  ];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const relativePath = path.relative(packageRoot.pathname, file.pathname);

    for (const pattern of forbiddenPatterns) {
      assert.equal(
        pattern.test(source),
        false,
        `${relativePath} matched forbidden Atom boundary pattern ${pattern}`,
      );
    }
  }
});

test("source keeps shared primitive internals stable", async () => {
  const scrollLockSource = await readFile(
    new URL("src/hooks/useScrollLock.ts", packageRoot),
    "utf8",
  );
  const floatingArrowSource = await readFile(
    new URL("src/utils/floatingArrow.tsx", packageRoot),
    "utf8",
  );
  const tooltipArrowSource = await readFile(
    new URL("src/primitives/tooltip/TooltipArrow.tsx", packageRoot),
    "utf8",
  );
  const hoverCardArrowSource = await readFile(
    new URL("src/primitives/hover-card/HoverCardArrow.tsx", packageRoot),
    "utf8",
  );
  const popoverArrowSource = await readFile(
    new URL("src/primitives/popover/PopoverArrow.tsx", packageRoot),
    "utf8",
  );
  const modalIsolationSource = await readFile(
    new URL("src/primitives/modal/isolation.ts", packageRoot),
    "utf8",
  );
  const modalPortalSource = await readFile(
    new URL("src/primitives/modal/ModalPortal.tsx", packageRoot),
    "utf8",
  );
  const portalSource = await readFile(
    new URL("src/utils/Portal.tsx", packageRoot),
    "utf8",
  );

  assert.match(scrollLockSource, /const statesByDocument = new WeakMap/);
  assert.match(scrollLockSource, /registrations: new Set/);
  assert.match(scrollLockSource, /canAllowedRegionConsumeScroll/);
  assert.match(scrollLockSource, /touchMoveHandler/);
  assert.match(scrollLockSource, /state\.registrations\.size === 0/);
  assert.match(scrollLockSource, /Object\.assign\(ownerDocument\.body\.style, bodyStyle\)/);
  assert.match(floatingArrowSource, /export function getFloatingArrowGeometry/);
  assert.match(floatingArrowSource, /export const FloatingArrow = forwardRef/);
  assert.match(tooltipArrowSource, /getFloatingArrowGeometry\(side, width, height\)/);
  assert.match(hoverCardArrowSource, /getFloatingArrowGeometry\(side, width, height\)/);
  assert.match(popoverArrowSource, /getFloatingArrowGeometry\(side, width, height\)/);
  assert.doesNotMatch(tooltipArrowSource, /staticSideByPlacement/);
  assert.doesNotMatch(hoverCardArrowSource, /staticSideByPlacement/);
  assert.doesNotMatch(popoverArrowSource, /staticSideByPlacement/);
  assert.match(modalIsolationSource, /new MutationObserver/);
  assert.match(modalIsolationSource, /preservedPaths/);
  assert.match(modalIsolationSource, /restoreAll/);
  assert.match(modalPortalSource, /current document/);
  assert.match(portalSource, /container\?: HTMLElement \| null/);
  assert.doesNotMatch(portalSource, /DocumentFragment/);
});

test("source exposes refs and client boundaries on public wrappers", async () => {
  const modalTitleSource = await readFile(
    new URL("src/primitives/modal/ModalTitle.tsx", packageRoot),
    "utf8",
  );
  const modalDescriptionSource = await readFile(
    new URL("src/primitives/modal/ModalDescription.tsx", packageRoot),
    "utf8",
  );
  const contextMenuTriggerSource = await readFile(
    new URL("src/primitives/context-menu/ContextMenuTrigger.tsx", packageRoot),
    "utf8",
  );
  const menuContentSource = await readFile(
    new URL("src/primitives/menu/MenuContent.tsx", packageRoot),
    "utf8",
  );
  const menuSubContentSource = await readFile(
    new URL("src/primitives/menu/MenuSubContent.tsx", packageRoot),
    "utf8",
  );
  const menubarRootSource = await readFile(
    new URL("src/primitives/menubar/MenubarRoot.tsx", packageRoot),
    "utf8",
  );
  const menubarTriggerSource = await readFile(
    new URL("src/primitives/menubar/MenubarTrigger.tsx", packageRoot),
    "utf8",
  );
  const menubarContentSource = await readFile(
    new URL("src/primitives/menubar/MenubarContent.tsx", packageRoot),
    "utf8",
  );

  assert.match(modalTitleSource, /^"use client";/);
  assert.match(modalDescriptionSource, /^"use client";/);
  assert.match(modalTitleSource, /forwardRef<\s*HTMLHeadingElement,\s*ModalTitleProps\s*>/);
  assert.match(modalDescriptionSource, /forwardRef<\s*HTMLParagraphElement,\s*ModalDescriptionProps\s*>/);
  assert.match(contextMenuTriggerSource, /forwardRef<\s*HTMLElement,\s*ContextMenuTriggerProps\s*>/);
  assert.match(contextMenuTriggerSource, /composeRefs\(triggerRef, ctx\.triggerRef, ref\)/);
  assert.match(menuContentSource, /forwardRef<\s*HTMLDivElement,\s*MenuContentProps\s*>/);
  assert.match(menuContentSource, /composeRefs\(refs\.setFloating, internalRef, contentRef, presenceRef, ref\)/);
  assert.match(menuSubContentSource, /forwardRef<\s*HTMLDivElement,\s*MenuSubContentProps\s*>/);
  assert.match(menuSubContentSource, /composeRefs\(refs\.setFloating, internalRef, presenceRef, ref\)/);
  assert.match(menubarRootSource, /forwardRef<\s*HTMLElement,\s*MenubarRootProps\s*>/);
  assert.match(menubarRootSource, /cloneAndMerge\(children, behaviorProps\)/);
  assert.match(menubarRootSource, /renderElement\(render, "div"/);
  assert.match(menubarTriggerSource, /forwardRef<\s*HTMLElement,\s*MenubarTriggerProps\s*>/);
  assert.match(menubarTriggerSource, /composeRefs\(triggerRef, forwardedRef\)/);
  assert.match(menubarContentSource, /forwardRef<\s*HTMLDivElement,\s*MenubarContentProps\s*>/);
  assert.match(menubarContentSource, /<MenuContent\s*\{\.\.\.restProps\}\s*ref=\{ref\}/s);
  assert.match(menubarContentSource, /asChild=\{asChild\}/);
  assert.match(menubarContentSource, /render=\{render\}/);
});

test("context sources set display names for debugging", async () => {
  const files = await listSourceFiles(new URL("src/primitives/", packageRoot));

  for (const file of files.filter((entry) => entry.pathname.endsWith("/context.ts"))) {
    const source = await readFile(file, "utf8");
    const relativePath = path.relative(packageRoot.pathname, file.pathname);
    const contextNames = [...source.matchAll(/const (\w+) = createContext/g)].map(
      (match) => match[1],
    );

    for (const contextName of contextNames) {
      assert.match(
        source,
        new RegExp(`${contextName}\\.displayName = "${contextName}"`),
        `${relativePath} is missing ${contextName}.displayName`,
      );
    }
  }
});
