"use client";
import { SplitterRoot, SplitterPanel, SplitterResizeTrigger, SplitterContext } from "./primitives/splitter/index.js";
export * from "./primitives/splitter/index.js";
export const Splitter = { Root: SplitterRoot, Panel: SplitterPanel, ResizeTrigger: SplitterResizeTrigger, Context: SplitterContext } as const;
