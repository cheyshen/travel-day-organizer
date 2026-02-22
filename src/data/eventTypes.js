import {
  Plane, Car, Building2, Palmtree, UtensilsCrossed,
  Coffee, Circle, Ship, Sunrise, Camera, Waves,
  Mountain, ShoppingBag, Music
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
    color: colors.ocean,
    bgColor: colors.oceanLight,
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
    icon: Coffee,
    color: colors.textSecondary,
    bgColor: colors.surfaceMuted,
  },
  boat: {
    id: 'boat',
    label: 'Boat Tour',
    icon: Ship,
    color: colors.lagoon,
    bgColor: colors.tealLight,
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
    color: colors.lavender,
    bgColor: colors.lavenderLight,
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
    label: 'Entertainment',
    icon: Music,
    color: colors.purple,
    bgColor: colors.purpleLight,
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    icon: Circle,
    color: colors.textSecondary,
    bgColor: colors.surfaceMuted,
  },
}

export const EVENT_STATUSES = {
  upcoming: { label: 'Upcoming', color: colors.surfaceMuted, textColor: colors.textSecondary },
  active: { label: 'In Progress', color: colors.oceanLight, textColor: colors.ocean },
  done: { label: 'Done', color: colors.successLight, textColor: colors.success },
  delayed: { label: 'Delayed', color: colors.warningLight, textColor: colors.warning },
  cancelled: { label: 'Cancelled', color: colors.dangerLight, textColor: colors.danger },
}

export function getEventType(typeId) {
  return EVENT_TYPES[typeId] || EVENT_TYPES.custom
}

export function getEventStatus(statusId) {
  return EVENT_STATUSES[statusId] || EVENT_STATUSES.upcoming
}
