import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, Plus, Upload, Trash2, Edit } from "lucide-react";
import { useListQuestions, useListSubjects, useCreateQuestion, useDeleteQuestion } from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("admin_auth") === "true"
  );
  const [pin, setPin] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "JUPEB2024") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      toast({ title: "Authenticated successfully" });
    } else {
      toast({ title: "Invalid PIN", variant: "destructive" });
      setPin("");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
  };

  if (!isAuthenticated) {
    return (
      <Shell>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-serif text-2xl">Admin Access</CardTitle>
              <CardDescription>Enter the PIN to manage questions and notes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input 
                  type="password" 
                  value={pin} 
                  onChange={e => setPin(e.target.value)} 
                  placeholder="Enter PIN"
                  className="text-center text-lg tracking-widest h-12"
                  autoFocus
                />
                <Button type="submit" className="w-full h-12">Verify Access</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Content Management</h1>
            <p className="text-muted-foreground mt-1">Add and edit questions, notes, and subjects.</p>
          </div>
          <Button variant="outline" onClick={logout}>Lock Session</Button>
        </div>

        <Tabs defaultValue="add-question" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 w-full justify-start border-b rounded-none h-auto">
            <TabsTrigger value="add-question" className="data-[state=active]:bg-background py-2">Add Question</TabsTrigger>
            <TabsTrigger value="manage-questions" className="data-[state=active]:bg-background py-2">Manage Questions</TabsTrigger>
            <TabsTrigger value="bulk-upload" className="data-[state=active]:bg-background py-2">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="add-question">
            <AddQuestionForm />
          </TabsContent>
          
          <TabsContent value="manage-questions">
            <ManageQuestionsList />
          </TabsContent>

          <TabsContent value="bulk-upload">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Bulk Question Upload</CardTitle>
                <CardDescription>Upload multiple questions via JSON or CSV format (Development Preview)</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Drag & drop files here</h3>
                <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                  Support for structured bulk uploads is coming in the next update. For now, please use the single question form.
                </p>
                <Button disabled variant="outline">Select File</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}

function AddQuestionForm() {
  const { data: subjects } = useListSubjects();
  const createQuestion = useCreateQuestion();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    subjectId: "",
    paper: "001",
    year: new Date().getFullYear().toString(),
    questionType: "objective",
    questionText: "",
    optionA: "", optionB: "", optionC: "", optionD: "",
    correctOption: "A",
    explanation: "",
    markingGuide: "",
    marks: "5"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.questionText) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const payload: any = {
      subjectId: Number(formData.subjectId),
      paper: formData.paper,
      year: Number(formData.year),
      questionType: formData.questionType,
      questionText: formData.questionText,
    };

    if (formData.questionType === "objective") {
      payload.options = [formData.optionA, formData.optionB, formData.optionC, formData.optionD];
      payload.correctOption = formData.correctOption;
      payload.explanation = formData.explanation;
    } else {
      payload.markingGuide = formData.markingGuide;
      payload.marks = Number(formData.marks);
      payload.explanation = formData.explanation;
    }

    createQuestion.mutate({ data: payload }, {
      onSuccess: () => {
        toast({ title: "Question added successfully" });
        // Reset form partially
        setFormData(prev => ({
          ...prev,
          questionText: "",
          optionA: "", optionB: "", optionC: "", optionD: "",
          explanation: "",
          markingGuide: ""
        }));
      },
      onError: () => toast({ title: "Failed to add question", variant: "destructive" })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">New Question Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={formData.subjectId} onValueChange={v => setFormData({...formData, subjectId: v})}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {subjects?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Paper</label>
              <Select value={formData.paper} onValueChange={v => setFormData({...formData, paper: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="001">001 (1st Incourse)</SelectItem>
                  <SelectItem value="002">002 (1st Semester)</SelectItem>
                  <SelectItem value="003">003 (2nd Incourse)</SelectItem>
                  <SelectItem value="004">004 (Mock)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={formData.questionType} onValueChange={v => setFormData({...formData, questionType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="objective">Objective</SelectItem>
                  <SelectItem value="theory">Theory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Question Text</label>
            <Textarea 
              value={formData.questionText} 
              onChange={e => setFormData({...formData, questionText: e.target.value})}
              className="min-h-[100px] font-serif"
            />
          </div>

          {formData.questionType === "objective" ? (
            <div className="space-y-4 p-4 border rounded-md bg-muted/20">
              <h4 className="font-medium text-sm">Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold w-6">A.</span>
                  <Input value={formData.optionA} onChange={e => setFormData({...formData, optionA: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold w-6">B.</span>
                  <Input value={formData.optionB} onChange={e => setFormData({...formData, optionB: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold w-6">C.</span>
                  <Input value={formData.optionC} onChange={e => setFormData({...formData, optionC: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold w-6">D.</span>
                  <Input value={formData.optionD} onChange={e => setFormData({...formData, optionD: e.target.value})} />
                </div>
              </div>
              <div className="pt-2 w-48">
                <label className="text-sm font-medium block mb-2">Correct Option</label>
                <Select value={formData.correctOption} onValueChange={v => setFormData({...formData, correctOption: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 border rounded-md bg-muted/20">
              <div className="space-y-2">
                <label className="text-sm font-medium">Marking Guide / Expected Answer</label>
                <Textarea 
                  value={formData.markingGuide} 
                  onChange={e => setFormData({...formData, markingGuide: e.target.value})}
                  className="min-h-[150px]"
                />
              </div>
              <div className="w-48 space-y-2">
                <label className="text-sm font-medium">Marks Allocated</label>
                <Input type="number" value={formData.marks} onChange={e => setFormData({...formData, marks: e.target.value})} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Explanation (Optional)</label>
            <Textarea 
              value={formData.explanation} 
              onChange={e => setFormData({...formData, explanation: e.target.value})}
              placeholder="Provide additional context or explanation for why the answer is correct."
            />
          </div>

          <Button type="submit" className="w-full" disabled={createQuestion.isPending}>
            {createQuestion.isPending ? "Saving..." : "Save Question"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

function ManageQuestionsList() {
  const { data: questions, refetch } = useListQuestions({ limit: 50 });
  const deleteQuestion = useDeleteQuestion();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      deleteQuestion.mutate({ questionId: id }, {
        onSuccess: () => {
          toast({ title: "Question deleted" });
          refetch();
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Recent Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questions?.map(q => (
            <div key={q.id} className="flex justify-between items-start p-4 border rounded-lg hover:bg-muted/30">
              <div className="space-y-1 max-w-[80%]">
                <div className="flex gap-2 text-xs font-medium text-muted-foreground mb-1">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{q.subjectName}</span>
                  <span className="bg-secondary px-2 py-0.5 rounded">{q.paper}</span>
                  <span className="bg-accent px-2 py-0.5 rounded">{q.questionType}</span>
                </div>
                <p className="font-medium line-clamp-2">{q.questionText}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" title="Edit (Coming soon)"><Edit className="h-4 w-4 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)} disabled={deleteQuestion.isPending}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {questions?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No questions found. Add some above!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
