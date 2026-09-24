"use client";
import { forwardRef } from "react";
import { NavigationMenuRoot, type NavigationMenuRootProps } from "./NavigationMenuRoot.js";
import { NavigationMenuControllerViewportContext, useNavigationMenuContext } from "./context.js";
export interface NavigationMenuSubProps extends NavigationMenuRootProps {}
export const NavigationMenuSub = forwardRef<HTMLDivElement, NavigationMenuSubProps>(
  function NavigationMenuSub({ "data-slot": slot = "navigation-menu-sub", render = <div />, ...props }, ref) {
    const parent = useNavigationMenuContext();
    return <NavigationMenuControllerViewportContext.Provider value={null}><NavigationMenuRoot
      orientation={parent.orientation} dir={parent.dir} loop={parent.loop}
      openDelay={props.delayDuration === undefined ? parent.delayDuration : undefined}
      closeDelay={props.delayDuration === undefined ? parent.closeDelay : undefined}
      skipDelayDuration={parent.skipDelayDuration}
      disableClickTrigger={parent.disableClickTrigger}
      disableHoverTrigger={parent.disableHoverTrigger}
      disablePointerLeaveClose={parent.disablePointerLeaveClose}
      lazyMount={parent.lifecycleExplicit ? parent.lazyMount : undefined}
      unmountOnExit={parent.lifecycleExplicit ? parent.unmountOnExit : undefined} hideMode={parent.hideMode}
      viewport={parent.viewport}
      {...props} render={render} data-slot={slot} ref={ref}
    /></NavigationMenuControllerViewportContext.Provider>;
  },
);
