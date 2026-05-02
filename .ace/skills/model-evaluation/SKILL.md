---
name: model-evaluation
description: Procedural knowledge for evaluating machine learning models and AI systems systematically.
---

# Skill: Model Evaluation

> Procedural knowledge for evaluating machine learning 
> models and AI systems systematically.

---

## Purpose

Enable the Data Scientist and AI Expert roles to establish rigorous evaluation frameworks to measure model performance, fairness, robustness, and regressions before production deployment.

---

## Prerequisites

- [ ] Clear business objectives tied to model performance
- [ ] Holdout dataset (test set) isolated and secured
- [ ] Baseline model or heuristic defined for comparison

---

## Procedures

### 1. Metric Selection

```markdown
Step 1: Align Metrics with Business Goals
- Classification: Accuracy, Precision, Recall, F1-Score, ROC-AUC.
- Regression: RMSE, MAE, R-Squared.
- Generative AI / LLMs: ROUGE, BLEU, Exact Match, Human-in-the-loop Elo ratings, LLM-as-a-judge.

Step 2: Define Trade-offs
- Determine the cost of False Positives vs. False Negatives.
- Optimize the threshold accordingly.
```

### 2. Evaluation Execution

```markdown
Step 1: Create Golden Datasets
- Curate a high-quality dataset representing real-world distribution.
- Include edge cases, out-of-distribution samples, and adversarial inputs.

Step 2: Stratified Slicing
- Evaluate performance across different sub-populations (e.g., by demographic, by device type, by language).
- Ensure no sub-group experiences disproportionate degradation (Fairness/Bias testing).

Step 3: Robustness Testing
- Introduce noise to the inputs and measure output degradation.
```

---

## Common Pitfalls

1. **Data Leakage**: Using training data in the evaluation set.
2. **Over-relying on Accuracy**: Using accuracy on highly imbalanced datasets.
3. **Static Evaluation**: Failing to update the golden dataset as real-world data distributions drift.
4. **Vibes-based LLM Testing**: Relying on ad-hoc manual testing instead of systematic programmatic evaluation.

---

## Invocation

```markdown
"Apply the model-evaluation skill from .ace/skills/model-evaluation/SKILL.md
to design the evaluation framework for the new churn prediction model."
```
