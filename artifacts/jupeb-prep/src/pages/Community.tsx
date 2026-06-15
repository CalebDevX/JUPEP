import { useState, useEffect, useRef } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, MessageSquare, Heart, Send, ChevronDown, ChevronRight,
  CheckCircle2, Lock, Globe, Phone, ExternalLink, ArrowLeft,
  Sparkles, Plus, X, AlertCircle, Clock, User, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Community {
  id: number; name: string; slug: string; description: string;
  type: string; coverColor: string; coverEmoji: string;
  whatsappNumber: string | null; website: string | null;
  verified: boolean; requiresApproval: boolean;
  memberCount: number; postCount: number; adminName: string;
}

interface Post {
  id: number; communityId: number; authorName: string;
  content: string; commentCount: number; likeCount: number;
  createdAt: string;
}

interface Comment {
  id: number; postId: number; authorName: string;
  content: string; createdAt: string;
}

interface CommunityDetail extends Community {
  posts: Post[];
  members: { id: number; displayName: string; role: string; joinedAt: string }[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-violet-600", "bg-blue-600", "bg-emerald-600", "bg-amber-600",
  "bg-rose-600", "bg-sky-600", "bg-pink-600", "bg-teal-600",
];
function avatarColor(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash << 5) - hash + c.charCodeAt(0);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getMyProfilePic(): string | null {
  try { return localStorage.getItem("jupeb_profile_picture"); } catch { return null; }
}

function Avatar({ name, size = "sm", isMe = false }: { name: string; size?: "sm" | "md" | "lg"; isMe?: boolean }) {
  const sz = size === "lg" ? "w-10 h-10 text-sm" : size === "md" ? "w-8 h-8 text-xs" : "w-7 h-7 text-[10px]";
  const pic = isMe ? getMyProfilePic() : null;
  if (pic) {
    return (
      <div className={cn("rounded-xl overflow-hidden flex-shrink-0", sz)}>
        <img src={pic} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={cn("rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0", sz, avatarColor(name))}>
      {getInitials(name)}
    </div>
  );
}

function PostCard({ post, slug, myName }: { post: Post; slug: string; myName: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [liked, setLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  const loadComments = async () => {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`${BASE}/api/communities/${slug}/posts/${post.id}/comments`);
      if (res.ok) setComments(await res.json());
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    if (!showComments && comments.length === 0) loadComments();
    setShowComments(v => !v);
  };

  const submitComment = async () => {
    if (!newComment.trim() || !myName) return;
    setPosting(true);
    try {
      const res = await fetch(`${BASE}/api/communities/${slug}/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: myName, content: newComment.trim() }),
      });
      if (res.ok) {
        const c = await res.json();
        setComments(prev => [...prev, c]);
        setCommentCount(v => v + 1);
        setNewComment("");
      }
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikeCount(v => v + 1);
    fetch(`${BASE}/api/communities/${slug}/posts/${post.id}/like`, { method: "POST" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar name={post.authorName} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white">{post.authorName}</span>
              <span className="text-[10px] text-white/30">{timeAgo(post.createdAt)}</span>
            </div>
            <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              liked ? "text-rose-400" : "text-white/40 hover:text-rose-400"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", liked && "fill-rose-400")} />
            {likeCount > 0 && <span>{likeCount}</span>}
            <span>Like</span>
          </button>
          <button
            onClick={toggleComments}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-sky-400 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {commentCount > 0 && <span>{commentCount}</span>}
            <span>Comment</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", showComments && "rotate-180")} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 bg-white/2"
          >
            <div className="px-4 py-3 space-y-3">
              {loadingComments ? (
                <div className="text-xs text-white/30 text-center py-2">Loading…</div>
              ) : comments.length === 0 ? (
                <div className="text-xs text-white/30 text-center py-2">No comments yet. Be the first!</div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <Avatar name={c.authorName} size="sm" />
                    <div className="flex-1 bg-white/5 rounded-xl px-3 py-2 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-white">{c.authorName}</span>
                        <span className="text-[10px] text-white/25">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              )}

              {myName ? (
                <div className="flex items-center gap-2 pt-1">
                  <Avatar name={myName} size="sm" isMe={true} />
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                      placeholder="Write a comment…"
                      className="h-8 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                    />
                    <button
                      onClick={submitComment}
                      disabled={!newComment.trim() || posting}
                      className="w-8 h-8 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/30 text-center py-1">Join to comment</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CommunityView({ slug, onBack, myName }: { slug: string; onBack: () => void; myName: string }) {
  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [tab, setTab] = useState<"feed" | "members">("feed");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/communities/${slug}`);
      if (res.ok) setCommunity(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [slug]);

  const submitPost = async () => {
    if (!newPost.trim() || !myName) return;
    setPosting(true);
    setPostError("");
    try {
      const res = await fetch(`${BASE}/api/communities/${slug}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: myName, content: newPost.trim() }),
      });
      if (res.ok) {
        const post = await res.json();
        setCommunity(prev => prev ? { ...prev, posts: [post, ...prev.posts], postCount: prev.postCount + 1 } : prev);
        setNewPost("");
      } else {
        const d = await res.json();
        setPostError(d.error || "Failed to post");
      }
    } finally {
      setPosting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-sky-500/40 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-sm text-white/40">Loading community…</p>
      </div>
    </div>
  );

  if (!community) return <div className="text-center text-white/40 py-16">Community not found.</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to communities
        </button>
        <div className="glass-card overflow-hidden">
          <div className="h-20 w-full flex items-center justify-center text-5xl" style={{ backgroundColor: community.coverColor + "30", borderBottom: `1px solid ${community.coverColor}30` }}>
            {community.coverEmoji}
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold font-serif text-white">{community.name}</h2>
                  {community.verified && (
                    <CheckCircle2 className="h-4 w-4 text-sky-400 flex-shrink-0" />
                  )}
                  <Badge className={cn("text-[10px] border px-2",
                    community.type === "tutorial_center" ? "bg-amber-500/15 text-amber-300 border-amber-500/20" :
                    community.type === "study_group" ? "bg-violet-500/15 text-violet-300 border-violet-500/20" :
                    "bg-sky-500/15 text-sky-300 border-sky-500/20"
                  )}>
                    {community.type === "tutorial_center" ? "Tutorial Centre" : community.type === "study_group" ? "Study Group" : "General"}
                  </Badge>
                  {community.requiresApproval && (
                    <Badge className="text-[10px] border px-2 bg-white/5 text-white/40 border-white/10">
                      <Lock className="h-2.5 w-2.5 mr-1" />Approval required
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-white/50 mt-1">{community.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-xs text-white/40">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{community.memberCount} members</span>
              <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{community.postCount} posts</span>
              {community.whatsappNumber && (
                <a href={`https://wa.me/${community.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors">
                  <Phone className="h-3.5 w-3.5" />WhatsApp
                </a>
              )}
              {community.website && (
                <a href={community.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {(["feed", "members"] as const).map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className={cn("px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors -mb-px",
              tab === t ? "border-sky-400 text-sky-400" : "border-transparent text-white/40 hover:text-white/70"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "feed" && (
        <div className="space-y-4">
          {myName ? (
            <div className="glass-card p-4">
              <div className="flex items-start gap-3">
                <Avatar name={myName} size="md" isMe={true} />
                <div className="flex-1 space-y-3">
                  <Textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder={`Share something with the community, ${myName.split(" ")[0]}…`}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] resize-none text-sm"
                  />
                  {postError && <p className="text-xs text-red-400">{postError}</p>}
                  <div className="flex justify-end">
                    <Button onClick={submitPost} disabled={!newPost.trim() || posting}
                      className="bg-sky-600 hover:bg-sky-500 text-white text-sm rounded-xl px-4 h-9">
                      {posting ? "Posting…" : <><Send className="h-3.5 w-3.5 mr-1.5" />Post</>}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-white/40">Join this community to post and comment.</p>
            </div>
          )}

          {community.posts.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No posts yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {community.posts.map(post => (
                <PostCard key={post.id} post={post} slug={community.slug} myName={myName} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "members" && (
        <div className="space-y-2">
          {community.members.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">No members yet.</div>
          ) : (
            community.members.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3 bg-white/3 rounded-2xl border border-white/5">
                <Avatar name={m.displayName} size="md" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-white">{m.displayName}</span>
                </div>
                {m.role !== "member" && (
                  <Badge className="text-[10px] bg-amber-500/15 text-amber-300 border-amber-500/20 border">
                    <Shield className="h-2.5 w-2.5 mr-1" />{m.role}
                  </Badge>
                )}
                <span className="text-[10px] text-white/25">{timeAgo(m.joinedAt)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function JoinModal({
  community, onClose, onJoined,
}: { community: Community; onClose: () => void; onJoined: (name: string) => void }) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleJoin = async () => {
    if (!name.trim() || !whatsapp.trim()) { setError("Please fill in all fields."); return; }
    if (!/^[+\d\s\-()]{7,}$/.test(whatsapp.trim())) { setError("Please enter a valid WhatsApp number."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/communities/${community.slug}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name.trim(), whatsappNumber: whatsapp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Join failed"); return; }
      setSuccess(true);
      setIsPending(data.status === "pending");
      if (data.status === "approved") setTimeout(() => { onJoined(name.trim()); onClose(); }, 1500);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        className="w-full max-w-md bg-[#1a1a2e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white font-serif">Join {community.name}</h2>
            <p className="text-xs text-white/40 mt-0.5">{community.requiresApproval ? "Your request will be reviewed by the admin." : "You'll be added instantly."}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              {isPending ? (
                <>
                  <h3 className="text-lg font-bold text-white mb-1">Request sent!</h3>
                  <p className="text-sm text-white/50">The admin will review your request. You'll be notified on WhatsApp.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-white mb-1">You're in!</h3>
                  <p className="text-sm text-white/50">Welcome to {community.name} 🎉</p>
                </>
              )}
            </motion.div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs text-white/50 font-medium">Your Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chidera Okonkwo"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 font-medium">WhatsApp Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+234 810 000 0000"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11" />
                </div>
                <p className="text-[11px] text-white/25 pl-1">Used for community updates and admin contact only</p>
              </div>
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
              {community.requiresApproval && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Clock className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">This community requires admin approval. The admin will contact you on WhatsApp.</p>
                </div>
              )}
              <Button onClick={handleJoin} disabled={loading || !name.trim() || !whatsapp.trim()}
                className="w-full h-12 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl">
                {loading ? "Submitting…" : community.requiresApproval ? "Send Join Request" : "Join Community"}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CommunityCard({ community, onView, onJoin }: {
  community: Community; onView: () => void; onJoin: () => void;
}) {
  const typeLabel = community.type === "tutorial_center" ? "Tutorial Centre" : community.type === "study_group" ? "Study Group" : "General";
  const typeColor = community.type === "tutorial_center"
    ? "bg-amber-500/15 text-amber-300 border-amber-500/20"
    : community.type === "study_group"
    ? "bg-violet-500/15 text-violet-300 border-violet-500/20"
    : "bg-sky-500/15 text-sky-300 border-sky-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden flex flex-col hover:bg-white/4 transition-colors cursor-pointer"
      onClick={onView}
    >
      <div className="h-16 flex items-center justify-center text-4xl" style={{ backgroundColor: community.coverColor + "25" }}>
        {community.coverEmoji}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="font-bold text-sm text-white font-serif leading-tight">{community.name}</span>
            {community.verified && <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <Badge className={cn("text-[10px] border px-1.5 py-0", typeColor)}>{typeLabel}</Badge>
            {community.requiresApproval ? (
              <Badge className="text-[10px] bg-white/5 text-white/35 border-white/10 border px-1.5 py-0">
                <Lock className="h-2.5 w-2.5 mr-0.5" />Approval
              </Badge>
            ) : (
              <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/15 border px-1.5 py-0">
                <Globe className="h-2.5 w-2.5 mr-0.5" />Open
              </Badge>
            )}
          </div>
          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{community.description}</p>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-white/35 mt-auto">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{community.memberCount}</span>
          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{community.postCount}</span>
        </div>

        <button
          onClick={e => { e.stopPropagation(); onJoin(); }}
          className={cn(
            "w-full py-2 rounded-xl text-xs font-bold transition-all",
            community.requiresApproval
              ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/20"
              : "bg-sky-600/80 hover:bg-sky-500 text-white"
          )}
        >
          {community.requiresApproval ? "Request to Join" : "Join Community"}
        </button>
      </div>
    </motion.div>
  );
}

export default function Community() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewSlug, setViewSlug] = useState<string | null>(null);
  const [joinTarget, setJoinTarget] = useState<Community | null>(null);
  const [myName, setMyName] = useState(() => localStorage.getItem("jupeb_community_name") || "");
  const [filter, setFilter] = useState<"all" | "tutorial_center" | "study_group" | "general">("all");

  useEffect(() => {
    fetch(`${BASE}/api/communities`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCommunities(data); })
      .finally(() => setLoading(false));
  }, []);

  const handleJoined = (name: string) => {
    setMyName(name);
    localStorage.setItem("jupeb_community_name", name);
    setCommunities(prev => prev.map(c => c.slug === joinTarget?.slug ? { ...c, memberCount: c.memberCount + 1 } : c));
  };

  const filtered = communities.filter(c => filter === "all" || c.type === filter);

  return (
    <Shell>
      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        <AnimatePresence mode="wait">
          {viewSlug ? (
            <motion.div key="view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <CommunityView slug={viewSlug} onBack={() => setViewSlug(null)} myName={myName} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-serif text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
                    <Users className="h-5 w-5 text-sky-400" />
                  </div>
                  Community
                </h1>
                <p className="text-white/40 text-sm mt-1">Connect with scholars, join tutorial centres, and study together.</p>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 flex-wrap">
                {([["all", "All"], ["tutorial_center", "Tutorial Centres"], ["study_group", "Study Groups"], ["general", "General"]] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setFilter(val)}
                    className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                      filter === val ? "bg-sky-500/20 border-sky-500/30 text-sky-300" : "bg-white/3 border-white/8 text-white/50 hover:bg-white/6"
                    )}>
                    {label}
                  </button>
                ))}
                {myName && (
                  <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <Avatar name={myName} size="sm" />
                    <span className="text-xs text-white/60">{myName}</span>
                    <button onClick={() => { setMyName(""); localStorage.removeItem("jupeb_community_name"); }}
                      className="text-white/30 hover:text-white/60 ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-white/30">
                  <Users className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No communities found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(c => (
                    <CommunityCard
                      key={c.id}
                      community={c}
                      onView={() => setViewSlug(c.slug)}
                      onJoin={() => setJoinTarget(c)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {joinTarget && (
          <JoinModal
            community={joinTarget}
            onClose={() => setJoinTarget(null)}
            onJoined={handleJoined}
          />
        )}
      </AnimatePresence>
    </Shell>
  );
}
