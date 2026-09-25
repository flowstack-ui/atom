import { useState } from "react";
import { DownloadTrigger } from "@flowstack-ui/atom/download-trigger";
import { Button } from "@flowstack-ui/atom/button";
export function DownloadTriggerHarness() {
  const [mounted,setMounted]=useState(true),[disabled,setDisabled]=useState(false);
  const [calls,setCalls]=useState(0),[errors,setErrors]=useState(0),[handoffs,setHandoffs]=useState(0);
  return <section><h1>Downloads</h1><output data-testid="calls">{calls}</output><output data-testid="errors">{errors}</output><output data-testid="handoffs">{handoffs}</output>
    <DownloadTrigger.Root data="Hello 🌍" mimeType="text/plain" fileName="note.txt">Download text</DownloadTrigger.Root>
    <form onSubmit={event=>{event.preventDefault();setErrors(n=>n+1);}}>
      <DownloadTrigger.Root render={<button />} data-slot="custom-download" data-prop-check="forwarded" data="keyboard" mimeType="text/plain" fileName="keyboard.txt">Keyboard download</DownloadTrigger.Root>
    </form>
    <DownloadTrigger.Root data={()=>new Blob([new Uint8Array([0,255,42])],{type:"application/octet-stream"})} fileName="bytes.bin">Download binary</DownloadTrigger.Root>
    {mounted&&<DownloadTrigger.Root disabled={disabled} data={()=>{setCalls(n=>n+1);return new Promise<string>(resolve=>setTimeout(()=>resolve("prepared"),300));}}
      fileName="async.txt" mimeType="text/plain" onDownloadInitiated={()=>setHandoffs(n=>n+1)}>Prepare download</DownloadTrigger.Root>}
    <DownloadTrigger.Root data={()=>Promise.reject(new Error("Unavailable"))} fileName="failed.txt" mimeType="text/plain" onDownloadError={()=>setErrors(n=>n+1)}>Fail download</DownloadTrigger.Root>
    <DownloadTrigger.Root data="no" fileName="no.txt" mimeType="text/plain" onClick={e=>e.preventDefault()}>Prevent download</DownloadTrigger.Root>
    <Button.Root onClick={()=>setMounted(false)}>Unmount producer</Button.Root><Button.Root onClick={()=>setDisabled(true)}>Disable producer</Button.Root>
  </section>;
}
