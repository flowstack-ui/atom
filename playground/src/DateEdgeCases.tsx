import { useState } from "react";
import { Calendar } from "@flowstack-ui/atom/calendar";
import { DateInput } from "@flowstack-ui/atom/date-input";
import { DatePicker } from "@flowstack-ui/atom/date-picker";
import { Dialog } from "@flowstack-ui/atom/dialog";
import { parseDate, parseZonedDateTime, type DateRangeValue } from "@flowstack-ui/atom/date-value";

const referenceDate = parseDate("2026-09-05");
export function DateEdgeCases() {
  const [range, setRange] = useState<DateRangeValue>({ start: null, end: null });
  return <section>
    <h2>Additional date contracts</h2>
    <Calendar.Root referenceDate={referenceDate} selectionMode="range" value={range} onValueChange={setRange}
      min={parseDate("2026-09-01")} max={parseDate("2026-10-31")} numOfMonths={2} isDateUnavailable={date => date.day === 10}>
      <Calendar.Grid aria-label="Range September" /><Calendar.Grid monthOffset={1} aria-label="Range October" />
    </Calendar.Root>
    <output aria-label="Range value">{`${range.start ?? ""}/${range.end ?? ""}`}</output>
    <Calendar.Root referenceDate={referenceDate} selectionMode="multiple" defaultValue={[referenceDate]}>
      <Calendar.Grid aria-label="Multiple dates" />
    </Calendar.Root>
    <Calendar.Root referenceDate={referenceDate} locale="ar-EG" dir="rtl">
      <Calendar.Grid aria-label="Arabic calendar" />
    </Calendar.Root>
    <DateInput.Root referenceDate={referenceDate} defaultValue={parseZonedDateTime("2026-09-05T14:30[America/New_York]")} granularity="minute" hourCycle={24}>
      <DateInput.SegmentGroup aria-label="Zoned appointment"><DateInput.Segments /></DateInput.SegmentGroup>
      <DateInput.HiddenInput name="zoned" />
    </DateInput.Root>
    <form>
      <DateInput.Root referenceDate={referenceDate} required name="required-date">
        <DateInput.SegmentGroup aria-label="Required date"><DateInput.Segments /></DateInput.SegmentGroup>
        <DateInput.HiddenInput />
      </DateInput.Root>
      <button type="submit">Validate required date</button>
    </form>
    <DatePicker.Root referenceDate={referenceDate} disabled><DatePicker.Trigger>Disabled date picker</DatePicker.Trigger></DatePicker.Root>
    <DatePicker.Root referenceDate={referenceDate} readOnly><DatePicker.Trigger>Read-only date picker</DatePicker.Trigger></DatePicker.Root>
    <Dialog.Root>
      <Dialog.Trigger>Open booking dialog</Dialog.Trigger>
      <Dialog.Portal><Dialog.Content><Dialog.Title>Booking</Dialog.Title>
        <DatePicker.Root referenceDate={referenceDate}>
          <DatePicker.Control><DatePicker.Input aria-label="Nested date" /><DatePicker.Trigger>Choose nested date</DatePicker.Trigger></DatePicker.Control>
          <DatePicker.Portal><DatePicker.Content aria-label="Nested calendar"><DatePicker.Calendar><Calendar.Grid aria-label="Nested date grid" /></DatePicker.Calendar></DatePicker.Content></DatePicker.Portal>
        </DatePicker.Root>
        <Dialog.Close>Close booking</Dialog.Close>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  </section>;
}
