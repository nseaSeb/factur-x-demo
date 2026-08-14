// scripts/create-db.ts
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

async function createDatabase() {
  const dbName = process.env.DB_NAME || 'facturx';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432');
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';

  console.log(`🗄️  Vérification de la base de données "${dbName}"...`);

  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres', // Connexion à la DB système
  });

  try {
    await client.connect();

    // Vérifier si la DB existe
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rowCount === 0) {
      console.log(`📝 Création de la base de données "${dbName}"...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de données "${dbName}" créée avec succès`);
    } else {
      console.log(`✅ Base de données "${dbName}" existe déjà`);
    }

    await client.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Solutions possibles :');
    console.log('   1. Vérifiez que PostgreSQL est en cours d\'exécution');
    console.log('   2. Vérifiez les identifiants dans le fichier .env');
    console.log('   3. Créez manuellement : createdb -U postgres facturx');
    process.exit(1);
  }
}

createDatabase();
