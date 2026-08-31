"use client";

import { createContext, useContext } from "react";
import type {
  Api as ZagColorPickerApi,
  ValueChangeDetails,
} from "@zag-js/color-picker";
import type { PropTypes } from "@zag-js/react";

export type ColorPickerContextValue = ZagColorPickerApi<PropTypes>;

interface ColorPickerRootContextValue {
  api: ColorPickerContextValue;
  form?: string;
  onValueChangeEnd?: (details: ValueChangeDetails) => void;
}

const ColorPickerContext = createContext<ColorPickerRootContextValue | null>(null);
ColorPickerContext.displayName = "ColorPickerContext";

export const ColorPickerContextProvider = ColorPickerContext.Provider;

export function useColorPickerContext(): ColorPickerContextValue {
  const context = useContext(ColorPickerContext);
  if (!context) throw new Error("ColorPicker parts must be used within ColorPicker.Root");
  return context.api;
}

export function useColorPickerRootContext(): ColorPickerRootContextValue {
  const context = useContext(ColorPickerContext);
  if (!context) throw new Error("ColorPicker parts must be used within ColorPicker.Root");
  return context;
}
