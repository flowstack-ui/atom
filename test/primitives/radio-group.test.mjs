import {
  assert,
  packageRoot,
  readFile,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  RadioGroupRoot,
  RadioRoot,
} from "../../dist/index.js";

import {
  getRadioGroupNavigationDirection,
} from "../../dist/_internal/primitives/radio-group/RadioGroupRoot.js";

test("RadioGroupRoot renders WAI-ARIA radiogroup attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      RadioGroupRoot,
      {
        value: "email",
        required: true,
        invalid: true,
        orientation: "horizontal",
        ariaLabel: "Contact method",
        "aria-describedby": "contact-help",
        id: "contact",
        className: "group-class",
      },
      React.createElement(RadioRoot, { value: "email" }, "Email"),
      React.createElement(RadioRoot, { value: "phone" }, "Phone"),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /aria-label="Contact method"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="contact-help"/);
  assert.match(html, /aria-orientation="horizontal"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /data-slot="radio-group"/);
  assert.match(html, /data-orientation="horizontal"/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /class="group-class"/);
});

test("RadioGroupRoot restricts arrow-key navigation by orientation", () => {
  assert.equal(getRadioGroupNavigationDirection("vertical", "ArrowDown"), 1);
  assert.equal(getRadioGroupNavigationDirection("vertical", "ArrowUp"), -1);
  assert.equal(getRadioGroupNavigationDirection("vertical", "ArrowRight"), null);
  assert.equal(getRadioGroupNavigationDirection("vertical", "ArrowLeft"), null);

  assert.equal(getRadioGroupNavigationDirection("horizontal", "ArrowRight"), 1);
  assert.equal(getRadioGroupNavigationDirection("horizontal", "ArrowLeft"), -1);
  assert.equal(getRadioGroupNavigationDirection("horizontal", "ArrowDown"), null);
  assert.equal(getRadioGroupNavigationDirection("horizontal", "ArrowUp"), null);
});

test("RadioRoot renders selected and unselected radio items inside group", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      RadioGroupRoot,
      {
        value: "email",
        name: "contact",
        form: "contact-form",
        required: true,
        disabled: true,
        invalid: true,
        ariaLabel: "Contact method",
      },
      React.createElement(RadioRoot, {
        value: "email",
        ariaLabel: "Email",
        className: "radio-class",
      }),
      React.createElement(RadioRoot, { value: "phone", ariaLabel: "Phone" }),
    ),
  );

  assert.match(html, /role="radio"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-label="Email"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-state="checked"/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /data-slot="radio"/);
  assert.match(html, /data-value="email"/);
  assert.match(html, /class="radio-class"/);
  assert.match(html, /aria-checked="false"/);
  assert.match(html, /data-value="phone"/);
  assert.match(html, /type="radio"/);
  assert.match(html, /name="contact"/);
  assert.match(html, /value="email"/);
  assert.match(html, /form="contact-form"/);
  assert.match(html, /checked=""/);
  assert.match(html, /required=""/);
});

test("RadioRoot omits hidden input when group name is not provided", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      RadioGroupRoot,
      { value: "email", ariaLabel: "Contact method" },
      React.createElement(RadioRoot, { value: "email", ariaLabel: "Email" }),
    ),
  );

  assert.match(html, /role="radio"/);
  assert.doesNotMatch(html, /<input/);
});

test("RadioRoot passes native button attributes without losing group behavior", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      RadioGroupRoot,
      { value: "email", ariaLabel: "Contact method" },
      React.createElement(RadioRoot, {
        id: "email-radio",
        value: "email",
        ariaLabel: "Email",
        title: "Email",
        "data-testid": "radio-root",
        style: { color: "purple" },
      }),
    ),
  );

  assert.match(html, /id="email-radio"/);
  assert.match(html, /title="Email"/);
  assert.match(html, /data-testid="radio-root"/);
  assert.match(html, /style="color:purple"/);
  assert.match(html, /role="radio"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /data-state="checked"/);
});

test("RadioRoot asChild merges behavior inside group", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      RadioGroupRoot,
      { value: "sms", ariaLabel: "Contact method" },
      React.createElement(
        RadioRoot,
        {
          asChild: true,
          value: "sms",
          ariaLabel: "SMS",
          className: "root-class",
        },
        React.createElement("span", { className: "child-class" }, "SMS"),
      ),
    ),
  );

  assert.match(html, /<span/);
  assert.match(html, /role="radio"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /data-state="checked"/);
  assert.match(html, /data-value="sms"/);
  assert.match(html, /class="child-class root-class"/);
  assert.match(html, />SMS<\/span>/);
});

test("RadioGroupRoot invalidates consumers when radios register", async () => {
  const source = await readFile(
    new URL("src/primitives/radio-group/RadioGroupRoot.tsx", packageRoot),
    "utf8",
  );

  assert.match(source, /useCollection<string, HTMLButtonElement>\(\)/);
  assert.match(source, /version: registryVersion/);
  assert.match(source, /registryVersion/);
});
