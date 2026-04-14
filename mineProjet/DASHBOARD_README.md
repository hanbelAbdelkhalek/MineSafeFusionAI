# Système de Surveillance Ventilation Minière - Dashboard React

Dashboard complet et moderne pour surveiller en temps réel les nœuds ESP32 de ventilation minière avec Supabase PostgreSQL.

## 🎯 Fonctionnalités

✅ **Surveillance En Temps Réel** - Actualisation des données toutes les 5 secondes (configurable)  
✅ **4 Nœuds d'Affichage** - Grille responsive de 4 cards pour les nœuds ESP32  
✅ **Alertes Intelligentes** - Logique d'alerte: danger si `status='DANGER'` OU `vib > 0.8G` OU `tmp > 28°C`  
✅ **Tableau d'Historique** - Liste des 10 dernières alertes avec filtrage  
✅ **Design Moderne** - Tailwind CSS + Lucide icons + dark mode  
✅ **Indicateurs Visuels** - Badges de statut, icônes de danger, indicateur "En direct"  

## 📋 Prérequis

- Node.js >= 18
- Compte Supabase (https://supabase.com)
- Clés API Supabase (URL + ANON_KEY)

## 🚀 Installation

### 1. Cloner/Initialiser le projet
```bash
npm install
```

### 2. Configurer Supabase

#### a) Créer le projet Supabase
1. Allez sur https://app.supabase.com
2. Créez un nouveau projet
3. Attendez l'initialisation de la BD PostgreSQL

#### b) Créer la table `ventilation_telemetry`

Allez dans **SQL Editor** → **New Query** et exécutez:

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

-- Index pour optimiser les requêtes
CREATE INDEX idx_device_created ON ventilation_telemetry(device_id, created_at DESC);
CREATE INDEX idx_status ON ventilation_telemetry(status);

-- Active les mises à jour en temps réel (optional, mais recommandé)
ALTER TABLE ventilation_telemetry REPLICA IDENTITY FULL;
```

#### c) Récupérer les clés API

1. Allez dans **Project Settings** → **API**
2. Copiez:
   - **Project URL** (exemple: `https://xxxxx.supabase.co`)
   - **anon public** (exemple: `eyJhbGciOiJIUzI1NiIsInR5...`)

### 3. Configurer les variables d'environnement

Créez/modifiez le fichier `.env` à la racine du projet:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Démarrer le serveur de développement

```bash
npm run dev
```

L'application sera disponible à `http://localhost:5173`

## 📊 Structure des Données Attendues

La table PostgreSQL doit recevoir des données au format suivant:

```json
{
  "device_id": "VentilationNode_01",
  "tmp": 25.3,
  "hum": 55.2,
  "vib": 0.45,
  "status": "SAFE"
}
```

### Exemple d'insertion depuis un ESP32 (pseudo-code Arduino):

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

String SUPABASE_URL = "https://your-project.supabase.co";
String SUPABASE_KEY = "your-anon-key";

void sendTelemetry(float temp, float hum, float vib) {
  HTTPClient http;
  
  String url = SUPABASE_URL + "/rest/v1/ventilation_telemetry";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));

  JsonDocument doc;
  doc["device_id"] = "VentilationNode_01";
  doc["tmp"] = temp;
  doc["hum"] = hum;
  doc["vib"] = vib;
  doc["status"] = vib > 0.8 || temp > 28 ? "DANGER" : "SAFE";

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  http.end();
}
```

## 🎨 Architecture du Composant

### Dashboard.jsx
- **Header** : Titre, statut global, indicateur en direct
- **System Info Bar** : Statistiques (nœuds actifs, en danger, alertes totales)
- **Nodes Grid** : 4 cards avec Temperature/Humidité/Vibration
- **Alerts Table** : Historique des 10 dernières alertes
- **Footer** : Information système

### Composants Internes
- **NodeCard** : Affiche les données d'un nœud unique avec logique d'alerte
- **AlertsTable** : Tableau responsive des alertes

## ⚙️ Logique d'Alerte

Un nœud est en **DANGER** si l'une de ces conditions est vraie:
```javascript
node.status === 'DANGER'   // Défini côté ESP32
|| node.vib > 0.8         // Vibration excessive
|| node.tmp > 28          // Température excessive
```

## 🔄 Actualisation des Données

L'application utilise `setInterval` pour actualiser les données toutes les 5 secondes.

**Pour modifier cet intervalle**, dans `Dashboard.jsx` ligne 165:
```javascript
const interval = setInterval(() => {
  loadData();
}, 5000); // 5000 ms = 5 secondes
```

## 🌙 Dark Mode

Le composant supporte automatiquement le dark mode via Tailwind CSS avec la classe `dark:`.

Pour activer: Ajoutez `dark` à la classe HTML ou utilisez les préférences système.

## 📱 Responsive Design

- **Mobile** : 1 colonne (320px+)
- **Tablet** : 2 colonnes (768px+)
- **Desktop** : 4 colonnes (1024px+)

## 🔒 Sécurité

⚠️ **Important**: Les clés Supabase dans le `.env` sont publiques (anon key).

- N'utilisez PAS la service_role_key dans le frontend
- Configurez les **RLS (Row Level Security)** sur Supabase pour limiter l'accès:

```sql
ALTER TABLE ventilation_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON ventilation_telemetry
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role" ON ventilation_telemetry
  FOR INSERT WITH CHECK (true);
```

## 🧪 Mode Développement

Si vous n'avez pas encore d'ESP32 ou Supabase, vous pouvez insérer des données manuellement:

1. Allez dans Supabase → **Table Editor**
2. Insérez des lignes manuellement
3. Ou utilisez SQL:

```sql
INSERT INTO ventilation_telemetry (device_id, tmp, hum, vib, status)
VALUES 
  ('VentilationNode_01', 25.5, 50.0, 0.3, 'SAFE'),
  ('VentilationNode_02', 27.8, 60.2, 0.95, 'DANGER'),
  ('VentilationNode_03', 26.1, 55.5, 0.4, 'SAFE'),
  ('VentilationNode_04', 29.2, 65.0, 1.1, 'DANGER');
```

## 📦 Dépendances

- **react** ^19.2.4 - Framework UI
- **react-dom** ^19.2.4 - Rendu DOM
- **@supabase/supabase-js** ^2.x - Client Supabase
- **lucide-react** ^latest - Icônes
- **tailwindcss** ^3.x - Styles
- **vite** ^8.x - Build tool

## 🛠️ Build pour Production

```bash
npm run build
```

Les fichiers compilés seront dans `dist/`

## 📞 Support & Troubleshooting

### "Supabase keys not configured"
→ Vérifiez votre fichier `.env` et rechargez la page

### Les données ne s'actualisent pas
→ Vérifiez la console pour les erreurs de connexion Supabase  
→ Au besoin, insérez des données manuellement dans Supabase

### Styling en Tailwind ne fonctionne pas
→ Redémarrez le serveur Vite (`npm run dev`)

---

**Créé avec ❤️ pour la surveillance IoT minière**
