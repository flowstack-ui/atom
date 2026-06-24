import { AppBar } from "@flowstack-ui/atom/app-bar";
import { Button } from "@flowstack-ui/atom/button";
import { Menubar } from "@flowstack-ui/atom/menubar";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import { Tabs } from "@flowstack-ui/atom/tabs";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import "./styles.css";
import packageInfo from "../../package.json";
import { useElementInspector } from "./inspector";
import {
  DialogScenarioAnatomy,
  DialogScenarioCanvas,
  DialogScenarioLog,
  DialogScenarioToolbar,
} from "./scenarios/DialogScenario";
import {
  MenuScenarioAnatomy,
  MenuScenarioCanvas,
  MenuScenarioLog,
  MenuScenarioToolbar,
} from "./scenarios/MenuScenario";
import {
  SelectScenarioAnatomy,
  SelectScenarioCanvas,
  SelectScenarioLog,
  SelectScenarioToolbar,
} from "./scenarios/SelectScenario";
import { useDialogScenario } from "./scenarios/useDialogScenario";
import { useMenuScenario } from "./scenarios/useMenuScenario";
import { useSelectScenario } from "./scenarios/useSelectScenario";

type Scenario = {
  id: string;
  label: string;
  category: string;
  checks: string[];
};

const scenarios: Scenario[] = [
  {
    id: "dialog",
    label: "Dialog",
    category: "Overlays",
    checks: ["Opens from trigger", "Escape closes", "Focus returns", "State is visible"],
  },
  {
    id: "popover",
    label: "Popover",
    category: "Overlays",
    checks: ["Opens from trigger", "Outside click closes", "Placement updates"],
  },
  {
    id: "select",
    label: "Select",
    category: "Overlays",
    checks: ["Arrow keys move", "Value changes", "Disabled options skip"],
  },
  {
    id: "field",
    label: "Field",
    category: "Forms",
    checks: ["Label connects", "Description connects", "Error state updates"],
  },
  {
    id: "checkbox",
    label: "Checkbox",
    category: "Forms",
    checks: ["Space toggles", "Disabled blocks changes", "Form value exists"],
  },
  {
    id: "radio-group",
    label: "RadioGroup",
    category: "Forms",
    checks: ["Arrow keys move", "Value changes", "Required state shows"],
  },
  {
    id: "tabs",
    label: "Tabs",
    category: "Navigation",
    checks: ["Arrow keys move", "Panel changes", "Tab order stays correct"],
  },
  {
    id: "menu",
    label: "Menu",
    category: "Navigation",
    checks: ["Arrow keys move", "Submenu opens", "Selection state updates"],
  },
  {
    id: "accordion",
    label: "Accordion",
    category: "Navigation",
    checks: ["Trigger expands", "Keyboard moves", "Disabled item blocks changes"],
  },
  {
    id: "table",
    label: "Table",
    category: "Data",
    checks: ["Native table renders", "Caption is exposed", "Headers connect"],
  },
  {
    id: "tree",
    label: "Tree",
    category: "Data",
    checks: ["Arrow keys move", "Groups expand", "Selection updates"],
  },
  {
    id: "portal",
    label: "Portal",
    category: "Utilities",
    checks: ["Content mounts outside root", "Unmount removes content"],
  },
  {
    id: "visually-hidden",
    label: "VisuallyHidden",
    category: "Utilities",
    checks: ["Content stays accessible", "Text is visually hidden"],
  },
];

const categories = ["Forms", "Overlays", "Navigation", "Data", "Utilities"];
const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getScenario(id: string) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}

export function App() {
  const [activeScenarioId, setActiveScenarioId] = useState("menu");
  const [activeInspectorTab, setActiveInspectorTab] = useState<"selected" | "focused" | "log">("selected");
  const [dialogAnatomyOpenGroups, setDialogAnatomyOpenGroups] = useState<Record<string, boolean>>({});
  const [menuAnatomyOpenGroups, setMenuAnatomyOpenGroups] = useState<Record<string, boolean>>({});
  const [selectAnatomyOpenGroups, setSelectAnatomyOpenGroups] = useState<Record<string, boolean>>({});
  const activeScenario = getScenario(activeScenarioId);
  const inspector = useElementInspector();
  const dialogScenario = useDialogScenario();
  const menuScenario = useMenuScenario();
  const selectScenario = useSelectScenario();
  const focusCanvas = () => {
    const focusTarget = inspector.rootRef.current?.querySelector<HTMLElement>(focusableSelector);
    if (!focusTarget) return;

    requestAnimationFrame(() => {
      focusTarget.focus({ preventScroll: true });
      focusTarget.classList.add("canvas-focus-target");
      setActiveInspectorTab("focused");

      focusTarget.addEventListener("blur", () => {
        focusTarget.classList.remove("canvas-focus-target");
      }, { once: true });
    });
  };

  return (
    <div className="app-shell">
      <AppBar.Root className="menu-bar" position="sticky">
        <AppBar.Toolbar className="menu-bar-toolbar" density="compact">
          <AppBar.Start className="brand">Atom Playground</AppBar.Start>
          <AppBar.Center className="menu-bar-center">
            <Menubar.Root className="menu-list" aria-label="Playground categories">
              {categories.map((category) => (
                <Menubar.Menu key={category} value={category}>
                  <Menubar.Trigger
                    className="menu-button"
                  >
                    {category}
                  </Menubar.Trigger>
                  <Menubar.Content className="menu-popover" sideOffset={4}>
                    {scenarios
                      .filter((scenario) => scenario.category === category)
                      .map((scenario) => (
                        <Menubar.Item
                          className="menu-item"
                          key={scenario.id}
                          value={scenario.id}
                          data-active={scenario.id === activeScenario.id ? "" : undefined}
                          onSelect={() => setActiveScenarioId(scenario.id)}
                        >
                          {scenario.label}
                        </Menubar.Item>
                      ))}
                  </Menubar.Content>
                </Menubar.Menu>
              ))}
            </Menubar.Root>
          </AppBar.Center>
          <AppBar.End className="version">
            {packageInfo.name} {packageInfo.version}
          </AppBar.End>
        </AppBar.Toolbar>
      </AppBar.Root>

      <main className="workspace">
        <section className="scenario-header" aria-labelledby="scenario-title">
          <p className="category-label">{activeScenario.category}</p>
          <h1 id="scenario-title">{activeScenario.label}</h1>
        </section>

        <section className="scenario-grid">
          <article className="scenario-card controls-card">
            <div className="card-header">
              <h2>Anatomy</h2>
              {activeScenario.id === "dialog" ? (
                <Button.Root
                  className="header-action"
                  onPress={() => setDialogAnatomyOpenGroups({})}
                >
                  Collapse All
                </Button.Root>
              ) : null}
              {activeScenario.id === "select" ? (
                <Button.Root
                  className="header-action"
                  onPress={() => setSelectAnatomyOpenGroups({})}
                >
                  Collapse All
                </Button.Root>
              ) : null}
              {activeScenario.id === "menu" ? (
                <Button.Root
                  className="header-action"
                  onPress={() => setMenuAnatomyOpenGroups({})}
                >
                  Collapse All
                </Button.Root>
              ) : null}
            </div>
            <ScenarioAnatomy
              dialogAnatomyOpenGroups={dialogAnatomyOpenGroups}
              dialogScenario={dialogScenario}
              menuAnatomyOpenGroups={menuAnatomyOpenGroups}
              menuScenario={menuScenario}
              selectAnatomyOpenGroups={selectAnatomyOpenGroups}
              selectScenario={selectScenario}
              scenarioId={activeScenario.id}
              onDialogAnatomyOpenGroupsChange={setDialogAnatomyOpenGroups}
              onMenuAnatomyOpenGroupsChange={setMenuAnatomyOpenGroups}
              onSelectAnatomyOpenGroupsChange={setSelectAnatomyOpenGroups}
            />
          </article>

          <article className="scenario-card canvas-card">
            <div className="card-header">
              <h2>Canvas</h2>
              <Button.Root className="header-action" onPress={focusCanvas}>
                Focus Canvas
              </Button.Root>
            </div>
            <ScenarioToolbar
              dialogScenario={dialogScenario}
              menuScenario={menuScenario}
              selectScenario={selectScenario}
              scenarioId={activeScenario.id}
            />
            <div className="canvas" ref={inspector.rootRef}>
              <ScenarioCanvas
                dialogScenario={dialogScenario}
                menuScenario={menuScenario}
                selectScenario={selectScenario}
                scenarioId={activeScenario.id}
                label={activeScenario.label}
              />
            </div>
            <ScenarioCanvasFooter
              dialogScenario={dialogScenario}
              menuScenario={menuScenario}
              selectScenario={selectScenario}
              scenarioId={activeScenario.id}
            />
          </article>

          <div className="right-column">
            <Tabs.Root
              className="scenario-card inspector-card"
              value={activeInspectorTab}
              onValueChange={(value) => setActiveInspectorTab(value as "selected" | "focused" | "log")}
            >
              <div className="card-header">
                <h2>Inspector</h2>
                {activeInspectorTab === "log" ? (
                  <ScenarioLogAction
                    dialogScenario={dialogScenario}
                    menuScenario={menuScenario}
                    selectScenario={selectScenario}
                    scenarioId={activeScenario.id}
                  />
                ) : null}
              </div>
              <Tabs.List className="inspector-mode-list" ariaLabel="Inspector view">
                <Tabs.Trigger value="selected">
                  Selected
                </Tabs.Trigger>
                <Tabs.Trigger value="focused">
                  Focused
                </Tabs.Trigger>
                <Tabs.Trigger value="log">
                  Logs
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content className="inspector-panel" value="selected">
                <InspectorList rows={inspector.selectedRows} />
              </Tabs.Content>
              <Tabs.Content className="inspector-panel" value="focused">
                <InspectorList rows={inspector.focusedRows} />
              </Tabs.Content>
              <Tabs.Content className="inspector-panel" value="log">
                <ScenarioLog
                  dialogScenario={dialogScenario}
                  menuScenario={menuScenario}
                  selectScenario={selectScenario}
                  scenarioId={activeScenario.id}
                />
              </Tabs.Content>
              <div className="panel-footer">
                {activeInspectorTab === "selected" ? (
                  "Selected Target"
                ) : activeInspectorTab === "focused" ? (
                  "Focused Target"
                ) : (
                  <ScenarioLogFooter
                    dialogScenario={dialogScenario}
                    menuScenario={menuScenario}
                    selectScenario={selectScenario}
                    scenarioId={activeScenario.id}
                  />
                )}
              </div>
            </Tabs.Root>
          </div>
        </section>
      </main>
    </div>
  );
}

function InspectorList({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <ScrollArea.Root className="inspector-scroll" orientation="vertical">
      <ScrollArea.Viewport className="inspector-scroll-viewport" focusable aria-label="Inspector rows">
        <dl className="inspector-list">
          {rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd title={row.value}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  );
}

function ScenarioToolbar({
  dialogScenario,
  menuScenario,
  selectScenario,
  scenarioId,
}: {
  dialogScenario: ReturnType<typeof useDialogScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
}) {
  if (scenarioId === "dialog") {
    return (
      <DialogScenarioToolbar
        state={dialogScenario.state}
        actions={dialogScenario.actions}
      />
    );
  }

  if (scenarioId === "select") {
    return (
      <SelectScenarioToolbar
        state={selectScenario.state}
        actions={selectScenario.actions}
      />
    );
  }

  if (scenarioId === "menu") {
    return (
      <MenuScenarioToolbar
        state={menuScenario.state}
        actions={menuScenario.actions}
      />
    );
  }

  return null;
}

function ScenarioCanvas({
  dialogScenario,
  menuScenario,
  selectScenario,
  scenarioId,
  label,
}: {
  dialogScenario: ReturnType<typeof useDialogScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
  label: string;
}) {
  if (scenarioId === "dialog") {
    return (
      <DialogScenarioCanvas
        state={dialogScenario.state}
        actions={dialogScenario.actions}
        onOpenChange={dialogScenario.handleOpenChange}
        onControlledOpen={() => dialogScenario.actions.setControlledOpen(true)}
        onControlledClose={() => dialogScenario.actions.setControlledOpen(false)}
      />
    );
  }

  if (scenarioId === "select") {
    return (
      <SelectScenarioCanvas
        state={selectScenario.state}
        actions={selectScenario.actions}
      />
    );
  }

  if (scenarioId === "menu") {
    return (
      <MenuScenarioCanvas
        state={menuScenario.state}
        actions={menuScenario.actions}
      />
    );
  }

  return (
    <p className="placeholder-card">
      {label} scenario goes here.
    </p>
  );
}

function ScenarioCanvasFooter({
  dialogScenario,
  menuScenario,
  selectScenario,
  scenarioId,
}: {
  dialogScenario: ReturnType<typeof useDialogScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
}) {
  if (scenarioId === "dialog") {
    const state = dialogScenario.state;
    const openState = state.open ? "Open" : "Closed";
    const mode = state.controlled ? "Controlled" : "Uncontrolled";

    return (
      <div className="panel-footer">
        {`${openState} | ${mode} | Trigger ${state.triggerComposition} | Save ${state.closeComposition}`}
      </div>
    );
  }

  if (scenarioId === "select") {
    const state = selectScenario.state;
    const openState = state.open ? "Open" : "Closed";
    const valueMode = state.valueControlled ? "Value controlled" : "Value uncontrolled";
    const openMode = state.openControlled ? "Open controlled" : "Open uncontrolled";

    return (
      <div className="panel-footer">
        {`${openState} | Value ${state.parts.value} | Label ${state.parts.valueLabel} | ${valueMode} | ${openMode}`}
      </div>
    );
  }

  if (scenarioId === "menu") {
    const state = menuScenario.state;
    const openState = state.open ? "Open" : "Closed";
    const mode = state.controlled ? "Controlled" : "Uncontrolled";

    return (
      <div className="panel-footer">
        {`${openState} | ${mode} | ${state.side} ${state.align} | Radio ${state.radioValue}`}
      </div>
    );
  }

  return null;
}

function ScenarioAnatomy({
  dialogAnatomyOpenGroups,
  dialogScenario,
  menuAnatomyOpenGroups,
  menuScenario,
  selectAnatomyOpenGroups,
  selectScenario,
  scenarioId,
  onDialogAnatomyOpenGroupsChange,
  onMenuAnatomyOpenGroupsChange,
  onSelectAnatomyOpenGroupsChange,
}: {
  dialogAnatomyOpenGroups: Record<string, boolean>;
  dialogScenario: ReturnType<typeof useDialogScenario>;
  menuAnatomyOpenGroups: Record<string, boolean>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  selectAnatomyOpenGroups: Record<string, boolean>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
  onDialogAnatomyOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
  onMenuAnatomyOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
  onSelectAnatomyOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  if (scenarioId === "dialog") {
    return (
      <DialogScenarioAnatomy
        openGroups={dialogAnatomyOpenGroups}
        state={dialogScenario.state}
        onOpenGroupsChange={onDialogAnatomyOpenGroupsChange}
      />
    );
  }

  if (scenarioId === "select") {
    return (
      <SelectScenarioAnatomy
        openGroups={selectAnatomyOpenGroups}
        state={selectScenario.state}
        onOpenGroupsChange={onSelectAnatomyOpenGroupsChange}
      />
    );
  }

  if (scenarioId === "menu") {
    return (
      <MenuScenarioAnatomy
        openGroups={menuAnatomyOpenGroups}
        state={menuScenario.state}
        onOpenGroupsChange={onMenuAnatomyOpenGroupsChange}
      />
    );
  }

  return (
    <div className="toolbar-row" aria-label="Scenario controls">
      <button type="button">Controlled</button>
      <button type="button">Disabled</button>
      <button type="button">RTL</button>
    </div>
  );
}

function ScenarioLog({
  dialogScenario,
  menuScenario,
  selectScenario,
  scenarioId,
}: {
  dialogScenario: ReturnType<typeof useDialogScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
}) {
  if (scenarioId === "dialog") {
    return (
      <DialogScenarioLog
        state={dialogScenario.state}
      />
    );
  }

  if (scenarioId === "select") {
    return (
      <SelectScenarioLog
        state={selectScenario.state}
      />
    );
  }

  if (scenarioId === "menu") {
    return (
      <MenuScenarioLog
        state={menuScenario.state}
      />
    );
  }

  return null;
}

function ScenarioLogFooter({
  dialogScenario,
  menuScenario,
  selectScenario,
  scenarioId,
}: {
  dialogScenario: ReturnType<typeof useDialogScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
}) {
  if (scenarioId !== "dialog" && scenarioId !== "select" && scenarioId !== "menu") return null;

  const eventCount = scenarioId === "dialog"
    ? dialogScenario.state.log.length
    : scenarioId === "select"
      ? selectScenario.state.log.length
      : menuScenario.state.log.length;
  const eventLabel = eventCount === 1 ? "Event" : "Events";

  return <>{eventCount === 0 ? "No Events" : `${eventCount} ${eventLabel}`}</>;
}

function ScenarioLogAction({
  dialogScenario,
  menuScenario,
  selectScenario,
  scenarioId,
}: {
  dialogScenario: ReturnType<typeof useDialogScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
}) {
  if (scenarioId !== "dialog" && scenarioId !== "select" && scenarioId !== "menu") return null;

  return (
    <Button.Root
      className="header-action"
      onPress={
        scenarioId === "dialog"
          ? dialogScenario.actions.clearLog
          : scenarioId === "select"
            ? selectScenario.actions.clearLog
            : menuScenario.actions.clearLog
      }
    >
      Clear
    </Button.Root>
  );
}
