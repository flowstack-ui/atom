import { Button } from "@flowstack-ui/atom/button";
import { Dialog } from "@flowstack-ui/atom/dialog";
import { Field } from "@flowstack-ui/atom/field";
import { Input } from "@flowstack-ui/atom/input";
import { Menubar } from "@flowstack-ui/atom/menubar";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import { Select } from "@flowstack-ui/atom/select";
import { useCallback } from "react";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import type {
  Dispatch,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  RefAttributes,
  SetStateAction,
} from "react";
import type {
  DialogCompositionMode,
  DialogContentRole,
  DialogHeadingLevel,
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
      <Button.Root
        className="behind-dialog-button"
        data-dialog-behind
        tabIndex={-1}
      >
        Behind dialog
      </Button.Root>
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
            <Button.Root onPress={() => actions.testDisabledTriggerKey("Enter")}>
              Test Enter
            </Button.Root>
            <Button.Root onPress={() => actions.testDisabledTriggerKey(" ")}>
              Test Space
            </Button.Root>
          </div>
        ) : null}
        {state.controlled ? (
          <Button.Root
            className="atom-button secondary"
            onPress={onControlledOpen}
          >
            Open controlled
          </Button.Root>
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
            role={state.contentRole}
            title="content prop"
          >
            {state.useAriaLabel ? null : (
              <Dialog.Title
                as={state.titleHeadingLevel}
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
            {state.noFocusableContent ? (
              <p className="dialog-static-note">
                No focusable controls are rendered in this mode.
              </p>
            ) : (
              <>
                <Field.Root className="dialog-form-row" id="dialog-name-field">
                  <Field.Label>Name</Field.Label>
                  <Input.Root defaultValue="Atom Playground" />
                </Field.Root>
                <Field.Root className="dialog-form-row" id="dialog-mode-field">
                  <Field.Label>Mode</Field.Label>
                  <Select.Root defaultValue="manual">
                    <Select.Trigger className="atom-select-trigger">
                      <Select.Value />
                      <Select.Icon>▾</Select.Icon>
                    </Select.Trigger>
                    <Select.Content className="atom-select-content" ariaLabel="Mode">
                      <Select.Viewport className="atom-select-viewport">
                        <Select.Item className="atom-select-item" value="manual">
                          <Select.ItemText>Manual</Select.ItemText>
                        </Select.Item>
                        <Select.Item className="atom-select-item" value="auto">
                          <Select.ItemText>Automatic</Select.ItemText>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Root>
                </Field.Root>
                <div className="dialog-actions">
                  <Button.Root
                    className="atom-button secondary"
                    onPress={actions.testFocusEscape}
                  >
                    Test focus escape
                  </Button.Root>
                  {state.controlled ? (
                    <Button.Root
                      className="atom-button secondary"
                      onPress={onControlledClose}
                    >
                      Close controlled
                    </Button.Root>
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
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export function DialogScenarioAnatomy({
  openGroups,
  state,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  state: DialogScenarioState;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const sections: AnatomySection[] = [
    {
      title: "Root",
      summary: state.controlled ? "controlled" : "uncontrolled",
      rows: [
        { label: "Backdrop closes", value: state.closeOnBackdropClick ? "yes" : "no", category: "state" },
        { label: "Block backdrop close", value: state.blockBackdropClose ? "yes" : "no", category: "state" },
        { label: "Block save close", value: state.blockSaveClose ? "yes" : "no", category: "state" },
        { label: "Block trigger event", value: state.blockTriggerEvent ? "yes" : "no", category: "state" },
        { label: "Disabled", value: state.disabled ? "yes" : "no", category: "state" },
        { label: "Escape closes", value: state.closeOnEscape ? "yes" : "no", category: "state" },
        { label: "Keep mounted", value: state.keepMounted ? "yes" : "no", category: "state" },
        { label: "Mode", value: state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "No focusables", value: state.noFocusableContent ? "yes" : "no", category: "state" },
        { label: "Override slots", value: state.overrideSlots ? "yes" : "no", category: "state" },
        { label: "Title as", value: state.titleHeadingLevel, category: "state" },
      ],
    },
    {
      title: "Trigger",
      selector: "[data-dialog-trigger]",
      summary: state.parts.triggerState,
      rows: [
        { label: "Exists", value: state.parts.triggerExists, category: "presence" },
        { label: "Ref", value: state.refs.trigger, category: "identity" },
        { label: "Class", value: state.parts.triggerClass, category: "identity" },
        { label: "tag", value: state.parts.triggerTag, category: "identity" },
        { label: "Props", value: state.parts.triggerProps, category: "composition" },
        { label: "Composition", value: state.triggerComposition, category: "composition" },
        { label: "data-slot", value: state.parts.triggerSlot, category: "data" },
        { label: "data-state", value: state.parts.triggerState, category: "data" },
        { label: "aria-controls", value: state.parts.triggerControls, category: "aria" },
        { label: "aria-expanded", value: state.parts.triggerExpanded, category: "aria" },
        { label: "aria-haspopup", value: state.parts.triggerHasPopup, category: "aria" },
        { label: "Controls match", value: state.parts.controlsMatch, category: "aria" },
        { label: "Disabled", value: state.parts.triggerDisabled, category: "state" },
        { label: "role", value: state.parts.triggerRole, category: "aria" },
        { label: "tabindex attr", value: state.parts.triggerTabIndex, category: "aria" },
      ],
    },
    {
      title: "Portal",
      inactive: state.parts.contentExists !== "yes",
      summary: state.parts.portalParent,
      rows: [
        { label: "Content exists", value: state.parts.contentExists, category: "presence" },
        { label: "Content parent", value: state.parts.portalParent, category: "behavior" },
        { label: "Inside canvas", value: state.parts.inCanvas, category: "behavior" },
      ],
    },
    {
      title: "Overlay",
      selector: "[data-dialog-overlay]",
      inactive: state.parts.overlayExists !== "yes",
      summary: state.parts.overlayExists === "yes" ? state.parts.overlayState : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.overlayExists, category: "presence" },
        { label: "Ref", value: state.parts.overlayExists === "yes" ? state.refs.overlay : "none", category: "identity" },
        { label: "Props", value: state.parts.overlayProps, category: "composition" },
        { label: "data-slot", value: state.parts.overlaySlot, category: "data" },
        { label: "data-state", value: state.parts.overlayState, category: "data" },
      ],
    },
    {
      title: "Content",
      selector: "[data-dialog-content]",
      inactive: state.parts.contentExists !== "yes",
      summary: state.parts.contentExists === "yes" ? state.parts.contentState : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.contentExists, category: "presence" },
        { label: "Ref", value: state.parts.contentExists === "yes" ? state.refs.content : "none", category: "identity" },
        { label: "id", value: state.parts.contentId, category: "identity" },
        { label: "tag", value: state.parts.contentTag, category: "identity" },
        { label: "Props", value: state.parts.contentProps, category: "composition" },
        { label: "data-positioned", value: state.parts.contentPositioned, category: "data" },
        { label: "data-slot", value: state.parts.contentSlot, category: "data" },
        { label: "data-state", value: state.parts.contentState, category: "data" },
        { label: "aria-describedby", value: state.parts.contentDescribedBy, category: "aria" },
        { label: "aria-label", value: state.parts.contentAriaLabel, category: "aria" },
        { label: "aria-labelledby", value: state.parts.contentLabelledBy, category: "aria" },
        { label: "aria-modal", value: state.parts.contentAriaModal, category: "aria" },
        { label: "role", value: state.parts.contentRole, category: "aria" },
        { label: "Body overflow", value: state.parts.bodyScrollLock, category: "behavior" },
        { label: "Focused", value: state.parts.contentFocused, category: "behavior" },
        { label: "Hidden", value: state.parts.contentHidden, category: "state" },
      ],
    },
    {
      title: "Title",
      selector: "[data-dialog-title]",
      inactive: state.parts.titleExists !== "yes",
      summary: state.parts.titleExists === "yes" ? state.parts.titleId : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.titleExists, category: "presence" },
        { label: "Ref", value: state.parts.titleExists === "yes" ? state.refs.title : "none", category: "identity" },
        { label: "id", value: state.parts.titleId, category: "identity" },
        { label: "tag", value: state.parts.titleTag, category: "identity" },
        { label: "Props", value: state.parts.titleProps, category: "composition" },
        { label: "data-slot", value: state.parts.titleSlot, category: "data" },
        { label: "Matches label", value: state.parts.titleMatches, category: "aria" },
      ],
    },
    {
      title: "Description",
      selector: "[data-dialog-description]",
      inactive: state.parts.descriptionExists !== "yes",
      summary: state.parts.descriptionExists === "yes" ? state.parts.descriptionId : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.descriptionExists, category: "presence" },
        { label: "Ref", value: state.parts.descriptionExists === "yes" ? state.refs.description : "none", category: "identity" },
        { label: "id", value: state.parts.descriptionId, category: "identity" },
        { label: "Props", value: state.parts.descriptionProps, category: "composition" },
        { label: "data-slot", value: state.parts.descriptionSlot, category: "data" },
        { label: "Matches description", value: state.parts.descriptionMatches, category: "aria" },
      ],
    },
    {
      title: "Close",
      summary: state.parts.saveCloseExists === "yes" || state.parts.cancelCloseExists === "yes" ? "available" : "not rendered",
      inactive: state.parts.saveCloseExists !== "yes" && state.parts.cancelCloseExists !== "yes",
      groups: [
        {
          title: "Cancel button",
          selector: "[data-dialog-cancel-close]",
          rows: [
            { label: "Exists", value: state.parts.cancelCloseExists, category: "presence" },
            { label: "tag", value: state.parts.cancelCloseTag, category: "identity" },
            { label: "Composition", value: "default", category: "composition" },
            { label: "data-slot", value: state.parts.cancelCloseSlot, category: "data" },
            { label: "role", value: state.parts.cancelCloseRole, category: "aria" },
            { label: "tabindex attr", value: state.parts.cancelCloseTabIndex, category: "aria" },
          ],
        },
        {
          title: "Save button",
          selector: "[data-dialog-save-close]",
          rows: [
            { label: "Exists", value: state.parts.saveCloseExists, category: "presence" },
            { label: "Ref", value: state.parts.saveCloseExists === "yes" ? state.refs.saveClose : "none", category: "identity" },
            { label: "tag", value: state.parts.saveCloseTag, category: "identity" },
            { label: "Props", value: state.parts.saveCloseProps, category: "composition" },
            { label: "Composition", value: state.closeComposition, category: "composition" },
            { label: "data-slot", value: state.parts.saveCloseSlot, category: "data" },
            { label: "role", value: state.parts.saveCloseRole, category: "aria" },
            { label: "tabindex attr", value: state.parts.saveCloseTabIndex, category: "aria" },
          ],
        },
      ],
    },
  ];

  return (
    <AnatomyPanel
      footer="8 parts"
      onOpenGroupsChange={onOpenGroupsChange}
      openGroups={openGroups}
      sections={sections}
    />
  );
}

export function DialogScenarioLog({
  state,
}: {
  state: DialogScenarioState;
}) {
  return (
    <div className="scenario-log">
      <ScrollArea.Root className="event-log" orientation="vertical">
        <ScrollArea.Viewport
          className="event-log-viewport"
          focusable
          aria-label="Event log"
        >
        <ol>
          {state.log.map((entry) => (
            <li key={entry.id}>
              <time>{entry.time}</time>
              <span>{entry.text}</span>
            </li>
          ))}
        </ol>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
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
    <Menubar.Root className="canvas-toolbar" aria-label="Dialog controls">
      <ToolbarGroup title="State" value="state">
        <MenuSection label="Root">
          <MenuCheckboxControl
            checked={state.controlled}
            label="Controlled"
            value="controlled"
            onChange={actions.setControlled}
          />
          <MenuCheckboxControl
            checked={state.disabled}
            label="Disabled"
            value="disabled"
            onChange={actions.setDisabled}
          />
          <MenuCheckboxControl
            checked={state.keepMounted}
            label="Keep mounted"
            value="keep-mounted"
            onChange={actions.setKeepMounted}
          />
        </MenuSection>
        <MenuSection label="Focus">
          <MenuCheckboxControl
            checked={state.noFocusableContent}
            label="No focusables"
            value="no-focusables"
            onChange={actions.setNoFocusableContent}
          />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Dismiss" value="dismiss">
        <MenuSection label="Close behavior">
          <MenuCheckboxControl
            checked={state.closeOnEscape}
            label="Escape closes"
            value="escape-closes"
            onChange={actions.setCloseOnEscape}
          />
          <MenuCheckboxControl
            checked={state.closeOnBackdropClick}
            label="Backdrop closes"
            value="backdrop-closes"
            onChange={actions.setCloseOnBackdropClick}
          />
        </MenuSection>
        <MenuSection label="Blocked events">
          <MenuCheckboxControl
            checked={state.blockTriggerEvent}
            label="Block trigger event"
            value="block-trigger-event"
            onChange={actions.setBlockTriggerEvent}
          />
          <MenuCheckboxControl
            checked={state.blockSaveClose}
            label="Block save close"
            value="block-save-close"
            onChange={actions.setBlockSaveClose}
          />
          <MenuCheckboxControl
            checked={state.blockBackdropClose}
            label="Block backdrop close"
            value="block-backdrop-close"
            onChange={actions.setBlockBackdropClose}
          />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="ARIA" value="aria">
        <MenuSection label="Content naming">
          <MenuCheckboxControl
            checked={state.useAriaLabel}
            label="Use ariaLabel"
            value="use-aria-label"
            onChange={actions.setUseAriaLabel}
          />
        </MenuSection>
        <MenuRadioControl
          label="Role"
          options={dialogRoleOptions}
          value={state.contentRole}
          onChange={actions.setContentRole}
        />
        <MenuRadioControl
          label="Title as"
          options={headingLevelOptions}
          value={state.titleHeadingLevel}
          onChange={actions.setTitleHeadingLevel}
        />
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioControl
          label="Trigger"
          options={compositionOptions}
          value={state.triggerComposition}
          onChange={actions.setTriggerComposition}
        />
        <MenuRadioControl
          label="Save button"
          options={compositionOptions}
          value={state.closeComposition}
          onChange={actions.setCloseComposition}
        />
        <MenuSection label="Props">
          <MenuCheckboxControl
            checked={state.overrideSlots}
            label="Override slots"
            value="override-slots"
            onChange={actions.setOverrideSlots}
          />
        </MenuSection>
      </ToolbarGroup>
    </Menubar.Root>
  );
}

function ToolbarGroup({
  children,
  title,
  value,
}: {
  children: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <Menubar.Menu closeOnSelect={false} value={value}>
      <Menubar.Trigger
        className="toolbar-group-trigger"
      >
        <span>{title}</span>
      </Menubar.Trigger>
      <Menubar.Content className="toolbar-menu" sideOffset={4}>
        {children}
      </Menubar.Content>
    </Menubar.Menu>
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

function MenuSection({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="toolbar-menu-section">
      <div className="toolbar-menu-label">{label}</div>
      <div className="toolbar-menu-items">{children}</div>
    </div>
  );
}

function MenuRadioControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="toolbar-menu-section">
      <div className="toolbar-menu-label">{label}</div>
      <Menubar.RadioGroup
        className="toolbar-radio-group"
        value={value}
        onValueChange={(nextValue) => onChange(nextValue as T)}
      >
        {options.map((option) => (
          <Menubar.RadioItem
            className="toolbar-menu-item"
            key={option}
            value={option}
          >
            <span>{option}</span>
            <span className="toolbar-menu-check" aria-hidden="true">
              {option === value ? "✓" : ""}
            </span>
          </Menubar.RadioItem>
        ))}
      </Menubar.RadioGroup>
    </div>
  );
}

const compositionOptions: readonly DialogCompositionMode[] = ["default", "asChild", "render"];
const dialogRoleOptions: readonly DialogContentRole[] = ["dialog", "alertdialog"];
const headingLevelOptions: readonly DialogHeadingLevel[] = ["h1", "h2", "h3", "h4", "h5", "h6"];

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
