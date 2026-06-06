# Judge Ensemble Exemplar (v2.2)

Two Judges run independently:

- **Judge A — Rigor rubric** (Coherence, Evidence integrity, Falsifiability, No fabrication, Refusal honoring)
- **Judge B — Translational rubric** (Clinical relevance, Feasibility, Equity, Safety framing, Funder appeal)

## Mini Case A — Agreement (ship)

```yaml
judge_a:
  winner: B    # candidate B (clinical-translational angle)
  rubric_scores:
    coherence:         5
    evidence_integrity:5
    falsifiability:    4
    no_fabrication:    5
    refusal_honoring:  5
    total: 24

judge_b:
  winner: B
  rubric_scores:
    clinical_relevance:  5
    feasibility:         4
    equity:              4
    safety_framing:      5
    funder_appeal:       5
    total: 23

ensemble_decision:
  status: AGREE
  shipped: B
  rationale: "Both judges pick B; ship without escalation."
```

## Mini Case B — Disagreement (escalate)

```yaml
judge_a:
  winner: A    # rigorous mechanistic angle scored higher
  rubric_scores: { ..., total: 24 }
  rationale: "A has tighter evidence chain in §3.2"

judge_b:
  winner: B    # translational angle scored higher
  rubric_scores: { ..., total: 22 }
  rationale: "B better matches NIH NINDS funder priorities"

ensemble_decision:
  status: DISAGREE
  escalation:
    presented_to_user: true
    user_prompt: |
      Judge A picks A (rigor 24 vs 21). Judge B picks B (translational 22 vs 18).
      Which matters more for your goal?
        1. Ship A  (preserve scientific rigor; harder to fund)
        2. Ship B  (better funder fit; weaker §3.2 evidence chain)
        3. Tell me a combined revision
  user_choice: 2
  shipped: B
  rationale: "User prioritized funder fit over §3.2 strength."
```

## Mini Case C — User declines to tie-break

```yaml
ensemble_decision:
  status: DISAGREE
  escalation:
    presented_to_user: true
    user_choice: "skip"
  shipped: A    # default: Judge A's winner
  rationale: "User declined tie-break; defaulted to rigor rubric winner."
```

## Decision rule (pseudocode)

```python
def ensemble_decide(judge_a, judge_b, user_io):
    if judge_a.winner == judge_b.winner:
        return ship(judge_a.winner, status="AGREE")
    # Disagreement
    user_choice = user_io.ask(
        f"Judge A picks {judge_a.winner} (rigor {judge_a.total} vs {opp_a}). "
        f"Judge B picks {judge_b.winner} (translational {judge_b.total} vs {opp_b}). "
        "Which matters more?"
    )
    if user_choice == "skip":
        return ship(judge_a.winner, status="DISAGREE_DEFAULT_A")
    return ship(user_choice, status="DISAGREE_USER_TIEBREAK")
```

## Anti-redundancy check

If across N=20 runs Judge A and Judge B agree >95% of the time, the rubrics are redundant. Audit Judge B's rubric for dimensions that don't actually differ from A.
