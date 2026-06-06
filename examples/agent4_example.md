# Agent 4 Exemplar — Clinical Researcher

Schema for the prospective clinical trial protocol. Each numeric value MUST be traceable to an upstream agent.

## Mini Case A — protocol paragraph skeleton (CONSORT-aligned)

**Title:** A `[phase]`, `[blinding]`, `[design]` trial of `[intervention]` in `[population]`.

**Primary objective:** To evaluate `[primary endpoint]` measured by `[instrument]` at `[timepoint]`.

**Hypotheses (linked to Agent 1 H1):**

- H₀: mean change in `[primary endpoint]` between arms = 0
- H₁: mean change ≥ `[Δ from Agent 2 prediction P1]`

**Sample size:**

```
From Agent 3's power calculation:
  N per arm = [x]
  Total N   = [2x] (with [20]% attrition margin → enrol [2x · 1.2])
```

**Randomization:** `[stratified by site and severity]`, allocation ratio `[1:1]`, concealment by `[centralized web system]`.

**Blinding:** `[participant | assessor | analyst]`-blind. Unblinding only via DSMB.

**Adverse-event stopping rules:**

- Stop arm if `[event X]` rate exceeds `[threshold]` at any interim.
- Per-protocol stopping: predefined at `[N/2]` enrolment for DSMB review.

## Mini Case B — DSMB charter independence clause

> The Data and Safety Monitoring Board operates independently of the sponsor and study team. Voting members hold no financial interest in `[intervention]`. The Board meets `[every N months]` and reviews `[primary endpoint | safety signals | recruitment]`. The Board can recommend `[continuation | modification | early termination]`.

## Mini Case C — INSUFFICIENT_EVIDENCE example

```
INSUFFICIENT_EVIDENCE
missing_inputs:
  - Agent 3's power calculation (needed for sample size)
  - Agent 2's primary-endpoint effect size (needed for stopping rules)
  - confirmation of target population from Phase 0 intake
confidence_floor: 0.75   # high floor because this is high-stakes clinical text
recommended_action: retry_upstream
```
