"use client"

import { useState, type ReactNode } from "react"
import { motion } from "framer-motion"
import {
  ArrowUpRight,
  Barbell,
  CaretLeft,
  CaretRight,
  Check,
  Copy,
  EnvelopeSimple,
  FileArrowDown,
  FilmSlate,
  GameController,
  GithubLogo,
  LinkedinLogo,
  Medal,
  Trophy,
} from "@phosphor-icons/react"
import { ACHIEVEMENTS, CAMPAIGN, CHARACTER, LINKS, LOADOUT, PLAYER, QUESTS } from "@/content/site"
import { STAGES } from "./Hud"
import { EASE } from "./motion"

const PERK_ICONS = [Barbell, GameController, FilmSlate]

/** Each level's panel docks to a different side, leaving the rest of the screen to the world. */
export const DOCK = ["title", "right", "left", "bottom", "left", "center"] as const
type Dock = (typeof DOCK)[number]

const ENTER: Record<Dock, { x?: number | string; y?: number | string }> = {
  title: { y: 40 },
  right: { x: 80 },
  left: { x: -80 },
  bottom: { y: 80 },
  center: { y: 40 },
}

/** Staggers the panel's children in after the panel itself slides into its dock. */
const item = {
  hidden: { opacity: 0, y: 14 },
  shown: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay: 0.18 + i * 0.05 } }),
}

function Panel({
  level,
  title,
  sub,
  children,
  onStep,
}: {
  level: number
  title: string
  sub: string
  children: ReactNode
  onStep: (d: 1 | -1) => void
}) {
  const dock = DOCK[level]
  const stage = STAGES[level]
  const from = ENTER[dock]
  return (
    <motion.section
      className={`panel panel--${dock}`}
      aria-labelledby={`${stage.id}-h`}
      initial={{ opacity: 0, ...from }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...(typeof from.x === "number" ? { x: from.x * 0.5 } : {}), ...(typeof from.y === "number" ? { y: from.y * 0.5 } : {}) }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <header className="panel-head">
        <p className="panel-kicker">
          <span className="pk-n">LVL {stage.n}</span>
          {sub}
        </p>
        <h2 id={`${stage.id}-h`} tabIndex={-1}>
          {title}
        </h2>
      </header>
      <motion.div className="panel-body" data-scroll initial="hidden" animate="shown">
        {children}
      </motion.div>
      <footer className="panel-foot">
        <button type="button" className="pf-step" onClick={() => onStep(-1)}>
          <CaretLeft weight="bold" aria-hidden="true" />
          {STAGES[level - 1]?.label ?? "Spawn"}
        </button>
        <span className="pf-count" aria-hidden="true">
          {level} / {STAGES.length - 1}
        </span>
        {level < STAGES.length - 1 ? (
          <button type="button" className="pf-step pf-step--next" onClick={() => onStep(1)}>
            {STAGES[level + 1].label}
            <CaretRight weight="bold" aria-hidden="true" />
          </button>
        ) : (
          <span className="pf-end">Final level</span>
        )}
      </footer>
    </motion.section>
  )
}

/** Level 00: a game's title screen, the name under the island and a vertical main menu. */
export function TitleScreen({ revealed, onGo }: { revealed: boolean; onGo: (i: number) => void }) {
  const menu = [
    { label: "Start game", to: 1 },
    { label: "Quest log", to: 3 },
    { label: "Achievements", to: 4 },
    { label: "Co-op", to: 5 },
  ]
  const show = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: revealed ? { opacity: 1, y: 0 } : undefined,
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
    transition: { duration: 0.8, ease: EASE, delay: 0.3 + i * 0.08 },
  })
  return (
    <motion.section className="title-screen" aria-labelledby="spawn-h" exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <motion.p className="ts-kicker" {...show(0)}>
        {PLAYER.role}
      </motion.p>
      <h1 id="spawn-h" className="ts-name" aria-label={PLAYER.name} tabIndex={-1}>
        {[PLAYER.first, PLAYER.last].map((w, i) => (
          <span key={w} className="title-word-wrap" aria-hidden="true">
            <motion.span
              className="title-word"
              initial={{ y: "110%" }}
              animate={revealed ? { y: "0%" } : undefined}
              transition={{ duration: 1, ease: EASE, delay: i * 0.12 }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </h1>
      <motion.ul className="ts-menu" {...show(1)}>
        {menu.map((m, i) => (
          <li key={m.label}>
            <button type="button" className={i === 0 ? "is-first" : undefined} onClick={() => onGo(m.to)}>
              {m.label}
            </button>
          </li>
        ))}
      </motion.ul>
      <motion.p className="ts-start" {...show(2)} aria-hidden="true">
        Press start
      </motion.p>
    </motion.section>
  )
}

export function CharacterPanel({ onStep }: { onStep: (d: 1 | -1) => void }) {
  return (
    <Panel level={1} title="Character" sub="Player profile" onStep={onStep}>
      <motion.div className="char-head" variants={item} custom={0}>
        <span className="emblem" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <polygon points="50,4 92,27 92,73 50,96 8,73 8,27" />
          </svg>
          <span>{PLAYER.initials}</span>
        </span>
        <span>
          <b className="cc-name">{PLAYER.name}</b>
          <span className="cc-class">
            {CHARACTER.className} · {CHARACTER.subclass}
          </span>
        </span>
      </motion.div>
      <motion.p className="char-bio" variants={item} custom={1}>
        {CHARACTER.bio}
      </motion.p>
      <motion.ul className="stats" variants={item} custom={2}>
        {CHARACTER.stats.map((s) => (
          <li key={s.label}>
            <span className="st-label">{s.label}</span>
            <b className="st-value">{s.value}</b>
            <span className="st-note">{s.note}</span>
          </li>
        ))}
      </motion.ul>
      <motion.p className="sub-title" variants={item} custom={3}>
        Off-duty perks
      </motion.p>
      <motion.ul className="cc-perks" variants={item} custom={4}>
        {CHARACTER.perks.map((p, i) => {
          const Icon = PERK_ICONS[i]
          return (
            <li key={p.name}>
              <Icon weight="duotone" aria-hidden="true" />
              <span>{p.name}</span>
              <em>{p.note}</em>
            </li>
          )
        })}
      </motion.ul>
    </Panel>
  )
}

export function LoadoutPanel({ onStep }: { onStep: (d: 1 | -1) => void }) {
  return (
    <Panel level={2} title="Loadout" sub="Inventory · equipped" onStep={onStep}>
      {LOADOUT.map((row, r) => (
        <motion.div key={row.slot} className="inv-row" variants={item} custom={r}>
          <p className="inv-slot">
            <span className={`rarity rarity--${row.rarity}`}>{row.rarity}</span>
            {row.slot}
          </p>
          <ul>
            {row.items.map((it) => (
              <li key={it.name} className={`slot slot--${row.rarity}`} tabIndex={0}>
                <span className="slot-glyph" aria-hidden="true">
                  {it.glyph}
                </span>
                <span className="slot-name">{it.name}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </Panel>
  )
}

export function QuestsPanel({ onStep, onOpen }: { onStep: (d: 1 | -1) => void; onOpen: (i: number) => void }) {
  return (
    <Panel level={3} title="Quest log" sub="4 completed · open one for details" onStep={onStep}>
      <ul className="quest-grid">
        {QUESTS.map((q, i) => (
          <motion.li key={q.id} variants={item} custom={i}>
            <button type="button" className="quest-card" onClick={() => onOpen(i)} aria-label={`Open the quest log for ${q.title}`}>
              <span className="qc-top">
                <span className={`qc-type${q.type === "Main quest" ? " qc-type--main" : ""}`}>{q.type}</span>
                <span className="pips" aria-label={`Difficulty ${q.difficulty} of 5`}>
                  {Array.from({ length: 5 }, (_, k) => (
                    <i key={k} data-on={k < q.difficulty || undefined} />
                  ))}
                </span>
              </span>
              <span className="qc-title">{q.title}</span>
              {q.badge && (
                <span className="qc-badge">
                  <Trophy weight="fill" aria-hidden="true" />
                  {q.badge}
                </span>
              )}
              <span className="qc-summary">{q.summary}</span>
              <span className="qc-foot">
                <span className="qc-done">
                  <Check weight="bold" aria-hidden="true" /> Completed
                </span>
                <span className="qc-open">
                  Open <ArrowUpRight weight="bold" aria-hidden="true" />
                </span>
              </span>
            </button>
          </motion.li>
        ))}
      </ul>
    </Panel>
  )
}

export function AchievementsPanel({ onStep }: { onStep: (d: 1 | -1) => void }) {
  return (
    <Panel level={4} title="Achievements" sub={`${ACHIEVEMENTS.length} unlocked · campaign ${CAMPAIGN.length}`} onStep={onStep}>
      <ul className="ach-list">
        {ACHIEVEMENTS.map((a, i) => (
          <motion.li key={a.title} className={`ach ach--${a.tier}`} variants={item} custom={i}>
            <span className="ach-icon" aria-hidden="true">
              {a.tier === "gold" ? <Trophy weight="fill" /> : <Medal weight="fill" />}
            </span>
            <span className="ach-text">
              <span className="ach-kicker">Unlocked · {a.when}</span>
              <b>{a.title}</b>
              <span>{a.detail}</span>
            </span>
          </motion.li>
        ))}
      </ul>
      <motion.p className="sub-title" variants={item} custom={4}>
        Campaign progress
      </motion.p>
      {CAMPAIGN.map((c, i) => (
        <motion.div key={c.title} className="camp" variants={item} custom={5 + i}>
          <p className="camp-head">
            <span>{c.state}</span>
            <span>{c.years}</span>
          </p>
          <b>{c.title}</b>
          <p className="camp-where">
            {c.where} · <strong>{c.score}</strong>
          </p>
          <div className="camp-bar" aria-label={`${Math.round(c.progress * 100)}% complete`}>
            <motion.i initial={{ scaleX: 0 }} animate={{ scaleX: c.progress }} transition={{ duration: 1.3, ease: EASE, delay: 0.5 + i * 0.15 }} />
          </div>
        </motion.div>
      ))}
    </Panel>
  )
}

export function CoopPanel({ onStep }: { onStep: (d: 1 | -1) => void }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${LINKS.email}`
    }
  }
  const links = [
    { label: "Email", detail: "Send an invite", href: `mailto:${LINKS.email}`, icon: <EnvelopeSimple weight="regular" /> },
    { label: "GitHub", detail: "Code and RuntimeSync", href: LINKS.github, icon: <GithubLogo weight="regular" />, external: true },
    { label: "LinkedIn", detail: "Experience", href: LINKS.linkedin, icon: <LinkedinLogo weight="regular" />, external: true },
    { label: "CV", detail: "One-page PDF", href: LINKS.resume, icon: <FileArrowDown weight="regular" />, external: true },
  ]
  return (
    <Panel level={5} title="Join the party" sub="Co-op · send an invite" onStep={onStep}>
      <motion.p className="coop-lead" variants={item} custom={0}>
        {PLAYER.status}. If you need another player for an internship, a hackathon squad or an ambitious build, he&apos;s in.
      </motion.p>
      <motion.div className="coop-email" variants={item} custom={1}>
        <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
        <button type="button" className="btn btn--ghost btn--sm" onClick={copy} aria-live="polite">
          {copied ? <Check weight="bold" aria-hidden="true" /> : <Copy weight="bold" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </motion.div>
      <motion.ul className="coop-links" variants={item} custom={2}>
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}>
              <span className="cl-icon">{l.icon}</span>
              <span className="cl-label">{l.label}</span>
              <span className="cl-detail">{l.detail}</span>
              <ArrowUpRight className="cl-arrow" aria-hidden="true" />
            </a>
          </li>
        ))}
      </motion.ul>
      {LINKS.placeholder && (
        <motion.p className="placeholder-note" variants={item} custom={3}>
          GitHub and LinkedIn links are placeholders until the real profiles are added.
        </motion.p>
      )}
    </Panel>
  )
}
