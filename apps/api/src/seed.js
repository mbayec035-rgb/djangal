import bcrypt from 'bcryptjs';
import { db } from './db.js';

const now = new Date().toISOString();

const modules = [
  {
    id: 'course-html',
    slug: 'html',
    technology: 'HTML',
    title: 'HTML',
    shortDescription: 'Construisez des pages web structurées, accessibles et sémantiques.',
    description: 'Apprenez à modéliser le contenu avec les éléments HTML modernes, à formater vos interfaces et à poser les bases d’une page accessible.',
    level: 'Débutant',
    duration: 180,
    icon: 'code-2',
    accent: '#00ff9d',
    chapters: [
      {
        id: 'chapter-html-1',
        slug: 'structure-semantique',
        title: 'Structure et sémantique',
        summary: 'Comprendre le document, les landmarks et la hiérarchie du contenu.',
        duration: 45,
        language: 'html',
        code: '<main>\n  <article>\n    <h1>Journal de bord</h1>\n    <p>Premier article publié.</p>\n  </article>\n</main>',
        content: `## Un document qui raconte sa structure\n\nHTML décrit le **sens** du contenu, pas son apparence. Une page utile commence par une hiérarchie claire : un seul titre principal, des sections ordonnées et des zones identifiables.\n\nLes éléments sémantiques comme \`header\`, \`nav\`, \`main\`, \`article\` et \`footer\` remplacent les conteneurs génériques lorsque leur rôle est connu.\n\n### Règles essentielles\n\n- Utiliser un seul \`h1\` par page.\n- Ne pas choisir un niveau de titre pour sa taille, mais pour sa hiérarchie.\n- Associer chaque contrôle à une étiquette.\n- Ne pas utiliser \`div\` comme solution par défaut.`,
        questions: [
          { prompt: 'Quel élément contient le contenu principal et unique d’une page ?', options: ['<main>', '<section>', '<article>', '<body>'], correct: 0, explanation: '<main> représente le contenu principal du document.' },
          { prompt: 'Une page peut contenir plusieurs éléments h1.', options: ['Vrai', 'Faux'], correct: 1, explanation: 'Un seul h1 identifie le sujet principal ; la hiérarchie se poursuit avec h2, h3, etc.' },
        ],
      },
      {
        id: 'chapter-html-2',
        slug: 'formulaires-accessibles',
        title: 'Formulaires accessibles',
        summary: 'Créer des formulaires robustes avec labels, validation et retours utiles.',
        duration: 55,
        language: 'html',
        code: '<form action="/inscription" method="post">\n  <label for="email">Adresse e-mail</label>\n  <input id="email" name="email" type="email" required>\n  <button type="submit">Créer le compte</button>\n</form>',
        content: `## Un formulaire doit guider la personne\n\nChaque champ possède une étiquette explicite. L'attribut \`for\` relie l'étiquette au contrôle et garantit un nom accessible, y compris lorsque le design masque le label.\n\nLa validation HTML apporte une première barrière, mais le serveur doit également vérifier chaque valeur. Les messages d'erreur doivent être associés au champ concerné et compréhensibles sans jargon.\n\n### Bonnes pratiques\n\n- Regrouper les champs avec \`fieldset\` et \`legend\`.\n- Donner un \`type\` précis à chaque saisie.\n- Indiquer clairement si un champ est obligatoire.\n- Conserver les valeurs valides après une erreur.`,
        questions: [
          { prompt: 'Quel attribut relie une étiquette à un champ ?', options: ['name', 'for', 'id', 'href'], correct: 1, explanation: "L'attribut for de label doit contenir l'id du contrôle." },
          { prompt: "La validation côté serveur est optionnelle si l'attribut required est présent.", options: ['Vrai', 'Faux'], correct: 1, explanation: 'Les deux niveaux de validation sont nécessaires.' },
        ],
      },
      {
        id: 'chapter-html-3',
        slug: 'medias-tableaux',
        title: 'Médias et tableaux',
        summary: 'Intégrer des images responsives, de l’audio et des données tabulaires.',
        duration: 50,
        language: 'html',
        code: '<figure>\n  <img src="schema.webp" alt="Schéma d’une architecture web">\n  <figcaption>Architecture d’une application</figcaption>\n</figure>',
        content: `## Décrire le sens, pas seulement l'image\n\nL'attribut \`alt\` doit transmettre la même information que l'image. Il est vide pour une image purement décorative.\n\nLes tableaux servent à représenter une relation entre des données. Utilisez \`caption\`, \`thead\` et \`th scope\` pour donner du contexte aux lecteurs d'écran.\n\nLes balises \`picture\` et \`source\` permettent de fournir plusieurs formats. Toujours renseigner les dimensions d'un média pour limiter les décalages de mise en page.`,
        questions: [
          { prompt: 'Que doit contenir une image purement décorative ?', options: ["Un long texte alternatif", "Un attribut alt vide", "Une légende obligatoire", "Aucun élément"], correct: 1, explanation: 'alt vide indique que l’image ne transmet pas d’information.' },
          { prompt: 'Quel élément identifie l’intitulé d’un tableau de données ?', options: ['<th>', '<caption>', '<thead>', '<summary>'], correct: 1, explanation: 'caption fournit une description du tableau.' },
        ],
      },
    ],
    final: [
      { prompt: 'Quel ensemble représente le contenu principal unique d’une page ?', options: ['<main>', '<nav>', '<aside>', '<footer>'], correct: 0, explanation: 'main identifie le contenu principal.' },
      { prompt: 'Une hiérarchie correcte peut passer de h1 à h3 sans h2 si le style l’exige.', options: ['Vrai', 'Faux'], correct: 1, explanation: 'La hiérarchie doit refléter la structure, pas le style.' },
      { prompt: 'Quel attribut relie un label à son contrôle ?', options: ['rel', 'for', 'bind', 'target'], correct: 1, explanation: "for contient l’id du contrôle." },
    ],
  },
  {
    id: 'course-css',
    slug: 'css',
    technology: 'CSS',
    title: 'CSS',
    shortDescription: 'Maîtrisez la cascade, le layout moderne et les adaptations responsives.',
    description: 'Construisez des interfaces sobres et robustes avec la cascade, Flexbox, Grid, variables et médias queries.',
    level: 'Débutant',
    duration: 210,
    icon: 'palette',
    accent: '#00d9ff',
    chapters: [
      {
        id: 'chapter-css-1',
        slug: 'cascade-box-model',
        title: 'Cascade et box model',
        summary: 'Calculer la valeur d’une propriété et comprendre la taille des boîtes.',
        duration: 55,
        language: 'css',
        code: '.panel {\n  box-sizing: border-box;\n  padding: 1.5rem;\n  border: 1px solid #26333d;\n  color: #e6e6e6;\n}',
        content: `## La cascade comme système de décision\n\nLa valeur finale d'une propriété dépend de son importance, de la spécificité des sélecteurs et de l'ordre du code. Les variables CSS centralisent les décisions de design et facilitent les thèmes.\n\n### Box model\n\nLa propriété \`box-sizing: border-box\` inclut le padding et la bordure dans la largeur déclarée. Cette règle réduit les surprises de mise en page.\n\nUtilisez des unités relatives lorsque le contenu doit s'adapter à la taille du texte ou du conteneur.`,
        questions: [
          { prompt: 'Quels facteurs déterminent la valeur finale selon la cascade ?', options: ['Import, spécificité, ordre', 'Couleur, taille, police', 'Padding, marge, bordure', 'HTML, URL, JavaScript'], correct: 0, explanation: "L'importance, la spécificité et l'ordre déterminent la cascade." },
          { prompt: 'box-sizing: border-box inclut la bordure dans la largeur déclarée.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'La largeur inclut contenu, padding et bordure.' },
        ],
      },
      {
        id: 'chapter-css-2',
        slug: 'flexbox-grid',
        title: 'Flexbox et Grid',
        summary: 'Composer des interfaces multidimensionnelles avec des règles explicites.',
        duration: 65,
        language: 'css',
        code: '.layout {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) 18rem;\n  gap: 1.5rem;\n}',
        content: `## Choisir le bon modèle\n\nFlexbox organise principalement une dimension : une rangée ou une colonne. Grid coordonne des lignes et des colonnes, ce qui convient aux mises en page complexes.\n\nPréférez \`minmax(0, 1fr)\` pour éviter qu'un contenu long ne force le conteneur à déborder.\n\n### Adaptation progressive\n\nUne grille peut passer de plusieurs colonnes à une seule avec une media query. Les liens d’évitement et les contenus essentiels restent utilisables sans styles complexes.`,
        questions: [
          { prompt: 'Quel modèle est prioritaire pour une grille de tableaux de bord ?', options: ['Grid', 'Inline', 'Float', 'Position absolute'], correct: 0, explanation: 'Grid est conçu pour les layouts bidimensionnels.' },
          { prompt: 'Flexbox est principalement limité à une dimension principale.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Sa dimension principale est une ligne ou une colonne.' },
        ],
      },
      {
        id: 'chapter-css-3',
        slug: 'responsive-dark',
        title: 'Responsive et thème sombre',
        summary: 'Adapter les composants avec contraste, rythme et breakpoints cohérents.',
        duration: 55,
        language: 'css',
        code: ':root {\n  color-scheme: dark;\n  --bg: #0a0e14;\n  --surface: #10161f;\n  --accent: #00ff9d;\n}\n\n@media (max-width: 720px) {\n  .sidebar { display: none; }\n}',
        content: `## Un contraste durable\n\nLe thème sombre demande un contrôle précis des niveaux de gris. Les surfaces doivent rester distinguables, et le texte principal doit conserver un contraste élevé.\n\nUtilisez des variables sémantiques plutôt que des couleurs en dur. Une media query modifie la composition, pas la hiérarchie de l'information.\n\nLes animations doivent respecter \`prefers-reduced-motion\` pour rester confortables.`,
        questions: [
          { prompt: 'Quel couple définit le contraste principal ?', options: ['La taille et la police', 'Le premier plan et l’arrière-plan', 'La marge et le padding', 'Le script et le style'], correct: 1, explanation: 'Le contraste dépend principalement des deux couleurs.' },
          { prompt: 'Une media query peut réorganiser les colonnes sur petit écran.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Elle permet une composition adaptée au viewport.' },
        ],
      },
    ],
    final: [
      { prompt: 'Quel sélecteur a la spécificité la plus élevée ?', options: ['p', '.card', '#app p', 'main p'], correct: 2, explanation: 'Un identifiant pèse davantage qu’une classe ou un type.' },
      { prompt: 'Grid est adapté à un layout de deux dimensions.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Grid coordonne lignes et colonnes.' },
      { prompt: 'Quelle unité s’adapte mieux à la taille du texte ?', options: ['em', 'cm', 'vh', 'fr'], correct: 0, explanation: 'em dépend de la taille de police du contexte.' },
    ],
  },
  {
    id: 'course-js',
    slug: 'javascript',
    technology: 'JavaScript',
    title: 'JavaScript',
    shortDescription: 'Manipulez les données, le DOM et les flux asynchrones avec confiance.',
    description: 'Apprenez les fondamentaux modernes de JavaScript, la manipulation du DOM et les promesses avec des exemples exécutables.',
    level: 'Intermédiaire',
    duration: 260,
    icon: 'braces',
    accent: '#00ff9d',
    chapters: [
      {
        id: 'chapter-js-1',
        slug: 'values-functions',
        title: 'Valeurs et fonctions',
        summary: 'Structurer des données et composer des comportements réutilisables.',
        duration: 60,
        language: 'javascript',
        code: 'const learners = [\n  { name: "Ada", score: 92 },\n  { name: "Linus", score: 81 },\n];\n\nconst best = learners.sort((a, b) => b.score - a.score)[0];\nconsole.log(best.name);',
        content: `## Des données prévisibles\n\nJavaScript distingue les types primitifs et les objets. Les tableaux fournissent \`map\`, \`filter\` et \`reduce\` pour transformer des collections sans boucle impérative.\n\nLes fonctions sont des valeurs. Elles peuvent être stockées, passées à d'autres fonctions et utilisées comme callbacks.\n\n### Bonnes pratiques\n\n- Privilégier \`const\`, puis \`let\` si une réaffectation est nécessaire.\n- Retourner tôt pour réduire les conditions imbriquées.\n- Nommer les fonctions selon leur résultat.`,
        questions: [
          { prompt: 'Quelle méthode transforme chaque élément d’un tableau ?', options: ['map', 'find', 'push', 'join'], correct: 0, explanation: 'map retourne un nouveau tableau transformé.' },
          { prompt: 'Une fonction peut être stockée dans une variable.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'En JavaScript, une fonction est une valeur.' },
        ],
      },
      {
        id: 'chapter-js-2',
        slug: 'dom-events',
        title: 'DOM et événements',
        summary: 'Relier les données à une interface réelle et gérer les interactions.',
        duration: 65,
        language: 'javascript',
        code: 'const form = document.querySelector("#signup");\n\nform.addEventListener("submit", (event) => {\n  event.preventDefault();\n  const email = new FormData(form).get("email");\n  console.log(email);\n});',
        content: `## Le DOM est une API\n\n\`querySelector\` renvoie un élément, tandis que \`querySelectorAll\` renvoie une collection. Les événements décrivent une interaction et peuvent être délégués à un parent.\n\nAvant de modifier une page, considérez l’état qui doit être la source de vérité. Une petite fonction de rendu évite de disperser les mutations dans plusieurs écouteurs.\n\nPour l'accessibilité, utilisez les éléments natifs \`button\` et \`form\` avant de simuler leurs comportements.`,
        questions: [
          { prompt: 'Quel événement convient pour la soumission d’un formulaire ?', options: ['click', 'submit', 'focus', 'scroll'], correct: 1, explanation: "submit couvre clavier, souris et validation native." },
          { prompt: 'querySelectorAll renvoie un seul élément.', options: ['Vrai', 'Faux'], correct: 1, explanation: 'querySelectorAll renvoie une collection.' },
        ],
      },
      {
        id: 'chapter-js-3',
        slug: 'async-errors',
        title: 'Asynchrone et erreurs',
        summary: 'Orchestrer des opérations réseau avec async/await et une gestion fiable.',
        duration: 70,
        language: 'javascript',
        code: 'async function loadProfile(id) {\n  try {\n    const response = await fetch(`/api/users/${id}`);\n    if (!response.ok) throw new Error("Profil introuvable");\n    return await response.json();\n  } catch (error) {\n    console.error(error);\n    return null;\n  }\n}',
        content: `## L'attente explicite\n\nUne fonction \`async\` retourne une promesse. \`await\` suspend son exécution jusqu'à la résolution de cette promesse.\n\nToujours vérifier \`response.ok\` : une réponse HTTP d'erreur peut malgré tout contenir du JSON.\n\n### Robustesse\n\n- Limiter les nouvelles tentatives aux erreurs temporaires.\n- Annuler les demandes obsolètes.\n- Donner à l'utilisateur un retour exploitable.`,
        questions: [
          { prompt: 'Que retourne une fonction async ?', options: ['Une valeur brute', 'Une promesse', 'Un événement', 'Un élément DOM'], correct: 1, explanation: 'Une fonction async retourne toujours une promesse.' },
          { prompt: 'Après fetch, il faut vérifier response.ok avant de considérer la réponse comme valide.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'ok indique le statut HTTP de succès.' },
        ],
      },
    ],
    final: [
      { prompt: 'Quelle méthode crée un nouveau tableau à partir d’une transformation ?', options: ['forEach', 'map', 'filter', 'sort'], correct: 1, explanation: 'map transforme et retourne un tableau.' },
      { prompt: 'Un événement submit est déclenché par la soumission d’un formulaire.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'submit est l’événement natif associé au formulaire.' },
      { prompt: 'Que produit une fonction async ?', options: ['Une promesse', 'Un callback obligatoire', 'Un objet JSON', 'Un style CSS'], correct: 0, explanation: 'Elle retourne une promesse.' },
    ],
  },
  {
    id: 'course-java',
    slug: 'java',
    technology: 'Java',
    title: 'Java',
    shortDescription: 'Bases solides : objets, collections, exceptions et organisation du code.',
    description: 'Découvrez la syntaxe Java, la programmation objet, les collections et les principes d’architecture applicative.',
    level: 'Intermédiaire',
    duration: 300,
    icon: 'coffee',
    accent: '#00d9ff',
    chapters: [
      {
        id: 'chapter-java-1',
        slug: 'objects-classes',
        title: 'Objets et classes',
        summary: 'Modéliser des domaines métier avec des classes cohérentes.',
        duration: 60,
        language: 'java',
        code: 'public record Learner(String name, int score) {\n    public boolean hasPassed() {\n        return score >= 70;\n    }\n}',
        content: `## Modéliser avant d’implémenter\n\nUne classe décrit des données et des comportements cohérents. Les attributs privés et les méthodes publiques réduisent la surface d’utilisation.\n\nUn \`record\` Java convient aux données immuables de transfert. Pour un objet avec un cycle de vie ou des règles plus complexes, une classe classique reste plus explicite.\n\nNommez les méthodes par leur intention : \`hasPassed\` est plus clair que \`check\`.`,
        questions: [
          { prompt: 'Quel mot-clé déclare une classe Java ?', options: ['class', 'object', 'record class', 'structure'], correct: 0, explanation: 'class introduit une classe en Java.' },
          { prompt: 'Un record Java est adapté aux données immuables.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Un record expose des composants immuables.' },
        ],
      },
      {
        id: 'chapter-java-2',
        slug: 'collections-streams',
        title: 'Collections et streams',
        summary: 'Choisir une structure de données et écrire des traitements lisibles.',
        duration: 70,
        language: 'java',
        code: 'List<String> activeNames = learners.stream()\n    .filter(Learner::isActive)\n    .map(Learner::name)\n    .toList();',
        content: `## Choisir la structure\n\nUne \`List\` conserve l’ordre, un \`Set\` garantit l’unicité et une \`Map\` associe des clés à des valeurs. La structure doit refléter les opérations attendues.\n\nLes streams rendent les transformations déclaratives lisibles. Évitez les effets de bord à l'intérieur d'un pipeline : la logique doit rester pure.\n\nLes méthodes statiques \`import\` et les records réduisent le bruit syntaxique dans les projets modernes.`,
        questions: [
          { prompt: 'Quelle collection garantit l’unicité ?', options: ['List', 'Set', 'Queue', 'Iterable'], correct: 1, explanation: 'Un Set refuse les doublons.' },
          { prompt: 'Un stream est terminé par une opération finale.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'toList, count ou forEach terminent le pipeline.' },
        ],
      },
      {
        id: 'chapter-java-3',
        slug: 'exceptions-architecture',
        title: 'Exceptions et architecture',
        summary: 'Propager les erreurs sans perdre le contexte métier.',
        duration: 75,
        language: 'java',
        code: 'try {\n    repository.save(learner);\n} catch (DataAccessException error) {\n    throw new EnrollmentException("Impossible d’inscrire", error);\n}',
        content: `## Une erreur fait partie du système\n\nLes exceptions doivent transporter une information utile. Conservez la cause originale avec un constructeur, mais exposez un message compréhensible à l’utilisateur.\n\nNe capturez pas \`Exception\` sans raison. Une capture précise permet de traiter les erreurs attendues et de laisser les autres remonter.\n\nUne architecture en couches sépare le domaine, l’application et les adaptateurs. Cette séparation rend les règles métier testables indépendamment du HTTP ou de la base.`,
        questions: [
          { prompt: 'Que faut-il conserver lors qu’une exception métier remplace une erreur technique ?', options: ['Le code HTTP', 'La cause originale', 'Le nom de la table', 'La couleur du message'], correct: 1, explanation: 'La cause conserve le contexte de diagnostic.' },
          { prompt: 'Capturer Exception puis l’ignorer est une stratégie robuste.', options: ['Vrai', 'Faux'], correct: 1, explanation: 'Ignorer une erreur masque une panne.' },
        ],
      },
    ],
    final: [
      { prompt: 'Quelle collection est la plus adaptée pour des clés uniques ?', options: ['List', 'Set', 'Map', 'Stream'], correct: 2, explanation: 'Une Map associe des clés uniques à des valeurs.' },
      { prompt: 'Un record Java est une forme de données immuable.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Ses composants sont finaux et ses accesseurs sont implicites.' },
      { prompt: 'Une couche métier doit dépendre directement du HTTP.', options: ['Vrai', 'Faux'], correct: 1, explanation: 'Le domaine doit rester indépendant des adaptateurs.' },
    ],
  },
  {
    id: 'course-php',
    slug: 'php',
    technology: 'PHP',
    title: 'PHP',
    shortDescription: 'Développez des applications web dynamiques avec sécurité et architecture.',
    description: 'Partez des bases de PHP jusqu’aux formulaires, sessions, PDO et organisation MVC.',
    level: 'Intermédiaire',
    duration: 240,
    icon: 'file-code-2',
    accent: '#00ff9d',
    chapters: [
      {
        id: 'chapter-php-1',
        slug: 'syntaxe-base',
        title: 'Syntaxe et données',
        summary: 'Comprendre variables, tableaux, fonctions et modules.',
        duration: 55,
        language: 'php',
        code: '<?php\n\nfunction slugify(string $value): string {\n    return strtolower(trim(preg_replace("/[^a-z0-9]+/i", "-", $value), "-"));\n}\n\necho slugify("Djangue Learning Platform");',
        content: `## Un langage dynamique, des règles explicites\n\nEn PHP, chaque variable commence par \`$\`. Les tableaux peuvent être indexés ou associatifs et servent souvent à structurer des données.\n\nLe typage progressif est flexible, mais les types de retour et les paramètres typés rendent les frontières explicites.\n\nSéparez les fichiers de logique, de données et de présentation. Cette discipline facilite les tests et la maintenance.`,
        questions: [
          { prompt: 'Comment commence une variable PHP ?', options: ['var', '$', ':', '@'], correct: 1, explanation: 'Les variables PHP utilisent le signe dollar.' },
          { prompt: 'Un tableau associatif relie des clés à des valeurs.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Les clés sont des chaînes ou des entiers.' },
        ],
      },
      {
        id: 'chapter-php-2',
        slug: 'formulaires-securite',
        title: 'Formulaires et sécurité',
        summary: 'Valider les données et protéger une session.',
        duration: 65,
        language: 'php',
        code: 'if ($_SERVER["REQUEST_METHOD"] === "POST") {\n    $email = filter_input(INPUT_POST, "email", FILTER_VALIDATE_EMAIL);\n    if (!$email) { throw new InvalidArgumentException("E-mail invalide"); }\n}',
        content: `## Toute donnée est externe\n\nUne valeur envoyée par un navigateur peut être modifiée. Filtrez selon le type attendu, utilisez des requêtes préparées PDO et n'affichez jamais une entrée brute sans échappement.\n\nLes cookies de session doivent être \`HttpOnly\`, \`Secure\` en production et \`SameSite\`. Un jeton CSRF protège les actions sensibles lorsque les cookies sont utilisés.\n\nLe rate limiting et la journalisation complètent la protection sans remplacer la validation métier.`,
        questions: [
          { prompt: 'Quel mécanisme évite l’injection SQL ?', options: ['htmlspecialchars', 'PDO avec requête préparée', 'nl2br', 'session_start'], correct: 1, explanation: 'Les paramètres préparés séparent le code SQL des données.' },
          { prompt: 'Une valeur POST est fiable par défaut.', options: ['Vrai', 'Faux'], correct: 1, explanation: 'Toute donnée client doit être validée.' },
        ],
      },
      {
        id: 'chapter-php-3',
        slug: 'mvc-pdo',
        title: 'MVC, sessions et PDO',
        summary: 'Relier contrôleurs, services et persistance sans couplage fort.',
        duration: 65,
        language: 'php',
        code: 'final class UserRepository\n{\n    public function findByEmail(string $email): ?array\n    {\n        $statement = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");\n        $statement->execute([$email]);\n        return $statement->fetch() ?: null;\n    }\n}',
        content: `## Séparer les responsabilités\n\nLe contrôleur orchestre la requête, un service porte la règle métier et le dépôt gère la persistance. Cette structure évite de remplir un contrôleur avec des requêtes SQL.\n\nUne transaction garantit qu'un ensemble d'écritures réussit ou échoue ensemble. Utilisez-la pour les opérations qui doivent être atomiques.\n\nLes sessions permettent de conserver un état minimal entre deux requêtes. Ne stockez jamais de mot de passe ni de secret dans la session.`,
        questions: [
          { prompt: 'Quelle couche porte les requêtes SQL ?', options: ['Le dépôt', 'Le template', 'Le routeur', 'Le navigateur'], correct: 0, explanation: 'Le repository encapsule la persistance.' },
          { prompt: 'Une transaction garantit l’atomicité de plusieurs écritures.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Toutes les opérations réussissent ou sont annulées ensemble.' },
        ],
      },
    ],
    final: [
      { prompt: 'Quelle option protège une session contre l’accès JavaScript ?', options: ['HttpOnly', 'Inline', 'Public', 'Fast'], correct: 0, explanation: 'HttpOnly empêche la lecture du cookie par un script.' },
      { prompt: 'Une requête préparée sépare les données du code SQL.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Elle réduit le risque d’injection SQL.' },
      { prompt: 'Quel composant doit appeler un service métier ?', options: ['Un template', 'Un contrôleur', 'Un favicon', 'Un navigateur'], correct: 1, explanation: 'Le contrôleur orchestre le cas d’usage.' },
    ],
  },
  {
    id: 'course-python',
    slug: 'python',
    technology: 'Python',
    title: 'Python',
    shortDescription: 'Automatisez, analysez et créez des applications lisibles avec Python.',
    description: 'Maîtrisez les structures, fonctions, fichiers, modules, POO et les bases d’API avec Flask.',
    level: 'Débutant',
    duration: 250,
    icon: 'terminal',
    accent: '#00d9ff',
    chapters: [
      {
        id: 'chapter-python-1',
        slug: 'syntaxe-donnees',
        title: 'Syntaxe et données',
        summary: 'Manipuler les types, séquences et structures de contrôle.',
        duration: 55,
        language: 'python',
        code: 'def passing_scores(learners: list[dict]) -> list[str]:\n    return [\n        learner["name"]\n        for learner in learners\n        if learner["score"] >= 70\n    ]',
        content: `## Des intentions lisibles\n\nPython utilise l’indentation pour délimiter les blocs. Les listes et dictionnaires sont des structures essentielles ; les annotations rendent les attentes explicites sans imposer un type.\n\nLes compréhensions de liste sont utiles pour une transformation simple. Pour une logique complexe, une boucle ou une fonction dédiée reste plus lisible.\n\nÉvitez les mutations en place. Retournez de nouvelles structures quand cela clarifie la transformation.`,
        questions: [
          { prompt: 'Comment délimite Python un bloc ?', options: ['Les accolades', 'L’indentation', 'Les parenthèses', 'Les commentaires'], correct: 1, explanation: 'L’indentation structure les blocs Python.' },
          { prompt: 'Une annotation de fonction documente principalement le type attendu.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Les annotations rendent les contrats plus explicites.' },
        ],
      },
      {
        id: 'chapter-python-2',
        slug: 'fonctions-modules-poo',
        title: 'Fonctions, modules et POO',
        summary: 'Découper un programme en unités testables et compréhensibles.',
        duration: 60,
        language: 'python',
        code: 'class QuizResult:\n    def __init__(self, score: int, total: int):\n        self.score = score\n        self.total = total\n\n    @property\n    def percentage(self) -> int:\n        return round(self.score * 100 / self.total) if self.total else 0',
        content: `## Des unités avec une responsabilité\n\nUne fonction courte fait une chose et communique par des paramètres et une valeur de retour. Les modules regroupent des fonctions spécialisées par domaine.\n\nUne classe devient utile lorsque des données et des comportements ont une identité commune. Les \`properties\` permettent d’exposer un résultat calculé avec une API claire.\n\nUne bibliothèque de tests automatisés doit pouvoir instancier ces unités sans démarrer toute l’application.`,
        questions: [
          { prompt: 'Quel principe favorise une fonction testable ?', options: ['Une responsabilité claire', 'Des variables globales', 'Des effets cachés', 'Une taille illimitée'], correct: 0, explanation: 'Une responsabilité unique rend le comportement testable.' },
          { prompt: 'Une property Python peut exposer une valeur calculée.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'property fournit une interface en lecture.' },
        ],
      },
      {
        id: 'chapter-python-3',
        slug: 'fichiers-api',
        title: 'Fichiers et API',
        summary: 'Lire des données, valider des entrées et consommer un service HTTP.',
        duration: 70,
        language: 'python',
        code: 'from pathlib import Path\n\ntext = Path("notes.txt").read_text(encoding="utf-8")\nlines = [line.strip() for line in text.splitlines() if line.strip()]\nprint(len(lines))',
        content: `## Traiter des données avec soin\n\nLe module \`pathlib\` simplifie les chemins et les opérations de fichiers. Toujours préciser l’encodage pour éviter un comportement dépendant du système.\n\nUne API reçoit des données non fiables. Validez le schéma, limitez la taille des champs et anticipez les erreurs avant de les exposer.\n\nLes fonctions réseau doivent avoir un délai d’expiration et une stratégie claire pour les erreurs temporaires.`,
        questions: [
          { prompt: 'Quel module Python facilite la manipulation de chemins ?', options: ['pathlib', 'socket', 'random', 'asyncio'], correct: 0, explanation: 'pathlib fournit une API orientée objet pour les chemins.' },
          { prompt: 'Une réponse d’API doit être considérée comme fiable sans validation.', options: ['Vrai', 'Faux'], correct: 1, explanation: 'Une API distante peut être indisponible ou renvoyer des données inattendues.' },
        ],
      },
    ],
    final: [
      { prompt: 'Quel élément délimite un bloc Python ?', options: ['Les accolades', 'L’indentation', 'Le point-virgule', 'Les guillemets'], correct: 1, explanation: 'L’indentation délimite les blocs.' },
      { prompt: 'Une propriété peut exposer une valeur calculée.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Une property est une interface de lecture calculée.' },
      { prompt: 'Quel principe améliore la testabilité ?', options: ['Des dépendances cachées', 'Des responsabilités séparées', 'Des variables globales', 'Des retours multiples'], correct: 1, explanation: 'Des unités séparées et explicites sont plus faciles à tester.' },
    ],
  },
  {
    id: 'course-merise',
    slug: 'merise',
    technology: 'Merise',
    title: 'Merise',
    shortDescription: 'Modélisez un système avec le MERISE : entités, relations, MCD et MLD.',
    description: 'Passez du besoin métier au modèle de données, normalisez vos relations et préparez une implémentation relationnelle fiable.',
    level: 'Intermédiaire',
    duration: 200,
    icon: 'network',
    accent: '#00ff9d',
    chapters: [
      {
        id: 'chapter-merise-1',
        slug: 'entites-relations',
        title: 'Entités et relations',
        summary: 'Identifier les concepts du domaine et leurs cardinalités.',
        duration: 50,
        language: 'text',
        code: 'ENTITÉ : Inscription\n  idInscription (PK)\n  dateInscription\n\nRELATION : suivre\n  Inscription 0,N —— 0,1 Cours',
        content: `## Le domaine avant la base\n\nUne entité représente un objet que l’équipe veut gérer : un élève, un cours, une inscription. Ses attributs doivent être des faits, pas des calculs.\n\nUne relation relie des entités et possède des cardinalités. Le verbe de la relation doit avoir un sens : un cours **propose** plusieurs leçons.\n\nUne association peut devenir une entité si elle porte ses propres attributs ou si elle existe indépendamment dans le temps.`,
        questions: [
          { prompt: 'Que représente une entité MERISE ?', options: ['Un style CSS', 'Un objet du domaine', 'Une requête SQL', 'Un fichier'], correct: 1, explanation: 'Une entité représente un objet identifiable du domaine.' },
          { prompt: 'Une cardinalité décrit le nombre de participants possibles.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'La cardinalité exprime le minimum et le maximum.' },
        ],
      },
      {
        id: 'chapter-merise-2',
        slug: 'mcd-mld',
        title: 'Du MCD au MLD',
        title: 'Du MCD au MLD',
        summary: 'Transformer les associations et préparer les tables relationnelles.',
        duration: 55,
        language: 'text',
        code: 'COURS (idCours PK, titre, slug)\nCHAPITRE (idChapitre PK, idCours FK, rang)\nLECON (idLecon PK, idChapitre FK, contenu)',
        content: `## Du concept à la relation\n\nLe MCD décrit les concepts. Le MLD transforme chaque entité en table et fait apparaître les clés étrangères issues des relations.\n\nUne association plusieurs-à-plusieurs devient généralement une table de jointure. Une relation un-à-plusieurs place la clé étrangère du côté plusieurs.\n\nConservez des noms de tables et de colonnes explicites. Un modèle doit pouvoir être lu par une personne qui ne l'a pas créé.`,
        questions: [
          { prompt: 'Une association N-N nécessite généralement quoi ?', options: ['Une table de jointure', 'Une colonne booléenne', 'Un fichier CSS', 'Une duplication de données'], correct: 0, explanation: 'La table de jointure relie les deux entités.' },
          { prompt: 'Le MLD introduit les clés étrangères.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Le MLD est orienté bases de données relationnelles.' },
        ],
      },
      {
        id: 'chapter-merise-3',
        slug: 'normalisation',
        title: 'Normalisation et qualité',
        summary: 'Éviter la redondance et préserver la cohérence des données.',
        duration: 50,
        language: 'text',
        code: ' anomalie de mise à jour : le nom d’un cours existe dans chaque leçon\n anomalie d’insertion : impossible de créer un cours sans leçon\n anomalie de suppression : supprimer une leçon efface un cours',
        content: `## La redondance coûte cher\n\nLa normalisation décompose les données pour que chaque fait soit stocké au bon endroit. La première forme normale évite les groupes répétitifs ; les formes suivantes réduisent les dépendances partielles.\n\nUne dénormalisation peut être justifiée par la performance, mais elle doit être documentée et contrôlée.\n\nAvant d’implémenter, vérifiez les contraintes d’unicité, les clés étrangères et les valeurs par défaut.`,
        questions: [
          { prompt: 'Que cherche à réduire la normalisation ?', options: ['La lisibilité du code', 'La redondance et les anomalies', 'Le nombre de tables', 'La sécurité réseau'], correct: 1, explanation: 'Elle réduit les dépendances incorrectes et les anomalies.' },
          { prompt: 'Une contrainte d’unicité protège contre deux valeurs identiques pour une clé.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Elle garantit l’unicité de la valeur de la clé.' },
        ],
      },
    ],
    final: [
      { prompt: 'Quel document décrit les concepts du domaine ?', options: ['MCD', 'MLD', 'MVP', 'CSS'], correct: 0, explanation: 'Le MCD décrit les entités, attributs et relations.' },
      { prompt: 'Une association N-N est souvent matérialisée par une table intermédiaire.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Cette table porte les attributs de la relation.' },
      { prompt: 'La normalisation vise principalement à réduire la redondance.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Elle réduit les anomalies de mise à jour.' },
    ],
  },
  {
    id: 'course-uml',
    slug: 'uml',
    technology: 'UML',
    title: 'UML',
    shortDescription: 'Visualisez les structures et les interactions d’un système avec UML.',
    description: 'Utilisez les diagrammes de classes, de séquence et de cas d’utilisation pour rendre une architecture compréhensible.',
    level: 'Intermédiaire',
    duration: 180,
    icon: 'workflow',
    accent: '#00d9ff',
    chapters: [
      {
        id: 'chapter-uml-1',
        slug: 'diagramme-classes',
        title: 'Diagramme de classes',
        summary: 'Modéliser les types, attributs, opérations et relations.',
        duration: 45,
        language: 'text',
        code: 'class QuizAttempt {\n  +score : int\n  +total : int\n  +passed : bool\n  +calculatePercentage() : int\n}\n\nQuizAttempt --> Question : concerne',
        content: `## Une vue statique du système\n\nUn diagramme de classes décrit la structure et les relations entre types. Il ne représente pas le temps, mais les responsabilités permanentes.\n\nLa visibilité indique ce qui est public, protégé ou privé. Les cardinalités d’une association doivent correspondre au modèle métier.\n\nUtilisez des noms de classes explicites et évitez d’y placer des détails d’implémentation.`,
        questions: [
          { prompt: 'Quel diagramme UML décrit la structure des classes ?', options: ['Diagramme de classes', 'Diagramme de séquence', 'Diagramme de déploiement', 'Diagramme de flux'], correct: 0, explanation: 'Le diagramme de classes est une vue statique.' },
          { prompt: 'Une cardinalité indique combien d’instances peuvent participer à une relation.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Elle décrit les multiplicités.' },
        ],
      },
      {
        id: 'chapter-uml-2',
        slug: 'diagramme-sequence',
        title: 'Diagramme de séquence',
        summary: 'Décrire les échanges entre objets dans le temps.',
        duration: 45,
        language: 'text',
        code: 'Utilisateur → Contrôleur : soumettreQuiz(id)\nContrôleur → Service : calculerScore(reponses)\nService → Base : enregistrer(tentative)\nBase --> Service : confirmation\nService --> Contrôleur : résultat\nContrôleur --> Utilisateur : afficher(score)',
        content: `## Le temps et les messages\n\nUn diagramme de séquence place les participants de gauche à droite et représente les messages de haut en bas. Les durées de vie et conditions peuvent clarifier un scénario.\n\nN’utilisez qu’un niveau de détail utile à la discussion. Trop de messages rendent le diagramme difficile à lire.\n\nCe diagramme complète le diagramme de classes : le premier montre qui existe, le second comment les objets collaborent.`,
        questions: [
          { prompt: 'Dans quel sens se placent les messages ?', options: ['De bas en haut', 'De gauche à droite', 'De haut en bas', 'Aléatoire'], correct: 2, explanation: 'Le temps se lit de haut en bas.' },
          { prompt: 'Un diagramme de séquence montre les échanges entre objets.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Les messages représentent les interactions.' },
        ],
      },
      {
        id: 'chapter-uml-3',
        slug: 'cas-utilisation',
        title: 'Cas d’utilisation et états',
        summary: 'Formaliser les services rendus et le cycle de vie d’un objet.',
        duration: 45,
        language: 'text',
        code: 'Acteur — (Se connecter)\nActeur — (Passer un quiz)\n\nQuiz : non commencé → en cours → réussi\n                         ↘ échoué',
        content: `## Les intentions des utilisateurs\n\nUn cas d’utilisation décrit un objectif externe, pas une étape d’interface. L’acteur est un rôle, pas forcément une personne.\n\nUn diagramme d’état représente les transitions d’un objet entre états. Les événements, conditions et actions doivent être explicites.\n\nReliez les diagrammes aux décisions de conception : un modèle utile est un modèle que l’équipe peut discuter.`,
        questions: [
          { prompt: 'Un cas d’utilisation décrit principalement quoi ?', options: ['Une intention utilisateur', 'Une couleur', 'Une requête SQL', 'Une classe Java'], correct: 0, explanation: 'Il décrit un objectif du domaine.' },
          { prompt: 'Un diagramme d’état représente les transitions entre états.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Il modélise le cycle de vie d’un objet.' },
        ],
      },
    ],
    final: [
      { prompt: 'Quel diagramme décrit les classes et leurs relations ?', options: ['Classes', 'Séquence', 'Cas d’utilisation', 'États'], correct: 0, explanation: 'Le diagramme de classes est la vue statique.' },
      { prompt: 'Les messages d’une séquence se lisent de haut en bas.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Cet axe représente le temps.' },
      { prompt: 'Un cas d’utilisation décrit un objectif du domaine.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Il est centré sur l’intention de l’utilisateur.' },
    ],
  },
  {
    id: 'course-git',
    slug: 'git',
    technology: 'Git',
    title: 'Git',
    shortDescription: 'Versionnez votre code avec confiance : commits, branches et historique.',
    description: 'Comprenez le modèle de Git, créez des historiques propres et fusionnez ou rebasez vos changements.',
    level: 'Débutant',
    duration: 190,
    icon: 'git-branch',
    accent: '#00ff9d',
    chapters: [
      {
        id: 'chapter-git-1',
        slug: 'commits-historique',
        title: 'Commits et historique',
        summary: 'Construire une chronologie lisible et récupérable.',
        duration: 45,
        language: 'bash',
        code: 'git status\ngit add src/\ngit commit -m "feat: add authentication form"\ngit log --oneline --graph',
        content: `## Un commit est une intention\n\nUn commit encapsule un ensemble cohérent de changements. Son message doit expliquer pourquoi le changement existe, pas seulement quelle ligne a été modifiée.\n\nUtilisez \`git status\` avant de créer le commit, puis \`git diff\` pour relire les différences. L’historique est une documentation de décisions.\n\nUn commit réversible est plus facile à corriger qu’un commit qui mélange trois responsabilités.`,
        questions: [
          { prompt: 'Quelle commande affiche les changements non indexés ?', options: ['git status', 'git push', 'git merge', 'git clone'], correct: 0, explanation: 'git status affiche l’état du répertoire de travail.' },
          { prompt: 'Un commit devrait regrouper une seule intention cohérente.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Une intention unique rend l’historique maintenable.' },
        ],
      },
      {
        id: 'chapter-git-2',
        slug: 'branches-merge',
        title: 'Branches et merge',
        summary: 'Isoler une fonctionnalité et intégrer les changements sans surprise.',
        duration: 50,
        language: 'bash',
        code: 'git switch -c feature/authentication\ngit switch main\ngit merge --no-ff feature/authentication\ngit branch -d feature/authentication',
        content: `## Les branches coûtent peu\n\nUne branche est un pointeur mobile vers un commit. Créez une branche courte pour chaque fonctionnalité ou correction.\n\nAvant un merge, consultez \`git log\` et lancez les tests. Résolvez les conflits en comprenant les deux intentions, jamais en supprimant arbitrairement des lignes.\n\nSupprimez une branche locale après intégration uniquement lorsque son travail est présent dans la branche cible.`,
        questions: [
          { prompt: 'Que représente une branche Git ?', options: ['Un fichier compressé', 'Un pointeur vers un commit', 'Un serveur distant', 'Un tag de version'], correct: 1, explanation: 'Une branche est une référence mobile.' },
          { prompt: 'Un conflit de merge doit être résolu par des tests et une lecture des différences.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Le conflit demande une décision explicite.' },
        ],
      },
      {
        id: 'chapter-git-3',
        slug: 'rebase-remotes',
        title: 'Rebase et dépôts distants',
        summary: 'Reconstruire un historique propre et collaborer avec un remote.',
        duration: 50,
        language: 'bash',
        code: 'git fetch origin\ngit switch feature/search\ngit rebase origin/main\ngit push --set-upstream origin feature/search',
        content: `## Rebaser avec Prudence\n\nUn rebase rejoue vos commits sur une nouvelle base. Il produit un historique linéaire, mais réécrit les commits existants. Ne rebasez donc pas une branche déjà publiée et partagée.\n\nUtilisez \`fetch\` pour mettre à jour les références distantes sans modifier votre travail local. Le push explicite documente la destination.\n\nAvant tout changement d’historique, créez une sauvegarde ou une branche de sécurité.`,
        questions: [
          { prompt: 'Que fait git fetch ?', options: ['Met à jour les références distantes', 'Supprime les branches', 'Valide le code', 'Fusionne automatiquement'], correct: 0, explanation: 'fetch récupère les références sans merge ni rebase local.' },
          { prompt: 'Rebaser une branche partagée déjà publiée est sans risque.', options: ['Vrai', 'Faux'], correct: 1, explanation: 'Le rebase réécrit les commits et peut perturber les collaborateurs.' },
        ],
      },
    ],
    final: [
      { prompt: 'Que fait git switch -c nouvelle-branche ?', options: ['Crée et bascule vers une branche', 'Supprime la branche', 'Publie un commit', 'Résout un conflit'], correct: 0, explanation: 'switch -c crée la branche et change de référence courante.' },
      { prompt: 'Un commit est une unité cohérente de changements.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Il capture une intention identifiable.' },
      { prompt: 'Un rebase réécrit-il l’historique des commits rejoués ?', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Les commits sont recréés sur une nouvelle base.' },
    ],
  },
  {
    id: 'course-github',
    slug: 'github',
    technology: 'GitHub',
    title: 'GitHub',
    shortDescription: 'Collaborez, automatisez et protégez vos dépôts avec GitHub.',
    description: 'Utilisez les dépôts, issues, pull requests, Actions et règles de sécurité pour livrer un projet partagé.',
    level: 'Intermédiaire',
    duration: 170,
    icon: 'github',
    accent: '#00d9ff',
    chapters: [
      {
        id: 'chapter-github-1',
        slug: 'depots-issues',
        title: 'Dépôts et issues',
        summary: 'Organiser un projet et documenter le travail à faire.',
        duration: 45,
        language: 'text',
        code: 'Repository\n├── README.md\n├── .github/\n│   └── workflows/ci.yml\n└── src/\n\nIssue : décrit un problème, un risque ou une amélioration.',
        content: `## Le dépôt est une interface d’équipe\n\nUne description claire indique l’objectif, l’installation et les commandes de vérification. Les issues décrivent un résultat attendu, pas seulement une intuition.\n\nUtilisez des labels pour catégoriser le travail et une convention de branches partagée. Les discussions gardent les décisions visibles.\n\nNe publiez jamais de secrets dans un dépôt. Les fichiers \`.env\` et \`.gitignore\` font partie de la configuration de sécurité.`,
        questions: [
          { prompt: 'Une issue décrit principalement quoi ?', options: ['Un problème ou une amélioration à suivre', 'Une dépendance', 'Une variable CSS', 'Un commit distant'], correct: 0, explanation: 'Une issue est une unité de travail collaborative.' },
          { prompt: 'Les secrets doivent être versionnés pour être partagés.', options: ['Vrai', 'Faux'], correct: 1, explanation: 'Les secrets restent hors du dépôt.' },
        ],
      },
      {
        id: 'chapter-github-2',
        slug: 'pull-requests',
        title: 'Pull requests',
        summary: 'Discuter, vérifier et intégrer une modification en équipe.',
        duration: 45,
        language: 'text',
        code: 'Pull request\n  branche source : feature/auth\n  cible : main\n  checklist : tests, revue, documentation\n  décision : merge, squash ou rebase',
        content: `## La pull request est une revue\n\nUne description précise la motivation, les changements et le risque associé. Une petite pull request reçoit une revue plus rapide et réduit les conflits.\n\nLes protections de branche imposent les tests et la revue avant merge. Le merge squash produit un historique lisible sur les branches de fonctionnalité.\n\nAprès le merge, supprimez la branche et vérifiez le déploiement.`,
        questions: [
          { prompt: 'Quel est l’objectif principal d’une pull request ?', options: ['Remplacer Git', 'Discuter et vérifier une modification', 'Écrire du CSS', 'Stocker des images'], correct: 1, explanation: 'Elle centralise la revue et la validation.' },
          { prompt: 'Une petite pull request est généralement plus facile à reviewer.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'La taille réduite la charge de revue.' },
        ],
      },
      {
        id: 'chapter-github-3',
        slug: 'actions-securite',
        title: 'Actions et sécurité',
        summary: 'Automatiser les tests et réduire les risques de livraison.',
        duration: 55,
        language: 'yaml',
        code: 'name: Verify\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm test',
        content: `## L’automatisation protège le temps\n\nUne action GitHub peut installer les dépendances, lancer les tests et construire l’artefact à chaque push. Le workflow doit être lisible et rapide.\n\nÉpinglez les actions tierces sur une version ou un SHA, limitez les permissions avec \`GITHUB_TOKEN\` et n’affichez jamais un secret dans les logs.\n\nUne branche protégée combine vérifications automatiques, revue obligatoire et interdiction des force pushes.`,
        questions: [
          { prompt: 'Que déclenche ici on: [push, pull_request] ?', options: ['Le workflow lors des push et pull requests', 'La suppression du dépôt', 'Le commit automatique', 'Le merge automatique'], correct: 0, explanation: 'La liste configure les événements déclencheurs.' },
          { prompt: 'Les permissions du GITHUB_TOKEN doivent être réduites au nécessaire.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Le principe du moindre privilège réduit les risques.' },
        ],
      },
    ],
    final: [
      { prompt: 'Que décrit une issue ?', options: ['Un travail ou problème à suivre', 'Une police de caractères', 'Un tag local', 'Un test local'], correct: 0, explanation: 'Une issue structure la collaboration.' },
      { prompt: 'Une pull request sert de point de revue avant intégration.', options: ['Vrai', 'Faux'], correct: 0, explanation: 'Elle centralise la validation des changements.' },
      { prompt: 'Comment réduire le risque d’un workflow CI ?', options: ['Permissions minimales et dépendances épinglées', 'Secrets dans les logs', 'Force push systématique', 'Désactivation des tests'], correct: 0, explanation: 'Le moindre privilège et la traçabilité sont essentiels.' },
    ],
  },
];

function questionRow(quizId, chapterId, question, index) {
  const isBoolean = question.options.length === 2 && question.options.every((option) => ['Vrai', 'Faux'].includes(option));
  return [
    `${quizId}-q${index + 1}`,
    quizId,
    question.type || (isBoolean ? 'boolean' : 'mcq'),
    question.prompt,
    JSON.stringify(question.options),
    question.correct,
    question.explanation,
    index,
  ];
}

function seedUsers() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, avatar, bio, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run('user-admin', 'Administrateur Djangue', 'admin@djangue.dev', bcrypt.hashSync('DjangueAdmin2026!', 12), 'admin', null, 'Compte administrateur de la plateforme.', now, now);
  insert.run('user-student', 'Camille Diallo', 'student@djangue.dev', bcrypt.hashSync('DjangueStudent2026!', 12), 'student', null, 'Apprenante en développement web et outils de modélisation.', now, now);
}

function seedModules() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM courses').get().count;
  if (count > 0) return;

  const insertCourse = db.prepare(`
    INSERT INTO courses (id, slug, technology, title, short_description, description, level, duration_minutes, icon, accent, order_index, published, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);
  const insertChapter = db.prepare(`
    INSERT INTO chapters (id, course_id, slug, title, summary, content, code, language, duration_minutes, order_index, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertQuiz = db.prepare(`
    INSERT INTO quizzes (id, chapter_id, course_id, title, description, kind, pass_score)
    VALUES (?, ?, ?, ?, ?, ?, 70)
  `);
  const insertQuestion = db.prepare(`
    INSERT INTO questions (id, quiz_id, type, prompt, options, correct_index, explanation, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    modules.forEach((course, courseIndex) => {
      insertCourse.run(course.id, course.slug, course.technology, course.title, course.shortDescription, course.description, course.level, course.duration, course.icon, course.accent, courseIndex + 1, now, now);

      course.chapters.forEach((chapter, chapterIndex) => {
        insertChapter.run(chapter.id, course.id, chapter.slug, chapter.title, chapter.summary, chapter.content, chapter.code, chapter.language, chapter.duration, chapterIndex + 1, now, now);
        const quizId = `quiz-${chapter.slug}`;
        insertQuiz.run(quizId, chapter.id, null, `Quiz · ${chapter.title}`, 'Validez les notions essentielles de cette leçon.', 'chapter');
        chapter.questions.forEach((question, questionIndex) => {
          insertQuestion.run(...questionRow(quizId, chapter.id, question, questionIndex));
        });
      });

      const finalId = `final-${course.slug}`;
      insertQuiz.run(finalId, null, course.id, `Évaluation finale · ${course.title}`, 'Une synthèse chronométrée pour valider le module.', 'module');
      course.final.forEach((question, questionIndex) => {
        insertQuestion.run(...questionRow(finalId, course.id, question, questionIndex));
      });
    });
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function seedDatabase() {
  seedUsers();
  seedModules();
}

seedDatabase();
