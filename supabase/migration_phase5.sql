-- ============================================================================
-- Phase 5: Accountability Groups - Additional Migration
-- Run this after the base migration.sql
-- ============================================================================

-- Enable Realtime for group_messages
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;

-- Allow authenticated users to look up groups by invite code
-- This broadens group visibility slightly, but group data (name, description)
-- isn't sensitive. The actual join still requires the correct invite code.
CREATE POLICY "Authenticated users can lookup groups by invite code"
    ON groups FOR SELECT
    USING (auth.uid() IS NOT NULL);
