// Sleep Research Funding Dashboard - Application Logic
// Australasian Sleep Association Research Committee

// Sleep-related keywords for classification (loaded from keywords.csv)
let defaultKeywords = [
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
let sleepKeywords = [];

// Global state
let allGrants = [];
let filteredGrants = [];
let charts = {};
let dataTable = null;

// Utility Functions
function formatCurrency(value) {
  if (value >= 1e9) {
    return "$" + (value / 1e9).toFixed(2) + "B";
  } else if (value >= 1e6) {
    return "$" + (value / 1e6).toFixed(1) + "M";
  } else if (value >= 1e3) {
    return "$" + (value / 1e3).toFixed(0) + "K";
  }
  return "$" + value.toFixed(0);
}

function formatCurrencyFull(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function parseFunding(fundingStr) {
  if (!fundingStr) return 0;
  const cleaned = String(fundingStr).replace(/[,$\s]/g, "");
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

function isSleepRelated(summary) {
  if (!summary || sleepKeywords.length === 0) return false;
  const lowerSummary = summary.toLowerCase();
  return sleepKeywords.some((keyword) => {
    // Use word boundary matching to avoid false positives
    const regex = new RegExp("\\b" + keyword + "\\b", "i");
    return regex.test(lowerSummary);
  });
}

// Keyword Management Functions
function renderKeywordChips() {
  const container = document.getElementById("keyword-chips-container");
  container.innerHTML = "";

  sleepKeywords.forEach((keyword) => {
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
      removeKeyword(keywordToRemove);
    });
  });
}

function addKeyword(keyword) {
  // Validate input
  const trimmedKeyword = keyword.trim().toLowerCase();

  if (!trimmedKeyword) {
    alert("Please enter a keyword");
    return false;
  }

  // Check for duplicates (case-insensitive)
  if (sleepKeywords.some((k) => k.toLowerCase() === trimmedKeyword)) {
    alert(`"${trimmedKeyword}" is already in the keyword list`);
    return false;
  }

  // Limit to 100 keywords as requested
  if (sleepKeywords.length >= 100) {
    alert(
      "Maximum of 100 keywords reached. Please remove some keywords before adding more.",
    );
    return false;
  }

  // Add the keyword
  sleepKeywords.push(trimmedKeyword);
  console.log(`Added keyword: "${trimmedKeyword}"`);

  // Update UI
  renderKeywordChips();

  // Update analysis with new keywords
  updateAnalysisWithNewKeywords();

  // Clear input
  document.getElementById("new-keyword-input").value = "";

  return true;
}

function removeKeyword(keyword) {
  const keywordIndex = sleepKeywords.indexOf(keyword);
  if (keywordIndex !== -1) {
    sleepKeywords.splice(keywordIndex, 1);
    console.log(`Removed keyword: "${keyword}"`);

    // Update UI
    renderKeywordChips();

    // Update analysis with new keywords
    updateAnalysisWithNewKeywords();
  }
}

function removeAllKeywords() {
  if (sleepKeywords.length === 0) {
    alert("No keywords to remove");
    return;
  }

  if (
    confirm(
      `Are you sure you want to remove all ${sleepKeywords.length} keywords?`,
    )
  ) {
    sleepKeywords = [];
    console.log("Removed all keywords");

    // Update UI
    renderKeywordChips();

    // Update analysis with new keywords
    updateAnalysisWithNewKeywords();
  }
}

async function restoreDefaultKeywords() {
  console.log("Restoring default keywords from keywords.csv...");

  // Show loading state
  const restoreBtn = document.getElementById("restore-defaults");
  const originalText = restoreBtn.textContent;
  restoreBtn.textContent = "Loading...";
  restoreBtn.disabled = true;

  try {
    // Reload keywords from CSV
    await loadKeywords();

    // Update UI
    renderKeywordChips();

    // Update analysis with new keywords
    updateAnalysisWithNewKeywords();

    console.log("Default keywords restored");
  } catch (error) {
    console.error("Error restoring default keywords:", error);
    alert("Error restoring default keywords. Please try again.");
  } finally {
    // Restore button state
    restoreBtn.textContent = originalText;
    restoreBtn.disabled = false;
  }
}

function updateAnalysisWithNewKeywords() {
  console.log("Updating analysis with new keywords...");

  // Recalculate sleep classification for all grants
  allGrants.forEach((grant) => {
    grant.isSleep = isSleepRelated(grant.summary);
  });

  // Apply current filters
  applyFilters();

  // Update dashboard
  updateDashboard();

  console.log("Analysis updated with", sleepKeywords.length, "keywords");
}

// Keyword Loading
async function loadKeywords() {
  return new Promise((resolve, reject) => {
    try {
      console.log("Loading keywords from keywords.csv...");
      fetch("keywords.csv")
        .then((response) => response.text())
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
              // Extract keywords from the parsed data
              sleepKeywords = results.data
                .map((row) => row.Keywords)
                .filter((keyword) => keyword && keyword.trim() !== "");

              console.log(
                `Loaded ${sleepKeywords.length} keywords from keywords.csv`,
              );
              console.log("Keywords:", sleepKeywords);
              resolve(sleepKeywords);
            },
            error: function (error) {
              console.error("Error loading keywords CSV:", error);
              alert("Error loading keywords file. Using default keywords.");
              // Fallback to default keywords
              sleepKeywords = defaultKeywords;
              console.log(
                "Using default keywords:",
                sleepKeywords.length,
                "keywords",
              );
              resolve(sleepKeywords);
            },
          });
        })
        .catch((error) => {
          console.error("Error fetching keywords CSV:", error);
          alert("Error loading keywords file. Using default keywords.");
          // Fallback to default keywords
          sleepKeywords = defaultKeywords;
          console.log(
            "Using default keywords due to error:",
            sleepKeywords.length,
            "keywords",
          );
          resolve(sleepKeywords);
        });
    } catch (error) {
      console.error("Error in loadKeywords:", error);
      // Fallback to default keywords
      sleepKeywords = defaultKeywords;
      console.log(
        "Using default keywords due to catch error:",
        sleepKeywords.length,
        "keywords",
      );
      resolve(sleepKeywords);
    }
  });
}

// Data Loading
async function loadData() {
  try {
    // Load keywords first
    await loadKeywords();

    console.log("Keywords loaded, now loading main dataset...");

    const response = await fetch("dataset.csv");
    const csvText = await response.text();

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        processData(results.data);
      },
      error: function (error) {
        console.error("CSV parsing error:", error);
        alert("Error loading data. Please check the console.");
      },
    });
  } catch (error) {
    console.error("Error loading CSV:", error);
    alert(
      "Error loading data file. Make sure dataset.csv is in the same folder.",
    );
  }
}

function processData(data) {
  // Process and enhance data
  allGrants = data
    .filter((row) => row.ID && row.Funding_body) // Filter out empty rows
    .map((row) => ({
      id: row.ID || "",
      fundingBody: row.Funding_body || "",
      scheme: row.Scheme || "",
      organisation: row.Organisation || "",
      investigators: row.Investigators || "",
      date: row.Date || "",
      funding: parseFunding(row.Funding),
      summary: row.Summary || "",
      isSleep: isSleepRelated(row.Summary),
    }));

  filteredGrants = [...allGrants];

  // Initialize UI
  populateFilters();
  updateDashboard();
  initializeDataTable();

  // Render keyword chips
  renderKeywordChips();

  // Hide loading overlay
  document.getElementById("loading").style.display = "none";
}

// Filter Population
function populateFilters() {
  // Funding Bodies
  const fundingBodies = [...new Set(allGrants.map((g) => g.fundingBody))]
    .filter(Boolean)
    .sort();
  const fundingBodySelect = document.getElementById("filter-funding-body");
  fundingBodies.forEach((body) => {
    const option = document.createElement("option");
    option.value = body;
    option.textContent = body;
    fundingBodySelect.appendChild(option);
  });

  // Organisations (sorted by frequency)
  const orgCounts = {};
  allGrants.forEach((g) => {
    if (g.organisation) {
      orgCounts[g.organisation] = (orgCounts[g.organisation] || 0) + 1;
    }
  });
  const organisations = Object.keys(orgCounts).sort(
    (a, b) => orgCounts[b] - orgCounts[a],
  );
  const orgSelect = document.getElementById("filter-organisation");
  organisations.forEach((org) => {
    const option = document.createElement("option");
    option.value = org;
    option.textContent = `${org} (${orgCounts[org]})`;
    orgSelect.appendChild(option);
  });

  // Schemes (sorted by frequency)
  const schemeCounts = {};
  allGrants.forEach((g) => {
    if (g.scheme) {
      schemeCounts[g.scheme] = (schemeCounts[g.scheme] || 0) + 1;
    }
  });
  const schemes = Object.keys(schemeCounts).sort(
    (a, b) => schemeCounts[b] - schemeCounts[a],
  );
  const schemeSelect = document.getElementById("filter-scheme");
  schemes.slice(0, 100).forEach((scheme) => {
    // Limit to top 100
    const option = document.createElement("option");
    option.value = scheme;
    option.textContent = `${scheme} (${schemeCounts[scheme]})`;
    schemeSelect.appendChild(option);
  });
}

// Filter Application
function applyFilters() {
  const fundingBody = document.getElementById("filter-funding-body").value;
  const organisation = document.getElementById("filter-organisation").value;
  const scheme = document.getElementById("filter-scheme").value;
  const investigator = document
    .getElementById("filter-investigator")
    .value.toLowerCase();
  const sleepFilter = document.getElementById("filter-sleep").value;

  filteredGrants = allGrants.filter((grant) => {
    if (fundingBody && grant.fundingBody !== fundingBody) return false;
    if (organisation && grant.organisation !== organisation) return false;
    if (scheme && grant.scheme !== scheme) return false;
    if (
      investigator &&
      !grant.investigators.toLowerCase().includes(investigator)
    )
      return false;
    if (sleepFilter === "sleep" && !grant.isSleep) return false;
    if (sleepFilter === "other" && grant.isSleep) return false;
    return true;
  });

  updateDashboard();
  updateDataTable();
}

// Dashboard Update
function updateDashboard() {
  updateKPIs();
  updateCharts();
  updateTopTables();
}

function updateKPIs() {
  const totalGrants = filteredGrants.length;
  const sleepGrants = filteredGrants.filter((g) => g.isSleep);
  const totalFunding = filteredGrants.reduce((sum, g) => sum + g.funding, 0);
  const sleepFunding = sleepGrants.reduce((sum, g) => sum + g.funding, 0);
  const percentage = totalFunding > 0 ? (sleepFunding / totalFunding) * 100 : 0;
  const avgGrant = totalGrants > 0 ? totalFunding / totalGrants : 0;
  const avgSleepGrant =
    sleepGrants.length > 0 ? sleepFunding / sleepGrants.length : 0;

  // Sleep research KPIs (row 1)
  document.getElementById("kpi-sleep-funding").textContent =
    formatCurrency(sleepFunding);
  document.getElementById("kpi-sleep-percentage").textContent =
    percentage.toFixed(2) + "%";
  document.getElementById("kpi-sleep-grants").textContent =
    sleepGrants.length.toLocaleString();
  document.getElementById("kpi-avg-sleep-grant").textContent =
    formatCurrency(avgSleepGrant);

  // Total KPIs (row 2)
  document.getElementById("kpi-total-funding").textContent =
    formatCurrency(totalFunding);
  document.getElementById("kpi-total-grants").textContent =
    totalGrants.toLocaleString();
  document.getElementById("kpi-avg-grant").textContent =
    formatCurrency(avgGrant);
  document.getElementById("kpi-filtered-grants").textContent =
    totalGrants.toLocaleString();
}

// Chart Functions
function updateCharts() {
  updateAgencyChart("bar");
  updateSleepChart("doughnut");
}

function updateAgencyChart(type) {
  const ctx = document.getElementById("chart-agency").getContext("2d");

  // Calculate funding by agency
  const agencyData = {};
  const agencySleepData = {};

  filteredGrants.forEach((grant) => {
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

  const colors = ["#4299e1", "#48bb78", "#ed8936", "#9f7aea"];
  const sleepColors = ["#ed8936", "#f6ad55", "#fbd38d"];

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
            backgroundColor: colors.slice(0, labels.length),
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

function updateSleepChart(type) {
  const ctx = document.getElementById("chart-sleep").getContext("2d");

  const sleepFunding = filteredGrants
    .filter((g) => g.isSleep)
    .reduce((sum, g) => sum + g.funding, 0);
  const otherFunding = filteredGrants
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

// Top Tables
function updateTopTables() {
  updateTopOrgsTable();
  updateTopSchemesTable();
}

function updateTopOrgsTable() {
  const sleepGrants = filteredGrants.filter((g) => g.isSleep);
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

function updateTopSchemesTable() {
  const sleepGrants = filteredGrants.filter((g) => g.isSleep);
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

// DataTable Functions
function initializeDataTable() {
  dataTable = $("#grants-table").DataTable({
    data: filteredGrants,
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

  // View details click handler
  $("#grants-table").on("click", ".view-details", function () {
    const id = $(this).data("id");
    const grant = allGrants.find((g) => g.id === id);
    if (grant) {
      showGrantDetails(grant);
    }
  });
}

function updateDataTable() {
  if (dataTable) {
    dataTable.clear();
    dataTable.rows.add(filteredGrants);
    dataTable.draw();
  }
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

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Load data
  loadData();

  // Filter change listeners
  document
    .getElementById("filter-funding-body")
    .addEventListener("change", applyFilters);
  document
    .getElementById("filter-organisation")
    .addEventListener("change", applyFilters);
  document
    .getElementById("filter-scheme")
    .addEventListener("change", applyFilters);
  document
    .getElementById("filter-sleep")
    .addEventListener("change", applyFilters);

  // Investigator search with debounce
  let searchTimeout;
  document
    .getElementById("filter-investigator")
    .addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(applyFilters, 300);
    });

  // Reset filters
  document
    .getElementById("reset-filters")
    .addEventListener("click", function () {
      document.getElementById("filter-funding-body").value = "";
      document.getElementById("filter-organisation").value = "";
      document.getElementById("filter-scheme").value = "";
      document.getElementById("filter-investigator").value = "";
      document.getElementById("filter-sleep").value = "";
      filteredGrants = [...allGrants];
      updateDashboard();
      updateDataTable();
    });

  // Chart type buttons
  document.querySelectorAll(".btn-chart-type").forEach((btn) => {
    btn.addEventListener("click", function () {
      const chartName = this.dataset.chart;
      const chartType = this.dataset.type;

      // Update active state
      document
        .querySelectorAll(`.btn-chart-type[data-chart="${chartName}"]`)
        .forEach((b) => {
          b.classList.remove("active");
        });
      this.classList.add("active");

      // Update chart
      if (chartName === "agency") {
        updateAgencyChart(chartType);
      } else if (chartName === "sleep") {
        updateSleepChart(chartType);
      }
    });
  });

  // Keyword management event listeners
  document
    .getElementById("add-keyword-btn")
    .addEventListener("click", function () {
      const input = document.getElementById("new-keyword-input");
      addKeyword(input.value);
    });

  // Add keyword on Enter key press
  document
    .getElementById("new-keyword-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        addKeyword(this.value);
      }
    });

  // Remove all keywords button
  document
    .getElementById("remove-all-keywords")
    .addEventListener("click", removeAllKeywords);

  // Restore defaults button
  document
    .getElementById("restore-defaults")
    .addEventListener("click", restoreDefaultKeywords);
});
