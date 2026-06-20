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

  assert.match(rootSource, /const contextValue: MenuContextValue = useMemo/);
  assert.match(rootSource, /useCollection<string, HTMLElement>\(\)/);
  assert.match(rootSource, /registerCollectionItem/);
  assert.doesNotMatch(rootSource, /compareDocumentPosition/);
  assert.match(rootSource, /isOpen && closeOnEscape && openSubMenuId === null/);
  assert.match(contentSource, /useFocusOnMount\(internalRef, isPresent\)/);
  assert.match(contentSource, /if \(!isPresent \|\| highlightedValue\) return undefined/);
  assert.match(contentSource, /case "ArrowRight":/);
  assert.match(contentSource, /el\?\.dataset\.slot === "menu-sub-trigger"/);
  assert.match(subContentSource, /usePresence\(\{ present: isOpen \}\)/);
  assert.match(subContentSource, /useCollection<string, HTMLElement>\(\)/);
  assert.match(subContentSource, /registerCollectionItem/);
  assert.doesNotMatch(subContentSource, /compareDocumentPosition/);
  assert.match(subContentSource, /case "ArrowRight":/);
  assert.match(subContentSource, /event\.stopPropagation\(\)/);
  assert.match(subContentSource, /el\?\.dataset\.slot === "menu-sub-trigger"/);
  assert.match(subContentSource, /aria-labelledby=\{!ariaLabel \? subTriggerId : undefined\}/);
  assert.ok(
    subContentSource.indexOf("const subMenuContext: MenuContextValue = useMemo") <
      subContentSource.indexOf("if (!isPresent) return null"),
  );
  assert.match(subContentSource, /parentMenuContext\.contentRef\.current\?\.focus\(\)/);
  assert.doesNotMatch(subContentSource, /subTriggerRef\.current\?\.focus\(\)/);
  assert.match(subTriggerSource, /id=\{subCtx\.subTriggerId\}/);
  assert.match(itemSource, /ctx\.onItemSelect\(value, \{ closeOnSelect \}\)/);
  assert.match(itemSource, /if \(ctx\.openSubMenuId\) ctx\.onSubMenuClose\(\)/);
  assert.match(checkboxSource, /closeOnSelect = false/);
  assert.match(checkboxSource, /ctx\.onItemSelect\(value, \{ closeOnSelect \}\)/);
  assert.match(checkboxSource, /if \(ctx\.openSubMenuId\) ctx\.onSubMenuClose\(\)/);
  assert.match(radioSource, /closeOnSelect = false/);
  assert.match(radioSource, /ctx\.onItemSelect\(value, \{ closeOnSelect \}\)/);
  assert.match(radioSource, /if \(ctx\.openSubMenuId\) ctx\.onSubMenuClose\(\)/);
  assert.doesNotMatch(itemSource, /ctx\.onClose\(\);/);
});
