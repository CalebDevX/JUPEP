/**
 * Seed: Literature in English — 2024/2025 JUPEB Final Examination (Option B)
 * Subject ID: 5  |  examType: jupeb  |  paper: jupeb  |  Year: 2024
 * UNILAG School of Foundation Studies
 *
 * Run:  NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/seed-lit-2024-jupeb.mjs
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

const SUBJECT_ID = 5;
const EXAM_TYPE  = "jupeb";
const PAPER      = "jupeb";
const YEAR       = 2024;

// ── Section A: Objective Questions ────────────────────────────────────────────

const mcq = [
  // Q1 — Othello excerpt (Iago as "honest creature")
  {
    questionNumber: 1,
    questionText: 'Othello\'s portrayal of Iago as "honest creature" exemplifies the use of',
    options: [
      "A. dramatic irony.",
      "B. verbal irony.",
      "C. situational irony.",
      "D. Socratic irony.",
    ],
    correctOption: "A",
    explanation:
      "Dramatic irony occurs when the audience knows something the character does not. Here Othello calls Iago 'honest' while the audience already knows Iago is deeply treacherous, creating dramatic irony. Verbal irony (sarcasm) would require Othello to know Iago is dishonest; situational irony refers to outcomes contrary to expectations.",
  },
  // Q2
  {
    questionNumber: 2,
    questionText: '"Why did I marry?" exemplifies the use of',
    options: [
      "A. metaphor.",
      "B. irony.",
      "C. paradox.",
      "D. rhetorical question.",
    ],
    correctOption: "D",
    explanation:
      "A rhetorical question is asked for effect rather than to elicit an answer. Othello asks 'Why did I marry?' not expecting a response but expressing anguish and self-doubt, making it a classic rhetorical question.",
  },
  // Q3
  {
    questionNumber: 3,
    questionText: "The following are figures of sound EXCEPT",
    options: [
      "A. pun.",
      "B. parallelism.",
      "C. consonance.",
      "D. assonance.",
    ],
    correctOption: "A",
    explanation:
      "Figures of sound (or phonetic devices) include assonance (repetition of vowel sounds), consonance (repetition of consonant sounds), alliteration, and onomatopoeia. A pun is a figure of speech based on word-play and multiple meanings — it appeals to intellect, not sound. Parallelism is a structural rhetorical device; however, pun is the most clearly non-phonetic choice.",
  },
  // Q4
  {
    questionNumber: 4,
    questionText: "An inscription on the tomb of a dead person is called?",
    options: [
      "A. Eulogy.",
      "B. Epitaph.",
      "C. Salutation.",
      "D. Reference.",
    ],
    correctOption: "B",
    explanation:
      "An epitaph is a short text inscribed on a gravestone or tomb honouring the deceased. A eulogy is a speech of praise delivered at a funeral, not an inscription.",
  },
  // Q5
  {
    questionNumber: 5,
    questionText: "'She went into the freezing fire' indicates the use of",
    options: [
      "A. irony.",
      "B. oxymoron.",
      "C. paradox.",
      "D. simile.",
    ],
    correctOption: "B",
    explanation:
      "'Freezing fire' places two contradictory words ('freezing' and 'fire') side by side to create a striking effect — the definition of an oxymoron. A paradox is a seemingly contradictory statement that may be true; an oxymoron is the word-level contradiction of the two adjective/noun combination here.",
  },
  // Q6
  {
    questionNumber: 6,
    questionText: "Medieval English poetry was predominantly a/an",
    options: [
      "A. product of Christian religion and doctrine.",
      "B. period of rebirth of culture.",
      "C. era of intellectual explorations.",
      "D. product of pagan society.",
    ],
    correctOption: "A",
    explanation:
      "Medieval English literature (c. 450–1485) was heavily shaped by Christian theology and church doctrine. Works like Beowulf, The Canterbury Tales, and Piers Plowman reflect Christian morality. The 'rebirth of culture' describes the Renaissance; 'intellectual explorations' characterises the Enlightenment.",
  },
  // Q7
  {
    questionNumber: 7,
    questionText: "In appreciating poetry and prose, identify the group that represents direct analysis of texts.",
    options: [
      "A. Content and imagery.",
      "B. Symbols and imageries.",
      "C. Content and structure.",
      "D. Imagery and techniques.",
    ],
    correctOption: "C",
    explanation:
      "Direct text analysis focuses on WHAT the text says (content) and HOW it is organised (structure). These two elements form the backbone of practical criticism. Imagery, symbols, and techniques are sub-elements that support content and structure analysis.",
  },
  // Q8
  {
    questionNumber: 8,
    questionText: "The first step in analyzing an unseen passage is",
    options: [
      "A. analysing it based on your residual knowledge.",
      "B. reading it at least two times.",
      "C. concentrating on the imagery.",
      "D. using a known analogy to analyse the question.",
    ],
    correctOption: "B",
    explanation:
      "Before any analysis, the reader must fully comprehend the passage. Reading the text at least twice ensures one grasps its literal meaning, tone, and nuances before attempting critical commentary.",
  },
  // Q9 — Vanburgh "The Provoked Wife" excerpt
  {
    questionNumber: 9,
    questionText: "What poetic structure is the above excerpt from John Vanburgh's 'The Provoked Wife'? (It's the intent and business of the stage...)",
    options: [
      "A. Sonnet.",
      "B. Couplet.",
      "C. Quatrain.",
      "D. Stanza.",
    ],
    correctOption: "C",
    explanation:
      "The excerpt contains exactly four lines — making it a quatrain. A couplet has only two lines; a sonnet has fourteen lines. 'Stanza' is a general structural unit, not a specific form, so 'quatrain' is the precise answer.",
  },
  // Q10
  {
    questionNumber: 10,
    questionText: "The rhyming scheme of the Vanburgh excerpt ('It's the intent and business of the stage...') is",
    options: [
      "A. abab.",
      "B. aacc.",
      "C. abcb.",
      "D. aabb.",
    ],
    correctOption: "D",
    explanation:
      "Line 1 ends 'stage', line 2 ends 'age' (AA); line 3 ends 'glass', line 4 ends 'ass' (BB). The pattern is therefore AABB.",
  },
  // Q11
  {
    questionNumber: 11,
    questionText: "The rhyming scheme in the Vanburgh excerpt above follows the structure of",
    options: [
      "A. quatrain.",
      "B. sonnet.",
      "C. couplet.",
      "D. onomatopoeia.",
    ],
    correctOption: "C",
    explanation:
      "An AABB rhyme scheme means consecutive pairs of lines rhyme — this is the structure of rhyming couplets. The excerpt is written in heroic (rhyming) couplets arranged in a four-line block.",
  },
  // Q12
  {
    questionNumber: 12,
    questionText: "Characterization in a novel means the",
    options: [
      "A. expression of conflict between characters.",
      "B. mode of presentation of the fictional individuals.",
      "C. minor and major characters in the work.",
      "D. peculiar mannerisms of the narrator.",
    ],
    correctOption: "B",
    explanation:
      "Characterization is the literary technique by which an author creates, develops, and presents the personalities of fictional individuals — through direct description, dialogue, action, or the reactions of other characters.",
  },
  // Q13
  {
    questionNumber: 13,
    questionText: "The distinguishing feature of the short story is its",
    options: [
      "A. compact plot.",
      "B. narrative form.",
      "C. prosaic conception.",
      "D. climatic stage.",
    ],
    correctOption: "A",
    explanation:
      "The short story is distinguished from the novel chiefly by its compact, tight plot — it typically focuses on a single incident, a limited cast, and a brief time span. Narrative form and prosaic conception apply to prose fiction generally.",
  },
  // Q14
  {
    questionNumber: 14,
    questionText: "A literary composition in three parts is a",
    options: [
      "A. trilogy.",
      "B. trio.",
      "C. trialogue.",
      "D. colloquy.",
    ],
    correctOption: "A",
    explanation:
      "A trilogy is a set of three related works (novels, films, plays). Examples include Shakespeare's Henry VI Parts 1–3 and Achebe's African Trilogy. 'Trio' refers to three performers; 'colloquy' means a formal conversation.",
  },
  // Q15 — Housman "To an Athlete Dying Young"
  {
    questionNumber: 15,
    questionText: "The imagery in stanza 1 of Housman's 'To an Athlete Dying Young' indicates",
    options: [
      "A. elation.",
      "B. emotion.",
      "C. acclamation.",
      "D. probation.",
    ],
    correctOption: "C",
    explanation:
      "Stanza 1 describes the crowd cheering the athlete through the marketplace after winning a race — 'Man and boy stood cheering by.' This image of public praise and celebration is best described as acclamation (enthusiastic public approval/applause). Elation is a feeling; acclamation is the public act depicted.",
  },
  // Q16
  {
    questionNumber: 16,
    questionText: "The second stanza of 'To an Athlete Dying Young' suggests",
    options: [
      "A. house launching.",
      "B. burial.",
      "C. celebration.",
      "D. award.",
    ],
    correctOption: "B",
    explanation:
      "Stanza 2 mirrors the victory procession of stanza 1 but now the athlete is being carried 'shoulder-high' to 'a stiller town' — a euphemism for the grave/cemetery. The parallel structure deliberately links triumphant parade with funeral cortège, so the imagery suggests burial.",
  },
  // Q17
  {
    questionNumber: 17,
    questionText: "Form and content criticism is",
    options: [
      "A. pragmatic.",
      "B. textual.",
      "C. expressive.",
      "D. reader-response.",
    ],
    correctOption: "B",
    explanation:
      "Textual (or formal) criticism analyses what is inside the text — its structure (form) and its meanings (content) — independent of the author's biography or the reader's response. This intrinsic approach is often associated with New Criticism.",
  },
  // Q18
  {
    questionNumber: 18,
    questionText: "The villain usually causes",
    options: [
      "A. laughter to the antagonist.",
      "B. conflict to the protagonist.",
      "C. crisis to the antagonist.",
      "D. relief to the protagonist.",
    ],
    correctOption: "B",
    explanation:
      "A villain (a type of antagonist) is the character who actively works against the hero (protagonist), generating the central conflict of the narrative. The villain's actions drive the plot by creating obstacles and crises for the protagonist.",
  },
  // Q19
  {
    questionNumber: 19,
    questionText: "Chorus, in the Greek tragedies, performed the singular role of a",
    options: [
      "A. translator.",
      "B. commentator.",
      "C. director.",
      "D. coordinator.",
    ],
    correctOption: "B",
    explanation:
      "In ancient Greek drama the Chorus was a group that sang, danced, and narrated between scenes, offering commentary on the action, the characters' morality, and the will of the gods. They function as a collective commentator and moral voice.",
  },
  // Q20
  {
    questionNumber: 20,
    questionText: "The reversal of fortune or peripetia in Greek tragedy often depends on",
    options: [
      "A. hubris.",
      "B. catharsis.",
      "C. hamartia.",
      "D. anagnorisis.",
    ],
    correctOption: "C",
    explanation:
      "Peripetia (reversal of fortune) is triggered by hamartia — the tragic hero's fatal flaw or error of judgment. It is the hero's own flaw that sets in motion the chain of events leading to the reversal. Catharsis is the audience's emotional purging; anagnorisis is the moment of recognition.",
  },
  // Q21
  {
    questionNumber: 21,
    questionText: "The art by which a lone character utters his or her thoughts out loud is a/an",
    options: [
      "A. aside.",
      "B. soliloquy.",
      "C. monologue.",
      "D. dialogue.",
    ],
    correctOption: "B",
    explanation:
      "A soliloquy is a dramatic device in which a character speaks their inner thoughts aloud while alone on stage, giving the audience direct access to the character's mind. An aside is a brief remark addressed to the audience while other characters are present; a monologue is a long speech by one character but not necessarily alone.",
  },
  // Q22
  {
    questionNumber: 22,
    questionText: "What differentiates bathos from pathos?",
    options: [
      "A. Bathos is climax, pathos is anticlimax.",
      "B. Pathos is sympathy, bathos is pity.",
      "C. Pathos is pity, bathos is sympathy.",
      "D. Bathos is anticlimax, pathos is pity.",
    ],
    correctOption: "D",
    explanation:
      "Pathos is the quality in literature that evokes pity, compassion, or sorrow in the reader. Bathos is an abrupt, jarring descent from the elevated to the trivial or ridiculous — an anticlimactic drop. Hence bathos = anticlimax; pathos = pity/compassion.",
  },
  // Q23
  {
    questionNumber: 23,
    questionText: "Blank verse is",
    options: [
      "A. unrhymed.",
      "B. unrhythmic.",
      "C. unmetrical.",
      "D. unstressed.",
    ],
    correctOption: "A",
    explanation:
      "Blank verse is unrhymed iambic pentameter — it has a strict rhythmic/metrical pattern (ten syllables, alternating unstressed/stressed) but lacks end rhyme. Shakespeare's plays and Milton's Paradise Lost are written in blank verse.",
  },
  // Q24
  {
    questionNumber: 24,
    questionText: "A literary description that appeals to the five human senses is",
    options: [
      "A. symbolism.",
      "B. imagery.",
      "C. motif.",
      "D. epigram.",
    ],
    correctOption: "B",
    explanation:
      "Imagery is the use of vivid, descriptive language to appeal to one or more of the five senses (sight, sound, smell, taste, touch), creating mental pictures and sensory experiences for the reader.",
  },
  // Q25
  {
    questionNumber: 25,
    questionText: "The type of poetry composed and transmitted by means of recitation is said to be",
    options: [
      "A. aural.",
      "B. rural.",
      "C. oral.",
      "D. pastoral.",
    ],
    correctOption: "C",
    explanation:
      "Oral poetry (also called oral tradition or oral literature) is composed, performed, and transmitted verbally from one generation to the next without a written medium. Epic poems like Homer's Iliad originated as oral compositions.",
  },
  // Q26
  {
    questionNumber: 26,
    questionText: "Identify the major playwright from the following options.",
    options: [
      "A. Chinua Achebe.",
      "B. Wole Soyinka.",
      "C. Ngozi Adichie.",
      "D. Helon Habila.",
    ],
    correctOption: "B",
    explanation:
      "Wole Soyinka is Nigeria's foremost playwright and the first African to win the Nobel Prize for Literature (1986). His major plays include Death and the King's Horseman, The Lion and the Jewel, and A Dance of the Forests. Achebe and Adichie are primarily novelists; Habila is a novelist.",
  },
  // Q27
  {
    questionNumber: 27,
    questionText: "Temporal setting situates a work of art within a",
    options: [
      "A. location.",
      "B. time.",
      "C. locale.",
      "D. space.",
    ],
    correctOption: "B",
    explanation:
      "Temporal setting refers to the time in which the action of a literary work takes place — the historical era, season, time of day, or period. Location and locale refer to spatial/geographical setting.",
  },
  // Q28
  {
    questionNumber: 28,
    questionText: "An interruption of a chronological narrative to relate an event that has already occurred is the function of",
    options: [
      "A. foreshadowing.",
      "B. in media res.",
      "C. flashback.",
      "D. surprise.",
    ],
    correctOption: "C",
    explanation:
      "A flashback (analepsis) interrupts the forward movement of a narrative to return to an earlier event, providing context or backstory. Foreshadowing hints at future events; in media res starts a story in the middle of the action.",
  },
  // Q29
  {
    questionNumber: 29,
    questionText: "The inner working of a character's mind is portrayed through",
    options: [
      "A. transferred epithet.",
      "B. poetic justice.",
      "C. pathetic fallacy.",
      "D. stream of consciousness.",
    ],
    correctOption: "D",
    explanation:
      "Stream of consciousness is a narrative technique that presents the continuous, often fragmented flow of a character's thoughts, feelings, and perceptions. It was mastered by writers like James Joyce (Ulysses) and Virginia Woolf (Mrs Dalloway).",
  },
  // Q30
  {
    questionNumber: 30,
    questionText: "An elaborate classical form in which one shepherd-singer laments the death of another is called",
    options: [
      "A. pastoral elegy.",
      "B. pastoral romance.",
      "C. ballad.",
      "D. epic.",
    ],
    correctOption: "A",
    explanation:
      "A pastoral elegy is a poem in which a shepherd mourns the death of a fellow shepherd, set in an idealised rural world. Milton's Lycidas and Shelley's Adonaïs are famous examples. It combines pastoral convention with elegiac grief.",
  },
  // Q31
  {
    questionNumber: 31,
    questionText: "'Falsely true' is an example of",
    options: [
      "A. paradox.",
      "B. metaphor.",
      "C. oxymoron.",
      "D. personification.",
    ],
    correctOption: "C",
    explanation:
      "'Falsely true' places two contradictory words ('falsely' and 'true') directly side by side — this is an oxymoron. A paradox is a full statement or situation that seems contradictory but may reveal a truth; an oxymoron operates at the word or phrase level.",
  },
  // Q32
  {
    questionNumber: 32,
    questionText: "The poem that celebrates historical events, the heroic achievements, the mores and the civilizations of a race is known as",
    options: [
      "A. ballad.",
      "B. epic.",
      "C. metaphysical poetry.",
      "D. sonnets.",
    ],
    correctOption: "B",
    explanation:
      "An epic is a long narrative poem that glorifies a hero's extraordinary feats, celebrates national/cultural identity, and reflects the values and civilization of a people. Examples include Homer's Iliad, Virgil's Aeneid, and Beowulf.",
  },
  // Q33 — Othello Act I Scene I excerpt (black ram / white ewe)
  {
    questionNumber: 33,
    questionText: '"old black ram" and "white ewe" in Iago\'s speech (Othello Act I Scene I) refer to',
    options: [
      "A. Iago and Emilia.",
      "B. Othello and Desdemona.",
      "C. Cassio and Bianca.",
      "D. Brabantio and Desdemona.",
    ],
    correctOption: "B",
    explanation:
      "Iago uses 'old black ram' as a racial metaphor for the dark-skinned Othello, and 'white ewe' for the fair Desdemona, to shock and inflame Brabantio about their elopement. The animal imagery is deliberately crude and dehumanising.",
  },
  // Q34
  {
    questionNumber: 34,
    questionText: 'Who is the speaker of "Zounds, sir! You are robb\'d..." (Othello Act I Scene I)?',
    options: [
      "A. Cassio.",
      "B. Roderigo.",
      "C. Brabantio.",
      "D. Iago.",
    ],
    correctOption: "D",
    explanation:
      "This speech is delivered by Iago, who — along with Roderigo — stands beneath Brabantio's window to wake him and enflame him with news of Desdemona's elopement. The crude, manipulative language ('old black ram', 'tupping') is characteristic of Iago.",
  },
  // Q35
  {
    questionNumber: 35,
    questionText: "The speaker in this Othello excerpt ('Zounds, sir! You are robb'd...') is",
    options: [
      "A. Othello.",
      "B. Emilia.",
      "C. Desdemona.",
      "D. Iago.",
    ],
    correctOption: "D",
    explanation:
      "The speaker is Iago. The speech is in Act I Scene I, where Iago and Roderigo are outside Brabantio's house. Iago uses inflammatory, racist language to provoke Brabantio against Othello.",
  },
  // Q36
  {
    questionNumber: 36,
    questionText: "The speaker (Iago) in this excerpt is associated with / accompanied by",
    options: [
      "A. Iago.",
      "B. Roderigo.",
      "C. Emilia.",
      "D. Othello.",
    ],
    correctOption: "B",
    explanation:
      "In Act I Scene I, Iago and Roderigo go together to Brabantio's house to rouse him. Roderigo is Iago's dupe and companion in this scene. Iago directs the scene while Roderigo participates — they are discussing the situation together as they address Brabantio.",
  },
  // Q37 — Othello Act III Scene 3 (handkerchief scene)
  {
    questionNumber: 37,
    questionText: "The whole excerpt (Speaker A: 'A good wench: give it me...' — Othello Act III Scene 3) exemplifies the use of",
    options: [
      "A. anecdote.",
      "B. short story.",
      "C. allegory.",
      "D. proverb.",
    ],
    correctOption: "C",
    explanation:
      "The exchange over Desdemona's handkerchief is allegorical — the handkerchief represents marital fidelity and trust. Its theft and misuse symbolically enacts the destruction of Othello and Desdemona's marriage. The whole scene works on a literal (dialogue about a cloth) and symbolic (allegory of betrayal) level.",
  },
  // Q38
  {
    questionNumber: 38,
    questionText: "Speaker A in the handkerchief exchange (Othello Act III Scene 3) — 'A good wench: give it me' — is",
    options: [
      "A. Bianca.",
      "B. Iago.",
      "C. Emilia.",
      "D. Cassio.",
    ],
    correctOption: "B",
    explanation:
      "Speaker A is Iago. He pressures Emilia to hand over Desdemona's handkerchief. His dismissive 'Why, what's that to you?' is characteristic of Iago's manipulative and callous treatment of Emilia.",
  },
  // Q39
  {
    questionNumber: 39,
    questionText: "Speaker B in the handkerchief exchange ('If it be not for some purpose of import, Give 't me again') is",
    options: [
      "A. Cassio.",
      "B. Desdemona.",
      "C. Othello.",
      "D. Emilia.",
    ],
    correctOption: "D",
    explanation:
      "Speaker B is Emilia. She has found and taken Desdemona's handkerchief but feels uneasy about giving it to Iago. Her line 'If it be not for some purpose of import, Give 't me again' shows her moral hesitation, though she ultimately submits to Iago's will.",
  },
  // Q48
  {
    questionNumber: 48,
    questionText: "Conceit is an extension of",
    options: [
      "A. simile.",
      "B. paradox.",
      "C. personification.",
      "D. metaphor.",
    ],
    correctOption: "D",
    explanation:
      "A conceit is an elaborate, extended metaphor that draws an unexpected comparison between two very different things. The metaphysical conceits of John Donne (e.g., comparing two lovers' souls to a compass in 'A Valediction: Forbidding Mourning') are sustained throughout an entire poem.",
  },
  // Q49
  {
    questionNumber: 49,
    questionText: "Two major Elizabethan dramatists are:",
    options: [
      "A. John Lilly and John Dryden.",
      "B. Oliver Goldsmith and Oliver Cromwell.",
      "C. Christopher Marlowe and William Shakespeare.",
      "D. Arthur Miller and John O'Casey.",
    ],
    correctOption: "C",
    explanation:
      "The Elizabethan era (1558–1603) produced Christopher Marlowe (Doctor Faustus, Tamburlaine) and William Shakespeare (Hamlet, Othello, Macbeth). John Dryden is Restoration-era; Goldsmith is 18th-century; Miller and O'Casey are 20th-century playwrights.",
  },
  // Q50
  {
    questionNumber: 50,
    questionText: "A short story that teaches a moral lesson is",
    options: [
      "A. proverb.",
      "B. epigram.",
      "C. parable.",
      "D. anecdote.",
    ],
    correctOption: "C",
    explanation:
      "A parable is a short, simple narrative that illustrates a moral or spiritual lesson. The parables of Jesus (the Prodigal Son, the Good Samaritan) are the most famous examples. An anecdote is a brief personal story; a proverb is a pithy saying; an epigram is a witty pointed remark.",
  },
];

// ── Section B: Theory / Essay Questions ───────────────────────────────────────

const theory = [
  // LIT 001 — Introduction to Drama
  {
    questionNumber: 1,
    paper: "001",
    course: "LIT 001",
    questionText:
      "Discuss Aristophanes' Lysistrata as a satire showing how conflicts are settled in a comical but objective pattern. (15 Marks)",
    markingGuide: `INTRODUCTION (2 marks): Identify Lysistrata as an Old Comedy by Aristophanes (411 BC), noting its satirical treatment of the Peloponnesian War. Define satire as a literary mode using humour, irony, and exaggeration to critique society.

BODY — Key points (up to 10 marks, 2 marks each):
1. PREMISE AS SATIRE: The premise — women withholding sex to end war — satirises male pride and the absurdity of prolonged conflict. The solution to war lies not in statesmanship but in domestic/erotic pressure.
2. COMIC INVERSION: Women occupy the Acropolis (male political space) and control the treasury. This gender inversion satirises male monopoly of power and the supposed logic of war.
3. OBJECTIVITY OF RESOLUTION: The settlement is not ideologically one-sided — neither Athens nor Sparta is morally superior. The satire targets WAR ITSELF as irrational.
4. CHARACTERISATION FOR SATIRE: Male characters (especially the Magistrate) are pompous, ridiculous, and swayed by physical desire. Their weakness is a satirical comment on masculine authority.
5. LYSISTRATA'S REASONING: Her speech to the Magistrate (comparing the state to a tangled skein of wool) uses domestic metaphor to mock male governance, showing that women's practical wisdom surpasses male rhetoric.
6. THE RECONCILIATION SCENE: The nude personification of Reconciliation seduces both sides into peace — a comic but pointed statement that carnal desire is a more honest motivator than honour or ideology.

CONCLUSION (3 marks): Assess how the comedy serves the satire — laughter makes the anti-war message palatable and universal. Note Aristophanes' genius in making the settlement objective: the play blames neither side but blames war as a human folly.

TOTAL: 15 marks`,
  },
  {
    questionNumber: 2,
    paper: "001",
    course: "LIT 001",
    questionText:
      "Discuss the failure of the democratic system as a cause of social problems in Afolayan's Once Upon an Elephant. (15 Marks)",
    markingGuide: `INTRODUCTION (2 marks): Introduce Kunle Afolayan's Once Upon an Elephant as a socio-political film/dramatic text exploring Nigerian governance. Define the democratic system as one that should guarantee representation, accountability, and social justice.

BODY — Key points (up to 10 marks):
1. CORRUPTION OF ELECTORAL PROCESS: Elections are rigged; votes are bought. This foundational failure invalidates democratic legitimacy and produces leaders who serve themselves, not the people.
2. ELITE CAPTURE: The democratic apparatus is captured by a privileged few, excluding the poor and marginalised from meaningful participation.
3. SOCIAL INEQUALITY: Failed democracy widens the gap between the wealthy political class and the ordinary masses, causing poverty, crime, and social unrest.
4. LACK OF ACCOUNTABILITY: Politicians face no consequences for misappropriating public funds, creating impunity that perpetuates systemic failure.
5. TRIBAL/ETHNIC POLITICS: Democracy is undermined by ethnic loyalties rather than merit, fuelling communal tensions and poor governance.
6. IMPACT ON ORDINARY PEOPLE: Characters in the narrative suffer unemployment, insecurity, and loss of faith in institutions — direct social costs of democratic failure.

CONCLUSION (3 marks): Synthesise — Afolayan uses the text to show that the democratic form without democratic substance (free elections, rule of law, civic culture) produces worse outcomes than the social problems it was meant to solve. Call for genuine democratic culture.

TOTAL: 15 marks`,
  },

  // LIT 002 — Introduction to Prose Fiction
  {
    questionNumber: 3,
    paper: "002",
    course: "LIT 002",
    questionText:
      "State and explain any THREE themes in Warri Nor Dey Carry Last. (15 Marks)",
    markingGuide: `INTRODUCTION (2 marks): Introduce the novel briefly — author, setting (Warri, Delta State), genre (comic/satirical prose fiction). Note that the novel is rich in socio-cultural themes rooted in Niger Delta life.

BODY — Three themes, 4 marks each (state theme 1 mark + explain with textual evidence 3 marks):

THEME 1 — RESILIENCE AND SURVIVAL (4 marks): The people of Warri are portrayed as resourceful survivors despite economic hardship and government neglect. The 'Warri nor dey carry last' (Warri never comes last) motto encapsulates their indomitable spirit. Characters hustle, improvise, and find humour in adversity.

THEME 2 — SOCIAL CRITIQUE / POLITICAL SATIRE (4 marks): The novel satirises Nigerian governance, corruption, and the failure of the state to develop the oil-rich Delta region. The contrast between the wealth of the region and the poverty of its people is a sustained critique.

THEME 3 — IDENTITY AND CULTURAL PRIDE (4 marks): The novel affirms Warri's unique multi-ethnic, Pidgin-speaking, street-smart identity. Characters take pride in being from Warri — their language, humour, and worldview are celebrated as distinct and worthy.

(Other valid themes: community/solidarity; gender dynamics; education and aspiration)

CONCLUSION (1 mark): Briefly show how the themes interconnect to form a cohesive portrait of Niger Delta society.

TOTAL: 15 marks`,
  },
  {
    questionNumber: 4,
    paper: "002",
    course: "LIT 002",
    questionText:
      "Discuss Charlotte Brontë's Jane Eyre as a gothic novel. (15 Marks)",
    markingGuide: `INTRODUCTION (2 marks): Define the Gothic novel (late 18th/19th century genre): dark atmosphere, mysterious settings, psychological terror, the supernatural, the sublime, and repressed passions. Introduce Jane Eyre (1847) as a hybrid — Gothic elements within a realist Bildungsroman.

BODY — Key Gothic features with textual evidence (up to 10 marks):

1. DARK SETTING — THORNFIELD HALL (2 marks): The brooding, labyrinthine mansion with its locked rooms and secret attic is a classic Gothic castle. Its description evokes isolation, mystery, and hidden danger.

2. THE SECRET / HIDDEN TRUTH (2 marks): Bertha Mason, the 'madwoman in the attic,' is the dark secret that underlies Rochester's tormented existence. The concealment of a terrible truth is a defining Gothic trope.

3. THE SUPERNATURAL / UNCANNY (2 marks): Jane hears mysterious laughter, witnesses a fire, and crucially 'hears' Rochester's voice calling across miles — an uncanny, quasi-supernatural experience that defies rational explanation.

4. PSYCHOLOGICAL TERROR (2 marks): The Red Room episode traumatises Jane as a child, blurring the boundary between psychological anguish and supernatural experience. The Gothic genre consistently explores the mind as a haunted space.

5. THE BYRONIC HERO (1 mark): Rochester is brooding, darkly passionate, morally compromised — a Byronic figure typical of Gothic fiction.

6. THE SUBLIME LANDSCAPE (1 mark): The moorland settings reflect characters' emotional states and evoke the Gothic aesthetic of nature as overwhelming and threatening.

CONCLUSION (3 marks): Argue that Brontë uses Gothic conventions to explore Victorian anxieties about gender, class, and repression. Jane's ultimate triumph transforms the Gothic from a space of terror to one of liberation.

TOTAL: 15 marks`,
  },

  // LIT 003 — Introduction to Poetry
  {
    questionNumber: 5,
    paper: "003",
    course: "LIT 003",
    questionText:
      'Discuss FIVE ways Oswald Mtshali portrays horror in "Nightfall in Soweto." (15 Marks)',
    markingGuide: `INTRODUCTION (2 marks): Introduce Oswald Mtshali as a South African poet writing under apartheid. "Nightfall in Soweto" depicts the terror that descends on the Black township at night under the apartheid regime.

BODY — Five ways, 2 marks each (technique + explanation + quotation/reference):

1. DARK IMAGERY / SYMBOLISM OF NIGHT: Night is not merely time but a symbol of oppression, fear, and death. 'Nightfall' signals the descent of apartheid violence. The darkness is both literal and metaphorical.

2. PERSONIFICATION OF DANGER: Danger and death are personified as predatory forces that stalk the streets of Soweto, making abstract threat feel physical and immediate.

3. SENSORY IMAGERY: The poem appeals to sound (screams, silence), sight (darkness, blood), and touch (cold) to immerse the reader in the horror of township nights.

4. IRONY AND CONTRAST: The contrast between the beauty/innocence of a neighbourhood by day and its transformation into a space of terror by night creates ironic horror. Life is normal until night — then violence erupts.

5. USE OF SPECIFIC DETAIL: Mtshali uses concrete details (knives, blood, bodies) rather than abstract language to anchor the horror in lived reality, making it undeniable and visceral.

(Other valid points: repetition for dread; imagery of predator/prey; absence of authority/protection)

CONCLUSION (3 marks): Conclude that Mtshali's horror is not gratuitous but political — it is a controlled indictment of apartheid's dehumanisation of Black South Africans.

TOTAL: 15 marks`,
  },
  {
    questionNumber: 6,
    paper: "003",
    course: "LIT 003",
    questionText:
      'Examine the inevitability of death as portrayed in Thomas Gray\'s "Elegy Written in a Country Churchyard." (15 Marks)',
    markingGuide: `INTRODUCTION (2 marks): Introduce Gray's "Elegy" (1751) as a meditation on mortality, set in a rural churchyard at dusk. Define 'inevitability of death' as the poem's central theme — death is the universal equaliser.

BODY — Key aspects (up to 10 marks):

1. THE SETTING AS MEMENTO MORI (2 marks): The churchyard at twilight creates an atmosphere of mortality from the opening. Graves, yew trees, and fading light all remind the speaker — and reader — that death is the destination of all.

2. DEMOCRATIC DEATH (2 marks): Gray insists that death levels all social distinctions. The 'paths of glory lead but to the grave' — kings and peasants share the same end. Lines addressing the powerful (stanzas on ambition and grandeur) reinforce this.

3. THE 'RUDE FOREFATHERS' (2 marks): The humble villagers buried in the churchyard had hopes, talents, and ambitions that death cut short. Their epitaphs argue that greatness is irrelevant — death comes regardless.

4. THE SPEAKER'S OWN MORTALITY (2 marks): The poem turns self-reflexive: the 'Epitaph' at the end imagines the poet himself dead, being described by a future passer-by. The poet cannot escape the theme he meditates on.

5. CONSOLATION WITHIN INEVITABILITY (2 marks): Gray offers not despair but acceptance — the rural dead have lived simply and honestly. The poem suggests that how one lives, not that one dies, is what matters.

CONCLUSION (3 marks): Argue that Gray's genius is to make the inevitability of death not terrifying but contemplative and humane. The Elegy turns the churchyard into a space of philosophical reflection rather than horror.

TOTAL: 15 marks`,
  },

  // LIT 004 — Literary Appreciation (Set 1, Q7)
  {
    questionNumber: 7,
    paper: "004",
    course: "LIT 004 (Set 1)",
    questionText:
      "Use the questions below to show your understanding of the passage that follows (The Oceanic Being / Geoffrey Chaucer): i. General impression. (a) Three examples showing the passage is poetic. ii. Feeling and mood of the speaker. (a) Two figures of speech and comment on their use. iii. Give an example of alliteration. (a) Five points to bear in mind when answering unseen prose. [15 Marks]",
    markingGuide: `i. GENERAL IMPRESSION (2 marks):
The passage is a turbulent, emotionally intense interior monologue delivered at sea. The speaker is overwhelmed by existential dread — the sea, the crew, and the mysterious 'white whale' create an atmosphere of primal fear and spiritual crisis. The prose is dense, biblical, and highly poetic, suggesting a narrator at the edge of sanity.

(a) THREE POETIC QUALITIES (3 marks — 1 each):
- Vivid imagery: 'sparkling sea', 'dark Ahab', 'wolfish garpings' are rich descriptive phrases typical of poetry
- Rhythm and cadence: sentences have a rolling, incantatory rhythm resembling verse ('Foremost through the sparkling sea shoots on the gay, embattled, bantering bow')
- Metaphor and personification: 'drag dark Ahab after it', 'hunted by its wolfish garpings' — the sea and fate are personified as predatory forces

ii. FEELING AND MOOD (2 marks):
The speaker's feeling is terror mixed with fascinated awe — horror at the sea, the crew, and the white whale. The mood is dark, urgent, and sublime. Evidence: 'its horror's out of me!', 'ye grim, phantom futures!'

(a) TWO FIGURES OF SPEECH (2 marks — 1 each):
- Apostrophe: 'Oh, life!' and 'O ye blessed influences!' — the speaker addresses abstract forces directly
- Metaphor: 'wolfish garpings' — the sea's sounds are compared to the growling of wolves, conveying savage danger

iii. ALLITERATION (1 mark):
'drag dark Ahab' — repetition of the /d/ sound
OR 'gay, embattled, bantering bow' — /b/ repetition

(a) FIVE POINTS FOR ANSWERING UNSEEN PROSE (5 marks — 1 each):
1. Read the passage at least twice before attempting any question
2. Identify the subject matter/theme of the passage
3. Note the tone and mood of the writer/speaker
4. Identify and comment on literary/stylistic devices used
5. Support all points with direct quotations from the passage

TOTAL: 15 marks`,
  },
  // LIT 004 — Literary Appreciation (Set 1, Q8)
  {
    questionNumber: 8,
    paper: "004",
    course: "LIT 004 (Set 1)",
    questionText:
      'Read the poem "My worst enemies are gathering strength" (Compatriots by Tanure Ojaide) and answer: i. Discuss how truth and justice are ironically portrayed. (5 marks) ii. Identify and discuss FIVE images in the poem. (10 marks)',
    markingGuide: `i. TRUTH AND JUSTICE — IRONY (5 marks):

IDENTIFY THE IRONY (2 marks): Those who should be guardians of truth and justice — priests, leaders, guardians — are its greatest violators. Ojaide's deepest irony is that 'enemies' are internal: they are the leaders the people trusted.

EVIDENCE FROM POEM (3 marks):
- 'Priests without a creed / See nailed to their shrine-door / Forged tablets of faith' — priests are supposed to represent divine truth, but their faith documents are FORGED. Religion itself is corrupted.
- 'Now they have blunted the sacred sword / How will justice be executed / When the metal is no longer a blade' — the sword of justice is rendered powerless by those who swore to wield it.
- Leaders use 'vicious charms / To live beyond their tenure' — supernatural corruption extends their illegitimate rule.

ii. FIVE IMAGES (10 marks — 2 marks each: identify + discuss):

1. 'Felled irokos on sight' — the iroko is a mighty African tree symbolising strength and tradition. Felling it represents the destruction of cultural pillars and national integrity by the enemies.

2. 'Priests without a creed' — priests are an image of spiritual authority. Without a creed they are hollow, performing ritual with no belief — an image of leadership that has lost its moral foundation.

3. 'Forged tablets of faith' — tablets evoke the Ten Commandments (divine law). The forgery image shows that even sacred law is counterfeited by those in power, making governance fraudulent at its core.

4. 'The sacred sword / no longer a blade' — the blunted sword is an image of impotent justice. A sword that cannot cut cannot execute justice; the image shows institutional collapse.

5. 'The beast escapes communal rage' — the beast (corrupt leader) escapes collective punishment. The image of a dangerous animal evading capture conveys impunity and the failure of social accountability.

TOTAL: 15 marks`,
  },

  // LIT 004 — Literary Appreciation (Set 2, Q7)
  {
    questionNumber: 7,
    paper: "004",
    course: "LIT 004 (Set 2)",
    questionText:
      "Read the passage from Charlotte Brontë's Jane Eyre ('I resisted all the way...') and answer: i. Describe the point of view employed in the narration. ii. Discuss the cause of conflict in the excerpt. iii. Apply objective criticism in discussing the portrayal of events and emotions. [15 Marks]",
    markingGuide: `i. POINT OF VIEW (4 marks):
The narration uses the FIRST-PERSON POINT OF VIEW — 'I resisted', 'I was conscious', 'I felt'. The narrator is Jane Eyre herself, an adult looking back on a childhood experience (retrospective first person). This creates immediacy and intimacy, drawing the reader directly into Jane's inner world. The narrator has full access to her own thoughts and feelings, though limited knowledge of others' inner states. Identify: 'I was a trifle beside myself' — internal access confirms first-person narration.

ii. CAUSE OF CONFLICT (5 marks):
The conflict is MULTI-LAYERED:
- IMMEDIATE CAUSE: Jane struck John Reed (a 'young gentleman'), violating the social code of her position. The servants (Bessie, Miss Abbot) and Mrs Reed react with punishment.
- UNDERLYING CAUSE: Social inequality — Jane is neither servant nor equal ('No; you are less than a servant, for you do nothing for your keep'). Her ambiguous position as a dependent orphan creates structural tension.
- PSYCHOLOGICAL CAUSE: Jane's refusal to accept unjust treatment ('Am I a servant?') drives the confrontation. Her assertion of selfhood challenges the social order that governs Gateshead.
- THEMATIC CAUSE: The scene dramatises the conflict between oppression and the individual will to resist — a core theme of the novel.

iii. OBJECTIVE CRITICISM (6 marks):
Apply formal/textual analysis:
- LANGUAGE: The diction is intense and elevated ('beside myself', 'rebel slave', 'like a mad cat') — the language mirrors Jane's heightened emotional state and the servants' moral condemnation.
- IMAGERY: Jane as 'mad cat' reduces her to an animal, showing how her resistance is pathologised by those in power. This dehumanisation is critiqued through Jane's own calm (yet passionate) self-awareness.
- CHARACTERISATION: Jane is portrayed with moral clarity — her resistance is just, even if socially inappropriate. The servants are shown as instruments of an unjust system.
- STRUCTURAL FUNCTION: The scene establishes Jane's central character trait (refusal to submit to injustice) and the power dynamics she will contest throughout the novel.

TOTAL: 15 marks`,
  },
  // LIT 004 — Literary Appreciation (Set 2, Q8)
  {
    questionNumber: 8,
    paper: "004",
    course: "LIT 004 (Set 2)",
    questionText:
      'Read "Richard Cory" by Edwin Arlington Robinson and answer: (a) Identify and discuss any THREE themes. (b) Mention and explain any THREE poetic devices. [15 Marks]',
    markingGuide: `(a) THREE THEMES (9 marks — 3 marks each):

THEME 1 — DECEPTIVE APPEARANCES / THE GAP BETWEEN PUBLIC IMAGE AND PRIVATE REALITY (3 marks):
Richard Cory appears to have everything — wealth, grace, good looks, social ease. The community envies him. Yet he takes his own life. The poem's entire impact rests on the chasm between his outward perfection and inward despair. Discuss: 'We thought he was everything / To make us wish that we were in his place' — collective delusion.

THEME 2 — WEALTH DOES NOT GUARANTEE HAPPINESS (3 marks):
Cory is 'rich — yes, richer than a king.' His wealth is emphasised. Yet money cannot address his psychological suffering. The poem cautions against equating material prosperity with fulfilment. Discuss the contrast with the poor townspeople — who 'went without meat' but presumably survived.

THEME 3 — SOCIAL ISOLATION / LONELINESS (3 marks):
Despite his social grace ('always human when he talked'), Cory is fundamentally alone. The townspeople observe him from afar ('We people on the pavement'). The distance between Cory and the community suggests that admiration can coexist with profound isolation. His suicide underscores that no one truly knew him.

(b) THREE POETIC DEVICES (6 marks — 2 marks each: name + explain with quotation):

1. IRONY (situational): The most admired man in town shoots himself. The reader expects a story of enviable success; the last line delivers devastating reversal. 'And Richard Cory, one calm summer night, / Went home and put a bullet through his head.'

2. IMAGERY: 'He glittered when he walked' — visual imagery of brilliance and radiance. Cory is described in almost supernatural terms ('imperially slim', 'clean favoured') that set him apart from ordinary humanity. The glittering image makes his fall more shocking.

3. CONTRAST / JUXTAPOSITION: The poem contrasts the townspeople's grinding poverty ('went without meat, and cursed the bread') with Cory's wealth and elegance. It also contrasts the 'calm summer night' (serene setting) with the violent act of suicide — the peaceful context making the horror more acute.

TOTAL: 15 marks`,
  },
];

// ── Insert logic ───────────────────────────────────────────────────────────────

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Remove existing jupeb-paper questions for Lit in English 2024 to allow re-runs
    const del = await client.query(
      `DELETE FROM questions
       WHERE subject_id = $1 AND exam_type = $2 AND paper = $3 AND year = $4`,
      [SUBJECT_ID, EXAM_TYPE, PAPER, YEAR]
    );
    console.log(`Cleared ${del.rowCount} existing jupeb questions for Lit 2024.`);

    // Insert MCQs
    let mcqCount = 0;
    for (const q of mcq) {
      await client.query(
        `INSERT INTO questions
           (subject_id, paper, exam_type, year, question_type,
            question_text, options, correct_option, explanation, marks)
         VALUES ($1,$2,$3,$4,'objective',$5,$6,$7,$8,2)`,
        [
          SUBJECT_ID,
          PAPER,
          EXAM_TYPE,
          YEAR,
          q.questionText,
          JSON.stringify(q.options),
          q.correctOption,
          q.explanation,
        ]
      );
      mcqCount++;
    }
    console.log(`Inserted ${mcqCount} MCQ questions.`);

    // Insert theory questions (paper field from each question)
    let theoryCount = 0;
    for (const q of theory) {
      await client.query(
        `INSERT INTO questions
           (subject_id, paper, exam_type, year, question_type,
            question_text, marking_guide, marks)
         VALUES ($1,$2,$3,$4,'theory',$5,$6,15)`,
        [
          SUBJECT_ID,
          PAPER,    // all theory under 'jupeb' paper umbrella
          EXAM_TYPE,
          YEAR,
          `[${q.course}] ${q.questionText}`,
          q.markingGuide,
        ]
      );
      theoryCount++;
    }
    console.log(`Inserted ${theoryCount} theory questions.`);

    await client.query("COMMIT");
    console.log(`\n✅ Done. ${mcqCount} MCQs + ${theoryCount} theory = ${mcqCount + theoryCount} total.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
