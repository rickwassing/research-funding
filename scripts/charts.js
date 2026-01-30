// Charts module for Research Funding Analysis Dashboard

import { formatCurrency, formatCurrencyFull } from "./utils.js";

let charts = {
  agency: null,
  subset: null,
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
          },
          {
            label: "Subset Funding",
            data: subsetValues,
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

export function destroyCharts() {
  if (charts.agency) {
    charts.agency.destroy();
    charts.agency = null;
  }
  if (charts.subset) {
    charts.subset.destroy();
    charts.subset = null;
  }
}
