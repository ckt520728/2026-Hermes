# Cognitive Probes (v2.3)

Four mini-probes that verify which cognitive faculty the agent's output actually engaged. Analogous to fMRI localizers (Fedorenko Language localizer, Multiple Demand localizer, Theory of Mind localizer) used to localize functional networks in human brains and validated in **Alkhamissi et al. 2026 (MiCRo, ICLR)** to localize expert modules in LLMs.

## Files

| Probe | Faculty | Analog |
|-------|---------|--------|
| `language_probe.md` | Language | Fedorenko language localizer |
| `logic_probe.md`    | Logic    | Multiple Demand network localizer |
| `social_probe.md`   | Social   | Theory of Mind localizer (+ first-class equity check) |
| `world_probe.md`    | World    | Literature-grounding / DMN integration check |

## When to run

- **At Phase 5c** (after Judge ensemble, before Reflector): run all four on the winning paper + grant.
- **Optionally at Phase 1.5 / 4.5 Monitor gates** for high-stakes runs.
- **Always**: if any probe fails with `verdict: FAIL`, route the failing section back to the responsible agent with the relevant faculty-steering snippet at strong intensity.

## Output

Each probe appends to `cognitive_probe_log.jsonl`:

```jsonl
{"probe": "language", "subject_agent": "agent5_paper_final.md", "verdict": "PASS", "checks": {...}}
{"probe": "logic",    "subject_agent": "agent5_paper_final.md", "verdict": "FAIL", "checks": {...}, "recommendation": "..."}
```

## Mandatory checks (cannot be bypassed)

| Probe | Mandatory check | Rationale |
|-------|------------------|-----------|
| Social | `equity_addressed = true` | Promoted from Judge B's rubric to a hard gate |
| World  | `no_fabricated_citations = true` | Hallucinated references are scientific malpractice |
| Logic  | (none mandatory; ≥4/5 of overall) | |
| Language | (none mandatory; ≥4/5 of overall) | |
