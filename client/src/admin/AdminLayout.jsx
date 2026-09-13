import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FolderKanban, Inbox, LayoutDashboard, LogOut, Video } from "lucide-react";
import { useAuth } from "./AuthContext";
import { ADMIN_BASE } from "./config";
import { cn } from "../lib/utils";

const NAV = [
  { to: "", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "enquiries", label: "Enquiries", icon: Inbox },
  { to: "demo-bookings", label: "Demo requests", icon: Video },
  { to: "projects", label: "Projects", icon: FolderKanban },
];

export default function AdminLayout() {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate(`${ADMIN_BASE}/login`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-void text-ink md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-line bg-surface/60 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:py-6">
          <div>
            <div className="font-display text-base font-medium tracking-tight text-ink">NeovationLabs</div>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-signal">Admin console</div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="rounded-lg border border-line p-2 text-ink-dim transition-colors hover:text-ink md:hidden"
          >
            <LogOut size={16} />
          </button>
        </div>

        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to ? `${ADMIN_BASE}/${to}` : ADMIN_BASE}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-surface-raised text-ink" : "text-ink-dim hover:text-ink"
                )
              }
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-line px-5 py-4 md:block">
          <div className="truncate text-sm text-ink">{admin?.name}</div>
          <div className="truncate text-xs text-ink-faint">{admin?.email}</div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 inline-flex items-center gap-2 text-xs text-ink-dim transition-colors hover:text-ink"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
