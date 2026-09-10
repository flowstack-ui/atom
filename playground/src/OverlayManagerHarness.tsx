import { useMemo, useState } from "react";
import { createOverlay, type OverlayLifecycleProps } from "@flowstack-ui/atom/overlay-manager";
import { Dialog } from "@flowstack-ui/atom/dialog";
import { Button } from "@flowstack-ui/atom/button";
import { OverlayManagerCases } from "./OverlayManagerCases";

export function OverlayManagerHarness() {
  const [result,setResult]=useState("pending");
  const manager=useMemo(()=>createOverlay<{title:string},string>(function Managed({title,...lifecycle}: {title:string}&OverlayLifecycleProps) {
    return <Dialog.Root {...lifecycle}><Dialog.Portal><Dialog.Overlay /><Dialog.Content style={{background:"white",border:"1px solid",padding:20}}>
      <Dialog.Title>{title}</Dialog.Title><Button.Root onClick={()=>void manager.close("confirmation","accepted")}>Accept</Button.Root><Dialog.Close>Cancel</Dialog.Close>
    </Dialog.Content></Dialog.Portal></Dialog.Root>;
  }),[]);
  return <main><h1>Overlay Manager behavior</h1>
    <Button.Root onClick={()=>{void manager.open("confirmation",{title:"Managed confirmation"}).then(value=>setResult(value??"cancelled"));}}>Open managed</Button.Root>
    <Button.Root onClick={()=>manager.update("confirmation",{title:"Updated confirmation"})}>Update</Button.Root>
    <manager.Viewport /><output aria-label="Result">{result}</output><OverlayManagerCases />
  </main>;
}
