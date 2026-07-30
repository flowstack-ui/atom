export type OutsideInteractionPointerType =
  | "mouse"
  | "touch"
  | "pen"
  | "virtual";

/**
 * A preventable Atom interaction event emitted before an open layer dismisses.
 * Preventing this event cancels only Atom's dismissal; it does not prevent the
 * original DOM activation from reaching its destination.
 */
export interface OutsideInteractionEvent {
  readonly originalEvent: MouseEvent;
  readonly pointerType: OutsideInteractionPointerType;
  readonly target: Node;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}
