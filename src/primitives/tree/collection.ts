/** Data-only hierarchy adapter. It does not fetch, persist or render records. */
export interface TreeNode {
  value: string;
  label: string;
  disabled?: boolean;
  children?: readonly TreeNode[];
  /** A branch may have children which are not loaded yet. */
  expandable?: boolean;
}

export interface TreeNodeEntry<T extends TreeNode = TreeNode> {
  node: T;
  value: string;
  parentValue: string | null;
  level: number;
  posInSet: number;
  setSize: number;
}

export interface TreeCollection<T extends TreeNode = TreeNode> {
  nodes: readonly T[];
  entries: readonly TreeNodeEntry<T>[];
  find(value: string): TreeNodeEntry<T> | undefined;
  visible(expandedValues: readonly string[]): TreeNodeEntry<T>[];
  filter(predicate: (node: T) => boolean): TreeCollection<T>;
  remove(value: string): TreeCollection<T>;
  update(value: string, update: (node: T) => T): TreeCollection<T>;
}

export function createTreeCollection<T extends TreeNode>(nodes: readonly T[]): TreeCollection<T> {
  const entries: TreeNodeEntry<T>[] = [];
  const byValue = new Map<string, TreeNodeEntry<T>>();
  const visit = (children: readonly T[], parentValue: string | null, level: number) => {
    children.forEach((node, index) => {
      if (!node.value || byValue.has(node.value)) throw new Error(`Tree requires nonempty unique values: ${node.value}`);
      const entry = { node, value: node.value, parentValue, level, posInSet: index + 1, setSize: children.length };
      byValue.set(node.value, entry);
      entries.push(entry);
      visit((node.children ?? []) as readonly T[], node.value, level + 1);
    });
  };
  visit(nodes, null, 1);
  const mapNodes = (items: readonly T[], transform: (node: T) => T | null): T[] => items.flatMap(node => {
    const mapped = transform(node);
    if (!mapped) return [];
    return [{ ...mapped, ...(mapped.children && { children: mapNodes(mapped.children as readonly T[], transform) }) } as T];
  });
  return {
    nodes,
    entries,
    find: value => byValue.get(value),
    visible(expandedValues) {
      const expanded = new Set(expandedValues);
      const visible = new Set<string>();
      return entries.filter(entry => {
        const shown = entry.parentValue === null || (visible.has(entry.parentValue) && expanded.has(entry.parentValue));
        if (shown) visible.add(entry.value);
        return shown;
      });
    },
    filter(predicate) {
      const keep = (items: readonly T[]): T[] => items.flatMap(node => {
        const children = keep((node.children ?? []) as readonly T[]);
        return predicate(node) || children.length > 0
          ? [{ ...node, ...(node.children && { children }) } as T]
          : [];
      });
      return createTreeCollection(keep(nodes));
    },
    remove: value => createTreeCollection(mapNodes(nodes, node => node.value === value ? null : node)),
    update: (value, transform) => createTreeCollection(mapNodes(nodes, node => node.value === value ? transform(node) : node)),
  };
}
