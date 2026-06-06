---
name: multi-agent-research-pipeline
description: "Use when the user wants to execute a research project using a multi-agent architecture — from literature review and computational modeling to simulation, data analysis, clinical trial design, and paper/grant writing. v2.3 introduces a Cognitive Faculty Layer on top of v2.2's role-based agents. Each agent's task is now tagged with the cognitive faculties it requires (Language / Logic / Social / World), inspired by the four brain networks formalized in Alkhamissi et al. 2026 (MiCRo, ICLR 2026). New components: (1) Agent 8 Reflector — a Default-Mode-Network-inspired agent that reads the winning synthesis as if 3 months later and surfaces missed implications; (2) Phase 0.75 Domain Priming — a 3-stage MiCRo-style curriculum that warms each agent on 3 small domain-specific cases before the real pipeline runs; (3) Cognitive Probes — three standardized mini-checks (Language / Logic / Social) that verify the relevant faculty actually engaged, analogous to fMRI localizers; (4) Cognitive Steering Snippets — per-faculty prompt augmentations inserted into agent contexts on demand; (5) Equity check promoted from Judge B's rubric to a first-class Social-faculty probe; (6) Optional soft Top-2 at Stage 2 tree search. Depends on: academic-paper-review, arxiv, execute_code, delegate_task."
version: 2.3.0
author: OWL + Kwota
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [research, multi-agent, pipeline, cognitive-faculty, dmn, reflector, curriculum, localizer, steering, ablation-aware, top-k-routing]
    related_skills: [academic-paper-review, arxiv, writing-plans, requesting-code-review]
    inspired_by:
      - "Webb, Mondal & Momennejad (2025). A brain-inspired agentic architecture to improve planning with LLMs. Nature Communications 16:8633. https://doi.org/10.1038/s41467-025-63804-5"
      - "Villa et al. (2025). Arkangel AI: A conversational agent for real-time, evidence-based medical question-answering. Intelligence-Based Medicine 12:100274. https://doi.org/10.1016/j.ibmed.2025.100274"
      - "Alkhamissi, De Sabbata, Tuckute, Chen, Schrimpf & Bosselut (2026). Mixture of Cognitive Reasoners: Modular Reasoning with Brain-Like Specialization. ICLR 2026. https://cognitive-reasoners.epfl.ch/"
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
    agent8_reflector: opus     # NEW — DMN-inspired, needs long context
    judge_a:          opus
    judge_b:          opus
  monitor_strictness:
    phase_1.5:  3
    phase_2.2:  2
    phase_2.6:  4
    phase_3.5:  4
    phase_4.5:  5
  cognitive_faculties:           # NEW in v2.3
    enabled: true
    faculties: [language, logic, social, world]
    steering_dir: examples/cognitive_faculty_steering.md
    probes_dir:   examples/cognitive_probes/
  domain_priming:                # NEW in v2.3
    enabled: false               # opt-in; default off to preserve v2.2 behavior
    cases_per_agent: 3
  stage2_routing:                # NEW in v2.3
    mode: top1                   # top1 (v2.2) | soft_top2 (new option)
  cost_budget_usd: null
  router_memory_file: router_memory.jsonl
  cost_telemetry_file: cost_log.jsonl
---

# Multi-Agent Research Pipeline (v2.3)

Execute a research project with a multi-agent architecture that now reasons across **two orthogonal dimensions**: the **task-role dimension** (Modeler, Lit Reviewer, Simulator, Data Analyst, Clinical, Synthesis, Monitor, Judge, Reflector) and the **cognitive-faculty dimension** (Language, Logic, Social, World) — directly inspired by the four brain networks formalized in MiCRo (Alkhamissi et al. 2026, ICLR).

> **v2.3 — What changed since v2.2**
> Seven upgrades motivated by MiCRo, all opt-in or backward-compatible:
> 1. **Cognitive Faculty Layer** — every agent task is tagged with which of `{Language, Logic, Social, World}` faculties it needs. Steering snippets are inserted into the agent's context to boost the named faculties.
> 2. **Agent 8 — Reflector (DMN-inspired)** — runs after Judge ensemble, performs a "3-months-later" reflective read of the winning paper/grant. Surfaces missed implications, weak interpretations, alternative framings. Analogous to the brain's Default Mode Network role in self-reflection and event-level integration.
> 3. **Phase 0.75 Domain Priming** (opt-in) — mirrors MiCRo's 3-stage curriculum. Before the real pipeline, each agent is warmed on 3 small domain-specific mini-cases to induce role+faculty specialization. MiCRo used only ~3000 SFT samples to seed lasting specialization.
> 4. **Cognitive Probes** — three standardized mini-tests (Language probe, Logic probe, Social probe) that verify the agent's recent output actually engaged the named faculty. Analogous to fMRI localizers (Fedorenko-style Language localizer, Multiple Demand localizer, Theory-of-Mind localizer).
> 5. **Cognitive Steering at inference** — for high-stakes moments, the orchestrator can prepend a faculty-specific steering snippet (e.g., "engage Social faculty: anticipate reviewer pushback, consider patient perspective") to a routine `delegate_task` call.
> 6. **Equity check as first-class probe** — previously buried in Judge B's rubric. Now lives in the Social probe and runs unconditionally at Phase 5.
> 7. **Optional soft Top-2 at Stage 2** — extends v2.1's tree search to commit the top-2 branches in parallel (MiCRo found soft top-2 routing more stable than top-1).

## When to Use

Same as v2.2.

## Architecture Overview (v2.3)

```
╔════════════════════════════════════════════════════════════════════════════╗
║                       ORCHESTRATOR (You)                                   ║
║   Tracks: cost, router memory, monitor strictness, judge ensemble,         ║
║           cognitive faculties (NEW), probe results (NEW)                   ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║   Phase 0     Intake & scoping                                             ║
║   Phase 0.5   Router classifies pipeline                                   ║
║   Phase 0.75  Domain Priming (NEW, opt-in) — 3 mini-cases per agent       ║
║   Phase 1+    Agents spawn WITH cognitive-faculty tags in their contexts   ║
║                                                                            ║
║   Two orthogonal dimensions per agent call:                                ║
║                                                                            ║
║      ROLE  ────▶  Agent 1 / 2 / 3 / 4 / 5 / 6 / 7 / 8 / Judges            ║
║      FACULTY ──▶  Language / Logic / Social / World                       ║
║                                                                            ║
║      delegate_task receives BOTH:                                          ║
║        - role-specific brief (v2.2)                                        ║
║        - faculty-steering snippets for the faculties tagged here (NEW)     ║
║                                                                            ║
║   At synthesis:                                                            ║
║     Agent 5 → 2–3 candidates                                               ║
║     → Judge A + Judge B (ensemble)                                         ║
║     → Cognitive Probes (Language + Logic + Social) on the winner (NEW)     ║
║     → Agent 8 Reflector (NEW): "3 months later" read                      ║
║     → ship                                                                 ║
║                                                                            ║
║   Throughout: cost telemetry, monitor log, refusal log + cognitive_probe_log ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## Agent × Faculty Matrix

The same agent role can demand different faculties depending on the sub-task. v2.3 makes this explicit:

| Agent (Role) | Language | Logic | Social | World |
|--------------|:---:|:---:|:---:|:---:|
| **A1** Computational Modeler | ✓ | ✓✓✓ | — | ✓✓ |
| **A2** Simulation Expert | ✓ | ✓✓✓ | — | ✓ |
| **A3** Data Analyst | ✓ | ✓✓✓ | ✓ (subgroup equity) | ✓✓ |
| **A4** Clinical Researcher | ✓✓ (CONSORT prose) | ✓✓ (power calc) | ✓✓✓ (consent / equity / safety framing) | ✓✓ (precedent trials) |
| **A5** Synthesis Writer | ✓✓✓ | ✓✓ | ✓✓ (reviewer empathy) | ✓✓ |
| **A6** Literature Gatekeeper | ✓✓ | ✓ | — | ✓✓✓ |
| **A7** Monitor | — | ✓✓✓ | — | ✓ |
| **A8** Reflector (NEW) | ✓ | ✓ | ✓ | ✓✓✓ (DMN-style integration) |
| Judge A (rigor) | ✓ | ✓✓✓ | — | ✓ |
| Judge B (translational) | ✓ | ✓ | ✓✓✓ | ✓✓ |

Tick weight (✓ to ✓✓✓) determines steering snippet intensity (light / medium / strong).

## 1. Cognitive Faculty Layer

Each `delegate_task` call now includes a `faculties` field:

```python
delegate_task(
  goal="Write the discussion section",
  context=role_brief + REFUSAL_PROTOCOL_CLAUSE,
  faculties=["language", "logic", "social"],     # NEW
  faculty_intensity={"language": "strong", "logic": "medium", "social": "medium"}
)
```

The orchestrator then appends faculty-specific steering snippets read from `examples/cognitive_faculty_steering.md`. Example (Social, medium):

> **Social faculty (Theory of Mind).** Before producing output, momentarily adopt the perspective of: (a) the most skeptical likely reviewer, (b) a clinician unfamiliar with your model class, (c) a patient who would be a candidate for the proposed intervention. Each section of your output should survive all three perspectives. If any does not, mark it with `[ToM-CHECK]` for revision.

This is the LLM-prompt analog of MiCRo's test-time routing intervention, which the paper demonstrated could **dynamically steer model behavior** (e.g., social responses dominate when only the Social expert is active).

## 2. Agent 8 — Reflector (NEW)

MiCRo's **World expert** mirrors the brain's **Default Mode Network (DMN)** — active during rest, self-reflection, memory recall, and event-level integration across long timescales. v2.2's pipeline had no such role.

**Agent 8 runs AFTER the Judge ensemble has shipped a winner.** It does NOT participate in candidate generation. Its job is the *post-hoc reflective read*.

```
delegate_task(
  goal=(
    "Reflector — read the winning paper and grant as if it is now 3 months "
    "after submission and you are the original author re-reading critically. "
    "Surface: "
    "  (a) the SINGLE claim most likely to be challenged at review and how you'd defend it, "
    "  (b) one implication you under-developed, "
    "  (c) one alternative framing that would have made the contribution clearer, "
    "  (d) one piece of follow-up work that this paper sets up."
  ),
  context=read_file("agent5_research_paper_final.md") + read_file("agent5_grant_proposal_final.md")
         + read_file("judge_ensemble_decision.md") + REFUSAL_PROTOCOL_CLAUSE,
  faculties=["world", "social", "logic"],
  faculty_intensity={"world": "strong", "social": "medium", "logic": "medium"},
  model="opus"
)
```

Output → `agent8_reflection.md`. The user receives the winner **and** the Reflector's critique side-by-side. The Reflector NEVER overrides the Judge; it only annotates.

**Why this matters:** MiCRo shows that the DMN-style World expert engages on long-discourse, event-level processing — exactly what is missing when a synthesis agent locally optimizes one section at a time.

## 3. Phase 0.75 — Domain Priming (Opt-in Curriculum)

MiCRo demonstrated that **~3,055 curated samples** in Stage 1 were enough to induce lasting functional specialization. For our LLM-orchestration pipeline, the analog is much smaller: **3 mini-cases per agent**, run as a warm-up before the real pipeline.

Activate by setting `metadata.domain_priming.enabled: true`.

```
For each agent role:
  prime_cases = generate 3 small domain-specific mini-tasks  (see examples/domain_priming_example.md)
  for case in prime_cases:
    response = delegate_task(
      goal=case.mini_goal,
      context=case.mini_context + REFUSAL_PROTOCOL_CLAUSE,
      faculties=case.faculties_to_exercise,
      model=cheap_tier(role)        # use the cheap tier for priming
    )
    log to domain_priming_log.md
```

Domain priming is OPT-IN because it costs extra. For exploratory pilots, leave it off. For high-stakes runs (clinical Stage 4, grant on tight deadline), turn it on — the curriculum effect is documented in MiCRo §3.2 and Appendix J: specialization induced by Stage 1 **persists through 939K-sample end-to-end fine-tuning**. Our analog: faculty steering chosen in priming tends to stick through the real pipeline.

## 4. Cognitive Probes (Localizer Analog)

MiCRo validates its experts by running **neuroscience-grade fMRI localizers** (Language, Multiple Demand, Theory of Mind) on the model — they correctly identify the corresponding expert modules. The LLM-orchestration analog: run **standardized mini-probes** on any agent's output to verify the faculty engaged.

Probes live in `examples/cognitive_probes/`:

```
examples/cognitive_probes/
├── language_probe.md   # checks: clarity, terminology consistency, jargon control
├── logic_probe.md      # checks: derivation completeness, quantitative bounds, no leaps
├── social_probe.md     # checks: equity, patient perspective, reviewer pushback, ToM markers
└── world_probe.md      # checks: literature grounding, precedent, factual anchoring
```

Each probe is a yes/no checklist over a recent output. Output → `cognitive_probe_log.jsonl`:

```json
{
  "probe": "social",
  "subject_agent": "agent5_paper_candidate_B",
  "checks": {
    "equity_addressed": false,
    "patient_perspective_present": true,
    "reviewer_pushback_anticipated": true,
    "tom_markers_present": true
  },
  "verdict": "FAIL: equity not addressed",
  "recommendation": "Inject Social-faculty steering at strong intensity; re-run §Discussion subgroup paragraph"
}
```

**When probes run:** at Phase 5 final QC, on the Judge-selected winners. Optionally also at Phase 1.5 and 4.5 Monitor gates.

## 5. Equity / ToM First-class Probe

In v2.2, equity was 1 of 5 axes in Judge B. Probability of being under-weighted was real. In v2.3, equity is checked **unconditionally** by the Social probe at Phase 5. If it fails, the orchestrator routes back to Agent 5 with strong Social-faculty steering for the specific deficient section.

## 6. Optional Soft Top-2 at Stage 2

Activate by setting `metadata.stage2_routing.mode: soft_top2`.

MiCRo Stage 2 switched from top-1 to soft top-2 routing for stability ("smoother transitions and more robust routing decisions"). The orchestration analog:

- Stage 2 tree search picks the **top 2** branches by composite score (not just top 1)
- Both are simulated at full resolution in parallel
- A3 receives BOTH result sets; A3 itself decides which to base analysis on, or whether to design analyses that span both
- This **doubles Stage 2 cost** so it's opt-in; useful when the top-1 vs top-2 score gap is < 10%

If the gap is large (≥10%), top-1 mode is automatically preferred even if soft_top2 is set, to avoid wasted cost.

## 7. Cognitive Steering Snippets Inventory

Lives in `examples/cognitive_faculty_steering.md`. One snippet per (faculty × intensity) cell, 12 total (4 faculties × 3 intensities). The orchestrator concatenates the relevant snippets and prepends them to the agent's `context`.

Example — Logic / strong:

> **Logic faculty (Multiple Demand network). Strong engagement.** Before producing output, you must (1) list every quantitative claim you intend to make; (2) for each, identify the derivation chain (assumption → step → step → conclusion) with no leaps of ≥2 inferential steps; (3) flag any step where the chain breaks with `[LOGIC-GAP]`. Do not paper over gaps; mark them and continue.

## Updated Pipeline (v2.3 — full mode + all opts on)

```
Phase 0     Intake & scoping
Phase 0.5   Router (now uses cross-run memory, v2.2)
Phase 0.75  Domain Priming (NEW, opt-in)        ← MiCRo Stage 1 analog
Phase 1     A1 + A6  WITH faculty-steering snippets
Phase 1.5   Monitor gate (strictness lvl 3)
Phase 2.0   A2 receives θ*, Δθ
Phase 2.1   Actor samples B=3 branches
Phase 2.2   Monitor filter (strictness lvl 2)
Phase 2.3   Predictor coarse sim × K=2 seeds
Phase 2.4   Evaluator: score = mean − λ·std
Phase 2.5   Commit branch(es) — TOP-1 or SOFT TOP-2 per metadata
Phase 2.6   Monitor gate (strictness lvl 4)
Phase 3     A3
Phase 3.5   Monitor gate
Phase 4     A4 with Social-faculty strong steering (consent / equity / safety)
Phase 4.5   Monitor gate (strictness lvl 5)
Phase 5a    A5 produces candidates
Phase 5b    Judge A + Judge B ensemble
Phase 5c    Cognitive Probes on the winner       ← NEW
Phase 5d    Agent 8 Reflector pass                ← NEW
Ship        winner + reflection annotation
```

## Updated Output Files (v2.3)

```
<project-dir>/
├── (all v2.2 files)
├── domain_priming_log.md             # NEW (if enabled)
├── cognitive_probe_log.jsonl         # NEW
├── agent8_reflection.md              # NEW
└── faculty_steering_log.md           # NEW — records which snippets were injected when
```

## Quality Control Checklist (v2.3 additions)

(All v1.0 → v2.2 items still apply.)

- [ ] **(NEW) Faculty steering recorded:** every `delegate_task` call's `faculties` field logged in `faculty_steering_log.md`.
- [ ] **(NEW) Probes ran on winner:** `cognitive_probe_log.jsonl` has at least Language / Logic / Social entries for the final paper.
- [ ] **(NEW) Equity probe passed:** Social probe's `equity_addressed: true` for the final paper AND grant.
- [ ] **(NEW) Reflector ran:** `agent8_reflection.md` exists and names the single most-vulnerable claim.
- [ ] **(NEW) Domain priming honored:** if enabled, `domain_priming_log.md` shows ≥3 cases per agent.

## Common Pitfalls (v2.3 additions)

(v1.0 → v2.2 items carry over.)

### 21. (NEW) Faculty steering bloats every context
**Symptom:** All 4 faculties tagged at strong intensity on every call; context exceeds budget.
**Fix:** Use the Agent × Faculty matrix above. Only ✓✓✓ cells get strong intensity. ✓✓ medium. ✓ light. Blank cells get no snippet.

### 22. (NEW) Reflector contradicts Judge and confuses user
**Symptom:** Judge ships A; Reflector says B was better.
**Fix:** Reflector is **annotative**, not overruling. Its output must start with "I am not overriding the Judge. The shipped artifact is X. My reflective notes are…" Include this clause in Agent 8's brief.

### 23. (NEW) Domain priming biases away from genuine novelty
**Symptom:** Pipeline produces outputs that look like the priming exemplars.
**Fix:** Priming exemplars must be **schema-only** (same rule as `examples/`). If you find priming pulling toward specific content, the exemplars have too much real prose — replace with placeholders.

### 24. (NEW) Cognitive probes turn into rubber-stamp checks
**Symptom:** Probes always pass.
**Fix:** Each probe must have at least one objectively testable item (grep / count / pattern). If a probe is all "looks reasonable" items, it has no teeth.

### 25. (NEW) Soft top-2 doubles cost for marginal benefit
**Symptom:** Both branches at Stage 2 produce nearly identical downstream A3 work.
**Fix:** Automatic gap-check — if top-1 and top-2 composite scores differ by ≥10%, demote to top-1 even if soft_top2 mode is set. Configurable threshold in `metadata.stage2_routing.gap_threshold` (default 0.10).

## Verification Commands (v2.3 additions)

```bash
# Count faculty snippets injected
wc -l <project-dir>/faculty_steering_log.md

# All probes passed?
jq 'select(.verdict | startswith("FAIL"))' <project-dir>/cognitive_probe_log.jsonl

# Reflector identified a single vulnerable claim?
grep -c "^### Vulnerable claim" <project-dir>/agent8_reflection.md

# Domain priming completion
ls -la <project-dir>/domain_priming_log.md
```

## Related Skills

Same as v2.2.

---

## Changelog

### v2.3.0 (2026-06-06) — Cognitive Faculty Layer + DMN Reflector + Curriculum Priming + Localizer Probes

Inspired by Alkhamissi et al. (2026), *Mixture of Cognitive Reasoners* (ICLR), which formalizes four brain networks (Language / Logic / Social / World) as specialized expert modules inside a single transformer. Whereas MiCRo operates inside one model, v2.3 lifts the **concept** of cognitive-faculty specialization into our multi-agent orchestration:

1. Every agent's task is now tagged with which faculties it needs.
2. Faculty steering snippets are injected into agent contexts on demand.
3. New Agent 8 (Reflector) mirrors the brain's Default Mode Network — runs a "3-months-later" post-hoc reflective read of the shipped artifact.
4. Opt-in Phase 0.75 Domain Priming mirrors MiCRo's curriculum (Stage 1 = ~3K samples induce lasting specialization).
5. Cognitive Probes serve as fMRI-localizer-style verification that the agent actually engaged the named faculty.
6. Equity check promoted from Judge B's rubric into a first-class unconditional Social probe.
7. Optional soft Top-2 at Stage 2, matching MiCRo's Stage 2 routing choice.

All upgrades opt-in or backward-compatible: set `cognitive_faculties.enabled: false` and `domain_priming.enabled: false` and `stage2_routing.mode: top1` and you get v2.2 back.

### v2.2.0 — Adaptive Monitor + Router memory + Judge ensemble + Self-consistency + Cost telemetry

### v2.1.0 — Router + Few-shot ICL + Cost-aware first-class + Tree Search

### v2.0.0 — Monitor + Judge + Refusal

### v1.0.0 — Six agents, four stages, sequential pipeline.

---

## Future Work (v2.4+ backlog)

- **Faculty-by-layer hierarchy** — MiCRo found early layers favor Language, later layers favor Logic/Social/World. The pipeline analog: weight Language faculty higher at Phase 1 / 5a; weight Logic/Social higher at Phase 4 / 5b.
- **Cross-agent faculty handoff log** — track when Agent X's Social output is consumed by Agent Y, build a faculty-flow graph for the whole pipeline.
- **Faculty ablation test** — periodically run a pipeline with one faculty's steering disabled to measure that faculty's actual causal contribution (analog of MiCRo §5.2 ablations).
- **MiCRo-style "ablating irrelevant faculty improves performance"** — if a sub-task does NOT need Social, explicitly suppress Social steering. v2.3 leaves Social on by default for Agent 4; future work: turn it off for Agent 2.
- **Behavioral alignment scoreboard** — analog of CogBench: a small benchmark suite that scores the pipeline's output for "human-like" properties (calibration, hedging, balanced consideration).
