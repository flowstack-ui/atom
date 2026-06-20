export type OTPFieldType = "numeric" | "alphanumeric" | "alphabetic";

export function getOTPFieldPattern(type: OTPFieldType, customPattern?: RegExp): RegExp {
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

export function isOTPFieldCharAccepted(pattern: RegExp, char: string): boolean {
  pattern.lastIndex = 0;
  const accepted = pattern.test(char);
  pattern.lastIndex = 0;
  return accepted;
}

export function getOTPFieldChars(value: string, length: number): string[] {
  const chars = value.split("").slice(0, length);

  while (chars.length < length) {
    chars.push("");
  }

  return chars;
}

export function filterOTPFieldValue(
  value: string,
  pattern: RegExp,
  length: number,
): string {
  return value
    .split("")
    .filter((char) => isOTPFieldCharAccepted(pattern, char))
    .join("")
    .slice(0, length);
}

export function getOTPFieldDisplayChar(
  char: string,
  mask: boolean | string | undefined,
): string {
  if (!char) return "";
  if (!mask) return char;
  if (typeof mask === "string") return mask;
  return "\u2022";
}
