import {
  addToast,
  dismissToast,
  getDefaultToastDuration,
  updateToast,
} from "./store.js";
import type { ToastId, ToastOptions, ToastPromiseOptions } from "./types.js";

function createToast(message: string | ToastOptions, options?: ToastOptions): ToastId {
  const resolvedOptions =
    typeof message === "object" && message !== null
      ? { ...message, ...options }
      : { ...options, title: message };

  return addToast({ type: "default", ...resolvedOptions });
}

createToast.success = (message: string, options?: Omit<ToastOptions, "type">): ToastId =>
  addToast({ type: "success", title: message, ...options });

createToast.error = (message: string, options?: Omit<ToastOptions, "type">): ToastId =>
  addToast({ type: "error", title: message, ...options });

createToast.warning = (message: string, options?: Omit<ToastOptions, "type">): ToastId =>
  addToast({ type: "warning", title: message, ...options });

createToast.info = (message: string, options?: Omit<ToastOptions, "type">): ToastId =>
  addToast({ type: "info", title: message, ...options });

createToast.loading = (message: string, options?: Omit<ToastOptions, "type">): ToastId =>
  addToast({ type: "loading", title: message, duration: Infinity, ...options });

createToast.promise = async <T>(
  promise: Promise<T>,
  options: ToastPromiseOptions<T>,
): Promise<T> => {
  const loadingOptions =
    typeof options.loading === "object" && options.loading !== null
      ? options.loading
      : { title: options.loading };
  const id = addToast({ type: "loading", duration: Infinity, ...loadingOptions });

  try {
    const result = await promise;
    const successResult =
      typeof options.success === "function" ? options.success(result) : options.success;
    const successOptions =
      typeof successResult === "object" && successResult !== null
        ? successResult
        : { title: successResult };

    updateToast(id, {
      type: "success",
      duration: getDefaultToastDuration("success"),
      ...successOptions,
    });
    return result;
  } catch (error) {
    const errorResult = typeof options.error === "function" ? options.error(error) : options.error;
    const errorOptions =
      typeof errorResult === "object" && errorResult !== null
        ? errorResult
        : { title: errorResult };

    updateToast(id, {
      type: "error",
      duration: getDefaultToastDuration("error"),
      ...errorOptions,
    });
    throw error;
  }
};

createToast.dismiss = (id?: ToastId): void => {
  dismissToast(id);
};

createToast.update = (id: ToastId, options: Partial<ToastOptions>): void => {
  updateToast(id, options);
};

export { createToast as toast };
