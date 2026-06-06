---
name: multi-agent-research-pipeline
description: "Use when the user wants to execute a full or partial research project using a multi-agent architecture — from literature review and computational modeling to simulation, data analysis, clinical trial design, and paper/grant writing. v2.2 builds on v2.1 (Router + Few-shot + Cost-aware + Tree Search) with five refinement upgrades: (1) adaptive Monitor strictness that loosens in exploratory phases and tightens for high-stakes clinical handoffs; (2) cross-pipeline memory so the Router learns from past misclassifications; (3) Judge ensemble (two Judges with complementary rubrics, user tie-breaks on disagreement); (4) Predictor self-consistency at Stage 2 (K=2 seeds per coarse sim, variance becomes a quality signal); (5) live cost telemetry per stage with budget tracking. Depends on: academic-paper-review, arxiv, execute_code, delegate_task."
version: 2.2.0
author: OWL + Kwota
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [research, multi-agent, pipeline, computational-neuroscience, clinical-trial, paper-writing, grant-writing, orchestration, monitor, judge, refusal, router, tree-search, icl, cost-aware, adaptive, memory, ensemble, self-consistency, telemetry]
    related_skills: [academic-paper-review, arxiv, writing-plans, requesting-code-review]
    inspired_by:
      - "Webb, Mondal & Momennejad (2025). A brain-inspired agentic architecture to improve planning with LLMs. Nature Communications 16:8633. https://doi.org/10.1038/s41467-025-63804-5"
      - "Villa et al. (2025). Arkangel AI: A conversational agent for real-time, evidence-based medical question-answering. Intelligence-Based Medicine 12:100274. https://doi.org/10.1016/j.ibmed.2025.100274"
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
    judge_a:          opus     # rigor rubric
    judge_b:          opus     # translational rubric (NEW: ensemble)
  monitor_strictness:
    # NEW in v2.2 — strictness level per gate (1=lax, 5=strict)
    phase_1.5:  3   # post-Stage 1: moderate (exploratory but should be clean)
    phase_2.2:  2   # Stage 2 inner branch filter: lax (we want diversity)
    phase_2.6:  4   # post-Stage 2: strict (commits to A3)
    phase_3.5:  4   # post-Stage 3: strict
    phase_4.5:  5   # post-Stage 4: maximum (clinical, regulatory)
  cost_budget_usd: null   # set to a number to enable budget-stop behavior
  router_memory_file: router_memory.jsonl
  cost_telemetry_file: cost_log.jsonl
---

# Multi-Agent Research Pipeline (v2.2)

Execute a research project from idea to publication with a multi-agent architecture that **learns from its own runs, calibrates strictness to risk, deliberates with two Judges, and reports its own cost**.

> **v2.2 — What changed since v2.1**
> Five refinement upgrades. None of them break v2.1 behavior — set all the new flags to v2.1 defaults and you get v2.1 back.
>
> 1. **Adaptive Monitor strictness** — each gate has a 1–5 strictness level. Exploratory phases (Stage 2 inner search) run lax to preserve diversity; clinical handoffs run maxed out.
> 2. **Cross-pipeline memory** (`router_memory.jsonl`) — Router persists past `(intent, classification, was_correct)` triples; future calls get top-K similar past cases as additional few-shot examples.
> 3. **Judge ensemble** — two Judges with complementary rubrics (rigor vs translational impact). Agreement → ship. Disagreement → escalate to user with both rationales.
> 4. **Predictor self-consistency** at Stage 2 — each coarse sim runs K=2 times with different seeds. Mean score is used; variance across seeds is itself a quality signal (high variance ⇒ deprioritize the branch).
> 5. **Live cost telemetry** (`cost_log.jsonl`) — every `delegate_task` call appends token counts + estimated USD cost; orchestrator emits per-stage and grand-total summaries; respects optional `cost_budget_usd`.

## When to Use

Same as v2.1.

## Architecture Overview (v2.2)

```
╔══════════════════════════════════════════════════════════════════════════╗
║                       ORCHESTRATOR (You)                                 ║
║   Now tracks: cost, router memory, monitor strictness, judge ensemble    ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║   ┌───────────────────────────────┐                                      ║
║   │ Phase 0.5  Router             │ ← reads router_memory.jsonl for      ║
║   │ + cross-run memory (NEW)      │   top-K similar past cases           ║
║   └────────────┬──────────────────┘                                      ║
║                ▼                                                         ║
║   Sub-pipeline chosen, agents spawned…                                   ║
║                                                                          ║
║   At every handoff:                                                      ║
║   ┌─────────────────────────────────────────────────────────────┐       ║
║   │ Agent 7 Monitor — strictness level read from frontmatter    │       ║
║   │ phase_1.5: lvl 3  ·  phase_2.2: lvl 2  ·  phase_2.6: lvl 4  │ NEW   ║
║   │ phase_3.5: lvl 4  ·  phase_4.5: lvl 5                       │       ║
║   └─────────────────────────────────────────────────────────────┘       ║
║                                                                          ║
║   Stage 2 inner search (v2.1) with self-consistency K=2 per branch:      ║
║                                                                          ║
║     Actor samples B=3 branches ──▶ Monitor lvl-2 filter                  ║
║                                       │                                  ║
║                                       ▼                                  ║
║     Each branch: Predictor coarse sim × K=2 seeds  ← NEW (self-cons.)   ║
║                                       │                                  ║
║                                       ▼                                  ║
║     Evaluator: mean(scores) − λ·std(scores)   (penalize unstable)         ║
║                                       │                                  ║
║                                       ▼                                  ║
║     Commit highest-score branch → full sim → A3                          ║
║                                                                          ║
║   At synthesis:                                                          ║
║     A5 → 2–3 candidates ──▶ Judge A (rigor) + Judge B (translational)    ║
║                              │                                           ║
║                              ▼                                           ║
║                       Agree? ──yes──▶ ship                               ║
║                              │                                           ║
║                              no                                          ║
║                              ▼                                           ║
║                       Escalate to user, show both rubric scores          ║
║                                                                          ║
║   Throughout: every delegate_task call appends to cost_log.jsonl         ║
║   At end: per-stage + grand-total cost summary; halts if over budget     ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## 1. Adaptive Monitor Strictness

Each gate has a strictness level 1–5 declared in frontmatter `metadata.monitor_strictness`. Invariants are now **tagged** with a minimum strictness:

```
INVARIANTS_A1A6_TO_A2 = [
  # level 1 (always checked)
  { name: "units_declared",            min_level: 1 },
  # level 2 (mid-strictness and up)
  { name: "citations_resolve",         min_level: 2 },
  { name: "hypotheses_falsifiable",    min_level: 2 },
  # level 3 (default at phase_1.5 = 3)
  { name: "method_coverage_ratio_80",  min_level: 3 },
  # level 4
  { name: "pre_registration_noted",    min_level: 4 },
  # level 5 (clinical-grade)
  { name: "irb_template_referenced",   min_level: 5 },
]
```

Monitor at phase_1.5 (level 3) runs the first four; at phase_4.5 (level 5) runs all six. Schema example: `examples/monitor_strictness_example.md`.

**Why this matters:** v2.1's static checklist over-rejected promising exploratory hypotheses at Stage 1. By Stage 4, conversely, v2.1 risked under-checking high-stakes clinical text.

**Override pattern:** user can pass `monitor_strictness_override: {phase_2.6: 5}` in Phase 0 intake to tighten a specific gate.

## 2. Cross-pipeline Router Memory

Router now reads `router_memory.jsonl` (in `<project-dir>` or, if shared across projects, in the skill's home dir) and includes the top-K=3 most similar past entries as additional few-shot exemplars.

Each line in `router_memory.jsonl`:

```json
{
  "timestamp": "2026-06-06T10:23:00Z",
  "intent_keywords": ["EEG", "alpha power", "stroke", "trial"],
  "classification": "full",
  "confidence": 0.92,
  "was_correct": true,
  "user_feedback": null
}
```

**Similarity matching:** v2.2 ships with simple keyword-overlap matching (Jaccard on `intent_keywords`). Embeddings deferred to v2.3.

**End-of-run capture:** after pipeline completes (or aborts), Orchestrator asks user: "Did the Router pick the right pipeline?" and appends the answer to `router_memory.jsonl` with `user_feedback` field. If the answer is no, the correct classification is also recorded — this is the training signal.

**Privacy / hygiene:** memory file is per-project by default; only `intent_keywords` (not full prompts) are stored.

## 3. Judge Ensemble

The single Judge from v2.0/v2.1 is replaced by **two Judges with complementary rubrics**:

### Judge A — Rigor rubric (carries over from v2.0)
1. Coherence
2. Evidence integrity
3. Falsifiability
4. No fabrication
5. Refusal honoring

### Judge B — Translational rubric (NEW)
1. **Clinical relevance** — does the result change patient management?
2. **Feasibility** — can the next study be run with realistic resources?
3. **Equity / generalizability** — does the population claim extend beyond the trial sample?
4. **Safety framing** — are AEs, contraindications, and stopping rules visible?
5. **Funder appeal** — does the proposal fit the target funder's stated priorities?

### Decision rule

```
if Judge A's winner == Judge B's winner:
    SHIP that winner
    record agreement in judge_decision.md
elif both candidates tie within their respective rubrics:
    pick by total score across both rubrics
else:
    # disagreement
    ESCALATE to user with:
      - both Judges' full rubric tables
      - one-paragraph rationale from each
      - default: keep Judge A's winner if user declines to choose
```

Schema example: `examples/judge_ensemble_example.md` (covers agreement, disagreement, and user-declined cases).

## 4. Predictor Self-consistency at Stage 2

v2.1's coarse sim ran each branch once. v2.2 runs each branch K=2 times with different random seeds:

```
def coarse_sim_with_self_consistency(theta, K=2):
    results = []
    for seed in range(K):
        result = predictor.coarse_sim(theta, seed=seed, model="haiku")
        results.append(result)
    return {
        "mean_metrics":  mean_across_seeds(results),
        "std_metrics":   std_across_seeds(results),
    }

def evaluator_score(branch_result, lambda_penalty=0.2):
    mean_composite = composite(branch_result["mean_metrics"])
    std_composite  = composite(branch_result["std_metrics"])
    return mean_composite - lambda_penalty * std_composite
```

**Why penalize variance:** a branch whose two seed-runs disagree widely is a fragile branch. We'd rather commit a slightly lower-mean branch with tight variance than a high-mean, high-variance one.

**Cost:** doubles Stage 2's coarse-sim cost (B × K coarse rollouts instead of B). Still cheap because coarse sims use Haiku. For tight budgets, set K=1 to recover v2.1 behavior.

**Optional escalation:** if any branch's std exceeds a threshold, Monitor emits a `HIGH_VARIANCE` warning to `monitor_log.jsonl` even if the branch is not rejected.

## 5. Live Cost Telemetry

Every `delegate_task` call appends a record to `cost_log.jsonl`:

```json
{
  "timestamp": "2026-06-06T10:23:14Z",
  "stage": "phase_2.3",
  "agent": "agent2_search",
  "model": "haiku",
  "prompt_tokens": 1840,
  "completion_tokens": 510,
  "est_cost_usd": 0.0023
}
```

### End-of-run summary

Orchestrator emits at the end:

```
Pipeline cost summary
─────────────────────
Phase 0.5  Router:           $0.003
Phase 1    A1 + A6:          $0.412
Phase 1.5  Monitor:          $0.004
Phase 2    A2 + inner search:$0.231   (of which $0.087 was K=2 self-consistency)
Phase 2.6  Monitor:          $0.004
Phase 3    A3:               $0.118
Phase 3.5  Monitor:          $0.004
Phase 4    A4:               $0.395
Phase 4.5  Monitor:          $0.005
Phase 5a   A5 candidates:    $0.612
Phase 5b   Judge A + Judge B:$0.084
─────────────────────
TOTAL:                       $1.872
Budget:                      $5.000  (set in metadata.cost_budget_usd)
Remaining:                   $3.128
```

### Budget enforcement

If `metadata.cost_budget_usd` is set and cumulative cost crosses 80% mid-pipeline, Orchestrator warns the user; at 100% it halts before the next `delegate_task` and asks whether to extend budget or abort.

Schema example: `examples/cost_log_example.md`.

## Updated Output File Convention (v2.2)

```
<project-dir>/
├── router_decision.json
├── router_memory.jsonl              # NEW — cross-run learning
├── cost_log.jsonl                   # NEW — per-call telemetry
├── cost_summary.md                  # NEW — end-of-run aggregate
├── agent1_modeling_report.md
├── agent6_literature_review.md
├── agent2_search_log.jsonl          # now records K seeds per branch
├── agent2_winning_branch.json
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
├── judge_a_decision.md              # split: A's rubric
├── judge_b_decision.md              # NEW: B's rubric
├── judge_ensemble_decision.md       # NEW: agreement/disagreement + winner
├── agent5_research_paper_final.md
├── agent5_grant_proposal_final.md
├── monitor_log.jsonl                # entries now carry strictness_level
└── refusal_log.jsonl
```

## Quality Control Checklist (v2.2 additions)

(All v2.0 + v2.1 items still apply.)

- [ ] **(NEW) Monitor strictness honored:** every `monitor_log.jsonl` entry has `strictness_level` field matching the gate.
- [ ] **(NEW) Router memory captured:** end-of-run user feedback appended to `router_memory.jsonl`.
- [ ] **(NEW) Both Judges ran:** `judge_a_decision.md` and `judge_b_decision.md` both exist.
- [ ] **(NEW) Ensemble decision recorded:** `judge_ensemble_decision.md` exists and states agreement/disagreement/user-tiebreak.
- [ ] **(NEW) Self-consistency K seeds logged:** each branch in `agent2_search_log.jsonl` has K entries (default 2).
- [ ] **(NEW) Cost log complete:** every `delegate_task` call has a matching `cost_log.jsonl` line.
- [ ] **(NEW) Budget respected:** if `cost_budget_usd` set, no `delegate_task` ran after budget hit.

## Common Pitfalls and Fixes (v2.2 additions)

(v2.0 + v2.1 items carry over.)

### 15. (NEW) Adaptive strictness underchecks early stages
**Symptom:** Stage 1 produces shaky model spec; Monitor lvl 3 lets it through; downstream cascade.
**Fix:** Strictness 3 still requires units, citations, falsifiability. If your project tolerates even less rigor at Stage 1, you have bigger problems — re-scope at Phase 0.

### 16. (NEW) Router memory leaks across unrelated projects
**Symptom:** A neuroscience project gets ML-pipeline exemplars from memory.
**Fix:** Per-project `router_memory.jsonl` by default. Cross-project memory only if user explicitly sets `metadata.shared_router_memory: true`.

### 17. (NEW) Judges always agree because rubrics overlap
**Symptom:** Ensemble never disagrees, defeating the point.
**Fix:** Verify Judge B's rubric explicitly tests dimensions Judge A does NOT (clinical relevance, equity, funder appeal). If agreement rate >95% across runs, audit Judge B's rubric for redundancy.

### 18. (NEW) Self-consistency penalizes legitimate variability
**Symptom:** All branches get high variance because the system is genuinely stochastic; nothing wins.
**Fix:** Lower `lambda_penalty` from 0.2 to 0.05 in Evaluator scoring (configurable in Phase 0 intake). Alternative: report variance to user separately rather than baking it into score.

### 19. (NEW) Cost telemetry inflates context
**Symptom:** Every agent context now includes cost log → token waste.
**Fix:** `cost_log.jsonl` is OUTPUT-side only. Never include it in any agent's context.

### 20. (NEW) Budget-stop halts mid-Judge
**Symptom:** Pipeline stops between Judge A and Judge B; ensemble decision impossible.
**Fix:** Orchestrator's budget check should run only BEFORE spawning a new top-level stage, not within Phase 5. Phase 5a + 5b are atomic.

## Verification Commands (v2.2 additions)

```bash
# Strictness levels actually used
jq '.strictness_level' <project-dir>/monitor_log.jsonl | sort | uniq -c

# Router memory growth
wc -l <project-dir>/router_memory.jsonl

# Self-consistency K used per branch
jq 'group_by(.branch_id) | .[] | length' <project-dir>/agent2_search_log.jsonl

# Both Judges produced
ls <project-dir>/judge_*_decision.md

# Total cost
jq '[.[].est_cost_usd] | add' <project-dir>/cost_log.jsonl
```

## Related Skills

Same as v2.1.

---

## Changelog

### v2.2.0 (2026-06-06) — Adaptive + Memory + Ensemble + Self-consistency + Telemetry

Five refinements completing the backlog from v2.1. All backward-compatible: set the new flags to their v2.1-equivalent defaults (strictness all = 5, K = 1, Judge B disabled, memory empty, no budget) and v2.2 reduces to v2.1.

### v2.1.0 — Router + Few-shot + Cost-aware + Tree Search

Adds Phase 0.5 Query Router, per-agent ICL exemplars in `examples/`, cost-aware model assignment as first-class frontmatter field, and Stage 2 internal Tree Search.

### v2.0.0 — Monitor + Judge + Refusal

Adds Agent 7 (Monitor), single Judge after Agent 5, and INSUFFICIENT_EVIDENCE refusal protocol. Inspired by MAP (Webb 2025) and Arkangel AI (Villa 2025).

### v1.0.0 — Six agents, four stages, sequential pipeline.

---

## Future Work (v2.3+ backlog)

- **Embedding-based router memory similarity** — replace Jaccard with sentence embeddings.
- **Judge meta-learner** — learn which Judge's preference better predicted user-accepted outputs over time.
- **Agent-level retry budget** — per-agent max retries before escalation, not just global cost budget.
- **Streaming cost feedback** — show live cost burn as the user watches.
- **Multilingual routing exemplars** — extend `router_examples.md` to Chinese / Spanish / Japanese intent patterns.
