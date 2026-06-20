import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  ModalRoot,
} from "../../dist/index.js";

test("Dialog renders its own trigger, content, title, description, close, overlay, and portal parts", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ModalRoot,
      { defaultOpen: true },
      React.createElement(DialogTrigger, null, "Open"),
      React.createElement(DialogTitle, null, "Settings"),
      React.createElement(DialogDescription, null, "Change preferences"),
      React.createElement(
        DialogContent,
        { ariaLabel: "Settings dialog", className: "content-class" },
        "Body",
        React.createElement(DialogClose, null, "Close"),
      ),
    ),
  );

  assert.equal(Dialog.Trigger, DialogTrigger);
  assert.equal(Dialog.Portal, DialogPortal);
  assert.equal(Dialog.Overlay, DialogOverlay);
  assert.equal(Dialog.Content, DialogContent);
  assert.equal(Dialog.Title, DialogTitle);
  assert.equal(Dialog.Description, DialogDescription);
  assert.equal(Dialog.Close, DialogClose);
  assert.match(html, /data-slot="dialog-trigger"/);
  assert.match(html, /data-slot="dialog-title"/);
  assert.match(html, /data-slot="dialog-description"/);
  assert.match(html, /data-slot="dialog-content"/);
  assert.match(html, /data-slot="dialog-close"/);
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-label="Settings dialog"/);
  assert.doesNotMatch(html, /aria-labelledby=/);
  assert.match(html, /class="content-class"/);
  assert.doesNotMatch(html, /data-slot="modal-trigger"/);
  assert.doesNotMatch(html, /data-slot="modal-title"/);
  assert.doesNotMatch(html, /data-slot="modal-description"/);
  assert.doesNotMatch(html, /data-slot="modal-close"/);
});
