"use client";

import {
  ListboxGroup,
  ListboxLabel,
  ListboxOption,
  ListboxOptionText,
  ListboxRoot,
} from "./primitives/listbox/index.js";

export {
  ListboxContextProvider,
  ListboxGroup,
  ListboxGroupContextProvider,
  ListboxLabel,
  ListboxOption,
  ListboxOptionContextProvider,
  ListboxOptionText,
  ListboxRoot,
  useListboxContext,
  useListboxGroupContext,
  useListboxOptionContext,
} from "./primitives/listbox/index.js";
export type {
  ListboxContextValue,
  ListboxGroupContextValue,
  ListboxGroupProps,
  ListboxItemData,
  ListboxItemEntry,
  ListboxLabelProps,
  ListboxOptionContextValue,
  ListboxOptionProps,
  ListboxOptionTextProps,
  ListboxOrientation,
  ListboxRootProps,
  ListboxSelectionValue,
} from "./primitives/listbox/index.js";

export const Listbox = {
  Root: ListboxRoot,
  Option: ListboxOption,
  OptionText: ListboxOptionText,
  Group: ListboxGroup,
  Label: ListboxLabel,
} as const;
