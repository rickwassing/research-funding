// UI update module for Sleep Research Funding Dashboard

import { formatCurrency, formatCurrencyFull } from "./utils.js";

// Update KPI cards
export function updateKPIs(grants) {
  const totalGrants = grants.length;
  const sleepGrants = grants.filter((g) => g.isSleep);
  const totalFunding = grants.reduce((sum, g) => sum + g.funding, 0);
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

// Update top tables
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
