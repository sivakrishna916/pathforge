import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const SEGMENTS = [
  { value: "10th", label: "After 10th" },
  { value: "inter_mpc", label: "Inter MPC" },
  { value: "inter_bipc", label: "Inter BiPC" },
  { value: "degree", label: "Degree" },
  { value: "dropout", label: "Dropout" },
  { value: "working", label: "Working" },
];

const FIELDS = [
  {
    key: "background",
    label: "Your Background",
    hint: "Where were you when you made this decision? Board marks, family situation, what you thought your options were.",
    placeholder: "e.g. I scored 72% in 10th, my father wanted me to take MPC but I had no interest in maths…",
    rows: 4,
  },
  {
    key: "decision",
    label: "The Decision",
    hint: "What did you actually choose? Be specific — college, stream, job, gap year, whatever it was.",
    placeholder: "e.g. I decided to take a drop year and prepare for NID entrance instead of joining a random degree college…",
    rows: 4,
  },
  {
    key: "outcome",
    label: "How It Turned Out",
    hint: "Where are you now because of that decision? Be honest — good and bad.",
    placeholder: "e.g. I cleared NID on my second attempt. The drop year was isolating but worth it…",
    rows: 4,
  },
  {
    key: "regrets",
    label: "Regrets / Advice",
    hint: "What would you tell your past self? What do you wish someone had told you?",
    placeholder: "e.g. I wish I had talked to more working designers before deciding. I had no idea what the job actually looked like…",
    rows: 3,
  },
];

function CharCount({ value, max }) {
  const len = value?.length || 0;
  const near = len > max * 0.85;
  const over = len > max;
  return (
    <span
      className={`text-xs tabular-nums ${
        over ? "text-red-400" : near ? "text-amber-400" : "text-slate-500"
      }`}
    >
      {len}/{max}
    </span>
  );
}

export default function Submit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    segment: "",
    background: "",
    decision: "",
    outcome: "",
    regrets: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function validate() {
    if (!form.title.trim()) return "Give your story a title.";
    if (form.title.length > 100) return "Title must be under 100 characters.";
    if (!form.segment) return "Select the stage you were at.";
    if (!form.background.trim()) return "Fill in your background.";
    if (!form.decision.trim()) return "Describe the decision you made.";
    if (!form.outcome.trim()) return "Share how it turned out.";
    if (!form.regrets.trim()) return "Add at least one piece of advice.";
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) return setError(err);

    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8);

    setSubmitting(true);
    setError("");

    try {
      await api.post("/stories", {
        title: form.title.trim(),
        segment: form.segment,
        background: form.background.trim(),
        decision: form.decision.trim(),
        outcome: form.outcome.trim(),
        regrets: form.regrets.trim(),
        tags: tagsArray,
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div
          className="text-center max-w-sm"
          style={{ animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards" }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-3xl mx-auto mb-5">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Story submitted!</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Your story is under review. Once approved by an admin it'll appear in
            the feed and help someone make a better decision.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/stories")}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm transition-colors"
            >
              Browse Stories
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setForm({
                  title: "",
                  segment: "",
                  background: "",
                  decision: "",
                  outcome: "",
                  regrets: "",
                  tags: "",
                });
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-600 hover:border-slate-400 text-slate-300 font-semibold text-sm transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div
        className="min-h-screen bg-slate-900"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(251,191,36,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 md:py-16">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-300 text-sm mb-6 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>

          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 mb-4">
              <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">
                Share Your Path
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
              Tell your story
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              One honest story from you could change how someone else navigates
              the same crossroads. All submissions are reviewed before going live.
            </p>
          </div>

          <div
            className="space-y-6"
            style={{ animation: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards" }}
          >
            {/* Title */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="text-sm font-semibold text-white">
                  Story Title <span className="text-amber-400">*</span>
                </label>
                <CharCount value={form.title} max={100} />
              </div>
              <p className="text-xs text-slate-500 mb-3">
                A one-line summary. e.g. "Why I dropped engineering to become a chef"
              </p>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                maxLength={120}
                placeholder="My story title…"
                className="w-full bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition-colors"
              />
            </div>

            {/* Segment */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
              <label className="text-sm font-semibold text-white block mb-1.5">
                Your stage when this happened <span className="text-amber-400">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-3">
                What point in life were you at when you made this decision?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SEGMENTS.map((seg) => (
                  <button
                    key={seg.value}
                    onClick={() => handleChange("segment", seg.value)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                      form.segment === seg.value
                        ? "border-amber-400 bg-amber-400/10 text-amber-300"
                        : "border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {seg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Long text fields */}
            {FIELDS.map((field) => (
              <div
                key={field.key}
                className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5"
              >
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="text-sm font-semibold text-white">
                    {field.label} <span className="text-amber-400">*</span>
                  </label>
                  <CharCount value={form[field.key]} max={1000} />
                </div>
                <p className="text-xs text-slate-500 mb-3">{field.hint}</p>
                <textarea
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  rows={field.rows}
                  maxLength={1100}
                  placeholder={field.placeholder}
                  className="w-full bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition-colors resize-none leading-relaxed"
                />
              </div>
            ))}

            {/* Tags */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
              <label className="text-sm font-semibold text-white block mb-1.5">
                Tags{" "}
                <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Comma-separated. e.g. <span className="text-slate-400">neet, drop year, design, tier-3 college</span>
              </p>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="neet, iit, dropout, freelance…"
                className="w-full bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition-colors"
              />
              {form.tags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .slice(0, 8)
                    .map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <span className="text-red-400 text-sm mt-0.5">⚠</span>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Story for Review →"
              )}
            </button>

            <p className="text-center text-xs text-slate-600 pb-4">
              Stories are reviewed by our team before appearing in the feed. No spam, no fake journeys.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
