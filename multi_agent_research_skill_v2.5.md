---
name: multi-agent-research-pipeline
description: "Use when the user wants to execute a research project using a multi-agent architecture — from literature review and computational modeling to simulation, data analysis, clinical trial design, and paper/grant writing. v2.6 integrates Robin Architecture (Ghareeb et al. 2026, Nature) principles: (7) Crow/Falcon Literature Split for near-zero hallucination in retrieval-synthesis; (8) Finch Sandboxed Data Analysis Protocol with minimal tool surface (edit_cell + submit_answer) inside Docker; (9) BTL Tournament Ranking replacing absolute LLM scoring with pairwise comparison to eliminate positional bias; (10) Parallel Trajectories + Consensus Filter — N independent analysis runs with ≥50% agreement threshold; (11) ReAct Self-Healing Loop Protocol — error injection and retry loop for robust code generation. Builds on v2.5's self-correcting Cognitive Faculty Layer. Depends on: academic-paper-review, arxiv, execute_code, delegate_task."
version: 2.6.0
author: OWL + Kwota
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [research, multi-agent, pipeline, handoff-repair, project-calibration, factorial-ablation, continuous-intensity, topographic-locality, cogbench-hook, crow-falcon-split, finch-protocol, btl-tournament, parallel-trajectories, react-self-healing]
    related_skills: [academic-paper-review, arxiv, writing-plans, requesting-code-review]
    inspired_by:
      - "Webb, Mondal & Momennejad (2025). Nat Commun 16:8633. MAP architecture."
      - "Villa et al. (2025). Intell-Based Med 12:100274. Arkangel AI."
      - "Alkhamissi et al. (2026). ICLR. Mixture of Cognitive Reasoners (MiCRo). https://cognitive-reasoners.epfl.ch/"
      - "Binhuraib et al. (2025). Topoformer: brain-like topographic organization in transformer language models through spatial querying and reweighting. arXiv 2510.18745."
      - "Ghareeb et al. (2026). A multi-agent system for automating scientific discovery. Nature. Robin Architecture: Crow/Falcon/Finch agent decoupling + BTL tournament + Aviary/Jupyter sandbox."
  model_assignment:
    router:           haiku
    agent1_compute:   opus
    agent6a_crow:     haiku      # NEW v2.6 — broad parallel API retrieval (speed over depth)
    agent6b_falcon:   opus       # NEW v2.6 — deep synthesis from crow citation list ONLY
    agent6_lit:       haiku      # DEPRECATED alias; kept for v2.5 backward compatibility
    agent2_sim:       sonnet
    agent2_search:    haiku
    agent3_data:      sonnet
    agent4_clinical:  opus
    agent5_synthesis: opus
    agent7_monitor:   haiku
    agent8_reflector: opus
    judge_a:          opus
    judge_b:          opus
    btl_judge:        opus       # NEW v2.6 — pairwise comparison judge for BTL tournament
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
    # From v2.5
    intensity_mode: continuous          # discrete_4 | discrete_5 | continuous
    intensity_buckets:                  # used when mode=discrete_5
      suppress: 0.0
      light:    0.3
      medium:   0.6
      strong:   0.85
      max:      1.0
  handoff_repair:                       # From v2.5
    mode: auto                          # auto | suggest | log_only
    max_repairs_per_handoff: 1
    repair_budget_fraction: 0.15
  project_calibration:                  # From v2.5
    enabled: true
    project_id: <set_at_phase_0>
    calibration_file: project_faculty_calibration.yaml
    min_runs_before_override: 3
  faculty_ablation:
    enabled: false
    mode: single                        # single (v2.4) | factorial_2x2 (v2.5)
    ablate_one_of: [social, world]
    factorial_pair: [social, world]
    metric_for_delta: alignment_score
  alignment_scoreboard:
    enabled: true
    rubric_file: examples/alignment_scoreboard.md
    output_file: alignment_scoreboard_results.md
    include_topographic_locality: true  # From v2.5 — metric #9
  cogbench_hook:                        # From v2.5
    endpoint: null
    fallback_to_analog: true
  domain_priming:
    enabled: false
    cases_per_agent: 3
  stage2_routing:
    mode: top1
  cost_budget_usd: null
  router_memory_file: router_memory.jsonl
  cost_telemetry_file: cost_log.jsonl
  # ── Robin Architecture Upgrades (v2.6) ────────────────────────────────────
  crow_falcon_split:            # NEW v2.6 — Robin §1 Concept 1: decoupled retrieval/synthesis
    enabled: true
    crow_model: haiku           # speed: broad parallel API calls, outputs JSON citation library
    falcon_model: opus          # depth: structured synthesis from crow list ONLY
    max_crow_calls_per_phase: 45
    hallucination_guard: strict # falcon is FORBIDDEN from synthesizing from model weights;
                                # every claim must trace to a crow-retrieved citation
  finch_protocol:               # NEW v2.6 — Robin §3: sandboxed ReAct data analysis
    enabled: true
    sandbox: docker             # docker | none  (none = dev/test ONLY — never production)
    sandbox_image: research-env:v1.0   # pre-built env with domain libraries
    allowed_tools: [edit_cell, submit_answer]   # minimal surface; no unrestricted shell
    react_max_iterations: 12
    error_feedback: true        # on code error: inject error message → retry; never silent-fail
  btl_tournament:               # NEW v2.6 — Robin §1 Concept 3: BTL pairwise ranking
    enabled: true
    min_candidates: 3           # skip tournament if fewer than 3 candidates
    pairings_per_candidate: 4   # random pairings drawn per candidate
    model: opus
    phases: [phase_3_hypothesis, phase_4_clinical]
  parallel_trajectories:        # NEW v2.6 — Robin §3: Finch 8-trajectory consensus
    enabled: false              # opt-in; n_trajectories× cost multiplier
    n_trajectories: 8           # default from Robin paper; reduce to 3–4 for budget runs
    consensus_threshold: 0.5    # finding included only if ≥50% trajectories agree
    phases: [phase_3, phase_5c]
  react_loop:                   # NEW v2.6 — Robin §7: self-healing code generation loop
    max_iterations: 12          # matches finch_protocol.react_max_iterations
    error_feedback: true
    cascade_guard: true         # halt + escalate if 3 consecutive iterations produce identical error
---

# Multi-Agent Research Pipeline (v2.6)

Self-correcting, project-adaptive, and now hallucination-resistant. v2.5 made the Cognitive Faculty Layer self-correcting; v2.6 integrates the **Robin Architecture** (Ghareeb et al. 2026, *Nature*) to make literature retrieval verifiable and data analysis sandboxed.

> **v2.6 — What changed since v2.5**
> Five Robin Architecture upgrades:
>
> **Core (active by default):**
> 7. **Crow/Falcon Literature Split** — Split `agent6_lit` into `agent6a_crow` (broad API retrieval → JSON citation library) and `agent6b_falcon` (deep synthesis from verified citations only). Robin's ablation: removing this split raises hallucinated citations from ~0% to 44.5%. The most impactful anti-hallucination upgrade in the pipeline.
> 8. **Finch Sandboxed Data Analysis Protocol** — `agent3_data` now runs inside a Docker sandbox with only two exposed tools: `edit_cell` (write + execute code) and `submit_answer`. All code generation follows a ReAct loop. AI writes code to *analyze* data; it does not *read* data into its context window.
> 9. **BTL Tournament Ranking** — Replace absolute LLM scoring (1–10) with Bradley-Terry-Luce pairwise comparisons for hypothesis and candidate ranking at Phase 3 and Phase 4. Robin: pairwise comparison reduces positional bias and outperforms human expert consistency.
> 10. **Parallel Trajectories + Consensus Filter** — For Phase 3 and Phase 5c, optionally run N independent analysis trajectories and accept only findings with ≥50% agreement. Eliminates single-trajectory stochasticity. (opt-in; N× cost)
> 11. **ReAct Self-Healing Loop Protocol** — When agent-generated code raises an error, the error is automatically injected back as context and the agent retries, up to `max_iterations`. A `cascade_guard` halts the loop if 3 consecutive iterations yield the identical error (indicates a structural problem, not a fixable one).

## When to Use

Same as v2.5.

## Architecture Overview (v2.6)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                       ORCHESTRATOR (You)                                     ║
║   v2.5: handoff repair loop, calibration prior, factorial ablation           ║
║   v2.6: crow/falcon guard, finch sandbox routing, BTL judge, consensus       ║
║                                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │   LITERATURE LAYER (v2.6 Crow/Falcon Split)                         │    ║
║   │     Phase 1: agent6a_crow (haiku) ─ broad API retrieval             │    ║
║   │               ↓ outputs: citation_library.json (verified refs only)  │    ║
║   │     Phase 2: agent6b_falcon (opus) ─ synthesis FROM JSON ONLY       │    ║
║   │               hallucination_guard=strict: no weight-based claims    │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │   DATA ANALYSIS LAYER (v2.6 Finch Protocol)                         │    ║
║   │     agent3_data → Docker sandbox (research-env:v1.0)                │    ║
║   │     Tools exposed: edit_cell, submit_answer (ONLY)                  │    ║
║   │     Loop: Thought → Action(edit_cell) → Observation → ...           │    ║
║   │     On error: inject error → retry (max 12 iterations)              │    ║
║   │     cascade_guard: halt if same error × 3                           │    ║
║   │     [optional] 8× parallel trajectories → 50% consensus filter      │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │   RANKING LAYER (v2.6 BTL Tournament)                               │    ║
║   │     Phase 3 / Phase 4: N candidates → random pairings               │    ║
║   │     btl_judge (opus): "A vs B — which is stronger?" (pairwise only) │    ║
║   │     Bradley-Terry-Luce model → global ranking score                 │    ║
║   │     Replaces: "rate this candidate 1–10"                            │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │   FACULTY LAYER (v2.5, unchanged)                                   │    ║
║   │     Read Phase Schedule → overlay project_calibration.yaml          │    ║
║   │     Resolve continuous intensity 0–1 → round to snippet bucket      │    ║
║   │     Inject positive + suppression snippets                          │    ║
║   │     On handoff WARN: Handoff Repair (auto/suggest/log_only)         │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │   Phase 5e Alignment Scoreboard (9 metrics, from v2.5):             │    ║
║   │     metrics 1–8 (v2.4) + metric #9 Topographic Locality             │    ║
║   │     NEW v2.6 metric #10: Hallucination Rate (from crow/falcon log)  │    ║
║   │     If cogbench_hook.endpoint set: call CogBench                    │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 1. Faculty Handoff Repair *(from v2.5)*

In v2.4, when `faculty_flow.jsonl` flagged `WARN: faculty_dropped_at_handoff`, the orchestrator logged and moved on. v2.5 closes the loop.

When the WARN fires, the orchestrator can automatically:

1. Read which faculty was dropped (e.g., `social`).
2. Identify the consumer agent (e.g., `agent5_synthesis`).
3. Re-spawn that agent's most recent task with the dropped faculty boosted to `strong` (0.85), explicit context noting the drop, and a pointer to the upstream content.
4. Log the repair to `handoff_repair_log.jsonl`.

### Configuration

```yaml
handoff_repair:
  mode: auto                          # auto | suggest | log_only
  max_repairs_per_handoff: 1
  repair_budget_fraction: 0.15
```

| Mode | Behavior |
|------|----------|
| `auto` | Repair fires automatically. Default for production. |
| `suggest` | WARN logged + one-line recommendation; user decides. |
| `log_only` | v2.4 behavior. Good for first-time runs. |

Schema: `examples/handoff_repair_example.md`.

---

## 2. Per-Project Faculty Calibration *(from v2.5)*

The default Phase Schedule is a population-level prior. Every project has its own pattern. v2.5 learns this per `project_id` and writes `project_faculty_calibration.yaml`.

### Update rule

```
if repaired_to_strong in ≥ 2 of last 3 runs:
    promote learned to strong (confidence = 1 - 1/n)
elif suppression_helped per ablation Δ:
    demote learned to suppress
else:
    keep default
```

**Safety:** `min_runs_before_override: 3` — no override fires on fewer than 3 historical runs.

Schema: `examples/project_calibration_example.md`.

---

## 3. Multi-faculty Ablation (2×2 Factorial) *(from v2.5)*

v2.5 adds a 2×2 factorial ablation mode: 4 paired runs varying two faculties, yielding main effects AND interaction terms. Analog of MiCRo's joint-expert ablations.

```yaml
faculty_ablation:
  enabled: true
  mode: factorial_2x2
  factorial_pair: [social, world]
```

| Run | Faculty A | Faculty B | Outcome |
|-----|-----------|-----------|---------|
| R1  | on | on | baseline |
| R2  | off | on | ablated_A |
| R3  | on | off | ablated_B |
| R4  | off | off | ablated_both |

```
Interaction = (R1 + R4) - (R2 + R3) / 2
```

| Interaction | Meaning |
|-------------|---------|
| ≈ 0 | Additive — keep both |
| > 0 | Synergistic — cannot drop either |
| < 0 | Redundant — either alone suffices |

Schema: `examples/multi_faculty_ablation_example.md`.

---

## 4. Continuous Faculty Intensity *(from v2.5)*

Faculty intensity is a continuous 0–1 scalar. Default snippet selection rounds to a 5-level bucket map:

```yaml
intensity_buckets:
  suppress: 0.0
  light:    0.3
  medium:   0.6
  strong:   0.85
  max:      1.0
```

Backward compatibility: `intensity_mode: discrete_4` reproduces v2.4 exactly.

Schema: `examples/continuous_intensity_example.md`.

---

## 5. Topographic Locality (Alignment Scoreboard metric #9) *(from v2.5)*

Measures how spatially compact each faculty's engagement is across the pipeline. Inspired by Binhuraib et al. 2025.

```
locality(F) = 1 - (phase-gaps inside F's engagement runs) / (max possible gaps)
```

High locality (≥ 0.6 target) indicates coherent, non-fragmented faculty threading. The Alignment Scoreboard flags faculties below threshold for schedule review.

Schema: `examples/topographic_locality_example.md`.

---

## 6. CogBench Integration Hook *(from v2.5)*

Placeholder for real CogBench evaluation. When `cogbench_hook.endpoint` is set, Phase 5e calls it instead of (or alongside) the 8-metric analog.

```yaml
cogbench_hook:
  endpoint: null          # set to URL when CogBench API available
  fallback_to_analog: true
```

---

## 7. Crow/Falcon Literature Split *(NEW — Robin Architecture)*

### The Hallucination Problem

Robin's ablation experiment is the most important finding for any medical AI deployment: when a single LLM is asked to both retrieve and synthesize literature, hallucinated citations appear at **44.5%** of all claimed references. With the full Crow + Falcon two-layer architecture, hallucination rate drops to **~0%**.

**Iron rule: Never let an LLM directly recall medical literature from internal model weights.**

### Architecture

```
Phase 1 — Crow (agent6a_crow, haiku):
  Input:  disease/topic query
  Action: parallel API calls → PubMed, Semantic Scholar, internal knowledge base
  Output: citation_library.json
          { "id": "...", "title": "...", "authors": [...], "pmid": "...",
            "abstract": "...", "verified": true }

Phase 2 — Falcon (agent6b_falcon, opus):
  Input:  citation_library.json ONLY
  Action: deep synthesis → structured evidence report
  Constraint: hallucination_guard=strict
              — every claim MUST include a citation ID from the library
              — output format: { "claim": "...", "evidence_ids": ["id1", "id2"] }
  Output: evidence_report.json
```

### Hallucination Guard Protocol

When `hallucination_guard: strict`:

1. Orchestrator injects this rule into Falcon's system prompt: *"You may only make claims that are directly supported by entries in citation_library.json. For every factual statement, you must include at least one evidence_id from the library. Generating claims from your training weights without a supporting citation_id is a protocol violation."*
2. After Falcon's output, orchestrator runs a post-check: scan `evidence_report.json` for any claim with no `evidence_ids` → flag as hallucination → reject and respawn Falcon for that claim.
3. Log hallucination rate to `hallucination_rate_log.jsonl`.

### Configuration

```yaml
crow_falcon_split:
  enabled: true
  crow_model: haiku
  falcon_model: opus
  max_crow_calls_per_phase: 45
  hallucination_guard: strict   # strict | warn | off
```

| Guard level | Behavior |
|-------------|----------|
| `strict` | Claims without evidence_ids are rejected and trigger Falcon respawn. Production default. |
| `warn` | Claims without evidence_ids are logged but allowed through. Use for exploratory runs. |
| `off` | No post-check. Equivalent to v2.5 behavior. Use only for non-medical domains. |

### Cost Profile

Robin paper data: deep drug candidate analysis triggers ~75 Crow calls (45 per retrieval phase) and ~30 Falcon calls per project. Plan accordingly when setting `cost_budget_usd`.

Schema: `examples/crow_falcon_example.md`.

---

## 8. Finch Sandboxed Data Analysis Protocol *(NEW — Robin Architecture)*

### The Agentic Harness Paradigm

Traditional medical AI: paste patient data into LLM context → ask for interpretation. This fails on tabular, high-dimensional, or streaming clinical data.

**Robin's paradigm shift:** AI does not *read* data. AI *writes code* to analyze data. The code is executed in a deterministic sandboxed environment. Statistical rigor is restored to the algorithm (DESeq2, Kaplan-Meier, eGFR calculator); the LLM acts only as orchestrator/coder.

### Protocol

```
Raw Data (CSV / FCS / FASTQ)
  ↓
Docker Sandbox (research-env:v1.0)
  with: Python, R, pandas, DESeq2, scikit-survival, domain libraries
  ↓
agent3_data (Finch mode):
  ONLY tools available: edit_cell | submit_answer
  Loop (ReAct):
    Thought: "I need to calculate eGFR trend from column 'creatinine'..."
    Action: edit_cell("import pandas as pd\ndf = pd.read_csv('patient.csv')\n...")
    Observation: [execution output or error]
    → if error: inject error message, retry (max react_max_iterations)
    → if cascade (same error × 3): cascade_guard fires → escalate to human
    Thought: "Output looks correct. Submit."
    Action: submit_answer({ "finding": "...", "plot": "volcano.png" })
  ↓
JSON Clinical Insight + Visualization artifacts
```

### Tool Surface Restriction

Only two tools are exposed to `agent3_data` in Finch mode:

| Tool | Purpose |
|------|---------|
| `edit_cell` | Select a Jupyter cell, write code, execute it, return stdout/stderr |
| `submit_answer` | Finalize the analysis, return structured JSON insight |

No `bash`, no `read_file`, no unrestricted shell. If analysis requires reading a new file, the agent uses `edit_cell` to write a `pd.read_csv()` call.

### ReAct Self-Healing Integration

Finch Protocol and the ReAct Self-Healing Loop (§11) are co-designed:

```yaml
finch_protocol:
  react_max_iterations: 12     # syncs with react_loop.max_iterations
  error_feedback: true         # on error: inject → retry
```

When a `KeyError: 'creatinine'` appears in the Observation, Finch does not crash. The error is injected as context:

> *"Previous edit_cell raised: KeyError: 'creatinine'. The column may be named differently. Inspect `df.columns` first."*

The agent retries with a column inspection step.

### Configuration

```yaml
finch_protocol:
  enabled: true
  sandbox: docker               # docker | none
  sandbox_image: research-env:v1.0
  allowed_tools: [edit_cell, submit_answer]
  react_max_iterations: 12
  error_feedback: true
```

**NEVER set `sandbox: none` in production.** The `none` mode is for local development only. Clinical data analyzed outside a container can contaminate the host environment or leak to the orchestrator's context.

Schema: `examples/finch_protocol_example.md`.

---

## 9. BTL Tournament Ranking *(NEW — Robin Architecture)*

### The Positional Bias Problem

Absolute scoring ("Rate this drug candidate 1–10") introduces two systematic errors:
1. **Positional bias** — LLMs consistently score items higher when they appear early in the context.
2. **Scale inconsistency** — a "7" in one call cannot be compared to a "7" in another call made with a different candidate set.

Robin's solution: never ask for absolute scores. Instead, present pairs: *"Between candidate A and candidate B, which shows stronger evidence?"* Then use the Bradley-Terry-Luce (BTL) statistical model to compute a globally consistent ranking.

Robin paper: pairwise BTL ranking showed higher consistency than human expert ranking panels.

### Protocol

```
N candidates (hypotheses, drug candidates, treatment plans)
  ↓
Generate random pairings:
  pairings_per_candidate × N/2 pairings drawn without replacement
  ↓
btl_judge (opus) for each pair:
  Prompt: "Compare candidate A and candidate B.
           Which has stronger evidence? Respond: A | B | tie"
  Result: binary preference per pair
  ↓
Bradley-Terry-Luce model:
  P(A > B) = exp(β_A) / (exp(β_A) + exp(β_B))
  MLE solve for β_1...β_N from all pairwise outcomes
  → global ranking: β scores sort candidates
  ↓
Output: ranked_candidates.json
  { "rank": 1, "candidate": "Ripasudil", "btl_score": 2.34,
    "win_rate": 0.87, "evidence_ids": [...] }
```

### Where BTL Fires in the Pipeline

| Phase | Use case |
|-------|---------|
| `phase_3_hypothesis` | Rank 3–10 competing hypotheses before committing to experimental design |
| `phase_4_clinical` | Rank treatment arms, drug candidates, or trial designs |

### Configuration

```yaml
btl_tournament:
  enabled: true
  min_candidates: 3       # skip if fewer than 3; direct selection instead
  pairings_per_candidate: 4
  model: opus
  phases: [phase_3_hypothesis, phase_4_clinical]
```

**Cost note:** `pairings_per_candidate: 4` with 8 candidates = 16 pairwise comparisons = 16 btl_judge calls. Adjust `pairings_per_candidate` if cost budget is tight; minimum reliable is 3.

Schema: `examples/btl_tournament_example.md`.

---

## 10. Parallel Trajectories + Consensus Filter *(NEW — Robin Architecture)*

### The Stochasticity Problem

A single LLM trajectory is stochastic. Temperature > 0 means two runs on the same data can reach different conclusions. In clinical analysis, a finding that appears in only one of N possible runs should not be reported as a result.

Robin's Finch agent ran **8 independent analysis trajectories** on the same data, then accepted only findings present in **≥50% of trajectories** as consensus findings. This smooths stochasticity and approximates a statistical ensemble.

BixBench results: Finch's 22.8% accuracy (vs. 1.6% for base LLM) was measured in single-trajectory mode. Consensus across 8 trajectories further reduces false positives.

### Protocol

```
Input: same raw data + same analysis prompt
  ↓
Spawn N parallel agent3_data instances (Finch mode):
  Each trajectory: independent ReAct loop → JSON findings
  ↓
Consensus filter:
  For each finding (key: gene/marker/metric/claim):
    count = trajectories that identified this finding
    if count / N ≥ consensus_threshold: INCLUDE
    else: EXCLUDE
  ↓
Output: consensus_findings.json + trajectory_agreement_matrix.json
```

### Configuration

```yaml
parallel_trajectories:
  enabled: false              # opt-in; default OFF due to N× cost
  n_trajectories: 8           # Robin default; reduce to 3–4 for budget
  consensus_threshold: 0.5    # ≥50% agreement required
  phases: [phase_3, phase_5c]
```

### Cost / Benefit Guidance

| n_trajectories | Cost multiplier | Recommended for |
|----------------|-----------------|-----------------|
| 3 | 3× | Exploratory runs, budget-sensitive |
| 5 | 5× | Standard clinical analysis |
| 8 | 8× | High-stakes findings (pre-publication, regulatory) |

**Parallel Trajectories interacts with BTL Tournament:** If BTL is enabled and Parallel Trajectories is also enabled, the consensus filter runs first (reduces candidates), then BTL ranks the surviving consensus candidates.

Schema: `examples/parallel_trajectories_example.md`.

---

## 11. ReAct Self-Healing Loop Protocol *(NEW — Robin Architecture)*

### The Error Cascade Problem

Robin's BixBench evaluation found that multi-step bioinformatics pipelines achieved only **15.3% accuracy** (vs. 47.9% for single-step tasks). The primary cause: when step N fails (e.g., column name mismatch), all downstream steps N+1...M fail silently or with wrong inputs. The pipeline has no recovery mechanism.

The self-healing loop prevents error cascades by treating every code error as feedback, not termination.

### Protocol

```
Orchestrator calls agent3_data (or any code-generation agent):
  ↓
Agent generates code → edit_cell executes
  ↓
Case A — Success:
  Observation: [output data / stdout]
  → agent continues to next step or submit_answer
  ↓
Case B — Error (any exception / stderr):
  Observation: [error message]
  → Orchestrator injects: "The previous step raised: {error_message}.
     Inspect the issue and retry with corrected code."
  → Agent retries (iteration counter +1)
  ↓
Cascade Guard:
  If last 3 observations are identical errors:
    → Stop loop; emit: "CASCADE_GUARD_TRIGGERED: {error}. Manual review needed."
    → Log to react_cascade_log.jsonl
    → Escalate to human (identical error × 3 = structural problem, not a fixable typo)
  ↓
Max Iterations Guard:
  If iteration_counter ≥ react_max_iterations (12):
    → Stop loop; submit best partial result with flag "PARTIAL: max_iterations_reached"
```

### Configuration

```yaml
react_loop:
  max_iterations: 12
  error_feedback: true
  cascade_guard: true         # triggers at 3 consecutive identical errors
```

### Integration Points

ReAct Self-Healing is the default protocol for:
- `agent3_data` in Finch mode (§8)
- Any agent that generates executable code via `execute_code` tool
- Optionally: `agent1_compute` for simulation code in Phase 2

### Clinical Deployment Note

When deploying to clinical systems (e.g., hospital medication risk assessment), the ReAct loop must operate on **eGFR or biomarker values** through code execution, not through direct LLM reasoning. Example:

```
Anti-Pattern: "Patient creatinine is 2.1. Is eGFR concerning?" → LLM answers from weights
Correct:      edit_cell("import math; egfr = 141 * min(2.1/0.9, 1)**-0.411 * max(2.1/0.9, 1)**-1.209 * 0.993**65")
              → deterministic output: 28.3 mL/min/1.73m² (Stage 3b CKD)
```

Schema: `examples/react_selfhealing_example.md`.

---

## Updated Pipeline (v2.6)

Same phase structure as v2.5. Differences happen *inside* each phase:

**Additions at Phase 1 (Literature Review):**
- `agent6_lit` is now called as `agent6a_crow` for retrieval and `agent6b_falcon` for synthesis.
- Crow output (`citation_library.json`) is verified before Falcon begins.
- Hallucination guard post-check runs after Falcon output.

**Additions at Phase 3 (Data Analysis):**
- `agent3_data` enters Finch Protocol mode (Docker sandbox, minimal tool surface).
- ReAct Self-Healing Loop active.
- If `parallel_trajectories.enabled`: spawn N parallel trajectories → consensus filter → continue.

**Additions at Phase 3 / Phase 4 (Hypothesis / Clinical Ranking):**
- If `btl_tournament.enabled`: BTL pairwise ranking replaces direct LLM scoring.

**Phase 5e (Alignment Scoreboard) — metric #10 added:**
- Metric #10: Hallucination Rate (from `hallucination_rate_log.jsonl`)
- Target: ≤ 2% claimed statements without verified evidence_id (if crow_falcon enabled)

---

## Updated Output Files (v2.6)

```
<project-dir>/
├── (all v2.4–v2.5 files)
├── project_faculty_calibration.yaml        # v2.5
├── handoff_repair_log.jsonl                # v2.5
├── factorial_ablation_results.md           # v2.5 (if factorial ablation)
├── topographic_locality_per_faculty.json   # v2.5
├── citation_library.json                   # NEW v2.6 — Crow output
├── evidence_report.json                    # NEW v2.6 — Falcon output
├── hallucination_rate_log.jsonl            # NEW v2.6 — hallucination guard log
├── ranked_candidates.json                  # NEW v2.6 — BTL tournament output
├── consensus_findings.json                 # NEW v2.6 — parallel trajectory consensus
├── trajectory_agreement_matrix.json        # NEW v2.6 — per-finding trajectory votes
└── react_cascade_log.jsonl                 # NEW v2.6 — cascade guard triggers
```

---

## Quality Control Checklist (v2.6 additions)

*(All v2.0–v2.5 items still apply.)*

- [ ] **(NEW) Crow output verified:** `citation_library.json` exists and all entries have `"verified": true` before Falcon runs.
- [ ] **(NEW) Hallucination rate ≤ 2%:** `hallucination_rate_log.jsonl` shows ≤ 2% claims without evidence_ids (if `hallucination_guard: strict`).
- [ ] **(NEW) Finch sandbox active:** `finch_protocol.sandbox` is `docker` (not `none`) in any non-development run.
- [ ] **(NEW) Tool surface restricted:** `agent3_data` in Finch mode accessed only `edit_cell` and `submit_answer`.
- [ ] **(NEW) BTL tournament ran (if candidates ≥ 3):** `ranked_candidates.json` exists with `btl_score` for each candidate.
- [ ] **(NEW) No absolute scoring used:** No judge prompt contains "rate this 1–10" when BTL is enabled.
- [ ] **(NEW) Consensus filter applied (if parallel_trajectories enabled):** `consensus_findings.json` excludes any finding below `consensus_threshold`.
- [ ] **(NEW) ReAct cascade not triggered:** `react_cascade_log.jsonl` is empty or all entries are resolved.
- [ ] **(NEW) Max iterations not hit:** No `agent3_data` output contains flag `"PARTIAL: max_iterations_reached"` without human review.

---

## Common Pitfalls (v2.6 additions)

*(v2.0–v2.5 pitfalls 1–36 carry over.)*

### 37. (NEW) Skipping Crow and asking Falcon to retrieve directly
**Symptom:** User sets `crow_falcon_split.enabled: true` but asks Falcon to "search for relevant literature first, then synthesize." Falcon retrieves from weights → hallucination_guard fires on every claim.
**Fix:** Crow ALWAYS runs first. Falcon's system prompt must explicitly state it has no retrieval tools and may only synthesize from `citation_library.json`.

### 38. (NEW) `sandbox: none` slipping into production
**Symptom:** Finch protocol works in dev (no Docker installed on laptop), is deployed to production server with `sandbox: none` still in config. Agent-generated code runs on the host with full filesystem access.
**Fix:** Add a Phase 0 config validation check: if `finch_protocol.sandbox == "none"` AND `project_calibration.project_id != "dev"`, raise a configuration error and halt.

### 39. (NEW) BTL tournament with fewer than `min_candidates`
**Symptom:** Only 2 candidates; BTL tournament skipped per config; but orchestrator still calls `btl_judge` for a single pair. Produces a BTL score with no statistical meaning.
**Fix:** `min_candidates: 3` guard is hard: if fewer candidates exist, use direct single-model evaluation, NOT pairwise BTL. Log the skip reason.

### 40. (NEW) Parallel trajectories with consensus_threshold: 1.0
**Symptom:** User sets threshold to 1.0 ("I want unanimous agreement"). With 8 trajectories on noisy biomarker data, zero findings pass. Result: empty `consensus_findings.json`.
**Fix:** Max recommended threshold is 0.75 for high-stakes runs, 0.5 for standard. 1.0 requires all 8 trajectories to find the exact same key — nearly impossible with stochastic LLMs.

### 41. (NEW) ReAct cascade on a structural data problem
**Symptom:** The CSV file has a wrong column name. The cascade_guard fires after 3 identical `KeyError: 'gene_expression'` errors. Agent stops. But the actual fix is outside the sandbox — the CSV needs to be fixed.
**Fix:** When `cascade_guard` fires, the error message should include a diagnosis prompt: *"This error pattern suggests a data schema mismatch, not a code logic error. Please verify column names in the source CSV before retrying."* Add this to `react_cascade_log.jsonl`.

### 42. (NEW) Mixing absolute scoring into a BTL run
**Symptom:** BTL is enabled, but Phase 4 judge was given a legacy prompt: "Score each treatment option from 1–10." BTL scores and absolute scores exist in the same ranking → comparison is invalid.
**Fix:** When `btl_tournament.enabled: true`, all ranking prompts in `phases: [phase_3_hypothesis, phase_4_clinical]` must use the pairwise template ONLY. Add a prompt linting check at Phase 0: scan for "1-10", "score", "rate" in judge prompts → error if found.

---

## Verification Commands (v2.6 additions)

```bash
# Crow/Falcon hallucination rate
jq '[.[] | select(.evidence_ids | length == 0)] | length' <project-dir>/evidence_report.json

# Hallucination rate log summary
jq '{total_claims: .total, unverified: .unverified, rate: .hallucination_rate}' \
  <project-dir>/hallucination_rate_log.jsonl | tail -1

# BTL ranking top candidates
jq 'sort_by(.rank) | .[:5]' <project-dir>/ranked_candidates.json

# Consensus filter pass rate
jq '{total: (.included + .excluded), included: .included, threshold_used: .threshold}' \
  <project-dir>/consensus_findings.json

# ReAct cascade guard triggers
jq 'length' <project-dir>/react_cascade_log.jsonl

# Finch tool surface verification (ensure only edit_cell + submit_answer used)
grep -E '"tool_name"' <project-dir>/agent3_data_trace.jsonl | \
  jq -r '.tool_name' | sort | uniq -c

# Full v2.5 verifications still apply:
wc -l <project-dir>/handoff_repair_log.jsonl
grep -c "source: project_calibration" <project-dir>/faculty_steering_log.md
jq '.interaction_estimate' <project-dir>/factorial_ablation_results.md
jq '.locality' <project-dir>/topographic_locality_per_faculty.json
```

---

## Related Skills

Same as v2.5.

---

## Changelog

### v2.6.0 (2026-06-20) — Robin Architecture Integration

Five upgrades integrating the Robin multi-agent scientific discovery architecture (Ghareeb et al. 2026, *Nature*) into the pipeline. Core theme: **verifiable literature + sandboxed computation + statistical ranking**.

**Core:**
7. **Crow/Falcon Literature Split** — `agent6_lit` replaced by `agent6a_crow` (haiku, broad retrieval → `citation_library.json`) + `agent6b_falcon` (opus, synthesis from verified citations only). `hallucination_guard: strict` enforces zero weight-based claims. Robin ablation: hallucination rate 44.5% → ~0%.
8. **Finch Sandboxed Data Analysis Protocol** — `agent3_data` now operates inside Docker (`research-env:v1.0`) with only `edit_cell` + `submit_answer` tool access. AI writes code to analyze data; does not read data into context. ReAct loop with self-healing active.
9. **BTL Tournament Ranking** — Replaces absolute LLM scoring (1–10) with Bradley-Terry-Luce pairwise comparisons. `btl_judge` (opus) runs pairwise comparisons; BTL model computes global ranking. Reduces positional bias. Active at `phase_3_hypothesis` and `phase_4_clinical`.
10. **Parallel Trajectories + Consensus Filter** — Optionally spawn N parallel `agent3_data` instances; accept findings with ≥ `consensus_threshold` agreement. Default OFF (`enabled: false`) due to N× cost multiplier; activate for high-stakes clinical findings.
11. **ReAct Self-Healing Loop Protocol** — On code error: inject error message → retry (up to `max_iterations: 12`). `cascade_guard` halts on 3 consecutive identical errors and escalates to human. Eliminates error cascade in multi-step pipelines (Robin: 15.3% multi-step accuracy without self-healing).

**Alignment Scoreboard:** Metric #10 (Hallucination Rate) added. Target ≤ 2% claims without verified evidence_id.

**Backward compatibility:** All Robin upgrades are opt-out-able. Set `crow_falcon_split.enabled: false` + `finch_protocol.enabled: false` + `btl_tournament.enabled: false` + `parallel_trajectories.enabled: false` to reproduce v2.5 behavior exactly.

### v2.5.0 (2026-06-06) — Self-correcting + Project-adaptive Faculty Layer

Four core upgrades + two preparation hooks:
1. Faculty Handoff Repair — auto-respawn on faculty death.
2. Per-Project Faculty Calibration — learned schedule overrides per project_id.
3. Multi-faculty Ablation (2×2 factorial) — main effects + interaction term.
4. Continuous Faculty Intensity — 0–1 scalar with 5-bucket snippet map.
5. Topographic Locality — Alignment Scoreboard metric #9.
6. CogBench Integration Hook — placeholder for real CogBench endpoint.

### v2.4.0 — Schedule + Flow + Ablation + Suppression + Scoreboard

### v2.3.0 — Cognitive Faculty Layer + Reflector + Priming + Probes

### v2.2.0 — Adaptive Monitor + Memory + Ensemble + Self-consistency + Telemetry

### v2.1.0 — Router + ICL + Cost-aware + Tree Search

### v2.0.0 — Monitor + Judge + Refusal

### v1.0.0 — Six agents, four stages.

---

## Future Work (v2.7+ backlog)

- **Hierarchical calibration** — per-project AND per-sub-domain (project: dementia × sub: elderly_cohort).
- **Repair-and-explain** — when auto-repair fires, generate a one-paragraph rationale for the user, not just a log entry.
- **Faculty intensity gradient learning** — use gradient-style updates from Ablation Δ-tables to inch values rather than flip buckets.
- **Cross-project meta-calibration (privacy-preserving)** — learn population-level Schedule updates from anonymized Flow logs, without leaking project content.
- **Reflector ensemble** — pair Agent 8 with a second Reflector tuned for adversarial reading; compare their findings.
- **Faculty-aware Router** — Router takes a faculty profile of the user's intent and routes accordingly.
- **Robin Lab-in-the-loop gate** — formal human sign-off checkpoint with mandatory visualization artifacts (Volcano plot, JSON evidence list) before any clinical recommendation exits the pipeline. (Currently covered by Monitor agent; Robin formalizes this as a blocking gate, not just a warning.)
- **Crow multi-source weighting** — different retrieval sources (PubMed, Semantic Scholar, internal EHR) carry different confidence weights; Falcon synthesizes with source-weighted evidence.
- **Finch error pattern library** — maintain a per-project `error_pattern_library.json`; before spawning new Finch trajectories, inject known error patterns as "avoid these mistakes" context.
- **BTL cross-run stability** — run BTL tournament on 3+ independent judge sets; report Kendall's τ across rankings as a ranking stability metric.
