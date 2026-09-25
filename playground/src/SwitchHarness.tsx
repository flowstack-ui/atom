import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Switch, useSwitch } from "@flowstack-ui/atom/switch";

function CompoundSwitch({
  id,
  label,
  ...props
}: {
  id: string;
  label: string;
  name?: string;
  value?: string;
  form?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}) {
  return (
    <Switch.Field id={id} {...props}>
      <Switch.Label>
        {label} <a href="#help">Help</a>
      </Switch.Label>
      <Switch.Control>
        <Switch.Indicator fallback="off">on</Switch.Indicator>
        <Switch.Thumb>
          <Switch.ThumbIndicator fallback="0">1</Switch.ThumbIndicator>
        </Switch.Thumb>
      </Switch.Control>
      <Switch.HiddenInput />
    </Switch.Field>
  );
}

function IframeSwitch() {
  const [body, setBody] = useState<HTMLElement | null>(null);

  return (
    <iframe
      title="Switch iframe"
      srcDoc="<!doctype html><html><body></body></html>"
      onLoad={(event) => setBody(event.currentTarget.contentDocument?.body ?? null)}
    >
      {body
        ? createPortal(
            <Switch.Field id="iframe-switch" defaultChecked>
              <Switch.Label>Iframe setting</Switch.Label>
              <Switch.Control
                render={
                  <span
                    tabIndex={0}
                    style={{ display: "inline-block", width: 48, height: 24 }}
                  />
                }
              />
              <Switch.HiddenInput />
            </Switch.Field>,
            body,
          )
        : null}
    </iframe>
  );
}

export function SwitchHarness() {
  const [submission, setSubmission] = useState("");
  const [controlled, setControlled] = useState(false);
  const controller = useSwitch({ defaultChecked: true });
  const [rootRefTarget, setRootRefTarget] = useState("");
  const [controlRefTarget, setControlRefTarget] = useState("");
  const [inputRefTarget, setInputRefTarget] = useState("");
  const rootRef = useCallback((node: HTMLButtonElement | null) => {
    setRootRefTarget(node?.tagName ?? "");
  }, []);
  const controlRef = useCallback((node: HTMLButtonElement | null) => {
    setControlRefTarget(node?.tagName ?? "");
  }, []);
  const inputRef = useCallback((node: HTMLInputElement | null) => {
    setInputRefTarget(node?.tagName ?? "");
  }, []);

  return (
    <main>
      <h1>Switch browser harness</h1>
      <p id="help">Independent help destination</p>

      <form
        id="settings-form"
        onSubmit={(event) => {
          event.preventDefault();
          const entries = [...new FormData(event.currentTarget).entries()]
            .map(([key, value]) => `${key}=${value}`)
            .join(",");
          setSubmission(entries);
        }}
      >
        <CompoundSwitch
          id="compound"
          label="Weekly reports"
          name="reports"
          value="weekly"
          required
        />
        <CompoundSwitch
          id="repeated-a"
          label="Repeated A"
          name="channel"
          value="a"
          defaultChecked
        />
        <CompoundSwitch
          id="repeated-b"
          label="Repeated B"
          name="channel"
          value="b"
          defaultChecked
        />
        <CompoundSwitch
          id="disabled"
          label="Disabled setting"
          name="disabledSetting"
          defaultChecked
          disabled
        />
        <CompoundSwitch
          id="unnamed"
          label="Unnamed setting"
          defaultChecked
        />
        <button type="submit">Submit settings</button>
        <button type="reset">Reset settings</button>
      </form>
      <output data-testid="submission">{submission}</output>

      <CompoundSwitch
        id="controlled"
        label="Controlled setting"
        checked={controlled}
        onCheckedChange={setControlled}
      />
      <output data-testid="controlled-value">{String(controlled)}</output>

      <CompoundSwitch
        id="readonly"
        label="Read only setting"
        defaultChecked
        readOnly
      />

      <Switch.RootProvider id="provider" value={controller} name="providerSetting">
        <Switch.Label>Provider setting</Switch.Label>
        <Switch.Control />
        <Switch.HiddenInput />
      </Switch.RootProvider>

      <Switch.Field id="custom-host">
        <Switch.Label>Custom host</Switch.Label>
        <Switch.Control
          render={<span />}
          ref={controlRef}
        />
        <Switch.HiddenInput ref={inputRef} />
      </Switch.Field>
      <output data-testid="control-ref">{controlRefTarget}</output>
      <output data-testid="input-ref">{inputRefTarget}</output>

      <Switch.Root
        aria-label="Legacy root"
        defaultChecked
        name="legacy"
        ref={rootRef}
      >
        <Switch.Thumb />
      </Switch.Root>
      <output data-testid="root-ref">{rootRefTarget}</output>

      <CompoundSwitch
        id="external"
        label="External owner"
        name="externalSetting"
        value="yes"
        form="external-form"
        defaultChecked
      />
      <form
        id="external-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmission(
            [...new FormData(event.currentTarget).entries()]
              .map(([key, value]) => `${key}=${value}`)
              .join(","),
          );
        }}
      >
        <button type="submit">Submit external</button>
      </form>

      <IframeSwitch />
    </main>
  );
}
