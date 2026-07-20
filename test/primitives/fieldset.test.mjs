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
  markFieldsetPart,
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

test("FieldsetRoot asChild inspects the composed fieldset children during server render", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Fieldset.Root,
      {
        asChild: true,
        id: "notification-methods",
        invalid: true,
        className: "brick-fieldset",
      },
      React.createElement(
        "fieldset",
        { className: "consumer-fieldset" },
        React.createElement(Fieldset.Legend, null, "Notification methods"),
        React.createElement(
          Fieldset.Description,
          null,
          "Choose at least one.",
        ),
        React.createElement(Fieldset.Error, null, "Selection required."),
      ),
    ),
  );

  assert.match(html, /^<fieldset/);
  assert.match(html, /class="consumer-fieldset brick-fieldset"/);
  assert.match(html, /data-slot="fieldset"/);
  assert.match(html, /id="notification-methods-legend"/);
  assert.match(
    html,
    /aria-describedby="notification-methods-description notification-methods-error"/,
  );
  assert.match(html, /id="notification-methods-description"/);
  assert.match(html, /id="notification-methods-error"/);
});

test("marked public Fieldset wrappers preserve server relationships", () => {
  const StyledLegend = markFieldsetPart(
    React.forwardRef(function StyledLegend(props, ref) {
      return React.createElement(Fieldset.Legend, {
        ...props,
        className: `styled-legend ${props.className ?? ""}`.trim(),
        ref,
      });
    }),
    "legend",
  );
  const StyledDescription = markFieldsetPart(
    React.forwardRef(function StyledDescription(props, ref) {
      return React.createElement(Fieldset.Description, {
        ...props,
        className: `styled-description ${props.className ?? ""}`.trim(),
        ref,
      });
    }),
    "description",
  );
  const StyledError = markFieldsetPart(
    React.forwardRef(function StyledError(props, ref) {
      return React.createElement(Fieldset.Error, {
        ...props,
        className: `styled-error ${props.className ?? ""}`.trim(),
        ref,
      });
    }),
    "error",
  );

  assert.equal(markFieldsetPart(StyledLegend, "legend"), StyledLegend);
  assert.throws(
    () => markFieldsetPart(StyledLegend, "description"),
    /already marked as legend/,
  );

  const html = renderToStaticMarkup(
    React.createElement(
      Fieldset.Root,
      { id: "styled-options", invalid: true },
      React.createElement(StyledLegend, null, "Options"),
      React.createElement(StyledDescription, null, "Choose one."),
      React.createElement(StyledError, null, "Selection required."),
    ),
  );

  assert.match(html, /class="styled-legend"/);
  assert.match(
    html,
    /aria-describedby="styled-options-description styled-options-error"/,
  );
});
