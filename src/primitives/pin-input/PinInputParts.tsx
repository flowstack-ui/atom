"use client";
import {
  forwardRef,
  useEffect,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from "react";
import { usePinInputInternalContext, usePinInputContext } from "./context.js";
import type { PinInputController } from "./PinInputRoot.js";
export interface PinInputContextProps {
  children: (controller: PinInputController) => ReactNode;
}
export function PinInputContext({ children }: PinInputContextProps) {
  return children(usePinInputContext());
}
export interface PinInputLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}
export const PinInputLabel = forwardRef<HTMLLabelElement, PinInputLabelProps>(
  function PinInputLabel(props, ref) {
    const { labelId, setLabelMounted, getInputId } =
      usePinInputInternalContext();
    useEffect(() => {
      setLabelMounted(true);
      return () => setLabelMounted(false);
    }, [setLabelMounted]);
    return (
      <label
        {...props}
        ref={ref}
        id={labelId}
        htmlFor={getInputId(0)}
        data-slot="pin-input-label"
      />
    );
  },
);
export interface PinInputControlProps extends HTMLAttributes<HTMLDivElement> {}
export const PinInputControl = forwardRef<HTMLDivElement, PinInputControlProps>(
  function PinInputControl(props, ref) {
    usePinInputInternalContext();
    return <div {...props} ref={ref} data-slot="pin-input-control" />;
  },
);
