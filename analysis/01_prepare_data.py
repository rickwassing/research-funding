"""
01_prepare_data.py
==================
Merge the full grant dataset with the manually-labelled sleep-topic file,
then define the training set and the prediction set.

Background
----------
The manual screening was a two-step process:
  1. A keyword list was applied to all 2020–2026 grants (~13,000 total).
     Grants that matched NO keyword are confirmed non-sleep (true negatives).
  2. The ~197 grants that DID match at least one keyword were manually reviewed.
     74 were confirmed sleep-related (true positives);
     123 were confirmed non-sleep despite matching a keyword (true negatives).

This means:
  - Training positives : 74 grants in manual-selection.csv with label "yes"
  - Training negatives : ALL other 2020–2026 grants
      → 123 manually-reviewed with label "no"
      → ~12,800+ that matched no keyword (ruled out automatically)
  - Prediction set     : all 2014–2019 grants (never screened)

Using all confirmed negatives dramatically strengthens the classifier.

Inputs  (relative to repo root)
    data/dataset.csv          – all 25,000+ grants
    data/manual-selection.csv – 197 grants with Manual_Sleep_Topic = yes / no

Outputs (written to analysis/)
    analysis/labelled.csv     – confirmed labelled grants for training
    analysis/unlabelled.csv   – 2014–2019 grants to be scored

Run from the repo root:
    python analysis/01_prepare_data.py
"""

import pathlib
import pandas as pd

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT         = pathlib.Path(__file__).resolve().parent.parent
DATA_DIR     = ROOT / "data"
ANALYSIS_DIR = ROOT / "analysis"

DATASET_CSV    = DATA_DIR / "dataset.csv"
LABELS_CSV     = DATA_DIR / "manual-selection.csv"
LABELLED_OUT   = ANALYSIS_DIR / "labelled.csv"
UNLABELLED_OUT = ANALYSIS_DIR / "unlabelled.csv"

# The manual screening covered grants from these years.
# Every grant from these years that was NOT manually reviewed is a confirmed
# negative (it matched no sleep-related keywords).
SCREENED_YEARS = {2020, 2021, 2022, 2023, 2024, 2025, 2026}


# ── Load data ──────────────────────────────────────────────────────────────────
print("Loading dataset …")
dataset = pd.read_csv(DATASET_CSV, dtype=str)
dataset.columns = dataset.columns.str.strip()
dataset["ID"] = dataset["ID"].str.strip()

# Parse year from the Date column (format: d/m/yyyy)
dataset["Year"] = pd.to_datetime(
    dataset["Date"], dayfirst=True, errors="coerce"
).dt.year.astype("Int64")

print(f"  {len(dataset):,} grants in dataset.csv")
print(f"\n  Year breakdown:")
for yr, cnt in dataset["Year"].value_counts().sort_index().items():
    print(f"    {yr}: {cnt:,}")

print("\nLoading manual labels …")
labels = pd.read_csv(LABELS_CSV, dtype=str)
labels.columns = labels.columns.str.strip()
labels["ID"] = labels["ID"].str.strip()
labels["Manual_Sleep_Topic"] = labels["Manual_Sleep_Topic"].str.strip().str.lower()

# Keep only rows with a clean yes/no label
labels = labels[labels["Manual_Sleep_Topic"].isin(["yes", "no"])].copy()
n_pos = (labels["Manual_Sleep_Topic"] == "yes").sum()
n_neg_reviewed = (labels["Manual_Sleep_Topic"] == "no").sum()
print(f"  {len(labels):,} manually-reviewed grants  "
      f"({n_pos} sleep / {n_neg_reviewed} not-sleep)")


# ── Sanity-check: warn if any labelled IDs were not found in the dataset ───────
missing = set(labels["ID"]) - set(dataset["ID"])
if missing:
    print(f"\n  ⚠️  Warning: {len(missing)} IDs in manual-selection.csv "
          f"were NOT found in dataset.csv:")
    for m in sorted(missing):
        print(f"     {m}")


# ── Merge labels into dataset ──────────────────────────────────────────────────
merged = dataset.merge(
    labels[["ID", "Manual_Sleep_Topic"]],
    on="ID",
    how="left"
)

# ── Define training set ────────────────────────────────────────────────────────
# Screened-year grants that were NOT manually reviewed matched no keyword
# → they are confirmed negatives; assign label "no"
screened_mask = merged["Year"].isin(SCREENED_YEARS)
unreviewed_negatives_mask = screened_mask & merged["Manual_Sleep_Topic"].isna()

merged.loc[unreviewed_negatives_mask, "Manual_Sleep_Topic"] = "no"

labelled = merged[screened_mask].copy()

n_total_neg = (labelled["Manual_Sleep_Topic"] == "no").sum()
n_total_pos = (labelled["Manual_Sleep_Topic"] == "yes").sum()
print(f"\nTraining set (years {min(SCREENED_YEARS)}–{max(SCREENED_YEARS)}):")
print(f"  Total grants     : {len(labelled):,}")
print(f"  Sleep (positive) : {n_total_pos:,}")
print(f"  Non-sleep (neg.) : {n_total_neg:,}")
print(f"    of which manually reviewed as 'no': {n_neg_reviewed:,}")
print(f"    of which keyword-negative (auto)  : {n_total_neg - n_neg_reviewed:,}")

# ── Define prediction set ──────────────────────────────────────────────────────
# 2014–2019 grants were never screened — these are the ones we need to score
unscreened = merged[~screened_mask].copy()

print(f"\nPrediction set (unscreened years):")
print(f"  Total grants to score: {len(unscreened):,}")
year_counts = unscreened["Year"].value_counts().sort_index()
for yr, cnt in year_counts.items():
    print(f"    {yr}: {cnt:,}")


# ── Save ───────────────────────────────────────────────────────────────────────
labelled.to_csv(LABELLED_OUT, index=False)
unscreened.to_csv(UNLABELLED_OUT, index=False)

print(f"\nSaved:")
print(f"  {LABELLED_OUT.relative_to(ROOT)}")
print(f"  {UNLABELLED_OUT.relative_to(ROOT)}")
print("\nDone. ✓  Run 02_generate_embeddings.py next.")
