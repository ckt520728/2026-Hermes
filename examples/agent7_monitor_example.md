# Agent 7 Exemplar — Monitor / Validator

Agent 7 emits a pass/fail verdict plus typed feedback ε on failure. Each handoff has its own invariant list.

## Mini Case A — A1+A6 → A2 gate, PASS

```json
{
  "gate": "phase_1.5",
  "from": ["agent1", "agent6"],
  "to": "agent2",
  "verdict": "PASS",
  "checks": {
    "units_consistent": true,
    "hypotheses_falsifiable": true,
    "citations_resolve": true,
    "method_coverage_ratio": 0.92
  },
  "epsilon": null
}
```

## Mini Case B — A2 → A3 gate, FAIL

```json
{
  "gate": "phase_2.6",
  "from": "agent2",
  "to": "agent3",
  "verdict": "FAIL",
  "checks": {
    "simulation_converged": true,
    "effect_sizes_plausible": false,
    "predictions_linked_to_hypotheses": true,
    "seeds_logged": true,
    "sanity_check_passed": true
  },
  "epsilon": {
    "violation": "Cohen's d = 4.2 reported for primary endpoint; range [0.1, 2.0] expected",
    "missing": [],
    "inconsistent": ["agent2_simulation_report.md line 87: d=4.2"],
    "action": "revise_agent2",
    "hint": "Re-check effect-size calculation; d>2 implies near-perfect separation, unusual in biology"
  }
}
```

## Mini Case C — Stage 2 inner-search branch filter, REJECT_BRANCH

```json
{
  "gate": "phase_2.2_branch_filter",
  "branch_id": 2,
  "verdict": "REJECT_BRANCH",
  "checks": {
    "g_EE_in_range": true,
    "g_IE_in_range": false,
    "tau_E_positive": true
  },
  "epsilon": {
    "violation": "g_IE = -0.05 (must be ≥ 0 by physiologic constraint)",
    "action": "drop_branch"
  }
}
```

When ALL branches are REJECT_BRANCH, Agent 2 itself emits INSUFFICIENT_EVIDENCE and search halts.
