import { useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { boundsOf, normalizeRect } from './geometry'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './seed'
import { editorStore, useEditor } from './store'
import type { Bounds, Shape } from './types'

type Point = { x: number; y: number }

type Gesture =
  | { kind: 'drag'; last: Point; moved: boolean }
  | { kind: 'marquee'; start: Point; additive: boolean }

/** A marquee only starts once the pointer has moved this far, so plain clicks stay clicks. */
const MARQUEE_THRESHOLD = 2

const ACCENT = '#60a5fa'
const GRID = 40

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

function shapePath(ctx: CanvasRenderingContext2D, s: Shape) {
  ctx.beginPath()
  if (s.kind === 'rect') ctx.roundRect(s.x, s.y, s.w, s.h, 6)
  else ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2, s.w / 2, s.h / 2, 0, 0, Math.PI * 2)
}

function drawHandles(ctx: CanvasRenderingContext2D, b: Bounds) {
  const pts = [
    [b.x, b.y],
    [b.x + b.w / 2, b.y],
    [b.x + b.w, b.y],
    [b.x, b.y + b.h / 2],
    [b.x + b.w, b.y + b.h / 2],
    [b.x, b.y + b.h],
    [b.x + b.w / 2, b.y + b.h],
    [b.x + b.w, b.y + b.h],
  ]
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = ACCENT
  ctx.lineWidth = 1.5
  for (const [x, y] of pts) {
    ctx.beginPath()
    ctx.rect(x - 3.5, y - 3.5, 7, 7)
    ctx.fill()
    ctx.stroke()
  }
}

function draw(ctx: CanvasRenderingContext2D) {
  const { shapes, selectedIds, marquee } = editorStore.getState()
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // dot grid
  ctx.fillStyle = '#2b3242'
  for (let x = GRID; x < CANVAS_WIDTH; x += GRID) {
    for (let y = GRID; y < CANVAS_HEIGHT; y += GRID) {
      ctx.fillRect(x - 0.5, y - 0.5, 1.5, 1.5)
    }
  }

  // shapes
  for (const s of shapes) {
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
    ctx.shadowBlur = 18
    ctx.shadowOffsetY = 6
    ctx.fillStyle = s.fill
    shapePath(ctx, s)
    ctx.fill()
    ctx.restore()
    // subtle inner highlight
    ctx.save()
    shapePath(ctx, s)
    ctx.clip()
    const g = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.h)
    g.addColorStop(0, 'rgba(255,255,255,0.18)')
    g.addColorStop(1, 'rgba(0,0,0,0.10)')
    ctx.fillStyle = g
    ctx.fillRect(s.x, s.y, s.w, s.h)
    ctx.restore()
  }

  // selection
  const selected = shapes.filter((s) => selectedIds.includes(s.id))
  if (selected.length > 0) {
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = 1.5
    for (const s of selected) {
      ctx.beginPath()
      ctx.rect(s.x - 1, s.y - 1, s.w + 2, s.h + 2)
      ctx.stroke()
    }
    const b = boundsOf(selected)
    if (selected.length > 1) {
      ctx.setLineDash([6, 4])
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.9)'
      ctx.lineWidth = 1
      ctx.strokeRect(b.x - 6, b.y - 6, b.w + 12, b.h + 12)
      ctx.setLineDash([])
      drawHandles(ctx, { x: b.x - 6, y: b.y - 6, w: b.w + 12, h: b.h + 12 })
    } else {
      drawHandles(ctx, { x: b.x - 1, y: b.y - 1, w: b.w + 2, h: b.h + 2 })
    }
    // size label
    const label = `${Math.round(b.w)} × ${Math.round(b.h)}`
    ctx.font = '600 11px Inter, system-ui, sans-serif'
    const tw = ctx.measureText(label).width + 12
    const lx = b.x + b.w / 2 - tw / 2
    const ly = b.y + b.h + 12
    ctx.fillStyle = ACCENT
    ctx.beginPath()
    ctx.roundRect(lx, ly, tw, 18, 4)
    ctx.fill()
    ctx.fillStyle = '#0b1220'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, lx + 6, ly + 9.5)
  }

  // marquee
  if (marquee) {
    ctx.fillStyle = 'rgba(96, 165, 250, 0.15)'
    ctx.fillRect(marquee.x, marquee.y, marquee.w, marquee.h)
    ctx.setLineDash([4, 3])
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = 1
    ctx.strokeRect(marquee.x + 0.5, marquee.y + 0.5, marquee.w, marquee.h)
    ctx.setLineDash([])
  }
}

function Ruler({ orientation }: { orientation: 'horizontal' | 'vertical' }) {
  const length = orientation === 'horizontal' ? CANVAS_WIDTH : CANVAS_HEIGHT
  const marks: number[] = []
  for (let v = 0; v <= length; v += GRID * 2) marks.push(v)
  return (
    <div className={`ruler ${orientation}`} aria-hidden="true">
      {marks.map((v) => (
        <span key={v} style={orientation === 'horizontal' ? { left: v } : { top: v }}>
          {v}
        </span>
      ))}
    </div>
  )
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
    <div className="artboard" style={{ width: CANVAS_WIDTH + 24, height: CANVAS_HEIGHT + 24 }}>
      <Ruler orientation="horizontal" />
      <Ruler orientation="vertical" />
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
    </div>
  )
}
