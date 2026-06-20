import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Input,
  PasswordToggleField,
  PasswordToggleFieldIcon,
  PasswordToggleFieldInput,
  PasswordToggleFieldRoot,
  PasswordToggleFieldToggle,
  useControllableState,
} from "../../dist/index.js";

test("PasswordToggleField switches input type and icon state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      PasswordToggleField.Root,
      { visible: true, invalid: true, required: true, readOnly: true },
      React.createElement(PasswordToggleField.Input, { "aria-label": "Password" }),
      React.createElement(
        PasswordToggleField.Toggle,
        null,
        React.createElement(PasswordToggleField.Icon, {
          visible: React.createElement("span", null, "Hide"),
          hidden: React.createElement("span", null, "Show"),
        }),
      ),
    ),
  );

  assert.match(html, /type="text"/);
  assert.match(html, /required=""/);
  assert.match(html, /readonly=""/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /data-slot="password-toggle-field-input"/);
  assert.match(html, /data-state="visible"/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, /data-required=""/);
  assert.doesNotMatch(html, /aria-pressed/);
  assert.doesNotMatch(html, /tabindex="-1"/);
  assert.match(html, /aria-label="Hide password"/);
  assert.match(html, />Hide</);
  assert.equal(PasswordToggleField.Root, PasswordToggleFieldRoot);
  assert.equal(PasswordToggleField.Input, PasswordToggleFieldInput);
  assert.equal(PasswordToggleField.Toggle, PasswordToggleFieldToggle);
  assert.equal(PasswordToggleField.Icon, PasswordToggleFieldIcon);
});

test("PasswordToggleField Toggle preserves asChild content and disabled behavior", async () => {
  const html = renderToStaticMarkup(
    React.createElement(
      PasswordToggleField.Root,
      { disabled: true },
      React.createElement(
        PasswordToggleField.Toggle,
        { asChild: true },
        React.createElement(
          "button",
          { className: "toggle-child" },
          React.createElement("span", null, "Eye"),
        ),
      ),
    ),
  );
  const primitiveIndexSource = await readFile(
    new URL("src/primitives/password-toggle-field/index.ts", packageRoot),
    "utf8",
  );

  assert.match(html, /<button/);
  assert.match(html, /class="toggle-child"/);
  assert.match(html, /type="button"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /data-disabled=""/);
  assert.match(html, />Eye</);
  assert.doesNotMatch(html, /aria-pressed/);
  assert.doesNotMatch(primitiveIndexSource, /^"use client";/);
});

test("PasswordToggleField source keeps functional toggle and validation state wiring", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/password-toggle-field/PasswordToggleFieldRoot.tsx", packageRoot),
    "utf8",
  );
  const inputSource = await readFile(
    new URL("src/primitives/password-toggle-field/PasswordToggleFieldInput.tsx", packageRoot),
    "utf8",
  );
  const toggleSource = await readFile(
    new URL("src/primitives/password-toggle-field/PasswordToggleFieldToggle.tsx", packageRoot),
    "utf8",
  );
  const hookSource = await readFile(
    new URL("src/hooks/useControllableState.ts", packageRoot),
    "utf8",
  );

  assert.match(hookSource, /SetStateAction/);
  assert.match(rootSource, /setResolvedVisible\(\(currentVisible\) => !currentVisible\)/);
  assert.match(inputSource, /"aria-invalid": ctx\.invalid \|\| undefined/);
  assert.match(inputSource, /"aria-required": ctx\.required \|\| undefined/);
  assert.match(toggleSource, /const \{ onToggle \} = ctx/);
  assert.match(toggleSource, /"data-readonly": ctx\.readOnly \? "" : undefined/);
  assert.match(toggleSource, /"data-invalid": ctx\.invalid \? "" : undefined/);
  assert.match(toggleSource, /"data-required": ctx\.required \? "" : undefined/);
});
