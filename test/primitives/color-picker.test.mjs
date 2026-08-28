import { JSDOM } from "jsdom";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";

import {
  ColorPicker,
  ColorPickerRoot,
  normalizeColorPickerValue,
} from "../../dist/index.js";

test("ColorPicker exposes normalized state, accessible inputs, presets, and one form value", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ColorPicker.Root,
      { defaultValue: "#5B5", name: "accent", form: "settings", required: true },
      React.createElement(ColorPicker.Label, null, "Accent color"),
      React.createElement(
        ColorPicker.Control,
        null,
        React.createElement(ColorPicker.Input),
        React.createElement(ColorPicker.NativeInput),
      ),
      React.createElement(ColorPicker.SwatchTrigger, { value: "#55bb55" }),
      React.createElement(ColorPicker.HiddenInput),
    ),
  );

  assert.match(html, /data-slot="color-picker"/);
  assert.match(html, /data-required=""/);
  assert.match(html, /<label[^>]*for="[^"]+"[^>]*>Accent color<\/label>/);
  assert.match(html, /<input[^>]*type="text"[^>]*value="#55bb55"/);
  assert.match(html, /<input[^>]*type="color"[^>]*value="#55bb55"/);
  assert.match(html, /<button[^>]*aria-pressed="true"[^>]*>.*<\/button>/);
  assert.match(html, /<input(?=[^>]*type="hidden")(?=[^>]*name="accent")(?=[^>]*form="settings")(?=[^>]*value="#55bb55")[^>]*>/);
  assert.equal(html.match(/name="accent"/g)?.length, 1);
  assert.equal(ColorPicker.Root, ColorPickerRoot);
});

test("ColorPicker propagates disabled and read-only interaction states", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ColorPicker.Root,
      { value: "#123456", disabled: true, readOnly: true },
      React.createElement(ColorPicker.Label, null, "Color"),
      React.createElement(ColorPicker.Input),
      React.createElement(ColorPicker.NativeInput),
      React.createElement(ColorPicker.SwatchTrigger, { value: "#ffffff" }),
    ),
  );
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-readonly=""/);
  assert.equal(html.match(/disabled=""/g)?.length, 4);
});

test("normalizeColorPickerValue accepts only opaque hexadecimal colors", () => {
  assert.equal(normalizeColorPickerValue(" #AbC "), "#aabbcc");
  assert.equal(normalizeColorPickerValue("#ABCDEF"), "#abcdef");
  assert.equal(normalizeColorPickerValue("rgb(0 0 0)"), null);
  assert.equal(normalizeColorPickerValue("#abcd"), null);
});

test("ColorPicker avoids dangling label references and keeps read-only content inspectable", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ColorPicker.Root,
      { readOnly: true, defaultOpen: true },
      React.createElement(ColorPicker.Input, { "aria-label": "Hex color" }),
      React.createElement(ColorPicker.NativeInput),
      React.createElement(ColorPicker.Trigger, null, "Inspect color"),
      React.createElement(ColorPicker.Content, null, React.createElement(ColorPicker.SwatchTrigger, { value: "#ffffff" })),
    ),
  );
  assert.doesNotMatch(html, /aria-labelledby=/);
  assert.match(html, /aria-label="Hex color"/);
  assert.match(html, /aria-label="Open native color chooser"/);
  assert.match(html, /<button(?=[^>]*data-slot="color-picker-trigger")(?=[^>]*aria-expanded="true")(?![^>]*aria-disabled)[^>]*>/);
  assert.match(html, /<button(?=[^>]*data-slot="color-picker-swatch-trigger")(?=[^>]*aria-disabled="true")[^>]*>/);
});

function installDom() {
  const dom = new JSDOM(
    "<!doctype html><html><body><button id='before'>Before</button><div id='root'></div></body></html>",
    { pretendToBeVisual: true, url: "https://atom.test/" },
  );
  const saved = new Map();
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  const globals = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    HTMLInputElement: dom.window.HTMLInputElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    Event: dom.window.Event,
    KeyboardEvent: dom.window.KeyboardEvent,
    MouseEvent: dom.window.MouseEvent,
    FocusEvent: dom.window.FocusEvent,
    FormData: dom.window.FormData,
    MutationObserver: dom.window.MutationObserver,
    ResizeObserver,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    requestAnimationFrame: (callback) => setTimeout(() => callback(Date.now()), 0),
    cancelAnimationFrame: (handle) => clearTimeout(handle),
    IS_REACT_ACT_ENVIRONMENT: true,
  };

  for (const [key, value] of Object.entries(globals)) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  dom.window.scrollTo = () => {};

  return {
    container: dom.window.document.getElementById("root"),
    cleanup() {
      dom.window.close();
      for (const [key, descriptor] of saved) {
        descriptor
          ? Object.defineProperty(globalThis, key, descriptor)
          : delete globalThis[key];
      }
    },
  };
}

function changeInput(input, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    input.ownerDocument.defaultView.HTMLInputElement.prototype,
    "value",
  )?.set;
  valueSetter.call(input, value);
  input.dispatchEvent(new input.ownerDocument.defaultView.InputEvent("input", { bubbles: true }));
}

async function createTestRoot(container) {
  const { createRoot } = await import("react-dom/client");
  return createRoot(container);
}

function InteractiveFixture(props = {}) {
  return React.createElement(
    ColorPicker.Root,
    { defaultValue: "#112233", ...props },
    React.createElement(ColorPicker.Label, null, "Accent color"),
    React.createElement(ColorPicker.Input),
    React.createElement(ColorPicker.NativeInput),
    React.createElement(ColorPicker.SwatchTrigger, { value: "#abc", "aria-label": "Use lavender" }),
    React.createElement(ColorPicker.HiddenInput),
  );
}

test("ColorPicker uncontrolled text, native, and preset interactions update one normalized value", async () => {
  const { container, cleanup } = installDom();
  const root = await createTestRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(InteractiveFixture, {
      name: "accent",
      onValueChange: (value) => changes.push(value),
    })));

    const textInput = container.querySelector("[data-slot='color-picker-input']");
    const nativeInput = container.querySelector("[data-slot='color-picker-native-input']");
    const hiddenInput = container.querySelector("[data-slot='color-picker-hidden-input']");
    const preset = container.querySelector("[data-slot='color-picker-swatch-trigger']");

    await React.act(async () => changeInput(textInput, "#A1B2C3"));
    assert.equal(textInput.value, "#a1b2c3");
    assert.equal(nativeInput.value, "#a1b2c3");
    assert.equal(hiddenInput.value, "#a1b2c3");

    await React.act(async () => changeInput(textInput, "not-a-color"));
    assert.equal(textInput.value, "not-a-color");
    await React.act(async () => textInput.dispatchEvent(new FocusEvent("focusout", { bubbles: true })));
    assert.equal(textInput.value, "#a1b2c3");

    await React.act(async () => changeInput(nativeInput, "#445566"));
    assert.equal(textInput.value, "#445566");
    assert.equal(hiddenInput.value, "#445566");

    await React.act(async () => preset.click());
    assert.equal(textInput.value, "#aabbcc");
    assert.equal(nativeInput.value, "#aabbcc");
    assert.equal(hiddenInput.value, "#aabbcc");
    assert.equal(preset.getAttribute("aria-pressed"), "true");
    assert.deepEqual(changes, ["#a1b2c3", "#445566", "#aabbcc"]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("ColorPicker controlled interactions notify without mutating the authored value", async () => {
  const { container, cleanup } = installDom();
  const root = await createTestRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(InteractiveFixture, {
      value: "#123456",
      onValueChange: (value) => changes.push(value),
    })));
    const textInput = container.querySelector("[data-slot='color-picker-input']");
    const preset = container.querySelector("[data-slot='color-picker-swatch-trigger']");

    await React.act(async () => preset.click());
    assert.deepEqual(changes, ["#aabbcc"]);
    assert.equal(textInput.value, "#123456");
    assert.equal(preset.getAttribute("aria-pressed"), "false");

    await React.act(async () => root.render(React.createElement(InteractiveFixture, {
      value: "#aabbcc",
      onValueChange: (value) => changes.push(value),
    })));
    assert.equal(textInput.value, "#aabbcc");
    assert.equal(preset.getAttribute("aria-pressed"), "true");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("ColorPicker Popover opens from its trigger and Escape closes with focus restoration", async () => {
  const { container, cleanup } = installDom();
  const root = await createTestRoot(container);
  const openChanges = [];
  try {
    await React.act(async () => root.render(
      React.createElement(
        ColorPicker.Root,
        { onOpenChange: (open, reason) => openChanges.push([open, reason]) },
        React.createElement(ColorPicker.Trigger, null, "Choose color"),
        React.createElement(
          ColorPicker.Content,
          { "aria-label": "Preset colors" },
          React.createElement(ColorPicker.SwatchTrigger, { value: "#ffffff" }, "White"),
        ),
      ),
    ));

    const trigger = container.querySelector("[data-slot='color-picker-trigger']");
    trigger.focus();
    await React.act(async () => {
      trigger.click();
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    assert.ok(container.querySelector("[data-slot='color-picker-content']"));

    await React.act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    assert.equal(container.querySelector("[data-slot='color-picker-content']"), null);
    assert.equal(document.activeElement, trigger);
    assert.deepEqual(openChanges, [[true, undefined], [false, "escapeKeyDown"]]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("ColorPicker hidden input submits the current value and uncontrolled form reset restores its default", async () => {
  const { container, cleanup } = installDom();
  const root = await createTestRoot(container);
  const submissions = [];
  try {
    await React.act(async () => root.render(
      React.createElement(
        "form",
        {
          onSubmit: (event) => {
            event.preventDefault();
            submissions.push(Object.fromEntries(new FormData(event.currentTarget)));
          },
        },
        React.createElement(InteractiveFixture, { name: "accent" }),
        React.createElement("button", { type: "submit" }, "Save"),
      ),
    ));
    const form = container.querySelector("form");
    const hiddenInput = container.querySelector("[data-slot='color-picker-hidden-input']");
    const preset = container.querySelector("[data-slot='color-picker-swatch-trigger']");

    await React.act(async () => preset.click());
    assert.equal(hiddenInput.value, "#aabbcc");
    await React.act(async () => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    assert.deepEqual(submissions, [{ accent: "#aabbcc" }]);

    await React.act(async () => {
      form.reset();
      await Promise.resolve();
    });
    assert.equal(hiddenInput.value, "#112233");
    assert.equal(container.querySelector("[data-slot='color-picker-input']").value, "#112233");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});
