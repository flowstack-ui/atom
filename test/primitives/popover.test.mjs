import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "../../dist/index.js";

import {
  getPopoverArrowGeometry,
} from "../../dist/_internal/primitives/popover/PopoverArrow.js";

test("Popover primitives render trigger and optional anchor attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      PopoverRoot,
      { defaultOpen: true, triggerMode: "hover" },
      React.createElement(PopoverAnchor, null, React.createElement("span", null, "Anchor")),
      React.createElement(PopoverTrigger, { className: "popover-trigger-class" }, "Open"),
    ),
  );

  assert.match(html, /data-slot="popover-anchor"/);
  assert.match(html, /display:contents/);
  assert.match(html, /data-slot="popover-trigger"/);
  assert.match(html, /<button/);
  assert.match(html, /type="button"/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /data-trigger-mode="hover"/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-controls="[^"]+"/);
  assert.doesNotMatch(html, /role="button"/);
  assert.doesNotMatch(html, /tabindex="0"/);
  assert.match(html, /class="popover-trigger-class"/);
});

test("PopoverAnchor asChild keeps the child layout box for positioning", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      PopoverRoot,
      { defaultOpen: true },
      React.createElement(
        PopoverAnchor,
        { asChild: true, style: { color: "red" } },
        React.createElement(
          "span",
          { style: { display: "inline-block" } },
          "Anchor",
        ),
      ),
      React.createElement(PopoverTrigger, null, "Open"),
    ),
  );

  assert.match(html, /data-slot="popover-anchor"/);
  assert.match(html, /display:inline-block/);
  assert.match(html, /color:red/);
  assert.doesNotMatch(html, /display:contents/);
});

test("Popover trigger supports asChild and exposes portal arrow and close parts", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      PopoverRoot,
      { defaultOpen: true },
      React.createElement(
        PopoverTrigger,
        { asChild: true },
        React.createElement("span", null, "Open"),
      ),
      React.createElement(
        PopoverContent,
        null,
        "Body",
        React.createElement(PopoverArrow, { fill: "currentColor" }),
        React.createElement(PopoverClose, null, "Close"),
      ),
    ),
  );

  assert.equal(typeof PopoverPortal, "function");
  assert.match(html, /<span data-slot="popover-trigger" data-state="open"/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-slot="popover-content"/);
  assert.match(html, /data-slot="popover-arrow"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /data-slot="popover-close"/);
});

test("PopoverArrow geometry keeps width as triangle spread and height as protrusion", () => {
  assert.deepEqual(getPopoverArrowGeometry("bottom", 12, 6), {
    svgHeight: 6,
    svgWidth: 12,
    outwardSize: 6,
    points: "0,6 6,0 12,6",
  });
  assert.deepEqual(getPopoverArrowGeometry("right", 12, 6), {
    svgHeight: 12,
    svgWidth: 6,
    outwardSize: 6,
    points: "6,0 0,6 6,12",
  });
});
