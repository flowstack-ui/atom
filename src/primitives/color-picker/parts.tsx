"use client";

import type {
  AreaProps as ZagAreaProps,
  ChannelInputProps as ZagChannelInputProps,
  ChannelProps as ZagChannelProps,
  ChannelSliderProps as ZagChannelSliderProps,
  Color,
  ColorFormat,
  SwatchProps as ZagSwatchProps,
  SwatchTriggerProps as ZagSwatchTriggerProps,
  TransparencyGridProps as ZagTransparencyGridProps,
} from "@zag-js/color-picker";
import { mergeProps } from "@zag-js/react";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  type ChangeEventHandler,
  type ComponentPropsWithoutRef,
  type FormEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type {
  NativeButtonProps,
  NativeDivProps,
  NativeInputProps,
  NativeLabelProps,
  NativeSpanProps,
} from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import {
  useColorPickerContext,
  useColorPickerRootContext,
  type ColorPickerContextValue,
} from "./context.js";
import { parseColorPickerValue } from "./utils.js";

function withSlot<Props extends Record<string, unknown>>(
  props: Props,
  dataSlot: string,
): Props & { "data-slot": string } {
  return { ...props, "data-slot": dataSlot };
}

export type ColorPickerControlProps = NativeDivProps<never> & { "data-slot"?: string };
export const ColorPickerControl = forwardRef<HTMLDivElement, ColorPickerControlProps>(
  function ColorPickerControl({ "data-slot": dataSlot = "color-picker-control", ...props }, ref) {
    const api = useColorPickerContext();
    return <div {...mergeProps(api.getControlProps(), withSlot(props, dataSlot))} ref={ref} />;
  },
);

export type ColorPickerLabelProps = NativeLabelProps<never> & { "data-slot"?: string };
export const ColorPickerLabel = forwardRef<HTMLLabelElement, ColorPickerLabelProps>(
  function ColorPickerLabel({ "data-slot": dataSlot = "color-picker-label", ...props }, ref) {
    const api = useColorPickerContext();
    return <label {...mergeProps(api.getLabelProps(), withSlot(props, dataSlot))} ref={ref} />;
  },
);

type ChannelInputNativeProps = NativeInputProps<
  "defaultValue" | "disabled" | "readOnly" | "type" | "value"
>;
export interface ColorPickerChannelInputProps
  extends ChannelInputNativeProps,
    ZagChannelInputProps {
  "data-slot"?: string;
}

function getChannelInputValue(
  api: ColorPickerContextValue,
  channel: ZagChannelInputProps["channel"],
): string {
  if (channel === "hex") return api.value.toString("hex");
  if (channel === "css") return api.value.toString("css");
  if (channel === "red" || channel === "green" || channel === "blue") {
    return String(api.value.toFormat("rgba").getChannelValue(channel));
  }
  if (channel === "lightness") {
    return String(api.value.toFormat("hsla").getChannelValue(channel));
  }
  if (channel === "brightness") {
    return String(api.value.toFormat("hsba").getChannelValue(channel));
  }
  if (channel === "hue" || channel === "saturation") {
    const format = api.format === "hsla" ? "hsla" : "hsba";
    return String(api.value.toFormat(format).getChannelValue(channel));
  }
  return String(api.value.getChannelValue(channel));
}

export const ColorPickerChannelInput = forwardRef<HTMLInputElement, ColorPickerChannelInputProps>(
  function ColorPickerChannelInput(
    { channel, orientation, "data-slot": dataSlot = "color-picker-channel-input", ...props },
    ref,
  ) {
    const api = useColorPickerContext();
    const internalRef = useRef<HTMLInputElement | null>(null);
    const currentValue = getChannelInputValue(api, channel);
    useEffect(() => {
      const input = internalRef.current;
      if (!input || input.ownerDocument.activeElement === input) return;
      input.value = currentValue;
    }, [currentValue]);
    return (
      <input
        {...mergeProps(
          api.getChannelInputProps({ channel, orientation }),
          withSlot(props, dataSlot),
        )}
        ref={composeRefs(internalRef, ref)}
      />
    );
  },
);

export type ColorPickerInputProps = Omit<ColorPickerChannelInputProps, "channel">;
export const ColorPickerInput = forwardRef<HTMLInputElement, ColorPickerInputProps>(
  function ColorPickerInput({ "data-slot": dataSlot = "color-picker-input", ...props }, ref) {
    return <ColorPickerChannelInput {...props} ref={ref} channel="hex" data-slot={dataSlot} />;
  },
);

type NativePickerProps = NativeInputProps<
  "defaultValue" | "disabled" | "readOnly" | "required" | "type" | "value"
>;
export interface ColorPickerNativeInputProps extends NativePickerProps {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  "data-slot"?: string;
}
export const ColorPickerNativeInput = forwardRef<HTMLInputElement, ColorPickerNativeInputProps>(
  function ColorPickerNativeInput(
    {
      onChange,
      onInput,
      "data-slot": dataSlot = "color-picker-native-input",
      ...props
    },
    ref,
  ) {
    const api = useColorPickerContext();
    const rootProps = api.getRootProps() as Record<string, unknown>;
    const disabled = rootProps["data-disabled"] !== undefined;
    const readOnly = rootProps["data-readonly"] !== undefined;
    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      api.setValue(event.currentTarget.value);
    };
    const handleInput: FormEventHandler<HTMLInputElement> = (event) => {
      api.setValue(event.currentTarget.value);
    };
    return (
      <input
        {...props}
        ref={ref}
        type="color"
        value={api.value.toString("hex")}
        disabled={disabled || readOnly || undefined}
        aria-label={props["aria-label"] ?? "Open native color chooser"}
        data-slot={dataSlot}
        onInput={composeEventHandlers(onInput, handleInput)}
        onChange={composeEventHandlers(onChange, handleChange)}
      />
    );
  },
);

export type ColorPickerHiddenInputProps = NativeInputProps<
  "defaultValue" | "disabled" | "readOnly" | "required" | "type" | "value"
> & { "data-slot"?: string };
export const ColorPickerHiddenInput = forwardRef<HTMLInputElement, ColorPickerHiddenInputProps>(
  function ColorPickerHiddenInput(
    { form, "data-slot": dataSlot = "color-picker-hidden-input", ...props },
    ref,
  ) {
    const { api, form: rootForm } = useColorPickerRootContext();
    return (
      <input
        {...mergeProps(
          api.getHiddenInputProps(),
          withSlot({ ...props, form: form ?? rootForm }, dataSlot),
        )}
        ref={ref}
      />
    );
  },
);

export type ColorPickerTriggerProps = NativeButtonProps<never> & { "data-slot"?: string };
export const ColorPickerTrigger = forwardRef<HTMLButtonElement, ColorPickerTriggerProps>(
  function ColorPickerTrigger({ "data-slot": dataSlot = "color-picker-trigger", ...props }, ref) {
    const api = useColorPickerContext();
    return <button {...mergeProps(api.getTriggerProps(), withSlot(props, dataSlot))} ref={ref} />;
  },
);

export type ColorPickerPositionerProps = NativeDivProps<never> & { "data-slot"?: string };
export const ColorPickerPositioner = forwardRef<HTMLDivElement, ColorPickerPositionerProps>(
  function ColorPickerPositioner(
    { "data-slot": dataSlot = "color-picker-positioner", ...props },
    ref,
  ) {
    const api = useColorPickerContext();
    return <div {...mergeProps(api.getPositionerProps(), withSlot(props, dataSlot))} ref={ref} />;
  },
);

export type ColorPickerContentProps = NativeDivProps<never> & { "data-slot"?: string };
export const ColorPickerContent = forwardRef<HTMLDivElement, ColorPickerContentProps>(
  function ColorPickerContent({ "data-slot": dataSlot = "color-picker-content", ...props }, ref) {
    const api = useColorPickerContext();
    const mergedProps = mergeProps(api.getContentProps(), withSlot(props, dataSlot));
    const style = mergedProps.hidden
      ? { ...mergedProps.style, display: "none" }
      : mergedProps.style;
    return <div {...mergedProps} style={style} ref={ref} />;
  },
);

export type ColorPickerValueTextProps = NativeSpanProps<never> & { "data-slot"?: string };
export const ColorPickerValueText = forwardRef<HTMLSpanElement, ColorPickerValueTextProps>(
  function ColorPickerValueText(
    { children, "data-slot": dataSlot = "color-picker-value-text", ...props },
    ref,
  ) {
    const api = useColorPickerContext();
    return (
      <span {...mergeProps(api.getValueTextProps(), withSlot(props, dataSlot))} ref={ref}>
        {children ?? api.valueAsString}
      </span>
    );
  },
);

const AreaPropsContext = createContext<ZagAreaProps>({});

export interface ColorPickerAreaProps extends NativeDivProps<never>, ZagAreaProps {
  "data-slot"?: string;
}
export const ColorPickerArea = forwardRef<HTMLDivElement, ColorPickerAreaProps>(
  function ColorPickerArea(
    { xChannel, yChannel, "data-slot": dataSlot = "color-picker-area", ...props },
    ref,
  ) {
    const api = useColorPickerContext();
    const areaProps = { xChannel, yChannel };
    return (
      <AreaPropsContext.Provider value={areaProps}>
        <div
          {...mergeProps(api.getAreaProps(areaProps), withSlot(props, dataSlot))}
          ref={ref}
        />
      </AreaPropsContext.Provider>
    );
  },
);

export type ColorPickerAreaBackgroundProps = NativeDivProps<never> & { "data-slot"?: string };
export const ColorPickerAreaBackground = forwardRef<HTMLDivElement, ColorPickerAreaBackgroundProps>(
  function ColorPickerAreaBackground(
    { "data-slot": dataSlot = "color-picker-area-background", ...props },
    ref,
  ) {
    const api = useColorPickerContext();
    const areaProps = useContext(AreaPropsContext);
    return (
      <div
        {...mergeProps(api.getAreaBackgroundProps(areaProps), withSlot(props, dataSlot))}
        ref={ref}
      />
    );
  },
);

export type ColorPickerAreaThumbProps = NativeDivProps<never> & { "data-slot"?: string };
export const ColorPickerAreaThumb = forwardRef<HTMLDivElement, ColorPickerAreaThumbProps>(
  function ColorPickerAreaThumb(
    { "data-slot": dataSlot = "color-picker-area-thumb", ...props },
    ref,
  ) {
    const api = useColorPickerContext();
    const areaProps = useContext(AreaPropsContext);
    return (
      <div
        {...mergeProps(api.getAreaThumbProps(areaProps), withSlot(props, dataSlot))}
        ref={ref}
      />
    );
  },
);

const ChannelPropsContext = createContext<ZagChannelSliderProps | null>(null);

export interface ColorPickerChannelSliderProps
  extends NativeDivProps<never>,
    ZagChannelSliderProps {
  "data-slot"?: string;
}
export const ColorPickerChannelSlider = forwardRef<HTMLDivElement, ColorPickerChannelSliderProps>(
  function ColorPickerChannelSlider(
    {
      channel,
      orientation,
      format,
      "data-slot": dataSlot = "color-picker-channel-slider",
      ...props
    },
    ref,
  ) {
    const api = useColorPickerContext();
    const channelProps = { channel, orientation, format };
    return (
      <ChannelPropsContext.Provider value={channelProps}>
        <div
          {...mergeProps(api.getChannelSliderProps(channelProps), withSlot(props, dataSlot))}
          ref={ref}
        />
      </ChannelPropsContext.Provider>
    );
  },
);

function useChannelProps(): ZagChannelSliderProps {
  const props = useContext(ChannelPropsContext);
  if (!props) {
    throw new Error("ColorPicker ChannelSlider parts must be used within ColorPicker.ChannelSlider");
  }
  return props;
}

export type ColorPickerChannelSliderTrackProps = NativeDivProps<never> & { "data-slot"?: string };
export const ColorPickerChannelSliderTrack = forwardRef<
  HTMLDivElement,
  ColorPickerChannelSliderTrackProps
>(function ColorPickerChannelSliderTrack(
  { "data-slot": dataSlot = "color-picker-channel-slider-track", ...props },
  ref,
) {
  const api = useColorPickerContext();
  const channelProps = useChannelProps();
  return (
    <div
      {...mergeProps(api.getChannelSliderTrackProps(channelProps), withSlot(props, dataSlot))}
      ref={ref}
    />
  );
});

export type ColorPickerChannelSliderThumbProps = NativeDivProps<never> & { "data-slot"?: string };
export const ColorPickerChannelSliderThumb = forwardRef<
  HTMLDivElement,
  ColorPickerChannelSliderThumbProps
>(function ColorPickerChannelSliderThumb(
  { "data-slot": dataSlot = "color-picker-channel-slider-thumb", ...props },
  ref,
) {
  const api = useColorPickerContext();
  const channelProps = useChannelProps();
  return (
    <div
      {...mergeProps(api.getChannelSliderThumbProps(channelProps), withSlot(props, dataSlot))}
      ref={ref}
    />
  );
});

export type ColorPickerChannelSliderLabelProps = NativeLabelProps<never> & { "data-slot"?: string };
export const ColorPickerChannelSliderLabel = forwardRef<
  HTMLLabelElement,
  ColorPickerChannelSliderLabelProps
>(function ColorPickerChannelSliderLabel(
  { "data-slot": dataSlot = "color-picker-channel-slider-label", ...props },
  ref,
) {
  const api = useColorPickerContext();
  const { channel, orientation } = useChannelProps();
  const channelProps: ZagChannelProps = { channel, orientation };
  return (
    <label
      {...mergeProps(api.getChannelSliderLabelProps(channelProps), withSlot(props, dataSlot))}
      ref={ref}
    />
  );
});

export type ColorPickerChannelSliderValueTextProps = NativeSpanProps<never> & { "data-slot"?: string };
export const ColorPickerChannelSliderValueText = forwardRef<
  HTMLSpanElement,
  ColorPickerChannelSliderValueTextProps
>(function ColorPickerChannelSliderValueText(
  { children, "data-slot": dataSlot = "color-picker-channel-slider-value-text", ...props },
  ref,
) {
  const api = useColorPickerContext();
  const { channel, orientation } = useChannelProps();
  const channelProps: ZagChannelProps = { channel, orientation };
  return (
    <span
      {...mergeProps(api.getChannelSliderValueTextProps(channelProps), withSlot(props, dataSlot))}
      ref={ref}
    >
      {children ?? api.getChannelValue(channel)}
    </span>
  );
});

export interface ColorPickerTransparencyGridProps
  extends NativeDivProps<never>,
    ZagTransparencyGridProps {
  "data-slot"?: string;
}
export const ColorPickerTransparencyGrid = forwardRef<
  HTMLDivElement,
  ColorPickerTransparencyGridProps
>(function ColorPickerTransparencyGrid(
  { size, "data-slot": dataSlot = "color-picker-transparency-grid", ...props },
  ref,
) {
  const api = useColorPickerContext();
  return (
    <div
      {...mergeProps(api.getTransparencyGridProps({ size }), withSlot(props, dataSlot))}
      ref={ref}
    />
  );
});

export type ColorPickerEyeDropperTriggerProps = NativeButtonProps<never> & { "data-slot"?: string };
export const ColorPickerEyeDropperTrigger = forwardRef<
  HTMLButtonElement,
  ColorPickerEyeDropperTriggerProps
>(function ColorPickerEyeDropperTrigger(
  {
    onClick,
    "data-slot": dataSlot = "color-picker-eye-dropper-trigger",
    ...props
  },
  ref,
) {
  const { api, onValueChangeEnd } = useColorPickerRootContext();
  const machineProps = api.getEyeDropperTriggerProps();
  const { onClick: _machineOnClick, ...passiveMachineProps } = machineProps;
  const handleClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (typeof window === "undefined" || !("EyeDropper" in window)) return;
    try {
      const result = await new window.EyeDropper().open();
      const color = parseColorPickerValue(result.sRGBHex);
      if (!color) return;
      api.setValue(color);
      onValueChangeEnd?.({
        value: color,
        valueAsString: color.toString(api.format),
      });
    } catch {
      // Cancellation and platform errors leave the authored color untouched.
    }
  };
  return (
    <button
      {...mergeProps(
        passiveMachineProps,
        withSlot({ ...props, onClick: handleClick }, dataSlot),
      )}
      ref={ref}
    />
  );
});

export type ColorPickerSwatchGroupProps = NativeDivProps<never> & { "data-slot"?: string };
export const ColorPickerSwatchGroup = forwardRef<HTMLDivElement, ColorPickerSwatchGroupProps>(
  function ColorPickerSwatchGroup(
    { "data-slot": dataSlot = "color-picker-swatch-group", ...props },
    ref,
  ) {
    const api = useColorPickerContext();
    return <div {...mergeProps(api.getSwatchGroupProps(), withSlot(props, dataSlot))} ref={ref} />;
  },
);

const SwatchPropsContext = createContext<ZagSwatchProps | null>(null);

type SwatchTriggerNativeProps = NativeButtonProps<"value">;
export interface ColorPickerSwatchTriggerProps
  extends SwatchTriggerNativeProps,
    ZagSwatchTriggerProps {
  children?: ReactNode;
  "data-slot"?: string;
}
export const ColorPickerSwatchTrigger = forwardRef<HTMLButtonElement, ColorPickerSwatchTriggerProps>(
  function ColorPickerSwatchTrigger(
    {
      value,
      disabled,
      "data-slot": dataSlot = "color-picker-swatch-trigger",
      ...props
    },
    ref,
  ) {
    const api = useColorPickerContext();
    const swatchProps = { value };
    return (
      <SwatchPropsContext.Provider value={swatchProps}>
        <button
          {...mergeProps(
            api.getSwatchTriggerProps({ value, disabled }),
            withSlot(props, dataSlot),
          )}
          ref={ref}
        />
      </SwatchPropsContext.Provider>
    );
  },
);

export interface ColorPickerSwatchProps extends NativeDivProps<never>, ZagSwatchProps {
  "data-slot"?: string;
}
export const ColorPickerSwatch = forwardRef<HTMLDivElement, ColorPickerSwatchProps>(
  function ColorPickerSwatch(
    { value, respectAlpha, "data-slot": dataSlot = "color-picker-swatch", ...props },
    ref,
  ) {
    const api = useColorPickerContext();
    const swatchProps = { value, respectAlpha };
    return (
      <SwatchPropsContext.Provider value={swatchProps}>
        <div
          {...mergeProps(api.getSwatchProps(swatchProps), withSlot(props, dataSlot))}
          ref={ref}
        />
      </SwatchPropsContext.Provider>
    );
  },
);

export type ColorPickerValueSwatchProps = Omit<NativeDivProps<never>, "children"> & {
  children?: ReactNode;
  respectAlpha?: boolean;
  "data-slot"?: string;
};
export const ColorPickerValueSwatch = forwardRef<HTMLDivElement, ColorPickerValueSwatchProps>(
  function ColorPickerValueSwatch(
    { respectAlpha, "data-slot": dataSlot = "color-picker-value-swatch", ...props },
    ref,
  ) {
    const api = useColorPickerContext();
    const swatchProps = { value: api.valueAsString, respectAlpha };
    return (
      <SwatchPropsContext.Provider value={swatchProps}>
        <div
          {...mergeProps(api.getSwatchProps(swatchProps), withSlot(props, dataSlot))}
          ref={ref}
        />
      </SwatchPropsContext.Provider>
    );
  },
);

export type ColorPickerSwatchIndicatorProps = NativeSpanProps<never> & {
  value?: string | Color;
  respectAlpha?: boolean;
  "data-slot"?: string;
};
export const ColorPickerSwatchIndicator = forwardRef<
  HTMLSpanElement,
  ColorPickerSwatchIndicatorProps
>(function ColorPickerSwatchIndicator(
  {
    value,
    respectAlpha,
    "data-slot": dataSlot = "color-picker-swatch-indicator",
    ...props
  },
  ref,
) {
  const api = useColorPickerContext();
  const inherited = useContext(SwatchPropsContext);
  const swatchProps = value === undefined
    ? inherited
    : { value, respectAlpha };
  if (!swatchProps) {
    throw new Error(
      "ColorPicker.SwatchIndicator requires a value or a ColorPicker.Swatch/ValueSwatch parent",
    );
  }
  return (
    <span
      {...mergeProps(api.getSwatchIndicatorProps(swatchProps), withSlot(props, dataSlot))}
      ref={ref}
    />
  );
});

export type ColorPickerFormatSelectProps = Omit<
  ComponentPropsWithoutRef<"select">,
  "defaultValue" | "value"
> & { "data-slot"?: string };
export const ColorPickerFormatSelect = forwardRef<HTMLSelectElement, ColorPickerFormatSelectProps>(
  function ColorPickerFormatSelect(
    { children, "data-slot": dataSlot = "color-picker-format-select", ...props },
    ref,
  ) {
    const api = useColorPickerContext();
    const { defaultValue: _defaultValue, ...machineProps } = api.getFormatSelectProps();
    return (
      <select
        {...mergeProps(machineProps, withSlot(props, dataSlot))}
        ref={ref}
        value={api.format}
      >
        {children ?? (
          <>
            <option value="rgba">RGBA</option>
            <option value="hsla">HSLA</option>
            <option value="hsba">HSBA</option>
          </>
        )}
      </select>
    );
  },
);

export type ColorPickerFormatTriggerProps = NativeButtonProps<never> & { "data-slot"?: string };
export const ColorPickerFormatTrigger = forwardRef<HTMLButtonElement, ColorPickerFormatTriggerProps>(
  function ColorPickerFormatTrigger(
    { children, "data-slot": dataSlot = "color-picker-format-trigger", ...props },
    ref,
  ) {
    const api = useColorPickerContext();
    return (
      <button {...mergeProps(api.getFormatTriggerProps(), withSlot(props, dataSlot))} ref={ref}>
        {children ?? api.format.toUpperCase()}
      </button>
    );
  },
);

export interface ColorPickerViewProps extends NativeDivProps<never> {
  format: ColorFormat;
  "data-slot"?: string;
}
export const ColorPickerView = forwardRef<HTMLDivElement, ColorPickerViewProps>(
  function ColorPickerView(
    { format, hidden, "data-slot": dataSlot = "color-picker-view", ...props },
    ref,
  ) {
    const api = useColorPickerContext();
    return (
      <div
        {...props}
        ref={ref}
        hidden={hidden ?? api.format !== format}
        data-format={format}
        data-slot={dataSlot}
      />
    );
  },
);

export interface ColorPickerContextProps {
  children: (context: ColorPickerContextValue) => ReactNode;
}
export function ColorPickerContext({ children }: ColorPickerContextProps) {
  return children(useColorPickerContext());
}
