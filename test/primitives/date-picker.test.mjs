import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { DatePicker } from "../../dist/date-picker.js";
import { parseDate, parseDateTime } from "../../dist/date-value.js";
import { parseDatePickerDraft } from "../../dist/_internal/primitives/date-picker/text-codec.js";

const codecContext = { locale: "en-US", timeZone: "UTC", referenceDate: parseDate("2026-09-18"), selectionMode: "single", index: 0 };
test("date text parsing rejects ambiguous, impossible and incomplete dates without a fallback", () => {
  for (const text of ["09/18/26", "2026-02-29", "2026-13-01", "2026-09", "2026-09-18 junk"]) {
    assert.equal(parseDatePickerDraft(text, codecContext).valid, false, text);
  }
  assert.equal(parseDatePickerDraft("2024-02-29", codecContext).values[0].toString(), "2024-02-29");
  assert.deepEqual(parseDatePickerDraft("", codecContext), { valid: true, values: [] });
});
test("date text parsing does not clamp unavailable or out-of-bounds values", () => {
  const options = { min: parseDate("2026-09-01"), max: parseDate("2026-09-30"), isDateUnavailable: date => date.day === 12 };
  for (const text of ["2026-08-31", "2026-10-01", "2026-09-12"]) assert.equal(parseDatePickerDraft(text, codecContext, options).valid, false);
});
test("multiple date text uses an explicit grammar and validates atomically", () => {
  const context = { ...codecContext, selectionMode: "multiple" };
  assert.equal(parseDatePickerDraft("2026-09-18; 2026-09-19", context).values.length, 2);
  for (const text of ["2026-09-18;", "2026-09-18;bad", "2026-09-18;2026-09-18"]) assert.equal(parseDatePickerDraft(text, context).valid, false);
  assert.equal(parseDatePickerDraft("2026-09-18;2026-09-19", context, { maxSelectedDates: 1 }).valid, false);
});
test("custom parser exceptions become an invalid draft", () => {
  assert.equal(parseDatePickerDraft("bad", codecContext, { codec: { format: String, parse() { throw new Error("bad input"); } } }).valid, false);
});
test("date-only edits preserve time while custom datetime edits replace it", () => {
  const previous = [parseDateTime("2026-09-18T09:30")];
  assert.equal(parseDatePickerDraft("2026-09-19", codecContext, { previous }).values[0].toString(), "2026-09-19T09:30:00");
  const codec = { format: String, parse: parseDateTime };
  assert.equal(parseDatePickerDraft("2026-09-19T15:45", codecContext, { previous, codec }).values[0].toString(), "2026-09-19T15:45:00");
});
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

test("DatePicker text input preserves its native host and submits one canonical value", () => {
  const date = parseDate("2026-09-18");
  const html = renderToStaticMarkup(React.createElement(DatePicker.Root, { referenceDate: date, defaultValue: date, entryMode: "text", name: "date" },
    React.createElement(DatePicker.TextInput, { "aria-label": "Date" }), React.createElement(DatePicker.HiddenInput)));
  assert.match(html, /data-slot="date-picker-text-input"/);
  assert.equal((html.match(/name="date"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /role="spinbutton"|entryMode=|textCodec=/);
});
test("DatePicker button-only and manual form compositions have one canonical owner", () => {
  const date = parseDate("2026-09-18");
  for (const mode of ["auto", "manual"]) {
    const html = renderToStaticMarkup(React.createElement(DatePicker.Root, { referenceDate: date, defaultValue: { start: date, end: date.add({ days: 1 }) }, selectionMode: "range", entryMode: "none", formControl: mode, name: "trip" },
      React.createElement(DatePicker.Trigger, null, "Choose"), mode === "manual" ? React.createElement(DatePicker.HiddenInput) : null));
    assert.equal((html.match(/name="trip\[start\]"/g) ?? []).length, 1);
    assert.equal((html.match(/name="trip\[end\]"/g) ?? []).length, 1);
    assert.match(html, /value="2026-09-19"/);
  }
});
