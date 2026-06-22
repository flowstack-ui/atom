import { useState } from "react";
import "./styles.css";
import packageInfo from "../../package.json";
import { useElementInspector } from "./inspector";
import {
  DialogScenarioCanvas,
  DialogScenarioControls,
} from "./scenarios/DialogScenario";
import { useDialogScenario } from "./scenarios/useDialogScenario";

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

function getScenario(id: string) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}

export function App() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState("dialog");
  const activeScenario = getScenario(activeScenarioId);
  const inspector = useElementInspector();
  const dialogScenario = useDialogScenario();

  return (
    <div className="app-shell">
      <header className="menu-bar">
        <div className="brand">Atom Playground</div>
        <nav className="menu-list" aria-label="Playground categories">
          {categories.map((category) => (
            <div className="menu-group" key={category}>
              <button
                className="menu-button"
                type="button"
                aria-haspopup="menu"
                aria-expanded={activeMenu === category}
                onClick={() => setActiveMenu(activeMenu === category ? null : category)}
              >
                {category}
              </button>
              {activeMenu === category ? (
                <div className="menu-popover" role="menu">
                  {scenarios
                    .filter((scenario) => scenario.category === category)
                    .map((scenario) => (
                      <button
                        className="menu-item"
                        type="button"
                        role="menuitem"
                        key={scenario.id}
                        data-active={scenario.id === activeScenario.id ? "" : undefined}
                        onClick={() => {
                          setActiveScenarioId(scenario.id);
                          setActiveMenu(null);
                        }}
                      >
                        {scenario.label}
                      </button>
                    ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <div className="version">
          {packageInfo.name} {packageInfo.version}
        </div>
      </header>

      <main className="workspace">
        <section className="scenario-header" aria-labelledby="scenario-title">
          <p className="category-label">{activeScenario.category}</p>
          <h1 id="scenario-title">{activeScenario.label}</h1>
        </section>

        <section className="scenario-grid">
          <article className="scenario-card">
            <div className="card-header">
              <h2>Try</h2>
            </div>
            <ul className="check-list">
              {activeScenario.checks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </article>

          <article className="scenario-card canvas-card">
            <div className="card-header">
              <h2>Canvas</h2>
            </div>
            <div className="canvas" ref={inspector.rootRef}>
              <ScenarioCanvas
                dialogScenario={dialogScenario}
                scenarioId={activeScenario.id}
                label={activeScenario.label}
              />
            </div>
          </article>

          <article className="scenario-card controls-card">
            <div className="card-header">
              <h2>Controls</h2>
            </div>
            <ScenarioControls
              dialogScenario={dialogScenario}
              scenarioId={activeScenario.id}
            />
          </article>

          <article className="scenario-card inspector-card">
            <div className="card-header">
              <h2>Inspector</h2>
            </div>
            <dl className="inspector-list">
              {inspector.rows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd title={row.value}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </section>
      </main>
    </div>
  );
}

function ScenarioCanvas({
  dialogScenario,
  scenarioId,
  label,
}: {
  dialogScenario: ReturnType<typeof useDialogScenario>;
  scenarioId: string;
  label: string;
}) {
  if (scenarioId === "dialog") {
    return (
      <DialogScenarioCanvas
        state={dialogScenario.state}
        onOpenChange={dialogScenario.handleOpenChange}
        onControlledClose={() => dialogScenario.actions.setControlledOpen(false)}
      />
    );
  }

  return (
    <p className="placeholder-card">
      {label} scenario goes here.
    </p>
  );
}

function ScenarioControls({
  dialogScenario,
  scenarioId,
}: {
  dialogScenario: ReturnType<typeof useDialogScenario>;
  scenarioId: string;
}) {
  if (scenarioId === "dialog") {
    return (
      <DialogScenarioControls
        state={dialogScenario.state}
        actions={dialogScenario.actions}
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
