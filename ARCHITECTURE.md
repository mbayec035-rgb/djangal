# Architecture de Djangue

## Stack

- Web : React, Vite, React Router, Tailwind CSS, Framer Motion, Monaco Editor.
- State : Context API pour l'authentification, les notifications et le thème.
- Persistance : `localStorage` pour une application autonome et un déploiement statique.
- Build : un seul workspace web, sans API ni base de données externe.

## Arborescence

```text
djangue/
|-- apps/
|   `-- web/
|       |-- index.html
|       `-- src/
|           |-- components/
|           |   |-- auth/
|           |   |-- course/
|           |   |-- effects/
|           |   |-- layout/
|           |   |-- ui/
|           |-- contexts/
|           |-- data/courses.js
|           |-- lib/api.js
|           |-- pages/
|           `-- index.css
|-- package.json
`-- ARCHITECTURE.md
```

## Persistance locale

`src/lib/api.js` expose une interface proche de l'API originale pour permettre aux pages de rester indépendantes du mode de stockage :

- `djangue.state.v1` : comptes, modules, progression et tentatives.
- `djangue.session.v1` : utilisateur connecté réel.
- Session invitée virtuelle : les visiteurs peuvent parcourir les cours et faire des quiz sans compte ; leur progression est fusionnée lors de la connexion.
- `djangue.theme.v1` : thème sombre ou clair.

Pour une version multi-utilisateur, `src/lib/api.js` peut être remplacé par un client Firebase ou une API HTTP sans modifier les pages.

## Composants clés

- `AuthProvider` : session, inscription, connexion, déconnexion et rafraîchissement.
- `ThemeProvider` : bascule clair/sombre persistante.
- `AuthField` / `PasswordField` : champs accessibles avec erreurs ciblées.
- `ProtectedRoute` / `RoleRoute` : contrôle d'accès côté client.
- `CourseCard`, `ChapterNav`, `CodeLab` : catalogue, navigation et laboratoire.
- `ProgressBar`, `StatusBadge`, `ToastProvider` : feedback et progression.

## Parcours authentification

1. L'utilisateur ouvre `/connexion` ou `/inscription`.
2. `api.js` lit et écrit le compte dans le stockage local du navigateur.
3. Le mot de passe est haché avec l'API Web Crypto avant stockage.
4. `AuthProvider` recharge la session avec `api.get('/auth/me')`.
5. Les routes protégées utilisent `ProtectedRoute` et `RoleRoute`.
6. La déconnexion supprime la session locale.

Ce mode est pratique pour un portfolio, une démonstration ou un déploiement statique. Pour une plateforme publique multi-utilisateur, il faudra remplacer le stockage local par Firebase, Supabase ou une API sécurisée.

## Laboratoire de code

- Monaco Editor est chargé localement, sans CDN externe.
- HTML et CSS sont rendus dans une iframe sandboxée.
- JavaScript est exécuté dans un Web Worker avec `console.log`, timeout de trois secondes et messages d'erreur.
- Les langages non exécutables dans un navigateur restent disponibles en mode édition.

## Routes principales

- `/` : accueil.
- `/catalogue` : catalogue et filtres.
- `/connexion`, `/inscription` : authentification.
- `/tableau-de-bord` : progression globale et activité.
- `/cours/:slug` : contenu, navigation et laboratoire.
- `/quiz/:quizId` : évaluation et résultats, accessible sans compte.
- `/profil` : informations, avatar et mot de passe.
- `/admin` : gestion des modules, réservé aux administrateurs.

## Déploiement

Le build est entièrement statique et produit `apps/web/dist`. Il peut être déployé sur Vercel, Netlify, GitHub Pages ou n'importe quel hébergement de fichiers.
