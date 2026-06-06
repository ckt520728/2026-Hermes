# Few-shot Exemplars for `multi-agent-research-pipeline` (v2.1+)

This directory ships with the skill and provides **schema exemplars** (not style templates) for each agent in the pipeline.

## Why schema, not style

If you put a real, polished paragraph here, the agent will copy your prose voice instead of producing original work. We deliberately use placeholders like `[concept]`, `[number ± SE]`, `[citation key]` so the agent learns the **structure** of a good output without inheriting the author's voice.

## File index

| File | Used by | What it shows |
|------|---------|---------------|
| `router_examples.md` | Phase 0.5 Router | 4 input → classification mappings, including 1 edge case |
| `agent1_example.md` | Agent 1 (Computational) | Skeleton of a neural-mass-model spec entry |
| `agent2_example.md` | Agent 2 (Simulation) | Parameter scan + figure-caption skeleton |
| `agent3_example.md` | Agent 3 (Data Analyst) | Inclusion/exclusion + power-calc skeleton |
| `agent4_example.md` | Agent 4 (Clinical) | One CONSORT-style protocol paragraph skeleton |
| `agent5_example.md` | Agent 5 (Synthesis) | Abstract structure + Specific Aims structure |
| `agent6_example.md` | Agent 6 (Literature) | Structured literature entry schema |
| `agent7_monitor_example.md` | Agent 7 (Monitor) | One pass example + one fail-with-ε example |
| `judge_example.md` | Judge (single, v2.0/v2.1) | Decision report with weakest-evidence callout |
| `monitor_strictness_example.md` | Agent 7 (Monitor, v2.2) | Invariant catalog tagged by `min_level`; override flow |
| `router_memory_example.md` | Router (v2.2) | `router_memory.jsonl` schema + Jaccard matching |
| `judge_ensemble_example.md` | Judge ensemble (v2.2) | Agreement / disagreement / user-declined cases |
| `cost_log_example.md` | Orchestrator (v2.2) | `cost_log.jsonl` schema + summary + budget-halt |
| `cognitive_faculty_steering.md` | All agents (v2.3) | 12 steering snippets (4 faculties × 3 intensities) |
| `cognitive_probes/` | QC at Phase 5c (v2.3) | 4 fMRI-localizer-style probes (Language / Logic / Social / World) |
| `agent8_reflector_example.md` | Agent 8 — Reflector (v2.3) | DMN-style "3-months-later" reflective read of the winner |
| `domain_priming_example.md` | Phase 0.75 (v2.3, opt-in) | MiCRo curriculum analog: 3 mini-cases per agent before real pipeline |
| `faculty_phase_schedule.md` | Orchestrator (v2.4) | (Phase × Faculty) intensity matrix — MiCRo layer-hierarchy analog |
| `faculty_flow_example.md` | Orchestrator (v2.4) | `faculty_flow.jsonl` schema; detects faculty death at handoffs |
| `faculty_ablation_example.md` | Orchestrator (v2.4, opt-in) | Paired-run protocol to quantify faculty causal contribution |
| `faculty_suppression_snippets.md` | All agents (v2.4) | Anti-steering snippets when a faculty should be OFF |
| `alignment_scoreboard.md` | Phase 5e (v2.4) | 8-metric CogBench-analog scored at end-of-run |
| `handoff_repair_example.md` | Orchestrator (v2.5) | Auto-respawn consumer on faculty death; modes `auto / suggest / log_only` |
| `project_calibration_example.md` | Orchestrator (v2.5) | Per-project schedule overrides learned from Flow / Repair history |
| `multi_faculty_ablation_example.md` | Orchestrator (v2.5, opt-in) | 2×2 factorial ablation; main effects + interaction |
| `continuous_intensity_example.md` | All agents (v2.5) | Continuous 0–1 intensity with 5-level snippet bucket map |
| `topographic_locality_example.md` | Phase 5e (v2.5) | Scoreboard metric #9 — Binhuraib 2025 inspired spatial-compactness check |

## How the Orchestrator uses these

```python
context = (
    f"<task-specific brief for {agent}>\n\n"
    "FEW_SHOT_EXEMPLARS:\n"
    + read_file(f"examples/{agent}_example.md")
    + "\n\n"
    + REFUSAL_PROTOCOL_CLAUSE
)
```

Webb et al. (2025) used ≤3 in-context examples per MAP module. Adding a 4th gave diminishing returns. Keep each exemplar file to **≤3 mini cases**.

## Editing rules

1. **No real prose.** Use placeholders `[like_this]`.
2. **Show the structure**, not the answer.
3. **Keep ≤3 cases per file.**
4. **Include 1 edge case** where possible (e.g., a `INSUFFICIENT_EVIDENCE` example for any agent that might refuse).
