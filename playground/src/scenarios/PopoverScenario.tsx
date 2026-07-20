import { Button } from "@flowstack-ui/atom/button";
import { Popover } from "@flowstack-ui/atom/popover";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, MenuSection, PropsToolbarGroup, ScenarioEventLog, ToolbarGroup, partProps } from "../WorkbenchPrimitives";
import { useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type {
  PopoverArrowSize,
  PopoverAlign,
  PopoverCompositionMode,
  PopoverPortalMode,
  PopoverScenarioActions,
  PopoverScenarioState,
  PopoverSide,
  PopoverTriggerMode,
} from "./usePopoverScenario";

export function PopoverScenarioCanvas({
  state,
  actions,
}: {
  state: PopoverScenarioState;
  actions: PopoverScenarioActions;
}) {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const preferredFocusRef = useRef<HTMLButtonElement | null>(null);
  const finalFocusRef = useRef<HTMLButtonElement | null>(null);
  const rootProps = state.controlled
    ? { open: state.open, onOpenChange: actions.handleOpenChange }
    : { defaultOpen: state.defaultOpen, onOpenChange: actions.handleOpenChange };
  const portalContainerProp = state.portalMode === "container"
    ? portalContainer
    : undefined;
  const portalDisabled = state.portalMode === "disabled";

  return (
    <div className="popover-stage">
      <Popover.Root
        key={`${state.controlled ? "controlled" : "uncontrolled"}-${state.defaultOpen}`}
        {...rootProps}
        modal={state.modal}
        triggerMode={state.triggerMode}
        closeOnInteractOutside={state.closeOnInteractOutside}
        disabled={state.disabled}
      >
        {state.useAnchor ? (
          <PopoverAnchorExample
            customSlot={state.customAnchorSlot}
            mode={state.anchorComposition}
            propCheck={state.propCheck}
          />
        ) : null}
        <PopoverTriggerExample
          customSlot={state.customTriggerSlot}
          mode={state.triggerComposition}
          onClick={actions.handleTriggerClick}
          onKeyDown={actions.handleTriggerKeyDown}
          propCheck={state.propCheck}
        />
        {state.controlled ? (
          <div className="controlled-actions">
            <Button.Root
              className="atom-button secondary"
              disabled={state.open}
              onPress={() => actions.setControlledOpen(true)}
            >
              Open controlled
            </Button.Root>
            <Button.Root
              className="atom-button secondary"
              disabled={!state.open}
              onPress={() => actions.setControlledOpen(false)}
            >
              Close controlled
            </Button.Root>
          </div>
        ) : null}
        <Popover.Portal container={portalContainerProp} disabled={portalDisabled}>
          <Popover.Content
            aria-label={state.useNativeAriaLabel ? "Project quick actions" : undefined}
            initialFocus={state.customFocusTargets ? preferredFocusRef : undefined}
            finalFocus={state.customFocusTargets ? finalFocusRef : undefined}
            className="atom-popover-content"
            data-playground-popover-content=""
            data-playground-inspect=""
            {...partProps("content", { customSlot: state.customContentSlot, propCheck: state.propCheck }, "popover-content-custom")}
            side={state.side}
            align={state.align}
            sideOffset={state.sideOffset}
          >
            <p className="popover-kicker">Project</p>
            <Popover.Title className="popover-title" data-playground-popover-title="" data-playground-inspect="">
              Quick actions
            </Popover.Title>
            <Popover.Description className="popover-copy" data-playground-popover-description="" data-playground-inspect="">
              Change placement, anchor behavior, modal focus, and dismiss rules.
            </Popover.Description>
            <label>
              Project name
              <input defaultValue="Atom" data-playground-popover-input="" />
            </label>
            {state.nestedPopover ? <NestedPopoverExample /> : null}
            <div className="dialog-actions">
              <button ref={preferredFocusRef} className="atom-button secondary" type="button">
                Secondary action
              </button>
              <PopoverCloseExample
                mode={state.closeComposition}
                customSlot={state.customCloseSlot}
                onClick={actions.handleCloseClick}
                propCheck={state.propCheck}
              >
                Close
              </PopoverCloseExample>
            </div>
            <PopoverArrowExample
              customSlot={state.customArrowSlot}
              mode={state.arrowComposition}
              propCheck={state.propCheck}
              size={state.arrowSize}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <div
        className="popover-portal-target"
        data-playground-inspect=""
        data-playground-popover-portal-target=""
        ref={setPortalContainer}
      />
      <button ref={finalFocusRef} className="atom-button behind-dialog-button" type="button">
        Outside focus target
      </button>
    </div>
  );
}

export function PopoverScenarioAnatomy({
  openGroups,
  state,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  state: PopoverScenarioState;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const trigger = document.querySelector<HTMLElement>("[data-playground-popover-trigger]");
  const content = document.querySelector<HTMLElement>("[data-playground-popover-content]");
  const anchor = document.querySelector<HTMLElement>("[data-playground-popover-anchor]");
  const arrow = document.querySelector<HTMLElement>("[data-playground-popover-arrow]");
  const portalTarget = document.querySelector<HTMLElement>("[data-playground-popover-portal-target]");
  const close = document.querySelector<HTMLElement>("[data-playground-popover-close]");
  const title = document.querySelector<HTMLElement>("[data-playground-popover-title]");
  const description = document.querySelector<HTMLElement>("[data-playground-popover-description]");
  const nestedContent = document.querySelector<HTMLElement>("[data-playground-nested-popover-content]");

  const sections: AnatomySection[] = [
    {
      title: "Root",
      summary: state.controlled ? "controlled" : "uncontrolled",
      rows: [
        { label: "Mode", value: state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Open", value: state.open ? "yes" : "no", category: "state" },
        { label: "Default open", value: state.defaultOpen ? "yes" : "no", category: "state" },
        { label: "Disabled", value: state.disabled ? "yes" : "no", category: "state" },
        { label: "Modal", value: state.modal ? "yes" : "no", category: "state" },
        { label: "Trigger mode", value: state.triggerMode, category: "state" },
        { label: "Close outside", value: state.closeOnInteractOutside ? "yes" : "no", category: "state" },
        { label: "Block trigger event", value: state.blockTriggerEvent ? "yes" : "no", category: "state" },
        { label: "Block close event", value: state.blockCloseEvent ? "yes" : "no", category: "state" },
      ],
    },
    {
      title: "Anchor",
      selector: "[data-playground-popover-anchor]",
      inactive: !state.useAnchor,
      summary: state.useAnchor ? state.anchorComposition : "not rendered",
      rows: [
        { label: "Exists", value: anchor ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.anchorComposition, category: "composition" },
        { label: "data-slot", value: anchor?.dataset.slot ?? "none", category: "data" },
      ],
    },
    {
      title: "Trigger",
      selector: "[data-playground-popover-trigger]",
      summary: trigger?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: trigger ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.triggerComposition, category: "composition" },
        { label: "aria-controls", value: trigger?.getAttribute("aria-controls") ?? "none", category: "aria" },
        { label: "aria-expanded", value: trigger?.getAttribute("aria-expanded") ?? "none", category: "aria" },
        { label: "aria-haspopup", value: trigger?.getAttribute("aria-haspopup") ?? "none", category: "aria" },
        { label: "data-state", value: trigger?.dataset.state ?? "none", category: "data" },
        { label: "data-trigger-mode", value: trigger?.dataset.triggerMode ?? "none", category: "data" },
      ],
    },
    {
      title: "Portal",
      inactive: !content,
      summary: state.portalMode,
      rows: [
        { label: "Content exists", value: content ? "yes" : "no", category: "presence" },
        { label: "Mode", value: state.portalMode, category: "state" },
        { label: "Target exists", value: portalTarget ? "yes" : "no", category: "presence" },
        { label: "Parent", value: content?.parentElement?.tagName.toLowerCase() ?? "none", category: "behavior" },
        { label: "Inside canvas", value: content?.closest(".canvas") ? "yes" : "no", category: "behavior" },
        { label: "In custom target", value: content?.parentElement === portalTarget ? "yes" : "no", category: "behavior" },
      ],
    },
    {
      title: "Content",
      selector: "[data-playground-popover-content]",
      inactive: !content,
      summary: content?.dataset.state ?? "not rendered",
      rows: [
        { label: "Exists", value: content ? "yes" : "no", category: "presence" },
        { label: "role", value: content?.getAttribute("role") ?? "none", category: "aria" },
        { label: "aria-label", value: content?.getAttribute("aria-label") ?? "none", category: "aria" },
        { label: "data-side", value: content?.dataset.side ?? "none", category: "data" },
        { label: "data-state", value: content?.dataset.state ?? "none", category: "data" },
        { label: "data-positioned", value: content?.hasAttribute("data-positioned") ? "yes" : "no", category: "data" },
        { label: "Side", value: state.side, category: "behavior" },
        { label: "Align", value: state.align, category: "behavior" },
        { label: "Offset", value: String(state.sideOffset), category: "behavior" },
        { label: "Nested enabled", value: state.nestedPopover ? "yes" : "no", category: "behavior" },
        { label: "Nested content", value: nestedContent ? "yes" : "no", category: "presence" },
        { label: "Custom focus targets", value: state.customFocusTargets ? "yes" : "no", category: "behavior" },
      ],
    },
    {
      title: "Title",
      selector: "[data-playground-popover-title]",
      inactive: !title,
      summary: title?.tagName.toLowerCase() ?? "not rendered",
      rows: [
        { label: "Exists", value: title ? "yes" : "no", category: "presence" },
        { label: "ID", value: title?.id ?? "none", category: "identity" },
        { label: "Names Content", value: content?.getAttribute("aria-labelledby") === title?.id ? "yes" : "no", category: "aria" },
      ],
    },
    {
      title: "Description",
      selector: "[data-playground-popover-description]",
      inactive: !description,
      summary: description?.tagName.toLowerCase() ?? "not rendered",
      rows: [
        { label: "Exists", value: description ? "yes" : "no", category: "presence" },
        { label: "ID", value: description?.id ?? "none", category: "identity" },
        { label: "Describes Content", value: content?.getAttribute("aria-describedby") === description?.id ? "yes" : "no", category: "aria" },
      ],
    },
    {
      title: "Close",
      selector: "[data-playground-popover-close]",
      inactive: !content,
      summary: state.closeComposition,
      rows: [
        { label: "Exists", value: close ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.closeComposition, category: "composition" },
        { label: "data-slot", value: close?.dataset.slot ?? "none", category: "data" },
      ],
    },
    {
      title: "Arrow",
      selector: "[data-playground-popover-arrow]",
      inactive: !arrow,
      summary: arrow?.dataset.side ?? "not rendered",
      rows: [
        { label: "Exists", value: arrow ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.arrowComposition, category: "composition" },
        { label: "Size", value: state.arrowSize, category: "behavior" },
        { label: "width", value: arrow?.getAttribute("width") ?? "none", category: "identity" },
        { label: "height", value: arrow?.getAttribute("height") ?? "none", category: "identity" },
        { label: "data-side", value: arrow?.dataset.side ?? "none", category: "data" },
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

export function PopoverScenarioToolbar({
  state,
  actions,
}: {
  state: PopoverScenarioState;
  actions: PopoverScenarioActions;
}) {
  return (
    <ControlToolbar label="Popover controls">
      <ToolbarGroup title="State" value="state">
        <MenuSection label="Root">
          <MenuCheckboxControl checked={state.controlled} label="Controlled" value="controlled" onChange={actions.setControlled} />
          {!state.controlled ? (
            <MenuCheckboxControl checked={state.defaultOpen} label="Default Open" value="default-open" onChange={actions.setDefaultOpen} />
          ) : null}
          <MenuCheckboxControl checked={state.disabled} label="Disabled" value="disabled" onChange={actions.setDisabled} />
          <MenuCheckboxControl checked={state.modal} label="Modal" value="modal" onChange={actions.setModal} />
          <MenuCheckboxControl checked={state.closeOnInteractOutside} label="Outside closes" value="outside-closes" onChange={actions.setCloseOnInteractOutside} />
        </MenuSection>
        <MenuRadioControl label="Trigger mode" options={triggerModeOptions} value={state.triggerMode} onChange={actions.setTriggerMode} />
      </ToolbarGroup>
      <ToolbarGroup title="Popup" value="popup">
        <MenuSection label="Anchor">
          <MenuCheckboxControl checked={state.useAnchor} label="Use anchor" value="use-anchor" onChange={actions.setUseAnchor} />
          <MenuCheckboxControl checked={state.useNativeAriaLabel} label="Use native aria-label" value="use-native-aria-label" onChange={actions.setUseNativeAriaLabel} />
          <MenuCheckboxControl checked={state.customFocusTargets} label="Custom focus targets" value="custom-focus-targets" onChange={actions.setCustomFocusTargets} />
          <MenuCheckboxControl checked={state.nestedPopover} label="Nested Popover" value="nested-popover" onChange={actions.setNestedPopover} />
        </MenuSection>
        <MenuRadioControl label="Portal" options={portalModeOptions} value={state.portalMode} onChange={actions.setPortalMode} />
        <MenuRadioControl label="Side" options={sideOptions} value={state.side} onChange={actions.setSide} />
        <MenuRadioControl label="Align" options={alignOptions} value={state.align} onChange={actions.setAlign} />
        <MenuRadioControl label="Offset" options={offsetOptions} value={String(state.sideOffset)} onChange={(value) => actions.setSideOffset(Number(value))} />
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioControl label="Trigger" options={compositionOptions} value={state.triggerComposition} onChange={actions.setTriggerComposition} />
        <MenuRadioControl label="Anchor" options={compositionOptions} value={state.anchorComposition} onChange={actions.setAnchorComposition} />
        <MenuRadioControl label="Arrow" options={compositionOptions} value={state.arrowComposition} onChange={actions.setArrowComposition} />
        <MenuRadioControl label="Arrow Size" options={arrowSizeOptions} value={state.arrowSize} onChange={actions.setArrowSize} />
        <MenuRadioControl label="Close button" options={compositionOptions} value={state.closeComposition} onChange={actions.setCloseComposition} />
        <MenuSection label="Blocked events">
          <MenuCheckboxControl checked={state.blockTriggerEvent} label="Block trigger event" value="block-trigger-event" onChange={actions.setBlockTriggerEvent} />
          <MenuCheckboxControl checked={state.blockCloseEvent} label="Block close event" value="block-close-event" onChange={actions.setBlockCloseEvent} />
        </MenuSection>
      </ToolbarGroup>
      <PropsToolbarGroup
        propCheck={state.propCheck}
        customSlots={[
          { checked: state.customAnchorSlot, label: "Anchor Slot", value: "anchor-slot", onChange: actions.setCustomAnchorSlot },
          { checked: state.customTriggerSlot, label: "Trigger Slot", value: "trigger-slot", onChange: actions.setCustomTriggerSlot },
          { checked: state.customContentSlot, label: "Content Slot", value: "content-slot", onChange: actions.setCustomContentSlot },
          { checked: state.customArrowSlot, label: "Arrow Slot", value: "arrow-slot", onChange: actions.setCustomArrowSlot },
          { checked: state.customCloseSlot, label: "Close Slot", value: "close-slot", onChange: actions.setCustomCloseSlot },
        ]}
        onPropCheckChange={actions.setPropCheck}
      />
    </ControlToolbar>
  );
}

export function PopoverScenarioLog({
  state,
}: {
  state: PopoverScenarioState;
}) {
  return <ScenarioEventLog log={state.log} />;
}

export function getPopoverSource(state: PopoverScenarioState) {
  const rootProps = [
    state.controlled ? "open={open}" : state.defaultOpen ? "defaultOpen" : null,
    state.modal ? "modal" : null,
    state.triggerMode !== "click" ? `triggerMode="${state.triggerMode}"` : null,
    !state.closeOnInteractOutside ? "closeOnInteractOutside={false}" : null,
    state.disabled ? "disabled" : null,
    "onOpenChange={setOpen}",
  ].filter(Boolean).join("\n  ");
  const portalProps = [
    state.portalMode === "container" ? "container={portalContainer}" : null,
    state.portalMode === "disabled" ? "disabled" : null,
  ].filter(Boolean).join(" ");

  return `<Popover.Root
  ${rootProps}
>
  ${state.useAnchor ? getPopoverAnchorSource(state) : ""}
  ${getPopoverTriggerSource(state)}
  <Popover.Portal${portalProps ? ` ${portalProps}` : ""}>
    <Popover.Content
      ${state.useNativeAriaLabel ? `aria-label="Project quick actions"` : ""}
      ${state.customFocusTargets ? `initialFocus={preferredFocusRef} finalFocus={finalFocusRef}` : ""}
      ${sourceProps("content", state.customContentSlot, state.propCheck, "popover-content-custom")}
      side="${state.side}"
      align="${state.align}"
      sideOffset={${state.sideOffset}}
    >
      <Popover.Title>Quick actions</Popover.Title>
      <Popover.Description>Change placement, anchor behavior, modal focus, and dismiss rules.</Popover.Description>
      <label>Project name <input defaultValue="Atom" /></label>
      ${state.nestedPopover ? getNestedPopoverSource() : ""}
      ${getPopoverCloseSource(state)}
      ${getPopoverArrowSource(state)}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>`;
}

function PopoverTriggerExample({
  customSlot,
  mode,
  onClick,
  onKeyDown,
  propCheck,
}: {
  customSlot: boolean;
  mode: PopoverCompositionMode;
  onClick: PopoverScenarioActions["handleTriggerClick"];
  onKeyDown: PopoverScenarioActions["handleTriggerKeyDown"];
  propCheck: boolean;
}) {
  const props = {
    className: "atom-button",
    "data-playground-popover-trigger": "",
    "data-playground-inspect": "",
    ...partProps("trigger", { customSlot, propCheck }, "popover-trigger-custom"),
    onClick,
    onKeyDown,
  };

  if (mode === "asChild") {
    return (
      <Popover.Trigger asChild {...props}>
        <span>Open popover</span>
      </Popover.Trigger>
    );
  }

  if (mode === "render") {
    return (
      <Popover.Trigger render={<section />} {...props}>
        Open popover
      </Popover.Trigger>
    );
  }

  return <Popover.Trigger {...props}>Open popover</Popover.Trigger>;
}

function PopoverAnchorExample({
  customSlot,
  mode,
  propCheck,
}: {
  customSlot: boolean;
  mode: PopoverCompositionMode;
  propCheck: boolean;
}) {
  const props = {
    className: "popover-anchor-box",
    "data-playground-popover-anchor": "",
    "data-playground-inspect": "",
    ...partProps("anchor", { customSlot, propCheck }, "popover-anchor-custom"),
  };

  if (mode === "asChild") {
    return (
      <Popover.Anchor asChild {...props}>
        <span>Anchor point</span>
      </Popover.Anchor>
    );
  }

  if (mode === "render") {
    return (
      <Popover.Anchor render={<section />} {...props}>
        Anchor point
      </Popover.Anchor>
    );
  }

  return (
    <Popover.Anchor {...props}>
      <span className="popover-anchor-box">Anchor point</span>
    </Popover.Anchor>
  );
}

function PopoverCloseExample({
  children,
  customSlot,
  mode,
  onClick,
  propCheck,
}: {
  children: ReactNode;
  customSlot: boolean;
  mode: PopoverCompositionMode;
  onClick: PopoverScenarioActions["handleCloseClick"];
  propCheck: boolean;
}) {
  const props = {
    className: "atom-button",
    "data-playground-popover-close": "",
    "data-playground-inspect": "",
    ...partProps("close", { customSlot, propCheck }, "popover-close-custom"),
    onClick,
  };

  if (mode === "asChild") {
    return (
      <Popover.Close asChild {...props}>
        <span>{children}</span>
      </Popover.Close>
    );
  }

  if (mode === "render") {
    return (
      <Popover.Close render={<section />} {...props}>
        {children}
      </Popover.Close>
    );
  }

  return <Popover.Close {...props}>{children}</Popover.Close>;
}

function PopoverArrowExample({
  customSlot,
  mode,
  propCheck,
  size,
}: {
  customSlot: boolean;
  mode: PopoverCompositionMode;
  propCheck: boolean;
  size: PopoverArrowSize;
}) {
  const sizeProps = getArrowSizeProps(size);
  const props = {
    className: "atom-popover-arrow",
    "data-playground-popover-arrow": "",
    ...partProps("arrow", { customSlot, propCheck }, "popover-arrow-custom"),
    ...sizeProps,
  };

  if (mode === "asChild") {
    return (
      <Popover.Arrow asChild {...props}>
        <svg>
          <polygon points="0,5 5,0 10,5" />
        </svg>
      </Popover.Arrow>
    );
  }

  if (mode === "render") {
    return <Popover.Arrow render={<svg />} {...props} />;
  }

  return <Popover.Arrow {...props} />;
}

function NestedPopoverExample() {
  return (
    <Popover.Root>
      <Popover.Trigger
        className="atom-button secondary"
        data-playground-nested-popover-trigger=""
        data-playground-inspect=""
      >
        Nested popover
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="atom-popover-content nested-popover-content"
          data-playground-nested-popover-content=""
          data-playground-inspect=""
          side="right"
          align="start"
          sideOffset={8}
        >
          <p className="popover-kicker">Nested</p>
          <Popover.Title className="popover-title">Nested quick actions</Popover.Title>
          <Popover.Description className="popover-copy">Escape should close this layer before the outer popover.</Popover.Description>
          <Popover.Close className="atom-button secondary" data-playground-nested-popover-close="" data-playground-inspect="">
            Close nested
          </Popover.Close>
          <Popover.Arrow className="atom-popover-arrow" data-playground-nested-popover-arrow="" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function getPopoverTriggerSource(state: PopoverScenarioState) {
  const props = [
    sourceInlineProps("trigger", state.customTriggerSlot, state.propCheck, "popover-trigger-custom"),
    state.blockTriggerEvent
      ? ` onClick={(event) => event.preventDefault()} onKeyDown={(event) => event.preventDefault()}`
      : "",
  ].join("");

  if (state.triggerComposition === "asChild") {
    return `<Popover.Trigger asChild${props}>
    <span>Open popover</span>
  </Popover.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<Popover.Trigger render={<section />}${props}>
    Open popover
  </Popover.Trigger>`;
  }

  return `<Popover.Trigger${props}>Open popover</Popover.Trigger>`;
}

function getPopoverAnchorSource(state: PopoverScenarioState) {
  const props = sourceInlineProps("anchor", state.customAnchorSlot, state.propCheck, "popover-anchor-custom");

  if (state.anchorComposition === "asChild") {
    return `<Popover.Anchor asChild${props}>
    <span>Anchor point</span>
  </Popover.Anchor>`;
  }

  if (state.anchorComposition === "render") {
    return `<Popover.Anchor render={<section />}${props}>
    Anchor point
  </Popover.Anchor>`;
  }

  return `<Popover.Anchor${props}>
    <span>Anchor point</span>
  </Popover.Anchor>`;
}

function getPopoverCloseSource(state: PopoverScenarioState) {
  const props = [
    sourceInlineProps("close", state.customCloseSlot, state.propCheck, "popover-close-custom"),
    state.blockCloseEvent ? ` onClick={(event) => event.preventDefault()}` : "",
  ].join("");

  if (state.closeComposition === "asChild") {
    return `<Popover.Close asChild${props}>
        <span>Close</span>
      </Popover.Close>`;
  }

  if (state.closeComposition === "render") {
    return `<Popover.Close render={<section />}${props}>
        Close
      </Popover.Close>`;
  }

  return `<Popover.Close${props}>Close</Popover.Close>`;
}

function getPopoverArrowSource(state: PopoverScenarioState) {
  const props = [
    sourceInlineProps("arrow", state.customArrowSlot, state.propCheck, "popover-arrow-custom"),
    sourceArrowSizeProps(state.arrowSize),
  ].filter(Boolean).join("");

  if (state.arrowComposition === "asChild") {
    return `<Popover.Arrow asChild${props}>
        <svg>
          <polygon points="0,5 5,0 10,5" />
        </svg>
      </Popover.Arrow>`;
  }

  if (state.arrowComposition === "render") {
    return `<Popover.Arrow render={<svg />}${props} />`;
  }

  return `<Popover.Arrow${props} />`;
}

function getNestedPopoverSource() {
  return `<Popover.Root>
        <Popover.Trigger>Nested popover</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content side="right" align="start">
            <Popover.Title>Nested quick actions</Popover.Title>
            <Popover.Description>Escape closes this layer first.</Popover.Description>
            <Popover.Close>Close nested</Popover.Close>
            <Popover.Arrow />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>`;
}

function getArrowSizeProps(size: PopoverArrowSize) {
  if (size === "wide") return { width: 16, height: 8 };
  return {};
}

function sourceArrowSizeProps(size: PopoverArrowSize) {
  if (size === "wide") return " width={16} height={8}";
  return "";
}

function sourceProps(part: string, customSlot: boolean, propCheck: boolean, slot: string) {
  return [
    customSlot ? `data-slot="${slot}"` : null,
    propCheck ? `data-prop-check="${part}"` : null,
  ].filter(Boolean).join("\n      ");
}

function sourceInlineProps(part: string, customSlot: boolean, propCheck: boolean, slot: string) {
  const props = sourceProps(part, customSlot, propCheck, slot).split("\n      ").join(" ");
  return props ? ` ${props}` : "";
}

const compositionOptions = [
  { label: "Default", value: "default" },
  { label: "As Child", value: "asChild" },
  { label: "Render", value: "render" },
] as const;

const arrowSizeOptions = [
  { label: "Default", value: "default" },
  { label: "Wide", value: "wide" },
] as const satisfies readonly { label: string; value: PopoverArrowSize }[];

const portalModeOptions = [
  { label: "Body", value: "body" },
  { label: "Container", value: "container" },
  { label: "Disabled", value: "disabled" },
] as const satisfies readonly { label: string; value: PopoverPortalMode }[];

const triggerModeOptions = [
  { label: "Click", value: "click" },
  { label: "Hover", value: "hover" },
] as const satisfies readonly { label: string; value: PopoverTriggerMode }[];

const sideOptions = [
  { label: "Bottom", value: "bottom" },
  { label: "Top", value: "top" },
  { label: "Right", value: "right" },
  { label: "Left", value: "left" },
] as const satisfies readonly { label: string; value: PopoverSide }[];

const alignOptions = [
  { label: "Start", value: "start" },
  { label: "Center", value: "center" },
  { label: "End", value: "end" },
] as const satisfies readonly { label: string; value: PopoverAlign }[];

const offsetOptions = [
  { label: "0", value: "0" },
  { label: "8", value: "8" },
  { label: "16", value: "16" },
] as const;
