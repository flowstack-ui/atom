"use client";

import {
  createContext,
  createElement,
  isValidElement,
  type Ref,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useFormValidation } from "../../hooks/useFormValidation.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import { useFieldContext } from "../field/context.js";
import { useDirection } from "../direction/index.js";
import { useDismissableLayer } from "../../hooks/useDismissableLayer.js";

type EditableProjection = { asChild?: boolean };
// Structural projection keeps the same behavior on one consumer-provided host.
// Editors deliberately retain their native input/textarea hosts.
const EditablePart = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & EditableProjection & { tag: "div" | "span" }>(
  function EditablePart({ tag, asChild, children, ...props }, ref) {
    // React 18 stores refs on the element; avoid React 19's deprecated getter.
    const legacyRef = isValidElement(children)
      ? Object.getOwnPropertyDescriptor(children, "ref")?.value as Ref<unknown> | undefined
      : undefined;
    return asChild
      ? cloneAndMerge(children, { ...props, ref: composeRefs(legacyRef, ref) })
      : createElement(tag, { ...props, ref }, children);
  },
);

export type EditableActivationMode = "focus" | "click" | "dblclick" | "none";
export type EditableSubmitMode = "enter" | "blur" | "both" | "none";
export interface EditableValueChangeDetails {
  value: string;
}
export interface EditableEditChangeDetails {
  edit: boolean;
}
export interface EditableOutsideEvent {
  originalEvent: Event;
  target: EventTarget | null;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}
export interface EditableOptions {
  value?: string;
  defaultValue?: string;
  edit?: boolean;
  defaultEdit?: boolean;
  onValueChange?: (details: EditableValueChangeDetails) => void;
  onEditChange?: (details: EditableEditChangeDetails) => void;
  onValueCommit?: (details: EditableValueChangeDetails) => void;
  onValueRevert?: (details: EditableValueChangeDetails) => void;
  activationMode?: EditableActivationMode;
  submitMode?: EditableSubmitMode;
  selectOnFocus?: boolean;
  autoResize?: boolean;
  maxLength?: number;
  placeholder?: string | { edit: string; preview: string };
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  name?: string;
  form?: string;
  id?: string;
  dir?: "ltr" | "rtl";
  ids?: Partial<
    Record<
      | "root"
      | "area"
      | "label"
      | "preview"
      | "input"
      | "control"
      | "editTrigger"
      | "submitTrigger"
      | "cancelTrigger",
      string
    >
  >;
  translations?: Partial<
    Record<"input" | "edit" | "submit" | "cancel", string>
  >;
  finalFocusEl?: () => HTMLElement | null;
  getRootNode?: () => Document | ShadowRoot;
  onFocusOutside?: (event: EditableOutsideEvent) => void;
  onPointerDownOutside?: (event: EditableOutsideEvent) => void;
  onInteractOutside?: (event: EditableOutsideEvent) => void;
}
interface Internal {
  options: EditableOptions;
  root: React.RefObject<HTMLDivElement | null>;
  input: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  preview: React.RefObject<HTMLSpanElement | null>;
  trigger: React.RefObject<HTMLButtonElement | null>;
  suppressFocus: React.MutableRefObject<boolean>;
  id(part: keyof NonNullable<EditableOptions["ids"]>): string;
  finish(reason: "commit" | "cancel", restore?: boolean): void;
}
export interface EditableController {
  editing: boolean;
  empty: boolean;
  value: string;
  valueText: string;
  setValue(value: string): void;
  clearValue(): void;
  edit(): void;
  submit(): void;
  cancel(): void;
}
const internals = new WeakMap<EditableController, Internal>();
const Context = createContext<EditableController | null>(null);
Context.displayName = "Editable";
function useStore() {
  const controller = useContext(Context);
  if (!controller)
    throw new Error("Editable parts require Editable.Root or RootProvider");
  const internal = internals.get(controller);
  if (!internal)
    throw new Error(
      "Editable.RootProvider requires a controller from useEditable",
    );
  return { controller, ...internal };
}
export function useEditableContext() {
  return useStore().controller;
}
function outsideEvent(event: Event): EditableOutsideEvent {
  let prevented = false;
  return {
    originalEvent: event,
    target: event.target,
    get defaultPrevented() {
      return prevented;
    },
    preventDefault() {
      prevented = true;
    },
  };
}

export function useEditable(
  authored: EditableOptions = {},
): EditableController {
  const generated = useId();
  const direction = useDirection();
  const field = useFieldContext();
  const options: EditableOptions = {
    activationMode: "focus",
    submitMode: "both",
    selectOnFocus: true,
    ...authored,
    disabled: authored.disabled ?? field?.disabled,
    readOnly: authored.readOnly ?? field?.readOnly,
    required: authored.required ?? field?.required,
    invalid: authored.invalid ?? field?.invalid,
    dir: authored.dir ?? direction,
  };
  const [value, changeValue] = useControllableState({
    value: authored.value,
    defaultValue: authored.defaultValue ?? "",
    onChange: (value) => authored.onValueChange?.({ value }),
  });
  const [editing, changeEdit] = useControllableState({
    value: authored.edit,
    defaultValue: authored.defaultEdit ?? false,
    onChange: (edit) => authored.onEditChange?.({ edit }),
  });
  const root = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement | HTMLTextAreaElement>(null),
    preview = useRef<HTMLSpanElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const suppressFocus = useRef(false),
    initial = useRef(authored.defaultValue ?? ""),
    baseline = useRef(value),
    wasEditing = useRef(editing);
  const pending = useRef<{
    reason: "commit" | "cancel" | "reset";
    restore: boolean;
  } | null>(null);
  const latest = useRef({ options, value, editing });
  latest.current = { options, value, editing };
  const interactive = !options.disabled && !options.readOnly;
  const setValue = (next: string) => {
    if (!interactive) return;
    const max =
      options.maxLength === undefined
        ? undefined
        : Math.max(0, Math.floor(options.maxLength));
    const text = max === undefined ? next : next.slice(0, max);
    if (text !== value) changeValue(text);
  };
  const begin = () => {
    if (!interactive || editing) return;
    pending.current = null;
    baseline.current = value;
    changeEdit(true);
  };
  const finish = (reason: "commit" | "cancel", restore = true) => {
    if (!interactive || !latest.current.editing) return;
    pending.current = { reason, restore };
    changeEdit(false);
  };
  useLayoutEffect(() => {
    if (editing && !wasEditing.current) baseline.current = value;
    if (!editing && wasEditing.current) {
      const transition = pending.current ?? {
        reason: "cancel",
        restore: false,
      };
      pending.current = null;
      if (transition.reason === "cancel") {
        if (value !== baseline.current) changeValue(baseline.current);
        authored.onValueRevert?.({ value: baseline.current });
      } else if (transition.reason === "commit") {
        baseline.current = value;
        authored.onValueCommit?.({ value });
      }
      if (transition.restore) {
        suppressFocus.current = true;
        const target =
          options.finalFocusEl?.() ?? trigger.current ?? preview.current;
        target?.focus({ preventScroll: true });
        queueMicrotask(() => {
          suppressFocus.current = false;
        });
      }
    }
    wasEditing.current = editing;
  }, [
    editing,
    value,
    authored.onValueRevert,
    authored.onValueCommit,
    changeValue,
    options.finalFocusEl,
  ]);
  useLayoutEffect(() => {
    if (!editing || !interactive) return;
    input.current?.focus({ preventScroll: true });
    if (options.selectOnFocus) input.current?.select();
  }, [editing, interactive]);
  useEffect(() => {
    if (!editing || !interactive) return;
    const owner = options.getRootNode?.() ?? root.current?.ownerDocument;
    if (!owner) return;
    const handle = (event: Event) => {
      const target = event.composedPath()[0] ?? event.target;
      if (!target || root.current?.contains(target as Node)) return;
      const info = outsideEvent(event),
        current = latest.current.options;
      if (event.type === "focusin") current.onFocusOutside?.(info);
      else current.onPointerDownOutside?.(info);
      current.onInteractOutside?.(info);
      if (info.defaultPrevented) return;
      finish(
        current.submitMode === "both" || current.submitMode === "blur"
          ? "commit"
          : "cancel",
        false,
      );
    };
    owner.addEventListener("focusin", handle);
    owner.addEventListener("pointerdown", handle);
    return () => {
      owner.removeEventListener("focusin", handle);
      owner.removeEventListener("pointerdown", handle);
    };
  }, [editing, interactive, options.getRootNode]);
  useEffect(() => {
    const element = input.current;
    const form = element?.form;
    if (!form) return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        pending.current = { reason: "reset", restore: false };
        if (authored.value === undefined) {
          baseline.current = initial.current;
          changeValue(initial.current);
        }
        if (authored.edit === undefined) changeEdit(false);
      });
    };
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [authored.value, authored.edit, options.form, changeEdit, changeValue]);
  const placeholder =
    typeof options.placeholder === "string"
      ? options.placeholder
      : options.placeholder?.preview;
  const controller = useMemo<EditableController>(
    () => ({
      editing,
      value,
      empty: !value.trim(),
      valueText: value.trim() ? value : (placeholder ?? ""),
      setValue,
      clearValue: () => setValue(""),
      edit: begin,
      submit: () => finish("commit"),
      cancel: () => finish("cancel"),
    }),
    [
      editing,
      value,
      placeholder,
      interactive,
      options.maxLength,
      changeEdit,
      changeValue,
    ],
  );
  internals.set(controller, {
    options,
    root,
    input,
    preview,
    trigger,
    suppressFocus,
    id: (part) =>
      options.ids?.[part] ??
      (part === "input" && field?.controlId
        ? field.controlId
        : `${options.id ?? generated}-${part}`),
    finish,
  });
  return controller;
}
const optionNames = new Set([
  "value",
  "defaultValue",
  "edit",
  "defaultEdit",
  "onValueChange",
  "onEditChange",
  "onValueCommit",
  "onValueRevert",
  "activationMode",
  "submitMode",
  "selectOnFocus",
  "autoResize",
  "maxLength",
  "placeholder",
  "disabled",
  "readOnly",
  "required",
  "invalid",
  "name",
  "form",
  "id",
  "dir",
  "ids",
  "translations",
  "finalFocusEl",
  "getRootNode",
  "onFocusOutside",
  "onPointerDownOutside",
  "onInteractOutside",
]);
export type EditableRootProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange" | "dir"
> &
  EditableOptions & EditableProjection & { "data-slot"?: string };
export type EditableRootProviderProps = HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  value: EditableController;
  "data-slot"?: string;
};
export const EditableRootProvider = forwardRef<
  HTMLDivElement,
  EditableRootProviderProps
>(function EditableRootProvider(
  { value, "data-slot": slot = "editable", ...props },
  ref,
) {
  const internal = internals.get(value);
  if (!internal) throw new Error("Editable.RootProvider requires useEditable");
  useDismissableLayer({
    enabled: value.editing && !internal.options.disabled && !internal.options.readOnly,
    ownerDocument: internal.root.current?.ownerDocument,
    onEscapeKeyDown(event) {
      if (event.isComposing || event.keyCode === 229) return;
      // Reserve this Escape for the edit session before an ancestor Dialog.
      // Native/consumer input handlers run first and may prevent cancellation.
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          event.preventDefault();
          value.cancel();
        }
      });
    },
  });
  return (
    <Context.Provider value={value}>
      <EditablePart tag="div"
        {...props}
        ref={composeRefs(internal.root, ref)}
        id={props.id ?? internal.id("root")}
        dir={internal.options.dir}
        data-slot={slot}
        data-state={value.editing ? "editing" : "preview"}
        data-disabled={internal.options.disabled ? "" : undefined}
        data-readonly={internal.options.readOnly ? "" : undefined}
        data-invalid={internal.options.invalid ? "" : undefined}
        data-autoresize={internal.options.autoResize ? "" : undefined}
      />
    </Context.Provider>
  );
});
export const EditableRoot = forwardRef<HTMLDivElement, EditableRootProps>(
  function EditableRoot(props, ref) {
    const options: Record<string, unknown> = {},
      native: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props))
      (optionNames.has(key) ? options : native)[key] = value;
    const controller = useEditable(options as EditableOptions);
    return <EditableRootProvider {...native} value={controller} ref={ref} />;
  },
);
export function EditableContext({
  children,
}: {
  children: (controller: EditableController) => ReactNode;
}) {
  return children(useEditableContext());
}
export const EditableArea = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & EditableProjection
>(function EditableArea({ style, ...props }, ref) {
  const { options, id } = useStore();
  return (
    <EditablePart tag="div"
      {...props}
      id={props.id ?? id("area")}
      ref={ref}
      data-slot="editable-area"
      style={{
        ...(options.autoResize
          ? { display: "inline-grid", maxWidth: "100%" }
          : {}),
        ...style,
      }}
    />
  );
});
export const EditableControl = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & EditableProjection
>(function EditableControl(props, ref) {
  return (
    <EditablePart tag="div"
      {...props}
      id={props.id ?? useStore().id("control")}
      ref={ref}
      data-slot="editable-control"
    />
  );
});
export const EditableLabel = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(function EditableLabel({ onClick, ...props }, ref) {
  const { controller, id, options } = useStore();
  return (
    <label
      {...props}
      id={props.id ?? id("label")}
      htmlFor={id("input")}
      ref={ref}
      data-slot="editable-label"
      onClick={composeEventHandlers(onClick, () => {
        if (!options.disabled && !options.readOnly) controller.edit();
      })}
    />
  );
});
export const EditablePreview = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement> & EditableProjection
>(function EditablePreview(
  { onClick, onDoubleClick, onFocus, onKeyDown, children, style, ...props },
  ref,
) {
  const { controller, options, preview, suppressFocus, id } = useStore();
  const interactive = !options.disabled && !options.readOnly;
  const begin = (mode: EditableActivationMode) => {
    if (options.activationMode === mode && !suppressFocus.current)
      controller.edit();
  };
  return (
    <EditablePart tag="span"
      {...props}
      ref={composeRefs(preview, ref)}
      id={props.id ?? id("preview")}
      role={interactive ? "button" : undefined}
      aria-label={props["aria-label"] ?? options.translations?.edit}
      aria-disabled={options.disabled || undefined}
      tabIndex={interactive ? 0 : undefined}
      hidden={options.autoResize ? undefined : controller.editing}
      aria-hidden={controller.editing || undefined}
      data-slot="editable-preview"
      data-placeholder-shown={controller.empty ? "" : undefined}
      style={{
        ...(options.autoResize
          ? {
              gridArea: "1 / 1",
              whiteSpace: "pre-wrap",
              visibility: controller.editing ? "hidden" : undefined,
            }
          : {}),
        ...style,
      }}
      onClick={composeEventHandlers(onClick, () => begin("click"))}
      onDoubleClick={composeEventHandlers(onDoubleClick, () =>
        begin("dblclick"),
      )}
      onFocus={composeEventHandlers(onFocus, () => begin("focus"))}
      onKeyDown={composeEventHandlers(onKeyDown, (event) => {
        if (
          options.activationMode !== "none" &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          controller.edit();
        }
      })}
    >
      {children ?? controller.valueText}
    </EditablePart>
  );
});

export type EditableInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "size"
>;
export type EditableTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue"
>;
function useEntry(multiline: boolean) {
  const { controller, options, input, preview, id } = useStore();
  const field = useFieldContext();
  const validation = useFormValidation({
    validityRef: input,
    ownerRef: controller.editing ? input : preview,
    invalid: options.invalid,
    inheritedInvalid: false,
    validationBehavior: "inline",
    form: options.form,
    reportValidity: field?.reportControlValidity,
  });
  const label = options.translations?.input;
  return {
    controller,
    options,
    input,
    id,
    validation,
    field,
    props: {
      id: id("input"),
      name: options.name,
      form: options.form,
      value: controller.value,
      disabled: options.disabled,
      readOnly: options.readOnly,
      required: options.required,
      maxLength: options.maxLength,
      hidden: options.autoResize ? undefined : !controller.editing,
      "aria-hidden": controller.editing ? undefined : true,
      "aria-label": label,
      "aria-labelledby": label ? undefined : field?.labelId,
      "aria-describedby": field?.describedBy,
      "aria-invalid": validation.invalid || undefined,
      "data-invalid": validation.invalid ? "" : undefined,
      placeholder:
        typeof options.placeholder === "string"
          ? options.placeholder
          : options.placeholder?.edit,
      style: options.autoResize
        ? {
            gridArea: "1 / 1",
            minWidth: 0,
            width: "100%",
            visibility: controller.editing ? undefined : ("hidden" as const),
          }
        : undefined,
      onKeyDown: (
        event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        if (
          event.nativeEvent.isComposing ||
          event.keyCode === 229 ||
          options.disabled ||
          options.readOnly
        )
          return;
        if (event.key === "Escape") {
          event.preventDefault();
          controller.cancel();
          return;
        }
        if (
          event.key !== "Enter" ||
          !(options.submitMode === "both" || options.submitMode === "enter")
        )
          return;
        if (
          multiline
            ? !(event.ctrlKey || event.metaKey)
            : event.shiftKey || event.metaKey || event.ctrlKey || event.altKey
        )
          return;
        event.preventDefault();
        controller.submit();
      },
    },
  };
}
export const EditableInput = forwardRef<HTMLInputElement, EditableInputProps>(
  function EditableInput(
    { onChange, onKeyDown, onInvalid, style, ...props },
    ref,
  ) {
    const entry = useEntry(false);
    return (
      <input
        {...entry.props}
        {...props}
        ref={composeRefs(entry.input, ref)}
        data-slot="editable-input"
        size={entry.options.autoResize ? 1 : undefined}
        style={{ ...entry.props.style, ...style }}
        onChange={composeEventHandlers(onChange, (event) => {
          entry.controller.setValue(event.currentTarget.value);
          entry.validation.validationProps.onChange();
        })}
        onKeyDown={composeEventHandlers(onKeyDown, entry.props.onKeyDown)}
        onInvalid={composeEventHandlers(onInvalid, (event) => {
          entry.controller.edit();
          entry.validation.validationProps.onInvalid(event);
        })}
      />
    );
  },
);
export const EditableTextarea = forwardRef<
  HTMLTextAreaElement,
  EditableTextareaProps
>(function EditableTextarea(
  { onChange, onKeyDown, onInvalid, style, ...props },
  ref,
) {
  const entry = useEntry(true);
  useLayoutEffect(() => {
    const element = entry.input.current;
    if (!entry.options.autoResize || !element) return;
    const resize = () => {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight + element.offsetHeight - element.clientHeight}px`;
    };
    resize();
    const view = element.ownerDocument.defaultView;
    let width = element.clientWidth;
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (element.clientWidth !== width) {
              width = element.clientWidth;
              resize();
            }
          })
        : null;
    observer?.observe(element);
    view?.addEventListener("resize", resize);
    return () => {
      observer?.disconnect();
      view?.removeEventListener("resize", resize);
    };
  }, [
    entry.controller.value,
    entry.controller.editing,
    entry.options.autoResize,
  ]);
  return (
    <textarea
      {...entry.props}
      {...props}
      ref={composeRefs(entry.input, ref)}
      data-slot="editable-textarea"
      style={{ ...entry.props.style, ...style }}
      onChange={composeEventHandlers(onChange, (event) => {
        entry.controller.setValue(event.currentTarget.value);
        entry.validation.validationProps.onChange();
      })}
      onKeyDown={composeEventHandlers(onKeyDown, entry.props.onKeyDown)}
      onInvalid={composeEventHandlers(onInvalid, (event) => {
        entry.controller.edit();
        entry.validation.validationProps.onInvalid(event);
      })}
    />
  );
});
export type EditableTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  render?: RenderProp;
  "data-slot"?: string;
};
function makeTrigger(kind: "edit" | "submit" | "cancel") {
  return forwardRef<HTMLButtonElement, EditableTriggerProps>(
    function EditableTrigger(
      { children, asChild, render, onClick, onKeyDown, ...props },
      ref,
    ) {
      const { controller, options, id, trigger } = useStore();
      const disabled = props.disabled || options.disabled || options.readOnly;
      const native = !asChild && (render === undefined || render === "button");
      const invoke = () => {
        if (!disabled) controller[kind]();
      };
      const behavior = {
        ...props,
        ref: kind === "edit" ? composeRefs(trigger, ref) : ref,
        id: props.id ?? id(`${kind}Trigger`),
        type: native ? "button" : undefined,
        role: native ? undefined : "button",
        tabIndex: disabled ? -1 : 0,
        disabled: native ? disabled : undefined,
        "aria-disabled": disabled || undefined,
        "aria-label": props["aria-label"] ?? options.translations?.[kind],
        hidden: kind === "edit" ? controller.editing : !controller.editing,
        "data-slot": props["data-slot"] ?? `editable-${kind}-trigger`,
        onClick: composeEventHandlers(onClick, invoke),
        onKeyDown: composeEventHandlers(onKeyDown, (event) => {
          if (!native && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            invoke();
          }
        }),
      };
      return asChild
        ? cloneAndMerge(children, behavior)
        : renderElement(render, "button", { ...behavior, children });
    },
  );
}
export const EditableEditTrigger = makeTrigger("edit"),
  EditableSubmitTrigger = makeTrigger("submit"),
  EditableCancelTrigger = makeTrigger("cancel");
export const Editable = {
  Root: EditableRoot,
  RootProvider: EditableRootProvider,
  Context: EditableContext,
  Area: EditableArea,
  Label: EditableLabel,
  Preview: EditablePreview,
  Input: EditableInput,
  Textarea: EditableTextarea,
  Control: EditableControl,
  EditTrigger: EditableEditTrigger,
  SubmitTrigger: EditableSubmitTrigger,
  CancelTrigger: EditableCancelTrigger,
} as const;
