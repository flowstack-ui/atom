import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
  FieldRoot,
  Label,
  Input,
} from "../../dist/index.js";

test("Field parts render generated IDs and state data attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Field.Root,
      {
        id: "email",
        invalid: true,
        required: true,
        readOnly: true,
        orientation: "horizontal",
        "data-testid": "field-root",
      },
      React.createElement(Field.Label, null, "Email"),
      React.createElement(Input.Root, { name: "email" }),
      React.createElement(Field.Description, null, "Use a work address."),
      React.createElement(Field.Error, null, "Email is required."),
      React.createElement(Field.RequiredIndicator, { fallback: " optional" }),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /id="email"/);
  assert.match(html, /data-testid="field-root"/);
  assert.match(html, /data-slot="field"/);
  assert.match(html, /data-orientation="horizontal"/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /data-required=""/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /id="email-label"/);
  assert.match(html, /for="email-control"/);
  assert.match(html, /data-slot="field-description"/);
  assert.match(html, /aria-describedby="email-description email-error"/);
  assert.doesNotMatch(html, /role="alert"/);
  assert.match(html, /data-slot="field-error"/);
  assert.match(html, /data-slot="field-required-indicator"/);
  assert.match(html, /data-slot="field-label"[^>]*data-invalid=""/);
  assert.match(html, /data-slot="field-label"[^>]*data-readonly=""/);
  assert.equal(Field.Root, FieldRoot);
  assert.equal(Field.Label, FieldLabel);
  assert.equal(Field.Description, FieldDescription);
  assert.equal(Field.Error, FieldError);
  assert.equal(Field.RequiredIndicator, FieldRequiredIndicator);
});

test("FieldLabel asChild preserves behavior props and indicator content", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Field.Root,
      {
        id: "name",
        required: true,
      },
      React.createElement(
        Field.Label,
        { asChild: true },
        React.createElement("label", { className: "custom-label" }, "Name"),
      ),
    ),
  );

  assert.match(html, /<label/);
  assert.match(html, /class="custom-label"/);
  assert.match(html, /id="name-label"/);
  assert.match(html, /for="name-control"/);
  assert.match(html, /data-slot="field-label"/);
  assert.match(html, /Name<span aria-hidden="true" data-slot="field-required-indicator"> \*<\/span>/);
});

test("FieldError match only accepts boolean visibility control", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Field.Root,
      {
        id: "email",
        invalid: true,
      },
      React.createElement(Field.Error, { match: false }, "Hidden"),
      React.createElement(Field.Error, { match: "potato" }, "Also hidden"),
      React.createElement(Field.Error, null, "Shown"),
    ),
  );

  assert.doesNotMatch(html, /Hidden/);
  assert.doesNotMatch(html, /Also hidden/);
  assert.match(html, /Shown/);
});
