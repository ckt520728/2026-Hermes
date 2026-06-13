---
name: loop-engineering-ml-eeg
description: "Use when designing or automating ML research pipelines for EEG analysis using Loop Engineering principles. Triggers on: EEG pipeline automation, autonomous ML experiments, agent-driven research loops, AutoResearch, MLOps agent orchestration, self-correcting ML pipelines, overnight experiment runs. Covers: research loop architecture, multi-agent EEG analysis, Karpathy AutoResearch patterns, NeuroWeaver pipeline search, EEGAgent framework."
version: 1.0.0
author: OWL (ZOO) for KT
license: MIT
platforms: [windows, linux, macos]
metadata:
  hermes:
    tags: [mlops, loop-engineering, eeg, ml-pipeline, agent, automation, autoresearch, neuroweaver, eegagent, multitask]
    related_skills: [weights-and-biases, jupyter-live-kernel, dspy]
---

# Loop Engineering × ML/EEG Pipeline Automation

## Overview

**Loop Engineering** is the 2026 paradigm shift from *manually prompting AI* to **designing autonomous loops that prompt, execute, evaluate, and iterate on AI agents** without continuous human intervention.

This skill applies Loop Engineering specifically to **ML research pipelines for EEG analysis** — enabling autonomous experiment loops that clean data, extract features, train models, evaluate results, and iterate while you sleep.

### Key Insight

> "My job is no longer to prompt Claude. It's to write loops that prompt Claude."
> — **Boris Cherny**, Creator & Head of Claude Code, Anthropic

> "The solution isn't a better prompt. It's a **Reasoning Loop** with a fixed anchor of truth."
> — **Harsh Gupta**, "The Death of the Prompt" (Medium, Apr 2026)

### Academic Foundations

| Paper | Venue | Year | Relevance |
|---|---|---|---|
| **NeuroWeaver**: Autonomous Evolutionary Agent for EEG Pipeline Exploration | arXiv 2602.13473 | 2026 | LLM-driven evolutionary agent that auto-generates EEG analysis pipelines |
| **EEGAgent**: Unified LLM Framework for Automated EEG Analysis | AAAI | 2026 | Multi-tool LLM agent for EEG preprocessing, feature extraction, event detection |
| **AutoResearch**: Looping ML Experiments with AI Agents | Karpathy (open-source) | 2025 | 630-line autonomous ML experiment loop (ratchet pattern) |
| **AutoLabs**: Multi-Agent Self-Correction for Autonomous Experimentation | arXiv 2509.25651 | 2025 | Multi-agent architecture with iterative self-correction (85% error reduction) |

---

## When to Use This Skill

**Use when:**
- Designing automated EEG preprocessing → feature extraction → classification pipelines
- Running hyperparameter searches or model architecture explorations autonomously
- Building overnight/nightsloop ML experiment agents
- Integrating W&B experiment tracking into autonomous loops
- Creating multi-agent systems for EEG research workflows
- Automating the iterative cycle: experiment → evaluate → improve → repeat

**Don't use for:**
- One-off manual model training sessions
- Clinical diagnosis without expert verification
- Simple data analysis not requiring iteration
- Tasks not involving ML pipelines or agent loops

---

## Architecture: The Research Loop

### Core Loop Pattern (Ratchet Loop)

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESEARCH LOOP (Ratchet)                       │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  READ     │───▶│ PROPOSE  │───▶│ EXECUTE  │───▶│ EVALUATE │  │
│  │  state    │    │ change   │    │ short    │    │ metric   │  │
│  │          │    │          │    │ exp      │    │ vs best  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       ▲                                              │           │
│       │           ┌──────────┐    ┌──────────┐       │           │
│       │           │  COMMIT  │◀───│  DECIDE  │◀──────┘           │
│       │           │  to git  │    │ keep?    │                    │
│       │           └──────────┘    └──────────┘                    │
│       │              │                                            │
│       └──────────────┘ (update best, repeat)                      │
│                                                                  │
│  ⚠️  RATCHET RULE: Only KEEP changes that IMPROVE the metric     │
└─────────────────────────────────────────────────────────────────┘
```

### Multi-Agent Architecture (NeuroWeaver × EEGAgent inspired)

```
┌─────────────────────────────────────────────────────────┐
│                  EEG Research Agent System                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              🧠 Planner / Manager Agent            │  │
│  │  - Reads research brief (research_brief.md)        │  │
│  │  - Decomposes into sub-tasks                       │  │
│  │  - Delegates to specialist agents                  │  │
│  │  - Makes final decisions with human-in-the-loop    │  │
│  └───────┬──────────┬──────────┬──────────┬───────────┘  │
│          │          │          │          │               │
│   ┌──────▼──┐ ┌────▼────┐ ┌───▼─────┐ ┌──▼───────┐     │
│   │ Data    │ │Feature  │ │ Model   │ │Evaluator │     │
│   │ Cleaning│ │Engineer │ │ Trainer │ │ & Critic │     │
│   │ Agent   │ │ Agent   │ │ Agent   │ │ Agent    │     │
│   └─────────┘ └─────────┘ └─────────┘ └──────────┘     │
│                                                          │
│   TOOLS: MNE-Python │ scipy │ scikit-learn │ PyTorch   │
│          W&B │ Git │ CLI execution │ Notion API         │
└─────────────────────────────────────────────────────────┘
```

---

## Level 1: Karpathy AutoResearch for EEG

### Minimal Setup (start here)

Copy the template from `scripts/autoresearch_eeg.py` and customize:

```python
"""
EEG AutoResearch Loop
Based on Karpathy's AutoResearch pattern, adapted for EEG classification.
Requires: pip install wandb mne scikit-learn pandas numpy
Usage: python scripts/autoresearch_eeg.py
"""

import subprocess
import json
import time
from pathlib import Path
import wandb

# ─── Configuration ─────────────────────────────────────────
RESEARCH_BRIEF = Path("research_brief.md")
EXPERIMENT_SCRIPT = Path("train.py")
MAX_EXPERIMENTS = 50
MAX_EXP_TIME_SEC = 300  # 5 minutes per experiment
TARGET_METRIC = "val_accuracy"  # or "auc", "f1_score"
METRIC_DIRECTION = "maximize"   # or "minimize"
WANDB_PROJECT = "eeg-autoresearch"
GIT_BRANCH = "autoresearch"

# ─── Ratchet Loop ──────────────────────────────────────────
def run_experiment():
    """Execute one experiment and return the metric."""
    result = subprocess.run(
        ["python", str(EXPERIMENT_SCRIPT)],
        capture_output=True, text=True, timeout=MAX_EXP_TIME_SEC
    )
    if result.returncode != 0:
        return None, result.stderr
    
    # Read metric from W&B
    metric = wandb.run.summary.get(TARGET_METRIC)
    return metric, result.stdout

def commit_if_better(metric, best_metric):
    """Only keep changes that improve the target metric."""
    improved = (metric > best_metric) if METRIC_DIRECTION == "maximize" \
               else (metric < best_metric)
    if improved:
        subprocess.run(["git", "checkout", "-b", f"exp-{metric:.4f}"])
        subprocess.run(["git", "add", "."])
        subprocess.run(["git", "commit", "-m", f"exp: {TARGET_METRIC}={metric:.4f}"])
        return True
    return False

# ─── Main Loop ─────────────────────────────────────────────
best_metric = float('-inf') if METRIC_DIRECTION == 'maximize' else float('inf')
wandb.init(project=WANDB_PROJECT, name="autoresearch-loop")

for i in range(MAX_EXPERIMENTS):
    print(f"\n{'='*60}")
    print(f"  Experiment {i+1}/{MAX_EXPERIMENTS} | Best: {best_metric:.4f}")
    print(f"{'='*60}")
    
    # Run experiment
    metric, log = run_experiment()
    if metric is None:
        print(f"  ⚠️ Experiment failed: {log[:200]}")
        continue
    
    # Ratchet: keep or discard
    if commit_if_better(metric, best_metric):
        best_metric = metric
        print(f"  ✅ NEW BEST: {TARGET_METRIC} = {metric:.4f}")
    else:
        subprocess.run(["git", "checkout", GIT_BRANCH])
        subprocess.run(["git", "reset", "--hard", "HEAD~1"])
        print(f"  ❌ Discarded: {TARGET_METRIC} = {metric:.4f} (best: {best_metric:.4f})")

print(f"\n🏁 Loop complete. Best {TARGET_METRIC}: {best_metric:.4f}")
wandb.finish()
```

### W&B Integration

```python
import wandb

# Initialize run with full config tracking
wandb.init(
    project="eeg-dementia-classification",
    name=f"loop-exp-{timestamp}",
    config={
        "eeg_bandpass": [0.5, 45],     # Hz
        "epoch_length": 4.0,            # seconds
        "feature_set": "connectivity",   # spectral/connectivity/both
        "model": "EEGNet",              # EEGNet/ShallowConvNet/Transformer
        "lr": 1e-3,
        "n_epochs": 100,
    },
    tags=["autoresearch", "dementia", "loop-engineering"]
)

# Log metrics each epoch
wandb.log({
    "train_loss": loss,
    "val_accuracy": acc,
    "val_auc": auc,
    "val_f1": f1,
    "model_params": n_params,
    "inference_time_ms": inf_time,
})

# Log EEG-specific artifacts
wandb.log({
    "topomap": wandb.Image("topomap.png"),
    "confusion_matrix": wandb.plot.confusion_matrix(y_true, y_pred),
    "eeg_sample": wandb.Image("eeg_sample_trace.png"),
})
```

---

## Level 2: NeuroWeaver-Inspired Pipeline Search

### Domain-Informed EEG Pipeline Search Space

```python
"""
NeuroWeaver-style pipeline search, constrained by neurophysiological priors.
Each pipeline = (preprocessing, features, classifier) tuple.
"""

from dataclasses import dataclass
from typing import Optional

@dataclass
class EEGPipeline:
    """A complete EEG analysis pipeline specification."""
    
    # ── Preprocessing (Stage 1) ──
    bandpass_low: float = 0.5    # Hz — never go below 0.1Hz unless resting-state
    bandpass_high: float = 45.0  # Hz — above 50Hz is usually muscle artifact
    notch_freq: float = 60.0     # Hz — 50 for EU, 60 for US
    resample_rate: int = 256     # Hz
    segmentation_length: float = 4.0  # seconds
    preprocessing_steps: list = None  # ["bad_channel_interp", "ICA", "ASR"]
    
    # ── Feature Extraction (Stage 2) ──
    feature_type: str = "multi"  # "spectral", "temporal", "connectivity", "all"
    frequency_bands: dict = None
    connectivity_method: str = "coh"  # "coh", "pli", "wpli", "imcoh"
    
    # ── Classification (Stage 3) ──
    classifier: str = "eegnet"  # "svm", "eegnet", "sleepenet", "transformer"
    classifier_params: dict = None
    
    # ── Results ──
    accuracy: Optional[float] = None
    n_parameters: Optional[int] = None
    is_neuroscientifically_plausible: bool = True

    def __post_init__(self):
        if self.preprocessing_steps is None:
            self.preprocessing_steps = ["bandpass", "bad_channel_interp", "average_ref"]
        if self.frequency_bands is None:
            self.frequency_bands = {
                "delta": [1, 4], "theta": [4, 8],
                "alpha": [8, 13], "beta": [13, 30], "gamma": [30, 45]
            }
        if self.classifier_params is None:
            self.classifier_params = {}

# ── Plausibility constraints (never violate) ──
NEUROCONSTRAINTS = {
    "bandpass_low":  [0.1, 5.0],
    "bandpass_high": [30.0, 100.0],
    "min_channels":  4,
    "epoch_length_min": 1.0,
    "epoch_length_max": 30.0,
}

def is_plausible(pipeline: EEGPipeline) -> bool:
    """Reject neuroscientifically invalid pipelines before execution."""
    if pipeline.bandpass_low >= pipeline.bandpass_high:
        return False
    if pipeline.resample_rate < 128:
        return False
    if pipeline.segmentation_length < 1.0:
        return False
    return True
```

### Multi-Objective Evolutionary Search

```python
class EvolutionaryPipelineSearch:
    """NeuroWeaver-inspired evolutionary agent for EEG pipeline selection."""
    
    def __init__(self, population_size=10, n_generations=20):
        self.pop_size = population_size
        self.n_gen = n_generations
        self.population = []
        self.history = []
        
    def initialize_population(self):
        """Domain-informed initialization: only neuroscientifically plausible pipelines."""
        import random
        for _ in range(self.pop_size):
            pipeline = EEGPipeline(
                bandpass_low=random.choice([0.1, 0.5, 1.0]),
                bandpass_high=random.choice([30, 40, 45]),
                feature_type=random.choice(["spectral", "connectivity", "multi", "all"]),
                classifier=random.choice(["svm", "eegnet", "transformer"]),
            )
            if is_plausible(pipeline):
                self.population.append(pipeline)
    
    def evaluate(self, pipeline: EEGPipeline) -> float:
        """Execute pipeline and return accuracy metric."""
        from train import run_pipeline
        results = run_pipeline(pipeline)
        pipeline.accuracy = results["accuracy"]
        pipeline.n_parameters = results["n_params"]
        return pipeline.accuracy
    
    def select_parents(self, k=2):
        """Tournament selection based on performance + novelty."""
        import random
        candidates = random.sample(self.population, k=k*2)
        return sorted(candidates, key=lambda p: p.accuracy or 0, reverse=True)[:k]
    
    def crossover(self, p1: EEGPipeline, p2: EEGPipeline):
        """Combine two parent pipelines."""
        import random
        child = EEGPipeline(
            bandpass_low=random.choice([p1.bandpass_low, p2.bandpass_low]),
            bandpass_high=random.choice([p1.bandpass_high, p2.bandpass_high]),
            feature_type=random.choice([p1.feature_type, p2.feature_type]),
            classifier=random.choice([p1.classifier, p2.classifier]),
        )
        return child if is_plausible(child) else random.choice([p1, p2])
    
    def mutate(self, pipeline: EEGPipeline):
        """Random mutation with plausibility check."""
        import random
        mutated = EEGPipeline(**vars(pipeline))
        field = random.choice(["bandpass_low", "bandpass_high", "feature_type", "classifier"])
        if field == "classifier":
            mutated.classifier = random.choice(["svm", "eegnet", "sleepenet", "transformer"])
        elif field == "feature_type":
            mutated.feature_type = random.choice(["spectral", "temporal", "connectivity", "all"])
        return mutated if is_plausible(mutated) else pipeline
    
    def run_search(self):
        """Main evolutionary loop."""
        self.initialize_population()
        for gen in range(self.n_gen):
            for i, pipe in enumerate(self.population):
                if pipe.accuracy is None:
                    self.evaluate(pipe)
            self.population.sort(key=lambda p: p.accuracy or 0, reverse=True)
            new_pop = self.population[:2]  # Elitism
            while len(new_pop) < self.pop_size:
                parents = self.select_parents()
                child = self.crossover(*parents)
                if random.random() < 0.3:
                    child = self.mutate(child)
                new_pop.append(child)
            self.population = new_pop
        return self.population[0]
```

---

## Level 3: Multi-Agent EEG Research System

### Agent Definitions

```python
"""
Multi-Agent EEG Research System
Architecture inspired by AutoLabs (2025) + EEGAgent (AAAI 2026)

Four specialist agents + one manager:
  1. DataAgent    — EEG preprocessing & artifact rejection
  2. FeatureAgent  — Feature extraction & selection
  3. ModelAgent    — Model training, tuning, architecture search
  4. CriticAgent   — Result verification, error analysis, suggestion
"""

from dataclasses import dataclass, field
from typing import Any
from enum import Enum

class AgentRole(Enum):
    DATA = "data_agent"
    FEATURE = "feature_agent"
    MODEL = "model_agent"
    CRITIC = "critic_agent"
    MANAGER = "manager_agent"

@dataclass
class AgentMessage:
    sender: AgentRole
    receiver: AgentRole
    action: str
    data: dict = field(default_factory=dict)
    requires_human: bool = False

class EEGResearchManager:
    """Top-level manager that orchestrates the research loop."""
    
    def __init__(self, research_brief_path: str):
        self.brief = Path(research_brief_path).read_text()
        self.history = []
        self.wandb_project = "eeg-research-loop"
        
    def research_loop(self, max_iterations=20):
        best_result = None
        for iteration in range(max_iterations):
            clean_data = self.run_data_agent()
            features = self.run_feature_agent(clean_data)
            result = self.run_model_agent(features)
            critique = self.run_critic_agent(result, best_result)
            
            if critique["should_commit"]:
                best_result = result
                self.commit_result(result, critique)
                if not critique["continue_loop"]:
                    break
                self.apply_suggestion(critique["suggestion"])
            else:
                self.apply_suggestion(critique["suggestion"])
        return best_result
    
    def run_data_agent(self):
        import mne
        raw = mne.io.read_raw_edf("data.eeg", preload=True)
        raw.filter(0.5, 45, fir_design='firwin')
        raw.notch_filter(60)
        ica = mne.preprocessing.ICA(n_components=15, random_state=42)
        ica.fit(raw)
        ica.exclude = [0]
        raw_clean = ica.apply(raw.copy())
        return {"raw": raw_clean, "status": "clean"}
    
    def run_feature_agent(self, data):
        raw = data["raw"]
        features = {}
        for band, (fmin, fmax) in [("delta",(1,4)), ("theta",(4,8)),
                                      ("alpha",(8,13)), ("beta",(13,30))]:
            psds, freqs = mne.time_frequency.psd_array_welch(
                raw.get_data(), sfreq=raw.info['sfreq'],
                fmin=fmin, fmax=fmax, n_fft=256
            )
            features[f"{band}_power"] = psds.mean(axis=1)
        return {"feature_vector": features, "n_features": len(features)}
    
    def run_model_agent(self, features):
        from sklearn.model_selection import cross_val_score
        from sklearn.ensemble import RandomForestClassifier
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
        return {
            "metric": scores.mean() * 100,
            "std": scores.std() * 100,
            "model_type": "RandomForest",
        }
    
    def run_critic_agent(self, result, best_result):
        if best_result is None:
            return {"should_commit": True, "continue_loop": True,
                    "suggestion": "First result, commit as baseline"}
        improvement = result["metric"] - best_result["metric"]
        if improvement > 0.5:
            return {"should_commit": True, "continue_loop": True,
                    "suggestion": {"type": "hyperparameter_tweak",
                                   "detail": f"Improved by {improvement:.2f}%"}}
        elif improvement > 0:
            return {"should_commit": True, "continue_loop": True,
                    "suggestion": {"type": "minor_tweak",
                                   "detail": "Marginal gain, try different features"}}
        else:
            return {"should_commit": False, "continue_loop": True,
                    "suggestion": {"type": "architecture_change",
                                   "detail": "No improvement, try different model"}}
    
    def commit_result(self, result, critique):
        import subprocess
        subprocess.run(["git", "add", "."])
        subprocess.run(["git", "commit", "-m",
                       f"research-loop: {result['metric']:.2f}% acc"])
    
    def apply_suggestion(self, suggestion):
        import yaml
        config = yaml.safe_load(open("config.yaml"))
        if suggestion["type"] == "hyperparameter_tweak":
            config["lr"] = config["lr"] * 0.5
        elif suggestion["type"] == "architecture_change":
            config["model"] = "transformer"
        yaml.dump(config, open("config.yaml", "w"))
```

---

## Human-in-the-Loop Gates

Always include these checkpoints where the human researcher must approve:

| Gate | When | What to Verify |
|---|---|---|
| **Gate 1: Brief validation** | Before loop starts | Research directions, data usage, metric choice |
| **Gate 2: Plausibility check** | Before pipeline execution | Preprocessing steps make neurophysiological sense |
| **Gate 3: Architecture change** | When critic suggests major change | Switching feature type or classifier family |
| **Gate 4: Publication** | Before writing paper | All results verified, statistics correct |
| **Gate 5: Safety stop** | Always available | Kill switch to halt loop at any time |

### Signal-based kill switch

```python
import signal
import sys

SHUTDOWN = False

def graceful_shutdown(signum, frame):
    global SHUTDOWN
    print("\n\n🛑 Shutdown received. Finishing current experiment...")
    SHUTDOWN = True
    wandb.finish()
    state = {"last_iteration": i, "best_result": best_result}
    json.dump(state, open("loop_state.json", "w"))
    sys.exit(0)

signal.signal(signal.SIGINT, graceful_shutdown)
signal.signal(signal.SIGTERM, graceful_shutdown)
```

---

## Toolchain Integration

| Component | Recommended Tool | Purpose | Skill Reference |
|---|---|---|---|
| **Agent Orchestration** | Claude Code / LangGraph | Write and manage loops | — |
| **EEG Processing** | MNE-Python | Preprocessing, epoching, ICA | — |
| **ML Training** | PyTorch + EEGNet | Model training | — |
| **Experiment Tracking** | Weights & Biases | Metric logging, comparison | `weights-and-biases` |
| **Pipeline Management** | ZenML / MLflow | Pipeline versioning | — |
| **Code Versioning** | Git + Worktrees | Each experiment in isolation | — |
| **Scheduling** | Cron / Codex Automations | Nightly experiment runs | — |
| **Knowledge Management** | Notion API | Auto-report to research notes | `notion` |
| **Notebook Iteration** | Jupyter Live Kernel | Interactive development | `jupyter-live-kernel` |
| **ML Framework** | DSPy | Declarative LM programs | `dspy` |

---

## Project Structure Template

```
eeg-research-loop/
├── research_brief.md          ← Human-written research directions
├── config.yaml                ← Hyperparameter search space
├── loop_state.json            ← Resume state (auto-saved)
│
├── src/
│   ├── agents/
│   │   ├── manager.py         ← Orchestrator agent
│   │   ├── data_agent.py      ← EEG preprocessing
│   │   ├── feature_agent.py   ← Feature extraction
│   │   ├── model_agent.py     ← Model training
│   │   └── critic_agent.py    ← Evaluation & suggestion
│   │
│   ├── pipeline/
│   │   ├── preprocessing.py   ← Filter, ICA, epoch
│   │   ├── features.py        ← Spectral, connectivity, entropy
│   │   ├── models.py          ← EEGNet, SVM, Transformer
│   │   └── evaluation.py      ← Cross-val, metrics, plots
│   │
│   └── utils/
│       ├── io.py              ← EDF/BDF loading
│       ├── viz.py             ← Topomaps, ERP plots
│       └── report.py          ← Auto-generate reports
│
├── scripts/
│   ├── autoresearch_eeg.py    ← Level 1: Karpathy-style loop
│   ├── evolutionary_search.py ← Level 2: NeuroWeaver-style search
│   └── multi_agent_system.py  ← Level 3: Full multi-agent
│
├── templates/
│   ├── research_brief.md      ← Template for research directions
│   └── config.yaml            ← Template for search space
│
├── notebooks/
│   └── exploration.ipynb      ← Interactive EEG exploration
│
├── tests/
│   ├── test_preprocessing.py
│   ├── test_features.py
│   └── test_models.py
│
└── .gitignore
```

---

## Common Pitfalls

1. **No plausibility constraints** — Agent suggests neuroscientifically invalid pipelines (e.g., 100Hz high-pass filter for ERP analysis). Always enforce domain constraints.

2. **Windows filesystem cache staleness** — On Windows, files under `~/.hermes/skills/` may disappear from the filesystem after session interruption, even though the Hermes registry retains them. Always read linked files via `skill_view(name=..., file_path=...)` rather than `read_file` or `terminal ls`. Use `skill_manage(action='write_file')` to create/update linked files.

2. **Metric gaming** — Agent overfits to validation metric. Use held-out test set only for final evaluation, never during the loop.

3. **Runaway token costs** — Unbounded loops consume excessive API credits. Set `MAX_EXPERIMENTS` and `MAX_EXP_TIME_SEC` hard limits.

4. **No git hygiene** — Every experiment should be a git commit. Use worktrees for isolation. Never run on main branch directly.

5. **Forgetting human gates** — The loop should pause for human approval at architecture changes, not just run autonomously forever.

6. **Ignoring class imbalance** — Dementia datasets are often imbalanced. Track F1/AUC, not just accuracy.

7. **Data leakage** — Never let the loop see test data. Enforce strict train/val/test split before the loop starts.

---

## Verification Checklist

- [ ] Research brief written and approved by human researcher
- [ ] Plausibility constraints defined for all pipeline stages
- [ ] Git initialized with `.gitignore` for data files
- [ ] W&B project created and API key configured
- [ ] `MAX_EXPERIMENTS` and `MAX_EXP_TIME_SEC` set to reasonable values
- [ ] Human-in-the-loop gates defined at appropriate checkpoints
- [ ] Kill switch (Ctrl+C handler) implemented
- [ ] Loop state save/resume implemented for long runs
- [ ] Test set held out and never touched during loop
- [ ] Class imbalance handling configured (stratified CV, F1/AUC metrics)

---

## References

- **NeuroWeaver**: [arXiv 2602.13473](https://arxiv.org/abs/2602.13473) — Autonomous evolutionary agent for EEG pipeline search
- **EEGAgent**: [AAAI 2026](https://ojs.aaai.org/index.php/AAAI/article/view/38867) — LLM-powered multi-tool EEG analysis
- **AutoResearch**: [Karpathy's blog](https://www.datacamp.com/tutorial/guide-to-autoresearch) — 630-line autonomous ML experiment loop
- **AutoLabs**: [arXiv 2509.25651](https://arxiv.org/abs/2509.25651) — Multi-agent self-correction architecture
- **Loop Engineering Overview**: [Addy Osmani's blog](https://addyosmani.com/blog/loop-engineering) — Foundational concepts
- **Agentic MLOps**: [ActiveWizards](https://activewizards.com/blog/the-autonomous-mlops-engineer-automating-the-ml-lifecycle) — MLOps automation with agents
