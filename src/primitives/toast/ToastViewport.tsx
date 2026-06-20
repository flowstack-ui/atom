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
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type { NativeDivProps } from "../../utils/dom.js";
import { Portal, type PortalProps } from "../../utils/Portal.js";
import { cloneAndMerge, composeEventHandlers, renderElement, type RenderProp } from "../../utils/slot.js";
import { visuallyHiddenStyle } from "../visually-hidden/index.js";
import { useToastProviderContext } from "./context.js";
import { pauseToast, resumeToast } from "./store.js";
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
      ...restProps
    },
    ref,
  ) {
    const provider = useToastProviderContext();
    const allToasts = useToastStore();
    const [expanded, setExpanded] = useState(false);
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
    const visibleIdsRef = useRef<string[]>([]);
    visibleIdsRef.current = visibleToasts.map((toast) => toast.id);

    const pauseVisibleToasts = useCallback(() => {
      visibleIdsRef.current.forEach((id) => pauseToast(id));
    }, []);

    const resumeVisibleToasts = useCallback(() => {
      visibleIdsRef.current.forEach((id) => resumeToast(id));
    }, []);

    const handleMouseEnter = useCallback<MouseEventHandler<HTMLDivElement>>(
      () => {
        if (provider.expandOnHover) setExpanded(true);
        if (provider.pauseOnHover) pauseVisibleToasts();
      },
      [pauseVisibleToasts, provider.expandOnHover, provider.pauseOnHover],
    );

    const handleMouseLeave = useCallback<MouseEventHandler<HTMLDivElement>>(
      () => {
        if (provider.expandOnHover) setExpanded(false);
        if (provider.pauseOnHover) resumeVisibleToasts();
      },
      [provider.expandOnHover, provider.pauseOnHover, resumeVisibleToasts],
    );

    useEffect(() => {
      if (!provider.pauseOnFocusLoss) return undefined;

      window.addEventListener("blur", pauseVisibleToasts);
      window.addEventListener("focus", resumeVisibleToasts);

      return () => {
        window.removeEventListener("blur", pauseVisibleToasts);
        window.removeEventListener("focus", resumeVisibleToasts);
      };
    }, [pauseVisibleToasts, provider.pauseOnFocusLoss, resumeVisibleToasts]);

    useEffect(() => {
      const nextVisibleIds = new Set(visibleToasts.map((toast) => toast.id));
      const politeMessages: string[] = [];
      const assertiveMessages: string[] = [];

      announcedMessagesRef.current.forEach((_, id) => {
        if (!nextVisibleIds.has(id)) announcedMessagesRef.current.delete(id);
      });

      visibleToasts.forEach((toast) => {
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
    }, [visibleToasts]);

    const content =
      children ??
      orderedVisibleToastEntries.map(({ toast, index }) =>
        renderToast
          ? <Fragment key={toast.id}>{renderToast({ toast, index, expanded })}</Fragment>
          : renderDefaultToast(toast, index, expanded),
      );

    const behaviorProps: Record<string, unknown> = {
      ...restProps,
      ref,
      "data-slot": dataSlot,
      "data-position": position,
      ...(expanded && { "data-expanded": "" }),
      onMouseEnter: composeEventHandlers(onMouseEnter, handleMouseEnter),
      onMouseLeave: composeEventHandlers(onMouseLeave, handleMouseLeave),
    };

    const viewport = asChild
      ? cloneAndMerge(children, behaviorProps)
      : renderElement(render, "div", { ...behaviorProps, children: content });

    return (
      <Portal container={container} disabled={portalDisabled}>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-slot="toast-announcer-polite"
          style={visuallyHiddenStyle}
        >
          {politeAnnouncement}
        </div>
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          data-slot="toast-announcer-assertive"
          style={visuallyHiddenStyle}
        >
          {assertiveAnnouncement}
        </div>
        {visibleToasts.length > 0 ? viewport : null}
      </Portal>
    );
  },
);
