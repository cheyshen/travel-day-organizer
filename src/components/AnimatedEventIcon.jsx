import { useEffect, useRef, useState } from 'react'
import { getEventIcon } from '../utils/timeUtils'
import { getEventVisual } from '../data/eventVisuals'

// =============================================================================
// ANIMATED EVENT ICON — saturated tile + white icon + per-type motion
// =============================================================================
// The motion (CSS keyframe `ev-<motion>` in index.css) plays on mount when
// `playOnMount` is set, and replays every time `playSignal` changes. Remounting
// the inner <span> via `key` restarts the animation cleanly.

export default function AnimatedEventIcon({
  type,
  tile = 40,
  icon = 20,
  radius = 11,
  strokeWidth = 2,
  playSignal = 0,
  playOnMount = false,
}) {
  const Icon = getEventIcon(type)
  const v = getEventVisual(type)
  const [runId, setRunId] = useState(playOnMount ? 1 : 0)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; return }
    setRunId((r) => r + 1)
  }, [playSignal])

  return (
    <div style={{
      width: tile,
      height: tile,
      borderRadius: radius,
      background: v.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'visible',
    }}>
      <span
        key={runId}
        className={runId > 0 ? `evm ev-${v.motion}` : 'evm'}
        style={{ display: 'inline-flex', lineHeight: 0 }}
      >
        <Icon size={icon} color="#FFFFFF" strokeWidth={strokeWidth} />
      </span>
    </div>
  )
}
