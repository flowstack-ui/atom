import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { DownloadTrigger } from "../../dist/download-trigger.js";
import { downloadableBlob, initiateDownload } from "../../dist/_internal/primitives/download-trigger/download.js";
test("DownloadTrigger SSR is inert and defaults to a non-submit button", () => {
  let calls = 0;
  const html = renderToStaticMarkup(React.createElement(DownloadTrigger.Root, {data:()=>{calls++;return "text";},fileName:"note.txt",mimeType:"text/plain"},"Download note"));
  assert.equal(calls,0); assert.match(html,/type="button"/); assert.match(html,/data-state="idle"/);
  assert.doesNotMatch(html,/fileName|mimeType|href=/);
});
test("DownloadTrigger uses the owner's document and releases only its own URL after dispatch",()=>{
 const events=[];let revoke;
 const anchor={download:"",remove(){events.push("removed");},click(){events.push("clicked");}};
 const doc={createElement(tag){assert.equal(tag,"a");return anchor;},body:{appendChild(node){assert.equal(node,anchor);events.push("attached");}},defaultView:{URL:{createObjectURL(){events.push("created");return "blob:owned";},revokeObjectURL(url){assert.equal(url,"blob:owned");events.push("revoked");}},setTimeout(fn,delay){assert.equal(delay,1000);revoke=fn;}}};
 initiateDownload(doc,new Blob(["a"]),"note.txt");
 assert.deepEqual(events,["created","attached","clicked","removed"]);revoke();assert.equal(events.at(-1),"revoked");
 anchor.click=()=>{throw Error("denied");};assert.throws(()=>initiateDownload(doc,new Blob(),"note.txt"),/denied/);revoke();
 assert.equal(events.at(-2),"removed");assert.equal(events.at(-1),"revoked");
 assert.throws(()=>initiateDownload(doc,new Blob()," "),/nonempty/);
});
test("DownloadTrigger preserves text and binary bytes and MIME precedence", async () => {
  assert.equal(await downloadableBlob("Hello 🌍", "text/plain").text(),"Hello 🌍");
  assert.equal(downloadableBlob("", "text/plain").size,0);
  const blob = new Blob([new Uint8Array([0,255,42])],{type:"image/png"});
  assert.equal(downloadableBlob(blob),blob);
  assert.equal(downloadableBlob(blob,"application/octet-stream").type,"application/octet-stream");
  assert.deepEqual([...new Uint8Array(await downloadableBlob(blob).arrayBuffer())],[0,255,42]);
  assert.throws(()=>downloadableBlob("missing type")); assert.throws(()=>downloadableBlob({}));
});
