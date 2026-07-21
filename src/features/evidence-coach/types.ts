import { z } from "zod";

export const EvidenceReceiptSchema = z.object({
  id: z.string().min(1).max(80),
  modelVersion: z.literal("StudyMatch v0.7"),
  referenceScore: z.number().int().min(0).max(100),
  comparisonScore: z.number().int().min(0).max(100),
  scoreDelta: z.number().int().min(0).max(100),
  changedFields: z
    .array(z.enum(["topic", "availability", "skill", "collab", "zone", "a11y"]))
    .max(6),
  isControlled: z.boolean(),
});

export const EvidenceCoachInputSchema = z.object({
  receipts: z.array(EvidenceReceiptSchema).min(1).max(12),
  hypothesis: z.string().trim().min(1).max(280),
});

export const EvidenceCoachResultSchema = z.object({
  verdict: z.enum(["supported", "inconclusive", "contradicted"]),
  evidenceAssessment: z.array(
    z.object({
      receiptId: z.string(),
      relevance: z.enum(["strong", "weak", "confounded"]),
      explanation: z.string().min(1).max(500),
    }),
  ),
  claimStrength: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  feedback: z.string().min(1).max(800),
  nextBestExperiment: z
    .object({
      changeOnly: z.string().min(1).max(80),
      rationale: z.string().min(1).max(400),
    })
    .nullable(),
  revealRepairAccess: z.boolean(),
});

export const EvidenceCoachResponseSchema = z.object({
  source: z.enum(["live", "fallback"]),
  result: EvidenceCoachResultSchema,
  notice: z.string().max(300).optional(),
});

export type EvidenceCoachInput = z.infer<typeof EvidenceCoachInputSchema>;
export type EvidenceCoachResult = z.infer<typeof EvidenceCoachResultSchema>;
export type EvidenceCoachResponse = z.infer<typeof EvidenceCoachResponseSchema>;
