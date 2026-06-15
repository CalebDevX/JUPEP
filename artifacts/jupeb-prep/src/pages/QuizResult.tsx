import { useGetQuizSession } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, ChevronRight, BarChart3, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function QuizResult() {
  const [, params] = useRoute("/quiz/result/:id");
  const id = Number(params?.id);

  const { data: session, isLoading } = useGetQuizSession(id, {
    query: { enabled: !!id }
  });

  if (isLoading) {
    return (
      <Shell>
        <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Shell>
    );
  }

  if (!session || session.status !== "completed") {
    return (
      <Shell>
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold font-serif mb-2">Result Not Available</h2>
          <p className="text-muted-foreground mb-6">This quiz session has not been completed yet.</p>
          <Link href="/quiz">
            <Button>Return to Quizzes</Button>
          </Link>
        </div>
      </Shell>
    );
  }

  // Calculate stats from questions since the API returns the result on session completion
  // but we might need to derive some details if not fully attached (assuming basic info is attached or we show raw score).
  const score = session.score || 0;
  const total = session.totalMarks || session.questions.length;
  const percentage = Math.round((score / total) * 100);
  
  let grade = "F";
  let gradeColor = "text-red-500";
  if (percentage >= 70) { grade = "A"; gradeColor = "text-green-500"; }
  else if (percentage >= 60) { grade = "B"; gradeColor = "text-blue-500"; }
  else if (percentage >= 50) { grade = "C"; gradeColor = "text-yellow-500"; }
  else if (percentage >= 45) { grade = "D"; gradeColor = "text-orange-500"; }
  else if (percentage >= 40) { grade = "E"; gradeColor = "text-orange-600"; }

  return (
    <Shell>
      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/"><span className="hover:text-foreground cursor-pointer">Dashboard</span></Link>
          <ChevronRight className="h-4 w-4" />
          <span>Quiz Result</span>
        </div>

        <Card className="overflow-hidden border-t-4 shadow-lg" style={{ borderTopColor: 'hsl(var(--primary))' }}>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="p-8 bg-muted/30 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r">
                <h3 className="font-serif text-xl font-bold mb-2">Final Grade</h3>
                <div className={`text-7xl font-bold font-serif mb-4 ${gradeColor}`}>{grade}</div>
                <div className="text-2xl font-bold">{percentage}%</div>
                <div className="text-muted-foreground text-sm mt-1">{score} out of {total} points</div>
              </div>
              
              <div className="p-8 col-span-2 flex flex-col justify-center space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">{session.subjectName}</h2>
                  <p className="text-muted-foreground mt-1 capitalize">Paper: {session.paper} • {session.questionType} Mode</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Performance</span>
                    <span>{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {percentage >= 70 ? "Excellent work. You are well prepared for this section." :
                     percentage >= 50 ? "Good effort, but there is room for improvement before the final exam." :
                     "You need to dedicate more study time to this subject. Review the notes and try again."}
                  </p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Link href="/quiz">
                    <Button variant="outline">Take Another Quiz</Button>
                  </Link>
                  <Link href={`/notes?subjectId=${session.subjectId}`}>
                    <Button>Review Study Notes</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-serif font-bold">Review Questions</h3>
          </div>

          <div className="space-y-4">
            {/* Note: The schema for session doesn't explicitly contain the selected answers after submission in the standard return, 
                so we display the questions and their correct answers. If questionResults exist on the full result type, we'd map those.
                For this implementation, we'll show the questions and marking guide as review material. */}
            {session.questions.map((q, i) => (
              <Card key={q.id} className="overflow-hidden">
                <CardHeader className="bg-muted/10 py-3 px-6 border-b">
                  <div className="font-medium text-sm text-muted-foreground">Question {i + 1}</div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="font-medium text-base whitespace-pre-wrap">{q.questionText}</p>
                  
                  {q.questionType === "objective" && q.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                      {q.options.map((opt, idx) => {
                        const label = ['A', 'B', 'C', 'D'][idx];
                        const isCorrect = q.correctOption === label;
                        return (
                          <div 
                            key={idx} 
                            className={`p-3 rounded border text-sm flex gap-3 ${isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' : 'bg-background border-border opacity-60'}`}
                          >
                            <span className="font-bold">{label}.</span>
                            <span>{opt}</span>
                            {isCorrect && <CheckCircle2 className="h-4 w-4 ml-auto" />}
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

                  {q.questionType === "theory" && q.markingGuide && (
                    <div className="mt-4 p-4 rounded-md bg-accent/50 text-sm border-l-2 border-primary">
                      <strong className="block mb-1 font-serif">Marking Guide ({q.marks} marks):</strong>
                      <span className="whitespace-pre-wrap">{q.markingGuide}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
