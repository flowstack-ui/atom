import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ColorPickerHarness } from "./ColorPickerHarness";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {window.location.pathname === "/__tests/color-picker" ? <ColorPickerHarness /> : <App />}
  </StrictMode>,
);
