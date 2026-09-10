import { useState } from "react";
import { Button } from "@flowstack-ui/atom/button";
import { Marquee, useMarquee, type MarqueeOptions } from "@flowstack-ui/atom/marquee";

function Lane({ name, options = {}, invalid = false, missing = false, delayed = false }: { name: string; options?: MarqueeOptions; invalid?: boolean; missing?: boolean; delayed?: boolean }) {
  const [loops, setLoops] = useState(0), [ends, setEnds] = useState(0), [wide, setWide] = useState(false), [extra, setExtra] = useState(false), [visible, setVisible] = useState(!delayed);
  const marquee = useMarquee({ autoFill: true, speed: 120, ...options, onLoopComplete: () => setLoops(count => count + 1), onComplete: () => setEnds(count => count + 1) });
  const content = (replica: boolean) => <><Marquee.Item>{replica ? "First story" : <a href="#destination">First story</a>}</Marquee.Item><Marquee.Item>Second story</Marquee.Item>{extra && <Marquee.Item>Third story</Marquee.Item>}</>;
  return <section aria-label={name}>
    <h2>{name}</h2>
    <Button.Root onPress={marquee.togglePause}>{marquee.requestedPaused ? "Resume" : "Pause"} {name}</Button.Root>
    <Button.Root onPress={marquee.restart}>Restart {name}</Button.Root>
    <Button.Root onPress={() => setWide(value => !value)}>Resize {name}</Button.Root>
    <Button.Root onPress={() => setExtra(value => !value)}>Content {name}</Button.Root>
    <Button.Root onPress={() => setVisible(value => !value)}>Visibility {name}</Button.Root>
    <output aria-label={`${name} state`}>{JSON.stringify({ requested: marquee.requestedPaused, paused: marquee.paused, static: marquee.static, reasons: marquee.pauseReasons, copies: marquee.copyCount, distance: marquee.distance, duration: marquee.duration, loops, ends, iteration: marquee.iteration })}</output>
    <Marquee.RootProvider value={marquee} aria-label={`${name} content`} style={{ width: wide ? 480 : 320, display: visible ? "block" : "none" }}>
      <Marquee.Viewport style={marquee.orientation === "vertical" ? { height: 180 } : undefined}>
        <Marquee.Content renderReplica={missing ? undefined : () => invalid ? <button id="bad-copy">Unsafe replica</button> : content(true)}>{content(false)}</Marquee.Content>
      </Marquee.Viewport>
    </Marquee.RootProvider>
  </section>;
}
export function MarqueeHarness() {
  return <main>
    <h1>Marquee behavior evidence</h1>
    <style>{`
      [data-slot=marquee-viewport]{display:flex;gap:var(--atom-marquee-spacing);overflow:hidden;}
      [data-slot=marquee-viewport][data-orientation=vertical]{flex-direction:column;}
      [data-slot=marquee-content],[data-slot=marquee-replica]{display:flex;flex:none;gap:var(--atom-marquee-spacing);width:max-content;animation:marquee-a var(--atom-marquee-duration) linear var(--atom-marquee-delay) var(--atom-marquee-iterations);}
      [data-orientation=vertical]>[data-slot=marquee-content],[data-orientation=vertical]>[data-slot=marquee-replica]{flex-direction:column;width:100%;}
      [data-slot=marquee-item]{flex:none;width:140px;padding:8px;box-sizing:border-box;border:1px solid currentColor;}
      [data-slot=marquee][data-orientation=horizontal]{--mx:calc(-1 * var(--atom-marquee-distance));--my:0px;}
      [data-slot=marquee][data-orientation=vertical]{--mx:0px;--my:calc(-1 * var(--atom-marquee-distance));}
      [data-slot=marquee][data-reversed] [data-original],[data-slot=marquee][data-reversed] [data-replica]{animation-direction:reverse;}
      [data-slot=marquee][data-generation="1"] [data-original],[data-slot=marquee][data-generation="1"] [data-replica]{animation-name:marquee-b;}
      [data-slot=marquee][data-state=paused] [data-original],[data-slot=marquee][data-state=paused] [data-replica]{animation-play-state:paused;}
      [data-slot=marquee][data-static] [data-original]{animation:none;transform:none;}
      [data-slot=marquee][data-static] [data-slot=marquee-viewport]{overflow:auto;}
      @keyframes marquee-a{from{transform:translate(0,0)}to{transform:translate(var(--mx),var(--my))}}
      @keyframes marquee-b{from{transform:translate(0,0)}to{transform:translate(var(--mx),var(--my))}}
      output{display:block;}section{margin:24px 0;}
    `}</style>
    <Lane name="Continuous" options={{ pauseOnInteraction: true }} />
    <Lane name="Finite" options={{ speed: 1000, loopCount: 3 }} />
    <Lane name="Right" options={{ side: "end" }} />
    <Lane name="RTL" options={{ dir: "rtl" }} />
    <Lane name="Up" options={{ side: "top" }} />
    <Lane name="Down" options={{ side: "bottom" }} />
    <Lane name="Reverse" options={{ reverse: true }} />
    <Lane name="Unsafe" invalid />
    <Lane name="No replicas" missing />
    <Lane name="Hidden" delayed />
    <a id="destination" href="#">Destination</a>
  </main>;
}
