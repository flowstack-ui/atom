"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { useTabsContext } from "./context.js";

const useSafeLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface IndicatorPosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

type TabsIndicatorNativeProps = NativeDivProps<"children">;

export interface TabsIndicatorProps extends TabsIndicatorNativeProps {
  /** CSS class name supplied by the styled layer or consumer. */
  className?: string;
  /** Data slot identifier. */
  "data-slot"?: string;
}

export function TabsIndicator({
  className,
  "data-slot": dataSlot = "tabs-indicator",
  style: styleProp,
  ...restProps
}: TabsIndicatorProps) {
  const { activeValue, getTriggerElement, orientation } = useTabsContext();
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<IndicatorPosition | null>(null);

  const updatePosition = useCallback(() => {
    const triggerElement = getTriggerElement(activeValue);
    if (!triggerElement) {
      setPosition(null);
      return;
    }

    const listElement = triggerElement.closest('[data-slot="tabs-list"]');
    if (!listElement) {
      setPosition(null);
      return;
    }

    const listRect = listElement.getBoundingClientRect();
    const triggerRect = triggerElement.getBoundingClientRect();

    setPosition({
      left: triggerRect.left - listRect.left,
      top: triggerRect.top - listRect.top,
      width: triggerRect.width,
      height: triggerRect.height,
    });
  }, [activeValue, getTriggerElement]);

  useSafeLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    const triggerElement = getTriggerElement(activeValue);
    if (!triggerElement) return undefined;

    const observer = new ResizeObserver(() => {
      updatePosition();
    });

    observer.observe(triggerElement);

    const listElement = triggerElement.closest('[data-slot="tabs-list"]');
    if (listElement) {
      observer.observe(listElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [activeValue, getTriggerElement, updatePosition]);

  if (!position) return null;

  const style = {
    ...styleProp,
    "--tabs-indicator-left": `${position.left}px`,
    "--tabs-indicator-top": `${position.top}px`,
    "--tabs-indicator-width": `${position.width}px`,
    "--tabs-indicator-height": `${position.height}px`,
  } as CSSProperties;

  return (
    <div
      {...restProps}
      ref={indicatorRef}
      data-slot={dataSlot}
      data-orientation={orientation}
      style={style}
      className={className}
    />
  );
}
