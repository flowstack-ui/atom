import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
} from "../../dist/index.js";

import {
  getHoverCardArrowGeometry,
} from "../../dist/_internal/primitives/hover-card/HoverCardArrow.js";

test("HoverCard primitives render trigger state attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      HoverCardRoot,
      { defaultOpen: true },
      React.createElement(HoverCardTrigger, { className: "hover-trigger-class" }, "Profile"),
    ),
  );

  assert.match(html, /data-slot="hover-card-trigger"/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /class="hover-trigger-class"/);
  assert.match(html, />Profile<\/span>/);
});

test("HoverCard trigger supports asChild and exposes portal and arrow parts", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      HoverCardRoot,
      { defaultOpen: true },
      React.createElement(
        HoverCardTrigger,
        { asChild: true },
        React.createElement("a", { href: "/profile" }, "Profile"),
      ),
      React.createElement(
        HoverCardContent,
        null,
        "Details",
        React.createElement(HoverCardArrow, { fill: "currentColor" }),
      ),
    ),
  );

  assert.equal(typeof HoverCardPortal, "function");
  assert.match(html, /<a href="\/profile" data-slot="hover-card-trigger" data-state="open">Profile<\/a>/);
  assert.match(html, /data-slot="hover-card-content"/);
  assert.match(html, /data-slot="hover-card-arrow"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /<polygon points=/);
});

test("HoverCardArrow geometry keeps width as triangle spread and height as protrusion", () => {
  assert.deepEqual(getHoverCardArrowGeometry("top", 12, 6), {
    svgHeight: 6,
    svgWidth: 12,
    outwardSize: 6,
    points: "0,0 6,6 12,0",
  });
  assert.deepEqual(getHoverCardArrowGeometry("left", 12, 6), {
    svgHeight: 12,
    svgWidth: 6,
    outwardSize: 6,
    points: "0,0 6,6 0,12",
  });
});

test("HoverCardContent updates Floating UI after the trigger ref commits", async () => {
  const source = await readFile(
    new URL("src/primitives/hover-card/HoverCardContent.tsx", packageRoot),
    "utf8",
  );

  assert.match(source, /setReferenceElement\(triggerRef\.current\)/);
  assert.match(source, /elements: \{ reference: referenceElement \}/);
  assert.match(source, /getFloatingFallbackPlacements\(side, align\)/);
});
