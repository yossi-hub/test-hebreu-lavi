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

Le parcours contient aussi quatre autoévaluations où l’utilisateur écrit « oui » ou « non ». Elles servent uniquement à choisir le premier niveau testé. La question sur l’alphabet, les sept propositions de continuer, la ville et la préférence présentiel/distanciel ont été retirées du parcours. Les étapes sans bonne réponse ne rapportent pas de points.

Après chaque réponse, le feedback et la question suivante apparaissent immédiatement dans la conversation. Les QCM se répondent uniquement avec leurs boutons ; seuls les champs conversationnels utilisent la barre d’écriture.
Avant la première question notée, Lavi affiche une courte introduction personnalisée avec le prénom de l’utilisateur.

Les cinq textes de lecture apparaissent dans une bulle séparée, suivie par une nouvelle bulle contenant uniquement la question. Huit images et sept vidéos distinctes reprennent les URL de l’export. Les images utilisent le chemin `/image/default` documenté par Typeform : https://www.typeform.com/developers/create/image-sizes/.

Les QCM affichent directement leurs propositions sans consigne répétitive sous la question. Les images sont intégrées sans lien supplémentaire ; les vidéos conservent leur aperçu et leur lien YouTube de secours.

Les questions en hébreu sont affichées de droite à gauche. Le point d’interrogation placé avant le texte dans l’export Typeform est automatiquement déplacé à sa position logique afin qu’il apparaisse à gauche.

## Parcours et score

- Le profil demande le prénom et le nom dans une même première question, puis l’email et le téléphone. Tous sont obligatoires ; email au format valide et téléphone non vide.
- Les quatre autoévaluations sont toujours posées. Le nombre de « Oui » consécutifs avant le premier « Non » choisit le premier mini-test : 0 → niveau 1, 1 → niveau 2, 2 → niveau 3, 3 → niveau 5 et 4 → niveau 6. Une combinaison contradictoire est donc interprétée prudemment à partir du premier « Non ».
- Les réponses aux quatre autoévaluations passent immédiatement à la suite, sans message de confirmation du professeur.
- Chaque niveau testé commence par trois questions prédéfinies. Un score de 3/3 valide le niveau, 0/3 ou 1/3 l’invalide, et 2/3 déclenche une quatrième question de départage. Le niveau est validé à 3/4 et invalidé à 2/4.
- Après chaque mini-test, le moteur resserre automatiquement les bornes et choisit le niveau intermédiaire suivant. Il s’arrête dès qu’un niveau validé et le niveau immédiatement supérieur invalidé sont connus.
- Les questions d’un même mini-test conservent leur bloc, leur texte, leur image ou leur vidéo d’origine.
- Les questions facultatives peuvent être passées. Elles rapportent zéro point ; les règles Typeform peuvent compter une absence de réponse comme une erreur. Les champs obligatoires doivent être renseignés.
- Le score final porte sur les questions effectivement présentées, y compris celles passées ; les niveaux non parcourus ne sont pas comptés au dénominateur.
- Le niveau conseillé est compris entre 1 et 8. Il correspond au niveau validé le plus élevé ; un utilisateur qui échoue au niveau 1 reçoit le niveau 1 à commencer.
- Recommencer remet à zéro réponses, score, variables et historique du test. Le profil reste en mémoire.

### Adaptations documentées

Les règles des `inline_group` sont prioritaires à la fin de chaque groupe. Les sauts isolés de certains enfants vers la fin sont conservés dans `parcours.reglesEnfantsSource` pour référence, mais non exécutés après chaque bulle : cela couperait notamment la vidéo du niveau 2 avant le dernier QCM et empêcherait de parcourir les 68 questions. Cette interprétation permet d’adapter des groupes Typeform à une interface conversationnelle ; la parité visuelle avec le formulaire hébergé n’a pas été vérifiée.

Correction explicitement validée par l’utilisateur : pour la dernière question (`5ed6eb50-c8c7-4b49-8e6d-1050866979a2`), l’incrément du compteur `mr8` utilise `is_not` au lieu de `is`. La bonne réponse n’ajoute donc plus une erreur. Les autres conditions et seuils sont conservés.

Le résultat s’affiche sans redirection vers un site externe. Les coordonnées et le résultat sont transmis au backend dans le corps d’une requête POST, jamais dans l’URL.

## Fichiers

- `questions.js` : tableau `questions`, textes, médias et configuration `parcours`.
- `engine.js` : calcul du score et évaluation des conditions de parcours, sans interface.
- `app.js` : prise de connaissance, bulles, saisie, corrections et résultat.
- `index.html` / `style.css` : structure et design.
- `scripts/import-typeform.py` : conversion reproductible d’un export JSON Typeform.
- `tests/engine.test.cjs` / `tests/interface.test.cjs` : vérifications automatisées sans dépendance externe.
- `functions/api/recommendations.js` : lecture sécurisée des classes Airtable et classement des classes compatibles par l’API OpenAI.
- `functions/api/question-set.js` : aperçu du brouillon Airtable et publication de versions stables du questionnaire.
- `admin.html` : vérification, aperçu et publication des questions sur DEV.

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

Dans le navigateur, `userProfile` et l’état du moteur restent en mémoire JavaScript. Un rechargement ou la fermeture de la page les efface. À la fin du test, l’application envoie les coordonnées, le score et le niveau conseillé à la fonction Cloudflare Pages `/api/results`. Cette fonction valide les données, enregistre la participation et sa localisation approximative dans D1, puis les transmet à un webhook Make privé. Le scénario Make utilise deux modules Gmail : un récapitulatif au bureau sur `contact@oulpanlavi.com` et un bilan personnalisé à l’utilisateur. Les médias sont chargés depuis leurs hébergeurs externes.

L’URL du webhook Make doit être enregistrée dans Cloudflare Pages sous la variable chiffrée `MAKE_WEBHOOK_URL`. Elle ne doit jamais être placée dans `app.js` ni commitée dans GitHub.

### Synchronisation des leads Brevo

À la fin du test, `/api/results` appelle aussi l’API Brevo côté serveur. Le contact est identifié par son email normalisé en minuscules. La requête `POST /v3/contacts` utilise `updateEnabled: true` : elle crée le contact ou met à jour ses attributs s’il existe déjà. Un nouveau test avec le même email remplace les résultats précédents sur le contact ; D1 conserve les participations distinctes. Cette intégration vise les **contacts**, sans créer de deal CRM. [Référence API Brevo](https://developers.brevo.com/reference/create-contact).

Configuration Cloudflare Pages, d’abord dans **Preview**, puis dans **Production** après validation :

- `BREVO_API_KEY` : secret chiffré Brevo, jamais dans les fichiers servis au navigateur ou dans Git ;
- `BREVO_LIST_ID` : ID numérique de la liste à laquelle ajouter le contact (facultatif ; sans cette variable, aucune liste n’est ajoutée) ;
- `BREVO_ATTRIBUTE_MAP` : objet JSON facultatif pour adapter les noms d’attributs existants.

Les attributs suivants doivent exister dans Brevo avec les types indiqués **avant l’activation**. Brevo peut ignorer un attribut absent ou de type incompatible, même si la requête réussit :

| Champ du test | Attribut Brevo par défaut | Type Brevo |
| --- | --- | --- |
| Prénom | `PRENOM` | Texte |
| Nom | `NOM` | Texte |
| Téléphone (même numéro dans les trois champs) | `SMS`, `LANDLINE_NUMBER`, `WHATSAPP` | Téléphone avec indicatif international |
| Niveau conseillé | `NIVEAU_LAVI` | Nombre |

L’email est envoyé comme identifiant du contact. Aucun attribut supplémentaire n’est nécessaire : score, points, date et source ne sont pas envoyés par défaut. Avec les noms ci-dessus, `BREVO_ATTRIBUTE_MAP` est inutile. Si cette variable existe déjà, vérifier qu’elle ne réactive pas les champs désactivés.

Par exemple, pour utiliser un attribut `NIVEAU` à la place de `NIVEAU_LAVI` :

```json
{"niveau_lavi":"NIVEAU"}
```

Les champs non précisés gardent leur attribut par défaut ; `null` permet de ne pas envoyer un champ. Les noms d’attributs doivent être en majuscules et distincts. Le téléphone est normalisé (espaces, tirets, points et parenthèses retirés, préfixe `00` converti en `+`) et copié dans les trois champs existants. Les numéros sans indicatif international, par exemple `0612345678`, sont omis de Brevo : aucun pays n’est déduit de la localisation. Le contact et le niveau sont tout de même synchronisés et les éventuels anciens numéros restent inchangés ; le numéro saisi est toujours conservé dans D1 et transmis à Make. `{"telephone":null}` désactive les trois champs téléphone. La synchronisation ne modifie pas les désinscriptions et ne force aucune fusion de contacts. Un numéro déjà associé à un autre contact peut provoquer un refus Brevo, conservé dans `brevo_sync`.

L’appel Brevo et l’envoi Make s’exécutent indépendamment, après l’enregistrement de la participation. Une erreur Brevo ne bloque pas le bilan Make ; une erreur Make n’empêche pas la synchronisation Brevo. Le backend attend les deux appels avant de répondre, avec un délai maximum de huit secondes pour l’appel HTTP Brevo. Le succès affiché à l’utilisateur concerne l’envoi du bilan via Make.

La table D1 `brevo_sync` est créée automatiquement sans modifier la table des participations. Elle contient `participation_id`, `status`, `http_status` et `updated_at`. Les statuts sont `pending`, `accepted`, `failed`, `not_configured` (clé absente) ou `configuration_error`. `accepted` confirme seulement l’acceptation HTTP par Brevo ; vérifier les valeurs du contact dans Brevo lors du premier essai. Sans D1, la synchronisation continue mais son statut n’est pas conservé. Aucun renvoi automatique des échecs n’est implémenté ; un échec conservé dans D1 doit être repris manuellement.

Après configuration et redéploiement, faire deux tests avec le même email et deux niveaux différents. Vérifier qu’un seul contact existe, que le second niveau remplace le premier, que la liste est correcte et que les bilans Make arrivent. Pour consulter les erreurs :

```sql
SELECT p.date_test, p.email, p.niveau_lavi, b.status, b.http_status
FROM test_participations p
JOIN brevo_sync b ON b.participation_id = p.id
ORDER BY p.date_test DESC
LIMIT 20;
```

### Localisation approximative des participations (DEV)

La localisation est lue dans `request.cf` au moment de la validation du résultat dans `/api/results`, par `lib/location.js`. Cloudflare fournit le code pays, la région, la ville, le code postal et le fuseau horaire. Le nom du pays en français est dérivé du code ISO avec `Intl.DisplayNames`, sans requête externe. Ces informations restent approximatives : un VPN ou un réseau mobile peut indiquer une autre ville. Aucun accès GPS, aucune permission navigateur, aucune lecture ou conservation de l’IP brute n’est ajouté. La localisation fournie par le navigateur dans le JSON est ignorée.

Chaque soumission valide reçoit un `participation_id` aléatoire. `lib/participations.js` crée si nécessaire la table `test_participations` dans la liaison D1 `QUIZ_DB` et y stocke les coordonnées, le résultat, la date serveur et les colonnes `country`, `country_code`, `region`, `city`, `postal_code`, `timezone`. Le stockage précède l’appel Make. `webhook_status` indique `pending`, `accepted` ou `failed` : `accepted` confirme l’acceptation par Make, pas la livraison des deux mails. Chaque nouvelle soumission POST constitue une participation distincte.

Les champs absents sont `null`, y compris en exécution locale sans `request.cf`. Sans liaison D1, ou en cas de panne de D1, l’envoi Make continue ; dans ce cas la participation n’est pas enregistrée dans D1. Une panne Make ne supprime pas une participation déjà enregistrée. Un simple serveur statique local ne sert pas les routes `/api` : utiliser un environnement Pages Functions pour tester les envois, ou les tests automatisés qui simulent Make et exécutent le schéma dans SQLite.

Le webhook reçoit un objet `location` avec les six clés `country`, `countryCode`, `region`, `city`, `postalCode`, `timezone`, ainsi qu’un fragment HTML échappé `internal_location_html` destiné uniquement au mail du bureau. Le modèle de mail utilisateur et les champs qu’il utilise restent inchangés. Dans Make, le bloc interne doit être ajouté au corps HTML du module adressé au bureau avec `{{1.internal_location_html}}` (adapter le numéro au module webhook). Un ancien payload sans ce champ ne doit rien ajouter au mail.

Pour vérifier le déploiement DEV, effectuer une participation sur `https://dev.test-hebreu-lavi.pages.dev/`, puis ouvrir la console de la base D1 Preview et exécuter :

```sql
SELECT id, date_test, niveau_lavi, country, country_code, region, city,
       postal_code, timezone, webhook_status
FROM test_participations
ORDER BY date_test DESC
LIMIT 10;
```

Contrôler ensuite la notification du bureau et vérifier que le bilan utilisateur conserve son contenu. Pour la mise en production sur `https://test.oulpanlavi.com`, fusionner DEV après validation et configurer une base D1 de production avec la même liaison `QUIZ_DB`, distincte de la base Preview. Redéployer la production puis répéter ce contrôle. La seule modification des réglages Preview n’active pas cette fonctionnalité en production.

### Recommandations de classes (branche DEV)

À la fin du test, l’interface appelle `/api/recommendations` avec le seul niveau Lavi. Ce nombre est utilisé comme chapitre cible. La fonction charge la table `Classes` de la base Airtable `Base Cours`, conserve les classes `Zoom` et `Upcoming` qui ont un `Chapitre en cours`, un lien d’inscription et des places (une disponibilité non renseignée reste admise). Seules les classes situées entre le chapitre cible − 1 et le chapitre cible + 1, bornes incluses, sont admissibles : pour un niveau 4, les chapitres 3 à 5. Elles sont ensuite triées selon leur distance au chapitre cible. OpenAI en classe jusqu’à trois. Si l’appel OpenAI échoue, les trois classes admissibles les plus proches sont proposées par règles. Si aucune classe n’est dans la plage, la liste reste vide ; la tolérance n’est jamais élargie. Le champ Airtable `Niveau` est informatif et ne sert plus de table de correspondance.

### Questions gérées depuis Airtable (branche DEV)

La table [Questions test hébreu](https://airtable.com/appNbwmEyVQsXA25U/tblG7aWXPDkLCeNUz/viwBcFTDiLsQhYGOA) contient 72 éléments actifs du parcours — 68 questions notées et 4 questions d’orientation —, 3 questions de profil et des questions archivées ou hors parcours. Airtable sert de brouillon éditorial. Le site public charge la dernière version publiée au démarrage du test ; si aucune version n’existe encore, il utilise les questions embarquées dans `questions.js`. Un test déjà commencé conserve sa version jusqu’au rechargement de la page.

Sur la branche DEV, ouvrir `/admin.html`, entrer le code d’administration, cliquer sur **Vérifier le brouillon**, puis **Tester dans l’application**. Si l’aperçu convient, cliquer sur **Publier sur DEV**. La publication relit Airtable et enregistre une copie stable dans D1. Elle est refusée si une question de profil manque, si le JSON des choix est invalide, si un bloc devient vide ou si une règle du parcours fait référence à une question retirée. Une question marquée `Brouillon` doit être passée à `Validée` avant publication ; `Archivée` l’exclut. Les questions `Hors parcours` restent dans Airtable sans apparaître dans le test.

Les libellés des choix, textes, médias et instructions peuvent être modifiés dans Airtable. Il faut conserver les identifiants des questions et des choix déjà utilisés dans les règles. Une nouvelle question non notée peut être ajoutée à un bloc existant en indiquant `Phase = Test`, un `Bloc ID` existant et une position libre. L’ajout d’une question notée, la suppression d’une question utilisée par les règles ou le changement de sa bonne réponse exigent une adaptation des règles de calcul ; la publication est bloquée jusque-là.

Configuration Cloudflare Pages **Preview** nécessaire à cette fonctionnalité :

- conserver `AIRTABLE_TOKEN` avec le droit de lecture sur la base `Base Cours` ;
- créer un secret `QUIZ_ADMIN_TOKEN` d’au moins 24 caractères ;
- ajouter la variable `QUIZ_PUBLISH_ENABLED` avec la valeur `true` ;
- créer une base D1 dédiée aux tests et l’associer à Pages avec le nom de liaison `QUIZ_DB` dans l’environnement Preview ;
- redéployer `DEV` après l’ajout de la liaison D1.

La table D1 `quiz_publications` est créée lors de la première publication. Le code d’administration reste côté Cloudflare et n’apparaît jamais dans les fichiers Git. La route d’aperçu exige ce code ; la route de publication exige en plus la liaison D1 et `QUIZ_PUBLISH_ENABLED=true`.

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
node tests/question-set.test.mjs
node --test tests/results.test.mjs
```

Les quatre questions d’orientation sont présentées ensemble avec un choix Oui/Non. Le test explique dès le départ son fonctionnement adaptatif et permet de passer toute question notée jugée trop difficile. Il enchaîne ensuite des mini-tests adaptatifs de trois questions, avec une quatrième question de départage uniquement en cas de doute.

Au démarrage du mini-test, la page remonte automatiquement pour rendre la progression et la première question visibles. Chaque niveau disposant de questions vidéo dans la banque inclut au moins une question de compréhension orale dans ses trois questions principales (niveaux 2 et 4 à 8). Les niveaux 1 et 3 n’ont actuellement aucune question vidéo dans la banque Airtable.

Les tests vérifient les cinq routes d’orientation, l’écran groupé Oui/Non, les mini-tests adaptatifs de trois questions, la quatrième question de départage, le resserrement des bornes, les résultats des niveaux 1 à 8, le redémarrage et la validation du profil. Les tests d’interface utilisent un DOM simulé : ils ne remplacent pas une vérification visuelle dans un navigateur.
