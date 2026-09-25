import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => { await page.goto("/__tests/floating-panel"); });
test("native part hosts retain refs, drafts and reachable minimized focus", async ({ page }) => {
  await page.getByRole("button", { name: "Open native composition", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "native composition panel", exact: true });
  await expect(panel).toBeFocused();
  await expect(panel).toHaveJSProperty("tagName", "SECTION");
  await expect(panel).toHaveAttribute("data-slot", "probe-content");
  await page.getByRole("button", { name: "Inspect native composition refs", exact: true }).click();
  await expect(page.getByLabel("native composition refs", { exact: true })).toContainText("body, close, content, control, description, drag, header, positioner, resize, stage, title, trigger");
  await page.getByRole("button", { name: "Minimize from body native composition", exact: true }).click();
  await expect(panel).toBeFocused();
  await expect(panel).toHaveAttribute("data-stage", "minimized");
});
test("Activity performs real effect cleanup and restart without losing draft", async ({ page }) => {
  await page.getByRole("button", { name: "Open activity", exact: true }).click();
  await page.getByLabel("Draft activity", { exact: true }).fill("Retained effect draft");
  await page.getByRole("button", { name: "Close activity", exact: true }).click();
  await expect(page.getByLabel("Activity effects", { exact: true })).toContainText("cleanup");
  await page.getByRole("button", { name: "Open activity", exact: true }).click();
  await expect(page.getByLabel("Draft activity", { exact: true })).toHaveValue("Retained effect draft");
  await expect(page.getByLabel("Activity effects", { exact: true })).toContainText("cleanup setup");
});
test("delayed controlled geometry waits for acceptance", async ({ page }) => {
  await page.getByRole("button", { name: "Delay native composition position", exact: true }).click();
  await page.getByRole("button", { name: "Open native composition", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "native composition panel", exact: true });
  await expect(panel).toBeFocused();
  const before = (await panel.boundingBox())!;
  await page.keyboard.press("ArrowRight");
  await expect.poll(async () => (await panel.boundingBox())!.x).toBe(before.x + 1);
});
