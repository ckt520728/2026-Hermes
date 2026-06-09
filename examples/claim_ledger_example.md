# Claim Ledger Example (v2.6)

The claim ledger is the source of truth for report language.

## CSV schema

```csv
claim_id,claim_text,claim_type,source_agent,artifact_path,metric_name,extraction_rule,evidence_strength,limitations,allowed_report_language
C-001,"[group] showed lower [metric] than [control]",observed,A3,run_0/final_info.json,primary_metrics.pse_group_diff,"jsonpath: $.primary_metrics.pse_group_diff",high,"depends on available trial-level data","analysis showed"
C-002,"[mechanism] explains the observed bias",hypothesis,A1,results/evidence_audit.md,NA,NA,medium,"requires model fitting","we hypothesize"
C-003,"[intervention] improves [endpoint]",unsupported,A4,NA,NA,NA,low,"no intervention data in current project","not supported in this run"
```

## Claim type rules

| Type | Required support |
|---|---|
| `observed` | metric exists in a run output |
| `derived` | calculation can be traced to observed output |
| `simulated` | synthetic or simulation output exists |
| `literature` | retrievable source is named |
| `hypothesis` | plausible but not yet executed |
| `unsupported` | no adequate support |

## Downgrade examples

| Bad sentence | Correct sentence |
|---|---|
| "HDDM confirmed z bias." | "HDDM z bias is a testable hypothesis unless fitted output exists." |
| "EEG theta predicted behavior." | "EEG theta is a candidate bridge if EEG analysis is performed." |
| "iTBS corrected the biomarker." | "iTBS correction is a proposed intervention target." |
