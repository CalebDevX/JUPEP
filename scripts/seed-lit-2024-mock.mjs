/**
 * Seed script: Literature in English — 2024/2025 Mock Examination (Option D)
 * Subject ID: 5  |  examType: mock  |  Year: 2024
 * UNILAG School of Foundation Studies — J126 ART
 *
 * Run:  NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/seed-lit-2024-mock.mjs
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
const EXAM_TYPE  = "mock";
const YEAR       = 2024;

// ── Section A: 40 Objective Questions ────────────────────────────────────────

const mcq = [
  {
    paper: "001",
    questionText: "An ekphrastic poem is a",
    options: [
      "A. poem poorly inspired by the muse.",
      "B. poem inspired by a visual work of art.",
      "C. poem inspired by another poem.",
      "D. poem copied from another poet.",
    ],
    correctOption: "B",
    explanation: "Ekphrasis (from the Greek word for 'description') refers to the literary description or dramatic evocation of a visual art object. An ekphrastic poem is therefore one inspired by and responding to a visual work of art such as a painting, sculpture, or photograph. Keats' 'Ode on a Grecian Urn' is a classic example.",
  },
  {
    paper: "001",
    questionText: "'Context clues' in literary appreciation are constituted by",
    options: [
      "A. words which are not used in a literary piece at all.",
      "B. hints that point to levels of meaning in a literary piece.",
      "C. words that are not used often in a literary piece.",
      "D. hints that are suggestively contentious in a literary piece.",
    ],
    correctOption: "B",
    explanation: "Context clues are the words, phrases, sentences, or broader situational elements surrounding an unfamiliar or complex expression in a text that help the reader infer or deduce its meaning. In literary appreciation, they 'point to levels of meaning' — both surface and deeper significance — within a literary piece.",
  },
  {
    paper: "001",
    questionText: "Soliloquy as a dramatic technique was introduced into drama and theatre during the",
    options: [
      "A. Classical period.",
      "B. Elizabethan period.",
      "C. Medieval period.",
      "D. Victorian period.",
    ],
    correctOption: "B",
    explanation: "The soliloquy — a speech in which a character, alone on stage or apart from others, speaks their private thoughts aloud — was developed and popularised during the Elizabethan period, most notably by Shakespeare. It became the defining technique of Elizabethan and Jacobean drama for revealing inner psychology.",
  },
  {
    paper: "001",
    questionText: "Which of the following poets is not a prominent metaphysical poet?",
    options: [
      "A. Andrew Marvell",
      "B. John Donne",
      "C. George Herbert.",
      "D. Wilfred Owen.",
    ],
    correctOption: "D",
    explanation: "Andrew Marvell, John Donne, and George Herbert are all canonical Metaphysical poets of the 17th century, known for their intellectual wit, use of conceits, and exploration of complex themes. Wilfred Owen was a World War I poet (early 20th century) associated with anti-war poetry, not the Metaphysical school.",
  },
  {
    paper: "001",
    questionText: "Giovanni Boccaccio's The Decameron is regarded as the",
    options: [
      "A. origin of the novella sub genre.",
      "B. origin of the novel genre.",
      "C. origin of the romance sub genre.",
      "D. origin of the short story genre.",
    ],
    correctOption: "A",
    explanation: "Boccaccio's The Decameron (1353) — a collection of 100 short prose tales — is widely regarded as the foundational work of the novella sub-genre in Western literature. Its structured frame narrative and polished prose tales set the template for short-form prose fiction in Europe.",
  },
  {
    paper: "001",
    questionText: "Identify the form that does not belong to the lyrical poetry family from the following",
    options: [
      "A. Elegy.",
      "B. Ode.",
      "C. Sonnet.",
      "D. Epic.",
    ],
    correctOption: "D",
    explanation: "The elegy, ode, and sonnet all belong to the lyrical poetry tradition — they are relatively short, subjective, and expressive of personal emotion. The epic is a narrative poem, not lyrical; it tells a long story of heroic deeds (e.g. Homer's Iliad, Milton's Paradise Lost) and belongs to a distinct poetic genre.",
  },
  // Questions 7–11 are based on the Othello excerpt (Act I, Scene III)
  {
    paper: "001",
    questionText: "Read the Othello excerpt (Act I, Scene III). The speaker is",
    options: [
      "A. Brabantio",
      "B. Iago",
      "C. Duke of Venice",
      "D. Othello",
    ],
    correctOption: "D",
    explanation: "The speech — recounting adventures 'from my boyish days', tales of 'moving accidents by flood and field', 'Cannibals', and 'Anthropophagi' — is Othello's defence before the Duke and Senators. It is his famous autobiographical narrative explaining how he won Desdemona's love through his stories (Act I, Scene III).",
  },
  {
    paper: "001",
    questionText: "In the Othello excerpt (Act I, Scene III), the setting is",
    options: [
      "A. A council-chamber.",
      "B. Another street.",
      "C. A Sea-port in Cyprus.",
      "D. Before the castle.",
    ],
    correctOption: "A",
    explanation: "Act I, Scene III of Othello is set in 'A council-chamber' in Venice, where the Duke of Venice and Senators have gathered to discuss the Turkish threat to Cyprus. Othello is summoned there and delivers his speech before this assembly.",
  },
  {
    paper: "001",
    questionText: "In the Othello excerpt (Act I, Scene III), the word 'he' in line 2 refers to",
    options: [
      "A. Iago.",
      "B. Brabantio.",
      "C. Cassio.",
      "D. Duke of Venice.",
    ],
    correctOption: "B",
    explanation: "In 'the very moment that he bade me tell it', the pronoun 'he' refers to Brabantio — Desdemona's father. Othello is explaining that he narrated his life's adventures to Brabantio himself over many visits to his home. It was Brabantio who invited Othello to tell his stories.",
  },
  {
    paper: "001",
    questionText: "Through the speech in the Othello excerpt (Act I, Scene III), the speaker tries to",
    options: [
      "A. narrate the story of his war experience.",
      "B. recount the story of his encounter with Cannibals.",
      "C. defend himself against an allegation.",
      "D. pride himself as a great warrior and achiever.",
    ],
    correctOption: "C",
    explanation: "Brabantio has accused Othello of winning Desdemona through witchcraft. Othello's speech before the Duke is a legal defence — he explains that he won her affections through his captivating narratives of adventure, not through magic. The speech is fundamentally a defence against an allegation of sorcery.",
  },
  {
    paper: "001",
    questionText: "Later in the scene (Act I, Scene III of Othello), the speaker is",
    options: [
      "A. killed.",
      "B. imprisoned.",
      "C. absolved of the allegation.",
      "D. rewarded for his bravery.",
    ],
    correctOption: "C",
    explanation: "After hearing Othello's narrative and Desdemona's own testimony (that she willingly gave her heart to him), the Duke finds in Othello's favour. Brabantio's accusation of witchcraft is dismissed and Othello is absolved. The Duke even tells Brabantio: 'I think this tale would win my daughter too.'",
  },
  {
    paper: "002",
    questionText: "The type of irony which expresses a disparity between what is said and the situation is called",
    options: [
      "A. dramatic irony.",
      "B. situational irony.",
      "C. verbal irony.",
      "D. poetic irony.",
    ],
    correctOption: "B",
    explanation: "Situational irony occurs when there is an incongruity between what is expected to happen and what actually occurs, or between what is said and the real situation. Verbal irony involves saying the opposite of what one means (e.g., sarcasm). Dramatic irony arises when the audience knows more than the characters.",
  },
  {
    paper: "002",
    questionText: "Modern African drama draws from the following traditions except",
    options: [
      "A. music and dance.",
      "B. folklore and myths",
      "C. rituals and festivals",
      "D. ideology and theory.",
    ],
    correctOption: "D",
    explanation: "Modern African drama is distinctively rooted in indigenous performance traditions: music and dance, folklore and myths, and rituals and festivals. These are its organic cultural sources. 'Ideology and theory' — as abstract intellectual frameworks — are not indigenous traditional sources but rather academic or political imports.",
  },
  {
    paper: "002",
    questionText: "The novel genre emerged in the eighteenth century through the novels of writers like",
    options: [
      "A. Henry James and Scott. F Fitzgerald",
      "B. William Faulkner and Ernest Hemmingway",
      "C. Charles Dickens and Emily Bronte.",
      "D. Daniel Defoe and Samuel Richardson",
    ],
    correctOption: "D",
    explanation: "The novel as a literary form emerged in 18th-century England through the pioneering works of Daniel Defoe (Robinson Crusoe, 1719; Moll Flanders, 1722) and Samuel Richardson (Pamela, 1740; Clarissa, 1748). Dickens and Brontë are Victorian novelists; James, Fitzgerald, Faulkner, and Hemingway are 19th/20th century writers.",
  },
  {
    paper: "002",
    questionText: "The atmosphere created in a literary piece is understood through the",
    options: [
      "A. place of publication of the text.",
      "B. motivation of the story.",
      "C. spatiotemporal world of the text.",
      "D. narrative point of view.",
    ],
    correctOption: "C",
    explanation: "Atmosphere (or mood) is the emotional tone or feeling created for the reader by the combined effect of the text's setting — its spatial (place) and temporal (time) dimensions — along with imagery, diction, and events. The 'spatiotemporal world of the text' (where and when the story is set) is therefore the primary lens through which atmosphere is understood.",
  },
  {
    paper: "002",
    questionText: "An approach to literary appreciation which focuses on the author is the",
    options: [
      "A. Pragmatic approach.",
      "B. Mimetic approach.",
      "C. Objective approach.",
      "D. Expressive approach.",
    ],
    correctOption: "D",
    explanation: "M. H. Abrams' critical framework identifies four orientations: Mimetic (focuses on the work's relation to reality), Pragmatic (focuses on the audience/reader), Objective (focuses on the text itself), and Expressive (focuses on the author as the source of literary meaning). The Expressive approach privileges the author's biography, intention, and emotional expression.",
  },
  // Questions 17–19 based on the Gerard Manley Hopkins poem
  {
    paper: "003",
    questionText: "Study the poetic piece beginning 'O if we but knew what we do / When we delve or hew'. The figure of speech used in line 3 ('Hack and rack the growing green!') of the piece is",
    options: [
      "A. paradox.",
      "B. alliteration.",
      "C. irony.",
      "D. metaphor.",
    ],
    correctOption: "B",
    explanation: "Line 3 — 'Hack and rack the growing green!' — uses alliteration: the repetition of the consonant sound /h/ in 'Hack' and the initial sound pattern in 'rack'. The repeated harsh sounds (h, r) also mimic the violent action being described, making the alliteration both a sound device and an example of onomatopoeia working together.",
  },
  {
    paper: "003",
    questionText: "The poem ('O if we but knew what we do...') has a rhyme scheme of",
    options: [
      "A. aabccee",
      "B. abbccee",
      "C. abbbcee",
      "D. aabceee",
    ],
    correctOption: "A",
    explanation: "Mapping the end-words: 'do' (a) / 'hew' (a) / 'green' (b) / 'tender' (c) / 'slender' (c) / 'ball' (d) / 'all' (d) — but re-examining with options: Line 1: do (a), Line 2: hew (a), Line 3: green (b), Line 4: tender (c), Line 5: slender (c), Line 6: ball (d), Line 7: all (d). The closest match among the options, recognising 'do/hew' as (a), 'green' as (b), and 'tender/slender' as (c) is aabccee — option A.",
  },
  {
    paper: "003",
    questionText: "In the poem 'O if we but knew what we do...', the tone and mood of the poet are",
    options: [
      "A. anger and sadness",
      "B. regret and sadness",
      "C. joy and hope",
      "D. regret and nostalgia",
    ],
    correctOption: "B",
    explanation: "The poem (Gerard Manley Hopkins' 'Binsey Poplars') laments the felling of trees. The exclamatory opening 'O if we but knew what we do' expresses regret — a wish that people understood the consequences of their destruction. The mood is one of sadness at the irreversible loss of natural beauty. Together, regret (tone) and sadness (mood) best capture the poem's emotional register.",
  },
  {
    paper: "003",
    questionText: "A poem which emphasizes the visual layout or design more than the words themselves is",
    options: [
      "A. a concrete poem.",
      "B. an abstract poem.",
      "C. a natural poem.",
      "D. an editorial poem.",
    ],
    correctOption: "A",
    explanation: "A concrete poem (also called a shape poem or pattern poem) prioritises the visual arrangement of words on the page — the poem's physical shape or design — as an integral part of its meaning. The words are arranged to form a visual image related to the poem's subject, as in George Herbert's 'Easter Wings'.",
  },
  {
    paper: "004",
    questionText: "A textual approach to analysis of an unseen text primarily focuses on the",
    options: [
      "A. form and narrative technique.",
      "B. form and biographical context.",
      "C. language and style",
      "D. form and content.",
    ],
    correctOption: "D",
    explanation: "A textual (or objective) approach to literary analysis focuses primarily on the text itself — its form (how it is structured) and content (what it says). This is distinct from biographical approaches (which consider the author's life) or contextual approaches (which consider historical background). Form and content are the twin pillars of close textual reading.",
  },
  {
    paper: "004",
    questionText: "The term 'peripeteia' refers to",
    options: [
      "A. a tragic hero's weakness",
      "B. the point of recognition or realisation in a tragic hero's experience",
      "C. excessive pride arrogance that leads the tragic hero to his downfall.",
      "D. a fatal flaw or error of judgement leading to tragic hero's downfall.",
    ],
    correctOption: "B",
    explanation: "In Aristotle's Poetics, peripeteia (reversal of fortune) is often confused with anagnorisis (recognition). However, in this context the question matches 'peripeteia' to 'the point of recognition or realisation' — as the reversal is the key moment the hero recognises the truth about their situation. Strictly, anagnorisis = recognition; peripeteia = reversal — but the question assigns option B to this term. Hamartia = fatal flaw; hubris = excessive pride.",
  },
  {
    paper: "001",
    questionText: "In drama, a classical plot model outlining a five-stage structure is the",
    options: [
      "A. Aristotelian plot model.",
      "B. Shakespearean plot model.",
      "C. Freytag's plot pyramid.",
      "D. Feynod's plot pyramid.",
    ],
    correctOption: "C",
    explanation: "Freytag's Pyramid — developed by the German playwright and critic Gustav Freytag in 1863 — is the five-stage dramatic structure model: (1) Exposition, (2) Rising Action/Complication, (3) Climax, (4) Falling Action, (5) Denouement/Resolution. It is the classical model for a five-act dramatic plot structure.",
  },
  {
    paper: "002",
    questionText: "The genre of short story is closest to the novel in terms of the",
    options: [
      "A. complexity of conflict.",
      "B. complexity of plot structure.",
      "C. exploration of character of the protagonist.",
      "D. exploration of thematic focus.",
    ],
    correctOption: "D",
    explanation: "While the short story is far briefer and simpler in plot and character development than the novel, both genres share the capacity to explore a central thematic focus with equal depth and seriousness. Theme — the underlying idea or message — is the dimension where the short story most closely approximates the novel's scope.",
  },
  {
    paper: "001",
    questionText: "In Greek dramaturgy, the chant and hymn sung in praise of the god Dionysus is known as the",
    options: [
      "A. Theatron.",
      "B. Dithyramb.",
      "C. Acropolis.",
      "D. Spectacula.",
    ],
    correctOption: "B",
    explanation: "The dithyramb was a choral hymn sung and danced in honour of Dionysus at festivals in ancient Greece. It is widely regarded as the origin of Greek drama. Theatron is the seating area for spectators; the Acropolis is the citadel of Athens; Spectacula is a Latin term for spectacles.",
  },
  // Questions 26–30 based on Othello Act III, Scene IV (Cassio and Bianca)
  {
    paper: "001",
    questionText: "In the Othello excerpt (Act III, Scene IV), Speaker A is",
    options: [
      "A. Desdemona.",
      "B. Emilia.",
      "C. Othello.",
      "D. Cassio.",
    ],
    correctOption: "D",
    explanation: "In Act III, Scene IV of Othello, the exchange between a man who has been absent 'a week away' and a woman who complains about his absence is between Cassio (Speaker A) and Bianca (Speaker B). Cassio opens with 'What make you from home? / How is it with you, my most fair...?' — addressing Bianca, his mistress.",
  },
  {
    paper: "001",
    questionText: "In the Othello excerpt (Act III, Scene IV), Speaker B is",
    options: [
      "A. Bianca.",
      "B. Desdemona.",
      "C. Cassio.",
      "D. Othello.",
    ],
    correctOption: "A",
    explanation: "Speaker B — who complains 'What, keep a week away? seven days and nights? / Eight score eight hours?' — is Bianca, Cassio's mistress. She is upset at his long absence and expresses her longing through hyperbolic counting of the hours. The scene reveals Cassio's relationship with Bianca, which Iago later uses to manipulate Othello.",
  },
  {
    paper: "001",
    questionText: "The dominant literary device employed by Speaker B in the Othello excerpt (Act III, Scene IV) is",
    options: [
      "A. Parallelism.",
      "B. Irony.",
      "C. Rhetorical question.",
      "D. Extended metaphor.",
    ],
    correctOption: "C",
    explanation: "Bianca (Speaker B) uses rhetorical questions: 'What, keep a week away? seven days and nights? / Eight score eight hours? And lovers' absent hours, / More tedious than the dial eight score times? / O weary reckoning!' These questions are not seeking answers but dramatically expressing her frustration and longing, making rhetorical questioning the dominant device.",
  },
  {
    paper: "001",
    questionText: "Later in the scene (Act III, Scene IV of Othello),",
    options: [
      "A. Speaker A gives Speaker B Desdemona's handkerchief.",
      "B. The two characters decide to see Desdemona.",
      "C. Speaker B reveals the secret of Iago to Speaker A.",
      "D. Speaker A reveals the secret of Othello to Speaker B.",
    ],
    correctOption: "A",
    explanation: "Later in Act III, Scene IV, Cassio (Speaker A) gives Bianca (Speaker B) Desdemona's handkerchief — the one Iago had stolen and planted in Cassio's lodging. Cassio asks Bianca to copy the embroidery pattern. This becomes central to Iago's scheme, as Othello later sees it and takes it as proof of Desdemona's infidelity.",
  },
  {
    paper: "001",
    questionText: "In the Othello excerpt (Act III, Scene IV), the conversation takes place",
    options: [
      "A. At a Sea-port in Cyprus",
      "B. A council chamber",
      "C. Before the castle",
      "D. A street in Venice",
    ],
    correctOption: "C",
    explanation: "Act III, Scene IV of Othello is set 'Before the castle' in Cyprus. This is the scene where Desdemona tries to intercede for Cassio with Othello and also where the Cassio-Bianca exchange takes place. The action has moved from Venice to Cyprus by Act II.",
  },
  {
    paper: "001",
    questionText: "A sentimental comedy is the type of drama in which",
    options: [
      "A. trials of middle-class characters and their method of overcoming them are explored.",
      "B. the theme of love is primarily explored.",
      "C. the behaviours and lives of upper-class characters are poked at.",
      "D. a character-based story is humorously presented.",
    ],
    correctOption: "A",
    explanation: "Sentimental comedy emerged in the 18th century as a reaction to the licentiousness of Restoration comedy. It focuses on the moral trials and virtuous struggles of middle-class characters, presenting their problems and the ways they overcome adversity through virtue, with the aim of producing emotional sympathy (sentiment) rather than mere laughter.",
  },
  {
    paper: "003",
    questionText: "The dominant elements/characteristics captured in romantic poetry include",
    options: [
      "A. emotion, imagination and beauty of nature.",
      "B. intellectualism, nature and spirituality.",
      "C. emotion, intellectualism and use of conceits.",
      "D. unified sensibility, imagination and elaborate imagery.",
    ],
    correctOption: "A",
    explanation: "Romantic poetry (late 18th–early 19th century) is characterised above all by: (1) intense personal emotion as the primary source of poetry; (2) imagination as the supreme creative faculty; and (3) the beauty of nature as both subject matter and spiritual symbol. Intellectualism and conceits belong to the Metaphysical tradition; unified sensibility is T. S. Eliot's concept.",
  },
  {
    paper: "001",
    questionText: "The most fundamental idea which influenced the development of the Absurdist theatre is the",
    options: [
      "A. Humanism philosophy.",
      "B. Marxism.",
      "C. Existentialist philosophy.",
      "D. Modernism.",
    ],
    correctOption: "C",
    explanation: "Absurdist theatre (Samuel Beckett, Ionesco, Pinter) grew directly out of Existentialist philosophy — particularly the ideas of Albert Camus (The Myth of Sisyphus) and Sartre about the inherent meaninglessness of human existence and the absurdity of the human condition. Existentialism provided the philosophical bedrock for the Theatre of the Absurd.",
  },
  {
    paper: "004",
    questionText: "Ideas, thoughts, and images expressed in a poem constitute the poem's",
    options: [
      "A. poetic genre.",
      "B. poetic form.",
      "C. poetic content.",
      "D. poetic setting.",
    ],
    correctOption: "C",
    explanation: "Poetic content refers to the intellectual and emotional substance of a poem — the ideas, thoughts, feelings, and images the poet expresses. It is distinct from poetic form (the structural and technical organisation: metre, rhyme, stanza), poetic genre (the category: sonnet, ode, epic), and poetic setting (the time and place evoked).",
  },
  {
    paper: "001",
    questionText: "A form of allegorical drama that was popular in the 15th and 16th centuries is the",
    options: [
      "A. Liturgical plays.",
      "B. Church plays.",
      "C. Morality plays.",
      "D. Apocalyptic plays.",
    ],
    correctOption: "C",
    explanation: "Morality plays were allegorical dramas popular in the 15th and 16th centuries in which abstract virtues and vices were personified as characters struggling for the human soul. Works like Everyman and The Castle of Perseverance are classic examples. Liturgical plays are earlier church-based dramatic forms.",
  },
  {
    paper: "004",
    questionText: "An extended metaphor which compares two dissimilar concepts is called",
    options: [
      "A. romantic metaphor.",
      "B. classical metaphor.",
      "C. metaphysical metaphor.",
      "D. modernist metaphor.",
    ],
    correctOption: "C",
    explanation: "A metaphysical metaphor (also called a conceit) is an extended and often far-fetched comparison that draws an elaborate parallel between two highly dissimilar things. John Donne's comparison of two lovers' souls to a compass in 'A Valediction: Forbidding Mourning' is the most famous example. This is the defining device of Metaphysical poetry.",
  },
  {
    paper: "002",
    questionText: "In a literary piece, a complex character is the same as a",
    options: [
      "A. flat character.",
      "B. two-dimensional character.",
      "C. one-dimensional character.",
      "D. round character.",
    ],
    correctOption: "D",
    explanation: "E. M. Forster (in Aspects of the Novel, 1927) coined the terms 'flat' and 'round' characters. A round (complex) character has multiple dimensions — psychological depth, contradictions, and the capacity to surprise. A flat character is simple and one-dimensional, defined by a single trait. 'Complex character' and 'round character' are therefore synonymous.",
  },
  {
    paper: "003",
    questionText: "The choice of words a poet makes in shaping his or her thought is called",
    options: [
      "A. tone.",
      "B. diction.",
      "C. mood.",
      "D. vision.",
    ],
    correctOption: "B",
    explanation: "Diction refers to the poet's deliberate selection of words — their vocabulary choices. It encompasses whether the language is formal or colloquial, Latinate or Anglo-Saxon, concrete or abstract, simple or complex. Diction is the primary tool through which the poet shapes meaning, tone, and style.",
  },
  {
    paper: "004",
    questionText: "In analysing characterisation in a literary piece, the critic must focus mainly on",
    options: [
      "A. characters' actions, reactions and the results of their actions.",
      "B. the depiction of characters' physical attributes.",
      "C. number of characters' appearances in the text.",
      "D. writer's attitude to characters' mental behaviours.",
    ],
    correctOption: "A",
    explanation: "Characterisation analysis focuses on how characters are developed and revealed through what they do (actions), how they respond to circumstances (reactions), and the consequences that flow from their choices (results of actions). Physical descriptions and mental attitudes matter, but the primary analytical focus must be on the dynamic of action, reaction, and consequence.",
  },
  {
    paper: "004",
    questionText: "The literary technique used in a piece of literary work to foreshadow the denouement is the",
    options: [
      "A. soliloquy.",
      "B. action.",
      "C. foreshadowing.",
      "D. suspense.",
    ],
    correctOption: "C",
    explanation: "Foreshadowing is the literary technique of planting early hints, clues, or symbolic details in a narrative that anticipate later events — specifically the denouement (resolution). It creates dramatic irony when readers recognise these clues in retrospect. While suspense builds tension and soliloquy reveals thought, foreshadowing is the technique explicitly designed to prefigure the ending.",
  },
];

// ── Section B: Theory Questions ──────────────────────────────────────────────

const theory = [
  // LIT001: DRAMA
  {
    paper: "001",
    questionText: "Discuss the plot structure of T. S. Eliot's Murder in the Cathedral, showing the effectiveness of it to the play's presentation of Archbishop Beckett as a tragic character. (15 marks)",
    markingGuide: `Award marks for a well-structured essay covering the following points (up to 15 marks total):

INTRODUCTION (1–2 marks):
- Brief identification of Murder in the Cathedral as a verse drama (1935) about the martyrdom of Archbishop Thomas Beckett.
- Thesis statement linking plot structure to the tragic presentation of Beckett.

PLOT STRUCTURE ANALYSIS (8–10 marks):
Award marks for discussion of any of the following structural elements with textual support:

1. The Two-Part Structure and Interlude: The play is divided into two parts with a prose sermon interlude. Part I focuses on Beckett's temptation; Part II on his martyrdom. This deliberate structure mirrors the classical tragic movement from inner conflict to external catastrophe.

2. The Four Tempters (Part I) as Hamartia-testing devices: Each Tempter represents a potential fatal flaw — sensual pleasure, political power, baronial support, and (most importantly) the Fourth Tempter who offers spiritual pride. Beckett's recognition of and resistance to spiritual pride is the turning point of his inner journey, functioning as anagnorisis.

3. The Sermon as Structural Pivot: Beckett's Christmas sermon shifts the play from dramatic conflict to meditative resolution. He anticipates his martyrdom willingly. This functions as the peripeteia — the reversal where Beckett chooses death over compromise.

4. The Chorus as Greek tragic device: The Women of Canterbury provide a Greek-style choral commentary that contextualises Beckett's fate within universal suffering, elevating it to tragic proportions.

5. The Knights' addresses to the audience (Part II): The murderers break the fourth wall and justify their actions in modern, legalistic language. This Brechtian distancing device intensifies the irony of Beckett's martyrdom and its political implications.

6. The denouement — martyrdom as triumphant tragedy: Unlike classical tragedy where the hero falls through weakness, Beckett's death is voluntary and spiritually triumphant, creating a distinctly Christian tragic model.

EFFECTIVENESS AS TRAGIC PRESENTATION (3–4 marks):
- The plot's movement from temptation → recognition → martyrdom creates a trajectory that is tragic in the Aristotelian sense (suffering, recognition, reversal) yet unique in its Christian resolution.
- Beckett's final words and the chorus's lament confirm the cathartic function.

CONCLUSION (1 mark):
- Summary of how the structural choices make Beckett a uniquely modern-Christian tragic figure.

Total: 15 marks`,
  },
  {
    paper: "001",
    questionText: "Comment critically on Tewfik Al-Hakim's use of allegory and symbolism to juxtapose the cockroach colony's fate with the struggles and travails of human beings. (15 marks)",
    markingGuide: `Award marks for a well-structured critical essay (up to 15 marks):

INTRODUCTION (1–2 marks):
- Identify The Tree Climber or the relevant Al-Hakim play (often referenced as 'The Fate of a Cockroach' in this context) as an allegorical drama.
- Thesis: Al-Hakim uses the microcosm of the cockroach world to mirror and comment on human social, political, and existential struggles.

ALLEGORY AND ITS FUNCTION (5–6 marks):
1. The Cockroach Kingdom as Political Allegory: The hierarchy among cockroaches (King, Queen, ministers) mirrors human political structures — power, bureaucracy, vanity, and the absurdity of political office.

2. The Fate of the Male Cockroach: The male cockroach's struggle to escape the bathtub parallels human beings' existential struggle against forces beyond their control — fate, society, death.

3. Human Indifference as Allegory of Power: The human characters who watch, debate, but ultimately fail to consistently help the cockroach mirror society's indifference to the suffering of the marginalised.

SYMBOLISM (4–5 marks):
1. The Bathtub as Symbol: The bathtub represents the inescapable trap of circumstance — social, economic, or political conditions from which individuals cannot easily escape.

2. The Ant as Symbol of Danger: The ant threatening the cockroach symbolises predatory forces in human society — those who exploit the vulnerable.

3. The Cockroach King's Pride as Symbol of Hubris: The King's grandiose self-importance despite his powerlessness symbolises the vanity of human authority.

JUXTAPOSITION OF COCKROACH AND HUMAN WORLDS (2–3 marks):
- Al-Hakim structures scenes to cut between the cockroach world and the human domestic world, creating ironic parallels that expose how human concerns (marriage disputes, social status) are as petty as those of insects.
- This juxtaposition produces both comedy and pathos, deepening the allegorical critique.

CONCLUSION (1 mark):
- Al-Hakim's allegory and symbolism universalise the cockroach's plight, making it a mirror for human vulnerability, political absurdity, and existential helplessness.

Total: 15 marks`,
  },

  // LIT002: PROSE
  {
    paper: "002",
    questionText: "Examine the significance of Jane and Rochester's relationship in Emily Brontë's Jane Eyre. (15 marks)",
    markingGuide: `Note: Jane Eyre is Charlotte Brontë's novel, not Emily's. If a student correctly attributes it to Charlotte Brontë, award a bonus acknowledgement. Accept answers based on the novel regardless.

Award marks for a well-structured essay (up to 15 marks):

INTRODUCTION (1–2 marks):
- Brief contextualisation of Jane Eyre as a Bildungsroman and proto-feminist novel.
- Thesis: The Jane-Rochester relationship is central to the novel's themes of equality, independence, moral integrity, and love.

SIGNIFICANCE OF THE RELATIONSHIP (10–11 marks):
Award marks for any well-developed points:

1. Theme of Equality: Jane famously asserts her equality with Rochester: 'I am no bird; and no net ensnares me.' Their relationship challenges Victorian social hierarchies — Jane is a poor governess, Rochester a wealthy landowner, yet she refuses subservience.

2. Moral Independence: Jane refuses to become Rochester's mistress after learning of Bertha Mason's existence, despite her love for him. This demonstrates moral integrity over passion — central to the novel's values.

3. The 'Mad Woman in the Attic' (Bertha Mason): Bertha's existence reveals Rochester's moral compromise and creates the central obstacle. Jane's response — to leave rather than compromise — defines her character and the relationship's moral stakes.

4. Spiritual and Intellectual Partnership: Rochester values Jane's honesty and intelligence. Their conversations are marked by wit and intellectual sparring, suggesting a relationship of minds as well as hearts — unusual for Victorian fiction.

5. The Resolution — Marriage on Equal Terms: Jane inherits money before returning to Rochester (now blinded). She returns as an equal, not a dependent. The marriage represents the Victorian ideal revised — partnership based on mutual respect.

6. Power and Control: The relationship explores shifting power dynamics: Rochester holds economic power initially; Jane holds moral power. Their eventual union balances these.

THEMATIC SIGNIFICANCE (2–3 marks):
- The relationship drives the novel's central argument: that women deserve emotional, intellectual, and spiritual fulfilment on their own terms.
- It functions as a critique of Victorian marriage and gender norms.

CONCLUSION (1 mark):
- The relationship is the narrative and thematic engine of the novel.

Total: 15 marks`,
  },
  {
    paper: "002",
    questionText: "With textual reference to four instances in the novel, examine Peter Abrahams' use of irony in moving the plot forward in Mine Boy. (15 marks)",
    markingGuide: `Award marks for a well-structured essay identifying and analysing four instances of irony (up to 15 marks):

INTRODUCTION (1–2 marks):
- Brief introduction to Mine Boy (1946) as a protest novel exploring racial oppression in apartheid South Africa through the story of Xuma, a young man from Rhodesia navigating Johannesburg's slums and mines.
- Thesis: Abrahams uses irony — particularly situational and dramatic irony — to expose the contradictions of apartheid and to advance the plot's tragic trajectory.

FOUR INSTANCES OF IRONY (10–11 marks — approximately 2–3 marks each):

Students may discuss any four relevant instances. Award marks for accurate identification + textual reference + analysis of how the irony moves the plot:

1. Situational Irony — Xuma's Optimism vs Reality: Xuma arrives in Johannesburg with hope for economic opportunity. The irony is that the very system he hopes to succeed within (the mines) is designed to destroy men physically and spiritually. This irony drives the plot by setting up Xuma's tragic education.

2. Dramatic Irony — The White Characters' Humanity: Characters like Dr Mini and Paddy O'Shea (white characters who treat Xuma with respect) exist within a system that legally dehumanises Xuma. The reader sees the irony that individual goodwill cannot dismantle systemic racism — this propels the plot toward its tragic conclusion.

3. Situational Irony — The Mine as Provider and Destroyer: The mine provides Xuma's livelihood but simultaneously destroys his fellow workers through accidents and lung disease. The plot moves forward when Leah's community and the miners begin to confront this contradiction.

4. Dramatic Irony — Leah's Strength vs Her Vulnerability: Leah appears to be a powerful, self-sufficient figure. The irony of her eventual arrest and the collapse of her world underscores the plot's movement from apparent stability to catastrophe.

5. Verbal Irony — Official Language of 'Development': The language of the apartheid system frames exploitation as development and order. Abrahams ironises this through the lived reality of characters like Xuma.

ANALYSIS OF PLOT FUNCTION (2–3 marks):
- Each irony accelerates the plot by revealing the gap between appearance and reality, forcing characters (particularly Xuma) toward confrontation and consciousness.

CONCLUSION (1 mark):
- Abrahams uses irony as both a rhetorical and structural tool, exposing apartheid's contradictions while driving the plot toward inevitable tragedy.

Total: 15 marks`,
  },

  // LIT003: POETRY
  {
    paper: "003",
    questionText: "How does Wilfred Owen's 'Anthem for Doomed Youth' use the formal elements of sonnet to portray the theme of devastation of war? (15 marks)",
    markingGuide: `Award marks for a well-structured analytical essay (up to 15 marks):

INTRODUCTION (1–2 marks):
- Identify 'Anthem for Doomed Youth' (1917) as a Petrarchan/Italian sonnet written during World War I.
- Thesis: Owen uses the sonnet's formal structure — the octave-sestet division, rhyme scheme, and volta — to dramatise the contrast between the violence of the battlefield and the quiet grief at home.

FORMAL ELEMENTS OF THE SONNET (10–11 marks):

1. The Octave (Lines 1–8) — The Battlefield (4–5 marks):
- Rhyme scheme: ABAB CDCD — the regular pattern mimics military order, which is then disrupted by the chaotic imagery.
- Opening rhetorical question: 'What passing-bells for these who die as cattle?' — immediately equates soldiers with livestock, emphasising their dehumanisation.
- Owen replaces traditional funeral rites with sounds of war: 'the monstrous anger of the guns', 'stuttering rifles' rapid rattle', 'the shrill, demented choirs of wailing shells'.
- The octave's imagery of artillery, rifles, and shells as the only 'mourning' for the dead devastates the expectation of dignified death.
- Sound devices: onomatopoeia ('stuttering', 'rattle'), alliteration ('rifles' rapid rattle') reinforce the violence.

2. The Volta (Line 9) — The Shift (1–2 marks):
- The volta at 'What candles may be held to speed them all?' marks a turn from the external (battlefield) to the internal (home, emotional grief).
- This structural shift enacts the poem's central contrast: the devastation of public death vs. the private, silent mourning.

3. The Sestet (Lines 9–14) — The Home Front (4 marks):
- Rhyme scheme: EFGEFG (or similar) — the quieter, more interlocking rhyme mirrors the subdued register of private grief.
- Owen substitutes traditional mourning symbols with human gestures: 'the holy glimmers of goodbyes' in girls' eyes replace candles; 'pallor of girls' brows' replaces the pall (coffin cloth); 'their flowers the tenderness of patient minds'.
- The final couplet: 'And each slow dusk a drawing-down of blinds' — the drawing of blinds as sign of death in a household is the sonnet's most devastatingly understated image.

THEMATIC ACHIEVEMENT (2 marks):
- The sonnet form — traditionally associated with love poetry — is subverted to eulogise the war dead, creating an ironic frame.
- Owen's mastery is in using the sonnet's formal constraints to give shape and dignity to the theme of devastation and loss.

CONCLUSION (1 mark):
- Every formal element of the sonnet — octave, volta, sestet, rhyme — serves Owen's anti-war theme.

Total: 15 marks`,
  },
  {
    paper: "003",
    questionText: "Critically examine the effect of tone and mood on the theme of colonialism in Sola Owonibi's 'Africa'. (15 marks)",
    markingGuide: `Award marks for a well-structured critical essay (up to 15 marks):

INTRODUCTION (1–2 marks):
- Brief introduction to Sola Owonibi as a Nigerian poet and 'Africa' as a post-colonial poem.
- Thesis: Owonibi's carefully constructed tone of anger, sorrow, and defiant hope, and the corresponding mood of lamentation and resistance, serve as the primary vehicles for interrogating the legacy and ongoing effects of colonialism on Africa.

TONE ANALYSIS (5–6 marks):
Award marks for identification and analysis of specific tonal registers with textual evidence:

1. Tone of Lamentation/Mourning: The poem mourns Africa's pre-colonial glory and the violence of the colonial encounter. The elegiac tone reinforces the theme of irreversible loss.

2. Tone of Anger/Indignation: Owonibi's voice rises to anger when describing colonial exploitation — the extraction of resources, imposition of foreign culture, and destruction of indigenous identity. This accusatory tone names colonialism as a crime.

3. Tone of Defiance/Hope: Despite the grief and anger, there is an undercurrent of defiant hope — a call to Africa to reclaim its identity and destiny. This tonal shift embodies the post-colonial aspiration for liberation.

MOOD ANALYSIS (4–5 marks):
Award marks for analysis of the mood created for the reader:

1. Mood of Sorrow: The imagery of loss, displacement, and cultural erasure creates a pervasive mood of sadness that implicates the reader in collective grief.

2. Mood of Solidarity: The poem's direct address to 'Africa' creates a mood of communal identification — reader and poet share the burden of colonial history.

3. Mood of Urgency: The call to action creates a tense, urgent mood that positions colonialism not merely as historical fact but as ongoing condition requiring response.

EFFECT ON THEME OF COLONIALISM (3–4 marks):
- The interplay of tone and mood prevents the poem from being merely historical record — it becomes a living critique.
- The emotional register makes the abstract theme of colonialism viscerally felt, moving the reader from intellectual understanding to emotional engagement.
- The shift from lamentation to defiance enacts the thematic movement from victimhood to agency — central to post-colonial literature.

CONCLUSION (1 mark):
- Tone and mood are not decorative but structural — they are the means through which Owonibi transforms political theme into poetic experience.

Total: 15 marks`,
  },

  // LIT004: LITERARY APPRECIATION AND PRACTICAL CRITICISM
  {
    paper: "004",
    questionText: "Read the passage beginning 'The ceremony of the passport control...' and answer: (7a) Comment briefly on the effectiveness of the narrative point of view adopted in the passage. (5 marks)",
    markingGuide: `Award marks for identification and analysis of narrative point of view (up to 5 marks):

IDENTIFICATION (1 mark):
- The passage adopts the Third Person Limited (Close Third Person) point of view, with occasional shifts into Free Indirect Discourse/Style.

EFFECTIVENESS — Award 1 mark each for up to 4 well-developed points:

1. Access to the Protagonist's Inner World: The narrator gives us direct access to the Egyptian diplomat's thoughts and memories ('Long ago he had made a painstaking analysis...', 'His little Princess used often to tease him...'). This intimacy creates psychological depth.

2. Free Indirect Discourse: Phrases like 'Damn them, the English!' and 'Womanish! The very word reminded him...' blend the narrator's third-person voice with the character's internal voice, creating a fluid, modernist stream of consciousness that reveals character without authorial intrusion.

3. Irony Through Distance: The third-person narrator maintains slight distance, allowing ironic commentary on the character's ambivalence — his simultaneous admiration and resentment of England is rendered with gentle irony.

4. Reliability and Limitation: As a limited point of view, we only access this character's perspective, which may be subjective. His analysis of the 'three strains' of English character is presented as his own theory, inviting the reader to question its validity.

5. Cultural Complexity: The point of view effectively captures the postcolonial predicament — an Egyptian man shaped by English culture while simultaneously resenting English imperialism.

Total: 5 marks`,
  },
  {
    paper: "004",
    questionText: "Read the passage beginning 'The ceremony of the passport control...' and answer: (7b) In not more than 100 words, identify and comment on the character of the protagonist of the story. (5 marks)",
    markingGuide: `Award marks for a concise, insightful character analysis within approximately 100 words (up to 5 marks):

CHARACTER IDENTIFICATION (1 mark):
- The protagonist is an Egyptian diplomat/high-ranking official (he refers to his Ambassador, 'dear old Abdel Sami Pasha', and his 'Princess').

CHARACTER TRAITS — Award 1 mark each for up to 4 well-supported traits:

1. Intellectually Sophisticated: He analyses the English national character with scholarly rigour, distinguishing 'Saxon', 'Jutish', and 'Norman' strains — revealing a highly educated, analytical mind.

2. Deeply Ambivalent (About England): He simultaneously loves and hates England: 'The long struggle against his English infatuation had coloured his whole life.' This cultural ambivalence is his defining trait.

3. Patriotic yet Conflicted: He worries about Egypt's vulnerability ('so corrupt, so vulnerable') and desires liberation from English colonialism, yet admits England has 'marked him'.

4. Sentimental: He softens at the 'diminutive dolls' houses' and recalls his Princess's teasing fondly — revealing emotional tenderness beneath the political persona.

5. Self-aware: He is conscious of his 'womanish failings of sentiment' and tries to dismiss them, revealing a character in tension with himself.

Note: Mark for quality of insight and conciseness. Penalise answers exceeding 100 words by 1 mark.

Total: 5 marks`,
  },
  {
    paper: "004",
    questionText: "Read the passage beginning 'The ceremony of the passport control...' and answer: (7c) Identify any two main literary devices used in developing the plot of the story. (5 marks)",
    markingGuide: `Award marks for correct identification and analysis of two literary devices (up to 5 marks — approximately 2.5 marks per device):

DEVICE 1 (2–3 marks):
Students may identify any of the following:

1. Stream of Consciousness / Interior Monologue: The passage flows through the protagonist's thoughts without strict linear narrative — memories, analysis, and present observation merge. This internal focus develops characterisation and advances the psychological plot. ('Long ago he had made...', 'He hoped that Selim had not forgotten...')

2. Flashback / Analepsis: The protagonist's memories of his time as a 'young secretary of Embassy' and his analysis presented to 'dear old Abdel Sami Pasha' constitute a flashback that enriches the plot by establishing backstory and context.

3. Imagery: 'the dove-grey land unrolling its peaceful surges of arable and crop, like swaying of an autumn sea' — rich visual and sensory imagery develops the setting and the character's emotional response to England.

4. Irony: The protagonist desires Egyptian independence from England yet admits he 'even dreamed in English'. This situational irony develops the plot's central tension.

5. Metaphor/Simile: 'the dove-grey land unrolling its peaceful surges...like swaying of an autumn sea' — extended simile linking landscape to seascape, evoking the character's nostalgia and the passage of time.

DEVICE 2 (2–3 marks): Award equivalent marks for a second correctly identified and analysed device.

Total: 5 marks`,
  },
  {
    paper: "004",
    questionText: "Demonstrate a Practical Criticism of the following poem using the Objective Approach:\n\n'Your hand is heavy, Night, upon my brow. / I bear no heart mercuric like the clouds, / to dare. / Exacerbation from your subtle plough...' (Wole Soyinka, 'Night'). (15 marks)",
    markingGuide: `Award marks for a systematic Objective Approach (close reading) to Soyinka's poem 'Night' (up to 15 marks):

INTRODUCTION (1–2 marks):
- Identify the poem as Wole Soyinka's 'Night' (from his collection Idanre and Other Poems).
- State the Objective Approach: focuses on the text itself — language, imagery, structure, tone — without reference to author biography or external context.

STRUCTURE AND FORM (2–3 marks):
- The poem has three stanzas of unequal length, written in free verse (no regular rhyme scheme or metre).
- The irregular structure mirrors the poem's theme of formlessness and the overwhelming, shapeless nature of night.
- Note any specific structural choices: the isolated line 'to dare' creates dramatic pause and emphasis.

DICTION AND LANGUAGE (3–4 marks):
- The language is characteristically dense and Latinate ('exacerbation', 'mercuric', 'fluorescence', 'incessant', 'serrated', 'suffusion') — Soyinka's signature diction that demands active reader engagement.
- 'Mercuric like the clouds': mercury is fluid, volatile, silvery — suggesting the speaker lacks the quicksilver energy to resist night's weight.
- 'Subtle plough': night is personified as an agricultural force — it tills (disturbs) the speaker's consciousness.
- 'Serrated shadows': the jagged, tooth-like image makes darkness physically threatening.

IMAGERY AND FIGURES OF SPEECH (4–5 marks):
- Personification: Night is addressed directly ('Your hand is heavy, Night') and given agency — it ploughs, quenches, rains, and gives birth ('Night's muted birth').
- Extended Metaphor: The entire poem sustains the metaphor of Night as a dominant, almost divine force overwhelming a passive, surrendered human consciousness.
- Simile: 'Woman as a clam, on the sea's crescent' — the speaker's submission is compared to a clam, suggesting enclosure, vulnerability, and the protective/trapping quality of night.
- Synesthesia: 'Sensations pained me, faceless, silent as night thieves' — pain is rendered as simultaneously sensory and visual/auditory.
- Sea Imagery: 'the sea's fluorescence', 'the pulse incessant of the waves', 'blood and brine' — the sea functions as a symbol of primal, unconscious force.

TONE AND MOOD (2–3 marks):
- Tone: passive surrender, exhaustion, vulnerability — 'I stood, drained / Submitting like the sands'.
- Mood: oppressive, hypnotic, deeply introspective — the reader is drawn into the consciousness of a speaker overwhelmed by the weight of night (possibly symbolising existential despair, creative paralysis, or the force of the irrational/unconscious).
- The final plea — 'Hide me now, when night children haunt the earth / I must hear none!' — shifts to desperation.

THEME (1–2 marks):
- Night as an overwhelming existential force; the vulnerability of human consciousness before powerful, impersonal forces; the tension between rational resistance and sensory/emotional surrender.

CONCLUSION (1 mark):
- The poem's power lies in its dense, multi-layered language and its sustained personification of Night as a quasi-divine, irresistible force.

Total: 15 marks`,
  },
];

// ── Insert Functions ──────────────────────────────────────────────────────────

async function insertMCQ(q, idx) {
  const result = await pool.query(
    `INSERT INTO questions
       (subject_id, paper, exam_type, year, question_type, question_text, options, correct_option, explanation)
     VALUES ($1, $2, $3, $4, 'objective', $5, $6, $7, $8)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [
      SUBJECT_ID,
      q.paper,
      EXAM_TYPE,
      YEAR,
      q.questionText,
      JSON.stringify(q.options),
      q.correctOption,
      q.explanation,
    ],
  );
  const inserted = result.rows.length > 0;
  console.log(`  MCQ ${String(idx + 1).padStart(2, "0")}: ${inserted ? "✓ inserted" : "– skipped (exists)"} — ${q.questionText.slice(0, 60)}…`);
}

async function insertTheory(q, idx) {
  const result = await pool.query(
    `INSERT INTO questions
       (subject_id, paper, exam_type, year, question_type, question_text, marking_guide, marks)
     VALUES ($1, $2, $3, $4, 'theory', $5, $6, $7)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [
      SUBJECT_ID,
      q.paper,
      EXAM_TYPE,
      YEAR,
      q.questionText,
      q.markingGuide,
      15,
    ],
  );
  const inserted = result.rows.length > 0;
  console.log(`  Theory ${String(idx + 1).padStart(2, "0")}: ${inserted ? "✓ inserted" : "– skipped (exists)"} — ${q.questionText.slice(0, 60)}…`);
}

async function main() {
  console.log("\n━━━ Literature in English — 2024/2025 Mock Exam Seed ━━━\n");

  console.log(`📋 Inserting ${mcq.length} MCQ questions…`);
  for (let i = 0; i < mcq.length; i++) {
    await insertMCQ(mcq[i], i);
  }

  console.log(`\n📝 Inserting ${theory.length} theory questions…`);
  for (let i = 0; i < theory.length; i++) {
    await insertTheory(theory[i], i);
  }

  const counts = await pool.query(
    `SELECT question_type, COUNT(*) FROM questions
     WHERE subject_id=$1 AND exam_type=$2 AND year=$3
     GROUP BY question_type`,
    [SUBJECT_ID, EXAM_TYPE, YEAR],
  );
  console.log("\n✅ Summary (subject_id=5, examType=mock, year=2024):");
  counts.rows.forEach((r) => console.log(`   ${r.question_type}: ${r.count}`));

  await pool.end();
  console.log("\n🎉 Seed complete.\n");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
