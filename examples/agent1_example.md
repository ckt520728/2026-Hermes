# Agent 1 Exemplar — Computational Neuroscientist

Schema for the modeling report Agent 1 produces. Use placeholders, not real prose.

## Mini Case A — neural mass model entry

**Model class:** `[ODE-based neural mass model | spiking network | mean-field]`

**State variables:**
- `[v_E]`: excitatory population mean membrane potential, units `[mV]`
- `[v_I]`: inhibitory population mean membrane potential, units `[mV]`
- `[s_E]`: synaptic gating variable, units `[dimensionless, 0–1]`

**Equations (skeleton):**
```
dv_E/dt = -(v_E - V_rest)/τ_E + g_EE·s_E - g_IE·s_I + I_ext(t)
dv_I/dt = ...
ds_E/dt = ...
```

**Parameter table (normal vs disease):**

| Parameter | Normal value | Disease value | Units | Source |
|-----------|--------------|---------------|-------|--------|
| `[g_EE]`  | `[x ± SE]`   | `[x ± SE]`    | `[ns/cm²]` | `[citation_key]` |
| ...       |              |               |       |        |

**Biomarker mapping:**
- Model output `[power in 8–12 Hz band]` ↔ EEG biomarker `[alpha power]`
- Model output `[ ... ]` ↔ clinical marker `[ ... ]`

**Hypotheses (if-then-because format, 3 minimum):**

1. **If** disease parameter `[g_IE]` is reduced by ≥`[X]`%, **then** simulated `[alpha power]` will drop by ≥`[Y]`%, **because** `[mechanism]`.
2. ...
3. ...

**Uncertainty bounds Δθ for Stage 2 search:**
- `[g_EE]`: ±`[10%]` around central value
- `[g_IE]`: ±`[15%]`
- ...

## Mini Case B — INSUFFICIENT_EVIDENCE example

If Agent 6 has not yet provided method recommendations and the user gave no priors:

```
INSUFFICIENT_EVIDENCE
missing_inputs:
  - Agent 6's method comparison table for [model class]
  - User's prior on [parameter range]
confidence_floor: 0.6
recommended_action: retry_upstream
```
