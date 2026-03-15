# 🛡️ Zurich Kotak General Insurance — AI-Powered Cross-Sell/Up-Sell Intelligence Platform

An end-to-end **AI-driven insurance intelligence platform** built for Zurich Kotak General Insurance that empowers agents with real-time customer insights, personalized campaign generation, wellness risk scanners, and a customer-facing portal — all powered by **Google Gemini AI**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Pages & Modules](#pages--modules)
- [API Endpoints](#api-endpoints)
- [Deployment (AWS EC2)](#deployment-aws-ec2)
- [Demo Credentials](#demo-credentials)

---

## 🎯 Overview

This platform implements an **"Always-On Segment of One"** marketing approach for insurance cross-sell and up-sell. It uses AI to analyze individual customer profiles, identify coverage gaps, generate hyper-personalized outreach campaigns, and provide interactive wellness scanners that drive customer engagement and policy conversions.

The system serves **two distinct user types**:
1. **Agents** — Access the internal dashboard to manage customers, run scanners, generate AI campaigns, and track performance.
2. **Customers** — Access a public-facing portal with interactive wellness scanners and insurance gap assessments.

---

## ✨ Key Features

### 🏠 Agent Dashboard
- Real-time KPI metrics: total customers, cross-sell/up-sell opportunities, revenue at risk, active campaigns
- Interactive charts for top products and risk distribution (Chart.js)
- Quick access to all platform modules

### 👥 Customer Management
- Searchable, filterable customer database with 50,000+ demo profiles
- Filter by risk level, channel, customer tenure, and renewal date
- Detailed individual customer profiles with AI-generated recommendations
- Gemini AI-powered personalized pitch, cross-sell/up-sell product suggestions, and risk summaries

### 🔬 Interactive Scanners (10 Types)
| Scanner | Description |
|---------|-------------|
| 🎮 **Life Simulator** | Multi-step insurance gap assessment with gamified XP system |
| 🛡️ **Cyber Risk Base** | Checks data breach exposure via IPQS API + Gemini AI analysis |
| ❤️ **Health Scan** | Camera-based facial analysis + health risk assessment |
| 🧠 **Mind Wealth Index** | Mental wellness & financial stress quiz |
| 💪 **Emotional Resilience** | Stress coping and emotional health evaluation |
| 🍎 **Nutrition Risk** | Dietary habits and nutrition gap analysis |
| ⚡ **Metabolic Age** | Metabolic health and biological age estimation |
| 🖥️ **Ergonomic Wellness** | Workplace ergonomics and posture risk scanner |
| 🌿 **Nature Deficit** | Outdoor exposure and nature connection index |
| 🌙 **Circadian Rhythm** | Sleep quality and circadian health optimizer |

Each scanner generates a personalized score (0–100), actionable insights, and recommends relevant **Zurich Kotak General Insurance** products with direct links to [zurichkotak.com](https://www.zurichkotak.com).

### 📢 AI Nudge Campaign Engine
- **Segment filtering**: Age, income, location, policy type, risk level, occupation, gender, marital status, renewal window
- **Multi-platform delivery**: WhatsApp, Email, App, Web
- **Gemini AI content generation**: Auto-creates SMS templates, creative briefs, headlines, color palettes, and image prompts
- **Custom prompt support**: Agents can add custom instructions to guide AI generation
- **Approval workflow**: Agent → Manager approval → Launch pipeline
- **Campaign history**: Full audit trail with delivery logs and success rates

### 📊 Agent Performance Hub
- Team leaderboard with 25 agents across 10 regions
- KPIs: campaigns, messages sent, conversions (motor/health split), revenue, policies sold, NPS, renewal rate
- Monthly performance trend charts
- Region-wise breakdown visualization
- Tier-based agent classification (Elite, Gold, Silver, Bronze)

### 🌐 Customer-Facing Portal
- Public-facing page at `/customer-portal` (no login required)
- All 10 scanners available with dark-themed premium UI
- Featured scanners (Life Simulator, Cyber Risk, Health Scan) prominently displayed
- Product recommendations link directly to Zurich Kotak's website
- Mobile responsive design

### 🔐 Role-Based Authentication
- **Agent login**: Access to dashboard, customers, scanners, campaigns
- **Manager login**: Access to approval dashboard, campaign oversight, team performance
- JWT-based token authentication

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │Dashboard │ │Customers │ │Scanners  │ │  Nudge     │ │
│  │          │ │          │ │(10 types)│ │  Campaigns │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌──────────────────┐  ┌───────────────────────────┐   │
│  │Customer Portal   │  │ Agent Performance Hub     │   │
│  └──────────────────┘  └───────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────┴──────────────────────────────────┐
│                 EXPRESS.JS SERVER                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │                   API Routes                       │ │
│  │  /api/dashboard    /api/intelligence               │ │
│  │  /api/scanners     /api/nudge                      │ │
│  │  /api/auth         /api/approvals                  │ │
│  │  /api/agent-stats                                  │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │                  Services Layer                    │ │
│  │  dashboardService     customerIntelligenceService  │ │
│  │  scannerService       nudgeCampaignService         │ │
│  │  authService          approvalService              │ │
│  │  agentStatsService    contentGenerationService     │ │
│  │  campaignActivationService                         │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
  ┌─────┴─────┐               ┌───────┴──────┐
  │ Gemini AI │               │   IPQS API   │
  │ (Google)  │               │ (Cyber Scan) │
  └───────────┘               └──────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Node.js + Express.js |
| **AI Engine** | Google Gemini AI (`@google/generative-ai`) |
| **Charts** | Chart.js (CDN) |
| **Fonts** | Google Fonts (DM Serif Display, Space Grotesk) |
| **Cyber Scan API** | IPQualityScore (IPQS) |
| **Process Manager** | PM2 (production) |
| **Deployment** | AWS EC2 (Ubuntu) |
| **Data** | In-memory demo data (`demo_customers.js` — 50,000+ customer profiles) |

---

## 📁 Project Structure

```
zurichKotakFinal/
├── server.js                          # Entry point — starts Express on PORT 3000
├── package.json                       # Dependencies & scripts
├── .env                               # Environment variables (API keys)
├── demo_customers.js                  # 50,000+ demo customer profiles
│
├── api/src/
│   ├── app.js                         # Express app config, route mounting, static serving
│   │
│   ├── routes/
│   │   ├── dashboardRoutes.js         # GET /api/dashboard — KPI metrics
│   │   ├── intelligenceRoutes.js      # GET /api/customers — customer list & detail + AI recommendations
│   │   ├── scannerRoutes.js           # POST /api/scanners/scan — cyber & health scan endpoints
│   │   ├── nudgeCampaignRoutes.js     # POST /api/nudge/preview, /generate-content, /send
│   │   ├── authRoutes.js              # POST /api/auth/login, GET /api/auth/managers
│   │   ├── approvalRoutes.js          # Campaign approval workflow endpoints
│   │   └── agentStatsRoutes.js        # GET /api/agent-stats — performance hub data
│   │
│   ├── services/
│   │   ├── dashboardService.js        # Aggregates dashboard KPIs from demo data
│   │   ├── customerIntelligenceService.js  # Customer search, filtering, AI recommendations
│   │   ├── scannerService.js          # IPQS cyber scan + health scan logic
│   │   ├── nudgeCampaignService.js    # Segment filtering, preview, campaign management
│   │   ├── contentGenerationService.js # Gemini AI SMS/content generation
│   │   ├── campaignActivationService.js # Campaign launch & delivery simulation
│   │   ├── authService.js             # Login, JWT tokens, role management
│   │   ├── approvalService.js         # Manager approval workflow state machine
│   │   └── agentStatsService.js       # Agent performance demo data & aggregation
│   │
│   ├── config/                        # Configuration files
│   ├── data/                          # Static data files
│   └── utils/                         # Utility helpers
│
├── public/                            # Static frontend files
│   ├── index.html                     # Agent Dashboard (main landing page)
│   ├── login.html                     # Role-based login page (Agent/Manager)
│   ├── customers.html                 # Customer list with filters
│   ├── customers.js                   # Customer table rendering & pagination
│   ├── customer-detail.html           # Individual customer deep-dive
│   ├── customer-detail.js             # AI recommendations, risk analysis rendering
│   ├── scanners.html                  # Agent-facing scanners page (all 10 scanners)
│   ├── scanners.js                    # Scanner logic: quizzes, life sim, cyber/health scan, camera
│   ├── nudge-campaign.html            # AI Nudge Campaign builder page
│   ├── nudge-campaign.js              # Segment filter, AI generation, approval flow, campaign launch
│   ├── agent-performance.html         # Agent Performance Hub page
│   ├── agent-performance.js           # Leaderboard, KPI cards, trend charts rendering
│   ├── customer-portal.html           # Public customer-facing scanner portal
│   ├── auth.js                        # Frontend JWT auth helper (login/logout/role checks)
│   ├── app.js                         # Dashboard chart initialization (Chart.js)
│   └── styles.css                     # Complete design system (~45KB, dark theme, glassmorphism)
│
└── scripts/                           # Helper scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and **npm**
- **Google Gemini API Key** (for AI features)
- **IPQS API Key** (for Cyber Risk Scanner)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Ajeeth-07/zurichKotakHackathon.git
cd zurichKotakHackathon

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env and add your API keys (see below)

# 4. Start the server
npm start
```

The application will be available at **http://localhost:3000**

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_google_gemini_api_key
IPQS_API_KEY=your_ipqualityscore_api_key
```

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google Generative AI API key for AI recommendations, content generation, and scanner insights |
| `IPQS_API_KEY` | ✅ Yes | IPQualityScore API key for cyber risk / data breach scanning |

---

## 📄 Pages & Modules

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | Dashboard | Agent/Manager | Main dashboard with KPI metrics and charts |
| `/login` | Login | Public | Role-based authentication (Agent or Manager) |
| `/customers` | Customer List | Agent/Manager | Searchable, filterable customer database |
| `/customers/:id` | Customer Detail | Agent/Manager | Individual profile with AI-powered recommendations |
| `/scanners` | Scanners (Agent) | Agent | All 10 interactive scanners with agent insights panel |
| `/nudge-campaigns` | Nudge Campaigns | Agent/Manager | AI campaign builder with approval workflow |
| `/agent-performance` | Performance Hub | Agent/Manager | Team leaderboard, conversion metrics, trends |
| `/customer-portal` | Customer Portal | **Public** | Customer-facing scanners (no auth required) |

---

## 🔌 API Endpoints

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Returns KPI metrics for the agent dashboard |

### Customer Intelligence
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/customers` | List/search customers with filters (risk, channel, tenure, renewal) |
| `GET` | `/api/customers/:id` | Get detailed customer profile |
| `GET` | `/api/intelligence/recommendations/:id` | Get AI-generated cross-sell/up-sell recommendations for a customer |

### Scanners
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scanners/scan` | Run a cyber risk or health vulnerability scan |

### Nudge Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/nudge/filters` | Get available filter options (locations, policies, occupations) |
| `POST` | `/api/nudge/preview` | Preview a customer segment based on filters |
| `POST` | `/api/nudge/generate-content` | Generate AI-powered SMS templates with Gemini |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Authenticate agent or manager, returns JWT token |
| `GET` | `/api/auth/managers` | List available managers for campaign approvals |

### Approvals
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/approvals/submit` | Submit a campaign for manager approval |
| `GET` | `/api/approvals/my-requests` | Get all approval requests (filtered by role) |
| `POST` | `/api/approvals/requests/:id/approve` | Manager approves a campaign |
| `POST` | `/api/approvals/requests/:id/deny` | Manager denies a campaign |
| `POST` | `/api/approvals/requests/:id/launch` | Launch an approved campaign |

### Agent Performance
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agent-stats` | Returns agent leaderboard, KPIs, trends, and region data |

---

## ☁️ Deployment (AWS EC2)

### Quick Deploy

```bash
# 1. SSH into your EC2 instance
ssh -i "zurich-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# 2. Install dependencies
sudo apt update && sudo apt install -y nodejs npm git
sudo npm install -g pm2

# 3. Clone and setup
git clone https://github.com/Ajeeth-07/zurichKotakHackathon.git
cd zurichKotakHackathon
npm install

# 4. Set environment variables
echo 'IPQS_API_KEY=your_ipqs_key
GEMINI_API_KEY=your_gemini_key' > .env

# 5. Start with PM2
pm2 start server.js --name zurich-app

# 6. (Optional) Forward port 80 → 3000
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000
```

**Security Group Inbound Rules Required:**
| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP | SSH access |
| 80 | TCP | 0.0.0.0/0 | HTTP (if using port forwarding) |
| 443 | TCP | 0.0.0.0/0 | HTTPS (future) |
| 3000 | TCP | 0.0.0.0/0 | Direct app access |

---

## 🔐 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Agent | `rahul.sharma` | `agent123` |
| Manager | `vikram.mehra` | `mgr123` |

---

## 📊 Demo Data

The platform ships with **50,000+ realistic customer profiles** in `demo_customers.js`, each containing:
- Demographics (age, gender, income, occupation, marital status, location)
- Policy portfolio (motor, health, travel, home, cyber)
- Claims history with amounts and dates
- Risk profiling (Low / Medium / High)
- Cross-sell and up-sell propensity scores
- Behavioral attributes (preferred channel, customer tenure)
- Nearest renewal dates

The **Agent Performance Hub** includes demo data for 25 agents across 10 Indian cities with realistic metrics:
- **7,200 total campaigns** generating **360,000 messages**
- **3,600 policies sold** at **₹2,000 average premium**
- Conversion rates between **3–7%**
- Motor and Health conversion split tracking

---

## 🎨 Design Philosophy

- **Premium dark theme** with glassmorphism effects
- **Gradient-driven UI** with subtle micro-animations
- **Mobile-responsive** across all pages
- **Google Fonts** (DM Serif Display for headings, Space Grotesk for body)
- **Gamified elements** (XP badges in Life Simulator, tier badges for agents)
- **Chart.js** visualizations for data-heavy pages

---

## 📜 License

This project was built for the **Zurich Kotak General Insurance Hackathon**.

---

*Built with ❤️ using Node.js, Express, and Google Gemini AI*
