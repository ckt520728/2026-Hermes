# Blog Post Image Mapping — Multi-Agent tDCS Pipeline

This reference maps figures to their positions in the blog post for the multi-agent closed-loop tDCS research pipeline article.

## Source → Destination Mapping

| Source (figures/) | Destination (blog/multi-agent-tdcs/) | Placement | Purpose |
|---|---|---|---|
| `blog-cover-multi-agent-research-pipeline.png` | `cover.png` | Article top, after first `<p>` | Cover image |
| `multi-agent-research-pipeline-architecture.png` | `multi-agent-research-pipeline-architecture.png` | After Agent table | Pipeline architecture overview |
| `nmm-three-node-model-schematic.png` | `nmm-three-node-model-schematic.png` | After NMM formula | 3-node NMM schematic |
| `atr_simulation.png` | `atr_simulation.png` | After "ATR 隨 severity" finding | ATR simulation curve |
| `fig1_spectra_and_heatmap.png` | `fig1_spectra_and_heatmap.png` | After Stage 2 key findings | Power spectra & heatmap |
| `fig2_game_theory.png` | `fig2_game_theory.png` | After Game Theory paragraph | Game-theoretic analysis |
| `game-theoretic-co-adaptation-dynamics.png` | `game-theoretic-co-adaptation-dynamics.png` | After Co-Adaptation paragraph | Phase portrait dynamics |
| `trial_design.svg` | `trial_design.svg` | After Phase IIa callout box | Trial design flowchart |
| `timeline.png` | `timeline.png` | After Agent 5 output list | Gantt timeline |

## HTML Template for Each Figure

```html
<figure>
  <img src="blog/multi-agent-tdcs/<file>" alt="<description>" onerror="this.parentElement.style.display='none'">
  <figcaption><description with context>.</figcaption>
</figure>
```

## Lessons from This Post

1. **Cover image**: Largest PNG with "blog-cover" prefix in `figures/` → always rename to `cover.png`
2. **Architecture diagram**: Usually the widest/deepest pipeline image → place after the Agent table
3. **SVG files**: Can be embedded directly with `<img src="...svg">` — Netlify serves correct MIME type
4. **Figure ordering**: Follow the narrative flow (architecture → model → simulation → theory → clinical → timeline)
5. **Alt text**: Write in Chinese to match the article language
