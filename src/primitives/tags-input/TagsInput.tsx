"use client";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ButtonHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from "react";
import {
  composeEventHandlers,
  composeRefs,
  cloneAndMerge,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";
import { useFieldContext } from "../field/context.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import {
  useFormControlProxy,
  formControlProxyStyle,
} from "../../hooks/useFormControlProxy.js";
import { ComboboxInput } from "../combobox/ComboboxInput.js";
import { ComboboxControl } from "../combobox/ComboboxControl.js";
import { useOptionalComboboxContext } from "../combobox/context.js";
import type { ComboboxRootProps } from "../combobox/ComboboxRoot.js";
import {
  TagsInputContext as StoreContext,
  getTagsInputStore,
  useTagsInput,
  useTagsInputStore,
  splitTagsInput,
  type TagsInputOptions,
  type TagsInputController,
  type TagsInputOutsideEvent,
} from "./controller.js";

export type TagsInputRootProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange" | "dir"
> &
  TagsInputOptions & { "data-slot"?: string };
export type TagsInputRootProviderProps = HTMLAttributes<HTMLDivElement> & {
  value: TagsInputController;
  "data-slot"?: string;
};
export type TagsInputInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "name" | "type" | "required" | "size"
>;
export type TagsInputItemProps = HTMLAttributes<HTMLDivElement> & {
  index: number;
  value: string;
  disabled?: boolean;
  "data-slot"?: string;
};
export type TagsInputItemInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "name" | "type"
>;
export type TagsInputTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
};
const optionNames = new Set([
  "value",
  "defaultValue",
  "inputValue",
  "defaultInputValue",
  "onValueChange",
  "onInputValueChange",
  "onHighlightChange",
  "onValueInvalid",
  "validate",
  "sanitizeValue",
  "max",
  "maxLength",
  "allowDuplicates",
  "allowOverflow",
  "addOnPaste",
  "delimiter",
  "blurBehavior",
  "editable",
  "disabled",
  "readOnly",
  "invalid",
  "required",
  "autoFocus",
  "placeholder",
  "name",
  "form",
  "id",
  "ids",
  "dir",
  "translations",
  "onFocusOutside",
  "onPointerDownOutside",
  "onInteractOutside",
  "validationBehavior",
]);
const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  border: 0,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
} as const;
function cancelable(originalEvent: Event): TagsInputOutsideEvent {
  let prevented = false;
  return {
    originalEvent,
    target: originalEvent.target,
    get defaultPrevented() {
      return prevented;
    },
    preventDefault() {
      prevented = true;
    },
  };
}
export const TagsInputRoot = forwardRef<HTMLDivElement, TagsInputRootProps>(
  function TagsInputRoot(props, ref) {
    const options: Record<string, unknown> = {},
      native: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props))
      (optionNames.has(key) ? options : native)[key] = value;
    const api = useTagsInput(options as TagsInputOptions);
    return <TagsInputRootProvider {...native} value={api} ref={ref} />;
  },
);
export const TagsInputRootProvider = forwardRef<
  HTMLDivElement,
  TagsInputRootProviderProps
>(function TagsInputRootProvider(
  { value: api, children, "data-slot": slot = "tags-input", ...props },
  ref,
) {
  const store = getTagsInputStore(api),
    { options, root, branches } = store;
  const active = useRef(false);
  useDismissableLayer({
    enabled: api.editingIndex !== null || api.highlightedIndex !== null,
    ownerDocument: root.current?.ownerDocument,
    onEscapeKeyDown(event) {
      if (event.isComposing || event.keyCode === 229) return;
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          event.preventDefault();
          if (api.editingIndex !== null) api.cancelEdit();
          else api.highlight(null);
        }
      });
    },
  });
  useEffect(() => {
    const node = root.current,
      doc = node?.ownerDocument;
    if (!node || !doc || options.disabled) return;
    const outside = (event: Event) => {
      const path = event.composedPath();
      if (
        path.includes(node) ||
        [...branches.current].some(
          (branch) => branch.current && path.includes(branch.current),
        )
      ) {
        active.current = true;
        return;
      }
      if (
        !active.current &&
        !node.contains(doc.activeElement) &&
        api.editingIndex === null &&
        api.highlightedIndex === null
      )
        return;
      const detail = cancelable(event);
      (event.type === "focusin"
        ? options.onFocusOutside
        : options.onPointerDownOutside)?.(detail);
      options.onInteractOutside?.(detail);
      if (detail.defaultPrevented) return;
      active.current = false;
      if (api.editingIndex !== null) api.cancelEdit(false);
      api.highlight(null);
      if (options.blurBehavior === "add" && api.inputValue.trim())
        api.addValue(api.inputValue);
      if (options.blurBehavior === "clear") api.clearInputValue();
    };
    doc.addEventListener("focusin", outside, true);
    doc.addEventListener("pointerdown", outside, true);
    return () => {
      doc.removeEventListener("focusin", outside, true);
      doc.removeEventListener("pointerdown", outside, true);
    };
  }, [store]);
  const invalid = options.invalid;
  return (
    <StoreContext.Provider value={store}>
      <div
        {...props}
        ref={composeRefs(root, ref)}
        id={props.id ?? store.id("root")}
        dir={options.dir}
        data-slot={slot}
        data-disabled={options.disabled ? "" : undefined}
        data-readonly={options.readOnly ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        data-empty={api.empty ? "" : undefined}
      >
        {children}
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={srOnly}
        >
          <span key={store.announcement.key}>{store.announcement.text}</span>
        </span>
      </div>
    </StoreContext.Provider>
  );
});
export function TagsInputContext({
  children,
}: {
  children: (value: TagsInputController) => ReactNode;
}) {
  return children(useTagsInputStore().api);
}
export const TagsInputLabel = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(function TagsInputLabel(props, ref) {
  const store = useTagsInputStore();
  return (
    <label
      {...props}
      ref={ref}
      id={props.id ?? store.id("label")}
      htmlFor={store.id("input")}
      data-slot="tags-input-label"
    />
  );
});
export const TagsInputControl = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function TagsInputControl({ onClick, ...props }, ref) {
  const store = useTagsInputStore(),
    combo = useOptionalComboboxContext();
  const native = {
    ...props,
    ref,
    id: props.id ?? store.id("control"),
    "data-slot": "tags-input-control",
    onClick: composeEventHandlers(
      onClick,
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) store.api.focus();
      },
    ),
  };
  return combo ? <ComboboxControl {...native} /> : <div {...native} />;
});

/** Bind the existing Combobox without a second draft owner or named proxy. */
export function useTagsInputCombobox(): Pick<
  ComboboxRootProps,
  | "value"
  | "inputValue"
  | "onValueChange"
  | "onInputValueChange"
  | "clearOnSelect"
  | "required"
  | "disabled"
  | "readOnly"
  | "invalid"
> {
  const { api, options } = useTagsInputStore();
  const pending = useRef<{ accepted: boolean; draft: string } | null>(null);
  return {
    value: null,
    inputValue: api.inputValue,
    clearOnSelect: true,
    required: false,
    disabled: options.disabled,
    readOnly: options.readOnly,
    invalid: options.invalid,
    onValueChange(value) {
      if (value === null) return;
      pending.current = {
        accepted: api.addValue(value),
        draft: api.inputValue,
      };
      queueMicrotask(() => {
        pending.current = null;
      });
    },
    onInputValueChange(value) {
      const selection = pending.current;
      pending.current = null;
      api.setInputValue(
        selection ? (selection.accepted ? "" : selection.draft) : value,
      );
    },
  };
}
export const TagsInputInput = forwardRef<HTMLInputElement, TagsInputInputProps>(
  function TagsInputInput(
    {
      onChange,
      onKeyDown,
      onPaste,
      onCompositionStart,
      onCompositionEnd,
      ...props
    },
    ref,
  ) {
    const store = useTagsInputStore(),
      { api, options } = store,
      field = useFieldContext(),
      combo = useOptionalComboboxContext();
    const composing = useRef(false);
    const compositionEnded = useRef(false);
    useEffect(() => {
      if (!combo) return;
      store.branches.current.add(combo.contentRef);
      return () => {
        store.branches.current.delete(combo.contentRef);
      };
    }, [store.branches, combo?.contentRef]);
    const receive = (text: string) => {
      const delimiter = options.delimiter ?? ",";
      const ends =
        typeof delimiter === "string"
          ? !!delimiter && text.endsWith(delimiter)
          : new RegExp(
              `(?:${delimiter.source})$`,
              delimiter.flags.replace(/[gy]/g, ""),
            ).test(text);
      api.setInputValue(text);
      if (!composing.current && !compositionEnded.current && ends) {
        const candidates = splitTagsInput(text, delimiter).filter((value) =>
          value.trim(),
        );
        if (candidates.length) api.addValues(candidates);
      }
    };
    const keyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        event.nativeEvent.isComposing ||
        event.keyCode === 229 ||
        options.disabled ||
        options.readOnly
      )
        return;
      if (
        combo?.isOpen &&
        ["ArrowLeft", "ArrowRight", "Escape"].includes(event.key)
      )
        return;
      if (event.key === "Enter") {
        if (combo?.isOpen && combo.highlightedValue) return;
        event.preventDefault();
        if (api.highlightedIndex !== null) api.startEdit(api.highlightedIndex);
        else if (api.inputValue) api.addValue(api.inputValue);
        return;
      }
      if (event.key === "Escape" && api.highlightedIndex !== null) {
        event.preventDefault();
        api.highlight(null);
        return;
      }
      const start =
        event.currentTarget.selectionStart === 0 &&
        event.currentTarget.selectionEnd === 0;
      const backward = options.dir === "rtl" ? "ArrowRight" : "ArrowLeft",
        forward = options.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      if (
        (event.key === backward || event.key === "Backspace") &&
        start &&
        api.highlightedIndex === null
      ) {
        for (let index = api.count - 1; index >= 0; index--)
          if (!api.getItemState({ index }).disabled) {
            event.preventDefault();
            api.highlight(index);
            break;
          }
        return;
      }
      if (api.highlightedIndex === null) return;
      if (["Backspace", "Delete"].includes(event.key)) {
        event.preventDefault();
        api.clearValue(api.highlightedIndex);
        return;
      }
      if (event.key === backward || event.key === forward) {
        event.preventDefault();
        const step = event.key === backward ? -1 : 1;
        let index = api.highlightedIndex + step;
        while (
          index >= 0 &&
          index < api.count &&
          api.getItemState({ index }).disabled
        )
          index += step;
        api.highlight(index >= 0 && index < api.count ? index : null);
      }
    };
    const native = {
      ...props,
      ref: composeRefs(store.input, ref),
      id: props.id ?? store.id("input"),
      type: "text" as const,
      value: api.inputValue,
      disabled: options.disabled,
      readOnly: options.readOnly,
      form: options.form,
      maxLength: options.maxLength,
      placeholder: props.placeholder ?? options.placeholder,
      autoComplete: props.autoComplete ?? "off",
      "aria-label": props["aria-label"] ?? options.translations?.inputLabel,
      "aria-labelledby":
        props["aria-labelledby"] ??
        (props["aria-label"] ? undefined : field?.labelId),
      "aria-describedby": props["aria-describedby"] ?? field?.describedBy,
      "aria-required": options.required || undefined,
      "aria-invalid": options.invalid || undefined,
      "data-slot": "tags-input-input",
      onChange: composeEventHandlers(
        onChange,
        (event: React.ChangeEvent<HTMLInputElement>) => {
          receive(event.currentTarget.value);
          if (combo) {
            event.preventDefault();
            combo.onHighlight(null);
            if (!options.disabled && !options.readOnly) combo.onOpen();
          }
        },
      ),
      onKeyDown: composeEventHandlers(onKeyDown, keyDown),
      onCompositionStart: composeEventHandlers(onCompositionStart, () => {
        composing.current = true;
      }),
      onCompositionEnd: composeEventHandlers(onCompositionEnd, () => {
        composing.current = false;
        compositionEnded.current = true;
        queueMicrotask(() => {
          compositionEnded.current = false;
        });
      }),
      onPaste: composeEventHandlers(
        onPaste,
        (event: React.ClipboardEvent<HTMLInputElement>) => {
          if (!options.addOnPaste || options.disabled || options.readOnly)
            return;
          event.preventDefault();
          const text = event.clipboardData.getData("text");
          api.setInputValue(text);
          api.addValues(
            splitTagsInput(text, options.delimiter).filter((value) =>
              value.trim(),
            ),
          );
        },
      ),
    };
    // Combobox reads its controlled draft from the bindings; its native onChange
    // also follows our normalization handler, so delimiter adds must not be undone.
    return combo ? <ComboboxInput {...native} /> : <input {...native} />;
  },
);

const ItemContext = createContext<{
  index: number;
  value: string;
  disabled?: boolean;
} | null>(null);
function useItem() {
  const item = useContext(ItemContext);
  if (!item) throw new Error("TagsInput item parts require Item");
  return item;
}
export const TagsInputItem = forwardRef<HTMLDivElement, TagsInputItemProps>(
  function TagsInputItem({ index, value, disabled, children, ...props }, ref) {
    const store = useTagsInputStore();
    useLayoutEffect(() => {
      store.disabledItems.current.set(index, !!disabled);
      return () => {
        store.disabledItems.current.delete(index);
      };
    }, [store.disabledItems, index, disabled]);
    const item = useMemo(
      () => ({ index, value, disabled }),
      [index, value, disabled],
    );
    return (
      <ItemContext.Provider value={item}>
        <div
          {...props}
          ref={ref}
          data-slot="tags-input-item"
          data-disabled={disabled || store.options.disabled ? "" : undefined}
        >
          {children}
        </div>
      </ItemContext.Provider>
    );
  },
);
export const TagsInputItemPreview = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(function TagsInputItemPreview(
  { onPointerDown, onDoubleClick, ...props },
  ref,
) {
  const item = useItem(),
    { api } = useTagsInputStore(),
    state = api.getItemState(item);
  return (
    <span
      {...props}
      ref={ref}
      id={props.id ?? state.id}
      hidden={state.editing}
      data-slot="tags-input-item-preview"
      data-highlighted={state.highlighted ? "" : undefined}
      data-disabled={state.disabled ? "" : undefined}
      onPointerDown={composeEventHandlers(onPointerDown, (event) => {
        if (
          !state.disabled &&
          event.button === 0 &&
          !(event.target as HTMLElement).closest("button")
        ) {
          event.preventDefault();
          api.focus();
          api.highlight(item.index);
        }
      })}
      onDoubleClick={composeEventHandlers(onDoubleClick, () => {
        if (!state.disabled) api.startEdit(item.index);
      })}
    />
  );
});
export const TagsInputItemText = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(function TagsInputItemText({ children, ...props }, ref) {
  const item = useItem();
  return (
    <span {...props} ref={ref} data-slot="tags-input-item-text">
      {children ?? item.value}
    </span>
  );
});
export const TagsInputItemInput = forwardRef<
  HTMLInputElement,
  TagsInputItemInputProps
>(function TagsInputItemInput({ onChange, onKeyDown, onBlur, ...props }, ref) {
  const store = useTagsInputStore(),
    item = useItem(),
    state = store.api.getItemState(item);
  return (
    <input
      {...props}
      ref={composeRefs(state.editing ? store.itemInput : undefined, ref)}
      hidden={!state.editing}
      value={state.editing ? store.api.editValue : ""}
      disabled={state.disabled}
      readOnly={store.options.readOnly}
      maxLength={store.options.maxLength}
      aria-label={
        props["aria-label"] ??
        store.options.translations?.tagEdited?.(item.value) ??
        `Edit ${item.value}`
      }
      data-slot="tags-input-item-input"
      size={Math.max(1, store.api.editValue.length)}
      onChange={composeEventHandlers(onChange, (event) =>
        store.api.setEditValue(event.currentTarget.value),
      )}
      onBlur={composeEventHandlers(onBlur, () => {
        if (state.editing) store.api.cancelEdit(false);
      })}
      onKeyDown={composeEventHandlers(onKeyDown, (event) => {
        if (event.nativeEvent.isComposing || event.keyCode === 229) return;
        if (event.key === "Enter") {
          event.preventDefault();
          store.api.commitEdit();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          store.api.cancelEdit();
        }
      })}
    />
  );
});
function trigger(part: "delete" | "clear") {
  return forwardRef<HTMLButtonElement, TagsInputTriggerProps>(
    function TagsInputTrigger(
      { children, asChild, render, onClick, "data-slot": slot, ...props },
      ref,
    ) {
      const store = useTagsInputStore(),
        item = useContext(ItemContext),
        { api, options } = store;
      if (part === "delete" && !item)
        throw new Error("ItemDeleteTrigger requires Item");
      const disabled =
        props.disabled ||
        options.disabled ||
        options.readOnly ||
        (part === "delete" && api.getItemState(item!).disabled);
      const native = {
        ...props,
        ref,
        type: "button",
        disabled: !!disabled,
        hidden: part === "clear" && api.empty,
        "data-slot":
          slot ??
          (part === "delete"
            ? "tags-input-item-delete-trigger"
            : "tags-input-clear-trigger"),
        "aria-label":
          props["aria-label"] ??
          (part === "delete"
            ? (options.translations?.deleteTagTriggerLabel?.(item!.value) ??
              `Remove ${item!.value}`)
            : (options.translations?.clearTriggerLabel ?? "Clear tags")),
        onClick: composeEventHandlers(onClick, () => {
          if (!disabled)
            api.clearValue(part === "delete" ? item!.index : undefined);
        }),
        children,
      };
      return asChild
        ? cloneAndMerge(children, native)
        : renderElement(render, "button", native);
    },
  );
}
export const TagsInputItemDeleteTrigger = trigger("delete"),
  TagsInputClearTrigger = trigger("clear");
export const TagsInputHiddenInput = forwardRef<
  HTMLInputElement,
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "type" | "name" | "required" | "readOnly"
  >
>(function TagsInputHiddenInput({ style, ...props }, ref) {
  const store = useTagsInputStore(),
    { api, options } = store,
    field = useFieldContext(),
    proxy = useRef<HTMLInputElement>(null);
  useFormControlProxy(proxy, store.input);
  const validation = useFormValidation({
    validityRef: proxy,
    ownerRef: store.input,
    invalid: store.externalInvalid,
    inheritedInvalid: false,
    validationBehavior: options.validationBehavior,
    form: options.form,
    reportValidity: field?.reportControlValidity,
  });
  useLayoutEffect(() => {
    proxy.current?.setCustomValidity(
      options.required && api.empty && !options.readOnly
        ? (options.translations?.requiredMessage ??
            "Please add at least one value.")
        : "",
    );
    validation.validationProps.onChange();
  }, [
    api.valueAsString,
    options.required,
    options.readOnly,
    options.translations?.requiredMessage,
  ]);
  useEffect(() => {
    store.setValidationInvalid(validation.invalid);
  }, [validation.invalid, store.setValidationInvalid]);
  return (
    <input
      {...props}
      ref={composeRefs(proxy, ref)}
      type="text"
      value={api.valueAsString}
      name={options.name}
      form={options.form}
      disabled={options.disabled}
      readOnly={options.readOnly}
      aria-hidden="true"
      tabIndex={-1}
      id={store.id("hiddenInput")}
      data-slot="tags-input-hidden-input"
      style={{ ...formControlProxyStyle, ...style }}
      {...validation.validationProps}
      onFocus={() => store.api.focus()}
    />
  );
});
export const TagsInput = {
  Root: TagsInputRoot,
  RootProvider: TagsInputRootProvider,
  Context: TagsInputContext,
  Label: TagsInputLabel,
  Control: TagsInputControl,
  Input: TagsInputInput,
  Item: TagsInputItem,
  ItemPreview: TagsInputItemPreview,
  ItemText: TagsInputItemText,
  ItemInput: TagsInputItemInput,
  ItemDeleteTrigger: TagsInputItemDeleteTrigger,
  ClearTrigger: TagsInputClearTrigger,
  HiddenInput: TagsInputHiddenInput,
};
