-- Phase 7: Stripe Billing & Subscription Gates
-- Adds Stripe-specific columns to profiles table

ALTER TABLE profiles
  ADD COLUMN stripe_customer_id TEXT UNIQUE,
  ADD COLUMN subscription_status TEXT;

CREATE INDEX idx_profiles_stripe_customer_id ON profiles (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
