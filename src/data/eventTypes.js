import {
  Plane, Car, Building2, Palmtree, UtensilsCrossed,
  Clock, Circle, Ship, Camera, Waves,
  Mountain, ShoppingBag, PartyPopper, Sunrise
} from 'lucide-react'
import { colors } from '../colors'

// =============================================================================
// EVENT TYPE DEFINITIONS
// =============================================================================

export const EVENT_TYPES = {
  flight: {
    id: 'flight',
    label: 'Flight',
    icon: Plane,
    color: colors.info,
    bgColor: colors.infoLight,
  },
  ground_transport: {
    id: 'ground_transport',
    label: 'Transport',
    icon: Car,
    color: colors.violet,
    bgColor: colors.violetLight,
  },
  hotel: {
    id: 'hotel',
    label: 'Hotel',
    icon: Building2,
    color: colors.sand,
    bgColor: colors.sandLight,
  },
  activity: {
    id: 'activity',
    label: 'Activity',
    icon: Palmtree,
    color: colors.palm,
    bgColor: colors.palmLight,
  },
  dining: {
    id: 'dining',
    label: 'Dining',
    icon: UtensilsCrossed,
    color: colors.coral,
    bgColor: colors.coralLight,
  },
  buffer: {
    id: 'buffer',
    label: 'Buffer',
    icon: Clock,
    color: colors.tan,
    bgColor: colors.tanLight,
  },
  boat: {
    id: 'boat',
    label: 'Boat',
    icon: Ship,
    color: colors.navy,
    bgColor: colors.navyLight,
  },
  sunrise: {
    id: 'sunrise',
    label: 'Sunrise',
    icon: Sunrise,
    color: colors.sunset,
    bgColor: colors.sunsetLight,
  },
  sightseeing: {
    id: 'sightseeing',
    label: 'Sightseeing',
    icon: Camera,
    color: colors.amber,
    bgColor: colors.amberLight,
  },
  beach: {
    id: 'beach',
    label: 'Beach',
    icon: Waves,
    color: colors.aqua,
    bgColor: colors.aquaLight,
  },
  hiking: {
    id: 'hiking',
    label: 'Hiking',
    icon: Mountain,
    color: colors.emerald,
    bgColor: colors.emeraldLight,
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping',
    icon: ShoppingBag,
    color: colors.rose,
    bgColor: colors.roseLight,
  },
  entertainment: {
    id: 'entertainment',
    label: 'Fun',
    icon: PartyPopper,
    color: colors.purple,
    bgColor: colors.purpleLight,
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    icon: Circle,
    color: colors.textSecondary,
    bgColor: colors.borderLight,
  },
}

export const EVENT_STATUSES = {
  upcoming: { label: 'Upcoming', color: colors.borderLight, textColor: colors.textSecondary },
  done: { label: 'Done', color: colors.successLight, textColor: colors.success },
}

export function getEventType(typeId) {
  return EVENT_TYPES[typeId] || EVENT_TYPES.custom
}
