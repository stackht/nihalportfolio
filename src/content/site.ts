// All visitor-facing content lives here, taken from Nihal's CV.
// PLACEHOLDERS: the GitHub and LinkedIn URLs and the per-project code links. Replace them,
// then flip `LINKS.placeholder` to false.

export const PLAYER = {
  name: "Nihal Mishra",
  first: "Nihal",
  last: "Mishra",
  initials: "NM",
  role: "AI & Data Science student · Software engineer",
  line: "I build full-stack and intelligent systems, from FastAPI backends and Flutter apps to real-time dashboards and ML.",
  status: "Open to internships, hackathon teams and ambitious builds",
}

export const LINKS: {
  email: string
  github: string
  linkedin: string
  resume: string
  /** While true, the contact section says the profile links are placeholders. */
  placeholder: boolean
} = {
  email: "nihalmishra3009@gmail.com",
  github: "https://github.com/",
  linkedin: "https://linkedin.com/",
  resume: "/Nihal_Mishra_CV.pdf",
  placeholder: true,
}

/** The levels, in page order. `key` is the keyboard shortcut in the level select. */
export const LEVELS = [
  { id: "character", n: "01", label: "Character", key: "1" },
  { id: "loadout", n: "02", label: "Loadout", key: "2" },
  { id: "quests", n: "03", label: "Quests", key: "3" },
  { id: "achievements", n: "04", label: "Achievements", key: "4" },
  { id: "coop", n: "05", label: "Co-op", key: "5" },
] as const

export const CHARACTER = {
  heading: "Player one, ready.",
  bio: "I'm Nihal, an AI and data science student and software engineer. I work in Python, Java and TypeScript, and I like the whole stack: backends in FastAPI, Flask and Node.js, mobile apps in Flutter, and enough machine learning and LLM work to make a system think a little.",
  className: "AI & Data Science",
  subclass: "Full-stack engineer",
  stats: [
    { label: "GPA", value: "8.95", note: "B.Tech, AI & DS" },
    { label: "Quests shipped", value: "4", note: "Full-stack builds" },
    { label: "Hackathon wins", value: "1", note: "Project Morpheus 2026" },
    { label: "Languages", value: "4", note: "Java, Python, TS, Dart" },
  ],
  /** Off-duty perks: what Nihal is into outside code. */
  perks: [
    { name: "Sport & fitness", note: "Stamina +10" },
    { name: "Gaming", note: "Reflexes +10" },
    { name: "Film & music", note: "Taste +10" },
  ],
}

export type Rarity = "legendary" | "epic" | "rare" | "common"

/** Skills as an inventory: each group is a row of slots. */
export const LOADOUT: { slot: string; rarity: Rarity; items: { name: string; glyph: string }[] }[] = [
  {
    slot: "Primary · Languages",
    rarity: "legendary",
    items: [
      { name: "Python", glyph: "Py" },
      { name: "Java", glyph: "Jv" },
      { name: "TypeScript", glyph: "TS" },
      { name: "Dart", glyph: "Dt" },
    ],
  },
  {
    slot: "Secondary · Backend",
    rarity: "epic",
    items: [
      { name: "Node.js", glyph: "Nd" },
      { name: "FastAPI", glyph: "Fa" },
      { name: "Flask", glyph: "Fl" },
    ],
  },
  {
    slot: "Gear · Frontend & mobile",
    rarity: "epic",
    items: [
      { name: "Flutter", glyph: "Ft" },
      { name: "React", glyph: "Re" },
    ],
  },
  {
    slot: "Storage · Databases",
    rarity: "rare",
    items: [
      { name: "PostgreSQL", glyph: "Pg" },
      { name: "MySQL", glyph: "My" },
      { name: "MongoDB", glyph: "Mg" },
      { name: "Redis", glyph: "Rd" },
    ],
  },
  {
    slot: "Utility · Tools",
    rarity: "common",
    items: [
      { name: "Git", glyph: "Gt" },
      { name: "GitHub", glyph: "Gh" },
      { name: "Docker", glyph: "Dk" },
      { name: "WebSockets", glyph: "Ws" },
    ],
  },
]

export const QUESTS: {
  id: string
  title: string
  type: "Main quest" | "Side quest"
  badge?: string
  /** 1 to 5. */
  difficulty: number
  summary: string
  points: string[]
  stack: string[]
  code?: string
}[] = [
  {
    id: "gigbit",
    title: "GigBit",
    type: "Main quest",
    badge: "Fintech winner",
    difficulty: 5,
    summary: "A fintech platform for gig workers: instant withdrawals, loan and insurance requests, and live payout visibility.",
    points: [
      "Built the Flutter worker app and web admin portals on one platform.",
      "Designed a modular backend API on PostgreSQL and Redis for transactions, approval pipelines and syncing between worker apps and admin systems.",
      "Won the Fintech domain at the Project Morpheus 2026 hackathon.",
    ],
    stack: ["Flutter", "Node.js", "TypeScript", "PostgreSQL", "Redis"],
  },
  {
    id: "geowatch",
    title: "GeoWatch",
    type: "Main quest",
    difficulty: 4,
    summary: "Real-time incident tracking for large public events, finding risk clusters from live GPS data.",
    points: [
      "Processes GPS-based incident data and detects geospatial risk clusters with DBSCAN.",
      "FastAPI backend with WebSocket updates powering a live monitoring dashboard.",
      "Built with a team of four across mobile, backend and frontend.",
    ],
    stack: ["Flutter", "React", "FastAPI", "PostgreSQL", "WebSockets"],
  },
  {
    id: "aasha",
    title: "AASHA",
    type: "Side quest",
    difficulty: 4,
    summary: "An offline-first healthcare platform that structures patient data from voice and text and flags high-risk cases.",
    points: [
      "Offline-first PWA that keeps working without a connection, using IndexedDB.",
      "Rule-based analytics flag high-risk patients from structured voice and text input.",
      "Secure Flask REST APIs with automatic data sync.",
    ],
    stack: ["React PWA", "Flask", "PostgreSQL", "IndexedDB"],
  },
  {
    id: "gitgo",
    title: "GitGo",
    type: "Side quest",
    difficulty: 3,
    summary: "A VS Code extension that publishes coding solutions to GitHub with a single command.",
    points: [
      "Generates the project folder and README, then runs the Git workflow for you.",
      "A modular pipeline for file processing, documentation and Git automation.",
    ],
    stack: ["TypeScript", "Node.js", "VS Code API", "Git"],
  },
]

export const ACHIEVEMENTS = [
  { title: "Fintech Domain Winner", detail: "Project Morpheus 2026 hackathon, with GigBit", when: "2026", tier: "gold" },
  { title: "Co-founder, RuntimeSync", detail: "A GitHub organisation for open-source work and team workflows", when: "Ongoing", tier: "gold" },
  { title: "AI Agents Intensive", detail: "Kaggle × Google", when: "2025", tier: "silver" },
  { title: "Data Analytics Job Simulation", detail: "Deloitte Australia × Forage", when: "2025", tier: "silver" },
] as const

/** Education as campaign progress. `progress` is 0 to 1. */
export const CAMPAIGN = [
  {
    title: "B.Tech, Artificial Intelligence & Data Science",
    where: "Smt. Indira Gandhi College of Engineering",
    years: "2025 – 2028",
    score: "GPA 8.95",
    progress: 0.4,
    state: "In progress",
  },
  {
    title: "Diploma in Information Technology",
    where: "Saraswati Institute of Technology, Kharghar",
    years: "2022 – 2025",
    score: "87.87%",
    progress: 1,
    state: "Cleared",
  },
]
