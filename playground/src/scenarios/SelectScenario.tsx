import { Button } from "@flowstack-ui/atom/button";
import { Dialog } from "@flowstack-ui/atom/dialog";
import { Field } from "@flowstack-ui/atom/field";
import { Select } from "@flowstack-ui/atom/select";
import { useRef } from "react";
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
  RefAttributes,
  SetStateAction,
} from "react";
import type {
  SelectCompositionMode,
  SelectScenarioActions,
  SelectScenarioState,
} from "./useSelectScenario";

export function SelectScenarioCanvas({
  state,
  actions,
}: {
  state: SelectScenarioState;
  actions: SelectScenarioActions;
}) {
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const ListboxPart = state.useListboxAlias ? Select.Listbox : Select.Content;
  const rootProps = {
    ...(state.valueControlled
      ? { value: state.controlValue }
      : state.noValue
        ? {}
        : { defaultValue: "pro" }),
    ...(state.openControlled ? { open: state.open } : { defaultOpen: false }),
    disabled: state.disabled ? true : undefined,
    required: state.required ? true : undefined,
    name: "plan",
    form: "select-test-form",
    onOpenChange: actions.handleOpenChange,
    onValueChange: actions.handleValueChange,
  };
  const listbox = (
    <ListboxPart
      ariaLabel={state.useAriaLabel ? "Plans" : undefined}
      className="atom-select-content playground-select-content"
      container={!state.usePortalWrapper && state.useCustomContainer ? portalContainerRef.current : undefined}
      data-playground-inspect=""
      data-select-listbox=""
      {...partProps("listbox", { propCheck: state.propCheck, customSlot: state.customContentSlot }, "select-content-custom")}
      disablePortal={state.disablePortal}
      title="listbox prop"
      ref={(element) => actions.markPartRef("listbox", element)}
    >
      {state.showArrow ? (
        <Select.Arrow
          className="playground-select-arrow"
          data-select-arrow=""
          {...partProps("arrow", { propCheck: state.propCheck, customSlot: state.customArrowSlot }, "select-arrow-custom")}
          title="arrow prop"
          ref={(element) => actions.markPartRef("arrow", element)}
        />
      ) : null}
      {state.showScrollButtons ? (
        <Select.ScrollUpButton
          className="playground-select-scroll-button"
          data-select-scroll-up=""
          {...partProps("scroll-up", { propCheck: state.propCheck, customSlot: state.customScrollUpSlot }, "select-scroll-up-custom")}
          title="scroll up prop"
          ref={(element) => actions.markPartRef("scrollUpButton", element)}
          onClick={() => actions.addUserLog("scroll up user onClick")}
        >
          Up
        </Select.ScrollUpButton>
      ) : null}
      <Select.Viewport
        className="atom-select-viewport playground-select-viewport"
        data-select-viewport=""
        {...partProps("viewport", { propCheck: state.propCheck, customSlot: state.customViewportSlot }, "select-viewport-custom")}
        title="viewport prop"
        ref={(element) => actions.markPartRef("viewport", element)}
      >
        <Select.Group
          data-select-group=""
          {...partProps("group", { propCheck: state.propCheck, customSlot: state.customGroupSlot }, "select-group-custom")}
          title="group prop"
          ref={(element) => actions.markPartRef("group", element)}
        >
          <Select.Label
            className="playground-select-label"
            data-select-label=""
            {...partProps("label", { propCheck: state.propCheck, customSlot: state.customLabelSlot }, "select-label-custom")}
            title="label prop"
            ref={(element) => actions.markPartRef("label", element)}
          >
            Plans
          </Select.Label>
          <Select.Separator
            className="playground-select-separator"
            data-select-separator=""
            {...partProps("separator", { propCheck: state.propCheck, customSlot: state.customSeparatorSlot }, "select-separator-custom")}
            title="separator prop"
            ref={(element) => actions.markPartRef("separator", element)}
          />
          {getSelectItems(state.longList, state.rawItemText).map((item) => (
            <Select.Item
              className="atom-select-item playground-select-item"
              data-select-item=""
              {...partProps("item", { propCheck: state.propCheck, customSlot: state.customItemSlot }, "select-item-custom")}
              data-select-raw-item={item.raw ? "" : undefined}
              data-testid={`select-item-${item.value}`}
              disabled={item.disabled}
              key={item.value}
              label={item.label}
              title={`${item.label} item prop`}
              value={item.value}
              ref={(element) => {
                if (element?.getAttribute("data-state") === "checked") {
                  actions.markPartRef("selectedItem", element);
                }
                if (element?.hasAttribute("data-select-raw-item")) {
                  actions.markPartRef("rawItem", element);
                }
                if (item.disabled) {
                  actions.markPartRef("disabledItem", element);
                }
              }}
              onClick={actions.handleItemClick(item.value)}
              onPointerMove={actions.handleItemPointerMove(item.value)}
              onPointerLeave={actions.handleItemPointerLeave(item.value)}
            >
              {item.raw ? item.visible : (
                <>
                  <Select.ItemText
                    data-select-item-text=""
                    {...partProps("item-text", { propCheck: state.propCheck, customSlot: state.customItemTextSlot }, "select-item-text-custom")}
                    title="item text prop"
                    ref={(element) => actions.markPartRef("itemText", element)}
                  >
                    {item.visible}
                  </Select.ItemText>
                  <Select.ItemIndicator
                    className="playground-select-indicator"
                    data-select-indicator=""
                    {...partProps("indicator", { propCheck: state.propCheck, customSlot: state.customIndicatorSlot }, "select-indicator-custom")}
                    forceMount={state.forceMountIndicator}
                    title="indicator prop"
                    ref={(element) => actions.markPartRef("itemIndicator", element)}
                  >
                    ✓
                  </Select.ItemIndicator>
                </>
              )}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Viewport>
      {state.showScrollButtons ? (
        <Select.ScrollDownButton
          className="playground-select-scroll-button"
          data-select-scroll-down=""
          {...partProps("scroll-down", { propCheck: state.propCheck, customSlot: state.customScrollDownSlot }, "select-scroll-down-custom")}
          title="scroll down prop"
          ref={(element) => actions.markPartRef("scrollDownButton", element)}
          onClick={() => actions.addUserLog("scroll down user onClick")}
        >
          Down
        </Select.ScrollDownButton>
      ) : null}
    </ListboxPart>
  );
  const content = (
    <div className={["select-demo", state.edgePosition ? "edge-position" : ""].filter(Boolean).join(" ")}>
      <form id="select-test-form" />
      {state.openControlled ? (
        <div className="select-demo-actions">
          <Button.Root
            className="atom-button secondary"
            onPress={() => actions.setControlledOpen(true)}
          >
            Open controlled
          </Button.Root>
          <Button.Root
            className="atom-button secondary"
            onPress={() => actions.setControlledOpen(false)}
          >
            Close controlled
          </Button.Root>
        </div>
      ) : null}
      <Select.Root key={state.noValue ? "empty" : "default"} {...rootProps}>
        <SelectTriggerExample
          mode={state.triggerComposition}
          onClick={actions.handleTriggerClick}
          onKeyDown={actions.handleTriggerKeyDown}
          refCallback={(element) => actions.markPartRef("trigger", element)}
          valueRefCallback={(element) => actions.markPartRef("value", element)}
          iconRefCallback={(element) => actions.markPartRef("icon", element)}
          customValueChildren={state.customValueChildren}
          triggerAriaLabel={state.triggerAriaLabel}
          useTriggerIdProp={state.useTriggerIdProp}
          propCheck={state.propCheck}
          customTriggerSlot={state.customTriggerSlot}
          customValueSlot={state.customValueSlot}
          customIconSlot={state.customIconSlot}
        />
        {state.usePortalWrapper ? (
          <Select.Portal container={state.useCustomContainer ? portalContainerRef.current : undefined}>
            {listbox}
          </Select.Portal>
        ) : listbox}
      </Select.Root>
      {state.useCustomContainer ? (
        <div
          className="select-portal-target"
          data-select-custom-container=""
          ref={portalContainerRef}
        />
      ) : null}
    </div>
  );

  const fieldContent = !state.fieldWrapped ? content : (
    <Field.Root
      className={["select-field", state.edgePosition ? "edge-position" : ""].filter(Boolean).join(" ")}
      id="select-plan-field"
      disabled={state.disabled || state.fieldDisabled}
      required={state.required || state.fieldRequired}
    >
      <Field.Label>Plan</Field.Label>
      <Field.Description>Choose one plan for the test form.</Field.Description>
      {content}
    </Field.Root>
  );

  if (!state.insideDialog) return fieldContent;

  return (
    <Dialog.Root
      open={state.insideDialog}
      closeOnBackdropClick={false}
      onOpenChange={actions.setInsideDialog}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="atom-dialog-overlay" />
        <Dialog.Content
          className="atom-dialog-content select-dialog-host"
          aria-label="Select modal host"
        >
          <Dialog.Title className="dialog-title">Select in dialog</Dialog.Title>
          <Dialog.Description className="dialog-description">
            Portalled Select content should remain inside the modal focus scope.
          </Dialog.Description>
          <div className="dialog-actions">
            <Dialog.Close className="atom-button secondary">
              Close dialog
            </Dialog.Close>
          </div>
          {fieldContent}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function SelectScenarioToolbar({
  state,
  actions,
}: {
  state: SelectScenarioState;
  actions: SelectScenarioActions;
}) {
  return (
    <ControlToolbar label="Select controls">
      <ToolbarGroup title="State" value="state">
        <MenuSection label="Root">
          <MenuCheckboxControl
            checked={state.valueControlled}
            label="Controlled value"
            value="controlled-value"
            onChange={actions.setValueControlled}
          />
          <MenuCheckboxControl
            checked={state.openControlled}
            label="Controlled open"
            value="controlled-open"
            onChange={actions.setOpenControlled}
          />
          <MenuCheckboxControl
            checked={state.disabled}
            label="Disabled"
            value="disabled"
            onChange={actions.setDisabled}
          />
          <MenuCheckboxControl
            checked={state.required}
            label="Required"
            value="required"
            onChange={actions.setRequired}
          />
        </MenuSection>
        <MenuRadioControl
          label="Controlled value"
          options={selectValues}
          disabled={!state.valueControlled}
          value={state.controlValue}
          onChange={actions.setValue}
        />
        <MenuSection label="Test data">
          <MenuCheckboxControl
            checked={state.noValue}
            label="No value"
            value="no-value"
            onChange={actions.setNoValue}
          />
          <MenuCheckboxControl
            checked={state.longList}
            label="Long list"
            value="long-list"
            onChange={actions.setLongList}
          />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Field" value="field">
        <MenuSection label="Field root">
          <MenuCheckboxControl
            checked={state.fieldWrapped}
            label="Use Field"
            value="use-field"
            onChange={actions.setFieldWrapped}
          />
          <MenuCheckboxControl
            checked={state.fieldDisabled}
            label="Field disabled"
            value="field-disabled"
            onChange={actions.setFieldDisabled}
          />
          <MenuCheckboxControl
            checked={state.fieldRequired}
            label="Field required"
            value="field-required"
            onChange={actions.setFieldRequired}
          />
        </MenuSection>
        <MenuSection label="Trigger">
          <MenuCheckboxControl
            checked={state.triggerAriaLabel}
            label="ariaLabel prop"
            value="trigger-aria-label"
            onChange={actions.setTriggerAriaLabel}
          />
          <MenuCheckboxControl
            checked={state.useTriggerIdProp}
            label="id prop"
            value="trigger-id-prop"
            onChange={actions.setUseTriggerIdProp}
          />
        </MenuSection>
        <MenuSection label="Content">
          <MenuCheckboxControl
            checked={state.useAriaLabel}
            label="ariaLabel prop"
            value="use-aria-label"
            onChange={actions.setUseAriaLabel}
          />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Popup" value="popup">
        <MenuSection label="Portal">
          <MenuCheckboxControl
            checked={state.disablePortal}
            label="Disable portal"
            value="disable-portal"
            onChange={actions.setDisablePortal}
          />
          <MenuCheckboxControl
            checked={state.usePortalWrapper}
            label="Portal wrapper"
            value="portal-wrapper"
            onChange={actions.setUsePortalWrapper}
          />
          <MenuCheckboxControl
            checked={state.useCustomContainer}
            label="Custom container"
            value="custom-container"
            onChange={actions.setUseCustomContainer}
          />
        </MenuSection>
        <MenuSection label="Position">
          <MenuCheckboxControl
            checked={state.edgePosition}
            label="Edge position"
            value="edge-position"
            onChange={actions.setEdgePosition}
          />
        </MenuSection>
        <MenuSection label="Nesting">
          <MenuCheckboxControl
            checked={state.insideDialog}
            label="Inside Dialog"
            value="inside-dialog"
            onChange={actions.setInsideDialog}
          />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioControl
          label="Trigger"
          options={compositionOptions}
          value={state.triggerComposition}
          onChange={actions.setTriggerComposition}
        />
        <MenuSection label="Parts">
          <MenuCheckboxControl
            checked={state.useListboxAlias}
            label="Use Listbox alias"
            value="use-listbox-alias"
            onChange={actions.setUseListboxAlias}
          />
          <MenuCheckboxControl
            checked={state.showScrollButtons}
            label="Scroll buttons"
            value="scroll-buttons"
            onChange={actions.setShowScrollButtons}
          />
          <MenuCheckboxControl
            checked={state.showArrow}
            label="Arrow"
            value="arrow"
            onChange={actions.setShowArrow}
          />
        </MenuSection>
        <MenuSection label="Rendering">
          <MenuCheckboxControl
            checked={state.customValueChildren}
            label="Custom value text"
            value="custom-value-text"
            onChange={actions.setCustomValueChildren}
          />
          <MenuCheckboxControl
            checked={state.rawItemText}
            label="Raw item text"
            value="raw-item-text"
            onChange={actions.setRawItemText}
          />
          <MenuCheckboxControl
            checked={state.forceMountIndicator}
            label="Force indicator"
            value="force-indicator"
            onChange={actions.setForceMountIndicator}
          />
        </MenuSection>
        <MenuSection label="Events">
          <MenuCheckboxControl
            checked={state.logItemPointer}
            label="Log item pointer"
            value="log-item-pointer"
            onChange={actions.setLogItemPointer}
          />
          <MenuCheckboxControl
            checked={state.blockTriggerEvent}
            label="Block trigger event"
            value="block-trigger-event"
            onChange={actions.setBlockTriggerEvent}
          />
        </MenuSection>
      </ToolbarGroup>
      <PropsToolbarGroup
        propCheck={state.propCheck}
        onPropCheckChange={actions.setPropCheck}
        customSlots={[
          { checked: state.customTriggerSlot, label: "Trigger slot", value: "trigger-slot", onChange: actions.setCustomTriggerSlot },
          { checked: state.customValueSlot, label: "Value slot", value: "value-slot", onChange: actions.setCustomValueSlot },
          { checked: state.customIconSlot, label: "Icon slot", value: "icon-slot", onChange: actions.setCustomIconSlot },
          { checked: state.customContentSlot, label: "Content slot", value: "content-slot", onChange: actions.setCustomContentSlot },
          { checked: state.customViewportSlot, label: "Viewport slot", value: "viewport-slot", onChange: actions.setCustomViewportSlot },
          { checked: state.customGroupSlot, label: "Group slot", value: "group-slot", onChange: actions.setCustomGroupSlot },
          { checked: state.customLabelSlot, label: "Label slot", value: "label-slot", onChange: actions.setCustomLabelSlot },
          { checked: state.customItemSlot, label: "Item slot", value: "item-slot", onChange: actions.setCustomItemSlot },
          { checked: state.customItemTextSlot, label: "Item Text slot", value: "item-text-slot", onChange: actions.setCustomItemTextSlot },
          { checked: state.customIndicatorSlot, label: "Indicator slot", value: "indicator-slot", onChange: actions.setCustomIndicatorSlot },
          { checked: state.customSeparatorSlot, label: "Separator slot", value: "separator-slot", onChange: actions.setCustomSeparatorSlot },
          { checked: state.customArrowSlot, label: "Arrow slot", value: "arrow-slot", onChange: actions.setCustomArrowSlot },
          { checked: state.customScrollUpSlot, label: "Scroll Up slot", value: "scroll-up-slot", onChange: actions.setCustomScrollUpSlot },
          { checked: state.customScrollDownSlot, label: "Scroll Down slot", value: "scroll-down-slot", onChange: actions.setCustomScrollDownSlot },
        ]}
      />
    </ControlToolbar>
  );
}

export function SelectScenarioAnatomy({
  openGroups,
  state,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  state: SelectScenarioState;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const sections: AnatomySection[] = [
    {
      title: "Root",
      summary: state.valueControlled || state.openControlled ? "controlled" : "uncontrolled",
      rows: [
        { label: "Disabled", value: state.parts.disabled, category: "state" },
        { label: "Field", value: state.parts.fieldWrapped, category: "state" },
        { label: "Field disabled", value: state.parts.fieldDisabled, category: "state" },
        { label: "Field required", value: state.parts.fieldRequired, category: "state" },
        { label: "Label", value: state.parts.valueLabel, category: "state" },
        { label: "Open", value: state.parts.open, category: "state" },
        { label: "Open mode", value: state.parts.rootOpenMode, category: "state" },
        { label: "Required", value: state.parts.required, category: "state" },
        { label: "Value", value: state.parts.value, category: "state" },
        { label: "Value mode", value: state.parts.rootValueMode, category: "state" },
      ],
      groups: [
        {
          title: "Generated hidden input",
          selector: "input[name='plan']",
          rows: [
            { label: "Exists", value: state.parts.hiddenInputExists, category: "presence" },
            { label: "form", value: state.parts.hiddenInputForm, category: "identity" },
            { label: "name", value: state.parts.hiddenInputName, category: "identity" },
            { label: "value", value: state.parts.hiddenInputValue, category: "state" },
            { label: "Disabled", value: state.parts.hiddenInputDisabled, category: "state" },
          ],
        },
      ],
    },
    {
      title: "Trigger",
      selector: "[data-select-trigger]",
      summary: state.parts.triggerState,
      rows: [
        { label: "Exists", value: state.parts.triggerExists, category: "presence" },
        { label: "Ref", value: state.refs.trigger, category: "identity" },
        { label: "Class", value: state.parts.triggerClass, category: "identity" },
        { label: "id", value: state.parts.triggerId, category: "identity" },
        { label: "tag", value: state.parts.triggerTag, category: "identity" },
        { label: "type", value: state.parts.triggerType, category: "identity" },
        { label: "Composition", value: state.triggerComposition, category: "composition" },
        { label: "Props", value: state.parts.triggerProps, category: "composition" },
        { label: "data-disabled", value: state.parts.triggerDataDisabled, category: "data" },
        { label: "data-slot", value: state.parts.triggerSlot, category: "data" },
        { label: "data-state", value: state.parts.triggerState, category: "data" },
        { label: "Active match", value: state.parts.triggerActiveDescendantMatch, category: "aria" },
        { label: "aria-activedescendant", value: state.parts.triggerActiveDescendant, category: "aria" },
        { label: "aria-controls", value: state.parts.triggerControls, category: "aria" },
        { label: "aria-describedby", value: state.parts.triggerDescribedBy, category: "aria" },
        { label: "aria-expanded", value: state.parts.triggerExpanded, category: "aria" },
        { label: "aria-haspopup", value: state.parts.triggerHasPopup, category: "aria" },
        { label: "aria-label", value: state.parts.triggerLabel, category: "aria" },
        { label: "aria-labelledby", value: state.parts.triggerLabelledBy, category: "aria" },
        { label: "aria-required", value: state.parts.triggerRequired, category: "aria" },
        { label: "Controls match", value: state.parts.triggerControlsMatch, category: "aria" },
        { label: "Disabled", value: state.parts.triggerDisabled, category: "state" },
        { label: "role", value: state.parts.triggerRole, category: "aria" },
        { label: "tabindex attr", value: state.parts.triggerTabIndex, category: "aria" },
      ],
    },
    {
      title: "Value",
      selector: "[data-select-value]",
      summary: state.parts.valueText,
      rows: [
        { label: "Exists", value: state.parts.valueExists, category: "presence" },
        { label: "Ref", value: state.refs.value, category: "identity" },
        { label: "Props", value: state.parts.valueProps, category: "composition" },
        { label: "data-slot", value: state.parts.valueSlot, category: "data" },
        { label: "Placeholder", value: state.parts.valuePlaceholder, category: "state" },
        { label: "Text", value: state.parts.valueText, category: "state" },
      ],
    },
    {
      title: "Icon",
      selector: "[data-select-icon]",
      summary: state.parts.iconExists === "yes" ? "decorative" : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.iconExists, category: "presence" },
        { label: "Ref", value: state.refs.icon, category: "identity" },
        { label: "Props", value: state.parts.iconProps, category: "composition" },
        { label: "data-slot", value: state.parts.iconSlot, category: "data" },
        { label: "aria-hidden", value: state.parts.iconHidden, category: "aria" },
      ],
    },
    {
      title: "Portal",
      inactive: state.parts.listboxExists !== "yes",
      summary: state.parts.listboxExists === "yes" ? state.parts.listboxParent : "not rendered",
      rows: [
        { label: "Content exists", value: state.parts.listboxExists, category: "presence" },
        { label: "Content parent", value: state.parts.listboxParent, category: "behavior" },
        { label: "Custom container", value: state.parts.listboxInCustomContainer, category: "behavior" },
        { label: "Inside canvas", value: state.parts.listboxInCanvas, category: "behavior" },
      ],
    },
    {
      title: "Content",
      selector: "[data-select-listbox]",
      inactive: state.parts.listboxExists !== "yes",
      summary: state.parts.listboxExists === "yes" ? state.parts.listboxState : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.listboxExists, category: "presence" },
        { label: "Ref", value: state.refs.listbox, category: "identity" },
        { label: "Class", value: state.parts.listboxClass, category: "identity" },
        { label: "id", value: state.parts.listboxId, category: "identity" },
        { label: "Rendered as", value: state.parts.listboxAlias, category: "composition" },
        { label: "Props", value: state.parts.listboxProps, category: "composition" },
        { label: "data-positioned", value: state.parts.listboxPositioned, category: "data" },
        { label: "data-slot", value: state.parts.listboxSlot, category: "data" },
        { label: "data-state", value: state.parts.listboxState, category: "data" },
        { label: "aria-label", value: state.parts.listboxLabel, category: "aria" },
        { label: "role", value: state.parts.listboxRole, category: "aria" },
        { label: "tabindex attr", value: state.parts.listboxTabIndex, category: "aria" },
        { label: "Min width match", value: state.parts.listboxMinWidthMatch, category: "behavior" },
      ],
    },
    {
      title: "Scroll Up Button",
      selector: "[data-select-scroll-up]",
      inactive: state.parts.scrollUpExists !== "yes",
      summary: state.parts.scrollUpExists === "yes" ? state.refs.scrollUpButton : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.scrollUpExists, category: "presence" },
        { label: "Ref", value: state.refs.scrollUpButton, category: "identity" },
        { label: "Props", value: state.parts.scrollUpProps, category: "composition" },
        { label: "data-slot", value: state.parts.scrollUpSlot, category: "data" },
        { label: "aria-hidden", value: state.parts.scrollUpHidden, category: "aria" },
        { label: "tabindex attr", value: state.parts.scrollUpTabIndex, category: "aria" },
      ],
    },
    {
      title: "Viewport",
      selector: "[data-select-viewport]",
      inactive: state.parts.viewportExists !== "yes",
      summary: state.parts.viewportExists === "yes" ? state.refs.viewport : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.viewportExists, category: "presence" },
        { label: "Ref", value: state.refs.viewport, category: "identity" },
        { label: "Props", value: state.parts.viewportProps, category: "composition" },
        { label: "data-slot", value: state.parts.viewportSlot, category: "data" },
        { label: "scrollTop", value: state.parts.viewportScrollTop, category: "behavior" },
      ],
    },
    {
      title: "Group",
      selector: "[data-select-group]",
      inactive: state.parts.groupExists !== "yes",
      summary: state.parts.groupExists === "yes" ? state.parts.groupRole : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.groupExists, category: "presence" },
        { label: "Ref", value: state.refs.group, category: "identity" },
        { label: "Props", value: state.parts.groupProps, category: "composition" },
        { label: "data-slot", value: state.parts.groupSlot, category: "data" },
        { label: "aria-labelledby", value: state.parts.groupLabelledBy, category: "aria" },
        { label: "Label match", value: state.parts.groupLabelMatch, category: "aria" },
        { label: "role", value: state.parts.groupRole, category: "aria" },
      ],
    },
    {
      title: "Label",
      selector: "[data-select-label]",
      inactive: state.parts.labelExists !== "yes",
      summary: state.parts.labelExists === "yes" ? state.parts.labelId : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.labelExists, category: "presence" },
        { label: "Ref", value: state.refs.label, category: "identity" },
        { label: "id", value: state.parts.labelId, category: "identity" },
        { label: "Props", value: state.parts.labelProps, category: "composition" },
        { label: "data-slot", value: state.parts.labelSlot, category: "data" },
      ],
    },
    {
      title: "Item",
      inactive: state.parts.selectedItemExists !== "yes" && state.parts.highlightedItemExists !== "yes" && state.parts.rawItemExists !== "yes" && state.parts.disabledItemExists !== "yes",
      summary: state.parts.selectedItemExists === "yes" ? state.parts.selectedItemValue : "not rendered",
      groups: [
        {
          title: "Selected item",
          selector: "[data-select-item][data-state='checked']",
          rows: [
            { label: "Exists", value: state.parts.selectedItemExists, category: "presence" },
            { label: "Ref", value: state.refs.selectedItem, category: "identity" },
            { label: "Class", value: state.parts.selectedItemClass, category: "identity" },
            { label: "Props", value: state.parts.selectedItemProps, category: "composition" },
            { label: "data-slot", value: state.parts.selectedItemSlot, category: "data" },
            { label: "data-state", value: state.parts.selectedItemState, category: "data" },
            { label: "data-value", value: state.parts.selectedItemValue, category: "data" },
            { label: "aria-labelledby", value: state.parts.selectedItemLabelledBy, category: "aria" },
            { label: "aria-selected", value: state.parts.selectedItemSelected, category: "aria" },
            { label: "Highlighted", value: state.parts.selectedItemHighlighted, category: "state" },
          ],
        },
        {
          title: "Highlighted item",
          selector: "[data-select-item][data-highlighted]",
          rows: [
            { label: "Exists", value: state.parts.highlightedItemExists, category: "presence" },
            { label: "data-state", value: state.parts.highlightedItemState, category: "data" },
            { label: "data-value", value: state.parts.highlightedItemValue, category: "data" },
            { label: "aria-selected", value: state.parts.highlightedItemSelected, category: "aria" },
          ],
        },
        {
          title: "Raw item",
          selector: "[data-select-raw-item]",
          rows: [
            { label: "Exists", value: state.parts.rawItemExists, category: "presence" },
            { label: "Ref", value: state.refs.rawItem, category: "identity" },
            { label: "data-value", value: state.parts.rawItemValue, category: "data" },
            { label: "aria-labelledby", value: state.parts.rawItemLabelledBy, category: "aria" },
          ],
        },
        {
          title: "Disabled item",
          selector: "[data-select-item][data-disabled]",
          rows: [
            { label: "Exists", value: state.parts.disabledItemExists, category: "presence" },
            { label: "Ref", value: state.refs.disabledItem, category: "identity" },
            { label: "data-state", value: state.parts.disabledItemState, category: "data" },
            { label: "aria-disabled", value: state.parts.disabledItemDisabled, category: "aria" },
          ],
        },
      ],
    },
    {
      title: "Item Text",
      selector: "[data-select-item-text]",
      inactive: state.parts.itemTextExists !== "yes",
      summary: state.parts.itemTextExists === "yes" ? state.refs.itemText : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.itemTextExists, category: "presence" },
        { label: "Ref", value: state.refs.itemText, category: "identity" },
        { label: "Props", value: state.parts.itemTextProps, category: "composition" },
        { label: "data-slot", value: state.parts.itemTextSlot, category: "data" },
      ],
    },
    {
      title: "Item Indicator",
      selector: "[data-select-indicator][data-state='checked']",
      inactive: state.parts.itemIndicatorExists !== "yes",
      summary: state.parts.itemIndicatorExists === "yes" ? state.parts.itemIndicatorState : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.itemIndicatorExists, category: "presence" },
        { label: "Unchecked exists", value: state.parts.uncheckedIndicatorExists, category: "presence" },
        { label: "Ref", value: state.refs.itemIndicator, category: "identity" },
        { label: "Props", value: state.parts.itemIndicatorProps, category: "composition" },
        { label: "data-slot", value: state.parts.itemIndicatorSlot, category: "data" },
        { label: "data-state", value: state.parts.itemIndicatorState, category: "data" },
        { label: "aria-hidden", value: state.parts.itemIndicatorHidden, category: "aria" },
      ],
    },
    {
      title: "Separator",
      selector: "[data-select-separator]",
      inactive: state.parts.separatorExists !== "yes",
      summary: state.parts.separatorExists === "yes" ? state.parts.separatorRole : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.separatorExists, category: "presence" },
        { label: "Ref", value: state.refs.separator, category: "identity" },
        { label: "Props", value: state.parts.separatorProps, category: "composition" },
        { label: "data-slot", value: state.parts.separatorSlot, category: "data" },
        { label: "aria-orientation", value: state.parts.separatorOrientation, category: "aria" },
        { label: "role", value: state.parts.separatorRole, category: "aria" },
      ],
    },
    {
      title: "Scroll Down Button",
      selector: "[data-select-scroll-down]",
      inactive: state.parts.scrollDownExists !== "yes",
      summary: state.parts.scrollDownExists === "yes" ? state.refs.scrollDownButton : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.scrollDownExists, category: "presence" },
        { label: "Ref", value: state.refs.scrollDownButton, category: "identity" },
        { label: "Props", value: state.parts.scrollDownProps, category: "composition" },
        { label: "data-slot", value: state.parts.scrollDownSlot, category: "data" },
        { label: "aria-hidden", value: state.parts.scrollDownHidden, category: "aria" },
        { label: "tabindex attr", value: state.parts.scrollDownTabIndex, category: "aria" },
      ],
    },
    {
      title: "Arrow",
      selector: "[data-select-arrow]",
      inactive: state.parts.arrowExists !== "yes",
      summary: state.parts.arrowExists === "yes" ? "decorative" : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.arrowExists, category: "presence" },
        { label: "Ref", value: state.refs.arrow, category: "identity" },
        { label: "Props", value: state.parts.arrowProps, category: "composition" },
        { label: "data-slot", value: state.parts.arrowSlot, category: "data" },
        { label: "aria-hidden", value: state.parts.arrowHidden, category: "aria" },
      ],
    },
  ];

  return (
    <AnatomyPanel
      footer="16 groups"
      onOpenGroupsChange={onOpenGroupsChange}
      openGroups={openGroups}
      sections={sections}
    />
  );
}

export function SelectScenarioLog({
  state,
}: {
  state: SelectScenarioState;
}) {
  return <ScenarioEventLog log={state.log} />;
}

function SelectTriggerExample({
  mode,
  onClick,
  onKeyDown,
  refCallback,
  valueRefCallback,
  iconRefCallback,
  customValueChildren,
  triggerAriaLabel,
  useTriggerIdProp,
  propCheck,
  customTriggerSlot,
  customValueSlot,
  customIconSlot,
}: {
  mode: SelectCompositionMode;
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  refCallback: (element: HTMLElement | null) => void;
  valueRefCallback: (element: HTMLElement | null) => void;
  iconRefCallback: (element: HTMLElement | null) => void;
  customValueChildren: boolean;
  triggerAriaLabel: boolean;
  useTriggerIdProp: boolean;
  propCheck: boolean;
  customTriggerSlot: boolean;
  customValueSlot: boolean;
  customIconSlot: boolean;
}) {
  const triggerProps = {
    className: "atom-select-trigger playground-select-trigger",
    "data-select-trigger": "",
    ...partProps("trigger", { propCheck, customSlot: customTriggerSlot }, "select-trigger-custom"),
    ...(triggerAriaLabel ? { ariaLabel: "Plan selector" } : {}),
    ...(useTriggerIdProp ? { id: "select-trigger-prop" } : {}),
    name: "select-trigger-name",
    title: "trigger prop",
    onClick,
    onKeyDown,
  };
  const valueElement = (
    <Select.Value
      data-select-value=""
      {...partProps("value", { propCheck, customSlot: customValueSlot }, "select-value-custom")}
      placeholder="Choose plan"
      ref={valueRefCallback}
      title="value prop"
    >
      {customValueChildren ? "Custom plan text" : undefined}
    </Select.Value>
  );
  const iconElement = (
    <Select.Icon
      data-select-icon=""
      {...partProps("icon", { propCheck, customSlot: customIconSlot }, "select-icon-custom")}
      ref={iconRefCallback}
      title="icon prop"
    >
      ▾
    </Select.Icon>
  );

  if (mode === "asChild") {
    return (
      <Select.Trigger
        {...triggerProps}
        ref={refCallback}
        asChild
      >
        <span className="composition-control">
          {valueElement}
          {iconElement}
        </span>
      </Select.Trigger>
    );
  }

  if (mode === "render") {
    return (
      <Select.Trigger
        {...triggerProps}
        ref={refCallback}
        render={renderCompositionControl}
      >
        {valueElement}
        {iconElement}
      </Select.Trigger>
    );
  }

  return (
    <Select.Trigger
      {...triggerProps}
      ref={refCallback}
    >
      {valueElement}
      {iconElement}
    </Select.Trigger>
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

type SelectTestItem = {
  value: string;
  label: string;
  visible: string;
  disabled?: boolean;
  raw?: boolean;
};

function getSelectItems(longList: boolean, rawItemText: boolean): SelectTestItem[] {
  const items: SelectTestItem[] = [
    { value: "starter", label: "Starter", visible: "Starter" },
    { value: "pro", label: "Pro", visible: "Pro" },
    { value: "team", label: "Team", visible: "Team", disabled: true },
    { value: "enterprise", label: "Enterprise", visible: "Enterprise" },
  ];

  const rawItems = rawItemText
    ? [
      { value: "labeled", label: "Label Alias", visible: "Visible Alias", raw: true },
      { value: "solo", label: "Solo Raw", visible: "Solo Raw", raw: true },
    ]
    : [];

  if (!longList) return [...items, ...rawItems];

  return [
    ...items,
    ...rawItems,
    { value: "scale", label: "Scale", visible: "Scale" },
    { value: "global", label: "Global", visible: "Global" },
    { value: "agency", label: "Agency", visible: "Agency" },
    { value: "internal", label: "Internal", visible: "Internal" },
    { value: "sandbox", label: "Sandbox", visible: "Sandbox" },
    { value: "archive", label: "Archive", visible: "Archive", disabled: true },
    { value: "custom", label: "Custom", visible: "Custom" },
    { value: "priority", label: "Priority", visible: "Priority" },
  ];
}

const selectValues = ["starter", "pro", "enterprise"] as const;
const compositionOptions: readonly SelectCompositionMode[] = ["default", "asChild", "render"];
