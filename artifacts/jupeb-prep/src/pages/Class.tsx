import { useState, useEffect, useRef, useMemo } from "react";
import { useListSubjects } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, PlayCircle, Clock, Loader2, RotateCcw,
  Volume2, ChevronRight, Sparkles, Square, BookOpen,
  CheckCircle2, XCircle, ChevronDown, Award, BarChart3,
  ArrowRight, RefreshCw, Lightbulb, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isActivated } from "@/lib/access";
import { PaywallGate } from "@/components/PaywallGate";
import { useReadAloud } from "@/hooks/useReadAloud";

const BASE = import.meta.env.VITE_API_URL || "";
const WORDS_PER_MIN = 180;

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const PAPER_LABELS: Record<string, string> = {
  "001": "1st In-Course Exam",
  "002": "1st Semester Exam",
  "003": "2nd In-Course Exam",
  "004": "2nd Semester Exam",
  "mock": "Mock Exam",
};

// Syllabus-driven topics per subject keyword + paper
const SUBJECT_TOPICS: Record<string, Record<string, string[]>> = {
  Literature: {
    "001": [
      "Introduction to Drama — Definition, Origin and Relevance",
      "The Classical Tradition & Greek Theatre",
      "Aristotle's Poetics — Catharsis, Hamartia & the Unities",
      "Renaissance Drama — Shakespeare & Marlowe",
      "European Modern Drama — Ibsen, Shaw and Realism",
      "African Drama — Wole Soyinka and J.P. Clark",
    ],
    "002": [
      "Introduction to Prose Fiction — Types and Development",
      "Narrative Techniques — Point of View & Stream of Consciousness",
      "The European Novel — Tradition and Forms",
      "African Prose Fiction — Achebe and Ngũgĩ wa Thiong'o",
      "Character, Setting and Theme in the African Novel",
      "American Fiction — Themes and Techniques",
    ],
    "003": [
      "Introduction to Poetry — Definition, Types & Forms",
      "Versification — Metre, Rhythm and Rhyme Scheme",
      "The Classical Tradition in Poetry — Homer and Ovid",
      "European Romantic and Victorian Poetry",
      "Modern European Poetry — T.S. Eliot & W.B. Yeats",
      "African Poetry — Soyinka, Okigbo & Awoonor",
    ],
    "004": [
      "Unseen Prose Analysis — Techniques and Approach",
      "Unseen Poetry Analysis — Tone, Mood and Imagery",
      "Critical Approaches — Biographical, Textual, Structural",
      "JUPEB Essay Writing Technique and Structure",
      "Comprehensive Literary Terms Revision",
    ],
    mock: [
      "Drama Revision — Greek to African Traditions",
      "Prose Revision — European & African Novels",
      "Poetry Revision — Classical to Modern",
      "Literary Devices Masterclass",
      "Exam Technique — How to Ace JUPEB Literature",
    ],
  },
  Government: {
    "001": [
      "Nature of Government & Politics — Definitions and Scope",
      "Power, Authority, Legitimacy & Sovereignty",
      "Meaning and Nature of the State — Theories and Types",
      "Structure of Government — Executive, Legislature & Judiciary",
      "Constitution and Constitutionalism — Types and Features",
      "Citizenship — Rights, Duties and Acquisition",
    ],
    "002": [
      "Social Contract Theory — Hobbes, Locke & Rousseau",
      "Types of Political Ideology — Capitalism, Socialism, Communism, Fascism",
      "Political Parties — Functions, Types and Party Systems",
      "Elections & Electoral Systems in Nigeria",
      "Public Administration & the Civil Service",
      "International Relations & Global Organizations",
    ],
    "003": [
      "Pre-Colonial Government — Hausa/Fulani, Yoruba & Igbo",
      "Amalgamation 1914 & Indirect Rule in Nigeria",
      "Constitutional Development in Nigeria",
      "Nationalism — Macaulay, Azikiwe & Awolowo",
      "Development of Political Parties — First to Fourth Republic",
      "Military Rule in Nigeria — Regimes, Achievements & Failures",
    ],
    "004": [
      "Africa Before European Invasion — Empires & Kingdoms",
      "The Scramble for Africa & Berlin Conference 1884–85",
      "Colonial Systems — British, French & Portuguese",
      "Apartheid in South Africa — Origins, Features & End",
      "Nationalist Movements in West Africa",
      "Contemporary Issues in African Politics",
    ],
    mock: [
      "Separation of Powers & Checks and Balances",
      "Federalism vs Unitarism — Features, Merits & Demerits",
      "Nigerian Constitutional History — 1960 to Present",
      "Pressure Groups vs Political Parties",
      "Globalization and its Impact on African Politics",
    ],
  },
  Christian: {
    "001": [
      "Formation & Composition of the Old Testament",
      "Canonization of the OT & Genre of Literature",
      "Israel's Nationhood — The Call of Abraham & Moses",
      "Mosaic Authorship & the Documentary Hypothesis (J.E.D.P.)",
      "The Rise of Monarchy — Saul, David & Solomon",
      "The Divided Kingdom & the Exiles",
      "Prophecy in Israel — Isaiah, Hosea & Amos",
    ],
    "002": [
      "Historical Background to the New Testament",
      "The Synoptic Gospels & the Synoptic Problem",
      "Factors Delaying/Prompting the Writing of the NT",
      "Modern Criticism of the Gospels — Form, Source & Redaction",
      "Literature & Theology of Matthew, Mark & Luke",
      "The Gospel of John vs the Synoptics",
    ],
    "003": [
      "Previous Attempts at Christianizing Africa",
      "Evangelical Revivals & Mission Societies",
      "Christianity in Sierra Leone — Freetown & Fourah Bay",
      "Planting of Christianity in Ghana",
      "Missionary Activities in Nigeria — Yoruba, Igbo & North",
      "African Independent Churches (AICs) & Pentecostalism",
    ],
    "004": [
      "Relationship Between Religion & Society",
      "Theories of Religion — Marx, Durkheim & Weber",
      "Measures of Religiosity in Society",
      "Functions of Religion — Social, Political & Moral",
      "Religion, Peace & Conflict Resolution in Nigeria",
      "Christian Response to Contemporary Societal Challenges",
    ],
    mock: [
      "OT Revision — Kings, Prophets & Divided Kingdom",
      "NT Revision — Synoptics & John's Gospel",
      "History of Christianity in West Africa Revision",
      "Religion & Society Comprehensive Review",
      "JUPEB CRS Exam Technique & Common Questions",
    ],
  },
  Economics: {
    "001": [
      "Introduction to Economics — Scope & Basic Concepts",
      "The Economic Problem — Scarcity, Choice & Opportunity Cost",
      "Demand Theory — Law of Demand & Elasticity",
      "Supply Theory — Law of Supply & Price Determination",
      "Consumer Theory — Utility & Indifference Curve Analysis",
      "Production Theory — Factors of Production & Returns to Scale",
    ],
    "002": [
      "Market Structures — Perfect Competition, Monopoly & Oligopoly",
      "National Income Accounting — GDP, GNP & NNI",
      "Consumption, Savings & Investment Functions",
      "Money & Banking — Functions, Types & the Financial System",
      "Monetary Policy & Fiscal Policy in Nigeria",
      "International Trade — Balance of Payments & Exchange Rates",
    ],
    "003": [
      "Economic Development vs Economic Growth",
      "Agriculture in the Nigerian Economy",
      "Industry & Industrialization in Nigeria",
      "Population & Labour Market Economics",
      "Nigeria's Economic History — Colonial to Post-Independence",
      "Public Finance — Revenue, Expenditure & Taxation",
    ],
    "004": [
      "African Economic Integration — ECOWAS & AU",
      "Development Planning in Nigeria",
      "Poverty & Income Distribution in Africa",
      "Globalization & the Nigerian Economy",
      "IMF, World Bank & Structural Adjustment in Nigeria",
      "Economic Challenges & Solutions for Nigeria",
    ],
    mock: [
      "Micro vs Macro Economics — Comprehensive Revision",
      "Nigerian Economy — Key Facts and Statistics",
      "Economic Theories — Keynes, Adam Smith & Ricardo",
      "JUPEB Economics Exam Technique",
      "Mathematical Economics — Graphs, Tables & Calculations",
    ],
  },
};

function getTopicsForSubject(subjectName: string, paper: string): string[] {
  const name = subjectName.toLowerCase();
  for (const [key, papers] of Object.entries(SUBJECT_TOPICS)) {
    if (name.includes(key.toLowerCase())) {
      return papers[paper] || papers["001"] || [];
    }
  }
  return [
    "Introduction & Overview of the Subject",
    "Core Theoretical Concepts",
    "Historical Development and Context",
    "Practical Application and Analysis",
    "Exam Preparation and Past Questions",
  ];
}

// ─── MCQ Types ────────────────────────────────────────────────────────────────

interface MCQ {
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

function parseMCQs(raw: string): MCQ[] {
  try {
    const start = raw.indexOf("===QUIZ===");
    const end = raw.indexOf("===END===");
    if (start === -1 || end === -1) return [];
    const json = raw.slice(start + 10, end).trim();
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed.slice(0, 10);
  } catch {}
  return [];
}

function getLectureText(raw: string): string {
  const idx = raw.indexOf("===QUIZ===");
  return idx === -1 ? raw : raw.slice(0, idx).trim();
}

// ─── Lecture Renderer ─────────────────────────────────────────────────────────

function LectureRenderer({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1 text-sm leading-[1.85] text-white/85">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={i} className="h-3" />;

        // Horizontal rule
        if (/^[━─═]{5,}/.test(trimmed)) {
          return <hr key={i} className="border-white/10 my-3" />;
        }

        // Main lecture title
        if (trimmed.startsWith("📚 LECTURE:") || trimmed.startsWith("📚 LECTURE —")) {
          return (
            <h1 key={i} className="text-xl md:text-2xl font-bold text-white font-serif mt-2 mb-1">
              {trimmed.replace(/^📚 LECTURE:?\s*/, "")}
            </h1>
          );
        }

        // Section headers — ALL CAPS lines or lines starting with SECTION/INTRODUCTION/KEY etc.
        const isSectionHeader =
          /^(SECTION \d+|INTRODUCTION|KEY POINTS|COMMON EXAM|PRACTICE QUESTIONS|EXAM TIPS|SUMMARY|OVERVIEW|CONCLUSION|BACKGROUND|DEFINITION|ANALYSIS|APPLICATION)/.test(trimmed.toUpperCase()) ||
          (trimmed === trimmed.toUpperCase() && trimmed.length > 4 && trimmed.length < 60 && /^[A-Z]/.test(trimmed) && !/^[•\-\d]/.test(trimmed));

        if (isSectionHeader) {
          return (
            <div key={i} className="mt-5 mb-2">
              <h2 className="text-base font-bold text-emerald-400 tracking-wide uppercase text-[13px]">
                {trimmed}
              </h2>
            </div>
          );
        }

        // Emoji-led sub-headers
        if (/^[🔑💡📌⚡✅🎯📖🏛️⚔️🌍🧠📊🔬⚗️✝️🇳🇬]/.test(trimmed) && trimmed.length < 80) {
          return (
            <div key={i} className="mt-4 mb-1">
              <h3 className="text-sm font-bold text-violet-300">{trimmed}</h3>
            </div>
          );
        }

        // Bullet points
        if (/^[•–\-]\s/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2.5 pl-2">
              <span className="text-emerald-500 mt-[3px] shrink-0">•</span>
              <p className="text-white/80">{trimmed.replace(/^[•–\-]\s/, "")}</p>
            </div>
          );
        }

        // Numbered lists
        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\./)?.[1];
          const content = trimmed.replace(/^\d+\.\s/, "");
          return (
            <div key={i} className="flex gap-2.5 pl-2">
              <span className="text-violet-400 font-bold text-xs mt-[4px] shrink-0 w-4">{num}.</span>
              <p className="text-white/80">{content}</p>
            </div>
          );
        }

        // Sub-labels (e.g. "Subject: LIT | Paper: ...")
        if (trimmed.startsWith("Subject:") || trimmed.startsWith("Paper:")) {
          return (
            <p key={i} className="text-xs text-white/35 font-mono">{trimmed}</p>
          );
        }

        // Regular paragraph
        return (
          <p key={i} className="text-white/80">{trimmed}</p>
        );
      })}
    </div>
  );
}

// ─── Interactive Quiz ─────────────────────────────────────────────────────────

function InteractiveQuiz({ questions, topic }: { questions: MCQ[]; topic: string }) {
  const [phase, setPhase] = useState<"quiz" | "results">("quiz");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));

  const q = questions[current];
  const score = answers.filter((a, i) => a === questions[i]?.ans).length;

  function handleReveal() {
    if (selected === null) return;
    const next = [...answers];
    next[current] = selected;
    setAnswers(next);
    setRevealed(true);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setPhase("results");
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  function handleRetry() {
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setAnswers(new Array(questions.length).fill(null));
    setPhase("quiz");
  }

  const scoreColor =
    score >= 8 ? "text-emerald-400" :
    score >= 6 ? "text-amber-400" :
    score >= 4 ? "text-orange-400" : "text-red-400";

  const scoreBg =
    score >= 8 ? "bg-emerald-500/10 border-emerald-500/20" :
    score >= 6 ? "bg-amber-500/10 border-amber-500/20" :
    score >= 4 ? "bg-orange-500/10 border-orange-500/20" : "bg-red-500/10 border-red-500/20";

  if (phase === "results") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 space-y-5"
      >
        <div className="text-center space-y-3">
          <div className={cn("inline-flex items-center justify-center w-16 h-16 rounded-2xl border mx-auto", scoreBg)}>
            <Award className={cn("h-8 w-8", scoreColor)} />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{score} / {questions.length}</p>
            <p className={cn("text-sm font-semibold mt-0.5", scoreColor)}>
              {score >= 8 ? "Excellent! You've mastered this topic." :
               score >= 6 ? "Good work! A little more revision needed." :
               score >= 4 ? "Fair attempt. Review the notes again." :
               "Keep studying. You'll get there!"}
            </p>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-amber-500" : score >= 4 ? "bg-orange-500" : "bg-red-500")}
              initial={{ width: 0 }}
              animate={{ width: `${(score / questions.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Review Answers</p>
          {questions.map((q, i) => {
            const userAns = answers[i];
            const correct = userAns === q.ans;
            return (
              <div key={i} className={cn(
                "p-3 rounded-xl border text-xs space-y-1",
                correct ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
              )}>
                <div className="flex items-start gap-2">
                  {correct
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    : <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />}
                  <p className="text-white/80 font-medium">{q.q}</p>
                </div>
                {!correct && (
                  <p className="text-white/40 pl-5">
                    Your answer: <span className="text-red-400">{q.opts[userAns ?? 0]}</span>
                    {" · "}Correct: <span className="text-emerald-400">{q.opts[q.ans]}</span>
                  </p>
                )}
                <p className="text-white/35 pl-5 italic">{q.exp}</p>
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleRetry}
          className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Retry Quiz
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 md:p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Practice Quiz</p>
            <p className="text-[11px] text-white/35">{topic}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-white/40">
          {current + 1} / {questions.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {questions.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              i < current
                ? answers[i] === questions[i].ans ? "bg-emerald-500" : "bg-red-500"
                : i === current ? "bg-violet-500" : "bg-white/10"
            )}
          />
        ))}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <p className="text-base font-semibold text-white leading-[1.6]">{q.q}</p>

          <div className="space-y-2">
            {q.opts.map((opt, oi) => {
              const isSelected = selected === oi;
              const isCorrect = oi === q.ans;
              let style = "border-white/10 bg-white/3 text-white/70 hover:bg-white/6 hover:border-white/20";
              if (revealed) {
                if (isCorrect) style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                else if (isSelected && !isCorrect) style = "border-red-500/40 bg-red-500/8 text-red-300";
                else style = "border-white/8 bg-white/2 text-white/30";
              } else if (isSelected) {
                style = "border-violet-500/50 bg-violet-500/10 text-violet-200";
              }

              return (
                <button
                  key={oi}
                  onClick={() => !revealed && setSelected(oi)}
                  disabled={revealed}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left text-sm transition-all",
                    style,
                    !revealed && "cursor-pointer"
                  )}
                >
                  <span className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 transition-all",
                    revealed && isCorrect ? "bg-emerald-500 text-white" :
                    revealed && isSelected && !isCorrect ? "bg-red-500 text-white" :
                    isSelected ? "bg-violet-600 text-white" : "bg-white/8 text-white/40"
                  )}>
                    {revealed && isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                     revealed && isSelected && !isCorrect ? <XCircle className="h-3.5 w-3.5" /> :
                     String.fromCharCode(65 + oi)}
                  </span>
                  <span>{opt.replace(/^[A-D]\.\s*/, "")}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200/80 leading-relaxed">{q.exp}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      {!revealed ? (
        <Button
          onClick={handleReveal}
          disabled={selected === null}
          className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl disabled:opacity-40"
        >
          Submit Answer
        </Button>
      ) : (
        <Button
          onClick={handleNext}
          className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl"
        >
          {current + 1 >= questions.length ? "See Results" : "Next Question"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </motion.div>
  );
}

// ─── Main Class Page ──────────────────────────────────────────────────────────

export default function Class() {
  const { data: subjectsRaw } = useListSubjects();
  const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];

  const [subjectId, setSubjectId] = useState("");
  const [paper, setPaper]         = useState("001");
  const [topic, setTopic]         = useState("");

  const [streaming, setStreaming] = useState(false);
  const [rawContent, setRawContent] = useState("");
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState("");
  const [quizOpen, setQuizOpen]   = useState(false);

  const [readingTime, setReadingTime]     = useState<number | null>(null);
  const [timeLeft, setTimeLeft]           = useState<number | null>(null);
  const [timerRunning, setTimerRunning]   = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  const { state: ttsState, speak, stop: stopTts } = useReadAloud();

  useEffect(() => {
    if (!timerRunning || timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) setTimerRunning(false);
      return;
    }
    const t = setInterval(() => setTimeLeft(p => (p !== null && p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [timerRunning, timeLeft]);

  const subjectName = subjects.find(s => s.id === Number(subjectId))?.name || "";
  const timerPercent = readingTime && timeLeft !== null ? ((readingTime - timeLeft) / readingTime) * 100 : 0;
  const isLowTime = timeLeft !== null && timeLeft < 60;

  const lectureText = useMemo(() => getLectureText(rawContent), [rawContent]);
  const mcqQuestions = useMemo(() => (done ? parseMCQs(rawContent) : []), [rawContent, done]);
  const suggestedTopics = useMemo(() => getTopicsForSubject(subjectName, paper), [subjectName, paper]);

  const downloadNotesPDF = () => {
    const date = new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
    const contentHTML = lectureText
      .split("\n")
      .map(line => {
        const l = line.trim();
        if (!l) return "<br>";
        if (l.startsWith("####")) return `<h4>${l.slice(4).trim()}</h4>`;
        if (l.startsWith("###"))  return `<h3>${l.slice(3).trim()}</h3>`;
        if (l.startsWith("##"))   return `<h2>${l.slice(2).trim()}</h2>`;
        if (l.startsWith("#"))    return `<h2>${l.slice(1).trim()}</h2>`;
        if (l.match(/^[-•]\s/))   return `<li>${l.slice(2)}</li>`;
        if (l.match(/^\d+\.\s/))  return `<li>${l.replace(/^\d+\.\s/, "")}</li>`;
        if (l.startsWith("═") || l === "---") return "<hr>";
        return `<p>${l.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>")}</p>`;
      })
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${topic} — ${subjectName} Notes</title>
<style>
*,*::before,*::after{box-sizing:border-box}
body{font-family:Georgia,'Times New Roman',serif;max-width:720px;margin:0 auto;padding:48px 36px;color:#1e1b4b;line-height:1.8;font-size:15px}
.cover{border-bottom:3px solid #7c3aed;margin-bottom:32px;padding-bottom:20px}
.cover h1{margin:0 0 10px;font-size:26px;color:#4c1d95;line-height:1.3}
.badge{display:inline-block;background:#ede9fe;color:#6d28d9;font-size:11px;font-family:system-ui,sans-serif;font-weight:700;padding:3px 10px;border-radius:999px;margin-right:6px;letter-spacing:.05em;text-transform:uppercase}
.date{margin-top:10px;color:#64748b;font-size:12px;font-family:system-ui,sans-serif}
h2{color:#5b21b6;font-size:18px;margin:1.8em 0 .4em;border-left:3px solid #8b5cf6;padding-left:12px}
h3{color:#6d28d9;font-size:15.5px;margin:1.4em 0 .3em}
h4{color:#7c3aed;font-size:14px;margin:1.2em 0 .3em}
p{margin:.65em 0}
li{margin:.3em 0 .3em 1em}
ul,ol{margin:.5em 0;padding-left:18px}
hr{border:none;border-top:1px solid #e2e8f0;margin:1.5em 0}
.footer{margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;font-family:system-ui,sans-serif}
@media print{body{padding:0}@page{margin:20mm 18mm}}
</style>
</head>
<body>
<div class="cover">
  <h1>${topic}</h1>
  <div><span class="badge">${subjectName}</span><span class="badge">${PAPER_LABELS[paper] || paper}</span></div>
  <p class="date">📅 ${date} &nbsp;·&nbsp; JUPEB Prep Study Notes</p>
</div>
<div>${contentHTML}</div>
<div class="footer">Generated by JUPEB Prep &nbsp;·&nbsp; For personal study use only &nbsp;·&nbsp; © ${new Date().getFullYear()}</div>
<script>window.onload=function(){window.print();}<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html; charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, "_blank");
    if (!win) {
      const a = document.createElement("a");
      a.href = url; a.download = `${subjectName}-${topic}-notes.html`; a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const handleStartLecture = async () => {
    if (!subjectId || !topic.trim()) return;

    setRawContent("");
    setDone(false);
    setError("");
    setStreaming(true);
    setReadingTime(null);
    setTimeLeft(null);
    setTimerRunning(false);
    setQuizOpen(false);
    if (ttsState === "playing") stopTts();

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const prompt = `You are LexBot — the best teacher a Nigerian JUPEB student could ever have. You teach the way the greatest classroom teachers do: vivid, passionate, storytelling. You make students FEEL the subject, not just read it. You are precise about facts, accurate about dates, and you never make up information. When a topic involves Nigerian history or African events, you use REAL verified dates and REAL people. When a topic is technical (science, economics, law), you explain it simply first, then go deep. You do NOT add scholarly jargon or academic citations unless the topic genuinely requires them — you speak like a brilliant teacher, not a dry textbook.

Subject: ${subjectName}
Topic: ${topic}
Exam Paper: ${PAPER_LABELS[paper] || paper}

═══════════════════════════════════════════════════
📚 LECTURE: ${topic.toUpperCase()}
Subject: ${subjectName}  |  Paper: ${PAPER_LABELS[paper] || paper}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## THE HOOK
[Open with a gripping story, shocking fact, real event, or vivid scenario directly connected to this topic. This is your opening 60 seconds in the classroom — the moment that makes every student lean forward. It could be a moment in Nigerian history told like a novel, a real dilemma, a paradox, or a "did you know?" that changes how the student sees the topic. 100–150 words. NO bullet points here — flowing, narrative prose only.]

## INTRODUCTION
[Now ease into the full picture. Define the topic clearly in plain language first, then explain WHY it matters — to Nigeria, to the exam, to the student's future. Tell them exactly what they will learn today and why this topic always comes up in JUPEB. 120–160 words.]

## SECTION 1: WHAT YOU NEED TO KNOW — CORE CONCEPTS
[Explain all essential concepts for this topic. Use PLAIN LANGUAGE first, then introduce technical terms only if the topic truly demands them. For each technical term, define it in a sentence a secondary school student could understand, THEN give the formal definition. If this is a history topic, tell who the key people were and what they actually did. If this is science/maths, use an everyday Nigerian analogy before the formula. If this is law or government, use a real-life Nigerian example. 300–400 words.]

## SECTION 2: THE FULL STORY — HOW THIS DEVELOPED
[This is the heart of the lecture. Tell the STORY of how this topic unfolded over time. For Nigerian/African history: use EXACT verified dates (day, month, year where known), name the real people involved, describe what they said, decided, or did. Write it like a historical novel — present tense narrative where appropriate, vivid description, human detail. For non-history topics: trace how understanding of this topic evolved, who contributed what ideas, and what changed over time. Accuracy above everything. NEVER guess a date — if you do not know the exact date, give the year and say "in [year]". 350–450 words.]

## SECTION 3: DEEPER UNDERSTANDING — ANALYSIS & ARGUMENTS
[Go beyond the facts. Present the key debates, theories, competing views, or analytical angles on this topic. Compare different perspectives fairly. For government/politics topics: compare ideological positions. For history: examine causes, consequences, and historiographical debates. For sciences: explain underlying principles and edge cases. For literature: analyze themes, style, symbolism. Use the critical thinking level that JUPEB examiners reward. Cite real scholars, commissions, leaders, or theorists only where genuinely relevant. 300–380 words.]

## SECTION 4: REAL EXAMPLES — NIGERIA AND BEYOND
[Ground everything in real, vivid examples the student will remember. Use at least 2 Nigerian/West African examples and 1 international comparison where relevant. Tell each example as a short story or case study, not just a list. Explain what the example proves about the topic. 200–280 words.]

## SECTION 5: HOW TO ACE THIS IN YOUR JUPEB EXAM
[Speak directly to the student. Tell them: what types of questions on this topic appear in JUPEB (essay, short answer, data response?), what the examiner is looking for, how to structure an A-grade answer, the exact phrases or arguments that earn top marks, and what separates a B from an A. Give a sample essay structure or outline if helpful. 150–200 words.]

## MEMORY AIDS — NEVER FORGET THIS
[Create 3–5 concrete memory tools: mnemonics (e.g. acronyms), memorable analogies, mini-stories, or rhythmic patterns to help the student remember the KEY facts. Each aid should be fun, Nigerian in feel where possible, and genuinely useful for the exam. Format clearly with bold labels. 120–180 words.]

## KEY FACTS — MUST KNOW FOR THE EXAM
[List exactly 10 bullet points. Each point must be a specific, testable fact — a date, a definition, a cause, an effect, a name. Phrases a student can memorise. Use • for each. No vague generalities — be precise.]

## COMMON EXAM MISTAKES
[List 5 specific mistakes students make on this topic in JUPEB, and for each one explain the correct approach. Use • for each. Be frank — tell them what will lose marks.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT: After the lecture, you MUST output the quiz section EXACTLY as shown below — no extra text before or after the JSON block. The JSON must be valid and parseable.

===QUIZ===
[
  {"q":"[Question 1 — recall/knowledge level]","opts":["A. [option]","B. [option]","C. [option]","D. [option]"],"ans":[0-3],"exp":"[Concise explanation of why the correct answer is right and the common wrong answers are wrong]"},
  {"q":"[Question 2 — comprehension level]","opts":["A. [option]","B. [option]","C. [option]","D. [option]"],"ans":[0-3],"exp":"[explanation]"},
  {"q":"[Question 3 — application level]","opts":["A. [option]","B. [option]","C. [option]","D. [option]"],"ans":[0-3],"exp":"[explanation]"},
  {"q":"[Question 4]","opts":["A. [option]","B. [option]","C. [option]","D. [option]"],"ans":[0-3],"exp":"[explanation]"},
  {"q":"[Question 5]","opts":["A. [option]","B. [option]","C. [option]","D. [option]"],"ans":[0-3],"exp":"[explanation]"},
  {"q":"[Question 6]","opts":["A. [option]","B. [option]","C. [option]","D. [option]"],"ans":[0-3],"exp":"[explanation]"},
  {"q":"[Question 7]","opts":["A. [option]","B. [option]","C. [option]","D. [option]"],"ans":[0-3],"exp":"[explanation]"},
  {"q":"[Question 8]","opts":["A. [option]","B. [option]","C. [option]","D. [option]"],"ans":[0-3],"exp":"[explanation]"},
  {"q":"[Question 9 — analysis/evaluation level]","opts":["A. [option]","B. [option]","C. [option]","D. [option]"],"ans":[0-3],"exp":"[explanation]"},
  {"q":"[Question 10 — synthesis/application level]","opts":["A. [option]","B. [option]","C. [option]","D. [option]"],"ans":[0-3],"exp":"[explanation]"}
]
===END===

Rules for the quiz:
- All 10 questions must be directly about the lecture topic above
- Questions must range from recall to analysis (Bloom's taxonomy)
- All 4 options must be plausible — no obviously wrong answers
- The "ans" field must be the correct 0-based index (0=A, 1=B, 2=C, 3=D)
- The "exp" must clearly explain why the correct answer is right
- Write in clear, engaging Nigerian English throughout
- ACCURACY IS SACRED: never fabricate dates, names, or facts`;

    try {
      const res = await fetch(`${BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("Failed to start lecture");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText  = "";

      while (true) {
        const { done: d, value } = await reader.read();
        if (d) break;

        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          try {
            const parsed = JSON.parse(raw);
            if (parsed.done) break;
            if (parsed.content) {
              fullText += parsed.content;
              setRawContent(fullText);
              setTimeout(() => {
                contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: "smooth" });
              }, 30);
            }
          } catch {}
        }
      }

      const lectureOnly = getLectureText(fullText);
      const words    = countWords(lectureOnly);
      const readSecs = Math.max(180, Math.ceil((words / WORDS_PER_MIN) * 60));
      setReadingTime(readSecs);
      setTimeLeft(readSecs);
      setTimerRunning(true);
      setDone(true);

      try {
        const prev = JSON.parse(localStorage.getItem("jupeb_lecture_history") || "[]");
        const record = { id: `${Date.now()}`, subjectName, paper, topic, wordCount: words, savedAt: new Date().toISOString() };
        const updated = [record, ...prev.filter((r: any) => r.id !== record.id)].slice(0, 50);
        localStorage.setItem("jupeb_lecture_history", JSON.stringify(updated));
      } catch {}

    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Failed to load lecture. Please try again.");
      }
    } finally {
      setStreaming(false);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    if (ttsState === "playing") stopTts();
    setRawContent("");
    setDone(false);
    setStreaming(false);
    setTimeLeft(null);
    setTimerRunning(false);
    setReadingTime(null);
    setError("");
    setQuizOpen(false);
  };

  if (!isActivated()) {
    return (
      <Shell>
        <PaywallGate feature="class" />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-emerald-400" />
              </div>
              Class
            </h1>
            <p className="text-white/40 text-sm mt-1 ml-[52px]">Deep AI lectures + 10 interactive test questions per topic</p>
          </div>

          {done && timeLeft !== null && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm font-bold flex-shrink-0",
              isLowTime
                ? "bg-red-500/15 text-red-400 border-red-500/25 animate-pulse"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
            )}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)} left
            </div>
          )}
        </div>

        {/* ── Setup Card ── */}
        {!streaming && !done && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 md:p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">Start a New Lecture</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Subject</label>
                <Select value={subjectId} onValueChange={v => { setSubjectId(v); setTopic(""); }}>
                  <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choose a subject…" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e28] border-white/10">
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()} className="text-white">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Paper / Exam</label>
                <Select value={paper} onValueChange={v => { setPaper(v); setTopic(""); }}>
                  <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e28] border-white/10">
                    {Object.entries(PAPER_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v} className="text-white">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dynamic topic chips */}
            {subjectId && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <p className="text-[11px] font-bold text-white/35 uppercase tracking-wider">Select a topic from the syllabus:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTopics.map(t => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border text-xs transition-all text-left",
                        topic === t
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-semibold"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-violet-500/10 hover:border-violet-500/25 hover:text-violet-300"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-white/25">Or type any custom topic below</p>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Topic</label>
              <input
                type="text"
                placeholder={subjectId ? "Selected above or type a custom topic…" : "Choose a subject first…"}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleStartLecture()}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-violet-500/40 transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
            )}

            <Button
              onClick={handleStartLecture}
              disabled={!subjectId || !topic.trim()}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Begin Deep Lecture
            </Button>

            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: "📡", text: "2000-word academic lecture" },
                { emoji: "🧠", text: "10 interactive MCQ questions" },
                { emoji: "📖", text: "Syllabus-driven topics" },
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center text-center p-3 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-lg mb-1">{t.emoji}</span>
                  <p className="text-[10px] text-white/30 leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Lecture View ── */}
        {(streaming || done) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex-shrink-0">
                  {subjectName}
                </span>
                <ChevronRight className="h-3 w-3 text-white/20 flex-shrink-0" />
                <span className="text-sm text-white/60 font-medium truncate">{topic}</span>
                {streaming && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-[11px] font-bold flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    LIVE
                  </div>
                )}
                {done && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/30 text-[11px]">
                    {PAPER_LABELS[paper]}
                  </span>
                )}
              </div>

              {done && (
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  <button
                    onClick={() => ttsState === "playing" ? stopTts() : speak(lectureText)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-300 transition-all"
                  >
                    {ttsState === "playing"
                      ? <><Square className="h-3 w-3" /> Stop</>
                      : <><Volume2 className="h-3.5 w-3.5" /> Read Aloud</>}
                  </button>
                  <button
                    onClick={downloadNotesPDF}
                    title="Download notes as PDF"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-violet-500/10 hover:border-violet-500/20 hover:text-violet-300 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 transition-all"
                  >
                    <RotateCcw className="h-3 w-3" /> New Lecture
                  </button>
                </div>
              )}
            </div>

            {/* Reading progress */}
            {done && readingTime && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-white/30">
                  <span>Reading session</span>
                  <span>
                    {timeLeft !== null ? formatTime(timeLeft) : "0:00"} remaining
                    {readingTime ? ` of ${formatTime(readingTime)}` : ""}
                  </span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full transition-colors", isLowTime ? "bg-red-500" : "bg-emerald-500")}
                    animate={{ width: `${timerPercent}%` }}
                    transition={{ duration: 0.8, ease: "linear" }}
                  />
                </div>
                {timeLeft === 0 && (
                  <p className="text-[11px] text-amber-400 text-center font-medium">
                    ⏰ Reading time complete — attempt the quiz below!
                  </p>
                )}
              </div>
            )}

            {/* Lecture content */}
            <div
              ref={contentRef}
              className="glass-card overflow-y-auto"
              style={{ maxHeight: "65vh" }}
            >
              {lectureText ? (
                <div className="p-5 md:p-8">
                  {done
                    ? <LectureRenderer text={lectureText} />
                    : (
                      <pre className="whitespace-pre-wrap text-white/85 text-sm leading-[1.85] font-sans">
                        {lectureText}
                        {streaming && (
                          <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5 rounded-sm align-middle" />
                        )}
                      </pre>
                    )
                  }
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/30">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">LexBot is preparing your lecture…</span>
                  <span className="text-xs text-white/20">Expect a deep 2000-word academic note</span>
                </div>
              )}
            </div>

            {/* Quiz toggle banner — only when done and MCQs parsed */}
            {done && mcqQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={() => setQuizOpen(v => !v)}
                  className="w-full flex items-center justify-between gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/15 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Practice Quiz — {mcqQuestions.length} Questions</p>
                      <p className="text-xs text-white/40">Test yourself on {topic}</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-violet-400 transition-transform", quizOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {quizOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-3"
                    >
                      <InteractiveQuiz questions={mcqQuestions} topic={topic} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Streaming — quiz not ready yet */}
            {done && mcqQuestions.length === 0 && (
              <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Ready to test yourself?</p>
                    <p className="text-xs text-white/40">Take a full quiz on {topic}</p>
                  </div>
                </div>
                <a href="/quiz">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl whitespace-nowrap">
                    Start Quiz →
                  </Button>
                </a>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Shell>
  );
}
