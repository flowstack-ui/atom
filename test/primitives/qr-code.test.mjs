import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { QrCode, encodeQrCode, QrCodeError } from "../../dist/qr-code.js";
import jsQR from "jsqr";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";

test("QR projection preserves SVG geometry, scoped IDs and React cleanup", async () => {
  const dom = new JSDOM('<div id="app"></div>', { pretendToBeVisual: true });
  const saved = { window: globalThis.window, document: globalThis.document, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  let attached = 0, cleaned = 0;
  const ref = node => { if (node) { attached++; return () => cleaned++; } };
  const h = React.createElement;
  const root = createRoot(document.getElementById("app"));
  try {
    await React.act(async () => root.render(h(React.StrictMode, null, h(QrCode.Root, { id: "qr", ids: { frame: "graphic" }, asChild: true },
      h("div", null, h(QrCode.Frame, { asChild: true, ref, titleText: "Example" }, h("svg", { ref, className: "projected" },
        h(QrCode.Pattern, { asChild: true }, h("path", { fill: "purple" })))),
      h(QrCode.Overlay, { ref, asChild: true }, h("div", { ref }, "Logo")))))));
    assert.ok(document.querySelector("#qr #graphic.projected"));
    assert.equal(document.querySelectorAll("svg").length, 1);
    assert.ok(document.querySelector("svg rect[data-slot=qr-code-background]"));
    assert.ok(document.querySelector("svg path").getAttribute("d"));
    assert.equal(document.querySelector("svg path").getAttribute("fill"), "purple");
    assert.ok(document.getElementById("qr-overlay"));
    await React.act(async () => root.unmount());
    assert.ok(attached > 0);
    assert.equal(cleaned, attached);
  } finally { dom.window.close(); Object.assign(globalThis, saved); }
});

test("QR rejects incompatible intrinsic SVG projection", () => {
  assert.throws(() => renderToStaticMarkup(React.createElement(QrCode.Root, null,
    React.createElement(QrCode.Frame, { asChild: true }, React.createElement("div")))), /svg host/);
});

test("QR preserves independent decoded Unicode/text and all ECC levels", () => {
  for (const ecc of ["L", "M", "Q", "H"]) for (const value of ["https://example.com/share", "  hello\n🌎 café 日本語  "]) {
    const qr = encodeQrCode(value, { ecc }); const scale=8, edge=qr.size*scale;
    const rgba=new Uint8ClampedArray(edge*edge*4);
    for(let y=0;y<edge;y++) for(let x=0;x<edge;x++) {
      const i=(y*edge+x)*4, c=qr.data[Math.floor(y/scale)][Math.floor(x/scale)]?0:255;
      rgba[i]=rgba[i+1]=rgba[i+2]=c;rgba[i+3]=255;
    }
    assert.equal(jsQR(rgba,edge,edge)?.data,value);
    assert.equal(qr.size,qr.symbolSize+8);assert.ok(Object.isFrozen(qr.data[0]));
  }
});
test("QR validates bounded options and capacity without exposing payloads", () => {
  for(const encoding of [{border:-1},{border:1.5},{maxVersion:41},{maskPattern:8},{minVersion:5,maxVersion:2},{ecc:"Z"}])
    assert.throws(()=>encodeQrCode("value",encoding),QrCodeError);
  for(const pixel of [0,Infinity,NaN,101]) assert.throws(()=>encodeQrCode("value",{},pixel));
  assert.throws(()=>encodeQrCode("secret".repeat(2000)), e=>e.code==="capacity"&&!e.message.includes("secret"));
  assert.equal(encodeQrCode("",{maskPattern:3,minVersion:3,maxVersion:3}).version,3);
  assert.equal(encodeQrCode("a",{invert:true}).data[0][0],true);
});
test("QR SSR is deterministic, named, inert and has no raw payload attributes", () => {
  let calls=0;
  const tree=React.createElement(QrCode.Root,{value:"https://private.example/token",onEncode:()=>calls++},
    React.createElement(QrCode.Frame,{"aria-label":"Shared document"}),
    React.createElement(QrCode.DownloadTrigger,{fileName:"qr.svg",mimeType:"image/svg+xml"},"Download"));
  const html=renderToStaticMarkup(tree);
  assert.match(html,/role="img"/);assert.match(html,/data-slot="qr-code-pattern"/);
  assert.match(html,/type="button"/); assert.doesNotMatch(html,/private.example|fileName|mimeType/);assert.equal(calls,0);
});
test("QR errors suppress stale patterns and disable export in SSR", () => {
  const html=renderToStaticMarkup(React.createElement(QrCode.Root,{value:"a",encoding:{maxVersion:0}},
    React.createElement(QrCode.Frame,{titleText:"Unavailable"}),
    React.createElement(QrCode.DownloadTrigger,{fileName:"qr.png",mimeType:"image/png"},"Download")));
  assert.match(html,/data-state="error"/);assert.doesNotMatch(html,/qr-code-pattern/);assert.match(html,/disabled/);
});
