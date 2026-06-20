import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Field,
  Textarea,
  TextareaCount,
  TextareaRoot,
  useControllableState,
} from "../../dist/index.js";

test("TextareaRoot renders native textarea props and Field-owned state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Field.Root,
      {
        id: "bio",
        invalid: true,
        required: true,
        readOnly: true,
      },
      React.createElement(Textarea.Root, {
        name: "bio",
        defaultValue: "Hello",
        placeholder: "Biography",
        rows: 4,
        maxLength: 20,
        title: "Biography",
        className: "textarea-class",
        style: { color: "blue" },
        "data-testid": "bio-textarea",
      }),
    ),
  );

  assert.match(html, /<textarea/);
  assert.match(html, /id="bio-control"/);
  assert.match(html, /name="bio"/);
  assert.match(html, /placeholder="Biography"/);
  assert.match(html, /rows="4"/);
  assert.match(html, /maxLength="20"/);
  assert.match(html, /title="Biography"/);
  assert.match(html, /class="textarea-class"/);
  assert.match(html, /style="color:blue"/);
  assert.match(html, /data-testid="bio-textarea"/);
  assert.match(html, /required=""/);
  assert.match(html, /readonly=""/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-readonly="true"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /data-slot="textarea"/);
  assert.match(html, /data-filled=""/);
  assert.match(html, /data-readonly=""/);
  assert.match(html, /data-invalid=""/);
  assert.match(html, />Hello<\/textarea>/);
  assert.equal(Textarea.Root, TextareaRoot);
});

test("TextareaCount reads value length and maxLength from context", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Textarea.Root,
      {
        value: "abcdef",
        maxLength: 5,
        autoResize: true,
        minRows: 2,
        maxRows: 4,
      },
      React.createElement(Textarea.Count, null),
    ),
  );

  assert.match(html, /data-slot="textarea"/);
  assert.match(html, /data-autoresize=""/);
  assert.match(html, /rows="2"/);
  assert.match(html, /<span aria-live="polite" data-slot="textarea-count" data-count="6" data-max="5" data-over-limit="">6\/5<\/span>/);
  assert.equal(Textarea.Count, TextareaCount);
});

test("TextareaCount asChild announces and replaces child content with the count", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Textarea.Root,
      {
        value: "abc",
        maxLength: 5,
      },
      React.createElement(
        Textarea.Count,
        { asChild: true },
        React.createElement("span", { className: "counter" }, "Characters"),
      ),
    ),
  );

  assert.match(html, /<span class="counter" aria-live="polite" data-slot="textarea-count" data-count="3" data-max="5">3\/5<\/span>/);
  assert.equal(Textarea.Count, TextareaCount);
});

test("Textarea source wires value changes and auto-resize behavior", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/textarea/TextareaRoot.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /useControllableState<string>/);
  assert.match(rootSource, /setResolvedValue\(event\.currentTarget\.value\)/);
  assert.match(rootSource, /fieldCtx\?\.controlId/);
  assert.match(rootSource, /fieldCtx\?\.describedBy/);
  assert.match(rootSource, /fontSize \* 1\.2/);
  assert.match(rootSource, /element\.style\.height = ""/);
  assert.match(rootSource, /element\.style\.height = "auto"/);
  assert.match(rootSource, /Math\.max\(1, Math\.floor\(minRows\)\)/);
  assert.match(rootSource, /"data-focused"/);
});
