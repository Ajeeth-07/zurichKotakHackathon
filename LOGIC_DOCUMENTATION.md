# 🧠 Zurich Kotak Intelligence Platform — Logic & Scoring Documentation

This document explains the technical logic, calculation methodologies, and scoring systems used across every page and module in the Zurich Kotak General Insurance Cross-Sell/Up-Sell platform.

---

## 1. Agent Dashboard (`/`)

**Purpose:** Provide a real-time snapshot of the agent's opportunity landscape.

**Logic & Calculations:**
*   **Total Customers:** A direct count of all profiles in the `demo_customers.js` database.
*   **Cross-Sell/Up-Sell Opportunities:** Calculated by iterating through all customers who fall into the "High" propensity bucket (score > 70) for either cross-sell or up-sell.
*   **Revenue at Risk:** A sum of the `premiumAmount` of all policies belonging to customers whose `nearestRenewal` date is within the next 30 days and whose `churnRisk` is "High".
*   **Active Campaigns:** A count of all campaigns in the "launched" state.
*   **Charts (Chart.js):**
    *   *Top Products:* Aggregates the `recommendedProduct` fields from all High-propensity customers.
    *   *Risk Distribution:* Groups total customers into Low (0-40), Medium (41-70), and High (71-100) risk buckets based on their weighted risk score.

---

## 2. Customer Intelligence (`/customers` & `/customers/:id`)

**Purpose:** Manage customer profiles and display AI-driven insights.

**Data Source:** `demo_customers.js` (50,000+ realistic records).

**Filtering Logic:**
*   Filters act as an `AND` intersection. A customer must match the selected Risk Level AND Channel AND Tenure AND Renewal window to be displayed.
*   *Pagination:* The backend returns 50 records per page.

**AI Personalized Pitch Logic (`/api/intelligence/recommendations/:id`):**
1.  The backend extracts the specific customer's profile (age, income, existing policies, claims, risk tier).
2.  This structured data is passed to the **Google Gemini AI API** via an advanced system prompt.
3.  Gemini analyzes the gaps (e.g., "Customer has Motor but no Health cover, high income, recently turned 45").
4.  Gemini returns a highly personalized, conversational pitch designed specifically for the agent to use in human-to-human interactions.

---

## 3. Interactive Web Scanners (`/scanners` & `/customer-portal`)

The platform features 10 distinct scanners. All scanners generate a normalized score between **0 and 100**, where a higher score generally indicates higher risk or a wider coverage gap.

### A. API-Driven Scanners
**🛡️ Cyber Risk Base:**
*   **Input:** Email and Phone Number.
*   **Logic:** The backend (`scannerService") hits the external **IPQualityScore (IPQS) API**. It checks if the email/phone has been involved in recent data breaches, spam traps, or dark web leaks.
*   **Scoring:** 
    *   Base score from IPQS (0-100).
    *   If a breach is found, the score instantly jumps above 80.
    *   Result displays the specific domains where data was leaked.

**❤️ Health Scan (Facial Sentiment):**
*   **Input:** Webcam snapshot (HTML5 `<video>` and `<canvas>`).
*   **Logic:** The frontend captures a frame and sends a base64 string to the backend. The backend uses Google Gemini Vision to analyze visual cues (e.g., dark circles, skin tone, perceived fatigue).
*   **Scoring:** 
    *   AI Analysis (+/- 20 points).
    *   Combined with the customer's base demographic risk to generate a final Vulnerability Score (0-100).

### B. Gamified / Quiz-Based Scanners 
*(Life Simulator, Mind Wealth, Emotional Resilience, Nutrition, Metabolic, Ergonomic, Nature Deficit, Circadian)*

*   **Logic Structure:** Each quiz consists of 5 multi-choice questions.
*   **Weighting System:** Every answer choice carries a specific weight (e.g., `value: 1`, `value: 3`, `value: 5`).
*   **Score Calculation:**
    1.  User selects an answer. The system accumulates the raw score.
    2.  `Total Raw Score = Sum(Q1 to Q5)`
    3.  The Raw Score is normalized to a 0-100 scale: `Final Score = (Raw Score / Max Possible Raw Score) * 100`.
*   **Life Simulator Specifics:**
    *   *XP System:* As users answer questions, an "XP" counter increases (gamification).
    *   *Branching Logic:* "Sub-questions" appear based on specific answers (e.g., answering "Yes" to "Do you own a car?" triggers "How old is your car?").
*   **Product Mapping:** The final score determines the risk tier (Low, Medium, High). The frontend `scanners.js` maps this tier to specific Zurich Kotak products defined in the `ZURICH_PRODUCTS` dictionary.

---

## 4. AI Nudge Campaigns (`/nudge-campaigns`)

**Purpose:** Generate AI content and distribute multi-channel campaigns to targeted segments.

**Logic & Workflow:**
1.  **Segmentation:** The user applies demographic filters. The backend (`nudgeCampaignService`) runs an array `.filter()` against the 50,000+ database to return an exact target list and total count.
2.  **AI Content Generation (`/generate-content`):**
    *   The segment summary (Avg age, income, locations) + **Agent's Custom Prompt** (from the UI text box) are sent to Gemini.
    *   Gemini generates a JSON payload containing:
        *   3 SMS templates (A/B testing variations).
        *   A creative brief (Headline, tone, color palette, DALL-E/Midjourney image prompt).
3.  **Approval Workflow (`approvalService`):**
    *   State machine: `Draft -> Pending Review -> Approved/Changes Requested/Denied -> Launched`.
    *   Agents submit a campaign to a specific Manager ID.
    *   Managers log in, see their queue, and can approve or deny with notes.
4.  **Campaign Launch:**
    *   Once launched, the system generates a simulated "Delivery Log". 
    *   *Math:* Delivery rate is randomized between 92% and 98%. Failed messages are logged with generic carrier errors to simulate real-world conditions.

---

## 5. Agent Performance Hub (`/agent-performance`)

**Purpose:** Unify team metrics and visualize conversion trends.

**Data Source Framework:** 
The backend (`agentStatsService`) mathematically generates 25 highly realistic agent profiles based on exact aggregate targets defined by the business:

*   **Global Targets Set:**
    *   Total Campaigns: 7,200
    *   Total Messages Sent: 360,000 (Exactly 50 messages per campaign)
    *   Conversion Rate constraint: Must fall between 3.0% and 7.0% globally.
    *   Total Policies Sold: 3,600 (Exactly 1% of total messages).
    *   Average Premium constraint: ₹2,000 per policy.
    *   Total Revenue Target: ₹7,200,000.

**Calculation Logic per Agent:**
1.  **Messages:** A random slice of the 360k total is assigned to an agent based on a weighted distribution curve.
2.  **Campaigns:** `Messages / 50`.
3.  **Policies Sold:** A randomized slice of the 3.6k total policies, maintaining the 3-7% conversion bound per agent relative to their campaign touches.
4.  **Split:** Policies are randomly split into `healthSold` (approx 60%) and `motorSold` (approx 40%).
5.  **Revenue:** `Policies Sold * ₹2,000` (with slight procedural noise +/- 5% for realism).
6.  **Leaderboard Ranking:** The array is natively sorted `agentData.sort((a,b) => b.revenue - a.revenue)` before being served to the frontend.

---

## 6. Access Control & Roles (JWT)

**Logic:**
*   Dummy credentials (`rahul.sharma` / `vikram.mehra`) check against a hardcoded array in `authService`.
*   A cryptographically signed **JSON Web Token (JWT)** is generated with a `{ role: 'agent' }` or `{ role: 'manager' }` payload.
*   The token is stored in the browser's `localStorage`.
*   Every API request to protected routes passes the token in the `Authorization: Bearer <token>` header.
*   The UI (`auth.js`) automatically hides/shows DOM elements (like the Manager Approval section) based on the decoded JWT role on page load.
