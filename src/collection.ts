"use client";

import { useCallback, useRef, useState } from "react";

export type CollectionValue = string;
export type CollectionDirection = "next" | "previous";

const documentPositionFollowing = 4;
const documentPositionPreceding = 2;
const emptyCollectionData = Object.freeze({}) as Record<string, never>;

export interface CollectionItem<
  Value extends CollectionValue = CollectionValue,
  Element extends HTMLElement = HTMLElement,
  Data extends Record<string, unknown> = Record<string, never>,
> {
  value: Value;
  element: Element;
  disabled: boolean;
  data: Data;
}

export interface RegisterCollectionItemOptions<
  Data extends Record<string, unknown> = Record<string, never>,
> {
  disabled?: boolean;
  data?: Data;
}

export interface UpdateCollectionItemOptions<
  Data extends Record<string, unknown> = Record<string, never>,
> {
  disabled?: boolean;
  data?: Data;
}

export interface GetNextCollectionItemOptions {
  loop?: boolean;
  includeDisabled?: boolean;
}

export interface UseCollectionReturn<
  Value extends CollectionValue = CollectionValue,
  Element extends HTMLElement = HTMLElement,
  Data extends Record<string, unknown> = Record<string, never>,
> {
  version: number;
  registerItem: (
    value: Value,
    element: Element,
    options?: RegisterCollectionItemOptions<Data>,
  ) => void;
  unregisterItem: (value: Value) => void;
  updateItem: (value: Value, options: UpdateCollectionItemOptions<Data>) => void;
  getItem: (value: Value) => CollectionItem<Value, Element, Data> | null;
  getItems: () => CollectionItem<Value, Element, Data>[];
  getValues: () => Value[];
  getEnabledItems: () => CollectionItem<Value, Element, Data>[];
  getFirstItem: (includeDisabled?: boolean) => CollectionItem<Value, Element, Data> | null;
  getLastItem: (includeDisabled?: boolean) => CollectionItem<Value, Element, Data> | null;
  getNextItem: (
    value: Value,
    direction: CollectionDirection,
    options?: GetNextCollectionItemOptions,
  ) => CollectionItem<Value, Element, Data> | null;
  clearItems: () => void;
}

function getDocumentOrder<Element extends HTMLElement>(
  first: Element,
  second: Element,
): number {
  if (first === second) return 0;
  if (!first.isConnected) return 1;
  if (!second.isConnected) return -1;

  const position = first.compareDocumentPosition(second);
  if (position & documentPositionFollowing) return -1;
  if (position & documentPositionPreceding) return 1;
  return 0;
}

export function sortCollectionItemsByDocumentOrder<
  Value extends CollectionValue,
  Element extends HTMLElement,
  Data extends Record<string, unknown>,
>(
  items: CollectionItem<Value, Element, Data>[],
): CollectionItem<Value, Element, Data>[] {
  return [...items].sort((first, second) =>
    getDocumentOrder(first.element, second.element),
  );
}

export function getNextCollectionItem<
  Value extends CollectionValue,
  Element extends HTMLElement,
  Data extends Record<string, unknown>,
>(
  items: CollectionItem<Value, Element, Data>[],
  value: Value,
  direction: CollectionDirection,
  {
    loop = true,
    includeDisabled = false,
  }: GetNextCollectionItemOptions = {},
): CollectionItem<Value, Element, Data> | null {
  if (items.length === 0) return null;

  const currentIndex = items.findIndex((item) => item.value === value);
  if (currentIndex === -1 && !loop) return null;

  const directionStep = direction === "next" ? 1 : -1;
  let index = currentIndex === -1
    ? direction === "next" ? 0 : items.length - 1
    : currentIndex + directionStep;

  for (let inspected = 0; inspected < items.length; inspected += 1) {
    if (!loop && (index < 0 || index >= items.length)) return null;

    const normalizedIndex = ((index % items.length) + items.length) % items.length;
    const candidate = items[normalizedIndex];
    if (candidate && (includeDisabled || !candidate.disabled)) {
      return candidate;
    }
    index += directionStep;
  }

  return null;
}

export function useCollection<
  Value extends CollectionValue = CollectionValue,
  Element extends HTMLElement = HTMLElement,
  Data extends Record<string, unknown> = Record<string, never>,
>(): UseCollectionReturn<Value, Element, Data> {
  const itemsRef = useRef(new Map<Value, CollectionItem<Value, Element, Data>>());
  const sortedCacheRef = useRef<{
    version: number;
    items: CollectionItem<Value, Element, Data>[];
  } | null>(null);
  const [version, setVersion] = useState(0);

  const notifyChange = useCallback(() => {
    sortedCacheRef.current = null;
    setVersion((currentVersion) => currentVersion + 1);
  }, []);

  const getItems = useCallback(() => {
    if (sortedCacheRef.current?.version === version) {
      return sortedCacheRef.current.items;
    }

    const items = sortCollectionItemsByDocumentOrder([...itemsRef.current.values()]);
    sortedCacheRef.current = { version, items };
    return items;
  }, [version]);

  const registerItem = useCallback(
    (
      value: Value,
      element: Element,
      options: RegisterCollectionItemOptions<Data> = {},
    ) => {
      const nextItem: CollectionItem<Value, Element, Data> = {
        value,
        element,
        disabled: options.disabled ?? false,
        // Data is optional for structural collections; typed consumers should
        // provide it when their item metadata has required fields.
        data: options.data ?? (emptyCollectionData as Data),
      };

      const previousItem = itemsRef.current.get(value);
      const nodeEnv = (globalThis as {
        process?: { env?: { NODE_ENV?: string } };
      }).process?.env?.NODE_ENV;
      if (
        nodeEnv !== "production" &&
        previousItem &&
        previousItem.element !== element
      ) {
        console.warn(
          `[Atom UI] Duplicate collection item value "${value}" registered. Values must be unique within a collection.`,
        );
      }
      itemsRef.current.set(value, nextItem);

      if (
        previousItem?.element !== element ||
        previousItem.disabled !== nextItem.disabled ||
        previousItem.data !== nextItem.data
      ) {
        notifyChange();
      }
    },
    [notifyChange],
  );

  const unregisterItem = useCallback((value: Value) => {
    if (!itemsRef.current.delete(value)) return;
    notifyChange();
  }, [notifyChange]);

  const updateItem = useCallback(
    (value: Value, options: UpdateCollectionItemOptions<Data>) => {
      const currentItem = itemsRef.current.get(value);
      if (!currentItem) return;

      const nextItem: CollectionItem<Value, Element, Data> = {
        ...currentItem,
        disabled: options.disabled ?? currentItem.disabled,
        data: options.data ?? currentItem.data,
      };

      itemsRef.current.set(value, nextItem);
      if (
        currentItem.disabled !== nextItem.disabled ||
        currentItem.data !== nextItem.data
      ) {
        notifyChange();
      }
    },
    [notifyChange],
  );

  const getItem = useCallback((value: Value) => {
    return itemsRef.current.get(value) ?? null;
  }, []);

  const getValues = useCallback(() => {
    return getItems().map((item) => item.value);
  }, [getItems]);

  const getEnabledItems = useCallback(() => {
    return getItems().filter((item) => !item.disabled);
  }, [getItems]);

  const getFirstItem = useCallback((includeDisabled = false) => {
    const items = includeDisabled ? getItems() : getEnabledItems();
    return items[0] ?? null;
  }, [getEnabledItems, getItems]);

  const getLastItem = useCallback((includeDisabled = false) => {
    const items = includeDisabled ? getItems() : getEnabledItems();
    return items[items.length - 1] ?? null;
  }, [getEnabledItems, getItems]);

  const getNextItem = useCallback(
    (
      value: Value,
      direction: CollectionDirection,
      options?: GetNextCollectionItemOptions,
    ) => getNextCollectionItem(getItems(), value, direction, options),
    [getItems],
  );

  const clearItems = useCallback(() => {
    if (itemsRef.current.size === 0) return;
    itemsRef.current.clear();
    notifyChange();
  }, [notifyChange]);

  return {
    version,
    registerItem,
    unregisterItem,
    updateItem,
    getItem,
    getItems,
    getValues,
    getEnabledItems,
    getFirstItem,
    getLastItem,
    getNextItem,
    clearItems,
  };
}
