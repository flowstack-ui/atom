"use client";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFieldContext } from "../field/context.js";
import { useDirection } from "../direction/index.js";

export type TagsInputInvalidReason =
  "empty" | "duplicate" | "invalidTag" | "rangeOverflow" | "maxLength";
export interface TagsInputValueChangeDetails {
  value: string[];
}
export interface TagsInputInputValueChangeDetails {
  inputValue: string;
}
export interface TagsInputInvalidDetails {
  reason: TagsInputInvalidReason;
  inputValue: string;
  value: string[];
}
export interface TagsInputOutsideEvent {
  originalEvent: Event;
  target: EventTarget | null;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}
export interface TagsInputTranslations {
  clearTriggerLabel?: string;
  deleteTagTriggerLabel?: (value: string) => string;
  tagAdded?: (value: string) => string;
  tagsPasted?: (value: string[]) => string;
  tagSelected?: (value: string) => string;
  tagEdited?: (value: string) => string;
  tagUpdated?: (value: string) => string;
  tagDeleted?: (value: string) => string;
  noTagsSelected?: string;
  invalidTag?: (value: string) => string;
  requiredMessage?: string;
  inputLabel?: string;
}
export interface TagsInputOptions {
  value?: string[];
  defaultValue?: string[];
  inputValue?: string;
  defaultInputValue?: string;
  onValueChange?: (details: TagsInputValueChangeDetails) => void;
  onInputValueChange?: (details: TagsInputInputValueChangeDetails) => void;
  onHighlightChange?: (details: {
    highlightedValue: string | null;
    highlightedIndex: number | null;
  }) => void;
  onValueInvalid?: (details: TagsInputInvalidDetails) => void;
  validate?: (details: { inputValue: string; value: string[] }) => boolean;
  sanitizeValue?: (value: string) => string;
  max?: number;
  maxLength?: number;
  allowDuplicates?: boolean;
  allowOverflow?: boolean;
  addOnPaste?: boolean;
  delimiter?: string | RegExp;
  blurBehavior?: "add" | "clear";
  editable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  name?: string;
  form?: string;
  id?: string;
  dir?: "ltr" | "rtl";
  validationBehavior?: "inline" | "native";
  ids?: Partial<
    Record<
      "root" | "label" | "control" | "input" | "hiddenInput" | "clearTrigger",
      string
    >
  >;
  translations?: TagsInputTranslations;
  onFocusOutside?: (event: TagsInputOutsideEvent) => void;
  onPointerDownOutside?: (event: TagsInputOutsideEvent) => void;
  onInteractOutside?: (event: TagsInputOutsideEvent) => void;
}
export interface TagsInputItemState {
  editing: boolean;
  highlighted: boolean;
  disabled: boolean;
  id: string;
}
export interface TagsInputController {
  value: string[];
  valueAsString: string;
  inputValue: string;
  count: number;
  empty: boolean;
  atMax: boolean;
  highlightedIndex: number | null;
  editingIndex: number | null;
  editValue: string;
  setValue(value: string[]): boolean;
  addValue(value: string): boolean;
  addValues(value: string[]): boolean;
  setValueAtIndex(index: number, value: string): boolean;
  clearValue(index?: number): void;
  setInputValue(value: string): void;
  clearInputValue(): void;
  focus(): void;
  highlight(index: number | null): void;
  startEdit(index: number): void;
  setEditValue(value: string): void;
  commitEdit(): boolean;
  cancelEdit(restoreFocus?: boolean): void;
  getItemState(props: {
    index: number;
    disabled?: boolean;
  }): TagsInputItemState;
}
export interface TagsInputStore {
  api: TagsInputController;
  options: TagsInputOptions;
  root: RefObject<HTMLDivElement | null>;
  input: RefObject<HTMLInputElement | null>;
  itemInput: RefObject<HTMLInputElement | null>;
  disabledItems: RefObject<Map<number, boolean>>;
  branches: RefObject<Set<RefObject<HTMLElement | null>>>;
  announcement: { key: number; text: string };
  externalInvalid: boolean | undefined;
  setValidationInvalid(value: boolean): void;
  id(part: keyof NonNullable<TagsInputOptions["ids"]>): string;
}
const stores = new WeakMap<TagsInputController, TagsInputStore>();
export const TagsInputContext = createContext<TagsInputStore | null>(null);
TagsInputContext.displayName = "TagsInput";
export function useTagsInputStore() {
  const store = useContext(TagsInputContext);
  if (!store) throw new Error("TagsInput parts require Root or RootProvider");
  return store;
}
export function getTagsInputStore(api: TagsInputController) {
  const store = stores.get(api);
  if (!store) throw new Error("TagsInput.RootProvider requires useTagsInput");
  return store;
}
export function useTagsInputContext() {
  return useTagsInputStore().api;
}
export function splitTagsInput(
  value: string,
  delimiter: string | RegExp = ",",
) {
  return delimiter === "" ? [value] : value.split(delimiter);
}
function maximum(value: number | undefined) {
  return value === undefined || !Number.isFinite(value)
    ? Infinity
    : Math.max(0, Math.floor(value));
}

/** All entry paths share one atomic normalization and acceptance rule. */
export function acceptTagsInputValues(
  current: string[],
  candidates: string[],
  options: TagsInputOptions,
  editingIndex?: number,
) {
  const sanitize = options.sanitizeValue ?? ((value: string) => value.trim());
  const next = [...current];
  for (const raw of candidates) {
    const candidate = sanitize(raw);
    const reason: TagsInputInvalidReason | undefined = !candidate
      ? "empty"
      : candidate.length > maximum(options.maxLength)
        ? "maxLength"
        : !options.allowDuplicates &&
            next.some(
              (value, index) => index !== editingIndex && value === candidate,
            )
          ? "duplicate"
          : options.validate &&
              !options.validate({ inputValue: candidate, value: [...next] })
            ? "invalidTag"
            : editingIndex === undefined &&
                !options.allowOverflow &&
                next.length >= maximum(options.max)
              ? "rangeOverflow"
              : undefined;
    if (reason)
      return {
        accepted: false as const,
        value: current,
        reason,
        inputValue: raw,
      };
    if (editingIndex === undefined) next.push(candidate);
    else next[editingIndex] = candidate;
  }
  return { accepted: true as const, value: next };
}

export function useTagsInput(
  authored: TagsInputOptions = {},
): TagsInputController {
  const field = useFieldContext(),
    direction = useDirection(),
    generated = useId();
  const [validationInvalid, setValidationInvalid] = useState(false);
  const externalInvalid = authored.invalid ?? field?.invalid;
  const options: TagsInputOptions = {
    ...authored,
    disabled: authored.disabled ?? field?.disabled,
    readOnly: authored.readOnly ?? field?.readOnly,
    required: authored.required ?? field?.required,
    invalid: externalInvalid || validationInvalid,
    dir: authored.dir ?? direction,
  };
  const [value, changeValue] = useControllableState({
    value: authored.value,
    defaultValue: authored.defaultValue ?? [],
    onChange: (value) => authored.onValueChange?.({ value }),
  });
  const [inputValue, changeInput] = useControllableState({
    value: authored.inputValue,
    defaultValue: authored.defaultInputValue ?? "",
    onChange: (inputValue) => authored.onInputValueChange?.({ inputValue }),
  });
  options.invalid = options.invalid || value.length > maximum(options.max);
  const liveValue = useRef(value);
  liveValue.current = value;
  const commitValue = (next: string[]) => {
    if (authored.value === undefined) liveValue.current = next;
    changeValue(next);
  };
  const [highlighted, setHighlighted] = useState<number | null>(null),
    [editing, setEditing] = useState<number | null>(null),
    [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState({ key: 0, text: "" });
  const root = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement>(null),
    itemInput = useRef<HTMLInputElement>(null);
  const disabledItems = useRef(new Map<number, boolean>()),
    branches = useRef(new Set<RefObject<HTMLElement | null>>());
  const initial = useRef({
    value: [...(authored.defaultValue ?? [])],
    inputValue: authored.defaultInputValue ?? "",
  });
  const editBaseline = useRef(""),
    lastValue = useRef(JSON.stringify(value));
  const interactive = !options.disabled && !options.readOnly;
  const id = (part: keyof NonNullable<TagsInputOptions["ids"]>) =>
    options.ids?.[part] ?? `${options.id ?? generated}-${part}`;
  const announce = (text: string) =>
    setAnnouncement((previous) => ({ key: previous.key + 1, text }));
  const focus = () => {
    if (!options.disabled) input.current?.focus();
  };
  const isDisabled = (index: number) =>
    !interactive || disabledItems.current.get(index) === true;
  const reject = (result: {
    reason: TagsInputInvalidReason;
    inputValue: string;
  }) => {
    options.onValueInvalid?.({ ...result, value: [...value] });
    announce(
      options.translations?.invalidTag?.(result.inputValue) ??
        `Could not add ${result.inputValue}.`,
    );
  };
  const highlight = (index: number | null) => {
    if (
      !interactive ||
      (index !== null &&
        (index < 0 || index >= liveValue.current.length || isDisabled(index)))
    )
      return;
    setHighlighted(index);
    options.onHighlightChange?.({
      highlightedIndex: index,
      highlightedValue: index === null ? null : value[index],
    });
    if (index !== null)
      announce(
        options.translations?.tagSelected?.(value[index]) ??
          `${value[index]} selected.`,
      );
  };
  const addValues = (candidates: string[]) => {
    if (!interactive || !candidates.length) return false;
    const previous = liveValue.current;
    const result = acceptTagsInputValues(previous, candidates, options);
    if (!result.accepted) {
      reject(result);
      return false;
    }
    commitValue(result.value);
    changeInput("");
    setHighlighted(null);
    const added = result.value.slice(previous.length);
    announce(
      added.length === 1
        ? (options.translations?.tagAdded?.(added[0]) ?? `${added[0]} added.`)
        : (options.translations?.tagsPasted?.(added) ??
            `${added.length} tags added.`),
    );
    return true;
  };
  const setValueAtIndex = (index: number, next: string) => {
    if (index < 0 || index >= liveValue.current.length || isDisabled(index))
      return false;
    const result = acceptTagsInputValues(
      liveValue.current,
      [next],
      options,
      index,
    );
    if (!result.accepted) {
      reject(result);
      return false;
    }
    commitValue(result.value);
    announce(
      options.translations?.tagUpdated?.(result.value[index]) ??
        `${result.value[index]} updated.`,
    );
    return true;
  };
  const clearValue = (index?: number) => {
    if (
      !interactive ||
      (index !== undefined &&
        (index < 0 || index >= liveValue.current.length || isDisabled(index)))
    )
      return;
    const removed = index === undefined ? undefined : liveValue.current[index];
    commitValue(
      liveValue.current.filter((_, position) =>
        index === undefined
          ? disabledItems.current.get(position)
          : position !== index,
      ),
    );
    setEditing(null);
    setHighlighted(null);
    announce(
      index === undefined
        ? (options.translations?.noTagsSelected ?? "Tags cleared.")
        : (options.translations?.tagDeleted?.(removed!) ??
            `${removed} removed.`),
    );
    focus();
  };
  const cancelEdit = (restoreFocus = true) => {
    setEditing(null);
    setDraft("");
    if (restoreFocus) focus();
  };
  const commitEdit = () => {
    if (editing === null || isDisabled(editing)) return false;
    if (!(options.sanitizeValue ?? ((value) => value.trim()))(draft)) {
      clearValue(editing);
      return true;
    }
    if (!setValueAtIndex(editing, draft)) return false;
    setEditing(null);
    setDraft("");
    focus();
    return true;
  };
  useLayoutEffect(() => {
    const serialized = JSON.stringify(value);
    if (serialized !== lastValue.current) {
      lastValue.current = serialized;
      if (editing !== null && serialized !== editBaseline.current) {
        setEditing(null);
        setDraft("");
      }
      setHighlighted(null);
    }
  }, [value, editing]);
  useLayoutEffect(() => {
    if (editing !== null) itemInput.current?.select();
  }, [editing]);
  useEffect(() => {
    if (options.autoFocus && !options.disabled) input.current?.focus();
  }, []);
  useEffect(() => {
    const element = input.current;
    const form = options.form
      ? element?.ownerDocument.getElementById(options.form)
      : element?.form;
    if (!form || form.tagName !== "FORM") return;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        if (authored.value === undefined)
          changeValue([...initial.current.value]);
        if (authored.inputValue === undefined)
          changeInput(initial.current.inputValue);
        setEditing(null);
        setHighlighted(null);
        setDraft("");
      });
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [
    options.form,
    authored.value,
    authored.inputValue,
    changeValue,
    changeInput,
  ]);
  const api: TagsInputController = {
    value,
    valueAsString: JSON.stringify(value),
    inputValue,
    count: value.length,
    empty: !value.length,
    atMax: value.length >= maximum(options.max),
    highlightedIndex: highlighted,
    editingIndex: editing,
    editValue: draft,
    addValue: (value) => addValues([value]),
    addValues,
    setValueAtIndex,
    clearValue,
    setValue(next) {
      if (
        !interactive ||
        [...disabledItems.current].some(
          ([index, disabled]) => disabled && next[index] !== value[index],
        )
      )
        return false;
      const result = acceptTagsInputValues([], next, options);
      if (!result.accepted) {
        reject(result);
        return false;
      }
      commitValue(result.value);
      setHighlighted(null);
      setEditing(null);
      return true;
    },
    setInputValue(next) {
      if (interactive) changeInput(next);
    },
    clearInputValue() {
      if (interactive) changeInput("");
    },
    focus,
    highlight,
    startEdit(index) {
      if (
        !options.editable ||
        isDisabled(index) ||
        index < 0 ||
        index >= value.length
      )
        return;
      editBaseline.current = JSON.stringify(value);
      setEditing(index);
      setDraft(value[index]);
      setHighlighted(index);
      announce(
        options.translations?.tagEdited?.(value[index]) ??
          `Editing ${value[index]}.`,
      );
    },
    setEditValue(next) {
      if (interactive) setDraft(next);
    },
    commitEdit,
    cancelEdit,
    getItemState({ index, disabled }) {
      return {
        id: `${id("root")}-item-${index}`,
        disabled: !!disabled || isDisabled(index),
        editing: editing === index,
        highlighted: highlighted === index,
      };
    },
  };
  stores.set(api, {
    api,
    options,
    root,
    input,
    itemInput,
    disabledItems,
    branches,
    announcement,
    id,
    externalInvalid,
    setValidationInvalid,
  });
  return api;
}
