CREATE TABLE IF NOT EXISTS mensajes_dia (
  id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
  mensaje VARCHAR(255) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  orden INT DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mensajes_activo (activo),
  INDEX idx_mensajes_orden (orden)
);

INSERT INTO mensajes_dia (mensaje, activo, orden) VALUES
('Mantener datos de afiliados al dia mejora el servicio.', 1, 1),
('Revisar cargos activos ayuda a mantener reportes claros.', 1, 2),
('Verificar cuotas del mes evita retrasos innecesarios.', 1, 3),
('Actualizar municipios garantiza filtros correctos.', 1, 4),
('Revisar accesos de usuarios fortalece la seguridad.', 1, 5),
('Registrar salarios con precision evita ajustes posteriores.', 1, 6),
('Confirmar datos de contacto reduce errores de comunicacion.', 1, 7),
('Usar filtros en listados ahorra tiempo en la gestion diaria.', 1, 8),
('Consultar historial antes de cambios previene inconsistencias.', 1, 9),
('Hacer respaldos periodicos protege la informacion critica.', 1, 10);
