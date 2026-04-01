import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const TRAIT_COLORS = {
  analytical: "#3b82f6",
  creative:   "#f59e0b",
  social:     "#10b981",
  practical:  "#8b5cf6",
  academic:   "#06b6d4",
};

const SEGMENT_LABELS = {
  "10th":       "After 10th",
  inter_mpc:    "Inter MPC",
  inter_bipc:   "Inter BiPC",
  degree:       "Degree",
  dropout:      "Dropout",
  working:      "Working",
};

// ── Small trait bar (inline, no Recharts needed) ──────────────────────────────
function TraitBar({ trait, score }) {
  const color = TRAIT_COLORS[trait] || "#94a3b8";
  const pct = Math.min((score / 10) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-20 capitalize shrink-0">{trait}</span>
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs tabular-nums text-slate-500 w-5 text-right">{score}</span>
    </div>
  );
}

// ── Story card (compact) ──────────────────────────────────────────────────────
function SavedStoryCard({ story, onUnsave }) {
  const [unsaving, setUnsaving] = useState(false);

  async function handleUnsave(e) {
    e.preventDefault();
    setUnsaving(true);
    try {
      await api.post(`/stories/${story._id}/save`);
      onUnsave(story._id);
    } catch {
      setUnsaving(false);
    }
  }

  return (
    <Link
      to={`/stories/${story._id}`}
      className="group flex gap-4 bg-slate-800/40 border border-slate-700 rounded-xl p-4 hover:border-slate-500 transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-slate-700 text-slate-300 rounded-full px-2 py-0.5 font-medium">
            {SEGMENT_LABELS[story.segment] || story.segment}
          </span>
        </div>
        <p className="text-white text-sm font-semibold leading-snug truncate group-hover:text-amber-300 transition-colors">
          {story.title}
        </p>
        <p className="text-slate-500 text-xs mt-1 truncate">
          by {story.author?.name || "Anonymous"}
        </p>
      </div>
      <button
        onClick={handleUnsave}
        disabled={unsaving}
        className="shrink-0 text-amber-400 hover:text-slate-400 transition-colors text-lg self-start mt-0.5"
        title="Unsave"
      >
        {unsaving ? (
          <div className="w-4 h-4 border border-slate-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          "🔖"
        )}
      </button>
    </Link>
  );
}

// ── Quiz result card ──────────────────────────────────────────────────────────
function QuizCard({ result }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(result.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-900 shrink-0 capitalize"
            style={{ background: TRAIT_COLORS[result.dominantTrait] || "#f59e0b" }}
          >
            {result.dominantTrait?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-semibold capitalize">
              {result.dominantTrait} dominant
            </p>
            <p className="text-slate-500 text-xs">{date}</p>
          </div>
        </div>
        <span className="text-slate-500 text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-slate-700 pt-3">
          {Object.entries(result.traitScores || {}).map(([trait, score]) => (
            <TraitBar key={trait} trait={trait} score={score} />
          ))}
          {result.recommendedClusters?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {result.recommendedClusters.map((c) => (
                <span
                  key={c}
                  className="text-xs bg-slate-700 text-slate-300 rounded-full px-2.5 py-1 capitalize"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
function Tab({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        active
          ? "bg-amber-400/10 text-amber-300 border border-amber-400/30"
          : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
      {count !== undefined && (
        <span
          className={`text-xs rounded-full px-1.5 py-0.5 tabular-nums ${
            active ? "bg-amber-400/20 text-amber-300" : "bg-slate-700 text-slate-400"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("saved"); // "saved" | "quiz"
  const [savedStories, setSavedStories] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(true);

  // Fetch saved stories
  useEffect(() => {
    async function fetchSaved() {
      try {
        const res = await api.get("/stories/saved");
        setSavedStories(res.data.stories || res.data || []);
      } catch {
        setSavedStories([]);
      } finally {
        setLoadingSaved(false);
      }
    }
    fetchSaved();
  }, []);

  // Fetch quiz history
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await api.get("/quiz/history");
        setQuizResults(res.data.results || res.data || []);
      } catch {
        setQuizResults([]);
      } finally {
        setLoadingQuiz(false);
      }
    }
    fetchQuiz();
  }, []);

  function handleUnsave(storyId) {
    setSavedStories((prev) => prev.filter((s) => s._id !== storyId));
  }

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long", year: "numeric",
      })
    : null;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
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
              "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(251,191,36,0.05) 0%, transparent 60%)",
          }}
        />

        <div
          className="relative z-10 max-w-2xl mx-auto px-4 py-10 md:py-14"
          style={{ animation: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards" }}
        >
          {/* Profile header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-xl font-bold text-amber-400 mb-3">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {user?.name || "Your Dashboard"}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                {user?.segment && (
                  <span className="text-xs bg-slate-700 text-slate-300 rounded-full px-2.5 py-1 font-medium">
                    {SEGMENT_LABELS[user.segment] || user.segment}
                  </span>
                )}
                {joinedDate && (
                  <span className="text-xs text-slate-500">Joined {joinedDate}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate("/quiz")}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs transition-colors shrink-0"
            >
              Retake Quiz
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Tab
              active={tab === "saved"}
              onClick={() => setTab("saved")}
              count={savedStories.length}
            >
              🔖 Saved Stories
            </Tab>
            <Tab
              active={tab === "quiz"}
              onClick={() => setTab("quiz")}
              count={quizResults.length}
            >
              📊 Quiz History
            </Tab>
          </div>

          {/* ── Saved Stories tab ── */}
          {tab === "saved" && (
            <div>
              {loadingSaved ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-slate-800/40 border border-slate-700 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : savedStories.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-3xl mb-3">🔖</p>
                  <p className="text-white font-semibold mb-1">No saved stories yet</p>
                  <p className="text-slate-400 text-sm mb-5">
                    Tap the save button on any story to bookmark it here.
                  </p>
                  <button
                    onClick={() => navigate("/stories")}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm transition-colors"
                  >
                    Browse Stories
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedStories.map((story) => (
                    <SavedStoryCard
                      key={story._id}
                      story={story}
                      onUnsave={handleUnsave}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Quiz History tab ── */}
          {tab === "quiz" && (
            <div>
              {loadingQuiz ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-slate-800/40 border border-slate-700 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : quizResults.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-3xl mb-3">📊</p>
                  <p className="text-white font-semibold mb-1">No quiz results yet</p>
                  <p className="text-slate-400 text-sm mb-5">
                    Take the career quiz to see your trait profile here.
                  </p>
                  <button
                    onClick={() => navigate("/quiz")}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm transition-colors"
                  >
                    Take the Quiz
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizResults.map((result) => (
                    <QuizCard key={result._id} result={result} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
