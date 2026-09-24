import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => { await page.goto("/__tests/select-family"); });

test("multiple controller records submit before mounting and retained content stays inert", async ({page}) => {
  await page.getByRole("button", {name:"Submit records", exact:true}).click();
  await expect(page.getByLabel("Submitted record", {exact:true})).toHaveText("a,b");
  const trigger=page.getByRole("button",{name:"Records",exact:true});
  await trigger.click();
  const popup=page.locator("#multi-record-popup");
  await expect(popup).toBeVisible();
  await popup.press("Escape");
  await expect(popup).toBeHidden();
  await expect(popup).toHaveAttribute("inert", "");
  await expect(trigger).toBeFocused();
});

test("both popups portal and restore focus inside their iframe document", async ({ page }) => {
  await page.evaluate(() => {
    const frame = document.createElement("iframe");
    frame.title = "Selection frame";
    frame.src = "/__tests/select-family";
    frame.style.cssText = "width:900px;height:700px;display:block";
    document.body.prepend(frame);
  });
  const frame = page.frameLocator('iframe[title="Selection frame"]');
  for (const [role, name] of [["combobox", "Single choice"], ["button", "Multiple choices"]] as const) {
    const trigger = frame.getByRole(role, { name });
    await trigger.click();
    const popup = frame.getByRole("listbox");
    await expect(popup).toBeVisible();
    expect(await popup.evaluate(node => node.parentElement === node.ownerDocument.body)).toBe(true);
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await popup.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(popup).toHaveCount(0);
  }
});

test("controller records submit before opening and retained content exits inertly", async ({ page }) => {
  await page.getByRole("button", { name: "Submit record", exact: true }).click();
  await expect(page.getByLabel("Submitted record")).toHaveText("b");
  const trigger = page.getByRole("combobox", { name: "Record", exact: true });
  await expect(trigger).toHaveText("Beta");
  await trigger.click();
  await expect(page.locator("#record-popup")).toBeVisible();
  await trigger.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: "Close record" }).click();
  await expect(page.locator("#record-popup")).toBeHidden();
  await expect(page.locator("#record-popup")).toHaveAttribute("inert", "");
  await expect(page.getByLabel("Record exits")).toHaveText("1");
  await trigger.click();
  await expect(page.locator("#record-popup")).toBeVisible();
  await expect(page.locator("#record-popup")).not.toHaveAttribute("inert", "");
});

test("single deselection and close policy preserve an open popup", async ({ page }) => {
  const trigger = page.getByRole("combobox", { name: "Single choice" });
  await trigger.click();
  await page.getByRole("option", { name: "Option 0", exact: true }).click();
  await expect(page.getByLabel("Single value")).toHaveText("empty");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("option", { name: "Option 2", exact: true }).click();
  await expect(page.getByLabel("Single value")).toHaveText("2");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("single positioning and keyboard reveal never scroll the page", async ({ page }) => {
  const trigger = page.getByRole("combobox", { name: "Single choice" });
  await trigger.focus();
  const before = await page.evaluate(() => scrollY);
  await trigger.press("ArrowDown");
  const list = page.getByRole("listbox");
  await expect(list).toHaveAttribute("data-positioned", "");
  await expect(list).toHaveCSS("position", "fixed");
  await expect(list).toHaveAttribute("data-align", "end");
  await trigger.press("End");
  await expect.poll(() => list.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await trigger.press("ArrowDown");
  await trigger.press("Enter");
  await expect(page.getByLabel("Single value")).toHaveText("39");
  expect(await page.evaluate(() => scrollY)).toBe(before);
});

test("clear single is a sibling button and returns focus", async ({ page }) => {
  const clear = page.getByRole("button", { name: "Clear single" });
  expect(await clear.evaluate(el => el.parentElement?.closest("button"))).toBeNull();
  await clear.click();
  await expect(page.getByLabel("Single value")).toHaveText("empty");
  await expect(page.getByRole("combobox", { name: "Single choice" })).toBeFocused();
});

test("multiple can close after selecting and clear all", async ({ page }) => {
  await page.getByRole("button", { name: "Multiple choices" }).click();
  await page.getByRole("option", { name: "Option 2", exact: true }).click();
  await expect(page.getByLabel("Multiple values")).toHaveText("0,2");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear multiple" }).click();
  await expect(page.getByLabel("Multiple values")).toHaveText("empty");
});
