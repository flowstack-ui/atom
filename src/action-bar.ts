"use client";

import { ActionBarRoot, ActionBarRootProvider, ActionBarContext, ActionBarContent,
  ActionBarPortal, ActionBarTitle, ActionBarDescription, ActionBarCloseTrigger,
  ActionBarSelectionTrigger, ActionBarPositioner } from "./primitives/action-bar/ActionBar.js";
export * from "./primitives/action-bar/ActionBar.js";
export const ActionBar = { Root: ActionBarRoot, RootProvider: ActionBarRootProvider,
  Context: ActionBarContext, Content: ActionBarContent, Portal: ActionBarPortal, Positioner: ActionBarPositioner,
  Title: ActionBarTitle, Description: ActionBarDescription,
  CloseTrigger: ActionBarCloseTrigger, SelectionTrigger: ActionBarSelectionTrigger } as const;
