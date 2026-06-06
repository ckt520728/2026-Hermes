---
name: multi-agent-research-pipeline
description: "Use when the user wants to execute a full research project using a multi-agent architecture — from literature review and computational modeling to simulation, data analysis, clinical trial design, and paper/grant writing. v2.0 adds three brain-inspired upgrades on top of v1.0: (1) an independent Monitor/Validator (Agent 7) inspired by the ACC role in Webb et al. 2025 MAP architecture, providing per-handoff verification with feedback-driven retry; (2) a Judge LLM that selects among multiple candidate syntheses from Agent 5 (inspired by Villa et al. 2025 Arkangel AI's 5-LLM pipeline); (3) an INSUFFICIENT_EVIDENCE refusal protocol enforced across all agents to suppress fabrication. Orchestrates 7 specialized sub-agents + 1 Judge in a 4-stage pipeline. Depends on: academic-paper-review, arxiv, execute_code, delegate_task."
version: 2.0.0
author: OWL + Kwota
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [research, multi-agent, pipeline, computational-neuroscience, clinical-trial, paper-writing, grant-writing, orchestration, monitor, judge, refusal]
    related_skills: [academic-paper-review, arxiv, writing-plans, requesting-code-review]
    inspired_by:
      - "Webb, Mondal & Momennejad (2025). A brain-inspired agentic architecture to improve planning with LLMs. Nature Communications 16:8633. https://doi.org/10.1038/s41467-025-63804-5"
      - "Villa et al. (2025). Arkangel AI: A conversational agent for real-time, evidence-based medical question-answering. Intelligence-Based Medicine 12:100274. https://doi.org/10.1016/j.ibmed.2025.100274"
---

# Multi-Agent Research Pipeline (v2.0)

Execute a complete research project from idea to publication using a coordinated multi-agent architecture inspired by both lab-PI delegation patterns and prefrontal-cortex-style modular cognition.

> **v2.0 — What changed since v1.0**
> Three brain-inspired / evidence-based upgrades have been added. See full rationale in the **Changelog** at the end of this file.
> 1. **Agent 7 — Monitor/Validator** (ACC-inspired, Webb 2025). Sits between every handoff. Verifies invariants, emits typed feedback `ε`, sends upstream agent back for revision if checks fail.
> 2. **Judge LLM** (Arkangel 2025). Agent 5 now produces **2–3 candidate syntheses**; an independent Judge model (recommended: stronger long-CoT model) picks the strongest and annotates the weakest evidence link.
> 3. **Refusal protocol** — every agent is contractually allowed (and required) to emit `INSUFFICIENT_EVIDENCE` rather than fabricate when upstream inputs are inadequate.

## When to Use

- User has a research idea and wants systematic execution from modeling to publication
- Project requires computational modeling, simulation, data analysis, AND clinical validation
- User wants to generate both a research paper AND a grant proposal from the same pipeline
- Task is too complex for a single agent loop (5+ distinct expert roles needed)

**Don't use for:** Single-step tasks (just write a paper, just review a literature), purely clinical work without computational components, or when the user wants hands-on control of each step.

## Architecture Overview (v2.0)

```
╔══════════════════════════════════════════════════════════════════════╗
║                       ORCHESTRATOR (You)                             ║
║   Role: PI's chief assistant — coordinate, quality-check, report     ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               ║
║  │ Agent 1      │  │ Agent 2      │  │ Agent 3      │               ║
║  │ 計算神經科學  │→│ 模擬與建模    │→│ 資料分析     │                ║
║  │ (Stage 1)    │  │ (Stage 2)    │  │ (Stage 3)    │               ║
║  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               ║
║         ▼                  ▼                  ▼                       ║
║  ┌──────────────────────────────────────────────────┐                ║
║  │ Agent 7 — Monitor / Validator  (NEW in v2.0)     │                ║
║  │ Gates every handoff. Emits ε (typed feedback)    │                ║
║  │ Sends upstream agent back if invariants violated │                ║
║  └──────┬───────────────────────────────────────────┘                ║
║         │ pass                                                       ║
║  ┌──────▼───────┐  ┌──────────────┐                                 ║
║  │ Agent 6      │  │ Agent 4      │                                  ║
║  │ 文獻回顧     │  │ 臨床驗證     │                                   ║
║  │ (All Stages) │  │ (Stage 4)    │                                  ║
║  └──────────────┘  └──────┬───────┘                                 ║
║                           │                                          ║
║                    ┌──────▼───────┐    ┌────────────────────┐       ║
║                    │ Agent 5      │───→│ Judge LLM (NEW)    │       ║
║                    │ 產出 2–3 個   │    │ 評選最佳候選       │       ║
║                    │ 候選整合稿    │    │ 標出最弱證據鏈     │       ║
║                    └──────────────┘    └────────────────────┘       ║
║                                                                      ║
║  Every agent: must honor the INSUFFICIENT_EVIDENCE refusal protocol  ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Seven Agent Roles + Judge

| Agent | Role | Stage | Core Output | Suggested Model |
|-------|------|-------|-------------|------------------|
| **Agent 1** | Computational Neuroscientist | Stage 1 | Neural model + parameterization + testable hypotheses | Opus |
| **Agent 6** | Literature Gatekeeper | All stages | Literature review + methodology comparison + knowledge base | Haiku |
| **Agent 2** | Simulation & Modeling Expert | Stage 2 | In silico validation + parameter optimization + predictions | Sonnet |
| **Agent 3** | Data Analyst | Stage 3 | Retrospective analysis plan + EEG pipeline + patient stratification | Sonnet |
| **Agent 4** | Clinical Researcher | Stage 4 | Clinical trial protocol + IRB docs + safety monitoring | Opus |
| **Agent 5** | Synthesis & Writing Expert | Final | 2–3 candidate papers + 2–3 candidate grant drafts | Opus |
| **Agent 7** | Monitor / Validator (NEW) | Every handoff | Pass/fail verdict + typed feedback `ε` for revision | Haiku |
| **Judge** | Selector + Critic (NEW) | After Agent 5 | Pick best candidate + flag weakest evidence link | Opus (long CoT) |

### Four-Stage Pipeline (unchanged from v1.0, now with Monitor gates)

| Stage | Goal | Key Methods | Validation gate (Agent 7) |
|-------|------|-------------|--------------------------|
| **1. Foundations** | Build computational model of target neural circuits | Literature review → model selection → parameterization → hypotheses | Units consistent? Parameters in physiologic range? Hypotheses falsifiable? |
| **2. Simulation** | Validate hypotheses in silico | Parameter scanning → stimulation simulation → game-theoretic optimization | Convergence? Effect sizes plausible (Cohen's d ∈ [0.1, 2.0])? Code reproducible? |
| **3. Retrospective** | Find supporting evidence in existing data | EEG preprocessing → feature extraction → encoder estimation → statistics | Sample size matches power calc? No data leakage? Pre-registration noted? |
| **4. Prospective** | Validate in new clinical cases | Trial protocol → IRB → execution → analysis | CONSORT-compliant? DSMB charter present? Adverse event plan defined? |

## Refusal Protocol (NEW in v2.0, applies to ALL agents)

Every agent's context must include the following clause **verbatim**:

> "If the upstream inputs or available evidence are insufficient to support a defensible scientific conclusion, you MUST output the literal string `INSUFFICIENT_EVIDENCE` on its own line, followed by:
> - `missing_inputs:` a YAML list of the specific inputs you needed but did not receive
> - `confidence_floor:` your minimum-acceptable confidence level for this decision
> - `recommended_action:` either `retry_upstream`, `ask_human`, or `abort_stage`
>
> Do NOT fabricate parameter values, citations, p-values, or sample sizes to fill gaps. Do NOT silently lower your standards. Refusal here is a feature, not a failure."

**When Agent 7 (Monitor) sees `INSUFFICIENT_EVIDENCE`:**
1. Read the `missing_inputs` list
2. Route back to the agent that should provide those inputs (often A6 for citations, A1 for parameters, A2 for effect sizes)
3. Log the refusal event to `<project-dir>/refusal_log.jsonl` for later audit

## Execution Workflow

### Phase 0: Intake & Scoping (You, the Orchestrator)

Before spawning any agents, clarify with the user:

1. **Research domain** — What neural system / disease / intervention?
2. **Input materials** — Papers, datasets, protocols already available?
3. **Output goals** — Paper only? Grant? Clinical trial? All of the above?
4. **Resource constraints** — Time, compute, clinical access, budget?
5. **Prior work** — Existing models, preliminary data, pilot studies?
6. **(NEW) Risk tolerance** — How strict should the Monitor be? (default: strict; relax for exploratory pilots)

Save these decisions with `memory(action='add')` so future sessions maintain context.

### Phase 1: Spawn Agents 1 + 6 (Parallel)

These are independent and can run simultaneously:

```
delegate_task(
  tasks=[
    {
      goal: "Computational neuroscientist — build model, parameterize disease, generate hypotheses. Honor the INSUFFICIENT_EVIDENCE refusal protocol.",
      context: "[research domain + input materials + Agent 6's methodology recommendations + REFUSAL_PROTOCOL_CLAUSE]",
      toolsets: ["web", "terminal", "file"]
    },
    {
      goal: "Literature reviewer — systematic review, methodology comparison, knowledge base. Honor the INSUFFICIENT_EVIDENCE refusal protocol.",
      context: "[research domain + key papers provided by user + methodology focus areas + REFUSAL_PROTOCOL_CLAUSE]",
      toolsets: ["web", "terminal", "file"]
    }
  ]
)
```

**Agent 1** should produce:
- Model architecture with ODE/system equations
- Parameter tables (normal vs. disease states)
- EEG/clinical biomarker mappings
- 3-5 falsifiable hypotheses
- Implementation roadmap

**Agent 6** should produce:
- 15-25 key references with structured summaries
- Methodology comparison tables
- Method selection recommendations with rationale
- Citation list for the final paper

### Phase 1.5 (NEW): Monitor Gate — A1+A6 → A2

```
delegate_task(
  goal="Monitor / Validator — verify Agent 1 + Agent 6 outputs against handoff invariants. Emit pass/fail and typed feedback ε.",
  context="[Agent 1's outputs] + [Agent 6's outputs] + INVARIANTS_A1A6_TO_A2",
  toolsets: ["file"]
)
```

**Invariants A1+A6 → A2:**
- [ ] All parameter units are explicitly declared and consistent (e.g., mV vs V, ms vs s)
- [ ] At least 3 hypotheses are stated in "If X then Y because Z" form
- [ ] Every cited reference exists (cross-check via DOI or PubMed ID)
- [ ] Agent 6's method recommendations cover ≥80% of methods Agent 1 needs

**On failure:** Agent 7 returns `ε = {missing: [...], inconsistent: [...], action: "revise_A1" | "revise_A6"}` and the Orchestrator re-dispatches.

### Phase 2: Spawn Agent 2 (Sequential, depends on A1 + A6 + Monitor pass)

```
delegate_task(
  goal="Simulation expert — validate model, run parameter scans, optimize stimulation parameters. Honor the INSUFFICIENT_EVIDENCE refusal protocol.",
  context="[Agent 1's model architecture + parameters + hypotheses] + [Agent 6's methodology recommendations] + REFUSAL_PROTOCOL_CLAUSE",
  toolsets=["web", "terminal", "file"]
)
```

**Agent 2** should produce:
- Python simulation code (executable)
- Parameter scan results (severity × intervention intensity)
- Game-theoretic co-advergence analysis
- Optimal parameter recommendations
- 3-5 testable predictions with effect size estimates
- Publication-quality figures

**⚠️ Known Pitfall — Python Environment:**
On Windows, the system Python may be broken (`ImportError: cannot import name 'text_encoding' from 'io'`). Use:
```bash
# Fix uv environment pollution
rm -rf ~/AppData/Roaming/uv/python/cpython-3.11-windows-x86-64-none/

# Run with clean venv
cd /tmp && uv venv --python 3.12
uv pip install --python .venv/Scripts/python.exe numpy scipy matplotlib
.venv/Scripts/python.exe your_script.py
```

### Phase 2.5 (NEW): Monitor Gate — A2 → A3

**Invariants A2 → A3:**
- [ ] Simulation converged (final-step residual < pre-set threshold)
- [ ] Effect sizes Cohen's d ∈ [0.1, 2.0] (outside this range = suspicious; demand justification)
- [ ] Predictions explicitly numbered and each links to one hypothesis from A1
- [ ] Random seeds logged; results reproducible
- [ ] At least one sanity-check: known-result reproduction passes

**On failure:** Agent 7 routes back to A2 with `ε`; if A2 cannot satisfy after 1 retry, escalate to user.

### Phase 3: Spawn Agent 3 (Sequential, depends on A2 + Monitor pass)

```
delegate_task(
  goal="Data analyst — design retrospective analysis pipeline + patient stratification. Honor the INSUFFICIENT_EVIDENCE refusal protocol.",
  context="[Agent 2's simulation results + predictions] + [any available clinical data descriptions] + REFUSAL_PROTOCOL_CLAUSE",
  toolsets: ["file", "web"]
)
```

**Agent 3** should produce:
- Retrospective analysis protocol (inclusion/exclusion, data requirements)
- EEG analysis pipeline code (MNE-Python based)
- Patient stratification strategy (responder subgroups)
- Sample size estimation
- Prospective trial design recommendations

### Phase 3.5 (NEW): Monitor Gate — A3 → A4

**Invariants A3 → A4:**
- [ ] Sample size N matches power calculation derived from A2's effect sizes (no hand-waving)
- [ ] Inclusion/exclusion criteria specified at variable-level granularity
- [ ] No data leakage between train/test or between development and analysis cohorts
- [ ] Pre-registration plan stated (or explicit reason why not pre-registered)
- [ ] Stratification variables actually exist in the planned data source

### Phase 4: Spawn Agent 4 (Sequential, depends on A3 + Monitor pass)

```
delegate_task(
  goal="Clinical researcher — design complete clinical trial protocol. Honor the INSUFFICIENT_EVIDENCE refusal protocol.",
  context="[Agent 2's optimal parameters] + [Agent 3's analysis plan] + [target population] + REFUSAL_PROTOCOL_CLAUSE",
  toolsets: ["file", "web"]
)
```

**Agent 4** should produce:
- Full clinical trial protocol (CONSORT-compliant)
- Statistical analysis plan (SAP)
- DSMB charter and safety monitoring plan
- IRB application materials
- Informed consent form outline

**⚠️ Known Pitfall — Timeout on Large Tasks:**
Clinical trial protocols are large documents. If `delegate_task` times out (600s limit), **split into two parallel subtasks**:
1. Trial design + intervention protocol
2. Statistical analysis + safety monitoring + ethics

### Phase 4.5 (NEW): Monitor Gate — A4 → A5

**Invariants A4 → A5:**
- [ ] Every protocol parameter traceable to A2's simulation or A3's analysis (no orphan numbers)
- [ ] Adverse-event response plan present, with predefined stopping rules
- [ ] DSMB charter has independence clause
- [ ] Informed consent uses lay language (Flesch reading ease > 50 if measured)

### Phase 5 (UPGRADED in v2.0): Agent 5 produces multiple candidates → Judge selects

```
# Step 5a: Agent 5 generates 2–3 candidate syntheses with deliberately different narrative angles
delegate_task(
  tasks=[
    {
      goal="Write integrated research paper — CANDIDATE A: emphasize computational-mechanistic narrative (model → simulation → validation).",
      context="[All previous agents' outputs summarized] + REFUSAL_PROTOCOL_CLAUSE",
      toolsets: ["file", "web"]
    },
    {
      goal="Write integrated research paper — CANDIDATE B: emphasize clinical-translational narrative (clinical problem → mechanism → trial readiness).",
      context="[All previous agents' outputs summarized] + REFUSAL_PROTOCOL_CLAUSE",
      toolsets: ["file", "web"]
    },
    {
      goal="Write grant proposal — CANDIDATE A: NIH Specific Aims style.",
      context="[All previous agents' outputs] + REFUSAL_PROTOCOL_CLAUSE",
      toolsets: ["file"]
    },
    {
      goal="Write grant proposal — CANDIDATE B: NSFC style.",
      context="[All previous agents' outputs] + REFUSAL_PROTOCOL_CLAUSE",
      toolsets: ["file"]
    }
  ]
)

# Step 5b: Judge selects best paper and best grant, annotates weakest evidence
delegate_task(
  goal=(
    "Judge — read all candidate papers and grants. "
    "Pick the strongest of each. Briefly state why. "
    "Then identify the SINGLE weakest evidence chain in the winner and propose one revision. "
    "Use long chain-of-thought reasoning."
  ),
  context="[paths to all candidate files] + JUDGE_RUBRIC",
  toolsets: ["file"]
)
```

**JUDGE_RUBRIC** (include verbatim in Judge's context):

1. **Coherence** — does the story flow from question → method → result → implication without leaps?
2. **Evidence integrity** — every claim backed by either A2 simulation, A3 retrospective, or A4 prospective?
3. **Falsifiability** — are hypotheses still expressed in if-then-because form in the discussion?
4. **No fabrication** — every numeric value, p-value, and citation traceable to an upstream file
5. **Refusal honoring** — does the candidate avoid claims that would be `INSUFFICIENT_EVIDENCE`?

**Agent 5 (final) should produce, after Judge selection:**
- **Research paper (winner):** Abstract → Intro → Methods → Results → Discussion → Conclusion → References (30+ citations)
- **Grant proposal (winner):** Specific Aims → Significance → Innovation → Approach → Timeline → Expected Outcomes → Budget Justification
- **Judge report:** `judge_decision.md` — which candidate won, why, and the one revision recommended for the weakest evidence link

## Inter-Agent Data Flow (v2.0)

```
A1 (model params + hypotheses) ────→ A7 Monitor ────pass────→ A2
A6 (literature + methods) ──────────→ A7 Monitor ────pass────→ A2
A2 (predictions + effect sizes) ────→ A7 Monitor ────pass────→ A3
A3 (analysis plan) ─────────────────→ A7 Monitor ────pass────→ A4
A4 (trial protocol) ────────────────→ A7 Monitor ────pass────→ A5
A5 (2–3 candidates each) ───────────→ Judge ──────────────→  Winner
                                                  │
                                          ┌───────▼────────┐
                                          │ judge_decision │
                                          │ + winner.md    │
                                          └────────────────┘

Any agent at any stage can emit INSUFFICIENT_EVIDENCE,
which the Orchestrator routes back to whichever upstream agent
owns the missing input.
```

**Critical handoff points (unchanged from v1.0, now gated by Monitor):**
- A1 → A2: Model architecture file + parameter JSON + hypothesis list
- A6 → A2: Method selection recommendations + key references
- A2 → A3: Prediction list + optimal parameter ranges + effect sizes
- A2 + A3 → A4: Trial parameters + analysis plan + sample size estimate
- ALL → A5: Summary of all findings (A5 reads outputs via `read_file`)

## Output File Convention (v2.0)

All agents write to a shared project directory:

```
<project-dir>/
├── agent1_modeling_report.md          # Computational model
├── agent6_literature_review.md        # Literature review
├── agent2_simulation_report.md        # Simulation results
├── agent2_simulation_code.py          # Executable simulation code
├── simulation_results.json            # Raw simulation data
├── figures/                           # Generated charts
│   ├── fig1_spectra_and_heatmap.png
│   └── fig2_game_theory.png
├── agent3_analysis_report.md          # Data analysis plan
├── agent3_analysis_pipeline.py        # Analysis code skeleton
├── agent4_clinical_trial_protocol.md  # Trial protocol
├── agent4_statistical_safety_plan.md  # SAP + safety + ethics
├── agent5_paper_candidate_A.md        # NEW — multiple drafts
├── agent5_paper_candidate_B.md        # NEW
├── agent5_grant_candidate_A.md        # NEW
├── agent5_grant_candidate_B.md        # NEW
├── judge_decision.md                  # NEW — Judge's selection + critique
├── agent5_research_paper_final.md     # Winner
├── agent5_grant_proposal_final.md     # Winner
├── monitor_log.jsonl                  # NEW — every gate decision + ε
└── refusal_log.jsonl                  # NEW — every INSUFFICIENT_EVIDENCE event
```

## Quality Control Checklist (v2.0)

After all agents complete, verify:

- [ ] **Model validity:** Does A1's model reproduce known disease biomarkers from literature?
- [ ] **Simulation convergence:** Did A2's simulations converge? Are predictions in plausible ranges?
- [ ] **Methodological consistency:** Do A3's analysis methods align with A2's predictions?
- [ ] **Clinical feasibility:** Are A4's trial parameters safe and ethically sound?
- [ ] **Narrative coherence:** Does winner paper tell a consistent story from model → simulation → validation?
- [ ] **Citation integrity:** Are all A6 references actually used in winner paper? No fabricated citations.
- [ ] **Data integrity:** Do A3's stated sample sizes match power calculations from A2's effect sizes?
- [ ] **Parameter traceability:** Can every number in A4's protocol be traced back to A2's simulations?
- [ ] **(NEW) Monitor log clean:** All gate decisions recorded; no silent fall-throughs.
- [ ] **(NEW) Refusal honored:** Every `INSUFFICIENT_EVIDENCE` event was either resolved upstream or escalated, never overridden.
- [ ] **(NEW) Judge rationale:** `judge_decision.md` explains why the winner won and names the weakest evidence link.

## Common Pitfalls and Fixes

### 1. delegate_task Timeout (600s limit)
**Symptom:** Agent starts but doesn't finish before timeout.
**Fix:** Split large tasks into 2-3 smaller parallel subtasks. For example, instead of one "write trial protocol" task, split into "trial design + intervention" and "statistics + safety + ethics" as parallel tasks.

### 2. Python Environment Pollution (Windows)
**Symptom:** `ImportError: cannot import name 'text_encoding' from 'io'` even with `uv run`.
**Cause:** uv's Python 3.11 installation is corrupted and poisons all `uv run` environments.
**Fix:**
```bash
rm -rf ~/AppData/Roaming/uv/python/cpython-3.11-windows-x86_64-none/
cd /tmp && uv venv --python 3.12
uv pip install --python .venv/Scripts/python.exe numpy scipy matplotlib
```

### 3. Subagent Can't Access Previous Outputs
**Symptom:** A3 says "I don't have A2's simulation results."
**Fix:** Pass file paths explicitly in the `context` field. Subagents can read files with `read_file` but have NO memory of the parent conversation. Always include absolute paths.

### 4. Inconsistent Units Across Agents
**Symptom:** A1 uses mV for parameters but A2 uses V/m for electric fields.
**Fix:** Define a standard unit convention in the Orchestrator's initial briefing and repeat it in each agent's context. **In v2.0, the Monitor catches this at Phase 1.5.**

### 5. A5 Paper Lacks Narrative Thread
**Symptom:** Paper reads like 5 disconnected reports stapled together.
**Fix (v2.0):** The Judge step explicitly scores coherence (Rubric #1). Candidates that fail this lose, forcing A5 to internalize narrative integrity.

### 6. Literature Review Doesn't Connect to Modeling
**Symptom:** A6 produces generic review irrelevant to A1's specific model.
**Fix:** Give A6 explicit search terms derived from A1's model components (e.g., "neural mass model for [specific disease]" not just "EEG review"). **Monitor at Phase 1.5 enforces ≥80% method coverage.**

### 7. Grant Proposal Lacks Specific Aims Structure
**Symptom:** A5's grant looks like a paper abstract stretched longer.
**Fix:** Instruct A5 to follow the NIH/NSFC Specific Aims format strictly. **The Judge picks the candidate that actually follows the format.**

### 8. (NEW) Monitor becomes a rubber stamp
**Symptom:** Agent 7 passes everything; ε is always empty.
**Cause:** Invariants written too loosely.
**Fix:** Make each invariant *numerically* or *structurally* testable (no "looks reasonable"). The invariant lists above are templates — tighten them to your project.

### 9. (NEW) Judge picks the verbose candidate, not the best
**Symptom:** Judge consistently selects longer drafts.
**Fix:** Add an explicit anti-length rule to JUDGE_RUBRIC: "Length is not a virtue. If candidates are within ±20% length, prefer the one with stronger evidence integrity."

### 10. (NEW) Refusal cascade — pipeline halts because every agent refuses
**Symptom:** A2 refuses because A1 was thin; A3 refuses because A2 refused; nothing ships.
**Fix:** When a refusal cascade is detected (≥2 consecutive refusals), the Orchestrator stops the pipeline and asks the human user to provide the missing input directly. This is by design: better stop than fabricate.

## Verification Commands

After pipeline completion, run these sanity checks:

```bash
# Count total output
ls -la <project-dir>/agent*.md | wc -l        # Should be 9+ files in v2.0
wc -l <project-dir>/agent*.md                  # Total line count

# Check for fabricated data (red flags)
grep -r "p < 0.001" <project-dir>/             # Unusually low p-values
grep -r "Cohen's d = [0-9]" <project-dir>/     # Verify effect sizes are internally consistent

# (NEW) Audit Monitor and Refusal logs
wc -l <project-dir>/monitor_log.jsonl          # Should be >= 4 (one per gate)
wc -l <project-dir>/refusal_log.jsonl          # Should be 0 in a clean run; review each entry otherwise
cat <project-dir>/judge_decision.md            # Read why the winner won
```

## One-Shot Recipe: Quick-Start Template

When the user provides 2+ papers and says "build a research plan around these":

1. Extract papers with `web_extract` → save to project dir
2. Read `skill_view(name='academic-paper-review')` for analysis framework
3. Analyze papers with the skill's methodology
4. Launch this multi-agent pipeline with the papers as input
5. Monitor progress, fix blockers, verify outputs (and consult `monitor_log.jsonl` + `refusal_log.jsonl`)
6. Deliver consolidated report including `judge_decision.md` to user

## Related Skills

- `academic-paper-review` — Deep analysis of individual papers (use for input papers before pipeline)
- `arxiv` — Search for relevant preprints (use in Agent 1 & 6's context)
- `writing-plans` — Alternative for simpler planning tasks
- `requesting-code-review` — Code quality check for Agent 2's simulation code

---

## Changelog

### v2.0.0 (2026-06-06) — Brain-inspired Monitor + Judge + Refusal upgrade

Motivated by analysis of two 2025 agentic-AI papers:

1. **Webb, Mondal & Momennejad (2025), *Nat Commun* 16:8633 — Modular Agentic Planner (MAP).**
   Their ablation showed the **Monitor module (ACC-inspired)** was the single most important component of the pipeline; removing it caused invalid-action rate to jump from 0% to 31%. v1.0 of this skill only had a static end-of-pipeline checklist. **v2.0 adds Agent 7** as an in-line, per-handoff verifier with typed feedback `ε` and revision routing, directly inspired by the ProposeAction → Monitor loop.

2. **Villa et al. (2025), *Intell-Based Med* 12:100274 — Arkangel AI.**
   They demonstrated that adding (a) an **LLM-as-Judge** (their LLM5 = GPT-o1) to choose among multiple candidate answers and (b) forcing the system to **abstain** when evidence is insufficient improved MedQA accuracy by a measured +6% (p<0.05, 95%CI non-overlapping). **v2.0 adopts both:** Agent 5 now produces multiple candidates and a Judge picks the winner; the **INSUFFICIENT_EVIDENCE refusal protocol** is mandated for every agent.

### v1.0.0 (initial) — Six agents, four stages, sequential pipeline with end-of-pipeline checklist.

---

## Future Work (P1 / P2 backlog — not yet in this version)

The following upgrades were identified during the v1.0 → v2.0 review but deferred:

- **Query Router (Phase 0.5)** — auto-select sub-pipelines based on user task type (computational-heavy / clinical-only / literature-only / methods-replication).
- **Few-shot ICL examples per agent** — bundle ≤3 mini-exemplars per role in an `examples/` directory.
- **Cost-aware model assignment table** — first-class field in the skill, not just a suggestion.
- **Tree-search at Stage 2** — let A2 sample B parameter sets, have Predictor/Evaluator pick the best (full MAP-style Predictor + Evaluator).

These will land in v2.1+.
