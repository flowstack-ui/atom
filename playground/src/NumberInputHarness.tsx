import { useState } from "react";
import { NumberInput } from "@flowstack-ui/atom/number-input";

export function NumberInputHarness() {
  const [locale, setLocale] = useState("en-US");
  const [shown, setShown] = useState(false);
  return <main>
    <button onClick={() => setLocale(locale === "en-US" ? "de-DE" : "en-US")}>Change locale</button>
    <form id="numbers">
      <NumberInput.Root defaultValue={1234.5} locale={locale} name="amount" allowMouseWheel step={0.1}>
        <NumberInput.Label>Amount</NumberInput.Label><NumberInput.Input />
        <NumberInput.Increment>Increase</NumberInput.Increment><NumberInput.Decrement>Decrease</NumberInput.Decrement>
        <NumberInput.Scrubber>Drag amount</NumberInput.Scrubber>
      </NumberInput.Root>
      <NumberInput.Root value={2} aria-label="Controlled" />
      <NumberInput.Root valueMode="string" defaultValue="" locale="de-DE" name="localized" aria-label="Localized" />
      <button type="reset">Reset</button>
    </form>
    <button onClick={() => setShown(!shown)}>Mount input</button>
    <NumberInput.Root defaultValue={1} allowMouseWheel>{shown ? <NumberInput.Input aria-label="Conditional" /> : <span>Input absent</span>}</NumberInput.Root>
  </main>;
}
