import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import jsQR from "jsqr";
test.beforeEach(async({page})=>{await page.goto("/__tests/qr-code");});
test("controlled refusal, error suppression and recovery",async({page})=>{
  const pattern=page.locator('[data-slot="qr-code-pattern"]');
  const initial=await pattern.getAttribute("d");
  await page.getByRole("button",{name:"Refuse changes"}).click();
  await page.getByRole("button",{name:"Request value"}).click();
  await expect(pattern).toHaveAttribute("d",initial!);
  await page.getByRole("button",{name:"Toggle invalid"}).click();
  await expect(pattern).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Download png",exact:true})).toBeDisabled();
  await page.getByRole("button",{name:"Toggle invalid"}).click();
  await expect(pattern).toHaveAttribute("d",initial!);
});
test("download exports explicit paint and embeds supported logo",async({page})=>{
  for(const logo of [false,true]){
    if(logo)await page.getByRole("button",{name:"Toggle logo"}).click();
    const pending=page.waitForEvent("download");
    await page.getByRole("button",{name:"Download svg+xml",exact:true}).click();
    const d=await pending;expect(d.suggestedFilename()).toBe("share.svg");
    const text=await readFile((await d.path())!,"utf8");
    expect(text).toContain('<svg');expect(text).not.toContain("currentColor");expect(text).not.toContain("undefined");
    if(logo)expect(text).toContain('data:image/png;base64,');
  }
});
test("unsupported overlay errors rather than silently losing logo",async({page})=>{
  await page.getByRole("button",{name:"Toggle unsupported"}).click();
  await page.getByRole("button",{name:"Download png",exact:true}).click();
  await expect(page.getByTestId("error")).toContainText("exportSrc");
  const d=page.waitForEvent("download");await page.getByRole("button",{name:"Download without logo"}).click();await d;
});
test("raster export has actual requested MIME signatures",async({page})=>{
  for(const format of ["png","jpeg"]){
    const d=page.waitForEvent("download");await page.getByRole("button",{name:`Download ${format}`,exact:true}).click();
    const bytes=await readFile((await(await d).path())!);
    expect(bytes.subarray(0,2).toString("hex")).toBe(format==="png"?"8950":"ffd8");
  }
});
test("saved PNG independently decodes exact Unicode with and without a logo", async ({page}) => {
  const value = "Olá 日本語 🌎";
  await page.getByRole("textbox", {name:"QR value"}).fill(value);
  for (const logo of [false, true]) {
    if (logo) await page.getByRole("button",{name:"Toggle logo"}).click();
    const pending = page.waitForEvent("download");
    await page.getByRole("button",{name:"Download png",exact:true}).click();
    const bytes = await readFile((await (await pending).path())!);
    const decoded = await page.evaluate(async src => {
      const image = new Image(); image.src = src; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width=image.width; canvas.height=image.height;
      const ctx=canvas.getContext("2d")!; ctx.drawImage(image,0,0);
      return {width:image.width,height:image.height,data:Array.from(ctx.getImageData(0,0,image.width,image.height).data)};
    }, `data:image/png;base64,${bytes.toString("base64")}`);
    expect(jsQR(new Uint8ClampedArray(decoded.data),decoded.width,decoded.height)?.data).toBe(value);
  }
});
