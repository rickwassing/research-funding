"""
04_score_and_rank.py
====================
Apply the trained classifier to ALL grants (labelled + unlabelled) and export
a single ranked file containing all 25,000+ grants sorted by P(sleep).

Why include the already-labelled grants?
  - It acts as a sanity check: the 74 confirmed sleep grants should appear
    near the top of the list.
  - The Manual_Sleep_Topic column is pre-filled for grants that have already
    been verified, so the file serves as a complete record.
  - When you perform manual review of the 2014–2019 grants, you can see
    everything in one place.

Manual_Sleep_Topic pre-filling rules
  - "yes"  → grants confirmed sleep-related by human review
  - "no"   → grants confirmed non-sleep (either manually reviewed or ruled
              out by keyword screening)
  - ""     → 2014–2019 grants awaiting your manual review

Inputs
    analysis/labelled.csv
    analysis/unlabelled.csv
    analysis/embeddings/labelled_embeddings.npy
    analysis/embeddings/unlabelled_embeddings.npy
    analysis/trained_classifier.pkl
    analysis/results/cv_performance.txt    (to read recommended threshold)

Outputs
    analysis/results/ranked_candidates.csv
        Columns: Rank, ID, Funding_body, Scheme, Organisation, Investigators,
                 Date, Funding, P_sleep, Flagged, Manual_Sleep_Topic, Summary

Run from the repo root:
    python analysis/04_score_and_rank.py
"""

import pathlib
import pickle
import re
import numpy as np
import pandas as pd

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT         = pathlib.Path(__file__).resolve().parent.parent
ANALYSIS_DIR = ROOT / "analysis"
EMBED_DIR    = ANALYSIS_DIR / "embeddings"
RESULTS_DIR  = ANALYSIS_DIR / "results"
RESULTS_DIR.mkdir(exist_ok=True)

LABELLED_CSV          = ANALYSIS_DIR / "labelled.csv"
UNLABELLED_CSV        = ANALYSIS_DIR / "unlabelled.csv"
LABELLED_EMBED        = EMBED_DIR / "labelled_embeddings.npy"
UNLABELLED_EMBED      = EMBED_DIR / "unlabelled_embeddings.npy"
CLASSIFIER_FILE       = ANALYSIS_DIR / "trained_classifier.pkl"
PERFORMANCE_TXT       = RESULTS_DIR / "cv_performance.txt"
RANKED_OUT            = RESULTS_DIR / "ranked_candidates.csv"

# ── Load data ──────────────────────────────────────────────────────────────────
print("Loading all grants …")
labelled   = pd.read_csv(LABELLED_CSV,   dtype=str)
unlabelled = pd.read_csv(UNLABELLED_CSV, dtype=str)

print(f"  Labelled   (2020–2026): {len(labelled):,} grants")
print(f"  Unlabelled (2014–2019): {len(unlabelled):,} grants")
print(f"  Total                 : {len(labelled) + len(unlabelled):,} grants")

# ── Load embeddings ────────────────────────────────────────────────────────────
print("\nLoading embeddings …")
X_labelled   = np.load(LABELLED_EMBED)
X_unlabelled = np.load(UNLABELLED_EMBED)

# Verify alignment
assert len(labelled)   == len(X_labelled),   \
    f"Mismatch: {len(labelled)} labelled rows but {len(X_labelled)} embeddings"
assert len(unlabelled) == len(X_unlabelled), \
    f"Mismatch: {len(unlabelled)} unlabelled rows but {len(X_unlabelled)} embeddings"

# Stack embeddings into one matrix
X_all = np.vstack([X_labelled, X_unlabelled])

# Stack dataframes — track source so we can apply pre-filling rules
labelled["_source"]   = "labelled"
unlabelled["_source"] = "unlabelled"
all_grants = pd.concat([labelled, unlabelled], ignore_index=True)

# ── Load classifier ────────────────────────────────────────────────────────────
print("Loading trained classifier …")
with open(CLASSIFIER_FILE, "rb") as fh:
    clf = pickle.load(fh)

# ── Read recommended threshold ─────────────────────────────────────────────────
threshold = 0.5   # fallback default
if PERFORMANCE_TXT.exists():
    text  = PERFORMANCE_TXT.read_text()
    match = re.search(r"Threshold\s*:\s*([0-9.]+)", text)
    if match:
        threshold = float(match.group(1))
        print(f"Using recommended threshold from cv_performance.txt: {threshold:.4f}")
else:
    print(f"cv_performance.txt not found — using default threshold: {threshold}")

# ── Score all grants ───────────────────────────────────────────────────────────
print(f"\nScoring all {len(all_grants):,} grants …")
proba = clf.predict_proba(X_all)[:, 1]   # P(sleep) for every grant

# ── Assemble output dataframe ──────────────────────────────────────────────────
result = all_grants.copy()
result["P_sleep"] = proba
result["Flagged"] = np.where(proba >= threshold, "yes", "no")

# Pre-fill Manual_Sleep_Topic:
#   - Labelled grants keep their existing label (yes / no)
#   - Unlabelled (2014–2019) grants get an empty string (awaiting review)
def fill_label(row):
    label = str(row.get("Manual_Sleep_Topic", "")).strip().lower()
    if label in ("yes", "no"):
        return label          # already verified by human
    if row["_source"] == "labelled":
        return "no"           # confirmed negative (keyword-screened out)
    return ""                 # 2014–2019: needs manual review

result["Manual_Sleep_Topic"] = result.apply(fill_label, axis=1)

# Sort highest P_sleep first
result = result.sort_values("P_sleep", ascending=False).reset_index(drop=True)
result.insert(0, "Rank", result.index + 1)

# Drop the internal helper column
result = result.drop(columns=["_source"])

# ── Summary statistics ─────────────────────────────────────────────────────────
n_flagged       = (result["Flagged"] == "yes").sum()
n_confirmed_yes = (result["Manual_Sleep_Topic"] == "yes").sum()
n_confirmed_no  = (result["Manual_Sleep_Topic"] == "no").sum()
n_pending       = (result["Manual_Sleep_Topic"] == "").sum()

print(f"\nSummary:")
print(f"  Total grants in output  : {len(result):,}")
print(f"  Confirmed sleep (yes)   : {n_confirmed_yes}")
print(f"  Confirmed non-sleep(no) : {n_confirmed_no:,}")
print(f"  Awaiting review (blank) : {n_pending:,}  ← 2014–2019 grants")
print(f"  Flagged (P ≥ {threshold:.2f})      : {n_flagged:,}")

# Check that confirmed sleep grants cluster near the top
yes_ranks = result.loc[result["Manual_Sleep_Topic"] == "yes", "Rank"]
if len(yes_ranks) > 0:
    print(f"\nSanity check — confirmed sleep grants (should cluster near top):")
    print(f"  Median rank of confirmed 'yes' grants : {yes_ranks.median():.0f}")
    print(f"  Max rank of confirmed 'yes' grants    : {yes_ranks.max()}")
    print(f"  (out of {len(result):,} total)")

print(f"\nP(sleep) distribution of top candidates:")
for cutoff in [100, 200, 500]:
    if cutoff <= len(result):
        p_min = result.loc[cutoff - 1, "P_sleep"]
        n_blank_in_top = (result.loc[:cutoff-1, "Manual_Sleep_Topic"] == "").sum()
        print(f"  Top {cutoff:,}  :  min P = {p_min:.4f}  |  "
              f"{n_blank_in_top} unreviewed 2014–2019 grants")

print(f"\nRecommended screening strategy:")
print(f"  1. Open ranked_candidates.csv in Excel.")
print(f"  2. Scroll past the confirmed 'yes' grants at the top.")
print(f"  3. Review grants where Manual_Sleep_Topic is blank (2014–2019).")
print(f"  4. Fill in 'yes' or 'no' as you go, working top-to-bottom.")
print(f"  5. Stop once ~50 consecutive blanks have been marked 'no'.")

# ── Save ───────────────────────────────────────────────────────────────────────
cols = ["Rank", "ID", "Funding_body", "Scheme", "Organisation",
        "Investigators", "Date", "Funding", "P_sleep", "Flagged",
        "Manual_Sleep_Topic", "Summary"]
# Only keep columns that actually exist
cols = [c for c in cols if c in result.columns]
result[cols].to_csv(RANKED_OUT, index=False)

print(f"\nSaved: {RANKED_OUT.relative_to(ROOT)}")
print(f"  {len(result):,} grants ranked by P(sleep)")
print(f"  Open this file in Excel to begin manual review.")
print("\nDone. ✓")
