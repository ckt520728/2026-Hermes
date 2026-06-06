# Cost Telemetry Exemplar (v2.2)

`cost_log.jsonl` is append-only; one line per `delegate_task` call. Orchestrator aggregates at end of run.

## Per-call schema

```json
{
  "timestamp": "ISO-8601",
  "stage": "phase_2.3",
  "agent": "agent2_search",
  "model": "haiku",
  "prompt_tokens": 1840,
  "completion_tokens": 510,
  "est_cost_usd": 0.0023,
  "notes": "branch_id=1, seed=0"
}
```

## Mini Case A — three branches × two seeds at Stage 2.3

```jsonl
{"timestamp": "2026-06-06T10:23:14Z", "stage": "phase_2.3", "agent": "agent2_search", "model": "haiku", "prompt_tokens": 1840, "completion_tokens": 510, "est_cost_usd": 0.0023, "notes": "branch_id=1, seed=0"}
{"timestamp": "2026-06-06T10:23:18Z", "stage": "phase_2.3", "agent": "agent2_search", "model": "haiku", "prompt_tokens": 1840, "completion_tokens": 498, "est_cost_usd": 0.0022, "notes": "branch_id=1, seed=1"}
{"timestamp": "2026-06-06T10:23:22Z", "stage": "phase_2.3", "agent": "agent2_search", "model": "haiku", "prompt_tokens": 1855, "completion_tokens": 522, "est_cost_usd": 0.0024, "notes": "branch_id=2, seed=0"}
{"timestamp": "2026-06-06T10:23:26Z", "stage": "phase_2.3", "agent": "agent2_search", "model": "haiku", "prompt_tokens": 1855, "completion_tokens": 518, "est_cost_usd": 0.0024, "notes": "branch_id=2, seed=1"}
{"timestamp": "2026-06-06T10:23:30Z", "stage": "phase_2.3", "agent": "agent2_search", "model": "haiku", "prompt_tokens": 1841, "completion_tokens": 505, "est_cost_usd": 0.0023, "notes": "branch_id=3, seed=0"}
{"timestamp": "2026-06-06T10:23:34Z", "stage": "phase_2.3", "agent": "agent2_search", "model": "haiku", "prompt_tokens": 1841, "completion_tokens": 499, "est_cost_usd": 0.0022, "notes": "branch_id=3, seed=1"}
```

## Mini Case B — end-of-run cost summary

`cost_summary.md`:

```markdown
# Pipeline Cost Summary
Run ID: 2026-06-06_kuramoto_h2
Pipeline: full
Duration: 23 min 14 s

## Per-stage cost (USD)

| Stage          | Calls | Total cost | Avg/call |
|----------------|-------|------------|----------|
| 0.5 Router     | 1     | 0.003      | 0.003    |
| 1   A1         | 1     | 0.245      | 0.245    |
| 1   A6         | 1     | 0.167      | 0.167    |
| 1.5 Monitor    | 1     | 0.004      | 0.004    |
| 2.1 Actor      | 1     | 0.012      | 0.012    |
| 2.2 Monitor    | 1     | 0.003      | 0.003    |
| 2.3 Predictor  | 6     | 0.087      | 0.0145   |
| 2.4 Evaluator  | 3     | 0.018      | 0.006    |
| 2.5 Full sim   | 1     | 0.114      | 0.114    |
| 2.6 Monitor    | 1     | 0.004      | 0.004    |
| 3   A3         | 1     | 0.118      | 0.118    |
| 3.5 Monitor    | 1     | 0.004      | 0.004    |
| 4   A4         | 1     | 0.395      | 0.395    |
| 4.5 Monitor    | 1     | 0.005      | 0.005    |
| 5a  A5 × 4     | 4     | 0.612      | 0.153    |
| 5b  Judge A    | 1     | 0.042      | 0.042    |
| 5b  Judge B    | 1     | 0.042      | 0.042    |
| **TOTAL**      | **25**| **1.875**  |          |

## Budget

- Set:       $5.00
- Used:      $1.875 (37.5%)
- Remaining: $3.125

## Largest line items

1. Phase 5a candidates: $0.612 (32.6% of total)
2. Phase 4 clinical:    $0.395 (21.1%)
3. Phase 1 modeling:    $0.245 (13.1%)
```

## Mini Case C — budget-exceeded halt

```jsonl
{"timestamp": "...", "stage": "phase_4", "agent": "agent4_clinical", "model": "opus", "prompt_tokens": 4200, "completion_tokens": 1800, "est_cost_usd": 0.84, "notes": "cumulative=$4.93, budget=$5.00, hit 80% threshold — warning emitted"}
```

Orchestrator behavior:

- At 80%: warning to user, continue
- At 100%: halt before next top-level stage, ask user `extend | abort`
- Within Phase 5 (5a+5b): atomic — never halt mid-ensemble
