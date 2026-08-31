import { ColorPicker } from "@flowstack-ui/atom/color-picker";
import { useState } from "react";

const presets = ["#5b5bd6", "#2f9e44", "#e8590c", "rgba(26, 126, 255, 0.4)"];

function PickerBody() {
  return (
    <>
      <ColorPicker.Area className="color-harness-area">
        <ColorPicker.AreaBackground className="color-harness-area-background" />
        <ColorPicker.AreaThumb className="color-harness-thumb" />
      </ColorPicker.Area>
      <ColorPicker.ChannelSlider channel="hue" className="color-harness-slider">
        <ColorPicker.ChannelSliderLabel>Hue</ColorPicker.ChannelSliderLabel>
        <ColorPicker.ChannelSliderTrack className="color-harness-slider-track" />
        <ColorPicker.ChannelSliderThumb className="color-harness-thumb" />
      </ColorPicker.ChannelSlider>
      <ColorPicker.ChannelSlider channel="alpha" className="color-harness-slider">
        <ColorPicker.ChannelSliderLabel>Alpha</ColorPicker.ChannelSliderLabel>
        <div className="color-harness-alpha-track">
          <ColorPicker.TransparencyGrid size="8px" />
          <ColorPicker.ChannelSliderTrack className="color-harness-slider-track" />
          <ColorPicker.ChannelSliderThumb className="color-harness-thumb" />
        </div>
      </ColorPicker.ChannelSlider>
      <div className="color-harness-inputs">
        <ColorPicker.Input aria-label="Hex color" />
        <ColorPicker.ChannelInput channel="alpha" aria-label="Alpha channel" />
        <ColorPicker.FormatTrigger />
        <ColorPicker.FormatSelect />
        <ColorPicker.NativeInput aria-label="Native opaque color" />
      </div>
      <ColorPicker.SwatchGroup className="color-harness-swatches" aria-label="Color presets">
        {presets.map((value) => (
          <ColorPicker.SwatchTrigger key={value} value={value}>
            <ColorPicker.Swatch value={value} className="color-harness-swatch">
              <ColorPicker.SwatchIndicator className="color-harness-indicator">✓</ColorPicker.SwatchIndicator>
            </ColorPicker.Swatch>
          </ColorPicker.SwatchTrigger>
        ))}
      </ColorPicker.SwatchGroup>
    </>
  );
}

export function ColorPickerHarness() {
  const [value, setValue] = useState("rgba(91, 91, 214, 0.65)");
  const [completed, setCompleted] = useState(0);

  return (
    <main className="color-harness">
      <h1>Color Picker browser harness</h1>
      <ColorPicker.Root
        inline
        value={value}
        onValueChange={(details) => setValue(details.valueAsString)}
        onValueChangeEnd={() => setCompleted((count) => count + 1)}
        name="accent"
      >
        <ColorPicker.Label>Accent color</ColorPicker.Label>
        <div className="color-harness-current">
          <ColorPicker.ValueSwatch className="color-harness-value" />
          <ColorPicker.ValueText data-testid="color-value" />
        </div>
        <PickerBody />
        <ColorPicker.HiddenInput />
      </ColorPicker.Root>
      <output data-testid="completion-count">{completed}</output>

      <ColorPicker.Root defaultValue="#2f9e44" closeOnSelect>
        <ColorPicker.Label>Popup color</ColorPicker.Label>
        <ColorPicker.Trigger>Open popup picker</ColorPicker.Trigger>
        <ColorPicker.Positioner>
          <ColorPicker.Content className="color-harness-popup">
            <PickerBody />
          </ColorPicker.Content>
        </ColorPicker.Positioner>
      </ColorPicker.Root>

      <ColorPicker.Root inline defaultValue="hsla(210, 80%, 50%, 1)" dir="rtl">
        <ColorPicker.Label>RTL color</ColorPicker.Label>
        <ColorPicker.ChannelSlider channel="hue" className="color-harness-slider">
          <ColorPicker.ChannelSliderTrack className="color-harness-slider-track" />
          <ColorPicker.ChannelSliderThumb className="color-harness-thumb" />
        </ColorPicker.ChannelSlider>
      </ColorPicker.Root>
    </main>
  );
}
