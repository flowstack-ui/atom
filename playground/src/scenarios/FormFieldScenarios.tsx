import { Button } from "@flowstack-ui/atom/button";
import { Field } from "@flowstack-ui/atom/field";
import { Fieldset } from "@flowstack-ui/atom/fieldset";
import { FileUpload, type FileUploadRejectedFile } from "@flowstack-ui/atom/file-upload";
import { Input } from "@flowstack-ui/atom/input";
import { NumberInput } from "@flowstack-ui/atom/number-input";
import { OTPField } from "@flowstack-ui/atom/otp-field";
import { PasswordToggleField } from "@flowstack-ui/atom/password-toggle-field";
import { RadioGroup } from "@flowstack-ui/atom/radio-group";
import { Textarea } from "@flowstack-ui/atom/textarea";
import { useCallback, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { AnatomyPanel, type AnatomySection } from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, PropsToolbarGroup, ScenarioEventLog as ScenarioEventLogBase, ToolbarGroup, partProps } from "../WorkbenchPrimitives";

type CompositionMode = "default" | "asChild" | "render";
type FieldOrientation = "vertical" | "horizontal";
type FieldControlType = "native" | "atom";
type FieldsetControlType = "native" | "atom";
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
  "otp-field",
  "file-upload",
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

function usePartRefs() {
  const [refs, setRefs] = useState<Record<string, string>>({});
  const valuesRef = useRef<Record<string, string>>({});
  const callbacksRef = useRef<Record<string, (node: Element | null) => void>>({});

  const setPartRef = useCallback((part: string) => {
    callbacksRef.current[part] ??= (node: Element | null) => {
      if (!node) return;

      const next = node?.tagName.toLowerCase() ?? "none";
      if (valuesRef.current[part] === next) return;

      valuesRef.current = { ...valuesRef.current, [part]: next };
      setRefs(valuesRef.current);
    };

    return callbacksRef.current[part];
  }, []);

  return { refs, setPartRef };
}

export function useFormFieldScenarios() {
  return {
    field: useFieldScenario(),
    fieldset: useFieldsetScenario(),
    input: useInputScenario(),
    textarea: useTextareaScenario(),
    numberInput: useNumberInputScenario(),
    passwordToggleField: usePasswordToggleFieldScenario(),
    otpField: useOTPFieldScenario(),
    fileUpload: useFileUploadScenario(),
  };
}

function useFieldScenario() {
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [orientation, setOrientation] = useState<FieldOrientation>("vertical");
  const [forceError, setForceError] = useState(false);
  const [controlType, setControlType] = useState<FieldControlType>("atom");
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customLabelSlot, setCustomLabelSlot] = useState(false);
  const [customIndicatorSlot, setCustomIndicatorSlot] = useState(false);
  const [customDescriptionSlot, setCustomDescriptionSlot] = useState(false);
  const [customErrorSlot, setCustomErrorSlot] = useState(false);
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
      controlType,
      composition,
      propCheck,
      customRootSlot,
      customLabelSlot,
      customIndicatorSlot,
      customDescriptionSlot,
      customErrorSlot,
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
      setControlType,
      setComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomLabelSlot,
      setCustomIndicatorSlot,
      setCustomDescriptionSlot,
      setCustomErrorSlot,
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
  const [legendComposition, setLegendComposition] = useState<CompositionMode>("default");
  const [descriptionComposition, setDescriptionComposition] = useState<CompositionMode>("default");
  const [errorComposition, setErrorComposition] = useState<CompositionMode>("default");
  const [controlType, setControlType] = useState<FieldsetControlType>("native");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customLegendSlot, setCustomLegendSlot] = useState(false);
  const [customDescriptionSlot, setCustomDescriptionSlot] = useState(false);
  const [customErrorSlot, setCustomErrorSlot] = useState(false);
  const [choice, setChoice] = useState("email");
  const { log, addLog, clearLog } = useScenarioLog();
  const { refs, setPartRef } = usePartRefs();

  return {
    state: {
      disabled,
      invalid,
      required,
      forceError,
      composition,
      legendComposition,
      descriptionComposition,
      errorComposition,
      controlType,
      propCheck,
      customRootSlot,
      customLegendSlot,
      customDescriptionSlot,
      customErrorSlot,
      choice,
      refs,
      log,
    },
    actions: {
      setDisabled,
      setInvalid,
      setRequired,
      setForceError,
      setComposition,
      setLegendComposition,
      setDescriptionComposition,
      setErrorComposition,
      setControlType,
      setPropCheck,
      setCustomRootSlot,
      setCustomLegendSlot,
      setCustomDescriptionSlot,
      setCustomErrorSlot,
      setPartRef,
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
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customClearSlot, setCustomClearSlot] = useState(false);
  const [propCheck, setPropCheck] = useState(false);
  const [value, setValue] = useState("Atom");
  const [clearComposition, setClearComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();
  const { refs, setPartRef } = usePartRefs();

  return {
    state: {
      controlled,
      disabled,
      invalid,
      required,
      readOnly,
      fieldWrapped,
      customRootSlot,
      customClearSlot,
      propCheck,
      value,
      clearComposition,
      refs,
      log,
    },
    actions: {
      setControlled,
      setDisabled,
      setInvalid,
      setRequired,
      setReadOnly,
      setFieldWrapped,
      setCustomRootSlot,
      setCustomClearSlot,
      setPropCheck,
      setClearComposition,
      setPartRef,
      clearLog,
      setValue: (next: string) => {
        setValue(next);
        addLog(`value changed to ${next || "empty"}`);
      },
      noteBlur: () => addLog("root user onBlur"),
      noteClear: () => addLog("clear clicked"),
      noteChange: () => addLog("root user onChange"),
      noteFocus: () => addLog("root user onFocus"),
    },
  };
}

function useTextareaScenario() {
  const [controlled, setControlled] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [fieldWrapped, setFieldWrapped] = useState(true);
  const [autoResize, setAutoResize] = useState(false);
  const [withMaxLength, setWithMaxLength] = useState(true);
  const [countComposition, setCountComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customCountSlot, setCustomCountSlot] = useState(false);
  const [value, setValue] = useState("Write a short note.");
  const { log, addLog, clearLog } = useScenarioLog();
  const { refs, setPartRef } = usePartRefs();

  return {
    state: {
      controlled,
      disabled,
      invalid,
      required,
      readOnly,
      fieldWrapped,
      autoResize,
      withMaxLength,
      countComposition,
      propCheck,
      customRootSlot,
      customCountSlot,
      value,
      refs,
      log,
    },
    actions: {
      setControlled,
      setDisabled,
      setInvalid,
      setRequired,
      setReadOnly,
      setFieldWrapped,
      setAutoResize,
      setWithMaxLength,
      setCountComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomCountSlot,
      setPartRef,
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
  const [customLargeStep, setCustomLargeStep] = useState(false);
  const [precision, setPrecision] = useState(false);
  const [withHiddenInput, setWithHiddenInput] = useState(true);
  const [withFormOwner, setWithFormOwner] = useState(false);
  const [fieldWrapped, setFieldWrapped] = useState(true);
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [rootRef, setRootRef] = useState("none");
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
      customLargeStep,
      precision,
      withHiddenInput,
      withFormOwner,
      fieldWrapped,
      propCheck,
      customRootSlot,
      rootRef,
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
      setCustomLargeStep,
      setPrecision,
      setWithHiddenInput,
      setWithFormOwner,
      setFieldWrapped,
      setPropCheck,
      setCustomRootSlot,
      clearLog,
      markRootRef: (node: HTMLDivElement | null) => {
        setRootRef(node?.tagName.toLowerCase() ?? "none");
      },
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
  const [fieldWrapped, setFieldWrapped] = useState(true);
  const [inputComposition, setInputComposition] = useState<CompositionMode>("default");
  const [toggleComposition, setToggleComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customInputSlot, setCustomInputSlot] = useState(false);
  const [customToggleSlot, setCustomToggleSlot] = useState(false);
  const [customIconSlot, setCustomIconSlot] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();
  const { refs, setPartRef } = usePartRefs();

  return {
    state: {
      controlled,
      visible,
      disabled,
      invalid,
      required,
      readOnly,
      fieldWrapped,
      inputComposition,
      toggleComposition,
      propCheck,
      customInputSlot,
      customToggleSlot,
      customIconSlot,
      refs,
      log,
    },
    actions: {
      setControlled,
      setDisabled,
      setInvalid,
      setRequired,
      setReadOnly,
      setFieldWrapped,
      setInputComposition,
      setToggleComposition,
      setPropCheck,
      setCustomInputSlot,
      setCustomToggleSlot,
      setCustomIconSlot,
      setPartRef,
      clearLog,
      setVisible: (next: boolean) => {
        setVisible(next);
        addLog(`visible changed to ${String(next)}`);
      },
      noteToggle: () => addLog("toggle clicked"),
    },
  };
}

function useOTPFieldScenario() {
  const [controlled, setControlled] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [length, setLength] = useState(6);
  const [type, setType] = useState<"numeric" | "alphanumeric">("numeric");
  const [mask, setMask] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [formOwner, setFormOwner] = useState(false);
  const [autoFocus, setAutoFocus] = useState(false);
  const [ariaLabel, setAriaLabel] = useState(true);
  const [value, setValue] = useState("123");
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [inputComposition, setInputComposition] = useState<CompositionMode>("default");
  const [separatorComposition, setSeparatorComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customInputSlot, setCustomInputSlot] = useState(false);
  const [customSeparatorSlot, setCustomSeparatorSlot] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();
  const { refs, setPartRef } = usePartRefs();

  return {
    state: {
      controlled,
      disabled,
      invalid,
      required,
      readOnly,
      length,
      type,
      mask,
      autoSubmit,
      formOwner,
      autoFocus,
      ariaLabel,
      value,
      rootComposition,
      inputComposition,
      separatorComposition,
      propCheck,
      customRootSlot,
      customInputSlot,
      customSeparatorSlot,
      refs,
      log,
    },
    actions: {
      setControlled,
      setDisabled,
      setInvalid,
      setRequired,
      setReadOnly,
      setLength: (next: number) => {
        setLength(next);
        setValue((current) => current.slice(0, next));
      },
      setType,
      setMask,
      setAutoSubmit,
      setFormOwner,
      setAutoFocus,
      setAriaLabel,
      setRootComposition,
      setInputComposition,
      setSeparatorComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomInputSlot,
      setCustomSeparatorSlot,
      setPartRef,
      clearLog,
      setValue: (next: string) => {
        setValue(next);
        addLog(`value changed to ${next || "empty"}`);
      },
      noteComplete: (next: string) => addLog(`complete ${next}`),
      noteSubmit: () => addLog("form submitted"),
    },
  };
}

function createSampleFile(name: string, size: number, type = "text/plain") {
  return new File(["x".repeat(size)], name, { type });
}

type FileUploadAcceptMode = "any" | "images" | "text";

function getFileUploadAccept(mode: FileUploadAcceptMode) {
  if (mode === "images") return "image/*";
  if (mode === "text") return "text/plain,.txt";
  return undefined;
}

function useFileUploadScenario() {
  const [files, setFiles] = useState<File[]>([createSampleFile("brief.txt", 1024)]);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [multiple, setMultiple] = useState(true);
  const [appendFiles, setAppendFiles] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [maxFiles, setMaxFiles] = useState(3);
  const [maxSize, setMaxSize] = useState(10485760);
  const [acceptMode, setAcceptMode] = useState<FileUploadAcceptMode>("any");
  const [rejectJson, setRejectJson] = useState(false);
  const [formOwner, setFormOwner] = useState(false);
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [triggerComposition, setTriggerComposition] = useState<CompositionMode>("default");
  const [dropzoneComposition, setDropzoneComposition] = useState<CompositionMode>("default");
  const [itemComposition, setItemComposition] = useState<CompositionMode>("default");
  const [itemNameComposition, setItemNameComposition] = useState<CompositionMode>("default");
  const [itemSizeComposition, setItemSizeComposition] = useState<CompositionMode>("default");
  const [itemDeleteComposition, setItemDeleteComposition] = useState<CompositionMode>("default");
  const [propCheck, setPropCheck] = useState(false);
  const [customRootSlot, setCustomRootSlot] = useState(false);
  const [customHiddenInputSlot, setCustomHiddenInputSlot] = useState(false);
  const [customTriggerSlot, setCustomTriggerSlot] = useState(false);
  const [customDropzoneSlot, setCustomDropzoneSlot] = useState(false);
  const [customItemGroupSlot, setCustomItemGroupSlot] = useState(false);
  const [customItemSlot, setCustomItemSlot] = useState(false);
  const [customItemNameSlot, setCustomItemNameSlot] = useState(false);
  const [customItemSizeSlot, setCustomItemSizeSlot] = useState(false);
  const [customItemDeleteSlot, setCustomItemDeleteSlot] = useState(false);
  const { log, addLog, clearLog } = useScenarioLog();
  const { refs, setPartRef } = usePartRefs();

  return {
    state: {
      files,
      rejectedCount,
      multiple,
      appendFiles,
      disabled,
      invalid,
      required,
      readOnly,
      maxFiles,
      maxSize,
      acceptMode,
      rejectJson,
      formOwner,
      rootComposition,
      triggerComposition,
      dropzoneComposition,
      itemComposition,
      itemNameComposition,
      itemSizeComposition,
      itemDeleteComposition,
      propCheck,
      customRootSlot,
      customHiddenInputSlot,
      customTriggerSlot,
      customDropzoneSlot,
      customItemGroupSlot,
      customItemSlot,
      customItemNameSlot,
      customItemSizeSlot,
      customItemDeleteSlot,
      refs,
      log,
    },
    actions: {
      setMultiple,
      setAppendFiles,
      setDisabled,
      setInvalid,
      setRequired,
      setReadOnly,
      setMaxFiles,
      setMaxSize,
      setAcceptMode,
      setRejectJson,
      setFormOwner,
      setRootComposition,
      setTriggerComposition,
      setDropzoneComposition,
      setItemComposition,
      setItemNameComposition,
      setItemSizeComposition,
      setItemDeleteComposition,
      setPropCheck,
      setCustomRootSlot,
      setCustomHiddenInputSlot,
      setCustomTriggerSlot,
      setCustomDropzoneSlot,
      setCustomItemGroupSlot,
      setCustomItemSlot,
      setCustomItemNameSlot,
      setCustomItemSizeSlot,
      setCustomItemDeleteSlot,
      setPartRef,
      clearLog,
      setFiles: (next: File[]) => {
        if (next.length < files.length) {
          const removed = files.find((file) => !next.includes(file));
          addLog(`file removed ${removed?.name ?? "unknown"}`);
        } else if (next.length > files.length) {
          addLog(`files added ${next.length - files.length}`);
        }
        setFiles(next);
        addLog(`files ${next.length}`);
      },
      setRejectedFiles: (next: FileUploadRejectedFile[]) => {
        setRejectedCount(next.length);
        if (next.length > 0) {
          addLog(`rejected ${next.length}: ${next.map((item) => `${item.file.name} (${item.errors.join(", ")})`).join("; ")}`);
        }
      },
      addSample: () => {
        if (disabled || readOnly) {
          addLog("sample blocked inactive");
          return;
        }
        const nextFile = createSampleFile(`sample-${files.length + 1}.txt`, 512 + files.length * 256);
        const nextFiles = multiple ? [...files, nextFile].slice(0, maxFiles) : [nextFile];
        setFiles(nextFiles);
        addLog(`sample added ${nextFile.name}`);
      },
      clearFiles: () => {
        if (disabled || readOnly) {
          addLog("clear blocked inactive");
          return;
        }
        setFiles([]);
        setRejectedCount(0);
        addLog("files cleared");
      },
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
          <MenuRadioControl label="Control" options={fieldControlOptions} value={scenario.state.controlType} onChange={scenario.actions.setControlType} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.composition} onChange={scenario.actions.setComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customLabelSlot, label: "Label Slot", value: "label-slot", onChange: scenario.actions.setCustomLabelSlot },
            { checked: scenario.state.customIndicatorSlot, label: "Indicator Slot", value: "indicator-slot", onChange: scenario.actions.setCustomIndicatorSlot },
            { checked: scenario.state.customDescriptionSlot, label: "Description Slot", value: "description-slot", onChange: scenario.actions.setCustomDescriptionSlot },
            { checked: scenario.state.customErrorSlot, label: "Error Slot", value: "error-slot", onChange: scenario.actions.setCustomErrorSlot },
          ]}
        />
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
          <MenuRadioControl label="Controls" options={fieldsetControlOptions} value={scenario.state.controlType} onChange={scenario.actions.setControlType} />
          <MenuCheckboxControl checked={scenario.state.forceError} label="Force Error" value="force-error" onChange={scenario.actions.setForceError} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customLegendSlot, label: "Legend Slot", value: "legend-slot", onChange: scenario.actions.setCustomLegendSlot },
            { checked: scenario.state.customDescriptionSlot, label: "Description Slot", value: "description-slot", onChange: scenario.actions.setCustomDescriptionSlot },
            { checked: scenario.state.customErrorSlot, label: "Error Slot", value: "error-slot", onChange: scenario.actions.setCustomErrorSlot },
          ]}
        />
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
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            {
              checked: scenario.state.customRootSlot,
              label: "Root Slot",
              value: "custom-root-slot",
              onChange: scenario.actions.setCustomRootSlot,
            },
            {
              checked: scenario.state.customClearSlot,
              label: "Clear Slot",
              value: "custom-clear-slot",
              onChange: scenario.actions.setCustomClearSlot,
            },
          ]}
        />
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
          <MenuCheckboxControl checked={scenario.state.fieldWrapped} label="Use Field" value="field" onChange={scenario.actions.setFieldWrapped} />
          <MenuCheckboxControl checked={scenario.state.autoResize} label="Auto Resize" value="auto-resize" onChange={scenario.actions.setAutoResize} />
          <MenuCheckboxControl checked={scenario.state.withMaxLength} label="Max Length" value="max-length" onChange={scenario.actions.setWithMaxLength} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customCountSlot, label: "Count Slot", value: "count-slot", onChange: scenario.actions.setCustomCountSlot },
          ]}
        />
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
          {scenario.state.controlled ? (
            <MenuRadioControl label="Set Value" options={numberValueOptions} value={String(scenario.state.value ?? "empty")} onChange={(next) => scenario.actions.setValue(next === "empty" ? null : Number(next))} />
          ) : null}
          <MenuCheckboxControl checked={scenario.state.fieldWrapped} label="Use Field" value="field" onChange={scenario.actions.setFieldWrapped} />
          <MenuCheckboxControl checked={scenario.state.clampOnBlur} label="Clamp On Blur" value="clamp" onChange={scenario.actions.setClampOnBlur} />
          <MenuCheckboxControl checked={scenario.state.formatted} label="Formatted" value="formatted" onChange={scenario.actions.setFormatted} />
          <MenuCheckboxControl checked={scenario.state.customLargeStep} label="Large Step 5" value="large-step" onChange={scenario.actions.setCustomLargeStep} />
          <MenuCheckboxControl checked={scenario.state.precision} label="Precision 2" value="precision" onChange={scenario.actions.setPrecision} />
          <MenuCheckboxControl checked={scenario.state.withHiddenInput} label="Hidden Input" value="hidden-input" onChange={scenario.actions.setWithHiddenInput} />
          <MenuCheckboxControl checked={scenario.state.withFormOwner} label="Form Owner" value="form-owner" onChange={scenario.actions.setWithFormOwner} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
          ]}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "password-toggle-field") {
    const scenario = scenarios.passwordToggleField;
    return (
      <ControlToolbar label="Password Toggle Field controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          {scenario.state.controlled ? (
            <MenuCheckboxControl checked={scenario.state.visible} label="Visible" value="visible" onChange={scenario.actions.setVisible} />
          ) : null}
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
          <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read Only" value="readonly" onChange={scenario.actions.setReadOnly} />
          <MenuCheckboxControl checked={scenario.state.fieldWrapped} label="Use Field" value="use-field" onChange={scenario.actions.setFieldWrapped} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Input" options={compositionOptions} value={scenario.state.inputComposition} onChange={scenario.actions.setInputComposition} />
          <MenuRadioControl label="Toggle" options={compositionOptions} value={scenario.state.toggleComposition} onChange={scenario.actions.setToggleComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customInputSlot, label: "Input Slot", value: "input-slot", onChange: scenario.actions.setCustomInputSlot },
            { checked: scenario.state.customToggleSlot, label: "Toggle Slot", value: "toggle-slot", onChange: scenario.actions.setCustomToggleSlot },
            { checked: scenario.state.customIconSlot, label: "Icon Slot", value: "icon-slot", onChange: scenario.actions.setCustomIconSlot },
          ]}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "otp-field") {
    const scenario = scenarios.otpField;
    return (
      <ControlToolbar label="OTP Field controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.controlled} label="Controlled" value="controlled" onChange={scenario.actions.setControlled} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
          <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read Only" value="readonly" onChange={scenario.actions.setReadOnly} />
          <MenuCheckboxControl checked={scenario.state.autoSubmit} label="Auto Submit" value="auto-submit" onChange={scenario.actions.setAutoSubmit} />
        </ToolbarGroup>
        <ToolbarGroup title="Value" value="value">
          <MenuRadioControl label="Length" options={otpLengthOptions} value={String(scenario.state.length)} onChange={(next) => scenario.actions.setLength(Number(next))} />
          <MenuRadioControl label="Type" options={otpTypeOptions} value={scenario.state.type} onChange={(next) => scenario.actions.setType(next as "numeric" | "alphanumeric")} />
          <MenuCheckboxControl checked={scenario.state.mask} label="Mask" value="mask" onChange={scenario.actions.setMask} />
          <MenuCheckboxControl checked={scenario.state.autoFocus} label="Auto Focus" value="auto-focus" onChange={scenario.actions.setAutoFocus} />
          <MenuCheckboxControl checked={scenario.state.ariaLabel} label="Aria Label" value="aria-label" onChange={scenario.actions.setAriaLabel} />
          <MenuCheckboxControl checked={scenario.state.formOwner} label="Form Owner" value="form-owner" onChange={scenario.actions.setFormOwner} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="Input" options={compositionOptions} value={scenario.state.inputComposition} onChange={scenario.actions.setInputComposition} />
          <MenuRadioControl label="Separator" options={compositionOptions} value={scenario.state.separatorComposition} onChange={scenario.actions.setSeparatorComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customInputSlot, label: "Input Slot", value: "input-slot", onChange: scenario.actions.setCustomInputSlot },
            { checked: scenario.state.customSeparatorSlot, label: "Separator Slot", value: "separator-slot", onChange: scenario.actions.setCustomSeparatorSlot },
          ]}
        />
      </ControlToolbar>
    );
  }

  if (scenarioId === "file-upload") {
    const scenario = scenarios.fileUpload;
    return (
      <ControlToolbar label="File Upload controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.multiple} label="Multiple" value="multiple" onChange={scenario.actions.setMultiple} />
          <MenuCheckboxControl checked={scenario.state.appendFiles} label="Append Files" value="append-files" onChange={scenario.actions.setAppendFiles} />
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
          <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read Only" value="readonly" onChange={scenario.actions.setReadOnly} />
          <MenuCheckboxControl checked={scenario.state.formOwner} label="Form Owner" value="form-owner" onChange={scenario.actions.setFormOwner} />
        </ToolbarGroup>
        <ToolbarGroup title="Rules" value="rules">
          <MenuRadioControl label="Accept" options={fileUploadAcceptOptions} value={scenario.state.acceptMode} onChange={(next) => scenario.actions.setAcceptMode(next as FileUploadAcceptMode)} />
          <MenuCheckboxControl checked={scenario.state.rejectJson} label="Reject JSON" value="reject-json" onChange={scenario.actions.setRejectJson} />
          <MenuRadioControl label="Max Files" options={maxFileOptions} value={String(scenario.state.maxFiles)} onChange={(next) => scenario.actions.setMaxFiles(Number(next))} />
          <MenuRadioControl label="Max Size" options={maxSizeOptions} value={String(scenario.state.maxSize)} onChange={(next) => scenario.actions.setMaxSize(Number(next))} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="Trigger" options={compositionOptions} value={scenario.state.triggerComposition} onChange={scenario.actions.setTriggerComposition} />
          <MenuRadioControl label="Dropzone" options={compositionOptions} value={scenario.state.dropzoneComposition} onChange={scenario.actions.setDropzoneComposition} />
          <MenuRadioControl label="Item" options={compositionOptions} value={scenario.state.itemComposition} onChange={scenario.actions.setItemComposition} />
          <MenuRadioControl label="Item Name" options={compositionOptions} value={scenario.state.itemNameComposition} onChange={scenario.actions.setItemNameComposition} />
          <MenuRadioControl label="Item Size" options={compositionOptions} value={scenario.state.itemSizeComposition} onChange={scenario.actions.setItemSizeComposition} />
          <MenuRadioControl label="Delete Button" options={compositionOptions} value={scenario.state.itemDeleteComposition} onChange={scenario.actions.setItemDeleteComposition} />
        </ToolbarGroup>
        <PropsToolbarGroup
          propCheck={scenario.state.propCheck}
          onPropCheckChange={scenario.actions.setPropCheck}
          customSlots={[
            { checked: scenario.state.customRootSlot, label: "Root Slot", value: "root-slot", onChange: scenario.actions.setCustomRootSlot },
            { checked: scenario.state.customHiddenInputSlot, label: "Hidden Input Slot", value: "hidden-input-slot", onChange: scenario.actions.setCustomHiddenInputSlot },
            { checked: scenario.state.customTriggerSlot, label: "Trigger Slot", value: "trigger-slot", onChange: scenario.actions.setCustomTriggerSlot },
            { checked: scenario.state.customDropzoneSlot, label: "Dropzone Slot", value: "dropzone-slot", onChange: scenario.actions.setCustomDropzoneSlot },
            { checked: scenario.state.customItemGroupSlot, label: "Item Group Slot", value: "item-group-slot", onChange: scenario.actions.setCustomItemGroupSlot },
            { checked: scenario.state.customItemSlot, label: "Item Slot", value: "item-slot", onChange: scenario.actions.setCustomItemSlot },
            { checked: scenario.state.customItemNameSlot, label: "Item Name Slot", value: "item-name-slot", onChange: scenario.actions.setCustomItemNameSlot },
            { checked: scenario.state.customItemSizeSlot, label: "Item Size Slot", value: "item-size-slot", onChange: scenario.actions.setCustomItemSizeSlot },
            { checked: scenario.state.customItemDeleteSlot, label: "Delete Button Slot", value: "delete-button-slot", onChange: scenario.actions.setCustomItemDeleteSlot },
          ]}
        />
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
  if (scenarioId === "otp-field") return <OTPFieldCanvas scenario={scenarios.otpField} />;
  if (scenarioId === "file-upload") return <FileUploadCanvas scenario={scenarios.fileUpload} />;
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
    ...partProps("root", { customSlot: state.customRootSlot, propCheck: state.propCheck }, "field-custom"),
  };
  const children = (
    <>
      <Field.Label
        {...partProps("label", { customSlot: state.customLabelSlot, propCheck: state.propCheck }, "field-label-custom")}
        requiredIndicator={null}
      >
        Email
        <Field.RequiredIndicator
          {...partProps("required-indicator", { customSlot: state.customIndicatorSlot, propCheck: state.propCheck }, "field-required-indicator-custom")}
          fallback=" (optional)"
        />
      </Field.Label>
      {state.controlType === "atom" ? (
        <Input.Root
          className="field-control"
          id="field-email-control"
          data-playground-inspect=""
          value={state.value}
          onBlur={scenario.actions.noteBlur}
          onFocus={scenario.actions.noteFocus}
          onValueChange={(next) => {
            scenario.actions.setValue(next);
            scenario.actions.noteValue(next);
          }}
        />
      ) : (
        <input
          aria-invalid={state.invalid || undefined}
          aria-readonly={state.readOnly || undefined}
          aria-required={state.required || undefined}
          className="field-control"
          id="field-email-control"
          data-playground-inspect=""
          disabled={state.disabled}
          onBlur={scenario.actions.noteBlur}
          onChange={(event) => {
            scenario.actions.setValue(event.target.value);
            scenario.actions.noteValue(event.target.value);
          }}
          onFocus={scenario.actions.noteFocus}
          readOnly={state.readOnly}
          required={state.required}
          value={state.value}
        />
      )}
      <Field.Description {...partProps("description", { customSlot: state.customDescriptionSlot, propCheck: state.propCheck }, "field-description-custom")}>Use a work email address.</Field.Description>
      <Field.Error {...partProps("error", { customSlot: state.customErrorSlot, propCheck: state.propCheck }, "field-error-custom")} forceMatch={state.forceError}>Field is invalid.</Field.Error>
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
    ref: scenario.actions.setPartRef("root"),
    ...partProps("root", { customSlot: state.customRootSlot, propCheck: state.propCheck }, "fieldset-custom"),
  };
  const children = (
    <>
      <FieldsetLegend customSlot={state.customLegendSlot} mode={state.legendComposition} propCheck={state.propCheck} refTarget={scenario.actions.setPartRef("legend")} />
      <FieldsetDescription customSlot={state.customDescriptionSlot} mode={state.descriptionComposition} propCheck={state.propCheck} refTarget={scenario.actions.setPartRef("description")} />
      <FieldsetChoiceControls scenario={scenario} />
      <FieldsetError customSlot={state.customErrorSlot} mode={state.errorComposition} forceMatch={state.forceError} propCheck={state.propCheck} refTarget={scenario.actions.setPartRef("error")} />
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

function FieldsetChoiceControls({ scenario }: { scenario: ReturnType<typeof useFieldsetScenario> }) {
  const state = scenario.state;

  if (state.controlType === "atom") {
    return (
      <RadioGroup.Root
        ariaLabel="Contact preference"
        className="field-option-row"
        disabled={state.disabled}
        invalid={state.invalid}
        name="contact-preference"
        onValueChange={scenario.actions.setChoice}
        orientation="horizontal"
        required={state.required}
        value={state.choice}
      >
        {choiceOptions.map((option) => (
          <RadioGroup.Radio
            className="field-option atom-fieldset-radio"
            key={option}
            value={option}
          >
            <span className="atom-fieldset-radio-dot" aria-hidden="true" />
            <span>{formatOption(option)}</span>
          </RadioGroup.Radio>
        ))}
      </RadioGroup.Root>
    );
  }

  return (
    <div className="field-option-row">
      {choiceOptions.map((option) => (
        <label className="field-option" key={option}>
          <input
            checked={state.choice === option}
            disabled={state.disabled}
            name="contact-preference"
            onChange={() => scenario.actions.setChoice(option)}
            required={state.required}
            type="radio"
            value={option}
          />
          <span>{formatOption(option)}</span>
        </label>
      ))}
    </div>
  );
}

function FieldsetLegend({
  customSlot,
  mode,
  propCheck,
  refTarget,
}: {
  customSlot: boolean;
  mode: CompositionMode;
  propCheck: boolean;
  refTarget: (node: Element | null) => void;
}) {
  const props = partProps("legend", { customSlot, propCheck }, "fieldset-legend-custom");

  if (mode === "asChild") {
    return (
      <Fieldset.Legend asChild {...props} ref={refTarget}>
        <legend>Contact preference</legend>
      </Fieldset.Legend>
    );
  }

  if (mode === "render") {
    return (
      <Fieldset.Legend {...props} ref={refTarget} render={(props) => <legend {...props} />}>
        Contact preference
      </Fieldset.Legend>
    );
  }

  return <Fieldset.Legend {...props} ref={refTarget}>Contact preference</Fieldset.Legend>;
}

function FieldsetDescription({
  customSlot,
  mode,
  propCheck,
  refTarget,
}: {
  customSlot: boolean;
  mode: CompositionMode;
  propCheck: boolean;
  refTarget: (node: Element | null) => void;
}) {
  const props = partProps("description", { customSlot, propCheck }, "fieldset-description-custom");

  if (mode === "asChild") {
    return (
      <Fieldset.Description asChild {...props} ref={refTarget}>
        <p>Pick one contact method.</p>
      </Fieldset.Description>
    );
  }

  if (mode === "render") {
    return (
      <Fieldset.Description {...props} ref={refTarget} render={(props) => <p {...props} />}>
        Pick one contact method.
      </Fieldset.Description>
    );
  }

  return <Fieldset.Description {...props} ref={refTarget}>Pick one contact method.</Fieldset.Description>;
}

function FieldsetError({
  customSlot,
  forceMatch,
  mode,
  propCheck,
  refTarget,
}: {
  customSlot: boolean;
  forceMatch: boolean;
  mode: CompositionMode;
  propCheck: boolean;
  refTarget: (node: Element | null) => void;
}) {
  const props = partProps("error", { customSlot, propCheck }, "fieldset-error-custom");

  if (mode === "asChild") {
    return (
      <Fieldset.Error asChild {...props} forceMatch={forceMatch} ref={refTarget}>
        <p>Choose one contact method.</p>
      </Fieldset.Error>
    );
  }

  if (mode === "render") {
    return (
      <Fieldset.Error {...props} forceMatch={forceMatch} ref={refTarget} render={(props) => <p {...props} />}>
        Choose one contact method.
      </Fieldset.Error>
    );
  }

  return <Fieldset.Error {...props} forceMatch={forceMatch} ref={refTarget}>Choose one contact method.</Fieldset.Error>;
}

function InputCanvas({ scenario }: { scenario: ReturnType<typeof useInputScenario> }) {
  const state = scenario.state;
  const input = (
    <div className="input-demo-row">
      <Input.Root
        aria-label={state.fieldWrapped ? undefined : "Project name"}
        {...partProps("root", { customSlot: state.customRootSlot, propCheck: state.propCheck }, "input-custom")}
        defaultValue={state.controlled ? undefined : "Atom"}
        disabled={state.disabled}
        invalid={state.invalid}
        name="project-name"
        onBlur={scenario.actions.noteBlur}
        onChange={scenario.actions.noteChange}
        onFocus={scenario.actions.noteFocus}
        onValueChange={scenario.actions.setValue}
        placeholder="Project name"
        readOnly={state.readOnly}
        ref={scenario.actions.setPartRef("root")}
        required={state.required}
        type="text"
        value={state.controlled ? state.value : undefined}
      >
        <InputClearButton
          customSlot={state.customClearSlot}
          mode={state.clearComposition}
          onClear={scenario.actions.noteClear}
          propCheck={state.propCheck}
          refTarget={scenario.actions.setPartRef("clear")}
        />
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
  customSlot,
  mode,
  onClear,
  propCheck,
  refTarget,
}: {
  customSlot: boolean;
  mode: CompositionMode;
  onClear: () => void;
  propCheck: boolean;
  refTarget: (node: Element | null) => void;
}) {
  const props = partProps("clear", { customSlot, propCheck }, "input-clear-custom");

  if (mode === "asChild") {
    return (
      <Input.Clear asChild {...props} onClear={onClear} ref={refTarget}>
        <span>Clear</span>
      </Input.Clear>
    );
  }

  if (mode === "render") {
    return (
      <Input.Clear
        {...props}
        onClear={onClear}
        ref={refTarget}
        render={(props) => <button {...props} />}
      >
        Clear
      </Input.Clear>
    );
  }

  return <Input.Clear {...props} onClear={onClear} ref={refTarget}>Clear</Input.Clear>;
}

function TextareaCanvas({ scenario }: { scenario: ReturnType<typeof useTextareaScenario> }) {
  const state = scenario.state;
  const countRef = scenario.actions.setPartRef("count");
  const count = state.countComposition === "asChild"
    ? (
      <Textarea.Count asChild {...partProps("count", { customSlot: state.customCountSlot, propCheck: state.propCheck }, "textarea-count-custom")} ref={countRef}>
        <span />
      </Textarea.Count>
    )
    : state.countComposition === "render"
      ? <Textarea.Count {...partProps("count", { customSlot: state.customCountSlot, propCheck: state.propCheck }, "textarea-count-custom")} ref={countRef} render={(props) => <output {...props} />} />
      : <Textarea.Count {...partProps("count", { customSlot: state.customCountSlot, propCheck: state.propCheck }, "textarea-count-custom")} ref={countRef} />;

  const textarea = (
    <Textarea.Root
      aria-label={state.fieldWrapped ? undefined : "Notes"}
      autoResize={state.autoResize}
      className="textarea-demo-control"
      key={state.controlled ? "controlled" : "uncontrolled"}
      {...partProps("root", { customSlot: state.customRootSlot, propCheck: state.propCheck }, "textarea-custom")}
      defaultValue={state.controlled ? undefined : state.value}
      disabled={state.disabled}
      invalid={state.invalid}
      maxLength={state.withMaxLength ? 80 : undefined}
      minRows={3}
      name="notes"
      onValueChange={scenario.actions.setValue}
      readOnly={state.readOnly}
      ref={scenario.actions.setPartRef("root")}
      required={state.required}
      value={state.controlled ? state.value : undefined}
    >
      {count}
    </Textarea.Root>
  );

  if (!state.fieldWrapped) {
    return <div className="field-demo textarea-standalone-demo">{textarea}</div>;
  }

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
      {textarea}
      <Field.Description>Counter follows the textarea value.</Field.Description>
      <Field.Error forceMatch={state.invalid}>Notes have an error.</Field.Error>
    </Field.Root>
  );
}

function NumberInputCanvas({ scenario }: { scenario: ReturnType<typeof useNumberInputScenario> }) {
  const state = scenario.state;

  const numberInput = (
    <NumberInput.Root
      ariaDescribedBy={state.fieldWrapped ? "number-input-seats-description" : undefined}
      ariaLabel="Seats"
      ariaValueText={(value) => `${value} seats`}
      className="number-input-demo"
      clampOnBlur={state.clampOnBlur}
      {...partProps("root", { customSlot: state.customRootSlot, propCheck: state.propCheck }, "number-input-custom")}
      defaultValue={state.controlled ? undefined : state.value ?? undefined}
      disabled={state.disabled}
      form={state.withHiddenInput && state.withFormOwner ? "number-input-demo-form" : undefined}
      formatter={state.formatted ? (value) => `${value} seats` : undefined}
      id="number-input-seats-control"
      inputClassName="number-input-control"
      invalid={state.invalid}
      key={`${state.controlled ? "controlled" : "uncontrolled"}-${state.formatted ? "formatted" : "plain"}-${state.precision ? "precision" : "inferred"}`}
      largeStep={state.customLargeStep ? 5 : undefined}
      max={10}
      min={0}
      name={state.withHiddenInput ? "seats" : undefined}
      onValueChange={scenario.actions.setValue}
      parser={state.formatted ? (value) => value.replace(/[^\d.-]/g, "") : undefined}
      placeholder="0"
      precision={state.precision ? 2 : undefined}
      ref={scenario.actions.markRootRef}
      readOnly={state.readOnly}
      required={state.required}
      step={1}
      value={state.controlled ? state.value : undefined}
    >
      {(renderState) => (
        <div className="number-stepper">
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
  );

  if (!state.fieldWrapped) {
    return (
      <div className="field-demo number-input-standalone-demo">
        {numberInput}
        {state.withHiddenInput && state.withFormOwner ? <form hidden id="number-input-demo-form" /> : null}
      </div>
    );
  }

  return (
    <Field.Root
      className="field-demo"
      id="number-input-seats"
      disabled={state.disabled}
      invalid={state.invalid}
      readOnly={state.readOnly}
      required={state.required}
    >
      <Field.Label>Seats</Field.Label>
      {numberInput}
      <Field.Description id="number-input-seats-description">Use arrow keys, buttons, Page Up, Page Down, Home, and End.</Field.Description>
      <Field.Error forceMatch={state.invalid}>Seats value has an error.</Field.Error>
      <form hidden id="number-input-demo-form" />
    </Field.Root>
  );
}

function PasswordToggleFieldCanvas({ scenario }: { scenario: ReturnType<typeof usePasswordToggleFieldScenario> }) {
  const state = scenario.state;
  const inputSharedProps = {
    "aria-label": state.fieldWrapped ? undefined : "Password",
    "aria-describedby": state.fieldWrapped ? (state.invalid ? "password-field-description password-field-error" : "password-field-description") : undefined,
    id: state.fieldWrapped ? "password-field-control" : undefined,
    ...partProps("input", { customSlot: state.customInputSlot, propCheck: state.propCheck }, "password-toggle-field-input-custom"),
    ref: scenario.actions.setPartRef("input"),
  };
  const input = state.inputComposition === "asChild"
    ? (
      <PasswordToggleField.Input asChild {...inputSharedProps}>
        <input className="password-toggle-input-child" />
      </PasswordToggleField.Input>
    )
    : state.inputComposition === "render"
      ? (
        <PasswordToggleField.Input
          {...inputSharedProps}
          render={(props) => <input {...props} />}
        />
      )
      : <PasswordToggleField.Input {...inputSharedProps} />;
  const toggle = state.toggleComposition === "asChild"
    ? (
      <PasswordToggleField.Toggle asChild {...partProps("toggle", { customSlot: state.customToggleSlot, propCheck: state.propCheck }, "password-toggle-field-toggle-custom")} onClick={scenario.actions.noteToggle} ref={scenario.actions.setPartRef("toggle")}>
        <button className="password-toggle-button-child">
          <PasswordToggleField.Icon {...partProps("icon", { customSlot: state.customIconSlot, propCheck: state.propCheck }, "password-toggle-field-icon-custom")} hidden="Show" ref={scenario.actions.setPartRef("icon")} visible="Hide" />
        </button>
      </PasswordToggleField.Toggle>
    )
    : state.toggleComposition === "render"
      ? (
        <PasswordToggleField.Toggle
          {...partProps("toggle", { customSlot: state.customToggleSlot, propCheck: state.propCheck }, "password-toggle-field-toggle-custom")}
          onClick={scenario.actions.noteToggle}
          ref={scenario.actions.setPartRef("toggle")}
          render={(props) => <button {...props} />}
        >
          <PasswordToggleField.Icon {...partProps("icon", { customSlot: state.customIconSlot, propCheck: state.propCheck }, "password-toggle-field-icon-custom")} hidden="Show" ref={scenario.actions.setPartRef("icon")} visible="Hide" />
        </PasswordToggleField.Toggle>
      )
      : (
        <PasswordToggleField.Toggle {...partProps("toggle", { customSlot: state.customToggleSlot, propCheck: state.propCheck }, "password-toggle-field-toggle-custom")} onClick={scenario.actions.noteToggle} ref={scenario.actions.setPartRef("toggle")}>
          <PasswordToggleField.Icon {...partProps("icon", { customSlot: state.customIconSlot, propCheck: state.propCheck }, "password-toggle-field-icon-custom")} hidden="Show" ref={scenario.actions.setPartRef("icon")} visible="Hide" />
        </PasswordToggleField.Toggle>
      );

  const passwordField = (
    <PasswordToggleField.Root
      defaultVisible={false}
      disabled={state.disabled}
      invalid={state.invalid}
      onVisibleChange={scenario.actions.setVisible}
      readOnly={state.readOnly}
      required={state.required}
      visible={state.controlled ? state.visible : undefined}
    >
      <div className="password-demo-row">
        {input}
        {toggle}
      </div>
    </PasswordToggleField.Root>
  );

  if (!state.fieldWrapped) {
    return passwordField;
  }

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
      {passwordField}
      <Field.Description id="password-field-description">Toggle changes the input type and icon state.</Field.Description>
      <Field.Error forceMatch={state.invalid}>Password has an error.</Field.Error>
    </Field.Root>
  );
}

function OTPFieldCanvas({ scenario }: { scenario: ReturnType<typeof useOTPFieldScenario> }) {
  const state = scenario.state;
  const splitIndex = Math.ceil(state.length / 2);
  const cells = Array.from({ length: state.length }, (_, index) => index).flatMap((index) => {
    const input = (
      <OTPFieldInput
        customSlot={state.customInputSlot}
        mode={state.inputComposition}
        index={index}
        key={`input-${index}`}
        propCheck={state.propCheck}
        refTarget={scenario.actions.setPartRef(`input-${index}`)}
      />
    );
    if (state.length <= 4 || index !== splitIndex - 1) return [input];
    return [
      input,
      <OTPFieldSeparator
        customSlot={state.customSeparatorSlot}
        mode={state.separatorComposition}
        key="separator"
        propCheck={state.propCheck}
        refTarget={scenario.actions.setPartRef("separator")}
      />,
    ];
  });

  const content = (
    <>
      {cells}
    </>
  );
  const rootProps = {
    ariaDescribedBy: state.invalid ? "otp-code-description otp-code-error" : "otp-code-description",
    ariaLabel: state.ariaLabel ? "Verification code" : undefined,
    autoFocus: state.autoFocus,
    autoSubmit: state.autoSubmit,
    className: "playground-otp",
    ...partProps("root", { customSlot: state.customRootSlot, propCheck: state.propCheck }, "otp-field-custom"),
    disabled: state.disabled,
    form: state.formOwner ? "otp-demo-form" : undefined,
    invalid: state.invalid,
    length: state.length,
    mask: state.mask,
    name: "code",
    onComplete: scenario.actions.noteComplete,
    onValueChange: scenario.actions.setValue,
    readOnly: state.readOnly,
    ref: scenario.actions.setPartRef("root"),
    required: state.required,
    type: state.type,
    ...(state.controlled ? { value: state.value } : { defaultValue: state.value }),
  };
  const otpRoot = state.rootComposition === "asChild" ? (
    <OTPField.Root {...rootProps} asChild>
      <section>{content}</section>
    </OTPField.Root>
  ) : state.rootComposition === "render" ? (
    <OTPField.Root {...rootProps} render={(props) => <section {...props} />}>
      {content}
    </OTPField.Root>
  ) : (
    <OTPField.Root {...rootProps}>{content}</OTPField.Root>
  );

  return (
    <form
      id="otp-demo-form"
      onSubmit={(event) => {
        event.preventDefault();
        scenario.actions.noteSubmit();
      }}
    >
      <Field.Root
        className="field-demo"
        id="otp-code"
        disabled={state.disabled}
        invalid={state.invalid}
        required={state.required}
        readOnly={state.readOnly}
      >
        <Field.Label>Verification code</Field.Label>
        {otpRoot}
        <Field.Description id="otp-code-description">Type or paste the code.</Field.Description>
        <Field.Error forceMatch={state.invalid}>Code has an error.</Field.Error>
      </Field.Root>
    </form>
  );
}

function OTPFieldInput({
  customSlot,
  index,
  mode,
  propCheck,
  refTarget,
}: {
  customSlot: boolean;
  index: number;
  mode: CompositionMode;
  propCheck: boolean;
  refTarget: (node: Element | null) => void;
}) {
  const props = {
    className: "playground-otp-input",
    ...partProps(`input-${index}`, { customSlot, propCheck }, "otp-field-input-custom"),
    index,
  };

  if (mode === "asChild") {
    return (
      <OTPField.Input {...props} asChild ref={refTarget}>
        <input />
      </OTPField.Input>
    );
  }

  if (mode === "render") {
    return <OTPField.Input {...props} ref={refTarget} render={(inputProps) => <input {...inputProps} />} />;
  }

  return <OTPField.Input {...props} ref={refTarget} />;
}

function OTPFieldSeparator({
  customSlot,
  mode,
  propCheck,
  refTarget,
}: {
  customSlot: boolean;
  mode: CompositionMode;
  propCheck: boolean;
  refTarget: (node: Element | null) => void;
}) {
  const props = {
    className: "playground-otp-separator",
    ...partProps("separator", { customSlot, propCheck }, "otp-field-separator-custom"),
  };

  if (mode === "asChild") {
    return (
      <OTPField.Separator {...props} asChild ref={refTarget}>
        <span>-</span>
      </OTPField.Separator>
    );
  }

  if (mode === "render") {
    return <OTPField.Separator {...props} ref={refTarget} render={(separatorProps) => <span {...separatorProps} />}>-</OTPField.Separator>;
  }

  return <OTPField.Separator {...props} ref={refTarget}>-</OTPField.Separator>;
}

function FileUploadCanvas({ scenario }: { scenario: ReturnType<typeof useFileUploadScenario> }) {
  const state = scenario.state;
  const content = (
    <>
      <FileUpload.HiddenInput
        {...partProps("hidden-input", { customSlot: state.customHiddenInputSlot, propCheck: state.propCheck }, "file-upload-hidden-input-custom")}
        ref={scenario.actions.setPartRef("hidden-input")}
      />
      <FileUploadDropzone
        customSlot={state.customDropzoneSlot}
        mode={state.dropzoneComposition}
        propCheck={state.propCheck}
        refTarget={scenario.actions.setPartRef("dropzone")}
      >
        <FileUploadTrigger
          customSlot={state.customTriggerSlot}
          mode={state.triggerComposition}
          propCheck={state.propCheck}
          refTarget={scenario.actions.setPartRef("trigger")}
        />
        <Button.Root className="atom-button secondary" disabled={state.disabled || state.readOnly} onPress={scenario.actions.addSample}>
          Add sample
        </Button.Root>
        <Button.Root className="atom-button secondary" disabled={state.disabled || state.readOnly} onPress={scenario.actions.clearFiles}>
          Clear files
        </Button.Root>
      </FileUploadDropzone>
      <FileUpload.ItemGroup
        className="playground-file-list"
        {...partProps("item-group", { customSlot: state.customItemGroupSlot, propCheck: state.propCheck }, "file-upload-item-group-custom")}
        ref={scenario.actions.setPartRef("item-group")}
      >
        {(file) => (
          <FileUploadItem
            customItemDeleteSlot={state.customItemDeleteSlot}
            customItemNameSlot={state.customItemNameSlot}
            customItemSizeSlot={state.customItemSizeSlot}
            customSlot={state.customItemSlot}
            file={file}
            itemDeleteComposition={state.itemDeleteComposition}
            itemNameComposition={state.itemNameComposition}
            itemSizeComposition={state.itemSizeComposition}
            key={`${file.name}-${file.size}`}
            mode={state.itemComposition}
            propCheck={state.propCheck}
            refTargets={{
              item: scenario.actions.setPartRef("item"),
              itemDelete: scenario.actions.setPartRef("item-delete"),
              itemName: scenario.actions.setPartRef("item-name"),
              itemSize: scenario.actions.setPartRef("item-size"),
            }}
          />
        )}
      </FileUpload.ItemGroup>
    </>
  );
  const rootProps = {
    accept: getFileUploadAccept(state.acceptMode),
    appendFiles: state.appendFiles,
    className: "playground-file-upload",
    disabled: state.disabled,
    files: state.files,
    form: state.formOwner ? "file-upload-demo-form" : undefined,
    invalid: state.invalid,
    maxFiles: state.maxFiles,
    maxSize: state.maxSize,
    multiple: state.multiple,
    name: "attachments",
    onFilesChange: scenario.actions.setFiles,
    onRejectedFilesChange: scenario.actions.setRejectedFiles,
    readOnly: state.readOnly,
    required: state.required,
    ref: scenario.actions.setPartRef("root"),
    validateFile: state.rejectJson
      ? (file: File) => file.name.toLowerCase().endsWith(".json") ? "json" : null
      : undefined,
    ...partProps("root", { customSlot: state.customRootSlot, propCheck: state.propCheck }, "file-upload-custom"),
  };

  if (state.rootComposition === "asChild") {
    return (
      <FileUpload.Root {...rootProps} asChild>
        <section>{content}</section>
      </FileUpload.Root>
    );
  }

  if (state.rootComposition === "render") {
    return (
      <FileUpload.Root
        {...rootProps}
        render={(props) => <section {...props} />}
      >
        {content}
      </FileUpload.Root>
    );
  }

  return <FileUpload.Root {...rootProps}>{content}</FileUpload.Root>;
}

function FileUploadDropzone({
  children,
  customSlot,
  mode,
  propCheck,
  refTarget,
}: {
  children: ReactNode;
  customSlot: boolean;
  mode: CompositionMode;
  propCheck: boolean;
  refTarget: (node: Element | null) => void;
}) {
  const props = {
    className: "playground-file-dropzone",
    ...partProps("dropzone", { customSlot, propCheck }, "file-upload-dropzone-custom"),
  };

  if (mode === "asChild") {
    return (
      <FileUpload.Dropzone {...props} asChild ref={refTarget}>
        <section>{children}</section>
      </FileUpload.Dropzone>
    );
  }

  if (mode === "render") {
    return (
      <FileUpload.Dropzone {...props} ref={refTarget} render={(dropzoneProps) => <section {...dropzoneProps} />}>
        {children}
      </FileUpload.Dropzone>
    );
  }

  return <FileUpload.Dropzone {...props} ref={refTarget}>{children}</FileUpload.Dropzone>;
}

function FileUploadTrigger({
  customSlot,
  mode,
  propCheck,
  refTarget,
}: {
  customSlot: boolean;
  mode: CompositionMode;
  propCheck: boolean;
  refTarget: (node: Element | null) => void;
}) {
  const props = {
    className: "atom-button secondary",
    ...partProps("trigger", { customSlot, propCheck }, "file-upload-trigger-custom"),
  };

  if (mode === "asChild") {
    return (
      <FileUpload.Trigger {...props} asChild ref={refTarget}>
        <span>Choose files</span>
      </FileUpload.Trigger>
    );
  }

  if (mode === "render") {
    return (
      <FileUpload.Trigger {...props} ref={refTarget} render={(triggerProps) => <button {...triggerProps} />}>
        Choose files
      </FileUpload.Trigger>
    );
  }

  return <FileUpload.Trigger {...props} ref={refTarget}>Choose files</FileUpload.Trigger>;
}

function FileUploadItem({
  customItemDeleteSlot,
  customItemNameSlot,
  customItemSizeSlot,
  customSlot,
  file,
  itemDeleteComposition,
  itemNameComposition,
  itemSizeComposition,
  mode,
  propCheck,
  refTargets,
}: {
  customItemDeleteSlot: boolean;
  customItemNameSlot: boolean;
  customItemSizeSlot: boolean;
  customSlot: boolean;
  file: File;
  itemDeleteComposition: CompositionMode;
  itemNameComposition: CompositionMode;
  itemSizeComposition: CompositionMode;
  mode: CompositionMode;
  propCheck: boolean;
  refTargets: {
    item: (node: Element | null) => void;
    itemDelete: (node: Element | null) => void;
    itemName: (node: Element | null) => void;
    itemSize: (node: Element | null) => void;
  };
}) {
  const content = (
    <>
      <FileUploadItemName customSlot={customItemNameSlot} mode={itemNameComposition} propCheck={propCheck} refTarget={refTargets.itemName} />
      <FileUploadItemSize customSlot={customItemSizeSlot} mode={itemSizeComposition} propCheck={propCheck} refTarget={refTargets.itemSize} />
      <FileUploadItemDeleteTrigger customSlot={customItemDeleteSlot} mode={itemDeleteComposition} propCheck={propCheck} refTarget={refTargets.itemDelete} />
    </>
  );
  const props = {
    className: "playground-file-item",
    file,
    ...partProps("item", { customSlot, propCheck }, "file-upload-item-custom"),
  };

  if (mode === "asChild") {
    return (
      <FileUpload.Item {...props} asChild ref={refTargets.item}>
        <li>{content}</li>
      </FileUpload.Item>
    );
  }

  if (mode === "render") {
    return (
      <FileUpload.Item {...props} ref={refTargets.item} render={(itemProps) => <li {...itemProps} />}>
        {content}
      </FileUpload.Item>
    );
  }

  return <FileUpload.Item {...props} ref={refTargets.item}>{content}</FileUpload.Item>;
}

function FileUploadItemName({
  customSlot,
  mode,
  propCheck,
  refTarget,
}: {
  customSlot: boolean;
  mode: CompositionMode;
  propCheck: boolean;
  refTarget: (node: Element | null) => void;
}) {
  const props = partProps("item-name", { customSlot, propCheck }, "file-upload-item-name-custom");

  if (mode === "asChild") {
    return (
      <FileUpload.ItemName {...props} asChild ref={refTarget}>
        <span />
      </FileUpload.ItemName>
    );
  }

  if (mode === "render") {
    return <FileUpload.ItemName {...props} ref={refTarget} render={(itemNameProps) => <span {...itemNameProps} />} />;
  }

  return <FileUpload.ItemName {...props} ref={refTarget} />;
}

function FileUploadItemSize({
  customSlot,
  mode,
  propCheck,
  refTarget,
}: {
  customSlot: boolean;
  mode: CompositionMode;
  propCheck: boolean;
  refTarget: (node: Element | null) => void;
}) {
  const props = partProps("item-size", { customSlot, propCheck }, "file-upload-item-size-custom");

  if (mode === "asChild") {
    return (
      <FileUpload.ItemSize {...props} asChild ref={refTarget}>
        <span />
      </FileUpload.ItemSize>
    );
  }

  if (mode === "render") {
    return <FileUpload.ItemSize {...props} ref={refTarget} render={(itemSizeProps) => <span {...itemSizeProps} />} />;
  }

  return <FileUpload.ItemSize {...props} ref={refTarget} />;
}

function FileUploadItemDeleteTrigger({
  customSlot,
  mode,
  propCheck,
  refTarget,
}: {
  customSlot: boolean;
  mode: CompositionMode;
  propCheck: boolean;
  refTarget: (node: Element | null) => void;
}) {
  const props = {
    className: "atom-button secondary",
    ...partProps("item-delete", { customSlot, propCheck }, "file-upload-item-delete-trigger-custom"),
  };

  if (mode === "asChild") {
    return (
      <FileUpload.ItemDeleteTrigger {...props} asChild ref={refTarget}>
        <span>Remove</span>
      </FileUpload.ItemDeleteTrigger>
    );
  }

  if (mode === "render") {
    return (
      <FileUpload.ItemDeleteTrigger {...props} ref={refTarget} render={(deleteProps) => <button {...deleteProps} />}>
        Remove
      </FileUpload.ItemDeleteTrigger>
    );
  }

  return <FileUpload.ItemDeleteTrigger {...props} ref={refTarget}>Remove</FileUpload.ItemDeleteTrigger>;
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
  if (scenarioId === "otp-field") return otpFieldSections(scenarios.otpField.state);
  if (scenarioId === "file-upload") return fileUploadSections(scenarios.fileUpload.state);
  return [];
}

function fieldSections(state: ReturnType<typeof useFieldScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: state.composition,
      selector: "[data-slot='field'], [data-slot='field-custom']",
      rows: [
        { label: "Composition", value: state.composition, category: "composition" },
        { label: "Ref target", value: state.composition === "default" ? "div" : "section", category: "identity" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Read Only", value: bool(state.readOnly), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
        { label: "Orientation", value: state.orientation, category: "state" },
        { label: "Control", value: state.controlType, category: "behavior" },
      ],
    },
    {
      title: "Label",
      summary: state.required ? "required" : "optional",
      selector: "[data-slot='field-label'], [data-slot='field-label-custom']",
      rows: [
        { label: "Text", value: "Email", category: "state" },
        { label: "htmlFor", value: "field-email-control", category: "behavior" },
      ],
      groups: [
        {
          title: "Required Indicator",
          selector: "[data-slot='field-required-indicator'], [data-slot='field-optional-indicator'], [data-slot='field-required-indicator-custom']",
          rows: [
            { label: "State", value: state.required ? "required" : "optional", category: "state" },
          ],
        },
      ],
    },
    partSection("Description", "description", "[data-slot='field-description'], [data-slot='field-description-custom']"),
    {
      ...partSection("Error", state.forceError || state.invalid ? "rendered" : "not rendered", "[data-slot='field-error'], [data-slot='field-error-custom']", !(state.forceError || state.invalid)),
      rows: [
        { label: "Text", value: state.forceError || state.invalid ? "Field is invalid." : "-", category: "state" },
      ],
    },
  ];
}

function fieldsetSections(state: ReturnType<typeof useFieldsetScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: state.composition,
      selector: "[data-slot='fieldset'], [data-slot='fieldset-custom']",
      rows: [
        { label: "Composition", value: state.composition, category: "composition" },
        { label: "Ref target", value: state.refs.root ?? "none", category: "identity" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
      ],
    },
    withRef({
      ...partSection("Legend", state.legendComposition, "[data-slot='fieldset-legend'], [data-slot='fieldset-legend-custom']"),
      rows: [
        { label: "Text", value: "Contact preference", category: "state" },
      ],
    }, state.refs.legend),
    withRef({
      ...partSection("Description", state.descriptionComposition, "[data-slot='fieldset-description'], [data-slot='fieldset-description-custom']"),
      rows: [
        { label: "Text", value: "Pick one contact method.", category: "state" },
      ],
    }, state.refs.description),
    withRef({
      ...partSection("Error", state.forceError || state.invalid ? state.errorComposition : "not rendered", "[data-slot='fieldset-error'], [data-slot='fieldset-error-custom']", !(state.forceError || state.invalid)),
      rows: [
        { label: "Text", value: state.forceError || state.invalid ? "Choose one contact method." : "-", category: "state" },
      ],
    }, state.refs.error),
  ];
}

function inputSections(state: ReturnType<typeof useInputScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: state.value || "empty",
      selector: "[data-slot='input'], [data-slot='input-custom']",
      rows: [
        { label: "Ref target", value: state.refs.root ?? "none", category: "identity" },
        { label: "Controlled", value: bool(state.controlled), category: "state" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Read Only", value: bool(state.readOnly), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
        { label: "Field wrapped", value: bool(state.fieldWrapped), category: "behavior" },
      ],
    },
    withRef({
      ...partSection("Clear", state.value ? state.clearComposition : "hidden", "[data-slot='input-clear'], [data-slot='input-clear-custom']", !state.value || state.disabled || state.readOnly),
      rows: [
        { label: "Exists", value: bool(Boolean(state.value) && !state.disabled && !state.readOnly), category: "presence" },
        { label: "Composition", value: state.clearComposition, category: "composition" },
      ],
    }, state.refs.clear),
  ];
}

function textareaSections(state: ReturnType<typeof useTextareaScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: `${state.value.length} chars`,
      selector: "[data-slot='textarea'], [data-slot='textarea-custom']",
      rows: [
        { label: "Ref target", value: state.refs.root ?? "none", category: "identity" },
        { label: "Controlled", value: bool(state.controlled), category: "state" },
        { label: "Use Field", value: bool(state.fieldWrapped), category: "behavior" },
        { label: "Auto Resize", value: bool(state.autoResize), category: "state" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Read Only", value: bool(state.readOnly), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
      ],
    },
    withRef({
      ...partSection("Count", state.countComposition, "[data-slot='textarea-count'], [data-slot='textarea-count-custom']"),
      rows: [
        { label: "Composition", value: state.countComposition, category: "composition" },
      ],
    }, state.refs.count),
  ];
}

function numberInputSections(state: ReturnType<typeof useNumberInputScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: String(state.value ?? "empty"),
      selector: "[data-slot='number-input'], [data-slot='number-input-custom']",
      rows: [
        { label: "Controlled", value: bool(state.controlled), category: "state" },
        { label: "Value", value: String(state.value ?? "empty"), category: "state" },
        { label: "Default value", value: state.controlled ? "none" : "3", category: "state" },
        { label: "Min", value: "0", category: "state" },
        { label: "Max", value: "10", category: "state" },
        { label: "Step", value: "1", category: "state" },
        { label: "Large step", value: state.customLargeStep ? "5" : "10", category: "state" },
        { label: "Precision", value: state.precision ? "2" : "inferred", category: "state" },
        { label: "Ref target", value: state.rootRef, category: "identity" },
        { label: "Clamp On Blur", value: bool(state.clampOnBlur), category: "behavior" },
        { label: "Use Field", value: bool(state.fieldWrapped), category: "behavior" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Formatted", value: bool(state.formatted), category: "behavior" },
        { label: "Hidden Input", value: bool(state.withHiddenInput), category: "behavior" },
        { label: "Form Owner", value: bool(state.withFormOwner), category: "behavior" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Read Only", value: bool(state.readOnly), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
      ],
    },
    {
      title: "Hidden Input",
      summary: state.withHiddenInput ? String(state.value ?? "") : "not rendered",
      selector: "input[type='hidden'][name='seats']",
      inactive: !state.withHiddenInput,
      rows: [
        { label: "Exists", value: bool(state.withHiddenInput), category: "presence" },
        { label: "Value", value: String(state.value ?? ""), category: "state" },
        { label: "Form owner", value: state.withFormOwner ? "number-input-demo-form" : "none", category: "state" },
      ],
    },
  ];
}

function passwordToggleFieldSections(state: ReturnType<typeof usePasswordToggleFieldScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: state.visible ? "visible" : "hidden",
      rows: [
        { label: "Renders wrapper", value: "false", category: "presence" },
        { label: "Controlled", value: bool(state.controlled), category: "state" },
        { label: "Visible", value: bool(state.visible), category: "state" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Field wrapper", value: bool(state.fieldWrapped), category: "state" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Read Only", value: bool(state.readOnly), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
      ],
    },
    withRef({
      ...partSection("Input", state.inputComposition, "[data-slot='password-toggle-field-input'], [data-slot='password-toggle-field-input-custom']"),
      rows: [
        { label: "Exists", value: "true", category: "presence" },
        { label: "Composition", value: state.inputComposition, category: "composition" },
      ],
    }, state.refs.input),
    withRef({
      ...partSection("Toggle", state.toggleComposition, "[data-slot='password-toggle-field-toggle'], [data-slot='password-toggle-field-toggle-custom']"),
      rows: [
        { label: "Exists", value: "true", category: "presence" },
        { label: "Composition", value: state.toggleComposition, category: "composition" },
      ],
    }, state.refs.toggle),
    withRef(partSection("Icon", state.visible ? "visible" : "hidden", "[data-slot='password-toggle-field-icon'], [data-slot='password-toggle-field-icon-custom']"), state.refs.icon),
  ];
}

function otpFieldSections(state: ReturnType<typeof useOTPFieldScenario>["state"]): AnatomySection[] {
  return [
    {
      title: "Root",
      summary: state.value || "empty",
      selector: "[data-slot='otp-field'], [data-slot='otp-field-custom']",
      rows: [
        { label: "Ref target", value: state.refs.root ?? "none", category: "identity" },
        { label: "Controlled", value: bool(state.controlled), category: "state" },
        { label: "Length", value: String(state.length), category: "state" },
        { label: "Type", value: state.type, category: "state" },
        { label: "Mask", value: bool(state.mask), category: "state" },
        { label: "Auto Submit", value: bool(state.autoSubmit), category: "behavior" },
        { label: "Auto Focus", value: bool(state.autoFocus), category: "behavior" },
        { label: "Aria Label", value: bool(state.ariaLabel), category: "behavior" },
        { label: "Form Owner", value: bool(state.formOwner), category: "behavior" },
        { label: "Composition", value: state.rootComposition, category: "composition" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Read Only", value: bool(state.readOnly), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
      ],
    },
    withRef(partSection("Input 1", state.inputComposition, "[data-slot='otp-field-input'][data-index='0'], [data-slot='otp-field-input-custom'][data-index='0']"), state.refs["input-0"]),
    withRef(partSection("Input 2", state.inputComposition, "[data-slot='otp-field-input'][data-index='1'], [data-slot='otp-field-input-custom'][data-index='1']"), state.refs["input-1"]),
    withRef(partSection("Separator", state.length > 4 ? state.separatorComposition : "not rendered", "[data-slot='otp-field-separator'], [data-slot='otp-field-separator-custom']", state.length <= 4), state.refs.separator),
  ];
}

function fileUploadSections(state: ReturnType<typeof useFileUploadScenario>["state"]): AnatomySection[] {
  return [
    withRef({
      title: "Root",
      summary: `${state.files.length} files`,
      selector: "[data-slot='file-upload'], [data-slot='file-upload-custom']",
      rows: [
        { label: "Composition", value: state.rootComposition, category: "composition" },
        { label: "Multiple", value: bool(state.multiple), category: "state" },
        { label: "Append Files", value: bool(state.appendFiles), category: "behavior" },
        { label: "Max Files", value: String(state.maxFiles), category: "state" },
        { label: "Max Size", value: `${state.maxSize} bytes`, category: "state" },
        { label: "Accept", value: state.acceptMode, category: "state" },
        { label: "Reject JSON", value: bool(state.rejectJson), category: "behavior" },
        { label: "Form Owner", value: bool(state.formOwner), category: "behavior" },
        { label: "Disabled", value: bool(state.disabled), category: "state" },
        { label: "Invalid", value: bool(state.invalid), category: "state" },
        { label: "Read Only", value: bool(state.readOnly), category: "state" },
        { label: "Rejected", value: String(state.rejectedCount), category: "state" },
        { label: "Required", value: bool(state.required), category: "state" },
      ],
    }, state.refs.root),
    withRef(partSection("Hidden Input", "input", "[data-slot='file-upload-hidden-input'], [data-slot='file-upload-hidden-input-custom']"), state.refs["hidden-input"]),
    withRef({
      ...partSection("Trigger", state.triggerComposition, "[data-slot='file-upload-trigger'], [data-slot='file-upload-trigger-custom']"),
      rows: [
        { label: "Exists", value: "true", category: "presence" },
        { label: "Composition", value: state.triggerComposition, category: "composition" },
        { label: "Text", value: "Choose files", category: "identity" },
      ],
    }, state.refs.trigger),
    withRef({
      ...partSection("Dropzone", state.dropzoneComposition, "[data-slot='file-upload-dropzone'], [data-slot='file-upload-dropzone-custom']"),
      rows: [
        { label: "Exists", value: "true", category: "presence" },
        { label: "Composition", value: state.dropzoneComposition, category: "composition" },
        { label: "Text", value: "Choose files Add sample Clear files", category: "identity" },
      ],
    }, state.refs.dropzone),
    withRef(partSection("Item Group", `${state.files.length} files`, "[data-slot='file-upload-item-group'], [data-slot='file-upload-item-group-custom']"), state.refs["item-group"]),
    withRef(partSection("Item", state.files[0]?.name ?? "not rendered", "[data-slot='file-upload-item'], [data-slot='file-upload-item-custom']", state.files.length === 0), state.refs.item),
    withRef({
      ...partSection("Item Name", state.files[0]?.name ?? "not rendered", "[data-slot='file-upload-item-name'], [data-slot='file-upload-item-name-custom']", state.files.length === 0),
      rows: [
        { label: "Exists", value: bool(state.files.length > 0), category: "presence" },
        { label: "Composition", value: state.itemNameComposition, category: "composition" },
      ],
    }, state.refs["item-name"]),
    withRef({
      ...partSection("Item Size", state.files[0] ? `${state.files[0].size} bytes` : "not rendered", "[data-slot='file-upload-item-size'], [data-slot='file-upload-item-size-custom']", state.files.length === 0),
      rows: [
        { label: "Exists", value: bool(state.files.length > 0), category: "presence" },
        { label: "Composition", value: state.itemSizeComposition, category: "composition" },
      ],
    }, state.refs["item-size"]),
    withRef({
      ...partSection("Item Delete Trigger", state.files.length > 0 ? state.itemDeleteComposition : "not rendered", "[data-slot='file-upload-item-delete-trigger'], [data-slot='file-upload-item-delete-trigger-custom']", state.files.length === 0),
      rows: [
        { label: "Exists", value: bool(state.files.length > 0), category: "presence" },
        { label: "Composition", value: state.itemDeleteComposition, category: "composition" },
        { label: "Text", value: state.files.length > 0 ? "Remove" : "not rendered", category: "identity" },
      ],
    }, state.refs["item-delete"]),
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

function withRef(section: AnatomySection, refTarget?: string): AnatomySection {
  return {
    ...section,
    rows: [
      ...(section.rows ?? []),
      { label: "Ref target", value: refTarget ?? "none", category: "identity" },
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
  if (scenarioId === "otp-field") return scenarios.otpField.state.log;
  if (scenarioId === "file-upload") return scenarios.fileUpload.state.log;
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
  if (scenarioId === "otp-field") scenarios.otpField.actions.clearLog();
  if (scenarioId === "file-upload") scenarios.fileUpload.actions.clearLog();
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

  if (scenarioId === "otp-field") {
    const state = scenarios.otpField.state;
    return `${state.controlled ? "Controlled" : "Uncontrolled"} | Value ${state.value || "empty"} | Length ${state.length}`;
  }

  if (scenarioId === "file-upload") {
    const state = scenarios.fileUpload.state;
    return `${state.files.length} files | Rejected ${state.rejectedCount} | Multiple ${state.multiple} | Form owner ${state.formOwner}`;
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
  if (scenarioId === "otp-field") return getOTPFieldSource(scenarios.otpField.state);
  if (scenarioId === "file-upload") return getFileUploadSource(scenarios.fileUpload.state);
  return "// No source example for this scenario yet.";
}

function getFieldSource(state: ReturnType<typeof useFieldScenario>["state"]) {
  const props = [
    `id="field-email"`,
    state.customRootSlot ? `data-slot="field-custom"` : null,
    state.propCheck ? `data-prop-check="root"` : null,
    state.required ? "required" : null,
    state.invalid ? "invalid" : null,
    state.disabled ? "disabled" : null,
    state.readOnly ? "readOnly" : null,
    state.orientation === "horizontal" ? `orientation="horizontal"` : null,
  ].filter(Boolean);
  const propText = props.length > 0 ? `\n  ${props.join("\n  ")}` : "";
  const control = state.controlType === "atom"
    ? `<Input.Root value={value} onValueChange={setValue} />`
    : `<input value={value} onChange={(event) => setValue(event.target.value)} />`;
  const labelProps = `${state.customLabelSlot ? ' data-slot="field-label-custom"' : ""}${state.propCheck ? ' data-prop-check="label"' : ""}`;
  const indicatorProps = `${state.customIndicatorSlot ? ' data-slot="field-required-indicator-custom"' : ""}${state.propCheck ? ' data-prop-check="required-indicator"' : ""}`;
  const descriptionProps = `${state.customDescriptionSlot ? ' data-slot="field-description-custom"' : ""}${state.propCheck ? ' data-prop-check="description"' : ""}`;
  const errorProps = `${state.customErrorSlot ? ' data-slot="field-error-custom"' : ""}${state.propCheck ? ' data-prop-check="error"' : ""}`;
  const children = `  <Field.Label${labelProps} requiredIndicator={null}>
    Email
    <Field.RequiredIndicator${indicatorProps} fallback=" (optional)" />
  </Field.Label>
  ${control}
  <Field.Description${descriptionProps}>Use a work email address.</Field.Description>
  <Field.Error${errorProps} forceMatch={${state.forceError}}>Field is invalid.</Field.Error>`;

  if (state.composition === "asChild") {
    return `<Field.Root${propText}
  asChild
>
  <section>
${children}
  </section>
</Field.Root>`;
  }

  if (state.composition === "render") {
    return `<Field.Root${propText}
  render={(props) => <section {...props} />}
>
${children}
</Field.Root>`;
  }

  return `<Field.Root${propText}>
${children}
</Field.Root>`;
}

function sourceBool(prop: string, enabled: boolean) {
  return enabled ? ` ${prop}` : "";
}

function sourcePartProps(part: string, propCheck: boolean, customSlot: boolean, slot: string) {
  return `${customSlot ? ` data-slot="${slot}"` : ""}${propCheck ? ` data-prop-check="${part}"` : ""}`;
}

function getFieldsetSource(state: ReturnType<typeof useFieldsetScenario>["state"]) {
  const rootDataProps = `${state.customRootSlot ? ' data-slot="fieldset-custom"' : ""}${state.propCheck ? ' data-prop-check="root"' : ""}`;
  const rootOpen = state.composition === "asChild"
    ? `<Fieldset.Root id="fieldset-contact"${rootDataProps}${sourceBool("required", state.required)}${sourceBool("invalid", state.invalid)}${sourceBool("disabled", state.disabled)} asChild>
  <section>`
    : state.composition === "render"
      ? `<Fieldset.Root
  id="fieldset-contact"${rootDataProps}${sourceBool("required", state.required)}${sourceBool("invalid", state.invalid)}${sourceBool("disabled", state.disabled)}
  render={(props) => <section {...props} />}
>`
      : `<Fieldset.Root id="fieldset-contact"${rootDataProps}${sourceBool("required", state.required)}${sourceBool("invalid", state.invalid)}${sourceBool("disabled", state.disabled)}>`;
  const rootClose = state.composition === "asChild"
    ? "  </section>\n</Fieldset.Root>"
    : "</Fieldset.Root>";

  return `${rootOpen}
  ${getFieldsetLegendSource(state)}
  ${getFieldsetDescriptionSource(state)}
  ${getFieldsetChoicesSource(state)}
  ${getFieldsetErrorSource(state)}
${rootClose}`;
}

function getFieldsetChoicesSource(state: ReturnType<typeof useFieldsetScenario>["state"]) {
  if (state.controlType === "atom") {
    return `<RadioGroup.Root
    ariaLabel="Contact preference"
    name="contact-preference"
    orientation="horizontal"
    value={choice}
    onValueChange={setChoice}${sourceBool("required", state.required)}${sourceBool("invalid", state.invalid)}${sourceBool("disabled", state.disabled)}
  >
    <RadioGroup.Radio value="email">Email</RadioGroup.Radio>
    <RadioGroup.Radio value="sms">Sms</RadioGroup.Radio>
    <RadioGroup.Radio value="phone">Phone</RadioGroup.Radio>
  </RadioGroup.Root>`;
  }

  return `<label>
    <input type="radio" name="contact-preference" value="email" checked={choice === "email"} onChange={() => setChoice("email")}${sourceBool("required", state.required)}${sourceBool("disabled", state.disabled)} />
    Email
  </label>
  <label>
    <input type="radio" name="contact-preference" value="sms" checked={choice === "sms"} onChange={() => setChoice("sms")}${sourceBool("required", state.required)}${sourceBool("disabled", state.disabled)} />
    Sms
  </label>
  <label>
    <input type="radio" name="contact-preference" value="phone" checked={choice === "phone"} onChange={() => setChoice("phone")}${sourceBool("required", state.required)}${sourceBool("disabled", state.disabled)} />
    Phone
  </label>`;
}

function getFieldsetLegendSource(state: ReturnType<typeof useFieldsetScenario>["state"]) {
  const props = `${state.customLegendSlot ? ' data-slot="fieldset-legend-custom"' : ""}${state.propCheck ? ' data-prop-check="legend"' : ""}`;
  if (state.legendComposition === "asChild") {
    return `<Fieldset.Legend${props} asChild>
    <legend>Contact preference</legend>
  </Fieldset.Legend>`;
  }

  if (state.legendComposition === "render") {
    return `<Fieldset.Legend${props} render={(props) => <legend {...props} />}>
    Contact preference
  </Fieldset.Legend>`;
  }

  return `<Fieldset.Legend${props}>Contact preference</Fieldset.Legend>`;
}

function getFieldsetDescriptionSource(state: ReturnType<typeof useFieldsetScenario>["state"]) {
  const props = `${state.customDescriptionSlot ? ' data-slot="fieldset-description-custom"' : ""}${state.propCheck ? ' data-prop-check="description"' : ""}`;
  if (state.descriptionComposition === "asChild") {
    return `<Fieldset.Description${props} asChild>
    <p>Pick one contact method.</p>
  </Fieldset.Description>`;
  }

  if (state.descriptionComposition === "render") {
    return `<Fieldset.Description${props} render={(props) => <p {...props} />}>
    Pick one contact method.
  </Fieldset.Description>`;
  }

  return `<Fieldset.Description${props}>Pick one contact method.</Fieldset.Description>`;
}

function getFieldsetErrorSource(state: ReturnType<typeof useFieldsetScenario>["state"]) {
  const forceMatch = sourceBool("forceMatch", state.forceError);
  const props = `${state.customErrorSlot ? ' data-slot="fieldset-error-custom"' : ""}${state.propCheck ? ' data-prop-check="error"' : ""}`;

  if (state.errorComposition === "asChild") {
    return `<Fieldset.Error${props}${forceMatch} asChild>
    <p>Choose one contact method.</p>
  </Fieldset.Error>`;
  }

  if (state.errorComposition === "render") {
    return `<Fieldset.Error${props}${forceMatch} render={(props) => <p {...props} />}>
    Choose one contact method.
  </Fieldset.Error>`;
  }

  return `<Fieldset.Error${props}${forceMatch}>Choose one contact method.</Fieldset.Error>`;
}

function getInputClearSource(state: ReturnType<typeof useInputScenario>["state"]) {
  const clearProps = `${state.customClearSlot ? " data-slot=\"input-clear-custom\"" : ""}${state.propCheck ? " data-prop-check=\"clear\"" : ""}`;

  if (state.clearComposition === "asChild") {
    return `<Input.Clear${clearProps} asChild onClear={handleClear}>
    <span>Clear</span>
  </Input.Clear>`;
  }

  if (state.clearComposition === "render") {
    return `<Input.Clear
    ${state.customClearSlot ? "data-slot=\"input-clear-custom\"" : ""}
    ${state.propCheck ? "data-prop-check=\"clear\"" : ""}
    render={(props) => <button {...props} />}
    onClear={handleClear}
  >
    Clear
  </Input.Clear>`;
  }

  return `<Input.Clear${clearProps} onClear={handleClear}>Clear</Input.Clear>`;
}

function getInputSource(state: ReturnType<typeof useInputScenario>["state"]) {
  return `${state.fieldWrapped ? `<Field.Root id="input-project"${sourceBool("disabled", state.disabled)}${sourceBool("invalid", state.invalid)}${sourceBool("required", state.required)}${sourceBool("readOnly", state.readOnly)}>
  <Field.Label>Project name</Field.Label>
  ` : ""}<Input.Root
  ${state.fieldWrapped ? "" : "aria-label=\"Project name\""}
  ${state.customRootSlot ? "data-slot=\"input-custom\"" : ""}
  ${state.propCheck ? "data-prop-check=\"root\"" : ""}
  name="project-name"
  type="text"
  placeholder="Project name"
  ${state.controlled ? "value={value}" : "defaultValue=\"Atom\""}
  ${state.disabled ? "disabled" : ""}
  ${state.invalid ? "invalid" : ""}
  ${state.required ? "required" : ""}
  ${state.readOnly ? "readOnly" : ""}
  onChange={handleChange}
  onFocus={handleFocus}
  onBlur={handleBlur}
  onValueChange={setValue}
>
  ${getInputClearSource(state)}
</Input.Root>${state.fieldWrapped ? "\n</Field.Root>" : ""}`;
}

function getTextareaCountSource(state: ReturnType<typeof useTextareaScenario>["state"]) {
  const countProps = sourcePartProps("count", state.propCheck, state.customCountSlot, "textarea-count-custom");

  if (state.countComposition === "asChild") {
    return `<Textarea.Count${countProps} asChild>
      <span />
    </Textarea.Count>`;
  }

  if (state.countComposition === "render") {
    return `<Textarea.Count${countProps} render={(props) => <output {...props} />} />`;
  }

  return `<Textarea.Count${countProps} />`;
}

function getTextareaSource(state: ReturnType<typeof useTextareaScenario>["state"]) {
  const rootProps = sourcePartProps("root", state.propCheck, state.customRootSlot, "textarea-custom");
  const textareaProps = [
    state.fieldWrapped ? "" : 'aria-label="Notes"',
    state.controlled ? "value={value}" : "defaultValue={value}",
    state.autoResize ? "autoResize" : "",
    state.withMaxLength ? "maxLength={80}" : "",
    "minRows={3}",
    state.disabled ? "disabled" : "",
    state.invalid ? "invalid" : "",
    state.required ? "required" : "",
    state.readOnly ? "readOnly" : "",
    "onValueChange={setValue}",
  ].filter(Boolean);
  const textarea = `<Textarea.Root${rootProps}
  ${textareaProps.join("\n  ")}
>
  ${getTextareaCountSource(state)}
</Textarea.Root>`;

  if (!state.fieldWrapped) {
    return textarea;
  }

  return `<Field.Root id="textarea-notes"${sourceBool("disabled", state.disabled)}${sourceBool("invalid", state.invalid)}${sourceBool("required", state.required)}${sourceBool("readOnly", state.readOnly)}>
  <Field.Label>Notes</Field.Label>
  ${textarea}
  <Field.Description>Counter follows the textarea value.</Field.Description>
</Field.Root>`;
}

function getNumberInputSource(state: ReturnType<typeof useNumberInputScenario>["state"]) {
  const rootProps = sourcePartProps("root", state.propCheck, state.customRootSlot, "number-input-custom");
  const numberInputProps = [
    state.controlled ? "value={value}" : "defaultValue={value}",
    "min={0}",
    "max={10}",
    "step={1}",
    state.customLargeStep ? "largeStep={5}" : "",
    state.precision ? "precision={2}" : "",
    state.clampOnBlur ? "" : "clampOnBlur={false}",
    state.formatted ? "formatter={formatSeats}" : "",
    state.formatted ? "parser={parseSeats}" : "",
    state.disabled ? "disabled" : "",
    state.invalid ? "invalid" : "",
    state.required ? "required" : "",
    state.readOnly ? "readOnly" : "",
    state.withHiddenInput ? 'name="seats"' : "",
    state.withHiddenInput && state.withFormOwner ? 'form="number-input-demo-form"' : "",
    'ariaLabel="Seats"',
    'ariaValueText={(value) => `${value} seats`}',
    state.fieldWrapped ? 'ariaDescribedBy="number-input-seats-description"' : "",
    "onValueChange={setValue}",
  ].filter(Boolean);
  const numberInput = `<NumberInput.Root${rootProps}
  ${numberInputProps.join("\n  ")}
>
  {({ handleStep, isAtMin, isAtMax }) => (
    <>
      <button disabled={isAtMin} onClick={() => handleStep(-1)}>Down</button>
      <button disabled={isAtMax} onClick={() => handleStep(1)}>Up</button>
    </>
  )}
</NumberInput.Root>`;

  if (!state.fieldWrapped) {
    return numberInput;
  }

  return `<Field.Root id="number-input-seats"${sourceBool("disabled", state.disabled)}${sourceBool("invalid", state.invalid)}${sourceBool("readOnly", state.readOnly)}${sourceBool("required", state.required)}>
  <Field.Label>Seats</Field.Label>
  ${numberInput}
  <Field.Description id="number-input-seats-description">
    Use arrow keys, buttons, Page Up, Page Down, Home, and End.
  </Field.Description>
  <Field.Error forceMatch={invalid}>Seats value has an error.</Field.Error>
</Field.Root>`;
}

function getPasswordToggleFieldSource(state: ReturnType<typeof usePasswordToggleFieldScenario>["state"]) {
  const rootProps = [
    state.controlled ? "visible={visible}" : "defaultVisible={false}",
    state.disabled ? "disabled" : "",
    state.invalid ? "invalid" : "",
    state.required ? "required" : "",
    state.readOnly ? "readOnly" : "",
    "onVisibleChange={setVisible}",
  ].filter(Boolean);

  const passwordField = `<PasswordToggleField.Root
  ${rootProps.join("\n  ")}
>
  ${getPasswordInputSource(state)}
  ${getPasswordToggleSource(state)}
</PasswordToggleField.Root>`;

  if (!state.fieldWrapped) {
    return passwordField;
  }

  return `<Field.Root id="password-field"${sourceBool("disabled", state.disabled)}${sourceBool("invalid", state.invalid)}${sourceBool("required", state.required)}${sourceBool("readOnly", state.readOnly)}>
  <Field.Label>Password</Field.Label>
  ${passwordField}
  <Field.Description>Toggle changes the input type and icon state.</Field.Description>
  <Field.Error forceMatch={invalid}>Password has an error.</Field.Error>
</Field.Root>`;
}

function getPasswordInputSource(state: ReturnType<typeof usePasswordToggleFieldScenario>["state"]) {
  const inputProps = sourcePartProps("input", state.propCheck, state.customInputSlot, "password-toggle-field-input-custom");
  const ariaLabel = state.fieldWrapped ? "" : ' aria-label="Password"';
  const fieldLinkProps = state.fieldWrapped
    ? ` id="password-field-control" aria-describedby="${state.invalid ? "password-field-description password-field-error" : "password-field-description"}"`
    : "";

  if (state.inputComposition === "asChild") {
    return `<PasswordToggleField.Input${inputProps}${ariaLabel}${fieldLinkProps} asChild>
    <input />
  </PasswordToggleField.Input>`;
  }

  if (state.inputComposition === "render") {
    return `<PasswordToggleField.Input${inputProps}${ariaLabel}${fieldLinkProps} render={(props) => <input {...props} />} />`;
  }

  return `<PasswordToggleField.Input${inputProps}${ariaLabel}${fieldLinkProps} />`;
}

function getPasswordToggleSource(state: ReturnType<typeof usePasswordToggleFieldScenario>["state"]) {
  const toggleProps = sourcePartProps("toggle", state.propCheck, state.customToggleSlot, "password-toggle-field-toggle-custom");
  const iconProps = sourcePartProps("icon", state.propCheck, state.customIconSlot, "password-toggle-field-icon-custom");
  const icon = `<PasswordToggleField.Icon${iconProps} hidden="Show" visible="Hide" />`;

  if (state.toggleComposition === "asChild") {
    return `<PasswordToggleField.Toggle${toggleProps} asChild>
    <button>${icon}</button>
  </PasswordToggleField.Toggle>`;
  }

  if (state.toggleComposition === "render") {
    return `<PasswordToggleField.Toggle${toggleProps} render={(props) => <button {...props} />}>
    ${icon}
  </PasswordToggleField.Toggle>`;
  }

  return `<PasswordToggleField.Toggle${toggleProps}>
    ${icon}
  </PasswordToggleField.Toggle>`;
}

function getOTPFieldRootSourceProps(state: ReturnType<typeof useOTPFieldScenario>["state"]) {
  return [
    sourcePartProps("root", state.propCheck, state.customRootSlot, "otp-field-custom").trim(),
    state.controlled ? "value={value}" : `defaultValue="${state.value}"`,
    `length={${state.length}}`,
    `type="${state.type}"`,
    'name="code"',
    state.formOwner ? 'form="otp-demo-form"' : "",
    state.mask ? "mask" : "",
    state.autoFocus ? "autoFocus" : "",
    state.autoSubmit ? "autoSubmit" : "",
    state.ariaLabel ? 'ariaLabel="Verification code"' : "",
    `ariaDescribedBy="${state.invalid ? "otp-code-description otp-code-error" : "otp-code-description"}"`,
    state.disabled ? "disabled" : "",
    state.invalid ? "invalid" : "",
    state.required ? "required" : "",
    state.readOnly ? "readOnly" : "",
    "onValueChange={setValue}",
    "onComplete={handleComplete}",
  ].filter(Boolean).join("\n  ");
}

function getOTPFieldInputSource(index: number, state: ReturnType<typeof useOTPFieldScenario>["state"]) {
  const inputProps = sourcePartProps(`input-${index}`, state.propCheck, state.customInputSlot, "otp-field-input-custom");

  if (state.inputComposition === "asChild") {
    return `<OTPField.Input${inputProps} index={${index}} asChild>
      <input />
    </OTPField.Input>`;
  }

  if (state.inputComposition === "render") {
    return `<OTPField.Input${inputProps} index={${index}} render={(props) => <input {...props} />} />`;
  }

  return `<OTPField.Input${inputProps} index={${index}} />`;
}

function getOTPFieldSeparatorSource(state: ReturnType<typeof useOTPFieldScenario>["state"]) {
  const separatorProps = sourcePartProps("separator", state.propCheck, state.customSeparatorSlot, "otp-field-separator-custom");

  if (state.separatorComposition === "asChild") {
    return `<OTPField.Separator${separatorProps} asChild>
      <span>-</span>
    </OTPField.Separator>`;
  }

  if (state.separatorComposition === "render") {
    return `<OTPField.Separator${separatorProps} render={(props) => <span {...props} />}>-</OTPField.Separator>`;
  }

  return `<OTPField.Separator${separatorProps}>-</OTPField.Separator>`;
}

function getOTPFieldSource(state: ReturnType<typeof useOTPFieldScenario>["state"]) {
  const rootProps = getOTPFieldRootSourceProps(state);
  const separator = state.length > 4 ? `${getOTPFieldSeparatorSource(state)}\n    ` : "";
  const rootOpen = state.rootComposition === "asChild"
    ? `<OTPField.Root
  ${rootProps}
  asChild
>
    <section>`
    : state.rootComposition === "render"
      ? `<OTPField.Root
  ${rootProps}
  render={(props) => <section {...props} />}
>`
      : `<OTPField.Root
  ${rootProps}
>`;
  const rootClose = state.rootComposition === "asChild"
    ? "    </section>\n  </OTPField.Root>"
    : "  </OTPField.Root>";

  return `<form id="otp-demo-form" onSubmit={handleSubmit}>
  <Field.Root id="otp-code"${sourceBool("invalid", state.invalid)}${sourceBool("required", state.required)}>
    <Field.Label>Verification code</Field.Label>
    ${rootOpen}
      ${getOTPFieldInputSource(0, state)}
      ${getOTPFieldInputSource(1, state)}
      ${separator}${getOTPFieldInputSource(2, state)}
${rootClose}
    <Field.Description id="otp-code-description">Type or paste the code.</Field.Description>
    <Field.Error forceMatch={invalid}>Code has an error.</Field.Error>
  </Field.Root>
</form>`;
}

function getFileUploadSource(state: ReturnType<typeof useFileUploadScenario>["state"]) {
  const accept = getFileUploadAccept(state.acceptMode);
  const rootProps = [
    `files={files}`,
    `name="attachments"`,
    state.formOwner ? `form="file-upload-demo-form"` : null,
    state.multiple ? "multiple" : null,
    state.appendFiles ? "appendFiles" : null,
    `maxFiles={${state.maxFiles}}`,
    `maxSize={${state.maxSize}}`,
    accept ? `accept="${accept}"` : null,
    state.rejectJson ? `validateFile={(file) => file.name.endsWith(".json") ? "json" : null}` : null,
    state.disabled ? "disabled" : null,
    state.readOnly ? "readOnly" : null,
    state.required ? "required" : null,
    state.invalid ? "invalid" : null,
    `onFilesChange={setFiles}`,
    `onRejectedFilesChange={setRejectedFiles}`,
    state.customRootSlot ? `data-slot="file-upload-custom"` : null,
    state.propCheck ? `data-prop-check="root"` : null,
  ].filter(Boolean);
  const rootPropText = rootProps.length > 0 ? `\n  ${rootProps.join("\n  ")}` : "";
  const children = `  <FileUpload.HiddenInput${sourcePartProps("hidden-input", state.propCheck, state.customHiddenInputSlot, "file-upload-hidden-input-custom")} />
  ${getFileUploadDropzoneSource(state)}
  <FileUpload.ItemGroup${sourcePartProps("item-group", state.propCheck, state.customItemGroupSlot, "file-upload-item-group-custom")}>
    {(file) => (
      ${getFileUploadItemSource(state)}
    )}
  </FileUpload.ItemGroup>`;

  if (state.rootComposition === "asChild") {
    return `<FileUpload.Root${rootPropText}
  asChild
>
  <section>
${children}
  </section>
</FileUpload.Root>`;
  }

  if (state.rootComposition === "render") {
    return `<FileUpload.Root${rootPropText}
  render={(props) => <section {...props} />}
>
${children}
</FileUpload.Root>`;
  }

  return `<FileUpload.Root${rootPropText}>
${children}
</FileUpload.Root>`;
}

function getFileUploadDropzoneSource(state: ReturnType<typeof useFileUploadScenario>["state"]) {
  const props = sourcePartProps("dropzone", state.propCheck, state.customDropzoneSlot, "file-upload-dropzone-custom");
  const children = `${getFileUploadTriggerSource(state)}
    <Button.Root onPress={addSample}>Add sample</Button.Root>
    <Button.Root onPress={clearFiles}>Clear files</Button.Root>`;

  if (state.dropzoneComposition === "asChild") {
    return `<FileUpload.Dropzone${props} asChild>
    <section>
    ${children}
    </section>
  </FileUpload.Dropzone>`;
  }

  if (state.dropzoneComposition === "render") {
    return `<FileUpload.Dropzone${props} render={(props) => <section {...props} />}>
    ${children}
  </FileUpload.Dropzone>`;
  }

  return `<FileUpload.Dropzone${props}>
    ${children}
  </FileUpload.Dropzone>`;
}

function getFileUploadTriggerSource(state: ReturnType<typeof useFileUploadScenario>["state"]) {
  const props = sourcePartProps("trigger", state.propCheck, state.customTriggerSlot, "file-upload-trigger-custom");
  if (state.triggerComposition === "asChild") {
    return `<FileUpload.Trigger${props} asChild>
      <span>Choose files</span>
    </FileUpload.Trigger>`;
  }

  if (state.triggerComposition === "render") {
    return `<FileUpload.Trigger${props} render={(props) => <button {...props} />}>
      Choose files
    </FileUpload.Trigger>`;
  }

  return `<FileUpload.Trigger${props}>Choose files</FileUpload.Trigger>`;
}

function getFileUploadItemSource(state: ReturnType<typeof useFileUploadScenario>["state"]) {
  const props = sourcePartProps("item", state.propCheck, state.customItemSlot, "file-upload-item-custom");
  const children = `${getFileUploadItemNameSource(state)}
        ${getFileUploadItemSizeSource(state)}
        ${getFileUploadItemDeleteSource(state)}`;

  if (state.itemComposition === "asChild") {
    return `<FileUpload.Item file={file}${props} asChild>
        <li>
        ${children}
        </li>
      </FileUpload.Item>`;
  }

  if (state.itemComposition === "render") {
    return `<FileUpload.Item file={file}${props} render={(props) => <li {...props} />}>
        ${children}
      </FileUpload.Item>`;
  }

  return `<FileUpload.Item file={file}${props}>
        ${children}
      </FileUpload.Item>`;
}

function getFileUploadItemNameSource(state: ReturnType<typeof useFileUploadScenario>["state"]) {
  const props = sourcePartProps("item-name", state.propCheck, state.customItemNameSlot, "file-upload-item-name-custom");
  if (state.itemNameComposition === "asChild") {
    return `<FileUpload.ItemName${props} asChild><span /></FileUpload.ItemName>`;
  }

  if (state.itemNameComposition === "render") {
    return `<FileUpload.ItemName${props} render={(props) => <span {...props} />} />`;
  }

  return `<FileUpload.ItemName${props} />`;
}

function getFileUploadItemSizeSource(state: ReturnType<typeof useFileUploadScenario>["state"]) {
  const props = sourcePartProps("item-size", state.propCheck, state.customItemSizeSlot, "file-upload-item-size-custom");
  if (state.itemSizeComposition === "asChild") {
    return `<FileUpload.ItemSize${props} asChild><span /></FileUpload.ItemSize>`;
  }

  if (state.itemSizeComposition === "render") {
    return `<FileUpload.ItemSize${props} render={(props) => <span {...props} />} />`;
  }

  return `<FileUpload.ItemSize${props} />`;
}

function getFileUploadItemDeleteSource(state: ReturnType<typeof useFileUploadScenario>["state"]) {
  const props = sourcePartProps("item-delete", state.propCheck, state.customItemDeleteSlot, "file-upload-item-delete-trigger-custom");
  if (state.itemDeleteComposition === "asChild") {
    return `<FileUpload.ItemDeleteTrigger${props} asChild>
          <span>Remove</span>
        </FileUpload.ItemDeleteTrigger>`;
  }

  if (state.itemDeleteComposition === "render") {
    return `<FileUpload.ItemDeleteTrigger${props} render={(props) => <button {...props} />}>
          Remove
        </FileUpload.ItemDeleteTrigger>`;
  }

  return `<FileUpload.ItemDeleteTrigger${props}>Remove</FileUpload.ItemDeleteTrigger>`;
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
const fieldControlOptions = ["native", "atom"] as const;
const fieldsetControlOptions = ["native", "atom"] as const;
const choiceOptions = ["email", "sms", "phone"] as const;
const numberValueOptions = ["empty", "0", "3", "10", "15"] as const;
const otpLengthOptions = ["4", "6"] as const;
const otpTypeOptions = ["numeric", "alphanumeric"] as const;
const fileUploadAcceptOptions = ["any", "images", "text"] as const;
const maxFileOptions = ["1", "3", "5"] as const;
const maxSizeOptions = ["1024", "4096", "10485760"] as const;
