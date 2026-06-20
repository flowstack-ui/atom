"use client";

import {
  OTPFieldInput,
  OTPFieldRoot,
  OTPFieldSeparator,
} from "./primitives/otp-field/index.js";

export {
  filterOTPFieldValue,
  getOTPFieldChars,
  getOTPFieldDisplayChar,
  getOTPFieldPattern,
  isOTPFieldCharAccepted,
  OTPFieldContextProvider,
  OTPFieldInput,
  OTPFieldRoot,
  OTPFieldSeparator,
  useOTPFieldContext,
} from "./primitives/otp-field/index.js";
export type {
  OTPFieldContextValue,
  OTPFieldInputProps,
  OTPFieldRootProps,
  OTPFieldSeparatorProps,
  OTPFieldType,
} from "./primitives/otp-field/index.js";

export const OTPField = {
  Root: OTPFieldRoot,
  Input: OTPFieldInput,
  Separator: OTPFieldSeparator,
} as const;
