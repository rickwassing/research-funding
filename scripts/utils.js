// Utility functions for the Research Funding Analysis Dashboard

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

export function isKeywordRelated(summary, keywords) {
  if (!summary || keywords.length === 0) return false;

  // Create lowercase keyword set for O(1) lookups
  const keywordSet = new Set(keywords.map((k) => k.toLowerCase()));

  // Tokenize the summary once
  const tokens = new Set(summary.toLowerCase().match(/\b[\w-]+\b/g) || []);

  // Check if any keyword matches
  for (const keyword of keywordSet) {
    if (tokens.has(keyword)) {
      return true;
    }
  }

  return false;
}

// Loading state utilities
export function showLoading(show) {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    loadingElement.style.display = show ? "flex" : "none";
  }
}

export function showError(message) {
  console.error("Application error:", message);
  alert("Error: " + message);
}

// Debounce utility for search inputs
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

// Parse year from date string (dd-mmm-yyyy format)
export function parseYear(dateStr) {
  if (!dateStr || dateStr.trim() === "") return "Unknown";
  try {
    // Parse dd-mmm-yyyy format (e.g., 01-Jan-2020)
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parts[2];
      // Validate it's a 4-digit year
      if (/^\d{4}$/.test(year)) {
        return year;
      }
    }
    return "Unknown";
  } catch (error) {
    console.warn("Error parsing date:", dateStr, error);
    return "Unknown";
  }
}

// Count grants per keyword (optimized with tokenization)
export function countKeywordsByGrant(grants, keywords) {
  // Create lowercase keyword set for O(1) lookups
  const keywordSet = new Set(keywords.map((k) => k.toLowerCase()));

  // Initialize counts object
  const counts = Object.fromEntries(keywords.map((k) => [k, 0]));

  // Process each grant
  for (const grant of grants) {
    // Use cached tokens if available, otherwise tokenize
    const tokens =
      grant.tokenizedSummary ||
      new Set((grant.summary || "").toLowerCase().match(/\b[\w-]+\b/g) || []);

    // Check each keyword against tokens
    for (const keyword of keywordSet) {
      if (tokens.has(keyword)) {
        counts[keyword]++;
      }
    }
  }

  return counts;
}

// Aggregate grants by year
export function aggregateByYear(grants, metric = "number") {
  const yearData = {};

  grants.forEach((grant) => {
    const year = grant.year || "Unknown";

    if (!yearData[year]) {
      yearData[year] = {
        total: { count: 0, amount: 0 },
        subset: { count: 0, amount: 0 },
      };
    }

    // Count grants
    yearData[year].total.count++;
    yearData[year].total.amount += grant.funding;

    // Count subset grants
    if (grant.isInSubset) {
      yearData[year].subset.count++;
      yearData[year].subset.amount += grant.funding;
    }
  });

  return yearData;
}

// Sort object by values (descending)
export function sortObjectByValues(obj, descending = true) {
  return Object.entries(obj)
    .sort(([, a], [, b]) => (descending ? b - a : a - b))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}
