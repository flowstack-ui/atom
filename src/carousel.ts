"use client";

import {
  CarouselNext,
  CarouselPicker,
  CarouselPickerItem,
  CarouselPrevious,
  CarouselRoot,
  CarouselRootProvider,
  CarouselRotationControl,
  CarouselSlide,
  CarouselTrack,
  CarouselViewport,
} from "./primitives/carousel/index.js";

export * from "./primitives/carousel/index.js";

export const Carousel = {
  Root: CarouselRoot,
  RootProvider: CarouselRootProvider,
  Viewport: CarouselViewport,
  Track: CarouselTrack,
  Slide: CarouselSlide,
  Previous: CarouselPrevious,
  Next: CarouselNext,
  Picker: CarouselPicker,
  PickerItem: CarouselPickerItem,
  RotationControl: CarouselRotationControl,
} as const;
