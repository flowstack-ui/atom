"use client";

import {
  forwardRef,
  useCallback,
  type ChangeEventHandler,
} from "react";
import type { NativeInputProps } from "../../utils/dom.js";
import { formControlProxyStyle, useFormControlProxy } from "../../hooks/useFormControlProxy.js";
import { composeEventHandlers } from "../../utils/dom.js";
import { composeRefs } from "../../utils/slot.js";
import { useFileUploadContext } from "./context.js";

type FileUploadHiddenInputNativeProps = NativeInputProps<
  | "children"
  | "accept"
  | "disabled"
  | "multiple"
  | "onChange"
  | "readOnly"
  | "required"
  | "type"
  | "aria-invalid"
>;

export interface FileUploadHiddenInputProps extends FileUploadHiddenInputNativeProps {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  "data-slot"?: string;
}

export const FileUploadHiddenInput = forwardRef<
  HTMLInputElement,
  FileUploadHiddenInputProps
>(function FileUploadHiddenInput(
  {
    onChange,
    "data-slot": dataSlot = "file-upload-hidden-input",
    ...restProps
  },
  ref,
) {
  const ctx = useFileUploadContext();
  useFormControlProxy(ctx.inputRef, ctx.triggerRef);
  const composedRef = useCallback(
    (node: HTMLInputElement | null) => {
      composeRefs(ctx.inputRef, ref)(node);
    },
    [ctx.inputRef, ref],
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = event.currentTarget.files;
    if (files && files.length > 0) {
      ctx.setFilesFromList(files);
    }
  };

  return (
    <input
      {...restProps}
      ref={composedRef}
      id={ctx.controlId}
      type="file"
      name={ctx.name}
      form={ctx.form}
      accept={ctx.accept}
      multiple={ctx.multiple || undefined}
      disabled={ctx.disabled || undefined}
      required={ctx.required || undefined}
      aria-describedby={ctx.describedBy}
      aria-invalid={ctx.invalid || undefined}
      aria-hidden="true"
      tabIndex={-1}
      style={formControlProxyStyle}
      data-slot={dataSlot}
      onFocus={() => ctx.triggerRef.current?.focus()}
      onChange={composeEventHandlers(onChange, handleChange)}
    />
  );
});
