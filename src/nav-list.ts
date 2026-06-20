"use client";

import {
  NavListItem,
  NavListLink,
  NavListList,
  NavListRoot,
  NavListSection,
  NavListSectionContent,
  NavListSectionLabel,
  NavListSectionTrigger,
} from "./primitives/nav-list/index.js";

export {
  NavListContextProvider,
  NavListItem,
  NavListLink,
  NavListList,
  NavListRoot,
  NavListSection,
  NavListSectionContent,
  NavListSectionContextProvider,
  NavListSectionLabel,
  NavListSectionTrigger,
  useNavListContext,
  useNavListSectionContext,
} from "./primitives/nav-list/index.js";
export type {
  NavListContextValue,
  NavListCurrentValue,
  NavListItemProps,
  NavListLinkProps,
  NavListListProps,
  NavListOrientation,
  NavListRootProps,
  NavListSectionContentProps,
  NavListSectionContextValue,
  NavListSectionLabelElement,
  NavListSectionLabelProps,
  NavListSectionProps,
  NavListSectionTriggerProps,
} from "./primitives/nav-list/index.js";

export const NavList = {
  Root: NavListRoot,
  List: NavListList,
  Item: NavListItem,
  Link: NavListLink,
  Section: NavListSection,
  SectionLabel: NavListSectionLabel,
  SectionTrigger: NavListSectionTrigger,
  SectionContent: NavListSectionContent,
} as const;
