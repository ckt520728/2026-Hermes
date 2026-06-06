# Judge Exemplar

The Judge reads multiple candidates from Agent 5, picks the strongest of each artifact (paper / grant), and identifies the SINGLE weakest evidence chain in the winner.

## Mini Case A — decision report skeleton

```markdown
# Judge Decision

**Date:** 2026-MM-DD
**Judge model:** opus (long CoT)

## Paper selection

**Candidates considered:**
- A: [computational-mechanistic angle]
- B: [clinical-translational angle]

**Winner: B**

### Rubric scores (1–5)

| Rubric                | A  | B  |
|-----------------------|----|----|
| Coherence             | 4  | 5  |
| Evidence integrity    | 5  | 5  |
| Falsifiability        | 4  | 4  |
| No fabrication        | 5  | 5  |
| Refusal honoring      | 5  | 5  |
| **Total**             | 23 | 24 |

**Why B won:** B opens with the clinical problem, which makes the modeling work feel motivated rather than ornamental. A's first paragraph buries the relevance.

### Weakest evidence chain in winner B

> Section 3.2, paragraph 2: the claim that "[effect] generalizes to [population subgroup]" rests on a sample of N=[x] within that subgroup, which is below the pre-registered minimum of N=[y]. The phrasing "supports" is too strong; recommend "is consistent with, pending replication in a larger subgroup sample".

**Recommended one revision:** weaken the verb in §3.2 ¶2 from "supports" → "is consistent with", and add a one-sentence caveat referencing the subgroup-N gap.

## Grant selection

**Candidates considered:**
- A: NIH Specific Aims format
- B: NSFC format

**Winner: A** (target funder is NIH per Phase 0 intake)

### Weakest evidence chain in winner A

> Aim 2 leans on retrospective data quality assumptions not yet validated by Agent 3's preliminary checks. Recommend adding a brief feasibility paragraph citing Agent 6's similar-dataset references.
```

## Mini Case B — anti-length tiebreaker

When candidates are within ±20% length:

> Length is not a virtue. Both A and B fall in the same length bracket; preferring B because its evidence integrity score is 5 vs A's 4. Length itself does not enter the rubric.

## Mini Case C — INSUFFICIENT_EVIDENCE for Judge

If only one candidate was produced (Agent 5 failed):

```
INSUFFICIENT_EVIDENCE
missing_inputs:
  - at least 2 candidate paper drafts (received 1)
recommended_action: retry_upstream
```
