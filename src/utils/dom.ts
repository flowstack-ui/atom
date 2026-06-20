import type { ComponentPropsWithoutRef, JSX } from "react";

type NativeProps<
  ElementName extends keyof JSX.IntrinsicElements,
  Blocked extends PropertyKey,
> = Omit<ComponentPropsWithoutRef<ElementName>, Extract<Blocked, keyof ComponentPropsWithoutRef<ElementName>>>;

/** Native props for primitives that render a button by default. */
export type NativeButtonProps<Blocked extends PropertyKey = never> = NativeProps<"button", Blocked>;

/** Native props for primitives that render a span by default. */
export type NativeSpanProps<Blocked extends PropertyKey = never> = NativeProps<"span", Blocked>;

/** Native props for primitives that render a label by default. */
export type NativeLabelProps<Blocked extends PropertyKey = never> = NativeProps<"label", Blocked>;

/** Native props for primitives that render a div by default. */
export type NativeDivProps<Blocked extends PropertyKey = never> = NativeProps<"div", Blocked>;

/** Native props for primitives that render a header by default. */
export type NativeHeaderProps<Blocked extends PropertyKey = never> = NativeProps<"header", Blocked>;

/** Native props for primitives that render a section by default. */
export type NativeSectionProps<Blocked extends PropertyKey = never> = NativeProps<"section", Blocked>;

/** Native props for primitives that render a main by default. */
export type NativeMainProps<Blocked extends PropertyKey = never> = NativeProps<"main", Blocked>;

/** Native props for primitives that render an aside by default. */
export type NativeAsideProps<Blocked extends PropertyKey = never> = NativeProps<"aside", Blocked>;

/** Native props for primitives that render a fieldset by default. */
export type NativeFieldsetProps<Blocked extends PropertyKey = never> = NativeProps<"fieldset", Blocked>;

/** Native props for primitives that render a form by default. */
export type NativeFormProps<Blocked extends PropertyKey = never> = NativeProps<"form", Blocked>;

/** Native props for primitives that render a table by default. */
export type NativeTableProps<Blocked extends PropertyKey = never> = NativeProps<"table", Blocked>;

/** Native props for primitives that render a thead by default. */
export type NativeTableHeaderProps<Blocked extends PropertyKey = never> = NativeProps<"thead", Blocked>;

/** Native props for primitives that render a tbody by default. */
export type NativeTableBodyProps<Blocked extends PropertyKey = never> = NativeProps<"tbody", Blocked>;

/** Native props for primitives that render a tfoot by default. */
export type NativeTableFooterProps<Blocked extends PropertyKey = never> = NativeProps<"tfoot", Blocked>;

/** Native props for primitives that render a tr by default. */
export type NativeTableRowProps<Blocked extends PropertyKey = never> = NativeProps<"tr", Blocked>;

/** Native props for primitives that render a th by default. */
export type NativeTableHeadProps<Blocked extends PropertyKey = never> = NativeProps<"th", Blocked>;

/** Native props for primitives that render a td by default. */
export type NativeTableCellProps<Blocked extends PropertyKey = never> = NativeProps<"td", Blocked>;

/** Native props for primitives that render a caption by default. */
export type NativeTableCaptionProps<Blocked extends PropertyKey = never> = NativeProps<"caption", Blocked>;

/** Native props for primitives that render a legend by default. */
export type NativeLegendProps<Blocked extends PropertyKey = never> = NativeProps<"legend", Blocked>;

/** Native props for primitives that render an anchor by default. */
export type NativeAnchorProps<Blocked extends PropertyKey = never> = NativeProps<"a", Blocked>;

/** Native props for primitives that render a heading by default. */
export type NativeHeadingProps<Blocked extends PropertyKey = never> = NativeProps<"h2", Blocked>;

/** Native props for primitives that render an image by default. */
export type NativeImageProps<Blocked extends PropertyKey = never> = NativeProps<"img", Blocked>;

/** Native props for primitives that render a paragraph by default. */
export type NativeParagraphProps<Blocked extends PropertyKey = never> = NativeProps<"p", Blocked>;

/** Native props for primitives that render a nav by default. */
export type NativeNavProps<Blocked extends PropertyKey = never> = NativeProps<"nav", Blocked>;

/** Native props for primitives that render a ul by default. */
export type NativeListProps<Blocked extends PropertyKey = never> = NativeProps<"ul", Blocked>;

/** Native props for primitives that render an ol by default. */
export type NativeOrderedListProps<Blocked extends PropertyKey = never> = NativeProps<"ol", Blocked>;

/** Native props for primitives that render an li by default. */
export type NativeListItemProps<Blocked extends PropertyKey = never> = NativeProps<"li", Blocked>;

/** Native props for primitives that render an input by default. */
export type NativeInputProps<Blocked extends PropertyKey = never> = NativeProps<"input", Blocked>;

/** Native props for primitives that render a textarea by default. */
export type NativeTextareaProps<Blocked extends PropertyKey = never> = NativeProps<"textarea", Blocked>;

/**
 * Composes consumer and Atom event handlers.
 *
 * Consumer handlers run first so they can call preventDefault() to opt out of
 * Atom's built-in behavior when a primitive documents that escape hatch.
 */
export function composeEventHandlers<Event extends { defaultPrevented?: boolean }>(
  consumerHandler: ((event: Event) => void) | undefined,
  atomHandler: (event: Event) => void,
): (event: Event) => void {
  return (event) => {
    consumerHandler?.(event);

    if (!event.defaultPrevented) {
      atomHandler(event);
    }
  };
}
