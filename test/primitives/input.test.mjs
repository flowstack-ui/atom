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
} from "../../dist/index.js";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { act } from "react";

test("uncontrolled Input preserves ref registration, rerenders and cancelled reset", async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: "https://example.test" });
  const previous = Object.fromEntries(["window", "document", "IS_REACT_ACT_ENVIRONMENT"].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  const root = createRoot(dom.window.document.getElementById("root"));
  const changes = [];
  const register = element => { if (element) element.value = "Registered"; };
  try {
    const render = async (extra = {}) => act(() => root.render(React.createElement("form", null,
      React.createElement(Input.Root, { defaultValue: "Original", ref: register, onValueChange: value => changes.push(value), ...extra }, React.createElement(Input.Clear, null, "Clear")))));
    await render();
    const input = dom.window.document.querySelector("input");
    const form = input.form;
    assert.equal(input.value, "Registered");
    assert.equal(input.hasAttribute("data-filled"), true);
    assert.deepEqual(changes, []);
    input.value = "External update";
    await render({ title: "Updated" });
    assert.equal(input.value, "External update");
    const cancel = event => event.preventDefault();
    form.addEventListener("reset", cancel);
    await act(async () => { form.reset(); });
    assert.equal(input.value, "External update");
    assert.deepEqual(changes, []);
    form.removeEventListener("reset", cancel);
    await act(async () => { form.reset(); });
    assert.equal(input.value, "Original");
    assert.deepEqual(changes, ["Original"]);
  } finally {
    await act(() => root.unmount()); dom.window.close();
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});

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

  assert.match(rootSource, /value === undefined \? \{ defaultValue \} : \{ value \}/);
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
