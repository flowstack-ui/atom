import { expect, test } from "@playwright/test";

test("Feed keyboard navigation focuses targets and keeps them visible", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("menuitem", { name: "Data", exact: true }).click();
  await page.getByRole("menuitem", { name: "Feed", exact: true }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Feed" })).toBeVisible();

  const viewport = page.getByLabel("Feed preview");
  const articles = viewport.getByRole("article");
  await expect(articles).toHaveCount(3);
  await viewport.evaluate((element) => {
    element.style.height = "180px";
    element.scrollTop = 0;
  });

  await articles.nth(0).focus();
  await viewport.evaluate((element) => { element.scrollTop = 0; });
  await articles.nth(0).press("PageDown");
  await expect(articles.nth(1)).toBeFocused();
  await articles.nth(1).press("PageDown");
  await expect(articles.nth(2)).toBeFocused();

  const visibility = await articles.nth(2).evaluate((article) => {
    const item = article.getBoundingClientRect();
    const scroller = article.closest("[aria-label='Feed preview']")!.getBoundingClientRect();
    return {
      top: item.top,
      bottom: item.bottom,
      viewportTop: scroller.top,
      viewportBottom: scroller.bottom,
    };
  });
  expect(visibility.top).toBeGreaterThanOrEqual(visibility.viewportTop);
  expect(visibility.bottom).toBeLessThanOrEqual(visibility.viewportBottom);
  expect(await viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

  await articles.nth(2).press("PageUp");
  await expect(articles.nth(1)).toBeFocused();

  await articles.nth(0).focus();
  await articles.nth(0).press(process.platform === "darwin" ? "Meta+End" : "Control+End");
  await expect(page.getByRole("button", { name: "After feed" })).toBeFocused();

  await articles.nth(0).focus();
  await articles.nth(0).press(process.platform === "darwin" ? "Meta+Home" : "Control+Home");
  await expect(page.getByRole("button", { name: "Before feed" })).toBeFocused();
});
