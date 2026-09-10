import { MarqueeHarness } from "./MarqueeHarness";
import { TableOfContentsHarness } from "./TableOfContentsHarness";
import { QrCodeHarness } from "./QrCodeHarness";
import { StrictMode } from "react";
import { FloatingPanelHarness } from "./FloatingPanelHarness";
import { OverlayManagerHarness } from "./OverlayManagerHarness";
import { ActionBarHarness } from "./ActionBarHarness";
import { DateControlsHarness } from "./DateControlsHarness";
import { DownloadTriggerHarness } from "./DownloadTriggerHarness";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ColorPickerHarness } from "./ColorPickerHarness";
import { StepsHarness } from "./StepsHarness";
import { SplitterHarness } from "./SplitterHarness";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {window.location.pathname === "/__tests/table-of-contents" ? <TableOfContentsHarness /> : window.location.pathname === "/__tests/qr-code" ? <QrCodeHarness /> : window.location.pathname === "/__tests/marquee" ? <MarqueeHarness /> : window.location.pathname === "/__tests/floating-panel" ? <FloatingPanelHarness /> : window.location.pathname === "/__tests/overlay-manager" ? <OverlayManagerHarness /> : window.location.pathname === "/__tests/action-bar" ? <ActionBarHarness /> : window.location.pathname === "/__tests/dates" ? <DateControlsHarness /> : window.location.pathname === "/__tests/download-trigger" ? <DownloadTriggerHarness /> : window.location.pathname === "/__tests/splitter" ? <SplitterHarness /> : window.location.pathname === "/__tests/steps" ? <StepsHarness /> : window.location.pathname === "/__tests/color-picker" ? <ColorPickerHarness /> : <App />}
  </StrictMode>,
);
