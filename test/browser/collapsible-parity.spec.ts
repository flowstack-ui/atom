import { expect, test } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/__tests/collapsible");
});
test("partial preview has real geometry and cannot receive focus until opened", async ({
  page,
}) => {
  const content = page.locator("#partial-panel");
  await expect(content).toHaveAttribute("inert", "");
  expect((await content.boundingBox())!.height).toBe(48);
  const trigger = page.getByRole("button", { name: "Preview toggle" });
  await trigger.focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "After preview" }),
  ).toBeFocused();
  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(content).not.toHaveAttribute("inert");
  expect((await content.boundingBox())!.height).toBeGreaterThan(48);
  await trigger.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});
test("exit ignores nested animation events and interrupted transitions", async ({
  page,
}) => {
  const content = page.locator("#outer-panel");
  // Keep the interruption inside one browser turn. Driver/actionability round
  // trips can outlast this fixture's 200ms exit on a slower engine or CI host.
  const interrupted = await page.evaluate(async () => {
    const button = (label: string) => Array.from(document.querySelectorAll("button"))
      .find(element => element.textContent === label)!;
    button("External close").click();
    await Promise.resolve(); // Flush the discrete React update before observing it.
    const panel = document.querySelector<HTMLElement>("#outer-panel")!;
    const closing = panel.dataset.state;
    panel.querySelector("p")!.dispatchEvent(new AnimationEvent("animationend", { bubbles: true }));
    const nestedIgnored = panel.isConnected && document.querySelector('[aria-label="Exits"]')!.textContent === "0";
    button("External open").click();
    return { closing, nestedIgnored };
  });
  expect(interrupted).toEqual({ closing: "closed", nestedIgnored: true });
  await page.waitForTimeout(300);
  await expect(page.getByLabel("Exits")).toHaveText("0");
  await expect(content).toBeVisible();
  // Safari does not focus native buttons on pointer click; exercise actual
  // focused-content restoration rather than assuming pointer focus policy.
  await page.getByRole("button", { name: "Close inside" }).focus();
  await page.getByRole("button", { name: "Close inside" }).press("Enter");
  await expect(
    page.getByRole("button", { name: "Outer toggle" }),
  ).toBeFocused();
  await expect(content).toHaveCount(0);
  await expect(page.getByLabel("Exits")).toHaveText("1");
});
test("nested indicators and custom-host disabled state remain independent", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Inner toggle" }).click();
  await expect(
    page.locator('[data-slot="collapsible-indicator"]').first(),
  ).toHaveAttribute("data-state", "open");
  await expect(
    page.locator('[data-slot="collapsible-indicator"]').nth(1),
  ).toHaveAttribute("data-state", "closed");
  const disabled = page.getByRole("button", { name: "Disabled composed" });
  await disabled.press("Enter");
  await expect(disabled).toHaveAttribute("aria-expanded", "false");
});
