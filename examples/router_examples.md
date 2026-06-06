# Router Exemplars

The Router classifies a user request into one of:
`full | clinical_only | literature | methods_rep | proposal`

## Example 1 — full pipeline

**User intent (Phase 0 summary):**
> "I want to build a [neural mass model] of [disease X], simulate [intervention Y], find supporting evidence in [retrospective dataset Z], and design a Phase II trial."

**Output:**
```json
{
  "pipeline": "full",
  "rationale": "Request explicitly spans modeling, simulation, retrospective analysis, and prospective trial.",
  "confidence": 0.95,
  "missing_to_upgrade": []
}
```

## Example 2 — clinical_only

**User intent:**
> "I have access to [registry data] on [condition]. I want to do a retrospective analysis and then design a prospective validation study. No modeling needed."

**Output:**
```json
{
  "pipeline": "clinical_only",
  "rationale": "User explicitly excludes modeling. Only retrospective + prospective stages requested.",
  "confidence": 0.92,
  "missing_to_upgrade": ["computational model would justify treatment-effect priors"]
}
```

## Example 3 — literature

**User intent:**
> "Give me a structured review of [methodology X] in [field Y] from the last 5 years."

**Output:**
```json
{
  "pipeline": "literature",
  "rationale": "Only a review is requested; no original analysis or modeling.",
  "confidence": 0.99,
  "missing_to_upgrade": []
}
```

## Example 4 — EDGE CASE (escalate)

**User intent:**
> "Help me think about [topic]."

**Output:**
```json
{
  "pipeline": "literature",
  "rationale": "Intent is vague; defaulting to lowest-cost option and recommending escalation.",
  "confidence": 0.45,
  "missing_to_upgrade": [
    "concrete research question",
    "whether data already exists",
    "whether user wants a paper or just exploratory thinking"
  ]
}
```

Because `confidence < 0.7`, the Orchestrator escalates to the user with the `missing_to_upgrade` list.
