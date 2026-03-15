const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  getAllCustomers,
} = require("../data/customerRepository");
const {
  buildUnifiedIntelligence,
} = require("./customerIntelligenceService");
const { formatCurrencyINR } = require("../utils/formatters");

// In-memory campaign store
const campaignHistory = [];

// ─── Filter Options ──────────────────────────────────────────────
function getFilterOptions() {
  const customers = getAllCustomers();
  const locations = new Set();
  const policyCategories = new Set();
  const occupations = new Set();

  customers.forEach((c) => {
    if (c.location) locations.add(c.location.split(",")[0].trim());
    if (c.occupation) occupations.add(c.occupation);
    c.policies.forEach((p) => policyCategories.add(p.category));
  });

  return {
    locations: [...locations].sort(),
    policyCategories: [...policyCategories].sort(),
    occupations: [...occupations].sort(),
    riskLevels: ["Low", "Medium", "High"],
    maritalStatuses: ["Single", "Married"],
    genders: ["Male", "Female"],
    platforms: ["WhatsApp", "Email", "App", "Web"],
    ageRange: { min: 18, max: 80 },
    incomeRange: {
      min: 0,
      max: Math.max(...customers.map((c) => c.annualIncome)),
    },
  };
}

// ─── Customer Filtering ─────────────────────────────────────────
function filterCustomers(filters = {}) {
  const customers = getAllCustomers();
  const incomes = customers.map((c) => c.annualIncome);
  const minIncome = Math.min(...incomes);
  const maxIncome = Math.max(...incomes);

  let filtered = customers;

  if (filters.ageMin != null) {
    filtered = filtered.filter((c) => c.age >= Number(filters.ageMin));
  }
  if (filters.ageMax != null) {
    filtered = filtered.filter((c) => c.age <= Number(filters.ageMax));
  }
  if (filters.incomeMin != null) {
    filtered = filtered.filter(
      (c) => c.annualIncome >= Number(filters.incomeMin),
    );
  }
  if (filters.incomeMax != null) {
    filtered = filtered.filter(
      (c) => c.annualIncome <= Number(filters.incomeMax),
    );
  }
  if (filters.location) {
    const loc = String(filters.location).toLowerCase();
    filtered = filtered.filter((c) =>
      c.location.toLowerCase().includes(loc),
    );
  }
  if (filters.policyCategory) {
    const cat = String(filters.policyCategory).toLowerCase();
    filtered = filtered.filter((c) =>
      c.policies.some((p) => p.category.toLowerCase() === cat),
    );
  }
  if (filters.riskLevel) {
    const risk = String(filters.riskLevel).toLowerCase();
    filtered = filtered.filter(
      (c) => c.riskProfile.level.toLowerCase() === risk,
    );
  }
  if (filters.maritalStatus) {
    filtered = filtered.filter(
      (c) =>
        c.maritalStatus.toLowerCase() ===
        String(filters.maritalStatus).toLowerCase(),
    );
  }
  if (filters.gender) {
    filtered = filtered.filter(
      (c) =>
        c.gender.toLowerCase() === String(filters.gender).toLowerCase(),
    );
  }
  if (filters.occupation) {
    filtered = filtered.filter(
      (c) =>
        c.occupation.toLowerCase() ===
        String(filters.occupation).toLowerCase(),
    );
  }

  // Renewal date filtering
  if (filters.renewalBefore) {
    const beforeDate = new Date(filters.renewalBefore);
    filtered = filtered.filter((c) =>
      c.policies.some((p) => p.renewalDate && new Date(p.renewalDate) <= beforeDate),
    );
  }
  if (filters.renewalAfter) {
    const afterDate = new Date(filters.renewalAfter);
    filtered = filtered.filter((c) =>
      c.policies.some((p) => p.renewalDate && new Date(p.renewalDate) >= afterDate),
    );
  }

  return filtered;
}

// ─── Build enriched segment with intelligence scores ────────────
function buildSegmentPreview(filters = {}, page = 1, limit = 25) {
  const filtered = filterCustomers(filters);
  const customers = getAllCustomers();
  const incomes = customers.map((c) => c.annualIncome);
  const minIncome = Math.min(...incomes);
  const maxIncome = Math.max(...incomes);

  const {
    buildCustomerFeatures,
    scoreOpportunity,
    buildRuleBasedRecommendations,
    getSuggestedProducts,
  } = requireIntelligenceHelpers();

  const enriched = filtered.map((customer) => {
    const features = buildCustomerFeaturesLocal(
      customer,
      minIncome,
      maxIncome,
    );
    const scores = scoreOpportunityLocal(features);
    const suggestions = getSuggestedProductsLocal(customer);

    return {
      id: customer.id,
      name: customer.name,
      age: customer.age,
      gender: customer.gender,
      phone: customer.phone,
      email: customer.email,
      location: customer.location,
      occupation: customer.occupation,
      annualIncome: customer.annualIncome,
      annualIncomeFormatted: formatCurrencyINR(customer.annualIncome),
      maritalStatus: customer.maritalStatus,
      riskLevel: customer.riskProfile.level,
      digitalEngagement: customer.digitalEngagement,
      policyCount: customer.policies.length,
      policyCategories: [
        ...new Set(customer.policies.map((p) => p.category)),
      ],
      currentProducts: [
        ...new Set(customer.policies.map((p) => p.productName)),
      ],
      claimCount: customer.claims.length,
      crossSellScore: scores.crossSellScore,
      upSellScore: scores.upSellScore,
      suggestedProducts: suggestions,
      nearestRenewal: getNearestRenewal(customer),
    };
  });

  enriched.sort((a, b) => b.crossSellScore - a.crossSellScore);

  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.max(1, Math.min(100, Number(limit) || 25));
  const start = (parsedPage - 1) * parsedLimit;

  const segmentSummary = {
    totalFiltered: enriched.length,
    avgAge: enriched.length
      ? Math.round(
          enriched.reduce((s, c) => s + c.age, 0) / enriched.length,
        )
      : 0,
    avgIncome: enriched.length
      ? formatCurrencyINR(
          enriched.reduce((s, c) => s + c.annualIncome, 0) /
            enriched.length,
        )
      : "₹0",
    avgCrossSellScore: enriched.length
      ? Number(
          (
            enriched.reduce((s, c) => s + c.crossSellScore, 0) /
            enriched.length
          ).toFixed(1),
        )
      : 0,
    avgUpSellScore: enriched.length
      ? Number(
          (
            enriched.reduce((s, c) => s + c.upSellScore, 0) /
            enriched.length
          ).toFixed(1),
        )
      : 0,
    locationBreakdown: buildLocationBreakdown(enriched),
  };

  return {
    segmentSummary,
    page: parsedPage,
    limit: parsedLimit,
    total: enriched.length,
    pages: Math.max(1, Math.ceil(enriched.length / parsedLimit)),
    data: enriched.slice(start, start + parsedLimit),
  };
}

function buildLocationBreakdown(customers) {
  const counts = {};
  customers.forEach((c) => {
    const city = c.location.split(",")[0].trim();
    counts[city] = (counts[city] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([city, count]) => ({ city, count }));
}

function getNearestRenewal(customer) {
  const now = new Date();
  let nearest = null;
  customer.policies.forEach((p) => {
    if (p.renewalDate) {
      const rd = new Date(p.renewalDate);
      if (!nearest || (rd >= now && rd < new Date(nearest))) {
        nearest = p.renewalDate;
      }
    }
  });
  return nearest;
}

// ─── Local scoring helpers (mirrors customerIntelligenceService) ─
const {
  RISK_WEIGHT,
  CHANNEL_WEIGHT,
  ENGAGEMENT_WEIGHT,
  CROSS_SELL_CATALOG,
  UPSELL_CATALOG,
} = require("../config/constants");

function buildCustomerFeaturesLocal(customer, minIncome, maxIncome) {
  const engagement = ENGAGEMENT_WEIGHT[customer.digitalEngagement] || 0.5;
  const channel = CHANNEL_WEIGHT[customer.preferredChannel] || 0.5;
  const risk = RISK_WEIGHT[customer.riskProfile.level] || 0.5;
  const normalizedIncome =
    maxIncome === minIncome
      ? 0
      : (customer.annualIncome - minIncome) / (maxIncome - minIncome);

  return {
    engagement,
    channel,
    risk,
    normalizedIncome,
    hasHealthPolicy: customer.policies.some((p) => p.category === "Health"),
    hasMotorPolicy: customer.policies.some((p) => p.category === "Motor"),
    noClaims: customer.claims.length === 0 ? 1 : 0,
  };
}

function scoreOpportunityLocal(features) {
  const crossSellScore =
    features.engagement * 0.28 +
    features.channel * 0.15 +
    features.normalizedIncome * 0.24 +
    features.noClaims * 0.13 +
    (1 - features.risk) * 0.2;

  const upSellScore =
    features.engagement * 0.22 +
    features.channel * 0.1 +
    features.normalizedIncome * 0.3 +
    features.noClaims * 0.12 +
    (1 - features.risk) * 0.26;

  return {
    crossSellScore: Number((crossSellScore * 100).toFixed(2)),
    upSellScore: Number((upSellScore * 100).toFixed(2)),
  };
}

function getSuggestedProductsLocal(customer) {
  const categories = new Set(customer.policies.map((p) => p.category));
  const suggestions = [];
  categories.forEach((cat) => {
    const options = CROSS_SELL_CATALOG[cat] || CROSS_SELL_CATALOG.Default;
    options.forEach((name) => suggestions.push(name));
  });
  if (suggestions.length === 0) return CROSS_SELL_CATALOG.Default;
  return [...new Set(suggestions)].slice(0, 4);
}

function requireIntelligenceHelpers() {
  return {
    buildCustomerFeatures: buildCustomerFeaturesLocal,
    scoreOpportunity: scoreOpportunityLocal,
    getSuggestedProducts: getSuggestedProductsLocal,
  };
}

// ─── Gemini LLM Content Generation ──────────────────────────────
async function generateCampaignContent(filters = {}, customPrompt = "") {
  const preview = buildSegmentPreview(filters, 1, 10);
  const sampleCustomers = preview.data.slice(0, 5);

  if (sampleCustomers.length === 0) {
    return {
      error: "No customers match the given filters.",
      smsTemplates: [],
      creativeBrief: null,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateFallbackContent(sampleCustomers, preview.segmentSummary);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const segmentDescription = buildSegmentDescription(
      filters,
      preview.segmentSummary,
      sampleCustomers,
    );

    const smsPrompt = `You are a marketing copywriter for Zurich Kotak General Insurance (India).
Generate personalized nudge messages for cross-sell and upsell insurance campaigns.

SEGMENT PROFILE:
${segmentDescription}

${filters.renewalBefore || filters.renewalAfter ? `RENEWAL CONTEXT: This segment is filtered by policy renewal dates${filters.renewalBefore ? ` (renewing before ${filters.renewalBefore})` : ''}${filters.renewalAfter ? ` (renewing after ${filters.renewalAfter})` : ''}. Messages should reference upcoming renewals and the opportunity to upgrade/add coverage during renewal.\n` : ''}
${filters.platforms && filters.platforms.length ? `TARGET PLATFORMS: ${filters.platforms.join(', ')}. Tailor the message tone and length for these specific platforms.\n` : ''}
${customPrompt ? `ADDITIONAL INSTRUCTIONS: ${customPrompt}\n` : ""}

RULES:
- Each message must be under 160 characters for SMS/WhatsApp, or 300 characters for email/web/app
- Include a clear call-to-action
- Be warm, professional, and non-pushy
- Mention specific product recommendations where relevant
- Factor in customer age group, income level, existing policies, and renewal timing
- Create messages that feel personal, not mass-marketed
${filters.platforms && filters.platforms.length ? `- Optimize message format for: ${filters.platforms.join(', ')}` : ''}

Generate exactly 3 different message templates for this segment. For each template, provide:
1. A template name (e.g., "Value Upgrade", "Renewal Reminder", "Protection Gap")
2. The message text (use {{name}} as placeholder for customer name)
3. The target audience within this segment
4. Which platform this message is optimized for

Format your response as JSON array:
[
  {
    "templateName": "...",
    "smsText": "...",
    "targetAudience": "...",
    "campaignType": "cross-sell" or "upsell",
    "platform": "WhatsApp" or "Email" or "App" or "Web"
  }
]

Return ONLY the JSON array, no other text.`;

    const smsResult = await model.generateContent(smsPrompt);
    const smsText = smsResult.response.text();
    let smsTemplates;

    try {
      const cleaned = smsText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      smsTemplates = JSON.parse(cleaned);
    } catch {
      smsTemplates = [
        {
          templateName: "AI Generated",
          smsText: smsText.slice(0, 160),
          targetAudience: "All filtered customers",
          campaignType: "cross-sell",
        },
      ];
    }

    const creativePrompt = `You are a creative director for Zurich Kotak General Insurance.
Generate a creative brief for a campaign visual targeting this segment:

${segmentDescription}

Provide a JSON object with:
{
  "imagePrompt": "A detailed prompt to generate a campaign banner image (describe scene, colors, mood, elements)",
  "headline": "A catchy campaign headline (under 10 words)",
  "subheadline": "A supporting subheadline (under 20 words)",
  "colorPalette": ["primary hex", "secondary hex", "accent hex"],
  "tone": "The overall tone description"
}

Return ONLY the JSON object, no other text.`;

    const creativeResult = await model.generateContent(creativePrompt);
    const creativeText = creativeResult.response.text();
    let creativeBrief;

    try {
      const cleanedCreative = creativeText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      creativeBrief = JSON.parse(cleanedCreative);
    } catch {
      creativeBrief = {
        imagePrompt:
          "Premium insurance campaign visual with confident Indian families, blue-white palette, trust-focused",
        headline: "Protect What Matters Most",
        subheadline:
          "Tailored insurance solutions designed just for you",
        colorPalette: ["#006DB3", "#FFFFFF", "#08B4A7"],
        tone: "Trustworthy, warm, and professional",
      };
    }

    return {
      generatedAt: new Date().toISOString(),
      segmentSummary: preview.segmentSummary,
      smsTemplates,
      creativeBrief,
      aiPowered: true,
      sampleCustomers: sampleCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        age: c.age,
        location: c.location,
      })),
    };
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return generateFallbackContent(sampleCustomers, preview.segmentSummary);
  }
}

function generateFallbackContent(sampleCustomers, segmentSummary) {
  const avgAge = segmentSummary.avgAge || 35;
  const templates = [];

  if (avgAge < 35) {
    templates.push({
      templateName: "Young Professional Shield",
      smsText:
        "Hi {{name}}, safeguard your future with our Health 360 plan. Comprehensive coverage starting at ₹499/mo. Reply YES to know more!",
      targetAudience: "Young professionals under 35",
      campaignType: "cross-sell",
    });
  } else if (avgAge < 50) {
    templates.push({
      templateName: "Family Protection",
      smsText:
        "Dear {{name}}, your family deserves the best protection. Upgrade to our Comprehensive Family Shield today. Call 1800-XXX-XXXX!",
      targetAudience: "Middle-aged family customers",
      campaignType: "upsell",
    });
  } else {
    templates.push({
      templateName: "Senior Care Plus",
      smsText:
        "Hi {{name}}, enjoy enhanced health coverage with our Health Super Top plan. Special senior benefits included. Reply KNOW MORE!",
      targetAudience: "Senior customers 50+",
      campaignType: "upsell",
    });
  }

  templates.push(
    {
      templateName: "Value Upgrade",
      smsText:
        "Hi {{name}}, you qualify for a premium upgrade! Get 2x coverage at just 20% more. Limited period offer. Visit zurichkotak.com/upgrade",
      targetAudience: "High cross-sell score customers",
      campaignType: "upsell",
    },
    {
      templateName: "Protection Gap Alert",
      smsText:
        "Dear {{name}}, our analysis shows a gap in your protection. Add Critical Illness Cover for complete peace of mind. Call us!",
      targetAudience: "Customers with single policy",
      campaignType: "cross-sell",
    },
  );

  return {
    generatedAt: new Date().toISOString(),
    segmentSummary,
    smsTemplates: templates,
    creativeBrief: {
      imagePrompt:
        "Premium insurance campaign visual with confident Indian families in urban setting, blue-white palette, trust-focused mood, modern clean design",
      headline: "Protection That Grows With You",
      subheadline: "Smart insurance solutions tailored to your life stage",
      colorPalette: ["#006DB3", "#FFFFFF", "#08B4A7"],
      tone: "Trustworthy, warm, and professional",
    },
    aiPowered: false,
    sampleCustomers: sampleCustomers.slice(0, 5).map((c) => ({
      id: c.id,
      name: c.name,
      age: c.age,
      location: c.location,
    })),
  };
}

function buildSegmentDescription(filters, summary, samples) {
  const parts = [`Segment Size: ${summary.totalFiltered} customers`];
  parts.push(`Average Age: ${summary.avgAge}`);
  parts.push(`Average Income: ${summary.avgIncome}`);
  parts.push(`Avg Cross-Sell Score: ${summary.avgCrossSellScore}/100`);
  parts.push(`Avg Up-Sell Score: ${summary.avgUpSellScore}/100`);

  if (filters.ageMin || filters.ageMax) {
    parts.push(
      `Age Range: ${filters.ageMin || 18} - ${filters.ageMax || 80}`,
    );
  }
  if (filters.location) parts.push(`Location: ${filters.location}`);
  if (filters.policyCategory)
    parts.push(`Has Policy: ${filters.policyCategory}`);
  if (filters.riskLevel) parts.push(`Risk Level: ${filters.riskLevel}`);

  if (filters.renewalBefore) parts.push(`Renewal Before: ${filters.renewalBefore}`);
  if (filters.renewalAfter) parts.push(`Renewal After: ${filters.renewalAfter}`);
  if (filters.platforms && filters.platforms.length) parts.push(`Target Platforms: ${filters.platforms.join(', ')}`);

  parts.push("\nSAMPLE CUSTOMERS:");
  samples.forEach((c) => {
    parts.push(
      `- ${c.name}, Age ${c.age}, ${c.location}, Income ${c.annualIncomeFormatted}, Policies: ${c.currentProducts.join(", ")}, Risk: ${c.riskLevel}, Cross-sell score: ${c.crossSellScore}, Suggested: ${c.suggestedProducts.join(", ")}${c.nearestRenewal ? `, Next Renewal: ${c.nearestRenewal}` : ''}`,
    );
  });

  return parts.join("\n");
}

// ─── Bulk SMS Simulation ────────────────────────────────────────
function simulateBulkSMS(filters, messageTemplate, campaignName = "", platforms = []) {
  const filtered = filterCustomers(filters);
  const selectedPlatforms = platforms.length ? platforms : ["SMS"];

  if (filtered.length === 0) {
    return {
      error: "No customers match the given filters.",
      campaign: null,
    };
  }

  const sentAt = new Date().toISOString();
  const deliveryLog = filtered.map((customer) => {
    const personalizedMsg = messageTemplate.replace(
      /\{\{name\}\}/gi,
      customer.name,
    );
    const isDelivered = Math.random() < 0.95;
    const assignedPlatform = selectedPlatforms[Math.floor(Math.random() * selectedPlatforms.length)];

    return {
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      email: customer.email,
      location: customer.location,
      platform: assignedPlatform,
      message: personalizedMsg,
      status: isDelivered ? "Delivered" : "Failed",
      deliveredAt: isDelivered ? sentAt : null,
      failureReason: isDelivered ? null : "Network timeout",
    };
  });

  const delivered = deliveryLog.filter((d) => d.status === "Delivered").length;
  const failed = deliveryLog.filter((d) => d.status === "Failed").length;

  const campaign = {
    campaignId: `NUDGE-${Date.now()}`,
    campaignName:
      campaignName || `Nudge Campaign ${new Date().toLocaleDateString("en-IN")}`,
    createdAt: sentAt,
    filters: { ...filters },
    messageTemplate,
    platforms: selectedPlatforms,
    totalRecipients: filtered.length,
    delivered,
    failed,
    deliveryRate: Number(((delivered / filtered.length) * 100).toFixed(1)),
    deliveryLog: deliveryLog.slice(0, 50),
    status: "Completed",
  };

  campaignHistory.unshift(campaign);

  return { campaign };
}

// ─── Campaign History ───────────────────────────────────────────
function getCampaignHistory() {
  return {
    total: campaignHistory.length,
    campaigns: campaignHistory.map((c) => ({
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      createdAt: c.createdAt,
      totalRecipients: c.totalRecipients,
      delivered: c.delivered,
      failed: c.failed,
      deliveryRate: c.deliveryRate,
      status: c.status,
      platforms: c.platforms || ['SMS'],
      filters: c.filters,
    })),
  };
}

module.exports = {
  getFilterOptions,
  filterCustomers,
  buildSegmentPreview,
  generateCampaignContent,
  simulateBulkSMS,
  getCampaignHistory,
};
