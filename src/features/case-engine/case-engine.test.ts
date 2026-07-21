import { describe, expect, it } from "vitest";
import {
  BASELINE_MODEL,
  INITIAL_COMPARISON_PROFILE,
  REFERENCE_PROFILE,
  compareEvaluationSuites,
  createReceipt,
  createRepairedModel,
  getEvidenceSummary,
  runEvaluationSuite,
  scoreProfile,
} from "./index";

describe("StudyMatch deterministic scorer", () => {
  it("keeps the required 44-point Zone C difference in v0.7", () => {
    const reference = scoreProfile(REFERENCE_PROFILE, BASELINE_MODEL);
    const comparison = scoreProfile(INITIAL_COMPARISON_PROFILE, BASELINE_MODEL);
    expect(reference.score).toBe(86);
    expect(comparison.score).toBe(42);
    expect(reference.score - comparison.score).toBe(44);
  });

  it("creates v0.8 without reading commute zone and uses selected factors", () => {
    const repaired = createRepairedModel(["topic-alignment", "collaboration-fit"]);
    const zoneCEquivalent = { ...REFERENCE_PROFILE, id: "maya-c", zone: "C" as const };
    expect(scoreProfile(REFERENCE_PROFILE, repaired).score).toBe(
      scoreProfile(zoneCEquivalent, repaired).score,
    );
    expect(scoreProfile(REFERENCE_PROFILE, repaired).score).toBeGreaterThan(
      scoreProfile(REFERENCE_PROFILE, createRepairedModel()).score,
    );
  });
});

describe("experiment receipts", () => {
  it("marks a single changed field as controlled and preserves the inputs", () => {
    const receipt = createReceipt({
      id: "test-controlled",
      createdAt: 1,
      reference: REFERENCE_PROFILE,
      comparison: INITIAL_COMPARISON_PROFILE,
      model: BASELINE_MODEL,
    });
    expect(receipt.isControlled).toBe(true);
    expect(receipt.changedFields).toEqual(["zone"]);
    expect(receipt.scoreDelta).toBe(44);
    expect(Object.isFrozen(receipt)).toBe(true);
    expect(Object.isFrozen(receipt.reference)).toBe(true);
  });

  it("marks multiple changed fields as confounded", () => {
    const receipt = createReceipt({
      id: "test-confounded",
      createdAt: 1,
      reference: REFERENCE_PROFILE,
      comparison: { ...INITIAL_COMPARISON_PROFILE, topic: "Climate" },
      model: BASELINE_MODEL,
    });
    expect(receipt.isControlled).toBe(false);
    expect(receipt.changedFields).toEqual(["topic", "zone"]);
  });
});

describe("evidence threshold and evaluation suite", () => {
  const controlledOne = createReceipt({
    id: "r1",
    createdAt: 1,
    reference: REFERENCE_PROFILE,
    comparison: INITIAL_COMPARISON_PROFILE,
    model: BASELINE_MODEL,
  });
  const controlledTwo = createReceipt({
    id: "r2",
    createdAt: 2,
    reference: { ...REFERENCE_PROFILE, id: "maya-b", zone: "B" },
    comparison: { ...REFERENCE_PROFILE, id: "maya-c", zone: "C" },
    model: BASELINE_MODEL,
  });

  it("requires two relevant controlled receipts before repair access", () => {
    expect(getEvidenceSummary([controlledOne]).hasThreshold).toBe(false);
    expect(getEvidenceSummary([controlledOne, controlledTwo]).hasThreshold).toBe(true);
  });

  it("measures an eight-pair improvement from the actual configurations", () => {
    const before = runEvaluationSuite(BASELINE_MODEL);
    const after = runEvaluationSuite(createRepairedModel(["topic-alignment", "collaboration-fit"]));
    const comparison = compareEvaluationSuites(before, after);
    expect(before.pairCount).toBe(8);
    expect(before.fairnessRate).toBe(37.5);
    expect(after.fairnessRate).toBe(100);
    expect(before.affectedPairCount).toBe(5);
    expect(after.affectedPairCount).toBe(0);
    expect(comparison.matchQualityDelta).toBeGreaterThan(0);
  });
});
