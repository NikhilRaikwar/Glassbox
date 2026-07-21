import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useGlassboxStore } from "@/store/useGlassboxStore";
import { toast } from "sonner";
import { AtomDoodle } from "./doodles";

export function TopNav() {
  const [open, setOpen] = useState(false);
  const reset = useGlassboxStore((s) => s.resetDemo);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-2 shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-butter ink-border shadow-[2px_2px_0_#25231E] transition-transform group-hover:-rotate-6">
            <AtomDoodle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg font-black leading-none tracking-tight">Glassbox</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">AI Detective Lab</div>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-cream">
                How it works
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-paper border-l border-ink/10 w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">How Glassbox works</SheetTitle>
              </SheetHeader>
              <ol className="mt-6 space-y-4">
                {[
                  ["🧪", "Run a controlled experiment", "Change one variable at a time between two profiles."],
                  ["👀", "See a visible decision", "The model prints a score. No hand-waving."],
                  ["🗂️", "Record evidence, not guesses", "Pin test receipts into your notebook."],
                  ["🛠️", "Propose a repair", "Remove unfair proxies. Keep learning signals."],
                  ["✨", "Prove the repair", "A hidden fairness test scores the new model."],
                ].map(([e, t, d], i) => (
                  <li key={i} className="flex gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream ink-border text-xl">{e}</div>
                    <div className="min-w-0">
                      <div className="font-bold text-ink">{t}</div>
                      <div className="text-sm text-ink-muted">{d}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-8 rounded-2xl bg-lavender/40 ink-border p-4 text-sm">
                <div className="text-[11px] font-bold uppercase tracking-widest text-ink-muted">Evidence Coach</div>
                <p className="mt-1 text-ink">
                  GPT-5.6 can assess a learner's selected receipts through a structured response. Scores, test validity, and evaluation metrics always come from the deterministic case engine.
                </p>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/mission" className="rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-cream">Play the demo</Link>
          <Link to="/lab" className="rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-cream">Probe Lab</Link>
          <Link to="/notebook" className="rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-cream">Notebook</Link>
          <span className="ml-2 rounded-full bg-lavender px-3 py-1.5 text-xs font-bold text-ink ink-border">For educators ✨</span>
        </nav>

        <Button
          variant="ghost"
          size="sm"
          className="ml-auto md:ml-2 text-xs text-ink-muted hover:text-ink"
          onClick={() => { reset(); toast.success("Demo reset. Fresh case, fresh clues."); }}
        >
          Reset demo
        </Button>
      </div>
    </header>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 md:hidden">
      <div className="paper-card flex items-center justify-between px-2 py-2">
        {[
          { to: "/mission", label: "Mission", emoji: "🎯" },
          { to: "/lab", label: "Lab", emoji: "🧪" },
          { to: "/notebook", label: "Notes", emoji: "🗂️" },
          { to: "/repair", label: "Repair", emoji: "🛠️" },
          { to: "/proof", label: "Proof", emoji: "✨" },
        ].map((i) => (
          <Link
            key={i.to}
            to={i.to}
            activeProps={{ className: "bg-cream" }}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-bold text-ink"
          >
            <span className="text-lg leading-none">{i.emoji}</span>
            <span>{i.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
