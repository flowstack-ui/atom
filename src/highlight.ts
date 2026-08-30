import {
  HighlightMatch,
  HighlightRoot,
} from "./primitives/highlight/index.js";

export {
  HighlightMatch,
  HighlightRoot,
  findHighlightSegments,
} from "./primitives/highlight/index.js";
export type {
  HighlightMatchProps,
  HighlightOptions,
  HighlightRootProps,
  HighlightSegment,
} from "./primitives/highlight/index.js";

export const Highlight = {
  Root: HighlightRoot,
  Match: HighlightMatch,
} as const;
