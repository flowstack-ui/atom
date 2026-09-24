import { DropdownMenu } from "@flowstack-ui/atom";
import { useState } from "react";
import { createPortal } from "react-dom";

const itemStyle = { display: "block", padding: 12, minHeight: 40 };
const menuStyle = { background: "white", border: "1px solid", width: 240, maxHeight: 160, overflow: "auto", zIndex: 83, "--test-menu-arrow-fill": "rgb(20, 60, 100)" } as const;

/** Bottom-edge geometry regression: menu scrolling must never move the page. */
export function MenuScrollHarness() {
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [framePortalHost, setFramePortalHost] = useState<HTMLDivElement | null>(null);
  return (
    <main style={{ height: 1800 }}>
      <iframe title="Menu document" srcDoc="<!doctype html><html><body></body></html>" onLoad={event => setFrame(event.currentTarget.contentDocument?.body ?? null)} />
      {frame && createPortal(
        <>
        <div ref={setFramePortalHost} data-testid="frame-portal-host" />
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger>Frame actions</DropdownMenu.Trigger>
          <DropdownMenu.Content style={{ ...menuStyle, color: "rgb(90, 20, 60)" }}>
            <DropdownMenu.Arrow data-testid="frame-arrow" fill="currentColor" />
            <DropdownMenu.Item value="frame-copy">Copy in frame</DropdownMenu.Item>
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger value="frame-more">More in frame</DropdownMenu.SubTrigger>
              <DropdownMenu.Portal container={framePortalHost}>
              <DropdownMenu.SubContent style={menuStyle}>
                <DropdownMenu.Item value="frame-nested">Nested in frame</DropdownMenu.Item>
              </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root></>, frame)}
      <div data-testid="ancestor" style={{ position: "fixed", bottom: 0, left: 20, height: 100, width: 320, overflow: "auto" }}>
        <div style={{ height: 300, paddingTop: 60 }}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>Account</DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content style={menuStyle}>
                <DropdownMenu.Arrow data-testid="menu-arrow" style={{ fill: "var(--test-menu-arrow-fill)" }} />
                <DropdownMenu.Item value="profile" style={itemStyle}>Profile</DropdownMenu.Item>
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger value="more" style={itemStyle}>More</DropdownMenu.SubTrigger>
                  <DropdownMenu.SubContent style={menuStyle}>
                    <DropdownMenu.Arrow data-testid="submenu-arrow" style={{ fill: "var(--test-menu-arrow-fill)" }} />
                    {Array.from({ length: 20 }, (_, i) => <DropdownMenu.Item key={i} value={`nested-${i}`} style={itemStyle}>Nested {i}</DropdownMenu.Item>)}
                  </DropdownMenu.SubContent>
                </DropdownMenu.Sub>
                {Array.from({ length: 20 }, (_, i) => <DropdownMenu.Item key={i} value={`item-${i}`} style={itemStyle}>Item {i}</DropdownMenu.Item>)}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </main>
  );
}
