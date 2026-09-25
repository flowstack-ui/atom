import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  SkipLink,
  SkipLinkRoot,
  SkipLinkTarget,
} from "../../dist/index.js";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { act } from "react";

test("SkipLink preserves native activation and resolves the anchor's document", async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: "https://example.test", pretendToBeVisual: true });
  const foreign = new JSDOM('<div id="root"></div>', { url: "https://example.test/frame", pretendToBeVisual: true });
  const previous = Object.fromEntries(["window", "document", "IS_REACT_ACT_ENVIRONMENT"].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  let root;
  try {
    for (const owner of [dom, foreign]) {
      let scrolled = 0;
      owner.window.HTMLElement.prototype.scrollIntoView = () => { scrolled += 1; };
      root = createRoot(owner.window.document.getElementById("root"));
      const render = async (props = {}) => act(() => root.render(React.createElement(React.Fragment, null,
        React.createElement(SkipLink.Root, { href: "#main%20content", ...props }),
        React.createElement(SkipLink.Target, { id: "main content" }, "Content"))));
      const click = async (options = {}) => {
        const event = new owner.window.MouseEvent("click", { bubbles: true, cancelable: true, ...options });
        await act(() => owner.window.document.querySelector("a").dispatchEvent(event));
        return event;
      };
      await render();
      assert.equal((await click()).defaultPrevented, true);
      assert.equal(owner.window.document.activeElement.id, "main content");
      assert.equal(scrolled, 1);
      for (const option of [{ctrlKey:true},{metaKey:true},{altKey:true},{shiftKey:true},{button:1}]) {
        assert.equal((await click(option)).defaultPrevented, false);
      }
      for (const props of [{target:"_blank"},{target:"named-frame"},{download:"file"},{focusTarget:false},{href:"#missing"}]) {
        await render(props);
        assert.equal((await click()).defaultPrevented, false);
      }
      const base = owner.window.document.createElement("base");
      base.target = "_blank";
      owner.window.document.head.append(base);
      await render();
      assert.equal((await click()).defaultPrevented, false);
      await render({target:"_self"});
      assert.equal((await click()).defaultPrevented, true);
      base.remove();
      await render({onClick: event => event.preventDefault()});
      const before = scrolled;
      await click();
      assert.equal(scrolled, before);
      await act(() => root.unmount());
      root = undefined;
    }
  } finally {
    if (root) await act(() => root.unmount());
    dom.window.close(); foreign.window.close();
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});

test("SkipLinkRoot renders a same-page skip anchor", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SkipLink.Root,
      {
        href: "#content",
        title: "Skip navigation",
        "data-testid": "skip-link",
      },
      "Skip",
    ),
  );

  assert.match(html, /^<a/);
  assert.match(html, /href="#content"/);
  assert.match(html, /title="Skip navigation"/);
  assert.match(html, /data-testid="skip-link"/);
  assert.match(html, /data-slot="skip-link"/);
  assert.match(html, />Skip<\/a>$/);
  assert.equal(SkipLink.Root, SkipLinkRoot);
});

test("SkipLinkTarget renders a programmatically focusable target", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      SkipLinkTarget,
      {
        id: "content",
        className: "main-region",
      },
      "Main",
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /id="content"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /data-slot="skip-link-target"/);
  assert.match(html, /class="main-region"/);
  assert.match(html, />Main<\/div>$/);
  assert.equal(SkipLink.Target, SkipLinkTarget);
});

test("SkipLink source guards malformed hash decoding without making the barrel client-only", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/skip-link/SkipLinkRoot.tsx", packageRoot),
    "utf8",
  );
  const indexSource = await readFile(
    new URL("src/primitives/skip-link/index.ts", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /try \{\s*decodedId = decodeURIComponent\(targetId\);/);
  assert.match(rootSource, /catch \{\s*decodedId = targetId;/);
  assert.match(rootSource, /event\.defaultPrevented/);
  assert.doesNotMatch(indexSource, /^"use client";/);
});
