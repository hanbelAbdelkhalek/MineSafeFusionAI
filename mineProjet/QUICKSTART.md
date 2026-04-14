# ⚡ QUICK START - Système Ventilation IoT

## 🚀 Démarrage Immédiat (< 2 minutes)

### Prérequis
- Node.js 18+ installé
- Compte Supabase connexion actif
- 2 terminaux ouverts

---

## 1️⃣ Terminal 1 : FRONTEND (React Dashboard)

```bash
cd c:\Users\amine\Documents\ids\mineProjet

npm run dev
```

✅ **Output attendu:**
```
  VITE v6.4.2  ready in 767 ms
  ➜  Local:   http://localhost:5173/
```

**Ouvrez:** http://localhost:5173 dans le navigateur

---

## 2️⃣ Terminal 2 : BACKEND (API Express)

```bash
cd c:\Users\amine\Documents\ids\mineProjet

npm run server
```

✅ **Output attendu:**
```
╔════════════════════════════════════════╗
║  🚀 Backend Serveur démarré            ║
║  📍 http://localhost:5000              ║
║  🗄️  PostgreSQL: Connecté              ║
╚════════════════════════════════════════╝
✅ Connexion à PostgreSQL établie
```

---

## 👀 Viewing Live Dashboard

Le dashboard affiche:
- ✅ 4 cartes de nœuds (VentilationNode_01 à _04)
- ✅ Température / Humidité / Vibration
- ✅ Statut SAFE/DANGER en temps réel
- ✅ Alertes dans le tableau

**Auto-refresh:** Toutes les 5 secondes

---

## 🧪 Tester l'API Backend

Depuis PowerShell/CMD:

```bash
# Santé du serveur
curl http://localhost:5000/health

# Derniers 20 relevés
curl http://localhost:5000/api/telemetry

# Alertes actives
curl http://localhost:5000/api/alerts

# Insérer une nouvelle donnée
curl -X POST http://localhost:5000/api/telemetry `
  -H "Content-Type: application/json" `
  -d '{"device_id":"VentilationNode_01","tmp":25.3,"hum":55.2,"vib":0.45}'
```

---

## 📊 Données de Démo

La BD contient déjà **150+ relevés réels** depuis les nœuds:
- **VentilationNode_01**: 149 relevés ✅
- **Temp**: 22-23°C
- **Humidité**: 40-65%
- **Vibration**: 0.15-0.20G
- **Alertes**: 3 relevés DANGER

---

## 🔧 Configuration Actuellement Active

```env
Frontend API:    http://localhost:5000
Backend Port:    5000
Frontend Port:   5173
PostgreSQL:      Supabase (aws-1-eu-west-2.pooler.supabase.com:6543)
Table:           ventilation_telemetry
```

---

## 📝 Fichiers Clés

| Fichier | Rôle |
|---------|------|
| `server.js` | Entry point du backend |
| `db.js` | Connexion PostgreSQL |
| `src/Dashboard.jsx` | Dashboard principal |
| `.env.backend` | Identifiants BD (sécurisé) |
| `package.json` | Scripts npm |

---

## ⚙️ Commandes Utiles

```bash
# Rebuild tout après changements
npm install

# Backend en mode watch (auto-restart)
npm run server:dev

# Frontend en mode watch (Vite HRM)
npm run dev

# Build production frontend
npm run build

# Build stats
npm run preview
```

---

## 🔄 Cycle Développement

```
Modifier: src/Dashboard.jsx
    ↓
Frontend HMR auto-refresh (Vite)
    ↓
Voir changements en temps réel
```

```
Modifier: server.js ou db.js
    ↓
Backend redémarre (avec npm run server:dev)
    ↓
Frontend recherche API
    ↓
Données mises à jour
```

---

## 🆘 Si ça ne marche pas

### Backend ne démarre pas
```bash
# Vérifier les dépendances
npm install

# Tester la BD directement
npm run server
# Cherchez: ✅ Connexion à PostgreSQL établie
```

### Frontend ne se charge pas
```bash
# Hard refresh
Ctrl+Shift+R

# Ou relancer
npm run dev
```

### Pas de données
```bash
# Vérifier l'API
curl http://localhost:5000/api/telemetry

# Tester la connexion
curl http://localhost:5000/health
```

---

## 📖 Documentation Complète

Pour plus de détails:
- **Backend API**: Voir [BACKEND_README.md](BACKEND_README.md)
- **Dashboard UI**: Voir [DASHBOARD_README.md](DASHBOARD_README.md)
- **Rapport Tech**: Voir [BACKEND_REPORT.md](BACKEND_REPORT.md)

---

## 🔐 ⚠️ IMPORTANT

Le fichier `.env.backend` contient les **vraies identifiants BD**:
- ❌ Ne pas committer dans Git
- ❌ Ne pas partager en public
- ❌ Ne pas dupliquer sans raison
- ✅ Gardez local uniquement

---

## ✅ Status Actuellement

| Composant | Status | URL |
|-----------|--------|-----|
| Frontend | ✅ ACTIF | http://localhost:5173 |
| Backend | ✅ ACTIF | http://localhost:5000 |
| PostgreSQL | ✅ CONNECTÉ | aws-1-eu-west-2.pooler.supabase.com:6543 |

---

**Prêt à démarrer? Lancez `npm run dev` et `npm run server`! 🚀**
