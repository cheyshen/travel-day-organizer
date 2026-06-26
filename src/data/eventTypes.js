import {
  Plane, Car, Building2, Palmtree, UtensilsCrossed,
  Clock, Circle, Ship, Camera, Waves,
  Mountain, ShoppingBag, PartyPopper, Sunrise
} from 'lucide-react'
import { eventPalette } from '../colors'

// =============================================================================
// EVENT TYPE DEFINITIONS
// =============================================================================

export const EVENT_TYPES = {
  flight: { id: 'flight', label: 'Flight', icon: Plane, color: eventPalette.flight.color, bgColor: eventPalette.flight.tile },
  ground_transport: { id: 'ground_transport', label: 'Transport', icon: Car, color: eventPalette.ground_transport.color, bgColor: eventPalette.ground_transport.tile },
  hotel: { id: 'hotel', label: 'Hotel', icon: Building2, color: eventPalette.hotel.color, bgColor: eventPalette.hotel.tile },
  activity: { id: 'activity', label: 'Activity', icon: Palmtree, color: eventPalette.activity.color, bgColor: eventPalette.activity.tile },
  dining: { id: 'dining', label: 'Dining', icon: UtensilsCrossed, color: eventPalette.dining.color, bgColor: eventPalette.dining.tile },
  buffer: { id: 'buffer', label: 'Buffer', icon: Clock, color: eventPalette.buffer.color, bgColor: eventPalette.buffer.tile },
  boat: { id: 'boat', label: 'Boat', icon: Ship, color: eventPalette.boat.color, bgColor: eventPalette.boat.tile },
  sunrise: { id: 'sunrise', label: 'Sunrise', icon: Sunrise, color: eventPalette.sunrise.color, bgColor: eventPalette.sunrise.tile },
  sightseeing: { id: 'sightseeing', label: 'Sightseeing', icon: Camera, color: eventPalette.sightseeing.color, bgColor: eventPalette.sightseeing.tile },
  beach: { id: 'beach', label: 'Beach', icon: Waves, color: eventPalette.beach.color, bgColor: eventPalette.beach.tile },
  hiking: { id: 'hiking', label: 'Hiking', icon: Mountain, color: eventPalette.hiking.color, bgColor: eventPalette.hiking.tile },
  shopping: { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: eventPalette.shopping.color, bgColor: eventPalette.shopping.tile },
  entertainment: { id: 'entertainment', label: 'Fun', icon: PartyPopper, color: eventPalette.entertainment.color, bgColor: eventPalette.entertainment.tile },
  custom: { id: 'custom', label: 'Custom', icon: Circle, color: eventPalette.custom.color, bgColor: eventPalette.custom.tile },
}

export function getEventType(typeId) {
  return EVENT_TYPES[typeId] || EVENT_TYPES.custom
}
