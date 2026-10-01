-- Hexacore Practitioner business category and body-reading service kinds.
-- Adds Hexacore below traditional healers (healing sector, sort_order 55),
-- plus tongue reading, palm reading and face reading (biometrics) as bookable service kinds.
-- Idempotent: safe to run more than once.

-- ── Business category ────────────────────────────────────────────────────────

INSERT INTO "business_categories" ("slug", "name", "name_am", "sector", "icon", "sort_order", "description") VALUES
  ('hexacore-practitioner', 'Hexacore practitioner', 'ሄክሳኮር ልምምድ', 'healing', 'hexagon', 55,
   'Practitioners who combine the Hexacore six-core reflection system with body-sign readings (tongue, palm, face) and symbolic guidance. Sessions are reflective and educational, not a medical diagnosis.')
ON CONFLICT ("slug") DO NOTHING;

-- ── Service kinds ─────────────────────────────────────────────────────────────

INSERT INTO "service_kinds" ("slug", "name", "name_am", "requires_safety_screen", "case_domain", "sort_order", "description") VALUES
  ('hexacore-reading',  'Hexacore reading',          'ሄክሳኮር ንባብ',         false, 'spiritual', 60,
   'Full six-core Hexacore Arcana session: core mapping, archetype identification, frequency analysis, correspondences and journaling guidance.'),
  ('tongue-reading',    'Tongue reading',             'የምላስ ንባብ',          false,  NULL,       61,
   'Traditional body-sign assessment of tongue surface, colour, coat and shape. Offered as reflective and educational content; not a medical diagnosis.'),
  ('palm-reading',      'Palm reading',               'የእጅ መስመር ንባብ',     false,  NULL,       62,
   'Cultural and reflective reading of hand lines, mounts and finger shape, drawing on Ethiopian hand-reading traditions and comparative palmistry.'),
  ('face-reading',      'Face reading & biometrics',  'የፊት ንባብ',           false,  NULL,       63,
   'Facial zone, feature and expression mapping using traditional physiognomy and modern biometric pattern reference. Covers forehead, eye, nose, mouth and ear zones. Reflective only — not a medical or forensic assessment.'),
  ('body-sign-reading', 'Body-sign reading',          'የሰውነት ምልክት ንባብ',   false,  NULL,       64,
   'Combined reading that may include tongue, palm, face and posture patterns as traditional body-sign indicators. Always framed as reflection, never diagnosis.')
ON CONFLICT ("slug") DO NOTHING;
