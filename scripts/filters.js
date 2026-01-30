// Filter logic module for Research Funding Analysis Dashboard

// Filter state
let currentFilters = {
  fundingBody: "",
  organisation: "",
  scheme: "",
  investigator: "",
};

// Apply filters to grants
export function applyFilters(grants, filters = currentFilters) {
  const { fundingBody, organisation, scheme, investigator } = filters;

  return grants.filter((grant) => {
    if (fundingBody && grant.fundingBody !== fundingBody) return false;
    if (organisation && grant.organisation !== organisation) return false;
    if (scheme && grant.scheme !== scheme) return false;
    if (
      investigator &&
      !grant.investigators.toLowerCase().includes(investigator.toLowerCase())
    )
      return false;
    return true;
  });
}

// Reset all filters
export function resetFilters() {
  currentFilters = {
    fundingBody: "",
    organisation: "",
    scheme: "",
    investigator: "",
  };
  return currentFilters;
}

// Update a specific filter
export function updateFilter(filterName, value) {
  currentFilters[filterName] = value;
  return currentFilters;
}

// Get current filters
export function getCurrentFilters() {
  return { ...currentFilters };
}

// Get filter options from grants
export function getFilterOptions(grants) {
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

// Get filtered grants (convenience function)
export function getFilteredGrants(grants, filters = currentFilters) {
  return applyFilters(grants, filters);
}
