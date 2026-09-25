export type SplitterSize = number | `${number}%` | `${number}px` | `${number}em` | `${number}rem` | `${number}vw` | `${number}vh`;
export interface SplitterMeasurement { em: number; rem: number; vw: number; vh: number }
export type SplitterSizes = Record<string, SplitterSize>;
export interface SplitterPanelConfig {
  id: string;
  minSize?: SplitterSize;
  maxSize?: SplitterSize;
  collapsible?: boolean;
  collapsedSize?: SplitterSize;
  resizeBehavior?: "proportional" | "preserve-pixels";
}
export interface PanelBounds { min: number; max: number; collapsed: number; collapsible: boolean }
const EPSILON = 0.000001;
export function percent(size: SplitterSize, extent: number, fallback = 0, measurement?: SplitterMeasurement): number {
  const n = typeof size === "number" ? size : Number.parseFloat(size);
  if (!Number.isFinite(n) || n < 0 || (typeof size === "string" && !/^\d+(?:\.\d+)?(?:%|px|em|rem|vw|vh)$/.test(size))) {
    throw new Error("Splitter sizes must be finite nonnegative percentages or explicit px, em, rem, vw or vh values.");
  }
  if (typeof size === "number" || size.endsWith("%")) return n;
  const unit = size.replace(/^[\d.]+/, "");
  const factor = unit === "px" ? 1 : measurement?.[unit as keyof SplitterMeasurement];
  return extent > 0 && factor !== undefined ? n * factor / extent * 100 : fallback;
}
export function validatePanels(panels: readonly SplitterPanelConfig[]) {
  if (panels.length < 1 || new Set(panels.map(p => p.id)).size !== panels.length || panels.some(p => !p.id)) {
    throw new Error("Splitter requires at least one uniquely named panel.");
  }
  if (panels.every(p => p.resizeBehavior === "preserve-pixels")) throw new Error("Splitter needs a proportional panel to absorb available space.");
}
export function getBounds(panels: readonly SplitterPanelConfig[], extent: number, measurement?: SplitterMeasurement): PanelBounds[] {
  validatePanels(panels);
  return panels.map(p => {
    const min = percent(p.minSize ?? 0, extent, 0, measurement);
    const max = p.maxSize === undefined ? Math.max(100, min) : percent(p.maxSize, extent, 100, measurement);
    const collapsed = percent(p.collapsedSize ?? 0, extent, 0, measurement);
    if (max < min || (p.collapsible && collapsed > min)) throw new Error("Splitter constraint interval is invalid.");
    return { min, max, collapsed, collapsible: !!p.collapsible };
  });
}
export function solve(panels: readonly SplitterPanelConfig[], requested: SplitterSizes, extent: number, measurement?: SplitterMeasurement) {
  const bounds = getBounds(panels, extent, measurement);
  const supplied = panels.map(p => Object.prototype.hasOwnProperty.call(requested, p.id) ? percent(requested[p.id]!, extent, 100 / panels.length, measurement) : null);
  const missing = supplied.filter(value => value === null).length;
  const remaining = Math.max(0, 100 - supplied.reduce<number>((sum, value) => sum + (value ?? 0), 0));
  const values = panels.map((p, i) => {
    const b = bounds[i]!;
    const value = supplied[i] ?? (missing ? remaining / missing : 0);
    return b.collapsible && value <= (b.min + b.collapsed) / 2 ? b.collapsed : Math.min(b.max, Math.max(b.min, value));
  });
  // Water-fill only flexible capacity; never violate minima to fit a smaller host.
  for (let pass = 0; pass < panels.length + 1; pass++) {
    const delta = 100 - values.reduce((a, b) => a + b, 0);
    if (Math.abs(delta) < EPSILON) break;
    const eligible = values.map((v, i) => i).filter(i => {
      const b = bounds[i]!;
      if (b.collapsible && Math.abs(values[i]! - b.collapsed) < EPSILON) return false;
      return delta > 0 ? values[i]! < b.max - EPSILON : values[i]! > b.min + EPSILON;
    });
    if (!eligible.length) break;
    for (const i of eligible) values[i] = Math.min(bounds[i]!.max, Math.max(bounds[i]!.min, values[i]! + delta / eligible.length));
  }
  return { sizes: Object.fromEntries(panels.map((p, i) => [p.id, values[i]!])), bounds,
    insufficientSpace: values.reduce((a, b) => a + b, 0) > 100 + EPSILON };
}
export function pairRange(values: Record<string, number>, panels: readonly SplitterPanelConfig[], bounds: PanelBounds[], before: string, after: string) {
  const i = panels.findIndex(p => p.id === before);
  if (i < 0 || panels[i + 1]?.id !== after) throw new Error("Splitter trigger must name adjacent panels in declared order.");
  const a = bounds[i]!, b = bounds[i + 1]!;
  const total = values[before]! + values[after]!;
  const min = Math.max(a.collapsible ? a.collapsed : a.min, total - b.max);
  const max = Math.min(a.max, total - (b.collapsible ? b.collapsed : b.min));
  return { min, max: Math.max(min, max), total, a, b };
}
export function boundaryRange(values: Record<string, number>, panels: readonly SplitterPanelConfig[], bounds: PanelBounds[], before: string, after: string) {
  pairRange(values, panels, bounds, before, after);
  const pivot = panels.findIndex(panel => panel.id === before);
  let value = 0, leftMin = 0, leftMax = 0, rightMin = 0, rightMax = 0, total = 0;
  panels.forEach((panel, i) => {
    const b = bounds[i]!, size = values[panel.id]!;
    total += size;
    if (i <= pivot) { value += size; leftMin += b.collapsible ? b.collapsed : b.min; leftMax += b.max; }
    else { rightMin += b.collapsible ? b.collapsed : b.min; rightMax += b.max; }
  });
  const min = Math.max(leftMin, total - rightMax), max = Math.min(leftMax, total - rightMin);
  return { value, min, max: Math.max(min, max) };
}
export function resizePair(values: Record<string, number>, panels: readonly SplitterPanelConfig[], bounds: PanelBounds[], before: string, after: string, target: number, input: "pointer" | "keyboard" = "pointer") {
  if (panels.length > 2) return resizeGroup(values, panels, bounds, before, after, target, input);
  const { min, max, total, a, b } = pairRange(values, panels, bounds, before, after);
  let next = Math.max(min, Math.min(max, target));
  if (input === "keyboard") {
    if (a.collapsible && target > values[before]! && values[before] === a.collapsed) next = Math.min(max, a.min);
    if (a.collapsible && target < values[before]! && values[before] === a.min) next = Math.max(min, a.collapsed);
    if (b.collapsible && target < values[before]! && values[after] === b.collapsed) next = Math.max(min, total - b.min);
    if (b.collapsible && target > values[before]! && values[after] === b.min) next = Math.min(max, total - b.collapsed);
  }
  if (a.collapsible && next < a.min) next = next < (a.min + a.collapsed) / 2 ? a.collapsed : a.min;
  if (b.collapsible && total - next < b.min) next = total - (total - next < (b.min + b.collapsed) / 2 ? b.collapsed : b.min);
  next = Math.max(min, Math.min(max, next));
  // Some collapsed intervals have no feasible point. Preserve the last legal pair.
  if ((next < a.min - EPSILON && Math.abs(next - a.collapsed) > EPSILON) ||
      (total - next < b.min - EPSILON && Math.abs(total - next - b.collapsed) > EPSILON)) return values;
  return { ...values, [before]: next, [after]: total - next };
}

/** Transfer space across the boundary, nearest panels first, conserving the total. */
function resizeGroup(values: Record<string, number>, panels: readonly SplitterPanelConfig[], bounds: PanelBounds[], before: string, after: string, target: number, input: "pointer" | "keyboard") {
  pairRange(values, panels, bounds, before, after);
  const pivot = panels.findIndex(panel => panel.id === before);
  let delta = target - values[before]!;
  if (!Number.isFinite(delta) || Math.abs(delta) < EPSILON) return values;
  const left = Array.from({ length: pivot + 1 }, (_, i) => pivot - i);
  const right = Array.from({ length: panels.length - pivot - 1 }, (_, i) => pivot + i + 1);
  const grow = delta > 0 ? left : right, shrink = delta > 0 ? right : left;
  if (input === "keyboard") {
    for (const [indices, expanding] of [[grow, true], [shrink, false]] as const) {
      const index = indices[0]!, b = bounds[index]!, value = values[panels[index]!.id]!;
      if (b.collapsible && ((expanding && value === b.collapsed) || (!expanding && value === b.min))) {
        delta = Math.sign(delta) * Math.max(Math.abs(delta), b.min - b.collapsed);
      }
    }
  }
  function allocate(indices: number[], expanding: boolean, amount: number) {
    const result = { ...values };
    let remaining = amount;
    for (const index of indices) {
      const id = panels[index]!.id, b = bounds[index]!, previous = values[id]!;
      let next = Math.max(b.collapsible ? b.collapsed : b.min, Math.min(b.max, previous + (expanding ? remaining : -remaining)));
      if (b.collapsible && next < b.min) next = next < (b.min + b.collapsed) / 2 ? b.collapsed : b.min;
      const consumed = Math.abs(next - previous);
      if (consumed > remaining + EPSILON) continue;
      result[id] = next; remaining -= consumed;
      if (remaining < EPSILON) break;
    }
    return { result, used: amount - remaining };
  }
  let amount = Math.abs(delta);
  for (let attempt = 0; attempt <= panels.length * 2; attempt++) {
    const grown = allocate(grow, true, amount), shrunk = allocate(shrink, false, amount);
    if (Math.abs(grown.used - shrunk.used) < EPSILON) {
      const result = { ...values };
      for (const index of grow) result[panels[index]!.id] = grown.result[panels[index]!.id]!;
      for (const index of shrink) result[panels[index]!.id] = shrunk.result[panels[index]!.id]!;
      return result;
    }
    const next = Math.min(grown.used, shrunk.used);
    if (next < EPSILON || Math.abs(next - amount) < EPSILON) return values;
    amount = next;
  }
  return values;
}
