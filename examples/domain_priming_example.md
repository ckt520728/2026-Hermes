# Phase 0.75 — Domain Priming Exemplar (v2.3)

Opt-in curriculum step inspired by **MiCRo's Stage-1** (Alkhamissi et al. 2026): ~3,055 curated samples were enough to induce specialization that persisted through 939K-sample end-to-end fine-tuning. For LLM-orchestration, the analog is far smaller: **3 mini-cases per agent**.

## When to enable

```yaml
metadata:
  domain_priming:
    enabled: true
    cases_per_agent: 3
```

Enable for: high-stakes grant deadlines, clinical Stage 4 work, projects in domains the agent might not have strong priors on (rare disease, unusual model class).

Disable for: exploratory pilots, fast iteration, tight cost budget.

## Schema — one priming case

```yaml
case:
  agent: agent1
  faculties_to_exercise: [logic, world]
  mini_goal: "Derive the steady-state firing rate of a leaky integrate-and-fire neuron under constant input current."
  mini_context: |
    You are warming up for a project on [target disease]. This is NOT the project task.
    This is a calibration exercise. Produce a brief, correct answer.
  expected_signature:
    - "Equation includes I, R, V_threshold, V_reset, tau_m"
    - "Result is in spikes/second or Hz"
    - "Logic-derivation chain has no leaps"
  cost_tier: haiku   # priming uses the cheap tier
```

## Mini Case A — Three priming cases for Agent 1 (Computational Modeler)

```yaml
priming_cases_for_agent1:
  - case_id: a1_prime_1
    faculties: [logic]
    mini_goal: "Write the differential equation for a leaky integrate-and-fire neuron."
  - case_id: a1_prime_2
    faculties: [logic, world]
    mini_goal: "Name 3 neural mass models commonly used to model EEG alpha rhythm."
  - case_id: a1_prime_3
    faculties: [logic]
    mini_goal: "Given excitatory-inhibitory coupling strength g, what determines whether the network oscillates vs settles?"
```

After these 3 cases, Agent 1 enters the real Phase 1 with faculties primed and domain context refreshed.

## Mini Case B — Three priming cases for Agent 4 (Clinical Researcher)

```yaml
priming_cases_for_agent4:
  - case_id: a4_prime_1
    faculties: [social, logic]
    mini_goal: "List 5 components of an IRB-required informed consent form."
  - case_id: a4_prime_2
    faculties: [social]
    mini_goal: "Name one equity concern that arises when recruiting elderly participants for an interventional trial."
  - case_id: a4_prime_3
    faculties: [logic]
    mini_goal: "Given effect size d=0.5 and α=0.05, what's the approximate N per arm for power=0.80?"
```

Note A4's priming emphasizes **Social faculty** — equity, consent, vulnerable populations — because that's where Agent 4's role most depends on faculties the model would otherwise under-engage.

## Mini Case C — Priming log entry

```json
{
  "timestamp": "2026-06-06T08:14:00Z",
  "agent": "agent4_clinical",
  "case_id": "a4_prime_2",
  "faculties_exercised": ["social"],
  "response_summary": "Discussed access barriers, fatigue, cognitive load, transport, comorbidity-related dropout, lay-language consent.",
  "self_report_faculty_engagement": {"social": "strong", "logic": "light"},
  "judgement": "passed — agent demonstrates the Social faculty is accessible",
  "cost_usd": 0.002
}
```

## Pitfall — don't let priming dictate content

Priming exemplars should be **calibration**, not **template**. If the priming case asks "list 3 neural mass models" and Agent 1 later proposes one of those 3 in the real project, that's fine. If Agent 1 only proposes one of those 3 because of priming, even when a better choice exists, the priming has biased the work. The orchestrator should monitor for this by occasionally running an un-primed control to compare.
