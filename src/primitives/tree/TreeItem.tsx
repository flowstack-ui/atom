"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
import { useCompositeInteraction } from "../../utils/useCompositeInteraction.js";
import {
  cloneAndMerge,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  TreeBranchContextProvider,
  TreeItemContextProvider,
  useTreeBranchContext,
  useTreeContext,
  type TreeItemContextValue,
  type TreeItemData,
} from "./context.js";

type TreeItemNativeProps = NativeDivProps<
  | "children"
  | "role"
  | "aria-disabled"
  | "aria-expanded"
  | "aria-level"
  | "aria-labelledby"
  | "aria-selected"
>;

export interface TreeItemProps extends TreeItemNativeProps {
  value: string;
  /** Text used for typeahead when children are not plain text or when a custom label is needed. */
  label?: string;
  children?: ReactNode;
  disabled?: boolean;
  /** Nonselectable items remain navigable and expandable. */
  selectable?: boolean;
  expandable?: boolean;
  interactive?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const TreeItem = forwardRef<HTMLElement, TreeItemProps>(
  function TreeItem(
    {
      value,
      label,
      children,
      disabled = false,
      selectable = true,
      expandable = false,
      interactive = false,
      render,
      asChild,
      onClick,
      onMouseDown,
      onKeyDown,
      onPointerMove,
      onPointerLeave,
      "data-slot": dataSlot = "tree-item",
      ...restProps
    },
    ref,
  ) {
    const {
      activeValue,
      selectionMode,
      expandOnClick,
      treeRef,
      checkable,
      getCheckedState,
      loadingValues,
      loadErrors,
      disabled: treeDisabled,
      isValueExpanded,
      isValueSelected,
      registerItem,
      selectValue,
      setActiveValue,
      toggleExpandedValue,
      treeId,
      updateItem,
      unregisterItem,
    } = useTreeContext();
    const branchCtx = useTreeBranchContext();
    const itemRef = useRef<HTMLElement | null>(null);
    const generatedId = useId();
    const itemId = `${treeId}-item-${generatedId}`;
    const textId = `${itemId}-text`;
    const [hasItemText, setHasItemText] = useState(false);
    const [registeredTextValue, setRegisteredTextValue] = useState<string | null>(null);
    const [groupCount, setGroupCount] = useState(0);
    const composedRef = useMemo(() => composeRefs(itemRef, ref), [ref]);
    const isDisabled = disabled || treeDisabled;
    const selected = selectable && isValueSelected(value);
    const active = activeValue === value;
    const expanded = isValueExpanded(value);
    const isExpandable = expandable || groupCount > 0;
    const textValue = registeredTextValue ?? label ?? (typeof children === "string" ? children : value);
    const interaction = useCompositeInteraction(itemRef, interactive, isDisabled,
      () => setActiveValue(value),
      () => { treeRef.current?.focus({ preventScroll: true }); setActiveValue(value); });

    const itemData = useMemo<TreeItemData>(
      () => ({
        id: itemId,
        textValue,
        parentValue: branchCtx.parentValue,
        level: branchCtx.level,
        expandable: isExpandable,
        selectable,
        enterInteraction: interactive ? interaction.enterInteraction : undefined,
      }),
      [branchCtx.level, branchCtx.parentValue, isExpandable, selectable, itemId, textValue, interactive, interaction.enterInteraction],
    );

    const eventTargetsCurrentItem = useCallback(
      (target: EventTarget | null) => {
        const element = itemRef.current;
        if (!(target instanceof Element) || !element) return true;

        const closestTreeItem = target.closest('[role="treeitem"]');
        if (closestTreeItem !== element) return false;

        const closestGroup = target.closest('[role="group"]');
        return !(closestGroup && element.contains(closestGroup));
      },
      [],
    );

    useEffect(() => {
      const element = itemRef.current;
      if (!element) return undefined;
      registerItem(value, element, itemData, isDisabled);
      return () => unregisterItem(value);
    }, [registerItem, unregisterItem, value]);

    useEffect(() => {
      updateItem(value, itemData, isDisabled);
    }, [isDisabled, itemData, updateItem, value]);

    const handleClick = useCallback<MouseEventHandler<HTMLElement>>((event) => {
      if (!eventTargetsCurrentItem(event.target)) return;
      if (isDisabled) return;
      const target = event.target as Element;
      if (target.closest('button, input, select, textarea, a[href], [contenteditable="true"]')) return;
      event.stopPropagation();
      treeRef.current?.focus({ preventScroll: true });
      setActiveValue(value);
      selectValue(value, event.shiftKey, event.ctrlKey || event.metaKey);
      if (isExpandable && expandOnClick) toggleExpandedValue(value);
    }, [
      eventTargetsCurrentItem,
      isDisabled,
      isExpandable,
      expandOnClick,
      treeRef,
      selectValue,
      setActiveValue,
      toggleExpandedValue,
      value,
    ]);

    const registerText = useCallback(
      (nextTextValue: string) => {
        setHasItemText(true);
        setRegisteredTextValue(nextTextValue);
      },
      [],
    );

    const registerGroup = useCallback(() => {
      setGroupCount((currentCount) => currentCount + 1);
      return () => {
        setGroupCount((currentCount) => Math.max(0, currentCount - 1));
      };
    }, []);

    const itemContext = useMemo<TreeItemContextValue>(
      () => ({
        value,
        selected,
        active,
        expanded,
        expandable: isExpandable,
        disabled: isDisabled,
        textId,
        level: branchCtx.level,
        hasItemText,
        registerText,
        registerGroup,
      }),
      [
        active,
        branchCtx.level,
        expanded,
        hasItemText,
        isDisabled,
        isExpandable,
        registerGroup,
        registerText,
        selected,
        textId,
        value,
      ],
    );

    const branchValue = useMemo(
      () => ({
        parentValue: value,
        level: branchCtx.level + 1,
      }),
      [branchCtx.level, value],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: itemId,
      role: "treeitem",
      "aria-selected": selectionMode === "none" || !selectable ? undefined : selected,
      "aria-checked": checkable ? getCheckedState(value) : undefined,
      "aria-busy": loadingValues.includes(value) || undefined,
      "data-loading": loadingValues.includes(value) ? "" : undefined,
      "data-load-error": Object.prototype.hasOwnProperty.call(loadErrors, value) ? "" : undefined,
      "aria-disabled": isDisabled || undefined,
      "aria-expanded": isExpandable ? expanded : undefined,
      "aria-level": branchCtx.level,
      "aria-labelledby": hasItemText ? textId : undefined,
      "data-slot": dataSlot,
      "data-value": value,
      "data-state": selected ? "checked" : "unchecked",
      "data-level": branchCtx.level,
      ...(selected && selectable && { "data-selected": "" }),
      ...(active && { "data-active": "" }),
      ...(isExpandable && { "data-expandable": "" }),
      ...(expanded && { "data-expanded": "" }),
      ...(isDisabled && { "data-disabled": "" }),
      onClick: composeEventHandlers(onClick, handleClick),
      onMouseDown: composeEventHandlers(onMouseDown, event => {
        if (event.button !== 0 || isDisabled || !eventTargetsCurrentItem(event.target)) return;
        const control = (event.target as Element).closest('button, input, select, textarea, a[href], [contenteditable="true"], [tabindex]');
        if (control && event.currentTarget.contains(control) && control !== event.currentTarget) return;
        setActiveValue(value);
      }),
      onKeyDown: composeEventHandlers(onKeyDown, interaction.onKeyDown),
      "data-interactive": interactive ? "" : undefined,
      onPointerMove,
      onPointerLeave,
    };

    return (
      <TreeItemContextProvider value={itemContext}>
        <TreeBranchContextProvider value={branchValue}>
          {asChild
            ? cloneAndMerge(children, behaviorProps)
            : renderElement(render, "div", {
                ...behaviorProps,
                children: children ?? label ?? value,
              })}
        </TreeBranchContextProvider>
      </TreeItemContextProvider>
    );
  },
);
