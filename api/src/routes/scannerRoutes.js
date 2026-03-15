const express = require("express");
const { getCyberRiskAssessment } = require("../services/scannerService");

const router = express.Router();

router.post("/cyber-score", express.json(), async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for cyber scan.",
      });
    }

    const result = await getCyberRiskAssessment(email);

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Cyber scan failed. Please try again.",
      error: error.message,
    });
  }
});

module.exports = router;
