const RISK_WEIGHT = {
  Low: 0.25,
  Medium: 0.55,
  High: 0.85,
};

const CHANNEL_WEIGHT = {
  App: 0.95,
  Email: 0.8,
  Phone: 0.68,
  Branch: 0.55,
};

const ENGAGEMENT_WEIGHT = {
  Low: 0.35,
  Medium: 0.6,
  High: 0.82,
  "Very High": 0.95,
};

const CROSS_SELL_CATALOG = {
  Health: ["Critical Illness Cover", "Hospital Cash Rider", "OPD Add-on"],
  Motor: [
    "Zero Depreciation Cover",
    "Roadside Assistance Plus",
    "Engine Protect",
  ],
  Default: ["Cyber Insurance", "Personal Accident Boost", "Pollution Shield"],
};

const UPSELL_CATALOG = {
  Health: ["Health 360", "Health Super top", "Health premier"],
  Motor: ["Car Secure", "Two Wheeler Secure", "Engine Protect Plus"],
  Default: ["Comprehensive Family Shield", "Elite Protection Bundle"],
};

const CHANNEL_SEQUENCE = ["App", "Email", "Web", "Social"];

module.exports = {
  RISK_WEIGHT,
  CHANNEL_WEIGHT,
  ENGAGEMENT_WEIGHT,
  CROSS_SELL_CATALOG,
  UPSELL_CATALOG,
  CHANNEL_SEQUENCE,
};
