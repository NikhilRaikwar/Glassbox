import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  GlassBoxHero,
  MagnifierDoodle,
  ArrowScribble,
  StarBurst,
  AtomDoodle,
} from "@/components/glassbox/doodles";
import { PipBubble } from "@/components/glassbox/PipBubble";
import { useGlassboxStore } from "@/store/useGlassboxStore";
import {
  BASELINE_MODEL,
  compareEvaluationSuites,
  createRepairedModel,
  runEvaluationSuite,
} from "@/features/case-engine";

const LANDING_EVALUATION = compareEvaluationSuites(
  runEvaluationSuite(BASELINE_MODEL),
  runEvaluationSuite(createRepairedModel(["topic-alignment", "collaboration-fit"])),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glassbox — Can you catch an AI making a bad decision?" },
      {
        name: "description",
        content:
          "An AI literacy game for students 13–18. Test a model like a scientist, uncover its hidden rule, and repair the system.",
      },
      { property: "og:title", content: "Glassbox — The AI Detective Lab" },
      { property: "og:description", content: "Don't just use AI. Learn to test it." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [onbOpen, setOnbOpen] = useState(false);
  const [onbStep, setOnbStep] = useState(0);
  const setOnboarded = useGlassboxStore((s) => s.setOnboarded);
  const loadJudgeDemo = useGlassboxStore((s) => s.loadJudgeDemo);
  const nav = useNavigate();

  const onbSlides = [
    {
      emoji: "🧠",
      title: "Every AI has rules — even when you cannot see them.",
      body: "Some rules are helpful. Some are unfair. Your job is to make them visible.",
    },
    {
      emoji: "🧪",
      title: "Good detectives change one thing at a time.",
      body: "That's how you know what caused the result. It's called a controlled experiment.",
    },
    {
      emoji: "🔎",
      title: "Your job is not to trust the model. Your job is to test it.",
      body: "Curiosity beats certainty. Evidence beats vibes.",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
      {/* HERO */}
      <section className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:pt-6">
        <div className="relative min-w-0 animate-stagger">
          <div className="inline-flex items-center gap-2 rounded-full bg-butter/70 ink-border px-3 py-1 text-[11px] font-black uppercase tracking-widest">
            <StarBurst className="h-3 w-3 text-coral" /> AI literacy, but make it a game
          </div>
          <h1 className="mt-5 font-display text-[44px] font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Can you catch an{" "}
            <span className="relative inline-block">
              <span className="relative z-10">AI</span>
              <span className="absolute inset-x-0 -bottom-1 z-0 h-4 bg-butter" />
            </span>{" "}
            making a{" "}
            <span className="relative inline-block text-coral">
              bad decision?
              <ArrowScribble className="absolute -bottom-6 left-0 h-6 w-full text-ink" />
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-ink-muted">
            Glassbox turns students into AI detectives. Run controlled tests, uncover hidden rules,
            and repair a model before it affects anyone.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setOnbOpen(true);
                setOnbStep(0);
              }}
              className="btn-coral btn-coral-hover inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-black"
            >
              Open the lab <MagnifierDoodle className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                loadJudgeDemo();
                nav({ to: "/notebook" });
              }}
              className="inline-flex items-center gap-2 rounded-full bg-butter ink-border px-5 py-3.5 text-sm font-black text-ink shadow-[3px_3px_0_#25231E] transition hover:-translate-y-0.5"
            >
              Judge demo →
            </button>
            <button
              onClick={() => setVideoOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white ink-border px-5 py-3.5 text-sm font-bold text-ink shadow-[3px_3px_0_#25231E] transition hover:-translate-y-0.5"
            >
              How Case 01 works
            </button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-ink-muted">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" /> No login
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cobalt" /> No real data
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-coral" /> Ages 13–18
            </div>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="paper-card relative overflow-hidden p-4 sm:p-6">
            <div className="bg-graph absolute inset-0 opacity-40" />
            <GlassBoxHero className="relative z-10 w-full" />
            <div className="absolute -right-2 top-4 rotate-6 rounded-lg bg-lavender ink-border px-3 py-1 text-[11px] font-black uppercase tracking-widest">
              Live demo
            </div>
          </div>
          <div className="absolute -left-4 -bottom-6 hidden rotate-[-8deg] rounded-2xl bg-white ink-border p-3 shadow-[4px_4px_0_#25231E] sm:block">
            <div className="text-[10px] font-black uppercase tracking-widest text-ink-muted">
              Fairness
            </div>
            <div className="font-display text-3xl font-black text-warn">
              {LANDING_EVALUATION.before.fairnessRate}
              <span className="text-lg text-ink-muted">%</span>
            </div>
          </div>
          <div className="absolute -right-3 -top-4 hidden rotate-[6deg] rounded-2xl bg-white ink-border p-3 shadow-[4px_4px_0_#25231E] sm:block">
            <div className="text-[10px] font-black uppercase tracking-widest text-ink-muted">
              After repair
            </div>
            <div className="font-display text-3xl font-black text-success">
              {LANDING_EVALUATION.after.fairnessRate}
              <span className="text-lg text-ink-muted">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* THREE STEPS */}
      <section className="mt-24">
        <div className="mb-8 text-center">
          <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">
            The Glassbox method
          </div>
          <h2 className="mt-2 font-display text-4xl font-black sm:text-5xl">
            Three moves, one detective.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              emoji: "🧪",
              title: "Test it",
              body: "Run a controlled experiment. Change one variable and watch the model's decision shift.",
              bg: "bg-butter",
              rot: "-rotate-1",
            },
            {
              emoji: "🧠",
              title: "Explain it",
              body: "Pin evidence into your detective notebook. Name the hidden rule you found.",
              bg: "bg-lavender",
              rot: "rotate-1",
            },
            {
              emoji: "🛠️",
              title: "Repair it",
              body: "Remove the unfair proxy. Prove the new model is both fairer and better at matching.",
              bg: "bg-cream",
              rot: "-rotate-1",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`${s.bg} ${s.rot} ink-border relative rounded-3xl p-6 shadow-[6px_6px_0_#25231E] transition hover:-translate-y-1 hover:rotate-0`}
            >
              <div className="absolute -top-3 left-6 rounded-md bg-white ink-border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                Step {i + 1}
              </div>
              <div className="text-5xl">{s.emoji}</div>
              <h3 className="mt-4 font-display text-3xl font-black">{s.title}</h3>
              <p className="mt-2 text-ink/80">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE + NOTEBOOK PREVIEW */}
      <section className="mt-24 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="paper-card-cream relative p-8 sm:p-12">
          <div className="absolute -top-3 left-8 rotate-[-3deg] rounded-md bg-coral px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white ink-border">
            Manifesto
          </div>
          <p className="font-display text-3xl font-black leading-tight sm:text-4xl">
            "AI literacy needs more than prompting. It needs the courage to test the machine."
          </p>
          <div className="mt-6 text-sm font-bold uppercase tracking-widest text-ink-muted">
            — The Glassbox principle
          </div>
        </div>
        <div className="relative">
          <div className="paper-card rotate-1 p-6">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-butter ink-border">
                🗂️
              </div>
              <div className="font-display text-xl font-black">Evidence Notebook</div>
              <span className="ml-auto rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                2 of 3 pinned
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                {
                  c: true,
                  txt: "Only one visible field changed. The receipt records both exact outputs.",
                  tone: "text-success",
                },
                {
                  c: true,
                  txt: "A confirming controlled test repeats the same comparison pattern.",
                  tone: "text-success",
                },
                { c: false, txt: "Multiple fields changed — confounded.", tone: "text-warn" },
              ].map((r, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-dashed border-ink/20 bg-paper p-3"
                >
                  <span className={`text-lg ${r.tone}`}>{r.c ? "✓" : "!"}</span>
                  <div className="text-sm text-ink">{r.txt}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-4 -right-2 rotate-[-4deg]">
            <PipBubble tone="butter">Nice — you're one clue away from a hypothesis.</PipBubble>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="mt-24">
        <div className="paper-card relative overflow-hidden p-8 text-center sm:p-14">
          <div className="bg-graph pointer-events-none absolute inset-0 opacity-40" />
          <AtomDoodle className="absolute left-6 top-6 h-10 w-10 text-coral/50" />
          <MagnifierDoodle className="absolute right-6 bottom-6 h-10 w-10 text-cobalt/50" />
          <h3 className="relative font-display text-4xl font-black sm:text-5xl">
            Don't just use AI. <span className="text-coral">Learn to test it.</span>
          </h3>
          <p className="relative mx-auto mt-3 max-w-xl text-ink-muted">
            One case. Ten test credits. Everything you need to change how a generation understands
            the machines around them.
          </p>
          <Link
            to="/mission"
            className="relative mt-6 inline-flex btn-coral btn-coral-hover rounded-full px-6 py-3.5 text-base font-black"
          >
            Start Case 01 →
          </Link>
        </div>
      </section>

      {/* Case walkthrough */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-2xl bg-paper ink-border">
          <DialogTitle className="font-display text-2xl">
            Case 01 — the interactive walkthrough
          </DialogTitle>
          <div className="mt-3 aspect-video rounded-2xl bg-gradient-to-br from-cream via-butter/40 to-lavender ink-border p-6">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <GlassBoxHero className="h-40" />
              <div className="mt-2 text-xs font-bold uppercase tracking-widest text-ink-muted">
                Case path
              </div>
            </div>
          </div>
          <ol className="mt-4 space-y-2 text-sm">
            <li>1. Meet StudyMatch v0.7 — an opaque model recommending study groups.</li>
            <li>2. Run controlled comparisons and pin the immutable receipts.</li>
            <li>3. Map a learner's claim to selected evidence, then unlock repair.</li>
            <li>4. Remove the proxy and run the computed eight-pair evaluation.</li>
          </ol>
        </DialogContent>
      </Dialog>

      {/* ONBOARDING OVERLAY */}
      <Dialog open={onbOpen} onOpenChange={setOnbOpen}>
        <DialogContent className="max-w-lg bg-paper ink-border">
          <DialogTitle className="sr-only">Onboarding</DialogTitle>
          <div className="text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-cream ink-border text-5xl animate-float-slow">
              {onbSlides[onbStep].emoji}
            </div>
            <h3 className="mt-6 font-display text-2xl font-black leading-tight">
              {onbSlides[onbStep].title}
            </h3>
            <p className="mt-3 text-ink-muted">{onbSlides[onbStep].body}</p>
            <div className="mt-6 flex justify-center gap-2">
              {onbSlides.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-8 rounded-full ${i === onbStep ? "bg-ink" : "bg-ink/20"}`}
                />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => {
                  setOnbOpen(false);
                  setOnboarded(true);
                  nav({ to: "/mission" });
                }}
                className="text-sm font-bold text-ink-muted hover:text-ink"
              >
                Skip
              </button>
              {onbStep < 2 ? (
                <button
                  onClick={() => setOnbStep(onbStep + 1)}
                  className="btn-coral btn-coral-hover rounded-full px-5 py-2 text-sm font-black"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOnbOpen(false);
                    setOnboarded(true);
                    nav({ to: "/mission" });
                  }}
                  className="btn-coral btn-coral-hover rounded-full px-5 py-2 text-sm font-black"
                >
                  Start Case 01 →
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
