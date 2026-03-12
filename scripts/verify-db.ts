import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  console.error('Missing required environment variables. Check .env.local')
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'MISSING')
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'set' : 'MISSING')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? 'set' : 'MISSING')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey)
const anon = createClient(supabaseUrl, anonKey)

let passCount = 0
let failCount = 0

function pass(label: string, detail?: string) {
  passCount++
  console.log(`  PASS  ${label}${detail ? ` — ${detail}` : ''}`)
}

function fail(label: string, detail?: string) {
  failCount++
  console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
}

function info(label: string, detail?: string) {
  console.log(`  INFO  ${label}${detail ? ` — ${detail}` : ''}`)
}

// ─── Test 1: Table existence ────────────────────────────────────────────────

async function testTableExistence() {
  console.log('\n=== Test 1: Table Existence ===\n')

  const expectedTables = [
    'profiles', 'foods', 'recipes', 'recipe_ingredients',
    'food_logs', 'water_logs', 'weight_logs',
    'daily_check_ins', 'progress_photos',
    'posts', 'comments', 'post_likes',
    'follows', 'notifications',
    'groups', 'group_members', 'group_messages',
    'achievements', 'user_achievements', 'user_xp', 'streaks',
    'challenges', 'challenge_participants',
    'workout_templates', 'workout_exercises', 'workout_logs', 'workout_log_exercises',
  ]

  // Also check singular variants to understand actual DB state
  const singularVariants = ['food_log', 'water_log', 'weight_log', 'workout_log']

  // Query all tables in the public schema
  const { data: tables, error } = await admin
    .from('information_schema.tables' as never)
    .select('table_name')
    .eq('table_schema', 'public')

  // Fallback: use raw SQL via rpc if the above doesn't work
  let tableNames: string[] = []

  if (error || !tables) {
    info('Using raw SQL to query tables (information_schema query via PostgREST failed)')
    // Use the Supabase SQL endpoint via rpc — but we need a function.
    // Instead, try a different approach: attempt a select from each table.
    for (const table of [...expectedTables, ...singularVariants]) {
      const { error: queryError } = await admin
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (!queryError) {
        tableNames.push(table)
      }
    }
  } else {
    tableNames = (tables as Array<{ table_name: string }>).map(t => t.table_name)
  }

  // Check expected plural tables
  for (const table of expectedTables) {
    if (tableNames.includes(table)) {
      pass(`Table "${table}" exists`)
    } else {
      fail(`Table "${table}" does NOT exist`)
    }
  }

  // Check singular variants (informational)
  console.log('\n  --- Singular variant check (informational) ---')
  for (const table of singularVariants) {
    if (tableNames.includes(table)) {
      info(`Singular table "${table}" EXISTS in DB`)
    } else {
      info(`Singular table "${table}" does not exist in DB`)
    }
  }

  // Determine naming convention
  const hasPlural = ['food_logs', 'water_logs', 'weight_logs'].every(t => tableNames.includes(t))
  const hasSingular = ['food_log', 'water_log', 'weight_log'].every(t => tableNames.includes(t))

  console.log('')
  if (hasPlural && hasSingular) {
    info('DB has BOTH singular and plural log tables')
  } else if (hasPlural) {
    info('DB uses PLURAL naming (food_logs, water_logs, weight_logs) — matches API routes')
  } else if (hasSingular) {
    info('DB uses SINGULAR naming (food_log, water_log, weight_log) — DOES NOT match API routes!')
  } else {
    info('Neither singular nor plural log tables found — migration may not have run')
  }
}

// ─── Test 2: Seed data counts ───────────────────────────────────────────────

async function testSeedDataCounts() {
  console.log('\n=== Test 2: Seed Data Counts ===\n')

  // Foods: approximately 200 rows
  const { count: foodCount, error: foodErr } = await admin
    .from('foods')
    .select('*', { count: 'exact', head: true })

  if (foodErr) {
    fail('foods count', `Error: ${foodErr.message}`)
  } else if (foodCount !== null && foodCount >= 150 && foodCount <= 250) {
    pass('foods count', `${foodCount} rows (expected ~200)`)
  } else {
    fail('foods count', `${foodCount} rows (expected ~200)`)
  }

  // Achievements: exactly 27 rows
  const { count: achievementCount, error: achievementErr } = await admin
    .from('achievements')
    .select('*', { count: 'exact', head: true })

  if (achievementErr) {
    fail('achievements count', `Error: ${achievementErr.message}`)
  } else if (achievementCount === 27) {
    pass('achievements count', `${achievementCount} rows (expected 27)`)
  } else {
    fail('achievements count', `${achievementCount} rows (expected 27)`)
  }

  // Challenges: approximately 5 rows
  const { count: challengeCount, error: challengeErr } = await admin
    .from('challenges')
    .select('*', { count: 'exact', head: true })

  if (challengeErr) {
    fail('challenges count', `Error: ${challengeErr.message}`)
  } else if (challengeCount !== null && challengeCount >= 3 && challengeCount <= 8) {
    pass('challenges count', `${challengeCount} rows (expected ~5)`)
  } else {
    fail('challenges count', `${challengeCount} rows (expected ~5)`)
  }
}

// ─── Test 3: Column spot-check on daily_check_ins ───────────────────────────

async function testDailyCheckInColumns() {
  console.log('\n=== Test 3: daily_check_ins Column Spot-Check ===\n')

  // We attempt to select specific columns. If the column doesn't exist, the query errors.
  const expectedColumns = ['mood', 'energy', 'sleep_hours', 'sleep_quality', 'stress_level', 'hunger_level']
  const badColumns = ['mood_rating', 'energy_rating']

  for (const col of expectedColumns) {
    const { error } = await admin
      .from('daily_check_ins')
      .select(col)
      .limit(0)

    if (!error) {
      pass(`daily_check_ins has column "${col}"`)
    } else {
      fail(`daily_check_ins missing column "${col}"`, error.message)
    }
  }

  for (const col of badColumns) {
    const { error } = await admin
      .from('daily_check_ins')
      .select(col)
      .limit(0)

    if (error) {
      pass(`daily_check_ins does NOT have column "${col}" (correct)`)
    } else {
      fail(`daily_check_ins HAS column "${col}" (should not exist)`)
    }
  }
}

// ─── Test 4: Profiles columns for Stripe ────────────────────────────────────

async function testProfilesStripeColumns() {
  console.log('\n=== Test 4: profiles Stripe Columns ===\n')

  const requiredColumns = ['stripe_customer_id', 'subscription_status', 'subscription_tier']

  for (const col of requiredColumns) {
    const { error } = await admin
      .from('profiles')
      .select(col)
      .limit(0)

    if (!error) {
      pass(`profiles has column "${col}"`)
    } else {
      fail(`profiles missing column "${col}"`, error.message)
    }
  }
}

// ─── Test 5: RLS checks with anon key ───────────────────────────────────────

async function testRLS() {
  console.log('\n=== Test 5: RLS (Row Level Security) ===\n')

  // foods: should be readable by anon
  const { data: foodsData, error: foodsErr } = await anon
    .from('foods')
    .select('id')
    .limit(1)

  if (!foodsErr && foodsData && foodsData.length > 0) {
    pass('anon can SELECT from foods')
  } else if (!foodsErr && foodsData && foodsData.length === 0) {
    // Table exists but no rows — could be empty or RLS blocks
    fail('anon SELECT from foods returned 0 rows (may be RLS blocking or empty table)')
  } else {
    fail('anon SELECT from foods failed', foodsErr?.message)
  }

  // achievements: should be readable by anon
  const { data: achievementsData, error: achievementsErr } = await anon
    .from('achievements')
    .select('id')
    .limit(1)

  if (!achievementsErr && achievementsData && achievementsData.length > 0) {
    pass('anon can SELECT from achievements')
  } else if (!achievementsErr && achievementsData && achievementsData.length === 0) {
    fail('anon SELECT from achievements returned 0 rows (may be RLS blocking or empty table)')
  } else {
    fail('anon SELECT from achievements failed', achievementsErr?.message)
  }

  // food_logs: should fail or return empty for anon (no auth)
  const { data: foodLogsData, error: foodLogsErr } = await anon
    .from('food_logs')
    .select('id')
    .limit(1)

  if (foodLogsErr) {
    pass('anon SELECT from food_logs blocked (error)', foodLogsErr.message)
  } else if (foodLogsData && foodLogsData.length === 0) {
    pass('anon SELECT from food_logs returned empty (RLS working)')
  } else {
    fail('anon SELECT from food_logs returned data — RLS may not be configured!')
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Unweighted Database Verification ===')
  console.log(`Supabase URL: ${supabaseUrl}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)

  await testTableExistence()
  await testSeedDataCounts()
  await testDailyCheckInColumns()
  await testProfilesStripeColumns()
  await testRLS()

  console.log('\n=== Summary ===')
  console.log(`  PASS: ${passCount}`)
  console.log(`  FAIL: ${failCount}`)
  console.log(`  Total: ${passCount + failCount}`)

  if (failCount > 0) {
    console.log('\nSome tests failed. Review the output above for details.')
    process.exit(1)
  } else {
    console.log('\nAll tests passed!')
    process.exit(0)
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
