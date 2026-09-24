-- ============================================================
-- Migration 001: Composite Indexes & Performance Tuning
-- Ethiopian Wellness Platform — Pillar 1 (Roadmap Point 2)
-- ============================================================
-- Safe to re-run: all indexes use IF NOT EXISTS

-- ── Auth: Fast active-session lookup by refresh token ────────
CREATE INDEX IF NOT EXISTS idx_auth_sessions_active_lookup
  ON auth_sessions (refresh_token_hash, is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_active
  ON auth_sessions (user_id, is_active, expires_at)
  WHERE is_active = true;

-- ── Cases: User's open/recent cases ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_case_sessions_user_status
  ON case_sessions (user_id, current_step, created_at DESC);

-- ── Audit log: User event history ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audit_log_user_created
  ON audit_log (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- ── Literature: Strand + relevance ordering ───────────────────
CREATE INDEX IF NOT EXISTS idx_literature_findings_strand_relevance
  ON literature_findings (strand, is_active, relevance_score DESC, citation_count DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_literature_findings_pmid_strand
  ON literature_findings (pmid, strand)
  WHERE pmid IS NOT NULL;

-- ── Email verifications: Fast token lookups ──────────────────
CREATE INDEX IF NOT EXISTS idx_email_verifications_token_exp
  ON email_verifications (token, expires_at);

-- ── Users: Role + active status ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email_role
  ON users (email, role);

CREATE INDEX IF NOT EXISTS idx_users_role_active
  ON users (role, is_active)
  WHERE is_active = true;

-- ANALYSE after creating indexes to update pg statistics
ANALYZE auth_sessions;
ANALYZE case_sessions;
ANALYZE audit_log;
ANALYZE literature_findings;
