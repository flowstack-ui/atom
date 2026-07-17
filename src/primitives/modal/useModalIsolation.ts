"use client";

import { useLayoutEffect } from "react";
import type { FocusScope } from "../../hooks/focus.js";
import type { ModalLayer } from "./layer.js";
import { registerModalIsolation } from "./isolation.js";

export function useModalIsolation(
  layer: ModalLayer,
  focusScope: FocusScope,
  enabled: boolean,
): void {
  useLayoutEffect(() => {
    if (!enabled) return undefined;
    const ownerDocument = layer.content?.ownerDocument ?? document;
    return registerModalIsolation(layer, focusScope, ownerDocument);
  }, [enabled, focusScope, layer]);
}
