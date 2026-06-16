/**
 * Seed script: Literature in English — 2024/2025 First Semester Exam (Paper 002)
 * Subject ID: 5  |  Paper: 002  |  Year: 2024
 *
 * Run:  NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/seed-lit-2024-semester1.mjs
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
const PAPER      = "002";
const YEAR       = 2024;

// ── 40 Objective Questions ─────────────────────────────────────────────────
const mcq = [
  {
    questionText: "One major departure between Classical Greek drama and the Shakespearean drama is",
    options: [
      "A. choice of thematic focus.",
      "B. rejection of poetic language.",
      "C. use of supernatural elements.",
      "D. structure of the plot.",
    ],
    correctOption: "D",
    explanation: "Classical Greek drama observes the three unities (time, place, action) and maintains a strict structural form, whereas Shakespearean drama freely breaks these unities, mixing comedy with tragedy and spanning multiple locations and time periods.",
  },
  {
    questionText: "The tragic atmosphere of a typical Classical drama is intensified through the",
    options: [
      "A. interventions of the chorus.",
      "B. absence of comic characters.",
      "C. protagonist's lack of knowledge of his people.",
      "D. use of incantation in dialogue.",
    ],
    correctOption: "A",
    explanation: "In Classical Greek drama, the chorus comments on the action, mourns with characters, and heightens emotional tension, thereby intensifying the tragic atmosphere.",
  },
  {
    questionText: "In Aristotle's critical interventions on Classical drama in The Poetics",
    options: [
      "A. Comedy is superior to Tragedy.",
      "B. Tragedy is about the history of Athens.",
      "C. the three unities are less important.",
      "D. there are six major elements of a tragic play.",
    ],
    correctOption: "D",
    explanation: "Aristotle identifies six elements of tragedy in The Poetics: Plot (mythos), Character (ethos), Thought (dianoia), Diction (lexis), Song/Melody (melos), and Spectacle (opsis).",
  },
  {
    questionText: "Choral odes in a typical Classical play",
    options: [
      "A. consists of miming actions.",
      "B. consists of strophe and antistrophe sections.",
      "C. are sung by the protagonist from different sections of the theatre.",
      "D. are composed the audience for the playwright.",
    ],
    correctOption: "B",
    explanation: "Choral odes in Classical Greek drama are structured into strophe (turn) and antistrophe (counter-turn) sections, sometimes followed by an epode, as the chorus moved rhythmically across the orchestra.",
  },
  {
    questionText: "In drama, the term 'anagnorisis' refers to",
    options: [
      "A. a sudden discovery that produces a change from ignorance to knowledge.",
      "B. the representation of the hero as a victim of fate and destiny",
      "C. the act of keeping a crucial information away from the hero",
      "D. a moment of confrontation between the hero and the seer.",
    ],
    correctOption: "A",
    explanation: "Anagnorisis (recognition) is Aristotle's term for the moment of critical discovery that changes a character from ignorance to knowledge — for example, Oedipus discovering that he killed his father and married his mother.",
  },
  {
    questionText: "The dominant theme of Medieval drama is the theme of",
    options: [
      "A. unrequited love.",
      "B. religion.",
      "C. idol worship.",
      "D. politics.",
    ],
    correctOption: "B",
    explanation: "Medieval drama, particularly Mystery plays (based on Biblical stories) and Morality plays (depicting the struggle between good and evil for the human soul), was predominantly concerned with religious themes.",
  },
  {
    questionText: "Mystery and Morality plays are genres of drama which developed",
    options: [
      "A. exactly during the classical period.",
      "B. shortly after the Victorian period.",
      "C. during the Medieval period.",
      "D. almost around late Elizabethan period.",
    ],
    correctOption: "C",
    explanation: "Mystery plays and Morality plays both flourished during the Medieval period (approximately 10th–15th centuries), emerging from the Church as a way to dramatise scripture and moral lessons.",
  },
  {
    questionText: "All of the following dramatists are William Shakespeare's contemporaries except",
    options: [
      "A. John Fletcher",
      "B. Christopher Marlowe",
      "C. Ben Jonson",
      "D. William Congreve.",
    ],
    correctOption: "D",
    explanation: "William Congreve (1670–1729) was a Restoration playwright, more than half a century after Shakespeare. John Fletcher, Christopher Marlowe, and Ben Jonson all lived and wrote during the Elizabethan/Jacobean era alongside Shakespeare.",
  },
  {
    questionText: "The concept which influenced the development of Modern drama is known as",
    options: [
      "A. Classicism.",
      "B. Realism.",
      "C. Modernism.",
      "D. Poeticism.",
    ],
    correctOption: "B",
    explanation: "Realism, developed in the 19th century (championed by Ibsen, Chekhov, and Strindberg), rejected romantic idealism and stage conventions in favour of representing everyday life truthfully, directly influencing the development of modern drama.",
  },
  {
    questionText: "The development of literary African drama was influenced majorly by",
    options: [
      "A. Christianity and Islam.",
      "B. Colonial education and African traditional materials.",
      "C. colonialism and slavery.",
      "D. African tradition and Asian dramatic models.",
    ],
    correctOption: "B",
    explanation: "African literary drama emerged at the intersection of Western dramatic forms introduced through colonial education and the rich oral, performative, and ritual traditions of African cultures.",
  },
  {
    questionText: "Realism, social commentary and moral purpose are the characteristics of",
    options: [
      "A. the Victorian novel.",
      "B. the Postmodern novel.",
      "C. the Elizabethan novel.",
      "D. the Romantic novel.",
    ],
    correctOption: "A",
    explanation: "Victorian novelists such as Charles Dickens, George Eliot, and Thomas Hardy were known for their realistic portrayal of society, sharp social commentary on class and inequality, and strong moral purpose.",
  },
  {
    questionText: "In reading a novel written in omniscient narrative technique, the reader is",
    options: [
      "A. allowed to distinguish the protagonist from the villain.",
      "B. familiarised with the shortcomings of the protagonist.",
      "C. given the window to have an in-depth knowledge of characters in the story.",
      "D. alienated from the realism of the story.",
    ],
    correctOption: "C",
    explanation: "The omniscient narrator has access to all characters' thoughts, feelings, and motivations, giving the reader a comprehensive, in-depth understanding of multiple characters in the story.",
  },
  {
    questionText: "A play is termed melodrama if the",
    options: [
      "A. atmosphere of the story is highly tense.",
      "B. conflict in the story is poetic.",
      "C. language of the dialogue poetic.",
      "D. story is highly sensational.",
    ],
    correctOption: "D",
    explanation: "Melodrama is characterised by exaggerated, highly sensational plots designed to appeal strongly to the emotions, with clearly defined heroes and villains and a tendency towards improbable events.",
  },
  {
    questionText: "In a typical picaresque novel, the picaro is",
    options: [
      "A. the anti-hero.",
      "B. the hero's foil.",
      "C. a roguish romantic character.",
      "D. a roguish adventurist character.",
    ],
    correctOption: "D",
    explanation: "The picaro (from Spanish 'pícaro', rogue) is the protagonist of picaresque fiction — a low-born, roguish adventurer who wanders through society experiencing various adventures, often exposing social hypocrisy.",
  },
  {
    questionText: "In a novel, an event or action which foreshadows what is to happen later",
    options: [
      "A. exaggerates past events with suspense in the story.",
      "B. must foretell what is to come later in the story.",
      "C. exaggerates the actions of the protagonist in the story.",
      "D. must foretell the death of major characters in the story.",
    ],
    correctOption: "B",
    explanation: "Foreshadowing is a literary device where a writer provides hints or clues about future events. It foretells what is to come — not necessarily death, but any future development.",
  },
  {
    questionText: "In Greek theatre, the theatron refers to",
    options: [
      "A. the space where the audience sat during performance of a play.",
      "B. the circular space where actions take place during performance.",
      "C. the masque worn by actors.",
      "D. the masque worn by parodos.",
    ],
    correctOption: "A",
    explanation: "The theatron (literally 'seeing place') was the seating area in the Greek theatre where the audience watched performances. The orchestra was the circular space for action, and the skene was the stage building.",
  },
  {
    questionText: "According to Aristotle, the major elements of Greek tragedy are",
    options: [
      "A. plot, character, spectacle, diction, thought and action.",
      "B. plot, character, action and spectacle",
      "C. song, plot, thought, spectacle, diction and character.",
      "D. spectacle, diction, thought and song.",
    ],
    correctOption: "C",
    explanation: "Aristotle's six elements of tragedy in The Poetics are: Plot (mythos), Character (ethos), Thought (dianoia), Diction (lexis), Song/Melody (melos), and Spectacle (opsis). Option C correctly names all six.",
  },
  {
    questionText: "Basically, the emergence of realism as narrative technique was to reject",
    options: [
      "A. historical elements of story telling.",
      "B. mythical elements of story telling.",
      "C. Romanticism",
      "D. Modernism.",
    ],
    correctOption: "C",
    explanation: "Realism emerged in the mid-19th century as a deliberate rejection of Romanticism's idealism, sentimentality, and escapism, in favour of truthful, objective representations of everyday life.",
  },
  {
    questionText: "The study and analysis of types of characters in prose fiction and drama focuses on",
    options: [
      "A. knowledge of the effects of setting in a text.",
      "B. personality traits of individual characters in a text.",
      "C. type of conflict in a text.",
      "D. the historical context of the text.",
    ],
    correctOption: "B",
    explanation: "Character analysis in literature examines personality traits, motivations, development, and relationships of characters — whether they are round (complex) or flat (one-dimensional), static or dynamic.",
  },
  {
    questionText: "Modernist novels use non-linear order of plot to",
    options: [
      "A. project stock characters as heroes.",
      "B. develop the art of poetic story telling.",
      "C. achieve cause-effect, chronological style of narration.",
      "D. break with traditional cause-effect plot structure.",
    ],
    correctOption: "D",
    explanation: "Modernist novelists deliberately abandoned the traditional linear, chronological narrative structure. Through techniques like stream of consciousness and fragmented narration, they broke with the conventional cause-effect plot structure.",
  },
  {
    questionText: "The concept of 'total theatre' is original to the",
    options: [
      "A. African drama and performance space.",
      "B. English drama and performance theatre.",
      "C. American ballet performance.",
      "D. African novel and poetry performance.",
    ],
    correctOption: "A",
    explanation: "In the context of African dramatic theory, 'total theatre' refers to the African performance tradition that integrates music, dance, drama, poetry, and ritual into a unified whole — a concept rooted in African communal performance.",
  },
  {
    questionText: "One of the major modernist novelists to introduce the stream of consciousness technique is",
    options: [
      "A. Charlotte Bronte.",
      "B. Emily Bronte.",
      "C. Elizabeth Bishop.",
      "D. Virginia Woolf.",
    ],
    correctOption: "D",
    explanation: "Virginia Woolf is one of the foremost pioneers of the stream of consciousness technique in fiction, demonstrated in novels such as Mrs Dalloway (1925) and To the Lighthouse (1927).",
  },
  {
    questionText: "In African novel history and development, the name Olaudah Equiano is associated with",
    options: [
      "A. An African former slave who wrote The Interesting Narrative of the Life of Olaudah Equiano (1789).",
      "B. An African former slave who wrote A Farewell to the Slavery of Olaudah Equiano (1789).",
      "C. An African former colonial citizen who wrote Ethiopia Unbound (1911).",
      "D. An African novelist who wrote O escravo (The Slave) in 1856.",
    ],
    correctOption: "A",
    explanation: "Olaudah Equiano (c.1745–1797), an Igbo-born former slave, wrote The Interesting Narrative of the Life of Olaudah Equiano (1789), one of the earliest and most significant African autobiographical slave narratives.",
  },
  {
    questionText: "Which of the following statements is not true about Amos Tutuola's Palm Wine Drinkard?",
    options: [
      "A. It was published before Things Fall Apart",
      "B. It draws from African oral tradition of mythic tales.",
      "C. It is written in English.",
      "D. It is a pre-modern novel.",
    ],
    correctOption: "D",
    explanation: "The Palm Wine Drinkard was published in 1952, making it a modern novel. It is NOT pre-modern. Option D is the false statement — the other options are all true (published 1952 before TFA in 1958, draws on Yoruba oral tradition, written in English).",
  },
  {
    questionText: "It is believed that Chinua Achebe's Things Fall Apart is a novel written as a reaction to",
    options: [
      "A. Jonathan Swift's depiction of Africa in Gulliver's Travels",
      "B. Joseph Conrad's depiction of African civilisation in Mister Johnson.",
      "C. Joyce Cary's depiction of Nigeria in Mister Johnson.",
      "D. James Joyce's depiction of Africa in Ulysses.",
    ],
    correctOption: "C",
    explanation: "Chinua Achebe was inspired to write Things Fall Apart (1958) as a direct response to Joyce Cary's Mister Johnson (1939), which Achebe felt patronisingly misrepresented Nigerians and their culture.",
  },
  {
    questionText: "A key characteristic of expressionism in 20th century American drama and theatre is",
    options: [
      "A. a realistic setting",
      "B. a focus on renaissance subject matters",
      "C. rejection of themes of social alienation and industrialisation.",
      "D. presentation of distorted reality and symbolic representation.",
    ],
    correctOption: "D",
    explanation: "Expressionism in American drama (e.g., O'Neill's The Hairy Ape) is characterised by distorted, non-realistic settings and symbolic representations that externalise characters' inner psychological states, particularly alienation and anxiety.",
  },
  {
    questionText: "Epic theatre, as a form and style, is linked to the",
    options: [
      "A. theatre theory and practice of Eugene O'Neill in 20th century",
      "B. dramatic formulations of Aristotle in The Poetics",
      "C. theatre theory and practice of Bertolt Brecht in the 20th century",
      "D. dramatic formulations of Arthur Miller in Tragedy and the Common Man.",
    ],
    correctOption: "C",
    explanation: "Epic Theatre is the theatrical style developed by German playwright and theorist Bertolt Brecht (1898–1956). Its hallmarks include the alienation effect (Verfremdungseffekt), didacticism, and the use of narrative devices.",
  },
  {
    questionText: "The setting of a gothic novel is commonly in and around",
    options: [
      "A. an old castle or manor.",
      "B. the palace of feudal monarchs.",
      "C. a war front.",
      "D. a modern city.",
    ],
    correctOption: "A",
    explanation: "Gothic fiction characteristically features gloomy, mysterious settings such as ancient castles, crumbling manor houses, and dark dungeons — settings that create an atmosphere of suspense, horror, and the supernatural.",
  },
  {
    questionText: "In comparison to the English novel, contemporary African novel",
    options: [
      "A. primarily entertains the reader.",
      "B. primarily educates the reader.",
      "C. is interested in precolonial themes only.",
      "D. is interested in both precolonial and postcolonial themes.",
    ],
    correctOption: "D",
    explanation: "The contemporary African novel engages with both precolonial African history and culture AND the postcolonial realities of independence, neocolonialism, corruption, and identity — making D the most accurate description.",
  },
  {
    questionText: "To consider a novel an African Diaspora novel is to",
    options: [
      "A. underscore its ambiguous style.",
      "B. highlight its focus on African past with colonialism",
      "C. highlight its interests in the experiences of Africans outside Africa.",
      "D. underscore its lack of cultural taste.",
    ],
    correctOption: "C",
    explanation: "African Diaspora literature specifically addresses the experiences of Africans and their descendants living outside the African continent, including themes of displacement, identity, racism, and the search for belonging.",
  },
  // Othello extract (Act 1 Scene 1) — questions 31-35
  {
    questionText: "The speaker in the excerpt is\n\n[Extract: 'Despise me, if I do not. Three great ones of the city / In personal suit to make me his lieutenant...And what was he? (Act 1, Scene 1)']",
    options: ["A. Roderigo", "B. Iago", "C. Brabantio", "D. Othello"],
    correctOption: "B",
    explanation: "The speaker is Iago. In Act 1 Scene 1, Iago is venting his frustration to Roderigo about being passed over for the position of lieutenant. The speech expressing wounded pride ('I know my price, I am worth no worse a place') is characteristic of Iago.",
  },
  {
    questionText: "The character being addressed in the excerpt from Act 1 Scene 1 is",
    options: ["A. Brabantio", "B. Cassio", "C. Roderigo", "D. Duke of Venice."],
    correctOption: "C",
    explanation: "The character being addressed is Roderigo. Act 1 Scene 1 opens with Iago and Roderigo in conversation. Iago is trying to convince Roderigo (who is in love with Desdemona) that they should both work against Othello.",
  },
  {
    questionText: "By saying 'Despise me, if I do not.' in the excerpt from Othello Act 1 Scene 1, the speaker means that",
    options: [
      "A. he loves Desdemona.",
      "B. he hates Emilia.",
      "C. he loves Cassio.",
      "D. He hates Othello.",
    ],
    correctOption: "D",
    explanation: "Iago is telling Roderigo: 'Call me a scoundrel (despise me) if I don't hate Othello.' The full speech reveals Iago's deep resentment for Othello who chose Cassio as his lieutenant over Iago.",
  },
  {
    questionText: "The setting of the scene in the Act 1 Scene 1 excerpt from Othello is",
    options: [
      "A. A Council Chamber.",
      "B. Another Street in Venice.",
      "C. A street in Venice.",
      "D. A sea port in Cyprus.",
    ],
    correctOption: "C",
    explanation: "Act 1 Scene 1 of Othello is set on a street in Venice. Iago and Roderigo enter talking, and the scene ends with them going to Brabantio's house to alert him about Desdemona's elopement with Othello.",
  },
  {
    questionText: "The scene in the Act 1 Scene 1 excerpt from Othello highlights the theme of",
    options: [
      "A. love in the play",
      "B. conspiracy in the play.",
      "C. marriage in the play.",
      "D. friendship in the play.",
    ],
    correctOption: "B",
    explanation: "The scene establishes the foundation of Iago's conspiracy against Othello. Iago reveals his plan to manipulate Roderigo and use Brabantio to create trouble for Othello, making conspiracy the dominant theme of this scene.",
  },
  // Act III Scene 1 extract — questions 36-40
  {
    questionText: "Speaker A is [from Act III Scene 1 extract where Speaker A says 'I have made bold, A. To send in to your wife: my suit to her is, that she will to virtuous... Procure me some access.']",
    options: ["A. Emilia", "B. Clown", "C. Iago", "D. Cassio"],
    correctOption: "D",
    explanation: "Speaker A is Cassio. In Act III Scene 1, Cassio (who has been dismissed from his position) is seeking access to Desdemona through Emilia (Iago's wife) to plead for his reinstatement. He says 'I have made bold to send in to your wife.'",
  },
  {
    questionText: "Speaker B is [from Act III Scene 1 extract where Speaker B says 'I'll send her to you presently; And I'll devise a mean to draw the Moor Out of the way']",
    options: ["A. Iago", "B. Othello", "C. Brabantio", "D. Cassio"],
    correctOption: "A",
    explanation: "Speaker B is Iago. He offers to send his wife Emilia to Cassio and to 'draw the Moor (Othello) out of the way' — this is part of Iago's larger plan to use Cassio's meeting with Desdemona to plant jealousy in Othello's mind.",
  },
  {
    questionText: "What happens just before the dialogue in Act III Scene 1?",
    options: [
      "A. Speaker A arrives from a battle in Cyprus",
      "B. Both characters arrive from a battle in Cyprus",
      "C. Speaker A speaks to Clown",
      "D. Speaker B speaks to Clown",
    ],
    correctOption: "C",
    explanation: "Immediately before this dialogue, Cassio (Speaker A) speaks with a Clown who has been sent away from Othello's quarters. Cassio asks the Clown to fetch Emilia, and it is just after this that Iago arrives and the extract's dialogue begins.",
  },
  {
    questionText: "The scene in Act III Scene 1 takes place",
    options: [
      "A. in a Street in Venice.",
      "B. Before the castle.",
      "C. in a Street in Cyprus.",
      "D. Before the Council chamber.",
    ],
    correctOption: "B",
    explanation: "Act III Scene 1 is set before the castle in Cyprus. By Act III, the action has moved from Venice to Cyprus where Othello is the military governor.",
  },
  {
    questionText: "'Your wife' in line 5 of the Act III Scene 1 extract refers to",
    options: [
      "A. Desdemona.",
      "B. Bianca.",
      "C. Clown.",
      "D. Emilia.",
    ],
    correctOption: "D",
    explanation: "Cassio is addressing Iago and refers to 'your wife' meaning Emilia, Iago's wife. Cassio is asking Iago to send Emilia to help him arrange a private meeting with Desdemona.",
  },
];

// ── 8 Theory Questions ─────────────────────────────────────────────────────
const theory = [
  {
    questionText: "Discuss how power consciousness underscores the conflict between the secular and the spiritual life in T. S. Eliot's Murder in the Cathedral.",
    markingGuide: `Award marks for at least FIVE of the following points:
1. The play dramatises the historical conflict between Archbishop Thomas Becket and King Henry II of England in 12th century Canterbury.
2. Becket represents spiritual/ecclesiastical authority while the King's knights represent secular/political power.
3. The Four Tempters embody different manifestations of power — worldly pleasures, political power, barons' alliance, and spiritual pride.
4. Becket's ultimate choice of martyrdom over compromise demonstrates the supremacy of spiritual over secular authority.
5. The Knights who murder Becket claim to act in the interest of secular governance and royal authority.
6. The Women of Canterbury (the Chorus) represent ordinary people caught between these two competing powers.
7. Becket's murder in the cathedral is a symbolic statement that spiritual space (the church) is beyond secular reach.
8. The play explores how power corrupts — even Becket must resist the temptation of spiritual pride.
9. Becket's martyrdom paradoxically strengthens the church's moral authority against secular power.
10. Eliot uses the play to comment on the eternal tension between state and church authority.`,
    marks: 15,
  },
  {
    questionText: "Examine Tewfik Al-Hakim's presentation of the struggle mentality in Fate of a Cockroach.",
    markingGuide: `Award marks for at least FIVE of the following points:
1. Al-Hakim uses the cockroach society as an allegory for human social and political struggles.
2. The Cockroach King's futile wars against ants mirror the pointless power struggles of human rulers.
3. The Queen's preoccupation with gender equality within cockroach society reflects human gender dynamics.
4. The play contrasts the cockroaches' survival instinct with human indifference and helplessness.
5. Adil and Samia's marital conflict parallels the power struggles in the cockroach world.
6. The theme of fate vs. free will runs through both the cockroach story and the human story.
7. The ants represent overwhelming systemic forces against which individual struggle is often futile.
8. Al-Hakim satirises human society's pretension to superiority over 'lower' creatures.
9. The cockroach's fate — destroyed in the bath — symbolises the crushing of the individual by greater forces.
10. The play suggests that the 'struggle mentality' is universal, shared by both insects and humans, yet ultimately tragic.`,
    marks: 15,
  },
  {
    questionText: "Examine the significance of the women's occupation of the Acropolis in Aristophanes' Lysistrata.",
    markingGuide: `Award marks for at least FIVE of the following points:
1. The Acropolis housed the Athenian state treasury (the funds that financed the Peloponnesian War), so its occupation was politically strategic.
2. By seizing the treasury, the women effectively controlled the financial basis of the war — denying men the resources to continue fighting.
3. The sex strike (led by Lysistrata) alongside the Acropolis occupation represents women's dual strategy — economic and domestic pressure.
4. Lysistrata's leadership of the Acropolis occupation challenges the exclusively male domain of Athenian political and military life.
5. The occupation symbolises women's political agency and their capacity to effect change in a patriarchal society.
6. It represents a reversal of gender roles in Classical Athens, where women had no formal political power.
7. The comedy uses the occupation to critique the absurdity and tragedy of the Peloponnesian War.
8. The eventual reconciliation between Athens and Sparta, engineered by women, shows peace as a feminine virtue.
9. The play uses humor (the sexual frustration of men) to make a serious anti-war political statement.
10. The significance extends beyond Athens — Lysistrata rallies women from all Greek city-states, making it a pan-Hellenic protest.`,
    marks: 15,
  },
  {
    questionText: "Comment critically on the relevance of the title of Bosede Afolayan's Once Upon an Elephant to contemporary African experience.",
    markingGuide: `Award marks for at least FIVE of the following points:
1. 'Once Upon' evokes the fairy tale opening, suggesting a mythic quality that roots the narrative in African oral tradition.
2. The elephant is a powerful symbol of strength, wisdom, memory, and communal identity in African culture.
3. The 'once upon' construction hints at loss — something that once existed but is now threatened or gone, reflecting postcolonial cultural erosion.
4. The elephant as an endangered species parallels the endangered status of African cultural values and identity.
5. The title speaks to environmental degradation and the loss of Africa's natural heritage in the contemporary period.
6. It addresses the crisis of identity in postcolonial Africa where traditional values are under threat from modernisation and Western influence.
7. The title's irony is that what was once magnificent ('the elephant') is now only a story — commenting on cultural amnesia.
8. It reflects women's experiences and their role as custodians of tradition in contemporary Nigerian/African society.
9. The fairy-tale structure challenges colonial narratives that dismissed African stories and experiences.
10. The title encapsulates themes of nostalgia, loss, resilience, and the responsibility to preserve African heritage for future generations.`,
    marks: 15,
  },
  {
    questionText: "How does the encounter between Robinson Crusoe and Friday in Daniel Defoe's Robinson Crusoe underscore the theme of slavery and colonialism in the novel?",
    markingGuide: `Award marks for at least FIVE of the following points:
1. Crusoe names Friday after the day he met him, erasing Friday's original indigenous identity — a key act of colonial power.
2. The master-servant relationship Crusoe immediately establishes mirrors the colonial ideology of European superiority over non-Europeans.
3. Crusoe's 'rescue' of Friday is framed as civilising mission — the paternalistic logic of colonialism.
4. Friday's religious conversion to Christianity reflects the missionary dimension of colonial enterprise.
5. Crusoe treats the island as his territory to be developed and owned — enacting colonial land appropriation.
6. Friday willingly serves Crusoe, which Defoe presents uncritically, reflecting the colonial myth of the 'willing native.'
7. The novel reinforces the 'noble savage' stereotype — Friday is portrayed as naturally inferior but trainable.
8. Friday's labour is exploited by Crusoe, paralleling the economic foundation of colonial slave labour.
9. The power imbalance in their relationship — Crusoe commands, Friday obeys — is never questioned in the narrative.
10. The novel as a whole reflects 18th century British imperial attitudes — Defoe presents Crusoe's colonialism as natural and virtuous.`,
    marks: 15,
  },
  {
    questionText: "Highlight and discuss elements that make Charlotte Bronte's Jane Eyre a suitable Victorian bildungsroman.",
    markingGuide: `Award marks for at least FIVE of the following points:
1. A bildungsroman traces the psychological and moral growth of a protagonist from youth to adulthood — Jane Eyre follows this arc precisely.
2. Jane's deprived, orphaned childhood at Gateshead establishes the difficult beginning typical of a bildungsroman.
3. Her education at Lowood Institution, despite harsh conditions, represents the formative period of intellectual and moral development.
4. Jane's employment as governess at Thornfield Hall marks her entry into the adult world and tests her values.
5. Her relationship with Rochester challenges her morality — she refuses to be his mistress despite loving him, showing moral integrity.
6. Jane's flight from Thornfield after discovering Rochester's secret wife demonstrates her commitment to ethical principles over passion.
7. Her period at Moor House with St John Rivers further tests her — she refuses his loveless, duty-driven marriage proposal.
8. Jane's inheritance from her uncle gives her financial independence — a key Victorian theme about women and autonomy.
9. Her return to Rochester as an equal (now financially independent and he is humbled) represents the culmination of her growth.
10. The novel interrogates Victorian class, gender, and religious conventions through Jane's journey to selfhood.`,
    marks: 15,
  },
  {
    questionText: "Discuss the significance of Xuma's relationships with Leah, Eliza and Maisy in Peter Abraham's Mine Boy. What do these relationships portray about women in the novel?",
    markingGuide: `Award marks for at least FIVE of the following points:
1. Leah functions as Xuma's surrogate mother/protector — she gives him shelter and initiates him into urban Johannesburg life under apartheid.
2. Leah represents strength, resilience, and resistance: she runs an illegal shebeen and defies apartheid's oppressive structures.
3. Eliza represents the internally colonised African woman — she aspires to European middle-class values and rejects her African identity, making genuine love with Xuma impossible.
4. Xuma's fixation with Eliza reflects his own confused identity as he navigates between traditional and colonial worlds.
5. Maisy represents authentic African womanhood — grounded, honest, and committed to real love within the shared struggle against apartheid.
6. The transition from Eliza to Maisy in Xuma's affections mirrors his own political awakening and acceptance of his African identity.
7. Through these three women, Abrahams portrays women as pivotal moral and emotional anchors for men under oppressive systems.
8. The women collectively represent the spectrum of responses to apartheid: resistance (Leah), accommodation (Eliza), and solidarity (Maisy).
9. Abrahams challenges the marginalisation of women — all three women are more psychologically developed than most male characters.
10. The novel suggests that authentic love and genuine community are possible only through honest self-acceptance, as represented by Maisy.`,
    marks: 15,
  },
  {
    questionText: "Idede Oseyande's Warri No Dey Carry Last can be described as a social realist novel. Discuss.",
    markingGuide: `Award marks for at least FIVE of the following points:
1. Social realism as a literary mode is defined by its commitment to representing the lives of ordinary, working-class or marginalised people with documentary accuracy.
2. The novel is set in Warri (Niger Delta, Nigeria), a historically significant but economically marginalised oil-producing region — an authentic Nigerian social environment.
3. The narrative portrays the harsh realities of poverty, unemployment, and social inequality in the oil-rich but underdeveloped Delta.
4. Characters are drawn from real social conditions — they are not idealised but reflect the contradictions of Nigerian urban life.
5. The novel offers sharp political and economic critique of the oil industry's exploitation of Delta communities without corresponding development.
6. Oseyande employs local dialect, pidgin, and Warri cultural references, giving the narrative an authentic social-documentary quality.
7. The everyday struggles of characters — economic survival, communal identity, environmental degradation — are central to the narrative.
8. The novel comments on government negligence and the abandonment of Niger Delta communities despite their natural resource wealth.
9. Like classic social realist texts, it functions as social testimony — bearing witness to conditions that official narratives often ignore.
10. The work aligns with the broader tradition of Nigerian social realist writing that uses fiction as a tool for social critique and consciousness-raising.`,
    marks: 15,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log("🔌 Connected to DB.");

    // Check if these questions already exist
    const check = await client.query(
      "SELECT COUNT(*) FROM questions WHERE subject_id = $1 AND paper = $2 AND year = $3",
      [SUBJECT_ID, PAPER, YEAR]
    );
    const existing = parseInt(check.rows[0].count, 10);
    if (existing > 0) {
      console.log(`⚠️  ${existing} questions already exist for LIT paper ${PAPER} year ${YEAR}. Skipping to avoid duplicates.`);
      console.log("   To re-seed, first delete: DELETE FROM questions WHERE subject_id=5 AND paper='002' AND year=2024;");
      return;
    }

    let inserted = 0;

    // Insert MCQ
    for (const q of mcq) {
      await client.query(
        `INSERT INTO questions (subject_id, paper, year, question_type, question_text, options, correct_option, explanation, marks)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [SUBJECT_ID, PAPER, YEAR, "objective", q.questionText, JSON.stringify(q.options), q.correctOption, q.explanation, 1]
      );
      inserted++;
    }

    // Insert Theory
    for (const q of theory) {
      await client.query(
        `INSERT INTO questions (subject_id, paper, year, question_type, question_text, marking_guide, marks)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [SUBJECT_ID, PAPER, YEAR, "theory", q.questionText, q.markingGuide, q.marks]
      );
      inserted++;
    }

    console.log(`✅ Inserted ${inserted} questions (${mcq.length} MCQ + ${theory.length} theory).`);
    console.log(`   Subject: Literature in English (ID ${SUBJECT_ID})`);
    console.log(`   Paper: ${PAPER} — 1st Semester Exam | Year: ${YEAR}`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error("❌ Error:", err.message); process.exit(1); });
