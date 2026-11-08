import { useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { boundsOf, normalizeRect } from './geometry'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './seed'
import { editorStore, useEditor } from './store'
import type { Shape } from './types'

type Point = { x: number; y: number }

type Gesture =
  | { kind: 'drag'; last: Point; moved: boolean }
  | { kind: 'marquee'; start: Point; additive: boolean }

/** A marquee only starts once the pointer has moved this far, so plain clicks stay clicks. */
const MARQUEE_THRESHOLD = 2

function hitTest(shapes: Shape[], p: Point): Shape | undefined {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i]
    if (s.kind === 'rect') {
      if (p.x >= s.x && p.x <= s.x + s.w && p.y >= s.y && p.y <= s.y + s.h) return s
    } else {
      const nx = (p.x - (s.x + s.w / 2)) / (s.w / 2)
      const ny = (p.y - (s.y + s.h / 2)) / (s.h / 2)
      if (nx * nx + ny * ny <= 1) return s
    }
  }
  return undefined
}

function draw(ctx: CanvasRenderingContext2D) {
  const { shapes, selectedIds, marquee } = editorStore.getState()
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.strokeStyle = '#2a2f3a'
  ctx.lineWidth = 1
  for (let x = 0.5; x < CANVAS_WIDTH; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, CANVAS_HEIGHT)
    ctx.stroke()
  }
  for (let y = 0.5; y < CANVAS_HEIGHT; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(CANVAS_WIDTH, y)
    ctx.stroke()
  }

  for (const s of shapes) {
    ctx.fillStyle = s.fill
    ctx.beginPath()
    if (s.kind === 'rect') ctx.rect(s.x, s.y, s.w, s.h)
    else ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2, s.w / 2, s.h / 2, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const selected = shapes.filter((s) => selectedIds.includes(s.id))
  ctx.strokeStyle = '#60a5fa'
  ctx.lineWidth = 2
  for (const s of selected) ctx.strokeRect(s.x - 1, s.y - 1, s.w + 2, s.h + 2)
  if (selected.length > 1) {
    const b = boundsOf(selected)
    ctx.setLineDash([6, 4])
    ctx.strokeStyle = '#93c5fd'
    ctx.lineWidth = 1
    ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8)
    ctx.setLineDash([])
  }

  if (marquee) {
    ctx.fillStyle = 'rgba(96, 165, 250, 0.15)'
    ctx.fillRect(marquee.x, marquee.y, marquee.w, marquee.h)
    ctx.setLineDash([4, 3])
    ctx.strokeStyle = '#60a5fa'
    ctx.lineWidth = 1
    ctx.strokeRect(marquee.x + 0.5, marquee.y + 0.5, marquee.w, marquee.h)
    ctx.setLineDash([])
  }
}

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gesture = useRef<Gesture | null>(null)
  // Subscribe to the slices that affect rendering so the effect below redraws on change.
  const shapes = useEditor((s) => s.shapes)
  const selectedIds = useEditor((s) => s.selectedIds)
  const marquee = useEditor((s) => s.marquee)

  useEffect(() => {
    const canvas = canvasRef.current!
    const dpr = window.devicePixelRatio || 1
    canvas.width = CANVAS_WIDTH * dpr
    canvas.height = CANVAS_HEIGHT * dpr
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw(ctx)
  }, [shapes, selectedIds, marquee])

  const toCanvasPoint = (e: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = toCanvasPoint(e)
    const state = editorStore.getState()
    const hit = hitTest(state.shapes, p)
    if (hit) {
      if (e.shiftKey) state.toggleSelected(hit.id)
      else if (!state.selectedIds.includes(hit.id)) state.setSelection([hit.id])
      gesture.current = { kind: 'drag', last: p, moved: false }
    } else {
      gesture.current = { kind: 'marquee', start: p, additive: e.shiftKey }
    }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const g = gesture.current
    if (!g) return
    const p = toCanvasPoint(e)
    const state = editorStore.getState()
    if (g.kind === 'drag') {
      if (!g.moved) {
        g.moved = true
        state.pushHistory()
      }
      state.translate(state.selectedIds, p.x - g.last.x, p.y - g.last.y)
      g.last = p
    } else {
      const rect = normalizeRect(g.start, p)
      if (state.marquee || rect.w >= MARQUEE_THRESHOLD || rect.h >= MARQUEE_THRESHOLD) {
        state.setMarquee(rect)
      }
    }
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const g = gesture.current
    gesture.current = null
    if (!g) return
    const state = editorStore.getState()
    if (g.kind === 'marquee') {
      if (state.marquee) state.commitMarquee(normalizeRect(g.start, toCanvasPoint(e)), g.additive)
      else if (!g.additive) state.clearSelection()
    }
  }

  return (
    <canvas
      ref={canvasRef}
      data-testid="editor-canvas"
      className="editor-canvas"
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  )
}
