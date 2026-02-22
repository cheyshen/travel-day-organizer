// =============================================================================
// COVER IMAGES — Type-based fallback images for event cards
// =============================================================================

const TYPE_IMAGES = {
  flight: [
    'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=400&h=200&fit=crop&auto=format',
  ],
  ground_transport: [
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop&auto=format',
  ],
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop&auto=format',
  ],
  beach: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=400&h=200&fit=crop&auto=format',
  ],
  dining: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop&auto=format',
  ],
  hiking: [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=200&fit=crop&auto=format',
  ],
  boat: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1500930287596-c1ecaa210571?w=400&h=200&fit=crop&auto=format',
  ],
  sightseeing: [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=200&fit=crop&auto=format',
  ],
  sunrise: [
    'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400&h=200&fit=crop&auto=format',
  ],
  shopping: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&auto=format',
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop&auto=format',
  ],
  activity: [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop&auto=format',
  ],
  custom: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop&auto=format',
  ],
}

// Simple hash to pick a consistent image per event
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getCoverImage(eventType, eventId) {
  const images = TYPE_IMAGES[eventType] || TYPE_IMAGES.custom
  const idx = simpleHash(eventId || '') % images.length
  return images[idx]
}

// Gradient fallback per event type (used when image fails to load)
const TYPE_GRADIENTS = {
  flight: 'linear-gradient(135deg, #2B7A9E 0%, #87CEEB 100%)',
  ground_transport: 'linear-gradient(135deg, #0E7490 0%, #1B9AAA 100%)',
  hotel: 'linear-gradient(135deg, #C4A265 0%, #E8C97A 100%)',
  beach: 'linear-gradient(135deg, #0891B2 0%, #67E8F9 100%)',
  dining: 'linear-gradient(135deg, #E8725A 0%, #F0A090 100%)',
  hiking: 'linear-gradient(135deg, #059669 0%, #6EE7B7 100%)',
  boat: 'linear-gradient(135deg, #1B9AAA 0%, #67E8F9 100%)',
  sightseeing: 'linear-gradient(135deg, #7C3AED 0%, #C4B5FD 100%)',
  sunrise: 'linear-gradient(135deg, #E8925A 0%, #FCD34D 100%)',
  shopping: 'linear-gradient(135deg, #DB2777 0%, #F9A8D4 100%)',
  entertainment: 'linear-gradient(135deg, #9333EA 0%, #C4B5FD 100%)',
  activity: 'linear-gradient(135deg, #2D7D46 0%, #6EE7B7 100%)',
  buffer: 'linear-gradient(135deg, #A8A29E 0%, #D6D3CE 100%)',
  custom: 'linear-gradient(135deg, #6B6B6B 0%, #A8A29E 100%)',
}

export function getCoverGradient(eventType) {
  return TYPE_GRADIENTS[eventType] || TYPE_GRADIENTS.custom
}
