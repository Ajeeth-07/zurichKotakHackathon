const state = {
  page: 1,
  pages: 1,
  q: "",
  risk: "",
  channel: "",
};

function riskBadge(level) {
  const cls = String(level).toLowerCase();
  return `<span class="badge ${cls}">${level}</span>`;
}

function confidenceBadge(score) {
  const value = Number(score || 0).toFixed(1);
  return `<span class="badge confidence">${value}</span>`;
}

function rowTemplate(customer) {
  return `
    <tr class="customer-row" data-customer-id="${customer.id}">
      <td><a class="customer-link" href="/customers/${customer.id}">${customer.name}</a></td>
      <td>${riskBadge(customer.riskProfile.level)}</td>
      <td>${customer.policies.length}</td>
      <td>${customer.claims.length}</td>
      <td>${confidenceBadge(customer.confidenceScore)}</td>
      <td>${customer.location}</td>
    </tr>
  `;
}

async function loadCustomers() {
  const params = new URLSearchParams({
    q: state.q,
    risk: state.risk,
    channel: state.channel,
    page: String(state.page),
    limit: "12",
  });

  const response = await fetch(`/api/customers?${params.toString()}`);
  const payload = await response.json();

  state.pages = payload.pages;

  const body = document.getElementById("customersBody");
  body.innerHTML =
    payload.data.map(rowTemplate).join("") ||
    '<tr><td colspan="6">No customers found.</td></tr>';

  document.getElementById("tableMeta").textContent =
    `Page ${payload.page} of ${payload.pages} • ${payload.total} matching customers`;

  document.getElementById("prevBtn").disabled = payload.page <= 1;
  document.getElementById("nextBtn").disabled = payload.page >= payload.pages;
}

function bindEvents() {
  document.getElementById("applyFilterBtn").addEventListener("click", () => {
    state.page = 1;
    state.q = document.getElementById("searchInput").value.trim();
    state.risk = document.getElementById("riskFilter").value;
    state.channel = document.getElementById("channelFilter").value;
    loadCustomers();
  });

  document.getElementById("prevBtn").addEventListener("click", () => {
    if (state.page > 1) {
      state.page -= 1;
      loadCustomers();
    }
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    if (state.page < state.pages) {
      state.page += 1;
      loadCustomers();
    }
  });

  document
    .getElementById("customersBody")
    .addEventListener("click", (event) => {
      const row = event.target.closest("tr[data-customer-id]");

      if (!row) {
        return;
      }

      if (event.target.closest("a")) {
        return;
      }

      const customerId = row.getAttribute("data-customer-id");
      if (customerId) {
        window.location.href = `/customers/${customerId}`;
      }
    });
}

bindEvents();
loadCustomers().catch((error) => {
  console.error("Unable to load customers:", error);
});
