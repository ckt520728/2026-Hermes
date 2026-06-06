# Agent 6 Exemplar — Literature Gatekeeper

Schema for one structured literature entry. Agent 6 should produce 15–25 of these.

## Mini Case A — one structured entry

```yaml
citation_key: smith2024
doi: 10.xxxx/yyyy
title: "[paper title]"
year: 2024
journal: "[journal]"

design: "[study type — RCT | retrospective cohort | computational | review]"
population: "[N = x; key inclusion: ...]"
intervention: "[what was done]"
comparator: "[what it was compared with]"
primary_endpoint: "[outcome + unit + timing]"
effect_size: "[d = x.x | OR = y.y | RR = z.z] (95% CI [a, b])"

methodology_tags:
  - "[neural mass model]"
  - "[EEG alpha-power analysis]"
  - "[PICO-formatted PubMed search]"

relevance_to_our_question: "[2 sentences linking to Agent 1's hypotheses]"

limitations:
  - "[limitation 1]"
  - "[limitation 2]"

quality_score: 0.8   # 0-1 self-assessment of evidence strength
```

## Mini Case B — methodology comparison table row

```
| Method                  | Strength                  | Weakness                 | Best for                | Used by us? |
|-------------------------|---------------------------|--------------------------|-------------------------|-------------|
| [neural mass model]     | [analytic tractability]   | [population-level only]  | [circuit-scale Qs]      | YES (A1)    |
| [spiking network]       | [single-cell detail]      | [costly]                 | [microcircuit Qs]       | no          |
```

## Mini Case C — INSUFFICIENT_EVIDENCE example

```
INSUFFICIENT_EVIDENCE
missing_inputs:
  - Agent 1's specific model class (haven't received yet)
  - the target disease ICD-10 code from Phase 0
confidence_floor: 0.6
recommended_action: retry_upstream
```
