# Agent 3 Exemplar — Data Analyst

Schema for the retrospective analysis protocol.

## Mini Case A — analysis protocol skeleton

**Cohort definition:**

- **Inclusion:** `[age ≥ X]`, `[diagnosis Y per DSM-5/ICD-10 code]`, `[at least one valid EEG recording]`
- **Exclusion:** `[comorbidity Z]`, `[medication W within N days]`, `[EEG with >K% artifact]`

**Sample size:**

```
Power calc from Agent 2's effect size:
  d        = [x.x]   (from winning branch, Phase 2.6)
  α        = [0.05]
  power    = [0.80]
  → N      = [computed value]
  → with [20]% attrition margin: enrol N' = [final value]
```

**Analysis pipeline (MNE-Python skeleton):**

```python
def preprocess(raw):
    raw = raw.copy().filter(l_freq=[1], h_freq=[40])
    raw = raw.notch_filter([60])
    raw = ica_artifact_removal(raw, n_components=[20])
    return raw

def extract_features(epochs):
    psd, freqs = psd_welch(epochs, fmin=[1], fmax=[40], n_fft=[512])
    return {
        "alpha_power": band_power(psd, freqs, [8, 12]),
        "beta_power":  band_power(psd, freqs, [13, 30]),
    }
```

**Stratification:**

- Responder subgroup: `[criterion linked to Agent 2's Prediction P1]`
- Non-responder subgroup: `[criterion]`

**Pre-registration:** OSF link `[https://osf.io/...]` or explicit reason for not pre-registering.

## Mini Case B — INSUFFICIENT_EVIDENCE example

```
INSUFFICIENT_EVIDENCE
missing_inputs:
  - Agent 2's Cohen's d for the primary endpoint
  - access to a real EEG dataset description (not just hypothetical)
confidence_floor: 0.65
recommended_action: ask_human
```
