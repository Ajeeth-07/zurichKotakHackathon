const https = require("https");

function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error("Unable to parse IPQS response"));
          }
        });
      })
      .on("error", (error) => reject(error));
  });
}

function deriveCyberScore(ipqsResponse) {
  if (!ipqsResponse?.success) {
    return 12;
  }

  let score = ipqsResponse.exposed ? 82 : 24;

  if (Array.isArray(ipqsResponse.source)) {
    score += Math.min(12, ipqsResponse.source.length * 2);
  }

  if (ipqsResponse.plain_text_password) {
    score += 6;
  }

  return Math.max(10, Math.min(98, Number(score.toFixed(1))));
}

function buildCyberSignals(ipqsResponse, email) {
  if (!ipqsResponse?.success) {
    return [
      `IPQS returned: ${ipqsResponse?.message || "Unable to scan this email at the moment."}`,
      "Verify email format and available API credits.",
      "Use fallback advisory flow and retry the cyber scan.",
    ];
  }

  const signals = [];

  signals.push(
    ipqsResponse.exposed
      ? `Email ${email} appears in leaked datasets.`
      : `No leak exposure found for ${email}.`,
  );

  if (Array.isArray(ipqsResponse.source) && ipqsResponse.source.length > 0) {
    const sourcePreview = ipqsResponse.source.slice(0, 3).join(", ");
    signals.push(
      `Leak sources: ${sourcePreview}${ipqsResponse.source.length > 3 ? ", ..." : ""}`,
    );
  }

  if (ipqsResponse.first_seen?.human) {
    signals.push(`First seen: ${ipqsResponse.first_seen.human}`);
  }

  if (ipqsResponse.plain_text_password) {
    signals.push(
      "Plain-text password exposure detected. Immediate cyber cover pitch recommended.",
    );
  }

  return signals;
}

async function getCyberRiskAssessment(email) {
  const apiKey = process.env.IPQS_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message: "IPQS_API_KEY is not configured on the server.",
      score: 0,
      scoreLabel: "Unavailable",
      signals: [
        "Set IPQS_API_KEY in environment variables and restart backend.",
      ],
      exposed: null,
      source: [],
    };
  }

  const safeEmail = encodeURIComponent(String(email || "").trim());
  const url = `https://www.ipqualityscore.com/api/json/leaked/email/${apiKey}/${safeEmail}`;

  const ipqsResponse = await httpsGetJson(url);
  console.log(ipqsResponse);
  const score = deriveCyberScore(ipqsResponse);
  const scoreLabel = score >= 75 ? "High" : score >= 50 ? "Medium" : "Low";

  return {
    success: Boolean(ipqsResponse.success),
    message: ipqsResponse.message || "Success",
    score,
    scoreLabel,
    exposed: Boolean(ipqsResponse.exposed),
    firstSeen: ipqsResponse.first_seen || null,
    plainTextPassword: Boolean(ipqsResponse.plain_text_password),
    requestId: ipqsResponse.request_id || null,
    signals: buildCyberSignals(ipqsResponse, email),
  };
}

module.exports = {
  getCyberRiskAssessment,
};
