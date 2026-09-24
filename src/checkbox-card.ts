"use client";
import { CheckboxCardRoot, CheckboxCardRootProvider, CheckboxCardHiddenInput, CheckboxCardControl, CheckboxCardLabel, CheckboxCardDescription, CheckboxCardIndicator, CheckboxCardContext } from "./primitives/checkbox-card/CheckboxCard.js";
export * from "./primitives/checkbox-card/CheckboxCard.js";
export { useCheckbox as useCheckboxCard } from "./primitives/checkbox/useCheckbox.js";
export const CheckboxCard = { Root: CheckboxCardRoot, RootProvider: CheckboxCardRootProvider, HiddenInput: CheckboxCardHiddenInput, Control: CheckboxCardControl, Label: CheckboxCardLabel, Description: CheckboxCardDescription, Indicator: CheckboxCardIndicator, Context: CheckboxCardContext } as const;
