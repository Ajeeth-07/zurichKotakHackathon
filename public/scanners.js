const SCANNER_MAP = {
  cyber: {
    title: "Cyber Risk Assessment",
    description:
      "Check if your customer's data has been compromised to pitch Cyber Insurance.",
    pitch: "Cyber Insurance",
  },
  health: {
    title: "Health Vulnerability Scan",
    description:
      "Evaluate wellness and medical indicators to position a health cover upgrade.",
    pitch: "Critical Illness Cover",
  },
};

const state = {
  activeTab: "cyber",
  isLoading: false,
  cameraStream: null,
  hasHealthCapture: false,
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setStatus(message, type = "info") {
  const status = document.getElementById("scannerStatus");
  status.textContent = message;
  status.className = `scanner-status ${type}`;

  const sideStatus = document.getElementById("scannerLastStatus");
  sideStatus.textContent = message;
}

function setLoading(loading) {
  state.isLoading = loading;
  const submitBtn = document.getElementById("scannerSubmitBtn");
  const submitText = document.getElementById("scannerSubmitText");
  const spinner = document.getElementById("scannerSpinner");

  submitBtn.disabled = loading;
  submitBtn.classList.toggle("loading", loading);
  spinner.classList.toggle("hidden", !loading);
  if (loading) {
    submitText.textContent = "Scanning...";
  } else {
    const defaultText =
      state.activeTab === "health" ? "Analyze Risk" : "Run Deep Scan";
    submitText.textContent = defaultText;
  }
}

function clearResultPanel() {
  const result = document.getElementById("scanResult");
  result.classList.add("hidden");
  document.getElementById("resultHeadline").textContent = "Scan Result";
  document.getElementById("resultSummary").textContent = "";
  document.getElementById("resultSignals").innerHTML = "";
  document.getElementById("resultScore").textContent = "";
  document.getElementById("resultPitch").textContent = "";
}

async function startHealthCamera() {
  if (state.cameraStream) {
    return;
  }

  const video = document.getElementById("healthVideo");
  const status = document.getElementById("healthCaptureStatus");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
      },
      audio: false,
    });
    state.cameraStream = stream;
    video.srcObject = stream;
    status.textContent = "Camera is live. Capture snapshot to analyze.";
  } catch (_error) {
    status.textContent =
      "Camera access denied or unavailable. Health analysis will continue without snapshot.";
  }
}

function stopHealthCamera() {
  if (!state.cameraStream) {
    return;
  }

  state.cameraStream.getTracks().forEach((track) => track.stop());
  state.cameraStream = null;
}

function resetHealthCaptureUI() {
  const video = document.getElementById("healthVideo");
  const canvas = document.getElementById("healthCanvas");
  const retakeBtn = document.getElementById("retakePhotoBtn");
  const status = document.getElementById("healthCaptureStatus");

  state.hasHealthCapture = false;
  canvas.classList.add("hidden");
  video.classList.remove("hidden");
  retakeBtn.classList.add("hidden");
  status.textContent = "Camera is live. Capture snapshot to analyze.";
}

function captureHealthSnapshot() {
  const video = document.getElementById("healthVideo");
  const canvas = document.getElementById("healthCanvas");
  const status = document.getElementById("healthCaptureStatus");
  const retakeBtn = document.getElementById("retakePhotoBtn");

  if (!video.videoWidth || !video.videoHeight) {
    status.textContent = "Unable to capture yet. Wait for camera preview.";
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  state.hasHealthCapture = true;
  video.classList.add("hidden");
  canvas.classList.remove("hidden");
  retakeBtn.classList.remove("hidden");
  status.textContent = "Snapshot captured. Click Analyze Risk.";
}

function getScoreClass(score) {
  if (score >= 75) {
    return "High";
  }
  if (score >= 50) {
    return "Medium";
  }
  return "Low";
}

function buildSignals(tab, customer, scoreLabel) {
  if (!customer) {
    return [
      "No exact customer match found in demo dataset.",
      "Using pattern-based risk inference from scanner inputs.",
      `Current risk confidence: ${scoreLabel}.`,
    ];
  }

  const signals = [
    `Matched customer profile: ${customer.name} from ${customer.location}.`,
    `Digital engagement is ${customer.digitalEngagement}.`,
    `Risk profile level is ${customer.riskProfile.level}.`,
  ];

  if (
    tab === "health" &&
    customer.riskProfile.healthStatus.preExistingConditions.length
  ) {
    signals.push(
      `Pre-existing conditions found: ${customer.riskProfile.healthStatus.preExistingConditions.join(", ")}.`,
    );
  }

  return signals;
}

function computeScanScore(tab, customer, email) {
  let base = 40;

  if (customer) {
    base += customer.confidenceScore ? customer.confidenceScore * 0.45 : 10;
    base += customer.claims.length === 0 ? 8 : 2;
    base += customer.digitalEngagement === "Very High" ? 10 : 4;
  }

  if (tab === "cyber") {
    if (email.includes("@")) {
      base += 7;
    }
  }

  if (tab === "health") {
    if (customer?.riskProfile.healthStatus.preExistingConditions.length) {
      base += 10;
    }
  }

  return Math.max(15, Math.min(98, Number(base.toFixed(1))));
}

async function findCustomer(email, phone) {
  const queryValue = email || phone;
  if (!queryValue) {
    return null;
  }

  const response = await fetch(
    `/api/customers?q=${encodeURIComponent(queryValue)}&limit=1&page=1`,
  );
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return payload?.data?.[0] || null;
}

function activateTab(tab) {
  state.activeTab = tab;
  const meta = SCANNER_MAP[tab];

  document.getElementById("scannerTitle").textContent = meta.title;
  document.getElementById("scannerDescription").textContent = meta.description;

  document.querySelectorAll(".scanner-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  document.getElementById("scannerSideTitle").textContent =
    `Active Tool: ${meta.title.replace("Assessment", "").trim()}`;
  document.getElementById("scannerMode").textContent =
    tab.charAt(0).toUpperCase() + tab.slice(1);

  const contactFields = document.getElementById("scannerContactFields");
  const submitBtn = document.getElementById("scannerSubmitBtn");
  const healthAnalyzeBtn = document.getElementById("healthAnalyzeBtn");

  const healthModule = document.getElementById("healthCameraModule");
  healthModule.classList.toggle("hidden", tab !== "health");
  contactFields.classList.toggle("hidden", tab === "health");
  submitBtn.classList.toggle("hidden", tab === "health");
  healthAnalyzeBtn.classList.toggle("hidden", tab !== "health");

  const submitText = document.getElementById("scannerSubmitText");
  submitText.textContent = tab === "health" ? "Analyze Risk" : "Run Deep Scan";

  clearResultPanel();
  setStatus("Awaiting input", "info");

  if (tab === "health") {
    startHealthCamera();
  } else {
    stopHealthCamera();
  }
}

function bindTabs() {
  document.querySelectorAll(".scanner-tab").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
  });
}

function bindForm() {
  const form = document.getElementById("scannerForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (state.isLoading) {
      return;
    }

    const email = document.getElementById("scannerEmail").value.trim();
    const phone = document.getElementById("scannerPhone").value.trim();

    const scanMeta = SCANNER_MAP[state.activeTab];

    const result = document.getElementById("scanResult");
    setLoading(true);
    setStatus("Running deep scan and collecting risk signals...", "loading");

    try {
      let score = 0;
      let scoreLabel = "Low";
      let signals = [];

      const customer = await findCustomer(email, phone);

      if (state.activeTab === "cyber") {
        if (!email) {
          throw new Error("Email is required for cyber risk scan.");
        }

        const response = await fetch("/api/scanners/cyber-score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const cyberResult = await response.json();
        score = Number(cyberResult.score || 0);
        scoreLabel = cyberResult.scoreLabel || getScoreClass(score);
        signals = Array.isArray(cyberResult.signals)
          ? cyberResult.signals
          : [cyberResult.message || "Cyber scan completed."];
      } else if (state.activeTab === "health") {
        score = computeScanScore(state.activeTab, customer, email);
        if (state.hasHealthCapture) {
          score = Math.min(98, Number((score + 9.5).toFixed(1)));
        }
        scoreLabel = getScoreClass(score);
        signals = buildSignals(state.activeTab, customer, scoreLabel);
        signals.unshift(
          state.hasHealthCapture
            ? "Camera snapshot was analyzed for visual wellness cues."
            : "No snapshot captured. Score derived from customer profile inputs only.",
        );
      } else {
        score = computeScanScore(state.activeTab, customer, email);
        scoreLabel = getScoreClass(score);
        signals = buildSignals(state.activeTab, customer, scoreLabel);
      }

      await delay(350);

      document.getElementById("resultHeadline").textContent =
        `${scanMeta.title} Result`;
      document.getElementById("resultSummary").textContent =
        `${scoreLabel} propensity identified for ${scanMeta.pitch} conversation.`;
      document.getElementById("resultSignals").innerHTML = signals
        .map((signal) => `<li>${signal}</li>`)
        .join("");
      document.getElementById("resultScore").textContent =
        `Scan Score: ${score}`;
      document.getElementById("resultPitch").textContent =
        `Recommended Pitch: ${scanMeta.pitch}`;

      result.classList.remove("hidden");
      setStatus("Scan completed successfully.", "success");
    } catch (error) {
      setStatus(error.message || "Scan failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  });
}

function bindHealthCameraActions() {
  document.getElementById("capturePhotoBtn").addEventListener("click", () => {
    captureHealthSnapshot();
  });

  document.getElementById("retakePhotoBtn").addEventListener("click", () => {
    resetHealthCaptureUI();
  });

  document.getElementById("healthAnalyzeBtn").addEventListener("click", () => {
    document.getElementById("scannerForm").requestSubmit();
  });
}

bindTabs();
bindForm();
bindHealthCameraActions();
