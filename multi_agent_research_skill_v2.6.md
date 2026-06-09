---
name: multi-agent-research-pipeline
description: "Use when the user wants to execute a research project using a multi-agent architecture. v2.6 upgrades v2.5 from proposal-grade synthesis to an AI Scientist-style executable discovery loop: every important claim must be backed by a runnable experiment, machine-readable output, figure, evidence ledger, or explicitly labeled hypothesis. Adds seven required artifacts: experiment.py, plot.py, run_0/final_info.json, raw/derived data schemas, expected-vs-observed claim typing, evidence-bound report writing, and an independent reproducibility judge. Depends on: academic-paper-review, arxiv, execute_code, delegate_task."
version: 2.6.0
author: OWL + Kwota
license: MIT
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [research, multi-agent, pipeline, ai-scientist, executable-discovery, reproducibility, claim-ledger, evidence-audit]
    related_skills: [academic-paper-review, arxiv, writing-plans, requesting-code-review]
    inspired_by:
      - "Sakana AI Scientist: executable template loop with experiment.py, plot.py, baseline run, paper generation, and review."
      - "Webb, Mondal & Momennejad (2025). Nat Commun 16:8633. MAP architecture."
      - "Villa et al. (2025). Intell-Based Med 12:100274. Arkangel AI."
      - "Alkhamissi et al. (2026). ICLR. Mixture of Cognitive Reasoners (MiCRo)."
      - "Binhuraib et al. (2025). Topoformer."
  model_assignment:
    router:              haiku
    agent1_compute:      opus
    agent6_lit:          haiku
    agent2_sim:          sonnet
    agent2_search:       haiku
    agent3_data:         sonnet
    agent4_clinical:     opus
    agent5_synthesis:    opus
    agent7_monitor:      haiku
    agent8_reflector:    opus
    agent9_reproducible: sonnet
    judge_a:             opus
    judge_b:             opus
  ai_scientist_mode:
    enabled: true
    required_artifacts:
      - experiment.py
      - plot.py
      - prompt.json
      - seed_ideas.json
      - run_0/final_info.json
      - results/claim_ledger.csv
      - reports/evidence_bound_report.md
    execution_policy:
      run_llm_written_code: isolated_only
      allow_host_execution: false
      require_container_or_sandbox: true
    claim_policy:
      default_claim_type: hypothesis
      forbid_unbacked_observed_results: true
      require_claim_ledger: true
      require_output_path_for_numeric_claims: true
  monitor_strictness:
    phase_1.5:  3
    phase_2.2:  3
    phase_2.6:  4
    phase_3.5:  5
    phase_4.5:  5
    phase_5e:   5
    phase_6:    5
  cognitive_faculties:
    enabled: true
    faculties: [language, logic, social, world]
    steering_dir: examples/cognitive_faculty_steering.md
    probes_dir: examples/cognitive_probes/
    phase_schedule_file: examples/faculty_phase_schedule.md
    flow_tracking_file: faculty_flow.jsonl
    suppression_enabled: true
    suppression_snippets_file: examples/faculty_suppression_snippets.md
    intensity_mode: continuous
  handoff_repair:
    mode: auto
    max_repairs_per_handoff: 1
    repair_budget_fraction: 0.15
  project_calibration:
    enabled: true
    project_id: <set_at_phase_0>
    calibration_file: project_faculty_calibration.yaml
    min_runs_before_override: 3
  faculty_ablation:
    enabled: false
    mode: factorial_2x2
    factorial_pair: [social, world]
    metric_for_delta: reproducibility_score
  alignment_scoreboard:
    enabled: true
    rubric_file: examples/alignment_scoreboard.md
    output_file: alignment_scoreboard_results.md
    include_topographic_locality: true
    include_reproducibility_gate: true
  schemas:
    executable_template: examples/executable_discovery_template.md
    claim_ledger: examples/claim_ledger_example.md
    run_output_contract: examples/run_output_contract_example.md
  domain_priming:
    enabled: false
    cases_per_agent: 3
  stage2_routing:
    mode: top1
  cost_budget_usd: null
  router_memory_file: router_memory.jsonl
  cost_telemetry_file: cost_log.jsonl
---

# Multi-Agent Research Pipeline (v2.6)

v2.6 changes the default standard from **proposal synthesis** to **AI Scientist-style executable discovery**.

The pipeline may still generate research hypotheses, protocols, and manuscripts, but it must not present a generated analysis as a completed empirical result unless the repository contains the runnable code, the run output, and the evidence ledger that support that claim.

## What Changed Since v2.5

v2.5 made the Cognitive Faculty Layer self-correcting and project-adaptive. v2.6 keeps those features and adds seven execution-grade requirements:

1. **`experiment.py`** — executable experiment or analysis entrypoint.
2. **`plot.py`** — figure generation from run outputs.
3. **`run_0/final_info.json`** — baseline result for comparison.
4. **Raw / derived data schema** — document what data exists, what is synthetic, and what is unavailable.
5. **Expected vs. observed claim typing** — every conclusion is labeled as `observed`, `derived`, `simulated`, `literature`, `hypothesis`, or `unsupported`.
6. **Evidence-bound report** — the final report can only cite numbers that appear in run outputs or the claim ledger.
7. **Independent reproducibility judge** — an agent checks file existence, command reruns, output hashes, figure generation, and claim traceability.

## When to Use

Use v2.6 when the user wants any of the following:

- turn a research idea into an auditable computational project;
- evaluate whether a previous multi-agent result is real evidence or high-quality hypothesis generation;
- run literature-grounded hypothesis generation plus executable analysis;
- create a paper-style report whose claims can be traced to code, data, and output files;
- build a Sakana AI Scientist-like workflow for biomedical, neuroscience, psychology, or clinical research.

Do not use v2.6 for a pure writing task unless the user explicitly wants the output to be evidence-audited. Use a lighter writing skill instead.

## Core Rule

**No output path, no observed claim.**

If a claim has no source artifact, it must be downgraded:

| Claim type | Meaning | Allowed language |
|---|---|---|
| `observed` | Directly computed from available data by this run | "we observed", "analysis showed" |
| `derived` | Calculated from observed outputs or cited source data | "derived estimate", "computed from" |
| `simulated` | Produced from synthetic or simulated data | "simulation suggests" |
| `literature` | Supported by retrievable source | "prior work reports" |
| `hypothesis` | Mechanistic proposal or next-step idea | "we hypothesize", "candidate mechanism" |
| `unsupported` | Mentioned but not currently supported | "not supported in this run" |

Numeric claims require `artifact_path`, `metric_name`, and `extraction_rule` in `results/claim_ledger.csv`.

## Architecture Overview (v2.6)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ORCHESTRATOR                                             ║
║                                                                              ║
║  Phase 0       Intake + evidence boundary                                    ║
║  Phase 0.5     Router + project template decision                            ║
║  Phase 1       Literature + source audit                                     ║
║  Phase 2       Hypothesis generation + novelty check                         ║
║  Phase 3       Executable template build                                     ║
║  Phase 4       Baseline run + candidate runs                                 ║
║  Phase 5       Analysis, plotting, claim ledger                              ║
║  Phase 5e      Alignment + reproducibility scoreboard                        ║
║  Phase 6       Evidence-bound report + independent review                    ║
║                                                                              ║
║  Hard gate: report cannot finalize until claim ledger passes.                ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## Required Project Layout

Every v2.6 project must create or verify this structure:

```text
<project-dir>/
├── README.md
├── prompt.json
├── seed_ideas.json
├── experiment.py
├── plot.py
├── data/
│   ├── README.md
│   ├── raw_schema.json
│   ├── derived_schema.json
│   └── synthetic/                 # allowed when real data is unavailable
├── run_0/
│   ├── final_info.json
│   ├── metrics.json
│   └── logs/
├── runs/
│   └── <idea_id>/
│       ├── final_info.json
│       ├── metrics.json
│       └── logs/
├── figures/
│   └── <generated figures>
├── results/
│   ├── claim_ledger.csv
│   ├── evidence_audit.md
│   ├── reproducibility_report.md
│   └── scoreboard.json
└── reports/
    ├── evidence_bound_report.md
    └── reviewer_report.md
```

If real data is not available, the project may still proceed, but every output from synthetic data must be labeled `simulated`, not `observed`.

## The Seven Required Work Items

### 1. Build `experiment.py`

`experiment.py` is the single executable entrypoint for analysis or simulation.

It must:

- accept `--data`, `--out_dir`, `--config`, and `--seed`;
- write `metrics.json` and `final_info.json`;
- record software versions and random seed;
- fail loudly if required real data is missing;
- support `--synthetic` only when synthetic outputs are explicitly labeled.

Minimum command:

```bash
python experiment.py --data data/ --out_dir run_0 --config prompt.json --seed 20260609
```

For clinical or human-subject data, `experiment.py` must not assume raw data is present. If the data is unavailable, it should create a `DATA_UNAVAILABLE` result and optionally run a synthetic demonstration.

### 2. Build `plot.py`

`plot.py` converts run outputs into figures.

It must:

- read from `run_0/` or `runs/<idea_id>/`;
- write only to `figures/`;
- write `figures/figure_manifest.json`;
- fail if required metrics are missing;
- never invent values not present in `metrics.json` or `final_info.json`.

Minimum command:

```bash
python plot.py --run_dir run_0 --out_dir figures
```

### 3. Create `run_0/final_info.json`

`run_0` is the baseline. It is not optional.

`final_info.json` must include:

```json
{
  "run_id": "run_0",
  "run_type": "baseline",
  "data_mode": "real | synthetic | unavailable",
  "status": "success | failed | data_unavailable",
  "primary_metrics": {},
  "secondary_metrics": {},
  "claimable_results": [],
  "limitations": [],
  "created_at": "ISO-8601 timestamp",
  "software": {},
  "random_seed": 20260609
}
```

Any downstream report must cite this file when describing baseline results.

### 4. Define Raw and Derived Data Schemas

Create:

- `data/raw_schema.json`
- `data/derived_schema.json`
- `data/README.md`

The schema must distinguish:

| Field | Meaning |
|---|---|
| `available` | file exists locally and may be analyzed |
| `restricted` | known to exist but not accessible in this run |
| `synthetic` | generated demonstration data |
| `literature_only` | summarized from sources; not analyzable raw data |
| `missing` | needed but absent |

For biomedical or clinical projects, write de-identification, IRB, and data-governance notes before any analysis code runs.

### 5. Separate Expected Results from Observed Results

Each agent must maintain `results/claim_ledger.csv`.

Required columns:

```csv
claim_id,claim_text,claim_type,source_agent,artifact_path,metric_name,extraction_rule,evidence_strength,limitations,allowed_report_language
```

Rules:

- A3 may write `observed` only if the metric exists in `metrics.json` or `final_info.json`.
- A2 may write `simulated` only if generated from `experiment.py --synthetic` or documented simulation code.
- A1 may write `hypothesis` for computational mechanisms not yet fitted.
- A5 must not upgrade a claim type.
- Judge B must downgrade any claim without artifact support.

### 6. Write an Evidence-Bound Report

`reports/evidence_bound_report.md` replaces free-form final reports.

Every key claim must include:

```text
[claim_id: C-001 | type: observed | artifact: run_0/final_info.json]
```

Forbidden language unless the claim is `observed` or `derived`:

- "we found"
- "analysis showed"
- "HDDM confirmed"
- "EEG predicted"
- "intervention corrected"
- "trial demonstrated"

Use these replacements:

| If claim type is | Use |
|---|---|
| `simulated` | "simulation suggests" |
| `literature` | "prior work reports" |
| `hypothesis` | "we hypothesize" |
| `unsupported` | "not supported by current artifacts" |

### 7. Run Independent Reproducibility Judge

Agent 9 / Judge B performs a reproducibility audit before finalization.

It must check:

- required files exist;
- `experiment.py` runs or fails with an expected `DATA_UNAVAILABLE` status;
- `plot.py` creates `figure_manifest.json`;
- `run_0/final_info.json` is valid JSON;
- `claim_ledger.csv` has no numeric observed claim without artifact support;
- every `observed` claim in the report points to a real artifact;
- report language matches claim type;
- unsupported claims are downgraded, not hidden.

Output:

```text
results/reproducibility_report.md
results/scoreboard.json
```

## Agent Responsibilities

### Agent 1 — Computational Modeler

Output:

- model specification;
- candidate mechanisms;
- required input variables;
- falsification criteria;
- `hypothesis` claims only unless a model is actually fitted by `experiment.py`.

Agent 1 must not report fitted parameters unless they are read from run outputs.

### Agent 2 — Simulation Expert

Output:

- simulation plan;
- synthetic data generator if real data is absent;
- power analysis script only if executable;
- `simulated` claims linked to output files.

Agent 2 must write assumptions into `metrics.json` or `final_info.json`.

### Agent 3 — Data Analyst

Output:

- executable analysis plan;
- raw / derived schema;
- `experiment.py` implementation or patch;
- analysis outputs.

Agent 3 is the only agent allowed to promote a result to `observed`, and only after artifact verification.

### Agent 4 — Clinical / Translational Researcher

Output:

- protocol draft;
- IRB / safety / data-governance checklist;
- clinical endpoint table;
- feasibility and risk labels.

Agent 4 must keep protocol claims separate from completed evidence.

### Agent 5 — Synthesis Writer

Output:

- `reports/evidence_bound_report.md`;
- abstract with claim types preserved;
- limitations tied to unsupported or hypothesis-level claims.

Agent 5 cannot upgrade claim strength.

### Agent 6 — Literature Gatekeeper

Output:

- source table;
- retrievable citation list;
- novelty check;
- claim entries labeled `literature`.

Agent 6 must distinguish primary source evidence from NotebookLM or agent synthesis.

### Agent 7 — Monitor

Output:

- phase gate checks;
- cost telemetry;
- faculty flow checks;
- evidence-boundary warnings.

Agent 7 stops the run if any agent writes an observed claim without an artifact.

### Agent 8 — Reflector / Adversarial Reviewer

Output:

- hidden assumptions;
- alternative explanations;
- falsification tests;
- downgrade recommendations.

Agent 8 should actively search for "beautiful but unsupported" conclusions.

### Agent 9 — Reproducibility Judge

Output:

- rerun log;
- artifact existence audit;
- claim ledger audit;
- report-language audit;
- final pass/fail.

Agent 9 is independent from Agent 5 and must not edit the report directly; it returns required fixes.

## Phase Gates

### Phase 0 — Intake and Evidence Boundary

Define:

- research objective;
- available data;
- restricted or missing data;
- acceptable evidence;
- whether code execution is allowed;
- whether synthetic data is allowed.

Output: `README.md`, `prompt.json`.

Hard gate: if the user asks for clinical or human-subject analysis, data governance must be written before analysis.

### Phase 1 — Literature and Source Audit

Agent 6 builds a source table:

```text
source_id | title | type | direct_evidence | limitations | usable_claim_type
```

NotebookLM summaries are allowed as orientation, but not as raw empirical evidence unless the cited underlying source is named.

Output: `results/evidence_audit.md`.

### Phase 2 — Idea Generation and Novelty Check

Generate multiple ideas and write `seed_ideas.json`.

Each idea must include:

- hypothesis;
- expected observable;
- required data;
- baseline comparator;
- failure mode;
- novelty status;
- claim type allowed before execution.

### Phase 3 — Executable Template Build

Create or update:

- `experiment.py`;
- `plot.py`;
- `data/raw_schema.json`;
- `data/derived_schema.json`;
- `run_0/` placeholder.

Hard gate: do not continue to report writing until the template exists.

### Phase 4 — Baseline and Candidate Runs

Run baseline first:

```bash
python experiment.py --data data/ --out_dir run_0 --config prompt.json --seed 20260609
python plot.py --run_dir run_0 --out_dir figures
```

If real data is unavailable, the baseline must state `data_mode: unavailable` or `synthetic`. This is a valid result, but it cannot support empirical claims.

Candidate ideas may run under `runs/<idea_id>/`.

### Phase 5 — Claim Ledger and Analysis

Build `results/claim_ledger.csv` from actual outputs.

Every row must be audit-ready. Weak or missing evidence is kept visible.

### Phase 5e — Scoreboard

The v2.5 9-metric Alignment Scoreboard remains active, but v2.6 adds a hard reproducibility gate:

| Metric | Pass threshold |
|---|---|
| Required artifact completeness | 1.00 |
| Observed claim traceability | 1.00 |
| Numeric claim extraction | 1.00 |
| Figure reproducibility | >= 0.90 |
| Unsupported claim downgrading | 1.00 |

If any hard metric fails, the output is a proposal draft, not an AI Scientist result.

### Phase 6 — Evidence-Bound Report and Review

Agent 5 writes the report. Agent 9 audits it. Agent 5 revises only after audit.

Final report status must be one of:

| Status | Meaning |
|---|---|
| `AI_SCIENTIST_PASS` | executable loop ran and claims are traceable |
| `PROPOSAL_ONLY` | good hypothesis/protocol, but no empirical execution |
| `DATA_UNAVAILABLE` | project scaffold built; real data absent |
| `FAILED_REPRODUCIBILITY` | claims or outputs failed audit |

## Output Files Added in v2.6

```text
<project-dir>/
├── prompt.json
├── seed_ideas.json
├── experiment.py
├── plot.py
├── data/
│   ├── README.md
│   ├── raw_schema.json
│   └── derived_schema.json
├── run_0/
│   ├── final_info.json
│   └── metrics.json
├── figures/
│   └── figure_manifest.json
├── results/
│   ├── claim_ledger.csv
│   ├── evidence_audit.md
│   ├── reproducibility_report.md
│   └── scoreboard.json
└── reports/
    └── evidence_bound_report.md
```

## Quality Control Checklist (v2.6)

- [ ] `experiment.py` exists and accepts `--data`, `--out_dir`, `--config`, `--seed`.
- [ ] `plot.py` exists and writes `figure_manifest.json`.
- [ ] `run_0/final_info.json` exists and is valid JSON.
- [ ] `data/raw_schema.json` and `data/derived_schema.json` exist.
- [ ] `results/claim_ledger.csv` exists and includes all key claims.
- [ ] Every numeric observed claim has `artifact_path` and `metric_name`.
- [ ] Every unsupported or future-facing claim is labeled `hypothesis` or `unsupported`.
- [ ] Final report uses evidence-bound claim tags.
- [ ] Agent 9 reproducibility report exists.
- [ ] If code execution was skipped, final status is not `AI_SCIENTIST_PASS`.

## Common Pitfalls (v2.6)

### 37. Proposal language leaks into results language

**Symptom:** Report says "HDDM confirmed z bias" although no HDDM code ran.

**Fix:** Downgrade to: "HDDM z bias is the next executable test." Claim type: `hypothesis`.

### 38. NotebookLM synthesis is treated as raw evidence

**Symptom:** A NotebookLM answer is cited as if it were the underlying paper or dataset.

**Fix:** Cite the underlying source title. If no underlying source is retrievable, claim type is `literature` only when the source is named, otherwise `unsupported`.

### 39. Synthetic data accidentally supports empirical conclusions

**Symptom:** A synthetic demo produces a significant p value and the report says "we found".

**Fix:** All synthetic outputs are `simulated`; use "simulation suggests".

### 40. Empty figures directory passes the writing phase

**Symptom:** Report describes figures but no files exist.

**Fix:** Agent 9 checks `figures/figure_manifest.json`; missing figure = failed reproducibility.

### 41. Baseline is skipped

**Symptom:** Candidate idea results exist, but no `run_0`.

**Fix:** Stop. Create baseline first. Candidate comparisons are invalid without baseline.

### 42. Agent 5 upgrades weak claims

**Symptom:** A5 turns "candidate mechanism" into "mechanism established".

**Fix:** A5 can only preserve or downgrade claim type. Judge B rejects any upgrade.

## Verification Commands

```bash
# Baseline execution
python experiment.py --data data/ --out_dir run_0 --config prompt.json --seed 20260609

# Figure generation
python plot.py --run_dir run_0 --out_dir figures

# Required artifact check
python -m json.tool run_0/final_info.json
python -m json.tool figures/figure_manifest.json

# Claim ledger quick check
python - <<'PY'
import csv, pathlib
rows = list(csv.DictReader(open('results/claim_ledger.csv', encoding='utf-8')))
bad = [r for r in rows if r['claim_type'] == 'observed' and not pathlib.Path(r['artifact_path']).exists()]
print('bad_observed_claims=', len(bad))
if bad:
    raise SystemExit(1)
PY
```

## Related Skills

Use with:

- `ai-agent-research-automation` for research-agent evaluation standards;
- `data-analyzer` when structured data needs real analysis;
- `knowledge-base` when source material must be converted into auditable notes;
- `github:yeet` when publishing the updated skill or project artifacts.

---

## Changelog

### v2.6.0 (2026-06-09) — AI Scientist-style Executable Discovery Loop

Upgrades v2.5 from self-correcting proposal synthesis to executable, auditable research automation.

Added:

1. Required `experiment.py`.
2. Required `plot.py`.
3. Required `run_0/final_info.json`.
4. Required raw / derived data schemas.
5. Required expected-vs-observed claim typing.
6. Required evidence-bound report.
7. Required independent reproducibility judge.

The key behavior change is strict evidence discipline: an agent may generate hypotheses freely, but it may not present generated analyses as observed results without runnable artifacts and a claim ledger.

### v2.5.0 — Self-correcting + Project-adaptive Faculty Layer

### v2.4.0 — Schedule + Flow + Ablation + Suppression + Scoreboard

### v2.3.0 — Cognitive Faculty Layer + Reflector + Priming + Probes

### v2.2.0 — Adaptive Monitor + Memory + Ensemble + Self-consistency + Telemetry

### v2.1.0 — Router + Few-shot + Cost-aware + Tree Search

### v2.0.0 — Monitor + Judge + Refusal

### v1.0.0 — Six agents, four stages
