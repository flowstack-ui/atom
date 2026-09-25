import type { PopoverLifecycleOptions, PopoverOutsideEvents, PopoverPositioningOptions } from "../popover/options.js";

/** Shared floating-layer options; no Popover behavior or visual policy is inherited. */
export interface MenuPositioningOptions extends PopoverPositioningOptions {}
export interface MenuLifecycleOptions extends PopoverLifecycleOptions {}
export interface MenuOutsideEvents extends PopoverOutsideEvents {}
export type MenuHighlightTarget = string | { value: string; groupId: string } | null;
export interface MenuHighlightChangeDetails { highlightedValue: MenuHighlightTarget }
export interface MenuSelectionEvent {
  readonly value: string;
  readonly groupId?: string;
  readonly originalEvent: MouseEvent;
  readonly node: HTMLElement;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}
export interface MenuNavigateDetails { value: string; node: HTMLAnchorElement; href: string; originalEvent: MouseEvent }

export function createMenuSelectionEvent(value: string, node: HTMLElement, originalEvent: MouseEvent, groupId?: string): MenuSelectionEvent {
  let prevented = false;
  return { value, groupId, node, originalEvent, get defaultPrevented() { return prevented; }, preventDefault() { prevented = true; } };
}
