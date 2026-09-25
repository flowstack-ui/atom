"use client";

import { createContext, useContext } from "react";

export interface RadioGroupContextValue {
  /** Owned positioning host, independent of public data-slot overrides. */
  getRootElement?: () => HTMLElement | null;
  /** Currently selected value. */
  activeValue: string;
  /** Enabled keyboard entry, independent of the selected application value. */
  entryValue?: string;
  labelId?: string;
  setLabelId?: (id: string | undefined) => void;
  /** Set the active value. */
  setActiveValue: (value: string) => void;
  /** Form field name shared across radio items. */
  name: string | undefined;
  /** Form owner ID shared across radio hidden inputs. */
  form: string | undefined;
  /** Group-level disabled state. */
  disabled: boolean;
  /** Group-level read-only state. */
  readOnly: boolean;
  /** Group-level required state. */
  required: boolean;
  /** Group-level invalid state. */
  invalid: boolean;
  /** Keyboard orientation. */
  orientation: "horizontal" | "vertical";
  /** Arrow-key wrapping. */
  loop: boolean;
  /** Register a radio element for roving tabindex. */
  registerRadio: (value: string, element: HTMLElement) => void;
  /** Unregister a radio element. */
  unregisterRadio: (value: string) => void;
  /** Get a registered radio element by value. */
  getRadioElement: (value: string) => HTMLElement | null;
  /** Get registered radio values in DOM order. */
  getRadioValues: () => string[];
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);
RadioGroupContext.displayName = "RadioGroupContext";

export const RadioGroupContextProvider = RadioGroupContext.Provider;

export function useRadioGroupContext(): RadioGroupContextValue {
  const context = useContext(RadioGroupContext);

  if (!context) {
    throw new Error("Radio must be used within a <RadioGroupRoot>.");
  }

  return context;
}
