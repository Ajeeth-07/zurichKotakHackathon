const express = require("express");
const {
  submitApprovalRequest,
  getRequestsForManager,
  getRequestsForAgent,
  getRequestById,
  approveRequest,
  denyRequest,
  requestChanges,
  launchRequest,
  getPendingCountForManager,
} = require("../services/approvalService");
const { simulateBulkSMS } = require("../services/nudgeCampaignService");
const { getUserByToken } = require("../services/authService");

const router = express.Router();

// Auth middleware
function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  req.user = user;
  next();
}

// Submit approval request (agent)
router.post("/submit", express.json(), auth, (req, res) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ error: "Only agents can submit approvals." });
  }

  const { managerId, filters, message, platforms, campaignName, campaignDraft } =
    req.body || {};

  if (!managerId) {
    return res.status(400).json({ error: "Please select an approver." });
  }

  const result = submitApprovalRequest({
    agentId: req.user.id,
    managerId,
    filters,
    message,
    platforms,
    campaignName,
    campaignDraft,
  });

  if (result.error) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
});

// Get my requests (agent sees own, manager sees assigned)
router.get("/my-requests", auth, (req, res) => {
  const requests =
    req.user.role === "manager"
      ? getRequestsForManager(req.user.id)
      : getRequestsForAgent(req.user.id);

  return res.json({
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    requests,
  });
});

// Get single request
router.get("/requests/:id", auth, (req, res) => {
  const request = getRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ error: "Request not found." });
  }
  return res.json(request);
});

// Pending count badge for manager
router.get("/pending-count", auth, (req, res) => {
  if (req.user.role !== "manager") {
    return res.json({ count: 0 });
  }
  return res.json({ count: getPendingCountForManager(req.user.id) });
});

// Approve (manager)
router.post("/requests/:id/approve", express.json(), auth, (req, res) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ error: "Only managers can approve." });
  }
  const result = approveRequest(req.params.id, req.user.id, req.body.note);
  if (result.error) return res.status(400).json(result);
  return res.json(result);
});

// Deny (manager)
router.post("/requests/:id/deny", express.json(), auth, (req, res) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ error: "Only managers can deny." });
  }
  const result = denyRequest(req.params.id, req.user.id, req.body.note);
  if (result.error) return res.status(400).json(result);
  return res.json(result);
});

// Request changes (manager)
router.post("/requests/:id/request-changes", express.json(), auth, (req, res) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ error: "Only managers can request changes." });
  }
  const result = requestChanges(req.params.id, req.user.id, req.body.note);
  if (result.error) return res.status(400).json(result);
  return res.json(result);
});

// Launch approved campaign (agent only)
router.post("/requests/:id/launch", express.json(), auth, (req, res) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ error: "Only agents can launch campaigns." });
  }

  // Mark request as launched (prevents double-launch)
  const launchResult = launchRequest(req.params.id, req.user.id);
  if (launchResult.error) return res.status(400).json(launchResult);

  const approvedReq = launchResult.request;

  // Actually run the bulk send simulation using stored filters & message
  const bulkResult = simulateBulkSMS(
    approvedReq.filters || {},
    approvedReq.message,
    approvedReq.campaignName,
    approvedReq.platforms || [],
  );

  if (bulkResult.error) {
    return res.status(400).json({ error: bulkResult.error });
  }

  return res.json({ request: approvedReq, campaign: bulkResult.campaign });
});

module.exports = router;
