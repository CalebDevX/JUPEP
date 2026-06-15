import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Trophy, PenTool, Activity, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/layout/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: recentActivity, isLoading: isLoadingActivity } = useGetRecentActivity();

  return (
    <Shell>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-1">Your journey to UNILAG Law begins here. 16 points is the goal.</p>
        </div>

        {isLoadingSummary ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <h3 className="text-3xl font-bold font-serif">{summary.averageScore.toFixed(1)}%</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                <PenTool className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Quizzes Taken</p>
                <h3 className="text-3xl font-bold font-serif">{summary.totalQuizzes}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                <BookOpen className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Questions Bank</p>
                <h3 className="text-3xl font-bold font-serif">{summary.totalQuestions}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                <GraduationCap className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Study Notes</p>
                <h3 className="text-3xl font-bold font-serif">{summary.totalNotes}</h3>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Subject Breakdown</CardTitle>
                <CardDescription>Questions available per subject</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingSummary ? (
                  <Skeleton className="h-48 w-full" />
                ) : summary?.subjectBreakdown.map((sub, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{sub.subjectName}</span>
                      <span>{sub.questionCount} questions</span>
                    </div>
                    <Progress value={Math.min(100, (sub.questionCount / (summary.totalQuestions || 1)) * 100)} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-8 flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold">Ready to test yourself?</h3>
                  <p className="text-primary-foreground/80">Launch a new quiz session simulating actual exam conditions.</p>
                </div>
                <Link href="/quiz">
                  <Button size="lg" variant="secondary" className="font-bold">
                    Start Quiz Session
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : recentActivity?.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No activity yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {recentActivity?.map((act, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="mt-1">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{act.description}</p>
                          <div className="flex items-center text-xs text-muted-foreground gap-2">
                            <span>{format(new Date(act.createdAt), "MMM d, h:mm a")}</span>
                            {act.score !== null && (
                              <span className="font-mono text-primary font-medium">{act.score}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
