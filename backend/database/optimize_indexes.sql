-- ============================================================================
-- SINDESCOL - Optimización de Índices para Base de Datos
-- ============================================================================
-- Este script agrega índices críticos para mejorar el rendimiento con 500+ usuarios
-- Ejecutar en Railway MySQL después de la creación inicial
-- ============================================================================

USE railway;

-- ============================================================================
-- TABLA: afiliados (CRÍTICO - tabla más consultada)
-- ============================================================================

-- Índice en cédula para búsquedas rápidas (ya es UNIQUE pero reforzamos)
ALTER TABLE afiliados ADD INDEX idx_cedula (cedula);

-- Índice compuesto para búsquedas por nombre completo
ALTER TABLE afiliados ADD INDEX idx_nombres_apellidos (nombres, apellidos);

-- Índice separado para apellidos (búsquedas tipo "buscar por apellido")
ALTER TABLE afiliados ADD INDEX idx_apellidos (apellidos);

-- Índice en municipio_trabajo para filtros por ubicación
ALTER TABLE afiliados ADD INDEX idx_municipio_trabajo (municipio_trabajo);

-- Índice en id_cargo para reportes y filtros
ALTER TABLE afiliados ADD INDEX idx_cargo (id_cargo);

-- Índice en id_institucion para obtener afiliados por institución
ALTER TABLE afiliados ADD INDEX idx_institucion (id_institucion);

-- Índice en fecha_afiliacion para reportes temporales
ALTER TABLE afiliados ADD INDEX idx_fecha_afiliacion (fecha_afiliacion);

-- Índice compuesto para consultas de afiliados por municipio y cargo
ALTER TABLE afiliados ADD INDEX idx_municipio_cargo (municipio_trabajo, id_cargo);

-- ============================================================================
-- TABLA: cuotas (CRÍTICO - consultas frecuentes por cédula, mes, año)
-- ============================================================================

-- Índice compuesto para búsquedas por cedula + periodo
ALTER TABLE cuotas ADD INDEX idx_cedula_periodo (cedula, anio, mes);

-- Índice solo en año para reportes anuales
ALTER TABLE cuotas ADD INDEX idx_anio (anio);

-- Índice en fecha_registro para auditorías
ALTER TABLE cuotas ADD INDEX idx_fecha_registro (fecha_registro);

-- ============================================================================
-- TABLA: usuarios (agregar índices faltantes)
-- ============================================================================

-- Índice en rol para filtrar usuarios por tipo
ALTER TABLE usuarios ADD INDEX idx_rol (rol);

-- Índice en activo para obtener solo usuarios activos
ALTER TABLE usuarios ADD INDEX idx_activo (activo);

-- Índice compuesto para filtros comunes: departamento + rol + activo
ALTER TABLE usuarios ADD INDEX idx_depto_rol_activo (departamento, rol, activo);

-- ============================================================================
-- TABLA: municipios
-- ============================================================================

-- Índice en departamento para filtros por región
ALTER TABLE municipios ADD INDEX idx_departamento (departamento);

-- Índice compuesto para búsquedas combinadas
ALTER TABLE municipios ADD INDEX idx_nombre_depto (nombre_municipio, departamento);

-- ============================================================================
-- TABLA: instituciones_educativas
-- ============================================================================

-- Índice en nombre para búsquedas
ALTER TABLE instituciones_educativas ADD INDEX idx_nombre_institucion (nombre_institucion);

-- ============================================================================
-- TABLA: salarios_municipios
-- ============================================================================

-- Índice en id_cargo para consultas de salarios por cargo
ALTER TABLE salarios_municipios ADD INDEX idx_cargo_salario (id_cargo);

-- Índice en id_municipio para consultas de salarios por municipio
ALTER TABLE salarios_municipios ADD INDEX idx_municipio_salario (id_municipio);

-- ============================================================================
-- TABLA: cargos
-- ============================================================================

-- Índice en nombre_cargo para búsquedas
ALTER TABLE cargos ADD INDEX idx_nombre_cargo (nombre_cargo);

-- ============================================================================
-- TABLA: actas_nombramiento
-- ============================================================================

-- Índice en id_afiliado para obtener actas de un afiliado
ALTER TABLE actas_nombramiento ADD INDEX idx_afiliado_nombramiento (id_afiliado);

-- Índice en fecha para reportes temporales
ALTER TABLE actas_nombramiento ADD INDEX idx_fecha_resolucion (fecha_resolucion);

-- ============================================================================
-- TABLA: actas_posesion
-- ============================================================================

-- Índice en id_afiliado
ALTER TABLE actas_posesion ADD INDEX idx_afiliado_posesion (id_afiliado);

-- Índice en fecha
ALTER TABLE actas_posesion ADD INDEX idx_fecha_acta (fecha_acta);

-- ============================================================================
-- TABLA: otros_cargos
-- ============================================================================

-- Índice en id_afiliado
ALTER TABLE otros_cargos ADD INDEX idx_afiliado_otros_cargos (id_afiliado);

-- Índice en fechas para búsquedas de cargos activos
ALTER TABLE otros_cargos ADD INDEX idx_fechas (fecha_inicio, fecha_fin);

-- ============================================================================
-- TABLA: rectores
-- ============================================================================

-- Índice en id_institucion para obtener rector de institución
ALTER TABLE rectores ADD INDEX idx_institucion_rector (id_institucion);

-- ============================================================================
-- TABLA: mensajes_dia
-- ============================================================================

-- Índice compuesto para obtener mensajes activos ordenados
ALTER TABLE mensajes_dia ADD INDEX idx_activo_orden (activo, orden);

-- ============================================================================
-- VERIFICACIÓN DE ÍNDICES CREADOS
-- ============================================================================

-- Ejecutar esta query para verificar todos los índices:
-- SHOW INDEX FROM afiliados;
-- SHOW INDEX FROM cuotas;
-- SHOW INDEX FROM usuarios;
-- SHOW INDEX FROM municipios;
-- SHOW INDEX FROM instituciones_educativas;
-- SHOW INDEX FROM salarios_municipios;

-- ============================================================================
-- ESTADÍSTICAS Y OPTIMIZACIÓN
-- ============================================================================

-- Analizar tablas para actualizar estadísticas del optimizador
ANALYZE TABLE afiliados;
ANALYZE TABLE cuotas;
ANALYZE TABLE usuarios;
ANALYZE TABLE municipios;
ANALYZE TABLE instituciones_educativas;
ANALYZE TABLE salarios_municipios;
ANALYZE TABLE cargos;
ANALYZE TABLE actas_nombramiento;
ANALYZE TABLE actas_posesion;
ANALYZE TABLE otros_cargos;
ANALYZE TABLE rectores;
ANALYZE TABLE mensajes_dia;

-- ============================================================================
-- VERIFICACIÓN DE ÍNDICES CREADOS
-- ============================================================================

-- Verificar índices en tabla afiliados (debe tener 8+ índices)
SELECT 
    'afiliados' AS tabla,
    INDEX_NAME AS indice,
    COLUMN_NAME AS columna,
    SEQ_IN_INDEX AS posicion,
    NON_UNIQUE AS no_unico
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'afiliados'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- Verificar índices en tabla cuotas (debe tener 3+ índices)
SELECT 
    'cuotas' AS tabla,
    INDEX_NAME AS indice,
    COLUMN_NAME AS columna,
    SEQ_IN_INDEX AS posicion
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'cuotas'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- Verificar índices en tabla usuarios (debe tener 5+ índices)
SELECT 
    'usuarios' AS tabla,
    INDEX_NAME AS indice,
    COLUMN_NAME AS columna,
    SEQ_IN_INDEX AS posicion
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'usuarios'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- Verificar índices en tabla municipios (debe tener 2+ índices)
SELECT 
    'municipios' AS tabla,
    INDEX_NAME AS indice,
    COLUMN_NAME AS columna
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'municipios'
ORDER BY INDEX_NAME;

-- Verificar índices en tabla salarios_municipios (debe tener 3+ índices)
SELECT 
    'salarios_municipios' AS tabla,
    INDEX_NAME AS indice,
    COLUMN_NAME AS columna
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'salarios_municipios'
ORDER BY INDEX_NAME;

-- ============================================================================
-- RESUMEN ESTADÍSTICO DE ÍNDICES
-- ============================================================================

-- Contar total de índices por tabla
SELECT 
    TABLE_NAME AS tabla,
    COUNT(DISTINCT INDEX_NAME) AS total_indices,
    SUM(CASE WHEN NON_UNIQUE = 0 THEN 1 ELSE 0 END) AS indices_unicos,
    SUM(CASE WHEN NON_UNIQUE = 1 THEN 1 ELSE 0 END) AS indices_no_unicos
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'railway'
GROUP BY TABLE_NAME
ORDER BY total_indices DESC;

-- Mostrar tamaño de índices vs datos
SELECT 
    TABLE_NAME AS tabla,
    ROUND((DATA_LENGTH) / 1024 / 1024, 2) AS datos_MB,
    ROUND((INDEX_LENGTH) / 1024 / 1024, 2) AS indices_MB,
    ROUND((INDEX_LENGTH / DATA_LENGTH) * 100, 2) AS porcentaje_indices
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'railway'
ORDER BY DATA_LENGTH DESC;

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. Ejecutar este script después de insertar los datos iniciales
-- 2. Los índices ocupan espacio adicional (~10-20% del tamaño de la tabla)
-- 3. Mejoran dramáticamente las consultas SELECT pero ralentizan INSERT/UPDATE
-- 4. Para 500+ usuarios, estos índices son OBLIGATORIOS
-- 5. Monitorear uso de RAM en Railway después de aplicar
-- ============================================================================
