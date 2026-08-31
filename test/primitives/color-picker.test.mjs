import { JSDOM } from "jsdom";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";

import {
  ColorPicker,
  ColorPickerRoot,
  normalizeColorPickerValue,
  parseColorPickerValue,
} from "../../dist/index.js";

test("ColorPicker exposes the complete color anatomy and one successful form control", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ColorPicker.Root,
      {
        defaultValue: "rgba(85, 187, 85, 0.5)",
        name: "accent",
        form: "settings",
        required: true,
        inline: true,
      },
      React.createElement(ColorPicker.Label, null, "Accent color"),
      React.createElement(
        ColorPicker.Control,
        null,
        React.createElement(ColorPicker.ValueSwatch),
        React.createElement(ColorPicker.Input),
        React.createElement(ColorPicker.NativeInput),
        React.createElement(ColorPicker.Trigger, null, "Choose color"),
      ),
      React.createElement(ColorPicker.ValueText),
      React.createElement(
        ColorPicker.Area,
        null,
        React.createElement(ColorPicker.AreaBackground),
        React.createElement(ColorPicker.AreaThumb),
      ),
      React.createElement(
        ColorPicker.ChannelSlider,
        { channel: "hue" },
        React.createElement(ColorPicker.ChannelSliderLabel, null, "Hue"),
        React.createElement(ColorPicker.ChannelSliderTrack),
        React.createElement(ColorPicker.ChannelSliderThumb),
        React.createElement(ColorPicker.ChannelSliderValueText),
      ),
      React.createElement(
        ColorPicker.ChannelSlider,
        { channel: "alpha" },
        React.createElement(ColorPicker.TransparencyGrid),
        React.createElement(ColorPicker.ChannelSliderTrack),
        React.createElement(ColorPicker.ChannelSliderThumb),
      ),
      React.createElement(ColorPicker.ChannelInput, { channel: "red" }),
      React.createElement(ColorPicker.EyeDropperTrigger, null, "Sample screen"),
      React.createElement(
        ColorPicker.SwatchGroup,
        null,
        React.createElement(
          ColorPicker.SwatchTrigger,
          { value: "#55bb55" },
          React.createElement(
            ColorPicker.Swatch,
            { value: "#55bb55" },
            React.createElement(ColorPicker.SwatchIndicator, null, "Selected"),
          ),
        ),
      ),
      React.createElement(ColorPicker.FormatTrigger),
      React.createElement(ColorPicker.FormatSelect),
      React.createElement(ColorPicker.View, { format: "rgba" }, "RGBA channels"),
      React.createElement(ColorPicker.View, { format: "hsla" }, "HSLA channels"),
      React.createElement(ColorPicker.HiddenInput),
    ),
  );

  for (const slot of [
    "color-picker-area",
    "color-picker-area-background",
    "color-picker-area-thumb",
    "color-picker-channel-slider",
    "color-picker-channel-slider-track",
    "color-picker-channel-slider-thumb",
    "color-picker-channel-input",
    "color-picker-eye-dropper-trigger",
    "color-picker-swatch-group",
    "color-picker-swatch-trigger",
    "color-picker-swatch",
    "color-picker-swatch-indicator",
    "color-picker-format-select",
    "color-picker-value-swatch",
  ]) {
    assert.match(html, new RegExp(`data-slot="${slot}"`));
  }
  assert.match(html, /aria-roledescription="2d slider"/);
  assert.match(html, /data-channel="alpha"/);
  assert.match(html, /<label[^>]*for="[^"]+"[^>]*>Accent color<\/label>/);
  assert.match(html, /<input(?=[^>]*name="accent")(?=[^>]*form="settings")[^>]*>/);
  assert.equal(html.match(/name="accent"/g)?.length, 1);
  assert.equal(ColorPicker.Root, ColorPickerRoot);
});

test("ColorPicker parses and normalizes hexadecimal, alpha, RGB, HSL, and HSB values", () => {
  assert.equal(normalizeColorPickerValue(" #AbC "), "#aabbcc");
  assert.equal(normalizeColorPickerValue("#ABCDEF80"), "#abcdef80");
  assert.equal(normalizeColorPickerValue("rgb(255, 0, 128)"), "#ff0080");
  assert.equal(normalizeColorPickerValue("hsl(120, 100%, 50%)"), "#00ff00");
  assert.equal(normalizeColorPickerValue("hsb(240, 100%, 100%)"), "#0000ff");
  assert.equal(normalizeColorPickerValue("not-a-color"), null);
  assert.equal(parseColorPickerValue("rgba(1, 2, 3, 0.25)")?.getChannelValue("alpha"), 0.25);
});

test("ColorPicker propagates disabled and read-only state to every mutating part", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ColorPicker.Root,
      { value: "#123456", disabled: true, readOnly: true },
      React.createElement(ColorPicker.Label, null, "Color"),
      React.createElement(ColorPicker.Input),
      React.createElement(ColorPicker.NativeInput),
      React.createElement(ColorPicker.EyeDropperTrigger),
      React.createElement(ColorPicker.SwatchTrigger, { value: "#ffffff" }),
      React.createElement(
        ColorPicker.ChannelSlider,
        { channel: "alpha" },
        React.createElement(ColorPicker.ChannelSliderThumb),
      ),
    ),
  );
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /data-slot="color-picker-channel-slider-thumb"|data-part="channel-slider-thumb"/);
  assert.match(html, /aria-disabled=""/);
  assert.ok((html.match(/disabled=""/g)?.length ?? 0) >= 4);
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
    InputEvent: dom.window.InputEvent,
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
    dom,
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
  input.dispatchEvent(new input.ownerDocument.defaultView.Event("change", { bubbles: true }));
}

async function flush(ms = 0) {
  await new Promise((resolve) => setTimeout(resolve, ms));
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
    React.createElement(ColorPicker.SwatchTrigger, {
      value: "#aabbcc",
      "aria-label": "Use lavender",
    }),
    React.createElement(ColorPicker.HiddenInput),
  );
}

test("ColorPicker text and swatches update one uncontrolled color", async () => {
  const { container, cleanup } = installDom();
  const root = await createTestRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(InteractiveFixture, {
      name: "accent",
      onValueChange: (details) => changes.push(details.value.toString("hex").toLowerCase()),
    })));

    const textInput = container.querySelector("[data-slot='color-picker-input']");
    const nativeInput = container.querySelector("[data-slot='color-picker-native-input']");
    const hiddenInput = container.querySelector("[data-slot='color-picker-hidden-input']");
    const preset = container.querySelector("[data-slot='color-picker-swatch-trigger']");

    await React.act(async () => {
      textInput.focus();
      changeInput(textInput, "#A1B2C3");
      textInput.blur();
      await flush();
    });
    assert.equal(textInput.value.toLowerCase(), "#a1b2c3");
    assert.equal(nativeInput.value, "#a1b2c3");
    assert.match(hiddenInput.value, /161, 178, 195/);

    await React.act(async () => {
      preset.click();
      await flush();
    });
    assert.equal(textInput.value.toLowerCase(), "#aabbcc");
    assert.equal(nativeInput.value, "#aabbcc");
    assert.equal(preset.getAttribute("data-state"), "checked");
    assert.deepEqual(changes, ["#a1b2c3", "#aabbcc"]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("ColorPicker controlled values notify with details without mutating authored state", async () => {
  const { container, cleanup } = installDom();
  const root = await createTestRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(InteractiveFixture, {
      value: "#123456",
      onValueChange: (details) => changes.push(details),
    })));
    const textInput = container.querySelector("[data-slot='color-picker-input']");
    const preset = container.querySelector("[data-slot='color-picker-swatch-trigger']");

    await React.act(async () => preset.click());
    assert.equal(changes[0].value.toString("hex").toLowerCase(), "#aabbcc");
    assert.equal(typeof changes[0].valueAsString, "string");
    assert.equal(textInput.value.toLowerCase(), "#123456");
    assert.equal(preset.getAttribute("data-state"), "unchecked");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("ColorPicker channel inputs, format controls, and keyboard sliders share one model", async () => {
  const { container, cleanup } = installDom();
  const root = await createTestRoot(container);
  const ended = [];
  const formats = [];
  try {
    await React.act(async () => root.render(
      React.createElement(
        ColorPicker.Root,
        {
          defaultValue: "rgba(255, 0, 0, 0.5)",
          inline: true,
          onValueChangeEnd: (details) => ended.push(details.valueAsString),
          onFormatChange: (details) => formats.push(details.format),
        },
        React.createElement(ColorPicker.ChannelInput, { channel: "red" }),
        React.createElement(ColorPicker.ChannelInput, { channel: "alpha" }),
        React.createElement(
          ColorPicker.ChannelSlider,
          { channel: "alpha" },
          React.createElement(ColorPicker.ChannelSliderTrack),
          React.createElement(ColorPicker.ChannelSliderThumb),
        ),
        React.createElement(ColorPicker.FormatTrigger),
        React.createElement(ColorPicker.FormatSelect),
        React.createElement(ColorPicker.ValueText),
      ),
    ));

    const red = container.querySelector("[data-channel='red']");
    await React.act(async () => {
      red.focus();
      changeInput(red, "128");
      red.blur();
      await flush();
    });
    assert.equal(red.value, "128");
    assert.ok(ended.length >= 1);

    const thumb = container.querySelector("[data-slot='color-picker-channel-slider-thumb']");
    const before = Number(thumb.getAttribute("aria-valuenow"));
    await React.act(async () => {
      thumb.focus();
      thumb.dispatchEvent(new KeyboardEvent("keydown", {
        bubbles: true,
        key: "ArrowLeft",
        code: "ArrowLeft",
      }));
      await flush();
    });
    assert.ok(Number(thumb.getAttribute("aria-valuenow")) < before);
    const formatTrigger = container.querySelector("[data-slot='color-picker-format-trigger']");
    await React.act(async () => formatTrigger.click());
    assert.deepEqual(formats, ["hsba"]);
    assert.equal(formatTrigger.textContent, "HSBA");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("ColorPicker opens, closes, restores focus, and can close after swatch selection", async () => {
  const { container, cleanup } = installDom();
  const root = await createTestRoot(container);
  const openChanges = [];
  try {
    await React.act(async () => root.render(
      React.createElement(
        ColorPicker.Root,
        { closeOnSelect: true, onOpenChange: (details) => openChanges.push(details.open) },
        React.createElement(ColorPicker.Label, null, "Color"),
        React.createElement(ColorPicker.Trigger, null, "Choose color"),
        React.createElement(
          ColorPicker.Positioner,
          null,
          React.createElement(
            ColorPicker.Content,
            { "aria-label": "Preset colors" },
            React.createElement(ColorPicker.SwatchTrigger, { value: "#ffffff" }, "White"),
          ),
        ),
      ),
    ));

    const trigger = container.querySelector("[data-slot='color-picker-trigger']");
    const content = container.querySelector("[data-slot='color-picker-content']");
    trigger.focus();
    await React.act(async () => {
      trigger.click();
      await flush(20);
    });
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    assert.equal(content.hidden, false);

    const swatch = container.querySelector("[data-slot='color-picker-swatch-trigger']");
    await React.act(async () => {
      swatch.click();
      await flush(20);
    });
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    assert.equal(content.hidden, true);
    assert.deepEqual(openChanges, [true, false]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("ColorPicker hidden input submits the formatted value and reset restores default state", async () => {
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
    assert.match(hiddenInput.value, /170, 187, 204/);
    await React.act(async () => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    assert.equal(submissions[0].accent, hiddenInput.value);

    await React.act(async () => {
      form.reset();
      await flush();
    });
    assert.equal(container.querySelector("[data-slot='color-picker-input']").value.toLowerCase(), "#112233");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("ColorPicker EyeDropper is progressive and reports the sampled color at interaction end", async () => {
  const { dom, container, cleanup } = installDom();
  const root = await createTestRoot(container);
  const ended = [];
  class EyeDropper {
    async open() {
      return { sRGBHex: "#2468ac" };
    }
  }
  dom.window.EyeDropper = EyeDropper;
  try {
    await React.act(async () => root.render(
      React.createElement(
        ColorPicker.Root,
        { onValueChangeEnd: (details) => ended.push(details.value.toString("hex").toLowerCase()) },
        React.createElement(ColorPicker.EyeDropperTrigger, null, "Sample screen"),
        React.createElement(ColorPicker.Input),
        React.createElement(ColorPicker.Context, null, (api) =>
          React.createElement("output", { "data-test-color": "" }, api.value.toString("hex")),
        ),
      ),
    ));
    await React.act(async () => {
      container.querySelector("[data-slot='color-picker-eye-dropper-trigger']").click();
      await flush(50);
    });
    assert.deepEqual(ended, ["#2468ac"]);
    assert.equal(container.querySelector("[data-test-color]").textContent.toLowerCase(), "#2468ac");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("ColorPicker mirrors area and slider interaction in RTL", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ColorPicker.Root,
      { defaultValue: "hsl(90, 50%, 50%)", dir: "rtl", inline: true },
      React.createElement(
        ColorPicker.Area,
        null,
        React.createElement(ColorPicker.AreaBackground),
        React.createElement(ColorPicker.AreaThumb),
      ),
      React.createElement(
        ColorPicker.ChannelSlider,
        { channel: "hue" },
        React.createElement(ColorPicker.ChannelSliderTrack),
        React.createElement(ColorPicker.ChannelSliderThumb),
      ),
    ),
  );
  assert.match(html, /data-slot="color-picker"[^>]*dir="rtl"|dir="rtl"[^>]*data-slot="color-picker"/);
  assert.match(html, /aria-roledescription="2d slider"/);
  assert.match(html, /data-orientation="horizontal"/);
});
