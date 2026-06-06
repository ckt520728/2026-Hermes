# Multi-Faculty Ablation Exemplar (v2.5)

v2.4 ablated one faculty at a time. v2.5 adds a 2×2 factorial mode that measures:
- **main effect of Faculty A**
- **main effect of Faculty B**
- **interaction Faculty A × Faculty B**

Direct analog of MiCRo's multi-expert ablations in §5.2 (where removing Logic + Social was distinct from removing either alone).

## Configuration

```yaml
faculty_ablation:
  enabled: true
  mode: factorial_2x2
  factorial_pair: [social, world]
  metric_for_delta: alignment_score
```

## Procedure

4 paired runs:

| Run | Social | World | Output |
|-----|--------|-------|--------|
| R1  | on     | on    | output_full (baseline) |
| R2  | suppress | on  | output_ablated_social |
| R3  | on     | suppress | output_ablated_world |
| R4  | suppress | suppress | output_ablated_both |

Score each via Alignment Scoreboard. Compute:

```
Main effect Social
  = mean of (R1 − R2) and (R3 − R4)
  = ((R1 − R2) + (R3 − R4)) / 2

Main effect World
  = mean of (R1 − R3) and (R2 − R4)
  = ((R1 − R3) + (R2 − R4)) / 2

Interaction Social × World
  = ((R1 − R2) − (R3 − R4)) / 2
  = (R1 + R4 − R2 − R3) / 2
```

## Mini Case A — synergistic interaction

Result:

| Run | Total alignment score |
|-----|------------------------|
| R1 (on, on)      | 6.51 |
| R2 (off, on)     | 5.94 |
| R3 (on, off)     | 6.10 |
| R4 (off, off)    | 4.80 |

Computing:

```
Main Social = ((6.51 − 5.94) + (6.10 − 4.80)) / 2 = (0.57 + 1.30) / 2 = 0.935
Main World  = ((6.51 − 6.10) + (5.94 − 4.80)) / 2 = (0.41 + 1.14) / 2 = 0.775
Interaction = (6.51 + 4.80 − 5.94 − 6.10) / 2     = (11.31 − 12.04) / 2 = −0.365
```

### Interpretation

| Metric | Value | Meaning |
|--------|-------|---------|
| Main Social | +0.94 | Social independently contributes |
| Main World | +0.78 | World independently contributes |
| Interaction | −0.37 | Social and World partially OVERLAP — together they contribute less than the sum of their individual contributions |

`R1 − R4 = 6.51 − 4.80 = 1.71` is the joint contribution.
`Main Social + Main World = 0.94 + 0.78 = 1.72` would be the additive prediction.
Observed joint (1.71) < additive prediction (1.72) → slight redundancy.

### Decision

Both faculties needed (each main effect significant), but moderate redundancy. **Keep both, but consider lowering one's intensity** if cost is a concern.

---

## Mini Case B — independent (additive) effects

```
R1: 6.51,  R2: 5.94,  R3: 5.97,  R4: 5.40

Main Social = ((6.51 − 5.94) + (5.97 − 5.40)) / 2 = 0.57
Main World  = ((6.51 − 5.97) + (5.94 − 5.40)) / 2 = 0.54
Interaction = (6.51 + 5.40 − 5.94 − 5.97) / 2     = 0.00
```

Interpretation: Social and World contribute independently. No redundancy. Keep both at current intensities.

---

## Mini Case C — synergistic (1+1>2) effects

```
R1: 6.51,  R2: 5.94,  R3: 5.97,  R4: 5.50

Main Social = ((6.51 − 5.94) + (5.97 − 5.50)) / 2 = 0.52
Main World  = ((6.51 − 5.97) + (5.94 − 5.50)) / 2 = 0.49
Interaction = (6.51 + 5.50 − 5.94 − 5.97) / 2     = +0.05
```

Slight synergy. The pair contributes ~0.10 more than the additive sum (1.10 vs 1.01).

Interpretation: World and Social interact positively — World engagement makes Social engagement more effective (perhaps because long-horizon discourse provides scaffold for ToM reasoning). Keep both; consider boosting if individually lower would be unstable.

---

## Mini Case D — redundant (1+1<1.5) — disable one

```
R1: 6.51,  R2: 6.45,  R3: 6.40,  R4: 5.40

Main Social = ((6.51 − 6.45) + (6.40 − 5.40)) / 2 = 0.53
Main World  = ((6.51 − 6.40) + (6.45 − 5.40)) / 2 = 0.58
Interaction = (6.51 + 5.40 − 6.45 − 6.40) / 2     = −0.47
```

Strong negative interaction. Either Social alone (R2=6.45) or World alone (R3=6.40) is nearly as good as both (R1=6.51). Total cost of both >> single-faculty cost.

Interpretation: REDUNDANT. Pick the cheaper-to-engage faculty and suppress the other.

---

## Output schema — `factorial_ablation_results.md`

```markdown
# 2×2 Factorial Ablation Report

**Run ID:** 2026-06-06_run_42
**Faculty pair:** Social × World
**Pipeline mode:** full

## Cell results

| Run | Social | World | Alignment total |
|-----|--------|-------|-----------------|
| R1  | on     | on    | 6.51 |
| R2  | off    | on    | 5.94 |
| R3  | on     | off   | 5.97 |
| R4  | off    | off   | 5.40 |

## Main effects

| Effect | Estimate |
|--------|----------|
| Main Social | +0.57 |
| Main World  | +0.54 |
| Interaction Social × World | 0.00 |

## Interpretation

Social and World are INDEPENDENT (additive). Both contributing. No redundancy, no synergy.

## Recommendation

Keep both at current intensities. No schedule change.

## Caveat

Single 2×2 (4 paired runs) is noisy. For confidence intervals, repeat ≥3 times (12 runs total).
```

---

## Cost

- Single ablation (v2.4): 2× normal run
- Factorial 2×2 (v2.5): 4× normal run

Recommended cadence: once per project after ~10 production runs, to confirm faculty configuration is non-redundant.

---

## When to use

| Scenario | Mode |
|----------|------|
| Quick "is faculty X contributing?" check | `single` (v2.4) |
| "Are faculties X and Y independent or redundant?" | `factorial_2x2` (v2.5) |
| Production cost matters | `single` or skip |
| First-time evaluation of a complex pipeline | `factorial_2x2` |
| Tight deadline | skip ablation entirely |
