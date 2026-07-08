import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Toast,
  ToastAction,
  ToastCancel,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  getToasts,
  toast,
} from "../../dist/index.js";

test("Toast compound parts render live-region toast anatomy", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Toast.Provider,
      { closeButton: true },
      React.createElement(
        Toast.Root,
        { type: "error", closeButton: true, index: 0 },
        React.createElement(Toast.Title, null, "Failed"),
        React.createElement(Toast.Description, null, "Try again."),
        React.createElement(Toast.Action, null, "Retry"),
        React.createElement(Toast.Cancel, null, "Cancel"),
        React.createElement(Toast.Close, null, "Close"),
      ),
    ),
  );

  assert.match(html, /role="alert"/);
  assert.match(html, /aria-live="assertive"/);
  assert.match(html, /data-slot="toast"/);
  assert.match(html, /data-type="error"/);
  assert.match(html, /data-slot="toast-title"/);
  assert.match(html, />Failed</);
  assert.match(html, /data-slot="toast-description"/);
  assert.match(html, />Try again\.</);
  assert.match(html, /data-slot="toast-action"/);
  assert.match(html, /data-slot="toast-cancel"/);
  assert.match(html, /data-slot="toast-close"/);
  assert.equal(Toast.Provider, ToastProvider);
  assert.equal(Toast.Root, ToastRoot);
  assert.equal(Toast.Title, ToastTitle);
  assert.equal(Toast.Description, ToastDescription);
  assert.equal(Toast.Action, ToastAction);
  assert.equal(Toast.Cancel, ToastCancel);
  assert.equal(Toast.Close, ToastClose);
  assert.equal(Toast.Viewport, ToastViewport);
});

test("Toast imperative store API creates and dismisses toasts", () => {
  toast.dismiss();

  const id = toast.success("Saved", { id: "atom-toast-test" });
  const toasts = getToasts();

  assert.equal(id, "atom-toast-test");
  assert.equal(toasts.length, 1);
  assert.equal(toasts[0].type, "success");
  assert.equal(toasts[0].title, "Saved");

  toast.dismiss(id);
  assert.equal(getToasts().length, 0);
});

test("ToastViewport renders queued bottom stacks nearest the viewport anchor", () => {
  toast.dismiss();

  ["first", "second", "third", "fourth", "fifth"].forEach((label) => {
    toast.success(label, { id: `atom-toast-${label}` });
  });

  const html = renderToStaticMarkup(
    React.createElement(
      Toast.Provider,
      { maxVisible: 3 },
      React.createElement(ToastViewport, {
        portalDisabled: true,
        position: "bottom-right",
        renderToast: ({ toast: toastData, index }) =>
          React.createElement(
            "span",
            {
              "data-toast-id": toastData.id,
              "data-toast-index": index,
            },
            toastData.title,
          ),
      }),
    ),
  );

  assert.ok(html.indexOf("atom-toast-first") < html.indexOf("atom-toast-second"));
  assert.ok(html.indexOf("atom-toast-second") < html.indexOf("atom-toast-third"));
  assert.doesNotMatch(html, /atom-toast-fourth/);
  assert.doesNotMatch(html, /atom-toast-fifth/);
  assert.match(html, /data-toast-id="atom-toast-first" data-toast-index="2"/);
  assert.match(html, /data-toast-id="atom-toast-second" data-toast-index="1"/);
  assert.match(html, /data-toast-id="atom-toast-third" data-toast-index="0"/);

  toast.dismiss();
});

test("ToastViewport asChild inserts generated toasts into the child viewport element", () => {
  toast.dismiss();
  toast.success("Saved", { id: "atom-toast-as-child" });

  const html = renderToStaticMarkup(
    React.createElement(
      Toast.Provider,
      null,
      React.createElement(
        ToastViewport,
        {
          asChild: true,
          portalDisabled: true,
          renderToast: ({ toast: toastData }) =>
            React.createElement("span", { "data-toast-id": toastData.id }, toastData.title),
        },
        React.createElement("section", { "data-testid": "toast-viewport" }),
      ),
    ),
  );

  assert.match(html, /<section[^>]*data-testid="toast-viewport"/);
  assert.match(html, /data-slot="toast-viewport"/);
  assert.match(html, /data-toast-id="atom-toast-as-child"/);
  assert.match(html, />Saved<\/span>/);

  toast.dismiss();
});

test("Toast asChild parts preserve child content without nesting elements", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Toast.Provider,
      { closeButton: true },
      React.createElement(
        Toast.Root,
        { asChild: true, closeButton: true },
        React.createElement(
          "section",
          { "data-testid": "toast-root" },
          React.createElement(
            Toast.Title,
            { asChild: true },
            React.createElement("h2", null, "Saved"),
          ),
          React.createElement(
            Toast.Description,
            { asChild: true },
            React.createElement("p", null, "Changes saved."),
          ),
          React.createElement(
            Toast.Action,
            { asChild: true },
            React.createElement("button", null, "Undo"),
          ),
          React.createElement(
            Toast.Cancel,
            { asChild: true },
            React.createElement("button", null, "Dismiss undo"),
          ),
          React.createElement(
            Toast.Close,
            { asChild: true },
            React.createElement("button", null, "Close"),
          ),
        ),
      ),
    ),
  );

  assert.match(html, /<section[^>]*data-testid="toast-root"/);
  assert.match(html, /<h2[^>]*data-slot="toast-title"[^>]*>Saved<\/h2>/);
  assert.match(html, /<p[^>]*data-slot="toast-description"[^>]*>Changes saved\.<\/p>/);
  assert.match(html, /<button[^>]*data-slot="toast-action"[^>]*>Undo<\/button>/);
  assert.match(html, /<button[^>]*data-slot="toast-cancel"[^>]*>Dismiss undo<\/button>/);
  assert.match(html, /<button[^>]*data-slot="toast-close"[^>]*>Close<\/button>/);
  assert.doesNotMatch(html, /<button[^>]*><button/);
  assert.doesNotMatch(html, /<section[^>]*><section/);
});

test("Toast source keeps timers and live announcers stable", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/toast/ToastRoot.tsx", packageRoot),
    "utf8",
  );
  const viewportSource = await readFile(
    new URL("src/primitives/toast/ToastViewport.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /autoCloseTimerRef/);
  assert.match(rootSource, /stateRef\.current === "exiting"/);
  assert.doesNotMatch(rootSource, /stateRef\.current = "visible"/);
  assert.doesNotMatch(rootSource, /state === "exiting" && !toast\) return null/);
  assert.doesNotMatch(rootSource, /runRemove, state, toast/);
  assert.match(viewportSource, /getToastAnnouncement/);
  assert.match(viewportSource, /setPoliteAnnouncement/);
  assert.match(viewportSource, /setAssertiveAnnouncement/);
  assert.match(viewportSource, /toast-announcer-polite[\s\S]*\{politeAnnouncement\}/);
  assert.match(viewportSource, /toast-announcer-assertive[\s\S]*\{assertiveAnnouncement\}/);
  assert.match(viewportSource, /<Fragment key=\{toast\.id\}>/);
});
