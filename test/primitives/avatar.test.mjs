import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  AvatarContext,
  AvatarFallback,
  AvatarGroupRoot,
  AvatarImage,
  AvatarRoot,
} from "../../dist/index.js";

test("Avatar primitives render fallback when no image source is available", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      AvatarRoot,
      {
        id: "avatar-root",
        title: "Avatar",
        style: { color: "red" },
        "data-testid": "avatar-root",
        className: "avatar-class",
      },
      React.createElement(AvatarFallback, { className: "fallback-class" }, "WD"),
    ),
  );

  assert.match(html, /^<span/);
  assert.match(html, /id="avatar-root"/);
  assert.match(html, /title="Avatar"/);
  assert.match(html, /style="color:red"/);
  assert.match(html, /data-testid="avatar-root"/);
  assert.match(html, /data-slot="avatar-root"/);
  assert.match(html, /class="avatar-class"/);
  assert.match(html, /data-slot="avatar-fallback"/);
  assert.match(html, /class="fallback-class"/);
  assert.match(html, />WD<\/span><\/span>$/);
});

test("AvatarImage renders loaded image with slot metadata", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      AvatarContext.Provider,
      { value: { status: "loaded" } },
      React.createElement(AvatarImage, {
        src: "/avatar.png",
        alt: "Will",
        className: "image-class",
      }),
    ),
  );

  assert.match(html, /<img/);
  assert.match(html, /src="\/avatar.png"/);
  assert.match(html, /alt="Will"/);
  assert.match(html, /data-slot="avatar-image"/);
  assert.match(html, /class="image-class"/);
});

test("Avatar primitives support asChild element merging", () => {
  const rootHtml = renderToStaticMarkup(
    React.createElement(
      AvatarRoot,
      { asChild: true, className: "root-class" },
      React.createElement(
        "figure",
        { className: "figure-class" },
        React.createElement(AvatarFallback, { asChild: true }, React.createElement("strong", null, "WD")),
      ),
    ),
  );

  assert.match(rootHtml, /^<figure/);
  assert.match(rootHtml, /class="figure-class root-class"/);
  assert.match(rootHtml, /data-slot="avatar-root"/);
  assert.match(rootHtml, /<strong data-slot="avatar-fallback">WD<\/strong>/);

  const imageHtml = renderToStaticMarkup(
    React.createElement(
      AvatarContext.Provider,
      { value: { status: "loaded" } },
      React.createElement(
        AvatarImage,
        { asChild: true, src: "/avatar.png", alt: "Will" },
        React.createElement("img", { className: "custom-image" }),
      ),
    ),
  );

  assert.match(imageHtml, /<img/);
  assert.match(imageHtml, /class="custom-image"/);
  assert.match(imageHtml, /src="\/avatar.png"/);
  assert.match(imageHtml, /alt="Will"/);
  assert.match(imageHtml, /data-slot="avatar-image"/);
});

test("AvatarGroupRoot renders an overridable group container", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      AvatarGroupRoot,
      { role: "group", "aria-label": "Team", className: "group-class" },
      React.createElement("span", null, "A"),
    ),
  );

  assert.match(html, /^<div/);
  assert.match(html, /role="group"/);
  assert.match(html, /aria-label="Team"/);
  assert.match(html, /data-slot="avatar-group"/);
  assert.match(html, /class="group-class"/);
  assert.match(html, /<span>A<\/span>/);
});

test("AvatarGroupRoot supports asChild element merging", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      AvatarGroupRoot,
      { asChild: true, className: "group-class" },
      React.createElement("section", { className: "section-class" }, React.createElement("span", null, "A")),
    ),
  );

  assert.match(html, /^<section/);
  assert.match(html, /class="section-class group-class"/);
  assert.match(html, /data-slot="avatar-group"/);
  assert.match(html, /<span>A<\/span>/);
});
