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

- Le profil demande le prénom et le nom dans une même première question, puis l’email et le téléphone. Tous sont obligatoires ; email au format valide et téléphone au format international obligatoire (par exemple `+33612345678` ou `+972501234567`). Les espaces et séparateurs sont retirés ; le préfixe `00` est converti en `+`. La saisie et le backend refusent les numéros sans indicatif.
- Les quatre autoévaluations sont toujours posées. Le nombre de « Oui » consécutifs avant le premier « Non » choisit le premier mini-test : 0 → niveau 1, 1 → niveau 2, 2 → niveau 3, 3 → niveau 5 et 4 → niveau 6. Une combinaison contradictoire est donc interprétée prudemment à partir du premier « Non ».
- Les réponses aux quatre autoévaluations passent immédiatement à la suite, sans message de confirmation du professeur.
- Les niveaux 1 à 4 posent trois questions principales : 3/3 valide le niveau, 0/3 ou 1/3 l’invalide, et 2/3 déclenche une quatrième question de départage. Le niveau est validé à 3/4. Les niveaux 5 à 8 posent six questions : trois consécutives sur la même vidéo, puis trois consécutives sur le même texte. Ils sont validés avec au moins cinq bonnes réponses sur six, sans question de départage supplémentaire.
- Après chaque mini-test, le moteur resserre automatiquement les bornes et choisit le niveau intermédiaire suivant. Il s’arrête dès qu’un niveau validé et le niveau immédiatement supérieur invalidé sont connus.
- Chaque texte ou vidéo sélectionné est suivi d’au moins trois questions consécutives sur ce même support. Une erreur ou une question passée n’interrompt pas le groupe. Le libellé « Vidéo/Texte · question 2 sur 3 » indique la progression dans le support ; la barre indique la progression globale du niveau. Le départage des niveaux 2 à 4 prolonge le même support.
- Les questions facultatives peuvent être passées. Elles rapportent zéro point ; les règles Typeform peuvent compter une absence de réponse comme une erreur. Les champs obligatoires doivent être renseignés.
- Le score final porte sur les questions effectivement présentées, y compris celles passées ; les niveaux non parcourus ne sont pas comptés au dénominateur.
- Le niveau conseillé est le niveau d’inscription, compris entre 1 et 9 : dernier niveau validé + 1. Un utilisateur qui échoue au niveau 1 reçoit Lavi 1 ; celui qui valide le niveau 1 reçoit Lavi 2 ; celui qui valide le niveau 8 reçoit Lavi 9. Les questions évaluent les acquis des niveaux 1 à 8, sans mini-test de niveau 9.
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
| Pays estimé par Cloudflare | `COUNTRY` | Texte |

Le champ existant `COUNTRY` reçoit le nom du pays en français (par exemple `France` ou `Israël`), dérivé de `request.cf.country`. Si le pays est indisponible, il est omis pour préserver une éventuelle valeur existante dans Brevo. La localisation envoyée par le navigateur est ignorée.

L’email est envoyé comme identifiant du contact. Aucun attribut supplémentaire n’est nécessaire : score, points, date et source ne sont pas envoyés par défaut. Avec les noms ci-dessus, `BREVO_ATTRIBUTE_MAP` est inutile. Si cette variable existe déjà, vérifier qu’elle ne réactive pas les champs désactivés.

Par exemple, pour utiliser un attribut `NIVEAU` à la place de `NIVEAU_LAVI` :

```json
{"niveau_lavi":"NIVEAU"}
```

Les champs non précisés gardent leur attribut par défaut ; `null` permet de ne pas envoyer un champ. Les noms d’attributs doivent être en majuscules et distincts. Le téléphone est normalisé (espaces, tirets, points et parenthèses retirés, préfixe `00` converti en `+`) et copié dans les trois champs existants. Les numéros sans indicatif international, par exemple `0612345678`, sont refusés dans la saisie et par `/api/results` avant tout enregistrement ou transmission : aucun pays n’est déduit de la localisation. Le numéro normalisé est conservé dans D1 et transmis à Make et Brevo. `{"telephone":null}` désactive les trois champs téléphone. La synchronisation ne modifie pas les désinscriptions et ne force aucune fusion de contacts. Un numéro déjà associé à un autre contact peut provoquer un refus Brevo, conservé dans `brevo_sync`.

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

Sur la branche DEV, ouvrir `/admin.html` depuis le lien Airtable **Mettre à jour DEV**, puis cliquer sur **Actualiser depuis Airtable**. Aucun code d’administration n’est demandé. Ce bouton relit la table configurée côté serveur, vérifie les données et enregistre une copie stable dans D1. La publication est refusée si une question de profil manque, si le JSON des choix est invalide, si un bloc devient vide ou si une règle du parcours fait référence à une question retirée. Une question du parcours marquée `Brouillon` doit être passée à `Validée` avant publication ; `Archivée` l’exclut. Les questions `Hors parcours` restent dans Airtable sans apparaître dans le test. La phase `Audio DEV` ajoute des exercices vocaux à l’essai audio ; seuls ses éléments `Validée` sont inclus. La publication refuse aussi une sélection qui sépare les questions d’un même support ou en laisse moins de trois à la suite : mettre à jour les trois liens vidéo ensemble lors d’un remplacement de support.

Les libellés des choix, textes, médias et instructions peuvent être modifiés dans Airtable. Il faut conserver les identifiants des questions et des choix déjà utilisés dans les règles. Une nouvelle question non notée peut être ajoutée à un bloc existant en indiquant `Phase = Test`, un `Bloc ID` existant et une position libre. L’ajout d’une question notée, la suppression d’une question utilisée par les règles ou le changement de sa bonne réponse exigent une adaptation des règles de calcul ; la publication est bloquée jusque-là.

Configuration Cloudflare Pages **Preview** nécessaire à cette fonctionnalité :

- conserver `AIRTABLE_TOKEN` avec le droit de lecture sur la base `Base Cours` ;
- conserver `QUIZ_AUDIO_ENABLED=true` pour l’actualisation simplifiée réservée à DEV ;
- `QUIZ_ADMIN_TOKEN` reste facultatif pour ce bouton et sert seulement aux anciens endpoints d’aperçu, publication et debug ;
- ajouter la variable `QUIZ_PUBLISH_ENABLED` avec la valeur `true` ;
- créer une base D1 dédiée aux tests et l’associer à Pages avec le nom de liaison `QUIZ_DB` dans l’environnement Preview ;
- redéployer `DEV` après l’ajout de la liaison D1.

Les tables D1 `quiz_publications` et `quiz_dev_sync` sont créées lors de la première actualisation. Le bouton n’envoie aucun code d’administration. Les anciennes routes d’aperçu et de publication exigent toujours `QUIZ_ADMIN_TOKEN` ; la nouvelle route `/api/question-sync` ne peut synchroniser que le contenu de la table Airtable configurée côté serveur, sur l’hôte et la branche DEV.

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

Les quatre questions d’orientation sont présentées ensemble avec un choix Oui/Non. Le test explique dès le départ son fonctionnement adaptatif et permet de passer toute question notée jugée trop difficile. Il enchaîne ensuite des mini-tests adaptatifs de trois questions (niveaux 1 à 4, avec départage en cas de doute) ou de six questions (niveaux 5 à 8).

Au démarrage du mini-test, la page remonte automatiquement pour rendre la progression et la première question visibles. Chaque niveau sélectionnant une vidéo pose trois questions consécutives sur cette vidéo (niveaux 2 et 4 à 8). Les niveaux 5 à 8 ajoutent ensuite trois questions consécutives sur un texte. Les niveaux 1 et 3 n’ont actuellement aucune question vidéo dans la banque Airtable.

Les tests vérifient les cinq routes d’orientation, l’écran groupé Oui/Non, les groupes de trois questions sur un même support, les mini-tests de six questions, le seuil 5/6, la quatrième question de départage des niveaux courts, le resserrement des bornes, les niveaux d’inscription 1 à 9 pour chaque route d’orientation, le redémarrage et la validation du profil. Les tests d’interface utilisent un DOM simulé : ils ne remplacent pas une vérification visuelle dans un navigateur.

## Questions et réponses audio — expérimentation DEV

Fichiers ajoutés ou modifiés pour cette fonctionnalité : `app.js`, `engine.js`, `index.html`, `style.css`, `admin.html`, `admin.js`, `audio-recorder.js`, `audio-experiment.js`, `lib/question-set.js`, `lib/audio-dev.js`, `lib/audio-response.js`, `lib/question-audio.js`, `functions/api/question-set.js`, `functions/api/audio-response.js`, `functions/api/question-audio.js`, `scripts/build-static.mjs`, `scripts/dev-server.mjs`, `scripts/test-audio-live.mjs`, `tests/interface.test.cjs`, `tests/question-set.test.mjs`, `tests/question-audio.test.mjs`, `tests/audio-response.test.mjs`, `tests/audio-recorder.test.cjs`, `audio/README.md`, `audio/question-demo.wav`, ce `README.md` et les aperçus `audio-dev-mobile.png` et `airtable-audio-admin.png`. Les modifications déjà présentes concernant Brevo ne font pas partie de cette implémentation audio.

Le bouton **🎙️ Tester les questions audio (DEV)** apparaît sur l’accueil uniquement lorsque le backend active la fonctionnalité. Il parcourt les questions `Audio DEV` publiées depuis Airtable, avec le lecteur et l’envoi de note vocale au style WhatsApp. Cet essai utilise le même modèle de question, le même moteur et la même interface que le test. Il est isolé du calcul du niveau et ne demande aucune coordonnée. Sans question audio publiée, il propose la démo temporaire **מה עשית אתמול בערב?** (« Qu’as-tu fait hier soir ? »).

L’interface vocale conserve le design WhatsApp : barre fixée en bas, micro rond vert, voyant rouge et durée pendant la prise, réécoute avec onde sonore, corbeille pour refaire la prise et flèche pour envoyer. Le message envoyé apparaît dans une bulle verte avec sa durée et les coches d’envoi. La réécoute de la réponse est proposée avant l’envoi ; après traitement, la bulle est un reçu visuel et le fichier vocal brut est libéré.

### Essai local prêt à lancer

Node.js 24 ou supérieur est nécessaire pour le serveur local et son adaptateur SQLite en mémoire. La clé existante est lue dans `.env.local`, uniquement par le serveur :

```sh
node scripts/build-static.mjs
node scripts/dev-server.mjs
```

Ouvrir http://localhost:8788 et cliquer sur **Tester les questions audio (DEV)**. Écouter la question, enregistrer, arrêter, réécouter, recommencer si besoin, puis envoyer. L’arrêt est automatique après 30 secondes. Le panneau **Debug audio · Administration DEV** apparaît après la validation : question, transcription, verdict, confiance, raison et date. Le serveur local ne sert que les fichiers du dossier `dist` ; les secrets et les fichiers du backend sont inaccessibles. Les routes d’envoi des bilans et recommandations sont désactivées dans cet adaptateur local. Le test de niveau reste utilisable, mais ses envois nécessitent le backend Pages habituel.

Le serveur écoute seulement sur l’ordinateur (`127.0.0.1`). Son stockage D1 simulé utilise SQLite **en mémoire** : l’arrêt du serveur efface les essais. Le navigateur conserve au maximum 50 entrées de debug, effacées au rechargement. La clé n’est ni copiée ni modifiée.

Pour activer aussi la publication Airtable en local, renseigner côté serveur dans `.env.local` : `AIRTABLE_TOKEN` (lecture de la base existante) et `QUIZ_PUBLISH_ENABLED=true`, puis relancer le serveur. La clé OpenAI existante reste utilisée. `/admin.html` indique les connexions manquantes, sans afficher aucun secret. Les publications et fichiers de questions sont également effacés à l’arrêt de ce serveur de test en mémoire.

### Fichier de question et critères

Remplacer `audio/question-demo.wav` par votre enregistrement. La démo fournie est une voix synthétique temporaire en hébreu, générée localement sans appel OpenAI. Pour une question MP3 ou M4A, déposer le fichier dans `audio/` et modifier `audioDemo.media.url` dans `lib/audio-dev.js`. Le lecteur de **question** peut lire WAV, MP3 ou M4A selon le navigateur. Les **réponses** sont toujours encodées en WAV PCM mono, 16 bits, 16 kHz.

Modifier `audioDemo.evaluationCriteria` et `audioDemo.acceptedExamples` dans `lib/audio-dev.js` pour ajuster la démo. Les exemples sont indicatifs ; le modèle évalue le sens et la compétence demandée. Une autre activité au passé peut être acceptée. Une réponse courte peut réussir ; l’accent n’est pas évalué. Une transcription incertaine invite à recommencer.

### Ajouter une question audio dans Airtable

La table existante **Questions test hébreu** contient désormais ces champs :

| Champ | Usage |
| --- | --- |
| Texte | La question à afficher, en hébreu ou en français. |
| Fichier audio (`fldUt7uohuKSxSPzc`) | Facultatif pour une question écrite. Pour une question à écouter : un fichier WAV, MP3 ou M4A, au maximum 5 Mo. |
| Prompt d’évaluation (`fld1YQmkzzvPO0I6R`) | Le critère pédagogique en texte libre, au maximum 4000 caractères. |
| Exemples de réponses acceptables (`fldHaqqleHf5aPkII`) | Facultatif : un exemple par ligne, au maximum 20. |
| Phase | Choisir `Audio DEV` pour l’essai vocal. |
| État éditorial | `Brouillon` pendant la préparation ; `Validée` pour inclure la question dans l’application. `Archivée` l’exclut. |
| Mettre à jour DEV | Lien vers la page contenant le bouton de publication. |

Exemple de prompt : « L’élève décrit en hébreu une activité réalisée hier soir, avec un passé compréhensible. Accepter toute activité cohérente, même courte. Refuser une réponse uniquement au futur ou hors sujet. » Les exemples restent indicatifs.

Une nouvelle ligne `Audio DEV` ne nécessite ni modification du code, ni `Bloc ID`, ni position dans le parcours. `Type` peut être `audio_response` ou vide (déduit de la phase). L’ID Airtable est utilisé si **ID question** est vide. **Points** vaut 1 par défaut ; **Ordre global** permet d’ordonner plusieurs questions. La ligne exemple `dev-audio-airtable-1` contient un fichier synthétique temporaire remplaçable par votre enregistrement ; elle est validée et publiée sur DEV. Les questions audio en brouillon restent exclues de l’aperçu et de la publication. Une question `Validée` incomplète bloque la mise à jour avec la liste des corrections nécessaires.

Cliquer sur le lien **Mettre à jour DEV** dans Airtable, puis sur **Actualiser depuis Airtable**. Aucun code à saisir. Le bouton valide et publie en une seule requête ; **Ouvrir l’application mise à jour** permet ensuite de tester. `/api/question-sync` est réservé à DEV et ne reçoit aucune question, aucun fichier ni paramètre depuis le navigateur : Airtable est la seule source. Un verrou D1 partagé et un délai de 10 secondes évitent les clics simultanés. Une empreinte du contenu conserve la version et les fichiers si rien n’a changé, même lorsque les liens signés Airtable sont renouvelés. Les critères restent côté serveur pour les élèves ; les anciens endpoints d’aperçu et de debug restent protégés par `QUIZ_ADMIN_TOKEN`, conservé côté serveur. L’évaluation ignore tout critère fourni par le navigateur. Un test en cours conserve ses questions ; si une nouvelle version est publiée, il faut recharger avant de soumettre une réponse vocale à cette version.

Les [liens des pièces jointes Airtable expirent](https://support.airtable.com/articles/9671148410-airtable-attachment-url-behavior). À la publication, les fichiers des **questions** sont téléchargés, vérifiés et copiés en fragments dans `quiz_question_audio` dans D1 Preview, avec un maximum de 20 Mo par publication. La copie et la nouvelle version sont enregistrées dans une transaction ; une panne de téléchargement conserve la version précédente. `/api/question-audio` sert les fichiers de la version active et les plages d’octets nécessaires à Safari. Les fichiers des anciennes versions sont purgés après une publication réussie. L’aperçu utilise les liens Airtable fraîchement obtenus : revérifier le brouillon si la page reste ouverte plusieurs heures. Les réponses vocales des élèves ne sont jamais stockées dans cette table.

Pour remplacer une question dans le **test de niveau adaptatif**, conserver son **ID**, son **Bloc ID**, sa **Position**, son **Niveau** et ses **Points** ; choisir `Type = audio_response`, déposer le fichier et renseigner le prompt direct. Vider la bonne réponse et les choix, désactiver Oui/Non et choix multiples. La phase reste `Test`. L’ajout de nouvelles places dans les mini-tests adaptatifs demande encore une modification de leurs règles ; la phase `Audio DEV` sert à expérimenter librement avant cette intégration. L’ancienne configuration audio dans **Données importées (JSON)** reste reconnue pour les premiers essais.

### Texte commun, questions écrites et réponses vocales — DEV

La table Questions test hébreu contient **Groupe support** (`fld43YCo7pAFy0KBR`) et **Texte support** (`flduLdi5wY6UFgPSe`). Les trois lignes `dev-mon-texte-01-q1`, `q2`, `q3` sont un modèle en **Brouillon**, non publié.

1. Coller le texte dans **Texte support** sur une seule ligne du groupe (maximum 12000 caractères).
2. Écrire une question par ligne dans **Texte** ; même **Groupe support** sur toutes les lignes, **Position dans le bloc** = 1, 2, 3, puis les suivantes si besoin.
3. Choisir **Type = audio_response**, **Phase = Audio DEV**, remplir un **Prompt d’évaluation** par question. Le **Fichier audio** est facultatif : il peut rester vide pour une question écrite. Laisser les choix et la bonne réponse JSON vides.
4. Passer au moins trois questions à **Validée**, puis **Actualiser depuis Airtable**. L’actualisation refuse les groupes incomplets, les positions en double et les textes contradictoires ; la publication précédente reste active.
5. Sur l’accueil DEV, sélectionner le groupe dans **Exercice à tester**, puis **Tester les questions audio (DEV)**. Le texte apparaît une seule fois, les questions restent consécutives et le compteur du texte indique 1/3, 2/3, 3/3. Le texte publié est aussi fourni à l’évaluateur avec les critères serveur. Cet essai est séparé du positionnement et n’envoie aucun bilan.

**Ordre global** ordonne les exercices ; les positions dans le bloc ordonnent les questions du groupe, même si leurs ordres globaux sont intercalés avec d’autres exercices. Les brouillons restent exclus. L’intégration de nouvelles questions notées dans le parcours adaptatif demande toujours une mise à jour des règles de sélection.

### Espace de test des brouillons

Ouvrir **`/?lab=1`** sur DEV, ou cliquer sur **Tester mes questions, brouillons inclus** dans l’administration. **Charger mes questions depuis Airtable** prépare un essai des lignes **Audio DEV**, y compris les brouillons, sans changer leur état éditorial ni la publication active. Sélectionner un groupe, puis **Commencer l’essai**. Aucun profil ni bilan n’est demandé. Chaque question attend une réponse vocale ; le laboratoire n’affiche pas de bouton Passer. Les exercices Audio DEV acceptent les niveaux 1 à 9 ; le parcours de placement conserve ses mini-tests de niveaux 1 à 8.

L’espace réutilise le texte hébreu de droite à gauche, l’enregistreur WhatsApp et l’évaluation vocale existants. Le serveur contrôle les groupes et les critères avant chaque chargement. L’aperçu expire après 30 minutes ; recharger depuis Airtable renouvelle les liens temporaires des fichiers de question. Les réponses utilisent la version de cet aperçu et des critères serveur. Le panneau reste masqué avant le premier envoi de réponse, sans message d’attente. Après chaque enregistrement dans le laboratoire, le panneau « Transcription et résultat de l’évaluation » montre la transcription, la sortie JSON du modèle et la décision retenue (y compris une décision incertaine). Seuls les détails de l’enregistrement envoyé sont retournés, après validation de l’origine, de la question et de la version ; aucun accès à l’historique D1 n’est ajouté. Le parcours élève ne reçoit toujours que le verdict. Les détails restent disponibles dans cette page jusqu’à son rechargement, avec une limite de 50 essais. Les erreurs conservent l’essai précédent ; le chargement et la publication partagent un verrou pour éviter les requêtes répétées. L’ancienne route d’aperçu administrateur reste protégée.

### Activation sur le site DEV et essai iPhone

Pour la mettre à disposition sur le site DEV, configurer **uniquement l’environnement Preview** de Cloudflare Pages : `QUIZ_AUDIO_ENABLED=true`, la clé serveur `OPENAI_API_KEY` existante, `QUIZ_ADMIN_TOKEN` et la liaison `QUIZ_DB` déjà utilisée. Déployer ensuite les changements sur la branche **DEV**. Le serveur vérifie à la fois le réglage, la branche `DEV` et l’hôte exact `dev.test-hebreu-lavi.pages.dev`. Le build écrit la branche Cloudflare dans `lib/deployment-context.js` pour les Functions ; cette métadonnée n’est pas servie au navigateur et ne dépend pas de la présence de `CF_PAGES_BRANCH` au runtime. La fonctionnalité reste désactivée sur `test.oulpanlavi.com`, même si le réglage est ajouté par erreur en production. Les autres hôtes de preview ne sont pas activés pour cette V1.

Après ce déploiement DEV, ouvrir **https://dev.test-hebreu-lavi.pages.dev/** dans Safari sur l’iPhone, cliquer sur la démo et autoriser le microphone. Le HTTPS est nécessaire : une adresse HTTP du réseau local ne permet pas cet essai. Tester lecture et réécoute, enregistrement, arrêt, nouvelle prise et validation. Quitter la page ou passer l’application en arrière-plan interrompt et efface l’enregistrement. En cas de refus, réautoriser le microphone dans les réglages du site Safari puis réessayer. Le panneau de debug reste disponible dans le serveur local d’essai. Les endpoints de debug sur Cloudflare demandent toujours une authentification administrateur ; le bouton d’actualisation des questions n’expose ni transcription ni raison aux élèves.

### Traitement, stockage et modèles

`/api/audio-response` n’accepte pour les réponses que le WAV nécessaire à cette V1. Le serveur vérifie la signature RIFF/WAVE, le format PCM mono 16 bits, le débit, la taille (1 Mio maximum), la durée réelle (30 secondes maximum) et le volume mesuré dans les échantillons. Un audio vide ou trop faible ne provoque aucun appel OpenAI. Un enregistrement exploitable provoque un appel de transcription puis un appel d’évaluation, sans nouvelle tentative automatique. Les boutons empêchent la double validation.

- Transcription : `gpt-4o-mini-transcribe`, langue attendue `he`, sortie JSON avec probabilités de transcription. Modifiable via `OPENAI_TRANSCRIPTION_MODEL` avec un modèle compatible avec cette sortie et `include=logprobs`. [Référence officielle OpenAI](https://developers.openai.com/api/reference/resources/audio/subresources/transcriptions/methods/create).
- Évaluation : `OPENAI_AUDIO_EVALUATION_MODEL`, sinon `OPENAI_MODEL`, sinon `gpt-6-luna` comme l’intégration existante. Appel Responses avec `store:false`, transcription dans un message utilisateur séparé des instructions et critères serveur, et schéma JSON strict. Les modèles de remplacement doivent accepter les options Responses utilisées. [Sorties structurées OpenAI](https://developers.openai.com/api/docs/guides/structured-outputs).
- Verdict : seulement `correct`, `incorrect`, `uncertain`, avec `confidence` entre 0 et 1 et `reason`. Une décision sous 0,75 devient `uncertain`. Une transcription dont la moyenne géométrique des probabilités est sous 0,5 est également incertaine. Ces seuils sont des heuristiques DEV, pas des probabilités pédagogiques calibrées.
- L’élève voit **✅ Juste**, **❌ Faux**, ou **🎙️ Nous n’avons pas réussi à analyser correctement votre réponse. Merci de réessayer.** Une incertitude ou une erreur technique n’enregistre aucune réponse dans le moteur, ne change aucun score et ne fait pas avancer le mini-test. Passer volontairement une question garde le comportement existant du test.
- D1 conserve dans `audio_response_attempts` la question, la transcription, le verdict, la confiance, la raison et la date, sans identité d’élève et sans fichier vocal. Les entrées de plus de sept jours sont purgées lors du prochain enregistrement. Une panne D1 ne transforme pas un verdict en erreur. Le debug indique si l’entrée a été conservée. Le fichier brut reste en mémoire pendant le traitement puis est libéré ; aucun stockage de fichier n’est créé.

Consultation administrative des essais dans D1 **Preview** :

```sql
SELECT question, transcription, status, confidence, reason, answered_at
FROM audio_response_attempts ORDER BY answered_at DESC LIMIT 30;
```

### Vérification

```sh
node tests/engine.test.cjs
node tests/interface.test.cjs
node tests/recommendations.test.mjs
node tests/question-set.test.mjs
node --test tests/results.test.mjs tests/audio-response.test.mjs tests/audio-recorder.test.cjs tests/question-audio.test.mjs
node scripts/build-static.mjs
```

Les tests sans API vérifient le verrou DEV, le schéma, les critères serveur, le format et la durée des fichiers, le silence, le son faible, les erreurs de transcription/API, l’absence de nouvelle tentative, le score, la permission refusée, l’arrêt après 30 secondes, l’arrière-plan et le nettoyage du micro. `scripts/test-audio-live.mjs --live` effectue **cinq essais payants** avec des voix synthétiques locales sur macOS : réponse correcte, formulation différente, futur incorrect, hors sujet et réponse très courte. Ne pas l’exécuter automatiquement. Les fichiers de ces essais sont temporaires et supprimés.

L’affichage a été contrôlé dans le navigateur à 390 × 844 pixels, sans débordement horizontal. Cela ne remplace pas une validation du microphone sur un véritable iPhone/Safari. Le serveur local réutilise les mêmes handlers Pages Functions ; les essais locaux ne valident pas un déploiement Cloudflare.

Validation Cloudflare DEV du 4 octobre 2026 : branche `DEV`, commit `c7a229d`, déploiement réussi ; Preview configuré avec `QUIZ_AUDIO_ENABLED=true`, les clés Airtable et OpenAI existantes et D1 Preview. Publication confirmée de 72 questions du parcours, 3 de profil et 1 audio. Le fichier copié dans D1 est lisible (WAV et HTTP Range 206), le lecteur du navigateur fonctionne, et une réponse hébraïque synthétique envoyée à `/api/audio-response` a reçu `correct`, confiance `0.99`. La production n’a pas été modifiée. Le microphone d’un véritable iPhone reste à tester.

Les consignes vocales communes imposent un minimum d’expression en hébreu : une réponse majoritairement en français, ou des phrases inintelligibles malgré une transcription fiable, peuvent recevoir 0 point. Les fautes grammaticales et quelques mots français ponctuels restent tolérés si l’essentiel est exprimé en hébreu compréhensible. La transcription conserve les mots français au lieu de demander uniquement des caractères hébreux. Une panne audio ou une transcription peu fiable reste une décision incertaine, sans pénalité.
