# Topographic Locality Exemplar (v2.5)

New Alignment Scoreboard metric (#9) inspired by **Binhuraib et al. 2025**, *Topoformer: brain-like topographic organization in transformer language models through spatial querying and reweighting* (arXiv 2510.18745), cited by MiCRo.

In biological brains, functionally similar units cluster spatially. Topoformer begins to instill this property in LMs. The pipeline analog: a faculty that engages in **contiguous phases** is more brain-like than one that fires sporadically across distant phases.

## Definition

For each faculty F, take the set of phases where F's intensity ≥ medium (0.60). Compute:

```
gaps_inside_F = number of NON-engaging phases that fall BETWEEN F's first and last engaging phase

locality(F) = 1 - (gaps_inside_F / total_possible_phases_between)
```

- locality = 1.0 → F engages contiguously (no gaps)
- locality = 0.5 → F engages with one gap of length equal to its run length
- locality → 0 → F is fragmented across the pipeline

## Mini Case A — high locality (good)

Pipeline phases (in order): 0.5, 0.75, 1, 1.5, 2, 2.3, 2.6, 3, 3.5, 4, 4.5, 5a, 5b, 5c, 5d, 5e

**Social faculty** engages at: phase_3 (medium), phase_4 (strong), phase_4.5 (strong), phase_5b_judge_b (strong), phase_5d (medium).

```
First engaging: phase_3
Last engaging:  phase_5d
Phases between (inclusive): {3, 3.5, 4, 4.5, 5a, 5b, 5c, 5d} = 8 phases
Engaging phases in between: {3, 4, 4.5, 5b, 5d} = 5 phases
Gaps:                      {3.5, 5a, 5c}        = 3 gaps

locality(social) = 1 - (3 / 8) = 0.625
```

This is acceptable — Social is mostly contiguous from phase 3 onward.

## Mini Case B — low locality (bad)

**Logic faculty** engages at: phase_1 (strong), phase_2 (strong), and then JUMP to phase_5d (medium).

```
First engaging: phase_1
Last engaging:  phase_5d
Phases between (inclusive): {1, 1.5, 2, 2.3, 2.6, 3, 3.5, 4, 4.5, 5a, 5b, 5c, 5d} = 13 phases
Engaging phases in between: {1, 2, 5d} = 3 phases
Gaps:                      {1.5, 2.3, 2.6, 3, 3.5, 4, 4.5, 5a, 5b, 5c} = 10 gaps

locality(logic) = 1 - (10 / 13) = 0.231
```

This is **fragmented** — Logic fires hard early, then silent for most of the pipeline, then re-emerges late. Suggests the Phase Schedule should keep Logic alive in the middle phases too (Logic at phase 3 / 4 / 5b is probably also useful but currently underweighted).

## Pitfall #35 — fresh introduction allowance

A faculty's FIRST appearance does not create a "gap" by definition. Equity / Social being absent in Phase 1 (numerical work) and introduced fresh at Phase 4 is INTENTIONAL, not fragmentation.

```python
def compute_locality(faculty, schedule):
    engaging_phases = [p for p in pipeline_phases if intensity(faculty, p) >= 0.60]
    if len(engaging_phases) < 2:
        return 1.0   # too few engagement points; locality undefined → assume max

    first = pipeline_phases.index(engaging_phases[0])
    last  = pipeline_phases.index(engaging_phases[-1])
    span  = last - first + 1
    in_span_engaging = sum(1 for p in pipeline_phases[first:last+1]
                            if intensity(faculty, p) >= 0.60)
    in_span_gaps = span - in_span_engaging
    return 1 - in_span_gaps / span
```

The function only counts gaps INSIDE the first-to-last engagement span. Phases BEFORE the first engagement (where the faculty hadn't yet been introduced) do NOT count against locality.

## Mini Case C — Social with fresh-introduction allowance

Social engages at phases 4, 4.5, 5b_judge_b, 5d.

```
Phases before first (1, 1.5, 2, 2.3, 2.6, 3, 3.5): NOT counted (fresh-intro allowance)
Span: 4 to 5d
In-span engaging: {4, 4.5, 5b_judge_b, 5d} = 4
In-span gaps:     {5a, 5c} = 2
locality(social) = 1 - 2/6 = 0.667
```

This is the typical Social pattern and scores 0.67 — acceptable.

## Output schema

`topographic_locality_per_faculty.json`:

```json
{
  "run_id": "2026-06-06_run_42",
  "per_faculty": {
    "language": {
      "engaging_phases": ["1", "1.5", "2", "3", "4", "5a", "5b_a", "5b_b", "5d"],
      "first_engage": "1",
      "last_engage": "5d",
      "in_span_gaps": 1,
      "locality": 0.93
    },
    "logic": {
      "engaging_phases": ["1", "2", "5d"],
      "first_engage": "1",
      "last_engage": "5d",
      "in_span_gaps": 10,
      "locality": 0.23,
      "warning": "Fragmented; consider increasing Logic intensity in phases 3, 4, 5a/b"
    },
    "social": {
      "engaging_phases": ["3", "4", "4.5", "5b_b", "5d"],
      "first_engage": "3",
      "last_engage": "5d",
      "in_span_gaps": 3,
      "locality": 0.63
    },
    "world": {
      "engaging_phases": ["0.75", "1", "1.5", "3", "5a", "5b_a", "5b_b", "5d"],
      "first_engage": "0.75",
      "last_engage": "5d",
      "in_span_gaps": 7,
      "locality": 0.43
    }
  },
  "mean_locality": 0.55,
  "min_locality": 0.23,
  "scoreboard_contribution": 0.55     # mean is what feeds into Scoreboard metric #9
}
```

## Pass threshold for Scoreboard

```yaml
metric_9_topographic_locality:
  pass_threshold: 0.6      # mean across 4 faculties
  per_faculty_minimum: 0.4 # any faculty below this triggers a WARN
```

## What to do when locality is low

| Pattern | Diagnosis | Remediation |
|---------|-----------|-------------|
| Locality < 0.4 for one faculty | Faculty is fragmented; Schedule has gaps | Adjust Phase Schedule to keep faculty engaged in intermediate phases |
| Locality < 0.4 for multiple faculties | Schedule overall too sparse | Increase default intensities globally; consider larger pipeline scope |
| Locality < 0.4 only in one project (calibration overrides cause it) | Calibration is fragmenting | Inspect calibration; consider pinning the problematic cells |

## Mini Case D — using locality to debug a low Alignment score

Run scoreboard total: 5.42 (FAIL, below 5.5 threshold).
Topographic Locality: 0.45 (FAIL, below 0.60).
Logic locality: 0.23.

```
Diagnosis: Logic dropped out between phase 2.6 and phase 5d, a 10-phase silent gap.
Hypothesis: phases 3 (A3 data analysis) and 4 (A4 clinical) needed Logic engagement
            that the Schedule isn't providing.
Action: bump Logic intensity at phase_3.A3 from 0.60 → 0.75 and phase_4.A4 from
        0.60 → 0.70. Re-run pipeline.
```

This is the kind of diagnostic Topographic Locality enables — fragmentation patterns reveal Schedule gaps.

## Connection to MiCRo

MiCRo found that **early layers favor Language, late layers favor Logic/Social/World** (their Fig. 13–14). That layer-wise gradient is itself a topographic organization. Our pipeline-phase analog: faculties should engage in spatially-coherent blocks, not scattered.

When MiCRo's `Topographic Locality` for an expert is low, it means the expert is being recruited too often by tokens that shouldn't need it — a sign of poor specialization. Our pipeline analog: low locality means faculty engagement is poorly scheduled.
