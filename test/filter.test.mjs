import { assert, test } from "./test-utils.mjs";
import { createFilter } from "../dist/index.js";

test("locale filter handles canonical normalization and sensitivity", () => {
  const filter = createFilter({ locale: "en-US", sensitivity: "base" });
  assert.equal(filter.contains("Café", "CAFE"), true);
  assert.equal(filter.startsWith("e\u0301clair", "é"), true);
  assert.equal(filter.endsWith("café", "FE"), true);
  assert.equal(createFilter({ sensitivity: "variant" }).contains("Café", "CAFE"), false);
});
test("locale filter respects Turkish casing, empty queries and errors", () => {
  const filter = createFilter({ locale: "tr", sensitivity: "base" });
  assert.equal(filter.startsWith("İstanbul", "i"), true);
  assert.equal(filter.startsWith("Istanbul", "i"), false);
  for (const method of ["contains", "startsWith", "endsWith"]) assert.equal(filter[method]("", ""), true);
  assert.equal(filter.contains("a", "abcd"), false);
  assert.throws(() => createFilter({ locale: "invalid_locale" }), RangeError);
});
