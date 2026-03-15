const state = {
  page: 1,
  pages: 1,
  q: "",
  risk: "",
  channel: "",
  customerSince: "",
  renewalDate: "",
};

function riskBadge(level) {
  const cls = String(level).toLowerCase();
  return `<span class="badge ${cls}">${level}</span>`;
}

function confidenceBadge(score) {
  const value = Number(score || 0).toFixed(1);
  return `<span class="badge confidence">${value}</span>`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function renewalBadge(dateStr) {
  if (!dateStr) return '<span class="badge">—</span>';
  const now = new Date();
  const ren = new Date(dateStr);
  const days = Math.ceil((ren - now) / (24 * 60 * 60 * 1000));
  const formatted = formatDate(dateStr);
  if (days < 0) return `<span class="badge high">${formatted}</span>`;
  if (days <= 30) return `<span class="badge high">${formatted}</span>`;
  if (days <= 60) return `<span class="badge medium">${formatted}</span>`;
  return `<span class="badge low">${formatted}</span>`;
}

function rowTemplate(customer) {
  return `
    <tr class="customer-row" data-customer-id="${customer.id}">
      <td><a class="customer-link" href="/customers/${customer.id}">${customer.name}</a></td>
      <td>${riskBadge(customer.riskProfile.level)}</td>
      <td>${customer.policies.length}</td>
      <td>${customer.claims.length}</td>
      <td>${formatDate(customer.customerSince)}</td>
      <td>${renewalBadge(customer.nearestRenewal)}</td>
      <td>${customer.location}</td>
    </tr>
  `;
}

async function loadCustomers() {
  const params = new URLSearchParams({
    q: state.q,
    risk: state.risk,
    channel: state.channel,
    customerSince: state.customerSince,
    renewalDate: state.renewalDate,
    page: String(state.page),
    limit: "12",
  });

  const response = await fetch(`/api/customers?${params.toString()}`);
  const payload = await response.json();

  state.pages = payload.pages;

  const body = document.getElementById("customersBody");
  body.innerHTML =
    payload.data.map(rowTemplate).join("") ||
    '<tr><td colspan="8">No customers found.</td></tr>';

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
    state.customerSince = document.getElementById("customerSinceFilter").value;
    state.renewalDate = document.getElementById("renewalDateFilter").value;
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

