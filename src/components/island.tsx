"use client"

// The arena's building blocks: low-poly helpers and the floating spawn island.

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js"

export const MAGENTA = "#ff2d87"
export const BLUE = "#2f5bff"
export const BG = "#eceef3"

/** Small seeded random, so the island is the same shape on every visit. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Nudges every vertex a little (keeping seams closed) so primitives read as hand-made low poly. */
export function lowPoly(geo: THREE.BufferGeometry, amount: number, seed: number, keep?: (v: THREE.Vector3) => boolean) {
  geo.deleteAttribute("normal")
  geo.deleteAttribute("uv")
  const g = mergeVertices(geo)
  const p = g.getAttribute("position") as THREE.BufferAttribute
  const r = rng(seed)
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    if (keep?.(v)) continue
    p.setXYZ(i, v.x + (r() - 0.5) * amount, v.y + (r() - 0.5) * amount, v.z + (r() - 0.5) * amount)
  }
  g.computeVertexNormals()
  return g
}

export const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3)

export type Shared = {
  /** Seconds since the scene started; drives the respawn intro. */
  t0: number
  boot: boolean
}

const BEAM_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
const BEAM_FRAG = `
  varying vec2 vUv; uniform float uTime; uniform float uPower;
  void main(){
    float fade = smoothstep(1.0, 0.0, vUv.y) * smoothstep(0.0, 0.08, vUv.y);
    float bands = 0.75 + 0.25 * sin(vUv.y * 40.0 - uTime * 6.0);
    vec3 col = mix(vec3(1.0, 0.18, 0.53), vec3(0.18, 0.36, 1.0), vUv.y);
    gl_FragColor = vec4(col, fade * bands * 0.42 * uPower);
  }`
// One island per page, so a module-level uniforms object is safe to share.
const BEAM_UNIFORMS = { uTime: { value: 0 }, uPower: { value: 1 } }

export function Island({ shared }: { shared: React.RefObject<Shared> }) {
  const group = useRef<THREE.Group>(null)
  const beam = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const { top, under, rocks, trees } = useMemo(() => {
    const top = lowPoly(new THREE.CylinderGeometry(2.3, 2.15, 0.5, 11, 1), 0.08, 3)
    const cone = new THREE.ConeGeometry(2.15, 2.9, 11, 3)
    cone.rotateX(Math.PI)
    // The rim that meets the top stays put; everything below it gets roughed up.
    const under = lowPoly(cone, 0.5, 7, (v) => v.y > 1.4)
    const r = rng(11)
    const rocks = Array.from({ length: 4 }, (_, i) => {
      const a = (i / 4) * Math.PI * 2 + 0.6
      return {
        geo: lowPoly(new THREE.IcosahedronGeometry(0.22 + r() * 0.16, 0), 0.08, 20 + i),
        pos: [Math.cos(a) * 1.65, 0.32, Math.sin(a) * 1.65] as [number, number, number],
      }
    })
    const trees = [
      [-1.25, 0.25, -0.85],
      [1.35, 0.25, -0.55],
      [0.55, 0.25, 1.4],
    ].map((pos, i) => ({ pos: pos as [number, number, number], s: 0.85 + i * 0.12 }))
    return { top, under, rocks, trees }
  }, [])

  const beamMat = useRef<THREE.ShaderMaterial>(null)

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const s = shared.current
    // Respawn intro: the beam strikes, then the island rises into it.
    const k = s.boot ? ease((t - s.t0 - 0.35) / 1.3) : 1
    g.position.y = -5 * (1 - k) + Math.sin(t * 0.8) * 0.08
    g.rotation.y += dt * 0.07
    const strike = s.boot ? Math.max(0, 1 - Math.abs(t - s.t0 - 0.45) * 1.6) : 0
    const u = beamMat.current?.uniforms
    if (u) {
      u.uTime.value = t
      u.uPower.value = 0.8 + strike * 1.6 + Math.sin(t * 2.2) * 0.12
    }
    if (beam.current) beam.current.scale.set(1 + strike * 0.5, s.boot ? Math.min(1, (t - s.t0) / 0.45) : 1, 1 + strike * 0.5)
    if (ring.current) ring.current.rotation.z = t * 0.6
  })

  return (
    <group ref={group} scale={0.86}>
      <mesh geometry={top}>
        <meshStandardMaterial color="#f7f8fc" flatShading roughness={0.85} />
      </mesh>
      <mesh geometry={under} position={[0, -1.7, 0]}>
        <meshStandardMaterial color="#c3c9d8" flatShading roughness={0.9} />
      </mesh>
      {/* Spawn pad: a ring of light set into the island. */}
      <mesh ref={ring} position={[0, 0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.78, 6, 1]} />
        <meshBasicMaterial color={MAGENTA} />
      </mesh>
      <mesh position={[0, 0.265, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 6]} />
        <meshBasicMaterial color="#ffd6e8" />
      </mesh>
      {/* Respawn beam: a hexagonal shaft of light, banded and fading upward. */}
      <mesh ref={beam} position={[0, 3.25, 0]}>
        <cylinderGeometry args={[0.55, 0.62, 6, 6, 1, true]} />
        <shaderMaterial
          ref={beamMat}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          uniforms={BEAM_UNIFORMS}
          vertexShader={BEAM_VERT}
          fragmentShader={BEAM_FRAG}
        />
      </mesh>
      <pointLight position={[0, 0.9, 0]} color={MAGENTA} intensity={5} distance={4.5} decay={1.6} />
      {rocks.map((r, i) => (
        <mesh key={i} geometry={r.geo} position={r.pos}>
          <meshStandardMaterial color="#aab2c5" flatShading />
        </mesh>
      ))}
      {trees.map((t, i) => (
        <group key={i} position={t.pos} scale={t.s}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 0.25, 5]} />
            <meshStandardMaterial color="#8b93a8" flatShading />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <coneGeometry args={[0.3, 0.55, 6]} />
            <meshStandardMaterial color={i === 1 ? "#5f7dff" : "#3c55e8"} flatShading />
          </mesh>
          <mesh position={[0, 0.78, 0]}>
            <coneGeometry args={[0.22, 0.42, 6]} />
            <meshStandardMaterial color={i === 1 ? "#7d94ff" : "#5470ff"} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}
