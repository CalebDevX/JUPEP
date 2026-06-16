import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Subjects from "@/pages/Subjects";
import Questions from "@/pages/Questions";
import QuizLauncher from "@/pages/QuizLauncher";
import QuizSession from "@/pages/QuizSession";
import QuizResult from "@/pages/QuizResult";
import Notes from "@/pages/Notes";
import ProgressPage from "@/pages/Progress";
import AdminPanel from "@/pages/Admin";
import Chat from "@/pages/Chat";
import Syllabus from "@/pages/Syllabus";
import LearnFromSource from "@/pages/LearnFromSource";
import Community from "@/pages/Community";
import Settings from "@/pages/Settings";
import Flashcards from "@/pages/Flashcards";
import Leaderboard from "@/pages/Leaderboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const isAuth = !!localStorage.getItem("jupeb_profile");

  useEffect(() => {
    if (!isAuth) navigate("/register");
  }, [isAuth]);

  if (!isAuth) return null;
  return <>{children}</>;
}

function ProtectedRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/subjects" component={Subjects} />
      <Route path="/questions" component={Questions} />
      <Route path="/quiz" component={QuizLauncher} />
      <Route path="/quiz/session/:id" component={QuizSession} />
      <Route path="/quiz/result/:id" component={QuizResult} />
      <Route path="/notes" component={Notes} />
      <Route path="/progress" component={ProgressPage} />
      <Route path="/chat" component={Chat} />
      <Route path="/syllabus" component={Syllabus} />
      <Route path="/learn" component={LearnFromSource} />
      <Route path="/community" component={Community} />
      <Route path="/flashcards" component={Flashcards} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route>
        <RequireAuth>
          <ProtectedRoutes />
        </RequireAuth>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
