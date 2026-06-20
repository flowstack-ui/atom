import {
  ListItem,
  ListRoot,
} from "./primitives/list/index.js";

export {
  ListItem,
  ListRoot,
} from "./primitives/list/index.js";
export type {
  ListItemProps,
  ListRootProps,
} from "./primitives/list/index.js";

export const List = {
  Root: ListRoot,
  Item: ListItem,
} as const;
