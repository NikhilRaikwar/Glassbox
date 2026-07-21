import { EVALUATION_PAIRS, type ModelConfig } from "./case-config";
import { scoreProfile } from "./scorer";

export interface EvaluationPairResult {
  id: string;
  leftScore: number;
  rightScore: number;
  scoreDifference: number;
  treatedEquivalently: boolean;
}

export interface EvaluationResult {
  modelVersion: ModelConfig["version"];
  pairResults: readonly EvaluationPairResult[];
  pairCount: number;
  equivalentTreatmentPairs: number;
  fairnessRate: number;
  averageMatchQuality: number;
  affectedPairCount: number;
}

export interface EvaluationComparison {
  before: EvaluationResult;
  after: EvaluationResult;
  fairnessDelta: number;
  matchQualityDelta: number;
  affectedPairDelta: number;
}

function rounded(value: number) {
  return Math.round(value * 10) / 10;
}

/** Runs the same eight equivalent-profile pairs against a supplied model version. */
export function runEvaluationSuite(model: ModelConfig): EvaluationResult {
  const pairResults = EVALUATION_PAIRS.map((pair) => {
    const leftScore = scoreProfile(pair.left, model).score;
    const rightScore = scoreProfile(pair.right, model).score;
    const scoreDifference = Math.abs(leftScore - rightScore);
    return {
      id: pair.id,
      leftScore,
      rightScore,
      scoreDifference,
      treatedEquivalently: scoreDifference === 0,
    };
  });
  const scores = pairResults.flatMap((result) => [result.leftScore, result.rightScore]);
  const equivalentTreatmentPairs = pairResults.filter(
    (result) => result.treatedEquivalently,
  ).length;

  return Object.freeze({
    modelVersion: model.version,
    pairResults: Object.freeze(pairResults),
    pairCount: pairResults.length,
    equivalentTreatmentPairs,
    fairnessRate: rounded((equivalentTreatmentPairs / pairResults.length) * 100),
    averageMatchQuality: rounded(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    affectedPairCount: pairResults.filter((result) => result.scoreDifference > 0).length,
  });
}

export function compareEvaluationSuites(
  before: EvaluationResult,
  after: EvaluationResult,
): EvaluationComparison {
  return {
    before,
    after,
    fairnessDelta: rounded(after.fairnessRate - before.fairnessRate),
    matchQualityDelta: rounded(after.averageMatchQuality - before.averageMatchQuality),
    affectedPairDelta: after.affectedPairCount - before.affectedPairCount,
  };
}
