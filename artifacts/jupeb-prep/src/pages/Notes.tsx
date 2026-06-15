import { useState, useMemo } from "react";
import { useListNotes, useListSubjects } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, GraduationCap, SearchX } from "lucide-react";

export default function Notes() {
  const [subjectId, setSubjectId] = useState<string>("all");
  const [paper, setPaper] = useState<string>("all");

  const { data: subjects } = useListSubjects();
  
  const queryParams = useMemo(() => {
    return {
      ...(subjectId !== "all" ? { subjectId: Number(subjectId) } : {}),
      ...(paper !== "all" ? { paper } : {})
    };
  }, [subjectId, paper]);

  const { data: notes, isLoading } = useListNotes(queryParams);

  return (
    <Shell>
      <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              Study Notes
            </h1>
            <p className="text-muted-foreground mt-1">Scholarly definitions and summaries for key topics.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects?.map(s => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={paper} onValueChange={setPaper}>
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
          </div>
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
          ) : notes?.length === 0 ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-serif font-bold text-foreground">No notes available</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                  We couldn't find any study notes matching your filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            notes?.map((note) => (
              <Card key={note.id} className="overflow-hidden">
                <CardHeader className="bg-muted/10 border-b">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-serif leading-tight">{note.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-primary">{note.subjectName}</span>
                        <span>•</span>
                        <span>Paper {note.paper}</span>
                      </CardDescription>
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                        {note.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Basic markdown rendering via prose classes */}
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-primary whitespace-pre-wrap">
                    {note.content}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}
