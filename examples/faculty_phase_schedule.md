# Faculty Phase Schedule (v2.4)

Recommended (phase × faculty) intensity matrix. Mirrors MiCRo's empirical finding that **early transformer layers favor Language, later layers favor Logic / Social / World** (Alkhamissi et al. 2026, Fig. 13–14). Lifted to pipeline-phase level.

Read by the orchestrator at the start of each phase. **Overridden by the Agent × Faculty matrix when the two disagree** (matrix is role-specific, schedule is a phase prior).

---

## Full schedule

| Phase | Agent(s) | Language | Logic | Social | World | Notes |
|-------|----------|:---:|:---:|:---:|:---:|---|
| 0.5  | Router   | medium | strong | — | light | Classification + structured logic |
| 0.75 | All (priming) | medium | medium | medium | medium | Even warmup |
| 1    | A1       | medium | strong | — | strong | Derivations + lit grounding |
| 1    | A6       | strong | light  | — | strong | Clear summaries + integration |
| 1.5  | A7       | — | strong | — | light | Rule check |
| 2.0  | A2       | medium | strong | **SUPPRESS** | light | Pure numerical |
| 2.2  | A7       | — | strong | — | — | Filter |
| 2.3  | A2 inner | light | strong | **SUPPRESS** | light | Cheap rollouts |
| 2.5  | A2 full  | medium | strong | **SUPPRESS** | medium | Committed branch |
| 2.6  | A7       | — | strong | — | medium | Lvl-4 gate |
| 3    | A3       | medium | strong | medium | medium | Subgroup equity demands Social ≥ medium |
| 3.5  | A7       | — | strong | medium | medium | Equity check at gate |
| 4    | A4       | strong | medium | **STRONG** | medium | Consent / equity / safety |
| 4.5  | A7       | — | strong | strong | medium | Lvl-5 gate |
| 5a   | A5 candidate gen | **STRONG** | medium | medium | strong | Long-form coherence |
| 5b   | Judge A  | medium | strong | — | medium | Rigor focus |
| 5b   | Judge B  | medium | medium | **STRONG** | strong | Translational focus |
| 5c   | Probes   | n/a | n/a | n/a | n/a | External checks, not steering |
| 5d   | A8 Reflector | medium | medium | medium | **STRONG** | DMN long-horizon read |
| 5e   | Scoreboard | n/a | n/a | n/a | n/a | External evaluation |

---

## Reading the schedule

Orchestrator at start of each phase:

```python
schedule_entry = phase_schedule[phase_id][agent_role]
# returns: {"language": "medium", "logic": "strong", "social": "suppress", "world": "light"}

# Then check Agent × Faculty matrix
matrix_entry = agent_faculty_matrix[agent_role]
# returns: {"language": "✓", "logic": "✓✓✓", "social": None, "world": "✓"}

# Resolve conflict: matrix wins for non-blank cells
final_intensity = {}
for f in faculties:
    if matrix_entry[f] is None:
        final_intensity[f] = "neutral"  # no steering, no suppression
    elif matrix_entry[f] in ["✓✓✓"]:
        final_intensity[f] = max(schedule_entry[f], "strong")
    elif matrix_entry[f] in ["✓✓"]:
        final_intensity[f] = max(schedule_entry[f], "medium")
    else:
        final_intensity[f] = schedule_entry[f]

log_to(faculty_steering_log.md, phase, agent, final_intensity, source="matrix_override" if differed else "schedule")
```

---

## Why this hierarchy

Three patterns from MiCRo translate cleanly:

1. **Early layers = Language.** MiCRo's Layer 1–3 routed mostly to the Language expert (perceptual / linguistic grounding). Our Phase 1 + 5a (writing-heavy) get Language=strong.

2. **Late layers = Domain.** MiCRo's Layer 10–16 routed mostly to domain experts (Logic for math, Social for ToM, World for DMN). Our Phase 4 (Social-heavy clinical) + Phase 5d (World-heavy reflection) follow the same pattern.

3. **Suppress when irrelevant.** MiCRo §5.5 showed ablating Social during math improved performance. Our Phase 2 numerical sim suppresses Social to keep Agent 2 in analytical mode.

---

## Common override situations

| Override | Reason | Logged as |
|----------|--------|-----------|
| User says "this trial is for a healthy-volunteer cohort, equity is less central" | Real | Phase 4 Social drops from strong to medium |
| Pipeline mode is `methods_rep` (Router) | Pipeline scope | Phase 1 A6 World drops from strong to medium |
| Cost budget tight | Resource | All `light` → `n/a` (no steering snippet injected) |

All overrides logged with reason. Default schedule is the recommended starting point, not a mandate.
