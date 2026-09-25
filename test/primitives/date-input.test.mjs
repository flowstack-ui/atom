import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { DateInput } from "../../dist/date-input.js";
import { parseDate } from "../../dist/date-value.js";
test("DateInput renders named segments and canonical form value", () => {
  const date=parseDate("2026-09-05");
  const html=renderToStaticMarkup(React.createElement(DateInput.Root,{referenceDate:date,defaultValue:date,name:"birthday"},
    React.createElement(DateInput.Label,null,"Birthday"),
    React.createElement(DateInput.SegmentGroup,null,React.createElement(DateInput.Segments)),
    React.createElement(DateInput.HiddenInput)));
  assert.match(html,/role="spinbutton"/); assert.match(html,/name="birthday"/); assert.match(html,/value="2026-09-05"/);
  assert.doesNotMatch(html,/referenceDate=/);
});
test("DateInput range names do not change with the count of selected endpoints", () => {
  const date=parseDate("2026-09-05");
  const html=renderToStaticMarkup(React.createElement(DateInput.Root,{referenceDate:date,selectionMode:"range",defaultValue:{start:date,end:null},name:"trip"},
    React.createElement(DateInput.HiddenInput),React.createElement(DateInput.HiddenInput,{index:1})));
  assert.match(html,/name="trip\[start\]"/);assert.match(html,/name="trip\[end\]"/);
});
