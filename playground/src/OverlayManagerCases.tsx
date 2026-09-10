import { createContext, useContext, useState } from "react";
import { createOverlay, type OverlayLifecycleProps } from "@flowstack-ui/atom/overlay-manager";
import { Dialog } from "@flowstack-ui/atom/dialog";
import { Drawer } from "@flowstack-ui/atom/drawer";
import { FloatingPanel } from "@flowstack-ui/atom/floating-panel";
import { Button } from "@flowstack-ui/atom/button";

const LocalContext = createContext("outside");
type Data = { id: string; title: string; kind: "dialog" | "drawer" | "panel" };

export function OverlayManagerCases() {
  const [result, setResult] = useState("pending");
  const [host, setHost] = useState(true);
  const [manager] = useState(() => createOverlay<Data, string>(function Managed({ id, title, kind, ...lifecycle }: Data & OverlayLifecycleProps) {
    const value = useContext(LocalContext);
    const [draft, setDraft] = useState("");
    const body = <><p>Context: {value}</p><label>{id} draft<input aria-label={`${id} draft`} value={draft} onChange={event => setDraft(event.target.value)} /></label>
      <Button.Root onClick={() => void manager.close(id, draft || "accepted")}>Accept {id}</Button.Root></>;
    const style = { background: "Canvas", color: "CanvasText", border: "1px solid", padding: 12, zIndex: "calc(20 + var(--atom-overlay-layer, 0))" };
    if (kind === "panel") return <FloatingPanel.Root {...lifecycle} closeOnEscape><FloatingPanel.Portal><FloatingPanel.Positioner style={{ zIndex: style.zIndex }}><FloatingPanel.Content style={style}><FloatingPanel.Header><FloatingPanel.Title>{title}</FloatingPanel.Title><FloatingPanel.CloseTrigger /></FloatingPanel.Header><FloatingPanel.Body>{body}</FloatingPanel.Body></FloatingPanel.Content></FloatingPanel.Positioner></FloatingPanel.Portal></FloatingPanel.Root>;
    const Primitive = kind === "drawer" ? Drawer : Dialog;
    return <Primitive.Root {...lifecycle}><Primitive.Portal><Primitive.Overlay /><Primitive.Content style={style}>
      <Primitive.Title>{title}</Primitive.Title>{body}<Primitive.Close>Cancel {id}</Primitive.Close>
    </Primitive.Content></Primitive.Portal></Primitive.Root>;
  }));
  const open = (id: string, kind: Data["kind"] = "dialog") => {
    void manager.open(id, { id, title: `Managed ${id}`, kind }).then(value => setResult(`${id}: ${value ?? "cancelled"}`));
  };
  return <section aria-label="Manager lifecycle cases"><h2>Manager lifecycle cases</h2>
    <Button.Root disabled={!host} onClick={() => open("primary")}>Open primary</Button.Root>
    <Button.Root disabled={!host} onClick={() => open("secondary")}>Open secondary</Button.Root>
    <Button.Root disabled={!host} onClick={() => open("drawer", "drawer")}>Open managed drawer</Button.Root>
    <Button.Root disabled={!host} onClick={() => open("panel", "panel")}>Open managed panel</Button.Root>
    <Button.Root onClick={() => { if (manager.has("primary")) manager.update("primary", { title: "Updated primary" }); }}>Update primary</Button.Root>
    <Button.Root onClick={() => { void manager.close("primary").then(() => setResult("primary exited")); }}>Close primary and await exit</Button.Root>
    <Button.Root disabled={!host} onClick={() => { void manager.close("primary"); open("primary"); }}>Reopen primary during exit</Button.Root>
    <Button.Root onClick={() => manager.remove("primary")}>Remove primary</Button.Root>
    <Button.Root onClick={() => manager.removeAll()}>Remove every managed overlay</Button.Root>
    <Button.Root onClick={() => setHost(value => !value)}>{host ? "Dispose" : "Mount"} local manager host</Button.Root>
    <LocalContext.Provider value="inherited local provider">{host && <manager.Viewport />}</LocalContext.Provider>
    <output aria-label="Lifecycle result">{result}</output>
  </section>;
}
