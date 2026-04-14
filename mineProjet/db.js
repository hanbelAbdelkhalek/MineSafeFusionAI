import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Charger .env.backend en priorité pour les variables sensibles
dotenv.config({ path: '.env.backend' });
dotenv.config();

// Configuration du pool PostgreSQL pour Supabase
const pool = new Pool({
  host: process.env.DB_HOST || 'aws-1-eu-west-2.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT) || 6543,
  user: process.env.DB_USER || 'postgres.tdxbhfsxbzhysidmkcli',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  ssl: {
    rejectUnauthorized: false, // Obligatoire pour le pooler Supabase
  },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Gestion des erreurs de connexion
pool.on('error', (err) => {
  console.error('Erreur inattendue du pool PostgreSQL:', err);
  process.exit(-1);
});

// Test de connexion au démarrage
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
  } else {
    console.log('✅ Connexion à PostgreSQL établie:', result.rows[0]);
  }
});

export default pool;
