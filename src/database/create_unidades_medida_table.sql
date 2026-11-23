-- ==============================================================================
-- TABLA: unidades_medida
-- DESCRIPCIÓN: Catálogo maestro corporativo de unidades de medida para presupuestos,
-- valuaciones y partidas de contratos en HR Oil Services.
-- ==============================================================================

-- 1. Crear la tabla de unidades de medida
CREATE TABLE IF NOT EXISTS unidades_medida (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- 'volumen', 'tiempo_labor', 'masa_peso', 'conteo', 'longitud_area', 'personalizada'
    descripcion TEXT,
    es_sistema BOOLEAN DEFAULT false, -- true: unidades estándar del sistema; false: personalizadas por usuario
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_unidades_codigo ON unidades_medida (codigo);
CREATE INDEX IF NOT EXISTS idx_unidades_categoria ON unidades_medida (categoria);
CREATE INDEX IF NOT EXISTS idx_unidades_activo ON unidades_medida (activo);

-- 3. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE unidades_medida ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acceso RLS (Lectura pública corporativa, inserción controlada)
DROP POLICY IF EXISTS "Permitir lectura publica de unidades" ON unidades_medida;
CREATE POLICY "Permitir lectura publica de unidades"
    ON unidades_medida FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Permitir crear nuevas unidades" ON unidades_medida;
CREATE POLICY "Permitir crear nuevas unidades"
    ON unidades_medida FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizar unidades" ON unidades_medida;
CREATE POLICY "Permitir actualizar unidades"
    ON unidades_medida FOR UPDATE
    USING (true);

-- 5. Semilla inicial de Unidades Industriales y Petroleras Estándar
INSERT INTO unidades_medida (codigo, nombre, categoria, descripcion, es_sistema, activo)
VALUES
    -- TIEMPO Y MANO DE OBRA
    ('H-H', 'Horas-Hombre', 'tiempo_labor', 'Horas laboradas por personal operativo o técnico', true, true),
    ('SG', 'Servicio Global', 'tiempo_labor', 'Servicio a tanto alzado o precio cerrado por alcance global', true, true),
    ('DIA', 'Día / Jornada', 'tiempo_labor', 'Tarifa por día de trabajo o alquiler operativo', true, true),
    ('TURNO', 'Turno Operacional', 'tiempo_labor', 'Jornada continua de 8 o 12 horas', true, true),
    ('MES', 'Mes Calendario', 'tiempo_labor', 'Servicio continuado mensual', true, true),
    ('SEM', 'Semana', 'tiempo_labor', 'Servicio por semana operativa', true, true),
    ('VIAJE', 'Viaje / Flete', 'tiempo_labor', 'Servicio de acarreo, flete o logística por trayecto', true, true),

    -- VOLUMEN Y CAPACIDAD
    ('BBL', 'Barril (42 Galones)', 'volumen', 'Unidad estándar petrolera de crudo o fluidos de perforación', true, true),
    ('M3', 'Metro Cúbico', 'volumen', 'Volumen para agua, lodos, concreto o excavaciones', true, true),
    ('LTS', 'Litros', 'volumen', 'Medida volumétrica para químicos, combustibles o lubricantes', true, true),
    ('GLN', 'Galón', 'volumen', 'Galón americano estándar (3.785 litros)', true, true),
    ('CUÑETE', 'Cuñete (5 Galones)', 'volumen', 'Envase industrial de 5 galones para grasas o solventes', true, true),
    ('TAMBOR', 'Tambor (55 Galones)', 'volumen', 'Tambor industrial para químicos o fluidos industriales', true, true),

    -- CONTEO Y FABRICACIÓN
    ('PZA', 'Pieza', 'conteo', 'Pieza manufacturada, repuesto o accesorio unitario', true, true),
    ('UNIDAD', 'Unidad Estándar', 'conteo', 'Artículo, equipo o elemento general', true, true),
    ('JGO', 'Juego / Set', 'conteo', 'Conjunto o kit de componentes complementarios', true, true),
    ('TRAMO', 'Tramo de Tubería', 'conteo', 'Longitud comercial de junta de tubería o perfil', true, true),
    ('ROLLO', 'Rollo', 'conteo', 'Mangueras, cables, geomembranas o cinta', true, true),
    ('KIT', 'Kit de Reparación', 'conteo', 'Paquete de sellos, juntas o empaques', true, true),
    ('PAR', 'Par', 'conteo', 'Par de elementos (zapatas, guantes, conectores)', true, true),

    -- MASA Y PESO
    ('KG', 'Kilogramo', 'masa_peso', 'Medida métrica de peso', true, true),
    ('TON', 'Tonelada Métrica', 'masa_peso', '1000 Kilogramos para chatarra, grava, tubería pesada', true, true),
    ('LBS', 'Libras', 'masa_peso', 'Unidad imperial de peso', true, true),
    ('SACO', 'Saco / Bulto', 'masa_peso', 'Saco de cemento, barita o bentonita', true, true),

    -- LONGITUD Y SUPERFICIE
    ('ML', 'Metro Lineal', 'longitud_area', 'Longitud de zanjas, tendido de cables o tuberías', true, true),
    ('M2', 'Metro Cuadrado', 'longitud_area', 'Área de pintura, sandblasting o recubrimientos', true, true),
    ('KM', 'Kilómetro', 'longitud_area', 'Distancia de derecho de vía o líneas de flujo', true, true),
    ('PULG', 'Pulgada', 'longitud_area', 'Diámetro nominal de válvulas y tuberías', true, true),
    ('PIE', 'Pie', 'longitud_area', 'Profundidad de pozo o longitud en unidades americanas', true, true),
    ('FT2', 'Pie Cuadrado', 'longitud_area', 'Superficie en pies cuadrados', true, true)
ON CONFLICT (codigo) DO UPDATE 
SET nombre = EXCLUDED.nombre,
    categoria = EXCLUDED.categoria,
    descripcion = EXCLUDED.descripcion,
    activo = EXCLUDED.activo;
