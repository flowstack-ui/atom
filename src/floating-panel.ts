"use client";

import { FloatingPanelRoot, FloatingPanelRootProvider, FloatingPanelContext } from "./primitives/floating-panel/context.js";
import { FloatingPanelPortal, FloatingPanelTrigger, FloatingPanelPositioner, FloatingPanelContent, FloatingPanelHeader, FloatingPanelBody, FloatingPanelTitle, FloatingPanelDescription, FloatingPanelControl, FloatingPanelDragTrigger, FloatingPanelStageTrigger, FloatingPanelCloseTrigger, FloatingPanelResizeTrigger, FloatingPanelResizeTriggers } from "./primitives/floating-panel/parts.js";
export { useFloatingPanel } from "./primitives/floating-panel/controller.js";
export type { FloatingPanelController, FloatingPanelOptions, FloatingPanelChangeDetails, FloatingPanelChangeReason, FloatingPanelFocusTarget } from "./primitives/floating-panel/controller.js";
export type { FloatingPanelPoint, FloatingPanelSize, FloatingPanelStage, FloatingPanelAxis } from "./primitives/floating-panel/geometry.js";
export { FloatingPanelRoot, FloatingPanelRootProvider, FloatingPanelContext, useFloatingPanelContext } from "./primitives/floating-panel/context.js";
export type { FloatingPanelRootProps, FloatingPanelRootProviderProps, FloatingPanelContextProps } from "./primitives/floating-panel/context.js";
export * from "./primitives/floating-panel/parts.js";
export const FloatingPanel = { Root: FloatingPanelRoot, RootProvider: FloatingPanelRootProvider, Context: FloatingPanelContext,
  Portal: FloatingPanelPortal, Trigger: FloatingPanelTrigger, Positioner: FloatingPanelPositioner, Content: FloatingPanelContent,
  Header: FloatingPanelHeader, Body: FloatingPanelBody, Title: FloatingPanelTitle, Description: FloatingPanelDescription,
  Control: FloatingPanelControl, DragTrigger: FloatingPanelDragTrigger, StageTrigger: FloatingPanelStageTrigger,
  CloseTrigger: FloatingPanelCloseTrigger, ResizeTrigger: FloatingPanelResizeTrigger, ResizeTriggers: FloatingPanelResizeTriggers } as const;
