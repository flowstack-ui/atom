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
  ListboxOptionContextProvider,
  useListboxContext,
  useListboxGroupContext,
  type ListboxItemData,
  type ListboxOptionContextValue,
} from "./context.js";

type ListboxOptionNativeProps = NativeDivProps<
  "children" | "role" | "aria-selected" | "aria-disabled" | "aria-labelledby"
>;

export interface ListboxOptionProps extends ListboxOptionNativeProps {
  value: string;
  /** Text used for typeahead when children are not plain text or when a custom label is needed. */
  label?: string;
  children?: ReactNode;
  disabled?: boolean;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

export const ListboxOption = forwardRef<HTMLElement, ListboxOptionProps>(
  function ListboxOption(
    {
      value,
      label,
      children,
      disabled = false,
      render,
      asChild,
      onClick,
      onPointerMove,
      onPointerLeave,
      "data-slot": dataSlot = "listbox-option",
      ...restProps
    },
    ref,
  ) {
    const {
      disabled: listboxDisabled,
      highlightedValue,
      isValueSelected,
      listboxId,
      registerItem,
      selectValue,
      setHighlightedValue,
      updateItem,
      unregisterItem,
    } = useListboxContext();
    const groupCtx = useListboxGroupContext();
    const optionRef = useRef<HTMLElement | null>(null);
    const generatedId = useId();
    const optionId = `${listboxId}-option-${generatedId}`;
    const textId = `${optionId}-text`;
    const [hasOptionText, setHasOptionText] = useState(false);
    const composedRef = useMemo(() => composeRefs(optionRef, ref), [ref]);
    const isDisabled = disabled || listboxDisabled;
    const selected = isValueSelected(value);
    const highlighted = highlightedValue === value;
    const textValue = label ?? (typeof children === "string" ? children : value);

    const itemData = useMemo<ListboxItemData>(
      () => ({
        id: optionId,
        textValue,
        groupLabelId: groupCtx?.labelId,
      }),
      [groupCtx?.labelId, optionId, textValue],
    );

    useEffect(() => {
      const element = optionRef.current;
      if (!element) return undefined;
      registerItem(value, element, itemData, isDisabled);
      return () => unregisterItem(value);
    }, [registerItem, unregisterItem, value]);

    useEffect(() => {
      updateItem(value, itemData, isDisabled);
    }, [isDisabled, itemData, updateItem, value]);

    const handleClick = useCallback<MouseEventHandler<HTMLElement>>(() => {
      if (isDisabled) return;
      setHighlightedValue(value);
      selectValue(value);
    }, [isDisabled, selectValue, setHighlightedValue, value]);

    const handlePointerMove = useCallback<PointerEventHandler<HTMLElement>>(() => {
      if (!isDisabled && highlightedValue !== value) {
        setHighlightedValue(value);
      }
    }, [highlightedValue, isDisabled, setHighlightedValue, value]);

    const handlePointerLeave = useCallback<PointerEventHandler<HTMLElement>>(() => {
      if (highlightedValue === value) {
        setHighlightedValue(null);
      }
    }, [highlightedValue, setHighlightedValue, value]);

    const registerText = useCallback(
      (nextTextValue: string) => {
        setHasOptionText(true);
        const element = optionRef.current;
        if (!element) return;
        updateItem(
          value,
          {
            ...itemData,
            textValue: nextTextValue,
          },
          isDisabled,
        );
      },
      [isDisabled, itemData, updateItem, value],
    );

    const optionContext = useMemo<ListboxOptionContextValue>(
      () => ({
        value,
        selected,
        highlighted,
        disabled: isDisabled,
        textId,
        hasOptionText,
        registerText,
      }),
      [
        hasOptionText,
        highlighted,
        isDisabled,
        registerText,
        selected,
        textId,
        value,
      ],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      id: optionId,
      role: "option",
      "aria-selected": selected,
      "aria-disabled": isDisabled || undefined,
      "aria-labelledby": hasOptionText ? textId : undefined,
      "data-slot": dataSlot,
      "data-value": value,
      "data-state": selected ? "checked" : "unchecked",
      ...(selected && { "data-selected": "" }),
      ...(highlighted && { "data-highlighted": "" }),
      ...(isDisabled && { "data-disabled": "" }),
      onClick: composeEventHandlers(onClick, handleClick),
      onPointerMove: composeEventHandlers(onPointerMove, handlePointerMove),
      onPointerLeave: composeEventHandlers(onPointerLeave, handlePointerLeave),
    };

    return (
      <ListboxOptionContextProvider value={optionContext}>
        {asChild
          ? cloneAndMerge(children, behaviorProps)
          : renderElement(render, "div", {
              ...behaviorProps,
              children: children ?? label ?? value,
            })}
      </ListboxOptionContextProvider>
    );
  },
);
