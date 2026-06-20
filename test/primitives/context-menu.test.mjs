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

  assert.equal(typeof ContextMenuContent, "function");
  assert.match(contentSource, /useContextMenuContext\(\)/);
  assert.match(contentSource, /<MenuContent \{\.\.\.props\} anchorPoint=\{anchorPoint\} \/>/);
  assert.match(triggerSource, /firstElementChild \?\? spanRef\.current/);
  assert.match(triggerSource, /ctx\.onHighlight\(null\)/);
  assert.match(triggerSource, /data-disabled=\{disabled \? "" : undefined\}/);
  assert.match(rootSource, /closeOnSelect = true/);
  assert.match(rootSource, /loop = true/);
  assert.match(rootSource, /closeOnEscape = true/);
  assert.match(rootSource, /closeOnSelect=\{closeOnSelect\}/);
  assert.match(rootSource, /loop=\{loop\}/);
  assert.match(rootSource, /closeOnEscape=\{closeOnEscape\}/);
});
