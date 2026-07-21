# Glassbox decisions

## We made the simulation deterministic first

The learning goal is to teach evidence, not to hide a calculation behind an assistant. Scores, controlled-test validity, evidence thresholds, repair access, and before/after measurements are all pure TypeScript. This makes every pivotal result repeatable and testable.

## We kept GPT-5.6 in a narrow coaching role

The Evidence Coach accepts only selected anonymous receipt projections plus a learner's claim. The Responses API returns a Zod-validated teaching assessment, but cannot alter a score, decide test validity, or generate a fairness metric. A server-side guard rejects an answer that cites an unselected receipt or tries to unlock repair before the deterministic threshold.

## We designed the fallback as a product path, not an error state

Build Week judges should not need credentials. The local fallback follows the same rubric as repair access, explains insufficient evidence, and recommends one controlled next experiment. The UI says when this local coach is in use instead of implying a live model response.

## We preserved the notebook lab instead of adding a dashboard

The original warm graph-paper visual system already fit the learning loop. We retained the route flow, responsive navigation, Pip helper, motion, and receipt metaphor, then swapped mock seams for stateful receipts and computed evidence.

## We call the outcome a simulated repair

The case uses fictional profiles and a deliberately small evaluation suite. The proof card records what this case measured; it never says a real system is certified fair.

## We made repair configuration real

Removing the proxy unlocks a separate immutable `StudyMatch v0.8` configuration. Added topic and collaboration factors change that version's scorer, and the evaluation suite runs against the actual selected configuration.
