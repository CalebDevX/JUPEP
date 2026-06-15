import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, ChevronDown, ChevronRight, BookOpen, Landmark, Cross, Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Topic {
  title: string;
  subtopics?: string[];
  details?: string[];
}

interface Course {
  code: string;
  title: string;
  units: number;
  semester: 1 | 2;
  objectives: string[];
  topics: Topic[];
}

interface Subject {
  name: string;
  code: string;
  icon: any;
  gradient: string;
  accent: string;
  glow: string;
  description: string;
  generalObjectives: string[];
  courses: Course[];
}

const SYLLABUS_DATA: Subject[] = [
  {
    name: "Literature-in-English",
    code: "LIT",
    icon: BookOpen,
    gradient: "from-violet-600/20 to-purple-900/10",
    accent: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    glow: "shadow-violet-500/20",
    description: "Covers Drama, Prose Fiction, Poetry and Literary Appreciation across four papers.",
    generalObjectives: [
      "Understand the forms, structure, and tradition of Drama, Prose and Poetry",
      "Analyse set texts critically with attention to theme, character, language and form",
      "Appreciate both African and European literary traditions",
      "Develop skills of unseen literary appreciation and criticism",
    ],
    courses: [
      {
        code: "LIT 001",
        title: "Introduction to Drama",
        units: 3,
        semester: 1,
        objectives: [
          "Define drama and trace its origin",
          "Identify the types and structural elements of drama",
          "Analyse classical, Renaissance, modern European, American and African dramatic traditions",
          "Critically examine set texts from each tradition",
        ],
        topics: [
          {
            title: "Introduction to Drama",
            subtopics: ["Definition of drama/theatre", "Origin of drama/theatre", "Relevance of drama to society"],
            details: [
              "Types/Forms: Tragedy, Comedy, Melodrama, Farce, Tragicomedy",
              "Structure of drama: Plot (conflict, climax, resolution), Character, Language, Themes, Stage directions",
            ],
          },
          {
            title: "The Classical Tradition",
            subtopics: ["Greek Theatre", "Major Playwrights and Theorists"],
            details: [
              "Sophocles, Aeschylus, Euripides, Aristophanes, Aristotle",
              "Aristotle's Poetics: catharsis, hamartia, hubris, the unities",
              "Recommended texts: Sophocles' King Oedipus and Antigone",
            ],
          },
          {
            title: "European Drama — The Renaissance Tradition",
            subtopics: ["William Shakespeare", "Christopher Marlowe"],
            details: [
              "Shakespeare's England; Drama in the Elizabethan and Jacobean Ages",
              "Textual Studies: Macbeth, Hamlet (tragedy); Twelfth Night, Merchant of Venice (comedy)",
              "Structure and elements of drama — in-depth analysis of at least one tragedy and one comedy",
            ],
          },
          {
            title: "European Drama — The Modern Tradition",
            subtopics: ["Henrik Ibsen", "George Bernard Shaw", "Chekhov, Brecht, Beckett"],
            details: [
              "Background to Modern Drama: realism, naturalism, social critique",
              "Ibsen and Shaw in the Modern Period",
              "Textual Studies: Shaw's Mrs Warren's Profession OR Ibsen's Hedda Gabler",
            ],
          },
          {
            title: "American Drama — The Modern Tradition",
            subtopics: ["Arthur Miller, Tennessee Williams", "August Wilson and Amiri Baraka"],
            details: [
              "Background to American Drama; Drama and the Modern American Society",
              "Textual Studies: Wilson's Fences OR Baraka's Dutchman",
            ],
          },
          {
            title: "African Drama — The Modern Tradition",
            subtopics: ["Wole Soyinka", "Ama Ata Aidoo", "J.P. Clark-Bekederemo, Zulu Sofola, Femi Osofisan"],
            details: [
              "Background to African Drama; Drama in Modern African Society",
              "Textual Studies: Soyinka's Death and the King's Horseman OR Aidoo's Dilemma of a Ghost",
            ],
          },
        ],
      },
      {
        code: "LIT 002",
        title: "Prose Fiction",
        units: 3,
        semester: 1,
        objectives: [
          "Define and trace the development of prose fiction",
          "Identify types and structural elements of prose",
          "Analyse the European and African prose traditions",
          "Examine set texts thematically and structurally",
        ],
        topics: [
          {
            title: "Introduction to Prose Fiction",
            subtopics: ["Definition and development", "Types: Novel, Novella, Short Story"],
            details: [
              "Forms: African, non-African, Short story, Novella, Novel",
              "Structure: Plot, Character (protagonist, antagonist), Language, Themes, Setting",
              "Narrative techniques: point of view, omniscient narrator, stream of consciousness",
              "Relevance of Prose to society",
            ],
          },
          {
            title: "The European Prose Tradition",
            subtopics: ["Daniel Defoe", "Henry Fielding", "George Eliot", "Jane Austen", "James Joyce"],
            details: [
              "Development of the English novel: 18th century Realism to 20th century Modernism",
              "Recommended texts: Jane Austen's Pride and Prejudice; E.M. Forster's A Passage to India",
              "Themes, character, setting and narrative technique in both texts",
            ],
          },
          {
            title: "African Prose — The Modern African Novel",
            subtopics: ["Chinua Achebe", "Ngũgĩ wa Thiong'o", "Elechi Amadi, Ayi Kwei Armah, Sembene Ousmane"],
            details: [
              "Background to the Modern African novel",
              "Achebe's A Man of the People: political corruption, post-colonial disillusionment, satire",
              "Ngugi's A Grain of Wheat: Kenyan independence, betrayal, sacrifice, Mau Mau struggle",
              "Thematic preoccupation, setting, characterization, plot structure of both texts",
            ],
          },
        ],
      },
      {
        code: "LIT 003",
        title: "Introduction to Poetry",
        units: 3,
        semester: 2,
        objectives: [
          "Define poetry and distinguish oral from written forms",
          "Identify types and structural elements of poetry",
          "Trace the classical, medieval, Renaissance, Romantic and modern traditions",
          "Analyse African and American poetry",
        ],
        topics: [
          {
            title: "Introduction to Poetry",
            subtopics: ["Definition of Poetry", "Oral and Written traditions", "Types and Forms"],
            details: [
              "Types: Lyric, Ode, Ballad, Dirge, Epic, Sonnet, Free Verse, Blank Verse",
              "Structure: Versification (rhyme scheme, metre, rhythm), Stanza Forms, Cantos",
              "Literary devices: imagery, metaphor, simile, alliteration, assonance, irony, personification, symbolism",
            ],
          },
          {
            title: "The Classical Tradition in Poetry",
            subtopics: ["Homer", "Ovid", "Plato on Poetry"],
            details: [
              "Major poets: Homer (Iliad, Odyssey), Ovid, Aeneas",
              "Recommended text: Ovid's Metamorphoses Books I–V",
              "Epic conventions; influence on Western literature",
            ],
          },
          {
            title: "European Poetry — Medieval & Renaissance Traditions",
            subtopics: ["Geoffrey Chaucer", "John Milton", "John Donne", "Alexander Pope", "Andrew Marvell"],
            details: [
              "Background: Wyatt, Surrey, Spenser, Sir Walter Raleigh, Shakespeare",
              "Rise of English Language from vernacular to international standard",
              "Textual Studies: Chaucer — General Prologue, Wife of Bath's Tale; Milton — Paradise Lost Bks 1 & 2",
              "Pope — The Rape of the Lock; Donne — Holy Sonnet; Marvell — To His Coy Mistress; George Herbert — The Collar",
              "In-depth study of at least three major poets",
            ],
          },
          {
            title: "European Poetry — 19th and 20th Centuries",
            subtopics: ["Romantic Poetry", "Victorian and Edwardian Poetry", "Modern Poetry"],
            details: [
              "Wordsworth's Preface to Lyrical Ballads as the Romantic manifesto",
              "Wordsworth — Resolution and Independence; Keats — The Eve of St. Agnes",
              "Thomas Hardy — The Ruined Maid and A Church Romance",
              "T.S. Eliot — The Waste Land; W.B. Yeats — The Second Coming",
            ],
          },
          {
            title: "African Poetry — Oral & Written Modern Tradition",
            subtopics: ["Wole Soyinka", "Christopher Okigbo", "Kofi Awoonor", "Masizi Kunene", "Okot p'Bitek"],
            details: [
              "Background to African Poetry: oral and written; interface between forms",
              "Anonymity and authorship in oral African poetry",
              "Textual Studies: Soyinka — The Four Archetypes; Okigbo — Path of Thunder",
              "Awoonor — Songs of Sorrow; Kunene — Emperor Shaka the Great; Okot p'Bitek — Song of Lawino",
            ],
          },
        ],
      },
      {
        code: "LIT 004",
        title: "Unseen Prose and Poetry",
        units: 3,
        semester: 2,
        objectives: [
          "Apply critical skills to previously unseen prose and poetry",
          "Use multiple critical approaches in literary analysis",
          "Write structured critical commentaries and essays",
        ],
        topics: [
          {
            title: "Literary Appreciation and Criticism — Unseen Texts",
            subtopics: ["Unseen Prose", "Unseen Poetry", "Critical Approaches"],
            details: [
              "Testing specific skills of literary appreciation and criticism across all main genres",
              "Critical approaches: Biographical, Philosophical, Textual, Structural",
              "Analysing unseen poems: tone, mood, imagery, rhyme scheme, theme, message",
              "Analysing unseen prose: narrative voice, style, characterization, setting, theme",
              "No specific texts specified — emphasis on method and technique",
              "JUPEB examination technique: common question types and how to answer them",
            ],
          },
        ],
      },
    ],
  },

  {
    name: "Government",
    code: "GOV",
    icon: Landmark,
    gradient: "from-blue-600/20 to-cyan-900/10",
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    glow: "shadow-blue-500/20",
    description: "Covers political theory, Nigerian and African government and politics across four papers.",
    generalObjectives: [
      "Analyse basic concepts, principles, institutions and issues in government and politics",
      "Explain the structure, institutions and processes of government",
      "Discuss Nigeria's historical, political and constitutional development",
      "Evaluate political systems of different African states",
    ],
    courses: [
      {
        code: "GOV 001",
        title: "Elements of Government and Politics",
        units: 3,
        semester: 1,
        objectives: [
          "Describe the subject matter of Government and politics",
          "Explain the general application of politics to issues in the political structure",
          "Identify the institutions and processes within their political environment",
        ],
        topics: [
          {
            title: "Nature of Government and Politics",
            subtopics: ["Definitions", "Methods/Approaches", "Relationship with other disciplines", "Scope"],
            details: [
              "Methods: Philosophical, Normative, Institutional, Historical, Comparative, Qualitative/Quantitative, Behavioural, Empirical",
              "Relationship with: History, Law, Economics, Geography, Sociology, Psychology",
              "Scope: Political Theory, Political Economy, International Relations, Public Administration, Local Government, Comparative Politics, Peace & Conflict Studies, Security Studies, Development Studies",
            ],
          },
          {
            title: "Basic Concepts of Government and Politics",
            subtopics: ["Power", "Authority", "Legitimacy", "Sovereignty", "Political Culture", "Political Socialization", "Political Participation"],
            details: [
              "Power: definition, sources, types; Power vs Influence",
              "Authority: Max Weber's three types — Traditional, Charismatic, Legal-rational",
              "Legitimacy: meaning, how governments gain and lose it",
              "Sovereignty: internal/external, de jure vs de facto",
              "Nation vs State vs Country",
              "Political Culture: participant, subject, parochial types",
              "Political Socialization: agents and processes",
            ],
          },
          {
            title: "Meaning and Nature of the State",
            subtopics: ["Definition and Functions", "Theories of the State", "Characteristics", "Types of State"],
            details: [
              "Theories: Idealist (Hegel), Liberal, Marxist, Pluralist",
              "Characteristics: defined population, territory, government, sovereignty",
              "Types: Unitary, Federal, Confederal — features, examples, strengths/weaknesses",
              "State vs Government; State vs Nation",
            ],
          },
          {
            title: "Structure and Types of Government",
            subtopics: ["Executive, Legislature, Judiciary", "Types of Government", "Systems of Government"],
            details: [
              "Functions, relationships, strengths and weaknesses of each arm",
              "Separation of Powers and Checks and Balances",
              "Types: Democracy, Monarchy, Oligarchy, Aristocracy, Military, Theocracy, Gerontocracy",
              "Systems: Presidential, Parliamentary, Republican, Unitary, Federal, Confederal",
            ],
          },
          {
            title: "Constitution and Constitutionalism",
            subtopics: ["Definition and Types of Constitution", "Objectives", "Features of Constitutionalism"],
            details: [
              "Types: Written/Unwritten, Unitary/Federal, Flexible/Rigid",
              "Objectives: empowering states, establishing values/goals, providing stability, protecting freedom, legitimizing regimes",
              "Features: Rule of Law, Separation of Powers, Supremacy of the Constitution, Fundamental Human Rights, Judicial Independence, Checks and Balances",
              "Relationship between Constitution and Constitutionalism",
            ],
          },
          {
            title: "Citizenship",
            subtopics: ["Meaning of Citizenship", "Acquisition", "Rights", "Duties and Obligations"],
            details: [
              "Ways of acquiring citizenship: birth (jus soli, jus sanguinis), registration, naturalisation, marriage",
              "Rights: civil, political, social, economic",
              "Duties: paying taxes, obeying laws, voting, military service",
              "Dual citizenship; statelessness; revocation",
              "Chapter 4 Fundamental Rights — 1999 Nigerian Constitution",
            ],
          },
        ],
      },
      {
        code: "GOV 002",
        title: "Ideologies & Processes of Government and Politics",
        units: 3,
        semester: 1,
        objectives: [
          "Explain major political thoughts: social contract and utilitarian theories",
          "Discuss the concept of ideology",
          "Explain political parties, party systems and pressure groups",
          "Describe public opinion, propaganda, elections and electoral systems",
          "Discuss public administration and international relations",
        ],
        topics: [
          {
            title: "Political Thoughts and Ideologies",
            subtopics: ["Social Contract Theory", "Utilitarianism", "Types of Ideology"],
            details: [
              "Social Contract: Hobbes (Leviathan, state of nature), Locke (consent, natural rights), Rousseau (general will)",
              "Utilitarianism: Bentham and J.S. Mill — greatest happiness principle",
              "Types: Communalism, Feudalism, Capitalism, Imperialism, Fascism, Nazism, Marxism, Socialism, Communism, Authoritarianism, Totalitarianism, Anarchism, Feminism, Environmentalism",
            ],
          },
          {
            title: "Political Parties, Party Systems and Pressure Groups",
            subtopics: ["Political Parties", "Party Systems", "Pressure Groups"],
            details: [
              "Functions of political parties: aggregation, socialization, recruitment, government formation",
              "Types: mass, elite, catch-all parties; organs of political parties",
              "Party systems: one-party, two-party, multi-party — merits and demerits",
              "Pressure Groups: sectional vs promotional; lobbying, propaganda, demonstrations",
              "Comparison between Political Parties and Pressure Groups",
            ],
          },
          {
            title: "Public Opinion, Propaganda, Elections and Electoral Systems",
            subtopics: ["Public Opinion", "Propaganda", "Elections in Nigeria"],
            details: [
              "Definition, functions and measurement of public opinion",
              "Meaning, nature, functions and strategies of propaganda",
              "Types of elections: Primary, General, Bye-election, Run-off",
              "Types of electoral systems: FPTP, Proportional Representation, Alternative Vote",
              "Suffrage: evolution and types (universal, property, literacy, male, female)",
              "History of elections in Nigeria: 1959, 1964, 1979, 1983, 1993, 1999, 2003, 2007, 2011, 2015, 2019",
              "Election management bodies: FEDECO → NECON → NEC → INEC",
              "Problems of elections in Nigeria",
            ],
          },
          {
            title: "Public Administration and International Relations",
            subtopics: ["Public Administration", "Civil Service", "Policy Process", "International Relations"],
            details: [
              "Meaning; differences and similarities between public and private administration",
              "Theories: Administrative (Fayol), Scientific Management (Taylor), Bureaucratic (Weber), Human Relations (Mayo)",
              "Functions and characteristics of the Civil Service",
              "Policy Process: Formulation → Implementation → Evaluation",
              "Public corporations; local government in Nigeria",
              "IR: meaning, foreign policy, globalization, determinants in Nigeria",
              "International organizations: ECOWAS, African Union, Commonwealth, UN, IMF, World Bank",
            ],
          },
        ],
      },
      {
        code: "GOV 003",
        title: "Nigerian Government and Politics",
        units: 3,
        semester: 2,
        objectives: [
          "Describe the various pre-colonial systems in Nigeria",
          "Account for Nigeria's past political history",
          "Explain the evolution of political parties in Nigeria",
          "Discuss major political crises in Nigeria",
          "Give account of military rule in Nigeria",
        ],
        topics: [
          {
            title: "Pre-Colonial Systems of Government in Nigeria",
            subtopics: ["Hausa/Fulani System", "Yoruba System", "Igbo System"],
            details: [
              "Hausa/Fulani: Emirate system, Sokoto Caliphate, role of Emir, District Heads, Islamic administration",
              "Yoruba: Obaship institution, Alafin of Oyo, Oyo Mesi, Bashorun, Ogboni society",
              "Igbo: village democracy, acephalous (no central king), age-grades, Ozo/Nze title system, council of elders",
            ],
          },
          {
            title: "Colonial Administration in Nigeria",
            subtopics: ["Amalgamation 1914", "Indirect Rule", "Constitutional Development", "Nationalism"],
            details: [
              "Amalgamation of Northern and Southern Nigeria 1914 by Lord Lugard — reasons and effects",
              "Indirect Rule: principles, application in Hausa/Yoruba/Igbo areas, merits and demerits",
              "Constitutional Development: Clifford 1922 → Richards 1946 → Macpherson 1951 → Lyttleton 1954",
              "Nationalism: Herbert Macaulay, Nnamdi Azikiwe, Obafemi Awolowo, Ahmadu Bello",
              "Constitutional Development 1960 to present — First, Second, Third and Fourth Republics",
            ],
          },
          {
            title: "Development of Political Parties in Nigeria",
            subtopics: ["First Republic Parties", "Second and Third Republic", "Fourth Republic Parties"],
            details: [
              "First Republic: NNDP, NYM, NCNC, Action Group (AG), NPC, NEPU, UMBC",
              "Second Republic: NPN, UPN, NPP, GNPP, PRP",
              "Third Republic: NRC, SDP",
              "Fourth Republic: APP/ANPP, PDP, AD, ACN, CPC, APC, APGA",
            ],
          },
          {
            title: "Major Political Crises and Military Rule in Nigeria",
            subtopics: ["Major Political Crises", "Military Regimes", "Achievements and Failures"],
            details: [
              "Crises: Aba Women's Riot 1929, Kano Riots 1953, AG Crisis 1962, Census crisis 1962/63",
              "Nigerian-Biafra Civil War 1967–1970; June 12 1993 crisis; Boko Haram insurgency",
              "Military regimes: Ironsi, Gowon, Muritala, Obasanjo, Buhari/Idiagbon, Babangida, Abacha, Abdulsalami",
              "Background to military rule in Nigeria",
              "Achievements and failures of military rule; panacea to preventing military intervention",
            ],
          },
        ],
      },
      {
        code: "GOV 004",
        title: "African Government and Politics",
        units: 3,
        semester: 2,
        objectives: [
          "Discuss Africa before European invasion",
          "Describe European invasion of Africa",
          "Explain colonial systems of administration in Africa",
          "Analyse the nationalist movement in West Africa",
          "Discuss critical issues in African government and politics",
        ],
        topics: [
          {
            title: "Africa Before European Invasion",
            subtopics: ["Major Contributions to World Civilization", "Pre-colonial Empires and Kingdoms"],
            details: [
              "Empires: Ghana/Wagadou, Mali (Mansa Musa, Timbuktu), Songhai (largest pre-colonial African empire)",
              "Kingdoms: Zulu (military), Kanem-Bornu (trans-Saharan trade), Benin (bronze works, oba system)",
              "African trade networks, culture and governance",
              "Africa's contribution to the new world (Transatlantic Slave Trade context)",
            ],
          },
          {
            title: "European Invasion of Africa",
            subtopics: ["Strategies of Invasion", "Scramble for Africa", "Apartheid", "Neocolonialism"],
            details: [
              "Strategies: Slave trade, Legitimate trade, Missionaries, Colonialism, Treaties, Military Conquest",
              "Reasons for European expansion: 3Cs (Commerce, Christianity, Civilization); Industrial Revolution",
              "Berlin Conference 1884–1885: rules, outcomes, partitioning",
              "Apartheid in South Africa: origins, features, resistance (ANC, Mandela), end",
              "African responses: Invasion, Resistance, Negotiations, Settlement of Europeans",
              "Meaning, origin and manifestations of Neocolonialism in Africa",
            ],
          },
          {
            title: "Colonial Systems of Administration in Africa",
            subtopics: ["British Indirect Rule", "French Assimilation Policy", "Portuguese Association Policy"],
            details: [
              "British Indirect Rule: use of existing African institutions, features, merits and demerits",
              "French Assimilation Policy: making Africans culturally French, four communes of Senegal",
              "Portuguese Association Policy: two classes of Africans (assimilados vs indigenatos)",
              "Comparison of colonial administrative systems",
            ],
          },
          {
            title: "Nationalist Movements and Critical Issues in African Politics",
            subtopics: ["Nationalist Movements", "Critical Issues in African Politics"],
            details: [
              "Nationalist Movements in British West Africa: role of educated elite, WASU, NCBWA",
              "Nationalist Movements in French West Africa: Negritude movement (Senghor, Cesaire)",
              "Critical Issues: Democratization, Democracy and Human Rights, Ethnicity, Poverty",
              "Leadership problems (coup culture), Migration, Human Trafficking",
            ],
          },
        ],
      },
    ],
  },

  {
    name: "CRS",
    code: "CRS",
    icon: Cross,
    gradient: "from-emerald-600/20 to-teal-900/10",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    glow: "shadow-emerald-500/20",
    description: "Covers Old Testament, New Testament, History of Christianity in West Africa, and Religion & Society.",
    generalObjectives: [
      "Explain how the Old and New Testaments came into existence",
      "Enumerate outstanding Kings and Prophets of Israel during the monarchy",
      "Trace the history and development of Christianity in West Africa",
      "Discuss the relationship between religion and society",
      "Highlight Christian responses to contemporary societal challenges",
    ],
    courses: [
      {
        code: "CRS 001",
        title: "Old Testament Studies: History and Religion of Israel",
        units: 3,
        semester: 1,
        objectives: [
          "Explain the term 'inspiration' and analyse the process of canonization of the OT",
          "Highlight the genre of OT literature and discuss the Documentary Hypotheses",
          "Evaluate how the nation of Israel started and the roles of notable Kings",
          "Give a detailed description of events that led to the Divided Kingdom",
          "Appraise prophecy in Israel — Isaiah, Hosea and Amos",
        ],
        topics: [
          {
            title: "Formation and Composition of the Old Testament",
            subtopics: ["Inspiration", "Canonization", "Genre of Literature"],
            details: [
              "Biblical Inspiration: meaning as applied to OT composition",
              "Theories: Dictation, Verbal Plenary, Dynamic/Content, Neo-Orthodox, Limited",
              "Canonization: meaning of 'Canon'; process, criteria; applications to OT",
              "Canonical books: Torah (Law), Nebiim (Prophets), Ketubiim (Writings)",
              "Genre: Historical, Poetic, Wisdom, Prophetic literature — definition and examples",
            ],
          },
          {
            title: "Israel's Nationhood and Mosaic Authorship",
            subtopics: ["God's Call of Abraham", "Call of Moses", "Mosaic Authorship of the Pentateuch"],
            details: [
              "Process of God's call of Abraham (Gen. 12:1-7) — promises of land, seed, blessing",
              "Moses' encounter with God in the wilderness (Exodus 3:1-18, 20:1-20)",
              "Arguments FOR Mosaic authorship: internal and external evidences",
              "Arguments AGAINST Mosaic authorship: internal and external evidences",
              "Documentary Hypotheses: Early, Fragmentary, Supplementary",
              "The J.E.D.P. documents: Jahwist, Elohist, Deuteronomist, Priestly — characteristics of each",
            ],
          },
          {
            title: "The Rise of Monarchy in Israel",
            subtopics: ["Historical Settings (1 Sam 1–7)", "The Establishment (1 Sam 8–12)", "Factors that Led to the Request for a King"],
            details: [
              "Ministry of Eli and birth/call of Samuel",
              "War with the Philistines and capture of the Ark of God",
              "Role of Samuel as Priest, Judge and Prophet",
              "Factors for a king: fear of Philistines, corruption of Samuel's sons, influence of other nations",
              "Samuel anoints Saul; inauguration at Gilgal",
            ],
          },
          {
            title: "Saul, David and Solomon",
            subtopics: ["Saul's Reign and Failures (1 Sam 13–15)", "David's Reign (1 Sam 16–2 Sam 24)", "Solomon's Reign (1 Kgs 1–11)"],
            details: [
              "Saul's successes: built army, captured lost land, set up monarchical structure",
              "Saul's failures: disobedience, pride, divination, influence of evil spirit",
              "David's achievements: united kingdom, Psalms, organized worship, expanded territory",
              "David's weaknesses: adultery (Bathsheba), murder (Uriah), family crises",
              "Solomon's contributions: building projects (Temple), wisdom, trade",
              "Solomon's folly: forced labour, mixed marriages, idolatry",
            ],
          },
          {
            title: "The Divided Kingdom and the Exiles",
            subtopics: ["Factors that Led to Division (1 Kgs 12:1-25)", "The Exiles (2 Kgs 16–25)"],
            details: [
              "Factors: David's economic policy, Solomon's bad rule, Rehoboam's unwise decision",
              "Prophecy of Ahijah; age-long conflict among tribes",
              "Reign of Rehoboam (Judah) and Jeroboam (Israel)",
              "Causes and effects of the Exiles (2 Kgs 17:1-28; 24)",
              "State of the exiles (2 Kgs 25)",
            ],
          },
          {
            title: "Prophecy in Israel — Isaiah, Hosea and Amos",
            subtopics: ["Early Manifestations of Prophecy", "Major and Minor Prophets"],
            details: [
              "Pre-Canonical Prophets: Moses, Joshua, Samuel (Jos. 23:1-13)",
              "Characteristics of prophecy: inspiration, repentance, fearlessness",
              "Role of prophets: pious worship, school of prophets",
              "Isaiah's message on HOLINESS (Isa. 1–6) and relevance to nation building",
              "Hosea's message on LOVE (Hos. 1–3) and implications for Israel",
              "Amos' message on JUSTICE (Amos 1–5) and relevance to nation building",
            ],
          },
        ],
      },
      {
        code: "CRS 002",
        title: "New Testament Studies: The Gospels",
        units: 3,
        semester: 1,
        objectives: [
          "Give a synopsis of NT literature and highlight the NT background",
          "Clarify the term 'Synoptic' and examine the Synoptic Problem",
          "Identify the aims of modern Gospel criticism",
          "Discuss the Literature and Theology of the Synoptic Gospels",
          "Compare and contrast the Synoptics with the Gospel of John",
        ],
        topics: [
          {
            title: "Historical Background to the New Testament",
            subtopics: ["Socio-Political Background", "Religious Background"],
            details: [
              "Development of Israel under the Roman Empire; Maccabean Revolt",
              "Socio-political groups: Zealots, Herodians",
              "Religious groups: Pharisees, Sadducees; Institutions: Temple, Synagogue",
            ],
          },
          {
            title: "The Synopsis, Materials and Canonization of the New Testament",
            subtopics: ["Factors Delaying/Prompting Writing", "Sources of Gospel Material", "Canonization"],
            details: [
              "Factors delaying writing: persecution, Parousia, availability of eye-witnesses",
              "Factors prompting writing: death of eye-witnesses, liturgical need",
              "Sources: oral and written traditions",
              "Meaning of canonization; process of NT canonization",
            ],
          },
          {
            title: "The Synoptic Gospels and the Synoptic Problem",
            subtopics: ["Meaning of 'Synoptic'", "Similarities and Differences", "Proposed Solutions"],
            details: [
              "Meaning of 'Synoptic': sun–opsis (to view from the same angle)",
              "Synoptic Gospels: Matthew, Mark and Luke",
              "Similarities and dissimilarities of the Synoptic Gospels",
              "Solutions: Memorabilia, Documentary Hypotheses and others",
            ],
          },
          {
            title: "Modern Criticism of the Gospels",
            subtopics: ["Types of Criticism"],
            details: [
              "Textual Criticism, Form Criticism, Source Criticism, Redaction Criticism",
              "Evaluate the effects of each criticism on the Gospels",
            ],
          },
          {
            title: "Literature and Theology of the Synoptic Gospels",
            subtopics: ["Gospel of Matthew", "Gospel of Mark", "Gospel of Luke"],
            details: [
              "Matthew: authorship, date, purpose, destination; theological emphases (Messianic concept, Son of David, Kingdom of Heaven); characteristics (didactic, Gospel of fulfilment, Jewish emphasis)",
              "Mark: authorship, date, purpose; characteristics (Action, Vividness, Candour); theological emphases (Messianic Secrecy, Son of Man)",
              "Luke: authorship, date, purpose, destination; characteristics (Comprehensiveness, Universalism, prominence to women/children); theological emphases (Son of Man, Fatherhood of God)",
            ],
          },
          {
            title: "The Synoptics and John's Gospel",
            subtopics: ["The Gospel of Saint John"],
            details: [
              "Authorship, date and purpose of the Gospel of John",
              "Comparison of John with the Synoptics: common themes, events",
              "Contrast between John and the Synoptics",
            ],
          },
        ],
      },
      {
        code: "CRS 003",
        title: "History of Christianity in West Africa",
        units: 3,
        semester: 2,
        objectives: [
          "Give an overview of previous attempts at Christianizing Africa",
          "Narrate the establishment of Christianity in Sierra Leone",
          "Discuss how Christianity was introduced to Ghana and Nigeria",
          "Highlight the influence of Christianity on Nigeria and the rise of African Independent Churches",
          "Examine Pentecostalism and the rise of New Religious Movements",
        ],
        topics: [
          {
            title: "Previous Attempts at Christianizing Africa",
            subtopics: ["First Attempt — North Africa", "Second Attempt — Portuguese Efforts"],
            details: [
              "Pre-Christian contacts: Abraham, Joseph in Egypt; Baby Jesus in Africa; Pentecost Day; Ethiopian Eunuch",
              "Reasons for failure: heretical teachings, migration, Islamization",
              "Prince Henry of Portugal: expeditions 1418–1460; evangelical and commercial reasons",
              "Portuguese failure: slavery/slave trade, climate, paucity of funds",
            ],
          },
          {
            title: "Establishment of Christianity in Sierra Leone",
            subtopics: ["Evangelical Revivals", "Founding of Sierra Leone", "Missionary Activities"],
            details: [
              "Evangelical revivals: birth of Mission Societies — BMS, CMS, LMS; role of freed slaves",
              "Anti-Slavery movements: The Abolitionists and role of Freed Slaves",
              "Reasons for founding Sierra Leone: economic, social, religious",
              "Missionary groups: RCM, Baptist, Anglican, Presbyterian, Sudan Interior/United Missions",
              "Niger Expeditions of 1841, 1845 and 1857 — successes and failures",
            ],
          },
          {
            title: "The Planting of Christianity in Ghana and Nigeria",
            subtopics: ["Ghana (Gold Coast)", "Western Nigeria", "Eastern Nigeria", "Northern Nigeria"],
            details: [
              "Ghana: activities of RCM, Presbyterian, Methodist, Anglican; influence on education and agriculture",
              "Western Nigeria: Abeokuta, Ibadan, Lagos — CMS, RCM, WMS, Baptist",
              "Eastern Nigeria: Onitsha, Aba — CMS, RCM-Holy Ghost Fathers, Methodist",
              "Northern Nigeria: Lokoja, Zaria, Benue — CMS, RCM, SUM, SIM",
            ],
          },
          {
            title: "African Independent Churches and Pentecostalism",
            subtopics: ["African Independent Churches", "Pentecostalism", "New Religious Movements", "Proliferation of Churches"],
            details: [
              "Rise, characteristics and expansion of African Independent Churches",
              "Pentecostalism: rise and features",
              "New Religious Movements within the Church in Nigeria",
              "Causes and impacts of proliferation of churches in Nigeria",
            ],
          },
        ],
      },
      {
        code: "CRS 004",
        title: "Religion and Society",
        units: 3,
        semester: 2,
        objectives: [
          "Examine the sociology of religion",
          "Discuss theories of religion",
          "Identify the functions of religion in society",
          "Analyse religion, peace and conflict resolution",
          "Highlight Christian responses to contemporary societal issues",
        ],
        topics: [
          {
            title: "Sociology of Religion and Theories",
            subtopics: ["Meaning and Background", "Major Theories", "Criteria for Measuring Religiosity"],
            details: [
              "Functional theory of religion; Conflict theory; Symbolic Interactionism; Secularization theory",
              "Meaning, background and contextual basis of each theory; significance for Nigerian society",
              "Criteria for measuring religiosity: prayer, church attendance, financial responsibility, use of religious language",
            ],
          },
          {
            title: "Functions of Religion and Religion, Peace & Conflict",
            subtopics: ["General Functions of Religion", "Religion and Peace", "Religion and Conflict Resolution"],
            details: [
              "Functions: maintenance of law and order, social cohesion, social control",
              "Positive vs negative functions of religion",
              "How religion can enhance peace: inter-religious dialogue, tolerance, inter/intra-religious activities",
              "Religion as a tool for conflict resolution: Dialogue, Forgiveness, Teaching, Tolerance, Counselling, Reconciliation",
            ],
          },
          {
            title: "Religious Personality, Human Values and Contemporary Issues",
            subtopics: ["Religious Personality", "Human Values", "Christian Response to Contemporary Issues"],
            details: [
              "Meaning of 'Religious Personality'",
              "Human values: love, peace, benevolence, respect, responsibility, contentment, loyalty, honesty, dignity, perseverance",
              "How religious personality promotes human values: religious codes, sermons, reward motive",
              "Contemporary issues: Drug Abuse, Cultism, Corruption, Insurgencies, Rape, Abortion, Euthanasia, Examination Malpractice",
              "HIV/AIDS, Covid-19, Bad Governance, Fundamentalism, Ritual Killings, Gambling, Kidnapping, Cyber Crime, Human Trafficking, Electoral Violence",
            ],
          },
        ],
      },
    ],
  },
];

const TIMETABLE_DATA = [
  {
    day: "MONDAY",
    slots: [
      { time: "9:00–11:00am", subject: "GOV 004", venue: "MGT SCI RM 4 & 5, SOC SCI HALL" },
      { time: "11:30–1:30pm", subject: "LIT 003", venue: "ARTS G001 & LAW LT" },
      { time: "2:00–4:00pm", subject: "ECO 003", venue: "SOC SCI HALL A & B, MGT SCI RM 4 & 5" },
      { time: "4:00–6:00pm", subject: "GEO 003", venue: "ARTS G001" },
    ],
  },
  {
    day: "TUESDAY",
    slots: [
      { time: "9:00–11:00am", subject: "CRS 003 / IRS 003", venue: "LAW LT / ART G001" },
      { time: "11:30–1:30pm", subject: "ACC 004", venue: "MGT SCI RM 4 & 5" },
      { time: "2:00–4:00pm", subject: "BUS 003", venue: "MGT SCI RM 4 & 5" },
      { time: "2:00–4:00pm", subject: "VSA 003", venue: "C-ARTS G001" },
    ],
  },
  {
    day: "WEDNESDAY",
    slots: [
      { time: "9:00–11:00am", subject: "LIT 004", venue: "ARTS G001 & LAW LT" },
      { time: "11:30–1:30pm", subject: "GOV 003", venue: "MGT SCI RM 4 & 5, LAW LT, SOC SCI HALL A&B" },
      { time: "2:00–4:00pm", subject: "ECO 004", venue: "SOC SCI HALL A & B, MGT SCI RM 4 & 5" },
    ],
  },
  {
    day: "THURSDAY",
    slots: [
      { time: "9:00–11:00am", subject: "ACC 002", venue: "MGT SCI RM 4 & 5" },
      { time: "9:00–11:00am", subject: "VSA 004 / GEO 004", venue: "ARTS G001" },
      { time: "11:30–1:30pm", subject: "CRS 004 / IRS 004 / ACC 004", venue: "LAW LT / ART G001 / MGT SCI RM 4 & 5" },
      { time: "2:00–4:00pm", subject: "BUS 004", venue: "MGT SCI RM 4 & 5" },
    ],
  },
  {
    day: "FRIDAY",
    slots: [
      { time: "9:00–11:00am", subject: "ACC 002", venue: "MGT SCI RM 4 & 5" },
      { time: "11:30–1:30pm", subject: "VSA PRACTICAL", venue: "C-ARTS STUDIO" },
      { time: "1:30–2:00pm", subject: "JUMAAT", venue: "" },
    ],
  },
];

const SUBJECT_COLORS: Record<string, string> = {
  "GOV": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "LIT": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "CRS": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "IRS": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "ECO": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "ACC": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "BUS": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "GEO": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "VSA": "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "JUMAT": "bg-white/10 text-white/50 border-white/10",
};

function getSubjectColor(subject: string): string {
  const prefix = subject.split(" ")[0].split("/")[0];
  return SUBJECT_COLORS[prefix] ?? "bg-white/10 text-white/50 border-white/10";
}

function TopicRow({ topic, index }: { topic: Topic; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
      >
        <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white/40">
          {index + 1}
        </span>
        <span className="text-sm font-medium text-white/85 flex-1">{topic.title}</span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-white/30 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/30 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              {topic.subtopics && topic.subtopics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {topic.subtopics.map((s, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {topic.details && topic.details.length > 0 && (
                <ul className="space-y-1.5">
                  {topic.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-white/25 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CourseSection({ course, accent }: { course: Course; accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("rounded-2xl border overflow-hidden", open ? "border-white/10" : "border-white/5")}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-4 hover:bg-white/3 transition-colors text-left"
      >
        <div className={cn("px-2.5 py-1 rounded-lg text-xs font-bold border flex-shrink-0", accent)}>
          {course.code}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{course.title}</p>
          <p className="text-[11px] text-white/40">{course.units} Units · {course.semester === 1 ? "First" : "Second"} Semester</p>
        </div>
        <span className="text-xs text-white/30 flex-shrink-0">{course.topics.length} topics</span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-white/30 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/30 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-4 py-4 space-y-4">
              <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">Specific Objectives</p>
                <ul className="space-y-1">
                  {course.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                      <span className="mt-1 text-[10px] font-bold text-white/25 flex-shrink-0">{i + 1}.</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Course Content</p>
                {course.topics.map((topic, i) => (
                  <TopicRow key={i} topic={topic} index={i} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Syllabus() {
  const [activeTab, setActiveTab] = useState<"syllabus" | "timetable">("syllabus");
  const [activeSubject, setActiveSubject] = useState<string>("Literature-in-English");

  const subject = SYLLABUS_DATA.find(s => s.name === activeSubject)!;
  const Icon = subject.icon;

  return (
    <Shell>
      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <ScrollText className="h-5 w-5 text-emerald-400" />
            </div>
            Syllabus
          </h1>
          <p className="text-white/40 text-sm mt-1 ml-13">JUPEB Non-Science — UNILAG School of Foundation Studies</p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("syllabus")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "syllabus" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
            )}
          >
            <span className="flex items-center gap-2"><ScrollText className="h-4 w-4" /> Syllabus</span>
          </button>
          <button
            onClick={() => setActiveTab("timetable")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "timetable" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
            )}
          >
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Timetable</span>
          </button>
        </div>

        {activeTab === "syllabus" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Subject selector */}
            <div className="grid grid-cols-3 gap-3">
              {SYLLABUS_DATA.map(s => {
                const SIcon = s.icon;
                const isActive = s.name === activeSubject;
                return (
                  <button
                    key={s.name}
                    onClick={() => setActiveSubject(s.name)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                      isActive
                        ? `bg-gradient-to-br ${s.gradient} border-white/15 shadow-lg ${s.glow}`
                        : "bg-white/3 border-white/5 hover:bg-white/6"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", s.accent)}>
                      <SIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-white/80 text-center leading-tight">{s.name}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", s.accent)}>{s.code}</span>
                  </button>
                );
              })}
            </div>

            {/* Subject detail */}
            <div className={cn("rounded-2xl border p-5 bg-gradient-to-br", subject.gradient, "border-white/10")}>
              <div className="flex items-start gap-4 mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0", subject.accent)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{subject.name}</h2>
                  <p className="text-sm text-white/50">{subject.description}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">General Objectives</p>
                <ul className="space-y-1">
                  {subject.generalObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/65">
                      <span className="mt-1 w-1 h-1 rounded-full bg-white/30 flex-shrink-0" />{obj}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Course breakdown by semester */}
            {[1, 2].map(sem => {
              const courses = subject.courses.filter(c => c.semester === sem);
              return (
                <div key={sem} className="space-y-3">
                  <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-6 h-px bg-white/10" />
                    {sem === 1 ? "First" : "Second"} Semester
                    <span className="flex-1 h-px bg-white/10" />
                  </h3>
                  {courses.map(course => (
                    <CourseSection key={course.code} course={course} accent={subject.accent} />
                  ))}
                </div>
              );
            })}
          </motion.div>
        )}

        {activeTab === "timetable" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
              <strong>University of Lagos — School of Foundation Studies</strong><br />
              Second Semester 2025/2026 Lecture Time-Table · Non-Science Groupings
            </div>

            {/* Full timetable image */}
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <img
                src={`${import.meta.env.BASE_URL}timetable.jpg`}
                alt="JUPEB Non-Science Timetable 2025/2026"
                className="w-full"
              />
            </div>

            {/* Structured timetable */}
            <div className="space-y-3">
              {TIMETABLE_DATA.map(day => (
                <div key={day.day} className="rounded-2xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-2.5 bg-white/5 border-b border-white/5">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{day.day}</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {day.slots.map((slot, i) => {
                      const prefix = slot.subject.split(" ")[0].split("/")[0];
                      const colorClass = getSubjectColor(slot.subject);
                      return (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                          <div className="flex items-center gap-1.5 w-32 flex-shrink-0">
                            <Clock className="h-3 w-3 text-white/25" />
                            <span className="text-[11px] text-white/40">{slot.time}</span>
                          </div>
                          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg border flex-shrink-0", colorClass)}>
                            {slot.subject}
                          </span>
                          {slot.venue && (
                            <div className="flex items-center gap-1 min-w-0">
                              <MapPin className="h-3 w-3 text-white/20 flex-shrink-0" />
                              <span className="text-[11px] text-white/35 truncate">{slot.venue}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-white/30 text-center">Short Breaks are at 11:00–11:30am and 1:30–2:00pm daily</p>
          </motion.div>
        )}
      </div>
    </Shell>
  );
}
