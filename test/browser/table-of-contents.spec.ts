import {test, expect} from "@playwright/test";
test.beforeEach(async({page})=>{await page.goto("/__tests/table-of-contents");});
test("click settles on final section without moving document",async({page})=>{
  const before=await page.evaluate(()=>window.scrollY);
  await page.getByRole("link",{name:"Final notes"}).click();
  await expect(page.getByTestId("current")).toHaveText("toc-final");
  await expect(page.getByTestId("pending")).toHaveText("");
  await expect(page.locator('[aria-current="location"]')).toHaveCount(1);
  expect(await page.getByTestId("content").evaluate(el=>el.scrollTop)).toBeGreaterThan(1000);
  expect(await page.evaluate(()=>window.scrollY)).toBe(before);
  await expect(page.locator("#toc-final")).toBeFocused();
});
test("passive scroll and missing target recovery",async({page})=>{
  await page.getByTestId("content").evaluate(el=>{el.scrollTop=700;});
  await expect(page.getByTestId("current")).toHaveText("toc-installation");
  await page.getByRole("button",{name:"Toggle final target"}).click();
  await expect(page.locator("#toc-final")).toHaveCount(0);
  await page.getByRole("button",{name:"Toggle final target"}).click();
  await page.getByRole("link",{name:"Final notes"}).click();
  await expect(page.getByTestId("current")).toHaveText("toc-final");
});
test("controlled refusal keeps accepted current state",async({page})=>{
  await expect(page.getByTestId("current")).toHaveText("toc-introduction");
  await page.getByRole("button",{name:"Refuse updates"}).click();
  await page.getByRole("link",{name:"Final notes"}).click();
  await expect(page.getByTestId("pending")).toHaveText("");
  await expect(page.getByTestId("current")).toHaveText("toc-introduction");
});
test("repeated navigation and reduced motion",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.getByRole("link",{name:"Final notes"}).click();
  await page.getByRole("link",{name:"Installation",exact:true}).click();
  await expect(page.getByTestId("current")).toHaveText("toc-installation");
  await expect(page.getByTestId("pending")).toHaveText("");
  await expect(page.locator("#toc-installation")).toBeFocused();
});
test("native anchors preserve href, fragment history and browser scrolling",async({page})=>{
  await page.goto("/__tests/table-of-contents?native");
  const link=page.getByRole("link",{name:"Final notes"});
  await expect(link).toHaveAttribute("href","#toc-final");
  await link.click();
  await expect(page).toHaveURL(/#toc-final$/);
  await expect(page.getByTestId("current")).toHaveText("toc-final");
  expect(await page.evaluate(()=>window.scrollY)).toBeGreaterThan(500);
  await page.goBack();
  await expect(page).not.toHaveURL(/#toc-final$/);
});
test("managed history restores targets and preserves application state",async({page})=>{
  await page.evaluate(()=>history.replaceState({application:"preserved"},""));
  await page.getByRole("button",{name:"Instant scrolling"}).click();
  await page.getByRole("link",{name:"Installation",exact:true}).click();
  await expect(page.getByTestId("pending")).toHaveText("");
  await page.getByRole("link",{name:"Final notes"}).click();
  await expect(page.getByTestId("pending")).toHaveText("");
  expect(await page.evaluate(()=>history.state)).toEqual({application:"preserved"});
  await page.goBack();
  await expect(page.getByTestId("current")).toHaveText("toc-installation");
});
test("nested rail scrollend cannot prematurely settle destination intent",async({page})=>{
  await page.getByRole("link",{name:"Final notes"}).click();
  await page.getByTestId("rail").dispatchEvent("scrollend",{bubbles:true});
  await expect(page.getByTestId("current")).toHaveText("toc-final");
  await expect(page.getByTestId("pending")).toHaveText("");
});
test("application cancellation and modified clicks preserve native ownership",async({page})=>{
  await page.goto("/__tests/table-of-contents?cancel");
  await expect(page.getByTestId("current")).toHaveText("toc-introduction");
  await page.getByRole("link",{name:"Final notes"}).click();
  await expect(page.getByTestId("current")).toHaveText("toc-introduction");
  expect(await page.getByTestId("content").evaluate(el=>el.scrollTop)).toBe(0);
  await page.goto("/__tests/table-of-contents");
  await expect(page.getByTestId("current")).toHaveText("toc-introduction");
  const prevented=await page.getByRole("link",{name:"Final notes"}).evaluate(link=>{
    let cancelled=false;
    document.addEventListener("click",event=>{cancelled=event.defaultPrevented;event.preventDefault();},{once:true});
    link.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,ctrlKey:true}));
    return cancelled;
  });
  expect(prevented).toBe(false);
  await expect(page.getByTestId("pending")).toHaveText("");
});
test("observer-free fallback supports scrolling and explicit rediscovery",async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(window,"MutationObserver",{value:undefined,configurable:true});
    Object.defineProperty(window,"ResizeObserver",{value:undefined,configurable:true});
  });
  await page.reload();
  await page.getByRole("button",{name:"Instant scrolling"}).click();
  await page.getByRole("link",{name:"Final notes"}).click();
  await expect(page.getByTestId("current")).toHaveText("toc-final");
  await page.getByRole("button",{name:"Toggle final target"}).click();
  await page.getByRole("button",{name:"Refresh targets"}).click();
  await expect(page.getByTestId("current")).toHaveText("toc-options");
});
test("large outlines stay event-driven at 20, 200 and 1000 targets",async({page},testInfo)=>{
  const measurements=[];
  for(const count of [20,200,1000]){
    await page.goto(`/__tests/table-of-contents?count=${count}`);
    await expect(page.getByTestId("current")).toHaveText("toc-0");
    const result=await page.evaluate(async()=>{
      const root=document.querySelector<HTMLElement>('[data-testid="content"]')!;
      let reads=0;
      const original=Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect=function(){if(this.id.startsWith("toc-"))reads++;return original.call(this);};
      const samples=[];
      for(let step=1;step<=10;step++){
        const start=performance.now();
        root.scrollTop=(root.scrollHeight-root.clientHeight)*step/10;
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        samples.push(performance.now()-start);
      }
      await new Promise(resolve=>setTimeout(resolve,300));
      const stableReads=reads;
      await new Promise(resolve=>setTimeout(resolve,100));
      const idleReads=reads-stableReads;
      Element.prototype.getBoundingClientRect=original;
      return {samples,reads,idleReads};
    });
    await expect(page.getByTestId("current")).toHaveText(`toc-${count-1}`);
    expect(result.idleReads).toBe(0);
    expect(result.reads).toBeLessThanOrEqual(count*20);
    measurements.push({count,...result});
  }
  await testInfo.attach("large-outline-measurements",{body:JSON.stringify(measurements,null,2),contentType:"application/json"});
});
test("same-origin iframe navigation stays inside its owning document",async({page})=>{
  await page.evaluate(()=>{
    const frame=document.createElement("iframe");
    frame.title="Embedded document";
    frame.src="/__tests/table-of-contents?native";
    frame.style.cssText="position:fixed;inset:0;width:900px;height:600px;background:white";
    document.body.append(frame);
  });
  const frame=page.frameLocator('iframe[title="Embedded document"]');
  await frame.getByRole("link",{name:"Final notes"}).click();
  await expect(frame.getByTestId("current")).toHaveText("toc-final");
  expect(await page.evaluate(()=>window.scrollY)).toBe(0);
  expect(await frame.locator("body").evaluate(el=>el.ownerDocument.defaultView!.scrollY)).toBeGreaterThan(500);
});
test("targets inside a shadow tree are scoped and rediscovered",async({page})=>{
  await page.getByTestId("content").evaluate(content=>{
    const host=document.createElement("div");
    content.parentElement!.append(host);
    host.attachShadow({mode:"open"}).append(content);
  });
  expect(await page.evaluate(()=>document.getElementById("toc-final"))).toBeNull();
  await page.getByRole("button",{name:"Refresh targets"}).click();
  await page.getByRole("button",{name:"Instant scrolling"}).click();
  await page.getByRole("link",{name:"Final notes"}).click();
  await expect(page.getByTestId("current")).toHaveText("toc-final");
  expect(await page.getByTestId("content").evaluate(el=>el.scrollTop)).toBeGreaterThan(1000);
});
