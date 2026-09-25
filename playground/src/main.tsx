import { RecordUtilityProvider } from "./scenarios/RecordUtilityWorkbench";
import { SelectFamilyHarness } from "./SelectFamilyHarness";
import { CollapsibleHarness } from "./CollapsibleHarness";
import { ScrollAreaHarness } from "./ScrollAreaHarness";
import { MenuScrollHarness } from "./MenuScrollHarness";
import { MenuPolicyWorkbench } from "./scenarios/MenuPolicyWorkbench";
import { RecordSelectionHarness } from "./RecordSelectionHarness";
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
import { SwitchHarness } from "./SwitchHarness";

createRoot(document.getElementById("root")!).render(
  <StrictMode>{window.location.pathname === "/__tests/menu-policies" ? <MenuPolicyWorkbench /> : <>
    {window.location.pathname === "/__tests/number-input" ? <NumberInputHarness /> : window.location.pathname === "/__tests/select-family" ? <SelectFamilyHarness /> : window.location.pathname === "/__tests/collapsible" ? <CollapsibleHarness /> : window.location.pathname === "/__tests/record-selection" ? <RecordSelectionHarness /> : <>
    {window.location.pathname === "/__tests/menu-scroll" ? <MenuScrollHarness /> : window.location.pathname === "/__tests/scroll-area-parity" ? <ScrollAreaHarness /> : window.location.pathname === "/__tests/table-of-contents" ? <TableOfContentsHarness /> : window.location.pathname === "/__tests/qr-code" ? <QrCodeHarness /> : window.location.pathname === "/__tests/marquee" ? <MarqueeHarness /> : window.location.pathname === "/__tests/floating-panel" ? <FloatingPanelHarness /> : window.location.pathname === "/__tests/overlay-manager" ? <OverlayManagerHarness /> : window.location.pathname === "/__tests/action-bar" ? <ActionBarHarness /> : window.location.pathname === "/__tests/dates" ? <DateControlsHarness /> : window.location.pathname === "/__tests/download-trigger" ? <DownloadTriggerHarness /> : window.location.pathname === "/__tests/splitter" ? <SplitterHarness /> : window.location.pathname === "/__tests/steps" ? <StepsHarness /> : window.location.pathname === "/__tests/color-picker" ? <ColorPickerHarness /> : window.location.pathname === "/__tests/switch" ? <SwitchHarness /> : <RecordUtilityProvider><App /></RecordUtilityProvider>}
    </>}
  </>}</StrictMode>,
);
import { NumberInputHarness } from "./NumberInputHarness";
