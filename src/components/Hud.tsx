"use client"

import { motion } from "framer-motion"
import { LEVELS, PLAYER } from "@/content/site"
import { EASE } from "./motion"

/** Level 00 plus the five content levels, as the HUD sees them. */
export const STAGES = [{ id: "spawn", n: "00", label: "Spawn", key: "0" }, ...LEVELS] as const

/** Top-left player frame: avatar, current level and an XP bar, like an MMO unit frame. */
export function PlayerFrame({ level, bonus }: { level: number; bonus: number }) {
  const stage = STAGES[level]
  // Each level cleared is worth 200 XP; crystals add on top.
  const xp = level * 200 + bonus
  const fill = Math.min(1, level / (STAGES.length - 1))
  return (
    <div className="player-frame">
      <span className="pf-avatar" aria-hidden="true">
        {PLAYER.initials}
      </span>
      <span className="pf-body">
        <span className="pf-name">{PLAYER.name}</span>
        <span className="pf-meta">
          <b>LVL {stage.n}</b> {stage.label}
          <span className="pf-xp">{xp} XP</span>
        </span>
        <span className="pf-bar" aria-hidden="true">
          <motion.i animate={{ scaleX: fill }} initial={false} transition={{ duration: 0.9, ease: EASE }} />
        </span>
      </span>
    </div>
  )
}

/**
 * Top-right minimap and the site's navigation: the island in the middle, a waypoint for each
 * level around it. The current waypoint pulses; visited ones are marked.
 */
export function Minimap({ level, visited, onGo }: { level: number; visited: ReadonlySet<number>; onGo: (i: number) => void }) {
  const n = STAGES.length
  return (
    <nav className="minimap" aria-label="Levels">
      <div className="mm-dial">
        <span className="mm-island" aria-hidden="true" />
        <svg className="mm-ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="38" />
          <motion.circle
            cx="50"
            cy="50"
            r="38"
            className="mm-progress"
            pathLength={1}
            initial={false}
            animate={{ strokeDashoffset: 1 - level / (n - 1) }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </svg>
        <span className="mm-sweep" aria-hidden="true" />
        <ul>
          {STAGES.map((s, i) => {
            // Waypoints run clockwise from the top.
            const a = (i / n) * Math.PI * 2 - Math.PI / 2
            return (
              <li key={s.id} style={{ left: `${50 + Math.cos(a) * 38}%`, top: `${50 + Math.sin(a) * 38}%` }}>
                <button
                  type="button"
                  className="mm-node"
                  data-state={i === level ? "here" : visited.has(i) ? "seen" : "new"}
                  aria-current={i === level ? "step" : undefined}
                  aria-label={`Level ${s.n}, ${s.label}`}
                  onClick={() => onGo(i)}
                >
                  <span className="mm-tip" aria-hidden="true">
                    {s.n} · {s.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <p className="mm-label" aria-live="polite">
        <b>{STAGES[level].n}</b> {STAGES[level].label}
      </p>
    </nav>
  )
}

/** Bottom-right control hints, like a game's button prompts. */
export function Controls() {
  return (
    <p className="controls" aria-hidden="true">
      <span>
        <kbd>↑</kbd>
        <kbd>↓</kbd> or scroll · travel
      </span>
      <span>
        <kbd>0</kbd>–<kbd>5</kbd> warp
      </span>
    </p>
  )
}
