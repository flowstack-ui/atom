"use client";

import {
  SwitchControl,
  SwitchField,
  SwitchHiddenInput,
  SwitchIndicator,
  SwitchLabel,
  SwitchRoot,
  SwitchRootProvider,
  SwitchThumb,
  SwitchThumbIndicator,
} from "./primitives/switch/index.js";

export {
  SwitchControl,
  SwitchContextProvider,
  SwitchField,
  SwitchHiddenInput,
  SwitchIndicator,
  SwitchLabel,
  SwitchRoot,
  SwitchRootProvider,
  SwitchThumb,
  SwitchThumbIndicator,
  useSwitch,
  useSwitchContext,
} from "./primitives/switch/index.js";
export type {
  SwitchController,
  SwitchControlProps,
  SwitchContextValue,
  SwitchFieldProps,
  SwitchHiddenInputProps,
  SwitchIndicatorProps,
  SwitchLabelProps,
  SwitchRootProps,
  SwitchRootProviderProps,
  SwitchThumbProps,
  SwitchThumbIndicatorProps,
  UseSwitchProps,
} from "./primitives/switch/index.js";

export const Switch = {
  Root: SwitchRoot,
  Field: SwitchField,
  Control: SwitchControl,
  Label: SwitchLabel,
  HiddenInput: SwitchHiddenInput,
  Thumb: SwitchThumb,
  Indicator: SwitchIndicator,
  ThumbIndicator: SwitchThumbIndicator,
  RootProvider: SwitchRootProvider,
} as const;
