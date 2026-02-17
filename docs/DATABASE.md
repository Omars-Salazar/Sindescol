# 🗄 Database Schema - SINDESCOL

> **Autor:** Omar Santiago Salazar  
> **Motor:** MySQL 8.0+  
> **Charset:** utf8mb4  
> **Collation:** utf8mb4_unicode_ci

---

## Diagrama Entidad-Relación

```
┌──────────────────┐
│    USUARIOS      │
├──────────────────┤
│ id_usuario (PK)  │
│ email (UNIQUE)   │
│ password_hash    │
│ nombre           │
│ celular          │
│ rol              │◄─────┐
│ departamento     │      │
│ activo           │      │
│ fecha_creacion   │      │
└──────────────────┘      │
                          │
┌──────────────────┐      │
│  DEPARTAMENTOS   │      │
├──────────────────┤      │
│ id_departamento  │◄─────┼─────────────────┐
│   (PK)           │      │                 │
│ nombre_dpto      │      │                 │
│ fecha_creacion   │      │                 │
└────────┬─────────┘      │                 │
         │                │                 │
         │                │                 │
┌────────▼─────────┐      │                 │
│   MUNICIPIOS     │      │                 │
├──────────────────┤      │                 │
│ id_municipio(PK) │◄─────┼─────────┐       │
│ id_departamento  │      │         │       │
│   (FK)           │      │         │       │
│ nombre_municipio │      │         │       │
│ fecha_creacion   │      │         │       │
└──────────────────┘      │         │       │
                          │         │       │
┌──────────────────┐      │         │       │
│     CARGOS       │      │         │       │
├──────────────────┤      │         │       │
│ id_cargo (PK)    │◄─────┼─────┐   │       │
│ nombre_cargo     │      │     │   │       │
│ descripcion      │      │     │   │       │
└────────┬─────────┘      │     │   │       │
         │                │     │   │       │
         │                │     │   │       │
┌────────▼─────────────────────┐│   │       │
│       AFILIADOS         │     ││   │       │
├──────────────────────────────┤│   │       │
│ id_afiliado (PK)         │   ││   │       │
│ id_cargo (FK)            │───┘│   │       │
│ nombres                  │    │   │       │
│ apellidos                │    │   │       │
│ cedula (UNIQUE)          │    │   │       │
│ fecha_nacimiento         │    │   │       │
│ departamento             │────┘   │       │
│ municipio                │────────┘       │
│ direccion                │                │
│ celular                  │                │
│ email                    │                │
│ fecha_ingreso_sindicato  │                │
│ estado                   │                │
│ foto_base64              │                │
│ fecha_creacion           │                │
└──────────┬───────────────┘                │
           │                                │
           │                                │
┌──────────▼───────────────┐                │
│       CUOTAS             │                │
├──────────────────────────┤                │
│ id_cuota (PK)            │                │
│ id_afiliado (FK)         │                │
│ valor                    │                │
│ fecha_pago               │                │
│ observaciones            │                │
│ fecha_creacion           │                │
└──────────────────────────┘                │
                                            │
┌─────────────────────────────────┐         │
│    SALARIOS_MUNICIPIOS          │         │
├─────────────────────────────────┤         │
│ id_salario (PK)                 │         │
│ id_cargo (FK) ───────────────────────────┘
│ id_municipio (FK) ───────────────────────┐
│ salario                         │         │
│ fecha_creacion                  │         │
│ UNIQUE(id_cargo, id_municipio)  │         │
└─────────────────────────────────┘         │
                                            │
┌──────────────────────────────┐            │
│     MENSAJES_DIA             │            │
├──────────────────────────────┤            │
│ id_mensaje (PK)              │            │
│ mensaje                      │            │
│ activo                       │            │
│ orden                        │            │
│ fecha_creacion               │            │
└──────────────────────────────┘            │
```

---

## Tablas Detalladas

### 1. `usuarios`

**Descripción:** Usuarios del sistema con diferentes roles jerárquicos.

```sql
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  celular VARCHAR(20),
  rol ENUM('presidencia_nacional', 'presidencia_departamental', 'secretario_general') NOT NULL,
  departamento VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_rol (rol),
  INDEX idx_departamento (departamento),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Roles:**
- `presidencia_nacional`: Acceso total al sistema
- `presidencia_departamental`: Acceso solo a su departamento
- `secretario_general`: Permisos especiales configurables

---

### 2. `afiliados`

**Descripción:** Afiliados al sindicato con información completa.

```sql
CREATE TABLE afiliados (
  id_afiliado INT AUTO_INCREMENT PRIMARY KEY,
  id_cargo INT NOT NULL,
  nombres VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  fecha_nacimiento DATE,
  departamento VARCHAR(100) NOT NULL,
  municipio VARCHAR(100) NOT NULL,
  direccion TEXT,
  celular VARCHAR(20),
  email VARCHAR(255),
  fecha_ingreso_sindicato DATE,
  estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
  foto_base64 LONGTEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_cargo) REFERENCES cargos(id_cargo) ON DELETE RESTRICT,
  
  INDEX idx_cedula (cedula),
  INDEX idx_nombres (nombres),
  INDEX idx_apellidos (apellidos),
  INDEX idx_departamento (departamento),
  INDEX idx_municipio (municipio),
  INDEX idx_cargo (id_cargo),
  INDEX idx_estado (estado),
  FULLTEXT idx_busqueda (nombres, apellidos, cedula)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Estados:**
- `activo`: Afiliado activo pagando cuotas
- `inactivo`: Afiliado temporalmente inactivo
- `suspendido`: Afiliado suspendido por incumplimiento

---

### 3. `cuotas`

**Descripción:** Registro de cuotas sindicales pagadas por afiliados.

```sql
CREATE TABLE IF NOT EXISTS cuotas (
    id_cuota INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL,
    mes VARCHAR(20) NOT NULL,
    anio INT NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cedula) REFERENCES afiliados(cedula) ON DELETE CASCADE,
    UNIQUE KEY unique_cuota (cedula, mes, anio),
    
    INDEX idx_cedula (cedula),
    INDEX idx_mes (mes),
    INDEX idx_anio (anio),
    INDEX idx_fecha_registro (fecha_registro)
);
```

**Notas:**
- `ON DELETE CASCADE`: Si se elimina afiliado, se eliminan sus cuotas
- `cedula`: Referencia directa al afiliado
- `mes` y `anio`: Mes y año de la cuota
- `valor`: Almacena montos en pesos colombianos
- `UNIQUE(cedula, mes, anio)`: Evita duplicados en el mismo mes/año para un afiliado

---

### 4. `cargos`

**Descripción:** Cargos laborales de los afiliados.

```sql
CREATE TABLE cargos (
  id_cargo INT AUTO_INCREMENT PRIMARY KEY,
  nombre_cargo VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_nombre (nombre_cargo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Ejemplos de cargos:**
- Profesor
- Coordinador
- Rector
- Secretario
- Personal Administrativo

---

### 5. `departamentos`

**Descripción:** Departamentos de Colombia.

```sql
CREATE TABLE departamentos (
  id_departamento INT AUTO_INCREMENT PRIMARY KEY,
  nombre_departamento VARCHAR(100) NOT NULL UNIQUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_nombre (nombre_departamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6. `municipios`

**Descripción:** Municipios por departamento.

```sql
CREATE TABLE municipios (
  id_municipio INT AUTO_INCREMENT PRIMARY KEY,
  id_departamento INT NOT NULL,
  nombre_municipio VARCHAR(100) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_departamento) REFERENCES departamentos(id_departamento) ON DELETE CASCADE,
  
  UNIQUE KEY unique_municipio_departamento (id_departamento, nombre_municipio),
  INDEX idx_nombre (nombre_municipio),
  INDEX idx_departamento (id_departamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 7. `salarios_municipios`

**Descripción:** Salarios por cargo y municipio.

```sql
CREATE TABLE salarios_municipios (
  id_salario INT AUTO_INCREMENT PRIMARY KEY,
  id_cargo INT NOT NULL,
  id_municipio INT NOT NULL,
  salario DECIMAL(12,2) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_cargo) REFERENCES cargos(id_cargo) ON DELETE CASCADE,
  FOREIGN KEY (id_municipio) REFERENCES municipios(id_municipio) ON DELETE CASCADE,
  
  UNIQUE KEY unique_cargo_municipio (id_cargo, id_municipio),
  INDEX idx_cargo (id_cargo),
  INDEX idx_municipio (id_municipio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Constraint único:** Un cargo solo puede tener un salario por municipio.

---

### 8. `mensajes_dia`

**Descripción:** Mensajes informativos para el dashboard.

```sql
CREATE TABLE mensajes_dia (
  id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
  mensaje VARCHAR(255) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  orden INT DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_activo (activo),
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Datos de Ejemplo (Seeds)

### Usuarios

```sql
-- Usuario Presidencia Nacional (password: Admin123!)
INSERT INTO usuarios (email, password_hash, nombre, celular, rol, departamento) VALUES
('admin@presidencia.com', '$2a$10$...', 'Administrador Nacional', '3001234567', 'presidencia_nacional', 'Nacional');

-- Usuario Presidencia Departamental (password: Depto123!)
INSERT INTO usuarios (email, password_hash, nombre, celular, rol, departamento) VALUES
('presidente.cundinamarca@sindicato.com', '$2a$10$...', 'Presidente Cundinamarca', '3009876543', 'presidencia_departamental', 'Cundinamarca');
```

### Cargos

```sql
INSERT INTO cargos (nombre_cargo, descripcion) VALUES
('Profesor', 'Docente de educación básica y media'),
('Coordinador', 'Coordinador académico o de convivencia'),
('Rector', 'Rector de institución educativa'),
('Secretario', 'Personal administrativo - secretaría'),
('Auxiliar Servicios Generales', 'Personal de servicios generales');
```

### Departamentos

```sql
INSERT INTO departamentos (nombre_departamento) VALUES
('Cundinamarca'),
('Antioquia'),
('Valle del Cauca'),
('Atlántico'),
('Santander');
```

### Municipios (Ejemplos)

```sql
INSERT INTO municipios (id_departamento, nombre_municipio) VALUES
(1, 'Bogotá'),
(1, 'Soacha'),
(1, 'Facatativá'),
(2, 'Medellín'),
(2, 'Bello'),
(3, 'Cali');
```

### Mensajes del Día

```sql
INSERT INTO mensajes_dia (mensaje, activo, orden) VALUES
('Mantener datos de afiliados al día mejora el servicio.', 1, 1),
('Revisar cargos activos ayuda a mantener reportes claros.', 1, 2),
('Verificar cuotas del mes evita retrasos innecesarios.', 1, 3),
('Actualizar municipios garantiza filtros correctos.', 1, 4),
('Revisar accesos de usuarios fortalece la seguridad.', 1, 5);
```

---

## Consultas Útiles

### Estadísticas Generales

```sql
-- Total de afiliados por departamento
SELECT departamento, COUNT(*) as total_afiliados
FROM afiliados
WHERE estado = 'activo'
GROUP BY departamento
ORDER BY total_afiliados DESC;

-- Afiliados sin cuotas en el último mes
SELECT a.id_afiliado, a.nombres, a.apellidos, a.cedula
FROM afiliados a
LEFT JOIN cuotas c ON a.id_afiliado = c.id_afiliado 
  AND c.fecha_pago >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
WHERE c.id_cuota IS NULL AND a.estado = 'activo';

-- Total recaudado por mes
SELECT 
  YEAR(fecha_pago) as año,
  MONTH(fecha_pago) as mes,
  SUM(valor) as total_recaudado,
  COUNT(*) as cantidad_cuotas
FROM cuotas
GROUP BY YEAR(fecha_pago), MONTH(fecha_pago)
ORDER BY año DESC, mes DESC;
```

### Reportes de Salarios

```sql
-- Salarios promedio por cargo
SELECT 
  c.nombre_cargo,
  AVG(sm.salario) as salario_promedio,
  MIN(sm.salario) as salario_minimo,
  MAX(sm.salario) as salario_maximo,
  COUNT(*) as municipios_registrados
FROM salarios_municipios sm
JOIN cargos c ON sm.id_cargo = c.id_cargo
GROUP BY c.id_cargo, c.nombre_cargo;

-- Comparativa de salarios entre departamentos
SELECT 
  d.nombre_departamento,
  c.nombre_cargo,
  AVG(sm.salario) as salario_promedio
FROM salarios_municipios sm
JOIN municipios m ON sm.id_municipio = m.id_municipio
JOIN departamentos d ON m.id_departamento = d.id_departamento
JOIN cargos c ON sm.id_cargo = c.id_cargo
GROUP BY d.nombre_departamento, c.nombre_cargo
ORDER BY d.nombre_departamento, salario_promedio DESC;
```

---

## Respaldo y Mantenimiento

### Backup Manual

```bash
# Backup completo
mysqldump -u root -p sindescol > backup_sindescol_$(date +%Y%m%d).sql

# Backup solo estructura
mysqldump -u root -p --no-data sindescol > schema_sindescol.sql

# Backup solo datos
mysqldump -u root -p --no-create-info sindescol > data_sindescol.sql
```

### Restauración

```bash
mysql -u root -p sindescol < backup_sindescol_20260212.sql
```

### Optimización

```sql
-- Analizar tablas
ANALYZE TABLE afiliados, cuotas, salarios_municipios;

-- Optimizar tablas
OPTIMIZE TABLE afiliados, cuotas, salarios_municipios;

-- Ver tamaño de tablas
SELECT 
  table_name AS 'Tabla',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Tamaño (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'sindescol'
ORDER BY (data_length + index_length) DESC;
```

---

## Índices y Performance

### Índices Implementados

Todos los índices han sido cuidadosamente diseñados para optimizar:
- Búsquedas por cédula (UNIQUE)
- Filtros por departamento y municipio
- Joins entre tablas relacionadas
- Búsqueda full-text en nombres/apellidos
- Ordenamiento por fechas

### Recomendaciones

- ✅ Usar `EXPLAIN` antes de queries complejas
- ✅ Evitar `SELECT *` en producción
- ✅ Implementar paginación en listados grandes
- ✅ Usar conexiones pool (ya implementado)
- ✅ Backup diario automatizado

---

**Documentado por:** [Omar Santiago Salazar Yaqueno]  
**Motor de base de datos:** MySQL 8.0+  
**Última actualización:** Febrero 2026
