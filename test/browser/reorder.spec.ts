import { expect, test, type Page } from "@playwright/test";
import { openScenario } from "./helpers/playground";

async function openReorder(page: Page) {
  await openScenario(page, "Controls", "Reorder");
  return {
    root: page.locator("[data-playground-reorder-root]"),
    items: page.locator("[data-playground-reorder-item]"),
    announcer: page.locator("[data-slot='drag-drop-announcer']"),
  };
}

async function order(page: Page) {
  return page.locator("[data-playground-reorder-item]").evaluateAll((items) =>
    items.map((item) => item.getAttribute("data-value")),
  );
}

test("direct movement controls update controlled order and preserve focus", async ({ page }) => {
  const scenario = await openReorder(page);
  const later = page.getByRole("button", { name: "Move Request approval later" });
  await later.focus();
  await later.press("Enter");
  await expect.poll(() => order(page)).toEqual(["verify", "deploy", "approve", "notify"]);
  await expect(later).toBeFocused();

  await expect(page.getByRole("button", { name: "Move Verify production earlier", exact: true })).toBeDisabled();
  await expect.poll(() => order(page)).toEqual(["verify", "deploy", "approve", "notify"]);
});

test("keyboard movement commits, reverses, and cancels without losing keyed focus", async ({ page }) => {
  const scenario = await openReorder(page);
  const handle = page.getByRole("button", { name: "Move Request approval", exact: true });
  await handle.focus();
  await handle.press("Space");
  await expect(scenario.items.filter({ has: handle })).toHaveAttribute("data-dragging", "");
  await handle.press("ArrowDown");
  await expect(scenario.announcer).toHaveText("Request approval will move to position 3 of 4.");
  await handle.press("ArrowUp");
  await expect(scenario.announcer).toHaveText("Request approval will move to position 2 of 4.");
  await handle.press("Space");
  await expect.poll(() => order(page)).toEqual(["verify", "approve", "deploy", "notify"]);
  await expect(handle).toBeFocused();

  await handle.press("Space");
  await handle.press("End");
  await handle.press("Escape");
  await expect.poll(() => order(page)).toEqual(["verify", "approve", "deploy", "notify"]);
  await expect(scenario.announcer).toHaveText("Request approval movement cancelled.");

  await handle.press("Space");
  await handle.press("End");
  await handle.press("Enter");
  await expect.poll(() => order(page)).toEqual(["verify", "deploy", "notify", "approve"]);
  await expect(handle).toBeFocused();
});

test("mouse drag commits on valid release and cancels outside all targets", async ({ page }) => {
  await openReorder(page);
  const verifyHandle = page.getByRole("button", { name: "Move Verify production", exact: true });
  const deployItem = page.locator("[data-playground-reorder-item='deploy']");
  const handleBox = await verifyHandle.boundingBox();
  const targetBox = await deployItem.boundingBox();
  if (!handleBox || !targetBox) throw new Error("Reorder scenario has no browser geometry");

  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height * 0.75, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => order(page)).toEqual(["approve", "deploy", "verify", "notify"]);

  const movedBox = await verifyHandle.boundingBox();
  if (!movedBox) throw new Error("Moved handle has no browser geometry");
  await page.mouse.move(movedBox.x + movedBox.width / 2, movedBox.y + movedBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(2, 2, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => order(page)).toEqual(["approve", "deploy", "verify", "notify"]);
});

test("horizontal keyboard movement mirrors in RTL and unavailable states block controls", async ({ page }) => {
  const scenario = await openReorder(page);
  await page.getByRole("menuitem", { name: "Layout", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Horizontal", exact: true }).click();
  await expect(scenario.root).toHaveAttribute("data-orientation", "horizontal");
  await page.keyboard.press("Escape");
  await page.getByRole("menuitem", { name: "Layout", exact: true }).click();
  const rtl = page.getByRole("menuitemradio", { name: "Rtl", exact: true });
  await expect(rtl).toBeVisible();
  await rtl.click();
  await expect(page.locator(".playground-reorder-stage")).toHaveAttribute("dir", "rtl");

  const handle = page.getByRole("button", { name: "Move Request approval", exact: true });
  await handle.focus();
  await handle.press("Space");
  await handle.press("ArrowLeft");
  await handle.press("Space");
  await expect.poll(() => order(page)).toEqual(["verify", "deploy", "approve", "notify"]);

  await page.keyboard.press("Escape");
  await page.getByRole("menuitem", { name: "State", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "Read only", exact: true }).click();
  await expect(page.getByRole("button", { name: "Move Verify production", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Move Verify production later" })).toBeDisabled();
});
