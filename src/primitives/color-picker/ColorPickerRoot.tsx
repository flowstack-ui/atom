"use client";

import * as zagColorPicker from "@zag-js/color-picker";
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react";
import {
  forwardRef,
  useId,
  useMemo,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { useDirection, type DirectionValue } from "../direction/index.js";
import { useFieldContext } from "../field/context.js";
import { ColorPickerContextProvider } from "./context.js";
import { COLOR_PICKER_DEFAULT_VALUE, parseColorPickerValue } from "./utils.js";

type RootNativeProps = NativeDivProps<"children" | "defaultValue" | "onChange">;

export interface ColorPickerRootProps extends RootNativeProps {
  children: ReactNode;
  value?: string | zagColorPicker.Color;
  defaultValue?: string | zagColorPicker.Color;
  onValueChange?: (details: zagColorPicker.ValueChangeDetails) => void;
  onValueChangeEnd?: (details: zagColorPicker.ValueChangeDetails) => void;
  format?: zagColorPicker.ColorFormat;
  defaultFormat?: zagColorPicker.ColorFormat;
  onFormatChange?: (details: zagColorPicker.FormatChangeDetails) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (details: zagColorPicker.OpenChangeDetails) => void;
  closeOnSelect?: boolean;
  inline?: boolean;
  openAutoFocus?: boolean;
  initialFocusEl?: () => HTMLElement | null;
  positioning?: zagColorPicker.PositioningOptions;
  onFocusOutside?: zagColorPicker.Props["onFocusOutside"];
  onInteractOutside?: zagColorPicker.Props["onInteractOutside"];
  onPointerDownOutside?: zagColorPicker.Props["onPointerDownOutside"];
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  inputId?: string;
  dir?: DirectionValue;
  ids?: zagColorPicker.Props["ids"];
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  present?: boolean;
  onExitComplete?: () => void;
  "data-slot"?: string;
}

function resolveColor(
  value: string | zagColorPicker.Color | undefined,
  fallback: zagColorPicker.Color,
): zagColorPicker.Color | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return value;
  return parseColorPickerValue(value) ?? fallback;
}

export function useColorPicker(
    {
      value,
      defaultValue = COLOR_PICKER_DEFAULT_VALUE,
      onValueChange,
      onValueChangeEnd,
      format,
      defaultFormat,
      onFormatChange,
      open,
      defaultOpen,
      onOpenChange,
      closeOnSelect,
      inline,
      openAutoFocus,
      initialFocusEl,
      positioning,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
      disabled,
      readOnly,
      invalid,
      required,
      name,
      form,
      inputId,
      ids,
      lazyMount = false,
      unmountOnExit = false,
      present,
      onExitComplete,
      dir: dirProp,
      id: idProp,
      "data-slot": dataSlot = "color-picker",
      ...restProps
    }: Omit<ColorPickerRootProps, "children"> = {},
  ) {
    const field = useFieldContext();
    const contextDir = useDirection();
    const generatedId = useId();
    const fallback = useMemo(
      () => parseColorPickerValue(COLOR_PICKER_DEFAULT_VALUE)!,
      [],
    );
    const parsedDefaultValue = resolveColor(defaultValue, fallback) ?? fallback;
    const parsedValue = resolveColor(value, fallback);
    const machine = useMachine(zagColorPicker.machine, {
      id: idProp ?? generatedId,
      ids: { ...ids, ...(inputId ?? field?.controlId ? { input: inputId ?? field?.controlId } : {}) },
      dir: dirProp ?? contextDir,
      value: parsedValue,
      defaultValue: parsedDefaultValue,
      onValueChange,
      onValueChangeEnd,
      format,
      defaultFormat,
      onFormatChange,
      open,
      defaultOpen,
      onOpenChange,
      closeOnSelect,
      inline,
      openAutoFocus,
      initialFocusEl,
      positioning,
      onFocusOutside,
      onInteractOutside,
      onPointerDownOutside,
      disabled: disabled ?? field?.disabled,
      readOnly: readOnly ?? field?.readOnly,
      invalid: invalid ?? field?.invalid,
      required: required ?? field?.required,
      name,
    });
    const api = zagColorPicker.connect(machine, normalizeProps);
    const mergedProps = mergeProps(
      api.getRootProps() as Record<string, unknown>,
      { ...restProps, "data-slot": dataSlot } as Record<string, unknown>,
    ) as ComponentPropsWithoutRef<"div"> & { "data-slot": string };
    return { api, form, inputId: inputId ?? field?.controlId ?? ids?.input, onValueChangeEnd, rootProps: mergedProps,
      lifecycle: { lazyMount, unmountOnExit, present, onExitComplete } };
}

export type UseColorPickerReturn = ReturnType<typeof useColorPicker>;
export type UseColorPickerOptions = Omit<ColorPickerRootProps, "children">;
export type ColorPickerRootProviderProps = NativeDivProps<never> & {
  value: UseColorPickerReturn;
};
export const ColorPickerRootProvider = forwardRef<HTMLDivElement, ColorPickerRootProviderProps>(
  function ColorPickerRootProvider({ value, children, ...props }, ref) {

    return (
      <ColorPickerContextProvider value={value}>
        <div {...mergeProps(value.rootProps, props)} ref={ref}>
          {children}
        </div>
      </ColorPickerContextProvider>
    );
  },
);

export const ColorPickerRoot = forwardRef<HTMLDivElement, ColorPickerRootProps>(
  function ColorPickerRoot({children, ...props}, ref) {
    const value = useColorPicker(props);
    return <ColorPickerRootProvider value={value} ref={ref}>{children}</ColorPickerRootProvider>;
  },
);
