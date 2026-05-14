import { useEffect, useRef } from 'react'

// Symbols: alternates between recycling (trash) and baht (money)
const SYMBOLS = ['♻', '฿', '♻', '฿', '♻', '฿']

function rand(a, b) { return a + Math.random() * (b - a) }

function spawn(w, h, scattered = false) {
  return {
    x:     rand(16, w - 16),
    y:     scattered ? rand(0, h) : h + rand(10, 80),
    vy:    rand(0.22, 0.68),
    vx:    rand(-0.12, 0.12),
    size:  rand(11, 19),
    sym:   SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    a:     0,
    aMax:  rand(0.06, 0.16),
  }
}

// Color transition: scrap-gray → eco-green → baht-gold
function color(progress) {
  const t = Math.max(0, Math.min(1, progress))
  if (t < 0.5) {
    const s = t * 2
    return [
      Math.round(130 + s * (22  - 130)),
      Math.round(130 + s * (163 - 130)),
      Math.round(130 + s * (74  - 130)),
    ]
  }
  const s = (t - 0.5) * 2
  return [
    Math.round(22  + s * (212 - 22)),
    Math.round(163 + s * (177 - 163)),
    Math.round(74  + s * (8   - 74)),
  ]
}

export function ParticleField() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const mobile = window.innerWidth < 768
    const COUNT  = mobile ? 16 : 38

    const pts = Array.from({ length: COUNT }, () =>
      spawn(canvas.width, canvas.height, true)
    )

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of pts) {
        const progress = 1 - p.y / canvas.height   // 0=bottom, 1=top
        const [r, g, b] = color(progress)

        if (p.a < p.aMax) p.a += 0.003

        ctx.save()
        ctx.globalAlpha = p.a
        ctx.fillStyle   = `rgb(${r},${g},${b})`
        ctx.font        = `${p.size}px system-ui, sans-serif`
        ctx.textAlign   = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.sym, p.x, p.y)
        ctx.restore()

        p.y -= p.vy
        p.x += p.vx

        if (p.y < -32) Object.assign(p, spawn(canvas.width, canvas.height))
      }

      raf = requestAnimationFrame(frame)
    }

    frame()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    />
  )
}
