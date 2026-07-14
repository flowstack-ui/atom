import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Direction,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
  NavigationMenuSub,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  getNavigationMenuGeometry,
  getNavigationMenuGeometryStyle,
  getNavigationMenuViewportSizeStyle,
} from "../../dist/index.js";

test("NavigationMenu primitives render landmark, trigger, link, and active viewport content", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      {
        defaultValue: "products",
        "aria-label": "Primary",
        id: "main-navigation",
        style: { color: "blue" },
        "data-testid": "navigation-root",
        className: "navigation-root-class",
      },
      React.createElement(
        NavigationMenuList,
        { className: "navigation-list-class", "data-testid": "navigation-list" },
        React.createElement(
          NavigationMenuItem,
          {
            value: "products",
            className: "navigation-item-class",
            title: "Products item",
          },
          React.createElement(
            NavigationMenuTrigger,
            {
              className: "navigation-trigger-class",
              "data-testid": "navigation-trigger",
            },
            "Products",
          ),
          React.createElement(
            NavigationMenuContent,
            {
              className: "navigation-content-class",
              "data-testid": "navigation-content",
            },
            React.createElement("span", null, "Product panel"),
          ),
        ),
        React.createElement(
        NavigationMenuItem,
        { value: "docs" },
          React.createElement(
          NavigationMenuLink,
            {
              href: "/docs",
              active: true,
              className: "navigation-link-class",
              target: "_blank",
              rel: "noreferrer",
              "data-testid": "navigation-link",
            },
            "Docs",
          ),
        ),
        React.createElement(
          NavigationMenuItem,
          { value: "action" },
          React.createElement(
            NavigationMenuLink,
            {
              asChild: true,
              href: "/ignored",
              onSelect: () => {},
            },
            React.createElement("button", { type: "button" }, "Action"),
          ),
        ),
      ),
      React.createElement(
        NavigationMenuIndicator,
        {
          className: "navigation-indicator-class",
          "data-testid": "navigation-indicator",
        },
        React.createElement("span", null, "indicator"),
      ),
      React.createElement(NavigationMenuViewport, {
        className: "navigation-viewport-class",
        "data-testid": "navigation-viewport",
      }),
    ),
  );

  assert.match(html, /^<nav/);
  assert.match(html, /id="main-navigation"/);
  assert.match(html, /style="color:blue"/);
  assert.match(html, /data-testid="navigation-root"/);
  assert.match(html, /data-slot="navigation-menu"/);
  assert.match(html, /data-orientation="horizontal"/);
  assert.match(html, /aria-label="Primary"/);
  assert.match(html, /class="navigation-root-class"/);
  assert.match(html, /role="list"/);
  assert.match(html, /data-testid="navigation-list"/);
  assert.match(html, /data-slot="navigation-menu-list"/);
  assert.match(html, /class="navigation-list-class"/);
  assert.match(html, /data-slot="navigation-menu-item"/);
  assert.match(html, /title="Products item"/);
  assert.match(html, /class="navigation-item-class"/);
  assert.match(html, /data-slot="navigation-menu-trigger"/);
  assert.match(html, /data-testid="navigation-trigger"/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /aria-controls="[^"]+"/);
  assert.match(html, /class="navigation-trigger-class"/);
  assert.match(html, /data-slot="navigation-menu-link"/);
  assert.match(html, /href="\/docs"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noreferrer"/);
  assert.match(html, /data-testid="navigation-link"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /class="navigation-link-class"/);
  assert.match(html, /<button type="button" data-slot="navigation-menu-link">Action<\/button>/);
  assert.doesNotMatch(html, /<button[^>]+href="\/ignored"/);
  assert.match(html, /data-slot="navigation-menu-indicator"/);
  assert.match(html, /data-state="visible"/);
  assert.match(html, /data-testid="navigation-indicator"/);
  assert.match(html, /class="navigation-indicator-class"/);
  assert.match(html, /<span>indicator<\/span>/);
  assert.match(html, /data-slot="navigation-menu-viewport"/);
  assert.match(html, /data-testid="navigation-viewport"/);
  assert.match(html, /class="navigation-viewport-class"/);
  assert.match(html, /data-slot="navigation-menu-content"/);
  assert.match(html, /data-testid="navigation-content"/);
  assert.match(html, /data-motion="from-end"/);
  assert.match(html, /class="navigation-content-class"/);
  assert.match(html, /Product panel/);
});

test("NavigationMenu primitives allow custom data-slot overrides", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      {
        defaultValue: "products",
        "data-slot": "custom-navigation-root",
      },
      React.createElement(
        NavigationMenuList,
        { "data-slot": "custom-navigation-list" },
        React.createElement(
          NavigationMenuItem,
          { value: "products", "data-slot": "custom-navigation-item" },
          React.createElement(
            NavigationMenuTrigger,
            { "data-slot": "custom-navigation-trigger" },
            "Products",
          ),
          React.createElement(
            NavigationMenuContent,
            { "data-slot": "custom-navigation-content" },
            "Product panel",
          ),
        ),
        React.createElement(
          NavigationMenuItem,
          { value: "docs" },
          React.createElement(
            NavigationMenuLink,
            {
              href: "/docs",
              "data-slot": "custom-navigation-link",
            },
            "Docs",
          ),
        ),
      ),
      React.createElement(NavigationMenuIndicator, {
        "data-slot": "custom-navigation-indicator",
      }),
      React.createElement(NavigationMenuViewport, {
        "data-slot": "custom-navigation-viewport",
      }),
    ),
  );

  assert.match(html, /data-slot="custom-navigation-root"/);
  assert.match(html, /data-slot="custom-navigation-list"/);
  assert.match(html, /data-slot="custom-navigation-item"/);
  assert.match(html, /data-slot="custom-navigation-trigger"/);
  assert.match(html, /data-slot="custom-navigation-content"/);
  assert.match(html, /data-slot="custom-navigation-link"/);
  assert.match(html, /data-slot="custom-navigation-indicator"/);
  assert.match(html, /data-slot="custom-navigation-viewport"/);
});

test("NavigationMenu primitives support custom render elements", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      {
        defaultValue: "products",
        render: "header",
      },
      React.createElement(
        NavigationMenuList,
        { render: "ol" },
        React.createElement(
          NavigationMenuItem,
          { value: "products", render: "div" },
          React.createElement(NavigationMenuTrigger, null, "Products"),
          React.createElement(
            NavigationMenuContent,
            { render: "section" },
            "Product panel",
          ),
        ),
        React.createElement(
          NavigationMenuItem,
          { value: "docs" },
          React.createElement(
            NavigationMenuLink,
            { href: "/docs", render: "button" },
            "Docs",
          ),
        ),
      ),
      React.createElement(NavigationMenuViewport, { render: "aside" }),
    ),
  );

  assert.match(html, /^<header/);
  assert.match(html, /<ol role="list" data-slot="navigation-menu-list"/);
  assert.match(html, /<div data-slot="navigation-menu-item"/);
  assert.match(html, /<section[^>]+data-slot="navigation-menu-content"/);
  assert.match(html, /<button[^>]+data-slot="navigation-menu-link"/);
  assert.match(html, /<aside[^>]+data-slot="navigation-menu-viewport"/);
});

test("NavigationMenu primitives support asChild element overrides", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      {
        defaultValue: "products",
        asChild: true,
      },
      React.createElement(
        "section",
        { "data-root-child": "true" },
        React.createElement(
          NavigationMenuList,
          { asChild: true },
          React.createElement(
            "ol",
            { "data-list-child": "true" },
            React.createElement(
              NavigationMenuItem,
              { value: "products", asChild: true },
              React.createElement(
                "div",
                { "data-item-child": "true" },
                React.createElement(NavigationMenuTrigger, null, "Products"),
                React.createElement(
                  NavigationMenuContent,
                  { asChild: true },
                  React.createElement(
                    "section",
                    { "data-content-child": "true" },
                    "Product panel",
                  ),
                ),
              ),
            ),
          ),
        ),
        React.createElement(
          NavigationMenuViewport,
          { asChild: true },
          React.createElement("aside", { "data-viewport-child": "true" }),
        ),
      ),
    ),
  );

  assert.match(html, /^<section data-root-child="true" data-slot="navigation-menu"/);
  assert.match(html, /<ol data-list-child="true" role="list" data-slot="navigation-menu-list"/);
  assert.match(html, /<div data-item-child="true" data-slot="navigation-menu-item"/);
  assert.match(html, /<section data-content-child="true"[^>]+data-slot="navigation-menu-content"/);
  assert.match(html, /<aside data-viewport-child="true"[^>]+data-slot="navigation-menu-viewport"/);
  assert.match(html, /Product panel/);
});

test("NavigationMenu exposes trigger geometry helpers for indicator and viewport CSS variables", () => {
  const geometry = getNavigationMenuGeometry({
    rootRect: { left: 100, top: 50, width: 600, height: 80 },
    triggerRect: { left: 220, top: 70, width: 90, height: 32 },
  });

  assert.deepEqual(geometry, {
    left: 120,
    top: 20,
    width: 90,
    height: 32,
    centerX: 165,
    centerY: 36,
  });

  assert.deepEqual(getNavigationMenuGeometryStyle(geometry), {
    "--atom-navigation-menu-trigger-left": "120px",
    "--atom-navigation-menu-trigger-top": "20px",
    "--atom-navigation-menu-trigger-width": "90px",
    "--atom-navigation-menu-trigger-height": "32px",
    "--atom-navigation-menu-trigger-center-x": "165px",
    "--atom-navigation-menu-trigger-center-y": "36px",
  });

  assert.deepEqual(getNavigationMenuViewportSizeStyle(320, 180), {
    "--atom-navigation-menu-viewport-width": "320px",
    "--atom-navigation-menu-viewport-height": "180px",
  });
});

test("NavigationMenuSub creates a nested navigation menu scope", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      { defaultValue: "products" },
      React.createElement(
        NavigationMenuList,
        null,
        React.createElement(
          NavigationMenuItem,
          { value: "products" },
          React.createElement(NavigationMenuTrigger, null, "Products"),
          React.createElement(
            NavigationMenuContent,
            null,
            React.createElement(
              NavigationMenuSub,
              { defaultValue: "templates", className: "navigation-sub-class" },
              React.createElement(
                NavigationMenuList,
                null,
                React.createElement(
                  NavigationMenuItem,
                  { value: "templates" },
                  React.createElement(NavigationMenuTrigger, null, "Templates"),
                  React.createElement(
                    NavigationMenuContent,
                    null,
                    "Template panel",
                  ),
                ),
              ),
              React.createElement(NavigationMenuViewport, null),
            ),
          ),
        ),
      ),
      React.createElement(NavigationMenuViewport, null),
    ),
  );

  assert.match(html, /data-slot="navigation-menu-sub"/);
  assert.match(html, /class="navigation-sub-class"/);
  assert.match(html, /data-slot="navigation-menu-viewport"/);
  assert.match(html, /Template panel/);
});

test("NavigationMenuRoot supports local and provider direction", () => {
  const localHtml = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      { dir: "rtl" },
      React.createElement(NavigationMenuList, null),
    ),
  );
  const providerHtml = renderToStaticMarkup(
    React.createElement(
      Direction.Provider,
      { dir: "rtl" },
      React.createElement(
        NavigationMenuRoot,
        null,
        React.createElement(NavigationMenuList, null),
      ),
    ),
  );

  assert.match(localHtml, /dir="rtl"/);
  assert.match(providerHtml, /dir="rtl"/);
});

test("NavigationMenu trigger keeps aria-controls stable when closed", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavigationMenuRoot,
      null,
      React.createElement(
        NavigationMenuList,
        null,
        React.createElement(
          NavigationMenuItem,
          { value: "products" },
          React.createElement(NavigationMenuTrigger, null, "Products"),
          React.createElement(NavigationMenuContent, null, "Product panel"),
        ),
      ),
    ),
  );

  assert.match(html, /data-slot="navigation-menu-trigger"/);
  assert.match(html, /data-state="closed"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="[^"]+"/);
});

test("NavigationMenu source keeps context and registration stable", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuRoot.tsx", packageRoot),
    "utf8",
  );
  const itemSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuItem.tsx", packageRoot),
    "utf8",
  );
  const triggerSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuTrigger.tsx", packageRoot),
    "utf8",
  );
  const linkSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuLink.tsx", packageRoot),
    "utf8",
  );
  const subSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuSub.tsx", packageRoot),
    "utf8",
  );
  const contentSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuContent.tsx", packageRoot),
    "utf8",
  );
  const viewportSource = await readFile(
    new URL("src/primitives/navigation-menu/NavigationMenuViewport.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /const contextValue: NavigationMenuContextValue = useMemo/);
  assert.match(rootSource, /const contextDir = useDirection\(\)/);
  assert.match(rootSource, /const dir = dirProp \?\? contextDir/);
  assert.match(rootSource, /useCollection<string, HTMLElement, \{ type: NavigationMenuControlType \}>\(\)/);
  assert.match(rootSource, /registerControlItem\(value, element, \{ data: \{ type: "trigger" \} \}\)/);
  assert.match(rootSource, /registerControlItem\(value, element, \{ data: \{ type: "link" \} \}\)/);
  assert.match(rootSource, /getControlItem\(value\)\?\.element \?\? null/);
  assert.match(rootSource, /getControlItem\(value\)\?\.data\.type \?\? null/);
  assert.match(rootSource, /getNextControlItem\(value, direction\)\?\.value \?\? null/);
  assert.match(rootSource, /getFirstControlItem\(\)\?\.value \?\? null/);
  assert.match(rootSource, /getLastControlItem\(\)\?\.value \?\? null/);
  assert.match(rootSource, /const handleBlur: FocusEventHandler<HTMLElement> = useCallback/);
  assert.match(rootSource, /if \(root\.contains\(activeElement\)\) return/);
  assert.doesNotMatch(rootSource, /triggerRegistryRef/);
  assert.doesNotMatch(rootSource, /itemValuesRef/);
  assert.match(subSource, /useCollection<string, HTMLElement, \{ type: NavigationMenuControlType \}>\(\)/);
  assert.match(subSource, /registerControlItem\(value, element, \{ data: \{ type: "trigger" \} \}\)/);
  assert.match(subSource, /registerControlItem\(value, element, \{ data: \{ type: "link" \} \}\)/);
  assert.match(subSource, /getNextControlItem\(value, direction\)\?\.value \?\? null/);
  assert.match(subSource, /const trigger = activeValue === null \? null : getTriggerElement\(activeValue\)/);
  assert.match(subSource, /trigger\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(subSource, /const handleBlur: FocusEventHandler<HTMLDivElement> = useCallback/);
  assert.doesNotMatch(subSource, /triggerRegistryRef/);
  assert.doesNotMatch(subSource, /itemValuesRef/);
  assert.match(rootSource, /\}, delayDuration\)/);
  assert.match(rootSource, /\[delayDuration, handleValueChange\]/);
  assert.match(itemSource, /const \{ registerItem, unregisterItem \} = ctx/);
  assert.match(itemSource, /\}, \[registerItem, unregisterItem, value\]\)/);
  assert.match(triggerSource, /registerTrigger,/);
  assert.match(triggerSource, /unregisterTrigger,/);
  assert.match(triggerSource, /value: activeValue,/);
  assert.match(triggerSource, /\}, \[disabled, registerTrigger, unregisterTrigger, value\]\)/);
  assert.match(triggerSource, /const focusTrigger = useCallback/);
  assert.match(triggerSource, /control\.focus\(\{ preventScroll: true \}\)/);
  assert.match(triggerSource, /onValueChange\(getControlType\(nextValue\) === "trigger" \? nextValue : null\)/);
  assert.match(triggerSource, /if \(orientation === "vertical"\) \{/);
  assert.match(triggerSource, /else if \(dir === "ltr"\)/);
  assert.match(triggerSource, /else if \(dir === "rtl"\)/);
  assert.match(triggerSource, /getNextTriggerValue\(value, dir === "rtl" \? "previous" : "next"\)/);
  assert.match(triggerSource, /getNextTriggerValue\(value, dir === "rtl" \? "next" : "previous"\)/);
  assert.match(triggerSource, /getNextTriggerValue\(value, "next"\)/);
  assert.match(triggerSource, /getNextTriggerValue\(value, "previous"\)/);
  assert.match(triggerSource, /focusTrigger\(getFirstTriggerValue\(\)\)/);
  assert.match(triggerSource, /focusTrigger\(getLastTriggerValue\(\)\)/);
  assert.match(triggerSource, /case "Escape": \{/);
  assert.match(triggerSource, /"aria-controls": contentId/);
  assert.doesNotMatch(triggerSource, /\},\s*\[ctx\]/);
  assert.match(linkSource, /useOptionalNavigationMenuItemContext\(\)/);
  assert.match(linkSource, /registerLink\(value, element\)/);
  assert.match(linkSource, /unregisterLink\(value\)/);
  assert.match(linkSource, /const focusControl = useCallback/);
  assert.match(linkSource, /focusControl\(getNextTriggerValue\(value, dir === "rtl" \? "previous" : "next"\)\)/);
  assert.match(linkSource, /focusControl\(getNextTriggerValue\(value, "next"\)\)/);
  assert.match(linkSource, /onValueChange\(null\)/);
  assert.match(contentSource, /const \{ registerContentNode, unregisterContentNode \} = ctx/);
  assert.match(contentSource, /dataSlot,/);
  assert.match(contentSource, /props: restProps/);
  assert.match(contentSource, /render,/);
  assert.match(contentSource, /asChild,/);
  assert.match(viewportSource, /activeEntry\.asChild/);
  assert.match(viewportSource, /renderElement\(activeEntry\.render, "div"/);
  assert.match(viewportSource, /const handleContentKeyDown = useCallback/);
  assert.match(viewportSource, /activeContent\.querySelectorAll<HTMLElement>\(FOCUSABLE_SELECTOR\)/);
  assert.match(viewportSource, /case "Escape": \{/);
  assert.match(viewportSource, /event\.nativeEvent\.stopImmediatePropagation\(\)/);
  assert.match(viewportSource, /trigger\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(viewportSource, /case "ArrowDown": \{/);
  assert.match(viewportSource, /case "Home": \{/);
  assert.match(contentSource, /\}, \[unregisterContentNode, value\]\)/);
  assert.doesNotMatch(itemSource, /\}, \[ctx, value\]\)/);
  assert.doesNotMatch(triggerSource, /ctx\.registerTrigger\(value, el\)/);
  assert.doesNotMatch(triggerSource, /ctx\.unregisterTrigger\(value\)/);
  assert.doesNotMatch(contentSource, /\}, \[ctx, value\]\)/);
}
);
