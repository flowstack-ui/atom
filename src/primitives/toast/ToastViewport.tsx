"use client";

import {
  Fragment,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
  type KeyboardEvent as ReactKeyboardEvent,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { useOverlayLayerHost } from "../../hooks/overlayScope.js";
import { useFocusScopeContainer } from "../../hooks/focus.js";
import { Portal, type PortalProps } from "../../utils/Portal.js";
import { cloneAndMerge, composeEventHandlers, composeRefs, renderElement, type RenderProp } from "../../utils/slot.js";
import { visuallyHiddenStyle } from "../visually-hidden/index.js";
import { ToastViewportContextProvider, useToastProviderContext } from "./context.js";
import { ToastAction } from "./ToastAction.js";
import { ToastCancel } from "./ToastCancel.js";
import { ToastClose } from "./ToastClose.js";
import { ToastDescription } from "./ToastDescription.js";
import { ToastRoot } from "./ToastRoot.js";
import { ToastTitle } from "./ToastTitle.js";
import type { ToastData, ToastPosition, ToastViewportRenderState } from "./types.js";
import { useToastStore } from "./useToastStore.js";

type ToastViewportNativeProps = NativeDivProps<"children">;

export interface ToastViewportProps extends ToastViewportNativeProps {
  position?: ToastPosition;
  container?: PortalProps["container"];
  portalDisabled?: PortalProps["disabled"];
  renderToast?: (state: ToastViewportRenderState) => ReactNode;
  children?: ReactNode;
  render?: RenderProp;
  asChild?: boolean;
  "data-slot"?: string;
}

function renderDefaultToast(toast: ToastData, index: number, expanded: boolean): ReactNode {
  return (
    <ToastRoot key={toast.id} toast={toast} index={index} expanded={expanded}>
      <ToastTitle />
      <ToastDescription />
      <ToastAction />
      <ToastCancel />
      <ToastClose />
    </ToastRoot>
  );
}

function isBottomPosition(position: ToastPosition): boolean {
  return position.startsWith("bottom");
}

function matchesHotkey(event: KeyboardEvent, hotkey: readonly string[]): boolean {
  if (hotkey.length === 0) return false;
  return hotkey.every((code) => {
    if (code === "ControlLeft" || code === "ControlRight") return event.ctrlKey;
    if (code === "AltLeft" || code === "AltRight") return event.altKey;
    if (code === "ShiftLeft" || code === "ShiftRight") return event.shiftKey;
    if (code === "MetaLeft" || code === "MetaRight") return event.metaKey;
    return event.code === code;
  });
}

function formatHotkey(hotkey: readonly string[]): string {
  return hotkey.map((code) => code.replace(/(Left|Right)$/, "")).join("+");
}

function getToastAnnouncementText(content: ReactNode): string {
  if (typeof content === "string" || typeof content === "number") {
    return String(content);
  }

  if (Array.isArray(content)) {
    return content.map(getToastAnnouncementText).filter(Boolean).join(" ");
  }

  if (isValidElement<{ children?: ReactNode }>(content)) {
    return getToastAnnouncementText(content.props.children);
  }

  return "";
}

function getToastAnnouncement(toast: ToastData): string {
  return [toast.title, toast.description]
    .map(getToastAnnouncementText)
    .filter(Boolean)
    .join(" ");
}

export const ToastViewport = forwardRef<HTMLDivElement, ToastViewportProps>(
  function ToastViewport(
    {
      position = "bottom-right",
      container,
      portalDisabled,
      renderToast,
      children,
      render,
      asChild,
      "data-slot": dataSlot = "toast-viewport",
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onKeyDown,
      ...restProps
    },
    ref,
  ) {
    const provider = useToastProviderContext();
    const store = provider.store;
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const layerHostRef = useOverlayLayerHost();
    const politeRef = useRef<HTMLDivElement | null>(null);
    const assertiveRef = useRef<HTMLDivElement | null>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const hoverRef = useRef(false);
    const focusRef = useRef(false);
    const allToasts = useToastStore(store);
    const expanded = store.isExpanded();
    const setExpanded = useCallback((value: boolean) => value ? store.expand() : store.collapse(), [store]);
    const dismissToast = store.dismiss;
    const ownerDocument = container?.ownerDocument ?? (typeof document !== "undefined" ? document : undefined);
    const [politeAnnouncement, setPoliteAnnouncement] = useState("");
    const [assertiveAnnouncement, setAssertiveAnnouncement] = useState("");
    const announcedMessagesRef = useRef(new Map<string, string>());
    const visibleToastEntries = useMemo(
      () =>
        allToasts.slice(-provider.maxVisible).map((toast, index) => ({
          toast,
          index,
        })),
      [allToasts, provider.maxVisible],
    );
    const orderedVisibleToastEntries = useMemo(
      () =>
        isBottomPosition(position) ? [...visibleToastEntries].reverse() : visibleToastEntries,
      [position, visibleToastEntries],
    );
    const visibleToasts = useMemo(
      () => visibleToastEntries.map((entry) => entry.toast),
      [visibleToastEntries],
    );
    useFocusScopeContainer(viewportRef, visibleToasts.length > 0);
    useFocusScopeContainer(politeRef, true);
    useFocusScopeContainer(assertiveRef, true);
    const visibleIdsRef = useRef<string[]>([]);
    visibleIdsRef.current = visibleToasts.map((toast) => toast.id);

    useEffect(() => { store.setVisible(visibleIdsRef.current); }, [store, visibleToasts]);
    useEffect(() => () => {
      store.setVisible([]);
      store.resume(undefined, "hover");
      store.resume(undefined, "focus");
    }, [store]);
    useEffect(() => {
      if (visibleToasts.length || !previousFocusRef.current) return;
      const previous = previousFocusRef.current;
      previousFocusRef.current = null;
      if (previous.isConnected) previous.focus();
    }, [visibleToasts.length]);

    const pauseVisibleToasts = useCallback((reason = "hover") => {
      store.pause(undefined, reason);
    }, [store]);

    const resumeVisibleToasts = useCallback((reason = "hover") => {
      store.resume(undefined, reason);
    }, [store]);

    const handleMouseEnter = useCallback<MouseEventHandler<HTMLDivElement>>(
      () => {
        hoverRef.current = true;
        if (provider.expandOnHover) setExpanded(true);
        if (provider.pauseOnHover) pauseVisibleToasts();
      },
      [pauseVisibleToasts, provider.expandOnHover, provider.pauseOnHover],
    );

    const handleMouseLeave = useCallback<MouseEventHandler<HTMLDivElement>>(
      () => {
        hoverRef.current = false;
        if (provider.expandOnHover && !focusRef.current) setExpanded(false);
        if (provider.pauseOnHover) resumeVisibleToasts();
      },
      [provider.expandOnHover, provider.pauseOnHover, resumeVisibleToasts],
    );

    useEffect(() => {
      const win = ownerDocument?.defaultView;
      if (!provider.pauseOnFocusLoss || !win || !ownerDocument) return undefined;
      const blur = () => pauseVisibleToasts("window");
      const focus = () => resumeVisibleToasts("window");
      const visibility = () => ownerDocument.hidden ? pauseVisibleToasts("page") : resumeVisibleToasts("page");
      visibility();
      win.addEventListener("blur", blur);
      win.addEventListener("focus", focus);
      ownerDocument.addEventListener("visibilitychange", visibility);

      return () => {
        win.removeEventListener("blur", blur);
        win.removeEventListener("focus", focus);
        ownerDocument.removeEventListener("visibilitychange", visibility);
        resumeVisibleToasts("window");
        resumeVisibleToasts("page");
      };
    }, [ownerDocument, pauseVisibleToasts, provider.pauseOnFocusLoss, resumeVisibleToasts]);

    useEffect(() => {
      const nextIds = new Set(allToasts.map((toast) => toast.id));
      const politeMessages: string[] = [];
      const assertiveMessages: string[] = [];

      announcedMessagesRef.current.forEach((_, id) => {
        if (!nextIds.has(id)) announcedMessagesRef.current.delete(id);
      });

      allToasts.forEach((toast) => {
        if (toast.status !== "visible") return;
        const message = getToastAnnouncement(toast);
        if (!message) return;

        const announcementKey = `${toast.type}:${message}`;
        if (announcedMessagesRef.current.get(toast.id) === announcementKey) return;

        announcedMessagesRef.current.set(toast.id, announcementKey);

        if (toast.type === "error" || toast.type === "warning") {
          assertiveMessages.push(message);
        } else {
          politeMessages.push(message);
        }
      });

      if (politeMessages.length > 0) setPoliteAnnouncement(politeMessages.join("\n"));
      if (assertiveMessages.length > 0) setAssertiveAnnouncement(assertiveMessages.join("\n"));

      const clearTimer = setTimeout(() => {
        setPoliteAnnouncement("");
        setAssertiveAnnouncement("");
      }, 1000);

      return () => clearTimeout(clearTimer);
    }, [allToasts]);

    const restoreFocusAfterDismiss = useCallback(() => {
      setTimeout(() => {
        const viewport = viewportRef.current;
        if (viewport?.isConnected && viewport.querySelector('[data-slot="toast"]')) {
          viewport.focus();
          return;
        }
        const previous = previousFocusRef.current;
        if (previous?.isConnected) previous.focus();
        previousFocusRef.current = null;
      }, 0);
    }, []);
    const viewportContextValue = useMemo(
      () => ({ restoreFocusAfterDismiss }),
      [restoreFocusAfterDismiss],
    );

    useEffect(() => {
      const handleDocumentKeyDown = (event: KeyboardEvent) => {
        if (!matchesHotkey(event, provider.hotkey) || visibleIdsRef.current.length === 0) return;
        event.preventDefault();
        const activeElement = ownerDocument?.activeElement;
        previousFocusRef.current = activeElement && "focus" in activeElement ? activeElement as HTMLElement : null;
        viewportRef.current?.focus();
      };
      ownerDocument?.addEventListener("keydown", handleDocumentKeyDown);
      return () => ownerDocument?.removeEventListener("keydown", handleDocumentKeyDown);
    }, [ownerDocument, provider.hotkey]);

    const handleFocus = useCallback<FocusEventHandler<HTMLDivElement>>(() => {
      focusRef.current = true;
      if (provider.pauseOnFocus) pauseVisibleToasts("focus");
      if (provider.expandOnHover) setExpanded(true);
    }, [pauseVisibleToasts, provider.expandOnHover, provider.pauseOnFocus]);

    const handleBlur = useCallback<FocusEventHandler<HTMLDivElement>>((event) => {
      if (event.currentTarget.contains(event.relatedTarget)) return;
      focusRef.current = false;
      if (provider.pauseOnFocus) resumeVisibleToasts("focus");
      if (provider.expandOnHover && !hoverRef.current) setExpanded(false);
    }, [provider.expandOnHover, provider.pauseOnFocus, resumeVisibleToasts]);

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>((event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Escape" || event.target !== event.currentTarget) return;
      const newestDismissible = visibleToasts.find((toast) => toast.dismissible);
      if (!newestDismissible) return;
      event.preventDefault();
      event.stopPropagation();
      dismissToast(newestDismissible.id);
      restoreFocusAfterDismiss();
    }, [restoreFocusAfterDismiss, visibleToasts]);

    const generatedContent = orderedVisibleToastEntries.map(({ toast, index }) =>
      renderToast
        ? <Fragment key={toast.id}>{renderToast({ toast, index, expanded })}</Fragment>
        : renderDefaultToast(toast, index, expanded),
    );
    const content = asChild ? generatedContent : (children ?? generatedContent);

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref: composeRefs(viewportRef, layerHostRef, ref),
      role: "region",
      tabIndex: -1,
      "aria-label": provider.hotkey.length > 0
        ? `${provider.label} (${formatHotkey(provider.hotkey)})`
        : provider.label,
      "data-slot": dataSlot,
      "data-position": position,
      style: {
        "--atom-toast-count": visibleToasts.length,
        "--atom-toast-total-height": `${visibleToasts.reduce((sum,item) => sum + (item.height ?? 0),0)}px`,
        "--atom-toast-front-height": `${visibleToasts[0]?.height ?? 0}px`,
        ...restProps.style,
      },
      ...(expanded && { "data-expanded": "" }),
      onMouseEnter: composeEventHandlers(onMouseEnter, handleMouseEnter),
      onMouseLeave: composeEventHandlers(onMouseLeave, handleMouseLeave),
      onFocus: composeEventHandlers(onFocus, handleFocus),
      onBlur: composeEventHandlers(onBlur, handleBlur),
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    };

    const viewport = asChild
      ? cloneAndMerge(children, { ...behaviorProps, children: content })
      : renderElement(render, "div", { ...behaviorProps, children: content });

    return (
      <Portal container={container} disabled={portalDisabled}>
        <div
          ref={politeRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-slot="toast-announcer-polite"
          style={visuallyHiddenStyle}
        >
          {politeAnnouncement}
        </div>
        <div
          ref={assertiveRef}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          data-slot="toast-announcer-assertive"
          style={visuallyHiddenStyle}
        >
          {assertiveAnnouncement}
        </div>
        {visibleToasts.length > 0 ? (
          <ToastViewportContextProvider value={viewportContextValue}>
            {viewport}
          </ToastViewportContextProvider>
        ) : null}
      </Portal>
    );
  },
);
