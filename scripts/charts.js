// Charts module for Research Funding Analysis Dashboard

import {
  formatCurrency,
  formatCurrencyFull,
  countKeywordsByGrant,
  sortObjectByValues,
  aggregateByYear,
} from "./utils.js";

let charts = {
  agency: null,
  subset: null,
  keywordDistribution: null,
  yearlyTrends: null,
};

export function updateAgencyChart(grants, type = "bar") {
  const ctx = document.getElementById("chart-agency").getContext("2d");

  // Calculate funding by agency
  const agencyData = {};
  const agencySubsetData = {};

  grants.forEach((grant) => {
    const body = grant.fundingBody || "Unknown";
    agencyData[body] = (agencyData[body] || 0) + grant.funding;
    if (grant.isInSubset) {
      agencySubsetData[body] = (agencySubsetData[body] || 0) + grant.funding;
    }
  });

  const labels = Object.keys(agencyData)
    .filter((k) => k && k !== "Unknown")
    .sort();
  const totalValues = labels.map((l) => agencyData[l] || 0);
  const subsetValues = labels.map((l) => agencySubsetData[l] || 0);

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
            yAxisID: "y", // Left axis for total funding
          },
          {
            label: "Subset Funding",
            data: subsetValues,
            backgroundColor: "#ed8936",
            borderRadius: 4,
            yAxisID: "y1", // Right axis for subset funding
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
            type: "linear",
            position: "left",
            beginAtZero: true,
            title: {
              display: true,
              text: "Total Funding",
            },
            ticks: {
              callback: function (value) {
                return formatCurrency(value);
              },
            },
          },
          y1: {
            type: "linear",
            position: "right",
            beginAtZero: true,
            title: {
              display: true,
              text: "Subset Funding",
            },
            grid: {
              drawOnChartArea: false, // Don't draw grid lines for right axis
            },
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

export function updateSubsetChart(grants, type = "doughnut") {
  const ctx = document.getElementById("chart-subset").getContext("2d");

  const subsetFunding = grants
    .filter((g) => g.isInSubset)
    .reduce((sum, g) => sum + g.funding, 0);
  const otherFunding = grants
    .filter((g) => !g.isInSubset)
    .reduce((sum, g) => sum + g.funding, 0);

  // Destroy existing chart if present
  if (charts.subset) {
    charts.subset.destroy();
  }

  if (type === "doughnut") {
    charts.subset = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Selected Subset", "Other Grants"],
        datasets: [
          {
            data: [subsetFunding, otherFunding],
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
    charts.subset = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Selected Subset", "Other Grants"],
        datasets: [
          {
            label: "Funding Amount",
            data: [subsetFunding, otherFunding],
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

export function updateKeywordDistributionChart(grants, keywords, type = "bar") {
  const ctx = document
    .getElementById("chart-keyword-distribution")
    .getContext("2d");

  // Count keywords
  const keywordCounts = countKeywordsByGrant(grants, keywords);

  // Sort by count (descending)
  const sortedCounts = sortObjectByValues(keywordCounts, true);

  const labels = Object.keys(sortedCounts);
  const values = Object.values(sortedCounts);

  // Destroy existing chart if present
  if (charts.keywordDistribution) {
    charts.keywordDistribution.destroy();
  }

  if (type === "bar" || type === "bar-log") {
    const isLogScale = type === "bar-log";

    // For log scale, add small offset to handle zero values
    const chartValues = isLogScale
      ? values.map((v) => (v === 0 ? 0.1 : v)) // Add small offset for log scale
      : values;

    charts.keywordDistribution = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Number of Grants",
            data: chartValues,
            backgroundColor: "#4299e1",
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
                // Show actual value (not offset value for log scale)
                const actualValue = values[context.dataIndex];
                return `${context.label}: ${actualValue} grant${actualValue !== 1 ? "s" : ""}`;
              },
            },
          },
        },
        scales: {
          y: {
            type: isLogScale ? "logarithmic" : "linear",
            beginAtZero: !isLogScale, // Log scale can't start at 0
            min: isLogScale ? 0.1 : undefined, // Minimum value for log scale
            ticks: {
              callback: function (value) {
                // Handle log scale tick formatting
                if (isLogScale) {
                  if (value === 0.1) return "0"; // Show 0 for the offset value
                  if (value < 1) return value.toFixed(1); // Show decimal for small values
                }
                return value.toLocaleString();
              },
            },
            title: {
              display: true,
              text: isLogScale
                ? "Number of Grants (Log Scale)"
                : "Number of Grants",
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    });
  } else {
    // Pie chart
    charts.keywordDistribution = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              "#4299e1",
              "#48bb78",
              "#ed8936",
              "#9f7aea",
              "#f56565",
              "#38b2ac",
              "#ed64a6",
              "#667eea",
              "#f6ad55",
              "#4fd1c5",
              "#fc8181",
              "#68d391",
              "#d69e2e",
              "#63b3ed",
              "#b794f4",
            ].slice(0, labels.length),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              font: {
                size: 10,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: ${context.raw} grant${context.raw !== 1 ? "s" : ""} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }
}

export function updateYearlyTrendsChart(grants, metricType = "number") {
  const ctx = document.getElementById("chart-yearly-trends").getContext("2d");

  // Aggregate data by year
  const yearData = aggregateByYear(grants);

  // Sort years (excluding "Unknown")
  const years = Object.keys(yearData)
    .filter((year) => year !== "Unknown")
    .sort();

  // Add "Unknown" at the end if present
  if (yearData["Unknown"]) {
    years.push("Unknown");
  }

  // Prepare data based on metric type
  let datasets = [];
  let yAxisConfig = {};

  if (metricType === "number") {
    // Number of grants - dual Y-axis for total vs subset
    const totalCounts = years.map((year) => yearData[year].total.count);
    const subsetCounts = years.map((year) => yearData[year].subset.count);

    datasets = [
      {
        label: "Total Grants",
        data: totalCounts,
        backgroundColor: "#4299e1",
        borderRadius: 4,
        yAxisID: "y",
      },
      {
        label: "Subset Grants",
        data: subsetCounts,
        backgroundColor: "#ed8936",
        borderRadius: 4,
        yAxisID: "y1",
      },
    ];

    yAxisConfig = {
      y: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Grants",
        },
        ticks: {
          callback: function (value) {
            return value.toLocaleString();
          },
        },
      },
      y1: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        title: {
          display: true,
          text: "Subset Grants",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value) {
            return value.toLocaleString();
          },
        },
      },
    };
  } else {
    // Funding amount - dual Y-axis for total vs subset
    const totalAmounts = years.map((year) => yearData[year].total.amount);
    const subsetAmounts = years.map((year) => yearData[year].subset.amount);

    datasets = [
      {
        label: "Total Funding",
        data: totalAmounts,
        backgroundColor: "#4299e1",
        borderRadius: 4,
        yAxisID: "y",
      },
      {
        label: "Subset Funding",
        data: subsetAmounts,
        backgroundColor: "#ed8936",
        borderRadius: 4,
        yAxisID: "y1",
      },
    ];

    yAxisConfig = {
      y: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Funding",
        },
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
      y1: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        title: {
          display: true,
          text: "Subset Funding",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
    };
  }

  // Destroy existing chart if present
  if (charts.yearlyTrends) {
    charts.yearlyTrends.destroy();
  }

  charts.yearlyTrends = new Chart(ctx, {
    type: "bar",
    data: {
      labels: years,
      datasets: datasets,
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
              if (metricType === "number") {
                return `${context.dataset.label}: ${context.raw.toLocaleString()} grant${context.raw !== 1 ? "s" : ""}`;
              } else {
                return `${context.dataset.label}: ${formatCurrencyFull(context.raw)}`;
              }
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Year",
          },
        },
        ...yAxisConfig,
      },
    },
  });

  // Add footnote for Unknown year if present
  if (yearData["Unknown"]) {
    const unknownCount = yearData["Unknown"].total.count;
    const unknownAmount = yearData["Unknown"].total.amount;
    const footnoteText =
      metricType === "number"
        ? `${unknownCount} grant${unknownCount !== 1 ? "s" : ""} with unknown year`
        : `${formatCurrency(unknownAmount)} in grants with unknown year`;

    // We'll handle this footnote display in the UI updater
    console.log("Yearly trends footnote:", footnoteText);
  }
}

export function destroyCharts() {
  if (charts.agency) {
    charts.agency.destroy();
    charts.agency = null;
  }
  if (charts.subset) {
    charts.subset.destroy();
    charts.subset = null;
  }
  if (charts.keywordDistribution) {
    charts.keywordDistribution.destroy();
    charts.keywordDistribution = null;
  }
  if (charts.yearlyTrends) {
    charts.yearlyTrends.destroy();
    charts.yearlyTrends = null;
  }
}
