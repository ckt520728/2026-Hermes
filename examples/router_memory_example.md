# Router Memory Exemplar (v2.2)

`router_memory.jsonl` persists per-project past Router decisions and outcomes. Each line is one decision episode.

## Schema

```json
{
  "timestamp": "ISO-8601",
  "intent_keywords": ["list", "of", "extracted", "terms"],
  "classification": "full | clinical_only | literature | methods_rep | proposal",
  "confidence": 0.0,
  "was_correct": true,
  "user_feedback": null,
  "correction": null
}
```

## Mini Case A — successful past decision

```json
{
  "timestamp": "2026-05-12T09:14:00Z",
  "intent_keywords": ["EEG", "alpha power", "tDCS", "stroke", "Phase II"],
  "classification": "full",
  "confidence": 0.91,
  "was_correct": true,
  "user_feedback": "yes, exactly what I wanted",
  "correction": null
}
```

## Mini Case B — misclassified, with correction

```json
{
  "timestamp": "2026-05-18T13:22:00Z",
  "intent_keywords": ["systematic review", "neuroinflammation", "biomarkers"],
  "classification": "literature",
  "confidence": 0.78,
  "was_correct": false,
  "user_feedback": "I also wanted a proposal section",
  "correction": "proposal"
}
```

Future Router runs that see overlap with `["systematic review", "neuroinflammation"]` will include this case as a few-shot exemplar with the `correction` label, biasing toward `proposal`.

## Mini Case C — end-of-run capture prompt

After pipeline completes (or aborts), Orchestrator asks:

> Did the Router's choice (`full`) match what you wanted?
> [yes / no / partial — please specify]

The answer becomes `was_correct` + `user_feedback`. If `partial` or `no`, ask:
> Which pipeline would have been correct?

That becomes `correction`.

## Similarity matching (v2.2: Jaccard on keywords)

```python
def similarity(new_keywords, past_keywords):
    s1, s2 = set(new_keywords), set(past_keywords)
    return len(s1 & s2) / max(len(s1 | s2), 1)

def top_k_similar(memory, new_keywords, k=3, min_sim=0.2):
    scored = [(similarity(new_keywords, m["intent_keywords"]), m) for m in memory]
    scored = [(s, m) for s, m in scored if s >= min_sim]
    return [m for _, m in sorted(scored, reverse=True)[:k]]
```

Embeddings deferred to v2.3.
