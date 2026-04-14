import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'Backend actif ✅', timestamp: new Date().toISOString() });
});

// Route API : Récupère les 20 derniers relevés de télémétrie
app.get('/api/telemetry', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        created_at,
        device_id,
        tmp,
        hum,
        vib,
        alert,
        status
      FROM ventilation_telemetry
      ORDER BY created_at DESC
      LIMIT 20`
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur lors de la requête /api/telemetry:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des données',
      message: error.message,
    });
  }
});

// Route API : Récupère les données d'un nœud spécifique
app.get('/api/telemetry/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;
    const result = await pool.query(
      `SELECT 
        id,
        created_at,
        device_id,
        tmp,
        hum,
        vib,
        alert,
        status
      FROM ventilation_telemetry
      WHERE device_id = $1
      ORDER BY created_at DESC
      LIMIT 50`,
      [device_id]
    );

    res.json({
      success: true,
      device: device_id,
      count: result.rows.length,
      data: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Erreur lors de la requête /api/telemetry/${req.params.device_id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des données du nœud',
      message: error.message,
    });
  }
});

// Route API : Alertes uniquement
app.get('/api/alerts', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        created_at,
        device_id,
        tmp,
        hum,
        vib,
        alert,
        status
      FROM ventilation_telemetry
      WHERE status = 'DANGER' OR vib > 0.8 OR tmp > 28
      ORDER BY created_at DESC
      LIMIT 50`
    );

    res.json({
      success: true,
      alert_count: result.rows.length,
      alerts: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur lors de la requête /api/alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des alertes',
      message: error.message,
    });
  }
});

// Route POST : Insérer une nouvelle télémétrie
app.post('/api/telemetry', async (req, res) => {
  try {
    const { device_id, tmp, hum, vib, status } = req.body;

    // Validation
    if (!device_id || tmp === undefined || hum === undefined || vib === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres manquants',
        required: ['device_id', 'tmp', 'hum', 'vib'],
      });
    }

    // Déterminer le statut automatiquement si non fourni
    const computedStatus =
      status || (vib > 0.8 || tmp > 28 ? 'DANGER' : 'SAFE');

    const result = await pool.query(
      `INSERT INTO ventilation_telemetry (device_id, tmp, hum, vib, status, alert)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at, device_id, tmp, hum, vib, status, alert`,
      [device_id, tmp, hum, vib, computedStatus, computedStatus === 'DANGER']
    );

    res.status(201).json({
      success: true,
      message: 'Télémétrie enregistrée',
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur lors de l\'insertion en POST /api/telemetry:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'insertion de la télémétrie',
      message: error.message,
    });
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    path: req.path,
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Backend Serveur démarré            ║
║  📍 http://localhost:${PORT}           ║
║  🗄️  PostgreSQL: Connecté              ║
╚════════════════════════════════════════╝

📌 Routes disponibles:
  GET  /health                    - Status du serveur
  GET  /api/telemetry             - Derniers 20 relevés
  GET  /api/telemetry/:device_id  - Données d'un nœud
  GET  /api/alerts                - Alertes actives
  POST /api/telemetry             - Insérer nouvelle donnée

  `);
});
