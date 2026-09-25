import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { NativeSelect, NativeSelectRoot, Field } from "../../dist/index.js";
const options = [React.createElement("option", {key:"a",value:"a"}, "Alpha"), React.createElement("option", {key:"b",value:"b",disabled:true}, "Beta")];

test("NativeSelect is one native control with native option selection", () => {
  const html = renderToStaticMarkup(React.createElement(NativeSelect.Root, {name:"region", defaultValue:"b", "aria-label":"Region"}, options));
  assert.equal(NativeSelect.Root, NativeSelectRoot);
  assert.equal((html.match(/<select/g) ?? []).length, 1);
  assert.match(html, /name="region"/);
  assert.match(html, /selected=""/);
  assert.doesNotMatch(html, /role="listbox"|type="hidden"|aria-expanded/);
});

test("NativeSelect inherits Field state and explicit false overrides it", () => {
  const render = (props) => renderToStaticMarkup(React.createElement(Field.Root, {id:"region",required:true,disabled:true,invalid:true}, React.createElement(NativeSelect.Root, props, options)));
  const inherited = render({});
  assert.match(inherited, /id="region-control"/);
  assert.match(inherited, /data-required=""/);
  assert.match(inherited, /data-disabled=""/);
  assert.match(inherited, /aria-invalid="true"/);
  const overridden = render({required:false,disabled:false,invalid:false});
  assert.doesNotMatch(overridden.match(/<select[^>]*>/)[0], /data-required|data-disabled|aria-invalid/);
});

test("NativeSelect preserves multiple native selected values, rows and form", () => {
  const html = renderToStaticMarkup(React.createElement(NativeSelect.Root, {multiple:true,size:4,defaultValue:["a","b"],form:"profile",name:"regions"}, options));
  assert.match(html, /multiple=""/);
  assert.match(html, /size="4"/);
  assert.match(html, /form="profile"/);
  assert.equal((html.match(/selected=""/g) ?? []).length, 2);
});
