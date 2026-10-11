"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import dynamic from "next/dynamic"
import { AnimatePresence, motion } from "framer-motion"
import { Diamond, Trophy } from "@phosphor-icons/react"
import { QUESTS } from "@/content/site"
import { useIntroSkipped, useWebGL } from "./hooks"
import { EASE } from "./motion"
import { Controls, Minimap, PlayerFrame, STAGES } from "./Hud"
import { AchievementsPanel, CharacterPanel, CoopPanel, LoadoutPanel, QuestsPanel, TitleScreen } from "./Levels"
import QuestLog from "./QuestLog"

const Arena = dynamic(() => import("./Arena"), { ssr: false })

type Toast = { id: number; kicker: string; text: string }

// The current level lives in the URL hash, so a level can be linked to and survives a reload.
const LEVEL_EVENT = "nm-level"
const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb)
  window.addEventListener(LEVEL_EVENT, cb)
  return () => {
    window.removeEventListener("hashchange", cb)
    window.removeEventListener(LEVEL_EVENT, cb)
  }
}
const hashLevel = () => Math.max(0, STAGES.findIndex((s) => `#${s.id}` === window.location.hash))

/** True when the element under the pointer can still scroll in that direction (a long panel). */
function scrollsFirst(target: EventTarget | null, dir: 1 | -1) {
  const el = (target as HTMLElement | null)?.closest?.<HTMLElement>("[data-scroll]")
  if (!el) return false
  return dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2
}

export default function Page() {
  const skipped = useIntroSkipped()
  const webgl = useWebGL()
  const level = useSyncExternalStore(subscribe, hashLevel, () => 0)
  const [ready, setReady] = useState(false)
  const [crystals, setCrystals] = useState(0)
  const [quest, setQuest] = useState<number | null>(null)
  const [visited, setVisited] = useState<ReadonlySet<number>>(() => new Set([0]))
  const [banner, setBanner] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const fpsRef = useRef<HTMLSpanElement>(null)
  const lock = useRef(0)
  const bannerTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const go = useCallback((i: number) => {
    const next = Math.max(0, Math.min(STAGES.length - 1, i))
    if (next === hashLevel()) return
    history.replaceState(null, "", next === 0 ? window.location.pathname : `#${STAGES[next].id}`)
    window.dispatchEvent(new Event(LEVEL_EVENT))
    setVisited((v) => (v.has(next) ? v : new Set(v).add(next)))
    // An area title, the way a game names the zone you've just walked into.
    if (next > 0) {
      setBanner(next)
      clearTimeout(bannerTimer.current)
      bannerTimer.current = setTimeout(() => setBanner(null), 1700)
    }
    // Move focus to the new level's title once its panel has mounted.
    setTimeout(() => document.getElementById(`${STAGES[next].id}-h`)?.focus({ preventScroll: true }), 650)
  }, [])
  const step = useCallback((d: 1 | -1) => go(hashLevel() + d), [go])

  const onReady = useCallback(() => setReady(true), [])
  const onCollect = useCallback(() => {
    setCrystals((c) => c + 1)
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-2), { id, kicker: "Crystal collected", text: "+25 XP" }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.boot = ready ? "done" : "hold"
    if (ready) return
    const bail = setTimeout(() => setReady(true), webgl === false ? 0 : 5000)
    return () => clearTimeout(bail)
  }, [ready, webgl])

  // Travel: one level per wheel gesture, swipe or key press. Long panels scroll first.
  useEffect(() => {
    let acc = 0
    let reset: ReturnType<typeof setTimeout>
    const travel = (d: 1 | -1) => {
      const now = performance.now()
      if (now < lock.current || document.querySelector(".quest-log")) return
      lock.current = now + 900
      step(d)
    }
    const onWheel = (e: WheelEvent) => {
      const dir = e.deltaY > 0 ? 1 : -1
      if (scrollsFirst(e.target, dir)) return
      acc += e.deltaY
      clearTimeout(reset)
      reset = setTimeout(() => (acc = 0), 180)
      if (Math.abs(acc) > 40) {
        travel(acc > 0 ? 1 : -1)
        acc = 0
      }
    }
    let startY = 0
    let startTarget: EventTarget | null = null
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
      startTarget = e.target
    }
    const onTouchEnd = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 60) return
      const dir = dy > 0 ? 1 : -1
      if (scrollsFirst(startTarget, dir)) return
      travel(dir)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector(".quest-log")) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      if (/^[0-5]$/.test(e.key)) return go(Number(e.key))
      if (["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !(t && t.closest("button, a")))) {
        e.preventDefault()
        travel(1)
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault()
        travel(-1)
      } else if (e.key === "Home") go(0)
      else if (e.key === "End") go(STAGES.length - 1)
    }
    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("keydown", onKey)
      clearTimeout(reset)
    }
  }, [go, step])

  const seen = visited.has(level) ? visited : new Set(visited).add(level)

  return (
    <div className="game" data-level={level}>
      <div className="world" data-webgl={webgl === false ? "off" : "on"} aria-hidden="true">
        {webgl && <Arena level={level} boot={!skipped} onReady={onReady} onCollect={onCollect} fpsRef={fpsRef} />}
      </div>
      <div className="vignette" aria-hidden="true" />

      <header className="hud-top">
        <PlayerFrame level={level} bonus={crystals * 25} />
        <Minimap level={level} visited={seen} onGo={go} />
      </header>

      <main className="stage">
        <AnimatePresence mode="wait">
          {level === 0 && <TitleScreen key="title" revealed={ready} onGo={go} />}
          {level === 1 && <CharacterPanel key="character" onStep={step} />}
          {level === 2 && <LoadoutPanel key="loadout" onStep={step} />}
          {level === 3 && <QuestsPanel key="quests" onStep={step} onOpen={setQuest} />}
          {level === 4 && <AchievementsPanel key="achievements" onStep={step} />}
          {level === 5 && <CoopPanel key="coop" onStep={step} />}
        </AnimatePresence>
      </main>

      <footer className="hud-bottom">
        <p className="hud-stats">
          <span>
            <Diamond weight="fill" aria-hidden="true" /> {crystals}
            <span className="hs-label"> crystals</span>
          </span>
          <span>
            <span ref={fpsRef}>--</span>
            <span className="hs-label"> fps</span>
          </span>
          {level === 0 && webgl !== false && <span className="hs-hint">Click a crystal to collect it</span>}
        </p>
        <Controls />
      </footer>

      <AnimatePresence>
        {banner !== null && (
          <motion.div
            key={banner}
            className="area-banner"
            aria-hidden="true"
            initial={{ opacity: 0, y: -16, clipPath: "inset(0 50% 0 50%)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0 0% 0 0%)" }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span>Level {STAGES[banner].n}</span>
            <b>{STAGES[banner].label}</b>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="toasts" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className="toast"
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <span className="toast-icon" aria-hidden="true">
                <Trophy weight="fill" />
              </span>
              <span>
                <span className="toast-kicker">{t.kicker}</span>
                <b>{t.text}</b>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {quest !== null && (
          <QuestLog
            key="quest-log"
            index={quest}
            onClose={() => setQuest(null)}
            onStep={(d) => setQuest((q) => (q === null ? q : (q + d + QUESTS.length) % QUESTS.length))}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
