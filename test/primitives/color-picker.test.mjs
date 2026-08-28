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
