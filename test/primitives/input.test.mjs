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
  Input,
  InputClear,
  InputRoot,
  useControllableState,
} from "../../dist/index.js";

test("InputRoot renders native input props and Field-owned state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Field.Root,
      {
        id: "email",
        invalid: true,
        required: true,
        readOnly: true,
        disabled: true,
      },
      React.createElement(Input.Root, {
        name: "email",
        type: "email",
        defaultValue: "person@example.com",
        placeholder: "Email",
        title: "Email address",
        className: "input-class",
        style: { color: "red" },
        "data-testid": "email-input",
      }),
    ),
  );

  assert.match(html, /<input/);
  assert.match(html, /id="email-control"/);
  assert.match(html, /name="email"/);
  assert.match(html, /type="email"/);
  assert.match(html, /value="person@example.com"/);
  assert.match(html, /placeholder="Email"/);
  assert.match(html, /title="Email address"/);
  assert.match(html, /class="input-class"/);
  assert.match(html, /style="color:red"/);
  assert.match(html, /data-testid="email-input"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /required=""/);
  assert.match(html, /readonly=""/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /data-slot="input"/);
  assert.match(html, /data-filled=""/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-required=""/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /data-invalid=""/);
  assert.equal(Input.Root, InputRoot);
});

test("InputRoot controlled value and clear part render through context", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Input.Root,
      {
        value: "search",
        "aria-describedby": "search-help",
      },
      React.createElement(Input.Clear, null, "Clear"),
    ),
  );

  assert.match(html, /<input/);
  assert.match(html, /value="search"/);
  assert.match(html, /aria-describedby="search-help"/);
  assert.match(html, /data-filled=""/);
  assert.match(html, /<button type="button" tabindex="-1" aria-label="Clear input" data-slot="input-clear">Clear<\/button>/);
  assert.equal(Input.Clear, InputClear);
});

test("InputClear hides and disables itself when the input is empty", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Input.Root,
      {
        value: "",
      },
      React.createElement(Input.Clear, null, "Clear"),
    ),
  );

  assert.match(html, /<button type="button" disabled="" tabindex="-1" aria-hidden="true" aria-label="Clear input" data-slot="input-clear" data-hidden="">Clear<\/button>/);
});

test("Input source wires value changes and clear refocus behavior", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/input/InputRoot.tsx", packageRoot),
    "utf8",
  );
  const clearSource = await readFile(
    new URL("src/primitives/input/InputClear.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /useControllableState<string>/);
  assert.match(rootSource, /setResolvedValue\(event\.currentTarget\.value\)/);
  assert.match(rootSource, /fieldCtx\?\.controlId/);
  assert.match(rootSource, /fieldCtx\?\.describedBy/);
  assert.match(rootSource, /"data-focused"/);
  assert.match(clearSource, /const \{ clearValue \} = ctx/);
  assert.match(clearSource, /clearValue\(\)/);
  assert.match(clearSource, /const hidden = ctx\.value === "" \|\| isDisabled/);
  assert.match(clearSource, /tabIndex: -1/);
  assert.match(clearSource, /"aria-hidden": hidden \|\| undefined/);
  assert.match(clearSource, /\[clearValue, hidden, onClear\]/);
  assert.match(rootSource, /focus\(\{ preventScroll: true \}\)/);
});
