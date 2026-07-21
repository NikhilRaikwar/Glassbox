import { createFileRoute, Link } from "@tanstack/react-router";
import { useGlassboxStore } from "@/store/useGlassboxStore";
import { PipBubble } from "@/components/glassbox/PipBubble";
import { MagnifierDoodle } from "@/components/glassbox/doodles";

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title: "Case 01 — Mission briefing | Glassbox" },
      { name: "description", content: "Your mission: use controlled tests to uncover StudyMatch v0.7's hidden rule and repair it." },
      { property: "og:title", content: "Case 01: The StudyMatch Mystery" },
      { property: "og:description", content: "Ten test credits. One hidden rule. Can you find it?" },
    ],
  }),
  component: Mission,
});

function Mission() {
  const credits = useGlassboxStore((s) => s.credits);
  const objectives = [
    { label: "Run a controlled experiment", emoji: "🧪" },
    { label: "Collect three pieces of evidence", emoji: "🗂️" },
    { label: "Name the hidden rule", emoji: "🧠" },
    { label: "Repair the model", emoji: "🛠️" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Mission card */}
        <div className="paper-card relative overflow-hidden p-6 sm:p-10 animate-stagger">
          <div className="bg-graph absolute inset-0 opacity-30" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-coral/15 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-coral">Case 01</span>
              <span className="rounded-full bg-butter px-3 py-1 text-[11px] font-black uppercase tracking-widest text-ink ink-border">Difficulty · Curious</span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-black leading-tight sm:text-5xl">The StudyMatch Mystery</h1>
            <p className="mt-4 max-w-2xl text-ink/80">
              StudyMatch v0.7 recommends students for limited research-study groups. It claims to be fair.
              Your mission: use controlled tests to discover whether its decisions are justified.
            </p>

            <div className="mt-8">
              <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">Objectives</div>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {objectives.map((o, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-2xl bg-cream ink-border px-4 py-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white ink-border text-lg">{o.emoji}</div>
                    <div className="min-w-0 font-bold text-ink">{o.label}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {["Controlled test 🧪", "Evidence notebook 🗂️", "Repair bench 🛠️"].map((t) => (
                <span key={t} className="rounded-full bg-white ink-border px-3 py-1.5 text-xs font-bold text-ink shadow-[2px_2px_0_#25231E]">{t}</span>
              ))}
            </div>

            <div className="mt-8"><PipBubble>Tip: Change one thing at a time. Otherwise you cannot tell what caused the result.</PipBubble></div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/lab" className="btn-coral btn-coral-hover inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-black">
                Enter Probe Lab 🧪
              </Link>
              <span className="text-xs text-ink-muted">This is a fictional learning sandbox. It is not an admissions or hiring system.</span>
            </div>
          </div>
        </div>

        {/* Credits + kit */}
        <div className="space-y-6 animate-stagger" style={{ animationDelay: ".08s" }}>
          <div className="paper-card-cream relative p-6 text-center">
            <div className="text-[11px] font-black uppercase tracking-widest text-ink-muted">Detective kit</div>
            <div className="relative mx-auto mt-4 grid h-40 w-40 place-items-center">
              <svg viewBox="0 0 120 120" className="absolute inset-0">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#25231E" strokeOpacity="0.1" strokeWidth="10" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="#FF7658" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${(credits / 10) * 326} 326`} transform="rotate(-90 60 60)" />
              </svg>
              <div className="relative text-center">
                <div className="font-display text-5xl font-black text-ink">{credits}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-ink-muted">test credits</div>
              </div>
            </div>
            <p className="mt-2 text-sm text-ink-muted">Spend wisely. Each experiment costs one credit.</p>
          </div>

          <div className="paper-card p-6">
            <div className="flex items-center gap-2">
              <MagnifierDoodle className="h-6 w-6 text-cobalt" />
              <div className="font-display text-lg font-black">What a strong test looks like</div>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-ink/80">
              <li>· Two profiles differ in <b>exactly one</b> field.</li>
              <li>· Everything else is held constant.</li>
              <li>· The output difference points to that one variable.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
