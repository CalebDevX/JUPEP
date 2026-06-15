import { useState, useMemo } from "react";
import { useListQuestions, useListSubjects, ListQuestionsPaper, ListQuestionsQuestionType } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, SearchX, CheckCircle, Lightbulb, FileText } from "lucide-react";
import { useSearchParams } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PAPER_LABELS: Record<string, string> = {
  "001": "1st Incourse",
  "002": "1st Semester",
  "003": "2nd Incourse",
  "004": "Mock Exam",
};

const SUBJECT_COLORS: Record<string, string> = {
  "Literature-in-English": "bg-violet-500/15 text-violet-300 border-violet-500/25",
  "Government": "bg-blue-500/15 text-blue-300 border-blue-500/25",
  "Christian Religious Studies": "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
};

export default function Questions() {
  const [searchParams] = useSearchParams();
  const [subjectId, setSubjectId] = useState<string>(searchParams.get("subjectId") || "all");
  const [paper, setPaper] = useState<string>(searchParams.get("paper") || "all");
  const [type, setType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const limit = 10;

  const { data: subjects } = useListSubjects();

  const queryParams = useMemo(() => ({
    ...(subjectId !== "all" ? { subjectId: Number(subjectId) } : {}),
    ...(paper !== "all" ? { paper: paper as ListQuestionsPaper } : {}),
    ...(type !== "all" ? { questionType: type as ListQuestionsQuestionType } : {}),
    limit,
    offset: (page - 1) * limit,
  }), [subjectId, paper, type, page]);

  const { data: questions, isLoading } = useListQuestions(queryParams);

  return (
    <Shell>
      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-emerald-400" />
              </div>
              Question Bank
            </h1>
            <p className="text-white/40 text-sm mt-1">Browse and study real JUPEB past exam questions.</p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={subjectId} onValueChange={v => { setSubjectId(v); setPage(1); }}>
            <SelectTrigger className="w-[165px] bg-white/5 border-white/10 text-white h-9 text-sm">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e28] border-white/10">
              <SelectItem value="all" className="text-white">All Subjects</SelectItem>
              {(Array.isArray(subjects) ? subjects : []).map(s => (
                <SelectItem key={s.id} value={s.id.toString()} className="text-white">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paper} onValueChange={v => { setPaper(v); setPage(1); }}>
            <SelectTrigger className="w-[145px] bg-white/5 border-white/10 text-white h-9 text-sm">
              <SelectValue placeholder="All Papers" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e28] border-white/10">
              <SelectItem value="all" className="text-white">All Papers</SelectItem>
              <SelectItem value="001" className="text-white">1st Incourse</SelectItem>
              <SelectItem value="002" className="text-white">1st Semester</SelectItem>
              <SelectItem value="003" className="text-white">2nd Incourse</SelectItem>
              <SelectItem value="004" className="text-white">Mock Exam</SelectItem>
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={v => { setType(v); setPage(1); }}>
            <SelectTrigger className="w-[130px] bg-white/5 border-white/10 text-white h-9 text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e28] border-white/10">
              <SelectItem value="all" className="text-white">All Types</SelectItem>
              <SelectItem value="objective" className="text-white">Objective</SelectItem>
              <SelectItem value="theory" className="text-white">Theory</SelectItem>
            </SelectContent>
          </Select>

          {questions && (
            <span className="text-xs text-white/30 ml-auto">
              {questions.length} question{questions.length !== 1 ? "s" : ""} on this page
            </span>
          )}
        </div>

        {/* Questions list */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 bg-white/5 rounded-2xl" />
            ))
          ) : questions?.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-card p-12 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <SearchX className="h-7 w-7 text-white/30" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-2">No questions found</h3>
              <p className="text-white/40 text-sm">Try adjusting your filters or clearing the selection.</p>
            </motion.div>
          ) : (
            (Array.isArray(questions) ? questions : []).map((q, i) => {
              const isExpanded = expandedId === q.id;
              const subjectColor = SUBJECT_COLORS[q.subjectName || ""] || "bg-violet-500/15 text-violet-300 border-violet-500/25";
              const optionLabels = ["A", "B", "C", "D"];

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card overflow-hidden"
                >
                  <button
                    className="w-full text-left p-4 hover:bg-white/3 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="h-3.5 w-3.5 text-white/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/85 leading-relaxed line-clamp-2">
                          {q.questionText}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          <Badge className={cn("text-[10px] border px-1.5 py-0", subjectColor)}>
                            {q.subjectName}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] bg-white/5 text-white/40 border-0 px-1.5 py-0">
                            {PAPER_LABELS[q.paper]}
                          </Badge>
                          <Badge variant="secondary" className={cn(
                            "text-[10px] border-0 px-1.5 py-0",
                            q.questionType === "objective"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-pink-500/10 text-pink-400"
                          )}>
                            {q.questionType === "objective" ? "Objective" : "Theory"}
                          </Badge>
                          <span className="text-[10px] text-white/25">Year {q.year}</span>
                        </div>
                      </div>
                      <div className={cn(
                        "text-white/30 flex-shrink-0 mt-1 transition-transform",
                        isExpanded && "rotate-180"
                      )}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-t border-white/5 p-4 space-y-4"
                    >
                      {/* Options for objective */}
                      {q.questionType === "objective" && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, idx) => {
                            const label = optionLabels[idx];
                            const isCorrect = q.correctOption === label;
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-xl text-sm border transition-colors",
                                  isCorrect
                                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                                    : "bg-white/3 border-white/8 text-white/70"
                                )}
                              >
                                <span className={cn(
                                  "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                                  isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/50"
                                )}>
                                  {label}
                                </span>
                                <span className="flex-1 leading-relaxed">{opt}</span>
                                {isCorrect && <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="flex gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
                          <Lightbulb className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-amber-400 mb-1">Explanation</p>
                            <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
                          </div>
                        </div>
                      )}

                      {/* Marking guide for theory */}
                      {q.questionType === "theory" && q.markingGuide && (
                        <div className="flex gap-3 p-4 rounded-xl bg-violet-500/8 border border-violet-500/20">
                          <CheckCircle className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-violet-400 mb-1">
                              Marking Guide · {q.marks} mark{q.marks !== 1 ? "s" : ""}
                            </p>
                            <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">{q.markingGuide}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {questions && questions.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-white/50 hover:text-white border border-white/10 hover:border-white/20 h-9"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-sm text-white/30">Page {page}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={(questions?.length ?? 0) < limit}
              className="text-white/50 hover:text-white border border-white/10 hover:border-white/20 h-9"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </Shell>
  );
}
