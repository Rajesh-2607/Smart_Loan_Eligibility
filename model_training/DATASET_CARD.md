# Dataset Card — `dataset.csv`

Training data for the loan approval classifier in `model_training/train.py`.

> **Status: demo fixture, not a benchmark.** The target label in this file can be
> predicted from number-formatting artifacts that have nothing to do with credit
> risk. Accuracy figures measured on it — including the 99.96% in
> `training_log.txt` — do not transfer to real applicants. See
> [Target leakage](#target-leakage) before quoting any metric from this file.

---

## At a glance

| | |
|---|---|
| **Path** | `model_training/dataset.csv` |
| **Size** | 4,928,625 bytes (4.93 MB), tracked in git since commit `9f02060` |
| **Rows** | 50,000 |
| **Columns** | 13 (12 features + 1 target) |
| **Target** | `approved` — binary, exactly 25,000 / 25,000 |
| **Missing values** | 1 (a single null in `dti`); no other nulls |
| **Duplicate rows** | 0 |
| **Currency** | Indian rupees (₹) |
| **Consumed by** | `model_training/train.py` → `loan_model.pkl` → `backend/ml/predictor.py` |

---

## Schema

| Column | Type | Observed range | Notes |
|---|---|---|---|
| `loan_amnt` | float | ₹7,500 – ₹525,000 | median ₹150,000; 1,245 distinct values, effectively all multiples of 25 |
| `annual_inc` | float | ₹0 – ₹104,400,000 | median ₹542,591; one row at exactly 0 |
| `emp_length_years` | float | 1 – 10 | 10 discrete values; bimodal, piling up at 1 and 10 |
| `home_ownership` | text | 3 values | RENT 47.3% · MORTGAGE 42.0% · OWN 10.7% |
| `grade` | text | A – G | C 23% · B 21% · F 19% · D 14% · A 12% · E 10% · G 0.2% |
| `int_rate` | float | 5.32 – 28.99 | 70 distinct values; **assigned by the lender after approval** |
| `dti` | float | −1 – 3,626,400 | 1 null; nominally a percentage, but 604 rows fall outside 0–100 |
| `fico_score` | float | 500 – 847.5 | 19,353 distinct values; 19,315 rows carry fractional precision |
| `installment` | float | ₹233 – ₹20,320 | median ₹4,592 |
| `verification_status` | text | 3 values | Not Verified 39.9% · Source Verified 34.9% · Verified 25.1% |
| `purpose` | text | 17,277 distinct | **Two different fields merged** — see [Provenance](#provenance). Not used in training. |
| `fixed_deposit` | float | ₹0 – ₹13,800,000 | median ₹0; 75th percentile ₹73,200. Not a LendingClub field — see below. |
| `approved` | int | 0 / 1 | target; 1 = approved |

### Features built at training time

`train.py` encodes the three categoricals and derives three ratios, for 14 model
features in total. `purpose` is dropped.

| Derived | Formula |
|---|---|
| `grade_numeric` | `grade` → A=1 … G=7, default 3 |
| `home_ownership_numeric` | OWN=3, MORTGAGE=2, RENT=1, default 1 |
| `verification_numeric` | Verified=2.0, Source Verified=1.5, Not Verified=1.0 |
| `monthly_income` | `annual_inc / 12` |
| `fd_to_loan_ratio` | `fixed_deposit / (loan_amnt + 1)` |
| `installment_to_inc` | `installment / (monthly_income + 1)` |

`predictor.py` reconstructs these same 14 features at inference time from the API
request body, defaulting any it cannot derive.

---

## Provenance

`train.py` describes this as the "Kaggle LendingClub Dataset." It is derived from
LendingClub data but is not a LendingClub export, and it was not sampled as one
population. The evidence says it was assembled by **stacking LendingClub's
accepted-loans and rejected-loans files, with `approved` recording which file each
row came from.**

Column-level signatures, by label:

| Signature | Rejected rows (`approved=0`) | Approved rows (`approved=1`) |
|---|---|---|
| `purpose` is a canonical LendingClub code | 9.0% | **100.0%** |
| `purpose` is free text (`"police officer needs help!"`, `"kc1002"`) | 86.4% | 0.0% |
| `purpose` is blank | 4.6% | 0.0% |
| `fico_score` has a fractional part | 77.3% | 0.01% |
| `annual_inc` has a fractional part | 98.8% | 0.5% |
| `grade` = G | 0 rows | 99 rows |
| `grade` = F | 9,147 rows | 504 rows |

The accepted file carries `purpose` as one of ~14 canonical codes; the rejected
file has no `purpose` column, so free-text borrower blurbs and member handles were
mapped into the same slot. The rejected file reports a continuous `Risk_Score`
rather than an integer FICO, which is why fractional FICO values cluster almost
entirely in one class.

Two columns were added on top:

- **`fixed_deposit`** does not exist in any LendingClub release. It was invented to
  drive the project's FD-collateral redirect feature.
- **`int_rate`** is populated for all 50,000 rows, but the rejected file has no
  interest rate — rejected applicants are never quoted one. These values were
  filled in.

Amounts are in rupees while LendingClub is denominated in USD, so the monetary
columns were rescaled or regenerated as well.

**Licensing is unresolved.** If the underlying rows came from LendingClub's public
release, that release's terms govern reuse and redistribution. Nothing in the repo
records the source download, the sampling method, or the generation script, so this
file's redistribution status cannot be established from what is here.

---

## Target leakage

The label is recoverable from artifacts that carry no credit-risk meaning. Three
independent findings, each reproducible with the snippets in
[Reproducing these checks](#reproducing-these-checks).

**1. Formatting fingerprints identify the source file.** Because the two halves came
from exports with different numeric precision, "does this number have a decimal
part?" is a near-perfect class indicator. The `fico_score` flag alone — one boolean,
no model — classifies **88.62%** of rows correctly. The `annual_inc` flag is sharper
still (98.8% vs 0.5%).

**2. `fico_score >= 662` is a hard gate.** Of 25,000 approved rows, **zero** fall
below 662. That single threshold classifies **87.41%** of the file. Real
underwriting has no such clean floor, and real approval data always has exceptions.

**3. `purpose` is a 95%-accurate giveaway on its own.** Checking whether the value
is one of the canonical codes separates the classes almost perfectly. It happens to
be harmless here only because `train.py` drops the column.

### Measured accuracy

| Setup | Accuracy | ROC-AUC |
|---|---|---|
| XGBoost as shipped (`train.py`, 150 rounds, 14 features) | 99.96% | 1.0000 |
| Gradient boosting, same 14 features, held-out 20% | 100.00% | 1.0000 |
| Decision tree, depth 5 | 96.96% | — |
| `fico_score` is fractional — one boolean | 88.62% | — |
| `fico_score >= 662` — one threshold | 87.41% | — |
| `fico_score` rounded, `int_rate` + `fico_score` dropped | 97.98% | 0.9976 |

The last row still leaks: `annual_inc` formatting remains a tell. **No configuration
of this file yields a trustworthy accuracy figure**, because the leakage is spread
across the numeric columns rather than concentrated in one or two that can be
dropped. Removing it would require renormalizing every numeric column to a common
precision and discarding `purpose`, `grade`, and `int_rate`.

### Why the training log looks the way it does

In `training_log.txt`, validation loss tracks training loss to four decimal places
across all 150 rounds, and ROC-AUC reaches 1.0000 by round 110. Both halves of the
split carry the same formatting tells in the same proportion, so there is no
generalization gap to observe. That log documents a model successfully recovering
how the file was built.

---

## Known data quality issues

Separate from leakage, and worth fixing regardless:

- **`dti` is not a usable percentage.** Range runs −1 to 3,626,400 with a mean of
  273.7 and a standard deviation of 19,439. 604 rows fall outside 0–100. The column
  is fed to the model unclipped.
- **`purpose` is unusable as a category.** 17,277 distinct values across 50,000 rows;
  16,475 of them appear exactly once. Values range from canonical codes to borrower
  prose to usernames, with one entry 3,572 characters long. 1,139 rows are blank.
- **`grade` is non-monotonic against the target.** Approval rate by grade runs
  A 72.7% · B 72.6% · C 63.5% · D 48.3% · E 33.5% · F 5.2% · **G 100.0%**. Grade G
  (99 rows) is approved at a higher rate than grade A. Real credit grades are
  ordered.
- **`annual_inc` has implausible extremes** — one row at ₹0, a maximum of
  ₹10.44 crore against a median of ₹5.43 lakh.
- **`fico_score` carries false precision** — values like `648.4896481027454` on a
  score that is an integer by definition.
- **The 50/50 class balance is constructed**, not observed. Real approval base rates
  are not balanced, so any threshold tuned on this file is calibrated to a prior
  that does not hold in production.

---

## Appropriate use

**Reasonable:**

- Exercising the pipeline end to end — training, pickling, loading, serving.
- Demonstrating the API, the recommendation engine, and the explainability layer
  with plausible-looking inputs.
- Teaching material on target leakage. The file is an unusually clean specimen.

**Not supported:**

- Any quantitative claim about model performance, in a report, a README, a demo or a
  viva. The headline metric measures file assembly, not credit assessment.
- Fairness or bias analysis. The dataset carries no protected attributes, and its
  class balance and grade distribution are both artificial.
- Any real lending or eligibility decision.

Note that the *task framing* is sound — predicting whether an application would be
accepted is exactly what a loan eligibility engine should do, and stacking accepted
against rejected applications is a legitimate way to build that label. The problem
is confined to execution: the two source files are distinguishable by formatting, so
the task became trivial.

### If you need a defensible number

Two routes, in increasing order of effort:

1. **Re-derive the file from the LendingClub source** (`.gitignore` already has
   entries for `accepted_2007_to_2018q4.csv` and `rejected_2007_to_2018q4.csv`),
   keeping only the columns that exist in *both* files, and normalizing every
   numeric column to identical precision before concatenating. Drop `int_rate` and
   `grade` — both are assigned after approval and leak by construction. There will
   be no `fixed_deposit` column, so the FD redirect stays a rules-engine path in
   `catalog/products.py`, which is where it already lives.
2. **Keep this file and report nothing from it.** Document it as a fixture, delete
   the accuracy claims from the README and the training log, and describe the
   eligibility decision as rule-based — which, with no `loan_model.pkl` committed
   and `predictor.py` falling back to `_heuristic_probability`, is what a fresh
   clone actually runs today.

---

## Reproducing these checks

```python
import pandas as pd
from sklearn.metrics import accuracy_score

df = pd.read_csv("model_training/dataset.csv")
y = df["approved"]

# 1. Formatting fingerprint: one boolean, no model.
frac = (df["fico_score"] % 1 != 0).astype(int)
print(accuracy_score(y, 1 - frac))            # 0.8862

# 2. The FICO gate: no approved row falls below 662.
print(((df.fico_score < 662) & (y == 1)).sum())   # 0
print(accuracy_score(y, (df.fico_score >= 662)))  # 0.8741

# 3. purpose encodes which source file the row came from.
CANON = {"debt_consolidation", "credit_card", "other", "home_improvement",
         "major_purchase", "medical", "small_business", "car", "vacation",
         "moving", "house", "wedding", "renewable_energy", "educational"}
print(df.groupby(y)["purpose"].apply(lambda s: s.isin(CANON).mean()))
#   approved 0 -> 0.090
#   approved 1 -> 1.000
```

---

## Card metadata

| | |
|---|---|
| **Covers** | `model_training/dataset.csv` as of commit `9f02060` |
| **Method** | Column profiling, per-feature AUC, single-feature and shallow-tree probes, and gradient-boosting ablations over the full 50,000 rows. No sampling. |
| **Not verified** | The original download URL, the sampling procedure, and the generation script, none of which are recorded in the repository. The provenance above is inferred from column signatures and is consistent with every signature tested, but the generating code was not available to confirm it. |
