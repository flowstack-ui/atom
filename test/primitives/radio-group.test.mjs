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
  RadioGroupIndicator,
  RadioGroupItemRoot, RadioGroupItemHiddenInput, RadioGroupItemText, RadioGroupItemDescription,
  RadioGroupRootProvider, useRadioGroup,
  Fieldset,
} from "../../dist/index.js";

test("RadioGroup cannot re-enable an inherited disabled fieldset", () => {
  const html = renderToStaticMarkup(React.createElement(Fieldset.Root, { disabled: true },
    React.createElement(RadioGroupRoot, { disabled: false }, React.createElement(RadioRoot, { value: "a" }, "A"))));
  assert.match(html, /role="radio"[^>]*aria-disabled="true"/);
});

test("RadioRoot honors child cancellation and callback ref cleanup", async () => {
  const dom = installDom();
  const root = createRoot(dom.container);
  let attached = 0, detached = 0;
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(RadioGroupRoot, { onValueChange: value => changes.push(value) },
      React.createElement(RadioRoot, { value: "a", asChild: true, ref: node => {
        if (!node) return;
        attached++;
        return () => { detached++; };
      } }, React.createElement("button", { onClick: event => event.preventDefault() }, "A")))));
    await React.act(async () => dom.container.querySelector("button").click());
    assert.deepEqual(changes, []);
  } finally {
    await React.act(async () => root.unmount());
    dom.cleanup();
  }
  assert.ok(attached > 0);
  assert.equal(detached, attached);
});

test("RadioGroup Indicator keeps deterministic decorative SSR and named input anatomy", () => {
  const html = renderToStaticMarkup(React.createElement(RadioGroupRoot, { name: "view", defaultValue: "a", "data-slot": "custom-root" },
    React.createElement(RadioGroupIndicator),
    React.createElement(RadioRoot, { value: "a" }, "A"),
    React.createElement(RadioRoot, { value: "b" }, "B")));
  assert.match(html, /data-slot="radio-group-indicator"/);
  assert.doesNotMatch(html, /data-ready/);
  assert.equal((html.match(/type="radio"/g) ?? []).length, 2);
  assert.match(html, /aria-checked="true"/);
});

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

test("unavailable selected values retain one enabled Tab entry and fail required validity", async () => {
  const dom = installDom();
  const root = createRoot(dom.container);
  const changes = [];
  try {
    for (const [value, disabled] of [["missing", false], ["a", true], ["a", false]]) {
      await React.act(async () => root.render(React.createElement(RadioGroupRoot, { value, required: true, onValueChange: next => changes.push(next) },
        React.createElement(RadioRoot, { value: "a", disabled }, "A"),
        React.createElement(RadioRoot, { value: "b" }, "B"))));
      const eligible = [...dom.container.querySelectorAll('[role="radio"]')].filter(node => !node.disabled && node.tabIndex === 0);
      assert.equal(eligible.length, 1);
      assert.equal(eligible[0].textContent, disabled ? "B" : "A");
      assert.equal(dom.container.querySelector('input[type="checkbox"]').checked, value === "a" && !disabled);
    }
    assert.deepEqual(changes, []);
  } finally {
    await React.act(async () => root.unmount());
    dom.cleanup();
  }
});

test("open native items share controller state, names, refs and one submitted value", async () => {
  const dom = installDom();
  const root = createRoot(dom.container);
  const inputRef = React.createRef();
  const changes = [];
  let controller;
  function Example() {
    controller = useRadioGroup({ defaultValue: "a", name: "choice", form: "settings", onValueChange: next => changes.push(next) });
    return React.createElement(RadioGroupRootProvider, { controller }, ...["a", "b"].map(value => React.createElement(RadioGroupItemRoot, { key: value, value },
      React.createElement(RadioGroupItemHiddenInput, { ref: value === "b" ? inputRef : undefined }),
      React.createElement(RadioGroupItemText, {}, value.toUpperCase()),
      React.createElement(RadioGroupItemDescription, {}, `Details ${value}`))));
  }
  try {
    await React.act(async () => root.render(React.createElement(Example)));
    assert.equal(dom.container.querySelectorAll('input[type="radio"]').length, 2);
    assert.equal(dom.container.querySelectorAll('[role="radio"]').length, 0);
    const input = inputRef.current;
    assert.equal(document.getElementById(input.getAttribute("aria-labelledby")).textContent, "B");
    assert.equal(document.getElementById(input.getAttribute("aria-describedby")).textContent, "Details b");
    await React.act(async () => input.click());
    assert.deepEqual(changes, ["b"]);
    assert.deepEqual(new FormData(document.getElementById("settings")).getAll("choice"), ["b"]);
    await React.act(async () => controller.reset());
    assert.equal(controller.value, "a");
  } finally { await React.act(async () => root.unmount()); dom.cleanup(); }
});

test("dynamic availability recovers focus locally without rewriting selection", async () => {
  const dom = installDom();
  const root = createRoot(dom.container);
  const changes = [];
  function Demo({ values, disabled = [] }) {
    return React.createElement(React.Fragment, {},
      React.createElement("button", { id: "outside" }, "Outside"),
      React.createElement(RadioGroupRoot, { value: "a", required: true, onValueChange: value => changes.push(value) },
        ...values.map(value => React.createElement(RadioRoot, { key: value, value, disabled: disabled.includes(value) }, value))));
  }
  try {
    await React.act(async () => root.render(React.createElement(Demo, { values: ["a", "b", "c"] })));
    dom.container.querySelector('[role="radio"][data-value="a"]').focus();
    await React.act(async () => root.render(React.createElement(Demo, { values: ["b", "c"] })));
    assert.equal(document.activeElement.dataset.value, "b");
    assert.equal(dom.container.querySelectorAll('[role="radio"][tabindex="0"]').length, 1);
    assert.equal(dom.container.querySelector('input[type="checkbox"]').checked, false);
    document.getElementById("outside").focus();
    await React.act(async () => root.render(React.createElement(Demo, { values: ["c", "a"], disabled: ["a"] })));
    assert.equal(document.activeElement.id, "outside");
    assert.equal(dom.container.querySelector('[role="radio"][tabindex="0"]').dataset.value, "c");
    await React.act(async () => root.render(React.createElement(Demo, { values: ["c", "a"] })));
    assert.equal(dom.container.querySelector('[role="radio"][tabindex="0"]').dataset.value, "a");
    await React.act(async () => root.render(React.createElement(Demo, { values: ["c", "a"], disabled: ["a", "c"] })));
    assert.equal(dom.container.querySelectorAll('[role="radio"][tabindex="0"]').length, 0);
    assert.deepEqual(changes, []);
  } finally { await React.act(async () => root.unmount()); dom.cleanup(); }
});

test("provider locks guard external controller changes and native item cancellation", async () => {
  const dom = installDom();
  const root = createRoot(dom.container);
  let controller;
  const changes = [];
  function Demo({ disabled = false, readOnly = false, cancel = false }) {
    controller = useRadioGroup({ defaultValue: "a", onValueChange: value => changes.push(value) });
    return React.createElement(RadioGroupRootProvider, { controller, disabled, readOnly },
      ...["a","b"].map(value => React.createElement(RadioGroupItemRoot, { value, key:value },
        React.createElement(RadioGroupItemHiddenInput, { onChange: event => { if (cancel) event.preventDefault(); } }),
        React.createElement(RadioGroupItemText, {}, value))));
  }
  try {
    for (const locked of [{disabled:true},{readOnly:true}]) {
      await React.act(async () => root.render(React.createElement(Demo, locked)));
      await React.act(async () => controller.setValue("b"));
      assert.equal(controller.value, "a");
      await React.act(async () => dom.container.querySelector('input[value="b"]').click());
      assert.equal(controller.value, "a");
    }
    await React.act(async () => root.render(React.createElement(Demo, {cancel:true})));
    await React.act(async () => dom.container.querySelector('input[value="b"]').click());
    assert.equal(controller.value, "a");
    assert.equal(dom.container.querySelector('input[value="a"]').checked, true);
    assert.deepEqual(changes, []);
    await React.act(async () => root.render(React.createElement(Demo)));
    await React.act(async () => controller.setValue("b"));
    assert.equal(controller.value, "b");
  } finally { await React.act(async () => root.unmount()); dom.cleanup(); }
});

test("Indicator retains measured coordinates through selection commits", async () => {
  const dom = installDom();
  const root = createRoot(dom.container);
  const snapshots = [];
  const rect = { x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 40, width: 100, height: 40, toJSON() {} };
  const prototype = window.HTMLElement.prototype;
  prototype.getClientRects = () => [rect];
  prototype.getBoundingClientRect = function () {
    return { ...rect, left: this.textContent === "B" ? 100 : 0 };
  };
  function Example({ value }) {
    React.useLayoutEffect(() => {
      const indicator = dom.container.querySelector('[data-slot="radio-group-indicator"]');
      snapshots.push({ value, ready: indicator.hasAttribute("data-ready"), x: indicator.style.getPropertyValue("--radio-group-indicator-x") });
    }, [value]);
    return React.createElement(RadioGroupRoot, { value },
      React.createElement(RadioGroupIndicator),
      React.createElement(RadioRoot, { value: "a" }, "A"),
      React.createElement(RadioRoot, { value: "b" }, "B"));
  }
  try {
    await React.act(async () => root.render(React.createElement(Example, { value: "a" })));
    await React.act(async () => root.render(React.createElement(Example, { value: "b" })));
    assert.deepEqual(snapshots.at(-1), { value: "b", ready: true, x: "0px" });
    assert.equal(dom.container.querySelector('[data-slot="radio-group-indicator"]').style.getPropertyValue("--radio-group-indicator-x"), "100px");
    await React.act(async () => root.render(React.createElement(Example, { value: "" })));
    assert.equal(dom.container.querySelector('[data-slot="radio-group-indicator"]').hasAttribute("data-ready"), false);
  } finally {
    await React.act(async () => root.unmount());
    dom.cleanup();
  }
});

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
        dir: "rtl",
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
  assert.match(html, /dir="rtl"/);
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
  assert.doesNotMatch(html, /tabindex="0"/);
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

test("RadioGroup explicit dir overrides the default Direction context for horizontal keys", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => root.render(
      React.createElement(
        RadioGroupRoot,
        { defaultValue: "email", dir: "rtl", orientation: "horizontal", "aria-label": "Channel" },
        React.createElement(RadioRoot, { value: "email" }, "Email"),
        React.createElement(RadioRoot, { value: "sms" }, "SMS"),
      ),
    ));
    const radios = [...container.querySelectorAll("[role='radio']")];
    radios[0].focus();
    await React.act(async () => radios[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })));
    assert.equal(document.activeElement, radios[1]);
    assert.equal(radios[1].getAttribute("aria-checked"), "true");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});
