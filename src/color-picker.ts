"use client";

import {
  ColorPickerContent,
  ColorPickerControl,
  ColorPickerHiddenInput,
  ColorPickerInput,
  ColorPickerLabel,
  ColorPickerNativeInput,
  ColorPickerRoot,
  ColorPickerSwatchTrigger,
  ColorPickerTrigger,
} from "./primitives/color-picker/index.js";

export * from "./primitives/color-picker/index.js";

export const ColorPicker = {
  Root: ColorPickerRoot,
  Label: ColorPickerLabel,
  Control: ColorPickerControl,
  Input: ColorPickerInput,
  NativeInput: ColorPickerNativeInput,
  HiddenInput: ColorPickerHiddenInput,
  Trigger: ColorPickerTrigger,
  Content: ColorPickerContent,
  SwatchTrigger: ColorPickerSwatchTrigger,
} as const;
