# Glassbox — The AI Detective Lab

Glassbox is a no-login AI-literacy case for students ages 13–18. In Case 01, **The StudyMatch Mystery**, a learner runs controlled tests on a fictional study-group recommender, writes an evidence-backed hypothesis, removes a harmful commute-zone proxy, and proves the simulated repair with a repeatable evaluation.

This is an educational simulation. It is not a fairness-certification tool and it does not use real student data.

## Quick start

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

Open the local URL printed by Vite. No account, database, or API key is required for the complete judge path.

To enable the optional live Evidence Coach, copy the example environment file, add a server-only key, and restart the dev server:

```powershell
Copy-Item .env.example .env
```

Set `OPENAI_API_KEY` in `.env`. The default `OPENAI_MODEL` is `gpt-5.6`. Never use a `VITE_` prefix for this key. `.env*` is ignored by Git except `.env.example`.

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Judge demo path — works with no API key

1. On the landing page, select **Judge demo**.
2. The Evidence Notebook opens with two controlled, high-signal receipts and one confounded receipt from the fictional case.
3. Read the claim–evidence map, then select **Open Repair Bench**.
4. Remove the `Zone C penalty`, keep or add the learning-relevant factors, and run the **eight-pair evaluation**.
5. Open the Proof Card and use **Download PNG proof card** or **Print proof card**.

The judge demo seeds only anonymous, fictional local session data. It is replayable through **Reset demo** or **Replay Case 01**.

## Sample case data

The fixed reference profile is Maya: Robotics, Morning, Growing, Collaborative, Zone A, Standard accessibility. An otherwise matching fictional profile in Zone C receives a score 44 points lower in the pre-repair `StudyMatch v0.7` engine. Learners must repeat that kind of single-variable comparison before repair access is unlocked.

The post-repair `StudyMatch v0.8` configuration removes the commute-zone factor. Its selected topic-alignment and collaboration-style factors are real configuration inputs to the scorer, not visual-only toggles.

## Architecture

```text
Probe Lab → immutable receipts → Evidence Notebook → Repair Bench → Proof Card
                     │                    │
                     │                    └─ optional GPT-5.6 Evidence Coach
                     │                       (schema-validated, server-only)
                     └─ pure TypeScript case engine
```

- `src/features/case-engine/` is the product source of truth: versioned configurations, scoring, experiment validity, receipts, evidence threshold, and the eight-pair evaluation suite.
- `src/features/evidence-coach/` holds the typed POST TanStack Start server function, Zod response contract, constrained GPT-5.6 prompt, and deterministic fallback mapper.
- `src/store/useGlassboxStore.ts` persists anonymous local progress only. It never stores an API key or sends full user identity data.
- Routes retain the warm paper/notebook experience while rendering computed engine values rather than mock metrics.

## Evidence Coach: live and fallback behavior

When `OPENAI_API_KEY` is present, the server function uses the official `openai` JavaScript SDK, the Responses API, `responses.parse`, and Zod Structured Outputs. It sends only selected anonymous receipt projections and the learner's hypothesis. The server adds a bounded timeout, handles refusals or invalid responses, and validates that returned receipt IDs were supplied by the learner.

The model cannot calculate scores, decide whether a test is controlled, calculate fairness metrics, or unlock repair by itself. Those decisions stay in the tested deterministic engine.

When no key is configured—or a timeout, refusal, validation failure, or network problem occurs—the app uses a visible deterministic local Evidence Coach fallback. The fallback preserves the same evidence threshold and gives the next best controlled experiment, so the full demo remains runnable without live AI. This repository's verification was performed in fallback mode; no live API call is claimed here.

## Verify

```sh
npm run test
npm run build
```

The test suite covers the v0.7/v0.8 scorer behavior, controlled versus confounded receipts, evidence threshold, eight-pair evaluation, and fallback coach mapping.

## Privacy and data

- All profiles are fictional.
- No login, analytics SDK, database, tracking pixel, or student PII is used.
- Session progress lives in the browser's local storage and can be reset safely.
- Optional coach requests contain only selected anonymous receipt fields and a learner-entered hypothesis; they are not logged by this app.

## Built with Codex + GPT-5.6

This Build Week implementation was developed in the primary Codex session for this repository. Codex was used to inspect the existing TanStack Start app, extract the deterministic domain engine, wire the UI to stateful receipts and evaluations, add tests, and run the build/test verification.

The optional Evidence Coach is designed for GPT-5.6 through the official Responses API and Zod Structured Outputs. GPT-5.6 is constrained to assess supplied evidence; it does not determine model behavior. The no-key verification path used the deterministic fallback because this workspace did not provide an API key.

Keep dated commits, this primary Codex session, and the `/feedback` Session ID from this build chat with the submission materials. Add the final session ID only after retrieving it from the main chat.

## Decision log

See [DECISIONS.md](DECISIONS.md) for the product and technical choices made for the MVP. The short recording plan is in [DEMO_SCRIPT.md](DEMO_SCRIPT.md).

## 2:40 demo script

- **0:00–0:15:** Show a controlled StudyMatch comparison and the receipt.
- **0:15–0:55:** Pin two receipts, submit a claim, and show the evidence map.
- **0:55–1:40:** Remove the proxy, add learning signals, and run the eight-pair evaluation.
- **1:40–2:10:** Show the simulated-repair proof card, PNG export, and educator peek.
- **2:10–2:35:** Show the deterministic case engine and server-only GPT-5.6 structured-output function.
- **2:35–2:40:** “Don’t just use AI. Learn to test it.”

Use the expanded [DEMO_SCRIPT.md](DEMO_SCRIPT.md) when recording. The final video must be public or unlisted, under three minutes, voiced over, and explain both Codex and GPT-5.6 use.

## License

MIT © 2026 Nikhil Raikwar. See [LICENSE](LICENSE).
