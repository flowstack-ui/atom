import { test, assert, React, renderToStaticMarkup } from "../test-utils.mjs";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { useSelection, useSelectionCheckbox } from "../../dist/selection.js";
import { Checkbox } from "../../dist/checkbox.js";

function mount(options = {}, controls = false) {
  const dom = new JSDOM('<div id="app"></div>', { url: 'http://localhost' });
  const old = {};
  for (const key of ['window','document','HTMLElement','Node','MutationObserver']) {
    old[key] = globalThis[key]; globalThis[key] = dom.window[key];
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const root = createRoot(dom.window.document.getElementById('app'));
  let state;
  function Control({ value }) {
    const props = useSelectionCheckbox({ selection: state, value, rangeSelection: true });
    return React.createElement(Checkbox.Root, { ...props, 'aria-label': value });
  }
  function Probe(props) {
    state = useSelection({ orderedKeys: ['a','b','c','d'], ...props });
    return controls ? ['a','b','c','d'].map(value => React.createElement(Control, { key:value, value })) : null;
  }
  const render = (props) => React.act(() => root.render(React.createElement(Probe, props)));
  render(options);
  return {
    get state() { return state; }, dom, render,
    act(fn) { React.act(() => fn(state)); },
    click(value, shiftKey = false) { React.act(() => dom.window.document.querySelector(`[aria-label="${value}"]`).dispatchEvent(new dom.window.MouseEvent('click', { bubbles:true, shiftKey }))); },
    close() { React.act(() => root.unmount()); dom.window.close(); for (const key of Object.keys(old)) { if (old[key] === undefined) delete globalThis[key]; else globalThis[key] = old[key]; } delete globalThis.IS_REACT_ACT_ENVIRONMENT; },
  };
}

test('large scopes retain offscreen IDs and report bounded operation timing', () => {
  const keys=Array.from({length:10000},(_,i)=>String(i));
  const x=mount({orderedKeys:keys,defaultSelectedKeys:['offscreen']});
  try {
    const started=performance.now();
    x.act(s=>s.setScopeSelected(keys,true));
    assert.equal(x.state.selectedKeys.length,10001);
    assert.equal(x.state.getScopeState(keys),'all');
    x.act(s=>s.setScopeSelected(keys,false));
    assert.deepEqual(x.state.selectedKeys,['offscreen']);
    const elapsed=performance.now()-started;
    console.log('10k selection scope select/read/clear ms:',elapsed.toFixed(2));
    assert.ok(elapsed<5000,'coarse regression guard, not a product performance promise');
  } finally {x.close();}
});

test('selection composes rapid commands without mutating caller arrays', () => {
  const input = Object.freeze(['offscreen']); const x = mount({ defaultSelectedKeys: input });
  try {
    x.act(s => { s.toggle('a'); s.toggle('b'); });
    assert.deepEqual(x.state.selectedKeys, ['offscreen','a','b']);
    assert.deepEqual(input, ['offscreen']);
    x.act(s => s.setScopeSelected(['a','b'], false));
    assert.deepEqual(x.state.selectedKeys, ['offscreen']);
  } finally { x.close(); }
});
test('controlled selection proposes but never commits; no-op is silent', () => {
  const calls=[]; const x=mount({ selectedKeys:['a'], onSelectionChange:k=>calls.push(k) });
  try {
    x.act(s=>s.setSelected('a',true)); assert.equal(calls.length,0);
    x.act(s=>s.toggle('b')); assert.deepEqual(calls,[['a','b']]);
    assert.deepEqual(x.state.selectedKeys,['a']);
  } finally { x.close(); }
});
test('scope and range skip disabled IDs and preserve hidden selections', () => {
  const x=mount({ disabledKeys:['b'], defaultSelectedKeys:['hidden'] });
  try {
    assert.equal(x.state.getScopeState([]),'none');
    x.act(s=>s.selectRange('a','d')); assert.deepEqual(x.state.selectedKeys,['hidden','a','c','d']);
    assert.equal(x.state.getScopeState(['a','b','c','d']),'all');
    x.act(s=>s.setSelected('c',false)); assert.equal(x.state.getScopeState(['a','c']),'some');
    x.render({ orderedKeys:['d'] }); assert.deepEqual(x.state.selectedKeys,['hidden','a','d']);
  } finally { x.close(); }
});
test('disabled and read-only prevent collection mutations', () => {
  for (const flag of ['disabled','readOnly']) {
    const calls=[]; const x=mount({ [flag]:true, defaultSelectedKeys:['a'], onSelectionChange:k=>calls.push(k) });
    try { x.act(s=>{s.toggle('b');s.clearSelection();s.setSelection(['c']);}); assert.deepEqual(x.state.selectedKeys,['a']); assert.equal(calls.length,0); }
    finally { x.close(); }
  }
});
test('single selection replaces, invalid multi-key scopes reject', () => {
  const x=mount({ mode:'single', defaultSelectedKeys:['a'] });
  try { x.act(s=>s.toggle('b')); assert.deepEqual(x.state.selectedKeys,['b']); assert.throws(()=>x.state.setScopeSelected(['a','b'],true), /Single/); }
  finally { x.close(); }
});
test('read-only binding preserves disabled and unavailable key states', () => {
  const x = mount({readOnly:true, disabledKeys:['b'], orderedKeys:['a','b','c']}, true);
  try {
    const input = key => x.dom.window.document.querySelector(`[aria-label="${key}"]`);
    assert.equal(input('a').disabled, false);
    assert.equal(input('b').disabled, true);
    assert.equal(input('d').disabled, true);
    x.click('a');
    assert.deepEqual(x.state.selectedKeys, []);
    x.render({readOnly:true, disabled:true});
    assert.equal(input('a').disabled, true);
  } finally { x.close(); }
});
test('invalid IDs and contradictory mode fail in SSR without effects', () => {
  function Probe(props) { useSelection(props); return null; }
  for (const props of [{orderedKeys:['a','a']},{orderedKeys:['']},{orderedKeys:['a'],mode:'single',selectedKeys:['a','b']}]) {
    assert.throws(()=>renderToStaticMarkup(React.createElement(Probe,props)),TypeError);
  }
});
test('Checkbox binding shares range anchor and resets it on order change', () => {
  const x=mount({},true);
  try {
    x.click('a'); x.click('c',true); assert.deepEqual(x.state.selectedKeys,['a','b','c']);
    x.render({orderedKeys:['d','c','b','a']});
    x.click('d',true); assert.deepEqual(x.state.selectedKeys,['a','b','c','d']);
    x.act(s=>s.clearSelection());
    x.click('b');
    React.act(()=>x.dom.window.document.querySelector('[aria-label="d"]').dispatchEvent(new x.dom.window.KeyboardEvent('keydown',{key:' ',shiftKey:true,bubbles:true,cancelable:true})));
    assert.deepEqual(x.state.selectedKeys,['b','d','c']);
  } finally { x.close(); }
});
