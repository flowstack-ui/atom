import { AlertDialog } from "@flowstack-ui/atom/alert-dialog";
import { Button } from "@flowstack-ui/atom/button";
import { Menubar } from "@flowstack-ui/atom/menubar";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type {
  AlertDialogCompositionMode,
  AlertDialogHeadingLevel,
  AlertDialogScenarioActions,
  AlertDialogScenarioState,
} from "./useAlertDialogScenario";

export function AlertDialogScenarioCanvas({
  state,
  actions,
}: {
  state: AlertDialogScenarioState;
  actions: AlertDialogScenarioActions;
}) {
  const rootProps = state.controlled
    ? { open: state.open, onOpenChange: actions.handleOpenChange }
    : { defaultOpen: false, onOpenChange: actions.handleOpenChange };

  return (
    <div className="dialog-stage">
      <AlertDialog.Root
        {...rootProps}
        disabled={state.disabled}
        keepMounted={state.keepMounted}
        closeOnEscape={state.closeOnEscape}
      >
        <AlertDialogTriggerExample
          mode={state.triggerComposition}
          onClick={actions.handleTriggerClick}
          onKeyDown={actions.handleTriggerKeyDown}
        />
        {state.controlled ? (
          <Button.Root
            className="atom-button secondary"
            onPress={() => actions.setControlledOpen(true)}
          >
            Open controlled
          </Button.Root>
        ) : null}
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            className="atom-dialog-overlay"
            data-alert-dialog-overlay=""
            data-playground-inspect=""
            data-prop-check="overlay"
            onClick={actions.handleOverlayClick}
          />
          <AlertDialog.Content
            ariaLabel={state.useAriaLabel ? "Delete project confirmation" : undefined}
            className="atom-dialog-content"
            data-alert-dialog-content=""
            data-playground-inspect=""
            data-prop-check="content"
          >
            {state.useAriaLabel ? null : (
              <AlertDialog.Title
                as={state.titleHeadingLevel}
                data-alert-dialog-title=""
                data-prop-check="title"
              >
                Delete project?
              </AlertDialog.Title>
            )}
            <AlertDialog.Description
              data-alert-dialog-description=""
              data-prop-check="description"
            >
              This action cannot be undone. Test cancel autofocus, action reasons, Escape, and backdrop behavior.
            </AlertDialog.Description>
            <div className="dialog-actions">
              {state.controlled ? (
                <Button.Root
                  className="atom-button secondary"
                  onPress={() => actions.setControlledOpen(false)}
                >
                  Close controlled
                </Button.Root>
              ) : null}
              <AlertDialogCancelExample
                autoFocus={state.cancelAutoFocus}
                mode={state.cancelComposition}
                onClick={actions.handleCancelClick}
              >
                Cancel
              </AlertDialogCancelExample>
              <AlertDialogActionExample
                mode={state.actionComposition}
                onClick={actions.handleActionClick}
              >
                Delete
              </AlertDialogActionExample>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
      <Button.Root className="behind-dialog-button" tabIndex={-1}>
        Behind alert dialog
      </Button.Root>
    </div>
  );
}

export function AlertDialogScenarioAnatomy({
  openGroups,
  state,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  state: AlertDialogScenarioState;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const trigger = document.querySelector<HTMLElement>("[data-alert-dialog-trigger]");
  const overlay = document.querySelector<HTMLElement>("[data-alert-dialog-overlay]");
  const content = document.querySelector<HTMLElement>("[data-alert-dialog-content]");
  const title = document.querySelector<HTMLElement>("[data-alert-dialog-title]");
  const description = document.querySelector<HTMLElement>("[data-alert-dialog-description]");
  const cancel = document.querySelector<HTMLElement>("[data-alert-dialog-cancel]");
  const action = document.querySelector<HTMLElement>("[data-alert-dialog-action]");

  const sections: AnatomySection[] = [
    {
      title: "Root",
      summary: state.controlled ? "controlled" : "uncontrolled",
      rows: [
        { label: "Mode", value: state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Open", value: state.open ? "yes" : "no", category: "state" },
        { label: "Disabled", value: state.disabled ? "yes" : "no", category: "state" },
        { label: "Keep mounted", value: state.keepMounted ? "yes" : "no", category: "state" },
        { label: "Escape closes", value: state.closeOnEscape ? "yes" : "no", category: "state" },
        { label: "Backdrop closes", value: "no", category: "state" },
        { label: "Cancel autofocus", value: state.cancelAutoFocus ? "yes" : "no", category: "state" },
        { label: "Block trigger event", value: state.blockTriggerEvent ? "yes" : "no", category: "state" },
        { label: "Block cancel close", value: state.blockCancelClose ? "yes" : "no", category: "state" },
        { label: "Block action close", value: state.blockActionClose ? "yes" : "no", category: "state" },
      ],
    },
    {
      title: "Trigger",
      selector: "[data-alert-dialog-trigger]",
      summary: trigger?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: trigger ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.triggerComposition, category: "composition" },
        { label: "aria-controls", value: trigger?.getAttribute("aria-controls") ?? "none", category: "aria" },
        { label: "aria-expanded", value: trigger?.getAttribute("aria-expanded") ?? "none", category: "aria" },
        { label: "data-state", value: trigger?.dataset.state ?? "none", category: "data" },
      ],
    },
    {
      title: "Portal",
      inactive: !content,
      summary: content?.parentElement?.tagName.toLowerCase() ?? "not rendered",
      rows: [
        { label: "Content exists", value: content ? "yes" : "no", category: "presence" },
        { label: "Parent", value: content?.parentElement?.tagName.toLowerCase() ?? "none", category: "behavior" },
        { label: "Inside canvas", value: content?.closest(".canvas") ? "yes" : "no", category: "behavior" },
      ],
    },
    {
      title: "Overlay",
      selector: "[data-alert-dialog-overlay]",
      inactive: !overlay,
      summary: overlay?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: overlay ? "yes" : "no", category: "presence" },
        { label: "data-state", value: overlay?.dataset.state ?? "none", category: "data" },
        { label: "data-positioned", value: overlay?.hasAttribute("data-positioned") ? "yes" : "no", category: "data" },
        { label: "Backdrop closes", value: "no", category: "behavior" },
      ],
    },
    {
      title: "Content",
      selector: "[data-alert-dialog-content]",
      inactive: !content,
      summary: content?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: content ? "yes" : "no", category: "presence" },
        { label: "role", value: content?.getAttribute("role") ?? "none", category: "aria" },
        { label: "aria-modal", value: content?.getAttribute("aria-modal") ?? "none", category: "aria" },
        { label: "aria-label", value: content?.getAttribute("aria-label") ?? "none", category: "aria" },
        { label: "aria-labelledby", value: content?.getAttribute("aria-labelledby") ?? "none", category: "aria" },
        { label: "aria-describedby", value: content?.getAttribute("aria-describedby") ?? "none", category: "aria" },
        { label: "data-state", value: content?.dataset.state ?? "none", category: "data" },
        { label: "data-positioned", value: content?.hasAttribute("data-positioned") ? "yes" : "no", category: "data" },
      ],
    },
    {
      title: "Title",
      selector: "[data-alert-dialog-title]",
      inactive: !title,
      summary: title ? title.tagName.toLowerCase() : "not rendered",
      rows: [
        { label: "Exists", value: title ? "yes" : "no", category: "presence" },
        { label: "id", value: title?.id ?? "none", category: "identity" },
        { label: "Matches label", value: content?.getAttribute("aria-labelledby") === title?.id ? "yes" : "no", category: "behavior" },
      ],
    },
    {
      title: "Description",
      selector: "[data-alert-dialog-description]",
      inactive: !description,
      summary: description ? "rendered" : "not rendered",
      rows: [
        { label: "Exists", value: description ? "yes" : "no", category: "presence" },
        { label: "id", value: description?.id ?? "none", category: "identity" },
        { label: "Matches description", value: content?.getAttribute("aria-describedby") === description?.id ? "yes" : "no", category: "behavior" },
      ],
    },
    {
      title: "Cancel",
      selector: "[data-alert-dialog-cancel]",
      inactive: !cancel,
      summary: state.cancelComposition,
      rows: [
        { label: "Exists", value: cancel ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.cancelComposition, category: "composition" },
        { label: "Autofocus", value: state.cancelAutoFocus ? "yes" : "no", category: "behavior" },
      ],
    },
    {
      title: "Action",
      selector: "[data-alert-dialog-action]",
      inactive: !action,
      summary: state.actionComposition,
      rows: [
        { label: "Exists", value: action ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.actionComposition, category: "composition" },
      ],
    },
  ];

  return (
    <AnatomyPanel
      footer={`${sections.length} parts`}
      openGroups={openGroups}
      sections={sections}
      onOpenGroupsChange={onOpenGroupsChange}
    />
  );
}

export function AlertDialogScenarioToolbar({
  state,
  actions,
}: {
  state: AlertDialogScenarioState;
  actions: AlertDialogScenarioActions;
}) {
  return (
    <Menubar.Root className="canvas-toolbar" aria-label="AlertDialog controls">
      <ToolbarGroup title="State" value="state">
        <MenuSection label="Root">
          <MenuCheckboxControl checked={state.controlled} label="Controlled" value="controlled" onChange={actions.setControlled} />
          <MenuCheckboxControl checked={state.disabled} label="Disabled" value="disabled" onChange={actions.setDisabled} />
          <MenuCheckboxControl checked={state.keepMounted} label="Keep mounted" value="keep-mounted" onChange={actions.setKeepMounted} />
          <MenuCheckboxControl checked={state.closeOnEscape} label="Escape closes" value="escape-closes" onChange={actions.setCloseOnEscape} />
        </MenuSection>
        <MenuSection label="Focus">
          <MenuCheckboxControl checked={state.cancelAutoFocus} label="Cancel autofocus" value="cancel-autofocus" onChange={actions.setCancelAutoFocus} />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="ARIA" value="aria">
        <MenuSection label="Content naming">
          <MenuCheckboxControl checked={state.useAriaLabel} label="Use ariaLabel" value="use-aria-label" onChange={actions.setUseAriaLabel} />
        </MenuSection>
        <MenuRadioControl label="Title as" options={headingLevelOptions} value={state.titleHeadingLevel} onChange={actions.setTitleHeadingLevel} />
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioControl label="Trigger" options={compositionOptions} value={state.triggerComposition} onChange={actions.setTriggerComposition} />
        <MenuRadioControl label="Cancel button" options={compositionOptions} value={state.cancelComposition} onChange={actions.setCancelComposition} />
        <MenuRadioControl label="Action button" options={compositionOptions} value={state.actionComposition} onChange={actions.setActionComposition} />
        <MenuSection label="Blocked events">
          <MenuCheckboxControl checked={state.blockTriggerEvent} label="Block trigger event" value="block-trigger-event" onChange={actions.setBlockTriggerEvent} />
          <MenuCheckboxControl checked={state.blockCancelClose} label="Block cancel close" value="block-cancel-close" onChange={actions.setBlockCancelClose} />
          <MenuCheckboxControl checked={state.blockActionClose} label="Block action close" value="block-action-close" onChange={actions.setBlockActionClose} />
        </MenuSection>
      </ToolbarGroup>
    </Menubar.Root>
  );
}

export function AlertDialogScenarioLog({ state }: { state: AlertDialogScenarioState }) {
  if (state.log.length === 0) return null;

  return (
    <ScrollArea.Root className="log-scroll" orientation="vertical">
      <ScrollArea.Viewport className="log-scroll-viewport" focusable aria-label="AlertDialog event log">
        <ol className="log-list">
          {state.log.map((entry) => (
            <li key={entry.id}>
              <time>{entry.time}</time>
              <span>{entry.text}</span>
            </li>
          ))}
        </ol>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  );
}

export function getAlertDialogSource(state: AlertDialogScenarioState) {
  const rootMode = state.controlled ? "open={open}" : "defaultOpen={false}";

  return `<AlertDialog.Root
  ${rootMode}
  disabled={${state.disabled}}
  keepMounted={${state.keepMounted}}
  closeOnEscape={${state.closeOnEscape}}
  onOpenChange={handleOpenChange}
>
  ${getAlertDialogTriggerSource(state)}
  <AlertDialog.Portal>
    <AlertDialog.Overlay />
    <AlertDialog.Content ${state.useAriaLabel ? `ariaLabel="Delete project confirmation"` : ""}>
      ${state.useAriaLabel ? "" : `<AlertDialog.Title as="${state.titleHeadingLevel}">Delete project?</AlertDialog.Title>`}
      <AlertDialog.Description>
        This action cannot be undone.
      </AlertDialog.Description>
      ${getAlertDialogCancelSource(state)}
      ${getAlertDialogActionSource(state)}
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>`;
}

function AlertDialogTriggerExample({
  mode,
  onClick,
  onKeyDown,
}: {
  mode: AlertDialogCompositionMode;
  onClick: AlertDialogScenarioActions["handleTriggerClick"];
  onKeyDown: AlertDialogScenarioActions["handleTriggerKeyDown"];
}) {
  const props = {
    className: "atom-button",
    "data-alert-dialog-trigger": "",
    "data-playground-inspect": "",
    "data-prop-check": "trigger",
    onClick,
    onKeyDown,
  };

  if (mode === "asChild") {
    return (
      <AlertDialog.Trigger asChild {...props}>
        <span>Delete project</span>
      </AlertDialog.Trigger>
    );
  }

  if (mode === "render") {
    return (
      <AlertDialog.Trigger render={<section />} {...props}>
        Delete project
      </AlertDialog.Trigger>
    );
  }

  return <AlertDialog.Trigger {...props}>Delete project</AlertDialog.Trigger>;
}

function AlertDialogCancelExample({
  autoFocus,
  children,
  mode,
  onClick,
}: {
  autoFocus: boolean;
  children: ReactNode;
  mode: AlertDialogCompositionMode;
  onClick: AlertDialogScenarioActions["handleCancelClick"];
}) {
  const props = {
    autoFocus,
    className: "atom-button secondary",
    "data-alert-dialog-cancel": "",
    "data-playground-inspect": "",
    "data-prop-check": "cancel",
    onClick,
  };

  if (mode === "asChild") {
    return (
      <AlertDialog.Cancel asChild {...props}>
        <span>{children}</span>
      </AlertDialog.Cancel>
    );
  }

  if (mode === "render") {
    return (
      <AlertDialog.Cancel render={<section />} {...props}>
        {children}
      </AlertDialog.Cancel>
    );
  }

  return <AlertDialog.Cancel {...props}>{children}</AlertDialog.Cancel>;
}

function AlertDialogActionExample({
  children,
  mode,
  onClick,
}: {
  children: ReactNode;
  mode: AlertDialogCompositionMode;
  onClick: AlertDialogScenarioActions["handleActionClick"];
}) {
  const props = {
    className: "atom-button",
    "data-alert-dialog-action": "",
    "data-playground-inspect": "",
    "data-prop-check": "action",
    onClick,
  };

  if (mode === "asChild") {
    return (
      <AlertDialog.Action asChild {...props}>
        <span>{children}</span>
      </AlertDialog.Action>
    );
  }

  if (mode === "render") {
    return (
      <AlertDialog.Action render={<section />} {...props}>
        {children}
      </AlertDialog.Action>
    );
  }

  return <AlertDialog.Action {...props}>{children}</AlertDialog.Action>;
}

function getAlertDialogTriggerSource(state: AlertDialogScenarioState) {
  if (state.triggerComposition === "asChild") {
    return `<AlertDialog.Trigger asChild>
    <span>Delete project</span>
  </AlertDialog.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<AlertDialog.Trigger render={<section />}>
    Delete project
  </AlertDialog.Trigger>`;
  }

  return `<AlertDialog.Trigger>Delete project</AlertDialog.Trigger>`;
}

function getAlertDialogCancelSource(state: AlertDialogScenarioState) {
  if (state.cancelComposition === "asChild") {
    return `<AlertDialog.Cancel asChild autoFocus={${state.cancelAutoFocus}}>
        <span>Cancel</span>
      </AlertDialog.Cancel>`;
  }

  if (state.cancelComposition === "render") {
    return `<AlertDialog.Cancel render={<section />} autoFocus={${state.cancelAutoFocus}}>
        Cancel
      </AlertDialog.Cancel>`;
  }

  return `<AlertDialog.Cancel autoFocus={${state.cancelAutoFocus}}>Cancel</AlertDialog.Cancel>`;
}

function getAlertDialogActionSource(state: AlertDialogScenarioState) {
  if (state.actionComposition === "asChild") {
    return `<AlertDialog.Action asChild>
        <span>Delete</span>
      </AlertDialog.Action>`;
  }

  if (state.actionComposition === "render") {
    return `<AlertDialog.Action render={<section />}>
        Delete
      </AlertDialog.Action>`;
  }

  return `<AlertDialog.Action>Delete</AlertDialog.Action>`;
}

function ToolbarGroup({ children, title, value }: { children: ReactNode; title: string; value: string }) {
  return (
    <Menubar.Menu closeOnSelect={false} value={value}>
      <Menubar.Trigger className="toolbar-group-trigger">
        <span>{title}</span>
      </Menubar.Trigger>
      <Menubar.Content className="toolbar-menu" sideOffset={4}>
        {children}
      </Menubar.Content>
    </Menubar.Menu>
  );
}

function MenuSection({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="toolbar-menu-section">
      <div className="toolbar-menu-label">{label}</div>
      <div className="toolbar-menu-items">{children}</div>
    </div>
  );
}

function MenuCheckboxControl({
  checked,
  label,
  value,
  onChange,
}: {
  checked: boolean;
  label: string;
  value: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <Menubar.CheckboxItem
      className="toolbar-menu-item"
      checked={checked}
      value={value}
      onCheckedChange={onChange}
    >
      <span>{label}</span>
      <span className="toolbar-menu-check" aria-hidden="true">{checked ? "✓" : ""}</span>
    </Menubar.CheckboxItem>
  );
}

function MenuRadioControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <MenuSection label={label}>
      <Menubar.RadioGroup value={value} onValueChange={(nextValue) => onChange(nextValue as T)}>
        {options.map((option) => (
          <Menubar.RadioItem
            className="toolbar-menu-item"
            key={option.value}
            value={option.value}
          >
            <span>{option.label}</span>
            <span className="toolbar-menu-check" aria-hidden="true">{option.value === value ? "✓" : ""}</span>
          </Menubar.RadioItem>
        ))}
      </Menubar.RadioGroup>
    </MenuSection>
  );
}

const compositionOptions = [
  { label: "Default", value: "default" },
  { label: "As Child", value: "asChild" },
  { label: "Render", value: "render" },
] as const;

const headingLevelOptions = [
  { label: "H1", value: "h1" },
  { label: "H2", value: "h2" },
  { label: "H3", value: "h3" },
  { label: "H4", value: "h4" },
  { label: "H5", value: "h5" },
  { label: "H6", value: "h6" },
] as const satisfies readonly { label: string; value: AlertDialogHeadingLevel }[];
