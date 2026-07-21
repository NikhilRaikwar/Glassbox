# Paste this into a new Codex chat

```text
You are the implementation lead for Glassbox — The AI Detective Lab. Work directly in the current repository. Do not merely plan, describe, or mock the requested functionality: build it, verify it, and leave the repo runnable.

First read PRD.md completely. It is the source of truth for product scope, architecture, acceptance criteria, demo story, and Build Week constraints. Inspect the current codebase before editing. Preserve the project’s distinctive warm paper/notebook UI, routes, animations, and existing responsive navigation; evolve the polished prototype into a working product instead of replacing it with a generic dashboard or chat interface.

Project identity
- Name: Glassbox — The AI Detective Lab
- Track: OpenAI Build Week — Education
- One-line promise: Students learn to test an AI decision system with evidence, repair a harmful rule, and prove the result.
- Core learning loop: Test → collect evidence → write a hypothesis → repair → verify → proof card.

Non-negotiable Build Week constraints
- The entry must be a genuine, working, non-trivial project built using Codex and GPT-5.6.
- It must feel like a complete Education product, not a technical proof of concept and not a generic chatbot.
- The final repo must make it easy to demonstrate, deploy, and judge with no login.
- README must include exact setup/run steps, a judge demo path, sample data, an accurate “Built with Codex + GPT-5.6” section, and a short decision log. Never invent usage or features that did not happen.
- Preserve evidence needed for submission: dated commits, this primary Codex session, and the `/feedback` Session ID from the main build chat.
- The demo must support a public/unlisted YouTube video under three minutes with voiceover explaining what was built, how Codex was used, and how GPT-5.6 was used.
- Keep all content and claims truthful. This is a fictional/simulated learning case, not a real fairness-certification tool.
- Do not add or reintroduce any legacy platform name, package, integration, registry URL, branding, file, or copy.

What to build

1. Keep and improve Case 01: “The StudyMatch Mystery.” It is a playable AI-literacy case for ages 13–18. A fictional study-group recommender has a hidden, harmful commute-zone proxy. The learner must discover the issue with controlled experiments, state a claim with evidence, remove the proxy, and verify the repaired model.

2. Make every pivotal interaction real and stateful:
   - Create a pure TypeScript case engine for profiles, versioned model factors, scoring, controlled-vs-confounded experiment validation, immutable receipts, evidence thresholds, and an eight-pair evaluation suite.
   - Do not use an LLM to calculate a score, decide whether a test is controlled, or produce fairness metrics. Those must come from deterministic, tested code.
   - Replace all fixed UI scores and fixed repair metrics with values calculated by this engine.
   - Repair must create/use `StudyMatch v0.8`; it must truly remove the bad factor and make the selected good factors matter.
   - Retain anonymous session progress locally, with safe reset/replay behavior.

3. Add the real OpenAI-native Evidence Coach. This must be a constrained reasoning layer, not a chat window:
   - Use the official OpenAI JavaScript SDK and server-only `OPENAI_API_KEY`; never expose the key in browser code or a `VITE_` variable.
   - Use GPT-5.6 via the Responses API with Zod Structured Outputs (`responses.parse`). Follow current official OpenAI documentation; if a key is unavailable, do not block the rest of the build.
   - Add a typed POST endpoint/server function that accepts only anonymous selected receipts and a learner hypothesis. It returns this schema: verdict (supported/inconclusive/contradicted), receipt-level relevance, claim strength, evidence-grounded feedback, next best controlled experiment, and repair-access boolean.
   - Constrain the system prompt: feedback can only cite supplied receipts and case facts; it must say evidence is insufficient rather than fabricate a result; before sufficient evidence exists it must not reveal the hidden rule or penalty.
   - Implement loading, refusal, validation, timeout, missing-key, and network-error states. Include a deterministic local fallback coach mapper so the entire judge demo works without an API key. Be transparent in developer docs about fallback; do not claim live AI when it is a fallback.

4. Complete the product experience:
   - Landing and Mission: retain the current strong hook and add a clear one-click “Judge demo” path.
   - Probe Lab: show changed fields, controlled/confounded status, score/recommendation, a meaningful receipt, and evidence pinning.
   - Notebook: require selected evidence, assess the learner’s natural-language claim, render a claim-evidence map, and direct an inconclusive learner to one helpful next experiment rather than supplying the answer.
   - Repair Bench: use an actual versioned repair and render computed before/after fairness and match-quality measurements from the evaluation suite.
   - Proof: generate an accurate evidence trail and an actual downloadable PNG or printable proof card. Label it “simulated model repair,” never “certified fair.”
   - Add the small local-only educator peek specified in PRD.md.
   - Make the entire flow keyboard-accessible, responsive, and friendly with proper empty/loading/error states. Keep the white/cream graph-paper notebook visual system, visible focus states, and reduced-motion behavior.

5. Engineering quality and files:
   - Use focused, readable modules under a suitable `src/features/case-engine/` and `src/features/evidence-coach/` structure. Avoid a giant route component.
   - Add unit tests for scorer versions, experiment validity, evidence threshold, evaluation suite, and fallback coach mapping. Use the project’s existing tooling or add only the smallest necessary test setup.
   - Create `.env.example` with `OPENAI_API_KEY=` and `OPENAI_MODEL=gpt-5.6`; ensure `.env*` secrets are ignored.
   - Update README.md with project story, architecture, local setup, API-key optionality, no-key judge-demo instructions, test/build commands, data/privacy notes, accurate Codex/GPT-5.6 usage, major decisions, and a short 2:40 demo script.
   - Add `DECISIONS.md` explaining the key product and technical decisions in the team’s own voice. Add `DEMO_SCRIPT.md` with the video recording script from PRD.md, adapted to what actually works.
   - Include a suitable open-source LICENSE only if the repository currently has none and you can choose one without legal uncertainty; otherwise leave a clear README placeholder for the owner.

Execution rules
- Start by reading PRD.md and inspecting the existing routes/store/data. Then write a short implementation checklist in commentary and execute it.
- Use existing dependencies and patterns where practical. Do not re-scaffold the app. Do not delete the current visual design or its working flow unless replacing a mock result with working functionality.
- Treat the deterministic engine as the product source of truth. The GPT-5.6 coach may explain and assess supplied evidence but may not alter model outputs.
- Do not use fabricated testimonials, fake user counts, fake API calls, or static “AI-generated” result cards.
- Never put secrets in source control. If credentials are absent, continue in fully working no-key demo mode and document how to enable the live coach.
- Use `apply_patch` for edits. Preserve unrelated user changes. Do not run destructive git commands.
- Test as you go. Before finishing, run the production build and the focused test suite, then fix errors caused by your work. Inspect the app in a browser if tooling permits.
- If you must choose between broad extra features and a fully working core loop, finish the core loop.

Definition of done
- `npm run build` succeeds.
- Tests for the deterministic engine and fallback pass.
- A no-login user can start the judge demo, inspect valid evidence, unlock repair, run a real evaluation, and obtain a proof card without an OpenAI key.
- With `OPENAI_API_KEY` configured, the GPT-5.6 Evidence Coach returns schema-validated feedback through a server-only route.
- README, DECISIONS.md, DEMO_SCRIPT.md, .env.example, and PRD.md accurately match the finished build.
- Search the entire repository for legacy platform references and ensure none are present.
- End with a concise implementation summary, exact verification commands/results, files changed, what is live-vs-fallback, and the next manual submission steps (deploy URL, public video, `/feedback` Session ID, Devpost fields). Do not claim completion until these conditions are true.

Begin now. Make reasonable implementation decisions without waiting for confirmation; call out only a real credential or external-service blocker after completing every no-key part of the build.
```
