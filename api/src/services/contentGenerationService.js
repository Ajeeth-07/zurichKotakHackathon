const { formatCurrencyINR } = require("../utils/formatters");

function buildSubjectLine(profile, product) {
  if (profile.intent === "Very High") {
    return `Exclusive ${product} upgrade for ${profile.customerName}`;
  }
  if (profile.intent === "High") {
    return `${profile.customerName}, unlock more value with ${product}`;
  }
  return `${product} recommendation tailored for you`;
}

function buildBodyCopy(profile, product, channel) {
  const channelContext = {
    Email:
      "We noticed your recent policy engagement and built this recommendation for you.",
    App: "A personalized offer is ready in your app dashboard.",
    Web: "Your web journey unlocked a curated protection bundle.",
    Social:
      "Here is a social-ready personalized message for immediate outreach.",
    Phone: "A quick outreach script for advisor-led conversation.",
    Branch: "A branch-ready advisory talking point set.",
  };

  const intro = channelContext[channel] || channelContext.Web;

  return `${intro} ${profile.customerName} has ${profile.intent.toLowerCase()} conversion intent with an estimated uplift of ${profile.potentialRevenue.formatted}. Recommended product: ${product}. Position this as a value add based on current portfolio and lifestyle profile.`;
}

function buildCreativeBrief(profile, product) {
  return {
    visualPrompt: `Create a premium insurance campaign visual featuring a confident urban Indian customer persona from ${profile.location}. Highlight ${product} with clean blue-white brand palette, trust-first mood, and modern typography.`,
    videoPrompt: `Generate a 20-second explainer storyboard for ${product}, opening with customer challenge, then risk-proofing value proposition, ending with CTA optimized for ${profile.preferredChannel}.`,
    tone: "Trustworthy, advisory, and proactive",
  };
}

function generatePersonalizedContent(profile, channels) {
  const primaryProduct =
    profile.suggestedProducts[0] || "Smart Protection Plan";
  const selectedChannels =
    channels && channels.length ? channels : ["Email", "App", "Web", "Social"];

  const assets = selectedChannels.map((channel) => ({
    channel,
    subject: buildSubjectLine(profile, primaryProduct),
    body: buildBodyCopy(profile, primaryProduct, channel),
    cta: `Start with ${primaryProduct}`,
  }));

  return {
    product: primaryProduct,
    estimatedUplift: formatCurrencyINR(profile.potentialRevenue.value),
    assets,
    creative: buildCreativeBrief(profile, primaryProduct),
  };
}

module.exports = {
  generatePersonalizedContent,
};
