/**
 * JUPEB Academic Notes Seeder
 * Run from workspace root: node_modules/.bin/tsx artifacts/api-server/src/seed-notes.ts
 */

import { GoogleGenAI } from "@google/genai";
import { db, pool, notesTable, subjectsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is required");
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_PROMPT = `You are an expert JUPEB academic lecturer generating comprehensive, exam-focused lecture notes for UNILAG School of Foundation Studies students targeting 16 points (AAA+1) for Law admission. Generate university foundation level notes — thorough, scholarly, and exam-ready.`;

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

interface TopicEntry {
  subjectCode: string;
  paper: "001" | "002" | "003" | "004";
  topic: string;
  syllabus: string;
  tags: string[];
}

const TOPICS: TopicEntry[] = [
  // ─────────────────────────── LITERATURE IN ENGLISH ───────────────────────────
  {
    subjectCode: "LIT", paper: "001",
    topic: "Introduction to Drama and Theatre",
    tags: ["drama", "theatre", "forms-of-drama", "lit001"],
    syllabus: `Definition of drama/theatre; Origin of drama/theatre; The relevance of drama to the society; Types/Forms of drama: Tragedy, Comedy, Melodrama, Farce; The Structure of drama: Plot (conflict, resolution and meaning), Character, Language, Themes. Illustration of dramatic elements with examples.`,
  },
  {
    subjectCode: "LIT", paper: "001",
    topic: "The Classical Tradition in Drama — Sophocles, Aeschylus, Euripides, Aristotle",
    tags: ["classical-drama", "sophocles", "greek-theatre", "aristotle", "lit001"],
    syllabus: `Introduction to Classical tradition in Drama; Major playwrights and theorists: Sophocles, Aeschylus, Euripides, Aristophanes, Aristotle; Sophocles' King Oedipus and Antigone — background, aspects and tradition of Classical drama; Aristotle's Poetics: catharsis, hamartia, hubris, unity of time/place/action; Greek theatre structure.`,
  },
  {
    subjectCode: "LIT", paper: "001",
    topic: "European Drama — The Renaissance Tradition and William Shakespeare",
    tags: ["shakespeare", "renaissance-drama", "macbeth", "hamlet", "lit001"],
    syllabus: `Background to Renaissance Drama: William Shakespeare, Christopher Marlowe; Shakespeare's England; Drama in the Elizabethan and Jacobean Ages; Shakespeare's Contemporaries; Textual Studies: Macbeth (tragedy — themes of ambition, guilt, power), Hamlet (tragedy — revenge, existentialism), Twelfth Night (comedy — disguise, love), Merchant of Venice (comedy/tragicomedy — justice vs mercy); structure and elements of drama.`,
  },
  {
    subjectCode: "LIT", paper: "001",
    topic: "European Drama — The Modern Tradition: Ibsen, Shaw, Chekhov, Brecht, Beckett",
    tags: ["modern-drama", "ibsen", "shaw", "hedda-gabler", "mrs-warrens-profession", "lit001"],
    syllabus: `Background to Modern Drama: Henrik Ibsen, George Bernard Shaw, John Osborne, Anton Chekhov, Bertolt Brecht, Samuel Beckett; Drama in the Modern Period, Ibsen, Shaw and the Modern Society; Textual Studies: G.B. Shaw's Mrs Warren's Profession (realism, feminism, capitalism) or Henrik Ibsen's Hedda Gabler (naturalism, female autonomy, societal constraint) — in-depth textual analysis.`,
  },
  {
    subjectCode: "LIT", paper: "001",
    topic: "American Drama — Arthur Miller, August Wilson, Amiri Baraka",
    tags: ["american-drama", "august-wilson", "fences", "amiri-baraka", "dutchman", "lit001"],
    syllabus: `Background to American Drama: Arthur Miller, Tennessee Williams, August Wilson, Amiri Baraka; August Wilson and Amiri Baraka: Drama in Modern American Society; Textual Studies: Wilson's Fences (race, masculinity, family in post-war America) or Baraka's Dutchman (racial tension, identity in America) — in-depth textual analysis.`,
  },
  {
    subjectCode: "LIT", paper: "001",
    topic: "African Drama — Wole Soyinka, Ama Ata Aidoo, J.P. Clark-Bekederemo",
    tags: ["african-drama", "wole-soyinka", "death-and-kings-horseman", "ama-ata-aidoo", "lit001"],
    syllabus: `Background to African Drama: Wole Soyinka, J.P. Clark-Bekederemo, Zulu Sofola, Tess Onwueme, Femi Osofisan; Wole Soyinka and Ama Ata Aidoo: Drama in the Modern African Society; Textual Studies: Soyinka's Death and the King's Horseman (Yoruba cosmology, colonial clash, duty and honour) or Aidoo's Dilemma of a Ghost (identity, diaspora, African tradition) — in-depth textual analysis.`,
  },
  {
    subjectCode: "LIT", paper: "002",
    topic: "Introduction to Prose Fiction — Definition, Types, Structure",
    tags: ["prose-fiction", "novel", "short-story", "narrative-structure", "lit002"],
    syllabus: `Definition of Prose Fiction; Development of the Novel Tradition/Modern Prose Fiction; Types/Forms: African, non-African, Short story, Novella, Novel; Structure of Prose: Plot (conflict, resolution and meaning), Character (protagonist, antagonist, characterization), Language, Themes, Setting; Relevance of Prose to the society; Narrative techniques: point of view, stream of consciousness, omniscient narrator.`,
  },
  {
    subjectCode: "LIT", paper: "002",
    topic: "The European Prose Tradition — Austen, Defoe, Forster, Joyce, George Eliot",
    tags: ["european-prose", "jane-austen", "pride-and-prejudice", "passage-to-india", "lit002"],
    syllabus: `Introduction to European Prose Tradition; Major prose writers: Daniel Defoe, Henry Fielding, George Eliot, Jane Austen, James Joyce; Jane Austen's Pride and Prejudice (themes: marriage, class, moral integrity) and E.M. Forster's A Passage to India (colonialism, cultural misunderstanding) — themes, character, setting, narrative technique; development of the English novel from 18th century Realism to 20th century Modernism.`,
  },
  {
    subjectCode: "LIT", paper: "002",
    topic: "African Prose — Chinua Achebe (A Man of the People) & Ngũgĩ wa Thiongʼo (A Grain of Wheat)",
    tags: ["african-novel", "chinua-achebe", "man-of-the-people", "ngugi", "grain-of-wheat", "lit002"],
    syllabus: `Background to Modern African novel: Chinua Achebe, Wole Soyinka, Elechi Amadi, Ngugi wa Thiong'O, Ayi Kwei Armah, Sembene Ousmane; Chinua Achebe's A Man of the People: themes of political corruption, post-colonial disillusionment, satire; Ngugi wa Thiong'O's A Grain of Wheat: Kenyan independence, betrayal, sacrifice, Mau Mau struggle; Thematic preoccupation, setting, characters and characterization, plot structure of both novels.`,
  },
  {
    subjectCode: "LIT", paper: "003",
    topic: "Introduction to Poetry — Definition, Types, Forms, Versification",
    tags: ["poetry", "verse-forms", "lyric", "sonnet", "epic", "poetic-devices", "lit003"],
    syllabus: `Definition of Poetry and the poem; Traditional and Modern Poetry (Oral and Written); Types/Forms of Poetry: Lyric, Ode, Ballad, Dirge, Epic, Sonnet, Free Verse, Blank Verse; Relevance of Poetry to the society; Structure of the Poem: Versification (rhyme scheme, metre, rhythm), Stanza Forms, Cantos; Literary devices: imagery, metaphor, simile, alliteration, assonance, irony, personification, symbolism.`,
  },
  {
    subjectCode: "LIT", paper: "003",
    topic: "Classical Tradition in Poetry — Homer, Ovid, Metamorphoses I-V",
    tags: ["classical-poetry", "homer", "ovid", "metamorphoses", "lit003"],
    syllabus: `Introduction to Classical Tradition in Poetry; Structure of the Poem in classical context; Major poets and theorists: Homer (Iliad, Odyssey), Ovid, Plato on poetry; Ovid's Metamorphoses Books I-V — background, themes of transformation/metamorphosis, mythological narratives, aspects and tradition of Classical poetry; epic conventions; influence on Western literature.`,
  },
  {
    subjectCode: "LIT", paper: "003",
    topic: "European Poetry — Medieval & Renaissance: Chaucer, Milton, Donne, Pope, Marvell",
    tags: ["medieval-poetry", "renaissance-poetry", "chaucer", "john-milton", "paradise-lost", "lit003"],
    syllabus: `Background to Medieval and Renaissance Poetry: Geoffrey Chaucer, Sir Thomas Wyatt, Surrey, Edmund Spencer, Sir Walter Raleigh, John Milton, William Shakespeare, John Donne; Rise of English Language from vernacular to international standard; Chaucer's General Prologue and Wife of Bath's Tale; Milton's Paradise Lost Books 1 & 2 (Fall of Satan, Paradise, Man's disobedience); Pope's The Rape of the Lock (mock-heroic); Donne's Holy Sonnet (metaphysical poetry, conceit); Marvell's To His Coy Mistress (carpe diem).`,
  },
  {
    subjectCode: "LIT", paper: "003",
    topic: "European Poetry — Romantic, Victorian & Modern: Wordsworth, Keats, Hardy, Eliot, Yeats",
    tags: ["romantic-poetry", "wordsworth", "keats", "ts-eliot", "waste-land", "yeats", "lit003"],
    syllabus: `Background to Romantic, Victorian, Edwardian and Modern Poetry; Wordsworth's Preface to Lyrical Ballads as manifesto of Romanticism; Wordsworth's Resolution and Independence (humble suffering, perseverance); Keats' The Eve of St. Agnes (sensuous romance, medieval setting); Thomas Hardy's The Ruined Maid and A Church Romance (Victorian society, irony); T.S. Eliot's The Waste Land (modernism, fragmentation, spiritual emptiness); W.B. Yeats' The Second Coming (anarchy, apocalypse, Irish politics).`,
  },
  {
    subjectCode: "LIT", paper: "003",
    topic: "African Poetry — Oral & Written: Soyinka, Okigbo, Awoonor, Kunene, Okot p'Bitek",
    tags: ["african-poetry", "christopher-okigbo", "wole-soyinka", "kofi-awoonor", "oral-poetry", "lit003"],
    syllabus: `Background to African Poetry: Oral and Written traditions; Interface between oral and written forms; Anonymity and Authorship in African oral poetry; Wole Soyinka's The Four Archetypes; Christopher Okigbo's Path of Thunder (Biafran war, prophetic voice); Kofi Awoonor's Songs of Sorrow (Ewe dirge tradition, loss, longing); Masizi Kunene's Emperor Shaka the Great (African epic); Okot p'Bitek's Song of Lawino (Acholi culture vs Western influence).`,
  },
  {
    subjectCode: "LIT", paper: "004",
    topic: "Literary Appreciation and Criticism — Unseen Prose, Poetry and Drama",
    tags: ["literary-criticism", "unseen-poetry", "unseen-prose", "appreciation", "critical-approaches", "lit004"],
    syllabus: `Skills of literary appreciation and criticism of main genres: drama, poetry, prose fiction; Critical approaches: Biographical, Philosophical, Textual, Structural; How to analyse an unseen poem: tone, mood, imagery, rhyme scheme, theme, message; How to analyse unseen prose: narrative voice, style, characterization, setting, theme; Writing critical essays and commentaries; JUPEB examination technique; common question types and how to answer them; checklist for literary analysis.`,
  },

  // ─────────────────────────── GOVERNMENT ───────────────────────────
  {
    subjectCode: "GOV", paper: "001",
    topic: "Nature of Government and Politics — Definitions, Methods, Scope",
    tags: ["government", "politics", "political-science", "gov001"],
    syllabus: `Definitions of government and politics; Rationale for studying government as an academic discipline; Arguments on the scientific status of politics; Methods/Approaches to the study: Philosophical, Normative, Institutional, Historical, Comparative, Qualitative/Quantitative, Behavioural, Empirical; Relationship between government/politics and History, Law, Economics, Geography, Sociology, Psychology; Scope: Political Theory, Political Economy, International Relations, Public Administration, Local Government, Comparative Politics, Peace and Conflict Studies, Security Studies, Development Studies.`,
  },
  {
    subjectCode: "GOV", paper: "001",
    topic: "Basic Concepts of Government — Power, Authority, Legitimacy, Sovereignty",
    tags: ["power", "authority", "legitimacy", "sovereignty", "political-culture", "gov001"],
    syllabus: `Power — definition, sources and types; Influence vs Power; Authority — definition, Max Weber's three types (Traditional, Charismatic, Legal-rational); Legitimacy — meaning, how governments gain and lose it; Sovereignty — internal and external sovereignty, de jure vs de facto; Nation vs State vs Country; Political Culture — definition, types (participant, subject, parochial); Political Socialization — agents and processes; Political Participation — forms and levels.`,
  },
  {
    subjectCode: "GOV", paper: "001",
    topic: "Meaning and Nature of the State — Definition, Functions, Theories, Types",
    tags: ["state", "theories-of-state", "unitary-state", "federal-state", "gov001"],
    syllabus: `Definition of the State; Purpose and Functions of the Modern State: security, social welfare, economic regulation, law enforcement; Theories of the State: Idealist (Hegel), Liberal, Marxist, Pluralist; Characteristics of the State: defined population, territory, government, sovereignty; Types of State: Unitary, Federal, Confederal — definition, features, examples, strengths and weaknesses; Difference between State and Government; Difference between State and Nation.`,
  },
  {
    subjectCode: "GOV", paper: "001",
    topic: "Structure and Types of Government — Executive, Legislature, Judiciary, Democracy",
    tags: ["executive", "legislature", "judiciary", "democracy", "presidential-system", "gov001"],
    syllabus: `Structure of Government: Executive (functions, types — presidential vs parliamentary), Legislature (functions, bicameral vs unicameral, lawmaking process), Judiciary (functions, independence, judicial review); relationships, strengths and weaknesses of each arm; Separation of Powers and Checks and Balances; Types of government: Democracy, Monarchy, Oligarchy, Aristocracy, Military, Theocracy, Gerontocracy; Systems of Government: Presidential, Parliamentary, Republican, Unitary, Federal, Confederal; Differences between government and governance.`,
  },
  {
    subjectCode: "GOV", paper: "001",
    topic: "Constitution and Constitutionalism — Types, Features, Rule of Law",
    tags: ["constitution", "constitutionalism", "rule-of-law", "separation-of-powers", "gov001"],
    syllabus: `Definition of Constitution; Types: Written and Unwritten (codified/uncodified), Unitary and Federal, Flexible and Rigid; Objectives of a Constitution: Empowering States, Establishing values and goals, Providing Government stability, Protecting freedom, Legitimizing regimes; Definition of Constitutionalism; Features: Rule of Law, Separation of Powers, Supremacy of the Constitution, Fundamental Human Rights, Independence of the Judiciary, Checks and Balances; Relationship between Constitution and Constitutionalism; Nigerian 1999 Constitution as case study.`,
  },
  {
    subjectCode: "GOV", paper: "001",
    topic: "Citizenship — Meaning, Acquisition, Rights and Duties",
    tags: ["citizenship", "fundamental-rights", "civic-duties", "naturalisation", "gov001"],
    syllabus: `Meaning of citizenship; Ways of acquiring citizenship: birth (jus soli, jus sanguinis), registration, naturalisation, marriage; Rights of citizens: civil, political, social, economic rights; Duties and obligations of citizens: tax, military service, obeying laws, voting; Dual citizenship; Statelessness; Revocation of citizenship; Citizenship rights under the Nigerian 1999 Constitution — Chapter 4 Fundamental Rights.`,
  },
  {
    subjectCode: "GOV", paper: "002",
    topic: "Political Thoughts and Ideologies — Social Contract, Utilitarianism, Communism, Fascism",
    tags: ["political-ideology", "social-contract", "hobbes", "locke", "rousseau", "marxism", "gov002"],
    syllabus: `Major Political Thoughts: Social Contract Theory — Thomas Hobbes (Leviathan, state of nature), John Locke (consent of the governed, natural rights), Jean Jacques Rousseau (general will, popular sovereignty); Utilitarianism — John Stuart Mill and Jeremy Bentham (greatest happiness principle); Meaning, Nature and Functions of Ideology; Types: Communalism, Feudalism, Capitalism, Imperialism, Fascism, Nazism, Marxism, Socialism, Communism, Authoritarianism, Totalitarianism, Anarchism, Feminism, Environmentalism — definition and key features of each.`,
  },
  {
    subjectCode: "GOV", paper: "002",
    topic: "Political Parties, Party Systems and Pressure Groups",
    tags: ["political-parties", "party-systems", "pressure-groups", "gov002"],
    syllabus: `Definitions and Functions of Political Parties: aggregation of interests, political socialization, recruitment; Types of Political Parties: mass, elite, catch-all; Meaning and types of Party system: One-party, Two-party, Multi-party — merits and demerits of each; Relationship between Party Systems and Political Parties; Meaning of Pressure Groups; Types: sectional and promotional; Functions of Pressure Groups; Modes of operation: lobbying, propaganda, demonstrations; Comparison between Political Parties and Pressure Groups.`,
  },
  {
    subjectCode: "GOV", paper: "002",
    topic: "Public Opinion, Propaganda, Elections and Electoral Systems",
    tags: ["elections", "electoral-systems", "public-opinion", "propaganda", "INEC", "gov002"],
    syllabus: `Definition, Functions and Measurement of Public Opinion; Meaning and Nature of Propaganda; Functions and Strategies of Propaganda; Definition and Purpose of Elections; Types: Primary, General, Bye-election, Run-off; Meaning, Evolution and types of Suffrage (universal, property, literacy, male, female); Free and fair elections: conditions and factors militating against them; Types of electoral systems: FPTP, Proportional Representation, Alternative Vote; History of elections in Nigeria 1959-2019; Election management bodies: FEDECO, NECON, NEC, INEC; Problems of elections in Nigeria.`,
  },
  {
    subjectCode: "GOV", paper: "002",
    topic: "Public Administration and International Relations",
    tags: ["public-administration", "civil-service", "international-relations", "ECOWAS", "UN", "gov002"],
    syllabus: `Meaning of public administration; Differences and similarities between public and private administration; Theories: Administrative theory (Henri Fayol), Scientific management (F.W. Taylor), Bureaucratic theory (Max Weber), Human relation theory (Elton Mayo); Characteristics and functions of the Civil Service; Policy Process: Formulation, Implementation, Evaluation; Public corporations and local government in Nigeria; International Relations: meaning, IR vs International Politics, Foreign Policy (meaning, objectives, determinants in Nigeria), Globalization; International Organizations: ECOWAS, African Union, Commonwealth, UN, IMF, World Bank — history, structure, achievements and failures.`,
  },
  {
    subjectCode: "GOV", paper: "003",
    topic: "Pre-Colonial Systems of Government in Nigeria — Hausa/Fulani, Yoruba, Igbo",
    tags: ["pre-colonial", "hausa-fulani", "yoruba", "igbo", "traditional-government", "gov003"],
    syllabus: `Hausa/Fulani system: Emirate system under the Sokoto Caliphate, roles of Emir, District Heads, Village Heads, Ajele; Islamic administration, Sharia law; Yoruba system: Obaship institution at Ile-Ife and Oyo Empire, role of Alafin, Oyo Mesi, Bashorun, Ogboni society, checks and balances; Igbo system: village democracy, acephalous society (no central king), age-grades, Ozo/Nze title system, Ofo na Ogu, council of elders — comparison and significance.`,
  },
  {
    subjectCode: "GOV", paper: "003",
    topic: "Colonial Administration in Nigeria — Amalgamation, Constitutions, Nationalism",
    tags: ["colonial-nigeria", "amalgamation-1914", "indirect-rule", "lugard", "nationalism", "gov003"],
    syllabus: `Amalgamation of Northern and Southern Nigeria 1914 by Lugard; Reasons for amalgamation; Indirect Rule: principles, application in Hausa, Yoruba, Igbo areas, merits and demerits; Constitutional Development 1922-1960: Clifford Constitution 1922, Richards 1946, Macpherson 1951, Lyttleton 1954; Growth of Nationalism: role of Herbert Macaulay, Nnamdi Azikiwe, Obafemi Awolowo, Ahmadu Bello; Political parties and nationalist agitation; Constitutional Development 1960 to present — First, Second, Third and Fourth Republics.`,
  },
  {
    subjectCode: "GOV", paper: "003",
    topic: "Political Parties and Major Crises in Nigeria — Civil War, Military Regimes",
    tags: ["nigerian-political-parties", "PDP", "APC", "nigeria-civil-war", "military-rule", "june-12", "gov003"],
    syllabus: `First Republic Parties: NNDP, NYM, NCNC, Action Group (AG), NPC; Second Republic: NPN, UPN, NPP, GNPP, PRP; Third Republic: NRC, SDP; Fourth Republic: APP/ANPP, PDP, AD, ACN, CPC, APC, APGA; Major Political Crises: Aba women riot 1929, Kano riots 1953, AG crisis 1962, census crisis 1962/63, Nigerian-Biafra Civil War 1967-1970; June 12 1993; Boko Haram; Military rule: reasons for intervention, regimes of Ironsi, Gowon, Muritala, Obasanjo, Buhari/Idiagbon, Babangida, Abacha, Abdulsalami; achievements and failures.`,
  },
  {
    subjectCode: "GOV", paper: "004",
    topic: "Africa Before European Invasion — Empires, Kingdoms, Civilizations",
    tags: ["africa-before-colonialism", "ghana-empire", "mali", "songhai", "benin-kingdom", "zulu", "gov004"],
    syllabus: `Major contributions of Africa to world civilization before European Invasion; self-reliant political empires: Ghana Empire (Wagadou), Mali Empire (Mansa Musa, Timbuktu), Songhai Empire (largest pre-colonial African empire); Kingdoms: Zulu (military organization), Kanem-Bornu (trans-Saharan trade), Benin Kingdom (bronze works, oba system); African trade networks, culture, governance; contribution of African manpower to building the new world (Transatlantic Slave Trade context).`,
  },
  {
    subjectCode: "GOV", paper: "004",
    topic: "European Invasion of Africa — Colonialism, Berlin Conference, Apartheid, Neocolonialism",
    tags: ["colonialism", "berlin-conference", "scramble-for-africa", "apartheid", "neocolonialism", "gov004"],
    syllabus: `Strategies of European invasion: Slave trade, Legitimate trade, Missionaries, Colonialism, Treaties of friendship, Military Conquests; Reasons for European Expansion: 3Cs (Commerce, Christianity, Civilization), Industrial Revolution, need for raw materials and markets; Scramble for and Partitioning of Africa (Berlin Conference 1884-1885) — rules, outcomes; Apartheid Regime in South Africa — origins, features, resistance (ANC, Nelson Mandela), end of apartheid; African Responses: Invasion, Resistance, Negotiations, Settlement; Meaning, origin and manifestations of Neocolonialism.`,
  },
  {
    subjectCode: "GOV", paper: "004",
    topic: "Colonial Administration, Nationalist Movements and Critical Issues in African Politics",
    tags: ["indirect-rule", "assimilation-policy", "nationalist-movements", "democratization-africa", "ethnicity", "gov004"],
    syllabus: `Colonial Systems: British Indirect Rule (use of existing African institutions), French Assimilation Policy (making Africans culturally French), Portuguese Association Policy; Nationalist Movements in British West Africa: role of educated elite, WASU, NCBWA; Nationalist Movements in French West Africa: Negritude movement (Senghor, Cesaire); Critical Issues in African Government and Politics: Democratization and Political Process, Democracy and Human Rights, Ethnicity and tribalism, Poverty and underdevelopment, Leadership problems (coup culture), Migration and Human Trafficking.`,
  },

  // ─────────────────────────── CRS ───────────────────────────
  {
    subjectCode: "CRS", paper: "001",
    topic: "Formation of the Old Testament — Inspiration, Canonization and Genre",
    tags: ["old-testament", "inspiration", "canonization", "biblical-literature", "crs001"],
    syllabus: `Biblical Inspiration — meaning as it applies to OT composition; Theories of Inspiration: Dictation Theory, Verbal Plenary, Dynamic/Content Theory, Neo-Orthodox Theory, Limited Theory; Canonization — meaning of 'canon'; process of OT canonization; criteria (divine authorship, use by prophets, Jewish community acceptance); Canonical books: Torah/Law (Genesis–Deuteronomy), Nebiim/Prophets, Ketubiim/Writings; Genre of OT Literature: Historical (Joshua, Kings), Poetic (Psalms, Song of Songs), Wisdom (Proverbs, Job, Ecclesiastes), Prophetic (Isaiah, Jeremiah, Amos).`,
  },
  {
    subjectCode: "CRS", paper: "001",
    topic: "Mosaic Authorship of the Pentateuch, JEDP Documentary Hypotheses, Israel's Nationhood",
    tags: ["pentateuch", "mosaic-authorship", "documentary-hypothesis", "JEDP", "abraham", "moses", "crs001"],
    syllabus: `Israel's Nationhood: God's call of Abraham (Gen. 12:1-7) — process, promises (land, seed, blessing); Moses' encounter with God in the wilderness (Exodus 3:1-18, 20:1-20) — burning bush, Ten Commandments; Proofs of Mosaic Authorship: arguments for — internal evidences (Mosaic passages, references) and external evidences; Arguments Against Mosaic Authorship; The Documentary Hypotheses: Early, Fragmentary, Supplementary; The J.E.D.P. documents and their characteristics (Jahwist, Elohist, Deuteronomist, Priestly).`,
  },
  {
    subjectCode: "CRS", paper: "001",
    topic: "The Rise of Monarchy in Israel — Saul, David and Solomon",
    tags: ["israelite-monarchy", "king-saul", "king-david", "king-solomon", "samuel", "crs001"],
    syllabus: `Historical settings for monarchy (1 Sam 1-7): ministry of Eli, birth and call of Samuel; Role of Samuel as Priest, Judge and Prophet; War with Philistines and capture of the Ark; Factors that led to the request for a king (1 Sam 8-12): fear of Philistines, corruption of Samuel's sons, influence of other nations; Samuel anoints Saul; Saul's Reign: successes (built army, united Israel) and failures (disobedience, divination, pride, 1 Sam 13-15); David's Reign (1 Sam 16–2 Sam 24): anointing, united kingdom, Psalm writing, weaknesses (Bathsheba, Uriah); Solomon's Reign (1 Kg 1-11): wisdom, building projects (Temple), forced labour, idolatry.`,
  },
  {
    subjectCode: "CRS", paper: "001",
    topic: "The Divided Kingdom, Exiles and Rise of Prophecy — Isaiah, Amos and Hosea",
    tags: ["divided-kingdom", "israel-exile", "isaiah", "amos", "hosea", "prophecy", "crs001"],
    syllabus: `Factors that led to the Division of the Kingdom (1 Kg 12:1-25): Solomon's bad rule, Rehoboam's unwise decision, Ahijah's prophecy, age-long tribal conflict; Reign of Rehoboam of Judah and Jeroboam of Israel; The Exiles: Assyrian exile of Israel (721 BC) and Babylonian exile of Judah (587 BC) — causes and effects (2 Kg 17, 24-25); Rise of Prophecy: Pre-Canonical Prophets (Moses, Samuel, Joshua); Isaiah's message on holiness (Isa 1-6) — relevance to nation building; Hosea's message on love (Hos 1-3); Amos on justice (Amos 1-5); Relevance of these prophetic messages to modern Nigeria.`,
  },
  {
    subjectCode: "CRS", paper: "002",
    topic: "Historical Background to the New Testament — Roman Rule, Maccabean Revolt, Religious Groups",
    tags: ["new-testament", "maccabean-revolt", "pharisees", "sadducees", "roman-empire", "crs002"],
    syllabus: `Development of the nation of Israel under the Roman Empire; The Revolt (Maccabean Revolt 167-160 BC against Antiochus Epiphanes); Socio-political groups: Zealots (violent resistance), Herodians (pro-Herod), Scribes; Religious groups: Pharisees (oral and written law), Sadducees (only Torah, denied resurrection), Essenes (ascetic community, Dead Sea Scrolls); Religious Institutions: Temple (centre of worship, priesthood), Synagogue (local worship, Torah reading); Synopsis and materials: factors that delayed and prompted writing of Gospels; Canonization of the New Testament.`,
  },
  {
    subjectCode: "CRS", paper: "002",
    topic: "The Synoptic Gospels — Problem, Modern Criticism: Form, Source and Redaction Criticism",
    tags: ["synoptic-gospels", "synoptic-problem", "form-criticism", "source-criticism", "two-source-hypothesis", "crs002"],
    syllabus: `Meaning of 'Synoptic': sun-opsis (to view from same angle); The Synoptic Gospels: Matthew, Mark, Luke; Similarities: shared narratives (Triple Tradition), shared sayings (Double Tradition); Dissimilarities; The Synoptic Problem: why do Matthew, Mark, Luke agree and disagree?; Proposed solutions: Memorabilia (Papias), Griesbach Hypothesis (Matthew priority), Two-Source Hypothesis (Mark + Q), Four-Source Hypothesis; Modern Criticism: Textual Criticism (establishing original text), Form Criticism (oral traditions behind text), Source Criticism (identifying sources), Redaction Criticism (each author's theological editing).`,
  },
  {
    subjectCode: "CRS", paper: "002",
    topic: "Literature and Theology of Matthew, Mark, Luke and the Gospel of John",
    tags: ["gospel-matthew", "gospel-mark", "gospel-luke", "gospel-john", "synoptic-theology", "crs002"],
    syllabus: `Matthew: authorship (debated — Matthew the tax collector), destination (Jewish Christians in Antioch), date (80-90 CE), purpose (show Jesus as Messiah fulfilling OT), theological emphases (Son of David, Kingdom of Heaven, 5 discourses), characteristics (didactic, fulfilment quotes); Mark: authorship (John Mark), date (65-70 CE), characteristics (vivid action, candour, Messianic Secret, Son of Man); Luke: authorship (Paul's companion), date, purpose, characteristics (universalism, women/children, compassion, Son of Man as Saviour); John: authorship, date, Logos theology, comparison/contrast with Synoptics.`,
  },
  {
    subjectCode: "CRS", paper: "003",
    topic: "Previous Attempts at Christianizing Africa — North Africa and Portuguese Missions",
    tags: ["christianity-africa", "north-africa", "portuguese", "slave-trade", "first-contact", "crs003"],
    syllabus: `Pre-Christian contacts with Africa: Abraham and Joseph in Egypt (Gen 12:10; 39-50); Christian contacts: Baby Jesus in Egypt (Matt 2:13-15), Pentecost Day (Acts 2), Ethiopian Eunuch (Acts 8:26-40 — Philip's mission); First attempt in North Africa: Alexandria, Tertullian, Augustine — reasons for failure (heresies, migration, Islamization); Second Attempt — Portuguese: Prince Henry the Navigator's expeditions 1418-1460; reasons for explorations (evangelical, commercial); reasons for failure (slave trade, climate, paucity of funds).`,
  },
  {
    subjectCode: "CRS", paper: "003",
    topic: "Establishment of Christianity in Sierra Leone and Ghana (Gold Coast)",
    tags: ["sierra-leone", "christianity-ghana", "missionary-societies", "CMS", "evangelical-revivals", "crs003"],
    syllabus: `Evangelical Revivals in Europe and America: John Wesley (Methodist revival), Whitefield; birth of Mission Societies: BMS (1792), CMS (1799), LMS (1795); Anti-Slavery movements: Abolitionists (William Wilberforce), role of freed slaves (ex-slaves as Krios); Founding of Sierra Leone (Freetown 1787): economic, social, religious reasons; Missionary groups: RCM, Baptist, Anglican, Presbyterian, Sudan Interior Mission; Niger expeditions 1841, 1845, 1857 — successes and failures; Christianity in the Gold Coast (Ghana): RCM, Presbyterian (Basel Mission), Methodist, Anglican — activities, education and agricultural influence.`,
  },
  {
    subjectCode: "CRS", paper: "003",
    topic: "Planting of Christianity in Nigeria — Yorubaland, Igboland, Northern Nigeria, Calabar",
    tags: ["christianity-nigeria", "CMS", "missionary-activities", "yorubaland", "igboland", "northern-nigeria", "crs003"],
    syllabus: `Missionary activities in Yoruba Land: Samuel Ajayi Crowther, CMS in Abeokuta (1843), Ibadan, Lagos; influence of CMS, RCM, Wesleyan Methodist, Baptist; role of freed slaves returning from Sierra Leone; Missionary activities in Igbo Land: Onitsha (1857 — Bishop Crowther), Aba; CMS, RCM-Holy Ghost Fathers, Methodist influence; education and literacy; Missionary activities in Northern Nigeria: Lokoja, Zaria, Benue; CMS, RCM, Sudan United Mission (SUM), Sudan Interior Mission (SIM) — challenges (Islam); Calabar and Bonny: Mary Slessor (CMS), Presbyterian, QIM.`,
  },
  {
    subjectCode: "CRS", paper: "003",
    topic: "African Independent Churches, Pentecostalism and Proliferation of Churches in Nigeria",
    tags: ["african-independent-churches", "pentecostalism", "church-proliferation", "Benson-Idahosa", "AICs", "crs003"],
    syllabus: `Clarification and Classification of African Independent/Indigenous/Initiated Churches (AICs): Ethiopian Churches, Zionist/Spiritual Churches, Neo-Prophetic Churches; Distinction from Mainline and Pentecostal Churches; Characteristics: White garment, prayer aids (water, candles), emphasis on spirituality, healing, prophecy; Founders: Garrick S. Braide (Niger Delta), Moses Orimolade (Cherubim and Seraphim), S.B.J. Oschoffa (Celestial Church); Pentecostalism in Nigeria: definition, features (speaking in tongues, healing, women ordination, prosperity gospel, media evangelism); Founders/Leaders: Bishop Benson Idahosa, W.F. Kumuyi, Apostle Numbere; Church Proliferation: clarification, causes (leadership tussle, unemployment, doctrinal disagreement), merits (expansion, employment), negative impacts (unhealthy rivalry, heresy).`,
  },
  {
    subjectCode: "CRS", paper: "004",
    topic: "Religion and Society — Relationship, Theories of Religion (Marx, Durkheim, Weber, Freud)",
    tags: ["religion-society", "karl-marx", "emile-durkheim", "max-weber", "theories-of-religion", "crs004"],
    syllabus: `Meaning of Religion and Society; Dimensions of Christian religion: material/symbols, rituals, experience, ethics, myths, doctrine, socials/institutions; Relationship between Religion and Society; Theories of Religion: Conflict Theory (Karl Marx — religion as opium of the people, false consciousness), Functional Theory (Emile Durkheim — religion as social cohesion, collective effervescence), Social Change Theory (Max Weber — Protestant Ethic and the Spirit of Capitalism), Psycho-analytical Theory (Sigmund Freud — religion as wish-fulfilment, Totem and Taboo), Phenomenological Theory (Friedrich Schleiermacher — religion as feeling of absolute dependence), Social Theory (Immanuel Kant — moral framework) — meaning, background, significance in Nigerian society.`,
  },
  {
    subjectCode: "CRS", paper: "004",
    topic: "Functions of Religion, Religiosity, Peace, Conflict Resolution and Human Values",
    tags: ["functions-of-religion", "religiosity", "peace", "conflict-resolution", "human-values", "crs004"],
    syllabus: `Clarification of 'measures of religiosity'; Criteria: Prayer (personal/communal), Church attendance (frequency), financial responsibility (tithe/offerings), use of religious language, reading of scriptures, participation in sacraments; Functions of religion in society: maintenance of law and order, social cohesion, social control, moral guidance, identity formation; Positive vs negative functions; Religion and Peace: inter-religious dialogue, tolerance, inter-faith activities, peace education; Religion and Conflict Resolution: Dialogue, Forgiveness, Teaching/Preaching, Patience, Counselling, Reconciliation; Religious Personality — concept and human values (love, peace, dignity, responsibility, honesty, contentment).`,
  },
  {
    subjectCode: "CRS", paper: "004",
    topic: "Christian Response to Contemporary Issues in Nigerian Society",
    tags: ["contemporary-issues", "drug-abuse", "corruption", "HIV-AIDS", "human-trafficking", "gender-violence", "crs004"],
    syllabus: `Christianity and Contemporary Issues in Nigerian Society: Drug Abuse (causes, effects, Christian response — 1 Cor 6:19-20), Cultism (secret societies in universities, biblical response), Corruption (Micah 6:8, Romans 13:1-4), Insurgencies and Terrorism (Boko Haram, biblical peace-making), Rape and Gender-Based Violence, Abortion and Euthanasia (sanctity of life), Examination Malpractices, Epidemic Diseases (Covid-19, HIV/AIDS — compassion, stigma), Bad Governance, Syncretism, Ritual Killings, Fraud/Cybercrime, Human Trafficking, Electoral Violence — Christian ethical stance, biblical foundation, and practical response for each issue.`,
  },
];

async function generateNote(topic: TopicEntry, subjectId: number, subjectName: string): Promise<string> {
  const paperLabels: Record<string, string> = {
    "001": "1st Incourse", "002": "1st Semester Exam",
    "003": "2nd Incourse", "004": "2nd Semester",
  };

  const prompt = `Generate comprehensive, academically detailed JUPEB lecture notes for the following:

Subject: ${subjectName} (${topic.subjectCode})
Paper: ${topic.paper} — ${paperLabels[topic.paper]}
Topic: ${topic.topic}

Syllabus Content to Cover:
${topic.syllabus}

Requirements:
1. Write at JUPEB university foundation level — scholarly, thorough, and exam-ready
2. Use this exact structure:
   ## Introduction
   ## Key Definitions
   ## Main Content (use ### sub-sections for each sub-topic)
   ## Notable Figures / Key Texts (where applicable)
   ## Critical Analysis and Discussion
   ## Summary of Key Points
   ## 🎯 Exam Focus Points
   ## 🎯 Exam Tips (5 specific, actionable tips for JUPEB exam)
3. Use Nigerian/West African context and examples throughout
4. Reference specific scholars, theories, dates, and texts from the syllabus
5. Bold all key terms using **term**
6. Minimum 900 words — be comprehensive and thorough
7. For Government and CRS, mention Nigeria-specific application where relevant

Make these notes comprehensive enough that a student who reads only this will be fully prepared for any JUPEB question on this topic.`;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    config: { systemInstruction: SYSTEM_PROMPT },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = response.text();
  if (!text) throw new Error("Empty response from AI");
  return text;
}

async function run() {
  console.log("🚀 JUPEB Academic Notes Seeder");
  console.log("📚 Total topics to generate:", TOPICS.length);
  console.log("=".repeat(60));

  const subjects = await db.select().from(subjectsTable);
  const subjectMap = new Map<string, { id: number; name: string }>();
  for (const s of subjects) {
    const code = s.code.toUpperCase().replace(/\d+/g, "").trim();
    if (!subjectMap.has(code)) subjectMap.set(code, { id: s.id, name: s.name });
  }

  console.log("Subjects:", [...subjectMap.entries()].map(([k, v]) => `${k}(id=${v.id})`).join(", "));

  let generated = 0, skipped = 0, failed = 0;

  for (const topic of TOPICS) {
    const subjectEntry = subjectMap.get(topic.subjectCode);
    if (!subjectEntry) {
      console.log(`⚠️  Subject not found: ${topic.subjectCode}`);
      failed++;
      continue;
    }

    const existing = await db.select({ id: notesTable.id }).from(notesTable).where(
      and(eq(notesTable.subjectId, subjectEntry.id), eq(notesTable.title, topic.topic))
    );

    if (existing.length > 0) {
      console.log(`⏭️  [${topic.subjectCode} ${topic.paper}] Already exists: ${topic.topic}`);
      skipped++;
      continue;
    }

    console.log(`\n📝 [${topic.subjectCode} ${topic.paper}] ${topic.topic}`);

    try {
      const content = await generateNote(topic, subjectEntry.id, subjectEntry.name);

      await db.insert(notesTable).values({
        subjectId: subjectEntry.id,
        paper: topic.paper,
        title: topic.topic,
        content,
        tags: ["ai-generated", "syllabus-based", topic.subjectCode.toLowerCase(), ...topic.tags],
      });

      console.log(`   ✅ Saved — ${content.length} characters`);
      generated++;
      await delay(3500);

    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error(`   ❌ Failed: ${msg.slice(0, 150)}`);
      failed++;

      if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        console.log("   ⏳ Quota hit — waiting 90 seconds...");
        await delay(90000);
      } else {
        await delay(4000);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Generated: ${generated}`);
  console.log(`⏭️  Skipped:   ${skipped}`);
  console.log(`❌ Failed:    ${failed}`);
  console.log(`📚 Total:     ${TOPICS.length}`);

  await pool.end();
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
