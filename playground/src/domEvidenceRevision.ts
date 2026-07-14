import { createContext } from "react";
import { shouldRefreshDomEvidence } from "./domEvidence";

export const DomEvidenceRevisionContext = createContext(0);

export function createDomEvidenceRevisionScheduler(onRevision: () => void) {
  let frame = 0;

  return {
    cancel() {
      cancelAnimationFrame(frame);
    },
    schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(onRevision);
    },
  };
}

export function hasDomEvidenceMutation(records: MutationRecord[]) {
  return records.some((record) => (
    record.type === "childList" ||
    (record.type === "attributes" && shouldRefreshDomEvidence(record.attributeName))
  ));
}
