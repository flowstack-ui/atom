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
  AlertDialogScenarioAnatomy,
  AlertDialogScenarioCanvas,
  AlertDialogScenarioLog,
  AlertDialogScenarioToolbar,
  getAlertDialogSource,
} from "./scenarios/AlertDialogScenario";
import {
  DropdownMenuScenarioAnatomy,
  DropdownMenuScenarioCanvas,
  DropdownMenuScenarioLog,
  DropdownMenuScenarioToolbar,
} from "./scenarios/DropdownMenuScenario";
import {
  ContextMenuScenarioAnatomy,
  ContextMenuScenarioCanvas,
  ContextMenuScenarioLog,
  ContextMenuScenarioToolbar,
} from "./scenarios/ContextMenuScenario";
import {
  MenuScenarioAnatomy,
  MenuScenarioCanvas,
  MenuScenarioLog,
  MenuScenarioToolbar,
} from "./scenarios/MenuScenario";
import {
  PopoverScenarioAnatomy,
  PopoverScenarioCanvas,
  PopoverScenarioLog,
  PopoverScenarioToolbar,
  getPopoverSource,
} from "./scenarios/PopoverScenario";
import {
  SelectScenarioAnatomy,
  SelectScenarioCanvas,
  SelectScenarioLog,
  SelectScenarioToolbar,
} from "./scenarios/SelectScenario";
import { useDialogScenario } from "./scenarios/useDialogScenario";
import { useAlertDialogScenario } from "./scenarios/useAlertDialogScenario";
import { useDropdownMenuScenario } from "./scenarios/useDropdownMenuScenario";
import { useContextMenuScenario } from "./scenarios/useContextMenuScenario";
import { useMenuScenario } from "./scenarios/useMenuScenario";
import { usePopoverScenario } from "./scenarios/usePopoverScenario";
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
    id: "alert-dialog",
    label: "Alert Dialog",
    category: "Overlays",
    checks: ["Cancel autofocus", "Action reason", "Backdrop is blocked"],
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
    id: "context-menu",
    label: "Context Menu",
    category: "Overlays",
    checks: ["Right-click opens", "Keyboard opens", "Menu behavior works"],
  },
  {
    id: "dropdown-menu",
    label: "Dropdown Menu",
    category: "Overlays",
    checks: ["Trigger opens", "Keyboard opens", "Menu behavior works"],
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
  const [activeScenarioId, setActiveScenarioId] = useState("context-menu");
  const [activeCanvasTab, setActiveCanvasTab] = useState<"preview" | "source">("preview");
  const [activeInspectorTab, setActiveInspectorTab] = useState<"selected" | "focused" | "log">("selected");
  const [alertDialogAnatomyOpenGroups, setAlertDialogAnatomyOpenGroups] = useState<Record<string, boolean>>({});
  const [dialogAnatomyOpenGroups, setDialogAnatomyOpenGroups] = useState<Record<string, boolean>>({});
  const [contextMenuAnatomyOpenGroups, setContextMenuAnatomyOpenGroups] = useState<Record<string, boolean>>({});
  const [dropdownMenuAnatomyOpenGroups, setDropdownMenuAnatomyOpenGroups] = useState<Record<string, boolean>>({});
  const [menuAnatomyOpenGroups, setMenuAnatomyOpenGroups] = useState<Record<string, boolean>>({});
  const [popoverAnatomyOpenGroups, setPopoverAnatomyOpenGroups] = useState<Record<string, boolean>>({});
  const [selectAnatomyOpenGroups, setSelectAnatomyOpenGroups] = useState<Record<string, boolean>>({});
  const activeScenario = getScenario(activeScenarioId);
  const inspector = useElementInspector();
  const alertDialogScenario = useAlertDialogScenario();
  const dialogScenario = useDialogScenario();
  const contextMenuScenario = useContextMenuScenario();
  const dropdownMenuScenario = useDropdownMenuScenario();
  const menuScenario = useMenuScenario();
  const popoverScenario = usePopoverScenario();
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
              {activeScenario.id === "alert-dialog" ? (
                <Button.Root
                  className="header-action"
                  onPress={() => setAlertDialogAnatomyOpenGroups({})}
                >
                  Collapse All
                </Button.Root>
              ) : null}
              {activeScenario.id === "popover" ? (
                <Button.Root
                  className="header-action"
                  onPress={() => setPopoverAnatomyOpenGroups({})}
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
              {activeScenario.id === "context-menu" ? (
                <Button.Root
                  className="header-action"
                  onPress={() => setContextMenuAnatomyOpenGroups({})}
                >
                  Collapse All
                </Button.Root>
              ) : null}
              {activeScenario.id === "dropdown-menu" ? (
                <Button.Root
                  className="header-action"
                  onPress={() => setDropdownMenuAnatomyOpenGroups({})}
                >
                  Collapse All
                </Button.Root>
              ) : null}
            </div>
            <ScenarioAnatomy
              alertDialogAnatomyOpenGroups={alertDialogAnatomyOpenGroups}
              alertDialogScenario={alertDialogScenario}
              contextMenuAnatomyOpenGroups={contextMenuAnatomyOpenGroups}
              contextMenuScenario={contextMenuScenario}
              dialogAnatomyOpenGroups={dialogAnatomyOpenGroups}
              dialogScenario={dialogScenario}
              dropdownMenuAnatomyOpenGroups={dropdownMenuAnatomyOpenGroups}
              dropdownMenuScenario={dropdownMenuScenario}
              menuAnatomyOpenGroups={menuAnatomyOpenGroups}
              menuScenario={menuScenario}
              popoverAnatomyOpenGroups={popoverAnatomyOpenGroups}
              popoverScenario={popoverScenario}
              selectAnatomyOpenGroups={selectAnatomyOpenGroups}
              selectScenario={selectScenario}
              scenarioId={activeScenario.id}
              onAlertDialogAnatomyOpenGroupsChange={setAlertDialogAnatomyOpenGroups}
              onDialogAnatomyOpenGroupsChange={setDialogAnatomyOpenGroups}
              onContextMenuAnatomyOpenGroupsChange={setContextMenuAnatomyOpenGroups}
              onDropdownMenuAnatomyOpenGroupsChange={setDropdownMenuAnatomyOpenGroups}
              onMenuAnatomyOpenGroupsChange={setMenuAnatomyOpenGroups}
              onPopoverAnatomyOpenGroupsChange={setPopoverAnatomyOpenGroups}
              onSelectAnatomyOpenGroupsChange={setSelectAnatomyOpenGroups}
            />
          </article>

          <Tabs.Root
            className="scenario-card canvas-card"
            value={activeCanvasTab}
            onValueChange={(value) => setActiveCanvasTab(value as "preview" | "source")}
          >
            <div className="card-header">
              <h2>Canvas</h2>
              <div className="canvas-header-actions">
                <Tabs.List className="header-segmented" ariaLabel="Canvas view">
                  <Tabs.Trigger value="preview">Canvas</Tabs.Trigger>
                  <Tabs.Trigger value="source">Source</Tabs.Trigger>
                </Tabs.List>
                {activeCanvasTab === "preview" ? (
                  <Button.Root className="header-action" onPress={focusCanvas}>
                    Focus Canvas
                  </Button.Root>
                ) : null}
              </div>
            </div>
            <ScenarioToolbar
              alertDialogScenario={alertDialogScenario}
              contextMenuScenario={contextMenuScenario}
              dialogScenario={dialogScenario}
              dropdownMenuScenario={dropdownMenuScenario}
              menuScenario={menuScenario}
              popoverScenario={popoverScenario}
              selectScenario={selectScenario}
              scenarioId={activeScenario.id}
            />
            <Tabs.Content className="canvas-tab-panel" value="preview">
              <div className="canvas" ref={inspector.rootRef}>
                <ScenarioCanvas
                  alertDialogScenario={alertDialogScenario}
                  contextMenuScenario={contextMenuScenario}
                  dialogScenario={dialogScenario}
                  dropdownMenuScenario={dropdownMenuScenario}
                  menuScenario={menuScenario}
                  popoverScenario={popoverScenario}
                  selectScenario={selectScenario}
                  scenarioId={activeScenario.id}
                  label={activeScenario.label}
                />
              </div>
            </Tabs.Content>
            <Tabs.Content className="canvas-tab-panel" value="source">
              <ScenarioSource
                alertDialogScenario={alertDialogScenario}
                contextMenuScenario={contextMenuScenario}
                dialogScenario={dialogScenario}
                dropdownMenuScenario={dropdownMenuScenario}
                menuScenario={menuScenario}
                popoverScenario={popoverScenario}
                selectScenario={selectScenario}
                scenarioId={activeScenario.id}
              />
            </Tabs.Content>
            <ScenarioCanvasFooter
              alertDialogScenario={alertDialogScenario}
              contextMenuScenario={contextMenuScenario}
              dialogScenario={dialogScenario}
              dropdownMenuScenario={dropdownMenuScenario}
              menuScenario={menuScenario}
              popoverScenario={popoverScenario}
              selectScenario={selectScenario}
              scenarioId={activeScenario.id}
            />
          </Tabs.Root>

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
                    contextMenuScenario={contextMenuScenario}
                    alertDialogScenario={alertDialogScenario}
                    dialogScenario={dialogScenario}
                    dropdownMenuScenario={dropdownMenuScenario}
                    menuScenario={menuScenario}
                    popoverScenario={popoverScenario}
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
                <InspectorPanel details={inspector.selectedDetails} />
              </Tabs.Content>
              <Tabs.Content className="inspector-panel" value="focused">
                <InspectorPanel details={inspector.focusedDetails} />
              </Tabs.Content>
              <Tabs.Content className="inspector-panel" value="log">
                <ScenarioLog
                  contextMenuScenario={contextMenuScenario}
                  alertDialogScenario={alertDialogScenario}
                  dialogScenario={dialogScenario}
                  dropdownMenuScenario={dropdownMenuScenario}
                  menuScenario={menuScenario}
                  popoverScenario={popoverScenario}
                  selectScenario={selectScenario}
                  scenarioId={activeScenario.id}
                />
              </Tabs.Content>
              <div className="panel-footer">
                {activeInspectorTab === "selected" ? (
                  <InspectorFooter details={inspector.selectedDetails} />
                ) : activeInspectorTab === "focused" ? (
                  <InspectorFooter details={inspector.focusedDetails} />
                ) : (
                  <ScenarioLogFooter
                    contextMenuScenario={contextMenuScenario}
                    alertDialogScenario={alertDialogScenario}
                    dialogScenario={dialogScenario}
                    dropdownMenuScenario={dropdownMenuScenario}
                    menuScenario={menuScenario}
                    popoverScenario={popoverScenario}
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

function InspectorPanel({ details }: { details: ReturnType<typeof useElementInspector>["selectedDetails"] }) {
  return (
    <ScrollArea.Root className="inspector-scroll" orientation="vertical">
      <ScrollArea.Viewport className="inspector-scroll-viewport" focusable aria-label="Inspector details">
        <div className="inspector-details">
          <InspectorRow label="ID" value={details.id} />
          {details.text !== "-" ? <InspectorBlock label="Text" value={details.text} /> : null}
          {details.value !== "-" ? <InspectorBlock label="Value" value={details.value} /> : null}
          <InspectorAttributeBlock tag={details.tag} value={details.native} />
          <InspectorBlock label="ARIA" value={details.aria} />
          <InspectorBlock label="Data" value={details.data} />
        </div>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  );
}

function InspectorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="inspector-row">
      <span>{label}</span>
      <code title={value}>{value}</code>
    </div>
  );
}

function InspectorAttributeBlock({ tag, value }: { tag: string; value: string }) {
  return (
    <section className="inspector-block">
      <h3 className="inspector-attribute-title">
        <span>Attributes</span>
        <code>{tag}</code>
      </h3>
      <pre title={value}>{value}</pre>
    </section>
  );
}

function InspectorBlock({ label, value }: { label: string; value: string }) {
  return (
    <section className="inspector-block">
      <h3>{label}</h3>
      <pre title={value}>{value}</pre>
    </section>
  );
}

function InspectorFooter({
  details,
}: {
  details: ReturnType<typeof useElementInspector>["selectedDetails"];
}) {
  return `disabled ${details.disabled ? "true" : "false"} | hidden ${details.hidden ? "true" : "false"}`;
}

function ScenarioToolbar({
  alertDialogScenario,
  contextMenuScenario,
  dialogScenario,
  dropdownMenuScenario,
  menuScenario,
  popoverScenario,
  selectScenario,
  scenarioId,
}: {
  alertDialogScenario: ReturnType<typeof useAlertDialogScenario>;
  contextMenuScenario: ReturnType<typeof useContextMenuScenario>;
  dialogScenario: ReturnType<typeof useDialogScenario>;
  dropdownMenuScenario: ReturnType<typeof useDropdownMenuScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  popoverScenario: ReturnType<typeof usePopoverScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
}) {
  if (scenarioId === "alert-dialog") {
    return (
      <AlertDialogScenarioToolbar
        state={alertDialogScenario.state}
        actions={alertDialogScenario.actions}
      />
    );
  }

  if (scenarioId === "popover") {
    return (
      <PopoverScenarioToolbar
        state={popoverScenario.state}
        actions={popoverScenario.actions}
      />
    );
  }

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

  if (scenarioId === "context-menu") {
    return (
      <ContextMenuScenarioToolbar
        state={contextMenuScenario.state}
        actions={contextMenuScenario.actions}
      />
    );
  }

  if (scenarioId === "dropdown-menu") {
    return (
      <DropdownMenuScenarioToolbar
        state={dropdownMenuScenario.state}
        actions={dropdownMenuScenario.actions}
      />
    );
  }

  return null;
}

function ScenarioCanvas({
  alertDialogScenario,
  contextMenuScenario,
  dialogScenario,
  dropdownMenuScenario,
  menuScenario,
  popoverScenario,
  selectScenario,
  scenarioId,
  label,
}: {
  alertDialogScenario: ReturnType<typeof useAlertDialogScenario>;
  contextMenuScenario: ReturnType<typeof useContextMenuScenario>;
  dialogScenario: ReturnType<typeof useDialogScenario>;
  dropdownMenuScenario: ReturnType<typeof useDropdownMenuScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  popoverScenario: ReturnType<typeof usePopoverScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
  label: string;
}) {
  if (scenarioId === "alert-dialog") {
    return (
      <AlertDialogScenarioCanvas
        state={alertDialogScenario.state}
        actions={alertDialogScenario.actions}
      />
    );
  }

  if (scenarioId === "popover") {
    return (
      <PopoverScenarioCanvas
        state={popoverScenario.state}
        actions={popoverScenario.actions}
      />
    );
  }

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

  if (scenarioId === "context-menu") {
    return (
      <ContextMenuScenarioCanvas
        state={contextMenuScenario.state}
        actions={contextMenuScenario.actions}
      />
    );
  }

  if (scenarioId === "dropdown-menu") {
    return (
      <DropdownMenuScenarioCanvas
        state={dropdownMenuScenario.state}
        actions={dropdownMenuScenario.actions}
      />
    );
  }

  return (
    <p className="placeholder-card">
      {label} scenario goes here.
    </p>
  );
}

function ScenarioSource({
  alertDialogScenario,
  contextMenuScenario,
  dialogScenario,
  dropdownMenuScenario,
  menuScenario,
  popoverScenario,
  selectScenario,
  scenarioId,
}: {
  alertDialogScenario: ReturnType<typeof useAlertDialogScenario>;
  contextMenuScenario: ReturnType<typeof useContextMenuScenario>;
  dialogScenario: ReturnType<typeof useDialogScenario>;
  dropdownMenuScenario: ReturnType<typeof useDropdownMenuScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  popoverScenario: ReturnType<typeof usePopoverScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
}) {
  const source = getScenarioSource({
    alertDialogScenario,
    contextMenuScenario,
    dialogScenario,
    dropdownMenuScenario,
    menuScenario,
    popoverScenario,
    selectScenario,
    scenarioId,
  });

  return (
    <ScrollArea.Root className="canvas-source-scroll" orientation="vertical">
      <ScrollArea.Viewport className="canvas-source-viewport" focusable aria-label="Canvas source">
        <pre className="canvas-source-code">
          <code>{highlightSource(source)}</code>
        </pre>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  );
}

function highlightSource(source: string) {
  const tokenPattern = /(\/\/.*|<\/?[\w.]+|[A-Za-z][\w-]*(?==)|"[^"]*"|'[^']*'|[{}]|true|false|undefined)/g;

  return source.split(tokenPattern).map((token, index) => {
    if (!token) return null;

    let className = "";
    if (token.startsWith("//")) {
      className = "source-token-comment";
    } else if (token.startsWith("<")) {
      className = "source-token-tag";
    } else if (/^[A-Za-z][\w-]*$/.test(token) && source.includes(`${token}=`)) {
      className = "source-token-prop";
    } else if (token.startsWith("\"") || token.startsWith("'")) {
      className = "source-token-string";
    } else if (token === "{" || token === "}") {
      className = "source-token-brace";
    } else if (token === "true" || token === "false" || token === "undefined") {
      className = "source-token-literal";
    }

    return className ? (
      <span className={className} key={`${token}-${index}`}>{token}</span>
    ) : token;
  });
}

function ScenarioCanvasFooter({
  alertDialogScenario,
  contextMenuScenario,
  dialogScenario,
  dropdownMenuScenario,
  menuScenario,
  popoverScenario,
  selectScenario,
  scenarioId,
}: {
  alertDialogScenario: ReturnType<typeof useAlertDialogScenario>;
  contextMenuScenario: ReturnType<typeof useContextMenuScenario>;
  dialogScenario: ReturnType<typeof useDialogScenario>;
  dropdownMenuScenario: ReturnType<typeof useDropdownMenuScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  popoverScenario: ReturnType<typeof usePopoverScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
}) {
  if (scenarioId === "alert-dialog") {
    const state = alertDialogScenario.state;
    const openState = state.open ? "Open" : "Closed";
    const mode = state.controlled ? "Controlled" : "Uncontrolled";

    return (
      <div className="panel-footer">
        {`${openState} | ${mode} | Trigger ${state.triggerComposition} | Action ${state.actionComposition}`}
      </div>
    );
  }

  if (scenarioId === "popover") {
    const state = popoverScenario.state;
    const openState = state.open ? "Open" : "Closed";
    const mode = state.controlled ? "Controlled" : "Uncontrolled";

    return (
      <div className="panel-footer">
        {`${openState} | ${mode} | ${state.side} ${state.align} | Trigger ${state.triggerComposition}`}
      </div>
    );
  }

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

  if (scenarioId === "context-menu") {
    const state = contextMenuScenario.state;
    const openState = state.open ? "Open" : "Closed";
    const mode = state.controlled ? "Controlled" : "Uncontrolled";

    return (
      <div className="panel-footer">
        {`${openState} | ${mode} | Trigger ${state.triggerComposition} | ${state.side} ${state.align}`}
      </div>
    );
  }

  if (scenarioId === "dropdown-menu") {
    const state = dropdownMenuScenario.state;
    const openState = state.open ? "Open" : "Closed";
    const mode = state.controlled ? "Controlled" : "Uncontrolled";

    return (
      <div className="panel-footer">
        {`${openState} | ${mode} | Trigger ${state.triggerComposition} | ${state.side} ${state.align}`}
      </div>
    );
  }

  return null;
}

function getScenarioSource({
  alertDialogScenario,
  contextMenuScenario,
  dialogScenario,
  dropdownMenuScenario,
  menuScenario,
  popoverScenario,
  selectScenario,
  scenarioId,
}: {
  alertDialogScenario: ReturnType<typeof useAlertDialogScenario>;
  contextMenuScenario: ReturnType<typeof useContextMenuScenario>;
  dialogScenario: ReturnType<typeof useDialogScenario>;
  dropdownMenuScenario: ReturnType<typeof useDropdownMenuScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  popoverScenario: ReturnType<typeof usePopoverScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
}) {
  if (scenarioId === "alert-dialog") return getAlertDialogSource(alertDialogScenario.state);
  if (scenarioId === "popover") return getPopoverSource(popoverScenario.state);
  if (scenarioId === "dialog") return getDialogSource(dialogScenario.state);
  if (scenarioId === "select") return getSelectSource(selectScenario.state);
  if (scenarioId === "menu") return getMenuSource(menuScenario.state);
  if (scenarioId === "context-menu") return getContextMenuSource(contextMenuScenario.state);
  if (scenarioId === "dropdown-menu") return getDropdownMenuSource(dropdownMenuScenario.state);

  return "// No source example for this scenario yet.";
}

function getDialogSource(state: ReturnType<typeof useDialogScenario>["state"]) {
  const rootProps = state.controlled
    ? [
        "open={open}",
        "onOpenChange={setOpen}",
      ]
    : [
        "defaultOpen={false}",
        "onOpenChange={handleOpenChange}",
      ];
  const trigger = getDialogTriggerSource(state);
  const title = state.useAriaLabel
    ? `ariaLabel="Project settings"`
    : `<Dialog.Title as="${state.titleHeadingLevel}">Project settings</Dialog.Title>`;
  const saveClose = getDialogCloseSource(state.closeComposition, state.blockSaveClose);

  return `<Dialog.Root
  ${rootProps.join("\n  ")}
  disabled={${state.disabled}}
  keepMounted={${state.keepMounted}}
  closeOnEscape={${state.closeOnEscape}}
  closeOnBackdropClick={${state.closeOnBackdropClick}}
>
  ${trigger}
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content
      ${state.useAriaLabel ? title : ""}
      role="${state.contentRole}"
    >
      ${state.useAriaLabel ? "" : title}
      <Dialog.Description>
        Change a setting, tab through the controls, press Escape, or close the dialog.
      </Dialog.Description>
      <Field.Root id="dialog-name-field">
        <Field.Label>Name</Field.Label>
        <Input.Root defaultValue="Atom Playground" />
      </Field.Root>
      <Field.Root id="dialog-mode-field">
        <Field.Label>Mode</Field.Label>
        <Select.Root defaultValue="manual">
          <Select.Trigger>
            <Select.Value />
            <Select.Icon>▾</Select.Icon>
          </Select.Trigger>
          <Select.Content ariaLabel="Mode">
            <Select.Viewport>
              <Select.Item value="manual">
                <Select.ItemText>Manual</Select.ItemText>
              </Select.Item>
              <Select.Item value="auto">
                <Select.ItemText>Automatic</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Root>
      </Field.Root>
      <Dialog.Close>Cancel</Dialog.Close>
      ${saveClose}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>`;
}

function getDialogTriggerSource(state: ReturnType<typeof useDialogScenario>["state"]) {
  const triggerProps = [
    state.overrideSlots ? `data-slot="playground-dialog-trigger"` : "",
    state.blockTriggerEvent ? "onClick={handleBlockedTriggerClick}" : "onClick={handleTriggerClick}",
    state.blockTriggerEvent ? "onKeyDown={handleBlockedTriggerKeyDown}" : "onKeyDown={handleTriggerKeyDown}",
  ].filter(Boolean);

  if (state.triggerComposition === "asChild") {
    return `<Dialog.Trigger
    asChild
    ${triggerProps.join("\n    ")}
  >
    <span>Open dialog</span>
  </Dialog.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<Dialog.Trigger
    render={renderTrigger}
    ${triggerProps.join("\n    ")}
  >
    Open dialog
  </Dialog.Trigger>`;
  }

  return `<Dialog.Trigger
    ${triggerProps.join("\n    ")}
  >
    Open dialog
  </Dialog.Trigger>`;
}

function getDialogCloseSource(
  composition: ReturnType<typeof useDialogScenario>["state"]["closeComposition"],
  blockSaveClose: boolean,
) {
  const closeProps = [
    blockSaveClose ? "onClick={handleBlockedSaveClose}" : "onClick={handleSaveClose}",
  ];

  if (composition === "asChild") {
    return `<Dialog.Close
        asChild
        ${closeProps.join("\n        ")}
      >
        <span>Save</span>
      </Dialog.Close>`;
  }

  if (composition === "render") {
    return `<Dialog.Close
        render={renderClose}
        ${closeProps.join("\n        ")}
      >
        Save
      </Dialog.Close>`;
  }

  return `<Dialog.Close
        ${closeProps.join("\n        ")}
      >
        Save
      </Dialog.Close>`;
}

function getSelectSource(state: ReturnType<typeof useSelectScenario>["state"]) {
  const rootValueProp = state.valueControlled
    ? `value={value}`
    : state.noValue
      ? ""
      : `defaultValue="pro"`;
  const rootOpenProp = state.openControlled ? `open={open}` : `defaultOpen={false}`;
  const listboxName = state.useListboxAlias ? "Select.Listbox" : "Select.Content";
  const listbox = `<${listboxName}
    ariaLabel={${state.useAriaLabel ? `"Plans"` : "undefined"}}
    disablePortal={${state.disablePortal}}
  >
    ${state.showArrow ? "<Select.Arrow />\n    " : ""}${state.showScrollButtons ? "<Select.ScrollUpButton>Up</Select.ScrollUpButton>\n    " : ""}<Select.Viewport>
      <Select.Group>
        <Select.Label>Plans</Select.Label>
        <Select.Separator />
        <Select.Item value="starter" label="Starter">
          <Select.ItemText>Starter</Select.ItemText>
          <Select.ItemIndicator${state.forceMountIndicator ? " forceMount" : ""}>✓</Select.ItemIndicator>
        </Select.Item>
        <Select.Item value="pro" label="Pro">
          <Select.ItemText>Pro</Select.ItemText>
          <Select.ItemIndicator${state.forceMountIndicator ? " forceMount" : ""}>✓</Select.ItemIndicator>
        </Select.Item>
        <Select.Item value="team" label="Team" disabled>
          <Select.ItemText>Team</Select.ItemText>
          <Select.ItemIndicator${state.forceMountIndicator ? " forceMount" : ""}>✓</Select.ItemIndicator>
        </Select.Item>
        <Select.Item value="enterprise" label="Enterprise">
          <Select.ItemText>Enterprise</Select.ItemText>
          <Select.ItemIndicator${state.forceMountIndicator ? " forceMount" : ""}>✓</Select.ItemIndicator>
        </Select.Item>
      </Select.Group>
    </Select.Viewport>
    ${state.showScrollButtons ? "<Select.ScrollDownButton>Down</Select.ScrollDownButton>" : ""}
  </${listboxName}>`;
  const trigger = state.triggerComposition === "default"
    ? `<Select.Trigger${state.triggerAriaLabel ? ` ariaLabel="Choose plan"` : ""}>
      <Select.Value${state.customValueChildren ? `>Custom plan text</Select.Value` : ` placeholder="Choose a plan" />`}
      <Select.Icon>▾</Select.Icon>
    </Select.Trigger>`
    : `<Select.Trigger ${state.triggerComposition}${state.triggerAriaLabel ? ` ariaLabel="Choose plan"` : ""}>
      <button type="button">
        <Select.Value${state.customValueChildren ? `>Custom plan text</Select.Value` : ` placeholder="Choose a plan" />`}
        <Select.Icon>▾</Select.Icon>
      </button>
    </Select.Trigger>`;

  return `${state.fieldWrapped ? `<Field.Root
  id="select-plan-field"
  disabled={${state.disabled || state.fieldDisabled}}
  required={${state.required || state.fieldRequired}}
>
  <Field.Label>Plan</Field.Label>
  <Field.Description>Choose one plan for the test form.</Field.Description>
  ` : ""}<Select.Root
  ${[rootValueProp, rootOpenProp, `disabled={${state.disabled}}`, `required={${state.required}}`, `name="plan"`, `form="select-test-form"`, `onOpenChange={handleOpenChange}`, `onValueChange={handleValueChange}`].filter(Boolean).join("\n  ")}
>
  ${trigger}
  ${state.usePortalWrapper ? `<Select.Portal>
    ${listbox.replace(/\n/g, "\n    ")}
  </Select.Portal>` : listbox}
</Select.Root>${state.fieldWrapped ? "\n</Field.Root>" : ""}`;
}

function getMenuSource(state: ReturnType<typeof useMenuScenario>["state"]) {
  const rootMode = state.controlled
    ? `open={open}`
    : `defaultOpen={${state.defaultOpen}}`;
  const submenu = state.showSubmenu
    ? `
    <Menu.Sub${state.controlledSubmenu ? ` open={subOpen} onOpenChange={setSubOpen}` : ""}>
      <Menu.SubTrigger value="more">
        <span>More actions</span>
        <span aria-hidden="true">›</span>
      </Menu.SubTrigger>
      <Menu.SubContent${state.subContentAriaLabel ? ` ariaLabel="More actions"` : ""} sideOffset={${state.subSideOffset}}>
        <Menu.Item value="archive" onSelect={handleArchive}>
          Archive
        </Menu.Item>${state.showNestedSubmenu ? `
        <Menu.Sub>
          <Menu.SubTrigger value="advanced">
            <span>Advanced</span>
            <span aria-hidden="true">›</span>
          </Menu.SubTrigger>
          <Menu.SubContent>
            <Menu.Item value="export" onSelect={handleExport}>
              Export
            </Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>` : ""}
      </Menu.SubContent>
    </Menu.Sub>
    <Menu.Sub>
      <Menu.SubTrigger value="share" disabled={${state.disableSecondSubmenu}}>
        <span>Share actions</span>
        <span aria-hidden="true">›</span>
      </Menu.SubTrigger>
      <Menu.SubContent sideOffset={${state.subSideOffset}}>
        <Menu.Item value="copy-link" onSelect={handleCopyLink}>
          Copy link
        </Menu.Item>
      </Menu.SubContent>
    </Menu.Sub>` : "";

  return `<Menu.Root
  ${rootMode}
  modal={${state.modal}}
  closeOnSelect={${state.closeOnSelect}}
  closeOnEscape={${state.closeOnEscape}}
  loop={${state.loop}}
  onOpenChange={setOpen}
>
  <Menu.Content
    ${state.useAnchorPoint ? "anchorPoint={anchorPoint}" : ""}
    ${state.contentAriaLabel ? `ariaLabel="Project actions"` : ""}
    side="${state.side}"
    align="${state.align}"
    sideOffset={${state.sideOffset}}
    loop={${state.contentLoopOff ? false : "undefined"}}
  >
    <Menu.Group>
      <Menu.Item value="new" onSelect={handleNew}>
        New project
      </Menu.Item>${state.showDisabledItem ? `
      <Menu.Item value="disabled" disabled>
        Disabled action
      </Menu.Item>` : ""}
    </Menu.Group>
    <Menu.Separator />
    <Menu.CheckboxItem
      value="grid"
      checked={${state.checkboxChecked}}
      closeOnSelect={${state.closeCheckboxOnSelect}}
      onCheckedChange={setCheckboxChecked}
    >
      <span>Show grid</span>
      <span aria-hidden="true" />
    </Menu.CheckboxItem>
    <Menu.Separator />
    <Menu.RadioGroup value="${state.radioValue}" onValueChange={setRadioValue}>
      <Menu.RadioItem value="compact" closeOnSelect={${state.closeRadioOnSelect}}>
        <span>Compact</span>
        <span aria-hidden="true" />
      </Menu.RadioItem>
      <Menu.RadioItem value="comfortable" closeOnSelect={${state.closeRadioOnSelect}}>
        <span>Comfortable</span>
        <span aria-hidden="true" />
      </Menu.RadioItem>
    </Menu.RadioGroup>
    <Menu.Separator />
    <Menu.RadioGroup value="${state.radioValueSecondary}" onValueChange={setDenseValue}>
      <Menu.RadioItem value="compact" closeOnSelect={${state.closeRadioOnSelect}}>
        <span>Dense compact</span>
        <span aria-hidden="true" />
      </Menu.RadioItem>
      <Menu.RadioItem value="comfortable" closeOnSelect={${state.closeRadioOnSelect}}>
        <span>Dense comfortable</span>
        <span aria-hidden="true" />
      </Menu.RadioItem>
    </Menu.RadioGroup>${submenu}
  </Menu.Content>
</Menu.Root>`;
}

function getDropdownMenuSource(state: ReturnType<typeof useDropdownMenuScenario>["state"]) {
  const rootMode = state.controlled
    ? `open={open}`
    : `defaultOpen={${state.defaultOpen}}`;
  const trigger = state.triggerComposition === "default"
    ? `<DropdownMenu.Trigger disabled={${state.triggerDisabled}}>
    Actions
  </DropdownMenu.Trigger>`
    : state.triggerComposition === "asChild"
      ? `<DropdownMenu.Trigger asChild disabled={${state.triggerDisabled}}>
    <button type="button">Actions</button>
  </DropdownMenu.Trigger>`
      : `<DropdownMenu.Trigger render="section" disabled={${state.triggerDisabled}}>
    Actions
  </DropdownMenu.Trigger>`;
  const submenu = state.showSubmenu
    ? `
    <DropdownMenu.Sub${state.controlledSubmenu ? ` open={subOpen} onOpenChange={setSubOpen}` : ""}>
      <DropdownMenu.SubTrigger value="more">
        <span>More actions</span>
        <span aria-hidden="true">›</span>
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent${state.subContentAriaLabel ? ` ariaLabel="More actions"` : ""} sideOffset={${state.subSideOffset}}>
        <DropdownMenu.Item value="archive" onSelect={handleArchive}>
          Archive
        </DropdownMenu.Item>${state.showNestedSubmenu ? `
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger value="advanced">
            <span>Advanced</span>
            <span aria-hidden="true">›</span>
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item value="export" onSelect={handleExport}>
              Export
            </DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>` : ""}
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger value="share" disabled={${state.disableSecondSubmenu}}>
        <span>Share actions</span>
        <span aria-hidden="true">›</span>
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent sideOffset={${state.subSideOffset}}>
        <DropdownMenu.Item value="copy-link" onSelect={handleCopyLink}>
          Copy link
        </DropdownMenu.Item>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>` : "";
  const item = getMenuItemSource("DropdownMenu", state.itemComposition);

  return `<DropdownMenu.Root
  ${rootMode}
  modal={${state.modal}}
  closeOnSelect={${state.closeOnSelect}}
  closeOnEscape={${state.closeOnEscape}}
  loop={${state.loop}}
  onOpenChange={setOpen}
>
  ${trigger}
  <DropdownMenu.Content
    ${state.contentAriaLabel ? `ariaLabel="Project actions"` : ""}
    side="${state.side}"
    align="${state.align}"
    sideOffset={${state.sideOffset}}
    loop={${state.contentLoopOff ? false : "undefined"}}
  >
    <DropdownMenu.Group>
${item}${state.showDisabledItem ? `
      <DropdownMenu.Item value="disabled" disabled>
        Disabled action
      </DropdownMenu.Item>` : ""}
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.CheckboxItem
      value="grid"
      checked={${state.checkboxChecked}}
      closeOnSelect={${state.closeCheckboxOnSelect}}
      onCheckedChange={setCheckboxChecked}
    >
      <span>Show grid</span>
      <span aria-hidden="true" />
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.Separator />
    <DropdownMenu.RadioGroup value="${state.radioValue}" onValueChange={setRadioValue}>
      <DropdownMenu.RadioItem value="compact" closeOnSelect={${state.closeRadioOnSelect}}>
        <span>Compact</span>
        <span aria-hidden="true" />
      </DropdownMenu.RadioItem>
      <DropdownMenu.RadioItem value="comfortable" closeOnSelect={${state.closeRadioOnSelect}}>
        <span>Comfortable</span>
        <span aria-hidden="true" />
      </DropdownMenu.RadioItem>
    </DropdownMenu.RadioGroup>
    <DropdownMenu.Separator />
    <DropdownMenu.RadioGroup value="${state.radioValueSecondary}" onValueChange={setDenseValue}>
      <DropdownMenu.RadioItem value="compact" closeOnSelect={${state.closeRadioOnSelect}}>
        <span>Dense compact</span>
        <span aria-hidden="true" />
      </DropdownMenu.RadioItem>
      <DropdownMenu.RadioItem value="comfortable" closeOnSelect={${state.closeRadioOnSelect}}>
        <span>Dense comfortable</span>
        <span aria-hidden="true" />
      </DropdownMenu.RadioItem>
    </DropdownMenu.RadioGroup>${submenu}
  </DropdownMenu.Content>
</DropdownMenu.Root>`;
}

function getContextMenuSource(state: ReturnType<typeof useContextMenuScenario>["state"]) {
  const rootMode = state.controlled
    ? `open={open}`
    : `defaultOpen={${state.defaultOpen}}`;
  const trigger = state.triggerComposition === "default"
    ? `<ContextMenu.Trigger disabled={${state.triggerDisabled}}>
    <div tabIndex={0}>
      Project canvas
    </div>
  </ContextMenu.Trigger>`
    : state.triggerComposition === "asChild"
      ? `<ContextMenu.Trigger asChild disabled={${state.triggerDisabled}}>
    <div tabIndex={0}>Project canvas</div>
  </ContextMenu.Trigger>`
      : `<ContextMenu.Trigger render="section" tabIndex={0} disabled={${state.triggerDisabled}}>
    Project canvas
  </ContextMenu.Trigger>`;
  const submenu = state.showSubmenu
    ? `
    <ContextMenu.Sub${state.controlledSubmenu ? ` open={subOpen} onOpenChange={setSubOpen}` : ""}>
      <ContextMenu.SubTrigger value="more">
        <span>More actions</span>
        <span aria-hidden="true">›</span>
      </ContextMenu.SubTrigger>
      <ContextMenu.SubContent${state.subContentAriaLabel ? ` ariaLabel="More actions"` : ""} sideOffset={${state.subSideOffset}}>
        <ContextMenu.Item value="archive" onSelect={handleArchive}>
          Archive
        </ContextMenu.Item>${state.showNestedSubmenu ? `
        <ContextMenu.Sub>
          <ContextMenu.SubTrigger value="advanced">
            <span>Advanced</span>
            <span aria-hidden="true">›</span>
          </ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item value="export" onSelect={handleExport}>
              Export
            </ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>` : ""}
      </ContextMenu.SubContent>
    </ContextMenu.Sub>
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger value="share" disabled={${state.disableSecondSubmenu}}>
        <span>Share actions</span>
        <span aria-hidden="true">›</span>
      </ContextMenu.SubTrigger>
      <ContextMenu.SubContent sideOffset={${state.subSideOffset}}>
        <ContextMenu.Item value="copy-link" onSelect={handleCopyLink}>
          Copy link
        </ContextMenu.Item>
      </ContextMenu.SubContent>
    </ContextMenu.Sub>` : "";
  const item = getMenuItemSource("ContextMenu", state.itemComposition);

  return `<ContextMenu.Root
  ${rootMode}
  modal={${state.modal}}
  closeOnSelect={${state.closeOnSelect}}
  closeOnEscape={${state.closeOnEscape}}
  loop={${state.loop}}
  onOpenChange={setOpen}
>
  ${trigger}
  <ContextMenu.Content
    ${state.contentAriaLabel ? `ariaLabel="Project actions"` : ""}
    side="${state.side}"
    align="${state.align}"
    sideOffset={${state.sideOffset}}
    loop={${state.contentLoopOff ? false : "undefined"}}
  >
    <ContextMenu.Group>
${item}${state.showDisabledItem ? `
      <ContextMenu.Item value="disabled" disabled>
        Disabled action
      </ContextMenu.Item>` : ""}
    </ContextMenu.Group>
    <ContextMenu.Separator />
    <ContextMenu.CheckboxItem
      value="grid"
      checked={${state.checkboxChecked}}
      closeOnSelect={${state.closeCheckboxOnSelect}}
      onCheckedChange={setCheckboxChecked}
    >
      <span>Show grid</span>
      <span aria-hidden="true" />
    </ContextMenu.CheckboxItem>
    <ContextMenu.Separator />
    <ContextMenu.RadioGroup value="${state.radioValue}" onValueChange={setRadioValue}>
      <ContextMenu.RadioItem value="compact" closeOnSelect={${state.closeRadioOnSelect}}>
        <span>Compact</span>
        <span aria-hidden="true" />
      </ContextMenu.RadioItem>
      <ContextMenu.RadioItem value="comfortable" closeOnSelect={${state.closeRadioOnSelect}}>
        <span>Comfortable</span>
        <span aria-hidden="true" />
      </ContextMenu.RadioItem>
    </ContextMenu.RadioGroup>
    <ContextMenu.Separator />
    <ContextMenu.RadioGroup value="${state.radioValueSecondary}" onValueChange={setDenseValue}>
      <ContextMenu.RadioItem value="compact" closeOnSelect={${state.closeRadioOnSelect}}>
        <span>Dense compact</span>
        <span aria-hidden="true" />
      </ContextMenu.RadioItem>
      <ContextMenu.RadioItem value="comfortable" closeOnSelect={${state.closeRadioOnSelect}}>
        <span>Dense comfortable</span>
        <span aria-hidden="true" />
      </ContextMenu.RadioItem>
    </ContextMenu.RadioGroup>${submenu}
  </ContextMenu.Content>
</ContextMenu.Root>`;
}

function getMenuItemSource(namespace: "ContextMenu" | "DropdownMenu", mode: "default" | "asChild" | "render") {
  if (mode === "asChild") {
    return `      <${namespace}.Item value="new" onSelect={handleNew} asChild>
        <span>New project</span>
      </${namespace}.Item>`;
  }

  if (mode === "render") {
    return `      <${namespace}.Item value="new" onSelect={handleNew} render="section">
        New project
      </${namespace}.Item>`;
  }

  return `      <${namespace}.Item value="new" onSelect={handleNew}>
        New project
      </${namespace}.Item>`;
}

function ScenarioAnatomy({
  alertDialogAnatomyOpenGroups,
  alertDialogScenario,
  contextMenuAnatomyOpenGroups,
  contextMenuScenario,
  dialogAnatomyOpenGroups,
  dialogScenario,
  dropdownMenuAnatomyOpenGroups,
  dropdownMenuScenario,
  menuAnatomyOpenGroups,
  menuScenario,
  popoverAnatomyOpenGroups,
  popoverScenario,
  selectAnatomyOpenGroups,
  selectScenario,
  scenarioId,
  onAlertDialogAnatomyOpenGroupsChange,
  onContextMenuAnatomyOpenGroupsChange,
  onDialogAnatomyOpenGroupsChange,
  onDropdownMenuAnatomyOpenGroupsChange,
  onMenuAnatomyOpenGroupsChange,
  onPopoverAnatomyOpenGroupsChange,
  onSelectAnatomyOpenGroupsChange,
}: {
  alertDialogAnatomyOpenGroups: Record<string, boolean>;
  alertDialogScenario: ReturnType<typeof useAlertDialogScenario>;
  contextMenuAnatomyOpenGroups: Record<string, boolean>;
  contextMenuScenario: ReturnType<typeof useContextMenuScenario>;
  dialogAnatomyOpenGroups: Record<string, boolean>;
  dialogScenario: ReturnType<typeof useDialogScenario>;
  dropdownMenuAnatomyOpenGroups: Record<string, boolean>;
  dropdownMenuScenario: ReturnType<typeof useDropdownMenuScenario>;
  menuAnatomyOpenGroups: Record<string, boolean>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  popoverAnatomyOpenGroups: Record<string, boolean>;
  popoverScenario: ReturnType<typeof usePopoverScenario>;
  selectAnatomyOpenGroups: Record<string, boolean>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
  onAlertDialogAnatomyOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
  onContextMenuAnatomyOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
  onDialogAnatomyOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
  onDropdownMenuAnatomyOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
  onMenuAnatomyOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
  onPopoverAnatomyOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
  onSelectAnatomyOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  if (scenarioId === "alert-dialog") {
    return (
      <AlertDialogScenarioAnatomy
        openGroups={alertDialogAnatomyOpenGroups}
        state={alertDialogScenario.state}
        onOpenGroupsChange={onAlertDialogAnatomyOpenGroupsChange}
      />
    );
  }

  if (scenarioId === "popover") {
    return (
      <PopoverScenarioAnatomy
        openGroups={popoverAnatomyOpenGroups}
        state={popoverScenario.state}
        onOpenGroupsChange={onPopoverAnatomyOpenGroupsChange}
      />
    );
  }

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

  if (scenarioId === "context-menu") {
    return (
      <ContextMenuScenarioAnatomy
        openGroups={contextMenuAnatomyOpenGroups}
        state={contextMenuScenario.state}
        onOpenGroupsChange={onContextMenuAnatomyOpenGroupsChange}
      />
    );
  }

  if (scenarioId === "dropdown-menu") {
    return (
      <DropdownMenuScenarioAnatomy
        openGroups={dropdownMenuAnatomyOpenGroups}
        state={dropdownMenuScenario.state}
        onOpenGroupsChange={onDropdownMenuAnatomyOpenGroupsChange}
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
  alertDialogScenario,
  contextMenuScenario,
  dialogScenario,
  dropdownMenuScenario,
  menuScenario,
  popoverScenario,
  selectScenario,
  scenarioId,
}: {
  alertDialogScenario: ReturnType<typeof useAlertDialogScenario>;
  contextMenuScenario: ReturnType<typeof useContextMenuScenario>;
  dialogScenario: ReturnType<typeof useDialogScenario>;
  dropdownMenuScenario: ReturnType<typeof useDropdownMenuScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  popoverScenario: ReturnType<typeof usePopoverScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
}) {
  if (scenarioId === "alert-dialog") {
    return (
      <AlertDialogScenarioLog
        state={alertDialogScenario.state}
      />
    );
  }

  if (scenarioId === "popover") {
    return (
      <PopoverScenarioLog
        state={popoverScenario.state}
      />
    );
  }

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

  if (scenarioId === "context-menu") {
    return (
      <ContextMenuScenarioLog
        state={contextMenuScenario.state}
      />
    );
  }

  if (scenarioId === "dropdown-menu") {
    return (
      <DropdownMenuScenarioLog
        state={dropdownMenuScenario.state}
      />
    );
  }

  return null;
}

function ScenarioLogFooter({
  alertDialogScenario,
  contextMenuScenario,
  dialogScenario,
  dropdownMenuScenario,
  menuScenario,
  popoverScenario,
  selectScenario,
  scenarioId,
}: {
  alertDialogScenario: ReturnType<typeof useAlertDialogScenario>;
  contextMenuScenario: ReturnType<typeof useContextMenuScenario>;
  dialogScenario: ReturnType<typeof useDialogScenario>;
  dropdownMenuScenario: ReturnType<typeof useDropdownMenuScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  popoverScenario: ReturnType<typeof usePopoverScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
}) {
  if (
    scenarioId !== "alert-dialog" &&
    scenarioId !== "popover" &&
    scenarioId !== "dialog" &&
    scenarioId !== "select" &&
    scenarioId !== "menu" &&
    scenarioId !== "context-menu" &&
    scenarioId !== "dropdown-menu"
  ) return null;

  const eventCount = scenarioId === "dialog"
    ? dialogScenario.state.log.length
    : scenarioId === "alert-dialog"
      ? alertDialogScenario.state.log.length
      : scenarioId === "popover"
        ? popoverScenario.state.log.length
        : scenarioId === "select"
          ? selectScenario.state.log.length
          : scenarioId === "menu"
            ? menuScenario.state.log.length
            : scenarioId === "context-menu"
              ? contextMenuScenario.state.log.length
              : dropdownMenuScenario.state.log.length;
  const eventLabel = eventCount === 1 ? "Event" : "Events";

  return <>{eventCount === 0 ? "No Events" : `${eventCount} ${eventLabel}`}</>;
}

function ScenarioLogAction({
  alertDialogScenario,
  contextMenuScenario,
  dialogScenario,
  dropdownMenuScenario,
  menuScenario,
  popoverScenario,
  selectScenario,
  scenarioId,
}: {
  alertDialogScenario: ReturnType<typeof useAlertDialogScenario>;
  contextMenuScenario: ReturnType<typeof useContextMenuScenario>;
  dialogScenario: ReturnType<typeof useDialogScenario>;
  dropdownMenuScenario: ReturnType<typeof useDropdownMenuScenario>;
  menuScenario: ReturnType<typeof useMenuScenario>;
  popoverScenario: ReturnType<typeof usePopoverScenario>;
  selectScenario: ReturnType<typeof useSelectScenario>;
  scenarioId: string;
}) {
  if (
    scenarioId !== "alert-dialog" &&
    scenarioId !== "popover" &&
    scenarioId !== "dialog" &&
    scenarioId !== "select" &&
    scenarioId !== "menu" &&
    scenarioId !== "context-menu" &&
    scenarioId !== "dropdown-menu"
  ) return null;

  return (
    <Button.Root
      className="header-action"
      onPress={
        scenarioId === "dialog"
          ? dialogScenario.actions.clearLog
          : scenarioId === "alert-dialog"
            ? alertDialogScenario.actions.clearLog
            : scenarioId === "popover"
              ? popoverScenario.actions.clearLog
              : scenarioId === "select"
                ? selectScenario.actions.clearLog
                : scenarioId === "menu"
                  ? menuScenario.actions.clearLog
                  : scenarioId === "context-menu"
                    ? contextMenuScenario.actions.clearLog
                    : dropdownMenuScenario.actions.clearLog
      }
    >
      Clear
    </Button.Root>
  );
}
