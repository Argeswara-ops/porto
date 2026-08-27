import { type PortfolioDataProps } from "./types/configDataTypes";

// Buyer-facing portfolio copy + values — the facts you're expected to make your own: identity,
// biography, the experience/stat numbers, the home intro, and the contact prompt. Presentational
// labels (SYS_SPECS captions, "Role:" / "Yrs:", scoreboard colours) stay in their components; this
// file holds only what a buyer edits. The voice is first-person singular throughout (one developer's
// portfolio) — keep it consistent if you rewrite.
const portfolioData = {
  profile: {
    tagline: "Fullstack Developer",
    heading: "Argeswara Pradana Karamullah",
    role: "Fullstack Web Developer",
    years: "03+",
    bio: [
      "Halo, saya Argeswara Pradana Karamullah, fullstack web developer yang menikmati proses mengubah ide menjadi produk digital yang rapi, fungsional, dan berdampak.",
      "Saya bekerja di sisi frontend dan backend, dari merancang antarmuka yang intuitif hingga membangun API dan sistem yang siap berkembang. Saya percaya pada kode yang jelas, kolaborasi yang terbuka, dan iterasi yang konsisten.",
    ],
    shortBio:
      "Fullstack web developer yang membangun produk digital dengan perhatian pada detail, performa, dan pengalaman pengguna.",
    meta: {
      location: "Indonesia",
      role: "Fullstack Web Developer",
      favorite: "Clean & Useful Product",
    },
    skills: [
      { label: "Frontend", pct: 95 },
      { label: "Backend", pct: 90 },
    ],
  },

  stats: {
    home: ["Focus: Web", "Stack: JS/TS", "Status: Available"],
    profile: ["Class: Fullstack", "Lvl: 03+", "XP: Shipping", "Status: Open"],
  },

  home: {
    tagline: "Argeswara Pradana Karamullah",
    heading: "Fullstack Web Developer",
    intro:
      "Saya merancang dan membangun website serta aplikasi web dari frontend hingga backend. Jelajahi proyek, keahlian, dan cara saya bekerja.",
  },

  contact: {
    prompt: "Punya ide produk digital atau ingin berkolaborasi? Mari ngobrol dan wujudkan solusi web yang tepat.",
  },
} satisfies PortfolioDataProps;

export default portfolioData;
