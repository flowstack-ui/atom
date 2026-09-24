import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/__tests/switch");
  await expect(page.getByRole("heading", { name: "Switch browser harness" })).toBeVisible();
});

test("compound label, pointer, keyboard, controlled state, and independent links share one owner", async ({ page }) => {
  const reports = page.getByRole("switch", { name: /Weekly reports/ });
  const label = page.locator("#compound-label");
  await expect(reports).toHaveAttribute("aria-checked", "false");
  await label.click();
  await expect(reports).toHaveAttribute("aria-checked", "true");
  await label.getByRole("link", { name: "Help" }).click();
  await expect(reports).toHaveAttribute("aria-checked", "true");

  await reports.focus();
  await page.keyboard.press("Space");
  await expect(reports).toHaveAttribute("aria-checked", "false");
  await page.keyboard.press("Enter");
  await expect(reports).toHaveAttribute("aria-checked", "true");

  const controlled = page.getByRole("switch", { name: /Controlled setting/ });
  await controlled.click();
  await expect(page.getByTestId("controlled-value")).toHaveText("true");
  await expect(controlled).toHaveAttribute("aria-checked", "true");
});

test("compound form serialization, required validity, repeated names, reset, and disabled submission are native", async ({ page }) => {
  const reports = page.getByRole("switch", { name: /Weekly reports/ });
  await page.getByRole("button", { name: "Submit settings" }).click();
  await expect(reports).toBeFocused();
  await expect(reports).toHaveAttribute("aria-invalid", "true");

  await reports.click();
  await page.getByRole("button", { name: "Submit settings" }).click();
  await expect(page.getByTestId("submission")).toHaveText(
    "reports=weekly,channel=a,channel=b",
  );
  await page.getByRole("button", { name: "Reset settings" }).click();
  await expect(reports).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch", { name: /Repeated A/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

test("unnamed reset, read-only, provider, external form, refs, and custom hosts remain correct", async ({ page }) => {
  const unnamed = page.getByRole("switch", { name: /Unnamed setting/ });
  await unnamed.click();
  await expect(unnamed).toHaveAttribute("aria-checked", "false");
  await page.locator("#settings-form").evaluate((form: HTMLFormElement) => form.reset());
  await expect(unnamed).toHaveAttribute("aria-checked", "true");

  const readOnly = page.getByRole("switch", { name: /Read only setting/ });
  await readOnly.click();
  await expect(readOnly).toHaveAttribute("aria-checked", "true");
  await readOnly.focus();
  await page.keyboard.press("Space");
  await expect(readOnly).toHaveAttribute("aria-checked", "true");

  const provider = page.getByRole("switch", { name: "Provider setting" });
  await expect(provider).toHaveAttribute("aria-checked", "true");
  await provider.click();
  await expect(provider).toHaveAttribute("aria-checked", "false");

  await expect(page.getByTestId("root-ref")).toHaveText("BUTTON");
  await expect(page.getByTestId("control-ref")).toHaveText("SPAN");
  await expect(page.getByTestId("input-ref")).toHaveText("INPUT");
  const custom = page.getByRole("switch", { name: "Custom host" });
  await custom.focus();
  await page.keyboard.press("Space");
  await expect(custom).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: "Submit external" }).click();
  await expect(page.getByTestId("submission")).toHaveText("externalSetting=yes");
});

test("custom hosts activate inside a separate document realm", async ({ page }) => {
  const frame = page.frameLocator('iframe[title="Switch iframe"]');
  const control = frame.getByRole("switch", { name: "Iframe setting" });

  await expect(control).toHaveAttribute("aria-checked", "true");
  await control.focus();
  await page.keyboard.press("Space");
  await expect(control).toHaveAttribute("aria-checked", "false");
  await control.click();
  await expect(control).toHaveAttribute("aria-checked", "true");
});
