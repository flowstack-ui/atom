import { expect, test, type Page } from "@playwright/test";
import { openScenario } from "./helpers/playground";

async function openReorder(page: Page) {
  await openScenario(page, "Controls", "Reorder");
}

async function order(page: Page) {
  return page.locator("[data-playground-reorder-item]").evaluateAll((items) =>
    items.map((item) => item.getAttribute("data-value")),
  );
}

test("touch delay commits a valid move while early movement and cancellation preserve order", async ({ page }) => {
  await openReorder(page);
  const handle = page.getByRole("button", { name: "Move Verify production", exact: true });
  const deploy = page.locator("[data-playground-reorder-item='deploy']");
  const handleBox = await handle.boundingBox();
  const targetBox = await deploy.boundingBox();
  if (!handleBox || !targetBox) throw new Error("Reorder scenario has no mobile geometry");

  const start = { x: handleBox.x + handleBox.width / 2, y: handleBox.y + handleBox.height / 2 };
  const target = { x: targetBox.x + targetBox.width / 2, y: targetBox.y + targetBox.height * 0.75 };

  await handle.evaluate((element) => {
    element.setPointerCapture = () => {};
    element.hasPointerCapture = () => false;
    element.releasePointerCapture = () => {};
  });

  await handle.dispatchEvent("pointerdown", { pointerId: 51, pointerType: "touch", button: 0, clientX: start.x, clientY: start.y });
  await handle.dispatchEvent("pointermove", { pointerId: 51, pointerType: "touch", button: 0, clientX: start.x + 12, clientY: start.y });
  await handle.dispatchEvent("pointerup", { pointerId: 51, pointerType: "touch", button: 0, clientX: start.x + 12, clientY: start.y });
  await expect.poll(() => order(page)).toEqual(["verify", "approve", "deploy", "notify"]);

  await handle.dispatchEvent("pointerdown", { pointerId: 52, pointerType: "touch", button: 0, clientX: start.x, clientY: start.y });
  await page.waitForTimeout(250);
  await handle.dispatchEvent("pointermove", { pointerId: 52, pointerType: "touch", button: 0, clientX: target.x, clientY: target.y });
  await handle.dispatchEvent("pointerup", { pointerId: 52, pointerType: "touch", button: 0, clientX: target.x, clientY: target.y });
  await expect.poll(() => order(page)).toEqual(["approve", "deploy", "verify", "notify"]);

  const movedBox = await handle.boundingBox();
  if (!movedBox) throw new Error("Moved touch handle has no geometry");
  const moved = { x: movedBox.x + movedBox.width / 2, y: movedBox.y + movedBox.height / 2 };
  await handle.dispatchEvent("pointerdown", { pointerId: 53, pointerType: "touch", button: 0, clientX: moved.x, clientY: moved.y });
  await page.waitForTimeout(250);
  await handle.dispatchEvent("pointermove", { pointerId: 53, pointerType: "touch", button: 0, clientX: moved.x, clientY: moved.y - 80 });
  await handle.dispatchEvent("pointercancel", { pointerId: 53, pointerType: "touch", button: 0, clientX: moved.x, clientY: moved.y - 80 });
  await expect.poll(() => order(page)).toEqual(["approve", "deploy", "verify", "notify"]);
});
