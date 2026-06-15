import { useListSubjects } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, ChevronRight, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const PAPER_LABELS: Record<string, string> = {
  "001": "1st Incourse",
  "002": "1st Semester Exam",
  "003": "2nd Incourse",
  "004": "Mock Exam",
};

export default function Subjects() {
  const { data: subjects, isLoading } = useListSubjects();

  return (
    <Shell>
      <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Subjects</h1>
          <p className="text-muted-foreground mt-1">Browse your core courses and their respective papers.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects?.map(subject => (
              <Card key={subject.id} className="flex flex-col border-t-4" style={{ borderTopColor: subject.color || 'hsl(var(--primary))' }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Book className="h-6 w-6" style={{ color: subject.color || 'hsl(var(--primary))' }} />
                    <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full text-secondary-foreground">
                      {subject.code}
                    </span>
                  </div>
                  <CardTitle className="font-serif text-xl mt-4">{subject.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{subject.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                  <div className="space-y-2">
                    {["001", "002", "003", "004"].map((paper) => (
                      <Link key={paper} href={`/questions?subjectId=${subject.id}&paper=${paper}`}>
                        <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors group cursor-pointer border border-transparent hover:border-border">
                          <div className="flex items-center text-sm font-medium">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            {PAPER_LABELS[paper]}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
