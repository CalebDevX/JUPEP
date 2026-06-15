import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Subjects from "@/pages/Subjects";
import Questions from "@/pages/Questions";
import QuizLauncher from "@/pages/QuizLauncher";
import QuizSession from "@/pages/QuizSession";
import QuizResult from "@/pages/QuizResult";
import Notes from "@/pages/Notes";
import ProgressPage from "@/pages/Progress";
import AdminPanel from "@/pages/Admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
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
      <Route path="/admin" component={AdminPanel} />
      <Route component={NotFound} />
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
