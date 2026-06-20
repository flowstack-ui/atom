import {
  assert,
  packageRoot,
  readFile,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "../../dist/index.js";

import {
  getTabsTriggerTabStopValue,
} from "../../dist/_internal/primitives/tabs/TabsTrigger.js";

test("Tabs primitives render ARIA linked tab and panel", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      TabsRoot,
      { value: "account", orientation: "horizontal" },
      React.createElement(
        TabsList,
        { ariaLabel: "Settings" },
        React.createElement(TabsTrigger, { value: "account" }, "Account"),
        React.createElement(TabsTrigger, { value: "password" }, "Password"),
      ),
      React.createElement(TabsContent, { value: "account" }, "Account content"),
      React.createElement(TabsContent, { value: "password" }, "Password content"),
    ),
  );

  assert.match(html, /data-slot="tabs-root"/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-label="Settings"/);
  assert.match(html, /role="tab"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /aria-controls="[^"]+-panel-account"/);
  assert.match(html, /id="[^"]+-trigger-account"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-state="active"/);
  assert.match(html, /data-value="account"/);
  assert.match(html, /aria-selected="false"/);
  assert.match(html, /data-value="password"/);
  assert.match(html, /role="tabpanel"/);
  assert.match(html, /aria-labelledby="[^"]+-trigger-account"/);
  assert.doesNotMatch(html, /role="tabpanel"[^>]*tabindex=/);
  assert.match(html, /Account content/);
  assert.doesNotMatch(html, /Password content/);
});

test("TabsTrigger chooses a tabbable trigger when no value is active", () => {
  const disabledValues = new Set(["account"]);
  const getTriggerElement = (value) => ({
    disabled: disabledValues.has(value),
  });

  assert.equal(
    getTabsTriggerTabStopValue(["account", "password", "billing"], "", getTriggerElement),
    "password",
  );
  assert.equal(
    getTabsTriggerTabStopValue(["account", "password", "billing"], "billing", getTriggerElement),
    "billing",
  );
});

test("TabsContent focusable opts the panel into Tab order", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      TabsRoot,
      { value: "account" },
      React.createElement(
        TabsList,
        { ariaLabel: "Settings" },
        React.createElement(TabsTrigger, { value: "account" }, "Account"),
      ),
      React.createElement(TabsContent, { value: "account", focusable: true }, "Account content"),
      React.createElement(TabsContent, { value: "password", tabIndex: -1 }, "Password content"),
    ),
  );

  assert.match(html, /role="tabpanel"[^>]*tabindex="0"/);
  assert.doesNotMatch(html, /Password content/);
});

test("TabsContent native tabIndex overrides focusable", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      TabsRoot,
      { value: "account" },
      React.createElement(
        TabsList,
        { ariaLabel: "Settings" },
        React.createElement(TabsTrigger, { value: "account" }, "Account"),
      ),
      React.createElement(
        TabsContent,
        { value: "account", focusable: true, tabIndex: -1 },
        "Account content",
      ),
    ),
  );

  assert.match(html, /role="tabpanel"[^>]*tabindex="-1"/);
});

test("TabsContent keepMounted renders inactive panel hidden", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      TabsRoot,
      { value: "account" },
      React.createElement(
        TabsList,
        { ariaLabel: "Settings" },
        React.createElement(TabsTrigger, { value: "account" }, "Account"),
        React.createElement(TabsTrigger, { value: "password" }, "Password"),
      ),
      React.createElement(TabsContent, { value: "password", keepMounted: true }, "Password content"),
    ),
  );

  assert.match(html, /role="tabpanel"/);
  assert.match(html, /data-state="inactive"/);
  assert.match(html, /hidden=""/);
  assert.match(html, /Password content/);
});

test("TabsRoot source uses Collection for DOM-ordered trigger registration", async () => {
  const source = await readFile(
    new URL("src/primitives/tabs/TabsRoot.tsx", packageRoot),
    "utf8",
  );

  assert.match(source, /useCollection<string, HTMLButtonElement>\(\)/);
  assert.match(source, /registerCollectionTrigger/);
  assert.doesNotMatch(source, /compareDocumentPosition/);
});
