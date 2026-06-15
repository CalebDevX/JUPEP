import { useGetProgress } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

export default function ProgressPage() {
  const { data: progress, isLoading } = useGetProgress();

  return (
    <Shell>
      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Your Progress</h1>
          <p className="text-muted-foreground mt-1">Track your performance and identify areas for improvement.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : progress ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-primary text-primary-foreground border-none">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium opacity-80">Total Quizzes</p>
                    <h3 className="text-4xl font-bold font-serif">{progress.totalQuizzes}</h3>
                  </div>
                  <Target className="h-12 w-12 opacity-50" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <h3 className="text-4xl font-bold font-serif text-green-600">{progress.averageScore.toFixed(1)}%</h3>
                  </div>
                  <Trophy className="h-12 w-12 text-muted-foreground opacity-20" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Streak</p>
                    <h3 className="text-4xl font-bold font-serif text-orange-500">{progress.streakDays || 0} <span className="text-lg text-muted-foreground">Days</span></h3>
                  </div>
                  <TrendingUp className="h-12 w-12 text-muted-foreground opacity-20" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Performance by Subject</CardTitle>
                  <CardDescription>Average score across all papers</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {progress.subjectProgress.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={progress.subjectProgress} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                        <XAxis dataKey="subjectName" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                        <Tooltip 
                          cursor={{fill: 'var(--muted)', opacity: 0.4}}
                          contentStyle={{borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)'}}
                        />
                        <Bar 
                          dataKey="averageScore" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]} 
                          barSize={40}
                          name="Avg Score (%)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Not enough data yet. Take some quizzes!
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Performance by Paper Type</CardTitle>
                  <CardDescription>How you perform across different exam formats</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {progress.paperProgress.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={progress.paperProgress} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                        <XAxis dataKey="paperLabel" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)'}}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="averageScore" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorScore)" 
                          name="Avg Score (%)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Not enough data yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </Shell>
  );
}
