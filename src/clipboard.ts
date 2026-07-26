"use client";

import {
  ClipboardControl,
  ClipboardIndicator,
  ClipboardInput,
  ClipboardLabel,
  ClipboardRoot,
  ClipboardStatus,
  ClipboardTrigger,
  ClipboardValueText,
} from "./primitives/clipboard/index.js";

export * from "./primitives/clipboard/index.js";

export const Clipboard = {
  Root: ClipboardRoot,
  Label: ClipboardLabel,
  Control: ClipboardControl,
  Input: ClipboardInput,
  ValueText: ClipboardValueText,
  Trigger: ClipboardTrigger,
  Indicator: ClipboardIndicator,
  Status: ClipboardStatus,
} as const;
