# Faculty Ablation Exemplar (v2.4)

Opt-in mode that runs the pipeline **twice** to quantify a faculty's causal contribution. Direct analog of MiCRo §5.2 expert ablations (which showed removing the Logic expert caused large drops on MATH and GSM8K, while removing the Social expert sometimes IMPROVED math performance).

---

## When to enable

```yaml
faculty_ablation:
  enabled: true
  ablate_one_of: social         # or world / logic / language
  metric_for_delta: alignment_score
```

- Recommended cadence: **1 ablation run per ~5–10 production runs** on a representative project.
- Skip for: tight cost budgets, single-shot deadline runs.

**Cost:** approximately 2× a normal run.

---

## Procedure

```
Step 1: Run pipeline normally    → output_full/
Step 2: Run pipeline with the named faculty's steering set to "suppress"
        EVERYWHERE in the Phase Schedule + Agent × Faculty matrix
                                  → output_ablated_<faculty>/
Step 3: Score both via Alignment Scoreboard (v2.4 §5)
Step 4: Compute Δ per metric and total
Step 5: Write ablation_delta_report.md
```

---

## Mini Case A — ablating Social on a methods-replication pipeline

Hypothesis going in: Social steering is unnecessary on a pure replication task. Ablation should give Δ ≈ 0 or slightly negative (i.e., turning Social off may actually help).

```yaml
ablation_run:
  faculty_ablated: social
  pipeline_mode: methods_rep
  paired_runs:
    - output_full/
    - output_ablated_social/

scoreboard_results:
  metric                  | full | ablated | Δ
  ─────────────────────── | ──── | ─────── | ────
  Calibration             | 0.85 | 0.86    | +0.01
  Hedging quality         | 0.78 | 0.81    | +0.03
  Balanced consideration  | 0.72 | 0.65    | -0.07
  Uncertainty disclosure  | 0.90 | 0.91    | +0.01
  Perspective range       | 0.55 | 0.40    | -0.15
  Falsifiability          | 0.88 | 0.88    | 0.00
  Throughline coherence   | 0.81 | 0.83    | +0.02
  Equity grounding        | 0.40 | 0.10    | -0.30   ← expected; Social was carrying equity
  ─────────────────────── | ──── | ─────── | ────
  TOTAL                   | 5.89 | 5.44    | -0.45

interpretation: |
  For methods replication, ablating Social hurt total score by 0.45.
  Most of that came from Equity grounding (-0.30) and Perspective range (-0.15).
  Even on a "purely technical" task, Social was carrying weight.
  Decision: KEEP Social at medium for methods_rep pipelines.
```

This is the kind of result that updates your default Phase Schedule.

---

## Mini Case B — ablating Social on Agent 2 numerical sim only (already suppressed)

To test a more targeted ablation: ablate Social at A2 only, leave it elsewhere.

```yaml
ablation_run:
  faculty_ablated: social
  scope: agent2_only
  hypothesis: "Social was already suppressed at A2 per default schedule; Δ should be ~0"

scoreboard_results:
  TOTAL  full=5.89  ablated=5.91  Δ=+0.02

interpretation: |
  Δ ≈ 0, confirming that the default v2.4 schedule (Social=SUPPRESS at A2) was already
  correct. No change recommended.
```

This is what "the default is calibrated" looks like.

---

## Mini Case C — ablating World on the Reflector

```yaml
ablation_run:
  faculty_ablated: world
  scope: agent8_only
  hypothesis: "Reflector's role is DMN-style integration; ablating World should hurt long-horizon implications most"

scoreboard_results:
  Throughline coherence       full=0.81  ablated=0.62  Δ=-0.19   ← big hit
  Balanced consideration      full=0.72  ablated=0.68  Δ=-0.04
  Equity grounding            full=0.40  ablated=0.40   Δ= 0.00
  ...
  TOTAL                       full=5.89  ablated=5.40   Δ=-0.49

interpretation: |
  Confirms Reflector's value is exactly where MiCRo would predict — long-horizon throughline.
  Without World steering, the Reflector reverts to a section-by-section critic, losing the
  "3-months-later integrated read" effect.
```

---

## Output schema — `ablation_delta_report.md`

```markdown
# Faculty Ablation Report

**Run ID:** 2026-06-06_run_42
**Faculty ablated:** Social
**Scope:** all phases
**Pipeline mode:** full

## Δ-table

| Metric | Full | Ablated | Δ | Direction |
|--------|------|---------|---|-----------|
| Calibration            | 0.85 | 0.86 | +0.01 | neutral |
| Hedging quality        | 0.78 | 0.81 | +0.03 | neutral |
| Balanced consideration | 0.72 | 0.65 | -0.07 | hurt by ablation |
| Uncertainty disclosure | 0.90 | 0.91 | +0.01 | neutral |
| Perspective range      | 0.55 | 0.40 | -0.15 | hurt by ablation |
| Falsifiability         | 0.88 | 0.88 |  0.00 | neutral |
| Throughline coherence  | 0.81 | 0.83 | +0.02 | neutral |
| Equity grounding       | 0.40 | 0.10 | -0.30 | hurt by ablation |
| **TOTAL**              | 5.89 | 5.44 | **-0.45** | Social contributing |

## Interpretation

Social faculty is causally contributing ~0.45 to the total alignment score for this pipeline
mode. Largest contributions are to Equity grounding and Perspective range.

## Recommendation

KEEP Social at currently scheduled intensities. Do not generalize the v2.4 default (Social
suppress at A2 sim) to other phases.

## Caveat

Single paired-run Δ has noise. For quantitative reporting, repeat ≥3 paired runs and report
mean ± SE (Pitfall #28 in v2.4 skill).
```

---

## How to interpret Δ

| Δ | Meaning | Action |
|---|---------|--------|
| Δ < −0.3 | Faculty is heavily contributing | Keep current schedule, possibly increase intensity |
| −0.3 < Δ < −0.05 | Faculty is contributing | Keep current schedule |
| −0.05 < Δ < +0.05 | Faculty is approximately neutral | Consider suppressing to save cost |
| +0.05 < Δ < +0.15 | Faculty is slightly hurting | Suppress this faculty for this scope |
| Δ > +0.15 | Faculty is actively hurting | Suppress everywhere; investigate why steering was wrong |
