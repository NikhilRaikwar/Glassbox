import {
  assessClaimLanguage,
  getEvidenceSummary,
  repairIsUnlocked,
} from "@/features/case-engine/rubric";
import {
  EvidenceCoachResultSchema,
  type EvidenceCoachInput,
  type EvidenceCoachResult,
} from "./types";

function relevantReceiptExplanation(receipt: EvidenceCoachInput["receipts"][number]) {
  if (!receipt.isControlled) {
    return "This receipt changes more than one field, so it cannot isolate a cause.";
  }
  if (receipt.changedFields.length === 1 && receipt.changedFields[0] === "zone") {
    return `This controlled receipt isolates commute zone and records a ${receipt.scoreDelta}-point difference.`;
  }
  return "This is controlled, but it isolates a different variable from the repeated pattern needed here.";
}

/**
 * Offline, deterministic coach mapper. It never calculates a score or fairness
 * metric; it only applies the same evidence rubric used to unlock repair.
 */
export function mapFallbackCoach(input: EvidenceCoachInput): EvidenceCoachResult {
  const summary = getEvidenceSummary(input.receipts);
  const verdict = assessClaimLanguage(input.hypothesis, summary);
  const evidenceAssessment = input.receipts.map((receipt) => ({
    receiptId: receipt.id,
    relevance: !receipt.isControlled
      ? ("confounded" as const)
      : receipt.changedFields.length === 1 && receipt.changedFields[0] === "zone"
        ? ("strong" as const)
        : ("weak" as const),
    explanation: relevantReceiptExplanation(receipt),
  }));

  if (!summary.hasThreshold) {
    return EvidenceCoachResultSchema.parse({
      verdict: "inconclusive",
      evidenceAssessment,
      claimStrength: summary.controlledReceiptCount === 0 ? 0 : 1,
      feedback: `I do not have enough evidence yet. You need two controlled receipts that isolate the same visible variable before a repair can be justified. You currently have ${summary.relevantControlledReceiptCount}.`,
      nextBestExperiment: {
        changeOnly: "Commute zone",
        rationale:
          "Keep topic, availability, skill, collaboration preference, and accessibility setting identical. Change only commute zone and pin the new receipt.",
      },
      revealRepairAccess: false,
    });
  }

  if (verdict === "supported") {
    return EvidenceCoachResultSchema.parse({
      verdict,
      evidenceAssessment,
      claimStrength: 4,
      feedback: `Your selected controlled receipts (${input.receipts
        .filter((receipt) => receipt.isControlled && receipt.changedFields[0] === "zone")
        .map((receipt) => receipt.id)
        .join(
          ", ",
        )}) repeat the same isolated comparison. Your claim connects that evidence to a harmful rule, so you can test a repair.`,
      nextBestExperiment: null,
      revealRepairAccess: repairIsUnlocked(input.receipts, verdict),
    });
  }

  if (verdict === "contradicted") {
    return EvidenceCoachResultSchema.parse({
      verdict,
      evidenceAssessment,
      claimStrength: 1,
      feedback:
        "Your strongest selected receipts isolate commute zone, not the variable named in your claim. Revise the claim so it matches the change shown on the receipts.",
      nextBestExperiment: null,
      revealRepairAccess: false,
    });
  }

  return EvidenceCoachResultSchema.parse({
    verdict,
    evidenceAssessment,
    claimStrength: 2,
    feedback:
      "The receipts are strong, but the claim needs to name the variable that changed and describe how the model treated the otherwise equivalent profiles differently.",
    nextBestExperiment: null,
    revealRepairAccess: false,
  });
}
