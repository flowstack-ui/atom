export const COLOR_PICKER_DEFAULT_VALUE = "#000000";

export function normalizeColorPickerValue(value: string): string | null {
  const input = value.trim().toLowerCase();
  const short = /^#([\da-f]{3})$/i.exec(input);
  if (short) {
    return `#${short[1].split("").map((channel) => channel + channel).join("")}`;
  }
  return /^#[\da-f]{6}$/i.test(input) ? input : null;
}
