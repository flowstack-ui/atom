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
  const clickAwaySource = await readFile(
    new URL("src/hooks/useClickAway.ts", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /const contextValue: MenuContextValue = useMemo/);
  assert.match(rootSource, /useCollection<string, HTMLElement>\(\)/);
  assert.match(rootSource, /registerCollectionItem/);
  assert.doesNotMatch(rootSource, /compareDocumentPosition/);
  assert.match(rootSource, /enabled: isOpen && closeOnEscape/);
  assert.match(rootSource, /if \(openSubMenuId !== null\) return/);
  assert.match(rootSource, /onEscapeKeyDown: \(\) => \{\s*if \(openSubMenuId !== null\) return;\s*onClose\(\);/s);
  assert.match(contextSource, /getMenuSubmenuOpenKey\(dir: DirectionValue\)/);
  assert.match(contextSource, /return dir === "rtl" \? "ArrowLeft" : "ArrowRight"/);
  assert.match(contextSource, /getMenuSubmenuCloseKey\(dir: DirectionValue\)/);
  assert.match(contextSource, /return dir === "rtl" \? "ArrowRight" : "ArrowLeft"/);
  assert.match(contentSource, /useFocusOnMount\(internalRef, isPresent\)/);
  assert.match(contentSource, /const dir = useDirection\(\)/);
  assert.ok(
    contentSource.indexOf("useFocusScopeContainer(internalRef, isPresent)") <
      contentSource.indexOf("useFocusOnMount(internalRef, isPresent)"),
  );
  assert.match(contentSource, /const hasAppliedInitialHighlightRef = useRef\(false\)/);
  assert.match(contentSource, /if \(!isOpen \|\| !isPresent\) \{\s*hasAppliedInitialHighlightRef\.current = false/s);
  assert.match(contentSource, /if \(highlightedValue\) \{\s*hasAppliedInitialHighlightRef\.current = true/s);
  assert.match(contentSource, /if \(hasAppliedInitialHighlightRef\.current \|\| initialHighlight === null\) return undefined/);
  assert.match(contentSource, /if \(values\.length > 0\) \{\s*hasAppliedInitialHighlightRef\.current = true;\s*onHighlight/s);
  assert.doesNotMatch(contentSource, /if \(hasAppliedInitialHighlightRef\.current\) return undefined;\s*hasAppliedInitialHighlightRef\.current = true;\s*const raf/s);
  assert.match(contentSource, /case getMenuSubmenuOpenKey\(dir\):/);
  assert.match(contentSource, /getTypeaheadMatch\(/);
  assert.match(contentSource, /el\?\.dataset\.slot === "menu-sub-trigger"/);
  assert.match(contentSource, /useClickAway\(\{/);
  assert.match(contentSource, /ignore: \(target\) => openSubMenuId !== null && isMenuSubContent\(target\)/);
  assert.match(contentSource, /target\.closest\('\[data-slot="menu-sub-content"\]'\) !== null/);
  assert.match(contentSource, /aria-labelledby=\{!ariaLabel && triggerRef\.current \? triggerId : undefined\}/);
  assert.doesNotMatch(contentSource, /aria-labelledby=\{!ariaLabel \? triggerId : undefined\}/);
  assert.doesNotMatch(contentSource, /document\.addEventListener\("pointerdown"/);
  assert.match(subContentSource, /usePresence\(\{ present: isOpen \}\)/);
  assert.match(subContentSource, /const dir = useDirection\(\)/);
  assert.match(subContentSource, /useCollection<string, HTMLElement>\(\)/);
  assert.match(subContentSource, /registerCollectionItem/);
  assert.doesNotMatch(subContentSource, /compareDocumentPosition/);
  assert.match(subContentSource, /case getMenuSubmenuOpenKey\(dir\):/);
  assert.match(subContentSource, /case getMenuSubmenuCloseKey\(dir\):/);
  assert.match(subContentSource, /placement: dir === "rtl" \? "left-start" : "right-start"/);
  assert.match(subContentSource, /getTypeaheadMatch\(/);
  assert.match(subContentSource, /event\.stopPropagation\(\)/);
  assert.match(subContentSource, /el\?\.dataset\.slot === "menu-sub-trigger"/);
  assert.match(subContentSource, /aria-labelledby=\{!ariaLabel \? subTriggerId : undefined\}/);
  assert.match(subContentSource, /sideOffset = 4/);
  assert.match(subContentSource, /refs\.setReference\(subTriggerRef\.current\)/);
  assert.doesNotMatch(subContentSource, /elements: \{ reference: subTriggerRef\.current \}/);
  assert.ok(
    subContentSource.indexOf("const subMenuContext: MenuContextValue = useMemo") <
      subContentSource.indexOf("if (!isPresent) return null"),
  );
  assert.match(subContentSource, /useClickAway\(\{/);
  assert.match(subContentSource, /ignore: \(target\) => nestedOpenSubMenuId !== null && isMenuSubContent\(target\)/);
  assert.match(subContentSource, /target\.closest\('\[data-slot="menu-sub-content"\]'\) !== null/);
  assert.doesNotMatch(subContentSource, /document\.addEventListener\("pointerdown"/);
  assert.match(subContentSource, /parentMenuContext\.onItemSelect\(value, \{ closeOnSelect: true \}\)/);
  assert.doesNotMatch(subContentSource, /parentMenuContext\.onClose\(\);\s*parentMenuContext\.triggerRef\.current\?\.focus\(\)/s);
  assert.doesNotMatch(subContentSource, /subTriggerRef\.current\?\.focus\(\)/);
  assert.match(clickAwaySource, /document\.addEventListener\("pointerdown", handlePointerDown, true\)/);
  assert.match(clickAwaySource, /document\.removeEventListener\("pointerdown", handlePointerDown, true\)/);
  assert.match(clickAwaySource, /ignoreRef\.current\?\.\(target\)/);
  assert.doesNotMatch(clickAwaySource, /requestAnimationFrame/);
  assert.match(subTriggerSource, /id=\{subCtx\.subTriggerId\}/);
  assert.match(subTriggerSource, /const dir = useDirection\(\)/);
  assert.match(subTriggerSource, /event\.key === getMenuSubmenuOpenKey\(dir\)/);
  assert.match(itemSource, /ctx\.onItemSelect\(value, \{ closeOnSelect \}\)/);
  assert.match(itemSource, /if \(ctx\.openSubMenuId\) ctx\.onSubMenuClose\(\)/);
  assert.match(checkboxSource, /closeOnSelect = false/);
  assert.match(checkboxSource, /ctx\.onItemSelect\(value, \{ closeOnSelect \}\)/);
  assert.match(checkboxSource, /if \(ctx\.openSubMenuId\) ctx\.onSubMenuClose\(\)/);
  assert.match(radioSource, /closeOnSelect = false/);
  assert.match(contextSource, /groupId: string/);
  assert.match(radioGroupSource, /const groupId = useId\(\)/);
  assert.match(radioGroupSource, /value=\{\{ groupId, value, onValueChange: handleValueChange \}\}/);
  assert.match(radioSource, /const itemValue = `\$\{radioCtx\.groupId\}:\$\{value\}`/);
  assert.match(radioSource, /const isHighlighted = ctx\.highlightedValue === itemValue/);
  assert.match(radioSource, /ctx\.onItemSelect\(itemValue, \{ closeOnSelect \}\)/);
  assert.match(radioSource, /ctx\.registerItem\(itemValue, element\)/);
  assert.match(radioSource, /ctx\.registerLabel\(itemValue,/);
  assert.match(radioSource, /data-value=\{value\}/);
  assert.match(radioSource, /if \(ctx\.openSubMenuId\) ctx\.onSubMenuClose\(\)/);
  assert.doesNotMatch(itemSource, /ctx\.onClose\(\);/);
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
