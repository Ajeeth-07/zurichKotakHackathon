// ═══════════════════════════════════════════════════
// AGENT PERFORMANCE HUB — Frontend Logic
// ═══════════════════════════════════════════════════

const FMT = new Intl.NumberFormat("en-IN");
const FMT_CURRENCY = new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 });

let DATA = null;

async function loadAgentStats() {
  const res = await fetch("/api/agent-stats");
  DATA = await res.json();

  renderMetrics(DATA.summary);
  renderTopPerformers(DATA.topPerformers);
  renderTrendChart(DATA.trends);
  renderRegionChart(DATA.regionBreakdown);
  renderTierChart(DATA.tierDistribution);
  populateRegionFilter(DATA.regionBreakdown);
  renderLeaderboard(DATA.leaderboard);
}

// ── KPI Summary Cards ──────────────────────────────
function renderMetrics(s) {
  const cards = [
    { icon:"👥", label:"Total Agents", value:s.totalAgents, sub:"Active field agents" },
    { icon:"📢", label:"Total Campaigns", value:FMT.format(s.totalCampaigns), sub:"Across all agents" },
    { icon:"💬", label:"Total Messages", value:FMT.format(s.totalMessages), sub:"Outreach sent via campaigns" },
    { icon:"🎯", label:"Total Conversions", value:FMT.format(s.totalConversions), sub:`Motor: ${FMT.format(s.totalConversionsMotor)} | Health: ${FMT.format(s.totalConversionsHealth)}` },
    { icon:"💰", label:"Total Revenue", value:FMT_CURRENCY.format(s.totalRevenue), sub:"Gross premium collected" },
    { icon:"📋", label:"Policies Sold", value:FMT.format(s.totalPolicies), sub:"New policies issued" },
    { icon:"⭐", label:"Avg NPS", value:s.avgNps, sub:"Net Promoter Score" },
    { icon:"🔄", label:"Avg Renewal Rate", value:s.avgRenewal + "%", sub:"Customer retention" },
  ];

  document.getElementById("metricsGrid").innerHTML = cards.map(c => `
    <div class="ap-metric">
      <div class="ap-metric-icon">${c.icon}</div>
      <h4>${c.label}</h4>
      <strong>${c.value}</strong>
      <div class="ap-metric-sub">${c.sub}</div>
    </div>
  `).join("");
}

// ── Top Performers Podium ──────────────────────────
function renderTopPerformers(top) {
  const medals = ["🥇","🥈","🥉","⭐","⭐"];
  document.getElementById("topPerformers").innerHTML = top.map((a,i) => `
    <div class="ap-top-card">
      <span class="ap-top-medal">${medals[i]}</span>
      <div class="ap-top-name">${a.name}</div>
      <div class="ap-top-region">${a.region} • ${a.level}</div>
      <div class="ap-top-stats">
        <div><strong>${FMT_CURRENCY.format(a.revenue)}</strong>Revenue</div>
        <div><strong>${a.conversions}</strong>Conversions</div>
        <div><strong>${a.nps}</strong>NPS</div>
      </div>
    </div>
  `).join("");
}

// ── Revenue & Conversions Trend (combo chart) ──────
function renderTrendChart(trends) {
  const ctx = document.getElementById("trendChart");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: trends.map(t => t.month),
      datasets: [
        {
          label: "Revenue (₹ Lakhs)",
          data: trends.map(t => Math.round(t.revenue / 100000)),
          backgroundColor: "rgba(0, 109, 179, 0.7)",
          borderRadius: 8,
          order: 2,
          yAxisID: "y",
        },
        {
          label: "Conversions",
          data: trends.map(t => t.conversions),
          type: "line",
          borderColor: "#34d399",
          backgroundColor: "rgba(52, 211, 153, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: "#34d399",
          borderWidth: 3,
          order: 1,
          yAxisID: "y1",
        },
        {
          label: "Campaigns",
          data: trends.map(t => t.campaigns),
          type: "line",
          borderColor: "#a855f7",
          borderDash: [6,4],
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#a855f7",
          borderWidth: 2,
          order: 1,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "top", labels: { usePointStyle: true, padding: 16, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              if (ctx.dataset.label.includes("Revenue")) return `Revenue: ₹${ctx.parsed.y}L`;
              return `${ctx.dataset.label}: ${ctx.parsed.y}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          position: "left",
          title: { display: true, text: "Revenue (₹ Lakhs)", font: { size: 11 } },
          grid: { color: "rgba(0,0,0,0.04)" },
          ticks: { font: { size: 11 } },
        },
        y1: {
          beginAtZero: true,
          position: "right",
          title: { display: true, text: "Count", font: { size: 11 } },
          grid: { drawOnChartArea: false },
          ticks: { font: { size: 11 } },
        },
        x: { ticks: { font: { size: 12 } } },
      },
    },
  });
}

// ── Revenue by Region ──────────────────────────────
function renderRegionChart(regions) {
  const colors = [
    "#006db3", "#00b4d8", "#34d399", "#f59e0b", "#a855f7",
    "#ef4444", "#6366f1", "#ec4899", "#14b8a6", "#78716c"
  ];
  const ctx = document.getElementById("regionChart");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: regions.map(r => r.name),
      datasets: [{
        data: regions.map(r => r.revenue),
        backgroundColor: colors.slice(0, regions.length),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      cutout: "55%",
      plugins: {
        legend: { position: "right", labels: { usePointStyle: true, padding: 10, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return `${ctx.label}: ${FMT_CURRENCY.format(ctx.parsed)}`;
            }
          }
        },
      },
    },
  });
}

// ── Tier Distribution ──────────────────────────────
function renderTierChart(tiers) {
  const colors = ["#6366f1", "#f59e0b", "#94a3b8", "#d97706"];
  const ctx = document.getElementById("tierChart");
  new Chart(ctx, {
    type: "polarArea",
    data: {
      labels: tiers.map(t => t.name),
      datasets: [{
        data: tiers.map(t => t.count),
        backgroundColor: colors.map(c => c + "aa"),
        borderColor: colors,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "right", labels: { usePointStyle: true, padding: 10, font: { size: 11 } } },
      },
      scales: {
        r: { ticks: { display: false }, grid: { color: "rgba(0,0,0,0.05)" } },
      },
    },
  });
}

// ── Region Filter Dropdown ─────────────────────────
function populateRegionFilter(regions) {
  const sel = document.getElementById("regionFilter");
  regions.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.name;
    opt.textContent = r.name;
    sel.appendChild(opt);
  });
}

// ── Leaderboard Table ──────────────────────────────
function renderLeaderboard(agents) {
  const maxRevenue = Math.max(...agents.map(a => a.revenue));
  const body = document.getElementById("leaderboardBody");

  body.innerHTML = agents.map((a, i) => {
    const pct = ((a.revenue / maxRevenue) * 100).toFixed(1);
    const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
    const tierClass = a.level.toLowerCase();
    const npsClass = a.nps >= 85 ? "high" : a.nps >= 75 ? "mid" : "low";
    const npsIcon = a.nps >= 85 ? "🟢" : a.nps >= 75 ? "🟡" : "🔴";

    return `
      <tr>
        <td class="ap-rank ${rankClass}">${i+1}</td>
        <td>
          <div class="ap-agent-cell">
            <div class="ap-agent-avatar ${tierClass}">${a.avatar}</div>
            <div>
              <div class="ap-agent-name">${a.name}</div>
              <div class="ap-agent-region">${a.region}</div>
            </div>
          </div>
        </td>
        <td><span class="ap-tier-badge ${tierClass}">${a.level}</span></td>
        <td>${FMT.format(a.campaigns)}</td>
        <td>${FMT.format(a.messages)}</td>
        <td><strong>${FMT.format(a.conversions)}</strong></td>
        <td>${a.conversionsMotor}</td>
        <td>${a.conversionsHealth}</td>
        <td>
          <div class="ap-revenue-bar-wrap">
            <div class="ap-revenue-bar"><div class="ap-revenue-fill" style="width:${pct}%"></div></div>
            <span class="ap-revenue-val">${FMT_CURRENCY.format(a.revenue)}</span>
          </div>
        </td>
        <td>${a.policiesSold}</td>
        <td>${a.renewalRate}%</td>
        <td><span class="ap-nps ${npsClass}">${npsIcon} ${a.nps}</span></td>
      </tr>
    `;
  }).join("");
}

// ── Filter Events ──────────────────────────────────
function applyFilters() {
  if (!DATA) return;
  const region = document.getElementById("regionFilter").value;
  const tier = document.getElementById("tierFilter").value;

  let filtered = [...DATA.leaderboard];
  if (region) filtered = filtered.filter(a => a.region === region);
  if (tier) filtered = filtered.filter(a => a.tier === parseInt(tier));

  // Re-sort by revenue
  filtered.sort((a,b) => b.revenue - a.revenue);
  renderLeaderboard(filtered);
}

document.getElementById("regionFilter").addEventListener("change", applyFilters);
document.getElementById("tierFilter").addEventListener("change", applyFilters);

// ── Initialize ─────────────────────────────────────
loadAgentStats().catch(err => {
  console.error("Failed to load agent stats:", err);
});
