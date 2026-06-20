import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Checkbox,
  CheckboxGroup,
  CheckboxGroupItem,
  CheckboxGroupRoot,
  useCheckboxGroupContext,
} from "../../dist/index.js";

test("CheckboxGroupRoot renders group attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroupRoot,
      {
        value: ["cheese"],
        required: true,
        invalid: true,
        readOnly: true,
        orientation: "horizontal",
        ariaLabel: "Toppings",
        id: "toppings",
        className: "group-class",
      },
      React.createElement("span", null, "Cheese"),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="group"/);
  assert.match(html, /aria-label="Toppings"/);
  assert.doesNotMatch(html, /aria-orientation=/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /id="toppings"/);
  assert.match(html, /data-slot="checkbox-group"/);
  assert.match(html, /data-orientation="horizontal"/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /class="group-class"/);
});

test("CheckboxGroup namespace exposes Root and Item parts", () => {
  assert.equal(CheckboxGroup.Root, CheckboxGroupRoot);
  assert.equal(CheckboxGroup.Item, CheckboxGroupItem);
});

test("CheckboxGroupItem renders group-owned checked state and indicator", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroup.Root,
      {
        value: ["cheese"],
        name: "toppings",
        form: "order-form",
        ariaLabel: "Toppings",
      },
      React.createElement(
        CheckboxGroup.Item,
        { value: "cheese", className: "item-class" },
        React.createElement(Checkbox.Indicator, null, "check"),
      ),
    ),
  );

  assert.match(html, /role="group"/);
  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-slot="checkbox-group-item"/);
  assert.match(html, /data-state="checked"/);
  assert.match(html, /data-value="cheese"/);
  assert.match(html, /class="item-class"/);
  assert.match(html, /data-slot="checkbox-indicator"/);
  assert.match(html, />check<\/span>/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /name="toppings"/);
  assert.match(html, /value="cheese"/);
  assert.match(html, /form="order-form"/);
  assert.match(html, /checked=""/);
});

test("CheckboxGroupItem inherits disabled readonly invalid and required state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroupRoot,
      {
        value: [],
        name: "toppings",
        disabled: true,
        readOnly: true,
        invalid: true,
        required: true,
        ariaLabel: "Toppings",
      },
      React.createElement(CheckboxGroupItem, { value: "cheese" }, "Cheese"),
    ),
  );

  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="false"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-required="true"/);
  assert.match(
    html,
    /<button type="button" role="checkbox" aria-checked="false" aria-disabled="true" aria-required="true" aria-readonly="true" aria-invalid="true" disabled=""/,
  );
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /data-invalid=""/);
  assert.doesNotMatch(html, /required=""/);
});

test("CheckboxGroupRoot provides selected values through context", () => {
  function CheckboxGroupProbe() {
    const context = useCheckboxGroupContext();
    return React.createElement(
      "output",
      null,
      [
        context.groupValues.join(","),
        context.isItemChecked("cheese") ? "checked" : "unchecked",
        context.orientation,
      ].join("|"),
    );
  }

  const html = renderToStaticMarkup(
    React.createElement(
      CheckboxGroupRoot,
      { value: ["cheese"], orientation: "horizontal", ariaLabel: "Toppings" },
      React.createElement(CheckboxGroupProbe),
    ),
  );

  assert.match(html, /<output>cheese\|checked\|horizontal<\/output>/);
});
