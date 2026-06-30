import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuRoot,
  ContextMenuTrigger,
  MenuContent,
} from "../../dist/index.js";

test("ContextMenu primitives render right-click trigger state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ContextMenuRoot,
      { defaultOpen: true },
      React.createElement(ContextMenuTrigger, null, "Canvas"),
    ),
  );

  assert.match(html, /data-slot="context-menu-trigger"/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /display:contents/);
  assert.match(html, />Canvas<\/span>/);
});

test("ContextMenu wires anchor point into menu content", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/context-menu/ContextMenuRoot.tsx", packageRoot),
    "utf8",
  );
  const triggerSource = await readFile(
    new URL("src/primitives/context-menu/ContextMenuTrigger.tsx", packageRoot),
    "utf8",
  );
  const contentSource = await readFile(
    new URL("src/primitives/context-menu/ContextMenuContent.tsx", packageRoot),
    "utf8",
  );

  assert.equal(typeof ContextMenuContent, "object");
  assert.match(contentSource, /useContextMenuContext\(\)/);
  assert.match(contentSource, /forwardRef/);
  assert.match(contentSource, /<MenuContent \{\.\.\.props\} anchorPoint=\{anchorPoint\} ref=\{ref\} \/>/);
  assert.match(triggerSource, /firstElementChild \?\? triggerRef\.current/);
  assert.match(triggerSource, /ctx\.onInitialHighlight\(null\)/);
  assert.match(triggerSource, /ctx\.onInitialHighlight\("first"\)/);
  assert.match(triggerSource, /ctx\.onHighlight\(null\)/);
  assert.match(triggerSource, /"data-disabled": disabled \? "" : undefined/);
  assert.match(triggerSource, /if \(asChild\) \{\s*return cloneAndMerge\(children, triggerProps\);/s);
  assert.match(triggerSource, /return renderElement\(render, "span", \{ \.\.\.triggerProps, children \}\)/);
  assert.match(rootSource, /closeOnSelect = true/);
  assert.match(rootSource, /loop = true/);
  assert.match(rootSource, /closeOnEscape = true/);
  assert.match(rootSource, /closeOnSelect=\{closeOnSelect\}/);
  assert.match(rootSource, /loop=\{loop\}/);
  assert.match(rootSource, /closeOnEscape=\{closeOnEscape\}/);
});

test("ContextMenuTrigger supports asChild and render composition", () => {
  const asChildHtml = renderToStaticMarkup(
    React.createElement(
      ContextMenuRoot,
      null,
      React.createElement(
        ContextMenuTrigger,
        { asChild: true, className: "trigger-class" },
        React.createElement("button", { type: "button" }, React.createElement("span", null, "Canvas")),
      ),
    ),
  );

  assert.match(asChildHtml, /^<button/);
  assert.match(asChildHtml, /data-slot="context-menu-trigger"/);
  assert.match(asChildHtml, /class="trigger-class"/);
  assert.match(asChildHtml, /<span>Canvas<\/span>/);
  assert.equal((asChildHtml.match(/<button/g) ?? []).length, 1);

  const renderHtml = renderToStaticMarkup(
    React.createElement(
      ContextMenuRoot,
      null,
      React.createElement(
        ContextMenuTrigger,
        { render: "section", className: "render-class" },
        "Canvas",
      ),
    ),
  );

  assert.match(renderHtml, /^<section/);
  assert.match(renderHtml, /data-slot="context-menu-trigger"/);
  assert.match(renderHtml, /class="render-class"/);
  assert.match(renderHtml, />Canvas<\/section>/);
});
