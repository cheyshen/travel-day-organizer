// =============================================================================
// EVENT VISUALS — bright cohesive icon palette + soft card tint + matching motion
// =============================================================================
// One harmonious family: every color shares the same saturation & lightness,
// only the hue changes (that's what keeps 14 colors cohesive).
//   color  — fills the saturated icon TILE (icon itself is white)
//   tint   — soft card-background version of the same hue (colored cards)
//   motion — CSS keyframe class (`ev-<motion>` in index.css); a little animation
//            that matches what the icon is (plane flies, boat rocks…)
// Buffer + Custom stay neutral.

export const EVENT_VISUALS = {
  flight:           { color: '#438ADB', tint: '#E7EFF8', motion: 'flight' },
  ground_transport: { color: '#725ED4', tint: '#EEEBF9', motion: 'car' },
  boat:             { color: '#2AA5CB', tint: '#E7F4F8', motion: 'boat' },
  activity:         { color: '#32AE70', tint: '#E8F7F0', motion: 'palm' },
  beach:            { color: '#29AEA0', tint: '#E8F8F6', motion: 'waves' },
  hiking:           { color: '#38B242', tint: '#E8F7EA', motion: 'hike' },
  sunrise:          { color: '#DB8F43', tint: '#F9F0E6', motion: 'sun' },
  sightseeing:      { color: '#D5B534', tint: '#F8F4E2', motion: 'camera' },
  dining:           { color: '#DB5743', tint: '#FAECEA', motion: 'dining' },
  shopping:         { color: '#DD4B94', tint: '#FAEAF2', motion: 'bag' },
  hotel:            { color: '#A35CCC', tint: '#F4ECF9', motion: 'hotel' },
  entertainment:    { color: '#D256D2', tint: '#F9ECF9', motion: 'party' },
  buffer:           { color: '#A8A094', tint: '#F2F0ED', motion: 'clock' },
  custom:           { color: '#9E9E9E', tint: '#F2F2F2', motion: 'pulse' },
}

export function getEventVisual(type) {
  return EVENT_VISUALS[type] || EVENT_VISUALS.custom
}
