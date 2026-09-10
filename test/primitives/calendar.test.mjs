import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { Calendar } from "../../dist/calendar.js";
import { parseDate, parseZonedDateTime, toCalendar, createCalendar } from "../../dist/date-value.js";
import { selectionArray, selectionValue, validDateSelection, preserveDateType } from "../../dist/_internal/primitives/calendar/value.js";
test("civil date movement preserves zone across DST and calendar-system identity", () => {
  const before = parseZonedDateTime("2026-03-07T14:30[America/New_York]");
  const after = preserveDateType(parseDate("2026-03-08"), before);
  assert.equal(after.hour, 14); assert.equal(after.minute, 30);
  assert.equal(after.offset, -4 * 60 * 60 * 1000);
  const hebrew = toCalendar(parseDate("2026-09-05"), createCalendar("hebrew"));
  assert.equal(preserveDateType(parseDate("2026-09-06"), hebrew).calendar.identifier, "hebrew");
  assert.throws(() => parseZonedDateTime("2026-03-08T02:30[America/New_York]", "reject"));
  const early = parseZonedDateTime("2026-11-01T01:30[America/New_York]", "earlier");
  const late = parseZonedDateTime("2026-11-01T01:30[America/New_York]", "later");
  assert.equal(late.toDate().getTime() - early.toDate().getTime(), 3600000);
});
test("Calendar renders an inline grid, selection and no popup", () => {
  const date = parseDate("2026-09-05");
  const html = renderToStaticMarkup(React.createElement(Calendar.Root, {referenceDate:date, defaultValue:date},
    React.createElement(Calendar.Header, null, React.createElement(Calendar.ViewTrigger)),
    React.createElement(Calendar.Grid, {"aria-label":"Choose date"})));
  assert.match(html,/role="grid"/); assert.match(html,/data-selected/);
  assert.doesNotMatch(html,/role="dialog"|type="hidden"/);
});
test("date modes preserve explicit empty values and reject malformed ranges", () => {
  assert.equal(selectionValue("single",[]),null);
  assert.deepEqual(selectionValue("range",[]),{start:null,end:null});
  assert.throws(()=>selectionArray("range",{start:null,end:parseDate("2026-09-05")}));
  assert.throws(()=>selectionArray("single",[]));
});
test("range restrictions inspect interior dates and datetime selection preserves zone", () => {
  const start=parseDate("2026-09-01"),end=parseDate("2026-09-05");
  assert.equal(validDateSelection([start,end],{locale:"en-US",selectionMode:"range",isDateUnavailable:d=>d.day===3}),false);
  assert.equal(validDateSelection([end,start],{locale:"en-US",selectionMode:"range"}),false);
  const zoned=parseZonedDateTime("2026-09-01T14:30[America/New_York]");
  const next=preserveDateType(end,zoned);
  assert.equal(next.day,5);assert.equal(next.hour,14);assert.equal(next.timeZone,"America/New_York");
});

test("calendar day labels do not shift when the display zone is west of UTC", () => {
  const date = parseDate("2026-09-05");
  const html = renderToStaticMarkup(React.createElement(Calendar.Root, {
    referenceDate: date, timeZone: "America/New_York", locale: "en-US",
  }, React.createElement(Calendar.Grid, { "aria-label": "Date" })));
  assert.match(html, /aria-label="Today\. Choose Saturday, September 5, 2026"[^>]*>5<\/button>/);
  assert.match(html, /data-slot="calendar-content"/);
});

test("initial calendar focus starts with the selected month", () => {
  const html = renderToStaticMarkup(React.createElement(Calendar.Root, {
    referenceDate: parseDate("2026-09-05"), defaultValue: parseDate("2026-12-12"), locale: "en-US",
  }, React.createElement(Calendar.ViewTrigger)));
  assert.match(html, /December 2026/);
});
