# Djangue

Plateforme e-learning orientée développement web, systèmes et outils professionnels.

Djangue est une application web autonome : les comptes, la progression, les quiz et les données de cours sont conservés dans le navigateur avec `localStorage`. Aucun serveur API ni base de données externe n'est nécessaire pour un déploiement statique.

## Prérequis

- Node.js 20.19 ou plus récent
- npm 10 ou plus récent

## Installation

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:5173`.

## Comptes de démonstration

- Étudiant : `student@djangue.dev` / `DjangueStudent2026!`
- Administrateur : `admin@djangue.dev` / `DjangueAdmin2026!`

Ces comptes sont stockés uniquement dans le navigateur de l'utilisateur.

## Scripts

```bash
npm run dev       # serveur Vite local
npm run build     # build statique dans apps/web/dist
npm run preview   # prévisualisation du build
```

## Déploiement

Le projet produit un site statique unique dans `apps/web/dist`.

- Vercel : `vercel.json` est prêt, build `npm run build`, output `apps/web/dist`
- Netlify : `netlify.toml` est prêt, build `npm run build`, publish `apps/web/dist`
- GitHub Pages : publier le contenu de `apps/web/dist`
- Tout hébergement statique peut utiliser le dossier `apps/web/dist`

Le fichier `apps/web/public/_redirects` assure le routage côté client sur Netlify.

Pour modifier le chemin de déploiement, adapter `base` dans `apps/web/vite.config.js`.

## Fonctionnalités

- Inscription, connexion, déconnexion et profil local.
- Accès libre aux cours, au laboratoire et aux quiz pour les visiteurs. La progression invitée est conservée localement puis fusionnée si la personne se connecte.
- Rôles étudiant et administrateur.
- Dix modules : HTML, CSS, JavaScript, Java, PHP, Python, Merise, UML, Git et GitHub.
- Chapitres, progression, quiz QCM et vrai/faux, historique et badges.
- Éditeur Monaco avec prévisualisation HTML/CSS et exécution JavaScript isolée dans un Web Worker.
- Thème sombre et thème clair persistants.
- Espace administrateur pour gérer les modules et les chapitres.

Les données de démonstration sont réinitialisées en supprimant les clés `djangue.*` du stockage local du navigateur.

Attention : `localStorage` convient à une démo, un portfolio ou un déploiement statique, mais ne constitue pas une authentification multi-utilisateur sécurisée. Pour un vrai service public, remplacer `src/lib/api.js` par Firebase, Supabase ou une API backend.
