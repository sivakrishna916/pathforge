import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import api from "../services/api";

const SEGMENT_LABELS = {
  "10th":      "After 10th",
  inter_mpc:   "Inter MPC",
  inter_bipc:  "Inter BiPC",
  degree:      "Degree",
  dropout:     "Dropout",
  working:     "Working",
};

const SEGMENT_COLORS = [
  "#f59e0b","#3b82f6","#10b981","#8b5cf6","#ef4444","#06b6d4",
];

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
      <p className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold mb-1" style={{ color: accent || "#f59e0b" }}>
        {value ?? "—"}
      </p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

// ── Story row ─────────────────────────────────────────────────────────────────
function StoryRow({ story, onAction }) {
  const [loading, setLoading] = useState(null); // "approve" | "reject" | null

  async function handle(action) {
    setLoading(action);
    try {
      await api.patch(`/stories/${story._id}/${action}`);
      onAction(story._id, action);
    } catch {
      setLoading(null);
    }
  }

  const date = new Date(story.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start gap-4">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs bg-slate-700 text-slate-300 rounded-full px-2 py-0.5 font-medium">
            {SEGMENT_LABELS[story.segment] || story.segment}
          </span>
          <span className="text-xs text-slate-500">{date}</span>
        </div>
        <p className="text-white text-sm font-semibold leading-snug mb-1 line-clamp-2">
          {story.title}
        </p>
        <p className="text-slate-400 text-xs">
          by {story.author?.name || "Anonymous"}{" "}
          {story.author?.email && (
            <span className="text-slate-600">· {story.author.email}</span>
          )}
        </p>
        {/* Preview of background */}
        {story.background && (
          <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
            {story.background}
          </p>
        )}
        {/* Tags */}
        {story.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-700/60 text-slate-400 rounded-full px-2 py-0.5"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0 sm:flex-col">
        <button
          onClick={() => handle("approve")}
          disabled={!!loading}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors disabled:opacity-50"
        >
          {loading === "approve" ? (
            <div className="w-3.5 h-3.5 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : "✓"} Approve
        </button>
        <button
          onClick={() => handle("reject")}
          disabled={!!loading}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors disabled:opacity-50"
        >
          {loading === "reject" ? (
            <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
          ) : "✕"} Reject
        </button>
      </div>
    </div>
  );
}

// ── Main Admin ────────────────────────────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pending"); // "pending" | "analytics"

  const [pending, setPending]     = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingP, setLoadingP]   = useState(true);
  const [loadingA, setLoadingA]   = useState(true);

  // Fetch pending stories
  useEffect(() => {
    async function fetchPending() {
      try {
        const res = await api.get("/stories/pending");
        setPending(res.data.stories || res.data || []);
      } catch {
        setPending([]);
      } finally {
        setLoadingP(false);
      }
    }
    fetchPending();
  }, []);

  // Fetch analytics
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await api.get("/admin/analytics");
        setAnalytics(res.data);
      } catch {
        setAnalytics(null);
      } finally {
        setLoadingA(false);
      }
    }
    fetchAnalytics();
  }, []);

  function handleAction(storyId, action) {
    // Remove from pending list regardless of approve/reject
    setPending((prev) => prev.filter((s) => s._id !== storyId));
    // Optimistically update analytics count
    if (analytics && action === "approve") {
      setAnalytics((prev) => ({
        ...prev,
        totalApproved: (prev.totalApproved || 0) + 1,
        totalPending:  Math.max((prev.totalPending || 1) - 1, 0),
      }));
    }
    if (analytics && action === "reject") {
      setAnalytics((prev) => ({
        ...prev,
        totalPending: Math.max((prev.totalPending || 1) - 1, 0),
      }));
    }
  }

  // Segment chart data
  const segmentData = analytics?.storiesBySegment
    ? Object.entries(analytics.storiesBySegment).map(([seg, count], i) => ({
        name: SEGMENT_LABELS[seg] || seg,
        count,
        fill: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      }))
    : [];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div
        className="min-h-screen bg-slate-900"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(239,68,68,0.05) 0%, transparent 60%)",
          }}
        />

        <div
          className="relative z-10 max-w-3xl mx-auto px-4 py-10 md:py-14"
          style={{ animation: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1 mb-3">
                <span className="text-red-400 text-xs font-bold tracking-widest uppercase">
                  Admin Panel
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                PathForge Admin
              </h1>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              ← Back to site
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-7">
            {[
              { key: "pending",   label: "⏳ Pending", count: pending.length },
              { key: "analytics", label: "📊 Analytics" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.key
                    ? "bg-amber-400/10 text-amber-300 border border-amber-400/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 tabular-nums ${
                      tab === t.key
                        ? "bg-amber-400/20 text-amber-300"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Pending tab ── */}
          {tab === "pending" && (
            <div>
              {loadingP ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-28 bg-slate-800/40 border border-slate-700 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : pending.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-3xl mb-3">✅</p>
                  <p className="text-white font-semibold mb-1">All caught up!</p>
                  <p className="text-slate-400 text-sm">No pending stories to review.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 mb-4">
                    {pending.length} stor{pending.length === 1 ? "y" : "ies"} awaiting review
                  </p>
                  {pending.map((story) => (
                    <StoryRow
                      key={story._id}
                      story={story}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Analytics tab ── */}
          {tab === "analytics" && (
            <div>
              {loadingA ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-24 bg-slate-800/40 border border-slate-700 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : !analytics ? (
                <div className="text-center py-16">
                  <p className="text-slate-400 text-sm">
                    Analytics endpoint not available.{" "}
                    <span className="text-slate-500">
                      Add GET /api/admin/analytics to your backend.
                    </span>
                  </p>
                </div>
              ) : (
                <>
                  {/* Stat cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                    <StatCard
                      label="Total Users"
                      value={analytics.totalUsers}
                      accent="#f59e0b"
                    />
                    <StatCard
                      label="Approved Stories"
                      value={analytics.totalApproved}
                      accent="#10b981"
                    />
                    <StatCard
                      label="Pending Review"
                      value={analytics.totalPending}
                      accent="#ef4444"
                    />
                    <StatCard
                      label="Quiz Attempts"
                      value={analytics.totalQuizAttempts}
                      accent="#3b82f6"
                    />
                    <StatCard
                      label="Total Upvotes"
                      value={analytics.totalUpvotes}
                      accent="#8b5cf6"
                    />
                    <StatCard
                      label="Total Saves"
                      value={analytics.totalSaves}
                      accent="#06b6d4"
                    />
                  </div>

                  {/* Stories by segment chart */}
                  {segmentData.length > 0 && (
                    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
                      <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-5">
                        Approved Stories by Segment
                      </h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={segmentData}
                          margin={{ top: 4, right: 8, left: -14, bottom: 0 }}
                        >
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fill: "#64748b", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                              color: "#f1f5f9",
                              fontSize: 12,
                            }}
                            cursor={{ fill: "rgba(255,255,255,0.04)" }}
                          />
                          <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                            {segmentData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
