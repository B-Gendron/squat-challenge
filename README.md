# 🏋️ Squat Challenge × 30

Application web légère pour suivre un challenge de squats à deux.  
Le challenge commence le **1er mars 2026**.

## 🚀 Utilisation

Ouvrir `index.html` dans un navigateur. Aucune installation requise.

## 👤 Comptes

| Utilisateur | Mot de passe |
|-------------|--------------|
| Barbara     | password     |
| Nicolas     | password     |

## 📁 Structure

```
squat-challenge/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── data.js    ← programme, dates, config JSONBin
│   ├── auth.js    ← authentification + session
│   └── app.js     ← logique, enregistrement, leaderboard
└── README.md
```

## 🌐 Partager les scores entre appareils (JSONBin)

Par défaut, les données sont stockées localement sur chaque appareil.  
Pour que Barbara et Nicolas voient les scores l'un de l'autre depuis n'importe où :

### Étapes de configuration

1. **Créer un compte** sur [jsonbin.io](https://jsonbin.io) (plan gratuit)

2. **Créer un nouveau Bin** avec ce contenu initial :
   ```json
   {"Barbara":{}, "Nicolas":{}}
   ```
   Cocher "Private" si vous voulez que le bin soit privé.

3. **Copier l'ID du Bin** (visible dans l'URL : `https://api.jsonbin.io/v3/b/XXXXXX`)

4. **Copier la Master Key** depuis Settings > API Keys

5. **Coller dans `js/data.js`** :
   ```js
   const JSONBIN_BIN_ID  = 'ton-id-ici';
   const JSONBIN_API_KEY = 'ta-api-key-ici';
   ```

6. Sauvegarder, et c'est tout ! Les scores se synchronisent automatiquement (rafraîchissement toutes les 30 secondes).

> **Limites du plan gratuit JSONBin :** 10 000 requêtes/mois — largement suffisant pour deux personnes sur 31 jours.

## ✨ Fonctionnalités

- Programme du jour avec répartition visuelle par type de squat
- Enregistrement additif dans la journée (plusieurs fois si besoin)
- Jours de repos bloqués automatiquement
- Leaderboard avec score du jour et total depuis le début
- Grille des 31 jours avec statut visuel
- Synchronisation temps réel si JSONBin configuré

## 🛠 Personnalisation

- **Programme** : tableau `PROGRAM` dans `js/data.js`
- **Mots de passe** : objet `USERS` dans `js/data.js`
- **Couleurs** : variables CSS `:root` dans `css/style.css`
