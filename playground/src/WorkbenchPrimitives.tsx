import { Menubar } from "@flowstack-ui/atom/menubar";
import { ScrollArea } from "@flowstack-ui/atom/scroll-area";
import type { ReactNode } from "react";

export type WorkbenchLogEntry = {
  id: number;
  time: string;
  text: string;
};

export type WorkbenchOption<T extends string = string> = {
  label: string;
  value: T;
};

export function ControlToolbar({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Menubar.Root className="canvas-toolbar" aria-label={label}>
      {children}
    </Menubar.Root>
  );
}

export function ToolbarGroup({
  title,
  value,
  closeOnSelect = false,
  sideOffset = 4,
  children,
}: {
  title: string;
  value: string;
  closeOnSelect?: boolean;
  sideOffset?: number;
  children: ReactNode;
}) {
  return (
    <Menubar.Menu closeOnSelect={closeOnSelect} value={value}>
      <Menubar.Trigger className="toolbar-group-trigger">{title}</Menubar.Trigger>
      <Menubar.Content className="toolbar-menu" align="start" sideOffset={sideOffset}>
        {children}
      </Menubar.Content>
    </Menubar.Menu>
  );
}

export function MenuSection({ label, children }: { label: string; children?: ReactNode }) {
  if (!children) {
    return <div className="toolbar-menu-label">{label}</div>;
  }

  return (
    <div className="toolbar-menu-section">
      <div className="toolbar-menu-label">{label}</div>
      <div className="toolbar-menu-items">{children}</div>
    </div>
  );
}

export function MenuCheckboxControl({
  checked,
  label,
  value,
  onChange,
}: {
  checked: boolean;
  label: string;
  value: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Menubar.CheckboxItem
      className="toolbar-menu-item"
      checked={checked}
      value={value}
      onCheckedChange={onChange}
    >
      <span>{label}</span>
      <span className="toolbar-menu-check" aria-hidden="true">
        {checked ? "✓" : ""}
      </span>
    </Menubar.CheckboxItem>
  );
}

export function MenuRadioControl<T extends string>({
  disabled = false,
  label,
  options,
  value,
  onChange,
}: {
  disabled?: boolean;
  label: string;
  options: readonly T[] | readonly WorkbenchOption<T>[];
  value: T | string;
  onChange: (value: T) => void;
}) {
  return (
    <Menubar.Group className="toolbar-menu-section">
      <MenuSection label={label} />
      <Menubar.RadioGroup
        className="toolbar-radio-group"
        value={value}
        onValueChange={(nextValue) => onChange(nextValue as T)}
      >
        {options.map((option) => {
          const normalized = normalizeOption(option);
          return (
            <Menubar.RadioItem
              className="toolbar-menu-item"
              disabled={disabled}
              key={normalized.value}
              value={normalized.value}
            >
              <span>{normalized.label}</span>
              <span className="toolbar-menu-check" aria-hidden="true">
                {value === normalized.value ? "✓" : ""}
              </span>
            </Menubar.RadioItem>
          );
        })}
      </Menubar.RadioGroup>
    </Menubar.Group>
  );
}

export function ScenarioEventLog({ log }: { log: WorkbenchLogEntry[] }) {
  if (log.length === 0) {
    return null;
  }

  return (
    <ScrollArea.Root className="log-scroll-area" orientation="vertical">
      <ScrollArea.Viewport className="log-scroll-viewport" focusable aria-label="Event log">
        <ol className="log-list">
          {log.map((entry) => (
            <li className="log-row" key={entry.id}>
              <span>{entry.time}</span>
              <span>{entry.text}</span>
            </li>
          ))}
        </ol>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  );
}

function normalizeOption<T extends string>(option: T | WorkbenchOption<T>): WorkbenchOption<T> {
  if (typeof option === "string") {
    return {
      label: formatOption(option),
      value: option,
    };
  }

  return option;
}

function formatOption(value: string) {
  if (value === "asChild") return "As Child";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
