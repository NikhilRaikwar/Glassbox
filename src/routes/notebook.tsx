import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MagnifierDoodle } from "@/components/glassbox/doodles";
import { PipBubble } from "@/components/glassbox/PipBubble";
import { FIELD_LABELS, type TestReceipt } from "@/features/case-engine";
import { assessEvidence } from "@/features/evidence-coach/evidence-coach";
import { mapFallbackCoach } from "@/features/evidence-coach/fallback";
import {
  EvidenceCoachResponseSchema,
  type EvidenceCoachInput,
  type EvidenceCoachResponse,
} from "@/features/evidence-coach/types";
import { useGlassboxStore } from "@/store/useGlassboxStore";
import { toast } from "sonner";

export const Route = createFileRoute("/notebook")({
  head: () => ({
    meta: [
      { title: "Evidence Notebook | Glassbox" },
      {
        name: "description",
        content: "Pin receipts, make a claim, and map it to reproducible evidence.",
      },
    ],
  }),
  component: Notebook,
});

function receiptForCoach(receipt: TestReceipt): EvidenceCoachInput["receipts"][number] {
  return {
    id: receipt.id,
    modelVersion: receipt.modelVersion,
    referenceScore: receipt.referenceScore,
    comparisonScore: receipt.comparisonScore,
    scoreDelta: receipt.scoreDelta,
    changedFields: [...receipt.changedFields],
    isControlled: receipt.isControlled,
  };
}

function Notebook() {
  const {
    tests,
    pinnedReceiptIds,
    unpinReceipt,
    hypothesis,
    setHypothesis,
    hypothesisAccepted,
    latestCoachResponse,
    recordCoachResponse,
  } = useGlassboxStore();
  const [scanning, setScanning] = useState(false);
  const pinned = tests
    .filter((receipt) => pinnedReceiptIds.includes(receipt.id))
    .sort((a, b) => a.createdAt - b.createdAt);

  async function submitHypothesis() {
    const trimmedHypothesis = hypothesis.trim();
    if (!trimmedHypothesis) {
      toast.error("Write a 1–280 character hypothesis first.");
      return;
    }
    if (pinned.length === 0) {
      toast.error("Pin at least one receipt before asking the Evidence Coach.");
      return;
    }

    const input: EvidenceCoachInput = {
      receipts: pinned.map(receiptForCoach),
      hypothesis: trimmedHypothesis,
    };
    setScanning(true);
    let response: EvidenceCoachResponse;
    try {
      response = EvidenceCoachResponseSchema.parse(await assessEvidence({ data: input }));
    } catch {
      response = {
        source: "fallback",
        result: mapFallbackCoach(input),
        notice:
          "The coach connection was unavailable, so the local evidence coach kept the case moving.",
      };
    } finally {
      setScanning(false);
    }

    recordCoachResponse(response);
    if (response.result.revealRepairAccess)
      toast.success("Evidence supported. Repair Bench unlocked.");
    else toast("Your notebook has one next best experiment — keep investigating.");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section className="paper-card relative overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-y-0 left-8 hidden w-px bg-coral/30 sm:block" />
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-butter ink-border text-xl">
              🗂
            </div>
            <h1 className="font-display text-3xl font-black">Evidence Notebook</h1>
            <span className="ml-auto rounded-full bg-success/15 px-3 py-1 text-xs font-black text-success">
              {pinned.length} receipt{pinned.length === 1 ? "" : "s"} selected
            </span>
          </div>

          {pinned.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-ink/30 p-8 text-center">
              <div className="text-4xl">📭</div>
              <div className="mt-2 font-display text-xl font-black">No evidence selected</div>
              <p className="mt-1 text-sm text-ink-muted">
                Run a comparison in the Probe Lab, then pin its immutable receipt here.
              </p>
              <Link
                to="/lab"
                className="mt-4 inline-block btn-coral btn-coral-hover rounded-full px-4 py-2 text-sm font-black"
              >
                Open Probe Lab
              </Link>
            </div>
          ) : (
            <ol className="mt-6 space-y-4" aria-label="Pinned experiment receipts">
              {pinned.map((receipt, index) => (
                <li
                  key={receipt.id}
                  className="relative pl-6 animate-paper-tuck"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="absolute left-0 top-4 grid h-6 w-6 place-items-center rounded-full bg-white ink-border text-[10px] font-black">
                    {index + 1}
                  </span>
                  <article
                    className={`relative rounded-2xl ${receipt.isControlled ? "bg-cream" : "bg-warn/10"} ink-border p-4 shadow-[3px_3px_0_#25231E]`}
                  >
                    <div className="absolute -top-2 right-4 rotate-3 rounded bg-butter/70 ink-border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                      {receipt.id}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`text-lg ${receipt.isControlled ? "text-success" : "text-warn"}`}
                      >
                        {receipt.isControlled ? "✓" : "!"}
                      </span>
                      <div className="font-bold text-ink">
                        {receipt.reference.name}{" "}
                        <span className="font-black text-cobalt">{receipt.referenceScore}%</span>
                        <span className="mx-2 text-ink-muted">vs</span>
                        {receipt.comparison.name}{" "}
                        <span className="font-black text-coral">{receipt.comparisonScore}%</span>
                      </div>
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${receipt.isControlled ? "bg-success/20 text-success" : "bg-warn/20 text-warn"}`}
                      >
                        {receipt.isControlled ? "Controlled" : "Confounded"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink-muted">
                      Changed:{" "}
                      <b className="text-ink">
                        {receipt.changedFields.map((field) => FIELD_LABELS[field]).join(", ") ||
                          "nothing"}
                      </b>{" "}
                      · {receipt.scoreDelta}-point difference
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">{receipt.explanation}</p>
                    <button
                      onClick={() => unpinReceipt(receipt.id)}
                      className="mt-3 text-xs font-bold text-cobalt underline underline-offset-4"
                    >
                      Remove from selected evidence
                    </button>
                  </article>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-8 rounded-2xl border border-dashed border-ink/30 bg-white p-4">
            <div className="flex items-center gap-2">
              <MagnifierDoodle className="h-5 w-5 text-cobalt" />
              <div className="font-display text-lg font-black">What makes evidence strong?</div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-cream p-3 text-sm">
                <div className="text-[10px] font-black uppercase text-success">Controlled</div>Two
                profiles differ in exactly one field, so the receipt can test that one change.
              </div>
              <div className="rounded-xl bg-warn/10 p-3 text-sm">
                <div className="text-[10px] font-black uppercase text-warn">Confounded</div>Several
                fields change at once, so the receipt cannot independently identify a cause.
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="paper-card-cream relative p-6">
            <div className="absolute -top-3 left-6 rotate-[-4deg] rounded-md bg-coral px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white ink-border">
              Your hypothesis
            </div>
            <h2 className="mt-3 font-display text-xl font-black">
              What rule do you think StudyMatch is using?
            </h2>
            <label htmlFor="hypothesis" className="mt-3 block text-xs font-bold text-ink-muted">
              Use the receipt evidence to make a testable claim.
            </label>
            <textarea
              id="hypothesis"
              value={hypothesis}
              onChange={(event) => setHypothesis(event.target.value.slice(0, 280))}
              rows={5}
              maxLength={280}
              placeholder="I think StudyMatch treats students from Zone C differently even when their learning profile is the same."
              className="mt-2 w-full resize-none rounded-xl border border-ink/20 bg-white p-3 text-sm font-medium text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-cobalt"
              style={{ fontFamily: "var(--font-display)" }}
            />
            <div className="mt-1 text-right text-[11px] text-ink-muted">
              {hypothesis.length}/280
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={submitHypothesis}
                disabled={scanning || pinned.length === 0}
                className="btn-coral btn-coral-hover rounded-full px-5 py-2.5 text-sm font-black disabled:opacity-60"
              >
                {scanning ? "Checking evidence…" : "Ask Evidence Coach"}
              </button>
              {hypothesisAccepted && (
                <Link
                  to="/repair"
                  className="rounded-full bg-success px-4 py-2 text-sm font-black text-white ink-border shadow-[2px_2px_0_#25231E]"
                >
                  Open Repair Bench →
                </Link>
              )}
            </div>
            {scanning && (
              <div className="mt-4 rounded-xl bg-white p-3 text-center text-sm text-ink-muted">
                <MagnifierDoodle className="mx-auto h-8 w-8 animate-wiggle text-cobalt" />
                Cross-checking only your selected receipts…
              </div>
            )}
          </section>

          <CoachMap response={latestCoachResponse} />
          <PipBubble tone="lavender">
            Good detectives write down what they observed before naming what it means.
          </PipBubble>
        </aside>
      </div>
    </main>
  );
}

function CoachMap({ response }: { response: EvidenceCoachResponse | null }) {
  if (!response)
    return (
      <section className="paper-card p-5">
        <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
          Claim–evidence map
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          Select receipts and ask the coach to map your claim to evidence. The coach will suggest
          one controlled next test if evidence is inconclusive.
        </p>
      </section>
    );
  const { result } = response;
  const verdictColor =
    result.verdict === "supported"
      ? "text-success"
      : result.verdict === "contradicted"
        ? "text-warn"
        : "text-cobalt";
  return (
    <section className="paper-card p-5" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
          Claim–evidence map
        </div>
        <span
          className={`rounded-full bg-cream px-2 py-1 text-[10px] font-black uppercase ${verdictColor}`}
        >
          {result.verdict}
        </span>
      </div>
      <p className="mt-3 text-sm font-bold text-ink">{result.feedback}</p>
      <div className="mt-3 space-y-2">
        {result.evidenceAssessment.map((assessment) => (
          <div key={assessment.receiptId} className="rounded-xl bg-cream p-3 text-xs">
            <b>{assessment.receiptId}</b> ·{" "}
            <span className="font-black uppercase text-ink-muted">{assessment.relevance}</span>
            <p className="mt-1 text-ink-muted">{assessment.explanation}</p>
          </div>
        ))}
      </div>
      {result.nextBestExperiment && (
        <div className="mt-3 rounded-xl bg-lavender/50 p-3 text-sm">
          <b>Next controlled experiment: change only {result.nextBestExperiment.changeOnly}.</b>
          <p className="mt-1 text-ink-muted">{result.nextBestExperiment.rationale}</p>
        </div>
      )}
      {response.notice && <p className="mt-3 text-[11px] text-ink-muted">{response.notice}</p>}
    </section>
  );
}
