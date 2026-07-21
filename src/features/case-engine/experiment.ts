import {
  FIELD_LABELS,
  PROFILE_FIELDS,
  type ModelConfig,
  type Profile,
  type ProfileField,
} from "./case-config";
import { scoreProfile } from "./scorer";

export interface TestReceipt {
  readonly id: string;
  readonly createdAt: number;
  readonly modelVersion: ModelConfig["version"];
  readonly reference: Profile;
  readonly comparison: Profile;
  readonly referenceScore: number;
  readonly comparisonScore: number;
  readonly referenceRecommended: boolean;
  readonly comparisonRecommended: boolean;
  readonly scoreDelta: number;
  readonly changedFields: readonly ProfileField[];
  readonly isControlled: boolean;
  readonly explanation: string;
}

export type EvidenceReceiptLike = Pick<
  TestReceipt,
  | "id"
  | "modelVersion"
  | "referenceScore"
  | "comparisonScore"
  | "scoreDelta"
  | "changedFields"
  | "isControlled"
>;

export function getChangedFields(reference: Profile, comparison: Profile): ProfileField[] {
  return PROFILE_FIELDS.filter((field) => reference[field] !== comparison[field]);
}

export function isControlledExperiment(changedFields: readonly ProfileField[]): boolean {
  return changedFields.length === 1;
}

function receiptExplanation(changedFields: readonly ProfileField[], controlled: boolean): string {
  if (changedFields.length === 0) {
    return "The profiles are identical, so this test cannot compare a changed variable.";
  }
  if (!controlled) {
    return `This test changes ${changedFields.length} fields at once. It can raise a question, but it cannot isolate a cause.`;
  }
  const field = changedFields[0];
  return `Only ${FIELD_LABELS[field]} changed. This controlled comparison can test whether that variable is associated with the model output.`;
}

function immutableProfile(profile: Profile): Profile {
  return Object.freeze({ ...profile });
}

/** Creates a receipt that captures inputs and outputs at the exact time of a test. */
export function createReceipt(input: {
  id: string;
  createdAt: number;
  reference: Profile;
  comparison: Profile;
  model: ModelConfig;
}): TestReceipt {
  const changedFields = Object.freeze(getChangedFields(input.reference, input.comparison));
  const isControlled = isControlledExperiment(changedFields);
  const referenceResult = scoreProfile(input.reference, input.model);
  const comparisonResult = scoreProfile(input.comparison, input.model);

  return Object.freeze({
    id: input.id,
    createdAt: input.createdAt,
    modelVersion: input.model.version,
    reference: immutableProfile(input.reference),
    comparison: immutableProfile(input.comparison),
    referenceScore: referenceResult.score,
    comparisonScore: comparisonResult.score,
    referenceRecommended: referenceResult.recommended,
    comparisonRecommended: comparisonResult.recommended,
    scoreDelta: Math.abs(referenceResult.score - comparisonResult.score),
    changedFields,
    isControlled,
    explanation: receiptExplanation(changedFields, isControlled),
  });
}
