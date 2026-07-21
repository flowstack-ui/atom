import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Input,
  OTPField,
  OTPFieldInput,
  OTPFieldRoot,
  OTPFieldSeparator,
  filterOTPFieldValue,
  getOTPFieldChars,
  getOTPFieldDisplayChar,
  isOTPFieldCharAccepted,
} from "../../dist/index.js";

test("OTPField compound parts render grouped one-time-code inputs", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      OTPField.Root,
      {
        id: "otp",
        defaultValue: "12",
        length: 4,
        name: "code",
        required: true,
        invalid: true,
        "aria-label": "Verification code",
      },
      React.createElement(OTPField.Input),
      React.createElement(OTPField.Input),
      React.createElement(OTPField.Separator, null, "-"),
      React.createElement(OTPField.Input),
      React.createElement(OTPField.Input),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="group"/);
  assert.match(html, /aria-label="Verification code"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /data-slot="otp-field"/);
  assert.match(html, /id="otp-input-1"/);
  assert.match(html, /tabindex="0"[^>]*data-index="0"/);
  assert.match(html, /value="1"/);
  assert.match(html, /id="otp-input-1-2"/);
  assert.match(html, /tabindex="-1"[^>]*data-index="1"/);
  assert.match(html, /value="2"/);
  assert.match(html, /tabindex="-1"[^>]*data-index="2"/);
  assert.match(html, /tabindex="-1"[^>]*data-index="3"/);
  assert.match(html, /data-filled=""/);
  assert.match(html, /data-slot="otp-field-separator"/);
  assert.match(html, /<input(?=[^>]*type="text")(?=[^>]*required="")(?=[^>]*data-index="0")[^>]*>/);
  assert.match(html, /<input(?=[^>]*type="hidden")(?=[^>]*name="code")(?=[^>]*value="12")[^>]*>/);
  assert.equal(OTPField.Root, OTPFieldRoot);
  assert.equal(OTPField.Input, OTPFieldInput);
  assert.equal(OTPField.Separator, OTPFieldSeparator);
});

test("OTPField helpers filter values and mask display characters", () => {
  assert.deepEqual(getOTPFieldChars("12", 4), ["1", "2", "", ""]);
  assert.equal(filterOTPFieldValue("a1 b2 c3", /^[0-9]$/, 4), "123");
  assert.equal(getOTPFieldDisplayChar("7", true), "\u2022");
  assert.equal(getOTPFieldDisplayChar("7", "*"), "*");
  assert.equal(getOTPFieldDisplayChar("7", false), "7");
});

test("OTPField helpers handle stateful custom regex patterns", () => {
  const pattern = /^[0-9]$/g;

  assert.equal(isOTPFieldCharAccepted(pattern, "1"), true);
  assert.equal(isOTPFieldCharAccepted(pattern, "2"), true);
  assert.equal(pattern.lastIndex, 0);
  assert.equal(filterOTPFieldValue("1234", pattern, 4), "1234");
});

test("OTPField alphanumeric inputs use character labels", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      OTPField.Root,
      {
        length: 2,
        type: "alphanumeric",
        "aria-label": "Code",
      },
      React.createElement(OTPField.Input),
      React.createElement(OTPField.Input),
    ),
  );

  assert.match(html, /aria-label="Character 1 of 2"/);
  assert.match(html, /aria-label="Character 2 of 2"/);
  assert.doesNotMatch(html, /aria-label="Digit 1 of 2"/);
});

test("OTPField Input index remains available as an override", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      OTPField.Root,
      {
        defaultValue: "1234",
        length: 4,
        "aria-label": "Code",
      },
      React.createElement(OTPField.Input, { index: 2 }),
    ),
  );

  assert.match(html, /id="[^"]*-input-1-3"/);
  assert.match(html, /data-index="2"/);
  assert.match(html, /value="3"/);
});
