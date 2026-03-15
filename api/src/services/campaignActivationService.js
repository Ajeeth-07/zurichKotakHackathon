const { CHANNEL_SEQUENCE } = require("../config/constants");

function buildChannelPlan(contentAssets, startAt) {
  const baseDate = startAt ? new Date(startAt) : new Date();

  return contentAssets.map((asset, index) => {
    const sequenceIndex = CHANNEL_SEQUENCE.findIndex(
      (channel) => channel.toLowerCase() === asset.channel.toLowerCase(),
    );

    const position = sequenceIndex >= 0 ? sequenceIndex : index;
    const scheduledTime = new Date(
      baseDate.getTime() + position * 24 * 60 * 60 * 1000,
    );

    return {
      channel: asset.channel,
      scheduledAt: scheduledTime.toISOString(),
      status: "Scheduled",
      payload: {
        subject: asset.subject,
        body: asset.body,
        cta: asset.cta,
      },
    };
  });
}

function activateCampaign({ profile, content, objective, startAt }) {
  const plan = buildChannelPlan(content.assets, startAt);

  return {
    campaignId: `SEG1-${profile.customerId}-${Date.now()}`,
    objective: objective || "Cross-Sell",
    customerId: profile.customerId,
    customerName: profile.customerName,
    predictedIntent: profile.intent,
    recommendedProducts: profile.suggestedProducts,
    launchWindow: {
      startAt: plan.length ? plan[0].scheduledAt : new Date().toISOString(),
      endAt: plan.length
        ? plan[plan.length - 1].scheduledAt
        : new Date().toISOString(),
    },
    activationPlan: plan,
    governance: {
      complianceStatus: "Ready for Review",
      brandTone: content.creative.tone,
      modelVersion: "segone-nlg-v1",
    },
  };
}

module.exports = {
  activateCampaign,
};
