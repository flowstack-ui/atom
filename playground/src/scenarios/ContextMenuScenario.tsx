import { Button } from "@flowstack-ui/atom/button";
import { Dialog } from "@flowstack-ui/atom/dialog";
import { ContextMenu, useContextMenuContext } from "@flowstack-ui/atom/context-menu";
import { Menubar } from "@flowstack-ui/atom/menubar";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import { useEffect, type ReactNode } from "react";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
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
          data-prop-check="trigger"
          data-slot={state.triggerSlotOverride ? "context-menu-trigger-custom" : undefined}
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
          data-prop-check="content"
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
            data-prop-check="group"
          >
            <ContextMenuActionItem
              mode={state.itemComposition}
              value="new"
              disabled={false}
              data-menu-item-primary=""
              data-prop-check="item"
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
          />
          <ContextMenu.CheckboxItem
            className="playground-menu-item"
            value="grid"
            textValue="Show grid"
            checked={state.checkboxChecked}
            disabled={state.checkboxDisabled}
            closeOnSelect={state.closeCheckboxOnSelect}
            data-menu-checkbox=""
            data-prop-check="checkbox-item"
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
            data-prop-check="radio-group"
            onValueChange={actions.handleRadioChange}
          >
            <ContextMenu.RadioItem
              className="playground-menu-item"
              value="compact"
              textValue="Compact"
              disabled={state.radioItemDisabled}
              closeOnSelect={state.closeRadioOnSelect}
              data-menu-radio-item=""
              data-prop-check="radio-item"
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
            onValueChange={actions.handleRadioSecondaryChange}
          >
            <ContextMenu.RadioItem
              className="playground-menu-item"
              value="compact"
              textValue="Dense compact"
              closeOnSelect={state.closeRadioOnSelect}
              data-menu-radio-item-secondary=""
              data-prop-check="radio-item-secondary"
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
                  data-prop-check="sub-content"
                  data-playground-inspect=""
                  ref={(element) => actions.markPartRef("subContent", element)}
                >
                  <ContextMenu.Item
                    className="playground-menu-item"
                    value="archive"
                    data-menu-sub-item=""
                    onSelect={() => actions.handleActionSelect("archive")}
                  >
                    Archive
                  </ContextMenu.Item>
                  <ContextMenu.Item
                    className="playground-menu-item"
                    value="duplicate"
                    data-menu-sub-item-extra=""
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
                      >
                        <span>Advanced</span>
                        <span className="playground-menu-sub-arrow" aria-hidden="true">›</span>
                      </ContextMenu.SubTrigger>
                      <ContextMenu.SubContent
                        className="playground-menu-content playground-submenu-content"
                        data-menu-nested-sub-content=""
                        data-playground-inspect=""
                        ref={(element) => actions.markPartRef("nestedSubContent", element)}
                      >
                        <ContextMenu.Item
                          className="playground-menu-item"
                          value="export"
                          data-menu-nested-sub-item=""
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
                >
                  <span>Share actions</span>
                  <span className="playground-menu-sub-arrow" aria-hidden="true">›</span>
                </ContextMenu.SubTrigger>
                <ContextMenu.SubContent
                  className="playground-menu-content playground-submenu-content"
                  sideOffset={state.subSideOffset}
                  data-menu-sub-content-secondary=""
                  data-playground-inspect=""
                  ref={(element) => actions.markPartRef("subContentSecondary", element)}
                >
                  <ContextMenu.Item
                    className="playground-menu-item"
                    value="copy-link"
                    data-menu-sub-item-secondary=""
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

  if (!state.insideDialog) return menuDemo;

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
          {menuDemo}
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
    <Menubar.Root className="canvas-toolbar" aria-label="Context Menu controls">
      <ToolbarGroup title="State" value="state">
        <ContextMenuSection label="Root">
          <ContextMenuCheckboxControl checked={state.controlled} label="Controlled" value="controlled" onChange={actions.setControlled} />
          <ContextMenuCheckboxControl checked={state.defaultOpen} label="Default open" value="default-open" onChange={actions.setDefaultOpen} />
          <ContextMenuCheckboxControl checked={state.modal} label="Modal" value="modal" onChange={actions.setModal} />
          <ContextMenuCheckboxControl checked={state.closeOnSelect} label="Close on select" value="close-on-select" onChange={actions.setCloseOnSelect} />
          <ContextMenuCheckboxControl checked={state.closeOnEscape} label="Escape closes" value="escape-closes" onChange={actions.setCloseOnEscape} />
          <ContextMenuCheckboxControl checked={state.loop} label="Loop" value="loop" onChange={actions.setLoop} />
        </ContextMenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Popup" value="popup">
        <ContextMenuRadioControl label="Side" options={sideOptions} value={state.side} onChange={actions.setSide} />
        <ContextMenuRadioControl label="Align" options={alignOptions} value={state.align} onChange={actions.setAlign} />
        <ContextMenuSection label="Position">
          <ContextMenuCheckboxControl checked={state.sideOffset === 16} label="Large offset" value="large-offset" onChange={(checked) => actions.setSideOffset(checked ? 16 : 4)} />
          <ContextMenuCheckboxControl checked={state.contentAriaLabel} label="Content ariaLabel" value="content-aria-label" onChange={actions.setContentAriaLabel} />
          <ContextMenuCheckboxControl checked={state.contentLoopOff} label="Content loop off" value="content-loop-off" onChange={actions.setContentLoopOff} />
          <ContextMenuCheckboxControl checked={state.blockContentKeyDown} label="Block content keys" value="block-content-keys" onChange={actions.setBlockContentKeyDown} />
        </ContextMenuSection>
        <ContextMenuSection label="Nesting">
          <ContextMenuCheckboxControl checked={state.insideDialog} label="Inside Dialog" value="inside-dialog" onChange={actions.setInsideDialog} />
        </ContextMenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Items" value="items">
        <ContextMenuSection label="Selection">
          <ContextMenuCheckboxControl checked={state.checkboxChecked} label="Checkbox checked" value="checkbox-checked" onChange={actions.setCheckboxChecked} />
          <ContextMenuCheckboxControl checked={state.checkboxDisabled} label="Checkbox disabled" value="checkbox-disabled" onChange={actions.setCheckboxDisabled} />
          <ContextMenuCheckboxControl checked={state.closeCheckboxOnSelect} label="Checkbox closes" value="checkbox-closes" onChange={actions.setCloseCheckboxOnSelect} />
          <ContextMenuCheckboxControl checked={state.closeRadioOnSelect} label="Radio closes" value="radio-closes" onChange={actions.setCloseRadioOnSelect} />
        </ContextMenuSection>
        <ContextMenuRadioControl label="Radio value" options={radioOptions} value={state.radioValue} onChange={actions.setRadioValue} />
        <ContextMenuRadioControl label="Radio value 2" options={radioOptions} value={state.radioValueSecondary} onChange={actions.setRadioValueSecondary} />
        <ContextMenuSection label="Availability">
          <ContextMenuCheckboxControl checked={state.showDisabledItem} label="Show disabled item" value="show-disabled-item" onChange={actions.setShowDisabledItem} />
          <ContextMenuCheckboxControl checked={state.radioItemDisabled} label="Compact radio disabled" value="compact-radio-disabled" onChange={actions.setRadioItemDisabled} />
        </ContextMenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Submenu" value="submenu">
        <ContextMenuSection label="Sub">
          <ContextMenuCheckboxControl checked={state.showSubmenu} label="Show submenu" value="show-submenu" onChange={actions.setShowSubmenu} />
          <ContextMenuCheckboxControl checked={state.disableSecondSubmenu} label="Disable share submenu" value="disable-second-submenu" onChange={actions.setDisableSecondSubmenu} />
          <ContextMenuCheckboxControl checked={state.controlledSubmenu} label="Controlled submenu" value="controlled-submenu" onChange={actions.setControlledSubmenu} />
          <ContextMenuCheckboxControl checked={state.defaultSubmenuOpen} label="Default sub open" value="default-sub-open" onChange={actions.setDefaultSubmenuOpen} />
          <ContextMenuCheckboxControl checked={state.subContentAriaLabel} label="Sub ariaLabel" value="sub-aria-label" onChange={actions.setSubContentAriaLabel} />
          <ContextMenuCheckboxControl checked={state.subSideOffset === 12} label="Large sub offset" value="large-sub-offset" onChange={(checked) => actions.setSubSideOffset(checked ? 12 : 4)} />
          <ContextMenuCheckboxControl checked={state.subContentLoopOff} label="Sub loop off" value="sub-loop-off" onChange={actions.setSubContentLoopOff} />
          <ContextMenuCheckboxControl checked={state.showNestedSubmenu} label="Nested submenu" value="nested-submenu" onChange={actions.setShowNestedSubmenu} />
        </ContextMenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <ContextMenuRadioControl label="Trigger" options={compositionOptions} value={state.triggerComposition} onChange={actions.setTriggerComposition} />
        <ContextMenuRadioControl label="Item" options={compositionOptions} value={state.itemComposition} onChange={actions.setItemComposition} />
        <ContextMenuSection label="Events">
          <ContextMenuCheckboxControl checked={state.triggerDisabled} label="Disabled trigger" value="disabled-trigger" onChange={actions.setTriggerDisabled} />
          <ContextMenuCheckboxControl checked={state.triggerSlotOverride} label="Override trigger slot" value="override-trigger-slot" onChange={actions.setTriggerSlotOverride} />
          <ContextMenuCheckboxControl checked={state.blockTriggerEvent} label="Block trigger event" value="block-trigger-event" onChange={actions.setBlockTriggerEvent} />
          <ContextMenuCheckboxControl checked={state.blockItemSelect} label="Block item select" value="block-item-select" onChange={actions.setBlockItemSelect} />
          <ContextMenuCheckboxControl checked={state.logPointer} label="Log pointer" value="log-pointer" onChange={actions.setLogPointer} />
        </ContextMenuSection>
      </ToolbarGroup>
    </Menubar.Root>
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
      ],
    },
    {
      title: "Trigger",
      selector: "[data-context-menu-trigger]",
      inactive: state.parts.triggerExists !== "yes",
      summary: state.parts.triggerExists === "yes" ? state.parts.triggerState : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.triggerExists, category: "presence" },
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
    },
    {
      title: "Content",
      selector: "[data-menu-content]",
      inactive: state.parts.contentExists !== "yes",
      summary: state.parts.contentExists === "yes" ? state.parts.contentState : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.contentExists, category: "presence" },
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
    },
    {
      title: "Group",
      selector: "[data-menu-group]",
      inactive: state.parts.groupExists !== "yes",
      summary: state.parts.groupExists === "yes" ? state.parts.groupRole : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.groupExists, category: "presence" },
        { label: "Ref", value: state.parts.groupRef, category: "identity" },
        { label: "role", value: state.parts.groupRole, category: "aria" },
        { label: "data-slot", value: state.parts.groupSlot, category: "data" },
        { label: "data-prop-check", value: state.parts.groupDataPropCheck, category: "data" },
      ],
    },
    {
      title: "Item",
      inactive: state.parts.itemExists !== "yes" && state.parts.disabledItemExists !== "yes",
      summary: state.parts.itemExists === "yes" ? state.parts.itemValue : "not rendered",
      groups: [
        {
          title: "Primary item",
          selector: "[data-menu-item-primary]",
          rows: [
            { label: "Exists", value: state.parts.itemExists, category: "presence" },
            { label: "Ref", value: state.parts.itemRef, category: "identity" },
            { label: "role", value: state.parts.itemRole, category: "aria" },
            { label: "data-slot", value: state.parts.itemSlot, category: "data" },
            { label: "data-value", value: state.parts.itemValue, category: "data" },
            { label: "data-prop-check", value: state.parts.itemDataPropCheck, category: "data" },
            { label: "Highlighted", value: state.parts.itemHighlighted, category: "state" },
          ],
        },
        {
          title: "Disabled item",
          selector: "[data-menu-item-disabled]",
          rows: [
            { label: "Exists", value: state.parts.disabledItemExists, category: "presence" },
            { label: "Ref", value: state.parts.disabledItemRef, category: "identity" },
            { label: "Disabled", value: state.parts.disabledItemDisabled, category: "state" },
          ],
        },
      ],
    },
    {
      title: "Checkbox Item",
      selector: "[data-menu-checkbox]",
      inactive: state.parts.checkboxExists !== "yes",
      summary: state.parts.checkboxExists === "yes" ? state.parts.checkboxChecked : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.checkboxExists, category: "presence" },
        { label: "Ref", value: state.parts.checkboxRef, category: "identity" },
        { label: "aria-checked", value: state.parts.checkboxChecked, category: "aria" },
        { label: "data-checked", value: state.parts.checkboxDataChecked, category: "data" },
        { label: "Disabled", value: state.parts.checkboxDisabled, category: "state" },
      ],
    },
    {
      title: "Radio Group",
      inactive: state.parts.radioGroupExists !== "yes",
      summary: state.parts.radioGroupExists === "yes" ? state.parts.radioGroupRole : "not rendered",
      groups: [
        {
          title: "Group 1",
          selector: "[data-menu-radio-group]",
          rows: [
            { label: "Exists", value: state.parts.radioGroupExists, category: "presence" },
            { label: "Ref", value: state.parts.radioGroupRef, category: "identity" },
            { label: "Value", value: state.parts.radioGroupValue, category: "state" },
            { label: "role", value: state.parts.radioGroupRole, category: "aria" },
            { label: "data-prop-check", value: state.parts.radioGroupDataPropCheck, category: "data" },
          ],
        },
        {
          title: "Group 2",
          selector: "[data-menu-radio-group-secondary]",
          rows: [
            { label: "Exists", value: state.parts.radioGroupSecondaryExists, category: "presence" },
            { label: "Ref", value: state.parts.radioGroupSecondaryRef, category: "identity" },
            { label: "Value", value: state.parts.radioGroupSecondaryValue, category: "state" },
            { label: "role", value: state.parts.radioGroupSecondaryRole, category: "aria" },
          ],
        },
      ],
    },
    {
      title: "Radio Item",
      inactive: state.parts.radioItemExists !== "yes",
      summary: state.parts.radioItemExists === "yes" ? state.parts.radioItemChecked : "not rendered",
      groups: [
        {
          title: "Group 1 item",
          selector: "[data-menu-radio-item][aria-checked='true']",
          rows: [
            { label: "Exists", value: state.parts.radioItemExists, category: "presence" },
            { label: "Ref", value: state.parts.radioItemRef, category: "identity" },
            { label: "data-value", value: state.parts.radioItemValue, category: "data" },
            { label: "aria-checked", value: state.parts.radioItemChecked, category: "aria" },
            { label: "data-checked", value: state.parts.radioItemDataChecked, category: "data" },
            { label: "Compact disabled", value: state.parts.radioItemDisabledSkipped, category: "state" },
          ],
        },
        {
          title: "Group 2 item",
          selector: "[data-menu-radio-item-secondary][aria-checked='true']",
          rows: [
            { label: "Exists", value: state.parts.radioItemSecondaryExists, category: "presence" },
            { label: "Ref", value: state.parts.radioItemSecondaryRef, category: "identity" },
            { label: "data-value", value: state.parts.radioItemSecondaryValue, category: "data" },
            { label: "aria-checked", value: state.parts.radioItemSecondaryChecked, category: "aria" },
            { label: "data-checked", value: state.parts.radioItemSecondaryDataChecked, category: "data" },
          ],
        },
      ],
    },
    {
      title: "Separator",
      selector: "[data-menu-separator]",
      inactive: state.parts.separatorExists !== "yes",
      summary: state.parts.separatorExists === "yes" ? state.parts.separatorRole : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.separatorExists, category: "presence" },
        { label: "Ref", value: state.parts.separatorRef, category: "identity" },
        { label: "role", value: state.parts.separatorRole, category: "aria" },
        { label: "aria-orientation", value: state.parts.separatorOrientation, category: "aria" },
      ],
    },
    {
      title: "Sub",
      inactive: state.parts.subTriggerExists !== "yes",
      summary: state.parts.subTriggerExists === "yes" ? state.parts.subTriggerState : "not rendered",
      rows: [
        { label: "Controlled", value: state.controlledSubmenu ? "yes" : "no", category: "state" },
        { label: "Default open", value: state.defaultSubmenuOpen ? "yes" : "no", category: "state" },
        { label: "Open", value: state.subOpen ? "yes" : "no", category: "state" },
      ],
    },
    {
      title: "Sub Trigger",
      inactive: state.parts.subTriggerExists !== "yes",
      summary: state.parts.subTriggerExists === "yes" ? state.parts.subTriggerState : "not rendered",
      groups: [
        {
          title: "More actions trigger",
          selector: "[data-menu-sub-trigger]",
          rows: [
            { label: "Exists", value: state.parts.subTriggerExists, category: "presence" },
            { label: "Ref", value: state.parts.subTriggerRef, category: "identity" },
            { label: "aria-expanded", value: state.parts.subTriggerExpanded, category: "aria" },
            { label: "data-state", value: state.parts.subTriggerState, category: "data" },
          ],
        },
        {
          title: "Share actions trigger",
          selector: "[data-menu-sub-trigger-secondary]",
          rows: [
            { label: "Exists", value: state.parts.subTriggerSecondaryExists, category: "presence" },
            { label: "Ref", value: state.parts.subTriggerSecondaryRef, category: "identity" },
            { label: "aria-expanded", value: state.parts.subTriggerSecondaryExpanded, category: "aria" },
            { label: "data-state", value: state.parts.subTriggerSecondaryState, category: "data" },
            { label: "Disabled", value: state.parts.subTriggerSecondaryDisabled, category: "state" },
          ],
        },
      ],
    },
    {
      title: "Sub Content",
      inactive: state.parts.subContentExists !== "yes",
      summary: state.parts.subContentExists === "yes" ? state.parts.subContentState : "not rendered",
      groups: [
        {
          title: "More actions content",
          selector: "[data-menu-sub-content]",
          rows: [
            { label: "Exists", value: state.parts.subContentExists, category: "presence" },
            { label: "Ref", value: state.parts.subContentRef, category: "identity" },
            { label: "Parent", value: state.parts.subContentParent, category: "behavior" },
            { label: "role", value: state.parts.subContentRole, category: "aria" },
            { label: "aria-label", value: state.parts.subContentLabel, category: "aria" },
            { label: "aria-labelledby", value: state.parts.subContentLabelledBy, category: "aria" },
            { label: "data-state", value: state.parts.subContentState, category: "data" },
            { label: "data-side", value: state.parts.subContentSide, category: "data" },
            { label: "data-positioned", value: state.parts.subContentPositioned, category: "data" },
            { label: "Loop", value: state.subContentLoopOff ? "off" : "on", category: "state" },
            { label: "Item exists", value: state.parts.subItemExists, category: "presence" },
            { label: "Item ref", value: state.parts.subItemRef, category: "identity" },
          ],
        },
        {
          title: "Share actions content",
          selector: "[data-menu-sub-content-secondary]",
          rows: [
            { label: "Exists", value: state.parts.subContentSecondaryExists, category: "presence" },
            { label: "Ref", value: state.parts.subContentSecondaryRef, category: "identity" },
            { label: "Parent", value: state.parts.subContentSecondaryParent, category: "behavior" },
            { label: "role", value: state.parts.subContentSecondaryRole, category: "aria" },
            { label: "data-state", value: state.parts.subContentSecondaryState, category: "data" },
            { label: "Item exists", value: state.parts.subItemSecondaryExists, category: "presence" },
            { label: "Item ref", value: state.parts.subItemSecondaryRef, category: "identity" },
          ],
        },
      ],
    },
    {
      title: "Nested Sub Trigger",
      selector: "[data-menu-nested-sub-trigger]",
      inactive: state.parts.nestedSubTriggerExists !== "yes",
      summary: state.parts.nestedSubTriggerExists === "yes" ? state.parts.nestedSubTriggerState : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.nestedSubTriggerExists, category: "presence" },
        { label: "Ref", value: state.parts.nestedSubTriggerRef, category: "identity" },
        { label: "aria-expanded", value: state.parts.nestedSubTriggerExpanded, category: "aria" },
        { label: "data-state", value: state.parts.nestedSubTriggerState, category: "data" },
      ],
    },
    {
      title: "Nested Sub Content",
      selector: "[data-menu-nested-sub-content]",
      inactive: state.parts.nestedSubContentExists !== "yes",
      summary: state.parts.nestedSubContentExists === "yes" ? state.parts.nestedSubContentState : "not rendered",
      rows: [
        { label: "Exists", value: state.parts.nestedSubContentExists, category: "presence" },
        { label: "Ref", value: state.parts.nestedSubContentRef, category: "identity" },
        { label: "Parent", value: state.parts.nestedSubContentParent, category: "behavior" },
        { label: "role", value: state.parts.nestedSubContentRole, category: "aria" },
        { label: "data-state", value: state.parts.nestedSubContentState, category: "data" },
        { label: "Nested item exists", value: state.parts.nestedSubItemExists, category: "presence" },
        { label: "Nested item ref", value: state.parts.nestedSubItemRef, category: "identity" },
      ],
    },
  ];

  return (
    <AnatomyPanel
      footer="13 groups"
      onOpenGroupsChange={onOpenGroupsChange}
      openGroups={openGroups}
      sections={sections}
    />
  );
}

export function ContextMenuScenarioLog({ state }: { state: ContextMenuScenarioState }) {
  return (
    <div className="scenario-log">
      <ScrollArea.Root className="event-log" orientation="vertical">
        <ScrollArea.Viewport className="event-log-viewport" focusable aria-label="Event log">
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

function ContextMenuSection({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="toolbar-menu-section">
      <div className="toolbar-menu-label">{label}</div>
      <div className="toolbar-menu-items">{children}</div>
    </div>
  );
}

function ContextMenuCheckboxControl({
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
    <Menubar.CheckboxItem className="toolbar-menu-item" checked={checked} value={value} onCheckedChange={onChange}>
      <span>{label}</span>
      <span className="toolbar-menu-check" aria-hidden="true">{checked ? "✓" : ""}</span>
    </Menubar.CheckboxItem>
  );
}

function ContextMenuRadioControl<T extends string>({
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
      <Menubar.RadioGroup className="toolbar-radio-group" value={value} onValueChange={(nextValue) => onChange(nextValue as T)}>
        {options.map((option) => (
          <Menubar.RadioItem className="toolbar-menu-item" key={option} value={option}>
            <span>{option}</span>
            <span className="toolbar-menu-check" aria-hidden="true">{option === value ? "✓" : ""}</span>
          </Menubar.RadioItem>
        ))}
      </Menubar.RadioGroup>
    </div>
  );
}

const sideOptions: readonly ContextMenuSide[] = ["bottom", "top", "right", "left"];
const alignOptions: readonly ContextMenuAlign[] = ["start", "center", "end"];
const radioOptions = ["compact", "comfortable"] as const;
const compositionOptions: readonly ContextMenuItemCompositionMode[] = ["default", "asChild", "render"];

type ContextMenuTriggerProps = {
  mode: ContextMenuItemCompositionMode;
  children: ReactNode;
  disabled: boolean;
  onContextMenu: (event: { preventDefault: () => void }) => void;
  onKeyDown: (event: { key: string; shiftKey?: boolean; preventDefault: () => void }) => void;
  "data-context-menu-trigger": string;
  "data-prop-check": string;
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
  "data-prop-check": string;
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
