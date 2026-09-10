import {test,expect} from '@playwright/test';
test('managed dialog result, exit and cancellation use the owned lifecycle',async({page})=>{
  await page.goto('/__tests/overlay-manager');
  await page.getByRole('button',{name:'Open managed',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Managed confirmation'})).toBeVisible();
  await page.getByRole('button',{name:'Accept',exact:true}).click();
  await expect(page.getByLabel('Result',{exact:true})).toHaveText('accepted');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:'Open managed',exact:true}).click();await page.keyboard.press('Escape');
  await expect(page.getByLabel('Result',{exact:true})).toHaveText('cancelled');await expect(page.getByRole('dialog')).toHaveCount(0);
});
