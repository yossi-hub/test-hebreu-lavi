// Questions et parcours importés de Typeform. Voir README.md.
const questions = [
  {
    "id": "283a501f-c840-4b74-9e88-545152769ef9",
    "texte": "Tu sais lire des mots et des phrases simples en hébreu sans nikoud et en comprendre le sens ?",
    "type": "text",
    "choix": [],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": true,
    "langue": "fr",
    "reponseOuiNon": true,
    "instruction": "Écris oui ou non."
  },
  {
    "id": "547b1f37-9fc4-4f7b-8d47-73297c1dd2aa",
    "texte": "Tu sais te présenter simplement : dire ton nom, ton pays, la langue que tu parles, ce que tu étudies et où tu travailles ?",
    "type": "text",
    "choix": [],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": true,
    "langue": "fr",
    "reponseOuiNon": true,
    "instruction": "Écris oui ou non."
  },
  {
    "id": "1933dae8-da62-464c-a72d-63141c72873b",
    "texte": "Tu sais comprendre un petit texte simple sur une personne et répondre à quelques questions ?",
    "type": "text",
    "choix": [],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": true,
    "langue": "fr",
    "reponseOuiNon": true,
    "instruction": "Écris oui ou non."
  },
  {
    "id": "ce09c281-36db-4e76-ba69-778b64eb6172",
    "texte": "Tu sais parler de ta vie quotidienne avec des verbes simples comme manger, boire, travailler, étudier, lire ou voyager ?",
    "type": "text",
    "choix": [],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": true,
    "langue": "fr",
    "reponseOuiNon": true,
    "instruction": "Écris oui ou non."
  },
  {
    "id": "eb133ca8-54dc-489f-9b9a-2f1ab4553326",
    "texte": "Dans quelle ville habites-tu?",
    "type": "text",
    "choix": [],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": true,
    "langue": "fr"
  },
  {
    "id": "01bd29a5-dc50-4012-959f-d415559996c6",
    "texte": "D'ordre général, préfères tu apprendre l'hébreu :",
    "type": "text",
    "choix": [
      {
        "libelle": "En présentiel",
        "valeur": "e77011d2-14bd-4709-8fb8-cf179843f713"
      },
      {
        "libelle": "En distanciel",
        "valeur": "33505362-5908-4e7c-a575-fa4d1fb97dc0"
      }
    ],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": false,
    "langue": "fr",
    "reponseConversationnelle": true,
    "instruction": "Écris naturellement : en présentiel ou en distanciel."
  },
  {
    "id": "bfff1062-27eb-455c-bb6b-ae72d17c0495",
    "texte": "Connais-tu l'alphabet hébraïque et est tu capable de lire en hébreu ?",
    "type": "qcm",
    "choix": [
      {
        "libelle": "Oui",
        "valeur": true
      },
      {
        "libelle": "Non",
        "valeur": false
      }
    ],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": false
  },
  {
    "id": "353a37e5-2d45-4bec-a856-a8312586b6f0",
    "texte": "?שלום! איך קוראים לך",
    "type": "qcm",
    "choix": [
      {
        "libelle": "אני גר בתל אביב",
        "valeur": "6c8a809e-f84d-4ebc-acc8-bd54942382a1"
      },
      {
        "libelle": "אני דויד",
        "valeur": "b8ccb0eb-f400-4127-9473-ca8d4bfa4344"
      },
      {
        "libelle": "אני שותה קפה",
        "valeur": "0581d697-4047-49f3-a00a-ca440972a3f3"
      },
      {
        "libelle": "אני מצרפת",
        "valeur": "156bb367-c523-4468-82ac-862495d434dc"
      }
    ],
    "bonneReponse": "b8ccb0eb-f400-4127-9473-ca8d4bfa4344",
    "points": 1,
    "niveau": 1,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "75984511-b0a9-48e7-9690-c1d7c51d014a",
    "texte": "?מאיפה את",
    "type": "qcm",
    "choix": [
      {
        "libelle": "אני גרה בלונדון",
        "valeur": "021bfc7e-7041-4ce8-87fa-793dcdb25c1c"
      },
      {
        "libelle": "אני מפריז",
        "valeur": "062c8e3f-a8ad-4b82-9f4e-efff78299364"
      },
      {
        "libelle": "אני עובדת בבית ספר",
        "valeur": "7e7e0e6a-f696-45f7-8a7b-c4b6e977bd03"
      },
      {
        "libelle": "אני שותה מיץ",
        "valeur": "c2cf646b-d4a8-432c-9903-5f80b8bc8036"
      }
    ],
    "bonneReponse": "062c8e3f-a8ad-4b82-9f4e-efff78299364",
    "points": 1,
    "niveau": 1,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "7d872815-fb07-4dad-970a-c12a59b77380",
    "texte": "?מה הוא עושה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "הוא עובד",
        "valeur": "fe6e8015-edcc-4364-8750-75167f8b18d7"
      },
      {
        "libelle": "הוא שותה",
        "valeur": "b67655d9-e3b5-4abb-a5c6-467b1a393159"
      },
      {
        "libelle": "הוא אוכל",
        "valeur": "fe84b7a4-e88c-457b-826a-ab7381d0e25f"
      },
      {
        "libelle": "הוא טס",
        "valeur": "beef09a3-2a37-4763-8087-5d2c6e3a474d"
      }
    ],
    "bonneReponse": "fe6e8015-edcc-4364-8750-75167f8b18d7",
    "points": 1,
    "niveau": 1,
    "obligatoire": true,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "image",
      "url": "https://images.typeform.com/images/KgahTVSxuTaS/image/default"
    }
  },
  {
    "id": "f6c715f0-8b76-420b-8437-e916ad5dd2a2",
    "texte": "?מה היא עושה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "היא אוכלת",
        "valeur": "b185b89d-b48d-421f-bec5-bf4e3582d705"
      },
      {
        "libelle": "היא שותה",
        "valeur": "7ee5d900-b2d0-4480-8ea0-6b08c60870eb"
      },
      {
        "libelle": "היא טסה",
        "valeur": "e1e2fc18-0763-41ce-ae25-3740728ae4a5"
      },
      {
        "libelle": "היא לומדת",
        "valeur": "f79c242b-5b6c-4b69-9f36-5a13abd0c32d"
      }
    ],
    "bonneReponse": "7ee5d900-b2d0-4480-8ea0-6b08c60870eb",
    "points": 1,
    "niveau": 1,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "image",
      "url": "https://images.typeform.com/images/BbhTRPFbtVLD/image/default"
    }
  },
  {
    "id": "23c1d99b-11e2-45bd-a9f5-c46687c852c5",
    "texte": "?מה זה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "בית ספר",
        "valeur": "dc3d35c5-765d-453a-9585-e30c66f379bb"
      },
      {
        "libelle": "ארוחת בוקר",
        "valeur": "cd15b134-956a-4a28-a1ff-aa6cfdf3a33e"
      },
      {
        "libelle": "אוניברסיטה",
        "valeur": "b1b3177b-7e35-4f21-8a06-c94968fff984"
      },
      {
        "libelle": "בית חולים",
        "valeur": "3345763d-983f-4fe3-9c05-fda3fd6792cf"
      }
    ],
    "bonneReponse": "cd15b134-956a-4a28-a1ff-aa6cfdf3a33e",
    "points": 1,
    "niveau": 1,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "image",
      "url": "https://images.typeform.com/images/mGopuHQzDmTy/image/default"
    }
  },
  {
    "id": "f73924a9-685c-404a-815a-d9fc71dc8da8",
    "texte": "?מה הוא עושה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "הוא מדבר",
        "valeur": "5b1ae361-304f-4316-ab2d-2eec2a936a87"
      },
      {
        "libelle": "הוא לומד",
        "valeur": "3e627082-8c84-499f-a913-ecaa4257c7c3"
      },
      {
        "libelle": "הוא שותה",
        "valeur": "6a7459be-9a98-44c4-9673-54055f41b886"
      },
      {
        "libelle": "הוא טס",
        "valeur": "22309c9c-f3ae-4334-871f-4bef831d94f4"
      }
    ],
    "bonneReponse": "3e627082-8c84-499f-a913-ecaa4257c7c3",
    "points": 1,
    "niveau": 1,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "image",
      "url": "https://images.typeform.com/images/SndYiunDunna/image/default"
    }
  },
  {
    "id": "79016f08-b167-4aea-b25f-b7d493377d79",
    "texte": "שלום! אני דויד. אני ___ צרפת.",
    "type": "qcm",
    "choix": [
      {
        "libelle": "ל",
        "valeur": "5c2ad096-f539-46ed-8875-4686ef31cbd1"
      },
      {
        "libelle": "מ־",
        "valeur": "dde914a3-ef19-4ad1-a1e6-4b5a84e4cf5a"
      },
      {
        "libelle": "שותה",
        "valeur": "70240212-c861-4c58-ac17-8abb8d8f3a4c"
      },
      {
        "libelle": "לומד",
        "valeur": "578f48bb-d915-4e8b-bb26-bc098e60d563"
      }
    ],
    "bonneReponse": "dde914a3-ef19-4ad1-a1e6-4b5a84e4cf5a",
    "points": 1,
    "niveau": 1,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "09fb0a26-3791-46eb-9720-ac252185de1b",
    "texte": "?היי, מה נשמע",
    "type": "qcm",
    "choix": [
      {
        "libelle": "אני גר בחיפה",
        "valeur": "09f8f446-1765-4169-9e6b-aac13b635aca"
      },
      {
        "libelle": "!בסדר",
        "valeur": "38529394-5fd2-43e8-905e-46255dcd9924"
      },
      {
        "libelle": "אני צרפתי",
        "valeur": "27e20ebe-2627-4412-b706-672775d474a2"
      },
      {
        "libelle": "אני עובד",
        "valeur": "19ca51f1-89cf-4ab6-b84e-b65fa3e545f0"
      }
    ],
    "bonneReponse": "38529394-5fd2-43e8-905e-46255dcd9924",
    "points": 1,
    "niveau": 1,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "8982d9c6-c435-48ee-8d81-a50df364117a",
    "texte": "Bravo {{field:358f8a5f-6233-46f7-acc7-980614b18b82}}, tu as passé le premier niveau. Souhaites-tu continuer ?",
    "type": "qcm",
    "choix": [
      {
        "libelle": "Oui",
        "valeur": true
      },
      {
        "libelle": "Non",
        "valeur": false
      }
    ],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": false
  },
  {
    "id": "e99d6729-4b30-4262-969d-6a3fb81ed4d6",
    "texte": "?מה הם עושים",
    "type": "qcm",
    "choix": [
      {
        "libelle": "הוא לומד",
        "valeur": "882afacf-4ff8-4a73-bbca-11d73b46c836"
      },
      {
        "libelle": "הם עובדים",
        "valeur": "d94cd757-c4ce-4e82-9f9b-c5d86e1e96e7"
      },
      {
        "libelle": "הם מטיילים",
        "valeur": "eda13f6d-eaa0-4153-a838-e294b1569011"
      },
      {
        "libelle": "הוא טס",
        "valeur": "6f81106d-ee0c-4df6-bd8b-7f0ab00d4469"
      }
    ],
    "bonneReponse": "d94cd757-c4ce-4e82-9f9b-c5d86e1e96e7",
    "points": 1,
    "niveau": 2,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "image",
      "url": "https://images.typeform.com/images/TerlwYNuhWJN/image/default"
    }
  },
  {
    "id": "d5d5f7ce-26b7-4c9f-9b6f-bbd130a8bba3",
    "texte": "?מה הן עושות",
    "type": "qcm",
    "choix": [
      {
        "libelle": "הן עובדות בבית קפה",
        "valeur": "6d49b977-2d40-4fe0-a65b-d4de482e7476"
      },
      {
        "libelle": "הן מטיילות בפריז",
        "valeur": "fa0f8e15-dd47-48ad-84ee-39ae58c0656c"
      },
      {
        "libelle": "הן שותות יין לבן",
        "valeur": "93b7ecbb-cde2-4bb4-8e00-fc596072bfc6"
      },
      {
        "libelle": "היא שותה יין אדום",
        "valeur": "048d5a83-e3ca-4f43-b71c-8118826ce2f6"
      }
    ],
    "bonneReponse": "93b7ecbb-cde2-4bb4-8e00-fc596072bfc6",
    "points": 1,
    "niveau": 2,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "image",
      "url": "https://images.typeform.com/images/FqWZuwPbPsJg/image/default"
    }
  },
  {
    "id": "e2532221-f1f5-4584-a76f-d0d53be495a3",
    "texte": "\"?דויד: \"שלום! מי אתם",
    "type": "qcm",
    "choix": [
      {
        "libelle": "אני רון ויוסי",
        "valeur": "75d5a2d6-0817-43ec-b405-00ec732aa870"
      },
      {
        "libelle": "אנחנו רון ויוסי",
        "valeur": "ee09e69e-e7cf-4f0f-9fbf-eb18238572e6"
      },
      {
        "libelle": "הם רון ויוסי",
        "valeur": "fa50459b-c79f-450a-b144-bd691055857f"
      },
      {
        "libelle": "אתן רון ויוסי",
        "valeur": "2ad78c7e-01f5-411b-bdae-6170e57ccb80"
      }
    ],
    "bonneReponse": "ee09e69e-e7cf-4f0f-9fbf-eb18238572e6",
    "points": 1,
    "niveau": 2,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "03d9a516-adb7-4352-b865-68cd057a685c",
    "texte": "?מה הן עושות",
    "type": "qcm",
    "choix": [
      {
        "libelle": "הן שותות קפה",
        "valeur": "6bdaaa8d-a07e-43ed-99d2-131f62716596"
      },
      {
        "libelle": "הן עובדות בבית ספר",
        "valeur": "dbb63ad1-f21d-4644-9e84-d6317ac5eeca"
      },
      {
        "libelle": "הן עובדות בבית חולים",
        "valeur": "dd4f3660-94d4-4ce4-80c4-cba774fc95fd"
      },
      {
        "libelle": "היא לא עובדת",
        "valeur": "e2569397-abeb-415e-93a7-f8522646e540"
      }
    ],
    "bonneReponse": "dd4f3660-94d4-4ce4-80c4-cba774fc95fd",
    "points": 1,
    "niveau": 2,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "image",
      "url": "https://images.typeform.com/images/kiGyeBaHwUec/image/default"
    }
  },
  {
    "id": "16f5a474-b09f-4239-96e5-738dcf92eb84",
    "texte": "?מה הם רוצים לעשות",
    "type": "qcm",
    "choix": [
      {
        "libelle": "הם רוצים לעבוד",
        "valeur": "b54262bb-12b7-485c-b328-991c03766258"
      },
      {
        "libelle": "הם רוצים לטוס",
        "valeur": "bf89b6ea-00c1-4e99-8e9e-95479b1663cc"
      },
      {
        "libelle": "הם רוצים לשתות",
        "valeur": "c77fe438-b26a-4461-8a75-a9bd49dad2c4"
      },
      {
        "libelle": "הם רוצים ללמוד",
        "valeur": "3bbceebd-b33a-4060-998e-5d0e7a4e9347"
      }
    ],
    "bonneReponse": "bf89b6ea-00c1-4e99-8e9e-95479b1663cc",
    "points": 1,
    "niveau": 2,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "image",
      "url": "https://images.typeform.com/images/dogaOvkBCmLB/image/default"
    }
  },
  {
    "id": "aba182df-d9e1-4f89-892e-ca4d5e18a87a",
    "texte": "?מי מדברת",
    "type": "qcm",
    "choix": [
      {
        "libelle": "דנה",
        "valeur": "933610cf-9289-4b53-bc7d-23eaceb4a01e"
      },
      {
        "libelle": "שרה",
        "valeur": "f1a8ef91-5bdb-4667-a204-11a6aa93e7bf"
      }
    ],
    "bonneReponse": "f1a8ef91-5bdb-4667-a204-11a6aa93e7bf",
    "points": 1,
    "niveau": 2,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/n4UwcAsBcOc"
    }
  },
  {
    "id": "878251c4-943b-4a36-b04b-3ffae1149f8d",
    "texte": "?איפה היא גרה ומאיפה היא",
    "type": "qcm",
    "choix": [
      {
        "libelle": "היא גרה בחיפה, היא מפריז",
        "valeur": "339c630f-0dbc-4df5-b34d-f7de844493a1"
      },
      {
        "libelle": "היא גרה בתל אביב, היא ממרסיי",
        "valeur": "c295f5ef-f921-4849-88f9-1487500c4c76"
      }
    ],
    "bonneReponse": "c295f5ef-f921-4849-88f9-1487500c4c76",
    "points": 1,
    "niveau": 2,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/n4UwcAsBcOc"
    }
  },
  {
    "id": "461c8c21-8667-411f-9ea0-4651c28be52b",
    "texte": "?איפה היא שותה ואוכלת בבוקר",
    "type": "qcm",
    "choix": [
      {
        "libelle": "בבית",
        "valeur": "a7e409dd-a8bb-490f-b497-8198c8285b4b"
      },
      {
        "libelle": "בבית קפה",
        "valeur": "a133997f-67b8-450f-82b7-d2112e7a6e71"
      }
    ],
    "bonneReponse": "a133997f-67b8-450f-82b7-d2112e7a6e71",
    "points": 1,
    "niveau": 2,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/n4UwcAsBcOc"
    }
  },
  {
    "id": "52bbe157-368b-4628-927d-e81f0e3b02a7",
    "texte": "?מה היא עושה בחיים",
    "type": "qcm",
    "choix": [
      {
        "libelle": "היא לומדת",
        "valeur": "de901e2f-b935-472d-9992-fdb25fd25433"
      },
      {
        "libelle": "היא עובדת",
        "valeur": "0396b1c5-1131-4aa4-a1f6-d8af599193fe"
      }
    ],
    "bonneReponse": "de901e2f-b935-472d-9992-fdb25fd25433",
    "points": 1,
    "niveau": 2,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/n4UwcAsBcOc"
    }
  },
  {
    "id": "0eb94c71-79ab-4c98-b1c4-5279a8bd85c4",
    "texte": "Wow, tu viens de passer le deuxième niveau. Souhaites-tu continuer ? Réponds « non » si tu sens que tu es à bout…",
    "type": "qcm",
    "choix": [
      {
        "libelle": "Oui",
        "valeur": true
      },
      {
        "libelle": "Non",
        "valeur": false
      }
    ],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": false
  },
  {
    "id": "5a773145-2196-4bd2-a8ed-6e6fbeec249a",
    "texte": "?איפה אלה גרה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "בפריז",
        "valeur": "916a2ba7-c06a-4cc4-834f-51dfeaef28cb"
      },
      {
        "libelle": "בירושלים",
        "valeur": "3cbcccb4-c5a0-42c2-9599-d51c6e12b4a1"
      },
      {
        "libelle": "בתל אביב",
        "valeur": "d7b8f677-ce8e-48aa-a919-07a78216020d"
      },
      {
        "libelle": "בחיפה",
        "valeur": "4cf92346-e4b0-46e0-aac5-622ab795a72f"
      }
    ],
    "bonneReponse": "3cbcccb4-c5a0-42c2-9599-d51c6e12b4a1",
    "points": 1,
    "niveau": 3,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "77ee8816-b02a-4c9e-8cd9-6958ee50a348",
    "texte": "?איפה אלה עובדת",
    "type": "qcm",
    "choix": [
      {
        "libelle": "בבית חולים",
        "valeur": "21cd098a-a16e-49cf-b751-2d6c5bae444b"
      },
      {
        "libelle": "בבית קפה",
        "valeur": "ee67e191-c6a2-4dca-a22a-53d8a19b125c"
      },
      {
        "libelle": "בבית ספר",
        "valeur": "fb8ff699-1a19-4853-9216-e07e1b300e7b"
      },
      {
        "libelle": "באוניברסיטה",
        "valeur": "68648eae-5b7b-4719-b76d-37a89500c7bd"
      }
    ],
    "bonneReponse": "ee67e191-c6a2-4dca-a22a-53d8a19b125c",
    "points": 1,
    "niveau": 3,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "34d9ff13-4172-4492-9c89-9db75b4f67e3",
    "texte": "?מה יש בבית הקפה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "הרבה תלמידים",
        "valeur": "6798f753-afb2-4af6-ad9c-fc1723c654ed"
      },
      {
        "libelle": "הרבה אנשים",
        "valeur": "17ae6970-bc8d-4905-908d-e32dc3de193e"
      },
      {
        "libelle": "הרבה ספרים",
        "valeur": "47981f27-d1ad-48ff-9183-c89639e0e8bd"
      },
      {
        "libelle": "הרבה חברים",
        "valeur": "205922c3-6cf5-4d04-a0f2-e14428802fbf"
      }
    ],
    "bonneReponse": "17ae6970-bc8d-4905-908d-e32dc3de193e",
    "points": 1,
    "niveau": 3,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "d9c55183-b586-4b26-8242-8c6ab018efdd",
    "texte": "?מה אלה אוהבת לעשות בבית הקפה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "לדבר עם אנשים",
        "valeur": "e3ba64d6-152d-4360-b8cd-6c01f360458a"
      },
      {
        "libelle": "לקרוא עיתון",
        "valeur": "e628f8be-ffd4-41c4-8ee0-ac114c683fa7"
      },
      {
        "libelle": "לשמוע רדיו",
        "valeur": "9e6c38ab-b15b-4e16-a83f-5bc8918b3fcd"
      },
      {
        "libelle": "לנסוע באוטובוס",
        "valeur": "b11bb1ff-2902-4ec1-b113-4684a430abd1"
      }
    ],
    "bonneReponse": "e3ba64d6-152d-4360-b8cd-6c01f360458a",
    "points": 1,
    "niveau": 3,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "69eff7a3-caad-43f9-8183-8c5a48221117",
    "texte": "?מה עוד אלה עושה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "היא רופאה",
        "valeur": "9e4803ff-cbf7-4769-99c6-c1587aefdf29"
      },
      {
        "libelle": "היא סטודנטית",
        "valeur": "2b254fbc-b443-4c55-8258-f7e83d909ff5"
      },
      {
        "libelle": "היא מורה",
        "valeur": "82d445ae-130b-480f-beac-3d7dede6c069"
      },
      {
        "libelle": "היא מלצרית",
        "valeur": "6a967a26-1e7f-44d8-9022-6c0af4e50c38"
      }
    ],
    "bonneReponse": "2b254fbc-b443-4c55-8258-f7e83d909ff5",
    "points": 1,
    "niveau": 3,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "58d3f038-de5f-4cbf-87a4-7bb21c7ca566",
    "texte": "?מה אלה לומדת",
    "type": "qcm",
    "choix": [
      {
        "libelle": "עברית",
        "valeur": "bab2ae48-983f-4bb2-b1e1-a2035e98af23"
      },
      {
        "libelle": "מתמטיקה",
        "valeur": "058d9219-2986-43dd-9765-95568fd4cd65"
      },
      {
        "libelle": "ספרות",
        "valeur": "fe232a95-2c7e-492f-ae1d-53b829a32927"
      },
      {
        "libelle": "רפואה",
        "valeur": "c2685dc2-9695-4aaf-bab8-9cc4c28bf8bb"
      }
    ],
    "bonneReponse": "fe232a95-2c7e-492f-ae1d-53b829a32927",
    "points": 1,
    "niveau": 3,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "f611c470-6cb3-4a75-8780-44998039019d",
    "texte": "ביום שבת אלה אוהבת גם _______ וגם _________",
    "type": "qcm",
    "choix": [
      {
        "libelle": "גם לעבוד בבית קפה וגם לדבר עם אנשים",
        "valeur": "fe553a06-cf50-4346-bb35-4df754caea50"
      },
      {
        "libelle": "גם לקום מאוחר וגם לשמוע מוזיקה",
        "valeur": "daaf51f4-a14a-4105-831f-0d66ec102299"
      },
      {
        "libelle": "גם ללמוד ספרות וגם לקרוא עיתון",
        "valeur": "c169c1f2-72a5-46c5-ab71-eaa41ba8e292"
      },
      {
        "libelle": "גם לשתות מיץ וגם לנסוע לעבודה",
        "valeur": "9d622409-9e42-4133-8baa-49d6553a7584"
      }
    ],
    "bonneReponse": "daaf51f4-a14a-4105-831f-0d66ec102299",
    "points": 1,
    "niveau": 3,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "717115c8-ef1f-4408-92a0-2ced224873f7",
    "texte": "?מה אלה לא יודעת",
    "type": "qcm",
    "choix": [
      {
        "libelle": "היא לא יודעת איפה לגור",
        "valeur": "3a311c7a-54f9-41a8-82a8-6ed458e4996a"
      },
      {
        "libelle": "היא לא יודעת מה לעשות בחיים",
        "valeur": "45aac0e4-1965-4e24-9e58-69902068f1f5"
      },
      {
        "libelle": "היא לא יודעת איפה לגור והיא לא יודעת מה לעשות בחיים",
        "valeur": "653d789c-2daf-42b9-8800-eabb42f3d07a"
      },
      {
        "libelle": "היא לא יודעת איפה בית הקפה",
        "valeur": "a1c54747-396f-4c32-b3f4-e96a7b52c56a"
      }
    ],
    "bonneReponse": "653d789c-2daf-42b9-8800-eabb42f3d07a",
    "points": 1,
    "niveau": 3,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "40e49b2e-f3cb-418e-a393-a32593404b5f",
    "texte": "{{field:358f8a5f-6233-46f7-acc7-980614b18b82}}, le troisième niveau est dans la poche 🎉.\nOn continue ? Dites non si ça commence à être trop compliqué.",
    "type": "qcm",
    "choix": [
      {
        "libelle": "Oui",
        "valeur": true
      },
      {
        "libelle": "Non",
        "valeur": false
      }
    ],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": false
  },
  {
    "id": "62161c36-2655-4d0b-936c-3001344bd8d0",
    "texte": "?מה אנשים עושים בספרייה הלאומית",
    "type": "qcm",
    "choix": [
      {
        "libelle": "שותים קפה ולומדים עברית",
        "valeur": "437c6992-2384-492f-9eca-fc481d63cfc9"
      },
      {
        "libelle": "קוראים ספרים, עובדים ולומדים",
        "valeur": "fdc16f89-1746-479b-af56-1871186c5dbb"
      },
      {
        "libelle": "עובדים בבית חולים",
        "valeur": "c437aea6-cb1f-402f-82cd-8c6e1000a98b"
      },
      {
        "libelle": "הולכים לים",
        "valeur": "b5b6a2f2-c46d-4d9a-be25-71d4d0bfe983"
      }
    ],
    "bonneReponse": "fdc16f89-1746-479b-af56-1871186c5dbb",
    "points": 1,
    "niveau": 4,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/2ouaWAfazTo"
    }
  },
  {
    "id": "4b8367b9-3bb5-4e32-9c21-18b4f0cec453",
    "texte": "?מה נכון",
    "type": "qcm",
    "choix": [
      {
        "libelle": "הספרייה הלאומית נמצאת בתל אביב",
        "valeur": "460ad38e-19bf-45af-b25d-e46197ceccef"
      },
      {
        "libelle": "בספרייה הלאומית יש הרבה ספרים על ישראל ועל העם היהודי",
        "valeur": "5eb522aa-c671-45cc-abc2-9737afad05e4"
      },
      {
        "libelle": "הספרייה הלאומית היא רק בית קפה",
        "valeur": "fd5eb1e6-8e0f-47f2-8ed3-8f200840f7cb"
      },
      {
        "libelle": "הספרייה הלאומית היא מוזיאון",
        "valeur": "b53a9924-02e5-4617-a4a4-90abc3a8d425"
      }
    ],
    "bonneReponse": "5eb522aa-c671-45cc-abc2-9737afad05e4",
    "points": 1,
    "niveau": 4,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/2ouaWAfazTo"
    }
  },
  {
    "id": "1cd33add-43c8-4d86-8c8a-b0505c752bf2",
    "texte": "?מה יש בספרייה הלאומית",
    "type": "qcm",
    "choix": [
      {
        "libelle": "יש שם רק ספרים",
        "valeur": "e1a98667-798b-4630-9c0d-cc6246ed098e"
      },
      {
        "libelle": "יש שם 5 מיליון ספרים וגם בית קפה וקונצרטים",
        "valeur": "332b883a-fbab-4992-8e9c-e3a303624593"
      },
      {
        "libelle": "יש שם רק ספרים על מוזיקה",
        "valeur": "54357358-4a46-4b0b-81ee-40d88144a8b1"
      },
      {
        "libelle": "יש שם רק סטודנטים שלומדים באוניברסיטה",
        "valeur": "1f043af8-cded-4606-afce-9a9adad7d821"
      }
    ],
    "bonneReponse": "332b883a-fbab-4992-8e9c-e3a303624593",
    "points": 1,
    "niveau": 4,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/2ouaWAfazTo"
    }
  },
  {
    "id": "6c26eb82-61eb-415b-9ffc-92d46604623b",
    "texte": "?לאן שרה רוצה ללכת",
    "type": "qcm",
    "choix": [
      {
        "libelle": "לשוק",
        "valeur": "4df60f13-0d13-40b4-8794-ff8e38ef2914"
      },
      {
        "libelle": "למוזיאון ישראל",
        "valeur": "11043f8b-3bfe-4297-9686-34b5ccca2aa3"
      },
      {
        "libelle": "לדודה רבקה",
        "valeur": "d15d87f5-afa6-4763-84ea-1080d01fec99"
      },
      {
        "libelle": "לעיר העתיקה",
        "valeur": "bbfe6da2-f8aa-4463-96fc-b9c0da9330f4"
      }
    ],
    "bonneReponse": "d15d87f5-afa6-4763-84ea-1080d01fec99",
    "points": 1,
    "niveau": 4,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/jRVZ7gs8TbQ"
    }
  },
  {
    "id": "8905ea6e-629c-4895-9077-8cf492bd732a",
    "texte": "?למה ג'סיקה לא רוצה ללכת לדודה רבקה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "כי היא רוצה לעבוד",
        "valeur": "44561f1d-cc78-4b51-87d3-4181edee447d"
      },
      {
        "libelle": "כי היא רוצה לטייל בעיר ולראות אנשים",
        "valeur": "fa16ad9f-8b4b-4ced-8c31-bb496d2677b6"
      },
      {
        "libelle": "כי היא רוצה ללכת לשוק",
        "valeur": "6ef40286-b6c2-42ec-8516-37671060594e"
      },
      {
        "libelle": "כי אין לה זמן",
        "valeur": "0a3a66d0-6501-4b3b-86b9-73272b0749f8"
      }
    ],
    "bonneReponse": "fa16ad9f-8b4b-4ced-8c31-bb496d2677b6",
    "points": 1,
    "niveau": 4,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/jRVZ7gs8TbQ"
    }
  },
  {
    "id": "1368708d-2728-4a6d-bcb1-8b2c624373d2",
    "texte": "?מי לא רוצה ללכת לדודה רבקה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "רק ג'סיקה",
        "valeur": "5d774b5f-20c2-4781-9ed4-33b31dc9495e"
      },
      {
        "libelle": "רק רמי",
        "valeur": "73c7e5d5-afcc-4612-8e85-db21632050af"
      },
      {
        "libelle": "ג'סיקה, אנטואן ורמי",
        "valeur": "45b9f4be-f670-4e13-8d97-eed5c5d8b473"
      },
      {
        "libelle": "דויד ושרה",
        "valeur": "59c72a69-7a86-46e2-bb6b-263e651d770f"
      }
    ],
    "bonneReponse": "45b9f4be-f670-4e13-8d97-eed5c5d8b473",
    "points": 1,
    "niveau": 4,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/jRVZ7gs8TbQ"
    }
  },
  {
    "id": "35bfa2fa-0786-41e4-b608-284c24bcbdbd",
    "texte": "?מי רוצה לאכול את האוכל של דודה רבקה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "רמי",
        "valeur": "b0f03978-0731-4376-bc5a-c0a844b571df"
      },
      {
        "libelle": "אנטואן",
        "valeur": "c7a2f216-bc2c-473c-bf0b-a0ce8370a582"
      },
      {
        "libelle": "דויד",
        "valeur": "edfdbc99-bf64-4fe9-b04b-cd46aa1c8608"
      },
      {
        "libelle": "ג'סיקה",
        "valeur": "bb5283fe-77f9-4ae1-8e26-dbd66238796e"
      }
    ],
    "bonneReponse": "edfdbc99-bf64-4fe9-b04b-cd46aa1c8608",
    "points": 1,
    "niveau": 4,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/jRVZ7gs8TbQ"
    }
  },
  {
    "id": "646a923f-8ff6-43a7-819c-93c54e72e586",
    "texte": "Eh bien le niveau 4 est validé haut la main ! On passe à la suite ?",
    "type": "qcm",
    "choix": [
      {
        "libelle": "Oui",
        "valeur": true
      },
      {
        "libelle": "Non",
        "valeur": false
      }
    ],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": false
  },
  {
    "id": "6b1e5fc5-ced1-4e68-8656-53c6953783c2",
    "texte": "?למה אנשים אוהבים לבוא למלון בראשית",
    "type": "qcm",
    "choix": [
      {
        "libelle": "ללכת לסאונה או לחמאם",
        "valeur": "0997746b-ca3d-4cfd-9638-d5eeb9000256"
      },
      {
        "libelle": "לטייל במצפה רמון",
        "valeur": "80183bf7-b884-4c4d-9120-3cd1090ee060"
      },
      {
        "libelle": "לנוח ליד הבריכה",
        "valeur": "05902e60-8cff-47dd-b99e-0d1a44051250"
      },
      {
        "libelle": "כל התשובות נכונות",
        "valeur": "2e3d6d9f-4348-47ad-b807-c450a6934b6d"
      }
    ],
    "bonneReponse": "2e3d6d9f-4348-47ad-b807-c450a6934b6d",
    "points": 1,
    "niveau": 5,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/uhYWPJ6k1eE"
    }
  },
  {
    "id": "eb77db04-6fed-42df-8724-1079208663a8",
    "texte": "?מה רואים ממלון בראשית",
    "type": "qcm",
    "choix": [
      {
        "libelle": "את הים התיכון",
        "valeur": "0a94c869-4b28-45bd-8b74-e4acf31e05a2"
      },
      {
        "libelle": "את העיר ירושלים",
        "valeur": "2b2684b4-3b82-4ff6-ae4a-b53f0e5c3990"
      },
      {
        "libelle": "את הנוף של המדבר",
        "valeur": "ed0d045b-a53a-40af-9944-635f7c2ec6c6"
      },
      {
        "libelle": "את שוק מחנה יהודה",
        "valeur": "ec31e470-98d3-48bd-a420-f5dc62b57f10"
      }
    ],
    "bonneReponse": "ed0d045b-a53a-40af-9944-635f7c2ec6c6",
    "points": 1,
    "niveau": 5,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/uhYWPJ6k1eE"
    }
  },
  {
    "id": "bcf6e8d7-3ea6-4f74-b2a9-4b73c338eced",
    "texte": "?איפה נמצא מלון בראשית",
    "type": "qcm",
    "choix": [
      {
        "libelle": "מלון בראשית נמצא בעיר תל אביב",
        "valeur": "9c5985f3-9170-4d56-917d-7a1d6157cebd"
      },
      {
        "libelle": "מלון בראשית נמצא בעיר חיפה",
        "valeur": "729a02f1-7268-4450-a03a-c6c2835f2973"
      },
      {
        "libelle": "מלון בראשית נמצא בעיר אילת",
        "valeur": "2be9da4b-c918-49c7-a6d8-903c33a5242f"
      },
      {
        "libelle": "מלון בראשית נמצא בעיר מצפה רמון",
        "valeur": "758ef4f3-a638-4b3d-b212-c771a7355e6f"
      }
    ],
    "bonneReponse": "758ef4f3-a638-4b3d-b212-c771a7355e6f",
    "points": 1,
    "niveau": 5,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/uhYWPJ6k1eE"
    }
  },
  {
    "id": "5b9d3541-f732-4777-b153-077c66b6dc14",
    "texte": "?איפה נמצאת מצפה רמון",
    "type": "qcm",
    "choix": [
      {
        "libelle": "ליד תל אביב",
        "valeur": "62053349-f29b-4825-b10d-2f68305cb6b9"
      },
      {
        "libelle": "במדבר",
        "valeur": "5a1c5272-6003-48f7-a71e-944419c3088b"
      },
      {
        "libelle": "ליד הים",
        "valeur": "9c524757-158f-43f1-b0ab-a81b545e031e"
      },
      {
        "libelle": "בירושלים",
        "valeur": "83451e0d-05a8-4b10-9657-3ee3092b20e4"
      }
    ],
    "bonneReponse": "5a1c5272-6003-48f7-a71e-944419c3088b",
    "points": 1,
    "niveau": 5,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "69b2bcb2-dacf-4a95-8924-0d990240cdfa",
    "texte": "?איך מזג האוויר במצפה רמון",
    "type": "qcm",
    "choix": [
      {
        "libelle": "ביום קר ובלילה חם",
        "valeur": "b60486ac-9208-4d63-aeb1-d5d0fbefd410"
      },
      {
        "libelle": "כל היום קר",
        "valeur": "e6fbbb35-0e77-4f8c-9f34-58e31be31ada"
      },
      {
        "libelle": "ביום חם ובלילה קר",
        "valeur": "3401d2e4-7a2d-42ff-b98c-e9a4a897dab3"
      },
      {
        "libelle": "כל היום חם",
        "valeur": "a8e07f6f-ee91-4d03-b5af-b39a3378de5e"
      }
    ],
    "bonneReponse": "3401d2e4-7a2d-42ff-b98c-e9a4a897dab3",
    "points": 1,
    "niveau": 5,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "ff2dddac-c0bb-4097-8fed-9a6f103a82ac",
    "texte": "?למה הרבה \"מצפאים\" רוצים לגור במצפה רמון",
    "type": "qcm",
    "choix": [
      {
        "libelle": "כי הם רוצים לעבוד בתל אביב",
        "valeur": "8bb06581-78c3-45d7-80aa-eb40e8f58a7e"
      },
      {
        "libelle": "כי הם רוצים שקט",
        "valeur": "3413b64b-1988-4f1d-b938-a32a2e3c2769"
      },
      {
        "libelle": "כי הם רוצים ללמוד באוניברסיטה",
        "valeur": "45101630-9d55-406b-94f6-9e58d419793c"
      },
      {
        "libelle": "כי הם רוצים לטוס לחו\"ל",
        "valeur": "618f1dea-1459-4f48-9cf8-e980a43c754d"
      }
    ],
    "bonneReponse": "3413b64b-1988-4f1d-b938-a32a2e3c2769",
    "points": 1,
    "niveau": 5,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "e302de0c-d53b-4178-9f39-5fdea3170cc4",
    "texte": "?מה אנשים אוהבים לעשות במצפה רמון",
    "type": "qcm",
    "choix": [
      {
        "libelle": "לטייל במדבר, לקנות בחנויות ולאכול במסעדות",
        "valeur": "25733df9-6e07-492c-9834-5f858decc779"
      },
      {
        "libelle": "לעבוד בבית קפה וללמוד ספרות",
        "valeur": "9dd416df-2bfb-4e55-b156-1f2c36476c0b"
      },
      {
        "libelle": "לשחות בים",
        "valeur": "32953df7-f695-4a1d-a42c-de0c9e8421ef"
      },
      {
        "libelle": "ללכת למוזיאון ישראל",
        "valeur": "0567838b-c2a8-41e1-b376-0df1dd112baa"
      }
    ],
    "bonneReponse": "25733df9-6e07-492c-9834-5f858decc779",
    "points": 1,
    "niveau": 5,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "e8120fe8-f6e8-47d2-bed0-1fecee56705f",
    "texte": "?למה הרבה אנשים אוהבים לבוא למצפה רמון",
    "type": "qcm",
    "choix": [
      {
        "libelle": "כי יש הרבה רעש בעיר",
        "valeur": "8a334815-4e9e-47f7-8a68-89e976fac35a"
      },
      {
        "libelle": "כי יש אנשים מכל העולם",
        "valeur": "b18c985a-1fb0-45a3-841d-c12d77533f00"
      },
      {
        "libelle": "כי הם מרגישים טוב ויש שם חיים רגועים ושקט",
        "valeur": "d616747e-d58b-4d8b-a44b-a62a617d6e0b"
      },
      {
        "libelle": "כי יש הרבה אוטובוסים",
        "valeur": "2d447906-4aec-4ce0-8f23-9706523c9ce1"
      }
    ],
    "bonneReponse": "d616747e-d58b-4d8b-a44b-a62a617d6e0b",
    "points": 1,
    "niveau": 5,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "37209185-6d5f-4382-8b38-f244f94cd8b0",
    "texte": "{{field:358f8a5f-6233-46f7-acc7-980614b18b82}}, niveau 5 : check. Clique sur \"Oui\" si tu penses pouvoir valider le niveau 6.",
    "type": "qcm",
    "choix": [
      {
        "libelle": "Oui",
        "valeur": true
      },
      {
        "libelle": "Non",
        "valeur": false
      }
    ],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": false
  },
  {
    "id": "89de6932-c2b6-49e5-91ff-4aea84479327",
    "texte": "?לאן דויד ושרה באים לסוף שבוע",
    "type": "qcm",
    "choix": [
      {
        "libelle": "לירושלים",
        "valeur": "6128fc3c-a811-4145-91c8-e33b34c1f8ad"
      },
      {
        "libelle": "לחיפה",
        "valeur": "17181bf9-b406-4ab0-9cbf-d0b57347c9f7"
      },
      {
        "libelle": "לתל אביב",
        "valeur": "9385d012-884b-4fe7-8447-813ea437b328"
      },
      {
        "libelle": "למצפה רמון",
        "valeur": "d1c19a60-21c3-4889-a3a3-ec39213a7bdb"
      }
    ],
    "bonneReponse": "9385d012-884b-4fe7-8447-813ea437b328",
    "points": 1,
    "niveau": 6,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtube.com/shorts/2ZwRQ52Q8wM"
    }
  },
  {
    "id": "5a89c8de-7dc3-4b5e-b856-66cdfc47ac66",
    "texte": "?למה שרה לא רוצה ללכת לנווה צדק",
    "type": "qcm",
    "choix": [
      {
        "libelle": "כי היא רוצה לחזור למלון",
        "valeur": "911c9706-dea7-4233-902d-fb89fbc0e4f6"
      },
      {
        "libelle": "כי היא מעדיפה לעשות שופינג ברחוב שנקין",
        "valeur": "1fe0d702-e448-4294-85aa-a6340444be8d"
      },
      {
        "libelle": "כי היא לא אוהבת את תל אביב",
        "valeur": "88eb2c73-8105-4c00-8e93-8b1cc0dc770c"
      },
      {
        "libelle": "כי היא רוצה ללכת לים",
        "valeur": "c4a9769e-76af-4d4c-8060-91e208e37733"
      }
    ],
    "bonneReponse": "1fe0d702-e448-4294-85aa-a6340444be8d",
    "points": 1,
    "niveau": 6,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtube.com/shorts/2ZwRQ52Q8wM"
    }
  },
  {
    "id": "e0fa7a35-43ce-466b-9781-735f7d3808fd",
    "texte": "?למה דויד שמח מאוד",
    "type": "qcm",
    "choix": [
      {
        "libelle": "כי ג'סיקה קונה לו מתנה",
        "valeur": "e2baa95e-974a-4519-9309-745cc018f0b0"
      },
      {
        "libelle": "כי ג'סיקה מדברת עברית טוב",
        "valeur": "d030199e-a24c-4d14-9fa8-5470d8bc4de7"
      },
      {
        "libelle": "כי הם הולכים לים",
        "valeur": "a8a6d73d-1c70-4d82-8754-a82b49986e72"
      },
      {
        "libelle": "כי הם אוכלים במסעדה",
        "valeur": "28886039-fc49-4045-8e9e-aa2b6b3fc266"
      }
    ],
    "bonneReponse": "d030199e-a24c-4d14-9fa8-5470d8bc4de7",
    "points": 1,
    "niveau": 6,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtube.com/shorts/2ZwRQ52Q8wM"
    }
  },
  {
    "id": "3c0f53c2-a764-4171-92c5-80f458046196",
    "texte": "?מה ג'סיקה מצליחה לעשות במסעדה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "לדבר צרפתית",
        "valeur": "fcd6f072-2b0b-4020-b1d4-c3b610f0632b"
      },
      {
        "libelle": "לעשות הכול בעברית",
        "valeur": "aa5f47f9-16d1-44bb-aae9-05d75dff4ed4"
      },
      {
        "libelle": "לשלם במזומן",
        "valeur": "b745e168-9e37-4b39-8e7c-44be05b5db87"
      },
      {
        "libelle": "לעבוד עם המלצרים",
        "valeur": "08f38d61-2573-4ec7-926c-12c6372441b1"
      }
    ],
    "bonneReponse": "aa5f47f9-16d1-44bb-aae9-05d75dff4ed4",
    "points": 1,
    "niveau": 6,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtube.com/shorts/2ZwRQ52Q8wM"
    }
  },
  {
    "id": "dad9dbdf-2e0e-4980-abd5-4ac437540a62",
    "texte": "?למה ג'סיקה מרגישה בבית בתל אביב",
    "type": "qcm",
    "choix": [
      {
        "libelle": "כי היא אוהבת את הים, את האנשים ואת הבלגן התל אביבי",
        "valeur": "5a05b588-7aae-4314-af8a-a7408ac9ccb4"
      },
      {
        "libelle": "כי היא אוהבת את מזג האוויר",
        "valeur": "c06ddd1c-6f30-431b-8de7-4bb1981cd454"
      },
      {
        "libelle": "כי היא אוהבת רק את המסעדות",
        "valeur": "cfbf2d11-70be-433c-a2b9-2b4f65c49f6a"
      },
      {
        "libelle": "כי היא אוהבת את השופינג ברחוב שנקין",
        "valeur": "ac122164-4190-4a7d-ba05-b873d213574b"
      }
    ],
    "bonneReponse": "5a05b588-7aae-4314-af8a-a7408ac9ccb4",
    "points": 1,
    "niveau": 6,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtube.com/shorts/2ZwRQ52Q8wM"
    }
  },
  {
    "id": "d4c507c3-7dc8-4912-9405-988e25b71798",
    "texte": "?למה אנשים קוראים לתל אביב \"עיר בלי הפסקה\"",
    "type": "qcm",
    "choix": [
      {
        "libelle": "כי אנשים לא ישנים בעיר",
        "valeur": "1b4d68ba-248f-4469-af56-75660bbb9854"
      },
      {
        "libelle": "כי תמיד יש מה לראות ולעשות, גם ביום וגם בלילה",
        "valeur": "719e53d5-cdda-4d71-a453-a2865a3c6571"
      },
      {
        "libelle": "כי כל האנשים עובדים בלילה",
        "valeur": "45aab08a-021c-4865-9dac-2eb7faf0fa6f"
      },
      {
        "libelle": "כי אין שקט בעיר",
        "valeur": "73408dbd-9fe3-4acb-b78c-84e4e6b9b2d0"
      }
    ],
    "bonneReponse": "719e53d5-cdda-4d71-a453-a2865a3c6571",
    "points": 1,
    "niveau": 6,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "ccf0d7de-1286-48aa-9c3c-9514e24ae9ae",
    "texte": "?מה אפשר למצוא במרכז העיר",
    "type": "qcm",
    "choix": [
      {
        "libelle": "בתים עתיקים ובתים מודרניים",
        "valeur": "89c8f5ed-976c-41d0-996d-ec7c6f90f00a"
      },
      {
        "libelle": "מסעדות, בתי קפה, חנויות ושוק הכרמל",
        "valeur": "2f33b348-d245-4079-b2e1-52e2d908f00e"
      },
      {
        "libelle": "פארקים גדולים",
        "valeur": "d9d02343-a112-40a5-86bf-62705d3a8cc8"
      },
      {
        "libelle": "בניינים יפים וגדולים",
        "valeur": "1214d095-fcc7-4454-bade-f16f14fe8210"
      }
    ],
    "bonneReponse": "2f33b348-d245-4079-b2e1-52e2d908f00e",
    "points": 1,
    "niveau": 6,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "8a1c0335-c211-4de6-b128-358f661b3383",
    "texte": "?מה אפשר לראות בדרום תל אביב",
    "type": "qcm",
    "choix": [
      {
        "libelle": "פארק הירקון",
        "valeur": "5b9e60e9-d4cc-485e-b3e8-63afb74354b6"
      },
      {
        "libelle": "שכונות נחמדות ושוק לוינסקי",
        "valeur": "906c7852-48b4-4301-894d-2f9c15050e23"
      },
      {
        "libelle": "את הים",
        "valeur": "f22be64a-9440-4b77-bc2a-e4b192df6de3"
      },
      {
        "libelle": "שוק הפשפשים",
        "valeur": "644e1bd5-5d90-4275-ab2d-0f15485a2dd2"
      }
    ],
    "bonneReponse": "906c7852-48b4-4301-894d-2f9c15050e23",
    "points": 1,
    "niveau": 6,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "ceb51992-d270-4ad8-a13a-7932528e6f6a",
    "texte": "?איזה משפט נכון לפי הטקסט",
    "type": "qcm",
    "choix": [
      {
        "libelle": "בצפון העיר יש הרבה רעש ואין פארקים",
        "valeur": "ea4f5d91-f620-43b4-8b36-a196516746ee"
      },
      {
        "libelle": "ביפו יש בתים עתיקים ושוק הפשפשים",
        "valeur": "0c632151-1f7a-4cfe-bed7-165de21ca370"
      },
      {
        "libelle": "בדרום העיר יש הרבה שקט",
        "valeur": "491f27e8-b825-456f-b1cc-8238fed315d1"
      },
      {
        "libelle": "במרכז העיר יש רק מסעדות",
        "valeur": "54d4bce7-c16a-4775-b783-d8385c045cdb"
      }
    ],
    "bonneReponse": "0c632151-1f7a-4cfe-bed7-165de21ca370",
    "points": 1,
    "niveau": 6,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "77982966-0a9e-4665-951b-06bb50d6f128",
    "texte": "?למה הרבה תיירים באים לתל אביב",
    "type": "qcm",
    "choix": [
      {
        "libelle": "כי הם אוהבים את הים",
        "valeur": "1d5d0b3c-716c-4ca2-bd40-313689514602"
      },
      {
        "libelle": "כי הם אוהבים את המסעדות והברים",
        "valeur": "9d63c841-5bee-4791-adee-c302af8180bf"
      },
      {
        "libelle": "כי הם אוהבים את הים, המסעדות, השכונות היפות, האמנות וגם את התל אביבים",
        "valeur": "184aebcf-8a97-4210-9492-a91aec746589"
      },
      {
        "libelle": "כי הם רוצים לגור בדרום העיר",
        "valeur": "954d8c94-500b-4ff2-9f1a-2e8e8a4fa352"
      }
    ],
    "bonneReponse": "184aebcf-8a97-4210-9492-a91aec746589",
    "points": 1,
    "niveau": 6,
    "obligatoire": true,
    "multiple": false,
    "aleatoire": false
  },
  {
    "id": "0383b52e-6fbf-4194-ac16-dc470a04e5de",
    "texte": "Bravo {{field:358f8a5f-6233-46f7-acc7-980614b18b82}}, tu as validé le niveau 6. Souhaites-tu continuer ?",
    "type": "qcm",
    "choix": [
      {
        "libelle": "Oui",
        "valeur": true
      },
      {
        "libelle": "Non",
        "valeur": false
      }
    ],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": false
  },
  {
    "id": "52896224-320f-40ae-bdef-3118787d4180",
    "texte": "?מה ג'סיקה אוהבת",
    "type": "qcm",
    "choix": [
      {
        "libelle": "את החיים בירושלים",
        "valeur": "e77da2a4-b0f7-4d80-87c2-30081afd2a94"
      },
      {
        "libelle": "את החיים התל אביביים",
        "valeur": "4dc39795-7dab-4ac2-9986-67300549ee89"
      },
      {
        "libelle": "את החיים במדבר",
        "valeur": "2d383034-66ba-48b7-911d-c69eb3f27156"
      },
      {
        "libelle": "את החיים בפריז",
        "valeur": "e01e743b-7eff-4798-ad9c-886025611e16"
      }
    ],
    "bonneReponse": "4dc39795-7dab-4ac2-9986-67300549ee89",
    "points": 1,
    "niveau": 7,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/ZolatbNb1Ak"
    }
  },
  {
    "id": "88ab5ea7-5076-47d2-a650-97ff6d219946",
    "texte": "?עם מי ג'סיקה גרה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "עם שרה",
        "valeur": "f97d92d1-8023-47d9-bc65-ad789e2f15f7"
      },
      {
        "libelle": "עם רמי",
        "valeur": "9744a4a4-5f67-465b-8e80-edf13efc7173"
      },
      {
        "libelle": "עם יותם, השותף שלה",
        "valeur": "e97f1616-2f62-4963-976e-0f27cba9ffa7"
      },
      {
        "libelle": "עם יותם, הבעל שלה",
        "valeur": "31ecbce5-b090-437d-af91-ecdeec5beff5"
      }
    ],
    "bonneReponse": "e97f1616-2f62-4963-976e-0f27cba9ffa7",
    "points": 1,
    "niveau": 7,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/ZolatbNb1Ak"
    }
  },
  {
    "id": "4e9fbf1e-67f4-4d1a-b1ea-361c1385ec29",
    "texte": "?מה ג'סיקה אוהבת בתל אביב",
    "type": "qcm",
    "choix": [
      {
        "libelle": "את הים",
        "valeur": "d76b1285-9218-4e65-b3cf-0cd3c62ff9b4"
      },
      {
        "libelle": "את המסעדות הישראליות",
        "valeur": "46ea72ff-9975-48b3-90da-b6b03328fab0"
      },
      {
        "libelle": "את התרבות הישראלית",
        "valeur": "6de521fa-aaab-4665-b9c9-92e74673ee17"
      },
      {
        "libelle": "את האוניברסיטה הישראלית",
        "valeur": "ddc5b7e5-191d-4525-a62a-c1b3c0350541"
      }
    ],
    "bonneReponse": "6de521fa-aaab-4665-b9c9-92e74673ee17",
    "points": 1,
    "niveau": 7,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/ZolatbNb1Ak"
    }
  },
  {
    "id": "6baab413-57a3-4575-8190-4cb7bbc850a9",
    "texte": "?מה קורה בין ג'סיקה ליותם",
    "type": "qcm",
    "choix": [
      {
        "libelle": "הם עובדים ביחד",
        "valeur": "72851acb-0beb-424d-8ec5-5498ed5a2b20"
      },
      {
        "libelle": "הם מטיילים ביחד",
        "valeur": "820fcf91-fcff-42b0-8ea1-cec9a6578357"
      },
      {
        "libelle": "הם מתאהבים",
        "valeur": "5f7a8a2d-ced3-4422-a790-4987967d4bbd"
      },
      {
        "libelle": "הם גרים ביחד",
        "valeur": "3e813468-743e-4240-a425-b3c4c98216bc"
      }
    ],
    "bonneReponse": "5f7a8a2d-ced3-4422-a790-4987967d4bbd",
    "points": 1,
    "niveau": 7,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/ZolatbNb1Ak"
    }
  },
  {
    "id": "b8957826-b1be-4edf-af23-fe9876200914",
    "texte": "?מה ההפתעה של יותם",
    "type": "qcm",
    "choix": [
      {
        "libelle": "יותם רוצה לטוס עם ג'סיקה",
        "valeur": "1b142456-63d2-4c98-be95-1c337d1bfd0b"
      },
      {
        "libelle": "יותם רוצה לקנות דירה",
        "valeur": "0738742c-00ab-41b1-85e7-f2a1c91c973a"
      },
      {
        "libelle": "יותם רוצה להתחתן עם ג'סיקה",
        "valeur": "909f62ab-9b8c-4f62-83cd-8bb3383ead0b"
      },
      {
        "libelle": "יותם רוצה לעבור לירושלים",
        "valeur": "87d89cd6-0e5b-4f80-a240-9f62d7118649"
      }
    ],
    "bonneReponse": "909f62ab-9b8c-4f62-83cd-8bb3383ead0b",
    "points": 1,
    "niveau": 7,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/ZolatbNb1Ak"
    }
  },
  {
    "id": "f07549f6-f86e-45c5-826c-1e6ca1946b68",
    "texte": "?מה רמי אוהב לעשות בבית הקפה בבוקר",
    "type": "qcm",
    "choix": [
      {
        "libelle": "לשתות מיץ ולשמוע מוזיקה",
        "valeur": "6147dd75-e883-4552-a6d9-da7223b545c2"
      },
      {
        "libelle": "לשבת, לקרוא עיתון ולדבר עם אנשים",
        "valeur": "dac86dab-d4d6-4e1c-87c6-d5a91cc6c5e8"
      },
      {
        "libelle": "לקנות פירות וירקות",
        "valeur": "00d9c653-643b-4c80-8a31-1d0ac123850b"
      },
      {
        "libelle": "לכתוב מיילים",
        "valeur": "c7b07388-eeca-4b64-bf56-05fee5101672"
      }
    ],
    "bonneReponse": "dac86dab-d4d6-4e1c-87c6-d5a91cc6c5e8",
    "points": 1,
    "niveau": 7,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "689f32fb-ab6f-4628-991e-2249c82de6cf",
    "texte": "?מה ההורים של רמי אוהבים לעשות",
    "type": "qcm",
    "choix": [
      {
        "libelle": "לעבוד וללמוד באוניברסיטה",
        "valeur": "f7726c86-38f9-4506-8376-db5039f1cedf"
      },
      {
        "libelle": "לטייל בעיר, לשבת בגינה ולקרוא ספרים",
        "valeur": "8bb7bb7b-a0c7-4acf-b96a-4f83dde32364"
      },
      {
        "libelle": "ללכת לים ולשמוע מוזיקה",
        "valeur": "81632c89-edab-42f0-abef-7dce419067f5"
      },
      {
        "libelle": "לשבת בבית קפה ולעבוד",
        "valeur": "8a7154bf-d505-4655-aa19-ef4c803cafc6"
      }
    ],
    "bonneReponse": "8bb7bb7b-a0c7-4acf-b96a-4f83dde32364",
    "points": 1,
    "niveau": 7,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "e6232c0c-8bc9-4e71-b8cb-b43c74e1faf3",
    "texte": "?מתי רמי לא מרגיש טוב",
    "type": "qcm",
    "choix": [
      {
        "libelle": "כשהוא הולך לשוק",
        "valeur": "a850d4f7-1e8f-4433-a102-61753283922d"
      },
      {
        "libelle": "כשהוא לא מצליח להסביר מה הוא רוצה",
        "valeur": "2caa7d8c-47cc-4829-b062-ebb5998a07a3"
      },
      {
        "libelle": "כשהוא שותה קפה קטן",
        "valeur": "f0520295-c49f-4c91-ac8c-babc3ba2cf58"
      },
      {
        "libelle": "כשהוא נפגש עם חברים",
        "valeur": "08288a6e-2016-426c-bca0-5ff6991dc7ca"
      }
    ],
    "bonneReponse": "2caa7d8c-47cc-4829-b062-ebb5998a07a3",
    "points": 1,
    "niveau": 7,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "676f6dd8-d851-4e2c-8d87-fc99ec97e798",
    "texte": "?למה רמי לפעמים הולך למקום עם הרבה רעש",
    "type": "qcm",
    "choix": [
      {
        "libelle": "כי הוא אוהב רעש",
        "valeur": "9dfbe3b9-27a1-41e5-b9ca-4f5d6d7137e8"
      },
      {
        "libelle": "כי אין מקום בבית קפה",
        "valeur": "107324e8-b851-4222-bc9c-2855859ee230"
      },
      {
        "libelle": "כי החברים שלו ממליצים",
        "valeur": "c622ed3b-f60d-4344-940f-b309900898fd"
      },
      {
        "libelle": "כי הוא רוצה לעבוד שם",
        "valeur": "9315e086-fd52-43b8-9fd0-39eaaa115acf"
      }
    ],
    "bonneReponse": "c622ed3b-f60d-4344-940f-b309900898fd",
    "points": 1,
    "niveau": 7,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "8b2b6d34-3da7-4174-8504-01820608eac9",
    "texte": "J'ai une bonne nouvelle pour toi. Tu as le niveau pour être certifié A1 en hébreu moderne. \nSouhaites-tu continuer au niveau supérieur ?",
    "type": "qcm",
    "choix": [
      {
        "libelle": "Oui",
        "valeur": true
      },
      {
        "libelle": "Non",
        "valeur": false
      }
    ],
    "bonneReponse": null,
    "points": 0,
    "niveau": null,
    "obligatoire": false
  },
  {
    "id": "6e4c3df8-f055-4da4-9cf1-52ab3333409f",
    "texte": "מה רואים כשנוסעים ברכבת מתל אביב לחיפה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "את המדבר והים",
        "valeur": "91c4d739-8f96-44bc-8cd6-11b4e252b909"
      },
      {
        "libelle": "את הים הכחול ואת ההר הירוק",
        "valeur": "cfcd1b83-f3c4-494b-8e70-11b545a5d387"
      },
      {
        "libelle": "את ירושלים ואת הים",
        "valeur": "26f99126-832a-4f80-a48b-991002ea5442"
      },
      {
        "libelle": "את הגנים הבהאיים ואת השוק",
        "valeur": "1bd80380-d7db-4c66-841e-dd187487d6da"
      }
    ],
    "bonneReponse": "cfcd1b83-f3c4-494b-8e70-11b545a5d387",
    "points": 1,
    "niveau": 8,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/KGi7_93kFpQ"
    }
  },
  {
    "id": "e1efeb3d-1554-4c72-8f47-d978996c1c53",
    "texte": "?מה מוכר מוחמד",
    "type": "qcm",
    "choix": [
      {
        "libelle": "דג מלוח",
        "valeur": "132631d3-088a-49ef-81dd-ce91cd89a82b"
      },
      {
        "libelle": "פירות וירקות טריים",
        "valeur": "82c713d1-c0f9-406a-9efe-4466d95b58bf"
      },
      {
        "libelle": "טאקו",
        "valeur": "78c684be-a4c3-480a-9ac9-058605b7025d"
      },
      {
        "libelle": "אוכל שוודי",
        "valeur": "6fed6c4a-e395-4d6f-b621-106009892052"
      }
    ],
    "bonneReponse": "82c713d1-c0f9-406a-9efe-4466d95b58bf",
    "points": 1,
    "niveau": 8,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/KGi7_93kFpQ"
    }
  },
  {
    "id": "aca959fb-87eb-4ddb-90be-942ec58555f4",
    "texte": "?למה שרה לא רוצה לאכול טאקו",
    "type": "qcm",
    "choix": [
      {
        "libelle": "כי היא לא אוהבת טאקו",
        "valeur": "dd2832f7-495b-4839-922e-fee574ce3268"
      },
      {
        "libelle": "כי היא רוצה לאכול אוכל ישראלי",
        "valeur": "40b51f48-0549-487f-a914-24af6f7b880f"
      },
      {
        "libelle": "כי אין טאקו בחיפה",
        "valeur": "fd15b776-1c8c-42fd-8877-27ba86b5ce36"
      },
      {
        "libelle": "כי היא רוצה לשתות קפה",
        "valeur": "91869878-637e-46a9-9490-6c870e7d02ae"
      }
    ],
    "bonneReponse": "40b51f48-0549-487f-a914-24af6f7b880f",
    "points": 1,
    "niveau": 8,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/KGi7_93kFpQ"
    }
  },
  {
    "id": "70910ea6-a6fd-49a3-81c0-f1e535f307a5",
    "texte": "?מה מיוחד בחיפה לפי הטקסט",
    "type": "qcm",
    "choix": [
      {
        "libelle": "יש בחיפה רק אוכל ישראלי",
        "valeur": "30ab9951-b48a-4a60-9784-068831ec41cf"
      },
      {
        "libelle": "יש בחיפה אנשים שונים, אוכל מיוחד ונוף צבעוני",
        "valeur": "cef80365-38ad-4504-be45-393c0341c38a"
      },
      {
        "libelle": "יש בחיפה רק שוק גדול",
        "valeur": "8a581a94-f03b-4a04-abaa-ed1374e9ba9b"
      },
      {
        "libelle": "יש בחיפה רק ים ומסעדות",
        "valeur": "63bd336d-d63b-425b-a103-db26640c9f71"
      }
    ],
    "bonneReponse": "cef80365-38ad-4504-be45-393c0341c38a",
    "points": 1,
    "niveau": 8,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true,
    "media": {
      "type": "video",
      "url": "https://youtu.be/KGi7_93kFpQ"
    }
  },
  {
    "id": "ca4f4372-e545-4eab-8cdd-1f71ab790d63",
    "texte": "?לאן דויד ושרה נסעו",
    "type": "qcm",
    "choix": [
      {
        "libelle": "לירושלים ולתל אביב",
        "valeur": "614fe4a3-1bac-4824-ad92-23ec0882e1e3"
      },
      {
        "libelle": "לחיפה ולעכו",
        "valeur": "cadeee11-9427-4941-96f5-ef6b86752e47"
      },
      {
        "libelle": "למצפה רמון ולעכו",
        "valeur": "3dfefedb-e975-4817-a302-e0252562f70c"
      },
      {
        "libelle": "לפריז ולחיפה",
        "valeur": "04ce449f-0d70-4047-9280-af2ffed34433"
      }
    ],
    "bonneReponse": "cadeee11-9427-4941-96f5-ef6b86752e47",
    "points": 1,
    "niveau": 8,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "4cd136ab-bb1b-4f67-a3e1-1cb6630c60e4",
    "texte": "?מה הם ראו בחיפה",
    "type": "qcm",
    "choix": [
      {
        "libelle": "את שוק מחנה יהודה",
        "valeur": "dbdabcce-0b5f-480a-a2a2-6163c3e87640"
      },
      {
        "libelle": "את הגנים הבהאיים",
        "valeur": "f8695109-d403-4534-b082-4ceed5107c11"
      },
      {
        "libelle": "את הים האדום",
        "valeur": "b2c92afe-348e-4064-982a-eae4b0eb24c9"
      },
      {
        "libelle": "את מוזיאון ישראל",
        "valeur": "0c4a3f0e-458b-48aa-8da3-5c04a9a46253"
      }
    ],
    "bonneReponse": "f8695109-d403-4534-b082-4ceed5107c11",
    "points": 1,
    "niveau": 8,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "25c1cd0a-9b5a-4f68-b814-fb79d2eb6523",
    "texte": "?למה דויד סיפר לשרה הרבה דברים על עכו",
    "type": "qcm",
    "choix": [
      {
        "libelle": "כי הוא גר שם",
        "valeur": "c0d472f6-b6df-4407-94ef-e37f2aba5997"
      },
      {
        "libelle": "כי הוא קרא על עכו לפני הטיול",
        "valeur": "18080527-0426-4f4e-9ef4-7f1927072fee"
      },
      {
        "libelle": "כי הוא עבד שם",
        "valeur": "3df6d959-c737-4d31-b965-b069776bb22f"
      },
      {
        "libelle": "כי הוא פגש שם חברים",
        "valeur": "056dcc7d-3f9b-4d4c-8084-a8566268be16"
      }
    ],
    "bonneReponse": "18080527-0426-4f4e-9ef4-7f1927072fee",
    "points": 1,
    "niveau": 8,
    "obligatoire": true,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "ea40ac43-462d-481c-aa56-c116ccc84ed3",
    "texte": "?מה הם עשו בערב בעכו",
    "type": "qcm",
    "choix": [
      {
        "libelle": "הם הלכו לשוק וקנו בגדים",
        "valeur": "b5170bfb-4db8-48c8-8513-95556a8ed22b"
      },
      {
        "libelle": "הם טיילו בעיר העתיקה, ראו את הנמל ואכלו במסעדה ליד הים",
        "valeur": "e7b55b01-b590-4359-9e46-ab5f0b25034e"
      },
      {
        "libelle": "הם הלכו לים ושחו",
        "valeur": "d23a1386-a2d8-4621-a878-b3daa96ac19b"
      },
      {
        "libelle": "הם ישבו בבית קפה וקראו עיתון",
        "valeur": "99b4ea95-601b-4716-bd6c-01e449d1b175"
      }
    ],
    "bonneReponse": "e7b55b01-b590-4359-9e46-ab5f0b25034e",
    "points": 1,
    "niveau": 8,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  },
  {
    "id": "5ed6eb50-c8c7-4b49-8e6d-1050866979a2",
    "texte": "?מה שרה הכי אהבה בטיול",
    "type": "qcm",
    "choix": [
      {
        "libelle": "את הנוף ואת האוכל",
        "valeur": "46d3c16e-6a9c-4445-bcc8-2972109d43c3"
      },
      {
        "libelle": "לראות את דויד מתרגש מכל דבר קטן",
        "valeur": "b1fe144c-0388-490c-8709-3681b52db5dc"
      },
      {
        "libelle": "את המסעדה ליד הים",
        "valeur": "47575e2f-39f9-4570-9997-5ebc5b64b7d4"
      },
      {
        "libelle": "את העיר העתיקה בעכו",
        "valeur": "ced8a254-6af2-4c70-b219-f6366f3383e6"
      }
    ],
    "bonneReponse": "b1fe144c-0388-490c-8709-3681b52db5dc",
    "points": 1,
    "niveau": 8,
    "obligatoire": false,
    "multiple": false,
    "aleatoire": true
  }
];

const parcours = {
  "adaptive": {
    "minLevel": 1,
    "maxLevel": 8,
    "selfAssessmentIds": [
      "283a501f-c840-4b74-9e88-545152769ef9",
      "547b1f37-9fc4-4f7b-8d47-73297c1dd2aa",
      "1933dae8-da62-464c-a72d-63141c72873b",
      "ce09c281-36db-4e76-ba69-778b64eb6172"
    ],
    "startLevelByYesCount": [1, 2, 3, 5, 6],
    "tests": {
      "1": {
        "primary": [
          "353a37e5-2d45-4bec-a856-a8312586b6f0",
          "7d872815-fb07-4dad-970a-c12a59b77380",
          "79016f08-b167-4aea-b25f-b7d493377d79"
        ],
        "tiebreaker": "09fb0a26-3791-46eb-9720-ac252185de1b"
      },
      "2": {
        "primary": [
          "aba182df-d9e1-4f89-892e-ca4d5e18a87a",
          "878251c4-943b-4a36-b04b-3ffae1149f8d",
          "52bbe157-368b-4628-927d-e81f0e3b02a7"
        ],
        "tiebreaker": "461c8c21-8667-411f-9ea0-4651c28be52b"
      },
      "3": {
        "primary": [
          "5a773145-2196-4bd2-a8ed-6e6fbeec249a",
          "d9c55183-b586-4b26-8242-8c6ab018efdd",
          "717115c8-ef1f-4408-92a0-2ced224873f7"
        ],
        "tiebreaker": "58d3f038-de5f-4cbf-87a4-7bb21c7ca566"
      },
      "4": {
        "primary": [
          "6c26eb82-61eb-415b-9ffc-92d46604623b",
          "8905ea6e-629c-4895-9077-8cf492bd732a",
          "35bfa2fa-0786-41e4-b608-284c24bcbdbd"
        ],
        "tiebreaker": "1368708d-2728-4a6d-bcb1-8b2c624373d2"
      },
      "5": {
        "primary": [
          "5b9d3541-f732-4777-b153-077c66b6dc14",
          "ff2dddac-c0bb-4097-8fed-9a6f103a82ac",
          "e8120fe8-f6e8-47d2-bed0-1fecee56705f"
        ],
        "tiebreaker": "e302de0c-d53b-4178-9f39-5fdea3170cc4"
      },
      "6": {
        "primary": [
          "d4c507c3-7dc8-4912-9405-988e25b71798",
          "ceb51992-d270-4ad8-a13a-7932528e6f6a",
          "77982966-0a9e-4665-951b-06bb50d6f128"
        ],
        "tiebreaker": "8a1c0335-c211-4de6-b128-358f661b3383"
      },
      "7": {
        "primary": [
          "f07549f6-f86e-45c5-826c-1e6ca1946b68",
          "e6232c0c-8bc9-4e71-b8cb-b43c74e1faf3",
          "676f6dd8-d851-4e2c-8d87-fc99ec97e798"
        ],
        "tiebreaker": "689f32fb-ab6f-4628-991e-2249c82de6cf"
      },
      "8": {
        "primary": [
          "ca4f4372-e545-4eab-8cdd-1f71ab790d63",
          "25c1cd0a-9b5a-4f68-b814-fb79d2eb6523",
          "5ed6eb50-c8c7-4b49-8e6d-1050866979a2"
        ],
        "tiebreaker": "ea40ac43-462d-481c-aa56-c116ccc84ed3"
      }
    }
  },
  "blocs": [
    {
      "id": "97c2ebd6-8ab3-4a23-a147-704aedcc9ede",
      "questions": [
        "bfff1062-27eb-455c-bb6b-ae72d17c0495",
        "283a501f-c840-4b74-9e88-545152769ef9",
        "547b1f37-9fc4-4f7b-8d47-73297c1dd2aa",
        "1933dae8-da62-464c-a72d-63141c72873b",
        "ce09c281-36db-4e76-ba69-778b64eb6172"
      ],
      "niveau": null,
      "stopOnNegative": true
    },
    {
      "id": "353a37e5-2d45-4bec-a856-a8312586b6f0",
      "questions": [
        "353a37e5-2d45-4bec-a856-a8312586b6f0"
      ],
      "niveau": 1
    },
    {
      "id": "75984511-b0a9-48e7-9690-c1d7c51d014a",
      "questions": [
        "75984511-b0a9-48e7-9690-c1d7c51d014a"
      ],
      "niveau": 1
    },
    {
      "id": "7d872815-fb07-4dad-970a-c12a59b77380",
      "questions": [
        "7d872815-fb07-4dad-970a-c12a59b77380"
      ],
      "niveau": 1
    },
    {
      "id": "f6c715f0-8b76-420b-8437-e916ad5dd2a2",
      "questions": [
        "f6c715f0-8b76-420b-8437-e916ad5dd2a2"
      ],
      "niveau": 1
    },
    {
      "id": "23c1d99b-11e2-45bd-a9f5-c46687c852c5",
      "questions": [
        "23c1d99b-11e2-45bd-a9f5-c46687c852c5"
      ],
      "niveau": 1
    },
    {
      "id": "f73924a9-685c-404a-815a-d9fc71dc8da8",
      "questions": [
        "f73924a9-685c-404a-815a-d9fc71dc8da8"
      ],
      "niveau": 1
    },
    {
      "id": "79016f08-b167-4aea-b25f-b7d493377d79",
      "questions": [
        "79016f08-b167-4aea-b25f-b7d493377d79"
      ],
      "niveau": 1
    },
    {
      "id": "09fb0a26-3791-46eb-9720-ac252185de1b",
      "questions": [
        "09fb0a26-3791-46eb-9720-ac252185de1b"
      ],
      "niveau": 1
    },
    {
      "id": "8982d9c6-c435-48ee-8d81-a50df364117a",
      "questions": [
        "8982d9c6-c435-48ee-8d81-a50df364117a"
      ],
      "niveau": null,
      "transition": true
    },
    {
      "id": "e99d6729-4b30-4262-969d-6a3fb81ed4d6",
      "questions": [
        "e99d6729-4b30-4262-969d-6a3fb81ed4d6"
      ],
      "niveau": 2
    },
    {
      "id": "d5d5f7ce-26b7-4c9f-9b6f-bbd130a8bba3",
      "questions": [
        "d5d5f7ce-26b7-4c9f-9b6f-bbd130a8bba3"
      ],
      "niveau": 2
    },
    {
      "id": "e2532221-f1f5-4584-a76f-d0d53be495a3",
      "questions": [
        "e2532221-f1f5-4584-a76f-d0d53be495a3"
      ],
      "niveau": 2
    },
    {
      "id": "03d9a516-adb7-4352-b865-68cd057a685c",
      "questions": [
        "03d9a516-adb7-4352-b865-68cd057a685c"
      ],
      "niveau": 2
    },
    {
      "id": "16f5a474-b09f-4239-96e5-738dcf92eb84",
      "questions": [
        "16f5a474-b09f-4239-96e5-738dcf92eb84"
      ],
      "niveau": 2
    },
    {
      "id": "2641df96-dac9-4b76-887c-12def6212b90",
      "questions": [
        "aba182df-d9e1-4f89-892e-ca4d5e18a87a",
        "878251c4-943b-4a36-b04b-3ffae1149f8d",
        "461c8c21-8667-411f-9ea0-4651c28be52b",
        "52bbe157-368b-4628-927d-e81f0e3b02a7"
      ],
      "niveau": 2
    },
    {
      "id": "0eb94c71-79ab-4c98-b1c4-5279a8bd85c4",
      "questions": [
        "0eb94c71-79ab-4c98-b1c4-5279a8bd85c4"
      ],
      "niveau": null,
      "transition": true
    },
    {
      "id": "d823e52d-47c1-44f0-865f-c7670a321e66",
      "questions": [
        "5a773145-2196-4bd2-a8ed-6e6fbeec249a",
        "77ee8816-b02a-4c9e-8cd9-6958ee50a348",
        "34d9ff13-4172-4492-9c89-9db75b4f67e3",
        "d9c55183-b586-4b26-8242-8c6ab018efdd",
        "69eff7a3-caad-43f9-8183-8c5a48221117",
        "58d3f038-de5f-4cbf-87a4-7bb21c7ca566",
        "f611c470-6cb3-4a75-8780-44998039019d",
        "717115c8-ef1f-4408-92a0-2ced224873f7"
      ],
      "niveau": 3,
      "passage": "‏החיים של אלה\n\nקוֹראִים לי אֵלָה. אני גרה בירוּשָלַים. אני עובדת בְּבֵית קָפֶה בירוּשָלַים. בבוקר, אני אוהבת לָלֶכֶת לבית הקפה בַּרֶגֶל. זה בית קפה גָדוֹל ויֵש שָם הַרְבֶּה אֲנָשים. אני מְאוֹד אוהבת לעבוד בבית קפה. בבית הקפה אני מְדַבֶּרֶת עם הַרְבֶּה אנשים. הרבה אנשים בָּאִים לבית הקפה, לאכול, לשתות או לדבר עם חָבֵרים\n\nביום שבת אני לא עובדת. ביום שבת אני אוהבת לָקוּם מאוחר, לֶאכול לְאַט ארוחת בוקר גְדוֹלָה, לִשתות לאט קפה טוֹב, לִקרוא קְצָת עיתון, לִשמוֹעַ מוּזיקה, לִראות קצת טֶלֶוִיזיָה\n לַעשות הַכּוֹל לאט\n\nביום שבת אני אוהבת לִנסוע לַמִשְפָּחָה. יֵש לִי מִשְפָּחָה קְטָנָה. הם גרים בבית קָטָן בְּבַת יָם, לְיָד הים\n\nאני גם סטודנטית. אני לומדת סִפְרוּת באוניברסיטה העברית בירושלים\nמה אני רוצה לעשות בַּחַיים? זאת שְאֵלָה טוֹבָה! אני לא יוֹדַעַת! אני לא יודעת מה אני רוצה לעשות בחיים ואיפה אני רוצה לגור!\nאני אוהבת לקרוא ספרים, אני אוהבת לשמוע מוזיקה, אני אוהבת לדבר עם אנשים, אבל אני רוצה גם כֶּסֶף! אני רוצה לגור בירושלים אבל אני גם רוצה לגור לְיָד המִשְפָּחָה\n?!מה לעשות"
    },
    {
      "id": "40e49b2e-f3cb-418e-a393-a32593404b5f",
      "questions": [
        "40e49b2e-f3cb-418e-a393-a32593404b5f"
      ],
      "niveau": null,
      "transition": true
    },
    {
      "id": "e95cdb50-c56a-4bc6-90bb-2f49a2c0e07e",
      "questions": [
        "62161c36-2655-4d0b-936c-3001344bd8d0",
        "4b8367b9-3bb5-4e32-9c21-18b4f0cec453",
        "1cd33add-43c8-4d86-8c8a-b0505c752bf2"
      ],
      "niveau": 4
    },
    {
      "id": "f143ce65-4f1d-44f3-8042-903d73aa8422",
      "questions": [
        "6c26eb82-61eb-415b-9ffc-92d46604623b",
        "8905ea6e-629c-4895-9077-8cf492bd732a",
        "1368708d-2728-4a6d-bcb1-8b2c624373d2",
        "35bfa2fa-0786-41e4-b608-284c24bcbdbd"
      ],
      "niveau": 4
    },
    {
      "id": "646a923f-8ff6-43a7-819c-93c54e72e586",
      "questions": [
        "646a923f-8ff6-43a7-819c-93c54e72e586"
      ],
      "niveau": null,
      "transition": true
    },
    {
      "id": "3daa5d9a-9469-416a-8fba-269d36f8f01e",
      "questions": [
        "6b1e5fc5-ced1-4e68-8656-53c6953783c2",
        "eb77db04-6fed-42df-8724-1079208663a8",
        "bcf6e8d7-3ea6-4f74-b2a9-4b73c338eced"
      ],
      "niveau": 5
    },
    {
      "id": "57368c5b-adb1-42ed-a68b-3ce99ee06876",
      "questions": [
        "5b9d3541-f732-4777-b153-077c66b6dc14",
        "69b2bcb2-dacf-4a95-8924-0d990240cdfa",
        "ff2dddac-c0bb-4097-8fed-9a6f103a82ac",
        "e302de0c-d53b-4178-9f39-5fdea3170cc4",
        "e8120fe8-f6e8-47d2-bed0-1fecee56705f"
      ],
      "niveau": 5,
      "passage": "העיר במדבר\n\n.מִצְפֶּה רָמוֹן היא עיר מיוחדת מאוד \n\nהיא נִמְצֵאת במדבר, 80 קִילוֹמֶטְרים מבֵאר שֶבַע\n\nבמצפה רמון גרים גם דָתִיִים וגם חִילוֹנִים, גם אַשְכְּנָזִים וגם מִזְרָחים, גם סטודנטים וגם משפחות עם ילדים, גם מוִזִיקָאִים וגם הַייטֵקִיסְטִים\n\nהרבה \"מִצְפָּאִים\" אומרים: אנחנו גרים במדבר כי אנחנו רוצים שקט. אנחנו אוהבים לטייל במדבר, לראות את הנוף היפה של מצפה רמון, לשמוע מוזיקה טובה ולחיות חיים טובים ורְגוּעִים\n\nהרבה אנשים אוהבים לבוא למצפה רמון – גם אנשים מישראל וגם אנשים מכל העולם. הם אוהבים לטייל במדבר, לקנות בחנויות, לאכול במסעדות\n\nהם אומרים: אנחנו אוהבים לבוא למצפה רמון כי במדבר אנחנו מַרְגִישִים טוב, בלי הרעש של העיר. פה יש חיים רְגוּעִים, פה יש שקט"
    },
    {
      "id": "37209185-6d5f-4382-8b38-f244f94cd8b0",
      "questions": [
        "37209185-6d5f-4382-8b38-f244f94cd8b0"
      ],
      "niveau": null,
      "transition": true
    },
    {
      "id": "8a0afacb-e718-496e-beae-a9f81ad597b6",
      "questions": [
        "89de6932-c2b6-49e5-91ff-4aea84479327",
        "5a89c8de-7dc3-4b5e-b856-66cdfc47ac66",
        "e0fa7a35-43ce-466b-9781-735f7d3808fd",
        "3c0f53c2-a764-4171-92c5-80f458046196",
        "dad9dbdf-2e0e-4980-abd5-4ac437540a62"
      ],
      "niveau": 6
    },
    {
      "id": "6b6cd9ca-5b70-4bb0-9444-11b8b3fe5f8c",
      "questions": [
        "d4c507c3-7dc8-4912-9405-988e25b71798",
        "ccf0d7de-1286-48aa-9c3c-9514e24ae9ae",
        "8a1c0335-c211-4de6-b128-358f661b3383",
        "ceb51992-d270-4ad8-a13a-7932528e6f6a",
        "77982966-0a9e-4665-951b-06bb50d6f128"
      ],
      "niveau": 6,
      "passage": "*תל אביב– עיר בלי הפסקה*\n\nתל אביב היא עיר גדולה, מיוחדת ומְפוּרְסֶמֶת בכל העולם. אנשים קוראים לה \"עִיר בלי הַפְסָקָה\" כי תָמִיד יש מה לראות ולעשות בתל \nאביב – גם ביום וגם בלילה\n\nבתל אביב יש הרבה שכונות מיוחדות ויפות. במרכז העיר יש הרבה מסעדות, בתי קפה, חנויות ושוק – שוק הכַּרְמֶל. בצפון העיר יש שכונות שקטות, בִּנְיָנִים מודרניים ופָארְקים גדולים, כמו פָּארְק היַרְקוֹן. בדרום העיר אין הרבה שקט אבל יש שכונות נחמדות וגם שוק מיוחד – שוק לְוִינְסְקִי. ביפו יש בתים עתיקים ושוק גדול – שוק הפִּשְפֵשִים \n\nתל אביב היא גם עיר האמָנוּת. יש שם מוזיאונים, גלריות, קוֹלְנוֹעַ, סִינֵמָטֵק, תֵאטרון, מוּזִיקָה ועוד. יש גם אמָנוּת רחוב, כמו גְרָפִיטִי בדרום העיר \n\nבתל אביב גרים הרבה אנשים – סטודנטים, הַיְטֶקִיסְטִים, אמָנִים, משפחות עם ילדים, אנשים מְפוּרְסָמִים ועוד \n\nהרבה תַיָרים מהעולם באים לתל אביב כל שנה. הם באים כי הם אוהבים את הים, את המסעדות והברים, את השכונות היפות, את האמָנוּת וגם את התֵל אָבִיבִים\n\nומה עם הישראלים? כל הישראלים מַכּירִים את תל אביב אבל לא כולם אוהבים את תל אביב"
    },
    {
      "id": "0383b52e-6fbf-4194-ac16-dc470a04e5de",
      "questions": [
        "0383b52e-6fbf-4194-ac16-dc470a04e5de"
      ],
      "niveau": null,
      "transition": true
    },
    {
      "id": "fe8d90ef-981f-42aa-95e2-73205a823a3b",
      "questions": [
        "52896224-320f-40ae-bdef-3118787d4180",
        "88ab5ea7-5076-47d2-a650-97ff6d219946",
        "4e9fbf1e-67f4-4d1a-b1ea-361c1385ec29",
        "6baab413-57a3-4575-8190-4cb7bbc850a9",
        "b8957826-b1be-4edf-af23-fe9876200914"
      ],
      "niveau": 7
    },
    {
      "id": "86b0681d-f638-4ed8-8cbf-b12441343fb1",
      "questions": [
        "f07549f6-f86e-45c5-826c-1e6ca1946b68",
        "689f32fb-ab6f-4628-991e-2249c82de6cf",
        "e6232c0c-8bc9-4e71-b8cb-b43c74e1faf3",
        "676f6dd8-d851-4e2c-8d87-fc99ec97e798"
      ],
      "niveau": 7,
      "passage": "*החיים החדשים של רמי*\n\nרמי גר בירושלים. בכל בוקר הוא קם מוקדם, הולך לעבודה ושותה קפה\n קטן בבית קפה ליד הבית \n\n.הוא אוהב לשבת שם, לקרוא עיתון ולדבר עם אנשים\n\nההורים שלו גרים בפריז. הם לא עובדים – הם בפנסיה. הם אוהבים לטייל בעיר, לשבת בגינה ולקרוא ספרים. לפעמים הם הולכים לשוק וקונים פירות וירקות\n\nדויד תמיד מסביר לרמי בטלפון איך לעשות דברים בבית, ושרה נזכרת בסיפורים ישנים ומספרת לרמי דברים מעניינים\n\nבעבודה, רמי כותב מיילים ומתכתב עם אנשים. לפעמים הוא מצליח להסביר מה הוא רוצה, ולפעמים הוא לא מצליח. כשהוא לא מצליח, הוא מרגיש לא טוב\n\nבערב רמי נפגש עם חברים בבית קפה או בים. לפעמים אין הרבה מקום בעיר והכיסאות נגמרים, ואז הם נשארים לעמוד. הוא מעדיף לשבת במקום עם שקט, אבל לפעמים הוא הולך למקום עם הרבה רעש כי החברים שלו ממליצים\n\nבימי שישי רמי הולך לשוק מחנה יהודה עם ג'סיקה. הם קונים אוכל, שותים מיץ, שומעים מוזיקה ומרגישים את סוף השבוע הישראלי\nרמי מתרגש מכל יום חדש. לפעמים הוא מרגיש שהוא לומד הרבה דברים חדשים, ולפעמים הוא אפילו מתאהב קצת – בעיר, בחיים, ובאנשים שהוא פוגש"
    },
    {
      "id": "8b2b6d34-3da7-4174-8504-01820608eac9",
      "questions": [
        "8b2b6d34-3da7-4174-8504-01820608eac9"
      ],
      "niveau": null,
      "transition": true
    },
    {
      "id": "532f2552-2196-4280-b402-f2c7f4620f03",
      "questions": [
        "6e4c3df8-f055-4da4-9cf1-52ab3333409f",
        "e1efeb3d-1554-4c72-8f47-d978996c1c53",
        "aca959fb-87eb-4ddb-90be-942ec58555f4",
        "70910ea6-a6fd-49a3-81c0-f1e535f307a5"
      ],
      "niveau": 8
    },
    {
      "id": "9f0e2fb4-ee7c-4e01-9ef8-9b7f8d4065cf",
      "questions": [
        "ca4f4372-e545-4eab-8cdd-1f71ab790d63",
        "4cd136ab-bb1b-4f67-a3e1-1cb6630c60e4",
        "25c1cd0a-9b5a-4f68-b814-fb79d2eb6523",
        "ea40ac43-462d-481c-aa56-c116ccc84ed3",
        "5ed6eb50-c8c7-4b49-8e6d-1050866979a2"
      ],
      "niveau": 8,
      "passage": "*הטיול המיוחד של דויד ושרה*\n\nלפני כמה ימים ג'סיקה פגשה את אימא ואבא שלה, דויד ושרה. הם נפגשו כי ג'סיקה רצתה לשמוע איך היה הטיול של דויד ושרה לחיפה ולעכו\n\nשרה אמרה: \"היה לנו טיול מדהים! בחיפה ראינו את הגנים הבהאיים ולמדנו הרבה דברים חדשים. לפני הטיול לא ידעתי למה המקומות הקדושים של הבהאים נמצאים בישראל, אבל אחר כך המדריכה הסבירה לנו הכול\n\nאחר כך שרה אמרה לג'סיקה שהם גם נסעו לעכו. בדרך לעכו, דויד סיפר לה הרבה על ההיסטוריה של העיר. הוא קרא על עכו לפני הטיול ורצה להסביר לה הכול. בערב הם טיילו בעיר העתיקה, ראו את הנמל ואכלו במסעדה קטנה ליד הים\n\n?ג'סיקה שאלה: ומה הכי אהבתם\n\nשרה אמרה: \"זאת שאלה קשה! אהבתי את הנוף, את האוכל ואת האנשים. אבל הכי אהבתי לראות את אבא שלך מתרגש מכל דבר קטן\n\nדויד צחק ואמר: \"זה לא נכון! פשוט הייתי שמח"
    }
  ],
  "regles": {
    "97c2ebd6-8ab3-4a23-a147-704aedcc9ede": [
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "e95cdb50-c56a-4bc6-90bb-2f49a2c0e07e"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "equal",
              "vars": [
                {
                  "type": "field",
                  "value": "283a501f-c840-4b74-9e88-545152769ef9"
                },
                {
                  "type": "constant",
                  "value": true
                }
              ]
            },
            {
              "op": "equal",
              "vars": [
                {
                  "type": "field",
                  "value": "547b1f37-9fc4-4f7b-8d47-73297c1dd2aa"
                },
                {
                  "type": "constant",
                  "value": true
                }
              ]
            },
            {
              "op": "equal",
              "vars": [
                {
                  "type": "field",
                  "value": "1933dae8-da62-464c-a72d-63141c72873b"
                },
                {
                  "type": "constant",
                  "value": true
                }
              ]
            },
            {
              "op": "equal",
              "vars": [
                {
                  "type": "field",
                  "value": "ce09c281-36db-4e76-ba69-778b64eb6172"
                },
                {
                  "type": "constant",
                  "value": true
                }
              ]
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "is",
          "vars": [
            {
              "type": "field",
              "value": "bfff1062-27eb-455c-bb6b-ae72d17c0495"
            },
            {
              "type": "constant",
              "value": false
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "353a37e5-2d45-4bec-a856-a8312586b6f0"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "353a37e5-2d45-4bec-a856-a8312586b6f0": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr1"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "353a37e5-2d45-4bec-a856-a8312586b6f0"
            },
            {
              "type": "choice",
              "value": "b8ccb0eb-f400-4127-9473-ca8d4bfa4344"
            }
          ]
        }
      }
    ],
    "75984511-b0a9-48e7-9690-c1d7c51d014a": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr1"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "75984511-b0a9-48e7-9690-c1d7c51d014a"
            },
            {
              "type": "choice",
              "value": "062c8e3f-a8ad-4b82-9f4e-efff78299364"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr1"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "7d872815-fb07-4dad-970a-c12a59b77380"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "7d872815-fb07-4dad-970a-c12a59b77380": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr1"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "7d872815-fb07-4dad-970a-c12a59b77380"
            },
            {
              "type": "choice",
              "value": "fe6e8015-edcc-4364-8750-75167f8b18d7"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr1"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "f6c715f0-8b76-420b-8437-e916ad5dd2a2"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "f6c715f0-8b76-420b-8437-e916ad5dd2a2": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr1"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "f6c715f0-8b76-420b-8437-e916ad5dd2a2"
            },
            {
              "type": "choice",
              "value": "7ee5d900-b2d0-4480-8ea0-6b08c60870eb"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr1"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "23c1d99b-11e2-45bd-a9f5-c46687c852c5"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "23c1d99b-11e2-45bd-a9f5-c46687c852c5": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr1"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "23c1d99b-11e2-45bd-a9f5-c46687c852c5"
            },
            {
              "type": "choice",
              "value": "cd15b134-956a-4a28-a1ff-aa6cfdf3a33e"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr1"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "f73924a9-685c-404a-815a-d9fc71dc8da8"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "f73924a9-685c-404a-815a-d9fc71dc8da8": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr1"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "f73924a9-685c-404a-815a-d9fc71dc8da8"
            },
            {
              "type": "choice",
              "value": "3e627082-8c84-499f-a913-ecaa4257c7c3"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr1"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "79016f08-b167-4aea-b25f-b7d493377d79"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "79016f08-b167-4aea-b25f-b7d493377d79": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr1"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "79016f08-b167-4aea-b25f-b7d493377d79"
            },
            {
              "type": "choice",
              "value": "dde914a3-ef19-4ad1-a1e6-4b5a84e4cf5a"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr1"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "09fb0a26-3791-46eb-9720-ac252185de1b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "09fb0a26-3791-46eb-9720-ac252185de1b": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr1"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "09fb0a26-3791-46eb-9720-ac252185de1b"
            },
            {
              "type": "choice",
              "value": "38529394-5fd2-43e8-905e-46255dcd9924"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "niveau_lavi"
          },
          "value": {
            "type": "constant",
            "value": "2"
          }
        },
        "condition": {
          "op": "lower_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr1"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr1"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "8982d9c6-c435-48ee-8d81-a50df364117a"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "8982d9c6-c435-48ee-8d81-a50df364117a": [
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "e99d6729-4b30-4262-969d-6a3fb81ed4d6"
          }
        },
        "condition": {
          "op": "is",
          "vars": [
            {
              "type": "field",
              "value": "8982d9c6-c435-48ee-8d81-a50df364117a"
            },
            {
              "type": "constant",
              "value": true
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "e99d6729-4b30-4262-969d-6a3fb81ed4d6": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr2"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "e99d6729-4b30-4262-969d-6a3fb81ed4d6"
            },
            {
              "type": "choice",
              "value": "d94cd757-c4ce-4e82-9f9b-c5d86e1e96e7"
            }
          ]
        }
      }
    ],
    "d5d5f7ce-26b7-4c9f-9b6f-bbd130a8bba3": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr2"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "d5d5f7ce-26b7-4c9f-9b6f-bbd130a8bba3"
            },
            {
              "type": "choice",
              "value": "93b7ecbb-cde2-4bb4-8e00-fc596072bfc6"
            }
          ]
        }
      }
    ],
    "e2532221-f1f5-4584-a76f-d0d53be495a3": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr2"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "e2532221-f1f5-4584-a76f-d0d53be495a3"
            },
            {
              "type": "choice",
              "value": "ee09e69e-e7cf-4f0f-9fbf-eb18238572e6"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr2"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "03d9a516-adb7-4352-b865-68cd057a685c"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "03d9a516-adb7-4352-b865-68cd057a685c": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr2"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "03d9a516-adb7-4352-b865-68cd057a685c"
            },
            {
              "type": "choice",
              "value": "dd4f3660-94d4-4ce4-80c4-cba774fc95fd"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr2"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "16f5a474-b09f-4239-96e5-738dcf92eb84"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "16f5a474-b09f-4239-96e5-738dcf92eb84": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr2"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "16f5a474-b09f-4239-96e5-738dcf92eb84"
            },
            {
              "type": "choice",
              "value": "bf89b6ea-00c1-4e99-8e9e-95479b1663cc"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr2"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "2641df96-dac9-4b76-887c-12def6212b90"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "2641df96-dac9-4b76-887c-12def6212b90": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr2"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "aba182df-d9e1-4f89-892e-ca4d5e18a87a"
            },
            {
              "type": "choice",
              "value": "f1a8ef91-5bdb-4667-a204-11a6aa93e7bf"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr2"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "878251c4-943b-4a36-b04b-3ffae1149f8d"
            },
            {
              "type": "choice",
              "value": "c295f5ef-f921-4849-88f9-1487500c4c76"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr2"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "461c8c21-8667-411f-9ea0-4651c28be52b"
            },
            {
              "type": "choice",
              "value": "a133997f-67b8-450f-82b7-d2112e7a6e71"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr2"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "52bbe157-368b-4628-927d-e81f0e3b02a7"
            },
            {
              "type": "choice",
              "value": "de901e2f-b935-472d-9992-fdb25fd25433"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "niveau_lavi"
          },
          "value": {
            "type": "constant",
            "value": "3"
          }
        },
        "condition": {
          "op": "lower_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr2"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr2"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "0eb94c71-79ab-4c98-b1c4-5279a8bd85c4"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "0eb94c71-79ab-4c98-b1c4-5279a8bd85c4": [
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "d823e52d-47c1-44f0-865f-c7670a321e66"
          }
        },
        "condition": {
          "op": "is",
          "vars": [
            {
              "type": "field",
              "value": "0eb94c71-79ab-4c98-b1c4-5279a8bd85c4"
            },
            {
              "type": "constant",
              "value": true
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "d823e52d-47c1-44f0-865f-c7670a321e66": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr3"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "5a773145-2196-4bd2-a8ed-6e6fbeec249a"
            },
            {
              "type": "choice",
              "value": "3cbcccb4-c5a0-42c2-9599-d51c6e12b4a1"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr3"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "77ee8816-b02a-4c9e-8cd9-6958ee50a348"
            },
            {
              "type": "choice",
              "value": "ee67e191-c6a2-4dca-a22a-53d8a19b125c"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr3"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "34d9ff13-4172-4492-9c89-9db75b4f67e3"
            },
            {
              "type": "choice",
              "value": "17ae6970-bc8d-4905-908d-e32dc3de193e"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr3"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "d9c55183-b586-4b26-8242-8c6ab018efdd"
            },
            {
              "type": "choice",
              "value": "e3ba64d6-152d-4360-b8cd-6c01f360458a"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr3"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "69eff7a3-caad-43f9-8183-8c5a48221117"
            },
            {
              "type": "choice",
              "value": "2b254fbc-b443-4c55-8258-f7e83d909ff5"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr3"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "58d3f038-de5f-4cbf-87a4-7bb21c7ca566"
            },
            {
              "type": "choice",
              "value": "fe232a95-2c7e-492f-ae1d-53b829a32927"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr3"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "f611c470-6cb3-4a75-8780-44998039019d"
            },
            {
              "type": "choice",
              "value": "daaf51f4-a14a-4105-831f-0d66ec102299"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr3"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "717115c8-ef1f-4408-92a0-2ced224873f7"
            },
            {
              "type": "choice",
              "value": "653d789c-2daf-42b9-8800-eabb42f3d07a"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "niveau_lavi"
          },
          "value": {
            "type": "constant",
            "value": "4"
          }
        },
        "condition": {
          "op": "lower_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr3"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr3"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "40e49b2e-f3cb-418e-a393-a32593404b5f"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "40e49b2e-f3cb-418e-a393-a32593404b5f": [
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "e95cdb50-c56a-4bc6-90bb-2f49a2c0e07e"
          }
        },
        "condition": {
          "op": "is",
          "vars": [
            {
              "type": "field",
              "value": "40e49b2e-f3cb-418e-a393-a32593404b5f"
            },
            {
              "type": "constant",
              "value": true
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "e95cdb50-c56a-4bc6-90bb-2f49a2c0e07e": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr4"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "62161c36-2655-4d0b-936c-3001344bd8d0"
            },
            {
              "type": "choice",
              "value": "fdc16f89-1746-479b-af56-1871186c5dbb"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr4"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "4b8367b9-3bb5-4e32-9c21-18b4f0cec453"
            },
            {
              "type": "choice",
              "value": "5eb522aa-c671-45cc-abc2-9737afad05e4"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr4"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "1cd33add-43c8-4d86-8c8a-b0505c752bf2"
            },
            {
              "type": "choice",
              "value": "332b883a-fbab-4992-8e9c-e3a303624593"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "niveau_lavi"
          },
          "value": {
            "type": "constant",
            "value": "3"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "mr4"
                },
                {
                  "type": "constant",
                  "value": 3
                }
              ]
            },
            {
              "op": "not_equal",
              "vars": [
                {
                  "type": "variable",
                  "value": "niveau_lavi"
                },
                {
                  "type": "constant",
                  "value": "4"
                }
              ]
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "mr4"
                },
                {
                  "type": "constant",
                  "value": 3
                }
              ]
            },
            {
              "op": "equal",
              "vars": [
                {
                  "type": "variable",
                  "value": "niveau_lavi"
                },
                {
                  "type": "constant",
                  "value": "4"
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "equal",
          "vars": [
            {
              "type": "variable",
              "value": "niveau_lavi"
            },
            {
              "type": "constant",
              "value": "3"
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "f143ce65-4f1d-44f3-8042-903d73aa8422"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "f143ce65-4f1d-44f3-8042-903d73aa8422": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr4"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "6c26eb82-61eb-415b-9ffc-92d46604623b"
            },
            {
              "type": "choice",
              "value": "d15d87f5-afa6-4763-84ea-1080d01fec99"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr4"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "35bfa2fa-0786-41e4-b608-284c24bcbdbd"
            },
            {
              "type": "choice",
              "value": "edfdbc99-bf64-4fe9-b04b-cd46aa1c8608"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr4"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "8905ea6e-629c-4895-9077-8cf492bd732a"
            },
            {
              "type": "choice",
              "value": "fa16ad9f-8b4b-4ced-8c31-bb496d2677b6"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr4"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "1368708d-2728-4a6d-bcb1-8b2c624373d2"
            },
            {
              "type": "choice",
              "value": "45b9f4be-f670-4e13-8d97-eed5c5d8b473"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "niveau_lavi"
          },
          "value": {
            "type": "constant",
            "value": "5"
          }
        },
        "condition": {
          "op": "lower_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr4"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "niveau_lavi"
          },
          "value": {
            "type": "constant",
            "value": "3"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "mr4"
                },
                {
                  "type": "constant",
                  "value": 3
                }
              ]
            },
            {
              "op": "not_equal",
              "vars": [
                {
                  "type": "variable",
                  "value": "niveau_lavi"
                },
                {
                  "type": "constant",
                  "value": "4"
                }
              ]
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "mr4"
                },
                {
                  "type": "constant",
                  "value": 3
                }
              ]
            },
            {
              "op": "equal",
              "vars": [
                {
                  "type": "variable",
                  "value": "niveau_lavi"
                },
                {
                  "type": "constant",
                  "value": "4"
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "equal",
          "vars": [
            {
              "type": "variable",
              "value": "niveau_lavi"
            },
            {
              "type": "constant",
              "value": "3"
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "646a923f-8ff6-43a7-819c-93c54e72e586"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "646a923f-8ff6-43a7-819c-93c54e72e586": [
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "3daa5d9a-9469-416a-8fba-269d36f8f01e"
          }
        },
        "condition": {
          "op": "is",
          "vars": [
            {
              "type": "field",
              "value": "646a923f-8ff6-43a7-819c-93c54e72e586"
            },
            {
              "type": "constant",
              "value": true
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "3daa5d9a-9469-416a-8fba-269d36f8f01e": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr5"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "6b1e5fc5-ced1-4e68-8656-53c6953783c2"
            },
            {
              "type": "choice",
              "value": "2e3d6d9f-4348-47ad-b807-c450a6934b6d"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr5"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "eb77db04-6fed-42df-8724-1079208663a8"
            },
            {
              "type": "choice",
              "value": "ed0d045b-a53a-40af-9944-635f7c2ec6c6"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr5"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "bcf6e8d7-3ea6-4f74-b2a9-4b73c338eced"
            },
            {
              "type": "choice",
              "value": "758ef4f3-a638-4b3d-b212-c771a7355e6f"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr5"
            },
            {
              "type": "constant",
              "value": 2
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "57368c5b-adb1-42ed-a68b-3ce99ee06876"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "57368c5b-adb1-42ed-a68b-3ce99ee06876": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr5"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "5b9d3541-f732-4777-b153-077c66b6dc14"
            },
            {
              "type": "choice",
              "value": "5a1c5272-6003-48f7-a71e-944419c3088b"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr5"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "69b2bcb2-dacf-4a95-8924-0d990240cdfa"
            },
            {
              "type": "choice",
              "value": "3401d2e4-7a2d-42ff-b98c-e9a4a897dab3"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr5"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "ff2dddac-c0bb-4097-8fed-9a6f103a82ac"
            },
            {
              "type": "choice",
              "value": "3413b64b-1988-4f1d-b938-a32a2e3c2769"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr5"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "e302de0c-d53b-4178-9f39-5fdea3170cc4"
            },
            {
              "type": "choice",
              "value": "25733df9-6e07-492c-9834-5f858decc779"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr5"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "e8120fe8-f6e8-47d2-bed0-1fecee56705f"
            },
            {
              "type": "choice",
              "value": "d616747e-d58b-4d8b-a44b-a62a617d6e0b"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "niveau_lavi"
          },
          "value": {
            "type": "constant",
            "value": "6"
          }
        },
        "condition": {
          "op": "lower_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr5"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr5"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "37209185-6d5f-4382-8b38-f244f94cd8b0"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "37209185-6d5f-4382-8b38-f244f94cd8b0": [
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "8a0afacb-e718-496e-beae-a9f81ad597b6"
          }
        },
        "condition": {
          "op": "is",
          "vars": [
            {
              "type": "field",
              "value": "37209185-6d5f-4382-8b38-f244f94cd8b0"
            },
            {
              "type": "constant",
              "value": true
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "8a0afacb-e718-496e-beae-a9f81ad597b6": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr6"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "89de6932-c2b6-49e5-91ff-4aea84479327"
            },
            {
              "type": "choice",
              "value": "9385d012-884b-4fe7-8447-813ea437b328"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr6"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "3c0f53c2-a764-4171-92c5-80f458046196"
            },
            {
              "type": "choice",
              "value": "aa5f47f9-16d1-44bb-aae9-05d75dff4ed4"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr6"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "5a89c8de-7dc3-4b5e-b856-66cdfc47ac66"
            },
            {
              "type": "choice",
              "value": "1fe0d702-e448-4294-85aa-a6340444be8d"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr6"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "e0fa7a35-43ce-466b-9781-735f7d3808fd"
            },
            {
              "type": "choice",
              "value": "d030199e-a24c-4d14-9fa8-5470d8bc4de7"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr6"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "dad9dbdf-2e0e-4980-abd5-4ac437540a62"
            },
            {
              "type": "choice",
              "value": "5a05b588-7aae-4314-af8a-a7408ac9ccb4"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr6"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "6b6cd9ca-5b70-4bb0-9444-11b8b3fe5f8c"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "6b6cd9ca-5b70-4bb0-9444-11b8b3fe5f8c": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr6"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "d4c507c3-7dc8-4912-9405-988e25b71798"
            },
            {
              "type": "choice",
              "value": "719e53d5-cdda-4d71-a453-a2865a3c6571"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr6"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "ccf0d7de-1286-48aa-9c3c-9514e24ae9ae"
            },
            {
              "type": "choice",
              "value": "2f33b348-d245-4079-b2e1-52e2d908f00e"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr6"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "8a1c0335-c211-4de6-b128-358f661b3383"
            },
            {
              "type": "choice",
              "value": "906c7852-48b4-4301-894d-2f9c15050e23"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr6"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "ceb51992-d270-4ad8-a13a-7932528e6f6a"
            },
            {
              "type": "choice",
              "value": "0c632151-1f7a-4cfe-bed7-165de21ca370"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr6"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "77982966-0a9e-4665-951b-06bb50d6f128"
            },
            {
              "type": "choice",
              "value": "184aebcf-8a97-4210-9492-a91aec746589"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "niveau_lavi"
          },
          "value": {
            "type": "constant",
            "value": "7"
          }
        },
        "condition": {
          "op": "lower_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr6"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr6"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "0383b52e-6fbf-4194-ac16-dc470a04e5de"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "0383b52e-6fbf-4194-ac16-dc470a04e5de": [
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "fe8d90ef-981f-42aa-95e2-73205a823a3b"
          }
        },
        "condition": {
          "op": "is",
          "vars": [
            {
              "type": "field",
              "value": "0383b52e-6fbf-4194-ac16-dc470a04e5de"
            },
            {
              "type": "constant",
              "value": true
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "fe8d90ef-981f-42aa-95e2-73205a823a3b": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr7"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "52896224-320f-40ae-bdef-3118787d4180"
            },
            {
              "type": "choice",
              "value": "4dc39795-7dab-4ac2-9986-67300549ee89"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr7"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "88ab5ea7-5076-47d2-a650-97ff6d219946"
            },
            {
              "type": "choice",
              "value": "e97f1616-2f62-4963-976e-0f27cba9ffa7"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr7"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "4e9fbf1e-67f4-4d1a-b1ea-361c1385ec29"
            },
            {
              "type": "choice",
              "value": "6de521fa-aaab-4665-b9c9-92e74673ee17"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr7"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "6baab413-57a3-4575-8190-4cb7bbc850a9"
            },
            {
              "type": "choice",
              "value": "5f7a8a2d-ced3-4422-a790-4987967d4bbd"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr7"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "b8957826-b1be-4edf-af23-fe9876200914"
            },
            {
              "type": "choice",
              "value": "909f62ab-9b8c-4f62-83cd-8bb3383ead0b"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr7"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "86b0681d-f638-4ed8-8cbf-b12441343fb1"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "86b0681d-f638-4ed8-8cbf-b12441343fb1": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr7"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "f07549f6-f86e-45c5-826c-1e6ca1946b68"
            },
            {
              "type": "choice",
              "value": "dac86dab-d4d6-4e1c-87c6-d5a91cc6c5e8"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr7"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "689f32fb-ab6f-4628-991e-2249c82de6cf"
            },
            {
              "type": "choice",
              "value": "8bb7bb7b-a0c7-4acf-b96a-4f83dde32364"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr7"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "e6232c0c-8bc9-4e71-b8cb-b43c74e1faf3"
            },
            {
              "type": "choice",
              "value": "2caa7d8c-47cc-4829-b062-ebb5998a07a3"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr7"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "676f6dd8-d851-4e2c-8d87-fc99ec97e798"
            },
            {
              "type": "choice",
              "value": "c622ed3b-f60d-4344-940f-b309900898fd"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "niveau_lavi"
          },
          "value": {
            "type": "constant",
            "value": "8"
          }
        },
        "condition": {
          "op": "lower_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr7"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr7"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "8b2b6d34-3da7-4174-8504-01820608eac9"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "8b2b6d34-3da7-4174-8504-01820608eac9": [
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "532f2552-2196-4280-b402-f2c7f4620f03"
          }
        },
        "condition": {
          "op": "is",
          "vars": [
            {
              "type": "field",
              "value": "8b2b6d34-3da7-4174-8504-01820608eac9"
            },
            {
              "type": "constant",
              "value": true
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "532f2552-2196-4280-b402-f2c7f4620f03": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr8"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "6e4c3df8-f055-4da4-9cf1-52ab3333409f"
            },
            {
              "type": "choice",
              "value": "cfcd1b83-f3c4-494b-8e70-11b545a5d387"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr8"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "e1efeb3d-1554-4c72-8f47-d978996c1c53"
            },
            {
              "type": "choice",
              "value": "82c713d1-c0f9-406a-9efe-4466d95b58bf"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr8"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "aca959fb-87eb-4ddb-90be-942ec58555f4"
            },
            {
              "type": "choice",
              "value": "40b51f48-0549-487f-a914-24af6f7b880f"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr8"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "70910ea6-a6fd-49a3-81c0-f1e535f307a5"
            },
            {
              "type": "choice",
              "value": "cef80365-38ad-4504-be45-393c0341c38a"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "greater_equal_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr8"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "9f0e2fb4-ee7c-4e01-9ef8-9b7f8d4065cf"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "9f0e2fb4-ee7c-4e01-9ef8-9b7f8d4065cf": [
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr8"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "ca4f4372-e545-4eab-8cdd-1f71ab790d63"
            },
            {
              "type": "choice",
              "value": "cadeee11-9427-4941-96f5-ef6b86752e47"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr8"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "4cd136ab-bb1b-4f67-a3e1-1cb6630c60e4"
            },
            {
              "type": "choice",
              "value": "f8695109-d403-4534-b082-4ceed5107c11"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr8"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "25c1cd0a-9b5a-4f68-b814-fb79d2eb6523"
            },
            {
              "type": "choice",
              "value": "18080527-0426-4f4e-9ef4-7f1927072fee"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr8"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "ea40ac43-462d-481c-aa56-c116ccc84ed3"
            },
            {
              "type": "choice",
              "value": "e7b55b01-b590-4359-9e46-ab5f0b25034e"
            }
          ]
        }
      },
      {
        "action": "add",
        "details": {
          "target": {
            "type": "variable",
            "value": "mr8"
          },
          "value": {
            "type": "constant",
            "value": 1
          }
        },
        "condition": {
          "op": "is_not",
          "vars": [
            {
              "type": "field",
              "value": "5ed6eb50-c8c7-4b49-8e6d-1050866979a2"
            },
            {
              "type": "choice",
              "value": "b1fe144c-0388-490c-8709-3681b52db5dc"
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "niveau_lavi"
          },
          "value": {
            "type": "constant",
            "value": "9"
          }
        },
        "condition": {
          "op": "lower_than",
          "vars": [
            {
              "type": "variable",
              "value": "mr8"
            },
            {
              "type": "constant",
              "value": 3
            }
          ]
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ]
  },
  "variables": {
    "correct_answers": 0,
    "counter_492ab8e5_3c9d_44af_b1f2_94d53b992d8b": 0,
    "max_score": 0,
    "mr1": 0,
    "mr2": 0,
    "mr3": 0,
    "mr4": 0,
    "mr5": 0,
    "mr6": 0,
    "mr7": 0,
    "mr8": 0,
    "niveau_lavi": "1",
    "quiz_score": 0,
    "score": 0,
    "total_scorable_questions": 0,
    "winning_outcome_id": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
  },
  "reglesEnfantsSource": {
    "eb133ca8-54dc-489f-9b9a-2f1ab4553326": [
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "field",
            "value": "e95cdb50-c56a-4bc6-90bb-2f49a2c0e07e"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "equal",
              "vars": [
                {
                  "type": "field",
                  "value": "283a501f-c840-4b74-9e88-545152769ef9"
                },
                {
                  "type": "constant",
                  "value": true
                }
              ]
            },
            {
              "op": "equal",
              "vars": [
                {
                  "type": "field",
                  "value": "547b1f37-9fc4-4f7b-8d47-73297c1dd2aa"
                },
                {
                  "type": "constant",
                  "value": true
                }
              ]
            },
            {
              "op": "equal",
              "vars": [
                {
                  "type": "field",
                  "value": "1933dae8-da62-464c-a72d-63141c72873b"
                },
                {
                  "type": "constant",
                  "value": true
                }
              ]
            },
            {
              "op": "equal",
              "vars": [
                {
                  "type": "field",
                  "value": "ce09c281-36db-4e76-ba69-778b64eb6172"
                },
                {
                  "type": "constant",
                  "value": true
                }
              ]
            }
          ]
        }
      }
    ],
    "461c8c21-8667-411f-9ea0-4651c28be52b": [
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "52bbe157-368b-4628-927d-e81f0e3b02a7": [
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "1368708d-2728-4a6d-bcb1-8b2c624373d2": [
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "6b1e5fc5-ced1-4e68-8656-53c6953783c2": [
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "bcf6e8d7-3ea6-4f74-b2a9-4b73c338eced": [
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "e8120fe8-f6e8-47d2-bed0-1fecee56705f": [
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "dad9dbdf-2e0e-4980-abd5-4ac437540a62": [
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "77982966-0a9e-4665-951b-06bb50d6f128": [
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "b8957826-b1be-4edf-af23-fe9876200914": [
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "676f6dd8-d851-4e2c-8d87-fc99ec97e798": [
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "70910ea6-a6fd-49a3-81c0-f1e535f307a5": [
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ],
    "5ed6eb50-c8c7-4b49-8e6d-1050866979a2": [
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      },
      {
        "action": "set",
        "details": {
          "target": {
            "type": "variable",
            "value": "winning_outcome_id"
          },
          "value": {
            "type": "constant",
            "value": "488309ba-4a2f-46ed-ade5-fdc470e1019b"
          }
        },
        "condition": {
          "op": "and",
          "vars": [
            {
              "op": "greater_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            },
            {
              "op": "lower_equal_than",
              "vars": [
                {
                  "type": "variable",
                  "value": "quiz_score"
                },
                {
                  "type": "constant",
                  "value": 0
                }
              ]
            }
          ]
        }
      },
      {
        "action": "jump",
        "details": {
          "to": {
            "type": "outcome",
            "value": "winning_outcome_id"
          }
        },
        "condition": {
          "op": "always",
          "vars": []
        }
      }
    ]
  }
};
