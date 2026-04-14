# 🔐 Configuration Backend - Guide Complet

## Architecture

```
Frontend (React/Vite)  ←→  Backend (Express.js)  ←→  PostgreSQL (Supabase)
http://localhost:5173       http://localhost:5000      aws-1-eu-west-2.pooler.supabase.com
```

---

## 📋 Fichiers Backend Créés

| Fichier | Rôle |
|---------|------|
| **db.js** | Pool de connexion PostgreSQL (pg) |
| **server.js** | Serveur Express.js avec API REST |
| **.env.backend** | Variables d'environnement sensibles |

---

## ⚙️ Configuration de Démarrage

### Frontend (Vite) - Port 5173
```bash
npm run dev
```
Ouvre le dashboard React sur http://localhost:5173

### Backend (Express) - Port 5000
```bash
npm run server
```
Lance le serveur API sur http://localhost:5000

### Terminal Mode Watch (Redémarrage Auto)
```bash
npm run server:dev
```
Redémarre automatiquement lors de changements de fichiers

---

## 📡 Routes API Disponibles

### 1️⃣ **GET /health** - Vérifier le statut du serveur
```bash
curl http://localhost:5000/health
```
**Réponse:**
```json
{
  "status": "Backend actif ✅",
  "timestamp": "2026-04-13T14:36:39.754Z"
}
```

---

### 2️⃣ **GET /api/telemetry** - Derniers 20 relevés de tous les nœuds
```bash
curl http://localhost:5000/api/telemetry
```
**Réponse:**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "id": 149,
      "created_at": "2026-04-13T13:10:49.994Z",
      "device_id": "VentilationNode_01",
      "tmp": 22.51,
      "hum": 44.69,
      "vib": 0.18,
      "alert": false,
      "status": "SAFE"
    },
    ...
  ],
  "timestamp": "2026-04-13T14:36:52.576Z"
}
```

---

### 3️⃣ **GET /api/telemetry/:device_id** - Historique d'un nœud (50 derniers relevés)
```bash
curl http://localhost:5000/api/telemetry/VentilationNode_01
```

---

### 4️⃣ **GET /api/alerts** - Alertes actives uniquement
```bash
curl http://localhost:5000/api/alerts
```

Retourne seulement les relevés où:
- `status = 'DANGER'` OU
- `vib > 0.8` OU
- `tmp > 28`

**Réponse:**
```json
{
  "success": true,
  "alert_count": 3,
  "alerts": [
    {
      "id": 134,
      "created_at": "2026-04-13T13:10:34.942Z",
      "device_id": "VentilationNode_01",
      "tmp": 22.49,
      "hum": 42.32,
      "vib": 0.17,
      "alert": true,
      "status": "DANGER"
    }
  ],
  "timestamp": "2026-04-13T14:36:57.185Z"
}
```

---

### 5️⃣ **POST /api/telemetry** - Insérer une nouvelle télémétrie

**Utilisation depuis ESP32 ou un autre système:**

```bash
curl -X POST http://localhost:5000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "VentilationNode_01",
    "tmp": 25.3,
    "hum": 55.2,
    "vib": 0.45,
    "status": "SAFE"
  }'
```

**Notes:**
- `status` est optionnel : s'il n'est pas fourni, il est déterminé automatiquement
  - `DANGER` si `vib > 0.8` OU `tmp > 28`
  - `SAFE` sinon
- `alert` est défini automatiquement selon le statut

**Réponse:**
```json
{
  "success": true,
  "message": "Télémétrie enregistrée",
  "data": {
    "id": 500,
    "created_at": "2026-04-13T14:40:00.000Z",
    "device_id": "VentilationNode_01",
    "tmp": 25.3,
    "hum": 55.2,
    "vib": 0.45,
    "alert": false,
    "status": "SAFE"
  },
  "timestamp": "2026-04-13T14:40:00.000Z"
}
```

---

## 🔒 Configuration PostgreSQL (Supabase)

### Paramètres de Connexion (dans `.env.backend`)

```env
DB_HOST=aws-1-eu-west-2.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.tdxbhfsxbzhysidmkcli
DB_PASSWORD='cjcS*4a72"7(CS($'
DB_NAME=postgres
```

### Structure de la Table

```sql
CREATE TABLE ventilation_telemetry (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_id VARCHAR(50) NOT NULL,
  tmp FLOAT NOT NULL,
  hum FLOAT NOT NULL,
  vib FLOAT NOT NULL,
  alert BOOLEAN DEFAULT FALSE,
  status VARCHAR(10) DEFAULT 'SAFE'
);
```

### Important : SSL sur Pooler Supabase

Le code PostgreSQL ajoute **obligatoirement**:
```javascript
ssl: {
  rejectUnauthorized: false
}
```

Cela est **nécessaire** pour les connexions au pooler Supabase.

---

## 🌐 Intégration Frontend

Le Dashboard React utilise le backend via:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Exemple de fetch
const response = await fetch(`${API_BASE_URL}/api/telemetry`);
const data = await response.json();
```

Variable d'environnement à configurer dans `.env`:
```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Déploiement en Production

### Serveur Frontend (Vercel, Netlify, etc.)

1. **Build le frontend:**
   ```bash
   npm run build
   ```

2. **Configurez la variable d'environnement:**
   ```env
   VITE_API_URL=https://votre-backend-api.com
   ```

3. **Déployez `dist/` sur Vercel/Netlify**

### Serveur Backend (Heroku, Railway, Fly.io, etc.)

1. **Déployez avec process.env.PORT:**
   ```javascript
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => { ... });
   ```

2. **Configurez les variables d'environnement sur la plateforme:**
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `NODE_ENV=production`

3. **Exemple: Déploiement sur Heroku**
   ```bash
   heroku config:set DB_HOST=aws-1-eu-west-2.pooler.supabase.com
   heroku config:set DB_USER=postgres.tdxbhfsxbzhysidmkcli
   heroku config:set DB_PASSWORD='cjcS*4a72"7(CS($'
   heroku config:set DB_NAME=postgres
   ```

---

## 🔐 Bonnes Pratiques de Sécurité

### ⚠️ NE JAMAIS

❌ Committer `.env.backend` dans Git  
❌ Partager les identifiants PostgreSQL publiquement  
❌ Utiliser les identifiants directement dans le code  
❌ Exposer le mot de passe en variables de frontend  

### ✅ À FAIRE

✅ Utiliser un fichier `.env.backend` local (ajouté à `.gitignore`)  
✅ Utiliser des secrets sur la plateforme de déploiement  
✅ Implémenter une authentification (JWT) plus tard  
✅ Ajouter du rate limiting sur les routes API  
✅ Valider les inputs sur le serveur  

---

## 🛠️ Maintenance

### Logs du Backend
```bash
npm run server:dev
# Affiche:
# ✅ Connexion à PostgreSQL établie
# 📌 Routes disponibles: ...
```

### Vérifier la Connexion PostgreSQL
```bash
curl http://localhost:5000/health
```

### Vérifier les Données
```bash
curl http://localhost:5000/api/telemetry | jq '.count'
```

### Redémarrer le Backend
```bash
# Arrêter (Ctrl+C) et relancer
npm run server
```

---

## 📞 Troubleshooting

### ❌ "Erreur: Database connection refused"
→ Vérifiez que les identifiants `.env.backend` sont corrects  
→ Vérifiez que la BD Supabase est active  

### ❌ "Cannot find module 'pg'"
→ Exécutez `npm install pg`  

### ❌ "CORS Error" depuis le frontend
→ Vérifiez que l'API URL du frontend correspond au port du backend  
→ Les CORS sont activés dans Express: `app.use(cors())`  

### ❌ "TypeError: Cannot read property 'rows' of undefined"
→ Erreur d'une requête SQL  
→ Vérifiez la syntaxe dans `server.js`  

---

## 📚 Ressources

- [Documentation pg (node-postgres)](https://node-postgres.com/)
- [Documentation Express.js](https://expressjs.com/)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- [CORS dans Express](https://expressjs.com/en/resources/middleware/cors.html)

---

**Backend créé le 13/04/2026 | Système de surveillance minière**
