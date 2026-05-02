---
name: feature-engineering
description: Procedural knowledge for transforming raw data into high-value features for machine learning models.
---

# Skill: Feature Engineering

> Procedural knowledge for transforming raw data into 
> high-value features for machine learning models.

---

## Purpose

Enable the Data Scientist role to systematically clean, transform, and construct predictive features from raw data, ensuring maximum model performance while preventing data leakage.

---

## Prerequisites

- [ ] Exploratory Data Analysis (EDA) completed
- [ ] Target variable clearly defined
- [ ] Domain knowledge of the underlying data available

---

## Procedures

### 1. Data Cleaning & Imputation

```markdown
Step 1: Handle Missing Values
- Determine the mechanism (Missing Completely At Random, Missing At Random, Not Missing At Random).
- Impute appropriately (mean, median, mode, predictive imputation) or drop.
- Create binary indicator columns for missingness if it carries signal.

Step 2: Outlier Treatment
- Identify outliers (Z-score, IQR).
- Cap/floor outliers or transform them (e.g., log transformation) to reduce their influence.
```

### 2. Feature Transformation & Creation

```markdown
Step 1: Categorical Encoding
- Nominal data: One-Hot Encoding, Target Encoding.
- Ordinal data: Ordinal Encoding.

Step 2: Numerical Transformation
- Scaling/Standardization (MinMax, StandardScaler) for distance-based models or neural networks.
- Binning continuous variables into categories if relationships are highly non-linear.

Step 3: Domain-Specific Creation
- Extract date/time features (day of week, is_holiday).
- Create interaction terms (Feature A * Feature B).
- Aggregate historical data (e.g., "count of purchases in last 30 days").
```

---

## Common Pitfalls

1. **Data Leakage**: Applying scaling or imputation across the entire dataset *before* splitting into train/test sets.
2. **Curse of Dimensionality**: Creating too many features (e.g., massive One-Hot Encoded matrices) without feature selection.
3. **Ignoring Time Linearity**: Using future information to construct historical features in time-series data.

---

## Invocation

```markdown
"Apply the feature-engineering skill from .ace/skills/feature-engineering/SKILL.md
to the raw customer behavior dataset."
```
