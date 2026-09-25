# Djangue

Plateforme e-learning orientée développement web, systèmes et outils professionnels.

## Prérequis

- Node.js 22.5 ou plus récent
- npm 10 ou plus récent

## Installation

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:5173`.

L'API écoute sur `http://localhost:4000`. La base SQLite et les données de démonstration sont créées automatiquement au premier lancement.

## Comptes de démonstration

- Admin : `admin@djangue.dev` / `DjangueAdmin2026!`
- Étudiant : `student@djangue.dev` / `DjangueStudent2026!`

## Scripts

```bash
npm run dev        # client et API
npm run dev:web    # client uniquement
npm run dev:api    # API uniquement
npm run build      # build de production du client
npm start          # API et client compilé
npm run db:reset   # réinitialise la base de démonstration
```

## Production

1. Copier `.env.example` vers `.env`.
2. Remplacer `JWT_SECRET` par une valeur aléatoire longue.
3. Exécuter `npm run build`.
4. Modifier les identifiants de démonstration.
5. Lancer `npm start` derrière un reverse proxy HTTPS.
