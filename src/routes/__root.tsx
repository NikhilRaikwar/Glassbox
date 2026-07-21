import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { TopNav, MobileNav } from "@/components/glassbox/TopNav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-graph-soft px-4">
      <div className="paper-card max-w-md p-10 text-center">
        <div className="font-display text-7xl font-black text-ink">404</div>
        <h2 className="mt-2 font-display text-2xl">This clue leads nowhere</h2>
        <p className="mt-2 text-sm text-ink-muted">The page you're looking for isn't in the notebook.</p>
        <a href="/" className="mt-6 inline-flex btn-coral btn-coral-hover rounded-full px-5 py-2.5 text-sm font-bold">
          Back to the lab
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-graph-soft px-4">
      <div className="paper-card max-w-md p-8 text-center">
        <h1 className="font-display text-2xl">A beaker tipped over 🧪</h1>
        <p className="mt-2 text-sm text-ink-muted">Something went wrong. Try again or head home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-coral btn-coral-hover rounded-full px-4 py-2 text-sm font-bold">Try again</button>
          <a href="/" className="rounded-full ink-border px-4 py-2 text-sm font-bold text-ink hover:bg-cream">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Glassbox — The AI Detective Lab" },
      { name: "description", content: "Glassbox turns students into AI detectives. Run controlled tests, uncover hidden rules, and repair a model before it affects anyone." },
      { name: "author", content: "Glassbox" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800;9..144,900&family=Nunito+Sans:wght@400;600;700;800;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-graph-soft">
        <TopNav />
        <Outlet />
        <MobileNav />
        <footer className="mx-auto max-w-7xl px-6 pb-28 pt-16 text-center text-xs text-ink-muted md:pb-10">
          Built for curious minds. No real student data used. © Glassbox
        </footer>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
