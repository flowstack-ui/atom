import { Button } from "@flowstack-ui/atom/button";
import { DataGrid } from "@flowstack-ui/atom/data-grid";
import { Direction } from "@flowstack-ui/atom/direction";
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
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup, partProps } from "../WorkbenchPrimitives";

type CompositionMode = "default" | "asChild" | "render";
type SelectionMode = "none" | "single" | "multiple";
type ScrollOrientation = "vertical" | "horizontal" | "both";
type ScrollAreaNameMode = "none" | "aria-label" | "aria-labelledby";
type ScrollAreaRoleMode = "auto" | "region" | "group";
type FeedSize = "known" | "unknown";
type FeedPositionMode = "index" | "position";
type TableSortDirection = "unset" | "ascending" | "descending" | "none" | "other";
type DataGridStateMode = "uncontrolled" | "controlled";
type DataGridDirectionMode = "default" | "provider-rtl" | "local-ltr" | "local-rtl";
type DataGridPartKey = "root" | "caption" | "header" | "row" | "columnHeader" | "body" | "cell" | "footer";
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
type TreeStateMode = "uncontrolled" | "controlled";
type TreeOrientation = "vertical" | "horizontal";
type TreeDirectionMode = "default" | "provider-rtl" | "local-ltr" | "local-rtl";
type TreePartKey = "root" | "item" | "itemText" | "group";
type TreeGridStateMode = "uncontrolled" | "controlled";
type TreeGridDirectionMode = "default" | "provider-rtl" | "local-ltr" | "local-rtl";
type TreeGridPartKey = "root" | "caption" | "header" | "row" | "columnHeader" | "body" | "rowHeader" | "cell" | "footer";
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
  const [stateMode, setStateMode] = useState<DataGridStateMode>("uncontrolled");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("none");
  const [selectedValue, setSelectedValue] = useState<string | string[] | null>(null);
  const [activeCell, setActiveCell] = useState<{ rowIndex: number; columnIndex: number } | null>(null);
  const [defaultSelected, setDefaultSelected] = useState(false);
  const [defaultActive, setDefaultActive] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [loop, setLoop] = useState(false);
  const [wrapRows, setWrapRows] = useState(false);
  const [selectOnRowClick, setSelectOnRowClick] = useState(false);
  const [disableRow, setDisableRow] = useState(false);
  const [disableCell, setDisableCell] = useState(false);
  const [counts, setCounts] = useState(false);
  const [sortDirection, setSortDirection] = useState<TableSortDirection>("unset");
  const [directionMode, setDirectionMode] = useState<DataGridDirectionMode>("default");
  const [composition, setComposition] = useState<Record<DataGridPartKey, CompositionMode>>(dataGridDefaultComposition);
  const [propCheck, setPropCheck] = useState(false);
  const [customSlots, setCustomSlots] = useState<Record<DataGridPartKey, boolean>>(dataGridDefaultCustomSlots);
  const [refs, setRefs] = useState<Record<DataGridPartKey, string>>(dataGridDefaultRefs);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleStateMode = (mode: DataGridStateMode) => {
    setStateMode(mode);
    setSelectedValue(mode === "uncontrolled" && defaultSelected ? "alpha" : selectionMode === "multiple" ? [] : null);
    setActiveCell(mode === "uncontrolled" && defaultActive ? { rowIndex: 2, columnIndex: 1 } : null);
  };
  const handleSelectionMode = (mode: SelectionMode) => {
    setSelectionMode(mode);
    setSelectedValue(mode === "multiple" ? [] : null);
    setDefaultSelected(false);
  };
  const handleDefaultSelected = (checked: boolean) => {
    setDefaultSelected(checked);
    if (stateMode === "uncontrolled") setSelectedValue(checked ? "alpha" : selectionMode === "multiple" ? [] : null);
  };
  const handleDefaultActive = (checked: boolean) => {
    setDefaultActive(checked);
    if (stateMode === "uncontrolled") setActiveCell(checked ? { rowIndex: 2, columnIndex: 1 } : null);
  };
  const setControlledValue = (value: string) => {
    if (selectionMode === "multiple") {
      setSelectedValue(value === "none" ? [] : value === "alpha-bravo" ? ["alpha", "bravo"] : [value]);
      return;
    }
    setSelectedValue(value === "none" ? null : value);
  };
  const setControlledActiveCell = (value: string) => {
    if (value === "none") {
      setActiveCell(null);
      return;
    }
    const [rowIndex, columnIndex] = value.split(":").map(Number);
    setActiveCell({ rowIndex, columnIndex });
  };
  const setCustomSlot = (part: DataGridPartKey, checked: boolean) => {
    setCustomSlots((current) => ({ ...current, [part]: checked }));
  };
  const setPartComposition = (part: DataGridPartKey, value: CompositionMode) => {
    setComposition((current) => ({ ...current, [part]: value }));
  };
  const markPartRef = useCallback((part: DataGridPartKey, element: HTMLElement | null) => {
    if (!element) return;
    const nextRef = formatRef(element);
    setRefs((current) => current[part] === nextRef ? current : { ...current, [part]: nextRef });
  }, []);

  return {
    state: { stateMode, selectionMode, selectedValue, activeCell, defaultSelected, defaultActive, disabled, readOnly, loop, wrapRows, selectOnRowClick, disableRow, disableCell, counts, sortDirection, directionMode, composition, propCheck, customSlots, refs, log },
    actions: {
      setStateMode: handleStateMode,
      setSelectionMode: handleSelectionMode,
      setSelectedValue,
      setControlledValue,
      setActiveCell,
      setControlledActiveCell,
      setDefaultSelected: handleDefaultSelected,
      setDefaultActive: handleDefaultActive,
      setDisabled,
      setReadOnly,
      setLoop,
      setWrapRows,
      setSelectOnRowClick,
      setDisableRow,
      setDisableCell,
      setCounts,
      setSortDirection,
      setDirectionMode,
      setPartComposition,
      setPropCheck,
      setCustomSlot,
      markPartRef,
      clearLog,
      addLog,
    },
  };
}

function useTreeScenario() {
  const [stateMode, setStateMode] = useState<TreeStateMode>("uncontrolled");
  const [selectionMode, setSelectionMode] = useState<TreeSelectionMode>("single");
  const [selectedValue, setSelectedValue] = useState<string | string[] | null>(null);
  const [expandedValue, setExpandedValue] = useState<string[]>([]);
  const [defaultSelected, setDefaultSelected] = useState(false);
  const [defaultExpanded, setDefaultExpanded] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [orientation, setOrientation] = useState<TreeOrientation>("vertical");
  const [loop, setLoop] = useState(true);
  const [directionMode, setDirectionMode] = useState<TreeDirectionMode>("default");
  const [forceMount, setForceMount] = useState(false);
  const [disableItem, setDisableItem] = useState(false);
  const [formName, setFormName] = useState(false);
  const [composition, setComposition] = useState<Record<TreePartKey, CompositionMode>>(treeDefaultComposition);
  const [propCheck, setPropCheck] = useState(false);
  const [customSlots, setCustomSlots] = useState<Record<TreePartKey, boolean>>(treeDefaultCustomSlots);
  const [refs, setRefs] = useState<Record<TreePartKey, string>>(treeDefaultRefs);
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
    setSelectedValue(value === "multiple" ? [] : null);
    setDefaultSelected(false);
  };

  const handleStateMode = (value: TreeStateMode) => {
    setStateMode(value);
    setSelectedValue(value === "controlled" ? (selectionMode === "multiple" ? [] : null) : defaultSelected ? "docs" : null);
    setExpandedValue(defaultExpanded ? ["docs"] : []);
  };

  const handleDefaultSelected = (checked: boolean) => {
    setDefaultSelected(checked);
    if (stateMode === "uncontrolled") {
      setSelectedValue(checked ? "docs" : selectionMode === "multiple" ? [] : null);
    }
  };

  const handleDefaultExpanded = (checked: boolean) => {
    setDefaultExpanded(checked);
    if (stateMode === "uncontrolled") {
      setExpandedValue(checked ? ["docs"] : []);
    }
  };

  const setPartComposition = (part: TreePartKey, value: CompositionMode) => {
    setComposition((current) => ({ ...current, [part]: value }));
  };

  const setCustomSlot = (part: TreePartKey, value: boolean) => {
    setCustomSlots((current) => ({ ...current, [part]: value }));
  };

  const markPartRef = useCallback((part: TreePartKey, element: HTMLElement | null) => {
    if (!element) return;
    const nextRef = formatRef(element);
    setRefs((current) => {
      if (current[part] === nextRef) return current;
      return { ...current, [part]: nextRef };
    });
  }, []);

  const setControlledValue = (value: string) => {
    if (selectionMode === "multiple") {
      setSelectedValue(value === "none" ? [] : value === "docs-components" ? ["docs", "components"] : [value]);
      return;
    }
    setSelectedValue(value === "none" ? null : value);
  };

  return {
    state: {
      stateMode,
      selectionMode,
      selectedValue,
      expandedValue,
      defaultSelected,
      defaultExpanded,
      disabled,
      readOnly,
      required,
      invalid,
      orientation,
      loop,
      directionMode,
      forceMount,
      disableItem,
      formName,
      composition,
      propCheck,
      customSlots,
      refs,
      log,
    },
    actions: {
      setStateMode: handleStateMode,
      setSelectionMode: handleSelectionMode,
      setSelectedValue,
      setControlledValue,
      setExpandedValue,
      setDefaultSelected: handleDefaultSelected,
      setDefaultExpanded: handleDefaultExpanded,
      setDisabled,
      setReadOnly,
      setRequired,
      setInvalid,
      setOrientation,
      setLoop,
      setDirectionMode,
      setForceMount,
      setDisableItem,
      setFormName,
      setPartComposition,
      setPropCheck,
      setCustomSlot,
      markPartRef,
      handleValueChange,
      handleExpandedValueChange,
      clearLog,
    },
  };
}

function useTreeGridScenario() {
  const [stateMode, setStateMode] = useState<TreeGridStateMode>("uncontrolled");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("none");
  const [selectedValue, setSelectedValue] = useState<string | string[] | null>(null);
  const [expandedValue, setExpandedValue] = useState<string[]>([]);
  const [activeCell, setActiveCell] = useState<{ rowIndex: number; columnIndex: number } | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [loop, setLoop] = useState(false);
  const [selectOnRowClick, setSelectOnRowClick] = useState(false);
  const [disableChild, setDisableChild] = useState(false);
  const [counts, setCounts] = useState(false);
  const [sortDirection, setSortDirection] = useState<TableSortDirection>("unset");
  const [directionMode, setDirectionMode] = useState<TreeGridDirectionMode>("default");
  const [composition, setComposition] = useState<Record<TreeGridPartKey, CompositionMode>>(treeGridDefaultComposition);
  const [propCheck, setPropCheck] = useState(false);
  const [customSlots, setCustomSlots] = useState<Record<TreeGridPartKey, boolean>>(treeGridDefaultCustomSlots);
  const [refs, setRefs] = useState<Record<TreeGridPartKey, string>>(treeGridDefaultRefs);
  const { log, addLog, clearLog } = useScenarioLog();

  const handleSelectionMode = (mode: SelectionMode) => {
    setSelectionMode(mode);
    setSelectedValue(mode === "multiple" ? [] : null);
  };
  const setControlledValue = (value: string) => {
    if (selectionMode === "multiple") {
      setSelectedValue(value === "none" ? [] : value === "project-design" ? ["project", "design"] : [value]);
      return;
    }
    setSelectedValue(value === "none" ? null : value);
  };
  const setCustomSlot = (part: TreeGridPartKey, checked: boolean) => {
    setCustomSlots((current) => ({ ...current, [part]: checked }));
  };
  const setPartComposition = (part: TreeGridPartKey, value: CompositionMode) => {
    setComposition((current) => ({ ...current, [part]: value }));
  };
  const markPartRef = useCallback((part: TreeGridPartKey, element: HTMLElement | null) => {
    if (!element) return;
    const nextRef = formatRef(element);
    setRefs((current) => current[part] === nextRef ? current : { ...current, [part]: nextRef });
  }, []);

  return {
    state: { stateMode, selectionMode, selectedValue, expandedValue, activeCell, disabled, readOnly, loop, selectOnRowClick, disableChild, counts, sortDirection, directionMode, composition, propCheck, customSlots, refs, log },
    actions: {
      setStateMode,
      setSelectionMode: handleSelectionMode,
      setSelectedValue,
      setControlledValue,
      setExpandedValue,
      setActiveCell,
      setDisabled,
      setReadOnly,
      setLoop,
      setSelectOnRowClick,
      setDisableChild,
      setCounts,
      setSortDirection,
      setDirectionMode,
      setPartComposition,
      setPropCheck,
      setCustomSlot,
      markPartRef,
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
          <MenuSection label="Control Mode">
            <MenuRadioControl label="State mode" options={treeGridStateModeOptions} value={scenario.state.stateMode} onChange={(value) => scenario.actions.setStateMode(value as DataGridStateMode)} />
            <MenuRadioControl label="Selection" options={selectionModeOptions} value={scenario.state.selectionMode} onChange={(value) => scenario.actions.setSelectionMode(value as SelectionMode)} />
          </MenuSection>
          {scenario.state.stateMode === "controlled" ? (
            <MenuSection label="Controlled Values">
              {scenario.state.selectionMode !== "none" ? (
                <MenuRadioControl label="Selected row" options={scenario.state.selectionMode === "multiple" ? dataGridMultipleValueOptions : dataGridSingleValueOptions} value={controlledDataGridValueOption(scenario.state.selectedValue)} onChange={scenario.actions.setControlledValue} />
              ) : null}
              <MenuRadioControl label="Active cell" options={dataGridActiveCellOptions} value={formatCell(scenario.state.activeCell)} onChange={scenario.actions.setControlledActiveCell} />
            </MenuSection>
          ) : (
            <MenuSection label="Initial Defaults">
              {scenario.state.selectionMode !== "none" ? <MenuCheckboxControl checked={scenario.state.defaultSelected} label="Default selected row" value="default-selected" onChange={scenario.actions.setDefaultSelected} /> : null}
              <MenuCheckboxControl checked={scenario.state.defaultActive} label="Default active cell" value="default-active" onChange={scenario.actions.setDefaultActive} />
            </MenuSection>
          )}
          <MenuSection label="State Flags">
            <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
            <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
            <MenuCheckboxControl checked={scenario.state.selectOnRowClick} label="Select row on click" value="select-row" onChange={scenario.actions.setSelectOnRowClick} />
          </MenuSection>
        </ToolbarGroup>
        <ToolbarGroup title="Navigation" value="navigation">
          <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          <MenuCheckboxControl checked={scenario.state.wrapRows} label="Wrap rows" value="wrap-rows" onChange={scenario.actions.setWrapRows} />
          <MenuCheckboxControl checked={scenario.state.disableRow} label="Disable row" value="disabled-row" onChange={scenario.actions.setDisableRow} />
          <MenuCheckboxControl checked={scenario.state.disableCell} label="Disable cell" value="disabled-cell" onChange={scenario.actions.setDisableCell} />
          <MenuCheckboxControl checked={scenario.state.counts} label="Row and column counts" value="counts" onChange={scenario.actions.setCounts} />
          <MenuRadioControl label="Status sort" options={tableSortOptions} value={scenario.state.sortDirection} onChange={(value) => scenario.actions.setSortDirection(value as TableSortDirection)} />
          <MenuRadioControl label="Direction" options={treeDirectionOptions} value={scenario.state.directionMode} onChange={(value) => scenario.actions.setDirectionMode(value as DataGridDirectionMode)} />
        </ToolbarGroup>
        <DataGridCompositionToolbarGroup composition={scenario.state.composition} onChange={scenario.actions.setPartComposition} />
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={dataGridSlotControls.map((control) => ({
            checked: scenario.state.customSlots[control.part],
            label: control.label,
            value: control.value,
            onChange: (checked) => scenario.actions.setCustomSlot(control.part, checked),
          }))}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "tree") {
    const scenario = scenarios.tree;
    return (
      <ControlToolbar label="Tree controls">
        <ToolbarGroup title="State" value="state">
          <MenuSection label="Control Mode">
            <MenuRadioControl label="Mode" options={treeStateModeOptions} value={scenario.state.stateMode} onChange={(value) => scenario.actions.setStateMode(value as TreeStateMode)} />
            <MenuRadioControl label="Selection" options={treeSelectionOptions} value={scenario.state.selectionMode} onChange={(value) => scenario.actions.setSelectionMode(value as TreeSelectionMode)} />
          </MenuSection>
          <MenuSection label={scenario.state.stateMode === "controlled" ? "Controlled Values" : "Initial Defaults"}>
            {scenario.state.stateMode === "controlled" ? (
              <>
                <MenuRadioControl label="Value" options={treeValueOptions} value={controlledTreeValueOption(scenario.state.selectedValue)} onChange={(value) => scenario.actions.setControlledValue(value)} />
                <MenuCheckboxControl checked={scenario.state.expandedValue.includes("docs")} label="Expanded" value="controlled-expanded" onChange={(checked) => scenario.actions.setExpandedValue(checked ? ["docs"] : [])} />
              </>
            ) : (
              <>
                <MenuCheckboxControl checked={scenario.state.defaultSelected} label="Default Selected" value="default-selected" onChange={scenario.actions.setDefaultSelected} />
                <MenuCheckboxControl checked={scenario.state.defaultExpanded} label="Default Expanded" value="default-expanded" onChange={scenario.actions.setDefaultExpanded} />
              </>
            )}
          </MenuSection>
          <MenuSection label="State Flags">
            <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
            <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
            <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
            <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
          </MenuSection>
        </ToolbarGroup>
        <ToolbarGroup title="Tree" value="tree">
          <MenuRadioControl label="Orientation" options={treeOrientationOptions} value={scenario.state.orientation} onChange={(value) => scenario.actions.setOrientation(value as TreeOrientation)} />
          <MenuRadioControl label="Direction" options={treeDirectionOptions} value={scenario.state.directionMode} onChange={(value) => scenario.actions.setDirectionMode(value as TreeDirectionMode)} />
          <MenuSection label="Behavior">
            <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          </MenuSection>
          <MenuSection label="Items">
            <MenuCheckboxControl checked={scenario.state.disableItem} label="Disable Item" value="disable-item" onChange={scenario.actions.setDisableItem} />
          </MenuSection>
          <MenuSection label="Groups">
            <MenuCheckboxControl checked={scenario.state.forceMount} label="Force mount group" value="force-mount" onChange={scenario.actions.setForceMount} />
          </MenuSection>
          <MenuSection label="Form">
            <MenuCheckboxControl checked={scenario.state.formName} label="Form Name" value="form-name" onChange={scenario.actions.setFormName} />
          </MenuSection>
        </ToolbarGroup>
        <TreeCompositionToolbarGroup composition={scenario.state.composition} onChange={scenario.actions.setPartComposition} />
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={treeSlotControls.map((control) => ({
            checked: scenario.state.customSlots[control.part],
            label: control.label,
            value: control.value,
            onChange: (checked) => scenario.actions.setCustomSlot(control.part, checked),
          }))}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "tree-grid") {
    const scenario = scenarios.treeGrid;
    return (
      <ControlToolbar label="Tree Grid controls">
        <ToolbarGroup title="State" value="state">
          <MenuSection label="Control Mode">
            <MenuRadioControl label="State mode" options={treeGridStateModeOptions} value={scenario.state.stateMode} onChange={(value) => scenario.actions.setStateMode(value as TreeGridStateMode)} />
            <MenuRadioControl label="Selection" options={selectionModeOptions} value={scenario.state.selectionMode} onChange={(value) => scenario.actions.setSelectionMode(value as SelectionMode)} />
          </MenuSection>
          {scenario.state.stateMode === "controlled" && scenario.state.selectionMode !== "none" ? (
            <MenuSection label="Controlled Values">
              <MenuRadioControl
                label="Selected row"
                options={scenario.state.selectionMode === "multiple" ? treeGridMultipleValueOptions : treeGridSingleValueOptions}
                value={controlledTreeGridValueOption(scenario.state.selectedValue)}
                onChange={scenario.actions.setControlledValue}
              />
            </MenuSection>
          ) : null}
          <MenuSection label="State Flags">
            <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
            <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
            <MenuCheckboxControl checked={scenario.state.selectOnRowClick} label="Select row on click" value="select-row" onChange={scenario.actions.setSelectOnRowClick} />
          </MenuSection>
        </ToolbarGroup>
        {scenario.state.stateMode === "controlled" && controlledTreeGridValueOption(scenario.state.selectedValue) !== "none" ? (
          <Button.Root className="toolbar-group-trigger" onPress={() => scenario.actions.setControlledValue("none")}>
            Clear Selection
          </Button.Root>
        ) : null}
        <ToolbarGroup title="Tree" value="tree">
          {scenario.state.stateMode === "controlled" ? <MenuCheckboxControl checked={scenario.state.expandedValue.includes("project")} label="Project expanded" value="project-expanded" onChange={(checked) => scenario.actions.setExpandedValue(checked ? ["project"] : [])} /> : null}
          <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          <MenuCheckboxControl checked={scenario.state.disableChild} label="Disabled child row" value="disabled-child" onChange={scenario.actions.setDisableChild} />
          <MenuCheckboxControl checked={scenario.state.counts} label="Row and column counts" value="counts" onChange={scenario.actions.setCounts} />
          <MenuRadioControl label="Owner sort" options={tableSortOptions} value={scenario.state.sortDirection} onChange={(value) => scenario.actions.setSortDirection(value as TableSortDirection)} />
          <MenuRadioControl label="Direction" options={treeDirectionOptions} value={scenario.state.directionMode} onChange={(value) => scenario.actions.setDirectionMode(value as TreeGridDirectionMode)} />
        </ToolbarGroup>
        <TreeGridCompositionToolbarGroup composition={scenario.state.composition} onChange={scenario.actions.setPartComposition} />
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={treeGridSlotControls.map((control) => ({
            checked: scenario.state.customSlots[control.part],
            label: control.label,
            value: control.value,
            onChange: (checked) => scenario.actions.setCustomSlot(control.part, checked),
          }))}
        />
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
    return `${state.stateMode} ${state.selectionMode} | Selected ${formatValue(state.selectedValue)} | Active ${formatCell(state.activeCell)} | ${state.directionMode}`;
  }

  if (scenarioId === "tree") {
    const state = scenarios.tree.state;
    return `${state.stateMode} ${state.selectionMode} | Selected ${formatValue(state.selectedValue)} | Expanded ${state.expandedValue.join(",") || "none"} | ${state.directionMode}`;
  }

  if (scenarioId === "tree-grid") {
    const state = scenarios.treeGrid.state;
    return `${state.stateMode} ${state.selectionMode} | Selected ${formatValue(state.selectedValue)} | Expanded ${state.expandedValue.join(",") || "none"} | Active ${formatCell(state.activeCell)} | ${state.directionMode}`;
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
    return getDataGridSource(scenarios?.dataGrid.state);
  }

  if (scenarioId === "tree") {
    return getTreeSource(scenarios?.tree.state);
  }

  if (scenarioId === "tree-grid") {
    return getTreeGridSource(scenarios?.treeGrid.state);
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

function treePartProps(part: TreePartKey, state: ReturnType<typeof useTreeScenario>["state"]) {
  return partProps(part, {
    propCheck: state.propCheck,
    customSlot: state.customSlots[part],
  }, treeSlotValues[part]);
}

function getTreeRootDirection(directionMode: TreeDirectionMode): "ltr" | "rtl" | undefined {
  if (directionMode === "local-ltr") return "ltr";
  if (directionMode === "local-rtl") return "rtl";
  return undefined;
}

function shouldWrapTreeDirectionProvider(directionMode: TreeDirectionMode) {
  return directionMode === "provider-rtl" || directionMode === "local-ltr";
}

function controlledTreeValueOption(value: string | string[] | null) {
  if (Array.isArray(value)) {
    if (value.includes("docs") && value.includes("components")) return "docs-components";
    return value[0] ?? "none";
  }
  return value ?? "none";
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

function getTreeSource(inputState?: ReturnType<typeof useTreeScenario>["state"]) {
  const state = inputState ?? {
    stateMode: "uncontrolled" as TreeStateMode,
    selectionMode: "single" as TreeSelectionMode,
    selectedValue: null as string | string[] | null,
    expandedValue: [] as string[],
    defaultSelected: false,
    defaultExpanded: false,
    disabled: false,
    readOnly: false,
    required: false,
    invalid: false,
    orientation: "vertical" as TreeOrientation,
    loop: true,
    directionMode: "default" as TreeDirectionMode,
    forceMount: false,
    disableItem: false,
    formName: false,
    composition: treeDefaultComposition,
    propCheck: false,
    customSlots: treeDefaultCustomSlots,
    refs: treeDefaultRefs,
    log: [],
  };
  const rootProps = sourceTreePartProps("root", state, [
    `aria-label="Documentation tree"`,
    state.stateMode === "controlled" ? `value={value}` : null,
    state.stateMode === "controlled" ? `expandedValue={expandedValue}` : null,
    state.stateMode === "controlled" ? `onValueChange={setValue}` : null,
    state.stateMode === "controlled" ? `onExpandedValueChange={setExpandedValue}` : null,
    state.stateMode === "uncontrolled" && state.defaultSelected
      ? state.selectionMode === "multiple" ? `defaultValue={["docs"]}` : `defaultValue="docs"`
      : null,
    state.stateMode === "uncontrolled" && state.defaultExpanded ? `defaultExpandedValue={["docs"]}` : null,
    state.selectionMode === "multiple" ? "multiple" : null,
    state.disabled ? "disabled" : null,
    state.readOnly ? "readOnly" : null,
    state.required ? "required" : null,
    state.invalid ? "invalid" : null,
    state.orientation !== "vertical" ? `orientation="${state.orientation}"` : null,
    state.loop === false ? `loop={false}` : null,
    getTreeRootDirection(state.directionMode) ? `dir="${getTreeRootDirection(state.directionMode)}"` : null,
    state.formName ? `name="tree-selection"` : null,
  ]);
  const root = sourceTreeElement("Root", "root", state.composition.root, rootProps, sourceTreeContent(state, 2), 0);

  return shouldWrapTreeDirectionProvider(state.directionMode)
    ? `<Direction.Provider dir="rtl">\n${indentSource(root, 2)}\n</Direction.Provider>`
    : root;
}

function sourceTreeContent(state: ReturnType<typeof useTreeScenario>["state"], depth: number) {
  const itemProps = sourceTreePartProps("item", state, [`value="docs"`, "expandable"]);
  const itemTextProps = sourceTreePartProps("itemText", state);
  const groupProps = sourceTreePartProps("group", state, [state.forceMount ? "forceMount" : null]);
  const guideProps = sourceTreePartProps("item", state, [`value="guide"`]);
  const apiProps = sourceTreePartProps("item", state, [`value="api"`, state.disableItem ? "disabled" : null]);
  const itemText = sourceTreeElement("ItemText", "itemText", state.composition.itemText, itemTextProps, "Docs", depth + 2);
  const guide = sourceTreeElement("Item", "item", state.composition.item, guideProps, sourceTreeElement("ItemText", "itemText", state.composition.itemText, itemTextProps, "Guide", depth + 4), depth + 4);
  const api = sourceTreeElement("Item", "item", state.composition.item, apiProps, sourceTreeElement("ItemText", "itemText", state.composition.itemText, itemTextProps, "API", depth + 4), depth + 4);
  const group = sourceTreeElement("Group", "group", state.composition.group, groupProps, `${guide}\n${api}`, depth + 2);
  return sourceTreeElement("Item", "item", state.composition.item, itemProps, `${itemText}\n${group}`, depth);
}

function sourceTreePartProps(
  part: TreePartKey,
  state: Pick<ReturnType<typeof useTreeScenario>["state"], "customSlots" | "propCheck">,
  extraProps: Array<string | null> = [],
) {
  return [
    ...extraProps,
    state.customSlots[part] ? `data-slot="${treeSlotValues[part]}"` : null,
    state.propCheck ? `data-prop-check="${part}"` : null,
  ].filter(Boolean) as string[];
}

function sourceTreeElement(
  component: "Root" | "Item" | "ItemText" | "Group",
  part: TreePartKey,
  composition: CompositionMode,
  props: string[],
  children: string,
  depth: number,
) {
  const pad = " ".repeat(depth);
  const propText = props.length ? ` ${props.join(" ")}` : "";
  const childTag = part === "root" ? "section" : part === "itemText" ? "span" : "div";

  if (composition === "asChild") {
    return `${pad}<Tree.${component}${propText} asChild>
${pad}  <${childTag}>
${indentSource(children, depth + 4)}
${pad}  </${childTag}>
${pad}</Tree.${component}>`;
  }

  if (composition === "render") {
    if (component === "ItemText") {
      return `${pad}<Tree.ItemText${propText} render={(props) => <span {...props}>${children}</span>} />`;
    }

    return `${pad}<Tree.${component}${propText}
${pad}  render={(props) => (
${pad}    <${childTag} {...props}>
${indentSource(children, depth + 6)}
${pad}    </${childTag}>
${pad}  )}
${pad}/>`;
  }

  if (component === "ItemText") {
    return `${pad}<Tree.ItemText${propText}>${children}</Tree.ItemText>`;
  }

  return `${pad}<Tree.${component}${propText}>
${indentSource(children, depth + 2)}
${pad}</Tree.${component}>`;
}

function indentSource(source: string, spaces: number) {
  const pad = " ".repeat(spaces);
  return source.split("\n").map((line) => (line ? `${pad}${line}` : line)).join("\n");
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
    ref: (element: HTMLElement | null) => scenario.actions.markPartRef("root", element),
    ...dataGridPartProps("root", state),
    selectionMode: state.selectionMode === "none" ? undefined : state.selectionMode,
    disabled: state.disabled || undefined,
    readOnly: state.readOnly || undefined,
    loop: state.loop || undefined,
    wrapRows: state.wrapRows || undefined,
    dir: state.directionMode === "local-ltr" ? "ltr" : state.directionMode === "local-rtl" ? "rtl" : undefined,
    rowCount: state.counts ? 5 : undefined,
    columnCount: state.counts ? 2 : undefined,
    selectOnRowClick: state.selectOnRowClick || undefined,
    onValueChange: (value: string | string[] | null) => {
      scenario.actions.setSelectedValue(value);
      scenario.actions.addLog(`value changed ${formatValue(value)}`);
    },
    onActiveCellChange: (cell: { rowIndex: number; columnIndex: number } | null) => {
      scenario.actions.setActiveCell(cell);
      scenario.actions.addLog(`active cell ${formatCell(cell)}`);
    },
  };
  if (state.stateMode === "controlled") {
    props.value = state.selectedValue;
    props.activeCell = state.activeCell;
  } else {
    props.defaultValue = state.defaultSelected ? (state.selectionMode === "multiple" ? ["alpha"] : "alpha") : undefined;
    props.defaultActiveCell = state.defaultActive ? { rowIndex: 2, columnIndex: 1 } : undefined;
  }

  const content = renderDataGridContent(scenario);
  const root = state.composition.root === "asChild" ? (
    <DataGrid.Root key={`${state.stateMode}-${state.defaultSelected}-${state.defaultActive}-${state.selectionMode}`} {...props} asChild>
      <table>{content}</table>
    </DataGrid.Root>
  ) : state.composition.root === "render" ? (
    <DataGrid.Root key={`${state.stateMode}-${state.defaultSelected}-${state.defaultActive}-${state.selectionMode}`} {...props} render={(renderProps) => <table {...renderProps}>{content}</table>} />
  ) : (
    <DataGrid.Root key={`${state.stateMode}-${state.defaultSelected}-${state.defaultActive}-${state.selectionMode}`} {...props}>{content}</DataGrid.Root>
  );

  return (
    <div className="data-primitive-stage">
      {state.directionMode === "provider-rtl" || state.directionMode === "local-ltr"
        ? <Direction.Provider dir="rtl">{root}</Direction.Provider>
        : root}
    </div>
  );
}

function renderDataGridContent(scenario: ReturnType<typeof useDataGridScenario>) {
  const headingCells = (
    <>
      {renderDataGridElement(DataGrid.ColumnHeader, "columnHeader", "th", { columnIndex: 1, className: "playground-data-grid-column-header-name" }, "Name", scenario)}
      {renderDataGridElement(DataGrid.ColumnHeader, "columnHeader", "th", { index: 1, sortDirection: scenario.state.sortDirection === "unset" ? undefined : scenario.state.sortDirection, className: "playground-data-grid-column-header-status" }, "Status", scenario)}
    </>
  );
  const headingRow = renderDataGridElement(DataGrid.Row, "row", "tr", { rowIndex: 1, selectable: false, className: "playground-data-grid-row-heading" }, headingCells, scenario);
  const alphaCells = (
    <>
      {renderDataGridElement(DataGrid.Cell, "cell", "td", { index: 0, className: "playground-data-grid-cell-alpha" }, "Alpha", scenario)}
      {renderDataGridElement(DataGrid.Cell, "cell", "td", { columnIndex: 2, className: "playground-data-grid-cell-ready" }, "Ready", scenario)}
    </>
  );
  const bravoCells = (
    <>
      {renderDataGridElement(DataGrid.Cell, "cell", "td", { columnIndex: 1, className: "playground-data-grid-cell-bravo" }, "Bravo", scenario)}
      {renderDataGridElement(DataGrid.Cell, "cell", "td", { columnIndex: 2, disabled: scenario.state.disableCell, className: "playground-data-grid-cell-review" }, "Review", scenario)}
    </>
  );
  const blockedCells = (
    <>
      {renderDataGridElement(DataGrid.Cell, "cell", "td", { columnIndex: 1, className: "playground-data-grid-cell-blocked" }, "Blocked", scenario)}
      {renderDataGridElement(DataGrid.Cell, "cell", "td", { columnIndex: 2, className: "playground-data-grid-cell-waiting" }, "Waiting", scenario)}
    </>
  );
  const summaryCells = (
    <>
      {renderDataGridElement(DataGrid.Cell, "cell", "td", { columnIndex: 1, className: "playground-data-grid-cell-total" }, "Total", scenario)}
      {renderDataGridElement(DataGrid.Cell, "cell", "td", { columnIndex: 2, className: "playground-data-grid-cell-count" }, "3 projects", scenario)}
    </>
  );

  return (
    <>
      {renderDataGridElement(DataGrid.Caption, "caption", "caption", { className: "playground-data-grid-caption" }, "Project data", scenario)}
      {renderDataGridElement(DataGrid.Header, "header", "thead", { className: "playground-data-grid-header" }, headingRow, scenario)}
      {renderDataGridElement(DataGrid.Body, "body", "tbody", { className: "playground-data-grid-body" }, <>
        {renderDataGridElement(DataGrid.Row, "row", "tr", { index: 1, value: "alpha", className: "playground-data-grid-row-alpha" }, alphaCells, scenario)}
        {renderDataGridElement(DataGrid.Row, "row", "tr", { rowIndex: 3, value: "bravo", className: "playground-data-grid-row-bravo" }, bravoCells, scenario)}
        {renderDataGridElement(DataGrid.Row, "row", "tr", { index: 3, value: "blocked", disabled: scenario.state.disableRow, className: "playground-data-grid-row-blocked" }, blockedCells, scenario)}
      </>, scenario)}
      {renderDataGridElement(DataGrid.Footer, "footer", "tfoot", { className: "playground-data-grid-footer" },
        renderDataGridElement(DataGrid.Row, "row", "tr", { rowIndex: 5, value: "summary", selectable: false, className: "playground-data-grid-row-summary" }, summaryCells, scenario), scenario)}
    </>
  );
}

function renderDataGridElement(
  Part: any,
  part: DataGridPartKey,
  tag: string,
  nativeProps: Record<string, unknown>,
  children: any,
  scenario: ReturnType<typeof useDataGridScenario>,
) {
  const NativeTag = tag as any;
  const props = {
    ...nativeProps,
    "data-playground-inspect": "",
    ref: (element: HTMLElement | null) => scenario.actions.markPartRef(part, element),
    ...dataGridPartProps(part, scenario.state),
  };
  const mode = scenario.state.composition[part];

  if (mode === "asChild") return <Part {...props} asChild><NativeTag>{children}</NativeTag></Part>;
  if (mode === "render") return <Part {...props} render={(renderProps: Record<string, unknown>) => <NativeTag {...renderProps}>{children}</NativeTag>} />;
  return <Part {...props}>{children}</Part>;
}

function dataGridPartProps(part: DataGridPartKey, state: ReturnType<typeof useDataGridScenario>["state"]) {
  return partProps(part, { customSlot: state.customSlots[part], propCheck: state.propCheck }, `data-grid-${part}-custom`);
}

function TreeScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useTreeScenario> }) {
  const state = scenario.state;
  const props = {
    className: "playground-tree",
    "aria-label": "Documentation tree",
    "data-playground-inspect": "",
    "data-tree-root": "",
    defaultExpandedValue: state.stateMode === "uncontrolled" && state.defaultExpanded ? ["docs"] : undefined,
    defaultValue: state.stateMode === "uncontrolled" && state.defaultSelected ? (state.selectionMode === "multiple" ? ["docs"] : "docs") : undefined,
    dir: getTreeRootDirection(state.directionMode),
    disabled: state.disabled,
    expandedValue: state.stateMode === "controlled" ? state.expandedValue : undefined,
    invalid: state.invalid,
    loop: state.loop,
    multiple: state.selectionMode === "multiple",
    name: state.formName ? "tree-selection" : undefined,
    orientation: state.orientation,
    readOnly: state.readOnly,
    ref: (element: HTMLElement | null) => scenario.actions.markPartRef("root", element),
    required: state.required,
    value: state.stateMode === "controlled" ? state.selectedValue : undefined,
    onExpandedValueChange: scenario.actions.handleExpandedValueChange,
    onValueChange: scenario.actions.handleValueChange,
    ...treePartProps("root", state),
  };
  const content = renderTreeContent(scenario);
  const treeKey = [
    state.stateMode,
    state.selectionMode,
    state.stateMode === "uncontrolled" ? state.defaultSelected : "controlled",
    state.stateMode === "uncontrolled" ? state.defaultExpanded : "controlled",
  ].join(":");
  const tree = state.composition.root === "asChild" ? (
    <Tree.Root key={treeKey} {...props} asChild>
      <section>{content}</section>
    </Tree.Root>
  ) : state.composition.root === "render" ? (
    <Tree.Root key={treeKey} {...props} render={(renderProps) => <section {...renderProps}>{content}</section>} />
  ) : (
    <Tree.Root key={treeKey} {...props}>{content}</Tree.Root>
  );

  return (
    <div className="data-primitive-stage">
      {shouldWrapTreeDirectionProvider(state.directionMode) ? (
        <Direction.Provider dir="rtl">{tree}</Direction.Provider>
      ) : tree}
    </div>
  );
}

function renderTreeContent(scenario: ReturnType<typeof useTreeScenario>) {
  return (
    <>
      {renderTreeItem("docs", "Docs", scenario, true, (
        renderTreeGroup("docs", scenario, (
          <>
            {renderTreeItem("guide", "Guide", scenario)}
            {renderTreeItem("api", "API", scenario, false, null, scenario.state.disableItem)}
          </>
        ))
      ))}
      {renderTreeItem("components", "Components", scenario, true, (
        renderTreeGroup("components", scenario, renderTreeItem("button", "Button", scenario))
      ))}
    </>
  );
}

function renderTreeItem(
  value: string,
  label: string,
  scenario: ReturnType<typeof useTreeScenario>,
  expandable = false,
  children: any = null,
  disabled = false,
) {
  const state = scenario.state;
  const props = {
    "data-playground-inspect": "",
    "data-tree-item": value,
    disabled,
    expandable,
    ref: value === "docs" ? (element: HTMLElement | null) => scenario.actions.markPartRef("item", element) : undefined,
    value,
    ...treePartProps("item", state),
  };
  const content = (
    <>
      {renderTreeItemText(value, label, scenario)}
      {children}
    </>
  );

  if (state.composition.item === "asChild") {
    return (
      <Tree.Item {...props} asChild key={value}>
        <div>{content}</div>
      </Tree.Item>
    );
  }

  if (state.composition.item === "render") {
    return <Tree.Item {...props} key={value} render={(renderProps) => <div {...renderProps}>{content}</div>} />;
  }

  return <Tree.Item {...props} key={value}>{content}</Tree.Item>;
}

function renderTreeItemText(value: string, label: string, scenario: ReturnType<typeof useTreeScenario>) {
  const state = scenario.state;
  const props = {
    "data-playground-inspect": "",
    "data-tree-item-text": value,
    ref: value === "docs" ? (element: HTMLElement | null) => scenario.actions.markPartRef("itemText", element) : undefined,
    ...treePartProps("itemText", state),
  };

  if (state.composition.itemText === "asChild") {
    return (
      <Tree.ItemText {...props} asChild>
        <span>{label}</span>
      </Tree.ItemText>
    );
  }

  if (state.composition.itemText === "render") {
    return <Tree.ItemText {...props} render={(renderProps) => <span {...renderProps}>{label}</span>} />;
  }

  return <Tree.ItemText {...props}>{label}</Tree.ItemText>;
}

function renderTreeGroup(value: string, scenario: ReturnType<typeof useTreeScenario>, children: any) {
  const state = scenario.state;
  const props = {
    "data-playground-inspect": "",
    "data-tree-group": value,
    forceMount: state.forceMount,
    ref: value === "docs" ? (element: HTMLElement | null) => scenario.actions.markPartRef("group", element) : undefined,
    ...treePartProps("group", state),
  };

  if (state.composition.group === "asChild") {
    return (
      <Tree.Group {...props} asChild>
        <div>{children}</div>
      </Tree.Group>
    );
  }

  if (state.composition.group === "render") {
    return <Tree.Group {...props} render={(renderProps) => <div {...renderProps}>{children}</div>} />;
  }

  return <Tree.Group {...props}>{children}</Tree.Group>;
}

function TreeGridScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useTreeGridScenario> }) {
  const state = scenario.state;
  const props: any = {
    className: "playground-data-table",
    id: "playground-tree-grid",
    "aria-label": "Project tree grid",
    "data-playground-inspect": "",
    ref: (element: HTMLElement | null) => scenario.actions.markPartRef("root", element),
    ...treeGridPartProps("root", state),
    selectionMode: state.selectionMode === "none" ? undefined : state.selectionMode,
    disabled: state.disabled || undefined,
    readOnly: state.readOnly || undefined,
    loop: state.loop || undefined,
    dir: state.directionMode === "local-ltr" ? "ltr" : state.directionMode === "local-rtl" ? "rtl" : undefined,
    rowCount: state.counts ? 5 : undefined,
    columnCount: state.counts ? 2 : undefined,
    selectOnRowClick: state.selectOnRowClick || undefined,
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
  if (state.stateMode === "controlled") {
    props.value = state.selectedValue;
    props.expandedValue = state.expandedValue;
    props.activeCell = state.activeCell;
  }
  const content = renderTreeGridContent(scenario);
  const root = state.composition.root === "asChild" ? (
        <TreeGrid.Root {...props} asChild>
          <table>{content}</table>
        </TreeGrid.Root>
      ) : state.composition.root === "render" ? (
        <TreeGrid.Root {...props} render={(renderProps) => <table {...renderProps}>{content}</table>} />
      ) : (
        <TreeGrid.Root {...props}>{content}</TreeGrid.Root>
      );

  return (
    <div className="data-primitive-stage">
      {state.directionMode === "provider-rtl" || state.directionMode === "local-ltr"
        ? <Direction.Provider dir="rtl">{root}</Direction.Provider>
        : root}
    </div>
  );
}

function renderTreeGridContent(scenario: ReturnType<typeof useTreeGridScenario>) {
  const headingCells = (
    <>
      {renderTreeGridElement(TreeGrid.ColumnHeader, "columnHeader", "th", { columnIndex: 1, className: "playground-tree-grid-column-header-task" }, "Task", scenario)}
      {renderTreeGridElement(TreeGrid.ColumnHeader, "columnHeader", "th", { columnIndex: 2, sortDirection: scenario.state.sortDirection === "unset" ? undefined : scenario.state.sortDirection, className: "playground-tree-grid-column-header-owner" }, "Owner", scenario)}
    </>
  );
  const headingRow = renderTreeGridElement(TreeGrid.Row, "row", "tr", { rowIndex: 1, value: "heading", selectable: false, className: "playground-tree-grid-row-heading" }, headingCells, scenario);
  const parentCells = (
    <>
      {renderTreeGridElement(TreeGrid.RowHeader, "rowHeader", "th", { columnIndex: 1, className: "playground-tree-grid-row-header-project" }, "Project", scenario)}
      {renderTreeGridElement(TreeGrid.Cell, "cell", "td", { columnIndex: 2, className: "playground-tree-grid-cell-team" }, "Team", scenario)}
    </>
  );
  const designCells = (
    <>
      {renderTreeGridElement(TreeGrid.RowHeader, "rowHeader", "th", { columnIndex: 1, className: "playground-tree-grid-row-header-design" }, "Design review", scenario)}
      {renderTreeGridElement(TreeGrid.Cell, "cell", "td", { columnIndex: 2, className: "playground-tree-grid-cell-ava" }, "Ava", scenario)}
    </>
  );
  const blockedCells = (
    <>
      {renderTreeGridElement(TreeGrid.RowHeader, "rowHeader", "th", { columnIndex: 1, className: "playground-tree-grid-row-header-blocked" }, "Blocked task", scenario)}
      {renderTreeGridElement(TreeGrid.Cell, "cell", "td", { columnIndex: 2, className: "playground-tree-grid-cell-noah" }, "Noah", scenario)}
    </>
  );
  const summaryCells = (
    <>
      {renderTreeGridElement(TreeGrid.RowHeader, "rowHeader", "th", { columnIndex: 1, className: "playground-tree-grid-row-header-total" }, "Total", scenario)}
      {renderTreeGridElement(TreeGrid.Cell, "cell", "td", { columnIndex: 2, className: "playground-tree-grid-cell-total" }, "3 tasks", scenario)}
    </>
  );

  return (
    <>
      {renderTreeGridElement(TreeGrid.Caption, "caption", "caption", { className: "playground-tree-grid-caption" }, "Project tree", scenario)}
      {renderTreeGridElement(TreeGrid.Header, "header", "thead", { className: "playground-tree-grid-header" }, headingRow, scenario)}
      {renderTreeGridElement(TreeGrid.Body, "body", "tbody", { className: "playground-tree-grid-body" }, <>
        {renderTreeGridElement(TreeGrid.Row, "row", "tr", { className: "playground-tree-grid-row-project", expandable: true, level: 1, rowIndex: 2, value: "project" }, parentCells, scenario)}
        {renderTreeGridElement(TreeGrid.Row, "row", "tr", { className: "playground-tree-grid-row-design", level: 2, parentValue: "project", rowIndex: 3, value: "design" }, designCells, scenario)}
        {renderTreeGridElement(TreeGrid.Row, "row", "tr", { className: "playground-tree-grid-row-blocked", disabled: scenario.state.disableChild, level: 2, parentValue: "project", rowIndex: 4, value: "blocked" }, blockedCells, scenario)}
      </>, scenario)}
      {renderTreeGridElement(TreeGrid.Footer, "footer", "tfoot", { className: "playground-tree-grid-footer" },
        renderTreeGridElement(TreeGrid.Row, "row", "tr", { className: "playground-tree-grid-row-summary", rowIndex: 5, selectable: false, value: "summary" }, summaryCells, scenario), scenario)}
    </>
  );
}

function renderTreeGridElement(
  Part: any,
  part: TreeGridPartKey,
  tag: string,
  nativeProps: Record<string, unknown>,
  children: any,
  scenario: ReturnType<typeof useTreeGridScenario>,
) {
  const NativeTag = tag as any;
  const props = {
    ...nativeProps,
    "data-playground-inspect": "",
    ref: (element: HTMLElement | null) => scenario.actions.markPartRef(part, element),
    ...treeGridPartProps(part, scenario.state),
  };
  const mode = scenario.state.composition[part];

  if (mode === "asChild") {
    return <Part {...props} asChild><NativeTag>{children}</NativeTag></Part>;
  }
  if (mode === "render") {
    return <Part {...props} render={(renderProps: Record<string, unknown>) => <NativeTag {...renderProps}>{children}</NativeTag>} />;
  }
  return <Part {...props}>{children}</Part>;
}

function treeGridPartProps(part: TreeGridPartKey, state: ReturnType<typeof useTreeGridScenario>["state"]) {
  return partProps(part, { customSlot: state.customSlots[part], propCheck: state.propCheck }, `tree-grid-${part}-custom`);
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
        row("State mode", state.stateMode, "state"),
        row("Selection mode", state.selectionMode, "state"),
        row("Selected", formatValue(state.selectedValue), "state"),
        row("Active cell", formatCell(state.activeCell), "state"),
        row("Disabled", bool(state.disabled), "state"),
        row("Read only", bool(state.readOnly), "state"),
        row("Loop", bool(state.loop), "behavior"),
        row("Wrap rows", bool(state.wrapRows), "behavior"),
        row("Select row on click", bool(state.selectOnRowClick), "behavior"),
        row("Direction", state.directionMode, "behavior"),
        row("Composition", state.composition.root, "composition"),
        row("Ref", state.refs.root, "behavior"),
      ]),
      section("Caption", "caption", ".playground-data-grid-caption", [row("Composition", state.composition.caption, "composition"), row("Ref", state.refs.caption, "behavior")]),
      section("Header", "header", ".playground-data-grid-header", [row("Composition", state.composition.header, "composition"), row("Ref", state.refs.header, "behavior")]),
      section("Row: Name / Status", state.selectionMode === "none" ? "column-heading row" : "selection-disabled heading row", ".playground-data-grid-row-heading", [row("Composition", state.composition.row, "composition"), row("Ref", state.refs.row, "behavior")]),
      section("Column Header: Name", "columnheader", ".playground-data-grid-column-header-name", [row("Composition", state.composition.columnHeader, "composition"), row("Ref", state.refs.columnHeader, "behavior")]),
      section("Column Header: Status", state.sortDirection === "unset" ? "columnheader" : `sorted ${state.sortDirection}`, ".playground-data-grid-column-header-status", [row("Composition", state.composition.columnHeader, "composition"), row("Sort direction", state.sortDirection, "state")]),
      section("Body", "body", ".playground-data-grid-body", [row("Composition", state.composition.body, "composition"), row("Ref", state.refs.body, "behavior")]),
      section("Row: Alpha / Ready", state.selectedValue && formatValue(state.selectedValue).includes("alpha") ? "selected row" : "row", ".playground-data-grid-row-alpha", [row("Composition", state.composition.row, "composition")]),
      section("Cell: Alpha", "gridcell", ".playground-data-grid-cell-alpha", [row("Composition", state.composition.cell, "composition"), row("Ref", state.refs.cell, "behavior")]),
      section("Cell: Ready", "gridcell", ".playground-data-grid-cell-ready", [row("Composition", state.composition.cell, "composition")]),
      section("Row: Bravo / Review", "row", ".playground-data-grid-row-bravo", [row("Composition", state.composition.row, "composition")]),
      section("Cell: Bravo", "gridcell", ".playground-data-grid-cell-bravo", [row("Composition", state.composition.cell, "composition")]),
      section("Cell: Review", state.disableCell ? "disabled cell" : "gridcell", ".playground-data-grid-cell-review", [row("Composition", state.composition.cell, "composition")]),
      section("Row: Blocked / Waiting", state.disableRow ? "disabled row" : "row", ".playground-data-grid-row-blocked", [row("Composition", state.composition.row, "composition")]),
      section("Cell: Blocked", "gridcell", ".playground-data-grid-cell-blocked", [row("Composition", state.composition.cell, "composition")]),
      section("Cell: Waiting", "gridcell", ".playground-data-grid-cell-waiting", [row("Composition", state.composition.cell, "composition")]),
      section("Footer", "footer", ".playground-data-grid-footer", [row("Composition", state.composition.footer, "composition"), row("Ref", state.refs.footer, "behavior")]),
      section("Row: Total / 3 Projects", state.selectionMode === "none" ? "summary row" : "selection-disabled summary row", ".playground-data-grid-row-summary", [row("Composition", state.composition.row, "composition")]),
      section("Cell: Total", "gridcell", ".playground-data-grid-cell-total", [row("Composition", state.composition.cell, "composition")]),
      section("Cell: 3 Projects", "gridcell", ".playground-data-grid-cell-count", [row("Composition", state.composition.cell, "composition")]),
    ];
  }

  if (scenarioId === "tree") {
    const state = scenarios.tree.state;
    return [
      section("Root", `${state.stateMode} ${state.selectionMode}`, "[data-tree-root]", [
        row("Mode", state.stateMode, "state"),
        row("Selected", formatValue(state.selectedValue), "state"),
        row("Expanded", state.expandedValue.join(",") || "none", "state"),
        row("Default selected", bool(state.defaultSelected), "state"),
        row("Default expanded", bool(state.defaultExpanded), "state"),
        row("Disabled", bool(state.disabled), "state"),
        row("Read only", bool(state.readOnly), "state"),
        row("Required", bool(state.required), "state"),
        row("Invalid", bool(state.invalid), "state"),
        row("Orientation", state.orientation, "behavior"),
        row("Direction", state.directionMode, "behavior"),
        row("Loop", bool(state.loop), "behavior"),
        row("Form name", bool(state.formName), "state"),
        row("Composition", state.composition.root, "composition"),
        row("Ref", state.refs.root, "behavior"),
      ]),
      section("Item: Docs", state.expandedValue.includes("docs") ? "expanded" : "collapsed", "[data-tree-item='docs']", [
        row("Composition", state.composition.item, "composition"),
        row("Ref", state.refs.item, "behavior"),
      ]),
      section("Item Text: Docs", "label", "[data-tree-item-text='docs']", [
        row("Composition", state.composition.itemText, "composition"),
        row("Ref", state.refs.itemText, "behavior"),
      ]),
      section("Group: Docs", state.forceMount || state.expandedValue.includes("docs") ? "mounted" : "not rendered", "[data-tree-group='docs']", [
        row("Force mount", bool(state.forceMount), "state"),
        row("Composition", state.composition.group, "composition"),
        row("Ref", state.refs.group, "behavior"),
      ]),
      section("Item: Guide", "child", "[data-tree-item='guide']", [
        row("Composition", state.composition.item, "composition"),
      ]),
      section("Item: API", state.disableItem ? "disabled child" : "enabled child", "[data-tree-item='api']", [
        row("Composition", state.composition.item, "composition"),
      ]),
      section("Item: Components", state.expandedValue.includes("components") ? "expanded" : "collapsed", "[data-tree-item='components']", [
        row("Composition", state.composition.item, "composition"),
      ]),
      section("Group: Components", state.forceMount || state.expandedValue.includes("components") ? "mounted" : "not rendered", "[data-tree-group='components']"),
      section("Hidden Input", state.formName ? "generated" : "not rendered", "input[name='tree-selection']"),
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
        row("State mode", state.stateMode, "state"),
        row("Direction", state.directionMode, "behavior"),
        row("Composition", state.composition.root, "composition"),
        row("Ref", state.refs.root, "behavior"),
      ]),
      section("Caption", "caption", ".playground-tree-grid-caption", [row("Composition", state.composition.caption, "composition"), row("Ref", state.refs.caption, "behavior")]),
      section("Header", "header", ".playground-tree-grid-header", [row("Composition", state.composition.header, "composition"), row("Ref", state.refs.header, "behavior")]),
      section("Row: Task / Owner", "column-heading row", ".playground-tree-grid-row-heading", [row("Composition", state.composition.row, "composition"), row("Ref", state.refs.row, "behavior")]),
      section("Column Header: Task", "columnheader", ".playground-tree-grid-column-header-task", [row("Composition", state.composition.columnHeader, "composition"), row("Ref", state.refs.columnHeader, "behavior")]),
      section("Column Header: Owner", state.sortDirection === "unset" ? "columnheader" : `sorted ${state.sortDirection}`, ".playground-tree-grid-column-header-owner", [row("Composition", state.composition.columnHeader, "composition"), row("Sort direction", state.sortDirection, "state")]),
      section("Body", "body", ".playground-tree-grid-body", [row("Composition", state.composition.body, "composition"), row("Ref", state.refs.body, "behavior")]),
      section("Row: Project / Team", state.expandedValue.includes("project") ? "expanded parent row" : "collapsed parent row", ".playground-tree-grid-row-project", [row("Composition", state.composition.row, "composition")]),
      section("Row Header: Project", "toggles row", ".playground-tree-grid-row-header-project", [row("Composition", state.composition.rowHeader, "composition"), row("Ref", state.refs.rowHeader, "behavior")]),
      section("Cell: Team", "gridcell", ".playground-tree-grid-cell-team", [row("Composition", state.composition.cell, "composition"), row("Ref", state.refs.cell, "behavior")]),
      section("Row: Design Review / Ava", "child row", ".playground-tree-grid-row-design", [row("Composition", state.composition.row, "composition")]),
      section("Row Header: Design Review", "rowheader", ".playground-tree-grid-row-header-design", [row("Composition", state.composition.rowHeader, "composition")]),
      section("Cell: Ava", "gridcell", ".playground-tree-grid-cell-ava", [row("Composition", state.composition.cell, "composition")]),
      section("Row: Blocked Task / Noah", state.disableChild ? "disabled child row" : "child row", ".playground-tree-grid-row-blocked", [row("Composition", state.composition.row, "composition")]),
      section("Row Header: Blocked Task", "rowheader", ".playground-tree-grid-row-header-blocked", [row("Composition", state.composition.rowHeader, "composition")]),
      section("Cell: Noah", "gridcell", ".playground-tree-grid-cell-noah", [row("Composition", state.composition.cell, "composition")]),
      section("Footer", "footer", ".playground-tree-grid-footer", [row("Composition", state.composition.footer, "composition"), row("Ref", state.refs.footer, "behavior")]),
      section("Row: Total / 3 Tasks", "summary row", ".playground-tree-grid-row-summary", [row("Composition", state.composition.row, "composition")]),
      section("Row Header: Total", "rowheader", ".playground-tree-grid-row-header-total", [row("Composition", state.composition.rowHeader, "composition")]),
      section("Cell: 3 Tasks", "gridcell", ".playground-tree-grid-cell-total", [row("Composition", state.composition.cell, "composition")]),
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

function DataGridCompositionToolbarGroup({
  composition,
  onChange,
}: {
  composition: Record<DataGridPartKey, CompositionMode>;
  onChange: (part: DataGridPartKey, value: CompositionMode) => void;
}) {
  return (
    <ToolbarGroup title="Composition" value="composition">
      {dataGridCompositionControls.map((control) => (
        <Menubar.Sub key={control.part}>
          <Menubar.SubTrigger className="toolbar-menu-item toolbar-submenu-trigger" value={control.part}>
            <span>{control.label}</span>
            <span className="toolbar-submenu-value">{formatCompositionMode(composition[control.part])}</span>
            <span className="toolbar-submenu-arrow" aria-hidden="true">›</span>
          </Menubar.SubTrigger>
          <Menubar.SubContent className="toolbar-menu" sideOffset={6}>
            <Menubar.RadioGroup className="toolbar-radio-group" value={composition[control.part]} onValueChange={(value) => onChange(control.part, value as CompositionMode)}>
              {compositionOptions.map((option) => (
                <Menubar.RadioItem className="toolbar-menu-item" key={option.value} value={option.value}>
                  <span>{option.label}</span>
                  <span className="toolbar-menu-check" aria-hidden="true">{composition[control.part] === option.value ? "✓" : ""}</span>
                </Menubar.RadioItem>
              ))}
            </Menubar.RadioGroup>
          </Menubar.SubContent>
        </Menubar.Sub>
      ))}
    </ToolbarGroup>
  );
}

function TreeGridCompositionToolbarGroup({
  composition,
  onChange,
}: {
  composition: Record<TreeGridPartKey, CompositionMode>;
  onChange: (part: TreeGridPartKey, value: CompositionMode) => void;
}) {
  return (
    <ToolbarGroup title="Composition" value="composition">
      {treeGridCompositionControls.map((control) => (
        <Menubar.Sub key={control.part}>
          <Menubar.SubTrigger className="toolbar-menu-item toolbar-submenu-trigger" value={control.part}>
            <span>{control.label}</span>
            <span className="toolbar-submenu-value">{formatCompositionMode(composition[control.part])}</span>
            <span className="toolbar-submenu-arrow" aria-hidden="true">›</span>
          </Menubar.SubTrigger>
          <Menubar.SubContent className="toolbar-menu" sideOffset={6}>
            <Menubar.RadioGroup className="toolbar-radio-group" value={composition[control.part]} onValueChange={(value) => onChange(control.part, value as CompositionMode)}>
              {compositionOptions.map((option) => (
                <Menubar.RadioItem className="toolbar-menu-item" key={option.value} value={option.value}>
                  <span>{option.label}</span>
                  <span className="toolbar-menu-check" aria-hidden="true">{composition[control.part] === option.value ? "✓" : ""}</span>
                </Menubar.RadioItem>
              ))}
            </Menubar.RadioGroup>
          </Menubar.SubContent>
        </Menubar.Sub>
      ))}
    </ToolbarGroup>
  );
}

function TreeCompositionToolbarGroup({
  composition,
  onChange,
}: {
  composition: Record<TreePartKey, CompositionMode>;
  onChange: (part: TreePartKey, value: CompositionMode) => void;
}) {
  return (
    <ToolbarGroup title="Composition" value="composition">
      {treeCompositionControls.map((control) => (
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

function getDataGridSource(state?: ReturnType<typeof useDataGridScenario>["state"]) {
  const resolved = state ?? {
    composition: dataGridDefaultComposition,
    customSlots: dataGridDefaultCustomSlots,
    propCheck: false,
  } as ReturnType<typeof useDataGridScenario>["state"];
  const sourcePartProps = (part: DataGridPartKey, extra: string[] = []) => [
    ...extra,
    resolved.propCheck ? `data-prop-check="${part}"` : "",
    resolved.customSlots[part] ? `data-slot="data-grid-${part}-custom"` : "",
  ].filter(Boolean);
  const rootProps = sourcePartProps("root", [
    'aria-label="Project data grid"',
    state?.selectionMode && state.selectionMode !== "none" ? `selectionMode="${state.selectionMode}"` : "",
    state?.disabled ? "disabled" : "",
    state?.readOnly ? "readOnly" : "",
    state?.loop ? "loop" : "",
    state?.wrapRows ? "wrapRows" : "",
    state?.selectOnRowClick ? "selectOnRowClick" : "",
    state?.counts ? "rowCount={5}" : "",
    state?.counts ? "columnCount={2}" : "",
    state?.directionMode === "local-ltr" ? 'dir="ltr"' : state?.directionMode === "local-rtl" ? 'dir="rtl"' : "",
    state?.stateMode === "controlled" ? `value={${JSON.stringify(state.selectedValue)}}` : "",
    state?.stateMode === "controlled" ? `activeCell={${JSON.stringify(state.activeCell)}}` : "",
    state?.stateMode === "controlled" ? "onValueChange={setValue}" : "",
    state?.stateMode === "controlled" ? "onActiveCellChange={setActiveCell}" : "",
    state?.stateMode === "uncontrolled" && state.defaultSelected ? `defaultValue={${JSON.stringify(state.selectionMode === "multiple" ? ["alpha"] : "alpha")}}` : "",
    state?.stateMode === "uncontrolled" && state.defaultActive ? "defaultActiveCell={{ rowIndex: 2, columnIndex: 1 }}" : "",
  ]);
  const cell = (component: "ColumnHeader" | "Cell", part: DataGridPartKey, extra: string[], text: string, indent: number) =>
    sourceDataGridElement(component, part, resolved.composition[part], sourcePartProps(part, extra), text, indent);
  const gridRow = (extra: string[], children: string, indent: number) =>
    sourceDataGridElement("Row", "row", resolved.composition.row, sourcePartProps("row", extra), children, indent);
  const headerRow = gridRow(["rowIndex={1}", "selectable={false}"], `
      ${cell("ColumnHeader", "columnHeader", ["columnIndex={1}"], "Name", 6)}
      ${cell("ColumnHeader", "columnHeader", ["index={1}", state?.sortDirection && state.sortDirection !== "unset" ? `sortDirection="${state.sortDirection}"` : ""], "Status", 6)}
    `, 4);
  const alphaRow = gridRow(["index={1}", 'value="alpha"'], `
      ${cell("Cell", "cell", ["index={0}"], "Alpha", 6)}
      ${cell("Cell", "cell", ["columnIndex={2}"], "Ready", 6)}
    `, 4);
  const bravoRow = gridRow(["rowIndex={3}", 'value="bravo"'], `
      ${cell("Cell", "cell", ["columnIndex={1}"], "Bravo", 6)}
      ${cell("Cell", "cell", ["columnIndex={2}", state?.disableCell ? "disabled" : ""], "Review", 6)}
    `, 4);
  const blockedRow = gridRow(["index={3}", 'value="blocked"', state?.disableRow ? "disabled" : ""], `
      ${cell("Cell", "cell", ["columnIndex={1}"], "Blocked", 6)}
      ${cell("Cell", "cell", ["columnIndex={2}"], "Waiting", 6)}
    `, 4);
  const footerRow = gridRow(["rowIndex={5}", 'value="summary"', "selectable={false}"], `
      ${cell("Cell", "cell", ["columnIndex={1}"], "Total", 6)}
      ${cell("Cell", "cell", ["columnIndex={2}"], "3 projects", 6)}
    `, 4);
  const inner = `
  ${sourceDataGridElement("Caption", "caption", resolved.composition.caption, sourcePartProps("caption"), "Project data", 2)}
  ${sourceDataGridElement("Header", "header", resolved.composition.header, sourcePartProps("header"), headerRow, 2)}
  ${sourceDataGridElement("Body", "body", resolved.composition.body, sourcePartProps("body"), `${alphaRow}\n${bravoRow}\n${blockedRow}`, 2)}
  ${sourceDataGridElement("Footer", "footer", resolved.composition.footer, sourcePartProps("footer"), footerRow, 2)}
`;
  const source = sourceDataGridElement("Root", "root", resolved.composition.root, rootProps, inner, 0);
  return state?.directionMode === "provider-rtl" || state?.directionMode === "local-ltr"
    ? `<Direction.Provider dir="rtl">\n  ${source.split("\n").join("\n  ")}\n</Direction.Provider>`
    : source;
}

function sourceDataGridElement(component: string, part: DataGridPartKey, composition: CompositionMode, props: string[], children: string, indent: number) {
  const pad = " ".repeat(indent);
  const propText = props.length ? ` ${props.join(" ")}` : "";
  const tag = dataGridNativeTags[part];
  const content = children.trim().includes("\n") ? `\n${children.trim()}\n${pad}` : children;
  if (composition === "asChild") return `${pad}<DataGrid.${component}${propText} asChild>\n${pad}  <${tag}>${content}</${tag}>\n${pad}</DataGrid.${component}>`;
  if (composition === "render") return `${pad}<DataGrid.${component}${propText}\n${pad}  render={(props) => <${tag} {...props}>${content}</${tag}>}\n${pad}/>`;
  return `${pad}<DataGrid.${component}${propText}>${content}</DataGrid.${component}>`;
}

function getTreeGridSource(state?: ReturnType<typeof useTreeGridScenario>["state"]) {
  const resolved = state ?? {
    composition: treeGridDefaultComposition,
    customSlots: treeGridDefaultCustomSlots,
    propCheck: false,
  } as ReturnType<typeof useTreeGridScenario>["state"];
  const partProps = (part: TreeGridPartKey, extra: string[] = []) => [
    ...extra,
    resolved.propCheck ? `data-prop-check="${part}"` : "",
    resolved.customSlots[part] ? `data-slot="tree-grid-${part}-custom"` : "",
  ].filter(Boolean);
  const rootProps = partProps("root", [
    'aria-label="Project tree grid"',
    state?.selectionMode && state.selectionMode !== "none" ? `selectionMode="${state.selectionMode}"` : "",
    state?.disabled ? "disabled" : "",
    state?.readOnly ? "readOnly" : "",
    state?.loop ? "loop" : "",
    state?.selectOnRowClick ? "selectOnRowClick" : "",
    state?.counts ? "rowCount={5} columnCount={2}" : "",
    state?.directionMode === "local-ltr" ? 'dir="ltr"' : state?.directionMode === "local-rtl" ? 'dir="rtl"' : "",
    state?.stateMode === "controlled" ? `value={${JSON.stringify(state.selectedValue)}}` : "",
    state?.stateMode === "controlled" ? `expandedValue={${JSON.stringify(state.expandedValue)}}` : "",
    state?.stateMode === "controlled" ? `activeCell={${JSON.stringify(state.activeCell)}}` : "",
    state?.stateMode === "controlled" ? "onValueChange={setValue}" : "",
    state?.stateMode === "controlled" ? "onExpandedValueChange={setExpandedValue}" : "",
    state?.stateMode === "controlled" ? "onActiveCellChange={setActiveCell}" : "",
  ]);
  const cell = (component: "ColumnHeader" | "RowHeader" | "Cell", part: TreeGridPartKey, extra: string[], text: string, indent: number) =>
    sourceTreeGridElement(component, part, resolved.composition[part], partProps(part, extra), text, indent);
  const row = (extra: string[], children: string, indent: number) =>
    sourceTreeGridElement("Row", "row", resolved.composition.row, partProps("row", extra), children, indent);
  const headerRow = row(["rowIndex={1}", 'value="heading"', "selectable={false}"], `
      ${cell("ColumnHeader", "columnHeader", ["columnIndex={1}"], "Task", 6)}
      ${cell("ColumnHeader", "columnHeader", ["columnIndex={2}", state?.sortDirection && state.sortDirection !== "unset" ? `sortDirection="${state.sortDirection}"` : ""], "Owner", 6)}
    `, 4);
  const parentRow = row(["rowIndex={2}", 'value="project"', "expandable"], `
      ${cell("RowHeader", "rowHeader", ["columnIndex={1}"], "Project", 6)}
      ${cell("Cell", "cell", ["columnIndex={2}"], "Team", 6)}
    `, 4);
  const childRow = row(["rowIndex={3}", 'value="design"', 'parentValue="project"', "level={2}"], `
      ${cell("RowHeader", "rowHeader", ["columnIndex={1}"], "Design review", 6)}
      ${cell("Cell", "cell", ["columnIndex={2}"], "Ava", 6)}
    `, 4);
  const blockedRow = row(["rowIndex={4}", 'value="blocked"', 'parentValue="project"', "level={2}", state?.disableChild ? "disabled" : ""], `
      ${cell("RowHeader", "rowHeader", ["columnIndex={1}"], "Blocked task", 6)}
      ${cell("Cell", "cell", ["columnIndex={2}"], "Noah", 6)}
    `, 4);
  const footerRow = row(["rowIndex={5}", 'value="summary"', "selectable={false}"], `
      ${cell("RowHeader", "rowHeader", ["columnIndex={1}"], "Total", 6)}
      ${cell("Cell", "cell", ["columnIndex={2}"], "3 tasks", 6)}
    `, 4);
  const inner = `
  ${sourceTreeGridElement("Caption", "caption", resolved.composition.caption, partProps("caption"), "Project tree", 2)}
  ${sourceTreeGridElement("Header", "header", resolved.composition.header, partProps("header"), headerRow, 2)}
  ${sourceTreeGridElement("Body", "body", resolved.composition.body, partProps("body"), `${parentRow}\n${childRow}\n${blockedRow}`, 2)}
  ${sourceTreeGridElement("Footer", "footer", resolved.composition.footer, partProps("footer"), footerRow, 2)}
`;
  const source = sourceTreeGridElement("Root", "root", resolved.composition.root, rootProps, inner, 0);
  return state?.directionMode === "provider-rtl" || state?.directionMode === "local-ltr"
    ? `<Direction.Provider dir="rtl">\n  ${source.split("\n").join("\n  ")}\n</Direction.Provider>`
    : source;
}

function sourceTreeGridElement(component: string, part: TreeGridPartKey, composition: CompositionMode, props: string[], children: string, indent: number) {
  const pad = " ".repeat(indent);
  const propText = props.length ? ` ${props.join(" ")}` : "";
  const tag = treeGridNativeTags[part];
  const content = children.trim().includes("\n") ? `\n${children.trim()}\n${pad}` : children;
  if (composition === "asChild") return `${pad}<TreeGrid.${component}${propText} asChild>\n${pad}  <${tag}>${content}</${tag}>\n${pad}</TreeGrid.${component}>`;
  if (composition === "render") return `${pad}<TreeGrid.${component}${propText}\n${pad}  render={(props) => <${tag} {...props}>${content}</${tag}>}\n${pad}/>`;
  return `${pad}<TreeGrid.${component}${propText}>${content}</TreeGrid.${component}>`;
}

function formatCell(cell: { rowIndex: number; columnIndex: number } | null) {
  return cell ? `${cell.rowIndex}:${cell.columnIndex}` : "none";
}

function controlledTreeGridValueOption(value: string | string[] | null) {
  if (Array.isArray(value)) {
    if (value.includes("project") && value.includes("design")) return "project-design";
    return value[0] ?? "none";
  }
  return value ?? "none";
}

function controlledDataGridValueOption(value: string | string[] | null) {
  if (Array.isArray(value)) {
    if (value.includes("alpha") && value.includes("bravo")) return "alpha-bravo";
    return value[0] ?? "none";
  }
  return value ?? "none";
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

const treeStateModeOptions = [
  { label: "Uncontrolled", value: "uncontrolled" },
  { label: "Controlled", value: "controlled" },
];

const treeGridStateModeOptions = treeStateModeOptions;

const dataGridSingleValueOptions = [
  { label: "None", value: "none" },
  { label: "Alpha", value: "alpha" },
  { label: "Bravo", value: "bravo" },
];

const dataGridMultipleValueOptions = [
  ...dataGridSingleValueOptions,
  { label: "Alpha + Bravo", value: "alpha-bravo" },
];

const dataGridActiveCellOptions = [
  { label: "None", value: "none" },
  { label: "Alpha / Name", value: "2:1" },
  { label: "Alpha / Status", value: "2:2" },
  { label: "Bravo / Name", value: "3:1" },
];

const treeGridSingleValueOptions = [
  { label: "Project", value: "project" },
  { label: "Design Review", value: "design" },
];

const treeGridMultipleValueOptions = [
  ...treeGridSingleValueOptions,
  { label: "Project + Design Review", value: "project-design" },
];

const treeValueOptions = [
  { label: "None", value: "none" },
  { label: "Docs", value: "docs" },
  { label: "Components", value: "components" },
  { label: "Docs + Components", value: "docs-components" },
];

const treeOrientationOptions = [
  { label: "Vertical", value: "vertical" },
  { label: "Horizontal", value: "horizontal" },
];

const treeDirectionOptions = [
  { label: "Default", value: "default" },
  { label: "Provider RTL", value: "provider-rtl" },
  { label: "Local LTR", value: "local-ltr" },
  { label: "Local RTL", value: "local-rtl" },
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

const treeParts = [
  "root",
  "item",
  "itemText",
  "group",
] as const satisfies readonly TreePartKey[];

const treeDefaultComposition: Record<TreePartKey, CompositionMode> = {
  root: "default",
  item: "default",
  itemText: "default",
  group: "default",
};

const treeDefaultCustomSlots: Record<TreePartKey, boolean> = {
  root: false,
  item: false,
  itemText: false,
  group: false,
};

const dataGridDefaultCustomSlots: Record<DataGridPartKey, boolean> = {
  root: false, caption: false, header: false, row: false,
  columnHeader: false, body: false, cell: false, footer: false,
};

const dataGridDefaultComposition = Object.fromEntries(
  Object.keys(dataGridDefaultCustomSlots).map((part) => [part, "default"]),
) as Record<DataGridPartKey, CompositionMode>;

const dataGridDefaultRefs = Object.fromEntries(
  Object.keys(dataGridDefaultCustomSlots).map((part) => [part, "none"]),
) as Record<DataGridPartKey, string>;

const dataGridSlotControls: Array<{ part: DataGridPartKey; label: string; value: string }> = [
  { part: "root", label: "Root Slot", value: "root-slot" },
  { part: "caption", label: "Caption Slot", value: "caption-slot" },
  { part: "header", label: "Header Slot", value: "header-slot" },
  { part: "row", label: "Row Slot", value: "row-slot" },
  { part: "columnHeader", label: "Column Header Slot", value: "column-header-slot" },
  { part: "body", label: "Body Slot", value: "body-slot" },
  { part: "cell", label: "Cell Slot", value: "cell-slot" },
  { part: "footer", label: "Footer Slot", value: "footer-slot" },
];

const dataGridCompositionControls = dataGridSlotControls.map(({ part, label }) => ({
  part,
  label: label.replace(" Slot", ""),
}));

const dataGridNativeTags: Record<DataGridPartKey, string> = {
  root: "table",
  caption: "caption",
  header: "thead",
  row: "tr",
  columnHeader: "th",
  body: "tbody",
  cell: "td",
  footer: "tfoot",
};

const treeGridDefaultCustomSlots: Record<TreeGridPartKey, boolean> = {
  root: false, caption: false, header: false, row: false,
  columnHeader: false, body: false, rowHeader: false, cell: false, footer: false,
};

const treeGridDefaultComposition = Object.fromEntries(
  Object.keys(treeGridDefaultCustomSlots).map((part) => [part, "default"]),
) as Record<TreeGridPartKey, CompositionMode>;

const treeGridDefaultRefs = Object.fromEntries(
  Object.keys(treeGridDefaultCustomSlots).map((part) => [part, "none"]),
) as Record<TreeGridPartKey, string>;

const treeGridSlotControls: Array<{ part: TreeGridPartKey; label: string; value: string }> = [
  { part: "root", label: "Root Slot", value: "root-slot" },
  { part: "caption", label: "Caption Slot", value: "caption-slot" },
  { part: "header", label: "Header Slot", value: "header-slot" },
  { part: "row", label: "Row Slot", value: "row-slot" },
  { part: "columnHeader", label: "Column Header Slot", value: "column-header-slot" },
  { part: "body", label: "Body Slot", value: "body-slot" },
  { part: "rowHeader", label: "Row Header Slot", value: "row-header-slot" },
  { part: "cell", label: "Cell Slot", value: "cell-slot" },
  { part: "footer", label: "Footer Slot", value: "footer-slot" },
];

const treeGridCompositionControls = treeGridSlotControls.map(({ part, label }) => ({
  part,
  label: label.replace(" Slot", ""),
}));

const treeGridNativeTags: Record<TreeGridPartKey, string> = {
  root: "table",
  caption: "caption",
  header: "thead",
  row: "tr",
  columnHeader: "th",
  body: "tbody",
  rowHeader: "th",
  cell: "td",
  footer: "tfoot",
};

const treeDefaultRefs: Record<TreePartKey, string> = {
  root: "none",
  item: "none",
  itemText: "none",
  group: "none",
};

const treeSlotValues: Record<TreePartKey, string> = {
  root: "tree-custom",
  item: "tree-item-custom",
  itemText: "tree-item-text-custom",
  group: "tree-group-custom",
};

const treeSlotControls = [
  { part: "root", label: "Root Slot", value: "root-slot" },
  { part: "item", label: "Item Slot", value: "item-slot" },
  { part: "itemText", label: "Item Text Slot", value: "item-text-slot" },
  { part: "group", label: "Group Slot", value: "group-slot" },
] as const satisfies readonly { part: TreePartKey; label: string; value: string }[];

const treeCompositionControls = [
  { part: "root", label: "Root" },
  { part: "item", label: "Item" },
  { part: "itemText", label: "Item Text" },
  { part: "group", label: "Group" },
] as const satisfies readonly { part: TreePartKey; label: string }[];

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
