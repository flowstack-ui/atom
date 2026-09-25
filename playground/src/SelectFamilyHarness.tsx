import { useState } from "react";
import { Select, useSelect } from "@flowstack-ui/atom/select";
import { MultiSelect, useMultiSelect } from "@flowstack-ui/atom/multi-select";

const values = Array.from({ length: 40 }, (_, index) => String(index));
const popup = { background: "white", color: "black", maxHeight: 160, overflow: "auto" } as const;

export function SelectFamilyHarness() {
  const [single, setSingle] = useState("0");
  const [multiple, setMultiple] = useState(["0"]);
  const [exits, setExits] = useState(0);
  const [submitted, setSubmitted] = useState("");
  const records = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }];
  const multiController = useMultiSelect({items: records, defaultValue: ["a", "b"], name: "records", ids: {content: "multi-record-popup"}, unmountOnExit: false});
  const controller = useSelect({ items: records, defaultValue: "b", name: "record", ids: { trigger: "record-trigger", content: "record-popup" }, unmountOnExit: false, onExitComplete: () => setExits(n => n + 1), onEscapeKeyDown: event => event.preventDefault() });
  return (
    <main style={{ minHeight: 1800, paddingTop: 200, paddingInline: 100 }}>
      <Select.Root value={single} onValueChange={setSingle} closeOnSelect={false} deselectable loopFocus={false} positioning={{ placement: "bottom-end", strategy: "fixed" }}>
        <Select.Trigger aria-label="Single choice"><Select.Value /></Select.Trigger>
        <Select.ClearTrigger aria-label="Clear single">Clear</Select.ClearTrigger>
        <Select.Content style={popup}>
          {values.map(value => <Select.Item key={value} value={value} disabled={value === "1"} style={{ minHeight: 32 }}><Select.ItemText>Option {value}</Select.ItemText></Select.Item>)}
        </Select.Content>
      </Select.Root>
      <output aria-label="Single value">{single || "empty"}</output>
      <MultiSelect.Root value={multiple} onValueChange={setMultiple} closeOnSelect loopFocus={false}>
        <MultiSelect.Trigger aria-label="Multiple choices"><MultiSelect.Value /></MultiSelect.Trigger>
        <MultiSelect.ClearTrigger aria-label="Clear multiple">Clear</MultiSelect.ClearTrigger>
        <MultiSelect.Content style={popup}>
          {values.map(value => <MultiSelect.Item key={value} value={value} style={{ minHeight: 32 }}><MultiSelect.ItemText>Option {value}</MultiSelect.ItemText></MultiSelect.Item>)}
        </MultiSelect.Content>
      </MultiSelect.Root>
      <output aria-label="Multiple values">{multiple.join(",") || "empty"}</output>
      <form onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get("record"))); }}>
        <Select.RootProvider value={controller}>
          <Select.Trigger aria-label="Record"><Select.Value /></Select.Trigger>
          <Select.Content style={popup}>
            {records.map(item => <Select.Item key={item.value} value={item.value}>{item.label}</Select.Item>)}
          </Select.Content>
        </Select.RootProvider>
        <button type="submit">Submit record</button>
      </form>
      <button onClick={() => controller.context.onClose()}>Close record</button>
      <output aria-label="Submitted record">{submitted}</output>
      <output aria-label="Record exits">{exits}</output>
      <form onSubmit={event => {event.preventDefault(); setSubmitted(new FormData(event.currentTarget).getAll("records").join(","));}}>
        <MultiSelect.RootProvider value={multiController}>
          <MultiSelect.Trigger aria-label="Records"><MultiSelect.Value /></MultiSelect.Trigger>
          <MultiSelect.Content style={popup}>
            {records.map(item => <MultiSelect.Item key={item.value} value={item.value}>{item.label}</MultiSelect.Item>)}
          </MultiSelect.Content>
        </MultiSelect.RootProvider>
        <button type="submit">Submit records</button>
      </form>
    </main>
  );
}
