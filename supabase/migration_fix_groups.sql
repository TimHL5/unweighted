-- ============================================================================
-- Fix Migration: Create missing group tables + add subscription_tier column
-- Run this in the Supabase SQL Editor (Dashboard > SQL > New query)
-- ============================================================================

-- 1. Add subscription_tier to profiles (was in original CREATE TABLE but missing from live DB)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    -- Create the ENUM type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
      CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'premium');
    END IF;
    ALTER TABLE profiles ADD COLUMN subscription_tier subscription_tier NOT NULL DEFAULT 'free';
  END IF;
END $$;

-- 2. Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    avatar_url      TEXT,
    max_members     INT NOT NULL DEFAULT 4,
    group_type      TEXT NOT NULL DEFAULT 'accountability',
    goal_type       TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    invite_code     TEXT UNIQUE,
    created_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- 3. Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
    group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role        group_member_role NOT NULL DEFAULT 'member',
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- 4. Create group_messages table
CREATE TABLE IF NOT EXISTS group_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    message_type    message_type NOT NULL DEFAULT 'text',
    media_url       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group_created ON group_messages (group_id, created_at DESC);

ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for groups
CREATE POLICY "Group members can view their groups"
    ON groups FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = groups.id
            AND group_members.user_id = auth.uid()
        )
        OR created_by = auth.uid()
    );

CREATE POLICY "Authenticated users can create groups"
    ON groups FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creator or admin can update group"
    ON groups FOR UPDATE
    USING (
        auth.uid() = created_by
        OR EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = groups.id
            AND group_members.user_id = auth.uid()
            AND group_members.role = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() = created_by
        OR EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = groups.id
            AND group_members.user_id = auth.uid()
            AND group_members.role = 'admin'
        )
    );

CREATE POLICY "Group creator can delete group"
    ON groups FOR DELETE
    USING (auth.uid() = created_by);

-- From phase5: Allow authenticated users to look up groups by invite code
CREATE POLICY "Authenticated users can lookup groups by invite code"
    ON groups FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- 6. RLS Policies for group_members
CREATE POLICY "Group members can view other members"
    ON group_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM group_members AS gm
            WHERE gm.group_id = group_members.group_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join groups"
    ON group_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
    ON group_members FOR DELETE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM groups
            WHERE groups.id = group_members.group_id
            AND groups.created_by = auth.uid()
        )
    );

-- 7. RLS Policies for group_messages
CREATE POLICY "Group members can view messages"
    ON group_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = group_messages.group_id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can insert messages"
    ON group_messages FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = group_messages.group_id
            AND group_members.user_id = auth.uid()
        )
    );

-- 8. Enable Realtime for group_messages
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;
