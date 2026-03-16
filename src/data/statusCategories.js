import {
  Shirt, Ticket, FileText, Heart, Car, MoreHorizontal,
  Plane, Building2, Shield, Key
} from 'lucide-react'
import { colors } from '../colors'

// =============================================================================
// STATUS CATEGORIES — Checklist + Document type definitions
// =============================================================================

export const CHECKLIST_CATEGORIES = {
  packing: {
    id: 'packing',
    label: 'Packing',
    icon: Shirt,
    color: colors.ocean,
    bgColor: colors.oceanLight,
  },
  booking: {
    id: 'booking',
    label: 'Booking',
    icon: Ticket,
    color: colors.coral,
    bgColor: colors.coralLight,
  },
  documents: {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    color: colors.sand,
    bgColor: colors.sandLight,
  },
  health: {
    id: 'health',
    label: 'Health',
    icon: Heart,
    color: colors.palm,
    bgColor: colors.palmLight,
  },
  transport: {
    id: 'transport',
    label: 'Transport',
    icon: Car,
    color: colors.violet,
    bgColor: colors.violetLight,
  },
  other: {
    id: 'other',
    label: 'Other',
    icon: MoreHorizontal,
    color: colors.textSecondary,
    bgColor: colors.borderLight,
  },
}

export const DOCUMENT_CATEGORIES = {
  passport: {
    id: 'passport',
    label: 'Passport',
    icon: Key,
    color: colors.ocean,
    bgColor: colors.oceanLight,
  },
  boarding_pass: {
    id: 'boarding_pass',
    label: 'Boarding Pass',
    icon: Plane,
    color: colors.info,
    bgColor: colors.infoLight,
  },
  hotel_confirmation: {
    id: 'hotel_confirmation',
    label: 'Hotel Confirmation',
    icon: Building2,
    color: colors.sand,
    bgColor: colors.sandLight,
  },
  insurance: {
    id: 'insurance',
    label: 'Insurance',
    icon: Shield,
    color: colors.palm,
    bgColor: colors.palmLight,
  },
  rental_car: {
    id: 'rental_car',
    label: 'Rental Car',
    icon: Car,
    color: colors.coral,
    bgColor: colors.coralLight,
  },
  other: {
    id: 'other',
    label: 'Other',
    icon: FileText,
    color: colors.textSecondary,
    bgColor: colors.borderLight,
  },
}

export function getChecklistCategory(id) {
  return CHECKLIST_CATEGORIES[id] || CHECKLIST_CATEGORIES.other
}

export function getDocumentCategory(id) {
  return DOCUMENT_CATEGORIES[id] || DOCUMENT_CATEGORIES.other
}
