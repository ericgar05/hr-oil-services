CREATE TABLE ejecucion_reportes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    actividad_id UUID REFERENCES plan_actividades(id) ON DELETE CASCADE,
    fecha_reporte TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_reporta TEXT NOT NULL,
    descripcion_trabajo TEXT NOT NULL,
    justificacion TEXT,
    tipo_accion TEXT, -- 'finalizacion_completa', 'finalizacion_parcial', 'replanificacion'
    cantidades_ejecutadas DECIMAL(15,2),
    cantidades_pendientes DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
