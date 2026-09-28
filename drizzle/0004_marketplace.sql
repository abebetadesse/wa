-- Marketplace for traditional healers and cultural businesses.
-- Idempotent: safe to run more than once.

CREATE TABLE IF NOT EXISTS "availability_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"member_id" uuid,
	"weekday" smallint NOT NULL,
	"start_minute" integer NOT NULL,
	"end_minute" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(20) NOT NULL,
	"business_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"booked_by_user_id" uuid,
	"member_id" uuid,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"delivery_mode" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'requested' NOT NULL,
	"price_etb" numeric(12, 2) NOT NULL,
	"payment_status" varchar(20) DEFAULT 'unpaid' NOT NULL,
	"client_note" text,
	"business_note" text,
	"safety" jsonb,
	"case_id" uuid,
	"cancelled_by" varchar(20),
	"cancel_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_reference_unique" UNIQUE("reference")
);

CREATE TABLE IF NOT EXISTS "business_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"name_am" varchar(120),
	"description" text,
	"sector" varchar(20) NOT NULL,
	"icon" varchar(40),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_categories_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "business_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid,
	"name" varchar(160) NOT NULL,
	"phone" varchar(30),
	"email" varchar(255),
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"consent" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "business_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"title" varchar(120),
	"is_bookable" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"owner_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"name_am" varchar(160),
	"tagline" varchar(240),
	"description" text,
	"region" varchar(100),
	"city" varchar(100),
	"address" text,
	"phone" varchar(30),
	"email" varchar(255),
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"delivery_modes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"logo_url" text,
	"cover_url" text,
	"timezone" varchar(60) DEFAULT 'Africa/Addis_Ababa' NOT NULL,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"verification" jsonb,
	"rating_average" numeric(3, 2),
	"rating_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"client_user_id" uuid NOT NULL,
	"booking_id" uuid,
	"last_message_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid,
	"sender_side" varchar(10) NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(60) NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text,
	"href" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"booking_id" uuid,
	"client_id" uuid,
	"amount_etb" numeric(12, 2) NOT NULL,
	"method" varchar(30) NOT NULL,
	"reference" varchar(120),
	"note" text,
	"status" varchar(20) DEFAULT 'recorded' NOT NULL,
	"received_on" date NOT NULL,
	"recorded_by" uuid,
	"voided_by" uuid,
	"void_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "realtime_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"channel" varchar(80) NOT NULL,
	"type" varchar(60) NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "remedies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"name_am" varchar(160),
	"form" varchar(40) NOT NULL,
	"description" text,
	"unit" varchar(20) NOT NULL,
	"stock_quantity" numeric(12, 2) DEFAULT '0' NOT NULL,
	"reorder_level" numeric(12, 2) DEFAULT '0' NOT NULL,
	"price_etb" numeric(12, 2),
	"safety_notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "remedy_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"remedy_id" uuid NOT NULL,
	"herb_id" uuid,
	"name" varchar(160) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"author_id" uuid,
	"rating" smallint NOT NULL,
	"comment" text,
	"response" text,
	"responded_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_booking_id_unique" UNIQUE("booking_id")
);

CREATE TABLE IF NOT EXISTS "service_kinds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"name_am" varchar(120),
	"description" text,
	"requires_safety_screen" boolean DEFAULT false NOT NULL,
	"case_domain" varchar(30),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_kinds_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"kind_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"name_am" varchar(160),
	"description" text,
	"duration_minutes" integer NOT NULL,
	"price_etb" numeric(12, 2) NOT NULL,
	"delivery_modes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"buffer_minutes" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"remedy_id" uuid NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"reason" varchar(30) NOT NULL,
	"booking_id" uuid,
	"note" text,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "time_off" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"member_id" uuid,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"reason" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_member_id_business_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."business_members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_business_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."business_clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booked_by_user_id_users_id_fk" FOREIGN KEY ("booked_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_member_id_business_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."business_members"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "business_clients" ADD CONSTRAINT "business_clients_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "business_clients" ADD CONSTRAINT "business_clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "business_members" ADD CONSTRAINT "business_members_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "business_members" ADD CONSTRAINT "business_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "businesses" ADD CONSTRAINT "businesses_category_id_business_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."business_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_client_user_id_users_id_fk" FOREIGN KEY ("client_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_business_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."business_clients"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_voided_by_users_id_fk" FOREIGN KEY ("voided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "remedies" ADD CONSTRAINT "remedies_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "remedy_ingredients" ADD CONSTRAINT "remedy_ingredients_remedy_id_remedies_id_fk" FOREIGN KEY ("remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "remedy_ingredients" ADD CONSTRAINT "remedy_ingredients_herb_id_herbs_id_fk" FOREIGN KEY ("herb_id") REFERENCES "public"."herbs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "services" ADD CONSTRAINT "services_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "services" ADD CONSTRAINT "services_kind_id_service_kinds_id_fk" FOREIGN KEY ("kind_id") REFERENCES "public"."service_kinds"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_remedy_id_remedies_id_fk" FOREIGN KEY ("remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "time_off" ADD CONSTRAINT "time_off_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "time_off" ADD CONSTRAINT "time_off_member_id_business_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."business_members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "availability_business_idx" ON "availability_rules" USING btree ("business_id");

CREATE INDEX IF NOT EXISTS "bookings_business_time_idx" ON "bookings" USING btree ("business_id","starts_at");

CREATE INDEX IF NOT EXISTS "bookings_client_idx" ON "bookings" USING btree ("client_id");

CREATE INDEX IF NOT EXISTS "bookings_user_idx" ON "bookings" USING btree ("booked_by_user_id");

CREATE INDEX IF NOT EXISTS "bookings_status_idx" ON "bookings" USING btree ("status");

CREATE INDEX IF NOT EXISTS "business_clients_business_idx" ON "business_clients" USING btree ("business_id");

CREATE UNIQUE INDEX IF NOT EXISTS "business_clients_user_unique" ON "business_clients" USING btree ("business_id","user_id");

CREATE UNIQUE INDEX IF NOT EXISTS "business_members_unique" ON "business_members" USING btree ("business_id","user_id");

CREATE INDEX IF NOT EXISTS "businesses_status_idx" ON "businesses" USING btree ("status");

CREATE INDEX IF NOT EXISTS "businesses_category_idx" ON "businesses" USING btree ("category_id");

CREATE INDEX IF NOT EXISTS "businesses_region_idx" ON "businesses" USING btree ("region");

CREATE UNIQUE INDEX IF NOT EXISTS "conversations_unique" ON "conversations" USING btree ("business_id","client_user_id");

CREATE INDEX IF NOT EXISTS "messages_conversation_idx" ON "messages" USING btree ("conversation_id","created_at");

CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "notifications" USING btree ("user_id","created_at");

CREATE INDEX IF NOT EXISTS "payments_business_idx" ON "payments" USING btree ("business_id","received_on");

CREATE INDEX IF NOT EXISTS "realtime_events_channel_idx" ON "realtime_events" USING btree ("channel","id");

CREATE INDEX IF NOT EXISTS "remedies_business_idx" ON "remedies" USING btree ("business_id");

CREATE INDEX IF NOT EXISTS "remedy_ingredients_remedy_idx" ON "remedy_ingredients" USING btree ("remedy_id");

CREATE INDEX IF NOT EXISTS "reviews_business_idx" ON "reviews" USING btree ("business_id");

CREATE INDEX IF NOT EXISTS "services_business_idx" ON "services" USING btree ("business_id");

-- ── Guarantees enforced by the database ─────────────────────────────────────

-- No two active bookings may overlap for the same practitioner (or the business when unassigned).
CREATE EXTENSION IF NOT EXISTS btree_gist;
DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap" EXCLUDE USING gist (
    "business_id" WITH =,
    (COALESCE("member_id", '00000000-0000-0000-0000-000000000000'::uuid)) WITH =,
    tstzrange("starts_at", "ends_at", '[)') WITH &&
  ) WHERE ("status" IN ('requested', 'confirmed'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_time_order" CHECK ("ends_at" > "starts_at");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_range" CHECK ("rating" BETWEEN 1 AND 5);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_valid" CHECK ("weekday" BETWEEN 0 AND 6 AND "start_minute" >= 0 AND "end_minute" <= 1440 AND "end_minute" > "start_minute");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Every realtime event is announced to all app instances (LISTEN realtime_events).
CREATE OR REPLACE FUNCTION notify_realtime_event() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('realtime_events', json_build_object('id', NEW.id, 'channel', NEW.channel)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS realtime_events_notify ON "realtime_events";
CREATE TRIGGER realtime_events_notify AFTER INSERT ON "realtime_events"
  FOR EACH ROW EXECUTE FUNCTION notify_realtime_event();

-- ── Starter catalogues (data, editable by administrators) ───────────────────

INSERT INTO "business_categories" ("slug", "name", "name_am", "sector", "icon", "sort_order", "description") VALUES
  ('herbalist', 'Herbalist', 'የባህል መድኃኒት አዋቂ', 'healing', 'leaf', 10, 'Preparation of traditional herbal remedies and guidance on their safe use.'),
  ('debtera', 'Debtera', 'ደብተራ', 'healing', 'scroll', 20, 'Ge''ez scholarship, Awde Negest readings, prayers and protective scrolls.'),
  ('bone-setter', 'Bone setter', 'ወጌሻ', 'healing', 'hand', 30, 'Traditional bone setting and bodywork for sprains and minor injuries.'),
  ('spiritual-guide', 'Spiritual guide', 'መንፈሳዊ አማካሪ', 'healing', 'sparkles', 40, 'Spiritual counsel, reflection and life-direction guidance.'),
  ('bodywork', 'Traditional bodywork', 'ባህላዊ ማሸት', 'healing', 'heart-handshake', 50, 'Massage, steam and other traditional bodywork.'),
  ('artisan', 'Artisan & crafts', 'የእጅ ጥበብ', 'cultural', 'palette', 60, 'Weaving, pottery, basketry, jewellery and other handmade crafts.'),
  ('coffee-ceremony', 'Coffee ceremony', 'የቡና ሥነ ሥርዓት', 'cultural', 'coffee', 70, 'Coffee ceremony hosting for homes, offices and events.'),
  ('music-dance', 'Music & dance', 'ሙዚቃና ውዝዋዜ', 'cultural', 'music', 80, 'Traditional music, dance performance and lessons.'),
  ('ceremony-events', 'Ceremonies & events', 'ሥነ ሥርዓትና ዝግጅት', 'cultural', 'calendar-heart', 90, 'Weddings, holidays and cultural event planning.'),
  ('language-manuscripts', 'Ge''ez & manuscripts', 'ግዕዝና ብራና', 'cultural', 'book-open', 100, 'Ge''ez lessons, calligraphy and manuscript work.'),
  ('heritage-tours', 'Heritage tours', 'የቅርስ ጉብኝት', 'cultural', 'map', 110, 'Guided visits to heritage sites and living traditions.')
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "service_kinds" ("slug", "name", "name_am", "requires_safety_screen", "case_domain", "sort_order", "description") VALUES
  ('consultation', 'Consultation', 'ምክክር', false, NULL, 10, 'A one-to-one session.'),
  ('remedy-preparation', 'Remedy preparation', 'የመድኃኒት ዝግጅት', true, NULL, 20, 'A remedy prepared for the client; the safety screen checks medicines and pregnancy.'),
  ('bodywork-session', 'Bodywork session', 'የሰውነት ሕክምና', true, NULL, 30, 'Hands-on session; the safety screen checks injuries and conditions first.'),
  ('reading', 'Reading', 'ንባብ', false, 'spiritual', 40, 'Awde Negest or name reading, reviewed by the practitioner.'),
  ('life-direction-review', 'Life direction review', 'የሕይወት አቅጣጫ ግምገማ', false, 'career', 50, 'A written review of career or life direction.'),
  ('ceremony', 'Ceremony', 'ሥነ ሥርዓት', false, NULL, 60, 'A ceremony or blessing held for the client.'),
  ('class', 'Class or workshop', 'ትምህርት', false, NULL, 70, 'Lessons for individuals or groups.'),
  ('commission', 'Commission', 'ትዕዛዝ', false, NULL, 80, 'A made-to-order piece (craft, scroll, garment).'),
  ('event-service', 'Event service', 'የዝግጅት አገልግሎት', false, NULL, 90, 'Hosting or performing at an event.')
ON CONFLICT ("slug") DO NOTHING;
