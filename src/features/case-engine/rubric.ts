import type { EvidenceReceiptLike } from "./experiment";

export interface EvidenceSummary {
  selectedReceiptCount: number;
  controlledReceiptCount: number;
  relevantControlledReceiptCount: number;
  hasThreshold: boolean;
}

export const REQUIRED_RELEVANT_CONTROLLED_RECEIPTS = 2;

export function getEvidenceSummary(receipts: readonly EvidenceReceiptLike[]): EvidenceSummary {
  const controlled = receipts.filter((receipt) => receipt.isControlled);
  const relevant = controlled.filter(
    (receipt) => receipt.changedFields.length === 1 && receipt.changedFields[0] === "zone",
  );

  return {
    selectedReceiptCount: receipts.length,
    controlledReceiptCount: controlled.length,
    relevantControlledReceiptCount: relevant.length,
    hasThreshold: relevant.length >= REQUIRED_RELEVANT_CONTROLLED_RECEIPTS,
  };
}

export type DeterministicClaimVerdict = "supported" | "inconclusive" | "contradicted";

/** A deliberately narrow, explainable language check used only by local fallback mode. */
export function assessClaimLanguage(
  hypothesis: string,
  summary: EvidenceSummary,
): DeterministicClaimVerdict {
  if (!summary.hasThreshold) return "inconclusive";

  const normalized = hypothesis.toLowerCase();
  const namesRelevantVariable = /\b(zone|commute|location)\b/.test(normalized);
  const namesHarm = /\b(penal|lower|drop|unfair|bias|treat|different|discriminat)\w*/.test(
    normalized,
  );
  const namesOtherVariable = /\b(topic|availability|skill|collaboration|accessibility)\b/.test(
    normalized,
  );

  if (namesRelevantVariable && namesHarm) return "supported";
  if (namesOtherVariable && !namesRelevantVariable) return "contradicted";
  return "inconclusive";
}

export function repairIsUnlocked(
  receipts: readonly EvidenceReceiptLike[],
  verdict: DeterministicClaimVerdict,
): boolean {
  return getEvidenceSummary(receipts).hasThreshold && verdict === "supported";
}
