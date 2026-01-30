// Table manager module for Research Funding Analysis Dashboard

import { formatCurrency, formatCurrencyFull } from "./utils.js";

let dataTable = null;

export function initializeDataTable(grants) {
  dataTable = $("#grants-table").DataTable({
    data: grants,
    columns: [
      { data: "id" },
      {
        data: "isInSubset",
        render: function (data) {
          return data
            ? '<span class="badge badge-subset">Subset</span>'
            : '<span class="badge badge-not-subset">Other</span>';
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

  return dataTable;
}

export function updateDataTable(grants) {
  if (dataTable) {
    dataTable.clear();
    dataTable.rows.add(grants);
    dataTable.draw();
  }
}

export function destroyDataTable() {
  if (dataTable) {
    dataTable.destroy();
    dataTable = null;
  }
}

export function setupDetailModalHandler(getGrantById) {
  $("#grants-table").on("click", ".view-details", function () {
    const id = $(this).data("id");
    const grant = getGrantById(id);
    if (grant) {
      showGrantDetails(grant);
    }
  });
}

function showGrantDetails(grant) {
  document.getElementById("modal-title").textContent = "Grant: " + grant.id;
  document.getElementById("modal-id").textContent = grant.id;
  document.getElementById("modal-funding").textContent = formatCurrencyFull(
    grant.funding,
  );
  document.getElementById("modal-agency").textContent = grant.fundingBody;
  document.getElementById("modal-type").innerHTML = grant.isInSubset
    ? '<span class="badge badge-subset">In Subset</span>'
    : '<span class="badge badge-not-subset">Other</span>';
  document.getElementById("modal-org").textContent = grant.organisation;
  document.getElementById("modal-scheme").textContent = grant.scheme;
  document.getElementById("modal-investigators").textContent =
    grant.investigators;
  document.getElementById("modal-summary").textContent = grant.summary;

  const modal = new bootstrap.Modal(document.getElementById("detailModal"));
  modal.show();
}
