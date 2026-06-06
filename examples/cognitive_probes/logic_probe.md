# Logic Probe (v2.3)

Analog of the Multiple Demand network localizer. Tests whether quantitative reasoning was actually engaged.

## Checklist

```yaml
probe: logic
subject: <path>
checks:
  - id: every_number_traceable
    test: "Every numeric value in the output can be traced to an upstream file (agent2_simulation_report.md, agent3_analysis_report.md, etc.) OR is explicitly marked 'illustrative example'"
    method: "extract all numbers; match against upstream sources"
  - id: cis_present
    test: "Every reported point estimate has a CI, SE, or explicit 'Not reported' tag"
    method: "regex"
  - id: power_calc_present
    test: "Wherever a sample size N is stated, the power calculation that justified it is referenced"
    method: "grep + cross-check"
  - id: no_leap_inferences
    test: "Every conclusion sentence has a preceding sentence (within the same paragraph) that supplies the premise"
    method: "structural"
  - id: hedges_match_design
    test: "Causal language ('causes', 'leads to') only appears where the design supports it (RCT or strong mechanistic chain); otherwise associational language"
    method: "manual"

verdict_rule: "PASS if ≥4 of 5 checks pass; FAIL otherwise."
on_fail: "Re-spawn the responsible agent with Logic faculty at strong intensity."
```

## Worked example: a FAIL on `every_number_traceable`

```
Found in output: "Cohen's d = 0.62"
Searched: agent2_simulation_report.md, agent3_analysis_report.md
Result:    not found
Verdict:   FAIL (this number is unanchored)
Action:    flag for revision; possible fabrication.
```
