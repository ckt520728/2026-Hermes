# Per-Project Faculty Calibration Exemplar (v2.5)

The default Phase Schedule (`faculty_phase_schedule.md`) is a population-level prior. Each project — depending on domain, target population, funder — has its own pattern. Per-Project Faculty Calibration learns this pattern from past Flow logs and writes a project-specific override.

## File format

`project_faculty_calibration.yaml`:

```yaml
project_id: dementia_2026
calibration_runs_observed: 5
last_updated: 2026-06-06T14:00:00Z

# Cells where this project's pattern differs from the default schedule
override_cells:
  phase_3.A3.social:
    default: medium      # 0.60
    learned: strong      # 0.85
    confidence: 0.84
    based_on_n_runs: 4
    rationale: |
      4 of last 5 runs triggered Handoff Repair to boost Social at A3.
      Project's target population is elderly with comorbidities; subgroup
      equity is more central than the default schedule assumes.

  phase_4.5.A7.social:
    default: strong      # 0.85
    learned: max         # 1.00
    confidence: 0.72
    based_on_n_runs: 3
    rationale: |
      DSMB charter completeness probe failed in 2 of 3 recent runs unless
      Social was at max. Promoting to default.

# Cells where the user has explicitly pinned values (block learning)
pinned_cells:
  - phase_2.A2.social: suppress
  - phase_2.3.A2_inner.social: suppress

# Audit log of recent calibration changes
recent_updates:
  - timestamp: 2026-06-05T09:00:00Z
    cell: phase_3.A3.social
    change: medium → strong
    triggered_by: 4th_consecutive_repair_in_window
```

---

## Update logic (post-run)

```python
def update_calibration_from_run(project_calib, flow_log, repair_log, ablation_log):
    project_calib["calibration_runs_observed"] += 1

    for cell in iterate_all_cells():
        if cell in pinned_cells:
            continue
        if cell in repair_log["repaired_cells"]:
            cell_repair_count = recent_repair_count(cell, window=3)
            if cell_repair_count >= 2:
                # Promote: at least 2 of last 3 runs needed repair to a higher intensity
                promote_cell(cell, new_intensity=repair_log["repaired_to"])
                log_update(cell, change=f"{default} → {new_intensity}")

        if cell in ablation_log["suppression_helped_cells"]:
            # If ablation Δ for suppressing this cell was positive, demote
            demote_cell(cell, new_intensity="suppress")

    save(project_calib)
```

---

## Safety guards

### 1. min_runs_before_override

```yaml
project_calibration:
  min_runs_before_override: 3
```

Calibration overrides do NOT apply until ≥3 runs of history. Until then, the default schedule rules. This prevents one noisy run from changing the schedule.

### 2. Per-project scoping

Calibration is scoped to `project_id`. The same orchestrator running 10 different research projects keeps 10 independent calibration files. Lesson learned on dementia projects does NOT bleed into pediatric oncology projects.

### 3. User-pinned cells

```yaml
pinned_cells:
  - phase_2.A2.social: suppress
  - phase_4.A4.social: strong
```

Pinned cells are locked. Learning cannot override them. Use for cells where domain experts have strong priors (e.g., A4 clinical Social = strong is non-negotiable).

### 4. Confidence threshold

If `confidence < 0.6`, the override is recorded as `learned` but NOT applied. Schedule continues using the default until confidence rises.

---

## Mini Case A — first 3 runs

```yaml
# After run 1: not enough history
project_id: dementia_2026
calibration_runs_observed: 1
override_cells: {}   # no overrides yet
```

```yaml
# After run 2: still not enough
calibration_runs_observed: 2
override_cells: {}
```

```yaml
# After run 3: now mature enough; first overrides land
calibration_runs_observed: 3
override_cells:
  phase_3.A3.social:
    default: medium
    learned: strong
    confidence: 0.78    # > 0.6 threshold; applies on run 4
    based_on_n_runs: 3
```

Run 4 uses the override.

---

## Mini Case B — sub-domain shift

Project `dementia_2026` has historically been about elderly. Run 7 is a pediatric extension.

### Problem

Calibration says `phase_3.A3.social: strong` (learned from elderly runs). But pediatric trials need different Social engagement (parent / guardian consent, developmental considerations).

### Fix (Pitfall #32)

Add sub-domain to `project_id`:

```yaml
project_id: dementia_2026.elderly      # original
project_id: dementia_2026.pediatric    # new, separate calibration
```

Each sub-domain accumulates its own history. Population prior (default Phase Schedule) applies to the new sub-domain until its own ≥3 runs.

---

## Mini Case C — calibration audit

User asks: "Why was Social at 0.92 in Phase 3 this run?"

Orchestrator answers from log:

```
Phase 3 A3 Social intensity = 0.92
Source: project_calibration override
  default = 0.60 (medium)
  learned = 0.85 (strong)
  Pipeline applied boost from auto-repair, +0.07
  Final: 0.92
Rationale (from calibration file): "4 of last 5 runs triggered Handoff Repair
to boost Social at A3. Project's target population is elderly with comorbidities."
```

Every override is traceable.

---

## Notes

- **Privacy:** calibration files contain pattern data, not user content. They can be checked into version control alongside the project.
- **Reset:** if you suspect the calibration has drifted wrongly, delete `project_faculty_calibration.yaml` to revert to defaults. The next 3 runs rebuild from history.
- **Visualizable:** `calibration_runs_observed` and the override cells together let you plot "how the project's faculty pattern evolved over time" — useful for retrospective analysis.
