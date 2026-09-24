import { test, assert, React, renderToStaticMarkup } from "../test-utils.mjs";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { ActionDelegate } from "../../dist/action-delegate.js";

test('iframe targets use ownerDocument and both host refs clean up', () => {
  const dom=new JSDOM('<button id="go">Outer</button><iframe></iframe>',{url:'http://localhost'});
  const oldWindow=globalThis.window,oldDocument=globalThis.document;
  globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const doc=document.querySelector('iframe').contentDocument;
  const root=createRoot(doc.body);
  const owner=React.createRef(), child=React.createRef();
  let opened=0;
  try {
    React.act(()=>root.render(React.createElement(ActionDelegate,{targetId:'go',ref:owner},React.createElement('article',{ref:child},React.createElement('span',{id:'space'},'Space'),React.createElement('button',{id:'go',onClick:()=>opened++},'Open')))));
    assert.equal(owner.current,doc.querySelector('article'));
    assert.equal(child.current,owner.current);
    React.act(()=>doc.getElementById('space').dispatchEvent(new doc.defaultView.MouseEvent('click',{bubbles:true,cancelable:true})));
    assert.equal(opened,1);
    React.act(()=>root.unmount());
    assert.equal(owner.current,null);assert.equal(child.current,null);
  } finally { dom.window.close();globalThis.window=oldWindow;globalThis.document=oldDocument;delete globalThis.IS_REACT_ACT_ENVIRONMENT; }
});

test('delegation retains native host semantics and no extra tab stop', () => {
  const html=renderToStaticMarkup(React.createElement(ActionDelegate,{targetId:'go'},React.createElement('li',null,React.createElement('button',{id:'go'},'Open'))));
  assert.match(html, /^<li data-action-delegate/);
  assert.doesNotMatch(html, /role=|tabindex=/);
  assert.throws(()=>renderToStaticMarkup(React.createElement(ActionDelegate,{targetId:'go'},React.createElement(React.Fragment,null,'bad'))), /non-Fragment/);
});

test('delegate clicks once and isolates descendants, cancellation and modifiers', () => {
  const dom=new JSDOM('<div id="app"></div>',{url:'http://localhost'});
  const oldWindow=globalThis.window, oldDocument=globalThis.document;
  globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const root=createRoot(document.getElementById('app'));
  let opened=0, secondary=0;
  function render(disabled=false, cancelled=false) {
    React.act(()=>root.render(React.createElement(ActionDelegate,{targetId:'go',disabled},
      React.createElement('div',{id:'host',onClick:e=>{if(cancelled)e.preventDefault();}},
        React.createElement('span',{id:'space'},'Record'),
        React.createElement('button',{id:'go',onClick:()=>opened++},'Open'),
        React.createElement('button',{id:'other',onClick:()=>secondary++},'Other'),
        React.createElement('div',{'data-action-delegate-ignore':'',id:'ignore'},'Custom')))));
  }
  const click=(id,props={})=>React.act(()=>document.getElementById(id).dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true,cancelable:true,...props})));
  try {
    render(); click('space'); assert.equal(opened,1);
    click('go');assert.equal(opened,2);
    click('other');assert.equal(secondary,1);assert.equal(opened,2);
    click('ignore');assert.equal(opened,2);
    for(const props of [{shiftKey:true},{ctrlKey:true},{metaKey:true},{altKey:true},{button:1}])click('space',props);
    assert.equal(opened,2);
    render(true);click('space');assert.equal(opened,2);
    render(false,true);click('space');assert.equal(opened,2);
    render(); document.getElementById('go').disabled=true;click('space');assert.equal(opened,2);
    document.getElementById('go').disabled=false;
    const range=document.createRange();range.selectNodeContents(document.getElementById('space'));document.getSelection().addRange(range);
    click('space');assert.equal(opened,2);
  } finally {
    React.act(()=>root.unmount());dom.window.close();globalThis.window=oldWindow;globalThis.document=oldDocument;delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});
