import { version } from "react";

/** React 18 forwards inert as an unknown string attribute; React 19 owns its boolean form. */
export function menuInertValue(closed: boolean, reactVersion = version): true | "" | undefined {
  return closed ? (parseInt(reactVersion, 10) >= 19 ? true : "") : undefined;
}
