import {
  assert,
  readFile,
  test,
  React,
  renderToStaticMarkup,
  packageRoot,
} from "../test-utils.mjs";

import {
  List,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationItems,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
  getPaginationRange,
} from "../../dist/index.js";

test("Pagination compound parts render nav, current page, controls, and ellipsis", () => {
  const items = getPaginationRange({
    totalPages: 20,
    currentPage: 10,
    siblingCount: 1,
    boundaryCount: 1,
  });

  const html = renderToStaticMarkup(
    React.createElement(
      Pagination.Root,
      {
        totalPages: 20,
        defaultPage: 10,
        "aria-label": "Pages",
      },
      React.createElement(
        Pagination.List,
        null,
        React.createElement(Pagination.Previous, null, "Prev"),
        items.map((item, index) =>
          item === "ellipsis"
            ? React.createElement(Pagination.Ellipsis, { key: `ellipsis-${index}` })
            : React.createElement(Pagination.Item, { key: item, page: item }),
        ),
        React.createElement(Pagination.Next, null, "Next"),
      ),
    ),
  );

  assert.match(html, /^<nav/);
  assert.match(html, /aria-label="Pages"/);
  assert.match(html, /data-slot="pagination-root"/);
  assert.match(html, /<ol data-slot="pagination-list"/);
  assert.match(html, /<li data-slot="pagination-list-item"><button/);
  assert.match(html, /data-slot="pagination-previous"/);
  assert.match(html, /data-direction="previous"/);
  assert.match(html, /aria-current="page"[^>]+data-state="active"[^>]+data-page="10"/);
  assert.match(html, /aria-label="Go to page 9"/);
  assert.match(html, /aria-hidden="true" data-slot="pagination-ellipsis"/);
  assert.match(html, /data-slot="pagination-next"/);
  assert.equal(Pagination.Root, PaginationRoot);
  assert.equal(Pagination.List, PaginationList);
  assert.equal(Pagination.Previous, PaginationPrevious);
  assert.equal(Pagination.Items, PaginationItems);
  assert.equal(Pagination.Item, PaginationItem);
  assert.equal(Pagination.Ellipsis, PaginationEllipsis);
  assert.equal(Pagination.Next, PaginationNext);
});

test("Pagination.Items renders the context range with shared part props", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Pagination.Root,
      { totalPages: 20, defaultPage: 10 },
      React.createElement(
        Pagination.List,
        null,
        React.createElement(Pagination.Items, {
          itemProps: { className: "page-control" },
          ellipsisProps: { className: "page-gap" },
        }),
      ),
    ),
  );

  assert.match(html, /data-page="1"/);
  assert.match(html, /data-page="9"/);
  assert.match(html, /data-page="10"/);
  assert.match(html, /data-page="11"/);
  assert.match(html, /data-page="20"/);
  assert.equal((html.match(/class="page-control"/g) ?? []).length, 5);
  assert.equal((html.match(/class="page-gap"/g) ?? []).length, 2);
  assert.equal((html.match(/data-slot="pagination-list-item"/g) ?? []).length, 7);
});

test("Pagination link mode renders native destinations and preserves current-page semantics", () => {
  const hrefDetails = [];
  const html = renderToStaticMarkup(
    React.createElement(
      Pagination.Root,
      {
        totalPages: 3,
        page: 2,
        getPageHref: (details) => {
          hrefDetails.push(details);
          return `/incidents?page=${details.page}`;
        },
      },
      React.createElement(
        Pagination.List,
        null,
        React.createElement(Pagination.Previous, null, "Previous"),
        React.createElement(Pagination.Items),
        React.createElement(Pagination.Next, { target: "_blank", rel: "noreferrer" }, "Next"),
      ),
    ),
  );

  assert.match(html, /<a href="\/incidents\?page=1"[^>]+data-slot="pagination-previous"/);
  assert.match(html, /<a href="\/incidents\?page=2"[^>]+aria-current="page"/);
  assert.match(html, /<a href="\/incidents\?page=3" target="_blank" rel="noreferrer"/);
  assert.doesNotMatch(html, /<button/);
  assert.ok(hrefDetails.some((details) => details.page === 2 && details.isCurrent));
});

test("Pagination link mode removes destinations from disabled boundary controls", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Pagination.Root,
      {
        totalPages: 3,
        page: 1,
        getPageHref: ({ page }) => `/incidents?page=${page}`,
      },
      React.createElement(
        Pagination.List,
        null,
        React.createElement(
          Pagination.Previous,
          { asChild: true },
          React.createElement("a", { href: "/must-not-survive" }, "Previous"),
        ),
        React.createElement(Pagination.Items),
        React.createElement(Pagination.Next, null, "Next"),
      ),
    ),
  );

  assert.match(
    html,
    /<a role="link" tabindex="-1" aria-disabled="true"[^>]+data-slot="pagination-previous"/,
  );
  assert.doesNotMatch(html, /must-not-survive/);
  assert.match(html, /href="\/incidents\?page=2"[^>]+data-slot="pagination-next"/);
});

test("Pagination Root localizes generated labels and direct labels take precedence", () => {
  const labelDetails = [];
  const html = renderToStaticMarkup(
    React.createElement(
      Pagination.Root,
      {
        totalPages: 3,
        defaultPage: 2,
        previousAriaLabel: "Página anterior",
        nextAriaLabel: "Página siguiente",
        getItemAriaLabel: (details) => {
          labelDetails.push(details);
          return details.isCurrent
            ? `Página ${details.page}, página actual`
            : `Ir a la página ${details.page}`;
        },
      },
      React.createElement(
        Pagination.List,
        null,
        React.createElement(Pagination.Previous),
        React.createElement(Pagination.Items),
        React.createElement(Pagination.Next, { "aria-label": "Avanzar" }),
      ),
    ),
  );

  assert.match(html, /aria-label="Página anterior"/);
  assert.match(html, /aria-label="Ir a la página 1"/);
  assert.match(html, /aria-label="Página 2, página actual"/);
  assert.match(html, /aria-label="Ir a la página 3"/);
  assert.match(html, /aria-label="Avanzar"/);
  assert.doesNotMatch(html, /Página siguiente/);
  assert.deepEqual(labelDetails, [
    { page: 1, currentPage: 2, totalPages: 3, isCurrent: false },
    { page: 2, currentPage: 2, totalPages: 3, isCurrent: true },
    { page: 3, currentPage: 2, totalPages: 3, isCurrent: false },
  ]);
});

test("Pagination parts own list item structure while asChild and render target the inner element", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Pagination.Root,
      { totalPages: 3, defaultPage: 2 },
      React.createElement(
        Pagination.List,
        null,
        React.createElement(
          Pagination.Previous,
          { asChild: true },
          React.createElement("button", { className: "custom-previous" }, "Prev"),
        ),
        React.createElement(Pagination.Item, {
          page: 2,
          render: (props) => React.createElement("button", { ...props, className: "custom-page" }),
        }),
        React.createElement(
          Pagination.Ellipsis,
          { asChild: true },
          React.createElement("span", { className: "custom-ellipsis" }, "..."),
        ),
      ),
    ),
  );

  assert.match(
    html,
    /<li data-slot="pagination-list-item"><button class="custom-previous" type="button" aria-label="Previous page" data-slot="pagination-previous"/,
  );
  assert.match(
    html,
    /<li data-slot="pagination-list-item"><button[^>]+aria-current="page"[^>]+data-slot="pagination-item"[^>]+class="custom-page"/,
  );
  assert.match(
    html,
    /<li data-slot="pagination-list-item"><span class="custom-ellipsis" aria-hidden="true" data-slot="pagination-ellipsis"/,
  );
});

test("Pagination helpers clamp ranges and include boundary ellipsis", () => {
  assert.deepEqual(
    getPaginationRange({
      totalPages: 20,
      currentPage: 10,
      siblingCount: 1,
      boundaryCount: 1,
    }),
    [1, "ellipsis", 9, 10, 11, "ellipsis", 20],
  );
  assert.deepEqual(getPaginationRange({ totalPages: 4, currentPage: 99 }), [1, 2, 3, 4]);
});

test("Pagination helpers keep a stable range count for the configured density", () => {
  const defaultRanges = Array.from({ length: 10 }, (_, index) =>
    getPaginationRange({ totalPages: 10, currentPage: index + 1 }),
  );

  assert.deepEqual(defaultRanges, [
    [1, 2, 3, 4, 5, "ellipsis", 10],
    [1, 2, 3, 4, 5, "ellipsis", 10],
    [1, 2, 3, 4, 5, "ellipsis", 10],
    [1, 2, 3, 4, 5, "ellipsis", 10],
    [1, "ellipsis", 4, 5, 6, "ellipsis", 10],
    [1, "ellipsis", 5, 6, 7, "ellipsis", 10],
    [1, "ellipsis", 6, 7, 8, 9, 10],
    [1, "ellipsis", 6, 7, 8, 9, 10],
    [1, "ellipsis", 6, 7, 8, 9, 10],
    [1, "ellipsis", 6, 7, 8, 9, 10],
  ]);
  assert.deepEqual(
    defaultRanges.map((range) => range.length),
    Array.from({ length: 10 }, () => 7),
  );

  assert.deepEqual(
    getPaginationRange({
      totalPages: 20,
      currentPage: 10,
      siblingCount: 0,
      boundaryCount: 1,
    }),
    [1, "ellipsis", 10, "ellipsis", 20],
  );
  assert.deepEqual(
    getPaginationRange({
      totalPages: 20,
      currentPage: 10,
      siblingCount: 1,
      boundaryCount: 2,
    }),
    [1, 2, "ellipsis", 9, 10, 11, "ellipsis", 19, 20],
  );
});

test("PaginationItem supports localized aria labels", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Pagination.Root,
      {
        totalPages: 10,
        defaultPage: 5,
        getItemAriaLabel: () => "Root generated label",
      },
      React.createElement(Pagination.Item, {
        page: 5,
        "aria-label": "Pagina 5",
      }),
    ),
  );

  assert.match(html, /aria-label="Pagina 5"/);
  assert.doesNotMatch(html, /Page 5, current page/);
  assert.doesNotMatch(html, /Root generated label/);
  assert.match(html, /aria-current="page"/);
});

test("Pagination primitive barrel does not create a client boundary", async () => {
  const controlSource = await readFile(
    new URL("src/primitives/pagination/PaginationControl.tsx", packageRoot),
    "utf8",
  );
  const indexSource = await readFile(
    new URL("src/primitives/pagination/index.ts", packageRoot),
    "utf8",
  );

  assert.doesNotMatch(controlSource, /\[ctx\]/);
  assert.doesNotMatch(indexSource, /^"use client";/);
});
