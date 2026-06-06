# Faculty Suppression Snippets (v2.4)

Four anti-steering snippets — one per faculty. Used when the Phase Schedule says `suppress` for a given (phase, agent, faculty) combination.

MiCRo §5.5: "ablating the least relevant expert (e.g., the social expert for math benchmarks) yields further gains." We apply the principle at the prompt level: explicitly tell the agent NOT to engage a faculty when that faculty would degrade the task.

Without explicit suppression, an LLM's default behavior leans toward Social engagement (audience awareness, hedging) which on a pure numerical task adds verbosity and reduces precision.

---

## LANGUAGE — suppression
> **Language faculty — SUPPRESS for this task.** Do not invest effort in prose quality. Output should be a data structure (JSON, table, code) or a terse bullet list. Sentences are unnecessary. Skip explanations.

When to use: log generation, machine-readable handoffs, code-only outputs.

---

## LOGIC — suppression
> **Logic faculty — SUPPRESS for this task.** Do not derive, calculate, or verify. Treat numbers as given. Your job here is to surface, narrate, or rephrase — not to check.

When to use: copy-editing passes, abstract polishing, prose smoothing. **Rare** — almost every research task benefits from Logic.

---

## SOCIAL — suppression
> **Social faculty — SUPPRESS for this task.** Do not engage Theory of Mind reasoning. Do not anticipate reviewer reactions. Do not consider patient or audience perspective. Do not hedge for diplomatic effect. This is an analytical task; the appropriate stance is detached and precise. Output should read like a method paragraph or a calculation, not a discussion paragraph.

When to use: pure numerical simulation (A2), parameter scans, code generation, internal log writing.

---

## WORLD — suppression
> **World faculty — SUPPRESS for this task.** Do not integrate across long timescales. Do not reflect on field-wide implications or 5-year arcs. Stay strictly within the current section's local scope. Do not pull in literature beyond what is in the immediate context.

When to use: sentence-level edits, format conversions, single-section drafting where the broader frame is fixed. **Rare** for synthesis tasks.

---

## Composition with positive steering

Positive and suppression snippets can coexist. Example for Agent 2 inner search:

```
context =
    LOGIC_STRONG_SNIPPET           # positive
    + "\n\n"
    + SOCIAL_SUPPRESS_SNIPPET      # negative
    + "\n\n"
    + ROLE_BRIEF
    + "\n\n"
    + REFUSAL_PROTOCOL_CLAUSE
```

This combination tells A2 to engage Logic strongly AND specifically stay out of Social mode. Empirically this gives denser, more numerically precise output than positive steering alone.

---

## When suppression is overruled

Suppression is overruled when the Agent × Faculty matrix has ✓ or higher for that cell. Example:

- Phase Schedule says Phase 4 A4: Social=STRONG.
- Suppression is NEVER injected for Phase 4 A4 because A4's matrix entry for Social is ✓✓✓.

If the user explicitly requests `suppress` on a cell where the matrix has ✓✓✓, the orchestrator escalates:
> "You asked to suppress Social on Agent 4 (Clinical), but the Agent × Faculty matrix says A4 critically needs Social (consent / equity / safety). This would produce an inhumane protocol. Confirm override? [y/N]"

---

## Logged suppressions

Every injection logged to `faculty_suppression_log.jsonl`:

```json
{
  "timestamp": "2026-06-06T10:14:00Z",
  "phase": "phase_2.3",
  "agent": "agent2_search",
  "faculty_suppressed": "social",
  "source": "schedule",
  "user_override": false
}
```

This log lets you audit "did suppression actually fire where we expected?" (QC checklist item #29 in v2.4).
