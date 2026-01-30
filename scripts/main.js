// Main application module for Research Funding Analysis Dashboard

import { showLoading, showError, debounce } from "./utils.js";
import {
  loadKeywords,
  loadGrants,
  processGrantsData,
  classifyGrantsByKeywords,
  getAllGrants,
  getClassificationKeywords,
  updateClassificationKeywords,
  getDefaultKeywords,
} from "./data-loader.js";
import {
  applyFilters,
  resetFilters,
  getFilterOptions,
  getFilteredGrants,
  updateFilter,
  getCurrentFilters,
} from "./filters.js";
import {
  updateKPIs,
  updateTopTables,
  populateFilterDropdowns,
} from "./ui-updater.js";
import {
  renderKeywordChips,
  addKeyword,
  removeKeyword,
  removeAllKeywords,
  restoreDefaultKeywords,
} from "./keyword-manager.js";
import {
  updateAgencyChart,
  updateSubsetChart,
  updateKeywordDistributionChart,
  updateYearlyTrendsChart,
  destroyCharts,
} from "./charts.js";
import {
  initializeDataTable,
  updateDataTable,
  destroyDataTable,
  setupDetailModalHandler,
} from "./table-manager.js";

// Application state
let appState = {
  grants: [],
  filteredGrants: [],
  keywords: [],
  isInitialized: false,
};

// Get grant by ID
function getGrantById(id) {
  return appState.grants.find((g) => g.id === id);
}

// Update dashboard with current state
function updateDashboard() {
  updateKPIs(appState.filteredGrants, appState.grants.length);
  updateKeywordDistributionChart(
    appState.filteredGrants,
    appState.keywords,
    "bar",
  );
  updateYearlyTrendsChart(appState.filteredGrants, "number");
  updateAgencyChart(appState.filteredGrants, "bar");
  updateSubsetChart(appState.filteredGrants, "doughnut");
  updateTopTables(appState.filteredGrants);
  updateDataTable(appState.filteredGrants);
}

// Handle filter changes
function handleFilterChange() {
  const fundingBody = document.getElementById("filter-funding-body").value;
  const organisation = document.getElementById("filter-organisation").value;
  const scheme = document.getElementById("filter-scheme").value;
  const investigator = document.getElementById("filter-investigator").value;

  updateFilter("fundingBody", fundingBody);
  updateFilter("organisation", organisation);
  updateFilter("scheme", scheme);
  updateFilter("investigator", investigator);

  appState.filteredGrants = getFilteredGrants(appState.grants);
  updateDashboard();
}

// Handle keyword operations
function handleAddKeyword() {
  const input = document.getElementById("new-keyword-input");
  const newKeyword = input.value;

  const updatedKeywords = addKeyword(newKeyword, appState.keywords);
  if (updatedKeywords) {
    appState.keywords = updatedKeywords;
    updateClassificationKeywords(appState.keywords);
    renderKeywordChips(appState.keywords, handleRemoveKeyword);
    appState.filteredGrants = getFilteredGrants(appState.grants);
    updateDashboard();
    input.value = "";
  }
}

function handleRemoveKeyword(keywordToRemove) {
  appState.keywords = removeKeyword(keywordToRemove, appState.keywords);
  updateClassificationKeywords(appState.keywords);
  renderKeywordChips(appState.keywords, handleRemoveKeyword);
  appState.filteredGrants = getFilteredGrants(appState.grants);
  updateDashboard();
}

function handleRemoveAllKeywords() {
  if (appState.keywords.length === 0) {
    alert("No keywords to remove");
    return;
  }

  if (
    confirm(
      `Are you sure you want to remove all ${appState.keywords.length} keywords?`,
    )
  ) {
    appState.keywords = removeAllKeywords();
    updateClassificationKeywords(appState.keywords);
    renderKeywordChips(appState.keywords, handleRemoveKeyword);
    appState.filteredGrants = getFilteredGrants(appState.grants);
    updateDashboard();
  }
}

async function handleRestoreDefaultKeywords() {
  console.log("Restoring default keywords...");

  // Show loading state
  const restoreBtn = document.getElementById("restore-defaults");
  const originalText = restoreBtn.textContent;
  restoreBtn.textContent = "Loading...";
  restoreBtn.disabled = true;

  try {
    appState.keywords = restoreDefaultKeywords(getDefaultKeywords());
    updateClassificationKeywords(appState.keywords);
    renderKeywordChips(appState.keywords, handleRemoveKeyword);
    appState.filteredGrants = getFilteredGrants(appState.grants);
    updateDashboard();
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

// Initialize the application
async function initializeApp() {
  try {
    showLoading(true);

    // Load keywords and grants
    appState.keywords = await loadKeywords();
    const rawGrants = await loadGrants();

    // Process and classify grants
    appState.grants = processGrantsData(rawGrants);
    appState.grants = classifyGrantsByKeywords(appState.grants);

    // Apply initial filters
    appState.filteredGrants = getFilteredGrants(appState.grants);

    // Initialize UI components
    populateFilterDropdowns(appState.grants);
    renderKeywordChips(appState.keywords, handleRemoveKeyword);
    initializeDataTable(appState.filteredGrants);
    setupDetailModalHandler(getGrantById);
    updateDashboard();

    // Set up event listeners
    setupEventListeners();

    appState.isInitialized = true;
    console.log("Application initialized successfully");

    // Hide loading overlay
    showLoading(false);
  } catch (error) {
    console.error("Error initializing application:", error);
    showError("Failed to initialize application. Please check the console.");
    showLoading(false);
  }
}

// Set up event listeners
function setupEventListeners() {
  // Filter change listeners
  document
    .getElementById("filter-funding-body")
    .addEventListener("change", handleFilterChange);
  document
    .getElementById("filter-organisation")
    .addEventListener("change", handleFilterChange);
  document
    .getElementById("filter-scheme")
    .addEventListener("change", handleFilterChange);

  // Investigator search with debounce
  const investigatorInput = document.getElementById("filter-investigator");
  const debouncedFilterChange = debounce(handleFilterChange, 300);
  investigatorInput.addEventListener("input", debouncedFilterChange);

  // Reset filters
  document
    .getElementById("reset-filters")
    .addEventListener("click", function () {
      document.getElementById("filter-funding-body").value = "";
      document.getElementById("filter-organisation").value = "";
      document.getElementById("filter-scheme").value = "";
      document.getElementById("filter-investigator").value = "";

      resetFilters();
      appState.filteredGrants = getFilteredGrants(appState.grants);
      updateDashboard();
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
        updateAgencyChart(appState.filteredGrants, chartType);
      } else if (chartName === "subset") {
        updateSubsetChart(appState.filteredGrants, chartType);
      } else if (chartName === "keyword-distribution") {
        updateKeywordDistributionChart(
          appState.filteredGrants,
          appState.keywords,
          chartType,
        );
      } else if (chartName === "yearly-trends") {
        updateYearlyTrendsChart(appState.filteredGrants, chartType);
      }
    });
  });

  // Keyword management event listeners
  document
    .getElementById("add-keyword-btn")
    .addEventListener("click", handleAddKeyword);

  // Add keyword on Enter key press
  document
    .getElementById("new-keyword-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        handleAddKeyword();
      }
    });

  // Remove all keywords button
  document
    .getElementById("remove-all-keywords")
    .addEventListener("click", handleRemoveAllKeywords);

  // Restore defaults button
  document
    .getElementById("restore-defaults")
    .addEventListener("click", handleRestoreDefaultKeywords);
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);
