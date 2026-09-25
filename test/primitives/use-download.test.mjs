import { JSDOM } from "jsdom";
import { assert, test, React } from "../test-utils.mjs";
import { useDownload } from "../../dist/download-trigger.js";

test("useDownload shares busy, duplicate, cancel, error and owner-document lifecycle", async () => {
 const dom=new JSDOM('<div id="app"></div>');
 const names=['window','document','navigator','IS_REACT_ACT_ENVIRONMENT'];
 const previous=Object.fromEntries(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 for(const n of names) Object.defineProperty(globalThis,n,{configurable:true,value:n==='IS_REACT_ACT_ENVIRONMENT'?true:dom.window[n]});
 const {createRoot}=await import('react-dom/client');
 const root=createRoot(document.getElementById('app'));
 let api,resolve,signal,calls=0,downloads=0,errors=0;
 const producer=({signal:s})=>{calls++;signal=s;return new Promise(r=>resolve=r)};
 const doc={createElement:()=>({download:'',click(){downloads++},remove(){}}),body:{appendChild(){}},defaultView:{URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout(fn){fn()}}};
 function Probe(props){api=useDownload({data:producer,fileName:'a.txt',mimeType:'text/plain',onDownloadError:()=>errors++,...props});return null}
 const render=props=>React.act(async()=>root.render(React.createElement(Probe,props)));
 try{
  await render();assert.equal(calls,0);
  await React.act(async()=>{api.download(doc);api.download(doc)});assert.equal(calls,1);assert.equal(api.loading,true);
  await React.act(async()=>api.cancel());assert.equal(signal.aborted,true);
  await React.act(async()=>resolve('late'));assert.equal(downloads,0);assert.equal(api.loading,false);
  await React.act(async()=>api.download(doc));await React.act(async()=>resolve('ok'));assert.equal(downloads,1);
  await render({data:()=>{throw Error('failed')}});await React.act(async()=>api.download(doc));assert.equal(errors,1);assert.equal(api.state,'error');
  await render();await React.act(async()=>api.download(doc));await render({disabled:true});assert.equal(signal.aborted,true);
  await React.act(async()=>resolve('disabled'));assert.equal(downloads,1);
  await render();await React.act(async()=>api.download(doc));await React.act(async()=>root.unmount());assert.equal(signal.aborted,true);
  await React.act(async()=>resolve('unmounted'));assert.equal(downloads,1);
 }finally{dom.window.close();for(const n of names){if(previous[n])Object.defineProperty(globalThis,n,previous[n]);else delete globalThis[n]}}
});
