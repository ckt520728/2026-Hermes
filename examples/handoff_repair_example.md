# Faculty Handoff Repair Exemplar (v2.5)

When `faculty_flow.jsonl` flags `WARN: faculty_dropped_at_handoff`, the orchestrator can now act — not just log.

## Configuration

```yaml
handoff_repair:
  mode: auto                          # auto | suggest | log_only
  max_repairs_per_handoff: 1
  repair_budget_fraction: 0.15
```

## Mode comparison

| Mode | What happens when WARN fires |
|------|-------------------------------|
| `auto` | Orchestrator silently re-spawns consumer with dropped faculty boosted. Logs to `handoff_repair_log.jsonl`. Default for production runs. |
| `suggest` | WARN logged + a one-line recommendation printed to user. User decides whether to trigger the repair. Useful for new projects when you're still learning what the schedule should be. |
| `log_only` | v2.4 behavior. Useful for measuring how often repair WOULD fire before turning it on. |

---

## Mini Case A — auto repair on A4 → A5 Social drop

### Flow detection
```json
{
  "handoff": "A4 → A5",
  "producer_engagement_intensity": {"social": 0.85},
  "consumer_faculties_acted_on": ["language", "logic", "world"],
  "faculty_dropped_at_handoff": ["social"],
  "diagnostic": "WARN: equity / consent quality lost at A5"
}
```

### Repair action
```
Orchestrator:
  1. Identifies consumer = agent5_synthesis
  2. Reads A4's equity-bearing sections (paragraphs 3, 7 of agent4_clinical_trial_protocol.md)
  3. Re-spawns A5 with augmented context:
       faculty_intensity:
         social: 0.92  (boosted from default 0.60 → strong)
       additional_context: |
         The previous synthesis dropped the equity content from A4. Specifically, A4's
         §3 "Subgroup Recruitment" and §7 "Vulnerable Populations" must surface in the
         Discussion section of the paper and Aim 2 of the grant. Do not paraphrase to
         dilute; carry the specifics.
       directive_for_section: "Discussion §3, Aim 2"
  4. Logs to handoff_repair_log.jsonl
```

### Log entry
```json
{
  "timestamp": "2026-06-06T10:55:00Z",
  "trigger_handoff": "A4 → A5",
  "dropped_faculty": "social",
  "consumer_agent": "agent5_synthesis",
  "repair_action": "respawn_with_social_strong",
  "new_intensity": 0.92,
  "scope": "Discussion §3, Aim 2 of grant",
  "cost_usd": 0.124,
  "outcome": "second_flow_log_pass",   # consumer probe now PASS for social
  "repair_attempt_number": 1
}
```

### Outcome verification
After repair, re-run the cognitive Social probe on A5's new output. If it now PASSES, the repair worked. If still FAIL, escalate (do NOT cascade).

---

## Mini Case B — suggest mode on a new project

User is new to the pipeline; wants to see what repair would do without committing.

### Flow detection (same as Case A)

### Suggest output (printed to user)

```
⚠️ Faculty Flow detected a drop at A4 → A5 (social).

   The orchestrator recommends:
     - re-spawn A5 with social intensity boosted to 0.92
     - point A5 at A4's §3 "Subgroup Recruitment" and §7 "Vulnerable Populations"
     - estimated cost: $0.124 (within budget)

   To accept: confirm.
   To skip:   skip; the drop will only be logged (v2.4 behavior).
```

---

## Mini Case C — repair budget exceeded

5 handoffs in this run; 4 needed repair. Cumulative repair cost = $0.48. Total budget = $5.00. Repair budget = 15% × $5 = $0.75.

Repair #5 estimated at $0.30 would push cumulative to $0.78 — over budget.

### Orchestrator action

```
HALT auto-repair for remainder of run.
Log: cumulative repair cost = $0.48 / budget $0.75 (96%).
Escalate to user:
  "Repair budget reached. 4 of 5 handoffs needed Social boost; this suggests the
   Phase Schedule is mis-calibrated for this project. Either:
     (a) extend repair budget,
     (b) enable project_faculty_calibration to learn from this pattern, or
     (c) inspect schedule manually."
```

This is the kind of pattern that triggers Per-Project Faculty Calibration (v2.5 §2).

---

## Mini Case D — repair cascade (Pitfall #31)

After repair, A5 now engages Social strongly but in doing so its Logic engagement degraded.

```
Repair #1:  A4 → A5  dropped social → boost to 0.92 → A5 reruns
Repair #2:  A5 → Judge_A  dropped logic (newly weakened!) → would boost?
```

### Orchestrator action

```
HALT cascade detection: A5 was already repaired once.
max_repairs_per_handoff: 1 was set.
Escalate:
  "Repair cascade detected. Boosting Social on A5 weakened Logic, which is now
   dropping at Judge A. Manual intervention required:
   - inspect A5's output to see what's actually happening,
   - consider lowering the Social boost (e.g., from 0.92 to 0.78),
   - or accept the Logic drop and proceed."
```

The pipeline does NOT recursively repair. Human-in-the-loop is the correct response.

---

## When to use which mode

| Scenario | Mode |
|----------|------|
| Mature project, default schedule works | `auto` |
| New project, want to see what would happen | `suggest` |
| First-time setup, measuring repair frequency | `log_only` |
| Tight budget, prefer escalation over auto-action | `suggest` |
| High-stakes clinical run | `suggest` (user must confirm) |
