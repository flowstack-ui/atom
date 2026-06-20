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
  type PointerEventHandler,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { composeEventHandlers } from "../../utils/dom.js";
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
  expandable?: boolean;
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
      expandable = false,
      render,
      asChild,
      onClick,
      onPointerMove,
      onPointerLeave,
      "data-slot": dataSlot = "tree-item",
      ...restProps
    },
    ref,
  ) {
    const {
      activeValue,
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
    const selected = isValueSelected(value);
    const active = activeValue === value;
    const activeValueRef = useRef(activeValue);
    activeValueRef.current = activeValue;
    const expanded = isValueExpanded(value);
    const isExpandable = expandable || groupCount > 0;
    const textValue = registeredTextValue ?? label ?? (typeof children === "string" ? children : value);

    const itemData = useMemo<TreeItemData>(
      () => ({
        id: itemId,
        textValue,
        parentValue: branchCtx.parentValue,
        level: branchCtx.level,
        expandable: isExpandable,
      }),
      [branchCtx.level, branchCtx.parentValue, isExpandable, itemId, textValue],
    );

    const eventTargetsCurrentItem = useCallback(
      (target: EventTarget | null) => {
        const element = itemRef.current;
        if (!(target instanceof Element) || !element) return true;
        return target.closest('[role="treeitem"]') === element;
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
      event.stopPropagation();
      setActiveValue(value);
      selectValue(value);
      if (isExpandable) toggleExpandedValue(value);
    }, [
      eventTargetsCurrentItem,
      isDisabled,
      isExpandable,
      selectValue,
      setActiveValue,
      toggleExpandedValue,
      value,
    ]);

    const handlePointerMove = useCallback<PointerEventHandler<HTMLElement>>((event) => {
      if (!eventTargetsCurrentItem(event.target)) return;
      if (!isDisabled && activeValueRef.current !== value) {
        setActiveValue(value);
      }
    }, [eventTargetsCurrentItem, isDisabled, setActiveValue, value]);

    const handlePointerLeave = useCallback<PointerEventHandler<HTMLElement>>(() => {
      if (activeValueRef.current === value) {
        setActiveValue(null);
      }
    }, [setActiveValue, value]);

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
      "aria-selected": selected,
      "aria-disabled": isDisabled || undefined,
      "aria-expanded": isExpandable ? expanded : undefined,
      "aria-level": branchCtx.level,
      "aria-labelledby": hasItemText ? textId : undefined,
      "data-slot": dataSlot,
      "data-value": value,
      "data-state": selected ? "checked" : "unchecked",
      "data-level": branchCtx.level,
      ...(selected && { "data-selected": "" }),
      ...(active && { "data-active": "" }),
      ...(isExpandable && { "data-expandable": "" }),
      ...(expanded && { "data-expanded": "" }),
      ...(isDisabled && { "data-disabled": "" }),
      onClick: composeEventHandlers(onClick, handleClick),
      onPointerMove: composeEventHandlers(onPointerMove, handlePointerMove),
      onPointerLeave: composeEventHandlers(onPointerLeave, handlePointerLeave),
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
