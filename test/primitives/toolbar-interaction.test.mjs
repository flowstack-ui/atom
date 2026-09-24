import { test, assert, React } from "../test-utils.mjs";
import { JSDOM } from "jsdom";
import { Toolbar } from "../../dist/toolbar.js";
import { Button } from "../../dist/button.js";
const h = React.createElement;
let createRoot;
async function setup(run) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test', pretendToBeVisual: true });
  const saved = new Map();
  for (const key of ['window','document','Node','Element','HTMLElement','MutationObserver']) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: dom.window[key] });
  }
  const previous = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  // React detects native input-event support when the client renderer loads.
  // Loading before JSDOM selects an obsolete IE fallback and hides focus errors.
  ({ createRoot } = await import("react-dom/client"));
  const errors = [];
  dom.window.addEventListener("error", event => errors.push(event.error));
  const root = createRoot(dom.window.document.getElementById('root'));
  try { await run(root, dom.window); assert.deepEqual(errors, [], "Toolbar must not emit browser errors"); } finally {
    await React.act(async () => root.unmount()); dom.window.close();
    for (const [key, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous;
  }
}
test('Toolbar preserves native names and disabled custom-host activation', async () => setup(async (root, win) => {
  let clicks = 0;
  await React.act(async () => root.render(h(Toolbar.Root, {'aria-label':'Tools'},
    h(Toolbar.Button, {disabled:true,asChild:true,onClick:()=>clicks++},h('div',{onClick:()=>clicks++},'Disabled')))));
  assert.equal(win.document.querySelector('[role=toolbar]').getAttribute('aria-label'),'Tools');
  await React.act(async () => win.document.querySelector('[role=button]').click());
  assert.equal(clicks,0);
}));

test('Toolbar composed Button preserves root disabled and discoverable disabled semantics', async()=>setup(async(root,win)=>{
 let count=0;
 await React.act(async()=>root.render(h(Toolbar.Root,{disabled:true},
  h(Toolbar.Button,{asChild:true},h(Button.Root,{onClick:()=>count++},'Disabled')),
  h(Toolbar.Button,{asChild:true,focusableWhenDisabled:true},h(Button.Root,{onClick:()=>count++},'Discoverable')))));
 const [disabled,discoverable]=win.document.querySelectorAll('button');
 assert.equal(disabled.disabled,true);
 assert.equal(discoverable.disabled,false);
 assert.equal(discoverable.getAttribute('aria-disabled'),'true');
 await React.act(async()=>discoverable.click());
 assert.equal(count,0);
}));
test('Toolbar child click and key cancellation precede toggle mutation', async () => setup(async (root, win) => {
  let changes=0;
  await React.act(async () => root.render(h(Toolbar.Root,null,h(Toolbar.ToggleGroup,{onValueChange:()=>changes++},
    h(Toolbar.ToggleItem,{value:'bold',asChild:true},h('div',{onClick:e=>e.preventDefault(),onKeyDown:e=>e.preventDefault()},'Bold'))))));
  const button=win.document.querySelector('[role=button]');
  await React.act(async () => button.click());
  for(const key of ['Enter',' ']) await React.act(async () => button.dispatchEvent(new win.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true})));
  assert.equal(changes,0);assert.equal(button.getAttribute('aria-pressed'),'false');
}));
test('Toolbar navigates in the owner document and retains native input editing', async () => setup(async (root, win) => {
  const frame=win.document.createElement('iframe');win.document.body.append(frame);
  const host=frame.contentDocument.createElement('div');frame.contentDocument.body.append(host);
  const frameRoot=createRoot(host);
  try {
    await React.act(async () => frameRoot.render(h(Toolbar.Root,null,h(Toolbar.Button,null,'First'),h(Toolbar.Button,null,'Second'),h(Toolbar.Input,{'aria-label':'Search'}))));
    const [first,second]=host.querySelectorAll('button'); const input=host.querySelector('input');
    await React.act(async () => first.focus());
    await React.act(async () => first.dispatchEvent(new frame.contentWindow.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true})));
    assert.equal(frame.contentDocument.activeElement,second);
    await React.act(async () => second.dispatchEvent(new frame.contentWindow.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true})));
    assert.equal(frame.contentDocument.activeElement,input);
    const key=new frame.contentWindow.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true});
    await React.act(async () => input.dispatchEvent(key));assert.equal(key.defaultPrevented,false);
    assert.equal(frame.contentDocument.activeElement,input);
  } finally { await React.act(async () => frameRoot.unmount()); }
}));
test('Toolbar root disabled dominates actions; focusable disabled remains inert', async () => setup(async (root, win) => {
  let count=0;
  await React.act(async () => root.render(h(Toolbar.Root,{disabled:true},
    h(Toolbar.Button,{focusableWhenDisabled:true,onClick:()=>count++},'Discoverable'),
    h(Toolbar.Button,{disabled:false},'Skipped'),h(Toolbar.Link,{href:'/help',onClick:()=>count++},'Help'),h(Toolbar.Input,{'aria-label':'Search'}))));
  const [first,second]=win.document.querySelectorAll('button');
  assert.equal(first.disabled,false);assert.equal(first.tabIndex,0);assert.equal(first.getAttribute('aria-disabled'),'true');assert.equal(second.disabled,true);
  assert.equal(win.document.querySelector('a').hasAttribute('href'),false);assert.equal(win.document.querySelector('input').disabled,true);
  await React.act(async()=>first.click());await React.act(async()=>win.document.querySelector('a').click());assert.equal(count,0);
}));
test('Toolbar grouping and separators forward refs and follow orientation', async () => setup(async (root, win) => {
  const group=React.createRef(),separator=React.createRef(),toggles=React.createRef();
  await React.act(async()=>root.render(h(Toolbar.Root,{orientation:'vertical'},
    h(Toolbar.Group,{ref:group,'aria-label':'Actions'},h(Toolbar.Button,null,'Save')),
    h(Toolbar.Separator,{ref:separator}),h(Toolbar.Separator,{decorative:true}),
    h(Toolbar.ToggleGroup,{ref:toggles,type:'multiple'},h(Toolbar.ToggleItem,{value:'bold'},'Bold')))));
  assert.equal(group.current.getAttribute('role'),'group');assert.equal(toggles.current.getAttribute('role'),'group');
  assert.equal(separator.current.getAttribute('aria-orientation'),'horizontal');
  assert.equal(win.document.querySelector('[role=presentation]').getAttribute('aria-hidden'),'true');
}));

test('Toolbar disabled state can change without changing hook order or losing the entry stop', async () => setup(async (root, win) => {
  const tree = disabled => h(Toolbar.Root, null,
    h(Toolbar.Button, { disabled }, 'First'),
    h(Toolbar.Link, { disabled, href: '/help' }, 'Help'),
    h(Toolbar.ToggleGroup, { disabled }, h(Toolbar.ToggleItem, { disabled, value: 'bold' }, 'Bold')),
    h(Toolbar.Input, { render: h('input', { disabled }), 'aria-label': 'Search' }),
    h(Toolbar.Button, null, 'Last'));
  for (const disabled of [false, true, false]) {
    await React.act(async () => root.render(tree(disabled)));
    const stops = win.document.querySelectorAll('[tabindex="0"]');
    assert.equal(stops.length, 1);
    assert.equal(stops[0].textContent, disabled ? 'Last' : 'First');
    assert.equal(win.document.querySelector('input').disabled, disabled);
  }
}));
