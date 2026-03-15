const {
  getAllCustomers,
  getCustomerById,
} = require("../data/customerRepository");
const {
  RISK_WEIGHT,
  CHANNEL_WEIGHT,
  ENGAGEMENT_WEIGHT,
  CROSS_SELL_CATALOG,
  UPSELL_CATALOG,
} = require("../config/constants");
const { formatCurrencyINR } = require("../utils/formatters");

function normalize(value, min, max) {
  if (max === min) {
    return 0;
  }
  return (value - min) / (max - min);
}

function buildCustomerFeatures(customer, minIncome, maxIncome) {
  const engagement = ENGAGEMENT_WEIGHT[customer.digitalEngagement] || 0.5;
  const channel = CHANNEL_WEIGHT[customer.preferredChannel] || 0.5;
  const risk = RISK_WEIGHT[customer.riskProfile.level] || 0.5;
  const normalizedIncome = normalize(
    customer.annualIncome,
    minIncome,
    maxIncome,
  );

  const hasHealthPolicy = customer.policies.some(
    (policy) => policy.category === "Health",
  );
  const hasMotorPolicy = customer.policies.some(
    (policy) => policy.category === "Motor",
  );
  const noClaims = customer.claims.length === 0 ? 1 : 0;

  return {
    engagement,
    channel,
    risk,
    normalizedIncome,
    hasHealthPolicy,
    hasMotorPolicy,
    noClaims,
  };
}

function scoreOpportunity(features) {
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

function getSuggestedProducts(customer) {
  const categories = new Set(
    customer.policies.map((policy) => policy.category),
  );
  const suggestions = [];

  categories.forEach((category) => {
    const options = CROSS_SELL_CATALOG[category] || CROSS_SELL_CATALOG.Default;
    options.forEach((name) => suggestions.push(name));
  });

  if (suggestions.length === 0) {
    return CROSS_SELL_CATALOG.Default;
  }

  return [...new Set(suggestions)].slice(0, 4);
}

function hasProduct(customer, productName) {
  return customer.policies.some(
    (policy) => policy.productName.toLowerCase() === productName.toLowerCase(),
  );
}

function uniqueProductNames(customer) {
  return [...new Set(customer.policies.map((policy) => policy.productName))];
}

function buildRuleBasedRecommendations(customer, features, scores) {
  const crossSell = [];
  const upSell = [];
  const reasons = [];

  const hasHealth = customer.policies.some(
    (policy) => policy.category === "Health",
  );
  const hasMotor = customer.policies.some(
    (policy) => policy.category === "Motor",
  );
  const policyCount = customer.policies.length;

  if (features.engagement >= 0.82 && !hasProduct(customer, "Cyber Insurance")) {
    crossSell.push("Cyber Insurance");
    reasons.push(
      "High digital engagement indicates strong adoption of digital-first products.",
    );
  }

  if (hasMotor && !hasProduct(customer, "Personal Accident Boost")) {
    crossSell.push("Personal Accident Boost");
    reasons.push(
      "Motor customers with personal risk exposure are ideal for accident cover cross-sell.",
    );
  }

  if (hasHealth && customer.claims.length === 0) {
    crossSell.push("Hospital Cash Rider");
    reasons.push(
      "Claim-free health portfolio signals eligibility for supplemental health riders.",
    );
  }

  if (customer.riskProfile.healthStatus.preExistingConditions.length > 0) {
    crossSell.push("Critical Illness Cover");
    reasons.push(
      "Pre-existing conditions increase need for critical illness and treatment expense cover.",
    );
  }

  if (customer.annualIncome > 1500000) {
    upSell.push("Comprehensive Family Shield");
    reasons.push(
      "Higher income segment has higher affordability for premium bundles and add-ons.",
    );
  }

  if (hasHealth && !hasProduct(customer, "Health 360")) {
    upSell.push("Health 360");
    reasons.push(
      "Current health policy can be upgraded to broader network and sum insured options.",
    );
  }

  if (hasMotor && !hasProduct(customer, "Car Secure")) {
    upSell.push("Car Secure");
    reasons.push(
      "Motor policy holder qualifies for broader motor protection with higher benefits.",
    );
  }

  if (scores.upSellScore >= 60 && policyCount >= 2) {
    upSell.push("Elite Protection Bundle");
    reasons.push(
      "Strong up-sell propensity and multi-policy ownership support bundle upgrade positioning.",
    );
  }

  if (!crossSell.length) {
    const fallbackCategory = hasHealth
      ? "Health"
      : hasMotor
        ? "Motor"
        : "Default";
    crossSell.push(
      ...(
        CROSS_SELL_CATALOG[fallbackCategory] || CROSS_SELL_CATALOG.Default
      ).slice(0, 2),
    );
  }

  if (!upSell.length) {
    const fallbackCategory = hasHealth
      ? "Health"
      : hasMotor
        ? "Motor"
        : "Default";
    upSell.push(
      ...(UPSELL_CATALOG[fallbackCategory] || UPSELL_CATALOG.Default).slice(
        0,
        2,
      ),
    );
  }

  return {
    crossSellProducts: [...new Set(crossSell)].slice(0, 4),
    upSellProducts: [...new Set(upSell)].slice(0, 4),
    currentPortfolio: uniqueProductNames(customer),
    ruleReasons: [...new Set(reasons)].slice(0, 6),
  };
}

function estimatePotentialRevenue(customer, scores) {
  const avgPremium =
    customer.policies.length > 0
      ? customer.policies.reduce((sum, policy) => sum + policy.premium, 0) /
        customer.policies.length
      : 15000;

  const potential =
    avgPremium * ((scores.crossSellScore + scores.upSellScore) / 200) * 1.8;

  return {
    value: Number(potential.toFixed(0)),
    formatted: formatCurrencyINR(potential),
  };
}

function classifyIntent(score) {
  if (score >= 75) {
    return "Very High";
  }
  if (score >= 60) {
    return "High";
  }
  if (score >= 45) {
    return "Medium";
  }
  return "Low";
}

function computeConfidenceScore(scores, recommendations) {
  const weightedScore =
    scores.crossSellScore * 0.55 + scores.upSellScore * 0.45;
  const ruleBonus = Math.min(
    12,
    (recommendations.ruleReasons || []).length * 2,
  );
  return Number(Math.min(99, weightedScore + ruleBonus).toFixed(1));
}

function buildSegmentOfOne(customer, minIncome, maxIncome) {
  const features = buildCustomerFeatures(customer, minIncome, maxIncome);
  const scores = scoreOpportunity(features);
  const intent = classifyIntent(
    Math.max(scores.crossSellScore, scores.upSellScore),
  );
  const recommendations = buildRuleBasedRecommendations(
    customer,
    features,
    scores,
  );
  const confidenceScore = computeConfidenceScore(scores, recommendations);

  return {
    customerId: customer.id,
    customerName: customer.name,
    age: customer.age,
    gender: customer.gender,
    email: customer.email,
    phone: customer.phone,
    occupation: customer.occupation,
    annualIncome: customer.annualIncome,
    maritalStatus: customer.maritalStatus,
    customerSince: customer.customerSince,
    location: customer.location,
    riskLevel: customer.riskProfile.level,
    digitalEngagement: customer.digitalEngagement,
    preferredChannel: customer.preferredChannel,
    opportunityScores: scores,
    confidenceScore,
    intent,
    suggestedProducts: getSuggestedProducts(customer),
    recommendations,
    potentialRevenue: estimatePotentialRevenue(customer, scores),
  };
}

function buildUnifiedIntelligence(filter = {}) {
  const customers = getAllCustomers();
  const incomes = customers.map((customer) => customer.annualIncome);
  const minIncome = Math.min(...incomes);
  const maxIncome = Math.max(...incomes);

  let enriched = customers.map((customer) =>
    buildSegmentOfOne(customer, minIncome, maxIncome),
  );

  if (filter.risk) {
    enriched = enriched.filter(
      (item) =>
        item.riskLevel.toLowerCase() === String(filter.risk).toLowerCase(),
    );
  }

  if (filter.intent) {
    enriched = enriched.filter(
      (item) =>
        item.intent.toLowerCase() === String(filter.intent).toLowerCase(),
    );
  }

  if (filter.channel) {
    enriched = enriched.filter(
      (item) =>
        item.preferredChannel.toLowerCase() ===
        String(filter.channel).toLowerCase(),
    );
  }

  if (filter.q) {
    const needle = String(filter.q).toLowerCase();
    enriched = enriched.filter(
      (item) =>
        item.customerName.toLowerCase().includes(needle) ||
        item.location.toLowerCase().includes(needle),
    );
  }

  enriched.sort(
    (a, b) =>
      b.opportunityScores.crossSellScore - a.opportunityScores.crossSellScore,
  );

  const portfolioSummary = {
    totalProfiles: enriched.length,
    veryHighIntent: enriched.filter((item) => item.intent === "Very High")
      .length,
    highIntent: enriched.filter((item) => item.intent === "High").length,
    mediumIntent: enriched.filter((item) => item.intent === "Medium").length,
    lowIntent: enriched.filter((item) => item.intent === "Low").length,
    estimatedRevenue: formatCurrencyINR(
      enriched.reduce((sum, item) => sum + item.potentialRevenue.value, 0),
    ),
  };

  return {
    generatedAt: new Date().toISOString(),
    portfolioSummary,
    segmentOfOne: enriched,
  };
}

function getSingleCustomerIntelligence(customerId) {
  const customers = getAllCustomers();
  const customer = getCustomerById(customerId);

  if (!customer) {
    return null;
  }

  const incomes = customers.map((item) => item.annualIncome);
  const minIncome = Math.min(...incomes);
  const maxIncome = Math.max(...incomes);

  return buildSegmentOfOne(customer, minIncome, maxIncome);
}

module.exports = {
  buildUnifiedIntelligence,
  getSingleCustomerIntelligence,
};
