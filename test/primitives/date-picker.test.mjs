import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { DatePicker } from "../../dist/date-picker.js";
import { parseDate } from "../../dist/date-value.js";
test("DatePicker shares a value with segmented entry without rendering a closed popup", () => {
  const date=parseDate("2026-09-05");
  const html=renderToStaticMarkup(React.createElement(DatePicker.Root,{referenceDate:date,defaultValue:date},
    React.createElement(DatePicker.Control,null,React.createElement(DatePicker.Input,{"aria-label":"Date"}),React.createElement(DatePicker.Trigger,null,"Choose date"))));
  assert.match(html,/aria-haspopup="dialog"/);assert.match(html,/aria-expanded="false"/);
  assert.match(html,/role="spinbutton"/);assert.doesNotMatch(html,/role="dialog"/);
});

test("DatePicker preserves native attributes without leaking behavior props", () => {
  const date = parseDate("2026-09-05");
  const html = renderToStaticMarkup(React.createElement(DatePicker.Root, {
    referenceDate: date, "data-prop-check": "native", title: "Appointment", closeOnSelect: false,
  }));
  assert.match(html, /data-prop-check="native"/);
  assert.match(html, /title="Appointment"/);
  assert.doesNotMatch(html, /referenceDate|closeOnSelect/);
});

test("DatePicker ValueText formats for the configured locale", () => {
  const date = parseDate("2026-09-05");
  const html = renderToStaticMarkup(React.createElement(DatePicker.Root, {
    referenceDate: date, defaultValue: date, locale: "de-DE", timeZone: "UTC",
  }, React.createElement(DatePicker.ValueText)));
  assert.match(html, /05\.09\.2026/);
});
