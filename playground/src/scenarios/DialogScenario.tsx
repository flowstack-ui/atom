import { Dialog } from "@flowstack-ui/atom/dialog";
import { useState } from "react";
import type { ReactNode } from "react";
import type {
  DialogScenarioActions,
  DialogScenarioState,
} from "./useDialogScenario";

export function DialogScenarioCanvas({
  state,
  onOpenChange,
  onControlledOpen,
  onControlledClose,
}: {
  state: DialogScenarioState;
  onOpenChange: (open: boolean, reason?: string) => void;
  onControlledOpen: () => void;
  onControlledClose: () => void;
}) {
  const rootProps = state.controlled
    ? {
        open: state.open,
        onOpenChange,
      }
    : {
        defaultOpen: false,
        onOpenChange,
      };

  return (
    <div className="dialog-stage">
      <Dialog.Root
        {...rootProps}
        disabled={state.disabled}
        keepMounted={state.keepMounted}
        closeOnEscape={state.closeOnEscape}
        closeOnBackdropClick={state.closeOnBackdropClick}
      >
        <Dialog.Trigger className="atom-button">Open dialog</Dialog.Trigger>
        {state.controlled ? (
          <button
            className="atom-button secondary"
            type="button"
            onClick={onControlledOpen}
          >
            Open controlled
          </button>
        ) : null}
        <Dialog.Portal>
          <Dialog.Overlay className="atom-dialog-overlay" data-playground-inspect="" />
          <Dialog.Content
            ariaLabel={state.useAriaLabel ? "Project settings" : undefined}
            className="atom-dialog-content"
            data-playground-inspect=""
          >
            {state.useAriaLabel ? null : <Dialog.Title>Project settings</Dialog.Title>}
            <Dialog.Description>
              Change a setting, tab through the controls, press Escape, or close the dialog.
            </Dialog.Description>
            <div className="dialog-form-row">
              <label htmlFor="dialog-name">Name</label>
              <input id="dialog-name" defaultValue="Atom Playground" />
            </div>
            <div className="dialog-form-row">
              <label htmlFor="dialog-mode">Mode</label>
              <select id="dialog-mode" defaultValue="manual">
                <option value="manual">Manual</option>
                <option value="auto">Automatic</option>
              </select>
            </div>
            <div className="dialog-actions">
              {state.controlled ? (
                <button
                  className="atom-button secondary"
                  type="button"
                  onClick={onControlledClose}
                >
                  Close controlled
                </button>
              ) : null}
              <Dialog.Close className="atom-button secondary">Cancel</Dialog.Close>
              <Dialog.Close className="atom-button">Save</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export function DialogScenarioAnatomy({ state }: { state: DialogScenarioState }) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Root: true,
    Trigger: true,
  });
  const toggleGroup = (title: string) => {
    setOpenGroups((currentGroups) => ({
      ...currentGroups,
      [title]: !currentGroups[title],
    }));
  };

  return (
    <div className="scenario-controls">
      <div className="parts-panel">
        <PartGroup
          open={openGroups.Root}
          summary={state.controlled ? "controlled" : "uncontrolled"}
          title="Root"
          onToggle={toggleGroup}
        >
          <PartRow label="Mode" value={state.controlled ? "controlled" : "uncontrolled"} />
          <PartRow label="Disabled" value={state.disabled ? "yes" : "no"} />
          <PartRow label="Keep mounted" value={state.keepMounted ? "yes" : "no"} />
          <PartRow label="Escape closes" value={state.closeOnEscape ? "yes" : "no"} />
          <PartRow
            label="Backdrop closes"
            value={state.closeOnBackdropClick ? "yes" : "no"}
          />
        </PartGroup>
        <PartGroup
          open={openGroups.Trigger}
          summary={state.parts.triggerState}
          title="Trigger"
          onToggle={toggleGroup}
        >
          <PartRow label="Exists" value={state.parts.triggerExists} />
          <PartRow label="data-state" value={state.parts.triggerState} />
          <PartRow label="aria-controls" value={state.parts.triggerControls} />
          <PartRow label="Controls match" value={state.parts.controlsMatch} />
          <PartRow label="Disabled" value={state.parts.triggerDisabled} />
        </PartGroup>
        <PartGroup
          open={openGroups.Portal}
          summary={state.parts.portalParent}
          title="Portal"
          onToggle={toggleGroup}
        >
          <PartRow label="Parent" value={state.parts.portalParent} />
          <PartRow label="Inside canvas" value={state.parts.inCanvas} />
          <PartRow label="Content exists" value={state.parts.contentExists} />
        </PartGroup>
        <PartGroup
          open={openGroups.Overlay}
          summary={state.parts.overlayExists === "yes" ? state.parts.overlayState : "none"}
          title="Overlay"
          onToggle={toggleGroup}
        >
          <PartRow label="Exists" value={state.parts.overlayExists} />
          <PartRow label="data-state" value={state.parts.overlayState} />
        </PartGroup>
        <PartGroup
          open={openGroups.Content}
          summary={state.parts.contentExists === "yes" ? state.parts.contentState : "none"}
          title="Content"
          onToggle={toggleGroup}
        >
          <PartRow label="Exists" value={state.parts.contentExists} />
          <PartRow label="id" value={state.parts.contentId} />
          <PartRow label="role" value={state.parts.contentRole} />
          <PartRow label="data-state" value={state.parts.contentState} />
          <PartRow label="Hidden" value={state.parts.contentHidden} />
          <PartRow label="aria-modal" value={state.parts.contentAriaModal} />
          <PartRow label="aria-label" value={state.parts.contentAriaLabel} />
          <PartRow label="aria-labelledby" value={state.parts.contentLabelledBy} />
          <PartRow label="aria-describedby" value={state.parts.contentDescribedBy} />
        </PartGroup>
        <PartGroup
          open={openGroups.Title}
          summary={state.parts.titleExists === "yes" ? state.parts.titleId : "none"}
          title="Title"
          onToggle={toggleGroup}
        >
          <PartRow label="Exists" value={state.parts.titleExists} />
          <PartRow label="id" value={state.parts.titleId} />
          <PartRow label="Matches label" value={state.parts.titleMatches} />
        </PartGroup>
        <PartGroup
          open={openGroups.Description}
          summary={
            state.parts.descriptionExists === "yes"
              ? state.parts.descriptionId
              : "none"
          }
          title="Description"
          onToggle={toggleGroup}
        >
          <PartRow label="Exists" value={state.parts.descriptionExists} />
          <PartRow label="id" value={state.parts.descriptionId} />
          <PartRow label="Matches description" value={state.parts.descriptionMatches} />
        </PartGroup>
      </div>
    </div>
  );
}

export function DialogScenarioLog({
  state,
  actions,
}: {
  state: DialogScenarioState;
  actions: DialogScenarioActions;
}) {
  return (
    <div className="scenario-log">
      <div className="event-log">
        <div className="event-log-header">
          <button type="button" onClick={actions.clearLog}>Clear</button>
        </div>
        <ol>
          {state.log.map((entry) => (
            <li key={entry.id}>{entry.text}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function DialogScenarioToolbar({
  state,
  actions,
}: {
  state: DialogScenarioState;
  actions: DialogScenarioActions;
}) {
  return (
    <div className="canvas-toolbar" aria-label="Dialog controls">
      <ToggleControl
        checked={state.controlled}
        label="Controlled"
        onChange={actions.setControlled}
      />
      <ToggleControl
        checked={state.disabled}
        label="Disabled"
        onChange={actions.setDisabled}
      />
      <ToggleControl
        checked={state.keepMounted}
        label="Keep mounted"
        onChange={actions.setKeepMounted}
      />
      <ToggleControl
        checked={state.closeOnEscape}
        label="Escape closes"
        onChange={actions.setCloseOnEscape}
      />
      <ToggleControl
        checked={state.closeOnBackdropClick}
        label="Backdrop closes"
        onChange={actions.setCloseOnBackdropClick}
      />
      <ToggleControl
        checked={state.useAriaLabel}
        label="Use ariaLabel"
        onChange={actions.setUseAriaLabel}
      />
    </div>
  );
}

function PartGroup({
  children,
  open = false,
  summary,
  title,
  onToggle,
}: {
  children: ReactNode;
  open?: boolean;
  summary: string;
  title: string;
  onToggle: (title: string) => void;
}) {
  return (
    <section className="part-group" aria-label={title}>
      <button
        className="part-group-trigger"
        type="button"
        aria-expanded={open}
        onClick={() => onToggle(title)}
      >
        <span aria-hidden="true">{open ? "▾" : "▸"}</span>
        <span>{title}</span>
        {open ? null : <span>{summary}</span>}
      </button>
      {open ? <dl className="parts-grid">{children}</dl> : null}
    </section>
  );
}

function PartRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ToggleControl({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
