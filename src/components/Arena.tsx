"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber"
import * as THREE from "three"
import { BG, BLUE, MAGENTA, Island, ease, lowPoly, rng, type Shared } from "./island"

const SHARDS = 7

/** A collectible: hover makes it glow, a click shatters it for XP, and it respawns. */
function Crystal({
  i,
  count,
  shared,
  onCollect,
}: {
  i: number
  count: number
  shared: React.RefObject<Shared>
  onCollect: () => void
}) {
  const clock = useThree((s) => s.clock)
  const body = useRef<THREE.Mesh>(null)
  const shards = useRef<(THREE.Mesh | null)[]>([])
  const state = useRef({ hover: 0, broken: -1, vel: [] as THREE.Vector3[] })
  const [hovered, setHovered] = useState(false)
  const color = i % 2 ? BLUE : MAGENTA
  const geo = useMemo(() => lowPoly(new THREE.OctahedronGeometry(0.26, 0), 0.05, 40 + i), [i])
  const shardGeo = useMemo(() => new THREE.TetrahedronGeometry(0.07, 0), [])
  const a0 = (i / count) * Math.PI * 2
  const radius = 3.1 + (i % 2) * 0.55
  const height = 0.7 + ((i * 37) % 10) / 10

  useEffect(() => {
    if (!hovered) return
    document.body.style.cursor = "pointer"
    return () => {
      document.body.style.cursor = ""
    }
  }, [hovered])

  useFrame((st, dt) => {
    const t = st.clock.elapsedTime
    const b = body.current
    if (!b) return
    const s = state.current
    const a = a0 + t * 0.12
    const intro = shared.current.boot ? ease((t - shared.current.t0 - 1.2 - i * 0.12) / 0.6) : 1
    b.position.set(Math.cos(a) * radius, height + Math.sin(t * 1.4 + i) * 0.15, Math.sin(a) * radius)
    b.rotation.y += dt * (1.2 + s.hover * 4)
    b.rotation.x = Math.sin(t + i) * 0.3
    s.hover += ((hovered ? 1 : 0) - s.hover) * Math.min(1, dt * 10)
    // Broken: hidden while the shards fly, then it grows back where it was.
    let scale = intro * (1 + s.hover * 0.35)
    if (s.broken >= 0) {
      const since = t - s.broken
      scale *= since < 3.2 ? 0 : ease((since - 3.2) / 0.5)
      shards.current.forEach((m, k) => {
        if (!m) return
        m.visible = since < 1.1
        if (!m.visible) return
        const v = s.vel[k]
        v.y -= dt * 6
        m.position.addScaledVector(v, dt)
        m.rotation.x += dt * 8
        m.rotation.z += dt * 6
        m.scale.setScalar(Math.max(0.001, 1 - since / 1.1))
      })
      if (since > 3.7) s.broken = -1
    }
    b.scale.setScalar(Math.max(0.0001, scale))
    ;(b.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.25 + s.hover * 0.9
  })

  const shatter = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const s = state.current
    const b = body.current
    if (!b || s.broken >= 0) return
    s.broken = clock.elapsedTime
    s.vel = Array.from({ length: SHARDS }, (_, k) => {
      const ang = (k / SHARDS) * Math.PI * 2
      return new THREE.Vector3(Math.cos(ang) * 2.2, 2.5 + (k % 3) * 0.8, Math.sin(ang) * 2.2)
    })
    shards.current.forEach((m) => {
      if (!m) return
      m.position.copy(b.position)
      m.scale.setScalar(1)
    })
    setHovered(false)
    onCollect()
  }

  return (
    <>
      <mesh
        ref={body}
        geometry={geo}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (state.current.broken < 0) setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
        onClick={shatter}
      >
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} flatShading roughness={0.35} metalness={0.1} />
      </mesh>
      {Array.from({ length: SHARDS }, (_, k) => (
        <mesh
          key={k}
          ref={(m) => {
            shards.current[k] = m
          }}
          geometry={shardGeo}
          visible={false}
        >
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </>
  )
}

/** Distant floating rocks, for depth. */
function Debris() {
  const group = useRef<THREE.Group>(null)
  const rocks = useMemo(() => {
    const r = rng(77)
    return Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2 + r()
      const d = 5.5 + r() * 3
      return {
        geo: lowPoly(new THREE.IcosahedronGeometry(0.18 + r() * 0.3, 0), 0.1, 90 + i),
        // Kept behind the island so nothing drifts across the title.
        pos: [Math.cos(a) * d + 3.5, -0.6 + r() * 2.8, -4 - r() * 5] as [number, number, number],
        speed: 0.4 + r() * 0.5,
      }
    })
  }, [])
  useFrame((st) => {
    const g = group.current
    if (!g) return
    const t = st.clock.elapsedTime
    g.children.forEach((c, i) => {
      c.position.y = rocks[i].pos[1] + Math.sin(t * rocks[i].speed + i) * 0.2
      c.rotation.y = t * 0.1 * rocks[i].speed
    })
  })
  return (
    <group ref={group}>
      {rocks.map((r, i) => (
        <mesh key={i} geometry={r.geo} position={r.pos}>
          <meshStandardMaterial color="#cfd4e1" flatShading />
        </mesh>
      ))}
    </group>
  )
}

type Pose = { pos: [number, number, number]; look: [number, number, number] }

/**
 * Where the camera stands for each level. Each pose frames the island in the space the
 * level's panel leaves free: centred for the title, left of a right-hand panel, above a
 * bottom panel, and so on. Tall screens get their own set, with the island kept in the top
 * part above the bottom sheet.
 */
const WIDE: Pose[] = [
  { pos: [0, 1.4, 11.5], look: [0, -1.7, 0] }, // 00 spawn: title screen, island centred above the title
  { pos: [-2.4, 1.8, 7.6], look: [2.3, 0.2, 0] }, // 01 character: panel right, island left
  { pos: [4.2, 2.6, 6.4], look: [-2, 0.2, 0] }, // 02 loadout: panel left, island right
  { pos: [0, 8.4, 6.5], look: [0, -2.2, 0] }, // 03 quests: overhead, panel along the bottom
  { pos: [3.8, 0.3, 8.6], look: [-2.2, 0.9, 0] }, // 04 achievements: low, looking up the beam
  { pos: [-1, 2.6, 13], look: [-4.6, 1.2, 0] }, // 05 co-op: island off to the right of the card
]
const TALL: Pose[] = [
  { pos: [0, 2.2, 17], look: [0, -3.4, 0] },
  { pos: [-3, 3.5, 19], look: [0, -4.6, 0] },
  { pos: [4, 4, 18.5], look: [0, -4.6, 0] },
  { pos: [0, 13, 12], look: [0, -6.5, 0] },
  { pos: [3, 2, 19], look: [0, -4.4, 0] },
  { pos: [0, 5, 21], look: [0, -5.2, 0] },
]

/**
 * Flies the camera to the current level's pose (critically damped, so a quick run of level
 * changes blends rather than queues), adds a little pointer parallax, and meters the frame
 * rate for the HUD.
 */
function Rig({ level, fpsRef }: { level: number; fpsRef?: React.RefObject<HTMLElement | null> }) {
  const pointer = useRef({ x: 0, y: 0 })
  const meter = useRef({ frames: 0, t: 0 })
  const look = useRef(new THREE.Vector3(0, -1.1, 0))
  const goal = useRef(new THREE.Vector3())
  const goalLook = useRef(new THREE.Vector3())
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])
  useFrame((state, dt) => {
    const wide = state.size.width / state.size.height > 1.15
    const pose = (wide ? WIDE : TALL)[level] ?? WIDE[0]
    const cam = state.camera as THREE.PerspectiveCamera
    const p = pointer.current
    goal.current.set(pose.pos[0] - p.x * 0.5, pose.pos[1] + p.y * 0.3, pose.pos[2])
    goalLook.current.set(...pose.look)
    const k = 1 - Math.exp(-dt * 2.4)
    cam.position.lerp(goal.current, k)
    look.current.lerp(goalLook.current, k)
    cam.lookAt(look.current)
    const m = meter.current
    m.frames++
    m.t += dt
    if (m.t > 0.5) {
      if (fpsRef?.current) fpsRef.current.textContent = String(Math.round(m.frames / m.t))
      m.frames = 0
      m.t = 0
    }
  })
  return null
}

function Scene({
  level,
  boot,
  onReady,
  onCollect,
  fpsRef,
}: {
  level: number
  boot: boolean
  onReady: () => void
  onCollect: () => void
  fpsRef?: React.RefObject<HTMLElement | null>
}) {
  const shared = useRef<Shared>({ t0: -1, boot })
  const ready = useRef(false)
  useFrame((st) => {
    const s = shared.current
    if (s.t0 < 0) s.t0 = st.clock.elapsedTime
    // The title comes in once the island has risen (straight away on a repeat visit).
    if (!ready.current && st.clock.elapsedTime - s.t0 > (boot ? 1.5 : 0.05)) {
      ready.current = true
      onReady()
    }
  })
  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 10, 28]} />
      <hemisphereLight args={["#ffffff", "#c2c8dc", 1.25]} />
      <directionalLight position={[4, 7, 3]} intensity={1.6} />
      <directionalLight position={[-5, 2, -4]} intensity={0.5} color="#b9c6ff" />
      <gridHelper args={[70, 70, "#c8cddb", "#d9dde7"]} position={[0, -4.2, 0]} />
      <Rig level={level} fpsRef={fpsRef} />
      <Island shared={shared} />
      {Array.from({ length: 5 }, (_, i) => (
        <Crystal key={i} i={i} count={5} shared={shared} onCollect={onCollect} />
      ))}
      <Debris />
    </>
  )
}

/** The live 3D world behind every level. The camera flies to a new pose for each one. */
export default function Arena({
  level,
  boot,
  onReady,
  onCollect,
  fpsRef,
}: {
  level: number
  boot: boolean
  onReady: () => void
  onCollect: () => void
  fpsRef?: React.RefObject<HTMLElement | null>
}) {
  const [dpr] = useState(() => Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.5 : 1.75))
  return (
    <Canvas
      className="arena-canvas"
      dpr={dpr}
      camera={{ fov: 38, position: [0, 1.5, 11], near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
    >
      <Scene level={level} boot={boot} onReady={onReady} onCollect={onCollect} fpsRef={fpsRef} />
    </Canvas>
  )
}
