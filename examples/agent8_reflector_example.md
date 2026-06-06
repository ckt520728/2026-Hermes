# Agent 8 — Reflector Exemplar (v2.3)

The Reflector reads the **already-shipped** winner (paper + grant) and produces a critical post-hoc read, as if the original author is re-reading 3 months after submission. It does NOT override the Judge. It only annotates.

Inspired by MiCRo's **World expert / Default Mode Network** — the brain network engaged during self-reflection, memory recall, and long-timescale integration.

## Mini Case A — reflection report skeleton

```markdown
# Reflector Pass — agent8_reflection.md

> I am NOT overriding the Judge. The shipped paper is `agent5_research_paper_final.md`
> (Candidate B, clinical-translational angle). The shipped grant is `agent5_grant_proposal_final.md`
> (Candidate A, NIH Specific Aims format). The following are reflective annotations only.

## (a) Single most-vulnerable claim

> In §3.2, paragraph 2, the claim that [effect generalizes to elderly subgroup] is supported
> by N=[x] in that subgroup, with confidence interval [a, b] crossing zero by [Δ]. A reviewer
> will likely note that this is underpowered and ask for either a subgroup-specific replication
> or a weaker claim. Recommended defense: cite [precedent study with similar caveat] and
> commit to subgroup-N adequacy in the Phase III protocol.

## (b) One implication under-developed

> The paper establishes that [mechanism] predicts [biomarker]. The discussion briefly mentions
> diagnostic potential, but does not develop the **early-detection** angle: if the biomarker
> shifts before clinical symptoms, this could reset the diagnostic timeline. Adding one
> paragraph on this would strengthen funder appeal without changing the result.

## (c) One alternative framing

> The current narrative frames this as a [mechanism → biomarker → diagnostic] chain.
> An alternative is [environmental factor → mechanism → biomarker], which would tie into
> [public health / prevention] literature and broaden the relevance audience. This framing
> would NOT require new analyses, only re-orienting the introduction and discussion.

## (d) Follow-up work this paper sets up

> The strongest follow-up: a [longitudinal Phase IIb study] specifically designed to test
> whether the biomarker shifts BEFORE symptoms in [population]. The grant's Aim 3 hints at
> this but does not commit. The shipped grant could be revised in submission round 2 to make
> this Aim 3 explicit, given that the current work establishes feasibility.

## Faculty engagement self-report

- **World (strong):** stepped back from sentence-level to assess throughline.
- **Social (medium):** adopted reviewer + patient + clinician perspectives in (a).
- **Logic (medium):** checked subgroup math in (a).
- **Language (light):** no terminology drift detected during read.
```

## Mini Case B — Reflector returns INSUFFICIENT_EVIDENCE

If the winning artifact is missing or empty:

```
INSUFFICIENT_EVIDENCE
missing_inputs:
  - agent5_research_paper_final.md (file not found)
  - judge_ensemble_decision.md (could not parse winner)
recommended_action: retry_upstream
```

## Mini Case C — Reflector finds nothing to flag

A rare but legitimate output. Reflector should NOT manufacture concerns.

```markdown
# Reflector Pass

> I am NOT overriding the Judge. ...
>
> ## (a) Single most-vulnerable claim
> After three readings, I do not identify a single claim notably weaker than the rest. The
> evidence chain in §3 is tight; the limitations section already addresses what I would have
> flagged. This is uncommon; if you want a forced critique, request a second reflection pass
> with a more adversarial prompt.
>
> ## (b)–(d) ...
```

## Why the Reflector is annotative, not overruling

If the Reflector could overrule, it would be a third Judge, and we already have ensemble disagreement handling for that. The Reflector's value is **after-the-fact** integration — the kind of pattern that emerges from reading the whole thing as one document rather than piece by piece. Letting it overrule would collapse it into the Judge ensemble; keeping it annotative lets the user see both the shipped artifact and the late critique side by side.
