export interface FilterOptions extends Intl.CollatorOptions { locale?: string }
export interface LocaleFilter {
  contains(value: string, query: string): boolean;
  startsWith(value: string, query: string): boolean;
  endsWith(value: string, query: string): boolean;
}

const cache = new Map<string, Intl.Collator>();
const capacity = 100;

/** Locale-aware fixed-substring matching, not fuzzy search or transliteration. */
export function createFilter({ locale = "en-US", ...options }: FilterOptions = {}): LocaleFilter {
  const resolved = { usage: "search" as const, ...options };
  const key = JSON.stringify([locale, Object.entries(resolved).filter(([, value]) => value !== undefined).sort(([a], [b]) => a.localeCompare(b))]);
  let collator = cache.get(key);
  if (collator) cache.delete(key);
  else collator = new Intl.Collator(locale, resolved);
  cache.set(key, collator);
  if (cache.size > capacity) cache.delete(cache.keys().next().value!);
  const compare = collator.compare;
  const normalized = (value: string) => Array.from(value.normalize("NFC"));
  const matches = (value: string[], query: string[], start: number) => compare(value.slice(start, start + query.length).join(""), query.join("")) === 0;
  return {
    startsWith(value, query) {
      const source = normalized(value), needle = normalized(query);
      return needle.length === 0 || (source.length >= needle.length && matches(source, needle, 0));
    },
    endsWith(value, query) {
      const source = normalized(value), needle = normalized(query);
      return needle.length === 0 || (source.length >= needle.length && matches(source, needle, source.length - needle.length));
    },
    contains(value, query) {
      const source = normalized(value), needle = normalized(query);
      if (!needle.length) return true;
      for (let index = 0; index <= source.length - needle.length; index++) if (matches(source, needle, index)) return true;
      return false;
    },
  };
}
