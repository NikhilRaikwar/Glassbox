import { createServerFn } from "@tanstack/react-start";
import { getEvidenceSummary } from "@/features/case-engine/rubric";
import { mapFallbackCoach } from "./fallback";
import {
  EvidenceCoachInputSchema,
  EvidenceCoachResponseSchema,
  EvidenceCoachResultSchema,
  type EvidenceCoachInput,
  type EvidenceCoachResponse,
} from "./types";

// The live coach is intentionally bounded, but structured GPT-5.6 replies can
// take longer than a fast local interaction. Keep enough headroom for a cold
// serverless invocation while preserving the deterministic fallback.
const COACH_TIMEOUT_MS = 25_000;

const COACH_INSTRUCTIONS = `You are Glassbox Evidence Coach, a constrained reasoning layer for a fictional AI-literacy case for students aged 13–18.

You receive only anonymous selected experiment receipts and the learner's hypothesis. Your job is to assess the claim against those supplied receipts, not to discover facts outside them.

Hard rules:
- Cite only supplied receipt IDs and the stated case facts. Never invent an experiment, score, metric, profile detail, or outcome.
- Do not calculate scores, decide experimental validity, or calculate fairness metrics. The deterministic case engine has already done that.
- If the supplied evidence threshold is false, return verdict "inconclusive", revealRepairAccess false, and say "I do not have enough evidence". You may recommend isolating a visible variable, but must not name a hidden proxy, disclose a penalty, or state the hidden rule.
- If evidence is sufficient, assess whether the hypothesis actually names the repeated pattern in the receipts. Do not make broad fairness or certification claims.
- Keep feedback kind, specific, and concise. This is not a chat conversation.
- Return only the requested structured result.`;

function safeFallback(input: EvidenceCoachInput, notice: string): EvidenceCoachResponse {
  return EvidenceCoachResponseSchema.parse({
    source: "fallback",
    result: mapFallbackCoach(input),
    notice,
  });
}

function outputMentionsOnlySelectedReceipts(
  response: ReturnType<typeof EvidenceCoachResultSchema.parse>,
  input: EvidenceCoachInput,
) {
  const selectedIds = new Set(input.receipts.map((receipt) => receipt.id));
  return response.evidenceAssessment.every((assessment) => selectedIds.has(assessment.receiptId));
}

async function requestLiveCoach(input: EvidenceCoachInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    return safeFallback(input, "No API key is configured, so the local evidence coach was used.");

  const evidenceSummary = getEvidenceSummary(input.receipts);
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), COACH_TIMEOUT_MS);

  try {
    // The server-function compiler removes this handler from the browser bundle.
    const [{ default: OpenAI }, { zodTextFormat }] = await Promise.all([
      import("openai"),
      import("openai/helpers/zod"),
    ]);
    const client = new OpenAI({ apiKey });
    const response = await client.responses.parse(
      {
        model: process.env.OPENAI_MODEL || "gpt-5.6",
        reasoning: { effort: "low" },
        store: false,
        instructions: COACH_INSTRUCTIONS,
        input: JSON.stringify({
          caseFacts: {
            case: "StudyMatch Mystery, a fictional educational case.",
            rule: "Receipts are deterministic test records. A controlled test changes exactly one profile field.",
            enoughControlledEvidence: evidenceSummary.hasThreshold,
          },
          receipts: input.receipts,
          learnerHypothesis: input.hypothesis,
        }),
        text: {
          verbosity: "low",
          format: zodTextFormat(EvidenceCoachResultSchema, "evidence_coach_result"),
        },
      },
      { signal: abortController.signal },
    );
    const parsed = response.output_parsed;
    if (!parsed) throw new Error("The coach response was empty or refused.");
    const result = EvidenceCoachResultSchema.parse(parsed);
    if (!outputMentionsOnlySelectedReceipts(result, input))
      throw new Error("The coach cited a receipt that was not supplied.");
    if (
      !evidenceSummary.hasThreshold &&
      (result.verdict !== "inconclusive" || result.revealRepairAccess)
    ) {
      throw new Error("The coach attempted to unlock repair without enough evidence.");
    }
    return EvidenceCoachResponseSchema.parse({ source: "live", result });
  } catch {
    return safeFallback(
      input,
      abortController.signal.aborted
        ? "The coach took too long, so the local evidence coach kept the case moving."
        : "The coach could not return a valid response, so the local evidence coach kept the case moving.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

/** Typed POST server function. Its handler is server-only; clients only receive the RPC stub. */
export const assessEvidence = createServerFn({ method: "POST" })
  .validator(EvidenceCoachInputSchema)
  .handler(async ({ data }) => requestLiveCoach(data));
