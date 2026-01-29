# Plan 04: Architectural Improvements

## App Context

The ASA Sleep Research Funding Dashboard is a web application that analyzes Australian government research funding data from three main agencies (ARC, NHMRC, MRFF). It allows users to:

- Load and analyze 6,437 grant records from a CSV file
- Classify grants as "sleep research" based on keyword matching in summaries
- View funding statistics, charts, and detailed grant information
- Filter data by funding body, organization, scheme, and investigators
- Dynamically manage sleep research keywords

Current architecture issues:

- Monolithic `app.js` file (1,000+ lines)
- All data loaded into browser memory at once
- Limited error handling and validation
- No build process or optimization
- Mix of concerns (UI, data processing, rendering)

## Task Overview

Rethink and improve the application architecture from the ground up while maintaining the same functionality. Create a minimal viable product with clean, maintainable code that can be extended later. Focus on simplicity, performance, and code organization.

## Design Principles

1. **Simplicity**: Keep it as simple as possible
2. **Modularity**: Separate concerns into logical modules
3. **Performance**: Optimize for 6,437 records in browser
4. **Maintainability**: Clean, well-organized code
5. **Extensibility**: Easy to add features later

## Proposed Architecture

### Option A: Vanilla JavaScript with Modules (Recommended)

Keep it simple with modern JavaScript modules, no frameworks.

**Structure:**

```
research-funding/
├── index.html
├── styles/
│   └── main.css
├── scripts/
│   ├── main.js          # Entry point
│   ├── data-loader.js   # CSV loading and parsing
│   ├── keyword-manager.js # Keyword management
│   ├── filters.js       # Filter logic
│   ├── charts.js        # Chart rendering
│   ├── table-manager.js # DataTable management
│   ├── ui-updater.js    # UI updates and KPIs
│   └── utils.js         # Utility functions
├── data/
│   ├── dataset.csv
│   └── keywords.csv
└── assets/              # For screenshots, icons
```

### Option B: Light Framework (Vue.js/React)

If more interactivity needed later, but for now keep simple.

**Decision:** Stick with Option A (Vanilla JS) for minimal complexity.

## Detailed Steps

### Phase 1: Project Structure Setup

#### Step 1: Create New Directory Structure

**Actions:**

```bash
# Create new organized structure
mkdir -p scripts styles data assets

# Move existing files to backup
mkdir -p backup
cp app.js backup/
cp index.html backup/
cp *.csv backup/
```

**Acceptance Criteria:**

- New directory structure created
- Original files backed up

#### Step 2: Create Package.json for Build Tools (Optional)

**File:** `package.json`
**Content:**

```json
{
  "name": "asa-sleep-funding-dashboard",
  "version": "1.0.0",
  "description": "Dashboard for analyzing sleep research funding in Australia",
  "main": "scripts/main.js",
  "scripts": {
    "dev": "python3 -m http.server 8000",
    "build": "echo 'No build step needed for vanilla JS'",
    "test": "echo 'No tests yet'"
  },
  "keywords": ["sleep", "research", "funding", "dashboard"],
  "author": "Australasian Sleep Association Research Committee",
  "license": "MIT",
  "devDependencies": {
    "prettier": "^3.0.0"
  }
}
```

**Acceptance Criteria:**

- package.json created with basic configuration
- No unnecessary dependencies

### Phase 2: Modular JavaScript Refactoring

#### Step 3: Create Utility Module

**File:** `scripts/utils.js`
**Content:**

```javascript
// Utility functions used across the application

export function formatCurrency(value) {
  if (value >= 1e9) {
    return "$" + (value / 1e9).toFixed(2) + "B";
  } else if (value >= 1e6) {
    return "$" + (value / 1e6).toFixed(1) + "M";
  } else if (value >= 1e3) {
    return "$" + (value / 1e3).toFixed(0) + "K";
  }
  return "$" + value.toFixed(0);
}

export function formatCurrencyFull(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function parseFunding(fundingStr) {
  if (!fundingStr) return 0;
  const cleaned = String(fundingStr).replace(/[,$\s]/g, "");
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function showLoading(show = true) {
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.style.display = show ? "flex" : "none";
  }
}

export function showError(message) {
  console.error("Application error:", message);
  // Could implement a proper error notification UI
  alert(`Error: ${message}`);
}
```

**Acceptance Criteria:**

- Utility functions extracted from original app.js
- Proper exports for module usage
- Error handling utilities included

#### Step 4: Create Data Loader Module

**File:** `scripts/data-loader.js`
**Content:**

```javascript
import { parseFunding, showError } from "./utils.js";

// Global state
let allGrants = [];
let sleepKeywords = [];

export async function loadKeywords() {
  try {
    const response = await fetch("data/keywords.csv");
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          sleepKeywords = results.data
            .map((row) => row.Keywords)
            .filter((keyword) => keyword && keyword.trim() !== "");
          console.log(`Loaded ${sleepKeywords.length} keywords`);
          resolve(sleepKeywords);
        },
        error: function (error) {
          console.error("Error loading keywords:", error);
          // Fallback to default keywords
          sleepKeywords = getDefaultKeywords();
          resolve(sleepKeywords);
        },
      });
    });
  } catch (error) {
    console.error("Failed to load keywords:", error);
    sleepKeywords = getDefaultKeywords();
    return sleepKeywords;
  }
}

export async function loadGrants() {
  try {
    const response = await fetch("data/dataset.csv");
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          allGrants = processGrantsData(results.data);
          console.log(`Loaded ${allGrants.length} grants`);
          resolve(allGrants);
        },
        error: function (error) {
          console.error("Error loading grants:", error);
          reject(error);
        },
      });
    });
  } catch (error) {
    showError(`Failed to load data: ${error.message}`);
    throw error;
  }
}

function processGrantsData(rawData) {
  return rawData
    .filter((row) => row.ID && row.Funding_body)
    .map((row) => ({
      id: row.ID || "",
      fundingBody: row.Funding_body || "",
      scheme: row.Scheme || "",
      organisation: row.Organisation || "",
      investigators: row.Investigators || "",
      date: row.Date || "",
      funding: parseFunding(row.Funding),
      summary: row.Summary || "",
      isSleep: false, // Will be set after keywords are loaded
    }));
}

export function classifyGrantsAsSleep(grants, keywords) {
  return grants.map((grant) => ({
    ...grant,
    isSleep: isSleepRelated(grant.summary, keywords),
  }));
}

function isSleepRelated(summary, keywords) {
  if (!summary || keywords.length === 0) return false;
  const lowerSummary = summary.toLowerCase();
  return keywords.some((keyword) => {
    const regex = new RegExp("\\b" + keyword + "\\b", "i");
    return regex.test(lowerSummary);
  });
}

function getDefaultKeywords() {
  return [
    "sleep",
    "fatigue",
    "overnight",
    "circadian",
    "shiftwork",
    "drowsy",
    "clock",
    "nighttime",
    "napping",
    "dream",
    "unconscious",
    "bodyclock",
    "sleepwake",
    "24hour",
    "sleepy",
    "alert",
    "shiftworker",
    "clocks",
    "insomnia",
    "cbti",
    "cbt-i",
    "apnoea",
    "osa",
    "chronotype",
    "apnea",
    "sleepiness",
    "undermattress",
    "apnoeahypopnoea",
    "vigilance",
    "asleep",
    "narcolepsy",
    "cataplexy",
  ];
}

export function getAllGrants() {
  return allGrants;
}

export function getSleepKeywords() {
  return sleepKeywords;
}

export function updateSleepKeywords(newKeywords) {
  sleepKeywords = [...newKeywords];
}
```

**Acceptance Criteria:**

- Data loading logic separated from UI
- Proper error handling
- Clean data processing pipeline
- Keyword management functions

#### Step 5: Create Filter Module

**File:** `scripts/filters.js`
**Content:**

```javascript
import { getAllGrants } from "./data-loader.js";

let filteredGrants = [];
let currentFilters = {
  fundingBody: "",
  organisation: "",
  scheme: "",
  investigator: "",
  sleepFilter: "",
};

export function getFilteredGrants() {
  return filteredGrants;
}

export function applyFilters(filters) {
  currentFilters = { ...filters };
  const allGrants = getAllGrants();

  filteredGrants = allGrants.filter((grant) => {
    if (filters.fundingBody && grant.fundingBody !== filters.fundingBody) {
      return false;
    }
    if (filters.organisation && grant.organisation !== filters.organisation) {
      return false;
    }
    if (filters.scheme && grant.scheme !== filters.scheme) {
      return false;
    }
    if (
      filters.investigator &&
      !grant.investigators
        .toLowerCase()
        .includes(filters.investigator.toLowerCase())
    ) {
      return false;
    }
    if (filters.sleepFilter === "sleep" && !grant.isSleep) {
      return false;
    }
    if (filters.sleepFilter === "other" && grant.isSleep) {
      return false;
    }
    return true;
  });

  return filteredGrants;
}

export function getCurrentFilters() {
  return { ...currentFilters };
}

export function resetFilters() {
  currentFilters = {
    fundingBody: "",
    organisation: "",
    scheme: "",
    investigator: "",
    sleepFilter: "",
  };
  filteredGrants = getAllGrants();
  return filteredGrants;
}

export function getFilterOptions(grants) {
  const fundingBodies = [...new Set(grants.map((g) => g.fundingBody))]
    .filter(Boolean)
    .sort();

  const orgCounts = {};
  grants.forEach((g) => {
    if (g.organisation) {
      orgCounts[g.organisation] = (orgCounts[g.organisation] || 0) + 1;
    }
  });

  const organisations = Object.keys(orgCounts).sort(
    (a, b) => orgCounts[b] - orgCounts[a],
  );

  const schemeCounts = {};
  grants.forEach((g) => {
    if (g.scheme) {
      schemeCounts[g.scheme] = (schemeCounts[g.scheme] || 0) + 1;
    }
  });

  const schemes = Object.keys(schemeCounts)
    .sort((a, b) => schemeCounts[b] - schemeCounts[a])
    .slice(0, 100); // Limit to top 100

  return {
    fundingBodies,
    organisations: organisations.map((org) => ({
      value: org,
      label: `${org} (${orgCounts[org]})`,
    })),
    schemes: schemes.map((scheme) => ({
      value: scheme,
      label: `${scheme} (${schemeCounts[scheme]})`,
    })),
  };
}
```

**Acceptance Criteria:**

- Filter logic separated from UI
- Pure functions for filtering
- Filter options generation
- State management for filters

#### Step 6: Create UI Updater Module

**File:** `scripts/ui-updater.js`
**Content:**

```javascript
import { formatCurrency, formatCurrencyFull } from "./utils.js";

export function updateKPIs(grants) {
  const totalGrants = grants.length;
  const sleepGrants = grants.filter((g) => g.isSleep);
  const totalFunding = grants.reduce((sum, g) => sum + g.funding, 0);
  const sleepFunding = sleepGrants.reduce((sum, g) => sum + g.funding, 0);
  const percentage = totalFunding > 0 ? (sleepFunding / totalFunding) * 100 : 0;
  const avgGrant = totalGrants > 0 ? totalFunding / totalGrants : 0;
  const avgSleepGrant =
    sleepGrants.length > 0 ? sleepFunding / sleepGrants.length : 0;

  // Update sleep research KPIs
  document.getElementById("kpi-sleep-funding").textContent =
    formatCurrency(sleepFunding);
  document.getElementById("kpi-sleep-percentage").textContent =
    percentage.toFixed(2) + "%";
  document.getElementById("kpi-sleep-grants").textContent =
    sleepGrants.length.toLocaleString();
  document.getElementById("kpi-avg-sleep-grant").textContent =
    formatCurrency(avgSleepGrant);

  // Update total KPIs
  document.getElementById("kpi-total-funding").textContent =
    formatCurrency(totalFunding);
  document.getElementById("kpi-total-grants").textContent =
    totalGrants.toLocaleString();
  document.getElementById("kpi-avg-grant").textContent =
    formatCurrency(avgGrant);
  document.getElementById("kpi-filtered-grants").textContent =
    totalGrants.toLocaleString();
}

export function updateTopTables(grants) {
  updateTopOrgsTable(grants);
  updateTopSchemesTable(grants);
}

function updateTopOrgsTable(grants) {
  const sleepGrants = grants.filter((g) => g.isSleep);
  const orgStats = {};

  sleepGrants.forEach((grant) => {
    const org = grant.organisation || "Unknown";
    if (!orgStats[org]) {
      orgStats[org] = { count: 0, funding: 0 };
    }
    orgStats[org].count++;
    orgStats[org].funding += grant.funding;
  });

  const sorted = Object.entries(orgStats)
    .sort((a, b) => b[1].funding - a[1].funding)
    .slice(0, 10);

  const tbody = document.querySelector("#top-orgs-table tbody");
  tbody.innerHTML = sorted
    .map(
      ([org, stats]) => `
        <tr>
            <td title="${org}">${
              org.length > 30 ? org.substring(0, 30) + "..." : org
            }</td>
            <td class="text-end">${stats.count}</td>
            <td class="text-end">${formatCurrency(stats.funding)}</td>
        </tr>
    `,
    )
    .join("");
}

function updateTopSchemesTable(grants) {
  const sleepGrants = grants.filter((g) => g.isSleep);
  const schemeStats = {};

  sleepGrants.forEach((grant) => {
    const scheme = grant.scheme || "Unknown";
    if (!schemeStats[scheme]) {
      schemeStats[scheme] = { count: 0, funding: 0 };
    }
    schemeStats[scheme].count++;
    schemeStats[scheme].funding += grant.funding;
  });

  const sorted = Object.entries(schemeStats)
    .sort((a, b) => b[1].funding - a[1].funding)
    .slice(0, 10);

  const tbody = document.querySelector("#top-schemes-table tbody");
  tbody.innerHTML = sorted
    .map(
      ([scheme, stats]) => `
        <tr>
            <td title="${scheme}">${
              scheme.length > 30 ? scheme.substring(0, 30) + "..." : scheme
            }</td>
            <td class="text-end">${stats.count}</td>
            <td class="text-end">${formatCurrency(stats.funding)}</td>
        </tr>
    `,
    )
    .join("");
}

export function populateFilterDropdowns(options) {
  // Funding Bodies
  const fundingBodySelect = document.getElementById("filter-funding-body");
  fundingBodySelect.innerHTML = '<option value="">All Funding Bodies</option>';
  options.fundingBodies.forEach((body) => {
    const option = document.createElement("option");
    option.value = body;
    option.textContent = body;
    fundingBodySelect.appendChild(option);
  });

  // Organisations
  const orgSelect = document.getElementById("filter-organisation");
  orgSelect.innerHTML = '<option value="">All Organisations</option>';
  options.organisations.forEach((org) => {
    const option = document.createElement("option");
    option.value = org.value;
    option.textContent = org.label;
    orgSelect.appendChild(option);
  });

  // Schemes
  const schemeSelect = document.getElementById("filter-scheme");
  schemeSelect.innerHTML = '<option value="">All Schemes</option>';
  options.schemes.forEach((scheme) => {
    const option = document.createElement("option");
    option.value = scheme.value;
    option.textContent = scheme.label;
    schemeSelect.appendChild(option);
  });
}
```
