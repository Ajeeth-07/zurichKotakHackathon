function formatDate(value) {
  if (!value) {
    return "N/A";
  }
  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function createKeyRow(label, value) {
  return `<div class="kv-item"><span>${label}</span><strong>${value ?? "N/A"}</strong></div>`;
}

function listMarkup(items, itemTemplate, emptyText) {
  if (!items || items.length === 0) {
    return `<p class="empty-text">${emptyText}</p>`;
  }
  return items.map(itemTemplate).join("");
}

function renderCustomer(customer) {
  document.getElementById("customerName").textContent = customer.name;
  document.getElementById("customerSub").textContent =
    `${customer.location} • Customer Since ${formatDate(customer.customerSince)}`;

  const profileGrid = document.getElementById("profileGrid");
  profileGrid.innerHTML = [
    createKeyRow("Age", customer.age),
    createKeyRow("Gender", customer.gender),
    createKeyRow("Email", customer.email),
    createKeyRow("Phone", customer.phone),
    createKeyRow("Occupation", customer.occupation),
    createKeyRow("Annual Income", formatCurrency(customer.annualIncome)),
    createKeyRow("Marital Status", customer.maritalStatus),
    createKeyRow("Preferred Channel", customer.preferredChannel),
    createKeyRow("Digital Engagement", customer.digitalEngagement),
    createKeyRow("Risk Level", customer.riskProfile.level),
    createKeyRow("BMI", customer.riskProfile.healthStatus.bmi),
    createKeyRow(
      "Smoking Status",
      customer.riskProfile.healthStatus.smokingStatus,
    ),
    createKeyRow(
      "Pre-existing Conditions",
      customer.riskProfile.healthStatus.preExistingConditions.length
        ? customer.riskProfile.healthStatus.preExistingConditions.join(", ")
        : "None",
    ),
  ].join("");

  document.getElementById("policiesContainer").innerHTML = listMarkup(
    customer.policies,
    (policy) => `
      <article class="mini-card">
        <h4>${policy.productName}</h4>
        <p>${policy.policyId} • ${policy.category} • ${policy.status}</p>
        <div class="mini-grid">
          <span>Premium: ${formatCurrency(policy.premium)}</span>
          <span>Sum Insured: ${formatCurrency(policy.sumInsured)}</span>
          <span>Start: ${formatDate(policy.startDate)}</span>
          <span>Renewal: ${formatDate(policy.renewalDate)}</span>
        </div>
      </article>
    `,
    "No policies found",
  );

  document.getElementById("claimsContainer").innerHTML = listMarkup(
    customer.claims,
    (claim) => `
      <article class="mini-card">
        <h4>${claim.claimId}</h4>
        <p>${claim.type} • ${claim.status}</p>
        <div class="mini-grid">
          <span>Incident: ${formatDate(claim.dateOfIncident)}</span>
          <span>Claim Amount: ${formatCurrency(claim.claimAmount)}</span>
          <span>Approved: ${formatCurrency(claim.approvedAmount)}</span>
          <span>Cashless: ${claim.cashless ? "Yes" : "No"}</span>
        </div>
      </article>
    `,
    "No claims recorded",
  );
}

function renderIntelligence(profile) {
  const summary = document.getElementById("intelligenceSummary");
  summary.innerHTML = `
    <div class="score-pill">Intent: ${profile.intent}</div>
    <div class="score-pill">Cross-Sell Score: ${profile.opportunityScores.crossSellScore}</div>
    <div class="score-pill">Up-Sell Score: ${profile.opportunityScores.upSellScore}</div>
    <div class="score-pill">Potential: ${profile.potentialRevenue.formatted}</div>
  `;

  const crossList = document.getElementById("crossSellList");
  const upList = document.getElementById("upSellList");
  const reasonsList = document.getElementById("reasonsList");

  const recommendations = profile.recommendations || {
    crossSellProducts: profile.suggestedProducts || [],
    upSellProducts: [],
    ruleReasons: [],
  };

  crossList.innerHTML = (recommendations.crossSellProducts || [])
    .map((item) => `<li>${item}</li>`)
    .join("");

  upList.innerHTML = (recommendations.upSellProducts || [])
    .map((item) => `<li>${item}</li>`)
    .join("");

  reasonsList.innerHTML = (recommendations.ruleReasons || [])
    .map((reason) => `<li>${reason}</li>`)
    .join("");

  if (!crossList.innerHTML) {
    crossList.innerHTML = "<li>No cross-sell suggestions</li>";
  }
  if (!upList.innerHTML) {
    upList.innerHTML = "<li>No up-sell suggestions</li>";
  }
  if (!reasonsList.innerHTML) {
    reasonsList.innerHTML = "<li>No explicit rule reason generated</li>";
  }
}

async function loadCustomerDetail() {
  const id = window.location.pathname.split("/").pop();

  const [customerRes, intelligenceRes] = await Promise.all([
    fetch(`/api/customers/${id}`),
    fetch(`/api/intelligence/profiles/${id}`),
  ]);

  if (!customerRes.ok) {
    throw new Error("Customer not found");
  }

  const customer = await customerRes.json();
  const profile = intelligenceRes.ok ? await intelligenceRes.json() : null;

  renderCustomer(customer);
  if (profile) {
    renderIntelligence(profile);
  }

  // Bind AI recommendation button
  document.getElementById("btn-get-ai-rec").addEventListener("click", () => {
    loadAIRecommendation(id);
  });
}

async function loadAIRecommendation(customerId) {
  const placeholder = document.getElementById("aiRecPlaceholder");
  const loading = document.getElementById("aiRecLoading");
  const results = document.getElementById("aiRecResults");

  placeholder.classList.add("hidden");
  loading.classList.remove("hidden");
  results.classList.add("hidden");

  try {
    const res = await fetch(`/api/intelligence/profiles/${customerId}/ai-recommendation`);
    const data = await res.json();

    if (data.error) {
      loading.classList.add("hidden");
      placeholder.classList.remove("hidden");
      alert("Error: " + data.error);
      return;
    }

    renderAIRecommendation(data);
    loading.classList.add("hidden");
    results.classList.remove("hidden");
  } catch (err) {
    console.error("AI recommendation failed:", err);
    loading.classList.add("hidden");
    placeholder.classList.remove("hidden");
    alert("Failed to load AI recommendation.");
  }
}

function renderAIRecommendation(data) {
  // Behavioral Insights
  const insightsList = document.getElementById("aiInsightsList");
  const insights = data.behavioralInsights || [];
  insightsList.innerHTML = insights.map(i => `<li>${i}</li>`).join("") || "<li>No insights available</li>";

  // Risk Analysis
  const riskEl = document.getElementById("aiRiskAnalysis");
  const risk = data.riskAnalysis || {};
  let riskHtml = "";
  if (risk.summary) {
    riskHtml += `<p style="margin:0 0 10px;color:#344f67"><strong>Summary:</strong> ${risk.summary}</p>`;
  }
  if (risk.level) {
    riskHtml += `<p style="margin:0 0 8px"><span class="badge ${risk.level.toLowerCase()}">${risk.level} Risk</span></p>`;
  }
  if (risk.factors && risk.factors.length) {
    riskHtml += `<p style="margin:8px 0 4px;font-weight:600;font-size:13px">Risk Factors:</p>`;
    riskHtml += `<ul class="reason-list">${risk.factors.map(f => `<li>${f}</li>`).join("")}</ul>`;
  }
  if (risk.mitigations && risk.mitigations.length) {
    riskHtml += `<p style="margin:8px 0 4px;font-weight:600;font-size:13px">Mitigations:</p>`;
    riskHtml += `<ul class="reason-list">${risk.mitigations.map(m => `<li>${m}</li>`).join("")}</ul>`;
  }
  riskEl.innerHTML = riskHtml || "<p>No risk analysis available</p>";

  // Personalized Pitch
  const pitchEl = document.getElementById("aiPitch");
  pitchEl.textContent = data.personalizedPitch || "No pitch generated.";

  // Product Recommendations
  const productsEl = document.getElementById("aiProductsList");
  const products = data.recommendedProducts || [];
  if (Array.isArray(products) && products.length > 0 && typeof products[0] === "object") {
    productsEl.innerHTML = products.map(p => {
      const priorityCls = p.priority === "high" ? "priority-p1" : p.priority === "medium" ? "priority-p2" : "priority-p3";
      return `
        <article class="mini-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <h4 style="margin:0">${p.name}</h4>
            <span class="badge priority ${priorityCls}">${(p.priority || "medium").toUpperCase()}</span>
          </div>
          <p style="margin:0 0 4px;color:#5f748a;font-size:13px">${p.reason || ""}</p>
          <div style="display:flex;gap:8px;font-size:12px">
            <span class="badge ${p.type === "upsell" ? "medium" : "low"}">${p.type || "cross-sell"}</span>
            ${p.estimatedPremium ? `<span class="score-pill" style="font-size:12px;padding:4px 8px">${p.estimatedPremium}</span>` : ""}
          </div>
        </article>`;
    }).join("");
  } else if (Array.isArray(products)) {
    productsEl.innerHTML = products.map(p => `<article class="mini-card"><h4 style="margin:0">${p}</h4></article>`).join("");
  } else {
    productsEl.innerHTML = "<p class='empty-text'>No product recommendations</p>";
  }

  // Additional Insights
  const additionalEl = document.getElementById("aiAdditionalInsights");
  let addHtml = "";
  if (data.lifestageInsight) {
    addHtml += `<div class="kv-item" style="margin-bottom:8px"><span>🏠 Life Stage</span><strong>${data.lifestageInsight}</strong></div>`;
  }
  if (data.renewalStrategy) {
    addHtml += `<div class="kv-item" style="margin-bottom:8px"><span>🔄 Renewal Strategy</span><strong>${data.renewalStrategy}</strong></div>`;
  }
  if (data.engagementTip) {
    addHtml += `<div class="kv-item" style="margin-bottom:8px"><span>💡 Engagement Tip</span><strong>${data.engagementTip}</strong></div>`;
  }
  if (data.aiPowered !== undefined) {
    addHtml += `<div style="margin-top:8px;font-size:12px;color:#7f93a8">${data.aiPowered ? "✨ Powered by Gemini AI" : "📋 Template-based fallback"}</div>`;
  }
  additionalEl.innerHTML = addHtml || "<p class='empty-text'>No additional insights</p>";
}

loadCustomerDetail().catch((error) => {
  document.getElementById("customerName").textContent =
    "Unable to load customer";
  document.getElementById("customerSub").textContent = error.message;
});
