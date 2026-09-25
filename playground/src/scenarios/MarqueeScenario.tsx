import { useCallback, useState, type ReactNode } from "react";
import { Button } from "@flowstack-ui/atom/button";
import { Direction } from "@flowstack-ui/atom/direction";
import { Marquee, useMarquee, type MarqueeSide } from "@flowstack-ui/atom/marquee";
import { ControlToolbar, ToolbarGroup, MenuCheckboxControl, MenuRadioControl, PropsToolbarGroup, partProps, type WorkbenchLogEntry } from "../WorkbenchPrimitives";
import type { AnatomySection } from "../AnatomyPanel";
import "./marquee-workbench.css";

type Mode = "default" | "asChild" | "render";
type DirectionMode = "default" | "provider-rtl" | "local-ltr" | "local-rtl";
const words = ["Northstar", "Acme", "Orbit", "Layers"];
export function useMarqueeScenario() {
  const [side, setSide] = useState<MarqueeSide>("start");
  const [reverse, setReverse] = useState(false), [autoFill, setAutoFill] = useState(false), [hover, setHover] = useState(false);
  const [speed, setSpeed] = useState(50), [delay, setDelay] = useState(0), [loopCount, setLoopCount] = useState(0), [spacing, setSpacing] = useState("1rem");
  const [direction, setDirection] = useState<DirectionMode>("default"), [mode, setMode] = useState<Mode>("default");
  const [controlled, setControlled] = useState(false), [paused, setPaused] = useState(false);
  const [links, setLinks] = useState(false), [missing, setMissing] = useState(false), [unsafe, setUnsafe] = useState(false);
  const [propCheck, setPropCheck] = useState(false), [custom, setCustom] = useState(false);
  const [log, setLog] = useState<WorkbenchLogEntry[]>([]);
  const addLog = useCallback((text: string) => setLog(previous => [...previous.slice(-49), { id: Date.now() + previous.length, time: new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}), text }]), []);
  return { state: { side, reverse, autoFill, hover, speed, delay, loopCount, spacing, direction, mode, controlled, paused, links, missing, unsafe, propCheck, custom, log }, actions: { setSide, setReverse, setAutoFill, setHover, setSpeed, setDelay, setLoopCount, setSpacing, setDirection, setMode, setControlled, setPaused, setLinks, setMissing, setUnsafe, setPropCheck, setCustom, addLog, clearLog: () => setLog([]) } };
}
type Scenario = ReturnType<typeof useMarqueeScenario>;
export function MarqueeScenarioToolbar({ scenario: {state:s,actions:a} }: {scenario:Scenario}) {
  const choices = (values: readonly string[]) => values.map(value => ({label:value,value}));
  return <ControlToolbar label="Marquee controls">
    <ToolbarGroup title="State" value="state">
      <MenuCheckboxControl label="Controlled" value="controlled" checked={s.controlled} onChange={a.setControlled} />
      {s.controlled && <MenuCheckboxControl label="Paused" value="paused" checked={s.paused} onChange={a.setPaused} />}
      <MenuCheckboxControl label="Reverse" value="reverse" checked={s.reverse} onChange={a.setReverse} />
      <MenuCheckboxControl label="Auto fill" value="fill" checked={s.autoFill} onChange={a.setAutoFill} />
      <MenuCheckboxControl label="Pause on interaction" value="hover" checked={s.hover} onChange={a.setHover} />
      <MenuRadioControl label="Side" value={s.side} options={choices(["start","end","top","bottom"])} onChange={value => a.setSide(value as MarqueeSide)} />
      <MenuRadioControl label="Speed" value={String(s.speed)} options={choices(["20","50","100"])} onChange={value => a.setSpeed(Number(value))} />
      <MenuRadioControl label="Delay" value={String(s.delay)} options={choices(["0","1"])} onChange={value => a.setDelay(Number(value))} />
      <MenuRadioControl label="Loops" value={String(s.loopCount)} options={choices(["0","2"])} onChange={value => a.setLoopCount(Number(value))} />
    </ToolbarGroup>
    <ToolbarGroup title="Content" value="content">
      <MenuRadioControl label="Spacing" value={s.spacing} options={choices(["1rem","2rem"])} onChange={a.setSpacing} />
      <MenuRadioControl label="Direction" value={s.direction} options={choices(["default","provider-rtl","local-ltr","local-rtl"])} onChange={value => a.setDirection(value as DirectionMode)} />
      <MenuCheckboxControl label="Original links" value="links" checked={s.links} onChange={a.setLinks} />
      <MenuCheckboxControl label="Missing replicas" value="missing" checked={s.missing} onChange={a.setMissing} />
      <MenuCheckboxControl label="Unsafe replicas" value="unsafe" checked={s.unsafe} onChange={a.setUnsafe} />
    </ToolbarGroup>
    <ToolbarGroup title="Composition" value="composition"><MenuRadioControl label="All parts" value={s.mode} options={choices(["default","asChild","render"])} onChange={value => a.setMode(value as Mode)} /></ToolbarGroup>
    <PropsToolbarGroup propCheck={s.propCheck} onPropCheckChange={a.setPropCheck} customSlots={[{label:"All slots",value:"custom",checked:s.custom,onChange:a.setCustom}]} />
  </ControlToolbar>;
}
function Track({ scenario: {state:s,actions:a} }: {scenario:Scenario}) {
  const value = useMarquee({ side:s.side, reverse:s.reverse, autoFill:s.autoFill, speed:s.speed, spacing:s.spacing, delay:s.delay, loopCount:s.loopCount, pauseOnInteraction:s.hover,
    dir:s.direction === "local-ltr" ? "ltr" : s.direction === "local-rtl" ? "rtl" : undefined,
    paused:s.controlled ? s.paused : undefined,
    onPauseChange: next => { if(s.controlled) a.setPaused(next); a.addLog(next ? "pause requested" : "resume requested"); },
    onLoopComplete: ({iteration}) => a.addLog(`loop ${iteration}`), onComplete: ({iterations}) => a.addLog(`completed ${iterations} loops`) });
  const project = (children: ReactNode) => s.mode === "asChild" ? {asChild:true,children:<div>{children}</div>} : s.mode === "render" ? {render:(props: Record<string, unknown>) => <div {...props}>{children}</div>} : {children};
  const props = (part:string) => ({...partProps(part,{propCheck:s.propCheck,customSlot:s.custom}),"data-playground-marquee-part":part});
  const items = words.map(word => <Marquee.Item key={word} className="marquee-workbench-item" {...props(`item-${word.toLowerCase()}`)} {...project(s.links ? <a href="#marquee-workbench-destination">{word}</a> : word)} />);
  const copies = () => s.unsafe ? <button>Unsafe copy</button> : words.map(word => <div className="marquee-workbench-item" key={word}>{word}</div>);
  const content = <Marquee.Viewport className="marquee-workbench-viewport" {...props("viewport")} {...project(<Marquee.Content key={`${s.missing}-${s.unsafe}`} className="marquee-workbench-content" {...props("content")} renderReplica={s.missing ? undefined : copies} {...project(items)} />)} />;
  return <>
    <Marquee.RootProvider value={value} aria-label="Workbench partner strip" className="marquee-workbench" {...props("root")} {...project(content)} />
    <Button.Root className="playground-button" onPress={value.togglePause}>{value.requestedPaused ? "Resume" : "Pause"} strip</Button.Root>
    <Button.Root className="playground-button" onPress={value.restart}>Restart strip</Button.Root>
  </>;
}
export function MarqueeScenarioCanvas({scenario}: {scenario:Scenario}) {
  const provider = scenario.state.direction === "provider-rtl" || scenario.state.direction === "local-ltr";
  const track = <Track key={String(scenario.state.controlled)} scenario={scenario} />;
  return <div id="marquee-workbench-destination" className="marquee-workbench-stage">{provider ? <Direction.Provider dir="rtl">{track}</Direction.Provider> : track}</div>;
}
export function getMarqueeSections(): AnatomySection[] {
  return ["root","viewport","content",...words.map(word=>`item-${word.toLowerCase()}`)].map(part=>({title:part === "root" ? "Root Provider" : part,summary:"Live DOM",selector:`[data-playground-marquee-part="${part}"]`,rows:[]}));
}
export function getMarqueeSource(s: Scenario["state"]) {
  const options = [s.side!=="start" && `side: "${s.side}"`,s.reverse&&"reverse: true",s.autoFill&&"autoFill: true",s.speed!==50&&`speed: ${s.speed}`,s.spacing!=="1rem"&&`spacing: "${s.spacing}"`,s.delay!==0&&`delay: ${s.delay}`,s.loopCount!==0&&`loopCount: ${s.loopCount}`,s.hover&&"pauseOnInteraction: true",s.controlled&&"paused, onPauseChange: setPaused",s.direction==="local-ltr"&&'dir: "ltr"',s.direction==="local-rtl"&&'dir: "rtl"'].filter(Boolean).join(", ");
  const host = s.mode === "asChild" ? " asChild" : s.mode === "render" ? ' render={(props) => <div {...props} />}' : "";
  const attrs = (part:string) => `${s.propCheck ? ` data-prop-check="${part}"` : ""}${s.custom ? ` data-slot="${part}-custom"` : ""}`;
  const node = (name:string,part:string,children:string,extra="") => `<Marquee.${name}${host}${attrs(part)} className="marquee-workbench${part === "root" ? "" : `-${part.startsWith("item-") ? "item" : part}`}"${extra}>\n${s.mode==="asChild" ? `  <div>\n${children}\n  </div>` : children}\n</Marquee.${name}>`;
  const items = words.map(word=>node("Item",`item-${word.toLowerCase()}`,s.links?`<a href="#marquee-workbench-destination">${word}</a>`:word)).join("\n");
  const content = node("Content","content",items,s.missing?"":" renderReplica={renderReplica}");
  let root = node("RootProvider","root",node("Viewport","viewport",content),' value={value} aria-label="Workbench partner strip"');
  if(s.direction==="provider-rtl"||s.direction==="local-ltr") root=`<Direction.Provider dir="rtl">\n${root}\n</Direction.Provider>`;
  const replica = s.unsafe ? "<button>Unsafe copy</button>" : `<>\n${words.map(word => `  <div className="marquee-workbench-item">${word}</div>`).join("\n")}\n</>`;
  return `${s.controlled ? "const [paused, setPaused] = useState(false);\n" : ""}const value = useMarquee(${options ? `{ ${options} }` : ""});\n${s.missing ? "" : `const renderReplica = () => (${replica});\n`}${root}\n<Button.Root onPress={value.togglePause}>{value.requestedPaused ? "Resume" : "Pause"} strip</Button.Root>\n<Button.Root onPress={value.restart}>Restart strip</Button.Root>`;
}
