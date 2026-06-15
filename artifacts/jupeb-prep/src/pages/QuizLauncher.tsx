import { useState } from "react";
import { useListSubjects, useStartQuiz } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { Loader2, PlayCircle } from "lucide-react";

export default function QuizLauncher() {
  const [, setLocation] = useLocation();
  const { data: subjects, isLoading: isLoadingSubjects } = useListSubjects();
  const startQuiz = useStartQuiz();

  const [subjectId, setSubjectId] = useState<string>("");
  const [paper, setPaper] = useState<string>("001");
  const [type, setType] = useState<string>("objective");
  const [count, setCount] = useState<string>("20");
  const [isTimed, setIsTimed] = useState<boolean>(true);

  const handleStart = () => {
    if (!subjectId) return;

    let timedMinutes = undefined;
    if (isTimed) {
      if (paper === "mock") {
        timedMinutes = 120; // 2 hours for mock
      } else if (type === "theory") {
        timedMinutes = 120; // 2 hours for theory
      } else {
        timedMinutes = 60; // 1 hour for objective
      }
    }

    startQuiz.mutate({
      data: {
        subjectId: Number(subjectId),
        paper: paper as any,
        questionType: type as any,
        questionCount: Number(count),
        timedMinutes,
      }
    }, {
      onSuccess: (session) => {
        setLocation(`/quiz/session/${session.id}`);
      }
    });
  };

  return (
    <Shell>
      <div className="p-8 max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground">Launch Quiz Session</h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Test your knowledge under simulated exam conditions. 
            Choose your parameters to begin.
          </p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-base font-serif">Subject</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-serif">Paper</Label>
                <Select value={paper} onValueChange={setPaper}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="001">1st Incourse</SelectItem>
                    <SelectItem value="002">1st Semester</SelectItem>
                    <SelectItem value="003">2nd Incourse</SelectItem>
                    <SelectItem value="004">Mock Exam</SelectItem>
                    <SelectItem value="mock">Full Mock (Mixed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paper !== "mock" && (
                <div className="space-y-3">
                  <Label className="text-base font-serif">Question Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="objective">Objective</SelectItem>
                      <SelectItem value="theory">Theory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {paper !== "mock" && type === "objective" && (
                <div className="space-y-3">
                  <Label className="text-base font-serif">Number of Questions</Label>
                  <Select value={count} onValueChange={setCount}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 Questions (Quick Review)</SelectItem>
                      <SelectItem value="20">20 Questions (Standard)</SelectItem>
                      <SelectItem value="40">40 Questions (Full Paper)</SelectItem>
                      <SelectItem value="50">50 Questions (Comprehensive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="bg-accent/50 p-6 rounded-lg flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-lg">Timed Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Simulate exam conditions with a countdown timer.
                  {paper === "mock" || type === "theory" ? " (2 Hours)" : " (1 Hour)"}
                </p>
              </div>
              <Switch 
                checked={isTimed} 
                onCheckedChange={setIsTimed} 
              />
            </div>
          </CardContent>
          <CardFooter className="p-8 bg-muted/20 border-t flex justify-end">
            <Button 
              size="lg" 
              className="px-8 font-bold text-lg h-14 w-full md:w-auto" 
              disabled={!subjectId || startQuiz.isPending}
              onClick={handleStart}
            >
              {startQuiz.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <PlayCircle className="h-5 w-5 mr-2" />
              )}
              Begin Session
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Shell>
  );
}
