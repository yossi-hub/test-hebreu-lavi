"""Usage: python3 scripts/import-typeform.py /chemin/export.json"""
import json, sys
from pathlib import Path
source = json.loads(Path(sys.argv[1]).read_text())
questions, blocks = [], []
level = 1
self_assessment_questions = {
    '283a501f-c840-4b74-9e88-545152769ef9':
        'Tu sais lire des mots et des phrases simples en hébreu sans nikoud et en comprendre le sens ?',
    '547b1f37-9fc4-4f7b-8d47-73297c1dd2aa':
        'Tu sais te présenter simplement : dire ton nom, ton pays, la langue que tu parles, ce que tu étudies et où tu travailles ?',
    '1933dae8-da62-464c-a72d-63141c72873b':
        'Tu sais comprendre un petit texte simple sur une personne et répondre à quelques questions ?',
    'ce09c281-36db-4e76-ba69-778b64eb6172':
        'Tu sais parler de ta vie quotidienne avec des verbes simples comme manger, boire, travailler, étudier, lire ou voyager ?',
}
for position, field in enumerate(source['fields']):
    if position == 0:  # Le profil existant conserve son ordre et ses validations.
        continue
    children = field.get('properties', {}).get('fields', [field])
    scored = any('scoring' in child for child in children)
    block = {'id': field['ref'], 'questions': [], 'niveau': level if scored else None}
    if field['ref'] == '97c2ebd6-8ab3-4a23-a147-704aedcc9ede':
        block['stopOnNegative'] = True
    if len(field['title'].strip()) > 150 and field['type'] == 'inline_group':
        block['passage'] = field['title'].strip()
    for child in children:
        props = child.get('properties', {})
        q = {'id': child['ref'], 'texte': child['title'].strip(), 'type': 'qcm',
             'choix': [], 'bonneReponse': None, 'points': 0,
             'niveau': level if 'scoring' in child else None,
             'obligatoire': child.get('validations', {}).get('required', False)}
        if child['type'] == 'multiple_choice':
            q['choix'] = [{'libelle': c['label'], 'valeur': c['ref']} for c in props['choices']]
            q['multiple'] = props.get('allow_multiple_selection', False)
            q['aleatoire'] = props.get('randomize', False)
        elif child['type'] == 'rating':
            q['texte'] = self_assessment_questions[child['ref']]
            q['type'] = 'text'
            q['langue'] = 'fr'
            q['reponseOuiNon'] = True
            q['obligatoire'] = True
            q['instruction'] = 'Écris oui ou non.'
        elif child['type'] == 'yes_no':
            q['choix'] = [{'libelle': 'Oui', 'valeur': True}, {'libelle': 'Non', 'valeur': False}]
        elif child['type'] == 'short_text':
            q['type'] = 'text'
            q['langue'] = 'fr'
        else:
            raise ValueError('Type non pris en charge : ' + child['type'])
        if child['ref'] == '01bd29a5-dc50-4012-959f-d415559996c6':
            q['type'] = 'text'
            q['langue'] = 'fr'
            q['reponseConversationnelle'] = True
            q['instruction'] = 'Écris naturellement : en présentiel, en distanciel ou les deux.'
        if child['ref'] == '8982d9c6-c435-48ee-8d81-a50df364117a':
            q['texte'] = 'Bravo {{field:358f8a5f-6233-46f7-acc7-980614b18b82}}, tu as passé le premier niveau. Souhaites-tu continuer ?'
        if child['ref'] == '0eb94c71-79ab-4c98-b1c4-5279a8bd85c4':
            q['texte'] = 'Wow, tu viens de passer le deuxième niveau. Souhaites-tu continuer ? Réponds « non » si tu sens que tu es à bout…'
        if child.get('scoring'):
            scoring = child['scoring']['choices_all_correct']
            assert len(scoring['choices']) == 1
            q['bonneReponse'] = scoring['choices'][0]
            q['points'] = scoring['score']
            assert any(c['valeur'] == q['bonneReponse'] for c in q['choix'])
        attachment = child.get('attachment', field.get('attachment'))
        if attachment:
            q['media'] = {'type': attachment['type'], 'url': attachment['href'] + ('/image/default' if attachment['type'] == 'image' else '')}
        if props.get('description'):
            q['instruction'] = props['description']
        block['questions'].append(q['id'])
        questions.append(q)
    blocks.append(block)
    if field['type'] == 'yes_no' and not scored:
        block['transition'] = True
        level += 1
rules = {entry['ref']: entry['actions'] for entry in source.get('logic', [])}
# L’alphabet est demandé avant les quatre autoévaluations.
alphabet_id = 'bfff1062-27eb-455c-bb6b-ae72d17c0495'
assessment_block = next(block for block in blocks if block['id'] == '97c2ebd6-8ab3-4a23-a147-704aedcc9ede')
profile_block = next(block for block in blocks if block['id'] == '0aa0f824-faae-4509-baf5-f9bb82a8abed')
profile_block['questions'].remove(alphabet_id)
assessment_block['questions'].insert(0, alphabet_id)
# Les inline_groups sont traités comme une page : règles du groupe après ses enfants.
# Les sauts isolés d’enfants vers la fin restent conservés à titre de référence.
config = {'blocs': blocks, 'regles': {b['id']: rules.get(b['id'], []) for b in blocks},
          'variables': source['variables'],
          'reglesEnfantsSource': {ref: actions for ref, actions in rules.items() if ref not in {b['id'] for b in blocks}}}

# La ville et le mode d’apprentissage ne sont plus demandés. Leurs règles de
# routage sont exécutées directement après l’alphabet et les autoévaluations.
config['regles'][assessment_block['id']] = config['regles'].pop(profile_block['id'])
config['blocs'].remove(profile_block)

# Les quatre autoévaluations Oui/Non remplacent les notes de 3 étoiles.
def adapt_self_assessment_conditions(value):
    if isinstance(value, dict):
        variables = value.get('vars', [])
        if (value.get('op') == 'equal' and len(variables) == 2
                and variables[0].get('type') == 'field'
                and variables[0].get('value') in self_assessment_questions
                and variables[1].get('type') == 'constant'
                and variables[1].get('value') == 3):
            variables[1]['value'] = True
        for child_value in value.values():
            adapt_self_assessment_conditions(child_value)
    elif isinstance(value, list):
        for child_value in value:
            adapt_self_assessment_conditions(child_value)

adapt_self_assessment_conditions(config)
# Correction explicitement demandée : la dernière bonne réponse ne doit pas ajouter une erreur.
for actions in config['regles'].values():
    for action in actions:
        condition = action.get('condition', {})
        if (action['action'] == 'add' and condition.get('op') == 'is'
                and condition['vars'][0].get('value') == '5ed6eb50-c8c7-4b49-8e6d-1050866979a2'):
            condition['op'] = 'is_not'
Path('questions.js').write_text('// Questions et parcours importés de Typeform. Voir README.md.\nconst questions = ' + json.dumps(questions, ensure_ascii=False, indent=2) + ';\n\nconst parcours = ' + json.dumps(config, ensure_ascii=False, indent=2) + ';\n')
print(f'{sum(q["points"] > 0 for q in questions)} questions notées, {len(questions)} étapes, {len(blocks)} blocs.')
