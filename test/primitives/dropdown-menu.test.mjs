import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  DropdownMenuTrigger,
  MenuContent,
  MenuRoot,
} from "../../dist/index.js";

test("DropdownMenuTrigger renders menu trigger attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      MenuRoot,
      null,
      React.createElement(
        DropdownMenuTrigger,
        { className: "dropdown-trigger-class", disabled: true },
        "Actions",
      ),
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /type="button"/);
  assert.match(html, /data-slot="dropdown-menu-trigger"/);
  assert.match(html, /data-state="closed"/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /aria-haspopup="menu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="[^"]+"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /class="dropdown-trigger-class"/);
});

test("DropdownMenuTrigger delegates initial highlight direction to menu content", async () => {
  const triggerSource = await readFile(
    new URL("src/primitives/dropdown-menu/DropdownMenuTrigger.tsx", packageRoot),
    "utf8",
  );
  const contentSource = await readFile(
    new URL("src/primitives/menu/MenuContent.tsx", packageRoot),
    "utf8",
  );

  assert.match(triggerSource, /ctx\.onInitialHighlight\(null\)/);
  assert.match(triggerSource, /event\.key === "Enter" \|\| event\.key === " " \|\| event\.key === "ArrowDown"/);
  assert.match(triggerSource, /ctx\.onInitialHighlight\("first"\)/);
  assert.match(triggerSource, /ctx\.onInitialHighlight\("last"\)/);
  assert.doesNotMatch(triggerSource, /requestAnimationFrame\(\(\) => \{\s*const values = ctx\.getItemValues/s);
  assert.match(contentSource, /initialHighlight === "last" \? values\[values\.length - 1\] : values\[0\]/);
});

test("DropdownMenuTrigger disabled asChild is removed from tab order", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      MenuRoot,
      null,
      React.createElement(
        DropdownMenuTrigger,
        { asChild: true, disabled: true },
        React.createElement("button", null, "Actions"),
      ),
    ),
  );

  assert.match(html, /<button/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /data-disabled=""/);
});

test("DropdownMenuTrigger asChild preserves child content without nesting", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      MenuRoot,
      null,
      React.createElement(
        DropdownMenuTrigger,
        { asChild: true },
        React.createElement("button", null, React.createElement("span", null, "Actions")),
      ),
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /<span>Actions<\/span>/);
  assert.equal((html.match(/<button/g) ?? []).length, 1);
});
