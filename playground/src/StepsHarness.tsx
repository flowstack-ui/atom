import { useState } from "react";
import { Steps } from "@flowstack-ui/atom/steps";
import { Button } from "@flowstack-ui/atom/button";
import { Input } from "@flowstack-ui/atom/input";

/** Unstyled, deterministic behavior fixture; all presentation belongs to consumers. */
export function StepsHarness() {
  const [valid, setValid] = useState(false);
  const [blocked, setBlocked] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [controlled, setControlled] = useState(0);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [disabled, setDisabled] = useState(false);
  const [linear, setLinear] = useState(true);
  const [keepMounted, setKeepMounted] = useState(true);
  return <section aria-label="Steps behavior">
    <h1>Steps behavior</h1>
    <section aria-label="Workflow properties">
      <Button.Root onClick={() => setOrientation(value => value === "horizontal" ? "vertical" : "horizontal")}>Orientation: {orientation}</Button.Root>
      <Button.Root aria-pressed={disabled} onClick={() => setDisabled(value => !value)}>Disable workflow</Button.Root>
      <Button.Root aria-pressed={linear} onClick={() => setLinear(value => !value)}>Linear validation</Button.Root>
      <Button.Root aria-pressed={keepMounted} onClick={() => setKeepMounted(value => !value)}>Keep panels mounted</Button.Root>
      <p>Inspect Root, List, Item, Trigger, Indicator, Title, Separator, Content, CompletedContent, NextTrigger, and PrevTrigger through their data-slot attributes.</p>
    </section>
    <section aria-label="Uncontrolled">
      <Steps.Root count={3} linear={linear} orientation={orientation} disabled={disabled} isStepValid={index => index !== 0 || valid} onStepInvalid={() => setBlocked(v => v + 1)} onStepComplete={() => setCompleted(v => v + 1)}>
        <Steps.List aria-label="Setup progress">{["Account", "Profile", "Review"].map((title, index) => <Steps.Item key={title} index={index}>
          <Steps.Trigger><Steps.Indicator /><Steps.Title>{title}</Steps.Title></Steps.Trigger><Steps.Separator />
        </Steps.Item>)}</Steps.List>
        <Steps.Content index={0} keepMounted={keepMounted}><label>Name<Input.Root aria-label="Name" /></label><Button.Root onClick={() => setValid(true)}>Allow forward</Button.Root></Steps.Content>
        <Steps.Content index={1} keepMounted={keepMounted}>Profile settings<Steps.NextTrigger>Next inside panel</Steps.NextTrigger></Steps.Content>
        <Steps.Content index={2} keepMounted={keepMounted}>Review settings</Steps.Content>
        <Steps.CompletedContent>Completed setup</Steps.CompletedContent>
        <Steps.PrevTrigger>Previous</Steps.PrevTrigger><Steps.NextTrigger>Next</Steps.NextTrigger>
        <Steps.Context>{state => <><output data-testid="step">{state.step}</output><Button.Root onClick={state.resetStep}>Reset</Button.Root></>}</Steps.Context>
      </Steps.Root>
      <output data-testid="blocked">{blocked}</output><output data-testid="completed">{completed}</output>
    </section>
    <section aria-label="Controlled">
      <Steps.Root count={2} step={controlled} onStepChange={setControlled}>
        <Steps.List><Steps.Item index={0}><Steps.Title>First</Steps.Title></Steps.Item><Steps.Item index={1}><Steps.Title>Second</Steps.Title></Steps.Item></Steps.List>
        <Steps.Content index={0}>First panel</Steps.Content><Steps.Content index={1}>Second panel</Steps.Content>
        <Steps.NextTrigger asChild><button>Controlled next</button></Steps.NextTrigger>
        <Steps.Context>{state => <output data-testid="controlled-step">{state.step}</output>}</Steps.Context>
      </Steps.Root>
      <Button.Root onClick={() => setControlled(0)}>External reset</Button.Root>
    </section>
    <section aria-label="Prevented"><Steps.Root count={2}><Steps.NextTrigger onClick={event => event.preventDefault()}>Prevented next</Steps.NextTrigger><Steps.Context>{s => <output data-testid="prevented-step">{s.step}</output>}</Steps.Context></Steps.Root></section>
    <section aria-label="Disabled"><Steps.Root count={2} disabled><Steps.NextTrigger>Disabled next</Steps.NextTrigger></Steps.Root></section>
  </section>;
}
