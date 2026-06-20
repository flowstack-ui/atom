import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "./test-utils.mjs";

import {
  getNextCollectionItem,
  sortCollectionItemsByDocumentOrder,
  useControllableState,
  useDisclosure,
  getVirtualItems,
  getVirtualOffsetForIndex,
  getVirtualScrollOffsetForIndex,
  getVirtualTotalSize,
  useVirtualizer,
} from "../dist/index.js";

test("useDisclosure renders initial and default state", () => {
  function DisclosureProbe({ initialOpen }) {
    const disclosure = useDisclosure(initialOpen);
    return React.createElement("output", null, disclosure.isOpen ? "open" : "closed");
  }

  assert.equal(
    renderToStaticMarkup(React.createElement(DisclosureProbe, null)),
    "<output>closed</output>",
  );
  assert.equal(
    renderToStaticMarkup(React.createElement(DisclosureProbe, { initialOpen: true })),
    "<output>open</output>",
  );
});

test("useControllableState respects default and controlled values", () => {
  function StateProbe(props) {
    const [value] = useControllableState({
      value: props.value,
      defaultValue: "default",
      onChange: props.onChange,
    });
    return React.createElement("output", null, value);
  }

  assert.equal(
    renderToStaticMarkup(React.createElement(StateProbe, null)),
    "<output>default</output>",
  );
  assert.equal(
    renderToStaticMarkup(React.createElement(StateProbe, { value: "controlled" })),
    "<output>controlled</output>",
  );
});

test("collection helpers navigate enabled items with optional looping", () => {
  const items = [
    { value: "one", element: {}, disabled: false, data: {} },
    { value: "two", element: {}, disabled: true, data: {} },
    { value: "three", element: {}, disabled: false, data: {} },
  ];

  assert.equal(getNextCollectionItem(items, "one", "next")?.value, "three");
  assert.equal(getNextCollectionItem(items, "three", "next")?.value, "one");
  assert.equal(
    getNextCollectionItem(items, "three", "next", { loop: false }),
    null,
  );
  assert.equal(
    getNextCollectionItem(items, "one", "next", { includeDisabled: true })?.value,
    "two",
  );
  assert.equal(getNextCollectionItem(items, "one", "previous")?.value, "three");
  assert.equal(
    getNextCollectionItem(items, "missing", "next", { loop: false }),
    null,
  );
  assert.equal(
    getNextCollectionItem(items, "two", "next", { loop: false })?.value,
    "three",
  );
  assert.equal(
    getNextCollectionItem(items, "two", "previous", { loop: false })?.value,
    "one",
  );
});

test("collection helpers sort disconnected elements after connected elements", () => {
  const connectedFirst = {
    order: 1,
    isConnected: true,
    compareDocumentPosition(other) {
      return this.order < other.order ? 4 : 2;
    },
  };
  const connectedSecond = {
    order: 2,
    isConnected: true,
    compareDocumentPosition(other) {
      return this.order < other.order ? 4 : 2;
    },
  };
  const disconnected = {
    isConnected: false,
    compareDocumentPosition: () => 0,
  };
  const items = [
    { value: "disconnected", element: disconnected, disabled: false, data: {} },
    { value: "first", element: connectedFirst, disabled: false, data: {} },
    { value: "second", element: connectedSecond, disabled: false, data: {} },
  ];

  assert.deepEqual(
    sortCollectionItemsByDocumentOrder(items).map((item) => item.value),
    ["first", "second", "disconnected"],
  );
});

test("collection hook source keeps registry version and DOM-order APIs stable", async () => {
  const source = await readFile(new URL("src/collection.ts", packageRoot), "utf8");

  assert.match(source, /^"use client";/);
  assert.match(source, /const itemsRef = useRef\(new Map/);
  assert.match(source, /sortedCacheRef/);
  assert.match(source, /const \[version, setVersion\] = useState\(0\)/);
  assert.match(source, /compareDocumentPosition\(second\)/);
  assert.match(source, /registerItem/);
  assert.match(source, /unregisterItem/);
  assert.match(source, /updateItem/);
  assert.match(source, /clearItems/);
});

test("virtualizer helpers calculate visible items with overscan and variable sizes", () => {
  const sizes = [20, 30, 40, 50, 60, 70];
  const getItemSize = (index) => sizes[index];

  assert.equal(getVirtualTotalSize(sizes.length, getItemSize), 270);
  assert.equal(getVirtualOffsetForIndex(sizes.length, 3, getItemSize), 90);

  const items = getVirtualItems({
    count: sizes.length,
    scrollOffset: 55,
    viewportSize: 80,
    overscan: 1,
    getItemSize,
    getItemKey: (index) => `row-${index}`,
  });

  assert.deepEqual(items.map((item) => item.index), [1, 2, 3, 4]);
  assert.deepEqual(
    items.map(({ key, start, end, size }) => ({ key, start, end, size })),
    [
      { key: "row-1", start: 20, end: 50, size: 30 },
      { key: "row-2", start: 50, end: 90, size: 40 },
      { key: "row-3", start: 90, end: 140, size: 50 },
      { key: "row-4", start: 140, end: 200, size: 60 },
    ],
  );
});

test("virtualizer includes leading zero-size items without overscan", () => {
  const sizes = [0, 0, 32, 32];
  const items = getVirtualItems({
    count: sizes.length,
    scrollOffset: 0,
    viewportSize: 32,
    overscan: 0,
    getItemSize: (index) => sizes[index],
  });

  assert.deepEqual(items.map((item) => item.index), [0, 1, 2]);
});

test("virtualizer scroll-to-index honors alignment and auto visibility", () => {
  const getItemSize = () => 20;

  assert.equal(
    getVirtualScrollOffsetForIndex({
      count: 100,
      index: 10,
      align: "start",
      scrollOffset: 0,
      viewportSize: 100,
      getItemSize,
    }),
    200,
  );
  assert.equal(
    getVirtualScrollOffsetForIndex({
      count: 100,
      index: 10,
      align: "center",
      scrollOffset: 0,
      viewportSize: 100,
      getItemSize,
    }),
    160,
  );
  assert.equal(
    getVirtualScrollOffsetForIndex({
      count: 100,
      index: 10,
      align: "end",
      scrollOffset: 0,
      viewportSize: 100,
      getItemSize,
    }),
    120,
  );
  assert.equal(
    getVirtualScrollOffsetForIndex({
      count: 100,
      index: 3,
      align: "auto",
      scrollOffset: 40,
      viewportSize: 100,
      getItemSize,
    }),
    40,
  );
});

test("virtualizer hook source keeps DOM measurement headless", async () => {
  const source = await readFile(new URL("src/virtualizer.ts", packageRoot), "utf8");

  assert.match(source, /^"use client";/);
  assert.match(source, /export function useVirtualizer/);
  assert.match(source, /ResizeObserver/);
  assert.match(source, /resizeObserverRef/);
  assert.match(source, /getItemRef/);
  assert.match(source, /isConnected/);
  assert.match(source, /measureElement: \(index: number, element: HTMLElement \| null\)/);
  assert.doesNotMatch(source, /className/);
});

test("scroll spy hook source tracks document sections without styling concerns", async () => {
  const source = await readFile(new URL("src/hooks/useScrollSpy.ts", packageRoot), "utf8");
  const hooksEntrypoint = await readFile(new URL("src/hooks.ts", packageRoot), "utf8");

  assert.match(source, /^"use client";/);
  assert.match(source, /export function useScrollSpy/);
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /hashchange/);
  assert.match(source, /decodeURIComponent/);
  assert.match(source, /visibleEntries/);
  assert.match(source, /thresholdKey/);
  assert.match(source, /MutationObserver/);
  assert.match(source, /compareDocumentOrder/);
  assert.match(source, /isConnected/);
  assert.doesNotMatch(source, /Math\.abs/);
  assert.match(hooksEntrypoint, /useScrollSpy/);
  assert.doesNotMatch(source, /className/);
});
