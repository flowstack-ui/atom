import { Button } from "@flowstack-ui/atom/button";
import { Dialog } from "@flowstack-ui/atom/dialog";
import { ContextMenu, useContextMenuContext } from "@flowstack-ui/atom/context-menu";
import { Direction } from "@flowstack-ui/atom/direction";
import { useEffect, type ReactNode } from "react";
import {
  AnatomyPanel,
  type AnatomyRow,
  type AnatomySection,
} from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup, partProps } from "../WorkbenchPrimitives";
import type { Dispatch, SetStateAction } from "react";
import type {
  ContextMenuAlign,
  ContextMenuItemCompositionMode,
  ContextMenuScenarioActions,
  ContextMenuScenarioState,
  ContextMenuSide,
} from "./useContextMenuScenario";

export function ContextMenuScenarioCanvas({
  state,
  actions,
}: {
  state: ContextMenuScenarioState;
  actions: ContextMenuScenarioActions;
}) {
  const rootProps = {
    ...(state.controlled ? { open: state.open } : { defaultOpen: state.defaultOpen }),
    modal: state.modal,
    closeOnSelect: state.closeOnSelect,
    closeOnEscape: state.closeOnEscape,
    loop: state.loop,
    onOpenChange: actions.handleOpenChange,
  };

  const menuDemo = (
    <div className="menu-demo">
      <ContextMenu.Root
        key={state.controlled ? "controlled" : `uncontrolled-${state.defaultOpen}`}
        {...rootProps}
      >
        <ContextMenuDefaultAnchor enabled={!state.controlled && state.defaultOpen} />
        <ContextMenuControlledActions state={state} actions={actions} />
        <ContextMenuTrigger
          mode={state.triggerComposition}
          disabled={state.triggerDisabled}
          data-context-menu-trigger=""
          {...partProps("trigger", { propCheck: state.propCheck, customSlot: state.customTriggerSlot }, "context-menu-trigger-custom")}
          onContextMenu={actions.handleTriggerContextMenu}
          onKeyDown={actions.handleTriggerKeyDown}
        >
          <span className="context-menu-target-title">Project canvas</span>
          <span className="context-menu-target-copy">Right-click or press Shift+F10</span>
        </ContextMenuTrigger>
        <ContextMenu.Content
          ariaLabel={state.contentAriaLabel ? "Project actions" : undefined}
          className="playground-menu-content"
          data-menu-content=""
          {...partProps("content", { propCheck: state.propCheck, customSlot: state.customContentSlot }, "context-menu-content-custom")}
          data-playground-inspect=""
          side={state.side}
          align={state.align}
          sideOffset={state.sideOffset}
          loop={state.contentLoopOff ? false : undefined}
          onKeyDownCapture={actions.handleContentKeyDownCapture}
          ref={(element) => actions.markPartRef("content", element)}
        >
          <ContextMenu.Group
            className="playground-menu-group"
            data-menu-group=""
            {...partProps("group", { propCheck: state.propCheck, customSlot: state.customGroupSlot }, "context-menu-group-custom")}
          >
            <ContextMenuActionItem
              mode={state.itemComposition}
              value="new"
              disabled={false}
              data-menu-item-primary=""
              {...partProps("item", { propCheck: state.propCheck, customSlot: state.customItemSlot }, "context-menu-item-custom")}
              onSelect={() => actions.handleActionSelect("new")}
              onClick={actions.handleActionClick("new")}
              onPointerEnter={() => actions.handlePointer("new", "enter")}
              onPointerLeave={() => actions.handlePointer("new", "leave")}
            >
              New project
            </ContextMenuActionItem>
            {state.showDisabledItem ? (
              <ContextMenu.Item
                className="playground-menu-item"
                value="disabled"
                disabled
                data-menu-item-disabled=""
              >
                Disabled action
              </ContextMenu.Item>
            ) : null}
          </ContextMenu.Group>
          <ContextMenu.Separator
            className="playground-menu-separator"
            data-menu-separator=""
            {...partProps("separator", { propCheck: state.propCheck, customSlot: state.customSeparatorSlot }, "context-menu-separator-custom")}
          />
          <ContextMenu.CheckboxItem
            className="playground-menu-item"
            value="grid"
            textValue="Show grid"
            checked={state.checkboxChecked}
            disabled={state.checkboxDisabled}
            closeOnSelect={state.closeCheckboxOnSelect}
            data-menu-checkbox=""
            {...partProps("checkbox-item", { propCheck: state.propCheck, customSlot: state.customCheckboxItemSlot }, "context-menu-checkbox-item-custom")}
            onCheckedChange={actions.handleCheckboxChange}
          >
            <span>Show grid</span>
            <span className="playground-menu-check" aria-hidden="true" />
          </ContextMenu.CheckboxItem>
          <ContextMenu.Separator
            className="playground-menu-separator"
            data-menu-selection-separator=""
          />
          <ContextMenu.RadioGroup
            className="playground-menu-radio-group"
            value={state.radioValue}
            data-menu-radio-group=""
            {...partProps("radio-group", { propCheck: state.propCheck, customSlot: state.customRadioGroupSlot }, "context-menu-radio-group-custom")}
            onValueChange={actions.handleRadioChange}
          >
            <ContextMenu.RadioItem
              className="playground-menu-item"
              value="compact"
              textValue="Compact"
              disabled={state.radioItemDisabled}
              closeOnSelect={state.closeRadioOnSelect}
              data-menu-radio-item=""
              {...partProps("radio-item", { propCheck: state.propCheck, customSlot: state.customRadioItemSlot }, "context-menu-radio-item-custom")}
            >
              <span>Compact</span>
              <span className="playground-menu-radio" aria-hidden="true" />
            </ContextMenu.RadioItem>
            <ContextMenu.RadioItem
              className="playground-menu-item"
              value="comfortable"
              textValue="Comfortable"
              closeOnSelect={state.closeRadioOnSelect}
              data-menu-radio-item=""
            >
              <span>Comfortable</span>
              <span className="playground-menu-radio" aria-hidden="true" />
            </ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
          <ContextMenu.Separator
            className="playground-menu-separator"
            data-menu-radio-separator=""
          />
          <ContextMenu.RadioGroup
            className="playground-menu-radio-group"
            value={state.radioValueSecondary}
            data-menu-radio-group-secondary=""
            {...partProps("radio-group-secondary", { propCheck: state.propCheck, customSlot: state.customRadioGroupSlot }, "context-menu-radio-group-custom")}
            onValueChange={actions.handleRadioSecondaryChange}
          >
            <ContextMenu.RadioItem
              className="playground-menu-item"
              value="compact"
              textValue="Dense compact"
              closeOnSelect={state.closeRadioOnSelect}
              data-menu-radio-item-secondary=""
              {...partProps("radio-item-secondary", { propCheck: state.propCheck, customSlot: state.customRadioItemSlot }, "context-menu-radio-item-custom")}
            >
              <span>Dense compact</span>
              <span className="playground-menu-radio" aria-hidden="true" />
            </ContextMenu.RadioItem>
            <ContextMenu.RadioItem
              className="playground-menu-item"
              value="comfortable"
              textValue="Dense comfortable"
              closeOnSelect={state.closeRadioOnSelect}
              data-menu-radio-item-secondary=""
            >
              <span>Dense comfortable</span>
              <span className="playground-menu-radio" aria-hidden="true" />
            </ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
          {state.showSubmenu ? (
            <>
              <ContextMenu.Separator
                className="playground-menu-separator"
                data-menu-submenu-separator=""
              />
              <ContextMenu.Sub
                {...(state.controlledSubmenu
                  ? { open: state.subOpen, onOpenChange: actions.handleSubOpenChange }
                  : { defaultOpen: state.defaultSubmenuOpen })}
              >
                <ContextMenu.SubTrigger
                  className="playground-menu-item"
                  value="more"
                  textValue="More actions"
                  data-menu-sub-trigger=""
                  {...partProps("sub-trigger", { propCheck: state.propCheck, customSlot: state.customSubTriggerSlot }, "context-menu-sub-trigger-custom")}
                >
                  <span>More actions</span>
                  <span className="playground-menu-sub-arrow" aria-hidden="true">›</span>
                </ContextMenu.SubTrigger>
                <ContextMenu.SubContent
                  className="playground-menu-content playground-submenu-content"
                  ariaLabel={state.subContentAriaLabel ? "More actions" : undefined}
                  sideOffset={state.subSideOffset}
                  loop={state.subContentLoopOff ? false : undefined}
                  data-menu-sub-content=""
                  {...partProps("sub-content", { propCheck: state.propCheck, customSlot: state.customSubContentSlot }, "context-menu-sub-content-custom")}
                  data-playground-inspect=""
                  ref={(element) => actions.markPartRef("subContent", element)}
                >
                  <ContextMenu.Item
                    className="playground-menu-item"
                    value="archive"
                    data-menu-sub-item=""
                    {...partProps("sub-item", { propCheck: state.propCheck, customSlot: state.customSubItemSlot }, "context-menu-sub-item-custom")}
                    onSelect={() => actions.handleActionSelect("archive")}
                  >
                    Archive
                  </ContextMenu.Item>
                  <ContextMenu.Item
                    className="playground-menu-item"
                    value="duplicate"
                    data-menu-sub-item-extra=""
                    {...partProps("sub-item-extra", { propCheck: state.propCheck, customSlot: state.customSubItemSlot }, "context-menu-sub-item-custom")}
                    onSelect={() => actions.handleActionSelect("duplicate")}
                  >
                    Duplicate
                  </ContextMenu.Item>
                  {state.showNestedSubmenu ? (
                    <ContextMenu.Sub>
                      <ContextMenu.SubTrigger
                        className="playground-menu-item"
                        value="advanced"
                        textValue="Advanced"
                        data-menu-nested-sub-trigger=""
                        {...partProps("nested-sub-trigger", { propCheck: state.propCheck, customSlot: state.customSubTriggerSlot }, "context-menu-sub-trigger-custom")}
                      >
                        <span>Advanced</span>
                        <span className="playground-menu-sub-arrow" aria-hidden="true">›</span>
                      </ContextMenu.SubTrigger>
                      <ContextMenu.SubContent
                        className="playground-menu-content playground-submenu-content"
                        data-menu-nested-sub-content=""
                        {...partProps("nested-sub-content", { propCheck: state.propCheck, customSlot: state.customSubContentSlot }, "context-menu-sub-content-custom")}
                        data-playground-inspect=""
                        ref={(element) => actions.markPartRef("nestedSubContent", element)}
                      >
                        <ContextMenu.Item
                          className="playground-menu-item"
                          value="export"
                          data-menu-nested-sub-item=""
                          {...partProps("nested-sub-item", { propCheck: state.propCheck, customSlot: state.customSubItemSlot }, "context-menu-sub-item-custom")}
                          onSelect={() => actions.handleActionSelect("export")}
                        >
                          Export
                        </ContextMenu.Item>
                      </ContextMenu.SubContent>
                    </ContextMenu.Sub>
                  ) : null}
                </ContextMenu.SubContent>
              </ContextMenu.Sub>
              <ContextMenu.Sub
                defaultOpen={false}
              >
                <ContextMenu.SubTrigger
                  className="playground-menu-item"
                  value="share"
                  textValue="Share actions"
                  disabled={state.disableSecondSubmenu}
                  data-menu-sub-trigger-secondary=""
                  {...partProps("sub-trigger-secondary", { propCheck: state.propCheck, customSlot: state.customSubTriggerSlot }, "context-menu-sub-trigger-custom")}
                >
                  <span>Share actions</span>
                  <span className="playground-menu-sub-arrow" aria-hidden="true">›</span>
                </ContextMenu.SubTrigger>
                <ContextMenu.SubContent
                  className="playground-menu-content playground-submenu-content"
                  sideOffset={state.subSideOffset}
                  data-menu-sub-content-secondary=""
                  {...partProps("sub-content-secondary", { propCheck: state.propCheck, customSlot: state.customSubContentSlot }, "context-menu-sub-content-custom")}
                  data-playground-inspect=""
                  ref={(element) => actions.markPartRef("subContentSecondary", element)}
                >
                  <ContextMenu.Item
                    className="playground-menu-item"
                    value="copy-link"
                    data-menu-sub-item-secondary=""
                    {...partProps("sub-item-secondary", { propCheck: state.propCheck, customSlot: state.customSubItemSlot }, "context-menu-sub-item-custom")}
                    onSelect={() => actions.handleActionSelect("copy-link")}
                  >
                    Copy link
                  </ContextMenu.Item>
                </ContextMenu.SubContent>
              </ContextMenu.Sub>
            </>
          ) : null}
        </ContextMenu.Content>
      </ContextMenu.Root>
    </div>
  );

  const directedMenuDemo = (
    <Direction.Provider dir={state.dir}>
      {menuDemo}
    </Direction.Provider>
  );

  if (!state.insideDialog) return directedMenuDemo;

  return (
    <Dialog.Root
      open={state.insideDialog}
      closeOnBackdropClick={false}
      onOpenChange={actions.setInsideDialog}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="atom-dialog-overlay" />
        <Dialog.Content
          className="atom-dialog-content menu-dialog-host"
          aria-label="Context Menu modal host"
        >
          <Dialog.Title className="dialog-title">Context Menu in dialog</Dialog.Title>
          <Dialog.Description className="dialog-description">
            Portalled Context Menu content should remain inside the modal focus scope.
          </Dialog.Description>
          <div className="dialog-actions">
            <Dialog.Close className="atom-button secondary">
              Close dialog
            </Dialog.Close>
          </div>
          {directedMenuDemo}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ContextMenuDefaultAnchor({ enabled }: { enabled: boolean }) {
  const { setAnchorPoint } = useContextMenuContext();

  useEffect(() => {
    if (!enabled) return;

    const frame = requestAnimationFrame(() => {
      const trigger = document.querySelector<HTMLElement>("[data-context-menu-trigger]");
      const target = trigger?.firstElementChild instanceof HTMLElement
        ? trigger.firstElementChild
        : trigger;
      const rect = target?.getBoundingClientRect();
      if (!rect) return;

      setAnchorPoint({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [enabled, setAnchorPoint]);

  return null;
}

function ContextMenuControlledActions({
  state,
  actions,
}: {
  state: ContextMenuScenarioState;
  actions: ContextMenuScenarioActions;
}) {
  const { setAnchorPoint } = useContextMenuContext();

  const openFromTarget = () => {
    const trigger = document.querySelector<HTMLElement>("[data-context-menu-trigger]");
    const target = trigger?.firstElementChild instanceof HTMLElement
      ? trigger.firstElementChild
      : trigger;
    const rect = target?.getBoundingClientRect();
    if (rect) {
      setAnchorPoint({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    actions.setControlledOpen(true);
  };

  return (
    <div className="menu-demo-actions">
      <Button.Root
        className="atom-button secondary"
        disabled={!state.controlled || state.open}
        onPress={openFromTarget}
      >
        Open Menu
      </Button.Root>
      <Button.Root
        className="atom-button secondary"
        disabled={!state.controlled || !state.open}
        onPress={() => actions.setControlledOpen(false)}
      >
        Close Menu
      </Button.Root>
      {state.controlledSubmenu ? (
        <Button.Root
          className="atom-button secondary"
          onPress={() => actions.setControlledSubmenuOpen(!state.subOpen)}
        >
          {state.subOpen ? "Close Submenu" : "Open Submenu"}
        </Button.Root>
      ) : null}
    </div>
  );
}

export function ContextMenuScenarioToolbar({
  state,
  actions,
}: {
  state: ContextMenuScenarioState;
  actions: ContextMenuScenarioActions;
}) {
  return (
    <ControlToolbar label="Context Menu controls">
      <ToolbarGroup title="State" value="state">
        <MenuSection label="Root">
          <MenuCheckboxControl checked={state.controlled} label="Controlled" value="controlled" onChange={actions.setControlled} />
          <MenuCheckboxControl checked={state.defaultOpen} label="Default open" value="default-open" onChange={actions.setDefaultOpen} />
          <MenuCheckboxControl checked={state.modal} label="Modal" value="modal" onChange={actions.setModal} />
          <MenuCheckboxControl checked={state.closeOnSelect} label="Close on select" value="close-on-select" onChange={actions.setCloseOnSelect} />
          <MenuCheckboxControl checked={state.closeOnEscape} label="Escape closes" value="escape-closes" onChange={actions.setCloseOnEscape} />
          <MenuCheckboxControl checked={state.loop} label="Loop" value="loop" onChange={actions.setLoop} />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Popup" value="popup">
        <MenuRadioControl label="Side" options={sideOptions} value={state.side} onChange={actions.setSide} />
        <MenuRadioControl label="Align" options={alignOptions} value={state.align} onChange={actions.setAlign} />
        <MenuRadioControl label="Direction" options={directionOptions} value={state.dir} onChange={actions.setDir} />
        <MenuSection label="Position">
          <MenuCheckboxControl checked={state.sideOffset === 16} label="Large offset" value="large-offset" onChange={(checked) => actions.setSideOffset(checked ? 16 : 4)} />
          <MenuCheckboxControl checked={state.contentAriaLabel} label="Content ariaLabel" value="content-aria-label" onChange={actions.setContentAriaLabel} />
          <MenuCheckboxControl checked={state.contentLoopOff} label="Content loop off" value="content-loop-off" onChange={actions.setContentLoopOff} />
          <MenuCheckboxControl checked={state.blockContentKeyDown} label="Block content keys" value="block-content-keys" onChange={actions.setBlockContentKeyDown} />
        </MenuSection>
        <MenuSection label="Nesting">
          <MenuCheckboxControl checked={state.insideDialog} label="Inside Dialog" value="inside-dialog" onChange={actions.setInsideDialog} />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Items" value="items">
        <MenuSection label="Selection">
          <MenuCheckboxControl checked={state.checkboxChecked} label="Checkbox checked" value="checkbox-checked" onChange={actions.setCheckboxChecked} />
          <MenuCheckboxControl checked={state.checkboxDisabled} label="Checkbox disabled" value="checkbox-disabled" onChange={actions.setCheckboxDisabled} />
          <MenuCheckboxControl checked={state.closeCheckboxOnSelect} label="Checkbox closes" value="checkbox-closes" onChange={actions.setCloseCheckboxOnSelect} />
          <MenuCheckboxControl checked={state.closeRadioOnSelect} label="Radio closes" value="radio-closes" onChange={actions.setCloseRadioOnSelect} />
        </MenuSection>
        <MenuRadioControl label="Radio value" options={radioOptions} value={state.radioValue} onChange={actions.setRadioValue} />
        <MenuRadioControl label="Radio value 2" options={radioOptions} value={state.radioValueSecondary} onChange={actions.setRadioValueSecondary} />
        <MenuSection label="Availability">
          <MenuCheckboxControl checked={state.showDisabledItem} label="Show disabled item" value="show-disabled-item" onChange={actions.setShowDisabledItem} />
          <MenuCheckboxControl checked={state.radioItemDisabled} label="Compact radio disabled" value="compact-radio-disabled" onChange={actions.setRadioItemDisabled} />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Submenu" value="submenu">
        <MenuSection label="Sub">
          <MenuCheckboxControl checked={state.showSubmenu} label="Show submenu" value="show-submenu" onChange={actions.setShowSubmenu} />
          <MenuCheckboxControl checked={state.disableSecondSubmenu} label="Disable share submenu" value="disable-second-submenu" onChange={actions.setDisableSecondSubmenu} />
          <MenuCheckboxControl checked={state.controlledSubmenu} label="Controlled submenu" value="controlled-submenu" onChange={actions.setControlledSubmenu} />
          <MenuCheckboxControl checked={state.defaultSubmenuOpen} label="Default sub open" value="default-sub-open" onChange={actions.setDefaultSubmenuOpen} />
          <MenuCheckboxControl checked={state.subContentAriaLabel} label="Sub ariaLabel" value="sub-aria-label" onChange={actions.setSubContentAriaLabel} />
          <MenuCheckboxControl checked={state.subSideOffset === 12} label="Large sub offset" value="large-sub-offset" onChange={(checked) => actions.setSubSideOffset(checked ? 12 : 4)} />
          <MenuCheckboxControl checked={state.subContentLoopOff} label="Sub loop off" value="sub-loop-off" onChange={actions.setSubContentLoopOff} />
          <MenuCheckboxControl checked={state.showNestedSubmenu} label="Nested submenu" value="nested-submenu" onChange={actions.setShowNestedSubmenu} />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioControl label="Trigger" options={compositionOptions} value={state.triggerComposition} onChange={actions.setTriggerComposition} />
        <MenuRadioControl label="Item" options={compositionOptions} value={state.itemComposition} onChange={actions.setItemComposition} />
        <MenuSection label="Events">
          <MenuCheckboxControl checked={state.triggerDisabled} label="Disabled trigger" value="disabled-trigger" onChange={actions.setTriggerDisabled} />
          <MenuCheckboxControl checked={state.blockTriggerEvent} label="Block trigger event" value="block-trigger-event" onChange={actions.setBlockTriggerEvent} />
          <MenuCheckboxControl checked={state.blockItemSelect} label="Block item select" value="block-item-select" onChange={actions.setBlockItemSelect} />
          <MenuCheckboxControl checked={state.logPointer} label="Log pointer" value="log-pointer" onChange={actions.setLogPointer} />
        </MenuSection>
      </ToolbarGroup>
      <PropsToolbarGroup
        propCheck={state.propCheck}
        onPropCheckChange={actions.setPropCheck}
        customSlots={[
          { checked: state.customTriggerSlot, label: "Trigger Slot", value: "trigger-slot", onChange: actions.setCustomTriggerSlot },
          { checked: state.customContentSlot, label: "Content Slot", value: "content-slot", onChange: actions.setCustomContentSlot },
          { checked: state.customGroupSlot, label: "Group Slot", value: "group-slot", onChange: actions.setCustomGroupSlot },
          { checked: state.customItemSlot, label: "Item Slot", value: "item-slot", onChange: actions.setCustomItemSlot },
          { checked: state.customCheckboxItemSlot, label: "Checkbox Item Slot", value: "checkbox-item-slot", onChange: actions.setCustomCheckboxItemSlot },
          { checked: state.customRadioGroupSlot, label: "Radio Group Slot", value: "radio-group-slot", onChange: actions.setCustomRadioGroupSlot },
          { checked: state.customRadioItemSlot, label: "Radio Item Slot", value: "radio-item-slot", onChange: actions.setCustomRadioItemSlot },
          { checked: state.customSeparatorSlot, label: "Separator Slot", value: "separator-slot", onChange: actions.setCustomSeparatorSlot },
          { checked: state.customSubTriggerSlot, label: "Sub Trigger Slot", value: "sub-trigger-slot", onChange: actions.setCustomSubTriggerSlot },
          { checked: state.customSubContentSlot, label: "Sub Content Slot", value: "sub-content-slot", onChange: actions.setCustomSubContentSlot },
          { checked: state.customSubItemSlot, label: "Sub Item Slot", value: "sub-item-slot", onChange: actions.setCustomSubItemSlot },
        ]}
      />
    </ControlToolbar>
  );
}

export function ContextMenuScenarioAnatomy({
  state,
  openGroups,
  onOpenGroupsChange,
}: {
  state: ContextMenuScenarioState;
  openGroups: Record<string, boolean>;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const selectorExists = (selector: string) => Boolean(queryPlaygroundElement(selector));
  const selectorAttr = (selector: string, name: string, fallback = "none") => {
    return queryPlaygroundElement(selector)?.getAttribute(name) ?? fallback;
  };
  const partSection = ({
    title,
    selector,
    summary,
    rows,
    inactive,
  }: {
    title: string;
    selector: string;
    summary?: string;
    rows?: AnatomyRow[];
    inactive?: boolean;
  }): AnatomySection => {
    const exists = selectorExists(selector);

    return {
      title,
      selector,
      inactive: inactive ?? !exists,
      summary: summary ?? (exists ? selectorAttr(selector, "data-state", selectorAttr(selector, "data-value", "rendered")) : "not rendered"),
      rows: [
        { label: "Exists", value: exists ? "yes" : "no", category: "presence" },
        ...(rows ?? []),
      ],
    };
  };

  const itemRows = (selector: string): AnatomyRow[] => [
    { label: "Value", value: selectorAttr(selector, "data-value"), category: "data" },
    { label: "Highlighted", value: selectorAttr(selector, "data-highlighted", "no") === "yes" ? "yes" : "no", category: "state" },
  ];

  const sections: AnatomySection[] = [
    {
      title: "Root",
      summary: state.parts.rootMode,
      rows: [
        { label: "Mode", value: state.parts.rootMode, category: "state" },
        { label: "Default open", value: state.parts.defaultOpen, category: "state" },
        { label: "Open", value: state.parts.open, category: "state" },
        { label: "Modal", value: state.parts.modal, category: "state" },
        { label: "Close on select", value: state.parts.closeOnSelect, category: "state" },
        { label: "Escape closes", value: state.parts.closeOnEscape, category: "state" },
        { label: "Loop", value: state.parts.loop, category: "state" },
        { label: "Direction", value: state.dir, category: "state" },
      ],
    },
    partSection({
      title: "Trigger: Project canvas",
      selector: "[data-context-menu-trigger]",
      summary: state.parts.triggerExists === "yes" ? state.parts.triggerState : "not rendered",
      inactive: state.parts.triggerExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.triggerRef, category: "identity" },
        { label: "Composition", value: state.triggerComposition, category: "composition" },
        { label: "Disabled", value: state.parts.triggerDisabled, category: "state" },
        { label: "tag", value: state.parts.triggerTag, category: "identity" },
        { label: "type", value: state.parts.triggerType, category: "identity" },
        { label: "role", value: state.parts.triggerRole, category: "aria" },
        { label: "tabindex attr", value: state.parts.triggerTabIndex, category: "behavior" },
        { label: "aria-haspopup", value: state.parts.triggerHasPopup, category: "aria" },
        { label: "aria-expanded", value: state.parts.triggerExpanded, category: "aria" },
        { label: "aria-controls", value: state.parts.triggerControls, category: "aria" },
        { label: "aria-disabled", value: state.parts.triggerAriaDisabled, category: "aria" },
        { label: "Controls match", value: state.parts.triggerControlsMatch, category: "behavior" },
        { label: "data-slot", value: state.parts.triggerSlot, category: "data" },
        { label: "data-state", value: state.parts.triggerState, category: "data" },
        { label: "data-prop-check", value: state.parts.triggerDataPropCheck, category: "data" },
      ],
    }),
    partSection({
      title: "Content: Menu",
      selector: "[data-menu-content]",
      summary: state.parts.contentExists === "yes" ? state.parts.contentState : "not rendered",
      inactive: state.parts.contentExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.contentRef, category: "identity" },
        { label: "Parent", value: state.parts.contentParent, category: "behavior" },
        { label: "role", value: state.parts.contentRole, category: "aria" },
        { label: "aria-orientation", value: state.parts.contentOrientation, category: "aria" },
        { label: "tabindex attr", value: state.parts.contentTabIndex, category: "aria" },
        { label: "aria-label", value: state.parts.contentLabel, category: "aria" },
        { label: "aria-labelledby", value: state.parts.contentLabelledBy, category: "aria" },
        { label: "Loop", value: state.parts.contentLoop, category: "state" },
        { label: "Side offset", value: state.parts.contentSideOffset, category: "behavior" },
        { label: "data-slot", value: state.parts.contentSlot, category: "data" },
        { label: "data-state", value: state.parts.contentState, category: "data" },
        { label: "data-side", value: state.parts.contentSide, category: "data" },
        { label: "data-align", value: state.parts.contentAlign, category: "data" },
        { label: "data-positioned", value: state.parts.contentPositioned, category: "data" },
        { label: "data-prop-check", value: state.parts.contentDataPropCheck, category: "data" },
      ],
    }),
    partSection({
      title: "Group: Primary actions",
      selector: "[data-menu-group]",
      summary: state.parts.groupExists === "yes" ? state.parts.groupRole : "not rendered",
      inactive: state.parts.groupExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.groupRef, category: "identity" },
        { label: "role", value: state.parts.groupRole, category: "aria" },
        { label: "data-slot", value: state.parts.groupSlot, category: "data" },
        { label: "data-prop-check", value: state.parts.groupDataPropCheck, category: "data" },
      ],
    }),
    partSection({
      title: "Item: New project",
      selector: "[data-menu-item-primary]",
      summary: state.parts.itemExists === "yes" ? "new" : "not rendered",
      inactive: state.parts.itemExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.itemRef, category: "identity" },
        { label: "Composition", value: state.itemComposition, category: "composition" },
        { label: "role", value: state.parts.itemRole, category: "aria" },
        { label: "data-slot", value: state.parts.itemSlot, category: "data" },
        { label: "data-value", value: state.parts.itemValue, category: "data" },
        { label: "data-prop-check", value: state.parts.itemDataPropCheck, category: "data" },
        { label: "Highlighted", value: state.parts.itemHighlighted, category: "state" },
      ],
    }),
    partSection({
      title: "Item: Disabled action",
      selector: "[data-menu-item-disabled]",
      summary: state.showDisabledItem ? "disabled" : "not rendered",
      inactive: state.parts.disabledItemExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.disabledItemRef, category: "identity" },
        { label: "Disabled", value: state.parts.disabledItemDisabled, category: "state" },
      ],
    }),
    partSection({
      title: "Separator: Actions",
      selector: "[data-menu-separator]",
      summary: state.parts.separatorExists === "yes" ? state.parts.separatorRole : "not rendered",
      inactive: state.parts.separatorExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.separatorRef, category: "identity" },
        { label: "role", value: state.parts.separatorRole, category: "aria" },
        { label: "aria-orientation", value: state.parts.separatorOrientation, category: "aria" },
      ],
    }),
    partSection({
      title: "Checkbox Item: Show grid",
      selector: "[data-menu-checkbox]",
      summary: state.parts.checkboxExists === "yes" ? state.parts.checkboxChecked : "not rendered",
      inactive: state.parts.checkboxExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.checkboxRef, category: "identity" },
        { label: "aria-checked", value: state.parts.checkboxChecked, category: "aria" },
        { label: "data-checked", value: state.parts.checkboxDataChecked, category: "data" },
        { label: "Disabled", value: state.parts.checkboxDisabled, category: "state" },
      ],
    }),
    partSection({
      title: "Separator: Selection",
      selector: "[data-menu-selection-separator]",
      summary: selectorExists("[data-menu-selection-separator]") ? "separator" : "not rendered",
    }),
    partSection({
      title: "Radio Group: Density",
      selector: "[data-menu-radio-group]",
      summary: state.parts.radioGroupExists === "yes" ? state.parts.radioGroupValue : "not rendered",
      inactive: state.parts.radioGroupExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.radioGroupRef, category: "identity" },
        { label: "Value", value: state.parts.radioGroupValue, category: "state" },
        { label: "role", value: state.parts.radioGroupRole, category: "aria" },
        { label: "data-prop-check", value: state.parts.radioGroupDataPropCheck, category: "data" },
      ],
    }),
    partSection({
      title: "Radio Item: Compact",
      selector: "[data-menu-radio-item][data-value='compact']",
      summary: selectorAttr("[data-menu-radio-item][data-value='compact']", "aria-checked"),
      rows: [
        ...itemRows("[data-menu-radio-item][data-value='compact']"),
        { label: "Compact disabled", value: state.parts.radioItemDisabledSkipped, category: "state" },
      ],
    }),
    partSection({
      title: "Radio Item: Comfortable",
      selector: "[data-menu-radio-item][data-value='comfortable']",
      summary: selectorAttr("[data-menu-radio-item][data-value='comfortable']", "aria-checked"),
      rows: itemRows("[data-menu-radio-item][data-value='comfortable']"),
    }),
    partSection({
      title: "Separator: Density",
      selector: "[data-menu-radio-separator]",
      summary: selectorExists("[data-menu-radio-separator]") ? "separator" : "not rendered",
    }),
    partSection({
      title: "Radio Group: Dense density",
      selector: "[data-menu-radio-group-secondary]",
      summary: state.parts.radioGroupSecondaryExists === "yes" ? state.parts.radioGroupSecondaryValue : "not rendered",
      inactive: state.parts.radioGroupSecondaryExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.radioGroupSecondaryRef, category: "identity" },
        { label: "Value", value: state.parts.radioGroupSecondaryValue, category: "state" },
        { label: "role", value: state.parts.radioGroupSecondaryRole, category: "aria" },
      ],
    }),
    partSection({
      title: "Radio Item: Dense compact",
      selector: "[data-menu-radio-item-secondary][data-value='compact']",
      summary: selectorAttr("[data-menu-radio-item-secondary][data-value='compact']", "aria-checked"),
      rows: itemRows("[data-menu-radio-item-secondary][data-value='compact']"),
    }),
    partSection({
      title: "Radio Item: Dense comfortable",
      selector: "[data-menu-radio-item-secondary][data-value='comfortable']",
      summary: selectorAttr("[data-menu-radio-item-secondary][data-value='comfortable']", "aria-checked"),
      rows: itemRows("[data-menu-radio-item-secondary][data-value='comfortable']"),
    }),
    partSection({
      title: "Separator: Submenu",
      selector: "[data-menu-submenu-separator]",
      summary: state.showSubmenu ? "separator" : "not rendered",
      inactive: !state.showSubmenu,
    }),
    {
      title: "Sub: More actions",
      inactive: state.parts.subTriggerExists !== "yes",
      summary: state.parts.subTriggerExists === "yes" ? state.parts.subTriggerState : "not rendered",
      rows: [
        { label: "Controlled", value: state.controlledSubmenu ? "yes" : "no", category: "state" },
        { label: "Default open", value: state.defaultSubmenuOpen ? "yes" : "no", category: "state" },
        { label: "Open", value: state.subOpen ? "yes" : "no", category: "state" },
      ],
    },
    partSection({
      title: "Sub Trigger: More actions",
      selector: "[data-menu-sub-trigger]",
      summary: state.parts.subTriggerExists === "yes" ? state.parts.subTriggerState : "not rendered",
      inactive: state.parts.subTriggerExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.subTriggerRef, category: "identity" },
        { label: "aria-expanded", value: state.parts.subTriggerExpanded, category: "aria" },
        { label: "data-state", value: state.parts.subTriggerState, category: "data" },
      ],
    }),
    partSection({
      title: "Sub Content: More actions",
      selector: "[data-menu-sub-content]",
      summary: state.parts.subContentExists === "yes" ? state.parts.subContentState : "not rendered",
      inactive: state.parts.subContentExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.subContentRef, category: "identity" },
        { label: "Parent", value: state.parts.subContentParent, category: "behavior" },
        { label: "role", value: state.parts.subContentRole, category: "aria" },
        { label: "aria-label", value: state.parts.subContentLabel, category: "aria" },
        { label: "aria-labelledby", value: state.parts.subContentLabelledBy, category: "aria" },
        { label: "data-state", value: state.parts.subContentState, category: "data" },
        { label: "data-side", value: state.parts.subContentSide, category: "data" },
        { label: "data-positioned", value: state.parts.subContentPositioned, category: "data" },
        { label: "Loop", value: state.subContentLoopOff ? "off" : "on", category: "state" },
      ],
    }),
    partSection({
      title: "Item: Archive",
      selector: "[data-menu-sub-item]",
      summary: state.parts.subItemExists === "yes" ? "archive" : "not rendered",
      inactive: state.parts.subItemExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.subItemRef, category: "identity" },
        ...itemRows("[data-menu-sub-item]"),
      ],
    }),
    partSection({
      title: "Item: Duplicate",
      selector: "[data-menu-sub-item-extra]",
      summary: selectorExists("[data-menu-sub-item-extra]") ? "duplicate" : "not rendered",
      rows: itemRows("[data-menu-sub-item-extra]"),
    }),
    {
      title: "Sub: Advanced",
      inactive: state.parts.nestedSubTriggerExists !== "yes",
      summary: state.parts.nestedSubTriggerExists === "yes" ? state.parts.nestedSubTriggerState : "not rendered",
      rows: [
        { label: "Controlled", value: "no", category: "state" },
        { label: "Open", value: state.parts.nestedSubContentExists, category: "state" },
      ],
    },
    partSection({
      title: "Sub Trigger: Advanced",
      selector: "[data-menu-nested-sub-trigger]",
      summary: state.parts.nestedSubTriggerExists === "yes" ? state.parts.nestedSubTriggerState : "not rendered",
      inactive: state.parts.nestedSubTriggerExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.nestedSubTriggerRef, category: "identity" },
        { label: "aria-expanded", value: state.parts.nestedSubTriggerExpanded, category: "aria" },
        { label: "data-state", value: state.parts.nestedSubTriggerState, category: "data" },
      ],
    }),
    partSection({
      title: "Sub Content: Advanced",
      selector: "[data-menu-nested-sub-content]",
      summary: state.parts.nestedSubContentExists === "yes" ? state.parts.nestedSubContentState : "not rendered",
      inactive: state.parts.nestedSubContentExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.nestedSubContentRef, category: "identity" },
        { label: "Parent", value: state.parts.nestedSubContentParent, category: "behavior" },
        { label: "role", value: state.parts.nestedSubContentRole, category: "aria" },
        { label: "data-state", value: state.parts.nestedSubContentState, category: "data" },
      ],
    }),
    partSection({
      title: "Item: Export",
      selector: "[data-menu-nested-sub-item]",
      summary: state.parts.nestedSubItemExists === "yes" ? "export" : "not rendered",
      inactive: state.parts.nestedSubItemExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.nestedSubItemRef, category: "identity" },
        ...itemRows("[data-menu-nested-sub-item]"),
      ],
    }),
    {
      title: "Sub: Share actions",
      inactive: state.parts.subTriggerSecondaryExists !== "yes",
      summary: state.parts.subTriggerSecondaryExists === "yes" ? state.parts.subTriggerSecondaryState : "not rendered",
      rows: [
        { label: "Controlled", value: "no", category: "state" },
        { label: "Open", value: state.parts.subContentSecondaryExists, category: "state" },
      ],
    },
    partSection({
      title: "Sub Trigger: Share actions",
      selector: "[data-menu-sub-trigger-secondary]",
      summary: state.parts.subTriggerSecondaryExists === "yes" ? state.parts.subTriggerSecondaryState : "not rendered",
      inactive: state.parts.subTriggerSecondaryExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.subTriggerSecondaryRef, category: "identity" },
        { label: "aria-expanded", value: state.parts.subTriggerSecondaryExpanded, category: "aria" },
        { label: "data-state", value: state.parts.subTriggerSecondaryState, category: "data" },
        { label: "Disabled", value: state.parts.subTriggerSecondaryDisabled, category: "state" },
      ],
    }),
    partSection({
      title: "Sub Content: Share actions",
      selector: "[data-menu-sub-content-secondary]",
      summary: state.parts.subContentSecondaryExists === "yes" ? state.parts.subContentSecondaryState : "not rendered",
      inactive: state.parts.subContentSecondaryExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.subContentSecondaryRef, category: "identity" },
        { label: "Parent", value: state.parts.subContentSecondaryParent, category: "behavior" },
        { label: "role", value: state.parts.subContentSecondaryRole, category: "aria" },
        { label: "data-state", value: state.parts.subContentSecondaryState, category: "data" },
      ],
    }),
    partSection({
      title: "Item: Copy link",
      selector: "[data-menu-sub-item-secondary]",
      summary: state.parts.subItemSecondaryExists === "yes" ? "copy-link" : "not rendered",
      inactive: state.parts.subItemSecondaryExists !== "yes",
      rows: [
        { label: "Ref", value: state.parts.subItemSecondaryRef, category: "identity" },
        ...itemRows("[data-menu-sub-item-secondary]"),
      ],
    }),
  ];

  return (
    <AnatomyPanel
      footer={`${sections.length} parts`}
      onOpenGroupsChange={onOpenGroupsChange}
      openGroups={openGroups}
      sections={sections}
    />
  );
}

function queryPlaygroundElement(selector: string) {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(selector);
}

export function ContextMenuScenarioLog({ state }: { state: ContextMenuScenarioState }) {
  return <ScenarioEventLog log={state.log} />;
}

const sideOptions: readonly ContextMenuSide[] = ["bottom", "top", "right", "left"];
const alignOptions: readonly ContextMenuAlign[] = ["start", "center", "end"];
const directionOptions = ["ltr", "rtl"] as const;
const radioOptions = ["compact", "comfortable"] as const;
const compositionOptions: readonly ContextMenuItemCompositionMode[] = ["default", "asChild", "render"];

type ContextMenuTriggerProps = {
  mode: ContextMenuItemCompositionMode;
  children: ReactNode;
  disabled: boolean;
  onContextMenu: (event: { preventDefault: () => void }) => void;
  onKeyDown: (event: { key: string; shiftKey?: boolean; preventDefault: () => void }) => void;
  "data-context-menu-trigger": string;
  "data-prop-check"?: string;
  "data-slot"?: string;
};

function ContextMenuTrigger({
  mode,
  children,
  disabled,
  onContextMenu,
  onKeyDown,
  ...dataProps
}: ContextMenuTriggerProps) {
  const target = (
    <>
      {children}
      <span className="context-menu-target-marker" aria-hidden="true" />
    </>
  );
  const sharedProps = {
    disabled,
    onContextMenu,
    onKeyDown,
    ...dataProps,
  };

  if (mode === "asChild") {
    return (
      <ContextMenu.Trigger
        {...sharedProps}
        asChild
      >
        <div className="context-menu-target" tabIndex={disabled ? undefined : 0}>
          {target}
        </div>
      </ContextMenu.Trigger>
    );
  }

  if (mode === "render") {
    return (
      <ContextMenu.Trigger
        {...sharedProps}
        className="context-menu-target"
        render="section"
        tabIndex={disabled ? undefined : 0}
      >
        {target}
      </ContextMenu.Trigger>
    );
  }

  return (
    <ContextMenu.Trigger
      {...sharedProps}
    >
      <div className="context-menu-target" tabIndex={disabled ? undefined : 0}>
        {target}
      </div>
    </ContextMenu.Trigger>
  );
}

type ContextMenuActionItemProps = {
  mode: ContextMenuItemCompositionMode;
  children: ReactNode;
  value: string;
  disabled: boolean;
  onSelect: () => void;
  onClick: (event: { preventDefault: () => void }) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  "data-menu-item-primary": string;
  "data-prop-check"?: string;
  "data-slot"?: string;
};

function ContextMenuActionItem({
  mode,
  children,
  value,
  disabled,
  onSelect,
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...dataProps
}: ContextMenuActionItemProps) {
  const sharedProps = {
    className: "playground-menu-item",
    value,
    disabled,
    onSelect,
    onClick,
    onPointerEnter,
    onPointerLeave,
    ...dataProps,
  };

  if (mode === "asChild") {
    return (
      <ContextMenu.Item
        {...sharedProps}
        asChild
      >
        <span>{children}</span>
      </ContextMenu.Item>
    );
  }

  if (mode === "render") {
    return (
      <ContextMenu.Item
        {...sharedProps}
        render="section"
      >
        {children}
      </ContextMenu.Item>
    );
  }

  return (
    <ContextMenu.Item
      {...sharedProps}
    >
      {children}
    </ContextMenu.Item>
  );
}
