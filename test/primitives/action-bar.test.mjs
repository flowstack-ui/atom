import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { ActionBar } from "../../dist/action-bar.js";
const h = React.createElement;
test("ActionBar is closed and lazy by default", () => {
  assert.equal(renderToStaticMarkup(h(ActionBar.Root, null, h(ActionBar.Content, {"aria-label":"Files"}, "Actions"))), "");
});
test("ActionBar Positioner is an unstyled native stacking host",()=>{
  const html=renderToStaticMarkup(h(ActionBar.Root,null,h(ActionBar.Positioner,{"data-testid":"host"},"Placement")));
  assert.match(html,/data-slot="action-bar-positioner"/);assert.match(html,/data-testid="host"/);assert.doesNotMatch(html,/style=/);
});
test("ActionBar open content is named, detached and has no dead tab guards", () => {
  const html = renderToStaticMarkup(h(ActionBar.Root, {defaultOpen:true}, h(ActionBar.Content, {"aria-label":"Files"}, h(ActionBar.CloseTrigger, null,"Close"))));
  assert.match(html,/role="dialog"/); assert.match(html,/aria-label="Files"/);
  assert.match(html,/type="button"/); assert.doesNotMatch(html,/popover-viewport|focus-guard|position:|transform:/);
  assert.doesNotMatch(html,/aria-modal="true"/);
});
test("ActionBar retains initially hidden children only when requested", () => {
  const html = renderToStaticMarkup(h(ActionBar.Root, {lazyMount:false,unmountOnExit:false}, h(ActionBar.Content, {"aria-label":"Files"}, "Retained")));
  assert.match(html,/hidden=""/); assert.match(html,/Retained/);
});
test("ActionBar Context reports controlled state without selection machinery", () => {
  const html = renderToStaticMarkup(h(ActionBar.RootProvider, {open:true}, h(ActionBar.Context, null, value => String(value.open))));
  assert.equal(html,"true");
});
