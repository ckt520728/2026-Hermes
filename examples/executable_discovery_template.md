# Executable Discovery Template (v2.6)

Use this as a schema exemplar, not prose to copy.

## Project skeleton

```text
<project-dir>/
├── prompt.json
├── seed_ideas.json
├── experiment.py
├── plot.py
├── data/
│   ├── README.md
│   ├── raw_schema.json
│   └── derived_schema.json
├── run_0/
│   ├── final_info.json
│   └── metrics.json
├── figures/
│   └── figure_manifest.json
├── results/
│   ├── claim_ledger.csv
│   ├── evidence_audit.md
│   └── reproducibility_report.md
└── reports/
    └── evidence_bound_report.md
```

## `experiment.py` contract

Required CLI:

```bash
python experiment.py --data data/ --out_dir run_0 --config prompt.json --seed 20260609
```

Required behavior:

- writes `<out_dir>/metrics.json`;
- writes `<out_dir>/final_info.json`;
- records `data_mode` as `real`, `synthetic`, or `unavailable`;
- exits non-zero only for unexpected failure;
- writes `status: data_unavailable` when real data is required but absent.

## `plot.py` contract

Required CLI:

```bash
python plot.py --run_dir run_0 --out_dir figures
```

Required behavior:

- reads run outputs only;
- writes generated figures;
- writes `figures/figure_manifest.json`;
- does not invent metrics.

## Report contract

Every result sentence with a number must include:

```text
[claim_id: C-001 | type: observed | artifact: run_0/final_info.json]
```

If no artifact exists, the claim must be `hypothesis` or `unsupported`.
