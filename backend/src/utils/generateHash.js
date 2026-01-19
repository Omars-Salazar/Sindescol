import bcrypt from 'bcryptjs';

const password = 'Admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generando hash:', err);
  } else {
    console.log('\n✅ Hash generado para contraseña "Admin123":');
    console.log(hash);
    console.log('\n📋 Copia este hash y actualiza la base de datos\n');
  }
  process.exit(0);
})