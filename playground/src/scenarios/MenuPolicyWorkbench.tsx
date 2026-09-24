import { ContextMenu, DropdownMenu, Menu, Menubar, NavigationMenu, useContextMenu, useMenu, useMenubar, useNavigationMenu } from "@flowstack-ui/atom";
import type { MenuRootProps } from "@flowstack-ui/atom/menu";
import { useState, type ReactNode, type MouseEvent } from "react";
import { createPortal } from "react-dom";

const panel = { background: "white", color: "black", border: "1px solid", padding: 8, minWidth: 200, maxHeight: 220, overflow: "auto", zIndex: 20 } as const;
const item = { display: "block", padding: 8 } as const;

function Switch({ label, value, change }: { label: string; value: boolean; change(value: boolean): void }) {
  return <label style={{ display: "inline-flex", gap: 6 }}><input type="checkbox" checked={value} onChange={e => change(e.target.checked)} />{label}</label>;
}

function PolicyCheckbox({ note }: { note(message: string): void }) {
  const [checked, setChecked] = useState(false);
  return <Menu.CheckboxItem style={item} value="notify" checked={checked} onCheckedChange={setChecked} closeOnSelect={false} onSelect={() => note("item:notify")}>
    <Menu.ItemIndicator>✓ </Menu.ItemIndicator>Notifications
  </Menu.CheckboxItem>;
}

/** Shared behavior workbench; styling here is only headless test-host presentation. */
export function MenuPolicyWorkbench() {
  const [owner, setOwner] = useState(new URLSearchParams(location.search).get("owner") ?? "Menu");
  const [iframe, setIframe] = useState(false);
  return <main style={{ padding: 24, display: "grid", gap: 20 }}>
    <h1>Menu policy qualification</h1>
    <p>Use these controls alongside each component's anatomy/composition scenario. Manual screen reader, device and actual zoom checks are not implied by automation.</p>
    <label>Owner <select value={owner} onChange={e => setOwner(e.target.value)}>{["Menu", "DropdownMenu", "ContextMenu", "Menubar", "NavigationMenu"].map(value => <option key={value}>{value}</option>)}</select></label>
    {owner === "NavigationMenu" ? <NavigationPolicies /> : <ActionPolicies key={owner} owner={owner} />}
    {owner === "NavigationMenu" && <ShadowNavigation />}
    {!new URLSearchParams(location.search).has("embedded") && <><Switch label="Iframe qualification" value={iframe} change={setIframe} />{iframe && <iframe title="Menu policy iframe" src={`/__tests/menu-policies?owner=${owner}&embedded=1`} style={{ width: "100%", height: 650 }} />}</>}
    <a href="/__tests/menu-scroll">Iframe, arrow and scroll geometry fixture</a>
    <a href="/">Return to anatomy playground</a>
  </main>;
}

function ShadowNavigation() {
  const [enabled, setEnabled] = useState(false);
  const [host, setHost] = useState<ShadowRoot | null>(null);
  return <section><Switch label="ShadowRoot qualification" value={enabled} change={setEnabled} />
    {enabled && <div ref={node => { if (node && !node.shadowRoot) setHost(node.attachShadow({ mode: "open" })); }} />}
    {enabled && host && createPortal(<NavigationPolicies />, host)}
  </section>;
}

function ActionPolicies({ owner }: { owner: string }) {
  const [typeahead, setTypeahead] = useState(true);
  const [loop, setLoop] = useState(true);
  const [retain, setRetain] = useState(false);
  const [lazy, setLazy] = useState(true);
  const [cancel, setCancel] = useState(false);
  const [cancelOutside, setCancelOutside] = useState(false);
  const [cancelEscape, setCancelEscape] = useState(false);
  const [sameWidth, setSameWidth] = useState(false);
  const [fit, setFit] = useState(true);
  const [inline, setInline] = useState(false);
  const [defaultSub, setDefaultSub] = useState(false);
  const [controlled, setControlled] = useState(false);
  const [highlight, setHighlight] = useState<string | null>("beta");
  const [rejectHighlight, setRejectHighlight] = useState(false);
  const [side, setSide] = useState<"bottom-start" | "right-start" | "top-end">("bottom-start");
  const [log, setLog] = useState<string[]>([]);
  const note = (message: string) => setLog(previous => [...previous.slice(-11), message]);
  const options: Omit<MenuRootProps, "children"> = {
    modal: false, typeahead, loop, lazyMount: lazy, unmountOnExit: !retain,
    skipAnimationOnMount: true, defaultHighlightedValue: "beta",
    highlightedValue: controlled ? highlight : undefined,
    onHighlightChange: details => { note(`highlight:${JSON.stringify(details.highlightedValue)}`); if (!rejectHighlight) setHighlight(typeof details.highlightedValue === "string" ? details.highlightedValue : null); },
    positioning: { placement: side, sameWidth, fitViewport: fit },
    onSelect: event => { note(`root:${event.value}`); if (cancel) event.preventDefault(); },
    navigate: details => { details.originalEvent.preventDefault(); note(`navigate:${details.href}`); },
    onExitComplete: () => note("exit complete"),
    onInteractOutside: event => { note("outside"); if (cancelOutside) event.preventDefault(); },
    onEscapeKeyDown: event => { note("escape"); if (cancelEscape) event.preventDefault(); },
  };
  const menu = useMenu(options);
  const context = useContextMenu(options);
  const bar = useMenubar();
  const controller = owner === "ContextMenu" ? context : menu;
  const open = (event: MouseEvent<HTMLButtonElement>) => {
    if (owner === "Menubar") { bar.setValue("file"); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    controller.setAnchorPoint({ x: rect.left, y: rect.bottom });
    controller.setOpen(true);
  };
  const close = () => owner === "Menubar" ? bar.setValue(null) : controller.setOpen(false);
  const rows = <>
    <Menu.Item style={item} value="alpha">Alpha</Menu.Item>
    <Menu.Item style={item} value="beta">Beta</Menu.Item>
    <PolicyCheckbox note={note} />
    <Menu.RadioGroup defaultValue="compact" aria-label="Density">
      <Menu.RadioItem style={item} value="compact" closeOnSelect={false}>Compact<Menu.ItemIndicator> ✓</Menu.ItemIndicator></Menu.RadioItem>
      <Menu.RadioItem style={item} value="comfortable" closeOnSelect={false}>Comfortable<Menu.ItemIndicator> ✓</Menu.ItemIndicator></Menu.RadioItem>
    </Menu.RadioGroup>
    <Menu.Item style={item} value="guide" asChild><a href="#guide">Local guide link</a></Menu.Item>
    <Menu.Sub key={String(defaultSub)} defaultOpen={defaultSub} onOpenChange={value => note(`submenu:${value}`)}>
      <Menu.SubTrigger style={item} value="more">More</Menu.SubTrigger>
      <Menu.SubContent style={panel}><Menu.Arrow /><Menu.Item style={item} value="nested">Nested action</Menu.Item></Menu.SubContent>
    </Menu.Sub>
  </>;
  const contentProps = { style: panel, ariaLabel: `${owner} policies` };
  let demo: ReactNode;
  if (owner === "Menubar") {
    const { modal: _modal, ...barOptions } = options;
    demo = <Menubar.RootProvider value={bar} aria-label="Policy commands">
      <Menubar.Menu value="file" {...barOptions}><Menubar.Trigger>File</Menubar.Trigger><Menubar.Portal disabled={inline}><Menubar.Content {...contentProps}><Menu.Arrow />{rows}</Menubar.Content></Menubar.Portal></Menubar.Menu>
      <Menubar.Menu value="edit"><Menubar.Trigger>Edit</Menubar.Trigger><Menubar.Content style={panel}><Menubar.Item value="undo">Undo</Menubar.Item></Menubar.Content></Menubar.Menu>
      <Menubar.Context>{state => <output data-testid="controller-state">{state.value ?? "closed"}</output>}</Menubar.Context>
    </Menubar.RootProvider>;
  } else if (owner === "ContextMenu") {
    demo = <ContextMenu.RootProvider value={context}>
      <ContextMenu.Trigger value="first" style={{ padding: 24, border: "1px dashed", display: "inline-block" }}>Context target one</ContextMenu.Trigger>
      <ContextMenu.Trigger value="second" style={{ padding: 24, border: "1px dashed", display: "inline-block" }}>Context target two</ContextMenu.Trigger>
      <ContextMenu.Portal disabled={inline}><ContextMenu.Content {...contentProps}><Menu.Arrow />{rows}</ContextMenu.Content></ContextMenu.Portal>
      <Menu.Context>{state => <output data-testid="controller-state">{JSON.stringify({ open: state.open, trigger: state.triggerValue, highlight: state.highlightedValue })}</output>}</Menu.Context>
    </ContextMenu.RootProvider>;
  } else {
    demo = <Menu.RootProvider value={menu}>
      {owner === "DropdownMenu" && <><DropdownMenu.Trigger value="first">First actions <Menu.Context>{state => state.open ? "−" : "+"}</Menu.Context></DropdownMenu.Trigger><DropdownMenu.Trigger value="second">Second actions</DropdownMenu.Trigger></>}
      <Menu.Portal disabled={inline}><Menu.Content {...contentProps}><Menu.Arrow />{rows}</Menu.Content></Menu.Portal>
      <Menu.Context>{state => <output data-testid="controller-state">{JSON.stringify({ open: state.open, trigger: state.triggerValue, highlight: state.highlightedValue })}</output>}</Menu.Context>
    </Menu.RootProvider>;
  }
  return <>
    <fieldset style={{ display: "flex", flexWrap: "wrap", gap: 16 }}><legend>Shared action policies</legend>
      <Switch label="Typeahead" value={typeahead} change={setTypeahead} /><Switch label="Loop" value={loop} change={setLoop} />
      <Switch label="Retain content" value={retain} change={setRetain} /><Switch label="Lazy mount" value={lazy} change={setLazy} />
      <Switch label="Reject selection" value={cancel} change={setCancel} /><Switch label="Reject outside" value={cancelOutside} change={setCancelOutside} /><Switch label="Reject Escape" value={cancelEscape} change={setCancelEscape} />
      <Switch label="Same width" value={sameWidth} change={setSameWidth} /><Switch label="Fit viewport" value={fit} change={setFit} />
      <Switch label="Inline portal" value={inline} change={setInline} /><Switch label="Default open submenu" value={defaultSub} change={setDefaultSub} />
      <Switch label="Controlled highlight" value={controlled} change={setControlled} /><Switch label="Reject highlight" value={rejectHighlight} change={setRejectHighlight} />
      <label>Placement <select value={side} onChange={e => setSide(e.target.value as typeof side)}><option>bottom-start</option><option>right-start</option><option>top-end</option></select></label>
    </fieldset>
    <div style={{ display: "flex", gap: 12 }}><button onClick={open}>Controller open</button><button onClick={close}>Controller close</button><button onClick={() => { controller.setHighlightedValue("beta"); setHighlight("beta"); }}>Highlight Beta</button><button onClick={() => controller.reposition()}>Reposition</button></div>
    <section aria-label="Live policy example" style={{ minHeight: 280 }}>{demo}</section>
    <output aria-label="Event log">{log.join(" | ")}</output><button onClick={() => setLog([])}>Clear log</button>
    <p id="guide">Native/router link destination. Modified clicks remain native.</p>
  </>;
}

function NavigationPolicies() {
  const [hover, setHover] = useState(true), [click, setClick] = useState(true), [leave, setLeave] = useState(true);
  const [viewport, setViewport] = useState(true), [retain, setRetain] = useState(false), [cancel, setCancel] = useState(false), [closeOnClick, setCloseOnClick] = useState(true);
  const [openDelay, setOpenDelay] = useState(100), [closeDelay, setCloseDelay] = useState(300);
  const [log, setLog] = useState("");
  const api = useNavigationMenu({ openDelay, closeDelay, disableHoverTrigger: !hover, disableClickTrigger: !click, disablePointerLeaveClose: !leave, viewport, unmountOnExit: !retain, lazyMount: true });
  return <>
    <fieldset style={{ display: "flex", flexWrap: "wrap", gap: 16 }}><legend>Navigation policies</legend>
      <Switch label="Hover opens" value={hover} change={setHover} /><Switch label="Click opens" value={click} change={setClick} /><Switch label="Leave closes" value={leave} change={setLeave} /><Switch label="Shared viewport" value={viewport} change={setViewport} /><Switch label="Retain content" value={retain} change={setRetain} /><Switch label="Reject selection/outside" value={cancel} change={setCancel} /><Switch label="Close on link" value={closeOnClick} change={setCloseOnClick} />
      <label>Open delay <input type="number" min={0} value={openDelay} onChange={e => setOpenDelay(Number(e.target.value))} /></label><label>Close delay <input type="number" min={0} value={closeDelay} onChange={e => setCloseDelay(Number(e.target.value))} /></label>
    </fieldset>
    <div><button onClick={() => api.setValue("learn")}>Controller open</button><button onClick={() => api.setValue(null)}>Controller close</button><button onClick={api.reposition}>Reposition</button></div>
    <NavigationMenu.RootProvider value={api} aria-label="Policy navigation" style={{ position: "relative", minHeight: 200 }}>
      <NavigationMenu.List><NavigationMenu.Item value="learn"><NavigationMenu.Trigger>Learn <NavigationMenu.ItemIndicator>−</NavigationMenu.ItemIndicator></NavigationMenu.Trigger>
        <NavigationMenu.Content style={panel} onFocusOutside={event => { setLog("focus outside"); if (cancel) event.preventDefault(); }} onEscapeKeyDown={event => { setLog("escape"); if (cancel) event.preventDefault(); }}>
          <NavigationMenu.Link href="#navigation-guide" closeOnClick={closeOnClick} onSelect={event => { setLog("select"); if (cancel) event.preventDefault(); }}>Guide</NavigationMenu.Link>
          <label>Retained draft <input defaultValue="Draft" /></label>
        </NavigationMenu.Content>
      </NavigationMenu.Item></NavigationMenu.List>
      {viewport && <NavigationMenu.Viewport />}
      <NavigationMenu.Context>{state => <output data-testid="controller-state">{state.value ?? "closed"}</output>}</NavigationMenu.Context>
    </NavigationMenu.RootProvider>
    <output aria-label="Event log">{log}</output><p id="navigation-guide">Navigation destination</p>
  </>;
}
