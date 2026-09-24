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
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";

async function withTextareaDom(run) {
  const dom = new JSDOM('<div id="root"></div>', {
    pretendToBeVisual: true,
    url: "https://textarea.test/",
  });
  const observers = [];
  class TestResizeObserver {
    constructor(callback) { this.callback = callback; this.targets = new Set(); observers.push(this); }
    observe(target) { this.targets.add(target); }
    disconnect() { this.targets.clear(); }
  }
  dom.window.ResizeObserver = TestResizeObserver;
  const previous = new Map();
  for (const [key, next] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    ResizeObserver: TestResizeObserver,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: next });
  }
  const root = createRoot(dom.window.document.getElementById("root"));
  try {
    await run({ dom, observers, root });
  } finally {
    await React.act(() => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

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

test("Textarea never alters consumer dimensions while auto-resize is inactive", async () => {
  await withTextareaDom(async ({ dom, root }) => {
    const render = (value) => React.act(() => root.render(React.createElement(Textarea.Root, {
      value,
      style: { height: 120, minHeight: 80, maxHeight: 240, overflowY: "scroll" },
    })));
    await render("first");
    await render("unchanged dimensions");
    const textarea = dom.window.document.querySelector("textarea");
    assert.deepEqual(
      [textarea.style.height, textarea.style.minHeight, textarea.style.maxHeight, textarea.style.overflowY],
      ["120px", "80px", "240px", "scroll"],
    );
  });
});

test("Textarea restores the latest authored dimensions after auto-resize", async () => {
  await withTextareaDom(async ({ dom, root }) => {
    const render = (autoResize, style) => React.act(() => root.render(React.createElement(Textarea.Root, {
      autoResize,
      minRows: 3,
      maxRows: 2,
      style,
      value: "one\ntwo\nthree\nfour",
    })));
    await render(true, { height: 90, minHeight: "2lh", maxHeight: 180, overflowY: "scroll" });
    const textarea = dom.window.document.querySelector("textarea");
    Object.defineProperty(textarea, "scrollHeight", { configurable: true, value: 320 });
    await render(true, { height: 110, minHeight: 70, maxHeight: 200, overflowY: "auto" });
    assert.equal(textarea.getAttribute("rows"), "3");
    assert.equal(textarea.style.overflowY, "auto");
    await render(false, { height: 110, minHeight: 70, maxHeight: 200, overflowY: "auto" });
    assert.deepEqual(
      [textarea.style.height, textarea.style.minHeight, textarea.style.maxHeight, textarea.style.overflowY],
      ["110px", "70px", "200px", "auto"],
    );
  });
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
  assert.match(rootSource, /applyDimensions\(element, dimensionsRef\.current\)/);
  assert.match(rootSource, /element\.ownerDocument\.defaultView/);
  assert.match(rootSource, /new ResizeObserverConstructor/);
  assert.match(rootSource, /fonts\?\.addEventListener/);
  assert.match(rootSource, /Math\.max\(candidateMaxRows, normalizedMinRows \?\? 1\)/);
  assert.match(rootSource, /"data-focused"/);
});
