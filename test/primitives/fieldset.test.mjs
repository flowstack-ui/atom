import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Fieldset,
  FieldsetDescription,
  FieldsetError,
  FieldsetLegend,
  FieldsetRoot,
} from "../../dist/index.js";

test("Fieldset parts render native fieldset semantics and state data attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Fieldset.Root,
      {
        id: "shipping",
        invalid: true,
        required: true,
        disabled: true,
        "data-testid": "fieldset-root",
      },
      React.createElement(Fieldset.Legend, null, "Shipping"),
      React.createElement(Fieldset.Description, null, "Choose one option."),
      React.createElement(Fieldset.Error, { forceMatch: true }, "Required."),
    ),
  );

  assert.match(html, /^<fieldset/);
  assert.match(html, /id="shipping"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-invalid="true"/);
  assert.doesNotMatch(html, /aria-required=/);
  assert.match(html, /data-testid="fieldset-root"/);
  assert.match(html, /data-slot="fieldset"/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /data-required=""/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-slot="fieldset-legend"/);
  assert.match(html, /id="shipping-legend"/);
  assert.match(html, /aria-describedby="shipping-description shipping-error"/);
  assert.match(html, /data-slot="fieldset-description"/);
  assert.doesNotMatch(html, /role="alert"/);
  assert.match(html, /data-slot="fieldset-error"/);
  assert.equal(Fieldset.Root, FieldsetRoot);
  assert.equal(Fieldset.Legend, FieldsetLegend);
  assert.equal(Fieldset.Description, FieldsetDescription);
  assert.equal(Fieldset.Error, FieldsetError);
});

test("FieldsetLegend asChild preserves indicators and supports optional marker", () => {
  const requiredHtml = renderToStaticMarkup(
    React.createElement(
      Fieldset.Root,
      {
        id: "notifications",
        required: true,
      },
      React.createElement(
        Fieldset.Legend,
        { asChild: true },
        React.createElement("legend", { className: "custom-legend" }, "Notifications"),
      ),
    ),
  );
  const optionalHtml = renderToStaticMarkup(
    React.createElement(
      Fieldset.Root,
      {
        id: "billing",
      },
      React.createElement(
        Fieldset.Legend,
        { optionalIndicator: " (optional)" },
        "Billing",
      ),
    ),
  );

  assert.match(requiredHtml, /<legend/);
  assert.match(requiredHtml, /class="custom-legend"/);
  assert.match(requiredHtml, /data-slot="fieldset-legend"/);
  assert.match(requiredHtml, /Notifications<span aria-hidden="true" data-slot="fieldset-required-indicator"> \*<\/span>/);
  assert.match(optionalHtml, /Billing<span data-slot="fieldset-optional-indicator"> \(optional\)<\/span>/);
});
