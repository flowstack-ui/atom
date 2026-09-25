import { expect, test } from "@playwright/test";
test.beforeEach(async ({ page }) => { await page.goto("/__tests/number-input"); });
test("localized input, reset, controlled refusal and locale updates", async ({ page }) => {
  const input = page.getByRole("spinbutton", { name: "Amount" });
  await page.getByRole("button", { name: "Change locale" }).click();
  await expect(input).toHaveValue("1.234,5");
  await page.getByRole("spinbutton", { name: "Localized", exact: true }).fill("2.345,6");
  expect(await page.locator('form').evaluate(form => new FormData(form as HTMLFormElement).get("localized"))).toBe("2345.6");
  const controlled = page.getByRole("spinbutton", { name: "Controlled", exact: true });
  await controlled.fill("8"); await controlled.blur(); await expect(controlled).toHaveValue("2");
  await input.fill("9"); await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(input).toHaveValue("1.234,5");
});
test("modifier steps and dynamically mounted wheel input", async ({ page }) => {
  await page.getByRole("button", { name: "Mount input" }).click();
  const input = page.getByRole("spinbutton", { name: "Conditional" });
  await input.focus(); await input.press("Shift+ArrowUp"); await expect(input).toHaveValue("11");
  await input.press("Alt+ArrowDown"); await expect(input).toHaveValue("10.9");
  await input.dispatchEvent("wheel", { deltaY: -10 }); await expect(input).toHaveValue("11.9");
});
test("repeat stops after pointer release", async ({ page }) => {
  const input = page.getByRole("spinbutton", { name: "Amount" });
  await input.fill("0");
  const button = page.getByRole("button", { name: "Increment", exact: true });
  await button.hover(); await page.mouse.down(); await page.waitForTimeout(550); await page.mouse.up();
  const value = await input.inputValue(); expect(Number(value)).toBeGreaterThan(0.1);
  await page.waitForTimeout(150); await expect(input).toHaveValue(value);
});
test("scrubber supplements ordinary keyboard input", async ({ page }) => {
  const scrubber = page.getByText("Drag amount");
  const box = (await scrubber.boundingBox())!;
  const input = page.getByRole("spinbutton", { name: "Amount" });
  await input.fill("0");
  await page.mouse.move(box.x + 4, box.y + box.height / 2); await page.mouse.down();
  await expect(scrubber).toHaveAttribute("data-scrubbing", "");
  await page.mouse.move(box.x + 84, box.y + box.height / 2);
  await expect(scrubber).toHaveAttribute("data-scrubbing", "");
  await page.mouse.up();
  await expect(scrubber).not.toHaveAttribute("data-scrubbing");
  await expect(input).toHaveValue("1.0");
});
