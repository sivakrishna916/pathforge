import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ── Icons (inline SVG — no extra dep) ──────────────────────────────────────
const ForgeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path
      d="M11 2L13.5 7.5H19L14.5 11L16.5 17L11 13.5L5.5 17L7.5 11L3 7.5H8.5L11 2Z"
      fill="#f59e0b"
      stroke="#f59e0b"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AdminIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 1l1.5 3.5L12 5l-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

// ── Nav link styles ─────────────────────────────────────────────────────────
const navLinkClass = ({ isActive }) =>
  [
    "relative text-sm font-medium tracking-wide transition-colors duration-200 py-1",
    "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-amber-400",
    "after:transition-all after:duration-200",
    isActive
      ? "text-amber-400 after:w-full"
      : "text-slate-300 hover:text-white after:w-0 hover:after:w-full",
  ].join(" ");

const mobileNavLinkClass = ({ isActive }) =>
  [
    "block px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150",
    isActive
      ? "bg-amber-400/10 text-amber-400"
      : "text-slate-300 hover:bg-slate-700/60 hover:text-white",
  ].join(" ");

// ── Avatar initials ─────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs font-bold tracking-wider select-none">
      {initials}
    </span>
  );
}

// ── User dropdown (desktop) ─────────────────────────────────────────────────
function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors duration-150 hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar name={user.name} />
        <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate hidden sm:block">
          {user.name}
        </span>
        <span className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <ChevronDown />
        </span>
      </button>

      {/* Dropdown panel */}
      <div
        className={[
          "absolute right-0 mt-2 w-52 rounded-2xl border border-slate-700 bg-slate-800/95 backdrop-blur-md shadow-xl shadow-black/40",
          "transition-all duration-200 origin-top-right",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
        ].join(" ")}
        role="menu"
      >
        {/* User info header */}
        <div className="px-4 py-3 border-b border-slate-700/60">
          <p className="text-xs text-slate-500 mb-0.5">Signed in as</p>
          <p className="text-sm font-semibold text-slate-100 truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>

        <div className="p-1.5">
          {user.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-amber-400 hover:bg-amber-400/10 transition-colors duration-150"
              role="menuitem"
            >
              <AdminIcon />
              Admin Panel
            </Link>
          )}
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors duration-150"
            role="menuitem"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Dashboard
          </Link>
          <Link
            to="/submit"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors duration-150"
            role="menuitem"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Share Your Story
          </Link>
        </div>

        <div className="p-1.5 border-t border-slate-700/60">
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-400/10 transition-colors duration-150"
            role="menuitem"
          >
            <LogoutIcon />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Navbar ─────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Shadow on scroll
  useEffect(() => {
  const handler = () => {
    const currentY = window.scrollY;

    setScrolled(currentY > 8);

    if (currentY > lastY.current && currentY > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    lastY.current = currentY;
  };

  window.addEventListener("scroll", handler, { passive: true });
  return () => window.removeEventListener("scroll", handler);
}, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* ── Top amber indicator strip ─────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent z-50 pointer-events-none" />

      {/* ── Main bar ─────────────────────────────────────────────── */}
      <header
      className={[
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        hidden ? "-translate-y-full" : "translate-y-0",
          scrolled
            ? "border-b border-slate-700/70 shadow-lg shadow-black/20"
            : "border-b border-transparent",
        ].join(" ")}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* ── Brand ───────────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2 group shrink-0"
            aria-label="PathForge home"
          >
            <span className="transition-transform duration-300 group-hover:rotate-12">
              <ForgeIcon />
            </span>
            <span className="text-base font-bold tracking-tight text-white">
              Path<span className="text-amber-400">Forge</span>
            </span>
          </Link>

          {/* ── Desktop nav links (center) ──────────────────────── */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/stories" className={navLinkClass}>
              Stories
            </NavLink>
            <NavLink to="/quiz" className={navLinkClass}>
              Take Quiz
            </NavLink>
            {user && (
              <NavLink to="/submit" className={navLinkClass}>
                Share
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink to="/admin" className={navLinkClass}>
                <span className="flex items-center gap-1">
                  <AdminIcon />
                  Admin
                </span>
              </NavLink>
            )}
          </div>

          {/* ── Desktop auth controls (right) ───────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <UserDropdown user={user} onLogout={handleLogout} />
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150 px-3 py-1.5"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 px-4 py-1.5 rounded-lg transition-colors duration-150 shadow-sm shadow-amber-400/20"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile: avatar + hamburger ───────────────────────── */}
          <div className="flex md:hidden items-center gap-2">
            {user && <Avatar name={user.name} />}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer ────────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className={[
          "fixed top-14 left-0 right-0 z-30 md:hidden",
          "bg-slate-900/95 backdrop-blur-md border-b border-slate-700/70",
          "transition-all duration-300 ease-in-out",
          mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
        ].join(" ")}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">

          {/* Logged-in user info */}
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <Avatar name={user.name} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              {user.role === "admin" && (
                <span className="ml-auto shrink-0 text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
          )}

          {/* Nav links */}
          <NavLink to="/stories" className={mobileNavLinkClass}>
            Stories
          </NavLink>
          <NavLink to="/quiz" className={mobileNavLinkClass}>
            Take Quiz
          </NavLink>

          {user ? (
            <>
              <NavLink to="/submit" className={mobileNavLinkClass}>
                Share Your Story
              </NavLink>
              <NavLink to="/dashboard" className={mobileNavLinkClass}>
                Dashboard
              </NavLink>
              {user.role === "admin" && (
                <NavLink to="/admin" className={mobileNavLinkClass}>
                  <span className="flex items-center gap-2">
                    <AdminIcon />
                    Admin Panel
                  </span>
                </NavLink>
              )}
            </>
          ) : (
            <>
              <NavLink to="/login" className={mobileNavLinkClass}>
                Log in
              </NavLink>
              <NavLink to="/register" className={mobileNavLinkClass}>
                Get started
              </NavLink>
            </>
          )}

          {/* Logout */}
          {user && (
            <div className="pt-2 border-t border-slate-700/50 mt-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-400/10 transition-colors duration-150"
              >
                <LogoutIcon />
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Safe area spacer */}
        <div className="h-3" />
      </div>

      {/* ── Spacer so page content clears the fixed bar ──────────── */}
      <div className="h-14" aria-hidden="true" />
    </>
  );
}
