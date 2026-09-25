# Architecture de Djangue

## Stack

- Web : React, Vite, React Router, Tailwind CSS, Framer Motion, Monaco Editor.
- State : Context API pour le profil local, les notifications et le thème.
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

## Pas d'authentification

L'application ne possède ni inscription, ni connexion, ni mot de passe. Toutes les routes sont publiques : `/tableau-de-bord`, `/profil` et `/admin` sont rendues dans `PublicLayout` et ne passent par aucun garde d'accès.

Un unique profil local est créé à la première requête qui le demande, puis persisté. Il porte un nom, une bio et un avatar, tous trois modifiables depuis `/profil`.

Conséquence assumée : l'espace d'administration est ouvert, puisqu'il n'y a plus de rôle à vérifier. C'est acceptable tant que les données restent dans le navigateur de la personne.

## Persistance locale

`src/lib/api.js` expose une interface proche d'une API REST pour permettre aux pages de rester indépendantes du mode de stockage :

- `djangue.state.v1` : profil, modules, progression et tentatives.
- `djangue.theme.v1` : thème sombre ou clair.

L'état a une forme unique :

```js
{
  profile: { id: 'local-profile', name, bio, avatar, createdAt },
  courses: [ /* modules */ ],
  progress: { 'local-profile': { 'chapter-html-1': true } },
  attempts: [ /* tentatives de quiz */ ],
}
```

`migrateState()` convertit l'ancien format basé sur les comptes (`users` + `djangue.session.v1` + une session invitée `guest-local`) vers ce format : l'utilisateur connecté ou l'étudiant de démonstration devient le profil local, et sa progression ainsi que ses tentatives sont conservées. La migration est jouée une seule fois, au premier chargement.

Pour une version multi-utilisateur, `src/lib/api.js` peut être remplacé par un client Firebase ou une API HTTP sans modifier les pages.

## Composants clés

- `AuthProvider` : charge et met à jour le profil local. Le nom historique est conservé pour ne pas casser les imports existants.
- `ThemeProvider` : bascule clair/sombre persistante.
- `CourseCard`, `ChapterNav`, `CodeLab` : catalogue, navigation et laboratoire.
- `ProgressBar`, `StatusBadge`, `ToastProvider` : feedback et progression.

## Points d'attention

- `readCourseInput()` liste explicitement les champs modifiables d'un module. Le PATCH d'administration reçoit souvent un objet de résumé (`progress`, `totalChapters`, `chapterCount`…) : sans cette liste blanche, ces clés de lecture fuite dans le stockage.
- `GET /admin/courses/:id` sert le détail d'un module, y compris non publié. `GET /courses/:slug` filtre les brouillons, donc l'administration ne peut pas passer par là pour les éditer.
- `ensureState()` remet `initialization` à `undefined` en cas d'échec : une promesse rejetée ne doit pas empoisonner toutes les requêtes suivantes.

## Laboratoire de code

- Monaco Editor est chargé localement, sans CDN externe.
- HTML et CSS sont rendus dans une iframe sandboxée.
- JavaScript est exécuté dans un Web Worker avec `console.log`, timeout de trois secondes et messages d'erreur.
- Les langages non exécutables dans un navigateur restent disponibles en mode édition.

## Routes principales

- `/` : accueil.
- `/catalogue` : catalogue et filtres.
- `/cours/:slug` : contenu, navigation et laboratoire.
- `/quiz/:quizId` : évaluation et résultats.
- `/tableau-de-bord` : progression globale et activité.
- `/profil` : nom, bio, avatar et historique des quiz.
- `/admin` : gestion des modules et des chapitres.

## Déploiement

Le build est entièrement statique et produit `apps/web/dist`. Il peut être déployé sur Vercel, Netlify, GitHub Pages ou n'importe quel hébergement de fichiers.
