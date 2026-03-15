// ─── Shared Auth Helper ─────────────────────────────────────────
// Include this script on pages that need auth awareness

window.Auth = (function () {
  function getToken() {
    return localStorage.getItem("authToken");
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      return null;
    }
  }

  function isLoggedIn() {
    return !!getToken() && !!getUser();
  }

  function logout() {
    const token = getToken();
    if (token) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }).catch(() => {});
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  }

  function authHeaders() {
    return { Authorization: "Bearer " + (getToken() || "") };
  }

  // Render user info in sidebar agent-card if it exists
  function renderSidebarUser() {
    const user = getUser();
    const avatar = document.querySelector(".agent-avatar");
    const nameEl = document.querySelector(".agent-card h3");
    const subEl = document.querySelector(".agent-card p");

    if (user && avatar) {
      avatar.textContent = user.avatar || "??";
      if (nameEl) nameEl.textContent = user.name;
      if (subEl) subEl.textContent = user.role === "manager" ? user.designation : user.level;
    }

    // Add logout button if not there
    const card = document.querySelector(".agent-card");
    if (card && !document.getElementById("btn-logout")) {
      const btn = document.createElement("button");
      btn.id = "btn-logout";
      btn.textContent = "Logout";
      btn.className = "nudge-btn nudge-btn-ghost";
      btn.style.cssText = "margin-top:8px;padding:6px 12px;font-size:12px;width:100%";
      btn.addEventListener("click", logout);
      card.appendChild(btn);
    }

    // Show login link if not logged in
    if (!user) {
      const nav = document.querySelector(".side-nav");
      if (nav && !document.getElementById("login-link")) {
        const link = document.createElement("a");
        link.id = "login-link";
        link.href = "/login";
        link.textContent = "🔐 Login";
        link.style.cssText = "margin-top:auto;color:#0c6eb6;font-weight:700";
        nav.appendChild(link);
      }
    }
  }

  // Auto-render
  document.addEventListener("DOMContentLoaded", renderSidebarUser);

  return { getToken, getUser, isLoggedIn, logout, authHeaders, renderSidebarUser };
})();
