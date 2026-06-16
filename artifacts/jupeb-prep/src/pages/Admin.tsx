import { useState, useRef, useCallback, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Lock, Plus, Trash2, Edit, Upload, Megaphone, Pin, CheckCircle2,
  Sparkles, X, ImagePlus, User, FileText, Download, AlertCircle,
  CheckCircle, Loader2, Timer, Brain,
  LayoutDashboard, Users, KeyRound, TrendingUp, BookOpen,
  ShieldAlert, RefreshCw, ToggleLeft, ToggleRight, DollarSign,
  BadgeAlert, Clock, Target, Activity,
} from "lucide-react";
import { useListSubjects, useCreateQuestion, useDeleteQuestion, useListQuestions } from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const ADMIN_PIN_KEY = "JUPEB2024";

type AdminTab = "overview" | "students" | "codes" | "revenue" | "questions" | "anticheat" | "announcements" | "settings" | "branding";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6 space-y-5">
      <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "bg-white/5 border-white/10 text-white placeholder:text-white/25";

async function adminFetch(pin: string, path: string, method = "GET", body?: any) {
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json", "x-admin-pin": pin },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function StatCard({
  label, value, icon: Icon, color, sub,
}: { label: string; value: string | number; icon: any; color: string; sub?: string }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", `bg-${color}-500/10`)}>
          <Icon className={cn("h-4 w-4", `text-${color}-400`)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-white/25 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ pin }: { pin: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setStats(await adminFetch(pin, "/api/admin/overview")); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-white/3 animate-pulse" />)}
    </div>
  );

  if (!stats) return <p className="text-white/30 text-center py-12">Could not load stats.</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Registered Students" value={stats.totalStudents} icon={Users} color="violet" />
        <StatCard label="Questions in Bank" value={stats.totalQuestions} icon={BookOpen} color="blue" />
        <StatCard label="Total Revenue" value={`₦${(stats.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="emerald" />
        <StatCard label="Active Codes" value={`${stats.activeCodes} / ${stats.totalCodes}`} icon={KeyRound} color="amber" />
        <StatCard label="Study Notes" value={stats.totalNotes} icon={FileText} color="pink" />
        <StatCard label="Flagged Attempts" value={stats.flaggedAttempts} icon={BadgeAlert} color="red"
          sub={stats.flaggedAttempts > 0 ? "Needs review in Anti-cheat tab" : "All clear"} />
        {stats.topStudent && (
          <div className="glass-card p-5 col-span-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Top Student 🏆</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                {stats.topStudent.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{stats.topStudent.full_name}</p>
                <p className="text-xs text-amber-400">{(stats.topStudent.xp || 0).toLocaleString()} XP · {stats.topStudent.streak || 0}d streak</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button onClick={load} className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
          <RefreshCw className="h-3 w-3" /> Refresh stats
        </button>
      </div>
    </div>
  );
}

// ─── Students Tab ────────────────────────────────────────────────────────────

function StudentsTab({ pin }: { pin: string }) {
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<number | null>(null);

  const load = async (q = "") => {
    setLoading(true);
    try {
      const path = q ? `/api/admin/students?search=${encodeURIComponent(q)}` : "/api/admin/students";
      setStudents(await adminFetch(pin, path));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id: number, current: boolean) => {
    setToggling(id);
    try {
      await adminFetch(pin, `/api/admin/students/${id}`, "PATCH", { isActive: !current });
      setStudents(p => p.map(s => s.id === id ? { ...s, is_active: !current } : s));
      toast({ title: current ? "Student deactivated" : "Student activated" });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    }
    setToggling(null);
  };

  const filtered = search
    ? students.filter(s =>
        s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.includes(search)
      )
    : students;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className={cn(inputCls, "max-w-xs")}
        />
        <button onClick={() => load()} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-2 rounded-xl bg-white/3 border border-white/8">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
        <span className="text-xs text-white/30 ml-auto">{filtered.length} students</span>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-white/3 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Users className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No students found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                {["Name", "Phone", "Subjects", "Target", "XP", "Streak", "Code Used", "Joined", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-medium text-white/90 whitespace-nowrap">{s.full_name}</td>
                  <td className="px-4 py-3 text-white/50 font-mono text-xs">{s.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap max-w-[140px]">
                      {(s.subjects || []).slice(0, 2).map((sub: string) => (
                        <span key={sub} className="text-[10px] bg-violet-500/10 border border-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                          {sub.split(" ")[0]}
                        </span>
                      ))}
                      {(s.subjects || []).length > 2 && <span className="text-[10px] text-white/30">+{(s.subjects || []).length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs uppercase">{s.target_grade}</td>
                  <td className="px-4 py-3 font-bold text-violet-400 text-xs">{(s.xp || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-orange-400 text-xs">{s.streak || 0}d</td>
                  <td className="px-4 py-3 text-white/40 font-mono text-xs">{s.access_code_used || "—"}</td>
                  <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">
                    {s.created_at ? format(new Date(s.created_at), "MMM d, yy") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(s.id, s.is_active)}
                      disabled={toggling === s.id}
                      className="flex items-center gap-1.5 transition-colors"
                    >
                      {toggling === s.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white/30" />
                      ) : s.is_active ? (
                        <><ToggleRight className="h-5 w-5 text-emerald-400" /><span className="text-[10px] text-emerald-400">Active</span></>
                      ) : (
                        <><ToggleLeft className="h-5 w-5 text-red-400/50" /><span className="text-[10px] text-red-400/50">Off</span></>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Access Codes Tab ────────────────────────────────────────────────────────

function CodesTab({ pin }: { pin: string }) {
  const { toast } = useToast();
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", label: "", maxActivations: "100", price: "0" });
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try { setCodes(await adminFetch(pin, "/api/admin/access-codes")); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminFetch(pin, "/api/admin/access-codes", "POST", {
        code: form.code.toUpperCase(),
        label: form.label,
        maxActivations: parseInt(form.maxActivations),
        price: parseInt(form.price),
      });
      toast({ title: `✅ Code "${form.code.toUpperCase()}" created!` });
      setForm({ code: "", label: "", maxActivations: "100", price: "0" });
      setShowForm(false);
      load();
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    }
    setCreating(false);
  };

  const toggleCode = async (id: number, current: boolean) => {
    setToggling(id);
    try {
      await adminFetch(pin, `/api/admin/access-codes/${id}`, "PATCH", { isActive: !current });
      setCodes(p => p.map(c => c.id === id ? { ...c, is_active: !current } : c));
    } catch {}
    setToggling(null);
  };

  const deleteCode = async (id: number, code: string) => {
    if (!confirm(`Delete access code "${code}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await adminFetch(pin, `/api/admin/access-codes/${id}`, "DELETE");
      setCodes(p => p.filter(c => c.id !== id));
      toast({ title: "Code deleted" });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    }
    setDeleting(null);
  };

  const totalRevenue = codes.reduce((s, c) => s + (parseInt(c.revenue_generated) || 0), 0);
  const totalActivations = codes.reduce((s, c) => s + (parseInt(c.activation_count) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-bold text-white">{codes.length}</p>
          <p className="text-xs text-white/40 mt-0.5">Total Codes</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-bold text-emerald-400">{totalActivations}</p>
          <p className="text-xs text-white/40 mt-0.5">Total Activations</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-bold text-amber-400">₦{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-white/40 mt-0.5">Total Revenue</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={() => setShowForm(p => !p)} className="bg-violet-600 hover:bg-violet-500 h-9 text-sm font-semibold">
          <Plus className="h-3.5 w-3.5 mr-1.5" /> New Code
        </Button>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-2 rounded-xl bg-white/3 border border-white/8">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Create New Access Code</h3>
              <form onSubmit={create} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Field label="Code *">
                  <Input
                    value={form.code}
                    onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. BATCH01"
                    className={inputCls}
                    required
                  />
                </Field>
                <Field label="Label *">
                  <Input
                    value={form.label}
                    onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                    placeholder="e.g. March 2025 Batch"
                    className={inputCls}
                    required
                  />
                </Field>
                <Field label="Max Activations">
                  <Input
                    type="number"
                    value={form.maxActivations}
                    onChange={e => setForm(p => ({ ...p, maxActivations: e.target.value }))}
                    className={inputCls}
                    min="1"
                  />
                </Field>
                <Field label="Price (₦)">
                  <Input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="0 for free"
                    className={inputCls}
                    min="0"
                  />
                </Field>
                <div className="col-span-2 md:col-span-4 flex gap-3">
                  <Button type="submit" disabled={creating} className="bg-violet-600 hover:bg-violet-500 h-9 text-sm">
                    {creating ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Creating…</> : "Create Code"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}
                    className="h-9 text-sm border-white/10 text-white/50 hover:text-white bg-transparent">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Codes table */}
      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-white/3 animate-pulse" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                {["Code", "Label", "Price", "Used / Max", "Revenue", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map(c => {
                const pct = c.max_activations > 0 ? Math.round((c.activation_count / c.max_activations) * 100) : 0;
                return (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-violet-300">{c.code}</td>
                    <td className="px-4 py-3 text-white/70">{c.label}</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">
                      {c.price > 0 ? `₦${parseInt(c.price).toLocaleString()}` : <span className="text-white/30">Free</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span className="text-xs text-white/70">{c.activation_count} / {c.max_activations}</span>
                        <div className="w-24 h-1.5 rounded-full bg-white/8 overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all", pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-500")}
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-400">
                      {parseInt(c.revenue_generated) > 0 ? `₦${parseInt(c.revenue_generated).toLocaleString()}` : <span className="text-white/20">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleCode(c.id, c.is_active)} disabled={toggling === c.id} className="flex items-center gap-1.5 transition-colors">
                        {toggling === c.id
                          ? <Loader2 className="h-4 w-4 animate-spin text-white/30" />
                          : c.is_active
                          ? <><ToggleRight className="h-5 w-5 text-emerald-400" /><span className="text-[10px] text-emerald-400">On</span></>
                          : <><ToggleLeft className="h-5 w-5 text-white/20" /><span className="text-[10px] text-white/30">Off</span></>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteCode(c.id, c.code)}
                        disabled={deleting === c.id || c.activation_count > 0}
                        title={c.activation_count > 0 ? "Cannot delete used code" : "Delete code"}
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                          c.activation_count > 0
                            ? "opacity-20 cursor-not-allowed bg-white/5"
                            : "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                        )}
                      >
                        {deleting === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {codes.length === 0 && (
            <div className="text-center py-10 text-white/30">
              <KeyRound className="h-7 w-7 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No access codes yet. Create your first one above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Revenue Tab ─────────────────────────────────────────────────────────────

function RevenueTab({ pin }: { pin: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setData(await adminFetch(pin, "/api/admin/revenue")); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="h-64 rounded-2xl bg-white/3 animate-pulse" />;
  if (!data) return <p className="text-white/30 text-center py-12">Could not load revenue data.</p>;

  const maxRevenue = Math.max(...(data.codes || []).map((c: any) => parseInt(c.revenue) || 0), 1);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6 text-center">
          <p className="ed-label mb-2">Total Revenue</p>
          <p className="text-4xl font-black text-emerald-400">₦{(data.total || 0).toLocaleString()}</p>
          <p className="text-xs text-white/30 mt-1">from {data.paidActivations || 0} paid activations</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="ed-label mb-2">Average per Activation</p>
          <p className="text-4xl font-black text-amber-400">
            ₦{data.paidActivations > 0 ? Math.round(data.total / data.paidActivations).toLocaleString() : "0"}
          </p>
          <p className="text-xs text-white/30 mt-1">across all paid codes</p>
        </div>
      </div>

      {/* Revenue by code */}
      <Section title="Revenue by Access Code">
        {data.codes?.filter((c: any) => c.price > 0).length === 0 ? (
          <p className="text-white/30 text-sm text-center py-6">No paid access codes yet. Set a price when creating a code.</p>
        ) : (
          <div className="space-y-3">
            {data.codes?.filter((c: any) => c.price > 0).map((c: any) => {
              const rev = parseInt(c.revenue) || 0;
              const pct = Math.round((rev / maxRevenue) * 100);
              return (
                <div key={c.code} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-violet-300">{c.code}</span>
                      <span className="text-white/40 text-xs">{c.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 text-xs">{c.activation_count} activations × ₦{parseInt(c.price).toLocaleString()}</span>
                      <span className="font-bold text-emerald-400">₦{rev.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── Anti-cheat Tab ───────────────────────────────────────────────────────────

function AntiCheatTab({ pin }: { pin: string }) {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const load = async (onlyFlagged = false) => {
    setLoading(true);
    try {
      setAttempts(await adminFetch(pin, `/api/admin/quiz-attempts${onlyFlagged ? "?flagged=1" : ""}`));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(flaggedOnly); }, [flaggedOnly]);

  const flagged = attempts.filter(a => a.is_flagged);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-bold text-white">{attempts.length}</p>
          <p className="text-xs text-white/40 mt-0.5">Recent Attempts</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className={cn("text-xl font-bold", flagged.length > 0 ? "text-red-400" : "text-emerald-400")}>{flagged.length}</p>
          <p className="text-xs text-white/40 mt-0.5">Flagged</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-bold text-white/60">{attempts.length > 0 ? Math.round((flagged.length / attempts.length) * 100) : 0}%</p>
          <p className="text-xs text-white/40 mt-0.5">Flag Rate</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setFlaggedOnly(p => !p)}
          className={cn(
            "flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all font-medium",
            flaggedOnly ? "bg-red-500/15 border-red-500/30 text-red-300" : "bg-white/3 border-white/8 text-white/40 hover:text-white/70"
          )}
        >
          <BadgeAlert className="h-3.5 w-3.5" />
          {flaggedOnly ? "Showing Flagged Only" : "Show Flagged Only"}
        </button>
        <button onClick={() => load(flaggedOnly)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-2 rounded-xl bg-white/3 border border-white/8">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {flagged.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <BadgeAlert className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">{flagged.length} suspicious attempt{flagged.length > 1 ? "s" : ""} detected</p>
            <p className="text-xs text-red-300/60 mt-0.5">These students completed quizzes unusually fast — may indicate answer sharing or external help. Review below.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-white/3 animate-pulse" />)}</div>
      ) : attempts.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <ShieldAlert className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No quiz attempts logged yet</p>
          <p className="text-xs mt-1">Attempts are recorded when students complete quizzes</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                {["Student", "Subject", "Paper", "Score", "Time / Q", "Total Time", "Date", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attempts.map(a => {
                const timePerQ = a.question_count > 0 ? Math.round(a.time_spent_seconds / a.question_count) : 0;
                return (
                  <tr key={a.id} className={cn("border-b border-white/5 transition-colors", a.is_flagged ? "bg-red-500/5 hover:bg-red-500/8" : "hover:bg-white/2")}>
                    <td className="px-4 py-3 font-medium text-white/90 whitespace-nowrap">{a.student_name || a.student_phone}</td>
                    <td className="px-4 py-3 text-white/60 text-xs">{a.subject_name || "—"}</td>
                    <td className="px-4 py-3 text-white/50 font-mono text-xs">{a.paper_code || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("font-bold text-xs",
                        a.percentage >= 70 ? "text-emerald-400" :
                        a.percentage >= 50 ? "text-amber-400" : "text-red-400"
                      )}>
                        {a.score}/{a.question_count} ({Math.round(a.percentage || 0)}%)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-mono font-semibold", timePerQ < 5 ? "text-red-400" : "text-white/60")}>
                        {timePerQ}s
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">{a.time_spent_seconds}s</td>
                    <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">
                      {a.created_at ? formatDistanceToNow(new Date(a.created_at), { addSuffix: true }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {a.is_flagged ? (
                        <div className="flex items-center gap-1.5">
                          <BadgeAlert className="h-3.5 w-3.5 text-red-400" />
                          <span className="text-[10px] text-red-400 font-semibold">Flagged</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400/50" />
                          <span className="text-[10px] text-emerald-400/50">OK</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="glass-card p-4 space-y-2">
        <p className="text-xs font-semibold text-white/50">How anti-cheat works</p>
        <ul className="space-y-1.5 text-xs text-white/35 list-disc list-inside">
          <li>Attempts are flagged if total time is less than <strong className="text-white/50">4 seconds × question count</strong></li>
          <li>Each attempt records the student name, subject, paper, score, and time spent</li>
          <li>Flagged attempts don't block the student — they're for your review only</li>
          <li>Very fast completions may indicate answer sharing, copying, or deliberate rushing</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Questions Tab ────────────────────────────────────────────────────────────

type ParsedQuestion = {
  subjectId: string; paper: string; year: string; questionType: string;
  questionText: string; optionA?: string; optionB?: string; optionC?: string; optionD?: string;
  correctOption?: string; explanation?: string; markingGuide?: string; marks?: string;
};

function parseCSVLocal(csv: string): ParsedQuestion[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { vals.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    vals.push(cur.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] ?? "").replace(/^"|"$/g, ""); });
    return obj as ParsedQuestion;
  });
}

type UploadResult = { inserted: number; failed: number; total: number; errors: { row: number; error: string }[] };

function QuestionsTab() {
  const { toast } = useToast();
  const { data: subjects } = useListSubjects();
  const createQuestion = useCreateQuestion();
  const { data: questionList, refetch } = useListQuestions({ limit: 50 });
  const deleteQuestion = useDeleteQuestion();
  const fileRef = useRef<HTMLInputElement>(null);
  const [subTab, setSubTab] = useState<"add" | "manage" | "bulk">("bulk");

  // Bulk upload state
  const [parsed, setParsed] = useState<ParsedQuestion[]>([]);
  const [fileName, setFileName] = useState("");
  const [autoExplain, setAutoExplain] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback((file: File) => {
    setError(""); setResult(null);
    const ext = file.name.split(".").pop()?.toLowerCase();
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        if (ext === "json") {
          const data = JSON.parse(text);
          setParsed(Array.isArray(data) ? data : data.questions ?? []);
        } else if (ext === "csv") {
          setParsed(parseCSVLocal(text));
        } else {
          setError("Only .json and .csv files are supported.");
        }
      } catch {
        setError("Could not parse file.");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleUpload = async () => {
    if (!parsed.length) return;
    setUploading(true); setResult(null); setError("");
    try {
      const r = await fetch(`${BASE}/api/questions/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPin: ADMIN_PIN_KEY, autoExplain, questions: parsed }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? "Upload failed"); return; }
      setResult(data);
      toast({ title: `✅ Uploaded ${data.inserted} of ${data.total} questions` });
      if (data.inserted === data.total) { setParsed([]); setFileName(""); if (fileRef.current) fileRef.current.value = ""; }
    } catch { setError("Network error."); } finally { setUploading(false); }
  };

  // Add question form state
  const [formData, setFormData] = useState({
    subjectId: "", paper: "001", year: new Date().getFullYear().toString(),
    questionType: "objective", questionText: "", optionA: "", optionB: "", optionC: "", optionD: "",
    correctOption: "A", explanation: "", markingGuide: "", marks: "5",
  });
  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.questionText) { toast({ title: "Fill required fields", variant: "destructive" }); return; }
    const payload: any = {
      subjectId: Number(formData.subjectId), paper: formData.paper, year: Number(formData.year),
      questionType: formData.questionType, questionText: formData.questionText,
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
        toast({ title: "Question saved!" });
        setFormData(p => ({ ...p, questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", explanation: "", markingGuide: "" }));
      },
      onError: () => toast({ title: "Failed to save", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 border-b border-white/8 pb-0 -mb-0">
        {[{ id: "bulk", label: "⬆️ Bulk Upload" }, { id: "add", label: "➕ Add Single" }, { id: "manage", label: "📋 Manage" }].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id as any)}
            className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              subTab === t.id ? "border-violet-400 text-violet-400" : "border-transparent text-white/40 hover:text-white/70"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "bulk" && (
        <div className="space-y-5 pt-2">
          <Section title="Bulk Question Upload">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-sm text-white/55 leading-relaxed">Upload dozens of questions at once using CSV or JSON. Optionally let AI generate explanations for questions that don't have one.</p>
                <button onClick={() => window.location.href = `${BASE}/api/questions/bulk/template`}
                  className="flex items-center gap-2 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors border border-violet-500/20 hover:border-violet-400/40 rounded-xl px-3 py-2 bg-violet-500/5 hover:bg-violet-500/10">
                  <Download className="h-3.5 w-3.5" /> Download CSV Template
                </button>
              </div>
              <div className="text-xs text-white/35 space-y-1 bg-white/3 rounded-xl p-3 border border-white/8">
                <p className="font-semibold text-white/50 mb-2">Required columns:</p>
                {[["subjectId","numeric subject ID"],["paper","001, 002, 003, 004"],["year","e.g. 2024"],["questionType","objective / theory"],["questionText","the question"],["optionA–D","for objective"],["correctOption","A, B, C or D"]].map(([k,v]) => (
                  <p key={k}><span className="text-white/60">{k}</span> — {v}</p>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Select File">
            <input ref={fileRef} type="file" accept=".json,.csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
              onClick={() => fileRef.current?.click()}
              className={cn("flex flex-col items-center justify-center gap-4 py-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all",
                dragOver ? "border-violet-400/60 bg-violet-500/8" : fileName ? "border-violet-500/30 bg-violet-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/3"
              )}>
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", fileName ? "bg-violet-500/20" : "bg-white/5")}>
                <FileText className={cn("h-6 w-6", fileName ? "text-violet-400" : "text-white/30")} />
              </div>
              {fileName ? (
                <div className="text-center">
                  <p className="text-sm font-bold text-white">{fileName}</p>
                  <p className="text-xs text-violet-400 mt-1">{parsed.length} questions parsed</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-white/60">Drop your CSV or JSON file here</p>
                  <p className="text-xs text-white/30 mt-1">or click to browse</p>
                </div>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
              </div>
            )}
          </Section>

          {parsed.length > 0 && (
            <Section title={`Preview — ${parsed.length} Questions`}>
              <div className="overflow-x-auto rounded-xl border border-white/8">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/3">
                      {["#","Subject ID","Paper","Year","Type","Question (preview)","Options","Answer"].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-white/40 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.slice(0, 10).map((q, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-3 py-2.5 text-white/30">{i + 1}</td>
                        <td className="px-3 py-2.5 text-white/70">{q.subjectId}</td>
                        <td className="px-3 py-2.5 text-white/70">{q.paper}</td>
                        <td className="px-3 py-2.5 text-white/70">{q.year}</td>
                        <td className="px-3 py-2.5">
                          <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold",
                            (q.questionType ?? "").toLowerCase() === "objective" ? "bg-blue-500/15 text-blue-300" : "bg-amber-500/15 text-amber-300")}>
                            {q.questionType}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-white/60 max-w-[200px] truncate">{q.questionText}</td>
                        <td className="px-3 py-2.5 text-center">{q.optionA ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mx-auto" /> : <X className="h-3.5 w-3.5 text-red-400/50 mx-auto" />}</td>
                        <td className="px-3 py-2.5 text-center">{q.correctOption ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mx-auto" /> : <X className="h-3.5 w-3.5 text-red-400/50 mx-auto" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.length > 10 && <p className="px-4 py-2.5 text-xs text-white/30 border-t border-white/8">… and {parsed.length - 10} more</p>}
              </div>

              <div onClick={() => setAutoExplain(p => !p)}
                className={cn("flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                  autoExplain ? "bg-violet-500/10 border-violet-500/30" : "bg-white/3 border-white/8 hover:bg-white/5")}>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", autoExplain ? "bg-violet-500/20" : "bg-white/5")}>
                  <Brain className={cn("h-4 w-4", autoExplain ? "text-violet-400" : "text-white/30")} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">AI-Generate Explanations</p>
                  <p className="text-xs text-white/40 mt-0.5">Auto-write academic explanations using Gemini for questions without one.</p>
                </div>
                <div className={cn("w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                  autoExplain ? "bg-violet-500 border-violet-400" : "bg-white/5 border-white/15")}>
                  {autoExplain && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
              </div>

              <Button onClick={handleUpload} disabled={uploading || !parsed.length}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white rounded-xl">
                {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading{autoExplain ? " & Generating…" : "…"}</> : <><Upload className="h-4 w-4 mr-2" />Upload {parsed.length} Questions</>}
              </Button>
            </Section>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Section title="Upload Result">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-2xl font-bold text-emerald-400">{result.inserted}</p>
                    <p className="text-xs text-white/40 mt-1">Inserted</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-2xl font-bold text-red-400">{result.failed}</p>
                    <p className="text-xs text-white/40 mt-1">Failed</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/8">
                    <p className="text-2xl font-bold text-white">{result.total}</p>
                    <p className="text-xs text-white/40 mt-1">Total</p>
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="space-y-2">
                    {result.errors.map((e, i) => (
                      <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-red-500/8 border border-red-500/15 text-xs text-red-300">
                        <span className="font-bold flex-shrink-0">Row {e.row}</span>
                        <span className="text-red-300/70">{e.error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </motion.div>
          )}
        </div>
      )}

      {subTab === "add" && (
        <form onSubmit={handleAddSubmit} className="pt-2">
          <Section title="New Question">
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Subject *">
                  <Select value={formData.subjectId} onValueChange={v => set("subjectId", v)}>
                    <SelectTrigger className={inputCls}><SelectValue placeholder="Choose…" /></SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      {(Array.isArray(subjects) ? subjects : []).map(s => <SelectItem key={s.id} value={s.id.toString()} className="text-white">{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Paper">
                  <Select value={formData.paper} onValueChange={v => set("paper", v)}>
                    <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      {[["001","1st Incourse"],["002","1st Semester"],["003","2nd Incourse"],["004","Mock"]].map(([v,l]) => (
                        <SelectItem key={v} value={v} className="text-white">{v} — {l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Year">
                  <Input type="number" value={formData.year} onChange={e => set("year", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Type">
                  <Select value={formData.questionType} onValueChange={v => set("questionType", v)}>
                    <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      <SelectItem value="objective" className="text-white">Objective</SelectItem>
                      <SelectItem value="theory" className="text-white">Theory</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Question Text *">
                <Textarea value={formData.questionText} onChange={e => set("questionText", e.target.value)}
                  className={cn(inputCls, "min-h-[100px] font-serif")} placeholder="Type the question here…" />
              </Field>
              {formData.questionType === "objective" ? (
                <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-4">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Answer Options</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["A","B","C","D"].map(l => (
                      <div key={l} className="flex items-center gap-2.5">
                        <span className="w-6 text-sm font-bold text-white/40">{l}.</span>
                        <Input value={(formData as any)[`option${l}`]} onChange={e => set(`option${l}`, e.target.value)} className={inputCls} placeholder={`Option ${l}`} />
                      </div>
                    ))}
                  </div>
                  <Field label="Correct Answer">
                    <Select value={formData.correctOption} onValueChange={v => set("correctOption", v)}>
                      <SelectTrigger className={cn(inputCls, "w-28")}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-white/10">
                        {["A","B","C","D"].map(l => <SelectItem key={l} value={l} className="text-white">{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-4">
                  <Field label="Marking Guide / Expected Answer">
                    <Textarea value={formData.markingGuide} onChange={e => set("markingGuide", e.target.value)}
                      className={cn(inputCls, "min-h-[130px]")} placeholder="Expected answer or marking points…" />
                  </Field>
                  <Field label="Marks">
                    <Input type="number" value={formData.marks} onChange={e => set("marks", e.target.value)} className={cn(inputCls, "w-28")} />
                  </Field>
                </div>
              )}
              <Field label="Explanation (Optional)">
                <Textarea value={formData.explanation} onChange={e => set("explanation", e.target.value)}
                  className={cn(inputCls, "min-h-[80px]")} placeholder="Why is this the answer?" />
              </Field>
              <Button type="submit" disabled={createQuestion.isPending} className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-11 px-8">
                <Plus className="h-4 w-4 mr-2" />{createQuestion.isPending ? "Saving…" : "Save Question"}
              </Button>
            </div>
          </Section>
        </form>
      )}

      {subTab === "manage" && (
        <Section title="Recent Questions">
          <div className="space-y-3">
            {(Array.isArray(questionList) ? questionList : []).map(q => (
              <div key={q.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/3 border border-white/8 hover:bg-white/4 transition-colors">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-[10px] bg-violet-500/15 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-lg">{q.subjectName}</span>
                    <span className="text-[10px] bg-white/8 text-white/50 border border-white/10 px-2 py-0.5 rounded-lg">{q.paper}</span>
                    <span className="text-[10px] bg-white/8 text-white/50 border border-white/10 px-2 py-0.5 rounded-lg capitalize">{q.questionType}</span>
                  </div>
                  <p className="text-sm text-white/75 line-clamp-2 leading-snug">{q.questionText}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button title="Edit (coming soon)" className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { if (confirm("Delete this question?")) deleteQuestion.mutate({ questionId: q.id }, { onSuccess: () => { toast({ title: "Question deleted" }); refetch(); } }); }}
                    disabled={deleteQuestion.isPending}
                    className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {(!questionList || (questionList as any[]).length === 0) && (
              <p className="text-center text-white/30 py-8 text-sm">No questions yet.</p>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}

// ─── Announcements Tab ────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "info", label: "ℹ️  Info" }, { value: "success", label: "✅  Success" },
  { value: "warning", label: "⚠️  Warning" }, { value: "event", label: "🎉  Event" },
];
const TYPE_BADGE: Record<string, string> = {
  info: "bg-sky-500/15 text-sky-300 border-sky-500/20", success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/20", event: "bg-violet-500/15 text-violet-300 border-violet-500/20",
};
const BORDER_MAP: Record<string, string> = {
  info: "border-l-sky-400", success: "border-l-emerald-400", warning: "border-l-amber-400", event: "border-l-violet-400",
};
const EMOJI_PRESETS = ["📢", "🎉", "⚠️", "📌", "✅", "🚀", "📚", "🔔", "🏆", "💡"];

function AnnouncementsTab() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "info", emoji: "📢", authorName: "Admin", isPinned: false });
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    const r = await fetch(`${BASE}/api/announcements`);
    if (r.ok) { setAnnouncements(await r.json()); setLoaded(true); }
  };
  if (!loaded) { load(); }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast({ title: "Title and content are required", variant: "destructive" }); return; }
    setPosting(true);
    try {
      const r = await fetch(`${BASE}/api/announcements`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, adminPin: ADMIN_PIN_KEY }),
      });
      if (r.ok) {
        const ann = await r.json();
        setAnnouncements(p => [ann, ...p]);
        setForm({ title: "", content: "", type: "info", emoji: "📢", authorName: "Admin", isPinned: false });
        toast({ title: "Announcement posted!" });
      } else { const d = await r.json(); toast({ title: d.error || "Failed", variant: "destructive" }); }
    } finally { setPosting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    setDeleting(id);
    try {
      const r = await fetch(`${BASE}/api/announcements/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminPin: ADMIN_PIN_KEY }) });
      if (r.ok) { setAnnouncements(p => p.filter(a => a.id !== id)); toast({ title: "Deleted" }); }
    } finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      <Section title="Post New Announcement">
        <form onSubmit={handlePost} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title *">
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. New questions added for Economics Paper 002" className={inputCls} />
            </Field>
            <Field label="Type">
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  {TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value} className="text-white">{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Content *">
            <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              placeholder="Write your message to scholars…" className={cn(inputCls, "min-h-[100px] resize-none")} />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Author Name">
              <Input value={form.authorName} onChange={e => setForm(p => ({ ...p, authorName: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Emoji">
              <div className="space-y-2">
                <Input value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))} className={cn(inputCls, "w-24")} maxLength={4} />
                <div className="flex gap-1.5 flex-wrap">
                  {EMOJI_PRESETS.map(em => (
                    <button key={em} type="button" onClick={() => setForm(p => ({ ...p, emoji: em }))}
                      className={cn("w-8 h-8 rounded-lg text-lg flex items-center justify-center border transition-all",
                        form.emoji === em ? "bg-violet-500/20 border-violet-500/40" : "bg-white/5 border-white/10 hover:bg-white/10")}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </Field>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setForm(p => ({ ...p, isPinned: !p.isPinned }))}
              className={cn("w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer",
                form.isPinned ? "bg-violet-500 border-violet-400" : "bg-white/5 border-white/15")}>
              {form.isPinned && <CheckCircle2 className="h-3 w-3 text-white" />}
            </div>
            <span className="text-sm text-white/60 flex items-center gap-1.5"><Pin className="h-3.5 w-3.5" />Pin to top of Dashboard</span>
          </label>
          <Button type="submit" disabled={posting || !form.title.trim() || !form.content.trim()}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-11 px-8">
            <Megaphone className="h-4 w-4 mr-2" />{posting ? "Posting…" : "Post Announcement"}
          </Button>
        </form>
      </Section>
      <Section title={`Posted (${announcements.length})`}>
        {announcements.length === 0 ? (
          <div className="text-center py-10 text-white/25"><Megaphone className="h-8 w-8 mx-auto mb-3 opacity-30" /><p className="text-sm">No announcements yet.</p></div>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className={cn("flex items-start gap-4 p-4 rounded-2xl border border-l-4 bg-white/2", BORDER_MAP[a.type] || "border-l-sky-400", "border-white/6")}>
                <span className="text-2xl flex-shrink-0">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-bold text-white">{a.title}</span>
                    <span className={cn("text-[10px] border px-1.5 py-0.5 rounded capitalize", TYPE_BADGE[a.type])}>{a.type}</span>
                    {a.isPinned && <span className="flex items-center gap-1 text-[10px] text-white/35"><Pin className="h-2.5 w-2.5" />Pinned</span>}
                  </div>
                  <p className="text-xs text-white/55 leading-relaxed">{a.content}</p>
                  <p className="text-[10px] text-white/25 mt-1">— {a.authorName} · {format(new Date(a.createdAt), "MMM d, yyyy h:mm a")}</p>
                </div>
                <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id}
                  className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    const r = await fetch(`${BASE}/api/settings`);
    if (r.ok) { setSettings(await r.json()); setLoaded(true); }
  };
  if (!loaded) { load(); }

  const save = async (key: string, value: string) => {
    setSaving(key);
    try {
      const r = await fetch(`${BASE}/api/settings`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, adminPin: ADMIN_PIN_KEY }),
      });
      if (r.ok) { setSettings(p => ({ ...p, [key]: value })); toast({ title: "Setting saved" }); }
      else toast({ title: "Failed to save", variant: "destructive" });
    } finally { setSaving(null); }
  };

  const TimerField = ({ label, settingKey, desc }: { label: string; settingKey: string; desc: string }) => {
    const [val, setVal] = useState("");
    const current = settings[settingKey] ?? "";
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Timer className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-white/40">{desc}</p>
            <p className="text-xs text-white/25 mt-0.5">Current: <span className="text-amber-400">{current || "—"} min</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Input type="number" min="10" max="360" placeholder={current} value={val} onChange={e => setVal(e.target.value)} className={cn(inputCls, "w-24 text-center")} />
          <Button size="sm" disabled={!val || saving === settingKey} onClick={() => { if (val) { save(settingKey, val); setVal(""); } }}
            className="bg-violet-600 hover:bg-violet-500 text-white h-9 px-4">
            {saving === settingKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
    );
  };

  const CredentialField = ({ label, settingKey, desc, isSecret }: {
    label: string; settingKey: string; desc: string; isSecret?: boolean;
  }) => {
    const [val, setVal] = useState("");
    const current = settings[settingKey] ?? "";
    const display = isSecret && current ? "••••••••" + current.slice(-4) : current;
    return (
      <div className="p-4 rounded-xl bg-white/3 border border-white/8 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <KeyRound className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-white/40">{desc}</p>
            {current && <p className="text-[10px] text-emerald-400 mt-0.5 font-mono truncate">✓ {display}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            type={isSecret ? "password" : "text"}
            placeholder={`Paste ${label}…`}
            value={val}
            onChange={e => setVal(e.target.value)}
            className={cn(inputCls, "flex-1 text-xs font-mono")}
          />
          <Button size="sm" disabled={!val.trim() || saving === settingKey}
            onClick={() => { if (val.trim()) { save(settingKey, val.trim()); setVal(""); } }}
            className="bg-blue-600 hover:bg-blue-500 text-white h-9 px-4 flex-shrink-0">
            {saving === settingKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Section title="Exam Timer Durations">
        <p className="text-xs text-white/40 -mt-2 leading-relaxed">Configure default exam durations. Changes take effect immediately for all students.</p>
        <div className="space-y-3">
          <TimerField label="Objective (MCQ) Timer" settingKey="obj_timer_minutes" desc="Papers 001, 002, 003 — multiple choice" />
          <TimerField label="Theory Timer" settingKey="theory_timer_minutes" desc="Written / essay type questions" />
          <TimerField label="Mock Exam Timer" settingKey="mock_timer_minutes" desc="Full mock / Paper 004 exams" />
        </div>
      </Section>
      <Section title="Current Timers">
        <div className="grid sm:grid-cols-3 gap-3 text-center">
          {[{ label: "Objective", key: "obj_timer_minutes", default: "60" }, { label: "Theory", key: "theory_timer_minutes", default: "120" }, { label: "Mock Exam", key: "mock_timer_minutes", default: "120" }].map(item => (
            <div key={item.key} className="p-4 rounded-xl bg-white/3 border border-white/8">
              <p className="text-2xl font-bold text-amber-400">{settings[item.key] ?? item.default}</p>
              <p className="text-xs text-white/30 mt-1">min — {item.label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Google Sign-In (OAuth 2.0)">
        <p className="text-xs text-white/40 -mt-2 leading-relaxed">
          Allows students to register and sign in with their Google account.
          Get credentials from{" "}
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:underline">Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID</a>.
          Set the Authorised redirect URI to <span className="font-mono text-[10px] text-white/50">{typeof window !== "undefined" ? window.location.origin : ""}/api/auth/google/callback</span>.
        </p>
        <div className="space-y-3">
          <CredentialField label="Google Client ID" settingKey="google_client_id" desc="OAuth 2.0 Client ID — safe to expose publicly" />
          <CredentialField label="Google Client Secret" settingKey="google_client_secret" desc="Client Secret — kept server-side only" isSecret />
        </div>
        {settings["google_client_id"] ? (
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            Google Sign-In is active. The button appears on the login/register page automatically.
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-sm text-white/35">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-white/25" />
            Add your Client ID above to enable Google Sign-In for students.
          </div>
        )}
      </Section>

      <Section title="HuggingFace Token (Voice AI)">
        <p className="text-xs text-white/40 -mt-2 leading-relaxed">
          Required to enable the Voice AI Teacher (YarnGPT Nigerian accent).
          Get a free token from{" "}
          <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer"
            className="text-green-400 hover:underline">huggingface.co/settings/tokens</a>.
        </p>
        <CredentialField label="HuggingFace Token" settingKey="huggingface_token" desc="Read-only token is sufficient" isSecret />
        {settings["huggingface_token"] ? (
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            Voice AI is configured. Students can use the Voice Teacher page.
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-sm text-white/35">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-white/25" />
            Add your HuggingFace token above to enable Voice AI.
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── Branding Tab ─────────────────────────────────────────────────────────────

function BrandingTab() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [botImage, setBotImage] = useState<string | null>(() => localStorage.getItem("jupeb_bot_image"));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: "Image too large", description: "Under 2 MB please.", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      localStorage.setItem("jupeb_bot_image", b64);
      setBotImage(b64);
      toast({ title: "Bot image updated" });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    localStorage.removeItem("jupeb_bot_image");
    setBotImage(null);
    if (fileRef.current) fileRef.current.value = "";
    toast({ title: "Bot image removed" });
  };

  return (
    <div className="space-y-6">
      <Section title="AI Tutor Identity Image">
        <p className="text-xs text-white/40 leading-relaxed -mt-2">Upload a custom image for the AI Tutor — appears in chat headers and message bubbles. Recommended: square, ≥128×128px, under 2 MB.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <button onClick={() => fileRef.current?.click()}
              className={cn("w-full flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed transition-all",
                botImage ? "border-violet-500/30 bg-violet-500/5 hover:border-violet-400/50" : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5")}>
              <div className="w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center"><ImagePlus className="h-5 w-5 text-white/40" /></div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white/60">{botImage ? "Replace image" : "Upload bot image"}</p>
                <p className="text-xs text-white/30 mt-0.5">PNG, JPG, WebP · Max 2 MB</p>
              </div>
            </button>
            {botImage && (
              <button onClick={handleClear}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/8 border border-red-500/15 hover:border-red-500/30 transition-all">
                <X className="h-3.5 w-3.5" />Remove image
              </button>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Preview</p>
            <div className="glass-card p-4 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/8">
                <div className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20 flex-shrink-0">
                  {botImage ? <img src={botImage} alt="Bot" className="w-full h-full object-cover" /> : <Sparkles className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">AI Tutor</p>
                  <p className="text-[10px] text-white/35">JUPEB Study Assistant · Online</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0">
                  {botImage ? <img src={botImage} alt="Bot" className="w-full h-full object-cover" /> : <Sparkles className="h-3.5 w-3.5 text-white" />}
                </div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm px-3 py-2">
                  <p className="text-xs text-white/70">Hey! I'm your JUPEB AI Tutor 🎓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
      <Section title="User Appearance">
        <div className="flex items-start gap-4 py-2">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/15 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
            <User className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/80">User Profile Pictures</p>
            <p className="text-xs text-white/40 mt-1 leading-relaxed">
              Students manage their own profile picture from the <span className="text-violet-400">Settings</span> page.
              Photos appear in the sidebar, chat bubbles, and community posts automatically.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ─── Tab Navigation ───────────────────────────────────────────────────────────

const ADMIN_TABS: { id: AdminTab; label: string; icon: any; desc: string }[] = [
  { id: "overview",      label: "Overview",      icon: LayoutDashboard, desc: "Platform stats" },
  { id: "students",      label: "Students",      icon: Users,           desc: "Manage students" },
  { id: "codes",         label: "Access Codes",  icon: KeyRound,        desc: "Create & manage" },
  { id: "revenue",       label: "Revenue",       icon: DollarSign,      desc: "Earnings tracker" },
  { id: "questions",     label: "Questions",     icon: BookOpen,        desc: "Upload & manage" },
  { id: "anticheat",     label: "Anti-cheat",    icon: ShieldAlert,     desc: "Audit log" },
  { id: "announcements", label: "Announcements", icon: Megaphone,       desc: "Post updates" },
  { id: "settings",      label: "Settings",      icon: Timer,           desc: "Timers & config" },
  { id: "branding",      label: "Branding",      icon: ImagePlus,       desc: "Bot image" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("admin_auth") === "true");
  const [pin, setPin] = useState(isAuthenticated ? ADMIN_PIN_KEY : "");
  const [inputPin, setInputPin] = useState("");
  const { toast } = useToast();
  const [tab, setTab] = useState<AdminTab>("overview");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === ADMIN_PIN_KEY) {
      setIsAuthenticated(true);
      setPin(ADMIN_PIN_KEY);
      localStorage.setItem("admin_auth", "true");
      toast({ title: "Admin access granted" });
    } else {
      toast({ title: "Wrong PIN", variant: "destructive" });
      setInputPin("");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPin("");
    localStorage.removeItem("admin_auth");
  };

  if (!isAuthenticated) {
    return (
      <Shell>
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
            <div className="glass-card p-8 space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto border border-violet-500/25">
                <Lock className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-serif text-white">Admin Panel</h1>
                <p className="text-white/40 text-sm mt-1">Enter your PIN to continue</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input type="password" value={inputPin} onChange={e => setInputPin(e.target.value)}
                  placeholder="Enter PIN" className={cn(inputCls, "text-center text-lg tracking-widest h-12")} autoFocus />
                <Button type="submit" className="w-full h-12 bg-violet-600 hover:bg-violet-500 font-bold">
                  Verify Access
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </Shell>
    );
  }

  const activeTab = ADMIN_TABS.find(t => t.id === tab);

  return (
    <Shell>
      <div className="p-5 md:p-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="ed-label mb-1">Admin Panel</p>
            <h1 className="text-2xl font-bold font-serif text-white">{activeTab?.label}</h1>
            <p className="text-white/40 text-sm mt-0.5">{activeTab?.desc}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}
            className="border-white/15 text-white/60 hover:bg-white/8 hover:text-white bg-transparent text-sm">
            Lock Session
          </Button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 flex-wrap border-b border-white/8 pb-0 mb-6 overflow-x-auto">
          {ADMIN_TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap",
                  tab === t.id ? "border-violet-400 text-violet-400" : "border-transparent text-white/40 hover:text-white/70"
                )}>
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {tab === "overview"      && <OverviewTab pin={pin} />}
            {tab === "students"      && <StudentsTab pin={pin} />}
            {tab === "codes"         && <CodesTab pin={pin} />}
            {tab === "revenue"       && <RevenueTab pin={pin} />}
            {tab === "questions"     && <QuestionsTab />}
            {tab === "anticheat"     && <AntiCheatTab pin={pin} />}
            {tab === "announcements" && <AnnouncementsTab />}
            {tab === "settings"      && <SettingsTab />}
            {tab === "branding"      && <BrandingTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Shell>
  );
}
