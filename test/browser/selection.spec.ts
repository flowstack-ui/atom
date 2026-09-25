import { test, expect } from "@playwright/test";
test("checkbox selection and Shift range execute once", async ({ page }) => {
  await page.goto('/__tests/record-selection');
  await page.getByRole('checkbox',{name:'Select alpha',exact:true}).click();
  await expect(page.getByLabel('Selected',{exact:true})).toHaveText('alpha');
  await page.getByRole('checkbox',{name:'Select gamma',exact:true}).click({modifiers:['Shift']});
  await expect(page.getByLabel('Selected',{exact:true})).toHaveText('alpha,beta,gamma');
  await page.getByRole('checkbox',{name:'Select delta',exact:true}).focus();
  await page.keyboard.press('Shift+Space');
  await expect(page.getByLabel('Selected',{exact:true})).toHaveText('alpha,beta,gamma,delta');
  await expect(page.getByRole('checkbox',{name:'Select delta',exact:true})).toBeFocused();
  await page.keyboard.press('Shift+Space');
  await expect(page.getByLabel('Selected',{exact:true})).toHaveText('none');
  await expect(page.getByLabel('Opened',{exact:true})).toHaveText('0');
});
