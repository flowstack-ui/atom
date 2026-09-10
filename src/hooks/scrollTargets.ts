/** Shared target discovery for scroll observers. No global document assumption. */
export type ScrollTargetRoot = Document | ShadowRoot | HTMLElement;

export function decodeScrollHash(hash: string): string {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  try { return decodeURIComponent(raw); } catch { return raw; }
}

export function findScrollTarget(root: ScrollTargetRoot, id: string): HTMLElement | null {
  if ("getElementById" in root) return root.getElementById(id) as HTMLElement | null;
  if (root.id === id) return root;
  const element = root.ownerDocument.getElementById(id);
  if (element && root.contains(element)) return element;
  // IDs are data, not selector syntax (and may live in a shadow root).
  return Array.from(root.querySelectorAll<HTMLElement>("[id]")).find((node) => node.id === id) ?? null;
}

export function compareScrollTargets(a: Element, b: Element): number {
  const position = a.compareDocumentPosition(b);
  return position & 4 ? -1 : position & 2 ? 1 : 0;
}

export function observeScrollTargets(
  root: ScrollTargetRoot,
  ids: readonly string[],
  onTargets: (targets: HTMLElement[]) => void,
): () => void {
  const doc = root.nodeType === 9 ? root as Document : root.ownerDocument!;
  const view = doc.defaultView;
  let previous: HTMLElement[] = [];
  let scheduled = false;
  let disposed = false;
  const collect = () => {
    scheduled = false;
    if (disposed) return;
    const next = ids.flatMap((id) => {
      const target = id ? findScrollTarget(root, id) : null;
      return target ? [target] : [];
    }).sort(compareScrollTargets);
    if (next.length !== previous.length || next.some((node, index) => node !== previous[index])) {
      previous = next;
      onTargets(next);
    }
  };
  // Initial empty state also matters when every target is missing.
  onTargets([]);
  collect();
  const observer = view?.MutationObserver ? new view.MutationObserver(() => {
    if (!scheduled) {
      scheduled = true;
      queueMicrotask(collect);
    }
  }) : undefined;
  observer?.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["id"] });
  return () => { disposed = true; observer?.disconnect(); };
}
