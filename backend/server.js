const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});
// Initialization of tables for RBAC
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE,
        password VARCHAR(100),
        role VARCHAR(50)
      );
      
      CREATE TABLE IF NOT EXISTS alert_actions (
        id SERIAL PRIMARY KEY,
        telemetry_id INTEGER,
        user_id INTEGER REFERENCES users(id),
        action_time TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        login_time TIMESTAMP DEFAULT NOW(),
        logout_time TIMESTAMP
      );

      INSERT INTO users (username, password, role) 
      VALUES ('operateur', '1234', 'OPERATOR'), 
             ('manager', '1234', 'MANAGER') 
      ON CONFLICT DO NOTHING;
    `);
    console.log("Database initialized with default users.");
  } catch (err) {
    console.error("Failed to initialize DB", err);
  }
};
initDB();

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT id, username, role FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (result.rows.length === 1) {
      const user = result.rows[0];
      const sessionResult = await pool.query('INSERT INTO user_sessions (user_id) VALUES ($1) RETURNING id', [user.id]);
      user.session_id = sessionResult.rows[0].id;
      res.json(user);
    } else {
      res.status(401).json({ error: 'Identifiants incorrects' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/logout', async (req, res) => {
  const { session_id } = req.body;
  try {
    await pool.query('UPDATE user_sessions SET logout_time = NOW() WHERE id = $1', [session_id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/acknowledge', async (req, res) => {
  const { telemetry_id, user_id } = req.body;
  try {
    await pool.query('INSERT INTO alert_actions (telemetry_id, user_id) VALUES ($1, $2)', [telemetry_id, user_id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/telemetry', async (req, res) => {
  try {
    const query = `
      SELECT t.*, u.username as confirmed_by, a.action_time as confirmed_at, 
        (
          SELECT u2.username 
          FROM user_sessions s 
          JOIN users u2 ON s.user_id = u2.id 
          WHERE s.login_time <= t.created_at AND (s.logout_time >= t.created_at OR s.logout_time IS NULL)
          ORDER BY s.login_time DESC LIMIT 1
        ) as responsible_operator
      FROM ventilation_telemetry t
      LEFT JOIN alert_actions a ON t.id = a.telemetry_id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY t.created_at DESC LIMIT 50
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal server error while fetching telemetry.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
