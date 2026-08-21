import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  DragDrop,
  DragDropDraggable,
  DragDropDropTarget,
  DragDropHandle,
  DragDropRoot,
} from "../../dist/index.js";

test("DragDrop renders labelled native handles and headless support nodes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      DragDrop.Root,
      { instructions: "Move the task." },
      React.createElement(
        DragDrop.DropTarget,
        { value: "review", label: "Review queue", mode: "on" },
        "Review",
      ),
      React.createElement(
        DragDrop.Draggable,
        { value: "task-1", label: "Verify production", "data-prop-check": "source" },
        "Verify production",
        React.createElement(DragDrop.Handle, { "aria-label": "Move Verify production" }),
      ),
    ),
  );

  assert.match(html, /data-slot="drag-drop-drop-target" data-value="review"/);
  assert.match(html, /data-slot="drag-drop-draggable" data-value="task-1"/);
  assert.match(html, /data-prop-check="source"/);
  assert.match(html, /<button[^>]+aria-label="Move Verify production"[^>]+type="button"/);
  assert.match(html, /aria-describedby="[^"]+"/);
  assert.match(html, /Move the task\./);
  assert.match(html, /aria-live="assertive" aria-atomic="true" data-slot="drag-drop-announcer"/);
  assert.equal(DragDrop.Root, DragDropRoot);
  assert.equal(DragDrop.Draggable, DragDropDraggable);
  assert.equal(DragDrop.DropTarget, DragDropDropTarget);
  assert.equal(DragDrop.Handle, DragDropHandle);
});

test("DragDrop composition supports asChild without nesting replacement elements", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      DragDrop.Root,
      { instructions: "Move." },
      React.createElement(
        DragDrop.DropTarget,
        { asChild: true, value: "target", label: "Target" },
        React.createElement(
          "section",
          null,
          React.createElement(
            DragDrop.Draggable,
            { asChild: true, value: "source", label: "Source" },
            React.createElement(
              "article",
              null,
              React.createElement(
                DragDrop.Handle,
                { asChild: true },
                React.createElement("button", { "aria-label": "Move Source" }),
              ),
            ),
          ),
        ),
      ),
    ),
  );

  assert.match(html, /<section data-slot="drag-drop-drop-target" data-value="target">/);
  assert.match(html, /<article[^>]+data-slot="drag-drop-draggable" data-value="source"/);
  assert.match(html, /<button aria-label="Move Source" type="button"/);
  assert.doesNotMatch(html, /<div[^>]+data-slot="drag-drop/);
});

test("DragDrop source owns thresholds, release commit, cancellation, and direction-aware keys", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/drag-drop/DragDropRoot.tsx", packageRoot),
    "utf8",
  );
  const handleSource = await readFile(
    new URL("src/primitives/drag-drop/DragDropHandle.tsx", packageRoot),
    "utf8",
  );

  assert.match(handleSource, /distance < 6/);
  assert.match(handleSource, /distance > 8/);
  assert.match(handleSource, /setTimeout\(\(\) => startPointer\(session, element\), 220\)/);
  assert.match(handleSource, /setPointerCapture\(event\.pointerId\)/);
  assert.match(handleSource, /else commit\(\)/);
  assert.match(handleSource, /if \(cancelled\) cancel\(\)/);
  assert.match(handleSource, /onPointerCancel/);
  assert.match(handleSource, /event\.key === "Escape"/);
  assert.match(handleSource, /dir === "rtl" \? "ArrowRight" : "ArrowLeft"/);
  assert.match(rootSource, /if \(!current\.overValue \|\| !current\.position \|\| !target\) \{/);
  assert.match(rootSource, /messages\?\.movedOn\?\.\(label, target\.label\)/);
  assert.match(rootSource, /messages\?\.droppedOn\?\.\(label, target\.label\)/);
  assert.match(rootSource, /onDragEnd\?\.\(details\)/);
  assert.match(rootSource, /dir === "rtl"/);
});
