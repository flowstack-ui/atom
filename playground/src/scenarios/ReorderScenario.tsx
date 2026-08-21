import { Button } from "@flowstack-ui/atom/button";
import { Direction } from "@flowstack-ui/atom/direction";
import { Reorder, type ReorderChangeDetails } from "@flowstack-ui/atom/reorder";
import { useState } from "react";
import type { AnatomySection } from "../AnatomyPanel";
import {
  ControlToolbar,
  MenuCheckboxControl,
  MenuRadioControl,
  ToolbarGroup,
} from "../WorkbenchPrimitives";

type Orientation = "horizontal" | "vertical";
type TextDirection = "ltr" | "rtl";

type LogEntry = {
  id: number;
  time: string;
  text: string;
};

const itemLabels: Record<string, string> = {
  verify: "Verify production",
  approve: "Request approval",
  deploy: "Deploy release",
  notify: "Notify the team",
};

const initialItems = ["verify", "approve", "deploy", "notify"];

function nowTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function useReorderScenario() {
  const [items, setItems] = useState(initialItems);
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [dir, setDir] = useState<TextDirection>("ltr");
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [approvalDisabled, setApprovalDisabled] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLog = (text: string) => {
    setLog((entries) => [
      { id: Date.now() + Math.random(), time: nowTime(), text },
      ...entries.slice(0, 10),
    ]);
  };

  const handleItemsChange = (nextItems: string[], details: ReorderChangeDetails) => {
    setItems(nextItems);
    addLog(`${details.input}: ${itemLabels[details.activeValue]} ${details.previousIndex + 1} → ${details.nextIndex + 1}`);
  };

  return {
    state: { items, orientation, dir, disabled, readOnly, approvalDisabled, log },
    actions: {
      setOrientation,
      setDir,
      setDisabled,
      setReadOnly,
      setApprovalDisabled,
      handleItemsChange,
      reset: () => {
        setItems(initialItems);
        addLog("order reset");
      },
      clearLog: () => setLog([]),
    },
  };
}

export type ReorderScenario = ReturnType<typeof useReorderScenario>;

export function ReorderScenarioToolbar({ scenario }: { scenario: ReorderScenario }) {
  return (
    <ControlToolbar label="Reorder controls">
      <ToolbarGroup title="State" value="state">
        <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
        <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
        <MenuCheckboxControl checked={scenario.state.approvalDisabled} label="Disable Request approval" value="approval-disabled" onChange={scenario.actions.setApprovalDisabled} />
      </ToolbarGroup>
      <ToolbarGroup title="Layout" value="layout">
        <MenuRadioControl label="Orientation" options={["vertical", "horizontal"]} value={scenario.state.orientation} onChange={(value) => scenario.actions.setOrientation(value as Orientation)} />
        <MenuRadioControl label="Direction" options={["ltr", "rtl"]} value={scenario.state.dir} onChange={(value) => scenario.actions.setDir(value as TextDirection)} />
      </ToolbarGroup>
    </ControlToolbar>
  );
}

export function ReorderScenarioCanvas({ scenario }: { scenario: ReorderScenario }) {
  const state = scenario.state;
  return (
    <Direction.Provider dir={state.dir}>
      <div className="playground-reorder-stage" dir={state.dir}>
        <Reorder.Root
          aria-label="Deployment checklist order"
          className={`playground-reorder-list is-${state.orientation}`}
          data-playground-reorder-root=""
          disabled={state.disabled}
          getItemLabel={(value) => itemLabels[value] ?? value}
          items={state.items}
          onItemsChange={scenario.actions.handleItemsChange}
          orientation={state.orientation}
          readOnly={state.readOnly}
        >
          {state.items.map((value, index) => {
            const label = itemLabels[value] ?? value;
            const itemDisabled = value === "approve" && state.approvalDisabled;
            return (
              <Reorder.Item
                className="playground-reorder-item"
                data-playground-reorder-item={value}
                disabled={itemDisabled}
                key={value}
                value={value}
              >
                <Reorder.DropIndicator className="playground-reorder-indicator" />
                <Reorder.Handle className="playground-reorder-handle" aria-label={`Move ${label}`}>
                  <span aria-hidden="true">⠿</span>
                </Reorder.Handle>
                <span className="playground-reorder-position" aria-hidden="true">{index + 1}</span>
                <span className="playground-reorder-label">{label}</span>
                <span className="playground-reorder-actions">
                  <Reorder.MoveBefore className="playground-reorder-action" aria-label={`Move ${label} earlier`}>Earlier</Reorder.MoveBefore>
                  <Reorder.MoveAfter className="playground-reorder-action" aria-label={`Move ${label} later`}>Later</Reorder.MoveAfter>
                </span>
              </Reorder.Item>
            );
          })}
        </Reorder.Root>
        <Button.Root className="secondary-button" onPress={scenario.actions.reset}>Reset order</Button.Root>
      </div>
    </Direction.Provider>
  );
}

export function getReorderFooter(scenario: ReorderScenario) {
  return `Order ${scenario.state.items.map((value) => itemLabels[value]).join(" → ")} | ${scenario.state.orientation} | ${scenario.state.dir}`;
}

export function getReorderSource(scenario: ReorderScenario) {
  const state = scenario.state;
  return `<Direction.Provider dir="${state.dir}">
  <Reorder.Root
    items={items}
    getItemLabel={(value) => labels[value]}
    onItemsChange={setItems}${state.orientation === "horizontal" ? `
    orientation="horizontal"` : ""}${state.disabled ? "\n    disabled" : ""}${state.readOnly ? "\n    readOnly" : ""}
  >
    {items.map((value) => (
      <Reorder.Item key={value} value={value}${state.approvalDisabled ? ` disabled={value === "approve"}` : ""}>
        <Reorder.DropIndicator />
        <Reorder.Handle aria-label={\`Move \${labels[value]}\`} />
        <span>{labels[value]}</span>
        <Reorder.MoveBefore aria-label={\`Move \${labels[value]} earlier\`}>
          Earlier
        </Reorder.MoveBefore>
        <Reorder.MoveAfter aria-label={\`Move \${labels[value]} later\`}>
          Later
        </Reorder.MoveAfter>
      </Reorder.Item>
    ))}
  </Reorder.Root>
</Direction.Provider>`;
}

export function getReorderSections(scenario: ReorderScenario): AnatomySection[] {
  const root = document.querySelector<HTMLElement>("[data-playground-reorder-root]");
  const active = document.querySelector<HTMLElement>("[data-playground-reorder-item][data-dragging]");
  const target = document.querySelector<HTMLElement>("[data-playground-reorder-item][data-drop-target]");
  const firstHandle = document.querySelector<HTMLElement>("[data-playground-reorder-item] [data-slot='reorder-handle']");
  return [
    {
      title: "Root",
      selector: "[data-playground-reorder-root]",
      summary: scenario.state.orientation,
      rows: [
        { label: "Element", value: root?.tagName.toLowerCase() ?? "not rendered", category: "identity" },
        { label: "Orientation", value: root?.dataset.orientation ?? "not rendered", category: "state" },
        { label: "Disabled", value: String(root?.hasAttribute("data-disabled") ?? false), category: "state" },
        { label: "Read only", value: String(root?.hasAttribute("data-readonly") ?? false), category: "state" },
        { label: "Order", value: scenario.state.items.join(", "), category: "state" },
      ],
    },
    {
      title: "Item",
      selector: "[data-playground-reorder-item]",
      summary: `${scenario.state.items.length} items`,
      rows: [
        { label: "Active", value: active?.dataset.value ?? "none", category: "state" },
        { label: "Target", value: target?.dataset.value ?? "none", category: "state" },
        { label: "Drop position", value: target?.dataset.dropPosition ?? "none", category: "state" },
      ],
    },
    {
      title: "Handle",
      selector: "[data-playground-reorder-item] [data-slot='reorder-handle']",
      summary: firstHandle?.getAttribute("aria-label") ?? "not rendered",
      rows: [
        { label: "Element", value: firstHandle?.tagName.toLowerCase() ?? "not rendered", category: "identity" },
        { label: "Instructions", value: firstHandle?.getAttribute("aria-describedby") ?? "not rendered", category: "aria" },
      ],
    },
    {
      title: "Movement controls",
      selector: "[data-playground-reorder-item] [data-move]",
      summary: "Earlier and later",
      rows: [
        { label: "Simple pointer alternative", value: "visible", category: "behavior" },
        { label: "First earlier disabled", value: String(document.querySelector("[data-playground-reorder-item]:first-of-type [data-move='before']")?.hasAttribute("disabled") ?? false), category: "state" },
        { label: "Last later disabled", value: String(document.querySelector("[data-playground-reorder-item]:last-of-type [data-move='after']")?.hasAttribute("disabled") ?? false), category: "state" },
      ],
    },
  ];
}
