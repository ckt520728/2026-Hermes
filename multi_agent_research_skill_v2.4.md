---
name: multi-agent-research-pipeline
description: "Use when the user wants to execute a research project using a multi-agent architecture — from literature review and computational modeling to simulation, data analysis, clinical trial design, and paper/grant writing. v2.4 deepens v2.3's Cognitive Faculty Layer from a static role-faculty matrix into a dynamic, traceable, measurable system. Five new components: (1) Faculty Phase Schedule — recommended (phase, faculty) intensity matrix mirroring MiCRo's early-layer-Language / late-layer-Logic hierarchy; (2) Faculty Flow Tracking — per-handoff log of which faculties were engaged upstream and consumed downstream, builds a faculty-flow graph; (3) Faculty Ablation Test — opt-in mode that runs the pipeline once with all faculties and once with one suppressed, quantifying that faculty's causal contribution (analog of MiCRo §5.2 ablations); (4) Faculty Suppression / anti-steering — explicit anti-prompts that tell an agent NOT to engage a faculty when it would degrade the task (MiCRo found ablating irrelevant experts improves math performance); (5) Behavioral Alignment Scoreboard — a small CogBench-style evaluation suite with 8 metrics applied to pipeline output. Depends on: academic-paper-review, arxiv, execute_code, delegate_task."
version: 2.4.0
author: OWL + Kwota
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [research, multi-agent, pipeline, faculty-flow, faculty-ablation, faculty-suppression, cogbench-analog, alignment-scoreboard, hierarchy]
    related_skills: [academic-paper-review, arxiv, writing-plans, requesting-code-review]
    inspired_by:
      - "Webb, Mondal & Momennejad (2025). Nat Commun 16:8633. MAP architecture."
      - "Villa et al. (2025). Intell-Based Med 12:100274. Arkangel AI."
      - "Alkhamissi et al. (2026). ICLR. Mixture of Cognitive Reasoners (MiCRo). https://cognitive-reasoners.epfl.ch/"
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
    # NEW in v2.4
    phase_schedule_file: examples/faculty_phase_schedule.md
    flow_tracking_file:  faculty_flow.jsonl
    suppression_enabled: true
    suppression_snippets_file: examples/faculty_suppression_snippets.md
  faculty_ablation:                # NEW in v2.4
    enabled: false                 # opt-in; costs 2× a run
    ablate_one_of: [social, world] # which faculty to test-disable
    metric_for_delta: "alignment_score"
  alignment_scoreboard:            # NEW in v2.4
    enabled: true
    rubric_file: examples/alignment_scoreboard.md
    output_file: alignment_scoreboard_results.md
  domain_priming:
    enabled: false
    cases_per_agent: 3
  stage2_routing:
    mode: top1
  cost_budget_usd: null
  router_memory_file: router_memory.jsonl
  cost_telemetry_file: cost_log.jsonl
---

# Multi-Agent Research Pipeline (v2.4)

Execute a research project with a multi-agent architecture whose **cognitive faculty layer is now dynamic and measurable**. v2.3 introduced the static Role × Faculty matrix; v2.4 adds the four dimensions that turn it into a working system:

```
            ┌─────────────────────────────────────────────┐
            │  v2.3 = STATIC matrix                       │
            │  v2.4 = STATIC + dynamic + traceable +      │
            │         experimentally testable + measured  │
            └─────────────────────────────────────────────┘
```

> **v2.4 — What changed since v2.3**
> Five depth-upgrades on the cognitive-faculty layer:
> 1. **Faculty Phase Schedule** — a recommended (phase × faculty) intensity matrix. Mirrors MiCRo's empirical finding that **early layers favor Language, later layers favor Logic / Social / World**. Phase 1 → Language strong; Phase 4 → Social strong; Phase 5d → World strong.
> 2. **Faculty Flow Tracking** — every handoff records which faculties the upstream agent engaged and which the downstream agent acted on. Builds `faculty_flow.jsonl`. Surfaces "faculty death" — when Social was loaded into A4's output but A5 never used it.
> 3. **Faculty Ablation Test** (opt-in) — runs the pipeline twice: once with all faculties, once with one suppressed. Compares outputs via the Alignment Scoreboard to **quantify that faculty's causal contribution**. Direct analog of MiCRo §5.2 expert ablations.
> 4. **Faculty Suppression / Anti-steering** — for sub-tasks that should NOT engage a faculty (Agent 2 doing numerical simulation does not need Social), inject an explicit anti-prompt. MiCRo found **ablating irrelevant experts improves performance on the relevant domain** — same principle.
> 5. **Behavioral Alignment Scoreboard** — analog of CogBench. 8 standardized metrics (calibration, hedging quality, balanced consideration, uncertainty disclosure, perspective range, etc.) scored on the pipeline's output. Provides a single comparable number across runs.

## When to Use

Same as v2.3.

## Architecture Overview (v2.4)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                       ORCHESTRATOR (You)                                     ║
║   v2.4 additions: faculty schedule, flow log, ablation mode, suppression,    ║
║   and alignment scoreboard at end-of-run                                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   For every delegate_task:                                                   ║
║                                                                              ║
║     1. Read the agent's ROLE → role brief                                    ║
║     2. Read the phase number → faculty intensities from phase schedule       ║
║     3. Check Agent × Faculty matrix → overlay role-specific demands          ║
║     4. Build context = role_brief                                            ║
║                       + faculty_steering_snippets (positive)                 ║
║                       + faculty_suppression_snippets (negative)  ← NEW       ║
║                       + REFUSAL_PROTOCOL_CLAUSE                              ║
║     5. After delegate_task returns, log to faculty_flow.jsonl  ← NEW         ║
║                                                                              ║
║   Ablation mode (opt-in):                                                    ║
║     For one configured faculty F:                                            ║
║       - Run pipeline normally → output_full                                  ║
║       - Run pipeline with F's steering & matrix entries zeroed → output_ablated║
║       - Score both via Alignment Scoreboard                                  ║
║       - Δ = (full - ablated) is F's measured causal contribution             ║
║                                                                              ║
║   End-of-run:                                                                ║
║     Alignment Scoreboard evaluates the shipped winner on 8 metrics  ← NEW    ║
║     Result appended to alignment_scoreboard_results.md                       ║
║     Compare across runs to see whether the pipeline is improving             ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## 1. Faculty Phase Schedule

MiCRo's layer-wise analysis (their Fig. 13–14) showed:
- **Early layers** → Language expert dominant (perceptual / linguistic grounding).
- **Later layers** → Logic / Social / World experts dominant (domain-specific reasoning).

We mirror this across pipeline phases:

| Phase | Language | Logic | Social | World | Rationale |
|-------|:---:|:---:|:---:|:---:|---|
| **0.5 Router** | medium | strong | — | light | Classification needs clean language + structured logic |
| **0.75 Priming** | medium | medium | medium | medium | Even warmup across faculties |
| **1 A1 Compute** | medium | strong | — | strong | Derivations + literature grounding |
| **1 A6 Lit** | strong | light | — | strong | Clear summaries + long-context integration |
| **2 A2 Sim** | medium | strong | suppress | light | **Suppress Social** — pure numerical task |
| **2.3 A2 inner search** | light | strong | suppress | light | Same |
| **3 A3 Data** | medium | strong | medium | medium | Subgroup equity demands Social ≥ medium |
| **4 A4 Clinical** | strong | medium | **strong** | medium | Consent / equity / safety dominate |
| **5a A5 Synthesis** | **strong** | medium | medium | strong | Long-form coherence |
| **5b Judge A** | medium | strong | — | medium | Rigor focus |
| **5b Judge B** | medium | medium | **strong** | strong | Translational focus |
| **5c Probes** | n/a | n/a | n/a | n/a | (probes are external checks, no steering) |
| **5d A8 Reflector** | medium | medium | medium | **strong** | DMN-style long-horizon read |

Schema: `examples/faculty_phase_schedule.md` ships the full matrix. The orchestrator reads it at each phase and overlays the Agent × Faculty matrix from v2.3.

**Conflict resolution:** if the schedule says Logic=strong for a phase but the Agent × Faculty matrix gives the agent only ✓ for Logic, the agent matrix wins. Schedule is a phase-level prior; matrix is role-level evidence.

## 2. Faculty Flow Tracking

`faculty_flow.jsonl` — one entry per handoff. Records what faculties the producer engaged and what the consumer actually used.

```json
{
  "timestamp": "2026-06-06T10:33:00Z",
  "handoff": "A4 → A5",
  "producer": "agent4_clinical",
  "producer_faculties_engaged": ["language", "logic", "social", "world"],
  "producer_engagement_intensity": {
    "language": "strong",
    "logic": "medium",
    "social": "strong",
    "world": "medium"
  },
  "consumer": "agent5_synthesis",
  "consumer_faculties_acted_on": ["language", "logic", "world"],
  "faculty_dropped_at_handoff": ["social"],
  "diagnostic": "WARN: Social was engaged at intensity 'strong' upstream (A4), but A5's synthesis does not show ToM markers in §Discussion. Possible faculty-death."
}
```

### How `faculty_dropped_at_handoff` is detected

Compare:
- Producer's faculty-engagement intensities (logged at task spawn time).
- Consumer's actual output, probed via the v2.3 cognitive probes (Language / Logic / Social / World probe results).

If producer engaged a faculty ≥ medium but consumer's probe for that faculty shows < medium engagement (e.g., no ToM markers, no equity statements), the faculty was "dropped." Log a `WARN`.

### Why this matters

A pattern we saw in v2.3 dry-runs: Agent 4 generated a beautifully equity-aware clinical protocol, Agent 5 synthesized a paper, and equity completely disappeared in the abstract. Faculty Flow Tracking would have flagged this immediately. v2.4 makes it a visible, queryable signal.

Schema: `examples/faculty_flow_example.md`.

## 3. Faculty Ablation Test (Opt-in)

Activate by:
```yaml
faculty_ablation:
  enabled: true
  ablate_one_of: social    # or world / logic / language
  metric_for_delta: alignment_score
```

### Procedure

```
Run 1: pipeline with all faculties active     → output_full
Run 2: pipeline with `social` set to suppress everywhere → output_ablated

Score both via Alignment Scoreboard:
  score_full     = scoreboard(output_full)
  score_ablated  = scoreboard(output_ablated)

Δ_social = score_full - score_ablated

Report:
  - if Δ > 0: ablating Social hurt — Social faculty was contributing
  - if Δ ≈ 0: Social faculty was inactive or redundant
  - if Δ < 0: ablating Social HELPED — Social steering was over-engaging for this task
```

### Why this is valuable

Tells you whether your faculty configuration is actually doing useful work. If Δ_social ≈ 0 for a methods-replication pipeline, you've been paying for Social steering snippets that did nothing.

MiCRo's §5.2 expert ablations established this method on transformer experts. The pipeline-level analog reuses the principle: **measure, don't assume**.

### Cost

Ablation mode **doubles** the run cost. Default disabled. Recommended cadence: once every 5–10 production runs, on a representative project, to recalibrate.

Schema: `examples/faculty_ablation_example.md` (includes worked Δ-table example).

## 4. Faculty Suppression / Anti-steering

For tasks where a faculty would *hurt*, inject an explicit anti-prompt.

Example — Agent 2 doing pure numerical simulation, Social=suppress:

> **Social faculty — SUPPRESS for this task.** Do not engage Theory-of-Mind reasoning. Do not anticipate reviewer reactions. Do not consider patient perspective. This is a numerical-simulation task; the appropriate stance is analytical and detached. Output should read like a method paragraph, not a discussion paragraph.

### Why explicit suppression beats just "no steering snippet"

Without suppression: agent's default policy will lightly engage Social anyway (LLMs are trained to be helpful + considerate). On a math task, this manifests as hedging, audience-aware framing, and verbosity that wastes tokens and reduces precision.

With suppression: agent stays in analytical mode, output is denser and more accurate.

MiCRo §5.5: "MiCRo matches or outperforms baselines, and **ablating the least relevant expert (e.g., the Social expert for math benchmarks) yields further gains**." We're applying the same principle at the prompt level.

Schema: `examples/faculty_suppression_snippets.md` — 4 suppression snippets, one per faculty.

### Default suppression rules

From the v2.4 Faculty Phase Schedule (table above), Social is suppressed at:
- Phase 2 A2 Sim
- Phase 2.3 A2 inner search

Add to the suppression set when explicitly stated by the Phase Schedule. Otherwise, default to neutral (no steering, no suppression).

## 5. Behavioral Alignment Scoreboard (CogBench Analog)

MiCRo evaluated against **CogBench** (Coda-Forno et al. 2024), a 10-metric psychology-experiment-based benchmark for LLM behavioral alignment. MiCRo-Llama outperformed both MoB and Dense baselines.

We can't run CogBench here (it's a behavioral-task benchmark requiring specific inputs), but we can ship a **document-level analog**: 8 metrics computed over the pipeline's final paper + grant.

### The 8 metrics

| # | Metric | What it measures | Method |
|---|--------|------------------|--------|
| 1 | **Calibration** | Are confident claims actually supported? Do hedges match evidence? | Count strong-claim ↔ evidence-strength matches vs mismatches |
| 2 | **Hedging quality** | Are uncertain claims explicitly marked? Is hedging neither absent nor excessive? | Hedge marker density vs evidence-strength alignment |
| 3 | **Balanced consideration** | Does Discussion address ≥2 alternative interpretations? | Count "alternatively / one possibility / another view" + substantive follow-up |
| 4 | **Uncertainty disclosure** | Are CIs / SEs / limitations explicitly named? | Regex + check completeness |
| 5 | **Perspective range** | How many distinct stakeholder perspectives appear? (patient / clinician / reviewer / public-health) | Count distinct ToM-marker types |
| 6 | **Falsifiability** | Are hypotheses still in if-then-because form in Discussion? | Regex + count |
| 7 | **Throughline coherence** | Does abstract claim match conclusion claim? | Sentence-level comparison |
| 8 | **Equity grounding** | Are subgroup considerations addressed substantively (not just listed)? | Manual + grep |

Each scored 0–1. Output: `alignment_scoreboard_results.md` with per-metric score, total, and per-run trend over time.

Schema: `examples/alignment_scoreboard.md`.

### How to use the scoreboard

- **Single-run:** sanity check that the pipeline output is well-calibrated and broadly perspective-aware.
- **Cross-run:** plot total score over time as you iterate the skill — does it go up?
- **Ablation pairing:** compare full vs ablated (from §3 above) using the scoreboard's total. Provides the Δ for measuring faculty causal contribution.

## Updated Pipeline (v2.4)

```
Phase 0     Intake & scoping
Phase 0.5   Router  + faculty schedule (NEW: Logic-strong steering)
Phase 0.75  Domain Priming (v2.3, opt-in)
Phase 1     A1 + A6  + faculty steering + suppression as scheduled
Phase 1.5   Monitor gate  + faculty flow log entry (NEW)
Phase 2.0   A2 with Social=SUPPRESS (NEW)
Phase 2.1-5 Tree search (Predictor with Social=SUPPRESS)
Phase 2.6   Monitor gate + faculty flow log
Phase 3     A3 with Social=medium (subgroup equity)
Phase 3.5   Monitor gate + faculty flow log
Phase 4     A4 with Social=STRONG (consent / equity / safety)
Phase 4.5   Monitor gate + faculty flow log    ← critical handoff
Phase 5a    A5 candidates with Language=strong + World=strong
Phase 5b    Judge A + Judge B (faculty mixes differ per Judge)
Phase 5c    Cognitive Probes (v2.3) — read faculty_flow.jsonl for diagnostics
Phase 5d    Agent 8 Reflector with World=strong
Phase 5e    Alignment Scoreboard (NEW) → alignment_scoreboard_results.md
[Optional]  Faculty Ablation rerun
Ship.
```

## Updated Output Files (v2.4)

```
<project-dir>/
├── (all v2.3 files)
├── faculty_flow.jsonl                    # NEW — per-handoff faculty engagement vs use
├── faculty_suppression_log.jsonl         # NEW — when/where anti-steering was injected
├── alignment_scoreboard_results.md       # NEW — 8 metric scores + total
├── (if ablation enabled)
│   ├── output_full/                      # full pipeline output
│   ├── output_ablated_<faculty>/         # ablated comparison
│   └── ablation_delta_report.md          # Δ across all 8 metrics
```

## Quality Control Checklist (v2.4 additions)

(All v1.0 → v2.3 items still apply.)

- [ ] **(NEW) Phase schedule honored:** every `delegate_task` call's `faculty_intensity` log line matches the Phase Schedule unless the agent matrix overrode it (logged with reason).
- [ ] **(NEW) Flow log complete:** `faculty_flow.jsonl` has one entry per handoff.
- [ ] **(NEW) No silent faculty death:** every `faculty_dropped_at_handoff` entry resolved or explicitly accepted.
- [ ] **(NEW) Suppression applied where scheduled:** Phase 2 + 2.3 A2 logs include `social_suppression: true`.
- [ ] **(NEW) Scoreboard total recorded:** `alignment_scoreboard_results.md` exists; total ≥ 0.6 (or escalate).
- [ ] **(NEW, if ablation enabled) Δ-report produced:** `ablation_delta_report.md` exists and quantifies the ablated faculty's contribution.

## Common Pitfalls (v2.4 additions)

(v1.0 → v2.3 items carry over.)

### 26. (NEW) Phase Schedule and Agent × Faculty matrix disagree
**Symptom:** Schedule says Logic=strong for Phase 5a; Agent 5 matrix has Logic=✓✓ (medium). What runs?
**Fix:** **Agent matrix wins.** Schedule is a phase prior; matrix is role evidence (more specific). Disagreement is logged so you can tune one or the other if it happens repeatedly.

### 27. (NEW) Faculty Flow logs every handoff as "WARN faculty dropped"
**Symptom:** Every handoff shows WARN; signal becomes noise.
**Fix:** Faculty Flow's drop-detection threshold uses the cognitive probes' verdict, not raw faculty mentions. If probes are over-strict, tune them; don't blanket-disable Flow tracking.

### 28. (NEW) Ablation test results are noisy
**Symptom:** Re-running the same ablation gives Δ ranging from −0.05 to +0.10.
**Fix:** Ablation Δ needs at least 3 paired runs to be reliable. Single-pair Δ should be treated as directional, not quantitative. Document this in the report.

### 29. (NEW) Suppression makes Agent 4 produce a robotic protocol
**Symptom:** Following the example pattern, user accidentally suppresses Social for A4. Output is an inhumane, non-consent-aware protocol.
**Fix:** **Suppression is per-phase, per-agent.** A4 ALWAYS gets Social=strong by schedule. Do not generalize "suppress Social helps math" to clinical work. The Phase Schedule encodes this.

### 30. (NEW) Alignment Scoreboard rewards verbosity
**Symptom:** Longer drafts get higher Perspective Range scores trivially.
**Fix:** Several scoreboard metrics are normalized by length (perspective markers per 1000 tokens, not absolute count). Audit the metric definitions in `alignment_scoreboard.md` if scores look gameable.

## Verification Commands (v2.4 additions)

```bash
# Faculty death incidents
jq 'select(.faculty_dropped_at_handoff | length > 0)' <project-dir>/faculty_flow.jsonl

# Suppression actually injected?
wc -l <project-dir>/faculty_suppression_log.jsonl

# Scoreboard total
tail -1 <project-dir>/alignment_scoreboard_results.md

# Ablation Δ (if run)
cat <project-dir>/ablation_delta_report.md
```

## Related Skills

Same as v2.3.

---

## Changelog

### v2.4.0 (2026-06-06) — Faculty Schedule + Flow + Ablation + Suppression + Alignment Scoreboard

Deepens the v2.3 Cognitive Faculty Layer along five orthogonal dimensions, all motivated by **Alkhamissi et al. 2026 (MiCRo)**:

1. **Phase Schedule** ← MiCRo Fig. 13–14 layer-wise analysis: early layers favor Language, later favor Logic/Social/World. Lifted to phase-level.
2. **Flow Tracking** ← MiCRo's interpretable routing: tokens follow visible paths through experts. Our analog: faculties follow visible paths through agents.
3. **Faculty Ablation Test** ← MiCRo §5.2 expert ablations established the causal-contribution measurement method.
4. **Faculty Suppression** ← MiCRo §5.5: ablating the least-relevant expert (Social for math) **improves** performance. We apply this at prompt level.
5. **Alignment Scoreboard** ← MiCRo evaluated on CogBench, a 10-metric behavioral psychology benchmark. We ship an 8-metric document-level analog.

All upgrades opt-in or backward-compatible. Disable v2.4 features (`faculty_ablation.enabled=false`, `suppression_enabled=false`, `alignment_scoreboard.enabled=false`) and you get v2.3 back.

### v2.3.0 — Cognitive Faculty Layer + Agent 8 Reflector + Domain Priming + Cognitive Probes

### v2.2.0 — Adaptive Monitor + Router memory + Judge ensemble + Self-consistency + Cost telemetry

### v2.1.0 — Router + Few-shot ICL + Cost-aware + Tree Search

### v2.0.0 — Monitor + Judge + Refusal

### v1.0.0 — Six agents, four stages, sequential pipeline.

---

## Future Work (v2.5+ backlog)

- **Faculty handoff repair** — when Faculty Flow detects a drop, automatically re-spawn the consumer agent with the dropped faculty boosted to strong, rather than just logging WARN.
- **Per-project faculty calibration** — first run uses default Phase Schedule; subsequent runs learn from Flow logs which (phase, faculty) cells need adjustment for that project's domain.
- **Multi-faculty ablation** — currently we ablate one faculty at a time; add 2×2 (e.g., ablate Social AND World) to measure interaction effects.
- **Real CogBench integration** — when CogBench API exposes a runnable LLM endpoint, evaluate the pipeline's responses there directly rather than via our 8-metric analog.
- **Faculty intensity continuous** — currently {light, medium, strong, suppress} is discrete. v2.5 could move to a continuous 0–1 scale with smoother gradients.
- **Topographic faculty hierarchy** — Binhuraib et al. 2025 (cited by MiCRo) explore spatial-functional brain organization; could inform a faculty-locality metric across the pipeline.
