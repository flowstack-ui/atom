export interface HighlightOptions {
  /** Text or terms to find. Empty terms are ignored. */
  query: string | readonly string[];
  /** Match without case sensitivity. */
  ignoreCase?: boolean;
  /** Match every non-overlapping occurrence instead of only the first. */
  matchAll?: boolean;
  /** Require Unicode word boundaries around every match. */
  exactMatch?: boolean;
}

export interface HighlightSegment {
  /** Original text for this segment. */
  text: string;
  /** Whether this segment matched one of the supplied queries. */
  match: boolean;
  /** Start offset in the original string. */
  start: number;
  /** Exclusive end offset in the original string. */
  end: number;
  /** The authored query responsible for a matched segment. */
  query?: string;
}

interface MatchCandidate {
  start: number;
  end: number;
  query: string;
  queryIndex: number;
}

const unicodeWordCharacter = /[\p{L}\p{N}_]/u;

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasExactBoundaries(text: string, start: number, end: number): boolean {
  const beforeCharacters = start > 0 ? Array.from(text.slice(0, start)) : [];
  const before = beforeCharacters[beforeCharacters.length - 1] ?? "";
  const after = end < text.length ? Array.from(text.slice(end))[0] ?? "" : "";
  return (!before || !unicodeWordCharacter.test(before))
    && (!after || !unicodeWordCharacter.test(after));
}

/**
 * Split text into stable matched and unmatched segments.
 *
 * Matches are resolved from left to right. When queries overlap at the same
 * offset, the longest query wins, followed by authored query order.
 */
export function findHighlightSegments(
  text: string,
  {
    query,
    ignoreCase = true,
    matchAll = true,
    exactMatch = false,
  }: HighlightOptions,
): HighlightSegment[] {
  if (!text) return [];

  const queries = (Array.isArray(query) ? query : [query])
    .map((value) => String(value))
    .filter((value) => value.length > 0);

  if (queries.length === 0) {
    return [{ text, match: false, start: 0, end: text.length }];
  }

  const candidates: MatchCandidate[] = [];
  for (const [queryIndex, value] of queries.entries()) {
    const expression = new RegExp(escapeRegularExpression(value), ignoreCase ? "giu" : "gu");
    for (const result of text.matchAll(expression)) {
      const start = result.index;
      const end = start + result[0].length;
      if (!exactMatch || hasExactBoundaries(text, start, end)) {
        candidates.push({ start, end, query: value, queryIndex });
      }
    }
  }

  candidates.sort((left, right) => (
    left.start - right.start
    || (right.end - right.start) - (left.end - left.start)
    || left.queryIndex - right.queryIndex
  ));

  const selected: MatchCandidate[] = [];
  let cursor = 0;
  for (const candidate of candidates) {
    if (candidate.start < cursor) continue;
    selected.push(candidate);
    cursor = candidate.end;
    if (!matchAll) break;
  }

  if (selected.length === 0) {
    return [{ text, match: false, start: 0, end: text.length }];
  }

  const segments: HighlightSegment[] = [];
  cursor = 0;
  for (const candidate of selected) {
    if (candidate.start > cursor) {
      segments.push({
        text: text.slice(cursor, candidate.start),
        match: false,
        start: cursor,
        end: candidate.start,
      });
    }
    segments.push({
      text: text.slice(candidate.start, candidate.end),
      match: true,
      start: candidate.start,
      end: candidate.end,
      query: candidate.query,
    });
    cursor = candidate.end;
  }

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      match: false,
      start: cursor,
      end: text.length,
    });
  }

  return segments;
}
