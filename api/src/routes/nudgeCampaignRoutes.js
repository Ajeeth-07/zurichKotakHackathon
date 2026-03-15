const express = require("express");
const {
  getFilterOptions,
  buildSegmentPreview,
  generateCampaignContent,
  simulateBulkSMS,
  getCampaignHistory,
} = require("../services/nudgeCampaignService");

const router = express.Router();

// Get available filter options (locations, policy types, etc.)
router.get("/filters", (_req, res) => {
  const options = getFilterOptions();
  return res.json(options);
});

// Preview filtered customer segment with intelligence scores
router.post("/preview", express.json(), (req, res) => {
  const {
    ageMin,
    ageMax,
    incomeMin,
    incomeMax,
    location,
    policyCategory,
    riskLevel,
    maritalStatus,
    gender,
    occupation,
    renewalBefore,
    renewalAfter,
    page,
    limit,
  } = req.body || {};

  const preview = buildSegmentPreview(
    {
      ageMin,
      ageMax,
      incomeMin,
      incomeMax,
      location,
      policyCategory,
      riskLevel,
      maritalStatus,
      gender,
      occupation,
      renewalBefore,
      renewalAfter,
    },
    page,
    limit,
  );

  return res.json(preview);
});

// Generate Gemini-powered campaign content for a segment
router.post("/generate-content", express.json(), async (req, res) => {
  try {
    const { ageMin, ageMax, incomeMin, incomeMax, location, policyCategory, riskLevel, maritalStatus, gender, occupation, renewalBefore, renewalAfter, platforms, customPrompt } =
      req.body || {};

    const content = await generateCampaignContent(
      { ageMin, ageMax, incomeMin, incomeMax, location, policyCategory, riskLevel, maritalStatus, gender, occupation, renewalBefore, renewalAfter, platforms },
      customPrompt,
    );

    if (content.error) {
      return res.status(400).json(content);
    }

    return res.json(content);
  } catch (error) {
    console.error("Content generation error:", error);
    return res.status(500).json({
      error: "Failed to generate campaign content.",
      message: error.message,
    });
  }
});

// Simulate bulk SMS send
router.post("/send-bulk", express.json(), (req, res) => {
  const {
    ageMin,
    ageMax,
    incomeMin,
    incomeMax,
    location,
    policyCategory,
    riskLevel,
    maritalStatus,
    gender,
    occupation,
    renewalBefore,
    renewalAfter,
    message,
    campaignName,
    platforms,
  } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: "SMS message text is required." });
  }

  const result = simulateBulkSMS(
    { ageMin, ageMax, incomeMin, incomeMax, location, policyCategory, riskLevel, maritalStatus, gender, occupation, renewalBefore, renewalAfter },
    message,
    campaignName,
    platforms || [],
  );

  if (result.error) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
});

// Get campaign history
router.get("/campaigns", (_req, res) => {
  const history = getCampaignHistory();
  return res.json(history);
});

module.exports = router;
