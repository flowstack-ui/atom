export type PinInputType = "numeric" | "alphanumeric" | "alphabetic";

export function getPinInputPattern(
  type: PinInputType,
  customPattern?: RegExp,
): RegExp {
  if (customPattern) return customPattern;

  switch (type) {
    case "numeric":
      return /^[0-9]$/;
    case "alphabetic":
      return /^[a-zA-Z]$/;
    case "alphanumeric":
      return /^[a-zA-Z0-9]$/;
  }
}

export function isPinInputCharAccepted(pattern: RegExp, char: string): boolean {
  pattern.lastIndex = 0;
  const accepted = pattern.test(char);
  pattern.lastIndex = 0;
  return accepted;
}

export function getPinInputChars(
  value: readonly string[],
  length: number,
): string[] {
  const chars = value.slice(0, length).map((char) => Array.from(char)[0] ?? "");

  while (chars.length < length) {
    chars.push("");
  }

  return chars;
}

export function filterPinInputValue(
  value: string,
  pattern: RegExp,
  length: number,
): string {
  return value
    .split("")
    .filter((char) => isPinInputCharAccepted(pattern, char))
    .join("")
    .slice(0, length);
}

export function getPinInputDisplayChar(
  char: string,
  mask: boolean | string | undefined,
): string {
  if (!char) return "";
  if (!mask) return char;
  if (typeof mask === "string") return mask;
  return "\u2022";
}
