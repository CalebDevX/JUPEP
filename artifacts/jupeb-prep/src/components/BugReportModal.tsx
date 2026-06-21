import { useState, useRef } from "react";
import { Bug, X, ImagePlus, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

const BASE = import.meta.env.VITE_API_URL || "";

function getProfile() {
  try { return JSON.parse(localStorage.getItem("jupeb_profile") || "null"); } catch { return null; }
}

export function BugReportModal() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [location] = useLocation();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3_000_000) {
      alert("Image must be under 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setImageData(result);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagePreview(null);
    setImageData(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      const profile = getProfile();
      await fetch(`${BASE}/api/bug-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: profile?.phone || null,
          fullName: profile?.fullName || null,
          description: description.trim(),
          image: imageData || null,
          page: location || window.location.pathname,
        }),
      });
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setDescription("");
        setImagePreview(null);
        setImageData(null);
      }, 2200);
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  function openModal() {
    setOpen(true);
    setSubmitted(false);
    setDescription("");
    setImagePreview(null);
    setImageData(null);
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={openModal}
        title="Report a bug"
        className="fixed bottom-24 right-4 z-40 w-11 h-11 rounded-full bg-[#1a1a2e] border border-white/10 shadow-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/20 transition-all"
      >
        <Bug className="h-4.5 w-4.5" />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 bottom-4 z-50 max-w-md mx-auto"
            >
              <div className="rounded-2xl border border-white/10 bg-[#13131f] shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center">
                      <Bug className="h-4 w-4 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Report a Bug</p>
                      <p className="text-[11px] text-white/40">We'll look into it right away</p>
                    </div>
                  </div>
                  <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/8 transition-all">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Body */}
                {submitted ? (
                  <div className="px-5 py-8 flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    </div>
                    <p className="text-white font-semibold">Report submitted!</p>
                    <p className="text-white/50 text-sm">Thanks for the feedback. We'll fix it soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-white/50 uppercase tracking-wider block mb-1.5">
                        What went wrong? *
                      </label>
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Describe the issue — what happened and what you expected..."
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/25 resize-none focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
                        required
                      />
                    </div>

                    {/* Image section */}
                    <div>
                      <label className="text-xs font-medium text-white/50 uppercase tracking-wider block mb-1.5">
                        Screenshot (optional)
                      </label>
                      {imagePreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-white/10">
                          <img src={imagePreview} alt="Screenshot preview" className="w-full max-h-40 object-cover" />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white/80 hover:bg-black/80 transition-all"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="w-full h-20 rounded-xl border border-dashed border-white/15 flex flex-col items-center justify-center gap-1.5 text-white/35 hover:text-white/50 hover:border-white/25 transition-all"
                        >
                          <ImagePlus className="h-5 w-5" />
                          <span className="text-xs">Attach a screenshot</span>
                        </button>
                      )}
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !description.trim()}
                      className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : "Send Report"}
                    </button>

                    <p className="text-center text-[11px] text-white/25">
                      Page: {location || window.location.pathname}
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
