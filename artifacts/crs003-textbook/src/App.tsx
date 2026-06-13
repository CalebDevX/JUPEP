import { useState, useEffect, useRef } from "react";
import { allCourses, type Course, type Chapter } from "./data";
import { downloadCourseDoc } from "./utils/docExport";

function renderContent(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const subParts = part.split(/(\*[^*\n]+\*)/g);
    return subParts.map((sub, j) => {
      if (sub.startsWith("*") && sub.endsWith("*") && sub.length > 2) {
        return <em key={`${i}-${j}`}>{sub.slice(1, -1)}</em>;
      }
      return <span key={`${i}-${j}`}>{sub}</span>;
    });
  });
}

function renderParagraphs(content: string): React.ReactNode[] {
  const blocks = content.trim().split(/\n\n+/);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    // Markdown table
    if (block.includes("|") && block.includes("---")) {
      const lines = block.split("\n").filter(l => l.trim());
      const headerLine = lines[0];
      const bodyLines = lines.slice(2);
      const headers = headerLine.split("|").map(h => h.trim()).filter(Boolean);
      const rows = bodyLines.map(row => row.split("|").map(c => c.trim()).filter(Boolean));
      elements.push(
        <div key={i} className="overflow-x-auto my-5">
          <table className="w-full text-sm border-collapse border border-stone-300">
            <thead>
              <tr className="bg-stone-100">
                {headers.map((h, hi) => (
                  <th key={hi} className="border border-stone-300 px-3 py-2 text-left font-semibold text-stone-800 font-sans">
                    {renderContent(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-stone-300 px-3 py-2 text-stone-700">
                      {renderContent(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const lines = block.split("\n").filter(l => l.trim());

    // Bullet list
    if (lines.length > 0 && lines.every(l => /^[-*]/.test(l.trim()))) {
      const items = lines.map(l => l.replace(/^[-*]\s*/, "").trim());
      elements.push(
        <ul key={i} className="list-disc list-outside ml-6 my-3 space-y-1.5">
          {items.map((item, ii) => (
            <li key={ii} className="text-stone-700 leading-relaxed text-[15px]">
              {renderContent(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (lines.length > 0 && lines.every(l => /^\d+\./.test(l.trim()))) {
      const items = lines.map(l => l.replace(/^\d+\.\s*/, "").trim());
      elements.push(
        <ol key={i} className="list-decimal list-outside ml-6 my-3 space-y-1.5">
          {items.map((item, ii) => (
            <li key={ii} className="text-stone-700 leading-relaxed text-[15px]">
              {renderContent(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="my-3 text-stone-800 leading-[1.9] text-[15px]">
        {renderContent(block.replace(/\n/g, " "))}
      </p>
    );
  }
  return elements;
}

// ─── Home Page ──────────────────────────────────────────────────────────────

function HomePage({ onSelectCourse }: { onSelectCourse: (code: string) => void }) {
  return (
    <div className="min-h-screen bg-[#f9f6f0]">
      {/* Title block */}
      <div className="border-b-4 border-stone-800 bg-stone-900 text-amber-50 px-8 py-14 text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-amber-400 mb-3 font-sans">
          University of Lagos · School of Foundation Studies
        </p>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 leading-tight">
          JUPEB Christian<br />Religious Studies
        </h1>
        <p className="text-amber-300 font-serif text-lg mb-1">CRS 001 · CRS 002 · CRS 003 · CRS 004</p>
        <p className="text-stone-400 text-xs font-sans mt-4">
          Compiled from official JUPEB/UNILAG lecture notes · Dr. Falako, Francis O.
        </p>
      </div>

      {/* Download banner */}
      <div className="bg-stone-100 border-b border-stone-300 px-6 md:px-8 py-4">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-3 justify-between">
          <p className="text-stone-600 text-sm font-sans">
            Download the complete textbook as a Word document for printing and offline study.
          </p>
          <button
            onClick={() => downloadCourseDoc()}
            className="flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white font-sans text-[12px] font-bold uppercase tracking-wider px-5 py-2.5 transition-colors shrink-0"
          >
            ↓ Download Complete Textbook (.doc)
          </button>
        </div>
      </div>

      {/* Preface */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 pt-10 pb-8 border-b border-stone-200">
        <h2 className="font-sans text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-3">Preface</h2>
        <p className="text-stone-700 leading-relaxed text-[15px] mb-3">
          This digital textbook covers the complete four-course JUPEB Christian Religious Studies curriculum. It draws directly on the official University of Lagos School of Foundation Studies lecture notes and syllabus, presenting the content in a systematic, scholarly format designed to support examination preparation and deeper academic study.
        </p>
        <p className="text-stone-700 leading-relaxed text-[15px]">
          Each chapter contains full expository content, in-text definitions, key terms presented in a reference-style glossary, and practice questions drawn from examination topics. <em>CRS 001 (Old Testament Studies)</em> and <em>CRS 002 (New Testament Studies: The Gospels)</em> are first-semester courses; <em>CRS 003 (History of Christianity in West Africa)</em> and <em>CRS 004 (Religion and Society)</em> are second-semester courses — totalling 12 credit units.
        </p>
      </div>

      {/* Course listings */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-10">
        <h2 className="font-sans text-[11px] font-bold text-stone-500 uppercase tracking-widest border-b border-stone-300 pb-2 mb-6">
          Course Contents
        </h2>
        <div className="space-y-5">
          {allCourses.map((course) => (
            <div key={course.code} className="border border-stone-300 bg-white shadow-sm">
              <button
                onClick={() => onSelectCourse(course.code)}
                className="w-full text-left px-6 py-5 hover:bg-stone-50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className={`text-[11px] font-bold font-sans tracking-widest ${course.textClass} uppercase`}>
                        {course.code}
                      </span>
                      <span className="text-[11px] text-stone-400 font-sans">{course.semester} · {course.units} Units</span>
                    </div>
                    <p className="font-serif text-lg font-semibold text-stone-900 leading-snug">{course.title}</p>
                    <p className="text-stone-500 text-sm mt-1.5 leading-relaxed font-sans line-clamp-2">{course.description}</p>
                    <p className="text-xs text-stone-400 mt-2 font-sans">{course.chapters.length} chapters</p>
                  </div>
                  <span className="text-stone-300 group-hover:text-stone-600 text-xl mt-1 shrink-0 transition-colors">›</span>
                </div>
              </button>
              <div className="border-t border-stone-100 px-6 py-3 bg-stone-50">
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  {course.chapters.map(ch => (
                    <span key={ch.id} className="text-[11px] text-stone-500 font-sans">
                      Ch.{ch.number}: {ch.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Course Overview Page ────────────────────────────────────────────────────

function CoursePage({
  course,
  onSelectChapter,
  onBack,
}: {
  course: Course;
  onSelectChapter: (ch: Chapter) => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#f9f6f0]">
      <div className={`${course.colorClass} text-white px-6 md:px-8 py-10`}>
        <button
          onClick={onBack}
          className="text-white/60 hover:text-white text-sm font-sans mb-5 flex items-center gap-1 transition-colors"
        >
          ← All Courses
        </button>
        <p className="text-[11px] tracking-[0.3em] uppercase opacity-70 mb-2 font-sans">
          {course.semester} · {course.units} Units
        </p>
        <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-1">{course.code}</h1>
        <h2 className="text-xl font-serif opacity-90 mb-4">{course.title}</h2>
        <p className="text-sm opacity-75 font-sans max-w-2xl leading-relaxed">{course.description}</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-10">
        {/* Objectives */}
        <div className="mb-10">
          <h3 className="font-sans font-bold text-stone-500 text-[11px] uppercase tracking-widest border-b border-stone-300 pb-2 mb-4">
            Specific Objectives
          </h3>
          <p className="text-sm text-stone-500 font-sans mb-3 italic">
            At the end of the study of this course, candidates should be able to:
          </p>
          <ol className="space-y-2">
            {course.objectives.map((obj, i) => (
              <li key={i} className="flex gap-3 text-stone-700 text-[14.5px] leading-relaxed">
                <span className="font-bold text-stone-400 font-sans shrink-0">{i + 1}.</span>
                <span>{obj}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Chapter list */}
        <h3 className="font-sans font-bold text-stone-500 text-[11px] uppercase tracking-widest border-b border-stone-300 pb-2 mb-4">
          Chapter Contents
        </h3>
        <div className="space-y-3">
          {course.chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch)}
              className="w-full text-left border border-stone-200 bg-white hover:border-stone-500 hover:bg-stone-50 transition-all px-5 py-4 group shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className={`text-[11px] font-bold font-sans ${course.textClass} uppercase tracking-wider`}>
                    Chapter {ch.number}
                  </span>
                  <p className="font-serif font-semibold text-stone-800 mt-0.5 leading-snug">{ch.title}</p>
                  <p className="text-[11px] text-stone-400 mt-1 font-sans">
                    {ch.sections.length} sections · {ch.keyTerms.length} key terms · {ch.practiceQuestions.length} exam questions
                  </p>
                </div>
                <span className="text-stone-300 group-hover:text-stone-600 text-lg mt-1 shrink-0 transition-colors">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chapter Reader Page ─────────────────────────────────────────────────────

function ChapterPage({
  course,
  chapter,
  allChapters,
  onBack,
  onSelectChapter,
}: {
  course: Course;
  chapter: Chapter;
  allChapters: Chapter[];
  onBack: () => void;
  onSelectChapter: (ch: Chapter) => void;
}) {
  const [showTOC, setShowTOC] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const chIdx = allChapters.findIndex(c => c.id === chapter.id);
  const prevCh = chIdx > 0 ? allChapters[chIdx - 1] : null;
  const nextCh = chIdx < allChapters.length - 1 ? allChapters[chIdx + 1] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveSection(0);
    setShowTOC(false);
  }, [chapter.id]);

  useEffect(() => {
    const onScroll = () => {
      const tops = sectionRefs.current.map(r => r?.getBoundingClientRect().top ?? Infinity);
      let active = 0;
      for (let i = 0; i < tops.length; i++) {
        if (tops[i] <= 100) active = i;
      }
      setActiveSection(active);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapter]);

  return (
    <div className="min-h-screen bg-[#f9f6f0]">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-stone-900 text-white shadow-md">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <button
            onClick={onBack}
            className="text-stone-400 hover:text-white text-sm font-sans transition-colors flex items-center gap-1 shrink-0"
          >
            ← {course.code}
          </button>
          <span className="text-stone-600 hidden sm:inline">|</span>
          <span className="text-stone-300 text-sm font-serif truncate hidden sm:block flex-1">
            Ch. {chapter.number}: {chapter.title}
          </span>
          <button
            onClick={() => setShowTOC(v => !v)}
            className="ml-auto text-[11px] font-sans text-stone-400 hover:text-white border border-stone-700 hover:border-stone-500 px-3 py-1 transition-colors shrink-0"
          >
            Sections {showTOC ? "▲" : "▾"}
          </button>
        </div>

        {showTOC && (
          <div className="border-t border-stone-700 bg-stone-800 px-4 py-3 max-h-72 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-0.5">
              {chapter.sections.map((sec, i) => (
                <button
                  key={i}
                  onClick={() => {
                    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setShowTOC(false);
                  }}
                  className={`block text-left w-full text-[13px] px-2 py-1.5 font-sans transition-colors ${
                    activeSection === i ? "text-amber-400" : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {sec.heading}
                </button>
              ))}
              {[["chapter-summary","Chapter Summary"],["key-terms","Key Terms & Definitions"],["practice-questions","Practice Questions"]].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setShowTOC(false); }}
                  className="block text-left w-full text-[13px] px-2 py-1.5 font-sans text-stone-500 hover:text-stone-200 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        {/* Chapter heading */}
        <div className="border-b-2 border-stone-800 pt-10 pb-6 mb-8">
          <p className={`text-[11px] font-bold font-sans ${course.textClass} uppercase tracking-widest mb-1`}>
            {course.code} — Chapter {chapter.number}
          </p>
          <h1 className="font-serif text-3xl md:text-[2.2rem] font-bold text-stone-900 leading-tight">
            {chapter.title}
          </h1>
        </div>

        {/* Sections */}
        {chapter.sections.map((section, i) => (
          <div
            key={i}
            ref={el => { sectionRefs.current[i] = el; }}
            className="mb-10 scroll-mt-16"
          >
            <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-300 pb-2 mb-4">
              {section.heading}
            </h2>
            {renderParagraphs(section.content)}
          </div>
        ))}

        {/* Summary block */}
        <div id="chapter-summary" className="my-10 border-l-4 border-stone-700 bg-stone-100 px-6 py-5 scroll-mt-16">
          <p className="text-[11px] font-bold font-sans uppercase tracking-widest text-stone-500 mb-2">Chapter Summary</p>
          <p className="text-stone-800 leading-[1.85] text-[15px]">{chapter.summary}</p>
        </div>

        {/* Key terms table */}
        <div id="key-terms" className="my-10 scroll-mt-16">
          <h2 className="font-sans font-bold text-stone-500 text-[11px] uppercase tracking-widest border-b-2 border-stone-800 pb-2 mb-0">
            Key Terms &amp; Definitions
          </h2>
          <div className="border-l border-r border-b border-stone-300">
            {chapter.keyTerms.map((kt, i) => (
              <div
                key={i}
                className={`flex border-b last:border-b-0 border-stone-200 ${i % 2 === 0 ? "bg-white" : "bg-stone-50"}`}
              >
                <div className="w-44 md:w-52 shrink-0 px-4 py-3 border-r border-stone-200 flex items-start">
                  <p className="font-bold text-stone-900 font-serif text-[14px] leading-snug">{kt.term}</p>
                </div>
                <div className="flex-1 px-4 py-3">
                  <p className="text-stone-700 text-[13.5px] leading-relaxed font-sans">{kt.definition}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice questions */}
        <div id="practice-questions" className="my-10 mb-16 scroll-mt-16">
          <h2 className="font-sans font-bold text-stone-500 text-[11px] uppercase tracking-widest border-b-2 border-stone-800 pb-2 mb-4">
            Practice &amp; Examination Questions
          </h2>
          <div className="space-y-3">
            {chapter.practiceQuestions.map((q, i) => (
              <div key={i} className="flex gap-4 border border-stone-200 bg-white px-5 py-4 shadow-sm">
                <span className={`text-base font-bold font-serif shrink-0 ${course.textClass} w-6`}>{i + 1}.</span>
                <p className="text-stone-800 leading-relaxed text-[15px]">{q}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chapter nav */}
        <div className="border-t border-stone-200 py-8 flex justify-between gap-4 mb-10">
          {prevCh ? (
            <button
              onClick={() => onSelectChapter(prevCh)}
              className="border border-stone-300 bg-white hover:bg-stone-50 px-5 py-3 text-left group transition-colors flex-1 max-w-xs shadow-sm"
            >
              <p className="text-[11px] font-sans text-stone-400 uppercase tracking-wide mb-1">← Previous Chapter</p>
              <p className="font-serif text-sm font-semibold text-stone-800 group-hover:text-stone-900 leading-snug">
                Ch. {prevCh.number}: {prevCh.title}
              </p>
            </button>
          ) : <div className="flex-1 max-w-xs" />}

          {nextCh ? (
            <button
              onClick={() => onSelectChapter(nextCh)}
              className="border border-stone-300 bg-white hover:bg-stone-50 px-5 py-3 text-right group transition-colors flex-1 max-w-xs ml-auto shadow-sm"
            >
              <p className="text-[11px] font-sans text-stone-400 uppercase tracking-wide mb-1">Next Chapter →</p>
              <p className="font-serif text-sm font-semibold text-stone-800 group-hover:text-stone-900 leading-snug">
                Ch. {nextCh.number}: {nextCh.title}
              </p>
            </button>
          ) : <div className="flex-1 max-w-xs" />}
        </div>
      </div>
    </div>
  );
}

// ─── Root App ────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<"home" | "course" | "chapter">("home");
  const [course, setCourse] = useState<Course | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);

  function openCourse(code: string) {
    const c = allCourses.find(x => x.code === code);
    if (c) { setCourse(c); setChapter(null); setView("course"); }
  }

  function openChapter(ch: Chapter) {
    setChapter(ch);
    setView("chapter");
    window.scrollTo(0, 0);
  }

  if (view === "chapter" && course && chapter) {
    return (
      <ChapterPage
        course={course}
        chapter={chapter}
        allChapters={course.chapters}
        onBack={() => setView("course")}
        onSelectChapter={openChapter}
      />
    );
  }

  if (view === "course" && course) {
    return (
      <CoursePage
        course={course}
        onSelectChapter={openChapter}
        onBack={() => setView("home")}
      />
    );
  }

  return <HomePage onSelectCourse={openCourse} />;
}
