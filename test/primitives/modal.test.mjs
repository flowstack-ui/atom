import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Modal,
  ModalClose,
  ModalDescription,
  ModalRoot,
  ModalTitle,
  ModalTrigger,
} from "../../dist/index.js";

test("Modal primitives render linked trigger, title, description, and close control", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ModalRoot,
      { defaultOpen: true },
      React.createElement(ModalTrigger, { className: "trigger-class" }, "Open"),
      React.createElement(ModalTitle, { as: "h3", className: "title-class" }, "Settings"),
      React.createElement(ModalDescription, { className: "description-class" }, "Change preferences"),
      React.createElement(
        ModalClose,
        { asChild: true },
        React.createElement("button", { type: "button", className: "close-class" }, "Close"),
      ),
    ),
  );

  assert.match(html, /data-slot="modal-trigger"/);
  assert.match(html, /<button/);
  assert.match(html, /type="button"/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-controls="[^"]+"/);
  assert.doesNotMatch(html, /role="button"/);
  assert.doesNotMatch(html, /tabindex="0"/);
  assert.match(html, /class="trigger-class"/);
  assert.match(html, /<h3/);
  assert.match(html, /data-slot="modal-title"/);
  assert.match(html, /class="title-class"/);
  assert.match(html, /data-slot="modal-description"/);
  assert.match(html, /class="description-class"/);
  assert.match(html, /data-slot="modal-close"/);
  assert.match(html, /class="close-class"/);
});

test("ModalTrigger supports asChild with button semantics", () => {
  const triggerHtml = renderToStaticMarkup(
    React.createElement(
      ModalRoot,
      { defaultOpen: true },
      React.createElement(
        ModalTrigger,
        { asChild: true },
        React.createElement("span", { className: "custom-trigger" }, "Open"),
      ),
    ),
  );

  assert.match(triggerHtml, /<span/);
  assert.match(triggerHtml, /data-slot="modal-trigger"/);
  assert.match(triggerHtml, /role="button"/);
  assert.match(triggerHtml, /tabindex="0"/);
  assert.match(triggerHtml, /class="custom-trigger"/);
});

test("modal focus hooks guard against stale targets and outside focus traps", async () => {
  const focusSource = await readFile(
    new URL("src/hooks/focus.ts", packageRoot),
    "utf8",
  );
  const modalContentSource = await readFile(
    new URL("src/primitives/modal/useModalContent.ts", packageRoot),
    "utf8",
  );
  const selectListboxSource = await readFile(
    new URL("src/primitives/select/SelectListbox.tsx", packageRoot),
    "utf8",
  );
  const menuContentSource = await readFile(
    new URL("src/primitives/menu/MenuContent.tsx", packageRoot),
    "utf8",
  );
  const menuSubContentSource = await readFile(
    new URL("src/primitives/menu/MenuSubContent.tsx", packageRoot),
    "utf8",
  );
  const popoverContentSource = await readFile(
    new URL("src/primitives/popover/PopoverContent.tsx", packageRoot),
    "utf8",
  );

  assert.match(focusSource, /container\.contains\(document\.activeElement\)/);
  assert.match(focusSource, /document\.addEventListener\("focusin", handleFocusIn\)/);
  assert.match(focusSource, /focusFirstDescendant\(currentContainer\)/);
  assert.match(focusSource, /FocusScopeContext/);
  assert.match(focusSource, /registerContainer/);
  assert.match(focusSource, /querySelector<HTMLElement>\("\[autofocus\]"\)/);
  assert.match(focusSource, /document\.contains\(previousElementRef\.current\)/);
  assert.match(modalContentSource, /useCreateFocusScope\(\)/);
  assert.match(modalContentSource, /useFocusScopeContainer\(wrapperRef, isOpen, focusScope\)/);
  assert.match(modalContentSource, /useFocusTrap\(wrapperRef, isOpen, \{ scope: focusScope \}\)/);
  assert.match(modalContentSource, /focusFirstDescendant\(container\)/);
  assert.doesNotMatch(modalContentSource, /FOCUSABLE_SELECTOR/);
  assert.match(selectListboxSource, /useFocusScopeContainer\(internalRef, ctx\.isOpen\)/);
  assert.match(menuContentSource, /useFocusScopeContainer\(internalRef, isPresent\)/);
  assert.match(menuSubContentSource, /useFocusScopeContainer\(internalRef, isPresent\)/);
  assert.match(popoverContentSource, /useFocusScopeContainer\(contentRef, isPresent\)/);
  assert.match(popoverContentSource, /useFocusTrap\(contentRef, isOpen && modal, \{ scope: focusScope \}\)/);
});
