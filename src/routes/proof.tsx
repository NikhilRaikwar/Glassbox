import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import confetti from "canvas-confetti";
import { PipBubble } from "@/components/glassbox/PipBubble";
import {
  BASELINE_MODEL,
  compareEvaluationSuites,
  createRepairedModel,
  runEvaluationSuite,
} from "@/features/case-engine";
import { useGlassboxStore } from "@/store/useGlassboxStore";
import { toast } from "sonner";

export const Route = createFileRoute("/proof")({
  head: () => ({
    meta: [
      { title: "Proof card | Glassbox" },
      {
        name: "description",
        content: "A reproducible evidence trail for Case 01's simulated model repair.",
      },
    ],
  }),
  component: Proof,
});

function Proof() {
  const {
    repairRun,
    resetDemo,
    tests,
    pinnedReceiptIds,
    hypothesis,
    latestCoachResponse,
    removedFactors,
    addedFactors,
  } = useGlassboxStore();
  const evidence = tests.filter((receipt) => pinnedReceiptIds.includes(receipt.id));
  const comparison = useMemo(
    () =>
      compareEvaluationSuites(
        runEvaluationSuite(BASELINE_MODEL),
        runEvaluationSuite(createRepairedModel(addedFactors)),
      ),
    [addedFactors],
  );

  if (!repairRun) {
    return (
      <main className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
        <section className="paper-card p-8 text-center">
          <div className="text-4xl">🔎</div>
          <h1 className="mt-3 font-display text-4xl font-black">
            The proof is waiting for an evaluation.
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-ink-muted">
            Run the repeatable eight-pair evaluation in the Repair Bench first. Glassbox will only
            create a proof card from an actual simulated repair.
          </p>
          <Link
            to="/repair"
            className="btn-coral btn-coral-hover mt-6 inline-flex rounded-full px-6 py-3 text-sm font-black"
          >
            Open Repair Bench
          </Link>
        </section>
      </main>
    );
  }

  function downloadProofCard() {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 920;
    const context = canvas.getContext("2d");
    if (!context) {
      toast.error("Your browser could not create the proof-card image.");
      return;
    }
    context.fillStyle = "#fffdf8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#f3e4c7";
    context.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 42) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }
    for (let y = 0; y < canvas.height; y += 42) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }
    context.fillStyle = "rgba(255,253,248,.94)";
    context.fillRect(70, 60, 1260, 800);
    context.strokeStyle = "#25231e";
    context.lineWidth = 5;
    context.strokeRect(70, 60, 1260, 800);
    context.fillStyle = "#ff7658";
    context.font = "900 28px Georgia";
    context.fillText("GLASSBOX · CASE 01", 120, 125);
    context.fillStyle = "#25231e";
    context.font = "900 60px Georgia";
    context.fillText("Simulated model repair", 120, 205);
    context.font = "600 29px sans-serif";
    context.fillStyle = "#6f695d";
    context.fillText("StudyMatch v0.7 → StudyMatch v0.8 · not a fairness certification", 120, 255);
    metricOnCanvas(
      context,
      "Equivalent-treatment rate",
      `${comparison.before.fairnessRate}% → ${comparison.after.fairnessRate}%`,
      120,
      340,
      "#4fa66a",
    );
    metricOnCanvas(
      context,
      "Average match quality",
      `${comparison.before.averageMatchQuality} → ${comparison.after.averageMatchQuality}`,
      720,
      340,
      "#4d76e8",
    );
    metricOnCanvas(
      context,
      "Affected equivalent pairs",
      `${comparison.before.affectedPairCount} → ${comparison.after.affectedPairCount}`,
      120,
      490,
      "#ff7658",
    );
    metricOnCanvas(
      context,
      "Evidence receipts",
      evidence.map((receipt) => receipt.id).join(", ") || "None selected",
      720,
      490,
      "#25231e",
    );
    context.fillStyle = "#25231e";
    context.font = "900 25px Georgia";
    context.fillText("Learner hypothesis", 120, 645);
    context.font = "500 26px sans-serif";
    drawWrappedText(context, hypothesis || "No hypothesis recorded", 120, 690, 1140, 38, "#25231e");
    context.font = "600 23px sans-serif";
    context.fillStyle = "#6f695d";
    context.fillText(
      `Coach verdict: ${latestCoachResponse?.result.verdict ?? "not recorded"} · Removed: ${removedFactors.join(", ") || "not recorded"}`,
      120,
      815,
    );
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = "glassbox-case-01-simulated-repair-proof.png";
    anchor.click();
    toast.success("PNG proof card downloaded.");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <section className="paper-card relative overflow-hidden p-6 text-center sm:p-12 animate-stagger">
        <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
          Case 01 completed · simulated model repair
        </div>
        <h1 className="mt-3 font-display text-5xl font-black leading-tight sm:text-6xl">
          You made the hidden rule <span className="text-coral">visible.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-muted">
          The evidence trail, model change, and before/after measurements below were calculated in
          this fictional learning case. This card is not a certification of fairness.
        </p>
      </section>

      <section id="proof-card" className="mt-8 grid gap-6 lg:grid-cols-2 print:mt-0">
        <BeforeAfterCard
          title={comparison.before.modelVersion}
          tone="warn"
          fairness={comparison.before.fairnessRate}
          quality={comparison.before.averageMatchQuality}
          affected={comparison.before.affectedPairCount}
        />
        <BeforeAfterCard
          title={comparison.after.modelVersion}
          tone="success"
          fairness={comparison.after.fairnessRate}
          quality={comparison.after.averageMatchQuality}
          affected={comparison.after.affectedPairCount}
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="paper-card p-6">
          <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
            Evidence trail
          </div>
          <h2 className="mt-1 font-display text-2xl font-black">What the learner tested</h2>
          {evidence.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No receipt was selected before repair.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {evidence.map((receipt) => (
                <li key={receipt.id} className="rounded-xl bg-cream p-3 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <b>{receipt.id}</b>
                    <span
                      className={
                        receipt.isControlled ? "font-bold text-success" : "font-bold text-warn"
                      }
                    >
                      {receipt.isControlled ? "Controlled" : "Confounded"}
                    </span>
                  </div>
                  <p className="mt-1 text-ink-muted">
                    {receipt.referenceScore}% vs {receipt.comparisonScore}% · changed{" "}
                    {receipt.changedFields.join(", ") || "no fields"} · {receipt.scoreDelta}-point
                    difference
                  </p>
                </li>
              ))}
            </ol>
          )}
        </article>
        <article className="paper-card-cream p-6">
          <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
            Claim and repair
          </div>
          <h2 className="mt-1 font-display text-2xl font-black">The auditable change</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl bg-white p-3 ink-border">
              <b>Hypothesis</b>
              <p className="mt-1 text-ink-muted">{hypothesis || "No hypothesis recorded."}</p>
            </div>
            <div className="rounded-xl bg-white p-3 ink-border">
              <b>Coach verdict</b>
              <p className="mt-1 text-ink-muted">
                {latestCoachResponse?.result.verdict ?? "Not recorded"} · claim strength{" "}
                {latestCoachResponse?.result.claimStrength ?? 0}/4
              </p>
            </div>
            <div className="rounded-xl bg-white p-3 ink-border">
              <b>Model change</b>
              <p className="mt-1 text-ink-muted">
                Removed {removedFactors.join(", ") || "no factor recorded"}; added{" "}
                {addedFactors.join(", ") || "no additional signal"}.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-8 paper-card-cream p-6">
        <PipBubble tone="butter">
          Great AI citizens test the system, preserve their evidence, and check whether a repair
          changes the result.
        </PipBubble>
      </section>
      <EducatorPeek tests={tests} supported={latestCoachResponse?.result.verdict === "supported"} />
      <section className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
        <Link
          to="/mission"
          onClick={() => {
            resetDemo();
            toast("Local session reset. Ready to replay.");
          }}
          className="rounded-full bg-white ink-border px-5 py-3 text-sm font-black text-ink shadow-[3px_3px_0_#25231E]"
        >
          Replay Case 01
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-full bg-lavender ink-border px-5 py-3 text-sm font-black text-ink shadow-[3px_3px_0_#25231E]"
        >
          Print proof card
        </button>
        <button
          onClick={downloadProofCard}
          className="btn-coral btn-coral-hover rounded-full px-5 py-3 text-sm font-black"
        >
          Download PNG proof card
        </button>
      </section>
    </main>
  );
}

function metricOnCanvas(
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  color: string,
) {
  context.fillStyle = "#6f695d";
  context.font = "700 20px sans-serif";
  context.fillText(label.toUpperCase(), x, y);
  context.fillStyle = color;
  context.font = "900 42px Georgia";
  context.fillText(value, x, y + 52);
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  color: string,
) {
  context.fillStyle = color;
  const words = text.split(/\s+/);
  let line = "";
  let cursorY = y;
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, cursorY);
      cursorY += lineHeight;
      line = word;
    } else line = candidate;
  });
  if (line) context.fillText(line, x, cursorY);
}

function BeforeAfterCard({
  title,
  tone,
  fairness,
  quality,
  affected,
}: {
  title: string;
  tone: "warn" | "success";
  fairness: number;
  quality: number;
  affected: number;
}) {
  const color = tone === "success" ? "text-success" : "text-warn";
  return (
    <article className="paper-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black">{title}</h2>
        <span
          className={`rounded-full bg-cream px-3 py-1 text-[10px] font-black uppercase ${color}`}
        >
          {tone === "success" ? "Repaired" : "Before repair"}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-cream p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-ink-muted">
            Equivalent treatment
          </div>
          <div className={`mt-1 font-display text-4xl font-black ${color}`}>{fairness}%</div>
        </div>
        <div className="rounded-2xl bg-cream p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-ink-muted">
            Match quality
          </div>
          <div className="mt-1 font-display text-4xl font-black text-cobalt">{quality}</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-muted">
        {affected} of 8 equivalent-profile pairs received different scores.
      </p>
    </article>
  );
}

function EducatorPeek({
  tests,
  supported,
}: {
  tests: readonly { isControlled: boolean }[];
  supported: boolean;
}) {
  const controlled = tests.filter((test) => test.isControlled).length;
  const confounded = tests.length - controlled;
  return (
    <section className="mt-8 rounded-3xl bg-lavender/50 p-6 ink-border">
      <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
        Local-only educator peek
      </div>
      <h2 className="mt-1 font-display text-2xl font-black">What this learner demonstrated</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PeekItem label="Controlled tests" value={`${controlled}`} />
        <PeekItem label="Confounded tests" value={`${confounded}`} />
        <PeekItem label="Evidence-supported claim" value={supported ? "Yes" : "Not yet"} />
        <PeekItem label="Repair verification" value="Completed" />
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        <b>Facilitation question:</b> What made the strongest receipt more useful than the
        confounded one?
      </p>
    </section>
  );
}

function PeekItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ink-border">
      <div className="text-[10px] font-black uppercase tracking-widest text-ink-muted">{label}</div>
      <div className="mt-1 font-display text-2xl font-black">{value}</div>
    </div>
  );
}
