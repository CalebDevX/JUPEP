import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@helium/heliumdb?sslmode=disable"
});

// Realistic Nigerian student names for UNILAG Foundation Studies
const students = [
  { full_name: "Chidera Okafor",       phone: "08031001001", subjects: ["Physics", "Chemistry", "Mathematics"],          target_grade: "aaa1", xp: 4820, streak: 34 },
  { full_name: "Adaeze Nwosu",         phone: "08031001002", subjects: ["Literature-in-English", "Government", "CRS"],   target_grade: "aaa1", xp: 4510, streak: 28 },
  { full_name: "Emeka Eze",            phone: "08031001003", subjects: ["Physics", "Chemistry", "Biology"],              target_grade: "aaa1", xp: 4200, streak: 31 },
  { full_name: "Fatima Aliyu",         phone: "08031001004", subjects: ["Economics", "Government", "Mathematics"],       target_grade: "aaa1", xp: 3980, streak: 22 },
  { full_name: "Tunde Adeyemi",        phone: "08031001005", subjects: ["Physics", "Mathematics", "Chemistry"],          target_grade: "aaa2", xp: 3750, streak: 19 },
  { full_name: "Ngozi Obi",            phone: "08031001006", subjects: ["Literature-in-English", "Economics", "Government"], target_grade: "aaa1", xp: 3640, streak: 25 },
  { full_name: "Seun Afolabi",         phone: "08031001007", subjects: ["Biology", "Chemistry", "Physics"],              target_grade: "aaa2", xp: 3420, streak: 17 },
  { full_name: "Amina Bello",          phone: "08031001008", subjects: ["Economics", "Government", "Mathematics"],       target_grade: "aaa1", xp: 3310, streak: 21 },
  { full_name: "Obinna Chukwu",        phone: "08031001009", subjects: ["Physics", "Chemistry", "Mathematics"],          target_grade: "aaa2", xp: 3190, streak: 14 },
  { full_name: "Precious Ojo",         phone: "08031001010", subjects: ["Literature-in-English", "CRS", "Government"],   target_grade: "aaa1", xp: 3050, streak: 18 },
  { full_name: "Kelechi Anyanwu",      phone: "08031001011", subjects: ["Biology", "Chemistry", "Physics"],              target_grade: "aaa2", xp: 2940, streak: 12 },
  { full_name: "Halima Musa",          phone: "08031001012", subjects: ["Economics", "Mathematics", "Government"],       target_grade: "aaa1", xp: 2810, streak: 16 },
  { full_name: "Damilola Bakare",      phone: "08031001013", subjects: ["Physics", "Chemistry", "Mathematics"],          target_grade: "aaa2", xp: 2700, streak: 11 },
  { full_name: "Ifeoma Okonkwo",       phone: "08031001014", subjects: ["Literature-in-English", "Government", "Economics"], target_grade: "aaa1", xp: 2590, streak: 20 },
  { full_name: "Yusuf Ibrahim",        phone: "08031001015", subjects: ["Physics", "Mathematics", "Chemistry"],          target_grade: "aaa2", xp: 2480, streak: 9  },
  { full_name: "Blessing Nwachukwu",   phone: "08031001016", subjects: ["Biology", "Chemistry", "Physics"],              target_grade: "aaa1", xp: 2370, streak: 15 },
  { full_name: "Oluwaseun Oladele",    phone: "08031001017", subjects: ["Economics", "Government", "Literature-in-English"], target_grade: "aaa2", xp: 2260, streak: 8  },
  { full_name: "Chiamaka Ugwu",        phone: "08031001018", subjects: ["Physics", "Chemistry", "Biology"],              target_grade: "aaa1", xp: 2150, streak: 13 },
  { full_name: "Abdulrahman Sule",     phone: "08031001019", subjects: ["Mathematics", "Economics", "Government"],       target_grade: "aaa2", xp: 2040, streak: 7  },
  { full_name: "Adeola Fashola",       phone: "08031001020", subjects: ["Literature-in-English", "CRS", "Economics"],    target_grade: "aaa1", xp: 1950, streak: 11 },
  { full_name: "Nnamdi Okereke",       phone: "08031001021", subjects: ["Physics", "Chemistry", "Mathematics"],          target_grade: "aaa2", xp: 1860, streak: 6  },
  { full_name: "Zainab Umar",          phone: "08031001022", subjects: ["Biology", "Chemistry", "Mathematics"],          target_grade: "aaa1", xp: 1770, streak: 10 },
  { full_name: "Taiwo Salami",         phone: "08031001023", subjects: ["Government", "Economics", "Literature-in-English"], target_grade: "aaa2", xp: 1690, streak: 5  },
  { full_name: "Onyinye Nwofor",       phone: "08031001024", subjects: ["Physics", "Biology", "Chemistry"],              target_grade: "aaa1", xp: 1610, streak: 9  },
  { full_name: "Kehinde Bankole",      phone: "08031001025", subjects: ["Mathematics", "Physics", "Chemistry"],          target_grade: "aaa2", xp: 1530, streak: 4  },
  { full_name: "Adaobi Okeke",         phone: "08031001026", subjects: ["CRS", "Literature-in-English", "Government"],   target_grade: "aaa1", xp: 1450, streak: 8  },
  { full_name: "Musa Garba",           phone: "08031001027", subjects: ["Economics", "Mathematics", "Government"],       target_grade: "aaa2", xp: 1380, streak: 3  },
  { full_name: "Ifunanya Chinedu",     phone: "08031001028", subjects: ["Biology", "Chemistry", "Physics"],              target_grade: "aaa1", xp: 1310, streak: 7  },
  { full_name: "Rotimi Adesanya",      phone: "08031001029", subjects: ["Physics", "Mathematics", "Chemistry"],          target_grade: "aaa2", xp: 1240, streak: 5  },
  { full_name: "Nneka Okafor",         phone: "08031001030", subjects: ["Literature-in-English", "Economics", "CRS"],    target_grade: "aaa1", xp: 1170, streak: 6  },
  { full_name: "Bashir Abdullahi",     phone: "08031001031", subjects: ["Mathematics", "Physics", "Chemistry"],          target_grade: "aaa2", xp: 1100, streak: 4  },
  { full_name: "Chinyere Nze",         phone: "08031001032", subjects: ["Government", "Economics", "Mathematics"],       target_grade: "aaa1", xp: 1040, streak: 7  },
  { full_name: "Olumide Adeleke",      phone: "08031001033", subjects: ["Biology", "Chemistry", "Physics"],              target_grade: "aaa2", xp:  980, streak: 3  },
  { full_name: "Aisha Mohammed",       phone: "08031001034", subjects: ["Economics", "Government", "Literature-in-English"], target_grade: "aaa1", xp:  920, streak: 5  },
  { full_name: "Chukwuemeka Agu",      phone: "08031001035", subjects: ["Physics", "Chemistry", "Mathematics"],          target_grade: "aaa2", xp:  860, streak: 2  },
  { full_name: "Toluwani Obi",         phone: "08031001036", subjects: ["Literature-in-English", "CRS", "Government"],   target_grade: "aaa1", xp:  800, streak: 4  },
  { full_name: "Fatimah Lawal",        phone: "08031001037", subjects: ["Mathematics", "Economics", "Government"],       target_grade: "aaa2", xp:  745, streak: 3  },
  { full_name: "Chidi Nwankwo",        phone: "08031001038", subjects: ["Biology", "Physics", "Chemistry"],              target_grade: "aaa1", xp:  690, streak: 2  },
  { full_name: "Sade Ogundimu",        phone: "08031001039", subjects: ["Literature-in-English", "Government", "Economics"], target_grade: "aaa2", xp:  635, streak: 4  },
  { full_name: "Emeka Obi",            phone: "08031001040", subjects: ["Physics", "Chemistry", "Mathematics"],          target_grade: "aaa1", xp:  580, streak: 2  },
  { full_name: "Ngozi Eze",            phone: "08031001041", subjects: ["CRS", "Literature-in-English", "Government"],   target_grade: "aaa2", xp:  525, streak: 3  },
  { full_name: "Bello Usman",          phone: "08031001042", subjects: ["Mathematics", "Physics", "Economics"],          target_grade: "aaa1", xp:  470, streak: 1  },
  { full_name: "Amara Chukwu",         phone: "08031001043", subjects: ["Biology", "Chemistry", "Physics"],              target_grade: "aaa2", xp:  420, streak: 2  },
  { full_name: "Olusegun Adetokunbo",  phone: "08031001044", subjects: ["Government", "Economics", "Literature-in-English"], target_grade: "aaa1", xp:  370, streak: 1  },
  { full_name: "Chioma Okonkwo",       phone: "08031001045", subjects: ["Physics", "Mathematics", "Chemistry"],          target_grade: "aaa2", xp:  320, streak: 2  },
  { full_name: "Hauwa Yusuf",          phone: "08031001046", subjects: ["Economics", "Government", "Mathematics"],       target_grade: "aaa1", xp:  270, streak: 1  },
  { full_name: "Gbenga Olatunji",      phone: "08031001047", subjects: ["Literature-in-English", "CRS", "Economics"],    target_grade: "aaa2", xp:  220, streak: 1  },
  { full_name: "Adunola Oyelaran",     phone: "08031001048", subjects: ["Biology", "Chemistry", "Mathematics"],          target_grade: "aaa1", xp:  175, streak: 1  },
  { full_name: "Chizaram Obiora",      phone: "08031001049", subjects: ["Physics", "Chemistry", "Biology"],              target_grade: "aaa2", xp:  125, streak: 1  },
  { full_name: "Temilade Adeyinka",    phone: "08031001050", subjects: ["Government", "Economics", "Literature-in-English"], target_grade: "aaa1", xp:   75, streak: 1  },
];

// Generate realistic quiz attempts for a student based on their XP
function generateAttempts(phone, xp) {
  const attempts = [];
  // Rough estimate: each quiz gives ~40 XP on average, so attempts ≈ xp / 40
  const count = Math.max(1, Math.floor(xp / 40) + Math.floor(Math.random() * 3));
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 60); // spread over last 2 months
    const attemptDate = new Date(now);
    attemptDate.setDate(now.getDate() - daysAgo);

    const questionCount = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
    // Higher XP students tend to score better
    const baseAccuracy = Math.min(0.95, 0.45 + (xp / 10000));
    const jitter = (Math.random() - 0.5) * 0.3;
    const accuracy = Math.max(0.2, Math.min(1.0, baseAccuracy + jitter));
    const score = Math.round(questionCount * accuracy);
    const percentage = parseFloat((accuracy * 100).toFixed(1));
    // Realistic time: at least 30s per question, up to 3 minutes per question
    const timeSpent = questionCount * (30 + Math.floor(Math.random() * 150));

    attempts.push({ phone, score, questionCount, percentage, timeSpent, attemptDate });
  }
  return attempts;
}

async function seed() {
  const client = await pool.connect();
  try {
    let inserted = 0;
    let skipped = 0;

    console.log(`Seeding ${students.length} demo students...`);

    for (const s of students) {
      const existing = await client.query(
        "SELECT id FROM students WHERE phone = $1",
        [s.phone]
      );
      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }

      const lastActive = new Date();
      lastActive.setDate(lastActive.getDate() - Math.floor(Math.random() * 2));

      await client.query(
        `INSERT INTO students
           (full_name, phone, subjects, target_grade, xp, streak, last_active,
            is_active, payment_status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, 'paid', NOW() - INTERVAL '1 day' * $8)`,
        [
          s.full_name,
          s.phone,
          JSON.stringify(s.subjects),
          s.target_grade,
          s.xp,
          s.streak,
          lastActive.toISOString().split("T")[0],
          Math.floor(Math.random() * 90) + 1, // joined 1–90 days ago
        ]
      );
      inserted++;
    }

    console.log(`  Students: ${inserted} inserted, ${skipped} already existed`);

    // Seed quiz attempts
    console.log("Seeding quiz attempts...");
    let attemptCount = 0;

    // Check if quiz_sessions or quiz_attempts table exists
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('quiz_attempts', 'quiz_sessions')
    `);
    const tables = tableCheck.rows.map(r => r.table_name);
    console.log("  Found tables:", tables.join(", "));

    // Get available subject IDs for realistic quiz sessions
    const subjectResult = await client.query("SELECT id FROM subjects LIMIT 10");
    const subjectIds = subjectResult.rows.map(r => r.id);

    if (tables.includes("quiz_sessions") && subjectIds.length > 0) {
      for (const s of students) {
        const existing = await client.query(
          "SELECT id FROM students WHERE phone = $1",
          [s.phone]
        );
        if (existing.rows.length === 0) continue;

        const attempts = generateAttempts(s.phone, s.xp);
        for (const a of attempts) {
          const subjectId = subjectIds[Math.floor(Math.random() * subjectIds.length)];
          const questionCount = a.questionCount;
          const score = a.score;
          const percentage = a.percentage;

          // Build dummy answers array
          const answers = Array.from({ length: questionCount }, (_, i) => ({
            questionId: i + 1,
            selected: ["A","B","C","D"][Math.floor(Math.random() * 4)],
            correct: Math.random() < (percentage / 100),
          }));

          await client.query(
            `INSERT INTO quiz_sessions
               (subject_id, paper, question_type, question_ids, status,
                score, total_marks, percentage, timed_minutes, answers,
                created_at, completed_at, exam_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              subjectId,
              "001",
              "objective",
              JSON.stringify([]),
              "completed",
              score,
              questionCount,
              percentage,
              Math.ceil(questionCount * 1.5),
              JSON.stringify(answers),
              a.attemptDate,
              a.attemptDate,
              "practice",
            ]
          );
          attemptCount++;
        }
      }
      console.log(`  Inserted ${attemptCount} quiz sessions`);
    } else {
      console.log("  Skipping quiz sessions (no subjects or table not found)");
    }

    console.log("\nLeaderboard seed complete!");
    console.log(`Total demo students in DB: ${inserted + skipped}`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error("Seed error:", err.message);
  process.exit(1);
});
