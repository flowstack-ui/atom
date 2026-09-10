import { useCallback, useRef, useState } from "react";
import { TableOfContents, useTableOfContents } from "@flowstack-ui/atom/table-of-contents";

const baseRecords = [
  {id:"toc-introduction",depth:2,label:"Introduction"},
  {id:"toc-installation",depth:2,label:"Installation"},
  {id:"toc-options",depth:3,label:"Options"},
  {id:"toc-final",depth:2,label:"Final notes"},
];
export function TableOfContentsHarness() {
  const count = Math.min(1000, Number(new URLSearchParams(window.location.search).get("count")) || 0);
  const records = count ? Array.from({length:count},(_,index)=>({id:`toc-${index}`,depth:2,label:`Section ${index}`})) : baseRecords;
  const native = new URLSearchParams(window.location.search).has("native");
  const cancel = new URLSearchParams(window.location.search).has("cancel");
  const viewport = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [activeId,setActiveId] = useState("");
  const [refuse,setRefuse] = useState(false);
  const [showFinal,setShowFinal] = useState(true);
  const [instant,setInstant] = useState(false);
  const getScrollElement = useCallback(() => viewport.current, []);
  const getRail = useCallback(() => rail.current, []);
  const api = useTableOfContents({ items:records, activeId,
    onActiveIdChange:id => { if(!refuse)setActiveId(id); }, getTargetRoot:getScrollElement,
    getScrollElement:native?undefined:getScrollElement, navigation:native?"native":"managed", scrollBehavior:instant?"instant":"smooth" });
  return <main>
    <h1>Table of Contents behavior</h1>
    <button onClick={()=>setRefuse(!refuse)}>Refuse updates</button>
    <button onClick={()=>setShowFinal(!showFinal)}>Toggle final target</button>
    <button onClick={()=>setInstant(!instant)}>Instant scrolling</button>
    <button onClick={api.refresh}>Refresh targets</button>
    <output data-testid="current">{api.activeId}</output>
    <output data-testid="pending">{api.pendingId}</output>
    <TableOfContents.RootProvider value={api}>
      <div style={{display:"flex",gap:32}}>
        <div ref={rail} style={{height:130,overflow:"auto",width:200}} data-testid="rail">
          <TableOfContents.Nav getScrollElement={getRail}>
            <TableOfContents.Title>On this page</TableOfContents.Title>
            <TableOfContents.List>
              {records.map(item=><TableOfContents.Item key={item.id} value={item.id}>
                <TableOfContents.Link onClick={event=>{if(cancel)event.preventDefault();}} style={{display:"block",padding:12}}>{item.label}</TableOfContents.Link>
              </TableOfContents.Item>)}
            </TableOfContents.List>
            <TableOfContents.Indicator />
          </TableOfContents.Nav>
        </div>
        <div ref={viewport} data-testid="content" style={{height:native?undefined:320,overflow:native?undefined:"auto",width:500,scrollPaddingTop:24}}>
          {records.filter(item=>item.id!=="toc-final"||showFinal).map((item,index)=><section key={item.id}>
            <h2 id={item.id}>{item.label}</h2>
            <p style={{height:count?40:index===3?40:520}}>Document content for {item.label}.</p>
          </section>)}
        </div>
      </div>
    </TableOfContents.RootProvider>
    <button id="toc-outside">Outside</button>
  </main>;
}
