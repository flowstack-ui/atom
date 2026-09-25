"use client";
import { forwardRef, isValidElement, useMemo, type InputHTMLAttributes } from "react";
import { composeRefs, composeEventHandlers, renderElement, type RenderProp } from "../../utils/slot.js";
import { useToolbarContext } from "./context.js";
import { useToolbarItem } from "./useToolbarItem.js";
export interface ToolbarInputProps extends InputHTMLAttributes<HTMLInputElement> {
  render?: RenderProp;
  "data-slot"?: string;
}
/** Editing keys remain native. Prefer one final input in horizontal toolbars. */
export const ToolbarInput = forwardRef<HTMLInputElement, ToolbarInputProps>(function ToolbarInput(
  { disabled: ownDisabled, render, onFocus, "data-slot": slot = "toolbar-input", ...props }, ref,
) {
  const toolbar = useToolbarContext();
  const hostProps = isValidElement<{ disabled?: boolean }>(render) ? render.props : undefined;
  const disabled = Boolean(ownDisabled || toolbar.disabled || hostProps?.disabled);
  const { itemRef, tabIndex, handleFocus } = useToolbarItem(disabled);
  const composedRef = useMemo(() => composeRefs(itemRef, ref), [itemRef, ref]);
  return renderElement(render, "input", { ...props, ref: composedRef, disabled, tabIndex, "data-slot": slot,
    "data-disabled": disabled ? "" : undefined, onFocus: composeEventHandlers(onFocus, handleFocus) });
});
