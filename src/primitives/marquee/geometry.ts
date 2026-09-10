export type MarqueeSide = "start" | "end" | "top" | "bottom";
export const MAX_MARQUEE_TRACKS = 50;

export function normalizeMarqueeNumbers(speed = 50, delay = 0, loopCount = 0) {
  return {
    speed: Number.isFinite(speed) && speed > 0 ? speed : 50,
    delay: Number.isFinite(delay) && delay >= 0 ? delay : 0,
    loopCount: Number.isSafeInteger(loopCount) && loopCount >= 0 ? loopCount : 0,
  };
}
export function marqueeDirection(side: MarqueeSide, dir: "ltr" | "rtl", reverse: boolean) {
  const vertical = side === "top" || side === "bottom";
  const positive = vertical ? side === "bottom" : (side === "end") !== (dir === "rtl");
  return { orientation: vertical ? "vertical" as const : "horizontal" as const, reversed: positive !== reverse };
}
export function marqueeGeometry(extent: number, viewport: number, spacing: number, speed: number, autoFill: boolean) {
  const distance = extent + spacing;
  if (![extent, viewport, spacing, speed, distance].every(Number.isFinite) || extent <= 0 || viewport <= 0 || spacing < 0 || speed <= 0) return null;
  const copyCount = autoFill ? Math.max(1, Math.ceil(viewport / distance)) : 1;
  if (copyCount + 1 > MAX_MARQUEE_TRACKS || (!autoFill && viewport > distance + 1)) return null;
  return { distance, duration: distance / speed, copyCount };
}
export function invalidMarqueeReplica(root: HTMLElement) {
  return !!root.querySelector('[id],[name],a,button,input,select,textarea,form,fieldset,iframe,object,embed,video,audio,[tabindex],[contenteditable]:not([contenteditable="false"]),[autofocus],[role="button"],[role="link"],[role="checkbox"],[role="radio"],[role="switch"],[role="slider"],[role="spinbutton"],[role="textbox"],[role="combobox"],[role="menuitem"],[role="option"],[role="tab"]');
}
