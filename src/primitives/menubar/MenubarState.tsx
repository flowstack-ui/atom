"use client";
import { forwardRef, useCallback, useState, type ReactNode } from "react";
import { MenubarRoot, type MenubarRootProps } from "./MenubarRoot.js";
import { useMenubarContext } from "./context.js";

export interface UseMenubarOptions { value?: string | null; defaultValue?: string; onValueChange?: (value: string | null) => void }
export interface UseMenubarReturn { readonly value: string | null; readonly setValue: (value: string | null) => void }
const controllers = new WeakSet<UseMenubarReturn>();
export function useMenubar(options: UseMenubarOptions = {}): UseMenubarReturn {
  const [internal, setInternal] = useState<string | null>(options.defaultValue ?? null);
  const value = options.value === undefined ? internal : options.value;
  const setValue = useCallback((next: string | null) => { if (options.value === undefined) setInternal(next); if (next !== value) options.onValueChange?.(next); }, [options.value, options.onValueChange, value]);
  const controller = { value, setValue };
  controllers.add(controller);
  return controller;
}
export interface MenubarRootProviderProps extends Omit<MenubarRootProps, "value" | "defaultValue" | "onValueChange"> { value: UseMenubarReturn }
export const MenubarRootProvider = forwardRef<HTMLElement, MenubarRootProviderProps>(function MenubarRootProvider({ value, ...props }, ref) {
  if (!controllers.has(value)) throw new Error("Menubar.RootProvider requires the unchanged controller returned by useMenubar.");
  return <MenubarRoot {...props} value={value.value} onValueChange={value.setValue} ref={ref} />;
});
export function useMenubarState(): UseMenubarReturn {
  const context = useMenubarContext();
  return { value: context.openValue, setValue: value => value === null ? context.onMenuClose() : context.onMenuOpen(value) };
}
export interface MenubarContextProps { children: (state: UseMenubarReturn) => ReactNode }
export function MenubarContext({ children }: MenubarContextProps) { return children(useMenubarState()); }
