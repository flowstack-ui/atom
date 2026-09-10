import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { QrCode, encodeQrCode, QrCodeError } from "../../dist/qr-code.js";
import jsQR from "jsqr";

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
