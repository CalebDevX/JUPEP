// ── JUPEB Offline Vocabulary Database ────────────────────────────────────────
// All definitions written for secondary school / JUPEB level comprehension.
// Works 100% offline — bundled into the app.

export type VocabEntry = {
  term: string;
  pos: string; // part of speech
  definition: string;
  example?: string;
  subject?: 'GOV' | 'CRS' | 'LIT' | 'GENERAL';
};

export const VOCABULARY: VocabEntry[] = [

  // ═══ GOVERNMENT ═══════════════════════════════════════════════════════════

  { term: 'sovereignty', pos: 'noun', subject: 'GOV',
    definition: 'The supreme authority of a state to govern itself without external interference. A sovereign country makes its own laws and is not subject to any outside power.',
    example: 'Nigeria\'s sovereignty means no foreign country can dictate its internal policies.' },

  { term: 'constitution', pos: 'noun', subject: 'GOV',
    definition: 'The fundamental law of a country that establishes the structure of government, distributes power among its branches, and protects the rights of citizens.',
    example: 'The 1999 Nigerian Constitution defines the powers of the President, National Assembly, and Judiciary.' },

  { term: 'federalism', pos: 'noun', subject: 'GOV',
    definition: 'A system of government where power is divided between a central (federal) government and regional (state) governments, with each level having defined authority.',
    example: 'Nigeria operates a federal system with 36 states and a Federal Capital Territory.' },

  { term: 'democracy', pos: 'noun', subject: 'GOV',
    definition: 'A form of government in which power is held by the people, exercised directly or through elected representatives.',
    example: 'In a democracy, citizens vote to choose their leaders in free and fair elections.' },

  { term: 'oligarchy', pos: 'noun', subject: 'GOV',
    definition: 'A form of government where power is controlled by a small group of wealthy, privileged, or powerful people rather than by all citizens.',
    example: 'Ancient Sparta was an oligarchy where a council of elders made key decisions.' },

  { term: 'autocracy', pos: 'noun', subject: 'GOV',
    definition: 'A system of government in which one person — a ruler or dictator — has unlimited, unchecked power over the state and its citizens.',
    example: 'Military rule in Nigeria during the 1980s was widely regarded as autocracy.' },

  { term: 'totalitarianism', pos: 'noun', subject: 'GOV',
    definition: 'An extreme form of autocratic government that seeks to control all aspects of public and private life, leaving no room for personal freedom or political opposition.',
    example: 'Nazi Germany under Hitler is a classic example of totalitarianism.' },

  { term: 'bureaucracy', pos: 'noun', subject: 'GOV',
    definition: 'The permanent, professional body of civil servants who implement government policies and manage the day-to-day running of the state.',
    example: 'The Federal Civil Service is Nigeria\'s main bureaucracy.' },

  { term: 'legislature', pos: 'noun', subject: 'GOV',
    definition: 'The branch of government responsible for making laws. In Nigeria this is the National Assembly, made up of the Senate and House of Representatives.',
    example: 'The legislature passed the bill after three readings and public hearings.' },

  { term: 'judiciary', pos: 'noun', subject: 'GOV',
    definition: 'The branch of government that interprets the laws and settles disputes through courts. It acts as a check on the other branches of government.',
    example: 'The Supreme Court is the highest body of the Nigerian judiciary.' },

  { term: 'executive', pos: 'noun', subject: 'GOV',
    definition: 'The branch of government responsible for implementing and enforcing laws. The President heads the executive arm at the federal level in Nigeria.',
    example: 'The executive signed the budget bill into law after the legislature approved it.' },

  { term: 'bicameral', pos: 'adjective', subject: 'GOV',
    definition: 'Describing a legislature that is divided into two separate chambers or houses, typically an upper and lower house.',
    example: 'Nigeria operates a bicameral legislature — the Senate (upper) and the House of Representatives (lower).' },

  { term: 'unicameral', pos: 'adjective', subject: 'GOV',
    definition: 'Describing a legislature that has only one chamber or house.',
    example: 'Some smaller countries use a unicameral parliament for simpler law-making.' },

  { term: 'suffrage', pos: 'noun', subject: 'GOV',
    definition: 'The right to vote in political elections. Universal suffrage means every adult citizen has this right regardless of gender, race, or wealth.',
    example: 'Women gained full suffrage in Nigeria with independence in 1960.' },

  { term: 'referendum', pos: 'noun', subject: 'GOV',
    definition: 'A direct vote by all eligible citizens on a single political question or policy, allowing them to express their opinion directly rather than through representatives.',
    example: 'A referendum was held to determine whether the region should become an independent state.' },

  { term: 'impeachment', pos: 'noun', subject: 'GOV',
    definition: 'The formal process by which a legislative body charges a government official — such as the President — with misconduct, which may lead to removal from office.',
    example: 'The National Assembly initiated impeachment proceedings against the governor for corruption.' },

  { term: 'amendment', pos: 'noun', subject: 'GOV',
    definition: 'An official change or addition made to a constitution, law, or formal document through the proper legal process.',
    example: 'The constitution requires a two-thirds majority in the National Assembly to pass an amendment.' },

  { term: 'preamble', pos: 'noun', subject: 'GOV',
    definition: 'The introductory statement of a constitution or law that explains its purpose, principles, and the authority on which it is based.',
    example: 'The preamble of Nigeria\'s constitution begins "We the People of the Federal Republic of Nigeria..."' },

  { term: 'ratification', pos: 'noun', subject: 'GOV',
    definition: 'The formal approval or confirmation of a treaty, agreement, or constitutional amendment by the appropriate authority, making it legally binding.',
    example: 'Ratification by the majority of state assemblies was required before the amendment took effect.' },

  { term: 'promulgation', pos: 'noun', subject: 'GOV',
    definition: 'The formal official proclamation and publication of a new law or decree, giving it legal force.',
    example: 'After the president\'s assent, the bill was published in the Federal Gazette as promulgation.' },

  { term: 'nationalism', pos: 'noun', subject: 'GOV',
    definition: 'A strong belief in the importance of national identity, self-governance, and independence of one\'s country. It often drives movements for political independence from colonial or foreign rule.',
    example: 'Nationalism was the driving force behind Nigeria\'s independence movement in the 1950s.' },

  { term: 'citizenship', pos: 'noun', subject: 'GOV',
    definition: 'The legal status of being a recognised member of a state, with defined rights (such as voting) and responsibilities (such as paying taxes).',
    example: 'Nigerian citizenship can be acquired by birth, descent, registration, or naturalisation.' },

  { term: 'secularism', pos: 'noun', subject: 'GOV',
    definition: 'The principle that government and public institutions should be separate from religion and should not favour or promote any particular faith.',
    example: 'The Nigerian constitution promotes secularism by stating that no religion shall be adopted as a state religion.' },

  { term: 'manifesto', pos: 'noun', subject: 'GOV',
    definition: 'A public declaration by a political party or candidate outlining their policies, goals, and promises if elected to power.',
    example: 'The party\'s manifesto promised free education, better healthcare, and reduced unemployment.' },

  { term: 'veto', pos: 'noun/verb', subject: 'GOV',
    definition: 'The power or right to reject or block a decision or law made by another branch of government. In Nigeria, the President can veto a bill passed by the National Assembly.',
    example: 'The governor used his veto to reject the assembly\'s tax bill.' },

  { term: 'coup', pos: 'noun', subject: 'GOV',
    definition: 'Short for coup d\'état — the sudden, usually violent overthrow of an existing government by a small group, typically the military.',
    example: 'Nigeria experienced several military coups between 1966 and 1985.' },

  { term: 'confederation', pos: 'noun', subject: 'GOV',
    definition: 'A loose alliance of independent states that retain most of their powers and only delegate limited, specific powers to a common central authority.',
    example: 'Unlike a federation, in a confederation each member state can leave the union at will.' },

  { term: 'parliamentary', pos: 'adjective', subject: 'GOV',
    definition: 'Relating to a system of government where the executive is drawn from and responsible to the legislature (parliament), as opposed to a presidential system.',
    example: 'Nigeria\'s First Republic used a parliamentary system before switching to a presidential model.' },

  { term: 'presidential', pos: 'adjective', subject: 'GOV',
    definition: 'Relating to a system of government where the president is the head of state and government, elected separately from the legislature and not directly accountable to it.',
    example: 'Nigeria currently operates a presidential system of government.' },

  { term: 'electoral', pos: 'adjective', subject: 'GOV',
    definition: 'Relating to elections, voting processes, or those who are entitled to vote (the electorate).',
    example: 'INEC is Nigeria\'s electoral commission responsible for conducting elections.' },

  { term: 'jurisdiction', pos: 'noun', subject: 'GOV',
    definition: 'The official authority to make legal decisions and judgements over a particular area, people, or type of case.',
    example: 'The Federal High Court has jurisdiction over matters involving the federal government.' },

  { term: 'ordinance', pos: 'noun', subject: 'GOV',
    definition: 'A law or regulation enacted by a local government authority, or historically, a law issued by a colonial power.',
    example: 'The colonial government issued an ordinance banning unauthorised land sales.' },

  { term: 'statute', pos: 'noun', subject: 'GOV',
    definition: 'A written law passed by a legislative body and formally enacted as part of the law of the land.',
    example: 'The Companies and Allied Matters Act is a key statute governing business registration in Nigeria.' },

  // ═══ CHRISTIAN RELIGIOUS STUDIES ══════════════════════════════════════════

  { term: 'covenant', pos: 'noun', subject: 'CRS',
    definition: 'A solemn, binding agreement or promise between God and His people (or between individuals). In the Bible, God made covenants with Noah, Abraham, Moses, and David.',
    example: 'God made a covenant with Abraham, promising him a great nation and land.' },

  { term: 'prophecy', pos: 'noun', subject: 'CRS',
    definition: 'A divine message, inspired by God and delivered by a prophet. It can reveal God\'s will, warn against sin, or foretell future events.',
    example: 'Isaiah\'s prophecy about the birth of a child named Immanuel pointed to the coming of Jesus Christ.' },

  { term: 'redemption', pos: 'noun', subject: 'CRS',
    definition: 'The act of saving or setting someone free from sin, bondage, or judgement by paying a ransom or price. In Christianity, Jesus\'s death on the cross is the ultimate act of redemption.',
    example: 'Paul wrote that through Christ\'s blood, we have redemption and forgiveness of sins.' },

  { term: 'atonement', pos: 'noun', subject: 'CRS',
    definition: 'The reconciliation between God and humanity achieved through the sacrifice of Jesus Christ, making amends for human sin.',
    example: 'The Day of Atonement (Yom Kippur) in the Old Testament was a type or foreshadowing of Christ\'s atonement.' },

  { term: 'epistle', pos: 'noun', subject: 'CRS',
    definition: 'A formal letter, especially one of the letters written by the Apostle Paul or other writers of the New Testament to early Christian communities.',
    example: 'Paul\'s epistle to the Romans explains the doctrine of salvation by faith.' },

  { term: 'apostle', pos: 'noun', subject: 'CRS',
    definition: 'One of the twelve disciples specifically chosen by Jesus Christ to spread the gospel. The word also refers to early Christian missionaries like Paul.',
    example: 'Peter was recognised as the chief apostle and led the early Jerusalem church.' },

  { term: 'gospel', pos: 'noun', subject: 'CRS',
    definition: 'The "good news" of Jesus Christ\'s life, death, and resurrection. Also refers to the four New Testament books (Matthew, Mark, Luke, John) that record His life.',
    example: 'The Gospel of John begins by describing Jesus as the Word who was with God from the beginning.' },

  { term: 'baptism', pos: 'noun', subject: 'CRS',
    definition: 'A Christian sacrament symbolising cleansing from sin and entry into the Christian community, typically performed with water. John baptised Jesus in the River Jordan.',
    example: 'Jesus was baptised by John the Baptist in the River Jordan, after which the Holy Spirit descended on Him.' },

  { term: 'resurrection', pos: 'noun', subject: 'CRS',
    definition: 'The rising from death back to life. In the Christian faith, it refers specifically to Jesus Christ rising from the dead on the third day after His crucifixion.',
    example: 'The resurrection of Jesus Christ is the central event of the Christian faith and is celebrated at Easter.' },

  { term: 'salvation', pos: 'noun', subject: 'CRS',
    definition: 'Deliverance from sin and its consequences, and restoration to a right relationship with God. Christians believe salvation is received through faith in Jesus Christ.',
    example: 'Paul wrote "For by grace you have been saved through faith" (Ephesians 2:8).' },

  { term: 'incarnation', pos: 'noun', subject: 'CRS',
    definition: 'The doctrine that God the Son took on human flesh and became a man in the person of Jesus Christ — fully God and fully human simultaneously.',
    example: 'The Christmas story celebrates the incarnation: the eternal Word of God becoming a baby in Bethlehem.' },

  { term: 'sanctification', pos: 'noun', subject: 'CRS',
    definition: 'The ongoing process by which a believer is set apart and made holy through the work of the Holy Spirit, growing more like Christ over time.',
    example: 'Paul encouraged the Thessalonians that God\'s will for them was sanctification — to be holy.' },

  { term: 'intercession', pos: 'noun', subject: 'CRS',
    definition: 'Praying or pleading on behalf of another person. The Bible describes Jesus as continually making intercession for believers before God.',
    example: 'Moses made intercession for the Israelites when God threatened to destroy them for worshipping the golden calf.' },

  { term: 'parable', pos: 'noun', subject: 'CRS',
    definition: 'A short story using everyday situations to teach a spiritual or moral truth. Jesus used parables frequently as a teaching method.',
    example: 'The Parable of the Prodigal Son teaches about God\'s unconditional love and forgiveness.' },

  { term: 'monotheism', pos: 'noun', subject: 'CRS',
    definition: 'The belief that there is only one God. Judaism, Christianity, and Islam are all monotheistic religions.',
    example: 'The first commandment — "You shall have no other gods before me" — affirms Israel\'s monotheism.' },

  { term: 'revelation', pos: 'noun', subject: 'CRS',
    definition: 'The disclosure of truth by God to humanity. In the Bible, God reveals Himself through creation, Scripture, and ultimately through Jesus Christ. Also the last book of the New Testament.',
    example: 'The Book of Revelation was written by the Apostle John and contains prophetic visions of the end times.' },

  { term: 'tabernacle', pos: 'noun', subject: 'CRS',
    definition: 'The portable tent-sanctuary built by Moses according to God\'s instructions, used as a place of worship by the Israelites during their wilderness journey.',
    example: 'God instructed Moses to construct the tabernacle as a dwelling place for His presence among the people.' },

  { term: 'communion', pos: 'noun', subject: 'CRS',
    definition: 'The Christian sacrament of sharing bread and wine in remembrance of Jesus\'s Last Supper and death. Also called the Eucharist or Lord\'s Supper.',
    example: 'Jesus instituted communion the night before His crucifixion when He broke bread with His disciples.' },

  { term: 'heresy', pos: 'noun', subject: 'CRS',
    definition: 'A belief or opinion that is contrary to established Christian doctrine or teaching. In the early church, many heresies arose about the nature of Christ.',
    example: 'The heresy of Gnosticism taught that matter was evil and only spiritual things were good.' },

  { term: 'theology', pos: 'noun', subject: 'CRS',
    definition: 'The systematic study of the nature of God, religious belief, and the relationship between God and humanity.',
    example: 'Paul\'s Letter to the Romans is considered one of the most theologically rich books in the New Testament.' },

  { term: 'testament', pos: 'noun', subject: 'CRS',
    definition: 'A formal agreement or covenant, also meaning a division of the Bible. The Old Testament records God\'s covenant with Israel; the New Testament records the new covenant in Christ.',
    example: 'The New Testament consists of 27 books, from Matthew to Revelation.' },

  { term: 'dispensation', pos: 'noun', subject: 'CRS',
    definition: 'A period or era in which God deals with humanity in a specific way, revealing more of His plan and holding people accountable to that revelation.',
    example: 'The Age of Grace or the dispensation of the Church began on the Day of Pentecost.' },

  { term: 'pentecost', pos: 'noun', subject: 'CRS',
    definition: 'The Jewish harvest festival held 50 days after Passover. In Christian history, it marks the day the Holy Spirit descended on the disciples, empowering them to spread the gospel.',
    example: 'On the Day of Pentecost, the disciples spoke in tongues and about 3,000 people were added to the church.' },

  { term: 'messiah', pos: 'noun', subject: 'CRS',
    definition: 'The "anointed one" — the promised deliverer. In Judaism, the awaited king who would restore Israel. Christians believe Jesus is the Messiah.',
    example: 'Peter confessed that Jesus was the Messiah, the Son of the living God.' },

  // ═══ LITERATURE IN ENGLISH ════════════════════════════════════════════════

  { term: 'allegory', pos: 'noun', subject: 'LIT',
    definition: 'A story, poem, or picture that can be interpreted to reveal a hidden meaning, typically a moral or political one. The characters and events represent abstract ideas.',
    example: 'George Orwell\'s Animal Farm is an allegory about totalitarianism, where the pigs represent corrupt leaders.' },

  { term: 'metaphor', pos: 'noun', subject: 'LIT',
    definition: 'A figure of speech that describes something by saying it IS something else, creating a direct comparison without using "like" or "as".',
    example: '"Life is a journey" is a metaphor — it compares life to travel to suggest we move toward a destination.' },

  { term: 'simile', pos: 'noun', subject: 'LIT',
    definition: 'A figure of speech that compares two different things using the words "like" or "as".',
    example: '"Her voice was as sweet as honey" is a simile comparing the quality of a voice to honey.' },

  { term: 'protagonist', pos: 'noun', subject: 'LIT',
    definition: 'The central character of a story, play, or novel — the main hero or heroine whose actions drive the plot forward.',
    example: 'Okonkwo is the protagonist of Chinua Achebe\'s Things Fall Apart.' },

  { term: 'antagonist', pos: 'noun', subject: 'LIT',
    definition: 'The character who opposes or conflicts with the protagonist. The antagonist creates obstacles and challenges that the hero must overcome.',
    example: 'In many of Wole Soyinka\'s plays, corrupt authority figures serve as the antagonist.' },

  { term: 'soliloquy', pos: 'noun', subject: 'LIT',
    definition: 'A speech in a play in which a character speaks their thoughts aloud when alone on stage, giving the audience direct insight into their inner feelings.',
    example: 'Hamlet\'s "To be or not to be" is the most famous soliloquy in all of English literature.' },

  { term: 'alliteration', pos: 'noun', subject: 'LIT',
    definition: 'The repetition of the same consonant sound at the beginning of closely connected words, used to create rhythm or emphasis.',
    example: '"Peter Piper picked a peck of pickled peppers" is a classic example of alliteration using the letter P.' },

  { term: 'onomatopoeia', pos: 'noun', subject: 'LIT',
    definition: 'A word that phonetically imitates the sound it describes, such that saying the word sounds like the thing itself.',
    example: 'Words like "buzz," "crash," "sizzle," and "bang" are examples of onomatopoeia.' },

  { term: 'personification', pos: 'noun', subject: 'LIT',
    definition: 'A figure of speech in which human qualities, emotions, or actions are attributed to non-human things like animals, objects, or abstract ideas.',
    example: '"The wind whispered through the trees" personifies the wind by giving it a human action (whispering).' },

  { term: 'hyperbole', pos: 'noun', subject: 'LIT',
    definition: 'An extreme exaggeration used for emphasis or comic effect, not meant to be taken literally.',
    example: '"I\'ve told you a million times!" is hyperbole — the speaker hasn\'t literally said it a million times.' },

  { term: 'irony', pos: 'noun', subject: 'LIT',
    definition: 'A literary device where the intended meaning is opposite to what is literally stated, or where events turn out contrary to what was expected.',
    example: 'Dramatic irony occurs when the audience knows something the character doesn\'t — as when we know a villain is hiding.' },

  { term: 'satire', pos: 'noun', subject: 'LIT',
    definition: 'A genre of literature that uses humour, irony, and exaggeration to criticise or expose foolishness, corruption, or flaws in society or individuals.',
    example: 'Wole Soyinka\'s The Trials of Brother Jero is a satire of religious hypocrisy in Nigeria.' },

  { term: 'foreshadowing', pos: 'noun', subject: 'LIT',
    definition: 'A literary technique in which an author gives early hints or clues about events that will occur later in the story.',
    example: 'In Things Fall Apart, the locust arrival foreshadows the coming of European colonisers.' },

  { term: 'flashback', pos: 'noun', subject: 'LIT',
    definition: 'A narrative technique in which the story jumps back in time to show events that happened before the current point in the plot.',
    example: 'Achebe uses flashback to show us Okonkwo\'s father\'s failures, which shaped Okonkwo\'s character.' },

  { term: 'imagery', pos: 'noun', subject: 'LIT',
    definition: 'Descriptive language that appeals to the senses (sight, sound, smell, touch, taste), creating vivid mental pictures in the reader\'s mind.',
    example: 'The poet uses imagery of fire, ash, and smoke to convey the destruction of the village.' },

  { term: 'symbolism', pos: 'noun', subject: 'LIT',
    definition: 'The use of objects, characters, colours, or events to represent deeper ideas or qualities beyond their literal meaning.',
    example: 'In Things Fall Apart, the yam symbolises wealth, strength, and masculinity in Igbo culture.' },

  { term: 'monologue', pos: 'noun', subject: 'LIT',
    definition: 'A long speech by one character in a play or story, addressed to other characters or directly to the audience.',
    example: 'The villain delivered a lengthy monologue explaining his plan to the assembled crowd.' },

  { term: 'stanza', pos: 'noun', subject: 'LIT',
    definition: 'A group of lines in a poem, forming a unit. It is the poetic equivalent of a paragraph in prose.',
    example: 'The poem is divided into four stanzas, each exploring a different aspect of loss.' },

  { term: 'prose', pos: 'noun', subject: 'LIT',
    definition: 'Ordinary written or spoken language without a metrical structure, as distinguished from poetry. Novels, essays, and short stories are written in prose.',
    example: 'Chinua Achebe wrote Things Fall Apart in clear, accessible prose that reflected Igbo oral tradition.' },

  { term: 'tragedy', pos: 'noun', subject: 'LIT',
    definition: 'A genre of drama or literature in which the protagonist\'s fatal flaw or circumstances lead to their downfall, suffering, or death.',
    example: 'Things Fall Apart is a tragedy — Okonkwo\'s pride and inability to adapt ultimately destroy him.' },

  { term: 'diction', pos: 'noun', subject: 'LIT',
    definition: 'The writer\'s choice and use of words, which reflects their style and creates particular effects. Formal diction uses elevated language; colloquial diction uses everyday speech.',
    example: 'The author\'s use of Yoruba words alongside English reflects the diction of a bilingual society.' },

  { term: 'rhetoric', pos: 'noun', subject: 'LIT',
    definition: 'The art of effective and persuasive speaking or writing. Also refers to language that sounds impressive but may lack substance.',
    example: 'The politician\'s speech was full of rhetoric that moved the crowd but offered no concrete plans.' },

  { term: 'motif', pos: 'noun', subject: 'LIT',
    definition: 'A recurring element — image, phrase, idea, or symbol — throughout a work of literature that reinforces its themes.',
    example: 'The wrestling motif in Things Fall Apart represents conflict, power, and the struggle for dominance.' },

  { term: 'theme', pos: 'noun', subject: 'LIT',
    definition: 'The central idea, message, or underlying meaning of a literary work. A theme is usually a universal truth about life or human nature.',
    example: 'The theme of conflict between tradition and change runs throughout Achebe\'s writing.' },

  { term: 'epic', pos: 'noun', subject: 'LIT',
    definition: 'A long narrative poem or prose work that tells the story of a great hero\'s adventures, often involving supernatural forces and themes of national or cultural identity.',
    example: 'Homer\'s Iliad and Odyssey are the most famous epic poems in Western literature.' },

  // ═══ GENERAL ACADEMIC ═════════════════════════════════════════════════════

  { term: 'sovereignty', pos: 'noun', subject: 'GENERAL',
    definition: 'Supreme authority and independence — whether of a state, ruler, or individual — to make decisions without outside interference.' },

  { term: 'hypothesis', pos: 'noun', subject: 'GENERAL',
    definition: 'A proposed explanation or educated guess about a phenomenon, made on the basis of limited evidence, which can then be tested through investigation.',
    example: 'The scientist formed a hypothesis that the bacteria caused the disease, then designed experiments to test it.' },

  { term: 'empirical', pos: 'adjective', subject: 'GENERAL',
    definition: 'Based on observation, experiment, and real-world evidence rather than theory or belief alone.',
    example: 'The researcher demanded empirical evidence before accepting the new medical treatment as valid.' },

  { term: 'ideology', pos: 'noun', subject: 'GENERAL',
    definition: 'A system of ideas, beliefs, and values that forms the basis of an economic or political theory or the thinking of a group, movement, or society.',
    example: 'Communism and capitalism are opposing ideologies about how economies should be organised.' },

  { term: 'colonialism', pos: 'noun', subject: 'GENERAL',
    definition: 'The policy and practice of acquiring control over another country, occupying it with settlers, and exploiting it economically. Nigeria was under British colonial rule from 1914 to 1960.',
    example: 'British colonialism brought Western education to Nigeria but also extracted vast natural resources.' },

  { term: 'imperialism', pos: 'noun', subject: 'GENERAL',
    definition: 'The policy of extending a country\'s power and influence by military force, economic dominance, or colonisation of other territories.',
    example: 'The Scramble for Africa in the 1880s was a period of rapid imperialism by European powers.' },

  { term: 'hegemony', pos: 'noun', subject: 'GENERAL',
    definition: 'Dominance or leadership of one country, group, or idea over others, particularly through cultural, economic, or political influence rather than direct force.',
    example: 'The United States has maintained global hegemony since the end of the Cold War.' },

  { term: 'indigenous', pos: 'adjective', subject: 'GENERAL',
    definition: 'Originating and naturally occurring in a particular place; native. Refers to the original inhabitants of a region and their culture.',
    example: 'The Yoruba, Igbo, and Hausa are among Nigeria\'s many indigenous peoples.' },

  { term: 'reconciliation', pos: 'noun', subject: 'GENERAL',
    definition: 'The restoration of friendly relations or harmony between parties who were previously in conflict, disagreement, or separation.',
    example: 'The Truth and Reconciliation Commission sought to heal divisions after apartheid in South Africa.' },

  { term: 'bureaucratic', pos: 'adjective', subject: 'GENERAL',
    definition: 'Relating to a system of government with complex rules and procedures, administered by many officials. Can suggest excessive paperwork and slow processes.',
    example: 'Starting a business was difficult due to bureaucratic delays in obtaining the necessary licences.' },

  { term: 'sovereignty', pos: 'noun', subject: 'GENERAL',
    definition: 'Supreme, unchallenged authority — of a nation over its territory, or of a ruler over their people.' },

  { term: 'propaganda', pos: 'noun', subject: 'GENERAL',
    definition: 'Information, especially biased or misleading, used to promote a political cause or point of view and influence public opinion.',
    example: 'During the war, both sides used propaganda posters to recruit soldiers and boost morale.' },

  { term: 'liberation', pos: 'noun', subject: 'GENERAL',
    definition: 'The act of setting someone free from oppression, imprisonment, slavery, or unjust rule.',
    example: 'The liberation movements across Africa in the 1950s and 1960s led to independence from colonial rule.' },

  { term: 'infrastructure', pos: 'noun', subject: 'GENERAL',
    definition: 'The basic physical and organisational structures and facilities needed for a society to function — such as roads, electricity, water supply, and communication networks.',
    example: 'Poor infrastructure — including bad roads and irregular power supply — hampers economic development in Nigeria.' },

  { term: 'sovereignty', pos: 'noun', subject: 'GOV',
    definition: 'The absolute, supreme authority of a state to govern its affairs without interference from external powers.' },

  { term: 'geopolitics', pos: 'noun', subject: 'GENERAL',
    definition: 'The study of how geography, power, and international relations interact — how location, resources, and borders influence political decisions between nations.',
    example: 'Nigeria\'s geopolitics as West Africa\'s largest economy gives it significant regional influence.' },

  { term: 'autonomy', pos: 'noun', subject: 'GENERAL',
    definition: 'The right or condition of self-governance — the ability of a person, group, or institution to make its own decisions without being controlled by an outside body.',
    example: 'The new law granted universities greater autonomy in setting their own curricula.' },

  { term: 'paradigm', pos: 'noun', subject: 'GENERAL',
    definition: 'A typical example or pattern; a model or framework that shapes how people understand and approach a subject.',
    example: 'The discovery that the Earth orbited the Sun was a paradigm shift that changed all of astronomy.' },

  { term: 'synthesis', pos: 'noun', subject: 'GENERAL',
    definition: 'The combination of different ideas, elements, or influences to create a new, coherent whole.',
    example: 'The essay required a synthesis of arguments from multiple scholars to build a convincing argument.' },

  { term: 'critique', pos: 'noun/verb', subject: 'GENERAL',
    definition: 'A detailed analysis and evaluation of a work, idea, or situation, identifying both strengths and weaknesses.',
    example: 'The student was asked to critique the government\'s education policy using evidence from the textbook.' },

  { term: 'proliferation', pos: 'noun', subject: 'GENERAL',
    definition: 'Rapid increase or multiplication in number, especially of something undesirable.',
    example: 'The proliferation of illegal weapons contributed to rising crime rates in the region.' },

  { term: 'sovereignty', pos: 'noun', subject: 'GOV',
    definition: 'The supreme political authority of a state to govern itself.' },

  // ═══ LITERATURE ════════════════════════════════════════════════════════════

  { term: 'tragedy', pos: 'noun', subject: 'LIT',
    definition: 'A dramatic genre originating in Ancient Greece in which the protagonist suffers a downfall, usually caused by a fatal character flaw (hamartia). Aristotle defined it in his Poetics as an imitation of an action that is serious and complete, arousing pity and fear in the audience.',
    example: 'Sophocles\' Oedipus Rex is the archetypal Greek tragedy — Oedipus\'s downfall results from his pride and determination to know the truth.' },

  { term: 'comedy', pos: 'noun', subject: 'LIT',
    definition: 'A dramatic genre that uses humour, light-hearted situations, and often ends happily. In Ancient Greece, comedy was developed by Aristophanes. It contrasts with tragedy in tone and resolution.',
    example: 'Aristophanes\' Lysistrata (411 BC) is a classic Greek comedy in which women refuse to sleep with their husbands until they stop making war.' },

  { term: 'catharsis', pos: 'noun', subject: 'LIT',
    definition: 'The emotional release or purification experienced by the audience after watching a tragedy. Coined by Aristotle in his Poetics (c. 335 BC) to describe how watching dramatic suffering purges the emotions of pity and fear from the spectators.',
    example: 'Aristotle argued that audiences leave a tragedy feeling emotionally cleansed — this purging of emotions is catharsis.' },

  { term: 'mimesis', pos: 'noun', subject: 'LIT',
    definition: 'The Greek word for imitation, used by Aristotle to describe how art, drama, and literature imitate or represent reality. Plato first used the term critically; Aristotle saw mimesis as natural and pleasurable.',
    example: 'According to Aristotle\'s Poetics, drama is mimesis — an imitation of life — and humans naturally enjoy imitating and seeing imitations.' },

  { term: 'hamartia', pos: 'noun', subject: 'LIT',
    definition: 'A fatal flaw or error of judgement in the hero of a tragedy that leads to their downfall. From the Greek for "error" or "missing the mark". Aristotle defined it in his Poetics as the key cause of the tragic hero\'s catastrophe.',
    example: 'Oedipus\'s hamartia is his pride (hubris) and his relentless pursuit of truth even when warned to stop.' },

  { term: 'hubris', pos: 'noun', subject: 'LIT',
    definition: 'Excessive pride or arrogance that leads a tragic hero to challenge the gods or natural order, inevitably resulting in punishment or downfall. A key concept in Ancient Greek tragedy.',
    example: 'Creon\'s hubris in Sophocles\' Antigone — his refusal to bury Polynices — leads to the deaths of Antigone, Haemon, and Eurydice.' },

  { term: 'protagonist', pos: 'noun', subject: 'LIT',
    definition: 'The main character or hero of a literary work, who drives the action and faces the central conflict. The term comes from the Greek "protos" (first) and "agonist" (contestant).',
    example: 'Hamlet is the protagonist of Shakespeare\'s play — all major events revolve around his quest to avenge his father\'s murder.' },

  { term: 'antagonist', pos: 'noun', subject: 'LIT',
    definition: 'The character, force, or society that opposes the protagonist. The antagonist creates the central conflict that drives the narrative.',
    example: 'In Chinua Achebe\'s Things Fall Apart, the colonial British government and missionaries serve as the antagonist to Okonkwo.' },

  { term: 'soliloquy', pos: 'noun', subject: 'LIT',
    definition: 'A dramatic device in which a character speaks their thoughts aloud, alone on stage, revealing inner feelings and motivations directly to the audience. Different from a monologue, which can be addressed to others.',
    example: 'Hamlet\'s "To be, or not to be" speech is the most famous soliloquy in English literature, revealing his contemplation of suicide.' },

  { term: 'Thespis', pos: 'noun', subject: 'LIT',
    definition: 'An Ancient Greek performer from Athens (c. 6th century BC) regarded as the "Father of Drama." He is credited with being the first actor — the first to step out of the chorus and speak as an individual character in dramatic performances at the Festival of Dionysus around 534 BC.',
    example: 'When Thespis first spoke as a separate character from the chorus in 534 BC, he invented what we now call acting — which is why actors are still called "Thespians."' },

  { term: 'Sophocles', pos: 'noun', subject: 'LIT',
    definition: 'One of the three great Ancient Greek tragedians (c. 496–406 BC), alongside Aeschylus and Euripides. He wrote 123 plays, of which 7 survive, including Oedipus Rex, Antigone, and Oedipus at Colonus. He introduced the third actor to drama, allowing for more complex plots.',
    example: 'Sophocles\' Oedipus Rex, written around 429 BC, is considered the greatest Greek tragedy — Aristotle used it as his primary example in his Poetics.' },

  { term: 'Aeschylus', pos: 'noun', subject: 'LIT',
    definition: 'Ancient Greek playwright (c. 525–456 BC), the "Father of Tragedy" and the earliest of the three great Greek tragedians. He introduced the second actor, creating the possibility of true dramatic conflict. His surviving plays include the Oresteia trilogy and Prometheus Bound.',
    example: 'Aeschylus\' Oresteia (458 BC) — comprising Agamemnon, The Libation Bearers, and The Eumenides — is the only complete trilogy to survive from Ancient Greece.' },

  { term: 'Euripides', pos: 'noun', subject: 'LIT',
    definition: 'Ancient Greek playwright (c. 484–406 BC), the youngest of the three great tragedians. He wrote 92 plays, of which 19 survive, including Medea, The Trojan Women, and Bacchae. He was more realistic and psychologically complex than his predecessors, giving women stronger roles.',
    example: 'In Euripides\' Medea (431 BC), the heroine kills her own children to punish her unfaithful husband Jason — a shocking and psychologically realistic portrait of feminine rage.' },

  { term: 'allegory', pos: 'noun', subject: 'LIT',
    definition: 'A narrative in which characters, events, and settings represent abstract ideas or moral qualities, conveying a deeper symbolic meaning beyond the literal story. The entire work functions as an extended metaphor.',
    example: 'George Orwell\'s Animal Farm is an allegory of the Russian Revolution — the pigs represent the Communist leaders, and the farm represents the Soviet Union.' },

  { term: 'satire', pos: 'noun', subject: 'LIT',
    definition: 'A literary genre that uses irony, sarcasm, exaggeration, and humour to criticise and expose human folly, vice, or social institutions. Satire aims to provoke change or reform.',
    example: 'Wole Soyinka\'s play The Trials of Brother Jero satirises fake prophets and religious hypocrisy in Nigerian society.' },

  { term: 'denouement', pos: 'noun', subject: 'LIT',
    definition: 'The final resolution or unravelling of a plot, following the climax. In this section, loose ends are tied up and the consequences of the main conflict become clear. From the French word meaning "to untie."',
    example: 'The denouement of Ola Rotimi\'s The Gods Are Not to Blame occurs after Odewale discovers he has killed his father and married his mother.' },

  { term: 'motif', pos: 'noun', subject: 'LIT',
    definition: 'A recurring element — image, symbol, theme, or idea — that appears multiple times throughout a literary work and contributes to its overall meaning or atmosphere.',
    example: 'The recurring motif of yam in Chinua Achebe\'s Things Fall Apart symbolises Igbo masculinity, wealth, and cultural identity.' },

  { term: 'naturalism', pos: 'noun', subject: 'LIT',
    definition: 'A literary movement (late 19th century) that extended realism by portraying the influence of heredity, environment, and social conditions on human behaviour. Naturalists, like Émile Zola, argued that humans are determined by forces beyond their control.',
    example: 'Henrik Ibsen\'s A Doll\'s House (1879) shows naturalistic concerns — Nora\'s character is shaped by the society and marriage that constrain her.' },

  { term: 'irony', pos: 'noun', subject: 'LIT',
    definition: 'A literary device where what is said or expected is the opposite of what is meant or happens. Types include: verbal irony (saying the opposite of what is meant), situational irony (events contrary to expectations), and dramatic irony (audience knows more than the characters).',
    example: 'In Oedipus Rex, there is powerful dramatic irony — the audience knows Oedipus is seeking the murderer of his own father, but Oedipus himself does not.' },

  // ═══ CRS ═══════════════════════════════════════════════════════════════════

  { term: 'covenant', pos: 'noun', subject: 'CRS',
    definition: 'A formal, solemn agreement or contract between God and human beings. The Bible records several key covenants: with Noah (Genesis 9), Abraham (Genesis 15, 17), Moses/Israel at Sinai (Exodus 19–24), David (2 Samuel 7), and the New Covenant through Jesus Christ (Jeremiah 31:31–34; Luke 22:20).',
    example: 'The Abrahamic Covenant (Genesis 15) promised Abraham land, descendants, and that all nations would be blessed through him — fulfilled ultimately in Jesus Christ.' },

  { term: 'redemption', pos: 'noun', subject: 'CRS',
    definition: 'The act of God rescuing humanity from the power and penalty of sin through the sacrifice of Jesus Christ. From the Latin "redemptio" meaning "buying back." In the Old Testament, a "kinsman-redeemer" (go\'el) would buy back a relative from slavery.',
    example: 'Ephesians 1:7 states: "In him we have redemption through his blood, the forgiveness of sins, in accordance with the riches of God\'s grace."' },

  { term: 'atonement', pos: 'noun', subject: 'CRS',
    definition: 'The reconciliation between God and humanity achieved through sacrifice. In the Old Testament, the Day of Atonement (Yom Kippur, Leviticus 16) involved the high priest sacrificing animals and symbolically transferring Israel\'s sins to a scapegoat. In Christianity, Jesus is seen as the final atoning sacrifice.',
    example: 'The Day of Atonement (Leviticus 16:29–34) required Israel to fast and confess sins, with the High Priest entering the Holy of Holies to offer blood sacrifice — a practice Christians see fulfilled in Christ\'s death.' },

  { term: 'prophecy', pos: 'noun', subject: 'CRS',
    definition: 'A divinely inspired message or prediction delivered by a prophet. Biblical prophecy includes foretelling (predicting future events) and forthtelling (proclaiming God\'s message to the present). Major Old Testament prophets include Isaiah, Jeremiah, Ezekiel, and Daniel; Minor prophets include Hosea, Amos, and Micah.',
    example: 'Isaiah 53 contains one of the most detailed Old Testament prophecies about the suffering of the Messiah, written about 700 years before Jesus\' crucifixion.' },

  { term: 'sanctification', pos: 'noun', subject: 'CRS',
    definition: 'The ongoing process by which a Christian is made holy through the work of the Holy Spirit. Distinct from justification (being declared righteous) which is instantaneous; sanctification is a lifelong journey towards conformity with Christ\'s character.',
    example: '1 Thessalonians 4:3 states "It is God\'s will that you should be sanctified" — meaning God desires believers to become increasingly holy in character and conduct.' },

  { term: 'eschatology', pos: 'noun', subject: 'CRS',
    definition: 'The branch of theology concerned with the "last things" or end times — death, judgement, heaven, hell, the Second Coming of Christ, the resurrection of the dead, and the final state of all things. From the Greek "eschatos" (last) and "logos" (study).',
    example: 'The Book of Revelation is the primary New Testament eschatological text, describing in highly symbolic language the end of history and the establishment of God\'s eternal kingdom.' },

  { term: 'incarnation', pos: 'noun', subject: 'CRS',
    definition: 'The Christian doctrine that God the Son, the second person of the Trinity, took on human flesh and became fully human in the person of Jesus Christ while remaining fully divine. Expressed in John 1:14: "The Word became flesh and made his dwelling among us."',
    example: 'The Council of Nicaea (325 AD) affirmed the incarnation by declaring Jesus "of the same substance" (homoousios) as the Father, combating Arianism which denied the full divinity of Christ.' },

  { term: 'Trinity', pos: 'noun', subject: 'CRS',
    definition: 'The central Christian doctrine that God exists as three distinct persons — Father, Son, and Holy Spirit — who are co-equal, co-eternal, and of the same divine substance (homoousios). Formulated at the Councils of Nicaea (325 AD) and Constantinople (381 AD).',
    example: 'The Nicene Creed (325 AD), still recited in churches today, articulates the doctrine of the Trinity: God the Father, Jesus Christ as "God of God, Light of Light," and the Holy Spirit "who proceeds from the Father."' },

  { term: 'heresy', pos: 'noun', subject: 'CRS',
    definition: 'A belief or teaching that contradicts the established doctrines of the Christian Church. Major early heresies include Arianism (denying Christ\'s full divinity), Gnosticism (matter is evil, salvation through secret knowledge), Pelagianism (humans can achieve salvation without divine grace), and Docetism (Christ only appeared human).',
    example: 'Arianism, the belief that Jesus was a created being inferior to God the Father, was condemned as heresy at the Council of Nicaea in 325 AD after heated debate led by Athanasius of Alexandria.' },

  { term: 'Pentecost', pos: 'noun', subject: 'CRS',
    definition: 'In Judaism, Pentecost (Shavuot) is the Feast of Weeks celebrated 50 days after Passover. In Christianity, it refers to the outpouring of the Holy Spirit upon the 120 disciples in Jerusalem (Acts 2), 50 days after the resurrection of Jesus. Often called "the birthday of the Church."',
    example: 'Acts 2:1–4 describes how on the day of Pentecost, the disciples were filled with the Holy Spirit and began speaking in other tongues, leading to the conversion of about 3,000 people (Acts 2:41).' },
];

// ── Fast lookup map ────────────────────────────────────────────────────────────
// Deduplicate by keeping the first entry per term
const _seen = new Set<string>();
const _unique = VOCABULARY.filter(v => {
  const key = v.term.toLowerCase();
  if (_seen.has(key)) return false;
  _seen.add(key);
  return true;
});

export const VOCAB_MAP = new Map<string, VocabEntry>(
  _unique.map(v => [v.term.toLowerCase(), v])
);

/**
 * Look up a word in the offline vocabulary.
 * Strips leading/trailing punctuation and lowercases before matching.
 */
export function lookupWord(raw: string): VocabEntry | undefined {
  const clean = raw.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '');
  if (clean.length < 4) return undefined;
  return VOCAB_MAP.get(clean);
}

/**
 * Get all vocabulary entries for a specific subject.
 */
export function getSubjectVocab(subject: VocabEntry['subject']): VocabEntry[] {
  return _unique.filter(v => v.subject === subject);
}
