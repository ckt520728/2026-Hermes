---
name: multi-agent-research-pipeline
description: "Use when the user wants to execute a full or partial research project using a multi-agent architecture — from literature review and computational modeling to simulation, data analysis, clinical trial design, and paper/grant writing. v2.1 builds on v2.0 (Monitor + Judge + Refusal) by adding four agent-optimization upgrades: (1) Query Router (Phase 0.5) that auto-selects a sub-pipeline based on task type, avoiding the all-or-nothing 4-stage flow; (2) per-agent few-shot ICL exemplars in examples/ directory, inspired by MAP's ≤3 in-context examples per module; (3) cost-aware model assignment promoted to a first-class config field; (4) Stage 2 internal Tree Search (B=3 parameter branches scored by Predictor + Evaluator before commit). Orchestrates up to 7 specialized sub-agents + 1 Judge. Depends on: academic-paper-review, arxiv, execute_code, delegate_task."
version: 2.1.0
author: OWL + Kwota
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [research, multi-agent, pipeline, computational-neuroscience, clinical-trial, paper-writing, grant-writing, orchestration, monitor, judge, refusal, router, tree-search, icl, cost-aware]
    related_skills: [academic-paper-review, arxiv, writing-plans, requesting-code-review]
    inspired_by:
      - "Webb, Mondal & Momennejad (2025). A brain-inspired agentic architecture to improve planning with LLMs. Nature Communications 16:8633. https://doi.org/10.1038/s41467-025-63804-5"
      - "Villa et al. (2025). Arkangel AI: A conversational agent for real-time, evidence-based medical question-answering. Intelligence-Based Medicine 12:100274. https://doi.org/10.1016/j.ibmed.2025.100274"
  model_assignment:
    # First-class cost-aware mapping. Orchestrator MUST honor unless user overrides.
    router:           haiku   # cheap classification
    agent1_compute:   opus    # heavy reasoning
    agent6_lit:       haiku   # bulk retrieval / summarization
    agent2_sim:       sonnet  # code + numerical reasoning
    agent2_search:    haiku   # inner tree-search branches (cheap, parallel)
    agent3_data:      sonnet  # analysis design
    agent4_clinical:  opus    # high-stakes protocol drafting
    agent5_synthesis: opus    # long-form writing
    agent7_monitor:   haiku   # rule-based checking
    judge:            opus    # long chain-of-thought selection
    # Estimated cost ratio vs all-opus baseline: ~0.40 (60% saving)
---

# Multi-Agent Research Pipeline (v2.1)

Execute a research project from idea to publication using a coordinated multi-agent architecture inspired by both lab-PI delegation and prefrontal-cortex-style modular cognition. v2.1 adds **routing, exemplars, cost control, and internal search** on top of v2.0's Monitor + Judge + Refusal foundation.

> **v2.1 — What changed since v2.0**
> Four agent-optimization upgrades:
> 1. **Phase 0.5 Query Router** — classifies user request into one of five sub-pipelines so we don't force a clinical-only or literature-only task through the full 4-stage flow.
> 2. **Per-agent few-shot ICL examples** — every agent's context is now seeded with 1–3 mini exemplars from `examples/`. Webb et al. (2025) achieved their planning gains with ≤3 in-context examples per module.
> 3. **Cost-aware model assignment as first-class field** — promoted from a recommendation table into `metadata.model_assignment` in the frontmatter, so the orchestrator must honor it unless the user overrides.
> 4. **Stage 2 internal Tree Search** — Agent 2 now samples B=3 parameter branches near A1's central spec, gates each via Monitor, scores via a lightweight Predictor + Evaluator, and only commits the winning branch downstream. Directly inspired by the MAP Search loop.

## When to Use

- User has a research idea or fragment thereof — full computational + clinical, or only one piece
- User explicitly wants to spawn a multi-agent pipeline (5+ distinct expert roles)
- User wants both paper and grant from the same evidence base
- User wants verifiable reasoning trail (Monitor logs + Judge rationale + Refusal log)

**Don't use for:** trivial single-step asks, exploratory chat, or when the user wants hands-on control of each step (use `writing-plans` instead).

## Architecture Overview (v2.1)

```
╔════════════════════════════════════════════════════════════════════════╗
║                       ORCHESTRATOR (You)                               ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║                     ┌─────────────────────────┐                        ║
║   User intent ────▶│ Phase 0.5  Router (NEW)  │── selects sub-pipeline ║
║                     └────────────┬────────────┘                        ║
║                                  │                                     ║
║   ┌──────────────────────────────┼───────────────────────────────┐    ║
║   │  Sub-pipeline pool (5 modes):                                │    ║
║   │   • full          → A1+A6 → A2 → A3 → A4 → A5+Judge         │    ║
║   │   • clinical_only → A6 → A3 → A4 → A5+Judge                  │    ║
║   │   • literature    → A6 → A5+Judge                            │    ║
║   │   • methods_rep   → A1 → A2 → A5+Judge                       │    ║
║   │   • proposal      → A1+A6 → A5+Judge (Specific Aims only)    │    ║
║   └──────────────────────────────┬───────────────────────────────┘    ║
║                                  ▼                                     ║
║   (Every handoff still gated by Agent 7 Monitor; v2.0 carried over)    ║
║                                                                        ║
║   Stage 2 detail (NEW internal tree search):                           ║
║                                                                        ║
║     Agent 1 central params ──▶ Actor: sample B=3 branches              ║
║                                       │                                ║
║                                       ▼                                ║
║                              Monitor filters implausible               ║
║                                       │                                ║
║                                       ▼                                ║
║                       Predictor (coarse sim) → Evaluator score         ║
║                                       │                                ║
║                                       ▼                                ║
║                              Commit highest-score branch → A3          ║
║                                                                        ║
║   Final stage unchanged from v2.0:                                     ║
║     A5 produces 2–3 candidates ──▶ Judge selects + critiques           ║
║                                                                        ║
║   Every agent: INSUFFICIENT_EVIDENCE refusal protocol still mandatory  ║
╚════════════════════════════════════════════════════════════════════════╝
```

### Agent Roster (cost-aware)

| Agent | Role | Model (default) | Why this tier |
|-------|------|------------------|---------------|
| **Router** | Intent classifier (NEW) | Haiku | Cheap, single-prompt classification |
| **Agent 1** | Computational Neuroscientist | Opus | Heavy multi-step model derivation |
| **Agent 6** | Literature Gatekeeper | Haiku | High-volume retrieval + summarization |
| **Agent 2** | Simulation Expert | Sonnet | Code + numerical reasoning |
| **Agent 2 inner search** | A2's B=3 branches (NEW) | Haiku × B | Parallel cheap rollouts |
| **Agent 3** | Data Analyst | Sonnet | Analysis design |
| **Agent 4** | Clinical Researcher | Opus | High-stakes, regulated text |
| **Agent 5** | Synthesis Writer | Opus | Long-form, narrative coherence |
| **Agent 7** | Monitor / Validator | Haiku | Rule-based, no creativity needed |
| **Judge** | Selector + Critic | Opus (long CoT) | Reads multiple drafts, deliberates |

The above is mirrored in `metadata.model_assignment` in the frontmatter. **The orchestrator must read that field and pass the model name in each `delegate_task` call.** If the user overrides, the override wins.

## Phase 0.5 — Query Router (NEW)

After Phase 0 intake but before spawning the heavy agents, the Router classifies the user's request and selects a sub-pipeline.

```
delegate_task(
  goal=(
    "Router — classify the user's request into exactly one of: "
    "full | clinical_only | literature | methods_rep | proposal. "
    "Output JSON: {\"pipeline\": <one>, \"rationale\": <one sentence>, "
    "\"confidence\": <0-1>, \"missing_to_upgrade\": <list of what would unlock a richer pipeline>}."
  ),
  context=(
    "User intent: <Phase 0 intake summary>\n\n"
    "Decision rules (verbatim):\n"
    "- 'full' if the request mentions BOTH (modeling/simulation) AND (clinical/trial/patients)\n"
    "- 'clinical_only' if only retrospective + prospective work, no modeling required\n"
    "- 'literature' if the user just wants a structured review or methods comparison\n"
    "- 'methods_rep' if reproducing a published model/simulation without clinical translation\n"
    "- 'proposal' if the user only needs Specific Aims / a 1-page concept\n\n"
    "Few-shot exemplars: see examples/router_examples.md\n\n"
    + REFUSAL_PROTOCOL_CLAUSE
  ),
  toolsets=["file"],
  model="haiku"
)
```

### Sub-pipelines

| Pipeline | Agents spawned | Stages run | Typical user phrasing |
|----------|----------------|------------|------------------------|
| `full` | 1, 6, 2, 3, 4, 5, 7, Judge | 1→2→3→4→synthesis | "build a complete research project around X, including a trial" |
| `clinical_only` | 6, 3, 4, 5, 7, Judge | 3→4→synthesis | "design a retrospective + prospective study on X" |
| `literature` | 6, 5, 7, Judge | review→synthesis | "give me a structured literature review on X" |
| `methods_rep` | 1, 2, 5, 7, Judge | 1→2→synthesis | "reproduce the X model from paper Y" |
| `proposal` | 1, 6, 5, 7, Judge | partial 1+lit→Specific Aims only | "draft a 1-page proposal for X" |

If Router emits `confidence < 0.7`, **escalate to user** with the `missing_to_upgrade` list and ask which pipeline to run.

## Per-Agent Few-shot ICL Exemplars (NEW)

`examples/` directory ships alongside this skill:

```
examples/
├── README.md
├── router_examples.md        # 4 input→output classifications
├── agent1_example.md         # mini neural-mass model spec
├── agent2_example.md         # one parameter scan + figure caption
├── agent3_example.md         # one analysis-protocol skeleton
├── agent4_example.md         # one CONSORT-compliant trial paragraph
├── agent5_example.md         # one paper-abstract + grant-aims pair
├── agent6_example.md         # one structured-summary entry
├── agent7_monitor_example.md # one pass example + one fail-with-ε example
└── judge_example.md          # one decision report with weakest-evidence call
```

Orchestrator pattern when spawning any agent:

```
context = (
  "<task-specific brief>\n\n"
  "FEW_SHOT_EXEMPLARS:\n"
  + read_file("examples/<agent>_example.md")
  + "\n\n"
  + REFUSAL_PROTOCOL_CLAUSE
)
```

Webb et al. used ≤3 in-context examples per MAP module; we follow the same budget. Adding a 4th example provided diminishing returns in their ablation.

## Stage 2 Internal Tree Search (NEW)

Previously, Stage 2 took Agent 1's central parameter spec and ran one simulation. v2.1 introduces a MAP-style internal search loop **inside Stage 2**:

```
Phase 2.0  Agent 1 hands off central parameter set θ*  +  uncertainty bounds Δθ
                                       │
                                       ▼
Phase 2.1  Actor (A2 inner role)  samples B=3 branches θ₁, θ₂, θ₃ near θ*
                                       │
                                       ▼
Phase 2.2  Monitor (A7)  filters branches that violate physiologic bounds
                                       │
                                       ▼
Phase 2.3  Predictor (A2 inner role)  runs a COARSE simulation per branch
                                       │     (lower resolution / fewer steps,
                                       │      ~10% of full sim cost)
                                       ▼
Phase 2.4  Evaluator (A2 inner role)  scores each branch on a composite metric:
                                  score = w₁·literature_consistency
                                        + w₂·effect_size_plausibility
                                        + w₃·numerical_stability
                                  (weights default to 0.5, 0.3, 0.2)
                                       │
                                       ▼
Phase 2.5  Commit branch with highest score; discard others
                                       │
                                       ▼
Phase 2.6  Run FULL-resolution simulation on the winning branch
                                       │
                                       ▼
Phase 2.7  Monitor gate (existing v2.0 Phase 2.5) → A3
```

The inner Actor/Predictor/Evaluator are spawned as **lightweight Haiku calls** to keep cost down — see `metadata.model_assignment.agent2_search`. The full-sim run still uses Sonnet.

**Cost note:** With B=3 cheap rollouts + 1 full sim, Stage 2 cost rises by ~25% vs v2.0, but in our analog of Webb's ToH ablations (extrapolated), expected improvement on hypothesis-test pass rate is meaningfully larger. If budget-constrained, set B=1 (which degrades to v2.0 behavior).

### Tree Search dispatcher pseudocode

```
def stage2_with_search(theta_central, delta_theta, B=3):
    branches = sample_branches(theta_central, delta_theta, B)
    valid    = monitor.filter(branches, invariants=PHYSIO_BOUNDS)
    if not valid:
        return INSUFFICIENT_EVIDENCE("All sampled branches violate bounds")
    coarse_results = [predictor.coarse_sim(b, model="haiku") for b in valid]
    scores = [evaluator.score(r, weights=(0.5, 0.3, 0.2)) for r in coarse_results]
    winner = valid[argmax(scores)]
    return predictor.full_sim(winner, model="sonnet")
```

## Updated Pipeline (v2.1 — full mode)

```
Phase 0    Intake & scoping (Orchestrator)
Phase 0.5  Router classifies pipeline                         ← NEW
Phase 1    A1 + A6 parallel  (each gets few-shot examples)   ← exemplars NEW
Phase 1.5  Monitor gate
Phase 2.0  A2 receives θ*, Δθ from A1
Phase 2.1  Actor samples B branches                          ← NEW (search)
Phase 2.2  Monitor filters branches                          ← NEW (search)
Phase 2.3  Predictor coarse sim each                         ← NEW (search)
Phase 2.4  Evaluator scores each                             ← NEW (search)
Phase 2.5  Winning branch → full sim
Phase 2.6  Monitor gate (existing)
Phase 3    A3 designs retrospective analysis
Phase 3.5  Monitor gate
Phase 4    A4 designs prospective trial
Phase 4.5  Monitor gate
Phase 5a   A5 produces 2–3 candidate papers + 2 grant drafts
Phase 5b   Judge selects + critiques
```

Other modes (`clinical_only`, `literature`, `methods_rep`, `proposal`) skip the irrelevant phases — see the Sub-pipelines table.

## Refusal Protocol (carried over verbatim from v2.0)

Every agent's context must include:

> "If the upstream inputs or available evidence are insufficient to support a defensible scientific conclusion, you MUST output the literal string `INSUFFICIENT_EVIDENCE` on its own line, followed by:
> - `missing_inputs:` a YAML list of the specific inputs you needed but did not receive
> - `confidence_floor:` your minimum-acceptable confidence level for this decision
> - `recommended_action:` either `retry_upstream`, `ask_human`, or `abort_stage`
>
> Do NOT fabricate parameter values, citations, p-values, or sample sizes to fill gaps. Refusal here is a feature, not a failure."

In Stage 2 search, branch-level refusal (e.g., Predictor fails on a specific branch) discards that branch but does not halt the search unless ALL branches refuse.

## Output File Convention (v2.1)

```
<project-dir>/
├── router_decision.json               # NEW — which sub-pipeline + rationale
├── agent1_modeling_report.md
├── agent6_literature_review.md
├── agent2_search_log.jsonl            # NEW — every branch + score
├── agent2_winning_branch.json         # NEW — committed params
├── agent2_simulation_report.md
├── agent2_simulation_code.py
├── simulation_results.json
├── figures/
├── agent3_analysis_report.md
├── agent3_analysis_pipeline.py
├── agent4_clinical_trial_protocol.md
├── agent4_statistical_safety_plan.md
├── agent5_paper_candidate_A.md
├── agent5_paper_candidate_B.md
├── agent5_grant_candidate_A.md
├── agent5_grant_candidate_B.md
├── judge_decision.md
├── agent5_research_paper_final.md
├── agent5_grant_proposal_final.md
├── monitor_log.jsonl
└── refusal_log.jsonl
```

## Quality Control Checklist (v2.1)

Inherits all v2.0 items, plus:

- [ ] **(NEW) Router rationale recorded:** `router_decision.json` exists and confidence ≥ 0.7 (or escalation logged).
- [ ] **(NEW) Stage 2 search log complete:** `agent2_search_log.jsonl` has B entries; winner clearly marked.
- [ ] **(NEW) Cost-aware adherence:** Cross-check that each `delegate_task` model param matches `metadata.model_assignment`.
- [ ] **(NEW) Examples were loaded:** each agent's context included its `examples/<agent>_example.md`.

## Common Pitfalls and Fixes (v2.1 additions)

(All v2.0 items carry over; only new ones listed here.)

### 11. (NEW) Router misclassifies edge cases
**Symptom:** User wanted full pipeline but Router picked `proposal`.
**Fix:** Router's `confidence` field; escalate < 0.7. Also, give Router 4 exemplars in `examples/router_examples.md` covering boundary cases.

### 12. (NEW) Stage 2 search picks numerically pretty but biologically nonsense branch
**Symptom:** Winning branch has highest `numerical_stability` but worst literature fit.
**Fix:** Default weights (0.5 / 0.3 / 0.2) prioritize literature consistency. If user has a strong prior on stability, override weights in Phase 0 intake.

### 13. (NEW) Few-shot examples pollute the agent's style
**Symptom:** Agent 5's paper sounds exactly like the exemplar.
**Fix:** Exemplars in `examples/` should be SCHEMA examples (structure), not STYLE templates. Use placeholder content ("[concept]") rather than real research prose.

### 14. (NEW) Cost-aware override silently fails
**Symptom:** Orchestrator forgets to pass `model=...` to `delegate_task`, defaults bite.
**Fix:** Verification command below.

## Verification Commands (v2.1 additions)

```bash
# Confirm Router ran and was confident
jq '.confidence' <project-dir>/router_decision.json

# Confirm Stage 2 actually explored branches
wc -l <project-dir>/agent2_search_log.jsonl   # Should equal B (default 3)

# Confirm cost-aware assignment was honored (grep the orchestrator's log)
grep -c '"model":' <project-dir>/orchestrator_calls.log  # Every call must specify model
```

## One-Shot Recipe (v2.1)

When the user provides 2+ papers and says "build a research plan":

1. Extract papers, save to project dir
2. **Run Router** with the user's stated goal + paper abstracts as context
3. Read selected sub-pipeline from the table above
4. Inject `examples/<agent>_example.md` into every spawned agent's context
5. Pass `model=...` from `metadata.model_assignment` on every `delegate_task` call
6. Monitor progress; consult Monitor + Refusal + Search logs at every gate
7. Deliver Judge-selected final outputs to user, with `router_decision.json` and `judge_decision.md` included

## Related Skills

- `academic-paper-review` — Deep analysis of input papers
- `arxiv` — Preprint search (Agent 1 & 6)
- `writing-plans` — Simpler planning alternative
- `requesting-code-review` — For Agent 2's simulation code

---

## Changelog

### v2.1.0 (2026-06-06) — Router + Few-shot + Cost-aware + Tree Search

Adds the four P1/P2 backlog items from v2.0's "Future Work":

1. **Phase 0.5 Query Router** — avoids forcing every request through the full 4-stage pipeline. Five sub-pipelines (`full | clinical_only | literature | methods_rep | proposal`).
2. **Per-agent few-shot ICL exemplars** — `examples/` directory with one mini exemplar per agent. Webb et al. (2025) achieved planning gains with ≤3 examples per MAP module.
3. **Cost-aware model assignment as first-class field** — promoted into `metadata.model_assignment` in the frontmatter. Estimated ~60% cost saving vs all-Opus baseline.
4. **Stage 2 internal Tree Search** — Actor samples B=3 parameter branches near A1's central spec, Monitor filters, Predictor coarse-simulates, Evaluator scores, winner gets full sim. Directly inspired by the MAP Search loop (Algorithm 2 in Webb 2025).

### v2.0.0 — Monitor + Judge + Refusal

Adds Agent 7 (Monitor), Judge LLM after Agent 5, and INSUFFICIENT_EVIDENCE refusal protocol. Inspired by MAP (Webb 2025) and Arkangel AI (Villa 2025).

### v1.0.0 — Six agents, four stages, sequential pipeline.

---

## Future Work (v2.2+ backlog)

- **Adaptive Monitor strictness** — start lax in exploratory mode, tighten as evidence accumulates.
- **Cross-pipeline memory** — let Router learn from past misclassifications.
- **Judge ensemble** — two Judges with different rubrics; tie-break by the user.
- **Predictor self-consistency** — at Stage 2 Phase 2.3, run each coarse sim K=2 times with different seeds and use the average score.
- **Live cost telemetry** — emit per-stage cost to `cost_log.jsonl` for budget tracking.
