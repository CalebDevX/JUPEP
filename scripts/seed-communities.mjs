import pg from "/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js";
const { Pool } = pg;

const pool = new Pool({ connectionString: "postgresql://postgres:password@helium/heliumdb?sslmode=disable" });

const communities = [
  {
    name: "Benzene Tutorials",
    slug: "benzene-tutorials",
    description: "Official tutorial centre for JUPEB Foundation Studies students at UNILAG. We offer intensive classes, study materials, and exam prep for all subjects.",
    type: "tutorial_center",
    coverColor: "#f59e0b",
    coverEmoji: "🔬",
    whatsappNumber: "+2348012345678",
    website: "https://benzenetutorials.org",
    verified: true,
    requiresApproval: true,
    memberCount: 340,
    postCount: 120,
    adminName: "Benzene Admin",
  },
  {
    name: "16 Points Gang 🎯",
    slug: "16-points-gang",
    description: "A dedicated study group for students going all out for the maximum 16 points. We share notes, quiz each other, and keep each other accountable.",
    type: "study_group",
    coverColor: "#8b5cf6",
    coverEmoji: "🎯",
    whatsappNumber: null,
    website: null,
    verified: false,
    requiresApproval: false,
    memberCount: 89,
    postCount: 45,
    adminName: "Chidi Eze",
  },
  {
    name: "JUPEB Scholars Hub",
    slug: "jupeb-scholars-hub",
    description: "An open community for all JUPEB students. Share resources, ask questions, discuss subjects, and support each other on the journey to university.",
    type: "general",
    coverColor: "#0ea5e9",
    coverEmoji: "🌟",
    whatsappNumber: null,
    website: null,
    verified: false,
    requiresApproval: false,
    memberCount: 612,
    postCount: 280,
    adminName: "Scholars Hub Admin",
  },
  {
    name: "UNILAG Aspirants 2026",
    slug: "unilag-aspirants-2026",
    description: "For students aiming to gain direct entry into UNILAG through the Foundation Studies programme. Share tips, results, and advice for making it into UNILAG.",
    type: "study_group",
    coverColor: "#10b981",
    coverEmoji: "🏛️",
    whatsappNumber: null,
    website: null,
    verified: false,
    requiresApproval: false,
    memberCount: 234,
    postCount: 98,
    adminName: "UNILAG Dreams",
  },
  {
    name: "Law & Arts Tutorial Kings",
    slug: "law-arts-tutorial-kings",
    description: "Premium tutorial centre specializing in the Law & Arts pathway — Literature, Government, and CRS. Small classes, proven results, personal attention.",
    type: "tutorial_center",
    coverColor: "#ec4899",
    coverEmoji: "⚖️",
    whatsappNumber: "+2348098765432",
    website: null,
    verified: true,
    requiresApproval: true,
    memberCount: 156,
    postCount: 67,
    adminName: "Tutorial Kings",
  },
];

const starterPosts = [
  {
    authorName: "Chidera Okonkwo",
    content: "Just finished the Government past questions for 2022 paper. Section B on Constitutional Development is very likely to come up again. Who wants me to share my notes?",
    likeCount: 17,
  },
  {
    authorName: "Aisha Bello",
    content: "The Literature in English paper is no joke. Reading Things Fall Apart for the 3rd time and keep finding new themes. Anyone want to do a study session this weekend?",
    likeCount: 12,
  },
  {
    authorName: "Emeka Nwosu",
    content: "Quick tip for CRS: Learn all the dates and names of church councils cold. The examiner loves them. I just missed 3 marks on that in my last mock because of dates.",
    likeCount: 24,
  },
  {
    authorName: "Fatima Lawal",
    content: "Does anyone have the UNILAG direct entry cut-off marks for Law? I am targeting AAA+1 but want to be safe. Please share if you know!",
    likeCount: 8,
  },
];

async function seed() {
  for (const c of communities) {
    const existing = await pool.query("SELECT id FROM communities WHERE slug = $1", [c.slug]);
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO communities (name, slug, description, type, cover_color, cover_emoji, whatsapp_number, website, verified, requires_approval, member_count, post_count, admin_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [c.name, c.slug, c.description, c.type, c.coverColor, c.coverEmoji, c.whatsappNumber, c.website, c.verified, c.requiresApproval, c.memberCount, c.postCount, c.adminName],
      );
      console.log("Seeded:", c.name);
    } else {
      console.log("Already exists:", c.name);
    }
  }

  const hub = await pool.query("SELECT id FROM communities WHERE slug = $1", ["jupeb-scholars-hub"]);
  if (hub.rows.length > 0) {
    const hubId = hub.rows[0].id;
    const existingPosts = await pool.query("SELECT id FROM community_posts WHERE community_id = $1", [hubId]);
    if (existingPosts.rows.length === 0) {
      for (const p of starterPosts) {
        await pool.query(
          "INSERT INTO community_posts (community_id, author_name, content, like_count, comment_count) VALUES ($1, $2, $3, $4, $5)",
          [hubId, p.authorName, p.content, p.likeCount, 0],
        );
      }
      console.log("Seeded starter posts for JUPEB Scholars Hub");
    } else {
      console.log("Posts already exist for JUPEB Scholars Hub");
    }
  }

  await pool.end();
  console.log("Done!");
}

seed().catch((e) => { console.error(e); process.exit(1); });
