// UI update module for Research Funding Analysis Dashboard

import { formatCurrency, formatCurrencyFull } from "./utils.js";

// Update KPI cards
export function updateKPIs(grants, totalDatasetCount) {
  const totalGrants = grants.length;
  const subsetGrants = grants.filter((g) => g.isInSubset);
  const totalFunding = grants.reduce((sum, g) => sum + g.funding, 0);
  const subsetFunding = subsetGrants.reduce((sum, g) => sum + g.funding, 0);
  const avgGrant = totalGrants > 0 ? totalFunding / totalGrants : 0;
  const avgSubsetGrant =
    subsetGrants.length > 0 ? subsetFunding / subsetGrants.length : 0;

  // Calculate percentages (Row 1 ÷ Row 2)
  const percentageFunding =
    totalFunding > 0 ? (subsetFunding / totalFunding) * 100 : 0;
  const percentageGrants =
    totalGrants > 0 ? (subsetGrants.length / totalGrants) * 100 : 0;
  const percentageAvg = avgGrant > 0 ? (avgSubsetGrant / avgGrant) * 100 : 0;

  // Subset KPIs (row 1)
  document.getElementById("kpi-subset-funding").textContent =
    formatCurrency(subsetFunding);
  document.getElementById("kpi-subset-grants").textContent =
    subsetGrants.length.toLocaleString();
  document.getElementById("kpi-avg-subset-grant").textContent =
    formatCurrency(avgSubsetGrant);

  // Total Filtered KPIs (row 2)
  document.getElementById("kpi-total-funding").textContent =
    formatCurrency(totalFunding);
  document.getElementById("kpi-total-grants").textContent =
    totalGrants.toLocaleString();
  document.getElementById("kpi-avg-grant").textContent =
    formatCurrency(avgGrant);

  // Update total dataset reference
  document.getElementById("kpi-total-dataset-grants").textContent =
    totalDatasetCount.toLocaleString();

  // Percentage KPIs (row 3)
  document.getElementById("kpi-percentage-funding").textContent =
    percentageFunding.toFixed(2) + "%";
  document.getElementById("kpi-percentage-grants").textContent =
    percentageGrants.toFixed(2) + "%";
  document.getElementById("kpi-percentage-avg").textContent =
    percentageAvg.toFixed(2) + "%";
}

// Update top tables
export function updateTopTables(grants) {
  updateTopOrgsTable(grants);
  updateTopSchemesTable(grants);
}

function updateTopOrgsTable(grants) {
  const subsetGrants = grants.filter((g) => g.isInSubset);
  const orgStats = {};

  subsetGrants.forEach((grant) => {
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
  const subsetGrants = grants.filter((g) => g.isInSubset);
  const schemeStats = {};

  subsetGrants.forEach((grant) => {
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

// Populate filter dropdowns
export function populateFilterDropdowns(grants) {
  const { fundingBodies, organisations, schemes, orgCounts, schemeCounts } =
    getFilterOptions(grants);

  // Funding Bodies
  const fundingBodySelect = document.getElementById("filter-funding-body");
  fundingBodySelect.innerHTML = '<option value="">All Funding Bodies</option>';
  fundingBodies.forEach((body) => {
    const option = document.createElement("option");
    option.value = body;
    option.textContent = body;
    fundingBodySelect.appendChild(option);
  });

  // Organisations
  const orgSelect = document.getElementById("filter-organisation");
  orgSelect.innerHTML = '<option value="">All Organisations</option>';
  organisations.slice(0, 100).forEach((org) => {
    // Limit to top 100
    const option = document.createElement("option");
    option.value = org;
    option.textContent = `${org} (${orgCounts[org]})`;
    orgSelect.appendChild(option);
  });

  // Schemes
  const schemeSelect = document.getElementById("filter-scheme");
  schemeSelect.innerHTML = '<option value="">All Schemes</option>';
  schemes.slice(0, 100).forEach((scheme) => {
    // Limit to top 100
    const option = document.createElement("option");
    option.value = scheme;
    option.textContent = `${scheme} (${schemeCounts[scheme]})`;
    schemeSelect.appendChild(option);
  });
}

// Helper function to get filter options (duplicated from filters.js for independence)
function getFilterOptions(grants) {
  // Funding Bodies
  const fundingBodies = [...new Set(grants.map((g) => g.fundingBody))]
    .filter(Boolean)
    .sort();

  // Organisations (sorted by frequency)
  const orgCounts = {};
  grants.forEach((g) => {
    if (g.organisation) {
      orgCounts[g.organisation] = (orgCounts[g.organisation] || 0) + 1;
    }
  });
  const organisations = Object.keys(orgCounts).sort(
    (a, b) => orgCounts[b] - orgCounts[a],
  );

  // Schemes (sorted by frequency)
  const schemeCounts = {};
  grants.forEach((g) => {
    if (g.scheme) {
      schemeCounts[g.scheme] = (schemeCounts[g.scheme] || 0) + 1;
    }
  });
  const schemes = Object.keys(schemeCounts).sort(
    (a, b) => schemeCounts[b] - schemeCounts[a],
  );

  return {
    fundingBodies,
    organisations,
    schemes,
    orgCounts,
    schemeCounts,
  };
}
