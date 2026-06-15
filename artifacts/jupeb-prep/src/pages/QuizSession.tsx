import { useState, useEffect, useRef, useMemo } from "react";
import { useGetQuizSession, useSubmitQuiz } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuizSession() {
  const [, params] = useRoute("/quiz/session/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const { toast } = useToast();

  const { data: session, isLoading } = useGetQuizSession(id, {
    query: { enabled: !!id }
  });

  const submitQuiz = useSubmitQuiz();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { selectedOption?: string, theoryAnswer?: string }>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showTheoryGuide, setShowTheoryGuide] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (session?.timedMinutes && session.status === "in_progress" && timeLeft === null) {
      // Calculate remaining time based on createdAt
      const createdAt = new Date(session.createdAt).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - createdAt) / 1000);
      const totalSeconds = session.timedMinutes * 60;
      setTimeLeft(Math.max(0, totalSeconds - elapsedSeconds));
    }
  }, [session, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || session?.status !== "in_progress") return;

    if (timeLeft <= 0) {
      handleComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, session]);

  const handleOptionSelect = (questionId: number, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], selectedOption: option }
    }));
  };

  const handleTheoryChange = (questionId: number, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], theoryAnswer: text }
    }));
  };

  const handleShowGuide = (questionId: number) => {
    setShowTheoryGuide(prev => ({ ...prev, [questionId]: true }));
  };

  const handleComplete = () => {
    if (!session) return;
    
    const submissionAnswers = session.questions.map(q => ({
      questionId: q.id,
      selectedOption: answers[q.id]?.selectedOption || null,
      theoryAnswer: answers[q.id]?.theoryAnswer || null
    }));

    submitQuiz.mutate({
      sessionId: id,
      data: { answers: submissionAnswers }
    }, {
      onSuccess: (result) => {
        toast({
          title: "Quiz Completed",
          description: "Your answers have been submitted successfully.",
        });
        setLocation(`/quiz/result/${result.sessionId}`);
      },
      onError: () => {
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your quiz.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
            <CardContent><Skeleton className="h-32 w-full" /></CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  if (!session) return null;

  if (session.status === "completed") {
    setLocation(`/quiz/result/${id}`);
    return null;
  }

  const question = session.questions[currentIndex];
  if (!question) return null;

  const isLast = currentIndex === session.questions.length - 1;
  const progress = ((currentIndex + 1) / session.questions.length) * 100;
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft !== null && timeLeft < 300; // less than 5 mins

  return (
    <Shell>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header Bar */}
        <div className="bg-card border-b p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="font-serif font-bold text-lg">{session.subjectName} - {session.paper}</h2>
            <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
              <span>Question {currentIndex + 1} of {session.questions.length}</span>
              <span className="capitalize">{session.questionType} Mode</span>
            </div>
          </div>
          
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-lg font-bold ${isLowTime ? 'bg-destructive/10 text-destructive border border-destructive/20 animate-pulse' : 'bg-muted/50 text-foreground'}`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <Progress value={progress} className="h-1 rounded-none" />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-t-4 border-t-primary shadow-md">
              <CardHeader className="bg-muted/10 pb-6 border-b">
                <div className="flex justify-between items-start gap-4">
                  <div className="text-lg font-medium leading-relaxed whitespace-pre-wrap">
                    <span className="text-muted-foreground mr-2 font-bold">{currentIndex + 1}.</span>
                    {question.questionText}
                  </div>
                  {question.marks && (
                    <div className="shrink-0 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {question.marks} marks
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {question.questionType === "objective" && question.options ? (
                  <div className="space-y-3">
                    {question.options.map((opt, i) => {
                      const labels = ['A', 'B', 'C', 'D'];
                      const label = labels[i];
                      const isSelected = answers[question.id]?.selectedOption === label;
                      
                      return (
                        <button
                          key={i}
                          onClick={() => handleOptionSelect(question.id, label)}
                          className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-start gap-4 ${
                            isSelected 
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm' 
                              : 'border-border bg-card hover:bg-accent hover:border-accent-foreground/20'
                          }`}
                        >
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {label}
                          </div>
                          <div className="pt-1">{opt}</div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Your Answer</label>
                      <Textarea 
                        placeholder="Type your comprehensive answer here..."
                        className="min-h-[200px] text-base leading-relaxed resize-y font-serif"
                        value={answers[question.id]?.theoryAnswer || ''}
                        onChange={(e) => handleTheoryChange(question.id, e.target.value)}
                        disabled={showTheoryGuide[question.id]}
                      />
                    </div>
                    
                    {!showTheoryGuide[question.id] ? (
                      <Button 
                        variant="secondary" 
                        onClick={() => handleShowGuide(question.id)}
                        disabled={!answers[question.id]?.theoryAnswer?.trim()}
                      >
                        Submit Answer & View Marking Guide
                      </Button>
                    ) : (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold font-serif text-lg">
                          <CheckCircle2 className="h-5 w-5" />
                          Marking Guide
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap">{question.markingGuide}</p>
                        </div>
                        {question.explanation && (
                          <div className="mt-4 pt-4 border-t border-green-500/20 text-sm">
                            <strong className="font-serif block mb-1">Additional Notes:</strong>
                            <p>{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-card border-t p-4 flex items-center justify-between sticky bottom-0">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>

          <div className="hidden md:flex gap-1">
            {session.questions.map((q, i) => {
              const isAnswered = q.questionType === 'objective' 
                ? !!answers[q.id]?.selectedOption 
                : !!answers[q.id]?.theoryAnswer;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                    currentIndex === i 
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background' 
                      : isAnswered 
                        ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {!isLast ? (
            <Button onClick={() => setCurrentIndex(p => Math.min(session.questions.length - 1, p + 1))}>
              Next Question
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={submitQuiz.isPending}
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              {submitQuiz.isPending ? "Submitting..." : "Complete Exam"}
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}
