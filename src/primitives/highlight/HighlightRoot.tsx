import { forwardRef } from "react";
import type { NativeSpanProps } from "../../utils/dom.js";
import { renderElement, type RenderProp } from "../../utils/slot.js";
import { HighlightMatch } from "./HighlightMatch.js";
import {
  findHighlightSegments,
  type HighlightOptions,
} from "./findHighlightSegments.js";

type HighlightRootNativeProps = NativeSpanProps<"children" | "dangerouslySetInnerHTML">;

export interface HighlightRootProps
  extends HighlightRootNativeProps,
    HighlightOptions {
  /** Plain text to segment and render. */
  text: string;
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const HighlightRoot = forwardRef<HTMLSpanElement, HighlightRootProps>(
  function HighlightRoot(
    {
      query,
      text,
      ignoreCase = true,
      matchAll = true,
      exactMatch = false,
      render,
      "data-slot": dataSlot = "highlight",
      ...rest
    },
    ref,
  ) {
    const children = findHighlightSegments(text, {
      query,
      ignoreCase,
      matchAll,
      exactMatch,
    }).map((segment) => segment.match ? (
      <HighlightMatch key={`${segment.start}:${segment.end}`}>
        {segment.text}
      </HighlightMatch>
    ) : segment.text);

    const { dangerouslySetInnerHTML: _blockedHtml, ...safeRest } = rest as
      typeof rest & { dangerouslySetInnerHTML?: unknown };
    const behaviorProps: Record<string, unknown> = {
      ...safeRest,
      ref,
      "data-slot": dataSlot,
    };

    return renderElement(render, "span", {
      ...behaviorProps,
      children,
    });
  },
);
