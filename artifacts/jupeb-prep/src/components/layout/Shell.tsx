import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  Library,
  LayoutDashboard,
  PenTool,
  TrendingUp,
  GraduationCap,
  MessageCircle,
  Menu,
  X,
  Sparkles,
  Target,
  ScrollText,
  Wand2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ShellProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-violet-500" },
  { href: "/subjects", label: "Subjects", icon: Library, color: "text-blue-500" },
  { href: "/syllabus", label: "Syllabus", icon: ScrollText, color: "text-emerald-500" },
  { href: "/questions", label: "Question Bank", icon: BookOpen, color: "text-teal-500" },
  { href: "/quiz", label: "Quiz Mode", icon: PenTool, color: "text-orange-500" },
  { href: "/community", label: "Community", icon: Users, color: "text-sky-500" },
  { href: "/learn", label: "AI Learn", icon: Wand2, color: "text-rose-500" },
  { href: "/notes", label: "Study Notes", icon: GraduationCap, color: "text-pink-500" },
  { href: "/progress", label: "Progress", icon: TrendingUp, color: "text-cyan-500" },
  { href: "/chat", label: "LexBot AI", icon: MessageCircle, color: "text-amber-500" },
];

export function Shell({ children }: ShellProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = useMemo(
    () => navItems.find(item =>
      item.href === "/" ? location === "/" : location.startsWith(item.href)
    ),
    [location]
  );

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center px-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-lg bg-[#0f172a]">
            <img src="/logo.png" alt="JUPEB Prep" className="w-9 h-9 object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white leading-tight">JUPEB Prep</h1>
            <p className="text-[10px] text-white/50 leading-tight">UNILAG Foundation Studies</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 mb-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-white/50">Your Goal</p>
            <p className="text-xs font-bold text-amber-400">16 Points — AAA+1</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                  isActive ? "bg-white/10" : "bg-transparent group-hover:bg-white/5"
                )}>
                  <item.icon className={cn("h-4 w-4", isActive ? item.color : "text-white/50 group-hover:text-white/80")} />
                </div>
                <span>{item.label}</span>
                {item.href === "/chat" && (
                  <span className="ml-auto">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-500/20">
        <p className="text-[10px] text-violet-300 font-semibold uppercase tracking-wider mb-1">LexBot Active</p>
        <p className="text-xs text-white/70 leading-relaxed">Your AI tutor is ready to help you ace JUPEB.</p>
        <Link href="/chat" onClick={() => setMobileOpen(false)}>
          <div className="mt-2 text-xs text-violet-300 font-medium flex items-center gap-1 cursor-pointer hover:text-violet-200">
            <MessageCircle className="h-3 w-3" /> Ask LexBot →
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#0f0f13] text-foreground">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 hidden md:flex flex-col bg-gradient-to-b from-[#18181f] to-[#111116] border-r border-white/5 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-60 flex flex-col bg-gradient-to-b from-[#18181f] to-[#111116] border-r border-white/5 z-50 md:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-60 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[#0f0f13]/90 backdrop-blur-md border-b border-white/5">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/70"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-white">{activeItem?.label || "JUPEB Prep"}</span>
          </div>
          <Link href="/chat">
            <div className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-amber-400">
              <MessageCircle className="h-5 w-5" />
            </div>
          </Link>
        </div>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
