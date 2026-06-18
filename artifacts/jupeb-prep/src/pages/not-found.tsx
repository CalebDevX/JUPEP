import { Link } from "wouter";
import { motion } from "framer-motion";
import { GraduationCap, Home, BookOpen, MessageCircle, ArrowLeft, Search } from "lucide-react";

const QUICK_LINKS = [
  { href: "/",           icon: Home,          label: "Dashboard",  desc: "Back to your home"     },
  { href: "/questions",  icon: BookOpen,       label: "Questions",  desc: "Practice past papers"  },
  { href: "/chat",       icon: MessageCircle, label: "AI Tutor",   desc: "Ask anything"          },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16">

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 mb-12"
      >
        <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-gray-900 text-lg">JUPEB Prep</span>
      </motion.div>

      {/* 404 graphic */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="relative mb-8"
      >
        {/* Big 404 */}
        <div className="flex items-center gap-2 select-none">
          <span className="text-[96px] sm:text-[128px] font-black text-gray-100 leading-none tracking-tighter">4</span>
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/25 flex-shrink-0">
            <Search className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
          </div>
          <span className="text-[96px] sm:text-[128px] font-black text-gray-100 leading-none tracking-tighter">4</span>
        </div>
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center max-w-sm mb-10"
      >
        <h1 className="text-2xl font-black text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Looks like this page went missing. Let's get you back on track — your JUPEB prep can't wait.
        </p>
      </motion.div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-sm space-y-2 mb-8"
      >
        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-300 mb-3 text-center">
          Where would you like to go?
        </p>
        {QUICK_LINKS.map(({ href, icon: Icon, label, desc }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
          >
            <Link href={href}>
              <div className="flex items-center gap-4 px-4 py-3.5 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 cursor-pointer group">
                <div className="w-9 h-9 rounded-lg bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Icon className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">{label}</p>
                  <p className="text-[11px] text-gray-400">{desc}</p>
                </div>
                <ArrowLeft className="h-3.5 w-3.5 text-gray-300 group-hover:text-orange-400 rotate-180 transition-colors flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-[11px] text-gray-300"
      >
        Lost? Visit your <Link href="/"><span className="text-orange-500 hover:text-orange-600 font-semibold cursor-pointer transition-colors">Dashboard</span></Link> to continue studying.
      </motion.p>
    </div>
  );
}
