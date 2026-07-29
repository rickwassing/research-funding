"""
02_generate_embeddings.py
=========================
Convert every grant summary into a 384-dimensional numeric vector (embedding)
using the 'all-MiniLM-L6-v2' sentence-transformer model.

This is a one-time step. The embeddings are saved as .npy files so you never
have to run this again (unless the dataset changes).

Model: all-MiniLM-L6-v2
  - Free, runs locally, no API key required
  - ~80 MB download (first run only)
  - Fast: ~25,000 summaries takes a few minutes on a modern Mac
  - 384 dimensions per summary — captures semantic meaning very well

Inputs
    analysis/labelled.csv
    analysis/unlabelled.csv

Outputs (saved to analysis/embeddings/)
    embeddings/labelled_embeddings.npy     – shape (n_labelled, 384)
    embeddings/labelled_ids.npy            – grant IDs in matching order
    embeddings/unlabelled_embeddings.npy   – shape (n_unlabelled, 384)
    embeddings/unlabelled_ids.npy          – grant IDs in matching order

Run from the repo root:
    python analysis/02_generate_embeddings.py
"""

import pathlib
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

# ── Paths ──────────────────────────────────────────────────────────────────────
ROOT          = pathlib.Path(__file__).resolve().parent.parent
ANALYSIS_DIR  = ROOT / "analysis"
EMBED_DIR     = ANALYSIS_DIR / "embeddings"
EMBED_DIR.mkdir(exist_ok=True)

LABELLED_CSV   = ANALYSIS_DIR / "labelled.csv"
UNLABELLED_CSV = ANALYSIS_DIR / "unlabelled.csv"

# ── Load data ──────────────────────────────────────────────────────────────────
print("Loading prepared data …")
labelled   = pd.read_csv(LABELLED_CSV,   dtype=str)
unlabelled = pd.read_csv(UNLABELLED_CSV, dtype=str)

# Fill any missing summaries with an empty string so the model never crashes
labelled["Summary"]   = labelled["Summary"].fillna("").str.strip()
unlabelled["Summary"] = unlabelled["Summary"].fillna("").str.strip()

print(f"  Labelled   : {len(labelled):,} grants")
print(f"  Unlabelled : {len(unlabelled):,} grants")

# ── Load model ─────────────────────────────────────────────────────────────────
print("\nLoading sentence-transformer model …")
print("  (first run: downloads ~80 MB — subsequent runs use the cached model)")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("  Model ready.")

# ── Generate embeddings ────────────────────────────────────────────────────────
# batch_size=64 is safe on most Macs; increase to 128 if you have lots of RAM
BATCH_SIZE = 64

print(f"\nEmbedding {len(labelled):,} labelled grant summaries …")
labelled_embeddings = model.encode(
    labelled["Summary"].tolist(),
    batch_size=BATCH_SIZE,
    show_progress_bar=True,
    convert_to_numpy=True,
)

print(f"\nEmbedding {len(unlabelled):,} unlabelled grant summaries …")
unlabelled_embeddings = model.encode(
    unlabelled["Summary"].tolist(),
    batch_size=BATCH_SIZE,
    show_progress_bar=True,
    convert_to_numpy=True,
)

# ── Save ───────────────────────────────────────────────────────────────────────
np.save(EMBED_DIR / "labelled_embeddings.npy",   labelled_embeddings)
np.save(EMBED_DIR / "labelled_ids.npy",          labelled["ID"].values)
np.save(EMBED_DIR / "unlabelled_embeddings.npy", unlabelled_embeddings)
np.save(EMBED_DIR / "unlabelled_ids.npy",        unlabelled["ID"].values)

print(f"\nEmbedding shapes:")
print(f"  Labelled   : {labelled_embeddings.shape}")
print(f"  Unlabelled : {unlabelled_embeddings.shape}")
print(f"\nSaved to {EMBED_DIR.relative_to(ROOT)}/")
print("\nDone. ✓  Run 03_train_and_evaluate.py next.")
