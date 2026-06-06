# World Probe (v2.3)

Analog of literature-grounding / DMN-style integration check. Tests whether the output is anchored in the field rather than drifting on the model's own priors.

## Checklist

```yaml
probe: world
subject: <path>
checks:
  - id: citations_from_a6
    test: "≥80% of citations in the final paper are drawn from Agent 6's reference list (the literature_review entry IDs)"
    method: "set intersection / set difference"
  - id: no_fabricated_citations
    test: "Every cited DOI / PubMed ID resolves to a real entry"
    method: "API check or grep against A6's reviewed list"
  - id: precedent_acknowledged
    test: "Discussion situates the result on the prior arc of the field (≥1 sentence on what was believed before this work)"
    method: "manual"
  - id: throughline_intact
    test: "Section ordering supports a single narrative: question → method → result → implication. Abstract claim matches Conclusion claim."
    method: "manual / sentence-pair comparison"
  - id: long_horizon_implication
    test: "≥1 explicit '5-year' or '10-year' or 'next decade' framing of where the line of work goes"
    method: "regex + manual"

verdict_rule: "PASS if ≥4 of 5 checks pass AND no_fabricated_citations = true (mandatory)."
on_fail: "Trigger Agent 8 Reflector specifically on the failing section."
```

## Note on the DMN connection

MiCRo's World expert engages on **long-timescale, event-level processing** — exactly what `throughline_intact` and `long_horizon_implication` are testing. These are the two checks that most distinguish a synthesized-by-DMN-faculty document from a stapled-section document.
