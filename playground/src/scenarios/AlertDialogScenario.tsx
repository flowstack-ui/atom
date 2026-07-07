import { AlertDialog } from "@flowstack-ui/atom/alert-dialog";
import { Button } from "@flowstack-ui/atom/button";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup, partProps } from "../WorkbenchPrimitives";
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
          customSlot={state.customTriggerSlot}
          mode={state.triggerComposition}
          onClick={actions.handleTriggerClick}
          onKeyDown={actions.handleTriggerKeyDown}
          propCheck={state.propCheck}
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
            {...partProps("overlay", { customSlot: state.customOverlaySlot, propCheck: state.propCheck }, "alert-dialog-overlay-custom")}
            onClick={actions.handleOverlayClick}
          />
          <AlertDialog.Content
            ariaLabel={state.useAriaLabel ? "Delete project confirmation" : undefined}
            className="atom-dialog-content"
            data-alert-dialog-content=""
            data-playground-inspect=""
            {...partProps("content", { customSlot: state.customContentSlot, propCheck: state.propCheck }, "alert-dialog-content-custom")}
          >
            {state.useAriaLabel ? null : (
              <AlertDialog.Title
                as={state.titleHeadingLevel}
                data-alert-dialog-title=""
                {...partProps("title", { customSlot: state.customTitleSlot, propCheck: state.propCheck }, "alert-dialog-title-custom")}
              >
                Delete project?
              </AlertDialog.Title>
            )}
            <AlertDialog.Description
              data-alert-dialog-description=""
              {...partProps("description", { customSlot: state.customDescriptionSlot, propCheck: state.propCheck }, "alert-dialog-description-custom")}
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
                customSlot={state.customCancelSlot}
                mode={state.cancelComposition}
                onClick={actions.handleCancelClick}
                propCheck={state.propCheck}
              >
                Cancel
              </AlertDialogCancelExample>
              <AlertDialogActionExample
                customSlot={state.customActionSlot}
                mode={state.actionComposition}
                onClick={actions.handleActionClick}
                propCheck={state.propCheck}
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
    <ControlToolbar label="AlertDialog controls">
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
      <PropsToolbarGroup
        propCheck={state.propCheck}
        onPropCheckChange={actions.setPropCheck}
        customSlots={[
          { checked: state.customTriggerSlot, label: "Trigger Slot", value: "trigger-slot", onChange: actions.setCustomTriggerSlot },
          { checked: state.customOverlaySlot, label: "Overlay Slot", value: "overlay-slot", onChange: actions.setCustomOverlaySlot },
          { checked: state.customContentSlot, label: "Content Slot", value: "content-slot", onChange: actions.setCustomContentSlot },
          { checked: state.customTitleSlot, label: "Title Slot", value: "title-slot", onChange: actions.setCustomTitleSlot },
          { checked: state.customDescriptionSlot, label: "Description Slot", value: "description-slot", onChange: actions.setCustomDescriptionSlot },
          { checked: state.customCancelSlot, label: "Cancel Slot", value: "cancel-slot", onChange: actions.setCustomCancelSlot },
          { checked: state.customActionSlot, label: "Action Slot", value: "action-slot", onChange: actions.setCustomActionSlot },
        ]}
      />
    </ControlToolbar>
  );
}

export function AlertDialogScenarioLog({ state }: { state: AlertDialogScenarioState }) {
  return <ScenarioEventLog log={state.log} />;
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
    <AlertDialog.Overlay${sourceProps([
      state.customOverlaySlot ? `data-slot="alert-dialog-overlay-custom"` : null,
      state.propCheck ? `data-prop-check="overlay"` : null,
    ])} />
    <AlertDialog.Content ${[
      state.useAriaLabel ? `ariaLabel="Delete project confirmation"` : "",
      state.customContentSlot ? `data-slot="alert-dialog-content-custom"` : "",
      state.propCheck ? `data-prop-check="content"` : "",
    ].filter(Boolean).join(" ")}>
      ${state.useAriaLabel ? "" : `<AlertDialog.Title as="${state.titleHeadingLevel}"${sourceProps([
        state.customTitleSlot ? `data-slot="alert-dialog-title-custom"` : null,
        state.propCheck ? `data-prop-check="title"` : null,
      ])}>Delete project?</AlertDialog.Title>`}
      <AlertDialog.Description${sourceProps([
        state.customDescriptionSlot ? `data-slot="alert-dialog-description-custom"` : null,
        state.propCheck ? `data-prop-check="description"` : null,
      ])}>
        This action cannot be undone.
      </AlertDialog.Description>
      ${getAlertDialogCancelSource(state)}
      ${getAlertDialogActionSource(state)}
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>`;
}

function AlertDialogTriggerExample({
  customSlot,
  mode,
  onClick,
  onKeyDown,
  propCheck,
}: {
  customSlot: boolean;
  mode: AlertDialogCompositionMode;
  onClick: AlertDialogScenarioActions["handleTriggerClick"];
  onKeyDown: AlertDialogScenarioActions["handleTriggerKeyDown"];
  propCheck: boolean;
}) {
  const props = {
    className: "atom-button",
    "data-alert-dialog-trigger": "",
    "data-playground-inspect": "",
    ...partProps("trigger", { customSlot, propCheck }, "alert-dialog-trigger-custom"),
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
  customSlot,
  mode,
  onClick,
  propCheck,
}: {
  autoFocus: boolean;
  children: ReactNode;
  customSlot: boolean;
  mode: AlertDialogCompositionMode;
  onClick: AlertDialogScenarioActions["handleCancelClick"];
  propCheck: boolean;
}) {
  const props = {
    autoFocus,
    className: "atom-button secondary",
    "data-alert-dialog-cancel": "",
    "data-playground-inspect": "",
    ...partProps("cancel", { customSlot, propCheck }, "alert-dialog-cancel-custom"),
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
  customSlot,
  mode,
  onClick,
  propCheck,
}: {
  children: ReactNode;
  customSlot: boolean;
  mode: AlertDialogCompositionMode;
  onClick: AlertDialogScenarioActions["handleActionClick"];
  propCheck: boolean;
}) {
  const props = {
    className: "atom-button",
    "data-alert-dialog-action": "",
    "data-playground-inspect": "",
    ...partProps("action", { customSlot, propCheck }, "alert-dialog-action-custom"),
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
  const props = sourceProps([
    state.customTriggerSlot ? `data-slot="alert-dialog-trigger-custom"` : null,
    state.propCheck ? `data-prop-check="trigger"` : null,
  ]);
  if (state.triggerComposition === "asChild") {
    return `<AlertDialog.Trigger${props} asChild>
    <span>Delete project</span>
  </AlertDialog.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<AlertDialog.Trigger${props} render={<section />}>
    Delete project
  </AlertDialog.Trigger>`;
  }

  return `<AlertDialog.Trigger${props}>Delete project</AlertDialog.Trigger>`;
}

function getAlertDialogCancelSource(state: AlertDialogScenarioState) {
  const props = sourceProps([
    state.customCancelSlot ? `data-slot="alert-dialog-cancel-custom"` : null,
    state.propCheck ? `data-prop-check="cancel"` : null,
  ]);
  if (state.cancelComposition === "asChild") {
    return `<AlertDialog.Cancel${props} asChild autoFocus={${state.cancelAutoFocus}}>
        <span>Cancel</span>
      </AlertDialog.Cancel>`;
  }

  if (state.cancelComposition === "render") {
    return `<AlertDialog.Cancel${props} render={<section />} autoFocus={${state.cancelAutoFocus}}>
        Cancel
      </AlertDialog.Cancel>`;
  }

  return `<AlertDialog.Cancel${props} autoFocus={${state.cancelAutoFocus}}>Cancel</AlertDialog.Cancel>`;
}

function getAlertDialogActionSource(state: AlertDialogScenarioState) {
  const props = sourceProps([
    state.customActionSlot ? `data-slot="alert-dialog-action-custom"` : null,
    state.propCheck ? `data-prop-check="action"` : null,
  ]);
  if (state.actionComposition === "asChild") {
    return `<AlertDialog.Action${props} asChild>
        <span>Delete</span>
      </AlertDialog.Action>`;
  }

  if (state.actionComposition === "render") {
    return `<AlertDialog.Action${props} render={<section />}>
        Delete
      </AlertDialog.Action>`;
  }

  return `<AlertDialog.Action${props}>Delete</AlertDialog.Action>`;
}

function sourceProps(props: Array<string | null | undefined | false>) {
  const visibleProps = props.filter(Boolean);
  return visibleProps.length > 0 ? ` ${visibleProps.join(" ")}` : "";
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
