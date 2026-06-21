import { useState } from "react";
import { Dialog } from "@flowstack-ui/atom/dialog";

export function DialogScenario() {
  const [controlled, setControlled] = useState(false);
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [keepMounted, setKeepMounted] = useState(false);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);
  const [lastChange, setLastChange] = useState("Ready");

  const rootProps = controlled
    ? {
        open,
        onOpenChange: (nextOpen: boolean, reason?: string) => {
          setOpen(nextOpen);
          setLastChange(reason ? `${nextOpen ? "Opened" : "Closed"} by ${reason}` : "Opened");
        },
      }
    : {
        defaultOpen: false,
        onOpenChange: (nextOpen: boolean, reason?: string) => {
          setOpen(nextOpen);
          setLastChange(reason ? `${nextOpen ? "Opened" : "Closed"} by ${reason}` : "Opened");
        },
      };

  return (
    <>
      <div className="control-strip" aria-label="Dialog controls">
        <label>
          <input
            type="checkbox"
            checked={controlled}
            onChange={(event) => setControlled(event.target.checked)}
          />
          Controlled
        </label>
        <label>
          <input
            type="checkbox"
            checked={disabled}
            onChange={(event) => setDisabled(event.target.checked)}
          />
          Disabled
        </label>
        <label>
          <input
            type="checkbox"
            checked={keepMounted}
            onChange={(event) => setKeepMounted(event.target.checked)}
          />
          Keep mounted
        </label>
        <label>
          <input
            type="checkbox"
            checked={closeOnEscape}
            onChange={(event) => setCloseOnEscape(event.target.checked)}
          />
          Escape closes
        </label>
        <label>
          <input
            type="checkbox"
            checked={closeOnBackdropClick}
            onChange={(event) => setCloseOnBackdropClick(event.target.checked)}
          />
          Backdrop closes
        </label>
        {controlled ? (
          <button type="button" onClick={() => setOpen((currentOpen) => !currentOpen)}>
            {open ? "Close" : "Open"}
          </button>
        ) : null}
      </div>

      <div className="dialog-stage">
        <Dialog.Root
          {...rootProps}
          disabled={disabled}
          keepMounted={keepMounted}
          closeOnEscape={closeOnEscape}
          closeOnBackdropClick={closeOnBackdropClick}
        >
          <Dialog.Trigger className="atom-button">Open dialog</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="atom-dialog-overlay" data-playground-inspect="" />
            <Dialog.Content className="atom-dialog-content" data-playground-inspect="">
              <Dialog.Title>Project settings</Dialog.Title>
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
                <Dialog.Close className="atom-button secondary">Cancel</Dialog.Close>
                <Dialog.Close className="atom-button">Save</Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <div className="scenario-note" aria-live="polite">
          <span>Open:</span> {String(open)}
          <span>Last:</span> {lastChange}
        </div>
      </div>
    </>
  );
}
