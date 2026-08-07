"use client";

import { createContext, useContext } from "react";
import type { DirectionValue } from "../direction/index.js";

export type CarouselChangeReason =
  | "autoplay"
  | "next"
  | "picker"
  | "previous"
  | "scroll";

export interface CarouselSlideData extends Record<string, unknown> {
  label?: string;
}

export interface CarouselContextValue {
  activeValue: string;
  autoPlay: boolean;
  isPlaying: boolean;
  dir: DirectionValue;
  loop: boolean;
  previousAriaLabel: string;
  nextAriaLabel: string;
  startAriaLabel: string;
  stopAriaLabel: string;
  idPrefix: string;
  registerSlide: (value: string, element: HTMLElement, data: CarouselSlideData) => void;
  unregisterSlide: (value: string) => void;
  getSlideValues: () => string[];
  getSlideElement: (value: string) => HTMLElement | null;
  getSlideData: (value: string) => CarouselSlideData | null;
  selectValue: (value: string, reason: CarouselChangeReason) => void;
  goPrevious: (reason?: CarouselChangeReason) => void;
  goNext: (reason?: CarouselChangeReason) => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  stopAutoPlay: () => void;
  toggleAutoPlay: () => void;
  setViewportElement: (element: HTMLElement | null) => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);
CarouselContext.displayName = "CarouselContext";

export const CarouselContextProvider = CarouselContext.Provider;

export function useCarouselContext(): CarouselContextValue {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error("Carousel compound components must be used within <CarouselRoot>.");
  }

  return context;
}
