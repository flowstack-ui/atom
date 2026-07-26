import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
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

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body><form id='settings'></form><div id='root'></div></body></html>", {
    pretendToBeVisual: true,
    url: "https://example.test/",
  });
  const saved = new Map();
  for (const [key, current] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    Event: dom.window.Event,
    MouseEvent: dom.window.MouseEvent,
    KeyboardEvent: dom.window.KeyboardEvent,
    FormData: dom.window.FormData,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: current });
  }
  return {
    container: dom.window.document.getElementById("root"),
    cleanup() {
      dom.window.close();
      for (const [key, descriptor] of saved) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    },
  };
}

test("RadioGroupRoot renders WAI-ARIA radiogroup attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      RadioGroupRoot,
      {
        value: "email",
        disabled: true,
        readOnly: true,
        required: true,
        invalid: true,
        orientation: "horizontal",
        "aria-label": "Contact method",
        "aria-describedby": "contact-help",
        id: "contact",
        className: "group-class",
      },
      React.createElement(RadioRoot, { value: "email" }, "Email"),
      React.createElement(RadioRoot, { value: "phone" }, "Phone"),
    ),
  );

  assert.match(html, /<div/);
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /aria-label="Contact method"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="contact-help"/);
  assert.match(html, /aria-orientation="horizontal"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /data-slot="radio-group"/);
  assert.match(html, /data-orientation="horizontal"/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /class="group-class"/);
});

test("RadioGroupRoot restricts arrow-key navigation by orientation", () => {
  assert.equal(getRadioGroupNavigationDirection("vertical", "ArrowDown"), 1);
  assert.equal(getRadioGroupNavigationDirection("vertical", "ArrowUp"), -1);
  assert.equal(getRadioGroupNavigationDirection("vertical", "ArrowRight"), null);
  assert.equal(getRadioGroupNavigationDirection("vertical", "ArrowLeft"), null);

  assert.equal(getRadioGroupNavigationDirection("horizontal", "ArrowRight"), 1);
  assert.equal(getRadioGroupNavigationDirection("horizontal", "ArrowLeft"), -1);
  assert.equal(getRadioGroupNavigationDirection("horizontal", "ArrowRight", "rtl"), -1);
  assert.equal(getRadioGroupNavigationDirection("horizontal", "ArrowLeft", "rtl"), 1);
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
        "aria-label": "Contact method",
      },
      React.createElement(RadioRoot, {
        value: "email",
        "aria-label": "Email",
        className: "radio-class",
      }),
      React.createElement(RadioRoot, { value: "phone", "aria-label": "Phone" }),
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
      { value: "email", "aria-label": "Contact method" },
      React.createElement(RadioRoot, { value: "email", "aria-label": "Email" }),
    ),
  );

  assert.match(html, /role="radio"/);
  assert.doesNotMatch(html, /<input/);
});

test("RadioRoot passes native button attributes without losing group behavior", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      RadioGroupRoot,
      { value: "email", "aria-label": "Contact method" },
      React.createElement(RadioRoot, {
        id: "email-radio",
        value: "email",
        "aria-label": "Email",
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
      { value: "sms", "aria-label": "Contact method" },
      React.createElement(
        RadioRoot,
        {
          asChild: true,
          value: "sms",
          "aria-label": "SMS",
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

test("RadioRoot asChild exposes disabled state on non-native elements", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      RadioGroupRoot,
      { defaultValue: "email", "aria-label": "Contact method" },
      React.createElement(
        RadioRoot,
        { asChild: true, value: "email" },
        React.createElement("span", null, "Email"),
      ),
      React.createElement(
        RadioRoot,
        { asChild: true, value: "sms", disabled: true },
        React.createElement("span", null, "SMS"),
      ),
    ),
  );

  assert.match(html, /role="radio"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /data-value="sms"/);
});

test("RadioGroupRoot invalidates consumers when radios register", async () => {
  const source = await readFile(
    new URL("src/primitives/radio-group/RadioGroupRoot.tsx", packageRoot),
    "utf8",
  );

  assert.match(source, /useCollection<string, HTMLElement>\(\)/);
  assert.match(source, /version: registryVersion/);
  assert.match(source, /registryVersion/);
});

test("RadioGroup read-only state remains focusable and locks selection paths", async () => {
  const html = renderToStaticMarkup(
    React.createElement(
      RadioGroupRoot,
      { defaultValue: "email", readOnly: true, name: "channel", "aria-label": "Channel" },
      React.createElement(RadioRoot, { value: "email" }, "Email"),
      React.createElement(RadioRoot, { value: "sms" }, "SMS"),
    ),
  );
  const rootSource = await readFile(
    new URL("src/primitives/radio-group/RadioGroupRoot.tsx", packageRoot),
    "utf8",
  );
  const radioSource = await readFile(
    new URL("src/primitives/radio-group/RadioRoot.tsx", packageRoot),
    "utf8",
  );

  assert.match(html, /role="radiogroup"[^>]*aria-readonly="true"/);
  assert.match(html, /role="radio"[^>]*tabindex="0"/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /type="radio"[^>]*name="channel"[^>]*checked=""/);
  assert.doesNotMatch(html, /<button[^>]*disabled/);
  assert.match(rootSource, /if \(!readOnly\) setActiveValue\(next\)/);
  assert.match(rootSource, /if \(!readOnly\) setActiveValue\(previous\)/);
  assert.match(rootSource, /if \(!readOnly\) setActiveValue\(first\)/);
  assert.match(rootSource, /if \(!readOnly\) setActiveValue\(last\)/);
  assert.match(radioSource, /!isDisabled && !context\.readOnly/);
});

test("RadioGroup read-only interaction moves focus without changing or dropping the submitted value", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(
      React.createElement(
        RadioGroupRoot,
        {
          defaultValue: "email",
          readOnly: true,
          name: "channel",
          form: "settings",
          onValueChange: (value) => changes.push(value),
          "aria-label": "Channel",
        },
        React.createElement(RadioRoot, { value: "email" }, "Email"),
        React.createElement(RadioRoot, { value: "sms" }, "SMS"),
      ),
    ));
    const radios = [...container.querySelectorAll("[role='radio']")];
    await React.act(async () => radios[1].dispatchEvent(new MouseEvent("click", { bubbles: true })));
    assert.equal(radios[0].getAttribute("aria-checked"), "true");
    assert.equal(radios[1].getAttribute("aria-checked"), "false");
    radios[0].focus();
    await React.act(async () => radios[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
    assert.equal(document.activeElement, radios[1]);
    assert.equal(radios[0].getAttribute("aria-checked"), "true");
    assert.deepEqual(changes, []);
    assert.equal(new FormData(document.getElementById("settings")).get("channel"), "email");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});
