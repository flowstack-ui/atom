"use client";
import { SplitterRoot, SplitterRootProvider, SplitterPanel, SplitterResizeTrigger, SplitterContext } from "./primitives/splitter/index.js";
export * from "./primitives/splitter/index.js";
export const Splitter = { Root: SplitterRoot, RootProvider: SplitterRootProvider, Panel: SplitterPanel, ResizeTrigger: SplitterResizeTrigger, Context: SplitterContext } as const;
