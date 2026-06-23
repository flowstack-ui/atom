import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarRoot,
  MenubarTrigger,
} from "../../dist/index.js";

test("Menubar primitives render bar and menu trigger attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      MenubarRoot,
      { defaultValue: "file", className: "menubar-class" },
      React.createElement(
        MenubarMenu,
        { value: "file" },
        React.createElement(
          MenubarTrigger,
          { className: "menubar-trigger-class" },
          "File",
        ),
      ),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="menubar"/);
  assert.match(html, /aria-orientation="horizontal"/);
  assert.match(html, /data-slot="menubar"/);
  assert.match(html, /class="menubar-class"/);
  assert.match(html, /data-slot="menubar-trigger"/);
  assert.match(html, /role="menuitem"/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /aria-haspopup="menu"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-controls="[^"]+"/);
  assert.match(html, /class="menubar-trigger-class"/);
});

test("Menubar source keeps keyboard open and focus behavior stable", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/menubar/MenubarRoot.tsx", packageRoot),
    "utf8",
  );
  const menuSource = await readFile(
    new URL("src/primitives/menubar/MenubarMenu.tsx", packageRoot),
    "utf8",
  );
  const triggerSource = await readFile(
    new URL("src/primitives/menubar/MenubarTrigger.tsx", packageRoot),
    "utf8",
  );
  const contentSource = await readFile(
    new URL("src/primitives/menubar/MenubarContent.tsx", packageRoot),
    "utf8",
  );

  assert.match(triggerSource, /menuCtx\.onInitialHighlight\("last"\)/);
  assert.match(triggerSource, /const useSafeLayoutEffect =/);
  assert.match(triggerSource, /const \{ registerTrigger, unregisterTrigger \} = barCtx/);
  assert.match(triggerSource, /useSafeLayoutEffect\(\(\) => \{\s*const el = buttonRef\.current/s);
  assert.match(triggerSource, /\}, \[disabled, menuValue, registerTrigger, unregisterTrigger\]\)/);
  assert.doesNotMatch(triggerSource, /barCtx\.registerTrigger\(menuValue, el\)/);
  assert.doesNotMatch(triggerSource, /barCtx\.unregisterTrigger\(menuValue\)/);
  assert.doesNotMatch(triggerSource, /requestAnimationFrame\(\(\) => \{\s*const values = menuCtx\.getItemValues/s);
  assert.match(triggerSource, /data-disabled=\{disabled \? "" : undefined\}/);
  assert.match(triggerSource, /role="menuitem"/);
  assert.match(triggerSource, /aria-controls=\{menuCtx\.menuId\}/);
  assert.match(menuSource, /closeOnSelect = true/);
  assert.match(menuSource, /loop = true/);
  assert.match(menuSource, /closeOnEscape = true/);
  assert.match(menuSource, /closeOnSelect=\{closeOnSelect\}/);
  assert.match(menuSource, /loop=\{loop\}/);
  assert.match(menuSource, /closeOnEscape=\{closeOnEscape\}/);
  assert.match(rootSource, /useCollection<string, HTMLElement>\(\)/);
  assert.match(rootSource, /registerCollectionTrigger/);
  assert.match(rootSource, /registryVersion,/);
  assert.doesNotMatch(rootSource, /compareDocumentPosition/);
  assert.match(rootSource, /setFocusedValue\(\(currentValue\) => \(currentValue === value \? null : currentValue\)\)/);
  assert.match(rootSource, /const openAdjacentMenu = useCallback/);
  assert.match(contentSource, /const \{ openAdjacentMenu \} = barCtx/);
  assert.match(contentSource, /openAdjacentMenu\(menuValue, "prev"\)/);
  assert.match(contentSource, /highlightedElement\?\.dataset\.slot === "menu-sub-trigger"/);
  assert.match(contentSource, /openAdjacentMenu\(menuValue, "next"\)/);
  assert.doesNotMatch(contentSource, /\},\s*\[barCtx, menuCtx, menuValue\]/);
  assert.doesNotMatch(contentSource, /barCtx\.onMenuClose\(\);\s*barCtx\.focusAdjacentTrigger/s);
});
