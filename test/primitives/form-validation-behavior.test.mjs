import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import {
  assert,
  test,
  React,
} from "../test-utils.mjs";
import {
  Checkbox,
  CheckboxGroup,
  Combobox,
  Field,
  Fieldset,
  FileUpload,
  Form,
  Input,
  NumberInput,
  OTPField,
  PasswordToggleField,
  RadioGroup,
  Rating,
  Select,
  Switch,
  Textarea,
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
  dom.window.HTMLElement.prototype.attachEvent = () => undefined;
  dom.window.HTMLElement.prototype.detachEvent = () => undefined;

  return {
    container: dom.window.document.getElementById("root"),
    async cleanup(root) {
      await React.act(async () => root.unmount());
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      }
      dom.window.close();
    },
  };
}

async function render(element) {
  const environment = installDom();
  const root = createRoot(environment.container);
  await React.act(async () => root.render(element));
  return { ...environment, root };
}

async function attemptValidity(element) {
  let result;
  await React.act(async () => {
    result = element.checkValidity();
    await Promise.resolve();
  });
  return result;
}

async function click(element) {
  await React.act(async () => {
    element.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
  });
}

async function focus(element) {
  await React.act(async () => {
    element.focus();
    await Promise.resolve();
  });
}

test("Field Error selects inline behavior and mirrors a native Checkbox failure", async () => {
  const { container, root, cleanup } = await render(
    React.createElement(
      Form.Root,
      null,
      React.createElement(
        Field.Root,
        { id: "release", required: true },
        React.createElement(Field.Label, null, "Release acknowledgement"),
        React.createElement(Checkbox.Root, null, "Reviewed"),
        React.createElement(Field.Error, null, "Review is required."),
      ),
    ),
  );

  try {
    const form = container.querySelector("form");
    const field = container.querySelector('[data-slot="field"]');
    const visible = container.querySelector('[data-slot="checkbox"]');
    const proxy = container.querySelector("input[required]");
    const nativeFocus = visible.focus.bind(visible);
    let focusOptions;
    let scrollOptions;
    visible.focus = (options) => {
      focusOptions = options;
      nativeFocus(options);
    };
    visible.scrollIntoView = (options) => {
      scrollOptions = options;
    };

    assert.equal(proxy.dataset.atomValidationBehavior, "inline");
    assert.equal(field.hasAttribute("data-invalid"), false);
    assert.equal(visible.hasAttribute("data-invalid"), false);
    assert.equal(container.querySelector('[data-slot="field-error"]'), null);

    assert.equal(await attemptValidity(proxy), false);
    assert.equal(field.hasAttribute("data-invalid"), true);
    assert.equal(form.hasAttribute("data-invalid"), true);
    assert.equal(visible.getAttribute("aria-invalid"), "true");
    assert.equal(visible.hasAttribute("data-invalid"), true);
    assert.equal(
      container.querySelector('[data-slot="field-error"]').textContent,
      "Review is required.",
    );
    assert.equal(visible.getAttribute("aria-describedby"), "release-error");
    assert.equal(document.activeElement, visible);
    assert.equal(visible.hasAttribute("data-focus-visible"), true);
    assert.deepEqual(focusOptions, { preventScroll: true });
    assert.deepEqual(scrollOptions, { block: "center", inline: "nearest" });

    await React.act(async () => visible.blur());
    assert.equal(visible.hasAttribute("data-focus-visible"), false);

    await click(visible);
    assert.equal(proxy.validity.valid, true);
    assert.equal(field.hasAttribute("data-invalid"), false);
    assert.equal(form.hasAttribute("data-invalid"), false);
    assert.equal(visible.hasAttribute("data-invalid"), false);
    assert.equal(container.querySelector('[data-slot="field-error"]'), null);
  } finally {
    await cleanup(root);
  }
});

test("required Checkbox reveals invalid state after blur or removing its selection", async () => {
  const { container, root, cleanup } = await render(
    React.createElement(
      Form.Root,
      null,
      React.createElement(
        Field.Root,
        { id: "terms", required: true },
        React.createElement(Field.Label, null, "Terms"),
        React.createElement(Checkbox.Root, null, "Accept terms"),
        React.createElement(Field.Error, null, "Accept the terms."),
      ),
      React.createElement("button", { type: "button" }, "Next"),
    ),
  );

  try {
    const visible = container.querySelector('[data-slot="checkbox"]');
    const next = container.querySelector("form > button");

    assert.equal(visible.hasAttribute("data-invalid"), false);
    await focus(visible);
    await focus(next);
    assert.equal(visible.hasAttribute("data-invalid"), true);

    await click(visible);
    assert.equal(visible.hasAttribute("data-invalid"), false);

    await click(visible);
    assert.equal(visible.hasAttribute("data-invalid"), true);

    await React.act(async () => container.querySelector("form").reset());
    assert.equal(visible.hasAttribute("data-invalid"), false);
  } finally {
    await cleanup(root);
  }
});

test("standalone fallback stays native and an explicit control value overrides Form", async () => {
  const nativeCase = await render(
    React.createElement(Checkbox.Root, {
      required: true,
      "aria-label": "Accept terms",
    }),
  );

  try {
    const proxy = nativeCase.container.querySelector("input[required]");
    assert.equal(proxy.dataset.atomValidationBehavior, "native");
    const event = new window.Event("invalid", { cancelable: true });
    await React.act(async () => proxy.dispatchEvent(event));
    assert.equal(event.defaultPrevented, false);
  } finally {
    await nativeCase.cleanup(nativeCase.root);
  }

  const overrideCase = await render(
    React.createElement(
      Form.Root,
      { validationBehavior: "inline" },
      React.createElement(Checkbox.Root, {
        required: true,
        validationBehavior: "native",
        "aria-label": "Accept terms",
      }),
    ),
  );

  try {
    const proxy = overrideCase.container.querySelector("input[required]");
    assert.equal(proxy.dataset.atomValidationBehavior, "native");
    const event = new window.Event("invalid", { cancelable: true });
    await React.act(async () => proxy.dispatchEvent(event));
    assert.equal(event.defaultPrevented, false);
  } finally {
    await overrideCase.cleanup(overrideCase.root);
  }
});

test("CheckboxGroup reveals one group error and focuses its first enabled item", async () => {
  const { container, root, cleanup } = await render(
    React.createElement(
      "form",
      null,
      React.createElement(
        Fieldset.Root,
        { id: "delivery", required: true },
        React.createElement(Fieldset.Legend, null, "Delivery reports"),
        React.createElement(
          CheckboxGroup.Root,
          null,
          React.createElement(CheckboxGroup.Item, { value: "email", disabled: true }, "Email"),
          React.createElement(CheckboxGroup.Item, { value: "sms" }, "SMS"),
        ),
        React.createElement(Fieldset.Error, null, "Choose at least one delivery method."),
      ),
    ),
  );

  try {
    const fieldset = container.querySelector("fieldset");
    const group = container.querySelector('[data-slot="checkbox-group"]');
    const proxy = container.querySelector("input[required]");
    const items = container.querySelectorAll('[data-slot="checkbox-group-item"]');

    assert.equal(proxy.dataset.atomValidationBehavior, "inline");
    assert.equal(await attemptValidity(proxy), false);
    assert.equal(fieldset.getAttribute("aria-invalid"), "true");
    assert.equal(group.getAttribute("aria-invalid"), "true");
    assert.equal(group.getAttribute("aria-describedby"), "delivery-error");
    assert.equal(items[0].hasAttribute("data-invalid"), true);
    assert.equal(items[1].hasAttribute("data-invalid"), true);
    assert.equal(document.activeElement, items[1]);
    assert.equal(
      container.querySelectorAll('[data-slot="fieldset-error"]').length,
      1,
    );
  } finally {
    await cleanup(root);
  }
});

test("required CheckboxGroup reveals only after leaving the group or removing its last value", async () => {
  const { container, root, cleanup } = await render(
    React.createElement(
      Form.Root,
      null,
      React.createElement(
        Fieldset.Root,
        { id: "reports", required: true },
        React.createElement(Fieldset.Legend, null, "Reports"),
        React.createElement(
          CheckboxGroup.Root,
          null,
          React.createElement(CheckboxGroup.Item, { value: "email" }, "Email"),
          React.createElement(CheckboxGroup.Item, { value: "sms" }, "SMS"),
        ),
        React.createElement(Fieldset.Error, null, "Choose at least one report."),
      ),
      React.createElement("button", { type: "button" }, "Next"),
    ),
  );

  try {
    const group = container.querySelector('[data-slot="checkbox-group"]');
    const items = container.querySelectorAll('[data-slot="checkbox-group-item"]');
    const next = container.querySelector("form > button");

    await focus(items[0]);
    await focus(items[1]);
    assert.equal(group.hasAttribute("data-invalid"), false);

    await focus(next);
    assert.equal(group.hasAttribute("data-invalid"), true);

    await click(items[0]);
    assert.equal(group.hasAttribute("data-invalid"), false);

    await click(items[0]);
    assert.equal(group.hasAttribute("data-invalid"), true);
  } finally {
    await cleanup(root);
  }
});

test("inline validation state clears on an uncancelled reset", async () => {
  const { container, root, cleanup } = await render(
    React.createElement(
      "form",
      null,
      React.createElement(Checkbox.Root, {
        required: true,
        validationBehavior: "inline",
        "aria-label": "Accept terms",
      }),
    ),
  );

  try {
    const form = container.querySelector("form");
    const visible = container.querySelector('[data-slot="checkbox"]');
    const proxy = container.querySelector("input[required]");
    await attemptValidity(proxy);
    assert.equal(visible.hasAttribute("data-invalid"), true);

    await React.act(async () => form.reset());
    assert.equal(visible.hasAttribute("data-invalid"), false);
  } finally {
    await cleanup(root);
  }
});

test("Form inline behavior also handles an ordinary native input", async () => {
  const { container, root, cleanup } = await render(
    React.createElement(
      Form.Root,
      { validationBehavior: "inline" },
      React.createElement("input", { required: true, "aria-label": "Name" }),
    ),
  );

  try {
    const form = container.querySelector("form");
    const input = container.querySelector("input");
    const event = new window.Event("invalid", { bubbles: false, cancelable: true });
    await React.act(async () => {
      input.dispatchEvent(event);
      await Promise.resolve();
    });
    assert.equal(event.defaultPrevented, true);
    assert.equal(form.hasAttribute("data-invalid"), true);
    assert.equal(document.activeElement, input);
    assert.equal(input.hasAttribute("data-focus-visible"), true);

    await React.act(async () => {
      input.value = "Ada";
      input.dispatchEvent(new window.InputEvent("input", { bubbles: true }));
    });
    assert.equal(form.hasAttribute("data-invalid"), false);
  } finally {
    await cleanup(root);
  }
});

test("a Field native value overrides Form inline behavior for ordinary controls", async () => {
  const { container, root, cleanup } = await render(
    React.createElement(
      Form.Root,
      { validationBehavior: "inline" },
      React.createElement(
        Field.Root,
        { validationBehavior: "native" },
        React.createElement("input", { required: true, "aria-label": "Name" }),
        React.createElement(Field.Error, null, "Name is required."),
      ),
    ),
  );

  try {
    const field = container.querySelector('[data-slot="field"]');
    const input = container.querySelector("input");
    const event = new window.Event("invalid", { bubbles: false, cancelable: true });
    await React.act(async () => {
      input.dispatchEvent(event);
      await Promise.resolve();
    });

    assert.equal(event.defaultPrevented, false);
    assert.equal(field.hasAttribute("data-invalid"), true);
    assert.equal(
      container.querySelector('[data-slot="field-error"]').textContent,
      "Name is required.",
    );
  } finally {
    await cleanup(root);
  }
});

test("reset clears native-derived state without clearing explicit invalid state", async () => {
  const { container, root, cleanup } = await render(
    React.createElement(
      "form",
      null,
      React.createElement(Checkbox.Root, {
        required: true,
        invalid: true,
        validationBehavior: "inline",
        "aria-label": "Accept terms",
      }),
    ),
  );

  try {
    const form = container.querySelector("form");
    const visible = container.querySelector('[data-slot="checkbox"]');
    const proxy = container.querySelector("input[required]");
    await attemptValidity(proxy);
    await React.act(async () => form.reset());
    assert.equal(visible.hasAttribute("data-invalid"), true);
  } finally {
    await cleanup(root);
  }
});

test("every native validity owner mirrors an inline failure to its visible control", async () => {
  const cases = [
    {
      name: "Input",
      element: React.createElement(Input.Root, {
        required: true,
        validationBehavior: "inline",
        "aria-label": "Name",
      }),
      visible: '[data-slot="input"]',
    },
    {
      name: "Textarea",
      element: React.createElement(Textarea.Root, {
        required: true,
        validationBehavior: "inline",
        "aria-label": "Notes",
      }),
      visible: '[data-slot="textarea"]',
    },
    {
      name: "PasswordToggleField",
      element: React.createElement(
        PasswordToggleField.Root,
        { required: true, validationBehavior: "inline" },
        React.createElement(PasswordToggleField.Input, { "aria-label": "Password" }),
      ),
      visible: '[data-slot="password-toggle-field-input"]',
    },
    {
      name: "NumberInput",
      element: React.createElement(NumberInput.Root, {
        required: true,
        validationBehavior: "inline",
        "aria-label": "Quantity",
      }),
      visible: '[data-slot="number-input"]',
    },
    {
      name: "Checkbox",
      element: React.createElement(Checkbox.Root, {
        required: true,
        validationBehavior: "inline",
        "aria-label": "Terms",
      }),
      visible: '[data-slot="checkbox"]',
    },
    {
      name: "Switch",
      element: React.createElement(Switch.Root, {
        required: true,
        validationBehavior: "inline",
        "aria-label": "Sync",
      }),
      visible: '[data-slot="switch"]',
    },
    {
      name: "Select",
      element: React.createElement(
        Select.Root,
        { required: true, validationBehavior: "inline" },
        React.createElement(Select.Trigger, { "aria-label": "Plan" }),
      ),
      visible: '[data-slot="select-trigger"]',
    },
    {
      name: "Combobox",
      element: React.createElement(
        Combobox.Root,
        { options: [], required: true, validationBehavior: "inline" },
        React.createElement(Combobox.Input, { "aria-label": "Assignee" }),
      ),
      visible: '[data-slot="combobox-input"]',
    },
    {
      name: "Rating",
      element: React.createElement(
        Rating.Root,
        { required: true, validationBehavior: "inline", "aria-label": "Score" },
        React.createElement(Rating.Item, { value: 1 }),
      ),
      visible: '[data-slot="rating"]',
    },
    {
      name: "OTPField",
      element: React.createElement(
        OTPField.Root,
        { required: true, validationBehavior: "inline", length: 2 },
        React.createElement(OTPField.Input),
        React.createElement(OTPField.Input),
      ),
      visible: '[data-slot="otp-field"]',
    },
    {
      name: "FileUpload",
      element: React.createElement(
        FileUpload.Root,
        { required: true, validationBehavior: "inline" },
        React.createElement(FileUpload.HiddenInput),
        React.createElement(FileUpload.Trigger, null, "Choose file"),
      ),
      visible: '[data-slot="file-upload"]',
    },
    {
      name: "CheckboxGroup",
      element: React.createElement(
        CheckboxGroup.Root,
        { required: true, validationBehavior: "inline" },
        React.createElement(CheckboxGroup.Item, { value: "news" }, "News"),
      ),
      visible: '[data-slot="checkbox-group"]',
    },
    {
      name: "RadioGroup",
      element: React.createElement(
        RadioGroup.Root,
        { required: true, validationBehavior: "inline", "aria-label": "Plan" },
        React.createElement(RadioGroup.Radio, { value: "pro" }, "Pro"),
      ),
      visible: '[data-slot="radio-group"]',
    },
  ];

  for (const testCase of cases) {
    const environment = await render(testCase.element);
    try {
      const validityOwner = environment.container.querySelector(
        '[data-atom-validation-owner][required]',
      );
      const visible = environment.container.querySelector(testCase.visible);
      assert.ok(validityOwner, `${testCase.name} has a native validity owner`);
      assert.ok(visible, `${testCase.name} has a visible owner`);
      assert.equal(await attemptValidity(validityOwner), false, testCase.name);
      assert.equal(
        visible.hasAttribute("data-invalid"),
        true,
        `${testCase.name} mirrors invalid state`,
      );
      assert.equal(
        environment.container.ownerDocument.activeElement.hasAttribute(
          "data-focus-visible",
        ),
        true,
        `${testCase.name} marks validation-directed focus as visible`,
      );
    } finally {
      await environment.cleanup(environment.root);
    }
  }
});
