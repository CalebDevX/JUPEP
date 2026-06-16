import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function PaymentCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) { setStatus("failed"); setMessage("No payment reference found."); return; }

    fetch(`/api/payment/verify/${encodeURIComponent(reference)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Access granted until end of August.");
          // Update local profile
          try {
            const profile = JSON.parse(localStorage.getItem("jupeb_profile") || "{}");
            profile.sessionActive = true;
            profile.paymentStatus = "paid";
            localStorage.setItem("jupeb_profile", JSON.stringify(profile));
          } catch {}
        } else {
          setStatus("failed");
          setMessage(data.error || "Payment could not be verified.");
        }
      })
      .catch(() => { setStatus("failed"); setMessage("Network error. Please contact support."); });
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-sm p-8 text-center space-y-5"
      >
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-violet-400 mx-auto" />
            <p className="text-white font-semibold">Verifying your payment…</p>
            <p className="text-white/40 text-sm">Please wait, don't close this page.</p>
          </>
        )}
        {status === "success" && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
              <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white">Payment Successful! 🎉</h2>
              <p className="text-white/50 text-sm mt-2">{message}</p>
            </div>
            <Link href="/">
              <button className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors">
                Start Studying →
              </button>
            </Link>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="h-14 w-14 text-rose-400 mx-auto" />
            <div>
              <h2 className="text-xl font-bold font-serif text-white">Payment Failed</h2>
              <p className="text-white/50 text-sm mt-2">{message}</p>
            </div>
            <Link href="/subscribe">
              <button className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-colors">
                Try Again
              </button>
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
