/**
 * Stripe Product & Price Setup Script
 *
 * Creates the required Stripe products and prices for Unweighted.
 * Run with: npx tsx scripts/stripe-setup.ts
 *
 * Requires STRIPE_SECRET_KEY in environment.
 */

import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY
if (!stripeKey) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is required')
  console.error('Usage: STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/stripe-setup.ts')
  process.exit(1)
}

const stripe = new Stripe(stripeKey, { typescript: true })

async function main() {
  console.log('Creating Stripe products and prices...\n')

  // Create Pro product
  const proProduct = await stripe.products.create({
    name: 'Unweighted Pro',
    description: 'Unlock the full Unweighted experience with unlimited custom foods, recipes, groups, and more.',
  })
  console.log(`Created product: ${proProduct.name} (${proProduct.id})`)

  const proMonthly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'month' },
  })
  console.log(`  Monthly: $9.99/mo (${proMonthly.id})`)

  const proYearly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 7999,
    currency: 'usd',
    recurring: { interval: 'year' },
  })
  console.log(`  Yearly:  $79.99/yr (${proYearly.id})`)

  // Create Premium product
  const premiumProduct = await stripe.products.create({
    name: 'Unweighted Premium',
    description: 'The ultimate Unweighted experience with advanced analytics, data export, and early access to new features.',
  })
  console.log(`\nCreated product: ${premiumProduct.name} (${premiumProduct.id})`)

  const premiumMonthly = await stripe.prices.create({
    product: premiumProduct.id,
    unit_amount: 1499,
    currency: 'usd',
    recurring: { interval: 'month' },
  })
  console.log(`  Monthly: $14.99/mo (${premiumMonthly.id})`)

  const premiumYearly = await stripe.prices.create({
    product: premiumProduct.id,
    unit_amount: 11999,
    currency: 'usd',
    recurring: { interval: 'year' },
  })
  console.log(`  Yearly:  $119.99/yr (${premiumYearly.id})`)

  console.log('\n--- Add these to your .env file ---\n')
  console.log(`STRIPE_PRO_MONTHLY_PRICE_ID=${proMonthly.id}`)
  console.log(`STRIPE_PRO_YEARLY_PRICE_ID=${proYearly.id}`)
  console.log(`STRIPE_PREMIUM_MONTHLY_PRICE_ID=${premiumMonthly.id}`)
  console.log(`STRIPE_PREMIUM_YEARLY_PRICE_ID=${premiumYearly.id}`)
  console.log('')
}

main().catch((err) => {
  console.error('Setup failed:', err)
  process.exit(1)
})
