import { test, assert, React } from "../test-utils.mjs";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { PinInput, RadioGroup, FileUpload, TableOfContents } from "../../dist/index.js";

const h = React.createElement;
const file = new File(["image"], "preview.png", { type: "image/png" });
const cases = {
  "PinInput.Input": ref => h(PinInput.Root, { length: 1 }, h(PinInput.Input, { ref })),
  "RadioGroup.Indicator": ref => h(RadioGroup.Root, null, h(RadioGroup.Indicator, { ref })),
  "FileUpload.ItemPreviewImage": ref => h(FileUpload.Root, { defaultFiles: [file] }, h(FileUpload.Item, { file }, h(FileUpload.ItemPreviewImage, { ref }))),
  "TableOfContents.Nav": ref => h(TableOfContents.Root, { items: [], enabled: false }, h(TableOfContents.Nav, { ref, "aria-label": "Contents" })),
};
for (const [name, render] of Object.entries(cases)) {
  test(`${name} preserves callback ref cleanup across rerender and unmount`, async () => {
    const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true });
    const saved = new Map();
    for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element, Node: dom.window.Node, MutationObserver: dom.window.MutationObserver, IS_REACT_ACT_ENVIRONMENT: true })) {
      saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    const root = createRoot(document.getElementById("root"));
    let attached = 0, cleaned = 0;
    const ref = node => { if (node) { attached++; return () => { cleaned++; }; } };
    try {
      await React.act(async () => root.render(render(ref)));
      await React.act(async () => root.render(render(ref)));
    } finally {
      await React.act(async () => root.unmount());
      dom.window.close();
      for (const [key, descriptor] of saved) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    }
    assert.ok(attached > 0);
    assert.equal(cleaned, attached);
  });
}
