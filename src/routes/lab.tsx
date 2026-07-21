import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PipBubble } from "@/components/glassbox/PipBubble";
import { useGlassboxStore } from "@/store/useGlassboxStore";
import {
  BASELINE_MODEL,
  FIELD_LABELS,
  FIELD_OPTIONS,
  PIP_HINTS,
  PROFILES,
  createReceipt,
  getChangedFields,
  isControlledExperiment,
  type Profile,
  type ProfileField,
} from "@/features/case-engine";
import { toast } from "sonner";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "Probe Lab | Glassbox" },
      {
        name: "description",
        content: "Run controlled experiments on StudyMatch v0.7. Change one variable at a time.",
      },
    ],
  }),
  component: Lab,
});

const COLOR_MAP: Record<Profile["color"], string> = {
  coral: "bg-coral",
  teal: "bg-teal",
  cobalt: "bg-cobalt",
  butter: "bg-butter",
  lavender: "bg-lavender",
};

const PROGRESS_STEPS = ["Mission", "Probe Lab", "Notebook", "Repair", "Proof"];

function Lab() {
  const {
    candidateA,
    candidateB,
    setCandidateB,
    credits,
    addTest,
    pinReceipt,
    pinnedReceiptIds,
    tests,
  } = useGlassboxStore();
  const [editField, setEditField] = useState<ProfileField | null>(null);
  const [running, setRunning] = useState(false);
  const [latestId, setLatestId] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);

  const changedFields = useMemo(
    () => getChangedFields(candidateA, candidateB),
    [candidateA, candidateB],
  );
  const controlled = isControlledExperiment(changedFields);
  const latest = tests.find((receipt) => receipt.id === latestId);
  const latestPinned = latest ? pinnedReceiptIds.includes(latest.id) : false;

  function runTest() {
    if (credits <= 0) {
      toast.error("No test credits left. Reset the local case to replay it.");
      return;
    }
    setRunning(true);
    setLatestId(null);
    window.setTimeout(() => {
      const createdAt = Date.now();
      const receipt = createReceipt({
        id: `receipt-${createdAt.toString(36)}-${tests.length + 1}`,
        createdAt,
        reference: candidateA,
        comparison: candidateB,
        model: BASELINE_MODEL,
      });
      addTest(receipt);
      setLatestId(receipt.id);
      setRunning(false);
      toast(
        receipt.isControlled
          ? "Controlled test complete."
          : "Test complete — but it is confounded.",
      );
    }, 550);
  }

  function pinLatest() {
    if (!latest) return;
    pinReceipt(latest.id);
    toast.success("Receipt pinned in the Evidence Notebook.");
  }

  const hint = changedFields.includes("zone")
    ? "Notice what stayed the same. Can one changed field explain the output difference?"
    : PIP_HINTS[tests.length % PIP_HINTS.length];

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <div className="paper-card mb-6 flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
        <div className="text-xs font-bold text-ink-muted">
          Case 01 <span className="mx-1 text-ink/30">/</span>{" "}
          <span className="text-ink">Probe Lab</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-1 lg:flex" aria-label="Case progress">
            {PROGRESS_STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-1">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-black ${step === "Probe Lab" ? "bg-ink text-butter" : "bg-cream text-ink"} ink-border`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-xs ${step === "Probe Lab" ? "font-black text-ink" : "text-ink-muted"}`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
          <span className="rounded-full bg-butter ink-border px-3 py-1.5 text-xs font-black text-ink">
            {credits} tests left
          </span>
          <Link
            to="/notebook"
            className="rounded-full bg-white ink-border px-3 py-1.5 text-xs font-black text-ink hover:bg-cream"
          >
            Open notebook
          </Link>
        </div>
      </div>

      <div
        className={`mb-4 rounded-2xl ink-border px-4 py-3 text-sm font-bold shadow-[3px_3px_0_#25231E] ${controlled ? "bg-success/20" : "bg-warn/20"}`}
      >
        {changedFields.length === 0 ? (
          "Candidates are identical. Change one field on Candidate B to begin a test."
        ) : controlled ? (
          <>
            Controlled test — only <b>{FIELD_LABELS[changedFields[0]]}</b> differs.
          </>
        ) : (
          <>
            Confounded test — {changedFields.length} fields differ. It cannot independently prove a
            cause.
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <CandidateCard
          label="Candidate A"
          profile={candidateA}
          locked
          changedFields={changedFields}
          otherProfile={candidateB}
        />
        <div className="hidden pt-24 lg:block">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink font-display text-2xl font-black text-butter ink-border shadow-[3px_3px_0_#25231E]">
            VS
          </div>
        </div>
        <CandidateCard
          label="Candidate B"
          profile={candidateB}
          changedFields={changedFields}
          otherProfile={candidateA}
          onEdit={setEditField}
          onSwap={() => {
            const index = PROFILES.findIndex((profile) => profile.id === candidateB.id);
            setCandidateB({ ...PROFILES[(index + 1) % PROFILES.length] });
          }}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="paper-card relative overflow-hidden p-6">
          <div className="bg-graph absolute inset-0 opacity-30" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
                  Model output
                </div>
                <h1 className="font-display text-2xl font-black">StudyMatch v0.7 · opaque</h1>
              </div>
              <button
                onClick={runTest}
                disabled={running || credits <= 0}
                className="btn-coral btn-coral-hover rounded-full px-6 py-3 text-base font-black disabled:opacity-60"
              >
                {running ? "Running…" : "Run StudyMatch"}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-cream ink-border p-4">
              <AvatarCircle profile={candidateA} size={44} />
              <div className="flex-1 rounded-xl bg-white ink-border p-5 text-center text-xs font-bold text-ink-muted">
                {running
                  ? "Comparing profiles and printing an immutable receipt…"
                  : "Local deterministic engine · ready"}
              </div>
              <AvatarCircle profile={candidateB} size={44} />
            </div>

            {latest && !running && (
              <div className="mt-6 animate-receipt">
                <article
                  className="mx-auto max-w-md rounded-b-2xl border-x border-b border-dashed border-ink/30 bg-white px-6 py-5"
                  aria-live="polite"
                >
                  <div className="text-center text-[10px] font-black uppercase tracking-widest text-ink-muted">
                    StudyMatch receipt · {latest.id}
                  </div>
                  <ResultRow
                    name={latest.reference.name}
                    score={latest.referenceScore}
                    recommended={latest.referenceRecommended}
                  />
                  <div className="my-2 border-t border-dashed border-ink/20" />
                  <ResultRow
                    name={latest.comparison.name}
                    score={latest.comparisonScore}
                    recommended={latest.comparisonRecommended}
                  />
                  <div className="mt-3 rounded-lg bg-cream px-3 py-2 text-center text-xs font-bold text-ink-muted">
                    {latest.scoreDelta}-point difference · {latest.modelVersion}
                  </div>
                  <p
                    className={`mt-3 text-center text-xs font-bold ${latest.isControlled ? "text-success" : "text-warn"}`}
                  >
                    {latest.explanation}
                  </p>
                </article>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={pinLatest}
                    disabled={latestPinned}
                    className="rounded-full bg-butter ink-border px-4 py-2 text-sm font-black text-ink shadow-[2px_2px_0_#25231E] disabled:opacity-60"
                  >
                    {latestPinned ? "Pinned ✓" : "Pin as evidence"}
                  </button>
                  <button
                    onClick={() => setLatestId(null)}
                    className="rounded-full bg-white ink-border px-4 py-2 text-sm font-black text-ink hover:bg-cream"
                  >
                    Try another test
                  </button>
                  <button
                    onClick={() => setHintOpen(true)}
                    className="rounded-full bg-lavender ink-border px-4 py-2 text-sm font-black text-ink"
                  >
                    Ask Pip
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <PipBubble tone="butter">
            {latest?.isControlled && latest.changedFields[0] === "zone"
              ? "This is a useful clue. Repeat a controlled comparison before you make a claim."
              : "Isolate one variable, then pin the receipt you can defend."}
          </PipBubble>
          <div className="paper-card p-5">
            <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
              Evidence ledger
            </div>
            <div className="mt-1 font-display text-3xl font-black">
              {pinnedReceiptIds.length} pinned
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              Two controlled receipts that isolate the same field are needed to unlock a repair.
            </p>
            <Link
              to="/notebook"
              className="mt-3 inline-block text-sm font-bold text-cobalt underline underline-offset-4"
            >
              Open the notebook →
            </Link>
          </div>
        </aside>
      </div>

      <Dialog open={editField !== null} onOpenChange={(open) => !open && setEditField(null)}>
        <DialogContent className="max-w-md bg-paper ink-border">
          <DialogTitle className="font-display text-2xl">
            Change {editField ? FIELD_LABELS[editField] : "variable"}
          </DialogTitle>
          {editField && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {FIELD_OPTIONS[editField].map((option) => {
                const active = candidateB[editField] === option;
                return (
                  <button
                    key={option}
                    onClick={() => {
                      setCandidateB({ ...candidateB, [editField]: option } as Profile);
                      setEditField(null);
                    }}
                    className={`rounded-xl ink-border px-3 py-3 text-sm font-bold ${active ? "bg-coral text-white" : "bg-white text-ink hover:bg-cream"}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-xs text-ink-muted">
            Change one field at a time to preserve a controlled test.
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={hintOpen} onOpenChange={setHintOpen}>
        <DialogContent className="max-w-md bg-paper ink-border">
          <DialogTitle className="sr-only">Pip hint</DialogTitle>
          <PipBubble>{hint}</PipBubble>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function AvatarCircle({ profile, size = 64 }: { profile: Profile; size?: number }) {
  return (
    <div
      className={`${COLOR_MAP[profile.color]} grid shrink-0 place-items-center rounded-full ink-border font-display font-black text-ink shadow-[3px_3px_0_#25231E]`}
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {profile.name[0]}
    </div>
  );
}

function ResultRow({
  name,
  score,
  recommended,
}: {
  name: string;
  score: number;
  recommended: boolean;
}) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <span className="font-display text-xl font-black">{name}</span>
      <span className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${recommended ? "bg-success/20 text-success" : "bg-warn/20 text-warn"}`}
        >
          {recommended ? "Recommended" : "Not recommended"}
        </span>
        <span className="font-display text-2xl font-black tabular-nums">{score}%</span>
      </span>
    </div>
  );
}

function CandidateCard({
  label,
  profile,
  locked,
  changedFields,
  otherProfile,
  onEdit,
  onSwap,
}: {
  label: string;
  profile: Profile;
  locked?: boolean;
  changedFields: readonly ProfileField[];
  otherProfile: Profile;
  onEdit?: (field: ProfileField) => void;
  onSwap?: () => void;
}) {
  return (
    <section className="paper-card relative p-5 sm:p-6 animate-stagger">
      <div className="absolute -top-3 left-6 rounded-md bg-ink px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-butter">
        {label}
        {locked ? " · fixed" : ""}
      </div>
      <div className="flex items-center gap-4">
        <AvatarCircle profile={profile} />
        <div>
          <div className="font-display text-2xl font-black">{profile.name}</div>
          <div className="text-xs text-ink-muted">Fictional profile · illustrative only</div>
        </div>
        {!locked && (
          <button
            onClick={onSwap}
            className="ml-auto rounded-full bg-cream ink-border px-3 py-1.5 text-xs font-black text-ink"
          >
            Swap profile
          </button>
        )}
      </div>
      <div className="mt-5 grid gap-2">
        {(Object.keys(FIELD_OPTIONS) as ProfileField[]).map((field) => {
          const changed = changedFields.includes(field);
          return (
            <div
              key={field}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${changed ? "border-warn/60 bg-warn/10" : "border-ink/10 bg-white"}`}
            >
              <div className="w-32 shrink-0 text-[11px] font-black uppercase tracking-widest text-ink-muted">
                {FIELD_LABELS[field]}
              </div>
              <div className="min-w-0 flex-1 truncate font-bold text-ink">{profile[field]}</div>
              {changed && locked && (
                <span className="text-[10px] font-black uppercase text-warn">
                  ↔ {otherProfile[field]}
                </span>
              )}
              {!locked && (
                <button
                  onClick={() => onEdit?.(field)}
                  className="rounded-full bg-cream ink-border px-2 py-1 text-[10px] font-black text-ink hover:bg-butter"
                >
                  Edit
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
