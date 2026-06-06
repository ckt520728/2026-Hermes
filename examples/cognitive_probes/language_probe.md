# Language Probe (v2.3)

Verifies that the agent's recent output actually engaged the Language faculty. Analog of Fedorenko-style language localizer.

## Checklist (yes/no each)

```yaml
probe: language
subject: <path to output file>
checks:
  - id: terminology_consistent
    test: "Each load-bearing technical term appears in exactly ONE canonical form"
    method: "extract candidate technical terms; check no synonym drift (e.g., 'alpha power' AND 'alpha rhythm' both present without definition)"
  - id: definitions_at_first_use
    test: "Each of the top-5 most-used technical terms has a one-sentence definition somewhere"
    method: "grep / heuristic"
  - id: jargon_explained
    test: "No acronym is used before being expanded"
    method: "regex"
  - id: hedge_matches_evidence
    test: "Strong claims ('demonstrates', 'proves') are reserved for direct experimental evidence; weaker claims ('suggests', 'is consistent with') for indirect"
    method: "manual"
  - id: no_register_drift
    test: "Style register stays roughly constant (no shifts between casual and formal mid-section)"
    method: "manual"

verdict_rule: "PASS if ≥4 of 5 checks pass; FAIL otherwise."
on_fail: "Re-spawn Agent 5 with Language faculty at strong intensity for the failing section."
```

## Example FAIL output

```json
{
  "probe": "language",
  "subject_agent": "agent5_paper_final.md",
  "checks": {
    "terminology_consistent": false,
    "definitions_at_first_use": true,
    "jargon_explained": true,
    "hedge_matches_evidence": false,
    "no_register_drift": true
  },
  "verdict": "FAIL: 3/5 passed (terminology drift in §3 ['EEG power' vs 'spectral power'], over-strong 'demonstrates' in §4 abstract claim)",
  "recommendation": "Re-spawn Agent 5 with Language=strong + Logic=medium for §3 and §4."
}
```
