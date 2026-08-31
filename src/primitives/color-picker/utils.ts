import { parse, type Color } from "@zag-js/color-picker";

export const COLOR_PICKER_DEFAULT_VALUE = "#000000";

export function parseColorPickerValue(value: string): Color | null {
  try {
    return parse(value.trim());
  } catch {
    return null;
  }
}

/**
 * Parses any supported color string and returns a stable lowercase hexadecimal
 * form. Alpha is retained when it is not fully opaque.
 */
export function normalizeColorPickerValue(value: string): string | null {
  const color = parseColorPickerValue(value);
  if (!color) return null;
  return color
    .toString(color.getChannelValue("alpha") < 1 ? "hexa" : "hex")
    .toLowerCase();
}
