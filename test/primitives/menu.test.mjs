import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuItemIndicator,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuRoot,
  MenuSeparator,
  MenuSubContent,
} from "../../dist/index.js";

test("Menu primitives render item roles and selection state", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      MenuRoot,
      { defaultOpen: true },
      React.createElement(
        MenuItem,
        {
          value: "new",
          title: "New file",
          "data-testid": "menu-item-new",
          role: "button",
          className: "item-class",
        },
        "New",
      ),
      React.createElement(
        MenuCheckboxItem,
        { value: "grid", checked: true, className: "checkbox-class" },
        "Grid",
      ),
      React.createElement(
        MenuRadioGroup,
        { value: "comfortable", className: "radio-group-class" },
        React.createElement(
          MenuRadioItem,
          { value: "comfortable", className: "radio-class" },
          "Comfortable",
        ),
      ),
      React.createElement(
        MenuGroup,
        { className: "group-class" },
        React.createElement(MenuSeparator, { className: "separator-class" }),
      ),
    ),
  );

  assert.match(html, /role="menuitem"/);
  assert.match(html, /data-slot="menu-item"/);
  assert.match(html, /title="New file"/);
  assert.match(html, /data-testid="menu-item-new"/);
  assert.match(html, /data-value="new"/);
  assert.match(html, /class="item-class"/);
  assert.match(html, /role="menuitemcheckbox"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /data-slot="menu-checkbox-item"/);
  assert.match(html, /class="checkbox-class"/);
  assert.match(html, /role="group"/);
  assert.match(html, /data-slot="menu-radio-group"/);
  assert.match(html, /class="radio-group-class"/);
  assert.match(html, /role="menuitemradio"/);
  assert.match(html, /data-slot="menu-radio-item"/);
  assert.match(html, /data-checked=""/);
  assert.match(html, /class="radio-class"/);
  assert.match(html, /data-slot="menu-group"/);
  assert.doesNotMatch(html, /aria-labelledby="[^"]+"/);
  assert.match(html, /class="group-class"/);
  assert.match(html, /role="separator"/);
  assert.match(html, /data-slot="menu-separator"/);
  assert.match(html, /class="separator-class"/);
});

test("Menu labels and indicators create only valid owned relationships", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      MenuRoot,
      { defaultOpen: true },
      React.createElement(
        MenuGroup,
        null,
        React.createElement(MenuLabel, null, "Editing"),
        React.createElement(MenuItem, { value: "cut" }, "Cut"),
      ),
      React.createElement(
        MenuCheckboxItem,
        { value: "grid", checked: true },
        "Grid",
        React.createElement(MenuItemIndicator, null, "✓"),
      ),
      React.createElement(MenuGroup, null, React.createElement(MenuItem, { value: "plain" }, "Plain")),
    ),
  );
  const labelledGroup = html.match(/<div[^>]*role="group"[^>]*aria-labelledby="([^"]+)"[^>]*>/);
  assert.ok(labelledGroup);
  assert.match(html, new RegExp(`id="${labelledGroup[1]}"`));
  assert.equal((html.match(/aria-labelledby=/g) ?? []).length, 1);
  assert.match(html, /data-slot="menu-item-indicator"/);
  assert.match(html, /data-state="checked"/);
});

test("Menu source keeps selection and submenu close behavior stable", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/menu/MenuRoot.tsx", packageRoot),
    "utf8",
  );
  const itemSource = await readFile(
    new URL("src/primitives/menu/MenuItem.tsx", packageRoot),
    "utf8",
  );
  const checkboxSource = await readFile(
    new URL("src/primitives/menu/MenuCheckboxItem.tsx", packageRoot),
    "utf8",
  );
  const radioSource = await readFile(
    new URL("src/primitives/menu/MenuRadioItem.tsx", packageRoot),
    "utf8",
  );
  const radioGroupSource = await readFile(
    new URL("src/primitives/menu/MenuRadioGroup.tsx", packageRoot),
    "utf8",
  );
  const contextSource = await readFile(
    new URL("src/primitives/menu/context.ts", packageRoot),
    "utf8",
  );
  const subTriggerSource = await readFile(
    new URL("src/primitives/menu/MenuSubTrigger.tsx", packageRoot),
    "utf8",
  );
  const contentSource = await readFile(
    new URL("src/primitives/menu/MenuContent.tsx", packageRoot),
    "utf8",
  );
  const subContentSource = await readFile(
    new URL("src/primitives/menu/MenuSubContent.tsx", packageRoot),
    "utf8",
  );
  const outsideInteractionSource = await readFile(
    new URL("src/hooks/useOutsideInteraction.ts", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /const ownFocusScope = useCreateFocusScope\(\)/);
  assert.match(rootSource, /!modal && parentModal \? parentModal\.focusScope : ownFocusScope/);
  assert.match(rootSource, /createModalLayer\(parentModal\?\.layer \?\? null\)/);
  assert.match(rootSource, /onClose\("escape"\)/);
  assert.match(rootSource, /transaction\.reason !== "interactOutside" && transaction\.reason !== "tab"/);
  assert.match(rootSource, /\.filter\(\(item\) => item\.element\.isConnected\)/);
  assert.match(contextSource, /export type MenuCloseReason/);
  assert.match(contextSource, /getMenuSubmenuOpenKey\(dir: DirectionValue\)/);
  assert.match(contentSource, /const focusItem = useCallback/);
  assert.match(contentSource, /item\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(contentSource, /getTabbableOutsideBoundary/);
  assert.match(contentSource, /onClose\("tab"\)/);
  assert.match(contentSource, /useOutsideInteraction\(\{/);
  assert.match(contentSource, /onInteractOutside\?\.\(event\)/);
  assert.match(contentSource, /useModalIsolation\(modalLayer, focusScope, isOpen && modal\)/);
  assert.match(contentSource, /--atom-menu-available-width/);
  assert.match(contentSource, /--atom-menu-transform-origin/);
  assert.match(subContentSource, /const focusItem = useCallback/);
  assert.match(subContentSource, /subTriggerRef\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(subContentSource, /useOutsideInteraction\(\{/);
  assert.match(subContentSource, /--atom-menu-available-height/);
  assert.match(outsideInteractionSource, /const layers: OutsideInteractionLayer\[\] = \[\]/);
  assert.match(outsideInteractionSource, /document\.addEventListener\("click", handleClick, true\)/);
  assert.match(outsideInteractionSource, /POINTER_MOVEMENT_THRESHOLD = 8/);
  assert.match(subTriggerSource, /event\.pointerType !== "mouse"/);
  assert.match(subTriggerSource, /event\.currentTarget\.focus\(\{ preventScroll: true \}\)/);
  assert.match(itemSource, /if \(!element\) return undefined/);
  assert.match(itemSource, /ctx\.onItemSelect\(value, \{ closeOnSelect \}\)/);
  assert.doesNotMatch(itemSource, /ctx\.triggerRef\.current\?\.focus/);
  assert.match(checkboxSource, /checked\?: MenuItemCheckedState/);
  assert.match(checkboxSource, /"mixed"/);
  assert.match(radioSource, /forwardRef<HTMLElement, MenuRadioItemProps>/);
  assert.match(radioGroupSource, /hasMenuLabelPart\(children\)/);
});

test("MenuItem supports asChild and render composition", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      MenuRoot,
      { defaultOpen: true },
      React.createElement(
        MenuItem,
        {
          value: "as-child",
          asChild: true,
          className: "item-class",
          "data-testid": "as-child-item",
        },
        React.createElement("span", { className: "child-class" }, "As child"),
      ),
      React.createElement(
        MenuItem,
        {
          value: "rendered",
          render: "section",
          className: "render-class",
          "data-testid": "rendered-item",
        },
        "Rendered",
      ),
    ),
  );

  assert.match(html, /<span[^>]*role="menuitem"/);
  assert.match(html, /<span[^>]*data-slot="menu-item"/);
  assert.match(html, /<span[^>]*data-value="as-child"/);
  assert.match(html, /<span[^>]*class="child-class item-class"/);
  assert.match(html, /<span[^>]*data-testid="as-child-item"/);
  assert.doesNotMatch(html, /<div[^>]*data-value="as-child"/);
  assert.match(html, /<section[^>]*role="menuitem"/);
  assert.match(html, /<section[^>]*data-slot="menu-item"/);
  assert.match(html, /<section[^>]*data-value="rendered"/);
  assert.match(html, /<section[^>]*class="render-class"/);
  assert.doesNotMatch(html, /<div[^>]*data-value="rendered"/);
});
