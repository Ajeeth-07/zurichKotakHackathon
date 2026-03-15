const express = require("express");
const path = require("path");
const dashboardRoutes = require("./routes/dashboardRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");
const scannerRoutes = require("./routes/scannerRoutes");
const nudgeCampaignRoutes = require("./routes/nudgeCampaignRoutes");
const authRoutes = require("./routes/authRoutes");
const approvalRoutes = require("./routes/approvalRoutes");
const agentStatsRoutes = require("./routes/agentStatsRoutes");

const app = express();

app.use(express.static(path.join(__dirname, "..", "..", "public")));

app.use("/api", dashboardRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api/scanners", scannerRoutes);
app.use("/api/nudge", nudgeCampaignRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/agent-stats", agentStatsRoutes);

app.get("/login", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "public", "login.html"));
});

app.get("/customers", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "public", "customers.html"));
});

app.get("/scanners", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "public", "scanners.html"));
});

app.get("/nudge-campaigns", (_req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "public", "nudge-campaign.html"),
  );
});

app.get("/customers/:id", (_req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "public", "customer-detail.html"),
  );
});

app.get("/customer-portal", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "public", "customer-portal.html"));
});

app.get("/agent-performance", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "public", "agent-performance.html"));
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "public", "index.html"));
});

module.exports = app;

