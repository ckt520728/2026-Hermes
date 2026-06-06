# Agent 2 Exemplar — Simulation Expert

Schema for the simulation report. Note v2.1 includes the **internal tree-search log**.

## Mini Case A — search log entry (one branch)

```json
{
  "branch_id": 1,
  "theta": {"g_EE": 0.95, "g_IE": 0.50, "tau_E": 12.0},
  "monitor_passed": true,
  "coarse_sim": {
    "alpha_power": 0.42,
    "convergence_residual": 1.2e-4,
    "runtime_s": 8.1
  },
  "evaluator_scores": {
    "literature_consistency": 0.71,
    "effect_size_plausibility": 0.83,
    "numerical_stability": 0.95
  },
  "composite_score": 0.77
}
```

## Mini Case B — figure caption skeleton

> **Figure `[N]`.** Parameter scan over `[g_EE × g_IE]`. Color encodes `[alpha-power change vs baseline]`. The winning branch from the v2.1 inner tree search is marked with `[★]`. Cohen's *d* = `[x.x]` (95% CI `[y, z]`). N = `[X]` parameter combinations explored.

## Mini Case C — predictions block

```
Prediction P1: Under intervention I at intensity i*, biomarker B will shift by Δ = [x ± SE], Cohen's d = [d].
  Tied to hypothesis: H1
  Effect-size source: branch [winner_id] full simulation
  Reproducibility: seed = [n], code at [path]

Prediction P2: ...
```

## Mini Case D — INSUFFICIENT_EVIDENCE example

If all B=3 branches fail Monitor's physiologic-bounds check:

```
INSUFFICIENT_EVIDENCE
missing_inputs:
  - tighter uncertainty bounds Δθ from Agent 1
  - or revised central parameters θ*
confidence_floor: 0.7
recommended_action: retry_upstream
```
