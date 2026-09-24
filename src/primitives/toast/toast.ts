import { defaultToastStore, getDefaultToastDuration, type ToastStore } from "./store.js";
import type { ToastId, ToastOptions, ToastPromiseOptions, ToastUpdateOptions } from "./types.js";

export function createToastApi(store: ToastStore = defaultToastStore) {
const addToast = store.create;
const updateToast = store.update;
const dismissToast = store.dismiss;
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
  promise: Promise<T> | (() => Promise<T>),
  options: ToastPromiseOptions<T>,
): Promise<T> => {
  const loadingOptions =
    typeof options.loading === "object" && options.loading !== null
      ? options.loading
      : { title: options.loading };
  const id = addToast({ type: "loading", duration: Infinity, ...loadingOptions });

  try {
    const result = await (typeof promise === "function" ? promise() : promise);
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

createToast.update = (id: ToastId, options: ToastUpdateOptions): void => {
  updateToast(id, options);
};

createToast.pause = store.pause;
createToast.resume = store.resume;
createToast.remove = store.remove;
createToast.isVisible = store.isVisible;
createToast.isDismissed = store.isDismissed;
createToast.getCount = store.getCount;
createToast.getVisibleToasts = store.getVisibleToasts;
createToast.expand = store.expand;
createToast.collapse = store.collapse;
createToast.store = store;
createToast.track = <T>(promise: Promise<T> | (() => Promise<T>), options: ToastPromiseOptions<T>) => {
  const loading = typeof options.loading === "string" ? {title:options.loading} : options.loading;
  const id = store.create({...loading,type:"loading",duration:Infinity});
  const result = createToast.promise(promise,{...options,loading:{...loading,id}});
  return {id,unwrap:() => result};
};
return createToast;
}
export const toast = createToastApi();
