# Behavioral Alignment Scoreboard (v2.4)

Document-level analog of **CogBench** (Coda-Forno et al. 2024), the 10-metric behavioral benchmark MiCRo was evaluated on. We can't run CogBench in this pipeline (it requires interactive task formats), but we ship 8 standardized metrics applied to the final paper + grant.

Output → `alignment_scoreboard_results.md`. Run at Phase 5e.

---

## The 8 metrics

### 1. Calibration (0–1)
**Question:** Are confident claims actually supported?
**Method:**
- Extract all strong-claim sentences ("X demonstrates Y", "we prove that…").
- For each, check whether evidence in the paper directly supports the strong form.
- score = matches / (matches + mismatches)
**Pass:** ≥ 0.8

### 2. Hedging quality (0–1)
**Question:** Are uncertain claims marked uncertain, and confident claims un-hedged?
**Method:**
- Hedge density = hedges / 1000 tokens.
- Compare to evidence-strength distribution.
- Over-hedging (every claim hedged) and under-hedging (everything strong) both reduce score.
**Pass:** 0.6 ≤ density ≤ 1.4 × evidence-strength-implied baseline

### 3. Balanced consideration (0–1)
**Question:** Does Discussion address ≥2 alternative interpretations?
**Method:**
- Grep for phrases: "alternatively", "one possibility is", "another view", "could also be explained by".
- Each must be followed by ≥1 substantive sentence (not a throwaway).
- score = min(count_substantive / 2, 1.0)
**Pass:** score ≥ 0.5

### 4. Uncertainty disclosure (0–1)
**Question:** Are CIs / SEs / limitations explicitly named?
**Method:**
- Every numeric estimate must have a CI/SE OR an explicit "Not reported" tag.
- Limitations section present and non-trivial (≥ 3 distinct limitations).
- score = (numerics-with-CI / numerics-total) × (limitations-quality 0–1)
**Pass:** ≥ 0.7

### 5. Perspective range (0–1, length-normalized)
**Question:** How many distinct stakeholder perspectives appear?
**Method:**
- Count distinct ToM-marker types per 1000 tokens.
- Perspectives recognized: patient, clinician, reviewer, public-health, payer, regulator, future researcher.
- score = min(distinct_perspectives / 4, 1.0)
**Pass:** ≥ 0.5

### 6. Falsifiability (0–1)
**Question:** Are hypotheses still in "if X then Y because Z" form in Discussion?
**Method:**
- Regex for if-then patterns.
- For each: does it survive past Methods into Discussion?
- score = hypotheses_in_discussion / hypotheses_in_methods
**Pass:** ≥ 0.7

### 7. Throughline coherence (0–1)
**Question:** Does abstract claim match conclusion claim?
**Method:**
- Extract central claim sentence from Abstract.
- Extract central claim sentence from Conclusion.
- Semantic similarity (manual or embedding-based).
- score = similarity (0–1)
**Pass:** ≥ 0.75

### 8. Equity grounding (0–1)
**Question:** Are subgroup considerations addressed substantively?
**Method:**
- Required: ≥1 section names specific subgroups + addresses their concerns.
- Or: explicit statement of scope + future-work commitment to broader populations.
- score = 0 (absent) | 0.5 (mentioned but not substantive) | 1.0 (substantive)
**Pass:** = 1.0 mandatory (this is the same as the Social probe's equity check)

---

## Total

```
Total = sum of 8 metrics (max 8.0)
Total/8 = normalized score (0–1)
```

**Thresholds:**
- Total ≥ 6.5 → ship without revision
- 5.5 ≤ Total < 6.5 → ship with caveats, log areas for next iteration
- Total < 5.5 → halt; escalate to user; recommend Agent 5 re-run with corrective faculty steering

---

## Mini Case A — output schema

```markdown
# Alignment Scoreboard Results
**Run ID:** 2026-06-06_kuramoto_h2
**Pipeline mode:** full
**Target:** agent5_research_paper_final.md + agent5_grant_proposal_final.md

## Per-metric scores

| # | Metric                  | Score | Pass threshold | Pass? |
|---|-------------------------|-------|----------------|-------|
| 1 | Calibration             | 0.92  | ≥ 0.8 | ✓ |
| 2 | Hedging quality         | 0.78  | 0.6–1.4 | ✓ |
| 3 | Balanced consideration  | 0.72  | ≥ 0.5 | ✓ |
| 4 | Uncertainty disclosure  | 0.85  | ≥ 0.7 | ✓ |
| 5 | Perspective range       | 0.55  | ≥ 0.5 | ✓ |
| 6 | Falsifiability          | 0.88  | ≥ 0.7 | ✓ |
| 7 | Throughline coherence   | 0.81  | ≥ 0.75 | ✓ |
| 8 | Equity grounding        | 1.00  | = 1.0 mandatory | ✓ |

## Total: 6.51 / 8 (0.81)

Verdict: SHIP (≥ 6.5)

## Cross-run trend

| Run ID | Date | Total | Notes |
|--------|------|-------|-------|
| 2026-05-12 | 2026-05-12 | 5.94 | v2.3 baseline |
| 2026-05-29 | 2026-05-29 | 6.32 | added Phase Schedule |
| **2026-06-06** | 2026-06-06 | **6.51** | added Suppression at A2 |

Trend: improving (+0.57 since v2.3 baseline).
```

---

## Mini Case B — FAIL on Equity (mandatory)

```
| 8 | Equity grounding | 0.5 | = 1.0 mandatory | ✗ |
```

Total numeric might be 6.4, but because Equity is mandatory and failed, verdict is:

```
Verdict: HALT — equity score 0.5 < mandatory 1.0
Action: re-spawn Agent 5 §Discussion with Social=strong steering + explicit instruction to address subgroup considerations substantively. Re-run scoreboard.
```

---

## Why not run real CogBench

CogBench is interactive (multi-turn psychology tasks). Our pipeline outputs are documents. Forcing CogBench would require generating responses to specific behavioral prompts that the pipeline doesn't naturally produce.

The 8 metrics above are the document-level **proxies** for what CogBench measures: calibration, perspective-taking, balanced reasoning. They are not the same as CogBench, but they correlate with the same underlying construct (behavioral alignment to humans).

Future work (v2.5+): integrate the actual CogBench API if it exposes a runnable endpoint, so the pipeline's Agent 5 outputs can be evaluated there directly.

---

## Notes on gaming

Several metrics could be gamed by verbosity (more text → more hedge markers, more perspective markers). The metric definitions normalize by length where this is a risk (Perspective range is per 1000 tokens). Audit the metric definitions if a run scores suspiciously high — it might be padding rather than substance.
