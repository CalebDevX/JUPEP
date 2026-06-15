import { useState, useMemo } from "react";
import { useListQuestions, useListSubjects, ListQuestionsPaper, ListQuestionsQuestionType } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, SearchX } from "lucide-react";
import { Link } from "wouter";

const PAPER_LABELS: Record<string, string> = {
  "001": "1st Incourse",
  "002": "1st Semester Exam",
  "003": "2nd Incourse",
  "004": "Mock Exam",
};

export default function Questions() {
  const [subjectId, setSubjectId] = useState<string>("all");
  const [paper, setPaper] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: subjects } = useListSubjects();
  
  const queryParams = useMemo(() => {
    return {
      ...(subjectId !== "all" ? { subjectId: Number(subjectId) } : {}),
      ...(paper !== "all" ? { paper: paper as ListQuestionsPaper } : {}),
      ...(type !== "all" ? { questionType: type as ListQuestionsQuestionType } : {}),
      limit,
      offset: (page - 1) * limit
    };
  }, [subjectId, paper, type, page]);

  const { data: questions, isLoading } = useListQuestions(queryParams);

  return (
    <Shell>
      <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Questions Bank</h1>
            <p className="text-muted-foreground mt-1">Browse and review past examination questions.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects?.map(s => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={paper} onValueChange={(v) => { setPaper(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Papers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Papers</SelectItem>
                <SelectItem value="001">1st Incourse</SelectItem>
                <SelectItem value="002">1st Semester</SelectItem>
                <SelectItem value="003">2nd Incourse</SelectItem>
                <SelectItem value="004">Mock Exam</SelectItem>
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="objective">Objective</SelectItem>
                <SelectItem value="theory">Theory</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          ) : questions?.length === 0 ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-serif font-bold text-foreground">No questions found</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mb-6">
                  We couldn't find any questions matching your filters. Try adjusting your search criteria.
                </p>
                <Link href="/admin">
                  <Button variant="outline">Go to Admin to add questions</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {questions?.map((q) => (
                <Card key={q.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30 py-3 px-6 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">{q.subjectName}</Badge>
                        <Badge variant="secondary">{PAPER_LABELS[q.paper]}</Badge>
                        <Badge variant={q.questionType === 'objective' ? 'default' : 'secondary'}>
                          {q.questionType === 'objective' ? 'Objective' : 'Theory'}
                        </Badge>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Year: {q.year}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">{q.questionText}</p>
                      
                      {q.questionType === 'objective' && q.options && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.options.map((opt, i) => {
                            const labels = ['A', 'B', 'C', 'D'];
                            const isCorrect = q.correctOption === labels[i];
                            return (
                              <div 
                                key={i} 
                                className={`p-3 rounded border text-sm flex gap-3 ${isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' : 'bg-background border-border'}`}
                              >
                                <span className="font-bold">{labels[i]}.</span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.explanation && (
                        <div className="mt-4 p-4 rounded-md bg-accent/50 text-sm border-l-2 border-primary">
                          <strong className="block mb-1 font-serif">Explanation:</strong>
                          <span className="whitespace-pre-wrap">{q.explanation}</span>
                        </div>
                      )}

                      {q.questionType === 'theory' && q.markingGuide && (
                        <div className="mt-4 p-4 rounded-md bg-accent/50 text-sm border-l-2 border-primary">
                          <strong className="block mb-1 font-serif">Marking Guide ({q.marks} marks):</strong>
                          <span className="whitespace-pre-wrap">{q.markingGuide}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex items-center justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Page
                </Button>
                <span className="text-sm font-medium">Page {page}</span>
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={questions?.length < limit}
                >
                  Next Page
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}
