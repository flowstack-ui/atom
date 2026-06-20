"use client";

export interface ComboboxOption {
  value: string;
  label?: string;
  disabled?: boolean;
  group?: string;
}

export interface ComboboxOptionGroup {
  label: string | null;
  options: ComboboxOption[];
}

export type ComboboxFilter = (
  options: ComboboxOption[],
  inputValue: string,
) => ComboboxOption[];

export function getComboboxOptionLabel(option: ComboboxOption): string {
  return option.label ?? option.value;
}

export function filterComboboxOptions(
  options: ComboboxOption[],
  inputValue: string,
): ComboboxOption[] {
  if (!inputValue) return options;

  const normalizedInput = inputValue.toLowerCase();
  return options.filter((option) =>
    getComboboxOptionLabel(option).toLowerCase().includes(normalizedInput),
  );
}

export function groupComboboxOptions(
  options: ComboboxOption[],
  groupBy?: (option: ComboboxOption) => string,
): ComboboxOptionGroup[] {
  if (!groupBy) return [{ label: null, options }];

  const groupMap = new Map<string, ComboboxOption[]>();
  for (const option of options) {
    const label = groupBy(option);
    const groupOptions = groupMap.get(label) ?? [];
    groupOptions.push(option);
    groupMap.set(label, groupOptions);
  }

  return Array.from(groupMap.entries()).map(([label, groupOptions]) => ({
    label,
    options: groupOptions,
  }));
}

export function getNextComboboxValue(
  values: string[],
  currentValue: string | null,
  direction: "next" | "previous",
): string | null {
  if (values.length === 0) return null;

  const currentIndex = currentValue ? values.indexOf(currentValue) : -1;
  if (currentIndex === -1) {
    return direction === "next" ? values[0] : values[values.length - 1] ?? null;
  }

  const delta = direction === "next" ? 1 : -1;
  const nextIndex = (currentIndex + delta + values.length) % values.length;
  return values[nextIndex] ?? null;
}
