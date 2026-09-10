import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";

import {
  Input,
  PinInput,
  PinInputInput,
  PinInputRoot,
  PinInputSeparator,
  filterPinInputValue,
  getPinInputChars,
  getPinInputDisplayChar,
  isPinInputCharAccepted,
} from "../../dist/index.js";

test("PinInput compound parts render grouped one-time-code inputs", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      PinInput.Root,
      {
        id: "otp",
        defaultValue: ["1", "2"],
        otp: true,
        length: 4,
        name: "code",
        required: true,
        invalid: true,
        "aria-label": "Verification code",
      },
      React.createElement(PinInput.Input),
      React.createElement(PinInput.Input),
      React.createElement(PinInput.Separator, null, "-"),
      React.createElement(PinInput.Input),
      React.createElement(PinInput.Input),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="group"/);
  assert.match(html, /aria-label="Verification code"/);
  assert.match(html, /aria-invalid="true"/);
  assert.doesNotMatch(html.match(/^<div[^>]*>/)?.[0] ?? "", /aria-required=/);
  assert.match(html, /data-slot="pin-input"/);
  assert.match(html, /id="otp-input-1"/);
  assert.match(html, /tabindex="0"[^>]*data-index="0"/);
  assert.match(html, /value="1"/);
  assert.match(html, /id="otp-input-1-2"/);
  assert.match(html, /tabindex="-1"[^>]*data-index="1"/);
  assert.match(html, /value="2"/);
  assert.match(html, /tabindex="-1"[^>]*data-index="2"/);
  assert.match(html, /tabindex="-1"[^>]*data-index="3"/);
  assert.match(html, /data-filled=""/);
  assert.match(html, /data-slot="pin-input-separator"/);
  assert.match(
    html,
    /<input(?=[^>]*type="text")(?=[^>]*required="")(?=[^>]*data-index="0")[^>]*>/,
  );
  assert.match(
    html,
    /<input(?=[^>]*type="hidden")(?=[^>]*name="code")(?=[^>]*value="12")[^>]*>/,
  );
  assert.equal(PinInput.Root, PinInputRoot);
  assert.equal(PinInput.Input, PinInputInput);
  assert.equal(PinInput.Separator, PinInputSeparator);
});

test("PinInput helpers filter values and mask display characters", () => {
  assert.deepEqual(getPinInputChars(["1", "2"], 4), ["1", "2", "", ""]);
  assert.equal(filterPinInputValue("a1 b2 c3", /^[0-9]$/, 4), "123");
  assert.equal(getPinInputDisplayChar("7", true), "\u2022");
  assert.equal(getPinInputDisplayChar("7", "*"), "*");
  assert.equal(getPinInputDisplayChar("7", false), "7");
});

test("PinInput helpers handle stateful custom regex patterns", () => {
  const pattern = /^[0-9]$/g;

  assert.equal(isPinInputCharAccepted(pattern, "1"), true);
  assert.equal(isPinInputCharAccepted(pattern, "2"), true);
  assert.equal(pattern.lastIndex, 0);
  assert.equal(filterPinInputValue("1234", pattern, 4), "1234");
});

test("PinInput alphanumeric inputs use character labels", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      PinInput.Root,
      {
        length: 2,
        type: "alphanumeric",
        "aria-label": "Code",
      },
      React.createElement(PinInput.Input),
      React.createElement(PinInput.Input),
    ),
  );

  assert.match(html, /aria-label="Character 1 of 2"/);
  assert.match(html, /aria-label="Character 2 of 2"/);
  assert.doesNotMatch(html, /aria-label="Digit 1 of 2"/);
});

test("PinInput localizes generated cell labels", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      PinInput.Root,
      {
        length: 2,
        "aria-label": "Código",
        getInputLabel: (index, length) => `Dígito ${index + 1} de ${length}`,
      },
      React.createElement(PinInput.Input),
      React.createElement(PinInput.Input),
    ),
  );

  assert.match(html, /aria-label="Dígito 1 de 2"/);
  assert.match(html, /aria-label="Dígito 2 de 2"/);
});

test("PinInput Input index remains available as an override", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      PinInput.Root,
      {
        defaultValue: ["1", "2", "3", "4"],
        length: 4,
        "aria-label": "Code",
      },
      React.createElement(PinInput.Input, { index: 2 }),
    ),
  );

  assert.match(html, /id="[^"]*-input-1-3"/);
  assert.match(html, /data-index="2"/);
  assert.match(html, /value="3"/);
});

test("PinInput defaults general codes and native masking without leaking behavior props", () => {
  const render = (props) =>
    renderToStaticMarkup(
      React.createElement(
        PinInput.Root,
        { length: 2, ...props },
        React.createElement(PinInput.Input),
        React.createElement(PinInput.Input),
      ),
    );
  assert.doesNotMatch(render({}), /one-time-code/);
  assert.match(render({ otp: true }), /one-time-code/);
  const masked = render({
    mask: true,
    defaultValue: ["0", "7"],
    selectOnFocus: false,
    blurOnComplete: true,
  });
  assert.match(masked, /type="password"/);
  assert.match(masked, /value="0"/);
  assert.doesNotMatch(masked, /selectOnFocus|blurOnComplete|mask=/);
  assert.match(render({ placeholder: "_" }), /placeholder="_"/);
});
test("PinInput normalizes nonfinite length and exports all parts", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      PinInput.Root,
      { length: NaN },
      React.createElement(PinInput.Input),
    ),
  );
  assert.match(html, /Digit 1 of 6/);
  for (const key of [
    "Root",
    "RootProvider",
    "Context",
    "Label",
    "Control",
    "Input",
    "Separator",
  ])
    assert.ok(PinInput[key]);
});
