import { useState, useEffect, useRef } from "react";

/*
 ╔══════════════════════════════════════════════════════════════╗
 ║   FOODLOOP v2  ·  by Greendex                                ║
 ║   Surplus food redistribution — real-time, role-adaptive     ║
 ║                                                              ║
 ║   Roles : Public · Organiser · Charity                       ║
 ║   New v2 : Notifications · Map view · Delivery toggle        ║
 ║            Achievements · Organiser analytics · Leaderboard  ║
 ╚══════════════════════════════════════════════════════════════╝
*/

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────── */
const C = {
  /* Greens */
  g950: "#0f2d1f", g900: "#1b4332", g800: "#2d6a4f", g700: "#40916c",
  g500: "#52b788", g400: "#74c69d", g300: "#95d5b2", g200: "#d8f3dc", g100: "#eaf7ed", g50: "#f0fdf4",
  /* Accent */
  amber: "#f4a261", amberD: "#e76f51", amberL: "#fde8d8",
  yellow: "#ffd166", yellowD: "#ffb703", yellowL: "#fff4cc",
  purple: "#7c3aed", purpleD: "#5b21b6", purpleL: "#ede9fe",
  teal: "#0d9488", tealL: "#ccfbf1",
  /* Neutral */
  white: "#ffffff", bg: "#f5faf6", card: "#ffffff",
  text: "#0f1f14", textMed: "#374151", muted: "#6b7280", faint: "#9ca3af",
  border: "#e2ede5", borderLight: "#f0f5f1",
  shadow: "rgba(27,67,50,0.10)", shadowMd: "rgba(27,67,50,0.16)",
  danger: "#ef4444", dangerL: "#fee2e2",
  info: "#3b82f6", infoL: "#dbeafe",
};
const F = { h: "'Cabinet Grotesk', 'Outfit', sans-serif", b: "'Plus Jakarta Sans', 'DM Sans', sans-serif" };

/* ─────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────── */
const EVENTS = [
  {
    id: 1, name: "TechConf 2025 Gala Dinner", org: "InnovateTech Ltd", orgEmoji: "🏢",
    dist: "0.4 km", pickup: "18:30 – 20:00", portions: 18, total: 40, price: 3.50, familyPrice: 6.00,
    emoji: "🍛", tag: "Closing Soon", tagColor: C.danger,
    menu: [{ cat: "Mains", items: ["Butter Fish", "Vegetable Biryani", "Garlic Naan"] },
    { cat: "Desserts", items: ["Mango Lassi", "Gulab Jamun"] }],
    carbon: 14.2, addr: "15 Innovation Park, Tech Quarter, London", priv: false, charReqs: 2,
    lat: 51.507, lng: -0.128
  },
  {
    id: 2, name: "Summer Garden Party", org: "Bloom Events", orgEmoji: "🌸",
    dist: "1.2 km", pickup: "15:00 – 16:30", portions: 32, total: 50, price: 4.00, familyPrice: 7.50,
    emoji: "🥂", tag: "New", tagColor: C.g700,
    menu: [{ cat: "Starters", items: ["Smoked Salmon Blinis", "Mini Quiches"] },
    { cat: "Mains", items: ["Cheese Board", "Artisan Bread"] },
    { cat: "Desserts", items: ["Strawberry Pavlova"] }],
    carbon: 18.6, addr: "Kensington Gardens Pavilion, London", priv: false, charReqs: 0,
    lat: 51.505, lng: -0.175
  },
  {
    id: 3, name: "Corporate Strategy Lunch", org: "FinGroup", orgEmoji: "📊",
    dist: "0.8 km", pickup: "14:00 – 15:00", portions: 7, total: 30, price: 3.00, familyPrice: 5.50,
    emoji: "🥗", tag: "Almost Gone", tagColor: C.amber,
    menu: [{ cat: "Mains", items: ["Grilled Chicken Caesar", "Pasta Primavera", "Sourdough Rolls"] },
    { cat: "Desserts", items: ["Tiramisu"] }],
    carbon: 9.8, addr: "One Canada Square, Canary Wharf, London", priv: true, charReqs: 1,
    lat: 51.504, lng: -0.021
  },
  {
    id: 4, name: "UCL Graduation Banquet", org: "UCL Events", orgEmoji: "🎓",
    dist: "2.1 km", pickup: "20:00 – 21:30", portions: 45, total: 80, price: 5.00, familyPrice: 9.00,
    emoji: "🎊", tag: "Popular", tagColor: C.purple,
    menu: [{ cat: "Mains", items: ["Pan-Seared Salmon", "Roast Beef", "Seasonal Vegetables"] },
    { cat: "Desserts", items: ["Chocolate Fondant", "Ice Cream Trio"] }],
    carbon: 31.5, addr: "Great Hall, UCL, Bloomsbury, London", priv: false, charReqs: 3,
    lat: 51.525, lng: -0.133
  },
];

const ACHIEVEMENTS = [
  { id: "first", icon: "🌱", name: "First Rescue", desc: "Collected your first meal", earned: true },
  { id: "streak7", icon: "🔥", name: "Week Warrior", desc: "7-day collection streak", earned: true },
  { id: "carbon10", icon: "🌿", name: "Carbon Crusher", desc: "Saved 10 kg of CO₂", earned: true },
  { id: "gold", icon: "🥇", name: "Gold Tier", desc: "Reach Gold loyalty tier", earned: false },
  { id: "refer3", icon: "👥", name: "Food Ambassador", desc: "Refer 3 friends to FoodLoop", earned: false },
  { id: "100meals", icon: "🏆", name: "Century Rescuer", desc: "Rescue 100 meals total", earned: false },
];

const LEADERBOARD = [
  { rank: 1, name: "Priya S.", meals: 203, coins: 4860, emoji: "🥇" },
  { rank: 2, name: "Marcus T.", meals: 187, coins: 4210, emoji: "🥈" },
  { rank: 3, name: "Sophie L.", meals: 164, coins: 3950, emoji: "🥉" },
  { rank: 4, name: "Alex Chen", meals: 47, coins: 2840, emoji: "4️⃣", isMe: true },
  { rank: 5, name: "Jordan K.", meals: 43, coins: 2650, emoji: "5️⃣" },
];

const NOTIFICATIONS = [
  { id: 1, icon: "⚡", title: "TechConf closing in 45 min!", sub: "Only 18 portions left — grab yours now", time: "2m ago", dot: true },
  { id: 2, icon: "🪙", title: "You earned 72 coins!", sub: "From Corporate Lunch collection", time: "1h ago", dot: true },
  { id: 3, icon: "🎁", title: "Daily reward ready", sub: "Rescue a meal today for +50 bonus coins", time: "3h ago", dot: false },
  { id: 4, icon: "🌱", title: "New event near you", sub: "UCL Graduation Banquet — 45 portions", time: "5h ago", dot: false },
  { id: 5, icon: "❤️", title: "FoodBank Central collected", sub: "32 portions from Summer Garden Party", time: "1d ago", dot: false },
];

const INITIAL_ORDERS = [
  { id: "FL-7823", name: "TechConf 2025 Gala", date: "Today", status: "collected", portions: 2, carbon: 1.2, coins: 72 },
  { id: "FL-7801", name: "Summer Garden Party", date: "Yesterday", status: "collected", portions: 1, carbon: 0.6, coins: 80 },
  { id: "FL-7780", name: "Corporate Lunch", date: "3 days ago", status: "collected", portions: 2, carbon: 1.0, coins: 60 },
];

const CHARITY_PARTNERS = [
  { id: "foodbank", name: "FoodBank Central", emoji: "❤️", desc: "Local redistribution partner" },
  { id: "community", name: "Community Table", emoji: "🍽️", desc: "Neighbourhood food hub" },
  { id: "harvest", name: "Harvest Helpers", emoji: "🌿", desc: "Community rescue team" },
];

const ORGANISER_PROFILE = { id: "innovateTech", name: "InnovateTech Ltd", emoji: "🏢" };
const CHARITY_PROFILE = { id: "foodbank", name: "FoodBank Central", emoji: "❤️" };
const getChatId = (eventId, charityId) => `${eventId}|${charityId}`;
const getPartner = (id) => CHARITY_PARTNERS.find(p => p.id === id) || CHARITY_PROFILE;
const INIT_CHAT_HISTORY = {
  [getChatId(1, CHARITY_PROFILE.id)]: [
    { from: "charity", text: "Hi! We're interested in collecting the remaining portions from TechConf.", time: "14:02" },
    { from: "organiser", text: "Great! We have about 12 family-size portions. Can you arrange by 19:00?", time: "14:05" },
    { from: "charity", text: "Absolutely. Our van can be there at 18:45. Is that okay?", time: "14:07" },
    { from: "organiser", text: "Perfect. I'll mark them reserved for you. See you then! 🙌", time: "14:09" },
  ],
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const pct = (used, total) => Math.min((used / total) * 100, 100);
const now = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const uid = () => `FL-${Math.floor(Math.random() * 9000 + 1000)}`;

const parseEventDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getEventStatus = (dateStr) => {
  const eventDate = parseEventDate(dateStr);
  if (!eventDate) return "active";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (eventDate.getTime() < today.getTime()) return "completed";
  if (eventDate.getTime() === today.getTime()) return "ongoing";
  return "upcoming";
};

/* Haversine distance (km) between two lat/lng points */
const toRad = (deg) => (deg * Math.PI) / 180;
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* Demo anchor — centred on this prototype's mock events (all in London).
   Used whenever real GPS is unavailable/denied, or implausibly far from
   the mock data, so the radius slider still has real examples to show. */
const DEFAULT_LOC = { lat: 51.513, lng: -0.114 };

/* Browser Geolocation hook. This is the standard, reliable location source —
   a third-party IP/location database would need an API key + outbound
   network call, which isn't available inside this sandboxed environment. */
function useUserLocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("locating"); // locating | live | denied | unsupported

  const detect = () => {
    if (!("geolocation" in navigator)) {
      setCoords(DEFAULT_LOC);
      setStatus("unsupported");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("live");
      },
      (err) => {
        setCoords(DEFAULT_LOC);
        setStatus(err.code === 1 ? "denied" : "unsupported");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  useEffect(() => { detect(); }, []);
  return { coords, status, retry: detect };
}

/* ─────────────────────────────────────────────────────────────
   MICRO-COMPONENTS
───────────────────────────────────────────────────────────── */
const Pill = ({ text, color = C.g700, bg, size = "sm" }) => (
  <span style={{
    display: "inline-flex", alignItems: "center",
    padding: size === "lg" ? "4px 14px" : "2px 10px",
    borderRadius: "20px", fontSize: size === "lg" ? "12px" : "11px",
    fontWeight: 700, background: bg || `${color}22`, color, fontFamily: F.h, letterSpacing: "0.2px"
  }}>
    {text}
  </span>
);

const Bar = ({ used, total, color = C.g700, h = 6 }) => (
  <div style={{ height: `${h}px`, background: C.g200, borderRadius: `${h}px`, overflow: "hidden" }}>
    <div style={{
      height: "100%", width: `${pct(used, total)}%`,
      background: color, borderRadius: `${h}px`, transition: "width 0.6s cubic-bezier(.4,0,.2,1)"
    }} />
  </div>
);

const Btn = ({ children, onClick, bg = C.g800, color = C.white, disabled, icon, style: s = {} }) => (
  <button onClick={disabled ? undefined : onClick}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      border: "none", borderRadius: "14px", cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: F.h, fontWeight: 700, fontSize: "15px", padding: "14px 22px",
      background: bg, color, opacity: disabled ? 0.42 : 1,
      transition: "transform 0.12s, box-shadow 0.12s, opacity 0.15s",
      boxShadow: disabled ? "none" : `0 2px 12px ${bg}55`, ...s
    }}
    onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
    onMouseUp={e => { e.currentTarget.style.transform = ""; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
    {icon && <span style={{ fontSize: "17px" }}>{icon}</span>}
    {children}
  </button>
);

const SmBtn = ({ children, onClick, bg = C.g100, color = C.g800, style: s = {} }) => (
  <button onClick={onClick}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
      border: "none", borderRadius: "10px", cursor: "pointer",
      fontFamily: F.h, fontWeight: 600, fontSize: "13px", padding: "9px 16px",
      background: bg, color, transition: "opacity 0.12s", ...s
    }}
    onMouseDown={e => { e.currentTarget.style.opacity = "0.75"; }}
    onMouseUp={e => { e.currentTarget.style.opacity = "1"; }}
    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
    {children}
  </button>
);

const Toggle = ({ on, onToggle, onColor = C.g800 }) => (
  <div onClick={onToggle} role="switch" aria-checked={on}
    style={{
      width: "52px", height: "28px", borderRadius: "14px",
      background: on ? onColor : C.border, position: "relative", cursor: "pointer",
      transition: "background 0.22s", flexShrink: 0
    }}>
    <div style={{
      position: "absolute", top: "4px",
      left: on ? "26px" : "4px", width: "20px", height: "20px",
      borderRadius: "50%", background: C.white, transition: "left 0.22s",
      boxShadow: "0 1px 6px rgba(0,0,0,0.25)"
    }} />
  </div>
);

const Card = ({ children, style: s = {}, onClick }) => (
  <div onClick={onClick}
    style={{
      background: C.card, borderRadius: "18px", border: `1px solid ${C.border}`,
      boxShadow: `0 1px 8px ${C.shadow}`, overflow: "hidden", ...s
    }}
    onMouseEnter={onClick ? e => { e.currentTarget.style.boxShadow = `0 6px 24px ${C.shadowMd}`; } : undefined}
    onMouseLeave={onClick ? e => { e.currentTarget.style.boxShadow = `0 1px 8px ${C.shadow}`; } : undefined}>
    {children}
  </div>
);

const Divider = ({ my = 12 }) => (
  <div style={{ height: "1px", background: C.borderLight, margin: `${my}px 0` }} />
);

const BackBtn = ({ nav, dark }) => (
  <button onClick={() => nav("back")}
    style={{
      position: "absolute", top: "52px", left: "18px", zIndex: 10,
      background: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)",
      border: "none", borderRadius: "10px", padding: "7px 14px",
      color: dark ? C.white : C.textMed, cursor: "pointer",
      fontFamily: F.b, fontSize: "13px", fontWeight: 600,
      display: "flex", alignItems: "center", gap: "4px"
    }}>
    ‹ Back
  </button>
);

/* ─────────────────────────────────────────────────────────────
   BOTTOM NAV
───────────────────────────────────────────────────────────── */
const BottomNav = ({ tab, onChange, role, notifCount = 0 }) => {
  const tabs = role === "organiser" ? [
    { id: "home", icon: "📊", label: "Dashboard" },
    { id: "events", icon: "🗓️", label: "Events" },
    { id: "chat", icon: "💬", label: "Chat" },
    { id: "me", icon: "👤", label: "Profile" },
  ] : role === "charity" ? [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "events", icon: "🍽️", label: "Browse" },
    { id: "chat", icon: "💬", label: "Chat" },
    { id: "me", icon: "❤️", label: "Impact" },
  ] : [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "events", icon: "🍽️", label: "Events" },
    { id: "orders", icon: "📦", label: "Orders" },
    { id: "me", icon: "👤", label: "Profile" },
  ];
  return (
    <div style={{
      display: "flex", background: C.card, borderTop: `1px solid ${C.border}`,
      padding: "6px 4px 16px", flexShrink: 0
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: "3px", border: "none", background: "none", cursor: "pointer", padding: "6px 0",
            position: "relative"
          }}>
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: "22px", filter: tab === t.id ? "none" : "grayscale(40%)" }}>{t.icon}</span>
            {t.id === "home" && notifCount > 0 && (
              <div style={{
                position: "absolute", top: "-2px", right: "-6px",
                width: "16px", height: "16px", background: C.danger, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${C.card}`
              }}>
                <span style={{ fontSize: "8px", color: C.white, fontWeight: 700 }}>{notifCount}</span>
              </div>
            )}
          </div>
          <span style={{
            fontFamily: F.h, fontSize: "10px", fontWeight: tab === t.id ? 700 : 400,
            color: tab === t.id ? C.g800 : C.faint
          }}>{t.label}</span>
          {tab === t.id && (
            <div style={{
              width: "22px", height: "3px", background: C.g700,
              borderRadius: "2px", marginTop: "1px"
            }} />
          )}
        </button>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   ONBOARDING SCREENS
══════════════════════════════════════════════════════════════ */

/* ── Welcome ────────────────────────────────────────────────── */
function Welcome({ nav }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);
  const tr = (d = 0) => ({
    opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.65s ease ${d}s, transform 0.65s cubic-bezier(.16,1,.3,1) ${d}s`,
  });
  /* Floating orbs */
  const orbs = [
    { w: 200, h: 200, top: "-60px", right: "-60px", bg: "rgba(255,255,255,0.05)" },
    { w: 280, h: 280, bottom: "-80px", left: "-80px", bg: "rgba(255,255,255,0.04)" },
    { w: 120, h: 120, top: "30%", right: "-30px", bg: "rgba(255,255,255,0.03)" },
  ];
  return (
    <div style={{
      height: "100%",
      background: `linear-gradient(155deg, ${C.g950} 0%, ${C.g900} 45%, ${C.g800} 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "48px 28px", position: "relative", overflow: "hidden"
    }}>

      {orbs.map((o, i) => (
        <div key={i} style={{
          position: "absolute", width: `${o.w}px`, height: `${o.h}px`,
          borderRadius: "50%", pointerEvents: "none", ...o
        }} />
      ))}

      <div style={{ ...tr(0), textAlign: "center", marginBottom: "44px" }}>
        <div style={{
          width: "88px", height: "88px", margin: "0 auto 22px",
          background: "rgba(255,255,255,0.10)", borderRadius: "26px",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px",
          border: "1.5px solid rgba(255,255,255,0.18)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
        }}>🍃</div>
        <div style={{
          fontFamily: F.h, fontSize: "42px", fontWeight: 900, color: C.white,
          lineHeight: 1, letterSpacing: "-1px"
        }}>FoodLoop</div>
        <div style={{
          fontFamily: F.b, fontSize: "11px", color: "rgba(255,255,255,0.4)",
          letterSpacing: "4px", marginTop: "7px", fontWeight: 600
        }}>BY GREENDEX</div>
      </div>

      <div style={{ ...tr(0.18), textAlign: "center", marginBottom: "44px" }}>
        <p style={{
          fontFamily: F.h, fontSize: "24px", fontWeight: 800, color: C.white,
          lineHeight: 1.35, marginBottom: "14px"
        }}>
          Rescue food.<br />Earn rewards.<br />
          <span style={{ color: C.g300 }}>Change the world.</span>
        </p>
        <p style={{ fontFamily: F.b, fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>
          Real-time surplus meals from events near you,<br />
          at a fraction of the cost.
        </p>
      </div>

      <div style={{
        ...tr(0.32), display: "flex", gap: "0", width: "100%",
        background: "rgba(255,255,255,0.06)", borderRadius: "16px",
        padding: "18px 0", marginBottom: "40px", border: "1px solid rgba(255,255,255,0.1)"
      }}>
        {[["50K+", "Meals Rescued"], ["12K", "CO₂ Tonnes"], ["2K+", "Events"]].map(([v, l], i) => (
          <div key={l} style={{
            flex: 1, textAlign: "center",
            borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none"
          }}>
            <div style={{ fontFamily: F.h, fontSize: "20px", fontWeight: 900, color: C.yellow }}>{v}</div>
            <div style={{
              fontFamily: F.b, fontSize: "10px", color: "rgba(255,255,255,0.42)",
              marginTop: "3px", letterSpacing: "0.3px"
            }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ ...tr(0.44), width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Btn onClick={() => nav("roleSelect")} bg={C.white} color={C.g800}
          style={{ width: "100%", fontSize: "16px", padding: "16px", borderRadius: "14px" }}>
          Get Started →
        </Btn>
        <button onClick={() => nav("auth")}
          style={{
            background: "none", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: "14px",
            padding: "14px", color: "rgba(255,255,255,0.7)", fontFamily: F.h, fontSize: "14px",
            fontWeight: 600, cursor: "pointer"
          }}>
          Sign In
        </button>
      </div>
    </div>
  );
}

/* ── Role Select ────────────────────────────────────────────── */
function RoleSelect({ nav, setRole }) {
  const roles = [
    { id: "public", emoji: "🛍️", label: "General Public", desc: "Find & collect surplus meals near you", bg: C.g800, pill: "Most Popular" },
    { id: "organiser", emoji: "🗓️", label: "Event Organiser", desc: "List surplus food from your events", bg: C.purple, pill: "For businesses" },
    { id: "charity", emoji: "❤️", label: "Charity Organisation", desc: "Arrange bulk collections for your community", bg: C.amberD, pill: "Free access" },
  ];
  return (
    <div style={{
      height: "100%", background: C.bg, display: "flex",
      flexDirection: "column", padding: "56px 22px 32px", overflowY: "auto"
    }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          fontFamily: F.h, fontSize: "30px", fontWeight: 900, color: C.text,
          lineHeight: 1.2, marginBottom: "10px"
        }}>
          Who are you?
        </div>
        <p style={{ fontFamily: F.b, fontSize: "15px", color: C.muted, lineHeight: 1.6 }}>
          We'll tailor your FoodLoop experience to fit your role.
        </p>
      </div>
      {roles.map((r, i) => (
        <div key={r.id}
          onClick={() => { setRole(r.id); nav("ageCheck"); }}
          style={{
            background: C.card, borderRadius: "20px", padding: "20px",
            border: `1.5px solid ${C.border}`, cursor: "pointer", marginBottom: "12px",
            display: "flex", alignItems: "center", gap: "16px", position: "relative",
            transition: "border-color 0.15s, box-shadow 0.15s",
            boxShadow: `0 1px 8px ${C.shadow}`
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = r.bg; e.currentTarget.style.boxShadow = `0 4px 20px ${r.bg}28`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = `0 1px 8px ${C.shadow}`; }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "16px",
            background: `${r.bg}18`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "26px", flexShrink: 0
          }}>
            {r.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontFamily: F.h, fontSize: "17px", fontWeight: 800, color: C.text }}>{r.label}</span>
              <Pill text={r.pill} color={r.bg} />
            </div>
            <div style={{ fontFamily: F.b, fontSize: "13px", color: C.muted, lineHeight: 1.5 }}>{r.desc}</div>
          </div>
          <span style={{ color: C.muted, fontSize: "18px", fontWeight: 300 }}>›</span>
        </div>
      ))}
    </div>
  );
}

/* ── Age Check ──────────────────────────────────────────────── */
function AgeCheck({ nav, setSenior }) {
  const opts = [
    { label: "Under 30", emoji: "🎮", hint: "Gamified experience with rewards, streaks & leaderboard", senior: false, color: C.g700 },
    { label: "30 – 60", emoji: "📱", hint: "Standard experience with all features", senior: false, color: C.teal },
    { label: "60+", emoji: "♿", hint: "Accessibility mode — larger text & simplified layout", senior: true, color: C.purple },
  ];
  return (
    <div style={{
      height: "100%", background: C.bg, display: "flex",
      flexDirection: "column", padding: "60px 22px 32px", overflowY: "auto"
    }}>
      <div style={{ marginBottom: "36px" }}>
        <div style={{ fontFamily: F.h, fontSize: "30px", fontWeight: 900, color: C.text }}>
          How old are you?
        </div>
        <p style={{ fontFamily: F.b, fontSize: "15px", color: C.muted, marginTop: "8px", lineHeight: 1.6 }}>
          We'll adapt the interface to suit you best.
        </p>
      </div>
      {opts.map(o => (
        <div key={o.label}
          onClick={() => { setSenior(o.senior); nav("auth"); }}
          style={{
            background: C.card, borderRadius: "20px", padding: "20px 22px",
            border: `1.5px solid ${C.border}`, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "16px",
            boxShadow: `0 1px 8px ${C.shadow}`, marginBottom: "12px",
            transition: "border-color 0.15s"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = o.color; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "16px",
            background: `${o.color}18`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "26px", flexShrink: 0
          }}>
            {o.emoji}
          </div>
          <div>
            <div style={{ fontFamily: F.h, fontSize: "19px", fontWeight: 800, color: C.text }}>{o.label}</div>
            <div style={{ fontFamily: F.b, fontSize: "13px", color: C.muted, marginTop: "3px" }}>{o.hint}</div>
          </div>
        </div>
      ))}
      <p style={{
        fontFamily: F.b, fontSize: "12px", color: C.faint, textAlign: "center",
        marginTop: "auto", paddingTop: "24px", lineHeight: 1.8
      }}>
        Your age range is never stored or shared.<br />
        This only personalises your display preferences.
      </p>
    </div>
  );
}

/* ── Auth ───────────────────────────────────────────────────── */
function Auth({ nav, role }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const home = role === "organiser" ? "orgHome" : role === "charity" ? "charityHome" : "pubHome";
  const inp = {
    width: "100%", padding: "14px 16px", borderRadius: "12px",
    border: `1.5px solid ${C.border}`, fontFamily: F.b, fontSize: "15px",
    color: C.text, background: C.card, outline: "none",
    transition: "border-color 0.15s"
  };
  const Lbl = ({ c }) => <label style={{
    fontFamily: F.h, fontSize: "13px", fontWeight: 700,
    color: C.textMed, display: "block", marginBottom: "8px"
  }}>{c}</label>;
  return (
    <div style={{
      height: "100%", background: C.bg, display: "flex",
      flexDirection: "column", padding: "60px 22px 32px", overflowY: "auto"
    }}>
      <div style={{ marginBottom: "36px" }}>
        <div style={{ fontSize: "36px", marginBottom: "14px" }}>👋</div>
        <div style={{ fontFamily: F.h, fontSize: "28px", fontWeight: 900, color: C.text }}>Welcome back</div>
        <p style={{ fontFamily: F.b, fontSize: "15px", color: C.muted, marginTop: "8px" }}>
          Sign in to continue to FoodLoop.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
        <div>
          <Lbl c="Email address" />
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="alex@example.com" style={inp} type="email"
            onFocus={e => { e.target.style.borderColor = C.g700; }}
            onBlur={e => { e.target.style.borderColor = C.border; }} />
        </div>
        <div>
          <Lbl c="Password" />
          <input value={pass} onChange={e => setPass(e.target.value)}
            placeholder="••••••••" style={inp} type="password"
            onFocus={e => { e.target.style.borderColor = C.g700; }}
            onBlur={e => { e.target.style.borderColor = C.border; }} />
          <span style={{
            fontFamily: F.b, fontSize: "12px", color: C.g700,
            cursor: "pointer", display: "block", textAlign: "right", marginTop: "8px"
          }}>
            Forgot password?
          </span>
        </div>
      </div>
      <Btn onClick={() => nav(home)} bg={C.g800}
        style={{ width: "100%", padding: "16px", borderRadius: "14px", fontSize: "16px" }}>
        Sign In
      </Btn>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
        <div style={{ flex: 1, height: "1px", background: C.border }} />
        <span style={{ fontFamily: F.b, fontSize: "13px", color: C.faint }}>or</span>
        <div style={{ flex: 1, height: "1px", background: C.border }} />
      </div>
      <Btn onClick={() => nav(home)} bg={C.bg} color={C.textMed}
        style={{
          width: "100%", border: `1.5px solid ${C.border}`, padding: "14px",
          boxShadow: "none", fontSize: "15px"
        }}>
        Continue as Guest
      </Btn>
      <p style={{
        textAlign: "center", fontFamily: F.b, fontSize: "13px",
        color: C.muted, marginTop: "20px"
      }}>
        New here?{" "}
        <span style={{ color: C.g800, fontWeight: 700, cursor: "pointer" }}>Create an account</span>
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PUBLIC SCREENS
══════════════════════════════════════════════════════════════ */

/* ── Public Home ────────────────────────────────────────────── */
function PubHome({ nav, senior, onTab, setNotifSeen, events }) {
  const sz = senior ? { h: "25px", h2: "20px", body: "16px", sm: "14px" }
    : { h: "21px", h2: "15px", body: "14px", sm: "12px" };
  const [showReward, setShowReward] = useState(true);

  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(140deg, ${C.g950} 0%, ${C.g800} 100%)`,
        padding: "52px 20px 28px", position: "relative"
      }}>
        {/* Notif bell */}
        <button onClick={() => { setNotifSeen(true); nav("notifications"); }}
          style={{
            position: "absolute", top: "52px", right: "20px",
            background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "12px",
            padding: "8px 10px", cursor: "pointer", position: "absolute", top: "52px", right: "20px"
          }}>
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: "20px" }}>🔔</span>
            <div style={{
              position: "absolute", top: "-2px", right: "-3px",
              width: "9px", height: "9px", background: C.danger,
              borderRadius: "50%", border: `2px solid ${C.g900}`
            }} />
          </div>
        </button>

        <div style={{ marginBottom: "22px" }}>
          <p style={{ fontFamily: F.b, fontSize: sz.sm, color: "rgba(255,255,255,0.55)", marginBottom: "3px" }}>
            Good evening,
          </p>
          <h1 style={{
            fontFamily: F.h, fontSize: sz.h, fontWeight: 900, color: C.white,
            letterSpacing: "-0.5px", marginBottom: "6px"
          }}>Alex Chen 👋</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              background: "rgba(255,255,255,0.12)", borderRadius: "22px",
              padding: "5px 14px", display: "flex", alignItems: "center", gap: "6px"
            }}>
              <span style={{ fontSize: "14px" }}>🪙</span>
              <span style={{ fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.yellow }}>2,840</span>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.12)", borderRadius: "22px",
              padding: "5px 14px", display: "flex", alignItems: "center", gap: "6px"
            }}>
              <span style={{ fontSize: "14px" }}>🔥</span>
              <span style={{ fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.white }}>12-day streak</span>
            </div>
          </div>
        </div>

        {/* Impact stats */}
        <div style={{
          background: "rgba(255,255,255,0.09)", borderRadius: "16px",
          padding: "16px", display: "grid", gridTemplateColumns: "repeat(3,1fr)",
          gap: "0", border: "1px solid rgba(255,255,255,0.08)"
        }}>
          {[["🍽️", "47", "Meals Rescued"], ["🌿", "23.4 kg", "CO₂ Saved"], ["🏆", "Silver", "Tier"]].map(([ic, v, l], i) => (
            <div key={l} style={{
              textAlign: "center",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none"
            }}>
              <span style={{ fontSize: senior ? "22px" : "18px" }}>{ic}</span>
              <div style={{
                fontFamily: F.h, fontSize: sz.h2, fontWeight: 900,
                color: C.white, marginTop: "4px"
              }}>{v}</div>
              <div style={{
                fontFamily: F.b, fontSize: "10px", color: "rgba(255,255,255,0.45)",
                marginTop: "2px"
              }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 18px 0" }}>
        {/* Loyalty progress */}
        <Card style={{ padding: "15px", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "26px" }}>🥈</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                <span style={{ fontFamily: F.h, fontSize: "13px", fontWeight: 700, color: C.text }}>
                  Silver Tier
                </span>
                <span style={{ fontFamily: F.b, fontSize: "11px", color: C.muted }}>
                  160 coins to Gold 🥇
                </span>
              </div>
              <Bar used={2840} total={3000} color="#b08030" />
            </div>
          </div>
        </Card>

        {/* Daily reward */}
        {!senior && showReward && (
          <div style={{
            background: `linear-gradient(135deg, ${C.yellowL}, ${C.amberL})`,
            borderRadius: "16px", padding: "14px 16px", border: `1.5px dashed ${C.amber}`,
            display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px",
            position: "relative"
          }}>
            <span style={{ fontSize: "28px" }}>🎁</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.text }}>
                Daily Reward Ready!
              </div>
              <div style={{ fontFamily: F.b, fontSize: "12px", color: C.textMed, marginTop: "2px" }}>
                Rescue a meal today → earn +50 bonus coins
              </div>
            </div>
            <button onClick={() => setShowReward(false)}
              style={{
                background: C.amber, border: "none", borderRadius: "10px",
                padding: "7px 14px", cursor: "pointer",
                fontFamily: F.h, fontSize: "12px", fontWeight: 700, color: C.white
              }}>
              Claim
            </button>
          </div>
        )}

        {/* Section header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "12px", marginTop: "4px"
        }}>
          <h2 style={{ fontFamily: F.h, fontSize: sz.h, fontWeight: 900, color: C.text }}>
            Nearby Events
          </h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <span onClick={() => onTab("events")}
              style={{
                fontFamily: F.b, fontSize: "13px", color: C.g700,
                cursor: "pointer", fontWeight: 600, lineHeight: "32px"
              }}>
              See all →
            </span>
          </div>
        </div>

        {events.slice(0, 3).map(e => (
          <EventCard key={e.id} ev={e} nav={nav} senior={senior} />
        ))}
      </div>
      <div style={{ height: "24px" }} />
    </div>
  );
}

/* ── Event Card ─────────────────────────────────────────────── */
function EventCard({ ev, nav, senior }) {
  const sz = senior ? { t: "18px", b: "14px" } : { t: "15px", b: "13px" };
  const avail = pct(ev.total - ev.portions, ev.total);
  return (
    <Card onClick={() => nav("eventDetail", { event: ev })}
      style={{ cursor: "pointer", marginBottom: "12px", transition: "transform 0.15s, box-shadow 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
      <div style={{
        background: `linear-gradient(135deg, ${C.g800}14, ${C.g400}14)`,
        padding: "14px 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start"
      }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <Pill text={ev.tag} color={ev.tagColor} />
          {ev.priv && <Pill text="🔒 Private" color={C.muted} />}
        </div>
        <span style={{ fontSize: "36px" }}>{ev.emoji}</span>
      </div>
      <div style={{ padding: "12px 16px 16px" }}>
        <div style={{
          fontFamily: F.h, fontSize: sz.t, fontWeight: 800, color: C.text,
          marginBottom: "2px"
        }}>{ev.name}</div>
        <div style={{ fontFamily: F.b, fontSize: sz.b, color: C.muted, marginBottom: "10px" }}>
          {ev.org}
        </div>
        <div style={{ display: "flex", gap: "16px", marginBottom: "10px" }}>
          <span style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>📍 {ev.dist}</span>
          <span style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>🕐 {ev.pickup}</span>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>Availability</span>
            <span style={{
              fontFamily: F.h, fontSize: "12px", fontWeight: 700,
              color: ev.portions < 10 ? C.danger : C.g700
            }}>{ev.portions} left of {ev.total}</span>
          </div>
          <Bar used={ev.total - ev.portions} total={ev.total}
            color={ev.portions < 10 ? C.amberD : C.g700} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontFamily: F.h, fontSize: "20px", fontWeight: 900, color: C.g800 }}>
              ${ev.price.toFixed(2)}
            </span>
            <span style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}> / portion</span>
          </div>
          <SmBtn bg={C.g800} color={C.white}
            onClick={e => { e.stopPropagation(); nav("eventDetail", { event: ev }); }}>
            Reserve →
          </SmBtn>
        </div>
      </div>
    </Card>
  );
}

/* ── Events Browse ──────────────────────────────────────────── */
function Events({ nav, senior, events }) {
  const [q, setQ] = useState("");
  const [r, setR] = useState(3);           // radius in km — numeric, drives the slider
  const [srt, setSrt] = useState("dist");
  const { coords: rawLoc, status: locStatus, retry: retryLocation } = useUserLocation();

  // This prototype's events are hardcoded around London. If the detected
  // location is implausibly far from all of them, fall back to the demo
  // anchor so the radius slider still has real examples to show.
  const nearestRealKm = rawLoc
    ? Math.min(...events.map(e => haversineKm(rawLoc.lat, rawLoc.lng, e.lat, e.lng)))
    : Infinity;
  const demoMode = !rawLoc || nearestRealKm > 50;
  const userLoc = demoMode ? DEFAULT_LOC : rawLoc;

  // Real distance from the effective location to every event
  const withDistance = events.map(e => {
    const distKm = haversineKm(userLoc.lat, userLoc.lng, e.lat, e.lng);
    return { ...e, distKm, dist: `${distKm.toFixed(1)} km` };
  });

  const searched = withDistance.filter(e =>
    e.name.toLowerCase().includes(q.toLowerCase()) ||
    e.org.toLowerCase().includes(q.toLowerCase())
  );

  let hits = searched
    .filter(e => e.distKm <= r)
    .sort((a, b) => srt === "price" ? a.price - b.price
      : srt === "portions" ? b.portions - a.portions
        : a.distKm - b.distKm);

  // Never show a dead-end: if nothing is within range, surface the closest
  // matches anyway so the slider always demonstrates something real.
  const noneInRange = hits.length === 0 && searched.length > 0;
  if (noneInRange) {
    hits = [...searched].sort((a, b) => a.distKm - b.distKm).slice(0, 2);
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{
        padding: "52px 18px 16px", background: C.card,
        borderBottom: `1px solid ${C.border}`
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontFamily: F.h, fontSize: "22px", fontWeight: 900, color: C.text }}>
            Discover Events
          </h2>
        </div>
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <span style={{
            position: "absolute", left: "14px", top: "50%",
            transform: "translateY(-50%)", fontSize: "16px"
          }}>🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search events or organisers…"
            style={{
              width: "100%", padding: "12px 12px 12px 42px", borderRadius: "12px",
              border: `1.5px solid ${C.border}`, fontFamily: F.b, fontSize: "14px",
              color: C.text, background: C.bg, outline: "none"
            }}
            onFocus={e => { e.target.style.borderColor = C.g700; }}
            onBlur={e => { e.target.style.borderColor = C.border; }} />
        </div>
        {/* Radius slider */}
        <div style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontFamily: F.h, fontSize: "13px", fontWeight: 800, color: C.text }}>
              📍 Within {r} km
            </span>
            <span style={{ fontFamily: F.b, fontSize: "11px", color: C.faint }}>
              {locStatus === "locating" && "Finding you…"}
              {locStatus !== "locating" && !demoMode && "Using your live location"}
              {locStatus !== "locating" && demoMode && "Demo location (events are based in London)"}
            </span>
          </div>
          <input type="range" min="0.5" max="10" step="0.5" value={r}
            onChange={e => setR(parseFloat(e.target.value))}
            style={{ width: "100%" }} />
          {(locStatus === "denied" || locStatus === "unsupported") && (
            <button onClick={retryLocation}
              style={{
                marginTop: "4px", background: "none", border: "none", padding: 0,
                fontFamily: F.b, fontSize: "11px", color: C.info, cursor: "pointer",
                textDecoration: "underline"
              }}>
              Enable location for accurate distances
            </button>
          )}
        </div>
        {/* Sort chips */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "6px" }}>
          {[["dist", "📍 Nearest"], ["price", "💰 Price"], ["portions", "🍽️ Portions"]].map(([v, l]) => (
            <button key={v} onClick={() => setSrt(v)}
              style={{
                flexShrink: 0, padding: "6px 12px", borderRadius: "20px",
                border: `1.5px solid ${srt === v ? C.teal : C.border}`,
                background: srt === v ? C.tealL : C.card, color: srt === v ? C.teal : C.muted,
                fontFamily: F.h, fontSize: "11px", fontWeight: 600, cursor: "pointer"
              }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "14px 18px" }}>
        <div style={{ fontFamily: F.b, fontSize: "13px", color: C.faint, marginBottom: "14px" }}>
          {noneInRange
            ? `No events within ${r} km — showing the ${hits.length} closest`
            : `${hits.length} event${hits.length !== 1 ? "s" : ""} within ${r} km`}
        </div>
        {hits.map(e => <EventCard key={e.id} ev={e} nav={nav} senior={senior} />)}
        {!hits.length && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
            <div style={{ fontFamily: F.h, fontSize: "17px", fontWeight: 700, color: C.text }}>No results</div>
            <div style={{ fontFamily: F.b, fontSize: "13px", color: C.muted, marginTop: "6px" }}>
              Try a different search or wider radius
            </div>
          </div>
        )}
      </div>
      <div style={{ height: "16px" }} />
    </div>
  );
}

/* ── Map View (simulated) ───────────────────────────────────── */
function MapView({ nav, events }) {
  const [sel, setSel] = useState(null);

  const pins = events.slice(0, 8).map((ev, i) => ({
    id: ev.id,
    x: 25 + (i % 4) * 17,
    y: 30 + Math.floor(i / 4) * 30,
    color: [C.danger, C.g700, C.amber, C.purple][i % 4],
    ev,
  }));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
      <BackBtn nav={nav} />
      <div style={{
        position: "relative", height: "55%", flexShrink: 0,
        background: "linear-gradient(135deg,#cde8d4 0%,#a8d5b4 40%,#b8dfc0 100%)",
        overflow: "hidden"
      }}>
        {/* Fake roads */}
        {[[0, 45, 100, 45], [0, 65, 100, 65], [35, 0, 35, 100], [62, 0, 62, 100]].map(([x1, y1, x2, y2], i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${x1}%`, top: `${y1}%`,
            width: y1 === y2 ? "100%" : "1px", height: x1 === x2 ? "100%" : "1px",
            background: "rgba(255,255,255,0.55)", pointerEvents: "none"
          }} />
        ))}
        {/* User position */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-50%)"
        }}>
          <div style={{
            width: "18px", height: "18px", borderRadius: "50%",
            background: C.info, border: "3px solid white",
            boxShadow: "0 0 0 6px rgba(59,130,246,0.25)"
          }} />
        </div>
        {/* Event pins */}
        {pins.map(p => (
          <div key={p.id} onClick={() => setSel(p.id === sel ? null : p.id)}
            style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
              transform: "translate(-50%,-100%)", cursor: "pointer",
              filter: p.id === sel ? "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" : "none",
              transition: "filter 0.15s"
            }}>
            <div style={{
              background: p.color, borderRadius: "50% 50% 50% 0",
              transform: "rotate(-45deg)", width: "36px", height: "36px",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2.5px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
              fontSize: "16px", transform: "rotate(-45deg)"
            }}>
              <span style={{ transform: "rotate(45deg)" }}>{p.ev.emoji}</span>
            </div>
          </div>
        ))}
        {/* Map label */}
        <div style={{
          position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.85)", borderRadius: "20px", padding: "5px 14px",
          fontFamily: F.h, fontSize: "11px", fontWeight: 700, color: C.g900,
          backdropFilter: "blur(4px)"
        }}>
          📍 Your area
        </div>
      </div>
      {/* Bottom sheet */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
        {sel ? (() => {
          const ev = pins.find(p => p.id === sel)?.ev;
          return ev ? (
            <>
              <div style={{
                fontFamily: F.h, fontSize: "13px", fontWeight: 700,
                color: C.muted, marginBottom: "10px"
              }}>SELECTED EVENT</div>
              <EventCard ev={ev} nav={nav} />
            </>
          ) : null;
        })() : (
          <>
            <div style={{
              fontFamily: F.h, fontSize: "13px", fontWeight: 700,
              color: C.muted, marginBottom: "10px"
            }}>ALL NEARBY</div>
            {events.map(e => (
              <div key={e.id} onClick={() => nav("eventDetail", { event: e })}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px", background: C.card, borderRadius: "14px",
                  border: `1px solid ${C.border}`, marginBottom: "8px", cursor: "pointer"
                }}>
                <span style={{ fontSize: "28px" }}>{e.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: F.h, fontSize: "14px", fontWeight: 700,
                    color: C.text, whiteSpace: "nowrap", overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>{e.name}</div>
                  <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>
                    {e.dist} · {e.portions} portions
                  </div>
                </div>
                <Pill text={`$${e.price.toFixed(2)}`} color={C.g700} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Event Detail ───────────────────────────────────────────── */
function EventDetail({ nav, ev, senior }) {
  const [sel, setSel] = useState(null);
  if (!ev) return null;
  const sz = senior ? { h: "23px", body: "16px" } : { h: "19px", body: "14px" };
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{
        background: `linear-gradient(140deg,${C.g950},${C.g700})`,
        padding: "52px 20px 36px", textAlign: "center", position: "relative"
      }}>
        <BackBtn nav={nav} dark />
        <div style={{ fontSize: "60px", marginBottom: "12px" }}>{ev.emoji}</div>
        <h1 style={{
          fontFamily: F.h, fontSize: sz.h, fontWeight: 900, color: C.white,
          marginBottom: "5px", letterSpacing: "-0.3px"
        }}>{ev.name}</h1>
        <p style={{ fontFamily: F.b, fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>{ev.org}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "7px", marginTop: "12px" }}>
          <Pill text={ev.tag} color={ev.tagColor} bg="rgba(255,255,255,0.15)" />
          {ev.priv && <Pill text="🔒 Private" color="rgba(255,255,255,0.8)" bg="rgba(255,255,255,0.1)" />}
        </div>
      </div>

      <div style={{ padding: "0 18px" }}>
        {/* Info strip */}
        <Card style={{
          marginTop: "-18px", padding: "16px",
          display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0"
        }}>
          {[["📍", ev.dist, "Distance"], ["🕐", ev.pickup.split("–")[0].trim(), "From"],
          ["🍽️", `${ev.portions}/${ev.total}`, "Portions"]].map(([ic, v, l], i) => (
            <div key={l} style={{
              textAlign: "center",
              borderRight: i < 2 ? `1px solid ${C.borderLight}` : "none"
            }}>
              <div style={{ fontSize: "18px" }}>{ic}</div>
              <div style={{
                fontFamily: F.h, fontSize: "15px", fontWeight: 800, color: C.text,
                marginTop: "3px"
              }}>{v}</div>
              <div style={{ fontFamily: F.b, fontSize: "10px", color: C.faint }}>{l}</div>
            </div>
          ))}
        </Card>

        {/* Availability */}
        <div style={{ marginTop: "14px", marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontFamily: F.h, fontSize: "13px", fontWeight: 700, color: C.text }}>
              Availability
            </span>
            <span style={{
              fontFamily: F.h, fontSize: "13px", fontWeight: 700,
              color: ev.portions < 10 ? C.danger : C.g700
            }}>
              {ev.portions} left
            </span>
          </div>
          <Bar used={ev.total - ev.portions} total={ev.total}
            color={ev.portions < 10 ? C.amberD : C.g700} h={8} />
        </div>

        {/* Impact teaser */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <div style={{
            flex: 1, background: C.g50, borderRadius: "14px", padding: "12px",
            border: `1px solid ${C.g200}`, textAlign: "center"
          }}>
            <div style={{ fontSize: "20px" }}>🌿</div>
            <div style={{ fontFamily: F.h, fontSize: "16px", fontWeight: 800, color: C.g800 }}>
              {ev.carbon} kg
            </div>
            <div style={{ fontFamily: F.b, fontSize: "10px", color: C.muted }}>CO₂ saved</div>
          </div>
          <div style={{
            flex: 1, background: C.yellowL, borderRadius: "14px", padding: "12px",
            border: `1px solid ${C.yellowD}44`, textAlign: "center"
          }}>
            <div style={{ fontSize: "20px" }}>🪙</div>
            <div style={{ fontFamily: F.h, fontSize: "16px", fontWeight: 800, color: C.yellowD }}>
              +{Math.round(ev.price * 20)} coins
            </div>
            <div style={{ fontFamily: F.b, fontSize: "10px", color: C.muted }}>you'll earn</div>
          </div>
          <div style={{
            flex: 1, background: C.infoL, borderRadius: "14px", padding: "12px",
            border: `1px solid ${C.info}33`, textAlign: "center"
          }}>
            <div style={{ fontSize: "20px" }}>📍</div>
            <div style={{
              fontFamily: F.h, fontSize: "12px", fontWeight: 800, color: C.info,
              lineHeight: 1.2
            }}>{ev.addr.split(",")[0]}</div>
            <div style={{ fontFamily: F.b, fontSize: "10px", color: C.muted }}>address</div>
          </div>
        </div>

        {/* Menu */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{
            fontFamily: F.h, fontSize: "16px", fontWeight: 900, color: C.text,
            marginBottom: "12px"
          }}>Today's Menu</div>
          {ev.menu.map(cat => (
            <div key={cat.cat} style={{ marginBottom: "10px" }}>
              <div style={{
                fontFamily: F.h, fontSize: "11px", fontWeight: 800,
                color: C.g700, letterSpacing: "1px", marginBottom: "6px"
              }}>
                {cat.cat.toUpperCase()}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {cat.items.map(item => (
                  <div key={item} style={{
                    background: C.g50, border: `1px solid ${C.g200}`,
                    borderRadius: "10px", padding: "6px 12px",
                    fontFamily: F.b, fontSize: "13px", color: C.g900
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Portion select */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{
            fontFamily: F.h, fontSize: "16px", fontWeight: 900, color: C.text,
            marginBottom: "12px"
          }}>Choose Your Order</div>
          {[
            {
              id: "normal", label: "Normal Portions", sub: "Up to 2 portions per order", price: ev.price,
              tag: "Standard", coins: Math.round(ev.price * 20), icon: "🍽️"
            },
            {
              id: "family", label: "Family Bundle", sub: "One large family-sized portion", price: ev.familyPrice,
              tag: "Best Value", coins: Math.round(ev.familyPrice * 20), icon: "👨‍👩‍👧"
            },
          ].map(opt => (
            <div key={opt.id} onClick={() => setSel(opt.id)}
              style={{
                border: `2px solid ${sel === opt.id ? C.g700 : C.border}`,
                borderRadius: "16px", padding: "14px 16px", cursor: "pointer",
                background: sel === opt.id ? C.g50 : C.card,
                marginBottom: "10px", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: "12px"
              }}>
              <span style={{ fontSize: "28px" }}>{opt.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "7px", alignItems: "center", marginBottom: "3px" }}>
                  <span style={{ fontFamily: F.h, fontSize: "15px", fontWeight: 800, color: C.text }}>
                    {opt.label}
                  </span>
                  <Pill text={opt.tag} color={C.g700} />
                </div>
                <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>{opt.sub}</div>
                <div style={{ fontFamily: F.b, fontSize: "11px", color: C.amber, marginTop: "3px" }}>
                  🪙 Earn +{opt.coins} coins
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: F.h, fontSize: "18px", fontWeight: 900, color: C.g800 }}>
                  ${opt.price.toFixed(2)}
                </div>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%", marginTop: "6px",
                  border: `2px solid ${sel === opt.id ? C.g700 : C.border}`,
                  background: sel === opt.id ? C.g700 : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginLeft: "auto"
                }}>
                  {sel === opt.id && <div style={{
                    width: "9px", height: "9px",
                    borderRadius: "50%", background: C.white
                  }} />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Btn onClick={() => nav("order", {
          order: {
            ev, type: sel,
            price: sel === "family" ? ev.familyPrice : ev.price
          }
        })}
          disabled={!sel}
          style={{
            width: "100%", marginBottom: "28px", padding: "16px",
            borderRadius: "14px", fontSize: "16px"
          }}>
          Continue to Payment →
        </Btn>
      </div>
    </div>
  );
}

/* ── Checkout ───────────────────────────────────────────────── */
function Checkout({ nav, order, completeOrder }) {
  const [pm, setPm] = useState("card1");
  const [del, setDel] = useState(false);
  if (!order) return null;
  const fee = 0.30;
  const delivFee = del ? 1.99 : 0;
  const total = order.price + fee + delivFee;
  const coins = Math.round(total * 20);
  const cards = [
    { id: "card1", label: "Visa •••• 4242", icon: "💳" },
    { id: "card2", label: "Mastercard •••• 8891", icon: "💳" },
    { id: "apple", label: "Apple Pay", icon: "🍎" },
  ];
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{
        padding: "52px 18px 16px", background: C.card,
        borderBottom: `1px solid ${C.border}`, position: "relative"
      }}>
        <BackBtn nav={nav} />
        <h2 style={{
          fontFamily: F.h, fontSize: "22px", fontWeight: 900, color: C.text,
          marginTop: "28px"
        }}>Checkout</h2>
      </div>

      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Summary */}
        <Card style={{ padding: "16px" }}>
          <div style={{
            fontFamily: F.h, fontSize: "15px", fontWeight: 800, color: C.text,
            marginBottom: "14px"
          }}>Order Summary</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <span style={{ fontSize: "30px" }}>{order.ev.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.h, fontSize: "14px", fontWeight: 700, color: C.text }}>
                {order.ev.name}
              </div>
              <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>
                {order.type === "family" ? "Family Bundle × 1" : "Normal Portions × 2"}
              </div>
              <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>
                🕐 Pickup: {order.ev.pickup}
              </div>
            </div>
          </div>
          <Divider />
          {[["Subtotal", `$${order.price.toFixed(2)}`],
          ["Service Fee", `$${fee.toFixed(2)}`],
          del && ["Delivery", `$${delivFee.toFixed(2)}`],
          ].filter(Boolean).map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
              <span style={{ fontFamily: F.b, fontSize: "14px", color: C.muted }}>{l}</span>
              <span style={{ fontFamily: F.b, fontSize: "14px", color: C.text }}>{v}</span>
            </div>
          ))}
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: "8px", paddingTop: "10px", borderTop: `1px solid ${C.border}`
          }}>
            <span style={{ fontFamily: F.h, fontSize: "16px", fontWeight: 900, color: C.text }}>Total</span>
            <span style={{ fontFamily: F.h, fontSize: "20px", fontWeight: 900, color: C.g800 }}>
              ${total.toFixed(2)}
            </span>
          </div>
        </Card>

        {/* Coins earned */}
        <div style={{
          background: C.yellowL, borderRadius: "14px", padding: "13px 16px",
          border: `1px solid ${C.yellowD}55`, display: "flex", alignItems: "center", gap: "12px"
        }}>
          <span style={{ fontSize: "24px" }}>🪙</span>
          <div>
            <div style={{ fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.text }}>
              You'll earn +{coins} coins!
            </div>
            <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>
              Added to your Silver Tier balance
            </div>
          </div>
        </div>

        {/* Delivery toggle — NEW v2 feature */}
        <Card style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: del ? `${C.teal}18` : C.g50,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", transition: "background 0.2s"
            }}>
              {del ? "🛵" : "🚶"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.text }}>
                Add Delivery
              </div>
              <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>
                {del ? "Delivered to your door · +$1.99" : "Collect in person (free)"}
              </div>
            </div>
            <Toggle on={del} onToggle={() => setDel(d => !d)} onColor={C.teal} />
          </div>
          {del && (
            <div style={{
              marginTop: "12px", padding: "12px", background: C.tealL,
              borderRadius: "10px", border: `1px solid ${C.teal}33`
            }}>
              <div style={{ fontFamily: F.b, fontSize: "12px", color: C.teal }}>
                📦 Estimated delivery: within 40–60 minutes of pickup window
              </div>
            </div>
          )}
        </Card>

        {/* Payment methods */}
        <Card style={{ padding: "16px" }}>
          <div style={{
            fontFamily: F.h, fontSize: "15px", fontWeight: 800, color: C.text,
            marginBottom: "12px"
          }}>Payment Method</div>
          {cards.map(c => (
            <div key={c.id} onClick={() => setPm(c.id)}
              style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "12px",
                borderRadius: "12px", border: `2px solid ${pm === c.id ? C.g800 : C.border}`,
                background: pm === c.id ? `${C.g800}0d` : C.card,
                cursor: "pointer", marginBottom: "8px", transition: "all 0.15s"
              }}>
              <span style={{ fontSize: "22px" }}>{c.icon}</span>
              <span style={{ fontFamily: F.b, fontSize: "14px", color: C.text, flex: 1 }}>{c.label}</span>
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%",
                border: `2px solid ${pm === c.id ? C.g800 : C.border}`,
                background: pm === c.id ? C.g800 : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {pm === c.id && <div style={{
                  width: "8px", height: "8px",
                  borderRadius: "50%", background: C.white
                }} />}
              </div>
            </div>
          ))}
        </Card>

        <Btn onClick={() => {
          completeOrder({ ...order, total, coins, orderId: uid(), delivery: del });
          nav("qr", { order: { ...order, total, coins, orderId: uid(), delivery: del } });
        }}
          style={{
            width: "100%", padding: "16px", borderRadius: "14px", fontSize: "16px",
            marginBottom: "16px"
          }}>
          🔒 Pay ${total.toFixed(2)} & Get QR Code
        </Btn>
      </div>
    </div>
  );
}

/* ── QR Screen ──────────────────────────────────────────────── */
function QRScreen({ nav, order }) {
  const [t, setT] = useState(900);
  useEffect(() => {
    const id = setInterval(() => setT(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(id);
  }, []);
  if (!order) return null;
  const mins = String(Math.floor(t / 60)).padStart(2, "0");
  const secs = String(t % 60).padStart(2, "0");
  const urgent = t < 300;
  const pctLeft = t / 900;

  const QR = () => (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <rect width="180" height="180" fill="white" rx="10" />
      {/* TL */}
      <rect x="12" y="12" width="48" height="48" rx="5" fill={C.g900} />
      <rect x="19" y="19" width="34" height="34" rx="3" fill="white" />
      <rect x="26" y="26" width="20" height="20" rx="1" fill={C.g900} />
      {/* TR */}
      <rect x="120" y="12" width="48" height="48" rx="5" fill={C.g900} />
      <rect x="127" y="19" width="34" height="34" rx="3" fill="white" />
      <rect x="134" y="26" width="20" height="20" rx="1" fill={C.g900} />
      {/* BL */}
      <rect x="12" y="120" width="48" height="48" rx="5" fill={C.g900} />
      <rect x="19" y="127" width="34" height="34" rx="3" fill="white" />
      <rect x="26" y="134" width="20" height="20" rx="1" fill={C.g900} />
      {/* Center logo */}
      <rect x="76" y="76" width="28" height="28" rx="4" fill={C.g800} />
      <text x="90" y="95" textAnchor="middle" fontSize="16" fill="white">🍃</text>
      {/* Data modules */}
      {[[72, 12], [82, 12], [92, 12], [102, 12], [112, 12],
      [72, 22], [92, 22], [112, 22], [72, 32], [82, 32], [102, 32],
      [72, 42], [92, 42], [102, 42], [112, 42], [72, 52], [82, 52],
      [12, 72], [22, 72], [42, 72], [62, 72], [72, 72], [92, 72], [112, 72], [132, 72], [152, 72], [162, 72],
      [12, 82], [32, 82], [52, 82], [112, 82], [132, 82], [152, 82], [162, 82],
      [12, 92], [22, 92], [42, 92], [62, 92], [72, 92], [112, 92], [132, 92], [152, 92],
      [12, 102], [32, 102], [62, 102], [82, 102], [102, 102], [132, 102], [152, 102], [162, 102],
      [12, 112], [22, 112], [42, 112], [52, 112], [72, 112], [112, 112], [132, 112], [152, 112], [162, 112],
      [72, 128], [82, 128], [102, 128], [122, 128], [142, 128], [162, 128],
      [72, 138], [92, 138], [112, 138], [132, 138], [152, 138],
      [72, 148], [82, 148], [102, 148], [122, 148], [142, 148],
      [72, 158], [92, 158], [112, 158], [132, 158], [162, 158],
      [72, 168], [82, 168], [102, 168], [122, 168], [152, 168]
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="8" height="8" rx="1.5" fill={C.g900} />
      ))}
    </svg>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(140deg,${C.g900},${C.g700})`,
        padding: "52px 20px 32px", textAlign: "center"
      }}>
        <div style={{
          width: "60px", height: "60px", borderRadius: "50%",
          background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "28px", margin: "0 auto 14px",
          border: "2px solid rgba(255,255,255,0.25)"
        }}>✅</div>
        <h2 style={{
          fontFamily: F.h, fontSize: "22px", fontWeight: 900, color: C.white,
          marginBottom: "5px"
        }}>Payment Successful!</h2>
        <p style={{ fontFamily: F.b, fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
          Order {order.orderId} confirmed
        </p>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "8px", marginTop: "12px"
        }}>
          <span style={{ fontSize: "18px" }}>🪙</span>
          <span style={{ fontFamily: F.h, fontSize: "16px", fontWeight: 900, color: C.yellow }}>
            +{order.coins} coins earned!
          </span>
        </div>
        {order.delivery && (
          <div style={{
            marginTop: "10px", display: "inline-flex", alignItems: "center",
            gap: "6px", background: "rgba(255,255,255,0.12)", borderRadius: "20px",
            padding: "6px 16px"
          }}>
            <span>🛵</span>
            <span style={{ fontFamily: F.h, fontSize: "13px", fontWeight: 600, color: C.white }}>
              Delivery ordered
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* QR card */}
        <Card style={{ padding: "22px", textAlign: "center" }}>
          <p style={{ fontFamily: F.b, fontSize: "13px", color: C.muted, marginBottom: "14px" }}>
            Show this QR code at the pickup point
          </p>
          <div style={{
            display: "inline-flex", padding: "16px",
            background: C.bg, borderRadius: "14px", border: `1px solid ${C.border}`,
            marginBottom: "14px",
            outline: urgent ? `3px solid ${C.danger}` : `3px solid ${C.g300}`,
            transition: "outline-color 0.3s"
          }}>
            <QR />
          </div>
          <div style={{
            fontFamily: F.h, fontSize: "14px", fontWeight: 800,
            color: C.g800, letterSpacing: "3px"
          }}>{order.orderId}</div>
        </Card>

        {/* Countdown */}
        <div style={{
          background: urgent ? C.dangerL : C.g50, borderRadius: "16px",
          padding: "18px", border: `2px solid ${urgent ? C.danger : C.g300}`,
          textAlign: "center", transition: "all 0.4s"
        }}>
          <p style={{
            fontFamily: F.b, fontSize: "12px", color: urgent ? C.danger : C.muted,
            marginBottom: "4px", fontWeight: 600
          }}>
            {urgent ? "⚠️ QR code expiring soon!" : "QR code expires in"}
          </p>
          <div style={{
            fontFamily: F.h, fontSize: "52px", fontWeight: 900, lineHeight: 1,
            color: urgent ? C.danger : C.g800, transition: "color 0.4s"
          }}>
            {mins}:{secs}
          </div>
          {/* Progress bar */}
          <div style={{
            height: "4px", background: urgent ? `${C.danger}30` : `${C.g200}`,
            borderRadius: "4px", marginTop: "12px", overflow: "hidden"
          }}>
            <div style={{
              height: "100%", width: `${pctLeft * 100}%`,
              background: urgent ? C.danger : C.g500, borderRadius: "4px",
              transition: "width 1s linear, background 0.4s"
            }} />
          </div>
        </div>

        {/* Details */}
        <Card style={{ padding: "16px" }}>
          <div style={{
            fontFamily: F.h, fontSize: "15px", fontWeight: 800, color: C.text,
            marginBottom: "14px"
          }}>Collection Details</div>
          {[["📍", "Location", order.ev.addr],
          ["🕐", "Pickup Window", order.ev.pickup],
          ["🍽️", "Order", order.type === "family" ? "Family Bundle × 1" : "Normal Portions × 2"],
          ].map(([ic, l, v]) => (
            <div key={l} style={{
              display: "flex", gap: "10px", marginBottom: "10px",
              alignItems: "flex-start"
            }}>
              <span style={{ fontSize: "18px" }}>{ic}</span>
              <div>
                <div style={{
                  fontFamily: F.b, fontSize: "11px", color: C.faint,
                  textTransform: "uppercase", letterSpacing: "0.5px"
                }}>{l}</div>
                <div style={{
                  fontFamily: F.h, fontSize: "13px", fontWeight: 700,
                  color: C.text, marginTop: "2px"
                }}>{v}</div>
              </div>
            </div>
          ))}
        </Card>

        <Btn onClick={() => nav("pubHome")} bg={C.g200} color={C.g800}
          style={{ width: "100%", marginBottom: "8px", boxShadow: "none" }}>
          Back to Home
        </Btn>
      </div>
    </div>
  );
}

/* ── Orders History ─────────────────────────────────────────── */
function Orders({ nav, orders }) {
  const totalMeals = orders.reduce((sum, o) => sum + o.portions, 0);
  const totalCoins = orders.reduce((sum, o) => sum + o.coins, 0);
  const recent = orders.slice(0, 4);
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{
        padding: "52px 18px 16px", background: C.card,
        borderBottom: `1px solid ${C.border}`
      }}>
        <h2 style={{ fontFamily: F.h, fontSize: "22px", fontWeight: 900, color: C.text }}>
          My Orders
        </h2>
        <p style={{ fontFamily: F.b, fontSize: "13px", color: C.muted, marginTop: "4px" }}>
          Your rescue history
        </p>
      </div>
      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Card style={{ padding: "16px", marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: F.h, fontSize: "20px", fontWeight: 900, color: C.text }}>{totalMeals}</div>
              <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>Meals ordered</div>
            </div>
            <div>
              <div style={{ fontFamily: F.h, fontSize: "20px", fontWeight: 900, color: C.g800 }}>+{totalCoins}</div>
              <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>Coins earned</div>
            </div>
          </div>
        </Card>
        {recent.map(o => (
          <Card key={o.id} style={{ padding: "16px" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: "8px"
            }}>
              <div style={{
                fontFamily: F.h, fontSize: "15px", fontWeight: 800,
                color: C.text, flex: 1, paddingRight: "8px"
              }}>{o.name}</div>
              <Pill text="✓ Collected" color={C.g700} />
            </div>
            <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted, marginBottom: "10px" }}>
              {o.date} · {o.id} · {o.portions} portions
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{
                flex: 1, background: C.g50, borderRadius: "10px", padding: "8px",
                border: `1px solid ${C.g200}`, textAlign: "center"
              }}>
                <div style={{ fontFamily: F.h, fontSize: "13px", fontWeight: 800, color: C.g800 }}>
                  {o.carbon} kg
                </div>
                <div style={{ fontFamily: F.b, fontSize: "10px", color: C.muted }}>CO₂ saved</div>
              </div>
              <div style={{
                flex: 1, background: C.yellowL, borderRadius: "10px", padding: "8px",
                border: `1px solid ${C.yellowD}44`, textAlign: "center"
              }}>
                <div style={{ fontFamily: F.h, fontSize: "13px", fontWeight: 800, color: C.yellowD }}>
                  +{o.coins}🪙
                </div>
                <div style={{ fontFamily: F.b, fontSize: "10px", color: C.muted }}>coins earned</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ── Notifications ──────────────────────────────────────────── */
function Notifications({ nav }) {
  const [read, setRead] = useState({});
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{
        padding: "52px 18px 16px", background: C.card,
        borderBottom: `1px solid ${C.border}`, position: "relative"
      }}>
        <BackBtn nav={nav} />
        <h2 style={{
          fontFamily: F.h, fontSize: "22px", fontWeight: 900, color: C.text,
          marginTop: "28px"
        }}>Notifications</h2>
      </div>
      <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {NOTIFICATIONS.map(n => (
          <div key={n.id} onClick={() => setRead(r => ({ ...r, [n.id]: true }))}
            style={{
              background: C.card, borderRadius: "16px", padding: "14px 16px",
              border: `1px solid ${(n.dot && !read[n.id]) ? C.g300 : C.border}`,
              display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer",
              opacity: read[n.id] ? 0.65 : 1, transition: "opacity 0.2s"
            }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: (n.dot && !read[n.id]) ? C.g100 : C.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", flexShrink: 0, border: `1px solid ${C.border}`
            }}>
              {n.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", gap: "8px", marginBottom: "3px"
              }}>
                <div style={{
                  fontFamily: F.h, fontSize: "14px", fontWeight: 700,
                  color: C.text
                }}>{n.title}</div>
                {n.dot && !read[n.id] && (
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: C.g700, flexShrink: 0, marginTop: "5px"
                  }} />
                )}
              </div>
              <div style={{
                fontFamily: F.b, fontSize: "12px", color: C.muted,
                marginBottom: "4px"
              }}>{n.sub}</div>
              <div style={{ fontFamily: F.b, fontSize: "11px", color: C.faint }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Profile ────────────────────────────────────────────────── */
function Profile({ nav, senior, setSenior }) {
  const [tab, setTab] = useState("stats");
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(140deg,${C.g950},${C.g800})`,
        padding: "52px 18px 32px", textAlign: "center"
      }}>
        <div style={{
          width: "76px", height: "76px", background: "rgba(255,255,255,0.15)",
          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "32px", margin: "0 auto 12px",
          border: "2px solid rgba(255,255,255,0.25)"
        }}>👤</div>
        <div style={{ fontFamily: F.h, fontSize: "22px", fontWeight: 900, color: C.white }}>
          Alex Chen
        </div>
        <div style={{
          fontFamily: F.b, fontSize: "13px", color: "rgba(255,255,255,0.55)",
          marginTop: "3px"
        }}>Silver Tier Member</div>
        <div style={{ display: "flex", justifyContent: "center", gap: "7px", marginTop: "12px" }}>
          <Pill text="🪙 2,840 coins" color={C.yellow} bg="rgba(255,211,102,0.2)" />
          <Pill text="🔥 12-day streak" color="rgba(255,255,255,0.9)" bg="rgba(255,255,255,0.1)" />
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", background: C.card, borderBottom: `1px solid ${C.border}` }}>
        {[["stats", "📊 Stats"], ["achievements", "🏆 Badges"], ["leaderboard", "🥇 Rank"]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              flex: 1, padding: "13px 0", border: "none", background: "none",
              cursor: "pointer", fontFamily: F.h, fontSize: "12px", fontWeight: 700,
              color: tab === id ? C.g800 : C.faint,
              borderBottom: `2.5px solid ${tab === id ? C.g700 : "transparent"}`,
              transition: "color 0.15s"
            }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 18px" }}>
        {tab === "stats" && (
          <>
            {/* Accessibility */}
            <Card style={{ padding: "16px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "24px" }}>♿</span>
                  <div>
                    <div style={{ fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.text }}>
                      Accessibility Mode
                    </div>
                    <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>
                      Larger text & simplified layout
                    </div>
                  </div>
                </div>
                <Toggle on={senior} onToggle={() => setSenior(s => !s)} />
              </div>
            </Card>
            {/* Stats */}
            <Card style={{ padding: "16px", marginBottom: "12px" }}>
              <div style={{
                fontFamily: F.h, fontSize: "15px", fontWeight: 800, color: C.text,
                marginBottom: "14px"
              }}>My Impact</div>
              {[["🍽️", "Meals Rescued", 47], ["🌿", "CO₂ Saved", "23.4 kg"],
              ["💰", "Money Saved", "$68.40"], ["🏆", "Orders", 3], ["🎖️", "Tier", "Silver"]].map(([ic, l, v]) => (
                <div key={l} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: `1px solid ${C.borderLight}`
                }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ fontSize: "18px" }}>{ic}</span>
                    <span style={{ fontFamily: F.b, fontSize: "14px", color: C.muted }}>{l}</span>
                  </div>
                  <span style={{
                    fontFamily: F.h, fontSize: "14px", fontWeight: 800,
                    color: C.text
                  }}>{v}</span>
                </div>
              ))}
            </Card>
            {/* Settings rows */}
            {["🔔 Notifications", "🛡️ Privacy", "📱 Linked Devices", "🚪 Sign Out"].map((item, i) => (
              <div key={i} style={{
                background: C.card, padding: "16px 18px",
                borderBottom: `1px solid ${C.borderLight}`, display: "flex",
                justifyContent: "space-between", alignItems: "center", cursor: "pointer",
                borderRadius: i === 0 ? "12px 12px 0 0" : i === 3 ? "0 0 12px 12px" : "0",
                border: i === 3 ? `1px solid ${C.border}` : undefined
              }}>
                <span style={{
                  fontFamily: F.b, fontSize: "14px",
                  color: i === 3 ? C.danger : C.text
                }}>{item}</span>
                <span style={{ color: C.faint }}>›</span>
              </div>
            ))}
          </>
        )}

        {tab === "achievements" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {ACHIEVEMENTS.map(a => (
              <div key={a.id} style={{
                background: a.earned ? C.card : `${C.bg}`, borderRadius: "16px",
                padding: "16px", border: `1.5px solid ${a.earned ? C.g300 : C.border}`,
                textAlign: "center", opacity: a.earned ? 1 : 0.55,
                boxShadow: a.earned ? `0 2px 12px ${C.g200}` : undefined
              }}>
                <div style={{
                  fontSize: "32px", marginBottom: "8px",
                  filter: a.earned ? "none" : "grayscale(100%)"
                }}>{a.icon}</div>
                <div style={{
                  fontFamily: F.h, fontSize: "13px", fontWeight: 800, color: C.text,
                  marginBottom: "4px"
                }}>{a.name}</div>
                <div style={{
                  fontFamily: F.b, fontSize: "11px", color: C.muted,
                  lineHeight: 1.4
                }}>{a.desc}</div>
                {a.earned && (
                  <div style={{ marginTop: "8px" }}>
                    <Pill text="Earned ✓" color={C.g700} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "leaderboard" && (
          <>
            <div style={{
              fontFamily: F.b, fontSize: "13px", color: C.muted,
              marginBottom: "12px"
            }}>This month · London area</div>
            {LEADERBOARD.map((u, i) => (
              <div key={i} style={{
                background: u.isMe ? C.g50 : C.card, borderRadius: "14px",
                padding: "14px 16px", border: `1.5px solid ${u.isMe ? C.g400 : C.border}`,
                display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px"
              }}>
                <div style={{
                  fontFamily: F.h, fontSize: "22px", width: "32px",
                  textAlign: "center"
                }}>{u.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.text,
                    display: "flex", alignItems: "center", gap: "6px"
                  }}>
                    {u.name}
                    {u.isMe && <Pill text="You" color={C.g700} />}
                  </div>
                  <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>
                    {u.meals} meals rescued
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontFamily: F.h, fontSize: "14px", fontWeight: 900,
                    color: C.yellowD
                  }}>🪙 {u.coins.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <div style={{ height: "20px" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ORGANISER SCREENS
══════════════════════════════════════════════════════════════ */

function OrgHome({ nav, events }) {
  const stats = [
    { icon: "🗓️", v: `${events.filter(ev => getEventStatus(ev.date) !== "completed").length}`, l: "Active Events" },
    { icon: "🍽️", v: "102", l: "Portions Listed" },
    { icon: "❤️", v: "6", l: "Charity Requests" },
    { icon: "🌿", v: "73kg", l: "CO₂ Prevented" },
  ];
  const activeEvents = events.filter(ev => getEventStatus(ev.date) !== "completed");
  const completedEvents = events.filter(ev => getEventStatus(ev.date) === "completed");
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{
        background: `linear-gradient(140deg,${C.purpleD},${C.purple})`,
        padding: "52px 18px 28px"
      }}>
        <p style={{
          fontFamily: F.b, fontSize: "13px", color: "rgba(255,255,255,0.6)",
          marginBottom: "4px"
        }}>Dashboard</p>
        <h1 style={{
          fontFamily: F.h, fontSize: "22px", fontWeight: 900, color: C.white,
          marginBottom: "20px"
        }}>InnovateTech Ltd 🏢</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {stats.map(s => (
            <div key={s.l} style={{
              background: "rgba(255,255,255,0.12)", borderRadius: "14px",
              padding: "14px", border: "1px solid rgba(255,255,255,0.12)"
            }}>
              <span style={{ fontSize: "20px" }}>{s.icon}</span>
              <div style={{
                fontFamily: F.h, fontSize: "22px", fontWeight: 900,
                color: C.white, marginTop: "4px"
              }}>{s.v}</div>
              <div style={{ fontFamily: F.b, fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 18px" }}>
        <Btn onClick={() => nav("createEvent", { event: null })} bg={C.purple}
          icon="+"
          style={{ width: "100%", marginBottom: "18px", padding: "15px" }}>
          Create New Event
        </Btn>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px"
          }}
        >
          <div
            style={{
              fontFamily: F.h,
              fontSize: "17px",
              fontWeight: 900,
              color: C.text
            }}
          >
            Active Events
          </div>

          <span
            onClick={() => nav("orgEvents")}
            style={{
              cursor: "pointer",
              color: C.purple,
              fontWeight: 700
            }}
          >
            See All →
          </span>
        </div>

        {activeEvents.map(ev => (
          <Card key={ev.id} style={{ padding: "16px", marginBottom: "10px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "28px" }}>{ev.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.text,
                  marginBottom: "2px"
                }}>{ev.name}</div>

                <div style={{
                  fontFamily: F.b, fontSize: "12px", color: C.muted,
                  marginBottom: "8px"
                }}>🕐 {ev.pickup} · 📍 {ev.dist}</div>

                <div style={{ marginBottom: "8px" }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    marginBottom: "4px"
                  }}>
                    <span style={{ fontFamily: F.b, fontSize: "11px", color: C.muted }}>
                      Portions claimed
                    </span>
                    <span style={{
                      fontFamily: F.h, fontSize: "11px", fontWeight: 700,
                      color: C.g700
                    }}>{ev.total - ev.portions}/{ev.total}</span>
                  </div>
                  <Bar used={ev.total - ev.portions} total={ev.total} />
                </div>

                <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                  <Pill text={ev.priv ? "🔒 Private" : "🌍 Public"} color={ev.priv ? C.muted : C.g700} />
                  {ev.charReqs > 0 && (
                    <Pill text={`❤️ ${ev.charReqs} charity req${ev.charReqs > 1 ? "s" : ""}`} color={C.amberD} />
                  )}
                </div>

                <SmBtn
                  onClick={(e) => {
                    e.stopPropagation();
                    nav("createEvent", { event: ev });
                  }}
                  bg={C.purpleL}
                  color={C.purple}
                  style={{ marginTop: "8px" }}
                >
                  ✏️ Edit
                </SmBtn>
              </div>
            </div>
          </Card>
        ))}

        <div style={{
          fontFamily: F.h, fontSize: "17px", fontWeight: 900, color: C.text,
          marginTop: "8px", marginBottom: "12px"
        }}>Completed</div>
        {completedEvents.map(ev => (
          <Card key={ev.id} style={{ padding: "14px", marginBottom: "8px", opacity: 0.6 }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "22px" }}>{ev.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: F.h, fontSize: "13px", fontWeight: 700,
                  color: C.text
                }}>{ev.name}</div>
                <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>
                  All portions distributed
                </div>
              </div>
              <Pill text="Done" color={C.muted} />
            </div>
          </Card>
        ))}
      </div>
      <div style={{ height: "20px" }} />
    </div>
  );
}

function OrgEvents({ nav, events }) {
  const activeEvents = events.filter(ev => getEventStatus(ev.date) !== "completed");
  const completedEvents = events.filter(ev => getEventStatus(ev.date) === "completed");

  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{ padding: "52px 18px 16px", background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <h2 style={{ fontFamily: F.h, fontSize: "22px", fontWeight: 900, color: C.text }}>
          My Events
        </h2>
      </div>

      <div style={{ padding: "16px 18px" }}>
        <Btn onClick={() => nav("createEvent", { event: null })} bg={C.purple} icon="+"
          style={{ width: "100%", marginBottom: "16px", padding: "15px" }}>
          Create New Event
        </Btn>

        {events.map(ev => (
          <Card key={ev.id} style={{ padding: "16px", marginBottom: "10px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "28px" }}>{ev.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.text,
                  marginBottom: "2px"
                }}>{ev.name}</div>

                <div style={{
                  fontFamily: F.b, fontSize: "12px", color: C.muted,
                  marginBottom: "8px"
                }}>🕐 {ev.pickup} · 📍 {ev.dist}</div>

                <div style={{ marginBottom: "8px" }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    marginBottom: "4px"
                  }}>
                    <span style={{ fontFamily: F.b, fontSize: "11px", color: C.muted }}>
                      Portions claimed
                    </span>
                    <span style={{
                      fontFamily: F.h, fontSize: "11px", fontWeight: 700,
                      color: C.g700
                    }}>{ev.total - ev.portions}/{ev.total}</span>
                  </div>
                  <Bar used={ev.total - ev.portions} total={ev.total} />
                </div>

                <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                  <Pill text={ev.priv ? "🔒 Private" : "🌍 Public"} color={ev.priv ? C.muted : C.g700} />
                  {ev.charReqs > 0 && (
                    <Pill text={`❤️ ${ev.charReqs} charity req${ev.charReqs > 1 ? "s" : ""}`} color={C.amberD} />
                  )}
                </div>
              </div>

              <SmBtn onClick={() => nav("createEvent", { event: ev })} bg={C.purpleL} color={C.purple}>
                ✏️ Edit
              </SmBtn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ── Create Event ───────────────────────────────────────────── */
function CreateEvent({ nav, addEvent, updateEvent, ev }) {

  const [f, setF] = useState(() => ({
    name: ev?.name ?? "",
    date: ev?.date ?? "",
    from: ev?.pickup?.split("–").map(s => s.trim())[0] ?? "",
    to: ev?.pickup?.split("–").map(s => s.trim())[1] ?? "",
    portions: ev?.total ?? "",
    price: ev?.price ?? "",
    family: ev?.familyPrice ?? "",
    addr: ev?.addr ?? "",
    priv: ev?.priv ?? false,
  }));

  const [menu, setMenu] = useState(() =>
    ev?.menu?.flatMap(m => m.items) ?? [""]
  );

  useEffect(() => {
    if (ev) {
      const [from = "", to = ""] = ev.pickup?.split("–").map(s => s.trim()) ?? ["", ""];
      setF({
        name: ev.name ?? "",
        date: ev.date ?? "",
        from,
        to,
        portions: ev.total ?? "",
        price: ev.price ?? "",
        family: ev.familyPrice ?? "",
        addr: ev.addr ?? "",
        priv: ev.priv ?? false,
      });
      setMenu(ev.menu?.flatMap(m => m.items) ?? [""]);
    } else {
      setF({
        name: "",
        date: "",
        from: "",
        to: "",
        portions: "",
        price: "",
        family: "",
        addr: "",
        priv: false,
      });
      setMenu([""]);
    }
  }, [ev]);

  const up = (k, v) => setF(x => ({ ...x, [k]: v }));
  const inp = {
    width: "100%", padding: "12px 14px", borderRadius: "12px",
    border: `1.5px solid ${C.border}`, fontFamily: F.b, fontSize: "14px",
    color: C.text, background: C.card, outline: "none", transition: "border-color 0.15s"
  };
  const Lbl = ({ c, sub }) => (
    <div style={{ marginBottom: "8px" }}>
      <label style={{
        fontFamily: F.h, fontSize: "13px", fontWeight: 700, color: C.text,
        display: "block"
      }}>{c}</label>
      {sub && <span style={{ fontFamily: F.b, fontSize: "11px", color: C.faint }}>{sub}</span>}
    </div>
  );
  const onFocus = e => { e.target.style.borderColor = C.purple; };
  const onBlur = e => { e.target.style.borderColor = C.border; };

  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{
        padding: "52px 18px 16px", background: C.card,
        borderBottom: `1px solid ${C.border}`, position: "relative"
      }}>
        <BackBtn nav={nav} />
        <h2 style={{
          fontFamily: F.h, fontSize: "22px", fontWeight: 900, color: C.text,
          marginTop: "28px"
        }}>{ev ? "Edit Event" : "Create Event"}</h2>
      </div>

      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Section: Basic Info */}
        <div style={{
          fontFamily: F.h, fontSize: "12px", fontWeight: 800,
          color: C.purple, letterSpacing: "1px"
        }}>EVENT DETAILS</div>

        <div><Lbl c="Event Name" />
          <input placeholder="e.g. Annual Gala Dinner" style={inp}
            value={f.name} onChange={e => up("name", e.target.value)}
            onFocus={onFocus} onBlur={onBlur} /></div>

        <div><Lbl c="Event Date" />
          <input type="date" style={inp} value={f.date}
            onChange={e => up("date", e.target.value)}
            onFocus={onFocus} onBlur={onBlur} /></div>

        <div><Lbl c="Venue Address" />
          <input placeholder="Full address" style={inp}
            value={f.addr} onChange={e => up("addr", e.target.value)}
            onFocus={onFocus} onBlur={onBlur} /></div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div><Lbl c="Pickup From" /><input type="time" style={inp}
            value={f.from} onChange={e => up("from", e.target.value)}
            onFocus={onFocus} onBlur={onBlur} /></div>
          <div><Lbl c="Pickup Until" /><input type="time" style={inp}
            value={f.to} onChange={e => up("to", e.target.value)}
            onFocus={onFocus} onBlur={onBlur} /></div>
        </div>

        <div style={{
          fontFamily: F.h, fontSize: "12px", fontWeight: 800,
          color: C.purple, letterSpacing: "1px"
        }}>PORTIONS & PRICING</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div><Lbl c="Total Estimated Portions" /><input type="number" placeholder="e.g. 40" style={inp}
            value={f.portions} onChange={e => up("portions", e.target.value)}
            onFocus={onFocus} onBlur={onBlur} /></div>
          <div><Lbl c="Price / Portion ($)" /><input type="number" placeholder="3.50" style={inp}
            value={f.price} onChange={e => up("price", e.target.value)}
            onFocus={onFocus} onBlur={onBlur} /></div>
        </div>
        <div><Lbl c="Family Bundle Price ($)" sub="Optional — for bulk family orders" />
          <input type="number" placeholder="6.00" style={inp}
            value={f.family} onChange={e => up("family", e.target.value)}
            onFocus={onFocus} onBlur={onBlur} /></div>

        <div style={{
          fontFamily: F.h, fontSize: "12px", fontWeight: 800,
          color: C.purple, letterSpacing: "1px"
        }}>MENU ITEMS</div>

        {menu.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "8px" }}>
            <input placeholder={`Item ${i + 1}…`} style={{ ...inp, flex: 1 }}
              value={item} onChange={e => { const n = [...menu]; n[i] = e.target.value; setMenu(n); }}
              onFocus={onFocus} onBlur={onBlur} />
            {menu.length > 1 && (
              <button onClick={() => setMenu(m => m.filter((_, j) => j !== i))}
                style={{
                  background: C.dangerL, border: "none", borderRadius: "10px",
                  padding: "0 12px", cursor: "pointer", color: C.danger, fontSize: "18px"
                }}>
                ×
              </button>
            )}
          </div>
        ))}
        <SmBtn onClick={() => setMenu(m => [...m, ""])} bg={C.purpleL} color={C.purple}
          style={{ alignSelf: "flex-start" }}>+ Add Menu Item</SmBtn>

        <div style={{
          fontFamily: F.h, fontSize: "12px", fontWeight: 800,
          color: C.purple, letterSpacing: "1px"
        }}>VISIBILITY</div>

        <Card style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.text }}>
                Event Visibility
              </div>
              <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted, marginTop: "3px" }}>
                {f.priv ? "🔒 Private — charity & invite-only" : "🌍 Public — visible to all users"}
              </div>
            </div>
            <Toggle on={f.priv} onToggle={() => up("priv", !f.priv)} onColor={C.purple} />
          </div>
        </Card>

        <Btn
          onClick={() => {
            const payload = {
              name: f.name,
              org: "InnovateTech Ltd",
              orgEmoji: "🏢",
              date: f.date,
              dist: ev?.dist ?? "0.0 km",
              pickup: `${f.from} – ${f.to}`,
              portions: Number(f.portions) || 0,
              total: Number(f.portions) || 0,
              price: Number(f.price) || 0,
              familyPrice: Number(f.family) || 0,
              emoji: ev?.emoji ?? "🍽️",
              tag: ev?.tag ?? "New",
              tagColor: ev?.tagColor ?? C.g700,
              menu: [{ cat: "Menu", items: menu.filter(Boolean) }],
              carbon: ev?.carbon ?? 0,
              addr: f.addr,
              priv: f.priv,
              charReqs: ev?.charReqs ?? 0,
              lat: ev?.lat ?? DEFAULT_LOC.lat,
              lng: ev?.lng ?? DEFAULT_LOC.lng,
            };

            if (ev) {
              updateEvent(ev.id, payload);
            } else {
              addEvent(payload);
            }

            nav("orgHome");
          }}
          bg={C.purple}
          icon="🚀"
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "14px",
            fontSize: "16px",
            marginBottom: "16px"
          }}
        >
          {ev ? "Save Changes" : "Publish Event"}
        </Btn>
      </div>
    </div>
  );
}

/* ── Chat ───────────────────────────────────────────────────── */
function Chat({ role, events, selChat, setSelChat, chatHistory, setChatHistory }) {
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  const isOrg = role === "organiser";
  const accent = isOrg ? C.purple : C.amberD;

  const activeEvents = events.filter(ev => getEventStatus(ev.date) !== "completed");
  const chatItems = isOrg
    ? activeEvents.flatMap(ev => CHARITY_PARTNERS.map(partner => ({
        chatId: getChatId(ev.id, partner.id),
        event: ev,
        partner,
      })))
    : activeEvents.map(ev => ({
        chatId: getChatId(ev.id, CHARITY_PROFILE.id),
        event: ev,
        orgName: ev.org,
        orgEmoji: ev.orgEmoji,
      }));

  const currentChat = selChat;
  const messages = currentChat ? (chatHistory[currentChat.chatId] || []) : [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentChat]);

  const send = () => {
    if (!input.trim() || !currentChat) return;
    setChatHistory(prev => {
      const next = { ...prev };
      const existing = next[currentChat.chatId] || [];
      next[currentChat.chatId] = [
        ...existing,
        { from: isOrg ? "organiser" : "charity", text: input.trim(), time: now() },
      ];
      return next;
    });
    setInput("");
  };

  const openChat = (item) => {
    setSelChat(item);
    setInput("");
  };

  const closeChat = () => setSelChat(null);

  const headerTitle = currentChat
    ? isOrg
      ? currentChat.partner.name
      : currentChat.orgName
    : isOrg
      ? "Charity Partners"
      : "Event Organisers";

  const headerSubtitle = currentChat
    ? `Event: ${currentChat.event?.name || currentChat.eventName || "Unknown event"}`
    : "Coordinate surplus collection";

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", background: C.bg,
      overflow: "hidden"
    }}>
      <div style={{
        padding: "52px 18px 14px", background: C.card,
        borderBottom: `1px solid ${C.border}`
      }}>
        <h2 style={{ fontFamily: F.h, fontSize: "20px", fontWeight: 900, color: C.text }}>
          {headerTitle}
        </h2>
        <p style={{ fontFamily: F.b, fontSize: "13px", color: C.muted }}>
          {headerSubtitle}
        </p>
      </div>

      {!currentChat ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr", gap: "12px"
          }}>
            {chatItems.map((item, index) => {
              const title = isOrg
                ? `${item.partner.name} · ${item.event.name}`
                : `${item.event.name}`;
              const subtitle = isOrg
                ? item.partner.desc
                : `${item.orgName} · ${item.event.pickup}`;
              const badge = isOrg ? item.event.emoji : item.orgEmoji;
              return (
                <Card key={item.chatId} onClick={() => openChat(item)} style={{ padding: "14px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{
                      width: "46px", height: "46px", borderRadius: "18px",
                      background: `${accent}18`, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "22px"
                    }}>{badge}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: F.h, fontSize: "14px", fontWeight: 900, color: C.text }}>
                        {title}
                      </div>
                      <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted, marginTop: "4px" }}>
                        {subtitle}
                      </div>
                    </div>
                    <div style={{ fontFamily: F.b, fontSize: "12px", color: accent }}>
                      Open
                    </div>
                  </div>
                </Card>
              );
            })}
            {chatItems.length === 0 && (
              <Card style={{ padding: "20px", textAlign: "center" }}>
                <div style={{ fontFamily: F.h, fontSize: "15px", color: C.text, marginBottom: "6px" }}>
                  No chats available yet
                </div>
                <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>
                  Create an event or wait for a partner request to start a conversation.
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{
            padding: "12px 18px", background: C.card,
            borderBottom: `1px solid ${C.border}`, display: "flex", gap: "12px", alignItems: "center"
          }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "50%",
              background: `${accent}18`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "20px"
            }}>
              {isOrg ? "❤️" : currentChat.orgEmoji || "🏢"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.text }}>
                {headerTitle}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: C.g500 }} />
                <span style={{ fontFamily: F.b, fontSize: "11px", color: C.g700 }}>Online now</span>
              </div>
            </div>
            <SmBtn onClick={closeChat} bg={`${accent}18`} color={accent} style={{ fontSize: "11px" }}>
              ← Back
            </SmBtn>
          </div>

          <div style={{
            flex: 1, overflowY: "auto", padding: "14px 16px",
            display: "flex", flexDirection: "column", gap: "10px"
          }}>
            {messages.map((m, i) => {
              const mine = (isOrg && m.from === "organiser") || (!isOrg && m.from === "charity");
              return (
                <div key={i} style={{
                  display: "flex", flexDirection: mine ? "row-reverse" : "row",
                  gap: "8px", alignItems: "flex-end"
                }}>
                  {!mine && (
                    <div style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      background: `${accent}18`, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "14px", flexShrink: 0
                    }}>
                      {isOrg ? "❤️" : currentChat.orgEmoji || "🏢"}
                    </div>
                  )}
                  <div style={{ maxWidth: "74%" }}>
                    <div style={{
                      background: mine ? accent : C.card, color: mine ? C.white : C.text,
                      borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      padding: "10px 14px", fontFamily: F.b, fontSize: "14px", lineHeight: 1.5,
                      border: mine ? "none" : `1px solid ${C.border}`,
                      boxShadow: mine ? `0 2px 8px ${accent}33` : `0 1px 4px ${C.shadow}`
                    }}>
                      {m.text}
                    </div>
                    <div style={{
                      fontFamily: F.b, fontSize: "10px", color: C.faint,
                      marginTop: "4px", textAlign: mine ? "right" : "left"
                    }}>{m.time}</div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <div style={{
            padding: "10px 14px 18px", background: C.card,
            borderTop: `1px solid ${C.border}`, display: "flex", gap: "8px", alignItems: "center"
          }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Type a message…"
              style={{
                flex: 1, padding: "12px 16px", borderRadius: "24px",
                border: `1.5px solid ${C.border}`, fontFamily: F.b, fontSize: "14px",
                outline: "none", background: C.bg, color: C.text
              }}
              onFocus={e => { e.target.style.borderColor = accent; }}
              onBlur={e => { e.target.style.borderColor = C.border; }} />
            <button onClick={send}
              style={{
                width: "44px", height: "44px", borderRadius: "50%", background: accent,
                border: "none", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "18px", flexShrink: 0,
                boxShadow: `0 2px 10px ${accent}44`
              }}>→</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CHARITY SCREENS
══════════════════════════════════════════════════════════════ */

function CharityHome({ nav, events }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{
        background: `linear-gradient(140deg,#7c2d12,${C.amberD})`,
        padding: "52px 18px 28px"
      }}>
        <p style={{
          fontFamily: F.b, fontSize: "13px", color: "rgba(255,255,255,0.65)",
          marginBottom: "4px"
        }}>Charity Dashboard</p>
        <h1 style={{
          fontFamily: F.h, fontSize: "22px", fontWeight: 900, color: C.white,
          marginBottom: "18px"
        }}>FoodBank Central ❤️</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
          {[["🍽️", "1,240", "Meals Collected"], ["🤝", "8", "Partners"], ["🌿", "486kg", "CO₂ Saved"]].map(([i, v, l]) => (
            <div key={l} style={{
              background: "rgba(255,255,255,0.14)", borderRadius: "12px",
              padding: "12px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)"
            }}>
              <span style={{ fontSize: "18px" }}>{i}</span>
              <div style={{
                fontFamily: F.h, fontSize: "18px", fontWeight: 900, color: C.white,
                marginTop: "2px"
              }}>{v}</div>
              <div style={{ fontFamily: F.b, fontSize: "10px", color: "rgba(255,255,255,0.55)" }}>
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 18px" }}>
        <div style={{
          fontFamily: F.h, fontSize: "17px", fontWeight: 900, color: C.text,
          marginBottom: "14px"
        }}>Available Surplus</div>
        {events.map(ev => (
          <Card key={ev.id} style={{ padding: "16px", marginBottom: "12px" }}>
            <div style={{
              display: "flex", gap: "12px", alignItems: "flex-start",
              marginBottom: "10px"
            }}>
              <span style={{ fontSize: "30px" }}>{ev.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: F.h, fontSize: "14px", fontWeight: 800,
                  color: C.text, marginBottom: "3px"
                }}>{ev.name}</div>
                <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>
                  {ev.org} · {ev.dist}
                </div>
                <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>
                  🕐 {ev.pickup}
                </div>
                <div style={{ marginTop: "6px" }}>
                  <Pill text={`${ev.portions} portions available`}
                    color={ev.portions > 15 ? C.g700 : C.amber} />
                </div>
              </div>
            </div>
            <Bar used={ev.total - ev.portions} total={ev.total} />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <SmBtn bg={C.amberD} color={C.white}
                onClick={() => nav("charityRequest", { event: ev })}
                style={{ flex: 1 }}>
                Request Collection
              </SmBtn>
              <SmBtn onClick={() => nav("charityChat", {
                event: ev,
                chat: {
                  chatId: getChatId(ev.id, CHARITY_PROFILE.id),
                  event: ev,
                  eventId: ev.id,
                  orgName: ev.org,
                  orgEmoji: ev.orgEmoji,
                  partnerId: CHARITY_PROFILE.id,
                  partnerName: ev.org,
                  partnerEmoji: ev.orgEmoji,
                  eventName: ev.name,
                  charityId: CHARITY_PROFILE.id,
                }
              })}
                bg={C.amberL} color={C.amberD}>
                💬 Chat
              </SmBtn>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ height: "20px" }} />
    </div>
  );
}

/* ── Bulk Request ───────────────────────────────────────────── */
function BulkRequest({ nav, ev }) {
  const [portions, setPortions] = useState(10);
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [vehicle, setVehicle] = useState("van");
  if (!ev) return null;
  const inp = {
    width: "100%", padding: "12px 14px", borderRadius: "12px",
    border: `1.5px solid ${C.border}`, fontFamily: F.b, fontSize: "14px",
    color: C.text, outline: "none", background: C.card
  };
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{
        padding: "52px 18px 16px", background: C.card,
        borderBottom: `1px solid ${C.border}`, position: "relative"
      }}>
        <BackBtn nav={nav} />
        <h2 style={{
          fontFamily: F.h, fontSize: "22px", fontWeight: 900, color: C.text,
          marginTop: "28px"
        }}>Request Collection</h2>
      </div>

      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Event banner */}
        <div style={{
          background: C.amberL, borderRadius: "16px", padding: "14px 16px",
          border: `1px solid ${C.amber}55`, display: "flex", gap: "12px", alignItems: "center"
        }}>
          <span style={{ fontSize: "30px" }}>{ev.emoji}</span>
          <div>
            <div style={{ fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.text }}>
              {ev.name}
            </div>
            <div style={{ fontFamily: F.b, fontSize: "12px", color: C.muted }}>
              {ev.org} · Pickup: {ev.pickup}
            </div>
          </div>
        </div>

        {/* Portions slider */}
        <Card style={{ padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontFamily: F.h, fontSize: "14px", fontWeight: 800, color: C.text }}>
              Portions Requested
            </span>
            <span style={{ fontFamily: F.h, fontSize: "26px", fontWeight: 900, color: C.amberD }}>
              {portions}
            </span>
          </div>
          <input type="range" min="1" max={ev.portions} value={portions}
            onChange={e => setPortions(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.amberD }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
            <span style={{ fontFamily: F.b, fontSize: "11px", color: C.muted }}>1 min</span>
            <span style={{ fontFamily: F.b, fontSize: "11px", color: C.muted }}>{ev.portions} max</span>
          </div>
          <div style={{
            marginTop: "10px", padding: "10px 12px",
            background: C.g50, borderRadius: "10px", border: `1px solid ${C.g200}`
          }}>
            <div style={{ fontFamily: F.b, fontSize: "12px", color: C.g800 }}>
              🌿 This collection prevents approx.{" "}
              <strong>{(portions * 0.3).toFixed(1)} kg CO₂</strong> emissions
            </div>
          </div>
        </Card>
        
        {/* Menu */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{
            fontFamily: F.h, fontSize: "16px", fontWeight: 900, color: C.text,
            marginBottom: "12px"
          }}>Today's Menu</div>
          {ev.menu.map(cat => (
            <div key={cat.cat} style={{ marginBottom: "10px" }}>
              <div style={{
                fontFamily: F.h, fontSize: "11px", fontWeight: 800,
                color: C.g700, letterSpacing: "1px", marginBottom: "6px"
              }}>
                {cat.cat.toUpperCase()}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {cat.items.map(item => (
                  <div key={item} style={{
                    background: C.g50, border: `1px solid ${C.g200}`,
                    borderRadius: "10px", padding: "6px 12px",
                    fontFamily: F.b, fontSize: "13px", color: C.g900
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Vehicle type */}
        <div>
          <div style={{
            fontFamily: F.h, fontSize: "13px", fontWeight: 700, color: C.text,
            marginBottom: "10px"
          }}>Collection Vehicle</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[["van", "🚐", "Van"], ["car", "🚗", "Car"], ["bike", "🚲", "Cargo Bike"]].map(([id, ic, l]) => (
              <div key={id} onClick={() => setVehicle(id)}
                style={{
                  flex: 1, textAlign: "center", padding: "10px 8px",
                  borderRadius: "12px", border: `2px solid ${vehicle === id ? C.amberD : C.border}`,
                  background: vehicle === id ? C.amberL : C.card, cursor: "pointer",
                  transition: "all 0.15s"
                }}>
                <div style={{ fontSize: "22px" }}>{ic}</div>
                <div style={{
                  fontFamily: F.h, fontSize: "11px", fontWeight: 700,
                  color: vehicle === id ? C.amberD : C.muted, marginTop: "4px"
                }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label style={{
            fontFamily: F.h, fontSize: "13px", fontWeight: 700, color: C.text,
            display: "block", marginBottom: "8px"
          }}>Collection Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inp}
            onFocus={e => { e.target.style.borderColor = C.amberD; }}
            onBlur={e => { e.target.style.borderColor = C.border; }} />
        </div>

        <div>
          <label style={{
            fontFamily: F.h, fontSize: "13px", fontWeight: 700, color: C.text,
            display: "block", marginBottom: "8px"
          }}>Note to Organiser</label>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="e.g. We serve 80 people daily and can collect all portions…"
            style={{ ...inp, height: "90px", resize: "none" }}
            onFocus={e => { e.target.style.borderColor = C.amberD; }}
            onBlur={e => { e.target.style.borderColor = C.border; }} />
        </div>

        <Btn onClick={() => nav("charityHome")} bg={C.amberD}
          icon="❤️"
          style={{
            width: "100%", padding: "16px", borderRadius: "14px",
            fontSize: "16px", marginBottom: "16px"
          }}>
          Send Collection Request
        </Btn>
      </div>
    </div>
  );
}

/* ── Charity Impact ─────────────────────────────────────────── */
function CharityImpact({ events = [] }) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const vals = [120, 180, 95, 220, 310, 315];
  const max = Math.max(...vals);
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{
        padding: "52px 18px 16px", background: C.card,
        borderBottom: `1px solid ${C.border}`
      }}>
        <h2 style={{ fontFamily: F.h, fontSize: "22px", fontWeight: 900, color: C.text }}>
          Our Impact
        </h2>
        <p style={{ fontFamily: F.b, fontSize: "13px", color: C.muted, marginTop: "4px" }}>
          FoodBank Central · 2025
        </p>
      </div>
      <div style={{ padding: "16px 18px" }}>
        {/* Totals */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px",
          marginBottom: "18px"
        }}>
          {[["🍽️", "1,240", "Meals distributed", C.amberD, C.amberL],
          ["🌿", "486 kg", "CO₂ prevented", C.g700, C.g50],
          ["🤝", "8", "Partner orgs", C.purple, C.purpleL],
          ["⭐", "4.9", "Avg organiser rating", C.yellowD, C.yellowL]].map(([i, v, l, c, bg]) => (
            <div key={l} style={{
              background: bg, borderRadius: "16px", padding: "14px",
              border: `1px solid ${c}33`, textAlign: "center"
            }}>
              <div style={{ fontSize: "22px" }}>{i}</div>
              <div style={{
                fontFamily: F.h, fontSize: "22px", fontWeight: 900,
                color: c, marginTop: "4px"
              }}>{v}</div>
              <div style={{
                fontFamily: F.b, fontSize: "11px", color: C.muted,
                marginTop: "3px"
              }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <Card style={{ padding: "16px", marginBottom: "14px" }}>
          <div style={{
            fontFamily: F.h, fontSize: "15px", fontWeight: 800, color: C.text,
            marginBottom: "16px"
          }}>Meals Collected (2025)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "90px" }}>
            {months.map((m, i) => (
              <div key={m} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", gap: "4px"
              }}>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                  <div style={{
                    width: "100%", background: `linear-gradient(to top,${C.amberD},${C.amber})`,
                    borderRadius: "5px 5px 0 0", height: `${(vals[i] / max) * 100}%`,
                    minHeight: "4px", transition: "height 0.5s"
                  }} />
                </div>
                <div style={{ fontFamily: F.b, fontSize: "10px", color: C.faint }}>{m}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent collections */}
        <div style={{
          fontFamily: F.h, fontSize: "15px", fontWeight: 800, color: C.text,
          marginBottom: "12px"
        }}>Recent Collections</div>
        {events.slice(0, 3).map(ev => (
          <div key={ev.id} style={{
            display: "flex", gap: "12px", padding: "12px",
            background: C.card, borderRadius: "14px", border: `1px solid ${C.border}`,
            marginBottom: "8px", alignItems: "center"
          }}>
            <span style={{ fontSize: "24px" }}>{ev.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.h, fontSize: "13px", fontWeight: 700, color: C.text }}>
                {ev.name}
              </div>
              <div style={{ fontFamily: F.b, fontSize: "11px", color: C.muted }}>{ev.org}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontFamily: F.h, fontSize: "13px", fontWeight: 800,
                color: C.amberD
              }}>{ev.total - ev.portions} portions</div>
              <div style={{ fontFamily: F.b, fontSize: "10px", color: C.muted }}>collected</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: "20px" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════════ */
export default function FoodLoop() {
  const [screen, setScreen] = useState("welcome");
  const [role, setRole] = useState(null);
  const [senior, setSenior] = useState(false);
  const [tab, setTab] = useState("home");
  const [selEv, setSelEv] = useState(null);
  const [selChat, setSelChat] = useState(null);
  const [order, setOrder] = useState(null);
  const [hist, setHist] = useState([]);
  const [notifSeen, setNotifSeen] = useState(false);
  const [events, setEvents] = useState(EVENTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [chatHistory, setChatHistory] = useState(INIT_CHAT_HISTORY);

  const addEvent = (newEv) => {
    setEvents(evs => [...evs, { ...newEv, id: Date.now() }]);
  };

  const updateEvent = (id, patch) => {
    setEvents(evs => evs.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  const completeOrder = (orderData) => {
    setOrders(o => [
      {
        id: orderData.orderId,
        name: orderData.ev.name,
        date: "Today",
        status: "confirmed",
        portions: orderData.type === "family" ? 1 : 2,
        carbon: Number((orderData.ev.carbon * (orderData.type === "family" ? 0.6 : 0.35)).toFixed(1)),
        coins: orderData.coins,
      },
      ...o,
    ]);

    const usedPortions = orderData.type === "family" ? 1 : 2;
    setEvents(evs => evs.map(ev => ev.id === orderData.ev.id
      ? { ...ev, portions: Math.max(ev.portions - usedPortions, 0) }
      : ev
    ));
  };

  const notifCount = notifSeen ? 0 : NOTIFICATIONS.filter(n => n.dot).length;

  /* Google Fonts — Cabinet Grotesk + Plus Jakarta Sans */
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { display: none; }
      input[type=range] { -webkit-appearance: none; height: 6px;
        border-radius: 3px; background: #d8f3dc; cursor: pointer; }
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none; width: 20px; height: 20px;
        border-radius: 50%; background: #e76f51; box-shadow: 0 2px 6px rgba(231,111,81,0.4); }
    `;
    document.head.appendChild(s);
    return () => { if (document.head.contains(s)) document.head.removeChild(s); };
  }, []);

  /* Navigation */
  const nav = (next, params = {}) => {
    if (params.event !== undefined) setSelEv(params.event);
    if (params.chat !== undefined) setSelChat(params.chat);
    if (params.order !== undefined) setOrder(params.order);
    if ((next === "orgChat" || next === "charityChat") && params.chat === undefined) {
      setSelChat(null);
    }
    if (next === "back") {
      setHist(h => {
        const n = [...h]; const prev = n.pop();
        if (prev) setScreen(prev); return n;
      });
      return;
    }
    setHist(h => [...h, screen]);
    setScreen(next);
  };

  /* Tab switching */
  const onTab = (t) => {
    setTab(t);
    if (t === "chat") setSelChat(null);
    const map = {
      public: { home: "pubHome", events: "events", orders: "orders", me: "profile" },
      organiser: { home: "orgHome", events: "orgEvents", chat: "orgChat", me: "profile" },
      charity: { home: "charityHome", events: "charityHome", chat: "charityChat", me: "charityImpact" },
    };
    const dest = map[role]?.[t];
    if (dest) { setHist(h => [...h, screen]); setScreen(dest); }
  };

  /* Which screens show bottom nav */
  const navScreens = [
    "pubHome", "events", "orders", "profile",
    "orgHome", "orgEvents", "orgChat",
    "charityHome", "charityChat", "charityImpact"
  ];

  const darkHeader = ["welcome", "pubHome", "orgHome", "charityHome", "eventDetail", "qr"];
  const stBarColor = darkHeader.includes(screen) ? C.white : C.text;

  /* Quick-switch demo buttons */
  const quickSwitch = [
    { label: "👤 Public", scr: "pubHome", r: "public", bg: C.g800 },
    { label: "🗓️ Organiser", scr: "orgHome", r: "organiser", bg: C.purple },
    { label: "❤️ Charity", scr: "charityHome", r: "charity", bg: C.amberD },
    { label: "✨ Welcome", scr: "welcome", r: null, bg: "#374151" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(145deg, ${C.g950} 0%, #071810 60%, #0d2a1e 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: F.b, padding: "24px 16px", gap: "20px"
    }}>

      {/* Phone chrome */}
      <div style={{
        width: "393px", height: "852px", background: "#0a0a0a",
        borderRadius: "52px", padding: "12px", flexShrink: 0,
        boxShadow: `
          0 60px 120px rgba(0,0,0,0.8),
          0 0 0 1px rgba(255,255,255,0.06),
          inset 0 0 0 1px rgba(255,255,255,0.04)
        ` }}>

        <div style={{
          width: "100%", height: "100%", background: C.bg,
          borderRadius: "42px", overflow: "hidden", display: "flex",
          flexDirection: "column", position: "relative"
        }}>

          {/* Status bar */}
          <div style={{
            padding: "12px 26px 0", display: "flex", justifyContent: "space-between",
            alignItems: "center", flexShrink: 0, position: "absolute",
            top: 0, left: 0, right: 0, zIndex: 30, pointerEvents: "none"
          }}>
            <span style={{
              fontFamily: F.h, fontSize: "12px", fontWeight: 800, color: stBarColor,
              opacity: 0.9
            }}>9:41</span>
            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              <span style={{ fontFamily: F.h, fontSize: "11px", color: stBarColor, opacity: 0.8 }}>
                ●●●●  WiFi  🔋
              </span>
            </div>
          </div>

          {/* Screen content */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
            animation: "screenIn 0.24s cubic-bezier(.16,1,.3,1)"
          }} key={screen}>

            {/* Onboarding */}
            {screen === "welcome" && <Welcome nav={nav} />}
            {screen === "roleSelect" && <RoleSelect nav={nav} setRole={setRole} />}
            {screen === "ageCheck" && <AgeCheck nav={nav} setSenior={setSenior} />}
            {screen === "auth" && <Auth nav={nav} role={role} />}

            {/* Public */}
            {screen === "pubHome" && <PubHome nav={nav} senior={senior} onTab={onTab} setNotifSeen={setNotifSeen} events={events} />}
            {screen === "events" && <Events nav={nav} senior={senior} events={events} />}
            {screen === "mapView" && <MapView nav={nav} events={events} />}
            {screen === "eventDetail" && <EventDetail nav={nav} ev={selEv} senior={senior} />}
            {screen === "order" && <Checkout nav={nav} order={order} completeOrder={completeOrder} />}
            {screen === "qr" && <QRScreen nav={nav} order={order} />}
            {screen === "orders" && <Orders nav={nav} orders={orders} />}
            {screen === "notifications" && <Notifications nav={nav} />}
            {screen === "profile" && <Profile nav={nav} senior={senior} setSenior={setSenior} />}

            {/* Organiser */}
            {screen === "orgHome" && <OrgHome nav={nav} events={events} />}
            {screen === "orgEvents" && <OrgEvents nav={nav} events={events} />}
            {screen === "createEvent" && <CreateEvent nav={nav} ev={selEv} addEvent={addEvent} updateEvent={updateEvent} />}
            {screen === "orgChat" && <Chat role="organiser" events={events} selChat={selChat} setSelChat={setSelChat} chatHistory={chatHistory} setChatHistory={setChatHistory} />}

            {/* Charity */}
            {screen === "charityHome" && <CharityHome nav={nav} events={events} />}
            {screen === "charityRequest" && <BulkRequest nav={nav} ev={selEv} />}
            {screen === "charityChat" && <Chat role="charity" events={events} selChat={selChat} setSelChat={setSelChat} chatHistory={chatHistory} setChatHistory={setChatHistory} />}
            {screen === "charityImpact" && <CharityImpact events={events} />}
          </div>

          {/* Bottom nav */}
          {navScreens.includes(screen) && (
            <BottomNav tab={tab} onChange={onTab} role={role} notifCount={notifCount} />
          )}
        </div>
      </div>

      {/* Quick-switch demo panel */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
        {quickSwitch.map(b => (
          <button key={b.label} onClick={() => {
            if (b.r) setRole(b.r); setTab("home"); setHist([]); setScreen(b.scr);
          }} style={{
            padding: "9px 18px", borderRadius: "10px", border: "none",
            background: b.bg, color: C.white, fontFamily: F.h, fontSize: "12px",
            fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            transition: "transform 0.1s, opacity 0.1s"
          }}
            onMouseDown={e => { e.currentTarget.style.transform = "scale(0.95)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = ""; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
            {b.label}
          </button>
        ))}
      </div>

      <div style={{
        fontFamily: F.b, fontSize: "11px", color: "rgba(255,255,255,0.2)",
        textAlign: "center", lineHeight: 1.6
      }}>
        FoodLoop v2 · by Greendex · Interactive prototype
      </div>

      <style>{`
        @keyframes screenIn {
          from { opacity:0; transform:translateY(10px) scale(0.99); }
          to   { opacity:1; transform:translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}
