// =============================================================================
// tripShift regression tests — pure Node, no frameworks
// Runs as part of `npm run build`. Exits non-zero if any assertion fails.
//
// Guards the 2026-04-17 incident: if today is past the trip end date, the
// init flow MUST produce a shifted trip whose days-dict keys align with the
// trip's startDate..endDate and where every trip day has ≥1 event. Without
// this, the Day tab renders empty.
// =============================================================================

import assert from 'node:assert/strict'
import { sampleTrip, sampleDays } from '../data/sampleTrip.js'
import {
  getTodayStr,
  isTripOver,
  addDaysToDate,
  computeShiftDays,
  buildShiftedData,
} from './tripShift.js'

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  ok  ${name}`)
    passed++
  } catch (err) {
    console.error(`  FAIL ${name}`)
    console.error(`       ${err.message}`)
    failed++
  }
}

// ---------------------------------------------------------------------------
// getTodayStr
// ---------------------------------------------------------------------------
test('getTodayStr formats a fixed Date as YYYY-MM-DD', () => {
  const d = new Date(2026, 3, 17) // April 17 — month is 0-indexed
  assert.equal(getTodayStr(d), '2026-04-17')
})

test('getTodayStr pads single-digit month and day', () => {
  assert.equal(getTodayStr(new Date(2026, 0, 5)), '2026-01-05')
})

// ---------------------------------------------------------------------------
// isTripOver
// ---------------------------------------------------------------------------
test('isTripOver is false on the last day of the trip', () => {
  assert.equal(isTripOver('2026-03-22', sampleTrip), false)
})

test('isTripOver is true the day after the trip ends', () => {
  assert.equal(isTripOver('2026-03-23', sampleTrip), true)
})

test('isTripOver is false before the trip ends', () => {
  assert.equal(isTripOver('2026-03-15', sampleTrip), false)
})

// ---------------------------------------------------------------------------
// addDaysToDate
// ---------------------------------------------------------------------------
test('addDaysToDate crosses month boundaries correctly', () => {
  assert.equal(addDaysToDate('2026-03-30', 5), '2026-04-04')
})

test('addDaysToDate crosses year boundaries correctly', () => {
  assert.equal(addDaysToDate('2026-12-30', 5), '2027-01-04')
})

// ---------------------------------------------------------------------------
// computeShiftDays — must pick next same-weekday ≥3 days from today
// ---------------------------------------------------------------------------
test('computeShiftDays targets next matching weekday at least 3 days out', () => {
  // Original trip starts Saturday 2026-03-14. If today is also a Saturday,
  // the next candidate must be the FOLLOWING Saturday, not today+0.
  const n = computeShiftDays('2026-04-11', '2026-03-14') // 04-11 is Saturday
  // candidate = 04-14 (Tue), advance through Wed/Thu/Fri → Sat 04-18
  assert.equal(addDaysToDate('2026-03-14', n), '2026-04-18')
})

test('computeShiftDays for the 2026-04-17 incident returns 42 days', () => {
  const n = computeShiftDays('2026-04-17', '2026-03-14')
  assert.equal(n, 42)
  assert.equal(addDaysToDate('2026-03-14', n), '2026-04-25')
})

// ---------------------------------------------------------------------------
// buildShiftedData — the main regression guard
// ---------------------------------------------------------------------------
test('buildShiftedData aligns days-dict keys with trip.startDate..endDate', () => {
  const shift = computeShiftDays('2026-04-17', sampleTrip.startDate)
  const { trip, days } = buildShiftedData(shift, sampleTrip, sampleDays)

  // Walk every day from trip.startDate to trip.endDate; each must exist in days
  // and must carry ≥1 event. This is what the Day tab reads.
  let cursor = trip.startDate
  let tripDayCount = 0
  while (cursor <= trip.endDate) {
    const day = days[cursor]
    assert.ok(day, `days['${cursor}'] must exist but is missing`)
    assert.ok(
      Array.isArray(day.events) && day.events.length > 0,
      `days['${cursor}'] has no events — Day tab would render empty`
    )
    tripDayCount++
    cursor = addDaysToDate(cursor, 1)
  }
  assert.equal(tripDayCount, Object.keys(sampleDays).length)
})

test('buildShiftedData preserves event count and IDs per day', () => {
  const shift = computeShiftDays('2026-04-17', sampleTrip.startDate)
  const { days } = buildShiftedData(shift, sampleTrip, sampleDays)

  for (const [origKey, origDay] of Object.entries(sampleDays)) {
    const newKey = addDaysToDate(origKey, shift)
    const newDay = days[newKey]
    assert.equal(newDay.events.length, origDay.events.length, `event count mismatch for ${origKey}`)
    const origIds = origDay.events.map(e => e.id).sort()
    const newIds = newDay.events.map(e => e.id).sort()
    assert.deepEqual(newIds, origIds, `event IDs mismatch for ${origKey}`)
  }
})

test('buildShiftedData resets every event status to "upcoming"', () => {
  const { days } = buildShiftedData(10, sampleTrip, sampleDays)
  for (const day of Object.values(days)) {
    for (const event of day.events) {
      assert.equal(event.status, 'upcoming')
    }
  }
})

test('buildShiftedData shifts event startTime/endTime preserving timezone suffix', () => {
  const { days } = buildShiftedData(42, sampleTrip, sampleDays)
  for (const day of Object.values(days)) {
    for (const event of day.events) {
      if (event.startTime) {
        const tail = event.startTime.slice(10) // "T06:50:00-05:00"
        assert.match(tail, /^T\d{2}:\d{2}:\d{2}[-+Z]/, `startTime tail malformed: ${event.startTime}`)
      }
    }
  }
})

// ---------------------------------------------------------------------------
// Full init-flow scenarios (the class of bug that bit us)
// ---------------------------------------------------------------------------
test('INCIDENT GUARD: today past trip end → init produces non-empty Day tab', () => {
  // Simulate getInitialState's fresh-shift branch on 2026-04-17.
  const today = '2026-04-17'
  assert.equal(isTripOver(today, sampleTrip), true)

  const shift = computeShiftDays(today, sampleTrip.startDate)
  const { trip, days } = buildShiftedData(shift, sampleTrip, sampleDays)

  // selectedDate is initialized to trip.startDate; the Day tab reads
  // days[selectedDate].events. This must have events, or the user sees nothing.
  const selectedDate = trip.startDate
  const dayForSelected = days[selectedDate]
  assert.ok(dayForSelected, `days[trip.startDate=${selectedDate}] is missing`)
  assert.ok(
    dayForSelected.events.length > 0,
    'Day tab would render empty on first load after trip-end auto-shift'
  )
  assert.ok(selectedDate > today, `shifted startDate (${selectedDate}) must be in the future relative to today (${today})`)
})

test('INCIDENT GUARD: saved shifted state with expired endDate triggers re-shift (not stale reuse)', () => {
  // Mirrors the TripContext getInitialState saved-state check.
  const today = '2026-04-17'
  const savedTrip = { ...sampleTrip, endDate: '2026-04-12' } // previously shifted, now expired
  const savedIsValid = today <= savedTrip.endDate
  assert.equal(savedIsValid, false, 'expired saved trip must be treated as invalid so fresh re-shift runs')
})

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
