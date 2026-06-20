import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Dialog,
  List,
  NavList,
  NavListItem,
  NavListLink,
  NavListList,
  NavListRoot,
  NavListSection,
  NavListSectionContent,
  NavListSectionLabel,
  NavListSectionTrigger,
} from "../../dist/index.js";

test("NavList compound parts render native navigation anatomy", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      NavList.Root,
      { "aria-label": "Documentation", orientation: "horizontal" },
      React.createElement(
        NavList.List,
        null,
        React.createElement(
          NavList.Item,
          null,
          React.createElement(NavList.Link, { href: "/docs", active: true }, "Docs"),
        ),
        React.createElement(
          NavList.Item,
          null,
          React.createElement(NavList.Link, { href: "/blog", disabled: true }, "Blog"),
        ),
        React.createElement(
          NavList.Item,
          { disabled: true },
          React.createElement(NavList.Link, { href: "/not-current", "aria-current": false }, "Not current"),
        ),
      ),
    ),
  );

  assert.match(html, /^<nav/);
  assert.match(html, /aria-label="Documentation"/);
  assert.match(html, /data-slot="nav-list"/);
  assert.match(html, /data-orientation="horizontal"/);
  assert.match(html, /<ul data-slot="nav-list-list" data-orientation="horizontal">/);
  assert.match(html, /<li data-slot="nav-list-item" data-orientation="horizontal">/);
  assert.match(html, /href="\/docs"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /data-active=""/);
  assert.match(html, /data-current=""/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /tabindex="-1"/);
  assert.doesNotMatch(html, /href="\/blog"/);
  assert.match(html, /<li data-slot="nav-list-item" data-orientation="horizontal" data-disabled="">/);
  assert.doesNotMatch(html, /<li[^>]+aria-disabled/);
  assert.match(html, /aria-current="false"/);
  assert.equal(NavList.Root, NavListRoot);
  assert.equal(NavList.List, NavListList);
  assert.equal(NavList.Item, NavListItem);
  assert.equal(NavList.Link, NavListLink);
});

test("NavList sections expose collapsible trigger and content wiring", () => {
  const openHtml = renderToStaticMarkup(
    React.createElement(
      NavListRoot,
      { "aria-label": "Docs" },
      React.createElement(
        NavListSection,
        { collapsible: true, defaultOpen: true },
        React.createElement(NavListSectionTrigger, null, "Feedback"),
        React.createElement(
          NavListSectionContent,
          null,
          React.createElement(
            NavListList,
            null,
            React.createElement(
              NavListItem,
              null,
              React.createElement(NavListLink, { href: "/feedback#dialog" }, "Dialog"),
            ),
          ),
        ),
      ),
    ),
  );
  const closedHtml = renderToStaticMarkup(
    React.createElement(
      NavListRoot,
      { "aria-label": "Docs" },
      React.createElement(
        NavListSection,
        { collapsible: true, defaultOpen: false },
        React.createElement(NavListSectionLabel, { as: "h3" }, "Feedback"),
        React.createElement(NavListSectionTrigger, null, "Toggle feedback"),
        React.createElement(NavListSectionContent, null, "Hidden feedback links"),
      ),
    ),
  );
  const forceMountedHtml = renderToStaticMarkup(
    React.createElement(
      NavListRoot,
      { "aria-label": "Docs" },
      React.createElement(
        NavListSection,
        { collapsible: true, defaultOpen: false },
        React.createElement(NavListSectionTrigger, null, "Toggle feedback"),
        React.createElement(NavListSectionContent, { forceMount: true }, "Hidden feedback links"),
      ),
    ),
  );
  const buttonTriggerHtml = renderToStaticMarkup(
    React.createElement(
      NavListRoot,
      { "aria-label": "Docs" },
      React.createElement(
        NavListSection,
        { collapsible: true },
        React.createElement(
          NavListSectionTrigger,
          { asChild: true },
          React.createElement("button", null, "Native button child"),
        ),
        React.createElement(NavListSectionContent, null, "Links"),
      ),
    ),
  );

  assert.match(openHtml, /data-slot="nav-list-section"/);
  assert.match(openHtml, /data-state="open"/);
  assert.match(openHtml, /data-collapsible=""/);
  assert.match(openHtml, /data-slot="nav-list-section-trigger"/);
  assert.match(openHtml, /aria-expanded="true"/);
  assert.match(openHtml, /aria-controls="[^"]+-content"/);
  assert.match(openHtml, /data-slot="nav-list-section-content"/);
  assert.match(openHtml, /aria-labelledby="[^"]+-trigger"/);
  assert.doesNotMatch(closedHtml, /Hidden feedback links/);
  assert.match(closedHtml, /<h3 id="[^"]+-label" data-slot="nav-list-section-label"/);
  assert.match(forceMountedHtml, /hidden=""/);
  assert.match(buttonTriggerHtml, /<button type="button" id="[^"]+-trigger"/);
  assert.doesNotMatch(buttonTriggerHtml, /role="button"/);
  assert.equal(NavList.Section, NavListSection);
  assert.equal(NavList.SectionLabel, NavListSectionLabel);
  assert.equal(NavList.SectionTrigger, NavListSectionTrigger);
  assert.equal(NavList.SectionContent, NavListSectionContent);
});

test("NavList source keeps native link navigation separate from tree/menu behavior", async () => {
  const rootSource = await readFile(
    new URL("src/primitives/nav-list/NavListRoot.tsx", packageRoot),
    "utf8",
  );
  const linkSource = await readFile(
    new URL("src/primitives/nav-list/NavListLink.tsx", packageRoot),
    "utf8",
  );
  const triggerSource = await readFile(
    new URL("src/primitives/nav-list/NavListSectionTrigger.tsx", packageRoot),
    "utf8",
  );
  const sectionSource = await readFile(
    new URL("src/primitives/nav-list/NavListSection.tsx", packageRoot),
    "utf8",
  );
  const labelSource = await readFile(
    new URL("src/primitives/nav-list/NavListSectionLabel.tsx", packageRoot),
    "utf8",
  );
  const contentSource = await readFile(
    new URL("src/primitives/nav-list/NavListSectionContent.tsx", packageRoot),
    "utf8",
  );

  assert.match(rootSource, /renderElement\(render, "nav"/);
  assert.match(linkSource, /renderElement\(render, "a"/);
  assert.match(linkSource, /"aria-current": resolvedAriaCurrent \?\? undefined/);
  assert.match(triggerSource, /renderElement\(render, "button"/);
  assert.match(sectionSource, /labelId/);
  assert.match(labelSource, /registerLabel\(\)/);
  assert.match(contentSource, /hasLabel \? labelId : collapsible \? triggerId : undefined/);
  assert.match(triggerSource, /childHasNativeButtonSemantics\(children\)/);
  assert.doesNotMatch(rootSource + linkSource + triggerSource + contentSource, /role: "tree"/);
  assert.doesNotMatch(rootSource + linkSource + triggerSource + contentSource, /aria-activedescendant/);
});
