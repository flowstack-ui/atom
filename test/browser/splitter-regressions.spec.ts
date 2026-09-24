import { expect, test } from "@playwright/test";
test.beforeEach(async ({ page }) => { await page.goto("/__tests/splitter"); });
test("a store measures a provider mounted later and follows root font changes", async ({ page }) => {
  await page.getByRole("button", { name: "Toggle delayed provider" }).click();
  const handle = page.getByRole("separator", { name: "Delayed boundary" });
  const rem = await page.evaluate(() => Number.parseFloat(getComputedStyle(document.documentElement).fontSize));
  await expect(handle).toHaveAttribute("aria-valuenow", String(rem * 10 / 8));
  await page.evaluate(() => { document.documentElement.style.fontSize = "20px"; });
  await expect(handle).toHaveAttribute("aria-valuenow", "25");
  await page.getByRole("button", { name: "Toggle delayed provider" }).click();
  await page.getByRole("button", { name: "Toggle delayed provider" }).click();
  await expect(handle).toHaveAttribute("aria-valuenow", "25");
});
test("trailing collapse restores focus and arrows expand from zero", async ({ page }) => {
  const handle = page.getByRole("separator", { name: "Regression boundary" });
  await page.getByRole("textbox", { name: "Trailing input" }).focus();
  await page.getByRole("button", { name: "Collapse trailing" }).evaluate((node: HTMLButtonElement) => node.click());
  await expect(handle).toBeFocused();
  await expect(handle).toHaveAttribute("aria-valuenow", "100");
  await page.keyboard.press("ArrowLeft");
  await expect(handle).toHaveAttribute("aria-valuenow", "80");
});
test("single panel retains focus without an invalid boundary", async ({ page }) => {
  await page.getByRole("textbox", { name: "Trailing input" }).focus();
  await page.getByRole("button", { name: "Toggle panel collection" }).evaluate((node: HTMLButtonElement) => node.click());
  await expect(page.getByTestId("regression-split")).toBeFocused();
  await expect(page.getByRole("separator", { name: "Regression boundary" })).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle panel collection" }).click();
  await expect(page.getByRole("separator", { name: "Regression boundary" })).toHaveAttribute("aria-valuenow", "50");
});
test("pointer focus does not scroll a partially visible tall boundary", async ({ page }) => {
  const handle = page.getByRole("separator", { name: "Tall boundary" });
  await handle.evaluate(node => window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 100));
  const y = await page.evaluate(() => window.scrollY);
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x, 200); await page.mouse.down(); await page.mouse.up();
  expect(await page.evaluate(() => window.scrollY)).toBe(y);
});
test("intersection registry resizes both axes and rolls back together", async ({ page }) => {
  const vertical = page.getByRole("separator", { name: "Shared vertical boundary" });
  const horizontal = page.getByRole("separator", { name: "Shared horizontal boundary" });
  await vertical.scrollIntoViewIfNeeded();
  const x = (await vertical.boundingBox())!.x, y = (await horizontal.boundingBox())!.y;
  await page.mouse.move(x + 1, y); await page.mouse.down(); await page.mouse.move(x + 41, y + 30, { steps: 4 });
  await expect(vertical).not.toHaveAttribute("aria-valuenow", "50");
  await expect(horizontal).not.toHaveAttribute("aria-valuenow", "50");
  await page.keyboard.press("Escape"); await page.mouse.up();
  await expect(vertical).toHaveAttribute("aria-valuenow", "50");
  await expect(horizontal).toHaveAttribute("aria-valuenow", "50");
});
