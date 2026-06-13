export const crs001 = {
  code: "CRS 001",
  title: "Old Testament Studies: History and Religion of Israel",
  units: 3,
  semester: "First Semester",
  color: "amber",
  colorClass: "bg-amber-700",
  lightClass: "bg-amber-50",
  borderClass: "border-amber-700",
  textClass: "text-amber-800",
  description:
    "This course traces the formation of the Old Testament, the rise of Israel as a nation, the establishment and fall of the monarchy, the division of the kingdom, and the rise of prophecy. It covers key figures including Abraham, Moses, Saul, David, Solomon, Isaiah, Hosea and Amos.",
  objectives: [
    "Explain the term 'inspiration' and analyze the process of canonization of the Old Testament.",
    "Highlight the genre of Old Testament literature and discuss the issues involved in the documentary hypotheses.",
    "Evaluate how the nation of Israel started, examine the factors that gave birth to the monarchy, and mention the roles of notable Kings (Saul, David and Solomon).",
    "Give a detailed description of the events that led to the Divided Kingdom.",
    "Appraise prophecy in Israel and the influence of Prophets Isaiah, Hosea and Amos and their relevance to nation building.",
  ],
  chapters: [
    {
      id: "crs001-ch1",
      number: 1,
      title: "Formation and Composition of the Old Testament",
      sections: [
        {
          heading: "1.1 Biblical Inspiration",
          content: `The term **"inspiration"** as applied to the Old Testament refers to the divine influence through which the human authors of Scripture were moved to write what God intended to communicate. The Greek word *theopneustos* (2 Timothy 3:16) — literally "God-breathed" — captures the essence of biblical inspiration: the Scriptures did not originate from mere human thought but from God himself speaking through human writers.

Inspiration does not mean the authors were robots mechanically dictating words they did not understand. Rather, God worked through their personalities, styles, backgrounds, and experiences to produce writings that are simultaneously fully human and fully divine. This is sometimes called the "organic" view of inspiration — God used the total personality of the writer.

**Why Inspiration Matters**
The doctrine of inspiration is fundamental to Christian theology because it underpins the authority, reliability, and trustworthiness of the Bible. If the Scriptures are God-breathed, then they carry divine authority and are the final standard for faith and practice. For JUPEB students, understanding inspiration is the entry point for appreciating why the Old Testament is considered sacred Scripture and not merely ancient literature.`,
        },
        {
          heading: "1.2 Theories of Inspiration",
          content: `Several theories have been proposed to explain how divine inspiration operated. Each captures different aspects of the relationship between God and the human authors.

**1. Dictation Theory (Mechanical Inspiration)**
This view holds that God verbally dictated every word to the human writers who acted as passive secretaries. Proponents point to texts where God literally speaks (e.g., the Ten Commandments in Exodus 20) and to prophetic formulas like "Thus says the LORD." 

*Strengths:* Preserves absolute divine authority over every word.  
*Weaknesses:* Does not account for the obvious differences in literary style between authors (compare Isaiah's majestic poetry with Amos's rural imagery), nor for the fact that writers like Luke explicitly state they did research (Luke 1:1–4).

**2. Verbal Plenary Inspiration**
This is the most widely held conservative view. It holds that inspiration extends to the very words (*verbal*) of Scripture and to all parts of it (*plenary* = full). Every word in its original autograph is God-given, yet the personality of the human author was fully engaged.

*Key proponent:* B.B. Warfield. This view affirms both divine authorship and human instrumentality.

**3. Dynamic (Content/Thought) Theory**
God inspired the *thoughts* of the authors but left the choice of words to them. The ideas are divinely given; the language is human.

*Strengths:* Explains literary diversity.  
*Weaknesses:* Creates a gap between "God's thoughts" and the human words used to express them — difficult to separate thought from language.

**4. Neo-Orthodox Theory**
Associated with Karl Barth, this view holds that the Bible becomes the Word of God in the moment it encounters the reader existentially. The Bible *contains* the Word of God but is not identical with it — it is a human witness to divine revelation.

*Strengths:* Takes human fallibility seriously.  
*Weaknesses:* Makes Scripture's authority subjective and experiential rather than objective.

**5. Limited (Partial) Inspiration Theory**
This view holds that only certain portions of Scripture are inspired — particularly in matters of faith and doctrine — while historical or scientific statements may contain errors.

*Strengths:* Attempts to reconcile Scripture with science/history.  
*Weaknesses:* Creates an arbitrary standard for deciding what is inspired; undermines the unified authority of Scripture.`,
        },
        {
          heading: "1.3 Canonization of the Old Testament",
          content: `**Meaning of "Canon"**
The word *canon* derives from the Greek *kanon* (measuring rod or rule). In biblical studies, canon refers to the authoritative collection of books recognized as Holy Scripture. A book that is "canonical" is one that has been accepted by the believing community as normative for faith and conduct.

The canon is not merely a list; it is a recognition that these books carry divine authority. The Church did not *create* the canon — it *discovered* or *recognized* what God had already inspired.

**The Process of Old Testament Canonization**
The canonization of the Hebrew Bible was a lengthy process spanning many centuries:

- **Pre-Exilic Period:** The Torah (Law of Moses) functioned as Scripture from earliest times. The Book of the Law found in the Temple during Josiah's reign (2 Kings 22) was treated with immediate reverence.
- **Post-Exilic Period:** After the Babylonian exile (c. 586–538 BC), the Jewish community became increasingly focused on their written Scriptures as the center of religious life — especially since the Temple had been destroyed.
- **Council of Jamnia (c. AD 90):** Jewish rabbis debated and formally recognized the boundaries of the Hebrew canon, settling disputed books like Ecclesiastes and Song of Solomon.

**Criteria for Canonization**
The Jews used several criteria to determine which books were canonical:
1. **Divine authority** — Did the book claim to speak with God's authority?
2. **Mosaic or Prophetic authorship** — Was it written by Moses or an accredited prophet?
3. **Doctrinal consistency** — Did it agree with the Torah and other accepted Scripture?
4. **Universal acceptance** — Was it recognized and used across the Jewish community?
5. **Transforming power** — Did the Spirit of God work through it?

**The Three Divisions of the Hebrew Canon**
The Hebrew Old Testament is organized into three sections (the *Tanakh*):
1. **Torah (Law):** Genesis, Exodus, Leviticus, Numbers, Deuteronomy — the five books of Moses.
2. **Nebi'im (Prophets):** Further divided into *Former Prophets* (Joshua, Judges, Samuel, Kings) and *Latter Prophets* (Isaiah, Jeremiah, Ezekiel, and the Twelve Minor Prophets).
3. **Ketuvim (Writings):** Psalms, Proverbs, Job, Song of Solomon, Ruth, Lamentations, Ecclesiastes, Esther, Daniel, Ezra, Nehemiah, Chronicles.`,
        },
        {
          heading: "1.4 Genre of Old Testament Literature",
          content: `**What is "Genre"?**
The term *genre* (from French, meaning "kind" or "type") refers to a category of literary composition characterized by a particular style, form, and content. Recognizing genre is crucial for accurate interpretation. Reading a psalm as if it were a history textbook, or reading a prophecy as if it were poetry, leads to misinterpretation.

**Major Literary Genres in the Old Testament**

**1. Historical Literature**
These books narrate the history of Israel from creation to the post-exilic period. They include the Pentateuch (Genesis–Deuteronomy), the Historical Books (Joshua, Judges, Ruth, Samuel, Kings, Chronicles, Ezra, Nehemiah, Esther). While written with theological intent (history interpreted from a faith perspective), they record actual events.

**2. Poetic Literature**
Hebrew poetry does not primarily use end-rhyme but features *parallelism* — the matching of ideas in successive lines. Major types:
- *Synonymous parallelism:* Second line repeats the first in different words (Psalm 19:1).
- *Antithetic parallelism:* Second line contrasts the first (Proverbs 10:1).
- *Synthetic parallelism:* Second line develops or completes the first.

Books: Psalms, Song of Solomon, Lamentations.

**3. Wisdom Literature**
Wisdom literature deals with practical and philosophical questions about life, suffering, and righteous living. It takes a reflective approach rather than a narrative one. Books: Job, Proverbs, Ecclesiastes. Key themes include the fear of the LORD as the beginning of wisdom, the problem of suffering (Job), and the vanity of earthly pursuits (Ecclesiastes).

**4. Prophetic Literature**
The prophetic books contain the messages of the prophets of Israel and Judah, typically delivered as oracles — declarations that begin "Thus says the LORD." They address contemporary sins, call for repentance, pronounce judgment, and hold out hope of restoration. Major Prophets: Isaiah, Jeremiah, Ezekiel, Daniel. Minor Prophets (twelve books from Hosea to Malachi).`,
        },
      ],
      summary: "The Old Testament is a divinely inspired collection of texts whose formation involved both the ongoing work of God (inspiration) and the historical process by which the community of faith recognized authoritative books (canonization). Understanding the literary genres of the OT — historical, poetic, wisdom, and prophetic — is essential for correct interpretation.",
      keyTerms: [
        { term: "Inspiration", definition: "The divine influence by which God moved human authors to write Scripture (2 Tim. 3:16 — 'God-breathed')." },
        { term: "Canon", definition: "The authoritative list of books recognized as Holy Scripture; from Greek kanon (measuring rod)." },
        { term: "Canonization", definition: "The historical process by which the believing community recognized which books belonged in Scripture." },
        { term: "Verbal Plenary Inspiration", definition: "The view that every word (verbal) of all Scripture (plenary) is divinely inspired." },
        { term: "Tanakh", definition: "The Hebrew acronym for the three divisions of the OT: Torah (Law), Nebi'im (Prophets), Ketuvim (Writings)." },
        { term: "Genre", definition: "A category of literary composition characterized by style, form, and content (e.g., historical, poetic, prophetic)." },
        { term: "Parallelism", definition: "The primary feature of Hebrew poetry, where ideas in successive lines are matched, contrasted, or developed." },
      ],
      practiceQuestions: [
        "Define the term 'inspiration' as it applies to the composition of the Old Testament and discuss any three theories of inspiration.",
        "What is the meaning of 'canon'? Describe the process of canonization of the Old Testament and state the criteria used.",
        "Identify and explain the three divisions of the Hebrew canon (Tanakh).",
        "Explain the term 'genre' and describe the four main types of literature found in the Old Testament.",
      ],
    },
    {
      id: "crs001-ch2",
      number: 2,
      title: "Israel's Nationhood: The Call of Abraham and Moses",
      sections: [
        {
          heading: "2.1 God's Call of Abraham",
          content: `**Background**
Before the call of Abraham, the world had plunged into widespread idolatry and moral chaos after the Fall in Eden, the judgment of the Flood, and the dispersion at Babel. God's redemptive response was to call one man through whom he would build a nation that would be a blessing to all nations.

Abraham (originally Abram) lived in Ur of the Chaldeans, a sophisticated city in Mesopotamia (modern Iraq). He was a descendant of Shem (Gen. 11:10–26) and was thus a Semite. His family worshipped other gods (Joshua 24:2).

**The Process of God's Call (Genesis 12:1–7)**
God's call of Abraham came in stages:
1. **Initial Call at Ur:** Acts 7:2–4 records that God first appeared to Abraham *"while he was still in Mesopotamia, before he lived in Haran."* The call was to leave his country, his people, and his father's household.
2. **The Promises:** God made a sevenfold promise:
   - I will make you a great nation
   - I will bless you
   - I will make your name great
   - You will be a blessing
   - I will bless those who bless you
   - I will curse those who curse you
   - All peoples on earth will be blessed through you (the Messianic promise, Galatians 3:8)
3. **The Journey:** Abraham departed from Haran at age 75, taking his wife Sarai, his nephew Lot, and all their possessions.
4. **Arrival in Canaan:** When Abraham reached Shechem, God appeared again and said, "To your offspring I will give this land" (Gen. 12:7). Abraham built an altar there.

**Significance of Abraham's Call**
- It marks the beginning of God's covenant relationship with a specific people.
- It inaugurates the history of salvation that culminates in Jesus Christ (Matthew 1:1 — "the son of Abraham").
- It demonstrates that salvation comes by faith — Abraham "believed God, and it was credited to him as righteousness" (Gen. 15:6; Romans 4:3).
- The land promise becomes the basis of Israel's later territorial claims.`,
        },
        {
          heading: "2.2 The Call of Moses",
          content: `**Historical Context**
Several centuries after Joseph's death, a new Pharaoh arose who "knew nothing about Joseph" (Exodus 1:8). The Israelites had multiplied so greatly that the Egyptians feared them and enslaved them. Pharaoh decreed the killing of all Hebrew male infants. Into this context Moses was born (c. 1526 BC).

Moses was saved by his mother, who placed him in a basket on the Nile. He was found by Pharaoh's daughter and raised as an Egyptian prince, while remaining nursed by his own mother. After killing an Egyptian who was beating a Hebrew, Moses fled to Midian (Exodus 2) where he married Zipporah and worked as a shepherd for his father-in-law Jethro for 40 years.

**Moses' Encounter with God at the Burning Bush (Exodus 3:1–18)**
At the age of 80, while tending flocks near Mount Horeb (Sinai), Moses encountered God in an extraordinary theophany — a burning bush that was not consumed. Key elements:

1. **God identifies himself:** "I am the God of your father, the God of Abraham, the God of Isaac and the God of Jacob" — connecting the new revelation to the Abrahamic covenant.
2. **The divine Name:** God reveals the name *YHWH* ("I AM WHO I AM" — Exodus 3:14). This name expresses God's self-existence, eternal being, and covenant faithfulness.
3. **The divine commission:** God sends Moses to deliver Israel from Egypt: "I am sending you to Pharaoh to bring my people the Israelites out of Egypt."
4. **Moses' objections:** Moses raises five objections (Who am I? What shall I say? What if they don't believe me? I am slow of speech. Please send someone else). God answers each with divine reassurance and miraculous signs.

**The Ten Commandments (Exodus 20:1–20)**
After the Exodus, God established his covenant with Israel at Mount Sinai. The Ten Commandments (Decalogue) represent the moral core of the Mosaic covenant:

*Duties toward God (Commands 1–4):*
1. No other gods before YHWH
2. No idols
3. Do not misuse God's name
4. Keep the Sabbath holy

*Duties toward people (Commands 5–10):*
5. Honor your father and mother
6. Do not murder
7. Do not commit adultery
8. Do not steal
9. Do not give false testimony
10. Do not covet

**Moses' Significance**
Moses is the towering figure of the Old Testament — prophet, lawgiver, and mediator of the covenant. He is a type (foreshadow) of Jesus Christ (Deuteronomy 18:15; Acts 3:22). His encounter with God at Sinai established Israel's identity as "a kingdom of priests and a holy nation" (Exodus 19:6).`,
        },
      ],
      summary: "God's call of Abraham (Gen. 12) established the covenant foundation for Israel's nationhood with promises of land, descendants, and universal blessing. Moses' encounter with God at the burning bush (Ex. 3) marked God's decisive intervention to rescue and constitute Israel as his covenant people through the Exodus event and the giving of the Law at Sinai.",
      keyTerms: [
        { term: "Covenant", definition: "A solemn binding agreement between God and his people, involving promises, obligations, and signs." },
        { term: "Theophany", definition: "A visible manifestation of God, such as the burning bush (Exodus 3) or God appearing to Abraham (Gen. 18)." },
        { term: "YHWH", definition: "The divine name revealed to Moses at Sinai; often rendered 'LORD' in English Bibles; related to 'I AM WHO I AM.'" },
        { term: "Decalogue", definition: "The Ten Commandments given by God at Mount Sinai (Exodus 20); the moral core of the Mosaic covenant." },
        { term: "Exodus", definition: "The liberation of Israel from slavery in Egypt under Moses' leadership; the defining saving event of the OT." },
      ],
      practiceQuestions: [
        "Describe the process of God's call of Abraham as recorded in Genesis 12:1–7 and state the significance of the promises.",
        "Narrate Moses' encounter with God at the burning bush (Exodus 3:1–18). What do we learn about God's character from this encounter?",
        "What are the Ten Commandments? Discuss their importance as the foundation of Israel's covenant relationship with God.",
        "Compare the calls of Abraham and Moses. What do they reveal about God's method of choosing and using leaders?",
      ],
    },
    {
      id: "crs001-ch3",
      number: 3,
      title: "Mosaic Authorship of the Pentateuch and the Documentary Hypothesis",
      sections: [
        {
          heading: "3.1 The Pentateuch",
          content: `The **Pentateuch** (from Greek *penta* = five; *teuchos* = scroll/book) refers to the first five books of the Bible: Genesis, Exodus, Leviticus, Numbers, and Deuteronomy. In Hebrew tradition these are collectively called the *Torah* (Law/Instruction) and traditionally attributed to Moses.

The Pentateuch covers the sweep of history from creation (Genesis 1) to the death of Moses on the plains of Moab (Deuteronomy 34), and contains the foundational laws, covenant provisions, and narrative history of Israel's origins.`,
        },
        {
          heading: "3.2 Arguments FOR Mosaic Authorship",
          content: `Traditional scholarship attributes the Pentateuch to Moses, supported by both internal and external evidence:

**Internal Evidence (within the Bible itself):**
- *Direct statements:* In several passages Moses is explicitly said to have written: "Moses then wrote down everything the LORD had said" (Exodus 24:4); "Moses wrote this law" (Deuteronomy 31:9).
- *Personal involvement:* Moses was the eyewitness of the major events narrated (the burning bush, the plagues, the Sinai covenant). No one else was in a better position to record them.
- *Egyptian education:* Acts 7:22 says Moses was "educated in all the wisdom of the Egyptians." He had the literacy skills necessary to produce such a work.
- *New Testament attestation:* Jesus and the apostles consistently refer to the Pentateuch as "the book of Moses" or "Moses wrote..." (Mark 12:26; John 5:46; Romans 10:5).

**External Evidence:**
- Ancient Jewish tradition uniformly attributes the Pentateuch to Moses (Josephus, *Against Apion*; the Talmud).
- The Samaritans, who split from the Jews, also accepted the Pentateuch as Mosaic — indicating very early unanimous attribution.
- Ancient Near Eastern parallels show that law codes and covenant documents were commonly written by their authoritative founders (e.g., Hammurabi's Code).`,
        },
        {
          heading: "3.3 Arguments AGAINST Mosaic Authorship",
          content: `Critical scholarship, particularly from the 18th century onward, raised several arguments challenging exclusive Mosaic authorship:

**Internal Evidence:**
- *Account of Moses' death:* Deuteronomy 34 records Moses' death and burial — clearly written after Moses died. (Traditional response: Joshua or another prophet added this as a postscript.)
- *Third-person references:* Moses is sometimes referred to in the third person, and Numbers 12:3 says "Moses was a very humble man, more humble than anyone else" — seen as unlikely self-description. (Traditional response: Humility does not preclude self-reference in the third person; writers sometimes do this.)
- *Anachronistic phrases:* Genesis 12:6 says "the Canaanites were then in the land" — implying the Canaanites were no longer there when written. Similarly, "Dan" as a place-name (Gen. 14:14) was not used until after Moses.
- *Repetitions and contradictions:* There appear to be two accounts of creation (Genesis 1–2), two flood accounts, and two versions of the Ten Commandments.

**External Evidence:**
- The archaeological evidence for the Exodus as described has been questioned by some scholars.
- No extrabiblical ancient reference explicitly names Moses as author of the entire Pentateuch.`,
        },
        {
          heading: "3.4 The Documentary Hypothesis (JEDP)",
          content: `The Documentary Hypothesis (also called the Wellhausen Hypothesis after Julius Wellhausen, who systematized it in 1878) proposes that the Pentateuch is not a unified work by one author but a compilation of four distinct written sources edited together over centuries.

**The Four Earlier Theories:**
1. **Early Documentary Hypothesis (Astruc, 1753):** Jean Astruc noticed that Genesis uses two different divine names — *Elohim* and *Yahweh* — and proposed these represented two separate original documents.
2. **Fragmentary Hypothesis:** Proposed that the Pentateuch was compiled from many small independent fragments with no large continuous documents.
3. **Supplementary Hypothesis:** Proposed one main document that was supplemented by additions from other sources.

**The JEDP Documents:**
The classical Documentary Hypothesis identifies four sources:

| Source | Name | Date | Characteristics |
|--------|------|------|-----------------|
| **J** | Jahwist/Yahwist | c. 950 BC (Southern Kingdom) | Uses *Yahweh* for God; vivid, anthropomorphic; centers on Judah; God walks, talks, feels emotions |
| **E** | Elohist | c. 850 BC (Northern Kingdom) | Uses *Elohim* for God; more abstract; centers on northern tribes; God communicates through dreams |
| **D** | Deuteronomist | c. 621 BC (Josiah's reform) | Mainly Deuteronomy; characteristic style of long sermons; emphasis on covenant loyalty and warnings against idolatry |
| **P** | Priestly | c. 550–450 BC (Exilic/Post-Exilic) | Concerned with genealogies, dates, numbers, priestly rituals, purity laws; formal, repetitive style |

**Evaluation of the Documentary Hypothesis:**
The hypothesis was enormously influential but has faced serious criticism:
- It is largely a circular argument: the criteria for dividing sources (divine names, style) are themselves debated.
- More recent scholarship (rhetorical criticism, canonical criticism) has emphasized the literary unity of the Pentateuch.
- The use of two divine names does not necessarily imply two authors — Hebrew poetry frequently alternates divine names for stylistic variety.
- Conservatives maintain that Moses could have used different names for God in different contexts, and that later editorial additions do not undermine essential Mosaic authorship.`,
        },
      ],
      summary: "The question of who wrote the Pentateuch has generated significant scholarly debate. Traditional and conservative scholars affirm Mosaic authorship, supported by biblical testimony and ancient tradition. Critical scholars since the 18th century have proposed the Documentary Hypothesis (JEDP), suggesting the Pentateuch is a compilation of four sources. A balanced view recognizes the possibility of a Mosaic core with later editorial work, while affirming the theological unity and divine authority of the Pentateuch.",
      keyTerms: [
        { term: "Pentateuch", definition: "The first five books of the Bible (Genesis–Deuteronomy); called Torah in Hebrew tradition." },
        { term: "Documentary Hypothesis", definition: "The theory that the Pentateuch was compiled from four independent written sources: J, E, D, and P." },
        { term: "JEDP", definition: "The four hypothetical sources of the Pentateuch: Jahwist (J), Elohist (E), Deuteronomist (D), Priestly (P)." },
        { term: "Jahwist (J)", definition: "The proposed southern source of the Pentateuch; uses 'Yahweh' and depicts God in vivid, personal terms." },
        { term: "Elohist (E)", definition: "The proposed northern source; uses 'Elohim' and portrays God as more transcendent, communicating via dreams." },
        { term: "Deuteronomist (D)", definition: "The source associated with Deuteronomy, characterized by long sermonic style and covenant theology." },
        { term: "Priestly (P)", definition: "The exilic/post-exilic source characterized by genealogies, dates, and priestly/ritual concerns." },
      ],
      practiceQuestions: [
        "Discuss the arguments for and against Mosaic authorship of the Pentateuch, using both internal and external evidence.",
        "Explain the Documentary Hypothesis. What are the four documents (JEDP) and what are their main characteristics?",
        "Evaluate the Documentary Hypothesis. What are its strengths and weaknesses as an explanation for the composition of the Pentateuch?",
        "Why is the question of Pentateuchal authorship important for the interpretation of the Old Testament?",
      ],
    },
    {
      id: "crs001-ch4",
      number: 4,
      title: "The Rise of the Monarchy in Israel",
      sections: [
        {
          heading: "4.1 Historical Setting: Before the Monarchy (1 Samuel 1–7)",
          content: `Before the monarchy, Israel was governed as a theocracy — God was the supreme king, and his will was mediated through judges, priests, and prophets. The period of the Judges was one of cyclical apostasy: Israel sinned, God sent oppressors, Israel cried out, God raised a judge-deliverer, peace followed, then the cycle repeated (Judges 2:11–19).

**The Ministry of Eli (1 Samuel 1–4)**
Eli served as High Priest at Shiloh, the central sanctuary where the Ark of the Covenant was kept. Though godly himself, Eli failed as a father: his sons Hophni and Phinehas were "scoundrels" who abused their priestly office, stealing from sacrifices and sleeping with women who served at the entrance to the Tent of Meeting (1 Sam. 2:12–17, 22). God pronounced judgment on Eli's house: "I will cut off your arm and the arm of your father's house, so that no one in it will reach old age" (1 Sam. 2:31).

**The Birth and Call of Samuel**
Hannah, a barren woman married to Elkanah, prayed desperately for a son at Shiloh and vowed to dedicate him to the LORD. God opened her womb and she bore Samuel ("heard of God"). After weaning him, she fulfilled her vow and brought Samuel to Eli at Shiloh. Samuel ministered there as a young child.

God called Samuel at night, speaking his name three times (1 Sam. 3:1–10). Each time Samuel ran to Eli thinking the priest had called him. Eli realized it was God and told Samuel to say, "Speak, LORD, for your servant is listening." God's message to Samuel was one of judgment against Eli's house — an oracle that was fulfilled when the Philistines defeated Israel, the Ark was captured, and Eli and his sons died on the same day (1 Sam. 4).

**War with the Philistines**
The Philistines were a sea-people who settled on the coastal plain of Canaan around 1200 BC and posed the greatest military threat to Israel. Their superior iron technology gave them a military advantage (1 Sam. 13:19–22). The capture of the Ark (1 Sam. 4) was a national catastrophe — the Ark symbolized God's presence among Israel. However, the Ark brought plagues upon the Philistines and was returned (1 Sam. 5–6). Under Samuel's leadership, Israel experienced spiritual revival and military recovery (1 Sam. 7:3–14).

**Samuel as Priest, Judge, and Prophet**
Samuel was unique in holding three offices simultaneously:
- As *Priest*, he offered sacrifices and interceded for the people.
- As *Judge*, he settled disputes and governed Israel; he made a circuit each year through Bethel, Gilgal, and Mizpah.
- As *Prophet*, he received and proclaimed God's word.

Samuel is regarded as the last and greatest of the judges and the first of the great prophets (after Moses). Acts 3:24 says: "Indeed, beginning with Samuel, all the prophets who have spoken have foretold these days."`,
        },
        {
          heading: "4.2 Factors That Led to the Request for a King",
          content: `Israel's request for a king (1 Samuel 8) was driven by several factors:

1. **Samuel's Old Age and the Corruption of His Sons:** Samuel appointed his sons Joel and Abijah as judges, but they "did not follow his ways. They turned aside after dishonest gain and accepted bribes and perverted justice" (1 Sam. 8:3). The people could not trust the next generation.

2. **Fear of the Philistines:** The Philistine threat remained constant. The people wanted a military king who could unite and lead them in battle, like the nations around them had.

3. **Desire to Be Like Other Nations:** "Give us a king to lead us, such as all the other nations have" (1 Sam. 8:5). This reflected both a political pragmatism and a spiritual failure — in wanting a human king, they were rejecting God as their king (1 Sam. 8:7).

4. **Age-Old Tribal Tensions:** The loose tribal confederation was insufficient for sustained military resistance. A centralized monarchy would provide cohesion.

5. **Influence of Neighboring Nations:** Nations like Ammon, Moab, and Edom all had kings. Israel wanted parity.

**God's Response**
God told Samuel: "Listen to all that the people are saying to you; it is not you they have rejected, but they have rejected me as their king" (1 Sam. 8:7). Nevertheless, God granted their request. Samuel warned them of what a king would do — conscript their sons, take their daughters, seize their fields, and tax their produce (1 Sam. 8:10–18). The people insisted, and God said, "Give them a king" (1 Sam. 8:22).`,
        },
        {
          heading: "4.3 Saul: Israel's First King",
          content: `**Saul's Selection and Anointing**
Saul son of Kish, from the tribe of Benjamin, was tall and handsome — "without equal among the Israelites — a head taller than any of the others" (1 Sam. 9:2). He was privately anointed by Samuel (1 Sam. 10:1), then publicly confirmed by lot at Mizpah (1 Sam. 10:17–24), and finally inaugurated as king after a victory over the Ammonites at Jabesh-Gilead (1 Sam. 11).

**Saul's Successes**
- He formed a standing army — the first professional military force in Israel's history.
- He fought successfully against Israel's enemies: the Ammonites, Moabites, Edomites, Zobahites, and Amalekites (1 Sam. 14:47).
- He recovered lost territories and established a monarchical administrative structure.
- He delivered Jabesh-Gilead from Nahash the Ammonite (1 Sam. 11).
- His son Jonathan's daring raid at Micmash was a military highlight (1 Sam. 14).

**Saul's Failures and Fall**
Despite his promising beginning, Saul's reign was characterized by a series of fatal flaws:

1. **Disobedience at Gilgal (1 Sam. 13):** Before a battle with the Philistines, Saul unlawfully offered the burnt offering himself rather than waiting for Samuel. This act violated the boundary between the royal and priestly offices. Samuel declared: "Your kingdom will not endure."

2. **Disobedience Regarding the Amalekites (1 Sam. 15):** God commanded Saul to utterly destroy the Amalekites and everything that belonged to them (*herem* — total consecration to God). Saul spared King Agag and kept the best animals. Samuel confronted him: "Because you have rejected the word of the LORD, he has rejected you as king" (1 Sam. 15:23). The great principle: "To obey is better than sacrifice" (1 Sam. 15:22).

3. **Envy and Murder:** After David's victory over Goliath and the people's acclaim — "Saul has slain his thousands, and David his tens of thousands" — Saul was consumed by jealousy (1 Sam. 18:6–9). He attempted to kill David multiple times.

4. **Consulting a Medium:** On the eve of the final battle with the Philistines, Saul consulted the witch of Endor (a medium) to summon Samuel's spirit (1 Sam. 28). This was expressly forbidden by God (Leviticus 19:31; Deuteronomy 18:10–12). Samuel's spirit announced Saul's doom.

5. **Suicide on Mount Gilboa:** Wounded in battle by the Philistines, Saul fell on his own sword and died (1 Sam. 31). His sons, including Jonathan, also died in battle.

**Lesson:** Saul's reign demonstrates that leadership requires not just ability and appearance but character, obedience, and humility before God.`,
        },
        {
          heading: "4.4 David: Israel's Greatest King",
          content: `**The Anointing of David (1 Samuel 16)**
Even before Saul's death, God sent Samuel to Bethlehem to anoint the next king from among Jesse's sons. Seven sons passed before Samuel, each impressive in appearance, but God said: "Do not consider his appearance or his height, for I have rejected him. The LORD does not look at the things people look at. People look at the outward appearance, but the LORD looks at the heart" (1 Sam. 16:7). David, the youngest, tending sheep in the fields, was the one God chose.

**David's Rise**
- He was brought to court as a musician to soothe Saul's troubled spirit (1 Sam. 16:14–23).
- He killed Goliath the Philistine giant with a sling and stone — an act of faith that electrified Israel (1 Sam. 17).
- He formed a deep covenant friendship with Jonathan (1 Sam. 18:1–4).
- He fled Saul's murderous jealousy and survived years of being hunted, but refused to harm "the LORD's anointed" (1 Sam. 24; 26).

**David's Achievements as King (2 Samuel 1–24)**
1. **United the Kingdom:** After a period of civil war, David united all twelve tribes under his rule, becoming king of Israel at age 30 (2 Sam. 5:3–4).
2. **Captured Jerusalem:** David seized the Jebusite city of Jerusalem and made it Israel's capital — a brilliant political move since it belonged to no tribe, making it a neutral seat of government (2 Sam. 5:6–10). He called it the "City of David."
3. **Brought the Ark to Jerusalem:** He transported the Ark of the Covenant to Jerusalem, making it the religious capital as well (2 Sam. 6).
4. **Military Victories:** He subdued the Philistines, Moabites, Arameans, Edomites, and Ammonites, vastly expanding Israel's territory (2 Sam. 8; 10).
5. **Organized Worship:** He organized the Levites and priests for temple worship; he wrote many psalms (he is credited with 73 of the 150 psalms) and organized the musical worship of Israel.
6. **Provided Temple Materials:** Though God did not allow David to build the Temple (because he was a man of war), he gathered vast quantities of gold, silver, bronze, and stone for the project (1 Chr. 22:14).
7. **The Davidic Covenant (2 Samuel 7):** God promised David an eternal dynasty: "Your house and your kingdom will endure forever before me; your throne will be established forever" — fulfilled ultimately in Jesus Christ (Luke 1:32–33).

**David's Weaknesses**
1. **Adultery with Bathsheba (2 Sam. 11):** David committed adultery with Bathsheba, the wife of Uriah the Hittite — a loyal soldier. To cover it up, he arranged Uriah's death in battle. The prophet Nathan rebuked him with the parable of the ewe lamb: "You are the man!" (2 Sam. 12:7). David repented deeply (Psalm 51).
2. **Inability to Control His Children:** His son Amnon raped his daughter Tamar; his son Absalom murdered Amnon and later led a rebellion against David, forcing him from Jerusalem.
3. **Pride in the Census (2 Sam. 24):** David ordered a military census — an act of prideful self-reliance — for which God sent a plague on Israel.

**Summary of David's Significance**
David is the paradigmatic king of Israel — the standard by which all subsequent kings are measured. He prefigures Jesus Christ (the "Son of David") in his shepherd heart, his kingship, his suffering, his defeat of the enemy, and his establishment of a kingdom of worship.`,
        },
        {
          heading: "4.5 Solomon: Israel's Wisest King",
          content: `**Ascension to the Throne (1 Kings 1–2)**
The succession to David's throne was contested. Adonijah, David's eldest surviving son, attempted to make himself king. Through the intercession of Bathsheba and the prophet Nathan, David confirmed his promise that Solomon would be his successor. Solomon was anointed at Gihon by Zadok the priest and Nathan the prophet (1 Kings 1:38–40). David died after giving Solomon final instructions (1 Kings 2).

**Solomon's God-Given Wisdom**
At the beginning of his reign, God appeared to Solomon at Gibeon and offered him whatever he wished. Solomon asked for wisdom to govern God's people — a request that pleased God, who gave him not only wisdom but also riches and honor. The famous test of wisdom with the two women claiming the same infant (1 Kings 3:16–28) illustrates his judicial acuity. People came from all nations to hear Solomon's wisdom (1 Kings 4:34).

**Solomon's Achievements**
1. **Building the Temple:** Solomon's greatest achievement was constructing the Jerusalem Temple — fulfilling his father's dream. It took seven years to build (c. 966–959 BC) and was among the most magnificent structures of the ancient world. The building materials included cedar from Lebanon, stone, and enormous quantities of gold. At its dedication, God's glory (the *shekinah*) filled the Temple (1 Kings 8:10–11).
2. **The Palace Complex:** He also built a magnificent palace complex that took 13 years to complete, including the Palace of the Forest of Lebanon, the Hall of Justice, and a palace for Pharaoh's daughter.
3. **Commercial Prosperity:** Solomon developed international trade, sending merchant ships to Ophir for gold, Sheba for spices, and other regions. The Queen of Sheba visited, astonished at his wisdom and wealth (1 Kings 10).
4. **Administrative Organization:** He divided Israel into 12 administrative districts with governors responsible for supplying the royal household.
5. **Authorship:** He is credited with 3,000 proverbs and 1,005 songs (1 Kings 4:32); the books of Proverbs, Ecclesiastes, and Song of Solomon are traditionally attributed to him.

**Solomon's Folly**
1. **Forced Labor:** To complete his massive building projects, Solomon imposed *corvée* (forced labor) on the Israelites — sowing seeds of resentment that would eventually tear the kingdom apart.
2. **Heavy Taxation:** The burden of maintaining the court, the army, and the building projects required heavy taxes from the people.
3. **Mixed Marriages:** Solomon married 700 wives and had 300 concubines, many of them foreign princesses — political marriages designed to seal alliances, but explicitly forbidden by God (Deuteronomy 17:17). "He had seven hundred wives of royal birth and three hundred concubines, and his wives led him astray" (1 Kings 11:3).
4. **Idolatry:** His foreign wives turned his heart to other gods — Ashtoreth of the Sidonians, Molek of the Ammonites, Chemosh of the Moabites. He built high places for their gods on the hill east of Jerusalem. "His heart was not fully devoted to the LORD his God, as the heart of David his father had been" (1 Kings 11:4).
5. **God's Judgment:** God declared that he would tear the kingdom from Solomon and give it to his servant — but for David's sake, not in Solomon's lifetime, and one tribe would remain for his son (1 Kings 11:9–13).`,
        },
      ],
      summary: "The establishment of the monarchy in Israel moved from the theocratic rule of judges through the transitional leadership of Samuel to three foundational kings: Saul (who demonstrated that gifting without obedience leads to failure), David (the man after God's own heart who united the kingdom, established Jerusalem, and received the eternal covenant), and Solomon (whose unparalleled wisdom was ultimately undone by idolatry and excess, setting the stage for national division).",
      keyTerms: [
        { term: "Theocracy", definition: "Government by God; Israel's original form of governance before the monarchy." },
        { term: "Monarchy", definition: "Government by a king; Israel's monarchy began with Saul (c. 1050 BC)." },
        { term: "Davidic Covenant", definition: "God's promise to David of an eternal dynasty and kingdom (2 Sam. 7), fulfilled ultimately in Jesus Christ." },
        { term: "Shekinah", definition: "The visible glory of God's presence, which filled the Temple at its dedication (1 Kings 8)." },
        { term: "Corvée", definition: "Forced or compulsory labor imposed by the state; used by Solomon for his building projects." },
        { term: "Herem", definition: "Total consecration to God by destruction; used in the command to destroy the Amalekites (1 Sam. 15)." },
        { term: "Theophany", definition: "A visible manifestation of God; examples include God's call of Samuel (1 Sam. 3) and appearance to Solomon at Gibeon (1 Kings 3)." },
      ],
      practiceQuestions: [
        "Identify the factors that gave rise to the monarchy in Israel and discuss the roles of Eli and Samuel in its establishment.",
        "Highlight the successes and examine the factors that caused the fall of King Saul (1 Samuel 13–15).",
        "Discuss the achievements of King David and identify his significant weaknesses.",
        "Appraise the reign of Solomon: what were his contributions to Israel and what was the nature of his folly?",
      ],
    },
    {
      id: "crs001-ch5",
      number: 5,
      title: "The Divided Kingdom and the Exiles",
      sections: [
        {
          heading: "5.1 Factors That Led to the Division of the Kingdom",
          content: `**Background**
Solomon's death (c. 931 BC) triggered the fracture of the united monarchy. What had been building as tension throughout Solomon's reign now erupted into open revolt. The Kingdom split into two: the Northern Kingdom (**Israel**, with 10 tribes) under Jeroboam, and the Southern Kingdom (**Judah**, with 2 tribes — Judah and Benjamin) under Rehoboam.

**Factors Contributing to Division (1 Kings 12:1–25)**

1. **Solomon's Oppressive Policies:** The heavy burden of taxation and forced labor (corvée) had deeply alienated the northern tribes. When Solomon died, the people immediately sent a delegation to his son Rehoboam demanding relief.

2. **Rehoboam's Unwise Decision (1 Kings 12:1–17):** The new king consulted two groups of advisers. The elders who had served Solomon counseled: "If today you will be a servant to these people and serve them and give them a favorable answer, they will always be your servants." But the young men who had grown up with Rehoboam advised him to be harsher than his father. Rehoboam listened to the young men: "My father made your yoke heavy; I will make it even heavier. My father scourged you with whips; I will scourge you with scorpions." This catastrophically unwise response triggered the revolt.

3. **The Prophecy of Ahijah (1 Kings 11:29–39):** Before Solomon's death, the prophet Ahijah had already told Jeroboam — a capable official from the tribe of Ephraim — that God would tear ten tribes from Solomon's son and give them to him. This was divine punishment for Solomon's idolatry. The division was thus simultaneously a political event and a theological judgment.

4. **Age-Long Tribal Tensions:** There had always been tension between the northern tribes (especially Ephraim) and Judah. After Saul's death, there was a years-long conflict before David became king of all Israel. The jealousy between Ephraim and Judah runs through the entire history.

5. **Economic Disparity:** Jerusalem and Judah benefited more from Solomon's reign as the royal capital, while northern tribes bore a disproportionate burden of taxation and labor.

**The Division: Rehoboam (Judah) and Jeroboam (Israel)**

- **Rehoboam** retained control of Judah and Benjamin, with Jerusalem as capital.
- **Jeroboam** became king of the Northern Kingdom (Israel/Ephraim), establishing his capital first at Shechem, then at Tirzah, later at Samaria.

Jeroboam's great sin was the introduction of golden calves at Bethel and Dan: "Here are your gods, Israel, who brought you up out of Egypt" (1 Kings 12:28). He did this to keep his people from going to Jerusalem to worship and potentially transferring political loyalty to Rehoboam. This became "the sin of Jeroboam" — the paradigmatic apostasy that the author of Kings uses to condemn most northern kings.`,
        },
        {
          heading: "5.2 The Exiles: Causes, Events, and Effects",
          content: `**The Assyrian Exile of the Northern Kingdom (722 BC)**

The Northern Kingdom of Israel lasted approximately 200 years before being conquered by Assyria. It had 19 kings, all of whom "did evil in the eyes of the LORD." The kingdom was marked by rapid succession through assassination, coup, and conspiracy.

*Key events:*
- The Assyrian Empire under **Shalmaneser V** besieged Samaria (c. 724 BC) after King Hoshea stopped paying tribute and sought Egyptian help.
- **Sargon II** completed the siege and captured Samaria in 722/721 BC.
- Over 27,000 Israelites were deported to Assyria and Mesopotamia (2 Kings 17:6).
- The Assyrians resettled foreigners from Babylon, Cuth, Avva, Hamath, and Sepharvaim in the depopulated land of Samaria — these intermarried with remaining Israelites, producing the mixed-race **Samaritans**.

*Causes (2 Kings 17:7–23):*
The author of Kings gives a theological explanation: Israel was exiled because they:
- Sinned against the LORD and worshipped other gods.
- Built high places and worshipped under every spreading tree.
- Made golden calves and an Asherah pole.
- Bowed down to the starry hosts.
- Sacrificed their sons and daughters in the fire.
- Practiced divination and sought omens.
- "The LORD rejected all the people of Israel; he afflicted them and gave them into the hands of plunderers, until he thrust them from his presence" (2 Kings 17:20).

**The Babylonian Exile of the Southern Kingdom (605–586 BC)**

The Southern Kingdom lasted about 135 years longer than the north, sustained by occasional godly kings (Hezekiah, Josiah) and the ministry of prophets (Isaiah, Jeremiah). However, it too fell — in three stages:

- **605 BC (First Deportation):** Nebuchadnezzar of Babylon defeated Egypt at Carchemish and came to Jerusalem. King Jehoiakim submitted; noble Judeans including Daniel were taken to Babylon (Daniel 1:1–3).
- **597 BC (Second Deportation):** After Jehoiakim's rebellion, Nebuchadnezzar returned. King Jehoiachin and 10,000 leading citizens (priests, officials, craftsmen, soldiers) were deported, including the prophet Ezekiel (2 Kings 24:10–16).
- **586 BC (Third Deportation and Destruction):** After the final revolt by King Zedekiah, Nebuchadnezzar destroyed Jerusalem. The Temple was burned to the ground (2 Kings 25:9), the city walls were demolished, and most of the remaining population was deported.

**State of the Exiles (2 Kings 25)**
- Zedekiah's sons were killed before his eyes, then he was blinded and taken to Babylon in bronze shackles.
- A Babylonian governor, Gedaliah, was appointed over the remaining poor; he was later assassinated.
- Some Jews fled to Egypt, taking the prophet Jeremiah with them.
- In Babylon, the exiles maintained their community identity through synagogue worship, scribal activity, and prophetic ministry (Ezekiel, later chapters of Isaiah).

**Effects of the Exile**
1. *Religious reform:* The exile purged Israel of literal idol worship — after their return, Jews never again fell into polytheistic idolatry.
2. *Growth of the synagogue:* Without the Temple, Jews developed the synagogue as a local center for prayer, Scripture reading, and community life.
3. *Canonization of Scripture:* The trauma of exile drove the preservation and collection of Scriptures.
4. *Messianic hope:* The exile deepened expectations of a coming Messiah who would restore the kingdom (see Isaiah 40–55).
5. *Diaspora:* Jewish communities spread throughout the ancient world — the beginning of the Jewish Diaspora.`,
        },
      ],
      summary: "The division of the United Kingdom after Solomon's death was caused by political oppression, tribal tensions, royal folly (Rehoboam), prophetic judgment, and divine discipline. The Northern Kingdom fell to Assyria in 722 BC due to persistent idolatry and covenant unfaithfulness; the Southern Kingdom fell to Babylon in 586 BC for the same reasons. The Babylonian exile was a watershed in Jewish history, giving rise to the synagogue, intensifying Scripture preservation, and deepening Messianic hope.",
      keyTerms: [
        { term: "Divided Kingdom", definition: "The split of united Israel after Solomon's death into the Northern Kingdom (Israel) and Southern Kingdom (Judah) c. 931 BC." },
        { term: "Assyrian Exile", definition: "The deportation of the Northern Kingdom by Assyria in 722 BC under Sargon II." },
        { term: "Babylonian Exile", definition: "The deportation of Judah to Babylon in three stages (605, 597, 586 BC) under Nebuchadnezzar." },
        { term: "Samaritans", definition: "The mixed-race people of the former Northern Kingdom, produced when Assyrian colonists intermarried with remaining Israelites." },
        { term: "Diaspora", definition: "The dispersion of Jews outside their homeland, beginning with the Assyrian and Babylonian exiles." },
        { term: "Synagogue", definition: "Local Jewish assembly for prayer, Scripture reading, and teaching; developed during and after the Babylonian exile." },
      ],
      practiceQuestions: [
        "Explain the factors that led to the division of the Kingdom of Israel after Solomon's death (1 Kings 12).",
        "Discuss the reign and activities of Rehoboam (Judah) and Jeroboam (Israel) after the division.",
        "What were the causes and effects of the Assyrian exile of the Northern Kingdom (722 BC)?",
        "Describe the Babylonian exile of the Southern Kingdom. What were the three stages and what were the lasting effects on Israel?",
      ],
    },
    {
      id: "crs001-ch6",
      number: 6,
      title: "The Rise of Prophecy in Israel",
      sections: [
        {
          heading: "6.1 Early Manifestations of Prophecy",
          content: `**The Nature of Prophecy**
Biblical prophecy is not primarily prediction of the future (though it includes that) — it is *forthtelling*: speaking God's word to a contemporary situation. The Hebrew *nabi* (prophet) literally means one who is called to speak; a prophet is God's spokesman, the one who stands in God's council and declares his word.

**Pre-Canonical Prophets**
The earliest prophets predated the books that bear their names:

- **Abraham:** Called a prophet in Genesis 20:7 — he interceded for Abimelech.
- **Moses:** The paradigmatic prophet — he spoke with God "face to face" (Deuteronomy 34:10). Deuteronomy 18:15 contains his prophecy: "The LORD your God will raise up for you a prophet like me from among you" — fulfilled in Jesus (Acts 3:22).
- **Miriam and Deborah:** Female prophets in the early period.
- **Samuel:** The kingmaker; he anointed both Saul and David and was the pivotal figure connecting the periods of the Judges and the Monarchy.
- **Nathan and Gad:** Court prophets under David.
- **Elijah and Elisha:** The great non-writing prophets of the Northern Kingdom (9th century BC), whose ministries featured miracles, confrontation with Baal worship, and social justice.

**Schools of Prophets ("Sons of the Prophets")**
There were communities of prophets organized around a prophetic leader (1 Sam. 10:5; 1 Kings 20:35; 2 Kings 2:3). These "sons of the prophets" (guilds or bands of prophets) served as schools for training prophets and preserving prophetic tradition. Samuel appears to have founded or organized such a group at Ramah.

**Characteristics of Biblical Prophecy**
1. **Inspiration:** Prophets received their message from God — through visions, dreams, direct speech, or the inner witness of the Spirit.
2. **Call to Repentance:** Nearly all prophets called Israel to return to covenant faithfulness.
3. **Fearlessness:** True prophets spoke God's word regardless of consequences — they confronted kings (Nathan to David, Elijah to Ahab) and faced persecution.
4. **Dedication to God:** Their lives were characterized by personal devotion to YHWH.
5. **Concern for Justice:** The prophets were passionate advocates for the poor, the widow, the orphan — they challenged social exploitation.`,
        },
        {
          heading: "6.2 The Major and Minor Prophets",
          content: `**Classification**
The Hebrew canon divides the Latter Prophets into:
- **Major Prophets:** Isaiah, Jeremiah, Ezekiel, Daniel — called "major" because of the length of their books.
- **Minor Prophets:** The Twelve (Hosea through Malachi) — "minor" refers to length, not importance.

The three prophets specifically emphasized in the JUPEB syllabus are **Isaiah, Amos, and Hosea** — all of whom ministered in the 8th century BC, a period of great material prosperity and deep spiritual poverty in both Israel and Judah.`,
        },
        {
          heading: "6.3 Isaiah: The Prophet of Holiness",
          content: `**Background**
Isaiah ben Amoz ministered in Jerusalem from c. 740–700 BC, spanning the reigns of Uzziah, Jotham, Ahaz, and Hezekiah (Isa. 1:1). He was a court prophet with direct access to kings. His wife was a prophetess and his two sons had symbolic names (*Shear-Jashub* = "a remnant shall return"; *Maher-Shalal-Hash-Baz* = "quick to the plunder, swift to the spoil").

**Isaiah's Call Vision (Isaiah 6:1–8)**
In the year King Uzziah died (c. 740 BC), Isaiah saw the LORD seated on a high and exalted throne. Seraphim flew above him, covering their faces and feet and calling to one another: "Holy, holy, holy is the LORD Almighty; the whole earth is full of his glory." The doorposts shook and the Temple filled with smoke.

Isaiah's response was profound humility: "Woe to me! I am ruined! For I am a man of unclean lips, and I live among a people of unclean lips, and my eyes have seen the King, the LORD Almighty" (Isa. 6:5). A seraph touched his lips with a live coal from the altar: "See, this has touched your lips; your guilt is taken away and your sin atoned for." Then God's commission: "Whom shall I send? And who will go for us?" Isaiah's response: "Here am I. Send me!"

**Isaiah's Message on Holiness (Isaiah 1–6)**

*The Problem:* Isaiah 1 opens with God's indictment of Judah: "Hear me, you heavens! Listen, earth! For the LORD has spoken: 'I reared children and brought them up, but they have rebelled against me.'" The people brought lavish sacrifices and kept religious rituals while practicing injustice, oppressing the poor, and taking bribes (Isa. 1:11–17).

*The Call to Holiness:* God's standard is his own holy character. The great "woes" of Isaiah 5 condemn:
- Those who accumulate land at the expense of the poor (v.8)
- Those who drink from morning to night (v.11)
- Those who call evil good and good evil (v.20)
- Those who are wise in their own eyes (v.21)
- Those who acquit the guilty for a bribe (v.23)

*Holiness and Social Justice:* For Isaiah, true holiness is not merely ritual purity but ethical integrity. God does not want empty sacrifices; he wants: "Learn to do right; seek justice. Defend the oppressed. Take up the cause of the fatherless; plead the case of the widow" (Isa. 1:17).

*The Remnant Doctrine:* Not all Israel would be destroyed. God would preserve a faithful remnant (symbolized by Isaiah's son Shear-Jashub) through whom his purposes would continue.

**Relevance to Nation Building**
Isaiah's message speaks powerfully to contemporary Nigeria:
- Leaders who enrich themselves at the expense of citizens violate the prophetic ethic.
- Calling evil good and good evil — the normalization of corruption — is explicitly condemned.
- Genuine religion must produce social justice, not merely religious ceremony.
- God's holiness demands that those who represent him in public life live with integrity.`,
        },
        {
          heading: "6.4 Hosea: The Prophet of Love",
          content: `**Background**
Hosea was a contemporary of Isaiah but ministered in the Northern Kingdom (Israel) rather than Judah. He prophesied during the reigns of Jeroboam II and the chaotic period following (c. 755–725 BC). His ministry coincided with a period of surface prosperity masking deep spiritual corruption.

**Hosea's Extraordinary Marriage (Hosea 1–3)**
God commanded Hosea to marry **Gomer**, a woman who would be unfaithful to him. This was not merely personal tragedy — it was a prophetic symbol. Their marriage represented the relationship between God (Hosea) and Israel (Gomer): a faithful God married to an unfaithful nation that had gone after other gods like a wife committing adultery.

Their children were given symbolic names:
- *Jezreel* ("God scatters") — judgment on the house of Jehu
- *Lo-Ruhamah* ("Not loved" or "No compassion") — God would show no compassion to Israel
- *Lo-Ammi* ("Not my people") — God would disown Israel

Gomer left Hosea and became a prostitute. In a stunning act of redemptive love, God commanded Hosea: "Go, show your love to your wife again, though she is loved by another man and is an adulteress. Love her as the LORD loves the Israelites, though they turn to other gods" (Hosea 3:1). Hosea bought her back.

**Hosea's Message on Love (Hosea 1–3)**

*The Accusation:* "There is no faithfulness, no love (*hesed*), no acknowledgment of God in the land. There is only cursing, lying and murder, stealing and adultery; they break all bounds, and bloodshed follows bloodshed" (Hosea 4:1–2).

*The Core: *Hesed* (Covenant Love):* Hosea's key concept is *hesed* — the Hebrew word for covenant loyalty, loving-kindness, unfailing love. This is not merely sentimental affection but committed faithfulness that remains even when the beloved is unfaithful. "For I desire mercy (*hesed*), not sacrifice, and acknowledgment of God rather than burnt offerings" (Hosea 6:6 — quoted twice by Jesus in Matthew 9:13 and 12:7).

*The Hope:* Despite the judgment, Hosea holds out extraordinary hope: "I will heal their waywardness and love them freely, for my anger has turned away from them" (Hosea 14:4). God's love is not finally extinguished by human unfaithfulness.

**Relevance to Nation Building**
- Genuine community life requires *hesed* — loyal, committed love rather than superficial relationship.
- A nation built on exploitation, lying, and betrayal destroys itself from within.
- National healing requires returning to God — to moral integrity and covenant faithfulness.
- Leaders must model the self-sacrificing love they demand of citizens.`,
        },
        {
          heading: "6.5 Amos: The Prophet of Justice",
          content: `**Background**
Amos was a shepherd and a dresser of sycamore trees from Tekoa, a small town in Judah (Amos 1:1; 7:14). He was not a professional prophet: "I was neither a prophet nor the son of a prophet, but I was a shepherd, and I also took care of sycamore-fig trees. But the LORD took me from tending the flock and said to me, 'Go, prophesy to my people Israel'" (Amos 7:14–15). He ministered in the Northern Kingdom around 760–750 BC, during the prosperous reign of Jeroboam II.

**Amos's Message on Justice (Amos 1–5)**

*The International Horizon (Amos 1–2):* Amos opens with oracles of judgment against six surrounding nations (Damascus, Gaza, Tyre, Edom, Ammon, Moab) for war crimes and inhumanity. Each oracle follows the formula: "For three sins of X, even for four, I will not relent." Having gained his audience's approval — Israel would have loved hearing their enemies condemned — Amos then turns to Judah (oracle 7) and finally to Israel itself (oracle 8, the longest and most devastating).

*Israel's Specific Sins (Amos 2:6–8):*
- "They sell the innocent for silver, and the needy for a pair of sandals." (Judicial corruption and human trafficking)
- "They trample on the heads of the poor as on the dust of the ground." (Economic exploitation)
- "Father and son use the same girl." (Sexual immorality)
- "They lie down beside every altar on garments taken in pledge." (Exploitation of the vulnerable)

*The Condemnation of Empty Religion (Amos 5:21–24):*
God speaks: "I hate, I despise your religious festivals; your assemblies are a stench to me. Even though you bring me burnt offerings and grain offerings, I will not accept them... Away with the noise of your songs! I will not listen to the music of your harps. But let justice roll on like a river, righteousness like a never-failing stream!"

This is perhaps the most powerful statement of the relationship between worship and ethics in all of Scripture. God is not impressed by elaborate religious ceremony divorced from social justice.

*The Day of the LORD (Amos 5:18–20):* The Israelites eagerly anticipated "the Day of the LORD" — expecting it to be a day of victory and national vindication. Amos shocks them: it will be darkness, not light. God's day will bring judgment on Israel, not favor.

**Amos's Techniques**
- *Doxologies* (hymnic praises of God the creator — 4:13; 5:8–9; 9:5–6) — interrupting the judgment speeches to remind Israel of who it is they have offended.
- *Vision reports* (locusts, fire, plumb line, fruit basket, God at the altar — chapters 7–9).

**Relevance to Nation Building**
Amos speaks with thundering relevance to contemporary Nigeria and West Africa:
- The gap between the wealthy few and the poor majority mirrors the situation Amos condemned.
- Corruption in the judiciary — selling justice for silver — is exactly what Amos denounced.
- Religious prosperity gospel that promises wealth while ignoring the poor is a perversion of biblical faith.
- National transformation requires structural justice, not just individual piety.
- The metaphor — "let justice roll on like a river" — was famously quoted by Dr. Martin Luther King Jr. and remains a rallying cry for justice movements worldwide.`,
        },
      ],
      summary: "Biblical prophecy represents God's voice speaking into history, calling his people to covenant faithfulness. The 8th-century prophets — Isaiah (holiness), Hosea (covenant love), and Amos (justice) — addressed a society that had achieved material prosperity at the cost of spiritual integrity and social justice. Their messages remain profoundly relevant: genuine religion produces justice; God demands ethical integrity, not merely religious ceremony; and national flourishing depends on faithfulness to God and care for the vulnerable.",
      keyTerms: [
        { term: "Nabi", definition: "Hebrew word for prophet; literally 'one who is called to speak'; God's spokesman to his people." },
        { term: "Forthtelling", definition: "The primary function of the prophet — declaring God's word to a contemporary situation (not merely predicting the future)." },
        { term: "Hesed", definition: "Hebrew word for covenant love, loyal-kindness, unfailing faithfulness; the key concept in Hosea's message." },
        { term: "The Day of the LORD", definition: "An expected day of divine intervention; Amos shocked Israel by declaring it would be judgment, not vindication." },
        { term: "Remnant", definition: "Isaiah's doctrine that a faithful portion of Israel would survive judgment and carry forward God's purposes." },
        { term: "Social Justice", definition: "The prophetic demand that the community treat the poor, widow, and orphan with fairness — central to all three 8th-century prophets." },
        { term: "Schools of Prophets", definition: "Communities or guilds of prophets organized around a prophetic leader; preserved and transmitted prophetic tradition." },
      ],
      practiceQuestions: [
        "Identify the pre-canonical prophets and examine the characteristics of biblical prophecy.",
        "Examine Prophet Isaiah's message on holiness (Isaiah 1–6) and discuss its relevance to nation building in Nigeria.",
        "Explain Hosea's message on love and its implications for Israel, drawing on Hosea 1–3.",
        "Explain the message of Amos on justice (Amos 1–5) and discuss its relevance to nation building.",
        "Distinguish between major and minor prophets and discuss the relevance of the messages of Isaiah, Hosea, and Amos to contemporary society.",
      ],
    },
  ],
};
