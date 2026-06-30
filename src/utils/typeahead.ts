export interface TypeaheadItem {
  label: string;
  value: string;
}

export function getTypeaheadMatch(
  items: TypeaheadItem[],
  search: string,
  currentValue: string | null,
): string | null {
  if (!search || items.length === 0) return null;

  const normalizedSearch = search.toLocaleLowerCase();
  const currentIndex = currentValue
    ? items.findIndex((item) => item.value === currentValue)
    : -1;
  const currentItem = currentIndex >= 0 ? items[currentIndex] : null;
  const shouldCycleSingleCharacter =
    normalizedSearch.length === 1 &&
    currentItem?.label.toLocaleLowerCase().startsWith(normalizedSearch);
  const orderedItems = shouldCycleSingleCharacter
    ? [
        ...items.slice(currentIndex + 1),
        ...items.slice(0, currentIndex + 1),
      ]
    : items;

  return orderedItems.find((item) =>
    item.label.toLocaleLowerCase().startsWith(normalizedSearch),
  )?.value ?? null;
}
