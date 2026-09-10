import { useState } from "react";
import { Calendar } from "@flowstack-ui/atom/calendar";
import { DateInput } from "@flowstack-ui/atom/date-input";
import { DatePicker } from "@flowstack-ui/atom/date-picker";
import { parseDate } from "@flowstack-ui/atom/date-value";
import { Button } from "@flowstack-ui/atom/button";
import { DateEdgeCases } from "./DateEdgeCases";

const referenceDate = parseDate("2026-09-05");
function Navigation() {
  return <Calendar.Header>
    <Calendar.PrevTrigger>Previous</Calendar.PrevTrigger>
    <Calendar.ViewTrigger />
    <Calendar.NextTrigger>Next</Calendar.NextTrigger>
  </Calendar.Header>;
}

/** Isolated behavioral harness, not the completed workbench scenario. */
export function DateControlsHarness() {
  const [submitted, setSubmitted] = useState("");
  const [selected, setSelected] = useState("");
  return <main>
    <h1>Date controls behavior</h1>
    <Calendar.Root referenceDate={referenceDate} onValueChange={date => setSelected(date?.toString() ?? "")}>
      <Navigation />
      <Calendar.Grid aria-label="Inline date" />
    </Calendar.Root>
    <output aria-label="Selected date">{selected}</output>
    <form onSubmit={event => { event.preventDefault(); setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))); }}>
      <DateInput.Root referenceDate={referenceDate} name="birthday" defaultValue={referenceDate}>
        <DateInput.Label>Birthday</DateInput.Label>
        <DateInput.Control><DateInput.SegmentGroup><DateInput.Segments /></DateInput.SegmentGroup></DateInput.Control>
        <DateInput.HiddenInput />
      </DateInput.Root>
      <DateInput.Root referenceDate={referenceDate} selectionMode="range" name="trip">
        <DateInput.Label>Start</DateInput.Label>
        <DateInput.SegmentGroup><DateInput.Segments /></DateInput.SegmentGroup>
        <DateInput.Label index={1}>End</DateInput.Label>
        <DateInput.SegmentGroup index={1}><DateInput.Segments index={1} /></DateInput.SegmentGroup>
        <DateInput.HiddenInput /><DateInput.HiddenInput index={1} />
      </DateInput.Root>
      <DatePicker.Root referenceDate={referenceDate} name="appointment">
        <DatePicker.Control>
          <DatePicker.Input aria-label="Appointment" />
          <DatePicker.Trigger>Choose appointment</DatePicker.Trigger>
        </DatePicker.Control>
        <DatePicker.Portal><DatePicker.Content aria-label="Appointment calendar">
          <DatePicker.Calendar><Navigation /><Calendar.Grid aria-label="Appointment date" /></DatePicker.Calendar>
        </DatePicker.Content></DatePicker.Portal>
      </DatePicker.Root>
      <Button.Root type="submit">Submit</Button.Root>
      <Button.Root type="reset">Reset</Button.Root>
    </form>
    <output aria-label="Submitted values">{submitted}</output>
    <DateEdgeCases />
  </main>;
}
