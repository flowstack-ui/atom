import type { CarouselContextValue } from "./context.js";

const publicKeys = [
  "activeValue", "page", "pageSnapPoints", "visibleValues", "inViewValues",
  "canGoPrevious", "canGoNext", "autoPlay", "isPlaying", "isDragging",
  "initialized", "orientation", "dir", "loop", "slidesPerPage",
  "selectPage", "selectValue", "goPrevious", "goNext", "play", "pause",
  "stopAutoPlay", "toggleAutoPlay", "refresh",
] as const;

export type CarouselController = Pick<CarouselContextValue, typeof publicKeys[number]>;
const owners = new WeakMap<CarouselController, CarouselContextValue>();

/** Keep registration, geometry transport and event plumbing private. */
export function createCarouselController(api: CarouselContextValue): CarouselController {
  const controller = Object.fromEntries(publicKeys.map(key => [key, api[key]])) as CarouselController;
  owners.set(controller, api);
  return controller;
}

export function getCarouselControllerOwner(controller: CarouselController): CarouselContextValue {
  const owner = owners.get(controller);
  if (!owner) throw new Error("Carousel.RootProvider requires the unmodified controller returned by useCarousel.");
  return owner;
}
