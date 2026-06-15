import { useState, useMemo, useRef, useEffect } from "react";
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
  Sparkles,
  Target,
  ScrollText,
  Wand2,
  Users,
  Settings,
  LogOut,
  ChevronUp,
  X,
  Layers,
  Flame,
} from "lucide-react";
import { getGamificationState, getLevel } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ShellProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/",          label: "Dashboard",    icon: LayoutDashboard, color: "text-violet-500" },
  { href: "/subjects",  label: "Subjects",     icon: Library,         color: "text-blue-500"   },
  { href: "/syllabus",  label: "Syllabus",     icon: ScrollText,      color: "text-emerald-500"},
  { href: "/questions", label: "Question Bank",icon: BookOpen,        color: "text-teal-500"   },
  { href: "/quiz",       label: "Quiz Mode",    icon: PenTool,         color: "text-orange-500"  },
  { href: "/flashcards", label: "Flashcards",  icon: Layers,          color: "text-fuchsia-500" },
  { href: "/community",  label: "Community",   icon: Users,           color: "text-sky-500"     },
  { href: "/learn",     label: "AI Learn",     icon: Wand2,           color: "text-rose-500"   },
  { href: "/notes",     label: "Study Notes",  icon: GraduationCap,   color: "text-pink-500"   },
  { href: "/progress",  label: "Progress",     icon: TrendingUp,      color: "text-cyan-500"   },
  { href: "/chat",      label: "LexBot AI",    icon: MessageCircle,   color: "text-amber-500"  },
];

function useProfile() {
  const displayName = localStorage.getItem("jupeb_display_name") || localStorage.getItem("user_display_name") || "Scholar";
  const initial = displayName.trim().charAt(0).toUpperCase() || "S";
  const profilePic = localStorage.getItem("jupeb_profile_picture");
  const gState = getGamificationState();
  return { displayName, initial, profilePic, streak: gState.streak, xp: gState.xp };
}

function ProfileDropdown({
  onClose,
  onNavigate,
  showSignOut = true,
}: {
  onClose: () => void;
  onNavigate: (href: string) => void;
  showSignOut?: boolean;
}) {
  const { displayName, initial } = useProfile();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("jupeb_display_name");
    localStorage.removeItem("jupeb_study_goal");
    localStorage.removeItem("jupeb_onboarded");
    onClose();
    navigate("/");
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full left-0 right-0 mb-2 mx-3 rounded-2xl bg-[#1e1e2a] border border-white/10 shadow-2xl overflow-hidden z-50"
    >
      <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-white">{initial}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{displayName}</p>
          <p className="text-[10px] text-white/40">JUPEB Prep Student</p>
        </div>
      </div>
      <div className="py-1.5">
        <button
          onClick={() => { onNavigate("/settings"); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Settings className="h-4 w-4 text-white/40" />
          Settings
        </button>
        {showSignOut && (
          <>
            <div className="mx-3 my-1 border-t border-white/8" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/8 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

function NavLink({
  item,
  location,
  onClick,
}: {
  item: typeof navItems[0];
  location: string;
  onClick: () => void;
}) {
  const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
  return (
    <Link href={item.href} onClick={onClick}>
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
}

export function Shell({ children }: ShellProps) {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileProfileRef = useRef<HTMLDivElement>(null);
  const { displayName, initial, profilePic, streak, xp } = useProfile();

  const activeItem = useMemo(
    () => navItems.find(item =>
      item.href === "/" ? location === "/" : location.startsWith(item.href)
    ),
    [location]
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (mobileProfileRef.current && !mobileProfileRef.current.contains(e.target as Node)) {
        setMobileProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jupeb_display_name");
    localStorage.removeItem("jupeb_study_goal");
    localStorage.removeItem("jupeb_onboarded");
    setMobileProfileOpen(false);
    setMobileOpen(false);
    navigate("/");
    window.location.reload();
  };

  /* ── Shared sidebar header + nav ── */
  const SidebarInner = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-lg bg-[#0f172a]">
            <img src="/logo.png" alt="JUPEB Prep" className="w-9 h-9 object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white leading-tight">JUPEB Prep</h1>
            <p className="text-[10px] text-white/50 leading-tight">UNILAG Foundation Studies</p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Goal + streak banner */}
      <div className="mx-4 mt-4 mb-2 flex-shrink-0 space-y-1.5">
        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-white/50">Your Goal</p>
              <p className="text-xs font-bold text-amber-400">16 Points — AAA+1</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className={cn(
            "flex-1 px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5",
            streak > 0 ? "bg-orange-500/10 border-orange-500/20" : "bg-white/4 border-white/8"
          )}>
            <Flame className={cn("h-3 w-3 flex-shrink-0", streak > 0 ? "text-orange-400" : "text-white/20")} />
            <span className={cn("text-xs font-bold", streak > 0 ? "text-orange-300" : "text-white/30")}>{streak}d</span>
          </div>
          <div className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/4 border border-white/8 flex items-center gap-1.5">
            <span className="text-[10px]">⚡</span>
            <span className="text-xs font-bold text-white/50">{xp} XP</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.href}
            item={item}
            location={location}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Desktop bottom profile */}
      {!isMobile && (
        <div className="px-3 pb-4 relative flex-shrink-0" ref={profileRef}>
          <AnimatePresence>
            {profileOpen && (
              <ProfileDropdown
                onClose={() => setProfileOpen(false)}
                onNavigate={(href) => { navigate(href); }}
                showSignOut={true}
              />
            )}
          </AnimatePresence>
          <button
            onClick={() => setProfileOpen(v => !v)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
              profileOpen ? "bg-white/10" : "hover:bg-white/5"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/70 to-indigo-600/70 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">{initial}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-white/80 truncate">{displayName}</p>
              <p className="text-[10px] text-white/40">Student</p>
            </div>
            <ChevronUp className={cn(
              "h-3.5 w-3.5 text-white/30 transition-transform flex-shrink-0",
              profileOpen ? "rotate-180" : ""
            )} />
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#0f0f13] text-foreground">

      {/* ── Desktop Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 w-60 hidden md:flex flex-col bg-gradient-to-b from-[#18181f] to-[#111116] border-r border-white/5 z-40">
        <SidebarInner isMobile={false} />
      </aside>

      {/* ── Mobile Overlay ── */}
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

      {/* ── Mobile Sidebar (no sign-out at bottom — profile icon in topbar handles it) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-60 flex flex-col bg-gradient-to-b from-[#18181f] to-[#111116] border-r border-white/5 z-50 md:hidden"
          >
            <SidebarInner isMobile={true} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
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

          {/* Mobile profile — Settings + Sign Out */}
          <div className="relative" ref={mobileProfileRef}>
            <button
              onClick={() => setMobileProfileOpen(v => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{initial}</span>
              </div>
            </button>
            <AnimatePresence>
              {mobileProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-52 rounded-2xl bg-[#1e1e2a] border border-white/10 shadow-2xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">{initial}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                      <p className="text-[10px] text-white/40">JUPEB Student</p>
                    </div>
                  </div>
                  <div className="py-1.5">
                    <Link href="/settings" onClick={() => setMobileProfileOpen(false)}>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                        <Settings className="h-4 w-4 text-white/40" />
                        Settings
                      </button>
                    </Link>
                    <div className="mx-3 my-1 border-t border-white/8" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/8 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
