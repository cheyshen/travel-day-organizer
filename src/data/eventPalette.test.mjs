// =============================================================================
// eventPalette invariants — pure Node, no frameworks.
// Runs as part of `npm run build`. Exits non-zero if any assertion fails.
//
// Guards the harmonized event-icon palette: every event type has a color +
// tile, hex is well-formed, the two neutral types stay desaturated, and no two
// categories share an icon color.
// =============================================================================
import assert from 'node:assert/strict'
import { eventPalette } from '../colors.js'

const EXPECTED_KEYS = [
  'flight', 'ground_transport', 'hotel', 'activity', 'dining', 'buffer',
  'boat', 'sunrise', 'sightseeing', 'beach', 'hiking', 'shopping',
  'entertainment', 'custom',
]

let passed = 0
let failed = 0
function test(name, fn) {
  try { fn(); console.log(`  ok  ${name}`); passed++ }
  catch (err) { console.error(`  FAIL ${name}`); console.error(`       ${err.message}`); failed++ }
}

const HEX = /^#[0-9a-fA-F]{6}$/
const spread = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return Math.max(r, g, b) - Math.min(r, g, b)
}

test('every expected event type is present (and no extras)', () => {
  assert.deepEqual(Object.keys(eventPalette).sort(), [...EXPECTED_KEYS].sort())
})

test('each entry has a well-formed color and tile hex', () => {
  for (const [k, v] of Object.entries(eventPalette)) {
    assert.match(v.color, HEX, `${k}.color not hex`)
    assert.match(v.tile, HEX, `${k}.tile not hex`)
  }
})

test('buffer and custom stay near-neutral', () => {
  assert.ok(spread(eventPalette.buffer.color) <= 30, 'buffer color too saturated')
  assert.ok(spread(eventPalette.custom.color) <= 8, 'custom color not gray')
})

test('no two categories share an icon color', () => {
  const colors = Object.values(eventPalette).map(v => v.color.toLowerCase())
  assert.equal(new Set(colors).size, colors.length, 'duplicate icon color')
})

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
