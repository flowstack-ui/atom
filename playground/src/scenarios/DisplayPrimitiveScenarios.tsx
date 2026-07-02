import { AspectRatio } from "@flowstack-ui/atom/aspect-ratio";
import { Avatar } from "@flowstack-ui/atom/avatar";
import { Badge } from "@flowstack-ui/atom/badge";
import { Divider } from "@flowstack-ui/atom/divider";
import { Input } from "@flowstack-ui/atom/input";
import { Label } from "@flowstack-ui/atom/label";
import { List } from "@flowstack-ui/atom/list";
import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AnatomyPanel, type AnatomySection } from "../AnatomyPanel";
import { ControlToolbar, MenuCheckboxControl, MenuRadioControl, ScenarioEventLog, ToolbarGroup } from "../WorkbenchPrimitives";

type CompositionMode = "default" | "asChild" | "render";
type DividerOrientation = "horizontal" | "vertical";
type AspectRatioValue = "16:9" | "4:3" | "1:1" | "invalid";
type AvatarImageMode = "loaded" | "broken" | "loading";
type AvatarAltMode = "meaningful" | "decorative";

type LogEntry = {
  id: number;
  time: string;
  text: string;
};

export const displayPrimitiveScenarioIds = new Set([
  "badge",
  "divider",
  "aspect-ratio",
  "avatar",
  "label",
  "list",
]);

const avatarLoadedSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%231c2430'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23ffffff'/%3E%3Cpath d='M14 56c3.5-12 12-18 18-18s14.5 6 18 18' fill='%23ffffff'/%3E%3C/svg%3E";
const avatarLoadingSrc = "/avatar-loading-never-resolves.svg?delay=avatar";

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

export function useDisplayPrimitiveScenarios() {
  return {
    badge: useBadgeScenario(),
    divider: useDividerScenario(),
    aspectRatio: useAspectRatioScenario(),
    avatar: useAvatarScenario(),
    label: useLabelScenario(),
    list: useListScenario(),
  };
}

function useBadgeScenario() {
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [tone, setTone] = useState("neutral");
  const [content, setContent] = useState("Ready");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { composition, tone, content, log },
    actions: {
      setComposition,
      setTone,
      setContent,
      clearLog,
      noteClick: () => addLog("badge clicked"),
    },
  };
}

function useDividerScenario() {
  const [orientation, setOrientation] = useState<DividerOrientation>("horizontal");
  const [decorative, setDecorative] = useState(true);
  const [withContent, setWithContent] = useState(false);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const [rootRef, setRootRef] = useState("none");
  const { log, addLog, clearLog } = useScenarioLog();
  const markRootRef = useCallback((node: HTMLDivElement | HTMLHRElement | null) => {
    setRootRef(node?.tagName.toLowerCase() ?? "none");
  }, []);

  return {
    state: { orientation, decorative, withContent, composition, rootRef, log },
    actions: {
      setOrientation,
      setDecorative,
      setWithContent,
      setComposition,
      markRootRef,
      clearLog,
      noteToggle: () => addLog("divider options changed"),
    },
  };
}

function useAspectRatioScenario() {
  const [ratio, setRatio] = useState<AspectRatioValue>("16:9");
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, clearLog } = useScenarioLog();

  return {
    state: { ratio, composition, log },
    actions: { setRatio, setComposition, clearLog },
  };
}

function useAvatarScenario() {
  const [imageMode, setImageMode] = useState<AvatarImageMode>("loaded");
  const [delay, setDelay] = useState(false);
  const [group, setGroup] = useState(false);
  const [altMode, setAltMode] = useState<AvatarAltMode>("meaningful");
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [imageComposition, setImageComposition] = useState<CompositionMode>("default");
  const [fallbackComposition, setFallbackComposition] = useState<CompositionMode>("default");
  const [groupComposition, setGroupComposition] = useState<CompositionMode>("default");
  const [status, setStatus] = useState("idle");
  const [rootRef, setRootRef] = useState("none");
  const [imageRef, setImageRef] = useState("none");
  const [fallbackRef, setFallbackRef] = useState("none");
  const [groupRef, setGroupRef] = useState("none");
  const { log, addLog, clearLog } = useScenarioLog();
  const lastStatusRef = useRef<string | null>(null);

  const handleStatusChange = (nextStatus: string) => {
    setStatus(nextStatus);
    if (lastStatusRef.current === nextStatus) return;
    lastStatusRef.current = nextStatus;
    addLog(`image ${nextStatus}`);
  };
  const markRootRef = useCallback((node: HTMLElement | null) => {
    setRootRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markImageRef = useCallback((node: HTMLElement | null) => {
    setImageRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markFallbackRef = useCallback((node: HTMLElement | null) => {
    setFallbackRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markGroupRef = useCallback((node: HTMLElement | null) => {
    setGroupRef(node?.tagName.toLowerCase() ?? "none");
  }, []);

  return {
    state: {
      imageMode,
      delay,
      group,
      altMode,
      rootComposition,
      imageComposition,
      fallbackComposition,
      groupComposition,
      status,
      rootRef,
      imageRef,
      fallbackRef,
      groupRef,
      log,
    },
    actions: {
      setImageMode,
      setDelay,
      setGroup,
      setAltMode,
      setRootComposition,
      setImageComposition,
      setFallbackComposition,
      setGroupComposition,
      handleStatusChange,
      markRootRef,
      markImageRef,
      markFallbackRef,
      markGroupRef,
      clearLog,
    },
  };
}

function useLabelScenario() {
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [withHtmlFor, setWithHtmlFor] = useState(true);
  const [composition, setComposition] = useState<CompositionMode>("default");
  const { log, addLog, clearLog } = useScenarioLog();

  return {
    state: { disabled, invalid, required, readOnly, withHtmlFor, composition, log },
    actions: {
      setDisabled,
      setInvalid,
      setRequired,
      setReadOnly,
      setWithHtmlFor,
      setComposition,
      clearLog,
      noteLabelClick: () => addLog("label clicked"),
      noteInputFocus: () => addLog("input focused"),
    },
  };
}

function useListScenario() {
  const [ordered, setOrdered] = useState(false);
  const [disabledItem, setDisabledItem] = useState(true);
  const [rootComposition, setRootComposition] = useState<CompositionMode>("default");
  const [itemComposition, setItemComposition] = useState<CompositionMode>("default");
  const [rootRef, setRootRef] = useState("none");
  const [itemRef, setItemRef] = useState("none");
  const { log, addLog, clearLog } = useScenarioLog();
  const markRootRef = useCallback((node: HTMLOListElement | HTMLUListElement | null) => {
    setRootRef(node?.tagName.toLowerCase() ?? "none");
  }, []);
  const markItemRef = useCallback((node: HTMLLIElement | null) => {
    setItemRef(node?.tagName.toLowerCase() ?? "none");
  }, []);

  return {
    state: { ordered, disabledItem, rootComposition, itemComposition, rootRef, itemRef, log },
    actions: {
      setOrdered,
      setDisabledItem,
      setRootComposition,
      setItemComposition,
      markRootRef,
      markItemRef,
      clearLog,
      noteItemClick: (value: string) => addLog(`item clicked ${value}`),
    },
  };
}

export type DisplayPrimitiveScenarios = ReturnType<typeof useDisplayPrimitiveScenarios>;

export function DisplayPrimitiveScenarioToolbar({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: DisplayPrimitiveScenarios;
}) {
  if (scenarioId === "badge") {
    const scenario = scenarios.badge;
    return (
      <ControlToolbar label="Badge controls">
        <ToolbarGroup title="Content" value="content">
          <MenuRadioControl label="Text" options={badgeContentOptions} value={scenario.state.content} onChange={scenario.actions.setContent} />
          <MenuRadioControl label="Tone" options={badgeToneOptions} value={scenario.state.tone} onChange={scenario.actions.setTone} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "divider") {
    const scenario = scenarios.divider;
    return (
      <ControlToolbar label="Divider controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.decorative} label="Decorative" value="decorative" onChange={scenario.actions.setDecorative} />
          <MenuCheckboxControl checked={scenario.state.withContent} label="With content" value="with-content" onChange={scenario.actions.setWithContent} />
        </ToolbarGroup>
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Orientation" options={dividerOrientationOptions} value={scenario.state.orientation} onChange={scenario.actions.setOrientation} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "aspect-ratio") {
    const scenario = scenarios.aspectRatio;
    return (
      <ControlToolbar label="Aspect Ratio controls">
        <ToolbarGroup title="Layout" value="layout">
          <MenuRadioControl label="Ratio" options={aspectRatioOptions} value={scenario.state.ratio} onChange={scenario.actions.setRatio} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "avatar") {
    const scenario = scenarios.avatar;
    return (
      <ControlToolbar label="Avatar controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.group} label="Group" value="group" onChange={scenario.actions.setGroup} />
          <MenuCheckboxControl checked={scenario.state.delay} label="Delay fallback" value="delay" onChange={scenario.actions.setDelay} />
        </ToolbarGroup>
        <ToolbarGroup title="Image" value="image">
          <MenuRadioControl label="Source" options={avatarImageOptions} value={scenario.state.imageMode} onChange={scenario.actions.setImageMode} />
          <MenuRadioControl label="Alt" options={avatarAltOptions} value={scenario.state.altMode} onChange={scenario.actions.setAltMode} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="Image" options={compositionOptions} value={scenario.state.imageComposition} onChange={scenario.actions.setImageComposition} />
          <MenuRadioControl label="Fallback" options={compositionOptions} value={scenario.state.fallbackComposition} onChange={scenario.actions.setFallbackComposition} />
          <MenuRadioControl label="Group" options={compositionOptions} value={scenario.state.groupComposition} onChange={scenario.actions.setGroupComposition} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  if (scenarioId === "label") {
    const scenario = scenarios.label;
    return (
      <ControlToolbar label="Label controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.disabled} label="Disabled" value="disabled" onChange={scenario.actions.setDisabled} />
          <MenuCheckboxControl checked={scenario.state.invalid} label="Invalid" value="invalid" onChange={scenario.actions.setInvalid} />
          <MenuCheckboxControl checked={scenario.state.required} label="Required" value="required" onChange={scenario.actions.setRequired} />
          <MenuCheckboxControl checked={scenario.state.readOnly} label="Read only" value="read-only" onChange={scenario.actions.setReadOnly} />
        </ToolbarGroup>
        <ToolbarGroup title="Association" value="association">
          <MenuCheckboxControl checked={scenario.state.withHtmlFor} label="Use htmlFor" value="html-for" onChange={scenario.actions.setWithHtmlFor} />
        </ToolbarGroup>
        <CompositionToolbarGroup value={scenario.state.composition} onChange={scenario.actions.setComposition} />
      </ControlToolbar>
    );
  }

  if (scenarioId === "list") {
    const scenario = scenarios.list;
    return (
      <ControlToolbar label="List controls">
        <ToolbarGroup title="State" value="state">
          <MenuCheckboxControl checked={scenario.state.ordered} label="Ordered" value="ordered" onChange={scenario.actions.setOrdered} />
          <MenuCheckboxControl checked={scenario.state.disabledItem} label="Second item disabled" value="disabled-item" onChange={scenario.actions.setDisabledItem} />
        </ToolbarGroup>
        <ToolbarGroup title="Composition" value="composition">
          <MenuRadioControl label="Root" options={compositionOptions} value={scenario.state.rootComposition} onChange={scenario.actions.setRootComposition} />
          <MenuRadioControl label="Item" options={compositionOptions} value={scenario.state.itemComposition} onChange={scenario.actions.setItemComposition} />
        </ToolbarGroup>
      </ControlToolbar>
    );
  }

  return null;
}

export function DisplayPrimitiveScenarioCanvas({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: DisplayPrimitiveScenarios;
}) {
  if (scenarioId === "badge") return <BadgeScenarioCanvas scenario={scenarios.badge} />;
  if (scenarioId === "divider") return <DividerScenarioCanvas scenario={scenarios.divider} />;
  if (scenarioId === "aspect-ratio") return <AspectRatioScenarioCanvas scenario={scenarios.aspectRatio} />;
  if (scenarioId === "avatar") return <AvatarScenarioCanvas scenario={scenarios.avatar} />;
  if (scenarioId === "label") return <LabelScenarioCanvas scenario={scenarios.label} />;
  if (scenarioId === "list") return <ListScenarioCanvas scenario={scenarios.list} />;
  return null;
}

export function DisplayPrimitiveScenarioAnatomy({
  scenarioId,
  scenarios,
  openGroups,
  onOpenGroupsChange,
}: {
  scenarioId: string;
  scenarios: DisplayPrimitiveScenarios;
  openGroups: Record<string, boolean>;
  onOpenGroupsChange: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const sections = getDisplayPrimitiveSections(scenarioId, scenarios);
  return (
    <AnatomyPanel
      footer={`${sections.length} ${sections.length === 1 ? "part" : "parts"}`}
      openGroups={openGroups}
      sections={sections}
      onOpenGroupsChange={onOpenGroupsChange}
    />
  );
}

export function DisplayPrimitiveScenarioLog({
  scenarioId,
  scenarios,
}: {
  scenarioId: string;
  scenarios: DisplayPrimitiveScenarios;
}) {
  const log = getDisplayPrimitiveLog(scenarioId, scenarios);
  return <ScenarioEventLog log={log} />;
}

export function getDisplayPrimitiveEventCount(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
) {
  return getDisplayPrimitiveLog(scenarioId, scenarios).length;
}

export function clearDisplayPrimitiveLog(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
) {
  getDisplayPrimitiveActions(scenarioId, scenarios)?.clearLog();
}

export function getDisplayPrimitiveCanvasFooter(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
) {
  if (scenarioId === "badge") {
    const state = scenarios.badge.state;
    return `Content ${state.content} | Tone ${state.tone} | ${state.composition}`;
  }

  if (scenarioId === "divider") {
    const state = scenarios.divider.state;
    return `${state.orientation} | Decorative ${state.decorative} | Content ${state.withContent}`;
  }

  if (scenarioId === "aspect-ratio") {
    const state = scenarios.aspectRatio.state;
    return `Ratio ${state.ratio} | ${state.composition}`;
  }

  if (scenarioId === "avatar") {
    const state = scenarios.avatar.state;
    return `Image ${state.imageMode} | Status ${state.status} | Group ${state.group}`;
  }

  if (scenarioId === "label") {
    const state = scenarios.label.state;
    return `htmlFor ${state.withHtmlFor} | Required ${state.required} | Invalid ${state.invalid}`;
  }

  if (scenarioId === "list") {
    const state = scenarios.list.state;
    return `${state.ordered ? "Ordered" : "Unordered"} | Disabled item ${state.disabledItem}`;
  }

  return "";
}

export function getDisplayPrimitiveSource(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
) {
  if (scenarioId === "badge") {
    const state = scenarios.badge.state;
    return `<Badge.Root>
  ${state.content}
</Badge.Root>`;
  }

  if (scenarioId === "divider") {
    const state = scenarios.divider.state;
    const content = state.withContent ? "<span>OR</span>" : "";

    if (state.composition === "asChild") {
      return `<Divider.Root
  orientation="${state.orientation}"
  decorative={${state.decorative}}
  asChild
>
  <div>${content}</div>
</Divider.Root>`;
    }

    if (state.composition === "render") {
      return `<Divider.Root
  orientation="${state.orientation}"
  decorative={${state.decorative}}
  render={(props) => <section {...props}>${content}</section>}
/>`;
    }

    return `<Divider.Root
  orientation="${state.orientation}"
  decorative={${state.decorative}}
>
  ${content}
</Divider.Root>`;
  }

  if (scenarioId === "aspect-ratio") {
    const state = scenarios.aspectRatio.state;
    if (state.composition === "asChild") {
      return `<AspectRatio.Root ratio={${getRatioValue(state.ratio)}} asChild>
  <section>${state.ratio}</section>
</AspectRatio.Root>`;
    }

    if (state.composition === "render") {
      return `<AspectRatio.Root
  ratio={${getRatioValue(state.ratio)}}
  render={(props) => <article {...props}>${state.ratio}</article>}
/>`;
    }

    return `<AspectRatio.Root ratio={${getRatioValue(state.ratio)}}>
  <span>${state.ratio}</span>
</AspectRatio.Root>`;
  }

  if (scenarioId === "avatar") {
    const state = scenarios.avatar.state;
    const avatar = getAvatarRootSource(state);
    if (!state.group) return avatar;

    if (state.groupComposition === "asChild") {
      return `<Avatar.Group asChild>
  <div>
${indent(avatar, 4)}
    <Avatar.Root src="/backup.png">
      <Avatar.Fallback>FS</Avatar.Fallback>
    </Avatar.Root>
  </div>
</Avatar.Group>`;
    }

    if (state.groupComposition === "render") {
      return `<Avatar.Group render={(props) => <section {...props} />}>
${indent(avatar, 2)}
  <Avatar.Root src="/backup.png">
    <Avatar.Fallback>FS</Avatar.Fallback>
  </Avatar.Root>
</Avatar.Group>`;
    }

    return `<Avatar.Group>
${indent(avatar, 2)}
  <Avatar.Root src="/backup.png">
    <Avatar.Fallback>FS</Avatar.Fallback>
  </Avatar.Root>
</Avatar.Group>`;
  }

  if (scenarioId === "label") {
    const state = scenarios.label.state;
    return `<Label.Root
  ${state.withHtmlFor ? `htmlFor="display-label-input"` : ""}
  disabled={${state.disabled}}
  invalid={${state.invalid}}
  required={${state.required}}
  readOnly={${state.readOnly}}
>
  Email
</Label.Root>
<Input.Root id="display-label-input" />`;
  }

  if (scenarioId === "list") {
    const state = scenarios.list.state;
    const rootOpen = `<List.Root ordered={${state.ordered}}`;
    const rootClose = `</List.Root>`;
    const planItem = getListItemSource(state.itemComposition);
    const billingItem = state.disabledItem
      ? `<List.Item disabled>Billing</List.Item>`
      : `<List.Item>Billing</List.Item>`;

    if (state.rootComposition === "asChild") {
      return `${rootOpen} asChild>
  <${state.ordered ? "ol" : "ul"}>
${indent(planItem, 4)}
    ${billingItem}
    <List.Item>Review</List.Item>
  </${state.ordered ? "ol" : "ul"}>
${rootClose}`;
    }

    if (state.rootComposition === "render") {
      return `${rootOpen}
  render={(props) => <${state.ordered ? "ol" : "ul"} {...props} />}
>
${indent(planItem, 2)}
  ${billingItem}
  <List.Item>Review</List.Item>
</List.Root>`;
    }

    return `${rootOpen}>
${indent(planItem, 2)}
  ${billingItem}
  <List.Item>Review</List.Item>
${rootClose}`;
  }

  return "// No source example for this scenario yet.";
}

function BadgeScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useBadgeScenario> }) {
  const props = {
    className: `display-badge display-badge-${scenario.state.tone}`,
    "data-badge-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    onClick: scenario.actions.noteClick,
  };

  return (
    <div className="display-primitive-stage">
      {scenario.state.composition === "asChild" ? (
        <Badge.Root {...props} asChild>
          <strong>{scenario.state.content}</strong>
        </Badge.Root>
      ) : scenario.state.composition === "render" ? (
        <Badge.Root {...props} render={(renderProps) => <strong {...renderProps}>{scenario.state.content}</strong>} />
      ) : (
        <Badge.Root {...props}>{scenario.state.content}</Badge.Root>
      )}
    </div>
  );
}

function DividerScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useDividerScenario> }) {
  const props = {
    className: `display-divider ${scenario.state.orientation === "vertical" ? "vertical" : ""}`,
    "data-divider-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    decorative: scenario.state.decorative,
    orientation: scenario.state.orientation,
    ref: scenario.actions.markRootRef,
  };
  const children = scenario.state.withContent ? <span className="display-divider-label">OR</span> : undefined;

  return (
    <div className={`display-primitive-stage divider-stage ${scenario.state.orientation}`}>
      <span>Before</span>
      {scenario.state.composition === "asChild" ? (
        <Divider.Root {...props} asChild>
          <div>{children}</div>
        </Divider.Root>
      ) : scenario.state.composition === "render" ? (
        <Divider.Root {...props} render={(renderProps) => <section {...renderProps}>{children}</section>} />
      ) : (
        <Divider.Root {...props}>{children}</Divider.Root>
      )}
      <span>After</span>
    </div>
  );
}

function AspectRatioScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useAspectRatioScenario> }) {
  const props = {
    className: "display-aspect-ratio",
    "data-aspect-ratio-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    ratio: getRatioValue(scenario.state.ratio),
  };

  return (
    <div className="display-primitive-stage">
      {scenario.state.composition === "asChild" ? (
        <AspectRatio.Root {...props} asChild>
          <section><span>{scenario.state.ratio}</span></section>
        </AspectRatio.Root>
      ) : scenario.state.composition === "render" ? (
        <AspectRatio.Root {...props} render={(renderProps) => <article {...renderProps}><span>{scenario.state.ratio}</span></article>} />
      ) : (
        <AspectRatio.Root {...props}><span>{scenario.state.ratio}</span></AspectRatio.Root>
      )}
    </div>
  );
}

function AvatarScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useAvatarScenario> }) {
  const avatar = (
    <AvatarExample
      altMode={scenario.state.altMode}
      delay={scenario.state.delay}
      fallbackComposition={scenario.state.fallbackComposition}
      imageMode={scenario.state.imageMode}
      imageComposition={scenario.state.imageComposition}
      onFallbackRef={scenario.actions.markFallbackRef}
      onImageRef={scenario.actions.markImageRef}
      onLoadingStatusChange={scenario.actions.handleStatusChange}
      onRootRef={scenario.actions.markRootRef}
      primary
      rootComposition={scenario.state.rootComposition}
      fallbackText="WD"
    />
  );

  const secondaryAvatar = (
    <AvatarExample
      altMode="decorative"
      delay={false}
      fallbackComposition="default"
      imageMode="broken"
      imageComposition="default"
      onFallbackRef={() => undefined}
      onImageRef={() => undefined}
      onLoadingStatusChange={scenario.actions.handleStatusChange}
      onRootRef={() => undefined}
      rootComposition="default"
      fallbackText="FS"
    />
  );

  const groupProps = {
    className: "display-avatar-group",
    "data-avatar-group": "",
    "data-playground-inspect": "",
    "data-prop-check": "group",
    ref: scenario.actions.markGroupRef,
  };

  const groupChildren = (
    <>
      {avatar}
      {secondaryAvatar}
    </>
  );

  return (
    <div className="display-primitive-stage">
      {scenario.state.group && scenario.state.groupComposition === "asChild" ? (
        <Avatar.Group {...groupProps} asChild>
          <div>{groupChildren}</div>
        </Avatar.Group>
      ) : scenario.state.group && scenario.state.groupComposition === "render" ? (
        <Avatar.Group {...groupProps} render={(renderProps) => <section {...renderProps}>{groupChildren}</section>} />
      ) : scenario.state.group ? (
        <Avatar.Group {...groupProps}>{groupChildren}</Avatar.Group>
      ) : avatar}
    </div>
  );
}

function LabelScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useLabelScenario> }) {
  const labelProps = {
    className: "display-label",
    "data-label-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    disabled: scenario.state.disabled,
    invalid: scenario.state.invalid,
    required: scenario.state.required,
    readOnly: scenario.state.readOnly,
    htmlFor: scenario.state.withHtmlFor ? "display-label-input" : undefined,
    onClick: scenario.actions.noteLabelClick,
  };

  return (
    <div className="display-primitive-stage">
      <div className="display-label-field">
        {scenario.state.composition === "asChild" ? (
          <Label.Root {...labelProps} asChild>
            <span>Email</span>
          </Label.Root>
        ) : scenario.state.composition === "render" ? (
          <Label.Root {...labelProps} render={(renderProps) => <span {...renderProps}>Email</span>} />
        ) : (
          <Label.Root {...labelProps}>Email</Label.Root>
        )}
        <Input.Root
          className="display-input"
          data-input-root=""
          data-playground-inspect=""
          data-prop-check="input"
          defaultValue="hello@flowstack.dev"
          disabled={scenario.state.disabled}
          id="display-label-input"
          invalid={scenario.state.invalid}
          readOnly={scenario.state.readOnly}
          required={scenario.state.required}
          onFocus={scenario.actions.noteInputFocus}
        />
      </div>
    </div>
  );
}

function ListScenarioCanvas({ scenario }: { scenario: ReturnType<typeof useListScenario> }) {
  const props = {
    className: "display-list",
    "data-list-root": "",
    "data-playground-inspect": "",
    "data-prop-check": "root",
    ordered: scenario.state.ordered,
    ref: scenario.actions.markRootRef,
  };

  const items = (
    <>
      <ListItemExample scenario={scenario} />
      <List.Item
        data-list-disabled-item=""
        data-playground-inspect=""
        data-prop-check="disabled-item"
        data-value="billing"
        disabled={scenario.state.disabledItem}
        onClick={() => scenario.actions.noteItemClick("billing")}
      >
        Billing
      </List.Item>
      <List.Item
        data-list-last-item=""
        data-playground-inspect=""
        data-value="review"
        onClick={() => scenario.actions.noteItemClick("review")}
      >
        Review
      </List.Item>
    </>
  );

  return (
    <div className="display-primitive-stage">
      {scenario.state.rootComposition === "asChild" ? (
        <List.Root {...props} asChild>
          {scenario.state.ordered ? <ol>{items}</ol> : <ul>{items}</ul>}
        </List.Root>
      ) : scenario.state.rootComposition === "render" ? (
        <List.Root {...props} render={(renderProps) => scenario.state.ordered ? <ol {...renderProps}>{items}</ol> : <ul {...renderProps}>{items}</ul>} />
      ) : (
        <List.Root {...props}>{items}</List.Root>
      )}
    </div>
  );
}

function ListItemExample({ scenario }: { scenario: ReturnType<typeof useListScenario> }) {
  const props = {
    "data-list-item": "",
    "data-playground-inspect": "",
    "data-prop-check": "item",
    "data-value": "plan",
    ref: scenario.actions.markItemRef,
    onClick: () => scenario.actions.noteItemClick("plan"),
  };

  if (scenario.state.itemComposition === "asChild") {
    return (
      <List.Item {...props} asChild>
        <li>Plan setup</li>
      </List.Item>
    );
  }

  if (scenario.state.itemComposition === "render") {
    return <List.Item {...props} render={(renderProps) => <li {...renderProps}>Plan setup</li>} />;
  }

  return <List.Item {...props}>Plan setup</List.Item>;
}

function AvatarExample({
  altMode,
  delay,
  fallbackComposition,
  imageMode,
  imageComposition,
  onFallbackRef,
  onImageRef,
  onLoadingStatusChange,
  onRootRef,
  primary = false,
  rootComposition,
  fallbackText,
}: {
  altMode: AvatarAltMode;
  delay: boolean;
  fallbackText: string;
  fallbackComposition: CompositionMode;
  imageMode: AvatarImageMode;
  imageComposition: CompositionMode;
  onFallbackRef: (node: HTMLElement | null) => void;
  onImageRef: (node: HTMLElement | null) => void;
  onLoadingStatusChange: (status: string) => void;
  onRootRef: (node: HTMLElement | null) => void;
  primary?: boolean;
  rootComposition: CompositionMode;
}) {
  const src = getAvatarSrc(imageMode);
  const props = {
    className: "display-avatar",
    "data-avatar-root": primary ? "" : undefined,
    "data-playground-inspect": primary ? "" : undefined,
    "data-prop-check": primary ? "root" : undefined,
    ref: primary ? onRootRef : undefined,
    src,
    onLoadingStatusChange,
  };
  const children = (
    <>
      <AvatarImageExample altMode={altMode} imageComposition={imageComposition} onRef={onImageRef} primary={primary} src={src} />
      <AvatarFallbackExample delay={delay} fallbackComposition={fallbackComposition} onRef={onFallbackRef} primary={primary} text={fallbackText} />
    </>
  );

  return rootComposition === "asChild" ? (
    <Avatar.Root {...props} asChild>
      <span>{children}</span>
    </Avatar.Root>
  ) : rootComposition === "render" ? (
    <Avatar.Root {...props} render={(renderProps) => <span {...renderProps} />}>
      {children}
    </Avatar.Root>
  ) : (
    <Avatar.Root {...props}>{children}</Avatar.Root>
  );
}

function AvatarImageExample({
  altMode,
  imageComposition,
  onRef,
  primary,
  src,
}: {
  altMode: AvatarAltMode;
  imageComposition: CompositionMode;
  onRef: (node: HTMLElement | null) => void;
  primary: boolean;
  src: string;
}) {
  const props = {
    alt: altMode === "decorative" ? "" : "Will Donin",
    className: "display-avatar-image",
    "data-avatar-image": primary ? "" : undefined,
    "data-playground-inspect": primary ? "" : undefined,
    "data-prop-check": primary ? "image" : undefined,
    ref: primary ? onRef : undefined,
    src,
  };
  const imageKey = `${src}:${altMode}:${imageComposition}`;

  if (imageComposition === "asChild") {
    return (
      <Avatar.Image {...props} key={imageKey} asChild>
        <img alt="" />
      </Avatar.Image>
    );
  }

  if (imageComposition === "render") {
    return <Avatar.Image {...props} key={imageKey} render={(renderProps) => <img {...renderProps} />} />;
  }

  return <Avatar.Image {...props} key={imageKey} />;
}

function AvatarFallbackExample({
  delay,
  fallbackComposition,
  onRef,
  primary,
  text,
}: {
  delay: boolean;
  fallbackComposition: CompositionMode;
  onRef: (node: HTMLElement | null) => void;
  primary: boolean;
  text: string;
}) {
  const props = {
    className: "display-avatar-fallback",
    "data-avatar-fallback": primary ? "" : undefined,
    "data-avatar-fallback-secondary": primary ? undefined : "",
    "data-playground-inspect": "",
    "data-prop-check": primary ? "fallback" : "fallback-secondary",
    delayMs: delay ? 600 : 0,
    ref: primary ? onRef : undefined,
  };

  if (fallbackComposition === "asChild") {
    return (
      <Avatar.Fallback {...props} asChild>
        <span>{text}</span>
      </Avatar.Fallback>
    );
  }

  if (fallbackComposition === "render") {
    return <Avatar.Fallback {...props} render={(renderProps) => <span {...renderProps}>{text}</span>} />;
  }

  return <Avatar.Fallback {...props}>{text}</Avatar.Fallback>;
}

function getDisplayPrimitiveSections(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
): AnatomySection[] {
  if (scenarioId === "badge") {
    const root = document.querySelector<HTMLElement>("[data-badge-root]");
    return [{
      title: "Root",
      selector: "[data-badge-root]",
      summary: root?.textContent?.trim() || "not rendered",
      rows: [
        { label: "Exists", value: bool(!!root), category: "presence" },
        { label: "Content", value: scenarios.badge.state.content, category: "state" },
        { label: "Tone", value: scenarios.badge.state.tone, category: "state" },
        { label: "Composition", value: scenarios.badge.state.composition, category: "composition" },
      ],
    }];
  }

  if (scenarioId === "divider") {
    const root = document.querySelector<HTMLElement>("[data-divider-root]");
    return [{
      title: "Root",
      selector: "[data-divider-root]",
      summary: scenarios.divider.state.orientation,
      rows: [
        { label: "Exists", value: bool(!!root), category: "presence" },
        { label: "Ref target", value: scenarios.divider.state.rootRef, category: "identity" },
        { label: "Orientation", value: scenarios.divider.state.orientation, category: "state" },
        { label: "Decorative", value: bool(scenarios.divider.state.decorative), category: "state" },
        { label: "With content", value: bool(scenarios.divider.state.withContent), category: "state" },
        { label: "Composition", value: scenarios.divider.state.composition, category: "composition" },
      ],
    }];
  }

  if (scenarioId === "aspect-ratio") {
    const root = document.querySelector<HTMLElement>("[data-aspect-ratio-root]");
    return [{
      title: "Root",
      selector: "[data-aspect-ratio-root]",
      summary: scenarios.aspectRatio.state.ratio,
      rows: [
        { label: "Exists", value: bool(!!root), category: "presence" },
        { label: "Ratio", value: scenarios.aspectRatio.state.ratio, category: "state" },
        { label: "Resolved ratio", value: String(getRatioValue(scenarios.aspectRatio.state.ratio)), category: "state" },
        { label: "Composition", value: scenarios.aspectRatio.state.composition, category: "composition" },
      ],
    }];
  }

  if (scenarioId === "avatar") {
    const group = document.querySelector<HTMLElement>("[data-avatar-group]");
    const root = document.querySelector<HTMLElement>("[data-avatar-root]");
    const image = document.querySelector<HTMLElement>("[data-avatar-image]");
    const fallback = document.querySelector<HTMLElement>("[data-avatar-fallback]");
    const secondaryFallback = document.querySelector<HTMLElement>("[data-avatar-fallback-secondary]");
    return [
      {
        title: "Group",
        selector: "[data-avatar-group]",
        inactive: !group,
        summary: group ? "rendered" : "not rendered",
        rows: [
          { label: "Exists", value: bool(!!group), category: "presence" },
          { label: "Ref target", value: scenarios.avatar.state.groupRef, category: "identity" },
          { label: "Group", value: bool(scenarios.avatar.state.group), category: "state" },
          { label: "Composition", value: scenarios.avatar.state.groupComposition, category: "composition" },
        ],
      },
      {
        title: "Root",
        selector: "[data-avatar-root]",
        summary: scenarios.avatar.state.status,
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Ref target", value: scenarios.avatar.state.rootRef, category: "identity" },
          { label: "Source", value: scenarios.avatar.state.imageMode, category: "state" },
          { label: "Status", value: scenarios.avatar.state.status, category: "state" },
          { label: "Composition", value: scenarios.avatar.state.rootComposition, category: "composition" },
        ],
      },
      {
        title: "Image",
        selector: "[data-avatar-image]",
        inactive: !image,
        summary: image ? "rendered" : "not rendered",
        rows: [
          { label: "Exists", value: bool(!!image), category: "presence" },
          { label: "Ref target", value: scenarios.avatar.state.imageRef, category: "identity" },
          { label: "Source", value: getAvatarSourceLabel(scenarios.avatar.state.imageMode) || "(empty)", category: "state" },
          { label: "Alt", value: getAvatarAlt(scenarios.avatar.state.altMode) || "(empty)", category: "state" },
          { label: "Alt mode", value: scenarios.avatar.state.altMode, category: "state" },
          { label: "Composition", value: scenarios.avatar.state.imageComposition, category: "composition" },
        ],
      },
      {
        title: "Fallback: WD",
        selector: "[data-avatar-fallback]",
        inactive: !fallback,
        summary: fallback ? "rendered" : "not rendered",
        rows: [
          { label: "Exists", value: bool(!!fallback), category: "presence" },
          { label: "Ref target", value: scenarios.avatar.state.fallbackRef, category: "identity" },
          { label: "Delay", value: scenarios.avatar.state.delay ? "600ms" : "0ms", category: "behavior" },
          { label: "Composition", value: scenarios.avatar.state.fallbackComposition, category: "composition" },
        ],
      },
      {
        title: "Fallback: FS",
        selector: "[data-avatar-fallback-secondary]",
        inactive: !secondaryFallback,
        summary: secondaryFallback ? "rendered" : "not rendered",
        rows: [
          { label: "Exists", value: bool(!!secondaryFallback), category: "presence" },
          { label: "Ref target", value: "none", category: "identity" },
          { label: "Text", value: "FS", category: "state" },
          { label: "Delay", value: "0ms", category: "behavior" },
          { label: "Composition", value: "default", category: "composition" },
        ],
      },
    ];
  }

  if (scenarioId === "label") {
    const label = document.querySelector<HTMLElement>("[data-label-root]");
    const input = document.querySelector<HTMLInputElement>("[data-input-root]");
    return [
      {
        title: "Root",
        selector: "[data-label-root]",
        summary: label?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!label), category: "presence" },
          { label: "Disabled", value: bool(scenarios.label.state.disabled), category: "state" },
          { label: "Invalid", value: bool(scenarios.label.state.invalid), category: "state" },
          { label: "Required", value: bool(scenarios.label.state.required), category: "state" },
          { label: "Read only", value: bool(scenarios.label.state.readOnly), category: "state" },
          { label: "htmlFor", value: scenarios.label.state.withHtmlFor ? "display-label-input" : "none", category: "behavior" },
          { label: "Matches input", value: bool(!!label && !!input && label.getAttribute("for") === input.id), category: "behavior" },
          { label: "Composition", value: scenarios.label.state.composition, category: "composition" },
        ],
      },
      {
        title: "Control",
        selector: "[data-input-root]",
        summary: input?.value || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!input), category: "presence" },
          { label: "Value", value: input?.value ?? "none", category: "state" },
        ],
      },
    ];
  }

  if (scenarioId === "list") {
    const root = document.querySelector<HTMLElement>("[data-list-root]");
    const plan = document.querySelector<HTMLElement>("[data-list-item]");
    const billing = document.querySelector<HTMLElement>("[data-list-disabled-item]");
    const review = document.querySelector<HTMLElement>("[data-list-last-item]");
    return [
      {
        title: "Root",
        selector: "[data-list-root]",
        summary: scenarios.list.state.ordered ? "ordered" : "unordered",
        rows: [
          { label: "Exists", value: bool(!!root), category: "presence" },
          { label: "Ref target", value: scenarios.list.state.rootRef, category: "identity" },
          { label: "Ordered", value: bool(scenarios.list.state.ordered), category: "state" },
          { label: "Composition", value: scenarios.list.state.rootComposition, category: "composition" },
        ],
      },
      {
        title: "Item: Plan",
        selector: "[data-list-item]",
        summary: plan?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!plan), category: "presence" },
          { label: "Ref target", value: scenarios.list.state.itemRef, category: "identity" },
          { label: "Composition", value: scenarios.list.state.itemComposition, category: "composition" },
        ],
      },
      {
        title: "Item: Billing",
        selector: "[data-list-disabled-item]",
        summary: billing?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!billing), category: "presence" },
          { label: "Disabled", value: bool(scenarios.list.state.disabledItem), category: "state" },
        ],
      },
      {
        title: "Item: Review",
        selector: "[data-list-last-item]",
        summary: review?.textContent?.trim() || "not rendered",
        rows: [
          { label: "Exists", value: bool(!!review), category: "presence" },
        ],
      },
    ];
  }

  return [];
}

function getListItemSource(composition: CompositionMode) {
  if (composition === "asChild") {
    return `<List.Item asChild>
  <li>Plan setup</li>
</List.Item>`;
  }

  if (composition === "render") {
    return `<List.Item render={(props) => <li {...props}>Plan setup</li>} />`;
  }

  return `<List.Item>Plan setup</List.Item>`;
}

function indent(source: string, spaces: number) {
  const prefix = " ".repeat(spaces);
  return source.split("\n").map((line) => `${prefix}${line}`).join("\n");
}

function getAvatarSrc(imageMode: AvatarImageMode) {
  if (imageMode === "loaded") return avatarLoadedSrc;
  if (imageMode === "broken") return "/missing-avatar.png";
  return avatarLoadingSrc;
}

function getAvatarSourceLabel(imageMode: AvatarImageMode) {
  if (imageMode === "loaded") return "/user.png";
  if (imageMode === "broken") return "/missing-avatar.png";
  return avatarLoadingSrc;
}

function getAvatarAlt(altMode: AvatarAltMode) {
  return altMode === "decorative" ? "" : "Will Donin";
}

function getAvatarRootSource(state: ReturnType<typeof useAvatarScenario>["state"]) {
  const rootOpen = `<Avatar.Root src="${getAvatarSourceLabel(state.imageMode)}"`;
  const image = getAvatarImageSource(state);
  const fallback = getAvatarFallbackSource(state);

  if (state.rootComposition === "asChild") {
    return `${rootOpen} asChild>
  <span>
${indent(image, 4)}
${indent(fallback, 4)}
  </span>
</Avatar.Root>`;
  }

  if (state.rootComposition === "render") {
    return `${rootOpen}
  render={(props) => <span {...props} />}
>
${indent(image, 2)}
${indent(fallback, 2)}
</Avatar.Root>`;
  }

  return `${rootOpen}>
${indent(image, 2)}
${indent(fallback, 2)}
</Avatar.Root>`;
}

function getAvatarImageSource(state: ReturnType<typeof useAvatarScenario>["state"]) {
  const alt = getAvatarAlt(state.altMode);
  const src = getAvatarSourceLabel(state.imageMode);

  if (state.imageComposition === "asChild") {
    return `<Avatar.Image src="${src}" alt="${alt}" asChild>
  <img />
</Avatar.Image>`;
  }

  if (state.imageComposition === "render") {
    return `<Avatar.Image src="${src}" alt="${alt}" render={(props) => <img {...props} />} />`;
  }

  return `<Avatar.Image src="${src}" alt="${alt}" />`;
}

function getAvatarFallbackSource(state: ReturnType<typeof useAvatarScenario>["state"]) {
  const delay = state.delay ? " delayMs={600}" : "";

  if (state.fallbackComposition === "asChild") {
    return `<Avatar.Fallback${delay} asChild>
  <span>WD</span>
</Avatar.Fallback>`;
  }

  if (state.fallbackComposition === "render") {
    return `<Avatar.Fallback${delay} render={(props) => <span {...props}>WD</span>} />`;
  }

  return `<Avatar.Fallback${delay}>WD</Avatar.Fallback>`;
}

function getDisplayPrimitiveLog(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
) {
  if (scenarioId === "badge") return scenarios.badge.state.log;
  if (scenarioId === "divider") return scenarios.divider.state.log;
  if (scenarioId === "aspect-ratio") return scenarios.aspectRatio.state.log;
  if (scenarioId === "avatar") return scenarios.avatar.state.log;
  if (scenarioId === "label") return scenarios.label.state.log;
  if (scenarioId === "list") return scenarios.list.state.log;
  return [];
}

function getDisplayPrimitiveActions(
  scenarioId: string,
  scenarios: DisplayPrimitiveScenarios,
) {
  if (scenarioId === "badge") return scenarios.badge.actions;
  if (scenarioId === "divider") return scenarios.divider.actions;
  if (scenarioId === "aspect-ratio") return scenarios.aspectRatio.actions;
  if (scenarioId === "avatar") return scenarios.avatar.actions;
  if (scenarioId === "label") return scenarios.label.actions;
  if (scenarioId === "list") return scenarios.list.actions;
  return null;
}

function CompositionToolbarGroup({
  value,
  onChange,
}: {
  value: CompositionMode;
  onChange: (value: CompositionMode) => void;
}) {
  return (
    <ToolbarGroup title="Composition" value="composition">
      <MenuRadioControl label="Root" options={compositionOptions} value={value} onChange={onChange} />
    </ToolbarGroup>
  );
}

function getRatioValue(ratio: AspectRatioValue) {
  if (ratio === "4:3") return 4 / 3;
  if (ratio === "1:1") return 1;
  if (ratio === "invalid") return 0;
  return 16 / 9;
}

function bool(value: boolean) {
  return value ? "true" : "false";
}

const compositionOptions = ["default", "asChild", "render"] as const;
const badgeContentOptions = ["Ready", "Beta", "12"] as const;
const badgeToneOptions = ["neutral", "success", "warning"] as const;
const dividerOrientationOptions = ["horizontal", "vertical"] as const;
const aspectRatioOptions = ["16:9", "4:3", "1:1", "invalid"] as const;
const avatarImageOptions = ["loaded", "broken", "loading"] as const;
const avatarAltOptions = ["meaningful", "decorative"] as const;
