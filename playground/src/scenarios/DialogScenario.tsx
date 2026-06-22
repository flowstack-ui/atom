import { Dialog } from "@flowstack-ui/atom/dialog";
import type {
  DialogScenarioActions,
  DialogScenarioState,
} from "./useDialogScenario";

export function DialogScenarioCanvas({
  state,
  onOpenChange,
  onControlledClose,
}: {
  state: DialogScenarioState;
  onOpenChange: (open: boolean, reason?: string) => void;
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
            onClick={() => onOpenChange(true)}
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

export function DialogScenarioControls({
  state,
  actions,
}: {
  state: DialogScenarioState;
  actions: DialogScenarioActions;
}) {
  return (
    <div className="scenario-controls">
      <div className="control-strip" aria-label="Dialog controls">
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
        {state.controlled ? (
          <button
            type="button"
            onClick={() => actions.setControlledOpen(!state.open)}
          >
            {state.open ? "Close" : "Open"}
          </button>
        ) : null}
      </div>

      <dl className="state-grid" aria-label="Dialog state">
        <div>
          <dt>Open</dt>
          <dd>{String(state.open)}</dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>{state.controlled ? "controlled" : "uncontrolled"}</dd>
        </div>
        <div>
          <dt>Last reason</dt>
          <dd>{state.lastReason}</dd>
        </div>
      </dl>

      <div className="event-log">
        <div className="event-log-header">
          <h3>Log</h3>
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
