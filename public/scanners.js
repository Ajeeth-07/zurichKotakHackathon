// ═══════════════════════════════════════════════════
// SCANNERS.JS — Cyber/Health + Wellness Quiz + Life Sim
// ═══════════════════════════════════════════════════

const SCANNER_MAP = {
  cyber: { title:"Cyber Risk Assessment", description:"Check if your data has been compromised and discover the right cyber protection cover.", product:"Zurich Kotak Cyber Insurance" },
  health: { title:"Health Vulnerability Scan", description:"Evaluate your wellness and medical indicators to find the ideal health coverage for you.", product:"Zurich Kotak Health Insurance" },
};

const ZURICH_PRODUCTS = {
  health360:     { name:"Health 360", type:"Comprehensive Health", url:"https://www.zurichkotak.com/health-insurance" },
  premier:       { name:"Kotak Health Premier", type:"Premium Health", url:"https://www.zurichkotak.com/health-insurance" },
  secureShield:  { name:"Kotak Secure Shield", type:"Critical Illness", url:"https://www.zurichkotak.com/health-insurance" },
  superTopup:    { name:"Health Super Top-up", type:"Top-up Cover", url:"https://www.zurichkotak.com/health-insurance" },
  accidentCare:  { name:"Kotak Accident Care", type:"Personal Accident", url:"https://www.zurichkotak.com/health-insurance" },
  travel:        { name:"Travel Insurance", type:"Travel Protection", url:"https://www.zurichkotak.com/travel-insurance" },
  carSecure:     { name:"Car Secure", type:"Motor Insurance", url:"https://www.zurichkotak.com/car-insurance" },
};

// ─── Wellness Scanner Configs ──────────────────────
const WELLNESS = {
  mind: {
    title:"🧠 Mind Wealth Index", desc:"Assess your mental wellness — stress, sleep, and emotional resilience.",
    questions:[
      { q:"How often do you feel overwhelmed by daily responsibilities?", opts:[
        {t:"Rarely — I manage well",icon:"😊",score:10},{t:"Sometimes — manageable stress",icon:"😐",score:20},{t:"Often — it affects my mood",icon:"😟",score:35},{t:"Almost daily — I feel burned out",icon:"😰",score:50}]},
      { q:"How would you rate your sleep quality over the past month?", opts:[
        {t:"Excellent — 7-8 hours restful sleep",icon:"😴",score:5},{t:"Good — occasional disruptions",icon:"🌙",score:15},{t:"Fair — frequently wake up tired",icon:"😪",score:30},{t:"Poor — chronic insomnia",icon:"⚠️",score:45}]},
      { q:"How do you typically cope with stressful situations?", opts:[
        {t:"Exercise, meditation, or hobbies",icon:"🧘",score:5},{t:"Talk to friends or family",icon:"💬",score:10},{t:"Avoid or suppress feelings",icon:"🙈",score:30},{t:"Rely on substances or binge habits",icon:"🍷",score:45}]},
      { q:"How often do you experience anxiety about the future?", opts:[
        {t:"Rarely — I feel optimistic",icon:"🌟",score:5},{t:"Occasionally — but it passes",icon:"🤔",score:15},{t:"Frequently — it disrupts my focus",icon:"😰",score:35},{t:"Constantly — it's overwhelming",icon:"😱",score:50}]},
      { q:"How connected do you feel to a support network?", opts:[
        {t:"Very — strong family & friends",icon:"🤗",score:5},{t:"Somewhat — a few close people",icon:"👋",score:12},{t:"Isolated — limited connections",icon:"😔",score:30},{t:"Completely alone",icon:"🏚️",score:45}]},
    ],
    insights: (s)=> s>70?[
      {icon:"🚨",title:"High Stress Alert",desc:"Your stress levels indicate burnout risk. Consider professional support."},
      {icon:"💊",title:"Sleep Health",desc:"Poor sleep compounds mental health issues. A sleep assessment is recommended."},
    ]:s>40?[
      {icon:"⚡",title:"Moderate Stress",desc:"Your stress is manageable but trending upward. Build resilience habits."},
      {icon:"🧘",title:"Mindfulness",desc:"Regular meditation can reduce anxiety by 40%. Try 10 minutes daily."},
    ]:[
      {icon:"✅",title:"Strong Resilience",desc:"Great mental wellness! Keep nurturing your coping strategies."},
      {icon:"🌟",title:"Wellness Leader",desc:"Your emotional health is a strength — share practices with family."},
    ],
    policies: (s)=> s>60?[
      {p:"secureShield",reason:"High stress increases critical illness risk — protect with Secure Shield."},
      {p:"health360",reason:"Comprehensive coverage including mental wellness consultations."},
    ]:s>35?[
      {p:"health360",reason:"Stay proactive with Health 360's wellness benefits and annual check-ups."},
      {p:"superTopup",reason:"Top-up your existing cover for unexpected health expenses."},
    ]:[
      {p:"health360",reason:"Maintain your wellness advantage with Health 360's preventive care."},
    ],
  },
  emotional: {
    title:"💪 Emotional Resilience Coach", desc:"Track emotional patterns and build personalised resilience programmes.",
    questions:[
      { q:"When faced with a setback, how quickly do you bounce back?", opts:[
        {t:"Within hours — I adapt fast",icon:"⚡",score:5},{t:"A day or two",icon:"🔄",score:15},{t:"Takes a week or more",icon:"📅",score:30},{t:"I struggle to recover",icon:"💔",score:45}]},
      { q:"How often do you practice gratitude or positive reflection?", opts:[
        {t:"Daily — it's a habit",icon:"🙏",score:5},{t:"Weekly",icon:"📝",score:12},{t:"Rarely",icon:"🤷",score:25},{t:"Never thought about it",icon:"❌",score:40}]},
      { q:"How do you handle conflict in relationships?", opts:[
        {t:"Communicate openly and resolve",icon:"🗣️",score:5},{t:"Compromise but feel drained",icon:"🤝",score:15},{t:"Avoid confrontation",icon:"🙈",score:30},{t:"React emotionally — regret later",icon:"💥",score:42}]},
      { q:"How would you describe your overall emotional state recently?", opts:[
        {t:"Balanced and content",icon:"😌",score:5},{t:"Mostly okay with some lows",icon:"🌤️",score:15},{t:"Frequent mood swings",icon:"🎢",score:32},{t:"Persistently low or numb",icon:"🌧️",score:48}]},
      { q:"Do you feel in control of your emotional responses?", opts:[
        {t:"Yes — I'm self-aware",icon:"🎯",score:5},{t:"Mostly — occasional slip-ups",icon:"👌",score:12},{t:"Struggling — emotions drive decisions",icon:"😤",score:30},{t:"No — I feel out of control",icon:"🌀",score:48}]},
    ],
    insights: (s)=> s>65?[
      {icon:"🧠",title:"Emotional Burnout Risk",desc:"Your resilience is depleted. Building coping mechanisms is critical."},
      {icon:"📉",title:"Impact on Health",desc:"Chronic emotional stress increases cardiovascular and immune risks."},
    ]:s>35?[
      {icon:"💪",title:"Building Resilience",desc:"You have a foundation — weekly journaling and exercise will strengthen it."},
      {icon:"🌱",title:"Growth Opportunity",desc:"Resilience coaching programmes show 60% improvement in 8 weeks."},
    ]:[
      {icon:"🏆",title:"High Resilience",desc:"Excellent emotional intelligence. You handle adversity with maturity."},
      {icon:"❤️",title:"Emotional Wealth",desc:"Your emotional stability is a health asset — it reduces chronic disease risk."},
    ],
    policies: (s)=> s>55?[
      {p:"secureShield",reason:"Emotional burnout raises critical illness risk — Secure Shield offers protection."},
      {p:"premier",reason:"Premium health cover with mental wellness and specialist access."},
    ]:[
      {p:"health360",reason:"Health 360 covers preventive wellness — a great match for your profile."},
    ],
  },
  nutrition: {
    title:"🍎 Nutrition Risk Intelligence", desc:"Map nutritional gaps to disease risks and get personalised diet insights.",
    questions:[
      { q:"How many servings of fruits & vegetables do you eat daily?", opts:[
        {t:"5+ servings — I eat very healthy",icon:"🥗",score:5},{t:"3-4 servings",icon:"🍎",score:12},{t:"1-2 servings",icon:"🍕",score:28},{t:"Almost none",icon:"🍔",score:45}]},
      { q:"How often do you consume processed or junk food?", opts:[
        {t:"Rarely — I cook fresh meals",icon:"👨‍🍳",score:5},{t:"1-2 times per week",icon:"🍟",score:15},{t:"3-5 times per week",icon:"🌭",score:30},{t:"Daily — it's most of my diet",icon:"⚠️",score:48}]},
      { q:"How much water do you drink daily?", opts:[
        {t:"3+ litres — well hydrated",icon:"💧",score:5},{t:"2-3 litres",icon:"🥤",score:10},{t:"1-2 litres",icon:"😐",score:25},{t:"Less than 1 litre",icon:"🏜️",score:40}]},
      { q:"Do you take any dietary supplements?", opts:[
        {t:"Yes — targeted supplements based on tests",icon:"💊",score:5},{t:"Yes — general multivitamins",icon:"🔬",score:10},{t:"Occasionally",icon:"🤷",score:20},{t:"No — I don't believe in them",icon:"❌",score:30}]},
      { q:"How often do you skip meals?", opts:[
        {t:"Never — I eat 3 regular meals",icon:"🍽️",score:5},{t:"Skip breakfast sometimes",icon:"⏰",score:15},{t:"Frequently skip 1-2 meals",icon:"😣",score:30},{t:"Often eat just once a day",icon:"⚠️",score:45}]},
    ],
    insights: (s)=> s>60?[
      {icon:"🚨",title:"High Nutritional Risk",desc:"Significant gaps in essential nutrients. Risk of anaemia, bone issues, and immunity problems."},
      {icon:"🍎",title:"Diet Overhaul Needed",desc:"Processed food dependency increases cardiac and diabetes risk by 3x."},
    ]:s>30?[
      {icon:"📊",title:"Moderate Gaps",desc:"Some nutritional improvements needed — focus on iron and calcium intake."},
      {icon:"🥬",title:"Boost Greens",desc:"Adding 2 more servings of vegetables daily cuts health risks by 25%."},
    ]:[
      {icon:"✅",title:"Excellent Nutrition",desc:"Your diet supports strong immunity and long-term health."},
      {icon:"💪",title:"Disease Prevention",desc:"Good nutrition reduces chronic disease risk significantly."},
    ],
    policies: (s)=> s>55?[
      {p:"health360",reason:"Nutritional gaps increase disease risk — Health 360 covers diagnostics & treatments."},
      {p:"secureShield",reason:"Protect against critical illnesses linked to poor nutrition."},
    ]:[
      {p:"superTopup",reason:"Top-up cover for any unexpected health costs despite your healthy lifestyle."},
    ],
  },
  metabolic: {
    title:"⚡ Metabolic Age Calculator", desc:"Discover the gap between your real age and biological age.",
    questions:[
      { q:"How many minutes of physical exercise do you get per week?", opts:[
        {t:"150+ min — very active",icon:"🏃",score:5},{t:"60-150 min — moderate",icon:"🚶",score:15},{t:"Under 60 min — mostly sedentary",icon:"🪑",score:32},{t:"Almost zero physical activity",icon:"🛋️",score:48}]},
      { q:"What is your approximate BMI range?", opts:[
        {t:"Normal (18.5-24.9)",icon:"✅",score:5},{t:"Slightly overweight (25-29.9)",icon:"📊",score:18},{t:"Obese (30-34.9)",icon:"⚠️",score:35},{t:"Severely obese (35+)",icon:"🚨",score:48}]},
      { q:"How often do you consume alcohol?", opts:[
        {t:"Never or rarely",icon:"🚫",score:5},{t:"Socially — 1-2 times/month",icon:"🍷",score:12},{t:"Weekly — 2-3 times",icon:"🍺",score:28},{t:"Daily",icon:"⚠️",score:42}]},
      { q:"Do you smoke or use tobacco?", opts:[
        {t:"Never",icon:"🚭",score:5},{t:"Quit more than 2 years ago",icon:"✅",score:10},{t:"Quit recently / occasional",icon:"😐",score:28},{t:"Regular smoker",icon:"🚬",score:48}]},
      { q:"When was your last comprehensive health check-up?", opts:[
        {t:"Within last 6 months",icon:"🏥",score:5},{t:"6-12 months ago",icon:"📅",score:12},{t:"1-2 years ago",icon:"🤔",score:25},{t:"Can't remember / never",icon:"❌",score:40}]},
    ],
    insights: (s)=> {
      const gap = Math.round(s/5);
      return s>60?[
        {icon:"⏰",title:`Metabolic Age +${gap} years`,desc:`Your body functions as if you're ${gap} years older. Immediate lifestyle changes needed.`},
        {icon:"🫀",title:"Cardiovascular Risk",desc:"Sedentary lifestyle and habits significantly elevate heart disease risk."},
      ]:s>30?[
        {icon:"📊",title:`Metabolic Age +${gap} years`,desc:`Your biological age is slightly higher. Exercise and diet improvements will help.`},
        {icon:"🔄",title:"Reversible",desc:"With consistent effort, metabolic age can be reduced by 5-8 years in 6 months."},
      ]:[
        {icon:"🎉",title:"Metabolic Youth",desc:"Your biological age matches or beats your chronological age!"},
        {icon:"💚",title:"Keep It Up",desc:"Your active lifestyle is your best insurance policy."},
      ];
    },
    policies: (s)=> s>50?[
      {p:"premier",reason:"High metabolic age = higher health risk. Premium cover with full diagnostics."},
      {p:"accidentCare",reason:"Sedentary-related injuries are common — Accident Care provides backup."},
    ]:[
      {p:"health360",reason:"Maintain your metabolic advantage with Health 360's preventive benefits."},
    ],
  },
  ergonomic: {
    title:"🖥️ Ergonomic Workplace Scanner", desc:"Assess your home office setup and sedentary risks.",
    questions:[
      { q:"How many hours do you spend sitting continuously at work?", opts:[
        {t:"2-3 hours with regular breaks",icon:"⏰",score:5},{t:"4-5 hours with some breaks",icon:"🪑",score:18},{t:"6-8 hours — few breaks",icon:"😣",score:35},{t:"8+ hours non-stop",icon:"⚠️",score:48}]},
      { q:"How is your chair and desk setup?", opts:[
        {t:"Ergonomic chair + standing desk",icon:"💺",score:5},{t:"Good quality office chair",icon:"🪑",score:12},{t:"Regular dining chair / sofa",icon:"🛋️",score:30},{t:"Bed or floor — no desk",icon:"🛏️",score:45}]},
      { q:"How much daily screen time do you have (all devices)?", opts:[
        {t:"Under 4 hours",icon:"📱",score:5},{t:"4-8 hours",icon:"💻",score:15},{t:"8-12 hours",icon:"🖥️",score:30},{t:"12+ hours",icon:"⚠️",score:42}]},
      { q:"Do you experience any of these regularly?", opts:[
        {t:"None of these",icon:"✅",score:5},{t:"Occasional neck/back stiffness",icon:"🤕",score:18},{t:"Frequent back pain or headaches",icon:"😖",score:35},{t:"Chronic pain + eye strain + wrist issues",icon:"🚨",score:48}]},
      { q:"How do you rate your work-life balance?", opts:[
        {t:"Excellent — clear boundaries",icon:"⚖️",score:5},{t:"Good — mostly balanced",icon:"👍",score:12},{t:"Poor — work bleeds into personal time",icon:"😔",score:30},{t:"Non-existent — always working",icon:"💀",score:45}]},
    ],
    insights:(s)=>s>60?[
      {icon:"🚨",title:"High Ergonomic Risk",desc:"Your setup is causing cumulative physical damage. Immediate changes required."},
      {icon:"👁️",title:"Eye Strain Alert",desc:"Excessive screen time without breaks accelerates vision deterioration."},
    ]:s>30?[
      {icon:"🔧",title:"Setup Improvements",desc:"Small ergonomic adjustments can reduce pain by 60%. Invest in a proper chair."},
      {icon:"⏰",title:"Break Routine",desc:"20-20-20 rule: Every 20 min, look at something 20ft away for 20 seconds."},
    ]:[
      {icon:"✅",title:"Ergonomic Winner",desc:"Great workspace setup! Your body will thank you long-term."},
      {icon:"💪",title:"Active Worker",desc:"Regular breaks and good posture prevent 80% of office-related injuries."},
    ],
    policies:(s)=>s>50?[
      {p:"superTopup",reason:"Ergonomic issues lead to physiotherapy costs — top-up your health cover."},
      {p:"accidentCare",reason:"Sedentary work increases injury risk. Accident Care protects you."},
    ]:[
      {p:"health360",reason:"Preventive health cover with annual check-ups to stay ahead."},
    ],
  },
  nature: {
    title:"🌿 Nature Deficit Index", desc:"How disconnected are you from nature? Map it to health risks.",
    questions:[
      { q:"How much time do you spend outdoors in green spaces weekly?", opts:[
        {t:"7+ hours — I love nature",icon:"🌳",score:5},{t:"3-6 hours",icon:"🌿",score:15},{t:"1-2 hours",icon:"🏢",score:30},{t:"Almost zero — always indoors",icon:"🏚️",score:48}]},
      { q:"How much direct sunlight exposure do you get daily?", opts:[
        {t:"30+ minutes",icon:"☀️",score:5},{t:"15-30 minutes",icon:"🌤️",score:12},{t:"5-15 minutes",icon:"⛅",score:28},{t:"Almost none — early morning to late night indoors",icon:"🌑",score:45}]},
      { q:"How close do you live to parks or green areas?", opts:[
        {t:"Within walking distance",icon:"🚶",score:5},{t:"Short drive away",icon:"🚗",score:12},{t:"Far — requires effort to reach",icon:"🏙️",score:28},{t:"No accessible green spaces",icon:"🏢",score:40}]},
      { q:"When did you last take a nature-based vacation?", opts:[
        {t:"Within last 3 months",icon:"⛰️",score:5},{t:"6-12 months ago",icon:"🏖️",score:12},{t:"1-2 years ago",icon:"📅",score:25},{t:"Can't remember",icon:"❌",score:40}]},
      { q:"Do you have any indoor plants or a garden?", opts:[
        {t:"Yes — many plants / garden",icon:"🪴",score:5},{t:"A few indoor plants",icon:"🌱",score:10},{t:"One or two",icon:"🌵",score:20},{t:"None at all",icon:"🏠",score:35}]},
    ],
    insights:(s)=>s>60?[
      {icon:"☀️",title:"Vitamin D Deficiency Risk",desc:"Minimal sun exposure puts you at high risk for bone issues and immunity problems."},
      {icon:"🧠",title:"Nature & Mental Health",desc:"Nature deficit correlates strongly with anxiety and depression."},
    ]:s>30?[
      {icon:"🌳",title:"Get Outside More",desc:"Even 20 minutes of daily nature exposure reduces cortisol by 30%."},
      {icon:"🏃",title:"Outdoor Exercise",desc:"Switching workouts outdoors doubles the mental health benefits."},
    ]:[
      {icon:"🌿",title:"Nature Connected",desc:"Your outdoor lifestyle supports strong immunity and mental clarity."},
      {icon:"✅",title:"Low Health Risk",desc:"Regular nature exposure is linked to 20% lower chronic disease rates."},
    ],
    policies:(s)=>s>50?[
      {p:"health360",reason:"Nature deficit increases disease risk — Health 360 covers diagnostic tests."},
      {p:"travel",reason:"Nature travel boosts health — protect your trips with Travel Insurance."},
    ]:[
      {p:"travel",reason:"Protect your nature adventures with comprehensive Travel Insurance."},
    ],
  },
  circadian: {
    title:"🌙 Circadian Rhythm Optimiser", desc:"How aligned is your body clock? Misalignment increases disease risks.",
    questions:[
      { q:"What time do you typically go to bed?", opts:[
        {t:"Before 10:30 PM",icon:"😴",score:5},{t:"10:30 PM - 12 AM",icon:"🌙",score:12},{t:"12 AM - 2 AM",icon:"🦉",score:30},{t:"After 2 AM",icon:"⚠️",score:45}]},
      { q:"How consistent is your sleep schedule?", opts:[
        {t:"Very consistent — same time daily",icon:"⏰",score:5},{t:"Mostly consistent — weekends vary",icon:"📅",score:12},{t:"Irregular — varies by 2+ hours",icon:"🔀",score:30},{t:"Completely random",icon:"🎲",score:45}]},
      { q:"Do you eat meals at regular times?", opts:[
        {t:"Yes — fixed meal schedule",icon:"🍽️",score:5},{t:"Mostly — occasional late dinners",icon:"🕐",score:12},{t:"No fixed schedule at all",icon:"🤷",score:28},{t:"I eat whenever — often very late",icon:"🌃",score:40}]},
      { q:"How much screen time do you have before bed?", opts:[
        {t:"None — I avoid screens 1hr before bed",icon:"📵",score:5},{t:"30 minutes or less",icon:"📱",score:12},{t:"1-2 hours of scrolling",icon:"💻",score:28},{t:"I fall asleep with phone in hand",icon:"📲",score:42}]},
      { q:"How refreshed do you feel upon waking?", opts:[
        {t:"Very refreshed — ready to go",icon:"🌅",score:5},{t:"Okay — takes 10-15 min to start",icon:"☕",score:12},{t:"Groggy — need coffee to function",icon:"😵",score:30},{t:"Exhausted — dread getting up",icon:"😩",score:45}]},
    ],
    insights:(s)=>s>60?[
      {icon:"⏰",title:"Severe Misalignment",desc:"Your circadian rhythm is disrupted. This raises diabetes, obesity, and cardiac risk."},
      {icon:"📱",title:"Screen Impact",desc:"Blue light before bed suppresses melatonin by 50%, damaging sleep quality."},
    ]:s>30?[
      {icon:"🌙",title:"Room for Improvement",desc:"Shifting bedtime earlier by 30 min and reducing screens will help significantly."},
      {icon:"🍽️",title:"Meal Timing",desc:"Eating your last meal 3 hours before bed improves metabolism by 15%."},
    ]:[
      {icon:"✅",title:"Well Aligned",desc:"Your body clock is in sync. This is excellent for long-term health."},
      {icon:"💤",title:"Sleep Champion",desc:"Consistent sleep patterns reduce chronic disease risk by 30%."},
    ],
    policies:(s)=>s>50?[
      {p:"health360",reason:"Circadian disruption increases chronic disease risk — stay covered with Health 360."},
      {p:"secureShield",reason:"Sleep disorders raise critical illness probability — Secure Shield protects."},
    ]:[
      {p:"health360",reason:"Maintain your healthy rhythm with Health 360's preventive wellness perks."},
    ],
  },
};

// ─── Insurance Gap Simulator Steps ──────────────────────
const LIFESIM_STEPS = [
  {
    key:"profile", tag:"Profile", xp:100,
    headline:"Let\u2019s get to know you.",
    subtext:"TELL US ABOUT YOURSELF",
    nudge:"Understanding your profile helps us identify the right coverage for your unique situation.",
    type:"radio",
    options:[
      {t:"18\u201325 years, Single",icon:"\ud83e\uddd1",gapDelta:5},
      {t:"26\u201335 years, Married",icon:"\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67",gapDelta:12},
      {t:"36\u201350 years, Family with kids",icon:"\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66",gapDelta:18},
      {t:"50+ years",icon:"\ud83e\uddd3",gapDelta:15},
    ],
  },
  {
    key:"property", tag:"Property", xp:200,
    headline:"Your world at home.",
    subtext:"WHAT BEST DESCRIBES YOUR LIVING SITUATION?",
    nudge:"Homeowners without insurance lose an average of \u20b94.2L more during natural disasters.",
    type:"radio",
    options:[
      {t:"Renting",icon:"\ud83c\udfe2",gapDelta:4},
      {t:"Own a Flat",icon:"\ud83c\udfe2",gapDelta:12,subQ:{type:"dropdown",label:"Select property value\u2026",choices:["Below \u20b920L","\u20b920L \u2013 \u20b950L","\u20b950L \u2013 \u20b91Cr","\u20b91Cr \u2013 \u20b92Cr","\u20b92Cr \u2013 \u20b95Cr","Above \u20b95Cr"]}},
      {t:"Own a House",icon:"\ud83c\udfe0",gapDelta:15,subQ:{type:"dropdown",label:"Select property value\u2026",choices:["Below \u20b920L","\u20b920L \u2013 \u20b950L","\u20b950L \u2013 \u20b91Cr","\u20b91Cr \u2013 \u20b92Cr","\u20b92Cr \u2013 \u20b95Cr","Above \u20b95Cr"]}},
      {t:"Living with family",icon:"\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66",gapDelta:3},
    ],
  },
  {
    key:"vehicles", tag:"Vehicles", xp:300,
    headline:"Life on the move.",
    subtext:"HOW MANY VEHICLES DO YOU HAVE?",
    nudge:"Uninsured vehicles can cost you up to \u20b91L in penalties and accident liabilities.",
    type:"radio",
    options:[
      {t:"None",icon:"\ud83d\udeb6",gapDelta:0},
      {t:"1 Vehicle",icon:"\ud83d\ude97",gapDelta:8},
      {t:"2 Vehicles",icon:"\ud83d\ude99",gapDelta:14},
      {t:"3 or More",icon:"\ud83d\ude9a",gapDelta:18},
    ],
    subQ:{
      trigger:[1,2,3],  // show when any vehicle option > None is selected
      type:"chips",
      label:"\ud83d\ude97 What type of vehicles do you own?",
      hint:"Select all that apply",
      choices:["Car / SUV","Two-Wheeler","Commercial Vehicle"],
    },
  },
  {
    key:"travel", tag:"Travel", xp:400,
    headline:"The world is calling.",
    subtext:"HOW OFTEN DO YOU TRAVEL?",
    nudge:"A single medical emergency abroad costs more than 3 years of travel insurance premiums.",
    type:"radio",
    options:[
      {t:"International 3+ times/year",icon:"\u2708\ufe0f",gapDelta:20,badge:"High Risk"},
      {t:"International 1\u20132 times/year",icon:"\ud83c\udf0d",gapDelta:14,badge:"Moderate"},
      {t:"Domestic Only",icon:"\ud83d\ude86",gapDelta:6},
      {t:"Rarely Travel",icon:"\ud83c\udfe0",gapDelta:2},
    ],
  },
  {
    key:"safety", tag:"Safety Net", xp:500,
    headline:"Your current safety net.",
    subtext:"WHAT INSURANCE DO YOU CURRENTLY HAVE?",
    nudge:"Most people discover their insurance gaps only after a crisis. You are discovering yours now.",
    type:"checkbox",
    options:[
      {t:"Health",icon:"\u2764\ufe0f",gapDelta:-12},
      {t:"Motor",icon:"\ud83d\ude97",gapDelta:-10},
      {t:"Home",icon:"\ud83c\udfe0",gapDelta:-10},
      {t:"Travel",icon:"\u2708\ufe0f",gapDelta:-8},
      {t:"Personal Accident",icon:"\ud83d\udee1\ufe0f",gapDelta:-8},
      {t:"Cyber",icon:"\ud83d\udd12",gapDelta:-6},
    ],
    noneOption:{t:"None",icon:"\u274c",gapDelta:20},
    isFinish: true,
  },
];

// ═══════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════
const state = { activeTab:"cyber", isLoading:false, cameraStream:null, hasHealthCapture:false,
  quiz:{ type:null, step:0, answers:[] },
  lifesim:{ step:0, gapScore:30, answers:[], subAnswers:{} },
};
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

// ═══════════════════════════════════════════════════
// ORIGINAL CYBER/HEALTH SCANNER (preserved)
// ═══════════════════════════════════════════════════
function delay(ms){return new Promise(r=>setTimeout(r,ms))}
function setStatus(msg,type="info"){
  const s=$("#scannerStatus"); s.textContent=msg; s.className=`scanner-status ${type}`;
  $("#scannerLastStatus").textContent=msg;
}
function setLoading(loading){
  state.isLoading=loading;
  const btn=$("#scannerSubmitBtn"),txt=$("#scannerSubmitText"),spin=$("#scannerSpinner");
  btn.disabled=loading; btn.classList.toggle("loading",loading); spin.classList.toggle("hidden",!loading);
  txt.textContent=loading?"Scanning...":(state.activeTab==="health"?"Analyze Risk":"Run Deep Scan");
}
function clearResultPanel(){
  $("#scanResult").classList.add("hidden");
  $("#resultHeadline").textContent="Scan Result";
  $("#resultSummary").textContent=""; $("#resultSignals").innerHTML="";
  $("#resultScore").textContent=""; $("#resultPitch").textContent="";
}
async function startHealthCamera(){
  if(state.cameraStream) return;
  const v=$("#healthVideo"),s=$("#healthCaptureStatus");
  try{ const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false}); state.cameraStream=stream; v.srcObject=stream; s.textContent="Camera is live. Capture snapshot to analyze."; }
  catch(_){ s.textContent="Camera access denied. Health analysis will continue without snapshot."; }
}
function stopHealthCamera(){ if(!state.cameraStream) return; state.cameraStream.getTracks().forEach(t=>t.stop()); state.cameraStream=null; }
function resetHealthCaptureUI(){
  state.hasHealthCapture=false;
  $("#healthCanvas").classList.add("hidden"); $("#healthVideo").classList.remove("hidden");
  $("#retakePhotoBtn").classList.add("hidden"); $("#healthCaptureStatus").textContent="Camera is live.";
}
function captureHealthSnapshot(){
  const v=$("#healthVideo"),c=$("#healthCanvas"),s=$("#healthCaptureStatus"),r=$("#retakePhotoBtn");
  if(!v.videoWidth){ s.textContent="Wait for camera preview."; return; }
  c.width=v.videoWidth; c.height=v.videoHeight; c.getContext("2d").drawImage(v,0,0,c.width,c.height);
  state.hasHealthCapture=true; v.classList.add("hidden"); c.classList.remove("hidden"); r.classList.remove("hidden"); s.textContent="Snapshot captured. Click Analyze Risk.";
}
function getScoreClass(s){ return s>=75?"High":s>=50?"Medium":"Low"; }
function buildSignals(tab,cust,label){
  if(!cust) return ["No exact customer match found.","Using pattern-based inference.",`Risk confidence: ${label}.`];
  const sigs=[`Matched: ${cust.name} from ${cust.location}.`,`Digital engagement: ${cust.digitalEngagement}.`,`Risk level: ${cust.riskProfile.level}.`];
  if(tab==="health"&&cust.riskProfile.healthStatus.preExistingConditions.length) sigs.push(`Pre-existing: ${cust.riskProfile.healthStatus.preExistingConditions.join(", ")}.`);
  return sigs;
}
function computeScanScore(tab,cust,email){
  let base=40;
  if(cust){ base+=cust.confidenceScore?cust.confidenceScore*0.45:10; base+=cust.claims.length===0?8:2; base+=cust.digitalEngagement==="Very High"?10:4; }
  if(tab==="cyber"&&email.includes("@")) base+=7;
  if(tab==="health"&&cust?.riskProfile.healthStatus.preExistingConditions.length) base+=10;
  return Math.max(15,Math.min(98,Number(base.toFixed(1))));
}
async function findCustomer(email,phone){
  const q=email||phone; if(!q) return null;
  const r=await fetch(`/api/customers?q=${encodeURIComponent(q)}&limit=1&page=1`);
  if(!r.ok) return null; const d=await r.json(); return d?.data?.[0]||null;
}

// ═══════════════════════════════════════════════════
// TAB SWITCHING
// ═══════════════════════════════════════════════════
const QUIZ_TABS=["mind","emotional","nutrition","metabolic","ergonomic","nature","circadian"];

function activateTab(tab){
  state.activeTab=tab;
  $$(".scanner-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));

  const isOriginal=tab==="cyber"||tab==="health";
  const isQuiz=QUIZ_TABS.includes(tab);
  const isLifeSim=tab==="lifesim";

  $("#scannerPanel").classList.toggle("hidden",!isOriginal);
  $("#quizPanel").classList.toggle("hidden",!isQuiz);
  $("#lifeSimPanel").classList.toggle("hidden",!isLifeSim);

  // Side panel update
  const label = isOriginal ? SCANNER_MAP[tab].title : isQuiz ? WELLNESS[tab].title : "\ud83c\udfae Insurance Gap Simulator";
  $("#scannerSideTitle").textContent=`Active Tool: ${label}`;
  $("#scannerMode").textContent=label;

  if(isOriginal){
    const meta=SCANNER_MAP[tab];
    $("#scannerTitle").textContent=meta.title; $("#scannerDescription").textContent=meta.description;
    const cf=$("#scannerContactFields"),sb=$("#scannerSubmitBtn"),ha=$("#healthAnalyzeBtn"),hm=$("#healthCameraModule");
    hm.classList.toggle("hidden",tab!=="health"); cf.classList.toggle("hidden",tab==="health");
    sb.classList.toggle("hidden",tab==="health"); ha.classList.toggle("hidden",tab!=="health");
    $("#scannerSubmitText").textContent=tab==="health"?"Analyze Risk":"Run Deep Scan";
    clearResultPanel(); setStatus("Awaiting input","info");
    tab==="health"?startHealthCamera():stopHealthCamera();
  } else if(isQuiz){
    initQuiz(tab);
  } else if(isLifeSim){
    initLifeSim();
  }
}

// ═══════════════════════════════════════════════════
// QUIZ ENGINE
// ═══════════════════════════════════════════════════
function initQuiz(type){
  const cfg=WELLNESS[type]; if(!cfg) return;
  state.quiz={type,step:0,answers:[]};
  $("#quizTitle").textContent=cfg.title;
  $("#quizDescription").textContent=cfg.desc;
  $("#quizResults").classList.add("hidden");
  $("#quizQuestionArea").classList.remove("hidden");
  $("#quizProgressWrap").classList.remove("hidden");
  renderQuizStep();
}

function renderQuizStep(){
  const{type,step,answers}=state.quiz;
  const cfg=WELLNESS[type]; const q=cfg.questions[step]; const total=cfg.questions.length;
  // Progress
  $("#quizProgressFill").style.width=`${((step+1)/total)*100}%`;
  $("#quizProgressLabel").textContent=`Question ${step+1} of ${total}`;
  // Question
  $("#quizQuestionText").textContent=q.q;
  $("#quizOptions").innerHTML=q.opts.map((o,i)=>`
    <div class="quiz-option ${answers[step]===i?'selected':''}" data-idx="${i}">
      <span class="quiz-option-icon">${o.icon}</span>
      <span class="quiz-option-text">${o.t}</span>
    </div>`).join("");
  // Bind options
  $$("#quizOptions .quiz-option").forEach(el=>{
    el.addEventListener("click",()=>{
      state.quiz.answers[step]=parseInt(el.dataset.idx);
      $$("#quizOptions .quiz-option").forEach(e=>e.classList.remove("selected"));
      el.classList.add("selected");
      $("#quizNextBtn").disabled=false;
    });
  });
  // Nav
  $("#quizPrevBtn").disabled=step===0;
  $("#quizNextBtn").disabled=answers[step]===undefined;
  $("#quizNextBtn").textContent=step===total-1?"See Results →":"Next →";
}

function quizNext(){
  const{type,step}=state.quiz; const total=WELLNESS[type].questions.length;
  if(state.quiz.answers[step]===undefined) return;
  if(step<total-1){ state.quiz.step++; renderQuizStep(); }
  else { showQuizResults(); }
}
function quizPrev(){ if(state.quiz.step>0){ state.quiz.step--; renderQuizStep(); } }

function showQuizResults(){
  const{type,answers}=state.quiz;
  const cfg=WELLNESS[type];
  // Calculate score (sum of selected option scores)
  let totalScore=0;
  cfg.questions.forEach((q,i)=>{ totalScore+=q.opts[answers[i]].score; });
  const maxScore=cfg.questions.reduce((s,q)=>s+Math.max(...q.opts.map(o=>o.score)),0);
  const pct=Math.round((totalScore/maxScore)*100);

  // Hide question, show results
  $("#quizQuestionArea").classList.add("hidden");
  $("#quizProgressWrap").classList.add("hidden");
  const results=$("#quizResults"); results.classList.remove("hidden");

  // Score circle
  const scoreCard=$("#quizScoreCard");
  scoreCard.className=`quiz-score-card ${pct>65?'score-high':pct>35?'score-medium':'score-low'}`;
  $("#quizScoreCircle").style.setProperty("--score-pct",`${pct}%`);
  $("#quizScoreValue").textContent=pct;
  $("#quizScoreTitle").textContent=pct>65?"High Risk Detected":pct>35?"Moderate Risk":"Low Risk — Great!";
  $("#quizScoreSummary").textContent=pct>65
    ?`Your ${cfg.title.replace(/[^\w\s]/g,'')} assessment indicates significant risk areas that need attention.`
    :pct>35
    ?`Some areas need improvement. Small changes can make a big difference.`
    :`Excellent results! Your wellness habits are strong. Keep it up!`;

  // Insights
  const insights=cfg.insights(pct);
  $("#quizInsights").innerHTML=insights.map(i=>`
    <div class="quiz-insight-card">
      <div class="insight-icon">${i.icon}</div>
      <h5>${i.title}</h5>
      <p>${i.desc}</p>
    </div>`).join("");

  // Policies
  const policies=cfg.policies(pct);
  $("#quizPolicyCards").innerHTML=policies.map(p=>{
    const prod=ZURICH_PRODUCTS[p.p];
    return `<div class="quiz-policy-card">
      <div class="policy-name">${prod.name}</div>
      <div class="policy-type">${prod.type}</div>
      <div class="policy-reason">${p.reason}</div>
      <a href="${prod.url}" target="_blank" class="policy-cta">Learn More →</a>
    </div>`;
  }).join("");

  results.scrollIntoView({behavior:"smooth",block:"start"});
}

// ═══════════════════════════════════════════════════
// INSURANCE GAP SIMULATOR
// ═══════════════════════════════════════════════════
function initLifeSim(){
  state.lifesim = { step:0, gapScore:30, answers:[], subAnswers:{}, checkedInsurance:[] };
  $("#lifesimResults").classList.add("hidden");
  $("#lifesimStage").classList.remove("hidden");
  renderLifeSimStep();
}

function renderLifeSimStep(){
  const { step } = state.lifesim;
  const cfg = LIFESIM_STEPS[step];
  const total = LIFESIM_STEPS.length;

  // Step header
  $("#lifesimStepLabel").textContent = `Step ${step+1}/${total}`;
  $("#lifesimStepTag").textContent = cfg.tag;
  $("#lifesimXpBadge").textContent = `${cfg.xp} XP \u25cf`;

  // Dot progress
  const dots = $$("#lifesimDotProgress .lifesim-dot");
  dots.forEach((d,i) => {
    d.classList.toggle("active", i <= step);
    d.classList.toggle("completed", i < step);
  });

  // Headline & subtext
  $("#lifesimHeadline").textContent = cfg.headline;
  $("#lifesimSubtext").textContent = cfg.subtext;

  // Nudge quote
  $("#lifesimNudgeQuote").innerHTML = `<div class="lifesim-quote-bar"></div><p>${cfg.nudge}</p>`;

  // Clear sub-question
  const subQEl = $("#lifesimSubQ");
  subQEl.classList.add("hidden");
  subQEl.innerHTML = "";

  // Build answer zone
  const zone = $("#lifesimAnswerZone");
  const prevAnswer = state.lifesim.answers[step];

  if (cfg.type === "radio") {
    zone.innerHTML = cfg.options.map((o, i) => `
      <div class="lifesim-radio-option ${prevAnswer === i ? 'selected' : ''}" data-idx="${i}">
        <span class="lifesim-radio-circle ${prevAnswer === i ? 'filled' : ''}"></span>
        <span class="lifesim-radio-label">${o.t}</span>
        ${o.badge ? `<span class="lifesim-risk-badge">${o.badge}</span>` : ''}
      </div>`).join("");

    zone.querySelectorAll(".lifesim-radio-option").forEach(el => {
      el.addEventListener("click", () => {
        const idx = parseInt(el.dataset.idx);
        state.lifesim.answers[step] = idx;
        zone.querySelectorAll(".lifesim-radio-option").forEach(e => {
          e.classList.remove("selected");
          e.querySelector(".lifesim-radio-circle").classList.remove("filled");
        });
        el.classList.add("selected");
        el.querySelector(".lifesim-radio-circle").classList.add("filled");
        $("#lifesimContinueBtn").disabled = false;

        // Handle per-option sub-question (e.g. property value dropdown)
        const opt = cfg.options[idx];
        if (opt.subQ) {
          showLifeSimSubQ(opt.subQ, step, idx);
        } else if (cfg.subQ && cfg.subQ.trigger && cfg.subQ.trigger.includes(idx)) {
          showLifeSimSubQ(cfg.subQ, step, idx);
        } else {
          subQEl.classList.add("hidden");
          subQEl.innerHTML = "";
        }
      });
    });

    // Restore sub-question if previously selected
    if (prevAnswer !== undefined) {
      const prevOpt = cfg.options[prevAnswer];
      if (prevOpt.subQ) showLifeSimSubQ(prevOpt.subQ, step, prevAnswer);
      else if (cfg.subQ && cfg.subQ.trigger && cfg.subQ.trigger.includes(prevAnswer)) showLifeSimSubQ(cfg.subQ, step, prevAnswer);
    }

  } else if (cfg.type === "checkbox") {
    // Checkbox grid for existing insurance
    const checked = state.lifesim.checkedInsurance || [];
    const noneChecked = state.lifesim.checkedNone || false;

    zone.innerHTML = `
      <div class="lifesim-checkbox-grid">
        ${cfg.options.map((o, i) => `
          <label class="lifesim-checkbox-option ${checked.includes(i) ? 'checked' : ''}">
            <input type="checkbox" value="${i}" ${checked.includes(i) ? 'checked' : ''}>
            <span class="lifesim-check-label">${o.t}</span>
          </label>`).join("")}
      </div>
      <label class="lifesim-checkbox-option lifesim-none-option ${noneChecked ? 'checked' : ''}">
        <input type="checkbox" value="none" ${noneChecked ? 'checked' : ''}>
        <span class="lifesim-check-label">${cfg.noneOption.t}</span>
      </label>`;

    zone.querySelectorAll("input[type=checkbox]").forEach(cb => {
      cb.addEventListener("change", () => {
        if (cb.value === "none") {
          // Uncheck all others
          state.lifesim.checkedInsurance = [];
          state.lifesim.checkedNone = cb.checked;
          zone.querySelectorAll("input[type=checkbox]").forEach(c => {
            if (c.value !== "none") { c.checked = false; c.closest("label").classList.remove("checked"); }
          });
          cb.closest("label").classList.toggle("checked", cb.checked);
        } else {
          // Uncheck none
          state.lifesim.checkedNone = false;
          const noneEl = zone.querySelector('input[value="none"]');
          if (noneEl) { noneEl.checked = false; noneEl.closest("label").classList.remove("checked"); }
          cb.closest("label").classList.toggle("checked", cb.checked);
          const allCbs = [...zone.querySelectorAll('.lifesim-checkbox-grid input[type=checkbox]')];
          state.lifesim.checkedInsurance = allCbs.filter(c => c.checked).map(c => parseInt(c.value));
        }
        state.lifesim.answers[step] = true; // mark as answered
        $("#lifesimContinueBtn").disabled = false;
      });
    });

    if (prevAnswer !== undefined) {
      $("#lifesimContinueBtn").disabled = false;
    }
  }

  // Nav
  $("#lifesimBackBtn").disabled = step === 0;
  $("#lifesimContinueBtn").disabled = prevAnswer === undefined;
  $("#lifesimContinueBtn").textContent = cfg.isFinish ? "Finish" : "Continue";
}

function showLifeSimSubQ(subQCfg, step, optIdx) {
  const subQEl = $("#lifesimSubQ");
  subQEl.classList.remove("hidden");

  if (subQCfg.type === "dropdown") {
    const prevVal = state.lifesim.subAnswers[`${step}_${optIdx}`] || "";
    subQEl.innerHTML = `
      <select class="lifesim-dropdown" id="lifesimSubSelect">
        <option value="">${subQCfg.label}</option>
        ${subQCfg.choices.map(c => `<option value="${c}" ${prevVal===c?'selected':''}>${c}</option>`).join("")}
      </select>`;
    subQEl.querySelector("select").addEventListener("change", (e) => {
      state.lifesim.subAnswers[`${step}_${optIdx}`] = e.target.value;
    });

  } else if (subQCfg.type === "chips") {
    const prevChips = state.lifesim.subAnswers[`${step}_chips`] || [];
    subQEl.innerHTML = `
      <p class="lifesim-sub-label">${subQCfg.label}</p>
      <p class="lifesim-sub-hint">${subQCfg.hint}</p>
      <div class="lifesim-chip-row">
        ${subQCfg.choices.map(c => `
          <button type="button" class="lifesim-chip ${prevChips.includes(c)?'active':''}" data-chip="${c}">${c}</button>
        `).join("")}
      </div>`;
    subQEl.querySelectorAll(".lifesim-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("active");
        const active = [...subQEl.querySelectorAll(".lifesim-chip.active")].map(b => b.dataset.chip);
        state.lifesim.subAnswers[`${step}_chips`] = active;
      });
    });
  }
}

function lifesimNext() {
  const { step } = state.lifesim;
  const cfg = LIFESIM_STEPS[step];
  if (state.lifesim.answers[step] === undefined) return;

  if (step < LIFESIM_STEPS.length - 1) {
    state.lifesim.step++;
    renderLifeSimStep();
  } else {
    showLifeSimResults();
  }
}

function lifesimBack() {
  if (state.lifesim.step > 0) {
    state.lifesim.step--;
    renderLifeSimStep();
  }
}

function showLifeSimResults(){
  // Calculate gap score from answers
  let gap = 30; // base gap
  LIFESIM_STEPS.forEach((cfg, i) => {
    const ans = state.lifesim.answers[i];
    if (ans === undefined) return;

    if (cfg.type === "radio") {
      gap += cfg.options[ans].gapDelta;
    } else if (cfg.type === "checkbox") {
      // If none checked
      if (state.lifesim.checkedNone) {
        gap += cfg.noneOption.gapDelta;
      } else {
        state.lifesim.checkedInsurance.forEach(idx => {
          gap += cfg.options[idx].gapDelta;
        });
      }
    }
  });
  gap = Math.max(0, Math.min(100, gap));

  $("#lifesimStage").classList.add("hidden");
  const results = $("#lifesimResults"); results.classList.remove("hidden");

  const scoreCard = $("#lifesimScoreCard");
  scoreCard.className = `quiz-score-card ${gap>65?'score-high':gap>35?'score-medium':'score-low'}`;
  $("#lifesimScoreCircle").style.setProperty("--score-pct", `${gap}%`);
  $("#lifesimScoreValue").textContent = gap;
  $("#lifesimScoreSummary").textContent = gap > 65
    ? "You have significant insurance gaps. Getting the right coverage now can protect you from major financial setbacks."
    : gap > 35
    ? "You have some coverage, but there are gaps. A few targeted policies can close them."
    : "Great job! You're well-covered. Consider reviewing your plans annually to stay protected.";

  // Insights based on gap
  const insightsArr = gap > 60 ? [
    {icon:"\ud83d\udea8",title:"Critical Gaps Found",desc:"Your lifestyle indicates multiple areas where you're unprotected. Vehicles, property, or travel emergencies could hit hard."},
    {icon:"\ud83d\udca1",title:"Act Now",desc:"Closing insurance gaps early saves 3\u20135x more than dealing with uninsured incidents later."},
  ] : gap > 35 ? [
    {icon:"\ud83d\udcca",title:"Partial Coverage",desc:"You have some protection but key areas like home or travel may be exposed."},
    {icon:"\ud83c\udfaf",title:"Targeted Fix",desc:"Adding 1\u20132 specific policies can drop your gap score significantly."},
  ] : [
    {icon:"\ud83c\udfc6",title:"Well Protected",desc:"You have strong coverage across most risk areas. Keep reviewing annually."},
    {icon:"\ud83d\udee1\ufe0f",title:"Safety Pro",desc:"Your proactive approach to insurance keeps your financial health robust."},
  ];
  $("#lifesimInsights").innerHTML = insightsArr.map(i => `<div class="quiz-insight-card"><div class="insight-icon">${i.icon}</div><h5>${i.title}</h5><p>${i.desc}</p></div>`).join("");

  // Determine recommended products based on answers
  const recommended = [];
  const reasons = {};

  // Check profile
  const profileAns = state.lifesim.answers[0];
  if (profileAns >= 1) { // married or family
    if (!recommended.includes("health360")) recommended.push("health360");
    reasons.health360 = "Family coverage with comprehensive health benefits including cashless hospitalisation.";
  }

  // Check property
  const propAns = state.lifesim.answers[1];
  if (propAns === 1 || propAns === 2) { // own flat or house
    // Zurich Kotak offers home insurance
    recommended.push("homeInsurance");
    reasons.homeInsurance = "Protect your property investment against fire, flood, earthquake and burglary.";
  }

  // Check vehicles
  const vehAns = state.lifesim.answers[2];
  if (vehAns >= 1) {
    if (!recommended.includes("carSecure")) recommended.push("carSecure");
    reasons.carSecure = "Comprehensive motor insurance with roadside assistance and zero depreciation.";
  }

  // Check travel
  const trvAns = state.lifesim.answers[3];
  if (trvAns !== undefined && trvAns <= 1) { // international travel
    if (!recommended.includes("travel")) recommended.push("travel");
    reasons.travel = "Cover medical emergencies, trip cancellations and baggage loss during international travel.";
  }

  // Check safety net gaps
  if (state.lifesim.checkedNone || (state.lifesim.checkedInsurance && state.lifesim.checkedInsurance.length === 0)) {
    if (!recommended.includes("health360")) recommended.push("health360");
    if (!recommended.includes("accidentCare")) recommended.push("accidentCare");
    reasons.health360 = reasons.health360 || "Start with comprehensive health coverage \u2014 the foundation of any safety net.";
    reasons.accidentCare = "Personal accident cover protects against injuries and permanent disability.";
  } else if (state.lifesim.checkedInsurance) {
    // Check what's missing
    const has = state.lifesim.checkedInsurance;
    if (!has.includes(0) && !recommended.includes("health360")) { recommended.push("health360"); reasons.health360 = "You don\u2019t have health insurance \u2014 it\u2019s the most critical coverage to have."; }
    if (!has.includes(1) && vehAns >= 1 && !recommended.includes("carSecure")) { recommended.push("carSecure"); reasons.carSecure = "You own vehicles but don\u2019t have motor insurance \u2014 it\u2019s legally mandatory."; }
    if (!has.includes(3) && trvAns <= 1 && !recommended.includes("travel")) { recommended.push("travel"); reasons.travel = "You travel internationally but don\u2019t have travel insurance. One emergency could cost lakhs."; }
    if (!has.includes(4) && !recommended.includes("accidentCare")) { recommended.push("accidentCare"); reasons.accidentCare = "Personal accident cover provides a safety net for your family in case of injury."; }
  }

  // Fallback
  if (recommended.length === 0) { recommended.push("health360"); reasons.health360 = "Maintain your protection with Health 360\u2019s preventive care benefits."; }

  // Enhanced product map for general insurance
  const GI_PRODUCTS = {
    health360:     { name:"Health 360", type:"Comprehensive Health", url:"https://www.zurichkotak.com/health-insurance" },
    premier:       { name:"Kotak Health Premier", type:"Premium Health", url:"https://www.zurichkotak.com/health-insurance" },
    secureShield:  { name:"Kotak Secure Shield", type:"Critical Illness", url:"https://www.zurichkotak.com/health-insurance" },
    superTopup:    { name:"Health Super Top-up", type:"Top-up Cover", url:"https://www.zurichkotak.com/health-insurance" },
    accidentCare:  { name:"Kotak Accident Care", type:"Personal Accident", url:"https://www.zurichkotak.com/health-insurance" },
    travel:        { name:"Travel Insurance", type:"Travel Protection", url:"https://www.zurichkotak.com/travel-insurance" },
    carSecure:     { name:"Car Secure", type:"Motor Insurance", url:"https://www.zurichkotak.com/car-insurance" },
    homeInsurance: { name:"Home Insurance", type:"Property Protection", url:"https://www.zurichkotak.com/home-insurance" },
  };

  $("#lifesimPolicyCards").innerHTML = recommended.slice(0,4).map(p => {
    const prod = GI_PRODUCTS[p]; if (!prod) return "";
    return `<div class="quiz-policy-card">
      <div class="policy-name">${prod.name}</div>
      <div class="policy-type">${prod.type}</div>
      <div class="policy-reason">${reasons[p]||""}</div>
      <a href="${prod.url}" target="_blank" class="policy-cta">Learn More \u2192</a>
    </div>`;
  }).join("");

  results.scrollIntoView({behavior:"smooth",block:"start"});
}

// ═══════════════════════════════════════════════════
// BIND EVENTS
// ═══════════════════════════════════════════════════
function bindTabs(){
  $$(".scanner-tab").forEach(b=>b.addEventListener("click",()=>activateTab(b.dataset.tab)));
}
function bindForm(){
  const form=$("#scannerForm");
  form.addEventListener("submit",async(e)=>{
    e.preventDefault(); if(state.isLoading) return;
    const email=$("#scannerEmail").value.trim(), phone=$("#scannerPhone").value.trim();
    const scanMeta=SCANNER_MAP[state.activeTab];
    setLoading(true); setStatus("Running deep scan...","loading");
    try{
      let score=0,scoreLabel="Low",signals=[];
      const customer=await findCustomer(email,phone);
      if(state.activeTab==="cyber"){
        if(!email) throw new Error("Email is required for cyber risk scan.");
        const r=await fetch("/api/scanners/cyber-score",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
        const cr=await r.json(); score=Number(cr.score||0); scoreLabel=cr.scoreLabel||getScoreClass(score);
        signals=Array.isArray(cr.signals)?cr.signals:[cr.message||"Cyber scan completed."];
      } else if(state.activeTab==="health"){
        score=computeScanScore(state.activeTab,customer,email);
        if(state.hasHealthCapture) score=Math.min(98,Number((score+9.5).toFixed(1)));
        scoreLabel=getScoreClass(score);
        signals=buildSignals(state.activeTab,customer,scoreLabel);
        signals.unshift(state.hasHealthCapture?"Camera snapshot analyzed.":"No snapshot. Score from profile inputs only.");
      } else {
        score=computeScanScore(state.activeTab,customer,email);
        scoreLabel=getScoreClass(score); signals=buildSignals(state.activeTab,customer,scoreLabel);
      }
      await delay(350);
      $("#resultHeadline").textContent=`${scanMeta.title} Result`;
      $("#resultSummary").textContent=`${scoreLabel} risk level detected. We recommend exploring ${scanMeta.product} for comprehensive protection.`;
      $("#resultSignals").innerHTML=signals.map(s=>`<li>${s}</li>`).join("");
      $("#resultScore").textContent=`Scan Score: ${score}`;
      $("#resultPitch").textContent=`Recommended: ${scanMeta.product}`;
      $("#scanResult").classList.remove("hidden");
      setStatus("Scan completed successfully.","success");
    }catch(err){ setStatus(err.message||"Scan failed.","error"); }
    finally{ setLoading(false); }
  });
}
function bindHealthCameraActions(){
  $("#capturePhotoBtn").addEventListener("click",()=>captureHealthSnapshot());
  $("#retakePhotoBtn").addEventListener("click",()=>resetHealthCaptureUI());
  $("#healthAnalyzeBtn").addEventListener("click",()=>$("#scannerForm").requestSubmit());
}
function bindQuizNav(){
  $("#quizNextBtn").addEventListener("click",quizNext);
  $("#quizPrevBtn").addEventListener("click",quizPrev);
  $("#quizRetakeBtn").addEventListener("click",()=>initQuiz(state.quiz.type));
  // Life sim nav
  $("#lifesimContinueBtn").addEventListener("click", lifesimNext);
  $("#lifesimBackBtn").addEventListener("click", lifesimBack);
  $("#lifesimRetakeBtn").addEventListener("click", initLifeSim);
}

bindTabs(); bindForm(); bindHealthCameraActions(); bindQuizNav();

