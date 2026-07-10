import { Button } from "@flowstack-ui/atom/button";
import { DataGrid } from "@flowstack-ui/atom/data-grid";
import { Feed } from "@flowstack-ui/atom/feed";
import { Form } from "@flowstack-ui/atom/form";
import { Input } from "@flowstack-ui/atom/input";
import { Menubar } from "@flowstack-ui/atom/menubar";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import { Table } from "@flowstack-ui/atom/table";
import { Tree } from "@flowstack-ui/atom/tree";
import { TreeGrid } from "@flowstack-ui/atom/tree-grid";
import { useCallback, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { AnatomyPanel, type AnatomySection } from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup, partProps } from "../WorkbenchPrimitives";

type CompositionMode = "default" | "asChild" | "render";
type SelectionMode = "none" | "single" | "multiple";
type ScrollOrientation = "vertical" | "horizontal" | "both";
type ScrollAreaNameMode = "none" | "aria-label" | "aria-labelledby";
type ScrollAreaRoleMode = "auto" | "region" | "group";
type FeedSize = "known" | "unknown";
type FeedPositionMode = "index" | "position";
type TableSortDirection = "unset" | "ascending" | "descending" | "none" | "other";
type TablePartKey =
  | "root"
  | "caption"
  | "header"
  | "headerRow"
  | "head"
  | "body"
  | "bodyRow"
  | "rowHead"
  | "cell"
  | "footer"
  | "footerRow"
  | "footerCell";
type TreeSelectionMode = "single" | "multiple";
type FormControlType = "native" | "atom";

type LogEntry = {
  id: number;
  time: string;
  text: string;
};

export const dataPrimitiveScenarioIds = new Set([
  "table",
  "data-grid",
  "tree",
  "tree-grid",
  "feed",
  "scroll-area",
  "form",
]);

function nowTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function useScenarioLog() {
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLog = (text: string) => {
    setLog((entries) => [
      { id: Date.now() + Math.random(), time: nowTime(), text },
      ...entries.slice(0, 10),
    ]);
  };

  return {
    log,
    addLog,
    clearLog: () => setLog([]),
  };
}

export function useDataPrimitiveScenarios(): any {
  return {
    table: useTableScenario(),
    dataGrid: useDataGridScenario(),
    tree: useTreeScenario(),
    treeGrid: useTreeGridScenario(),
    feed: useFeedScenario(),
    scrollArea: useScrollAreaScenario(),
    form: useFormScenario(),
  };
}

function useTableScenario() {
  const [sortDirection, setSortDirection] = useState<TableSortDirection>("unset");
  const [footer, setFooter] = useState(false);
  const [composition, setComposition] = useState<Record<TablePartKey, CompositionMode>>(tableDefaultComposition);
  const [propCheck, setPropCheck] = useState(false);
  const [customSlots, setCustomSlots] = useState<Record<TablePartKey, boolean>>(tableDefaultCustomSlots);
  const [refs, setRefs] = useState<Record<TablePartKey, string>>(tableDefaultRefs);
  const { log, addLog, clearLog } = useScenarioLog();
  const setPartComposition = (part: TablePartKey, value: CompositionMode) => {
    setComposition((current) => ({ ...current, [part]: value }));
  };
  const setCustomSlot = (part: TablePartKey, value: boolean) => {
    setCustomSlots((current) => ({ ...current, [part]: value }));
  };
  const markPartRef = useCallback((part: TablePartKey, element: HTMLElement | null) => {
    if (!element) return;
    const nextRef = formatRef(element);
    setRefs((current) => {
      if (current[part] === nextRef) return current;
      return { ...current, [part]: nextRef };
    });
  }, []);

  return {
    state: { sortDirection, footer, composition, propCheck, customSlots, refs, log },
    actions: {
      setSortDirection,
      setFooter,
      setPartComposition,
      setPropCheck,
      setCustomSlot,
      markPartRef,
      clearLog,
      noteSort: () => addLog(`sort ${formatTableSort(sortDirection)}`),
    },
  };
}

function useDataGridScenario() {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("single");
  const [selectedValue, setSelectedValue] = useState<string | string[] | null>("alpha");
  const [activeCell, setActiveCell] = useState<{ rowIndex: number; columnIndex: number } | null>({
    rowIndex: 2,
    columnIndex: 1,
  });
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [loop, setLoop] = useState(true);
  const [wrapRows, setWrapRows] = useState(false);
  const [selectOnRowClick, setSelectOnRowClick] = useState(true);
  const [disableRow, setDisableRow] = useState(true);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { selectionMode, selectedValue, activeCell, disabled, readOnly, loop, wrapRows, selectOnRowClick, disableRow, composition, log },
    actions: {
      setSelectionMode,
      setSelectedValue,
      setActiveCell,
      setDisabled,
      setReadOnly,
      setLoop,
      setWrapRows,
      setSelectOnRowClick,
      setDisableRow,
      setComposition,
      clearLog,
      addLog,
    },
  };
}

function useTreeScenario() {
  const [selectionMode, setSelectionMode] = useState<TreeSelectionMode>("single");
  const [selectedValue, setSelectedValue] = useState<string | string[] | null>("docs");
  const [expandedValue, setExpandedValue] = useState<string[]>(["docs"]);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [loop, setLoop] = useState(true);
  const [forceMount, setForceMount] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  const handleValueChange = (value: string | string[] | null) => {
    setSelectedValue(value);
    addLog(`selected ${formatValue(value)}`);
  };

  const handleExpandedValueChange = (value: string[]) => {
    setExpandedValue(value);
    addLog(`expanded ${value.join(",") || "none"}`);
  };

  const handleSelectionMode = (value: TreeSelectionMode) => {
    setSelectionMode(value);
    setSelectedValue(value === "multiple" ? ["docs"] : "docs");
  };

  return {
    state: {
      selectionMode,
      selectedValue,
      expandedValue,
      disabled,
      readOnly,
      required,
      invalid,
      loop,
      forceMount,
      composition,
      log,
    },
    actions: {
      setSelectionMode: handleSelectionMode,
      setSelectedValue,
      setExpandedValue,
      setDisabled,
      setReadOnly,
      setRequired,
      setInvalid,
      setLoop,
      setForceMount,
      setComposition,
      handleValueChange,
      handleExpandedValueChange,
      clearLog,
    },
  };
}

function useTreeGridScenario() {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("single");
  const [selectedValue, setSelectedValue] = useState<string | string[] | null>("design");
  const [expandedValue, setExpandedValue] = useState<string[]>(["project"]);
  const [activeCell, setActiveCell] = useState<{ rowIndex: number; columnIndex: number } | null>({
    rowIndex: 1,
    columnIndex: 1,
  });
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [loop, setLoop] = useState(true);
  const [selectOnRowClick, setSelectOnRowClick] = useState(true);
  const [disableChild, setDisableChild] = useState(true);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { selectionMode, selectedValue, expandedValue, activeCell, disabled, readOnly, loop, selectOnRowClick, disableChild, composition, log },
    actions: {
      setSelectionMode,
      setSelectedValue,
      setExpandedValue,
      setActiveCell,
      setDisabled,
      setReadOnly,
      setLoop,
      setSelectOnRowClick,
      setDisableChild,
      setComposition,
      clearLog,
      addLog,
    },
  };
}

function useFeedScenario() {
  const [busy, setBusy] = useState(false);
  const [setSize, setSetSize] = useState<FeedSize>("known");
  const [itemCount, setItemCount] = useState(3);
  const [positionMode, setPositionMode] = useState<FeedPositionMode>("index");
  const [itemSetSize, setItemSetSize] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [itemComposition, setItemComposition] = useState<CompositionMode>("default");
  const [preventKeys, setPreventKeys] = useState(false);
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customItemSlot, setCustomItemSlot] = useState(false);
  const [rootRef, setRootRef] = useState("none");
  const [itemRef, setItemRef] = useState("none");
  const { log, addLog, clearLog } = useScenarioLog();
  const markRootRef = useCallback((element: HTMLElement | null) => {
    setRootRef(formatRef(element));
  }, []);
  const markItemRef = useCallback((element: HTMLElement | null) => {
    setItemRef(formatRef(element));
  }, []);

  return {
    state: { busy, setSize, itemCount, positionMode, itemSetSize, composition, itemComposition, preventKeys, propCheck, customRootSlot, customItemSlot, rootRef, itemRef, log },
    actions: { setBusy, setSetSize, setItemCount, setPositionMode, setItemSetSize, setComposition, setItemComposition, setPreventKeys, setPropCheck, setCustomRootSlot, setCustomItemSlot, markRootRef, markItemRef, clearLog, addLog },
  };
}

function useScrollAreaScenario() {
  const [orientation, setOrientation] = useState<ScrollOrientation>("vertical");
  const [focusable, setFocusable] = useState(true);
  const [nameMode, setNameMode] = useState<ScrollAreaNameMode>("aria-label");
  const [roleMode, setRoleMode] = useState<ScrollAreaRoleMode>("auto");
  const [longContent, setLongContent] = useState(true);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [viewportComposition, setViewportComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customViewportSlot, setCustomViewportSlot] = useState(false);
  const [rootRef, setRootRef] = useState("none");
  const [viewportRef, setViewportRef] = useState("none");
  const { log, addLog, clearLog } = useScenarioLog();
  const markRootRef = useCallback((element: HTMLElement | null) => {
    setRootRef(formatRef(element));
  }, []);
  const markViewportRef = useCallback((element: HTMLElement | null) => {
    setViewportRef(formatRef(element));
  }, []);

  return {
    state: { orientation, focusable, nameMode, roleMode, longContent, composition, viewportComposition, propCheck, customRootSlot, customViewportSlot, rootRef, viewportRef, log },
    actions: { setOrientation, setFocusable, setNameMode, setRoleMode, setLongContent, setComposition, setViewportComposition, setPropCheck, setCustomRootSlot, setCustomViewportSlot, markRootRef, markViewportRef, clearLog, addLog },
  };
}

function useFormScenario() {
  const [preventDefault, setPreventDefault] = useState(true);
  const [validation, setValidation] = useState<"none" | "pass" | "fail">("pass");
  const [asyncValidation, setAsyncValidation] = useState(false);
  const [controlType, setControlType] = useState<FormControlType>("atom");
  const [projectName, setProjectName] = useState("Atom");
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [status, setStatus] = useState("idle");
  const [rootRef, setRootRef] = useState("none");
  const { log, addLog, clearLog } = useScenarioLog();
  const markRootRef = useCallback((element: HTMLElement | null) => {
    setRootRef(formatRef(element));
  }, []);

  return {
    state: { preventDefault, validation, asyncValidation, controlType, projectName, composition, propCheck, customRootSlot, status, rootRef, log },
    actions: { setPreventDefault, setValidation, setAsyncValidation, setControlType, setProjectName, setComposition, setPropCheck, setCustomRootSlot, setStatus, markRootRef, clearLog, addLog },
  };
}

export type DataPrimitiveScenarios = ReturnType<typeof useDataPrimitiveScenarios>;

export function DataPrimitiveScenarioToolbar({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: DataPrimitiveScenarios;
}): any {
  if (scenarioId === "table") {
    const scenario = scenarios.table;
    return (
      <ControlToolbar label="Table controls">
        <ToolbarGroup title="State" value="state">
          <MenuRadioControl label="Sort direction" options={tableSortOptions} value={scenario.state.sortDirection} onChange={(value) => scenario.actions.setSortDirection(value as TableSortDirection)} />
          <MenuCheckboxControl checked={scenario.state.footer} label="Footer" value="footer" onChange={scenario.actions.setFooter} />
        </ToolbarGroup>
        <TableCompositionToolbarGroup
          composition={scenario.state.composition}
          onChange={scenario.actions.setPartComposition}
        />
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={tableSlotControls.map((control) => ({
            checked: scenario.state.customSlots[control.part],
            label: control.label,
            value: control.value,
            onChange: (checked) => scenario.actions.setCustomSlot(control.part, checked),
          }))}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "data-grid") {
    const scenario = scenarios.dataGrid;
    return (
      <ControlToolbar label="Data Grid controls">
        <ToolbarGroup title="State" value="state">
          <MenuRadioControl label="Selection" options={selectionModeOptions} value={scenario.state.selectionMode} onChange={(value) => scenario.actions.setSelectionMode(value as SelectionMode)} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
          <MenuCheckboxControl checked={scenario.state.selectOnRowClick} label="Select row on click" value="select-row" onChange={scenario.actions.setSelectOnRowClick} />
        </ToolbarGroup>
        <ToolbarGroup title="Navigation" value="navigation">
          <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          <MenuCheckboxControl checked={scenario.state.wrapRows} label="Wrap rows" value="wrap-rows" onChange={scenario.actions.setWrapRows} />
          <MenuCheckboxControl checked={scenario.state.disableRow} label="Disabled row" value="disabled-row" onChange={scenario.actions.setDisableRow} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "tree") {
    const scenario = scenarios.tree;
    return (
      <ControlToolbar label="Tree controls">
        <ToolbarGroup title="State" value="state">
          <MenuRadioControl label="Selection" options={treeSelectionOptions} value={scenario.state.selectionMode} onChange={(value) => scenario.actions.setSelectionMode(value as TreeSelectionMode)} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
          <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
          <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
        </ToolbarGroup>
        <ToolbarGroup title="Tree" value="tree">
          <MenuCheckboxControl checked={scenario.state.expandedValue.includes("docs")} label="Docs expanded" value="docs-expanded" onChange={(checked) => scenario.actions.setExpandedValue(checked ? ["docs"] : [])} />
          <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          <MenuCheckboxControl checked={scenario.state.forceMount} label="Force mount group" value="force-mount" onChange={scenario.actions.setForceMount} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "tree-grid") {
    const scenario = scenarios.treeGrid;
    return (
      <ControlToolbar label="Tree Grid controls">
        <ToolbarGroup title="State" value="state">
          <MenuRadioControl label="Selection" options={selectionModeOptions} value={scenario.state.selectionMode} onChange={(value) => scenario.actions.setSelectionMode(value as SelectionMode)} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
          <MenuCheckboxControl checked={scenario.state.selectOnRowClick} label="Select row on click" value="select-row" onChange={scenario.actions.setSelectOnRowClick} />
        </ToolbarGroup>
        <ToolbarGroup title="Tree" value="tree">
          <MenuCheckboxControl checked={scenario.state.expandedValue.includes("project")} label="Project expanded" value="project-expanded" onChange={(checked) => scenario.actions.setExpandedValue(checked ? ["project"] : [])} />
          <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          <MenuCheckboxControl checked={scenario.state.disableChild} label="Disabled child row" value="disabled-child" onChange={scenario.actions.setDisableChild} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "feed") {
    const scenario = scenarios.feed;
    return (
      <ControlToolbar label="Feed controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.busy} label="Busy" value="busy" onChange={scenario.actions.setBusy} />
          <MenuRadioControl label="Set size" options={feedSizeOptions} value={scenario.state.setSize} onChange={(value) => scenario.actions.setSetSize(value as FeedSize)} />
          <MenuRadioControl label="Items" options={feedCountOptions} value={String(scenario.state.itemCount)} onChange={(value) => scenario.actions.setItemCount(Number(value))} />
          <MenuRadioControl label="Position" options={feedPositionOptions} value={scenario.state.positionMode} onChange={(value) => scenario.actions.setPositionMode(value as FeedPositionMode)} />
          <MenuCheckboxControl checked={scenario.state.itemSetSize} label="Item set size" value="item-set-size" onChange={scenario.actions.setItemSetSize} />
        </ToolbarGroup>
        <ToolbarGroup title="Keyboard" value="keyboard">
          <MenuCheckboxControl checked={scenario.state.preventKeys} label="Prevent key handling" value="prevent-keys" onChange={scenario.actions.setPreventKeys} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.composition} onChange={(value) => scenario.actions.setComposition(value as CompositionMode)} />
          <MenuRadioControl label="Item" options={compositionOptions} value={scenario.state.itemComposition} onChange={(value) => scenario.actions.setItemComposition(value as CompositionMode)} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customItemSlot, label: "Item Slot", value: "item-slot", onChange: scenario.actions.setCustomItemSlot },
          ]}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "scroll-area") {
    const scenario = scenarios.scrollArea;
    return (
      <ControlToolbar label="Scroll Area controls">
        <ToolbarGroup title="State" value="state">
          <MenuRadioControl label="Orientation" options={scrollOrientationOptions} value={scenario.state.orientation} onChange={(value) => scenario.actions.setOrientation(value as ScrollOrientation)} />
          <MenuCheckboxControl checked={scenario.state.focusable} label="Focusable viewport" value="focusable" onChange={scenario.actions.setFocusable} />
          <MenuCheckboxControl checked={scenario.state.longContent} label="Long content" value="long-content" onChange={scenario.actions.setLongContent} />
        </ToolbarGroup>
        <ToolbarGroup title="Semantics" value="semantics">
          <MenuRadioControl label="Accessible name" options={scrollAreaNameOptions} value={scenario.state.nameMode} onChange={(value) => scenario.actions.setNameMode(value as ScrollAreaNameMode)} />
          <MenuRadioControl label="Role" options={scrollAreaRoleOptions} value={scenario.state.roleMode} onChange={(value) => scenario.actions.setRoleMode(value as ScrollAreaRoleMode)} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl
            label="Root"
            options={compositionOptions}
            value={scenario.state.composition}
            onChange={(value) => scenario.actions.setComposition(value as CompositionMode)}
          />
          <MenuRadioControl
            label="Viewport"
            options={compositionOptions}
            value={scenario.state.viewportComposition}
            onChange={(value) => scenario.actions.setViewportComposition(value as CompositionMode)}
          />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customViewportSlot, label: "Viewport Slot", value: "viewport-slot", onChange: scenario.actions.setCustomViewportSlot },
          ]}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "form") {
    const scenario = scenarios.form;
    return (
      <ControlToolbar label="Form controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.preventDefault} label="preventDefaultOnSubmit" value="prevent" onChange={scenario.actions.setPreventDefault} />
          <MenuRadioControl
            label="Validation"
            options={[
              { label: "None", value: "none" },
              { label: "Pass", value: "pass" },
              { label: "Fail", value: "fail" },
            ]}
            value={scenario.state.validation}
            onChange={(value) => scenario.actions.setValidation(value as "none" | "pass" | "fail")}
          />
          <div className="toolbar-menu-separator" role="separator" />
          <MenuCheckboxControl checked={scenario.state.asyncValidation} label="Async validation" value="async" onChange={scenario.actions.setAsyncValidation} />
          <MenuRadioControl label="Control" options={formControlOptions} value={scenario.state.controlType} onChange={scenario.actions.setControlType} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  return null;
}

export function DataPrimitiveScenarioCanvas({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: DataPrimitiveScenarios;
}): any {
  if (scenarioId === "table") return <TableScenarioCanvas scenario={scenarios.table} />;
  if (scenarioId === "data-grid") return <DataGridScenarioCanvas scenario={scenarios.dataGrid} />;
  if (scenarioId === "tree") return <TreeScenarioCanvas scenario={scenarios.tree} />;
  if (scenarioId === "tree-grid") return <TreeGridScenarioCanvas scenario={scenarios.treeGrid} />;
  if (scenarioId === "feed") return <FeedScenarioCanvas scenario={scenarios.feed} />;
  if (scenarioId === "scroll-area") return <ScrollAreaScenarioCanvas scenario={scenarios.scrollArea} />;
  if (scenarioId === "form") return <FormScenarioCanvas scenario={scenarios.form} />;
  return null;
}

export function DataPrimitiveScenarioAnatomy({
  scenarioId,
  scenarios,
  openGroups,
  onOpenGroupsChange,
}: {
  scenarioId: string;
  scenarios: DataPrimitiveScenarios;
  openGroups: Record<string, boolean>;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}): any {
  const sections = getDataPrimitiveSections(scenarioId, scenarios);

  return (
    <AnatomyPanel
      footer={`${sections.length} ${sections.length === 1 ? "part" : "parts"}`}
      openGroups={openGroups}
      sections={sections}
      onOpenGroupsChange={onOpenGroupsChange}
    />
  );
}

export function DataPrimitiveScenarioLog({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: DataPrimitiveScenarios;
}): any {
  const log = getDataPrimitiveLog(scenarioId, scenarios);

  return <ScenarioEventLog log={log} />;
}

export function getDataPrimitiveEventCount(
  scenarioId: string,
  scenarios: DataPrimitiveScenarios,
): any {
  return getDataPrimitiveLog(scenarioId, scenarios).length;
}

export function clearDataPrimitiveLog(
  scenarioId: string,
  scenarios: DataPrimitiveScenarios,
): any {
  getDataPrimitiveActions(scenarioId, scenarios)?.clearLog();
}

export function getDataPrimitiveCanvasFooter(
  scenarioId: string,
  scenarios: DataPrimitiveScenarios,
): any {
  if (scenarioId === "table") {
    const state = scenarios.table.state;
    return `Sort ${formatTableSort(state.sortDirection)} | Footer ${bool(state.footer)} | Root ${state.composition.root}`;
  }

  if (scenarioId === "data-grid") {
    const state = scenarios.dataGrid.state;
    return `Selected ${formatValue(state.selectedValue)} | Active ${formatCell(state.activeCell)} | ${state.selectionMode}`;
  }

  if (scenarioId === "tree") {
    const state = scenarios.tree.state;
    return `Selected ${formatValue(state.selectedValue)} | Expanded ${state.expandedValue.join(",") || "none"} | ${state.selectionMode}`;
  }

  if (scenarioId === "tree-grid") {
    const state = scenarios.treeGrid.state;
    return `Selected ${formatValue(state.selectedValue)} | Expanded ${state.expandedValue.join(",") || "none"} | Active ${formatCell(state.activeCell)}`;
  }

  if (scenarioId === "feed") {
    const state = scenarios.feed.state;
    return `Busy ${state.busy} | Size ${state.setSize} | Items ${state.itemCount} | Position ${state.positionMode}`;
  }

  if (scenarioId === "scroll-area") {
    const state = scenarios.scrollArea.state;
    return `${state.orientation} | Focusable ${state.focusable} | Name ${state.nameMode} | Role ${state.roleMode}`;
  }

  if (scenarioId === "form") {
    const state = scenarios.form.state;
    return `Status ${state.status} | preventDefaultOnSubmit ${state.preventDefault} | Validate ${state.validation}`;
  }

  return "";
}

export function getDataPrimitiveSource(scenarioId: string, scenarios?: DataPrimitiveScenarios): any {
  if (scenarioId === "table") {
    return getTableSource(scenarios?.table.state);
  }

  if (scenarioId === "data-grid") {
    return `<DataGrid.Root selectionMode="single" selectOnRowClick>
  <DataGrid.Caption>Project data</DataGrid.Caption>
  <DataGrid.Header>
    <DataGrid.Row rowIndex={1}>
      <DataGrid.ColumnHeader columnIndex={1}>Name</DataGrid.ColumnHeader>
      <DataGrid.ColumnHeader columnIndex={2}>Status</DataGrid.ColumnHeader>
    </DataGrid.Row>
  </DataGrid.Header>
  <DataGrid.Body>
    <DataGrid.Row value="alpha" rowIndex={2}>
      <DataGrid.Cell columnIndex={1}>Alpha</DataGrid.Cell>
      <DataGrid.Cell columnIndex={2}>Ready</DataGrid.Cell>
    </DataGrid.Row>
  </DataGrid.Body>
</DataGrid.Root>`;
  }

  if (scenarioId === "tree") {
    return `<Tree.Root
  value={value}
  expandedValue={expandedValue}
  onValueChange={setValue}
  onExpandedValueChange={setExpandedValue}
>
  <Tree.Item value="docs" expandable>
    <Tree.ItemText>Docs</Tree.ItemText>
    <Tree.Group>
      <Tree.Item value="guide">Guide</Tree.Item>
    </Tree.Group>
  </Tree.Item>
</Tree.Root>`;
  }

  if (scenarioId === "tree-grid") {
    return `<TreeGrid.Root selectionMode="single" selectOnRowClick>
  <TreeGrid.Body>
    <TreeGrid.Row value="project" expandable level={1}>
      <TreeGrid.RowHeader columnIndex={1}>Project</TreeGrid.RowHeader>
      <TreeGrid.Cell columnIndex={2}>Open</TreeGrid.Cell>
    </TreeGrid.Row>
  </TreeGrid.Body>
</TreeGrid.Root>`;
  }

  if (scenarioId === "feed") {
    const state = scenarios?.feed.state;
    const busy = state?.busy ? " busy" : "";
    const itemCount = state?.itemCount ?? 3;
    const rootSetSize = state?.positionMode === "position" && state?.setSize === "known" ? 100 : itemCount;
    const setSize = state?.setSize === "unknown" ? "\"unknown\"" : String(rootSetSize);
    const rootDataProps = `${state?.customRootSlot ? " data-slot=\"feed-custom\"" : ""}${state?.propCheck ? " data-prop-check=\"root\"" : ""}`;
    const itemDataProps = `${state?.customItemSlot ? " data-slot=\"feed-item-custom\"" : ""}${state?.propCheck ? " data-prop-check=\"item\"" : ""}`;
    const onKeyDown = state?.preventKeys ? "\n  onKeyDown={(event) => event.preventDefault()}" : "";
    const itemPositionProp = state?.positionMode === "position" ? " position={11}" : " index={0}";
    const itemSetSizeProp = state?.itemSetSize ? " setSize={10}" : "";
    const itemOpen = `<Feed.Item${itemPositionProp}${itemSetSizeProp}${itemDataProps}`;
    const itemChildren = `
    <h3>Deploy reviewed</h3>
    <p>Production checklist was reviewed by operations.</p>`;
    const item = state?.itemComposition === "asChild"
      ? `${itemOpen} asChild>
    <article>${itemChildren}
    </article>
  </Feed.Item>`
      : state?.itemComposition === "render"
        ? `${itemOpen}
    render={(props) => (
      <section {...props}>${itemChildren}
      </section>
    )}
  />`
        : `${itemOpen}>${itemChildren}
  </Feed.Item>`;

    if (state?.composition === "asChild") {
      return `<Feed.Root setSize={${setSize}}${busy}${rootDataProps}${onKeyDown} asChild>
  <section>
    ${item}
  </section>
</Feed.Root>`;
    }

    if (state?.composition === "render") {
      return `<Feed.Root
  setSize={${setSize}}${busy}
  ${rootDataProps.trim()}${onKeyDown}
  render={(props) => (
    <section {...props}>
      ${item}
    </section>
  )}
/>`;
    }

    return `<Feed.Root setSize={${setSize}}${busy}${rootDataProps}${onKeyDown}>
  ${item}
</Feed.Root>`;
  }

  if (scenarioId === "scroll-area") {
    const state = scenarios?.scrollArea.state;
    const orientation = state?.orientation ?? "vertical";
    const focusable = state?.focusable ?? true;
    const nameMode = state?.nameMode ?? "aria-label";
    const roleMode = state?.roleMode ?? "auto";
    const composition = state?.composition ?? "default";
    const viewportComposition = state?.viewportComposition ?? "default";
    const label = nameMode === "aria-label" ? " aria-label=\"Scrollable project notes\"" : "";
    const labelledby = nameMode === "aria-labelledby" ? " aria-labelledby=\"scroll-area-title\"" : "";
    const role = roleMode === "auto" ? "" : ` role="${roleMode}"`;
    const rootDataProps = `${state?.customRootSlot ? " data-slot=\"scroll-area-custom\"" : ""}${state?.propCheck ? " data-prop-check=\"root\"" : ""}`;
    const viewportDataProps = `${state?.customViewportSlot ? " data-slot=\"scroll-area-viewport-custom\"" : ""}${state?.propCheck ? " data-prop-check=\"viewport\"" : ""}`;
    const viewportOpen = `<ScrollArea.Viewport${focusable ? " focusable" : ""}${label}${labelledby}${role}${viewportDataProps}`;
    const viewport = viewportComposition === "asChild"
      ? `${viewportOpen} asChild>
    <section>
      Content
    </section>
  </ScrollArea.Viewport>`
      : viewportComposition === "render"
        ? `${viewportOpen}
    render={(props) => <section {...props}>Content</section>}
  />`
        : `${viewportOpen}>
    Content
  </ScrollArea.Viewport>`;
    const title = nameMode === "aria-labelledby" ? `<span id="scroll-area-title">Scrollable project notes</span>\n` : "";

    if (composition === "asChild") {
      return `<ScrollArea.Root orientation="${orientation}"${rootDataProps} asChild>
  <section>
    ${title}    ${viewport}
  </section>
</ScrollArea.Root>`;
    }

    if (composition === "render") {
      return `<ScrollArea.Root
  orientation="${orientation}"
  ${rootDataProps.trim()}
  render={(props) => (
    <section {...props}>
      ${title}      ${viewport}
    </section>
  )}
/>`;
    }

    return `<ScrollArea.Root orientation="${orientation}"${rootDataProps}>
  ${title}  ${viewport}
</ScrollArea.Root>`;
  }

  if (scenarioId === "form") {
    const state = scenarios.form.state;
    const validation =
      state.validation === "none"
        ? ""
        : `
  validateOnSubmit={${state.asyncValidation ? "asyncValidate" : state.validation === "pass" ? "validatePass" : "validateFail"}}`;
    const props = `${state.preventDefault ? " preventDefaultOnSubmit" : ""}${validation}`;
    const rootDataProps = `${state.customRootSlot ? " data-slot=\"form-custom\"" : ""}${state.propCheck ? " data-prop-check=\"root\"" : ""}`;
    const open = state.composition === "asChild"
      ? `<Form.Root${props} asChild>
  <form${rootDataProps}>`
      : state.composition === "render"
        ? `<Form.Root${props}
  render={(props) => <form {...props}${rootDataProps} />}
>`
        : `<Form.Root${props}${rootDataProps}>`;
    const close = state.composition === "asChild"
      ? `  </form>
</Form.Root>`
      : state.composition === "render"
        ? `</Form.Root>`
        : `</Form.Root>`;
    const control = state.controlType === "atom"
      ? `<Input.Root name="project" required value={projectName} onValueChange={setProjectName} />`
      : `<input name="project" required value={projectName} onChange={(event) => setProjectName(event.target.value)} />`;
    return `${open}
  ${control}
  <Button.Root type="submit">Submit</Button.Root>
${close}`;
  }

  return "// No source example for this scenario yet.";
}

function TableScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useTableScenario> }) {
  const state = scenario.state;
  const props = {
    className: "playground-data-table",
    "data-playground-inspect": "",
    "data-table-root": "",
    ref: (element: HTMLTableElement | null) => scenario.actions.markPartRef("root", element),
    ...tablePartProps("root", state),
  };
  const content = renderTableContent(scenario);

  return (
    <div className="data-primitive-stage scroll-area-stage">
      {state.composition.root === "asChild" ? (
        <Table.Root {...props} asChild>
          <table>{content}</table>
        </Table.Root>
      ) : state.composition.root === "render" ? (
        <Table.Root {...props} render={(renderProps) => <table {...renderProps}>{content}</table>} />
      ) : (
        <Table.Root {...props}>{content}</Table.Root>
      )}
    </div>
  );
}

function renderTableContent(scenario: ReturnType<typeof useTableScenario>) {
  return (
    <>
      {renderTableCaption(scenario)}
      {renderTableHeader(scenario)}
      {renderTableBody(scenario)}
      {renderTableFooter(scenario)}
    </>
  );
}

function renderTableCaption(scenario: ReturnType<typeof useTableScenario>) {
  const props = {
    "data-playground-inspect": "",
    "data-table-caption": "",
    ref: (element: HTMLTableCaptionElement | null) => scenario.actions.markPartRef("caption", element),
    ...tablePartProps("caption", scenario.state),
  };

  if (scenario.state.composition.caption === "asChild") {
    return (
      <Table.Caption {...props} asChild>
        <caption>Project metrics</caption>
      </Table.Caption>
    );
  }

  if (scenario.state.composition.caption === "render") {
    return <Table.Caption {...props} render={(renderProps) => <caption {...renderProps}>Project metrics</caption>} />;
  }

  return <Table.Caption {...props}>Project metrics</Table.Caption>;
}

function renderTableHeader(scenario: ReturnType<typeof useTableScenario>) {
  const props = {
    "data-playground-inspect": "",
    "data-table-header": "",
    ref: (element: HTMLTableSectionElement | null) => scenario.actions.markPartRef("header", element),
    ...tablePartProps("header", scenario.state),
  };
  const row = renderTableHeaderRow(scenario);

  if (scenario.state.composition.header === "asChild") {
    return (
      <Table.Header {...props} asChild>
        <thead>{row}</thead>
      </Table.Header>
    );
  }

  if (scenario.state.composition.header === "render") {
    return <Table.Header {...props} render={(renderProps) => <thead {...renderProps}>{row}</thead>} />;
  }

  return <Table.Header {...props}>{row}</Table.Header>;
}

function renderTableHeaderRow(scenario: ReturnType<typeof useTableScenario>) {
  const props = {
    "data-playground-inspect": "",
    "data-table-header-row": "",
    ref: (element: HTMLTableRowElement | null) => scenario.actions.markPartRef("headerRow", element),
    ...tablePartProps("headerRow", scenario.state),
  };
  const cells = (
    <>
      {renderTableProjectHead(scenario)}
      {renderTableHead("status", "Status", scenario)}
      {renderTableHead("owner", "Owner", scenario)}
    </>
  );

  if (scenario.state.composition.headerRow === "asChild") {
    return (
      <Table.Row {...props} asChild>
        <tr>{cells}</tr>
      </Table.Row>
    );
  }

  if (scenario.state.composition.headerRow === "render") {
    return <Table.Row {...props} render={(renderProps) => <tr {...renderProps}>{cells}</tr>} />;
  }

  return <Table.Row {...props}>{cells}</Table.Row>;
}

function renderTableProjectHead(scenario: ReturnType<typeof useTableScenario>) {
  const sortDirection = scenario.state.sortDirection === "unset" ? undefined : scenario.state.sortDirection;
  const props = {
    "data-playground-inspect": "",
    "data-table-head-name": "",
    sortDirection,
    ref: (element: HTMLTableCellElement | null) => scenario.actions.markPartRef("head", element),
    ...tablePartProps("head", scenario.state),
  };

  if (scenario.state.composition.head === "asChild") {
    return (
      <Table.Head {...props} asChild>
        <th>Project</th>
      </Table.Head>
    );
  }

  if (scenario.state.composition.head === "render") {
    return <Table.Head {...props} render={(renderProps) => <th {...renderProps}>Project</th>} />;
  }

  return <Table.Head {...props}>Project</Table.Head>;
}

function renderTableHead(id: string, label: string, scenario: ReturnType<typeof useTableScenario>) {
  const props = id === "status"
    ? { "data-playground-inspect": "", "data-table-head-status": "", ...tablePartProps("head", scenario.state) }
    : { "data-playground-inspect": "", "data-table-head": id, ...tablePartProps("head", scenario.state) };

  if (scenario.state.composition.head === "asChild") {
    return (
      <Table.Head {...props} asChild>
        <th>{label}</th>
      </Table.Head>
    );
  }

  if (scenario.state.composition.head === "render") {
    return <Table.Head {...props} render={(renderProps) => <th {...renderProps}>{label}</th>} />;
  }

  return (
    <Table.Head {...props}>
      {label}
    </Table.Head>
  );
}

function renderTableBody(scenario: ReturnType<typeof useTableScenario>) {
  const props = {
    "data-playground-inspect": "",
    "data-table-body": "",
    ref: (element: HTMLTableSectionElement | null) => scenario.actions.markPartRef("body", element),
    ...tablePartProps("body", scenario.state),
  };
  const rows = (
    <>
        {tableRows.map((item) => (
          <TableBodyRow item={item} key={item.id} scenario={scenario} />
        ))}
    </>
  );

  if (scenario.state.composition.body === "asChild") {
    return (
      <Table.Body {...props} asChild>
        <tbody>{rows}</tbody>
      </Table.Body>
    );
  }

  if (scenario.state.composition.body === "render") {
    return <Table.Body {...props} render={(renderProps) => <tbody {...renderProps}>{rows}</tbody>} />;
  }

  return <Table.Body {...props}>{rows}</Table.Body>;
}

function TableBodyRow({ item, scenario }: { item: (typeof tableRows)[number]; scenario: ReturnType<typeof useTableScenario> }) {
  const rowProps = {
    "data-playground-inspect": "",
    "data-table-row": item.id,
    ref: item.id === "alpha" ? (element: HTMLTableRowElement | null) => scenario.actions.markPartRef("bodyRow", element) : undefined,
    ...tablePartProps("bodyRow", scenario.state),
  };
  const cells = (
    <>
      {renderTableRowHead(item, scenario)}
      {renderTableCell(`${item.id}-status`, item.status, scenario)}
      {renderTableCell(`${item.id}-owner`, item.owner, scenario)}
    </>
  );

  if (scenario.state.composition.bodyRow === "asChild") {
    return (
      <Table.Row {...rowProps} asChild>
        <tr>{cells}</tr>
      </Table.Row>
    );
  }

  if (scenario.state.composition.bodyRow === "render") {
    return <Table.Row {...rowProps} render={(renderProps) => <tr {...renderProps}>{cells}</tr>} />;
  }

  return <Table.Row {...rowProps}>{cells}</Table.Row>;
}

function renderTableRowHead(item: (typeof tableRows)[number], scenario: ReturnType<typeof useTableScenario>) {
  const props = {
    "data-playground-inspect": "",
    "data-table-row-head": item.id,
    scope: "row",
    ref: item.id === "alpha" ? (element: HTMLTableCellElement | null) => scenario.actions.markPartRef("rowHead", element) : undefined,
    ...tablePartProps("rowHead", scenario.state),
  };

  if (scenario.state.composition.rowHead === "asChild") {
    return (
      <Table.Head {...props} asChild>
        <th>{item.name}</th>
      </Table.Head>
    );
  }

  if (scenario.state.composition.rowHead === "render") {
    return <Table.Head {...props} render={(renderProps) => <th {...renderProps}>{item.name}</th>} />;
  }

  return <Table.Head {...props}>{item.name}</Table.Head>;
}

function renderTableCell(id: string, value: string, scenario: ReturnType<typeof useTableScenario>) {
  const props = {
    "data-playground-inspect": "",
    "data-table-cell": id,
    ref: id === "alpha-status" ? (element: HTMLTableCellElement | null) => scenario.actions.markPartRef("cell", element) : undefined,
    ...tablePartProps("cell", scenario.state),
  };

  if (scenario.state.composition.cell === "asChild") {
    return (
      <Table.Cell {...props} asChild>
        <td>{value}</td>
      </Table.Cell>
    );
  }

  if (scenario.state.composition.cell === "render") {
    return <Table.Cell {...props} render={(renderProps) => <td {...renderProps}>{value}</td>} />;
  }

  return <Table.Cell {...props}>{value}</Table.Cell>;
}

function renderTableFooter(scenario: ReturnType<typeof useTableScenario>) {
  if (!scenario.state.footer) return null;

  const props = {
    "data-playground-inspect": "",
    "data-table-footer": "",
    ref: (element: HTMLTableSectionElement | null) => scenario.actions.markPartRef("footer", element),
    ...tablePartProps("footer", scenario.state),
  };
  const row = renderTableFooterRow(scenario);

  if (scenario.state.composition.footer === "asChild") {
    return (
      <Table.Footer {...props} asChild>
        <tfoot>{row}</tfoot>
      </Table.Footer>
    );
  }

  if (scenario.state.composition.footer === "render") {
    return <Table.Footer {...props} render={(renderProps) => <tfoot {...renderProps}>{row}</tfoot>} />;
  }

  return <Table.Footer {...props}>{row}</Table.Footer>;
}

function renderTableFooterRow(scenario: ReturnType<typeof useTableScenario>) {
  const props = {
    "data-playground-inspect": "",
    "data-table-footer-row": "",
    ref: (element: HTMLTableRowElement | null) => scenario.actions.markPartRef("footerRow", element),
    ...tablePartProps("footerRow", scenario.state),
  };
  const cell = renderTableFooterCell(scenario);

  if (scenario.state.composition.footerRow === "asChild") {
    return (
      <Table.Row {...props} asChild>
        <tr>{cell}</tr>
      </Table.Row>
    );
  }

  if (scenario.state.composition.footerRow === "render") {
    return <Table.Row {...props} render={(renderProps) => <tr {...renderProps}>{cell}</tr>} />;
  }

  return <Table.Row {...props}>{cell}</Table.Row>;
}

function renderTableFooterCell(scenario: ReturnType<typeof useTableScenario>) {
  const props = {
    colSpan: 3,
    "data-playground-inspect": "",
    "data-table-footer-cell": "",
    ref: (element: HTMLTableCellElement | null) => scenario.actions.markPartRef("footerCell", element),
    ...tablePartProps("footerCell", scenario.state),
  };

  if (scenario.state.composition.footerCell === "asChild") {
    return (
      <Table.Cell {...props} asChild>
        <td>3 projects</td>
      </Table.Cell>
    );
  }

  if (scenario.state.composition.footerCell === "render") {
    return <Table.Cell {...props} render={(renderProps) => <td {...renderProps}>3 projects</td>} />;
  }

  return <Table.Cell {...props}>3 projects</Table.Cell>;
}

function tablePartProps(part: TablePartKey, state: ReturnType<typeof useTableScenario>["state"]) {
  return partProps(part, {
    propCheck: state.propCheck,
    customSlot: state.customSlots[part],
  }, tableSlotValues[part]);
}

function getTableSource(state = {
  sortDirection: "unset" as TableSortDirection,
  footer: false,
  composition: tableDefaultComposition,
  propCheck: false,
  customSlots: tableDefaultCustomSlots,
}) {
  const rootProps = sourceTablePartProps("root", state);
  const captionProps = sourceTablePartProps("caption", state);
  const headerProps = sourceTablePartProps("header", state);
  const headerRowProps = sourceTablePartProps("headerRow", state);
  const projectHeadProps = sourceTablePartProps("head", state, [
    state.sortDirection !== "unset" ? `sortDirection="${state.sortDirection}"` : null,
  ]);
  const headProps = sourceTablePartProps("head", state);
  const bodyProps = sourceTablePartProps("body", state);
  const bodyRowProps = sourceTablePartProps("bodyRow", state);
  const rowHeadProps = sourceTablePartProps("rowHead", state, ["scope=\"row\""]);
  const cellProps = sourceTablePartProps("cell", state);
  const footer = state.footer ? `
  ${sourceTableElement("Footer", "footer", state.composition.footer, sourceTablePartProps("footer", state), `
    ${sourceTableElement("Row", "footerRow", state.composition.footerRow, sourceTablePartProps("footerRow", state), `
      ${sourceTableElement("Cell", "footerCell", state.composition.footerCell, sourceTablePartProps("footerCell", state, ["colSpan={3}"]), "3 projects", 6)}
    `, 4)}
  `, 2)}` : "";

  return sourceTableElement("Root", "root", state.composition.root, rootProps, `
  ${sourceTableElement("Caption", "caption", state.composition.caption, captionProps, "Project metrics", 2)}
  ${sourceTableElement("Header", "header", state.composition.header, headerProps, `
    ${sourceTableElement("Row", "headerRow", state.composition.headerRow, headerRowProps, `
      ${sourceTableElement("Head", "head", state.composition.head, projectHeadProps, "Project", 6)}
      ${sourceTableElement("Head", "head", state.composition.head, headProps, "Status", 6)}
      ${sourceTableElement("Head", "head", state.composition.head, headProps, "Owner", 6)}
    `, 4)}
  `, 2)}
  ${sourceTableElement("Body", "body", state.composition.body, bodyProps, `
    ${sourceTableElement("Row", "bodyRow", state.composition.bodyRow, bodyRowProps, `
      ${sourceTableElement("Head", "rowHead", state.composition.rowHead, rowHeadProps, "Alpha", 6)}
      ${sourceTableElement("Cell", "cell", state.composition.cell, cellProps, "Ready", 6)}
      <Table.Cell>Ava</Table.Cell>
    `, 4)}
  `, 2)}${footer}
`, 0);
}

function sourceTablePartProps(
  part: TablePartKey,
  state: Pick<ReturnType<typeof useTableScenario>["state"], "customSlots" | "propCheck">,
  extraProps: Array<string | null> = [],
) {
  return [
    ...extraProps,
    state.propCheck ? `data-prop-check="${part}"` : null,
    state.customSlots[part] ? `data-slot="${tableSlotValues[part]}"` : null,
  ].filter(Boolean) as string[];
}

function sourceTableElement(
  component: string,
  part: TablePartKey,
  composition: CompositionMode,
  props: string[],
  children: string,
  indent: number,
) {
  const pad = " ".repeat(indent);
  const propText = props.length ? ` ${props.join(" ")}` : "";
  const normalizedChildren = normalizeTableSourceChildren(children, indent + 2);

  if (composition === "asChild") {
    const tag = tableNativeTags[part];
    return `${pad}<Table.${component}${propText} asChild>
${pad}  <${tag}>${normalizedChildren.includes("\n") ? `\n${normalizedChildren}\n${pad}  ` : normalizedChildren}</${tag}>
${pad}</Table.${component}>`;
  }

  if (composition === "render") {
    const tag = tableNativeTags[part];
    return `${pad}<Table.${component}${propText}
${pad}  render={(props) => (
${pad}    <${tag} {...props}>${normalizedChildren.includes("\n") ? `\n${normalizedChildren}\n${pad}    ` : normalizedChildren}</${tag}>
${pad}  )}
${pad}/>`;
  }

  return `${pad}<Table.${component}${propText}>${normalizedChildren.includes("\n") ? `\n${normalizedChildren}\n${pad}` : normalizedChildren}</Table.${component}>`;
}

function normalizeTableSourceChildren(children: string, indent: number) {
  if (!children.includes("\n")) return children;

  const pad = " ".repeat(indent);
  return children
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0)
    .map((line) => `${pad}${line.trimStart()}`)
    .join("\n");
}

function DataGridScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useDataGridScenario> }) {
  const state = scenario.state;
  const props: any = {
    className: "playground-data-table",
    id: "playground-data-grid",
    "aria-label": "Project data grid",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    selectionMode: state.selectionMode,
    value: state.selectedValue,
    activeCell: state.activeCell,
    disabled: state.disabled,
    readOnly: state.readOnly,
    loop: state.loop,
    wrapRows: state.wrapRows,
    rowCount: 4,
    columnCount: 2,
    selectOnRowClick: state.selectOnRowClick,
    onValueChange: (value: string | string[] | null) => {
      scenario.actions.setSelectedValue(value);
      scenario.actions.addLog(`value changed ${formatValue(value)}`);
    },
    onActiveCellChange: (cell: { rowIndex: number; columnIndex: number } | null) => {
      scenario.actions.setActiveCell(cell);
      scenario.actions.addLog(`active cell ${formatCell(cell)}`);
    },
  };

  const content = renderDataGridContent(scenario);

  return (
    <div className="data-primitive-stage">
      {state.composition === "asChild" ? (
        <DataGrid.Root {...props} asChild>
          <table>{content}</table>
        </DataGrid.Root>
      ) : state.composition === "render" ? (
        <DataGrid.Root {...props} render={(renderProps) => <table {...renderProps}>{content}</table>} />
      ) : (
        <DataGrid.Root {...props}>{content}</DataGrid.Root>
      )}
    </div>
  );
}

function renderDataGridContent(scenario: ReturnType<typeof useDataGridScenario>) {
  return (
    <>
      <DataGrid.Caption data-data-grid-caption="" data-playground-inspect="">Project data</DataGrid.Caption>
      <DataGrid.Header data-data-grid-header="" data-playground-inspect="">
        <DataGrid.Row rowIndex={1} data-data-grid-header-row="" data-playground-inspect="">
          <DataGrid.ColumnHeader columnIndex={1} sortDirection="ascending" data-data-grid-column-header="" data-playground-inspect="">Name</DataGrid.ColumnHeader>
          <DataGrid.ColumnHeader columnIndex={2} data-data-grid-column-header-secondary="" data-playground-inspect="">Status</DataGrid.ColumnHeader>
        </DataGrid.Row>
      </DataGrid.Header>
      <DataGrid.Body data-data-grid-body="" data-playground-inspect="">
        {dataGridRows.map((row, index) => (
          <DataGrid.Row
            data-data-grid-row={row.value}
            data-playground-inspect=""
            disabled={scenario.state.disableRow && row.value === "blocked"}
            index={index + 1}
            key={row.value}
            value={row.value}
          >
            <DataGrid.Cell columnIndex={1} data-data-grid-cell={`${row.value}-name`} data-playground-inspect="">{row.name}</DataGrid.Cell>
            <DataGrid.Cell columnIndex={2} data-data-grid-cell={`${row.value}-status`} data-playground-inspect="">{row.status}</DataGrid.Cell>
          </DataGrid.Row>
        ))}
      </DataGrid.Body>
      <DataGrid.Footer data-data-grid-footer="" data-playground-inspect="">
        <DataGrid.Row rowIndex={4}>
          <DataGrid.Cell columnIndex={1}>Total</DataGrid.Cell>
          <DataGrid.Cell columnIndex={2}>{dataGridRows.length} rows</DataGrid.Cell>
        </DataGrid.Row>
      </DataGrid.Footer>
    </>
  );
}

function TreeScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useTreeScenario> }) {
  const state = scenario.state;
  const props = {
    className: "playground-tree",
    "aria-label": "Documentation tree",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    "data-tree-root": "",
    disabled: state.disabled,
    expandedValue: state.expandedValue,
    invalid: state.invalid,
    loop: state.loop,
    multiple: state.selectionMode === "multiple",
    name: "tree-selection",
    readOnly: state.readOnly,
    required: state.required,
    value: state.selectedValue,
    onExpandedValueChange: scenario.actions.handleExpandedValueChange,
    onValueChange: scenario.actions.handleValueChange,
  };
  const content = renderTreeContent(scenario);

  return (
    <div className="data-primitive-stage">
      {state.composition === "asChild" ? (
        <Tree.Root {...props} asChild>
          <section>{content}</section>
        </Tree.Root>
      ) : state.composition === "render" ? (
        <Tree.Root {...props} render={(renderProps) => <section {...renderProps}>{content}</section>} />
      ) : (
        <Tree.Root {...props}>{content}</Tree.Root>
      )}
    </div>
  );
}

function renderTreeContent(scenario: ReturnType<typeof useTreeScenario>) {
  return (
    <>
      <Tree.Item data-playground-inspect="" data-tree-item="docs" data-prop-check="item-docs" expandable value="docs">
        <Tree.ItemText data-playground-inspect="" data-tree-item-text="docs">Docs</Tree.ItemText>
        <Tree.Group data-playground-inspect="" data-tree-group="docs" forceMount={scenario.state.forceMount}>
          <Tree.Item data-playground-inspect="" data-tree-item="guide" value="guide">
            <Tree.ItemText data-playground-inspect="" data-tree-item-text="guide">Guide</Tree.ItemText>
          </Tree.Item>
          <Tree.Item data-playground-inspect="" data-tree-item="api" disabled value="api">
            <Tree.ItemText data-playground-inspect="" data-tree-item-text="api">API</Tree.ItemText>
          </Tree.Item>
        </Tree.Group>
      </Tree.Item>
      <Tree.Item data-playground-inspect="" data-tree-item="components" expandable value="components">
        <Tree.ItemText data-playground-inspect="" data-tree-item-text="components">Components</Tree.ItemText>
        <Tree.Group data-playground-inspect="" data-tree-group="components" forceMount={scenario.state.forceMount}>
          <Tree.Item data-playground-inspect="" data-tree-item="button" value="button">
            <Tree.ItemText data-playground-inspect="" data-tree-item-text="button">Button</Tree.ItemText>
          </Tree.Item>
        </Tree.Group>
      </Tree.Item>
    </>
  );
}

function TreeGridScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useTreeGridScenario> }) {
  const state = scenario.state;
  const props: any = {
    className: "playground-data-table",
    id: "playground-tree-grid",
    "aria-label": "Project tree grid",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    selectionMode: state.selectionMode,
    value: state.selectedValue,
    expandedValue: state.expandedValue,
    activeCell: state.activeCell,
    disabled: state.disabled,
    readOnly: state.readOnly,
    loop: state.loop,
    rowCount: 4,
    columnCount: 2,
    selectOnRowClick: state.selectOnRowClick,
    onValueChange: (value: string | string[] | null) => {
      scenario.actions.setSelectedValue(value);
      scenario.actions.addLog(`value changed ${formatValue(value)}`);
    },
    onExpandedValueChange: (value: string[]) => {
      scenario.actions.setExpandedValue(value);
      scenario.actions.addLog(`expanded ${value.join(",") || "none"}`);
    },
    onActiveCellChange: (cell: { rowIndex: number; columnIndex: number } | null) => {
      scenario.actions.setActiveCell(cell);
      scenario.actions.addLog(`active cell ${formatCell(cell)}`);
    },
  };
  const content = renderTreeGridContent(scenario);

  return (
    <div className="data-primitive-stage">
      {state.composition === "asChild" ? (
        <TreeGrid.Root {...props} asChild>
          <table>{content}</table>
        </TreeGrid.Root>
      ) : state.composition === "render" ? (
        <TreeGrid.Root {...props} render={(renderProps) => <table {...renderProps}>{content}</table>} />
      ) : (
        <TreeGrid.Root {...props}>{content}</TreeGrid.Root>
      )}
    </div>
  );
}

function renderTreeGridContent(scenario: ReturnType<typeof useTreeGridScenario>) {
  return (
    <>
      <TreeGrid.Caption data-playground-inspect="" data-tree-grid-caption="">Project tree</TreeGrid.Caption>
      <TreeGrid.Header data-playground-inspect="" data-tree-grid-header="">
        <TreeGrid.Row rowIndex={1} value="heading" selectable={false}>
          <TreeGrid.ColumnHeader columnIndex={1}>Task</TreeGrid.ColumnHeader>
          <TreeGrid.ColumnHeader columnIndex={2}>Owner</TreeGrid.ColumnHeader>
        </TreeGrid.Row>
      </TreeGrid.Header>
      <TreeGrid.Body data-playground-inspect="" data-tree-grid-body="">
        <TreeGrid.Row data-playground-inspect="" data-tree-grid-row="project" expandable level={1} rowIndex={2} value="project">
          <TreeGrid.RowHeader columnIndex={1} data-playground-inspect="" data-tree-grid-row-header="project">Project</TreeGrid.RowHeader>
          <TreeGrid.Cell columnIndex={2} data-playground-inspect="" data-tree-grid-cell="project-owner">Team</TreeGrid.Cell>
        </TreeGrid.Row>
        <TreeGrid.Row data-playground-inspect="" data-tree-grid-row="design" level={2} parentValue="project" rowIndex={3} value="design">
          <TreeGrid.RowHeader columnIndex={1} data-playground-inspect="" data-tree-grid-row-header="design">Design review</TreeGrid.RowHeader>
          <TreeGrid.Cell columnIndex={2} data-playground-inspect="" data-tree-grid-cell="design-owner">Ava</TreeGrid.Cell>
        </TreeGrid.Row>
        <TreeGrid.Row data-playground-inspect="" data-tree-grid-row="blocked" disabled={scenario.state.disableChild} level={2} parentValue="project" rowIndex={4} value="blocked">
          <TreeGrid.RowHeader columnIndex={1} data-playground-inspect="" data-tree-grid-row-header="blocked">Blocked task</TreeGrid.RowHeader>
          <TreeGrid.Cell columnIndex={2} data-playground-inspect="" data-tree-grid-cell="blocked-owner">Noah</TreeGrid.Cell>
        </TreeGrid.Row>
      </TreeGrid.Body>
    </>
  );
}

function FeedScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useFeedScenario> }) {
  const state = scenario.state;
  const props: any = {
    className: "playground-feed",
    "data-feed-root": "",
    "data-playground-inspect": "",
    ...partProps("root", { customSlot: state.customRootSlot, propCheck: state.propCheck }, "feed-custom"),
    busy: state.busy,
    setSize: state.setSize === "unknown" ? "unknown" as const : state.positionMode === "position" ? 100 : state.itemCount,
    ref: scenario.actions.markRootRef,
    onKeyDown: (event: any) => {
      scenario.actions.addLog(`feed keydown ${event.key}`);
      if (state.preventKeys) {
        event.preventDefault();
      }
    },
  };
  const children = feedItems.slice(0, state.itemCount).map((item, index) => {
    const itemProps: any = {
      className: "playground-feed-item",
      "data-feed-item": item.id,
      "data-playground-inspect": "",
      ...partProps("item", { customSlot: state.customItemSlot, propCheck: state.propCheck }, "feed-item-custom"),
      index: state.positionMode === "index" ? index : undefined,
      position: state.positionMode === "position" ? index + 11 : undefined,
      setSize: index === 0 && state.itemSetSize ? 10 : undefined,
      ref: index === 0 ? scenario.actions.markItemRef : undefined,
    };
    const content = (
      <>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
        <Button.Root className="playground-data-small-button" onPress={() => scenario.actions.addLog(`opened ${item.id}`)}>Open</Button.Root>
      </>
    );

    if (state.itemComposition === "asChild") {
      return (
        <Feed.Item {...itemProps} asChild key={item.id}>
          <article>{content}</article>
        </Feed.Item>
      );
    }

    if (state.itemComposition === "render") {
      return (
        <Feed.Item
          {...itemProps}
          key={item.id}
          render={(renderProps) => <section {...renderProps}>{content}</section>}
        />
      );
    }

    return <Feed.Item {...itemProps} key={item.id}>{content}</Feed.Item>;
  });
  const feed = state.composition === "asChild" ? (
    <Feed.Root {...props} asChild>
      <section>{children}</section>
    </Feed.Root>
  ) : state.composition === "render" ? (
    <Feed.Root {...props} render={(renderProps) => <section {...renderProps}>{children}</section>} />
  ) : (
    <Feed.Root {...props}>{children}</Feed.Root>
  );

  return (
    <div className="data-primitive-stage">
      <Button.Root className="playground-data-small-button">Before feed</Button.Root>
      <ScrollArea.Root className="playground-feed-scroll" orientation="vertical">
        <ScrollArea.Viewport className="playground-feed-scroll-viewport" aria-label="Feed preview">
          {feed}
        </ScrollArea.Viewport>
      </ScrollArea.Root>
      <Button.Root className="playground-data-small-button">After feed</Button.Root>
    </div>
  );
}

function ScrollAreaScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useScrollAreaScenario> }) {
  const state = scenario.state;
  const props: any = {
    className: "playground-scroll-area-demo",
    "data-scroll-area-root": "",
    "data-playground-inspect": "",
    ...partProps("root", { customSlot: state.customRootSlot, propCheck: state.propCheck }, "scroll-area-custom"),
    orientation: state.orientation,
    ref: scenario.actions.markRootRef,
  };
  const viewportProps: any = {
    className: "playground-scroll-area-viewport",
    "data-playground-inspect": "",
    "data-scroll-area-viewport": "",
    ...partProps("viewport", { customSlot: state.customViewportSlot, propCheck: state.propCheck }, "scroll-area-viewport-custom"),
    focusable: state.focusable,
    "aria-label": state.nameMode === "aria-label" ? "Scrollable project notes" : undefined,
    "aria-labelledby": state.nameMode === "aria-labelledby" ? "scroll-area-title" : undefined,
    role: state.roleMode === "auto" ? undefined : state.roleMode,
    ref: scenario.actions.markViewportRef,
    onScroll: () => scenario.actions.addLog("viewport scrolled"),
  };
  const content = (
    <div className={[
      "playground-scroll-area-content",
      state.longContent ? "long" : "",
      state.orientation !== "vertical" ? "wide" : "",
    ].filter(Boolean).join(" ")}>
      {scrollAreaItems.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  );
  const viewport = state.viewportComposition === "asChild" ? (
    <ScrollArea.Viewport {...viewportProps} asChild>
      <section>{content}</section>
    </ScrollArea.Viewport>
  ) : state.viewportComposition === "render" ? (
    <ScrollArea.Viewport {...viewportProps} render={(renderProps) => <section {...renderProps}>{content}</section>} />
  ) : (
    <ScrollArea.Viewport {...viewportProps}>{content}</ScrollArea.Viewport>
  );
  const label = state.nameMode === "aria-labelledby" ? (
    <span className="playground-scroll-area-label" id="scroll-area-title">Scrollable project notes</span>
  ) : null;

  return (
    <div className="data-primitive-stage scroll-area-stage">
      {state.composition === "asChild" ? (
        <ScrollArea.Root {...props} asChild>
          <section>{label}{viewport}</section>
        </ScrollArea.Root>
      ) : state.composition === "render" ? (
        <ScrollArea.Root {...props} render={(renderProps) => <section {...renderProps}>{label}{viewport}</section>} />
      ) : (
        <ScrollArea.Root {...props}>{label}{viewport}</ScrollArea.Root>
      )}
    </div>
  );
}

function FormScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useFormScenario> }) {
  const state = scenario.state;
  const validate = async () => {
    scenario.actions.setStatus(state.asyncValidation ? "validating" : "validating");
    scenario.actions.addLog(state.asyncValidation ? "async validation started" : "validation started");
    if (state.asyncValidation) {
      await new Promise((resolve) => window.setTimeout(resolve, 200));
    }
    const valid = state.validation !== "fail";
    scenario.actions.addLog(valid ? "validation passed" : "validation failed");
    if (!valid) {
      scenario.actions.setStatus("invalid");
    }
    return valid;
  };
  const props: any = {
    className: "playground-form-demo",
    name: "project-form",
    title: "Project form",
    "data-form-root": "",
    "data-playground-inspect": "",
    ...partProps("root", { customSlot: state.customRootSlot, propCheck: state.propCheck }, "form-custom"),
    ref: scenario.actions.markRootRef,
    preventDefaultOnSubmit: state.preventDefault,
    ...(state.validation !== "none" && { validateOnSubmit: validate }),
    onSubmit: (event: FormEvent<HTMLFormElement>) => {
      const wasDefaultPrevented = event.defaultPrevented;
      scenario.actions.setStatus("submitted");
      scenario.actions.addLog(`form submitted defaultPrevented ${bool(wasDefaultPrevented)} preventDefaultOnSubmit ${bool(state.preventDefault)}`);
      if (!event.defaultPrevented) {
        event.preventDefault();
        scenario.actions.addLog("playground prevented navigation");
      }
    },
    onReset: () => {
      scenario.actions.setProjectName("Atom");
      scenario.actions.setStatus("reset");
      scenario.actions.addLog("form reset");
    },
  };
  const children = (
    <>
      <label htmlFor="form-project-name">Project name</label>
      {state.controlType === "atom" ? (
        <Input.Root
          id="form-project-name"
          name="project"
          required
          value={state.projectName}
          onValueChange={scenario.actions.setProjectName}
          data-playground-inspect=""
          data-form-input=""
          data-prop-check="atom-input"
        />
      ) : (
        <input
          id="form-project-name"
          name="project"
          required
          value={state.projectName}
          onChange={(event) => scenario.actions.setProjectName(event.target.value)}
          data-playground-inspect=""
          data-form-input=""
          data-prop-check="native-input"
        />
      )}
      <div className="playground-form-actions">
        <Button.Root className="atom-button" type="submit" data-playground-inspect="" data-form-submit="">Submit</Button.Root>
        <Button.Root className="atom-button secondary" type="reset" data-playground-inspect="" data-form-reset="">Reset</Button.Root>
      </div>
    </>
  );

  return (
    <div className="data-primitive-stage">
      {state.composition === "asChild" ? (
        <Form.Root {...props} asChild>
          <form>{children}</form>
        </Form.Root>
      ) : state.composition === "render" ? (
        <Form.Root {...props} render={(renderProps) => <form {...renderProps}>{children}</form>} />
      ) : (
        <Form.Root {...props}>{children}</Form.Root>
      )}
    </div>
  );
}

function getDataPrimitiveSections(
  scenarioId: string,
  scenarios: DataPrimitiveScenarios,
): AnatomySection[] {
  if (scenarioId === "table") {
    const state = scenarios.table.state;
    return [
      section("Root", state.composition.root, "[data-table-root]", [
        row("Sort direction", formatTableSort(state.sortDirection), "state"),
        row("Footer", bool(state.footer), "state"),
        row("Composition", state.composition.root, "composition"),
        row("Ref target", state.refs.root, "identity"),
      ]),
      section("Caption", state.composition.caption, "[data-table-caption]", [
        row("Composition", state.composition.caption, "composition"),
        row("Ref target", state.refs.caption, "identity"),
      ]),
      section("Header", state.composition.header, "[data-table-header]", [
        row("Composition", state.composition.header, "composition"),
        row("Ref target", state.refs.header, "identity"),
      ]),
      section("Header Row", state.composition.headerRow, "[data-table-header-row]", [
        row("Composition", state.composition.headerRow, "composition"),
        row("Ref target", state.refs.headerRow, "identity"),
      ]),
      section("Head: Project", state.composition.head, "[data-table-head-name]", [
        row("Sort direction", formatTableSort(state.sortDirection), "state"),
        row("Composition", state.composition.head, "composition"),
        row("Ref target", state.refs.head, "identity"),
      ]),
      section("Head: Status", state.composition.head, "[data-table-head-status]", [
        row("Composition", state.composition.head, "composition"),
      ]),
      section("Head: Owner", state.composition.head, "[data-table-head='owner']", [
        row("Composition", state.composition.head, "composition"),
      ]),
      section("Body", state.composition.body, "[data-table-body]", [
        row("Composition", state.composition.body, "composition"),
        row("Ref target", state.refs.body, "identity"),
      ]),
      section("Row: Alpha", state.composition.bodyRow, "[data-table-row='alpha']", [
        row("Composition", state.composition.bodyRow, "composition"),
        row("Ref target", state.refs.bodyRow, "identity"),
      ]),
      section("Row Header: Alpha", state.composition.rowHead, "[data-table-row-head='alpha']", [
        row("Composition", state.composition.rowHead, "composition"),
        row("Ref target", state.refs.rowHead, "identity"),
      ]),
      section("Cell: Alpha Status", state.composition.cell, "[data-table-cell='alpha-status']", [
        row("Composition", state.composition.cell, "composition"),
        row("Ref target", state.refs.cell, "identity"),
      ]),
      section("Footer", state.footer ? state.composition.footer : "not rendered", "[data-table-footer]", [
        row("Composition", state.composition.footer, "composition"),
        row("Ref target", state.refs.footer, "identity"),
      ]),
      section("Footer Row", state.footer ? state.composition.footerRow : "not rendered", "[data-table-footer-row]", [
        row("Composition", state.composition.footerRow, "composition"),
        row("Ref target", state.refs.footerRow, "identity"),
      ]),
      section("Footer Cell", state.footer ? state.composition.footerCell : "not rendered", "[data-table-footer-cell]", [
        row("Composition", state.composition.footerCell, "composition"),
        row("Ref target", state.refs.footerCell, "identity"),
      ]),
    ];
  }

  if (scenarioId === "data-grid") {
    const state = scenarios.dataGrid.state;
    return [
      section("Root", state.selectionMode, "#playground-data-grid", [
        row("Selection mode", state.selectionMode, "state"),
        row("Selected", formatValue(state.selectedValue), "state"),
        row("Active cell", formatCell(state.activeCell), "state"),
        row("Disabled", bool(state.disabled), "state"),
        row("Read only", bool(state.readOnly), "state"),
        row("Loop", bool(state.loop), "behavior"),
        row("Wrap rows", bool(state.wrapRows), "behavior"),
        row("Select row on click", bool(state.selectOnRowClick), "behavior"),
        row("Composition", state.composition, "composition"),
      ]),
      section("Caption", "caption", "[data-data-grid-caption]"),
      section("Header", "header", "[data-data-grid-header]"),
      section("Column Header", "ascending", "[data-data-grid-column-header]"),
      section("Body", "body", "[data-data-grid-body]"),
      section("Row: Selected", formatValue(state.selectedValue), "[data-data-grid-row='alpha']"),
      section("Row: Disabled", state.disableRow ? "disabled" : "enabled", "[data-data-grid-row='blocked']"),
      section("Cell: Active", formatCell(state.activeCell), "[data-data-grid-cell='alpha-name']"),
      section("Footer", "footer", "[data-data-grid-footer]"),
    ];
  }

  if (scenarioId === "tree") {
    const state = scenarios.tree.state;
    return [
      section("Root", state.selectionMode, "[data-tree-root]", [
        row("Selected", formatValue(state.selectedValue), "state"),
        row("Expanded", state.expandedValue.join(",") || "none", "state"),
        row("Disabled", bool(state.disabled), "state"),
        row("Read only", bool(state.readOnly), "state"),
        row("Required", bool(state.required), "state"),
        row("Invalid", bool(state.invalid), "state"),
        row("Loop", bool(state.loop), "behavior"),
        row("Composition", state.composition, "composition"),
      ]),
      section("Item: Docs", state.expandedValue.includes("docs") ? "expanded" : "collapsed", "[data-tree-item='docs']"),
      section("Item Text: Docs", "label", "[data-tree-item-text='docs']"),
      section("Group: Docs", state.forceMount || state.expandedValue.includes("docs") ? "mounted" : "not rendered", "[data-tree-group='docs']"),
      section("Item: Guide", "child", "[data-tree-item='guide']"),
      section("Item: API", "disabled child", "[data-tree-item='api']"),
      section("Item: Components", state.expandedValue.includes("components") ? "expanded" : "collapsed", "[data-tree-item='components']"),
      section("Group: Components", state.forceMount || state.expandedValue.includes("components") ? "mounted" : "not rendered", "[data-tree-group='components']"),
      section("Hidden Input", "generated", "input[name='tree-selection']"),
    ];
  }

  if (scenarioId === "tree-grid") {
    const state = scenarios.treeGrid.state;
    return [
      section("Root", state.selectionMode, "#playground-tree-grid", [
        row("Selection mode", state.selectionMode, "state"),
        row("Selected", formatValue(state.selectedValue), "state"),
        row("Expanded", state.expandedValue.join(",") || "none", "state"),
        row("Active cell", formatCell(state.activeCell), "state"),
        row("Disabled", bool(state.disabled), "state"),
        row("Read only", bool(state.readOnly), "state"),
        row("Loop", bool(state.loop), "behavior"),
        row("Select row on click", bool(state.selectOnRowClick), "behavior"),
        row("Composition", state.composition, "composition"),
      ]),
      section("Caption", "caption", "[data-tree-grid-caption]"),
      section("Header", "header", "[data-tree-grid-header]"),
      section("Body", "body", "[data-tree-grid-body]"),
      section("Row: Parent", state.expandedValue.includes("project") ? "expanded" : "closed", "[data-tree-grid-row='project']"),
      section("Row Header", "toggles row", "[data-tree-grid-row-header='project']"),
      section("Row: Child", "visible when parent open", "[data-tree-grid-row='design']"),
      section("Row: Disabled Child", state.disableChild ? "disabled" : "enabled", "[data-tree-grid-row='blocked']"),
      section("Cell", "gridcell", "[data-tree-grid-cell='project-owner']"),
    ];
  }

  if (scenarioId === "feed") {
    const state = scenarios.feed.state;
    return [
      section("Root", state.busy ? "busy" : "ready", "[data-feed-root]", [
        row("Ref target", state.rootRef, "identity"),
        row("Busy", bool(state.busy), "state"),
        row("Set size", state.setSize, "state"),
        row("Item count", String(state.itemCount), "state"),
        row("Position mode", state.positionMode, "state"),
        row("Item set size override", bool(state.itemSetSize), "state"),
        row("Composition", state.composition, "composition"),
        row("Prevent key handling", bool(state.preventKeys), "behavior"),
      ]),
      section("Item: First", "article", "[data-feed-item='deploy']", [
        row("Ref target", state.itemRef, "identity"),
        row("Composition", state.itemComposition, "composition"),
      ]),
      section("Item: Last", `${state.itemCount} of ${state.setSize}`, `[data-feed-item='${feedItems[state.itemCount - 1]?.id ?? "deploy"}']`),
    ];
  }

  if (scenarioId === "scroll-area") {
    const state = scenarios.scrollArea.state;
    return [
      section("Root", state.orientation, "[data-scroll-area-root]", [
        row("Ref target", state.rootRef, "identity"),
        row("Orientation", state.orientation, "state"),
        row("Composition", state.composition, "composition"),
      ]),
      section("Viewport", state.focusable ? "focusable" : "not focusable", "[data-scroll-area-viewport]", [
        row("Ref target", state.viewportRef, "identity"),
        row("Focusable", bool(state.focusable), "behavior"),
        row("Composition", state.viewportComposition, "composition"),
        row("Role mode", state.roleMode, "behavior"),
        row("Name mode", state.nameMode, "behavior"),
      ]),
    ];
  }

  if (scenarioId === "form") {
    const state = scenarios.form.state;
    return [
      section("Root", state.status, "[data-form-root]", [
        row("Ref target", state.rootRef, "identity"),
        row("Status", state.status, "state"),
        row("preventDefaultOnSubmit", bool(state.preventDefault), "behavior"),
        row("Validation", state.validation, "behavior"),
        row("Async validation", bool(state.asyncValidation), "behavior"),
        row("Control", state.controlType, "behavior"),
        row("Composition", state.composition, "composition"),
      ]),
    ];
  }

  return [];
}

function getDataPrimitiveLog(scenarioId: string, scenarios: DataPrimitiveScenarios) {
  if (scenarioId === "table") return scenarios.table.state.log;
  if (scenarioId === "data-grid") return scenarios.dataGrid.state.log;
  if (scenarioId === "tree") return scenarios.tree.state.log;
  if (scenarioId === "tree-grid") return scenarios.treeGrid.state.log;
  if (scenarioId === "feed") return scenarios.feed.state.log;
  if (scenarioId === "scroll-area") return scenarios.scrollArea.state.log;
  if (scenarioId === "form") return scenarios.form.state.log;
  return [];
}

function getDataPrimitiveActions(scenarioId: string, scenarios: DataPrimitiveScenarios) {
  if (scenarioId === "table") return scenarios.table.actions;
  if (scenarioId === "data-grid") return scenarios.dataGrid.actions;
  if (scenarioId === "tree") return scenarios.tree.actions;
  if (scenarioId === "tree-grid") return scenarios.treeGrid.actions;
  if (scenarioId === "feed") return scenarios.feed.actions;
  if (scenarioId === "scroll-area") return scenarios.scrollArea.actions;
  if (scenarioId === "form") return scenarios.form.actions;
  return null;
}

function CompositionToolbarGroup({
  onChange,
  value,
}: {
  onChange: (value: CompositionMode) => void;
  value: CompositionMode;
}) {
  return (
    <ToolbarGroup title="Composition" value="composition">
      <MenuRadioControl
        label="Root"
        options={compositionOptions}
        value={value}
        onChange={(nextValue) => onChange(nextValue as CompositionMode)}
      />
    </ToolbarGroup>
  );
}

function TableCompositionToolbarGroup({
  composition,
  onChange,
}: {
  composition: Record<TablePartKey, CompositionMode>;
  onChange: (part: TablePartKey, value: CompositionMode) => void;
}) {
  return (
    <ToolbarGroup title="Composition" value="composition">
      {tableCompositionControls.map((control) => (
        <Menubar.Sub key={control.part}>
          <Menubar.SubTrigger className="toolbar-menu-item toolbar-submenu-trigger" value={control.part}>
            <span>{control.label}</span>
            <span className="toolbar-submenu-value">{formatCompositionMode(composition[control.part])}</span>
            <span className="toolbar-submenu-arrow" aria-hidden="true">›</span>
          </Menubar.SubTrigger>
          <Menubar.SubContent className="toolbar-menu" sideOffset={6}>
            <Menubar.RadioGroup
              className="toolbar-radio-group"
              value={composition[control.part]}
              onValueChange={(value) => onChange(control.part, value as CompositionMode)}
            >
              {compositionOptions.map((option) => (
                <Menubar.RadioItem
                  className="toolbar-menu-item"
                  key={option.value}
                  value={option.value}
                >
                  <span>{option.label}</span>
                  <span className="toolbar-menu-check" aria-hidden="true">
                    {composition[control.part] === option.value ? "✓" : ""}
                  </span>
                </Menubar.RadioItem>
              ))}
            </Menubar.RadioGroup>
          </Menubar.SubContent>
        </Menubar.Sub>
      ))}
    </ToolbarGroup>
  );
}

function section(title: string, summary: string, selector: string, rows: AnatomySection["rows"] = []): AnatomySection {
  return {
    inactive: summary === "not rendered",
    rows,
    selector,
    summary,
    title,
  };
}

function row(label: string, value: string, category: NonNullable<AnatomySection["rows"]>[number]["category"]) {
  return { label, value, category };
}

function bool(value: boolean) {
  return value ? "true" : "false";
}

function formatTableSort(value: TableSortDirection) {
  return value === "unset" ? "unset" : value;
}

function formatCompositionMode(value: CompositionMode) {
  if (value === "asChild") return "As Child";
  if (value === "render") return "Render";
  return "Default";
}

function formatRef(element: HTMLElement | null) {
  return element?.tagName.toLowerCase() ?? "none";
}

function formatValue(value: string | string[] | null) {
  if (Array.isArray(value)) return value.join(",") || "none";
  return value ?? "none";
}

function formatCell(cell: { rowIndex: number; columnIndex: number } | null) {
  return cell ? `${cell.rowIndex}:${cell.columnIndex}` : "none";
}

const selectionModeOptions = [
  { label: "None", value: "none" },
  { label: "Single", value: "single" },
  { label: "Multiple", value: "multiple" },
];

const treeSelectionOptions = [
  { label: "Single", value: "single" },
  { label: "Multiple", value: "multiple" },
];

const tableSortOptions = [
  { label: "Unset", value: "unset" },
  { label: "Ascending", value: "ascending" },
  { label: "Descending", value: "descending" },
  { label: "None", value: "none" },
  { label: "Other", value: "other" },
];

const tableParts = [
  "root",
  "caption",
  "header",
  "headerRow",
  "head",
  "body",
  "bodyRow",
  "rowHead",
  "cell",
  "footer",
  "footerRow",
  "footerCell",
] as const satisfies readonly TablePartKey[];

const tableDefaultComposition = Object.fromEntries(
  tableParts.map((part) => [part, "default"]),
) as Record<TablePartKey, CompositionMode>;

const tableDefaultCustomSlots = Object.fromEntries(
  tableParts.map((part) => [part, false]),
) as Record<TablePartKey, boolean>;

const tableDefaultRefs = Object.fromEntries(
  tableParts.map((part) => [part, "none"]),
) as Record<TablePartKey, string>;

const tableSlotValues: Record<TablePartKey, string> = {
  root: "table-custom",
  caption: "table-caption-custom",
  header: "table-header-custom",
  headerRow: "table-row-custom",
  head: "table-head-custom",
  body: "table-body-custom",
  bodyRow: "table-row-custom",
  rowHead: "table-head-custom",
  cell: "table-cell-custom",
  footer: "table-footer-custom",
  footerRow: "table-row-custom",
  footerCell: "table-cell-custom",
};

const tableNativeTags: Record<TablePartKey, string> = {
  root: "table",
  caption: "caption",
  header: "thead",
  headerRow: "tr",
  head: "th",
  body: "tbody",
  bodyRow: "tr",
  rowHead: "th",
  cell: "td",
  footer: "tfoot",
  footerRow: "tr",
  footerCell: "td",
};

const tableCompositionControls: Array<{ label: string; part: TablePartKey }> = [
  { label: "Root", part: "root" },
  { label: "Caption", part: "caption" },
  { label: "Header", part: "header" },
  { label: "Header Row", part: "headerRow" },
  { label: "Head", part: "head" },
  { label: "Body", part: "body" },
  { label: "Body Row", part: "bodyRow" },
  { label: "Row Head", part: "rowHead" },
  { label: "Cell", part: "cell" },
  { label: "Footer", part: "footer" },
  { label: "Footer Row", part: "footerRow" },
  { label: "Footer Cell", part: "footerCell" },
];

const tableSlotControls = tableCompositionControls.map((control) => ({
  ...control,
  label: `${control.label} Slot`,
  value: `${control.part}-slot`,
}));

const compositionOptions = [
  { label: "Default", value: "default" },
  { label: "As Child", value: "asChild" },
  { label: "Render", value: "render" },
];

const feedSizeOptions = [
  { label: "Known", value: "known" },
  { label: "Unknown", value: "unknown" },
];

const feedPositionOptions = [
  { label: "Index", value: "index" },
  { label: "Position", value: "position" },
];

const feedCountOptions = [
  { label: "Two", value: "2" },
  { label: "Three", value: "3" },
  { label: "Four", value: "4" },
];

const scrollOrientationOptions = [
  { label: "Vertical", value: "vertical" },
  { label: "Horizontal", value: "horizontal" },
  { label: "Both", value: "both" },
];

const scrollAreaNameOptions = [
  { label: "None", value: "none" },
  { label: "ARIA label", value: "aria-label" },
  { label: "ARIA labelledby", value: "aria-labelledby" },
];

const scrollAreaRoleOptions = [
  { label: "Auto", value: "auto" },
  { label: "Region", value: "region" },
  { label: "Group", value: "group" },
];

const formControlOptions = [
  { label: "Native", value: "native" },
  { label: "Atom", value: "atom" },
];

const dataGridRows = [
  { value: "alpha", name: "Alpha", status: "Ready" },
  { value: "blocked", name: "Blocked", status: "Paused" },
];

const tableRows = [
  { id: "alpha", name: "Alpha", owner: "Ava", status: "Ready" },
  { id: "billing", name: "Billing", owner: "Noah", status: "Review" },
  { id: "design", name: "Design", owner: "Mia", status: "Blocked" },
];

const feedItems = [
  { id: "deploy", title: "Deploy reviewed", body: "Production checklist was reviewed by operations." },
  { id: "billing", title: "Billing updated", body: "Invoices are ready for export." },
  { id: "design", title: "Design feedback", body: "The prototype needs one more review." },
  { id: "support", title: "Support queue", body: "Two requests were resolved this morning." },
];

const scrollAreaItems = [
  "Project notes use enough content to create an actual scrollable region.",
  "Keyboard access should follow the focusable viewport option.",
  "The region role should only appear when an accessible name exists.",
  "Horizontal content is intentionally wide when orientation allows it.",
  "This line helps verify bottom scrolling and inspector updates.",
];
