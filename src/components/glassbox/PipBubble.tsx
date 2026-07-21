import { PipFirefly } from "./doodles";
import type { ReactNode } from "react";

export function PipBubble({ children, tone = "cream" }: { children: ReactNode; tone?: "cream" | "lavender" | "butter" }) {
  const bg = tone === "lavender" ? "bg-lavender" : tone === "butter" ? "bg-butter" : "bg-cream";
  return (
    <div className="flex items-start gap-3 animate-stagger">
      <PipFirefly className="h-12 w-12 shrink-0 animate-float-slow" />
      <div className={`relative ${bg} ink-border rounded-2xl px-4 py-3 text-sm text-ink shadow-[3px_3px_0_#25231E]`}>
        <div className="absolute -left-2 top-4 h-4 w-4 rotate-45 ink-border border-r-0 border-t-0" style={{ background: "inherit" }} />
        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Pip says</div>
        <div className="mt-1 font-medium">{children}</div>
      </div>
    </div>
  );
}
