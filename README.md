# Research Funding Analysis Dashboard

A web application for exploring Australian government research funding using keyword-based grant classification.

The dashboard loads grant data locally in the browser and allows users to classify grants using a customisable keyword list. It was originally developed to estimate the proportion of Australian research funding awarded to sleep research but can be adapted to any research area by changing the keywords.

**Live dashboard:** https://rickwassing.github.io/research-funding/

## Data

The dashboard includes funded grants from:

- Australian Research Council (ARC)
- National Health and Medical Research Council (NHMRC)
- Medical Research Future Fund (MRFF)

Current dataset:

- Over 25,000K funded grants
- Funding rounds from 2014–2026
- Grant summaries and award metadata

## Features

- Filter by funding agency, organisation, scheme and investigator
- Define keywords used to classify grants
- Compare classified and non-classified funding
- Explore funding by organisation and scheme
- View individual grant summaries

Keyword changes are applied immediately and stored in your browser.

## Local development

Clone the repository and start a local web server.

```bash
python -m http.server 8080
```

Then open:

```
http://localhost:8080
```

The application is entirely client-side, so no build step or backend is required.

## Project structure

```
.
├── index.html          # Dashboard
├── app.js              # Application logic
├── dataset.csv         # Grant data
├── keywords.csv        # Default keyword list
├── README.md
└── .github/workflows/
    └── deploy.yml
```

## Technology

- HTML, CSS and JavaScript
- Bootstrap
- Chart.js
- DataTables
- PapaParse

## Classification

Grant classification is based on case-insensitive keyword matching of grant summaries.

The default keyword list focuses on sleep research but can be edited within the dashboard or by modifying `keywords.csv`.

## Deployment

The dashboard is hosted using GitHub Pages. Every push to the `main` branch automatically deploys the latest version.

## Data source

Grant data were compiled from publicly available award data released by:

- Australian Research Council (ARC)
- National Health and Medical Research Council (NHMRC)
- Medical Research Future Fund (MRFF)