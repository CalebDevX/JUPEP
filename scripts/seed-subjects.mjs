import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@helium/heliumdb?sslmode=disable" });

const subjects = [
  {
    name: "Literature-in-English",
    code: "LIT",
    description: "JUPEB Literature-in-English covering prose, poetry, drama, and oral tradition.",
    paper_count: 4,
    color: "#8b5cf6",
  },
  {
    name: "Government",
    code: "GOV",
    description: "JUPEB Government covering political concepts, Nigeria governance, and international relations.",
    paper_count: 4,
    color: "#3b82f6",
  },
  {
    name: "CRS",
    code: "CRS",
    description: "JUPEB Christian Religious Studies covering Old Testament, New Testament, and Christian ethics.",
    paper_count: 4,
    color: "#10b981",
  },
];

// Sample questions for each subject
const questionsBySubject = {
  LIT: [
    {
      paper: "001",
      year: 2023,
      question_type: "objective",
      question_text: "Which of the following best describes the term 'denouement' in a literary work?",
      options: ["The opening scene that sets the mood", "The climax of the story where conflict peaks", "The resolution or outcome of the plot", "A technique used to create suspense"],
      correct_option: "C",
      explanation: "Denouement refers to the final resolution or outcome of a narrative after the climax.",
      marks: 1,
    },
    {
      paper: "001",
      year: 2023,
      question_type: "objective",
      question_text: "In poetry, a 'volta' refers to:",
      options: ["A pause within a line", "A turning point or shift in thought", "The final couplet of a sonnet", "A pattern of stressed syllables"],
      correct_option: "B",
      explanation: "A volta is a turn or shift in the argument or emotion of a poem, most commonly seen in sonnets.",
      marks: 1,
    },
    {
      paper: "001",
      year: 2023,
      question_type: "objective",
      question_text: "Which literary device involves attributing human qualities to non-human entities?",
      options: ["Simile", "Metaphor", "Personification", "Hyperbole"],
      correct_option: "C",
      explanation: "Personification is a figure of speech where human characteristics are attributed to animals, objects, or abstract ideas.",
      marks: 1,
    },
    {
      paper: "001",
      year: 2023,
      question_type: "objective",
      question_text: "The term 'catharsis' in literature means:",
      options: ["A sudden reversal of fortune", "Emotional purification through art", "An extended metaphor", "A tragic hero's fatal flaw"],
      correct_option: "B",
      explanation: "Catharsis, coined by Aristotle, refers to the purging or purification of emotions — particularly pity and fear — that an audience experiences through witnessing tragedy.",
      marks: 1,
    },
    {
      paper: "002",
      year: 2023,
      question_type: "objective",
      question_text: "An 'omniscient narrator' is one who:",
      options: ["Tells the story from a first-person perspective", "Has limited knowledge of characters' thoughts", "Knows everything about all characters and events", "Is a character participating in the story"],
      correct_option: "C",
      explanation: "An omniscient narrator has complete knowledge of all events, characters, and their inner thoughts in the story.",
      marks: 1,
    },
    {
      paper: "002",
      year: 2023,
      question_type: "objective",
      question_text: "Which of the following is NOT a feature of oral literature?",
      options: ["Audience participation", "Written preservation", "Communal ownership", "Performance element"],
      correct_option: "B",
      explanation: "Oral literature is transmitted verbally and does not rely on written preservation. It is communal, performative, and involves audience participation.",
      marks: 1,
    },
    {
      paper: "003",
      year: 2023,
      question_type: "objective",
      question_text: "'In Medias Res' as a narrative technique means starting:",
      options: ["At the very beginning of events", "In the middle of the action", "With a flashback sequence", "At the climax of the story"],
      correct_option: "B",
      explanation: "In medias res is a Latin phrase meaning 'in the middle of things.' It refers to the technique of beginning a narrative in the middle of the action.",
      marks: 1,
    },
    {
      paper: "003",
      year: 2023,
      question_type: "objective",
      question_text: "A 'foil' character in literature serves to:",
      options: ["Drive the main plot forward", "Contrast with another character to highlight their traits", "Provide comic relief", "Act as the narrator of events"],
      correct_option: "B",
      explanation: "A foil is a character who contrasts with another character — usually the protagonist — to highlight particular qualities of that character.",
      marks: 1,
    },
  ],
  GOV: [
    {
      paper: "001",
      year: 2023,
      question_type: "objective",
      question_text: "The concept of 'separation of powers' was originally articulated by:",
      options: ["John Locke", "Jean-Jacques Rousseau", "Montesquieu", "Thomas Hobbes"],
      correct_option: "C",
      explanation: "Montesquieu, in his work 'The Spirit of the Laws' (1748), developed the doctrine of separation of powers into three branches: executive, legislative, and judicial.",
      marks: 1,
    },
    {
      paper: "001",
      year: 2023,
      question_type: "objective",
      question_text: "Nigeria operates which type of government system?",
      options: ["Unitary system", "Confederate system", "Federal system", "Parliamentary system"],
      correct_option: "C",
      explanation: "Nigeria operates a federal system of government where powers are shared between the central (federal) government and the state governments.",
      marks: 1,
    },
    {
      paper: "001",
      year: 2023,
      question_type: "objective",
      question_text: "The Nigerian Constitution that introduced the presidential system was the:",
      options: ["1960 Constitution", "1963 Republican Constitution", "1979 Constitution", "1999 Constitution"],
      correct_option: "C",
      explanation: "The 1979 Constitution introduced the presidential system of government in Nigeria, replacing the parliamentary system of the First Republic.",
      marks: 1,
    },
    {
      paper: "001",
      year: 2023,
      question_type: "objective",
      question_text: "Which of the following best defines 'sovereignty'?",
      options: ["The power of citizens to vote in elections", "The supreme and absolute authority of a state", "The relationship between government and citizens", "The ability to conduct foreign policy"],
      correct_option: "B",
      explanation: "Sovereignty refers to the supreme, absolute, and uncontrollable power by which any independent state is governed.",
      marks: 1,
    },
    {
      paper: "002",
      year: 2023,
      question_type: "objective",
      question_text: "The principle of 'judicial review' means:",
      options: ["Courts can arrest members of the executive", "The power of courts to declare laws unconstitutional", "Judges can be reviewed by the legislature", "The president can overrule court decisions"],
      correct_option: "B",
      explanation: "Judicial review is the power of courts to examine the actions of the legislative and executive branches and to determine whether such actions are consistent with the constitution.",
      marks: 1,
    },
    {
      paper: "002",
      year: 2023,
      question_type: "objective",
      question_text: "ECOWAS was established in:",
      options: ["1963", "1975", "1981", "1990"],
      correct_option: "B",
      explanation: "The Economic Community of West African States (ECOWAS) was established on May 28, 1975, through the Treaty of Lagos.",
      marks: 1,
    },
    {
      paper: "003",
      year: 2023,
      question_type: "objective",
      question_text: "A bicameral legislature consists of:",
      options: ["One chamber with equal representation", "Two separate legislative chambers", "Three separate houses of government", "A joint sitting of all legislators"],
      correct_option: "B",
      explanation: "A bicameral legislature is one that has two separate houses or chambers, such as Nigeria's National Assembly comprising the Senate and House of Representatives.",
      marks: 1,
    },
    {
      paper: "003",
      year: 2023,
      question_type: "objective",
      question_text: "The United Nations was founded in:",
      options: ["1939", "1945", "1948", "1955"],
      correct_option: "B",
      explanation: "The United Nations was founded on October 24, 1945, after World War II, replacing the League of Nations.",
      marks: 1,
    },
  ],
  CRS: [
    {
      paper: "001",
      year: 2023,
      question_type: "objective",
      question_text: "The first book of the Bible is:",
      options: ["Exodus", "Deuteronomy", "Genesis", "Leviticus"],
      correct_option: "C",
      explanation: "Genesis is the first book of the Bible and covers creation, the fall of man, the flood, and the beginnings of the nation of Israel.",
      marks: 1,
    },
    {
      paper: "001",
      year: 2023,
      question_type: "objective",
      question_text: "The Sermon on the Mount is recorded in which Gospel?",
      options: ["Mark", "Luke", "John", "Matthew"],
      correct_option: "D",
      explanation: "The Sermon on the Mount is found in Matthew 5-7 and contains core teachings of Jesus including the Beatitudes and the Lord's Prayer.",
      marks: 1,
    },
    {
      paper: "001",
      year: 2023,
      question_type: "objective",
      question_text: "Which prophet said: 'The soul that sinneth, it shall die'?",
      options: ["Isaiah", "Jeremiah", "Ezekiel", "Amos"],
      correct_option: "C",
      explanation: "This statement is found in Ezekiel 18:4 and 18:20, where Ezekiel emphasizes individual moral responsibility.",
      marks: 1,
    },
    {
      paper: "001",
      year: 2023,
      question_type: "objective",
      question_text: "The concept of the 'New Covenant' was prophesied by:",
      options: ["Moses", "Jeremiah", "Isaiah", "Ezra"],
      correct_option: "B",
      explanation: "Jeremiah 31:31-34 contains the prophecy of the New Covenant, which was later fulfilled in Jesus Christ according to Christian theology.",
      marks: 1,
    },
    {
      paper: "002",
      year: 2023,
      question_type: "objective",
      question_text: "The Council of Jerusalem (Acts 15) was called primarily to resolve:",
      options: ["Leadership disputes among apostles", "The question of Gentile circumcision and the Law of Moses", "Persecution of early Christians by Rome", "The collection for Jerusalem church"],
      correct_option: "B",
      explanation: "The Council of Jerusalem addressed the question of whether Gentile converts to Christianity needed to be circumcised and follow Mosaic Law.",
      marks: 1,
    },
    {
      paper: "002",
      year: 2023,
      question_type: "objective",
      question_text: "According to Paul in 1 Corinthians 13, the greatest virtue is:",
      options: ["Faith", "Hope", "Love", "Wisdom"],
      correct_option: "C",
      explanation: "1 Corinthians 13:13 states: 'And now abideth faith, hope, charity (love), these three; but the greatest of these is charity (love).'",
      marks: 1,
    },
    {
      paper: "003",
      year: 2023,
      question_type: "objective",
      question_text: "The Exodus from Egypt is primarily a demonstration of God's:",
      options: ["Wrath against nations", "Deliverance and covenant faithfulness", "Preference for the Jewish race", "Punishment of Pharaoh alone"],
      correct_option: "B",
      explanation: "The Exodus demonstrates God's deliverance of His people and His faithfulness to the covenant made with Abraham, Isaac, and Jacob.",
      marks: 1,
    },
    {
      paper: "003",
      year: 2023,
      question_type: "objective",
      question_text: "The Pentateuch refers to:",
      options: ["The first five books of the New Testament", "The five Psalms of Solomon", "The first five books of the Old Testament", "The five major prophets"],
      correct_option: "C",
      explanation: "The Pentateuch refers to the first five books of the Old Testament: Genesis, Exodus, Leviticus, Numbers, and Deuteronomy.",
      marks: 1,
    },
  ],
};

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Seeding subjects...");
    const subjectIds = {};

    for (const sub of subjects) {
      const existing = await client.query("SELECT id FROM subjects WHERE code = $1", [sub.code]);
      if (existing.rows.length > 0) {
        subjectIds[sub.code] = existing.rows[0].id;
        console.log(`  Subject ${sub.name} already exists (id=${subjectIds[sub.code]})`);
        continue;
      }
      const result = await client.query(
        "INSERT INTO subjects (name, code, description, paper_count, color) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [sub.name, sub.code, sub.description, sub.paper_count, sub.color]
      );
      subjectIds[sub.code] = result.rows[0].id;
      console.log(`  Inserted subject ${sub.name} (id=${subjectIds[sub.code]})`);
    }

    console.log("Seeding questions...");
    let total = 0;
    for (const [code, questions] of Object.entries(questionsBySubject)) {
      const subjectId = subjectIds[code];
      for (const q of questions) {
        const check = await client.query(
          "SELECT id FROM questions WHERE subject_id=$1 AND question_text=$2 LIMIT 1",
          [subjectId, q.question_text]
        );
        if (check.rows.length > 0) continue;
        await client.query(
          `INSERT INTO questions (subject_id, paper, year, question_type, question_text, options, correct_option, explanation, marks)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [subjectId, q.paper, q.year, q.question_type, q.question_text,
           JSON.stringify(q.options), q.correct_option, q.explanation, q.marks]
        );
        total++;
      }
    }
    console.log(`  Inserted ${total} questions`);

    // Seed announcements
    const annCheck = await client.query("SELECT id FROM announcements LIMIT 1");
    if (annCheck.rows.length === 0) {
      await client.query(
        `INSERT INTO announcements (title, content, is_pinned, priority) VALUES ($1, $2, $3, $4)`,
        ["Welcome to JUPEB Law Prep!", "Start with your daily challenge on the dashboard. Every correct answer earns XP toward your level. Good luck on your journey to 16 points! 🎯", true, "high"]
      );
      console.log("  Inserted welcome announcement");
    }

    console.log("Seeding complete!");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => { console.error("Seed error:", err); process.exit(1); });
