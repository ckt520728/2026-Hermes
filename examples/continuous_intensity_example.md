# Continuous Faculty Intensity Exemplar (v2.5)

v2.4 used 4 discrete intensity buckets: `{suppress, light, medium, strong}`. v2.5 makes intensity a continuous 0–1 scalar with three operating modes.

## Three modes

```yaml
cognitive_faculties:
  intensity_mode: continuous     # discrete_4 | discrete_5 | continuous
  intensity_buckets:             # used for snippet selection
    suppress: 0.0
    light:    0.3
    medium:   0.6
    strong:   0.85
    max:      1.0
```

| Mode | Snippet selection | Logs / arithmetic |
|------|-------------------|---------------------|
| `discrete_4` | 4-bucket (v2.4 behavior) | discrete labels |
| `discrete_5` | 5-bucket (adds `max`, has `off` zero-injection zone) | discrete labels |
| `continuous` | 5-bucket (same as discrete_5 for prompts) | continuous 0–1 in logs and ablation math |

## Snippet selection function

```python
def select_snippet(faculty, intensity, mode):
    if mode == "discrete_4":
        # v2.4 behavior
        if intensity < 0.15: return faculty_snippet[faculty]["suppress"]
        if intensity < 0.50: return faculty_snippet[faculty]["light"]
        if intensity < 0.80: return faculty_snippet[faculty]["medium"]
        return faculty_snippet[faculty]["strong"]

    elif mode in ("discrete_5", "continuous"):
        # v2.5 default
        if intensity < 0.10: return faculty_snippet[faculty]["suppress"]
        if intensity < 0.20: return None                                # "off" — no injection at all
        if intensity < 0.45: return faculty_snippet[faculty]["light"]
        if intensity < 0.75: return faculty_snippet[faculty]["medium"]
        if intensity < 0.95: return faculty_snippet[faculty]["strong"]
        return faculty_snippet[faculty]["max"]
```

The `off` zone (0.10–0.20) is new in v2.5: a deliberate "no steering, no suppression" middle that didn't exist in v2.4. Useful when a faculty is genuinely irrelevant for a task but you don't want to actively suppress it (which adds prompt tokens).

## Why continuous matters

The snippets stay discrete (text doesn't blend). But the **arithmetic** is now well-defined:

### 1. Calibration learning (v2.5 §2)

```yaml
# Three consecutive runs adjusted Phase 3 A3 Social to:
run_1: 0.65
run_2: 0.71
run_3: 0.78
# Mean: 0.71, learned value
# v2.4 with discrete buckets couldn't track the drift; all three rounded to "medium"
```

### 2. Ablation Δ-arithmetic (v2.4 §3, v2.5 §3)

```
Main Social = (R1 − R2)
            = full − ablated
            = +0.94    # this is a continuous Δ in scoreboard units
```

When intensity is itself continuous, the relationship "boost Social by 0.10 → expected Δ +0.05" can be approximated by gradient-style updates (v2.6 backlog).

### 3. User-friendly tuning

```
User: "I want a touch more Social engagement at Phase 4 but not full strong."
v2.4 response: "Sorry, only medium or strong. Pick one."
v2.5 response: "Setting Phase 4 Social to 0.75 (still medium snippet, but the next run will use this in calibration and may auto-promote to strong if it helps)."
```

## Mini Case A — log entry

```jsonl
{"phase": "phase_4", "agent": "agent4_clinical", "faculty": "social", "intensity": 0.85, "bucket_selected": "strong", "source": "schedule"}
{"phase": "phase_4", "agent": "agent4_clinical", "faculty": "logic",  "intensity": 0.60, "bucket_selected": "medium", "source": "schedule"}
{"phase": "phase_4", "agent": "agent4_clinical", "faculty": "world",  "intensity": 0.55, "bucket_selected": "medium", "source": "schedule"}
{"phase": "phase_4", "agent": "agent4_clinical", "faculty": "language","intensity": 0.85, "bucket_selected": "strong", "source": "schedule"}
```

The continuous values are stored. The buckets are the prompt-time decisions.

## Mini Case B — user override with continuous value

```
User input at Phase 0:
  "phase_4.A4.social: 0.92"   # higher than default 0.85

Orchestrator behavior:
  - logs intensity = 0.92, bucket = strong (same snippet as 0.85)
  - calibration math uses 0.92 (continuous)
  - in run report: "Phase 4 A4 Social set to 0.92 by user override; bucket: strong"
```

## Mini Case C — calibration nudge

```
Run 5 of dementia_2026:
  Phase 3 A3 Social default schedule: medium (0.60)
  Calibration override: 0.78 (between medium and strong; rounds to medium snippet)
  No repair needed this run.

Run 6:
  Calibration drift: 0.84 (now rounds to strong snippet)
  Schedule promoted from medium → strong at this cell (the continuous value crossed 0.75 threshold)
```

This is the granularity v2.4 lacked — the schedule can shift gradually, not just flip.

## Pitfall (#34): false precision

Users sometimes see `intensity: 0.617` and think the pipeline truly distinguishes 0.617 from 0.620. It does NOT for prompt purposes — both round to medium. It DOES for calibration arithmetic.

**Mitigation:** the orchestrator's user-facing reports always show both the continuous value AND the bucket:
```
intensity: 0.617 → medium
```

## Comparison table

| Capability | discrete_4 (v2.4) | discrete_5 (v2.5) | continuous (v2.5) |
|------------|-------------------|---------------------|---------------------|
| Snippet variety | 4 | 5 (+ off zone) | 5 (same prompts) |
| Ablation arithmetic | discrete | discrete | continuous |
| Calibration drift tracking | flip-only | flip-only | gradient-style |
| User override granularity | 4 levels | 6 levels (5 + off) | 0.0–1.0 |
| Backward compatible with v2.4 | YES | YES (default reproduces v2.4 well) | YES |
| Default in v2.5 | — | — | YES |
