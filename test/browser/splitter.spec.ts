import { expect, test } from "@playwright/test";
test.beforeEach(async ({ page }) => { await page.goto("/__tests/splitter"); });
test("keyboard sizes, collapse restore, RTL and perpendicular orientation", async ({ page }) => {
  const trigger = page.getByRole("separator", { name: "Files size" });
  await trigger.focus(); await page.keyboard.press("ArrowRight");
  await expect(trigger).toHaveAttribute("aria-valuenow", "41.25");
  await page.keyboard.press("Enter"); await expect(trigger).toHaveAttribute("aria-valuenow", "0");
  await expect(page.getByRole("textbox", { name: "File name" })).toHaveCount(0);
  await page.keyboard.press("Enter"); await expect(trigger).toHaveAttribute("aria-valuenow", "41.25");
  await page.getByRole("button", { name: "Switch direction" }).click(); await trigger.focus(); await page.keyboard.press("ArrowRight");
  await expect(trigger).toHaveAttribute("aria-valuenow", "40");
  await page.getByRole("button", { name: "Switch axis" }).click(); await expect(trigger).toHaveAttribute("aria-orientation", "horizontal");
});
test("pointer drag, Escape rollback and single completion", async ({ page }) => {
  const trigger = page.getByRole("separator", { name: "Files size" });
  const box = await trigger.boundingBox(); if (!box) throw new Error("Missing trigger");
  await page.mouse.move(box.x, box.y + 10); await page.mouse.down(); await page.mouse.move(box.x + 80, box.y + 10, { steps: 5 });
  await expect(trigger).toHaveAttribute("aria-valuenow", "50");
  await page.keyboard.press("Escape"); await page.mouse.up();
  await expect(trigger).toHaveAttribute("aria-valuenow", "40"); await expect(page.getByTestId("ends")).toHaveText("1");
  await expect(page.getByTestId("cancelled")).toHaveText("true");
});
test("controlled rejection and disabled interaction", async ({ page }) => {
  const controlled = page.getByRole("separator", { name: "Rejected size" }); await controlled.focus(); await page.keyboard.press("ArrowRight");
  await expect(controlled).toHaveAttribute("aria-valuenow", "50");
  await page.getByRole("button", { name: "Disable resizing" }).click();
  await expect(page.getByRole("separator", { name: "Files size" })).toHaveAttribute("aria-disabled", "true");
});
test("nested boundary is isolated and collapse recovers focus", async ({ page }) => {
  const outer = page.getByRole("separator", { name: "Files size" });
  await page.getByRole("separator", { name: "Nested preview" }).focus(); await page.keyboard.press("End");
  await expect(outer).toHaveAttribute("aria-valuenow", "40");
  await page.getByRole("textbox", { name: "File name" }).focus();
  await page.getByRole("button", { name: "Collapse files" }).evaluate((el: HTMLButtonElement) => el.click());
  await expect(outer).toBeFocused();
});
test("secondary pointer ignored and disable cancels active resizing", async ({ page }) => {
  const trigger = page.getByRole("separator", { name: "Files size" }); const box = (await trigger.boundingBox())!;
  await trigger.dispatchEvent("pointerdown", { pointerId: 9, isPrimary: false, button: 0 });
  await expect(trigger).toHaveAttribute("data-state", "idle");
  await page.mouse.move(box.x, box.y + 10); await page.mouse.down(); await page.mouse.move(box.x + 80, box.y + 10, { steps: 4 });
  await expect(trigger).toHaveAttribute("aria-valuenow", "50");
  await page.getByRole("button", { name: "Disable resizing" }).evaluate((el: HTMLButtonElement) => el.click());
  await page.mouse.up(); await expect(trigger).toHaveAttribute("aria-valuenow", "40");
  await expect(page.getByTestId("cancelled")).toHaveText("true");
});
