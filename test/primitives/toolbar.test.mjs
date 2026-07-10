import {
  assert,
  packageRoot,
  readFile,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Direction,
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarRoot,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "../../dist/index.js";

test("Toolbar primitives render toolbar roles and focusable items", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToolbarRoot,
      { ariaLabel: "Editor tools", className: "toolbar-class" },
      React.createElement(
        ToolbarButton,
        {
          id: "bold-toolbar-button",
          ariaLabel: "Bold",
          className: "button-class",
          "data-testid": "toolbar-button",
          title: "Bold",
        },
        "B",
      ),
      React.createElement(ToolbarLink, { href: "/docs", className: "link-class" }, "Docs"),
      React.createElement(ToolbarLink, { href: "/admin", disabled: true }, "Admin"),
      React.createElement(ToolbarSeparator, { className: "separator-class" }),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="toolbar"/);
  assert.match(html, /aria-label="Editor tools"/);
  assert.match(html, /aria-orientation="horizontal"/);
  assert.match(html, /data-slot="toolbar"/);
  assert.match(html, /class="toolbar-class"/);
  assert.match(html, /data-slot="toolbar-button"/);
  assert.match(html, /id="bold-toolbar-button"/);
  assert.match(html, /title="Bold"/);
  assert.match(html, /data-testid="toolbar-button"/);
  assert.match(html, /aria-label="Bold"/);
  assert.match(html, /class="button-class"/);
  assert.match(html, /data-slot="toolbar-link"/);
  assert.match(html, /href="\/docs"/);
  assert.match(html, /class="link-class"/);
  assert.match(html, /href="\/admin"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-slot="toolbar-separator"/);
  assert.match(html, /role="separator"/);
});

test("ToolbarRoot resolves local and provider direction", () => {
  const localHtml = renderToStaticMarkup(
    React.createElement(
      ToolbarRoot,
      { ariaLabel: "Editor tools", dir: "rtl" },
      React.createElement(ToolbarButton, null, "B"),
    ),
  );
  const providerHtml = renderToStaticMarkup(
    React.createElement(
      Direction.Provider,
      { dir: "rtl" },
      React.createElement(
        ToolbarRoot,
        { ariaLabel: "Editor tools" },
        React.createElement(ToolbarButton, null, "B"),
      ),
    ),
  );
  const overrideHtml = renderToStaticMarkup(
    React.createElement(
      Direction.Provider,
      { dir: "rtl" },
      React.createElement(
        ToolbarRoot,
        { ariaLabel: "Editor tools", dir: "ltr" },
        React.createElement(ToolbarButton, null, "B"),
      ),
    ),
  );

  assert.match(localHtml, /^<div dir="rtl"/);
  assert.match(providerHtml, /^<div dir="rtl"/);
  assert.match(overrideHtml, /^<div dir="ltr"/);
});

test("Toolbar parts allow data-slot overrides", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToolbarRoot,
      { ariaLabel: "Editor tools", "data-slot": "editor-toolbar" },
      React.createElement(
        ToolbarButton,
        { "data-slot": "editor-toolbar-button" },
        "B",
      ),
      React.createElement(
        ToolbarLink,
        { href: "/docs", "data-slot": "editor-toolbar-link" },
        "Docs",
      ),
      React.createElement(ToolbarSeparator, {
        "data-slot": "editor-toolbar-separator",
      }),
      React.createElement(
        ToolbarToggleGroup,
        {
          ariaLabel: "Formatting",
          "data-slot": "editor-toolbar-toggle-group",
        },
        React.createElement(
          ToolbarToggleItem,
          {
            value: "bold",
            "data-slot": "editor-toolbar-toggle-item",
          },
          "B",
        ),
      ),
    ),
  );

  assert.match(html, /data-slot="editor-toolbar"/);
  assert.match(html, /data-slot="editor-toolbar-button"/);
  assert.match(html, /data-slot="editor-toolbar-link"/);
  assert.match(html, /data-slot="editor-toolbar-separator"/);
  assert.match(html, /data-slot="editor-toolbar-toggle-group"/);
  assert.match(html, /data-slot="editor-toolbar-toggle-item"/);
  assert.doesNotMatch(html, /data-slot="toolbar-button"/);
  assert.doesNotMatch(html, /data-slot="toolbar-link"/);
  assert.doesNotMatch(html, /data-slot="toolbar-separator"/);
  assert.doesNotMatch(html, /data-slot="toolbar-toggle-group"/);
  assert.doesNotMatch(html, /data-slot="toolbar-toggle-item"/);
});

test("Toolbar parts support render composition", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToolbarRoot,
      {
        ariaLabel: "Editor tools",
        render: React.createElement("section", { className: "toolbar-shell" }),
      },
      React.createElement(
        ToolbarButton,
        {
          render: React.createElement("span", { className: "toolbar-action" }),
          ariaLabel: "Bold",
        },
        "B",
      ),
      React.createElement(
        ToolbarLink,
        {
          href: "/docs",
          render: React.createElement("a", { className: "toolbar-docs" }),
        },
        "Docs",
      ),
      React.createElement(ToolbarSeparator, {
        render: React.createElement("hr", { className: "toolbar-rule" }),
      }),
      React.createElement(
        ToolbarToggleGroup,
        {
          ariaLabel: "Formatting",
          render: React.createElement("section", { className: "toolbar-toggles" }),
        },
        React.createElement(
          ToolbarToggleItem,
          {
            value: "bold",
            render: React.createElement("span", { className: "toolbar-toggle" }),
          },
          "B",
        ),
      ),
    ),
  );

  assert.match(html, /^<section class="toolbar-shell"[^>]+role="toolbar"/);
  assert.match(html, /<span class="toolbar-action"[^>]+role="button"/);
  assert.match(html, /aria-label="Bold"/);
  assert.match(html, /data-slot="toolbar-button"/);
  assert.match(html, /<a class="toolbar-docs"[^>]+href="\/docs"/);
  assert.match(html, /data-slot="toolbar-link"/);
  assert.match(html, /<hr class="toolbar-rule"[^>]+role="separator"/);
  assert.match(html, /data-slot="toolbar-separator"/);
  assert.match(html, /<section class="toolbar-toggles"[^>]+role="group"/);
  assert.match(html, /data-slot="toolbar-toggle-group"/);
  assert.match(html, /<span class="toolbar-toggle"[^>]+role="button"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /data-slot="toolbar-toggle-item"/);
});

test("Toolbar parts support asChild composition", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToolbarRoot,
      { ariaLabel: "Editor tools", asChild: true },
      React.createElement(
        "section",
        { className: "toolbar-shell" },
        React.createElement(
          ToolbarButton,
          { asChild: true, disabled: true },
          React.createElement("span", { className: "toolbar-action" }, "B"),
        ),
        React.createElement(
          ToolbarLink,
          { href: "/docs", asChild: true },
          React.createElement("a", { className: "toolbar-docs" }, "Docs"),
        ),
        React.createElement(
          ToolbarSeparator,
          { asChild: true },
          React.createElement("div", { className: "toolbar-rule" }),
        ),
        React.createElement(
          ToolbarToggleGroup,
          { ariaLabel: "Formatting", asChild: true },
          React.createElement(
            "section",
            { className: "toolbar-toggles" },
            React.createElement(
              ToolbarToggleItem,
              { value: "bold", asChild: true },
              React.createElement("span", { className: "toolbar-toggle" }, "B"),
            ),
          ),
        ),
      ),
    ),
  );

  assert.match(html, /^<section class="toolbar-shell"[^>]+role="toolbar"/);
  assert.match(html, /<span class="toolbar-action"[^>]+role="button"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-slot="toolbar-button"/);
  assert.match(html, /<a class="toolbar-docs"[^>]+href="\/docs"/);
  assert.match(html, /data-slot="toolbar-link"/);
  assert.match(html, /<div class="toolbar-rule"[^>]+role="separator"/);
  assert.match(html, /data-slot="toolbar-separator"/);
  assert.match(html, /<section class="toolbar-toggles"[^>]+role="group"/);
  assert.match(html, /data-slot="toolbar-toggle-group"/);
  assert.match(html, /<span class="toolbar-toggle"[^>]+role="button"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /data-slot="toolbar-toggle-item"/);
});

test("Toolbar toggle group renders pressed item state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToolbarRoot,
      { ariaLabel: "Text tools" },
      React.createElement(
        ToolbarToggleGroup,
        { defaultValue: "bold", ariaLabel: "Formatting" },
        React.createElement(
          ToolbarToggleItem,
          {
            id: "bold-toolbar-toggle",
            value: "bold",
            title: "Bold",
            "data-testid": "toolbar-toggle-item",
          },
          "B",
        ),
        React.createElement(ToolbarToggleItem, { value: "italic" }, "I"),
      ),
    ),
  );

  assert.match(html, /data-slot="toolbar-toggle-group"/);
  assert.match(html, /role="group"/);
  assert.match(html, /aria-label="Formatting"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /id="bold-toolbar-toggle"/);
  assert.match(html, /title="Bold"/);
  assert.match(html, /data-testid="toolbar-toggle-item"/);
  assert.match(html, /data-state="on"/);
  assert.match(html, /data-value="bold"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /data-state="off"/);
  assert.match(html, /data-value="italic"/);
});

test("Toolbar toggle group supports multiple selected values", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToolbarRoot,
      { ariaLabel: "Text tools" },
      React.createElement(
        ToolbarToggleGroup,
        {
          type: "multiple",
          defaultValue: ["bold", "italic"],
          ariaLabel: "Formatting",
        },
        React.createElement(ToolbarToggleItem, { value: "bold" }, "B"),
        React.createElement(ToolbarToggleItem, { value: "italic" }, "I"),
        React.createElement(ToolbarToggleItem, { value: "underline" }, "U"),
      ),
    ),
  );

  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 2);
  assert.equal((html.match(/aria-pressed="false"/g) ?? []).length, 1);
  assert.match(html, /data-state="on" data-value="bold"/);
  assert.match(html, /data-state="on" data-value="italic"/);
  assert.match(html, /data-state="off" data-value="underline"/);
});

test("ToolbarRoot source uses Collection for DOM-ordered item registration", async () => {
  const source = await readFile(
    new URL("src/primitives/toolbar/ToolbarRoot.tsx", packageRoot),
    "utf8",
  );

  assert.match(source, /useCollection<string, HTMLElement>\(\)/);
  assert.match(source, /registerCollectionItem/);
  assert.doesNotMatch(source, /compareDocumentPosition/);
});
