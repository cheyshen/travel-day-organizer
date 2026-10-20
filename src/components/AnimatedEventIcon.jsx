import { useEffect, useRef, useState } from 'react'
import { getEventIcon } from '../utils/timeUtils'
import { getEventVisual, EVENT_VISUALS } from '../data/eventVisuals'

// =============================================================================
// ANIMATED EVENT ICON — saturated tile + white icon + per-type motion
// =============================================================================
// The motion (CSS keyframe `ev-<motion>` in index.css) plays on mount when
// `playOnMount` is set, and replays every time `playSignal` changes. Remounting
// the inner <span> via `key` restarts the animation cleanly.
//
// Optional "sticker" treatment (used by the event-type picker in EventEditor):
//   sticker  — glossy peel-off look: white border + drop shadow + gloss sheen
//   selected — tilts/presses the sticker and deepens its shadow
//   confetti — bursts a few particles out of the tile each time playSignal fires

// Festive confetti drawn from the brand's own event-icon palette (on-brand, no ad-hoc hex)
const CONFETTI_COLORS = [
  EVENT_VISUALS.flight.color,        // blue
  EVENT_VISUALS.dining.color,        // coral
  EVENT_VISUALS.sightseeing.color,   // gold
  EVENT_VISUALS.beach.color,         // teal
  EVENT_VISUALS.shopping.color,      // pink
  EVENT_VISUALS.entertainment.color, // magenta
]

function makeBurst(baseColor) {
  const n = 10
  return Array.from({ length: n }, (_, k) => {
    const ang = ((Math.PI * 2 * k) / n) + Math.random() * 0.5
    const dist = 26 + Math.random() * 22
    return {
      id: k,
      tx: Math.cos(ang) * dist,
      ty: Math.sin(ang) * dist,
      rot: Math.random() * 540 - 270,
      color: k % 2 === 0 ? baseColor : CONFETTI_COLORS[k % CONFETTI_COLORS.length],
    }
  })
}

export default function AnimatedEventIcon({
  type,
  tile = 40,
  icon = 20,
  radius = 11,
  strokeWidth = 2,
  playSignal = 0,
  playOnMount = false,
  sticker = false,
  selected = false,
  confetti = false,
}) {
  const Icon = getEventIcon(type)
  const v = getEventVisual(type)
  const [runId, setRunId] = useState(playOnMount ? 1 : 0)
  const [burst, setBurst] = useState(null)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; return }
    setRunId((r) => r + 1)
    if (confetti) setBurst({ key: playSignal, parts: makeBurst(v.color) })
  }, [playSignal])

  const tileStyle = {
    width: tile,
    height: tile,
    borderRadius: radius,
    background: v.color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'visible',
    position: 'relative',
  }
  if (sticker) {
    tileStyle.border = `${Math.max(2, tile * 0.065)}px solid #FFFFFF`
    tileStyle.transition = 'transform .25s cubic-bezier(.34,1.4,.6,1), box-shadow .25s'
    tileStyle.boxShadow = selected
      ? '4px 7px 12px rgba(0,0,0,0.26)'
      : '0 2px 5px rgba(0,0,0,0.18)'
    tileStyle.transform = selected ? 'rotate(-6deg) scale(1.04)' : 'none'
  }

  return (
    <div className={sticker ? 'ev-tile-sticker' : undefined} style={tileStyle}>
      <span
        key={runId}
        className={runId > 0 ? `evm ev-${v.motion}` : 'evm'}
        style={{ display: 'inline-flex', lineHeight: 0 }}
      >
        <Icon size={icon} color="#FFFFFF" strokeWidth={strokeWidth} />
      </span>
      {confetti && burst && burst.parts.map((p) => (
        <span
          key={`${burst.key}-${p.id}`}
          className="ev-confetti"
          style={{
            background: p.color,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--rot': `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  )
}
