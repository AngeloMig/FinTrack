const CATS=[
// ── Bills & Utilities ──────────────────────────────────────────────────────
{name:"Electric Bill",budget:7500,type:"fixed",group:"needs",section:"bills",icon:"⚡",colorClass:"cat-electric"},
{name:"Water Bill",budget:400,type:"fixed",group:"needs",section:"bills",icon:"💧",colorClass:"cat-water"},
{name:"Internet Bill",budget:1299,type:"fixed",group:"needs",section:"bills",icon:"🌐",colorClass:"cat-internet"},
{name:"Mobile / Phone Bill",budget:499,type:"fixed",group:"needs",section:"bills",icon:"📱",colorClass:"cat-mobile"},
// ── Subscriptions ──────────────────────────────────────────────────────────
{name:"Spotify",budget:169,type:"fixed",group:"wants",section:"subscriptions",icon:"🎵",colorClass:"cat-spotify"},
{name:"Streaming Services",budget:399,type:"fixed",group:"wants",section:"subscriptions",icon:"🎬",colorClass:"cat-streaming"},
// ── Food ───────────────────────────────────────────────────────────────────
{name:"Groceries",budget:10000,type:"variable",group:"needs",section:"food",icon:"🛒",colorClass:"cat-groceries"},
{name:"Dining Out",budget:4000,type:"variable",group:"wants",section:"food",icon:"🍽️",colorClass:"cat-dining"},
{name:"Food Delivery",budget:3000,type:"variable",group:"wants",section:"food",icon:"🛵",colorClass:"cat-delivery"},
{name:"Coffee & Snacks",budget:2431,type:"variable",group:"wants",section:"food",icon:"☕",colorClass:"cat-coffee"},
// ── Transport ──────────────────────────────────────────────────────────────
{name:"Commute / Public Transport",budget:600,type:"variable",group:"needs",section:"transport",icon:"🚌",colorClass:"cat-transport"},
{name:"Ride-Hailing",budget:900,type:"variable",group:"needs",section:"transport",icon:"🚗",colorClass:"cat-ridehailing"},
{name:"Fuel / Gas",budget:500,type:"variable",group:"needs",section:"transport",icon:"⛽",colorClass:"cat-fuel"},
// ── Health ─────────────────────────────────────────────────────────────────
{name:"Medicines & Vitamins",budget:800,type:"variable",group:"needs",section:"health",icon:"💊",colorClass:"cat-health"},
{name:"Doctor / Dental",budget:700,type:"variable",group:"needs",section:"health",icon:"🏥",colorClass:"cat-doctor"},
{name:"Gym / Fitness",budget:500,type:"variable",group:"wants",section:"health",icon:"🏋️",colorClass:"cat-gym"},
{name:"Insurance / HMO",budget:1500,type:"fixed",group:"needs",section:"health",icon:"🛡️",colorClass:"cat-insurance"},
// ── Personal ───────────────────────────────────────────────────────────────
{name:"Clothing & Accessories",budget:800,type:"variable",group:"wants",section:"personal",icon:"👕",colorClass:"cat-clothing"},
{name:"Grooming & Haircut",budget:600,type:"variable",group:"wants",section:"personal",icon:"✂️",colorClass:"cat-grooming"},
{name:"Skincare & Beauty",budget:600,type:"variable",group:"wants",section:"personal",icon:"💆",colorClass:"cat-skincare"},
// ── Lifestyle & Entertainment ──────────────────────────────────────────────
{name:"Movies & Events",budget:1500,type:"variable",group:"wants",section:"lifestyle",icon:"🎞️",colorClass:"cat-movies"},
{name:"Hobbies & Recreation",budget:2000,type:"variable",group:"wants",section:"lifestyle",icon:"🎮",colorClass:"cat-hobbies"},
{name:"Gifts & Celebrations",budget:1500,type:"variable",group:"wants",section:"lifestyle",icon:"🎁",colorClass:"cat-gifts"},
// ── Education ──────────────────────────────────────────────────────────────
{name:"Online Courses",budget:600,type:"variable",group:"needs",section:"education",icon:"📚",colorClass:"cat-education"},
{name:"Books & Materials",budget:400,type:"variable",group:"needs",section:"education",icon:"📖",colorClass:"cat-books"},
// ── Buffer & Fees ──────────────────────────────────────────────────────────
{name:"Miscellaneous / Buffer",budget:4000,type:"variable",group:"needs",section:"buffer",icon:"📦",colorClass:"cat-misc"},
{name:"Transfer Fees",budget:0,type:"variable",group:"needs",section:"buffer",icon:"💸",colorClass:"cat-default"},
{name:"Trading Loss",budget:1500,type:"variable",group:"wants",section:"buffer",icon:"📉",colorClass:"cat-default"},
// ── Savings ────────────────────────────────────────────────────────────────
{name:"Big Purchases / Goals",budget:10000,type:"savings",group:"savings",section:"savings",icon:"🎯",colorClass:"cat-savings"},
{name:"Savings (BDO)",budget:10000,type:"savings",group:"savings",section:"savings",icon:"🏦",colorClass:"cat-savings"},
{name:"Emergency Fund (Digital Bank)",budget:15000,type:"savings",group:"savings",section:"savings",icon:"🛟",colorClass:"cat-savings"},
{name:"Investments (MP2/UITF)",budget:20000,type:"savings",group:"savings",section:"savings",icon:"📈",colorClass:"cat-savings"},
];
const DEFAULT_NW_ACCOUNTS=[{key:"bdo",name:"BDO Savings",icon:"🏦"},{key:"gcash",name:"GCash",icon:"📱"},{key:"mp2",name:"Pag-IBIG MP2/UITF",icon:"📈"},{key:"xm",name:"XM Wallet",icon:"📊"}];
const CHART_COLORS=['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316','#84cc16','#14b8a6','#a855f7','#eab308','#3b82f6','#e11d48','#0ea5e9'];
