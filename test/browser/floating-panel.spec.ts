import {test,expect} from "@playwright/test";
test.beforeEach(async({page})=>{await page.goto('/__tests/floating-panel');await page.getByRole('button',{name:'Open inspector'}).click();});
test('keyboard geometry, stages and focus return',async({page})=>{
  const panel=page.getByRole('dialog',{name:'Inspector'});
  await expect(panel).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('Geometry',{exact:true})).toContainText('"x":121');
  await page.getByRole('button',{name:'maximize panel',exact:true}).click();
  await expect(panel).toHaveAttribute('data-stage','maximized');
  await page.getByRole('button',{name:'minimize panel',exact:true}).click();
  await expect(page.getByLabel('Note')).toBeHidden();
  await page.getByRole('button',{name:'restore panel',exact:true}).click();
  await expect(page.getByLabel('Geometry',{exact:true})).toContainText('"width":360');
  await page.getByRole('button',{name:'Close panel',exact:true}).click();
  await expect(panel).toHaveCount(0);await expect(page.getByRole('button',{name:'Open inspector'})).toBeFocused();
});
test('pointer resize and cancelled drag',async({page})=>{
  const handle=page.getByRole('dialog',{name:'Inspector',exact:true}).locator('[data-axis=se]');const box=await handle.boundingBox();
  await page.mouse.move(box!.x+5,box!.y+5);await page.mouse.down();await page.mouse.move(box!.x+45,box!.y+35);await page.mouse.up();
  await expect(page.getByLabel('Geometry',{exact:true})).toContainText('"width":400');
  const drag=await page.getByRole('dialog',{name:'Inspector',exact:true}).locator('[data-slot=floating-panel-drag-trigger]').boundingBox();
  await page.mouse.move(drag!.x+5,drag!.y+5);await page.mouse.down();await page.mouse.move(drag!.x+45,drag!.y+25);await page.keyboard.press('Escape');await page.mouse.up();
  await expect(page.getByLabel('Geometry',{exact:true})).toContainText('"x":120');
  await expect(page.getByRole('dialog',{name:'Inspector'})).toBeVisible();
});
test('nested popover and dialog dismiss before the panel',async({page})=>{
  await page.getByRole('button',{name:'Panel menu',exact:true}).click();await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog',{name:'Panel options'})).toHaveCount(0);
  await expect(page.getByRole('dialog',{name:'Inspector'})).toBeVisible();
  await page.getByRole('button',{name:'Confirm change'}).click();await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog',{name:'Confirmation',exact:true})).toHaveCount(0);
  await expect(page.getByRole('dialog',{name:'Inspector'})).toBeVisible();
});
