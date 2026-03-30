import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from "recharts";
import api from "../services/api";

// ─── Career cluster metadata ──────────────────────────────────────────────────
const CLUSTER_META = {
  engineering: {
    icon: "⚙️",
    label: "Engineering & Technology",
    desc: "Build systems, write code, design hardware. Roles: Software Engineer, Mechanical Engineer, Data Scientist.",
    color: "#3b82f6",
  },
  medicine: {
    icon: "🩺",
    label: "Medicine & Health Sciences",
    desc: "Diagnose, heal, research. Roles: Doctor, Pharmacist, Physiotherapist, Nurse.",
    color: "#10b981",
  },
  arts: {
    icon: "🎨",
    label: "Creative Arts & Design",
    desc: "Express, design, narrate. Roles: UX Designer, Filmmaker, Illustrator, Architect.",
    color: "#f59e0b",
  },
  business: {
    icon: "📈",
    label: "Business & Entrepreneurship",
    desc: "Lead, sell, grow. Roles: Product Manager, Founder, Marketing Manager, Consultant.",
    color: "#8b5cf6",
  },
  teaching: {
    icon: "📚",
    label: "Education & Research",
    desc: "Teach, discover, publish. Roles: Professor, Researcher, EdTech Developer.",
    color: "#06b6d4",
  },
  law: {
    icon: "⚖️",
    label: "Law & Public Policy",
    desc: "Argue, govern, protect. Roles: Lawyer, IAS Officer, Policy Analyst.",
    color: "#ef4444",
  },
  trades: {
    icon: "🔧",
    label: "Skilled Trades & Vocational",
    desc: "Craft, operate, maintain. Roles: Electrician, Chef, Automotive Tech.",
    color: "#78716c",
  },
  social: {
    icon: "🌍",
    label: "Social Work & NGO",
    desc: "Impact communities. Roles: NGO Leader, Counselor, Community Organizer.",
    color: "#84cc16",
  },
};

const TRAIT_COLORS = {
  analytical: "#3b82f6",
  creative: "#f59e0b",
  social: "#10b981",
  practical: "#8b5cf6",
  academic: "#06b6d4",
};

const TRAIT_LABELS = {
  analytical: "Analytical",
  creative: "Creative",
  social: "Social",
  practical: "Practical",
  academic: "Academic",
};

// ─── Animated Progress Bar ────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-amber-400">
          Question {current} of {total}
        </span>
        <span className="text-xs text-slate-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Single Question Card ─────────────────────────────────────────────────────
function QuestionCard({ question, onAnswer, questionIndex, direction }) {
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);

  // Reset selection when question changes
  useEffect(() => {
    setSelected(null);
    setAnimating(false);
  }, [question._id]);

  function handleSelect(idx) {
    if (animating) return;
    setSelected(idx);
    setAnimating(true);
    // Small delay so user sees the selection before advancing
    setTimeout(() => {
      onAnswer({ questionId: question._id, selectedIndex: idx });
    }, 420);
  }

  return (
    <div
      key={question._id}
      style={{
        animation: "slideIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      }}
    >
      {/* Question text */}
      <p className="text-xl md:text-2xl font-semibold text-white leading-snug mb-8 tracking-tight">
        {question.text}
      </p>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((opt, idx) => {
          const isSelected = selected === idx;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={animating}
              className={`
                w-full text-left px-5 py-4 rounded-xl border transition-all duration-200
                font-medium text-sm md:text-base
                ${
                  isSelected
                    ? "border-amber-400 bg-amber-400/10 text-amber-300 scale-[1.02]"
                    : "border-slate-600 bg-slate-800/60 text-slate-300 hover:border-slate-400 hover:bg-slate-700/60 hover:text-white"
                }
                ${animating && !isSelected ? "opacity-40" : ""}
                active:scale-[0.98]
              `}
              style={{ transition: "all 0.18s ease" }}
            >
              <span className="inline-flex items-center gap-3">
                <span
                  className={`
                  w-7 h-7 rounded-full border text-xs font-bold flex items-center justify-center shrink-0
                  ${
                    isSelected
                      ? "border-amber-400 bg-amber-400 text-slate-900"
                      : "border-slate-500 text-slate-400"
                  }
                `}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                {typeof opt === "object" ? opt.text : opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Trait Bar Chart ──────────────────────────────────────────────────────────
function TraitChart({ traitScores }) {
  const data = Object.entries(traitScores).map(([trait, score]) => ({
    trait: TRAIT_LABELS[trait] || trait,
    score,
    fill: TRAIT_COLORS[trait] || "#94a3b8",
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
        <XAxis
          dataKey="trait"
          tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
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
            fontSize: 13,
          }}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({ result }) {
  const navigate = useNavigate();
  const { traitScores, dominantTrait, recommendedClusters } = result;

  return (
    <div
      style={{ animation: "fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 mb-4">
          <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">
            Your Profile
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          You're primarily{" "}
          <span className="text-amber-400 capitalize">{dominantTrait}</span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto">
          Here's how your traits scored across all five dimensions.
        </p>
      </div>

      {/* Trait Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 mb-8">
        <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-4">
          Trait Scores
        </h3>
        <TraitChart traitScores={traitScores} />
      </div>

      {/* Recommended Clusters */}
      <div className="mb-8">
        <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-4">
          Recommended Career Clusters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recommendedClusters.map((cluster, i) => {
            const meta = CLUSTER_META[cluster] || {
              icon: "🎯",
              label: cluster,
              desc: "Explore this career cluster.",
              color: "#94a3b8",
            };
            return (
              <div
                key={cluster}
                className="flex gap-4 items-start bg-slate-800/60 border border-slate-700 rounded-xl p-4 hover:border-slate-500 transition-colors"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
                  style={{ background: meta.color + "22" }}
                >
                  {meta.icon}
                </div>
                <div>
                  <p
                    className="font-semibold text-sm mb-1"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">{meta.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate("/stories")}
          className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm transition-colors"
        >
          Explore Stories →
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex-1 py-3 rounded-xl border border-slate-600 hover:border-slate-400 text-slate-300 font-semibold text-sm transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

// ─── Main Quiz Component ──────────────────────────────────────────────────────
export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // [{questionId, selectedIndex}]
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ── Fetch questions on mount ───────────────────────────────────────────────
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await api.get("/quiz/questions");
        setQuestions(res.data.questions || res.data);
      } catch (err) {
        setError("Failed to load quiz questions. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  // ── Handle answer selection ────────────────────────────────────────────────
  async function handleAnswer(answer) {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    const isLast = currentIdx === questions.length - 1;

    if (isLast) {
      // Submit all answers
      setSubmitting(true);
      try {
        const res = await api.post("/quiz/submit", { answers: newAnswers });
        setResult(res.data);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Submission failed. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your quiz…</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-2xl mb-3">⚠️</p>
          <p className="text-red-400 font-semibold mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 rounded-lg bg-amber-400 text-slate-900 font-bold text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Submitting overlay ─────────────────────────────────────────────────────
  if (submitting) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-semibold text-lg mb-1">Analysing your answers…</p>
          <p className="text-slate-400 text-sm">Building your career profile</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <>
      {/* Global keyframe styles */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen bg-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Subtle background texture */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(251,191,36,0.07) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 md:py-16">
          {!result ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <button
                  onClick={() => navigate(-1)}
                  className="text-slate-500 hover:text-slate-300 text-sm mb-6 flex items-center gap-1 transition-colors"
                >
                  ← Back
                </button>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-1">
                  Career Discovery Quiz
                </h1>
                <p className="text-slate-400 text-sm">
                  10 questions · ~3 minutes · No right or wrong answers
                </p>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <ProgressBar current={currentIdx + 1} total={questions.length} />
              </div>

              {/* Question */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 md:p-8">
                {currentQuestion && (
                  <QuestionCard
                    key={currentQuestion._id}
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                    questionIndex={currentIdx}
                  />
                )}
              </div>

              {/* Answered count */}
              {answers.length > 0 && (
                <p className="text-center text-slate-600 text-xs mt-4">
                  {answers.length} of {questions.length} answered
                </p>
              )}
            </>
          ) : (
            <>
              {/* Back button on result */}
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers([]);
                  setCurrentIdx(0);
                }}
                className="text-slate-500 hover:text-slate-300 text-sm mb-6 flex items-center gap-1 transition-colors"
              >
                ← Retake Quiz
              </button>
              <ResultScreen result={result} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
