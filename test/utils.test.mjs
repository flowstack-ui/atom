import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "./test-utils.mjs";

import {
  cloneAndMerge,
  composeEventHandlers,
  mergeProps,
} from "../dist/_internal/utils/slot.js";

test("slot utilities compose props and event handlers", () => {
  const calls = [];
  const merged = mergeProps(
    {
      className: "original",
      onClick: () => calls.push("original"),
      style: { color: "red", display: "inline-block" },
    },
    {
      className: "override",
      onClick: () => calls.push("override"),
      style: { color: "blue", marginTop: 4 },
    },
  );

  merged.onClick();
  assert.deepEqual(calls, ["override", "original"]);
  assert.equal(merged.className, "original override");
  assert.deepEqual(merged.style, {
    color: "blue",
    display: "inline-block",
    marginTop: 4,
  });

  const element = cloneAndMerge(
    React.createElement("button", { className: "child" }, "Click"),
    { className: "behavior", "data-slot": "slot" },
  );

  const html = renderToStaticMarkup(element);
  assert.match(html, /class="child behavior"/);
  assert.match(html, /data-slot="slot"/);
});

test("slot utility runs Atom behavior before child element handlers", () => {
  const calls = [];
  const event = {
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
  const merged = mergeProps(
    {
      onClick: (currentEvent) => {
        calls.push("child");
        currentEvent.preventDefault();
      },
    },
    {
      onClick: composeEventHandlers(undefined, () => calls.push("atom")),
    },
  );

  merged.onClick(event);

  assert.deepEqual(calls, ["atom", "child"]);
});

test("composeEventHandlers lets consumers cancel Atom behavior", () => {
  const calls = [];
  const event = {
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };

  const composed = composeEventHandlers(
    (currentEvent) => {
      calls.push("consumer");
      currentEvent.preventDefault();
    },
    () => calls.push("atom"),
  );

  composed(event);
  assert.deepEqual(calls, ["consumer"]);
});
