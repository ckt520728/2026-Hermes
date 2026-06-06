# Social Probe (v2.3)

Analog of the Theory of Mind localizer. Tests whether the output considered perspectives beyond the author's.

In v2.3, the **equity check** lives here (promoted from Judge B's rubric).

## Checklist

```yaml
probe: social
subject: <path>
checks:
  - id: equity_addressed
    test: "The paper / grant explicitly addresses how the intervention or finding affects different subgroups (sex, age, race, SES, access). Acceptable also: explicit statement that the current scope is one population and generalization is future work."
    method: "grep + manual"
  - id: patient_perspective_present
    test: "Informed consent material uses lay language. Risk-benefit framing addresses the patient, not just the regulator."
    method: "manual"
  - id: reviewer_pushback_anticipated
    test: "Discussion section explicitly raises ≥1 anticipated objection and responds to it"
    method: "grep for 'one might argue', 'a possible concern', 'limitation', etc., AND followed by substantive response"
  - id: tom_markers_present
    test: "Output contains at least 3 perspective-taking markers (e.g., 'the clinician unfamiliar with', 'from the patient's perspective', 'reviewers may question')"
    method: "regex"
  - id: safety_framing_visible
    test: "If clinical: AE plan, stopping rules, vulnerable population safeguards. If non-clinical: dual-use considerations, misuse risks."
    method: "manual"

verdict_rule: "PASS if ≥4 of 5 checks pass AND equity_addressed = true (this check is mandatory regardless of total score)."
on_fail: "Re-spawn Agent 5 / Agent 4 with Social faculty at strong intensity for the failing section. Equity failure ALWAYS triggers a rerun."
```

## Why equity is mandatory

In v2.2, equity was 1 of 5 axes in Judge B's rubric. A candidate could score 4/5 on Judge B (excellent on translational, feasibility, safety, funder appeal) while failing equity entirely — and still ship. v2.3 closes that hole by making equity a non-negotiable Social-probe check.
