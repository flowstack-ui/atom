import { Button } from "@flowstack-ui/atom/button";
import { Dialog } from "@flowstack-ui/atom/dialog";
import { Menu } from "@flowstack-ui/atom/menu";
import { useRef, type MouseEvent, type ReactNode } from "react";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, ScenarioEventLog, ToolbarGroup } from "../WorkbenchPrimitives";
import type { Dispatch, SetStateAction } from "react";
import type {
  MenuAlign,
  MenuItemCompositionMode,
  MenuScenarioActions,
  MenuScenarioState,
  MenuSide,
} from "./useMenuScenario";

export function MenuScenarioCanvas({
  state,
  actions,
}: {
  state: MenuScenarioState;
  actions: MenuScenarioActions;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const anchorPoint = state.useAnchorPoint
    ? state.anchorPoint ?? getAnchorPoint(anchorRef.current, state.side, state.align)
    : null;
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
      <div className="menu-demo-actions">
        <Button.Root
          className="atom-button secondary"
          disabled={!state.controlled || state.open}
          onPress={() => actions.setControlledOpen(true)}
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
      <button
        type="button"
        ref={anchorRef}
        aria-label="Set menu anchor point"
        className="menu-anchor"
        onClick={(event) => handleAnchorClick(event, actions)}
        data-anchor-mode={state.useAnchorPoint ? "point" : "rect"}
      >
        <span className="menu-anchor-line" />
        <span
          className="menu-anchor-dot"
          style={state.anchorPoint
            ? { left: state.anchorPoint.localX, top: state.anchorPoint.localY }
            : undefined}
        />
      </button>
      <Menu.Root
        key={state.controlled ? "controlled" : `uncontrolled-${state.defaultOpen}`}
        {...rootProps}
      >
        <Menu.Content
          anchorPoint={anchorPoint}
          ariaLabel={state.contentAriaLabel ? "Project actions" : undefined}
          className="playground-menu-content"
          data-menu-content=""
          data-playground-inspect=""
          side={state.side}
          align={state.align}
          sideOffset={state.sideOffset}
          loop={state.contentLoopOff ? false : undefined}
          ref={(element) => actions.markPartRef("content", element)}
        >
          <Menu.Group
            className="playground-menu-group"
            data-menu-group=""
          >
            <MenuActionItem
              mode={state.itemComposition}
              value="new"
              disabled={false}
              data-menu-item-primary=""
              onSelect={() => actions.handleActionSelect("new")}
              onClick={actions.handleActionClick("new")}
              onPointerEnter={() => actions.handlePointer("new", "enter")}
              onPointerLeave={() => actions.handlePointer("new", "leave")}
            >
              New project
            </MenuActionItem>
            {state.showDisabledItem ? (
              <Menu.Item
                className="playground-menu-item"
                value="disabled"
                disabled
                data-menu-item-disabled=""
              >
                Disabled action
              </Menu.Item>
            ) : null}
          </Menu.Group>
          <Menu.Separator
            className="playground-menu-separator"
            data-menu-separator=""
          />
          <Menu.CheckboxItem
            className="playground-menu-item"
            value="grid"
            textValue="Show grid"
            checked={state.checkboxChecked}
            closeOnSelect={state.closeCheckboxOnSelect}
            data-menu-checkbox=""
            onCheckedChange={actions.handleCheckboxChange}
          >
            <span>Show grid</span>
            <span className="playground-menu-check" aria-hidden="true" />
          </Menu.CheckboxItem>
          <Menu.Separator
            className="playground-menu-separator"
            data-menu-selection-separator=""
          />
          <Menu.RadioGroup
            className="playground-menu-radio-group"
            value={state.radioValue}
            data-menu-radio-group=""
            onValueChange={actions.handleRadioChange}
          >
            <Menu.RadioItem
              className="playground-menu-item"
              value="compact"
              textValue="Compact"
              closeOnSelect={state.closeRadioOnSelect}
              data-menu-radio-item=""
            >
              <span>Compact</span>
              <span className="playground-menu-radio" aria-hidden="true" />
            </Menu.RadioItem>
            <Menu.RadioItem
              className="playground-menu-item"
              value="comfortable"
              textValue="Comfortable"
              closeOnSelect={state.closeRadioOnSelect}
              data-menu-radio-item=""
            >
              <span>Comfortable</span>
              <span className="playground-menu-radio" aria-hidden="true" />
            </Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Separator
            className="playground-menu-separator"
            data-menu-radio-separator=""
          />
          <Menu.RadioGroup
            className="playground-menu-radio-group"
            value={state.radioValueSecondary}
            data-menu-radio-group-secondary=""
            onValueChange={actions.handleRadioSecondaryChange}
          >
            <Menu.RadioItem
              className="playground-menu-item"
              value="compact"
              textValue="Dense compact"
              closeOnSelect={state.closeRadioOnSelect}
              data-menu-radio-item-secondary=""
            >
              <span>Dense compact</span>
              <span className="playground-menu-radio" aria-hidden="true" />
            </Menu.RadioItem>
            <Menu.RadioItem
              className="playground-menu-item"
              value="comfortable"
              textValue="Dense comfortable"
              closeOnSelect={state.closeRadioOnSelect}
              data-menu-radio-item-secondary=""
            >
              <span>Dense comfortable</span>
              <span className="playground-menu-radio" aria-hidden="true" />
            </Menu.RadioItem>
          </Menu.RadioGroup>
          {state.showSubmenu ? (
            <>
              <Menu.Separator
                className="playground-menu-separator"
                data-menu-submenu-separator=""
              />
              <Menu.Sub
                {...(state.controlledSubmenu
                  ? { open: state.subOpen, onOpenChange: actions.handleSubOpenChange }
                  : { defaultOpen: false })}
              >
                <Menu.SubTrigger
                  className="playground-menu-item"
                  value="more"
                  textValue="More actions"
                  data-menu-sub-trigger=""
                >
                  <span>More actions</span>
                  <span className="playground-menu-sub-arrow" aria-hidden="true">›</span>
                </Menu.SubTrigger>
                <Menu.SubContent
                  className="playground-menu-content playground-submenu-content"
                  ariaLabel={state.subContentAriaLabel ? "More actions" : undefined}
                  sideOffset={state.subSideOffset}
                  data-menu-sub-content=""
                  data-playground-inspect=""
                  ref={(element) => actions.markPartRef("subContent", element)}
                >
                  <Menu.Item
                    className="playground-menu-item"
                    value="archive"
                    data-menu-sub-item=""
                    onSelect={() => actions.handleActionSelect("archive")}
                  >
                    Archive
                  </Menu.Item>
                  {state.showNestedSubmenu ? (
                    <Menu.Sub>
                      <Menu.SubTrigger
                        className="playground-menu-item"
                        value="advanced"
                        textValue="Advanced"
                        data-menu-nested-sub-trigger=""
                      >
                        <span>Advanced</span>
                        <span className="playground-menu-sub-arrow" aria-hidden="true">›</span>
                      </Menu.SubTrigger>
                      <Menu.SubContent
                        className="playground-menu-content playground-submenu-content"
                        data-menu-nested-sub-content=""
                        data-playground-inspect=""
                        ref={(element) => actions.markPartRef("nestedSubContent", element)}
                      >
                        <Menu.Item
                          className="playground-menu-item"
                          value="export"
                          data-menu-nested-sub-item=""
                          onSelect={() => actions.handleActionSelect("export")}
                        >
                          Export
                        </Menu.Item>
                      </Menu.SubContent>
                    </Menu.Sub>
                  ) : null}
                </Menu.SubContent>
              </Menu.Sub>
              <Menu.Sub
                defaultOpen={false}
              >
                <Menu.SubTrigger
                  className="playground-menu-item"
                  value="share"
                  textValue="Share actions"
                  disabled={state.disableSecondSubmenu}
                  data-menu-sub-trigger-secondary=""
                >
                  <span>Share actions</span>
                  <span className="playground-menu-sub-arrow" aria-hidden="true">›</span>
                </Menu.SubTrigger>
                <Menu.SubContent
                  className="playground-menu-content playground-submenu-content"
                  sideOffset={state.subSideOffset}
                  data-menu-sub-content-secondary=""
                  data-playground-inspect=""
                  ref={(element) => actions.markPartRef("subContentSecondary", element)}
                >
                  <Menu.Item
                    className="playground-menu-item"
                    value="copy-link"
                    data-menu-sub-item-secondary=""
                    onSelect={() => actions.handleActionSelect("copy-link")}
                  >
                    Copy link
                  </Menu.Item>
                </Menu.SubContent>
              </Menu.Sub>
            </>
          ) : null}
        </Menu.Content>
      </Menu.Root>
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
          aria-label="Menu modal host"
        >
          <Dialog.Title className="dialog-title">Menu in dialog</Dialog.Title>
          <Dialog.Description className="dialog-description">
            Portalled Menu content should remain inside the modal focus scope.
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

export function MenuScenarioToolbar({
  state,
  actions,
}: {
  state: MenuScenarioState;
  actions: MenuScenarioActions;
}) {
  return (
    <ControlToolbar label="Menu controls">
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
        <MenuSection label="Position">
          <MenuCheckboxControl checked={state.useAnchorPoint} label="Anchor to click point" value="use-anchor-point" onChange={actions.setUseAnchorPoint} />
          <MenuCheckboxControl checked={state.sideOffset === 16} label="Large offset" value="large-offset" onChange={(checked) => actions.setSideOffset(checked ? 16 : 4)} />
          <MenuCheckboxControl checked={state.contentAriaLabel} label="Content ariaLabel" value="content-aria-label" onChange={actions.setContentAriaLabel} />
          <MenuCheckboxControl checked={state.contentLoopOff} label="Content loop off" value="content-loop-off" onChange={actions.setContentLoopOff} />
        </MenuSection>
        <MenuSection label="Nesting">
          <MenuCheckboxControl checked={state.insideDialog} label="Inside Dialog" value="inside-dialog" onChange={actions.setInsideDialog} />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Items" value="items">
        <MenuSection label="Selection">
          <MenuCheckboxControl checked={state.checkboxChecked} label="Checkbox checked" value="checkbox-checked" onChange={actions.setCheckboxChecked} />
          <MenuCheckboxControl checked={state.closeCheckboxOnSelect} label="Checkbox closes" value="checkbox-closes" onChange={actions.setCloseCheckboxOnSelect} />
          <MenuCheckboxControl checked={state.closeRadioOnSelect} label="Radio closes" value="radio-closes" onChange={actions.setCloseRadioOnSelect} />
        </MenuSection>
        <MenuRadioControl label="Radio value" options={radioOptions} value={state.radioValue} onChange={actions.setRadioValue} />
        <MenuRadioControl label="Radio value 2" options={radioOptions} value={state.radioValueSecondary} onChange={actions.setRadioValueSecondary} />
        <MenuSection label="Availability">
          <MenuCheckboxControl checked={state.showDisabledItem} label="Show disabled item" value="show-disabled-item" onChange={actions.setShowDisabledItem} />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Submenu" value="submenu">
        <MenuSection label="Sub">
          <MenuCheckboxControl checked={state.showSubmenu} label="Show submenu" value="show-submenu" onChange={actions.setShowSubmenu} />
          <MenuCheckboxControl checked={state.disableSecondSubmenu} label="Disable share submenu" value="disable-second-submenu" onChange={actions.setDisableSecondSubmenu} />
          <MenuCheckboxControl checked={state.controlledSubmenu} label="Controlled submenu" value="controlled-submenu" onChange={actions.setControlledSubmenu} />
          <MenuCheckboxControl checked={state.subContentAriaLabel} label="Sub ariaLabel" value="sub-aria-label" onChange={actions.setSubContentAriaLabel} />
          <MenuCheckboxControl checked={state.subSideOffset === 12} label="Large sub offset" value="large-sub-offset" onChange={(checked) => actions.setSubSideOffset(checked ? 12 : 4)} />
          <MenuCheckboxControl checked={state.showNestedSubmenu} label="Nested submenu" value="nested-submenu" onChange={actions.setShowNestedSubmenu} />
        </MenuSection>
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioControl label="Item" options={compositionOptions} value={state.itemComposition} onChange={actions.setItemComposition} />
        <MenuSection label="Events">
          <MenuCheckboxControl checked={state.blockItemSelect} label="Block item select" value="block-item-select" onChange={actions.setBlockItemSelect} />
          <MenuCheckboxControl checked={state.logPointer} label="Log pointer" value="log-pointer" onChange={actions.setLogPointer} />
        </MenuSection>
      </ToolbarGroup>
    </ControlToolbar>
  );
}

export function MenuScenarioAnatomy({
  state,
  openGroups,
  onOpenGroupsChange,
}: {
  state: MenuScenarioState;
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
            { label: "role", value: state.parts.subContentRole, category: "aria" },
            { label: "aria-label", value: state.parts.subContentLabel, category: "aria" },
            { label: "aria-labelledby", value: state.parts.subContentLabelledBy, category: "aria" },
            { label: "data-state", value: state.parts.subContentState, category: "data" },
            { label: "data-side", value: state.parts.subContentSide, category: "data" },
            { label: "data-positioned", value: state.parts.subContentPositioned, category: "data" },
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

export function MenuScenarioLog({ state }: { state: MenuScenarioState }) {
  return <ScenarioEventLog log={state.log} />;
}

const sideOptions: readonly MenuSide[] = ["bottom", "top", "right", "left"];
const alignOptions: readonly MenuAlign[] = ["start", "center", "end"];
const radioOptions = ["compact", "comfortable"] as const;
const compositionOptions: readonly MenuItemCompositionMode[] = ["default", "asChild", "render"];

type MenuActionItemProps = {
  mode: MenuItemCompositionMode;
  children: ReactNode;
  value: string;
  disabled: boolean;
  onSelect: () => void;
  onClick: (event: { preventDefault: () => void }) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  "data-menu-item-primary": string;
};

function MenuActionItem({
  mode,
  children,
  value,
  disabled,
  onSelect,
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...dataProps
}: MenuActionItemProps) {
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
      <Menu.Item
        {...sharedProps}
        asChild
      >
        <span>{children}</span>
      </Menu.Item>
    );
  }

  if (mode === "render") {
    return (
      <Menu.Item
        {...sharedProps}
        render="section"
      >
        {children}
      </Menu.Item>
    );
  }

  return (
    <Menu.Item
      {...sharedProps}
    >
      {children}
    </Menu.Item>
  );
}

function getAnchorPoint(element: HTMLElement | null, side: MenuSide, align: MenuAlign) {
  const rect = element?.getBoundingClientRect();
  if (!rect) return null;

  const xByAlign = {
    start: rect.left,
    center: rect.left + rect.width / 2,
    end: rect.right,
  } satisfies Record<MenuAlign, number>;
  const yByAlign = {
    start: rect.top,
    center: rect.top + rect.height / 2,
    end: rect.bottom,
  } satisfies Record<MenuAlign, number>;

  if (side === "top") return { x: xByAlign[align], y: rect.top };
  if (side === "bottom") return { x: xByAlign[align], y: rect.bottom };
  if (side === "left") return { x: rect.left, y: yByAlign[align] };
  return { x: rect.right, y: yByAlign[align] };
}

function handleAnchorClick(
  event: MouseEvent<HTMLButtonElement>,
  actions: MenuScenarioActions,
) {
  const rect = event.currentTarget.getBoundingClientRect();
  actions.setAnchorPoint({
    x: event.clientX,
    y: event.clientY,
    localX: event.clientX - rect.left,
    localY: event.clientY - rect.top,
  });
}
