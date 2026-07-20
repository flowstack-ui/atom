import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React } from "../test-utils.mjs";

import {
  Checkbox,
  CheckboxGroup,
  Field,
  Fieldset,
  Input,
  RadioGroup,
  Switch,
} from "../../dist/index.js";

function installDom() {
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
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Element = dom.window.Element;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  return {
    container: dom.window.document.getElementById("root"),
    cleanup() {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      }
      dom.window.close();
    },
  };
}

async function click(element) {
  await React.act(async () => {
    element.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  });
}

test("custom checkbox and switch values submit and restore uncontrolled defaults on reset", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => {
      root.render(
        React.createElement(
          React.Fragment,
          null,
          React.createElement("form", { id: "preferences" }),
          React.createElement(Checkbox.Root, {
            defaultChecked: true,
            form: "preferences",
            name: "terms",
            value: "accepted",
            "aria-label": "Accept terms",
          }),
          React.createElement(Switch.Root, {
            defaultChecked: false,
            form: "preferences",
            name: "updates",
            value: "enabled",
            "aria-label": "Email updates",
          }),
        ),
      );
    });

    const form = container.querySelector("form");
    const [checkbox, switchControl] = container.querySelectorAll("button");
    assert.deepEqual(Array.from(new window.FormData(form).entries()), [["terms", "accepted"]]);

    await click(checkbox);
    await click(switchControl);
    assert.deepEqual(Array.from(new window.FormData(form).entries()), [["updates", "enabled"]]);

    await React.act(async () => form.reset());
    assert.equal(checkbox.getAttribute("aria-checked"), "true");
    assert.equal(switchControl.getAttribute("aria-checked"), "false");
    assert.deepEqual(Array.from(new window.FormData(form).entries()), [["terms", "accepted"]]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("required CheckboxGroup validates one-or-more while RadioGroup submits one value", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => {
      root.render(
        React.createElement(
          "form",
          null,
          React.createElement(
            Fieldset.Root,
            { id: "topics", required: true },
            React.createElement(Fieldset.Legend, null, "Topics"),
            React.createElement(Fieldset.Description, null, "Choose at least one."),
            React.createElement(
              CheckboxGroup.Root,
              { name: "topics" },
              React.createElement(CheckboxGroup.Item, { value: "news" }, "News"),
              React.createElement(CheckboxGroup.Item, { value: "events" }, "Events"),
            ),
          ),
          React.createElement(
            RadioGroup.Root,
            { name: "contact", defaultValue: "email", "aria-label": "Contact" },
            React.createElement(RadioGroup.Radio, { value: "email" }, "Email"),
            React.createElement(RadioGroup.Radio, { value: "phone" }, "Phone"),
          ),
        ),
      );
    });

    const form = container.querySelector("form");
    const group = container.querySelector('[data-slot="checkbox-group"]');
    assert.equal(group.getAttribute("aria-labelledby"), "topics-legend");
    assert.equal(group.getAttribute("aria-describedby"), "topics-description");
    assert.equal(form.checkValidity(), false);

    await click(container.querySelector('[data-slot="checkbox-group-item"]'));
    assert.equal(form.checkValidity(), true);
    assert.deepEqual(Array.from(new window.FormData(form).entries()), [
      ["topics", "news"],
      ["contact", "email"],
    ]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Field relationships survive hydration and conditional error removal", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  function Example({ invalid }) {
    return React.createElement(
      Field.Root,
      { id: "email", invalid },
      React.createElement(Field.Label, null, "Email"),
      React.createElement(Input.Root, { name: "email" }),
      React.createElement(Field.Description, null, "Use a work address."),
      React.createElement(Field.Error, null, "Invalid address."),
    );
  }

  try {
    await React.act(async () => root.render(React.createElement(Example, { invalid: true })));
    const input = container.querySelector("input");
    assert.equal(input.getAttribute("aria-describedby"), "email-description email-error");
    assert.equal(container.querySelector('[data-slot="field-error"]').hasAttribute("role"), false);

    await React.act(async () => root.render(React.createElement(Example, { invalid: false })));
    assert.equal(input.getAttribute("aria-describedby"), "email-description");
    assert.equal(container.querySelector('[data-slot="field-error"]'), null);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});
