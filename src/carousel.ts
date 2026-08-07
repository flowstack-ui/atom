"use client";

import {
  CarouselNext,
  CarouselPicker,
  CarouselPickerItem,
  CarouselPrevious,
  CarouselRoot,
  CarouselRotationControl,
  CarouselSlide,
  CarouselTrack,
  CarouselViewport,
} from "./primitives/carousel/index.js";

export * from "./primitives/carousel/index.js";

export const Carousel = {
  Root: CarouselRoot,
  Viewport: CarouselViewport,
  Track: CarouselTrack,
  Slide: CarouselSlide,
  Previous: CarouselPrevious,
  Next: CarouselNext,
  Picker: CarouselPicker,
  PickerItem: CarouselPickerItem,
  RotationControl: CarouselRotationControl,
} as const;

