# Architecture de Djangue

## Stack

- Web : React, Vite, React Router, Tailwind CSS, Framer Motion, Monaco Editor.
- API : Node.js, Express, JWT en cookie `httpOnly`, validation et limitations de débit.
- Base de données : SQLite via le module natif `node:sqlite` de Node.js 22+.
- State : Context API pour l'authentification et les notifications.
- Build : npm workspaces, Vite pour le client et scripts Node pour l'API.

## Arborescence

```text
djangue/
|-- apps/
|   |-- api/
|   |   |-- src/
|   |   |   |-- server.js
|   |   |   |-- db.js
|   |   |   |-- seed.js
|   |   |   |-- auth.js
|   |   |   `-- routes/
|   |   |       |-- auth.routes.js
|   |   |       |-- users.routes.js
|   |   |       |-- courses.routes.js
|   |   |       |-- quizzes.routes.js
|   |   |       |-- dashboard.routes.js
|   |   |       `-- admin.routes.js
|   |   `-- data/
|   `-- web/
|       `-- src/
|           |-- components/
|           |   |-- layout/
|           |   |-- effects/
|           |   |-- ui/
|           |   |-- course/
|           |   `-- quiz/
|           |-- contexts/
|           |-- lib/
|           |-- pages/
|           `-- index.css
|-- package.json
`-- ARCHITECTURE.md
```

## Parcours authentification

1. L'utilisateur ouvre `/connexion` ou `/inscription`.
2. Le client appelle l'API avec `credentials: include`.
3. L'API vérifie les données, hache le mot de passe avec bcrypt et signe un JWT.
4. Le JWT est stocké uniquement dans un cookie `httpOnly`, `sameSite=lax`.
5. `AuthProvider` recharge la session avec `GET /api/auth/me`.
6. Les routes protégées utilisent `ProtectedRoute` et `RoleRoute`.
7. La déconnexion efface le cookie côté serveur.

## Modèle de données

- `users` : identité, rôle, profil et mot de passe haché.
- `courses` : modules HTML à GitHub.
- `chapters` : leçons ordonnées et contenu de cours.
- `quizzes` : évaluations de chapitre ou de module.
- `questions` : QCM et vrai/faux avec explications.
- `lesson_progress` : avancement par utilisateur et chapitre.
- `quiz_attempts` : historique, score, réponses et réussite.

## Routes principales

- `/` : accueil.
- `/catalogue` : catalogue et filtres.
- `/connexion`, `/inscription` : authentification.
- `/tableau-de-bord` : progression globale et activité.
- `/cours/:slug` : contenu, navigation et laboratoire.
- `/quiz/:quizId` : évaluation chronométrée non obligatoire.
- `/profil` : informations, avatar et mot de passe.
- `/admin` : gestion des modules, réservé aux administrateurs.

## Sécurité prévue

- Mots de passe hachés avec bcrypt.
- JWT secret configurable par variable d'environnement.
- Validation stricte des entrées et limites de taille.
- Rate limiting sur l'authentification.
- Énoncés de quiz sans réponses correctes avant soumission.
- Correction et calcul du score exclusivement côté serveur.
- En-têtes HTTP de sécurité via Helmet.

## Comptes initiaux

- Administrateur : `admin@djangue.dev` / `DjangueAdmin2026!`
- Étudiant : `student@djangue.dev` / `DjangueStudent2026!`

Ces comptes sont uniquement destinés au développement et doivent être remplacés avant tout déploiement public.
