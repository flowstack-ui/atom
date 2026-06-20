import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  ToggleRoot,
} from "../../dist/index.js";

import {
  isToggleActivationKey,
} from "../../dist/_internal/primitives/toggle/ToggleRoot.js";

test("ToggleRoot renders WAI-ARIA toggle button state attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToggleRoot,
      {
        pressed: true,
        disabled: true,
        value: "bold",
        ariaLabel: "Bold",
        className: "toggle-class",
      },
      "B",
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /type="button"/);
  assert.doesNotMatch(html, /role="button"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /aria-label="Bold"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /disabled=""/);
  assert.doesNotMatch(html, /tabindex=/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-state="on"/);
  assert.match(html, /data-slot="toggle"/);
  assert.match(html, /data-value="bold"/);
  assert.match(html, /class="toggle-class"/);
  assert.match(html, />B<\/button>$/);
});

test("ToggleRoot passes native button attributes without losing Atom behavior", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToggleRoot,
      {
        id: "bold-toggle",
        pressed: true,
        ariaLabel: "Bold",
        title: "Bold",
        "data-testid": "toggle-root",
        style: { color: "blue" },
      },
      "B",
    ),
  );

  assert.match(html, /id="bold-toggle"/);
  assert.match(html, /title="Bold"/);
  assert.match(html, /data-testid="toggle-root"/);
  assert.match(html, /style="color:blue"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-state="on"/);
});

test("ToggleRoot asChild merges behavior without replacing child content", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToggleRoot,
      {
        asChild: true,
        pressed: false,
        ariaLabel: "Italic",
        className: "root-class",
      },
      React.createElement("span", { className: "child-class" }, "I"),
    ),
  );

  assert.match(html, /^<span/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /aria-label="Italic"/);
  assert.match(html, /data-state="off"/);
  assert.match(html, /data-slot="toggle"/);
  assert.match(html, /class="child-class root-class"/);
  assert.match(html, />I<\/span>$/);
});

test("ToggleRoot asChild preserves native button semantics without redundant role", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ToggleRoot,
      {
        asChild: true,
        pressed: true,
      },
      React.createElement("button", null, "B"),
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /type="button"/);
  assert.doesNotMatch(html, /role="button"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, />B<\/button>$/);
});

test("ToggleRoot treats Space and Enter as keyboard activation keys", () => {
  assert.equal(isToggleActivationKey(" "), true);
  assert.equal(isToggleActivationKey("Enter"), true);
  assert.equal(isToggleActivationKey("ArrowDown"), false);
  assert.equal(isToggleActivationKey("Escape"), false);
});
