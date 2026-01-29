# Plan 04: Architectural Improvements (Complete)

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
**Content:** (See previous section for full code)

**Acceptance Criteria:**

- Utility functions extracted from original app.js
- Proper exports for module usage
- Error handling utilities included

#### Step 4: Create Data Loader Module

**File:** `scripts/data-loader.js`
**Content:** (See previous section for full code)

**Acceptance Criteria:**

- Data loading logic separated from UI
- Proper error handling
- Clean data processing pipeline
- Keyword management functions

#### Step 5: Create Filter Module

**File:** `scripts/filters.js`
**Content:** (See previous section for full code)

**Acceptance Criteria:**

- Filter logic separated from UI
- Pure functions for filtering
- Filter options generation
- State management for filters

#### Step 6: Create UI Updater Module

**File:** `scripts/ui-updater.js`
**Content:** (See previous section for full code)

**Acceptance Criteria:**

- UI update functions separated from business logic
- Clean separation of concerns
- Reusable functions for different UI components

#### Step 7: Create Keyword Manager Module

**File:** `scripts/keyword-manager.js`
**Content:**

```javascript
import { getSleepKeywords, updateSleepKeywords } from "./data-loader.js";

export function renderKeywordChips(keywords, onRemoveKeyword) {
  const container = document.getElementById("keyword-chips-container");
  container.innerHTML = "";

  keywords.forEach((keyword) => {
    const chip = document.createElement("div");
    chip.className = "keyword-chip";
    chip.innerHTML = `
      ${keyword}
      <button class="keyword-chip-remove" data-keyword="${keyword}">×</button>
    `;
    container.appendChild(chip);
  });

  // Add event listeners to remove buttons
  container.querySelectorAll(".keyword-chip-remove").forEach((button) => {
    button.addEventListener("click", function () {
      const keywordToRemove = this.getAttribute("data-keyword");
      onRemoveKeyword(keywordToRemove);
    });
  });
}

export function addKeyword(newKeyword, keywords) {
  const trimmedKeyword = newKeyword.trim().toLowerCase();

  if (!trimmedKeyword) {
    alert("Please enter a keyword");
    return false;
  }

  // Check for duplicates
  if (keywords.some((k) => k.toLowerCase() === trimmedKeyword)) {
    alert(`"${trimmedKeyword}" is already in the keyword list`);
    return false;
  }

  // Limit to 100 keywords
  if (keywords.length >= 100) {
    alert(
      "Maximum of 100 keywords reached. Please remove some keywords before adding more.",
    );
    return false;
  }

  // Add the keyword
  const updatedKeywords = [...keywords, trimmedKeyword];
  updateSleepKeywords(updatedKeywords);
  return true;
}

export function removeKeyword(keywordToRemove, keywords) {
  const updatedKeywords = keywords.filter((k) => k !== keywordToRemove);
  updateSleepKeywords(updatedKeywords);
  return updatedKeywords;
}

export function removeAllKeywords() {
  updateSleepKeywords([]);
  return [];
}

export function restoreDefaultKeywords(defaultKeywords) {
  updateSleepKeywords([...defaultKeywords]);
  return [...defaultKeywords];
}
```

**Acceptance Criteria:**

- Keyword management logic separated
- Clean API for keyword operations
- Event handling for UI interactions

#### Step 8: Create Charts Module

**File:** `scripts/charts.js`
**Content:**

```javascript
import { formatCurrency, formatCurrencyFull } from "./utils.js";

let charts = {
  agency: null,
  sleep: null,
};

export function updateAgencyChart(grants, type = "bar") {
  const ctx = document.getElementById("chart-agency").getContext("2d");

  // Calculate funding by agency
  const agencyData = {};
  const agencySleepData = {};

  grants.forEach((grant) => {
    const body = grant.fundingBody || "Unknown";
    agencyData[body] = (agencyData[body] || 0) + grant.funding;
    if (grant.isSleep) {
      agencySleepData[body] = (agencySleepData[body] || 0) + grant.funding;
    }
  });

  const labels = Object.keys(agencyData)
    .filter((k) => k && k !== "Unknown")
    .sort();
  const totalValues = labels.map((l) => agencyData[l] || 0);
  const sleepValues = labels.map((l) => agencySleepData[l] || 0);

  // Destroy existing chart if present
  if (charts.agency) {
    charts.agency.destroy();
  }

  if (type === "bar") {
    charts.agency = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total Funding",
            data: totalValues,
            backgroundColor: "#4299e1",
            borderRadius: 4,
          },
          {
            label: "Sleep Research Funding",
            data: sleepValues,
            backgroundColor: "#ed8936",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return (
                  context.dataset.label + ": " + formatCurrencyFull(context.raw)
                );
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return formatCurrency(value);
              },
            },
          },
        },
      },
    });
  } else {
    charts.agency = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: totalValues,
            backgroundColor: ["#4299e1", "#48bb78", "#ed8936", "#9f7aea"].slice(
              0,
              labels.length,
            ),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return (
                  context.label +
                  ": " +
                  formatCurrencyFull(context.raw) +
                  " (" +
                  percentage +
                  "%)"
                );
              },
            },
          },
        },
      },
    });
  }
}

export function updateSleepChart(grants, type = "doughnut") {
  const ctx = document.getElementById("chart-sleep").getContext("2d");

  const sleepFunding = grants
    .filter((g) => g.isSleep)
    .reduce((sum, g) => sum + g.funding, 0);
  const otherFunding = grants
    .filter((g) => !g.isSleep)
    .reduce((sum, g) => sum + g.funding, 0);

  // Destroy existing chart if present
  if (charts.sleep) {
    charts.sleep.destroy();
  }

  if (type === "doughnut") {
    charts.sleep = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Sleep Research", "Other Research"],
        datasets: [
          {
            data: [sleepFunding, otherFunding],
            backgroundColor: ["#ed8936", "#a0aec0"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(2);
                return (
                  context.label +
                  ": " +
                  formatCurrencyFull(context.raw) +
                  " (" +
                  percentage +
                  "%)"
                );
              },
            },
          },
        },
      },
    });
  } else {
    charts.sleep = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Sleep Research", "Other Research"],
        datasets: [
          {
            label: "Funding Amount",
            data: [sleepFunding, otherFunding],
            backgroundColor: ["#ed8936", "#a0aec0"],
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return formatCurrencyFull(context.raw);
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return formatCurrency(value);
              },
            },
          },
        },
      },
    });
  }
}

export function destroyCharts() {
  if (charts.agency) {
    charts.agency.destroy();
    charts.agency = null;
  }
  if (charts.sleep) {
    charts.sleep.destroy();
    charts.sleep = null;
  }
}
```

**Acceptance Criteria:**

- Chart rendering logic separated
- Clean chart management
- Type switching functionality preserved

#### Step 9: Create Table Manager Module

**File:** `scripts/table-manager.js`
**Content:**

```javascript
import { formatCurrency } from "./utils.js";

let dataTable = null;

export function initializeDataTable(grants) {
  dataTable = $("#grants-table").DataTable({
    data: grants,
    columns: [
      { data: "id" },
      {
        data: "isSleep",
        render: function (data) {
          return data
            ? '<span class="badge badge-sleep">Sleep</span>'
            : '<span class="badge badge-other">Other</span>';
        },
      },
      { data: "fundingBody" },
      {
        data: "organisation",
        render: function (data) {
          if (!data) return "";
          return data.length > 25 ? data.substring(0, 25) + "..." : data;
        },
      },
      {
        data: "scheme",
        render: function (data) {
          if (!data) return "";
          return data.length > 25 ? data.substring(0, 25) + "..." : data;
        },
      },
      {
        data: "funding",
        render: function (data) {
          return formatCurrency(data);
        },
      },
      {
        data: null,
        render: function (data, type, row) {
          return `<button class="btn btn-sm btn-outline-primary view-details" data-id="${row.id}">View</button>`;
        },
      },
    ],
    order: [[5, "desc"]],
    pageLength: 25,
    lengthMenu: [
      [10, 25, 50, 100],
      [10, 25, 50, 100],
    ],
    language: {
      search: "Search grants:",
      lengthMenu: "Show _MENU_ grants",
      info: "Showing _START_ to _END_ of _TOTAL_ grants",
    },
  });

  return dataTable;
}

export function updateDataTable(grants) {
  if (dataTable) {
    dataTable.clear();
    dataTable.rows.add(grants);
    dataTable.draw();
  }
}

export function destroyDataTable() {
  if (dataTable) {
    dataTable.destroy();
    dataTable = null;
  }
}

export function setupDetailModalHandler(getGrantById) {
  $("#grants-table").on("click", ".view-details", function () {
    const id = $(this).data("id");
    const grant = getGrantById(id);
    if (grant) {
      showGrantDetails(grant);
    }
  });
}

function showGrantDetails(grant) {
  document.getElementById("modal-title").textContent = "Grant: " + grant.id;
  document.getElementById("modal-id").textContent = grant.id;
  document.getElementById("modal-funding").textContent = formatCurrencyFull(
    grant.funding,
  );
  document.getElementById("modal-agency").textContent = grant.fundingBody;
  document.getElementById("modal-type").innerHTML = grant.isSleep
    ? '<span class="badge badge-sleep">Sleep Research</span>'
    : '<span class="badge badge-other">Other Research</span>';
  document.getElementById("modal-org").textContent = grant.organisation;
  document.getElementById("modal-scheme").textContent = grant.scheme;
  document.getElementById("modal-investigators").textContent =
    grant.investigators;
  document.getElementById("modal-summary").textContent = grant.summary;

  const modal = new bootstrap.Modal(document.getElementById("detailModal"));
  modal.show();
}
```

**Acceptance Criteria:**

- DataTable management separated
- Clean initialization and update functions
- Modal handling logic

#### Step 10: Create Main Application Module

**File:** `scripts/main.js`
**Content:**

```javascript
import { showLoading, showError, debounce } from "./utils.js";
import { loadKeywords, loadGrants, classifyGrantsAsSleep, getAllGrants, getSleepKeywords, updateSleepKeywords } from "./data-loader.js";
import { applyFilters, resetFilters, getFilterOptions, getFilteredGrants } from "./filters.js";
import { updateKPIs, updateTopTables, populateFilterDropdowns } from "./ui-updater.js";
import { renderKeywordChips, addKeyword, removeKeyword, removeAllKeywords, restoreDefaultKeywords } from "./keyword-manager.js";
import { updateAgencyChart, updateSleepChart, destroyCharts } from "./charts.js";
import { initializeDataTable, updateDataTable, destroyDataTable, setupDetailModalHandler } from "./table-manager.js";

// Application state
let appState = {
  grants: [],
  filteredGrants: [],
  keywords: [],
  isInitialized: false
};

async function initializeApp() {
  try {
    showLoading(true);

    // Load keywords and grants
    appState.keywords = await loadKeywords();
    const rawGrants = await loadGrants();

    // Classify grants as sleep research
    appState.grants = classifyG
```
