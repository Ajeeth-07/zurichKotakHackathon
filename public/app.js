const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(value || 0);

async function loadDashboard() {
  const response = await fetch("/api/summary");
  const summary = await response.json();

  document.getElementById("motor-count").textContent = formatNumber(
    summary.motorCustomers,
  );
  document.getElementById("health-count").textContent = formatNumber(
    summary.healthCustomers,
  );
  document.getElementById("cross-sell-count").textContent = formatNumber(
    summary.crossSellOpportunities,
  );
  document.getElementById("conversion-rate").textContent =
    `${summary.conversionRate}%`;

  new Chart(document.getElementById("productsChart"), {
    type: "bar",
    data: {
      labels: summary.topProducts.map((item) => item.name),
      datasets: [
        {
          label: "Customers",
          data: summary.topProducts.map((item) => item.value),
          backgroundColor: "#1f7ebf",
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  });

  new Chart(document.getElementById("riskChart"), {
    type: "doughnut",
    data: {
      labels: summary.riskDistribution.map((item) => item.name),
      datasets: [
        {
          data: summary.riskDistribution.map((item) => item.value),
          backgroundColor: ["#55b682", "#f2b84f", "#e36a6a"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

loadDashboard().catch((error) => {
  console.error("Unable to load dashboard data:", error);
});
