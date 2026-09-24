import { useState } from "react";
import { ScrollArea, useScrollArea } from "@flowstack-ui/atom/scroll-area";
import "./scroll-area-harness.css";

export function ScrollAreaHarness() {
  const [rtl, setRtl] = useState(false),
    [count, setCount] = useState(30);
  const [hidden, setHidden] = useState(false),
    [mounted, setMounted] = useState(true);
  const api = useScrollArea({ orientation: "both" });
  return (
    <section>
      <button onClick={() => setRtl(!rtl)}>Direction</button>
      <button onClick={() => setCount(count === 30 ? 0 : 30)}>Content</button>
      <button onClick={() => setHidden(!hidden)}>Visibility</button>
      <button onClick={() => setMounted(!mounted)}>Mount</button>
      <button
        onClick={() =>
          api.scrollToEdge({
            edge: "bottom",
            duration: 1200,
            easing: (t) => t * t,
          })
        }
      >
        Animate bottom
      </button>
      <button onClick={() => api.scrollToEdge({ edge: "bottom" })}>
        Bottom
      </button>
      <button onClick={() => api.scrollToEdge({ edge: "top", duration: 800 })}>
        Animate top
      </button>
      <button onClick={() => api.scrollToEdge({ edge: "left" })}>Left</button>
      <button onClick={() => api.scrollToEdge({ edge: "right" })}>Right</button>
      <output>{api.isAtBottom ? "at-bottom" : "not-bottom"}</output>
      {mounted && (
        <ScrollArea.RootProvider
          value={api}
          dir={rtl ? "rtl" : "ltr"}
          className="scroll-harness"
          style={hidden ? { display: "none" } : undefined}
        >
          <ScrollArea.Viewport focusable aria-label="Scrollable records">
            <ScrollArea.Content>
              <div style={{ width: count ? 900 : undefined }}>
                {Array.from({ length: count }, (_, i) => (
                  <p key={i}>Record {i + 1}</p>
                ))}
              </div>
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar>
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
          <ScrollArea.Scrollbar orientation="horizontal">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner />
        </ScrollArea.RootProvider>
      )}
    </section>
  );
}
