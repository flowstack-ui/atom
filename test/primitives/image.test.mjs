import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { Image, ImageContent, ImageContext, ImageFallback, ImageRoot } from "../../dist/index.js";
import { Image as ImageSubpath } from "../../dist/image.js";

test("Image exports one namespace from root and subpath", () => {
  assert.equal(Image.Root, ImageRoot);
  assert.equal(ImageSubpath.Root, ImageRoot);
  assert.equal(Image.Content, ImageContent);
  assert.equal(Image.Fallback, ImageFallback);
});

test("Image Root exposes loading state and default fallback during SSR", () => {
  const html = renderToStaticMarkup(React.createElement(ImageRoot, { src: "/media.jpg", id: "media", className: "root" },
    React.createElement(ImageContent, { alt: "Workspace", width: 800, height: 450 }),
    React.createElement(ImageFallback, null, "Loading media"),
  ));
  assert.match(html, /^<div/);
  assert.match(html, /data-slot="image"/);
  assert.match(html, /data-state="loading"/);
  assert.match(html, /data-slot="image-fallback"/);
  assert.match(html, /data-state="loading"/);
  assert.doesNotMatch(html, /<img/);
});

test("Image Content forwards native image props only when loaded", () => {
  const html = renderToStaticMarkup(React.createElement(ImageContext.Provider, { value: { src: "/media.jpg", status: "loaded" } },
    React.createElement(ImageContent, { alt: "Workspace", width: 800, height: 450, loading: "lazy", decoding: "async", srcSet: "/media-2x.jpg 2x", sizes: "50vw", className: "content" }),
  ));
  assert.match(html, /^<img/);
  assert.match(html, /src="\/media.jpg"/);
  assert.match(html, /alt="Workspace"/);
  assert.match(html, /width="800"/);
  assert.match(html, /height="450"/);
  assert.match(html, /srcSet="\/media-2x.jpg 2x"/);
  assert.match(html, /data-slot="image-content"/);
  assert.match(html, /data-state="loaded"/);
});

test("Image Fallback selects idle, loading, and error states explicitly", () => {
  for (const status of ["idle", "loading", "error"]) {
    const html = renderToStaticMarkup(React.createElement(ImageContext.Provider, { value: { status } }, React.createElement(ImageFallback, null, status)));
    assert.match(html, new RegExp(`data-state="${status}"`));
  }
  const hidden = renderToStaticMarkup(React.createElement(ImageContext.Provider, { value: { status: "loading" } }, React.createElement(ImageFallback, { when: "error" }, "Error")));
  assert.equal(hidden, "");
});

test("Image parts support composed hosts and authoritative state", () => {
  const root = renderToStaticMarkup(React.createElement(ImageRoot, { asChild: true }, React.createElement("figure", { className: "frame" }, React.createElement(ImageFallback, { asChild: true }, React.createElement("span", null, "Empty")))));
  assert.match(root, /^<figure/);
  assert.match(root, /data-slot="image"/);
  assert.match(root, /<span data-slot="image-fallback" data-state="idle">Empty<\/span>/);
  const content = renderToStaticMarkup(React.createElement(ImageContext.Provider, { value: { src: "/media.jpg", status: "loaded" } }, React.createElement(ImageContent, { asChild: true, alt: "Media" }, React.createElement("img", { className: "custom" }))));
  assert.match(content, /class="custom"/);
  assert.match(content, /src="\/media.jpg"/);
  assert.match(content, /alt="Media"/);
});

test("Image parts reject use outside Root", () => {
  assert.throws(() => renderToStaticMarkup(React.createElement(ImageFallback, null, "Nope")), /within Image.Root/);
});
