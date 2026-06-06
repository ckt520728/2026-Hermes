# Faculty Flow Exemplar (v2.4)

`faculty_flow.jsonl` — one entry per handoff. Records:
- which faculties the upstream agent engaged (intensity from log),
- which faculties the downstream agent actually used (detected via cognitive probes),
- diff → flagged as `faculty_dropped_at_handoff`.

The flow log lets you SEE the cognitive content moving through the pipeline. When it disappears at a particular hop, you know where to intervene.

---

## Schema

```json
{
  "timestamp": "ISO-8601",
  "handoff": "A_n → A_m",
  "producer": "<producer_agent_name>",
  "producer_faculties_engaged": ["language", "logic", ...],
  "producer_engagement_intensity": {
    "language": "strong|medium|light|suppress",
    "logic":    "strong|medium|light|suppress",
    "social":   "strong|medium|light|suppress",
    "world":    "strong|medium|light|suppress"
  },
  "consumer": "<consumer_agent_name>",
  "consumer_faculties_acted_on": ["language", "logic", ...],
  "faculty_dropped_at_handoff": ["..."],
  "diagnostic": "PASS|WARN|FAIL: <message>"
}
```

---

## Mini Case A — clean handoff (PASS)

Agent 1 → Agent 2 handoff. A1 engaged Logic strongly. A2's output probe confirms Logic still strongly present.

```json
{
  "timestamp": "2026-06-06T10:14:00Z",
  "handoff": "A1 → A2",
  "producer": "agent1_compute",
  "producer_engagement_intensity": {
    "language": "medium", "logic": "strong", "social": "neutral", "world": "strong"
  },
  "consumer": "agent2_sim",
  "consumer_faculties_acted_on": ["language", "logic", "world"],
  "faculty_dropped_at_handoff": [],
  "diagnostic": "PASS: Logic + World carried through; Social was neutral upstream so no drop possible."
}
```

---

## Mini Case B — Social died at A4 → A5 handoff (WARN)

Agent 4 wrote a beautifully equity-aware clinical protocol. Agent 5's synthesis lost it.

```json
{
  "timestamp": "2026-06-06T10:48:00Z",
  "handoff": "A4 → A5",
  "producer": "agent4_clinical",
  "producer_engagement_intensity": {
    "language": "strong", "logic": "medium", "social": "strong", "world": "medium"
  },
  "consumer": "agent5_synthesis",
  "consumer_faculties_acted_on": ["language", "logic", "world"],
  "faculty_dropped_at_handoff": ["social"],
  "diagnostic": "WARN: Social engaged strongly upstream (A4 protocol has equity, consent quality, vulnerable-pop safeguards), but A5 paper Discussion does not show ToM markers (social_probe failed: no equity_addressed, no patient_perspective). Possible faculty-death."
}
```

**Recommended response:** before shipping, re-spawn A5 §Discussion with Social=strong steering and a pointer to the A4 sections with equity content.

---

## Mini Case C — intentional drop (PASS with note)

Agent 2 → A3 handoff. A2 had Social=SUPPRESS (per Phase Schedule). A3 needs Social=medium for subgroup equity. The schedule expects the change.

```json
{
  "timestamp": "2026-06-06T10:25:00Z",
  "handoff": "A2 → A3",
  "producer": "agent2_sim",
  "producer_engagement_intensity": {
    "language": "medium", "logic": "strong", "social": "suppress", "world": "medium"
  },
  "consumer": "agent3_data",
  "consumer_faculties_acted_on": ["language", "logic", "social", "world"],
  "faculty_dropped_at_handoff": [],
  "faculty_introduced_at_handoff": ["social"],
  "diagnostic": "PASS: Social introduced fresh at A3 (subgroup equity) — expected per Phase Schedule. No upstream content to drop."
}
```

`faculty_introduced_at_handoff` is the symmetric case — a faculty the producer didn't engage, the consumer needs.

---

## Mini Case D — Logic carried numerically but degraded qualitatively

A2's effect sizes get cited in A5 as bare numbers without the derivation context.

```json
{
  "timestamp": "2026-06-06T10:55:00Z",
  "handoff": "A2 → A5",
  "producer": "agent2_sim",
  "producer_engagement_intensity": {"logic": "strong", ...},
  "consumer": "agent5_synthesis",
  "consumer_faculties_acted_on": ["logic"],
  "faculty_dropped_at_handoff": [],
  "diagnostic": "PASS_WITH_NOTE: Logic numerically present in A5 (Cohen's d = 0.62 traces to A2's branch 1 winning sim). But derivation chain not surfaced; reader cannot see why d=0.62. Consider re-spawning A5 §Methods with explicit derivation."
}
```

This is a softer signal — Logic numerically alive, but not interpretably alive.

---

## Detection rule (pseudocode)

```python
def detect_faculty_drops(producer_intensity, consumer_probes):
    drops = []
    for faculty in ["language", "logic", "social", "world"]:
        producer_level = producer_intensity[faculty]
        if producer_level in ["strong", "medium"]:
            consumer_engaged = consumer_probes[faculty]["verdict"] == "PASS"
            if not consumer_engaged:
                drops.append(faculty)
    return drops
```

The probe verdicts from v2.3's `cognitive_probes/` are the ground truth for "consumer actually used this faculty."

---

## End-of-run summary

After all handoffs logged, the orchestrator computes:

```
Faculty flow summary
─────────────────────
Handoffs total:        5
Clean (PASS):          3
With notes:            1
Faculty deaths (WARN): 1  ← A4 → A5 lost Social

Most fragile handoff: A4 → A5 (Social)
Recommended fix: see Pitfall #21 in v2.4 skill doc
```
