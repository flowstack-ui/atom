import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Sidebar,
  SidebarMain,
  SidebarPanel,
  SidebarRoot,
  SidebarTrigger,
  useControllableState,
} from "../../dist/index.js";

test("Sidebar compound parts render app-shell state anatomy", () => {
  const railHtml = renderToStaticMarkup(
    React.createElement(
      Sidebar.Root,
      { defaultState: "rail", collapsedState: "rail", side: "right" },
      React.createElement(Sidebar.Trigger, null, "Toggle"),
      React.createElement(Sidebar.Panel, { "aria-label": "Workspace navigation" }, "Navigation"),
      React.createElement(Sidebar.Main, null, "Main content"),
    ),
  );

  assert.match(railHtml, /^<div/);
  assert.match(railHtml, /data-slot="sidebar"/);
  assert.match(railHtml, /data-state="rail"/);
  assert.match(railHtml, /data-side="right"/);
  assert.match(railHtml, /data-collapsed-state="rail"/);
  assert.match(railHtml, /data-slot="sidebar-trigger"/);
  assert.match(railHtml, /data-target-state="expanded"/);
  assert.match(railHtml, /aria-expanded="false"/);
  assert.match(railHtml, /data-slot="sidebar-panel"/);
  assert.match(railHtml, /<aside/);
  assert.doesNotMatch(railHtml, /aria-hidden="true"/);
  assert.doesNotMatch(railHtml, /inert=""/);
  assert.match(railHtml, /<main/);
  assert.match(railHtml, /<main[^>]*data-state="rail"/);
  assert.equal(Sidebar.Root, SidebarRoot);
  assert.equal(Sidebar.Trigger, SidebarTrigger);
  assert.equal(Sidebar.Panel, SidebarPanel);
  assert.equal(Sidebar.Main, SidebarMain);
});

test("Sidebar offcanvas state removes the panel from the accessibility tree", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SidebarRoot,
      { state: "offcanvas" },
      React.createElement(SidebarTrigger, { toState: "expanded" }, "Open"),
      React.createElement(SidebarPanel, { "aria-label": "Workspace navigation" }, "Navigation"),
      React.createElement(SidebarMain, null, "Main content"),
    ),
  );

  assert.match(html, /data-slot="sidebar"/);
  assert.match(html, /data-state="offcanvas"/);
  assert.match(html, /data-collapsed-state="offcanvas"/);
  assert.match(html, /data-slot="sidebar-trigger"/);
  assert.match(html, /data-target-state="expanded"/);
  assert.match(html, /data-slot="sidebar-panel"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /inert=""/);
  assert.match(html, /<main[^>]*data-state="offcanvas"/);
});

test("Sidebar source keeps layout state headless and offcanvas-safe", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/sidebar/SidebarRoot.tsx", packageRoot),
    "utf8",
  );
  const triggerSource = await readFile(
    new URL("src/primitives/sidebar/SidebarTrigger.tsx", packageRoot),
    "utf8",
  );
  const panelSource = await readFile(
    new URL("src/primitives/sidebar/SidebarPanel.tsx", packageRoot),
    "utf8",
  );
  const mainSource = await readFile(
    new URL("src/primitives/sidebar/SidebarMain.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /useControllableState<SidebarState>/);
  assert.match(rootSource, /collapsedState = "offcanvas"/);
  assert.match(rootSource, /side = "left"/);
  assert.match(triggerSource, /toState \?\?/);
  assert.match(triggerSource, /isSidebarTriggerActivationKey\(event\.key\)/);
  assert.match(panelSource, /aria-hidden": isOffcanvas \? true : undefined/);
  assert.match(panelSource, /inert: isOffcanvas \? true : undefined/);
  assert.match(mainSource, /data-state/);
  assert.doesNotMatch(rootSource, /className/);
  assert.doesNotMatch(panelSource, /className/);
  assert.doesNotMatch(mainSource, /className/);
});
