import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Subjects from "@/pages/Subjects";
import Questions from "@/pages/Questions";
import QuizLauncher from "@/pages/QuizLauncher";
import QuizSession from "@/pages/QuizSession";
import QuizResult from "@/pages/QuizResult";
import Notes from "@/pages/Notes";
import Class from "@/pages/Class";
import HistoryPage from "@/pages/History";
import ProgressPage from "@/pages/Progress";
import AdminPanel from "@/pages/Admin";
import Chat from "@/pages/Chat";
import Syllabus from "@/pages/Syllabus";
import LearnFromSource from "@/pages/LearnFromSource";
import Community from "@/pages/Community";
import Settings from "@/pages/Settings";
import Flashcards from "@/pages/Flashcards";
import Leaderboard from "@/pages/Leaderboard";
import Activate from "@/pages/Activate";
import VoiceTeacher from "@/pages/VoiceTeacher";
import Subscribe from "@/pages/Subscribe";
import PaymentCallback from "@/pages/PaymentCallback";
import StudyPlanner from "@/pages/StudyPlanner";
import Achievements from "@/pages/Achievements";
import { SessionExpiredGate } from "@/components/SessionExpiredGate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function getProfile() {
  try { return JSON.parse(localStorage.getItem("jupeb_profile") || "null"); } catch { return null; }
}

function isSessionExpired(profile: any): boolean {
  if (!profile) return false;
  if (!profile.expiresAt) return false;
  return new Date(profile.expiresAt) < new Date();
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const profile = getProfile();
  const isAuth = !!profile;

  function checkSession() {
    const currentProfile = getProfile();
    const token = localStorage.getItem("jupeb_session_token");
    if (!token || !currentProfile?.phone) return;
    fetch(`/api/auth/verify-session?phone=${encodeURIComponent(currentProfile.phone)}`, {
      headers: { "x-session-token": token },
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid === false) {
          const pic = localStorage.getItem("jupeb_profile_picture");
          localStorage.clear();
          if (pic) localStorage.setItem("jupeb_profile_picture", pic);
          navigate("/auth");
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    if (!isAuth) { navigate("/auth"); return; }
    checkSession();
    // Re-check every 5 minutes — kicks device off if account logs in elsewhere
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuth]);

  if (!isAuth) return null;

  // Session expired — show gate instead of content
  if (isSessionExpired(profile)) {
    return <SessionExpiredGate />;
  }

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
      <Route path="/class" component={Class} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/progress" component={ProgressPage} />
      <Route path="/chat" component={Chat} />
      <Route path="/syllabus" component={Syllabus} />
      <Route path="/learn" component={LearnFromSource} />
      <Route path="/community" component={Community} />
      <Route path="/flashcards" component={Flashcards} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/activate" component={Activate} />
      <Route path="/voice" component={VoiceTeacher} />
      <Route path="/settings" component={Settings} />
      <Route path="/planner" component={StudyPlanner} />
      <Route path="/achievements" component={Achievements} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={Auth} />
      <Route path="/login" component={Auth} />
      <Route path="/register" component={Auth} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/payment/callback" component={PaymentCallback} />
      {/* Admin — PIN-protected standalone */}
      <Route path="/admin" component={AdminPanel} />
      {/* All other routes require login */}
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
