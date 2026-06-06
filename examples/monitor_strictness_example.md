# Monitor Strictness Exemplar (v2.2)

Each gate has a `strictness_level: 1–5`. Each invariant carries `min_level`. Monitor runs invariant iff `gate_level ≥ invariant.min_level`.

## Mini Case A — invariant catalog for `phase_1.5` (A1+A6 → A2)

```yaml
gate: phase_1.5
strictness_level: 3   # from metadata.monitor_strictness

invariants:
  - name: units_declared
    min_level: 1
    description: "All parameter units explicit (mV, ms, etc.)"
    test: "regex check on agent1_modeling_report.md"
  - name: citations_resolve
    min_level: 2
    description: "Every [citation_key] referenced in A1 exists in A6's reference list"
    test: "set difference"
  - name: hypotheses_falsifiable
    min_level: 2
    description: "≥3 hypotheses in 'If X then Y because Z' form"
    test: "regex + count"
  - name: method_coverage_ratio_80
    min_level: 3
    description: "A6's recommended methods cover ≥80% of methods A1 plans to use"
    test: "intersection / union"
  - name: pre_registration_noted
    min_level: 4
    description: "A1's plan mentions whether to pre-register on OSF"
    test: "keyword search"
  - name: irb_template_referenced
    min_level: 5
    description: "A1's hypotheses include IRB-relevant exclusion clauses"
    test: "keyword search"
```

At gate level 3, the first four invariants run. At level 5, all six run.

## Mini Case B — strictness override flow

User in Phase 0 intake says:
> "This is an early proof-of-concept. Don't over-check Stage 2."

Phase 0 captures:
```json
{
  "monitor_strictness_override": {
    "phase_2.6": 2
  }
}
```

phase_2.6 then runs at level 2 instead of the default 4. The override is logged to `monitor_log.jsonl` for audit.

## Mini Case C — gate output with strictness annotation

```json
{
  "gate": "phase_2.6",
  "strictness_level": 4,
  "strictness_source": "default",
  "verdict": "PASS",
  "invariants_run":   ["sim_converged", "effect_size_plausible", "predictions_linked", "seeds_logged", "sanity_check_passed"],
  "invariants_skipped_due_to_level": ["pre_registration_noted"],
  "epsilon": null
}
```
