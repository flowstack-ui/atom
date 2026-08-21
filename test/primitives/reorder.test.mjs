import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Reorder,
  ReorderDropIndicator,
  ReorderHandle,
  ReorderItem,
  ReorderMoveAfter,
  ReorderMoveBefore,
  ReorderMoveToEnd,
  ReorderMoveToStart,
  ReorderRoot,
  reorderItems,
} from "../../dist/index.js";

function renderReorder(items = ["verify", "approve", "deploy"], rootProps = {}) {
  const labels = {
    verify: "Verify production",
    approve: "Request approval",
    deploy: "Deploy release",
  };
  return renderToStaticMarkup(
    React.createElement(
      Reorder.Root,
      {
        items,
        getItemLabel: (value) => labels[value] ?? value,
        onItemsChange: () => {},
        ...rootProps,
      },
      items.map((value) => React.createElement(
        Reorder.Item,
        { key: value, value },
        React.createElement(Reorder.Handle, { "aria-label": `Move ${labels[value]}` }, "Move"),
        React.createElement("span", null, labels[value]),
        React.createElement(Reorder.MoveBefore, { "aria-label": `Move ${labels[value]} up` }, "Up"),
        React.createElement(Reorder.MoveAfter, { "aria-label": `Move ${labels[value]} down` }, "Down"),
        React.createElement(Reorder.MoveToStart, { "aria-label": `Move ${labels[value]} first` }, "First"),
        React.createElement(Reorder.MoveToEnd, { "aria-label": `Move ${labels[value]} last` }, "Last"),
        React.createElement(Reorder.DropIndicator),
      )),
    ),
  );
}

test("Reorder renders ordered-list semantics, controls, boundaries, and drop indicators", () => {
  const html = renderReorder();

  assert.match(html, /^<ol data-slot="reorder" data-orientation="vertical">/);
  assert.equal((html.match(/<li data-slot="reorder-item"/g) ?? []).length, 3);
  assert.equal((html.match(/data-slot="reorder-handle"/g) ?? []).length, 3);
  assert.match(html, /disabled="" data-slot="reorder-move-before" data-move="before"/);
  assert.match(html, /data-slot="reorder-move-after" data-move="after"/);
  assert.match(html, /disabled="" data-slot="reorder-move-after" data-move="after"[^>]*>Down<\/button><button[^>]+data-slot="reorder-move-start"/);
  assert.equal((html.match(/data-slot="reorder-drop-indicator" data-state="inactive"/g) ?? []).length, 3);
  assert.equal(Reorder.Root, ReorderRoot);
  assert.equal(Reorder.Item, ReorderItem);
  assert.equal(Reorder.Handle, ReorderHandle);
  assert.equal(Reorder.MoveBefore, ReorderMoveBefore);
  assert.equal(Reorder.MoveAfter, ReorderMoveAfter);
  assert.equal(Reorder.MoveToStart, ReorderMoveToStart);
  assert.equal(Reorder.MoveToEnd, ReorderMoveToEnd);
  assert.equal(Reorder.DropIndicator, ReorderDropIndicator);
});

test("Reorder exposes disabled and read-only root state", () => {
  const html = renderReorder(["verify"], { disabled: true, readOnly: true, orientation: "horizontal" });
  assert.match(html, /^<ol data-slot="reorder" data-orientation="horizontal" data-disabled="" data-readonly="">/);
  assert.equal((html.match(/ disabled=""/g) ?? []).length, 5);
});

test("Reorder Root supports asChild without replacing the authored list", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Reorder.Root,
      {
        asChild: true,
        items: [],
        getItemLabel: (value) => value,
        onItemsChange: () => {},
      },
      React.createElement("ul", { "aria-label": "Manual order" }),
    ),
  );

  assert.match(html, /^<ul aria-label="Manual order" data-slot="reorder" data-orientation="vertical"><\/ul>/);
  assert.doesNotMatch(html, /<ol/);
});

test("reorderItems keeps stable identities and computes final indices", () => {
  assert.deepEqual(
    reorderItems(["a", "b", "c", "d"], "b", "d", "after"),
    { items: ["a", "c", "d", "b"], previousIndex: 1, nextIndex: 3 },
  );
  assert.deepEqual(
    reorderItems(["a", "b", "c", "d"], "d", "b", "before"),
    { items: ["a", "d", "b", "c"], previousIndex: 3, nextIndex: 1 },
  );
  assert.deepEqual(
    reorderItems(["a", "b"], "missing", "a", "before"),
    { items: ["a", "b"], previousIndex: -1, nextIndex: -1 },
  );
  assert.deepEqual(
    reorderItems(["a", "b"], "a", "b", "on"),
    { items: ["a", "b"], previousIndex: 0, nextIndex: 0 },
  );
  assert.deepEqual(
    reorderItems(["a", "b", "c"], "b", "b", "before"),
    { items: ["a", "b", "c"], previousIndex: 1, nextIndex: 1 },
  );
});

test("Reorder applies completed drag details and direct movement through one controlled callback", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/reorder/ReorderRoot.tsx", packageRoot),
    "utf8",
  );
  const moveSource = await readFile(
    new URL("src/primitives/reorder/ReorderMove.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /const result = reorderItems\(items, details\.activeValue, details\.overValue, details\.position\)/);
  assert.match(rootSource, /onItemsChange\(result\.items/);
  assert.match(rootSource, /onDragEnd=\{\(details\) => apply\(details, details\.input\)\}/);
  assert.match(rootSource, /apply\(\{ activeValue: value, input: "keyboard", overValue, position \}, "control"\)/);
  assert.match(moveSource, /if \(!event\.defaultPrevented && !unavailable\) root\.move\(item\.value, move\)/);
});
