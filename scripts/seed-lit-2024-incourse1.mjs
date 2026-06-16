/**
 * Seed script: Literature in English — 2024/2025 First In-Course Exam (Paper 001)
 * Subject ID: 5  |  Paper: 001  |  Year: 2024
 * University of Laos, School of Foundation Studies — J126 Option C
 *
 * Run:  NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/seed-lit-2024-incourse1.mjs
 */

import pg from "pg";
import { URL } from "url";

const { Pool } = pg;

let connectionString = process.env.DATABASE_URL;
try {
  const u = new URL(connectionString);
  u.searchParams.delete("sslmode");
  connectionString = u.toString();
} catch {}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const SUBJECT_ID = 5;   // Literature in English
const PAPER      = "001";
const YEAR       = 2024;

// ── 40 Objective Questions ──────────────────────────────────────────────────
const mcq = [
  {
    questionText: "The setting of a story in a novel is a combination of the",
    options: [
      "A. temporality and imagery elements.",
      "B. spatial and figurative elements.",
      "C. temporal and spatial elements.",
      "D. historicity and spatial elements.",
    ],
    correctOption: "C",
    explanation: "Setting in a novel encompasses both the time (temporal) and place (spatial) dimensions of the narrative — when and where the story takes place. These two components together constitute what we call the setting.",
  },
  {
    questionText: "The novel in the English tradition is a/an",
    options: [
      "A. 16th century phenomenon.",
      "B. 17th century phenomenon.",
      "C. 18th century phenomenon.",
      "D. 19th century phenomenon.",
    ],
    correctOption: "C",
    explanation: "The novel as a distinct literary form in the English tradition emerged in the 18th century, with landmark works such as Daniel Defoe's Robinson Crusoe (1719), Samuel Richardson's Pamela (1740), and Henry Fielding's Tom Jones (1749).",
  },
  {
    questionText: "The style of narrating a story to reflect real life is known as",
    options: [
      "A. naturalism",
      "B. realism",
      "C. expressionism.",
      "D. classicism.",
    ],
    correctOption: "B",
    explanation: "Realism is the literary mode that aims to represent life as it actually is — depicting ordinary people, everyday settings, and believable events. It stands in contrast to idealism or romanticism, which embellish or idealise reality.",
  },
  {
    questionText: "The literary form which adopts the style of rigorous narration of events that give the audience detailed description is called",
    options: [
      "A. poetry",
      "B. novel",
      "C. farce",
      "D. allegory.",
    ],
    correctOption: "B",
    explanation: "The novel is distinguished by its extended, detailed, and rigorous prose narration of events, characters, and settings. Unlike poetry (verse form), farce (comic drama), or allegory (symbolic narrative), the novel's hallmark is its sustained descriptive and narrative depth.",
  },
  {
    questionText: "The type of literary prose form which focuses on the chivalrous and mysterious adventures of a knight is the",
    options: [
      "A. epic",
      "B. ballad",
      "C. tragedy",
      "D. romance",
    ],
    correctOption: "D",
    explanation: "Medieval romance is a prose (or verse) literary form centred on the ideals of chivalry, courtly love, and the adventurous quests of knights. Works like Le Morte d'Arthur exemplify this genre focused on mysterious, noble adventures.",
  },
  {
    questionText: "The most popular form of drama during the Medieval period is the",
    options: [
      "A. Tragic plays",
      "B. Morality plays",
      "C. Comedy",
      "D. Satire",
    ],
    correctOption: "B",
    explanation: "Morality plays were the dominant dramatic form of the Medieval period. They dramatised the spiritual struggle of the human soul — allegorically portrayed — between virtues and vices. Famous examples include Everyman and Mankind.",
  },
  {
    questionText: "Medieval drama is also generally known as",
    options: [
      "A. ritual drama",
      "B. church drama",
      "C. temple drama",
      "D. spiritual drama",
    ],
    correctOption: "B",
    explanation: "Medieval drama is generally termed 'church drama' because it originated within the Christian Church as a means of dramatising Biblical stories and religious teachings for largely illiterate congregations. It developed from liturgical ceremonies and was performed in or around churches.",
  },
  {
    questionText: "___________ is a defining element of African drama that differentiates it from European drama",
    options: [
      "A. aside",
      "B. character",
      "C. dialogue",
      "D. myth",
    ],
    correctOption: "D",
    explanation: "Myth is a defining and distinctive element of African drama. Unlike European drama which is largely secular and text-based, African drama is deeply rooted in mythological, ritual, and spiritual traditions that integrate music, dance, and communal storytelling.",
  },
  {
    questionText: "The traditional Yoruba itinerant theatre and drama is known as the",
    options: [
      "A. Agbegijo",
      "B. Eegun Alare",
      "C. Alarinjo",
      "D. Eegun onidan",
    ],
    correctOption: "C",
    explanation: "The Alarinjo is the traditional Yoruba travelling (itinerant) theatre tradition. Professional masquerade performers would travel from town to town performing drama and acrobatics. It is also called Apidan theatre and is considered a forerunner of modern Yoruba popular theatre.",
  },
  {
    questionText: "___________ is the prominent first-generation literary dramatist in Nigeria",
    options: [
      "A. Femi Osofisan",
      "B. Kola Ogunmola",
      "C. Hubert Ogunde",
      "D. Wole Soyinka",
    ],
    correctOption: "D",
    explanation: "Wole Soyinka is the most prominent first-generation literary dramatist in Nigeria. A Nobel Laureate (1986), his plays such as Death and the King's Horseman, A Dance of the Forests, and The Strong Breed established him as the foremost figure of Nigerian literary drama.",
  },
  {
    questionText: "Structurally, the novel genre is differentiated from poetry because the novel is written",
    options: [
      "A. in sentences and paragraphs.",
      "B. in lines and stanzas.",
      "C. in acts and scenes.",
      "D. in episodes and scenes.",
    ],
    correctOption: "A",
    explanation: "The fundamental structural difference between the novel and poetry is that novels are written in prose — organised into sentences and paragraphs — while poetry is structured in lines and stanzas. Drama uses acts and scenes.",
  },
  {
    questionText: "The character in a novel who becomes knowledgeable after initial innocence as the story develops is called a",
    options: [
      "A. flat character.",
      "B. static character.",
      "C. stereotype character.",
      "D. dynamic character.",
    ],
    correctOption: "D",
    explanation: "A dynamic character undergoes significant internal change — in knowledge, attitude, or personality — over the course of the narrative. The journey from innocence to experience or ignorance to knowledge defines the dynamic character.",
  },
  {
    questionText: "The point of view that is not limited by place or time and can reveal the inner thoughts and feelings of characters is called the",
    options: [
      "A. First person point of view.",
      "B. First person limited point of view.",
      "C. Third person limited point of view.",
      "D. Omniscient point of view.",
    ],
    correctOption: "D",
    explanation: "The omniscient (all-knowing) point of view allows the narrator unlimited access to any character's thoughts, feelings, and motivations, and is unrestricted by time or place. This is the most flexible narrative perspective.",
  },
  {
    questionText: "The type of novel that presents a protagonist whose character gradually grows from innocence to experience is called the",
    options: [
      "A. Epistolary novel.",
      "B. Picaresque novel.",
      "C. Bildungsroman.",
      "D. Romance.",
    ],
    correctOption: "C",
    explanation: "The Bildungsroman (German: 'novel of formation/education') traces the psychological and moral growth of a protagonist from youth and innocence to maturity and experience. Classic examples include Dickens' Great Expectations and Goethe's Wilhelm Meister.",
  },
  {
    questionText: "In the novel genre, an episodic plot that focuses on the adventures of a character who is mischievous is called a",
    options: [
      "A. Travelogue",
      "B. Documentary",
      "C. Picaresque",
      "D. Adventurist",
    ],
    correctOption: "C",
    explanation: "The picaresque novel features a roguish, mischievous protagonist (the picaro) who moves through a series of episodic adventures in a loosely structured plot. Examples include Lazarillo de Tormes and Henry Fielding's Tom Jones.",
  },
  {
    questionText: "Among the following modern playwrights ___________ is considered the 'Father of Modern Drama'",
    options: [
      "A. Eugene O'Neill",
      "B. August Strindberg",
      "C. Henrik Ibsen",
      "D. Anton Chekhov",
    ],
    correctOption: "C",
    explanation: "Henrik Ibsen (1828–1906) is universally recognised as the 'Father of Modern Drama'. His realistic problem plays such as A Doll's House, Ghosts, and Hedda Gabler broke with Romantic conventions and introduced social realism and complex psychological characters to the theatre.",
  },
  {
    questionText: "In Greek tragedy, 'hamartia' refers to",
    options: [
      "A. the hero's fatal flaw",
      "B. the hero's moment of recognition",
      "C. the hero's reversal of fortune",
      "D. the hero's excessive pride",
    ],
    correctOption: "A",
    explanation: "Hamartia (from Aristotle's Poetics) refers to the tragic hero's fatal flaw or error of judgement — the weakness in character or a mistaken action that leads to the hero's downfall. Note: it is a broader concept than hubris (excessive pride), which is just one type of hamartia.",
  },
  {
    questionText: "According to Aristotle, the most important element of Greek tragic drama is the",
    options: [
      "A. hero.",
      "B. elevated language.",
      "C. dithyramb.",
      "D. plot.",
    ],
    correctOption: "D",
    explanation: "In The Poetics, Aristotle explicitly states that plot (mythos) is the 'soul of tragedy' and the most important of the six elements. Without a well-constructed plot, even excellent characters and language cannot produce a successful tragedy.",
  },
  {
    questionText: "In a typical tragic plot, 'climax' refers to the point",
    options: [
      "A. where conflicts are resolved.",
      "B. where conflict and emotions are heightened",
      "C. where actions start falling.",
      "D. where the story is exposed.",
    ],
    correctOption: "B",
    explanation: "The climax is the highest point of dramatic tension in the plot — the moment where conflict and emotions reach their peak intensity. It is the turning point of the story, after which the action begins to fall (the falling action or catastrophe).",
  },
  {
    questionText: "In drama, the plot develops tension during the process of",
    options: [
      "A. exposition",
      "B. complication",
      "C. denouement",
      "D. climax",
    ],
    correctOption: "B",
    explanation: "Complication (also called rising action) is the stage of dramatic structure where conflicts develop, obstacles multiply, and tension builds. It follows the exposition (introduction) and leads toward the climax. The denouement is the resolution after the climax.",
  },
  {
    questionText: "A novel which adopts a letter writing mode of narrative style is called a/an",
    options: [
      "A. epistolary novel.",
      "B. picaresque novel.",
      "C. bildungsroman.",
      "D. allegory.",
    ],
    correctOption: "A",
    explanation: "An epistolary novel tells its story through a series of documents — primarily letters, but sometimes diary entries or newspaper clippings. Famous examples include Samuel Richardson's Pamela (1740) and Bram Stoker's Dracula (1897).",
  },
  {
    questionText: "One distinctive feature of the novel, which differentiated it from the novella and the short story is",
    options: [
      "A. the length and simple plot structure",
      "B. dialogue and action",
      "C. dialogue and setting",
      "D. the length and complex plot structure",
    ],
    correctOption: "D",
    explanation: "The novel is distinguished from shorter prose forms (novella, short story) principally by its length and its capacity to sustain a complex, multi-layered plot structure with several subplots, a larger cast of characters, and more detailed world-building.",
  },
  {
    questionText: "___________ is the language of the Lusophone African novel.",
    options: [
      "A. English",
      "B. French",
      "C. Portuguese",
      "D. Arabic",
    ],
    correctOption: "C",
    explanation: "Lusophone refers to Portuguese-speaking countries and cultures. The Lusophone African novel — from countries such as Angola, Mozambique, Cape Verde, Guinea-Bissau, and São Tomé and Príncipe — is written in Portuguese, the colonial language of those territories.",
  },
  {
    questionText: "The Canterbury Tales is a series of tales written by Geoffrey Chaucer during the",
    options: [
      "A. Medieval period",
      "B. Classical Period",
      "C. Renaissance Period",
      "D. Victorian Period",
    ],
    correctOption: "A",
    explanation: "Geoffrey Chaucer (c.1343–1400) wrote The Canterbury Tales in the late 14th century, firmly placing it in the Medieval period. It is one of the greatest works of medieval English literature.",
  },
  {
    questionText: "The element of prose fiction which describes the development of the story through characters' actions and events is the",
    options: [
      "A. Point of view",
      "B. Plot",
      "C. Setting",
      "D. Characterisation",
    ],
    correctOption: "B",
    explanation: "Plot is the element of prose fiction that organises the sequence of events and actions that drive the narrative forward. It is the structural backbone of the story, showing how characters' actions cause and are caused by events.",
  },
  {
    questionText: "The term 'dramatic irony' can also be called",
    options: [
      "A. Satirical irony",
      "B. Destructive irony",
      "C. Euripidean Irony",
      "D. Reversal irony.",
    ],
    correctOption: "C",
    explanation: "Dramatic irony is also known as Euripidean Irony, named after the Greek dramatist Euripides who frequently employed the device. It occurs when the audience knows something crucial that the characters on stage do not, creating a gap between appearance and reality.",
  },
  {
    questionText: "The imaginary barrier between actors and audience in drama and theatre is called",
    options: [
      "A. the fourth curtain",
      "B. the fourth stage",
      "C. the fourth wall",
      "D. the fourth scene",
    ],
    correctOption: "C",
    explanation: "The 'fourth wall' is the imaginary invisible barrier between the performers on stage and the audience. In a proscenium theatre, the three physical walls of the stage set and the imaginary 'wall' through which the audience watches complete the four walls.",
  },
  {
    questionText: "In drama, a character who serves as a contrast to another character is the",
    options: [
      "A. foil",
      "B. antagonist",
      "C. hero",
      "D. fool",
    ],
    correctOption: "A",
    explanation: "A foil is a character whose contrasting traits highlight or emphasise the qualities of another character — usually the protagonist. For example, Laertes serves as a foil to Hamlet in Shakespeare's play, contrasting Hamlet's hesitancy with his own decisiveness.",
  },
  {
    questionText: "The period of time when William Shakespeare wrote his plays is known as",
    options: [
      "A. the Classical period",
      "B. the Modern period",
      "C. the Elizabethan period",
      "D. the Neo-Classical period",
    ],
    correctOption: "C",
    explanation: "William Shakespeare (1564–1616) wrote his plays during the Elizabethan era — the reign of Queen Elizabeth I (1558–1603) and into the early Jacobean period. This age is often called the 'Elizabethan period' in literary and cultural history.",
  },
  {
    questionText: "___________ is a dramatic technique used when a character is meant to speak to the audience while other characters do not hear him or her.",
    options: [
      "A. An aside",
      "B. A monologue",
      "C. A Flashback",
      "D. A Soliloquy",
    ],
    correctOption: "A",
    explanation: "An aside is a brief remark made by a character directly to the audience while other characters on stage are presumed not to hear it. It differs from a soliloquy (a longer speech when alone on stage) and a monologue (a long speech to other characters).",
  },
  {
    questionText: "In Classical Greek drama, the term tragoidia means",
    options: [
      "A. theatre",
      "B. tragedy",
      "C. comedy",
      "D. temple",
    ],
    correctOption: "B",
    explanation: "Tragoidia is the Greek word from which 'tragedy' derives. It literally means 'goat song' (from tragos = goat + ode = song), referring to the choral dithyrambs performed in honour of Dionysus, possibly connected to goats as sacrificial animals or prizes.",
  },
  {
    questionText: "___________ is related to the origins of Greek drama.",
    options: [
      "A. Ram",
      "B. Lion",
      "C. Goat",
      "D. Elephant.",
    ],
    correctOption: "C",
    explanation: "The goat is directly linked to the origins of Greek drama. The word 'tragedy' (tragoidia) means 'goat song'. Goats were sacrificed in honour of Dionysus, the god of theatre, and some scholars believe a goat was the prize in early dramatic competitions.",
  },
  {
    questionText: "The god that was honoured as part of the origins of Greek drama is",
    options: [
      "A. Dionysus",
      "B. Thespis",
      "C. Sophocles",
      "D. Aeschylus",
    ],
    correctOption: "A",
    explanation: "Dionysus — the Greek god of wine, fertility, and ecstasy — was the deity in whose honour dramatic performances originated. The City Dionysia festival in Athens was the primary dramatic competition. Thespis, Sophocles, and Aeschylus were dramatists, not gods.",
  },
  {
    questionText: "In Greek drama, Menippean satire involves the depiction of ___________ characters.",
    options: [
      "A. fantastic",
      "B. unpredictable",
      "C. loquacious",
      "D. virulent",
    ],
    correctOption: "A",
    explanation: "Menippean satire, attributed to the Greek cynic Menippus of Gadara, is characterised by the depiction of fantastic, grotesque, and extraordinary characters and situations. It mixes genres and uses exaggerated, absurd scenarios to satirise ideas and attitudes.",
  },
  {
    questionText: "The primary purpose of drama is",
    options: [
      "A. to entertain only",
      "B. to create suspense only",
      "C. to portray human experiences",
      "D. to teach and to entertain",
    ],
    correctOption: "D",
    explanation: "Following Horace's classical dictum that literature should be both 'dulce et utile' (sweet and useful — entertaining and instructive), drama's primary dual purpose is to teach (instruct, enlighten, critique society) and to entertain. This was also Aristotle's view.",
  },
  {
    questionText: "In the art of the novel, the point of view where a character narrates the story directly is called the",
    options: [
      "A. omniscient point of view.",
      "B. second person point of view.",
      "C. first person point of view.",
      "D. eye of God point of view.",
    ],
    correctOption: "C",
    explanation: "The first person point of view occurs when a character within the story narrates events directly using 'I'. This gives an immediate, personal perspective, though it is limited to what that narrator knows and experiences.",
  },
  {
    questionText: "The novel can be defined broadly as a ___________",
    options: [
      "A. factual description of events with a beginning, a middle, and an end.",
      "B. narrative with only a beginning and an end.",
      "C. coherent, unified, fictitious prose narrative with a beginning, a middle, and an end.",
      "D. representation of character in a story.",
    ],
    correctOption: "C",
    explanation: "The novel is broadly defined as an extended, coherent, unified work of fictitious prose narrative that has a beginning, a middle, and an end. The key distinguishing features are its fictional nature, prose form, extended length, and structural unity.",
  },
  {
    questionText: "One of the following options is not a factor that led to the emergence of the novel genre",
    options: [
      "A. shift in reading taste.",
      "B. circulating libraries",
      "C. emergence of printing press and the availability of paper",
      "D. change in political structure and economy of Europe",
    ],
    correctOption: "D",
    explanation: "While shifts in reading taste, the growth of circulating libraries, and the printing press were all direct factors in the novel's rise in 18th-century England, a change in political structure and economy of Europe is the most indirect and least historically cited factor in the emergence of the novel genre.",
  },
  {
    questionText: "The picaresque novel focuses on the activities of the",
    options: [
      "A. Protagonist",
      "B. Picaroon",
      "C. Antagonist",
      "D. Foil",
    ],
    correctOption: "B",
    explanation: "The picaresque novel centres on the picaroon (also called the picaro) — a roguish, low-born rascal who survives by wit and cunning as he travels through society. The term 'picaroon' comes from the Spanish 'pícaro' meaning rogue or rascal.",
  },
  {
    questionText: "The narrative voice which indirectly conveys the nature of a character through the speech, action, thoughts, and the immediate environment of such character is the",
    options: [
      "A. External characterisation",
      "B. Implicit characterisation",
      "C. Internal characterisation",
      "D. Explicit characterisation",
    ],
    correctOption: "B",
    explanation: "Implicit (or indirect) characterisation reveals a character's nature indirectly through their speech, actions, thoughts, environment, and how others react to them — without the narrator directly stating the character's traits. Explicit characterisation directly tells the reader about a character.",
  },
];

// ── Section B Theory Questions ──────────────────────────────────────────────
const theory = [
  // LIT 001: DRAMA
  {
    questionText: "By referring to five (5) instances in the play, analyse Aristophanes' use of humor and satire in Lysistrata to critique the politics and social structures of ancient Athens.",
    markingGuide: `Award marks for discussion of at least FIVE of the following points (3 marks each for well-developed points, up to 15 marks):

1. The sex-strike premise itself as satire: Aristophanes inverts social norms by having women — traditionally powerless — hold the most powerful political weapon (sexual denial) to force men to end the Peloponnesian War. This comic reversal satirises male political incompetence.

2. The Acropolis seizure: The women's occupation of the treasury on the Acropolis satirises Athenian politicians' obsession with war funding. By physically controlling the money, the women expose the link between financial greed and prolonged warfare.

3. The Chorus of Old Men vs. Old Women: The comic battle between the male and female choruses — complete with buckets of water and torches — parodies the actual political warfare between Athens and Sparta, reducing grand political conflict to domestic slapstick.

4. Kinesias and Myrrhine's scene: Myrrhine's teasing of her husband Kinesias (repeatedly promising then denying sex) is a comic but pointed satire on how easily men can be manipulated and how their physical desires override political judgement.

5. The Spartan and Athenian negotiations: The final scene where both Athenian and Spartan men negotiate peace with obvious visible arousal (symbolised by the large leather phalluses worn by male actors) satirises how rational politics is subverted by base physical desires.

6. Lysistrata's speech to the magistrate: When Lysistrata explains to the pompous Athenian magistrate how women would run the state like untangling wool, the satire targets the exclusion of practical, sensible women from Athenian political life.

7. The magistrate's humiliation: Dressing the magistrate in women's clothing and putting a wreath on his head satirises the pretension and pomposity of Athenian male political authority.

Award marks for: identification of the instance (1 mark), explanation of the humour/satirical technique used (1 mark), link to political/social critique (1 mark).`,
    marks: 15,
  },
  {
    questionText: "With critical explication of five (5) scenes in the play, show how the women in Lysistrata challenge traditional gender roles in ancient Greek society, including their actions can be considered revolutionary or subversive.",
    markingGuide: `Award marks for discussion of at least FIVE of the following scenes/points (3 marks each, up to 15 marks):

1. The Opening Assembly (Lysistrata organising the women): Lysistrata calls women from across Greece to a meeting — a direct subversion of the exclusively male Athenian assembly (ekklesia). Women organising politically was unthinkable in ancient Athens.

2. Taking the Oath: The women swear an oath to deny their husbands sexual access — seizing agency over their own bodies in a society where women had no legal autonomy. This is deeply subversive as women's bodies were considered their husbands' property.

3. Seizing the Acropolis: The occupation of Athens' most sacred civic and financial centre by women is a revolutionary act. The Acropolis represented male civic and religious authority; the women's takeover challenges this fundamental structure.

4. Lysistrata confronting the Magistrate (Proboulos): Lysistrata engages the male magistrate in rational political debate as an equal, explaining state policy using the metaphor of wool-working. This directly challenges the Athenian exclusion of women from political discourse.

5. Myrrhine's seduction/denial of Kinesias: Rather than being passive recipients of male desire, Myrrhine takes control of the sexual dynamic, manipulating her husband with agency and intelligence — reversing the traditional gender power relationship.

6. The Spartan woman Lampito's role: Lampito's authority among the Spartan women and her role in the pan-Hellenic strike shows women transcending not just gender roles but also the political boundaries that men could not.

7. The Final Peace negotiation: Women broker the peace treaty between Athens and Sparta — the ultimate male political activity. Lysistrata presents both sides with Reconciliation (a female figure), positioning women as the true peacemakers of Greece.

Award marks for: scene identification (1 mark), explanation of gender role challenged (1 mark), analysis of how it is revolutionary or subversive (1 mark).`,
    marks: 15,
  },
  {
    questionText: "Using three (3) instances from the play, examine the politics of power play in Bose Afolayan's Once upon an Elephant.",
    markingGuide: `Award marks for discussion of at least THREE of the following instances (5 marks each, up to 15 marks):

1. Ajanaku's authority and contested leadership: The power struggle over who controls the elephant community mirrors human political power contests. Examine how Ajanaku's dominance is established, challenged, and maintained through political manoeuvring.

2. Serubawon's manipulation and scheming: Analyse how Serubawon uses deception, alliances, and behind-the-scenes manipulation to influence power dynamics — the classic technique of the political schemer who operates in the shadows of power.

3. Iya Agba's symbolic moral authority: Though not a formal ruler, Iya Agba wields significant power through wisdom and moral authority — a counter-power to brute political force that influences events and decisions.

4. Community loyalty and betrayal: The shifting of community allegiances — who supports whom and why — reveals the transactional nature of political power, where loyalty is a currency.

5. The resolution of power conflict: How the play resolves (or fails to resolve) the power struggle, and what this says about legitimate versus illegitimate political authority.

For each instance award: identification and description of the power dynamic (2 marks), analysis of the political technique/strategy used (2 marks), thematic significance (1 mark).`,
    marks: 15,
  },
  {
    questionText: "Examine the role played by the following characters in Bose Afolayan's Once Upon an Elephant in the development of the plot from exposition to denouement: i. Serubawon  ii. Iya Agba  iii. Ajanaku",
    markingGuide: `Award 5 marks per character (15 marks total):

i. SERUBAWON (5 marks):
- Role in Exposition: Introduction as an ambitious, scheming character with concealed motives (1 mark).
- Role in Rising Action/Complication: Serubawon's manipulation, scheming, and alliance-building drives the central conflict of the plot (2 marks).
- Role toward Denouement: How Serubawon's schemes are exposed or resolved, and the consequences (2 marks).

ii. IYA AGBA (5 marks):
- Role in Exposition: Established as a figure of wisdom and moral authority in the community (1 mark).
- Role in Rising Action: Iya Agba's counsel, warnings, or interventions that shape the direction of events; her role as a moral anchor amid political chaos (2 marks).
- Role toward Denouement: Her influence on how the conflict is ultimately resolved; whether her wisdom prevails (2 marks).

iii. AJANAKU (5 marks):
- Role in Exposition: Introduced as the central figure of power/authority around whom the conflict revolves (1 mark).
- Role in Rising Action: Ajanaku's actions, decisions, and responses to challenges drive the plot's complications forward (2 marks).
- Role toward Denouement: How Ajanaku's journey concludes — whether through triumph, defeat, or transformation — and what this means for the community (2 marks).

Award marks for textual specificity and analytical depth.`,
    marks: 15,
  },
  // LIT 002: PROSE FICTION
  {
    questionText: "With textual reference to five (5) instances in Peter Abrahams' Mine Boy, discuss the role of setting in the development of the plot.",
    markingGuide: `Award marks for discussion of at least FIVE of the following instances (3 marks each, up to 15 marks):

1. The Malay Camp/slums of Johannesburg: The urban slum setting establishes the conditions of poverty and racial oppression that define Xuma's world from the novel's opening. The cramped, degraded living conditions set up the central conflict between human dignity and systemic dehumanisation.

2. The Gold Mine: The mine is the novel's most significant setting. The dangerous, dehumanising work environment — underground, dark, life-threatening — concretises the exploitative nature of the apartheid economic system and drives the plot's central tensions around labour and race.

3. Leah's Sheebeen: This illegal drinking house functions as a community gathering space. As a setting it drives subplots, develops character relationships (Xuma and Leah, Xuma and Eliza), and represents the underground economy of Black survival under apartheid.

4. Eliza's room/domestic spaces: The private spaces where Xuma pursues Eliza highlight the psychological dimensions of the plot — Eliza's yearning to be 'white' and Xuma's confused desire. The domestic setting externalises inner emotional and political conflict.

5. The hospital/clinic: When characters are injured or fall ill from mine accidents, the hospital setting underscores the physical toll of exploitation and drives plot developments around mortality, care, and human connection.

6. The streets of Johannesburg: Street scenes establish the racial geography of apartheid — where Black characters can and cannot go — and provide settings for Xuma's growing political consciousness and confrontations with authority.

Award marks for: identification of the setting (1 mark), textual reference (1 mark), analysis of how it develops the plot (1 mark).`,
    marks: 15,
  },
  {
    questionText: "Critically analyse any five (5) major themes in Peter Abrahams' Mine Boy.",
    markingGuide: `Award marks for discussion of at least FIVE of the following themes (3 marks each, up to 15 marks):

1. RACIAL OPPRESSION AND APARTHEID: The novel exposes the systematic racial dehumanisation of Black South Africans under the apartheid system. Analyse how the pass laws, workplace segregation, and social restrictions are depicted through Xuma's experiences.

2. EXPLOITATION OF BLACK LABOUR: The gold mine epitomises the economic exploitation of Black workers — dangerous conditions, low wages, and dispensable humanity. Connect to the broader critique of capitalism and colonial economics.

3. IDENTITY AND BELONGING: Xuma's journey from rural newcomer to urban worker explores the crisis of identity faced by Africans displaced by industrialisation. His conflict between traditional African identity and modern urban life is central.

4. LOVE AND HUMAN CONNECTION: The triangular relationship between Xuma, Eliza (who wants to be 'white'), and Maisy (who embraces her Blackness) explores love as both personal emotion and political statement about racial self-acceptance.

5. POLITICAL CONSCIOUSNESS AND RESISTANCE: Xuma's gradual awakening to the injustice of the system — culminating in his solidarity with striking workers — traces the development of political consciousness as a theme.

6. COMMUNITY AND SURVIVAL: Leah's sheebeen and the bonds formed among the township community show how collective solidarity becomes a survival strategy against systemic oppression.

7. URBANISATION AND DISPLACEMENT: The rural-to-urban migration and its disorienting effects on African identity, community, and culture.

Award marks for: theme identification (1 mark), textual evidence/examples (1 mark), critical analysis of significance (1 mark).`,
    marks: 15,
  },
  {
    questionText: "Identify and critically analyse any five (5) elements which make Daniel Defoe's Robinson Crusoe a typical adventure novel.",
    markingGuide: `Award marks for discussion of at least FIVE of the following elements (3 marks each, up to 15 marks):

1. THE PROTAGONIST AS ADVENTURER: Crusoe is the quintessential adventure hero — a man of action, courage, and resourcefulness who deliberately seeks adventure beyond the safe bounds of society. Analyse his repeated compulsion to go to sea despite disasters.

2. EXOTIC AND DANGEROUS SETTINGS: The uninhabited tropical island, the hostile seas, and encounters with cannibals provide the exotic, threatening settings essential to adventure fiction. The unknown and the dangerous are hallmarks of the genre.

3. SURVIVAL AGAINST THE ODDS: Crusoe's 28-year survival on the island through ingenuity, hard work, and resilience is the central adventure narrative. Each challenge overcome (building shelter, farming, making pottery) constitutes an adventure episode.

4. CONFLICT AND DANGER: Encounters with cannibals, the fear of discovery, the rescue of Friday from sacrificial death — these moments of physical danger and moral conflict are core elements of adventure narrative.

5. ISOLATION AND SELF-RELIANCE: The adventure novel often places its hero in situations where he must rely entirely on himself. Crusoe's solitary existence on the island and his systematic rebuilding of 'civilisation' embody this self-reliance theme.

6. JOURNEY AND QUEST STRUCTURE: The novel is structured around Crusoe's voyages, shipwreck, island survival, and eventual rescue — a classic journey-and-return structure fundamental to adventure fiction.

7. THE COMPANIONSHIP OF FRIDAY: Friday's introduction provides the adventure element of human connection, rescue, and the testing of cross-cultural relationships in extreme circumstances.

8. COLONIALISM AND MASTERY: Crusoe's 'mastery' of the island and of Friday reflects the adventure novel's typical ideology of European dominance and the conquest of nature and other peoples.

Award marks for: element identification (1 mark), textual illustration (1 mark), critical analysis of how it fits the adventure genre (1 mark).`,
    marks: 15,
  },
  {
    questionText: "Focusing on five different elements of the novel, discuss the extent to which you would regard Daniel Defoe's Robinson Crusoe as a difficult novel to classify, in terms of genre.",
    markingGuide: `Award marks for discussion of at least FIVE genre elements/classifications (3 marks each, up to 15 marks). Strong answers will argue for the novel's genre complexity rather than simply listing genres.

1. AS AN ADVENTURE NOVEL: Crusoe's sea voyages, shipwreck, island survival, and encounters with cannibals conform to adventure fiction. Yet the novel lacks sustained physical conflict and is more meditative than action-driven — complicating a simple adventure classification.

2. AS A SPIRITUAL AUTOBIOGRAPHY/RELIGIOUS NOVEL: Crusoe's extended reflections on Providence, his conversion experience, his reading of the Bible, and his spiritual transformation give the novel the character of a Puritan spiritual autobiography — a genre entirely distinct from adventure fiction.

3. AS A REALIST NOVEL: Defoe's meticulous, journal-like detail about how Crusoe builds tools, counts his provisions, and organises his time gives it the character of early realist fiction. It is often cited as one of the first English realist novels.

4. AS A COLONIAL/IMPERIALIST TEXT: The novel's treatment of Crusoe's 'ownership' of the island, his relationship with Friday (whom he names and masters), and his establishment of a colonial 'plantation' read as a colonial allegory — a political text about empire.

5. AS A UTOPIAN/DYSTOPIAN TEXT: The island functions as a kind of utopian space where Crusoe can recreate society from scratch according to his own values — suggesting utopian fiction elements.

6. AS A BILDUNGSROMAN: Crusoe's psychological and spiritual growth from reckless youth to mature, God-fearing man follows the developmental arc of the Bildungsroman.

7. AS A TRAVEL NARRATIVE: The detailed, factual style mimics the popular travel narratives and explorer accounts of Defoe's era.

Strong answers should argue: the novel's richness lies precisely in this generic multiplicity, and its difficulty of classification reflects Defoe writing at a moment before rigid genre boundaries were established in English fiction.

Award marks for: genre identified (1 mark), evidence from text (1 mark), analysis of how the element complicates classification (1 mark).`,
    marks: 15,
  },
];

// ── Seed function ─────────────────────────────────────────────────────────────
async function seed() {
  const client = await pool.connect();
  try {
    console.log(`\nSeeding Literature in English — 2024 First In-Course Exam (Paper ${PAPER})\n`);

    let insertedMcq = 0, skippedMcq = 0;
    for (const q of mcq) {
      const exists = await client.query(
        "SELECT id FROM questions WHERE subject_id=$1 AND paper=$2 AND year=$3 AND question_text=$4",
        [SUBJECT_ID, PAPER, YEAR, q.questionText]
      );
      if (exists.rows.length > 0) { skippedMcq++; continue; }

      await client.query(
        `INSERT INTO questions
           (subject_id, paper, year, question_type, question_text, options, correct_option, explanation, marks)
         VALUES ($1,$2,$3,'objective',$4,$5,$6,$7,1)`,
        [SUBJECT_ID, PAPER, YEAR, q.questionText, JSON.stringify(q.options), q.correctOption, q.explanation]
      );
      insertedMcq++;
    }
    console.log(`MCQ: ${insertedMcq} inserted, ${skippedMcq} skipped.`);

    let insertedTheory = 0, skippedTheory = 0;
    for (const q of theory) {
      const exists = await client.query(
        "SELECT id FROM questions WHERE subject_id=$1 AND paper=$2 AND year=$3 AND question_text=$4",
        [SUBJECT_ID, PAPER, YEAR, q.questionText]
      );
      if (exists.rows.length > 0) { skippedTheory++; continue; }

      await client.query(
        `INSERT INTO questions
           (subject_id, paper, year, question_type, question_text, marking_guide, marks)
         VALUES ($1,$2,$3,'theory',$4,$5,$6)`,
        [SUBJECT_ID, PAPER, YEAR, q.questionText, q.markingGuide, q.marks]
      );
      insertedTheory++;
    }
    console.log(`Theory: ${insertedTheory} inserted, ${skippedTheory} skipped.`);

    console.log("\nDone.\n");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => { console.error(err); process.exit(1); });
