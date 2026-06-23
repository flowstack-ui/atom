import { Dialog } from "@flowstack-ui/atom/dialog";
import { useCallback, useState } from "react";
import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  RefAttributes,
} from "react";
import type {
  DialogCompositionMode,
  DialogScenarioActions,
  DialogScenarioState,
} from "./useDialogScenario";

export function DialogScenarioCanvas({
  state,
  actions,
  onOpenChange,
  onControlledOpen,
  onControlledClose,
}: {
  state: DialogScenarioState;
  actions: DialogScenarioActions;
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
  const triggerRef = useCallback(
    (element: HTMLElement | null) => actions.markPartRef("trigger", element),
    [actions.markPartRef],
  );
  const overlayRef = useCallback(
    (element: HTMLDivElement | null) => actions.markPartRef("overlay", element),
    [actions.markPartRef],
  );
  const contentRef = useCallback(
    (element: HTMLDivElement | null) => actions.markPartRef("content", element),
    [actions.markPartRef],
  );
  const titleRef = useCallback(
    (element: HTMLHeadingElement | null) => actions.markPartRef("title", element),
    [actions.markPartRef],
  );
  const descriptionRef = useCallback(
    (element: HTMLParagraphElement | null) =>
      actions.markPartRef("description", element),
    [actions.markPartRef],
  );
  const saveCloseRef = useCallback(
    (element: HTMLElement | null) => actions.markPartRef("saveClose", element),
    [actions.markPartRef],
  );

  return (
    <div className="dialog-stage">
      <button
        className="behind-dialog-button"
        data-dialog-behind
        tabIndex={-1}
        type="button"
      >
        Behind dialog
      </button>
      <Dialog.Root
        {...rootProps}
        disabled={state.disabled}
        keepMounted={state.keepMounted}
        closeOnEscape={state.closeOnEscape}
        closeOnBackdropClick={state.closeOnBackdropClick}
      >
        <DialogTriggerExample
          elementRef={triggerRef}
          mode={state.triggerComposition}
          onClick={actions.handleTriggerClick}
          onKeyDown={actions.handleTriggerKeyDown}
          overrideSlots={state.overrideSlots}
        />
        {state.disabled && !state.open ? (
          <div className="dialog-probes" aria-label="Disabled trigger probes">
            <button type="button" onClick={() => actions.testDisabledTriggerKey("Enter")}>
              Test Enter
            </button>
            <button type="button" onClick={() => actions.testDisabledTriggerKey(" ")}>
              Test Space
            </button>
          </div>
        ) : null}
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
          <Dialog.Overlay
            className="atom-dialog-overlay"
            data-dialog-overlay=""
            data-playground-inspect=""
            data-prop-check="overlay"
            data-slot={state.overrideSlots ? "playground-dialog-overlay" : undefined}
            id="dialog-overlay-prop"
            onClick={actions.handleOverlayClick}
            ref={overlayRef}
            title="overlay prop"
          />
          <Dialog.Content
            ariaLabel={state.useAriaLabel ? "Project settings" : undefined}
            className="atom-dialog-content"
            data-dialog-content=""
            data-prop-check="content"
            data-playground-inspect=""
            data-slot={state.overrideSlots ? "playground-dialog-content" : undefined}
            ref={contentRef}
            title="content prop"
          >
            {state.useAriaLabel ? null : (
              <Dialog.Title
                data-dialog-title=""
                data-prop-check="title"
                data-slot={state.overrideSlots ? "playground-dialog-title" : undefined}
                ref={titleRef}
                title="title prop"
              >
                Project settings
              </Dialog.Title>
            )}
            <Dialog.Description
              data-dialog-description=""
              data-prop-check="description"
              data-slot={state.overrideSlots ? "playground-dialog-description" : undefined}
              ref={descriptionRef}
              title="description prop"
            >
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
              <button
                className="atom-button secondary"
                type="button"
                onClick={actions.testFocusEscape}
              >
                Test focus escape
              </button>
              {state.controlled ? (
                <button
                  className="atom-button secondary"
                  type="button"
                  onClick={onControlledClose}
                >
                  Close controlled
                </button>
              ) : null}
              <Dialog.Close
                className="atom-button secondary"
                data-dialog-cancel-close=""
                onClick={() => actions.markCloseSource("cancel")}
              >
                Cancel
              </Dialog.Close>
              <DialogCloseExample
                className="atom-button"
                elementRef={saveCloseRef}
                mode={state.closeComposition}
                onClick={actions.handleSaveCloseClick}
                overrideSlots={state.overrideSlots}
              >
                Save
              </DialogCloseExample>
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
          <PartRow
            label="Block trigger event"
            value={state.blockTriggerEvent ? "yes" : "no"}
          />
          <PartRow
            label="Block save close"
            value={state.blockSaveClose ? "yes" : "no"}
          />
          <PartRow
            label="Block backdrop close"
            value={state.blockBackdropClose ? "yes" : "no"}
          />
          <PartRow
            label="Override slots"
            value={state.overrideSlots ? "yes" : "no"}
          />
        </PartGroup>
        <PartGroup
          open={openGroups.Trigger}
          summary={state.parts.triggerState}
          title="Trigger"
          onToggle={toggleGroup}
        >
          <PartRow label="Exists" value={state.parts.triggerExists} />
          <PartRow label="Ref" value={state.refs.trigger} />
          <PartRow label="Props" value={state.parts.triggerProps} />
          <PartRow label="Class" value={state.parts.triggerClass} />
          <PartRow label="Composition" value={state.triggerComposition} />
          <PartRow label="tag" value={state.parts.triggerTag} />
          <PartRow label="data-slot" value={state.parts.triggerSlot} />
          <PartRow label="role" value={state.parts.triggerRole} />
          <PartRow label="tabindex attr" value={state.parts.triggerTabIndex} />
          <PartRow label="data-state" value={state.parts.triggerState} />
          <PartRow label="aria-controls" value={state.parts.triggerControls} />
          <PartRow label="aria-haspopup" value={state.parts.triggerHasPopup} />
          <PartRow label="aria-expanded" value={state.parts.triggerExpanded} />
          <PartRow label="Controls match" value={state.parts.controlsMatch} />
          <PartRow label="Disabled" value={state.parts.triggerDisabled} />
        </PartGroup>
        <PartGroup
          open={openGroups["Close: Cancel"]}
          inactive={state.parts.cancelCloseExists !== "yes"}
          summary={state.parts.cancelCloseExists === "yes" ? "default" : "not rendered"}
          title="Close: Cancel"
          onToggle={toggleGroup}
        >
          <PartRow label="Exists" value={state.parts.cancelCloseExists} />
          <PartRow label="Composition" value="default" />
          <PartRow label="tag" value={state.parts.cancelCloseTag} />
          <PartRow label="data-slot" value={state.parts.cancelCloseSlot} />
          <PartRow label="role" value={state.parts.cancelCloseRole} />
          <PartRow label="tabindex attr" value={state.parts.cancelCloseTabIndex} />
        </PartGroup>
        <PartGroup
          open={openGroups["Close: Save"]}
          inactive={state.parts.saveCloseExists !== "yes"}
          summary={state.parts.saveCloseExists === "yes" ? state.closeComposition : "not rendered"}
          title="Close: Save"
          onToggle={toggleGroup}
        >
          <PartRow label="Exists" value={state.parts.saveCloseExists} />
          <PartRow
            label="Ref"
            value={state.parts.saveCloseExists === "yes" ? state.refs.saveClose : "none"}
          />
          <PartRow label="Props" value={state.parts.saveCloseProps} />
          <PartRow label="Composition" value={state.closeComposition} />
          <PartRow label="tag" value={state.parts.saveCloseTag} />
          <PartRow label="data-slot" value={state.parts.saveCloseSlot} />
          <PartRow label="role" value={state.parts.saveCloseRole} />
          <PartRow label="tabindex attr" value={state.parts.saveCloseTabIndex} />
        </PartGroup>
        <PartGroup
          open={openGroups.Portal}
          inactive={state.parts.contentExists !== "yes"}
          summary={state.parts.portalParent}
          title="Portal"
          onToggle={toggleGroup}
        >
          <PartRow label="Content parent" value={state.parts.portalParent} />
          <PartRow label="Inside canvas" value={state.parts.inCanvas} />
          <PartRow label="Content exists" value={state.parts.contentExists} />
        </PartGroup>
        <PartGroup
          open={openGroups.Overlay}
          inactive={state.parts.overlayExists !== "yes"}
          summary={state.parts.overlayExists === "yes" ? state.parts.overlayState : "not rendered"}
          title="Overlay"
          onToggle={toggleGroup}
        >
          <PartRow label="Exists" value={state.parts.overlayExists} />
          <PartRow
            label="Ref"
            value={state.parts.overlayExists === "yes" ? state.refs.overlay : "none"}
          />
          <PartRow label="Props" value={state.parts.overlayProps} />
          <PartRow label="data-slot" value={state.parts.overlaySlot} />
          <PartRow label="data-state" value={state.parts.overlayState} />
        </PartGroup>
        <PartGroup
          open={openGroups.Content}
          inactive={state.parts.contentExists !== "yes"}
          summary={state.parts.contentExists === "yes" ? state.parts.contentState : "not rendered"}
          title="Content"
          onToggle={toggleGroup}
        >
          <PartRow label="Exists" value={state.parts.contentExists} />
          <PartRow
            label="Ref"
            value={state.parts.contentExists === "yes" ? state.refs.content : "none"}
          />
          <PartRow label="Props" value={state.parts.contentProps} />
          <PartRow label="id" value={state.parts.contentId} />
          <PartRow label="data-slot" value={state.parts.contentSlot} />
          <PartRow label="role" value={state.parts.contentRole} />
          <PartRow label="data-state" value={state.parts.contentState} />
          <PartRow label="data-positioned" value={state.parts.contentPositioned} />
          <PartRow label="Hidden" value={state.parts.contentHidden} />
          <PartRow label="aria-modal" value={state.parts.contentAriaModal} />
          <PartRow label="aria-label" value={state.parts.contentAriaLabel} />
          <PartRow label="aria-labelledby" value={state.parts.contentLabelledBy} />
          <PartRow label="aria-describedby" value={state.parts.contentDescribedBy} />
        </PartGroup>
        <PartGroup
          open={openGroups.Title}
          inactive={state.parts.titleExists !== "yes"}
          summary={state.parts.titleExists === "yes" ? state.parts.titleId : "not rendered"}
          title="Title"
          onToggle={toggleGroup}
        >
          <PartRow label="Exists" value={state.parts.titleExists} />
          <PartRow
            label="Ref"
            value={state.parts.titleExists === "yes" ? state.refs.title : "none"}
          />
          <PartRow label="Props" value={state.parts.titleProps} />
          <PartRow label="tag" value={state.parts.titleTag} />
          <PartRow label="data-slot" value={state.parts.titleSlot} />
          <PartRow label="id" value={state.parts.titleId} />
          <PartRow label="Matches label" value={state.parts.titleMatches} />
        </PartGroup>
        <PartGroup
          open={openGroups.Description}
          inactive={state.parts.descriptionExists !== "yes"}
          summary={
            state.parts.descriptionExists === "yes"
              ? state.parts.descriptionId
              : "not rendered"
          }
          title="Description"
          onToggle={toggleGroup}
        >
          <PartRow label="Exists" value={state.parts.descriptionExists} />
          <PartRow
            label="Ref"
            value={state.parts.descriptionExists === "yes" ? state.refs.description : "none"}
          />
          <PartRow label="Props" value={state.parts.descriptionProps} />
          <PartRow label="data-slot" value={state.parts.descriptionSlot} />
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
          {state.log.length === 0 ? (
            <li className="empty-log-row">
              <span>no events</span>
            </li>
          ) : state.log.map((entry) => (
            <li key={entry.id}>
              <time>{entry.time}</time>
              <span>{entry.text}</span>
            </li>
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
      <SelectControl
        label="Trigger"
        value={state.triggerComposition}
        onChange={actions.setTriggerComposition}
      />
      <SelectControl
        label="Save close"
        value={state.closeComposition}
        onChange={actions.setCloseComposition}
      />
      <ToggleControl
        checked={state.blockTriggerEvent}
        label="Block trigger event"
        onChange={actions.setBlockTriggerEvent}
      />
      <ToggleControl
        checked={state.blockSaveClose}
        label="Block save close"
        onChange={actions.setBlockSaveClose}
      />
      <ToggleControl
        checked={state.blockBackdropClose}
        label="Block backdrop close"
        onChange={actions.setBlockBackdropClose}
      />
      <ToggleControl
        checked={state.overrideSlots}
        label="Override slots"
        onChange={actions.setOverrideSlots}
      />
    </div>
  );
}

function PartGroup({
  children,
  inactive = false,
  open = false,
  summary,
  title,
  onToggle,
}: {
  children: ReactNode;
  inactive?: boolean;
  open?: boolean;
  summary: string;
  title: string;
  onToggle: (title: string) => void;
}) {
  return (
    <section className="part-group" aria-label={title} data-inactive={inactive || undefined}>
      <button
        className="part-group-trigger"
        type="button"
        aria-expanded={open}
        onClick={() => onToggle(title)}
      >
        <span className="part-group-icon" aria-hidden="true">{open ? "▾" : "▸"}</span>
        <span className="part-group-title">{title}</span>
        {open ? null : <span className="part-group-summary">{summary}</span>}
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

function SelectControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: DialogCompositionMode;
  onChange: (value: DialogCompositionMode) => void;
}) {
  return (
    <label className="select-control">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as DialogCompositionMode)}
      >
        <option value="default">default</option>
        <option value="asChild">asChild</option>
        <option value="render">render</option>
      </select>
    </label>
  );
}

function DialogTriggerExample({
  elementRef,
  mode,
  onClick,
  onKeyDown,
  overrideSlots,
}: {
  elementRef: (element: HTMLElement | null) => void;
  mode: DialogCompositionMode;
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  overrideSlots: boolean;
}) {
  if (mode === "asChild") {
    return (
      <Dialog.Trigger
        className="atom-button"
        data-dialog-trigger=""
        data-prop-check="trigger"
        data-slot={overrideSlots ? "playground-dialog-trigger" : undefined}
        id="dialog-trigger-prop"
        name="dialog-trigger-name"
        ref={elementRef}
        title="trigger prop"
        asChild
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        <span className="composition-control">Open dialog</span>
      </Dialog.Trigger>
    );
  }

  if (mode === "render") {
    return (
      <Dialog.Trigger
        className="atom-button"
        data-dialog-trigger=""
        data-prop-check="trigger"
        data-slot={overrideSlots ? "playground-dialog-trigger" : undefined}
        id="dialog-trigger-prop"
        name="dialog-trigger-name"
        onClick={onClick}
        onKeyDown={onKeyDown}
        ref={elementRef}
        render={renderCompositionControl}
        title="trigger prop"
      >
        Open dialog
      </Dialog.Trigger>
    );
  }

  return (
    <Dialog.Trigger
      className="atom-button"
      data-dialog-trigger=""
      data-prop-check="trigger"
      data-slot={overrideSlots ? "playground-dialog-trigger" : undefined}
      id="dialog-trigger-prop"
      name="dialog-trigger-name"
      onClick={onClick}
      onKeyDown={onKeyDown}
      ref={elementRef}
      title="trigger prop"
    >
      Open dialog
    </Dialog.Trigger>
  );
}

function DialogCloseExample({
  children,
  className,
  elementRef,
  mode,
  onClick,
  overrideSlots,
}: {
  children: ReactNode;
  className: string;
  elementRef: (element: HTMLElement | null) => void;
  mode: DialogCompositionMode;
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
  overrideSlots: boolean;
}) {
  if (mode === "asChild") {
    return (
      <Dialog.Close
        className={className}
        data-prop-check="save-close"
        data-slot={overrideSlots ? "playground-dialog-close" : undefined}
        id="dialog-save-close-prop"
        name="dialog-save-close-name"
        ref={elementRef}
        title="save close prop"
        asChild
        onClick={onClick}
      >
        <span className="composition-control" data-dialog-save-close="">
          {children}
        </span>
      </Dialog.Close>
    );
  }

  if (mode === "render") {
    return (
      <Dialog.Close
        className={className}
        data-dialog-save-close=""
        data-prop-check="save-close"
        data-slot={overrideSlots ? "playground-dialog-close" : undefined}
        id="dialog-save-close-prop"
        name="dialog-save-close-name"
        onClick={onClick}
        ref={elementRef}
        render={renderCompositionControl}
        title="save close prop"
      >
        {children}
      </Dialog.Close>
    );
  }

  return (
    <Dialog.Close
      className={className}
      data-dialog-save-close=""
      data-prop-check="save-close"
      data-slot={overrideSlots ? "playground-dialog-close" : undefined}
      id="dialog-save-close-prop"
      name="dialog-save-close-name"
      onClick={onClick}
      ref={elementRef}
      title="save close prop"
    >
      {children}
    </Dialog.Close>
  );
}

function renderCompositionControl(props: Record<string, unknown>) {
  const { className, children, ...elementProps } = props as HTMLAttributes<HTMLSpanElement> &
    RefAttributes<HTMLSpanElement>;

  return (
    <span
      {...elementProps}
      className={["composition-control", className].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}
