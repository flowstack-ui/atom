import { Button } from "@flowstack-ui/atom/button";
import { Menubar } from "@flowstack-ui/atom/menubar";
import { Popover } from "@flowstack-ui/atom/popover";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import {
  AnatomyPanel,
  type AnatomySection,
} from "../AnatomyPanel";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type {
  PopoverAlign,
  PopoverCompositionMode,
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
  const rootProps = state.controlled
    ? { open: state.open, onOpenChange: actions.handleOpenChange }
    : { defaultOpen: false, onOpenChange: actions.handleOpenChange };

  return (
    <div className="popover-stage">
      <Popover.Root
        {...rootProps}
        modal={state.modal}
        triggerMode={state.triggerMode}
        closeOnInteractOutside={state.closeOnInteractOutside}
        disabled={state.disabled}
      >
        {state.useAnchor ? (
          <PopoverAnchorExample mode={state.anchorComposition} />
        ) : null}
        <PopoverTriggerExample
          mode={state.triggerComposition}
          onClick={actions.handleTriggerClick}
          onKeyDown={actions.handleTriggerKeyDown}
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
        <Popover.Portal disabled={false}>
          <Popover.Content
            ariaLabel={state.useAriaLabel ? "Project quick actions" : undefined}
            className="atom-popover-content"
            data-popover-content=""
            data-playground-inspect=""
            data-prop-check="content"
            side={state.side}
            align={state.align}
            sideOffset={state.sideOffset}
          >
            <p className="popover-kicker">Project</p>
            <h2 className="popover-title">Quick actions</h2>
            <p className="popover-copy">
              Change placement, anchor behavior, modal focus, and dismiss rules.
            </p>
            <div className="dialog-actions">
              <Button.Root className="atom-button secondary">
                Secondary action
              </Button.Root>
              <PopoverCloseExample
                mode={state.closeComposition}
                onClick={actions.handleCloseClick}
              >
                Close
              </PopoverCloseExample>
            </div>
            <Popover.Arrow
              className="atom-popover-arrow"
              data-popover-arrow=""
              data-prop-check="arrow"
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <Button.Root className="behind-dialog-button" tabIndex={-1}>
        Outside focus target
      </Button.Root>
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
  const trigger = document.querySelector<HTMLElement>("[data-popover-trigger]");
  const content = document.querySelector<HTMLElement>("[data-popover-content]");
  const anchor = document.querySelector<HTMLElement>("[data-popover-anchor]");
  const arrow = document.querySelector<HTMLElement>("[data-popover-arrow]");

  const sections: AnatomySection[] = [
    {
      title: "Root",
      summary: state.controlled ? "controlled" : "uncontrolled",
      rows: [
        { label: "Mode", value: state.controlled ? "controlled" : "uncontrolled", category: "state" },
        { label: "Open", value: state.open ? "yes" : "no", category: "state" },
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
      selector: "[data-popover-anchor]",
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
      selector: "[data-popover-trigger]",
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
      summary: content?.parentElement?.tagName.toLowerCase() ?? "not rendered",
      rows: [
        { label: "Content exists", value: content ? "yes" : "no", category: "presence" },
        { label: "Parent", value: content?.parentElement?.tagName.toLowerCase() ?? "none", category: "behavior" },
        { label: "Inside canvas", value: content?.closest(".canvas") ? "yes" : "no", category: "behavior" },
      ],
    },
    {
      title: "Content",
      selector: "[data-popover-content]",
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
      ],
    },
    {
      title: "Arrow",
      selector: "[data-popover-arrow]",
      inactive: !arrow,
      summary: arrow?.dataset.side ?? "not rendered",
      rows: [
        { label: "Exists", value: arrow ? "yes" : "no", category: "presence" },
        { label: "data-side", value: arrow?.dataset.side ?? "none", category: "data" },
      ],
    },
    {
      title: "Close",
      selector: "[data-popover-close]",
      inactive: !content,
      summary: state.closeComposition,
      rows: [
        { label: "Exists", value: document.querySelector("[data-popover-close]") ? "yes" : "no", category: "presence" },
        { label: "Composition", value: state.closeComposition, category: "composition" },
        { label: "data-slot", value: document.querySelector<HTMLElement>("[data-popover-close]")?.dataset.slot ?? "none", category: "data" },
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
    <Menubar.Root className="canvas-toolbar" aria-label="Popover controls">
      <ToolbarGroup title="State" value="state">
        <MenuSection label="Root">
          <MenuCheckboxControl checked={state.controlled} label="Controlled" value="controlled" onChange={actions.setControlled} />
          <MenuCheckboxControl checked={state.disabled} label="Disabled" value="disabled" onChange={actions.setDisabled} />
          <MenuCheckboxControl checked={state.modal} label="Modal" value="modal" onChange={actions.setModal} />
          <MenuCheckboxControl checked={state.closeOnInteractOutside} label="Outside closes" value="outside-closes" onChange={actions.setCloseOnInteractOutside} />
        </MenuSection>
        <MenuRadioControl label="Trigger mode" options={triggerModeOptions} value={state.triggerMode} onChange={actions.setTriggerMode} />
      </ToolbarGroup>
      <ToolbarGroup title="Popup" value="popup">
        <MenuSection label="Anchor">
          <MenuCheckboxControl checked={state.useAnchor} label="Use anchor" value="use-anchor" onChange={actions.setUseAnchor} />
          <MenuCheckboxControl checked={state.useAriaLabel} label="Use ariaLabel" value="use-aria-label" onChange={actions.setUseAriaLabel} />
        </MenuSection>
        <MenuRadioControl label="Side" options={sideOptions} value={state.side} onChange={actions.setSide} />
        <MenuRadioControl label="Align" options={alignOptions} value={state.align} onChange={actions.setAlign} />
        <MenuRadioControl label="Offset" options={offsetOptions} value={String(state.sideOffset)} onChange={(value) => actions.setSideOffset(Number(value))} />
      </ToolbarGroup>
      <ToolbarGroup title="Composition" value="composition">
        <MenuRadioControl label="Trigger" options={compositionOptions} value={state.triggerComposition} onChange={actions.setTriggerComposition} />
        <MenuRadioControl label="Anchor" options={compositionOptions} value={state.anchorComposition} onChange={actions.setAnchorComposition} />
        <MenuRadioControl label="Close button" options={compositionOptions} value={state.closeComposition} onChange={actions.setCloseComposition} />
        <MenuSection label="Blocked events">
          <MenuCheckboxControl checked={state.blockTriggerEvent} label="Block trigger event" value="block-trigger-event" onChange={actions.setBlockTriggerEvent} />
          <MenuCheckboxControl checked={state.blockCloseEvent} label="Block close event" value="block-close-event" onChange={actions.setBlockCloseEvent} />
        </MenuSection>
      </ToolbarGroup>
    </Menubar.Root>
  );
}

export function PopoverScenarioLog({
  state,
}: {
  state: PopoverScenarioState;
}) {
  if (state.log.length === 0) return null;

  return (
    <ScrollArea.Root className="log-scroll" orientation="vertical">
      <ScrollArea.Viewport className="log-scroll-viewport" focusable aria-label="Popover event log">
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

export function getPopoverSource(state: PopoverScenarioState) {
  const rootMode = state.controlled ? "open={open}" : "defaultOpen={false}";

  return `<Popover.Root
  ${rootMode}
  modal={${state.modal}}
  triggerMode="${state.triggerMode}"
  closeOnInteractOutside={${state.closeOnInteractOutside}}
  disabled={${state.disabled}}
  onOpenChange={setOpen}
>
  ${state.useAnchor ? getPopoverAnchorSource(state) : ""}
  ${getPopoverTriggerSource(state)}
  <Popover.Portal>
    <Popover.Content
      ${state.useAriaLabel ? `ariaLabel="Project quick actions"` : ""}
      side="${state.side}"
      align="${state.align}"
      sideOffset={${state.sideOffset}}
    >
      <h2>Quick actions</h2>
      <p>Change placement, anchor behavior, modal focus, and dismiss rules.</p>
      ${getPopoverCloseSource(state)}
      <Popover.Arrow />
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>`;
}

function PopoverTriggerExample({
  mode,
  onClick,
  onKeyDown,
}: {
  mode: PopoverCompositionMode;
  onClick: PopoverScenarioActions["handleTriggerClick"];
  onKeyDown: PopoverScenarioActions["handleTriggerKeyDown"];
}) {
  const props = {
    className: "atom-button",
    "data-popover-trigger": "",
    "data-playground-inspect": "",
    "data-prop-check": "trigger",
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

function PopoverAnchorExample({ mode }: { mode: PopoverCompositionMode }) {
  const props = {
    className: "popover-anchor-box",
    "data-popover-anchor": "",
    "data-playground-inspect": "",
    "data-prop-check": "anchor",
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

  return <Popover.Anchor {...props}>Anchor point</Popover.Anchor>;
}

function PopoverCloseExample({
  children,
  mode,
  onClick,
}: {
  children: ReactNode;
  mode: PopoverCompositionMode;
  onClick: PopoverScenarioActions["handleCloseClick"];
}) {
  const props = {
    className: "atom-button",
    "data-popover-close": "",
    "data-playground-inspect": "",
    "data-prop-check": "close",
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

function getPopoverTriggerSource(state: PopoverScenarioState) {
  if (state.triggerComposition === "asChild") {
    return `<Popover.Trigger asChild>
    <span>Open popover</span>
  </Popover.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<Popover.Trigger render={<section />}>
    Open popover
  </Popover.Trigger>`;
  }

  return `<Popover.Trigger>Open popover</Popover.Trigger>`;
}

function getPopoverAnchorSource(state: PopoverScenarioState) {
  if (state.anchorComposition === "asChild") {
    return `<Popover.Anchor asChild>
    <span>Anchor point</span>
  </Popover.Anchor>`;
  }

  if (state.anchorComposition === "render") {
    return `<Popover.Anchor render={<section />}>
    Anchor point
  </Popover.Anchor>`;
  }

  return `<Popover.Anchor>Anchor point</Popover.Anchor>`;
}

function getPopoverCloseSource(state: PopoverScenarioState) {
  if (state.closeComposition === "asChild") {
    return `<Popover.Close asChild>
        <span>Close</span>
      </Popover.Close>`;
  }

  if (state.closeComposition === "render") {
    return `<Popover.Close render={<section />}>
        Close
      </Popover.Close>`;
  }

  return `<Popover.Close>Close</Popover.Close>`;
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
