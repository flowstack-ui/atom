import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  Button,
  ButtonRoot,
} from "../../dist/index.js";

test("ButtonRoot renders native button semantics by default", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        loading: true,
        "aria-label": "Save changes",
        className: "button-class",
        "data-testid": "save-button",
      },
      "Save",
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /type="button"/);
  assert.doesNotMatch(html, /disabled=""/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /aria-label="Save changes"/);
  assert.match(html, /class="button-class"/);
  assert.match(html, /data-testid="save-button"/);
  assert.match(html, /data-slot="button"/);
  assert.match(html, /data-loading=""/);
  assert.equal(Button.Root, ButtonRoot);
});

test("ButtonRoot disables native buttons only for disabled state", () => {
  const html = renderToStaticMarkup(
    React.createElement(Button.Root, { disabled: true }, "Save"),
  );

  assert.match(html, /^<button/);
  assert.match(html, /disabled=""/);
  assert.match(html, /data-disabled=""/);
});

test("ButtonRoot renders safe anchor semantics for links", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        href: "https://example.com",
        target: "_blank",
        rel: "nofollow",
      },
      "External",
    ),
  );
  const disabledHtml = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        href: "/disabled",
        disabled: true,
      },
      "Disabled link",
    ),
  );

  assert.match(html, /^<a/);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="nofollow noopener noreferrer"/);
  assert.match(html, /data-slot="button"/);
  assert.doesNotMatch(html, /role="button"/);
  assert.doesNotMatch(html, /tabindex=/);
  assert.match(disabledHtml, /^<a/);
  assert.doesNotMatch(disabledHtml, /href="\/disabled"/);
  assert.match(disabledHtml, /role="link"/);
  assert.match(disabledHtml, /tabindex="0"/);
  assert.match(disabledHtml, /aria-disabled="true"/);
  assert.match(disabledHtml, /data-disabled=""/);
});

test("ButtonRoot preserves composed anchor and permissive link-adapter semantics", () => {
  function LinkAdapter(props) {
    return React.createElement("a", props);
  }

  const asChildHtml = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      { asChild: true, title: "Go now" },
      React.createElement("a", { href: "/go" }, "Go"),
    ),
  );
  const renderAnchorHtml = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      { render: React.createElement("a", { href: "/render" }) },
      "Render link",
    ),
  );
  const routerHtml = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        asChild: true,
        "data-testid": "link-adapter",
      },
      React.createElement(
        LinkAdapter,
        { href: "/adapter", target: "_blank", rel: "external" },
        "Adapter link",
      ),
    ),
  );
  const renderCallbackHtml = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        href: "/callback",
        render: (props) => React.createElement("a", props),
      },
      "Callback link",
    ),
  );

  for (const html of [asChildHtml, renderAnchorHtml, routerHtml, renderCallbackHtml]) {
    assert.match(html, /^<a/);
    assert.doesNotMatch(html, /role="button"/);
    assert.doesNotMatch(html, /tabindex=/);
  }
  assert.match(asChildHtml, /href="\/go"/);
  assert.match(asChildHtml, /title="Go now"/);
  assert.match(renderAnchorHtml, /href="\/render"/);
  assert.match(routerHtml, /href="\/adapter"/);
  assert.match(routerHtml, /target="_blank"/);
  assert.match(routerHtml, /rel="external noopener noreferrer"/);
  assert.match(routerHtml, /data-testid="link-adapter"/);
  assert.match(renderCallbackHtml, /href="\/callback"/);
});

test("ButtonRoot removes navigation from inactive composed links", () => {
  function LinkAdapter(props) {
    return React.createElement("a", props);
  }

  const disabledHtml = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      { asChild: true, disabled: true },
      React.createElement(
        "a",
        { href: "/disabled", target: "_blank", rel: "nofollow" },
        "Disabled",
      ),
    ),
  );
  const loadingHtml = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        loading: true,
        render: React.createElement(LinkAdapter, { href: "/loading" }),
      },
      "Loading",
    ),
  );

  for (const html of [disabledHtml, loadingHtml]) {
    assert.match(html, /^<a/);
    assert.doesNotMatch(html, /href=/);
    assert.doesNotMatch(html, /target=/);
    assert.doesNotMatch(html, /rel=/);
    assert.match(html, /role="link"/);
    assert.match(html, /tabindex="0"/);
    assert.match(html, /aria-disabled="true"/);
    assert.doesNotMatch(html, /role="button"/);
  }
  assert.match(disabledHtml, /data-disabled=""/);
  assert.match(loadingHtml, /aria-busy="true"/);
  assert.match(loadingHtml, /data-loading=""/);
});

test("ButtonRoot supports strict router links through an inactive-safe render adapter", () => {
  let strictRenderCount = 0;

  function StrictRouterLink({ href, ...props }) {
    if (typeof href !== "string") {
      throw new Error(`href must be a string, received ${String(href)}`);
    }
    strictRenderCount += 1;
    return React.createElement("a", { ...props, href });
  }

  function createStrictRouterAdapter(destination) {
    return function renderStrictRouterLink(props) {
      const { href: _inactiveHref, ...linkProps } = props;
      if (linkProps["aria-disabled"]) {
        return React.createElement("a", linkProps);
      }
      return React.createElement(StrictRouterLink, {
        ...linkProps,
        href: destination,
      });
    };
  }

  const render = createStrictRouterAdapter("/strict");
  const activeHtml = renderToStaticMarkup(
    React.createElement(Button.Root, { href: "/strict", render }, "Strict"),
  );
  const disabledHtml = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      { href: "/strict", render, disabled: true },
      "Disabled strict",
    ),
  );
  const loadingHtml = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      { href: "/strict", render, loading: true },
      "Loading strict",
    ),
  );

  assert.equal(strictRenderCount, 1);
  assert.match(activeHtml, /href="\/strict"/);
  for (const html of [disabledHtml, loadingHtml]) {
    assert.doesNotMatch(html, /href=/);
    assert.match(html, /role="link"/);
    assert.match(html, /aria-disabled="true"/);
  }
});

test("ButtonRoot preserves composed link refs, events, and native keyboard behavior", () => {
  let receivedProps;
  const calls = [];
  const childRef = { current: null };
  const buttonRef = { current: null };

  function RouterLink(props) {
    receivedProps = props;
    const { ref: _ref, ...anchorProps } = props;
    return React.createElement("a", anchorProps);
  }

  renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        asChild: true,
        ref: buttonRef,
        id: "composed-link",
        onClick: () => calls.push("button-click"),
        onPress: () => calls.push("press"),
        onKeyDown: () => calls.push("button-keydown"),
      },
      React.createElement(
        RouterLink,
        {
          href: "/go",
          ref: childRef,
          onClick: () => calls.push("child-click"),
          onKeyDown: () => calls.push("child-keydown"),
        },
        "Go",
      ),
    ),
  );

  const node = { tagName: "A" };
  receivedProps.ref(node);
  assert.equal(buttonRef.current, node);
  assert.equal(childRef.current, node);
  assert.equal(receivedProps.href, "/go");
  assert.equal(receivedProps.id, "composed-link");

  const currentTarget = {
    tagName: "A",
    clickCount: 0,
    click() {
      this.clickCount += 1;
    },
    hasAttribute(name) {
      return name === "href";
    },
  };
  const clickEvent = {
    currentTarget,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
  receivedProps.onClick(clickEvent);
  assert.deepEqual(calls, ["button-click", "press", "child-click"]);

  for (const key of ["Enter", " "]) {
    const keyEvent = {
      ...clickEvent,
      key,
      defaultPrevented: false,
    };
    receivedProps.onKeyDown(keyEvent);
    assert.equal(keyEvent.defaultPrevented, false);
  }
  assert.equal(currentTarget.clickCount, 0);
  assert.deepEqual(calls.slice(3), [
    "button-keydown",
    "child-keydown",
    "button-keydown",
    "child-keydown",
  ]);
});

test("ButtonRoot blocks inactive composed link clicks and activation keys", () => {
  let receivedProps;
  const calls = [];

  function RouterLink(props) {
    receivedProps = props;
    return React.createElement("a", props);
  }

  renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        asChild: true,
        loading: true,
        onClick: () => calls.push("button-click"),
        onPress: () => calls.push("press"),
        onKeyDown: () => calls.push("button-keydown"),
      },
      React.createElement(
        RouterLink,
        {
          href: "/loading",
          onClick: () => calls.push("child-click"),
          onKeyDown: () => calls.push("child-keydown"),
        },
        "Loading",
      ),
    ),
  );

  const event = {
    key: "Enter",
    currentTarget: {
      tagName: "A",
      click: () => calls.push("native-click"),
      hasAttribute: () => false,
    },
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };

  assert.equal(receivedProps.href, null);
  receivedProps.onClick(event);
  assert.equal(event.defaultPrevented, true);
  assert.deepEqual(calls, []);

  event.defaultPrevented = false;
  receivedProps.onKeyDown(event);
  assert.equal(event.defaultPrevented, true);
  assert.deepEqual(calls, []);
});

test("ButtonRoot keeps composed click merging when Button onClick cancels onPress", () => {
  let receivedProps;
  const calls = [];

  function RouterLink(props) {
    receivedProps = props;
    return React.createElement("a", props);
  }

  renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        asChild: true,
        onClick: (event) => {
          calls.push("button-click");
          event.preventDefault();
        },
        onPress: () => calls.push("press"),
      },
      React.createElement(
        RouterLink,
        { href: "/go", onClick: () => calls.push("child-click") },
        "Go",
      ),
    ),
  );

  const event = {
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
  receivedProps.onClick(event);

  assert.deepEqual(calls, ["button-click", "child-click"]);
  assert.equal(event.defaultPrevented, true);
});

test("ButtonRoot adds button semantics to custom non-native renders", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        render: "div",
        "data-testid": "custom-button",
      },
      "Custom",
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-testid="custom-button"/);
  assert.match(html, />Custom<\/div>/);
});

test("ButtonRoot adds button semantics to custom asChild elements", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        asChild: true,
        "data-testid": "custom-child-button",
      },
      React.createElement("span", null, "Custom child"),
    ),
  );

  assert.match(html, /^<span/);
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /data-testid="custom-child-button"/);
  assert.match(html, /data-slot="button"/);
  assert.match(html, />Custom child<\/span>/);
});

test("ButtonRoot preserves native asChild button semantics", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        asChild: true,
        disabled: true,
      },
      React.createElement("button", null, "Native child"),
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /type="button"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /data-disabled=""/);
  assert.doesNotMatch(html, /role="button"/);
  assert.doesNotMatch(html, /aria-disabled="true"/);
});

test("ButtonRoot preserves native render element tabIndex", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Button.Root,
      {
        render: React.createElement("button", { tabIndex: -1 }),
      },
      "Composite item",
    ),
  );

  assert.match(html, /^<button/);
  assert.match(html, /tabindex="-1"/);
  assert.doesNotMatch(html, /role="button"/);
});

test("ButtonRoot source guards inactive state before consumer handlers", async () => {
  const source = await readFile(
    new URL("src/primitives/button/ButtonRoot.tsx", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(source, /composeEventHandlers\(onClick, handleClick\)/);
  assert.match(source, /childHasNativeButtonSemantics/);
  assert.match(source, /const hasLinkSemantics = href !== undefined \|\| hasComposedHref/);
  assert.match(source, /\? \{ href: null, target: null, rel: null \}/);
  assert.match(source, /disabled: disabled \|\| undefined/);
  assert.match(source, /renderHasNativeButtonSemantics/);
  assert.match(source, /if \(isInactive\) \{\s*event\.preventDefault\(\);\s*return;\s*\}\s*onClick\?\.\(event\);/);
  assert.match(source, /if \(isInactive\) \{\s*event\.preventDefault\(\);\s*return;\s*\}\s*onKeyDown\?\.\(event\);/);
});
