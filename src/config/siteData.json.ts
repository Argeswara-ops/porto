import { type SiteDataProps } from "./types/configDataTypes";

// Site metadata. Edit with your project's details.
const siteData = {
  name: "Argeswara",
  title: "Argeswara Pradana Karamullah — Fullstack Web Developer",
  description:
    "Portfolio Argeswara Pradana Karamullah, fullstack web developer yang membangun pengalaman web modern, cepat, dan mudah digunakan.",

  author: {
    name: "Argeswara Pradana Karamullah",
    email: "argeswaraa@gmail.com",
    // Ships EMPTY on purpose: BaseHead only emits `twitter:creator` when this is set, so an unfilled
    // template omits the tag rather than attributing every page to a handle that doesn't exist.
    twitter: "",
  },

  defaultImage: {
    src: "/og.jpg",
    alt: "8-BitQuest",
  },

  // Social/profile URLs, surfaced as the Organization `sameAs` in JSON-LD (see @js/schema) AND used
  // by @config/socialData to point the footer row, the home contact chips and the contact InfoCards
  // at your real profiles. **Fill this before launch:** while it is empty those links fall back to
  // bare platform home pages (github.com, linkedin.com, discord.gg, …).
  // e.g. ["https://x.com/yourhandle", "https://github.com/yourorg"]
  sameAs: [
    "https://github.com/Argeswara-ops",
    "https://www.linkedin.com/in/argeswaraa",
    "https://www.instagram.com/argeswara_",
    "https://www.youtube.com/@ArgesYt",
  ],
} satisfies SiteDataProps;

export default siteData;
