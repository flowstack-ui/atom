"use client";

import { createContext, useContext } from "react";

export interface ColorPickerContextValue {
  value: string;
  setValue: (value: string) => void;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  inputId: string;
  name?: string;
  form?: string;
}

const ColorPickerContext = createContext<ColorPickerContextValue | null>(null);
ColorPickerContext.displayName = "ColorPickerContext";

export const ColorPickerContextProvider = ColorPickerContext.Provider;

export function useColorPickerContext(): ColorPickerContextValue {
  const context = useContext(ColorPickerContext);
  if (!context) throw new Error("ColorPicker parts must be used within ColorPicker.Root");
  return context;
}
