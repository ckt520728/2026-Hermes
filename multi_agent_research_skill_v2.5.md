---
name: multi-agent-research-pipeline
description: "Use when the user wants to execute a research project using a multi-agent architecture — from literature review and computational modeling to simulation, data analysis, clinical trial design, and paper/grant writing. v2.5 moves the Cognitive Faculty Layer from measured-and-static to self-correcting and project-adaptive. Six upgrades: (1) Faculty Handoff Repair — when Flow Tracking detects faculty death, auto-respawn the consumer with the dropped faculty boosted, instead of merely warning; (2) Per-Project Faculty Calibration — past-run Flow logs learn which (phase × faculty) cells need adjustment for THIS project's domain, written to project_faculty_calibration.yaml; (3) Multi-faculty Ablation (2×2) — extend v2.4 single-faculty ablation to a 2-faculty factorial design that measures main effects AND interaction, analog of MiCRo's multi-expert ablation in §5.2; (4) Continuous Faculty Intensity — replace v2.4's {light, medium, strong, suppress} buckets with a continuous 0–1 scale (5-level snippet bucket option preserved); (5) Topographic Locality metric — added to the Alignment Scoreboard, measures how spatially compact each faculty's engagement is across the pipeline, inspired by Binhuraib et al. 2025 topographic LM work; (6) CogBench Integration Hook — placeholder path so that when a CogBench-runnable endpoint is configured, Phase 5e calls it instead of the 8-metric analog. Depends on: academic-paper-review, arxiv, execute_code, delegate_task."
version: 2.5.0
author: OWL + Kwota
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [research, multi-agent, pipeline, handoff-repair, project-calibration, factorial-ablation, continuous-intensity, topographic-locality, cogbench-hook]
    related_skills: [academic-paper-review, arxiv, writing-plans, requesting-code-review]
    inspired_by:
      - "Webb, Mondal & Momennejad (2025). Nat Commun 16:8633. MAP architecture."
      - "Villa et al. (2025). Intell-Based Med 12:100274. Arkangel AI."
      - "Alkhamissi et al. (2026). ICLR. Mixture of Cognitive Reasoners (MiCRo). https://cognitive-reasoners.epfl.ch/"
      - "Binhuraib et al. (2025). Topoformer: brain-like topographic organization in transformer language models through spatial querying and reweighting. arXiv 2510.18745."
  model_assignment:
    router:           haiku
    agent1_compute:   opus
    agent6_lit:       haiku
    agent2_sim:       sonnet
    agent2_search:    haiku
    agent3_data:      sonnet
    agent4_clinical:  opus
    agent5_synthesis: opus
    agent7_monitor:   haiku
    agent8_reflector: opus
    judge_a:          opus
    judge_b:          opus
  monitor_strictness:
    phase_1.5:  3
    phase_2.2:  2
    phase_2.6:  4
    phase_3.5:  4
    phase_4.5:  5
  cognitive_faculties:
    enabled: true
    faculties: [language, logic, social, world]
    steering_dir: examples/cognitive_faculty_steering.md
    probes_dir:   examples/cognitive_probes/
    phase_schedule_file: examples/faculty_phase_schedule.md
    flow_tracking_file:  faculty_flow.jsonl
    suppression_enabled: true
    suppression_snippets_file: examples/faculty_suppression_snippets.md
    # NEW in v2.5
    intensity_mode: continuous          # discrete_4 | discrete_5 | continuous
    intensity_buckets:                  # used when mode=discrete_5
      suppress: 0.0
      light:    0.3
      medium:   0.6
      strong:   0.85
      max:      1.0
  handoff_repair:                       # NEW in v2.5
    mode: auto                          # auto | suggest | log_only
    max_repairs_per_handoff: 1          # avoid infinite loops
    repair_budget_fraction: 0.15        # max % of total cost budget repairs can consume
  project_calibration:                  # NEW in v2.5
    enabled: true
    project_id: <set_at_phase_0>
    calibration_file: project_faculty_calibration.yaml
    min_runs_before_override: 3         # need ≥3 historical runs before overriding default schedule
  faculty_ablation:
    enabled: false
    mode: single                        # NEW: single (v2.4) | factorial_2x2 (v2.5)
    ablate_one_of: [social, world]
    factorial_pair: [social, world]     # used when mode=factorial_2x2
    metric_for_delta: alignment_score
  alignment_scoreboard:
    enabled: true
    rubric_file: examples/alignment_scoreboard.md
    output_file: alignment_scoreboard_results.md
    include_topographic_locality: true  # NEW in v2.5 — adds metric #9
  cogbench_hook:                        # NEW in v2.5
    endpoint: null                      # set to URL when CogBench API available; null = use 8-metric analog
    fallback_to_analog: true
  domain_priming:
    enabled: false
    cases_per_agent: 3
  stage2_routing:
    mode: top1
  cost_budget_usd: null
  router_memory_file: router_memory.jsonl
  cost_telemetry_file: cost_log.jsonl
---

# Multi-Agent Research Pipeline (v2.5)

Self-correcting and project-adaptive. v2.4 made the Cognitive Faculty Layer measurable; v2.5 makes it learn from its measurements and act on them.

> **v2.5 — What changed since v2.4**
> Six upgrades, four core + two preparation:
>
> **Core (active by default):**
> 1. **Faculty Handoff Repair** — When `faculty_flow.jsonl` flags a `WARN: faculty_dropped_at_handoff`, the orchestrator can now AUTO-respawn the consumer agent with the dropped faculty at strong intensity. v2.4 only logged. v2.5 closes the loop. Configurable as `auto | suggest | log_only`; bounded by a repair budget.
> 2. **Per-Project Faculty Calibration** — Past Flow logs from this same `project_id` learn which (phase × faculty) cells should differ from the default Phase Schedule for this project's domain. Writes `project_faculty_calibration.yaml`. Default schedule is the prior; this is the project-specific posterior.
> 3. **Multi-faculty Ablation (2×2 factorial)** — v2.4 ablated one faculty at a time. v2.5 adds the option to ablate a pair simultaneously (e.g., Social × World), producing main effects AND an interaction term. Analog of MiCRo's joint-expert ablations.
> 4. **Continuous Faculty Intensity** — replace v2.4's 4 discrete buckets with a continuous 0–1 scale. Default snippet selection still rounds to the nearest 5-level bucket (suppress / off / light / medium / strong / max), but the continuous value drives Calibration (#2) and Ablation arithmetic (#3).
>
> **Preparation (opt-in or placeholder):**
> 5. **Topographic Locality metric** — added to the Alignment Scoreboard (becomes metric #9). Measures how spatially compact each faculty's engagement is across the pipeline. Inspired by **Binhuraib et al. 2025** topographic LM work (cited by MiCRo).
> 6. **CogBench Integration Hook** — placeholder code path: if `metadata.cogbench_hook.endpoint` is set, Phase 5e calls real CogBench. Otherwise falls back to v2.4's 8-metric analog. Skill is now "CogBench-ready" without needing CogBench running.

## When to Use

Same as v2.4.

## Architecture Overview (v2.5)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                       ORCHESTRATOR (You)                                     ║
║   v2.5 additions: handoff repair loop, calibration prior, factorial ablation ║
║                                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │   At every delegate_task:                                           │    ║
║   │     - Read default Phase Schedule                                   │    ║
║   │     - Overlay project_faculty_calibration.yaml (if exists)  ← NEW   │    ║
║   │     - Overlay Agent × Faculty matrix                                │    ║
║   │     - Resolve continuous intensity 0–1                       ← NEW  │    ║
║   │     - Round to nearest snippet bucket (5-level or 4-level)          │    ║
║   │     - Inject positive snippet + suppression snippet                 │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │   At every handoff:                                                  │    ║
║   │     - Log to faculty_flow.jsonl (v2.4)                              │    ║
║   │     - If WARN: faculty_dropped → consult handoff_repair.mode ← NEW   │    ║
║   │         mode = auto       → respawn consumer with dropped boosted   │    ║
║   │         mode = suggest    → ask user                                │    ║
║   │         mode = log_only   → behave as v2.4                          │    ║
║   │     - Bounded by repair budget (default 15% of total cost)          │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │   Phase 5e Alignment Scoreboard (v2.4 + extensions):                │    ║
║   │     - 8 v2.4 metrics                                                │    ║
║   │     - NEW metric #9: Topographic Locality (per faculty)             │    ║
║   │     - If cogbench_hook.endpoint set: also call CogBench   ← NEW     │    ║
║   │     - Persist run results for cross-run calibration                 │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │   Optional Ablation Mode:                                            │    ║
║   │     - single  (v2.4):     run × 2, vary one faculty                 │    ║
║   │     - factorial_2x2 (NEW): run × 4, vary two faculties              │    ║
║   │                            yields main(A), main(B), interaction(AB) │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## 1. Faculty Handoff Repair

In v2.4, when `faculty_flow.jsonl` flagged `WARN: faculty_dropped_at_handoff`, the orchestrator logged and moved on. The user had to manually inspect and rerun.

v2.5 closes the loop. When the WARN fires, the orchestrator can automatically:

1. Read which faculty was dropped (e.g., `social`).
2. Identify the consumer agent (e.g., `agent5_synthesis`).
3. Re-spawn that agent's most recent task with:
   - the dropped faculty's intensity boosted to `strong` (continuous 0.85);
   - explicit context noting "previous output dropped Social; surface it";
   - pointer to the upstream content that had the dropped faculty (e.g., A4's equity paragraphs).
4. Log the repair to `handoff_repair_log.jsonl`.

### Configuration

```yaml
handoff_repair:
  mode: auto                          # auto | suggest | log_only
  max_repairs_per_handoff: 1          # avoid loops if repair itself drops something
  repair_budget_fraction: 0.15        # repairs cost ≤ 15% of total budget
```

### Modes

| Mode | Behavior |
|------|----------|
| `auto` | Repair fires automatically when WARN detected. Default for production. |
| `suggest` | WARN logged + a one-line recommendation printed; user decides. |
| `log_only` | v2.4 behavior. Useful for first-time runs to see how often repair would fire. |

### Repair budget

Repairs cost money. If repairs would exceed `repair_budget_fraction × cost_budget_usd`, the orchestrator stops auto-repair and escalates to the user.

### Failure modes (Pitfall #31)

If the repair itself drops a different faculty (e.g., boosting Social caused Logic to weaken), the orchestrator does NOT recursively repair. `max_repairs_per_handoff` is bounded at 1. The second drop is logged for human review.

Schema: `examples/handoff_repair_example.md`.

## 2. Per-Project Faculty Calibration

The default Phase Schedule (v2.4 `faculty_phase_schedule.md`) is a population-level prior. But every research project has its own pattern — e.g., a project on **dementia trial design** consistently needs higher Social engagement at Phase 3 (subgroup equity for elderly cohorts) than the default schedule's `medium`.

v2.5 learns this. Each project gets a `project_id` (set at Phase 0). The orchestrator persists `project_faculty_calibration.yaml`:

```yaml
project_id: dementia_2026
calibration_runs_observed: 5
override_cells:
  phase_3.A3.social:
    default: medium
    learned: strong
    confidence: 0.84
    rationale: "Last 4 runs all triggered Faculty Handoff Repair to boost Social at A3 → A7. Promoting to default."
  phase_5d.A8.world:
    default: strong
    learned: strong
    confidence: 0.95
    rationale: "Consistent with default; no change."
```

### Update rule

After each run, the orchestrator reads `faculty_flow.jsonl` and `handoff_repair_log.jsonl`. For each (phase, agent, faculty) cell:

```
if repaired_to_strong in ≥ 2 of last 3 runs:
    promote learned to strong (confidence = 1 - 1/n)
elif suppression_helped per ablation Δ:
    demote learned to suppress
else:
    keep default
```

### Safety guards

- **min_runs_before_override: 3** — needs ≥3 historical runs before any override takes effect. Avoids one-off noise overriding the population prior.
- **Per-project, not cross-project** — dementia learned values don't leak into a stroke project. Calibration is scoped to `project_id`.
- **User can pin** — `pinned_cells:` field locks specific cells to their default, blocking learned overrides.

Schema: `examples/project_calibration_example.md`.

## 3. Multi-faculty Ablation (2×2 Factorial)

v2.4 ablated one faculty at a time. Useful but couldn't distinguish:
- "Social and World are each contributing independently" (additive)
- "Social and World are doing the same job; either alone is enough" (redundant)
- "Social only contributes when World is also active" (synergistic)

v2.5 adds a 2×2 factorial mode:

```yaml
faculty_ablation:
  enabled: true
  mode: factorial_2x2
  factorial_pair: [social, world]
```

### Procedure

4 paired runs:

| Run | Social | World | Outcome |
|-----|--------|-------|---------|
| R1  | on     | on    | output_full (baseline) |
| R2  | off    | on    | ablated_social |
| R3  | on     | off   | ablated_world |
| R4  | off    | off   | ablated_both |

Score each via Alignment Scoreboard, then compute:

```
Main effect Social    = (R1 - R2) averaged over World levels
                      = ((R1 - R2) + (R3 - R4)) / 2

Main effect World     = ((R1 - R3) + (R2 - R4)) / 2

Interaction Social×World
                      = (R1 - R2) - (R3 - R4)
                      = (R1 + R4) - (R2 + R3)
                       / 2
```

### Interpretation

| Pattern | Interaction sign | Meaning |
|---------|------------------|---------|
| Additive | ≈ 0 | Faculties independent; keep both |
| Synergistic | > 0 | Both needed; cannot drop either |
| Redundant | < 0 | Either alone suffices; can simplify |

### Cost

4× a normal run. Use sparingly. Recommended: once per project after ~10 production runs, to confirm faculty configuration is non-redundant.

Schema: `examples/multi_faculty_ablation_example.md`.

## 4. Continuous Faculty Intensity

v2.4 used 4 discrete buckets: `{suppress, light, medium, strong}` mapped to no continuous value. v2.5 makes intensity a continuous 0–1 scalar with a default 5-level snippet bucket map:

```yaml
intensity_buckets:
  suppress: 0.0
  light:    0.3
  medium:   0.6
  strong:   0.85
  max:      1.0
```

### Why bother?

- **Calibration math** (§2) needs continuous gradients to learn "Phase 3 Social should drift from 0.60 to 0.78."
- **Ablation Δ** (§3) computes differences cleanly when intensity is numeric.
- **Phase Schedule overrides** can be partial: user can boost `phase_4.A4.social` by +0.10 without flipping the whole bucket.

### Intensity → snippet selection

```python
def select_snippet(faculty: str, intensity: float, mode: str):
    if mode == "discrete_4":
        # v2.4 behavior
        if intensity < 0.15: return faculty_snippet[faculty]["suppress"]
        if intensity < 0.50: return faculty_snippet[faculty]["light"]
        if intensity < 0.80: return faculty_snippet[faculty]["medium"]
        return faculty_snippet[faculty]["strong"]
    elif mode == "discrete_5":
        # v2.5 default
        if intensity < 0.10: return faculty_snippet[faculty]["suppress"]
        if intensity < 0.20: return None  # "off" — no injection
        if intensity < 0.45: return faculty_snippet[faculty]["light"]
        if intensity < 0.75: return faculty_snippet[faculty]["medium"]
        if intensity < 0.95: return faculty_snippet[faculty]["strong"]
        return faculty_snippet[faculty]["max"]
    # "continuous" mode = same as discrete_5 for snippet selection;
    # continuous value preserved in logs for Calibration arithmetic.
```

### Backward compatibility

- `intensity_mode: discrete_4` reproduces v2.4 behavior exactly.
- `intensity_mode: discrete_5` is the v2.5 default.
- `intensity_mode: continuous` uses the same snippet-selection function but downstream tooling treats intensity as continuous.

Schema: `examples/continuous_intensity_example.md`.

## 5. Topographic Locality (Alignment Scoreboard metric #9)

Inspired by **Binhuraib et al. 2025**, *Topoformer: brain-like topographic organization in transformer language models through spatial querying and reweighting*. Topographic organization (functionally similar units cluster spatially) is a property of biological brains; this work begins exploring it in LMs.

Pipeline analog: a faculty that engages in spatially-distant phases is "non-local" — it fires at A1 (Phase 1), drops out for 3 phases, then fires at A8 (Phase 5d). A locally-organized faculty engagement is contiguous — fires at A4 + A4.5 + A5 + Judge B (Phase 4 cluster).

### Definition

For each faculty F, compute:

```
locality(F) = 1 - (number of phase-gaps inside F's engagement runs)
              / (max possible phase-gaps)
```

Worked: if F engages at phases {1, 4, 5a, 5d} but is silent at {2, 3}, that's 1 gap inside the run (the {1} → {4, 5a, 5d} discontinuity). Smaller gaps → higher locality → more brain-like organization.

### Why this matters

Faculties that engage in non-local patterns are usually a sign of:
- **Mis-scheduled steering** (Schedule has F=strong at A1 and at A8, but nothing in between makes sense).
- **Faculty fragmentation** (each phase asks for F independently rather than F being a coherent thread).

High locality is the alignment goal.

### Score

Added as metric #9 to the Alignment Scoreboard:

```
| 9 | Topographic Locality | per-faculty mean | ≥ 0.6 | ✓ |
```

Schema: `examples/topographic_locality_example.md`.

## 6. CogBench Integration Hook

v2.4 ships an 8-metric analog because real CogBench isn't directly runnable on document outputs. But the analog will eventually be improved by — or replaced with — actual CogBench evaluation as the benchmark API matures.

v2.5 adds the integration hook:

```yaml
cogbench_hook:
  endpoint: null                # not configured → use analog
  fallback_to_analog: true      # if real CogBench fails, fall back instead of halting
```

When `endpoint` is set to a runnable URL, Phase 5e calls it instead of (or in addition to) the analog. The result is appended to `alignment_scoreboard_results.md` as `cogbench_native_score: 0.xx`.

For now (v2.5), the hook is a no-op placeholder. It exists so that when the user does configure a CogBench endpoint, no skill change is needed — only the metadata.

## Updated Pipeline (v2.5)

Same phase structure as v2.4. Differences happen *inside* each phase:

- Phase Schedule lookup now consults `project_faculty_calibration.yaml` BEFORE the default schedule.
- Intensity values are continuous 0–1, mapped to snippet buckets at injection time.
- Every Monitor gate includes a Faculty Flow check; on WARN, Handoff Repair fires (if configured).
- Phase 5e Scoreboard computes 9 metrics (8 from v2.4 + Topographic Locality).

## Updated Output Files (v2.5)

```
<project-dir>/
├── (all v2.4 files)
├── project_faculty_calibration.yaml      # NEW — learned overrides
├── handoff_repair_log.jsonl              # NEW — every auto-repair
├── (if factorial ablation)
│   └── factorial_ablation_results.md     # NEW — 2×2 main effects + interaction
└── topographic_locality_per_faculty.json # NEW — input to scoreboard metric #9
```

## Quality Control Checklist (v2.5 additions)

(All v1.0 → v2.4 items still apply.)

- [ ] **(NEW) Repairs within budget:** total cost of auto-repairs ≤ `repair_budget_fraction × cost_budget_usd`.
- [ ] **(NEW) Repair didn't cascade:** no handoff was repaired more than once.
- [ ] **(NEW) Calibration applied if mature:** if `calibration_runs_observed ≥ 3`, the calibration override was used; logged.
- [ ] **(NEW) Calibration not auto-applied if immature:** if < 3 runs, only the default schedule was used.
- [ ] **(NEW) Factorial ablation produced interaction term** (if mode=factorial_2x2): the report has `interaction_estimate` numeric.
- [ ] **(NEW) Topographic Locality ≥ 0.6 per faculty:** if any faculty's locality < 0.6, the Schedule has discontinuities to investigate.
- [ ] **(NEW) CogBench hook configured or explicitly null:** no silent fallback path; either endpoint is set, or analog is the audited choice.

## Common Pitfalls (v2.5 additions)

(v1.0 → v2.4 items carry over.)

### 31. (NEW) Repair cascade
**Symptom:** A4 → A5 dropped Social → repair boosted Social → A5 → Judge dropped Logic → second repair → A5 → Judge dropped World → third repair…
**Fix:** `max_repairs_per_handoff: 1`. After the second drop, the orchestrator stops repairing and escalates with a Faculty Cascade Warning. Manual review needed.

### 32. (NEW) Calibration drifts away from population prior on small samples
**Symptom:** After 3 runs that happened to all involve elderly cohorts, calibration overrides `phase_3.A3.social` from medium to strong. Run 4 is on a pediatric cohort — but the override still fires.
**Fix:** Add a sub-domain tag to `project_id`. Calibration is per (project_id × sub_domain). Or pin sensitive cells with `pinned_cells:`.

### 33. (NEW) 2×2 ablation costs 4× and gives noisy interaction
**Symptom:** Interaction term is small relative to single-run variance.
**Fix:** Same as v2.4 Pitfall #28: needs ≥3 paired runs for stable estimates. So 2×2 with 3 replicates = 12 runs. Use only when the question is important.

### 34. (NEW) Continuous intensity becomes "false precision"
**Symptom:** User sees `intensity: 0.617` and thinks pipeline truly knows the difference between 0.617 and 0.620.
**Fix:** All snippet selection rounds to 5 buckets. The continuous value drives arithmetic, not snippet quality. Document this loudly in the project's run report.

### 35. (NEW) Topographic Locality penalizes legitimate "fresh introduction" patterns
**Symptom:** Equity is intentionally absent in Phase 1–2 (numerical work) and introduced fresh at Phase 4 (clinical). Locality metric flags this as fragmentation.
**Fix:** Locality has a "fresh introduction" allowance: the FIRST appearance of a faculty does not count as a gap-creating discontinuity. The penalty starts only at the SECOND-appearance gap. Defined in `topographic_locality_example.md`.

### 36. (NEW) CogBench hook is silently misconfigured
**Symptom:** `endpoint: ""` is treated as "use analog" without warning.
**Fix:** Only `endpoint: null` falls back silently. Empty string or malformed URL raises a configuration error at Phase 0.

## Verification Commands (v2.5 additions)

```bash
# How often did Handoff Repair fire this run?
wc -l <project-dir>/handoff_repair_log.jsonl

# Did calibration overrides actually apply?
grep -c "source: project_calibration" <project-dir>/faculty_steering_log.md

# Factorial ablation interaction
jq '.interaction_estimate' <project-dir>/factorial_ablation_results.md

# Topographic Locality per faculty
jq '.locality' <project-dir>/topographic_locality_per_faculty.json
```

## Related Skills

Same as v2.4.

---

## Changelog

### v2.5.0 (2026-06-06) — Self-correcting + Project-adaptive Faculty Layer

Four core upgrades that close the loop opened by v2.4's measurement-rich Cognitive Faculty Layer, plus two preparation hooks for future capability:

**Core:**
1. **Faculty Handoff Repair** — auto-respawn consumer agents on detected faculty death (`auto | suggest | log_only`).
2. **Per-Project Faculty Calibration** — past Flow logs train a project-specific override of the default Phase Schedule; min 3 runs before override.
3. **Multi-faculty Ablation (2×2 factorial)** — extends v2.4 single-faculty ablation to a pair with main effects + interaction; analog of MiCRo's joint-expert ablations.
4. **Continuous Faculty Intensity** — replaces 4 discrete buckets with 0–1 scalar; snippets still round to a 5-level bucket map for prompt selection.

**Preparation:**
5. **Topographic Locality** — added as Alignment Scoreboard metric #9. Inspired by Binhuraib et al. 2025 topographic LM work.
6. **CogBench Integration Hook** — placeholder so real CogBench can replace the analog with no skill change.

All upgrades opt-in or backward-compatible. Set `handoff_repair.mode=log_only` + `project_calibration.enabled=false` + `faculty_ablation.mode=single` + `intensity_mode=discrete_4` + `include_topographic_locality=false` + `cogbench_hook.endpoint=null` and you get v2.4 back.

### v2.4.0 — Schedule + Flow + Ablation + Suppression + Scoreboard

### v2.3.0 — Cognitive Faculty Layer + Reflector + Priming + Probes

### v2.2.0 — Adaptive Monitor + Memory + Ensemble + Self-consistency + Telemetry

### v2.1.0 — Router + ICL + Cost-aware + Tree Search

### v2.0.0 — Monitor + Judge + Refusal

### v1.0.0 — Six agents, four stages.

---

## Future Work (v2.6+ backlog)

- **Hierarchical calibration** — per-project AND per-sub-domain (project: dementia × sub: elderly_cohort).
- **Repair-and-explain** — when auto-repair fires, also generate a one-paragraph rationale for the user, not just a log entry.
- **Faculty intensity gradient learning** — when intensity is continuous, use gradient-style updates from Ablation Δ-tables to inch values rather than flip buckets.
- **Cross-project meta-calibration (privacy-preserving)** — learn population-level Schedule updates from anonymized Flow logs across projects, without leaking project content.
- **Reflector ensemble** — pair Agent 8 with a second Reflector tuned for adversarial reading; compare their findings.
- **Faculty-aware Router** — Router itself takes a faculty profile of the user's intent and routes accordingly (e.g., proposal-only intent often needs World strong from start).
