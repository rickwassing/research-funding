"""
03_train_and_evaluate.py
========================
Train a logistic regression classifier on the sentence embeddings of the
labelled grants, and evaluate it using stratified cross-validation.

Training set (after step 1)
  ~13,000 grants from 2020–2026, all with confirmed labels:
    - 74 sleep-related  (confirmed "yes" by human review)
    - ~12,900 non-sleep (confirmed "no" — either manually reviewed or ruled
                         out by keyword screening before manual review)

Why logistic regression?
  - Fast, robust, produces well-calibrated probabilities
  - Works very well with high-dimensional embeddings
  - class_weight='balanced' automatically handles the extreme class imbalance
    (74 positives vs ~12,900 negatives)
  - Easily justified in a methods section

Performance metrics reported:
  - Recall       (priority: must catch almost all real sleep grants)
  - Precision    (how many of our top candidates are genuinely sleep-related)
  - F1 score
  - Precision-Recall AUC
  - Confusion matrix

We use 5-fold stratified cross-validation. With ~13,000 samples this is fast
and reliable. Each fold preserves the class ratio.

Inputs
    analysis/labelled.csv
    analysis/embeddings/labelled_embeddings.npy

Outputs
    analysis/results/cv_performance.txt        – cross-validation metrics
    analysis/results/figures/pr_curve.png      – precision-recall curve
    analysis/trained_classifier.pkl            – saved model (for step 4)

Run from the repo root:
    python analysis/03_train_and_evaluate.py
"""

import pathlib
import pickle
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")   # non-interactive backend — safe on all systems
import matplotlib.pyplot as plt

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import (
    precision_recall_curve,
    average_precision_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT         = pathlib.Path(__file__).resolve().parent.parent
ANALYSIS_DIR = ROOT / "analysis"
EMBED_DIR    = ANALYSIS_DIR / "embeddings"
RESULTS_DIR  = ANALYSIS_DIR / "results"
FIGURES_DIR  = RESULTS_DIR / "figures"
FIGURES_DIR.mkdir(parents=True, exist_ok=True)

LABELLED_CSV    = ANALYSIS_DIR / "labelled.csv"
EMBEDDINGS_FILE = EMBED_DIR / "labelled_embeddings.npy"
CLASSIFIER_FILE = ANALYSIS_DIR / "trained_classifier.pkl"
PERFORMANCE_TXT = RESULTS_DIR / "cv_performance.txt"
PR_CURVE_PNG    = FIGURES_DIR / "pr_curve.png"

# ── Load data ──────────────────────────────────────────────────────────────────
print("Loading labelled data and embeddings …")
labelled = pd.read_csv(LABELLED_CSV, dtype=str)
labelled["Manual_Sleep_Topic"] = labelled["Manual_Sleep_Topic"].str.strip().str.lower()

X = np.load(EMBEDDINGS_FILE)    # shape: (n_samples, 384)

# Convert labels to binary integers: yes → 1, no → 0
y = (labelled["Manual_Sleep_Topic"].values == "yes").astype(int)

n_pos = y.sum()
n_neg = (y == 0).sum()
prevalence = 100 * n_pos / len(y)
print(f"  Samples   : {len(y):,}")
print(f"  Sleep (1) : {n_pos}  ({prevalence:.2f}%)")
print(f"  Non-sleep : {n_neg:,}  ({100 - prevalence:.2f}%)")
print(f"  Class ratio 1:{n_neg // n_pos}  (one sleep grant per {n_neg // n_pos} non-sleep)")

# ── Cross-validation ───────────────────────────────────────────────────────────
print("\nRunning 5-fold stratified cross-validation …")

clf = LogisticRegression(
    class_weight="balanced",   # upweights the 74 positives to compensate for imbalance
    max_iter=1000,
    random_state=42,
    solver="lbfgs",
    C=1.0,                     # regularisation strength (default); can be tuned
)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# cross_val_predict gives out-of-fold probabilities — no data leakage
print("  (this may take a minute with ~13,000 samples …)")
proba_oof = cross_val_predict(clf, X, y, cv=cv, method="predict_proba")[:, 1]
pred_oof  = (proba_oof >= 0.5).astype(int)

# ── Metrics ────────────────────────────────────────────────────────────────────
report  = classification_report(y, pred_oof, target_names=["Non-sleep", "Sleep"])
cm      = confusion_matrix(y, pred_oof)
pr_auc  = average_precision_score(y, proba_oof)
roc_auc = roc_auc_score(y, proba_oof)

precision_curve, recall_curve, thresholds = precision_recall_curve(y, proba_oof)

# Find the threshold giving recall ≥ 0.95 with the highest precision
high_recall_mask = recall_curve[:-1] >= 0.95
if high_recall_mask.any():
    best_idx    = np.where(high_recall_mask)[0][
                    np.argmax(precision_curve[:-1][high_recall_mask])]
    best_thresh = thresholds[best_idx]
    best_prec   = precision_curve[best_idx]
    best_rec    = recall_curve[best_idx]
    # Estimate review workload at this threshold
    n_flagged   = (proba_oof >= best_thresh).sum()
else:
    best_thresh = 0.5
    best_prec   = np.nan
    best_rec    = np.nan
    n_flagged   = (proba_oof >= 0.5).sum()

summary = f"""
Sleep-grant classifier — 5-fold cross-validation results
=========================================================

Training set
  Total samples       : {len(y):,}
  Sleep grants        : {n_pos}  ({prevalence:.2f}%)
  Non-sleep grants    : {n_neg:,}  ({100 - prevalence:.2f}%)
  Class imbalance     : 1 : {n_neg // n_pos}

Note: non-sleep grants include both:
  (a) grants manually reviewed and labelled "no"
  (b) grants from 2020–2026 that matched no sleep keyword
      and were therefore confirmed non-sleep without manual review

Classification report (threshold = 0.50)
------------------------------------------
{report}
Confusion matrix (threshold = 0.50)
              Predicted non-sleep   Predicted sleep
Actual non-sleep   {cm[0,0]:>6}            {cm[0,1]:>6}
Actual sleep       {cm[1,0]:>6}            {cm[1,1]:>6}

Area-under-curve
  Precision-Recall AUC : {pr_auc:.4f}
  ROC AUC              : {roc_auc:.4f}

Recommended threshold for screening (recall ≥ 0.95)
  Threshold             : {best_thresh:.4f}
  Precision at threshold: {best_prec:.4f}
  Recall at threshold   : {best_rec:.4f}
  Grants flagged (training set) : {n_flagged}

Interpretation
--------------
Use the recommended threshold in step 4 to rank the 2014–2019 grants.
At this threshold the model recalls ≥95% of sleep grants while limiting
the manual review queue to a manageable shortlist.

A threshold below 0.5 flags more candidates (higher recall, lower
precision). This is the right trade-off here: missing a genuine sleep
grant is more costly than reviewing a few extra false positives.
"""

print(summary)

# ── Save performance report ────────────────────────────────────────────────────
PERFORMANCE_TXT.write_text(summary)
print(f"Saved: {PERFORMANCE_TXT.relative_to(ROOT)}")

# ── Precision-Recall curve ─────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(7, 5))
ax.plot(recall_curve, precision_curve, lw=2, color="steelblue",
        label=f"Logistic Regression (PR-AUC = {pr_auc:.3f})")
ax.axhline(y=n_pos / len(y), color="lightgrey", linestyle=":", lw=1,
           label=f"Baseline (random, P = {n_pos/len(y):.3f})")
ax.axvline(x=0.95, color="grey", linestyle="--", lw=1, label="Recall = 0.95")
if not np.isnan(best_rec):
    ax.scatter([best_rec], [best_prec], zorder=5, color="crimson", s=80,
               label=f"Threshold {best_thresh:.3f}  (P={best_prec:.2f}, R={best_rec:.2f})")
ax.set_xlabel("Recall", fontsize=12)
ax.set_ylabel("Precision", fontsize=12)
ax.set_title(
    f"Precision–Recall Curve\n"
    f"(5-fold CV  |  {n_pos} sleep grants vs {n_neg:,} non-sleep)",
    fontsize=11
)
ax.legend(loc="upper right", fontsize=9)
ax.set_xlim([0, 1.02])
ax.set_ylim([0, 1.05])
ax.grid(True, alpha=0.3)
fig.tight_layout()
fig.savefig(PR_CURVE_PNG, dpi=150)
plt.close(fig)
print(f"Saved: {PR_CURVE_PNG.relative_to(ROOT)}")

# ── Train final model on ALL labelled data ────────────────────────────────────
print("\nTraining final model on all labelled data …")
clf_final = LogisticRegression(
    class_weight="balanced",
    max_iter=1000,
    random_state=42,
    solver="lbfgs",
    C=1.0,
)
clf_final.fit(X, y)

with open(CLASSIFIER_FILE, "wb") as fh:
    pickle.dump(clf_final, fh)

print(f"Saved: {CLASSIFIER_FILE.relative_to(ROOT)}")
print("\nDone. ✓  Run 04_score_and_rank.py next.")
