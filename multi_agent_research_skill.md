---
name: multi-agent-research-pipeline
description: "Use when the user wants to execute a full research project using a multi-agent architecture — from literature review and computational modeling to simulation, data analysis, clinical trial design, and paper/grant writing. Orchestrates 6 specialized sub-agents (Computational Modeler, Literature Reviewer, Simulation Expert, Data Analyst, Clinical Researcher, Synthesis Writer) in a 4-stage pipeline. Covers the complete lifecycle: Stage 1 (Computational Neuroscience foundations) → Stage 2 (Simulation & prediction) → Stage 3 (Retrospective data analysis) → Stage 4 (Prospective clinical validation), culminating in research papers and grant proposals. Depends on: academic-paper-review, arxiv, execute_code, delegate_task."
version: 1.0.0
author: OWL + Kwota
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [research, multi-agent, pipeline, computational-neuroscience, clinical-trial, paper-writing, grant-writing, orchestration]
    related_skills: [academic-paper-review, arxiv, writing-plans, requesting-code-review]
---

# Multi-Agent Research Pipeline

Execute a complete research project from idea to publication using a coordinated multi-agent architecture inspired by lab-PI delegation patterns.

## When to Use

- User has a research idea and wants systematic execution from modeling to publication
- Project requires computational modeling, simulation, data analysis, AND clinical validation
- User wants to generate both a research paper AND a grant proposal from the same pipeline
- Task is too complex for a single agent loop (5+ distinct expert roles needed)

**Don't use for:** Single-step tasks (just write a paper, just review a literature), purely clinical work without computational components, or when the user wants hands-on control of each step.

## Architecture Overview

```
╔════════════════════════════════════════════════════════════════════╗
║                    ORCHESTRATOR (You)                              ║
║  Role: PI's chief assistant — coordinate, quality-check, report    ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            ║
║  │ Agent 1      │  │ Agent 2      │  │ Agent 3      │            ║
║  │ 計算神經科學  │→│ 模擬與建模   │→│ 資料分析     │            ║
║  │ (Stage 1)    │  │ (Stage 2)    │  │ (Stage 3)    │            ║
║  └──────────────┘  └──────────────┘  └──────┬───────┘            ║
║                                              │                    ║
║  ┌──────────────┐  ┌──────────────┐         │                    ║
║  │ Agent 6      │  │ Agent 4      │←────────┘                    ║
║  │ 文獻回顧     │  │ 臨床驗證     │                              ║
║  │ (All Stages) │  │ (Stage 4)    │                              ║
║  └──────────────┘  └──────┬───────┘                              ║
║                           │                                     ║
║                    ┌──────▼───────┐                              ║
║                    │ Agent 5      │                              ║
║                    │ 整合與發表    │                              ║
║                    └──────────────┘                              ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

### Six Agent Roles

| Agent | Role | Stage | Core Output |
|-------|------|-------|-------------|
| **Agent 1** | Computational Neuroscientist | Stage 1 | Neural model + parameterization + testable hypotheses |
| **Agent 6** | Literature Gatekeeper | All stages | Literature review + methodology comparison + knowledge base |
| **Agent 2** | Simulation & Modeling Expert | Stage 2 | In silico validation + parameter optimization + predictions |
| **Agent 3** | Data Analyst | Stage 3 | Retrospective analysis plan + EEG pipeline + patient stratification |
| **Agent 4** | Clinical Researcher | Stage 4 | Clinical trial protocol + IRB docs + safety monitoring |
| **Agent 5** | Synthesis & Writing Expert | Final | Research paper + grant proposal |

### Four-Stage Pipeline

| Stage | Goal | Key Methods | Validation |
|-------|------|-------------|------------|
| **1. Foundations** | Build computational model of target neural circuits | Literature review → model selection → parameterization → hypotheses | Model reproduces known disease biomarkers |
| **2. Simulation** | Validate hypotheses in silico | Parameter scanning → stimulation simulation → game-theoretic optimization | Predictions match known literature effects |
| **3. Retrospective** | Find supporting evidence in existing data | EEG preprocessing → feature extraction → encoder estimation → statistics | Model predictions correlate with clinical observations |
| **4. Prospective** | Validate in new clinical cases | Trial protocol → IRB → execution → analysis | Primary endpoint meets prespecified criteria |

## Execution Workflow

### Phase 0: Intake & Scoping (You, the Orchestrator)

Before spawning any agents, clarify with the user:

1. **Research domain** — What neural system / disease / intervention?
2. **Input materials** — Papers, datasets, protocols already available?
3. **Output goals** — Paper only? Grant? Clinical trial? All of the above?
4. **Resource constraints** — Time, compute, clinical access, budget?
5. **Prior work** — Existing models, preliminary data, pilot studies?

Save these decisions with `memory(action='add')` so future sessions maintain context.

### Phase 1: Spawn Agents 1 + 6 (Parallel)

These are independent and can run simultaneously:

```
delegate_task(
  tasks=[
    {
      goal: "Computational neuroscientist — build model, parameterize disease, generate hypotheses",
      context: "[research domain + input materials + Agent 6's methodology recommendations]",
      toolsets: ["web", "terminal", "file"]
    },
    {
      goal: "Literature reviewer — systematic review, methodology comparison, knowledge base",
      context: "[research domain + key papers provided by user + methodology focus areas]",
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

### Phase 2: Spawn Agent 2 (Sequential, depends on A1 + A6)

```
delegate_task(
  goal="Simulation expert — validate model, run parameter scans, optimize stimulation parameters",
  context="[Agent 1's model architecture + parameters + hypotheses] + [Agent 6's methodology recommendations]",
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

### Phase 3: Spawn Agent 3 (Sequential, depends on A2)

```
delegate_task(
  goal="Data analyst — design retrospective analysis pipeline + patient stratification",
  context="[Agent 2's simulation results + predictions] + [any available clinical data descriptions]",
  toolsets=["file", "web"]
)
```

**Agent 3** should produce:
- Retrospective analysis protocol (inclusion/exclusion, data requirements)
- EEG analysis pipeline code (MNE-Python based)
- Patient stratification strategy (responder subgroups)
- Sample size estimation
- Prospective trial design recommendations

### Phase 4: Spawn Agent 4 (Sequential, depends on A3)

```
delegate_task(
  goal="Clinical researcher — design complete clinical trial protocol",
  context="[Agent 2's optimal parameters] + [Agent 3's analysis plan] + [target population]",
  toolsets=["file", "web"]
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

### Phase 5: Spawn Agent 5 (Sequential, depends on ALL previous agents)

```
delegate_task(
  tasks=[
    {
      goal="Write integrated research paper (traditional Chinese)",
      context="[All previous agents' outputs summarized]",
      toolsets: ["file", "web"]
    },
    {
      goal="Write grant proposal core sections",
      context="[All previous agents' outputs + target funding agency style]",
      toolsets: ["file"]
    }
  ]
)
```

**Agent 5** should produce:
- **Research paper:** Abstract → Intro → Methods → Results → Discussion → Conclusion → References (30+ citations)
- **Grant proposal:** Specific Aims → Significance → Innovation → Approach → Timeline → Expected Outcomes → Budget Justification

## Inter-Agent Data Flow

```
Agent 1 (model params + hypotheses) ──→ Agent 2 (simulates + validates)
Agent 6 (literature + methods) ──────→ Agent 2 (guides simulation design)
Agent 2 (predictions + effect sizes) ─→ Agent 3 (designs analysis to test predictions)
Agent 2 + Agent 3 ───────────────────→ Agent 4 (designs trial based on optimal params)
ALL agents ───────────────────────────→ Agent 5 (integrates into paper + grant)
```

**Critical handoff points:**
- A1 → A2: Model architecture file + parameter JSON + hypothesis list
- A6 → A2: Method selection recommendations + key references
- A2 → A3: Prediction list + optimal parameter ranges + effect sizes
- A2 + A3 → A4: Trial parameters + analysis plan + sample size estimate
- ALL → A5: Summary of all findings (A5 reads outputs via `read_file`)

## Output File Convention

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
├── agent5_research_paper.md          # Research paper draft
└── agent5_grant_proposal.md          # Grant proposal
```

## Quality Control Checklist

After all agents complete, verify:

- [ ] **Model validity:** Does A1's model reproduce known disease biomarkers from literature?
- [ ] **Simulation convergence:** Did A2's simulations converge? Are predictions in plausible ranges?
- [ ] **Methodological consistency:** Do A3's analysis methods align with A2's predictions?
- [ ] **Clinical feasibility:** Are A4's trial parameters safe and ethically sound?
- [ ] **Narrative coherence:** Does A5's paper tell a consistent story from model → simulation → validation?
- [ ] **Citation integrity:** Are all A6 references actually used in A5's paper? No fabricated citations.
- [ ] **Data integrity:** Do A3's stated sample sizes match power calculations from A2's effect sizes?
- [ ] **Parameter traceability:** Can every number in A4's protocol be traced back to A2's simulations?

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
**Fix:** Define a standard unit convention in the Orchestrator's initial briefing and repeat it in each agent's context.

### 5. A5 Paper Lacks Narrative Thread
**Symptom:** Paper reads like 5 disconnected reports stapled together.
**Fix:** Give A5 an explicit "story arc" in the context: "The narrative should flow from computational prediction (A1,A2) → retrospective validation (A3) → prospective validation (A4), with each stage motivated by questions raised in the previous stage."

### 6. Literature Review Doesn't Connect to Modeling
**Symptom:** A6 produces generic review irrelevant to A1's specific model.
**Fix:** Give A6 explicit search terms derived from A1's model components (e.g., "neural mass model for [specific disease]" not just "EEG review").

### 7. Grant Proposal Lacks Specific Aims Structure
**Symptom:** A5's grant looks like a paper abstract stretched longer.
**Fix:** Instruct A5 to follow the NIH/NSFC Specific Aims format strictly: 1 page, 3 aims, each with 2-3 hypotheses, approach, and expected outcome.

## Verification Commands

After pipeline completion, run these sanity checks:

```bash
# Count total output
ls -la <project-dir>/agent*.md | wc -l  # Should be 7+ files
wc -l <project-dir>/agent*.md            # Total line count

# Check for fabricated data (red flags)
grep -r "p < 0.001" <project-dir>/       # Unusually low p-values
grep -r "Cohen's d = [0-9]" <project-dir>/  # Verify effect sizes are internally consistent
```

## One-Shot Recipe: Quick-Start Template

When the user provides 2+ papers and says "build a research plan around these":

1. Extract papers with `web_extract` → save to project dir
2. Read `skill_view(name='academic-paper-review')` for analysis framework
3. Analyze papers with the skill's methodology
4. Launch this multi-agent pipeline with the papers as input
5. Monitor progress, fix blockers, verify outputs
6. Deliver consolidated report to user

## Related Skills

- `academic-paper-review` — Deep analysis of individual papers (use for input papers before pipeline)
- `arxiv` — Search for relevant preprints (use in Agent 1 & 6's context)
- `writing-plans` — Alternative for simpler planning tasks
- `requesting-code-review` — Code quality check for Agent 2's simulation code
