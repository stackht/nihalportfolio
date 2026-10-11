"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle, Trophy, X } from "@phosphor-icons/react"
import { QUESTS } from "@/content/site"
import { EASE } from "./motion"

/**
 * A project's full quest log, over a frosted backdrop. Portalled to <body> so it covers the
 * fixed HUD. Esc closes it; the arrow keys page through the quests.
 */
export default function QuestLog({ index, onClose, onStep }: { index: number; onClose: () => void; onStep: (d: 1 | -1) => void }) {
  const q = QUESTS[index]
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => opener?.focus?.()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowRight") onStep(1)
      else if (e.key === "ArrowLeft") onStep(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, onStep])

  return createPortal(
    <motion.div
      className="quest-log"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ql-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        className="ql-panel"
        initial={{ y: 40, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 24, scale: 0.98 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <header className="ql-head">
          <p className="ql-kicker">
            Quest log · {index + 1} / {QUESTS.length}
          </p>
          <button ref={closeRef} type="button" className="ql-close" onClick={onClose}>
            <X weight="bold" aria-hidden="true" />
            Close
          </button>
        </header>
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            className="ql-body"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="ql-type">
              {q.type} · Difficulty {q.difficulty}/5
            </p>
            <h3 id="ql-title">{q.title}</h3>
            {q.badge && (
              <p className="qc-badge">
                <Trophy weight="fill" aria-hidden="true" />
                {q.badge}
              </p>
            )}
            <p className="ql-summary">{q.summary}</p>
            <p className="ql-section">Objectives</p>
            <ul className="ql-objectives">
              {q.points.map((p) => (
                <li key={p}>
                  <CheckCircle weight="fill" aria-hidden="true" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="ql-section">Rewards · stack</p>
            <p className="qc-rewards">
              {q.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </p>
            {q.code && (
              <a className="btn btn--primary btn--sm" href={q.code} target="_blank" rel="noreferrer">
                View code <ArrowUpRight weight="bold" aria-hidden="true" />
              </a>
            )}
          </motion.div>
        </AnimatePresence>
        <footer className="ql-foot">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onStep(-1)}>
            <ArrowLeft weight="bold" aria-hidden="true" /> Previous
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onStep(1)}>
            Next <ArrowRight weight="bold" aria-hidden="true" />
          </button>
        </footer>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
