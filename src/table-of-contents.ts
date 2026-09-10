"use client";
export * from "./primitives/table-of-contents/index.js";
import { TableOfContentsRoot, TableOfContentsRootProvider, TableOfContentsContext,
  TableOfContentsNav, TableOfContentsTitle, TableOfContentsList, TableOfContentsItem,
  TableOfContentsLink, TableOfContentsIndicator } from "./primitives/table-of-contents/index.js";
export const TableOfContents = {
  Root: TableOfContentsRoot, RootProvider: TableOfContentsRootProvider,
  Context: TableOfContentsContext, Nav: TableOfContentsNav, Title: TableOfContentsTitle,
  List: TableOfContentsList, Item: TableOfContentsItem, Link: TableOfContentsLink,
  Indicator: TableOfContentsIndicator,
} as const;
