import { useState } from "react";
import { QrCode, useQrCode } from "@flowstack-ui/atom/qr-code";
export function QrCodeHarness() {
  const [value,setValue]=useState("https://example.com/share");
  const [refuse,setRefuse]=useState(false),[invalid,setInvalid]=useState(false);
  const [logo,setLogo]=useState(false),[unsupported,setUnsupported]=useState(false);
  const [error,setError]=useState("");
  const api=useQrCode({value,onValueChange:({value})=>{if(!refuse)setValue(value);},encoding:{ecc:"H",maxVersion:invalid?0:40}});
  return <main>
    <input aria-label="QR value" value={value} onChange={e=>setValue(e.target.value)}/>
    <button onClick={()=>setRefuse(!refuse)}>Refuse changes</button>
    <button onClick={()=>api.setValue("requested")}>Request value</button>
    <button onClick={()=>setInvalid(!invalid)}>Toggle invalid</button>
    <button onClick={()=>setLogo(!logo)}>Toggle logo</button>
    <button onClick={()=>setUnsupported(!unsupported)}>Toggle unsupported</button>
    <output data-testid="accepted">{api.value}</output><output data-testid="error">{error}</output>
    <QrCode.RootProvider value={api} style={{width:240}}>
      <QrCode.Frame aria-label="Shared document" style={{width:240,height:240}}/>
      {(logo||unsupported)&&<QrCode.Overlay style={{width:36,height:36,padding:4,background:"white"}}>
        {unsupported?"logo":<svg viewBox="0 0 20 20" width="36" height="36"><rect width="20" height="20" fill="#351370"/><circle cx="10" cy="10" r="5" fill="white"/></svg>}
      </QrCode.Overlay>}
      {["svg+xml","png","jpeg","webp"].map(format=><QrCode.DownloadTrigger key={format} mimeType={`image/${format}` as "image/png"}
        fileName={`share.${format==="svg+xml"?"svg":format}`} onDownloadError={({error})=>setError(String(error))}>Download {format}</QrCode.DownloadTrigger>)}
      <QrCode.DownloadTrigger mimeType="image/svg+xml" fileName="bare.svg" includeOverlay={false}>Download without logo</QrCode.DownloadTrigger>
    </QrCode.RootProvider>
  </main>;
}
