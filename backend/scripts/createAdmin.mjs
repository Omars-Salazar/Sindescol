import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@presidencia.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const ADMIN_NOMBRE = process.env.ADMIN_NOMBRE || 'Administrador SINDESCOL';
const ADMIN_ROL = process.env.ADMIN_ROL || 'presidencia_nacional';
const ADMIN_CELULAR = process.env.ADMIN_CELULAR || '3000000000';
const ADMIN_DEPARTAMENTO = process.env.ADMIN_DEPARTAMENTO || 'Nacional';

const isProduction = process.env.NODE_ENV === 'production';
const sslRejectUnauthorizedEnv = process.env.DB_SSL_REJECT_UNAUTHORIZED;
const sslRejectUnauthorized = sslRejectUnauthorizedEnv
  ? sslRejectUnauthorizedEnv === 'true'
  : isProduction;

let pool;

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  pool = mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    waitForConnections: true,
    connectionLimit: 2,
    connectTimeout: 15000,
    ssl: {
      rejectUnauthorized: sslRejectUnauthorized,
      servername: url.hostname,
      minVersion: 'TLSv1.2'
    }
  });
} else {
  const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  const dbPass = process.env.DB_PASS ? process.env.DB_PASS : process.env.DB_PASSWORD;

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: dbPort,
    user: process.env.DB_USER,
    password: dbPass,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 2,
    connectTimeout: 15000,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: sslRejectUnauthorized,
      servername: process.env.DB_HOST,
      minVersion: 'TLSv1.2'
    } : undefined
  });
}

try {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const [rows] = await pool.query(
    'SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1',
    [ADMIN_EMAIL.toLowerCase()]
  );

  if (rows.length > 0) {
    await pool.query(
      'UPDATE usuarios SET password_hash = ?, nombre = ?, celular = ?, rol = ?, departamento = ?, activo = 1 WHERE id_usuario = ?',
      [passwordHash, ADMIN_NOMBRE, ADMIN_CELULAR, ADMIN_ROL, ADMIN_DEPARTAMENTO, rows[0].id_usuario]
    );

    console.log(`Admin actualizado: ${ADMIN_EMAIL}`);
  } else {
    await pool.query(
      'INSERT INTO usuarios (email, password_hash, nombre, celular, rol, departamento, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [ADMIN_EMAIL.toLowerCase(), passwordHash, ADMIN_NOMBRE, ADMIN_CELULAR, ADMIN_ROL, ADMIN_DEPARTAMENTO]
    );

    console.log(`Admin creado: ${ADMIN_EMAIL}`);
  }

  console.log('Credenciales por defecto:');
  console.log(`email: ${ADMIN_EMAIL}`);
  console.log(`password: ${ADMIN_PASSWORD}`);
} catch (error) {
  console.error('Error creando/actualizando admin:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
