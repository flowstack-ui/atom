import { test, assert, React } from "../test-utils.mjs";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { FileUpload, useFileUpload, validateFileUploadFiles, normalizeFileAccept } from "../../dist/file-upload.js";
const h = React.createElement;
async function setup(run) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://example.test", pretendToBeVisual: true });
  const saved = new Map();
  for (const key of ["window", "document", "Node", "Element", "HTMLElement", "HTMLInputElement", "MutationObserver"]) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: dom.window[key] });
  }
  const previous = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const root = createRoot(dom.window.document.getElementById("root"));
  try { await run(root, dom.window); } finally {
    await React.act(async () => root.unmount()); dom.window.close();
    for (const [key, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous;
  }
}
test("FileUpload validates arrays/maps, minimum size and contextual structured errors", () => {
  const file = new File(["ok"], "a.png", { type: "image/png" });
  assert.equal(normalizeFileAccept({ "image/png": [".png"] }), "image/png,.png");
  const result = validateFileUploadFiles([file], { accept: ["image/*"], minSize: 3,
    validateFile: (item, context) => { assert.equal(context.files[0], item); return [{ code: "custom", message: "Not permitted" }]; } });
  assert.deepEqual(result.rejectedFiles[0].errors, ["too-small", "custom"]);
  assert.equal(result.rejectedFiles[0].details[0].message, "Not permitted");
});
test("FileUpload composed trigger opens once for Enter/Space and honors cancellation", async () => setup(async (root, win) => {
  let opens = 0;
  const render = cancel => h(FileUpload.Root, null, h(FileUpload.HiddenInput, { ref: node => { if (node) node.click = () => opens++; } }),
    h(FileUpload.Trigger, { asChild: true, onKeyDown: event => { if (cancel) event.preventDefault(); } }, h("div", null, "Choose")));
  await React.act(async () => root.render(render(false)));
  const trigger = win.document.querySelector('[data-slot="file-upload-trigger"]');
  for (const key of ["Enter", " "]) await React.act(async () => trigger.dispatchEvent(new win.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })));
  assert.equal(opens, 2);
  await React.act(async () => root.render(render(true)));
  await React.act(async () => trigger.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
  assert.equal(opens, 2);
}));
test("FileUpload controller rejects stale transforms after clear or newer selection", async () => setup(async (root) => {
  let api; const pending = [];
  function Demo() { api = useFileUpload({ transformFiles: files => new Promise(resolve => pending.push(() => resolve(files))) }); return h(FileUpload.RootProvider, { value: api }, h(FileUpload.HiddenInput)); }
  await React.act(async () => root.render(h(Demo)));
  const a = new File(["a"], "a.txt"), b = new File(["b"], "b.txt");
  await React.act(async () => api.setFilesFromList([a]));
  assert.equal(api.transforming, true);
  await React.act(async () => api.clearFiles());
  await React.act(async () => pending.shift()());
  assert.deepEqual(api.files, []);
  await React.act(async () => api.setFilesFromList([a]));
  await React.act(async () => api.setFilesFromList([b]));
  await React.act(async () => pending.pop()());
  await React.act(async () => pending.shift()());
  assert.deepEqual(api.files, [b]);
  assert.equal(api.transforming, false);
}));
test("FileUpload captures transform errors and preserves existing files", async () => setup(async root => {
  let api; const error = new Error("transform failed"); const file = new File(["x"], "x.txt");
  function Demo() { api = useFileUpload({ defaultFiles: [file], transformFiles: async () => { throw error; } }); return h(FileUpload.RootProvider, { value: api }); }
  await React.act(async () => root.render(h(Demo)));
  await React.act(async () => api.setFilesFromList([file]));
  assert.equal(api.transformError, error); assert.equal(api.transforming, false); assert.deepEqual(api.files, [file]);
}));
test("FileUpload dropzone excludes nested interactive controls and respects disableClick", async () => setup(async (root, win) => {
  let opens = 0;
  const demo = disableClick => h(FileUpload.Root, null, h(FileUpload.HiddenInput, { ref: node => { if (node) node.click = () => opens++; } }),
    h(FileUpload.Dropzone, { disableClick }, h(FileUpload.Trigger, null, "Choose"), h("a", { href: "#help" }, "Help")));
  await React.act(async () => root.render(demo(false)));
  await React.act(async () => win.document.querySelector("button").click()); assert.equal(opens, 1);
  await React.act(async () => win.document.querySelector("a").click()); assert.equal(opens, 1);
  await React.act(async () => win.document.querySelector('[data-slot="file-upload-dropzone"]').click()); assert.equal(opens, 2);
  await React.act(async () => root.render(demo(true)));
  await React.act(async () => win.document.querySelector('[data-slot="file-upload-dropzone"]').click()); assert.equal(opens, 2);
}));
test("FileUpload image previews use owner-window URLs and revoke on removal", async () => setup(async (root, win) => {
  const created = [], revoked = [];
  win.URL.createObjectURL = file => { created.push(file); return "blob:test"; };
  win.URL.revokeObjectURL = url => revoked.push(url);
  const file = new File(["x"], "x.png", { type: "image/png" });
  await React.act(async () => root.render(h(FileUpload.Root, null, h(FileUpload.Item, { file }, h(FileUpload.ItemPreviewImage)))));
  assert.equal(win.document.querySelector("img").src, "blob:test"); assert.equal(created.length, 1);
  await React.act(async () => root.render(null)); assert.deepEqual(revoked, ["blob:test"]);
}));

test("FileUpload synchronizes FileList using the iframe owner's DataTransfer", async () => setup(async (root, win) => {
  const iframe = win.document.createElement("iframe"); win.document.body.append(iframe);
  const owner = iframe.contentWindow; let calls = 0; let api;
  owner.DataTransfer = class { constructor() { calls++; this.files = []; this.items = { add: file => this.files.push(file) }; } };
  const frameRoot = createRoot(owner.document.body);
  function Demo() { api = useFileUpload(); return h(FileUpload.RootProvider, { value: api }, h(FileUpload.HiddenInput, { ref: node => {
    if (node) Object.defineProperty(node, "files", { configurable: true, writable: true, value: [] });
  } })); }
  await React.act(async () => frameRoot.render(h(Demo)));
  const file = new File(["x"], "frame.txt");
  await React.act(async () => api.setFiles([file]));
  assert.ok(calls >= 2); assert.equal(owner.document.querySelector("input").files[0], file);
  await React.act(async () => frameRoot.unmount()); iframe.remove();
}));

test("FileUpload directory traversal drains batches and preserves paths", async () => {
  const { getDroppedFiles } = await import("../../dist/_internal/primitives/file-upload/directory.js");
  const file = new File(["x"], "nested.txt"); let batch = 0;
  const entry = { isFile: false, createReader: () => ({ readEntries: resolve => resolve(batch++ === 0 ? [{ isFile: true, fullPath: "/folder/nested.txt", file: resolve => resolve(file) }] : []) }) };
  const files = await getDroppedFiles({ files: [], items: [{ kind: "file", webkitGetAsEntry: () => entry, getAsFile: () => null }] }, true);
  assert.equal(files[0].webkitRelativePath, "folder/nested.txt"); assert.equal(batch, 2);
});
