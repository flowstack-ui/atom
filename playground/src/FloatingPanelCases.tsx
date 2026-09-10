import * as React from "react";
import { createPortal } from "react-dom";
import { FloatingPanel, useFloatingPanel, type FloatingPanelOptions } from "@flowstack-ui/atom/floating-panel";
import { Button } from "@flowstack-ui/atom/button";

/** Intentionally unthemed: these fixtures isolate native props and headless policy. */
function Case({ name, options = {}, container }: { name: string; options?: FloatingPanelOptions; container?: HTMLElement }) {
  const [suppressed, setSuppressed] = React.useState(false);
  const [showTrigger, setShowTrigger] = React.useState(true);
  const [delay, setDelay] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 8, y: 8 });
  const [status, setStatus] = React.useState("");
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const refs = React.useRef<Record<string, HTMLElement | null>>({});
  const panel = useFloatingPanel({
    defaultPosition: { x: 8, y: 8 }, defaultSize: { width: 300, height: 240 },
    allowOverflow: false, closeOnEscape: true, ...options,
    present: suppressed ? false : undefined,
    ...(delay ? { position, onPositionChange: (next: { x: number; y: number }) => {
      clearTimeout(timer.current); timer.current = setTimeout(() => setPosition(next), 150);
    } } : {}),
  });
  const host = (part: string) => ({
    "data-probe": `${name}-${part}`,
    ...(name === "native composition" ? { "data-slot": `probe-${part}` } : {}),
    ref: (node: HTMLElement | null) => { refs.current[part] = node; },
  });
  return <section aria-label={`${name} fixture`}>
    <h2>{name}</h2>
    <Button.Root onClick={() => setSuppressed(value => !value)}>{suppressed ? "Restore" : "Suppress"} {name} presentation</Button.Root>
    <Button.Root onClick={() => setShowTrigger(value => !value)}>Toggle {name} trigger</Button.Root>
    <Button.Root onClick={() => { setPosition(panel.position); setDelay(value => !value); }}>Delay {name} position</Button.Root>
    <Button.Root onClick={() => panel.setPosition({ x: 8, y: 8 })}>Recover {name}</Button.Root>
    <FloatingPanel.RootProvider value={panel}>
      {showTrigger && <FloatingPanel.Trigger {...host("trigger")} asChild><button>Open {name}</button></FloatingPanel.Trigger>}
      <FloatingPanel.Portal container={container}>
        <FloatingPanel.Positioner {...host("positioner")} render={<section />} style={{ zIndex: "calc(10 + var(--atom-overlay-layer, 0))" }}>
          <FloatingPanel.Content {...host("content")} asChild>
            <section style={{ border: "1px solid", background: "Canvas", color: "CanvasText", display: "flex", flexDirection: "column" }}>
              <FloatingPanel.Header {...host("header")} render={<header />} style={{ padding: 8 }}>
                <FloatingPanel.DragTrigger {...host("drag")} asChild><div>
                  <FloatingPanel.Title {...host("title")} asChild><h3>{name} panel</h3></FloatingPanel.Title>
                </div></FloatingPanel.DragTrigger>
                <FloatingPanel.Control {...host("control")} render={<nav aria-label={`${name} controls`} />}>
                  <FloatingPanel.StageTrigger {...host("stage")} stage="minimized" asChild><button aria-label={`Minimize ${name}`}>Minimize</button></FloatingPanel.StageTrigger>
                  <FloatingPanel.StageTrigger stage="maximized">Maximize {name}</FloatingPanel.StageTrigger>
                  <FloatingPanel.StageTrigger stage="default">Restore {name}</FloatingPanel.StageTrigger>
                  <FloatingPanel.CloseTrigger {...host("close")} asChild><button aria-label={`Close ${name}`}>Close</button></FloatingPanel.CloseTrigger>
                </FloatingPanel.Control>
              </FloatingPanel.Header>
              <FloatingPanel.Body {...host("body")} render={<section />} style={{ padding: 8, overflow: "auto", flex: 1 }}>
                <FloatingPanel.Description {...host("description")} asChild><p>Native hosts and refs; geometry remains owned by Atom.</p></FloatingPanel.Description>
                <label>Draft {name}<input aria-label={`Draft ${name}`} /></label>
                <Button.Root onClick={() => panel.minimize()}>Minimize from body {name}</Button.Root>
                <Button.Root onClick={() => setStatus(Object.entries(refs.current).filter(([, node]) => node?.isConnected).map(([part]) => part).sort().join(", "))}>Inspect {name} refs</Button.Root>
                <output aria-label={`${name} refs`}>{status}</output>
                <EffectProbe name={name} />
              </FloatingPanel.Body>
              <FloatingPanel.ResizeTrigger {...host("resize")} axis="se" style={{width:10,height:10}} asChild><div /></FloatingPanel.ResizeTrigger>
              <FloatingPanel.ResizeTriggers axes={["n", "s", "e", "w", "ne", "nw", "sw"]} />
            </section>
          </FloatingPanel.Content>
        </FloatingPanel.Positioner>
      </FloatingPanel.Portal>
    </FloatingPanel.RootProvider>
    <output aria-label={`${name} state`}>{JSON.stringify({ open: panel.open, position: panel.position, size: panel.size, stage: panel.stage })}</output>
  </section>;
}

function EffectProbe({ name }: { name: string }) {
  React.useEffect(() => {
    const target = document.querySelector(`[data-effect-output="${name}"]`);
    if (target) target.textContent += " setup";
    return () => { if (target) target.textContent += " cleanup"; };
  }, [name]);
  return null;
}

function BoundaryCase({ scale = 1 }: { scale?: number }) {
  const [boundary, setBoundary] = React.useState<HTMLDivElement | null>(null);
  return <div style={{ width: 240, height: 300, overflow: "auto" }}>
    <div ref={setBoundary} style={{ position: "relative", width: 220, height: 360, transform: `scale(${scale})`, transformOrigin: "top left" }}>
      {boundary && <Case name={scale === 1 ? "small boundary" : "scaled boundary"} options={{ strategy: "absolute", scale,
        getBoundaryEl: () => boundary, minSize: { width: 280, height: 420 }, gridSize: 8 }} container={boundary} />}
    </div>
  </div>;
}

function EnvironmentCase() {
  const [frame, setFrame] = React.useState<HTMLElement | null>(null);
  const [shadow, setShadow] = React.useState<HTMLElement | null>(null);
  const attachShadow = React.useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const root = node.shadowRoot ?? node.attachShadow({ mode: "open" });
    let target = root.querySelector<HTMLElement>("[data-panel-host]");
    if (!target) { target = node.ownerDocument.createElement("div"); target.dataset.panelHost = ""; root.append(target); }
    setShadow(target);
  }, []);
  return <section><h2>Independent environments</h2>
    <iframe title="Headless panel document" style={{ width: "100%", height: 420 }} srcDoc="<!doctype html><html><head><title>Panel environment</title></head><body></body></html>" onLoad={event => setFrame(event.currentTarget.contentDocument?.body ?? null)} />
    {frame && createPortal(<Case name="frame" container={frame} />, frame)}
    <div ref={attachShadow} />
    {shadow && createPortal(<Case name="shadow" container={shadow} />, shadow)}
  </section>;
}

export function FloatingPanelCases() {
  return <>
    <Case name="native composition" />
    <Case name="retained" options={{ persistRect: true, lazyMount: true, unmountOnExit: false }} />
    <Case name="unmounted" options={{ unmountOnExit: true, immediate: true, skipAnimationOnMount: true }} />
    {"Activity" in React && <><output data-effect-output="activity" aria-label="Activity effects" /><Case name="activity" options={{ hideMode: "activity", unmountOnExit: false }} /></>}
    <Case name="ratio and grid" options={{ gridSize: 8, lockAspectRatio: true }} />
    <Case name="disabled movement" options={{ draggable: false, resizable: false }} />
    <Case name="anchor" options={{ defaultPosition: undefined, getAnchorPosition: () => ({ x: 20, y: 30 }) }} />
    <BoundaryCase /><BoundaryCase scale={0.75} /><EnvironmentCase />
  </>;
}
