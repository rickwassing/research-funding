// CSV export utilities for Research Funding Analysis Dashboard

/**
 * Convert grants data to CSV string
 * @param {Array} grants - Array of grant objects
 * @returns {string} CSV formatted string
 */
export function grantsToCSVString(grants) {
  if (!grants || grants.length === 0) {
    return "";
  }

  // Define the columns to export - all fields from original dataset plus computed fields
  const columns = [
    { key: "id", header: "ID" },
    { key: "fundingBody", header: "Funding_body" },
    { key: "scheme", header: "Scheme" },
    { key: "organisation", header: "Organisation" },
    { key: "investigators", header: "Investigators" },
    { key: "date", header: "Date" },
    { key: "funding", header: "Funding" },
    { key: "summary", header: "Summary" },
    { key: "year", header: "Year" },
    {
      key: "isInSubset",
      header: "Subset_Status",
      transform: (value) => (value ? "Subset" : "Other"),
    },
  ];

  // Build CSV rows
  const rows = [];

  // Add header row
  const headers = columns.map((col) => escapeCSVField(col.header));
  rows.push(headers.join(","));

  // Add data rows
  for (const grant of grants) {
    const row = columns.map((col) => {
      let value = grant[col.key];

      // Apply transformation if specified
      if (col.transform) {
        value = col.transform(value);
      }

      // Handle undefined/null values
      if (value === undefined || value === null) {
        value = "";
      }

      return escapeCSVField(value);
    });

    rows.push(row.join(","));
  }

  return rows.join("\n");
}

/**
 * Escape a field for CSV format
 * @param {string} field - Field value to escape
 * @returns {string} Escaped CSV field
 */
function escapeCSVField(field) {
  if (field === undefined || field === null) {
    return "";
  }

  const stringField = String(field);

  // Fields containing commas, quotes, or newlines need to be quoted
  if (
    stringField.includes(",") ||
    stringField.includes('"') ||
    stringField.includes("\n") ||
    stringField.includes("\r")
  ) {
    // Escape quotes by doubling them
    const escaped = stringField.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return stringField;
}

/**
 * Trigger download of CSV file
 * @param {Array} grants - Array of grant objects
 * @param {string} filename - Optional filename (default: grants-export-YYYY-MM-DD.csv)
 */
export function exportToCSV(grants, filename = null) {
  if (!grants || grants.length === 0) {
    console.warn("No grants data to export");
    alert("No data available to export.");
    return;
  }

  try {
    // Generate CSV string
    const csvString = grantsToCSVString(grants);

    // Create filename with timestamp if not provided
    if (!filename) {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
      filename = `grants-export-${dateStr}.csv`;
    }

    // Create blob and download link
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create temporary download link
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);

    console.log(`Exported ${grants.length} grants to ${filename}`);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    alert("Error exporting data. Please check the console for details.");
  }
}

/**
 * Create a download button element
 * @returns {HTMLElement} Button element for CSV export
 */
export function createExportButton() {
  const button = document.createElement("button");
  button.id = "export-csv-btn";
  button.className = "btn btn-primary btn-sm";
  button.innerHTML = '<i class="bi bi-download me-1"></i> Download CSV';
  button.title = "Export all grant data to CSV file";

  return button;
}
