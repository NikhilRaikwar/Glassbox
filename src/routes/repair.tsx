import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { PipBubble } from "@/components/glassbox/PipBubble";
import {
  BASELINE_FACTORS,
  BASELINE_MODEL,
  REPAIR_SIGNALS,
  compareEvaluationSuites,
  createRepairedModel,
  runEvaluationSuite,
} from "@/features/case-engine";
import { useGlassboxStore } from "@/store/useGlassboxStore";
import { toast } from "sonner";

export const Route = createFileRoute("/repair")({
  head: () => ({
    meta: [
      { title: "Repair Bench | Glassbox" },
      {
        name: "description",
        content: "Create StudyMatch v0.8 and run a repeatable eight-pair evaluation.",
      },
    ],
  }),
  component: Repair,
});

function Repair() {
  const {
    removedFactors,
    addedFactors,
    toggleRemove,
    toggleAdd,
    hypothesisAccepted,
    judgeDemo,
    repairRun,
    markRepairRun,
  } = useGlassboxStore();
  const [running, setRunning] = useState(false);
  const [showResult, setShowResult] = useState(repairRun);
  const hasAccess = hypothesisAccepted || judgeDemo;
  const proxyRemoved = removedFactors.includes("zone-penalty");
  const repairedModel = useMemo(() => createRepairedModel(addedFactors), [addedFactors]);
  const comparison = useMemo(
    () =>
      compareEvaluationSuites(
        runEvaluationSuite(BASELINE_MODEL),
        runEvaluationSuite(repairedModel),
      ),
    [repairedModel],
  );

  function runEvaluation() {
    if (!hasAccess) {
      toast.error("Use the Evidence Notebook to support a claim before changing the model.");
      return;
    }
    if (!proxyRemoved) {
      toast.error("Remove the harmful proxy to create StudyMatch v0.8.");
      return;
    }
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setShowResult(true);
      markRepairRun();
      confetti({
        particleCount: 90,
        spread: 72,
        origin: { y: 0.65 },
        colors: ["#FF7658", "#FFD765", "#4FA66A", "#DCCEFF", "#4D76E8"],
      });
      toast.success("Eight-pair evaluation complete.");
    }, 650);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
            Case 01 · Step 4
          </div>
          <h1 className="font-display text-4xl font-black">Repair Bench</h1>
        </div>
        <div className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-ink-muted ink-border">
          {hasAccess ? "Evidence access granted" : "Evidence access required"}
        </div>
      </div>

      {!hasAccess && (
        <div className="mb-6 rounded-2xl bg-warn/15 p-4 text-sm font-bold text-ink ink-border">
          First make an evidence-supported claim in the{" "}
          <Link to="/notebook" className="text-cobalt underline underline-offset-4">
            Evidence Notebook
          </Link>
          . Glassbox does not let a guess rewrite the simulated model.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="paper-card relative overflow-hidden p-6">
          <div className="absolute -top-3 left-6 rounded-md bg-warn px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white ink-border">
            StudyMatch v0.7 · source configuration
          </div>
          <div className="mt-3 space-y-3">
            {BASELINE_FACTORS.map((factor) => {
              const removed = removedFactors.includes(factor.id);
              const proxy = factor.kind === "proxy";
              return (
                <div
                  key={factor.id}
                  className={`flex items-center gap-3 rounded-2xl ink-border px-4 py-3 shadow-[3px_3px_0_#25231E] ${removed ? "opacity-40 line-through" : ""} ${proxy ? "bg-warn/15" : "bg-cream"}`}
                >
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-lg font-black text-white ${proxy ? "bg-coral" : "bg-success"}`}
                  >
                    {proxy ? "−" : "+"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-ink">{factor.label}</div>
                    <div className="text-xs text-ink-muted">{factor.description}</div>
                  </div>
                  {proxy ? (
                    <button
                      onClick={() => toggleRemove(factor.id)}
                      disabled={!hasAccess}
                      className={`rounded-full ink-border px-3 py-1.5 text-xs font-black disabled:opacity-50 ${removed ? "bg-white text-ink" : "bg-coral text-white"}`}
                    >
                      {removed ? "Restore" : "Remove proxy"}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-success">Keep</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="paper-card relative overflow-hidden p-6">
          <div className="absolute -top-3 left-6 rounded-md bg-success px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white ink-border">
            Build StudyMatch v0.8
          </div>
          <div className="mt-3 space-y-3">
            <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
              Add learning-relevant signals
            </div>
            {REPAIR_SIGNALS.map((factor) => {
              const added = addedFactors.includes(
                factor.id as "topic-alignment" | "collaboration-fit",
              );
              return (
                <div
                  key={factor.id}
                  className={`flex items-center gap-3 rounded-2xl ink-border px-4 py-3 ${added ? "bg-lavender" : "bg-white"}`}
                >
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-cobalt font-black text-white">
                    +
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-ink">{factor.label}</div>
                    <div className="text-xs text-ink-muted">{factor.description}</div>
                  </div>
                  <button
                    onClick={() => toggleAdd(factor.id as "topic-alignment" | "collaboration-fit")}
                    disabled={!hasAccess}
                    className={`rounded-full ink-border px-3 py-1.5 text-xs font-black disabled:opacity-50 ${added ? "bg-white text-ink" : "bg-cobalt text-white"}`}
                  >
                    {added ? "Added ✓" : "Add factor"}
                  </button>
                </div>
              );
            })}
            <div className="mt-4 rounded-2xl bg-cream ink-border p-4">
              <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
                Versioned configuration
              </div>
              <div className="mt-1 font-display text-xl font-black">
                {repairedModel.version} uses {repairedModel.addedFactorIds.length} selected learning
                signal{repairedModel.addedFactorIds.length === 1 ? "" : "s"} and no commute-zone
                factor.
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                Selections change the actual v0.8 scorer used by the evaluation below.
              </p>
            </div>
            <button
              onClick={runEvaluation}
              disabled={running || !hasAccess}
              className="btn-coral btn-coral-hover mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-base font-black disabled:opacity-60"
            >
              {running ? "Running eight-pair evaluation…" : "Run eight-pair evaluation"}
            </button>
          </div>
        </section>
      </div>

      {showResult && (
        <section className="mt-8 animate-stagger">
          <div className="grid gap-6 lg:grid-cols-2">
            <EvaluationPanel
              title={comparison.before.modelVersion}
              result={comparison.before}
              tone="warn"
            />
            <EvaluationPanel
              title={comparison.after.modelVersion}
              result={comparison.after}
              tone="success"
            />
          </div>
          <div className="mt-6 grid gap-4 paper-card-cream p-5 md:grid-cols-3">
            <Metric
              label="Fairness delta"
              value={`${comparison.fairnessDelta >= 0 ? "+" : ""}${comparison.fairnessDelta} pts`}
            />
            <Metric
              label="Match-quality delta"
              value={`${comparison.matchQualityDelta >= 0 ? "+" : ""}${comparison.matchQualityDelta} pts`}
            />
            <Metric
              label="Affected pairs removed"
              value={`${Math.abs(comparison.affectedPairDelta)} of ${comparison.before.pairCount}`}
            />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 paper-card-cream p-5">
            <PipBubble tone="butter">
              This is a simulated model repair. Every number comes from the same repeatable
              eight-pair evaluation suite.
            </PipBubble>
            <Link
              to="/proof"
              className="btn-coral btn-coral-hover inline-flex rounded-full px-6 py-3 text-base font-black"
            >
              See the proof card
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

function EvaluationPanel({
  title,
  result,
  tone,
}: {
  title: string;
  result: ReturnType<typeof runEvaluationSuite>;
  tone: "warn" | "success";
}) {
  const color = tone === "success" ? "text-success" : "text-warn";
  const background = tone === "success" ? "bg-success/10" : "bg-warn/10";
  return (
    <article className={`paper-card ${background} p-6`}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black">{title}</h2>
        <span
          className={`rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest ink-border ${color}`}
        >
          {tone === "success" ? "Repaired" : "Baseline"}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Equivalent-treatment rate" value={`${result.fairnessRate}%`} />
        <Metric label="Average match quality" value={`${result.averageMatchQuality}`} />
      </div>
      <p className="mt-3 text-sm text-ink-muted">
        {result.equivalentTreatmentPairs} of {result.pairCount} equivalent pairs receive equal
        scores; {result.affectedPairCount} pair{result.affectedPairCount === 1 ? "" : "s"} differ.
      </p>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white ink-border p-4">
      <div className="text-[10px] font-black uppercase tracking-widest text-ink-muted">{label}</div>
      <div className="mt-1 font-display text-3xl font-black text-ink">{value}</div>
    </div>
  );
}
