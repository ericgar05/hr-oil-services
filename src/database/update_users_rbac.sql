-- Migración para soporte de RBAC jerárquico con los 4 roles oficiales
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS allowed_modules JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Activo',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 1. Quitar restricción anterior temporalmente para poder migrar roles legacy
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Migrar cualquier usuario existente con roles anteriores a los 4 roles oficiales
UPDATE public.users
SET
  role = 'admin',
  allowed_modules = '["resumen", "solicitudes", "administracion", "operaciones", "contrato", "coordinaciones", "permissions"]'::jsonb
WHERE role IN ('admin', 'DIRECTOR_GENERAL');

UPDATE public.users
SET role = 'coordinador'
WHERE role IN ('JEFE_ADMINISTRACION', 'JEFE_OPERACIONES', 'JEFE_CONTRATO', 'JEFE_COORDINACIONES', 'editor');

UPDATE public.users
SET role = 'administrativo'
WHERE role IN ('AUXILIAR_ADMINISTRACION', 'AUXILIAR_OPERACIONES', 'AUXILIAR_CONTRATO', 'AUXILIAR_COORDINACIONES', 'viewer')
   OR role NOT IN ('admin', 'directivo', 'coordinador', 'administrativo');

-- 3. Aplicar la restricción estricta únicamente para los 4 roles oficiales
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (
  role IN ('admin', 'directivo', 'coordinador', 'administrativo')
);
