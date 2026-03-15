const {
  getAllCustomers,
  getCustomerById,
} = require("../data/customerRepository");
const { paginate } = require("../utils/formatters");

function deriveConfidenceScore(customer, maxIncome) {
  const riskWeight = {
    Low: 0.9,
    Medium: 0.68,
    High: 0.42,
  };

  const engagementWeight = {
    Low: 0.42,
    Medium: 0.62,
    High: 0.82,
    "Very High": 0.95,
  };

  const engagement = engagementWeight[customer.digitalEngagement] || 0.5;
  const risk = riskWeight[customer.riskProfile.level] || 0.5;
  const incomeNormalized = maxIncome ? customer.annualIncome / maxIncome : 0;
  const policyStrength = Math.min(1, customer.policies.length / 3);
  const claimsPenalty = Math.min(0.35, customer.claims.length * 0.08);

  const scoreRaw =
    engagement * 0.33 +
    risk * 0.25 +
    incomeNormalized * 0.2 +
    policyStrength * 0.22 -
    claimsPenalty;

  return Number(Math.max(8, Math.min(98, scoreRaw * 100)).toFixed(1));
}

function byCategoryCount(data) {
  const productCounts = new Map();

  data.forEach((customer) => {
    customer.policies.forEach((policy) => {
      const existing = productCounts.get(policy.productName) || 0;
      productCounts.set(policy.productName, existing + 1);
    });
  });

  return [...productCounts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function getSummary() {
  const customers = getAllCustomers();
  const totalCustomers = customers.length;
  const motorCustomers = customers.filter((c) =>
    c.policies.some((p) => p.category === "Motor"),
  ).length;
  const healthCustomers = customers.filter((c) =>
    c.policies.some((p) => p.category === "Health"),
  ).length;

  const highIntent = customers.filter(
    (c) =>
      c.digitalEngagement === "High" || c.digitalEngagement === "Very High",
  ).length;

  const converted = customers.filter((c) =>
    c.policies.some((p) => ["Converted", "Interested"].includes(p.ppcOutcome)),
  ).length;

  const lowRisk = customers.filter((c) => c.riskProfile.level === "Low").length;
  const mediumRisk = customers.filter(
    (c) => c.riskProfile.level === "Medium",
  ).length;
  const highRisk = customers.filter(
    (c) => c.riskProfile.level === "High",
  ).length;

  return {
    totalCustomers,
    motorCustomers,
    healthCustomers,
    crossSellOpportunities: highIntent,
    conversionRate: totalCustomers
      ? Number(((converted / totalCustomers) * 100).toFixed(1))
      : 0,
    weeklyChallenge: {
      title: "Monsoon Protection Drive",
      current: Math.min(highIntent, 50),
      target: 50,
      growth: "+12% this month",
    },
    topProducts: byCategoryCount(customers),
    riskDistribution: [
      { name: "Low Risk", value: lowRisk },
      { name: "Medium Risk", value: mediumRisk },
      { name: "High Risk", value: highRisk },
    ],
  };
}

function getCustomers(query) {
  const { q = "", risk = "", channel = "", page = "1", limit = "12" } = query;
  const customers = getAllCustomers();
  const maxIncome = Math.max(
    ...customers.map((customer) => customer.annualIncome),
  );

  let filtered = customers;

  if (q) {
    const text = q.toLowerCase();
    filtered = filtered.filter(
      (customer) =>
        customer.name.toLowerCase().includes(text) ||
        customer.location.toLowerCase().includes(text) ||
        customer.email.toLowerCase().includes(text) ||
        customer.phone.toLowerCase().includes(text),
    );
  }

  if (risk) {
    filtered = filtered.filter(
      (customer) =>
        customer.riskProfile.level.toLowerCase() === String(risk).toLowerCase(),
    );
  }

  if (channel) {
    filtered = filtered.filter(
      (customer) =>
        customer.preferredChannel.toLowerCase() ===
        String(channel).toLowerCase(),
    );
  }

  const paged = paginate(filtered, page, limit);

  paged.data = paged.data.map((customer) => {
    return {
      ...customer,
      confidenceScore: deriveConfidenceScore(customer, maxIncome),
    };
  });

  return paged;
}

function getCustomerDetails(id) {
  return getCustomerById(id);
}

module.exports = {
  getSummary,
  getCustomers,
  getCustomerDetails,
};
