const express = require("express");
const { getAgentStats } = require("../services/agentStatsService");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json(getAgentStats());
});

module.exports = router;
