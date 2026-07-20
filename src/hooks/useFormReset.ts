"use client";

import { useEffect, type RefObject } from "react";

/** Keeps an uncontrolled custom form value in sync with native form reset. */
export function useFormReset(
  elementRef: RefObject<HTMLElement | null>,
  formId: string | undefined,
  controlled: boolean,
  reset: () => void,
): void {
  useEffect(() => {
    if (controlled) return undefined;

    const element = elementRef.current;
    const associatedForm = formId
      ? element?.ownerDocument.getElementById(formId)
      : element?.closest("form");
    if (!associatedForm || associatedForm.tagName !== "FORM") return undefined;

    associatedForm.addEventListener("reset", reset);
    return () => associatedForm.removeEventListener("reset", reset);
  }, [controlled, elementRef, formId, reset]);
}
