import { Button } from "@flowstack-ui/atom/button";
import { Field } from "@flowstack-ui/atom/field";
import { Fieldset } from "@flowstack-ui/atom/fieldset";
import { Input } from "@flowstack-ui/atom/input";
import { NumberInput } from "@flowstack-ui/atom/number-input";
import { PasswordToggleField } from "@flowstack-ui/atom/password-toggle-field";
import { Textarea } from "@flowstack-ui/atom/textarea";
import { useState, type Dispatch, type SetStateAction } from "react";
import { AnatomyPanel, type AnatomySection } from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, ScenarioEventLog as ScenarioEventLogBase, ToolbarGroup } from "../WorkbenchPrimitives";

type CompositionMode = "default" | "asChild" | "render";
type FieldOrientation = "vertical" | "horizontal";
type LogEntry = {
  id: number;
  time: string;
  text: string;
};

export const formFieldScenarioIds = new Set([
  "field",
  "fieldset",
  "input",
  "textarea",
  "number-input",
  "password-toggle-field",
]);

function nowTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function useScenarioLog() {
  const [log, setLog] = useState<LogEntry[]>([]);

  const addLog = (text: string) => {
    setLog((entries) => [
      { id: Date.now() + Math.random(), time: nowTime(), text },
      ...entries.slice(0, 10),
    ]);
  };

  return {
    log,
    addLog,
    clearLog: () => setLog([]),
  };
}

export function useFormFieldScenarios() {
  return {
    field: useFieldScenario(),
    fieldset: useFieldsetScenario(),
    input: useInputScenario(),
    textarea: useTextareaScenario(),
    numberInput: useNumberInputScenario(),
    passwordToggleField: usePasswordToggleFieldScenario(),
  };
}

function useFieldScenario() {
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [orientation, setOrientation] = useState<FieldOrientation>("vertical");
  const [forceError, setForceError] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [value, setValue] = useState("will@flowstack.dev");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: {
      disabled,
      invalid,
      required,
      readOnly,
      orientation,
      forceError,
      composition,
      value,
      log,
    },
    actions: {
      setDisabled,
      setInvalid,
      setRequired,
      setReadOnly,
      setOrientation,
      setForceError,
      setComposition,
      setValue,
      clearLog,
      noteValue: (next: string) => addLog(`value changed to ${next || "empty"}`),
      noteFocus: () => addLog("input focused"),
      noteBlur: () => addLog("input blurred"),
    },
  };
}

function useFieldsetScenario() {
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(true);
  const [forceError, setForceError] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [choice, setChoice] = useState("email");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { disabled, invalid, required, forceError, composition, choice, log },
    actions: {
      setDisabled,
      setInvalid,
      setRequired,
      setForceError,
      setComposition,
      clearLog,
      setChoice: (next: string) => {
        setChoice(next);
        addLog(`choice changed to ${next}`);
      },
    },
  };
}

function useInputScenario() {
  const [controlled, setControlled] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [fieldWrapped, setFieldWrapped] = useState(true);
  const [value, setValue] = useState("Atom");
  const [clearComposition, setClearComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: {
      controlled,
      disabled,
      invalid,
      required,
      readOnly,
      fieldWrapped,
      value,
      clearComposition,
      log,
    },
    actions: {
      setControlled,
      setDisabled,
      setInvalid,
      setRequired,
      setReadOnly,
      setFieldWrapped,
      setClearComposition,
      clearLog,
      setValue: (next: string) => {
        setValue(next);
        addLog(`value changed to ${next || "empty"}`);
      },
      noteClear: () => addLog("clear clicked"),
    },
  };
}

function useTextareaScenario() {
  const [controlled, setControlled] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [autoResize, setAutoResize] = useState(false);
  const [withMaxLength, setWithMaxLength] = useState(true);
  const [countComposition, setCountComposition] = useState<CompositionMode>("default");
  const [value, setValue] = useState("Write a short note.");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: {
      controlled,
      disabled,
      invalid,
      required,
      readOnly,
      autoResize,
      withMaxLength,
      countComposition,
      value,
      log,
    },
    actions: {
      setControlled,
      setDisabled,
      setInvalid,
      setRequired,
      setReadOnly,
      setAutoResize,
      setWithMaxLength,
      setCountComposition,
      clearLog,
      setValue: (next: string) => {
        setValue(next);
        addLog(`value length ${next.length}`);
      },
    },
  };
}

function useNumberInputScenario() {
  const [controlled, setControlled] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [clampOnBlur, setClampOnBlur] = useState(true);
  const [formatted, setFormatted] = useState(false);
  const [withHiddenInput, setWithHiddenInput] = useState(true);
  const [value, setValue] = useState<number | null>(3);
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: {
      controlled,
      disabled,
      invalid,
      required,
      readOnly,
      clampOnBlur,
      formatted,
      withHiddenInput,
      value,
      log,
    },
    actions: {
      setControlled,
      setDisabled,
      setInvalid,
      setRequired,
      setReadOnly,
      setClampOnBlur,
      setFormatted,
      setWithHiddenInput,
      clearLog,
      setValue: (next: number | null) => {
        setValue(next);
        addLog(`value changed to ${next ?? "empty"}`);
      },
      noteStep: (direction: string) => addLog(`step ${direction}`),
    },
  };
}

function usePasswordToggleFieldScenario() {
  const [controlled, setControlled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [inputComposition, setInputComposition] = useState<CompositionMode>("default");
  const [toggleComposition, setToggleComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: {
      controlled,
      visible,
      disabled,
      invalid,
      required,
      readOnly,
      inputComposition,
      toggleComposition,
      log,
    },
    actions: {
      setControlled,
      setDisabled,
      setInvalid,
      setRequired,
      setReadOnly,
      setInputComposition,
      setToggleComposition,
      clearLog,
      setVisible: (next: boolean) => {
        setVisible(next);
        addLog(`visible changed to ${String(next)}`);
      },
      noteToggle: () => addLog("toggle clicked"),
    },
  };
}

export type FormFieldScenarios = ReturnType<typeof useFormFieldScenarios>;

export function FormFieldScenarioToolbar({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: FormFieldScenarios;
}) {
  if (scenarioId === "field") {
    const scenario = scenarios.field;
    return (
      <ControlToolbar label="Field controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
          <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read Only" value="readonly" onChange={scenario.actions.setReadOnly} />
        </ToolbarGroup>
        <ToolbarGroup title="Content" value="content">
          <MenuCheckboxControl checked={scenario.state.forceError} label="Force Error" value="force-error" onChange={scenario.actions.setForceError} />
          <MenuRadioControl label="Orientation" options={orientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "fieldset") {
    const scenario = scenarios.fieldset;
    return (
      <ControlToolbar label="Fieldset controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
          <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
        </ToolbarGroup>
        <ToolbarGroup title="Content" value="content">
          <MenuCheckboxControl checked={scenario.state.forceError} label="Force Error" value="force-error" onChange={scenario.actions.setForceError} />
          <MenuRadioControl label="Choice" options={choiceOptions} value={scenario.state.choice} onChange={scenario.actions.setChoice} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "input") {
    const scenario = scenarios.input;
    return (
      <ControlToolbar label="Input controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
          <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read Only" value="readonly" onChange={scenario.actions.setReadOnly} />
        </ToolbarGroup>
        <ToolbarGroup title="Field" value="field">
          <MenuCheckboxControl checked={scenario.state.fieldWrapped} label="Use Field" value="field" onChange={scenario.actions.setFieldWrapped} />
        </ToolbarGroup>
        <CompositionToolbarGroup label="Clear Button" value={scenario.state.clearComposition} onChange={scenario.actions.setClearComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "textarea") {
    const scenario = scenarios.textarea;
    return (
      <ControlToolbar label="Textarea controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
          <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read Only" value="readonly" onChange={scenario.actions.setReadOnly} />
        </ToolbarGroup>
        <ToolbarGroup title="Content" value="content">
          <MenuCheckboxControl checked={scenario.state.autoResize} label="Auto Resize" value="auto-resize" onChange={scenario.actions.setAutoResize} />
          <MenuCheckboxControl checked={scenario.state.withMaxLength} label="Max Length" value="max-length" onChange={scenario.actions.setWithMaxLength} />
        </ToolbarGroup>
        <CompositionToolbarGroup label="Count" value={scenario.state.countComposition} onChange={scenario.actions.setCountComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "number-input") {
    const scenario = scenarios.numberInput;
    return (
      <ControlToolbar label="Number Input controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
          <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read Only" value="readonly" onChange={scenario.actions.setReadOnly} />
        </ToolbarGroup>
        <ToolbarGroup title="Value" value="value">
          <MenuRadioControl label="Set Value" options={numberValueOptions} value={String(scenario.state.value ?? "empty")} onChange={(next) => scenario.actions.setValue(next === "empty" ? null : Number(next))} />
          <MenuCheckboxControl checked={scenario.state.clampOnBlur} label="Clamp On Blur" value="clamp" onChange={scenario.actions.setClampOnBlur} />
          <MenuCheckboxControl checked={scenario.state.formatted} label="Formatted" value="formatted" onChange={scenario.actions.setFormatted} />
          <MenuCheckboxControl checked={scenario.state.withHiddenInput} label="Hidden Input" value="hidden-input" onChange={scenario.actions.setWithHiddenInput} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  if (scenarioId === "password-toggle-field") {
    const scenario = scenarios.passwordToggleField;
    return (
      <ControlToolbar label="Password Toggle Field controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.visible} label="Visible" value="visible" onChange={scenario.actions.setVisible} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
          <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read Only" value="readonly" onChange={scenario.actions.setReadOnly} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Input" options={compositionOptions} value={scenario.state.inputComposition} onChange={scenario.actions.setInputComposition} />
          <MenuRadioControl label="Toggle" options={compositionOptions} value={scenario.state.toggleComposition} onChange={scenario.actions.setToggleComposition} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  return null;
}

export function FormFieldScenarioCanvas({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: FormFieldScenarios;
}) {
  if (scenarioId === "field") return <FieldCanvas scenario={scenarios.field} />;
  if (scenarioId === "fieldset") return <FieldsetCanvas scenario={scenarios.fieldset} />;
  if (scenarioId === "input") return <InputCanvas scenario={scenarios.input} />;
  if (scenarioId === "textarea") return <TextareaCanvas scenario={scenarios.textarea} />;
  if (scenarioId === "number-input") return <NumberInputCanvas scenario={scenarios.numberInput} />;
  if (scenarioId === "password-toggle-field") return <PasswordToggleFieldCanvas scenario={scenarios.passwordToggleField} />;
  return null;
}

function FieldCanvas({ scenario }: { scenario: ReturnType<typeof useFieldScenario> }) {
  const state = scenario.state;
  const rootProps = {
    className: "field-demo",
    id: "field-email",
    invalid: state.invalid,
    disabled: state.disabled,
    required: state.required,
    readOnly: state.readOnly,
    orientation: state.orientation,
    "data-prop-check": "root",
  };
  const children = (
    <>
      <Field.Label data-prop-check="label">Email</Field.Label>
      <Input.Root
        data-prop-check="control"
        value={state.value}
        onBlur={scenario.actions.noteBlur}
        onFocus={scenario.actions.noteFocus}
        onValueChange={(next) => {
          scenario.actions.setValue(next);
          scenario.actions.noteValue(next);
        }}
      />
      <Field.Description data-prop-check="description">Use a work email address.</Field.Description>
      <Field.Error data-prop-check="error" forceMatch={state.forceError}>Email is required.</Field.Error>
      <Field.RequiredIndicator data-prop-check="required-indicator" fallback=" optional" />
    </>
  );

  if (state.composition === "asChild") {
    return (
      <Field.Root {...rootProps} asChild>
        <section>{children}</section>
      </Field.Root>
    );
  }

  if (state.composition === "render") {
    return (
      <Field.Root
        {...rootProps}
        render={(props) => <section {...props} />}
      >
        {children}
      </Field.Root>
    );
  }

  return <Field.Root {...rootProps}>{children}</Field.Root>;
}

function FieldsetCanvas({ scenario }: { scenario: ReturnType<typeof useFieldsetScenario> }) {
  const state = scenario.state;
  const rootProps = {
    className: "fieldset-demo",
    id: "fieldset-contact",
    disabled: state.disabled,
    invalid: state.invalid,
    required: state.required,
    "data-prop-check": "root",
  };
  const children = (
    <>
      <Fieldset.Legend data-prop-check="legend">Contact preference</Fieldset.Legend>
      <Fieldset.Description data-prop-check="description">Pick one contact method.</Fieldset.Description>
      <div className="field-option-row">
        {choiceOptions.map((option) => (
          <label className="field-option" key={option}>
            <input
              checked={state.choice === option}
              data-prop-check={`choice-${option}`}
              disabled={state.disabled}
              name="contact-preference"
              onChange={() => scenario.actions.setChoice(option)}
              type="radio"
              value={option}
            />
            <span>{formatOption(option)}</span>
          </label>
        ))}
      </div>
      <Fieldset.Error data-prop-check="error" forceMatch={state.forceError}>Choose one contact method.</Fieldset.Error>
    </>
  );

  if (state.composition === "asChild") {
    return (
      <Fieldset.Root {...rootProps} asChild>
        <section>{children}</section>
      </Fieldset.Root>
    );
  }

  if (state.composition === "render") {
    return (
      <Fieldset.Root {...rootProps} render={(props) => <section {...props} />}>
        {children}
      </Fieldset.Root>
    );
  }

  return <Fieldset.Root {...rootProps}>{children}</Fieldset.Root>;
}

function InputCanvas({ scenario }: { scenario: ReturnType<typeof useInputScenario> }) {
  const state = scenario.state;
  const input = (
    <div className="input-demo-row">
      <Input.Root
        data-prop-check="root"
        defaultValue={state.controlled ? undefined : "Atom"}
        disabled={state.disabled}
        invalid={state.invalid}
        name="project-name"
        onValueChange={scenario.actions.setValue}
        readOnly={state.readOnly}
        required={state.required}
        value={state.controlled ? state.value : undefined}
      >
        <InputClearButton mode={state.clearComposition} onClear={scenario.actions.noteClear} />
      </Input.Root>
    </div>
  );

  if (!state.fieldWrapped) return input;

  return (
    <Field.Root
      className="field-demo"
      id="input-project"
      disabled={state.disabled}
      invalid={state.invalid}
      required={state.required}
      readOnly={state.readOnly}
    >
      <Field.Label>Project name</Field.Label>
      {input}
      <Field.Description>Name used in generated files.</Field.Description>
      <Field.Error forceMatch={state.invalid}>Project name has an error.</Field.Error>
    </Field.Root>
  );
}

function InputClearButton({
  mode,
  onClear,
}: {
  mode: CompositionMode;
  onClear: () => void;
}) {
  if (mode === "asChild") {
    return (
      <Input.Clear asChild onClear={onClear} data-prop-check="clear">
        <span>Clear</span>
      </Input.Clear>
    );
  }

  if (mode === "render") {
    return (
      <Input.Clear
        data-prop-check="clear"
        onClear={onClear}
        render={(props) => <button {...props} />}
      >
        Clear
      </Input.Clear>
    );
  }

  return <Input.Clear data-prop-check="clear" onClear={onClear}>Clear</Input.Clear>;
}

function TextareaCanvas({ scenario }: { scenario: ReturnType<typeof useTextareaScenario> }) {
  const state = scenario.state;
  const count = state.countComposition === "asChild"
    ? (
      <Textarea.Count asChild data-prop-check="count">
        <span />
      </Textarea.Count>
    )
    : state.countComposition === "render"
      ? <Textarea.Count data-prop-check="count" render={(props) => <output {...props} />} />
      : <Textarea.Count data-prop-check="count" />;

  return (
    <Field.Root
      className="field-demo"
      id="textarea-notes"
      disabled={state.disabled}
      invalid={state.invalid}
      required={state.required}
      readOnly={state.readOnly}
    >
      <Field.Label>Notes</Field.Label>
      <Textarea.Root
        autoResize={state.autoResize}
        data-prop-check="root"
        defaultValue={state.controlled ? undefined : "Write a short note."}
        disabled={state.disabled}
        invalid={state.invalid}
        maxLength={state.withMaxLength ? 80 : undefined}
        minRows={3}
        name="notes"
        onValueChange={scenario.actions.setValue}
        readOnly={state.readOnly}
        required={state.required}
        value={state.controlled ? state.value : undefined}
      >
        {count}
      </Textarea.Root>
      <Field.Description>Counter follows the textarea value.</Field.Description>
      <Field.Error forceMatch={state.invalid}>Notes have an error.</Field.Error>
    </Field.Root>
  );
}

function NumberInputCanvas({ scenario }: { scenario: ReturnType<typeof useNumberInputScenario> }) {
  const state = scenario.state;

  return (
    <Field.Root
      className="field-demo"
      id="number-input-seats"
      invalid={state.invalid}
      required={state.required}
    >
      <Field.Label>Seats</Field.Label>
      <NumberInput.Root
        ariaDescribedBy="number-input-seats-description"
        ariaLabel="Seats"
        ariaValueText={(value) => `${value} seats`}
        className="number-input-demo"
        clampOnBlur={state.clampOnBlur}
        data-prop-check="root"
        defaultValue={state.controlled ? undefined : 3}
        disabled={state.disabled}
        formatter={state.formatted ? (value) => `${value} seats` : undefined}
        id="number-input-seats-control"
        inputClassName="number-input-control"
        invalid={state.invalid}
        max={10}
        min={0}
        name={state.withHiddenInput ? "seats" : undefined}
        onValueChange={scenario.actions.setValue}
        parser={state.formatted ? (value) => value.replace(/[^\d.-]/g, "") : undefined}
        placeholder="0"
        readOnly={state.readOnly}
        required={state.required}
        step={1}
        value={state.controlled ? state.value : undefined}
      >
        {(renderState) => (
          <div className="number-stepper" data-prop-check="controls">
            <Button.Root
              className="atom-button secondary number-stepper-button"
              disabled={renderState.disabled || renderState.readOnly || renderState.isAtMin}
              onPress={() => {
                renderState.handleStep(-1);
                scenario.actions.noteStep("down");
              }}
            >
              Down
            </Button.Root>
            <Button.Root
              className="atom-button secondary number-stepper-button"
              disabled={renderState.disabled || renderState.readOnly || renderState.isAtMax}
              onPress={() => {
                renderState.handleStep(1);
                scenario.actions.noteStep("up");
              }}
            >
              Up
            </Button.Root>
          </div>
        )}
      </NumberInput.Root>
      <Field.Description id="number-input-seats-description">Use arrow keys, buttons, Page Up, Page Down, Home, and End.</Field.Description>
      <Field.Error forceMatch={state.invalid}>Seats value has an error.</Field.Error>
    </Field.Root>
  );
}

function PasswordToggleFieldCanvas({ scenario }: { scenario: ReturnType<typeof usePasswordToggleFieldScenario> }) {
  const state = scenario.state;
  const input = state.inputComposition === "asChild"
    ? (
      <PasswordToggleField.Input asChild data-prop-check="input">
        <input />
      </PasswordToggleField.Input>
    )
    : state.inputComposition === "render"
      ? (
        <PasswordToggleField.Input
          data-prop-check="input"
          render={(props) => <input {...props} />}
        />
      )
      : <PasswordToggleField.Input data-prop-check="input" />;
  const toggle = state.toggleComposition === "asChild"
    ? (
      <PasswordToggleField.Toggle asChild data-prop-check="toggle" onClick={scenario.actions.noteToggle}>
        <span />
      </PasswordToggleField.Toggle>
    )
    : state.toggleComposition === "render"
      ? (
        <PasswordToggleField.Toggle
          data-prop-check="toggle"
          onClick={scenario.actions.noteToggle}
          render={(props) => <button {...props} />}
        >
          <PasswordToggleField.Icon hidden="Show" visible="Hide" />
        </PasswordToggleField.Toggle>
      )
      : (
        <PasswordToggleField.Toggle data-prop-check="toggle" onClick={scenario.actions.noteToggle}>
          <PasswordToggleField.Icon data-prop-check="icon" hidden="Show" visible="Hide" />
        </PasswordToggleField.Toggle>
      );

  return (
    <Field.Root
      className="field-demo"
      id="password-field"
      disabled={state.disabled}
      invalid={state.invalid}
      required={state.required}
      readOnly={state.readOnly}
    >
      <Field.Label>Password</Field.Label>
      <PasswordToggleField.Root
        defaultVisible={false}
        disabled={state.disabled}
        invalid={state.invalid}
        onVisibleChange={scenario.actions.setVisible}
        readOnly={state.readOnly}
        required={state.required}
        visible={state.controlled ? state.visible : undefined}
      >
        <div className="password-demo-row" data-prop-check="root">
          {input}
          {toggle}
        </div>
      </PasswordToggleField.Root>
      <Field.Description>Toggle changes the input type and icon state.</Field.Description>
      <Field.Error forceMatch={state.invalid}>Password has an error.</Field.Error>
    </Field.Root>
  );
}

export function FormFieldScenarioAnatomy({
  openGroups,
  scenarioId,
  scenarios,
  onOpenGroupsChange,
}: {
  openGroups: Record<string, boolean>;
  scenarioId: string;
  scenarios: FormFieldScenarios;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <AnatomyPanel
      footer={`${getFormFieldSections(scenarioId, scenarios).length} parts`}
      onOpenGroupsChange={onOpenGroupsChange}
      openGroups={openGroups}
      sections={getFormFieldSections(scenarioId, scenarios)}
    />
  );
}

function getFormFieldSections(scenarioId: string, scenarios: FormFieldScenarios): AnatomySection[] {
  if (scenarioId === "field") return fieldSections(scenarios.field.state);
  if (scenarioId === "fieldset") return fieldsetSections(scenarios.fieldset.state);
  if (scenarioId === "input") return inputSections(scenarios.input.state);
  if (scenarioId === "textarea") return textareaSections(scenarios.textarea.state);
  if (scenarioId === "number-input") return numberInputSections(scenarios.numberInput.state);
  if (scenarioId === "password-toggle-field") return passwordToggleFieldSections(scenarios.passwordToggleField.state);
  return [];
}

function fieldSections(state: ReturnType<typeof useFieldScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: state.composition,
      selector: "[data-slot='field'][data-prop-check='root']",
      rows: [
        { label: "Composition", value: state.composition, category: "composition" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Read Only", value: bool(state.readOnly), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
        { label: "Orientation", value: state.orientation, category: "state" },
      ],
    },
    partSection("Label", "label", "[data-slot='field-label']"),
    partSection("Control", "input", "[data-slot='input'][data-prop-check='control']"),
    partSection("Description", "description", "[data-slot='field-description']"),
    partSection("Error", state.forceError || state.invalid ? "rendered" : "not rendered", "[data-slot='field-error']", !(state.forceError || state.invalid)),
    partSection("Required Indicator", state.required ? "required" : "optional", "[data-slot='field-required-indicator'], [data-slot='field-optional-indicator']"),
  ];
}

function fieldsetSections(state: ReturnType<typeof useFieldsetScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: state.composition,
      selector: "[data-slot='fieldset'][data-prop-check='root']",
      rows: [
        { label: "Composition", value: state.composition, category: "composition" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
      ],
    },
    partSection("Legend", "legend", "[data-slot='fieldset-legend']"),
    partSection("Description", "description", "[data-slot='fieldset-description']"),
    partSection("Choices", state.choice, "[name='contact-preference']:checked"),
    partSection("Error", state.forceError || state.invalid ? "rendered" : "not rendered", "[data-slot='fieldset-error']", !(state.forceError || state.invalid)),
  ];
}

function inputSections(state: ReturnType<typeof useInputScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: state.value || "empty",
      selector: "[data-slot='input'][data-prop-check='root']",
      rows: [
        { label: "Controlled", value: bool(state.controlled), category: "state" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Read Only", value: bool(state.readOnly), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
        { label: "Field wrapped", value: bool(state.fieldWrapped), category: "behavior" },
      ],
    },
    partSection("Clear Button", state.value ? state.clearComposition : "hidden", "[data-slot='input-clear']", !state.value || state.disabled || state.readOnly),
    ...(state.fieldWrapped ? [
      partSection("Field Label", "label", "[data-slot='field-label']"),
      partSection("Field Description", "description", "[data-slot='field-description']"),
      partSection("Field Error", state.invalid ? "rendered" : "not rendered", "[data-slot='field-error']", !state.invalid),
    ] : []),
  ];
}

function textareaSections(state: ReturnType<typeof useTextareaScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: `${state.value.length} chars`,
      selector: "[data-slot='textarea'][data-prop-check='root']",
      rows: [
        { label: "Controlled", value: bool(state.controlled), category: "state" },
        { label: "Auto Resize", value: bool(state.autoResize), category: "state" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Read Only", value: bool(state.readOnly), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
      ],
    },
    partSection("Count", state.countComposition, "[data-slot='textarea-count']"),
    partSection("Field Label", "label", "[data-slot='field-label']"),
    partSection("Field Description", "description", "[data-slot='field-description']"),
    partSection("Field Error", state.invalid ? "rendered" : "not rendered", "[data-slot='field-error']", !state.invalid),
  ];
}

function numberInputSections(state: ReturnType<typeof useNumberInputScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: String(state.value ?? "empty"),
      selector: "[data-slot='number-input'][data-prop-check='root']",
      rows: [
        { label: "Controlled", value: bool(state.controlled), category: "state" },
        { label: "Clamp On Blur", value: bool(state.clampOnBlur), category: "behavior" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Formatted", value: bool(state.formatted), category: "behavior" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Read Only", value: bool(state.readOnly), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
      ],
    },
    partSection("Spinbutton", String(state.value ?? "empty"), "#number-input-seats-control"),
    partSection("Hidden Input", state.withHiddenInput ? String(state.value ?? "") : "not rendered", "input[name='seats']", !state.withHiddenInput),
    partSection("Stepper Buttons", "custom render state", "[data-prop-check='controls']"),
    partSection("Field Label", "label", "[data-slot='field-label']"),
    partSection("Field Description", "description", "[data-slot='field-description']"),
  ];
}

function passwordToggleFieldSections(state: ReturnType<typeof usePasswordToggleFieldScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: state.visible ? "visible" : "hidden",
      selector: "[data-prop-check='root']",
      rows: [
        { label: "Controlled", value: bool(state.controlled), category: "state" },
        { label: "Visible", value: bool(state.visible), category: "state" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Read Only", value: bool(state.readOnly), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
      ],
    },
    partSection("Input", state.inputComposition, "[data-slot='password-toggle-field-input']"),
    partSection("Toggle", state.toggleComposition, "[data-slot='password-toggle-field-toggle']"),
    partSection("Icon", state.visible ? "visible" : "hidden", "[data-slot='password-toggle-field-icon']"),
    partSection("Field Label", "label", "[data-slot='field-label']"),
    partSection("Field Description", "description", "[data-slot='field-description']"),
  ];
}

function partSection(title: string, summary: string, selector: string, inactive = false): AnatomySection {
  return {
    title,
    summary,
    selector,
    inactive,
    rows: [
      { label: "Exists", value: bool(!inactive), category: "presence" },
    ],
  };
}

export function FormFieldScenarioLog({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: FormFieldScenarios;
}) {
  const log = getFormFieldLog(scenarioId, scenarios);
  return <ScenarioEventLog log={log} />;
}

function getFormFieldLog(scenarioId: string, scenarios: FormFieldScenarios) {
  if (scenarioId === "field") return scenarios.field.state.log;
  if (scenarioId === "fieldset") return scenarios.fieldset.state.log;
  if (scenarioId === "input") return scenarios.input.state.log;
  if (scenarioId === "textarea") return scenarios.textarea.state.log;
  if (scenarioId === "number-input") return scenarios.numberInput.state.log;
  if (scenarioId === "password-toggle-field") return scenarios.passwordToggleField.state.log;
  return [];
}

function ScenarioEventLog({ log }: { log: LogEntry[] }) {
  return <ScenarioEventLogBase log={log} />;
}

export function getFormFieldEventCount(scenarioId: string, scenarios: FormFieldScenarios) {
  return getFormFieldLog(scenarioId, scenarios).length;
}

export function clearFormFieldLog(scenarioId: string, scenarios: FormFieldScenarios) {
  if (scenarioId === "field") scenarios.field.actions.clearLog();
  if (scenarioId === "fieldset") scenarios.fieldset.actions.clearLog();
  if (scenarioId === "input") scenarios.input.actions.clearLog();
  if (scenarioId === "textarea") scenarios.textarea.actions.clearLog();
  if (scenarioId === "number-input") scenarios.numberInput.actions.clearLog();
  if (scenarioId === "password-toggle-field") scenarios.passwordToggleField.actions.clearLog();
}

export function getFormFieldCanvasFooter(scenarioId: string, scenarios: FormFieldScenarios) {
  if (scenarioId === "field") {
    const state = scenarios.field.state;
    return `${state.orientation} | Required ${state.required} | Invalid ${state.invalid}`;
  }

  if (scenarioId === "fieldset") {
    const state = scenarios.fieldset.state;
    return `Choice ${state.choice} | Required ${state.required} | Invalid ${state.invalid}`;
  }

  if (scenarioId === "input") {
    const state = scenarios.input.state;
    return `${state.controlled ? "Controlled" : "Uncontrolled"} | Value ${state.value || "empty"} | Clear ${state.clearComposition}`;
  }

  if (scenarioId === "textarea") {
    const state = scenarios.textarea.state;
    return `${state.controlled ? "Controlled" : "Uncontrolled"} | ${state.value.length} chars | Count ${state.countComposition}`;
  }

  if (scenarioId === "number-input") {
    const state = scenarios.numberInput.state;
    return `${state.controlled ? "Controlled" : "Uncontrolled"} | Value ${state.value ?? "empty"} | Clamp ${state.clampOnBlur}`;
  }

  if (scenarioId === "password-toggle-field") {
    const state = scenarios.passwordToggleField.state;
    return `${state.controlled ? "Controlled" : "Uncontrolled"} | ${state.visible ? "Visible" : "Hidden"} | Input ${state.inputComposition}`;
  }

  return "";
}

export function getFormFieldSource(scenarioId: string, scenarios: FormFieldScenarios) {
  if (scenarioId === "field") return getFieldSource(scenarios.field.state);
  if (scenarioId === "fieldset") return getFieldsetSource(scenarios.fieldset.state);
  if (scenarioId === "input") return getInputSource(scenarios.input.state);
  if (scenarioId === "textarea") return getTextareaSource(scenarios.textarea.state);
  if (scenarioId === "number-input") return getNumberInputSource(scenarios.numberInput.state);
  if (scenarioId === "password-toggle-field") return getPasswordToggleFieldSource(scenarios.passwordToggleField.state);
  return "// No source example for this scenario yet.";
}

function getFieldSource(state: ReturnType<typeof useFieldScenario>["state"]) {
  return `<Field.Root
  id="field-email"
  required={${state.required}}
  invalid={${state.invalid}}
  disabled={${state.disabled}}
  readOnly={${state.readOnly}}
  orientation="${state.orientation}"
>
  <Field.Label>Email</Field.Label>
  <Input.Root value={value} onValueChange={setValue} />
  <Field.Description>Use a work email address.</Field.Description>
  <Field.Error forceMatch={${state.forceError}}>Email is required.</Field.Error>
  <Field.RequiredIndicator fallback=" optional" />
</Field.Root>`;
}

function getFieldsetSource(state: ReturnType<typeof useFieldsetScenario>["state"]) {
  return `<Fieldset.Root
  id="fieldset-contact"
  required={${state.required}}
  invalid={${state.invalid}}
  disabled={${state.disabled}}
>
  <Fieldset.Legend>Contact preference</Fieldset.Legend>
  <Fieldset.Description>Pick one contact method.</Fieldset.Description>
  <label>
    <input type="radio" name="contact-preference" value="email" />
    Email
  </label>
  <Fieldset.Error forceMatch={${state.forceError}}>Choose one contact method.</Fieldset.Error>
</Fieldset.Root>`;
}

function getInputSource(state: ReturnType<typeof useInputScenario>["state"]) {
  return `${state.fieldWrapped ? `<Field.Root id="input-project" invalid={${state.invalid}}>
  <Field.Label>Project name</Field.Label>
  ` : ""}<Input.Root
  ${state.controlled ? "value={value}" : "defaultValue=\"Atom\""}
  disabled={${state.disabled}}
  invalid={${state.invalid}}
  required={${state.required}}
  readOnly={${state.readOnly}}
  onValueChange={setValue}
>
  <Input.Clear onClear={handleClear}>Clear</Input.Clear>
</Input.Root>${state.fieldWrapped ? "\n</Field.Root>" : ""}`;
}

function getTextareaSource(state: ReturnType<typeof useTextareaScenario>["state"]) {
  return `<Field.Root id="textarea-notes" invalid={${state.invalid}}>
  <Field.Label>Notes</Field.Label>
  <Textarea.Root
    ${state.controlled ? "value={value}" : "defaultValue=\"Write a short note.\""}
    autoResize={${state.autoResize}}
    maxLength={${state.withMaxLength ? 80 : "undefined"}}
    minRows={3}
    onValueChange={setValue}
  >
    <Textarea.Count />
  </Textarea.Root>
  <Field.Description>Counter follows the textarea value.</Field.Description>
</Field.Root>`;
}

function getNumberInputSource(state: ReturnType<typeof useNumberInputScenario>["state"]) {
  return `<NumberInput.Root
  ${state.controlled ? "value={value}" : "defaultValue={3}"}
  min={0}
  max={10}
  step={1}
  clampOnBlur={${state.clampOnBlur}}
  formatter={${state.formatted ? "formatSeats" : "undefined"}}
  parser={${state.formatted ? "parseSeats" : "undefined"}}
  name={${state.withHiddenInput ? "\"seats\"" : "undefined"}}
  onValueChange={setValue}
>
  {({ handleStep, isAtMin, isAtMax }) => (
    <>
      <button disabled={isAtMin} onClick={() => handleStep(-1)}>Down</button>
      <button disabled={isAtMax} onClick={() => handleStep(1)}>Up</button>
    </>
  )}
</NumberInput.Root>`;
}

function getPasswordToggleFieldSource(state: ReturnType<typeof usePasswordToggleFieldScenario>["state"]) {
  return `<PasswordToggleField.Root
  ${state.controlled ? "visible={visible}" : "defaultVisible={false}"}
  disabled={${state.disabled}}
  invalid={${state.invalid}}
  required={${state.required}}
  readOnly={${state.readOnly}}
  onVisibleChange={setVisible}
>
  <PasswordToggleField.Input />
  <PasswordToggleField.Toggle>
    <PasswordToggleField.Icon hidden="Show" visible="Hide" />
  </PasswordToggleField.Toggle>
</PasswordToggleField.Root>`;
}

function CompositionToolbarGroup({
  label = "Root",
  value,
  onChange,
}: {
  label?: string;
  value: CompositionMode;
  onChange: (value: CompositionMode) => void;
}) {
  return (
    <ToolbarGroup title="Composition" value="composition">
      <MenuRadioControl label={label} options={compositionOptions} value={value} onChange={onChange} />
    </ToolbarGroup>
  );
}

function bool(value: boolean) {
  return value ? "true" : "false";
}

function formatOption(value: string) {
  if (value === "asChild") return "As Child";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const compositionOptions = ["default", "asChild", "render"] as const;
const orientationOptions = ["vertical", "horizontal"] as const;
const choiceOptions = ["email", "sms", "phone"] as const;
const numberValueOptions = ["empty", "0", "3", "10", "15"] as const;
