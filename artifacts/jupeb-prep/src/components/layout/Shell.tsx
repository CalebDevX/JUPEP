import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { 
  BookOpen, 
  Library, 
  LayoutDashboard, 
  PenTool, 
  Settings, 
  TrendingUp, 
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [location] = useLocation();

  const navItems = useMemo(() => [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/subjects", label: "Subjects", icon: Library },
    { href: "/questions", label: "Questions Bank", icon: BookOpen },
    { href: "/quiz", label: "Quiz Launcher", icon: PenTool },
    { href: "/notes", label: "Study Notes", icon: GraduationCap },
    { href: "/progress", label: "Progress", icon: TrendingUp },
    { href: "/admin", label: "Admin", icon: Settings },
  ], []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <GraduationCap className="h-6 w-6 mr-3 text-sidebar-primary" />
          <h1 className="font-serif text-lg font-bold text-sidebar-primary">JUPEB Law Prep</h1>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 mr-3 flex-shrink-0",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-[100dvh] flex flex-col">
        {children}
      </main>
    </div>
  );
}
