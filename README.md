# Djangue

Plateforme e-learning orientée développement web, systèmes et outils professionnels.

Djangue est une application web autonome : la progression, les quiz et les données de cours sont conservés dans le navigateur avec `localStorage`. Aucun serveur API, aucune base de données et **aucun compte utilisateur** ne sont nécessaires pour un déploiement statique.

## Prérequis

- Node.js 20.19 ou plus récent
- npm 10 ou plus récent

## Installation

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:5173`.

## Pas de compte à créer

L'application s'ouvre immédiatement, sans inscription ni connexion. Un profil local est créé automatiquement à la première visite, puis réutilisé pour tout le reste : catalogue, cours, laboratoire, quiz, tableau de bord et espace d'administration sont immédiatement accessibles.

Le profil se règle depuis `/profil` (nom affiché, bio, avatar). Il n'y a ni mot de passe ni adresse e-mail.

> Les données appartiennent au navigateur. Changer de navigateur, de machine ou vider le stockage du site réinitialise la progression.

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

- Accès immédiat, sans inscription, connexion ni mot de passe.
- Dix modules : HTML, CSS, JavaScript, Java, PHP, Python, Merise, UML, Git et GitHub.
- Chapitres, progression, quiz QCM et vrai/faux, historique et badges.
- Profil local : nom, bio et avatar.
- Éditeur Monaco avec prévisualisation HTML/CSS et exécution JavaScript isolée dans un Web Worker.
- Thème sombre et thème clair persistants.
- Espace administrateur pour gérer les modules, les chapitres et leur visibilité.

Les données sont réinitialisées en supprimant la clé `djangue.state.v1` du stockage local du navigateur.

## Mise en ligne pour plusieurs utilisateurs

`localStorage` convient à une démonstration, un portfolio ou un déploiement statique, mais les données restent privées par navigateur : rien n'est partagé entre deux machines et l'espace d'administration est ouvert, puisqu'il n'y a plus de rôle à vérifier.

Pour un vrai service public multi-utilisateur, remplacer `src/lib/api.js` par Firebase, Supabase ou une API backend, et réintroduire une authentification côté serveur. L'interface des pages n'a pas besoin de changer.
