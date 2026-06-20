import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Select,
  Checkbox,
  CheckboxIndicator,
  CheckboxRoot,
} from "../../dist/index.js";

import {
  getNextCheckboxCheckedState,
} from "../../dist/_internal/primitives/checkbox/CheckboxRoot.js";

test("CheckboxRoot renders WAI-ARIA checkbox state attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxRoot,
      {
        checked: true,
        required: true,
        invalid: true,
        ariaLabel: "Accept terms",
        "aria-describedby": "terms-help",
        id: "terms",
        className: "checkbox-class",
      },
      React.createElement("span", null, "check"),
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /type="button"/);
  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /aria-label="Accept terms"/);
  assert.match(html, /aria-describedby="terms-help"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /id="terms"/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /data-state="checked"/);
  assert.match(html, /data-slot="checkbox"/);
  assert.match(html, /class="checkbox-class"/);
  assert.match(html, /<span>check<\/span>/);
});

test("Checkbox namespace exposes Root and Indicator parts", () => {
  assert.equal(Checkbox.Root, CheckboxRoot);
  assert.equal(Checkbox.Indicator, CheckboxIndicator);
});

test("CheckboxIndicator renders checked state inside CheckboxRoot", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Checkbox.Root,
      { checked: true, ariaLabel: "Accept terms" },
      React.createElement(Checkbox.Indicator, { className: "indicator-class" }, "check"),
    ),
  );

  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /data-state="checked"/);
  assert.match(html, /data-slot="checkbox-indicator"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /class="indicator-class"/);
  assert.match(html, />check<\/span>/);
});

test("CheckboxIndicator renders indeterminate state inside CheckboxRoot", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxRoot,
      { checked: "indeterminate", ariaLabel: "Select all" },
      React.createElement(CheckboxIndicator, null, "mixed"),
    ),
  );

  assert.match(html, /aria-checked="mixed"/);
  assert.match(html, /data-state="indeterminate"/);
  assert.match(html, /data-slot="checkbox-indicator"/);
  assert.match(html, />mixed<\/span>/);
});

test("CheckboxIndicator omits unchecked state unless forceMounted", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxRoot,
      { checked: false, ariaLabel: "Accept terms" },
      React.createElement(CheckboxIndicator, null, "check"),
    ),
  );

  assert.match(html, /role="checkbox"/);
  assert.match(html, /data-state="unchecked"/);
  assert.doesNotMatch(html, /data-slot="checkbox-indicator"/);
  assert.doesNotMatch(html, />check<\/span>/);
});

test("CheckboxIndicator forceMount mirrors unchecked and disabled state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxRoot,
      { checked: false, disabled: true, ariaLabel: "Accept terms" },
      React.createElement(CheckboxIndicator, { forceMount: true }, "check"),
    ),
  );

  assert.match(html, /disabled=""/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-state="unchecked"/);
  assert.match(html, /data-slot="checkbox-indicator"/);
  assert.match(html, /aria-hidden="true"/);
});

test("CheckboxRoot renders a hidden checkbox input for form submission when named", () => {
  const html = renderToStaticMarkup(
    React.createElement(CheckboxRoot, {
      defaultChecked: true,
      name: "terms",
      value: "accepted",
      form: "signup-form",
      required: true,
      ariaLabel: "Accept terms",
    }),
  );

  assert.match(html, /^<button/);
  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /name="terms"/);
  assert.match(html, /value="accepted"/);
  assert.match(html, /form="signup-form"/);
  assert.match(html, /checked=""/);
  assert.match(html, /required=""/);
});

test("CheckboxRoot omits form input when name is not provided", () => {
  const html = renderToStaticMarkup(
    React.createElement(CheckboxRoot, {
      defaultChecked: true,
      ariaLabel: "Accept terms",
    }),
  );

  assert.match(html, /^<button/);
  assert.doesNotMatch(html, /<input/);
});

test("CheckboxRoot passes native button attributes without losing Atom behavior", () => {
  const html = renderToStaticMarkup(
    React.createElement(CheckboxRoot, {
      id: "terms-checkbox",
      checked: true,
      ariaLabel: "Terms",
      title: "Terms",
      "data-testid": "checkbox-root",
      style: { color: "green" },
    }),
  );

  assert.match(html, /id="terms-checkbox"/);
  assert.match(html, /title="Terms"/);
  assert.match(html, /data-testid="checkbox-root"/);
  assert.match(html, /style="color:green"/);
  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /data-state="checked"/);
});

test("CheckboxRoot renders indeterminate mixed state", () => {
  const html = renderToStaticMarkup(
    React.createElement(CheckboxRoot, {
      checked: "indeterminate",
      ariaLabel: "Select all",
    }),
  );

  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="mixed"/);
  assert.match(html, /data-state="indeterminate"/);
});

test("CheckboxRoot toggles indeterminate state to checked", () => {
  assert.equal(getNextCheckboxCheckedState("indeterminate"), true);
  assert.equal(getNextCheckboxCheckedState(true), false);
  assert.equal(getNextCheckboxCheckedState(false), true);
});

test("CheckboxRoot readOnly remains focusable and exposes readonly state", () => {
  const html = renderToStaticMarkup(
    React.createElement(CheckboxRoot, {
      checked: false,
      readOnly: true,
      ariaLabel: "Read only",
    }),
  );

  assert.match(html, /^<button/);
  assert.doesNotMatch(html, /disabled=""/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /aria-checked="false"/);
});

test("CheckboxRoot asChild merges behavior without replacing child content", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxRoot,
      {
        asChild: true,
        checked: false,
        ariaLabel: "Remember me",
        className: "root-class",
      },
      React.createElement("span", { className: "child-class" }, "Remember"),
    ),
  );

  assert.match(html, /^<span/);
  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="false"/);
  assert.match(html, /data-state="unchecked"/);
  assert.match(html, /data-slot="checkbox"/);
  assert.match(html, /class="child-class root-class"/);
  assert.match(html, />Remember<\/span>$/);
});
