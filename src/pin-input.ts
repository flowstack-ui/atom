"use client";

import {
  PinInputInput,
  PinInputRoot,
  PinInputSeparator,
  PinInputRootProvider,
  PinInputContext,
  PinInputLabel,
  PinInputControl,
} from "./primitives/pin-input/index.js";

export {
  filterPinInputValue,
  getPinInputChars,
  getPinInputDisplayChar,
  getPinInputPattern,
  isPinInputCharAccepted,
  PinInputContextProvider,
  PinInputInput,
  PinInputRoot,
  PinInputSeparator,
  usePinInputContext,
} from "./primitives/pin-input/index.js";
export type {
  PinInputContextValue,
  PinInputInputProps,
  PinInputRootProps,
  PinInputSeparatorProps,
  PinInputType,
} from "./primitives/pin-input/index.js";

export const PinInput = {
  RootProvider: PinInputRootProvider,
  Context: PinInputContext,
  Label: PinInputLabel,
  Control: PinInputControl,
  Root: PinInputRoot,
  Input: PinInputInput,
  Separator: PinInputSeparator,
} as const;

export {
  usePinInput,
  PinInputRootProvider,
  PinInputContext,
  PinInputLabel,
  PinInputControl,
} from "./primitives/pin-input/index.js";
export type {
  PinInputOptions,
  PinInputController,
  PinInputValueChangeDetails,
  PinInputInvalidDetails,
  PinInputRootProviderProps,
  PinInputContextProps,
  PinInputLabelProps,
  PinInputControlProps,
} from "./primitives/pin-input/index.js";
