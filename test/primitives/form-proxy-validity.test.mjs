import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";
import {
  Checkbox,
  Combobox,
  FileUpload,
  OTPField,
  RadioGroup,
  Rating,
  Select,
  Switch,
} from "../../dist/index.js";

function parse(element) {
  const dom = new JSDOM(`<!doctype html><body>${renderToStaticMarkup(element)}</body>`);
  return { dom, document: dom.window.document };
}

test("composite required controls expose browser-validatable native owners", () => {
  const cases = [
    React.createElement(Checkbox.Root, { required: true, "aria-label": "Terms" }),
    React.createElement(Switch.Root, { required: true, "aria-label": "Sync" }),
    React.createElement(
      RadioGroup.Root,
      { required: true, "aria-label": "Plan" },
      React.createElement(RadioGroup.Radio, { value: "pro" }, "Pro"),
    ),
    React.createElement(
      Select.Root,
      { required: true },
      React.createElement(Select.Trigger, { "aria-label": "Plan" }),
    ),
    React.createElement(
      Combobox.Root,
      { options: [], required: true, defaultInputValue: "display text" },
      React.createElement(Combobox.Input, { "aria-label": "Assignee" }),
    ),
    React.createElement(
      Rating.Root,
      { required: true, "aria-label": "Score" },
      React.createElement(Rating.Item, { value: 1 }),
    ),
    React.createElement(
      FileUpload.Root,
      { required: true },
      React.createElement(FileUpload.HiddenInput),
      React.createElement(FileUpload.Trigger, null, "Choose"),
    ),
  ];

  for (const element of cases) {
    const { dom, document } = parse(element);
    const owner = document.querySelector("input[required], select[required]");
    assert.ok(owner);
    assert.equal(owner.hasAttribute("readonly"), false);
    assert.equal(owner.willValidate, true);
    assert.equal(owner.checkValidity(), false);
    assert.equal(owner.hasAttribute("name"), false);
    dom.window.close();
  }
});

test("radio submission inputs stay separate from group required validity", () => {
  const { dom, document } = parse(
    React.createElement(
      RadioGroup.Root,
      { name: "plan", required: true, "aria-label": "Plan" },
      React.createElement(RadioGroup.Radio, { value: "basic" }, "Basic"),
      React.createElement(RadioGroup.Radio, { value: "pro" }, "Pro"),
    ),
  );
  const validationOwners = document.querySelectorAll("input[required]");
  const submissionInputs = document.querySelectorAll('input[type="radio"][name="plan"]');

  assert.equal(validationOwners.length, 1);
  assert.equal(validationOwners[0].type, "checkbox");
  assert.equal(submissionInputs.length, 2);
  assert.equal(Array.from(submissionInputs).some((input) => input.required), false);
  dom.window.close();
});

test("OTPField anchors required validity to its first visible cell", () => {
  const { dom, document } = parse(
    React.createElement(
      OTPField.Root,
      { name: "code", required: true, length: 2 },
      React.createElement(OTPField.Input),
      React.createElement(OTPField.Input),
    ),
  );
  const cells = document.querySelectorAll('[data-slot="otp-field-input"]');
  const combined = document.querySelector('input[type="hidden"][name="code"]');

  assert.equal(cells[0].required, true);
  assert.equal(cells[0].willValidate, true);
  assert.equal(cells[1].required, false);
  assert.ok(combined);
  assert.equal(combined.willValidate, false);
  dom.window.close();
});

test("validation-proxy focus is redirected to the visible Checkbox", async () => {
  const dom = new JSDOM(
    "<!doctype html><html><body><div id=\"root\"></div></body></html>",
    { pretendToBeVisual: true, url: "https://example.test/" },
  );
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    HTMLElement: globalThis.HTMLElement,
    Element: globalThis.Element,
    Node: globalThis.Node,
    Event: globalThis.Event,
    ResizeObserver: globalThis.ResizeObserver,
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Element = dom.window.Element;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.ResizeObserver = undefined;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  const root = createRoot(dom.window.document.getElementById("root"));
  await React.act(async () => {
    root.render(React.createElement(Checkbox.Root, {
      required: true,
      "aria-label": "Accept terms",
    }));
  });
  const proxy = dom.window.document.querySelector("input[required]");
  const visible = dom.window.document.querySelector('[role="checkbox"]');

  proxy.focus();
  assert.equal(dom.window.document.activeElement, visible);

  await React.act(async () => root.unmount());
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete globalThis[key];
    else globalThis[key] = value;
  }
  dom.window.close();
});
