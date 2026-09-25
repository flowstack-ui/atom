import type { OutsideInteractionEvent } from "./interactions.js";

/** Explicit records support opaque item components, async data and SSR forms. */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectLifecycleOptions {
  /** Defer mounting until first open. Defaults to true. */
  lazyMount?: boolean;
  /** Remove the popup after exit. Defaults to true. */
  unmountOnExit?: boolean;
  /** Override visual presence, without changing selection/open state. */
  present?: boolean;
  onExitComplete?: () => void;
}

export interface SelectOutsideEvents {
  onFocusOutside?: (event: FocusEvent) => void;
  onPointerDownOutside?: (event: OutsideInteractionEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

export interface SelectIds {
  root?: string;
  trigger?: string;
  content?: string;
}
