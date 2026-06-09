# Run Output Contract Example (v2.6)

`final_info.json` and `metrics.json` are the only places where observed numeric results become reportable.

## `run_0/final_info.json`

```json
{
  "run_id": "run_0",
  "run_type": "baseline",
  "data_mode": "real",
  "status": "success",
  "primary_metrics": {
    "example_metric": 0.0
  },
  "secondary_metrics": {},
  "claimable_results": [
    {
      "claim_id": "C-001",
      "metric_name": "primary_metrics.example_metric",
      "value": 0.0,
      "claim_type": "observed"
    }
  ],
  "limitations": [],
  "created_at": "2026-06-09T00:00:00+08:00",
  "software": {
    "python": "3.x"
  },
  "random_seed": 20260609
}
```

## `metrics.json`

```json
{
  "primary": {},
  "secondary": {},
  "diagnostics": {
    "converged": true,
    "warnings": []
  }
}
```

## `figures/figure_manifest.json`

```json
{
  "figures": [
    {
      "figure_id": "F1",
      "path": "figures/example.png",
      "source_run": "run_0",
      "source_metrics": ["primary_metrics.example_metric"],
      "caption_claim_ids": ["C-001"]
    }
  ]
}
```

## Failure modes

If data is unavailable:

```json
{
  "run_id": "run_0",
  "run_type": "baseline",
  "data_mode": "unavailable",
  "status": "data_unavailable",
  "primary_metrics": {},
  "claimable_results": [],
  "limitations": ["Real trial-level data was not available in this run."]
}
```

This is a valid run output, but it cannot support observed empirical claims.
