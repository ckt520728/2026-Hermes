# Agent 5 Exemplar — Synthesis Writer

In v2.1 Agent 5 produces 2–3 candidates per artifact. Below is a schema for one candidate of each.

## Mini Case A — research paper abstract skeleton (Candidate A: computational-mechanistic angle)

> **Background.** `[Disease X]` is associated with `[deficit Y]`, but the underlying `[mechanism]` remains unclear.
> **Methods.** We built `[model class]` of `[circuit]`, simulated `[intervention]`, then validated predictions retrospectively in `[N=X cohort]` and prospectively in `[N=Y trial]`.
> **Results.** Simulation predicted `[effect, Cohen's d = x.x]`. Retrospective analysis confirmed `[r = .., p = ..]`. Prospective trial met the primary endpoint (mean change `[x ± SE]`, `[p < .05]`).
> **Conclusion.** `[Mechanism Z]` is a plausible target, supported by convergent computational, retrospective, and prospective evidence.

## Mini Case B — research paper abstract skeleton (Candidate B: clinical-translational angle)

Same study; opens with the clinical problem first, mechanism second.

> **Background.** Patients with `[disease X]` lack `[effective intervention]`. We sought a `[type Y]` therapy informed by `[mechanism]`.
> **Methods.** A `[phase]` trial of `[intervention]` was preceded by `[retrospective validation]` and `[computational hypothesis generation]`.
> ...

## Mini Case C — Specific Aims (NIH format)

```
Aim 1: Establish [mechanism Z] as the computational basis for [deficit Y] in [disease X].
   Hypothesis: [H1, if-then-because form]
   Approach:   [model] + [parameter scan]
   Outcome:    [predicted effect with bounds]

Aim 2: Confirm [mechanism Z] retrospectively in [registry data].
   Hypothesis: [H2]
   Approach:   [analysis plan]
   Outcome:    [expected correlation with prior CI]

Aim 3: Validate [intervention I] prospectively in [Phase II trial].
   Hypothesis: [H3]
   Approach:   [trial design summary]
   Outcome:    [primary endpoint, expected effect size]
```

## Mini Case D — INSUFFICIENT_EVIDENCE example

```
INSUFFICIENT_EVIDENCE
missing_inputs:
  - Agent 4's primary endpoint result (study not yet run)
  - User's preferred narrative angle (Phase 0 didn't specify)
confidence_floor: 0.65
recommended_action: ask_human
```
