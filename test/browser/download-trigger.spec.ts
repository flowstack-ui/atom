import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
test.beforeEach(async({page})=>{await page.goto("/__tests/download-trigger");});
test("text and binary downloads preserve names and exact bytes",async({page})=>{
  for(const [label,name,bytes]of [["Download text","note.txt",Buffer.from("Hello 🌍")],["Download binary","bytes.bin",Buffer.from([0,255,42])]] as const){
    const pending=page.waitForEvent("download");await page.getByRole("button",{name:label,exact:true}).click();const download=await pending;
    expect(download.suggestedFilename()).toBe(name);expect(await readFile((await download.path())!)).toEqual(bytes);
  }
});
test("pending blocks reentry, retains focus and hands off once",async({page})=>{
  const b=page.getByRole("button",{name:"Prepare download"});const pending=page.waitForEvent("download");
  await b.focus();await page.keyboard.press("Enter");await expect(b).toHaveAttribute("aria-busy","true");
  await page.keyboard.press("Enter");await expect(b).toBeFocused();await pending;
  await expect(page.getByTestId("calls")).toHaveText("1");await expect(page.getByTestId("handoffs")).toHaveText("1");
});
test("errors permit retry and prevented actions do not download",async({page})=>{
  const downloads:unknown[]=[];page.on("download",d=>downloads.push(d));
  await page.getByRole("button",{name:"Fail download"}).click();await expect(page.getByTestId("errors")).toHaveText("1");
  await page.getByRole("button",{name:"Fail download"}).click();await expect(page.getByTestId("errors")).toHaveText("2");
  await page.getByRole("button",{name:"Prevent download"}).click();expect(downloads).toHaveLength(0);
});
for(const action of ["Unmount producer","Disable producer"]){test(`${action} cancels a delayed handoff`,async({page})=>{
  const downloads:unknown[]=[];page.on("download",d=>downloads.push(d));
  await page.getByRole("button",{name:"Prepare download"}).click();await page.getByRole("button",{name:action}).click();
  await page.waitForTimeout(400);expect(downloads).toHaveLength(0);await expect(page.getByTestId("handoffs")).toHaveText("0");
});}
test("render host forwards props and keyboard activation never submits its form",async({page})=>{
 await page.goto("/__tests/download-trigger");
 const button=page.getByRole("button",{name:"Keyboard download"});
 await expect(button).toHaveAttribute("data-slot","custom-download");
 await expect(button).toHaveAttribute("data-prop-check","forwarded");
 await button.focus();const download=page.waitForEvent("download");await page.keyboard.press("Enter");
 expect((await download).suggestedFilename()).toBe("keyboard.txt");
 await expect(page.getByTestId("errors")).toHaveText("0");await expect(button).toBeFocused();
});
