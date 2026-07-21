import { describe, expect, it } from "vitest";
import { mapFallbackCoach } from "./fallback";

const zoneReceipt = (id: string) => ({
  id,
  modelVersion: "StudyMatch v0.7" as const,
  referenceScore: 86,
  comparisonScore: 42,
  scoreDelta: 44,
  changedFields: ["zone"] as const,
  isControlled: true,
});

describe("local Evidence Coach fallback", () => {
  it("protects the hidden rule when evidence is insufficient", () => {
    const result = mapFallbackCoach({
      receipts: [zoneReceipt("r1")],
      hypothesis: "I think the model is unfair.",
    });
    expect(result.verdict).toBe("inconclusive");
    expect(result.revealRepairAccess).toBe(false);
    expect(result.feedback.toLowerCase()).toContain("do not have enough evidence");
    expect(result.feedback.toLowerCase()).not.toContain("penalty");
  });

  it("supports a claim grounded in two controlled receipts", () => {
    const result = mapFallbackCoach({
      receipts: [zoneReceipt("r1"), zoneReceipt("r2")],
      hypothesis:
        "StudyMatch unfairly lowers the result for a Zone C commute when the learning profile stays the same.",
    });
    expect(result.verdict).toBe("supported");
    expect(result.revealRepairAccess).toBe(true);
    expect(result.evidenceAssessment.map((item) => item.receiptId)).toEqual(["r1", "r2"]);
  });
});
