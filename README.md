# Test Hébreu Lavi

Application locale en HTML, CSS et JavaScript, sans installation. Interface de conversation : professeur à gauche, élève à droite.

Les réponses conversationnelles utilisent une barre d’écriture de type WhatsApp. Les QCM se répondent uniquement avec les boutons proposés ; les QCM multiples affichent un bouton de validation après la sélection.
La barre d’écriture reste fixée en bas de l’écran pendant la conversation.

## Lancer

Double-cliquez sur `index.html`. Les questions et le moteur fonctionnent sans serveur ; les images Typeform et vidéos YouTube nécessitent Internet. Chaque vidéo dispose aussi d’un lien pour l’ouvrir sur YouTube si le lecteur intégré est bloqué.

Avec Python 3, vous pouvez aussi lancer un serveur local dans ce dossier :

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Ouvrez http://localhost:8000. Ctrl+C arrête le serveur.

## Contenu importé

Les cinq questions de démonstration ont été remplacées par les 68 QCM de l’export Typeform `apMZZ52F`, avec leurs choix et bonnes réponses, à un point chacun.

Le parcours contient aussi la connaissance de l’alphabet, quatre autoévaluations où l’utilisateur écrit « oui » ou « non » et sept propositions de continuer. La ville et la préférence présentiel/distanciel ont été retirées du parcours. Les étapes sans bonne réponse ne rapportent pas de points.

Après chaque réponse, le feedback et la question suivante apparaissent immédiatement dans la conversation. Les QCM se répondent uniquement avec leurs boutons ; seuls les champs conversationnels utilisent la barre d’écriture.
Avant la première question notée, Lavi affiche une courte introduction personnalisée avec le prénom de l’utilisateur.

Les cinq textes de lecture apparaissent dans une bulle séparée, suivie par une nouvelle bulle contenant uniquement la question. Huit images et sept vidéos distinctes reprennent les URL de l’export. Les images utilisent le chemin `/image/default` documenté par Typeform : https://www.typeform.com/developers/create/image-sizes/.

Les QCM affichent directement leurs propositions sans consigne répétitive sous la question. Les images sont intégrées sans lien supplémentaire ; les vidéos conservent leur aperçu et leur lien YouTube de secours.

Les questions en hébreu sont affichées de droite à gauche. Le point d’interrogation placé avant le texte dans l’export Typeform est automatiquement déplacé à sa position logique afin qu’il apparaisse à gauche.

## Parcours et score

- Le profil demande le prénom et le nom dans une même première question, puis l’email et le téléphone. Tous sont obligatoires ; email au format valide et téléphone non vide.
- La connaissance de l’alphabet est demandée avant les quatre autoévaluations. Une réponse « Non » saute directement ces quatre questions et affiche le bilan. Sinon, elles sont posées dans l’ordre et, dès leur première réponse « Non », les suivantes sont sautées. Si les quatre réponses sont « Oui », le parcours commence directement au niveau 4. Cette règle remplace le seuil de trois étoiles du Typeform.
- Les réponses aux quatre autoévaluations passent immédiatement à la suite, sans message de confirmation du professeur.
- Les règles importées comptent les erreurs par niveau et proposent de continuer entre deux niveaux. « Non » termine le test.
- Les groupes sont présentés une question à la fois, mais leurs règles sont évaluées à la fin du groupe. Les seuils restent ceux du fichier source : généralement trois erreurs, avec un arrêt à deux erreurs à la fin du premier groupe du niveau 5.
- Les questions facultatives peuvent être passées. Elles rapportent zéro point ; les règles Typeform peuvent compter une absence de réponse comme une erreur. Les champs obligatoires doivent être renseignés.
- Le score final porte sur les questions effectivement présentées, y compris celles passées ; les niveaux non parcourus ne sont pas comptés au dénominateur.
- Le niveau conseillé reprend la variable `niveau_lavi` du Typeform. Il peut aller de 1 à 9 : réussir le huitième niveau oriente vers le niveau 9. Ce n’est pas le numéro du dernier niveau parcouru.
- Recommencer remet à zéro réponses, score, variables et historique du test. Le profil reste en mémoire.

### Adaptations documentées

Les règles des `inline_group` sont prioritaires à la fin de chaque groupe. Les sauts isolés de certains enfants vers la fin sont conservés dans `parcours.reglesEnfantsSource` pour référence, mais non exécutés après chaque bulle : cela couperait notamment la vidéo du niveau 2 avant le dernier QCM et empêcherait de parcourir les 68 questions. Cette interprétation permet d’adapter des groupes Typeform à une interface conversationnelle ; la parité visuelle avec le formulaire hébergé n’a pas été vérifiée.

Correction explicitement validée par l’utilisateur : pour la dernière question (`5ed6eb50-c8c7-4b49-8e6d-1050866979a2`), l’incrément du compteur `mr8` utilise `is_not` au lieu de `is`. La bonne réponse n’ajoute donc plus une erreur. Les autres conditions et seuils sont conservés.

Le résultat s’affiche localement, sans la redirection du Typeform vers un site externe. Aucun prénom, email, téléphone ou résultat n’est envoyé ni placé dans une URL.

## Fichiers

- `questions.js` : tableau `questions`, textes, médias et configuration `parcours`.
- `engine.js` : calcul du score et évaluation des conditions de parcours, sans interface.
- `app.js` : prise de connaissance, bulles, saisie, corrections et résultat.
- `index.html` / `style.css` : structure et design.
- `scripts/import-typeform.py` : conversion reproductible d’un export JSON Typeform.
- `tests/engine.test.cjs` / `tests/interface.test.cjs` : vérifications automatisées sans dépendance externe.
- `functions/api/recommendations.js` : lecture sécurisée des classes Airtable et classement des classes compatibles par l’API OpenAI.

## Modifier ou ajouter des questions

Pour modifier une question, cherchez son texte dans `questions.js`. Les identifiants des choix servent à relier les bonnes réponses et les règles ; conservez-les lors d’une simple modification de texte.

Exemple de nouvelle question libre :

```js
{
  id: 'eau',
  texte: 'Comment écrit-on « eau » en hébreu ?',
  type: 'text',
  choix: [],
  bonneReponse: 'מים',
  points: 1,
  niveau: 1,
  obligatoire: true,
  langue: 'he'
},
```

Ajoutez ensuite son identifiant (`'eau'`) dans la liste `questions` du bloc souhaité de `parcours.blocs`. Le score et la progression du niveau suivent le tableau. Pour inclure cette question dans les seuils d’arrêt importés, il faut également adapter les règles du bloc : une nouvelle question ne modifie pas automatiquement la logique pédagogique Typeform.

Pour un QCM, utilisez `type: 'qcm'`, une liste `choix: [{libelle: 'מים', valeur: 'eau-oui'}, ...]` et `bonneReponse: 'eau-oui'`. `multiple: true` permet plusieurs choix ; les QCM notés de cet export n’ont qu’une seule bonne réponse attendue. `aleatoire: true` mélange l’ordre affiché des choix.

Réimporter un export remplace entièrement `questions.js` : conservez vos modifications manuelles avant de le faire.

```sh
python3 scripts/import-typeform.py /chemin/vers/export.json
```

## Stockage et vérifications

`userProfile` et l’état du moteur restent uniquement en mémoire JavaScript. Un rechargement ou la fermeture de la page les efface. À la fin du test, l’application envoie les coordonnées, le score et le niveau conseillé à la fonction Cloudflare Pages `/api/results`. Cette fonction valide les données puis les transmet à un webhook Make privé. Le scénario Make utilise deux modules Gmail : un récapitulatif au bureau sur `contact@oulpanlavi.com` et un bilan personnalisé à l’utilisateur. Les médias sont chargés depuis leurs hébergeurs externes.

L’URL du webhook Make doit être enregistrée dans Cloudflare Pages sous la variable chiffrée `MAKE_WEBHOOK_URL`. Elle ne doit jamais être placée dans `app.js` ni commitée dans GitHub.

### Recommandations de classes (branche DEV)

À la fin du test, l’interface appelle `/api/recommendations` avec le seul niveau Lavi. La fonction charge la table `Classes` de la base Airtable `Base Cours`, conserve les classes `Upcoming` ou `In Progress` du niveau correspondant avec un lien d’inscription et des places, puis demande à OpenAI d’en classer jusqu’à trois. Si l’appel OpenAI échoue, les premières classes éligibles sont proposées par règles afin que l’écran reste utile.

Configurer ces secrets dans l’environnement **Preview** de Cloudflare Pages pour tester la branche sans modifier la production :

- `AIRTABLE_TOKEN` : jeton Airtable en lecture sur `Base Cours` ;
- `OPENAI_API_KEY` : clé du projet OpenAI DEV ;
- `MAKE_WEBHOOK_URL` : webhook Make déjà utilisé par l’envoi du bilan.

Les identifiants `AIRTABLE_BASE_ID`, `AIRTABLE_CLASSES_TABLE_ID` et le modèle `OPENAI_MODEL` sont facultatifs ; la fonction contient les valeurs DEV actuelles et utilise `gpt-6-luna` par défaut. Les fichiers `.env.local` et `.dev.vars` sont ignorés par Git.

Avec Node.js installé :

```sh
node tests/engine.test.cjs
node tests/interface.test.cjs
node tests/recommendations.test.mjs
```

Les tests vérifient les 68 réponses, le parcours complet, l’entrée directe au niveau 4, les arrêts des huit niveaux, les sept refus de continuer, la correction finale, les réponses facultatives, le redémarrage et la validation du profil. Les tests d’interface utilisent un DOM simulé : ils ne remplacent pas une vérification visuelle dans un navigateur.
