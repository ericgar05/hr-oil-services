-- ========================================================
-- SCRIPT DE ACTUALIZACIÓN: MÓDULO DE COORDINACIONES
-- HR OIL SERVICES C.A.
-- Estructura unificada (1 solo nivel: Coordinación = Departamento)
-- ========================================================

-- PASO 1: ELIMINAR TABLAS PREVIAS (SI YA LAS HABÍAS CREADO)
-- El comando CASCADE elimina automáticamente llaves foráneas e índices asociados
DROP TABLE IF EXISTS coordinacion_archivos CASCADE;
DROP TABLE IF EXISTS coordinacion_notas CASCADE;
DROP TABLE IF EXISTS coordinacion_pendientes CASCADE;
DROP TABLE IF EXISTS coordinacion_departamentos CASCADE;
DROP TABLE IF EXISTS coordinaciones CASCADE;

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. COORDINACIONES (Entidad principal y espacio de trabajo)
-- ========================================================
CREATE TABLE coordinaciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL,
    nombre TEXT NOT NULL,
    codigo TEXT,                         -- Ej: 'COORD-OPS', 'CALIDAD', 'LABORALES'
    responsable TEXT,                    -- Nombre del coordinador o responsable
    color TEXT DEFAULT '#1e40af',        -- Color temático identificador (Hex)
    icono TEXT DEFAULT 'folder',         -- Ícono distintivo
    descripcion TEXT,
    estado TEXT DEFAULT 'activo',        -- 'activo', 'inactivo', 'archivado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coordinaciones_project_id ON coordinaciones(project_id);
CREATE INDEX idx_coordinaciones_estado ON coordinaciones(estado);

-- ========================================================
-- 2. PENDIENTES Y ACTIVIDADES (Pertenecen directo a la Coordinación)
-- ========================================================
CREATE TABLE coordinacion_pendientes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coordinacion_id UUID NOT NULL REFERENCES coordinaciones(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    estado TEXT DEFAULT 'Pendiente',     -- 'Pendiente', 'En proceso', 'En espera', 'Completado'
    prioridad TEXT DEFAULT 'Media',      -- 'Baja', 'Media', 'Alta'
    fecha_limite DATE,                   -- Fecha de entrega (Semáforo de plazos)
    responsable TEXT,                    -- Persona asignada a la actividad
    subtareas JSONB DEFAULT '[]'::jsonb, -- Checklist: [{"id": "...", "titulo": "...", "completada": false}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pendientes_coordinacion_id ON coordinacion_pendientes(coordinacion_id);
CREATE INDEX idx_pendientes_project_id ON coordinacion_pendientes(project_id);
CREATE INDEX idx_pendientes_fecha_limite ON coordinacion_pendientes(fecha_limite);
CREATE INDEX idx_pendientes_estado ON coordinacion_pendientes(estado);

-- ========================================================
-- 3. REPOSITORIO DE ARCHIVOS Y DOCUMENTOS
-- ========================================================
CREATE TABLE coordinacion_archivos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coordinacion_id UUID NOT NULL REFERENCES coordinaciones(id) ON DELETE CASCADE,
    actividad_id UUID REFERENCES coordinacion_pendientes(id) ON DELETE SET NULL, -- Si es NULL = documento general; Si tiene ID = soporte de tarea
    project_id UUID NOT NULL,
    nombre_archivo TEXT NOT NULL,
    archivo_url TEXT NOT NULL,           -- URL de Supabase Storage o Base64 DataURL
    storage_path TEXT,
    tipo_mime TEXT,
    tamanio BIGINT DEFAULT 0,
    categoria TEXT DEFAULT 'Otro',       -- 'Formato', 'Soporte', 'Oficio', 'Reporte', 'Normativa', 'Otro'
    usuario_subida TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_archivos_coordinacion_id ON coordinacion_archivos(coordinacion_id);
CREATE INDEX idx_archivos_actividad_id ON coordinacion_archivos(actividad_id);
CREATE INDEX idx_archivos_categoria ON coordinacion_archivos(categoria);

-- ========================================================
-- 4. CUESTIONES GENERALES / NOTAS (Bitácora de la Coordinación)
-- ========================================================
CREATE TABLE coordinacion_notas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coordinacion_id UUID NOT NULL REFERENCES coordinaciones(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    fijado BOOLEAN DEFAULT FALSE,        -- Indicador para anclar notas arriba (📌)
    categoria_nota TEXT DEFAULT 'General',-- 'Acuerdo', 'Procedimiento', 'Contacto', 'Recordatorio', 'General'
    usuario_creador TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notas_coordinacion_id ON coordinacion_notas(coordinacion_id);
CREATE INDEX idx_notas_fijado ON coordinacion_notas(fijado);

-- ========================================================
-- 5. POLÍTICAS DE ACCESO (RLS)
-- ========================================================
ALTER TABLE coordinaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordinacion_pendientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordinacion_archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordinacion_notas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total coordinaciones" ON coordinaciones;
CREATE POLICY "Acceso total coordinaciones" ON coordinaciones FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total coordinacion_pendientes" ON coordinacion_pendientes;
CREATE POLICY "Acceso total coordinacion_pendientes" ON coordinacion_pendientes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total coordinacion_archivos" ON coordinacion_archivos;
CREATE POLICY "Acceso total coordinacion_archivos" ON coordinacion_archivos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total coordinacion_notas" ON coordinacion_notas;
CREATE POLICY "Acceso total coordinacion_notas" ON coordinacion_notas FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- 6. CONFIGURACIÓN DE STORAGE (BUCKET PARA DOCUMENTOS)
-- ========================================================
-- Crea el bucket 'coordinacion-archivos' como público si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('coordinacion-archivos', 'coordinacion-archivos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acceso para subir, ver y eliminar archivos en el Storage
DROP POLICY IF EXISTS "Acceso total bucket coordinacion-archivos" ON storage.objects;
CREATE POLICY "Acceso total bucket coordinacion-archivos" 
ON storage.objects FOR ALL 
USING (bucket_id = 'coordinacion-archivos') 
WITH CHECK (bucket_id = 'coordinacion-archivos');
