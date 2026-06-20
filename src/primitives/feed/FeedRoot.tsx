"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { FOCUSABLE_SELECTOR } from "../../hooks/focus.js";
import type { NativeDivProps } from "../../utils/dom.js";
import {
  cloneAndMerge,
  composeEventHandlers,
  composeRefs,
  renderElement,
  type RenderProp,
} from "../../utils/slot.js";
import {
  FeedContextProvider,
  type FeedContextValue,
  type FeedSetSize,
} from "./context.js";

type FeedRootNativeProps = NativeDivProps<"children" | "role" | "aria-busy">;

export interface FeedRootProps extends FeedRootNativeProps {
  /** Feed articles. Use `Feed.Item` for each article in the stream. */
  children?: ReactNode;
  /** Whether the feed is currently loading or mutating content. */
  busy?: boolean;
  /** Total number of feed items when known. Use `"unknown"` for infinite feeds. */
  setSize?: FeedSetSize;
  /** Override the rendered root element. */
  render?: RenderProp;
  /** Merge feed props onto a single child. The child should render a feed-compatible element. */
  asChild?: boolean;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export const FeedRoot = forwardRef<HTMLElement, FeedRootProps>(
  function FeedRoot(
    {
      children,
      busy = false,
      setSize,
      render,
      asChild,
      onKeyDown,
      "data-slot": dataSlot = "feed",
      ...restProps
    },
    ref,
  ) {
    const feedRef = useRef<HTMLElement | null>(null);
    const composedRef = useMemo(() => composeRefs(feedRef, ref), [ref]);

    const contextValue = useMemo<FeedContextValue>(
      () => ({
        busy,
        setSize,
      }),
      [busy, setSize],
    );

    const getArticles = useCallback((): HTMLElement[] => {
      const feed = feedRef.current;
      if (!feed) return [];

      return Array.from(feed.children).filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && element.getAttribute("role") === "article",
      );
    }, []);

    const focusArticle = useCallback((article: HTMLElement | undefined) => {
      article?.focus({ preventScroll: true });
    }, []);

    const focusOutsideFeed = useCallback((direction: "before" | "after") => {
      const feed = feedRef.current;
      if (!feed) return;

      const focusableElements = Array.from(
        document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !feed.contains(element));

      if (direction === "before") {
        const previousElement = focusableElements
          .filter((element) =>
            Boolean(element.compareDocumentPosition(feed) & Node.DOCUMENT_POSITION_FOLLOWING),
          )
          .at(-1);
        previousElement?.focus({ preventScroll: true });
        return;
      }

      const nextElement = focusableElements.find((element) =>
        Boolean(feed.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING),
      );
      nextElement?.focus({ preventScroll: true });
    }, []);

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
      (event) => {
        const articles = getArticles();
        if (articles.length === 0) return;

        if ((event.ctrlKey || event.metaKey) && event.key === "Home") {
          event.preventDefault();
          focusOutsideFeed("before");
          return;
        }

        if ((event.ctrlKey || event.metaKey) && event.key === "End") {
          event.preventDefault();
          focusOutsideFeed("after");
          return;
        }

        if (event.key !== "PageDown" && event.key !== "PageUp") return;

        const activeElement = document.activeElement;
        const currentIndex = articles.findIndex(
          (article) => article === activeElement || article.contains(activeElement),
        );
        if (currentIndex === -1) return;

        event.preventDefault();
        const nextIndex =
          event.key === "PageDown"
            ? Math.min(articles.length - 1, currentIndex + 1)
            : Math.max(0, currentIndex - 1);
        focusArticle(articles[nextIndex]);
      },
      [focusArticle, focusOutsideFeed, getArticles],
    );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composedRef,
      role: "feed",
      "aria-busy": busy ? true : undefined,
      "data-slot": dataSlot,
      ...(busy && { "data-busy": "" }),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    return (
      <FeedContextProvider value={contextValue}>
        {asChild
          ? cloneAndMerge(children, behaviorProps)
          : renderElement(render, "div", { ...behaviorProps, children })}
      </FeedContextProvider>
    );
  },
);
