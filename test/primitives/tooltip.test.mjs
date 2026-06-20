import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "../../dist/index.js";

import {
  getTooltipArrowGeometry,
} from "../../dist/_internal/primitives/tooltip/TooltipArrow.js";

test("Tooltip primitives render provider, root, and trigger attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      TooltipProvider,
      { openDelay: 0 },
      React.createElement(
        TooltipRoot,
        { defaultOpen: true },
        React.createElement(TooltipTrigger, { className: "tooltip-trigger-class" }, "Hover"),
      ),
    ),
  );

  assert.match(html, /data-slot="tooltip-trigger"/);
  assert.match(html, /aria-describedby="[^"]+"/);
  assert.match(html, /class="tooltip-trigger-class"/);
  assert.match(html, />Hover<\/span>/);
});

test("Tooltip trigger supports asChild and exposes portal and arrow parts", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      TooltipProvider,
      { openDelay: 0 },
      React.createElement(
        TooltipRoot,
        { defaultOpen: true },
        React.createElement(
          TooltipTrigger,
          { asChild: true },
          React.createElement("button", { type: "button" }, "Hover"),
        ),
      ),
    ),
  );

  assert.match(html, /<button/);
  assert.match(html, /data-slot="tooltip-trigger"/);
  assert.match(html, /aria-describedby="[^"]+"/);
  assert.doesNotMatch(html, /<span[^>]*data-slot="tooltip-trigger"/);

  assert.equal(typeof TooltipPortal, "function");
  assert.equal(typeof TooltipContent, "object");
  assert.equal(typeof TooltipArrow, "object");
});

test("TooltipArrow renders a default SVG polygon with geometry props", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      TooltipProvider,
      { openDelay: 0 },
      React.createElement(
        TooltipRoot,
        { defaultOpen: true },
        React.createElement(TooltipTrigger, null, "Hover"),
        React.createElement(
          TooltipContent,
          null,
          "Content",
          React.createElement(TooltipArrow, { width: 12, height: 6, className: "arrow-class" }),
        ),
      ),
    ),
  );

  assert.match(html, /data-slot="tooltip-arrow"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /width="12"/);
  assert.match(html, /height="6"/);
  assert.match(html, /viewBox="0 0 12 6"/);
  assert.match(html, /<polygon points="0,0 6,6 12,0"/);
  assert.match(html, /bottom:-6px/);
  assert.match(html, /class="arrow-class"/);
});

test("TooltipArrow geometry keeps width as triangle spread and height as protrusion", () => {
  assert.deepEqual(getTooltipArrowGeometry("top", 12, 6), {
    svgHeight: 6,
    svgWidth: 12,
    outwardSize: 6,
    points: "0,0 6,6 12,0",
  });
  assert.deepEqual(getTooltipArrowGeometry("bottom", 12, 6), {
    svgHeight: 6,
    svgWidth: 12,
    outwardSize: 6,
    points: "0,6 6,0 12,6",
  });
  assert.deepEqual(getTooltipArrowGeometry("left", 12, 6), {
    svgHeight: 12,
    svgWidth: 6,
    outwardSize: 6,
    points: "0,0 6,6 0,12",
  });
  assert.deepEqual(getTooltipArrowGeometry("right", 12, 6), {
    svgHeight: 12,
    svgWidth: 6,
    outwardSize: 6,
    points: "6,0 0,6 6,12",
  });
});
