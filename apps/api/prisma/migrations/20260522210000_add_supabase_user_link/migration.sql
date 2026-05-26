-- Link Supabase Auth identities to existing SkillMango users without replacing local sessions.
ALTER TABLE "users" ADD COLUMN "supabaseUserId" TEXT;

CREATE UNIQUE INDEX "users_supabaseUserId_key" ON "users"("supabaseUserId");
CREATE INDEX "users_supabaseUserId_idx" ON "users"("supabaseUserId");
