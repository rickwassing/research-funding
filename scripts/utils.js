// Utility functions for the Sleep Research Funding Dashboard

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

export function isSleepRelated(summary, sleepKeywords) {
  if (!summary || sleepKeywords.length === 0) return false;
  const lowerSummary = summary.toLowerCase();
  return sleepKeywords.some((keyword) => {
    // Use word boundary matching to avoid false positives
    const regex = new RegExp("\\b" + keyword + "\\b", "i");
    return regex.test(lowerSummary);
  });
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
