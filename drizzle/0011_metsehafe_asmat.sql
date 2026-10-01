-- Metsehafe Asmat as an intake dropdown source. Healers' own Asmat texts share fewus_texts
-- (heading keys are prefixed asmat_*), so only the dropdown constraint changes.
ALTER TABLE "service_intake_settings" DROP CONSTRAINT IF EXISTS "service_intake_dropdown_type";
ALTER TABLE "service_intake_settings" ADD CONSTRAINT "service_intake_dropdown_type" CHECK ("dropdown_type" IN ('none', 'custom', 'metsehafe_fewus', 'metsehafe_asmat', 'awde_negest'));
