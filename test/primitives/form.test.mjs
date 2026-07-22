import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Field,
  Form,
  FormRoot,
  Input,
  Label,
} from "../../dist/index.js";

test("FormRoot renders native form props and composes with Field controls", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Form.Root,
      {
        action: "/submit",
        method: "post",
        name: "profile",
        title: "Profile form",
        className: "form-class",
        style: { color: "green" },
        "data-testid": "profile-form",
        preventDefaultOnSubmit: true,
      },
      React.createElement(
        Field.Root,
        { id: "email", required: true, invalid: true },
        React.createElement(Field.Label, null, "Email"),
        React.createElement(Input.Root, { name: "email", type: "email" }),
        React.createElement(Field.Description, null, "Use a work email."),
        React.createElement(Field.Error, null, "Email is required."),
      ),
      React.createElement("button", { type: "submit" }, "Submit"),
    ),
  );

  assert.match(html, /^<form/);
  assert.match(html, /action="\/submit"/);
  assert.match(html, /method="post"/);
  assert.match(html, /name="profile"/);
  assert.match(html, /title="Profile form"/);
  assert.match(html, /class="form-class"/);
  assert.match(html, /style="color:green"/);
  assert.match(html, /data-testid="profile-form"/);
  assert.match(html, /data-slot="form"/);
  assert.doesNotMatch(html, /^<form[^>]*data-submitting=""/);
  assert.doesNotMatch(html, /^<form[^>]*data-submitted=""/);
  assert.doesNotMatch(html, /^<form[^>]*data-invalid=""/);
  assert.match(html, /data-slot="field"/);
  assert.match(html, /data-slot="input"/);
  assert.match(html, /<button type="submit">Submit<\/button>/);
  assert.equal(Form.Root, FormRoot);
});

test("Form source wires submit, reset, validation, and async state", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/form/FormRoot.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /preventDefaultOnSubmit = false/);
  assert.match(rootSource, /validateOnSubmit\?\.\(event\)/);
  assert.match(rootSource, /preventDefaultOnSubmit \|\| isPromiseLike\(validationResult\)/);
  assert.match(rootSource, /if \(isValid === false\)/);
  assert.match(rootSource, /event\.preventDefault\(\)/);
  assert.match(rootSource, /setCallbackInvalid\(true\)/);
  assert.match(rootSource, /setSubmitting\(true\);\s*setSubmitted\(false\);/);
  assert.match(rootSource, /const submitResult = onSubmit\?\.\(event\)/);
  assert.match(rootSource, /if \(isPromiseLike\(submitResult\)\)/);
  assert.match(rootSource, /await submitResult;\s*\}\s*setSubmitted\(true\);/);
  assert.match(rootSource, /catch \(error\) \{\s*setSubmitted\(false\);\s*throw error;/);
  assert.match(rootSource, /typeof action === "function"/);
  assert.match(rootSource, /setSubmitting\(false\)/);
  assert.match(rootSource, /onReset\?\.\(event\)/);
  assert.match(rootSource, /if \(event\.defaultPrevented\) return/);
  assert.match(rootSource, /setSubmitted\(false\)/);
  assert.match(rootSource, /setCallbackInvalid\(false\)/);
  assert.match(rootSource, /validationBehavior\?: ValidationBehavior/);
  assert.match(rootSource, /runValidationCapture\(event, validationBehavior/);
});
