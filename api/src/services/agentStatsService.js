// ═══════════════════════════════════════════════════
// Agent Performance Hub — Demo Data & Service
// ═══════════════════════════════════════════════════

const AGENTS = [
  { id:1, name:"Rahul Sharma", avatar:"RS", region:"Mumbai", level:"Elite", tier:4, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:89.2, avgDealSize:2000, nps:92, activeSince:"2019-03-15" },
  { id:2, name:"Priya Nair", avatar:"PN", region:"Chennai", level:"Gold", tier:3, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:87.5, avgDealSize:2000, nps:88, activeSince:"2020-07-01" },
  { id:3, name:"Vikram Patel", avatar:"VP", region:"Delhi", level:"Elite", tier:4, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:91.4, avgDealSize:2000, nps:94, activeSince:"2018-11-20" },
  { id:4, name:"Ananya Deshmukh", avatar:"AD", region:"Pune", level:"Silver", tier:2, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:82.1, avgDealSize:2000, nps:79, activeSince:"2022-01-10" },
  { id:5, name:"Karthik Iyer", avatar:"KI", region:"Bangalore", level:"Gold", tier:3, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:86.3, avgDealSize:2000, nps:86, activeSince:"2020-04-22" },
  { id:6, name:"Meera Joshi", avatar:"MJ", region:"Mumbai", level:"Elite", tier:4, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:90.8, avgDealSize:2000, nps:93, activeSince:"2019-06-05" },
  { id:7, name:"Arjun Reddy", avatar:"AR", region:"Hyderabad", level:"Gold", tier:3, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:85.7, avgDealSize:2000, nps:84, activeSince:"2021-02-14" },
  { id:8, name:"Sneha Kulkarni", avatar:"SK", region:"Pune", level:"Silver", tier:2, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:80.4, avgDealSize:2000, nps:76, activeSince:"2022-08-30" },
  { id:9, name:"Deepak Menon", avatar:"DM", region:"Kochi", level:"Gold", tier:3, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:87.9, avgDealSize:2000, nps:87, activeSince:"2020-09-12" },
  { id:10, name:"Ritu Verma", avatar:"RV", region:"Delhi", level:"Silver", tier:2, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:83.2, avgDealSize:2000, nps:80, activeSince:"2021-11-01" },
  { id:11, name:"Suresh Bhat", avatar:"SB", region:"Ahmedabad", level:"Bronze", tier:1, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:75.3, avgDealSize:2000, nps:71, activeSince:"2023-05-20" },
  { id:12, name:"Kavya Raghavan", avatar:"KR", region:"Bangalore", level:"Elite", tier:4, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:90.1, avgDealSize:2000, nps:91, activeSince:"2019-01-08" },
  { id:13, name:"Nikhil Gupta", avatar:"NG", region:"Jaipur", level:"Silver", tier:2, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:81.8, avgDealSize:2000, nps:77, activeSince:"2022-03-15" },
  { id:14, name:"Pooja Saxena", avatar:"PS", region:"Lucknow", level:"Bronze", tier:1, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:73.5, avgDealSize:2000, nps:68, activeSince:"2024-01-10" },
  { id:15, name:"Rajesh Kumar", avatar:"RK", region:"Kolkata", level:"Gold", tier:3, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:88.1, avgDealSize:2000, nps:85, activeSince:"2020-05-18" },
  { id:16, name:"Aisha Khan", avatar:"AK", region:"Mumbai", level:"Silver", tier:2, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:84.6, avgDealSize:2000, nps:82, activeSince:"2021-08-22" },
  { id:17, name:"Manish Tiwari", avatar:"MT", region:"Indore", level:"Bronze", tier:1, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:76.2, avgDealSize:2000, nps:72, activeSince:"2023-02-28" },
  { id:18, name:"Divya Pillai", avatar:"DP", region:"Kochi", level:"Gold", tier:3, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:86.8, avgDealSize:2000, nps:86, activeSince:"2020-12-01" },
  { id:19, name:"Harsh Vardhan", avatar:"HV", region:"Delhi", level:"Elite", tier:4, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:89.7, avgDealSize:2000, nps:90, activeSince:"2019-09-14" },
  { id:20, name:"Tanvi Mishra", avatar:"TM", region:"Nagpur", level:"Silver", tier:2, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:82.5, avgDealSize:2000, nps:78, activeSince:"2022-04-07" },
  { id:21, name:"Sameer Patil", avatar:"SP", region:"Pune", level:"Gold", tier:3, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:87.3, avgDealSize:2000, nps:85, activeSince:"2020-08-19" },
  { id:22, name:"Nisha Agarwal", avatar:"NA", region:"Kolkata", level:"Bronze", tier:1, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:74.1, avgDealSize:2000, nps:69, activeSince:"2023-09-05" },
  { id:23, name:"Ajay Shetty", avatar:"AS", region:"Bangalore", level:"Silver", tier:2, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:83.9, avgDealSize:2000, nps:81, activeSince:"2021-06-12" },
  { id:24, name:"Lakshmi Narayan", avatar:"LN", region:"Chennai", level:"Gold", tier:3, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:88.4, avgDealSize:2000, nps:87, activeSince:"2020-02-28" },
  { id:25, name:"Omkar Jha", avatar:"OJ", region:"Patna", level:"Bronze", tier:1, campaigns:288, messages:14400, conversions:152, conversionsMotor:68, conversionsHealth:84, revenue:288000, policiesSold:144, renewalRate:71.8, avgDealSize:2000, nps:65, activeSince:"2024-06-01" },
];

// Monthly performance trends (last 6 months)
const MONTHLY_TRENDS = [
  { month:"Oct 2025", campaigns:1100, messages:55000, revenue:1100000, conversions:578, conversionsMotor:260, conversionsHealth:318, newPolicies:550 },
  { month:"Nov 2025", campaigns:1150, messages:57500, revenue:1150000, conversions:605, conversionsMotor:272, conversionsHealth:333, newPolicies:575 },
  { month:"Dec 2025", campaigns:1050, messages:52500, revenue:1050000, conversions:552, conversionsMotor:248, conversionsHealth:304, newPolicies:525 },
  { month:"Jan 2026", campaigns:1250, messages:62500, revenue:1250000, conversions:657, conversionsMotor:295, conversionsHealth:362, newPolicies:625 },
  { month:"Feb 2026", campaigns:1350, messages:67500, revenue:1350000, conversions:710, conversionsMotor:319, conversionsHealth:391, newPolicies:675 },
  { month:"Mar 2026", campaigns:1300, messages:65000, revenue:1300000, conversions:684, conversionsMotor:307, conversionsHealth:377, newPolicies:650 },
];

function getAgentStats() {
  const sorted = [...AGENTS].sort((a,b) => b.revenue - a.revenue);
  const totalRevenue = AGENTS.reduce((s,a) => s + a.revenue, 0);
  const totalCampaigns = AGENTS.reduce((s,a) => s + a.campaigns, 0);
  const totalConversions = AGENTS.reduce((s,a) => s + a.conversions, 0);
  const totalConversionsMotor = AGENTS.reduce((s,a) => s + a.conversionsMotor, 0);
  const totalConversionsHealth = AGENTS.reduce((s,a) => s + a.conversionsHealth, 0);
  const totalPolicies = AGENTS.reduce((s,a) => s + a.policiesSold, 0);
  const totalMessages = AGENTS.reduce((s,a) => s + (a.messages || 0), 0);
  const avgNps = (AGENTS.reduce((s,a) => s + a.nps, 0) / AGENTS.length).toFixed(1);
  const avgRenewal = (AGENTS.reduce((s,a) => s + a.renewalRate, 0) / AGENTS.length).toFixed(1);

  // Region breakdown
  const regionMap = {};
  AGENTS.forEach(a => {
    if (!regionMap[a.region]) regionMap[a.region] = { revenue:0, agents:0, conversions:0, conversionsMotor:0, conversionsHealth:0 };
    regionMap[a.region].revenue += a.revenue;
    regionMap[a.region].agents += 1;
    regionMap[a.region].conversions += a.conversions;
  });
  const regionBreakdown = Object.entries(regionMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a,b) => b.revenue - a.revenue);

  // Tier distribution
  const tierDist = [
    { name:"Elite (Tier 4)", count: AGENTS.filter(a => a.tier===4).length },
    { name:"Gold (Tier 3)", count: AGENTS.filter(a => a.tier===3).length },
    { name:"Silver (Tier 2)", count: AGENTS.filter(a => a.tier===2).length },
    { name:"Bronze (Tier 1)", count: AGENTS.filter(a => a.tier===1).length },
  ];

  return {
    summary: { totalRevenue, totalCampaigns, totalMessages, totalConversions, totalConversionsMotor, totalConversionsHealth, totalPolicies, avgNps:Number(avgNps), avgRenewal:Number(avgRenewal), totalAgents:AGENTS.length },
    leaderboard: sorted,
    trends: MONTHLY_TRENDS,
    regionBreakdown,
    tierDistribution: tierDist,
    topPerformers: sorted.slice(0,5),
  };
}

module.exports = { getAgentStats };
