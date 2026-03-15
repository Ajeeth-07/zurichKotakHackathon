// ─── Campaign Approval Service ──────────────────────────────────
// In-memory approval request store

const { getUserById } = require("./authService");

const approvalRequests = [];

function submitApprovalRequest({
  campaignDraft,
  agentId,
  managerId,
  filters,
  message,
  platforms,
  campaignName,
}) {
  const agent = getUserById(agentId);
  const manager = getUserById(managerId);

  if (!agent || !manager) {
    return { error: "Invalid agent or manager ID." };
  }

  const request = {
    id: `APR-${Date.now()}`,
    campaignName: campaignName || `Campaign ${new Date().toLocaleDateString("en-IN")}`,
    agentId,
    agentName: agent.name,
    agentAvatar: agent.avatar,
    managerId,
    managerName: manager.name,
    managerAvatar: manager.avatar,
    filters: filters || {},
    message,
    platforms: platforms || ["SMS"],
    campaignDraft: campaignDraft || {},
    status: "pending", // pending | approved | denied | changes_requested
    managerNote: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: null,
  };

  approvalRequests.unshift(request);
  return { request };
}

function getRequestsForManager(managerId) {
  return approvalRequests.filter((r) => r.managerId === managerId);
}

function getRequestsForAgent(agentId) {
  return approvalRequests.filter((r) => r.agentId === agentId);
}

function getRequestById(requestId) {
  return approvalRequests.find((r) => r.id === requestId) || null;
}

function approveRequest(requestId, managerId, note) {
  const req = approvalRequests.find(
    (r) => r.id === requestId && r.managerId === managerId,
  );
  if (!req) return { error: "Approval request not found or unauthorized." };
  if (req.status !== "pending" && req.status !== "changes_requested") {
    return { error: `Request is already ${req.status}.` };
  }

  req.status = "approved";
  req.managerNote = note || "Approved. Campaign is cleared for launch.";
  req.updatedAt = new Date().toISOString();
  req.resolvedAt = new Date().toISOString();

  return { request: req };
}

function denyRequest(requestId, managerId, note) {
  const req = approvalRequests.find(
    (r) => r.id === requestId && r.managerId === managerId,
  );
  if (!req) return { error: "Approval request not found or unauthorized." };
  if (req.status !== "pending" && req.status !== "changes_requested") {
    return { error: `Request is already ${req.status}.` };
  }

  req.status = "denied";
  req.managerNote = note || "Request denied.";
  req.updatedAt = new Date().toISOString();
  req.resolvedAt = new Date().toISOString();

  return { request: req };
}

function requestChanges(requestId, managerId, note) {
  const req = approvalRequests.find(
    (r) => r.id === requestId && r.managerId === managerId,
  );
  if (!req) return { error: "Approval request not found or unauthorized." };
  if (req.status !== "pending") {
    return { error: `Request is already ${req.status}.` };
  }

  req.status = "changes_requested";
  req.managerNote = note || "Please make changes and resubmit.";
  req.updatedAt = new Date().toISOString();

  return { request: req };
}

function getPendingCountForManager(managerId) {
  return approvalRequests.filter(
    (r) => r.managerId === managerId && r.status === "pending",
  ).length;
}

function launchRequest(requestId, agentId) {
  const req = approvalRequests.find(
    (r) => r.id === requestId && r.agentId === agentId,
  );
  if (!req) return { error: "Approval request not found or unauthorized." };
  if (req.status !== "approved") {
    return { error: `Request must be approved before launching. Current status: ${req.status}.` };
  }

  req.status = "launched";
  req.launchedAt = new Date().toISOString();
  req.updatedAt = new Date().toISOString();

  return { request: req };
}

module.exports = {
  submitApprovalRequest,
  getRequestsForManager,
  getRequestsForAgent,
  getRequestById,
  approveRequest,
  denyRequest,
  requestChanges,
  launchRequest,
  getPendingCountForManager,
};
