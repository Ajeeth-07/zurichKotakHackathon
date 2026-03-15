const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  buildUnifiedIntelligence,
  getSingleCustomerIntelligence,
} = require("../services/customerIntelligenceService");
const {
  generatePersonalizedContent,
} = require("../services/contentGenerationService");
const { activateCampaign } = require("../services/campaignActivationService");
const { paginate, formatCurrencyINR } = require("../utils/formatters");
const { getCustomerById } = require("../data/customerRepository");

const router = express.Router();

router.get("/profiles", (req, res) => {
  const intelligence = buildUnifiedIntelligence(req.query);
  const pagedProfiles = paginate(
    intelligence.segmentOfOne,
    req.query.page || 1,
    req.query.limit || 25,
  );

  return res.json({
    generatedAt: intelligence.generatedAt,
    portfolioSummary: intelligence.portfolioSummary,
    page: pagedProfiles.page,
    limit: pagedProfiles.limit,
    total: pagedProfiles.total,
    pages: pagedProfiles.pages,
    data: pagedProfiles.data,
  });
});

router.get("/profiles/:id", (req, res) => {
  const profile = getSingleCustomerIntelligence(req.params.id);

  if (!profile) {
    return res.status(404).json({ message: "Customer profile not found" });
  }

  return res.json(profile);
});

router.get("/profiles/:id/recommendations", (req, res) => {
  const profile = getSingleCustomerIntelligence(req.params.id);

  if (!profile) {
    return res.status(404).json({ message: "Customer profile not found" });
  }

  return res.json({
    customerId: profile.customerId,
    customerName: profile.customerName,
    intent: profile.intent,
    opportunityScores: profile.opportunityScores,
    recommendations: profile.recommendations,
    potentialRevenue: profile.potentialRevenue,
  });
});

router.post("/profiles/:id/content", express.json(), (req, res) => {
  const profile = getSingleCustomerIntelligence(req.params.id);

  if (!profile) {
    return res.status(404).json({ message: "Customer profile not found" });
  }

  const channels = Array.isArray(req.body?.channels)
    ? req.body.channels
    : undefined;
  const content = generatePersonalizedContent(profile, channels);

  return res.json({
    generatedAt: new Date().toISOString(),
    customerId: profile.customerId,
    content,
  });
});

router.post("/campaigns/activate", express.json(), (req, res) => {
  const { customerId, objective, channels, startAt } = req.body || {};

  if (!customerId) {
    return res.status(400).json({ message: "customerId is required" });
  }

  const profile = getSingleCustomerIntelligence(customerId);

  if (!profile) {
    return res.status(404).json({ message: "Customer profile not found" });
  }

  const content = generatePersonalizedContent(profile, channels);
  const campaign = activateCampaign({
    profile,
    content,
    objective,
    startAt,
  });

  return res.status(201).json(campaign);
});

// Gemini-powered deep AI recommendation for a single customer
router.get("/profiles/:id/ai-recommendation", async (req, res) => {
  try {
    const customer = getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const profile = getSingleCustomerIntelligence(req.params.id);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        aiPowered: false,
        customerId: customer.id,
        customerName: customer.name,
        behavioralInsights: [
          `${customer.digitalEngagement} digital engagement — ${customer.digitalEngagement === 'Very High' || customer.digitalEngagement === 'High' ? 'strong candidate for app/web offers' : 'prefer traditional outreach channels'}.`,
          `${customer.claims.length === 0 ? 'Zero claims history signals low-risk, loyal customer — ideal for premium upgrades.' : `${customer.claims.length} past claim(s) indicate active policy usage. Target supplemental coverage.`}`,
          `Customer since ${customer.customerSince} — ${new Date().getFullYear() - new Date(customer.customerSince).getFullYear()}+ year relationship builds trust for upsell.`,
        ],
        recommendedProducts: profile ? profile.recommendations.crossSellProducts.concat(profile.recommendations.upSellProducts) : [],
        personalizedPitch: `Dear ${customer.name}, as a valued customer for ${new Date().getFullYear() - new Date(customer.customerSince).getFullYear()}+ years, we have a special offer tailored to your ${customer.riskProfile.level.toLowerCase()}-risk profile. Enhance your protection today.`,
        riskAnalysis: {
          level: customer.riskProfile.level,
          factors: [
            `BMI: ${customer.riskProfile.healthStatus.bmi}`,
            `Smoking: ${customer.riskProfile.healthStatus.smokingStatus}`,
            customer.riskProfile.healthStatus.preExistingConditions.length > 0
              ? `Pre-existing: ${customer.riskProfile.healthStatus.preExistingConditions.join(', ')}`
              : 'No pre-existing conditions',
          ],
        },
        confidenceScore: profile ? profile.confidenceScore : 50,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const customerContext = `
CUSTOMER PROFILE:
- Name: ${customer.name}, Age: ${customer.age}, Gender: ${customer.gender}
- Location: ${customer.location}, Occupation: ${customer.occupation}
- Annual Income: ${formatCurrencyINR(customer.annualIncome)}
- Marital Status: ${customer.maritalStatus}
- Customer Since: ${customer.customerSince}
- Digital Engagement: ${customer.digitalEngagement}
- Preferred Channel: ${customer.preferredChannel}
- Risk Level: ${customer.riskProfile.level} (Score: ${customer.riskProfile.overallScore}/100)
- BMI: ${customer.riskProfile.healthStatus.bmi}, Smoker: ${customer.riskProfile.healthStatus.smokingStatus}
- Pre-existing Conditions: ${customer.riskProfile.healthStatus.preExistingConditions.length > 0 ? customer.riskProfile.healthStatus.preExistingConditions.join(', ') : 'None'}

CURRENT POLICIES:
${customer.policies.map(p => `- ${p.productName} (${p.category}) — Premium: ${formatCurrencyINR(p.premium)}, Sum Insured: ${formatCurrencyINR(p.sumInsured)}, Status: ${p.status}, Renewal: ${p.renewalDate}`).join('\n')}

CLAIMS HISTORY:
${customer.claims.length > 0 ? customer.claims.map(c => `- ${c.claimId}: ${c.description}, Amount: ${formatCurrencyINR(c.claimAmount)}, Status: ${c.status}`).join('\n') : 'No claims filed'}

INTELLIGENCE SCORES:
- Cross-Sell Score: ${profile ? profile.opportunityScores.crossSellScore : 'N/A'}
- Up-Sell Score: ${profile ? profile.opportunityScores.upSellScore : 'N/A'}
- Intent: ${profile ? profile.intent : 'Unknown'}
`;

    const prompt = `You are an AI insurance advisor STRICTLY for Zurich Kotak General Insurance (India).

CRITICAL RULES:
- You must ONLY recommend Zurich Kotak GENERAL INSURANCE products. 
- NEVER suggest or mention any life insurance, term insurance, endowment, ULIP, pension, or annuity products.
- Zurich Kotak is a GENERAL insurance company. Their product categories are: Health Insurance, Motor Insurance, Travel Insurance, Home Insurance, Personal Accident, and Critical Illness cover.
- Available Zurich Kotak products include: Health 360, Health Premier, Secure Shield, Hospital Daily Cash, Health Super Top-up, Car Secure, Two Wheeler Secure, Travel Insurance, Home Insurance, Kotak Accident Care.
- If the customer needs coverage beyond general insurance, do NOT recommend life insurance — instead suggest relevant general insurance products that address similar needs.

Analyze this customer's complete profile and generate deep, personalized recommendations.

${customerContext}

Provide a JSON response with:
{
  "behavioralInsights": ["3-5 behavioral insights about this customer based on their data"],
  "recommendedProducts": [
    {
      "name": "Zurich Kotak Product Name (from the available products list above)",
      "reason": "Why this product is recommended for this specific customer",
      "type": "cross-sell" or "upsell",
      "priority": "high" or "medium" or "low",
      "estimatedPremium": "estimated premium range in INR"
    }
  ],
  "personalizedPitch": "A 2-3 sentence personalized sales pitch for the agent to use — mention only Zurich Kotak General Insurance products",
  "riskAnalysis": {
    "summary": "Brief risk assessment summary",
    "factors": ["Key risk factors identified"],
    "mitigations": ["Suggested Zurich Kotak general insurance products/actions to mitigate risks"]
  },
  "lifestageInsight": "What life stage this customer is likely in and how it affects their GENERAL insurance needs",
  "renewalStrategy": "Strategy for upcoming policy renewals",
  "engagementTip": "Best way to approach this customer based on their channel preference and engagement level"
}

Return ONLY valid JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    let parsed;

    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        behavioralInsights: [text.slice(0, 200)],
        recommendedProducts: profile ? profile.recommendations.crossSellProducts.map(p => ({ name: p, reason: 'AI-recommended', type: 'cross-sell', priority: 'medium' })) : [],
        personalizedPitch: text.slice(0, 300),
        riskAnalysis: { summary: 'See customer profile', factors: [], mitigations: [] },
      };
    }

    return res.json({
      aiPowered: true,
      customerId: customer.id,
      customerName: customer.name,
      confidenceScore: profile ? profile.confidenceScore : 50,
      ...parsed,
    });
  } catch (error) {
    console.error("AI recommendation error:", error.message);
    return res.status(500).json({ error: "Failed to generate AI recommendation", message: error.message });
  }
});

module.exports = router;
