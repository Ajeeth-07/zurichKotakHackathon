(function () {
  "use strict";

  // ─── State ──────────────────────────────────────────────────────
  let currentFilters = {};
  let currentPreview = null;
  let currentContent = null;
  let currentPage = 1;
  const PAGE_LIMIT = 25;

  // ─── DOM refs ──────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ─── Init ──────────────────────────────────────────────────────
  async function init() {
    const user = Auth.getUser();

    // Adjust UI based on role
    if (user && user.role === "manager") {
      const approvalSec = $("#manager-approval-section");
      if (approvalSec) approvalSec.classList.remove("hidden");
      const historyH3 = $("#history-section h3");
      if (historyH3) historyH3.textContent = "📊 All Campaigns";
      const aiSec = $("#ai-section");
      if (aiSec) aiSec.style.display = "none";
      const sendSec = $("#send-section");
      if (sendSec) sendSec.style.display = "none";
      loadManagerApprovals();
    } else if (user && user.role === "agent") {
      const historyH3 = $("#history-section h3");
      if (historyH3) historyH3.textContent = "📊 My Approval Requests";
      await loadManagers();
    }

    await loadFilterOptions();
    await loadCampaignHistory();
    loadTotalCustomerCount();
    bindEvents();
  }

  // ─── Load filter dropdown options ──────────────────────────────
  async function loadFilterOptions() {
    try {
      const res = await fetch("/api/nudge/filters");
      const data = await res.json();

      populateSelect("#filter-location", data.locations);
      populateSelect("#filter-policy", data.policyCategories);
      populateSelect("#filter-risk", data.riskLevels);
      populateSelect("#filter-occupation", data.occupations);
    } catch (err) {
      console.error("Failed to load filter options:", err);
    }
  }

  function populateSelect(selector, items) {
    const el = $(selector);
    if (!el) return;
    items.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      el.appendChild(opt);
    });
  }

  async function loadTotalCustomerCount() {
    try {
      const res = await fetch("/api/nudge/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 1 }),
      });
      const data = await res.json();
      $("#kpi-total").textContent = data.total.toLocaleString("en-IN");
    } catch {
      $("#kpi-total").textContent = "—";
    }
  }

  // ─── Bind Events ──────────────────────────────────────────────
  function bindEvents() {
    $("#filter-toggle").addEventListener("click", toggleFilter);
    $("#btn-apply-filter").addEventListener("click", applyFilters);
    $("#btn-clear-filter").addEventListener("click", clearFilters);
    $("#btn-generate-ai").addEventListener("click", generateAIContent);
    $("#btn-regenerate")?.addEventListener("click", generateAIContent);
    
    const reqBtn = $("#btn-request-approval");
    if(reqBtn) reqBtn.addEventListener("click", submitApprovalRequest);
    
    $("#btn-refresh-history").addEventListener("click", loadCampaignHistory);
    
    const refAppBtn = $("#btn-refresh-approvals");
    if(refAppBtn) refAppBtn.addEventListener("click", loadManagerApprovals);
    
    $("#btn-prev-page").addEventListener("click", () => changePage(-1));
    $("#btn-next-page").addEventListener("click", () => changePage(1));

    // Use a selected template as custom SMS
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("nudge-use-template-btn")) {
        const text = e.target.dataset.sms;
        if (text) {
          $("#custom-sms").value = text;
          $("#custom-sms").scrollIntoView({ behavior: "smooth", block: "center" });
          updateSendPanel();
        }
      }
    });
  }

  // ─── Filter Toggle ────────────────────────────────────────────
  function toggleFilter() {
    const body = $("#filter-body");
    const chevron = $("#filter-chevron");
    body.classList.toggle("collapsed");
    chevron.textContent = body.classList.contains("collapsed") ? "▶" : "▼";
  }

  // ─── Get Filters from DOM ─────────────────────────────────────
  function readFilters() {
    const f = {};
    const ageMin = $("#filter-age-min").value;
    const ageMax = $("#filter-age-max").value;
    const incomeMin = $("#filter-income-min").value;
    const incomeMax = $("#filter-income-max").value;
    const location = $("#filter-location").value;
    const policy = $("#filter-policy").value;
    const risk = $("#filter-risk").value;
    const occupation = $("#filter-occupation").value;
    const gender = $("#filter-gender").value;
    const marital = $("#filter-marital").value;
    const renewalAfter = $("#filter-renewal-after").value;
    const renewalBefore = $("#filter-renewal-before").value;

    if (ageMin) f.ageMin = Number(ageMin);
    if (ageMax) f.ageMax = Number(ageMax);
    if (incomeMin) f.incomeMin = Number(incomeMin);
    if (incomeMax) f.incomeMax = Number(incomeMax);
    if (location) f.location = location;
    if (policy) f.policyCategory = policy;
    if (risk) f.riskLevel = risk;
    if (occupation) f.occupation = occupation;
    if (gender) f.gender = gender;
    if (marital) f.maritalStatus = marital;
    if (renewalAfter) f.renewalAfter = renewalAfter;
    if (renewalBefore) f.renewalBefore = renewalBefore;

    return f;
  }

  function readPlatforms() {
    const platforms = [];
    $$("input[id^='plat-']:checked").forEach((cb) => platforms.push(cb.value));
    return platforms;
  }

  // ─── Apply Filters ────────────────────────────────────────────
  async function applyFilters() {
    console.log("[applyFilters] called");
    currentFilters = readFilters();
    console.log("[applyFilters] filters:", currentFilters);
    currentPage = 1;
    currentContent = null;
    hideAIResults();
    hideSendResult();
    await loadPreview();
  }

  function clearFilters() {
    $$("#filter-body input").forEach((el) => (el.value = ""));
    $$("#filter-body select").forEach((el) => (el.selectedIndex = 0));
    currentFilters = {};
    currentPage = 1;
    currentContent = null;
    currentPreview = null;
    hideAIResults();
    hideSendResult();
    renderEmptySegment();
    updateKPIs(null);
  }

  // ─── Load Segment Preview ─────────────────────────────────────
  async function loadPreview() {
    const btn = $("#btn-apply-filter");
    btn.disabled = true;
    btn.textContent = "Loading...";

    try {
      const res = await fetch("/api/nudge/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentFilters,
          page: currentPage,
          limit: PAGE_LIMIT,
        }),
      });
      const data = await res.json();
      currentPreview = data;
      renderSegmentTable(data);
      updateKPIs(data);
      updatePagination(data);
      updateSendPanel();
    } catch (err) {
      console.error("Preview failed:", err);
    } finally {
      btn.disabled = false;
      btn.textContent = "Apply Filters";
    }
  }

  // ─── Render Segment Table ─────────────────────────────────────
  function renderSegmentTable(data) {
    const tbody = $("#segment-tbody");
    const count = $("#segment-count");

    count.textContent = `${data.total.toLocaleString("en-IN")} customers`;

    if (!data.data.length) {
      tbody.innerHTML =
        '<tr><td colspan="10" class="nudge-empty-state">No customers match the selected filters</td></tr>';
      renderLocationChips([]);
      return;
    }

    tbody.innerHTML = data.data
      .map(
        (c) => `
        <tr class="customer-row">
          <td><strong>${c.name}</strong></td>
          <td>${c.age}</td>
          <td>${c.location.split(",")[0]}</td>
          <td>${c.annualIncomeFormatted}</td>
          <td>${c.policyCategories.join(", ")}</td>
          <td><span class="badge ${c.riskLevel.toLowerCase()}">${c.riskLevel}</span></td>
          <td><span class="badge confidence">${c.crossSellScore}</span></td>
          <td><span class="badge confidence">${c.upSellScore}</span></td>
          <td class="nudge-suggested-cell">${c.suggestedProducts.slice(0, 2).join(", ")}</td>
          <td class="nudge-suggested-cell">${c.nearestRenewal ? new Date(c.nearestRenewal).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' }) : '—'}</td>
        </tr>`,
      )
      .join("");

    renderLocationChips(data.segmentSummary.locationBreakdown || []);
  }

  function renderLocationChips(breakdown) {
    const container = $("#location-chips");
    if (!breakdown.length) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = breakdown
      .map(
        (loc) =>
          `<span class="nudge-location-chip">${loc.city} <strong>${loc.count}</strong></span>`,
      )
      .join("");
  }

  function renderEmptySegment() {
    $("#segment-tbody").innerHTML =
      '<tr><td colspan="10" class="nudge-empty-state">Apply filters above to preview your target segment</td></tr>';
    $("#segment-count").textContent = "";
    $("#location-chips").innerHTML = "";
    $("#kpi-filtered").textContent = "—";
    $("#kpi-cross-sell").textContent = "—";
    $("#btn-prev-page").disabled = true;
    $("#btn-next-page").disabled = true;
    $("#segment-page-info").textContent = "";
  }

  function updateKPIs(data) {
    if (!data) {
      $("#kpi-filtered").textContent = "—";
      $("#kpi-cross-sell").textContent = "—";
      return;
    }
    $("#kpi-filtered").textContent = data.total.toLocaleString("en-IN");
    $("#kpi-cross-sell").textContent = data.segmentSummary.avgCrossSellScore;
  }

  function updatePagination(data) {
    $("#segment-page-info").textContent = `Page ${data.page} of ${data.pages}`;
    $("#btn-prev-page").disabled = data.page <= 1;
    $("#btn-next-page").disabled = data.page >= data.pages;
  }

  function changePage(delta) {
    currentPage += delta;
    loadPreview();
  }

  // ─── AI Content Generation ────────────────────────────────────
  async function generateAIContent() {
    if (!currentPreview || currentPreview.total === 0) {
      alert("Please apply filters first to select a customer segment.");
      return;
    }

    const placeholder = $("#ai-placeholder");
    const loading = $("#ai-loading");
    const results = $("#ai-results");

    placeholder.classList.add("hidden");
    try {
      const customPrompt = $("#custom-ai-prompt")?.value.trim() || "";
      
      const res = await fetch("/api/nudge/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentFilters, platforms: readPlatforms(), customPrompt }),
      });

      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.error);
        loading.classList.add("hidden");
        placeholder.classList.remove("hidden");
        return;
      }

      currentContent = data;
      renderAIResults(data);
      loading.classList.add("hidden");
      results.classList.remove("hidden");
      updateSendPanel();
    } catch (err) {
      console.error("AI generation failed:", err);
      loading.classList.add("hidden");
      placeholder.classList.remove("hidden");
      alert("Failed to generate AI content. Check console for details.");
    }
  }

  function renderAIResults(data) {
    // Creative Brief
    const briefEl = $("#creative-brief");
    if (data.creativeBrief) {
      const brief = data.creativeBrief;
      const paletteHTML = (brief.colorPalette || [])
        .map(
          (c) =>
            `<span class="nudge-color-swatch" style="background:${c}" title="${c}"></span>`,
        )
        .join("");

      briefEl.innerHTML = `
        <div class="nudge-brief-header">
          <h4>🎨 Creative Brief</h4>
          <span class="nudge-ai-badge">${data.aiPowered ? "✨ Gemini AI" : "📋 Template"}</span>
        </div>
        <div class="nudge-brief-content">
          <div class="nudge-brief-headline">
            <h2>${brief.headline || "Campaign Headline"}</h2>
            <p>${brief.subheadline || ""}</p>
          </div>
          <div class="nudge-brief-meta">
            <div><strong>Tone:</strong> ${brief.tone || "Professional"}</div>
            <div class="nudge-palette"><strong>Palette:</strong> ${paletteHTML}</div>
          </div>
          <div class="nudge-brief-prompt">
            <strong>🖼️ Image Prompt:</strong>
            <p>${brief.imagePrompt || ""}</p>
          </div>
        </div>
      `;
    }

    // SMS Templates
    const templatesEl = $("#sms-templates");
    if (data.smsTemplates && data.smsTemplates.length) {
      templatesEl.innerHTML = `
        <h4>💬 Generated SMS Templates</h4>
        <div class="nudge-template-cards">
          ${data.smsTemplates
            .map(
              (t, i) => `
            <div class="nudge-template-card">
              <div class="nudge-template-header">
                <span class="nudge-template-name">${t.templateName}</span>
                <span class="badge ${t.campaignType === "upsell" ? "medium" : "low"}">${t.campaignType}</span>
              </div>
              <div class="nudge-template-body">
                <p class="nudge-sms-text">"${escapeHtml(t.smsText)}"</p>
                <p class="nudge-template-audience"><strong>Best for:</strong> ${escapeHtml(t.targetAudience)}</p>
              </div>
              <button class="nudge-btn nudge-btn-ghost nudge-use-template-btn" data-sms="${escapeAttr(t.smsText)}">
                Use This Template
              </button>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    }
  }

  function hideAIResults() {
    const ph = $("#ai-placeholder");
    const ld = $("#ai-loading");
    const rs = $("#ai-results");
    const sms = $("#custom-sms");
    if (ph) ph.classList.remove("hidden");
    if (ld) ld.classList.add("hidden");
    if (rs) rs.classList.add("hidden");
    if (sms) sms.value = "";
  }

  function hideSendResult() {
    const sr = $("#send-result");
    const dl = $("#delivery-log-section");
    if (sr) sr.classList.add("hidden");
    if (dl) dl.classList.add("hidden");
  }

  // ─── Send Campaign ────────────────────────────────────────────
  function updateSendPanel() {
    const summary = $("#send-summary");
    const btn = $("#btn-request-approval") || $("#btn-send-campaign");
    const smsText = $("#custom-sms").value.trim();

    if (currentPreview && currentPreview.total > 0) {
      summary.innerHTML = `
        <div class="nudge-send-info">
          <div class="nudge-send-stat"><strong>${currentPreview.total.toLocaleString("en-IN")}</strong><span>Recipients</span></div>
          <div class="nudge-send-stat"><strong>${currentPreview.segmentSummary.avgCrossSellScore}</strong><span>Avg Score</span></div>
          <div class="nudge-send-stat"><strong>${currentPreview.segmentSummary.avgIncome}</strong><span>Avg Income</span></div>
        </div>
      `;
      if (btn) btn.disabled = false;
    } else {
      summary.innerHTML = "<p>Select a segment and generate content first.</p>";
      if (btn) btn.disabled = true;
    }
  }

  // ─── Approval & Campaign Submission ─────────────────────────
  async function loadManagers() {
    try {
      const res = await fetch("/api/auth/managers");
      const managers = await res.json();
      const select = $("#approver-select");
      if(!select) return;
      
      select.innerHTML = '<option value="">Select Approver...</option>' + 
        managers.map(m => `<option value="${m.id}">${m.name} (${m.designation})</option>`).join("");
    } catch(e) { console.error("Failed to load managers", e); }
  }

  async function submitApprovalRequest() {
    let smsText = $("#custom-sms").value.trim();

    if (!smsText && currentContent && currentContent.smsTemplates?.length) {
      smsText = currentContent.smsTemplates[0].smsText;
    }

    if (!smsText) {
      alert("Please generate or enter an SMS message first.");
      return;
    }

    const managerId = $("#approver-select").value;
    if (!managerId) {
      alert("Please select a manager to approve this campaign.");
      return;
    }

    const campaignName = $("#campaign-name").value.trim();
    const btn = $("#btn-request-approval");
    btn.disabled = true;
    btn.textContent = "⏳ Requesting...";

    try {
      const res = await fetch("/api/approvals/submit", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...Auth.authHeaders()
        },
        body: JSON.stringify({
          managerId,
          campaignName,
          filters: currentFilters,
          message: smsText,
          platforms: readPlatforms(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error: " + data.error);
        return;
      }

      alert("Approval Request Submitted Successfully!");
      loadCampaignHistory();
      
      // Reset
      $("#custom-sms").value = "";
      $("#campaign-name").value = "";
      $("#approver-select").value = "";
      
    } catch (err) {
      console.error(err);
      alert("Failed to submit approval request.");
    } finally {
      btn.disabled = false;
      btn.textContent = "📝 Request Approval";
    }
  }

  async function loadManagerApprovals() {
    try {
      const res = await fetch("/api/approvals/my-requests", { headers: Auth.authHeaders() });
      const data = await res.json();
      const tbody = $("#approvals-tbody");
      if(!tbody) return;

      const pending = data.requests.filter(r => r.status === "pending" || r.status === "changes_requested");

      if (pending.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="nudge-empty-state">No pending approval requests</td></tr>';
        return;
      }

      tbody.innerHTML = pending.map(r => `
        <tr>
          <td><span style="font-family:monospace;color:#5f748a">${r.id}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="agent-avatar" style="width:24px;height:24px;font-size:10px">${r.agentAvatar}</div>
              <strong>${r.agentName}</strong>
            </div>
          </td>
          <td>${escapeHtml(r.campaignName)}</td>
          <td><button class="nudge-btn nudge-btn-ghost" style="padding:4px 8px;font-size:12px" onclick="alert('Message:\\n${escapeHtml(r.message)}')">View Details</button></td>
          <td>${r.platforms.map(p => `<span class="badge confidence" style="margin:1px">${p}</span>`).join('')}</td>
          <td><span class="badge ${r.status==='pending'?'medium':'high'}">${r.status.replace('_', ' ')}</span></td>
          <td style="white-space:nowrap">
            <button class="nudge-btn nudge-btn-primary" style="padding:4px 10px;font-size:12px" onclick="window.handleApproval('${r.id}', 'approve')">Approve</button>
            <button class="nudge-btn nudge-btn-ghost" style="padding:4px 10px;font-size:12px;color:#d32f2f" onclick="window.handleApproval('${r.id}', 'deny')">Deny</button>
          </td>
        </tr>
      `).join("");
    } catch (err) {
      console.error(err);
    }
  }

  window.handleApproval = async function(id, action) {
    const note = prompt(`Enter optional note for this ${action}:`);
    if (note === null) return; // cancelled

    try {
      const res = await fetch(`/api/approvals/requests/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...Auth.authHeaders() },
        body: JSON.stringify({ note })
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Failed");
        return;
      }

      alert(`Campaign ${action}d successfully`);
      loadManagerApprovals();
      loadCampaignHistory();
    } catch(e) {
      alert("Error processing action");
    }
  }

  // ─── Campaign History ─────────────────────────────────────────
  async function loadCampaignHistory() {
    try {
      const res = await fetch("/api/approvals/my-requests", { headers: Auth.authHeaders() });
      const data = await res.json();
      const tbody = $("#history-tbody");

      if (!data.requests || data.requests.length === 0) {
        let msg = Auth.getUser()?.role === "manager" ? "No campaigns in history" : "You haven't requested any campaigns yet";
        tbody.innerHTML = `<tr><td colspan="7" class="nudge-empty-state">${msg}</td></tr>`;
        return;
      }

      tbody.innerHTML = data.requests
        .map((c) => {
          let badgeClass = "medium";
          if(c.status === "approved") badgeClass = "low";
          if(c.status === "denied") badgeClass = "high";
          if(c.status === "launched") badgeClass = "confidence";

          // Action column: Launch button for approved, info for others
          let actionCol = "";
          if (c.status === "approved") {
            actionCol = `<button class="nudge-btn nudge-btn-send" style="padding:5px 12px;font-size:13px;background:linear-gradient(120deg,#0f8c3a,#0eb84b)" onclick="window.launchApprovedCampaign('${c.id}')">🚀 Launch Campaign</button>`;
          } else if (c.status === "launched") {
            actionCol = `<span style="color:#15803d;font-weight:600">✅ Launched</span>`;
          } else if (c.status === "changes_requested") {
            actionCol = `<span style="color:#b45309;font-size:12px">⚠️ ${escapeHtml(c.managerNote || 'Changes requested')}</span>`;
          } else if (c.status === "denied") {
            actionCol = `<span style="color:#b91c1c;font-size:12px">❌ ${escapeHtml(c.managerNote || 'Denied')}</span>`;
          } else {
            actionCol = `<span style="color:#5f748a;font-size:12px">⏳ Awaiting review</span>`;
          }

          return `
          <tr>
            <td><strong>${escapeHtml(c.campaignName)}</strong></td>
            <td>${new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
            <td>${(c.platforms || ['SMS']).map(p => `<span class="badge confidence" style="margin:1px">${p}</span>`).join('')}</td>
            <td><button class="nudge-btn nudge-btn-ghost" style="padding:4px 8px;font-size:12px" onclick="alert('Message:\\n${escapeHtml(c.message)}\\n\\nManager Note:\\n${escapeHtml(c.managerNote||'None')}')">View Info</button></td>
            <td>${c.managerName || "—"}</td>
            <td><span class="badge ${badgeClass}">${c.status.replace('_', ' ').toUpperCase()}</span></td>
            <td>${actionCol}</td>
          </tr>
        `})
        .join("");
        
      // Update table headers to match new columns
      const thead = document.querySelector("#history-section thead tr");
      if(thead) {
        thead.innerHTML = `
          <th>Campaign</th>
          <th>Date</th>
          <th>Platforms</th>
          <th>Details</th>
          <th>Approver</th>
          <th>Status</th>
          <th>Action</th>
        `;
      }
      
      updateCampaignKPI(data.total);
    } catch (err) {
      console.error("History load failed:", err);
      $("#history-tbody").innerHTML =
        '<tr><td colspan="7" class="nudge-empty-state">Failed to load history</td></tr>';
    }
  }

  function updateCampaignKPI(total) {
    $("#kpi-campaigns").textContent = total || 0;
  }

  // ─── Launch Approved Campaign ─────────────────────────────────
  window.launchApprovedCampaign = async function(id) {
    if (!confirm("Launch this approved campaign now? Messages will be sent to all target customers.")) return;

    try {
      const res = await fetch(`/api/approvals/requests/${id}/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...Auth.authHeaders() },
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Launch failed: " + (data.error || "Unknown error"));
        return;
      }

      // Render full delivery results + log
      renderSendResult(data.campaign);

      // Refresh history so button changes to "Launched"
      loadCampaignHistory();

    } catch(e) {
      alert("Failed to launch campaign.");
      console.error(e);
    }
  }

  function renderSendResult(campaign) {
    const resultEl = $("#send-result");
    if (!resultEl) return;
    resultEl.classList.remove("hidden");

    resultEl.innerHTML = `
      <div class="nudge-result-card nudge-result-success">
        <div class="nudge-result-header">
          <h4>✅ Campaign Launched Successfully!</h4>
          <span class="nudge-campaign-id">${campaign.campaignId}</span>
        </div>
        <div class="nudge-result-stats">
          <div class="nudge-result-stat">
            <strong>${campaign.totalRecipients}</strong>
            <span>Total Sent</span>
          </div>
          <div class="nudge-result-stat nudge-stat-success">
            <strong>${campaign.delivered}</strong>
            <span>Delivered</span>
          </div>
          <div class="nudge-result-stat nudge-stat-fail">
            <strong>${campaign.failed}</strong>
            <span>Failed</span>
          </div>
          <div class="nudge-result-stat">
            <strong>${campaign.deliveryRate}%</strong>
            <span>Delivery Rate</span>
          </div>
        </div>
      </div>
    `;

    // Delivery log
    const logSection = $("#delivery-log-section");
    const logTbody = $("#delivery-log-tbody");
    if (logSection && logTbody && campaign.deliveryLog) {
      logSection.classList.remove("hidden");

      logTbody.innerHTML = campaign.deliveryLog
        .map(
          (d) => `
          <tr>
            <td>${d.customerName}</td>
            <td>${d.phone}</td>
            <td>${d.location.split(",")[0]}</td>
            <td><span class="badge confidence">${d.platform || 'SMS'}</span></td>
            <td><span class="badge ${d.status === "Delivered" ? "low" : "high"}">${d.status}</span></td>
            <td class="nudge-msg-cell">${escapeHtml(d.message.substring(0, 80))}${d.message.length > 80 ? "..." : ""}</td>
          </tr>
        `,
        )
        .join("");
    }

    // Scroll to result
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ─── Helpers ──────────────────────────────────────────────────
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // ─── Boot ─────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", init);
})();
