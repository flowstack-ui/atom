import { useState } from "react";
import { FloatingPanel, useFloatingPanel } from "@flowstack-ui/atom/floating-panel";
import { Dialog } from "@flowstack-ui/atom/dialog";
import { Popover } from "@flowstack-ui/atom/popover";
import { Button } from "@flowstack-ui/atom/button";
import { FloatingPanelCases } from "./FloatingPanelCases";

export function FloatingPanelHarness() {
  const [reject, setReject] = useState(false), [rtl, setRtl] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const panel = useFloatingPanel({ defaultSize:{width:360,height:260}, defaultPosition:{x:120,y:140}, allowOverflow:false,
    ...(reject ? {position:{x:120,y:140},size:{width:360,height:260}} : {}),
    dir:rtl ? "rtl" : "ltr", closeOnEscape:true, onExitComplete:()=>setEvents(v=>[...v,"exit"]),
    onPositionChangeEnd:p=>setEvents(v=>[...v,`end:${p.x},${p.y}`]) });
  return <main>
    <h1>FloatingPanel behavior</h1>
    <label><input type="checkbox" checked={reject} onChange={e=>setReject(e.target.checked)} />Reject geometry</label>
    <label><input type="checkbox" checked={rtl} onChange={e=>setRtl(e.target.checked)} />RTL</label>
    <FloatingPanel.RootProvider value={panel}>
      <FloatingPanel.Trigger>Open inspector</FloatingPanel.Trigger>
      <FloatingPanel.Portal>
        <FloatingPanel.Positioner style={{zIndex:10}}>
          <FloatingPanel.Content style={{border:"1px solid",background:"white",display:"flex",flexDirection:"column"}}>
            <FloatingPanel.Header style={{display:"flex",padding:8,gap:8}}>
              <FloatingPanel.DragTrigger style={{flex:1}}><FloatingPanel.Title>Inspector</FloatingPanel.Title></FloatingPanel.DragTrigger>
              <FloatingPanel.Control>
                <FloatingPanel.StageTrigger stage="minimized">Minimize</FloatingPanel.StageTrigger>
                <FloatingPanel.StageTrigger stage="maximized">Maximize</FloatingPanel.StageTrigger>
                <FloatingPanel.StageTrigger stage="default">Restore</FloatingPanel.StageTrigger>
                <FloatingPanel.CloseTrigger>Close</FloatingPanel.CloseTrigger>
              </FloatingPanel.Control>
            </FloatingPanel.Header>
            <FloatingPanel.Body style={{padding:12,overflow:"auto",flex:1}}>
              <FloatingPanel.Description>Editable tool</FloatingPanel.Description>
              <label>Note<input aria-label="Note" /></label>
              <Popover.Root><Popover.Trigger>Panel menu</Popover.Trigger><Popover.Portal><Popover.Content style={{background:"white",zIndex:30}}><Popover.Title>Panel options</Popover.Title><Popover.Close>Close menu</Popover.Close></Popover.Content></Popover.Portal></Popover.Root>
              <Dialog.Root><Dialog.Trigger>Confirm change</Dialog.Trigger><Dialog.Portal><Dialog.Overlay style={{position:"fixed",inset:0,background:"#0006",zIndex:40}} /><Dialog.Content style={{position:"fixed",left:200,top:200,zIndex:41,background:"white",padding:20}}><Dialog.Title>Confirmation</Dialog.Title><Dialog.Close>Cancel</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>
              <Button.Root onClick={()=>panel.setPosition({x:10,y:10})}>Move to origin</Button.Root>
            </FloatingPanel.Body>
            <FloatingPanel.ResizeTriggers />
          </FloatingPanel.Content>
        </FloatingPanel.Positioner>
      </FloatingPanel.Portal>
    </FloatingPanel.RootProvider>
    <output aria-label="Geometry">{JSON.stringify({position:panel.position,size:panel.size,stage:panel.stage})}</output>
    <output aria-label="Events">{events.join(";")}</output>
    <FloatingPanelCases />
    <style>{`[data-slot=floating-panel-resize-trigger]{width:10px;height:10px;background:#777;}[data-axis=n],[data-axis=s]{width:auto!important;}[data-axis=e],[data-axis=w]{height:auto!important;}`}</style>
  </main>;
}
