-- Allow personal_id to be NULL (for contractors or external personnel without UUIDs)
ALTER TABLE plan_actividad_personal ALTER COLUMN personal_id DROP NOT NULL;
