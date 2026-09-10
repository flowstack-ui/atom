export type SplitterSize = number | `${number}%` | `${number}px`;
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
export function percent(size: SplitterSize, extent: number, fallback = 0): number {
  const n = typeof size === "number" ? size : Number.parseFloat(size);
  if (!Number.isFinite(n) || n < 0 || (typeof size === "string" && !/^\d+(?:\.\d+)?(?:%|px)$/.test(size))) {
    throw new Error("Splitter sizes must be finite nonnegative percentages or explicit px values.");
  }
  return typeof size === "string" && size.endsWith("px") ? (extent > 0 ? n / extent * 100 : fallback) : n;
}
export function validatePanels(panels: readonly SplitterPanelConfig[]) {
  if (panels.length < 2 || new Set(panels.map(p => p.id)).size !== panels.length || panels.some(p => !p.id)) {
    throw new Error("Splitter requires at least two uniquely named panels.");
  }
  if (panels.every(p => p.resizeBehavior === "preserve-pixels")) throw new Error("Splitter needs a proportional panel to absorb available space.");
}
export function getBounds(panels: readonly SplitterPanelConfig[], extent: number): PanelBounds[] {
  validatePanels(panels);
  return panels.map(p => {
    const min = percent(p.minSize ?? 0, extent);
    const max = p.maxSize === undefined ? Math.max(100, min) : percent(p.maxSize, extent, 100);
    const collapsed = percent(p.collapsedSize ?? 0, extent);
    if (max < min || (p.collapsible && collapsed > min)) throw new Error("Splitter constraint interval is invalid.");
    return { min, max, collapsed, collapsible: !!p.collapsible };
  });
}
export function solve(panels: readonly SplitterPanelConfig[], requested: SplitterSizes, extent: number) {
  const bounds = getBounds(panels, extent);
  const supplied = panels.map(p => Object.prototype.hasOwnProperty.call(requested, p.id) ? percent(requested[p.id]!, extent, 100 / panels.length) : null);
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
export function resizePair(values: Record<string, number>, panels: readonly SplitterPanelConfig[], bounds: PanelBounds[], before: string, after: string, target: number) {
  const { min, max, total, a, b } = pairRange(values, panels, bounds, before, after);
  let next = Math.max(min, Math.min(max, target));
  if (a.collapsible && next < a.min) next = next < (a.min + a.collapsed) / 2 ? a.collapsed : a.min;
  if (b.collapsible && total - next < b.min) next = total - (total - next < (b.min + b.collapsed) / 2 ? b.collapsed : b.min);
  next = Math.max(min, Math.min(max, next));
  // Some collapsed intervals have no feasible point. Preserve the last legal pair.
  if ((next < a.min - EPSILON && Math.abs(next - a.collapsed) > EPSILON) ||
      (total - next < b.min - EPSILON && Math.abs(total - next - b.collapsed) > EPSILON)) return values;
  return { ...values, [before]: next, [after]: total - next };
}
