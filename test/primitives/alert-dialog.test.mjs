import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
  Portal,
} from "../../dist/index.js";

test("AlertDialog renders trigger, content, title, description, cancel, and action parts", async () => {
  const html = renderToStaticMarkup(
    React.createElement(
      AlertDialogRoot,
      { defaultOpen: true },
      React.createElement(AlertDialogTrigger, null, "Delete"),
      React.createElement(
        AlertDialogContent,
        { ariaLabel: "Delete item" },
        React.createElement(AlertDialogTitle, null, "Delete item"),
        React.createElement(AlertDialogDescription, null, "This cannot be undone."),
        React.createElement("p", null, "Confirm delete"),
        React.createElement(AlertDialogCancel, null, "Cancel"),
        React.createElement(AlertDialogAction, null, "Delete"),
      ),
    ),
  );
  const rootSource = await readFile(
    new URL("src/primitives/alert-dialog/AlertDialogRoot.tsx", packageRoot),
    "utf8",
  );
  const actionSource = await readFile(
    new URL("src/primitives/alert-dialog/AlertDialogAction.tsx", packageRoot),
    "utf8",
  );
  const cancelSource = await readFile(
    new URL("src/primitives/alert-dialog/AlertDialogCancel.tsx", packageRoot),
    "utf8",
  );
  const contextSource = await readFile(
    new URL("src/primitives/alert-dialog/context.ts", packageRoot),
    "utf8",
  );

  assert.equal(AlertDialog.Root, AlertDialogRoot);
  assert.equal(AlertDialog.Portal, AlertDialogPortal);
  assert.equal(AlertDialog.Overlay, AlertDialogOverlay);
  assert.equal(AlertDialog.Content, AlertDialogContent);
  assert.equal(AlertDialog.Title, AlertDialogTitle);
  assert.equal(AlertDialog.Description, AlertDialogDescription);
  assert.equal(AlertDialog.Cancel, AlertDialogCancel);
  assert.equal(AlertDialog.Action, AlertDialogAction);
  assert.match(html, /role="alertdialog"/);
  assert.match(html, /aria-label="Delete item"/);
  assert.match(html, /data-slot="alert-dialog-trigger"/);
  assert.match(html, /data-slot="alert-dialog-content"/);
  assert.match(html, /data-slot="alert-dialog-title"/);
  assert.match(html, /data-slot="alert-dialog-description"/);
  assert.match(html, /data-slot="alert-dialog-cancel"/);
  assert.match(html, /data-slot="alert-dialog-action"/);
  assert.doesNotMatch(html, /data-slot="modal-trigger"/);
  assert.doesNotMatch(html, /data-slot="modal-title"/);
  assert.doesNotMatch(html, /data-slot="modal-description"/);
  assert.match(rootSource, /closeOnBackdropClick=\{false\}/);
  assert.match(actionSource, /onClose\("actionClick"\)/);
  assert.match(cancelSource, /onClose\("cancelClick"\)/);
  assert.match(contextSource, /AlertDialog compound components must be used within <AlertDialogRoot>/);
});
