import {
  assert,
  packageRoot,
  readFile,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Switch,
  SwitchRoot,
  SwitchThumb,
} from "../../dist/index.js";

test("SwitchRoot renders WAI-ARIA switch state attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SwitchRoot,
      {
        checked: true,
        disabled: true,
        invalid: true,
        ariaLabel: "Notifications",
        className: "switch-class",
      },
      React.createElement("span", null, "thumb"),
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /type="button"/);
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /aria-label="Notifications"/);
  assert.match(html, /disabled=""/);
  assert.doesNotMatch(html, /tabindex=/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /data-state="checked"/);
  assert.match(html, /data-slot="switch"/);
  assert.match(html, /class="switch-class"/);
  assert.match(html, /<span>thumb<\/span>/);
});

test("SwitchRoot passes native button attributes without losing Atom behavior", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SwitchRoot,
      {
        id: "sync-switch",
        checked: true,
        ariaLabel: "Enable sync",
        title: "Sync",
        "data-testid": "switch-root",
        style: { color: "red" },
      },
      React.createElement(SwitchThumb, { id: "sync-thumb", title: "Thumb" }),
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /id="sync-switch"/);
  assert.match(html, /title="Sync"/);
  assert.match(html, /data-testid="switch-root"/);
  assert.match(html, /style="color:red"/);
  assert.match(html, /role="switch"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(
    html,
    /<span id="sync-thumb" title="Thumb" aria-hidden="true" data-state="checked" data-slot="switch-thumb"><\/span>/,
  );
});

test("Switch namespace exposes Root and Thumb parts", () => {
  assert.equal(Switch.Root, SwitchRoot);
  assert.equal(Switch.Thumb, SwitchThumb);
});

test("SwitchThumb renders checked state inside SwitchRoot", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SwitchRoot,
      {
        checked: true,
        ariaLabel: "Enable sync",
      },
      React.createElement(SwitchThumb, null),
    ),
  );

  assert.match(
    html,
    /<span aria-hidden="true" data-state="checked" data-slot="switch-thumb"><\/span>/,
  );
});

test("SwitchThumb renders unchecked state inside SwitchRoot", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SwitchRoot,
      {
        checked: false,
        ariaLabel: "Enable sync",
      },
      React.createElement(SwitchThumb, null),
    ),
  );

  assert.match(
    html,
    /<span aria-hidden="true" data-state="unchecked" data-slot="switch-thumb"><\/span>/,
  );
});

test("SwitchThumb inherits disabled state from SwitchRoot", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SwitchRoot,
      {
        checked: true,
        disabled: true,
        ariaLabel: "Enable sync",
      },
      React.createElement(SwitchThumb, null),
    ),
  );

  assert.match(
    html,
    /<span aria-hidden="true" data-state="checked" data-slot="switch-thumb" data-disabled=""><\/span>/,
  );
});

test("SwitchRoot and SwitchThumb expose required readonly and invalid state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SwitchRoot,
      {
        checked: false,
        readOnly: true,
        required: true,
        invalid: true,
        ariaLabel: "Enable sync",
      },
      React.createElement(SwitchThumb, null),
    ),
  );

  assert.match(html, /role="switch"/);
  assert.match(html, /aria-checked="false"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /data-required=""/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /data-invalid=""/);
  assert.match(
    html,
    /<span aria-hidden="true" data-state="unchecked" data-slot="switch-thumb" data-invalid="" data-readonly="" data-required=""><\/span>/,
  );
});

test("SwitchRoot readOnly remains focusable without native disabled", () => {
  const html = renderToStaticMarkup(
    React.createElement(SwitchRoot, {
      checked: true,
      readOnly: true,
      ariaLabel: "Enable sync",
    }),
  );

  assert.match(html, /tabindex="0"/);
  assert.doesNotMatch(html, /disabled=""/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /data-readonly=""/);
});

test("SwitchRoot renders a hidden checkbox input for form submission when named", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SwitchRoot,
      {
        defaultChecked: true,
        name: "sync",
        value: "enabled",
        form: "settings-form",
        required: true,
        ariaLabel: "Enable sync",
      },
      React.createElement(SwitchThumb, null),
    ),
  );

  assert.match(html, /<button/);
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /<input/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /name="sync"/);
  assert.match(html, /value="enabled"/);
  assert.match(html, /form="settings-form"/);
  assert.match(html, /checked=""/);
  assert.match(html, /required=""/);
});

test("SwitchRoot omits form input when name is not provided", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SwitchRoot,
      {
        defaultChecked: true,
        ariaLabel: "Enable sync",
      },
      React.createElement(SwitchThumb, null),
    ),
  );

  assert.doesNotMatch(html, /<input/);
});

test("SwitchRoot still supports arbitrary children without SwitchThumb", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SwitchRoot,
      {
        defaultChecked: true,
        ariaLabel: "Enable sync",
      },
      React.createElement("span", null, "custom thumb"),
    ),
  );

  assert.match(html, /data-state="checked"/);
  assert.match(html, /<span>custom thumb<\/span>/);
});

test("SwitchRoot asChild merges behavior without replacing child content", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SwitchRoot,
      {
        asChild: true,
        checked: false,
        ariaLabel: "Power",
        className: "root-class",
      },
      React.createElement("span", { className: "child-class" }, "Power"),
    ),
  );

  assert.match(html, /^<span/);
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-checked="false"/);
  assert.match(html, /data-state="unchecked"/);
  assert.match(html, /class="child-class root-class"/);
  assert.match(html, />Power<\/span>$/);
});

test("SwitchRoot source keeps keyboard activation for non-native renders", async () => {
  const source = await readFile(new URL("src/primitives/switch/SwitchRoot.tsx", packageRoot), "utf8");

  assert.match(source, /handleKeyDown/);
  assert.match(source, /event\.currentTarget instanceof HTMLButtonElement/);
  assert.match(source, /event\.key !== "Enter" && event\.key !== " "/);
  assert.match(source, /event\.preventDefault\(\)/);
  assert.match(source, /onKeyDown: composeEventHandlers\(onKeyDown, handleKeyDown\)/);
});
