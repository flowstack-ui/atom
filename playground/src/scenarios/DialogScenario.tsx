import { Button } from "@flowstack-ui/atom/button";
import { Dialog } from "@flowstack-ui/atom/dialog";
import { Field } from "@flowstack-ui/atom/field";
import { Input } from "@flowstack-ui/atom/input";
import { Modal } from "@flowstack-ui/atom/modal";
import { Select } from "@flowstack-ui/atom/select";
import { createPortal } from "react-dom";
import { useCallback, useRef } from "react";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import {
  ControlToolbar,
  MenuCheckboxControl,
  MenuRadioControl,
  MenuSection,
  partProps,
  PropsToolbarGroup,
  ScenarioEventLog,
  ToolbarGroup,
} from "../WorkbenchPrimitives";
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
  DialogFinalFocusMode,
  DialogHeadingLevel,
  DialogInitialFocusMode,
  DialogNameMode,
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
  const workflowTargetRef = useRef<HTMLButtonElement | null>(null);
  const rootProps = state.controlled
    ? {
        open: state.open,
        onOpenChange,
      }
    : {
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
      {state.finalFocusMode === "workflow" ? (
        <Button.Root
          className="behind-dialog-button"
          data-playground-dialog-behind
          ref={workflowTargetRef}
        >
          Workflow target
        </Button.Root>
      ) : null}
      <Dialog.Root
        {...rootProps}
        disabled={state.disabled || undefined}
        keepMounted={state.keepMounted || undefined}
        closeOnEscape={state.closeOnEscape ? undefined : false}
        closeOnBackdropClick={state.closeOnBackdropClick ? undefined : false}
      >
        <DialogTriggerExample
          elementRef={triggerRef}
          mode={state.triggerComposition}
          onClick={actions.handleTriggerClick}
          onKeyDown={actions.handleTriggerKeyDown}
          propCheck={state.propCheck}
          customSlot={state.customTriggerSlot}
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
            data-playground-dialog-overlay=""
            data-playground-inspect=""
            {...partProps("overlay", { propCheck: state.propCheck, customSlot: state.customOverlaySlot }, "dialog-overlay-custom")}
            id="dialog-overlay-prop"
            onClick={actions.handleOverlayClick}
            ref={overlayRef}
            title="overlay prop"
          />
          <Dialog.Content
            aria-label={state.nameMode === "native" ? "Project settings" : undefined}
            ariaLabel={state.nameMode === "compatibility" ? "Project settings" : undefined}
            className="atom-dialog-content"
            data-playground-dialog-content=""
            data-playground-inspect=""
            {...partProps("content", { propCheck: state.propCheck, customSlot: state.customContentSlot }, "dialog-content-custom")}
            ref={contentRef}
            role={state.contentRole === "dialog" ? undefined : state.contentRole}
            initialFocus={state.initialFocusMode === "content"
              ? () => document.querySelector<HTMLElement>("[data-playground-dialog-content]")
              : state.initialFocusMode === "name"
                ? () => document.querySelector<HTMLInputElement>("[data-playground-dialog-name]")
                : undefined}
            finalFocus={state.finalFocusMode === "workflow"
              ? workflowTargetRef
              : state.finalFocusMode === "none"
                ? false
                : undefined}
            title="content prop"
          >
            {state.nameMode === "title" ? (
              <Dialog.Title
                as={state.titleHeadingLevel === "h2" ? undefined : state.titleHeadingLevel}
                data-playground-dialog-title=""
                {...partProps("title", { propCheck: state.propCheck, customSlot: state.customTitleSlot }, "dialog-title-custom")}
                ref={titleRef}
                title="title prop"
              >
                Project settings
              </Dialog.Title>
            ) : null}
            {state.showDescription ? (
              <Dialog.Description
                data-playground-dialog-description=""
                {...partProps("description", { propCheck: state.propCheck, customSlot: state.customDescriptionSlot }, "dialog-description-custom")}
                ref={descriptionRef}
                title="description prop"
              >
                Change a setting, tab through the controls, press Escape, or close the dialog.
              </Dialog.Description>
            ) : null}
            {state.noFocusableContent ? (
              <p className="dialog-static-note">
                No focusable controls are rendered in this mode.
              </p>
            ) : (
              <>
                <Field.Root className="dialog-form-row" id="dialog-name-field">
                  <Field.Label>Name</Field.Label>
                  <Input.Root
                    autoFocus={state.initialFocusMode === "autoFocus"}
                    data-playground-dialog-name=""
                    defaultValue="Atom Playground"
                  />
                </Field.Root>
                <Field.Root className="dialog-form-row" id="dialog-mode-field">
                  <Field.Label>Mode</Field.Label>
                  <Select.Root defaultValue="manual">
                    <Select.Trigger className="atom-select-trigger">
                      <Select.Value />
                      <Select.Icon>▾</Select.Icon>
                    </Select.Trigger>
                    <Select.Content className="atom-select-content" aria-label="Mode">
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
                  {state.finalFocusMode === "workflow" ? (
                    <Button.Root
                      className="atom-button secondary"
                      onPress={actions.testFocusEscape}
                    >
                      Test focus escape
                    </Button.Root>
                  ) : null}
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
                    data-playground-dialog-cancel-close=""
                    {...partProps("cancel-close", { propCheck: state.propCheck, customSlot: state.customCloseSlot }, "dialog-close-custom")}
                    onClick={() => actions.markCloseSource("cancel")}
                  >
                    Cancel
                  </Dialog.Close>
                  <DialogCloseExample
                    className="atom-button"
                    elementRef={saveCloseRef}
                    mode={state.closeComposition}
                    onClick={actions.handleSaveCloseClick}
                    propCheck={state.propCheck}
                    customSlot={state.customCloseSlot}
                  >
                    Save
                  </DialogCloseExample>
                </div>
                {state.showNestedDialog ? (
                  <Dialog.Root>
                    <Dialog.Trigger className="atom-button secondary">
                      Open nested dialog
                    </Dialog.Trigger>
                    <Dialog.Portal>
                      <Dialog.Overlay className="atom-dialog-overlay nested-dialog-overlay" />
                      <Dialog.Content
                        aria-label="Nested dialog"
                        className="atom-dialog-content nested-dialog-content"
                        data-playground-nested-dialog=""
                      >
                        <p>Only the top nested modal owns focus, dismissal, scrolling, and isolation.</p>
                        <Dialog.Close className="atom-button">Close nested dialog</Dialog.Close>
                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
                ) : null}
                {state.showThirdPartyBranch
                  ? createPortal(
                      <Modal.Branch asChild>
                        <section
                          className="dialog-third-party-branch"
                          data-playground-dialog-branch=""
                        >
                          <strong>Consumer portal</strong>
                          <button type="button">Third-party action</button>
                          <p>Scroll and focus remain owned by the modal.</p>
                        </section>
                      </Modal.Branch>,
                      document.body,
                    )
                  : null}
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
        { label: "Name mode", value: state.nameMode, category: "state" },
        { label: "Description", value: state.showDescription ? "rendered" : "omitted", category: "state" },
        { label: "Initial focus", value: state.initialFocusMode, category: "state" },
        { label: "Final focus", value: state.finalFocusMode, category: "state" },
        { label: "Third-party branch", value: state.showThirdPartyBranch ? "rendered" : "off", category: "state" },
        { label: "Nested dialog", value: state.showNestedDialog ? "available" : "off", category: "state" },
        { label: "Title as", value: state.titleHeadingLevel, category: "state" },
      ],
    },
    {
      title: "Trigger",
      selector: "[data-playground-dialog-trigger]",
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
      selector: "[data-playground-dialog-overlay]",
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
      selector: "[data-playground-dialog-content]",
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
        { label: "Background inert", value: state.parts.backgroundInert, category: "behavior" },
        { label: "Focused", value: state.parts.contentFocused, category: "behavior" },
        { label: "Hidden", value: state.parts.contentHidden, category: "state" },
      ],
    },
    {
      title: "Modal Branch",
      selector: "[data-playground-dialog-branch]",
      inactive: state.parts.branchExists !== "yes",
      summary: state.parts.branchExists === "yes" ? "consumer portal" : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.branchExists, category: "presence" },
        { label: "Effectively inert", value: state.parts.branchInert, category: "behavior" },
        { label: "Tab contract", value: "delegated", category: "behavior" },
        { label: "Scroll ownership", value: "allowed", category: "behavior" },
      ],
    },
    {
      title: "Title",
      selector: "[data-playground-dialog-title]",
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
      selector: "[data-playground-dialog-description]",
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
          selector: "[data-playground-dialog-cancel-close]",
          rows: [
            { label: "Exists", value: state.parts.cancelCloseExists, category: "presence" },
            { label: "tag", value: state.parts.cancelCloseTag, category: "identity" },
            { label: "Composition", value: "default", category: "composition" },
            { label: "data-slot", value: state.parts.cancelCloseSlot, category: "data" },
            { label: "role", value: state.parts.cancelCloseRole, category: "aria" },
          ],
        },
        {
          title: "Save button",
          selector: "[data-playground-dialog-save-close]",
          rows: [
            { label: "Exists", value: state.parts.saveCloseExists, category: "presence" },
            { label: "Ref", value: state.parts.saveCloseExists === "yes" ? state.refs.saveClose : "none", category: "identity" },
            { label: "tag", value: state.parts.saveCloseTag, category: "identity" },
            { label: "Props", value: state.parts.saveCloseProps, category: "composition" },
            { label: "Composition", value: state.closeComposition, category: "composition" },
            { label: "data-slot", value: state.parts.saveCloseSlot, category: "data" },
            { label: "role", value: state.parts.saveCloseRole, category: "aria" },
          ],
        },
      ],
    },
  ];

  return (
    <AnatomyPanel
      footer="9 parts"
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
  return <ScenarioEventLog log={state.log} />;
}

export function DialogScenarioToolbar({
  state,
  actions,
}: {
  state: DialogScenarioState;
  actions: DialogScenarioActions;
}) {
  return (
    <ControlToolbar label="Dialog controls">
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
          <MenuRadioControl
            label="Initial focus"
            options={initialFocusOptions}
            value={state.initialFocusMode}
            onChange={actions.setInitialFocusMode}
          />
          <MenuRadioControl
            label="Final focus"
            options={finalFocusOptions}
            value={state.finalFocusMode}
            onChange={actions.setFinalFocusMode}
          />
        </MenuSection>
        <MenuSection label="Infrastructure">
          <MenuCheckboxControl
            checked={state.showThirdPartyBranch}
            label="Third-party branch"
            value="third-party-branch"
            onChange={actions.setShowThirdPartyBranch}
          />
          <MenuCheckboxControl
            checked={state.showNestedDialog}
            label="Nested dialog"
            value="nested-dialog"
            onChange={actions.setShowNestedDialog}
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
          <MenuRadioControl
            label="Accessible name"
            options={nameModeOptions}
            value={state.nameMode}
            onChange={actions.setNameMode}
          />
          <MenuCheckboxControl
            checked={state.showDescription}
            label="Description"
            value="description"
            onChange={actions.setShowDescription}
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
      </ToolbarGroup>
      <PropsToolbarGroup
        propCheck={state.propCheck}
        onPropCheckChange={actions.setPropCheck}
        customSlots={[
          { checked: state.customTriggerSlot, label: "Trigger slot", value: "trigger-slot", onChange: actions.setCustomTriggerSlot },
          { checked: state.customOverlaySlot, label: "Overlay slot", value: "overlay-slot", onChange: actions.setCustomOverlaySlot },
          { checked: state.customContentSlot, label: "Content slot", value: "content-slot", onChange: actions.setCustomContentSlot },
          { checked: state.customTitleSlot, label: "Title slot", value: "title-slot", onChange: actions.setCustomTitleSlot },
          { checked: state.customDescriptionSlot, label: "Description slot", value: "description-slot", onChange: actions.setCustomDescriptionSlot },
          { checked: state.customCloseSlot, label: "Close slot", value: "close-slot", onChange: actions.setCustomCloseSlot },
        ]}
      />
    </ControlToolbar>
  );
}

const compositionOptions: readonly DialogCompositionMode[] = ["default", "asChild", "render"];
const dialogRoleOptions: readonly DialogContentRole[] = ["dialog", "alertdialog"];
const headingLevelOptions: readonly DialogHeadingLevel[] = ["h1", "h2", "h3", "h4", "h5", "h6"];
const nameModeOptions: readonly DialogNameMode[] = ["title", "native", "compatibility"];
const initialFocusOptions: readonly DialogInitialFocusMode[] = ["default", "content", "name", "autoFocus"];
const finalFocusOptions: readonly DialogFinalFocusMode[] = ["trigger", "workflow", "none"];

function DialogTriggerExample({
  elementRef,
  mode,
  onClick,
  onKeyDown,
  propCheck,
  customSlot,
}: {
  elementRef: (element: HTMLElement | null) => void;
  mode: DialogCompositionMode;
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  propCheck: boolean;
  customSlot: boolean;
}) {
  if (mode === "asChild") {
    return (
      <Dialog.Trigger
        className="atom-button"
        data-playground-dialog-trigger=""
        {...partProps("trigger", { propCheck, customSlot }, "dialog-trigger-custom")}
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
        data-playground-dialog-trigger=""
        {...partProps("trigger", { propCheck, customSlot }, "dialog-trigger-custom")}
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
      data-playground-dialog-trigger=""
      {...partProps("trigger", { propCheck, customSlot }, "dialog-trigger-custom")}
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
  propCheck,
  customSlot,
}: {
  children: ReactNode;
  className: string;
  elementRef: (element: HTMLElement | null) => void;
  mode: DialogCompositionMode;
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
  propCheck: boolean;
  customSlot: boolean;
}) {
  if (mode === "asChild") {
    return (
      <Dialog.Close
        className={className}
        {...partProps("save-close", { propCheck, customSlot }, "dialog-close-custom")}
        id="dialog-save-close-prop"
        name="dialog-save-close-name"
        ref={elementRef}
        title="save close prop"
        asChild
        onClick={onClick}
      >
        <span className="composition-control" data-playground-dialog-save-close="">
          {children}
        </span>
      </Dialog.Close>
    );
  }

  if (mode === "render") {
    return (
      <Dialog.Close
        className={className}
        data-playground-dialog-save-close=""
        {...partProps("save-close", { propCheck, customSlot }, "dialog-close-custom")}
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
      data-playground-dialog-save-close=""
      {...partProps("save-close", { propCheck, customSlot }, "dialog-close-custom")}
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
