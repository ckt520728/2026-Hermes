# Cognitive Faculty Steering Snippets (v2.3)

Twelve snippets — 4 faculties × 3 intensities. The orchestrator reads this file, picks the relevant rows from the Agent × Faculty matrix, and prepends them to a `delegate_task` call's `context`.

The four faculties mirror the brain networks formalized in **Alkhamissi et al. 2026 (MiCRo, ICLR)**: Language (Fedorenko language network), Logic (Multiple Demand network), Social (Theory of Mind network), World (Default Mode Network).

---

## LANGUAGE FACULTY

### Light
> Use precise terminology. Avoid ambiguity. Prefer concrete nouns over abstract phrases.

### Medium
> **Language faculty (language network engagement).** Aim for: precise terminology, consistent term usage (a concept introduced as "X" stays "X" throughout), and zero unexplained jargon. Hedge appropriately for the evidence level.

### Strong
> **Language faculty, strong engagement.** Before producing output, identify the 5 most load-bearing concepts and define each in one sentence at first use. Do not switch synonyms (alpha power ≠ alpha rhythm ≠ 8–12 Hz oscillation — pick one). Read every sentence aloud mentally: if it requires re-reading to parse, rewrite.

---

## LOGIC FACULTY

### Light
> Make derivations explicit. Avoid logical leaps.

### Medium
> **Logic faculty (Multiple Demand network engagement).** Every quantitative claim must be traceable to an upstream value or computation. Hedges must match evidence ("suggests" vs "demonstrates"). Flag any leap of >2 inferential steps with `[LOGIC-GAP]`.

### Strong
> **Logic faculty, strong engagement.** Before producing output: (1) list every quantitative claim you intend to make; (2) for each, show the derivation chain assumption → step → step → conclusion; (3) bound every estimate with a CI or explicit "Not reported"; (4) where the chain breaks, mark it `[LOGIC-GAP]` rather than papering over it. Do not narrate that you did this — just do it.

---

## SOCIAL FACULTY

### Light
> Consider whether your reader / reviewer / patient might object. Address one likely objection.

### Medium
> **Social faculty (Theory of Mind engagement).** Adopt the perspective of two readers: (a) the most skeptical likely reviewer; (b) a clinician unfamiliar with your model class. Each section should survive both perspectives. Mark sections that fail with `[ToM-CHECK]`.

### Strong
> **Social faculty, strong engagement.** Before producing output, adopt three perspectives in sequence:
> 1. **Skeptical reviewer** — what is the weakest claim? How would they attack?
> 2. **Clinician outsider** — does the relevance to patient care survive a 5-minute read?
> 3. **Patient who would be a trial candidate** — does informed consent treat them as a partner or as a data point? Are equity considerations addressed (subgroup access, language, literacy)?
>
> Each section must survive all three. Where it does not, mark `[ToM-CHECK]` for revision. Equity, consent quality, and reviewer-defense are NOT add-ons — they are load-bearing.

---

## WORLD FACULTY (Default Mode Network-style)

### Light
> Ground claims in literature. Note precedent where it exists.

### Medium
> **World faculty (Default Mode Network engagement).** Connect the current micro-claim to its place in the broader field: what does this update? what does it leave open? Use citations from Agent 6's reference list, not your training data.

### Strong
> **World faculty, strong engagement (DMN-style integration across long timescales).** Step back from sentence-level optimization. Ask:
> 1. **Across the whole document** — is the throughline a single coherent story or 5 stapled reports?
> 2. **Across the field** — where does this work sit on the 10-year arc of `[topic]`? What did the field believe 5 years ago? What will it believe 5 years from now if this paper is right?
> 3. **Across time within the paper** — does early framing set up the later results, or did the framing drift?
>
> If the throughline breaks, rewrite the framing rather than the result.

---

## Composition rule

For an agent call with `faculties=["language", "logic"]` and `faculty_intensity={"language": "medium", "logic": "strong"}`:

```
context =
    LANGUAGE_MEDIUM_SNIPPET
    + "\n\n"
    + LOGIC_STRONG_SNIPPET
    + "\n\n"
    + ROLE_BRIEF
    + "\n\n"
    + REFUSAL_PROTOCOL_CLAUSE
```

Total snippet budget per call: ≤ 400 tokens (4 faculties × 100 tokens). If over budget, drop the lowest-intensity snippet first.
