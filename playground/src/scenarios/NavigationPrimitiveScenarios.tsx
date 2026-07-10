import { Accordion } from "@flowstack-ui/atom/accordion";
import { AppBar } from "@flowstack-ui/atom/app-bar";
import { BottomNavigation } from "@flowstack-ui/atom/bottom-navigation";
import { Breadcrumb } from "@flowstack-ui/atom/breadcrumb";
import { Button } from "@flowstack-ui/atom/button";
import { Direction } from "@flowstack-ui/atom/direction";
import { NavList } from "@flowstack-ui/atom/nav-list";
import { Pagination, usePaginationContext } from "@flowstack-ui/atom/pagination";
import { Tabs } from "@flowstack-ui/atom/tabs";
import { useCallback, useState, type Dispatch, type MouseEvent, type ReactNode, type SetStateAction } from "react";
import { AnatomyPanel, type AnatomySection } from "../AnatomyPanel";
import { ControlToolbar, MenuActionControl, MenuCheckboxControl, MenuRadioControl, partProps, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup } from "../WorkbenchPrimitives";

type CompositionMode = "default" | "asChild" | "render";
type Orientation = "horizontal" | "vertical";
type DirectionMode = "ltr" | "rtl";
type ActivationMode = "automatic" | "manual";
type AppBarPosition = "static" | "absolute" | "sticky" | "fixed";
type AppBarDensity = "compact" | "comfortable";
type AppBarSlotPart = "root" | "toolbar" | "start" | "center" | "end";
type AccordionSlotPart = "root" | "item" | "header" | "trigger" | "content";
type BottomNavigationSlotPart = "root" | "item";
type BreadcrumbSlotPart = "root" | "list" | "item" | "link" | "page" | "separator" | "ellipsis";
type PaginationSlotPart = "root" | "list" | "previous" | "item" | "ellipsis" | "next";
type NavListSlotPart = "root" | "section" | "sectionTrigger" | "sectionLabel" | "sectionContent" | "list" | "item" | "link";
type NavListCurrentToken = "page" | "step" | "location";
type LogEntry = {
  id: number;
  time: string;
  text: string;
};

const appBarSlotParts: AppBarSlotPart[] = ["root", "toolbar", "start", "center", "end"];
const bottomNavigationSlotParts: BottomNavigationSlotPart[] = ["root", "item"];
const breadcrumbSlotParts: BreadcrumbSlotPart[] = ["root", "list", "item", "link", "page", "separator", "ellipsis"];
const paginationSlotParts: PaginationSlotPart[] = ["root", "list", "previous", "item", "ellipsis", "next"];
const navListSlotParts: NavListSlotPart[] = ["root", "section", "sectionTrigger", "sectionLabel", "sectionContent", "list", "item", "link"];

export const navigationPrimitiveScenarioIds = new Set([
  "app-bar",
  "tabs",
  "accordion",
  "breadcrumb",
  "pagination",
  "bottom-navigation",
  "nav-list",
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

export function useNavigationPrimitiveScenarios() {
  return {
    appBar: useAppBarScenario(),
    tabs: useTabsScenario(),
    accordion: useAccordionScenario(),
    breadcrumb: useBreadcrumbScenario(),
    pagination: usePaginationScenario(),
    bottomNavigation: useBottomNavigationScenario(),
    navList: useNavListScenario(),
  };
}

function useAppBarScenario() {
  const [position, setPosition] = useState<AppBarPosition>("static");
  const [density, setDensity] = useState<AppBarDensity>("comfortable");
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [toolbarComposition, setToolbarComposition] = useState<CompositionMode>("default");
  const [startComposition, setStartComposition] = useState<CompositionMode>("default");
  const [centerComposition, setCenterComposition] = useState<CompositionMode>("default");
  const [endComposition, setEndComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customSlots, setCustomSlots] = useState<Record<AppBarSlotPart, boolean>>({
    root: false,
    toolbar: false,
    start: false,
    center: false,
    end: false,
  });
  const [refs, setRefs] = useState<Record<AppBarSlotPart, string>>({
    root: "none",
    toolbar: "none",
    start: "none",
    center: "none",
    end: "none",
  });
  const { log, addLog, clearLog } = useScenarioLog();

  const markPartRef = useCallback((part: AppBarSlotPart, element: HTMLElement | null) => {
    if (!element) return;
    const nextValue = element?.tagName.toLowerCase() ?? "none";
    setRefs((current) => {
      if (current[part] === nextValue) return current;
      return { ...current, [part]: nextValue };
    });
  }, []);
  const markRootRef = useCallback((element: HTMLElement | null) => markPartRef("root", element), [markPartRef]);
  const markToolbarRef = useCallback((element: HTMLElement | null) => markPartRef("toolbar", element), [markPartRef]);
  const markStartRef = useCallback((element: HTMLElement | null) => markPartRef("start", element), [markPartRef]);
  const markCenterRef = useCallback((element: HTMLElement | null) => markPartRef("center", element), [markPartRef]);
  const markEndRef = useCallback((element: HTMLElement | null) => markPartRef("end", element), [markPartRef]);

  return {
    state: {
      position,
      density,
      rootComposition,
      toolbarComposition,
      startComposition,
      centerComposition,
      endComposition,
      propCheck,
      customSlots,
      refs,
      log,
    },
    actions: {
      setPosition,
      setDensity,
      setRootComposition,
      setToolbarComposition,
      setStartComposition,
      setCenterComposition,
      setEndComposition,
      setPropCheck,
      setCustomSlot: (part: AppBarSlotPart, checked: boolean) => {
        setCustomSlots((current) => ({ ...current, [part]: checked }));
      },
      markRootRef,
      markToolbarRef,
      markStartRef,
      markCenterRef,
      markEndRef,
      clearLog,
      noteAction: (label: string) => addLog(`action ${label}`),
    },
  };
}

function useTabsScenario() {
  const [controlled, setControlled] = useState(true);
  const [value, setValue] = useState("overview");
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [activationMode, setActivationMode] = useState<ActivationMode>("automatic");
  const [loop, setLoop] = useState(true);
  const [disabledTab, setDisabledTab] = useState(true);
  const [keepMounted, setKeepMounted] = useState(false);
  const [focusablePanel, setFocusablePanel] = useState(false);
  const [triggerComposition, setTriggerComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: {
      controlled,
      value,
      orientation,
      activationMode,
      loop,
      disabledTab,
      keepMounted,
      focusablePanel,
      triggerComposition,
      log,
    },
    actions: {
      setControlled,
      setOrientation,
      setActivationMode,
      setLoop,
      setDisabledTab,
      setKeepMounted,
      setFocusablePanel,
      setTriggerComposition,
      clearLog,
      setValue: (next: string) => {
        setValue(next);
        addLog(`tab changed to ${next}`);
      },
    },
  };
}

function useAccordionScenario() {
  const [controlled, setControlled] = useState(false);
  const [multiple, setMultiple] = useState(false);
  const [value, setValue] = useState<string | string[]>("general");
  const [collapsible, setCollapsible] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [disabledItem, setDisabledItem] = useState(true);
  const [keepMounted, setKeepMounted] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [dir, setDir] = useState<DirectionMode>("ltr");
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [itemComposition, setItemComposition] = useState<CompositionMode>("default");
  const [headerComposition, setHeaderComposition] = useState<CompositionMode>("default");
  const [triggerComposition, setTriggerComposition] = useState<CompositionMode>("default");
  const [contentComposition, setContentComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customSlots, setCustomSlots] = useState<Record<AccordionSlotPart, boolean>>({
    root: false,
    item: false,
    header: false,
    trigger: false,
    content: false,
  });
  const { log, addLog, clearLog } = useScenarioLog();

  const setTypeMultiple = (next: boolean) => {
    setMultiple(next);
    setValue(next ? ["general"] : "general");
  };

  const setControlledValue = (next: string) => {
    const nextValue = multiple
      ? next === "none"
        ? []
        : next.split(", ")
      : next === "none"
        ? ""
        : next;
    setValue(nextValue);
    addLog(`external value set to ${formatAccordionValueLabel(nextValue)}`);
  };

  const handleValueChange = (next: string | string[]) => {
    setValue(next);
    addLog(`value changed to ${formatAccordionValueLabel(next)}`);
  };

  return {
    state: {
      controlled,
      multiple,
      value,
      collapsible,
      disabled,
      disabledItem,
      keepMounted,
      orientation,
      dir,
      rootComposition,
      itemComposition,
      headerComposition,
      triggerComposition,
      contentComposition,
      propCheck,
      customSlots,
      log,
    },
    actions: {
      setControlled,
      setMultiple: setTypeMultiple,
      setControlledValue,
      setCollapsible,
      setDisabled,
      setDisabledItem,
      setKeepMounted,
      setOrientation,
      setDir,
      setRootComposition,
      setItemComposition,
      setHeaderComposition,
      setTriggerComposition,
      setContentComposition,
      setPropCheck,
      setCustomSlot: (part: AccordionSlotPart, checked: boolean) => setCustomSlots((slots) => ({ ...slots, [part]: checked })),
      handleValueChange,
      clearLog,
    },
  };
}

function useBreadcrumbScenario() {
  const [showEllipsis, setShowEllipsis] = useState(true);
  const [customSeparator, setCustomSeparator] = useState(false);
  const [rootAriaLabel, setRootAriaLabel] = useState(false);
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [listComposition, setListComposition] = useState<CompositionMode>("default");
  const [itemComposition, setItemComposition] = useState<CompositionMode>("default");
  const [linkComposition, setLinkComposition] = useState<CompositionMode>("default");
  const [pageComposition, setPageComposition] = useState<CompositionMode>("default");
  const [separatorComposition, setSeparatorComposition] = useState<CompositionMode>("default");
  const [ellipsisComposition, setEllipsisComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customSlots, setCustomSlots] = useState<Record<BreadcrumbSlotPart, boolean>>({
    root: false,
    list: false,
    item: false,
    link: false,
    page: false,
    separator: false,
    ellipsis: false,
  });
  const [refs, setRefs] = useState<Record<BreadcrumbSlotPart, string>>({
    root: "none",
    list: "none",
    item: "none",
    link: "none",
    page: "none",
    separator: "none",
    ellipsis: "none",
  });
  const { log, addLog, clearLog } = useScenarioLog();

  const markPartRef = useCallback((part: BreadcrumbSlotPart, element: HTMLElement | null) => {
    if (!element) return;
    const nextValue = element.tagName.toLowerCase();
    setRefs((current) => {
      if (current[part] === nextValue) return current;
      return { ...current, [part]: nextValue };
    });
  }, []);

  return {
    state: {
      showEllipsis,
      customSeparator,
      rootAriaLabel,
      rootComposition,
      listComposition,
      itemComposition,
      linkComposition,
      pageComposition,
      separatorComposition,
      ellipsisComposition,
      propCheck,
      customSlots,
      refs,
      log,
    },
    actions: {
      setShowEllipsis,
      setCustomSeparator,
      setRootAriaLabel,
      setRootComposition,
      setListComposition,
      setItemComposition,
      setLinkComposition,
      setPageComposition,
      setSeparatorComposition,
      setEllipsisComposition,
      setPropCheck,
      setCustomSlot: (part: BreadcrumbSlotPart, checked: boolean) => setCustomSlots((slots) => ({ ...slots, [part]: checked })),
      markPartRef,
      clearLog,
      noteLink: (label: string) => addLog(`link clicked ${label}`),
    },
  };
}

function usePaginationScenario() {
  const [controlled, setControlled] = useState(false);
  const [page, setPage] = useState(1);
  const [defaultPage, setDefaultPage] = useState<"default" | "4">("default");
  const [totalPages, setTotalPages] = useState("10");
  const [siblingCount, setSiblingCount] = useState("1");
  const [boundaryCount, setBoundaryCount] = useState("1");
  const [disabled, setDisabled] = useState(false);
  const [localizedLabels, setLocalizedLabels] = useState(false);
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [listComposition, setListComposition] = useState<CompositionMode>("default");
  const [previousComposition, setPreviousComposition] = useState<CompositionMode>("default");
  const [itemComposition, setItemComposition] = useState<CompositionMode>("default");
  const [ellipsisComposition, setEllipsisComposition] = useState<CompositionMode>("default");
  const [nextComposition, setNextComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customSlots, setCustomSlots] = useState<Record<PaginationSlotPart, boolean>>({
    root: false,
    list: false,
    previous: false,
    item: false,
    ellipsis: false,
    next: false,
  });
  const [refs, setRefs] = useState<Record<PaginationSlotPart, string>>({
    root: "none",
    list: "none",
    previous: "none",
    item: "none",
    ellipsis: "none",
    next: "none",
  });
  const { log, addLog, clearLog } = useScenarioLog();

  const markPartRef = useCallback((part: PaginationSlotPart, element: HTMLElement | null) => {
    if (!element) return;
    const nextValue = element.tagName.toLowerCase();
    setRefs((current) => {
      if (current[part] === nextValue) return current;
      return { ...current, [part]: nextValue };
    });
  }, []);

  return {
    state: {
      controlled,
      page,
      defaultPage,
      totalPages,
      siblingCount,
      boundaryCount,
      disabled,
      localizedLabels,
      rootComposition,
      listComposition,
      previousComposition,
      itemComposition,
      ellipsisComposition,
      nextComposition,
      propCheck,
      customSlots,
      refs,
      log,
    },
    actions: {
      setControlled: (nextControlled: boolean) => {
        setControlled(nextControlled);
        if (!nextControlled) {
          setPage(defaultPage === "4" ? 4 : 1);
        }
      },
      setControlledPage: setPage,
      setDefaultPage: (nextDefaultPage: "default" | "4") => {
        setDefaultPage(nextDefaultPage);
        setPage(nextDefaultPage === "4" ? 4 : 1);
      },
      setTotalPages,
      setSiblingCount,
      setBoundaryCount,
      setDisabled,
      setLocalizedLabels,
      setRootComposition,
      setListComposition,
      setPreviousComposition,
      setItemComposition,
      setEllipsisComposition,
      setNextComposition,
      setPropCheck,
      setCustomSlot: (part: PaginationSlotPart, checked: boolean) => setCustomSlots((slots) => ({ ...slots, [part]: checked })),
      markPartRef,
      clearLog,
      setPage: (next: number) => {
        setPage(next);
        addLog(`page changed to ${next}`);
      },
    },
  };
}

function useBottomNavigationScenario() {
  const [controlled, setControlled] = useState(true);
  const [value, setValue] = useState("home");
  const [showLabels, setShowLabels] = useState(true);
  const [disabledItem, setDisabledItem] = useState(true);
  const [linkItem, setLinkItem] = useState(false);
  const [blockSearchEvent, setBlockSearchEvent] = useState(false);
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [itemComposition, setItemComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customSlots, setCustomSlots] = useState<Record<BottomNavigationSlotPart, boolean>>({
    root: false,
    item: false,
  });
  const [refs, setRefs] = useState<Record<BottomNavigationSlotPart, string>>({
    root: "none",
    item: "none",
  });
  const { log, addLog, clearLog } = useScenarioLog();

  const markPartRef = useCallback((part: BottomNavigationSlotPart, element: HTMLElement | null) => {
    if (!element) return;
    const nextValue = element.tagName.toLowerCase();
    setRefs((current) => {
      if (current[part] === nextValue) return current;
      return { ...current, [part]: nextValue };
    });
  }, []);
  const markRootRef = useCallback((element: HTMLElement | null) => markPartRef("root", element), [markPartRef]);
  const markItemRef = useCallback((element: HTMLElement | null) => markPartRef("item", element), [markPartRef]);

  return {
    state: {
      controlled,
      value,
      showLabels,
      disabledItem,
      linkItem,
      blockSearchEvent,
      rootComposition,
      itemComposition,
      propCheck,
      customSlots,
      refs,
      log,
    },
    actions: {
      setControlled,
      setShowLabels,
      setDisabledItem,
      setLinkItem,
      setBlockSearchEvent,
      setRootComposition,
      setItemComposition,
      setPropCheck,
      setCustomSlot: (part: BottomNavigationSlotPart, checked: boolean) => {
        setCustomSlots((current) => ({ ...current, [part]: checked }));
      },
      markRootRef,
      markItemRef,
      clearLog,
      setValue: (next: string) => {
        setValue(next);
        addLog(`destination changed to ${next}`);
      },
      preventSearch: (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        addLog("search event prevented");
      },
    },
  };
}

function useNavListScenario() {
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [ordered, setOrdered] = useState(false);
  const [active, setActive] = useState("overview");
  const [currentToken, setCurrentToken] = useState<NavListCurrentToken>("page");
  const [collapsible, setCollapsible] = useState(true);
  const [sectionControlled, setSectionControlled] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(true);
  const [defaultSectionOpen, setDefaultSectionOpenState] = useState(true);
  const [forceMount, setForceMount] = useState(false);
  const [disabledSection, setDisabledSection] = useState(false);
  const [disabledLink, setDisabledLink] = useState(false);
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [sectionComposition, setSectionComposition] = useState<CompositionMode>("default");
  const [sectionTriggerComposition, setSectionTriggerComposition] = useState<CompositionMode>("default");
  const [sectionLabelComposition, setSectionLabelComposition] = useState<CompositionMode>("default");
  const [sectionContentComposition, setSectionContentComposition] = useState<CompositionMode>("default");
  const [listComposition, setListComposition] = useState<CompositionMode>("default");
  const [itemComposition, setItemComposition] = useState<CompositionMode>("default");
  const [linkComposition, setLinkComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customSlots, setCustomSlots] = useState<Record<NavListSlotPart, boolean>>({
    root: false,
    section: false,
    sectionTrigger: false,
    sectionLabel: false,
    sectionContent: false,
    list: false,
    item: false,
    link: false,
  });
  const [refs, setRefs] = useState<Record<NavListSlotPart, string>>({
    root: "none",
    section: "none",
    sectionTrigger: "none",
    sectionLabel: "none",
    sectionContent: "none",
    list: "none",
    item: "none",
    link: "none",
  });
  const { log, addLog, clearLog } = useScenarioLog();

  const markPartRef = useCallback((part: NavListSlotPart, element: HTMLElement | null) => {
    if (!element) return;
    const nextValue = element.tagName.toLowerCase();
    setRefs((current) => {
      if (current[part] === nextValue) return current;
      return { ...current, [part]: nextValue };
    });
  }, []);

  return {
    state: {
      orientation,
      ordered,
      active,
      currentToken,
      collapsible,
      sectionControlled,
      sectionOpen,
      defaultSectionOpen,
      forceMount,
      disabledSection,
      disabledLink,
      rootComposition,
      sectionComposition,
      sectionTriggerComposition,
      sectionLabelComposition,
      sectionContentComposition,
      listComposition,
      itemComposition,
      linkComposition,
      propCheck,
      customSlots,
      refs,
      log,
    },
    actions: {
      setOrientation,
      setOrdered,
      setCurrentToken,
      setCollapsible,
      setSectionControlled: (controlled: boolean) => {
        setSectionControlled(controlled);
        if (!controlled) setSectionOpen(defaultSectionOpen);
      },
      setDefaultSectionOpen: (open: boolean) => {
        setDefaultSectionOpenState(open);
        setSectionOpen(open);
      },
      setControlledSectionOpen: (open: boolean) => {
        setSectionOpen(open);
        addLog(`section ${open ? "opened" : "closed"} by toolbar`);
      },
      setForceMount,
      setDisabledSection,
      setDisabledLink,
      setRootComposition,
      setSectionComposition,
      setSectionTriggerComposition,
      setSectionLabelComposition,
      setSectionContentComposition,
      setListComposition,
      setItemComposition,
      setLinkComposition,
      setPropCheck,
      setCustomSlot: (part: NavListSlotPart, checked: boolean) => {
        setCustomSlots((current) => ({ ...current, [part]: checked }));
      },
      markRootRef: (element: HTMLElement | null) => markPartRef("root", element),
      markSectionRef: (element: HTMLElement | null) => markPartRef("section", element),
      markSectionTriggerRef: (element: HTMLElement | null) => markPartRef("sectionTrigger", element),
      markSectionLabelRef: (element: HTMLElement | null) => markPartRef("sectionLabel", element),
      markSectionContentRef: (element: HTMLElement | null) => markPartRef("sectionContent", element),
      markListRef: (element: HTMLElement | null) => markPartRef("list", element),
      markItemRef: (element: HTMLElement | null) => markPartRef("item", element),
      markLinkRef: (element: HTMLElement | null) => markPartRef("link", element),
      clearLog,
      setActive: (next: string) => {
        setActive(next);
        addLog(`active link ${next}`);
      },
      noteSectionOpen: (open: boolean) => {
        setSectionOpen(open);
        addLog(`section ${open ? "opened" : "closed"}`);
      },
    },
  };
}

export type NavigationPrimitiveScenarios = ReturnType<typeof useNavigationPrimitiveScenarios>;

export function NavigationPrimitiveScenarioToolbar({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: NavigationPrimitiveScenarios;
}) {
  if (scenarioId === "app-bar") {
    const scenario = scenarios.appBar;
    return (
      <ControlToolbar label="App Bar controls">
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Position" options={appBarPositionOptions} value={scenario.state.position} onChange={scenario.actions.setPosition} />
          <MenuRadioControl label="Density" options={appBarDensityOptions} value={scenario.state.density} onChange={scenario.actions.setDensity} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="Toolbar" options={compositionOptions} value={scenario.state.toolbarComposition} onChange={scenario.actions.setToolbarComposition} />
          <MenuRadioControl label="Start" options={compositionOptions} value={scenario.state.startComposition} onChange={scenario.actions.setStartComposition} />
          <MenuRadioControl label="Center" options={compositionOptions} value={scenario.state.centerComposition} onChange={scenario.actions.setCenterComposition} />
          <MenuRadioControl label="End" options={compositionOptions} value={scenario.state.endComposition} onChange={scenario.actions.setEndComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={appBarSlotParts.map((part) => ({
            checked: scenario.state.customSlots[part],
            label: `${formatAppBarSlotLabel(part)} Slot`,
            value: `${part}-slot`,
            onChange: (checked) => scenario.actions.setCustomSlot(part, checked),
          }))}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "tabs") {
    const scenario = scenarios.tabs;
    return (
      <ControlToolbar label="Tabs controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.loop} label="Loop" value="loop" onChange={scenario.actions.setLoop} />
          <MenuCheckboxControl checked={scenario.state.disabledTab} label="Disabled Tab" value="disabled-tab" onChange={scenario.actions.setDisabledTab} />
          <MenuCheckboxControl checked={scenario.state.keepMounted} label="Keep Mounted" value="keep-mounted" onChange={scenario.actions.setKeepMounted} />
          <MenuCheckboxControl checked={scenario.state.focusablePanel} label="Focusable Panel" value="focusable-panel" onChange={scenario.actions.setFocusablePanel} />
        </ToolbarGroup>
        <ToolbarGroup title="Keyboard" value="keyboard">
          <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
          <MenuRadioControl label="Activation" options={activationModeOptions} value={scenario.state.activationMode} onChange={scenario.actions.setActivationMode} />
        </ToolbarGroup>
        <CompositionToolbarGroup label="Trigger" value={scenario.state.triggerComposition} onChange={scenario.actions.setTriggerComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "accordion") {
    const scenario = scenarios.accordion;
    return (
      <ControlToolbar label="Accordion controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.multiple} label="Multiple" value="multiple" onChange={scenario.actions.setMultiple} />
          {scenario.state.controlled ? (
            <MenuRadioControl label="Value" options={scenario.state.multiple ? accordionMultipleValueOptions : accordionSingleValueOptions} value={getAccordionControlledValueOption(scenario.state.value)} onChange={scenario.actions.setControlledValue} />
          ) : null}
          {!scenario.state.multiple ? (
            <MenuCheckboxControl checked={scenario.state.collapsible} label="Collapsible" value="collapsible" onChange={scenario.actions.setCollapsible} />
          ) : null}
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.disabledItem} label="Disabled Item" value="disabled-item" onChange={scenario.actions.setDisabledItem} />
          <MenuCheckboxControl checked={scenario.state.keepMounted} label="Keep Mounted" value="keep-mounted" onChange={scenario.actions.setKeepMounted} />
        </ToolbarGroup>
        <ToolbarGroup title="Keyboard" value="keyboard">
          <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
          <MenuRadioControl label="Direction" options={directionOptions} value={scenario.state.dir} onChange={scenario.actions.setDir} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="Item" options={compositionOptions} value={scenario.state.itemComposition} onChange={scenario.actions.setItemComposition} />
          <MenuRadioControl label="Header" options={compositionOptions} value={scenario.state.headerComposition} onChange={scenario.actions.setHeaderComposition} />
          <MenuRadioControl label="Trigger" options={compositionOptions} value={scenario.state.triggerComposition} onChange={scenario.actions.setTriggerComposition} />
          <MenuRadioControl label="Content" options={compositionOptions} value={scenario.state.contentComposition} onChange={scenario.actions.setContentComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={accordionSlotParts.map((part) => ({
            checked: scenario.state.customSlots[part],
            label: `${formatAccordionSlotLabel(part)} Slot`,
            value: `${part}-slot`,
            onChange: (checked) => scenario.actions.setCustomSlot(part, checked),
          }))}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "breadcrumb") {
    const scenario = scenarios.breadcrumb;
    return (
      <ControlToolbar label="Breadcrumb controls">
        <ToolbarGroup title="Content" value="content">
          <MenuCheckboxControl checked={scenario.state.showEllipsis} label="Ellipsis" value="ellipsis" onChange={scenario.actions.setShowEllipsis} />
          <MenuCheckboxControl checked={scenario.state.customSeparator} label="Custom Separator" value="custom-separator" onChange={scenario.actions.setCustomSeparator} />
        </ToolbarGroup>
        <ToolbarGroup title="ARIA" value="aria">
          <MenuCheckboxControl checked={scenario.state.rootAriaLabel} label="Root ariaLabel" value="root-aria-label" onChange={scenario.actions.setRootAriaLabel} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="List" options={compositionOptions} value={scenario.state.listComposition} onChange={scenario.actions.setListComposition} />
          <MenuRadioControl label="Item" options={compositionOptions} value={scenario.state.itemComposition} onChange={scenario.actions.setItemComposition} />
          <MenuRadioControl label="Link" options={compositionOptions} value={scenario.state.linkComposition} onChange={scenario.actions.setLinkComposition} />
          <MenuRadioControl label="Page" options={compositionOptions} value={scenario.state.pageComposition} onChange={scenario.actions.setPageComposition} />
          <MenuRadioControl label="Separator" options={compositionOptions} value={scenario.state.separatorComposition} onChange={scenario.actions.setSeparatorComposition} />
          <MenuRadioControl label="Ellipsis" options={compositionOptions} value={scenario.state.ellipsisComposition} onChange={scenario.actions.setEllipsisComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={breadcrumbSlotParts.map((part) => ({
            checked: scenario.state.customSlots[part],
            label: `${formatBreadcrumbSlotLabel(part)} Slot`,
            value: `${part}-slot`,
            onChange: (checked) => scenario.actions.setCustomSlot(part, checked),
          }))}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "pagination") {
    const scenario = scenarios.pagination;
    return (
      <ControlToolbar label="Pagination controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.localizedLabels} label="Localized Labels" value="localized-labels" onChange={scenario.actions.setLocalizedLabels} />
          <MenuRadioControl label="Total Pages" options={pageTotalOptions} value={scenario.state.totalPages} onChange={scenario.actions.setTotalPages} />
          <MenuRadioControl label="Sibling Count" options={countOptions} value={scenario.state.siblingCount} onChange={scenario.actions.setSiblingCount} />
          <MenuRadioControl label="Boundary Count" options={countOptions} value={scenario.state.boundaryCount} onChange={scenario.actions.setBoundaryCount} />
        </ToolbarGroup>
        {scenario.state.controlled ? (
          <ToolbarGroup title="Page" value="page">
            <MenuRadioControl
              label="Controlled Page"
              options={paginationPageOptions}
              value={String(scenario.state.page)}
              onChange={(nextPage) => scenario.actions.setControlledPage(Number(nextPage))}
            />
          </ToolbarGroup>
        ) : (
          <ToolbarGroup title="Page" value="page">
            <MenuRadioControl
              label="Default Page"
              options={paginationDefaultPageOptions}
              value={scenario.state.defaultPage}
              onChange={scenario.actions.setDefaultPage}
            />
          </ToolbarGroup>
        )}
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="List" options={compositionOptions} value={scenario.state.listComposition} onChange={scenario.actions.setListComposition} />
          <MenuRadioControl label="Previous" options={compositionOptions} value={scenario.state.previousComposition} onChange={scenario.actions.setPreviousComposition} />
          <MenuRadioControl label="Item" options={compositionOptions} value={scenario.state.itemComposition} onChange={scenario.actions.setItemComposition} />
          <MenuRadioControl label="Ellipsis" options={compositionOptions} value={scenario.state.ellipsisComposition} onChange={scenario.actions.setEllipsisComposition} />
          <MenuRadioControl label="Next" options={compositionOptions} value={scenario.state.nextComposition} onChange={scenario.actions.setNextComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={paginationSlotParts.map((part) => ({
            checked: scenario.state.customSlots[part],
            label: `${formatPaginationSlotLabel(part)} Slot`,
            value: `${part}-slot`,
            onChange: (checked) => scenario.actions.setCustomSlot(part, checked),
          }))}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "bottom-navigation") {
    const scenario = scenarios.bottomNavigation;
    return (
      <ControlToolbar label="Bottom Navigation controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.showLabels} label="Show Labels" value="show-labels" onChange={scenario.actions.setShowLabels} />
          <MenuCheckboxControl checked={scenario.state.disabledItem} label="Disabled Item" value="disabled-item" onChange={scenario.actions.setDisabledItem} />
          <MenuCheckboxControl checked={scenario.state.linkItem} label="Link Item" value="link-item" onChange={scenario.actions.setLinkItem} />
          <MenuCheckboxControl checked={scenario.state.blockSearchEvent} label="Block Search Event" value="block-search-event" onChange={scenario.actions.setBlockSearchEvent} />
        </ToolbarGroup>
        {scenario.state.controlled ? (
          <ToolbarGroup title="Value" value="value">
            <MenuRadioControl label="Controlled Value" options={bottomNavigationValueOptions} value={scenario.state.value} onChange={scenario.actions.setValue} />
          </ToolbarGroup>
        ) : null}
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="Item" options={compositionOptions} value={scenario.state.itemComposition} onChange={scenario.actions.setItemComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={bottomNavigationSlotParts.map((part) => ({
            checked: scenario.state.customSlots[part],
            label: `${formatBottomNavigationSlotLabel(part)} Slot`,
            value: `${part}-slot`,
            onChange: (checked) => scenario.actions.setCustomSlot(part, checked),
          }))}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "nav-list") {
    const scenario = scenarios.navList;
    return (
      <ControlToolbar label="Nav List controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.ordered} label="Ordered List" value="ordered" onChange={scenario.actions.setOrdered} />
          <MenuCheckboxControl checked={scenario.state.collapsible} label="Collapsible Section" value="collapsible" onChange={scenario.actions.setCollapsible} />
          <MenuCheckboxControl checked={scenario.state.forceMount} label="Force Mount" value="force-mount" onChange={scenario.actions.setForceMount} />
          <MenuCheckboxControl checked={scenario.state.disabledSection} label="Disable Project Trigger" value="disable-project-trigger" onChange={scenario.actions.setDisabledSection} />
          <MenuCheckboxControl checked={scenario.state.disabledLink} label="Disable Archive" value="disable-archive" onChange={scenario.actions.setDisabledLink} />
          <MenuRadioControl label="aria-current" options={navListCurrentTokenOptions} value={scenario.state.currentToken} onChange={scenario.actions.setCurrentToken} />
        </ToolbarGroup>
        <ToolbarGroup title="Section" value="section">
          <MenuCheckboxControl checked={scenario.state.sectionControlled} label="Controlled" value="controlled-section" onChange={scenario.actions.setSectionControlled} />
          {scenario.state.sectionControlled ? (
            <>
              <MenuActionControl disabled={scenario.state.sectionOpen} label="Open" value="open-section" onSelect={() => scenario.actions.setControlledSectionOpen(true)} />
              <MenuActionControl disabled={!scenario.state.sectionOpen} label="Close" value="close-section" onSelect={() => scenario.actions.setControlledSectionOpen(false)} />
            </>
          ) : (
            <MenuCheckboxControl checked={scenario.state.defaultSectionOpen} label="Default Open" value="default-open" onChange={scenario.actions.setDefaultSectionOpen} />
          )}
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="Section" options={compositionOptions} value={scenario.state.sectionComposition} onChange={scenario.actions.setSectionComposition} />
          <MenuRadioControl label="Trigger" options={compositionOptions} value={scenario.state.sectionTriggerComposition} onChange={scenario.actions.setSectionTriggerComposition} />
          <MenuRadioControl label="Label" options={compositionOptions} value={scenario.state.sectionLabelComposition} onChange={scenario.actions.setSectionLabelComposition} />
          <MenuRadioControl label="Content" options={compositionOptions} value={scenario.state.sectionContentComposition} onChange={scenario.actions.setSectionContentComposition} />
          <MenuRadioControl label="List" options={compositionOptions} value={scenario.state.listComposition} onChange={scenario.actions.setListComposition} />
          <MenuRadioControl label="Item" options={compositionOptions} value={scenario.state.itemComposition} onChange={scenario.actions.setItemComposition} />
          <MenuRadioControl label="Link" options={compositionOptions} value={scenario.state.linkComposition} onChange={scenario.actions.setLinkComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={navListSlotParts.map((part) => ({
            checked: scenario.state.customSlots[part],
            label: `${formatNavListSlotLabel(part)} Slot`,
            value: `${part}-slot`,
            onChange: (checked) => scenario.actions.setCustomSlot(part, checked),
          }))}
        />
      </ControlToolbar>
    );
  }

  return null;
}

export function NavigationPrimitiveScenarioCanvas({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: NavigationPrimitiveScenarios;
}) {
  if (scenarioId === "app-bar") return <AppBarCanvas scenario={scenarios.appBar} />;
  if (scenarioId === "tabs") return <TabsCanvas scenario={scenarios.tabs} />;
  if (scenarioId === "accordion") return <AccordionCanvas scenario={scenarios.accordion} />;
  if (scenarioId === "breadcrumb") return <BreadcrumbCanvas scenario={scenarios.breadcrumb} />;
  if (scenarioId === "pagination") return <PaginationCanvas scenario={scenarios.pagination} />;
  if (scenarioId === "bottom-navigation") return <BottomNavigationCanvas scenario={scenarios.bottomNavigation} />;
  if (scenarioId === "nav-list") return <NavListCanvas scenario={scenarios.navList} />;
  return null;
}

function AppBarCanvas({ scenario }: { scenario: ReturnType<typeof useAppBarScenario> }) {
  const state = scenario.state;
  const content = (
    <AppBarToolbarPart scenario={scenario}>
      <AppBarSectionPart label="Flowstack" part="start" scenario={scenario} />
      <AppBarSectionPart label="Dashboard" part="center" scenario={scenario} />
      <AppBarSectionPart part="end" scenario={scenario}>
        <Button.Root className="atom-button secondary" onPress={() => scenario.actions.noteAction("settings")}>Settings</Button.Root>
      </AppBarSectionPart>
    </AppBarToolbarPart>
  );
  const props = {
    "aria-label": "Demo app bar",
    className: "playground-appbar",
    position: state.position,
    ref: scenario.actions.markRootRef,
    ...partProps("root", { propCheck: state.propCheck, customSlot: state.customSlots.root }, "appbar-custom"),
  };

  if (state.rootComposition === "asChild") {
    return (
      <AppBar.Root {...props} asChild>
        <section>{content}</section>
      </AppBar.Root>
    );
  }

  if (state.rootComposition === "render") {
    return (
      <AppBar.Root {...props} render={(renderProps) => <section {...renderProps} />}>
        {content}
      </AppBar.Root>
    );
  }

  return <AppBar.Root {...props}>{content}</AppBar.Root>;
}

function AppBarToolbarPart({ scenario, children }: { scenario: ReturnType<typeof useAppBarScenario>; children: ReactNode }) {
  const state = scenario.state;
  const props = {
    className: "playground-appbar-toolbar",
    density: state.density,
    ref: scenario.actions.markToolbarRef,
    ...partProps("toolbar", { propCheck: state.propCheck, customSlot: state.customSlots.toolbar }, "appbar-toolbar-custom"),
  };

  if (state.toolbarComposition === "asChild") {
    return (
      <AppBar.Toolbar {...props} asChild>
        <nav>{children}</nav>
      </AppBar.Toolbar>
    );
  }

  if (state.toolbarComposition === "render") {
    return (
      <AppBar.Toolbar {...props} render={(renderProps) => <nav {...renderProps} />}>
        {children}
      </AppBar.Toolbar>
    );
  }

  return <AppBar.Toolbar {...props}>{children}</AppBar.Toolbar>;
}

function AppBarSectionPart({
  children,
  label,
  part,
  scenario,
}: {
  children?: ReactNode;
  label?: string;
  part: "start" | "center" | "end";
  scenario: ReturnType<typeof useAppBarScenario>;
}) {
  const state = scenario.state;
  const Component = part === "start" ? AppBar.Start : part === "center" ? AppBar.Center : AppBar.End;
  const composition = part === "start" ? state.startComposition : part === "center" ? state.centerComposition : state.endComposition;
  const props = {
    className: "playground-appbar-section",
    ref: part === "start" ? scenario.actions.markStartRef : part === "center" ? scenario.actions.markCenterRef : scenario.actions.markEndRef,
    ...partProps(part, { propCheck: state.propCheck, customSlot: state.customSlots[part] }, `appbar-${part}-custom`),
  };
  const content = children ?? label;

  if (composition === "asChild") {
    return (
      <Component {...props} asChild>
        <span>{content}</span>
      </Component>
    );
  }

  if (composition === "render") {
    return (
      <Component {...props} render={(renderProps) => <span {...renderProps} />}>
        {content}
      </Component>
    );
  }

  return <Component {...props}>{content}</Component>;
}

function TabsCanvas({ scenario }: { scenario: ReturnType<typeof useTabsScenario> }) {
  const state = scenario.state;

  return (
    <Tabs.Root
      activationMode={state.activationMode}
      className="playground-tabs"
      data-prop-check="root"
      defaultValue={state.controlled ? undefined : "overview"}
      loop={state.loop}
      onValueChange={scenario.actions.setValue}
      orientation={state.orientation}
      value={state.controlled ? state.value : undefined}
    >
      <Tabs.List ariaLabel="Project sections" className="playground-tabs-list" data-prop-check="list">
        <TabsTrigger mode={state.triggerComposition} value="overview">Overview</TabsTrigger>
        <TabsTrigger mode={state.triggerComposition} value="settings">Settings</TabsTrigger>
        <TabsTrigger mode={state.triggerComposition} disabled={state.disabledTab} value="billing">Billing</TabsTrigger>
        <Tabs.Indicator className="playground-tabs-indicator" data-prop-check="indicator" />
      </Tabs.List>
      <Tabs.Content className="playground-tabs-content" data-prop-check="content-overview" focusable={state.focusablePanel} keepMounted={state.keepMounted} value="overview">Overview panel</Tabs.Content>
      <Tabs.Content className="playground-tabs-content" data-prop-check="content-settings" focusable={state.focusablePanel} keepMounted={state.keepMounted} value="settings">Settings panel</Tabs.Content>
      <Tabs.Content className="playground-tabs-content" data-prop-check="content-billing" focusable={state.focusablePanel} keepMounted={state.keepMounted} value="billing">Billing panel</Tabs.Content>
    </Tabs.Root>
  );
}

function TabsTrigger({ children, disabled, mode, value }: { children: ReactNode; disabled?: boolean; mode: CompositionMode; value: string }) {
  if (mode === "asChild") {
    return (
      <Tabs.Trigger asChild disabled={disabled} value={value} data-prop-check={`trigger-${value}`}>
        <button type="button">{children}</button>
      </Tabs.Trigger>
    );
  }

  if (mode === "render") {
    return (
      <Tabs.Trigger disabled={disabled} render={(props) => <button {...props} />} value={value} data-prop-check={`trigger-${value}`}>
        {children}
      </Tabs.Trigger>
    );
  }

  return <Tabs.Trigger className="playground-tabs-trigger" disabled={disabled} value={value} data-prop-check={`trigger-${value}`}>{children}</Tabs.Trigger>;
}

function AccordionCanvas({ scenario }: { scenario: ReturnType<typeof useAccordionScenario> }) {
  const state = scenario.state;
  const commonProps = {
    className: "playground-accordion",
    collapsible: state.collapsible,
    disabled: state.disabled,
    dir: state.dir,
    orientation: state.orientation,
    onValueChange: scenario.actions.handleValueChange as never,
    ...partProps("root", { propCheck: state.propCheck, customSlot: state.customSlots.root }, "accordion-root-custom"),
  };

  const items = (
    <>
      {accordionItems.map((item) => (
        <AccordionItem
          description={item.description}
          disabled={item.disabled && state.disabledItem}
          key={item.value}
          label={item.label}
          state={state}
          value={item.value}
        >
          <AccordionPanelContent item={item} />
        </AccordionItem>
      ))}
    </>
  );

  const uncontrolledValue = Array.isArray(state.value) ? state.value[0] ?? "" : state.value;
  const uncontrolledValues = Array.isArray(state.value) ? state.value : state.value ? [state.value] : [];
  const preserveStateForComposition = [
    state.rootComposition,
    state.itemComposition,
    state.headerComposition,
    state.triggerComposition,
    state.contentComposition,
  ].some((mode) => mode !== "default");
  const controlledForRuntime = state.controlled || preserveStateForComposition;
  const rootChildren = state.rootComposition === "asChild" ? <section className="playground-accordion" dir={state.dir}>{items}</section> : items;
  const accordion =
    state.multiple ? (
      <Accordion.Root
        {...commonProps}
        asChild={state.rootComposition === "asChild" ? true : undefined}
        defaultValue={controlledForRuntime ? undefined : uncontrolledValues}
        render={state.rootComposition === "render" ? (props) => <section {...props} dir={state.dir} /> : undefined}
        type="multiple"
        value={controlledForRuntime ? (Array.isArray(state.value) ? state.value : [state.value]) : undefined}
      >
        {rootChildren}
      </Accordion.Root>
    ) : (
      <Accordion.Root
        {...commonProps}
        asChild={state.rootComposition === "asChild" ? true : undefined}
        defaultValue={controlledForRuntime ? undefined : uncontrolledValue}
        render={state.rootComposition === "render" ? (props) => <section {...props} dir={state.dir} /> : undefined}
        type="single"
        value={controlledForRuntime ? (Array.isArray(state.value) ? state.value[0] ?? "" : state.value) : undefined}
      >
        {rootChildren}
      </Accordion.Root>
    );

  return (
    <Direction.Provider dir={state.dir}>
      <section className="playground-accordion-shell" dir={state.dir}>
        <div>{accordion}</div>
      </section>
    </Direction.Provider>
  );
}

function AccordionItem({ children, description, disabled, label, state, value }: { children: ReactNode; description: string; disabled?: boolean; label: string; state: ReturnType<typeof useAccordionScenario>["state"]; value: string }) {
  const itemProps = {
    className: "playground-accordion-item",
    disabled,
    value,
    ...partProps(`item-${value}`, { propCheck: state.propCheck, customSlot: state.customSlots.item }, "accordion-item-custom"),
  };
  const header = <AccordionHeader description={description} disabled={disabled} label={label} state={state} value={value} />;
  const content = <AccordionContent state={state}>{children}</AccordionContent>;

  if (state.itemComposition === "asChild") {
    return (
      <Accordion.Item {...itemProps} asChild>
        <section>
          {header}
          {content}
        </section>
      </Accordion.Item>
    );
  }

  if (state.itemComposition === "render") {
    return (
      <Accordion.Item {...itemProps} render={(props) => <section {...props} />}>
        {header}
        {content}
      </Accordion.Item>
    );
  }

  return <Accordion.Item {...itemProps}>{header}{content}</Accordion.Item>;
}

function AccordionHeader({ description, disabled, label, state, value }: { description: string; disabled?: boolean; label: string; state: ReturnType<typeof useAccordionScenario>["state"]; value: string }) {
  const props = {
    as: "h3" as const,
    className: "playground-accordion-header",
    ...partProps(`header-${value}`, { propCheck: state.propCheck, customSlot: state.customSlots.header }, "accordion-header-custom"),
  };
  const trigger = <AccordionTrigger description={description} disabled={disabled} state={state} value={value}>{label}</AccordionTrigger>;

  if (state.headerComposition === "asChild") {
    return (
      <Accordion.Header {...props} asChild>
        <h4>{trigger}</h4>
      </Accordion.Header>
    );
  }

  if (state.headerComposition === "render") {
    return (
      <Accordion.Header {...props} render={(renderProps) => <h4 {...renderProps} />}>
        {trigger}
      </Accordion.Header>
    );
  }

  return <Accordion.Header {...props}>{trigger}</Accordion.Header>;
}

function AccordionTrigger({ children, description, disabled, state, value }: { children: ReactNode; description: string; disabled?: boolean; state: ReturnType<typeof useAccordionScenario>["state"]; value: string }) {
  const props = {
    className: "playground-accordion-trigger",
    ...partProps(`trigger-${value}`, { propCheck: state.propCheck, customSlot: state.customSlots.trigger }, "accordion-trigger-custom"),
  };
  const content = (
    <>
      <span className="playground-accordion-trigger-copy">
        <span>{children}</span>
        <span>{description}</span>
      </span>
      <span className="playground-accordion-trigger-icon" aria-hidden="true">+</span>
    </>
  );

  if (state.triggerComposition === "asChild") {
    return (
      <Accordion.Trigger {...props} asChild>
        <button type="button">{content}</button>
      </Accordion.Trigger>
    );
  }

  if (state.triggerComposition === "render") {
    return (
      <Accordion.Trigger {...props} render={(renderProps) => <button {...renderProps} />}>
        {content}
      </Accordion.Trigger>
    );
  }

  return <Accordion.Trigger {...props}>{content}</Accordion.Trigger>;
}

function AccordionContent({ children, state }: { children: ReactNode; state: ReturnType<typeof useAccordionScenario>["state"] }) {
  const props = {
    className: "playground-accordion-content",
    keepMounted: state.keepMounted,
    ...partProps("content", { propCheck: state.propCheck, customSlot: state.customSlots.content }, "accordion-content-custom"),
  };

  if (state.contentComposition === "asChild") {
    return (
      <Accordion.Content {...props} asChild>
        <div>{children}</div>
      </Accordion.Content>
    );
  }

  if (state.contentComposition === "render") {
    return (
      <Accordion.Content {...props} render={(renderProps) => <section {...renderProps} />}>
        {children}
      </Accordion.Content>
    );
  }

  return <Accordion.Content {...props}>{children}</Accordion.Content>;
}

function AccordionPanelContent({ item }: { item: (typeof accordionItems)[number] }) {
  return (
    <div className="playground-accordion-panel">
      <p>{item.content}</p>
    </div>
  );
}

function BreadcrumbCanvas({ scenario }: { scenario: ReturnType<typeof useBreadcrumbScenario> }) {
  const state = scenario.state;
  const content = (
    <BreadcrumbListPart scenario={scenario}>
      <BreadcrumbItemPart scenario={scenario} label="home">
        <BreadcrumbLinkPart scenario={scenario} label="home" href="#home">Home</BreadcrumbLinkPart>
      </BreadcrumbItemPart>
      <BreadcrumbSeparatorPart scenario={scenario} />
      {state.showEllipsis ? (
        <>
          <BreadcrumbItemPart scenario={scenario} label="ellipsis">
            <BreadcrumbEllipsisPart scenario={scenario} />
          </BreadcrumbItemPart>
          <BreadcrumbSeparatorPart scenario={scenario} />
        </>
      ) : null}
      <BreadcrumbItemPart scenario={scenario} label="projects">
        <BreadcrumbLinkPart scenario={scenario} label="projects" href="#projects">Projects</BreadcrumbLinkPart>
      </BreadcrumbItemPart>
      <BreadcrumbSeparatorPart scenario={scenario} />
      <BreadcrumbItemPart scenario={scenario} label="page">
        <BreadcrumbPagePart scenario={scenario}>Atom playground</BreadcrumbPagePart>
      </BreadcrumbItemPart>
    </BreadcrumbListPart>
  );
  const props = {
    ariaLabel: state.rootAriaLabel ? "Demo breadcrumb" : undefined,
    className: "playground-breadcrumb",
    ref: (element: HTMLElement | null) => scenario.actions.markPartRef("root", element),
    ...partProps("root", { propCheck: state.propCheck, customSlot: state.customSlots.root }, "breadcrumb-root-custom"),
  };

  if (state.rootComposition === "asChild") {
    return (
      <Breadcrumb.Root {...props} asChild>
        <section>{content}</section>
      </Breadcrumb.Root>
    );
  }

  if (state.rootComposition === "render") {
    return (
      <Breadcrumb.Root {...props} render={(renderProps) => <section {...renderProps} />}>
        {content}
      </Breadcrumb.Root>
    );
  }

  return <Breadcrumb.Root {...props}>{content}</Breadcrumb.Root>;
}

function BreadcrumbListPart({ scenario, children }: { scenario: ReturnType<typeof useBreadcrumbScenario>; children: ReactNode }) {
  const state = scenario.state;
  const props = {
    className: "playground-breadcrumb-list",
    ref: (element: HTMLElement | null) => scenario.actions.markPartRef("list", element),
    ...partProps("list", { propCheck: state.propCheck, customSlot: state.customSlots.list }, "breadcrumb-list-custom"),
  };

  if (state.listComposition === "asChild") {
    return (
      <Breadcrumb.List {...props} asChild>
        <ol>{children}</ol>
      </Breadcrumb.List>
    );
  }

  if (state.listComposition === "render") {
    return (
      <Breadcrumb.List {...props} render={(renderProps) => <ol {...renderProps} />}>
        {children}
      </Breadcrumb.List>
    );
  }

  return <Breadcrumb.List {...props}>{children}</Breadcrumb.List>;
}

function BreadcrumbItemPart({ scenario, label, children }: { scenario: ReturnType<typeof useBreadcrumbScenario>; label: string; children: ReactNode }) {
  const state = scenario.state;
  const props = {
    className: `playground-breadcrumb-item playground-breadcrumb-item-${label}`,
    ref: label === "home" ? (element: HTMLElement | null) => scenario.actions.markPartRef("item", element) : undefined,
    ...partProps(`item-${label}`, { propCheck: state.propCheck, customSlot: state.customSlots.item }, "breadcrumb-item-custom"),
  };

  if (state.itemComposition === "asChild") {
    return (
      <Breadcrumb.Item {...props} asChild>
        <li>{children}</li>
      </Breadcrumb.Item>
    );
  }

  if (state.itemComposition === "render") {
    return (
      <Breadcrumb.Item {...props} render={(renderProps) => <li {...renderProps} />}>
        {children}
      </Breadcrumb.Item>
    );
  }

  return <Breadcrumb.Item {...props}>{children}</Breadcrumb.Item>;
}

function BreadcrumbLinkPart({
  scenario,
  label,
  href,
  children,
}: {
  scenario: ReturnType<typeof useBreadcrumbScenario>;
  label: string;
  href: string;
  children: ReactNode;
}) {
  const state = scenario.state;
  const props = {
    className: `playground-breadcrumb-link playground-breadcrumb-link-${label}`,
    href,
    onClick: () => scenario.actions.noteLink(label),
    ref: label === "home" ? (element: HTMLElement | null) => scenario.actions.markPartRef("link", element) : undefined,
    ...partProps(`link-${label}`, { propCheck: state.propCheck, customSlot: state.customSlots.link }, "breadcrumb-link-custom"),
  };

  if (state.linkComposition === "asChild") {
    return (
      <Breadcrumb.Link {...props} asChild>
        <a>{children}</a>
      </Breadcrumb.Link>
    );
  }

  if (state.linkComposition === "render") {
    return (
      <Breadcrumb.Link {...props} render={(renderProps) => <a {...renderProps} />}>
        {children}
      </Breadcrumb.Link>
    );
  }

  return <Breadcrumb.Link {...props}>{children}</Breadcrumb.Link>;
}

function BreadcrumbPagePart({ scenario, children }: { scenario: ReturnType<typeof useBreadcrumbScenario>; children: ReactNode }) {
  const state = scenario.state;
  const props = {
    className: "playground-breadcrumb-page",
    ref: (element: HTMLElement | null) => scenario.actions.markPartRef("page", element),
    ...partProps("page", { propCheck: state.propCheck, customSlot: state.customSlots.page }, "breadcrumb-page-custom"),
  };

  if (state.pageComposition === "asChild") {
    return (
      <Breadcrumb.Page {...props} asChild>
        <span>{children}</span>
      </Breadcrumb.Page>
    );
  }

  if (state.pageComposition === "render") {
    return (
      <Breadcrumb.Page {...props} render={(renderProps) => <span {...renderProps} />}>
        {children}
      </Breadcrumb.Page>
    );
  }

  return <Breadcrumb.Page {...props}>{children}</Breadcrumb.Page>;
}

function BreadcrumbSeparatorPart({ scenario }: { scenario: ReturnType<typeof useBreadcrumbScenario> }) {
  const state = scenario.state;
  const props = {
    className: "playground-breadcrumb-separator",
    ref: (element: HTMLElement | null) => scenario.actions.markPartRef("separator", element),
    ...partProps("separator", { propCheck: state.propCheck, customSlot: state.customSlots.separator }, "breadcrumb-separator-custom"),
  };
  const children = state.customSeparator ? ">" : "/";

  if (state.separatorComposition === "asChild") {
    return (
      <Breadcrumb.Separator {...props} asChild>
        <li>{children}</li>
      </Breadcrumb.Separator>
    );
  }

  if (state.separatorComposition === "render") {
    return (
      <Breadcrumb.Separator {...props} render={(renderProps) => <li {...renderProps} />}>
        {children}
      </Breadcrumb.Separator>
    );
  }

  return <Breadcrumb.Separator {...props}>{children}</Breadcrumb.Separator>;
}

function BreadcrumbEllipsisPart({ scenario }: { scenario: ReturnType<typeof useBreadcrumbScenario> }) {
  const state = scenario.state;
  const props = {
    "aria-label": "Show collapsed pages",
    className: "playground-breadcrumb-ellipsis",
    ref: (element: HTMLElement | null) => scenario.actions.markPartRef("ellipsis", element),
    ...partProps("ellipsis", { propCheck: state.propCheck, customSlot: state.customSlots.ellipsis }, "breadcrumb-ellipsis-custom"),
  };

  if (state.ellipsisComposition === "asChild") {
    return (
      <Breadcrumb.Ellipsis {...props} asChild>
        <button type="button">...</button>
      </Breadcrumb.Ellipsis>
    );
  }

  if (state.ellipsisComposition === "render") {
    return (
      <Breadcrumb.Ellipsis {...props} render={(renderProps) => <button type="button" {...renderProps} />}>
        ...
      </Breadcrumb.Ellipsis>
    );
  }

  return <Breadcrumb.Ellipsis {...props} />;
}

function PaginationCanvas({ scenario }: { scenario: ReturnType<typeof usePaginationScenario> }) {
  const state = scenario.state;
  const rootKey = state.controlled ? "controlled" : `uncontrolled-${state.defaultPage}`;
  const props = {
    "aria-label": state.localizedLabels ? "Paginacion demo" : undefined,
    className: "playground-pagination",
    ...partProps("root", { propCheck: state.propCheck, customSlot: state.customSlots.root }, "pagination-root-custom"),
    ref: (element: HTMLElement | null) => scenario.actions.markPartRef("root", element),
    disabled: state.disabled,
    totalPages: Number(state.totalPages),
    siblingCount: Number(state.siblingCount),
    boundaryCount: Number(state.boundaryCount),
    defaultPage: !state.controlled && state.defaultPage === "4" ? 4 : undefined,
    page: state.controlled ? state.page : undefined,
    onPageChange: scenario.actions.setPage,
  };
  const content = <PaginationListContent scenario={scenario} />;

  if (state.rootComposition === "asChild") {
    return (
      <Pagination.Root key={rootKey} {...props} asChild>
        <section>{content}</section>
      </Pagination.Root>
    );
  }

  if (state.rootComposition === "render") {
    return (
      <Pagination.Root key={rootKey} {...props} render={(renderProps) => <section {...renderProps} />}>
        {content}
      </Pagination.Root>
    );
  }

  return <Pagination.Root key={rootKey} {...props}>{content}</Pagination.Root>;
}

function PaginationListContent({ scenario }: { scenario: ReturnType<typeof usePaginationScenario> }) {
  const state = scenario.state;
  const props = {
    className: "playground-pagination-list",
    ...partProps("list", { propCheck: state.propCheck, customSlot: state.customSlots.list }, "pagination-list-custom"),
    ref: (element: HTMLOListElement | null) => scenario.actions.markPartRef("list", element),
  };
  const children = (
    <>
      <PaginationPreviousControl scenario={scenario} />
      <PaginationRangeItems scenario={scenario} />
      <PaginationNextControl scenario={scenario} />
    </>
  );

  if (state.listComposition === "asChild") {
    return (
      <Pagination.List {...props} asChild>
        <ol>{children}</ol>
      </Pagination.List>
    );
  }

  if (state.listComposition === "render") {
    return (
      <Pagination.List {...props} render={(renderProps) => <ol {...renderProps} />}>
        {children}
      </Pagination.List>
    );
  }

  return <Pagination.List {...props}>{children}</Pagination.List>;
}

function PaginationPreviousControl({ scenario }: { scenario: ReturnType<typeof usePaginationScenario> }) {
  const state = scenario.state;
  const props = {
    className: "playground-pagination-button",
    ...partProps("previous", { propCheck: state.propCheck, customSlot: state.customSlots.previous }, "pagination-previous-custom"),
    ref: (element: HTMLButtonElement | null) => scenario.actions.markPartRef("previous", element),
    "aria-label": state.localizedLabels ? "Pagina anterior" : undefined,
  };

  if (state.previousComposition === "asChild") {
    return (
      <Pagination.Previous {...props} asChild>
        <button type="button">Prev</button>
      </Pagination.Previous>
    );
  }

  if (state.previousComposition === "render") {
    return (
      <Pagination.Previous {...props} render={(renderProps) => <button {...renderProps} />}>
        Prev
      </Pagination.Previous>
    );
  }

  return <Pagination.Previous {...props}>Prev</Pagination.Previous>;
}

function PaginationNextControl({ scenario }: { scenario: ReturnType<typeof usePaginationScenario> }) {
  const state = scenario.state;
  const props = {
    className: "playground-pagination-button",
    ...partProps("next", { propCheck: state.propCheck, customSlot: state.customSlots.next }, "pagination-next-custom"),
    ref: (element: HTMLButtonElement | null) => scenario.actions.markPartRef("next", element),
    "aria-label": state.localizedLabels ? "Pagina siguiente" : undefined,
  };

  if (state.nextComposition === "asChild") {
    return (
      <Pagination.Next {...props} asChild>
        <button type="button">Next</button>
      </Pagination.Next>
    );
  }

  if (state.nextComposition === "render") {
    return (
      <Pagination.Next {...props} render={(renderProps) => <button {...renderProps} />}>
        Next
      </Pagination.Next>
    );
  }

  return <Pagination.Next {...props}>Next</Pagination.Next>;
}

function PaginationRangeItems({ scenario }: { scenario: ReturnType<typeof usePaginationScenario> }) {
  const ctx = usePaginationContext();

  return (
    <>
      {ctx.items.map((item, index) => typeof item === "number"
        ? (
          <PaginationItemControl key={`page-${item}`} current={ctx.currentPage === item} page={item} scenario={scenario} />
        )
        : (
          <PaginationEllipsisControl key={`${item}-${index}`} first={index === ctx.items.indexOf(item)} scenario={scenario} />
        ))}
    </>
  );
}

function PaginationItemControl({
  current,
  page,
  scenario,
}: {
  current: boolean;
  page: number;
  scenario: ReturnType<typeof usePaginationScenario>;
}) {
  const state = scenario.state;
  const props = {
    className: "playground-pagination-button",
    ...partProps("item", { propCheck: state.propCheck, customSlot: state.customSlots.item }, "pagination-item-custom"),
    ref: current ? (element: HTMLButtonElement | null) => scenario.actions.markPartRef("item", element) : undefined,
    page,
    "aria-label": state.localizedLabels ? `Pagina ${page}` : undefined,
  };

  if (state.itemComposition === "asChild") {
    return (
      <Pagination.Item {...props} asChild>
        <button type="button">{page}</button>
      </Pagination.Item>
    );
  }

  if (state.itemComposition === "render") {
    return (
      <Pagination.Item {...props} render={(renderProps) => <button {...renderProps} />}>
        {page}
      </Pagination.Item>
    );
  }

  return <Pagination.Item {...props} />;
}

function PaginationEllipsisControl({
  first,
  scenario,
}: {
  first: boolean;
  scenario: ReturnType<typeof usePaginationScenario>;
}) {
  const state = scenario.state;
  const props = {
    className: "playground-pagination-ellipsis",
    ...partProps("ellipsis", { propCheck: state.propCheck, customSlot: state.customSlots.ellipsis }, "pagination-ellipsis-custom"),
    ref: first ? (element: HTMLSpanElement | null) => scenario.actions.markPartRef("ellipsis", element) : undefined,
  };

  if (state.ellipsisComposition === "asChild") {
    return (
      <Pagination.Ellipsis {...props} asChild>
        <span>...</span>
      </Pagination.Ellipsis>
    );
  }

  if (state.ellipsisComposition === "render") {
    return (
      <Pagination.Ellipsis {...props} render={(renderProps) => <span {...renderProps} />}>
        ...
      </Pagination.Ellipsis>
    );
  }

  return <Pagination.Ellipsis {...props} />;
}

function BottomNavigationCanvas({ scenario }: { scenario: ReturnType<typeof useBottomNavigationScenario> }) {
  const state = scenario.state;
  const items = (
    <>
      <BottomNavigationItem mode={state.itemComposition} scenario={scenario} value="home">Home</BottomNavigationItem>
      <BottomNavigationItem mode={state.itemComposition} scenario={scenario} value="search" href={state.linkItem ? "#search" : undefined}>Search</BottomNavigationItem>
      <BottomNavigationItem disabled={state.disabledItem} mode={state.itemComposition} scenario={scenario} value="settings">Settings</BottomNavigationItem>
    </>
  );
  const props = {
    ariaLabel: "Demo bottom navigation",
    className: "playground-bottom-nav",
    defaultValue: state.controlled ? undefined : "home",
    onChange: scenario.actions.setValue,
    ref: scenario.actions.markRootRef,
    showLabels: state.showLabels,
    value: state.controlled ? state.value : undefined,
    ...partProps("root", { propCheck: state.propCheck, customSlot: state.customSlots.root }, "bottom-nav-root-custom"),
  };

  if (state.rootComposition === "asChild") {
    return (
      <BottomNavigation.Root {...props} asChild>
        <nav>{items}</nav>
      </BottomNavigation.Root>
    );
  }

  if (state.rootComposition === "render") {
    return (
      <BottomNavigation.Root {...props} render={(renderProps) => <nav {...renderProps} />}>
        {items}
      </BottomNavigation.Root>
    );
  }

  return (
    <BottomNavigation.Root {...props}>
      {items}
    </BottomNavigation.Root>
  );
}

function BottomNavigationItem({ children, disabled, href, mode, scenario, value }: { children: ReactNode; disabled?: boolean; href?: string; mode: CompositionMode; scenario: ReturnType<typeof useBottomNavigationScenario>; value: string }) {
  const props = {
    className: "playground-bottom-nav-item",
    disabled,
    "data-playground-inspect": `bottom-nav-item-${value}`,
    href,
    onClick: value === "search" && scenario.state.blockSearchEvent ? scenario.actions.preventSearch : undefined,
    rel: href ? "noreferrer" : undefined,
    target: href ? "_blank" : undefined,
    value,
    ref: scenario.actions.markItemRef,
    ...partProps(`item-${value}`, { propCheck: scenario.state.propCheck, customSlot: scenario.state.customSlots.item }, "bottom-nav-item-custom"),
  };
  if (mode === "asChild") {
    return (
      <BottomNavigation.Item {...props} asChild>
        {href ? <a>{children}</a> : <button type="button">{children}</button>}
      </BottomNavigation.Item>
    );
  }

  if (mode === "render") {
    return (
      <BottomNavigation.Item {...props} render={(renderProps) => href ? <a {...renderProps} /> : <button {...renderProps} />}>
        {children}
      </BottomNavigation.Item>
    );
  }

  return <BottomNavigation.Item {...props}>{children}</BottomNavigation.Item>;
}

function NavListCanvas({ scenario }: { scenario: ReturnType<typeof useNavListScenario> }) {
  const state = scenario.state;
  const content = (
    <NavListSectionPart scenario={scenario}>
      <NavListSectionLabelPart scenario={scenario}>Workspace</NavListSectionLabelPart>
      <NavListSectionTriggerPart scenario={scenario}>Project</NavListSectionTriggerPart>
      <NavListSectionContentPart scenario={scenario}>
        <NavListListPart scenario={scenario}>
          <NavListItemPart label="overview" scenario={scenario}>
            <NavListLinkPart href="#overview" label="overview" scenario={scenario}>Overview</NavListLinkPart>
          </NavListItemPart>
          <NavListItemPart label="settings" scenario={scenario}>
            <NavListLinkPart href="#settings" label="settings" scenario={scenario}>Settings</NavListLinkPart>
          </NavListItemPart>
          <NavListItemPart disabled={state.disabledLink} label="archive" scenario={scenario}>
            <NavListLinkPart disabled={state.disabledLink} href="#archive" label="archive" scenario={scenario}>Archive</NavListLinkPart>
          </NavListItemPart>
        </NavListListPart>
      </NavListSectionContentPart>
    </NavListSectionPart>
  );
  const props = {
    "aria-label": "Project navigation",
    className: "playground-nav-list",
    orientation: state.orientation,
    ref: scenario.actions.markRootRef,
    ...partProps("root", { propCheck: state.propCheck, customSlot: state.customSlots.root }, "nav-list-root-custom"),
  };

  if (state.rootComposition === "asChild") {
    return (
      <div className="playground-nav-list-stage">
        <NavList.Root {...props} asChild>
          <section>{content}</section>
        </NavList.Root>
      </div>
    );
  }

  if (state.rootComposition === "render") {
    return (
      <div className="playground-nav-list-stage">
        <NavList.Root {...props} render={(renderProps) => <section {...renderProps} />}>
          {content}
        </NavList.Root>
      </div>
    );
  }

  return (
    <div className="playground-nav-list-stage">
      <NavList.Root {...props}>{content}</NavList.Root>
    </div>
  );
}

function NavListSectionPart({ children, scenario }: { children: ReactNode; scenario: ReturnType<typeof useNavListScenario> }) {
  const state = scenario.state;
  const props = {
    className: "playground-nav-list-section",
    collapsible: state.collapsible,
    disabled: state.disabledSection,
    onOpenChange: scenario.actions.noteSectionOpen,
    ref: scenario.actions.markSectionRef,
    ...(state.sectionControlled
      ? { open: state.sectionOpen }
      : { defaultOpen: state.defaultSectionOpen }),
    ...partProps("section", { propCheck: state.propCheck, customSlot: state.customSlots.section }, "nav-list-section-custom"),
  };
  const key = state.sectionControlled
    ? "controlled"
    : `uncontrolled-${state.defaultSectionOpen}`;

  if (state.sectionComposition === "asChild") {
    return (
      <NavList.Section key={key} {...props} asChild>
        <section>{children}</section>
      </NavList.Section>
    );
  }

  if (state.sectionComposition === "render") {
    return (
      <NavList.Section key={key} {...props} render={(renderProps) => <section {...renderProps} />}>
        {children}
      </NavList.Section>
    );
  }

  return <NavList.Section key={key} {...props}>{children}</NavList.Section>;
}

function NavListSectionTriggerPart({ children, scenario }: { children: ReactNode; scenario: ReturnType<typeof useNavListScenario> }) {
  const state = scenario.state;
  const props = {
    className: "playground-nav-list-section-trigger",
    ref: scenario.actions.markSectionTriggerRef,
    ...partProps("section-trigger", { propCheck: state.propCheck, customSlot: state.customSlots.sectionTrigger }, "nav-list-section-trigger-custom"),
  };

  if (state.sectionTriggerComposition === "asChild") {
    return (
      <NavList.SectionTrigger {...props} asChild>
        <button type="button">{children}</button>
      </NavList.SectionTrigger>
    );
  }

  if (state.sectionTriggerComposition === "render") {
    return (
      <NavList.SectionTrigger {...props} render={(renderProps) => <button {...renderProps} />}>
        {children}
      </NavList.SectionTrigger>
    );
  }

  return <NavList.SectionTrigger {...props}>{children}</NavList.SectionTrigger>;
}

function NavListSectionLabelPart({ children, scenario }: { children: ReactNode; scenario: ReturnType<typeof useNavListScenario> }) {
  const state = scenario.state;
  const props = {
    as: "h3" as const,
    className: "playground-nav-list-section-label",
    ref: scenario.actions.markSectionLabelRef,
    ...partProps("section-label", { propCheck: state.propCheck, customSlot: state.customSlots.sectionLabel }, "nav-list-section-label-custom"),
  };

  if (state.sectionLabelComposition === "asChild") {
    return (
      <NavList.SectionLabel {...props} asChild>
        <h4>{children}</h4>
      </NavList.SectionLabel>
    );
  }

  if (state.sectionLabelComposition === "render") {
    return (
      <NavList.SectionLabel {...props} render={(renderProps) => <h4 {...renderProps} />}>
        {children}
      </NavList.SectionLabel>
    );
  }

  return <NavList.SectionLabel {...props}>{children}</NavList.SectionLabel>;
}

function NavListSectionContentPart({ children, scenario }: { children: ReactNode; scenario: ReturnType<typeof useNavListScenario> }) {
  const state = scenario.state;
  const props = {
    className: "playground-nav-list-section-content",
    forceMount: state.forceMount,
    ref: scenario.actions.markSectionContentRef,
    ...partProps("section-content", { propCheck: state.propCheck, customSlot: state.customSlots.sectionContent }, "nav-list-section-content-custom"),
  };

  if (state.sectionContentComposition === "asChild") {
    return (
      <NavList.SectionContent {...props} asChild>
        <div>{children}</div>
      </NavList.SectionContent>
    );
  }

  if (state.sectionContentComposition === "render") {
    return (
      <NavList.SectionContent {...props} render={(renderProps) => <div {...renderProps} />}>
        {children}
      </NavList.SectionContent>
    );
  }

  return <NavList.SectionContent {...props}>{children}</NavList.SectionContent>;
}

function NavListListPart({ children, scenario }: { children: ReactNode; scenario: ReturnType<typeof useNavListScenario> }) {
  const state = scenario.state;
  const props = {
    className: "playground-nav-list-list",
    ordered: state.ordered,
    ref: scenario.actions.markListRef,
    ...partProps("list", { propCheck: state.propCheck, customSlot: state.customSlots.list }, "nav-list-list-custom"),
  };
  const ListElement = state.ordered ? "ol" : "ul";

  if (state.listComposition === "asChild") {
    return (
      <NavList.List {...props} asChild>
        <ListElement>{children}</ListElement>
      </NavList.List>
    );
  }

  if (state.listComposition === "render") {
    return (
      <NavList.List {...props} render={(renderProps) => <ListElement {...renderProps} />}>
        {children}
      </NavList.List>
    );
  }

  return <NavList.List {...props}>{children}</NavList.List>;
}

function NavListItemPart({ children, disabled, label, scenario }: { children: ReactNode; disabled?: boolean; label: string; scenario: ReturnType<typeof useNavListScenario> }) {
  const state = scenario.state;
  const props = {
    className: `playground-nav-list-item playground-nav-list-item-${label}`,
    disabled,
    ref: scenario.actions.markItemRef,
    ...partProps(`item-${label}`, { propCheck: state.propCheck, customSlot: state.customSlots.item }, "nav-list-item-custom"),
  };

  if (state.itemComposition === "asChild") {
    return (
      <NavList.Item {...props} asChild>
        <li>{children}</li>
      </NavList.Item>
    );
  }

  if (state.itemComposition === "render") {
    return (
      <NavList.Item {...props} render={(renderProps) => <li {...renderProps} />}>
        {children}
      </NavList.Item>
    );
  }

  return <NavList.Item {...props}>{children}</NavList.Item>;
}

function NavListLinkPart({ children, disabled, href, label, scenario }: { children: ReactNode; disabled?: boolean; href: string; label: string; scenario: ReturnType<typeof useNavListScenario> }) {
  const state = scenario.state;
  const active = state.active === label;
  const props = {
    active,
    className: `playground-nav-list-link playground-nav-list-link-${label}`,
    current: state.currentToken,
    disabled,
    href,
    onClick: disabled ? undefined : () => scenario.actions.setActive(label),
    ref: scenario.actions.markLinkRef,
    ...partProps(`link-${label}`, { propCheck: state.propCheck, customSlot: state.customSlots.link }, "nav-list-link-custom"),
  };

  if (state.linkComposition === "asChild") {
    return (
      <NavList.Link {...props} asChild>
        <a>{children}</a>
      </NavList.Link>
    );
  }

  if (state.linkComposition === "render") {
    return (
      <NavList.Link {...props} render={(renderProps) => <a {...renderProps} />}>
        {children}
      </NavList.Link>
    );
  }

  return <NavList.Link {...props}>{children}</NavList.Link>;
}

export function NavigationPrimitiveScenarioAnatomy({
  openGroups,
  scenarioId,
  scenarios,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  scenarioId: string;
  scenarios: NavigationPrimitiveScenarios;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const sections = getNavigationSections(scenarioId, scenarios);
  return (
    <AnatomyPanel
      footer={`${sections.length} parts`}
      onOpenGroupsChange={onOpenGroupsChange}
      openGroups={openGroups}
      sections={sections}
    />
  );
}

function getNavigationSections(scenarioId: string, scenarios: NavigationPrimitiveScenarios): AnatomySection[] {
  if (scenarioId === "app-bar") return appBarSections(scenarios.appBar.state);
  if (scenarioId === "tabs") return tabsSections(scenarios.tabs.state);
  if (scenarioId === "accordion") return accordionSections(scenarios.accordion.state);
  if (scenarioId === "breadcrumb") return breadcrumbSections(scenarios.breadcrumb.state);
  if (scenarioId === "pagination") return paginationSections(scenarios.pagination.state);
  if (scenarioId === "bottom-navigation") return bottomNavigationSections(scenarios.bottomNavigation.state);
  if (scenarioId === "nav-list") return navListSections(scenarios.navList.state);
  return [];
}

function appBarSections(state: ReturnType<typeof useAppBarScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", state.position, appBarSlotSelector(state, "root"), [
      row("Position", state.position, "state"),
      row("Composition", state.rootComposition, "composition"),
      row("Ref target", state.refs.root, "identity"),
    ]),
    baseSection("Toolbar", state.density, appBarSlotSelector(state, "toolbar"), [
      row("Density", state.density, "state"),
      row("Composition", state.toolbarComposition, "composition"),
      row("Ref target", state.refs.toolbar, "identity"),
    ]),
    baseSection("Start", "start", appBarSlotSelector(state, "start"), [
      row("Composition", state.startComposition, "composition"),
      row("Ref target", state.refs.start, "identity"),
    ]),
    baseSection("Center", "center", appBarSlotSelector(state, "center"), [
      row("Composition", state.centerComposition, "composition"),
      row("Ref target", state.refs.center, "identity"),
    ]),
    baseSection("End", "end", appBarSlotSelector(state, "end"), [
      row("Composition", state.endComposition, "composition"),
      row("Ref target", state.refs.end, "identity"),
    ]),
  ];
}

function appBarSlotSelector(state: ReturnType<typeof useAppBarScenario>["state"], part: AppBarSlotPart) {
  const classes: Record<AppBarSlotPart, string> = {
    root: ".playground-appbar",
    toolbar: ".playground-appbar-toolbar",
    start: ".playground-appbar-section",
    center: ".playground-appbar-section",
    end: ".playground-appbar-section",
  };
  const slots: Record<AppBarSlotPart, [defaultSlot: string, customSlot: string]> = {
    root: ["appbar", "appbar-custom"],
    toolbar: ["appbar-toolbar", "appbar-toolbar-custom"],
    start: ["appbar-start", "appbar-start-custom"],
    center: ["appbar-center", "appbar-center-custom"],
    end: ["appbar-end", "appbar-end-custom"],
  };
  const slot = state.customSlots[part] ? slots[part][1] : slots[part][0];

  return `${classes[part]}[data-slot='${slot}']`;
}

function tabsSections(state: ReturnType<typeof useTabsScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", state.value, "[data-slot='tabs-root']", [
      row("Controlled", bool(state.controlled), "state"),
      row("Orientation", state.orientation, "state"),
      row("Activation mode", state.activationMode, "behavior"),
      row("Loop", bool(state.loop), "behavior"),
    ]),
    baseSection("List", state.orientation, "[data-slot='tabs-list']"),
    baseSection("Trigger: Overview", "overview", "[data-prop-check='trigger-overview']"),
    baseSection("Trigger: Settings", "settings", "[data-prop-check='trigger-settings']"),
    baseSection("Trigger: Billing", state.disabledTab ? "disabled" : "enabled", "[data-prop-check='trigger-billing']"),
    baseSection("Indicator", "positioned", "[data-slot='tabs-indicator']"),
    baseSection("Content", state.keepMounted ? "keep mounted" : state.value, "[data-slot='tabs-content'][data-state='active']"),
  ];
}

function accordionSections(state: ReturnType<typeof useAccordionScenario>["state"]): AnatomySection[] {
  const active = formatAccordionValueLabel(state.value);
  const activeValues = Array.isArray(state.value) ? state.value : state.value ? [state.value] : [];
  const [defaultItem, stateItem, disabledItem] = accordionItems;
  return [
    baseSection("Root", state.multiple ? "multiple" : "single", ".playground-accordion", [
      row("Controlled", bool(state.controlled), "state"),
      row("Collapsible", bool(state.collapsible), "behavior"),
      row("Disabled", bool(state.disabled), "state"),
      row("Orientation", state.orientation, "state"),
      row("Direction", state.dir, "state"),
      row("Value", active, "state"),
      row("Composition", state.rootComposition, "composition"),
    ]),
    baseSection("Item: 1", defaultItem.value, ".playground-accordion-item:nth-of-type(1)", [row("Composition", state.itemComposition, "composition")]),
    baseSection("Header: 1", state.headerComposition === "default" ? "h3" : "h4", ".playground-accordion-item:nth-of-type(1) .playground-accordion-header", [row("Composition", state.headerComposition, "composition")]),
    baseSection("Trigger: 1", defaultItem.value, ".playground-accordion-item:nth-of-type(1) .playground-accordion-trigger", [row("Composition", state.triggerComposition, "composition")]),
    baseSection("Content: 1", state.keepMounted ? "keep mounted" : "mounted when open", ".playground-accordion-item:nth-of-type(1) .playground-accordion-content", [row("Composition", state.contentComposition, "composition")]),
    baseSection("Item: 2", stateItem.value, ".playground-accordion-item:nth-of-type(2)"),
    baseSection("Header: 2", state.headerComposition === "default" ? "h3" : "h4", ".playground-accordion-item:nth-of-type(2) .playground-accordion-header"),
    baseSection("Trigger: 2", stateItem.value, ".playground-accordion-item:nth-of-type(2) .playground-accordion-trigger"),
    baseSection("Content: 2", state.keepMounted ? "keep mounted" : "mounted when open", ".playground-accordion-item:nth-of-type(2) .playground-accordion-content", undefined, !state.keepMounted && !activeValues.includes(stateItem.value)),
    baseSection("Item: 3", state.disabledItem ? "disabled" : "enabled", ".playground-accordion-item:nth-of-type(3)"),
    baseSection("Header: 3", state.headerComposition === "default" ? "h3" : "h4", ".playground-accordion-item:nth-of-type(3) .playground-accordion-header"),
    baseSection("Trigger: 3", state.disabledItem ? "disabled" : "enabled", ".playground-accordion-item:nth-of-type(3) .playground-accordion-trigger"),
    baseSection("Content: 3", state.keepMounted ? "keep mounted" : "mounted when open", ".playground-accordion-item:nth-of-type(3) .playground-accordion-content", undefined, !state.keepMounted && !activeValues.includes(disabledItem.value)),
  ];
}

function breadcrumbSections(state: ReturnType<typeof useBreadcrumbScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", state.rootComposition, breadcrumbSlotSelector(state, "root"), [
      row("Composition", state.rootComposition, "composition"),
      row("Ref target", state.refs.root, "identity"),
    ]),
    baseSection("List", state.listComposition, breadcrumbSlotSelector(state, "list"), [
      row("Composition", state.listComposition, "composition"),
      row("Ref target", state.refs.list, "identity"),
    ]),
    baseSection("Item: Home", state.itemComposition, ".playground-breadcrumb-item-home", [
      row("Composition", state.itemComposition, "composition"),
      row("Ref target", state.refs.item, "identity"),
    ]),
    baseSection("Link: Home", state.linkComposition, ".playground-breadcrumb-link-home", [
      row("Composition", state.linkComposition, "composition"),
      row("Ref target", state.refs.link, "identity"),
    ]),
    baseSection("Separator", state.separatorComposition, breadcrumbSlotSelector(state, "separator"), [
      row("Composition", state.separatorComposition, "composition"),
      row("Content", state.customSeparator ? "custom" : "default", "state"),
      row("Ref target", state.refs.separator, "identity"),
    ]),
    baseSection("Item: Ellipsis", state.showEllipsis ? state.itemComposition : "not rendered", ".playground-breadcrumb-item-ellipsis", [row("Composition", state.itemComposition, "composition")], !state.showEllipsis),
    baseSection("Ellipsis", state.showEllipsis ? state.ellipsisComposition : "not rendered", breadcrumbSlotSelector(state, "ellipsis"), [
      row("Composition", state.ellipsisComposition, "composition"),
      row("Ref target", state.refs.ellipsis, "identity"),
    ], !state.showEllipsis),
    baseSection("Item: Projects", state.itemComposition, ".playground-breadcrumb-item-projects", [row("Composition", state.itemComposition, "composition")]),
    baseSection("Link: Projects", state.linkComposition, ".playground-breadcrumb-link-projects", [row("Composition", state.linkComposition, "composition")]),
    baseSection("Item: Page", state.itemComposition, ".playground-breadcrumb-item-page", [row("Composition", state.itemComposition, "composition")]),
    baseSection("Page", state.pageComposition, breadcrumbSlotSelector(state, "page"), [
      row("Composition", state.pageComposition, "composition"),
      row("Ref target", state.refs.page, "identity"),
    ]),
  ];
}

function breadcrumbSlotSelector(state: ReturnType<typeof useBreadcrumbScenario>["state"], part: BreadcrumbSlotPart) {
  const slots: Record<BreadcrumbSlotPart, [defaultSlot: string, customSlot: string]> = {
    root: ["breadcrumb", "breadcrumb-root-custom"],
    list: ["breadcrumb-list", "breadcrumb-list-custom"],
    item: ["breadcrumb-item", "breadcrumb-item-custom"],
    link: ["breadcrumb-link", "breadcrumb-link-custom"],
    page: ["breadcrumb-page", "breadcrumb-page-custom"],
    separator: ["breadcrumb-separator", "breadcrumb-separator-custom"],
    ellipsis: ["breadcrumb-ellipsis", "breadcrumb-ellipsis-custom"],
  };
  const slot = state.customSlots[part] ? slots[part][1] : slots[part][0];

  return `[data-slot='${slot}']`;
}

function paginationSections(state: ReturnType<typeof usePaginationScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", `page ${state.page}`, paginationSlotSelector(state, "root"), [
      row("Controlled", bool(state.controlled), "state"),
      row("Disabled", bool(state.disabled), "state"),
      row("Localized labels", bool(state.localizedLabels), "state"),
      row("Total pages", state.totalPages, "state"),
      row("Sibling count", state.siblingCount, "behavior"),
      row("Boundary count", state.boundaryCount, "behavior"),
      row("Composition", state.rootComposition, "composition"),
      row("Ref target", state.refs.root, "identity"),
    ]),
    baseSection("List", "ol", paginationSlotSelector(state, "list"), [
      row("Composition", state.listComposition, "composition"),
      row("Ref target", state.refs.list, "identity"),
    ]),
    baseSection("Previous", "previous", paginationSlotSelector(state, "previous"), [
      row("List item slot", "pagination-list-item", "data"),
      row("Composition", state.previousComposition, "composition"),
      row("Ref target", state.refs.previous, "identity"),
    ]),
    baseSection("Item: Current", `page ${state.page}`, `${paginationSlotSelector(state, "item")}[data-state='active']`, [
      row("List item slot", "pagination-list-item", "data"),
      row("Composition", state.itemComposition, "composition"),
      row("Ref target", state.refs.item, "identity"),
    ]),
    baseSection("Ellipsis", "range gap", paginationSlotSelector(state, "ellipsis"), [
      row("List item slot", "pagination-list-item", "data"),
      row("Composition", state.ellipsisComposition, "composition"),
      row("Ref target", state.refs.ellipsis, "identity"),
    ]),
    baseSection("Next", "next", paginationSlotSelector(state, "next"), [
      row("List item slot", "pagination-list-item", "data"),
      row("Composition", state.nextComposition, "composition"),
      row("Ref target", state.refs.next, "identity"),
    ]),
  ];
}

function paginationSlotSelector(state: ReturnType<typeof usePaginationScenario>["state"], part: PaginationSlotPart) {
  const slots: Record<PaginationSlotPart, [defaultSlot: string, customSlot: string]> = {
    root: ["pagination-root", "pagination-root-custom"],
    list: ["pagination-list", "pagination-list-custom"],
    previous: ["pagination-previous", "pagination-previous-custom"],
    item: ["pagination-item", "pagination-item-custom"],
    ellipsis: ["pagination-ellipsis", "pagination-ellipsis-custom"],
    next: ["pagination-next", "pagination-next-custom"],
  };
  const slot = state.customSlots[part] ? slots[part][1] : slots[part][0];

  return `[data-slot='${slot}']`;
}

function bottomNavigationSections(state: ReturnType<typeof useBottomNavigationScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", state.value, bottomNavigationSlotSelector(state, "root"), [
      row("Controlled", bool(state.controlled), "state"),
      row("Show labels", bool(state.showLabels), "state"),
      row("Block search event", bool(state.blockSearchEvent), "behavior"),
      row("Composition", state.rootComposition, "composition"),
      row("Ref target", state.refs.root, "identity"),
    ]),
    baseSection("Item: Home", "home", bottomNavigationItemSelector(state, "home"), [
      row("Composition", state.itemComposition, "composition"),
      row("Ref target", state.refs.item, "identity"),
    ]),
    baseSection("Item: Search", state.linkItem ? "anchor" : "button", bottomNavigationItemSelector(state, "search")),
    baseSection("Item: Settings", state.disabledItem ? "disabled" : "enabled", bottomNavigationItemSelector(state, "settings")),
  ];
}

function bottomNavigationSlotSelector(state: ReturnType<typeof useBottomNavigationScenario>["state"], part: BottomNavigationSlotPart) {
  const slots: Record<BottomNavigationSlotPart, [defaultSlot: string, customSlot: string]> = {
    root: ["bottom-nav-root", "bottom-nav-root-custom"],
    item: ["bottom-nav-item", "bottom-nav-item-custom"],
  };
  const slot = state.customSlots[part] ? slots[part][1] : slots[part][0];

  return part === "root"
    ? `.playground-bottom-nav[data-slot='${slot}']`
    : `.playground-bottom-nav-item[data-slot='${slot}']`;
}

function bottomNavigationItemSelector(state: ReturnType<typeof useBottomNavigationScenario>["state"], value: string) {
  return `${bottomNavigationSlotSelector(state, "item")}[data-value='${value}']`;
}

function navListSections(state: ReturnType<typeof useNavListScenario>["state"]): AnatomySection[] {
  return [
    baseSection("Root", state.orientation, navListSlotSelector(state, "root"), [
      row("Orientation", state.orientation, "state"),
      row("Composition", state.rootComposition, "composition"),
      row("Ref target", state.refs.root, "identity"),
    ]),
    baseSection("Section", state.sectionOpen ? "open" : "closed", navListSlotSelector(state, "section"), [
      row("Collapsible", bool(state.collapsible), "behavior"),
      row("Controlled", bool(state.sectionControlled), "state"),
      row("Default open", bool(state.defaultSectionOpen), "state"),
      row("Disabled", bool(state.disabledSection), "state"),
      row("Composition", state.sectionComposition, "composition"),
      row("Ref target", state.refs.section, "identity"),
    ]),
    baseSection("Section Label", state.sectionLabelComposition === "default" ? "h3" : "h4", navListSlotSelector(state, "sectionLabel"), [
      row("Composition", state.sectionLabelComposition, "composition"),
      row("Ref target", state.refs.sectionLabel, "identity"),
    ]),
    baseSection("Section Trigger", state.collapsible ? "collapsible" : "static", navListSlotSelector(state, "sectionTrigger"), [
      row("Composition", state.sectionTriggerComposition, "composition"),
      row("Ref target", state.refs.sectionTrigger, "identity"),
    ]),
    baseSection("Section Content", state.forceMount ? "force mounted" : "mounted when open", navListSlotSelector(state, "sectionContent"), [
      row("Composition", state.sectionContentComposition, "composition"),
      row("Ref target", state.refs.sectionContent, "identity"),
    ], !state.sectionOpen && !state.forceMount),
    baseSection("List", state.ordered ? "ordered" : "unordered", navListSlotSelector(state, "list"), [
      row("Composition", state.listComposition, "composition"),
      row("Ref target", state.refs.list, "identity"),
    ]),
    baseSection("Item: Overview", "overview", navListItemSelector(state, "overview"), [
      row("Composition", state.itemComposition, "composition"),
      row("Ref target", state.refs.item, "identity"),
    ]),
    baseSection("Link: Overview", state.active === "overview" ? "current" : "available", navListLinkSelector(state, "overview"), [
      row("Composition", state.linkComposition, "composition"),
      row("Ref target", state.refs.link, "identity"),
    ]),
    baseSection("Item: Settings", "settings", navListItemSelector(state, "settings"), [
      row("Composition", state.itemComposition, "composition"),
    ]),
    baseSection("Link: Settings", state.active === "settings" ? "current" : "available", navListLinkSelector(state, "settings"), [
      row("Composition", state.linkComposition, "composition"),
    ]),
    baseSection("Item: Archive", state.disabledLink ? "disabled" : "enabled", navListItemSelector(state, "archive"), [
      row("Composition", state.itemComposition, "composition"),
    ]),
    baseSection("Link: Archive", state.disabledLink ? "disabled" : "enabled", navListLinkSelector(state, "archive"), [
      row("Composition", state.linkComposition, "composition"),
    ]),
  ];
}

function navListSlotSelector(state: ReturnType<typeof useNavListScenario>["state"], part: NavListSlotPart) {
  const slots: Record<NavListSlotPart, [defaultSlot: string, customSlot: string]> = {
    root: ["nav-list", "nav-list-root-custom"],
    section: ["nav-list-section", "nav-list-section-custom"],
    sectionTrigger: ["nav-list-section-trigger", "nav-list-section-trigger-custom"],
    sectionLabel: ["nav-list-section-label", "nav-list-section-label-custom"],
    sectionContent: ["nav-list-section-content", "nav-list-section-content-custom"],
    list: ["nav-list-list", "nav-list-list-custom"],
    item: ["nav-list-item", "nav-list-item-custom"],
    link: ["nav-list-link", "nav-list-link-custom"],
  };
  const slot = state.customSlots[part] ? slots[part][1] : slots[part][0];

  return `[data-slot='${slot}']`;
}

function navListItemSelector(state: ReturnType<typeof useNavListScenario>["state"], label: string) {
  return `${navListSlotSelector(state, "item")}.playground-nav-list-item-${label}`;
}

function navListLinkSelector(state: ReturnType<typeof useNavListScenario>["state"], label: string) {
  return `${navListSlotSelector(state, "link")}.playground-nav-list-link-${label}`;
}

function baseSection(title: string, summary: string, selector: string, rows = [row("Exists", "true", "presence")], inactive = false): AnatomySection {
  return { title, summary, selector, inactive, rows };
}

function row(label: string, value: string, category: "presence" | "identity" | "composition" | "state" | "data" | "aria" | "behavior") {
  return { label, value, category };
}

export function NavigationPrimitiveScenarioLog({ scenarioId, scenarios }: { scenarioId: string; scenarios: NavigationPrimitiveScenarios }) {
  return <ScenarioEventLog log={getNavigationLog(scenarioId, scenarios)} />;
}

function getNavigationLog(scenarioId: string, scenarios: NavigationPrimitiveScenarios) {
  if (scenarioId === "app-bar") return scenarios.appBar.state.log;
  if (scenarioId === "tabs") return scenarios.tabs.state.log;
  if (scenarioId === "accordion") return scenarios.accordion.state.log;
  if (scenarioId === "breadcrumb") return scenarios.breadcrumb.state.log;
  if (scenarioId === "pagination") return scenarios.pagination.state.log;
  if (scenarioId === "bottom-navigation") return scenarios.bottomNavigation.state.log;
  if (scenarioId === "nav-list") return scenarios.navList.state.log;
  return [];
}

export function getNavigationPrimitiveEventCount(scenarioId: string, scenarios: NavigationPrimitiveScenarios) {
  return getNavigationLog(scenarioId, scenarios).length;
}

export function clearNavigationPrimitiveLog(scenarioId: string, scenarios: NavigationPrimitiveScenarios) {
  if (scenarioId === "app-bar") scenarios.appBar.actions.clearLog();
  if (scenarioId === "tabs") scenarios.tabs.actions.clearLog();
  if (scenarioId === "accordion") scenarios.accordion.actions.clearLog();
  if (scenarioId === "breadcrumb") scenarios.breadcrumb.actions.clearLog();
  if (scenarioId === "pagination") scenarios.pagination.actions.clearLog();
  if (scenarioId === "bottom-navigation") scenarios.bottomNavigation.actions.clearLog();
  if (scenarioId === "nav-list") scenarios.navList.actions.clearLog();
}

export function getNavigationPrimitiveCanvasFooter(scenarioId: string, scenarios: NavigationPrimitiveScenarios) {
  if (scenarioId === "app-bar") return `${scenarios.appBar.state.position} | ${scenarios.appBar.state.density}`;
  if (scenarioId === "tabs") return `Value ${scenarios.tabs.state.value} | ${scenarios.tabs.state.activationMode} | ${scenarios.tabs.state.orientation}`;
  if (scenarioId === "accordion") return `${scenarios.accordion.state.multiple ? "multiple" : "single"} | ${formatAccordionValueLabel(scenarios.accordion.state.value)}`;
  if (scenarioId === "breadcrumb") return `Ellipsis ${scenarios.breadcrumb.state.showEllipsis} | Separator ${scenarios.breadcrumb.state.customSeparator ? "custom" : "default"}`;
  if (scenarioId === "pagination") return `Page ${scenarios.pagination.state.page} | Total ${scenarios.pagination.state.totalPages}`;
  if (scenarioId === "bottom-navigation") return `Value ${scenarios.bottomNavigation.state.value} | Labels ${scenarios.bottomNavigation.state.showLabels}`;
  if (scenarioId === "nav-list") return `${scenarios.navList.state.orientation} | Active ${scenarios.navList.state.active} | Open ${scenarios.navList.state.sectionOpen}`;
  return "";
}

export function getNavigationPrimitiveSource(scenarioId: string, scenarios?: NavigationPrimitiveScenarios) {
  if (scenarioId === "app-bar") {
    return scenarios ? getAppBarSource(scenarios.appBar.state) : `<AppBar.Root aria-label="Demo app bar">
  <AppBar.Toolbar>
    <AppBar.Start>Flowstack</AppBar.Start>
    <AppBar.Center>Dashboard</AppBar.Center>
    <AppBar.End><Button.Root>Settings</Button.Root></AppBar.End>
  </AppBar.Toolbar>
</AppBar.Root>`;
  }

  if (scenarioId === "tabs") {
    return `<Tabs.Root value={value} onValueChange={setValue}>
  <Tabs.List ariaLabel="Project sections">
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
    <Tabs.Trigger value="billing" disabled>Billing</Tabs.Trigger>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Content value="overview">Overview panel</Tabs.Content>
  <Tabs.Content value="settings">Settings panel</Tabs.Content>
</Tabs.Root>`;
  }

  if (scenarioId === "accordion" && scenarios) {
    return getAccordionSource(scenarios.accordion.state);
  }

  if (scenarioId === "breadcrumb") {
    return scenarios ? getBreadcrumbSource(scenarios.breadcrumb.state) : `<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item><Breadcrumb.Link href="/">Home</Breadcrumb.Link></Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item><Breadcrumb.Page>Atom playground</Breadcrumb.Page></Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>`;
  }

  if (scenarioId === "pagination") {
    return scenarios ? getPaginationSource(scenarios.pagination.state) : `<Pagination.Root page={page} totalPages={10} onPageChange={setPage}>
  <Pagination.List>
    <Pagination.Previous>Prev</Pagination.Previous>
    <Pagination.Item page={1} />
    <Pagination.Ellipsis />
    <Pagination.Next>Next</Pagination.Next>
  </Pagination.List>
</Pagination.Root>`;
  }

  if (scenarioId === "bottom-navigation") {
    return scenarios ? getBottomNavigationSource(scenarios.bottomNavigation.state) : `<BottomNavigation.Root ariaLabel="Demo bottom navigation" value={value} onChange={setValue}>
  <BottomNavigation.Item value="home">Home</BottomNavigation.Item>
  <BottomNavigation.Item value="search">Search</BottomNavigation.Item>
  <BottomNavigation.Item value="settings" disabled>Settings</BottomNavigation.Item>
</BottomNavigation.Root>`;
  }

  if (scenarioId === "nav-list") {
    return scenarios ? getNavListSource(scenarios.navList.state) : `<NavList.Root>
  <NavList.Section collapsible>
    <NavList.SectionLabel>Workspace</NavList.SectionLabel>
    <NavList.SectionTrigger>Project</NavList.SectionTrigger>
    <NavList.SectionContent>
      <NavList.List>
        <NavList.Item><NavList.Link active href="#overview">Overview</NavList.Link></NavList.Item>
      </NavList.List>
    </NavList.SectionContent>
  </NavList.Section>
</NavList.Root>`;
  }

  return "";
}

function getAppBarSource(state: ReturnType<typeof useAppBarScenario>["state"]) {
  const rootProps = [
    `aria-label="Demo app bar"`,
    state.position !== "static" ? `position="${state.position}"` : "",
    sourcePartProps("root", state.propCheck, state.customSlots.root, "appbar-custom"),
  ].filter(Boolean).join(" ");
  const rootOpen = renderAppBarSourcePart("Root", state.rootComposition, rootProps, "section");
  const rootClose = state.rootComposition === "asChild" ? "  </section>\n</AppBar.Root>" : "</AppBar.Root>";

  return `<AppBar.${rootOpen}
${indent(getAppBarToolbarSource(state), 2)}
${rootClose}`;
}

function getAppBarToolbarSource(state: ReturnType<typeof useAppBarScenario>["state"]) {
  const toolbarProps = [
    state.density !== "comfortable" ? `density="${state.density}"` : "",
    sourcePartProps("toolbar", state.propCheck, state.customSlots.toolbar, "appbar-toolbar-custom"),
  ].filter(Boolean).join(" ");
  const toolbarOpen = renderAppBarSourcePart("Toolbar", state.toolbarComposition, toolbarProps, "nav");
  const toolbarClose = state.toolbarComposition === "asChild" ? "  </nav>\n</AppBar.Toolbar>" : "</AppBar.Toolbar>";
  const children = [
    getAppBarSectionSource("Start", "start", state.startComposition, "Flowstack", state),
    getAppBarSectionSource("Center", "center", state.centerComposition, "Dashboard", state),
    getAppBarSectionSource("End", "end", state.endComposition, "<Button.Root>Settings</Button.Root>", state),
  ].map((child) => indent(child, 2)).join("\n");

  return `<AppBar.${toolbarOpen}
${children}
${toolbarClose}`;
}

function getAppBarSectionSource(
  componentName: "Start" | "Center" | "End",
  part: "start" | "center" | "end",
  composition: CompositionMode,
  children: string,
  state: ReturnType<typeof useAppBarScenario>["state"],
) {
  const props = sourcePartProps(part, state.propCheck, state.customSlots[part], `appbar-${part}-custom`);
  const inlineProps = props ? ` ${props}` : "";

  if (composition === "asChild") {
    return `<AppBar.${componentName}${inlineProps} asChild><span>${children}</span></AppBar.${componentName}>`;
  }

  if (composition === "render") {
    return `<AppBar.${componentName}${inlineProps} render={(props) => <span {...props} />}>${children}</AppBar.${componentName}>`;
  }

  return `<AppBar.${componentName}${inlineProps}>${children}</AppBar.${componentName}>`;
}

function renderAppBarSourcePart(part: string, mode: CompositionMode, props: string, tag: "section" | "nav") {
  const inlineProps = props ? ` ${props}` : "";

  if (mode === "asChild") {
    return `${part}${inlineProps} asChild>\n  <${tag}>`;
  }

  if (mode === "render") {
    return `${part}${inlineProps} render={(props) => <${tag} {...props} />}>`;
  }

  return `${part}${inlineProps}>`;
}

function getBreadcrumbSource(state: ReturnType<typeof useBreadcrumbScenario>["state"]) {
  const rootProps = [
    state.rootAriaLabel ? `ariaLabel="Demo breadcrumb"` : "",
    ...sourcePartPropList("root", state.propCheck, state.customSlots.root, "breadcrumb-root-custom"),
  ].filter(Boolean);

  return renderBreadcrumbSourceElement("Root", state.rootComposition, rootProps, "section", getBreadcrumbListSource(state));
}

function getBreadcrumbListSource(state: ReturnType<typeof useBreadcrumbScenario>["state"]) {
  const listProps = sourcePartPropList("list", state.propCheck, state.customSlots.list, "breadcrumb-list-custom");
  const children = [
    getBreadcrumbItemSource("home", getBreadcrumbLinkSource("home", "Home", "#home", state), state),
    getBreadcrumbSeparatorSource(state),
    state.showEllipsis ? getBreadcrumbItemSource("ellipsis", getBreadcrumbEllipsisSource(state), state) : "",
    state.showEllipsis ? getBreadcrumbSeparatorSource(state) : "",
    getBreadcrumbItemSource("projects", getBreadcrumbLinkSource("projects", "Projects", "#projects", state), state),
    getBreadcrumbSeparatorSource(state),
    getBreadcrumbItemSource("page", getBreadcrumbPageSource(state), state),
  ].filter(Boolean).map((child) => indent(child, 2)).join("\n");

  return renderBreadcrumbSourceElement("List", state.listComposition, listProps, "ol", children);
}

function getBreadcrumbItemSource(label: string, children: string, state: ReturnType<typeof useBreadcrumbScenario>["state"]) {
  const props = sourcePartPropList(`item-${label}`, state.propCheck, state.customSlots.item, "breadcrumb-item-custom");

  return renderBreadcrumbSourceElement("Item", state.itemComposition, props, "li", children);
}

function getBreadcrumbLinkSource(label: string, text: string, href: string, state: ReturnType<typeof useBreadcrumbScenario>["state"]) {
  const props = [
    `href="${href}"`,
    ...sourcePartPropList(`link-${label}`, state.propCheck, state.customSlots.link, "breadcrumb-link-custom"),
  ];

  return renderBreadcrumbSourceElement("Link", state.linkComposition, props, "a", text);
}

function getBreadcrumbPageSource(state: ReturnType<typeof useBreadcrumbScenario>["state"]) {
  const props = sourcePartPropList("page", state.propCheck, state.customSlots.page, "breadcrumb-page-custom");

  return renderBreadcrumbSourceElement("Page", state.pageComposition, props, "span", "Atom playground");
}

function getBreadcrumbSeparatorSource(state: ReturnType<typeof useBreadcrumbScenario>["state"]) {
  const props = sourcePartPropList("separator", state.propCheck, state.customSlots.separator, "breadcrumb-separator-custom");
  const children = state.customSeparator ? ">" : "/";
  const sourceChildren = state.customSeparator || state.separatorComposition === "asChild" ? children : "";

  return renderBreadcrumbSourceElement("Separator", state.separatorComposition, props, "li", sourceChildren, !state.customSeparator);
}

function getBreadcrumbEllipsisSource(state: ReturnType<typeof useBreadcrumbScenario>["state"]) {
  const props = [
    `aria-label="Show collapsed pages"`,
    ...sourcePartPropList("ellipsis", state.propCheck, state.customSlots.ellipsis, "breadcrumb-ellipsis-custom"),
  ];

  if (state.ellipsisComposition === "asChild") {
    return renderBreadcrumbSourceElement("Ellipsis", state.ellipsisComposition, props, "button", "...", false, ` type="button"`);
  }

  if (state.ellipsisComposition === "render") {
    return renderBreadcrumbSourceElement("Ellipsis", state.ellipsisComposition, props, `button type="button"`, "...");
  }

  return renderBreadcrumbSourceElement("Ellipsis", state.ellipsisComposition, props, "span", "", true);
}

function renderBreadcrumbSourceElement(
  part: string,
  mode: CompositionMode,
  props: string[],
  tag: string,
  children: string,
  selfCloseWhenEmpty = false,
  childAttributes = "",
) {
  const open = renderBreadcrumbSourceOpen(part, mode, props, tag, selfCloseWhenEmpty && !children && mode !== "asChild");

  if (selfCloseWhenEmpty && !children && mode !== "asChild") {
    return open;
  }

  if (mode === "asChild") {
    return `${open}
  <${tag}${childAttributes}>
${indent(children, 4)}
  </${tag}>
</Breadcrumb.${part}>`;
  }

  return `${open}
${indent(children, 2)}
</Breadcrumb.${part}>`;
}

function renderBreadcrumbSourceOpen(part: string, mode: CompositionMode, props: string[], tag: string, selfClosing = false) {
  const allProps = [
    ...props,
    mode === "asChild" ? "asChild" : "",
    mode === "render" ? `render={(props) => <${tag} {...props} />}` : "",
  ].filter(Boolean);
  const close = selfClosing ? " />" : ">";

  if (allProps.length === 0) {
    return `<Breadcrumb.${part}${close}`;
  }

  if (allProps.length === 1) {
    return `<Breadcrumb.${part} ${allProps[0]}${close}`;
  }

  return `<Breadcrumb.${part}
${allProps.map((prop) => `  ${prop}`).join("\n")}
${selfClosing ? "/>" : ">"}`;
}

function sourcePartPropList(part: string, propCheck: boolean, customSlot: boolean, customSlotValue: string) {
  return [
    propCheck ? `data-prop-check="${part}"` : "",
    customSlot ? `data-slot="${customSlotValue}"` : "",
  ].filter(Boolean);
}

function getPaginationSource(state: ReturnType<typeof usePaginationScenario>["state"]) {
  const rootProps = [
    state.localizedLabels ? `aria-label="Paginacion demo"` : "",
    `totalPages={${state.totalPages}}`,
    state.controlled ? `page={page}` : "",
    !state.controlled && state.defaultPage === "4" ? `defaultPage={4}` : "",
    state.controlled ? `onPageChange={setPage}` : `onPageChange={handlePageChange}`,
    state.siblingCount !== "1" ? `siblingCount={${state.siblingCount}}` : "",
    state.boundaryCount !== "1" ? `boundaryCount={${state.boundaryCount}}` : "",
    state.disabled ? "disabled" : "",
    ...sourcePartPropList("root", state.propCheck, state.customSlots.root, "pagination-root-custom"),
  ].filter(Boolean);

  return renderPaginationSourceElement("Root", state.rootComposition, rootProps, "section", getPaginationListSource(state));
}

function getPaginationListSource(state: ReturnType<typeof usePaginationScenario>["state"]) {
  const listProps = sourcePartPropList("list", state.propCheck, state.customSlots.list, "pagination-list-custom");
  const children = [
    getPaginationControlSource("Previous", "previous", state.previousComposition, "Prev", state),
    getPaginationItemSource(1, state),
    getPaginationItemSource(4, state),
    getPaginationEllipsisSource(state),
    getPaginationItemSource(Number(state.totalPages), state),
    getPaginationControlSource("Next", "next", state.nextComposition, "Next", state),
  ].map((child) => indent(child, 2)).join("\n");

  return renderPaginationSourceElement("List", state.listComposition, listProps, "ol", children);
}

function getPaginationControlSource(
  componentName: "Previous" | "Next",
  part: "previous" | "next",
  composition: CompositionMode,
  children: string,
  state: ReturnType<typeof usePaginationScenario>["state"],
) {
  const localizedLabel = part === "previous" ? "Pagina anterior" : "Pagina siguiente";
  const props = [
    state.localizedLabels ? `aria-label="${localizedLabel}"` : "",
    ...sourcePartPropList(part, state.propCheck, state.customSlots[part], `pagination-${part}-custom`),
  ].filter(Boolean);

  return renderPaginationSourceElement(componentName, composition, props, "button", children, false, ` type="button"`);
}

function getPaginationItemSource(page: number, state: ReturnType<typeof usePaginationScenario>["state"]) {
  const props = [
    `page={${page}}`,
    state.localizedLabels ? `aria-label="Pagina ${page}"` : "",
    ...sourcePartPropList("item", state.propCheck, state.customSlots.item, "pagination-item-custom"),
  ].filter(Boolean);

  return renderPaginationSourceElement("Item", state.itemComposition, props, "button", state.itemComposition === "default" ? "" : String(page), true, ` type="button"`);
}

function getPaginationEllipsisSource(state: ReturnType<typeof usePaginationScenario>["state"]) {
  const props = sourcePartPropList("ellipsis", state.propCheck, state.customSlots.ellipsis, "pagination-ellipsis-custom");

  return renderPaginationSourceElement("Ellipsis", state.ellipsisComposition, props, "span", state.ellipsisComposition === "default" ? "" : "...", true);
}

function renderPaginationSourceElement(
  part: string,
  mode: CompositionMode,
  props: string[],
  tag: string,
  children: string,
  selfCloseWhenEmpty = false,
  childAttributes = "",
) {
  const open = renderPaginationSourceOpen(part, mode, props, tag, selfCloseWhenEmpty && !children && mode !== "asChild");

  if (selfCloseWhenEmpty && !children && mode !== "asChild") {
    return open;
  }

  if (mode === "asChild") {
    return `${open}
  <${tag}${childAttributes}>
${indent(children, 4)}
  </${tag}>
</Pagination.${part}>`;
  }

  return `${open}
${indent(children, 2)}
</Pagination.${part}>`;
}

function renderPaginationSourceOpen(part: string, mode: CompositionMode, props: string[], tag: string, selfClosing = false) {
  const allProps = [
    ...props,
    mode === "asChild" ? "asChild" : "",
    mode === "render" ? `render={(props) => <${tag} {...props} />}` : "",
  ].filter(Boolean);
  const close = selfClosing ? " />" : ">";

  if (allProps.length === 0) {
    return `<Pagination.${part}${close}`;
  }

  if (allProps.length === 1) {
    return `<Pagination.${part} ${allProps[0]}${close}`;
  }

  return `<Pagination.${part}
${allProps.map((prop) => `  ${prop}`).join("\n")}
${selfClosing ? "/>" : ">"}`;
}

function getAccordionSource(state: ReturnType<typeof useAccordionScenario>["state"]) {
  const active = Array.isArray(state.value) ? state.value : state.value ? [state.value] : [];
  const rootProps = [
    state.multiple ? `type="multiple"` : `type="single"`,
    state.controlled
      ? `value={${state.multiple ? "value" : `"${active[0] ?? ""}"`}}`
      : `defaultValue={${state.multiple ? `["${active.join('", "')}"]` : `"${active[0] ?? "general"}"`}}`,
    state.controlled ? "onValueChange={setValue}" : "",
    !state.collapsible ? "collapsible={false}" : "",
    state.disabled ? "disabled" : "",
    state.orientation !== "vertical" ? `orientation="${state.orientation}"` : "",
    sourcePartProps("root", state.propCheck, state.customSlots.root, "accordion-root-custom"),
  ].filter(Boolean).join(" ");
  const rootOpen = renderAccordionSourcePart("Root", state.rootComposition, rootProps, "section");
  const rootClose = state.rootComposition === "asChild" ? "  </section>\n</Accordion.Root>" : "</Accordion.Root>";
  const items = accordionItems.map((item) => indent(getAccordionItemSource(item, state), 2)).join("\n");
  const source = `<Accordion.${rootOpen}
${items}
${rootClose}`;

  return state.dir === "rtl"
    ? `<Direction.Provider dir="rtl">
  ${source.split("\n").join("\n  ")}
</Direction.Provider>`
    : source;
}

function getAccordionItemSource(item: { value: string; label: string; content: string; disabled?: boolean }, state: ReturnType<typeof useAccordionScenario>["state"]) {
  const itemProps = [
    `value="${item.value}"`,
    item.disabled && state.disabledItem ? "disabled" : "",
    sourcePartProps(`item-${item.value}`, state.propCheck, state.customSlots.item, "accordion-item-custom"),
  ].filter(Boolean).join(" ");
  const itemOpen = renderAccordionSourcePart("Item", state.itemComposition, itemProps, "section");
  const itemClose = state.itemComposition === "asChild" ? "  </section>\n</Accordion.Item>" : "</Accordion.Item>";
  const children = [
    indent(getAccordionHeaderSource(item.label, item.value, state), 2),
    indent(getAccordionContentSource(item.content, state), 2),
  ].join("\n");

  return `<Accordion.${itemOpen}
${children}
${itemClose}`;
}

function getAccordionHeaderSource(label: string, value: string, state: ReturnType<typeof useAccordionScenario>["state"]) {
  const props = [
    sourcePartProps(`header-${value}`, state.propCheck, state.customSlots.header, "accordion-header-custom"),
  ].filter(Boolean).join(" ");
  const headerOpen = renderAccordionSourcePart("Header", state.headerComposition, props, "h4");
  const headerClose = state.headerComposition === "asChild" ? "  </h4>\n</Accordion.Header>" : "</Accordion.Header>";

  return `<Accordion.${headerOpen}
  ${getAccordionTriggerSource(label, value, state)}
${headerClose}`;
}

function getAccordionTriggerSource(label: string, value: string, state: ReturnType<typeof useAccordionScenario>["state"]) {
  const props = sourcePartProps(`trigger-${value}`, state.propCheck, state.customSlots.trigger, "accordion-trigger-custom");
  const inlineProps = props ? ` ${props}` : "";

  if (state.triggerComposition === "asChild") {
    return `<Accordion.Trigger${inlineProps} asChild><button type="button">${label}</button></Accordion.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<Accordion.Trigger${inlineProps} render={(props) => <button {...props} />}>${label}</Accordion.Trigger>`;
  }

  return `<Accordion.Trigger${inlineProps}>${label}</Accordion.Trigger>`;
}

function getAccordionContentSource(content: string, state: ReturnType<typeof useAccordionScenario>["state"]) {
  const props = [
    state.keepMounted ? "keepMounted" : "",
    sourcePartProps("content", state.propCheck, state.customSlots.content, "accordion-content-custom"),
  ].filter(Boolean).join(" ");
  const contentOpen = renderAccordionSourcePart("Content", state.contentComposition, props, "section");
  const contentClose = state.contentComposition === "asChild" ? "  </section>\n</Accordion.Content>" : "</Accordion.Content>";

  if (state.contentComposition === "asChild") {
    return `<Accordion.${contentOpen}
  ${content}
${contentClose}`;
  }

  return `<Accordion.${contentOpen}${content}</Accordion.Content>`;
}

function renderAccordionSourcePart(part: string, mode: CompositionMode, props: string, tag: "section" | "h4") {
  const inlineProps = props ? ` ${props}` : "";

  if (mode === "asChild") {
    return `${part}${inlineProps} asChild>\n  <${tag}>`;
  }

  if (mode === "render") {
    return `${part}${inlineProps} render={(props) => <${tag} {...props} />}>`;
  }

  return `${part}${inlineProps}>`;
}

function sourcePartProps(part: string, propCheck: boolean, customSlot: boolean, customSlotValue: string) {
  return [
    propCheck ? `data-prop-check="${part}"` : "",
    customSlot ? `data-slot="${customSlotValue}"` : "",
  ].filter(Boolean).join(" ");
}

function getBottomNavigationSource(state: ReturnType<typeof useBottomNavigationScenario>["state"]) {
  const rootProps = [
    `ariaLabel="Demo bottom navigation"`,
    state.controlled ? `value="${state.value}"` : `defaultValue="home"`,
    state.controlled ? "onChange={setValue}" : "",
    !state.showLabels ? "showLabels={false}" : "",
    sourcePartProps("root", state.propCheck, state.customSlots.root, "bottom-nav-root-custom"),
  ].filter(Boolean).join(" ");
  const rootOpen = renderBottomNavigationSourcePart("Root", state.rootComposition, rootProps, "nav");
  const rootClose = state.rootComposition === "asChild" ? "  </nav>\n</BottomNavigation.Root>" : "</BottomNavigation.Root>";
  const items = [
    getBottomNavigationItemSource({ value: "home", label: "Home" }, state),
    getBottomNavigationItemSource({ value: "search", label: "Search", href: state.linkItem ? "#search" : undefined }, state),
    getBottomNavigationItemSource({ value: "settings", label: "Settings", disabled: state.disabledItem }, state),
  ].map((item) => indent(item, 2)).join("\n");

  return `<BottomNavigation.${rootOpen}
${items}
${rootClose}`;
}

function getBottomNavigationItemSource(item: { value: string; label: string; disabled?: boolean; href?: string }, state: ReturnType<typeof useBottomNavigationScenario>["state"]) {
  const props = [
    `value="${item.value}"`,
    item.href ? `href="${item.href}"` : "",
    item.href ? `target="_blank"` : "",
    item.href ? `rel="noreferrer"` : "",
    item.value === "search" && state.blockSearchEvent ? `onClick={(event) => event.preventDefault()}` : "",
    item.disabled ? "disabled" : "",
    sourcePartProps(`item-${item.value}`, state.propCheck, state.customSlots.item, "bottom-nav-item-custom"),
  ].filter(Boolean).join(" ");
  const inlineProps = props ? ` ${props}` : "";

  if (state.itemComposition === "asChild") {
    const tag = item.href ? "a" : "button";
    const buttonType = tag === "button" ? ` type="button"` : "";
    return `<BottomNavigation.Item${inlineProps} asChild><${tag}${buttonType}>${item.label}</${tag}></BottomNavigation.Item>`;
  }

  if (state.itemComposition === "render") {
    const tag = item.href ? "a" : "button";
    return `<BottomNavigation.Item${inlineProps} render={(props) => <${tag} {...props} />}>${item.label}</BottomNavigation.Item>`;
  }

  return `<BottomNavigation.Item${inlineProps}>${item.label}</BottomNavigation.Item>`;
}

function renderBottomNavigationSourcePart(part: string, mode: CompositionMode, props: string, tag: "nav") {
  const inlineProps = props ? ` ${props}` : "";

  if (mode === "asChild") {
    return `${part}${inlineProps} asChild>\n  <${tag}>`;
  }

  if (mode === "render") {
    return `${part}${inlineProps} render={(props) => <${tag} {...props} />}>`;
  }

  return `${part}${inlineProps}>`;
}

function getNavListSource(state: ReturnType<typeof useNavListScenario>["state"]) {
  const rootProps = [
    `aria-label="Project navigation"`,
    state.orientation !== "vertical" ? `orientation="${state.orientation}"` : "",
    sourcePartProps("root", state.propCheck, state.customSlots.root, "nav-list-root-custom"),
  ].filter(Boolean).join(" ");
  const rootOpen = renderNavListSourcePart("Root", state.rootComposition, rootProps, "section");
  const rootClose = state.rootComposition === "asChild" ? "  </section>\n</NavList.Root>" : "</NavList.Root>";

  return `<NavList.${rootOpen}
${indent(getNavListSectionSource(state), 2)}
${rootClose}`;
}

function getNavListSectionSource(state: ReturnType<typeof useNavListScenario>["state"]) {
  const sectionProps = [
    state.collapsible ? "collapsible" : "",
    state.sectionControlled ? (state.sectionOpen ? `open={true}` : `open={false}`) : "",
    state.sectionControlled ? `onOpenChange={setSectionOpen}` : "",
    !state.sectionControlled && state.defaultSectionOpen ? `defaultOpen` : "",
    !state.sectionControlled ? `onOpenChange={handleOpenChange}` : "",
    state.disabledSection ? "disabled" : "",
    sourcePartProps("section", state.propCheck, state.customSlots.section, "nav-list-section-custom"),
  ].filter(Boolean).join(" ");
  const sectionOpen = renderNavListSourcePart("Section", state.sectionComposition, sectionProps, "section");
  const sectionClose = state.sectionComposition === "asChild" ? "  </section>\n</NavList.Section>" : "</NavList.Section>";
  const children = [
    getNavListSectionLabelSource(state),
    getNavListSectionTriggerSource(state),
    getNavListSectionContentSource(state),
  ].map((child) => indent(child, 2)).join("\n");

  return `<NavList.${sectionOpen}
${children}
${sectionClose}`;
}

function getNavListSectionTriggerSource(state: ReturnType<typeof useNavListScenario>["state"]) {
  const props = sourcePartProps("section-trigger", state.propCheck, state.customSlots.sectionTrigger, "nav-list-section-trigger-custom");
  const inlineProps = props ? ` ${props}` : "";

  if (state.sectionTriggerComposition === "asChild") {
    return `<NavList.SectionTrigger${inlineProps} asChild><button type="button">Project</button></NavList.SectionTrigger>`;
  }

  if (state.sectionTriggerComposition === "render") {
    return `<NavList.SectionTrigger${inlineProps} render={(props) => <button {...props} />}>Project</NavList.SectionTrigger>`;
  }

  return `<NavList.SectionTrigger${inlineProps}>Project</NavList.SectionTrigger>`;
}

function getNavListSectionLabelSource(state: ReturnType<typeof useNavListScenario>["state"]) {
  const props = [
    `as="h3"`,
    sourcePartProps("section-label", state.propCheck, state.customSlots.sectionLabel, "nav-list-section-label-custom"),
  ].filter(Boolean).join(" ");
  const inlineProps = props ? ` ${props}` : "";

  if (state.sectionLabelComposition === "asChild") {
    return `<NavList.SectionLabel${inlineProps} asChild><h4>Workspace</h4></NavList.SectionLabel>`;
  }

  if (state.sectionLabelComposition === "render") {
    return `<NavList.SectionLabel${inlineProps} render={(props) => <h4 {...props} />}>Workspace</NavList.SectionLabel>`;
  }

  return `<NavList.SectionLabel${inlineProps}>Workspace</NavList.SectionLabel>`;
}

function getNavListSectionContentSource(state: ReturnType<typeof useNavListScenario>["state"]) {
  const props = [
    state.forceMount ? "forceMount" : "",
    sourcePartProps("section-content", state.propCheck, state.customSlots.sectionContent, "nav-list-section-content-custom"),
  ].filter(Boolean).join(" ");
  const contentOpen = renderNavListSourcePart("SectionContent", state.sectionContentComposition, props, "div");
  const contentClose = state.sectionContentComposition === "asChild" ? "  </div>\n</NavList.SectionContent>" : "</NavList.SectionContent>";

  return `<NavList.${contentOpen}
${indent(getNavListListSource(state), 2)}
${contentClose}`;
}

function getNavListListSource(state: ReturnType<typeof useNavListScenario>["state"]) {
  const props = [
    state.ordered ? "ordered" : "",
    sourcePartProps("list", state.propCheck, state.customSlots.list, "nav-list-list-custom"),
  ].filter(Boolean).join(" ");
  const tag = state.ordered ? "ol" : "ul";
  const listOpen = renderNavListSourcePart("List", state.listComposition, props, tag);
  const listClose = state.listComposition === "asChild" ? `  </${tag}>\n</NavList.List>` : "</NavList.List>";
  const items = [
    getNavListItemSource("overview", "Overview", false, state),
    getNavListItemSource("settings", "Settings", false, state),
    getNavListItemSource("archive", "Archive", state.disabledLink, state),
  ].map((item) => indent(item, 2)).join("\n");

  return `<NavList.${listOpen}
${items}
${listClose}`;
}

function getNavListItemSource(label: string, text: string, disabled: boolean, state: ReturnType<typeof useNavListScenario>["state"]) {
  const props = [
    disabled ? "disabled" : "",
    sourcePartProps(`item-${label}`, state.propCheck, state.customSlots.item, "nav-list-item-custom"),
  ].filter(Boolean).join(" ");
  const itemOpen = renderNavListSourcePart("Item", state.itemComposition, props, "li");
  const itemClose = state.itemComposition === "asChild" ? "  </li>\n</NavList.Item>" : "</NavList.Item>";

  return `<NavList.${itemOpen}
  ${getNavListLinkSource(label, text, disabled, state)}
${itemClose}`;
}

function getNavListLinkSource(label: string, text: string, disabled: boolean, state: ReturnType<typeof useNavListScenario>["state"]) {
  const props = [
    state.active === label ? "active" : "",
    state.active === label && state.currentToken !== "page" ? `current="${state.currentToken}"` : "",
    disabled ? "disabled" : "",
    `href="#${label}"`,
    disabled ? "" : `onClick={() => setActive("${label}")}`,
    sourcePartProps(`link-${label}`, state.propCheck, state.customSlots.link, "nav-list-link-custom"),
  ].filter(Boolean).join(" ");
  const inlineProps = props ? ` ${props}` : "";

  if (state.linkComposition === "asChild") {
    return `<NavList.Link${inlineProps} asChild><a>${text}</a></NavList.Link>`;
  }

  if (state.linkComposition === "render") {
    return `<NavList.Link${inlineProps} render={(props) => <a {...props} />}>${text}</NavList.Link>`;
  }

  return `<NavList.Link${inlineProps}>${text}</NavList.Link>`;
}

function renderNavListSourcePart(part: string, mode: CompositionMode, props: string, tag: string) {
  const inlineProps = props ? ` ${props}` : "";

  if (mode === "asChild") {
    return `${part}${inlineProps} asChild>\n  <${tag}>`;
  }

  if (mode === "render") {
    return `${part}${inlineProps} render={(props) => <${tag} {...props} />}>`;
  }

  return `${part}${inlineProps}>`;
}

function indent(source: string, spaces: number) {
  const padding = " ".repeat(spaces);
  return source.split("\n").map((line) => `${padding}${line}`).join("\n");
}

function CompositionToolbarGroup({ label = "Root", value, onChange }: { label?: string; value: CompositionMode; onChange: (value: CompositionMode) => void }) {
  return (
    <ToolbarGroup title="Composition" value="composition">
      <MenuRadioControl label={label} options={compositionOptions} value={value} onChange={onChange} />
    </ToolbarGroup>
  );
}

function bool(value: boolean) {
  return value ? "true" : "false";
}

function getAccordionControlledValueOption(value: string | string[]) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "none";
  return value || "none";
}

function formatAccordionValueLabel(value: string | string[]) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  if (values.length === 0) return "none";
  return values.map((itemValue) => accordionValueLabels[itemValue] ?? itemValue).join(", ");
}

function formatAccordionSlotLabel(part: AccordionSlotPart) {
  return part.charAt(0).toUpperCase() + part.slice(1);
}

function formatAppBarSlotLabel(part: AppBarSlotPart) {
  if (part === "root") return "Root";
  return part.charAt(0).toUpperCase() + part.slice(1);
}

function formatBottomNavigationSlotLabel(part: BottomNavigationSlotPart) {
  if (part === "root") return "Root";
  return "Item";
}

function formatNavListSlotLabel(part: NavListSlotPart) {
  const labels: Record<NavListSlotPart, string> = {
    root: "Root",
    section: "Section",
    sectionTrigger: "Section Trigger",
    sectionLabel: "Section Label",
    sectionContent: "Section Content",
    list: "List",
    item: "Item",
    link: "Link",
  };

  return labels[part];
}

function formatBreadcrumbSlotLabel(part: BreadcrumbSlotPart) {
  return part.charAt(0).toUpperCase() + part.slice(1);
}

function formatPaginationSlotLabel(part: PaginationSlotPart) {
  if (part === "previous") return "Previous";
  if (part === "next") return "Next";
  return part.charAt(0).toUpperCase() + part.slice(1);
}

const accordionItems = [
  {
    value: "general",
    label: "What does Accordion render by default?",
    description: "Default tags, data attributes, and ARIA relationships.",
    content: "Accordion.Root renders a div, Item renders a div, Header renders a heading, Trigger renders a button, and Content renders a region linked back to its trigger.",
  },
  {
    value: "billing",
    label: "How does state behave?",
    description: "Single, multiple, controlled, uncontrolled, and collapsible modes.",
    content: "Use the toolbar to switch between single and multiple selection, controlled and uncontrolled state, disabled behavior, orientation, and mounted closed content.",
  },
  {
    value: "danger",
    label: "Can disabled items be tested?",
    description: "Disabled item evidence and keyboard navigation behavior.",
    content: "The disabled item should expose disabled data and ARIA state, block activation, and be skipped by keyboard navigation where the collection pattern applies.",
    disabled: true,
  },
];
const accordionSlotParts: AccordionSlotPart[] = ["root", "item", "header", "trigger", "content"];
const accordionValueLabels: Record<string, string> = {
  general: "Item 1",
  billing: "Item 2",
  danger: "Item 3",
};
const accordionSingleValueOptions = [
  { label: "Item 1", value: "general" },
  { label: "Item 2", value: "billing" },
  { label: "Item 3", value: "danger" },
  { label: "None", value: "none" },
] as const;
const accordionMultipleValueOptions = [
  { label: "Item 1", value: "general" },
  { label: "Item 1 + Item 2", value: "general, billing" },
  { label: "Item 2 + Item 3", value: "billing, danger" },
  { label: "None", value: "none" },
] as const;
const bottomNavigationValueOptions = [
  { label: "Home", value: "home" },
  { label: "Search", value: "search" },
  { label: "Settings", value: "settings" },
] as const;
const compositionOptions = ["default", "asChild", "render"] as const;
const orientationOptions = ["horizontal", "vertical"] as const;
const navListCurrentTokenOptions = ["page", "step", "location"] as const;
const directionOptions = ["ltr", "rtl"] as const;
const activationModeOptions = ["automatic", "manual"] as const;
const appBarPositionOptions = ["static", "sticky", "fixed", "absolute"] as const;
const appBarDensityOptions = ["compact", "comfortable"] as const;
const pageTotalOptions = ["0", "5", "10", "20"] as const;
const paginationPageOptions = ["1", "4", "10"] as const;
const paginationDefaultPageOptions = [
  { label: "Default (1)", value: "default" },
  { label: "Page 4", value: "4" },
] as const;
const countOptions = ["0", "1", "2"] as const;
