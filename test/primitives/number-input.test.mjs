import {
  assert,
  packageRoot,
  readFile,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  NumberInput,
  NumberInputDecrement,
  NumberInputIncrement,
  NumberInputInput,
  NumberInputRoot,
} from "../../dist/index.js";

test("NumberInput compound parts own input and stepper semantics", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NumberInput.Root,
      { id: "quantity", value: 10, min: 0, max: 10, "aria-label": "Quantity" },
      React.createElement(NumberInput.Decrement, { "aria-label": "Remove item" }),
      React.createElement(NumberInput.Input),
      React.createElement(NumberInput.Increment, { "aria-label": "Add item" }),
    ),
  );

  assert.equal(html.match(/role="spinbutton"/g)?.length, 1);
  assert.match(html, /data-slot="number-input-input"/);
  assert.match(html, /<button(?=[^>]*data-slot="number-input-decrement")(?=[^>]*aria-controls="quantity")(?=[^>]*aria-label="Remove item")[^>]*>/);
  assert.match(html, /<button(?=[^>]*data-slot="number-input-increment")(?=[^>]*aria-disabled="true")(?=[^>]*aria-controls="quantity")(?=[^>]*aria-label="Add item")[^>]*>/);
  assert.equal(NumberInput.Input, NumberInputInput);
  assert.equal(NumberInput.Increment, NumberInputIncrement);
  assert.equal(NumberInput.Decrement, NumberInputDecrement);
});

test("NumberInputRoot renders WAI-ARIA spinbutton attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(NumberInputRoot, {
      value: 3,
      min: 0,
      max: 10,
      required: true,
      readOnly: true,
      invalid: true,
      name: "quantity",
      form: "order-form",
      "aria-label": "Quantity",
      "aria-describedby": "quantity-help",
      className: "number-class",
      inputClassName: "input-class",
      "data-slot": "quantity-input",
    }),
  );

  assert.match(html, /^<div/);
  assert.match(html, /data-slot="quantity-input"/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /class="number-class"/);
  assert.match(html, /role="spinbutton"/);
  assert.match(html, /aria-label="Quantity"/);
  assert.match(html, /aria-valuenow="3"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="10"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /aria-describedby="quantity-help"/);
  assert.match(html, /class="input-class"/);
  assert.match(html, /type="hidden"/);
  assert.match(html, /name="quantity"/);
  assert.match(html, /form="order-form"/);
  assert.match(html, /value="3"/);
  assert.equal(html.match(/name="quantity"/g)?.length, 1);
});

test("NumberInputRoot disables its hidden form input", () => {
  const html = renderToStaticMarkup(
    React.createElement(NumberInputRoot, {
      value: 2,
      disabled: true,
      name: "quantity",
    }),
  );

  assert.match(html, /data-disabled=""/);
  assert.match(html, /<input type="hidden"[^>]*disabled=""[^>]*name="quantity"[^>]*value="2"/);
});

test("NumberInputRoot accepts null as an empty controlled value", () => {
  const html = renderToStaticMarkup(
    React.createElement(NumberInputRoot, {
      value: null,
      name: "quantity",
      "aria-label": "Quantity",
    }),
  );

  assert.match(html, /role="spinbutton"/);
  assert.doesNotMatch(html, /aria-valuenow=/);
  assert.match(html, /aria-label="Quantity"/);
  assert.match(html, /<input type="text"[^>]*value=""/);
  assert.match(html, /<input type="hidden"[^>]*name="quantity"[^>]*value=""/);
});

test("NumberInputRoot synchronizes controlled display state outside render", async () => {
  const source = await readFile(
    new URL("src/primitives/number-input/NumberInputRoot.tsx", packageRoot),
    "utf8",
  );
  const renderSyncPattern =
    /if \(isControlled && controlledValue !== prevControlledRef\.current && !isEditing\) \{[\s\S]*?setDisplayValue/;

  assert.doesNotMatch(source, renderSyncPattern);
  assert.match(source, /useEffect\(\(\) => \{/);
  assert.match(source, /setDisplayValue\(toDisplayString\(controlledValue \?\? null\)\)/);
});
