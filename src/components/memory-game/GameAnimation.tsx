import { useEffect, useRef } from 'react'
import type { GamePhase } from '../../hooks/useMemoryGame.ts'
import styles from './GameAnimation.module.scss'

const CONFETTI_COLORS = [
  '#ff5d73',
  '#ffcb3d',
  '#46d7a4',
  '#4ba8ff',
  '#c084fc',
  '#fb923c',
  '#a3e635',
]
const PARTICLE_COUNT = 160
const CONFETTI_DURATION_MS = 3600

type ConfettiParticle = {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  w: number
  h: number
  rot: number
  rotV: number
}

function runConfetti(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles: ConfettiParticle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 340,
    vx: (Math.random() - 0.5) * 4.5,
    vy: 2.5 + Math.random() * 5,
    color:
      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ?? CONFETTI_COLORS[0],
    w: 8 + Math.random() * 10,
    h: 4 + Math.random() * 7,
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.22,
  }))

  let rafId = 0
  const start = performance.now()

  const draw = (now: number) => {
    const elapsed = now - start
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.rot += p.rotV

      const alpha = elapsed < 2500 ? 1 : Math.max(0, 1 - (elapsed - 2500) / 1100)

      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }

    if (elapsed < CONFETTI_DURATION_MS) {
      rafId = requestAnimationFrame(draw)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  rafId = requestAnimationFrame(draw)

  return () => {
    cancelAnimationFrame(rafId)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

type Props = { phase: GamePhase }

export const GameAnimation = ({ phase }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (phase !== 'won') return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    return runConfetti(canvas)
  }, [phase])

  if (phase !== 'won') return null

  return (
    <div className={styles.overlay} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
